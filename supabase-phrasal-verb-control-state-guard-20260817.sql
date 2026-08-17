-- V3: reject incomparable Phrasal control-state branches.
--
-- V2 compares durable answer/history facts in both directions. V3 additionally
-- orders awaitingNextRound, correction mode/IDs, and collapsed-card IDs by an
-- explicit monotonic controlRevision (legacy snapshots default to zero).
-- Equal-revision disagreements remain incomparable; a higher revision advances
-- controls, while a lower revision remains a safe idempotent retry.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

select pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended(
    'edmund-phrasal-verb-control-state-guard-v3',
    0
  )
);

do $preflight$
declare
  v_upsert regprocedure := pg_catalog.to_regprocedure(
    'public.phrasal_verb_system_upsert_attempt(uuid,uuid,text,text,text,integer,integer,integer,integer,timestamp with time zone,jsonb)'
  );
  v_helper regprocedure := pg_catalog.to_regprocedure(
    'public._phrasal_verb_system_snapshot_is_dominated(jsonb,jsonb)'
  );
  v_validator regprocedure := pg_catalog.to_regprocedure(
    'public._phrasal_verb_system_result_valid(text,jsonb)'
  );
  v_upsert_definition text;
  v_helper_definition text;
  v_validator_definition text;
begin
  if v_upsert is null or v_helper is null or v_validator is null then
    raise exception 'Phrasal V2 merge functions are missing';
  end if;

  v_upsert_definition := pg_catalog.pg_get_functiondef(v_upsert);
  v_helper_definition := pg_catalog.pg_get_functiondef(v_helper);
  v_validator_definition := pg_catalog.pg_get_functiondef(v_validator);

  if pg_catalog.strpos(v_upsert_definition, 'PHRASAL_CONTROL_STATE_GUARD_V3') > 0
    and pg_catalog.strpos(v_helper_definition, 'PHRASAL_CONTROL_STATE_GUARD_V3') > 0
    and pg_catalog.strpos(v_validator_definition, 'PHRASAL_CONTROL_REVISION_V3') > 0
  then
    if pg_catalog.strpos(v_helper_definition, 'v_existing_control_revision') = 0
      or pg_catalog.strpos(v_helper_definition, 'v_candidate_control_revision') = 0
      or pg_catalog.strpos(v_helper_definition, 'v_controls_equal') = 0
      or pg_catalog.strpos(v_helper_definition, 'collapsedCorrectIds') = 0
    then
      raise exception 'Installed Phrasal V3 control-state guard is incomplete';
    end if;
    return;
  end if;

  if pg_catalog.md5(v_upsert_definition) <> '52fcf6e23f9b1ff8444419c58804518e'
    or pg_catalog.strpos(v_upsert_definition, 'PHRASAL_BRANCH_DIVERGENCE_GUARD_V2') = 0
  then
    raise exception 'Unreviewed Phrasal V2 upsert drift; refusing V3 replacement';
  end if;

  if pg_catalog.md5(v_helper_definition) <> '82f2622814f04bd03651ffec3a6fe68c'
  then
    raise exception 'Unreviewed Phrasal V2 dominance-helper drift; refusing V3 replacement';
  end if;

  if pg_catalog.md5(v_validator_definition) <> 'd19560ebb208369b6cc5eadc6fa904ef'
  then
    raise exception 'Unreviewed Phrasal V2 result-validator drift; refusing V3 replacement';
  end if;

  if pg_catalog.has_function_privilege('anon', v_upsert, 'EXECUTE')
    or pg_catalog.has_function_privilege('authenticated', v_upsert, 'EXECUTE')
    or not pg_catalog.has_function_privilege('service_role', v_upsert, 'EXECUTE')
    or pg_catalog.has_function_privilege('anon', v_helper, 'EXECUTE')
    or pg_catalog.has_function_privilege('authenticated', v_helper, 'EXECUTE')
    or pg_catalog.has_function_privilege('service_role', v_helper, 'EXECUTE')
    or pg_catalog.has_function_privilege('anon', v_validator, 'EXECUTE')
    or pg_catalog.has_function_privilege('authenticated', v_validator, 'EXECUTE')
    or pg_catalog.has_function_privilege('service_role', v_validator, 'EXECUTE')
  then
    raise exception 'Phrasal V2 upsert ACL is not the reviewed baseline';
  end if;
end;
$preflight$;

do $validator$
declare
  v_validator regprocedure :=
    'public._phrasal_verb_system_result_valid(text,jsonb)'::regprocedure;
  v_definition text := pg_catalog.pg_get_functiondef(v_validator);
  v_old_declaration text := E'declare\n  v_question_count integer;\n';
  v_new_declaration text := E'declare\n  -- PHRASAL_CONTROL_REVISION_V3\n  v_question_count integer;\n';
  v_old_keys text := E'        ''collapsedCorrectIds'',\n        ''contentVersion''\n';
  v_new_keys text := E'        ''collapsedCorrectIds'',\n        ''controlRevision'',\n        ''contentVersion''\n';
  v_old_tail text := E'    or p_result ->> ''contentVersion'' <> ''1''\n  then\n';
  v_new_tail text := E'    or p_result ->> ''contentVersion'' <> ''1''\n    or (\n      p_result ? ''controlRevision''\n      and (\n        jsonb_typeof(p_result -> ''controlRevision'') <> ''number''\n        or coalesce(p_result ->> ''controlRevision'', '''') !~ ''^(0|[1-9][0-9]{0,9})$''\n        or (p_result ->> ''controlRevision'')::numeric > 2147483647\n      )\n    )\n  then\n';
begin
  if pg_catalog.strpos(v_definition, 'PHRASAL_CONTROL_REVISION_V3') = 0 then
    if pg_catalog.strpos(v_definition, v_old_declaration) = 0
      or pg_catalog.strpos(v_definition, '  if v_key_count not in (6, 9)') = 0
      or pg_catalog.strpos(v_definition, v_old_keys) = 0
      or pg_catalog.strpos(v_definition, v_old_tail) = 0
    then
      raise exception 'Reviewed Phrasal V2 validator replacement anchors are missing';
    end if;

    v_definition := pg_catalog.replace(v_definition, v_old_declaration, v_new_declaration);
    v_definition := pg_catalog.replace(
      v_definition,
      '  if v_key_count not in (6, 9)',
      '  if v_key_count not in (6, 7, 9, 10)'
    );
    v_definition := pg_catalog.replace(v_definition, v_old_keys, v_new_keys);
    v_definition := pg_catalog.replace(v_definition, v_old_tail, v_new_tail);
    execute v_definition;
  end if;

  if pg_catalog.strpos(
    pg_catalog.pg_get_functiondef(v_validator),
    'PHRASAL_CONTROL_REVISION_V3'
  ) = 0 then
    raise exception 'Phrasal V3 result-validator marker was not installed';
  end if;
end;
$validator$;

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
  -- PHRASAL_CONTROL_STATE_GUARD_V3
  v_candidate_round_count integer;
  v_existing_round_count integer;
  v_candidate_round_number integer;
  v_existing_round_number integer;
  v_index integer;
  v_question_id text;
  v_candidate_question jsonb;
  v_existing_question jsonb;
  v_candidate_status text;
  v_existing_status text;
  v_candidate_control_revision integer;
  v_existing_control_revision integer;
  v_controls_equal boolean;
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

  v_candidate_round_number := (p_candidate ->> 'round')::integer;
  v_existing_round_number := (p_existing ->> 'round')::integer;

  if (p_existing ? 'controlRevision' and jsonb_typeof(p_existing -> 'controlRevision') <> 'number')
    or (p_candidate ? 'controlRevision' and jsonb_typeof(p_candidate -> 'controlRevision') <> 'number')
    or coalesce(p_existing ->> 'controlRevision', '0') !~ '^(0|[1-9][0-9]{0,9})$'
    or coalesce(p_candidate ->> 'controlRevision', '0') !~ '^(0|[1-9][0-9]{0,9})$'
    or coalesce(p_existing ->> 'controlRevision', '0')::numeric > 2147483647
    or coalesce(p_candidate ->> 'controlRevision', '0')::numeric > 2147483647
  then
    return false;
  end if;

  v_existing_control_revision := coalesce(
    (p_existing ->> 'controlRevision')::integer,
    0
  );
  v_candidate_control_revision := coalesce(
    (p_candidate ->> 'controlRevision')::integer,
    0
  );

  if exists (
    select 1
    from jsonb_array_elements_text(p_candidate -> 'correctIds')
      as candidate_correct(question_id)
    where not (p_existing -> 'correctIds' ? candidate_correct.question_id)
  ) then
    return false;
  end if;

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
      or (
        v_candidate_status = 'wrong'
        and v_existing_status = 'pending'
        and v_existing_round_number = v_candidate_round_number
      )
      or (
        v_candidate_status = v_existing_status
        and coalesce(v_candidate_question ->> 'lastAnswer', '')
          <> coalesce(v_existing_question ->> 'lastAnswer', '')
        and v_existing_round_number = v_candidate_round_number
      )
      or (
        coalesce((v_candidate_question ->> 'reveal')::boolean, false)
        and not coalesce((v_existing_question ->> 'reveal')::boolean, false)
        and v_existing_round_number = v_candidate_round_number
        and v_existing_control_revision <= v_candidate_control_revision
      )
    then
      return false;
    end if;
  end loop;

  v_controls_equal := (p_existing -> 'awaitingNextRound')
      is not distinct from (p_candidate -> 'awaitingNextRound')
    and coalesce(p_existing -> 'correctionMode', 'false'::jsonb)
      is not distinct from coalesce(p_candidate -> 'correctionMode', 'false'::jsonb)
    and coalesce(p_existing -> 'correctionIds', '[]'::jsonb)
      @> coalesce(p_candidate -> 'correctionIds', '[]'::jsonb)
    and coalesce(p_candidate -> 'correctionIds', '[]'::jsonb)
      @> coalesce(p_existing -> 'correctionIds', '[]'::jsonb)
    and coalesce(p_existing -> 'collapsedCorrectIds', '[]'::jsonb)
      @> coalesce(p_candidate -> 'collapsedCorrectIds', '[]'::jsonb)
    and coalesce(p_candidate -> 'collapsedCorrectIds', '[]'::jsonb)
      @> coalesce(p_existing -> 'collapsedCorrectIds', '[]'::jsonb);

  if v_existing_control_revision < v_candidate_control_revision
    or (
      v_existing_control_revision = v_candidate_control_revision
      and not v_controls_equal
    )
  then
    return false;
  end if;

  return true;
end;
$$;

revoke all on function public._phrasal_verb_system_snapshot_is_dominated(jsonb, jsonb)
  from public, anon, authenticated, service_role;

do $marker$
declare
  v_upsert regprocedure :=
    'public.phrasal_verb_system_upsert_attempt(uuid,uuid,text,text,text,integer,integer,integer,integer,timestamp with time zone,jsonb)'::regprocedure;
  v_definition text := pg_catalog.pg_get_functiondef(v_upsert);
  v_v2_marker text := E'  -- PHRASAL_BRANCH_DIVERGENCE_GUARD_V2\n';
begin
  if pg_catalog.strpos(v_definition, 'PHRASAL_CONTROL_STATE_GUARD_V3') = 0 then
    if pg_catalog.strpos(v_definition, v_v2_marker) = 0 then
      raise exception 'Phrasal V2 marker anchor is missing';
    end if;
    v_definition := pg_catalog.replace(
      v_definition,
      v_v2_marker,
      v_v2_marker || E'  -- PHRASAL_CONTROL_STATE_GUARD_V3\n'
    );
    execute v_definition;
  end if;

  if pg_catalog.strpos(
    pg_catalog.pg_get_functiondef(v_upsert),
    'PHRASAL_CONTROL_STATE_GUARD_V3'
  ) = 0 then
    raise exception 'Phrasal V3 upsert marker was not installed';
  end if;
end;
$marker$;

do $postflight$
declare
  v_upsert regprocedure :=
    'public.phrasal_verb_system_upsert_attempt(uuid,uuid,text,text,text,integer,integer,integer,integer,timestamp with time zone,jsonb)'::regprocedure;
begin
  if pg_catalog.has_function_privilege('anon', v_upsert, 'EXECUTE')
    or pg_catalog.has_function_privilege('authenticated', v_upsert, 'EXECUTE')
    or not pg_catalog.has_function_privilege('service_role', v_upsert, 'EXECUTE')
    or pg_catalog.has_function_privilege(
      'anon',
      'public._phrasal_verb_system_snapshot_is_dominated(jsonb,jsonb)',
      'EXECUTE'
    )
    or pg_catalog.has_function_privilege(
      'service_role',
      'public._phrasal_verb_system_snapshot_is_dominated(jsonb,jsonb)',
      'EXECUTE'
    )
    or pg_catalog.has_function_privilege(
      'service_role',
      'public._phrasal_verb_system_result_valid(text,jsonb)',
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
      'authenticated',
      'public._phrasal_verb_system_snapshot_is_dominated(jsonb,jsonb)',
      'EXECUTE'
    )
  then
    raise exception 'Phrasal V3 function ACL verification failed';
  end if;
end;
$postflight$;

select pg_catalog.pg_notify('pgrst', 'reload schema');

commit;
