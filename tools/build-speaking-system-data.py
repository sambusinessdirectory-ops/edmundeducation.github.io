#!/usr/bin/env python3
"""Build the browser data file for IELTS Speaking Part 2, Book 1.

The structured JSON extracted from the source PDF is the only content source.
This builder validates that corpus, gives each exercise a stable audio id, and
reshapes it into the small view model used by speaking-system.html.
"""

from __future__ import annotations

import argparse
import json
import os
import re
from pathlib import Path
from typing import Any


EXPECTED_EXERCISES = 10
EXPECTED_SECTIONS_PER_EXERCISE = 4
EXPECTED_ENGLISH_WORDS = 3854
SOURCE_NAME = "book1-ielts-speaking-part2-structured.json"
OUTPUT_NAME = "speaking-system-data.js"

# This intentionally follows the acceptance count used for the source import:
# ASCII English words, with apostrophes and hyphens retained within a word.
# (The audio manifest uses a Unicode-aware display-word pattern so that visible
# words such as “café” still receive a highlight timestamp.)
ENGLISH_WORD_PATTERN = re.compile(
    r"\b[A-Za-z]+(?:[’'][A-Za-z]+)*(?:-[A-Za-z]+)*\b"
)
CJK_PATTERN = re.compile(r"[\u3400-\u9fff]")
CJK_OR_PUNCTUATION = r"\u3400-\u9fff\u3000-\u303f\uff01-\uff65"
LIST_PREFIX_PATTERN = re.compile(r"^\s*(?:[●•]|\d+\.)\s*")
PPF_START_PATTERN = re.compile(r"(?im)^\s*PPF\s+idea(?:\s+for\s+this\s+topic)?\s*:?")


def normalized_line(value: str) -> str:
    """Collapse PDF line wrapping without otherwise rewriting the content."""
    return re.sub(r"\s+", " ", value).strip()


def normalized_chinese_line(value: str) -> str:
    """Remove PDF wraps inside Chinese while retaining real Latin spacing."""
    clean = normalized_line(value)
    return re.sub(
        rf"(?<=[{CJK_OR_PUNCTUATION}])\s+(?=[{CJK_OR_PUNCTUATION}])",
        "",
        clean,
    )


def without_list_prefix(value: str) -> str:
    return LIST_PREFIX_PATTERN.sub("", normalized_line(value)).strip()


def without_outer_parentheses(value: str) -> str:
    clean = normalized_chinese_line(value)
    if len(clean) >= 2 and clean[0] in "(（" and clean[-1] in ")）":
        return clean[1:-1].strip()
    return clean


def bilingual_chunks(value: str) -> list[tuple[str, str]]:
    """Pair English blocks with the following parenthesized Chinese block."""
    result: list[tuple[str, str]] = []
    english_lines: list[str] = []
    chinese_lines: list[str] = []
    reading_chinese = False

    for line in value.splitlines():
        stripped = line.strip()
        begins_chinese = (
            stripped.startswith(("(", "（"))
            and CJK_PATTERN.search(stripped) is not None
        )
        if begins_chinese and not reading_chinese:
            reading_chinese = True
            chinese_lines = [stripped]
        elif reading_chinese:
            chinese_lines.append(stripped)
        else:
            english_lines.append(stripped)

        if reading_chinese and stripped.endswith((")", "）")):
            result.append((
                "\n".join(english_lines).strip(),
                "\n".join(chinese_lines).strip(),
            ))
            english_lines = []
            chinese_lines = []
            reading_chinese = False

    if reading_chinese:
        raise ValueError("Unclosed Chinese parenthetical in cue text")
    if english_lines:
        result.append(("\n".join(english_lines).strip(), ""))
    return result


def split_main_cue_and_ppf(raw: str) -> tuple[str, dict[str, str] | None]:
    match = PPF_START_PATTERN.search(raw)
    if not match:
        return raw.strip(), None

    cue_text = raw[: match.start()].rstrip()
    ppf_text = raw[match.start() :].strip()
    chunks = bilingual_chunks(ppf_text)
    if not chunks:
        raise ValueError("PPF marker found without PPF text")
    english_raw, chinese_raw = chunks[0]
    english = PPF_START_PATTERN.sub("", english_raw, count=1).strip()
    chinese = without_outer_parentheses(chinese_raw)
    chinese = re.sub(r"^(?:PPF\s*)?小提示\s*[:：]\s*", "", chinese).strip()
    if not english:
        raise ValueError("PPF marker found without English guidance")
    return cue_text, {"en": normalized_line(english), "zh": normalized_line(chinese)}


def strip_topic_prefix(value: str) -> str:
    return re.sub(r"^題目\s*[:：]\s*", "", value).strip()


def parse_cue(exercise: dict[str, Any]) -> dict[str, Any]:
    """Turn the bilingual PDF cue into predictable display fields."""
    raw = require_string(exercise, "cue_raw", f"exercise {exercise.get('index')}")
    main_cue, ppf = split_main_cue_and_ppf(raw)
    chunks = bilingual_chunks(main_cue)
    if not chunks:
        raise ValueError(f"Exercise {exercise.get('index')} has no cue content")

    title_en = str(exercise["title"])
    title_zh = ""
    prompt_en = ""
    prompt_zh = ""
    hints: list[dict[str, str]] = []

    first_english_raw, first_chinese_raw = chunks.pop(0)
    first_lines = [line.strip() for line in first_english_raw.splitlines() if line.strip()]
    first_chinese = without_outer_parentheses(first_chinese_raw)

    if first_lines and first_lines[0].lower().startswith("question:"):
        question_value = first_lines[0].split(":", 1)[1].strip()
        if len(first_lines) > 1:
            title_en = question_value
            title_zh = strip_topic_prefix(first_chinese)
            prompt_en = normalized_line(" ".join(first_lines[1:]))
        elif question_value.lower().startswith("describe "):
            # Some source cards use “Question: Describe …” as the prompt rather
            # than providing a separate short topic title.
            prompt_en = question_value
            prompt_zh = strip_topic_prefix(first_chinese)
            title_zh = strip_topic_prefix(first_chinese)
        else:
            title_en = question_value
            title_zh = strip_topic_prefix(first_chinese)
    else:
        prompt_en = normalized_line(first_english_raw)
        prompt_zh = first_chinese

    for english_raw, chinese_raw in chunks:
        english = without_list_prefix(english_raw)
        chinese = without_list_prefix(without_outer_parentheses(chinese_raw))
        label_match = re.match(r"^You\s+should\s+say\s*:\s*(.*)$", english, re.I)
        if label_match:
            english = label_match.group(1).strip()
            if not english:
                continue
        if not prompt_en:
            prompt_en = english
            prompt_zh = chinese
        elif english:
            hints.append({"en": english, "zh": chinese})

    if not prompt_en:
        raise ValueError(f"Exercise {exercise.get('index')} has no English prompt")
    if not prompt_zh and title_zh:
        # Three source cards provide one Chinese topic line for a combined
        # English title + prompt. Reuse that source translation in the prompt
        # field rather than leaving the bilingual cue visually incomplete.
        prompt_zh = title_zh
    if len(hints) != 4:
        raise ValueError(
            f"Exercise {exercise.get('index')} has {len(hints)} hints; expected 4"
        )

    return {
        "titleEn": title_en,
        "titleZh": title_zh,
        "promptEn": prompt_en,
        "promptZh": prompt_zh,
        "hints": hints,
        "ppf": ppf,
        "raw": raw,
    }


def require_string(container: dict[str, Any], key: str, where: str) -> str:
    value = container.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{where} has an empty or invalid {key!r}")
    return value


def validate_source(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("Speaking source must be a JSON object")
    exercises = payload.get("exercises")
    if not isinstance(exercises, list):
        raise ValueError("Speaking source has no exercises array")
    if payload.get("exercise_count") != len(exercises):
        raise ValueError("Source exercise_count does not match its exercises array")
    if len(exercises) != EXPECTED_EXERCISES:
        raise ValueError(
            f"Source has {len(exercises)} exercises; expected {EXPECTED_EXERCISES}"
        )

    total_words = 0
    for expected_index, exercise in enumerate(exercises, start=1):
        where = f"exercise {expected_index}"
        if not isinstance(exercise, dict):
            raise ValueError(f"{where} is not an object")
        if exercise.get("index") != expected_index:
            raise ValueError(f"{where} has an unexpected index")
        require_string(exercise, "title", where)
        require_string(exercise, "cue_raw", where)
        page_range = exercise.get("page_range")
        if (
            not isinstance(page_range, list)
            or len(page_range) != 2
            or not all(isinstance(value, int) for value in page_range)
        ):
            raise ValueError(f"{where} has an invalid page_range")
        sections = exercise.get("sections")
        if not isinstance(sections, list) or len(sections) != EXPECTED_SECTIONS_PER_EXERCISE:
            count = len(sections) if isinstance(sections, list) else 0
            raise ValueError(
                f"{where} has {count} sections; expected {EXPECTED_SECTIONS_PER_EXERCISE}"
            )
        for expected_number, section in enumerate(sections, start=1):
            section_where = f"{where}, section {expected_number}"
            if not isinstance(section, dict) or section.get("number") != expected_number:
                raise ValueError(f"{section_where} is invalid or out of order")
            for key in ("heading", "english_text", "chinese_text", "raw"):
                require_string(section, key, section_where)
            if not isinstance(section.get("heading_zh"), str):
                raise ValueError(f"{section_where} has an invalid 'heading_zh'")
            total_words += len(ENGLISH_WORD_PATTERN.findall(str(section["english_text"])))

    if total_words != EXPECTED_ENGLISH_WORDS:
        raise ValueError(
            f"Source has {total_words:,} English words; expected {EXPECTED_ENGLISH_WORDS:,}"
        )
    return payload


def stable_exercise_id(index: int) -> str:
    return f"ielts-part-2-book-1-exercise-{index:02d}"


def browser_payload(source: dict[str, Any]) -> dict[str, Any]:
    exercises: list[dict[str, Any]] = []
    for exercise in source["exercises"]:
        index = int(exercise["index"])
        responses = [
            {
                "number": int(section["number"]),
                "headingEn": section["heading"],
                "headingZh": section["heading_zh"],
                "textEn": section["english_text"],
                "textZh": section["chinese_text"],
            }
            for section in exercise["sections"]
        ]
        exercises.append({
            "id": stable_exercise_id(index),
            "index": index,
            "title": exercise["title"],
            "pageRange": exercise["page_range"],
            "cue": parse_cue(exercise),
            "responses": responses,
        })

    source_path = Path(str(source.get("source", "")))
    return {
        "metadata": {
            "schemaVersion": 1,
            "exam": "IELTS",
            "part": 2,
            "book": 1,
            "displayTitle": "Book 1 of Part 2",
            "sourceFile": source_path.name or "Book 1 - IELTS Speaking Part 2 - Band 9 Samples.pdf",
            "exerciseCount": EXPECTED_EXERCISES,
            "sectionCount": EXPECTED_EXERCISES * EXPECTED_SECTIONS_PER_EXERCISE,
            "englishWordCount": EXPECTED_ENGLISH_WORDS,
            "audioBuildVersion": "v1",
        },
        "exercises": exercises,
    }


def javascript_content(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, ensure_ascii=False, indent=2)
    return (
        "/* Generated by tools/build-speaking-system-data.py; do not edit by hand. */\n"
        f"window.EDMUND_SPEAKING_DATA = Object.freeze({encoded});\n"
    )


def write_atomic(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_name(f".{path.name}.{os.getpid()}.tmp")
    temp_path.write_text(content, encoding="utf-8")
    temp_path.replace(path)


def parse_args() -> argparse.Namespace:
    repository_root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source",
        type=Path,
        default=repository_root / "tools" / SOURCE_NAME,
        help="Structured JSON extracted from the source PDF",
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
        help="Validate that the existing output is current without rewriting it",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    source_path = args.source.resolve()
    output_path = args.output.resolve()
    source = validate_source(json.loads(source_path.read_text(encoding="utf-8")))
    content = javascript_content(browser_payload(source))

    if args.check:
        if not output_path.exists() or output_path.read_text(encoding="utf-8") != content:
            raise SystemExit(f"Speaking data is stale: run {Path(__file__).name}")
        print(
            f"Speaking data valid: {EXPECTED_EXERCISES} exercises, "
            f"{EXPECTED_EXERCISES * EXPECTED_SECTIONS_PER_EXERCISE} sections, "
            f"{EXPECTED_ENGLISH_WORDS:,} English words."
        )
        return 0

    write_atomic(output_path, content)
    print(
        f"Wrote {output_path}: {EXPECTED_EXERCISES} exercises, "
        f"{EXPECTED_EXERCISES * EXPECTED_SECTIONS_PER_EXERCISE} sections, "
        f"{EXPECTED_ENGLISH_WORDS:,} English words."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
