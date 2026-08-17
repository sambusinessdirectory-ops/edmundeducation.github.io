-- Rollback-only behavioral verification for the V2 branch-divergence guard.
-- It uses one active student only inside this transaction and leaves no row.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $$
begin
  if pg_catalog.strpos(
    pg_catalog.pg_get_functiondef(
      'public.phrasal_verb_system_upsert_attempt(uuid,uuid,text,text,text,integer,integer,integer,integer,timestamp with time zone,jsonb)'::regprocedure
    ),
    'PHRASAL_BRANCH_DIVERGENCE_GUARD_V2'
  ) = 0 then
    raise exception 'Phrasal V2 branch-divergence marker is missing';
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
    raise exception 'V2 branch guard changed the reviewed upsert ACL';
  end if;
end;
$$;

do $$
declare
  v_student_id uuid;
  v_attempt_id uuid := pg_catalog.gen_random_uuid();
  v_started_at timestamptz := clock_timestamp() - interval '10 minutes';
  v_before_result jsonb;
  v_before_updated_at timestamptz;
  v_after_result jsonb;
  v_after_updated_at timestamptz;
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
  v_round_3 jsonb := jsonb_build_object(
    'kind', 'partial',
    'round', 3,
    'checkedIds', jsonb_build_array('phrasal-verb-02-q03'),
    'correctIds', jsonb_build_array('phrasal-verb-02-q03'),
    'incorrectIds', '[]'::jsonb,
    'submittedAt', '2026-08-17T00:00:03.000Z'
  );
  v_canonical jsonb;
  v_stale jsonb;
  v_divergent jsonb;
  v_forward jsonb;
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

  v_stale := jsonb_build_object(
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

  v_canonical := jsonb_build_object(
    'round', 2,
    'correctIds', jsonb_build_array(
      'phrasal-verb-02-q01', 'phrasal-verb-02-q02'
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
      'phrasal-verb-02-q01', 'phrasal-verb-02-q02'
    ),
    'contentVersion', '1'
  );

  -- Scalar counters advance and correctIds are a superset, but q01 carries a
  -- different same-round answer history. V1 would replace canonical here.
  v_divergent := jsonb_build_object(
    'round', 2,
    'correctIds', jsonb_build_array(
      'phrasal-verb-02-q01', 'phrasal-verb-02-q02', 'phrasal-verb-02-q03'
    ),
    'questionState', jsonb_build_object(
      'phrasal-verb-02-q01', jsonb_build_object(
        'status', 'correct', 'lastAnswer', 'different branch', 'reveal', true
      ),
      'phrasal-verb-02-q02', jsonb_build_object(
        'status', 'correct', 'lastAnswer', 'answer two', 'reveal', true
      ),
      'phrasal-verb-02-q03', jsonb_build_object(
        'status', 'correct', 'lastAnswer', 'answer three', 'reveal', true
      )
    ),
    'rounds', jsonb_build_array(v_round_1, v_round_2),
    'awaitingNextRound', false,
    'correctionMode', false,
    'correctionIds', '[]'::jsonb,
    'collapsedCorrectIds', jsonb_build_array(
      'phrasal-verb-02-q01', 'phrasal-verb-02-q02', 'phrasal-verb-02-q03'
    ),
    'contentVersion', '1'
  );

  v_forward := jsonb_build_object(
    'round', 3,
    'correctIds', jsonb_build_array(
      'phrasal-verb-02-q01', 'phrasal-verb-02-q02', 'phrasal-verb-02-q03'
    ),
    'questionState', jsonb_build_object(
      'phrasal-verb-02-q01', jsonb_build_object(
        'status', 'correct', 'lastAnswer', 'answer one', 'reveal', true
      ),
      'phrasal-verb-02-q02', jsonb_build_object(
        'status', 'correct', 'lastAnswer', 'answer two', 'reveal', true
      ),
      'phrasal-verb-02-q03', jsonb_build_object(
        'status', 'correct', 'lastAnswer', 'answer three', 'reveal', true
      )
    ),
    'rounds', jsonb_build_array(v_round_1, v_round_2, v_round_3),
    'awaitingNextRound', false,
    'correctionMode', false,
    'correctionIds', '[]'::jsonb,
    'collapsedCorrectIds', jsonb_build_array(
      'phrasal-verb-02-q01', 'phrasal-verb-02-q02', 'phrasal-verb-02-q03'
    ),
    'contentVersion', '1'
  );

  if not public._phrasal_verb_system_result_valid('phrasal-verb-02', v_stale)
    or not public._phrasal_verb_system_result_valid('phrasal-verb-02', v_canonical)
    or not public._phrasal_verb_system_result_valid('phrasal-verb-02', v_divergent)
    or not public._phrasal_verb_system_result_valid('phrasal-verb-02', v_forward)
  then
    raise exception 'V2 verification fixture is invalid';
  end if;

  perform * from public.phrasal_verb_system_upsert_attempt(
    v_attempt_id, v_student_id, 'phrasal-verb-02', '1', 'in_progress',
    2, 2, 50, 2000, v_started_at, v_canonical
  );

  select attempt.updated_at, attempt.result
  into v_before_updated_at, v_before_result
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = v_attempt_id;

  begin
    perform * from public.phrasal_verb_system_upsert_attempt(
      v_attempt_id, v_student_id, 'phrasal-verb-02', '1', 'in_progress',
      2, 3, 50, 3000, v_started_at, v_divergent
    );
  exception
    when sqlstate '22023' then v_rejected := true;
  end;

  if not v_rejected then
    raise exception 'Monotonic-looking divergent branch was not rejected';
  end if;

  select attempt.updated_at, attempt.result
  into v_after_updated_at, v_after_result
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = v_attempt_id;

  if v_after_updated_at is distinct from v_before_updated_at
    or v_after_result is distinct from v_before_result
  then
    raise exception 'Rejected divergent branch mutated canonical progress';
  end if;

  perform * from public.phrasal_verb_system_upsert_attempt(
    v_attempt_id, v_student_id, 'phrasal-verb-02', '1', 'in_progress',
    1, 1, 50, 1000, v_started_at, v_stale
  );

  select attempt.updated_at, attempt.result
  into v_after_updated_at, v_after_result
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = v_attempt_id;

  if v_after_updated_at is distinct from v_before_updated_at
    or v_after_result is distinct from v_before_result
  then
    raise exception 'Dominated stale retry changed canonical progress';
  end if;

  perform * from public.phrasal_verb_system_upsert_attempt(
    v_attempt_id, v_student_id, 'phrasal-verb-02', '1', 'in_progress',
    3, 3, 50, 4000, v_started_at, v_forward
  );

  select attempt.result
  into v_after_result
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = v_attempt_id;

  if v_after_result is distinct from v_forward then
    raise exception 'Dominating forward progress was not accepted';
  end if;
end;
$$;

rollback;
