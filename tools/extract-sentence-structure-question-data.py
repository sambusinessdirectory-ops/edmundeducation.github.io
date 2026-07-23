#!/usr/bin/env python3
"""Extract the 50 bilingual exercise/answer pairs from a Sentence Structure PDF.

This produces a review worksheet, not publishable lesson data. Every generated
field must still be compared with rendered PDF pages before import.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

import pdfplumber


EXERCISE_HEADING = re.compile(r"^Exercise\s+練習$", re.IGNORECASE)
ANSWER_HEADING = re.compile(r"^Answer\s*Key\s+參考答案$", re.IGNORECASE)
STANDARD_STARTER = re.compile(r"^Answer\s*:\s*(.*?)_*[\s_]*$", re.IGNORECASE)
CHINESE = re.compile(r"[\u3400-\u9fff]")


def clean_line(value: str) -> str:
    return " ".join(value.split()).strip()


def clean_english(lines: list[str]) -> str:
    value = " ".join(line.strip() for line in lines if line.strip())
    value = re.sub(r"\s+([,.;:!?])", r"\1", value)
    return value.strip()


def clean_chinese(lines: list[str]) -> str:
    value = "".join(line.strip() for line in lines if line.strip())
    if value.startswith(("（", "(")):
        value = value[1:]
    if value.endswith(("）", ")")):
        value = value[:-1]
    return value.strip()


def split_bilingual(lines: list[tuple[int, str]]) -> tuple[str, str, int, int]:
    chinese_index = next(
        (
            index
            for index, (_, line) in enumerate(lines)
            if CHINESE.search(line) and line.startswith(("（", "("))
        ),
        None,
    )
    if chinese_index is None:
        raise ValueError(f"Could not locate Chinese translation in block: {lines!r}")
    english_lines = [line for _, line in lines[:chinese_index]]
    chinese_lines = [line for _, line in lines[chinese_index:]]
    english_page = lines[0][0]
    chinese_page = lines[chinese_index][0]
    return (
        clean_english(english_lines),
        clean_chinese(chinese_lines),
        english_page,
        chinese_page,
    )


def numbered_blocks(
    tokens: list[tuple[int, str]], start: int, end: int
) -> list[tuple[int, int, list[tuple[int, str]]]]:
    blocks: list[tuple[int, int, list[tuple[int, str]]]] = []
    cursor = start
    for number in range(1, 51):
        number_index = next(
            (index for index in range(cursor, end) if tokens[index][1] == str(number)),
            None,
        )
        if number_index is None:
            raise ValueError(f"Could not locate item number {number}")
        next_index = end
        if number < 50:
            next_index = next(
                (
                    index
                    for index in range(number_index + 1, end)
                    if tokens[index][1] == str(number + 1)
                ),
                None,
            )
            if next_index is None:
                raise ValueError(f"Could not locate item number {number + 1}")
        blocks.append(
            (
                number,
                tokens[number_index][0],
                tokens[number_index + 1 : next_index],
            )
        )
        cursor = next_index
    return blocks


def parse_standard_question(
    number: int, number_page: int, block: list[tuple[int, str]]
) -> dict[str, object]:
    starter_index = next(
        (
            index
            for index, (_, line) in enumerate(block)
            if STANDARD_STARTER.match(line)
        ),
        None,
    )
    if starter_index is None:
        raise ValueError(f"Question {number}: starter line not found")
    starter_match = STANDARD_STARTER.match(block[starter_index][1])
    assert starter_match is not None
    starter = starter_match.group(1).strip(" _")
    prompt, prompt_zh, question_page, prompt_zh_page = split_bilingual(
        block[:starter_index]
    )
    return {
        "number": number,
        "numberPage": number_page,
        "questionPage": question_page,
        "promptZhPage": prompt_zh_page,
        "starterPage": block[starter_index][0],
        "prompt": prompt,
        "promptZh": prompt_zh,
        "starter": starter,
    }


def parse_two_part_question(
    number: int, number_page: int, block: list[tuple[int, str]]
) -> dict[str, object]:
    whether_index = next(
        (
            index
            for index, (_, line) in enumerate(block)
            if line.startswith("Whether:")
        ),
        None,
    )
    if whether_index is None:
        raise ValueError(f"Question {number}: Whether starter not found")
    if_index = next(
        (
            index
            for index in range(whether_index + 1, len(block))
            if block[index][1].startswith("If:")
        ),
        None,
    )
    if if_index is None:
        raise ValueError(f"Question {number}: If starter not found")
    prompt, prompt_zh, question_page, prompt_zh_page = split_bilingual(
        block[:whether_index]
    )

    def starter(line: str, label: str) -> str:
        return line.removeprefix(f"{label}:").strip(" _")

    return {
        "number": number,
        "numberPage": number_page,
        "questionPage": question_page,
        "promptZhPage": prompt_zh_page,
        "starterPage": block[whether_index][0],
        "prompt": prompt,
        "promptZh": prompt_zh,
        "starter": "Whether:",
        "answerPartStarters": [
            {"label": "Whether", "starter": starter(block[whether_index][1], "Whether")},
            {"label": "If", "starter": starter(block[if_index][1], "If")},
        ],
    }


def parse_standard_answer(
    number: int, number_page: int, block: list[tuple[int, str]]
) -> dict[str, object]:
    answer, answer_zh, answer_page, answer_zh_page = split_bilingual(block)
    return {
        "number": number,
        "answerNumberPage": number_page,
        "answerPage": answer_page,
        "answerZhPage": answer_zh_page,
        "answer": answer,
        "answerZh": answer_zh,
    }


def parse_two_part_answer(
    number: int, number_page: int, block: list[tuple[int, str]]
) -> dict[str, object]:
    label_indexes = [
        index
        for index, (_, line) in enumerate(block)
        if line.startswith(("Whether:", "If:"))
    ]
    if len(label_indexes) != 2:
        raise ValueError(f"Answer {number}: expected Whether and If sections")
    sections = [
        block[label_indexes[0] : label_indexes[1]],
        block[label_indexes[1] :],
    ]
    parts = []
    answer_page = sections[0][0][0]
    for label, section in zip(("Whether", "If"), sections, strict=True):
        labelled_line = section[0][1]
        first_english = labelled_line.removeprefix(f"{label}:").strip()
        bilingual = [(section[0][0], first_english), *section[1:]]
        answer, answer_zh, answer_page, answer_zh_page = split_bilingual(bilingual)
        parts.append(
            {
                "label": label,
                "answer": answer,
                "answerZh": answer_zh,
                "answerPage": answer_page,
                "answerZhPage": answer_zh_page,
            }
        )
    return {
        "number": number,
        "answerNumberPage": number_page,
        "answerPage": answer_page,
        "answerParts": parts,
    }


def extract(pdf_path: Path, lesson_number: int) -> dict[str, object]:
    tokens: list[tuple[int, str]] = []
    with pdfplumber.open(pdf_path) as pdf:
        page_count = len(pdf.pages)
        for page_number, page in enumerate(pdf.pages, 1):
            text = page.extract_text(x_tolerance=2, y_tolerance=3) or ""
            tokens.extend(
                (page_number, cleaned)
                for line in text.splitlines()
                if (cleaned := clean_line(line))
            )

    exercise_index = next(
        index for index, (_, line) in enumerate(tokens) if EXERCISE_HEADING.match(line)
    )
    answer_index = next(
        index
        for index in range(exercise_index + 1, len(tokens))
        if ANSWER_HEADING.match(tokens[index][1])
    )
    question_blocks = numbered_blocks(tokens, exercise_index + 1, answer_index)
    answer_blocks = numbered_blocks(tokens, answer_index + 1, len(tokens))

    two_part = lesson_number == 32
    questions = [
        (
            parse_two_part_question(number, number_page, block)
            if two_part
            else parse_standard_question(number, number_page, block)
        )
        for number, number_page, block in question_blocks
    ]
    answers = [
        (
            parse_two_part_answer(number, number_page, block)
            if two_part
            else parse_standard_answer(number, number_page, block)
        )
        for number, number_page, block in answer_blocks
    ]

    combined = []
    for question, answer in zip(questions, answers, strict=True):
        if question["number"] != answer["number"]:
            raise ValueError("Question and answer numbering diverged")
        if two_part:
            parts = []
            for starter, answer_part in zip(
                question.pop("answerPartStarters"),
                answer["answerParts"],
                strict=True,
            ):
                parts.append({**starter, **answer_part})
            answer_text = " || ".join(
                f"{part['label']}: {part['answer']}" for part in parts
            )
            answer_zh = " || ".join(str(part["answerZh"]) for part in parts)
            combined.append(
                {
                    **question,
                    "answerNumberPage": answer["answerNumberPage"],
                    "answerPage": answer["answerPage"],
                    "answerZhPage": parts[0]["answerZhPage"],
                    "answer": answer_text,
                    "answerZh": answer_zh,
                    "answerParts": parts,
                }
            )
        else:
            combined.append({**question, **answer})

    return {
        "lessonNumber": lesson_number,
        "sourceFile": pdf_path.name,
        "pageCount": page_count,
        "exerciseHeadingPage": tokens[exercise_index][0],
        "answerHeadingPage": tokens[answer_index][0],
        "questions": combined,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--lesson", type=int, required=True)
    parser.add_argument("--output", type=Path)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    payload = extract(args.pdf, args.lesson)
    encoded = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(encoded, encoding="utf-8")
    else:
        print(encoded, end="")


if __name__ == "__main__":
    main()
