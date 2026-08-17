-- Roll back only the Phrasal Verb stale-snapshot no-op behavior.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

select pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended(
    'edmund-phrasal-verb-stale-snapshot-noop-v1',
    0
  )
);

do $$
declare
  v_upsert regprocedure := pg_catalog.to_regprocedure(
    'public.phrasal_verb_system_upsert_attempt(uuid,uuid,text,text,text,integer,integer,integer,integer,timestamp with time zone,jsonb)'
  );
begin
  if v_upsert is null
    or pg_catalog.strpos(
      pg_catalog.pg_get_functiondef(v_upsert),
      'PHRASAL_STALE_SNAPSHOT_NOOP_V1'
    ) = 0
    or pg_catalog.to_regprocedure(
      'public._phrasal_verb_system_snapshot_is_dominated(jsonb,jsonb)'
    ) is null
  then
    raise exception 'Expected marked Phrasal stale-snapshot migration is not installed';
  end if;
end;
$$;

create or replace function public.phrasal_verb_system_upsert_attempt(
  p_id uuid,
  p_student_id uuid,
  p_lesson_id text,
  p_lesson_version text,
  p_status text,
  p_round_number integer,
  p_correct_count integer,
  p_total_count integer,
  p_duration_ms integer,
  p_started_at timestamptz,
  p_result jsonb
)
returns table (
  id uuid,
  lesson_id text,
  lesson_version text,
  status text,
  round_number integer,
  correct_count integer,
  total_count integer,
  duration_ms integer,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz,
  result jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.phrasal_verb_system_attempts%rowtype;
  v_now timestamptz := clock_timestamp();
  v_started_at timestamptz;
begin
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Active student not found' using errcode = '23503';
  end if;

  if p_id is null
    or public._phrasal_verb_system_question_count(p_lesson_id) is null
    or p_lesson_version <> '1'
    or p_status not in ('in_progress', 'completed')
    or p_round_number not between 1 and 1000
    or p_total_count <> public._phrasal_verb_system_question_count(p_lesson_id)
    or p_correct_count not between 0 and p_total_count
    or p_duration_ms not between 0 and 604800000
    or p_started_at is null
    or p_started_at < timestamptz '2020-01-01 00:00:00+00'
    or p_started_at > v_now + interval '5 minutes'
    or not public._phrasal_verb_system_result_valid(p_lesson_id, p_result)
    or (p_result ->> 'round')::integer <> p_round_number
    or jsonb_array_length(p_result -> 'correctIds') <> p_correct_count
    or (p_status = 'completed' and p_correct_count <> p_total_count)
  then
    raise exception 'Invalid Phrasal Verb System attempt' using errcode = '22023';
  end if;

  v_started_at := least(p_started_at, v_now);

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'phrasal-verb-system-student:' || p_student_id::text,
      0
    )
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'phrasal-verb-system-attempt:' || p_id::text,
      0
    )
  );

  select attempt.*
  into v_existing
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = p_id
  for update;

  if found then
    if v_existing.student_id <> p_student_id
      or v_existing.lesson_id <> p_lesson_id
      or v_existing.lesson_version <> p_lesson_version
      or v_existing.total_count <> p_total_count
    then
      raise exception 'Attempt identifier conflict' using errcode = '23505';
    end if;

    if v_existing.status <> 'completed' then
      if p_round_number < v_existing.round_number
        or p_correct_count < v_existing.correct_count
        or p_duration_ms < v_existing.duration_ms
        or exists (
          select 1
          from jsonb_array_elements_text(v_existing.result -> 'correctIds')
            as old_id(question_id)
          where not (p_result -> 'correctIds' ? old_id.question_id)
        )
      then
        raise exception 'Attempt progress cannot move backwards'
          using errcode = '22023';
      end if;

      update public.phrasal_verb_system_attempts attempt
      set status = p_status,
          round_number = p_round_number,
          correct_count = p_correct_count,
          total_count = p_total_count,
          duration_ms = p_duration_ms,
          result = p_result,
          completed_at = case
            when p_status = 'completed' then greatest(v_now, v_existing.started_at)
            else null
          end,
          updated_at = v_now
      where attempt.id = p_id;
    end if;
  else
    if (
      select count(*)
      from public.phrasal_verb_system_attempts attempt
      where attempt.student_id = p_student_id
    ) >= 1000 then
      return;
    end if;

    insert into public.phrasal_verb_system_attempts (
      id, student_id, lesson_id, lesson_version, status, round_number,
      correct_count, total_count, duration_ms, result, started_at,
      completed_at, created_at, updated_at
    )
    values (
      p_id, p_student_id, p_lesson_id, p_lesson_version, p_status,
      p_round_number, p_correct_count, p_total_count, p_duration_ms, p_result,
      v_started_at,
      case
        when p_status = 'completed' then greatest(v_now, v_started_at)
        else null
      end,
      v_now, v_now
    );
  end if;

  return query
  select
    attempt.id, attempt.lesson_id, attempt.lesson_version, attempt.status,
    attempt.round_number, attempt.correct_count, attempt.total_count,
    attempt.duration_ms, attempt.started_at, attempt.completed_at,
    attempt.updated_at, attempt.result
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = p_id
    and attempt.student_id = p_student_id;
end;
$$;

drop function if exists public._phrasal_verb_system_snapshot_is_dominated(jsonb, jsonb);

commit;
