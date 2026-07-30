#!/usr/bin/env python3
"""Build the IELTS Reading Passage 2 flashcard seed from exported PDF decks."""

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
    r"^(?:(?:Flash Cards|Passage 2 Flash Cards)\s*-?\s*)?"
    r"(?P<ordinal>\d+)\s*-\s*(?P<title>.*?)\.pdf$",
    re.IGNORECASE,
)
# Require whitespace after the marker so headings such as "1.8 m tall" are
# not mistaken for the first numbered example.
NUMBERED_LINE = re.compile(r"(?m)^\s*(\d{1,2})\.\s+")
DECK_PREFIX = "ielts/reading/passage-2"
SEED_ASSIGNMENT = "window.EDMUND_IELTS_READING_PASSAGE_2_SEED = "
TITLE_ASSIGNMENT = "window.EDMUND_IELTS_READING_PASSAGE_2_TITLES = "
EXPECTED_ORDINALS = [ordinal for ordinal in range(28, 174) if ordinal != 170]

# Keep flashcard-only title corrections local so the separate Reading-download
# catalogue can retain its exact-key invariant.
FLASHCARD_TITLE_SUPPLEMENTS = {
    # These three rows cross columns in the title-index PDF and therefore use
    # explicit middle-column transcription rather than its cleaned shared map.
    "37": "Storytelling, From Prehistoric Craves To Modern Cinemas",
    "47": "The History of Pencil",
    # These two flashcard PDFs exist, but the download inventory omits them.
    "49": "Are Artists Liars?",
    "55": "The Evolutionary Mystery: Crocodile Survives",
    "115": "Sustainable growth at Didcot The outline of a report by South Oxfordshire District Council",
}

# A few PDF table cells cross the centre divider during extraction. These
# narrowly scoped replacements restore the text visible in the rendered PDF.
CELL_REPAIRS = {
    ("71 - Homeopathy.pdf", 1, 1, 0): (
        "to treat simil\n3.",
        "to treat similar symptoms.\n3.",
    ),
    ("71 - Homeopathy.pdf", 1, 1, 1): (
        "\na2r. s順ym勢p療to法ms是.一種",
        "\n2. 順勢療法是一種",
    ),
    ("78 - Therapeutic Jurisprudence - An Overview.pdf", 11, 10, 0): (
        "instead of pris\n3.",
        "instead of prison.\n3.",
    ),
    ("78 - Therapeutic Jurisprudence - An Overview.pdf", 11, 10, 1): (
        "\no2n. .“Consider someone for probation”",
        "\n2. “Consider someone for probation”",
    ),
    ("144 - Twin Study - Two of a kind.pdf", 15, 10, 0): (
        "language, and communicati\n3.",
        "language, and communication problems.\n3.",
    ),
    ("144 - Twin Study - Two of a kind.pdf", 15, 10, 1): (
        "\no2n. pNraotbiolenmals I.nstitute on Deafness and Other Communication Disorders",
        "\n2. National Institute on Deafness and Other Communication Disorders",
    ),
    ("159 - Development of Public management theory.pdf", 15, 10, 0): (
        "long-term develop\n3.",
        "long-term development.\n3.",
    ),
    ("159 - Development of Public management theory.pdf", 15, 10, 1): (
        "\nm2e. n日t.本組織模式",
        "\n2. 日本組織模式",
    ),
}

# The rendered source omits only the final Chinese example in this one card.
# Supply a faithful translation rather than dropping the English example.
CHINESE_EXAMPLE_SUPPLEMENTS = {
    ("143 - We have Star performers!.pdf", 23, 4):
        "這個短語描述市場對感知風險或欠佳決策的反應。",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True, help="Folder containing the Passage 2 card PDFs")
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
    if skipped_header_rows and (path.name != "46 - The Development of Plastics.pdf" or skipped_header_rows != 1):
        raise ValueError(f"{path.name}: unexpected table-header rows ({skipped_header_rows})")
    return cards


def javascript_assignment(name: str, value: object) -> str:
    payload = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return f"{name}{payload};\n"


def main() -> int:
    args = parse_args()
    source = args.source.resolve()
    title_map = json.loads(args.titles.read_text(encoding="utf-8")).get("2", {})
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
        match = FILENAME_PATTERN.fullmatch(path.name)
        if not match:
            raise ValueError(f"Unrecognised Passage 2 filename: {path.name}")
        rows.append((int(match.group("ordinal")), path))

    rows.sort(key=lambda item: item[0])
    ordinals = [ordinal for ordinal, _ in rows]
    duplicates = sorted(ordinal for ordinal, count in Counter(ordinals).items() if count > 1)
    if duplicates:
        raise ValueError(f"Duplicate Passage 2 ordinals: {duplicates}")
    if ordinals != EXPECTED_ORDINALS:
        missing = sorted(set(EXPECTED_ORDINALS) - set(ordinals))
        unexpected = sorted(set(ordinals) - set(EXPECTED_ORDINALS))
        raise ValueError(
            "Passage 2 ordinal inventory is incorrect: "
            f"missing={missing}, unexpected={unexpected}"
        )
    if len(rows) != 145:
        raise ValueError(f"Expected 145 Passage 2 PDFs, found {len(rows)}")

    seed: dict[str, list[dict[str, object]]] = {}
    titles: dict[str, str] = {}
    file_hashes: set[str] = set()

    def build_row(row: tuple[int, Path]) -> tuple[int, Path, str, str, list[dict[str, object]]]:
        ordinal, path = row
        title = normalized_text(title_map.get(str(ordinal), ""))
        if not title:
            raise ValueError(f"No canonical Passage 2 title for Practice {ordinal}")
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        return ordinal, path, title, digest, extract_deck(path)

    with ThreadPoolExecutor(max_workers=args.jobs) as executor:
        built_rows = executor.map(build_row, rows)
        for index, (ordinal, path, title, digest, cards) in enumerate(built_rows, start=1):
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
        "passage": 2,
        "deckCount": len(seed),
        "cardCount": len(all_cards),
        "uniqueFrontCount": len(unique_fronts),
        "ordinals": ordinals,
    }

    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    content = (
        "/* Generated by tools/build-ielts-reading-passage2-flashcards.py. */\n"
        + javascript_assignment(SEED_ASSIGNMENT, seed)
        + javascript_assignment(TITLE_ASSIGNMENT, titles)
        + javascript_assignment("window.EDMUND_IELTS_READING_PASSAGE_2_META = ", meta)
        + "window.EDMUND_FLASHCARD_SEED = window.EDMUND_FLASHCARD_SEED || {};\n"
        + "Object.assign(window.EDMUND_FLASHCARD_SEED, window.EDMUND_IELTS_READING_PASSAGE_2_SEED);\n"
    )
    output.write_text(content, encoding="utf-8")
    print(json.dumps(meta, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
