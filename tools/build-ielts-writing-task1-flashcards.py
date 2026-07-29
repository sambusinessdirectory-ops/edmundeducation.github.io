#!/usr/bin/env python3
"""Build the IELTS Writing Task 1 flashcard decks from the supplied PDF exports."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pdfplumber


EXPECTED_EXAMPLE_COUNT = 5
DEFAULT_OUTPUT = Path(__file__).resolve().parent.parent / "flashcards-ielts-writing-task1-data.js"
NUMBERED_LINE = re.compile(r"^(\d+)\.\s+(.*)$")

DECK_FAMILIES = (
    {
        "slug": "bar-charts",
        "label": "Bar Chart",
        "count": 8,
        "pages": (5, 5, 5, 5, 5, 5, 6, 5),
    },
    {
        "slug": "line-graphs",
        "label": "Line Graph",
        "count": 9,
        "pages": (6, 6, 6, 6, 5, 6, 5, 7, 7),
    },
    {
        "slug": "pie-charts",
        "label": "Pie Chart",
        "count": 6,
        "pages": (5, 6, 5, 5, 5, 6),
    },
    {
        "slug": "process-diagrams",
        "label": "Process Diagram",
        "count": 9,
        "pages": (5, 6, 6, 6, 6, 6, 6, 7, 6),
    },
)

# Filled from a verified parse of the source PDFs. Keeping these counts pinned
# makes a later PDF/export change fail loudly instead of silently changing a deck.
EXPECTED_CARD_COUNTS = {
    "ielts/writing/task-1/bar-charts/bar-chart-1": 45,
    "ielts/writing/task-1/bar-charts/bar-chart-2": 47,
    "ielts/writing/task-1/bar-charts/bar-chart-3": 45,
    "ielts/writing/task-1/bar-charts/bar-chart-4": 43,
    "ielts/writing/task-1/bar-charts/bar-chart-5": 46,
    "ielts/writing/task-1/bar-charts/bar-chart-6": 47,
    "ielts/writing/task-1/bar-charts/bar-chart-7": 51,
    "ielts/writing/task-1/bar-charts/bar-chart-8": 45,
    "ielts/writing/task-1/line-graphs/line-graph-1": 52,
    "ielts/writing/task-1/line-graphs/line-graph-2": 56,
    "ielts/writing/task-1/line-graphs/line-graph-3": 54,
    "ielts/writing/task-1/line-graphs/line-graph-4": 52,
    "ielts/writing/task-1/line-graphs/line-graph-5": 50,
    "ielts/writing/task-1/line-graphs/line-graph-6": 58,
    "ielts/writing/task-1/line-graphs/line-graph-7": 54,
    "ielts/writing/task-1/line-graphs/line-graph-8": 66,
    "ielts/writing/task-1/line-graphs/line-graph-9": 62,
    "ielts/writing/task-1/pie-charts/pie-chart-1": 49,
    "ielts/writing/task-1/pie-charts/pie-chart-2": 54,
    "ielts/writing/task-1/pie-charts/pie-chart-3": 47,
    "ielts/writing/task-1/pie-charts/pie-chart-4": 49,
    "ielts/writing/task-1/pie-charts/pie-chart-5": 52,
    "ielts/writing/task-1/pie-charts/pie-chart-6": 55,
    "ielts/writing/task-1/process-diagrams/process-diagram-1": 54,
    "ielts/writing/task-1/process-diagrams/process-diagram-2": 59,
    "ielts/writing/task-1/process-diagrams/process-diagram-3": 52,
    "ielts/writing/task-1/process-diagrams/process-diagram-4": 60,
    "ielts/writing/task-1/process-diagrams/process-diagram-5": 53,
    "ielts/writing/task-1/process-diagrams/process-diagram-6": 61,
    "ielts/writing/task-1/process-diagrams/process-diagram-7": 52,
    "ielts/writing/task-1/process-diagrams/process-diagram-8": 63,
    "ielts/writing/task-1/process-diagrams/process-diagram-9": 63,
}


def parse_column(
    page,
    bounds: tuple[float, float, float, float],
    page_number: int,
    source_name: str,
):
    text = page.crop(bounds).extract_text(x_tolerance=1, y_tolerance=3) or ""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    cards: list[dict[str, object]] = []

    for line in lines:
        match = NUMBERED_LINE.match(line)
        if match:
            if not cards:
                raise ValueError(
                    f"{source_name}, page {page_number}: example appears before a heading"
                )
            cards[-1]["examples"].append(
                {"number": int(match.group(1)), "text": match.group(2).strip()}
            )
            continue
        cards.append({"heading": line, "examples": []})

    expected_numbers = list(range(1, EXPECTED_EXAMPLE_COUNT + 1))
    for card in cards:
        numbers = [example["number"] for example in card["examples"]]
        if numbers != expected_numbers:
            raise ValueError(
                f"{source_name}, page {page_number}, {card['heading']!r}: "
                f"expected examples {expected_numbers}, found {numbers}"
            )

    return cards


def parse_pdf(source_pdf: Path, expected_pages: int):
    cards: list[dict[str, object]] = []

    with pdfplumber.open(source_pdf) as pdf:
        if len(pdf.pages) != expected_pages:
            raise ValueError(
                f"{source_pdf.name}: expected {expected_pages} pages, found {len(pdf.pages)}"
            )

        for page_number, page in enumerate(pdf.pages, start=1):
            half_width = page.width / 2
            english_cards = parse_column(
                page,
                (0, 0, half_width, page.height),
                page_number,
                source_pdf.name,
            )
            chinese_cards = parse_column(
                page,
                (half_width, 0, page.width, page.height),
                page_number,
                source_pdf.name,
            )

            if len(english_cards) != len(chinese_cards):
                raise ValueError(
                    f"{source_pdf.name}, page {page_number}: English has "
                    f"{len(english_cards)} cards but Chinese has {len(chinese_cards)}"
                )

            for english, chinese in zip(english_cards, chinese_cards, strict=True):
                examples = []
                for english_example, chinese_example in zip(
                    english["examples"], chinese["examples"], strict=True
                ):
                    if english_example["number"] != chinese_example["number"]:
                        raise ValueError(
                            f"{source_pdf.name}, page {page_number}, "
                            f"{english['heading']!r}: example numbers do not align"
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

    return cards


def build_decks(source_directory: Path):
    decks: dict[str, list[dict[str, object]]] = {}
    titles: dict[str, str] = {}

    for family in DECK_FAMILIES:
        if family["count"] != len(family["pages"]):
            raise ValueError(f"{family['label']}: count/page metadata does not align")
        for index, expected_pages in enumerate(family["pages"], start=1):
            title = f"{family['label']} {index}"
            source_pdf = source_directory / f"Flash Card - IELTS Writing Task 1 - {title}.pdf"
            if not source_pdf.is_file():
                raise FileNotFoundError(f"Source PDF not found: {source_pdf}")
            deck_id = (
                f"ielts/writing/task-1/{family['slug']}/"
                f"{family['label'].lower().replace(' ', '-')}-{index}"
            )
            cards = parse_pdf(source_pdf, expected_pages)
            expected_count = EXPECTED_CARD_COUNTS.get(deck_id)
            if expected_count is not None and len(cards) != expected_count:
                raise ValueError(
                    f"{source_pdf.name}: expected {expected_count} cards, found {len(cards)}"
                )
            decks[deck_id] = cards
            titles[deck_id] = title

    if len(decks) != 32:
        raise ValueError(f"Expected 32 decks, found {len(decks)}")
    return decks, titles


def build_output(
    decks: dict[str, list[dict[str, object]]],
    titles: dict[str, str],
):
    deck_payload = json.dumps(decks, ensure_ascii=False, indent=2)
    title_payload = json.dumps(titles, ensure_ascii=False, indent=2)
    return (
        "/* Generated from the 32 supplied IELTS Writing Task 1 flashcard PDFs. */\n"
        "window.EDMUND_FLASHCARD_SEED = window.EDMUND_FLASHCARD_SEED || {};\n"
        f"window.EDMUND_IELTS_WRITING_TASK1_SEED = {deck_payload};\n"
        f"window.EDMUND_IELTS_WRITING_TASK1_TITLES = {title_payload};\n"
        "Object.assign(\n"
        "  window.EDMUND_FLASHCARD_SEED,\n"
        "  window.EDMUND_IELTS_WRITING_TASK1_SEED\n"
        ");\n"
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source_directory", type=Path)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()

    source_directory = args.source_directory.expanduser().resolve()
    if not source_directory.is_dir():
        raise SystemExit(f"Source directory not found: {source_directory}")

    decks, titles = build_decks(source_directory)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(build_output(decks, titles), encoding="utf-8")

    total_cards = sum(len(cards) for cards in decks.values())
    print(f"Generated {len(decks)} IELTS Writing Task 1 decks ({total_cards} cards).")
    for deck_id, cards in decks.items():
        print(f"{deck_id}: {len(cards)}")


if __name__ == "__main__":
    main()
