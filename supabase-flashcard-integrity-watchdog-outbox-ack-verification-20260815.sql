-- Transactional verification for the external watchdog outbox acknowledgement path.
-- All credentials, alerts, outbox rows, receipts, and delivery mutations roll back.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

do $verification$
declare
  v_health_token text := 'verification-health-token-0123456789abcdef-0123456789abcdef';
  v_ack_token text := 'verification-outbox-token-0123456789abcdef-0123456789abcdef';
  v_consumer_id uuid;
  v_alert_one bigint;
  v_alert_two bigint;
  v_alert_future bigint;
  v_outbox_one bigint;
  v_outbox_two bigint;
  v_outbox_future bigint;
  v_batch_through bigint;
  v_batch_last bigint;
  v_observed_at timestamptz := now();
  v_fingerprint text := pg_catalog.repeat('a', 64);
  v_run_one text := pg_catalog.repeat('b', 64);
  v_run_two text := pg_catalog.repeat('c', 64);
  v_health jsonb;
  v_receipt jsonb;
  v_duplicate_receipt jsonb;
  v_count bigint;
begin
  if pg_catalog.to_regprocedure('public.flashcard_integrity_health()') is null
     or pg_catalog.to_regprocedure(
       'public.flashcard_integrity_health_pre_outbox_ack_internal()'
     ) is null
     or pg_catalog.to_regprocedure(
       'public.flashcard_integrity_acknowledge_outbox(text,timestamptz,text,text,text,text)'
     ) is null then
    raise exception 'Outbox acknowledgement public/internal functions are missing.';
  end if;

  if not pg_catalog.has_function_privilege(
       'anon',
       'public.flashcard_integrity_acknowledge_outbox(text,timestamptz,text,text,text,text)',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'authenticated',
       'public.flashcard_integrity_acknowledge_outbox(text,timestamptz,text,text,text,text)',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'service_role',
       'public.flashcard_integrity_acknowledge_outbox(text,timestamptz,text,text,text,text)',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'anon',
       'public.flashcard_integrity_health_pre_outbox_ack_internal()',
       'EXECUTE'
     ) then
    raise exception 'Outbox acknowledgement function ACLs are not least privilege.';
  end if;

  if pg_catalog.has_table_privilege(
       'anon',
       'flashcard_integrity.watchdog_outbox_consumers',
       'SELECT,INSERT,UPDATE,DELETE'
     )
     or pg_catalog.has_table_privilege(
       'authenticated',
       'flashcard_integrity.watchdog_outbox_consumers',
       'SELECT,INSERT,UPDATE,DELETE'
     )
     or pg_catalog.has_table_privilege(
       'service_role',
       'flashcard_integrity.watchdog_outbox_consumers',
       'SELECT,INSERT,UPDATE,DELETE'
     )
     or pg_catalog.has_table_privilege(
       'anon',
       'flashcard_integrity.outbox_acknowledgements',
       'SELECT,INSERT,UPDATE,DELETE'
     ) then
    raise exception 'Private outbox acknowledgement tables gained a Data API privilege.';
  end if;

  insert into flashcard_integrity.watchdog_credentials (
    label,
    token_digest,
    enabled,
    valid_after,
    valid_until
  ) values (
    '__outbox_ack_health_verification__' || pg_catalog.gen_random_uuid()::text,
    extensions.digest(pg_catalog.convert_to(v_health_token, 'UTF8'), 'sha256'),
    true,
    now() - interval '1 minute',
    now() + interval '10 minutes'
  );

  insert into flashcard_integrity.watchdog_outbox_consumers (
    label,
    destination,
    token_digest,
    enabled,
    valid_after,
    valid_until
  ) values (
    '__outbox_ack_verification__' || pg_catalog.gen_random_uuid()::text,
    'flashcard-integrity-verification',
    extensions.digest(pg_catalog.convert_to(v_ack_token, 'UTF8'), 'sha256'),
    true,
    now() - interval '1 minute',
    now() + interval '10 minutes'
  ) returning consumer_id into v_consumer_id;

  -- Verify the aggregate-only public health contract before creating the private
  -- verification destination rows.
  perform pg_catalog.set_config(
    'request.headers',
    pg_catalog.jsonb_build_object(
      'x-flashcard-watchdog-token', v_health_token,
      'x-flashcard-watchdog-snapshot-checks-enabled', 'false'
    )::text,
    true
  );
  v_health := public.flashcard_integrity_health();

  if v_health ->> 'schemaVersion' <> '2026-08-15.2'
     or pg_catalog.jsonb_typeof(
       v_health #> '{checks,outbox,pendingWarningCount}'
     ) <> 'number'
     or pg_catalog.jsonb_typeof(
       v_health #> '{checks,outbox,pendingCriticalCount}'
     ) <> 'number'
     or pg_catalog.jsonb_typeof(
       v_health #> '{checks,outbox,pendingOptimisticConflictCount}'
     ) <> 'number'
     or pg_catalog.jsonb_typeof(
       v_health #> '{checks,outbox,ackPendingCount}'
     ) <> 'number'
     or pg_catalog.jsonb_typeof(
       v_health #> '{checks,outbox,ackObservedAt}'
     ) <> 'string'
     or v_health #>> '{checks,outbox,ackBatchLimit}' <> '500'
     or (
       coalesce((v_health #>> '{checks,outbox,pendingCount}')::bigint, 0) = 0
       and v_health #> '{checks,outbox,ackThroughOutboxId}'
         is distinct from 'null'::jsonb
     )
     or (
       coalesce((v_health #>> '{checks,outbox,pendingCount}')::bigint, 0) > 0
       and coalesce(v_health #>> '{checks,outbox,ackThroughOutboxId}', '')
         !~ '^[1-9][0-9]{0,18}$'
     ) then
    raise exception 'Aggregate outbox health contract verification failed: %', v_health;
  end if;

  insert into flashcard_integrity.alerts (
    severity,
    code,
    action_taken,
    actor_kind
  ) values (
    'warning',
    'optimistic_version_conflict',
    'verification_only',
    'acceptance_test'
  ) returning alert_id into v_alert_one;
  insert into flashcard_integrity.alert_outbox (
    alert_id,
    destination,
    created_at
  ) values (
    v_alert_one,
    'flashcard-integrity-verification',
    v_observed_at - interval '1 minute'
  ) returning outbox_id into v_outbox_one;

  perform pg_catalog.set_config(
    'request.headers',
    pg_catalog.jsonb_build_object(
      'x-flashcard-watchdog-outbox-ack-token', v_ack_token
    )::text,
    true
  );
  v_receipt := public.flashcard_integrity_acknowledge_outbox(
    v_outbox_one::text,
    v_observed_at,
    v_fingerprint,
    'opened_issue',
    'github:owner/repository#42',
    v_run_one
  );

  if v_receipt ->> 'status' <> 'acknowledged'
     or v_receipt ->> 'deliveredCount' <> '1'
     or v_receipt ->> 'throughOutboxId' <> v_outbox_one::text
     or v_receipt ->> 'reconciliationReference' <>
       'github:owner/repository#42'
     or not exists (
       select 1
       from flashcard_integrity.alert_outbox outbox
       where outbox.outbox_id = v_outbox_one
         and outbox.delivered_at is not null
     )
     then
    raise exception 'Bounded acknowledgement changed the wrong rows: %', v_receipt;
  end if;

  -- The exact same reconciliation run is replay-safe and returns its stored receipt.
  v_duplicate_receipt := public.flashcard_integrity_acknowledge_outbox(
    v_outbox_one::text,
    v_observed_at,
    v_fingerprint,
    'opened_issue',
    'github:owner/repository#42',
    v_run_one
  );
  select pg_catalog.count(*) into v_count
  from flashcard_integrity.outbox_acknowledgements acknowledgement
  where acknowledgement.consumer_id = v_consumer_id
    and acknowledgement.reconciliation_run_key = v_run_one;
  if v_duplicate_receipt <> v_receipt or v_count <> 1 then
    raise exception 'Acknowledgement replay was not idempotent.';
  end if;

  insert into flashcard_integrity.alerts (
    severity,
    code,
    action_taken,
    actor_kind
  ) values (
    'warning',
    'optimistic_version_conflict',
    'verification_only',
    'acceptance_test'
  ) returning alert_id into v_alert_two;
  insert into flashcard_integrity.alert_outbox (
    alert_id,
    destination,
    created_at
  ) values (
    v_alert_two,
    'flashcard-integrity-verification',
    v_observed_at - interval '30 seconds'
  ) returning outbox_id into v_outbox_two;

  v_receipt := public.flashcard_integrity_acknowledge_outbox(
    v_outbox_two::text,
    v_observed_at,
    v_fingerprint,
    'updated_issue',
    'github:owner/repository#42',
    v_run_two
  );
  if v_receipt ->> 'deliveredCount' <> '1'
     or v_receipt ->> 'resultingWatermark' <> v_outbox_two::text then
    raise exception 'Second bounded acknowledgement failed: %', v_receipt;
  end if;

  -- A future/unobserved row cannot be swept into an earlier reconciliation.
  insert into flashcard_integrity.alerts (
    severity,
    code,
    action_taken,
    actor_kind
  ) values (
    'warning',
    'verification_future_row',
    'verification_only',
    'acceptance_test'
  ) returning alert_id into v_alert_future;
  insert into flashcard_integrity.alert_outbox (
    alert_id,
    destination,
    created_at
  ) values (
    v_alert_future,
    'flashcard-integrity-verification',
    v_observed_at + interval '1 minute'
  ) returning outbox_id into v_outbox_future;

  begin
    perform public.flashcard_integrity_acknowledge_outbox(
      v_outbox_future::text,
      v_observed_at,
      v_fingerprint,
      'updated_issue',
      'github:owner/repository#42',
      pg_catalog.repeat('d', 64)
    );
    raise exception 'Future/unobserved watermark was incorrectly accepted.';
  exception
    when sqlstate '22023' then null;
  end;

  -- An invalid token cannot replay or advance a valid consumer watermark.
  perform pg_catalog.set_config(
    'request.headers',
    '{"x-flashcard-watchdog-outbox-ack-token":"invalid-invalid-invalid-invalid-invalid"}',
    true
  );
  begin
    perform public.flashcard_integrity_acknowledge_outbox(
      v_outbox_two::text,
      v_observed_at,
      v_fingerprint,
      'updated_issue',
      'github:owner/repository#42',
      pg_catalog.repeat('e', 64)
    );
    raise exception 'Invalid acknowledgement token was accepted.';
  exception
    when insufficient_privilege then null;
  end;

  -- The exact first 500 rows are one bounded transaction; row 501 remains pending
  -- for the next independently reconciled run.
  insert into flashcard_integrity.alerts (
    severity,
    code,
    action_taken,
    actor_kind
  )
  select
    'warning',
    'verification_batch_' || batch.ordinal::text,
    '__outbox_ack_batch_verification__',
    'acceptance_test'
  from pg_catalog.generate_series(1, 501) batch(ordinal);

  insert into flashcard_integrity.alert_outbox (
    alert_id,
    destination,
    created_at
  )
  select
    alert.alert_id,
    'flashcard-integrity-verification',
    v_observed_at - interval '2 minutes'
  from flashcard_integrity.alerts alert
  where alert.action_taken = '__outbox_ack_batch_verification__'
    and alert.actor_kind = 'acceptance_test';

  select pg_catalog.max(batch.outbox_id)
  into v_batch_through
  from (
    select outbox.outbox_id
    from flashcard_integrity.alert_outbox outbox
    join flashcard_integrity.alerts alert on alert.alert_id = outbox.alert_id
    where outbox.destination = 'flashcard-integrity-verification'
      and outbox.delivered_at is null
      and outbox.created_at <= v_observed_at
      and alert.action_taken = '__outbox_ack_batch_verification__'
    order by outbox.outbox_id
    limit 500
  ) batch;
  select pg_catalog.max(outbox.outbox_id)
  into v_batch_last
  from flashcard_integrity.alert_outbox outbox
  join flashcard_integrity.alerts alert on alert.alert_id = outbox.alert_id
  where outbox.destination = 'flashcard-integrity-verification'
    and outbox.delivered_at is null
    and outbox.created_at <= v_observed_at
    and alert.action_taken = '__outbox_ack_batch_verification__';

  perform pg_catalog.set_config(
    'request.headers',
    pg_catalog.jsonb_build_object(
      'x-flashcard-watchdog-outbox-ack-token', v_ack_token
    )::text,
    true
  );
  v_receipt := public.flashcard_integrity_acknowledge_outbox(
    v_batch_through::text,
    v_observed_at,
    v_fingerprint,
    'updated_issue',
    'github:owner/repository#42',
    pg_catalog.repeat('f', 64)
  );
  select pg_catalog.count(*) into v_count
  from flashcard_integrity.alert_outbox outbox
  join flashcard_integrity.alerts alert on alert.alert_id = outbox.alert_id
  where outbox.destination = 'flashcard-integrity-verification'
    and outbox.delivered_at is null
    and alert.action_taken = '__outbox_ack_batch_verification__';
  if v_receipt ->> 'deliveredCount' <> '500'
     or v_count <> 1
     or v_batch_through >= v_batch_last then
    raise exception 'The 500-row acknowledgement bound failed: %, pending=%',
      v_receipt, v_count;
  end if;

  v_receipt := public.flashcard_integrity_acknowledge_outbox(
    v_batch_last::text,
    v_observed_at,
    v_fingerprint,
    'updated_issue',
    'github:owner/repository#42',
    pg_catalog.repeat('0', 64)
  );
  if v_receipt ->> 'deliveredCount' <> '1' then
    raise exception 'The second bounded acknowledgement failed: %', v_receipt;
  end if;

  -- Delivery receipts are immutable even to an accidental privileged update path.
  begin
    update flashcard_integrity.outbox_acknowledgements
    set delivered_count = delivered_count + 1
    where consumer_id = v_consumer_id;
    raise exception 'Acknowledgement receipt mutation was accepted.';
  exception
    when sqlstate '55000' then null;
  end;

  raise notice 'Flashcard external outbox acknowledgement verification PASSED; rolling back.';
end;
$verification$;

rollback;
