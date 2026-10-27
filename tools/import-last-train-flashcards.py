#!/usr/bin/env python3
"""Import the bilingual Last Train PDF as Jayden's teacher-assigned flashcards."""

import argparse
import json
import re
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
DECK_ID = "custom-setup/the-last-train"
CORE = ROOT / "flashcards-core-data.js"
START = '  "custom-setup/the-last-train": '


def parse_cell(value, page, row, language):
    lines = [line.strip() for line in (value or "").splitlines() if line.strip()]
    if len(lines) != 6:
        raise ValueError(f"Page {page}, row {row}: expected a title and five {language} examples")
    if not lines[0]:
        raise ValueError(f"Page {page}, row {row}: empty {language} title")
    examples = []
    for number, line in enumerate(lines[1:], 1):
        match = re.fullmatch(r"([1-5])\.\s+(.+)", line)
        if not match or int(match.group(1)) != number:
            raise ValueError(f"Page {page}, row {row}: {language} example {number} missing or out of order")
        examples.append(match.group(2).strip())
    return lines[0], examples


def extract(source):
    cards = []
    with pdfplumber.open(source) as document:
        if len(document.pages) != 4:
            raise ValueError(f"Expected four source pages; found {len(document.pages)}")
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
    if len(cards) != 64 or len({card["front"].casefold() for card in cards}) != 64:
        raise ValueError("Expected 64 distinct source cards")
    return cards


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True)
    args = parser.parse_args()
    cards = extract(args.source)
    source = CORE.read_text(encoding="utf-8")
    if START in source:
        raise ValueError("The Last Train deck is already present; refusing to duplicate it")
    marker = '\n  "custom-setup/sprint-text-1": '
    if source.count(marker) != 1:
        raise ValueError("Could not locate the existing Jayden custom deck")
    payload = json.dumps(cards, ensure_ascii=False, indent=2)
    payload = "\n".join(("  " + line) if line else line for line in payload.splitlines())
    source = source.replace(marker, f'\n  "{DECK_ID}": {payload},' + marker, 1)
    CORE.write_text(source, encoding="utf-8")
    print(f"Imported {len(cards)} cards and {sum(len(card['examples']) for card in cards)} bilingual examples")


if __name__ == "__main__":
    main()
