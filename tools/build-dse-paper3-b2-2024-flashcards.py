#!/usr/bin/env python3
"""Build the 2024 DSE Paper 3 B2 Data File flashcard seed from its PDF export."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pdfplumber


DECK_ID = "dse/paper-3/part-b-data-file-b2/2024"
EXPECTED_PAGE_COUNT = 28
EXPECTED_CARD_COUNT = 299
EXPECTED_EXAMPLE_COUNT = 5
DEFAULT_OUTPUT = Path(__file__).resolve().parent.parent / "flashcards-dse-paper3-b2-2024-data.js"
NUMBERED_LINE = re.compile(r"^(\d+)\.\s+(.*)$")


def parse_column(page, bounds: tuple[float, float, float, float], page_number: int):
    text = page.crop(bounds).extract_text(x_tolerance=1, y_tolerance=3) or ""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    cards: list[dict[str, object]] = []

    for line in lines:
        match = NUMBERED_LINE.match(line)
        if match:
            if not cards:
                raise ValueError(f"Page {page_number}: example appears before a card heading")
            cards[-1]["examples"].append(
                {"number": int(match.group(1)), "text": match.group(2).strip()}
            )
            continue

        cards.append({"heading": line, "examples": []})

    for card in cards:
        numbers = [example["number"] for example in card["examples"]]
        expected = list(range(1, EXPECTED_EXAMPLE_COUNT + 1))
        if numbers != expected:
            raise ValueError(
                f"Page {page_number}, {card['heading']!r}: "
                f"expected example numbers {expected}, found {numbers}"
            )

    return cards


def parse_pdf(source_pdf: Path):
    cards: list[dict[str, object]] = []

    with pdfplumber.open(source_pdf) as pdf:
        if len(pdf.pages) != EXPECTED_PAGE_COUNT:
            raise ValueError(
                f"Expected {EXPECTED_PAGE_COUNT} pages, found {len(pdf.pages)}"
            )

        for page_number, page in enumerate(pdf.pages, start=1):
            half_width = page.width / 2
            english_cards = parse_column(
                page, (0, 0, half_width, page.height), page_number
            )
            chinese_cards = parse_column(
                page, (half_width, 0, page.width, page.height), page_number
            )

            if len(english_cards) != len(chinese_cards):
                raise ValueError(
                    f"Page {page_number}: English has {len(english_cards)} cards "
                    f"but Chinese has {len(chinese_cards)}"
                )

            for english, chinese in zip(english_cards, chinese_cards, strict=True):
                examples = []
                for english_example, chinese_example in zip(
                    english["examples"], chinese["examples"], strict=True
                ):
                    if english_example["number"] != chinese_example["number"]:
                        raise ValueError(
                            f"Page {page_number}, {english['heading']!r}: "
                            "English and Chinese example numbers do not align"
                        )
                    examples.append(
                        {
                            "en": english_example["text"],
                            "zh": chinese_example["text"],
                        }
                    )

                cards.append(
                    {
                        "front": english["heading"],
                        "meaning": chinese["heading"],
                        "examples": examples,
                        "source": source_pdf.name,
                        "sourcePage": page_number,
                    }
                )

    if len(cards) != EXPECTED_CARD_COUNT:
        raise ValueError(
            f"Expected {EXPECTED_CARD_COUNT} cards, found {len(cards)}"
        )

    normalized_fronts = [card["front"].strip().casefold() for card in cards]
    if len(normalized_fronts) != len(set(normalized_fronts)):
        raise ValueError("Duplicate English card fronts were found")

    return cards


def build_output(cards: list[dict[str, object]], source_name: str):
    payload = json.dumps(cards, ensure_ascii=False, indent=2)
    return (
        f"/* Generated from {source_name} by "
        "tools/build-dse-paper3-b2-2024-flashcards.py. */\n"
        "window.EDMUND_FLASHCARD_SEED = window.EDMUND_FLASHCARD_SEED || {};\n"
        f'window.EDMUND_FLASHCARD_SEED["{DECK_ID}"] = {payload};\n'
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source_pdf", type=Path)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    source_pdf = args.source_pdf.expanduser().resolve()
    if not source_pdf.is_file():
        raise SystemExit(f"Source PDF not found: {source_pdf}")

    cards = parse_pdf(source_pdf)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        build_output(cards, source_pdf.name),
        encoding="utf-8",
    )
    print(
        f"Generated {len(cards)} cards for {DECK_ID} "
        f"from {EXPECTED_PAGE_COUNT} pages."
    )


if __name__ == "__main__":
    main()
