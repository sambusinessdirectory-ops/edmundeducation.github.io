-- Transactional verification for exact-batch watchdog acknowledgement schema .3.
-- All temporary credentials, alerts, outbox rows, receipts, and mutations roll back.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

do $verification$
declare
  v_health_token text := 'verification-health-v3-0123456789abcdef-0123456789abcdef';
  v_ack_token text := 'verification-outbox-v3-0123456789abcdef-0123456789abcdef';
  v_consumer_id uuid;
  v_alert_one bigint;
  v_alert_hidden bigint;
  v_alert_high bigint;
  v_outbox_one bigint;
  v_outbox_hidden bigint;
  v_outbox_high bigint;
  v_observed_at timestamptz := pg_catalog.clock_timestamp();
  v_fingerprint text := pg_catalog.repeat('a', 64);
  v_run_one text := pg_catalog.repeat('b', 64);
  v_run_two text := pg_catalog.repeat('c', 64);
  v_health jsonb;
  v_receipt jsonb;
  v_duplicate_receipt jsonb;
  v_digest_one text;
  v_stale_digest text;
  v_current_digest text;
  v_count bigint;
begin
  if pg_catalog.to_regprocedure('public.flashcard_integrity_health()') is null
     or pg_catalog.to_regprocedure(
       'public.flashcard_integrity_health_pre_batch_digest_internal()'
     ) is null
     or pg_catalog.to_regprocedure(
       'public.flashcard_integrity_acknowledge_outbox(text,timestamptz,text,text,text,text,text)'
     ) is null
     or pg_catalog.to_regprocedure(
       'public.flashcard_integrity_acknowledge_outbox_pre_batch_digest_internal(text,timestamptz,text,text,text,text)'
     ) is null then
    raise exception 'Exact-batch public/internal functions are missing.';
  end if;

  if not pg_catalog.has_function_privilege(
       'anon',
       'public.flashcard_integrity_acknowledge_outbox(text,timestamptz,text,text,text,text,text)',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'authenticated',
       'public.flashcard_integrity_acknowledge_outbox(text,timestamptz,text,text,text,text,text)',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'service_role',
       'public.flashcard_integrity_acknowledge_outbox(text,timestamptz,text,text,text,text,text)',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'anon',
       'public.flashcard_integrity_acknowledge_outbox_pre_batch_digest_internal(text,timestamptz,text,text,text,text)',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'anon',
       'public.flashcard_integrity_health_pre_batch_digest_internal()',
       'EXECUTE'
     ) then
    raise exception 'Exact-batch acknowledgement ACLs are not least privilege.';
  end if;

  if exists (
    select 1
    from flashcard_integrity.outbox_acknowledgements acknowledgement
    where acknowledgement.observed_batch_digest is not null
      and acknowledgement.observed_batch_digest !~ '^[0-9a-f]{64}$'
  ) then
    raise exception 'Stored acknowledgement batch digest constraint is ineffective.';
  end if;

  insert into flashcard_integrity.watchdog_credentials (
    label,
    token_digest,
    enabled,
    valid_after,
    valid_until
  ) values (
    '__outbox_digest_health_verification__' || pg_catalog.gen_random_uuid()::text,
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
    '__outbox_digest_verification__' || pg_catalog.gen_random_uuid()::text,
    'flashcard-integrity-verification-v3',
    extensions.digest(pg_catalog.convert_to(v_ack_token, 'UTF8'), 'sha256'),
    true,
    now() - interval '1 minute',
    now() + interval '10 minutes'
  ) returning consumer_id into v_consumer_id;

  perform pg_catalog.set_config(
    'request.headers',
    pg_catalog.jsonb_build_object(
      'x-flashcard-watchdog-token', v_health_token,
      'x-flashcard-watchdog-snapshot-checks-enabled', 'false'
    )::text,
    true
  );
  v_health := public.flashcard_integrity_health();

  if v_health ->> 'schemaVersion' <> '2026-08-15.3'
     or v_health #>> '{checks,outbox,ackBatchDigestAlgorithm}' <>
       'sha256-ordered-decimal-outbox-ids-v1'
     or (
       coalesce((v_health #>> '{checks,outbox,ackPendingCount}')::bigint, 0) = 0
       and v_health #> '{checks,outbox,ackBatchDigest}'
         is distinct from 'null'::jsonb
     )
     or (
       coalesce((v_health #>> '{checks,outbox,ackPendingCount}')::bigint, 0) > 0
       and coalesce(v_health #>> '{checks,outbox,ackBatchDigest}', '')
         !~ '^[0-9a-f]{64}$'
     ) then
    raise exception 'Exact-batch aggregate health contract failed: %', v_health;
  end if;

  insert into flashcard_integrity.alerts (
    severity, code, action_taken, actor_kind
  ) values (
    'warning', 'verification_digest_one', 'verification_only', 'acceptance_test'
  ) returning alert_id into v_alert_one;
  insert into flashcard_integrity.alert_outbox (
    alert_id, destination, created_at
  ) values (
    v_alert_one,
    'flashcard-integrity-verification-v3',
    v_observed_at - interval '1 minute'
  ) returning outbox_id into v_outbox_one;

  v_digest_one := pg_catalog.encode(
    extensions.digest(
      pg_catalog.convert_to(v_outbox_one::text, 'UTF8'),
      'sha256'
    ),
    'hex'
  );

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
    v_digest_one,
    v_fingerprint,
    'opened_issue',
    'github:owner/repository#42',
    v_run_one
  );

  if v_receipt ->> 'schemaVersion' <> '2026-08-15.2'
     or v_receipt ->> 'status' <> 'acknowledged'
     or v_receipt ->> 'deliveredCount' <> '1'
     or v_receipt ->> 'observedBatchDigest' <> v_digest_one
     or not exists (
       select 1
       from flashcard_integrity.alert_outbox outbox
       where outbox.outbox_id = v_outbox_one
         and outbox.delivered_at is not null
     ) then
    raise exception 'Exact one-row acknowledgement failed: %', v_receipt;
  end if;

  v_duplicate_receipt := public.flashcard_integrity_acknowledge_outbox(
    v_outbox_one::text,
    v_observed_at,
    v_digest_one,
    v_fingerprint,
    'opened_issue',
    'github:owner/repository#42',
    v_run_one
  );
  if v_duplicate_receipt <> v_receipt then
    raise exception 'Exact-batch acknowledgement replay was not idempotent.';
  end if;

  -- Reproduce the old watermark-only race without concurrency: a lower ID is hidden
  -- while the observed digest is calculated, then becomes pending before delivery.
  insert into flashcard_integrity.alerts (
    severity, code, action_taken, actor_kind
  ) values (
    'warning', 'verification_hidden_lower', 'verification_only', 'acceptance_test'
  ) returning alert_id into v_alert_hidden;
  insert into flashcard_integrity.alert_outbox (
    alert_id, destination, delivered_at, created_at
  ) values (
    v_alert_hidden,
    'flashcard-integrity-verification-v3',
    v_observed_at,
    v_observed_at - interval '30 seconds'
  ) returning outbox_id into v_outbox_hidden;

  insert into flashcard_integrity.alerts (
    severity, code, action_taken, actor_kind
  ) values (
    'warning', 'verification_visible_high', 'verification_only', 'acceptance_test'
  ) returning alert_id into v_alert_high;
  insert into flashcard_integrity.alert_outbox (
    alert_id, destination, created_at
  ) values (
    v_alert_high,
    'flashcard-integrity-verification-v3',
    v_observed_at - interval '20 seconds'
  ) returning outbox_id into v_outbox_high;

  if v_outbox_hidden >= v_outbox_high then
    raise exception 'Verification identity ordering assumption failed.';
  end if;

  v_stale_digest := pg_catalog.encode(
    extensions.digest(
      pg_catalog.convert_to(v_outbox_high::text, 'UTF8'),
      'sha256'
    ),
    'hex'
  );
  update flashcard_integrity.alert_outbox
  set delivered_at = null
  where outbox_id = v_outbox_hidden;

  begin
    perform public.flashcard_integrity_acknowledge_outbox(
      v_outbox_high::text,
      v_observed_at,
      v_stale_digest,
      v_fingerprint,
      'updated_issue',
      'github:owner/repository#42',
      v_run_two
    );
    raise exception 'Changed exact batch was incorrectly accepted.';
  exception
    when sqlstate '22023' then null;
  end;

  select pg_catalog.count(*) into v_count
  from flashcard_integrity.alert_outbox outbox
  where outbox.outbox_id in (v_outbox_hidden, v_outbox_high)
    and outbox.delivered_at is null;
  if v_count <> 2 then
    raise exception 'Digest mismatch partially delivered an observed batch.';
  end if;

  v_current_digest := pg_catalog.encode(
    extensions.digest(
      pg_catalog.convert_to(
        v_outbox_hidden::text || ',' || v_outbox_high::text,
        'UTF8'
      ),
      'sha256'
    ),
    'hex'
  );
  v_receipt := public.flashcard_integrity_acknowledge_outbox(
    v_outbox_high::text,
    v_observed_at,
    v_current_digest,
    v_fingerprint,
    'updated_issue',
    'github:owner/repository#42',
    pg_catalog.repeat('d', 64)
  );
  if v_receipt ->> 'deliveredCount' <> '2'
     or v_receipt ->> 'observedBatchDigest' <> v_current_digest then
    raise exception 'Reconciled exact two-row batch failed: %', v_receipt;
  end if;

  if exists (
    select 1
    from flashcard_integrity.outbox_acknowledgements acknowledgement
    where acknowledgement.consumer_id = v_consumer_id
      and acknowledgement.canonical_receipt ->> 'schemaVersion' = '2026-08-15.2'
      and acknowledgement.observed_batch_digest is null
  ) then
    raise exception 'New exact-batch receipt omitted its stored digest.';
  end if;

  -- Append-only receipt protection remains active after adding the digest column.
  begin
    update flashcard_integrity.outbox_acknowledgements
    set observed_batch_digest = pg_catalog.repeat('f', 64)
    where consumer_id = v_consumer_id;
    raise exception 'Exact-batch acknowledgement receipt mutation was accepted.';
  exception
    when sqlstate '55000' then null;
  end;

  raise notice 'Flashcard exact-batch acknowledgement schema .3 verification PASSED; rolling back.';
end;
$verification$;

rollback;
