-- Independent Flashcard integrity watchdog: least-privilege, aggregate-only health RPC.
--
-- This migration is deliberately safe for a public source repository:
--   * it contains no watchdog token or token hash;
--   * the private credential table is not exposed to Data API roles;
--   * the RPC returns only aggregate health signals, never student/account identifiers;
--   * the caller supplies a high-entropy token in an HTTP header, not an RPC argument.
--
-- Provision a token digest only after applying this migration. See
-- FLASHCARD-INTEGRITY-WATCHDOG-RUNBOOK-20260814.md.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

create table if not exists flashcard_integrity.watchdog_credentials (
  credential_id uuid primary key default gen_random_uuid(),
  label text not null unique,
  token_digest bytea not null unique,
  enabled boolean not null default true,
  valid_after timestamptz not null default now(),
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  rotated_at timestamptz,
  check (pg_catalog.octet_length(token_digest) = 32),
  check (valid_until is null or valid_until > valid_after)
);

alter table flashcard_integrity.watchdog_credentials enable row level security;
revoke all on table flashcard_integrity.watchdog_credentials
  from public, anon, authenticated, service_role;

create or replace function public.flashcard_integrity_health()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_local_now timestamp := now() at time zone 'Asia/Hong_Kong';
  v_expected_snapshot_date date;
  v_headers jsonb := '{}'::jsonb;
  v_token text;
  v_authorized boolean := false;
  v_state_violations bigint := 0;
  v_attempt_drift bigint := 0;
  v_missing_triggers bigint := 0;
  v_open_critical_alerts bigint := 0;
  v_pending_outbox bigint := 0;
  v_late_outbox bigint := 0;
  v_oldest_pending_age_seconds bigint;
  v_last_completed_snapshot_date date;
  v_snapshot_late boolean := true;
  v_snapshot_corrupt boolean := false;
  v_failed_expected_snapshot bigint := 0;
  v_snapshot_run flashcard_integrity.snapshot_runs%rowtype;
  v_snapshot_count integer := 0;
  v_state_row_count integer := 0;
  v_snapshot_attempt_count bigint := 0;
  v_snapshot_completed_attempt_count bigint := 0;
  v_snapshot_duration_ms bigint := 0;
  v_snapshot_total_bytes bigint := 0;
  v_snapshot_bad_checksums integer := 0;
  v_snapshot_manifest_checksum text;
  v_incident_codes text[] := array[]::text[];
  v_healthy boolean;
begin
  -- PostgREST exposes request headers through this transaction-local setting. The
  -- token stays out of function arguments and the returned/logged health document.
  begin
    v_headers := coalesce(
      nullif(pg_catalog.current_setting('request.headers', true), '')::jsonb,
      '{}'::jsonb
    );
  exception
    when others then
      v_headers := '{}'::jsonb;
  end;

  v_token := nullif(v_headers ->> 'x-flashcard-watchdog-token', '');

  if v_token is not null
     and pg_catalog.octet_length(v_token) between 32 and 256 then
    select exists (
      select 1
      from flashcard_integrity.watchdog_credentials credential
      where credential.enabled
        and credential.valid_after <= v_now
        and (credential.valid_until is null or credential.valid_until > v_now)
        and credential.token_digest = extensions.digest(
          pg_catalog.convert_to(v_token, 'UTF8'),
          'sha256'
        )
    ) into v_authorized;
  end if;

  if not v_authorized then
    -- Use the same response for missing, malformed, expired, disabled, and incorrect
    -- tokens so the endpoint does not become a credential-enumeration oracle.
    raise insufficient_privilege using message = 'watchdog authorization failed';
  end if;

  -- Metadata, key-registry, JSON-type, payload-size, and checksum invariants. This
  -- returns only a violation count; no offending key or student identifier leaves DB.
  select pg_catalog.count(*)::bigint
  into v_state_violations
  from public.flashcard_student_state state
  left join flashcard_integrity.state_key_rules rules
    on rules.state_key = state.key
  where rules.state_key is null
     or not rules.enabled
     or state.version is null
     or state.version < 1
     or state.value_checksum is null
     or state.value_checksum <> flashcard_integrity.jsonb_checksum(state.value)
     or pg_catalog.jsonb_typeof(state.value) <> rules.expected_json_type
     or pg_catalog.octet_length(state.value::text) > rules.max_payload_bytes
     or case
          when state.key = 'edmundFlashcardAttempts'
               and pg_catalog.jsonb_typeof(state.value) = 'array' then exists (
            select 1
            from pg_catalog.jsonb_array_elements(state.value) entry(item)
            where pg_catalog.jsonb_typeof(entry.item) <> 'object'
          )
          else false
        end;

  -- The attempts blob and normalized canonical attempt records must agree exactly in
  -- both directions. Duplicate IDs, missing records, and checksum drift are failures.
  with blob as materialized (
    select
      state.student_id,
      flashcard_integrity.attempt_key(entry.item) as attempt_id,
      flashcard_integrity.jsonb_checksum(entry.item) as payload_checksum
    from public.flashcard_student_state state
    cross join lateral pg_catalog.jsonb_array_elements(
      case
        when pg_catalog.jsonb_typeof(state.value) = 'array' then state.value
        else '[]'::jsonb
      end
    ) entry(item)
    where state.key = 'edmundFlashcardAttempts'
      and pg_catalog.jsonb_typeof(entry.item) = 'object'
  ), drift as (
    select 1
    from blob
    group by blob.student_id, blob.attempt_id
    having pg_catalog.count(*) <> 1
       or pg_catalog.count(distinct blob.payload_checksum) <> 1

    union all

    select 1
    from blob
    where not exists (
      select 1
      from flashcard_integrity.attempt_records record
      where record.student_id = blob.student_id
        and record.attempt_id = blob.attempt_id
        and record.payload_checksum = blob.payload_checksum
        and record.payload_checksum = flashcard_integrity.jsonb_checksum(record.payload)
    )

    union all

    select 1
    from flashcard_integrity.attempt_records record
    where record.payload_checksum <> flashcard_integrity.jsonb_checksum(record.payload)
       or not exists (
         select 1
         from blob
         where blob.student_id = record.student_id
           and blob.attempt_id = record.attempt_id
           and blob.payload_checksum = record.payload_checksum
       )
  )
  select pg_catalog.count(*)::bigint into v_attempt_drift from drift;

  -- Seven named triggers are the database-side seatbelts. A missing/disabled trigger
  -- is critical even when the current rows still look correct.
  with expected(relation_id, trigger_name) as (
    values
      ('public.flashcard_student_state'::pg_catalog.regclass, 'flashcard_state_zz_integrity_protect'::text),
      ('public.flashcard_student_state'::pg_catalog.regclass, 'flashcard_state_revision_audit'::text),
      ('public.flashcard_students'::pg_catalog.regclass, 'flashcard_student_hard_delete_protected'::text),
      ('flashcard_integrity.state_revisions'::pg_catalog.regclass, 'flashcard_integrity_state_revisions_immutable'::text),
      ('flashcard_integrity.write_receipts'::pg_catalog.regclass, 'flashcard_integrity_receipts_immutable'::text),
      ('flashcard_integrity.attempt_mutations'::pg_catalog.regclass, 'flashcard_integrity_attempt_mutations_immutable'::text),
      ('flashcard_integrity.student_snapshots'::pg_catalog.regclass, 'flashcard_integrity_snapshots_immutable'::text)
  )
  select pg_catalog.count(*) filter (where installed_trigger.oid is null)::bigint
  into v_missing_triggers
  from expected
  left join pg_catalog.pg_trigger installed_trigger
   on installed_trigger.tgrelid = expected.relation_id
   and installed_trigger.tgname = expected.trigger_name
   and not installed_trigger.tgisinternal
   and installed_trigger.tgenabled <> 'D';

  select pg_catalog.count(*)::bigint
  into v_open_critical_alerts
  from flashcard_integrity.alerts alert
  where alert.severity = 'critical'
    and alert.resolved_at is null;

  select
    pg_catalog.count(*) filter (where outbox.delivered_at is null)::bigint,
    pg_catalog.count(*) filter (
      where outbox.delivered_at is null
        and outbox.created_at < v_now - interval '5 minutes'
    )::bigint,
    extract(epoch from (
      v_now - pg_catalog.min(outbox.created_at)
        filter (where outbox.delivered_at is null)
    ))::bigint
  into v_pending_outbox, v_late_outbox, v_oldest_pending_age_seconds
  from flashcard_integrity.alert_outbox outbox;

  -- The 00:00 HKT snapshot has a 15-minute grace period. Before 00:15, yesterday is
  -- the required completed run; afterwards, today is required.
  v_expected_snapshot_date := case
    when v_local_now::time >= time '00:15'
      then v_local_now::date
    else v_local_now::date - 1
  end;

  select pg_catalog.max(run.snapshot_date)
  into v_last_completed_snapshot_date
  from flashcard_integrity.snapshot_runs run
  where run.snapshot_kind = 'nightly'
    and run.status = 'completed';

  select pg_catalog.count(*)::bigint
  into v_failed_expected_snapshot
  from flashcard_integrity.snapshot_runs run
  where run.snapshot_kind = 'nightly'
    and run.snapshot_date = v_expected_snapshot_date
    and run.status = 'failed';

  select * into v_snapshot_run
  from flashcard_integrity.snapshot_runs run
  where run.snapshot_kind = 'nightly'
    and run.snapshot_date = v_expected_snapshot_date
    and run.status = 'completed'
  order by run.completed_at desc
  limit 1;

  if found then
    v_snapshot_late := false;

    select
      pg_catalog.count(*)::integer,
      coalesce(pg_catalog.sum(snapshot.state_row_count), 0)::integer,
      coalesce(pg_catalog.sum(snapshot.attempt_count), 0)::bigint,
      coalesce(pg_catalog.sum(snapshot.completed_attempt_count), 0)::bigint,
      coalesce(pg_catalog.sum(snapshot.total_duration_ms), 0)::bigint,
      coalesce(pg_catalog.sum(snapshot.total_bytes), 0)::bigint,
      pg_catalog.count(*) filter (
        where snapshot.snapshot_checksum is distinct from
          flashcard_integrity.jsonb_checksum(pg_catalog.jsonb_build_object(
            'state', snapshot.state_payload,
            'attempts', snapshot.attempts_payload
          ))
      )::integer,
      flashcard_integrity.jsonb_checksum(coalesce(
        pg_catalog.jsonb_agg(
          pg_catalog.jsonb_build_object(
            'studentId', snapshot.student_id,
            'snapshotChecksum', snapshot.snapshot_checksum,
            'stateRows', snapshot.state_row_count,
            'attempts', snapshot.attempt_count,
            'completedAttempts', snapshot.completed_attempt_count,
            'durationMs', snapshot.total_duration_ms,
            'bytes', snapshot.total_bytes
          ) order by snapshot.student_id
        ),
        '[]'::jsonb
      ))
    into
      v_snapshot_count,
      v_state_row_count,
      v_snapshot_attempt_count,
      v_snapshot_completed_attempt_count,
      v_snapshot_duration_ms,
      v_snapshot_total_bytes,
      v_snapshot_bad_checksums,
      v_snapshot_manifest_checksum
    from flashcard_integrity.student_snapshots snapshot
    where snapshot.run_id = v_snapshot_run.run_id;

    v_snapshot_corrupt :=
      v_snapshot_run.student_count is distinct from v_snapshot_count
      or v_snapshot_run.snapshot_count is distinct from v_snapshot_count
      or v_snapshot_run.state_row_count is distinct from v_state_row_count
      or v_snapshot_run.attempt_count is distinct from v_snapshot_attempt_count
      or v_snapshot_run.completed_attempt_count is distinct from v_snapshot_completed_attempt_count
      or v_snapshot_run.total_duration_ms is distinct from v_snapshot_duration_ms
      or v_snapshot_run.total_bytes is distinct from v_snapshot_total_bytes
      or v_snapshot_run.manifest_checksum is distinct from v_snapshot_manifest_checksum
      or v_snapshot_bad_checksums <> 0;
  end if;

  if v_state_violations > 0 then
    v_incident_codes := pg_catalog.array_append(v_incident_codes, 'state_integrity_violation');
  end if;
  if v_attempt_drift > 0 then
    v_incident_codes := pg_catalog.array_append(v_incident_codes, 'attempt_canonical_drift');
  end if;
  if v_missing_triggers > 0 then
    v_incident_codes := pg_catalog.array_append(v_incident_codes, 'integrity_trigger_missing');
  end if;
  if v_open_critical_alerts > 0 then
    v_incident_codes := pg_catalog.array_append(v_incident_codes, 'unresolved_critical_alert');
  end if;
  if v_late_outbox > 0 then
    v_incident_codes := pg_catalog.array_append(v_incident_codes, 'alert_outbox_late');
  end if;
  if v_snapshot_late then
    v_incident_codes := pg_catalog.array_append(v_incident_codes, 'nightly_snapshot_late');
  end if;
  if v_failed_expected_snapshot > 0 then
    v_incident_codes := pg_catalog.array_append(v_incident_codes, 'nightly_snapshot_failed');
  end if;
  if v_snapshot_corrupt then
    v_incident_codes := pg_catalog.array_append(v_incident_codes, 'nightly_snapshot_corrupt');
  end if;

  v_healthy := pg_catalog.cardinality(v_incident_codes) = 0;

  return pg_catalog.jsonb_build_object(
    'schemaVersion', '2026-08-14.1',
    'checkedAt', v_now,
    'healthy', v_healthy,
    'status', case when v_healthy then 'healthy' else 'unhealthy' end,
    'incidentCodes', pg_catalog.to_jsonb(v_incident_codes),
    'checks', pg_catalog.jsonb_build_object(
      'state', pg_catalog.jsonb_build_object(
        'healthy', v_state_violations = 0,
        'metadataViolationCount', v_state_violations
      ),
      'attempts', pg_catalog.jsonb_build_object(
        'healthy', v_attempt_drift = 0,
        'driftCount', v_attempt_drift
      ),
      'triggers', pg_catalog.jsonb_build_object(
        'healthy', v_missing_triggers = 0,
        'missingCount', v_missing_triggers
      ),
      'alerts', pg_catalog.jsonb_build_object(
        'healthy', v_open_critical_alerts = 0,
        'unresolvedCriticalCount', v_open_critical_alerts
      ),
      'outbox', pg_catalog.jsonb_build_object(
        'healthy', v_late_outbox = 0,
        'pendingCount', v_pending_outbox,
        'lateCount', v_late_outbox,
        'oldestPendingAgeSeconds', v_oldest_pending_age_seconds
      ),
      'snapshot', pg_catalog.jsonb_build_object(
        'healthy', not v_snapshot_late
          and not v_snapshot_corrupt
          and v_failed_expected_snapshot = 0,
        'expectedDate', v_expected_snapshot_date,
        'lastCompletedDate', v_last_completed_snapshot_date,
        'late', v_snapshot_late,
        'corrupt', v_snapshot_corrupt,
        'failedExpectedCount', v_failed_expected_snapshot
      )
    )
  );
end;
$$;

-- Functions are executable by PUBLIC by default in PostgreSQL. Make the RPC opt-in
-- and give only the anonymous Data API role the ability to reach the token gate.
revoke all on function public.flashcard_integrity_health()
  from public, anon, authenticated, service_role;
grant execute on function public.flashcard_integrity_health() to anon;

notify pgrst, 'reload schema';
commit;
