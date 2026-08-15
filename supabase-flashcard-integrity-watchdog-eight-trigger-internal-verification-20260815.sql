-- Transactional verification for the supplemental eight-trigger internal watchdog.
-- It creates one temporary token digest, calls the unchanged public snapshot-gate RPC,
-- and rolls the credential row back. It does not disable any protection trigger.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

do $verification$
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
  v_token text := 'verification-only-token-0123456789abcdef-0123456789abcdef';
  v_health jsonb;
begin
  if v_public_wrapper is null
     or v_current_internal is null
     or v_preserved_v7 is null then
    raise exception 'Required public/internal watchdog functions are missing.';
  end if;

  if pg_catalog.strpos(
       pg_catalog.lower(pg_catalog.pg_get_functiondef(v_public_wrapper)),
       'x-flashcard-watchdog-snapshot-checks-enabled'
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(pg_catalog.pg_get_functiondef(v_current_internal)),
       'flashcard_state_zy_legacy_object_merge'
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(pg_catalog.pg_get_functiondef(v_current_internal)),
       'supplementaleighttriggerinventory'
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(pg_catalog.pg_get_functiondef(v_preserved_v7)),
       'x-flashcard-watchdog-token'
     ) = 0 then
    raise exception 'Public snapshot wrapper or internal implementation identity check failed.';
  end if;

  if not pg_catalog.has_function_privilege(
       'anon', 'public.flashcard_integrity_health()', 'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'authenticated', 'public.flashcard_integrity_health_snapshot_required_internal()', 'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'anon', 'public.flashcard_integrity_health_snapshot_required_internal()', 'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'service_role', 'public.flashcard_integrity_health_snapshot_required_internal()', 'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'authenticated', 'public.flashcard_integrity_health_snapshot_v7_internal()', 'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'anon', 'public.flashcard_integrity_health_snapshot_v7_internal()', 'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'service_role', 'public.flashcard_integrity_health_snapshot_v7_internal()', 'EXECUTE'
     ) then
    raise exception 'Watchdog public/internal function ACLs are not least privilege.';
  end if;

  if pg_catalog.has_table_privilege(
       'anon', 'flashcard_integrity.watchdog_credentials', 'SELECT,INSERT,UPDATE,DELETE'
     )
     or pg_catalog.has_table_privilege(
       'authenticated', 'flashcard_integrity.watchdog_credentials', 'SELECT,INSERT,UPDATE,DELETE'
     )
     or pg_catalog.has_table_privilege(
       'service_role', 'flashcard_integrity.watchdog_credentials', 'SELECT,INSERT,UPDATE,DELETE'
     ) then
    raise exception 'Watchdog credential table gained a client-role privilege.';
  end if;

  insert into flashcard_integrity.watchdog_credentials (
    label,
    token_digest,
    enabled,
    valid_after,
    valid_until
  ) values (
    '__eight_trigger_internal_verification__' || pg_catalog.gen_random_uuid()::text,
    extensions.digest(pg_catalog.convert_to(v_token, 'UTF8'), 'sha256'),
    true,
    now() - interval '1 minute',
    now() + interval '10 minutes'
  );

  perform pg_catalog.set_config(
    'request.headers',
    pg_catalog.jsonb_build_object(
      'x-flashcard-watchdog-token', v_token,
      'x-flashcard-watchdog-snapshot-checks-enabled', 'false'
    )::text,
    true
  );

  v_health := public.flashcard_integrity_health();

  if v_health ->> 'schemaVersion' <> '2026-08-15.1'
     or v_health #>> '{checks,snapshot,enabled}' <> 'false'
     or v_health #>> '{checks,triggers,expectedCount}' <> '8'
     or v_health #>> '{checks,triggers,supplementalEightTriggerInventory}' <> 'true'
     or v_health #>> '{checks,triggers,healthy}' <> 'true'
     or v_health #>> '{checks,triggers,missingCount}' <> '0'
     or coalesce(v_health -> 'incidentCodes', '[]'::jsonb)
          @> '["integrity_trigger_missing"]'::jsonb then
    raise exception 'Eight-trigger internal watchdog verification failed: %', v_health;
  end if;

  raise notice 'Eight-trigger internal watchdog verification PASSED; rolling back temporary credential.';
end;
$verification$;

rollback;
