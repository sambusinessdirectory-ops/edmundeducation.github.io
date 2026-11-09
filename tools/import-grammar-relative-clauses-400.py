#!/usr/bin/env python3
"""Normalize the reviewed 400-question Relative Clauses DOCX into repository JSON.

This is an intake tool, not a production dependency. The generated JSON is the
canonical, reviewable source consumed by build-grammar-relative-clauses.py.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from docx import Document

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = ROOT / "course-materials/grammar/source/relative-clauses-practice-400.json"

QUESTION_RE = re.compile(r"^第\s*(\d+)\s*題｜(.+)$")
UNIT_RE = re.compile(r"^單元\s*(\d+)｜(.+?)（(\d+)\s*題）$")
TOPIC_RE = re.compile(r"^對應課節：\s*(RC\.\d{2}\.\d{2})\s*[—-]\s*(.+)$")
STEP_RE = re.compile(r"^步驟([一二三四五六七])：([^\s]+(?:\s*[^\s]+)*?)\s{2,}(.+)$")


def after_label(value: str, label: str) -> str:
    if not value.startswith(label):
        raise ValueError(f"Expected {label!r}; got {value!r}")
    return value[len(label):].strip()


def normalize_prompt(value: str) -> str:
    """Put the task instruction and its exercise sentence on separate lines."""
    lines = [part.strip() for part in value.splitlines() if part.strip()]
    if lines and ":" in lines[0]:
        instruction, exercise = lines[0].split(":", 1)
        if instruction.strip() and exercise.strip():
            lines[:1] = [f"{instruction.strip()}:", exercise.strip()]
    return "\n".join(lines)


def parse_questions(docx_path: Path) -> dict:
    paragraphs = [paragraph.text.strip() for paragraph in Document(docx_path).paragraphs if paragraph.text.strip()]
    question_positions = [(index, QUESTION_RE.match(text)) for index, text in enumerate(paragraphs) if QUESTION_RE.match(text)]
    if len(question_positions) != 400:
        raise ValueError(f"Expected 400 questions; found {len(question_positions)}")

    units = []
    active_unit = None
    unit_by_position = {}
    for index, text in enumerate(paragraphs):
        unit_match = UNIT_RE.match(text)
        if unit_match:
            active_unit = {
                "number": int(unit_match.group(1)),
                "title": unit_match.group(2).strip(),
                "declaredQuestionCount": int(unit_match.group(3)),
            }
            units.append(active_unit)
        unit_by_position[index] = active_unit
    if len(units) != 16:
        raise ValueError(f"Expected 16 units; found {len(units)}")

    questions = []
    for offset, (start, heading_match) in enumerate(question_positions):
        stop = question_positions[offset + 1][0] if offset + 1 < len(question_positions) else len(paragraphs)
        block = paragraphs[start:stop]
        # A unit heading may occur after a question's final step and belongs to the next question.
        block = [line for line in block if not UNIT_RE.match(line)]
        number = int(heading_match.group(1))
        if number != offset + 1:
            raise ValueError(f"Question sequence breaks at {number}; expected {offset + 1}")
        topic_match = TOPIC_RE.match(block[1])
        if not topic_match:
            raise ValueError(f"Question {number} has invalid topic line: {block[1]}")
        chinese_index = next((index for index, line in enumerate(block) if line.startswith("中文情境：")), -1)
        answer_index = next((index for index, line in enumerate(block) if line.startswith("參考答案：")), -1)
        explanation_index = next((index for index, line in enumerate(block) if line == "本題完整解析"), -1)
        if min(chinese_index, answer_index, explanation_index) < 0:
            raise ValueError(f"Question {number} is missing a required labelled field")
        if explanation_index + 8 != len(block):
            raise ValueError(f"Question {number} is missing the explanation heading")
        steps = []
        for step_index, line in enumerate(block[explanation_index + 1:], 1):
            match = STEP_RE.match(line)
            if not match:
                raise ValueError(f"Question {number} has invalid step {step_index}: {line}")
            steps.append({"title": f"步驟{match.group(1)}：{match.group(2).strip()}", "body": match.group(3).strip()})
        unit = unit_by_position[start]
        if not unit:
            raise ValueError(f"Question {number} is not assigned to a unit")
        questions.append({
            "sourceNumber": number,
            "type": heading_match.group(2).strip(),
            "unit": unit["number"],
            "unitTitle": unit["title"],
            "topic": topic_match.group(1),
            "ruleTitle": topic_match.group(2).strip(),
            "prompt": normalize_prompt("\n".join([
                after_label(block[2], "英文題目："),
                *block[3:chinese_index],
            ])),
            "translation": after_label(block[chinese_index], "中文情境："),
            "answer": after_label(block[answer_index], "參考答案："),
            "steps": steps,
        })

    for unit in units:
        actual = sum(question["unit"] == unit["number"] for question in questions)
        if actual != unit["declaredQuestionCount"]:
            raise ValueError(f"Unit {unit['number']} declares {unit['declaredQuestionCount']} questions but contains {actual}")
    if sum(len(question["steps"]) for question in questions) != 2800:
        raise ValueError("Expected exactly 2,800 explanation steps")
    return {
        "sourceTitle": paragraphs[0],
        "sourceFile": docx_path.name,
        "unitCount": len(units),
        "questionCount": len(questions),
        "explanationStepCount": sum(len(question["steps"]) for question in questions),
        "units": units,
        "questions": questions,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("docx", type=Path)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    payload = parse_questions(args.docx)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Imported {payload['questionCount']} questions and {payload['explanationStepCount']} steps to {args.output}")


if __name__ == "__main__":
    main()
