-- Fail-closed emergency rollback preflight for the V3 Phrasal control guard.
-- This file DOES NOT weaken or replace either live function. It verifies the
-- reviewed V3 target, then deliberately aborts. A real rollback must install
-- the separately reviewed V2 helper/upsert bodies during a maintenance window.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

select pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended(
    'edmund-phrasal-verb-control-state-guard-v3',
    0
  )
);

do $rollback_preflight$
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
    raise exception 'Phrasal V3 functions are missing; refusing rollback';
  end if;

  v_upsert_definition := pg_catalog.pg_get_functiondef(v_upsert);
  v_helper_definition := pg_catalog.pg_get_functiondef(v_helper);
  v_validator_definition := pg_catalog.pg_get_functiondef(v_validator);

  if pg_catalog.strpos(v_upsert_definition, 'PHRASAL_CONTROL_STATE_GUARD_V3') = 0
    or pg_catalog.strpos(v_upsert_definition, 'PHRASAL_BRANCH_DIVERGENCE_GUARD_V2') = 0
    or pg_catalog.strpos(v_helper_definition, 'PHRASAL_CONTROL_STATE_GUARD_V3') = 0
    or pg_catalog.strpos(v_helper_definition, 'v_existing_control_revision') = 0
    or pg_catalog.strpos(v_helper_definition, 'v_candidate_control_revision') = 0
    or pg_catalog.strpos(v_helper_definition, 'v_controls_equal') = 0
    or pg_catalog.strpos(v_helper_definition, 'awaitingNextRound') = 0
    or pg_catalog.strpos(v_helper_definition, 'correctionMode') = 0
    or pg_catalog.strpos(v_helper_definition, 'correctionIds') = 0
    or pg_catalog.strpos(v_helper_definition, 'collapsedCorrectIds') = 0
    or pg_catalog.strpos(v_validator_definition, 'PHRASAL_CONTROL_REVISION_V3') = 0
    or pg_catalog.strpos(v_validator_definition, '2147483647') = 0
  then
    raise exception 'Phrasal V3 guard drifted; refusing blind rollback';
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
    raise exception 'Phrasal V3 ACL drifted; refusing rollback';
  end if;

  raise exception 'Rollback preflight passed; apply the reviewed V2 helper and upsert bodies only during a coordinated maintenance window';
end;
$rollback_preflight$;

rollback;
