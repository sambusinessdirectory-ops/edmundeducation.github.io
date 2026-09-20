#!/usr/bin/env python3
"""Build the Government English Civics Book 3 flashcard seed from source PDFs."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pdfplumber


DECKS = (
    (
        "a-core-policy-group-discussion",
        "Civics Vocab - Book 3 - Core Policy & Group Discussion — 政策及小組討論.pdf",
    ),
    (
        "b-housing-living-conditions",
        "Civics Vocab - Book 3 - Housing & Living Conditions — 房屋及居住環境.pdf",
    ),
    (
        "c-healthcare-mental-health",
        "Book 3 - Healthcare & Mental Health — 醫療及精神健康.pdf",
    ),
    (
        "d-elderly-people-carers",
        "Book 3 - Elderly People & Carers — 長者及照顧者.pdf",
    ),
    (
        "e-families-children-working-parents",
        "Book 3 - Families, Children & Working Parents — 家庭、兒童及在職父母.pdf",
    ),
    (
        "f-jobs-wages-employment",
        "Book 3 - Jobs, Wages & Employment — 就業、工資及勞工.pdf",
    ),
    (
        "g-education-young-people",
        "Book 3 - Education & Young People — 教育及青年.pdf",
    ),
    (
        "h-transport-getting-around",
        "Book 3 - Transport & Getting Around — 交通及市民出行.pdf",
    ),
    (
        "i-welfare-poverty-helping-people-in-need",
        "Book 3 - 社會福利、扶貧及支援有需要人士.pdf",
    ),
    (
        "j-cost-of-living-peoples-financial-burden",
        "Book 3 - 生活成本及市民經濟負擔.pdf",
    ),
    (
        "k-public-safety-emergency-preparedness-building-safety",
        "Book 3 - 公共安全、應急準備及樓宇安全.pdf",
    ),
)

PREFIX = "government/concept-vocabulary/book-3"
NUMBERED_LINE = re.compile(r"(?m)^(?P<number>[1-5])\.\s*")


def parse_cell(cell: str, *, source: str, page: int, side: str) -> tuple[str, list[str]]:
    value = str(cell or "").replace("\u00a0", " ").strip()
    matches = list(NUMBERED_LINE.finditer(value))
    if len(matches) != 5:
        raise ValueError(
            f"{source} page {page} {side}: expected five numbered examples, found {len(matches)}"
        )
    title = value[: matches[0].start()].strip()
    examples = []
    for index, match in enumerate(matches):
        end = matches[index + 1].start() if index + 1 < len(matches) else len(value)
        examples.append(" ".join(value[match.end() : end].split()))
    if not title or any(not example for example in examples):
        raise ValueError(f"{source} page {page} {side}: blank title or example")
    return " ".join(title.split()), examples


def parse_pdf(path: Path) -> list[dict[str, object]]:
    cards: list[dict[str, object]] = []
    with pdfplumber.open(path) as pdf:
        for page_number, page in enumerate(pdf.pages, 1):
            for table in page.extract_tables():
                for row in table:
                    if not row or len(row) < 2 or not row[0] or not row[1]:
                        continue
                    front, english_examples = parse_cell(
                        row[0], source=path.name, page=page_number, side="English"
                    )
                    meaning, chinese_examples = parse_cell(
                        row[1], source=path.name, page=page_number, side="Chinese"
                    )
                    cards.append(
                        {
                            "front": front,
                            "meaning": meaning,
                            "examples": [
                                {"en": english, "zh": chinese}
                                for english, chinese in zip(
                                    english_examples, chinese_examples, strict=True
                                )
                            ],
                            "source": path.name,
                            "sourcePage": page_number,
                        }
                    )
    if not cards:
        raise ValueError(f"{path.name}: no cards extracted")
    fronts = [str(card["front"]).casefold() for card in cards]
    if len(fronts) != len(set(fronts)):
        raise ValueError(f"{path.name}: duplicate English card fronts")
    return cards


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("flashcards-government-civics-book3-data.js"),
    )
    args = parser.parse_args()

    seed: dict[str, list[dict[str, object]]] = {}
    for slug, filename in DECKS:
        source = args.source_dir / filename
        if not source.is_file():
            raise FileNotFoundError(source)
        seed[f"{PREFIX}/{slug}"] = parse_pdf(source)

    payload = json.dumps(seed, ensure_ascii=False, indent=2)
    source = (
        "/* Generated from the audited Civics Book 3 bilingual source PDFs. */\n"
        f"window.EDMUND_GOVERNMENT_CIVICS_BOOK3_SEED = {payload};\n"
        "window.EDMUND_FLASHCARD_SEED = Object.assign(\n"
        "  window.EDMUND_FLASHCARD_SEED || {},\n"
        "  window.EDMUND_GOVERNMENT_CIVICS_BOOK3_SEED\n"
        ");\n"
    )
    args.output.write_text(source, encoding="utf-8")
    print(
        json.dumps(
            {
                "decks": len(seed),
                "cards": sum(map(len, seed.values())),
                "output": str(args.output),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
