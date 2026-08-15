-- Flashcard integrity phase 1 / stage 04 of 14: state protection routines.
-- The full trigger functions are defined now but not attached until stage 11, after
-- the initial audit/attempt backfill. The lightweight stage-01 metadata guard remains.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

create or replace function flashcard_integrity.validate_state_payload(
  p_state_key text,
  p_value jsonb,
  p_require_v2_writable boolean default false
)
returns text
language plpgsql
stable
set search_path = ''
as $$
declare
  v_rule flashcard_integrity.state_key_rules%rowtype;
begin
  select * into v_rule
  from flashcard_integrity.state_key_rules
  where state_key = p_state_key
    and enabled;

  if not found then
    return 'unknown_state_key';
  end if;
  if p_require_v2_writable and not v_rule.v2_writable then
    return 'state_key_not_v2_writable';
  end if;
  if p_value is null then
    return 'null_payload';
  end if;
  if pg_catalog.jsonb_typeof(p_value) <> v_rule.expected_json_type then
    return 'wrong_json_type';
  end if;
  if pg_catalog.octet_length(p_value::text) > v_rule.max_payload_bytes then
    return 'payload_too_large';
  end if;
  if p_state_key = 'edmundFlashcardAttempts'
     and exists (
       select 1
       from pg_catalog.jsonb_array_elements(p_value) entries(item)
       where pg_catalog.jsonb_typeof(item) <> 'object'
     ) then
    return 'attempt_element_not_object';
  end if;
  return null;
end;
$$;

create or replace function flashcard_integrity.protect_state_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rule flashcard_integrity.state_key_rules%rowtype;
  v_validation text;
  v_incoming jsonb;
  v_missing bigint := 0;
  v_missing_members bigint := 0;
  v_current_metrics jsonb;
  v_incoming_metrics jsonb;
  v_old_bytes bigint := 0;
  v_new_bytes bigint := 0;
  v_alert_id bigint;
  v_request_id uuid := flashcard_integrity.current_request_id();
  v_actor_kind text := flashcard_integrity.current_actor_kind();
begin
  if tg_op = 'DELETE' then
    select * into v_rule
    from flashcard_integrity.state_key_rules
    where state_key = old.key
      and enabled;

    if not found then
      v_alert_id := flashcard_integrity.record_alert(
        old.student_id,
        old.key,
        'critical',
        'unknown_state_key',
        v_request_id,
        flashcard_integrity.state_metrics(old.key, old.value),
        pg_catalog.jsonb_build_object('operation', 'delete'),
        'rejected_and_preserved',
        v_actor_kind
      );
      -- A BEFORE ROW trigger returning NULL skips this row without aborting the
      -- transaction. The protected state remains intact and the alert/outbox rows
      -- above commit durably with the caller's transaction.
      return null;
    end if;

    if not v_rule.v2_writable then
      return old;
    end if;

    v_alert_id := flashcard_integrity.record_alert(
      old.student_id,
      old.key,
      'critical',
      'state_physical_delete_blocked',
      v_request_id,
      flashcard_integrity.state_metrics(old.key, old.value),
      pg_catalog.jsonb_build_object('operation', 'delete'),
      'rejected_and_preserved',
      v_actor_kind
    );
    return null;
  end if;

  if tg_op = 'UPDATE'
     and (new.student_id is distinct from old.student_id or new.key is distinct from old.key) then
    v_alert_id := flashcard_integrity.record_alert(
      old.student_id,
      old.key,
      'critical',
      'immutable_state_identity',
      v_request_id,
      flashcard_integrity.state_metrics(old.key, old.value),
      flashcard_integrity.state_metrics(new.key, new.value)
        || pg_catalog.jsonb_build_object(
          'incomingStudentId', new.student_id,
          'incomingKey', new.key
        ),
      'rejected_and_preserved',
      v_actor_kind
    );
    return null;
  end if;

  select * into v_rule
  from flashcard_integrity.state_key_rules
  where state_key = new.key
    and enabled;

  v_validation := flashcard_integrity.validate_state_payload(new.key, new.value, false);
  if v_validation is not null then
    v_alert_id := flashcard_integrity.record_alert(
      case when tg_op = 'UPDATE' then old.student_id else new.student_id end,
      case when tg_op = 'UPDATE' then old.key else new.key end,
      'critical',
      v_validation,
      v_request_id,
      case
        when tg_op = 'UPDATE' then flashcard_integrity.state_metrics(old.key, old.value)
        else '{}'::jsonb
      end,
      flashcard_integrity.state_metrics(new.key, new.value),
      'rejected_and_preserved',
      v_actor_kind
    );
    return null;
  end if;

  if new.key = 'edmundFlashcardAttempts' then
    v_incoming := new.value;
    if tg_op = 'UPDATE' then
      v_missing := flashcard_integrity.missing_attempt_count(old.value, v_incoming);
      new.value := flashcard_integrity.merge_attempt_arrays(old.value, v_incoming);
      if v_missing > 0 then
        v_alert_id := flashcard_integrity.record_alert(
          new.student_id,
          new.key,
          case when v_missing >= 10 then 'critical' else 'warning' end,
          'stale_attempt_snapshot_merged',
          v_request_id,
          flashcard_integrity.state_metrics(old.key, old.value),
          flashcard_integrity.state_metrics(new.key, v_incoming),
          'lossless_merge',
          v_actor_kind
        );
      end if;
    else
      new.value := flashcard_integrity.merge_attempt_arrays('[]'::jsonb, v_incoming);
    end if;

    if pg_catalog.octet_length(new.value::text) > v_rule.max_payload_bytes then
      v_alert_id := flashcard_integrity.record_alert(
        new.student_id,
        new.key,
        'critical',
        'payload_too_large_after_merge',
        v_request_id,
        case
          when tg_op = 'UPDATE' then flashcard_integrity.state_metrics(old.key, old.value)
          else '{}'::jsonb
        end,
        flashcard_integrity.state_metrics(new.key, new.value),
        'rejected_and_preserved',
        v_actor_kind
      );
      return null;
    end if;

    -- Keep normalization and the final size check in a subtransaction. If canonical
    -- rebuilding ever exceeds the quota, the internal PFC01 exception rolls back only
    -- the attempted normalized-record mutations; the outer handler then records a
    -- durable rejection and skips the public row write.
    begin
      perform flashcard_integrity.sync_attempt_records(
        new.student_id,
        new.value,
        v_request_id,
        v_actor_kind
      );

      -- The normalized record set is the canonical attempt source. Rebuild the JSON row
      -- from it so a prior richer record can never diverge from or be lost by the blob.
      select coalesce(
        pg_catalog.jsonb_agg(
          record.payload order by record.started_at_ms, record.attempt_id
        ),
        '[]'::jsonb
      )
      into new.value
      from flashcard_integrity.attempt_records record
      where record.student_id = new.student_id;

      if pg_catalog.octet_length(new.value::text) > v_rule.max_payload_bytes then
        raise exception using
          errcode = 'PFC01',
          message = 'payload_too_large_after_normalization';
      end if;
    exception
      when sqlstate 'PFC01' then
        v_alert_id := flashcard_integrity.record_alert(
          new.student_id,
          new.key,
          'critical',
          'payload_too_large_after_normalization',
          v_request_id,
          case
            when tg_op = 'UPDATE' then flashcard_integrity.state_metrics(old.key, old.value)
            else '{}'::jsonb
          end,
          flashcard_integrity.state_metrics(new.key, new.value),
          'rejected_and_preserved',
          v_actor_kind
        );
        return null;
    end;
  elsif found
        and v_rule.v2_writable
        and tg_op = 'UPDATE'
        and new.value is distinct from old.value then
    -- Legacy clients do not provide an expected version. Preserve their previous full
    -- value in state_revisions and raise an operational alert whenever a write removes
    -- top-level members or sharply shrinks. This is diagnostic, not a silent block:
    -- explicit user deletes/resets remain possible and are distinguishable in audit.
    v_current_metrics := flashcard_integrity.state_metrics(old.key, old.value);
    v_incoming_metrics := flashcard_integrity.state_metrics(new.key, new.value);
    v_missing_members := flashcard_integrity.missing_top_level_member_count(old.value, new.value);
    v_old_bytes := coalesce((v_current_metrics ->> 'bytes')::bigint, 0);
    v_new_bytes := coalesce((v_incoming_metrics ->> 'bytes')::bigint, 0);

    if v_missing_members > 0
       or (v_old_bytes >= 2048 and v_new_bytes * 2 < v_old_bytes) then
      v_alert_id := flashcard_integrity.record_alert(
        new.student_id,
        new.key,
        case
          when v_missing_members >= 5 or (v_old_bytes >= 8192 and v_new_bytes * 4 < v_old_bytes)
            then 'critical'
          else 'warning'
        end,
        'state_regression_archived',
        v_request_id,
        v_current_metrics || pg_catalog.jsonb_build_object('missingTopLevelMembers', 0),
        v_incoming_metrics || pg_catalog.jsonb_build_object(
          'missingTopLevelMembers', v_missing_members
        ),
        'accepted_with_revision_backup',
        v_actor_kind
      );
    end if;
  end if;

  if tg_op = 'INSERT' then
    new.version := greatest(coalesce(new.version, 1), 1);
  elsif new.value is distinct from old.value then
    new.version := old.version + 1;
  else
    new.version := old.version;
  end if;

  new.value_checksum := flashcard_integrity.jsonb_checksum(new.value);
  return new;
end;
$$;

create or replace function flashcard_integrity.capture_state_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_key text := case when tg_op = 'DELETE' then old.key else new.key end;
  v_is_attempts boolean := v_key = 'edmundFlashcardAttempts';
  v_audit_enabled boolean := false;
begin
  select coalesce(rules.v2_writable and rules.enabled, false)
  into v_audit_enabled
  from flashcard_integrity.state_key_rules rules
  where rules.state_key = v_key;

  if not coalesce(v_audit_enabled, false) then
    return case when tg_op = 'DELETE' then old else new end;
  end if;

  if tg_op = 'UPDATE'
     and new.value is not distinct from old.value
     and new.version = old.version then
    return new;
  end if;

  insert into flashcard_integrity.state_revisions (
    student_id,
    state_key,
    version_before,
    version_after,
    change_kind,
    before_value,
    after_value,
    before_checksum,
    after_checksum,
    before_metrics,
    after_metrics,
    request_id,
    actor_kind,
    session_fingerprint
  )
  values (
    case when tg_op = 'DELETE' then old.student_id else new.student_id end,
    v_key,
    case when tg_op = 'INSERT' then null else old.version end,
    case when tg_op = 'DELETE' then null else new.version end,
    pg_catalog.lower(tg_op),
    case when tg_op = 'INSERT' or v_is_attempts then null else old.value end,
    case when tg_op = 'DELETE' or v_is_attempts then null else new.value end,
    case when tg_op = 'INSERT' then null else old.value_checksum end,
    case when tg_op = 'DELETE' then null else new.value_checksum end,
    case when tg_op = 'INSERT' then '{}'::jsonb else flashcard_integrity.state_metrics(old.key, old.value) end,
    case when tg_op = 'DELETE' then '{}'::jsonb else flashcard_integrity.state_metrics(new.key, new.value) end,
    flashcard_integrity.current_request_id(),
    flashcard_integrity.current_actor_kind(),
    flashcard_integrity.current_session_fingerprint()
  )
  on conflict (student_id, state_key, version_after) where version_after is not null
  do nothing;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;
-- Account removal is a separate operation from a student's ordinary state write. A
-- hard delete can cascade through every state/session/log row, so phase 1 prohibits it
-- at the parent table as well. Existing soft-delete administration remains available.
create or replace function flashcard_integrity.protect_student_hard_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_alert_id bigint;
begin
  v_alert_id := flashcard_integrity.record_alert(
    old.id,
    null,
    'critical',
    'student_hard_delete_blocked',
    flashcard_integrity.current_request_id(),
    pg_catalog.jsonb_build_object('studentExists', true),
    pg_catalog.jsonb_build_object('operation', 'delete'),
    'rejected_and_preserved',
    flashcard_integrity.current_actor_kind()
  );
  return null;
end;
$$;

commit;
