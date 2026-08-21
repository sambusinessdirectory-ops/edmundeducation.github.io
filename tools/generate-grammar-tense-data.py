#!/usr/bin/env python3
"""Extract the 150 Tense practice questions from the teacher PDF.

Usage:
  python tools/generate-grammar-tense-data.py SOURCE.pdf grammar-tense-data.js

The generated JavaScript is the browser-facing lesson dataset. This script is
kept beside the site tests so the import can be reproduced and audited when a
revised source PDF is supplied.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import pdfplumber


PAGE_MARKER = re.compile(r"\n?===== PAGE \d+ =====\n?")
INTRO_TENSE_RANGES = (
    (1, 4, "Simple Present"),
    (5, 8, "Simple Past"),
    (9, 11, "will"),
    (12, 13, "be going to"),
    (14, 17, "Present Continuous"),
    (18, 21, "Past Continuous"),
    (22, 24, "Future Continuous"),
    (25, 29, "Present Perfect"),
    (30, 33, "Past Perfect"),
    (34, 36, "Future Perfect"),
    (37, 40, "Present Perfect Continuous"),
    (41, 43, "Past Perfect Continuous"),
    (44, 46, "Future Perfect Continuous"),
    (47, 50, "Modal Perfect"),
)


def clean_inline(value: str) -> str:
    value = value.replace("\u00a0", " ")
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"(?<=[\u3400-\u9fff]) (?=[\u3400-\u9fff])", "", value)
    return value.strip()


def clean_explanation(value: str) -> list[str]:
    lines = [clean_inline(line) for line in value.splitlines()]
    paragraphs: list[str] = []
    for line in lines:
        if not line:
            continue
        if re.match(r"^[A-Z]\.\s", line) or line == "Final learner-friendly formula map":
            break
        if paragraphs and not re.match(r"^(步驟[一二三四五六七八九十]+：|[●✓✗]|例如：|所以：|完整語塊|比較：)", line):
            previous = paragraphs[-1]
            if previous.endswith(("：", "。", "？", "！", ":", ".", "?", "!")):
                paragraphs.append(line)
            else:
                paragraphs[-1] = f"{previous} {line}"
        else:
            paragraphs.append(line)
    return [clean_inline(paragraph) for paragraph in paragraphs]


def question_parts(value: str) -> tuple[str, str]:
    match = re.search(r"【([\s\S]*?)】", value)
    if not match:
        raise ValueError(f"Missing Chinese translation in question block: {value[:120]!r}")
    prompt = clean_inline(value[: match.start()])
    translation = clean_inline(match.group(1))
    return prompt, translation


def accepted_answers(answer: str) -> list[str]:
    candidates = [clean_inline(part) for part in re.split(r"\s*/\s*", answer) if clean_inline(part)]
    expanded: list[str] = []
    for candidate in candidates:
        expanded.append(candidate)
        if "..." in candidate or "…" in candidate:
            expanded.extend([
                re.sub(r"\s*(?:\.\.\.|…)\s*", " ", candidate),
                re.sub(r"\s*(?:\.\.\.|…)\s*", " / ", candidate),
            ])
    unique: list[str] = []
    for candidate in expanded:
        candidate = clean_inline(candidate)
        if candidate and candidate.casefold() not in {item.casefold() for item in unique}:
            unique.append(candidate)
    return unique


def introductory_tense(number: int) -> str:
    return next(label for start, end, label in INTRO_TENSE_RANGES if start <= number <= end)


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("Expected SOURCE.pdf and OUTPUT.js")

    source = Path(sys.argv[1]).expanduser().resolve()
    output = Path(sys.argv[2]).expanduser().resolve()

    with pdfplumber.open(source) as document:
        pages = [page.extract_text(x_tolerance=2, y_tolerance=3) or "" for page in document.pages]
    raw = "\n".join(pages).replace("\r", "")

    questions: list[dict[str, object]] = []

    # Questions 1–50: each prompt is immediately followed by its answer and
    # step-by-step explanation.
    first_half = raw[: raw.index("Final learner-friendly formula map")]
    positions: dict[int, int] = {}
    cursor = 0
    for number in range(1, 51):
        match = re.search(rf"(?m)^{number}\.\s", first_half[cursor:])
        if not match:
            raise ValueError(f"Could not locate question {number}")
        positions[number] = cursor + match.start()
        cursor = cursor + match.end()

    for number in range(1, 51):
        start = positions[number]
        end = positions.get(number + 1, len(first_half))
        block = first_half[start:end]
        block = re.sub(rf"(?m)^{number}\.\s*", "", block, count=1)
        if "答案：" not in block:
            raise ValueError(f"Missing answer for question {number}")
        prompt_block, answer_block = block.split("答案：", 1)
        answer_line, _, explanation_block = answer_block.partition("\n")
        prompt, translation = question_parts(prompt_block)
        answer = clean_inline(answer_line)
        questions.append({
            "id": f"tense-{number:03d}",
            "number": number,
            "prompt": prompt,
            "translation": translation,
            "answer": answer,
            "acceptedAnswers": accepted_answers(answer),
            "tense": introductory_tense(number),
            "explanation": clean_explanation(explanation_block),
        })

    # Questions 51–150: prompts are grouped first, then the answer-and-analysis
    # section follows.
    question_bank = raw[raw.index("Questions 51–75") : raw.index("Part B — 答案及公式化解析")]
    answer_bank = raw[raw.index("Part B — 答案及公式化解析") :]

    prompt_positions: dict[int, int] = {}
    cursor = 0
    for number in range(51, 151):
        match = re.search(rf"(?m)^{number}\s*$", question_bank[cursor:])
        if not match:
            raise ValueError(f"Could not locate bank question {number}")
        prompt_positions[number] = cursor + match.start()
        cursor = cursor + match.end()

    answer_positions: dict[int, tuple[int, str, str, int]] = {}
    cursor = 0
    for number in range(51, 151):
        match = re.search(rf"(?m)^{number}\.\s*(.*?)\s+—\s+([^\n]+)\n", answer_bank[cursor:])
        if not match:
            raise ValueError(f"Could not locate bank answer {number}")
        absolute = cursor + match.start()
        answer_positions[number] = (absolute, clean_inline(match.group(1)), clean_inline(match.group(2)), cursor + match.end())
        cursor = cursor + match.end()

    for number in range(51, 151):
        prompt_start = prompt_positions[number]
        prompt_end = prompt_positions.get(number + 1, len(question_bank))
        prompt_block = question_bank[prompt_start:prompt_end]
        prompt_block = re.sub(rf"(?m)^{number}\s*$", "", prompt_block, count=1)
        prompt, translation = question_parts(prompt_block)

        answer_start, answer, tense, explanation_start = answer_positions[number]
        # The source labels Q105 as "Future Perfect" even though both its
        # answer (will have been studying) and formula are continuous. Keep
        # the source answer verbatim while correcting the lesson label.
        if number == 105:
            tense = "Future Perfect Continuous"
        answer_end = answer_positions.get(number + 1, (len(answer_bank), "", "", 0))[0]
        explanation_block = answer_bank[explanation_start:answer_end]
        questions.append({
            "id": f"tense-{number:03d}",
            "number": number,
            "prompt": prompt,
            "translation": translation,
            "answer": answer,
            "acceptedAnswers": accepted_answers(answer),
            "tense": tense,
            "explanation": clean_explanation(explanation_block),
        })

    if [item["number"] for item in questions] != list(range(1, 151)):
        raise ValueError("Question numbering is incomplete or out of order")
    for item in questions:
        if not item["prompt"] or not item["translation"] or not item["answer"] or not item["explanation"]:
            raise ValueError(f"Question {item['number']} has an empty required field")

    payload = json.dumps(questions, ensure_ascii=False, indent=2)
    output.write_text(
        "// Generated from Grammar Practice 1 - Tense.pdf.\n"
        "// Run tools/generate-grammar-tense-data.py to rebuild this file.\n"
        f"window.EDMUND_GRAMMAR_TENSE_QUESTIONS = Object.freeze({payload});\n",
        encoding="utf-8",
    )
    print(f"Generated {len(questions)} questions at {output}")


if __name__ == "__main__":
    main()
