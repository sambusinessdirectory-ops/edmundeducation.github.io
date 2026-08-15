-- Flashcard integrity phase 1 / stage 06 of 14: snapshot/audit routines.
-- The cron job and immutable triggers are enabled only after data catch-up.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

create or replace function flashcard_integrity.capture_nightly_snapshot()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_snapshot_date date := (pg_catalog.clock_timestamp() at time zone 'Asia/Hong_Kong')::date;
  v_scheduled_for timestamptz;
  v_run flashcard_integrity.snapshot_runs%rowtype;
  v_expected integer;
  v_actual integer;
  v_state_rows integer;
  v_attempts bigint;
  v_completed_attempts bigint;
  v_duration_ms bigint;
  v_total_bytes bigint;
  v_bad_checksums integer;
  v_manifest_checksum text;
  v_alert_id bigint;
  v_error text;
begin
  v_scheduled_for := v_snapshot_date::timestamp at time zone 'Asia/Hong_Kong';

  insert into flashcard_integrity.snapshot_runs (
    snapshot_date,
    snapshot_kind,
    scheduled_for,
    status,
    started_at
  )
  values (v_snapshot_date, 'nightly', v_scheduled_for, 'running', now())
  on conflict (snapshot_date, snapshot_kind) do nothing
  returning * into v_run;

  if v_run.run_id is null then
    select * into v_run
    from flashcard_integrity.snapshot_runs
    where snapshot_date = v_snapshot_date
      and snapshot_kind = 'nightly'
    for update;

    if v_run.status = 'completed' then
      return pg_catalog.jsonb_build_object(
        'status', 'already_completed',
        'runId', v_run.run_id,
        'snapshotDate', v_snapshot_date,
        'snapshotCount', v_run.snapshot_count
      );
    end if;

    if v_run.status = 'running'
       and v_run.started_at > now() - interval '15 minutes' then
      return pg_catalog.jsonb_build_object(
        'status', 'already_running',
        'runId', v_run.run_id,
        'snapshotDate', v_snapshot_date
      );
    end if;

    update flashcard_integrity.snapshot_runs
    set status = 'running',
        started_at = now(),
        completed_at = null,
        error_message = null
    where run_id = v_run.run_id
    returning * into v_run;
  end if;

  begin
    -- A single INSERT...SELECT gives all students one statement-level MVCC view.
    insert into flashcard_integrity.student_snapshots (
      run_id,
      student_id,
      state_payload,
      attempts_payload,
      snapshot_checksum,
      state_row_count,
      attempt_count,
      completed_attempt_count,
      total_duration_ms,
      total_bytes
    )
    select
      v_run.run_id,
      student.id,
      payload.state_payload,
      payload.attempts_payload,
      flashcard_integrity.jsonb_checksum(pg_catalog.jsonb_build_object(
        'state', payload.state_payload,
        'attempts', payload.attempts_payload
      )),
      payload.state_row_count,
      payload.attempt_count,
      payload.completed_attempt_count,
      payload.total_duration_ms,
      pg_catalog.octet_length(payload.state_payload::text)
        + pg_catalog.octet_length(payload.attempts_payload::text)
    from public.flashcard_students student
    cross join lateral (
      select
        coalesce((
          select pg_catalog.jsonb_object_agg(
            state.key,
            pg_catalog.jsonb_build_object(
              'value', state.value,
              'version', state.version,
              'checksum', state.value_checksum,
              'updatedAt', state.updated_at
            )
            order by state.key
          )
          from public.flashcard_student_state state
          join flashcard_integrity.state_key_rules rules
            on rules.state_key = state.key
           and rules.enabled
           and rules.v2_writable
          where state.student_id = student.id
            and state.key <> 'edmundFlashcardAttempts'
        ), '{}'::jsonb) as state_payload,
        coalesce((
          select pg_catalog.jsonb_agg(attempt.payload order by attempt.started_at_ms, attempt.attempt_id)
          from flashcard_integrity.attempt_records attempt
          where attempt.student_id = student.id
        ), '[]'::jsonb) as attempts_payload,
        (
          select pg_catalog.count(*)::integer
          from public.flashcard_student_state state
          join flashcard_integrity.state_key_rules rules
            on rules.state_key = state.key
           and rules.enabled
           and rules.v2_writable
          where state.student_id = student.id
        ) as state_row_count,
        (
          select pg_catalog.count(*)::integer
          from flashcard_integrity.attempt_records attempt
          where attempt.student_id = student.id
        ) as attempt_count,
        (
          select pg_catalog.count(*)::integer
          from flashcard_integrity.attempt_records attempt
          where attempt.student_id = student.id and attempt.completed
        ) as completed_attempt_count,
        (
          select coalesce(pg_catalog.sum(attempt.duration_ms), 0)::bigint
          from flashcard_integrity.attempt_records attempt
          where attempt.student_id = student.id
        ) as total_duration_ms
    ) payload
    on conflict (run_id, student_id) do nothing;

    -- Do not compare against flashcard_students in a later statement: under READ
    -- COMMITTED a concurrently committed account would be visible there but was not
    -- part of the INSERT statement's MVCC source. The inserted snapshot set itself is
    -- the consistent source-of-truth for this run.
    select
      pg_catalog.count(*)::integer,
      coalesce(pg_catalog.sum(snapshot.state_row_count), 0)::integer,
      coalesce(pg_catalog.sum(snapshot.attempt_count), 0)::bigint,
      coalesce(pg_catalog.sum(snapshot.completed_attempt_count), 0)::bigint,
      coalesce(pg_catalog.sum(snapshot.total_duration_ms), 0)::bigint,
      coalesce(pg_catalog.sum(snapshot.total_bytes), 0)::bigint,
      pg_catalog.count(*) filter (
        where snapshot.snapshot_checksum
          <> flashcard_integrity.jsonb_checksum(pg_catalog.jsonb_build_object(
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
      v_actual,
      v_state_rows,
      v_attempts,
      v_completed_attempts,
      v_duration_ms,
      v_total_bytes,
      v_bad_checksums,
      v_manifest_checksum
    from flashcard_integrity.student_snapshots snapshot
    where snapshot.run_id = v_run.run_id;

    v_expected := v_actual;

    if v_bad_checksums <> 0 then
      raise exception 'Snapshot verification failed: snapshot count %, bad checksums %',
        v_actual, v_bad_checksums;
    end if;

    update flashcard_integrity.snapshot_runs
    set status = 'completed',
        completed_at = now(),
        student_count = v_expected,
        snapshot_count = v_actual,
        state_row_count = v_state_rows,
        attempt_count = v_attempts,
        completed_attempt_count = v_completed_attempts,
        total_duration_ms = v_duration_ms,
        total_bytes = v_total_bytes,
        manifest_checksum = v_manifest_checksum,
        error_message = null
    where run_id = v_run.run_id;

    return pg_catalog.jsonb_build_object(
      'status', 'completed',
      'runId', v_run.run_id,
      'snapshotDate', v_snapshot_date,
      'studentCount', v_expected,
      'snapshotCount', v_actual,
      'stateRowCount', v_state_rows,
      'attemptCount', v_attempts,
      'completedAttemptCount', v_completed_attempts,
      'totalDurationMs', v_duration_ms,
      'manifestChecksum', v_manifest_checksum,
      'totalBytes', v_total_bytes
    );
  exception
    when others then
      get stacked diagnostics v_error = message_text;

      update flashcard_integrity.snapshot_runs
      set status = 'failed',
          completed_at = now(),
          error_message = pg_catalog.left(v_error, 2000)
      where run_id = v_run.run_id;

      v_alert_id := flashcard_integrity.record_alert(
        null,
        null,
        'critical',
        'nightly_snapshot_failed',
        null,
        pg_catalog.jsonb_build_object('runId', v_run.run_id, 'snapshotDate', v_snapshot_date),
        pg_catalog.jsonb_build_object('error', pg_catalog.left(v_error, 1000)),
        'retry_required',
        'snapshot_cron'
      );

      return pg_catalog.jsonb_build_object(
        'status', 'failed',
        'runId', v_run.run_id,
        'snapshotDate', v_snapshot_date,
        'alertId', v_alert_id,
        'error', pg_catalog.left(v_error, 1000)
      );
  end;
end;
$$;

-- Read scheduler state without making pg_cron an installation dependency. Automatic
-- scheduling remains disabled in phase 1; a future dispatcher can use this result to
-- verify job count, active flag, database, and owner before accepting a rollout.
create or replace function flashcard_integrity.snapshot_scheduler_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_job_count bigint := 0;
  v_active_count bigint := 0;
  v_database_ok boolean := true;
  v_owner_ok boolean := true;
  v_schedules text[] := array[]::text[];
begin
  if pg_catalog.to_regclass('cron.job') is null then
    return pg_catalog.jsonb_build_object(
      'cronInstalled', false,
      'jobCount', 0,
      'activeCount', 0,
      'databaseValid', true,
      'ownerValid', true,
      'schedules', pg_catalog.to_jsonb(v_schedules)
    );
  end if;

  execute $query$
    select
      pg_catalog.count(*)::bigint,
      pg_catalog.count(*) filter (where active)::bigint,
      coalesce(pg_catalog.bool_and(database = pg_catalog.current_database()), true),
      coalesce(pg_catalog.bool_and(username = current_user), true),
      coalesce(pg_catalog.array_agg(schedule order by jobid), array[]::text[])
    from cron.job
    where jobname = 'flashcard-integrity-nightly-hkt'
  $query$
  into v_job_count, v_active_count, v_database_ok, v_owner_ok, v_schedules;

  return pg_catalog.jsonb_build_object(
    'cronInstalled', true,
    'jobCount', v_job_count,
    'activeCount', v_active_count,
    'databaseValid', v_database_ok,
    'ownerValid', v_owner_ok,
    'schedules', pg_catalog.to_jsonb(v_schedules)
  );
end;
$$;

create or replace function flashcard_integrity.reject_audit_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception 'Flashcard integrity audit rows are append-only.'
    using errcode = '55000';
end;
$$;

commit;
