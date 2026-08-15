-- External Flashcard alert-outbox acknowledgement, staged 2026-08-15.
--
-- The existing health token remains read-only. A second, independently rotated token
-- is scoped to one outbox destination and can only mark rows at or below the exact
-- aggregate watermark observed by the health probe. No alert payload, student ID,
-- state key, request ID, or row-by-row outbox detail is returned to GitHub.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

create table if not exists flashcard_integrity.watchdog_outbox_consumers (
  consumer_id uuid primary key default pg_catalog.gen_random_uuid(),
  label text not null unique,
  destination text not null unique default 'flashcard-integrity-monitor'
    check (destination ~ '^[a-z0-9][a-z0-9._-]{0,79}$'),
  token_digest bytea not null unique,
  enabled boolean not null default true,
  valid_after timestamptz not null default now(),
  valid_until timestamptz,
  last_acknowledged_outbox_id bigint not null default 0
    check (last_acknowledged_outbox_id >= 0),
  last_reconciled_at timestamptz,
  last_health_fingerprint text,
  created_at timestamptz not null default now(),
  rotated_at timestamptz,
  updated_at timestamptz not null default now(),
  check (pg_catalog.octet_length(token_digest) = 32),
  check (valid_until is null or valid_until > valid_after),
  check (
    last_health_fingerprint is null
    or last_health_fingerprint ~ '^[0-9a-f]{64}$'
  )
);

alter table flashcard_integrity.watchdog_outbox_consumers enable row level security;
revoke all on table flashcard_integrity.watchdog_outbox_consumers
  from public, anon, authenticated, service_role;

create index if not exists flashcard_integrity_outbox_delivery_pending_idx
  on flashcard_integrity.alert_outbox (destination, outbox_id, created_at)
  where delivered_at is null;

create table if not exists flashcard_integrity.outbox_acknowledgements (
  acknowledgement_id uuid primary key default pg_catalog.gen_random_uuid(),
  consumer_id uuid not null references
    flashcard_integrity.watchdog_outbox_consumers(consumer_id) on delete restrict,
  reconciliation_run_key text not null,
  through_outbox_id bigint not null check (through_outbox_id > 0),
  observed_at timestamptz not null,
  health_fingerprint text not null,
  reconciliation_action text not null,
  reconciliation_reference text not null,
  previous_watermark bigint not null check (previous_watermark >= 0),
  resulting_watermark bigint not null check (resulting_watermark >= previous_watermark),
  delivered_count bigint not null check (delivered_count >= 0),
  canonical_receipt jsonb not null,
  created_at timestamptz not null default now(),
  unique (consumer_id, reconciliation_run_key),
  check (reconciliation_run_key ~ '^[0-9a-f]{64}$'),
  check (health_fingerprint ~ '^[0-9a-f]{64}$'),
  check (
    reconciliation_reference ~
      '^github:[A-Za-z0-9_.-]{1,100}/[A-Za-z0-9_.-]{1,100}#(none|[1-9][0-9]{0,9})$'
  ),
  check (reconciliation_action in (
    'healthy_no_open_issue',
    'closed_recovered_issue',
    'opened_issue',
    'updated_issue',
    'deduplicated_unchanged_issue'
  )),
  check (
    (
      reconciliation_action = 'healthy_no_open_issue'
      and reconciliation_reference ~ '#none$'
    )
    or (
      reconciliation_action <> 'healthy_no_open_issue'
      and reconciliation_reference ~ '#[1-9][0-9]{0,9}$'
    )
  )
);

create index if not exists flashcard_integrity_outbox_ack_consumer_time_idx
  on flashcard_integrity.outbox_acknowledgements (consumer_id, created_at desc);

alter table flashcard_integrity.outbox_acknowledgements enable row level security;
revoke all on table flashcard_integrity.outbox_acknowledgements
  from public, anon, authenticated, service_role;

create or replace function flashcard_integrity.reject_outbox_acknowledgement_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception using
    errcode = '55000',
    message = 'Flashcard outbox acknowledgement receipts are append-only.';
end;
$$;

revoke all on function flashcard_integrity.reject_outbox_acknowledgement_mutation()
  from public, anon, authenticated, service_role;

drop trigger if exists flashcard_integrity_outbox_acknowledgements_immutable
  on flashcard_integrity.outbox_acknowledgements;
create trigger flashcard_integrity_outbox_acknowledgements_immutable
before update or delete on flashcard_integrity.outbox_acknowledgements
for each row execute function
  flashcard_integrity.reject_outbox_acknowledgement_mutation();

-- Preserve the deployed public snapshot/trigger-inventory wrapper under a private
-- name exactly once. Reapplying this migration validates the installed wrapper rather
-- than stacking another wrapper or changing credentials.
do $$
declare
  v_public pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health()'
  );
  v_preserved pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health_pre_outbox_ack_internal()'
  );
  v_definition text;
begin
  if v_preserved is null then
    if v_public is null then
      raise exception using
        errcode = '55000',
        message = 'Flashcard watchdog health RPC is missing; outbox acknowledgement was not installed.';
    end if;

    v_definition := pg_catalog.lower(pg_catalog.pg_get_functiondef(v_public));
    if pg_catalog.strpos(v_definition, '2026-08-15.1') = 0
       or pg_catalog.strpos(
         v_definition,
         'x-flashcard-watchdog-snapshot-checks-enabled'
       ) = 0 then
      raise exception using
        errcode = '55000',
        message = 'Flashcard watchdog is not the reviewed snapshot-gated schema 2026-08-15.1 implementation.';
    end if;

    alter function public.flashcard_integrity_health()
      rename to flashcard_integrity_health_pre_outbox_ack_internal;
  else
    if v_public is null then
      raise exception using
        errcode = '55000',
        message = 'Preserved Flashcard watchdog exists but its public outbox wrapper is missing.';
    end if;

    v_definition := pg_catalog.lower(pg_catalog.pg_get_functiondef(v_public));
    if pg_catalog.strpos(v_definition, 'ackthroughoutboxid') = 0
       or pg_catalog.strpos(v_definition, '2026-08-15.2') = 0 then
      raise exception using
        errcode = '55000',
        message = 'Current Flashcard watchdog is not the reviewed outbox-watermark wrapper.';
    end if;
  end if;
end;
$$;

revoke all on function public.flashcard_integrity_health_pre_outbox_ack_internal()
  from public, anon, authenticated, service_role;

create or replace function public.flashcard_integrity_health()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_health jsonb;
  v_checks jsonb := '{}'::jsonb;
  v_outbox_check jsonb := '{}'::jsonb;
  v_incident_codes jsonb := '[]'::jsonb;
  v_observed_at timestamptz;
  v_ack_through bigint;
  v_ack_pending bigint := 0;
  v_pending_warnings bigint := 0;
  v_pending_critical bigint := 0;
  v_pending_version_conflicts bigint := 0;
  v_base_valid boolean := true;
  v_base_healthy boolean := false;
  v_healthy boolean := false;
begin
  -- The preserved function performs the existing health-token authorization before
  -- this wrapper can read any private outbox aggregate.
  v_health := public.flashcard_integrity_health_pre_outbox_ack_internal();

  begin
    v_base_valid := pg_catalog.jsonb_typeof(v_health) = 'object'
      and pg_catalog.jsonb_typeof(v_health -> 'checks') = 'object'
      and pg_catalog.jsonb_typeof(v_health #> '{checks,outbox}') = 'object'
      and pg_catalog.lower(coalesce(v_health ->> 'healthy', '')) in ('true', 'false');
    if v_base_valid then
      v_base_healthy := (v_health ->> 'healthy')::boolean;
    end if;
    v_observed_at := (v_health ->> 'checkedAt')::timestamptz;
  exception
    when others then
      v_base_valid := false;
      v_base_healthy := false;
      v_observed_at := now();
  end;

  with pending as materialized (
    select outbox.outbox_id, alert.severity, alert.code
    from flashcard_integrity.alert_outbox outbox
    join flashcard_integrity.alerts alert on alert.alert_id = outbox.alert_id
    where outbox.destination = 'flashcard-integrity-monitor'
      and outbox.delivered_at is null
      and outbox.created_at <= v_observed_at
  ), delivery_batch as (
    select pending.outbox_id
    from pending
    order by pending.outbox_id
    limit 500
  )
  select
    (select pg_catalog.max(batch.outbox_id) from delivery_batch batch),
    pg_catalog.count(*)::bigint,
    pg_catalog.count(*) filter (where pending.severity = 'warning')::bigint,
    pg_catalog.count(*) filter (where pending.severity = 'critical')::bigint,
    pg_catalog.count(*) filter (
      where pending.code = 'optimistic_version_conflict'
    )::bigint
  into
    v_ack_through,
    v_ack_pending,
    v_pending_warnings,
    v_pending_critical,
    v_pending_version_conflicts
  from pending;

  v_checks := case
    when pg_catalog.jsonb_typeof(v_health -> 'checks') = 'object'
      then v_health -> 'checks'
    else '{}'::jsonb
  end;
  v_outbox_check := case
    when pg_catalog.jsonb_typeof(v_checks -> 'outbox') = 'object'
      then v_checks -> 'outbox'
    else pg_catalog.jsonb_build_object('healthy', false)
  end;

  v_outbox_check := v_outbox_check || pg_catalog.jsonb_build_object(
    -- Decimal text avoids JavaScript precision loss for PostgreSQL bigint values.
    'ackThroughOutboxId', case
      when v_ack_through is null then null
      else v_ack_through::text
    end,
    'ackObservedAt', v_observed_at,
    'ackPendingCount', v_ack_pending,
    'ackBatchLimit', 500,
    'pendingWarningCount', v_pending_warnings,
    'pendingCriticalCount', v_pending_critical,
    'pendingOptimisticConflictCount', v_pending_version_conflicts
  );
  v_checks := pg_catalog.jsonb_set(v_checks, '{outbox}', v_outbox_check, true);

  select coalesce(pg_catalog.jsonb_agg(code order by code), '[]'::jsonb)
  into v_incident_codes
  from (
    select incident.code
    from pg_catalog.jsonb_array_elements_text(
      case
        when pg_catalog.jsonb_typeof(v_health -> 'incidentCodes') = 'array'
          then v_health -> 'incidentCodes'
        else '[]'::jsonb
      end
    ) incident(code)

    union
    select 'watchdog_internal_response_invalid'::text
    where not v_base_valid
  ) incident_set;

  v_healthy := v_base_valid
    and v_base_healthy
    and pg_catalog.jsonb_array_length(v_incident_codes) = 0;

  return v_health || pg_catalog.jsonb_build_object(
    'schemaVersion', '2026-08-15.2',
    'healthy', v_healthy,
    'status', case when v_healthy then 'healthy' else 'unhealthy' end,
    'incidentCodes', v_incident_codes,
    'checks', v_checks
  );
end;
$$;

revoke all on function public.flashcard_integrity_health()
  from public, anon, authenticated, service_role;
grant execute on function public.flashcard_integrity_health() to anon;

create or replace function public.flashcard_integrity_acknowledge_outbox(
  p_through_outbox_id text,
  p_observed_at timestamptz,
  p_health_fingerprint text,
  p_reconciliation_action text,
  p_reconciliation_reference text,
  p_reconciliation_run_key text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
set lock_timeout = '3s'
set statement_timeout = '20s'
as $$
declare
  v_now timestamptz := now();
  v_headers jsonb := '{}'::jsonb;
  v_token text;
  v_consumer flashcard_integrity.watchdog_outbox_consumers%rowtype;
  v_existing flashcard_integrity.outbox_acknowledgements%rowtype;
  v_through bigint;
  v_available_max bigint;
  v_previous_watermark bigint;
  v_resulting_watermark bigint;
  v_delivered_count bigint := 0;
  v_receipt jsonb;
begin
  begin
    v_headers := coalesce(
      nullif(pg_catalog.current_setting('request.headers', true), '')::jsonb,
      '{}'::jsonb
    );
  exception
    when others then
      v_headers := '{}'::jsonb;
  end;

  v_token := nullif(v_headers ->> 'x-flashcard-watchdog-outbox-ack-token', '');
  if v_token is not null
     and pg_catalog.octet_length(v_token) between 32 and 256 then
    select * into v_consumer
    from flashcard_integrity.watchdog_outbox_consumers consumer
    where consumer.enabled
      and consumer.valid_after <= v_now
      and (consumer.valid_until is null or consumer.valid_until > v_now)
      and consumer.token_digest = extensions.digest(
        pg_catalog.convert_to(v_token, 'UTF8'),
        'sha256'
      )
    for update;
  end if;

  if v_consumer.consumer_id is null then
    raise insufficient_privilege using
      message = 'outbox acknowledgement authorization failed';
  end if;

  if p_through_outbox_id is null
     or p_through_outbox_id !~ '^[1-9][0-9]{0,18}$'
     or p_health_fingerprint is null
     or p_health_fingerprint !~ '^[0-9a-f]{64}$'
     or p_reconciliation_run_key is null
     or p_reconciliation_run_key !~ '^[0-9a-f]{64}$'
     or p_reconciliation_action is null
     or p_reconciliation_action not in (
       'healthy_no_open_issue',
       'closed_recovered_issue',
       'opened_issue',
       'updated_issue',
       'deduplicated_unchanged_issue'
     )
     or p_reconciliation_reference is null
     or p_reconciliation_reference !~
       '^github:[A-Za-z0-9_.-]{1,100}/[A-Za-z0-9_.-]{1,100}#(none|[1-9][0-9]{0,9})$'
     or (
       p_reconciliation_action = 'healthy_no_open_issue'
       and p_reconciliation_reference !~ '#none$'
     )
     or (
       p_reconciliation_action <> 'healthy_no_open_issue'
       and p_reconciliation_reference !~ '#[1-9][0-9]{0,9}$'
     )
     or p_observed_at is null
     or p_observed_at < v_now - interval '30 minutes'
     or p_observed_at > v_now + interval '1 minute' then
    raise exception using
      errcode = '22023',
      message = 'outbox acknowledgement request invalid';
  end if;

  begin
    v_through := p_through_outbox_id::bigint;
  exception
    when numeric_value_out_of_range then
      raise exception using
        errcode = '22023',
        message = 'outbox acknowledgement request invalid';
  end;

  select * into v_existing
  from flashcard_integrity.outbox_acknowledgements acknowledgement
  where acknowledgement.consumer_id = v_consumer.consumer_id
    and acknowledgement.reconciliation_run_key = p_reconciliation_run_key;

  if found then
    if v_existing.through_outbox_id <> v_through
       or v_existing.observed_at <> p_observed_at
       or v_existing.health_fingerprint <> p_health_fingerprint
       or v_existing.reconciliation_action <> p_reconciliation_action
       or v_existing.reconciliation_reference <> p_reconciliation_reference then
      raise exception using
        errcode = '23505',
        message = 'outbox acknowledgement idempotency key conflict';
    end if;
    return v_existing.canonical_receipt;
  end if;

  select pg_catalog.max(batch.outbox_id)
  into v_available_max
  from (
    select outbox.outbox_id
    from flashcard_integrity.alert_outbox outbox
    where outbox.destination = v_consumer.destination
      and outbox.delivered_at is null
      and outbox.created_at <= p_observed_at
    order by outbox.outbox_id
    limit 500
  ) batch;

  if v_available_max is null or v_through <> v_available_max then
    raise exception using
      errcode = '22023',
      message = 'outbox acknowledgement watermark no longer matches the pending range';
  end if;

  v_previous_watermark := v_consumer.last_acknowledged_outbox_id;

  update flashcard_integrity.alert_outbox outbox
  set delivered_at = v_now,
      attempts = least(outbox.attempts::integer + 1, 32767)::smallint,
      last_error = null
  where outbox.destination = v_consumer.destination
    and outbox.delivered_at is null
    and outbox.outbox_id <= v_through
    and outbox.created_at <= p_observed_at;
  get diagnostics v_delivered_count = row_count;

  v_resulting_watermark := greatest(
    v_previous_watermark,
    v_through
  );
  v_receipt := pg_catalog.jsonb_build_object(
    'schemaVersion', '2026-08-15.1',
    'status', case when v_delivered_count > 0 then 'acknowledged' else 'noop' end,
    'throughOutboxId', v_through::text,
    'previousWatermark', v_previous_watermark::text,
    'resultingWatermark', v_resulting_watermark::text,
    'deliveredCount', v_delivered_count,
    'reconciliationRunKey', p_reconciliation_run_key,
    'reconciliationReference', p_reconciliation_reference,
    'acknowledgedAt', v_now
  );

  insert into flashcard_integrity.outbox_acknowledgements (
    consumer_id,
    reconciliation_run_key,
    through_outbox_id,
    observed_at,
    health_fingerprint,
    reconciliation_action,
    reconciliation_reference,
    previous_watermark,
    resulting_watermark,
    delivered_count,
    canonical_receipt
  ) values (
    v_consumer.consumer_id,
    p_reconciliation_run_key,
    v_through,
    p_observed_at,
    p_health_fingerprint,
    p_reconciliation_action,
    p_reconciliation_reference,
    v_previous_watermark,
    v_resulting_watermark,
    v_delivered_count,
    v_receipt
  );

  update flashcard_integrity.watchdog_outbox_consumers consumer
  set last_acknowledged_outbox_id = v_resulting_watermark,
      last_reconciled_at = p_observed_at,
      last_health_fingerprint = p_health_fingerprint,
      updated_at = v_now
  where consumer.consumer_id = v_consumer.consumer_id;

  return v_receipt;
end;
$$;

revoke all on function public.flashcard_integrity_acknowledge_outbox(
  text, timestamptz, text, text, text, text
) from public, anon, authenticated, service_role;
grant execute on function public.flashcard_integrity_acknowledge_outbox(
  text, timestamptz, text, text, text, text
) to anon;

notify pgrst, 'reload schema';
commit;
