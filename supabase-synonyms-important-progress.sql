-- Account-scoped progress for the first Synonyms module.
-- The public table is not directly exposed; students use token-checked RPCs.
begin;

create table if not exists public.synonyms_important_answers (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  question_key text not null check (question_key ~ '^([1-9]|1[0-4])-[12]$'),
  attempts integer not null check (attempts between 1 and 10000),
  mastered boolean not null default false,
  last_choice text not null check (last_choice ~ '^[A-F]$'),
  last_correct boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (student_id, question_key)
);

alter table public.synonyms_important_answers enable row level security;
revoke all on public.synonyms_important_answers from public, anon, authenticated;

create or replace function public.synonyms_important_list(p_token uuid)
returns table(question_key text, attempts integer, mastered boolean, last_choice text, last_correct boolean, updated_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
declare v_student_id uuid;
begin
  if auth.uid() is null or p_token is null then
    raise exception 'Student authentication is required' using errcode = '42501';
  end if;
  select s.student_id into v_student_id
  from public.flashcard_student_sessions s
  join public.flashcard_students student on student.id = s.student_id
  where s.token = p_token and s.expires_at > pg_catalog.now() and student.deleted_at is null
  limit 1;
  if v_student_id is null then
    raise exception 'Student session is invalid or expired' using errcode = '42501';
  end if;
  return query
  select a.question_key, a.attempts, a.mastered, a.last_choice, a.last_correct, a.updated_at
  from public.synonyms_important_answers a where a.student_id = v_student_id order by a.question_key;
end;
$$;

create or replace function public.synonyms_important_record(
  p_token uuid, p_question_key text, p_attempts integer, p_mastered boolean,
  p_last_choice text, p_last_correct boolean
)
returns table(question_key text, attempts integer, mastered boolean, last_choice text, last_correct boolean, updated_at timestamptz)
language plpgsql volatile security definer set search_path = ''
as $$
declare v_student_id uuid;
begin
  if auth.uid() is null or p_token is null then
    raise exception 'Student authentication is required' using errcode = '42501';
  end if;
  if p_question_key is null or p_question_key !~ '^([1-9]|1[0-4])-[12]$'
     or p_attempts is null or p_attempts not between 1 and 10000
     or p_mastered is null or p_last_correct is null
     or p_last_choice is null or p_last_choice !~ '^[A-F]$' then
    raise exception 'Invalid Synonyms answer' using errcode = '22023';
  end if;
  select s.student_id into v_student_id
  from public.flashcard_student_sessions s
  join public.flashcard_students student on student.id = s.student_id
  where s.token = p_token and s.expires_at > pg_catalog.now() and student.deleted_at is null
  limit 1;
  if v_student_id is null then
    raise exception 'Student session is invalid or expired' using errcode = '42501';
  end if;

  insert into public.synonyms_important_answers as saved
    (student_id, question_key, attempts, mastered, last_choice, last_correct, updated_at)
  values (v_student_id, p_question_key, p_attempts, p_mastered, p_last_choice, p_last_correct, pg_catalog.now())
  on conflict (student_id, question_key) do update set
    attempts = greatest(saved.attempts, excluded.attempts),
    mastered = saved.mastered or excluded.mastered,
    last_choice = case when excluded.attempts >= saved.attempts then excluded.last_choice else saved.last_choice end,
    last_correct = case when excluded.attempts >= saved.attempts then excluded.last_correct else saved.last_correct end,
    updated_at = case when excluded.attempts >= saved.attempts then pg_catalog.now() else saved.updated_at end;

  insert into public.learning_portal_progress_events
    (student_id, system_key, event_key, activity_count, duration_ms, occurred_at)
  values (v_student_id, 'synonyms', 'important:' || p_question_key, 1, 0, pg_catalog.now())
  on conflict (student_id, system_key, event_key) do nothing;

  return query
  select a.question_key, a.attempts, a.mastered, a.last_choice, a.last_correct, a.updated_at
  from public.synonyms_important_answers a where a.student_id = v_student_id and a.question_key = p_question_key;
end;
$$;

revoke all on function public.synonyms_important_list(uuid) from public, anon, authenticated;
revoke all on function public.synonyms_important_record(uuid,text,integer,boolean,text,boolean) from public, anon, authenticated;
grant execute on function public.synonyms_important_list(uuid) to authenticated;
grant execute on function public.synonyms_important_record(uuid,text,integer,boolean,text,boolean) to authenticated;
notify pgrst, 'reload schema';
commit;
