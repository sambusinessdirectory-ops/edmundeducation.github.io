-- Grammar Tense practice: authenticated, owner-scoped completion progress.
-- Apply after supabase-shared-student-accounts.sql and supabase-student-progress.sql.

begin;

do $$
begin
  if pg_catalog.to_regclass('public.flashcard_students') is null
    or pg_catalog.to_regclass('public.flashcard_student_sessions') is null
    or pg_catalog.to_regclass('public.learning_portal_progress_events') is null
  then
    raise exception 'Apply the shared student-account and Student Progress migrations first';
  end if;
end;
$$;

create or replace function public.grammar_tense_list_progress(p_token uuid)
returns table(
  question_number integer,
  duration_ms bigint,
  completed_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if auth.uid() is null or p_token is null then
    raise exception 'Student authentication is required' using errcode = '42501';
  end if;

  select session_row.student_id
  into v_student_id
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student
    on student.id = session_row.student_id
  where session_row.token = p_token
    and session_row.expires_at > pg_catalog.now()
    and student.deleted_at is null
  limit 1;

  if v_student_id is null then
    raise exception 'Student session is invalid or expired' using errcode = '42501';
  end if;

  return query
  select
    pg_catalog.right(event.event_key, 3)::integer,
    event.duration_ms,
    event.occurred_at
  from public.learning_portal_progress_events event
  where event.student_id = v_student_id
    and event.system_key = 'grammar'
    and event.event_key ~ '^tense:q[0-9]{3}$'
  order by event.event_key;
end;
$$;

create or replace function public.grammar_tense_record_completion(
  p_token uuid,
  p_question_number integer,
  p_duration_ms bigint default 0
)
returns table(
  question_number integer,
  duration_ms bigint,
  completed_at timestamptz,
  inserted boolean
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_event_key text;
  v_row public.learning_portal_progress_events%rowtype;
  v_inserted boolean := false;
begin
  if auth.uid() is null or p_token is null then
    raise exception 'Student authentication is required' using errcode = '42501';
  end if;
  if p_question_number is null or p_question_number not between 1 and 150 then
    raise exception 'Question number is invalid' using errcode = '22023';
  end if;
  if p_duration_ms is null or p_duration_ms not between 0 and 1800000 then
    raise exception 'Question duration is invalid' using errcode = '22023';
  end if;

  select session_row.student_id
  into v_student_id
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student
    on student.id = session_row.student_id
  where session_row.token = p_token
    and session_row.expires_at > pg_catalog.now()
    and student.deleted_at is null
  limit 1;

  if v_student_id is null then
    raise exception 'Student session is invalid or expired' using errcode = '42501';
  end if;

  v_event_key := 'tense:q' || pg_catalog.lpad(p_question_number::text, 3, '0');

  insert into public.learning_portal_progress_events (
    student_id,
    system_key,
    event_key,
    activity_count,
    duration_ms,
    occurred_at
  )
  values (
    v_student_id,
    'grammar',
    v_event_key,
    1,
    p_duration_ms,
    pg_catalog.now()
  )
  on conflict (student_id, system_key, event_key) do nothing
  returning * into v_row;

  if found then
    v_inserted := true;
  else
    select event.*
    into v_row
    from public.learning_portal_progress_events event
    where event.student_id = v_student_id
      and event.system_key = 'grammar'
      and event.event_key = v_event_key;
  end if;

  return query select p_question_number, v_row.duration_ms, v_row.occurred_at, v_inserted;
end;
$$;

revoke all on function public.grammar_tense_list_progress(uuid)
  from public, anon, authenticated;
revoke all on function public.grammar_tense_record_completion(uuid, integer, bigint)
  from public, anon, authenticated;

grant execute on function public.grammar_tense_list_progress(uuid) to authenticated;
grant execute on function public.grammar_tense_record_completion(uuid, integer, bigint) to authenticated;

notify pgrst, 'reload schema';

commit;
