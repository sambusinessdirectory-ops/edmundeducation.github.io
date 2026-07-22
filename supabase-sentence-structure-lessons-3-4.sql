-- Edmund Education Sentence Structure: enable lessons ss3 and ss4.
--
-- This migration is safe to run repeatedly after supabase-sentence-structure.sql.

begin;

create or replace function public._sentence_structure_result_valid(
  p_lesson_id text,
  p_result jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_question_pattern text;
  v_question_id text;
  v_item jsonb;
  v_round jsonb;
  v_array_name text;
  v_key_count integer;
  v_has_correction_state boolean;
begin
  if p_lesson_id not in ('ss1', 'ss2', 'ss3', 'ss4')
    or p_result is null
    or jsonb_typeof(p_result) <> 'object'
    or octet_length(p_result::text) > 98304
  then
    return false;
  end if;

  v_question_pattern := '^' || p_lesson_id || '-q(0[1-9]|[1-4][0-9]|50)$';
  select count(*) into v_key_count from jsonb_object_keys(p_result);
  v_has_correction_state := p_result ? 'correctionMode'
    or p_result ? 'correctionIds'
    or p_result ? 'collapsedCorrectIds';

  if v_key_count not in (6, 9)
    or not (p_result ?& array[
      'round',
      'correctIds',
      'questionState',
      'rounds',
      'awaitingNextRound',
      'contentVersion'
    ])
    or exists (
      select 1
      from jsonb_object_keys(p_result) as key_row(key_name)
      where key_name not in (
        'round',
        'correctIds',
        'questionState',
        'rounds',
        'awaitingNextRound',
        'correctionMode',
        'correctionIds',
        'collapsedCorrectIds',
        'contentVersion'
      )
    )
    or (
      v_has_correction_state
      and not (p_result ?& array['correctionMode', 'correctionIds', 'collapsedCorrectIds'])
    )
  then
    return false;
  end if;

  if jsonb_typeof(p_result -> 'round') <> 'number'
    or coalesce(p_result ->> 'round', '') !~ '^[1-9][0-9]{0,3}$'
    or jsonb_typeof(p_result -> 'correctIds') <> 'array'
    or jsonb_array_length(p_result -> 'correctIds') > 50
    or jsonb_typeof(p_result -> 'questionState') <> 'object'
    or (select count(*) from jsonb_object_keys(p_result -> 'questionState')) > 50
    or jsonb_typeof(p_result -> 'rounds') <> 'array'
    or jsonb_array_length(p_result -> 'rounds') > 250
    or jsonb_typeof(p_result -> 'awaitingNextRound') <> 'boolean'
    or jsonb_typeof(p_result -> 'contentVersion') <> 'string'
    or p_result ->> 'contentVersion' <> '1'
  then
    return false;
  end if;

  if v_has_correction_state then
    if jsonb_typeof(p_result -> 'correctionMode') <> 'boolean'
      or jsonb_typeof(p_result -> 'correctionIds') <> 'array'
      or jsonb_array_length(p_result -> 'correctionIds') > 50
      or jsonb_typeof(p_result -> 'collapsedCorrectIds') <> 'array'
      or jsonb_array_length(p_result -> 'collapsedCorrectIds') > 50
    then
      return false;
    end if;

    foreach v_array_name in array array['correctionIds', 'collapsedCorrectIds']
    loop
      for v_item in
        select value
        from jsonb_array_elements(p_result -> v_array_name)
      loop
        if jsonb_typeof(v_item) <> 'string'
          or coalesce(v_item #>> '{}', '') !~ v_question_pattern
        then
          return false;
        end if;
      end loop;

      if (
        select count(*)
        from jsonb_array_elements(p_result -> v_array_name)
      ) <> (
        select count(distinct value #>> '{}')
        from jsonb_array_elements(p_result -> v_array_name)
      ) then
        return false;
      end if;
    end loop;

    if ((p_result ->> 'correctionMode')::boolean and jsonb_array_length(p_result -> 'correctionIds') = 0)
      or (not (p_result ->> 'correctionMode')::boolean and jsonb_array_length(p_result -> 'correctionIds') <> 0)
      or ((p_result ->> 'correctionMode')::boolean and (p_result ->> 'awaitingNextRound')::boolean)
      or exists (
        select 1
        from jsonb_array_elements_text(p_result -> 'correctionIds') as correction_id(question_id)
        where not (p_result -> 'questionState' ? correction_id.question_id)
          or coalesce(p_result -> 'questionState' -> correction_id.question_id ->> 'status', '') not in ('wrong', 'correct')
      )
      or exists (
        select 1
        from jsonb_array_elements_text(p_result -> 'collapsedCorrectIds') as collapsed_id(question_id)
        where not (p_result -> 'correctIds' ? collapsed_id.question_id)
      )
    then
      return false;
    end if;
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_result -> 'correctIds')
  loop
    if jsonb_typeof(v_item) <> 'string'
      or coalesce(v_item #>> '{}', '') !~ v_question_pattern
    then
      return false;
    end if;
  end loop;

  if (
    select count(*)
    from jsonb_array_elements(p_result -> 'correctIds')
  ) <> (
    select count(distinct value #>> '{}')
    from jsonb_array_elements(p_result -> 'correctIds')
  ) then
    return false;
  end if;

  for v_question_id in
    select key_name
    from jsonb_object_keys(p_result -> 'questionState') as key_row(key_name)
  loop
    if v_question_id !~ v_question_pattern then
      return false;
    end if;
  end loop;

  for v_round in
    select value
    from jsonb_array_elements(p_result -> 'rounds')
  loop
    if jsonb_typeof(v_round) <> 'object' then
      return false;
    end if;

    foreach v_array_name in array array['checkedIds', 'correctIds', 'incorrectIds']
    loop
      if jsonb_typeof(v_round -> v_array_name) is distinct from 'array'
        or jsonb_array_length(v_round -> v_array_name) > 50
      then
        return false;
      end if;
      for v_item in
        select value
        from jsonb_array_elements(v_round -> v_array_name)
      loop
        if jsonb_typeof(v_item) <> 'string'
          or coalesce(v_item #>> '{}', '') !~ v_question_pattern
        then
          return false;
        end if;
      end loop;
    end loop;
  end loop;

  return true;
end;
$$;

create or replace function public._sentence_structure_bookmark_payload_valid(p_bookmarks jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_item jsonb;
  v_item_count integer;
  v_distinct_count integer;
begin
  if p_bookmarks is null
    or jsonb_typeof(p_bookmarks) <> 'array'
    or jsonb_array_length(p_bookmarks) > 200
    or octet_length(p_bookmarks::text) > 65536
  then
    return false;
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_bookmarks)
  loop
    if jsonb_typeof(v_item) <> 'object'
      or (select count(*) from jsonb_object_keys(v_item)) <> 3
      or exists (
        select 1
        from jsonb_object_keys(v_item) as key_row(key_name)
        where key_name not in ('lessonId', 'questionId', 'includeAnswer')
      )
      or jsonb_typeof(v_item -> 'lessonId') <> 'string'
      or coalesce(v_item ->> 'lessonId', '') not in ('ss1', 'ss2', 'ss3', 'ss4')
      or jsonb_typeof(v_item -> 'questionId') <> 'string'
      or coalesce(v_item ->> 'questionId', '') !~ (
        '^' || (v_item ->> 'lessonId') || '-q(0[1-9]|[1-4][0-9]|50)$'
      )
      or jsonb_typeof(v_item -> 'includeAnswer') <> 'boolean'
    then
      return false;
    end if;
  end loop;

  select count(*), count(distinct (
    value ->> 'lessonId',
    value ->> 'questionId'
  ))
  into v_item_count, v_distinct_count
  from jsonb_array_elements(p_bookmarks);

  return v_item_count = v_distinct_count;
end;
$$;

alter table public.sentence_structure_attempts
  drop constraint if exists sentence_structure_attempts_lesson_id_check;

alter table public.sentence_structure_attempts
  add constraint sentence_structure_attempts_lesson_id_check
  check (lesson_id in ('ss1', 'ss2', 'ss3', 'ss4')) not valid;

alter table public.sentence_structure_attempts
  validate constraint sentence_structure_attempts_lesson_id_check;

alter table public.sentence_structure_bookmarks
  drop constraint if exists sentence_structure_bookmarks_lesson_id_check;

alter table public.sentence_structure_bookmarks
  add constraint sentence_structure_bookmarks_lesson_id_check
  check (lesson_id in ('ss1', 'ss2', 'ss3', 'ss4')) not valid;

alter table public.sentence_structure_bookmarks
  validate constraint sentence_structure_bookmarks_lesson_id_check;

create or replace function public.sentence_structure_upsert_attempt(
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
  v_existing public.sentence_structure_attempts%rowtype;
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
    or p_lesson_id not in ('ss1', 'ss2', 'ss3', 'ss4')
    or p_lesson_version <> '1'
    or p_status not in ('in_progress', 'completed')
    or p_round_number not between 1 and 1000
    or p_total_count <> 50
    or p_correct_count not between 0 and p_total_count
    or p_duration_ms not between 0 and 604800000
    or p_started_at is null
    or p_started_at < timestamptz '2020-01-01 00:00:00+00'
    or p_started_at > v_now + interval '5 minutes'
    or not public._sentence_structure_result_valid(p_lesson_id, p_result)
    or (p_result ->> 'round')::integer <> p_round_number
    or jsonb_array_length(p_result -> 'correctIds') <> p_correct_count
    or (p_status = 'completed' and p_correct_count <> p_total_count)
  then
    raise exception 'Invalid Sentence Structure attempt' using errcode = '22023';
  end if;

  v_started_at := least(p_started_at, v_now);

  -- Serialize both quota checks and individual UUID updates. Every attempt for
  -- a student takes the student lock first, preventing races at the 1,000-row
  -- retained-history ceiling.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'sentence-structure-student:' || p_student_id::text,
      0
    )
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'sentence-structure-attempt:' || p_id::text,
      0
    )
  );

  select attempt.*
  into v_existing
  from public.sentence_structure_attempts attempt
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

    -- Completed attempts are immutable. Returning the existing row makes a
    -- retry after a lost response idempotent without permitting rewrites.
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

      update public.sentence_structure_attempts attempt
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
      from public.sentence_structure_attempts attempt
      where attempt.student_id = p_student_id
    ) >= 1000 then
      -- Returning no row lets the Worker report a bounded, non-upstream 409.
      return;
    end if;

    insert into public.sentence_structure_attempts (
      id,
      student_id,
      lesson_id,
      lesson_version,
      status,
      round_number,
      correct_count,
      total_count,
      duration_ms,
      result,
      started_at,
      completed_at,
      created_at,
      updated_at
    )
    values (
      p_id,
      p_student_id,
      p_lesson_id,
      p_lesson_version,
      p_status,
      p_round_number,
      p_correct_count,
      p_total_count,
      p_duration_ms,
      p_result,
      v_started_at,
      case
        when p_status = 'completed' then greatest(v_now, v_started_at)
        else null
      end,
      v_now,
      v_now
    );
  end if;

  return query
  select
    attempt.id,
    attempt.lesson_id,
    attempt.lesson_version,
    attempt.status,
    attempt.round_number,
    attempt.correct_count,
    attempt.total_count,
    attempt.duration_ms,
    attempt.started_at,
    attempt.completed_at,
    attempt.updated_at,
    attempt.result
  from public.sentence_structure_attempts attempt
  where attempt.id = p_id
    and attempt.student_id = p_student_id;
end;
$$;

commit;
