-- Phrasal Verb attempt stale-snapshot containment.
--
-- A delayed browser retry can legitimately carry an older snapshot after a
-- newer snapshot for the same attempt UUID has already committed.  When every
-- fact in that delayed snapshot is already represented by the canonical row,
-- treat the retry as an idempotent no-op.  A stale snapshot that contains any
-- disjoint answer/history fact remains a hard 22023 rejection: silently
-- dropping such a fact would lose student work.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

select pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended(
    'edmund-phrasal-verb-stale-snapshot-noop-v1',
    0
  )
);

-- Fail closed on an unknown production definition. The reviewed first-run
-- baseline hash is the normalized pg_get_functiondef() currently in
-- production. A rerun or a clean install is recognized by the in-body marker.
do $$
declare
  v_upsert regprocedure;
  v_definition text;
  v_has_marker boolean;
begin
  if pg_catalog.to_regclass('public.phrasal_verb_system_attempts') is null then
    raise exception 'Phrasal Verb attempts table is missing';
  end if;

  if pg_catalog.to_regprocedure(
    'public._phrasal_verb_system_result_valid(text,jsonb)'
  ) is null then
    raise exception 'Phrasal Verb result validator is missing';
  end if;

  v_upsert := pg_catalog.to_regprocedure(
    'public.phrasal_verb_system_upsert_attempt(uuid,uuid,text,text,text,integer,integer,integer,integer,timestamp with time zone,jsonb)'
  );
  if v_upsert is null then
    raise exception 'Phrasal Verb upsert signature is missing';
  end if;

  v_definition := pg_catalog.pg_get_functiondef(v_upsert);
  v_has_marker := pg_catalog.strpos(
    v_definition,
    'PHRASAL_STALE_SNAPSHOT_NOOP_V1'
  ) > 0;

  if v_has_marker then
    if pg_catalog.to_regprocedure(
      'public._phrasal_verb_system_snapshot_is_dominated(jsonb,jsonb)'
    ) is null then
      raise exception 'Marked Phrasal upsert is missing its dominance helper';
    end if;
  elsif pg_catalog.md5(v_definition) <> 'c898446011c53c15ecbb5a8040674537' then
    raise exception 'Unreviewed Phrasal upsert drift; refusing blind overwrite (definition md5=%)',
      pg_catalog.md5(v_definition);
  elsif pg_catalog.to_regprocedure(
    'public._phrasal_verb_system_snapshot_is_dominated(jsonb,jsonb)'
  ) is not null then
    raise exception 'Unmarked Phrasal upsert has a partial dominance-helper install';
  end if;
end;
$$;

create or replace function public._phrasal_verb_system_snapshot_is_dominated(
  p_existing jsonb,
  p_candidate jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_candidate_round_count integer;
  v_existing_round_count integer;
  v_index integer;
  v_question_id text;
  v_candidate_question jsonb;
  v_existing_question jsonb;
  v_candidate_status text;
  v_existing_status text;
begin
  if p_existing is null
    or p_candidate is null
    or jsonb_typeof(p_existing) <> 'object'
    or jsonb_typeof(p_candidate) <> 'object'
    or jsonb_typeof(p_existing -> 'round') <> 'number'
    or jsonb_typeof(p_candidate -> 'round') <> 'number'
    or (p_candidate ->> 'round')::integer > (p_existing ->> 'round')::integer
    or jsonb_typeof(p_existing -> 'correctIds') <> 'array'
    or jsonb_typeof(p_candidate -> 'correctIds') <> 'array'
    or jsonb_typeof(p_existing -> 'questionState') <> 'object'
    or jsonb_typeof(p_candidate -> 'questionState') <> 'object'
    or jsonb_typeof(p_existing -> 'rounds') <> 'array'
    or jsonb_typeof(p_candidate -> 'rounds') <> 'array'
  then
    return false;
  end if;

  -- A correct answer present only in the candidate is disjoint new progress.
  if exists (
    select 1
    from jsonb_array_elements_text(p_candidate -> 'correctIds')
      as candidate_correct(question_id)
    where not (p_existing -> 'correctIds' ? candidate_correct.question_id)
  ) then
    return false;
  end if;

  -- Round history is append-only.  A dominated snapshot must therefore be an
  -- exact prefix of the canonical history.  This preserves failed-answer
  -- history and prevents a conflicting branch from being silently discarded.
  v_candidate_round_count := jsonb_array_length(p_candidate -> 'rounds');
  v_existing_round_count := jsonb_array_length(p_existing -> 'rounds');
  if v_candidate_round_count > v_existing_round_count then
    return false;
  end if;

  if v_candidate_round_count > 0 then
    for v_index in 0..v_candidate_round_count - 1 loop
      if p_candidate -> 'rounds' -> v_index
        is distinct from p_existing -> 'rounds' -> v_index
      then
        return false;
      end if;
    end loop;
  end if;

  -- Every candidate question must already exist canonically, and its state may
  -- not be ahead of the canonical state.  For repeated wrong answers, a changed
  -- answer is only dominated when the canonical history has a later round event.
  for v_question_id in
    select key_name
    from jsonb_object_keys(p_candidate -> 'questionState') as key_row(key_name)
  loop
    if not (p_existing -> 'questionState' ? v_question_id) then
      return false;
    end if;

    v_candidate_question := p_candidate -> 'questionState' -> v_question_id;
    v_existing_question := p_existing -> 'questionState' -> v_question_id;
    v_candidate_status := coalesce(v_candidate_question ->> 'status', '');
    v_existing_status := coalesce(v_existing_question ->> 'status', '');

    if (v_candidate_status = 'correct' and v_existing_status <> 'correct')
      or (v_candidate_status = 'wrong' and v_existing_status = 'pending')
      or (
        v_candidate_status = v_existing_status
        and coalesce(v_candidate_question ->> 'lastAnswer', '')
          <> coalesce(v_existing_question ->> 'lastAnswer', '')
        and v_candidate_round_count >= v_existing_round_count
      )
      or (
        coalesce((v_candidate_question ->> 'reveal')::boolean, false)
        and not coalesce((v_existing_question ->> 'reveal')::boolean, false)
      )
    then
      return false;
    end if;
  end loop;

  -- Correction-mode IDs can disappear only because the canonical state has
  -- either retained the correction or promoted the item to correct.
  if p_candidate ? 'correctionIds'
    and exists (
      select 1
      from jsonb_array_elements_text(p_candidate -> 'correctionIds')
        as candidate_correction(question_id)
      where not (
        coalesce(p_existing -> 'correctionIds', '[]'::jsonb)
          ? candidate_correction.question_id
      )
        and not (p_existing -> 'correctIds' ? candidate_correction.question_id)
    )
  then
    return false;
  end if;

  if p_candidate ? 'collapsedCorrectIds'
    and exists (
      select 1
      from jsonb_array_elements_text(p_candidate -> 'collapsedCorrectIds')
        as candidate_collapsed(question_id)
      where not (p_existing -> 'correctIds' ? candidate_collapsed.question_id)
    )
  then
    return false;
  end if;

  return true;
end;
$$;

revoke all on function public._phrasal_verb_system_snapshot_is_dominated(jsonb, jsonb)
  from public, anon, authenticated, service_role;

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
  -- PHRASAL_STALE_SNAPSHOT_NOOP_V1
  v_existing public.phrasal_verb_system_attempts%rowtype;
  v_now timestamptz := clock_timestamp();
  v_started_at timestamptz;
  v_moves_backwards boolean;
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

    -- Completed attempts remain immutable and retries remain idempotent.
    if v_existing.status <> 'completed' then
      v_moves_backwards := p_round_number < v_existing.round_number
        or p_correct_count < v_existing.correct_count
        or p_duration_ms < v_existing.duration_ms
        or exists (
          select 1
          from jsonb_array_elements_text(v_existing.result -> 'correctIds')
            as old_id(question_id)
          where not (p_result -> 'correctIds' ? old_id.question_id)
        );

      if v_moves_backwards then
        if p_status = 'in_progress'
          and p_round_number <= v_existing.round_number
          and p_correct_count <= v_existing.correct_count
          and p_duration_ms <= v_existing.duration_ms
          and public._phrasal_verb_system_snapshot_is_dominated(
            v_existing.result,
            p_result
          )
        then
          -- Delayed retry of an entirely represented snapshot: deliberately do
          -- not change result, counters, timestamps, or updated_at.
          null;
        else
          raise exception 'Attempt progress cannot move backwards'
            using errcode = '22023';
        end if;
      else
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

commit;
