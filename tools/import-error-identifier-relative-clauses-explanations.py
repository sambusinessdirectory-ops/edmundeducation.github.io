#!/usr/bin/env python3
"""Replace Module 4 explanations from the reviewed recuration DOCX.

Questions, answer marks, corrections and rule references remain anchored to the
existing canonical source. Only the student-facing explanation arrays change.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from docx import Document

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "course-materials/error-identifier/source/relative-clauses-400.json"
ANSWER_HEADING_RE = re.compile(r"^(\d{3})｜([✓✗])$")
QUESTION_RE = re.compile(r"^題目：\s*(.+?)\s+答案：\s*([✓✗])(?:\s+.*)?$")
RULE_RE = re.compile(r"^教師對照：\s*(RC\.\d{2}\.\d{2})$")
STEP_LABELS = (
    "把句子讀明白",
    "針對這句的錯法或疑問",
    "看同一文法點的對照",
    "下次遇到這種題怎樣自己判斷",
)


def remove_prohibited_structure(value: str) -> str:
    value = re.sub(
        r"(?:並)?不是([^。；\n]{1,180})，而是([^。；\n]{1,220})",
        r"重點在於\2，並非\1",
        value,
    )
    return value.replace("反而是", "反倒成為").replace("而是", "實際是")


def parse_explanations(docx_path: Path, canonical: dict) -> dict:
    paragraphs = [paragraph.text.strip() for paragraph in Document(docx_path).paragraphs if paragraph.text.strip()]
    try:
        part_b = next(index for index, text in enumerate(paragraphs) if text.startswith("Part B"))
    except StopIteration as error:
        raise ValueError("Part B answer section was not found") from error
    positions = [
        (index, ANSWER_HEADING_RE.match(text))
        for index, text in enumerate(paragraphs[part_b:], part_b)
        if ANSWER_HEADING_RE.match(text)
    ]
    if len(positions) != 400:
        raise ValueError(f"Expected 400 answer headings; found {len(positions)}")
    if canonical.get("questionCount") != 400 or len(canonical.get("questions", [])) != 400:
        raise ValueError("Canonical Module 4 source does not contain 400 questions")

    updated_questions = []
    for offset, (start, heading) in enumerate(positions):
        stop = positions[offset + 1][0] if offset + 1 < len(positions) else len(paragraphs)
        block = [
            line for line in paragraphs[start:stop]
            if not line.startswith(("Passage ", "Part C", "評改注意："))
        ]
        number = int(heading.group(1))
        if number != offset + 1:
            raise ValueError(f"Question sequence breaks at {number}; expected {offset + 1}")
        if len(block) != 7:
            raise ValueError(f"Question {number} has {len(block)} answer paragraphs; expected 7")
        question_match = QUESTION_RE.match(block[1])
        rule_match = RULE_RE.match(block[6])
        if not question_match or not rule_match:
            raise ValueError(f"Question {number} has an invalid answer or rule line")

        current = canonical["questions"][number - 1]
        imported_mark = "tick" if question_match.group(2) == "✓" else "cross"
        stable = {
            "sentence": question_match.group(1).strip(),
            "mark": imported_mark,
            "rule": rule_match.group(1),
        }
        for field, imported in stable.items():
            if current[field] != imported:
                raise ValueError(
                    f"Question {number} changes {field}: {current[field]!r} != {imported!r}"
                )

        steps = []
        for step_index, (line, expected_label) in enumerate(zip(block[2:6], STEP_LABELS, strict=True), 1):
            prefix = f"{expected_label}："
            if not line.startswith(prefix):
                raise ValueError(f"Question {number} has invalid explanation {step_index}: {line}")
            steps.append({
                "title": expected_label,
                "body": remove_prohibited_structure(line[len(prefix):].strip()),
            })
        updated = dict(current)
        updated["steps"] = steps
        updated_questions.append(updated)

    payload = dict(canonical)
    payload["sourceFile"] = docx_path.name
    payload["explanationStepCount"] = sum(len(question["steps"]) for question in updated_questions)
    payload["questions"] = updated_questions
    serialized = json.dumps(payload, ensure_ascii=False)
    if "Jayden" in serialized or "jayden" in serialized.lower():
        raise ValueError("Personal-name wording remains in imported content")
    if "而是" in serialized:
        raise ValueError("Prohibited Chinese sentence structure remains in imported content")
    if payload["explanationStepCount"] != 1600:
        raise ValueError("Expected exactly 1,600 explanation steps")
    return payload


def sql_literal(value: str) -> str:
    return value.replace("'", "''")


def build_migration(payload: dict) -> str:
    rows = []
    for question in payload["questions"]:
        encoded = sql_literal(json.dumps(question["steps"], ensure_ascii=False, separators=(",", ":")))
        rows.append(f"  ({question['number']}, '{encoded}'::jsonb)")
    values = ",\n".join(rows)
    return f"""-- Refresh the private Module 4 explanation arrays from the reviewed recuration.
-- Questions, answers, progress and RPC permissions remain unchanged.

with refreshed(number, steps) as (
values
{values}
)
update error_identifier_private.relative_clauses_key as answer_key
set data = jsonb_set(answer_key.data, '{{steps}}', refreshed.steps, true)
from refreshed
where answer_key.number = refreshed.number;

do $$
begin
  if (select count(*) from error_identifier_private.relative_clauses_key) <> 400
    or exists (
      select 1 from error_identifier_private.relative_clauses_key
      where jsonb_array_length(data -> 'steps') <> 4
    ) then
    raise exception 'Module 4 explanation refresh did not cover all 400 questions';
  end if;
end
$$;
"""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("docx", type=Path)
    parser.add_argument("--migration", type=Path, required=True)
    args = parser.parse_args()
    canonical = json.loads(SOURCE.read_text(encoding="utf-8"))
    payload = parse_explanations(args.docx, canonical)
    SOURCE.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    args.migration.write_text(build_migration(payload), encoding="utf-8")
    print(
        f"Refreshed {payload['questionCount']} questions with "
        f"{payload['explanationStepCount']} explanation steps"
    )


if __name__ == "__main__":
    main()
