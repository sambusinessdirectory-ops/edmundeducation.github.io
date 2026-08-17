-- Flashcard nightly snapshot policy: 04:00 Asia/Hong_Kong with a 15-minute grace.
--
-- This is a source-alignment migration only. It changes the scheduled_for metadata
-- produced by capture_nightly_snapshot() and the expected-date boundary used by the
-- already-deployed private watchdog implementation. It deliberately creates,
-- alters, enables, disables, or removes no pg_cron/Worker/GitHub scheduler.
--
-- The migration transforms the installed reviewed function definitions instead of
-- re-stating hundreds of lines of security-sensitive snapshot/watchdog logic. Every
-- dependency and source marker is checked before either function is replaced, so an
-- unknown or partially installed production shape fails closed and the transaction
-- rolls back without a partial policy change. Reapplication is idempotent.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

select pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended(
    'flashcard-integrity-snapshot-hkt0400-v1',
    0
  )
);

do $snapshot_hkt0400$
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
  v_capture_old text :=
    'v_scheduled_for := v_snapshot_date::timestamp at time zone ''Asia/Hong_Kong'';';
  v_capture_new text :=
    'v_scheduled_for := (v_snapshot_date::timestamp + interval ''4 hours'') at time zone ''Asia/Hong_Kong'';';
  v_watchdog_old text := 'time ''00:15''';
  v_watchdog_new text := 'time ''04:15''';
  v_capture_old_count integer;
  v_capture_new_count integer;
  v_watchdog_old_count integer;
  v_watchdog_new_count integer;
  v_capture_needs_update boolean;
  v_watchdog_needs_update boolean;
begin
  if v_capture is null
     or v_watchdog is null
     or v_watchdog_adapter is null
     or v_public_watchdog is null
     or v_pre_batch_watchdog is null
     or v_pre_outbox_watchdog is null then
    raise exception using
      errcode = '55000',
      message = 'Required Flashcard snapshot/watchdog function chain is missing; 04:00 HKT migration made no changes.';
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

  -- Fail closed unless this is the reviewed private capture routine. SECURITY
  -- DEFINER, empty search_path, deterministic manifest verification, and failure
  -- alerting must all survive this timing-only migration.
  if pg_catalog.strpos(
       pg_catalog.lower(v_capture_definition),
       'security definer'
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_capture_definition),
       'set search_path to '''''
     ) = 0
     or pg_catalog.strpos(
       v_capture_definition,
       'flashcard_integrity.student_snapshots'
     ) = 0
     or pg_catalog.strpos(v_capture_definition, 'v_expected := v_actual') = 0
     or pg_catalog.strpos(v_capture_definition, 'manifest_checksum') = 0
     or pg_catalog.strpos(v_capture_definition, 'nightly_snapshot_failed') = 0
     or pg_catalog.strpos(v_capture_definition, '''snapshot_cron''') = 0 then
    raise exception using
      errcode = '55000',
      message = 'Installed capture_nightly_snapshot() is not the reviewed integrity implementation; 04:00 HKT migration made no changes.';
  end if;

  v_capture_old_count := (
    pg_catalog.length(v_capture_definition)
      - pg_catalog.length(pg_catalog.replace(v_capture_definition, v_capture_old, ''))
  ) / pg_catalog.length(v_capture_old);
  v_capture_new_count := (
    pg_catalog.length(v_capture_definition)
      - pg_catalog.length(pg_catalog.replace(v_capture_definition, v_capture_new, ''))
  ) / pg_catalog.length(v_capture_new);
  v_capture_needs_update :=
    v_capture_old_count = 1 and v_capture_new_count = 0;

  if not v_capture_needs_update
     and not (v_capture_old_count = 0 and v_capture_new_count = 1) then
    raise exception using
      errcode = '55000',
      message = 'capture_nightly_snapshot() has an unknown scheduled_for policy; 04:00 HKT migration made no changes.';
  end if;

  -- The public .3 wrapper must still be the deployed aggregate-only contract, and
  -- its private eight-trigger adapter must still call the preserved authorized v7
  -- implementation whose snapshot cutoff is being changed.
  if pg_catalog.strpos(
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
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_adapter_definition),
       'flashcard_integrity_health_snapshot_v7_internal'
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_adapter_definition),
       'supplementaleighttriggerinventory'
     ) = 0 then
    raise exception using
      errcode = '55000',
      message = 'Installed public/private watchdog chain is not the reviewed schema .3/eight-trigger implementation; 04:00 HKT migration made no changes.';
  end if;

  if pg_catalog.strpos(
       pg_catalog.lower(v_watchdog_definition),
       'security definer'
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_watchdog_definition),
       'stable'
     ) = 0
     or pg_catalog.strpos(
       pg_catalog.lower(v_watchdog_definition),
       'set search_path to '''''
     ) = 0
     or pg_catalog.strpos(v_watchdog_definition, 'x-flashcard-watchdog-token') = 0
     or pg_catalog.strpos(v_watchdog_definition, 'watchdog_credentials') = 0
     or pg_catalog.strpos(v_watchdog_definition, 'v_expected_snapshot_date') = 0
     or pg_catalog.strpos(v_watchdog_definition, 'nightly_snapshot_late') = 0
     or pg_catalog.strpos(v_watchdog_definition, 'nightly_snapshot_failed') = 0
     or pg_catalog.strpos(v_watchdog_definition, 'nightly_snapshot_corrupt') = 0 then
    raise exception using
      errcode = '55000',
      message = 'Installed private watchdog is not the reviewed authorized snapshot implementation; 04:00 HKT migration made no changes.';
  end if;

  v_watchdog_old_count := (
    pg_catalog.length(v_watchdog_definition)
      - pg_catalog.length(pg_catalog.replace(v_watchdog_definition, v_watchdog_old, ''))
  ) / pg_catalog.length(v_watchdog_old);
  v_watchdog_new_count := (
    pg_catalog.length(v_watchdog_definition)
      - pg_catalog.length(pg_catalog.replace(v_watchdog_definition, v_watchdog_new, ''))
  ) / pg_catalog.length(v_watchdog_new);
  v_watchdog_needs_update :=
    v_watchdog_old_count = 1 and v_watchdog_new_count = 0;

  if not v_watchdog_needs_update
     and not (v_watchdog_old_count = 0 and v_watchdog_new_count = 1) then
    raise exception using
      errcode = '55000',
      message = 'Private watchdog has an unknown expected-snapshot cutoff; 04:00 HKT migration made no changes.';
  end if;

  -- All preconditions above are evaluated before either definition changes.
  if v_capture_needs_update then
    v_capture_definition := pg_catalog.replace(
      v_capture_definition,
      v_capture_old,
      v_capture_new
    );
    execute v_capture_definition;
  end if;

  if v_watchdog_needs_update then
    v_watchdog_definition := pg_catalog.replace(
      v_watchdog_definition,
      v_watchdog_old,
      v_watchdog_new
    );
    v_watchdog_definition := pg_catalog.replace(
      v_watchdog_definition,
      'The 00:00 HKT snapshot',
      'The 04:00 HKT snapshot'
    );
    v_watchdog_definition := pg_catalog.replace(
      v_watchdog_definition,
      'Before 00:15',
      'Before 04:15'
    );
    execute v_watchdog_definition;
  end if;
end;
$snapshot_hkt0400$;

-- CREATE OR REPLACE retains ACLs, but repeat the least-privilege posture explicitly
-- so this migration cannot make either private function API-callable.
revoke all on function flashcard_integrity.capture_nightly_snapshot()
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_integrity_health_snapshot_v7_internal()
  from public, anon, authenticated, service_role;

-- Deliberately no cron.schedule(), cron.alter_job(), cron.unschedule(), or cron.job
-- mutation. The independent scheduler remains a separate reviewed deployment.
commit;
