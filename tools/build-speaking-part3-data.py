#!/usr/bin/env python3
"""Build strict browser data for IELTS Speaking Part 3, Books 1-16.

Each committed structured JSON is an audited extraction of one source PDF.
The builder validates every question, both response models, all eight ordered
Idea -> Explanation -> Example -> Conclusion components, and their page/line
provenance before emitting the browser payload.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from pathlib import Path
from typing import Any


SOURCE_PATTERN = "ielts-speaking-part3-book{book}-structured.json"
OUTPUT_NAME = "speaking-system-part3-data.js"
EXPECTED_BOOKS = tuple(range(1, 17))
EXPECTED_MODELS_PER_EXERCISE = 2
EXPECTED_STEPS_PER_MODEL = 4
EXPECTED_STAGES = ("idea", "explanation", "example", "conclusion")
EXPECTED_SOURCE_NUMBERS = tuple(range(1, 9))
EXPECTED_SOURCE_LABELS = {
    1: "Idea",
    2: "Explanation",
    3: "Example",
    4: "Conclusion",
    5: "Idea 2",
    6: "Explanation 2",
    7: "Example 2",
    8: "Conclusion 2",
}
STAGE_LABELS_ZH = {
    "idea": "主旨",
    "explanation": "解釋",
    "example": "例子",
    "conclusion": "總結",
}
ENGLISH_WORD_PATTERN = re.compile(
    r"\b[A-Za-z]+(?:[’'][A-Za-z]+)*(?:-[A-Za-z]+)*\b"
)
SHA256_PATTERN = re.compile(r"[0-9a-f]{64}")
CJK_PATTERN = re.compile(r"[\u3400-\u9fff]")
ZERO_WIDTH_PATTERN = re.compile(r"[\u200b-\u200f\u2060\ufeff]")
AUDIO_BUILD_VERSION = "v2"

# Every source JSON is pinned after PDF extraction and independent review.
# Books 2-16 are populated by the 15-book import before release.
EXPECTED_STRUCTURED_JSON_SHA256_BY_BOOK = {
    1: "9c4d08451d285274e901b47d3ee95d85fe3c07fd163f81f486d81e8528ff383e",
    2: "f18cade1abae3974d8f7604537c04d66f87202a99449d887f26f24ffe0a5364f",
    3: "de445aa68ca2babebe3a59bdb0a0e846486c316ce5d3e3352744fac41d2b5806",
    4: "78124c96ca89fe192e69aada64a8dad7c5e67fe190eb9f4501fea1f2dbb05486",
    5: "ac4a73b303ea1350436a0dcbc0a48a3f7adef80b67e6703f3e48db2b6b5ce0b9",
    6: "24e69be1fc84f56968d379d4d1a1846c3bb2f62f81add779065964520a02a667",
    7: "2fa160d5ef814e467e15ea6a8581dc024c197df3bf7b080484a15e14ed5ba8b2",
    8: "0d9c29b0e01280fdc9a7d7300b6790d8a0c4f4ddd15aa63282c85407b5aa0aa2",
    9: "e2b8a6beb6b366deb32b9730cb3b0b3c9bab7182ecdc2a981289ca98890686aa",
    10: "5a7f9b21d259ab24acc2b1b16c590296c73e786e85c508316a71501340cd799b",
    11: "7fa3b705ce04a4bb9d48cf8e1701fe806beebf55ac3409927a8f631ee111828b",
    12: "7cf5688e29f88f97e8fc62df2fb7a299cb6862cf22dfa3b58948983f3343c254",
    13: "25c6e37cbe72c25e012957f9ea61fe1b978dd46afdc39b91ee5cfc26d917ba3a",
    14: "c3f1be8b96f40d3cc61718195b4a860cbec2661adc440854ad2a628286012314",
    15: "bed47ab9cae81f5a3856790671d1a6706b34b1cdfe55b238ade9d5d2eb896b90",
    16: "83b7fc06aeff5af63e47dccd8290f46e1ff06c4126e713dd69bca248d8312ca2",
}

# Book 1 visibly contains one duplicated/mismatched wrapper around Exercise 4,
# Sample 1's Example translation: "([…] (". Preserve the source value while
# removing only those wrappers in the browser display.
KNOWN_CHINESE_DISPLAY_REPAIRS = {(1, 4, 1, 3)}


def require_mapping(value: Any, where: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError(f"{where} must be an object")
    return value


def require_list(value: Any, where: str) -> list[Any]:
    if not isinstance(value, list):
        raise ValueError(f"{where} must be an array")
    return value


def require_string(container: dict[str, Any], key: str, where: str) -> str:
    value = container.get(key)
    if not isinstance(value, str) or not value.strip() or value != value.strip():
        raise ValueError(f"{where} has an empty, invalid, or padded {key!r}")
    if ZERO_WIDTH_PATTERN.search(value):
        raise ValueError(f"{where} contains a zero-width character in {key!r}")
    return value


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def stable_exercise_id(book: int, index: int) -> str:
    return f"ielts-part-3-book-{book}-exercise-{index:02d}"


def validate_page_range(
    value: Any,
    where: str,
    *,
    page_count: int,
) -> tuple[int, int]:
    page_range = require_mapping(value, f"{where} page_range")
    start = page_range.get("start")
    end = page_range.get("end")
    if (
        not isinstance(start, int)
        or isinstance(start, bool)
        or not isinstance(end, int)
        or isinstance(end, bool)
        or start < 1
        or start > end
        or end > page_count
    ):
        raise ValueError(f"{where} has an invalid page_range")
    return start, end


def validate_pages(value: Any, page_range: tuple[int, int], where: str) -> list[int]:
    pages = require_list(value, f"{where} pages")
    if (
        not pages
        or any(not isinstance(page, int) or isinstance(page, bool) for page in pages)
        or pages != sorted(set(pages))
        or pages[0] != page_range[0]
        or pages[-1] != page_range[1]
    ):
        raise ValueError(f"{where} has invalid or inconsistent pages")
    return pages


def validate_source_lines(
    value: Any,
    expected_pages: list[int],
    where: str,
    seen_provenance: set[tuple[int, int]],
    *,
    page_count: int,
) -> set[int]:
    lines = require_list(value, f"{where} source_lines")
    if not lines:
        raise ValueError(f"{where} has no source provenance")
    pages: set[int] = set()
    for row_number, row_value in enumerate(lines, start=1):
        row = require_mapping(row_value, f"{where} source line {row_number}")
        page = row.get("page")
        line_number = row.get("source_line_number")
        if (
            not isinstance(page, int)
            or isinstance(page, bool)
            or page < 1
            or page > page_count
            or not isinstance(line_number, int)
            or isinstance(line_number, bool)
            or line_number < 1
        ):
            raise ValueError(f"{where} source line {row_number} has invalid provenance")
        require_string(row, "text", f"{where} source line {row_number}")
        key = (page, line_number)
        if key in seen_provenance:
            raise ValueError(f"duplicate source provenance row {key} in {where}")
        seen_provenance.add(key)
        pages.add(page)
    if pages != set(expected_pages):
        raise ValueError(f"{where} provenance pages do not match its declared pages")
    return pages


def validate_source(payload: Any, *, expected_book: int | None = None) -> dict[str, Any]:
    source = require_mapping(payload, "Part 3 source")
    book = source.get("book")
    if not isinstance(book, int) or isinstance(book, bool) or book not in EXPECTED_BOOKS:
        raise ValueError("Part 3 source has an invalid book number")
    if expected_book is not None and book != expected_book:
        raise ValueError(f"Expected Book {expected_book}, found Book {book}")
    exercise_count = source.get("exercise_count")
    if not isinstance(exercise_count, int) or isinstance(exercise_count, bool) or exercise_count < 1:
        raise ValueError(f"Book {book} has an invalid exercise_count")
    expected_header = {
        "schema_version": "1.0.0",
        "part": 3,
        "response_model_count": exercise_count * EXPECTED_MODELS_PER_EXERCISE,
        "component_count": (
            exercise_count
            * EXPECTED_MODELS_PER_EXERCISE
            * EXPECTED_STEPS_PER_MODEL
        ),
    }
    for key, expected in expected_header.items():
        if source.get(key) != expected:
            raise ValueError(f"Book {book} source {key} must be {expected!r}")
    if source.get("language_pair") != ["en", "zh-Hant"]:
        raise ValueError(f"Book {book} has an unexpected language_pair")

    source_meta = require_mapping(source.get("source"), f"Book {book} source metadata")
    expected_file = f"Book {book} - Band 9 IELTS Speaking - Part 3.pdf"
    if require_string(source_meta, "file_name", f"Book {book} source metadata") != expected_file:
        raise ValueError(f"Book {book} source metadata has an unexpected PDF file name")
    source_hash = require_string(source_meta, "sha256", f"Book {book} source metadata")
    if SHA256_PATTERN.fullmatch(source_hash) is None:
        raise ValueError(f"Book {book} source metadata has an invalid PDF SHA-256")
    page_count = source_meta.get("page_count")
    if not isinstance(page_count, int) or isinstance(page_count, bool) or page_count < 2:
        raise ValueError(f"Book {book} source metadata has an invalid page_count")

    categories = require_list(source.get("categories"), f"Book {book} categories")
    if not categories:
        raise ValueError(f"Book {book} must contain at least one category")
    category_by_exercise: dict[int, tuple[str, str]] = {}
    seen_category_ids: set[str] = set()
    flattened_category_numbers: list[int] = []
    for order, category_value in enumerate(categories, start=1):
        where = f"Book {book}, category {order}"
        category = require_mapping(category_value, where)
        if category.get("contents_order") != order:
            raise ValueError(f"{where} has an invalid contents_order")
        category_id = require_string(category, "id", where)
        category_title = require_string(category, "title", where)
        if category_id in seen_category_ids:
            raise ValueError(f"Book {book} has a duplicate category id {category_id!r}")
        seen_category_ids.add(category_id)
        exercise_numbers = require_list(category.get("exercise_numbers"), where)
        if (
            not exercise_numbers
            or any(not isinstance(number, int) or isinstance(number, bool) for number in exercise_numbers)
            or exercise_numbers != sorted(set(exercise_numbers))
        ):
            raise ValueError(f"{where} has invalid exercise_numbers")
        if category.get("exercise_count") != len(exercise_numbers):
            raise ValueError(f"{where} has an incorrect exercise_count")
        validate_page_range(category.get("page_range"), where, page_count=page_count)
        for number in exercise_numbers:
            if number in category_by_exercise:
                raise ValueError(f"Book {book} exercise {number} appears in two categories")
            category_by_exercise[number] = (category_id, category_title)
        flattened_category_numbers.extend(exercise_numbers)
    if flattened_category_numbers != list(range(1, exercise_count + 1)):
        raise ValueError(f"Book {book} categories do not partition all exercises in order")

    anomalies = require_list(source.get("source_anomalies"), f"Book {book} source anomalies")
    declared_label_variations: set[tuple[int, int, str, str, int]] = set()
    for anomaly_number, anomaly_value in enumerate(anomalies, start=1):
        anomaly = require_mapping(anomaly_value, f"Book {book} source anomaly {anomaly_number}")
        anomaly_type = require_string(
            anomaly, "type", f"Book {book} source anomaly {anomaly_number}"
        )
        if anomaly_type == "source_label_variation":
            declared_label_variations.add((
                anomaly.get("exercise_number"),
                anomaly.get("source_number"),
                anomaly.get("found"),
                anomaly.get("expected"),
                anomaly.get("page"),
            ))

    exercises = require_list(source.get("exercises"), f"Book {book} exercises")
    if len(exercises) != exercise_count:
        raise ValueError(f"Book {book} exercise_count does not match its exercises array")
    seen_ids: set[str] = set()
    seen_provenance: set[tuple[int, int]] = set()
    observed_label_variations: set[tuple[int, int, str, str, int]] = set()
    source_word_count = 0
    for expected_index, exercise_value in enumerate(exercises, start=1):
        where = f"Book {book}, exercise {expected_index}"
        exercise = require_mapping(exercise_value, where)
        if exercise.get("exercise_number") != expected_index:
            raise ValueError(f"{where} is missing or out of order")
        source_id = require_string(exercise, "id", where)
        expected_source_id = f"part3-book{book}-exercise-{expected_index:02d}"
        if source_id != expected_source_id or source_id in seen_ids:
            raise ValueError(f"{where} has an unexpected or duplicate source id")
        seen_ids.add(source_id)
        if (
            exercise.get("category_id"),
            exercise.get("category_title"),
        ) != category_by_exercise[expected_index]:
            raise ValueError(f"{where} has incorrect category metadata")
        exercise_range = validate_page_range(
            exercise.get("page_range"), where, page_count=page_count
        )
        exercise_pages = validate_pages(exercise.get("pages"), exercise_range, where)

        question = require_mapping(exercise.get("question"), f"{where} question")
        question_english = require_string(question, "english", f"{where} question")
        question_chinese = require_string(question, "chinese", f"{where} question")
        if CJK_PATTERN.search(question_english) or not CJK_PATTERN.search(question_chinese):
            raise ValueError(f"{where} question has mixed or missing language content")
        question_range = validate_page_range(
            question.get("page_range"), f"{where} question", page_count=page_count
        )
        question_pages = validate_pages(
            question.get("pages"), question_range, f"{where} question"
        )
        exercise_provenance_pages = validate_source_lines(
            question.get("source_lines"),
            question_pages,
            f"{where} question",
            seen_provenance,
            page_count=page_count,
        )

        models = require_list(exercise.get("response_models"), f"{where} models")
        if len(models) != EXPECTED_MODELS_PER_EXERCISE:
            raise ValueError(f"{where} must contain exactly two response models")
        flattened_source_numbers: list[int] = []
        for expected_model, model_value in enumerate(models, start=1):
            model_where = f"{where}, model {expected_model}"
            model = require_mapping(model_value, model_where)
            if model.get("model_number") != expected_model:
                raise ValueError(f"{model_where} is missing or out of order")
            if model.get("development_order") != list(EXPECTED_STAGES):
                raise ValueError(f"{model_where} does not preserve IEEC order")
            steps = require_list(model.get("components"), f"{model_where} components")
            if len(steps) != EXPECTED_STEPS_PER_MODEL:
                raise ValueError(f"{model_where} must contain four steps")
            expected_numbers = list(range((expected_model - 1) * 4 + 1, expected_model * 4 + 1))
            for model_step, (step_value, expected_number, expected_stage) in enumerate(
                zip(steps, expected_numbers, EXPECTED_STAGES), start=1
            ):
                step_where = f"{model_where}, step {model_step}"
                step = require_mapping(step_value, step_where)
                if step.get("source_number") != expected_number:
                    raise ValueError(f"{step_where} has an invalid source_number")
                if step.get("stage") != expected_stage:
                    raise ValueError(f"{step_where} does not preserve IEEC order")
                source_label = require_string(step, "source_label", step_where)
                expected_label = EXPECTED_SOURCE_LABELS[expected_number]
                english = require_string(step, "english", step_where)
                chinese = require_string(step, "chinese", step_where)
                if CJK_PATTERN.search(english) or not CJK_PATTERN.search(chinese):
                    raise ValueError(f"{step_where} has mixed or missing language content")
                step_range = validate_page_range(
                    step.get("page_range"), step_where, page_count=page_count
                )
                step_pages = validate_pages(step.get("pages"), step_range, step_where)
                if source_label != expected_label:
                    observed_label_variations.add((
                        expected_index,
                        expected_number,
                        source_label,
                        expected_label,
                        step_range[0],
                    ))
                exercise_provenance_pages.update(validate_source_lines(
                    step.get("source_lines"),
                    step_pages,
                    step_where,
                    seen_provenance,
                    page_count=page_count,
                ))
                source_word_count += len(ENGLISH_WORD_PATTERN.findall(english))
                flattened_source_numbers.append(expected_number)
        if flattened_source_numbers != list(EXPECTED_SOURCE_NUMBERS):
            raise ValueError(f"{where} does not contain source components 1 through 8")
        if exercise_provenance_pages != set(exercise_pages):
            raise ValueError(f"{where} provenance pages do not match its declared pages")

    if observed_label_variations != declared_label_variations:
        raise ValueError(
            f"Book {book} source label anomalies do not match the extracted components"
        )
    source["_validated_english_word_count"] = source_word_count
    source["_validated_provenance_row_count"] = len(seen_provenance)
    return source


def load_sources(
    source_root: Path,
    books: tuple[int, ...] = EXPECTED_BOOKS,
) -> list[dict[str, Any]]:
    sources: list[dict[str, Any]] = []
    for book in books:
        if book not in EXPECTED_BOOKS:
            raise ValueError(f"Part 3 Book {book} is outside the supported range")
        path = source_root / SOURCE_PATTERN.format(book=book)
        if not path.is_file():
            raise ValueError(f"Part 3 Book {book} structured source is missing")
        expected_hash = EXPECTED_STRUCTURED_JSON_SHA256_BY_BOOK.get(book)
        if expected_hash is None:
            raise ValueError(f"Part 3 Book {book} structured source has not been pinned")
        actual_hash = sha256_file(path)
        if actual_hash != expected_hash:
            raise ValueError(
                f"Part 3 Book {book} structured source SHA-256 changed; "
                "re-audit the PDF extraction before rebuilding"
            )
        sources.append(validate_source(
            json.loads(path.read_text(encoding="utf-8")), expected_book=book
        ))
    return sources


def source_lines_raw(lines: Any, where: str) -> str:
    source_lines = require_list(lines, f"{where} source_lines")
    return "\n".join(
        require_string(
            require_mapping(value, f"{where} source line {index}"),
            "text",
            f"{where} source line {index}",
        )
        for index, value in enumerate(source_lines, start=1)
    )


def display_chinese_text(
    value: str,
    *,
    book: int,
    exercise_number: int,
    model_number: int,
    model_step: int,
) -> tuple[str, str | None]:
    key = (book, exercise_number, model_number, model_step)
    if key not in KNOWN_CHINESE_DISPLAY_REPAIRS:
        return value, None
    if not value.startswith("([") or not value.endswith("] ("):
        raise ValueError(f"Known Chinese wrapper artifact changed at {key}")
    repaired = value[2:-3].strip()
    if not repaired:
        raise ValueError(f"Known Chinese wrapper repair produced empty text at {key}")
    return repaired, value


def browser_book_payload(source: dict[str, Any]) -> tuple[dict[str, Any], dict[str, int], list[dict[str, Any]]]:
    book = int(source["book"])
    exercises: list[dict[str, Any]] = []
    exercise_ids_by_category = {str(category["id"]): [] for category in source["categories"]}
    model_count = 0
    step_count = 0
    display_normalization_count = 0

    for exercise in source["exercises"]:
        index = int(exercise["exercise_number"])
        exercise_id = stable_exercise_id(book, index)
        question = exercise["question"]
        response_models: list[dict[str, Any]] = []
        for model in exercise["response_models"]:
            model_number = int(model["model_number"])
            steps: list[dict[str, Any]] = []
            for model_step, component in enumerate(model["components"], start=1):
                stage = str(component["stage"])
                text_zh, source_text_zh = display_chinese_text(
                    str(component["chinese"]),
                    book=book,
                    exercise_number=index,
                    model_number=model_number,
                    model_step=model_step,
                )
                step_payload = {
                    "number": model_step,
                    "sourceNumber": int(component["source_number"]),
                    "stage": stage,
                    "labelEn": stage.title(),
                    "labelZh": STAGE_LABELS_ZH[stage],
                    "sourceLabel": component["source_label"],
                    "textEn": component["english"],
                    "textZh": text_zh,
                    "pages": component["pages"],
                    "pageRange": [
                        component["page_range"]["start"],
                        component["page_range"]["end"],
                    ],
                }
                if source_text_zh is not None:
                    step_payload["sourceTextZh"] = source_text_zh
                    display_normalization_count += 1
                steps.append(step_payload)
            response_models.append({
                "number": model_number,
                "labelEn": f"Sample {model_number}",
                "labelZh": f"示範答案 {model_number}",
                "developmentOrder": list(EXPECTED_STAGES),
                "steps": steps,
            })
            model_count += 1
            step_count += len(steps)

        category_id = str(exercise["category_id"])
        exercise_ids_by_category[category_id].append(exercise_id)
        question_en = str(question["english"])
        question_zh = str(question["chinese"])
        exercises.append({
            "id": exercise_id,
            "index": index,
            "title": question_en,
            "titleZh": question_zh,
            "cueText": f"{question_en}\n{question_zh}",
            "question": {"english": question_en, "chinese": question_zh},
            "categoryId": category_id,
            "categoryTitle": exercise["category_title"],
            "pages": exercise["pages"],
            "pageRange": [
                exercise["page_range"]["start"],
                exercise["page_range"]["end"],
            ],
            "cue": {
                "questionEn": question_en,
                "questionZh": question_zh,
                "raw": source_lines_raw(
                    question["source_lines"], f"Book {book}, exercise {index} question"
                ),
            },
            "responseModels": response_models,
        })

    categories = []
    for category in source["categories"]:
        category_id = str(category["id"])
        categories.append({
            "order": int(category["contents_order"]),
            "id": category_id,
            "title": category["title"],
            "exerciseNumbers": category["exercise_numbers"],
            "exerciseIds": exercise_ids_by_category[category_id],
            "exerciseCount": int(category["exercise_count"]),
            "pageRange": [
                category["page_range"]["start"],
                category["page_range"]["end"],
            ],
        })

    anomalies = [{"book": book, **anomaly} for anomaly in source["source_anomalies"]]
    stats = {
        "categories": len(categories),
        "exercises": len(exercises),
        "models": model_count,
        "steps": step_count,
        "words": int(source["_validated_english_word_count"]),
        "provenanceRows": int(source["_validated_provenance_row_count"]),
        "displayNormalizations": display_normalization_count,
    }
    return ({
        "part": 3,
        "book": book,
        "displayTitle": f"Book {book} of Part 3",
        "sourceFile": source["source"]["file_name"],
        "exerciseCount": len(exercises),
        "responseModelCount": model_count,
        "stepCount": step_count,
        "categories": categories,
        "exercises": exercises,
    }, stats, anomalies)


def browser_payload(sources: list[dict[str, Any]]) -> dict[str, Any]:
    books: list[dict[str, Any]] = []
    anomalies: list[dict[str, Any]] = []
    totals = {
        "categories": 0,
        "exercises": 0,
        "models": 0,
        "steps": 0,
        "words": 0,
        "provenanceRows": 0,
        "displayNormalizations": 0,
    }
    for source in sources:
        book_payload, stats, book_anomalies = browser_book_payload(source)
        books.append(book_payload)
        anomalies.extend(book_anomalies)
        for key in totals:
            totals[key] += stats[key]

    source_hashes = {str(source["book"]): source["source"]["sha256"] for source in sources}
    structured_hashes = {
        str(book): EXPECTED_STRUCTURED_JSON_SHA256_BY_BOOK[book] for book in EXPECTED_BOOKS
    }
    corpus_hash = hashlib.sha256(
        json.dumps(structured_hashes, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()
    return {
        "metadata": {
            "schemaVersion": 1,
            "exam": "IELTS",
            "part": 3,
            "bookCount": len(books),
            "categoryCount": totals["categories"],
            "exerciseCount": totals["exercises"],
            "responseModelCount": totals["models"],
            "stepsPerModel": EXPECTED_STEPS_PER_MODEL,
            "stepCount": totals["steps"],
            "englishWordCount": totals["words"],
            "provenanceRowCount": totals["provenanceRows"],
            "displayNormalizationCount": totals["displayNormalizations"],
            "audioBuildVersion": AUDIO_BUILD_VERSION,
            "sourceSha256": corpus_hash,
            "sourcePdfSha256ByBook": source_hashes,
            "structuredSourceSha256ByBook": structured_hashes,
        },
        "books": books,
        "sourceAnomalies": anomalies,
    }


def javascript_content(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, ensure_ascii=False, indent=2)
    return (
        "/* Generated by tools/build-speaking-part3-data.py; do not edit by hand. */\n"
        f"window.EDMUND_SPEAKING_PART3_DATA = Object.freeze({encoded});\n"
    )


def write_atomic(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temporary.write_text(content, encoding="utf-8")
    temporary.replace(path)


def parse_args() -> argparse.Namespace:
    repository_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source-root",
        type=Path,
        default=repository_root / "tools",
        help="Directory containing all 16 validated Part 3 structured JSON files",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=repository_root / OUTPUT_NAME,
        help="Browser JavaScript data file",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Validate that the existing generated output is current",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        sources = load_sources(args.source_root.resolve())
        payload = browser_payload(sources)
    except (OSError, ValueError, json.JSONDecodeError) as error:
        raise SystemExit(str(error)) from error
    content = javascript_content(payload)
    output_path = args.output.resolve()
    metadata = payload["metadata"]
    summary = (
        f"{metadata['bookCount']} books, "
        f"{metadata['categoryCount']} categories, "
        f"{metadata['exerciseCount']} exercises, "
        f"{metadata['responseModelCount']} response models, "
        f"{metadata['stepCount']} IEEC steps, "
        f"{metadata['englishWordCount']:,} English words"
    )
    if args.check:
        if not output_path.is_file() or output_path.read_text(encoding="utf-8") != content:
            raise SystemExit(f"Part 3 speaking data is stale: run {Path(__file__).name}")
        print(f"Part 3 speaking data valid: {summary}.")
        return 0
    write_atomic(output_path, content)
    print(f"Wrote {output_path}: {summary}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
