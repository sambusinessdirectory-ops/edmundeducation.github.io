-- Fail-closed forward rollback for the supplemental internal inventory adapter.
-- The public snapshot-gate wrapper, credential table/rows, and preserved authorized
-- v7 implementation remain untouched. The internal adapter becomes a private
-- passthrough to the preserved seven-trigger implementation.
--
-- In the same database session, an operator must first run:
--   set flashcard_integrity.watchdog_internal_inventory_rollback_approved =
--     'confirmed-watchdog-internal-inventory-rollback-20260815';

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

do $$
declare
  v_public_wrapper pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health()'
  );
  v_current_internal pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health_snapshot_required_internal()'
  );
  v_preserved_v7 pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health_snapshot_v7_internal()'
  );
begin
  if pg_catalog.current_setting(
       'flashcard_integrity.watchdog_internal_inventory_rollback_approved', true
     ) is distinct from
       'confirmed-watchdog-internal-inventory-rollback-20260815' then
    raise exception using
      errcode = '55000',
      message = 'Watchdog internal inventory rollback not approved; no function changed.';
  end if;

  if v_public_wrapper is null
     or v_current_internal is null
     or v_preserved_v7 is null
     or pg_catalog.strpos(
       pg_catalog.lower(pg_catalog.pg_get_functiondef(v_public_wrapper)),
       'x-flashcard-watchdog-snapshot-checks-enabled'
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(pg_catalog.pg_get_functiondef(v_current_internal)),
       'supplementaleighttriggerinventory'
     ) = 0 then
    raise exception using
      errcode = '55000',
      message = 'Reviewed supplemental watchdog shape is not installed; rollback made no changes.';
  end if;
end;
$$;

create or replace function public.flashcard_integrity_health_snapshot_required_internal()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  return public.flashcard_integrity_health_snapshot_v7_internal();
end;
$$;

revoke all on function public.flashcard_integrity_health_snapshot_required_internal()
  from public, anon, authenticated, service_role;

-- Deliberately preserve the public snapshot-gate wrapper and credentials.
commit;
