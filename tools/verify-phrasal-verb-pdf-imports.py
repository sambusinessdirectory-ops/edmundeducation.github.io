#!/usr/bin/env python3
"""Cross-check generated Phrasal Verb lesson fragments against their source PDFs."""

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
    text = text.translate(str.maketrans({"‘": "'", "’": "'", "“": '"', "”": '"', "–": "-", "—": "-"}))
    # Page layout can introduce spaces inside Chinese words and line-wrap
    # English phrases at arbitrary points. Whitespace has no semantic role in
    # these source-fidelity comparisons, while punctuation and wording do.
    return re.sub(r"\s+", "", text).casefold()


def require(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def contains(haystack: str, needle: object) -> bool:
    target = normalized(needle)
    return bool(target) and target in haystack


def contains_copy(haystack: str, value: object) -> bool:
    """Match copy that may be interleaved with bilingual example lines."""
    if contains(haystack, value):
        return True
    fragments = [part for part in re.split(r"[.!?。！？]+", str(value or "")) if normalized(part)]
    return bool(fragments) and all(contains(haystack, fragment) for fragment in fragments)


def contains_on_declared_or_following_page(
    pages: list[str],
    page_number: object,
    allowed_pages: set[int],
    needle: object,
    explicit_page: object = None,
) -> bool:
    """Allow a translation to flow onto the next page in the same PDF section."""
    if not isinstance(page_number, int) or not 1 <= page_number <= len(pages):
        return False
    if isinstance(explicit_page, int):
        candidate_pages = [explicit_page] if explicit_page in allowed_pages else []
    else:
        candidate_pages = [page_number]
        if page_number + 1 in allowed_pages:
            candidate_pages.append(page_number + 1)
    return any(contains(pages[candidate - 1], needle) for candidate in candidate_pages)


def inspect_lesson(fragment_path: Path, pdf_directory: Path, failures: list[str]) -> tuple[int, int]:
    payload = json.loads(fragment_path.read_text(encoding="utf-8"))
    lesson = payload.get("lesson", payload)
    lesson_id = str(lesson.get("id", fragment_path.stem))
    source = lesson.get("source") or {}
    pdf_path = pdf_directory / str(source.get("file", ""))
    require(pdf_path.is_file(), f"{lesson_id}: source PDF is missing: {pdf_path.name}", failures)
    if not pdf_path.is_file():
        return 0, 0

    with pdfplumber.open(pdf_path) as document:
        raw_pages = [page.extract_text(x_tolerance=2, y_tolerance=3) or "" for page in document.pages]
    pages = [normalized(page) for page in raw_pages]
    whole_pdf = normalized("\n".join(raw_pages))
    page_count = len(pages)
    require(source.get("pageCount") == page_count, f"{lesson_id}: declared pageCount {source.get('pageCount')} != {page_count}", failures)

    questions = lesson.get("questions") or []
    exercise_pages = set(source.get("exercisePdfPages") or [])
    answer_pages = set(source.get("answerKeyPdfPages") or [])
    require(bool(exercise_pages), f"{lesson_id}: exercisePdfPages is missing", failures)
    require(bool(answer_pages), f"{lesson_id}: answerKeyPdfPages is missing", failures)
    for index, question in enumerate(questions, 1):
        question_id = f"{lesson_id}-q{index:02d}"
        require(question.get("id") == question_id, f"{question_id}: non-sequential ID", failures)
        require(question.get("number") == index, f"{question_id}: non-sequential number", failures)
        answer = str(question.get("answer", ""))
        highlight = str(question.get("highlight", ""))
        require(normalized(highlight) in normalized(answer), f"{question_id}: highlight is not in answer", failures)
        for key, page_key in (("prompt", "sourcePage"), ("answer", "answerSourcePage")):
            page_number = question.get(page_key)
            require(isinstance(page_number, int) and 1 <= page_number <= page_count, f"{question_id}: invalid {page_key}", failures)
            if isinstance(page_number, int) and 1 <= page_number <= page_count:
                require(contains(pages[page_number - 1], question.get(key)), f"{question_id}: {key} not found on declared PDF page {page_number}", failures)
        require(
            contains_on_declared_or_following_page(
                pages,
                question.get("sourcePage"),
                exercise_pages,
                question.get("promptZh"),
                question.get("promptZhSourcePage"),
            ),
            f"{question_id}: promptZh not found on its declared or following Exercise PDF page",
            failures,
        )
        require(
            contains_on_declared_or_following_page(
                pages,
                question.get("answerSourcePage"),
                answer_pages,
                question.get("answerZh"),
                question.get("answerZhSourcePage"),
            ),
            f"{question_id}: answerZh not found on its declared or following Answer Key PDF page",
            failures,
        )
        require(question.get("sourcePage") in exercise_pages, f"{question_id}: sourcePage is outside the Exercise page range", failures)
        require(question.get("answerSourcePage") in answer_pages, f"{question_id}: answerSourcePage is outside the Answer Key page range", failures)
        for key in ("starter", "targetForm", "targetMeaningZh"):
            require(contains(whole_pdf, question.get(key)), f"{question_id}: {key} is not traceable to the PDF", failures)
        for variant in question.get("acceptedAnswers") or []:
            require(contains(whole_pdf, variant), f"{question_id}: accepted answer is not explicit in the PDF", failures)

    for group_index, group in enumerate(lesson.get("meaningGroups") or [], 1):
        location = f"{lesson_id}.meaningGroups[{group_index}]"
        require(contains(whole_pdf, group.get("formula")), f"{location}: formula is not in the PDF", failures)
        require(contains(whole_pdf, group.get("titleZh")), f"{location}: Chinese meaning is not in the PDF", failures)
        for example in group.get("examples") or []:
            require(contains(whole_pdf, example.get("en")), f"{location}: English example is not in the PDF", failures)
            require(contains(whole_pdf, example.get("zh")), f"{location}: Chinese example is not in the PDF", failures)

    for section_name in ("benefits", "rules"):
        for item_index, item in enumerate(lesson.get(section_name) or [], 1):
            location = f"{lesson_id}.{section_name}[{item_index}]"
            require(contains_copy(whole_pdf, item.get("en")), f"{location}: English copy is not in the PDF", failures)
            require(contains_copy(whole_pdf, item.get("zh")), f"{location}: Chinese copy is not in the PDF", failures)
            for example_index, example in enumerate(item.get("examples") or [], 1):
                require(contains(whole_pdf, example.get("en")), f"{location}.examples[{example_index}]: English example is not in the PDF", failures)
                if example.get("zh"):
                    require(contains(whole_pdf, example.get("zh")), f"{location}.examples[{example_index}]: Chinese example is not in the PDF", failures)

    expected_match = re.search(r"Number of questions:\s*(\d+)", raw_pages[0], re.IGNORECASE)
    if expected_match:
        require(len(questions) == int(expected_match.group(1)), f"{lesson_id}: PDF declares {expected_match.group(1)} questions, imported {len(questions)}", failures)
    return 1, len(questions)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lesson-dir", type=Path, required=True)
    parser.add_argument("--pdf-dir", type=Path, required=True)
    args = parser.parse_args()
    failures: list[str] = []
    lesson_files = sorted(args.lesson_dir.glob("lesson-*.json"))
    require(len(lesson_files) == 34, f"Expected 34 imported lesson fragments, found {len(lesson_files)}", failures)
    lesson_total = 0
    question_total = 0
    for fragment_path in lesson_files:
        lesson_count, questions = inspect_lesson(fragment_path, args.pdf_dir, failures)
        lesson_total += lesson_count
        question_total += questions

    if failures:
        print(f"Phrasal Verb PDF verification failed with {len(failures)} issue(s):", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1
    print(f"Verified {lesson_total} imported lessons and {question_total} questions against their PDFs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
