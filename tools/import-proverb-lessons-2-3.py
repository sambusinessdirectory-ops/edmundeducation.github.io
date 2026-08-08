#!/usr/bin/env python3
"""Import the reviewed Proverb 2–3 PDFs into deterministic lesson fragments."""

from __future__ import annotations

import argparse
import bisect
import copy
import hashlib
import json
import re
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
METADATA_PATH = ROOT / "tools" / "proverb-source-metadata.json"
LESSON_DIR = ROOT / "tools" / "proverb-lessons"
MANIFEST_PATH = ROOT / "tools" / "proverb-import-manifest.json"
NUMBERED_BLOCK_RE = re.compile(r"(?m)^(\d{1,2})\n(.*?)(?=^\d{1,2}\n|\Z)", re.S)
CJK_OR_PUNCT = r"\u3400-\u4dbf\u4e00-\u9fff，。：；！？、（）「」『』《》"


def collapse_text(value: str) -> str:
    text = re.sub(r"\s+", " ", value or "").strip()
    text = re.sub(rf"(?<=[{CJK_OR_PUNCT}]) (?=[{CJK_OR_PUNCT}])", "", text)
    return text


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def page_for(starts: list[tuple[int, int]], position: int) -> int:
    offsets = [offset for offset, _ in starts]
    index = bisect.bisect_right(offsets, position) - 1
    if index < 0:
        raise ValueError(f"Could not resolve PDF page for offset {position}")
    return starts[index][1]


def join_page_range(pages: list[str], start: int, stop: int, *, key_heading: str = "") -> tuple[str, list[tuple[int, int]]]:
    parts: list[str] = []
    starts: list[tuple[int, int]] = []
    position = 0
    for index in range(start, stop):
        text = pages[index]
        if key_heading:
            if index == start:
                text = text.split(key_heading, 1)[1]
        elif index == stop - 1 and "Answer Key" in text:
            text = text.split("Answer Key", 1)[0]
        starts.append((position, index + 1))
        parts.append(text)
        position += len(text) + 1
    return "\n".join(parts), starts


def parse_prompt_block(block: str) -> tuple[str, str, str]:
    if "Answer:" not in block:
        raise ValueError("Question block is missing its Answer starter")
    before_answer, answer_line = block.split("Answer:", 1)
    starter_match = re.search(r"^\s*([^_\n]+)", answer_line)
    starter = collapse_text(starter_match.group(1) if starter_match else "")
    translation = re.search(r"（(.*?)）", before_answer, re.S)
    if not translation:
        raise ValueError("Question block is missing its Chinese translation")
    prompt = collapse_text(before_answer[: translation.start()])
    prompt_zh = collapse_text(translation.group(1))
    if not prompt or not prompt_zh or not starter:
        raise ValueError("Question prompt, translation or starter is empty")
    return prompt, prompt_zh, starter


def parse_answer_block(block: str) -> tuple[str, str]:
    translation = re.search(r"（(.*?)）", block, re.S)
    if not translation:
        raise ValueError("Answer block is missing its Chinese translation")
    answer = collapse_text(block[: translation.start()])
    answer_zh = collapse_text(translation.group(1))
    if not answer or not answer_zh:
        raise ValueError("Answer or Chinese translation is empty")
    return answer, answer_zh


def parse_pdf(source_path: Path, metadata: dict) -> tuple[list[dict], dict]:
    with pdfplumber.open(source_path) as pdf:
        pages = [page.extract_text(x_tolerance=1, y_tolerance=3) or "" for page in pdf.pages]

    expected_pages = int(metadata["source"]["pageCount"])
    if len(pages) != expected_pages:
        raise ValueError(f"{source_path.name}: expected {expected_pages} pages, found {len(pages)}")

    exercise_index = next((index for index, text in enumerate(pages) if "Exercise 練習" in text), -1)
    answer_key_index = next((index for index, text in enumerate(pages) if "Answer Key" in text), -1)
    if exercise_index < 0 or answer_key_index <= exercise_index:
        raise ValueError(f"{source_path.name}: Exercise or Answer Key boundary not found")

    question_text, question_page_starts = join_page_range(pages, exercise_index, answer_key_index + 1)
    answer_text, answer_page_starts = join_page_range(
        pages, answer_key_index, len(pages), key_heading="Answer Key"
    )

    prompts: dict[int, tuple[str, str, str, int]] = {}
    for match in NUMBERED_BLOCK_RE.finditer(question_text):
        number = int(match.group(1))
        block = match.group(2).strip()
        if 1 <= number <= 50 and "Answer:" in block:
            prompt, prompt_zh, starter = parse_prompt_block(block)
            if number in prompts:
                raise ValueError(f"{source_path.name}: duplicate question {number}")
            prompts[number] = (prompt, prompt_zh, starter, page_for(question_page_starts, match.start()))

    answers: dict[int, tuple[str, str, int]] = {}
    for match in NUMBERED_BLOCK_RE.finditer(answer_text):
        number = int(match.group(1))
        if not 1 <= number <= 50:
            continue
        block = match.group(2).strip()
        if "（" not in block:
            continue
        answer, answer_zh = parse_answer_block(block)
        if number in answers:
            raise ValueError(f"{source_path.name}: duplicate keyed answer {number}")
        answers[number] = (answer, answer_zh, page_for(answer_page_starts, match.start()))

    expected_numbers = set(range(1, 51))
    if set(prompts) != expected_numbers:
        raise ValueError(f"{source_path.name}: missing prompt numbers {sorted(expected_numbers - set(prompts))}")
    if set(answers) != expected_numbers:
        raise ValueError(f"{source_path.name}: missing answer numbers {sorted(expected_numbers - set(answers))}")

    lesson_id = metadata["id"]
    target = metadata["formulas"][0]["highlight"]
    questions: list[dict] = []
    for number in range(1, 51):
        prompt, prompt_zh, starter, source_page = prompts[number]
        answer, answer_zh, answer_source_page = answers[number]
        if target.casefold() not in answer.casefold():
            raise ValueError(f"{source_path.name}: answer {number} does not contain {target!r}")
        starter_check = answer.lstrip("“\"'").casefold()
        expected_starter = starter.lstrip("“\"'").casefold()
        if not starter_check.startswith(expected_starter):
            raise ValueError(
                f"{source_path.name}: answer {number} does not begin with starter {starter!r}: {answer!r}"
            )
        questions.append({
            "id": f"{lesson_id}-q{number:02d}",
            "number": number,
            "sourcePage": source_page,
            "answerSourcePage": answer_source_page,
            "prompt": prompt,
            "promptZh": prompt_zh,
            "starter": starter,
            "answer": answer,
            "answerZh": answer_zh,
            "highlight": target,
        })

    audit = {
        "exerciseHeadingPage": exercise_index + 1,
        "questionStartPage": min(question["sourcePage"] for question in questions),
        "questionEndPage": max(question["sourcePage"] for question in questions),
        "answerKeyStartPage": answer_key_index + 1,
        "questionCount": len(questions),
        "answerCount": len(answers),
        "allAnswersContainTarget": True,
    }
    return questions, audit


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--source-dir",
        type=Path,
        default=Path.home() / "Downloads",
        help="Directory containing the two source PDFs",
    )
    parser.add_argument("--audit", action="store_true", help="Validate sources without writing fragments")
    args = parser.parse_args()

    metadata_document = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
    lessons = metadata_document.get("lessons")
    if not isinstance(lessons, list) or len(lessons) != 2:
        raise ValueError("Expected exactly two lesson metadata records")

    manifest_lessons: list[dict] = []
    imported_lessons: list[dict] = []
    for raw_metadata in lessons:
        metadata = copy.deepcopy(raw_metadata)
        source_path = args.source_dir / metadata["source"]["file"]
        if not source_path.is_file():
            raise FileNotFoundError(source_path)
        actual_hash = sha256(source_path)
        if actual_hash != metadata["source"]["sha256"]:
            raise ValueError(f"{source_path.name}: SHA-256 mismatch")
        questions, audit = parse_pdf(source_path, metadata)
        metadata["questions"] = questions
        imported_lessons.append(metadata)
        manifest_lessons.append({
            "id": metadata["id"],
            "order": metadata["order"],
            "slug": metadata["slug"],
            "titleEn": metadata["titleEn"],
            "titleZh": metadata["titleZh"],
            "sourceFile": metadata["source"]["file"],
            "sourceSha256": actual_hash,
            "pageCount": metadata["source"]["pageCount"],
            **audit,
            "sourceOmissions": metadata["sourceOmissions"],
        })

    if args.audit:
        print(json.dumps({
            "files": len(imported_lessons),
            "questions": sum(len(lesson["questions"]) for lesson in imported_lessons),
            "lessons": manifest_lessons,
        }, ensure_ascii=False, indent=2))
        return

    LESSON_DIR.mkdir(parents=True, exist_ok=True)
    for lesson in imported_lessons:
        output = LESSON_DIR / f"lesson-{lesson['order']:02d}-{lesson['slug']}.json"
        output.write_text(json.dumps(lesson, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    manifest = {
        "version": "1",
        "system": "proverb",
        "sourceDirectory": "Downloads",
        "fileCount": len(imported_lessons),
        "questionCount": sum(len(lesson["questions"]) for lesson in imported_lessons),
        "lessons": manifest_lessons,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        f"Imported {len(imported_lessons)} Proverb lessons and {manifest['questionCount']} questions"
    )


if __name__ == "__main__":
    main()
