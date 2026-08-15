-- Flashcard integrity phase 1 / stage 11 of 14: atomic trigger cut-over.
-- Initial integrity data has already been backfilled. This short transaction swaps the
-- online metadata guard for protection+audit; a lock timeout leaves the old guard live.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '30s';

-- Hold one brief writer-blocking lock while the final live-key inventory is registered
-- and the rejecting trigger is installed. This closes the otherwise possible gap in
-- which an old client could create a new shared key after the earlier inventory.
lock table public.flashcard_student_state in share row exclusive mode;

do $$
begin
  if exists (
    select state.key
    from public.flashcard_student_state state
    left join flashcard_integrity.state_key_rules rules on rules.state_key = state.key
    where rules.state_key is null
    group by state.key
    having pg_catalog.count(distinct pg_catalog.jsonb_typeof(state.value)) <> 1
       or pg_catalog.min(pg_catalog.jsonb_typeof(state.value)) not in (
         'array', 'object', 'string', 'number', 'boolean'
       )
       or pg_catalog.max(pg_catalog.octet_length(state.value::text)) > 33554432
  ) then
    raise exception using
      errcode = '22023',
      message = 'Unregistered live state keys have inconsistent/unsupported types or exceed 32 MiB; inventory them explicitly before cut-over.';
  end if;
end;
$$;

-- Grandfather every genuinely pre-existing consumer with its observed type and a
-- bounded headroom limit. It remains unavailable through Flashcard v2. After the
-- trigger is installed, entirely new unregistered keys are rejected.
insert into flashcard_integrity.state_key_rules (
  state_key,
  expected_json_type,
  max_payload_bytes,
  write_strategy,
  v2_writable,
  enabled,
  description,
  updated_at
)
select
  state.key,
  pg_catalog.min(pg_catalog.jsonb_typeof(state.value)),
  least(
    33554432::bigint,
    greatest(
      65536::bigint,
      pg_catalog.max(pg_catalog.octet_length(state.value::text))::bigint * 2
    )
  )::integer,
  'versioned_replace',
  false,
  true,
  'Auto-registered live shared consumer during integrity cut-over; review ownership before enabling v2.',
  now()
from public.flashcard_student_state state
left join flashcard_integrity.state_key_rules rules on rules.state_key = state.key
where rules.state_key is null
group by state.key
on conflict (state_key) do nothing;

do $$
begin
  if exists (
    select 1
    from public.flashcard_student_state state
    left join flashcard_integrity.state_key_rules rules on rules.state_key = state.key
    where rules.state_key is null
       or not rules.enabled
       or pg_catalog.jsonb_typeof(state.value) <> rules.expected_json_type
       or pg_catalog.octet_length(state.value::text) > rules.max_payload_bytes
  ) then
    raise exception 'Final state-key registry/type/size validation failed; trigger cut-over rolled back.';
  end if;
end;
$$;

-- Legacy RPCs remain available during the rollout, so they must not claim success
-- when the protection trigger deliberately skips a rejected row. ROW_COUNT is zero
-- after a BEFORE ROW trigger returns NULL; expose that fact as `false` to old clients.
create or replace function public.flashcard_admin_upsert_student_state(
  p_admin_name text,
  p_admin_password text,
  p_student_name text,
  p_key text,
  p_value jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_key text := pg_catalog.btrim(coalesce(p_key, ''));
  v_value jsonb;
  v_affected bigint := 0;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return false;
  end if;

  select student.id into v_student_id
  from public.flashcard_students student
  where student.name = pg_catalog.btrim(p_student_name)
    and student.deleted_at is null
  limit 1;

  if v_student_id is null or v_key = '' then
    return false;
  end if;

  v_value := case
    when v_key = 'edmundFlashcardAttempts'
      then case
        when pg_catalog.jsonb_typeof(p_value) = 'array' then p_value
        else '[]'::jsonb
      end
    else coalesce(p_value, '{}'::jsonb)
  end;

  perform pg_catalog.set_config('flashcard_integrity.actor_kind', 'legacy_admin', true);
  insert into public.flashcard_student_state as state (student_id, key, value)
  values (v_student_id, v_key, v_value)
  on conflict (student_id, key) do update
  set value = case
        when excluded.key = 'edmundFlashcardAttempts'
          then public.flashcard_merge_attempt_arrays(state.value, excluded.value)
        else excluded.value
      end,
      updated_at = now();
  get diagnostics v_affected = row_count;

  return v_affected > 0;
end;
$$;

create or replace function public.flashcard_student_upsert_state(
  p_token uuid,
  p_key text,
  p_value jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
  v_key text := pg_catalog.btrim(coalesce(p_key, ''));
  v_value jsonb;
  v_affected bigint := 0;
begin
  if v_student_id is null or v_key = '' then
    return false;
  end if;

  v_value := case
    when v_key = 'edmundFlashcardAttempts'
      then case
        when pg_catalog.jsonb_typeof(p_value) = 'array' then p_value
        else '[]'::jsonb
      end
    else coalesce(p_value, '{}'::jsonb)
  end;

  perform pg_catalog.set_config('flashcard_integrity.actor_kind', 'legacy_student', true);
  perform pg_catalog.set_config(
    'flashcard_integrity.session_fingerprint',
    pg_catalog.encode(
      extensions.digest(pg_catalog.convert_to(p_token::text, 'UTF8'), 'sha256'),
      'hex'
    ),
    true
  );
  insert into public.flashcard_student_state as state (student_id, key, value)
  values (v_student_id, v_key, v_value)
  on conflict (student_id, key) do update
  set value = case
        when excluded.key = 'edmundFlashcardAttempts'
          then public.flashcard_merge_attempt_arrays(state.value, excluded.value)
        else excluded.value
      end,
      updated_at = now();
  get diagnostics v_affected = row_count;

  return v_affected > 0;
end;
$$;

create or replace function public.flashcard_student_delete_state(
  p_token uuid,
  p_key text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
  v_affected bigint := 0;
begin
  if v_student_id is null then
    return false;
  end if;

  perform pg_catalog.set_config('flashcard_integrity.actor_kind', 'legacy_student', true);
  delete from public.flashcard_student_state state
  where state.student_id = v_student_id
    and state.key = pg_catalog.btrim(p_key);
  get diagnostics v_affected = row_count;

  return v_affected > 0;
end;
$$;

-- The previous hard-delete RPC removed child rows before attempting to remove the
-- parent. A soft-rejecting parent trigger would otherwise let those child deletions
-- commit. Replace the RPC atomically with an up-front denial; administrators retain
-- the separate soft-delete RPC, and no partial destructive work is attempted here.
create or replace function public.flashcard_admin_delete_student_with_state(
  p_admin_name text,
  p_admin_password text,
  p_student_name text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_alert_id bigint;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return false;
  end if;

  select student.id into v_student_id
  from public.flashcard_students student
  where student.name = pg_catalog.btrim(p_student_name)
  limit 1;

  if v_student_id is null then
    return true;
  end if;

  v_alert_id := flashcard_integrity.record_alert(
    v_student_id,
    null,
    'critical',
    'legacy_hard_delete_request_blocked',
    null,
    pg_catalog.jsonb_build_object('studentExists', true),
    pg_catalog.jsonb_build_object('operation', 'hard_delete_with_state'),
    'rejected_and_preserved',
    'legacy_admin'
  );
  return false;
end;
$$;

drop trigger if exists flashcard_state_metadata_guard on public.flashcard_student_state;
drop trigger if exists flashcard_state_zz_integrity_protect on public.flashcard_student_state;
create trigger flashcard_state_zz_integrity_protect
before insert or update or delete on public.flashcard_student_state
for each row
execute function flashcard_integrity.protect_state_write();

drop trigger if exists flashcard_state_revision_audit on public.flashcard_student_state;
create trigger flashcard_state_revision_audit
after insert or update or delete on public.flashcard_student_state
for each row
execute function flashcard_integrity.capture_state_revision();
drop trigger if exists flashcard_student_hard_delete_protected on public.flashcard_students;
create trigger flashcard_student_hard_delete_protected
before delete on public.flashcard_students
for each row
execute function flashcard_integrity.protect_student_hard_delete();
drop trigger if exists flashcard_integrity_state_revisions_immutable on flashcard_integrity.state_revisions;
create trigger flashcard_integrity_state_revisions_immutable
before update or delete on flashcard_integrity.state_revisions
for each row execute function flashcard_integrity.reject_audit_mutation();

drop trigger if exists flashcard_integrity_receipts_immutable on flashcard_integrity.write_receipts;
create trigger flashcard_integrity_receipts_immutable
before update or delete on flashcard_integrity.write_receipts
for each row execute function flashcard_integrity.reject_audit_mutation();

drop trigger if exists flashcard_integrity_attempt_mutations_immutable on flashcard_integrity.attempt_mutations;
create trigger flashcard_integrity_attempt_mutations_immutable
before update or delete on flashcard_integrity.attempt_mutations
for each row execute function flashcard_integrity.reject_audit_mutation();

drop trigger if exists flashcard_integrity_snapshots_immutable on flashcard_integrity.student_snapshots;
create trigger flashcard_integrity_snapshots_immutable
before update or delete on flashcard_integrity.student_snapshots
for each row execute function flashcard_integrity.reject_audit_mutation();


commit;
