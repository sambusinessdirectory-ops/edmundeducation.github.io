#!/usr/bin/env python3
"""Build the Jayden-only dictation database migration from the published story."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'junior-quiz-review/the-last-train.json').read_text())
sentences = [s for p in data['paragraphs'] for s in p['sentences']]
assert len(sentences) == 39
def normalized(text):
    return re.sub(r'[^\w]+', ' ', text.lower()).strip()
values = ',\n'.join(
    f"  ('the-last-train-2026', {number}, '{hashlib.sha256(normalized(sentence).encode()).hexdigest()}')"
    for number, sentence in enumerate(sentences, 1)
)
sql = r"""-- Card 72: Jayden-only Last Train dictation. The static reading text is separate;
-- this stores sentence hashes and each student's submitted text, never plaintext keys.
begin;

insert into public.junior_exam_module_access(module_key, student_id)
values ('the-last-train-2026', 'df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid)
on conflict do nothing;

create table if not exists public.junior_quiz_sentence_hashes (
  module_key text not null,
  sentence_number integer not null check(sentence_number between 1 and 39),
  answer_sha256 text not null check(answer_sha256 ~ '^[0-9a-f]{64}$'),
  primary key(module_key, sentence_number)
);
create table if not exists public.junior_quiz_responses (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  module_key text not null,
  sentence_number integer not null check(sentence_number between 1 and 39),
  answer text not null check(char_length(answer) between 1 and 500),
  correct boolean not null default false,
  attempts integer not null default 1 check(attempts between 1 and 10000),
  submitted_at timestamptz not null default now(),
  primary key(student_id, module_key, sentence_number),
  foreign key(module_key, sentence_number) references public.junior_quiz_sentence_hashes(module_key, sentence_number)
);
create table if not exists public.junior_quiz_submissions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  module_key text not null,
  submitted_count integer not null check(submitted_count between 1 and 39),
  correct_count integer not null check(correct_count between 0 and 39),
  is_final boolean not null default false,
  submitted_at timestamptz not null default now()
);
create index if not exists junior_quiz_submissions_student_module_idx on public.junior_quiz_submissions(student_id,module_key,submitted_at desc);

alter table public.junior_quiz_sentence_hashes enable row level security;
alter table public.junior_quiz_responses enable row level security;
alter table public.junior_quiz_submissions enable row level security;
revoke all on public.junior_quiz_sentence_hashes, public.junior_quiz_responses, public.junior_quiz_submissions from public, anon, authenticated;

insert into public.junior_quiz_sentence_hashes(module_key,sentence_number,answer_sha256)
values
__VALUES__
on conflict(module_key,sentence_number) do update set answer_sha256=excluded.answer_sha256;

create or replace function public.junior_quiz_list_responses(p_token uuid,p_module_key text)
returns table(sentence_number integer,answer text,correct boolean,attempts integer,submitted_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
declare v_student_id uuid;
begin
  if auth.uid() is null or p_token is null or p_module_key <> 'the-last-train-2026' then
    raise exception 'Student authentication is required' using errcode='42501';
  end if;
  select session_row.student_id into v_student_id
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id=session_row.student_id
  join public.junior_exam_module_access access_row on access_row.student_id=student.id and access_row.module_key=p_module_key
  where session_row.token=p_token and session_row.expires_at>pg_catalog.now() and student.deleted_at is null
    and student.id='df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid
  limit 1;
  if v_student_id is null then raise exception 'This module is not assigned to this student' using errcode='42501'; end if;
  return query select response.sentence_number,response.answer,response.correct,response.attempts,response.submitted_at
    from public.junior_quiz_responses response
    where response.student_id=v_student_id and response.module_key=p_module_key
    order by response.sentence_number;
end;
$$;

create or replace function public.junior_quiz_submit(p_token uuid,p_module_key text,p_answers jsonb,p_final boolean default false)
returns jsonb language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_student_id uuid; v_key text; v_raw text; v_answer text; v_normalized text;
  v_number integer; v_correct boolean; v_count integer:=0; v_correct_count integer:=0;
  v_results jsonb:='{}'::jsonb;
begin
  if auth.uid() is null or p_token is null or p_module_key <> 'the-last-train-2026' then
    raise exception 'Student authentication is required' using errcode='42501';
  end if;
  if p_answers is null or pg_catalog.jsonb_typeof(p_answers)<>'object' or p_final is null
     or pg_catalog.octet_length(p_answers::text)>25000 then
    raise exception 'Invalid submission' using errcode='22023';
  end if;
  select session_row.student_id into v_student_id
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id=session_row.student_id
  join public.junior_exam_module_access access_row on access_row.student_id=student.id and access_row.module_key=p_module_key
  where session_row.token=p_token and session_row.expires_at>pg_catalog.now() and student.deleted_at is null
    and student.id='df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid
  limit 1;
  if v_student_id is null then raise exception 'This module is not assigned to this student' using errcode='42501'; end if;
  for v_key,v_raw in select item.key,item.value from pg_catalog.jsonb_each_text(p_answers) item(key,value) loop
    if v_key !~ '^[0-9]{2}$' then raise exception 'Invalid sentence number' using errcode='22023'; end if;
    v_number:=v_key::integer;
    v_answer:=pg_catalog.btrim(v_raw);
    if v_number not between 1 and 39 or pg_catalog.char_length(v_answer) not between 1 and 500 then
      raise exception 'Invalid answer' using errcode='22023';
    end if;
    v_normalized:=pg_catalog.btrim(pg_catalog.regexp_replace(pg_catalog.lower(v_answer),'[^[:alnum:]]+',' ','g'));
    select key_row.answer_sha256=pg_catalog.encode(extensions.digest(v_normalized,'sha256'),'hex')
      into v_correct from public.junior_quiz_sentence_hashes key_row
      where key_row.module_key=p_module_key and key_row.sentence_number=v_number;
    if v_correct is null then raise exception 'Sentence is not part of this module' using errcode='22023'; end if;
    insert into public.junior_quiz_responses as existing(student_id,module_key,sentence_number,answer,correct,attempts,submitted_at)
      values(v_student_id,p_module_key,v_number,v_answer,v_correct,1,pg_catalog.now())
      on conflict(student_id,module_key,sentence_number) do update
      set answer=excluded.answer,correct=existing.correct or excluded.correct,attempts=existing.attempts+1,submitted_at=excluded.submitted_at;
    v_count:=v_count+1;
    v_correct_count:=v_correct_count+case when v_correct then 1 else 0 end;
    v_results:=pg_catalog.jsonb_set(v_results,array[v_key],pg_catalog.to_jsonb(v_correct),true);
  end loop;
  if v_count=0 or (p_final and v_count<>39) then
    raise exception 'Submit at least one sentence; full submission needs all 39' using errcode='22023';
  end if;
  insert into public.junior_quiz_submissions(student_id,module_key,submitted_count,correct_count,is_final)
    values(v_student_id,p_module_key,v_count,v_correct_count,p_final);
  return pg_catalog.jsonb_build_object('submitted',v_count,'correct',v_correct_count,'final',p_final,'results',v_results);
end;
$$;

revoke all on function public.junior_quiz_list_responses(uuid,text) from public,anon,authenticated;
revoke all on function public.junior_quiz_submit(uuid,text,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.junior_quiz_list_responses(uuid,text) to authenticated;
grant execute on function public.junior_quiz_submit(uuid,text,jsonb,boolean) to authenticated;
commit;
""".replace('__VALUES__', values)
(ROOT / 'supabase-junior-quiz-review-20261013.sql').write_text(sql)
print(f'Wrote migration for {len(sentences)} sentences')
