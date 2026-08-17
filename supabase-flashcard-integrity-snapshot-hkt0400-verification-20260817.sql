-- Rollback-only verification for the Flashcard 04:00 HKT snapshot policy.
--
-- This validates installed function source, least-privilege ACLs, the public watchdog
-- chain, and fixed Hong Kong boundary cases. A temporary watchdog credential is used
-- to exercise the unchanged public schema .3 contract with snapshot checks disabled.
-- The final ROLLBACK discards that credential and every transaction-local setting.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

do $snapshot_hkt0400_verification$
declare
  v_capture pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'flashcard_integrity.capture_nightly_snapshot()'
  );
  v_watchdog pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health_snapshot_v7_internal()'
  );
  v_watchdog_adapter pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health_snapshot_required_internal()'
  );
  v_public_watchdog pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health()'
  );
  v_pre_batch_watchdog pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health_pre_batch_digest_internal()'
  );
  v_pre_outbox_watchdog pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health_pre_outbox_ack_internal()'
  );
  v_capture_definition text;
  v_watchdog_definition text;
  v_adapter_definition text;
  v_public_definition text;
  v_pre_batch_definition text;
  v_pre_outbox_definition text;
  v_token text := 'snapshot-hkt0400-verification-token-0123456789abcdef-0123456789';
  v_health jsonb;
  v_scheduler_status jsonb;
begin
  if v_capture is null
     or v_watchdog is null
     or v_watchdog_adapter is null
     or v_public_watchdog is null
     or v_pre_batch_watchdog is null
     or v_pre_outbox_watchdog is null then
    raise exception 'Required Flashcard snapshot/watchdog function chain is missing.';
  end if;

  select
    pg_catalog.pg_get_functiondef(v_capture),
    pg_catalog.pg_get_functiondef(v_watchdog),
    pg_catalog.pg_get_functiondef(v_watchdog_adapter),
    pg_catalog.pg_get_functiondef(v_public_watchdog),
    pg_catalog.pg_get_functiondef(v_pre_batch_watchdog),
    pg_catalog.pg_get_functiondef(v_pre_outbox_watchdog)
  into
    v_capture_definition,
    v_watchdog_definition,
    v_adapter_definition,
    v_public_definition,
    v_pre_batch_definition,
    v_pre_outbox_definition;

  if pg_catalog.strpos(
       v_capture_definition,
       'v_scheduled_for := (v_snapshot_date::timestamp + interval ''4 hours'') at time zone ''Asia/Hong_Kong'';'
     ) = 0
     or pg_catalog.strpos(
       v_capture_definition,
       'v_scheduled_for := v_snapshot_date::timestamp at time zone ''Asia/Hong_Kong'';'
     ) > 0 then
    raise exception 'capture_nightly_snapshot() does not use the reviewed 04:00 HKT scheduled_for policy.';
  end if;

  if pg_catalog.strpos(v_watchdog_definition, 'time ''04:15''') = 0
     or pg_catalog.strpos(v_watchdog_definition, 'time ''00:15''') > 0
     or pg_catalog.strpos(v_watchdog_definition, 'The 04:00 HKT snapshot') = 0
     or pg_catalog.strpos(v_watchdog_definition, 'Before 04:15') = 0 then
    raise exception 'Private watchdog does not use the reviewed 04:15 HKT expected-date cutoff.';
  end if;

  if pg_catalog.strpos(
       pg_catalog.lower(v_adapter_definition),
       'flashcard_integrity_health_snapshot_v7_internal'
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_adapter_definition),
       'supplementaleighttriggerinventory'
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_public_definition),
       '''schemaversion'', ''2026-08-15.3'''
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_public_definition),
       'flashcard_integrity_health_pre_batch_digest_internal'
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_pre_batch_definition),
       '''schemaversion'', ''2026-08-15.2'''
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_pre_batch_definition),
       'flashcard_integrity_health_pre_outbox_ack_internal'
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_pre_outbox_definition),
       '''schemaversion'', ''2026-08-15.1'''
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_pre_outbox_definition),
       'flashcard_integrity_health_snapshot_required_internal'
     ) = 0 then
    raise exception 'Public/private watchdog chain identity check failed.';
  end if;

  if pg_catalog.has_function_privilege(
       'anon',
       'flashcard_integrity.capture_nightly_snapshot()',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'authenticated',
       'flashcard_integrity.capture_nightly_snapshot()',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'service_role',
       'flashcard_integrity.capture_nightly_snapshot()',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'anon',
       'public.flashcard_integrity_health_snapshot_v7_internal()',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'authenticated',
       'public.flashcard_integrity_health_snapshot_v7_internal()',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'service_role',
       'public.flashcard_integrity_health_snapshot_v7_internal()',
       'EXECUTE'
     ) then
    raise exception 'A private snapshot/watchdog function gained client-role EXECUTE.';
  end if;

  -- Fixed-clock expression checks prevent a server/session timezone from changing the
  -- intended 04:00 HKT instant. Hong Kong 04:00 is 20:00 UTC on the prior UTC date.
  if (
       (date '2026-08-17'::timestamp + interval '4 hours')
         at time zone 'Asia/Hong_Kong'
     ) is distinct from timestamptz '2026-08-16 20:00:00+00' then
    raise exception '04:00 HKT scheduled_for expression maps to the wrong UTC instant.';
  end if;

  if (
       case
         when timestamp '2026-08-17 04:14:59'::time >= time '04:15'
           then timestamp '2026-08-17 04:14:59'::date
         else timestamp '2026-08-17 04:14:59'::date - 1
       end
     ) is distinct from date '2026-08-16'
     or (
       case
         when timestamp '2026-08-17 04:15:00'::time >= time '04:15'
           then timestamp '2026-08-17 04:15:00'::date
         else timestamp '2026-08-17 04:15:00'::date - 1
       end
     ) is distinct from date '2026-08-17' then
    raise exception '04:15 HKT expected-date boundary is incorrect.';
  end if;

  insert into flashcard_integrity.watchdog_credentials (
    label,
    token_digest,
    enabled,
    valid_after,
    valid_until
  ) values (
    '__snapshot_hkt0400_verification__' || pg_catalog.gen_random_uuid()::text,
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

  if (v_health ->> 'schemaVersion') is distinct from '2026-08-15.3'
     or (v_health #>> '{checks,snapshot,enabled}') is distinct from 'false'
     or (v_health #>> '{checks,triggers,expectedCount}') is distinct from '8'
     or (v_health #>> '{checks,triggers,supplementalEightTriggerInventory}')
          is distinct from 'true' then
    raise exception '04:00 HKT migration changed the public watchdog contract: %',
      v_health;
  end if;

  v_scheduler_status := flashcard_integrity.snapshot_scheduler_status();
  raise notice 'Flashcard 04:00 HKT snapshot-policy verification PASSED. Scheduler status was read only: %',
    v_scheduler_status;
end;
$snapshot_hkt0400_verification$;

rollback;
