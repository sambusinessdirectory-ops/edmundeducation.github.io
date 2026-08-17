#!/usr/bin/env python3
"""Build Government Concept Logic Book 1 flashcards from six source PDFs."""

from __future__ import annotations

import json
import re
from pathlib import Path

import pdfplumber


DOWNLOADS = Path("/Users/sammak/Downloads")
OUTPUT = Path(__file__).resolve().parents[1] / "flashcards-government-concept-logic-book1-data.js"
PREFIX = "government/concept-logic-arguments/book-1"

DECKS = [
    (
        f"{PREFIX}/a-core-policy-group-discussion/q1-public-consultations",
        "Flash Card - Book 1 - A - Q1 - How can the Government make public consultations more effective? 政府可以如何令公眾諮詢更有效.pdf",
    ),
    (
        f"{PREFIX}/a-core-policy-group-discussion/q2-short-term-relief-or-long-term-solutions",
        "Flash Card - Book 1 - A - Q2 - Should the Government focus more on short-term relief or long-term solutions? 政府應較著重短期紓困措施，還是長遠解決方案？.pdf",
    ),
    (
        f"{PREFIX}/a-core-policy-group-discussion/q3-public-service-funding",
        "Flash Card - Book 1 - A - Q3 - How should the Government decide which public services should receive more funding? 政府應如何決定哪些公共服務應獲得更多撥款？.pdf",
    ),
    (
        f"{PREFIX}/l-scams-online-safety-technology/q1-banks-suspicious-transfers",
        "Flash Card - Book 1 - L - Q1 - Should banks automatically stop suspicious money transfers? 銀行是否應自動阻止可疑的轉帳？.pdf",
    ),
    (
        f"{PREFIX}/l-scams-online-safety-technology/q2-platform-responsibility-scam-advertisements",
        "Flash Card - Book 1 - L - Q2 - Should online platforms be held more responsible for scam advertisements? 網上平台是否應為詐騙廣告承擔更大責任？.pdf",
    ),
    (
        f"{PREFIX}/l-scams-online-safety-technology/q3-protect-elderly-ai-deepfake-scams",
        "Flash Card - Book 1 - L - Q3 - How can the Government protect elderly people from AI and deepfake scams? 政府可以如何保障長者免受人工智能及深度偽造騙案影響？.pdf",
    ),
]

PRACTICE_PATTERN = re.compile(
    r"(?ms)^([^\n]+？)\n試完成以下因果鏈：\n(.*?)(?=^[^\n]+？\n試完成以下因果鏈：|\Z)"
)
ANSWER_PATTERN = re.compile(
    r"(?ms)^完整概念流程：\n(.*?)(?=^完整概念流程：|\Z)"
)


def split_chain(text: str, example_marker: str) -> list[str]:
    chain_text, separator, example_text = text.partition(example_marker)
    if not separator:
        raise ValueError(f"Missing marker {example_marker!r}")
    rows = [
        line.strip()
        for line in chain_text.splitlines()
        if line.strip() and line.strip() != "↓"
    ]
    example = " ".join(line.strip() for line in example_text.splitlines() if line.strip())
    rows.append(f"{example_marker} {example}")
    return rows


def extract_deck(pdf_path: Path) -> list[dict[str, object]]:
    cards: list[dict[str, object]] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            midpoint = page.width / 2
            practice_text = page.crop((0, 0, midpoint, page.height)).extract_text(
                x_tolerance=1, y_tolerance=3
            ) or ""
            answer_text = page.crop((midpoint, 0, page.width, page.height)).extract_text(
                x_tolerance=1, y_tolerance=3
            ) or ""
            practices = PRACTICE_PATTERN.findall(practice_text)
            answers = ANSWER_PATTERN.findall(answer_text)
            if len(practices) != len(answers):
                raise ValueError(
                    f"{pdf_path.name} page {page_number}: "
                    f"{len(practices)} exercises but {len(answers)} answers"
                )

            for (title, practice_body), answer_body in zip(practices, answers, strict=True):
                practice_rows = split_chain(practice_body.strip(), "例子填空：")
                answer_rows = split_chain(answer_body.strip(), "例子：")
                if len(practice_rows) != len(answer_rows):
                    raise ValueError(
                        f"{pdf_path.name} page {page_number} / {title}: "
                        f"{len(practice_rows)} exercise rows but {len(answer_rows)} answer rows"
                    )
                cards.append(
                    {
                        "front": title.strip(),
                        "meaning": "完整概念流程及例子",
                        "examples": [
                            {"en": practice, "zh": answer}
                            for practice, answer in zip(practice_rows, answer_rows, strict=True)
                        ],
                        "source": pdf_path.name,
                        "sourcePage": page_number,
                    }
                )
    if not cards:
        raise ValueError(f"{pdf_path.name}: no cards found")
    return cards


def main() -> None:
    seed = {}
    for deck_id, filename in DECKS:
        pdf_path = DOWNLOADS / filename
        if not pdf_path.exists():
            raise FileNotFoundError(pdf_path)
        seed[deck_id] = extract_deck(pdf_path)
        print(f"{deck_id}: {len(seed[deck_id])} cards")

    payload = json.dumps(seed, ensure_ascii=False, indent=2)
    output = (
        "/* Generated from the six audited Government Concept Logic Book 1 PDFs. */\n"
        f"window.EDMUND_GOVERNMENT_CONCEPT_LOGIC_BOOK1_SEED = {payload};\n"
        "window.EDMUND_FLASHCARD_SEED = window.EDMUND_FLASHCARD_SEED || {};\n"
        "Object.assign(window.EDMUND_FLASHCARD_SEED, "
        "window.EDMUND_GOVERNMENT_CONCEPT_LOGIC_BOOK1_SEED);\n"
    )
    OUTPUT.write_text(output, encoding="utf-8")
    print(f"Wrote {OUTPUT} with {sum(map(len, seed.values()))} cards across {len(seed)} decks.")


if __name__ == "__main__":
    main()
