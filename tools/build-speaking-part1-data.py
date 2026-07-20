#!/usr/bin/env python3
"""Build and validate the IELTS Speaking Part 1 browser payload."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from typing import Any


SOURCE_NAME = "ielts-speaking-part1-books1-14-structured.json"
OUTPUT_NAME = "speaking-system-part1-data.js"
EXPECTED_BOOKS = tuple(range(1, 15))
EXPECTED_MODULE_COUNTS = {
    book: (4 if book == 1 else 6 if book == 5 else 5)
    for book in EXPECTED_BOOKS
}
AUDIO_BUILD_VERSION = "v5"
WORD_PATTERN = re.compile(r"[^\W_]+(?:[’'][^\W_]+)*(?:-[^\W_]+)*", re.UNICODE)


def clean_text(value: object, where: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{where} must be a non-empty string")
    if value != value.strip() or re.search(r"\s{2,}", value):
        raise ValueError(f"{where} contains unexpected whitespace")
    return value


def source_sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_payload(source_path: Path) -> dict[str, Any]:
    payload = json.loads(source_path.read_text(encoding="utf-8"))
    expected_header = {
        "schema_version": 1,
        "exam": "IELTS",
        "part": 1,
        "book_count": len(EXPECTED_BOOKS),
        "module_count": sum(EXPECTED_MODULE_COUNTS.values()),
    }
    if not isinstance(payload, dict):
        raise ValueError("Part 1 source must be an object")
    for key, expected in expected_header.items():
        if payload.get(key) != expected:
            raise ValueError(f"Part 1 source {key} must be {expected!r}")

    source_books = payload.get("books")
    if not isinstance(source_books, list) or len(source_books) != len(EXPECTED_BOOKS):
        raise ValueError(f"Part 1 source must contain Books 1-{EXPECTED_BOOKS[-1]}")

    normalized_books: list[dict[str, object]] = []
    seen_ids: set[str] = set()
    total_questions = 0
    english_word_count = 0
    for expected_book, source_book in zip(EXPECTED_BOOKS, source_books):
        book_where = f"Book {expected_book}"
        if not isinstance(source_book, dict) or source_book.get("book") != expected_book:
            raise ValueError(f"{book_where} is invalid or out of order")
        source_modules = source_book.get("modules")
        expected_module_count = EXPECTED_MODULE_COUNTS[expected_book]
        if (
            not isinstance(source_modules, list)
            or len(source_modules) != expected_module_count
            or source_book.get("module_count") != len(source_modules)
        ):
            raise ValueError(f"{book_where} must contain exactly {expected_module_count} modules")
        normalized_modules: list[dict[str, object]] = []
        for expected_index, source_module in enumerate(source_modules, start=1):
            module_where = f"{book_where} module {expected_index}"
            if not isinstance(source_module, dict) or source_module.get("index") != expected_index:
                raise ValueError(f"{module_where} is invalid or out of order")
            module_id = clean_text(source_module.get("id"), f"{module_where} id")
            if not re.fullmatch(rf"ielts-part-1-book-{expected_book}-[a-z0-9]+(?:-[a-z0-9]+)*", module_id):
                raise ValueError(f"{module_where} id is not stable")
            if module_id in seen_ids:
                raise ValueError(f"duplicate Part 1 module id: {module_id}")
            seen_ids.add(module_id)
            title = clean_text(source_module.get("title"), f"{module_where} title")
            title_zh = clean_text(source_module.get("title_zh"), f"{module_where} Chinese title")
            questions = source_module.get("questions")
            if not isinstance(questions, list) or not 3 <= len(questions) <= 20:
                raise ValueError(f"{module_where} must contain 3-20 questions")
            if source_module.get("question_count") != len(questions):
                raise ValueError(f"{module_where} question_count does not match")
            normalized_questions: list[dict[str, object]] = []
            for expected_number, question in enumerate(questions, start=1):
                where = f"{module_where} question {expected_number}"
                if not isinstance(question, dict) or question.get("number") != expected_number:
                    raise ValueError(f"{where} is invalid or out of order")
                question_en = clean_text(question.get("question_en"), f"{where} English")
                question_zh = clean_text(question.get("question_zh"), f"{where} Chinese")
                answer_en = clean_text(question.get("answer_en"), f"{where} answer English")
                answer_zh = clean_text(question.get("answer_zh"), f"{where} answer Chinese")
                english_word_count += len(WORD_PATTERN.findall(question_en))
                english_word_count += len(WORD_PATTERN.findall(answer_en))
                normalized_questions.append({
                    "number": expected_number,
                    "questionEn": question_en,
                    "questionZh": question_zh,
                    "answerEn": answer_en,
                    "answerZh": answer_zh,
                })
            total_questions += len(normalized_questions)
            normalized_modules.append({
                "id": module_id,
                "index": expected_index,
                "title": title,
                "titleZh": title_zh,
                "questionCount": len(normalized_questions),
                "questions": normalized_questions,
            })
        normalized_books.append({
            "part": 1,
            "book": expected_book,
            "displayTitle": f"Book {expected_book} of Part 1",
            "exerciseCount": len(normalized_modules),
            "exercises": normalized_modules,
        })

    return {
        "metadata": {
            "schemaVersion": 1,
            "exam": "IELTS",
            "part": 1,
            "bookCount": len(normalized_books),
            "moduleCount": len(seen_ids),
            "questionCount": total_questions,
            "turnCount": total_questions * 2,
            "englishWordCount": english_word_count,
            "audioBuildVersion": AUDIO_BUILD_VERSION,
            "sourceSha256": source_sha256(source_path),
        },
        "books": normalized_books,
    }


def browser_source(payload: dict[str, Any]) -> str:
    return (
        "/* Generated by tools/build-speaking-part1-data.py; do not edit by hand. */\n"
        "window.EDMUND_SPEAKING_PART1_DATA = Object.freeze("
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}"
        ");\n"
    )


def parse_args() -> argparse.Namespace:
    repository_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=repository_root / "tools" / SOURCE_NAME)
    parser.add_argument("--output", type=Path, default=repository_root / OUTPUT_NAME)
    parser.add_argument("--check", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source_path = args.source.resolve()
    output_path = args.output.resolve()
    payload = load_payload(source_path)
    expected = browser_source(payload)
    if args.check:
        if not output_path.is_file() or output_path.read_text(encoding="utf-8") != expected:
            raise SystemExit("Part 1 browser data is missing or stale")
        print(
            f"Part 1 browser data valid: {payload['metadata']['bookCount']} books, "
            f"{payload['metadata']['moduleCount']} modules, "
            f"{payload['metadata']['questionCount']} questions, "
            f"{payload['metadata']['englishWordCount']} English words."
        )
        return 0
    output_path.write_text(expected, encoding="utf-8")
    print(f"Wrote {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
