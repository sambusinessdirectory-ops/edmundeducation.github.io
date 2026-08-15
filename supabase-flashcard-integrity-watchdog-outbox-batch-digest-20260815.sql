-- Forward-only hardening for an already-installed outbox acknowledgement schema .2.
--
-- The .2 watermark and observation-time boundary prevented later/high-ID rows from
-- being swept, but an older transaction could theoretically commit a previously
-- invisible lower outbox ID between the probe and acknowledgement. Schema .3 binds
-- reconciliation to SHA-256(ordered observed outbox IDs), recomputes that exact digest
-- under row locks, and updates only the captured ID array.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

alter table flashcard_integrity.outbox_acknowledgements
  add column if not exists observed_batch_digest text;

do $receipt_constraint$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid =
      'flashcard_integrity.outbox_acknowledgements'::pg_catalog.regclass
      and constraint_row.conname =
        'flashcard_integrity_outbox_ack_observed_batch_digest_check'
  ) then
    alter table flashcard_integrity.outbox_acknowledgements
      add constraint flashcard_integrity_outbox_ack_observed_batch_digest_check
      check (
        observed_batch_digest is null
        or observed_batch_digest ~ '^[0-9a-f]{64}$'
      );
  end if;
end;
$receipt_constraint$;

-- Preserve the .2 health wrapper exactly once. Reapplication validates the .3
-- wrapper instead of stacking wrappers or weakening API reachability.
do $health_cutover$
declare
  v_public pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health()'
  );
  v_preserved pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_health_pre_batch_digest_internal()'
  );
  v_definition text;
begin
  if v_preserved is null then
    if v_public is null then
      raise exception using
        errcode = '55000',
        message = 'Flashcard watchdog schema .2 health RPC is missing; batch-digest hardening was not installed.';
    end if;

    v_definition := pg_catalog.lower(pg_catalog.pg_get_functiondef(v_public));
    if pg_catalog.strpos(v_definition, '2026-08-15.2') = 0
       or pg_catalog.strpos(v_definition, 'ackthroughoutboxid') = 0
       or pg_catalog.strpos(v_definition, 'ackobservedat') = 0 then
      raise exception using
        errcode = '55000',
        message = 'Flashcard watchdog is not the reviewed acknowledgement schema 2026-08-15.2 implementation.';
    end if;

    alter function public.flashcard_integrity_health()
      rename to flashcard_integrity_health_pre_batch_digest_internal;
  else
    if v_public is null then
      raise exception using
        errcode = '55000',
        message = 'Preserved schema .2 health RPC exists but public schema .3 wrapper is missing.';
    end if;

    v_definition := pg_catalog.lower(pg_catalog.pg_get_functiondef(v_public));
    if pg_catalog.strpos(v_definition, '2026-08-15.3') = 0
       or pg_catalog.strpos(v_definition, 'ackbatchdigest') = 0 then
      raise exception using
        errcode = '55000',
        message = 'Current Flashcard watchdog is not the reviewed exact-batch schema .3 wrapper.';
    end if;
  end if;
end;
$health_cutover$;

revoke all on function public.flashcard_integrity_health_pre_batch_digest_internal()
  from public, anon, authenticated, service_role;

create or replace function public.flashcard_integrity_health()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $health_wrapper$
declare
  v_health jsonb;
  v_checks jsonb := '{}'::jsonb;
  v_outbox_check jsonb := '{}'::jsonb;
  v_incident_codes jsonb := '[]'::jsonb;
  v_observed_at timestamptz;
  v_reported_pending bigint;
  v_reported_through text;
  v_batch_ids bigint[];
  v_batch_count bigint := 0;
  v_batch_through bigint;
  v_batch_digest text;
  v_contract_valid boolean := true;
  v_base_healthy boolean := false;
  v_healthy boolean := false;
begin
  -- The preserved .2 wrapper performs health-token authorization and every existing
  -- aggregate check before this wrapper reads the private outbox membership.
  v_health := public.flashcard_integrity_health_pre_batch_digest_internal();

  begin
    v_contract_valid := coalesce(
      pg_catalog.jsonb_typeof(v_health) = 'object'
      and v_health ->> 'schemaVersion' = '2026-08-15.2'
      and pg_catalog.jsonb_typeof(v_health -> 'checks') = 'object'
      and pg_catalog.jsonb_typeof(v_health #> '{checks,outbox}') = 'object'
      and pg_catalog.lower(coalesce(v_health ->> 'healthy', '')) in ('true', 'false'),
      false
    );
    if v_contract_valid then
      v_base_healthy := (v_health ->> 'healthy')::boolean;
      v_observed_at := (v_health #>> '{checks,outbox,ackObservedAt}')::timestamptz;
      v_reported_pending :=
        (v_health #>> '{checks,outbox,ackPendingCount}')::bigint;
      v_reported_through := v_health #>> '{checks,outbox,ackThroughOutboxId}';
    end if;
  exception
    when others then
      v_contract_valid := false;
      v_base_healthy := false;
  end;

  if v_contract_valid then
    select
      pg_catalog.array_agg(batch.outbox_id order by batch.outbox_id),
      pg_catalog.count(*)::bigint,
      pg_catalog.max(batch.outbox_id)
    into v_batch_ids, v_batch_count, v_batch_through
    from (
      select outbox.outbox_id
      from flashcard_integrity.alert_outbox outbox
      where outbox.destination = 'flashcard-integrity-monitor'
        and outbox.delivered_at is null
        and outbox.created_at <= v_observed_at
      order by outbox.outbox_id
      limit 500
    ) batch;

    if v_batch_count > 0 then
      v_batch_digest := pg_catalog.encode(
        extensions.digest(
          pg_catalog.convert_to(
            pg_catalog.array_to_string(v_batch_ids, ','),
            'UTF8'
          ),
          'sha256'
        ),
        'hex'
      );
    end if;

    v_contract_valid := coalesce(
      v_reported_pending >= 0
      and v_batch_count = least(v_reported_pending, 500::bigint)
      and (
        (v_batch_count = 0 and v_reported_through is null)
        or (
          v_batch_count > 0
          and v_reported_through = v_batch_through::text
          and v_batch_digest ~ '^[0-9a-f]{64}$'
        )
      ),
      false
    );
  end if;

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
    'ackBatchDigest', case
      when v_batch_count = 0 then null
      else v_batch_digest
    end,
    'ackBatchDigestAlgorithm', 'sha256-ordered-decimal-outbox-ids-v1'
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
    select 'watchdog_outbox_batch_digest_invalid'::text
    where not v_contract_valid
  ) incident_set;

  v_healthy := v_contract_valid
    and v_base_healthy
    and pg_catalog.jsonb_array_length(v_incident_codes) = 0;

  return v_health || pg_catalog.jsonb_build_object(
    'schemaVersion', '2026-08-15.3',
    'healthy', v_healthy,
    'status', case when v_healthy then 'healthy' else 'unhealthy' end,
    'incidentCodes', v_incident_codes,
    'checks', v_checks
  );
end;
$health_wrapper$;

revoke all on function public.flashcard_integrity_health()
  from public, anon, authenticated, service_role;
grant execute on function public.flashcard_integrity_health() to anon;

-- Preserve and remove API reachability from the .2 six-argument acknowledgement RPC.
-- It is retained only so an emergency rollback can restore the exact previous contract.
do $ack_cutover$
declare
  v_old pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_acknowledge_outbox(text,timestamptz,text,text,text,text)'
  );
  v_preserved pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_acknowledge_outbox_pre_batch_digest_internal(text,timestamptz,text,text,text,text)'
  );
  v_new pg_catalog.regprocedure := pg_catalog.to_regprocedure(
    'public.flashcard_integrity_acknowledge_outbox(text,timestamptz,text,text,text,text,text)'
  );
  v_definition text;
begin
  if v_preserved is null then
    if v_old is null then
      raise exception using
        errcode = '55000',
        message = 'Schema .2 acknowledgement RPC is missing; exact-batch cutover was not installed.';
    end if;
    v_definition := pg_catalog.lower(pg_catalog.pg_get_functiondef(v_old));
    if pg_catalog.strpos(v_definition, '''schemaversion'', ''2026-08-15.1''') = 0
       or pg_catalog.strpos(v_definition, 'outbox.outbox_id <= v_through') = 0 then
      raise exception using
        errcode = '55000',
        message = 'Existing acknowledgement RPC is not the reviewed schema .2 implementation.';
    end if;
    alter function public.flashcard_integrity_acknowledge_outbox(
      text, timestamptz, text, text, text, text
    ) rename to flashcard_integrity_acknowledge_outbox_pre_batch_digest_internal;
  elsif v_new is null then
    raise exception using
      errcode = '55000',
      message = 'Preserved schema .2 acknowledgement RPC exists but exact-batch RPC is missing.';
  end if;
end;
$ack_cutover$;

revoke all on function
  public.flashcard_integrity_acknowledge_outbox_pre_batch_digest_internal(
    text, timestamptz, text, text, text, text
  ) from public, anon, authenticated, service_role;

create or replace function public.flashcard_integrity_acknowledge_outbox(
  p_through_outbox_id text,
  p_observed_at timestamptz,
  p_observed_batch_digest text,
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
as $acknowledge$
declare
  v_now timestamptz := now();
  v_headers jsonb := '{}'::jsonb;
  v_token text;
  v_consumer flashcard_integrity.watchdog_outbox_consumers%rowtype;
  v_existing flashcard_integrity.outbox_acknowledgements%rowtype;
  v_through bigint;
  v_batch_ids bigint[];
  v_batch_count bigint := 0;
  v_available_max bigint;
  v_available_digest text;
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
     or p_observed_batch_digest is null
     or p_observed_batch_digest !~ '^[0-9a-f]{64}$'
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
       or v_existing.observed_batch_digest is distinct from p_observed_batch_digest
       or v_existing.health_fingerprint <> p_health_fingerprint
       or v_existing.reconciliation_action <> p_reconciliation_action
       or v_existing.reconciliation_reference <> p_reconciliation_reference then
      raise exception using
        errcode = '23505',
        message = 'outbox acknowledgement idempotency key conflict';
    end if;
    return v_existing.canonical_receipt;
  end if;

  -- Lock and capture exactly the membership whose digest is checked. The update below
  -- uses this immutable local ID array, never a broad <= watermark predicate.
  select
    pg_catalog.array_agg(batch.outbox_id order by batch.outbox_id),
    pg_catalog.count(*)::bigint,
    pg_catalog.max(batch.outbox_id)
  into v_batch_ids, v_batch_count, v_available_max
  from (
    select outbox.outbox_id
    from flashcard_integrity.alert_outbox outbox
    where outbox.destination = v_consumer.destination
      and outbox.delivered_at is null
      and outbox.created_at <= p_observed_at
    order by outbox.outbox_id
    limit 500
    for update
  ) batch;

  if v_batch_count > 0 then
    v_available_digest := pg_catalog.encode(
      extensions.digest(
        pg_catalog.convert_to(
          pg_catalog.array_to_string(v_batch_ids, ','),
          'UTF8'
        ),
        'sha256'
      ),
      'hex'
    );
  end if;

  if v_available_max is null
     or v_through <> v_available_max
     or v_available_digest is distinct from p_observed_batch_digest then
    raise exception using
      errcode = '22023',
      message = 'outbox acknowledgement exact batch no longer matches the observed batch';
  end if;

  v_previous_watermark := v_consumer.last_acknowledged_outbox_id;

  update flashcard_integrity.alert_outbox outbox
  set delivered_at = v_now,
      attempts = least(outbox.attempts::integer + 1, 32767)::smallint,
      last_error = null
  where outbox.outbox_id = any(v_batch_ids)
    and outbox.destination = v_consumer.destination
    and outbox.delivered_at is null
    and outbox.created_at <= p_observed_at;
  get diagnostics v_delivered_count = row_count;

  if v_delivered_count <> v_batch_count then
    raise exception using
      errcode = '40001',
      message = 'outbox acknowledgement batch changed while it was being delivered';
  end if;

  v_resulting_watermark := greatest(
    v_previous_watermark,
    v_through
  );
  v_receipt := pg_catalog.jsonb_build_object(
    'schemaVersion', '2026-08-15.2',
    'status', 'acknowledged',
    'throughOutboxId', v_through::text,
    'observedBatchDigest', p_observed_batch_digest,
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
    observed_batch_digest,
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
    p_observed_batch_digest,
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
$acknowledge$;

revoke all on function public.flashcard_integrity_acknowledge_outbox(
  text, timestamptz, text, text, text, text, text
) from public, anon, authenticated, service_role;
grant execute on function public.flashcard_integrity_acknowledge_outbox(
  text, timestamptz, text, text, text, text, text
) to anon;

notify pgrst, 'reload schema';
commit;
