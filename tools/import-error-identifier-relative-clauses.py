#!/usr/bin/env python3
"""Import the reviewed Relative Clauses proofreading PDF text.

The PDF is first converted to text outside this script.  This importer keeps the
browser question list answer-free, writes a reviewable canonical JSON source,
and creates the private Supabase answer-key migration used for submit-and-reveal.
"""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_OUTPUT = ROOT / "course-materials/error-identifier/source/relative-clauses-400.json"
QUESTIONS_OUTPUT = ROOT / "error-identifier-relative-clauses-questions.js"

HEADING_RE = re.compile(r"(?m)^(\d{3})\s*\|\s*([✓✗])\s*$")
STEP_RE = re.compile(r"(?m)^\s*([1-6])\.\s*")
RULE_RE = re.compile(r"規則索引:\s*(RC\.\d{2}\.\d{2})")


def compact(value: str) -> str:
    value = " ".join(value.replace("\x0c", " ").split()).strip()
    return value.replace("完整正確 句:", "完整正確句:")


def remove_prohibited_structure(value: str) -> str:
    """Apply the requested polished-Chinese rewrite to the repeated template."""
    value = re.sub(
        r"關鍵不是整句全部重寫,而是只處理 (.+?) 這一處;",
        r"只須處理 \1 這一處,不必重寫整句;",
        value,
    )
    return value


def parse_text(text_path: Path) -> dict:
    text = unicodedata.normalize("NFKC", text_path.read_text(encoding="utf-8"))
    if "Part B" not in text:
        raise ValueError("Part B answer section was not found")
    exercises = list(re.finditer(r"(?ms)^(\d{3})\.\s+(.+?)\n\s*□", text[:text.index("Part B")]))
    if len(exercises) != 400:
        raise ValueError(f"Expected 400 student exercises; found {len(exercises)}")
    exercise_sentences = {int(match.group(1)): compact(match.group(2)) for match in exercises}
    answers = text[text.index("Part B"):]
    headings = list(HEADING_RE.finditer(answers))
    if len(headings) != 400:
        raise ValueError(f"Expected 400 answer headings; found {len(headings)}")

    questions = []
    for offset, heading in enumerate(headings):
        stop = headings[offset + 1].start() if offset + 1 < len(headings) else len(answers)
        block = answers[heading.end():stop].replace("\x0c", "\n")
        number = int(heading.group(1))
        mark = "tick" if heading.group(2) == "✓" else "cross"
        if number != offset + 1:
            raise ValueError(f"Question sequence breaks at {number}; expected {offset + 1}")

        step_matches = list(STEP_RE.finditer(block))
        if len(step_matches) != 6:
            raise ValueError(f"Question {number} has {len(step_matches)} explanation steps")
        header = compact(block[:step_matches[0].start()])
        header_match = re.fullmatch(r"題目:\s*(.+?)\s+答案:\s*([✓✗])\s*(.*)", header)
        if not header_match:
            raise ValueError(f"Question {number} has an invalid answer heading: {header!r}")
        sentence = header_match.group(1).strip()
        if exercise_sentences.get(number) != sentence:
            raise ValueError(f"Question {number} differs between the exercise and answer sections")
        if header_match.group(2) != heading.group(2):
            raise ValueError(f"Question {number} answer marks disagree")

        tail = header_match.group(3).strip()
        if mark == "tick":
            if not re.fullmatch(r"\(不需要\s*改\)", tail):
                raise ValueError(f"Question {number} has an unexpected correct-answer label: {tail!r}")
            wrong = fix = ""
            correct_sentence = sentence
        else:
            correction = re.fullmatch(r";\s*(.+?)\s*→\s*(.+?)\s+完\s*整\s*正\s*確\s*句:\s*(.+)", tail)
            if not correction:
                raise ValueError(f"Question {number} has an invalid correction: {tail!r}")
            wrong, fix, correct_sentence = (part.strip() for part in correction.groups())

        steps = []
        for index, step_match in enumerate(step_matches):
            step_stop = step_matches[index + 1].start() if index + 1 < len(step_matches) else len(block)
            body = compact(block[step_match.end():step_stop])
            if index == 5:
                body = RULE_RE.sub("", body).strip()
            body = remove_prohibited_structure(body)
            title_match = re.match(r"([^:]+):\s*(.*)", body)
            if not title_match:
                raise ValueError(f"Question {number} step {index + 1} has no title")
            steps.append({"title": title_match.group(1).strip(), "body": title_match.group(2).strip()})

        rule_matches = RULE_RE.findall(block)
        if len(rule_matches) != 1:
            raise ValueError(f"Question {number} has {len(rule_matches)} rule references")
        questions.append({
            "number": number,
            "set": (number - 1) // 20 + 1,
            "sentence": sentence,
            "mark": mark,
            "wrong": wrong,
            "fix": fix,
            "correct_sentence": correct_sentence,
            "rule": rule_matches[0],
            "steps": steps,
        })

    payload = {
        "sourceTitle": "Relative Clauses — 400 Proofreading Exercises",
        "questionCount": len(questions),
        "setCount": 20,
        "explanationStepCount": sum(len(question["steps"]) for question in questions),
        "questions": questions,
    }
    serialized = json.dumps(payload, ensure_ascii=False)
    if "Jayden" in serialized or "jayden" in serialized.lower():
        raise ValueError("Personal-name wording remains in imported content")
    if "而是" in serialized:
        raise ValueError("Prohibited Chinese sentence structure remains in imported content")
    if payload["explanationStepCount"] != 2400:
        raise ValueError("Expected exactly 2,400 explanation steps")
    return payload


def sql_literal(value: str) -> str:
    return value.replace("'", "''")


def build_migration(payload: dict) -> str:
    rows = []
    for question in payload["questions"]:
        encoded = sql_literal(json.dumps(question, ensure_ascii=False, separators=(",", ":")))
        rows.append(f"  ({question['number']}, '{encoded}'::jsonb)")
    values = ",\n".join(rows)
    return f"""-- Private answer key and per-student progress for Error Identifier Module 4.
-- Browser assets contain questions only; answers are revealed after submission.

create table error_identifier_private.relative_clauses_key (
  number integer primary key check (number between 1 and 400),
  data jsonb not null
);

create table error_identifier_private.relative_clauses_progress (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  number integer not null references error_identifier_private.relative_clauses_key(number),
  answer jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (student_id, number)
);

alter table error_identifier_private.relative_clauses_key enable row level security;
alter table error_identifier_private.relative_clauses_progress enable row level security;
revoke all on error_identifier_private.relative_clauses_key,
  error_identifier_private.relative_clauses_progress from public, anon, authenticated;

insert into error_identifier_private.relative_clauses_key(number, data) values
{values};

create function error_identifier_private.error_identifier_relative_clauses_action(
  p_token uuid,
  p_number integer default null,
  p_answer jsonb default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_mark text;
  v_answer jsonb;
  v_result jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then
    raise exception 'Student session expired' using errcode = '42501';
  end if;
  if p_answer is not null then
    if p_number is null or p_number not between 1 and 400
      or jsonb_typeof(p_answer) <> 'object' or pg_column_size(p_answer) > 4000 then
      raise exception 'Invalid answer';
    end if;
    v_mark := coalesce(p_answer ->> 'mark', '');
    if v_mark not in ('tick', 'cross') then raise exception 'Invalid answer'; end if;
    if v_mark = 'cross' and (
      length(trim(coalesce(p_answer ->> 'wrong', ''))) = 0
      or length(trim(coalesce(p_answer ->> 'fix', ''))) = 0
      or length(p_answer ->> 'wrong') > 180
      or length(p_answer ->> 'fix') > 180
    ) then raise exception 'Complete the correction'; end if;
    v_answer := jsonb_build_object(
      'mark', v_mark,
      'wrong', case when v_mark = 'cross' then trim(p_answer ->> 'wrong') else '' end,
      'fix', case when v_mark = 'cross' then trim(p_answer ->> 'fix') else '' end
    );
    insert into error_identifier_private.relative_clauses_progress(student_id, number, answer)
    values (v_student_id, p_number, v_answer)
    on conflict (student_id, number) do update
      set answer = excluded.answer, updated_at = now();
  end if;
  select jsonb_build_object(
    'answers', coalesce(jsonb_object_agg(progress.number::text, progress.answer), '{{}}'::jsonb),
    'feedback', coalesce(jsonb_object_agg(progress.number::text, answer_key.data), '{{}}'::jsonb)
  ) into v_result
  from error_identifier_private.relative_clauses_progress as progress
  join error_identifier_private.relative_clauses_key as answer_key using (number)
  where progress.student_id = v_student_id;
  return v_result;
end
$$;

revoke all on function error_identifier_private.error_identifier_relative_clauses_action(uuid, integer, jsonb)
from public, anon;
grant execute on function error_identifier_private.error_identifier_relative_clauses_action(uuid, integer, jsonb)
to authenticated;

create function public.error_identifier_relative_clauses_action(
  p_token uuid,
  p_number integer default null,
  p_answer jsonb default null
) returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select error_identifier_private.error_identifier_relative_clauses_action(p_token, p_number, p_answer)
$$;

revoke all on function public.error_identifier_relative_clauses_action(uuid, integer, jsonb)
from public, anon;
grant execute on function public.error_identifier_relative_clauses_action(uuid, integer, jsonb)
to authenticated;

create or replace function error_identifier_private.error_identifier_admin_answers(
  p_token uuid,
  p_logout boolean default false
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists(
    select 1 from public.error_identifier_admin_sessions
    where token = p_token and auth_id = auth.uid() and expires_at > now()
  ) then raise exception 'Admin session expired' using errcode = '42501'; end if;
  if p_logout then
    delete from public.error_identifier_admin_sessions where token = p_token;
    return '{{}}'::jsonb;
  end if;
  return jsonb_build_object(
    'single', (select jsonb_agg(to_jsonb(k) order by question_no) from public.error_identifier_answer_key k),
    'passages', (select jsonb_agg(to_jsonb(k) order by passage_id, line_no) from public.error_identifier_passage_answer_key k),
    'jayden', (select jsonb_agg(data order by number) from public.error_identifier_jayden_key),
    'indefinite', (select jsonb_agg(data order by number) from error_identifier_private.indefinite_pronouns_key),
    'relative_clauses', (select jsonb_agg(data order by number) from error_identifier_private.relative_clauses_key)
  );
end
$$;

-- Remove the personal name from the one legacy Module 3 reference record too.
update public.error_identifier_jayden_key
set data = jsonb_set(
  jsonb_set(data, '{{sentence}}', to_jsonb('The student wants to study at an university overseas.'::text)),
  '{{correct_sentence}}',
  to_jsonb('The student wants to study at a university overseas.'::text)
)
where number = 273;
"""


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("text", type=Path, help="Text extracted from the reviewed PDF")
    parser.add_argument("--migration", type=Path, required=True)
    args = parser.parse_args()
    payload = parse_text(args.text)
    SOURCE_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    SOURCE_OUTPUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    public_questions = [
        {"number": q["number"], "sentence": q["sentence"], "paper": q["set"]}
        for q in payload["questions"]
    ]
    QUESTIONS_OUTPUT.write_text(
        "window.ERROR_IDENTIFIER_RELATIVE_CLAUSES_QUESTIONS = "
        + json.dumps(public_questions, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    args.migration.write_text(build_migration(payload), encoding="utf-8")
    print(
        f"Imported {payload['questionCount']} questions and "
        f"{payload['explanationStepCount']} explanation steps"
    )


if __name__ == "__main__":
    main()
