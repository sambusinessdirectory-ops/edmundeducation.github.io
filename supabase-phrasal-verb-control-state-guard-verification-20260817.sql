-- Rollback-only behavioral verification for the V3 Phrasal control-state guard.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $preflight$
declare
  v_upsert regprocedure :=
    'public.phrasal_verb_system_upsert_attempt(uuid,uuid,text,text,text,integer,integer,integer,integer,timestamp with time zone,jsonb)'::regprocedure;
begin
  if pg_catalog.strpos(
    pg_catalog.pg_get_functiondef(v_upsert),
    'PHRASAL_CONTROL_STATE_GUARD_V3'
  ) = 0
    or pg_catalog.strpos(
      pg_catalog.pg_get_functiondef(
        'public._phrasal_verb_system_snapshot_is_dominated(jsonb,jsonb)'::regprocedure
      ),
      'PHRASAL_CONTROL_STATE_GUARD_V3'
    ) = 0
  then
    raise exception 'Phrasal V3 control-state guard is missing';
  end if;

  if pg_catalog.has_function_privilege('anon', v_upsert, 'EXECUTE')
    or pg_catalog.has_function_privilege('authenticated', v_upsert, 'EXECUTE')
    or not pg_catalog.has_function_privilege('service_role', v_upsert, 'EXECUTE')
    or pg_catalog.has_function_privilege(
      'anon',
      'public._phrasal_verb_system_snapshot_is_dominated(jsonb,jsonb)',
      'EXECUTE'
    )
    or pg_catalog.has_function_privilege(
      'authenticated',
      'public._phrasal_verb_system_snapshot_is_dominated(jsonb,jsonb)',
      'EXECUTE'
    )
    or pg_catalog.has_function_privilege(
      'service_role',
      'public._phrasal_verb_system_snapshot_is_dominated(jsonb,jsonb)',
      'EXECUTE'
    )
    or pg_catalog.has_function_privilege(
      'anon',
      'public._phrasal_verb_system_result_valid(text,jsonb)',
      'EXECUTE'
    )
    or pg_catalog.has_function_privilege(
      'authenticated',
      'public._phrasal_verb_system_result_valid(text,jsonb)',
      'EXECUTE'
    )
    or pg_catalog.has_function_privilege(
      'service_role',
      'public._phrasal_verb_system_result_valid(text,jsonb)',
      'EXECUTE'
    )
  then
    raise exception 'Phrasal V3 ACL verification failed';
  end if;
end;
$preflight$;

do $behavior$
declare
  v_student_id uuid;
  v_attempt_id uuid := pg_catalog.gen_random_uuid();
  v_started_at timestamptz := clock_timestamp() - interval '10 minutes';
  v_before_result jsonb;
  v_before_updated_at timestamptz;
  v_after_result jsonb;
  v_after_updated_at timestamptz;
  v_rejected boolean;
  v_round_1 jsonb := jsonb_build_object(
    'kind', 'all',
    'round', 1,
    'checkedIds', jsonb_build_array(
      'phrasal-verb-02-q01', 'phrasal-verb-02-q02'
    ),
    'correctIds', jsonb_build_array('phrasal-verb-02-q01'),
    'incorrectIds', jsonb_build_array('phrasal-verb-02-q02'),
    'submittedAt', '2026-08-17T00:00:01.000Z'
  );
  v_base jsonb;
  v_awaiting jsonb;
  v_awaiting_newer jsonb;
  v_collapsed jsonb;
  v_collapsed_newer jsonb;
  v_forward jsonb;
  v_correction_a jsonb;
  v_correction_b jsonb;
  v_correction_newer jsonb;
begin
  select student.id
  into v_student_id
  from public.flashcard_students student
  where student.deleted_at is null
  order by student.id
  limit 1;

  if v_student_id is null then
    raise exception 'V3 verification requires one active student';
  end if;

  v_base := jsonb_build_object(
    'round', 1,
    'correctIds', jsonb_build_array('phrasal-verb-02-q01'),
    'questionState', jsonb_build_object(
      'phrasal-verb-02-q01', jsonb_build_object(
        'status', 'correct', 'lastAnswer', 'answer one', 'reveal', true
      ),
      'phrasal-verb-02-q02', jsonb_build_object(
        'status', 'wrong', 'lastAnswer', 'wrong answer', 'reveal', true
      )
    ),
    'rounds', jsonb_build_array(v_round_1),
    'awaitingNextRound', false,
    'correctionMode', false,
    'correctionIds', '[]'::jsonb,
    'collapsedCorrectIds', '[]'::jsonb,
    'contentVersion', '1'
  );

  v_awaiting := jsonb_set(v_base, '{awaitingNextRound}', 'true'::jsonb);
  v_awaiting_newer := jsonb_set(
    v_awaiting,
    '{controlRevision}',
    '1'::jsonb
  );
  v_collapsed := jsonb_set(
    v_base,
    '{collapsedCorrectIds}',
    jsonb_build_array('phrasal-verb-02-q01')
  );
  v_collapsed_newer := jsonb_set(
    v_collapsed,
    '{controlRevision}',
    '1'::jsonb
  );

  -- Starting the next round legitimately resets unresolved question state.
  -- The higher round number makes this structural forward progress.
  v_forward := jsonb_build_object(
    'round', 2,
    'correctIds', jsonb_build_array('phrasal-verb-02-q01'),
    'questionState', jsonb_build_object(
      'phrasal-verb-02-q01', jsonb_build_object(
        'status', 'correct', 'lastAnswer', 'answer one', 'reveal', true
      ),
      'phrasal-verb-02-q02', jsonb_build_object(
        'status', 'pending', 'lastAnswer', '', 'reveal', false
      )
    ),
    'rounds', jsonb_build_array(v_round_1),
    'awaitingNextRound', false,
    'correctionMode', false,
    'correctionIds', '[]'::jsonb,
    'collapsedCorrectIds', '[]'::jsonb,
    'controlRevision', 2,
    'contentVersion', '1'
  );

  v_correction_a := jsonb_build_object(
    'round', 2,
    'correctIds', jsonb_build_array('phrasal-verb-02-q01'),
    'questionState', jsonb_build_object(
      'phrasal-verb-02-q01', jsonb_build_object(
        'status', 'correct', 'lastAnswer', 'answer one', 'reveal', true
      ),
      'phrasal-verb-02-q02', jsonb_build_object(
        'status', 'wrong', 'lastAnswer', 'wrong two', 'reveal', false
      ),
      'phrasal-verb-02-q03', jsonb_build_object(
        'status', 'wrong', 'lastAnswer', 'wrong three', 'reveal', true
      )
    ),
    'rounds', jsonb_build_array(v_round_1),
    'awaitingNextRound', false,
    'correctionMode', true,
    'correctionIds', jsonb_build_array('phrasal-verb-02-q02'),
    'collapsedCorrectIds', '[]'::jsonb,
    'contentVersion', '1'
  );

  v_correction_b := jsonb_set(
    jsonb_set(
      jsonb_set(
        v_correction_a,
        '{correctionIds}',
        jsonb_build_array('phrasal-verb-02-q03')
      ),
      '{questionState,phrasal-verb-02-q02,reveal}',
      'true'::jsonb
    ),
    '{questionState,phrasal-verb-02-q03,reveal}',
    'false'::jsonb
  );
  v_correction_newer := jsonb_set(
    v_correction_b,
    '{controlRevision}',
    '1'::jsonb
  );

  if not public._phrasal_verb_system_result_valid('phrasal-verb-02', v_base)
    or not public._phrasal_verb_system_result_valid('phrasal-verb-02', v_awaiting)
    or not public._phrasal_verb_system_result_valid('phrasal-verb-02', v_awaiting_newer)
    or not public._phrasal_verb_system_result_valid('phrasal-verb-02', v_collapsed)
    or not public._phrasal_verb_system_result_valid('phrasal-verb-02', v_collapsed_newer)
    or not public._phrasal_verb_system_result_valid('phrasal-verb-02', v_forward)
    or not public._phrasal_verb_system_result_valid('phrasal-verb-02', v_correction_a)
    or not public._phrasal_verb_system_result_valid('phrasal-verb-02', v_correction_b)
    or not public._phrasal_verb_system_result_valid('phrasal-verb-02', v_correction_newer)
  then
    raise exception 'Phrasal V3 verification fixture is invalid';
  end if;

  if public._phrasal_verb_system_result_valid(
    'phrasal-verb-02',
    jsonb_set(v_base, '{controlRevision}', '1.5'::jsonb)
  )
    or public._phrasal_verb_system_result_valid(
      'phrasal-verb-02',
      jsonb_set(v_base, '{controlRevision}', '-1'::jsonb)
    )
    or public._phrasal_verb_system_result_valid(
      'phrasal-verb-02',
      jsonb_set(v_base, '{controlRevision}', '2147483648'::jsonb)
    )
  then
    raise exception 'Invalid controlRevision was accepted';
  end if;

  if not public._phrasal_verb_system_snapshot_is_dominated(
    v_base,
    jsonb_set(v_base, '{controlRevision}', '0'::jsonb)
  )
    or not public._phrasal_verb_system_snapshot_is_dominated(
      jsonb_set(v_base, '{controlRevision}', '0'::jsonb),
      v_base
    )
  then
    raise exception 'Missing legacy controlRevision did not normalize to zero';
  end if;

  if public._phrasal_verb_system_snapshot_is_dominated(v_base, v_awaiting)
    or public._phrasal_verb_system_snapshot_is_dominated(v_awaiting, v_base)
  then
    raise exception 'Equal-structure awaitingNextRound branches were ordered';
  end if;

  if public._phrasal_verb_system_snapshot_is_dominated(v_base, v_collapsed)
    or public._phrasal_verb_system_snapshot_is_dominated(v_collapsed, v_base)
  then
    raise exception 'Equal-structure collapsed-card branches were ordered';
  end if;

  if not public._phrasal_verb_system_snapshot_is_dominated(
    v_awaiting_newer,
    v_base
  )
    or public._phrasal_verb_system_snapshot_is_dominated(
      v_base,
      v_awaiting_newer
    )
    or not public._phrasal_verb_system_snapshot_is_dominated(
      v_collapsed_newer,
      v_base
    )
  then
    raise exception 'Higher controlRevision did not order control-only progress';
  end if;

  if public._phrasal_verb_system_snapshot_is_dominated(v_correction_a, v_correction_b)
    or public._phrasal_verb_system_snapshot_is_dominated(v_correction_b, v_correction_a)
  then
    raise exception 'Incomparable correction-control branches were ordered';
  end if;

  if not public._phrasal_verb_system_snapshot_is_dominated(
    v_correction_newer,
    v_correction_a
  )
    or public._phrasal_verb_system_snapshot_is_dominated(
      v_correction_a,
      v_correction_newer
    )
  then
    raise exception 'Higher correction controlRevision was not respected';
  end if;

  if not public._phrasal_verb_system_snapshot_is_dominated(v_forward, v_awaiting_newer)
  then
    raise exception 'Next-round forward progress did not dominate the prior snapshot';
  end if;

  perform * from public.phrasal_verb_system_upsert_attempt(
    v_attempt_id, v_student_id, 'phrasal-verb-02', '1', 'in_progress',
    1, 1, 50, 1000, v_started_at, v_base
  );

  select attempt.updated_at, attempt.result
  into v_before_updated_at, v_before_result
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = v_attempt_id;

  v_rejected := false;
  begin
    perform * from public.phrasal_verb_system_upsert_attempt(
      v_attempt_id, v_student_id, 'phrasal-verb-02', '1', 'in_progress',
      1, 1, 50, 1000, v_started_at, v_awaiting
    );
  exception
    when sqlstate '22023' then v_rejected := true;
  end;

  if not v_rejected then
    raise exception 'Equal-counter control-state branch was not rejected';
  end if;

  select attempt.updated_at, attempt.result
  into v_after_updated_at, v_after_result
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = v_attempt_id;

  if v_after_updated_at is distinct from v_before_updated_at
    or v_after_result is distinct from v_before_result
  then
    raise exception 'Rejected control-state branch overwrote canonical data';
  end if;

  -- The same control-only change with a higher revision is legitimate and
  -- must not loop on 409.
  perform * from public.phrasal_verb_system_upsert_attempt(
    v_attempt_id, v_student_id, 'phrasal-verb-02', '1', 'in_progress',
    1, 1, 50, 1000, v_started_at, v_awaiting_newer
  );

  select attempt.result
  into v_after_result
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = v_attempt_id;

  if v_after_result is distinct from v_awaiting_newer then
    raise exception 'Higher-revision control-only update was not accepted';
  end if;

  perform * from public.phrasal_verb_system_upsert_attempt(
    v_attempt_id, v_student_id, 'phrasal-verb-02', '1', 'in_progress',
    2, 1, 50, 2000, v_started_at, v_forward
  );

  select attempt.updated_at, attempt.result
  into v_before_updated_at, v_before_result
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = v_attempt_id;

  if v_before_result is distinct from v_forward then
    raise exception 'Legitimate next-round forward progress was rejected';
  end if;

  -- The stale snapshot has a different control flag, but is structurally
  -- dominated by round 2 and must be a byte-preserving no-op.
  perform * from public.phrasal_verb_system_upsert_attempt(
    v_attempt_id, v_student_id, 'phrasal-verb-02', '1', 'in_progress',
    1, 1, 50, 1000, v_started_at, v_awaiting_newer
  );

  select attempt.updated_at, attempt.result
  into v_after_updated_at, v_after_result
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = v_attempt_id;

  if v_after_updated_at is distinct from v_before_updated_at
    or v_after_result is distinct from v_before_result
  then
    raise exception 'Structurally dominated retry changed canonical data';
  end if;
end;
$behavior$;

rollback;
