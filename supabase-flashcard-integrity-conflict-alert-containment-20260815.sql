-- Flashcard integrity: contain duplicate optimistic-version-conflict warnings.
--
-- This migration deliberately does NOT replace write_state_v2, weaken expected-version
-- checks, write student state, or fabricate state revisions.  It changes only the
-- private alert recorder so identical conflict warnings share one canonical alert in
-- each fixed 15-minute window.  Every distinct request still receives its own immutable
-- write receipt.  While a notification is pending, repeats create no more outbox rows;
-- after external delivery, a later repeat can enqueue one fresh pending notification.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

do $preflight$
begin
  if pg_catalog.to_regclass('flashcard_integrity.alerts') is null
     or pg_catalog.to_regclass('flashcard_integrity.alert_outbox') is null
     or pg_catalog.to_regclass('flashcard_integrity.write_receipts') is null
     or pg_catalog.to_regprocedure(
       'flashcard_integrity.record_alert(uuid,text,text,text,uuid,jsonb,jsonb,text,text)'
     ) is null
     or pg_catalog.to_regprocedure(
       'flashcard_integrity.write_state_v2(uuid,text,text,text,jsonb,uuid,bigint)'
     ) is null
     or pg_catalog.to_regprocedure('extensions.digest(bytea,text)') is null then
    raise exception using
      errcode = '55000',
      message = 'Flashcard conflict-alert containment prerequisites are missing; no changes applied.';
  end if;
end;
$preflight$;

-- Keep the first occurrence intact and add explicit aggregation metadata.  Do not
-- rewrite historical alert rows during this live-compatible migration: legacy rows
-- retain null aggregation metadata and operational queries use created_at/request_id as
-- their fallback.  Every alert created by the replacement helper has complete metadata.
alter table flashcard_integrity.alerts
  add column if not exists occurrence_count bigint not null default 1,
  add column if not exists last_seen_at timestamptz,
  add column if not exists last_request_id uuid,
  add column if not exists dedup_fingerprint text,
  add column if not exists dedup_window_start timestamptz;

alter table flashcard_integrity.alerts
  alter column last_seen_at set default pg_catalog.now();

do $constraints$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'flashcard_integrity.alerts'::pg_catalog.regclass
      and conname = 'flashcard_integrity_alert_occurrence_positive'
  ) then
    alter table flashcard_integrity.alerts
      add constraint flashcard_integrity_alert_occurrence_positive
      check (occurrence_count >= 1) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'flashcard_integrity.alerts'::pg_catalog.regclass
      and conname = 'flashcard_integrity_alert_dedup_fingerprint_shape'
  ) then
    alter table flashcard_integrity.alerts
      add constraint flashcard_integrity_alert_dedup_fingerprint_shape
      check (
        dedup_fingerprint is null
        or dedup_fingerprint ~ '^[0-9a-f]{64}$'
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'flashcard_integrity.alerts'::pg_catalog.regclass
      and conname = 'flashcard_integrity_alert_dedup_pair_complete'
  ) then
    alter table flashcard_integrity.alerts
      add constraint flashcard_integrity_alert_dedup_pair_complete
      check (
        (dedup_fingerprint is null and dedup_window_start is null)
        or (dedup_fingerprint is not null and dedup_window_start is not null)
      ) not valid;
  end if;
end;
$constraints$;

alter table flashcard_integrity.alerts
  validate constraint flashcard_integrity_alert_occurrence_positive;
alter table flashcard_integrity.alerts
  validate constraint flashcard_integrity_alert_dedup_fingerprint_shape;
alter table flashcard_integrity.alerts
  validate constraint flashcard_integrity_alert_dedup_pair_complete;

-- A resolved alert no longer occupies its bucket.  A later identical conflict will
-- therefore create fresh evidence even if it happens before the 15-minute boundary.
create unique index if not exists flashcard_integrity_alerts_conflict_dedup_unique_idx
  on flashcard_integrity.alerts (dedup_fingerprint, dedup_window_start)
  where severity = 'warning'
    and code = 'optimistic_version_conflict'
    and resolved_at is null
    and dedup_fingerprint is not null
    and dedup_window_start is not null;

-- CREATE INDEX IF NOT EXISTS must not silently accept a same-named but weaker index
-- left by a partial/manual installation.
do $index_postcondition$
declare
  v_definition text;
  v_predicate text;
  v_unique boolean;
  v_valid boolean;
begin
  select pg_catalog.lower(pg_catalog.pg_get_indexdef(index_row.indexrelid)),
         pg_catalog.lower(
           pg_catalog.pg_get_expr(
             index_row.indpred,
             index_row.indrelid,
             true
           )
         ),
         index_row.indisunique,
         index_row.indisvalid
  into v_definition, v_predicate, v_unique, v_valid
  from pg_catalog.pg_index index_row
  join pg_catalog.pg_class index_class on index_class.oid = index_row.indexrelid
  join pg_catalog.pg_namespace index_namespace
    on index_namespace.oid = index_class.relnamespace
  where index_namespace.nspname = 'flashcard_integrity'
    and index_class.relname = 'flashcard_integrity_alerts_conflict_dedup_unique_idx'
    and index_row.indrelid = 'flashcard_integrity.alerts'::pg_catalog.regclass;

  if not coalesce(v_unique, false)
     or not coalesce(v_valid, false)
     or pg_catalog.strpos(
       coalesce(v_definition, ''),
       '(dedup_fingerprint, dedup_window_start)'
     ) = 0
     or pg_catalog.strpos(coalesce(v_predicate, ''), 'severity') = 0
     or pg_catalog.strpos(coalesce(v_predicate, ''), 'warning') = 0
     or pg_catalog.strpos(coalesce(v_predicate, ''), 'optimistic_version_conflict') = 0
     or pg_catalog.strpos(coalesce(v_predicate, ''), 'resolved_at is null') = 0
     or pg_catalog.strpos(coalesce(v_predicate, ''), 'dedup_fingerprint is not null') = 0
     or pg_catalog.strpos(coalesce(v_predicate, ''), 'dedup_window_start is not null') = 0 then
    raise exception using
      errcode = '55000',
      message = 'Conflict-alert dedup index is missing or weaker than the reviewed definition.';
  end if;
end;
$index_postcondition$;

-- This partial composite index makes the duplicate-path lookup indexable and gives the
-- database (not only the advisory-lock convention) final authority over the invariant
-- that one canonical alert/destination has at most one undelivered notification.
-- If historical duplicate pending rows exist, index creation fails atomically for
-- investigation; this migration never deletes or silently marks either row delivered.
create unique index if not exists flashcard_integrity_outbox_one_pending_per_alert_idx
  on flashcard_integrity.alert_outbox (alert_id, destination)
  where delivered_at is null;

do $outbox_index_postcondition$
declare
  v_definition text;
  v_predicate text;
  v_unique boolean;
  v_valid boolean;
begin
  select pg_catalog.lower(pg_catalog.pg_get_indexdef(index_row.indexrelid)),
         pg_catalog.lower(
           pg_catalog.pg_get_expr(
             index_row.indpred,
             index_row.indrelid,
             true
           )
         ),
         index_row.indisunique,
         index_row.indisvalid
  into v_definition, v_predicate, v_unique, v_valid
  from pg_catalog.pg_index index_row
  join pg_catalog.pg_class index_class on index_class.oid = index_row.indexrelid
  join pg_catalog.pg_namespace index_namespace
    on index_namespace.oid = index_class.relnamespace
  where index_namespace.nspname = 'flashcard_integrity'
    and index_class.relname = 'flashcard_integrity_outbox_one_pending_per_alert_idx'
    and index_row.indrelid = 'flashcard_integrity.alert_outbox'::pg_catalog.regclass;

  if not coalesce(v_unique, false)
     or not coalesce(v_valid, false)
     or pg_catalog.strpos(
       coalesce(v_definition, ''),
       '(alert_id, destination)'
     ) = 0
     or pg_catalog.strpos(coalesce(v_predicate, ''), 'delivered_at is null') = 0 then
    raise exception using
      errcode = '55000',
      message = 'Pending-outbox uniqueness index is missing or weaker than the reviewed definition.';
  end if;
end;
$outbox_index_postcondition$;

create or replace function flashcard_integrity.record_alert(
  p_student_id uuid,
  p_state_key text,
  p_severity text,
  p_code text,
  p_request_id uuid,
  p_current_metrics jsonb,
  p_incoming_metrics jsonb,
  p_action_taken text,
  p_actor_kind text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $record_alert$
declare
  v_alert_id bigint;
  v_actor_kind text := coalesce(
    nullif(p_actor_kind, ''),
    flashcard_integrity.current_actor_kind()
  );
  v_severity text := case
    when p_severity in ('info', 'warning', 'critical') then p_severity
    else 'warning'
  end;
  v_current_metrics jsonb := coalesce(p_current_metrics, '{}'::jsonb);
  v_incoming_metrics jsonb := coalesce(p_incoming_metrics, '{}'::jsonb);
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_bucket_epoch bigint;
  v_window_start timestamptz;
  v_fingerprint text;
begin
  if v_severity = 'warning' and p_code = 'optimistic_version_conflict' then
    -- Fixed windows give a deterministic upper bound of four canonical notifications
    -- per hour and fingerprint.  A boundary can intentionally produce two nearby
    -- alerts; unlike a sliding window, a continuous incident can never be hidden
    -- indefinitely by repeatedly extending one record.
    v_bucket_epoch := pg_catalog.floor(
      pg_catalog.date_part('epoch', pg_catalog.transaction_timestamp()) / 900
    )::bigint;
    v_window_start := pg_catalog.to_timestamp((v_bucket_epoch * 900)::double precision);
    v_fingerprint := pg_catalog.encode(
      extensions.digest(
        pg_catalog.convert_to(
          pg_catalog.jsonb_build_object(
            'studentId', p_student_id,
            'stateKey', p_state_key,
            'severity', v_severity,
            'code', p_code,
            'currentMetrics', v_current_metrics,
            'incomingMetrics', v_incoming_metrics,
            'actionTaken', p_action_taken,
            'actorKind', v_actor_kind
          )::text,
          'UTF8'
        ),
        'sha256'
      ),
      'hex'
    );

    -- This lock is scoped to one fingerprint/bucket.  Hash collisions can serialize
    -- unrelated alerts but cannot merge them because the full SHA-256 value is still
    -- compared and protected by the partial unique index.
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(
        'optimistic-conflict-alert:' || v_fingerprint || ':' || v_bucket_epoch::text,
        0
      )
    );

    select alert.alert_id
    into v_alert_id
    from flashcard_integrity.alerts alert
    where alert.severity = 'warning'
      and alert.code = 'optimistic_version_conflict'
      and alert.resolved_at is null
      and alert.dedup_fingerprint = v_fingerprint
      and alert.dedup_window_start = v_window_start
    limit 1
    for update;

    if found then
      update flashcard_integrity.alerts
      set occurrence_count = occurrence_count + 1,
          last_seen_at = v_now,
          last_request_id = p_request_id
      where alert_id = v_alert_id;

      -- Keep at most one notification pending for this canonical alert.  If the
      -- independently authenticated external consumer has already delivered the prior
      -- notification, a later occurrence creates fresh pending evidence instead of
      -- letting the watchdog report a false recovery.  The fingerprint advisory lock
      -- serializes all insert decisions made by this recorder.
      insert into flashcard_integrity.alert_outbox (alert_id)
      select v_alert_id
      where not exists (
        select 1
        from flashcard_integrity.alert_outbox outbox
        where outbox.alert_id = v_alert_id
          and outbox.destination = 'flashcard-integrity-monitor'
          and outbox.delivered_at is null
      );

      return v_alert_id;
    end if;

    insert into flashcard_integrity.alerts (
      student_id,
      state_key,
      severity,
      code,
      request_id,
      current_metrics,
      incoming_metrics,
      action_taken,
      actor_kind,
      occurrence_count,
      last_seen_at,
      last_request_id,
      dedup_fingerprint,
      dedup_window_start
    )
    values (
      p_student_id,
      p_state_key,
      v_severity,
      p_code,
      p_request_id,
      v_current_metrics,
      v_incoming_metrics,
      p_action_taken,
      v_actor_kind,
      1,
      v_now,
      p_request_id,
      v_fingerprint,
      v_window_start
    )
    returning alert_id into v_alert_id;
  else
    -- Every non-target alert retains the original one-call/one-alert behavior.
    insert into flashcard_integrity.alerts (
      student_id,
      state_key,
      severity,
      code,
      request_id,
      current_metrics,
      incoming_metrics,
      action_taken,
      actor_kind,
      occurrence_count,
      last_seen_at,
      last_request_id
    )
    values (
      p_student_id,
      p_state_key,
      v_severity,
      p_code,
      p_request_id,
      v_current_metrics,
      v_incoming_metrics,
      p_action_taken,
      v_actor_kind,
      1,
      v_now,
      p_request_id
    )
    returning alert_id into v_alert_id;
  end if;

  insert into flashcard_integrity.alert_outbox (alert_id)
  values (v_alert_id);

  return v_alert_id;
end;
$record_alert$;

-- The helper is a private implementation API.  It remains unavailable even to
-- service_role through PostgREST.
revoke all on function flashcard_integrity.record_alert(
  uuid, text, text, text, uuid, jsonb, jsonb, text, text
) from public, anon, authenticated, service_role;

commit;
