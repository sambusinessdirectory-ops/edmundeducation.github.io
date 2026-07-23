#!/usr/bin/env python3
"""Verify imported Sentence Structure JSON against its physical PDF pages."""

from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

import pdfplumber


def normalized(value: object) -> str:
    text = unicodedata.normalize("NFKC", str(value or ""))
    text = text.translate(
        str.maketrans(
            {
                "‘": "'",
                "’": "'",
                "“": '"',
                "”": '"',
                "–": "-",
                "—": "-",
            }
        )
    )
    return re.sub(r"\s+", "", text).casefold()


def page_contains(page_texts: list[str], page_number: int, value: object) -> bool:
    if page_number < 1 or page_number > len(page_texts):
        return False
    target = normalized(value)
    return bool(target) and target in page_texts[page_number - 1]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Compare ssNN.json source text with the corresponding PDF pages."
    )
    parser.add_argument(
        "--pdf-dir",
        type=Path,
        default=Path.home() / "Downloads",
        help="Directory containing the original Sentence Structure PDFs.",
    )
    parser.add_argument(
        "--lesson-dir",
        type=Path,
        default=Path(__file__).resolve().parent / "sentence-structure-lessons",
        help="Directory containing ss05.json through ss39.json.",
    )
    parser.add_argument(
        "--first",
        type=int,
        default=5,
        help="First lesson number to verify.",
    )
    parser.add_argument(
        "--last",
        type=int,
        default=39,
        help="Last lesson number to verify.",
    )
    return parser.parse_args()


def verify_lesson(json_path: Path, pdf_dir: Path) -> list[str]:
    lesson = json.loads(json_path.read_text(encoding="utf-8"))
    lesson_id = str(lesson.get("id", json_path.stem))
    source = lesson.get("source") or {}
    pdf_path = pdf_dir / str(source.get("file", ""))
    errors: list[str] = []

    if not pdf_path.is_file():
        return [f"{lesson_id}: source PDF not found: {pdf_path}"]

    with pdfplumber.open(pdf_path) as pdf:
        page_texts = [
            normalized(page.extract_text(x_tolerance=2, y_tolerance=3, layout=True) or "")
            for page in pdf.pages
        ]

    if len(page_texts) != source.get("pageCount"):
        errors.append(
            f"{lesson_id}: pageCount says {source.get('pageCount')}, PDF has {len(page_texts)}"
        )

    for question in lesson.get("questions", []):
        question_id = str(question.get("id", "missing-question-id"))
        pages = question.get("source") or {}
        checks = [("prompt", "questionPage", question.get("prompt"))]
        if question.get("promptZhSource", "pdf") == "pdf":
            checks.append(
                (
                    "promptZh",
                    (
                        "promptZhPage"
                        if isinstance(pages.get("promptZhPage"), int)
                        else "questionPage"
                    ),
                    question.get("promptZh"),
                )
            )
        answer_parts = question.get("answerParts")
        if isinstance(answer_parts, list) and answer_parts:
            for index, part in enumerate(answer_parts):
                part_pages = part.get("source") or {}
                checks.append(
                    (
                        f"answerParts[{index}].starter",
                        (
                            f"answerPart{index}StarterPage"
                            if isinstance(pages.get(f"answerPart{index}StarterPage"), int)
                            else "starterPage"
                        ),
                        part.get("starter"),
                    )
                )
                checks.append(
                    (
                        f"answerParts[{index}].answer",
                        (
                            f"answerPart{index}AnswerPage"
                            if isinstance(
                                pages.get(f"answerPart{index}AnswerPage"), int
                            )
                            else "answerPage"
                        ),
                        part.get("answer"),
                    )
                )
                if part.get("answerZhSource", "pdf") == "pdf":
                    page_field = (
                        f"answerPart{index}AnswerZhPage"
                        if isinstance(
                            pages.get(f"answerPart{index}AnswerZhPage"), int
                        )
                        else (
                            "answerZhPage"
                            if isinstance(pages.get("answerZhPage"), int)
                            else "answerPage"
                        )
                    )
                    checks.append(
                        (
                            f"answerParts[{index}].answerZh",
                            page_field,
                            part.get("answerZh"),
                        )
                    )
        else:
            checks.append(("starter", "starterPage", question.get("starter")))
            checks.append(("answer", "answerPage", question.get("answer")))
            if question.get("answerZhSource", "pdf") == "pdf":
                checks.append(
                    (
                        "answerZh",
                        (
                            "answerZhPage"
                            if isinstance(pages.get("answerZhPage"), int)
                            else "answerPage"
                        ),
                        question.get("answerZh"),
                    )
                )

        for field, page_field, value in checks:
            page_number = pages.get(page_field)
            if not isinstance(page_number, int):
                errors.append(f"{question_id}: invalid {page_field}")
                continue
            if not page_contains(page_texts, page_number, value):
                errors.append(
                    f"{question_id}: {field} not found on physical PDF page {page_number}"
                )

    return errors


def main() -> int:
    args = parse_args()
    all_errors: list[str] = []
    verified = 0
    for number in range(args.first, args.last + 1):
        json_path = args.lesson_dir / f"ss{number:02d}.json"
        if not json_path.is_file():
            all_errors.append(f"ss{number}: lesson JSON not found: {json_path}")
            continue
        errors = verify_lesson(json_path, args.pdf_dir)
        all_errors.extend(errors)
        if not errors:
            verified += 1

    if all_errors:
        print("\n".join(all_errors), file=sys.stderr)
        print(
            f"PDF import verification failed: {len(all_errors)} mismatch(es).",
            file=sys.stderr,
        )
        return 1

    print(
        f"Verified {verified} lessons against their source PDF pages "
        f"({verified * 50} questions)."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
