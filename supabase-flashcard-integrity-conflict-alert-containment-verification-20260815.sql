-- Verification for Flashcard optimistic-conflict alert containment.
-- Run after supabase-flashcard-integrity-conflict-alert-containment-20260815.sql.
-- All smoke-test rows roll back.  Identity sequences can retain harmless gaps.

do $installed_shape$
begin
  if not exists (
       select 1
       from pg_catalog.pg_attribute attribute
       where attribute.attrelid = 'flashcard_integrity.alerts'::pg_catalog.regclass
         and attribute.attname in (
           'occurrence_count',
           'last_seen_at',
           'last_request_id',
           'dedup_fingerprint',
           'dedup_window_start'
         )
         and not attribute.attisdropped
       group by attribute.attrelid
       having pg_catalog.count(*) = 5
     )
     or not exists (
       select 1
       from pg_catalog.pg_index index_row
       join pg_catalog.pg_class index_class on index_class.oid = index_row.indexrelid
       where index_class.relname = 'flashcard_integrity_alerts_conflict_dedup_unique_idx'
         and index_row.indisunique
         and index_row.indisvalid
     )
     or not exists (
       select 1
       from pg_catalog.pg_index index_row
       join pg_catalog.pg_class index_class on index_class.oid = index_row.indexrelid
       where index_class.relname = 'flashcard_integrity_outbox_one_pending_per_alert_idx'
         and index_row.indisunique
         and index_row.indisvalid
     ) then
    raise exception 'Conflict-alert containment objects are missing or invalid.';
  end if;

  if pg_catalog.has_function_privilege(
       'anon',
       'flashcard_integrity.record_alert(uuid,text,text,text,uuid,jsonb,jsonb,text,text)',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'authenticated',
       'flashcard_integrity.record_alert(uuid,text,text,text,uuid,jsonb,jsonb,text,text)',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'service_role',
       'flashcard_integrity.record_alert(uuid,text,text,text,uuid,jsonb,jsonb,text,text)',
       'EXECUTE'
     ) then
    raise exception 'Private containment routine is client-executable.';
  end if;
end;
$installed_shape$;

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

do $verification$
declare
  v_student_id uuid := pg_catalog.gen_random_uuid();
  v_student_name text := '__conflict_containment__' || v_student_id::text;
  v_init_request uuid := pg_catalog.gen_random_uuid();
  v_request_1 uuid := pg_catalog.gen_random_uuid();
  v_request_2 uuid := pg_catalog.gen_random_uuid();
  v_request_different uuid := pg_catalog.gen_random_uuid();
  v_request_after_delivery uuid := pg_catalog.gen_random_uuid();
  v_receipt_init jsonb;
  v_receipt_1 jsonb;
  v_receipt_2 jsonb;
  v_receipt_replay jsonb;
  v_receipt_different jsonb;
  v_receipt_after_delivery jsonb;
  v_alert_id_1 bigint;
  v_alert_id_2 bigint;
  v_alert_id_different bigint;
  v_alert_id_after_delivery bigint;
  v_non_target_alert_1 bigint;
  v_non_target_alert_2 bigint;
  v_baseline_value jsonb;
  v_baseline_version bigint;
  v_baseline_checksum text;
  v_baseline_revisions bigint;
  v_count bigint;
  v_occurrence_count bigint;
  v_first_request uuid;
  v_last_request uuid;
begin
  insert into public.flashcard_students (id, name, password_hash, access)
  values (
    v_student_id,
    v_student_name,
    'verification-only-never-used-for-login',
    '{}'::jsonb
  );

  v_receipt_init := flashcard_integrity.write_state_v2(
    v_student_id,
    'acceptance_test',
    'conflict-containment-verification',
    'edmundFlashcardProgress',
    '{"safe":true,"score":1}'::jsonb,
    v_init_request,
    0
  );
  if v_receipt_init ->> 'status' <> 'accepted' then
    raise exception 'Verification setup write failed: %', v_receipt_init;
  end if;

  select state.value, state.version, state.value_checksum
  into v_baseline_value, v_baseline_version, v_baseline_checksum
  from public.flashcard_student_state state
  where state.student_id = v_student_id
    and state.key = 'edmundFlashcardProgress';

  select pg_catalog.count(*)
  into v_baseline_revisions
  from flashcard_integrity.state_revisions revision
  where revision.student_id = v_student_id
    and revision.state_key = 'edmundFlashcardProgress';

  -- Both requests are stale against version 1 and contain byte-for-byte identical
  -- proposed state.  CAS must reject both while alerting only once in this bucket.
  v_receipt_1 := flashcard_integrity.write_state_v2(
    v_student_id,
    'acceptance_test',
    'conflict-containment-verification',
    'edmundFlashcardProgress',
    '{"safe":false,"score":2}'::jsonb,
    v_request_1,
    0
  );
  v_receipt_2 := flashcard_integrity.write_state_v2(
    v_student_id,
    'acceptance_test',
    'conflict-containment-verification',
    'edmundFlashcardProgress',
    '{"safe":false,"score":2}'::jsonb,
    v_request_2,
    0
  );

  if v_receipt_1 ->> 'status' <> 'conflict'
     or v_receipt_1 ->> 'code' <> 'version_conflict'
     or v_receipt_1 ->> 'reloadRequired' <> 'true'
     or v_receipt_2 ->> 'status' <> 'conflict'
     or v_receipt_2 ->> 'code' <> 'version_conflict'
     or v_receipt_2 ->> 'reloadRequired' <> 'true' then
    raise exception 'CAS behavior was weakened: first=%, second=%', v_receipt_1, v_receipt_2;
  end if;

  v_alert_id_1 := (v_receipt_1 ->> 'alertId')::bigint;
  v_alert_id_2 := (v_receipt_2 ->> 'alertId')::bigint;
  if v_alert_id_1 is null or v_alert_id_2 is distinct from v_alert_id_1 then
    raise exception 'Identical conflicts did not share one canonical alert: %, %',
      v_alert_id_1, v_alert_id_2;
  end if;

  select alert.occurrence_count, alert.request_id, alert.last_request_id
  into v_occurrence_count, v_first_request, v_last_request
  from flashcard_integrity.alerts alert
  where alert.alert_id = v_alert_id_1;
  if v_occurrence_count <> 2
     or v_first_request is distinct from v_request_1
     or v_last_request is distinct from v_request_2
     or not exists (
       select 1
       from flashcard_integrity.alerts alert
       where alert.alert_id = v_alert_id_1
         and alert.severity = 'warning'
         and alert.code = 'optimistic_version_conflict'
         and alert.dedup_fingerprint ~ '^[0-9a-f]{64}$'
         and alert.dedup_window_start is not null
         and alert.resolved_at is null
     ) then
    raise exception 'Canonical alert aggregation metadata is wrong.';
  end if;

  select pg_catalog.count(*) into v_count
  from flashcard_integrity.alert_outbox outbox
  where outbox.alert_id = v_alert_id_1;
  if v_count <> 1 then
    raise exception 'Identical conflicts produced % outbox rows instead of 1.', v_count;
  end if;

  select pg_catalog.count(*) into v_count
  from flashcard_integrity.write_receipts receipt
  where receipt.student_id = v_student_id
    and receipt.request_id in (v_request_1, v_request_2)
    and receipt.outcome = 'conflict'
    and receipt.alert_id = v_alert_id_1;
  if v_count <> 2 then
    raise exception 'Distinct conflict requests did not retain two receipts.';
  end if;

  if exists (
       select 1
       from public.flashcard_student_state state
       where state.student_id = v_student_id
         and state.key = 'edmundFlashcardProgress'
         and (
           state.value is distinct from v_baseline_value
           or state.version is distinct from v_baseline_version
           or state.value_checksum is distinct from v_baseline_checksum
         )
     ) then
    raise exception 'A rejected optimistic conflict changed student state.';
  end if;

  select pg_catalog.count(*) into v_count
  from flashcard_integrity.state_revisions revision
  where revision.student_id = v_student_id
    and revision.state_key = 'edmundFlashcardProgress';
  if v_count <> v_baseline_revisions then
    raise exception 'Rejected conflicts fabricated a state revision.';
  end if;

  -- Exact request replay returns the immutable receipt before record_alert is called.
  v_receipt_replay := flashcard_integrity.write_state_v2(
    v_student_id,
    'acceptance_test',
    'conflict-containment-verification',
    'edmundFlashcardProgress',
    '{"safe":false,"score":2}'::jsonb,
    v_request_2,
    0
  );
  select alert.occurrence_count into v_occurrence_count
  from flashcard_integrity.alerts alert
  where alert.alert_id = v_alert_id_1;
  if v_receipt_replay is distinct from v_receipt_2 or v_occurrence_count <> 2 then
    raise exception 'Idempotent replay changed the receipt or occurrence count.';
  end if;

  -- Different stored alert content gets its own fingerprint and notification.
  v_receipt_different := flashcard_integrity.write_state_v2(
    v_student_id,
    'acceptance_test',
    'conflict-containment-verification',
    'edmundFlashcardProgress',
    '{"safe":false}'::jsonb,
    v_request_different,
    0
  );
  v_alert_id_different := (v_receipt_different ->> 'alertId')::bigint;
  if v_alert_id_different is null
     or v_alert_id_different = v_alert_id_1
     or not exists (
       select 1
       from flashcard_integrity.alert_outbox outbox
       where outbox.alert_id = v_alert_id_different
     ) then
    raise exception 'A materially different conflict was incorrectly coalesced.';
  end if;

  -- Non-target warnings preserve the original one-call/one-alert behavior.
  v_non_target_alert_1 := flashcard_integrity.record_alert(
    v_student_id, 'edmundFlashcardProgress', 'warning',
    'verification_non_target_warning', pg_catalog.gen_random_uuid(),
    '{}'::jsonb, '{}'::jsonb, 'verification_only', 'acceptance_test'
  );
  v_non_target_alert_2 := flashcard_integrity.record_alert(
    v_student_id, 'edmundFlashcardProgress', 'warning',
    'verification_non_target_warning', pg_catalog.gen_random_uuid(),
    '{}'::jsonb, '{}'::jsonb, 'verification_only', 'acceptance_test'
  );
  if v_non_target_alert_1 = v_non_target_alert_2 then
    raise exception 'A non-target warning was unexpectedly deduplicated.';
  end if;

  -- Emulate delivery by the separately authenticated external consumer.  The
  -- containment migration itself never writes delivered_at and never resolves alerts.
  update flashcard_integrity.alert_outbox
  set delivered_at = pg_catalog.clock_timestamp(),
      attempts = 1
  where alert_id = v_alert_id_1
    and delivered_at is null;

  -- A recurrence after external delivery stays on the canonical alert but must create
  -- one new pending outbox row, preventing a false-recovery watchdog run.
  v_receipt_after_delivery := flashcard_integrity.write_state_v2(
    v_student_id,
    'acceptance_test',
    'conflict-containment-verification',
    'edmundFlashcardProgress',
    '{"safe":false,"score":2}'::jsonb,
    v_request_after_delivery,
    0
  );
  v_alert_id_after_delivery :=
    (v_receipt_after_delivery ->> 'alertId')::bigint;
  select pg_catalog.count(*) into v_count
  from flashcard_integrity.alert_outbox outbox
  where outbox.alert_id = v_alert_id_1;
  if v_receipt_after_delivery ->> 'status' <> 'conflict'
     or v_alert_id_after_delivery is distinct from v_alert_id_1
     or v_count <> 2
     or (select pg_catalog.count(*)
         from flashcard_integrity.alert_outbox outbox
         where outbox.alert_id = v_alert_id_1
           and outbox.delivered_at is null) <> 1
     or not exists (
       select 1
       from flashcard_integrity.alerts alert
       where alert.alert_id = v_alert_id_1
         and alert.occurrence_count = 3
         and alert.last_request_id = v_request_after_delivery
         and alert.resolved_at is null
     )
     or not exists (
       select 1
       from flashcard_integrity.write_receipts receipt
       where receipt.student_id = v_student_id
         and receipt.request_id = v_request_after_delivery
         and receipt.outcome = 'conflict'
         and receipt.alert_id = v_alert_id_1
     ) then
    raise exception 'Post-delivery recurrence did not preserve alert dedup and fresh pending evidence.';
  end if;

  if exists (
       select 1
       from public.flashcard_student_state state
       where state.student_id = v_student_id
         and state.key = 'edmundFlashcardProgress'
         and (
           state.value is distinct from v_baseline_value
           or state.version is distinct from v_baseline_version
           or state.value_checksum is distinct from v_baseline_checksum
         )
     ) then
    raise exception 'Containment changed student state.';
  end if;

  select pg_catalog.count(*) into v_count
  from flashcard_integrity.state_revisions revision
  where revision.student_id = v_student_id
    and revision.state_key = 'edmundFlashcardProgress';
  if v_count <> v_baseline_revisions then
    raise exception 'Containment changed revision history.';
  end if;

  raise notice 'Flashcard conflict-alert containment verification PASSED; rolling back.';
end;
$verification$;

rollback;
