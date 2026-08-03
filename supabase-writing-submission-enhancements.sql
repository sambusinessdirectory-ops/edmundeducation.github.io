-- Writing Submission release enhancements: persistent grammar-detection
-- preference, composition timing/progress, and recoverable student deletion.
--
-- Apply after supabase-writing-submission.sql. Existing submissions remain
-- visible, start with a recorded duration of zero, and are never physically
-- removed when a student deletes an article from their archive.

begin;

alter table public.writing_submissions
  add column if not exists duration_seconds integer not null default 0;

alter table public.writing_submissions
  add column if not exists deleted_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.writing_submissions'::regclass
      and conname = 'writing_submissions_duration_seconds_check'
  ) then
    alter table public.writing_submissions
      add constraint writing_submissions_duration_seconds_check
      check (duration_seconds between 0 and 31536000);
  end if;
end;
$$;

create index if not exists writing_submissions_student_visible_history_idx
  on public.writing_submissions (student_id, submitted_at desc, id desc)
  where deleted_at is null;

create table if not exists public.writing_submission_preferences (
  student_id uuid primary key
    references public.flashcard_students(id) on delete cascade,
  grammar_detection_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.writing_submission_preferences enable row level security;
revoke all on table public.writing_submission_preferences from public, anon, authenticated;

create or replace function public.writing_submission_preferences_get(p_student_id uuid)
returns table (grammar_detection_enabled boolean, updated_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(preference.grammar_detection_enabled, true),
         preference.updated_at
  from (select 1) seed
  left join public.writing_submission_preferences preference
    on preference.student_id = p_student_id
  where exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  );
$$;

create or replace function public.writing_submission_preferences_set(
  p_student_id uuid,
  p_grammar_detection_enabled boolean
)
returns table (grammar_detection_enabled boolean, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_grammar_detection_enabled is null or not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    raise exception 'Invalid writing preference' using errcode = '22023';
  end if;

  insert into public.writing_submission_preferences (
    student_id, grammar_detection_enabled, updated_at
  ) values (
    p_student_id, p_grammar_detection_enabled, clock_timestamp()
  )
  on conflict (student_id) do update
  set grammar_detection_enabled = excluded.grammar_detection_enabled,
      updated_at = excluded.updated_at;

  return query
  select preference.grammar_detection_enabled, preference.updated_at
  from public.writing_submission_preferences preference
  where preference.student_id = p_student_id;
end;
$$;

create or replace function public.writing_submission_submit_v2(
  p_id uuid,
  p_student_id uuid,
  p_topic text,
  p_answer text,
  p_word_count integer,
  p_duration_seconds integer
)
returns table (
  id uuid,
  topic text,
  answer text,
  word_count integer,
  duration_seconds integer,
  submitted_at timestamptz,
  deleted_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_base record;
  v_existing_duration integer;
begin
  if p_duration_seconds is null or p_duration_seconds not between 0 and 31536000 then
    raise exception 'Invalid writing duration' using errcode = '22023';
  end if;

  select * into v_base
  from public.writing_submission_submit(
    p_id,
    p_student_id,
    p_topic,
    p_answer,
    p_word_count
  );

  if not found then return; end if;

  select submission.duration_seconds into v_existing_duration
  from public.writing_submissions submission
  where submission.id = p_id and submission.student_id = p_student_id
  for update;

  if v_existing_duration not in (0, p_duration_seconds) then
    raise exception 'Submission duration conflict' using errcode = '23505';
  end if;

  update public.writing_submissions submission
  set duration_seconds = p_duration_seconds
  where submission.id = p_id
    and submission.student_id = p_student_id
    and submission.deleted_at is null;

  return query
  select submission.id, submission.topic, submission.answer,
         submission.word_count, submission.duration_seconds,
         submission.submitted_at, submission.deleted_at
  from public.writing_submissions submission
  where submission.id = p_id and submission.student_id = p_student_id;
end;
$$;

create or replace function public.writing_submission_get_v2(
  p_student_id uuid,
  p_id uuid
)
returns table (
  id uuid,
  topic text,
  answer text,
  word_count integer,
  duration_seconds integer,
  submitted_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select submission.id, submission.topic, submission.answer,
         submission.word_count, submission.duration_seconds,
         submission.submitted_at
  from public.writing_submissions submission
  where submission.student_id = p_student_id
    and submission.id = p_id
    and submission.deleted_at is null
  limit 1;
$$;

create or replace function public.writing_submission_list_v2(
  p_student_id uuid,
  p_limit integer,
  p_offset integer
)
returns table (
  id uuid,
  topic text,
  answer_preview text,
  word_count integer,
  duration_seconds integer,
  submitted_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_limit not between 1 and 101 or p_offset not between 0 and 1000000 then
    raise exception 'Invalid submission page' using errcode = '22023';
  end if;
  return query
  select submission.id, submission.topic, left(submission.answer, 400),
         submission.word_count, submission.duration_seconds,
         submission.submitted_at
  from public.writing_submissions submission
  where submission.student_id = p_student_id
    and submission.deleted_at is null
  order by submission.submitted_at desc, submission.id desc
  limit p_limit offset p_offset;
end;
$$;

create or replace function public.writing_submission_soft_delete(
  p_student_id uuid,
  p_id uuid
)
returns table (id uuid, deleted_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.writing_submissions submission
  set deleted_at = coalesce(submission.deleted_at, clock_timestamp())
  where submission.student_id = p_student_id
    and submission.id = p_id
    and submission.deleted_at is null;

  return query
  select submission.id, submission.deleted_at
  from public.writing_submissions submission
  where submission.student_id = p_student_id
    and submission.id = p_id
    and submission.deleted_at is not null
  limit 1;
end;
$$;

create or replace function public.writing_submission_progress(p_student_id uuid)
returns table (
  activity_date date,
  articles_written bigint,
  time_spent_seconds bigint,
  average_seconds numeric,
  cumulative_articles bigint,
  cumulative_time_seconds bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with daily as (
    select (submission.submitted_at at time zone 'Asia/Hong_Kong')::date as activity_date,
           count(*)::bigint as articles_written,
           sum(submission.duration_seconds)::bigint as time_spent_seconds
    from public.writing_submissions submission
    where submission.student_id = p_student_id
    group by (submission.submitted_at at time zone 'Asia/Hong_Kong')::date
  )
  select daily.activity_date,
         daily.articles_written,
         daily.time_spent_seconds,
         case when daily.articles_written > 0
           then round(daily.time_spent_seconds::numeric / daily.articles_written, 2)
           else 0::numeric
         end,
         sum(daily.articles_written) over (order by daily.activity_date),
         sum(daily.time_spent_seconds) over (order by daily.activity_date)
  from daily
  order by daily.activity_date;
$$;

create or replace function public.writing_submission_admin_list_submissions_v2(
  p_admin_token uuid,
  p_student_id uuid,
  p_limit integer,
  p_offset integer
)
returns table (
  id uuid,
  student_id uuid,
  student_name text,
  topic text,
  answer_preview text,
  word_count integer,
  duration_seconds integer,
  submitted_at timestamptz,
  deleted_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._writing_submission_admin_id(p_admin_token) is null then return; end if;
  if p_limit not between 1 and 101 or p_offset not between 0 and 1000000 then
    raise exception 'Invalid admin submission page' using errcode = '22023';
  end if;
  return query
  select submission.id, submission.student_id, student.name,
         submission.topic, left(submission.answer, 400),
         submission.word_count, submission.duration_seconds,
         submission.submitted_at, submission.deleted_at
  from public.writing_submissions submission
  join public.flashcard_students student on student.id = submission.student_id
  where (p_student_id is null or submission.student_id = p_student_id)
    and student.deleted_at is null
  order by submission.submitted_at desc, submission.id desc
  limit p_limit offset p_offset;
end;
$$;

create or replace function public.writing_submission_admin_get_submission_v2(
  p_admin_token uuid,
  p_id uuid
)
returns table (
  id uuid,
  student_id uuid,
  student_name text,
  topic text,
  answer text,
  word_count integer,
  duration_seconds integer,
  submitted_at timestamptz,
  deleted_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select submission.id, submission.student_id, student.name,
         submission.topic, submission.answer, submission.word_count,
         submission.duration_seconds, submission.submitted_at,
         submission.deleted_at
  from public.writing_submissions submission
  join public.flashcard_students student on student.id = submission.student_id
  where public._writing_submission_admin_id(p_admin_token) is not null
    and submission.id = p_id
    and student.deleted_at is null
  limit 1;
$$;

revoke all on function public.writing_submission_preferences_get(uuid)
  from public, anon, authenticated;
revoke all on function public.writing_submission_preferences_set(uuid, boolean)
  from public, anon, authenticated;
revoke all on function public.writing_submission_submit_v2(uuid, uuid, text, text, integer, integer)
  from public, anon, authenticated;
revoke all on function public.writing_submission_get_v2(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.writing_submission_list_v2(uuid, integer, integer)
  from public, anon, authenticated;
revoke all on function public.writing_submission_soft_delete(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.writing_submission_progress(uuid)
  from public, anon, authenticated;
revoke all on function public.writing_submission_admin_list_submissions_v2(uuid, uuid, integer, integer)
  from public, anon, authenticated;
revoke all on function public.writing_submission_admin_get_submission_v2(uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.writing_submission_preferences_get(uuid) to service_role;
grant execute on function public.writing_submission_preferences_set(uuid, boolean) to service_role;
grant execute on function public.writing_submission_submit_v2(uuid, uuid, text, text, integer, integer) to service_role;
grant execute on function public.writing_submission_get_v2(uuid, uuid) to service_role;
grant execute on function public.writing_submission_list_v2(uuid, integer, integer) to service_role;
grant execute on function public.writing_submission_soft_delete(uuid, uuid) to service_role;
grant execute on function public.writing_submission_progress(uuid) to service_role;
grant execute on function public.writing_submission_admin_list_submissions_v2(uuid, uuid, integer, integer) to service_role;
grant execute on function public.writing_submission_admin_get_submission_v2(uuid, uuid) to service_role;

commit;
