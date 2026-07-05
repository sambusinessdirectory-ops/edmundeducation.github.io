-- EdmundEducation Writing Practice account layer
-- Run this before supabase-writing-state.sql.

create extension if not exists pgcrypto;

create table if not exists public.writing_admin_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.writing_student_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text not null,
  access jsonb not null default '{
    "dse-writing": true,
    "ielts-writing": true,
    "toeic-writing": true,
    "toefl-writing": true,
    "pte-writing": true,
    "government-writing": true
  }'::jsonb,
  session_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.writing_password_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.writing_student_accounts(id) on delete cascade,
  student_name text not null,
  changed_by text not null,
  changed_at timestamptz not null default now()
);

alter table public.writing_admin_accounts enable row level security;
alter table public.writing_student_accounts enable row level security;
alter table public.writing_password_logs enable row level security;

create or replace function public.writing_default_access()
returns jsonb
language sql
stable
as $$
  select '{
    "dse-writing": true,
    "ielts-writing": true,
    "toeic-writing": true,
    "toefl-writing": true,
    "pte-writing": true,
    "government-writing": true
  }'::jsonb;
$$;

create or replace function public.writing_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists writing_admin_accounts_touch_updated_at on public.writing_admin_accounts;
create trigger writing_admin_accounts_touch_updated_at
before update on public.writing_admin_accounts
for each row execute function public.writing_touch_updated_at();

drop trigger if exists writing_student_accounts_touch_updated_at on public.writing_student_accounts;
create trigger writing_student_accounts_touch_updated_at
before update on public.writing_student_accounts
for each row execute function public.writing_touch_updated_at();

insert into public.writing_admin_accounts (name, password_hash)
values ('Sam Admin', crypt('EdmundWritingAdmin', gen_salt('bf')))
on conflict (name) do update
set password_hash = excluded.password_hash,
    updated_at = now();

create or replace function public._writing_admin_ok(p_name text, p_password text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.writing_admin_accounts admin_account
    where admin_account.name = p_name
      and admin_account.password_hash = crypt(p_password, admin_account.password_hash)
  );
$$;

revoke all on function public._writing_admin_ok(text, text) from public;

create or replace function public.writing_admin_login(p_name text, p_password text)
returns table (
  id uuid,
  name text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select admin_account.id, admin_account.name, admin_account.created_at
  from public.writing_admin_accounts admin_account
  where admin_account.name = p_name
    and admin_account.password_hash = crypt(p_password, admin_account.password_hash);
$$;

create or replace function public.writing_admin_list_students(p_admin_name text, p_admin_password text)
returns table (
  id uuid,
  name text,
  access jsonb,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials';
  end if;

  return query
  select student.id, student.name, student.access, student.created_at
  from public.writing_student_accounts student
  order by student.created_at desc, student.name asc;
end;
$$;

create or replace function public.writing_admin_upsert_student(
  p_admin_name text,
  p_admin_password text,
  p_student_name text,
  p_student_password text,
  p_access jsonb default null
)
returns table (
  id uuid,
  name text,
  access jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials';
  end if;

  if nullif(trim(p_student_name), '') is null or nullif(p_student_password, '') is null then
    raise exception 'Student name and password are required';
  end if;

  return query
  insert into public.writing_student_accounts (name, password_hash, access, session_token)
  values (
    trim(p_student_name),
    crypt(p_student_password, gen_salt('bf')),
    coalesce(p_access, public.writing_default_access()),
    gen_random_uuid()
  )
  on conflict (name) do update
  set password_hash = excluded.password_hash,
      access = coalesce(p_access, public.writing_student_accounts.access, public.writing_default_access()),
      session_token = gen_random_uuid(),
      updated_at = now()
  returning
    writing_student_accounts.id,
    writing_student_accounts.name,
    writing_student_accounts.access,
    writing_student_accounts.created_at;
end;
$$;

create or replace function public.writing_admin_change_student_password(
  p_admin_name text,
  p_admin_password text,
  p_student_name text,
  p_new_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_student_id uuid;
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials';
  end if;

  if nullif(p_new_password, '') is null then
    raise exception 'New password is required';
  end if;

  select student.id
  into v_student_id
  from public.writing_student_accounts student
  where student.name = trim(p_student_name);

  if v_student_id is null then
    return false;
  end if;

  update public.writing_student_accounts student
  set password_hash = crypt(p_new_password, gen_salt('bf')),
      session_token = gen_random_uuid(),
      updated_at = now()
  where student.id = v_student_id;

  insert into public.writing_password_logs (student_id, student_name, changed_by)
  values (v_student_id, trim(p_student_name), p_admin_name);

  return true;
end;
$$;

create or replace function public.writing_admin_set_student_access(
  p_admin_name text,
  p_admin_password text,
  p_student_name text,
  p_access jsonb
)
returns table (
  id uuid,
  name text,
  access jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials';
  end if;

  return query
  update public.writing_student_accounts student
  set access = coalesce(p_access, public.writing_default_access()),
      updated_at = now()
  where student.name = trim(p_student_name)
  returning student.id, student.name, student.access, student.created_at;
end;
$$;

create or replace function public.writing_admin_get_password_logs(
  p_admin_name text,
  p_admin_password text,
  p_student_name text
)
returns table (
  student_name text,
  changed_by text,
  changed_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials';
  end if;

  return query
  select log.student_name, log.changed_by, log.changed_at
  from public.writing_password_logs log
  where log.student_name = trim(p_student_name)
  order by log.changed_at desc;
end;
$$;

create or replace function public.writing_admin_delete_student(
  p_admin_name text,
  p_admin_password text,
  p_student_name text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_deleted_count integer;
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials';
  end if;

  delete from public.writing_student_accounts student
  where student.name = trim(p_student_name);

  get diagnostics v_deleted_count = row_count;
  return v_deleted_count > 0;
end;
$$;

create or replace function public.writing_student_login(p_name text, p_password text)
returns table (
  id uuid,
  name text,
  access jsonb,
  created_at timestamptz,
  session_token uuid
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_student public.writing_student_accounts%rowtype;
  v_token uuid := gen_random_uuid();
begin
  select *
  into v_student
  from public.writing_student_accounts student
  where student.name = trim(p_name)
    and student.password_hash = crypt(p_password, student.password_hash);

  if not found then
    return;
  end if;

  update public.writing_student_accounts student
  set session_token = v_token,
      updated_at = now()
  where student.id = v_student.id;

  return query
  select v_student.id, v_student.name, v_student.access, v_student.created_at, v_token;
end;
$$;

grant execute on function public.writing_admin_login(text, text) to anon, authenticated;
grant execute on function public.writing_admin_list_students(text, text) to anon, authenticated;
grant execute on function public.writing_admin_upsert_student(text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.writing_admin_change_student_password(text, text, text, text) to anon, authenticated;
grant execute on function public.writing_admin_set_student_access(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.writing_admin_get_password_logs(text, text, text) to anon, authenticated;
grant execute on function public.writing_admin_delete_student(text, text, text) to anon, authenticated;
grant execute on function public.writing_student_login(text, text) to anon, authenticated;
