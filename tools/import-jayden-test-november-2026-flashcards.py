#!/usr/bin/env python3
"""Import Jayden's November 2026 bilingual flashcard PDF."""

import argparse
import json
import re
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
DECK_ID = "custom-setup/jayden-test-november-2026"
OUTPUT = ROOT / "flashcards-jayden-test-november-2026-data.js"
ASSIGNMENT = "window.EDMUND_JAYDEN_TEST_NOVEMBER_2026_SEED = "


def parse_cell(value, page, row, language):
    compact = re.sub(r"\s+", " ", value or "").strip()
    pieces = re.split(r"(?=\b[1-5]\.\s)", compact)
    title = pieces[0].strip()
    examples = []
    for number, piece in enumerate(pieces[1:], 1):
        match = re.fullmatch(r"([1-5])\.\s*(.+)", piece.strip())
        if not match or int(match.group(1)) != number:
            raise ValueError(f"Page {page}, row {row}: {language} example {number} missing or out of order")
        examples.append(match.group(2).strip())
    if not title or len(examples) != 5:
        raise ValueError(f"Page {page}, row {row}: expected a title and five {language} examples")
    return title, examples


def extract(source):
    cards = []
    with pdfplumber.open(source) as document:
        if len(document.pages) != 10:
            raise ValueError(f"Expected ten source pages; found {len(document.pages)}")
        for page_number, page in enumerate(document.pages, 1):
            tables = page.extract_tables({"vertical_strategy": "lines", "horizontal_strategy": "lines"})
            if len(tables) != 1:
                raise ValueError(f"Page {page_number}: expected exactly one table")
            for row_number, cells in enumerate(tables[0], 1):
                if len(cells) != 2:
                    raise ValueError(f"Page {page_number}, row {row_number}: expected bilingual columns")
                front, english = parse_cell(cells[0], page_number, row_number, "English")
                meaning, chinese = parse_cell(cells[1], page_number, row_number, "Chinese")
                cards.append({
                    "front": front,
                    "meaning": meaning,
                    "examples": [{"en": en, "zh": zh} for en, zh in zip(english, chinese)],
                    "sourcePage": page_number,
                })
    if len(cards) != 184:
        raise ValueError(f"Expected 184 source cards; found {len(cards)}")
    duplicates = sorted(front for front in {card["front"] for card in cards}
                        if sum(item["front"] == front for item in cards) > 1)
    if duplicates != ["cheesy"]:
        raise ValueError(f"Unexpected repeated source fronts: {duplicates}")
    return cards


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    args = parser.parse_args()
    cards = extract(args.source)
    seed = {DECK_ID: cards}
    payload = json.dumps(seed, ensure_ascii=False, indent=2)
    output = (
        "/* Generated from SuperFast Flash Card Export System - Sheet1-4 2.pdf. */\n"
        f"{ASSIGNMENT}{payload};\n"
        "Object.assign(window.EDMUND_FLASHCARD_SEED ||= {}, window.EDMUND_JAYDEN_TEST_NOVEMBER_2026_SEED);\n"
    )
    OUTPUT.write_text(output, encoding="utf-8")
    print(f"Imported {len(cards)} cards and {sum(len(card['examples']) for card in cards)} bilingual examples")


if __name__ == "__main__":
    main()
