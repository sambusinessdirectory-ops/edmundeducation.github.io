-- Flashcard integrity phase 1 / stage 05 of 14: dark-launched v2 RPCs.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

create or replace function flashcard_integrity.build_receipt(
  p_request_id uuid,
  p_actor_kind text,
  p_state_key text,
  p_status text,
  p_code text,
  p_expected_version bigint,
  p_resulting_version bigint,
  p_resulting_checksum text,
  p_alert_id bigint,
  p_created_at timestamptz
)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select pg_catalog.jsonb_strip_nulls(pg_catalog.jsonb_build_object(
    'requestId', p_request_id,
    'actorKind', p_actor_kind,
    'key', p_state_key,
    'status', p_status,
    'code', p_code,
    'expectedVersion', p_expected_version,
    'resultingVersion', p_resulting_version,
    'resultingChecksum', p_resulting_checksum,
    'alertId', p_alert_id,
    'serverTime', p_created_at
  ));
$$;

create or replace function flashcard_integrity.write_state_v2(
  p_student_id uuid,
  p_actor_kind text,
  p_session_fingerprint text,
  p_state_key text,
  p_value jsonb,
  p_request_id uuid,
  p_expected_version bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payload_checksum text;
  v_existing_receipt flashcard_integrity.write_receipts%rowtype;
  v_state public.flashcard_student_state%rowtype;
  v_validation text;
  v_alert_id bigint;
  v_status text;
  v_code text;
  v_result_version bigint := 0;
  v_result_checksum text;
  v_previous_checksum text;
  v_receipt jsonb;
  v_created_at timestamptz := pg_catalog.clock_timestamp();
  v_current_metrics jsonb := '{}'::jsonb;
  v_state_found boolean := false;
  v_error text;
  v_error_state text;
  v_guard_rejection_code text;
begin
  if p_student_id is null
     or p_request_id is null
     or nullif(pg_catalog.btrim(coalesce(p_state_key, '')), '') is null
     or p_expected_version is null
     or p_expected_version < 0 then
    return flashcard_integrity.build_receipt(
      p_request_id,
      p_actor_kind,
      p_state_key,
      'rejected',
      'invalid_request',
      coalesce(p_expected_version, -1),
      0,
      null,
      null,
      v_created_at
    );
  end if;

  v_payload_checksum := case
    when p_value is null then flashcard_integrity.jsonb_checksum('null'::jsonb)
    else flashcard_integrity.jsonb_checksum(p_value)
  end;

  -- Lock request identity first, then state identity, in one global order. The request
  -- lock closes the check-then-insert race on (student_id, request_id); the key lock
  -- covers the first-row insert race and ordinary updates. Hash collisions can only
  -- serialize unrelated work, not weaken correctness.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'request:' || p_student_id::text || ':' || p_request_id::text,
      0
    )
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('state:' || p_student_id::text || ':' || p_state_key, 0)
  );

  select * into v_existing_receipt
  from flashcard_integrity.write_receipts
  where student_id = p_student_id
    and request_id = p_request_id;

  if found then
    if v_existing_receipt.state_key = p_state_key
       and v_existing_receipt.payload_checksum = v_payload_checksum
       and v_existing_receipt.expected_version = p_expected_version
       and v_existing_receipt.actor_kind = p_actor_kind then
      return v_existing_receipt.canonical_receipt;
    end if;

    v_alert_id := flashcard_integrity.record_alert(
      p_student_id,
      p_state_key,
      'critical',
      'request_id_reused_with_different_payload',
      p_request_id,
      '{}'::jsonb,
      pg_catalog.jsonb_build_object(
        'originalKey', v_existing_receipt.state_key,
        'originalChecksum', v_existing_receipt.payload_checksum,
        'incomingChecksum', v_payload_checksum
      ),
      'rejected',
      p_actor_kind
    );
    return flashcard_integrity.build_receipt(
      p_request_id,
      p_actor_kind,
      p_state_key,
      'rejected',
      'request_id_reuse',
      p_expected_version,
      v_existing_receipt.resulting_version,
      v_existing_receipt.resulting_checksum,
      v_alert_id,
      v_created_at
    );
  end if;

  select * into v_state
  from public.flashcard_student_state
  where student_id = p_student_id
    and key = p_state_key
  for update;
  v_state_found := found;

  if v_state_found then
    v_result_version := v_state.version;
    v_result_checksum := v_state.value_checksum;
    v_previous_checksum := v_state.value_checksum;
    v_current_metrics := flashcard_integrity.state_metrics(v_state.key, v_state.value);
  else
    v_result_version := 0;
    v_result_checksum := null;
  end if;

  v_validation := flashcard_integrity.validate_state_payload(p_state_key, p_value, true);
  if v_validation is not null then
    v_alert_id := flashcard_integrity.record_alert(
      p_student_id,
      p_state_key,
      'critical',
      v_validation,
      p_request_id,
      '{}'::jsonb,
      flashcard_integrity.state_metrics(p_state_key, p_value),
      'rejected',
      p_actor_kind
    );
    v_status := 'rejected';
    v_code := v_validation;
  else
    if p_expected_version <> v_result_version then
      v_alert_id := flashcard_integrity.record_alert(
        p_student_id,
        p_state_key,
        'warning',
        'optimistic_version_conflict',
        p_request_id,
        v_current_metrics,
        flashcard_integrity.state_metrics(p_state_key, p_value),
        'rejected_for_reload',
        p_actor_kind
      );
      v_status := 'conflict';
      v_code := 'version_conflict';
    elsif v_state_found and v_state.value is not distinct from p_value then
      v_status := 'noop';
      v_code := 'already_current';
    else
      begin
        perform pg_catalog.set_config('flashcard_integrity.request_id', p_request_id::text, true);
        perform pg_catalog.set_config('flashcard_integrity.actor_kind', p_actor_kind, true);
        perform pg_catalog.set_config(
          'flashcard_integrity.session_fingerprint',
          coalesce(p_session_fingerprint, ''),
          true
        );

        if v_state_found then
          update public.flashcard_student_state
          set value = p_value
          where student_id = p_student_id
            and key = p_state_key;
        else
          insert into public.flashcard_student_state (student_id, key, value)
          values (p_student_id, p_state_key, p_value);
        end if;

        select * into v_state
        from public.flashcard_student_state
        where student_id = p_student_id
          and key = p_state_key;

        if found then
          v_result_version := v_state.version;
          v_result_checksum := v_state.value_checksum;
        else
          v_result_version := 0;
          v_result_checksum := null;
        end if;

        -- The protection trigger uses a soft, fail-closed rejection: it inserts a
        -- durable alert/outbox row and returns NULL so PostgreSQL skips the bad row.
        -- Detect that alert before classifying an unchanged row as a harmless no-op.
        select alert.alert_id, alert.code
        into v_alert_id, v_guard_rejection_code
        from flashcard_integrity.alerts alert
        where alert.student_id = p_student_id
          and alert.state_key = p_state_key
          and alert.request_id = p_request_id
          and alert.action_taken = 'rejected_and_preserved'
        order by alert.alert_id desc
        limit 1;

        if found then
          v_status := 'rejected';
          v_code := v_guard_rejection_code;
        else
          v_status := case
            when v_previous_checksum is not null
                 and v_state.value_checksum = v_previous_checksum
              then 'noop'
            else 'accepted'
          end;
          v_code := case
            when p_state_key = 'edmundFlashcardAttempts'
                 and v_state.value_checksum <> v_payload_checksum
              then 'lossless_server_merge'
            when v_status = 'noop'
              then 'already_preserved_by_server'
            else 'saved'
          end;
        end if;
      exception
        when others then
          get stacked diagnostics
            v_error_state = returned_sqlstate,
            v_error = message_text;

          -- Trigger-side inserts are rolled back with the rejected subtransaction.
          -- Record a fresh alert after catching the exception, then return a normal
          -- rejection receipt so both records commit durably.
          v_alert_id := flashcard_integrity.record_alert(
            p_student_id,
            p_state_key,
            'critical',
            'state_guard_rejected_write',
            p_request_id,
            v_current_metrics,
            flashcard_integrity.state_metrics(p_state_key, p_value)
              || pg_catalog.jsonb_build_object(
                'sqlstate', v_error_state,
                'error', pg_catalog.left(v_error, 500)
              ),
            'rejected_and_preserved',
            p_actor_kind
          );
          v_status := 'rejected';
          v_code := 'state_guard_rejected_write';
      end;
    end if;
  end if;

  v_receipt := flashcard_integrity.build_receipt(
    p_request_id,
    p_actor_kind,
    p_state_key,
    v_status,
    v_code,
    p_expected_version,
    v_result_version,
    v_result_checksum,
    v_alert_id,
    v_created_at
  );

  -- Never copy a potentially multi-megabyte canonical state into every receipt. The
  -- version/checksum form a stable reference; the client reloads through the v2 GET.
  if v_status in ('conflict', 'rejected')
     or v_code = 'lossless_server_merge' then
    v_receipt := v_receipt || pg_catalog.jsonb_build_object(
      'reloadRequired', true
    );
  end if;

  insert into flashcard_integrity.write_receipts (
    student_id,
    request_id,
    actor_kind,
    state_key,
    payload_checksum,
    expected_version,
    outcome,
    resulting_version,
    resulting_checksum,
    alert_id,
    canonical_receipt,
    created_at
  )
  values (
    p_student_id,
    p_request_id,
    p_actor_kind,
    p_state_key,
    v_payload_checksum,
    p_expected_version,
    v_status,
    v_result_version,
    v_result_checksum,
    v_alert_id,
    v_receipt,
    v_created_at
  );

  return v_receipt;
end;
$$;

create or replace function public.flashcard_student_get_state_v2(p_token uuid)
returns table (
  key text,
  value jsonb,
  version bigint,
  value_checksum text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then
    return;
  end if;

  return query
  select state.key, state.value, state.version, state.value_checksum, state.updated_at
  from public.flashcard_student_state state
  join flashcard_integrity.state_key_rules rules
    on rules.state_key = state.key
   and rules.enabled
   and rules.v2_writable
  where state.student_id = v_student_id
  order by state.key;
end;
$$;

create or replace function public.flashcard_student_upsert_state_v2(
  p_token uuid,
  p_key text,
  p_value jsonb,
  p_request_id uuid,
  p_expected_version bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
  v_fingerprint text;
begin
  if v_student_id is null then
    return flashcard_integrity.build_receipt(
      p_request_id,
      'student',
      p_key,
      'rejected',
      'invalid_or_expired_session',
      coalesce(p_expected_version, -1),
      0,
      null,
      null,
      pg_catalog.clock_timestamp()
    );
  end if;

  v_fingerprint := pg_catalog.encode(
    extensions.digest(pg_catalog.convert_to(p_token::text, 'UTF8'), 'sha256'),
    'hex'
  );

  return flashcard_integrity.write_state_v2(
    v_student_id,
    'student',
    v_fingerprint,
    pg_catalog.btrim(p_key),
    p_value,
    p_request_id,
    p_expected_version
  );
end;
$$;

create or replace function public.flashcard_admin_get_student_state_v2(
  p_admin_name text,
  p_admin_password text,
  p_student_name text
)
returns table (
  key text,
  value jsonb,
  version bigint,
  value_checksum text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return;
  end if;

  select student.id into v_student_id
  from public.flashcard_students student
  where student.name = pg_catalog.btrim(p_student_name)
    and student.deleted_at is null
  limit 1;

  if v_student_id is null then
    return;
  end if;

  return query
  select state.key, state.value, state.version, state.value_checksum, state.updated_at
  from public.flashcard_student_state state
  join flashcard_integrity.state_key_rules rules
    on rules.state_key = state.key
   and rules.enabled
   and rules.v2_writable
  where state.student_id = v_student_id
  order by state.key;
end;
$$;

create or replace function public.flashcard_admin_upsert_student_state_v2(
  p_admin_name text,
  p_admin_password text,
  p_student_name text,
  p_key text,
  p_value jsonb,
  p_request_id uuid,
  p_expected_version bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return flashcard_integrity.build_receipt(
      p_request_id,
      'admin',
      p_key,
      'rejected',
      'invalid_admin_credentials',
      coalesce(p_expected_version, -1),
      0,
      null,
      null,
      pg_catalog.clock_timestamp()
    );
  end if;

  select student.id into v_student_id
  from public.flashcard_students student
  where student.name = pg_catalog.btrim(p_student_name)
    and student.deleted_at is null
  limit 1;

  if v_student_id is null then
    return flashcard_integrity.build_receipt(
      p_request_id,
      'admin',
      p_key,
      'rejected',
      'student_not_found',
      coalesce(p_expected_version, -1),
      0,
      null,
      null,
      pg_catalog.clock_timestamp()
    );
  end if;

  return flashcard_integrity.write_state_v2(
    v_student_id,
    'admin',
    null,
    pg_catalog.btrim(p_key),
    p_value,
    p_request_id,
    p_expected_version
  );
end;
$$;

-- Public functions receive EXECUTE by default; keep v2 dark until stage 13 grants the
-- authenticated role after every invariant, trigger, and catch-up check is complete.
revoke all on function public.flashcard_student_get_state_v2(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_student_upsert_state_v2(uuid, text, jsonb, uuid, bigint)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_get_student_state_v2(text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_upsert_student_state_v2(text, text, text, text, jsonb, uuid, bigint)
  from public, anon, authenticated, service_role;

commit;
