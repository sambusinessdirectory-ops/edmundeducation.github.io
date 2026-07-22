#!/usr/bin/env python3
"""Build the IELTS Reading Passage 1 flashcard seed from exported PDF decks."""

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
    r"^Flash Cards\s+(?P<ordinal>\d+)\s*(?:-\s*)?(?P<title>.*?)\.pdf$",
    re.IGNORECASE,
)
NUMBERED_LINE = re.compile(r"(?m)^\s*(\d{1,2})\.\s*")
DECK_PREFIX = "ielts/reading/passage-1"
SEED_ASSIGNMENT = "window.EDMUND_IELTS_READING_PASSAGE_1_SEED = "
TITLE_ASSIGNMENT = "window.EDMUND_IELTS_READING_PASSAGE_1_TITLES = "


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True, help="Folder containing the Passage 1 card PDFs")
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
    with pdfplumber.open(path) as document:
        for page_number, page in enumerate(document.pages, start=1):
            table = page.extract_table()
            if table is None:
                raise ValueError(f"{path.name} page {page_number}: no table found")
            for row_number, row in enumerate(table, start=1):
                if not row or not any(normalized_text(cell) for cell in row):
                    continue
                if len(row) != 2 or not all(normalized_text(cell) for cell in row):
                    raise ValueError(
                        f"{path.name} page {page_number} row {row_number}: expected two populated columns"
                    )
                source = f"{path.name} page {page_number} row {row_number}"
                front, english = parse_cell(
                    row[0],
                    source=f"{source} English",
                    unnumbered_body_is_example=True,
                )
                meaning, chinese = parse_cell(
                    row[1],
                    source=f"{source} Chinese",
                    unnumbered_body_is_example=False,
                )
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
    return cards


def javascript_assignment(name: str, value: object) -> str:
    payload = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return f"{name}{payload};\n"


def main() -> int:
    args = parse_args()
    source = args.source.resolve()
    title_map = json.loads(args.titles.read_text(encoding="utf-8")).get("1", {})
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
            raise ValueError(f"Unrecognised Passage 1 filename: {path.name}")
        rows.append((int(match.group("ordinal")), path))

    rows.sort(key=lambda item: item[0])
    ordinals = [ordinal for ordinal, _ in rows]
    duplicates = sorted(ordinal for ordinal, count in Counter(ordinals).items() if count > 1)
    if duplicates:
        raise ValueError(f"Duplicate Passage 1 ordinals: {duplicates}")
    if len(rows) != 157:
        raise ValueError(f"Expected 157 Passage 1 PDFs, found {len(rows)}")

    seed: dict[str, list[dict[str, object]]] = {}
    titles: dict[str, str] = {}
    file_hashes: set[str] = set()

    def build_row(row: tuple[int, Path]) -> tuple[int, Path, str, str, list[dict[str, object]]]:
        ordinal, path = row
        title = normalized_text(title_map.get(str(ordinal), ""))
        if not title:
            raise ValueError(f"No canonical Passage 1 title for Practice {ordinal}")
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
        "passage": 1,
        "deckCount": len(seed),
        "cardCount": len(all_cards),
        "uniqueFrontCount": len(unique_fronts),
        "ordinals": ordinals,
    }

    output = args.output.resolve()
    output.parent.mkdir(parents=True, exist_ok=True)
    content = (
        "/* Generated by tools/build-ielts-reading-passage1-flashcards.py. */\n"
        + javascript_assignment(SEED_ASSIGNMENT, seed)
        + javascript_assignment(TITLE_ASSIGNMENT, titles)
        + javascript_assignment("window.EDMUND_IELTS_READING_PASSAGE_1_META = ", meta)
        + "window.EDMUND_FLASHCARD_SEED = window.EDMUND_FLASHCARD_SEED || {};\n"
        + "Object.assign(window.EDMUND_FLASHCARD_SEED, window.EDMUND_IELTS_READING_PASSAGE_1_SEED);\n"
    )
    output.write_text(content, encoding="utf-8")
    print(json.dumps(meta, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
