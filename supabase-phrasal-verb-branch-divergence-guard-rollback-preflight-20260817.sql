-- Fail-closed emergency rollback preflight for the V2 Phrasal branch guard.
-- This file DOES NOT weaken or replace the live function. It verifies that the
-- reviewed V2 target is present, then deliberately aborts. Any real rollback
-- must install the separately reviewed V1 function body during a coordinated
-- maintenance window after evidence is preserved and 409 recovery is healthy.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

do $rollback_preflight$
declare
  v_signature regprocedure :=
    'public.phrasal_verb_system_upsert_attempt(uuid,uuid,text,text,text,integer,integer,integer,integer,timestamp with time zone,jsonb)'::regprocedure;
  v_definition text := pg_catalog.pg_get_functiondef(
    'public.phrasal_verb_system_upsert_attempt(uuid,uuid,text,text,text,integer,integer,integer,integer,timestamp with time zone,jsonb)'::regprocedure
  );
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'edmund-phrasal-verb-branch-divergence-guard-v2',
      0
    )
  );

  if pg_catalog.strpos(v_definition, 'PHRASAL_BRANCH_DIVERGENCE_GUARD_V2') = 0 then
    raise exception 'V2 Phrasal branch guard is not installed; refusing rollback';
  end if;

  if pg_catalog.strpos(v_definition, 'Attempt progress branches diverged') = 0
    or pg_catalog.strpos(v_definition, 'v_incoming_dominates') = 0
    or pg_catalog.strpos(v_definition, 'v_canonical_dominates') = 0
  then
    raise exception 'V2 Phrasal branch guard drifted; refusing blind rollback';
  end if;

  -- The emergency rollback deliberately stops rather than attempting to
  -- reconstruct the long V1 guard dynamically. Apply the reviewed V1 migration
  -- file only after this marker/preflight transaction has confirmed the target.
  raise exception 'Rollback preflight passed; apply the reviewed V1 function body in a coordinated maintenance window';
end;
$rollback_preflight$;

rollback;
