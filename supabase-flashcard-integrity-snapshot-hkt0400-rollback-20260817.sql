-- Break-glass rollback for the Flashcard 04:00 HKT snapshot timing policy only.
--
-- This restores scheduled_for metadata to 00:00 HKT and the watchdog cutoff to
-- 00:15 HKT. It does not remove snapshots, alter evidence, change the public health
-- contract, or create/alter/remove any scheduler. Run only after the explicit
-- same-session approval below:
--
--   set flashcard_integrity.snapshot_hkt0400_rollback_approved =
--     'confirmed-restore-midnight-snapshot-policy-20260817';

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

select pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended(
    'flashcard-integrity-snapshot-hkt0400-v1',
    0
  )
);

do $snapshot_hkt0400_rollback$
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
  v_capture_definition text;
  v_watchdog_definition text;
  v_adapter_definition text;
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
  v_capture_needs_rollback boolean;
  v_watchdog_needs_rollback boolean;
begin
  if pg_catalog.current_setting(
       'flashcard_integrity.snapshot_hkt0400_rollback_approved',
       true
     ) is distinct from
       'confirmed-restore-midnight-snapshot-policy-20260817' then
    raise exception using
      errcode = '55000',
      message = '04:00 HKT snapshot-policy rollback not approved; no function changed.';
  end if;

  if v_capture is null or v_watchdog is null or v_watchdog_adapter is null then
    raise exception using
      errcode = '55000',
      message = 'Required Flashcard snapshot/watchdog function chain is missing; rollback made no changes.';
  end if;

  select
    pg_catalog.pg_get_functiondef(v_capture),
    pg_catalog.pg_get_functiondef(v_watchdog),
    pg_catalog.pg_get_functiondef(v_watchdog_adapter)
  into
    v_capture_definition,
    v_watchdog_definition,
    v_adapter_definition;

  if pg_catalog.strpos(v_capture_definition, 'manifest_checksum') = 0
     or pg_catalog.strpos(v_capture_definition, 'nightly_snapshot_failed') = 0
     or pg_catalog.strpos(v_watchdog_definition, 'x-flashcard-watchdog-token') = 0
     or pg_catalog.strpos(v_watchdog_definition, 'watchdog_credentials') = 0
     or pg_catalog.strpos(v_watchdog_definition, 'nightly_snapshot_late') = 0
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
      message = 'Installed Flashcard functions failed rollback identity checks; rollback made no changes.';
  end if;

  v_capture_old_count := (
    pg_catalog.length(v_capture_definition)
      - pg_catalog.length(pg_catalog.replace(v_capture_definition, v_capture_old, ''))
  ) / pg_catalog.length(v_capture_old);
  v_capture_new_count := (
    pg_catalog.length(v_capture_definition)
      - pg_catalog.length(pg_catalog.replace(v_capture_definition, v_capture_new, ''))
  ) / pg_catalog.length(v_capture_new);
  v_capture_needs_rollback :=
    v_capture_new_count = 1 and v_capture_old_count = 0;
  if not v_capture_needs_rollback
     and not (v_capture_new_count = 0 and v_capture_old_count = 1) then
    raise exception using
      errcode = '55000',
      message = 'capture_nightly_snapshot() has an unknown scheduled_for policy; rollback made no changes.';
  end if;

  v_watchdog_old_count := (
    pg_catalog.length(v_watchdog_definition)
      - pg_catalog.length(pg_catalog.replace(v_watchdog_definition, v_watchdog_old, ''))
  ) / pg_catalog.length(v_watchdog_old);
  v_watchdog_new_count := (
    pg_catalog.length(v_watchdog_definition)
      - pg_catalog.length(pg_catalog.replace(v_watchdog_definition, v_watchdog_new, ''))
  ) / pg_catalog.length(v_watchdog_new);
  v_watchdog_needs_rollback :=
    v_watchdog_new_count = 1 and v_watchdog_old_count = 0;
  if not v_watchdog_needs_rollback
     and not (v_watchdog_new_count = 0 and v_watchdog_old_count = 1) then
    raise exception using
      errcode = '55000',
      message = 'Private watchdog has an unknown expected-snapshot cutoff; rollback made no changes.';
  end if;

  -- All rollback preconditions above are evaluated before either definition changes.
  if v_capture_needs_rollback then
    v_capture_definition := pg_catalog.replace(
      v_capture_definition,
      v_capture_new,
      v_capture_old
    );
    execute v_capture_definition;
  end if;

  if v_watchdog_needs_rollback then
    v_watchdog_definition := pg_catalog.replace(
      v_watchdog_definition,
      v_watchdog_new,
      v_watchdog_old
    );
    v_watchdog_definition := pg_catalog.replace(
      v_watchdog_definition,
      'The 04:00 HKT snapshot',
      'The 00:00 HKT snapshot'
    );
    v_watchdog_definition := pg_catalog.replace(
      v_watchdog_definition,
      'Before 04:15',
      'Before 00:15'
    );
    execute v_watchdog_definition;
  end if;
end;
$snapshot_hkt0400_rollback$;

revoke all on function flashcard_integrity.capture_nightly_snapshot()
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_integrity_health_snapshot_v7_internal()
  from public, anon, authenticated, service_role;

-- Historical snapshot rows and all scheduler configuration remain untouched.
commit;
