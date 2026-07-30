#!/usr/bin/env python3
"""Build the IELTS Reading Passage 3 flashcard seed from exported PDF decks."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import pdfplumber


FILENAME_PATTERN = re.compile(
    r"^Passage 3 Flash Cards\s*-?\s*"
    r"(?P<ordinal>\d+)\s*-\s*(?P<title>.*?)\.pdf$",
    re.IGNORECASE,
)
MALFORMED_FILENAME_ORDINALS = {
    "SuperFast FlPassage 3 Flash Cards 48 - Improving Patient Safetyash Card Export System - Sheet1-10.pdf": 48,
}
# Require whitespace after the marker so headings such as "1.8 m tall" are
# not mistaken for the first numbered example.
NUMBERED_LINE = re.compile(r"(?m)^\s*(\d{1,2})\.\s+")
DECK_PREFIX = "ielts/reading/passage-3"
SEED_ASSIGNMENT = "window.EDMUND_IELTS_READING_PASSAGE_3_SEED = "
TITLE_ASSIGNMENT = "window.EDMUND_IELTS_READING_PASSAGE_3_TITLES = "
EXPECTED_ORDINALS = [
    ordinal
    for ordinal in range(3, 176)
    if ordinal not in {10, 11, 12, 13, 18, 21, 120, 155}
]

# Keep flashcard-only title corrections local so the separate Reading-download
# catalogue can retain its exact-key invariant.
FLASHCARD_TITLE_SUPPLEMENTS = {
    # These three supplied decks are absent from the separate download
    # catalogue, so retain the exact titles printed in their filenames.
    "24": "The future of the World’s Language",
    "25": "The Game of Tennis",
    "26": "Amateur Naturalists",
    "40": "High-speed photography",
    "60": "CO-EDUCATIONAL VERSUS SINGLE-SEX CLASSROOMS",
    "126": "Is Graffiti Art or Crime?",
    "128": "Human Remains in the Green Sahara",
    # The shared index says "Heat", but both the supplied filename and the
    # passage title say "Heals"; keep the corrected current source title.
    "129": "The Bite That Heals",
    "139": "The Dinosaurs’ Footprints and Extinction",
    "157": "Mystery on Easter Island",
    "158": "Saving Endangered Languages",
    "164": "The Impact of Environment on Children",
    "175": "Science and the Stradivarius: Uncovering the secret of quality",
}

# A few PDF table cells cross the centre divider during extraction. These
# narrowly scoped replacements restore the text visible in the rendered PDF.
CELL_REPAIRS: dict[tuple[str, int, int, int], tuple[str, str]] = {
    (
        "Passage 3 Flash Cards 32 - The Columbian Exchange.pdf",
        1,
        1,
        0,
    ): (
        "between the Old World and the New World after European\n3.",
        "between the Old World and the New World after European contact with the Americas.\n3.",
    ),
    (
        "Passage 3 Flash Cards 32 - The Columbian Exchange.pdf",
        1,
        1,
        1,
    ): (
        "\nc2o. nthtaec tC woiltuhm thbeia An mEexcrihcaans.ge",
        "\n2. 哥倫布大交換",
    ),
    (
        "Passage 3 Flash Cards 33 - Travel Books.pdf",
        9,
        10,
        0,
    ): (
        "including Australia and nearb\n3.",
        "including Australia and nearby islands.\n3.",
    ),
    (
        "Passage 3 Flash Cards 33 - Travel Books.pdf",
        9,
        10,
        1,
    ): (
        "\ny2 i.s Alamndesri.cas and Oceania",
        "\n2. Americas and Oceania",
    ),
    (
        "Passage 3 Flash Cards 43 - The Significant Role of Mother Tongue in Education.pdf",
        22,
        5,
        0,
    ): (
        "identifying supporting de\n3.",
        "identifying supporting details.\n3.",
    ),
    (
        "Passage 3 Flash Cards 43 - The Significant Role of Mother Tongue in Education.pdf",
        22,
        5,
        1,
    ): (
        "\nta2i.l sa.pply reading comprehension strategies",
        "\n2. apply reading comprehension strategies",
    ),
    (
        "Passage 3 Flash Cards 44 - Monkeys and Forests.pdf",
        15,
        3,
        0,
    ): (
        "from seeing them as pests to seeing the\n3.",
        "from seeing them as pests to seeing them as useful.\n3.",
    ),
    (
        "Passage 3 Flash Cards 44 - Monkeys and Forests.pdf",
        15,
        3,
        1,
    ): (
        "\nm2 .a csh uasnegfuinl.g farmers’ attitudes toward wildlife",
        "\n2. changing farmers’ attitudes toward wildlife",
    ),
    (
        "Passage 3 Flash Cards 59 - PREPARING FOR THE THREAT.pdf",
        9,
        7,
        0,
    ): (
        "outside direct gov\n3.",
        "outside direct government control.\n3.",
    ),
    (
        "Passage 3 Flash Cards 59 - PREPARING FOR THE THREAT.pdf",
        9,
        7,
        1,
    ): (
        "\ne2r.n nmoenn-tg coovnetrrnoml.ental organisations",
        "\n2. non-governmental organisations",
    ),
    (
        "Passage 3 Flash Cards 97 - Are You Being Served?.pdf",
        5,
        5,
        0,
    ): (
        "connect people through commu\n3.",
        "connect people through communication networks.\n3.",
    ),
    (
        "Passage 3 Flash Cards 97 - Are You Being Served?.pdf",
        5,
        5,
        1,
    ): (
        "\nn2ic.a ttriaonns npeotrwt, osrtkosr.age, post and telecommunications",
        "\n2. transport, storage, post and telecommunications",
    ),
    (
        "Passage 3 Flash Cards - 173 - The value of research into mite harvestmen.pdf",
        11,
        8,
        0,
    ): (
        "Antarctica, Australia, and I\n3.",
        "Antarctica, Australia, and India.\n3.",
    ),
    (
        "Passage 3 Flash Cards - 173 - The value of research into mite harvestmen.pdf",
        11,
        8,
        1,
    ): (
        "\nn2d.i aG.ondwana",
        "\n2. Gondwana",
    ),
}

# The rendered source omits only the final Chinese example in this one card.
# Supply a faithful translation rather than dropping the English example.
CHINESE_EXAMPLE_SUPPLEMENTS: dict[tuple[str, int, int], str] = {}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True, help="Folder containing the Passage 3 card PDFs")
    parser.add_argument("--titles", type=Path, required=True, help="IELTS Reading passage-title JSON")
    parser.add_argument("--output", type=Path, required=True, help="Generated JavaScript seed")
    parser.add_argument("--jobs", type=int, default=4, help="Number of PDFs to parse in parallel")
    return parser.parse_args()


def normalized_text(value: object) -> str:
    text = str(value or "").replace("\u00a0", " ").replace("\u200b", "")
    return re.sub(r"\s+", " ", text).strip()


def parse_cell(
    value: object,
    *,
    source: str,
    unnumbered_body_is_example: bool,
) -> tuple[str, list[str]]:
    text = str(value or "").replace("\r\n", "\n").replace("\r", "\n").strip()
    matches = list(NUMBERED_LINE.finditer(text))
    if not matches:
        lines = [normalized_text(line) for line in text.split("\n") if normalized_text(line)]
        if not lines:
            raise ValueError(f"{source}: blank cell")
        if unnumbered_body_is_example:
            return lines[0], [normalized_text(" ".join(lines[1:]))] if len(lines) > 1 else []
        return normalized_text(" ".join(lines)), []

    numbers = [int(match.group(1)) for match in matches]
    heading = normalized_text(text[: matches[0].start()])
    numbered_items: dict[int, str] = {}
    for index, match in enumerate(matches):
        number = int(match.group(1))
        numbered_items[number] = normalized_text(
            text[match.end() : matches[index + 1].start() if index + 1 < len(matches) else None]
        )
    expected_numbers = list(range(1, max(numbered_items) + 1))
    if sorted(numbered_items) != expected_numbers:
        raise ValueError(f"{source}: expected consecutive numbered items, found {numbers}")
    if len(numbered_items) != len(matches):
        print(f"WARNING {source}: duplicate numbered items {numbers}; keeping the last occurrence")
    items = [numbered_items[number] for number in expected_numbers]
    if not heading or any(not item for item in items):
        raise ValueError(f"{source}: blank card heading or example")
    return heading, items


def extract_deck(path: Path) -> list[dict[str, object]]:
    cards: list[dict[str, object]] = []
    skipped_header_rows = 0
    with pdfplumber.open(path) as document:
        for page_number, page in enumerate(document.pages, start=1):
            table = page.extract_table()
            if table is None:
                raise ValueError(f"{path.name} page {page_number}: no table found")
            for row_number, row in enumerate(table, start=1):
                if not row or not any(normalized_text(cell) for cell in row):
                    continue
                populated = [normalized_text(cell) for cell in row]
                if populated == ["", "中文"]:
                    skipped_header_rows += 1
                    continue
                if len(row) != 2 or not all(populated):
                    raise ValueError(
                        f"{path.name} page {page_number} row {row_number}: expected two populated columns"
                    )
                source = f"{path.name} page {page_number} row {row_number}"
                cells = [str(cell or "") for cell in row]
                for cell_index in range(2):
                    repair = CELL_REPAIRS.get((path.name, page_number, row_number, cell_index))
                    if repair:
                        before, after = repair
                        if cells[cell_index].count(before) != 1:
                            raise ValueError(f"{source}: expected repair text is absent or duplicated")
                        cells[cell_index] = cells[cell_index].replace(before, after)
                front, english = parse_cell(
                    cells[0],
                    source=f"{source} English",
                    unnumbered_body_is_example=True,
                )
                meaning, chinese = parse_cell(
                    cells[1],
                    source=f"{source} Chinese",
                    unnumbered_body_is_example=False,
                )
                supplement = CHINESE_EXAMPLE_SUPPLEMENTS.get((path.name, page_number, row_number))
                if supplement:
                    if len(english) != len(chinese) + 1:
                        raise ValueError(f"{source}: unexpected example counts before supplement")
                    chinese.append(supplement)
                if chinese and len(english) != len(chinese):
                    raise ValueError(
                        f"{source}: English/Chinese example counts differ ({len(english)} != {len(chinese)})"
                    )
                cards.append(
                    {
                        "front": front,
                        "meaning": meaning,
                        "examples": [
                            {"en": english[index], "zh": chinese[index] if chinese else ""}
                            for index in range(len(english))
                        ],
                        "source": path.name,
                        "sourcePage": page_number,
                    }
                )
    if not cards:
        raise ValueError(f"{path.name}: no cards extracted")
    if skipped_header_rows:
        print(f"INFO {path.name}: skipped {skipped_header_rows} repeated table-header row(s)")
    return cards


def javascript_assignment(name: str, value: object) -> str:
    payload = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return f"{name}{payload};\n"


def main() -> int:
    args = parse_args()
    source = args.source.resolve()
    title_map = json.loads(args.titles.read_text(encoding="utf-8")).get("3", {})
    title_map = {**title_map, **FLASHCARD_TITLE_SUPPLEMENTS}
    if not source.is_dir():
        raise ValueError(f"Source folder does not exist: {source}")
    if args.jobs < 1:
        raise ValueError("--jobs must be at least 1")

    rows: list[tuple[int, Path]] = []
    for path in source.iterdir():
        if path.name.startswith("."):
            continue
        if not path.is_file() or path.suffix.casefold() != ".pdf":
            raise ValueError(f"Unexpected non-PDF source item: {path.name}")
        if path.name.casefold().startswith("passage 2 flash cards"):
            continue
        match = FILENAME_PATTERN.fullmatch(path.name)
        ordinal = int(match.group("ordinal")) if match else MALFORMED_FILENAME_ORDINALS.get(path.name)
        if ordinal is None:
            raise ValueError(f"Unrecognised Passage 3 filename: {path.name}")
        rows.append((ordinal, path))

    rows.sort(key=lambda item: item[0])
    ordinals = [ordinal for ordinal, _ in rows]
    duplicates = sorted(ordinal for ordinal, count in Counter(ordinals).items() if count > 1)
    if duplicates:
        raise ValueError(f"Duplicate Passage 3 ordinals: {duplicates}")
    if ordinals != EXPECTED_ORDINALS:
        missing = sorted(set(EXPECTED_ORDINALS) - set(ordinals))
        unexpected = sorted(set(ordinals) - set(EXPECTED_ORDINALS))
        raise ValueError(
            "Passage 3 ordinal inventory is incorrect: "
            f"missing={missing}, unexpected={unexpected}"
        )
    if len(rows) != 165:
        raise ValueError(f"Expected 165 Passage 3 PDFs, found {len(rows)}")

    seed: dict[str, list[dict[str, object]]] = {}
    titles: dict[str, str] = {}
    file_hashes: set[str] = set()

    def build_row(
        row: tuple[int, Path],
    ) -> tuple[int, Path, str, str, list[dict[str, object]] | None, str | None]:
        ordinal, path = row
        title = normalized_text(title_map.get(str(ordinal), ""))
        if not title:
            return ordinal, path, "", "", None, f"No canonical Passage 3 title for Practice {ordinal}"
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        try:
            cards = extract_deck(path)
        except Exception as error:
            return ordinal, path, title, digest, None, str(error)
        return ordinal, path, title, digest, cards, None

    with ThreadPoolExecutor(max_workers=args.jobs) as executor:
        built_rows = list(executor.map(build_row, rows))
        errors = [f"{path.name}: {error}" for _, path, _, _, _, error in built_rows if error]
        if errors:
            raise ValueError(
                f"{len(errors)} Passage 3 PDF(s) failed extraction:\n" + "\n".join(errors)
            )
        for index, (ordinal, path, title, digest, cards, _) in enumerate(built_rows, start=1):
            assert cards is not None
            if digest in file_hashes:
                raise ValueError(f"Duplicate PDF content detected: {path.name}")
            file_hashes.add(digest)
            practice = f"Practice {ordinal}"
            seed[f"{DECK_PREFIX}/{practice}"] = cards
            titles[practice] = title
            print(f"[{index:03d}/{len(rows)}] {practice}: {title} ({len(seed[f'{DECK_PREFIX}/{practice}'])} cards)")

    all_cards = [card for deck in seed.values() for card in deck]
    unique_fronts = {normalized_text(card["front"]) for card in all_cards}
    meta = {
        "passage": 3,
        "deckCount": len(seed),
        "cardCount": len(all_cards),
        "uniqueFrontCount": len(unique_fronts),
        "ordinals": ordinals,
    }

    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    content = (
        "/* Generated by tools/build-ielts-reading-passage3-flashcards.py. */\n"
        + javascript_assignment(SEED_ASSIGNMENT, seed)
        + javascript_assignment(TITLE_ASSIGNMENT, titles)
        + javascript_assignment("window.EDMUND_IELTS_READING_PASSAGE_3_META = ", meta)
        + "window.EDMUND_FLASHCARD_SEED = window.EDMUND_FLASHCARD_SEED || {};\n"
        + "Object.assign(window.EDMUND_FLASHCARD_SEED, window.EDMUND_IELTS_READING_PASSAGE_3_SEED);\n"
    )
    output.write_text(content, encoding="utf-8")
    print(json.dumps(meta, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
