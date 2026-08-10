-- EdmundEducation Parent Communication System.
--
-- Parent identities are deliberately NOT inserted into flashcard_students.
-- This makes it structurally impossible for a parent credential to authenticate
-- to a child's learning portal. A parent can only request a progress snapshot
-- for an explicitly assigned student through the RPCs below.
--
-- Apply after:
--   * supabase-schedule-system.sql
--   * supabase-student-progress.sql

begin;

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if to_regclass('public.schedule_admin_accounts') is null
    or to_regclass('public.schedule_admin_sessions') is null
    or to_regclass('public.schedule_worker_secrets') is null
    or to_regclass('public.flashcard_students') is null
    or to_regprocedure('public._schedule_admin_id(uuid)') is null
    or to_regprocedure('public._schedule_worker_ok(text)') is null
    or to_regprocedure('public._student_progress_snapshot(uuid)') is null
  then
    raise exception 'Apply Schedule and Student Progress migrations first';
  end if;
end;
$$;

create table if not exists public.parent_communication_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  password_hash text not null,
  tag_colour text not null default '#7c3aed',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (name = pg_catalog.btrim(name)),
  check (pg_catalog.char_length(name) between 1 and 100),
  check (name !~ '[[:cntrl:]]'),
  check (password_hash ~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$'),
  check (tag_colour ~ '^#[0-9A-Fa-f]{6}$')
);

create unique index if not exists parent_communication_name_lower_idx
  on public.parent_communication_accounts (pg_catalog.lower(name));

create table if not exists public.parent_communication_sessions (
  token_hash bytea primary key,
  parent_id uuid not null
    references public.parent_communication_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (pg_catalog.octet_length(token_hash) = 32),
  check (expires_at > created_at)
);

create index if not exists parent_communication_sessions_expires_idx
  on public.parent_communication_sessions (expires_at);

create table if not exists public.parent_communication_assignments (
  parent_id uuid not null
    references public.parent_communication_accounts(id) on delete cascade,
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  assigned_by_admin uuid
    references public.schedule_admin_accounts(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (parent_id, student_id)
);

-- The primary key already indexes parent_id first. This reverse index makes
-- student-account deactivation and administrative audits efficient.
create index if not exists parent_communication_assignments_student_idx
  on public.parent_communication_assignments (student_id, parent_id);

alter table public.parent_communication_accounts enable row level security;
alter table public.parent_communication_sessions enable row level security;
alter table public.parent_communication_assignments enable row level security;

revoke all on table public.parent_communication_accounts
  from public, anon, authenticated, service_role;
revoke all on table public.parent_communication_sessions
  from public, anon, authenticated, service_role;
revoke all on table public.parent_communication_assignments
  from public, anon, authenticated, service_role;

create or replace function public._parent_communication_touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.clock_timestamp();
  return new;
end;
$$;

drop trigger if exists parent_communication_touch_updated_at
  on public.parent_communication_accounts;
create trigger parent_communication_touch_updated_at
before update on public.parent_communication_accounts
for each row execute function public._parent_communication_touch_updated_at();

create or replace function public._parent_communication_revoke_sessions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.password_hash is distinct from new.password_hash
    or old.is_active is distinct from new.is_active
  then
    delete from public.parent_communication_sessions session_row
    where session_row.parent_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists parent_communication_security_change
  on public.parent_communication_accounts;
create trigger parent_communication_security_change
after update of password_hash, is_active on public.parent_communication_accounts
for each row execute function public._parent_communication_revoke_sessions();

create or replace function public._parent_communication_parent_id(p_parent_token uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select session_row.parent_id
  from public.parent_communication_sessions session_row
  join public.parent_communication_accounts account
    on account.id = session_row.parent_id
  where session_row.token_hash = extensions.digest(p_parent_token::text, 'sha256')
    and session_row.expires_at > pg_catalog.now()
    and account.is_active
  limit 1;
$$;

create or replace function public.parent_communication_login(
  p_service_secret text,
  p_name text,
  p_password text
)
returns table (
  parent_id uuid,
  parent_token uuid,
  name text,
  tag_colour text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_name, '')));
  v_parent public.parent_communication_accounts%rowtype;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_token uuid := gen_random_uuid();
  v_expires_at timestamptz := v_now + interval '30 days';
begin
  if not public._schedule_worker_ok(p_service_secret)
    or pg_catalog.char_length(v_name) not between 1 and 100
    or p_password is null
    or pg_catalog.char_length(p_password) not between 1 and 200
  then
    return;
  end if;

  select account.* into v_parent
  from public.parent_communication_accounts account
  where pg_catalog.lower(account.name) = v_name
  limit 1
  for update;

  if not found then
    perform extensions.crypt(p_password, extensions.gen_salt('bf', 12));
    return;
  end if;
  if not v_parent.is_active
    or v_parent.password_hash <> extensions.crypt(p_password, v_parent.password_hash)
  then
    return;
  end if;

  delete from public.parent_communication_sessions session_row
  where session_row.expires_at <= v_now;
  insert into public.parent_communication_sessions (
    token_hash, parent_id, created_at, expires_at
  ) values (
    extensions.digest(v_token::text, 'sha256'), v_parent.id, v_now, v_expires_at
  );

  return query select v_parent.id, v_token, v_parent.name, v_parent.tag_colour, v_expires_at;
end;
$$;

create or replace function public.parent_communication_me(p_parent_token uuid)
returns table (id uuid, name text, tag_colour text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select account.id, account.name, account.tag_colour, session_row.expires_at
  from public.parent_communication_sessions session_row
  join public.parent_communication_accounts account on account.id = session_row.parent_id
  where session_row.token_hash = extensions.digest(p_parent_token::text, 'sha256')
    and session_row.expires_at > pg_catalog.now()
    and account.is_active
  limit 1;
$$;

create or replace function public.parent_communication_students(p_parent_token uuid)
returns table (id uuid, name text)
language sql
stable
security definer
set search_path = ''
as $$
  select student.id, student.name
  from public.parent_communication_assignments assignment
  join public.flashcard_students student on student.id = assignment.student_id
  where assignment.parent_id = public._parent_communication_parent_id(p_parent_token)
    and student.deleted_at is null
  order by pg_catalog.lower(student.name), student.id;
$$;

create or replace function public.parent_communication_snapshot(
  p_parent_token uuid,
  p_student_id uuid
)
returns table (snapshot jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select public._student_progress_snapshot(student.id)
  from public.parent_communication_assignments assignment
  join public.flashcard_students student on student.id = assignment.student_id
  where assignment.parent_id = public._parent_communication_parent_id(p_parent_token)
    and assignment.student_id = p_student_id
    and student.deleted_at is null
  limit 1;
$$;

create or replace function public.parent_communication_logout(p_parent_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.parent_communication_sessions session_row
  where session_row.token_hash = extensions.digest(p_parent_token::text, 'sha256');
  return found;
end;
$$;

create or replace function public.parent_communication_change_password(
  p_parent_token uuid,
  p_current_password text,
  p_new_password text
)
returns table (parent_token uuid, name text, tag_colour text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent_id uuid := public._parent_communication_parent_id(p_parent_token);
  v_parent public.parent_communication_accounts%rowtype;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_token uuid := gen_random_uuid();
  v_expires_at timestamptz := v_now + interval '30 days';
begin
  if v_parent_id is null then
    raise exception 'Invalid or expired parent session' using errcode = '28000';
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

  select account.* into v_parent
  from public.parent_communication_accounts account
  where account.id = v_parent_id
  for update;
  if v_parent.password_hash <> extensions.crypt(p_current_password, v_parent.password_hash) then
    raise exception 'Current password is incorrect' using errcode = '28000';
  end if;
  if v_parent.password_hash = extensions.crypt(p_new_password, v_parent.password_hash) then
    raise exception 'New password must be different from the current password'
      using errcode = '22023';
  end if;

  update public.parent_communication_accounts account
  set password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf', 12))
  where account.id = v_parent.id;
  insert into public.parent_communication_sessions (token_hash, parent_id, created_at, expires_at)
  values (extensions.digest(v_token::text, 'sha256'), v_parent.id, v_now, v_expires_at);
  return query select v_token, v_parent.name, v_parent.tag_colour, v_expires_at;
end;
$$;

create or replace function public.schedule_admin_list_parents(p_admin_token uuid)
returns table (
  id uuid,
  name text,
  tag_colour text,
  is_active boolean,
  assigned_student_ids jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select account.id, account.name, account.tag_colour, account.is_active,
    coalesce((
      select pg_catalog.jsonb_agg(assignment.student_id order by assignment.student_id)
      from public.parent_communication_assignments assignment
      where assignment.parent_id = account.id
    ), '[]'::jsonb),
    account.created_at, account.updated_at
  from public.parent_communication_accounts account
  where public._schedule_admin_id(p_admin_token) is not null
  order by pg_catalog.lower(account.name), account.id;
$$;

create or replace function public.schedule_admin_upsert_parent(
  p_admin_token uuid,
  p_parent_name text,
  p_parent_password text,
  p_tag_colour text default '#7c3aed'
)
returns table (id uuid, name text, tag_colour text, is_active boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_name text := pg_catalog.btrim(coalesce(p_parent_name, ''));
  v_colour text := coalesce(p_tag_colour, '');
  v_parent_id uuid;
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if pg_catalog.char_length(v_name) not between 1 and 100
    or v_name ~ '[[:cntrl:]]'
    or p_parent_password is null
    or pg_catalog.char_length(p_parent_password) not between 8 and 200
    or p_parent_password ~ '[[:cntrl:]]'
    or v_colour !~ '^#[0-9A-Fa-f]{6}$'
  then
    raise exception 'A valid parent name, password and colour are required'
      using errcode = '22023';
  end if;

  select account.id into v_parent_id
  from public.parent_communication_accounts account
  where pg_catalog.lower(account.name) = pg_catalog.lower(v_name)
  limit 1 for update;

  if v_parent_id is null then
    insert into public.parent_communication_accounts (
      name, password_hash, tag_colour, is_active
    ) values (
      v_name,
      extensions.crypt(p_parent_password, extensions.gen_salt('bf', 12)),
      v_colour,
      true
    ) returning parent_communication_accounts.id into v_parent_id;
  else
    raise exception 'A parent account with this name already exists'
      using errcode = '23505';
  end if;

  return query
  select account.id, account.name, account.tag_colour, account.is_active
  from public.parent_communication_accounts account
  where account.id = v_parent_id;
end;
$$;

create or replace function public.schedule_admin_assign_parent_students(
  p_admin_token uuid,
  p_parent_id uuid,
  p_student_ids uuid[]
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
  v_submitted_count integer := coalesce(pg_catalog.cardinality(p_student_ids), 0);
  v_valid_count integer;
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if not exists (
    select 1 from public.parent_communication_accounts account
    where account.id = p_parent_id and account.is_active
  ) then
    raise exception 'Parent not found';
  end if;
  if v_submitted_count > 100 then
    raise exception 'A parent can be assigned at most 100 students'
      using errcode = '22023';
  end if;
  if v_submitted_count <> (
    select pg_catalog.count(distinct student_id)::integer
    from pg_catalog.unnest(coalesce(p_student_ids, array[]::uuid[])) student_id
  ) then
    raise exception 'Student list contains duplicates' using errcode = '22023';
  end if;

  select pg_catalog.count(*)::integer into v_valid_count
  from public.flashcard_students student
  join pg_catalog.unnest(coalesce(p_student_ids, array[]::uuid[])) requested(student_id)
    on requested.student_id = student.id
  where student.deleted_at is null;
  if v_valid_count <> v_submitted_count then
    raise exception 'One or more student accounts are unavailable'
      using errcode = '22023';
  end if;

  delete from public.parent_communication_assignments assignment
  where assignment.parent_id = p_parent_id;
  insert into public.parent_communication_assignments (
    parent_id, student_id, assigned_by_admin
  )
  select p_parent_id, requested.student_id, v_admin_id
  from pg_catalog.unnest(coalesce(p_student_ids, array[]::uuid[])) requested(student_id);
  return v_submitted_count;
end;
$$;

create or replace function public.schedule_admin_reset_parent_password(
  p_admin_token uuid, p_parent_id uuid, p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  if p_new_password is null
    or pg_catalog.char_length(p_new_password) not between 8 and 200
    or p_new_password ~ '[[:cntrl:]]'
  then
    raise exception 'Password must contain 8 to 200 visible characters'
      using errcode = '22023';
  end if;
  update public.parent_communication_accounts account
  set password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf', 12))
  where account.id = p_parent_id and account.is_active;
  if not found then raise exception 'Parent not found'; end if;
  return true;
end;
$$;

create or replace function public.schedule_admin_delete_parent(
  p_admin_token uuid, p_parent_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session' using errcode = '28000';
  end if;
  delete from public.parent_communication_accounts account
  where account.id = p_parent_id;
  return found;
end;
$$;

revoke all on function public._parent_communication_touch_updated_at()
  from public, anon, authenticated, service_role;
revoke all on function public._parent_communication_revoke_sessions()
  from public, anon, authenticated, service_role;
revoke all on function public._parent_communication_parent_id(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.parent_communication_login(text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.parent_communication_me(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.parent_communication_students(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.parent_communication_snapshot(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.parent_communication_logout(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.parent_communication_change_password(uuid, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_list_parents(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_upsert_parent(uuid, text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_assign_parent_students(uuid, uuid, uuid[])
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_reset_parent_password(uuid, uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public.schedule_admin_delete_parent(uuid, uuid)
  from public, anon, authenticated, service_role;

-- Parent login is only usable through the rate-limited Worker because the
-- private service secret is never present in browser JavaScript.
grant execute on function public.parent_communication_login(text, text, text) to anon;

grant execute on function public.parent_communication_me(uuid) to authenticated;
grant execute on function public.parent_communication_students(uuid) to authenticated;
grant execute on function public.parent_communication_snapshot(uuid, uuid) to authenticated;
grant execute on function public.parent_communication_logout(uuid) to authenticated;
grant execute on function public.parent_communication_change_password(uuid, text, text) to authenticated;
grant execute on function public.schedule_admin_list_parents(uuid) to authenticated;
grant execute on function public.schedule_admin_upsert_parent(uuid, text, text, text) to authenticated;
grant execute on function public.schedule_admin_assign_parent_students(uuid, uuid, uuid[]) to authenticated;
grant execute on function public.schedule_admin_reset_parent_password(uuid, uuid, text) to authenticated;
grant execute on function public.schedule_admin_delete_parent(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';

commit;
