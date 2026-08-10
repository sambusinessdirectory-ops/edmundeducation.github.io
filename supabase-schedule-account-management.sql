-- EdmundEducation Schedule account management and batch-status migration.
--
-- Apply after:
--   1. supabase-shared-student-accounts.sql
--   2. supabase-schedule-system.sql
--
-- Security properties:
--   * Stored passwords remain one-way bcrypt hashes and are never returned.
--   * Schedule administrators authenticate with their random, expiring token.
--   * Student password changes require both the current password and a valid
--     student session; every previous session is revoked atomically.
--   * Batch status changes lock every selected row and reject stale clients.

begin;

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if to_regclass('public.flashcard_students') is null
    or to_regclass('public.flashcard_student_sessions') is null
    or to_regclass('public.flashcard_student_password_logs') is null
    or to_regclass('public.schedule_admin_accounts') is null
    or to_regclass('public.schedule_admin_sessions') is null
    or to_regclass('public.schedule_entries') is null
    or to_regprocedure('public._schedule_admin_id(uuid)') is null
    or to_regprocedure('public.flashcard_session_student_id(uuid)') is null
    or to_regprocedure('public.writing_sync_flashcard_student(uuid)') is null
  then
    raise exception 'Apply shared student-account and Schedule migrations first';
  end if;
end;
$$;

create or replace function public.shared_student_change_password(
  p_token uuid,
  p_current_password text,
  p_new_password text
)
returns table (
  session_token uuid,
  id uuid,
  name text,
  access jsonb,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student public.flashcard_students%rowtype;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_token uuid := gen_random_uuid();
  v_expires_at timestamptz := v_now + interval '30 days';
begin
  if p_token is null
    or p_current_password is null
    or pg_catalog.char_length(p_current_password) not between 1 and 200
    or p_new_password is null
    or pg_catalog.char_length(p_new_password) not between 8 and 200
    or p_new_password ~ '[[:cntrl:]]'
  then
    raise exception 'Password must contain 8 to 200 visible characters'
      using errcode = '22023';
  end if;

  select student.*
  into v_student
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id = session_row.student_id
  where session_row.token = p_token
    and session_row.expires_at > v_now
    and student.deleted_at is null
  limit 1
  for update of student;

  if not found
    or v_student.password_hash <> extensions.crypt(p_current_password, v_student.password_hash)
  then
    raise exception 'Current password is incorrect or the session has expired'
      using errcode = '28000';
  end if;
  if v_student.password_hash = extensions.crypt(p_new_password, v_student.password_hash) then
    raise exception 'New password must be different from the current password'
      using errcode = '22023';
  end if;

  update public.flashcard_students student
  set password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf', 12)),
      updated_at = v_now
  where student.id = v_student.id;

  perform public.writing_sync_flashcard_student(v_student.id);

  delete from public.flashcard_student_sessions session_row
  where session_row.student_id = v_student.id;
  insert into public.flashcard_student_sessions (token, student_id, created_at, expires_at)
  values (v_token, v_student.id, v_now, v_expires_at);

  insert into public.flashcard_student_password_logs (student_id, student_name, changed_by)
  values (v_student.id, v_student.name, v_student.name || ' (self)');

  return query
  select v_token, student.id, student.name, student.access, v_expires_at
  from public.flashcard_students student
  where student.id = v_student.id;
end;
$$;

create or replace function public.schedule_admin_change_own_password(
  p_admin_token uuid,
  p_current_password text,
  p_new_password text
)
returns table (admin_token uuid, name text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin public.schedule_admin_accounts%rowtype;
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_token uuid := gen_random_uuid();
  v_expires_at timestamptz := v_now + interval '8 hours';
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if p_current_password is null
    or pg_catalog.char_length(p_current_password) not between 1 and 200
    or p_new_password is null
    or pg_catalog.char_length(p_new_password) not between 8 and 200
    or p_new_password ~ '[[:cntrl:]]'
  then
    raise exception 'Password must contain 8 to 200 visible characters'
      using errcode = '22023';
  end if;

  select account.* into v_admin
  from public.schedule_admin_accounts account
  where account.id = v_admin_id
  for update;

  if v_admin.password_hash <> extensions.crypt(p_current_password, v_admin.password_hash) then
    raise exception 'Current password is incorrect' using errcode = '28000';
  end if;
  if v_admin.password_hash = extensions.crypt(p_new_password, v_admin.password_hash) then
    raise exception 'New password must be different from the current password'
      using errcode = '22023';
  end if;

  update public.schedule_admin_accounts account
  set password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf', 12)),
      updated_at = v_now
  where account.id = v_admin.id;

  -- Revoke every existing session before returning one fresh token. The base
  -- Schedule schema deliberately keeps account/session tables private, but it
  -- does not install a password-change trigger for administrator accounts.
  delete from public.schedule_admin_sessions session_row
  where session_row.admin_id = v_admin.id;
  insert into public.schedule_admin_sessions (token_hash, admin_id, created_at, expires_at)
  values (extensions.digest(v_token::text, 'sha256'), v_admin.id, v_now, v_expires_at);

  return query select v_token, v_admin.name, v_expires_at;
end;
$$;

create or replace function public.schedule_admin_upsert_student_account(
  p_admin_token uuid,
  p_student_name text,
  p_student_password text,
  p_access jsonb default '{}'::jsonb
)
returns table (id uuid, name text, access jsonb, created_at timestamptz, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_name text := pg_catalog.btrim(coalesce(p_student_name, ''));
  v_student_id uuid;
  v_deleted_at timestamptz;
  v_sort_order integer;
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if pg_catalog.char_length(v_name) not between 1 and 100
    or v_name ~ '[[:cntrl:]]'
    or p_student_password is null
    or pg_catalog.char_length(p_student_password) not between 8 and 200
    or p_student_password ~ '[[:cntrl:]]'
    or p_access is null
    or pg_catalog.jsonb_typeof(p_access) <> 'object'
  then
    raise exception 'A valid name, password and access object are required'
      using errcode = '22023';
  end if;

  select student.id, student.deleted_at into v_student_id, v_deleted_at
  from public.flashcard_students student
  where pg_catalog.lower(student.name) = pg_catalog.lower(v_name)
  limit 1
  for update;

  if v_student_id is null then
    select coalesce(pg_catalog.max(student.sort_order), 0) + 1
    into v_sort_order
    from public.flashcard_students student
    where student.deleted_at is null;

    insert into public.flashcard_students (
      name, password_hash, access, sort_order, deleted_at
    ) values (
      v_name,
      extensions.crypt(p_student_password, extensions.gen_salt('bf', 12)),
      p_access,
      v_sort_order,
      null
    ) returning flashcard_students.id into v_student_id;
  elsif v_deleted_at is null then
    raise exception 'A student account with this name already exists'
      using errcode = '23505';
  else
    update public.flashcard_students student
    set name = v_name,
        password_hash = extensions.crypt(p_student_password, extensions.gen_salt('bf', 12)),
        deleted_at = null,
        updated_at = pg_catalog.clock_timestamp()
    where student.id = v_student_id;
  end if;

  delete from public.flashcard_student_sessions session_row
  where session_row.student_id = v_student_id;
  perform public.writing_sync_flashcard_student(v_student_id);

  insert into public.flashcard_student_password_logs (student_id, student_name, changed_by)
  select student.id, student.name, 'Schedule Admin'
  from public.flashcard_students student where student.id = v_student_id;

  return query
  select student.id, student.name, student.access, student.created_at, student.updated_at
  from public.flashcard_students student
  where student.id = v_student_id;
end;
$$;

create or replace function public.schedule_admin_reset_student_password(
  p_admin_token uuid,
  p_student_id uuid,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_student_name text;
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if p_new_password is null
    or pg_catalog.char_length(p_new_password) not between 8 and 200
    or p_new_password ~ '[[:cntrl:]]'
  then
    raise exception 'Password must contain 8 to 200 visible characters'
      using errcode = '22023';
  end if;

  update public.flashcard_students student
  set password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf', 12)),
      updated_at = pg_catalog.clock_timestamp()
  where student.id = p_student_id and student.deleted_at is null
  returning student.name into v_student_name;
  if v_student_name is null then raise exception 'Student not found'; end if;

  delete from public.flashcard_student_sessions session_row
  where session_row.student_id = p_student_id;
  perform public.writing_sync_flashcard_student(p_student_id);
  insert into public.flashcard_student_password_logs (student_id, student_name, changed_by)
  values (p_student_id, v_student_name, 'Schedule Admin');
  return true;
end;
$$;

create or replace function public.schedule_admin_deactivate_student(
  p_admin_token uuid,
  p_student_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_student_name text;
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;

  update public.flashcard_students student
  set deleted_at = pg_catalog.clock_timestamp(), updated_at = pg_catalog.clock_timestamp()
  where student.id = p_student_id and student.deleted_at is null
  returning student.name into v_student_name;
  if v_student_name is null then raise exception 'Student not found'; end if;

  delete from public.flashcard_student_sessions session_row
  where session_row.student_id = p_student_id;

  -- Keep Writing records for progress history, but prevent the legacy Writing
  -- fallback login from accepting the former shared password.
  update public.writing_student_accounts account
  set password_hash = extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf', 12)),
      session_token = gen_random_uuid(),
      updated_at = pg_catalog.clock_timestamp()
  where pg_catalog.lower(account.name) = pg_catalog.lower(v_student_name);
  return true;
end;
$$;

create or replace function public._schedule_batch_set_entry_status(
  p_student_id uuid,
  p_items jsonb,
  p_status text,
  p_actor_source text,
  p_admin_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item_count integer;
  v_distinct_count integer;
  v_null_count integer;
  v_locked_count integer := 0;
  v_changed_count integer := 0;
  v_entries jsonb;
  v_row record;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if p_status not in ('none', 'completed', 'in_progress', 'more_than_half_completed', 'previous_incomplete')
    or p_actor_source not in ('student', 'admin')
    or (p_actor_source = 'student' and p_admin_id is not null)
    or (p_actor_source = 'admin' and p_admin_id is null)
  then
    raise exception 'Invalid batch-status request' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;
  if p_items is null or pg_catalog.jsonb_typeof(p_items) <> 'array'
    or pg_catalog.jsonb_array_length(p_items) not between 1 and 700
    or exists (
      select 1 from pg_catalog.jsonb_array_elements(p_items) item(value)
      where pg_catalog.jsonb_typeof(item.value) <> 'object'
    )
  then
    raise exception 'Batch request must contain 1 to 700 object entries'
      using errcode = '22023';
  end if;

  select count(*)::integer,
         count(distinct requested.entry_id)::integer,
         count(*) filter (where requested.entry_id is null or requested.expected_updated_at is null)::integer
  into v_item_count, v_distinct_count, v_null_count
  from pg_catalog.jsonb_to_recordset(p_items) requested(
    entry_id uuid, expected_updated_at timestamptz
  );
  if v_item_count <> v_distinct_count or v_null_count <> 0 then
    raise exception 'Batch request contains duplicate or incomplete entries'
      using errcode = '22023';
  end if;

  for v_row in
    select entry.*, requested.expected_updated_at as requested_updated_at
    from public.schedule_entries entry
    join pg_catalog.jsonb_to_recordset(p_items) requested(
      entry_id uuid, expected_updated_at timestamptz
    ) on requested.entry_id = entry.id
    where entry.student_id = p_student_id
    order by entry.id
    for update of entry
  loop
    v_locked_count := v_locked_count + 1;
    if v_row.updated_at <> v_row.requested_updated_at then
      raise exception 'Schedule entry changed in another session; reload and try again'
        using errcode = '40001';
    end if;
  end loop;
  if v_locked_count <> v_item_count then
    raise exception 'Schedule entry changed in another session; reload and try again'
      using errcode = '40001';
  end if;

  with requested as (
    select request.entry_id, request.expected_updated_at
    from pg_catalog.jsonb_to_recordset(p_items) request(
      entry_id uuid, expected_updated_at timestamptz
    )
  )
  update public.schedule_entries entry
  set is_completed = p_status = 'completed',
      is_in_progress = p_status = 'in_progress',
      is_more_than_half_completed = p_status = 'more_than_half_completed',
      is_previous_incomplete = p_status = 'previous_incomplete',
      completed_at = case when p_status = 'completed' then pg_catalog.clock_timestamp() else null end,
      completion_source = case when p_status = 'completed' then p_actor_source else null end,
      completed_by_admin = case when p_status = 'completed' and p_actor_source = 'admin' then p_admin_id else null end,
      updated_at = pg_catalog.clock_timestamp()
  from requested
  where entry.student_id = p_student_id
    and entry.id = requested.entry_id
    and entry.updated_at = requested.expected_updated_at
    and (entry.is_completed, entry.is_in_progress, entry.is_more_than_half_completed, entry.is_previous_incomplete)
      is distinct from (
        p_status = 'completed', p_status = 'in_progress', p_status = 'more_than_half_completed',
        p_status = 'previous_incomplete'
      );
  get diagnostics v_changed_count = row_count;

  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'id', entry.id,
    'isCompleted', entry.is_completed,
    'isInProgress', entry.is_in_progress,
    'isMoreThanHalfCompleted', entry.is_more_than_half_completed,
    'isPreviousIncomplete', entry.is_previous_incomplete,
    'completedAt', entry.completed_at,
    'updatedAt', entry.updated_at
  ) order by entry.schedule_date, entry.slot_index, entry.id), '[]'::jsonb)
  into v_entries
  from public.schedule_entries entry
  join pg_catalog.jsonb_to_recordset(p_items) requested(
    entry_id uuid, expected_updated_at timestamptz
  ) on requested.entry_id = entry.id
  where entry.student_id = p_student_id;

  return pg_catalog.jsonb_build_object(
    'requestedCount', v_item_count,
    'changedCount', v_changed_count,
    'status', p_status,
    'entries', v_entries
  );
end;
$$;

create or replace function public.schedule_student_batch_set_entries_status(
  p_token uuid, p_items jsonb, p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then
    raise exception 'Invalid or expired student session' using errcode = '28000';
  end if;
  return public._schedule_batch_set_entry_status(v_student_id, p_items, p_status, 'student', null);
end;
$$;

create or replace function public.schedule_admin_batch_set_entries_status(
  p_admin_token uuid, p_student_id uuid, p_items jsonb, p_status text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_admin_id uuid := public._schedule_admin_id(p_admin_token);
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  return public._schedule_batch_set_entry_status(p_student_id, p_items, p_status, 'admin', v_admin_id);
end;
$$;

revoke all on function public.shared_student_change_password(uuid, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_change_own_password(uuid, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_upsert_student_account(uuid, text, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_reset_student_password(uuid, uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_deactivate_student(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public._schedule_batch_set_entry_status(uuid, jsonb, text, text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_student_batch_set_entries_status(uuid, jsonb, text)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_batch_set_entries_status(uuid, uuid, jsonb, text)
  from public, anon, authenticated, service_role;

grant execute on function public.shared_student_change_password(uuid, text, text) to authenticated;
grant execute on function public.schedule_admin_change_own_password(uuid, text, text) to authenticated;
grant execute on function public.schedule_admin_upsert_student_account(uuid, text, text, jsonb) to authenticated;
grant execute on function public.schedule_admin_reset_student_password(uuid, uuid, text) to authenticated;
grant execute on function public.schedule_admin_deactivate_student(uuid, uuid) to authenticated;
grant execute on function public.schedule_student_batch_set_entries_status(uuid, jsonb, text) to authenticated;
grant execute on function public.schedule_admin_batch_set_entries_status(uuid, uuid, jsonb, text) to authenticated;

notify pgrst, 'reload schema';

commit;
