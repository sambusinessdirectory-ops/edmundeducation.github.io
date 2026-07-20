#!/usr/bin/env python3
"""Build strict browser data for IELTS Speaking Part 3, Book 1.

The validated PDF extraction is the only content source.  This builder keeps
the four source categories, all 23 exercises, both response models per
exercise, and each model's Idea → Explanation → Example → Conclusion steps.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from pathlib import Path
from typing import Any


SOURCE_NAME = "ielts-speaking-part3-book1-structured.json"
OUTPUT_NAME = "speaking-system-part3-data.js"
EXPECTED_CATEGORY_SPECS = (
    ("challenge", "Challenge", 1, 4, 3, 10),
    ("team", "A Member of A Team", 5, 8, 11, 20),
    ("advertisements", "Advertisements", 9, 14, 21, 35),
    ("animals", "Animals", 15, 23, 36, 56),
)
EXPECTED_EXERCISES = 23
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
EXPECTED_LABEL_VARIATIONS = {
    (15, 7, "Example", "Example 2", 37),
    (21, 7, "Example", "Example 2", 50),
    (22, 7, "Example", "Example 2", 52),
    (23, 7, "Example", "Example 2", 56),
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
EXPECTED_SOURCE_FILE = "Book 1 - Band 9 IELTS Speaking - Part 3.pdf"
EXPECTED_SOURCE_PDF_SHA256 = (
    "2baede46ae168fe7897783f59646c25e00e6bf29aafec5cf6b9f3b20f50e90d3"
)
EXPECTED_STRUCTURED_JSON_SHA256 = (
    "9c4d08451d285274e901b47d3ee95d85fe3c07fd163f81f486d81e8528ff383e"
)
EXPECTED_PROVENANCE_ROWS = 1277
# The PDF visibly contains one duplicated/mismatched wrapper around Exercise 4,
# Sample 1's Example translation: "([…] (".  Keep the source value in
# sourceTextZh while removing only those wrappers from the browser display.
KNOWN_CHINESE_DISPLAY_REPAIR = (4, 1, 3)


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
    return value


def validate_page_range(value: Any, where: str) -> tuple[int, int]:
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


def stable_exercise_id(index: int) -> str:
    return f"ielts-part-3-book-1-exercise-{index:02d}"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_source_lines(
    value: Any,
    expected_pages: list[int],
    where: str,
    seen_provenance: set[tuple[int, int]],
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
            or page < 3
            or page > 56
            or not isinstance(line_number, int)
            or isinstance(line_number, bool)
            or line_number < 1
        ):
            raise ValueError(f"{where} source line {row_number} has invalid provenance")
        require_string(row, "text", f"{where} source line {row_number}")
        key = (page, line_number)
        if key in seen_provenance:
            raise ValueError(f"duplicate source provenance row {key}")
        seen_provenance.add(key)
        pages.add(page)
    if pages != set(expected_pages):
        raise ValueError(f"{where} provenance pages do not match its declared pages")
    return pages


def validate_source(payload: Any) -> dict[str, Any]:
    source = require_mapping(payload, "Part 3 source")
    expected_header = {
        "schema_version": "1.0.0",
        "part": 3,
        "book": 1,
        "exercise_count": EXPECTED_EXERCISES,
        "response_model_count": EXPECTED_EXERCISES * EXPECTED_MODELS_PER_EXERCISE,
        "component_count": (
            EXPECTED_EXERCISES
            * EXPECTED_MODELS_PER_EXERCISE
            * EXPECTED_STEPS_PER_MODEL
        ),
    }
    for key, expected in expected_header.items():
        if source.get(key) != expected:
            raise ValueError(f"Part 3 source {key} must be {expected!r}")

    source_meta = require_mapping(source.get("source"), "Part 3 source metadata")
    if require_string(source_meta, "file_name", "Part 3 source metadata") != EXPECTED_SOURCE_FILE:
        raise ValueError("Part 3 source metadata has an unexpected PDF file name")
    source_hash = require_string(source_meta, "sha256", "Part 3 source metadata")
    if SHA256_PATTERN.fullmatch(source_hash) is None or source_hash != EXPECTED_SOURCE_PDF_SHA256:
        raise ValueError("Part 3 source metadata has an unexpected PDF SHA-256")
    if source_meta.get("page_count") != 56:
        raise ValueError("Part 3 source PDF page count must be 56")

    categories = require_list(source.get("categories"), "Part 3 categories")
    if len(categories) != len(EXPECTED_CATEGORY_SPECS):
        raise ValueError("Part 3 source must contain exactly four categories")
    category_by_exercise: dict[int, tuple[str, str]] = {}
    for order, (category, expected) in enumerate(
        zip(categories, EXPECTED_CATEGORY_SPECS), start=1
    ):
        item = require_mapping(category, f"category {order}")
        expected_id, expected_title, first, last, first_page, last_page = expected
        if item.get("contents_order") != order:
            raise ValueError(f"category {order} has an invalid contents_order")
        if item.get("id") != expected_id or item.get("title") != expected_title:
            raise ValueError(f"category {order} does not match the PDF contents")
        expected_numbers = list(range(first, last + 1))
        if item.get("exercise_numbers") != expected_numbers:
            raise ValueError(f"category {expected_title} has incorrect exercise numbers")
        if item.get("exercise_count") != len(expected_numbers):
            raise ValueError(f"category {expected_title} has an incorrect exercise_count")
        if validate_page_range(
            item.get("page_range"), f"category {expected_title}"
        ) != (first_page, last_page):
            raise ValueError(f"category {expected_title} has an incorrect page range")
        for number in expected_numbers:
            category_by_exercise[number] = (expected_id, expected_title)

    exercises = require_list(source.get("exercises"), "Part 3 exercises")
    if len(exercises) != EXPECTED_EXERCISES:
        raise ValueError(f"Part 3 source must contain {EXPECTED_EXERCISES} exercises")

    seen_ids: set[str] = set()
    seen_provenance: set[tuple[int, int]] = set()
    source_word_count = 0
    for expected_index, exercise_value in enumerate(exercises, start=1):
        where = f"exercise {expected_index}"
        exercise = require_mapping(exercise_value, where)
        if exercise.get("exercise_number") != expected_index:
            raise ValueError(f"{where} is missing or out of order")
        source_id = require_string(exercise, "id", where)
        if source_id != f"part3-book1-exercise-{expected_index:02d}":
            raise ValueError(f"{where} has an unexpected source id")
        if source_id in seen_ids:
            raise ValueError(f"{where} has a duplicate source id")
        seen_ids.add(source_id)
        expected_category = category_by_exercise[expected_index]
        if (
            exercise.get("category_id"),
            exercise.get("category_title"),
        ) != expected_category:
            raise ValueError(f"{where} has incorrect category metadata")
        exercise_range = validate_page_range(exercise.get("page_range"), where)
        validate_pages(exercise.get("pages"), exercise_range, where)

        question = require_mapping(exercise.get("question"), f"{where} question")
        require_string(question, "english", f"{where} question")
        require_string(question, "chinese", f"{where} question")
        question_range = validate_page_range(
            question.get("page_range"), f"{where} question"
        )
        validate_pages(question.get("pages"), question_range, f"{where} question")
        exercise_provenance_pages = validate_source_lines(
            question.get("source_lines"),
            list(question["pages"]),
            f"{where} question",
            seen_provenance,
        )

        models = require_list(exercise.get("response_models"), f"{where} models")
        if len(models) != EXPECTED_MODELS_PER_EXERCISE:
            raise ValueError(
                f"{where} must contain exactly {EXPECTED_MODELS_PER_EXERCISE} models"
            )
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
                raise ValueError(
                    f"{model_where} must contain {EXPECTED_STEPS_PER_MODEL} steps"
                )
            expected_numbers = list(
                range((expected_model - 1) * EXPECTED_STEPS_PER_MODEL + 1,
                      expected_model * EXPECTED_STEPS_PER_MODEL + 1)
            )
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
                require_string(step, "chinese", step_where)
                step_range = validate_page_range(step.get("page_range"), step_where)
                step_pages = validate_pages(step.get("pages"), step_range, step_where)
                allowed_variation = (
                    expected_index,
                    expected_number,
                    source_label,
                    expected_label,
                    step_range[0],
                )
                if source_label != expected_label and allowed_variation not in EXPECTED_LABEL_VARIATIONS:
                    raise ValueError(f"{step_where} has an unexpected source label")
                exercise_provenance_pages.update(validate_source_lines(
                    step.get("source_lines"),
                    step_pages,
                    step_where,
                    seen_provenance,
                ))
                source_word_count += len(ENGLISH_WORD_PATTERN.findall(english))
                flattened_source_numbers.append(expected_number)
        if flattened_source_numbers != list(EXPECTED_SOURCE_NUMBERS):
            raise ValueError(f"{where} does not contain source components 1 through 8")
        if exercise_provenance_pages != set(exercise["pages"]):
            raise ValueError(f"{where} provenance pages do not match its declared pages")

    anomalies = require_list(source.get("source_anomalies"), "source anomalies")
    anomaly_tuples: set[tuple[int, int, str, str, int]] = set()
    for anomaly_number, anomaly_value in enumerate(anomalies, start=1):
        anomaly = require_mapping(anomaly_value, f"source anomaly {anomaly_number}")
        if anomaly.get("type") != "source_label_variation":
            raise ValueError(f"source anomaly {anomaly_number} has an unexpected type")
        anomaly_tuples.add((
            anomaly.get("exercise_number"),
            anomaly.get("source_number"),
            anomaly.get("found"),
            anomaly.get("expected"),
            anomaly.get("page"),
        ))
    if anomaly_tuples != EXPECTED_LABEL_VARIATIONS or len(anomalies) != len(EXPECTED_LABEL_VARIATIONS):
        raise ValueError("Part 3 source label anomalies do not match the validated PDF")
    if len(seen_provenance) != EXPECTED_PROVENANCE_ROWS:
        raise ValueError(
            f"Part 3 source has {len(seen_provenance)} provenance rows; "
            f"expected {EXPECTED_PROVENANCE_ROWS}"
        )

    source["_validated_english_word_count"] = source_word_count
    return source


def source_lines_raw(lines: Any, where: str) -> str:
    source_lines = require_list(lines, f"{where} source_lines")
    text_lines: list[str] = []
    for index, value in enumerate(source_lines, start=1):
        line = require_mapping(value, f"{where} source line {index}")
        text_lines.append(require_string(line, "text", f"{where} source line {index}"))
    return "\n".join(text_lines)


def display_chinese_text(
    value: str,
    *,
    exercise_number: int,
    model_number: int,
    model_step: int,
) -> tuple[str, str | None]:
    if (exercise_number, model_number, model_step) != KNOWN_CHINESE_DISPLAY_REPAIR:
        return value, None
    if not value.startswith("([") or not value.endswith("] ("):
        raise ValueError(
            "Known Exercise 4 Chinese wrapper artifact changed; review the source explicitly"
        )
    repaired = value[2:-3].strip()
    if not repaired:
        raise ValueError("Known Exercise 4 Chinese wrapper repair produced empty text")
    return repaired, value


def browser_payload(source: dict[str, Any]) -> dict[str, Any]:
    exercises: list[dict[str, Any]] = []
    exercise_ids_by_category: dict[str, list[str]] = {
        category_id: [] for category_id, _, _, _, _, _ in EXPECTED_CATEGORY_SPECS
    }
    model_count = 0
    step_count = 0

    for exercise in source["exercises"]:
        index = int(exercise["exercise_number"])
        exercise_id = stable_exercise_id(index)
        question = exercise["question"]
        response_models: list[dict[str, Any]] = []
        for model in exercise["response_models"]:
            model_number = int(model["model_number"])
            steps: list[dict[str, Any]] = []
            for model_step, component in enumerate(model["components"], start=1):
                stage = str(component["stage"])
                text_zh, source_text_zh = display_chinese_text(
                    str(component["chinese"]),
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
            "question": {
                "english": question_en,
                "chinese": question_zh,
            },
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
                "raw": source_lines_raw(question["source_lines"], f"exercise {index} question"),
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

    expected_model_count = EXPECTED_EXERCISES * EXPECTED_MODELS_PER_EXERCISE
    expected_step_count = expected_model_count * EXPECTED_STEPS_PER_MODEL
    if model_count != expected_model_count or step_count != expected_step_count:
        raise ValueError("Browser conversion lost Part 3 response models or IEEC steps")

    source_meta = source["source"]
    return {
        "metadata": {
            "schemaVersion": 1,
            "exam": "IELTS",
            "part": 3,
            "bookCount": 1,
            "categoryCount": len(categories),
            "exerciseCount": len(exercises),
            "responseModelCount": model_count,
            "stepsPerModel": EXPECTED_STEPS_PER_MODEL,
            "stepCount": step_count,
            "englishWordCount": source["_validated_english_word_count"],
            "displayNormalizationCount": 1,
            "audioBuildVersion": "v2",
            "sourceSha256": source_meta["sha256"],
        },
        "books": [{
            "part": 3,
            "book": 1,
            "displayTitle": "Book 1 of Part 3",
            "sourceFile": source_meta["file_name"],
            "exerciseCount": len(exercises),
            "responseModelCount": model_count,
            "stepCount": step_count,
            "categories": categories,
            "exercises": exercises,
        }],
        "sourceAnomalies": source["source_anomalies"],
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
        "--source",
        type=Path,
        default=repository_root / "tools" / SOURCE_NAME,
        help="Validated structured JSON extracted from the Part 3 PDF",
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
    source_path = args.source.resolve()
    if sha256_file(source_path) != EXPECTED_STRUCTURED_JSON_SHA256:
        raise SystemExit(
            "Part 3 structured source SHA-256 changed; re-audit the PDF extraction "
            "before rebuilding browser data"
        )
    source = validate_source(json.loads(source_path.read_text(encoding="utf-8")))
    payload = browser_payload(source)
    content = javascript_content(payload)
    output_path = args.output.resolve()
    metadata = payload["metadata"]

    summary = (
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
