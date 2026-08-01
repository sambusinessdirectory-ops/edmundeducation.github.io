#!/usr/bin/env python3
"""Build the 142-deck IELTS Listening and DSE flashcard expansion.

The supplied PDFs are landscape Google Sheets exports with one two-column
English/Chinese table per page.  This importer intentionally uses a closed,
validated inventory so a similarly named file cannot silently enter the
release.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from pathlib import Path

import pdfplumber


NUMBERED_LINE = re.compile(r"(?m)^\s*(\d{1,2})\.\s+")
EXPECTED_EXAMPLE_NUMBERS = [1, 2, 3, 4, 5]
EXPECTED_GROUPS = {
    "ielts-listening": {"deckCount": 76, "cardCount": 9460},
    "dse-reading": {"deckCount": 42, "cardCount": 7475},
    "dse-paper3-b2": {"deckCount": 12, "cardCount": 2941},
    "dse-practical-writing": {"deckCount": 12, "cardCount": 630},
}
EXPECTED_TOTAL_DECKS = 142
EXPECTED_TOTAL_CARDS = 20_506
EXPECTED_TOTAL_PAGES = 1_962

OUTPUT_SPECS = {
    "ielts-listening": (
        "flashcards-ielts-listening-practices-2-20-data.js",
        "window.EDMUND_IELTS_LISTENING_PRACTICES_2_20_SEED",
        "window.EDMUND_IELTS_LISTENING_PRACTICES_2_20_META",
    ),
    "dse-reading": (
        "flashcards-dse-reading-2012-2025-data.js",
        "window.EDMUND_DSE_READING_2012_2025_SEED",
        "window.EDMUND_DSE_READING_2012_2025_META",
    ),
    "dse-paper3-b2": (
        "flashcards-dse-paper3-b2-2012-2023-data.js",
        "window.EDMUND_DSE_PAPER3_B2_2012_2023_SEED",
        "window.EDMUND_DSE_PAPER3_B2_2012_2023_META",
    ),
    "dse-practical-writing": (
        "flashcards-dse-practical-writing-data.js",
        "window.EDMUND_DSE_PRACTICAL_WRITING_SEED",
        "window.EDMUND_DSE_PRACTICAL_WRITING_META",
    ),
}

PRACTICAL_DECKS = {
    "Letter Of Request": "letter-of-request",
    "Outline : Summary": "outline",
    "Speech": "speech",
    "Press Release": "press-release",
    "Letter of Invitation (Winner)": "letter-of-invitation-to-winners",
    "Informal letter of request": "letter-of-request-informal",
    "Letter of Invitation (Spokesperson)": "letter-of-invitation-spokesperson",
    "Proposal": "proposal",
    "Report": "report",
    "Letter of Reply": "letter-of-reply",
    "Negative Letter": "negative-emails",
    "Letter of Enquiry": "letter-of-enquiry",
}

CJK_CHARACTER = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff]")
FORBIDDEN_CHARACTER = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\ufffd]")


@dataclass(frozen=True)
class SourceDeck:
    group: str
    deck_id: str
    path: Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True, help="Folder containing all 142 source PDFs")
    parser.add_argument("--output-dir", type=Path, required=True, help="Repository output directory")
    parser.add_argument("--jobs", type=int, default=4, help="Parallel PDF readers")
    return parser.parse_args()


def normalized_text(value: object) -> str:
    text = str(value or "").replace("\u00a0", " ").replace("\u200b", "")
    return re.sub(r"\s+", " ", text).strip()


def parse_cell(value: object, *, source: str) -> tuple[str, list[str]]:
    text = str(value or "").replace("\r\n", "\n").replace("\r", "\n").strip()
    matches = list(NUMBERED_LINE.finditer(text))
    if not matches:
        raise ValueError(f"{source}: no numbered examples")
    numbers = [int(match.group(1)) for match in matches]
    if numbers != EXPECTED_EXAMPLE_NUMBERS:
        raise ValueError(f"{source}: expected examples {EXPECTED_EXAMPLE_NUMBERS}, found {numbers}")
    heading = normalized_text(text[: matches[0].start()])
    examples = [
        normalized_text(text[match.end() : matches[index + 1].start() if index + 1 < len(matches) else None])
        for index, match in enumerate(matches)
    ]
    if not heading or any(not example for example in examples):
        raise ValueError(f"{source}: blank heading or example")
    return heading, examples


def should_skip_row(path: Path, page_number: int, row_number: int, row: list[object]) -> bool:
    key = (path.name, page_number, row_number)
    if key != ("IELTS Listening > Practice 3 > Task 3.pdf", 18, 3):
        return False
    english = normalized_text(row[0] if row else "")
    chinese = normalized_text(row[1] if len(row) > 1 else "")
    if english != "resembles an artwork The programme resembles an artwork." or chinese != "像一件藝術品":
        raise ValueError(f"{path.name} page 18 row 3: duplicate-stub source changed; refusing to skip")
    return True


def apply_verified_cell_overrides(
    path: Path,
    page_number: int,
    row_number: int,
    cells: list[str],
) -> list[str]:
    key = (path.name, page_number, row_number)
    if key == ("Flash Cards - 2014 B2 Data File.pdf", 23, 3):
        english_fragment = "and animal-relate\n3."
        chinese_fragment = "d2 .m Aagtrtiecruslt.ure, Fisheries and Conservation Department是處理農業、漁業、郊野公園和動物相關事務的政府部門。"
        if cells[0].count(english_fragment) != 1 or cells[1].count(chinese_fragment) != 1:
            raise ValueError(f"{path.name} page 23 row 3: verified repair source changed")
        cells[0] = cells[0].replace(english_fragment, "and animal-related matters.\n3.")
        cells[1] = cells[1].replace(
            chinese_fragment,
            "2. Agriculture, Fisheries and Conservation Department 是處理農業、漁業、郊野公園和動物相關事務的政府部門。",
        )
    elif key == ("Flash Cards - DSE Reading - B1 - 2025.pdf", 4, 3):
        english_fragment = "nature conservation, and cou\n3."
        chinese_fragment = "n2t.r Ay gpraicrukslt.ure, Fisheries and Conservation Department 指與農業、漁業、自然保育和郊野公園有關的政府部門。"
        if cells[0].count(english_fragment) != 1 or cells[1].count(chinese_fragment) != 1:
            raise ValueError(f"{path.name} page 4 row 3: verified repair source changed")
        cells[0] = cells[0].replace(english_fragment, "nature conservation, and country parks.\n3.")
        cells[1] = cells[1].replace(
            chinese_fragment,
            "2. Agriculture, Fisheries and Conservation Department 指與農業、漁業、自然保育和郊野公園有關的政府部門。",
        )
    elif key == ("IELTS Listening > Practice 18 > Task 4.pdf", 5, 7):
        expected_fragment = "4.保暖的衣物。\n3. 頸巾、帽、 編織可以幫助家庭以較低成本製作保暖冬衣。"
        if cells[1].count(expected_fragment) != 1:
            raise ValueError(f"{path.name} page 5 row 7: verified repair source changed")
        cells[1] = (
            "保暖冬衣\n"
            "1. 幾個孩子可能需要保暖冬衣。\n"
            "2. 保暖冬衣是在寒冷天氣中令人保暖的衣物。\n"
            "3. 頸巾、帽、手套和毛衣都是保暖冬衣。\n"
            "4. 編織可以幫助家庭以較低成本製作保暖冬衣。\n"
            "5. 這個短語描述寒冷季節的衣物。"
        )
    return cells


def extract_deck(source: SourceDeck) -> tuple[list[dict[str, object]], int, str]:
    cards: list[dict[str, object]] = []
    with pdfplumber.open(source.path) as document:
        page_count = len(document.pages)
        for page_number, page in enumerate(document.pages, start=1):
            if round(page.width) != 792 or round(page.height) != 612:
                raise ValueError(
                    f"{source.path.name} page {page_number}: expected 792x612 landscape page, "
                    f"found {page.width}x{page.height}"
                )
            tables = page.extract_tables()
            if len(tables) != 1:
                raise ValueError(f"{source.path.name} page {page_number}: expected one table, found {len(tables)}")
            table = tables[0]
            for row_number, row in enumerate(table, start=1):
                if not row or not any(normalized_text(cell) for cell in row):
                    continue
                if len(row) != 2 or not all(normalized_text(cell) for cell in row):
                    raise ValueError(
                        f"{source.path.name} page {page_number} row {row_number}: expected two populated columns"
                    )
                if should_skip_row(source.path, page_number, row_number, row):
                    continue
                location = f"{source.path.name} page {page_number} row {row_number}"
                cells = apply_verified_cell_overrides(
                    source.path,
                    page_number,
                    row_number,
                    [str(row[0] or ""), str(row[1] or "")],
                )
                front, english = parse_cell(cells[0], source=f"{location} English")
                meaning, chinese = parse_cell(cells[1], source=f"{location} Chinese")
                if len(english) != 5 or len(chinese) != 5:
                    raise ValueError(f"{location}: expected five aligned examples")
                values = [front, meaning, *english, *chinese]
                if any(FORBIDDEN_CHARACTER.search(value) for value in values):
                    raise ValueError(f"{location}: invalid control or replacement character")
                if any(CJK_CHARACTER.search(value) for value in [front, *english]):
                    raise ValueError(f"{location}: English cell contains CJK text")
                # Proper nouns such as "Masdar City" and "Wivenhoe Street"
                # intentionally remain unchanged as the translated heading.
                if not any(CJK_CHARACTER.search(value) for value in [meaning, *chinese]):
                    raise ValueError(f"{location}: Chinese cell contains no CJK text")
                cards.append(
                    {
                        "front": front,
                        "meaning": meaning,
                        "examples": [
                            {"en": english[index], "zh": chinese[index]}
                            for index in range(5)
                        ],
                        "source": source.path.name,
                        "sourcePage": page_number,
                    }
                )
    if not cards:
        raise ValueError(f"{source.path.name}: no cards extracted")
    serialized_cards = [json.dumps(card, ensure_ascii=False, sort_keys=True) for card in cards]
    duplicate_cards = [item for item, count in Counter(serialized_cards).items() if count > 1]
    if duplicate_cards:
        raise ValueError(f"{source.path.name}: {len(duplicate_cards)} exact duplicate card(s)")
    digest = hashlib.sha256(source.path.read_bytes()).hexdigest()
    return cards, page_count, digest


def discover_inventory(source: Path) -> list[SourceDeck]:
    rows: list[SourceDeck] = []

    listening_pattern = re.compile(r"^IELTS Listening > Practice (\d+) > Task ([1-4])\.pdf$")
    old_reading_pattern = re.compile(r"^Flash Card - DSE Reading - (20\d{2}) - (A|B1)\.pdf$")
    new_reading_pattern = re.compile(r"^Flash Cards - DSE Reading - (A|B1|B2) - (20\d{2})\.pdf$")
    b2_data_pattern = re.compile(r"^Flash Cards - (20\d{2}) B2 Data File\.pdf$")
    practical_pattern = re.compile(r"^Flash Cards -實用文 - (.*?)\s*\.pdf$")

    for path in sorted(source.iterdir(), key=lambda item: item.name):
        if not path.is_file():
            continue
        match = listening_pattern.fullmatch(path.name)
        if match:
            practice, task = map(int, match.groups())
            if 2 <= practice <= 20:
                rows.append(SourceDeck("ielts-listening", f"ielts/listening/Practice {practice}/task-{task}", path))
            continue

        match = old_reading_pattern.fullmatch(path.name)
        if match:
            year, part = match.groups()
            if 2012 <= int(year) <= 2025:
                rows.append(SourceDeck("dse-reading", f"dse/reading/part-{part.lower()}/{year}", path))
            continue

        match = new_reading_pattern.fullmatch(path.name)
        if match:
            part, year = match.groups()
            if 2012 <= int(year) <= 2025:
                rows.append(SourceDeck("dse-reading", f"dse/reading/part-{part.lower()}/{year}", path))
            continue

        match = b2_data_pattern.fullmatch(path.name)
        if match:
            year = match.group(1)
            if 2012 <= int(year) <= 2023:
                rows.append(SourceDeck("dse-paper3-b2", f"dse/paper-3/part-b-data-file-b2/{year}", path))
            continue

        match = practical_pattern.fullmatch(path.name)
        if match:
            title = normalized_text(match.group(1))
            slug = PRACTICAL_DECKS.get(title)
            if slug:
                rows.append(
                    SourceDeck(
                        "dse-practical-writing",
                        f"dse/paper-3/practical-english-writing/practical-formats/{slug}",
                        path,
                    )
                )

    rows.sort(key=lambda row: (row.group, row.deck_id))
    deck_ids = [row.deck_id for row in rows]
    duplicates = sorted(deck_id for deck_id, count in Counter(deck_ids).items() if count > 1)
    if duplicates:
        raise ValueError(f"Duplicate target deck IDs: {duplicates}")
    counts = Counter(row.group for row in rows)
    expected_counts = {group: spec["deckCount"] for group, spec in EXPECTED_GROUPS.items()}
    if dict(counts) != expected_counts:
        raise ValueError(f"Source inventory mismatch: expected {expected_counts}, found {dict(counts)}")
    if len(rows) != EXPECTED_TOTAL_DECKS:
        raise ValueError(f"Expected {EXPECTED_TOTAL_DECKS} PDFs, found {len(rows)}")
    return rows


def javascript_assignment(name: str, value: object) -> str:
    return f"{name} = {json.dumps(value, ensure_ascii=False, separators=(',', ':'))};\n"


def write_bundle(
    output_dir: Path,
    group: str,
    seed: dict[str, list[dict[str, object]]],
    source_hashes: dict[str, str],
    page_count: int,
) -> None:
    filename, seed_global, meta_global = OUTPUT_SPECS[group]
    cards = [card for deck_cards in seed.values() for card in deck_cards]
    fronts = [normalized_text(card["front"]) for card in cards]
    meta = {
        "release": "20260801-1",
        "group": group,
        "deckCount": len(seed),
        "cardCount": len(cards),
        "uniqueFrontCount": len(set(fronts)),
        "repeatedFrontCount": len(fronts) - len(set(fronts)),
        "pageCount": page_count,
        "sourcePdfCount": len(source_hashes),
        "sourceSha256": source_hashes,
    }
    expected = EXPECTED_GROUPS[group]
    if meta["deckCount"] != expected["deckCount"] or meta["cardCount"] != expected["cardCount"]:
        raise ValueError(f"{group}: expected {expected}, found {meta}")
    content = (
        "/* Generated by tools/build-flashcard-expansion-20260801.py. Do not edit by hand. */\n"
        + javascript_assignment(seed_global, seed)
        + javascript_assignment(meta_global, meta)
        + "window.EDMUND_FLASHCARD_SEED = window.EDMUND_FLASHCARD_SEED || {};\n"
        + f"Object.assign(window.EDMUND_FLASHCARD_SEED, {seed_global});\n"
    )
    output = output_dir / filename
    output.write_text(content, encoding="utf-8")
    print(json.dumps({"output": str(output), **{key: value for key, value in meta.items() if key != "sourceSha256"}}, ensure_ascii=False))


def main() -> int:
    args = parse_args()
    source = args.source.expanduser().resolve()
    output_dir = args.output_dir.expanduser().resolve()
    if not source.is_dir():
        raise ValueError(f"Source folder does not exist: {source}")
    if args.jobs < 1:
        raise ValueError("--jobs must be at least 1")
    inventory = discover_inventory(source)

    def build(source_deck: SourceDeck):
        try:
            cards, pages, digest = extract_deck(source_deck)
            return source_deck, cards, pages, digest, None
        except Exception as error:  # aggregate every malformed PDF in one run
            return source_deck, None, 0, "", str(error)

    with ThreadPoolExecutor(max_workers=args.jobs) as executor:
        built = list(executor.map(build, inventory))
    errors = [f"{source_deck.path.name}: {error}" for source_deck, _, _, _, error in built if error]
    if errors:
        raise ValueError(f"{len(errors)} PDF(s) failed extraction:\n" + "\n".join(errors))

    file_hashes: set[str] = set()
    group_seeds: dict[str, dict[str, list[dict[str, object]]]] = {group: {} for group in EXPECTED_GROUPS}
    group_source_hashes: dict[str, dict[str, str]] = {group: {} for group in EXPECTED_GROUPS}
    group_page_counts = Counter()
    for index, (source_deck, cards, pages, digest, _) in enumerate(built, start=1):
        assert cards is not None
        if digest in file_hashes:
            raise ValueError(f"Duplicate PDF content detected: {source_deck.path.name}")
        file_hashes.add(digest)
        group_seeds[source_deck.group][source_deck.deck_id] = cards
        group_source_hashes[source_deck.group][source_deck.path.name] = digest
        group_page_counts[source_deck.group] += pages
        print(f"[{index:03d}/{len(built)}] {source_deck.deck_id}: {len(cards)} cards / {pages} pages")

    total_cards = sum(len(cards) for seed in group_seeds.values() for cards in seed.values())
    total_pages = sum(group_page_counts.values())
    if total_cards != EXPECTED_TOTAL_CARDS or total_pages != EXPECTED_TOTAL_PAGES:
        raise ValueError(
            f"Release totals changed: expected {EXPECTED_TOTAL_CARDS} cards/{EXPECTED_TOTAL_PAGES} pages, "
            f"found {total_cards}/{total_pages}"
        )

    output_dir.mkdir(parents=True, exist_ok=True)
    for group in EXPECTED_GROUPS:
        write_bundle(
            output_dir,
            group,
            group_seeds[group],
            group_source_hashes[group],
            group_page_counts[group],
        )
    print(json.dumps({"deckCount": len(inventory), "cardCount": total_cards, "pageCount": total_pages}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
