-- Rollback-only verification for the Phrasal Verb stale-snapshot migration.
-- This script deliberately ends with ROLLBACK and leaves no attempt row behind.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
begin
  if pg_catalog.strpos(
    pg_catalog.pg_get_functiondef(
      'public.phrasal_verb_system_upsert_attempt(uuid,uuid,text,text,text,integer,integer,integer,integer,timestamp with time zone,jsonb)'::regprocedure
    ),
    'PHRASAL_STALE_SNAPSHOT_NOOP_V1'
  ) = 0 then
    raise exception 'Phrasal upsert migration marker is missing';
  end if;

  if pg_catalog.has_function_privilege(
    'anon',
    'public._phrasal_verb_system_snapshot_is_dominated(jsonb,jsonb)',
    'EXECUTE'
  )
    or pg_catalog.has_function_privilege(
      'authenticated',
      'public._phrasal_verb_system_snapshot_is_dominated(jsonb,jsonb)',
      'EXECUTE'
    )
  then
    raise exception 'Internal dominance helper is client-executable';
  end if;

  if pg_catalog.has_function_privilege(
    'anon',
    'public.phrasal_verb_system_upsert_attempt(uuid,uuid,text,text,text,integer,integer,integer,integer,timestamp with time zone,jsonb)',
    'EXECUTE'
  )
    or pg_catalog.has_function_privilege(
      'authenticated',
      'public.phrasal_verb_system_upsert_attempt(uuid,uuid,text,text,text,integer,integer,integer,integer,timestamp with time zone,jsonb)',
      'EXECUTE'
    )
    or not pg_catalog.has_function_privilege(
      'service_role',
      'public.phrasal_verb_system_upsert_attempt(uuid,uuid,text,text,text,integer,integer,integer,integer,timestamp with time zone,jsonb)',
      'EXECUTE'
    )
  then
    raise exception 'Migration changed the existing upsert client ACL';
  end if;
end;
$$;

do $$
declare
  v_student_id uuid;
  v_attempt_id uuid := pg_catalog.gen_random_uuid();
  v_started_at timestamptz := clock_timestamp() - interval '10 minutes';
  v_before_updated_at timestamptz;
  v_after_updated_at timestamptz;
  v_before_result jsonb;
  v_after_result jsonb;
  v_rejected boolean := false;
  v_round_1 jsonb := jsonb_build_object(
    'kind', 'partial',
    'round', 1,
    'checkedIds', jsonb_build_array('phrasal-verb-02-q01'),
    'correctIds', jsonb_build_array('phrasal-verb-02-q01'),
    'incorrectIds', '[]'::jsonb,
    'submittedAt', '2026-08-17T00:00:01.000Z'
  );
  v_round_2 jsonb := jsonb_build_object(
    'kind', 'partial',
    'round', 2,
    'checkedIds', jsonb_build_array('phrasal-verb-02-q02'),
    'correctIds', jsonb_build_array('phrasal-verb-02-q02'),
    'incorrectIds', '[]'::jsonb,
    'submittedAt', '2026-08-17T00:00:02.000Z'
  );
  v_existing jsonb;
  v_dominated jsonb;
  v_disjoint jsonb;
begin
  select student.id
  into v_student_id
  from public.flashcard_students student
  where student.deleted_at is null
  order by student.id
  limit 1;

  if v_student_id is null then
    raise exception 'Verification requires one active student';
  end if;

  v_existing := jsonb_build_object(
    'round', 2,
    'correctIds', jsonb_build_array(
      'phrasal-verb-02-q01',
      'phrasal-verb-02-q02'
    ),
    'questionState', jsonb_build_object(
      'phrasal-verb-02-q01', jsonb_build_object(
        'status', 'correct', 'lastAnswer', 'answer one', 'reveal', true
      ),
      'phrasal-verb-02-q02', jsonb_build_object(
        'status', 'correct', 'lastAnswer', 'answer two', 'reveal', true
      )
    ),
    'rounds', jsonb_build_array(v_round_1, v_round_2),
    'awaitingNextRound', false,
    'correctionMode', false,
    'correctionIds', '[]'::jsonb,
    'collapsedCorrectIds', jsonb_build_array(
      'phrasal-verb-02-q01',
      'phrasal-verb-02-q02'
    ),
    'contentVersion', '1'
  );

  v_dominated := jsonb_build_object(
    'round', 1,
    'correctIds', jsonb_build_array('phrasal-verb-02-q01'),
    'questionState', jsonb_build_object(
      'phrasal-verb-02-q01', jsonb_build_object(
        'status', 'correct', 'lastAnswer', 'answer one', 'reveal', true
      )
    ),
    'rounds', jsonb_build_array(v_round_1),
    'awaitingNextRound', false,
    'correctionMode', false,
    'correctionIds', '[]'::jsonb,
    'collapsedCorrectIds', jsonb_build_array('phrasal-verb-02-q01'),
    'contentVersion', '1'
  );

  -- It is stale against q02, but also carries a correct q03 that is absent
  -- canonically.  That branch must never be swallowed as a no-op.
  v_disjoint := jsonb_build_object(
    'round', 1,
    'correctIds', jsonb_build_array(
      'phrasal-verb-02-q01',
      'phrasal-verb-02-q03'
    ),
    'questionState', jsonb_build_object(
      'phrasal-verb-02-q01', jsonb_build_object(
        'status', 'correct', 'lastAnswer', 'answer one', 'reveal', true
      ),
      'phrasal-verb-02-q03', jsonb_build_object(
        'status', 'correct', 'lastAnswer', 'new branch answer', 'reveal', true
      )
    ),
    'rounds', jsonb_build_array(v_round_1),
    'awaitingNextRound', false,
    'correctionMode', false,
    'correctionIds', '[]'::jsonb,
    'collapsedCorrectIds', jsonb_build_array('phrasal-verb-02-q01'),
    'contentVersion', '1'
  );

  if not public._phrasal_verb_system_result_valid(
    'phrasal-verb-02', v_existing
  )
    or not public._phrasal_verb_system_result_valid(
      'phrasal-verb-02', v_dominated
    )
    or not public._phrasal_verb_system_result_valid(
      'phrasal-verb-02', v_disjoint
    )
  then
    raise exception 'Verification fixture is not a valid Phrasal result';
  end if;

  if not public._phrasal_verb_system_snapshot_is_dominated(
    v_existing, v_dominated
  ) then
    raise exception 'Dominated fixture was not recognized';
  end if;

  if public._phrasal_verb_system_snapshot_is_dominated(
    v_existing, v_disjoint
  ) then
    raise exception 'Disjoint fixture was incorrectly recognized as dominated';
  end if;

  perform *
  from public.phrasal_verb_system_upsert_attempt(
    v_attempt_id,
    v_student_id,
    'phrasal-verb-02',
    '1',
    'in_progress',
    2,
    2,
    50,
    2000,
    v_started_at,
    v_existing
  );

  select attempt.updated_at, attempt.result
  into v_before_updated_at, v_before_result
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = v_attempt_id;

  perform *
  from public.phrasal_verb_system_upsert_attempt(
    v_attempt_id,
    v_student_id,
    'phrasal-verb-02',
    '1',
    'in_progress',
    1,
    1,
    50,
    1000,
    v_started_at,
    v_dominated
  );

  select attempt.updated_at, attempt.result
  into v_after_updated_at, v_after_result
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = v_attempt_id;

  if v_after_updated_at is distinct from v_before_updated_at
    or v_after_result is distinct from v_before_result
  then
    raise exception 'Dominated retry mutated the canonical row';
  end if;

  begin
    perform *
    from public.phrasal_verb_system_upsert_attempt(
      v_attempt_id,
      v_student_id,
      'phrasal-verb-02',
      '1',
      'in_progress',
      1,
      2,
      50,
      1500,
      v_started_at,
      v_disjoint
    );
  exception
    when sqlstate '22023' then
      v_rejected := true;
  end;

  if not v_rejected then
    raise exception 'Disjoint stale retry was not rejected';
  end if;

  select attempt.updated_at, attempt.result
  into v_after_updated_at, v_after_result
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = v_attempt_id;

  if v_after_updated_at is distinct from v_before_updated_at
    or v_after_result is distinct from v_before_result
  then
    raise exception 'Rejected disjoint retry mutated the canonical row';
  end if;
end;
$$;

rollback;
