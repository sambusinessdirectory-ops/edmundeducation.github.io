#!/usr/bin/env python3
"""Build the restricted S2 submission schema from the imported answer key."""
from hashlib import sha256
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
answers = json.loads(Path('/tmp/s2-oct-2026-answer-key.json').read_text())
if len(answers) != 470 or set(answers) != {str(i) for i in range(1, 471)}:
    raise ValueError('The complete 470-answer key is required')

rows = ',\n'.join(
    f"  ('s2-exam-prep-oct-2026', {number}, '{sha256(' '.join(answers[str(number)].casefold().split()).encode()).hexdigest()}')"
    for number in range(1, 471)
)
sql = r"""-- S2 Exam Prep: Jayden-only module; student-token-scoped submissions.
-- The question sentences are static site assets; only SHA-256 answer hashes live here.
begin;

create table if not exists public.junior_exam_module_access (
  module_key text not null,
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (module_key, student_id)
);
create table if not exists public.junior_exam_answer_hashes (
  module_key text not null,
  question_number integer not null check (question_number between 1 and 470),
  answer_sha256 text not null check (answer_sha256 ~ '^[0-9a-f]{64}$'),
  primary key (module_key, question_number)
);
create table if not exists public.junior_exam_responses (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  module_key text not null,
  question_number integer not null check (question_number between 1 and 470),
  answer text not null check (char_length(answer) between 1 and 100),
  correct boolean not null,
  submitted_at timestamptz not null default now(),
  primary key (student_id, module_key, question_number),
  foreign key (module_key, question_number) references public.junior_exam_answer_hashes(module_key, question_number)
);
create table if not exists public.junior_exam_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  module_key text not null,
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  submitted_count integer not null check (submitted_count between 1 and 470),
  correct_count integer not null check (correct_count between 0 and 470),
  is_final boolean not null default false,
  submitted_at timestamptz not null default now()
);
create index if not exists junior_exam_submissions_student_module_date_idx
  on public.junior_exam_submissions(student_id, module_key, submitted_at desc);

alter table public.junior_exam_module_access enable row level security;
alter table public.junior_exam_answer_hashes enable row level security;
alter table public.junior_exam_responses enable row level security;
alter table public.junior_exam_submissions enable row level security;
revoke all on public.junior_exam_module_access, public.junior_exam_answer_hashes,
  public.junior_exam_responses, public.junior_exam_submissions from public, anon, authenticated;

insert into public.junior_exam_module_access(module_key, student_id)
values ('s2-exam-prep-oct-2026', 'df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid)
on conflict do nothing;

insert into public.junior_exam_answer_hashes(module_key, question_number, answer_sha256)
values
__ANSWER_ROWS__
on conflict (module_key, question_number) do update set answer_sha256 = excluded.answer_sha256;

create or replace function public.junior_exam_list_responses(p_token uuid, p_module_key text)
returns table(question_number integer, answer text, correct boolean, submitted_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
declare v_student_id uuid;
begin
  if auth.uid() is null or p_token is null or p_module_key is null then
    raise exception 'Student authentication is required' using errcode = '42501';
  end if;
  select session_row.student_id into v_student_id
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id = session_row.student_id
  join public.junior_exam_module_access access_row
    on access_row.student_id = student.id and access_row.module_key = p_module_key
  where session_row.token = p_token and session_row.expires_at > pg_catalog.now()
    and student.deleted_at is null
  limit 1;
  if v_student_id is null then
    raise exception 'This exam module is not assigned to this student' using errcode = '42501';
  end if;
  return query
    select response.question_number, response.answer, response.correct, response.submitted_at
    from public.junior_exam_responses response
    where response.student_id = v_student_id and response.module_key = p_module_key
    order by response.question_number;
end;
$$;

create or replace function public.junior_exam_submit(
  p_token uuid, p_module_key text, p_answers jsonb, p_final boolean default false
) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_student_id uuid;
  v_key text;
  v_raw text;
  v_answer text;
  v_number integer;
  v_correct boolean;
  v_count integer := 0;
  v_correct_count integer := 0;
  v_results jsonb := '{}'::jsonb;
  v_saved jsonb := '{}'::jsonb;
  v_submission_id uuid;
begin
  if auth.uid() is null or p_token is null or p_module_key is null then
    raise exception 'Student authentication is required' using errcode = '42501';
  end if;
  if p_answers is null or pg_catalog.jsonb_typeof(p_answers) <> 'object'
    or p_final is null or pg_catalog.octet_length(p_answers::text) > 100000 then
    raise exception 'Invalid submission' using errcode = '22023';
  end if;
  select session_row.student_id into v_student_id
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id = session_row.student_id
  join public.junior_exam_module_access access_row
    on access_row.student_id = student.id and access_row.module_key = p_module_key
  where session_row.token = p_token and session_row.expires_at > pg_catalog.now()
    and student.deleted_at is null
  limit 1;
  if v_student_id is null then
    raise exception 'This exam module is not assigned to this student' using errcode = '42501';
  end if;

  for v_key, v_raw in select item.key, item.value
    from pg_catalog.jsonb_each_text(p_answers) item(key, value)
  loop
    if v_key !~ '^[0-9]{3}$' then
      raise exception 'Invalid question number' using errcode = '22023';
    end if;
    v_number := v_key::integer;
    v_answer := pg_catalog.btrim(pg_catalog.regexp_replace(v_raw, '[[:space:]]+', ' ', 'g'));
    if v_number not between 1 and 470 or pg_catalog.char_length(v_answer) not between 1 and 100 then
      raise exception 'Invalid answer' using errcode = '22023';
    end if;
    select key_row.answer_sha256 = pg_catalog.encode(extensions.digest(pg_catalog.lower(v_answer), 'sha256'), 'hex')
      into v_correct from public.junior_exam_answer_hashes key_row
      where key_row.module_key = p_module_key and key_row.question_number = v_number;
    if v_correct is null then
      raise exception 'Question is not part of this module' using errcode = '22023';
    end if;
    insert into public.junior_exam_responses as existing
      (student_id, module_key, question_number, answer, correct, submitted_at)
    values (v_student_id, p_module_key, v_number, v_answer, v_correct, pg_catalog.now())
    on conflict (student_id, module_key, question_number) do update
      set answer = excluded.answer, correct = excluded.correct, submitted_at = excluded.submitted_at;
    v_count := v_count + 1;
    v_correct_count := v_correct_count + case when v_correct then 1 else 0 end;
    v_results := pg_catalog.jsonb_set(v_results, array[v_key], pg_catalog.to_jsonb(v_correct), true);
    v_saved := pg_catalog.jsonb_set(v_saved, array[v_key], pg_catalog.to_jsonb(v_answer), true);
  end loop;
  if v_count = 0 or (p_final and v_count <> 470) then
    raise exception 'Submit at least one answer; a final submission needs all 470' using errcode = '22023';
  end if;
  insert into public.junior_exam_submissions
    (student_id, module_key, answers, submitted_count, correct_count, is_final)
  values (v_student_id, p_module_key, v_saved, v_count, v_correct_count, p_final)
  returning id into v_submission_id;
  return pg_catalog.jsonb_build_object(
    'submissionId', v_submission_id, 'submitted', v_count,
    'correct', v_correct_count, 'final', p_final, 'results', v_results
  );
end;
$$;

revoke all on function public.junior_exam_list_responses(uuid, text) from public, anon, authenticated;
revoke all on function public.junior_exam_submit(uuid, text, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.junior_exam_list_responses(uuid, text) to authenticated;
grant execute on function public.junior_exam_submit(uuid, text, jsonb, boolean) to authenticated;
commit;
"""
target = ROOT / 'supabase-junior-exam-prep-20261012.sql'
target.write_text(sql.replace('__ANSWER_ROWS__', rows))
print(f'Wrote {target.name} with {len(answers)} hashed answer rows')
