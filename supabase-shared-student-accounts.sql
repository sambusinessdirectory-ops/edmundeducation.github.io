-- EdmundEducation shared student account migration
-- Run this after the Flashcard SQL and Writing Practice SQL have both been run successfully.
-- It keeps each system's own access/progress tables, but moves student passwords into one shared account table.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.student_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.student_accounts enable row level security;
revoke all on public.student_accounts from anon, authenticated;

create or replace function public.student_accounts_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists student_accounts_touch_updated_at on public.student_accounts;
create trigger student_accounts_touch_updated_at
before update on public.student_accounts
for each row execute function public.student_accounts_touch_updated_at();

alter table public.flashcard_students
add column if not exists shared_account_id uuid references public.student_accounts(id) on delete set null;

alter table public.writing_student_accounts
add column if not exists shared_account_id uuid references public.student_accounts(id) on delete set null;

create index if not exists flashcard_students_shared_account_id_idx
on public.flashcard_students(shared_account_id);

create index if not exists writing_student_accounts_shared_account_id_idx
on public.writing_student_accounts(shared_account_id);

insert into public.student_accounts (name, password_hash, created_at, updated_at, deleted_at)
select source.name, source.password_hash, source.created_at, source.updated_at, source.deleted_at
from (
  select distinct on (lower(trim(source_rows.name)))
    trim(source_rows.name) as name,
    source_rows.password_hash,
    source_rows.created_at,
    coalesce(source_rows.updated_at, source_rows.created_at) as updated_at,
    source_rows.deleted_at
  from (
    select name, password_hash, created_at, updated_at, deleted_at, 1 as source_order
    from public.flashcard_students
    where nullif(trim(name), '') is not null

    union all

    select name, password_hash, created_at, updated_at, null::timestamptz as deleted_at, 2 as source_order
    from public.writing_student_accounts
    where nullif(trim(name), '') is not null
  ) source_rows
  order by
    lower(trim(source_rows.name)),
    (source_rows.deleted_at is not null),
    source_rows.source_order,
    coalesce(source_rows.updated_at, source_rows.created_at) desc
) source
on conflict (name) do nothing;

update public.flashcard_students student
set shared_account_id = account.id
from public.student_accounts account
where student.shared_account_id is null
  and lower(student.name) = lower(account.name);

update public.writing_student_accounts student
set shared_account_id = account.id
from public.student_accounts account
where student.shared_account_id is null
  and lower(student.name) = lower(account.name);

update public.flashcard_students student
set password_hash = account.password_hash
from public.student_accounts account
where student.shared_account_id = account.id
  and student.password_hash is distinct from account.password_hash;

update public.writing_student_accounts student
set password_hash = account.password_hash
from public.student_accounts account
where student.shared_account_id = account.id
  and student.password_hash is distinct from account.password_hash;

create or replace function public.shared_student_account_login_id(p_name text, p_password text)
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select account.id
  from public.student_accounts account
  where lower(account.name) = lower(trim(p_name))
    and account.deleted_at is null
    and account.password_hash = extensions.crypt(p_password, account.password_hash)
  limit 1;
$$;

revoke all on function public.shared_student_account_login_id(text, text) from public;

create or replace function public.shared_student_account_id_by_name(p_name text, p_include_deleted boolean default false)
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select account.id
  from public.student_accounts account
  where lower(account.name) = lower(trim(p_name))
    and (p_include_deleted or account.deleted_at is null)
  order by account.deleted_at nulls first, account.updated_at desc
  limit 1;
$$;

revoke all on function public.shared_student_account_id_by_name(text, boolean) from public;

create or replace function public.shared_flashcard_ensure_profile(p_account_id uuid, p_access jsonb default null)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_account public.student_accounts%rowtype;
  v_student_id uuid;
  v_target_access jsonb;
begin
  select *
  into v_account
  from public.student_accounts account
  where account.id = p_account_id
    and account.deleted_at is null;

  if not found then
    return null;
  end if;

  select student.id
  into v_student_id
  from public.flashcard_students student
  where student.shared_account_id = v_account.id
     or lower(student.name) = lower(v_account.name)
  order by (student.deleted_at is null) desc, student.updated_at desc
  limit 1;

  if v_student_id is null then
    insert into public.flashcard_students (name, password_hash, access, deleted_at, shared_account_id)
    values (v_account.name, v_account.password_hash, coalesce(p_access, '{}'::jsonb), null, v_account.id)
    returning flashcard_students.id into v_student_id;
  else
    select coalesce(p_access, student.access, '{}'::jsonb)
    into v_target_access
    from public.flashcard_students student
    where student.id = v_student_id;

    update public.flashcard_students student
    set name = v_account.name,
        password_hash = v_account.password_hash,
        access = v_target_access,
        deleted_at = null,
        shared_account_id = v_account.id
    where student.id = v_student_id
      and (
        student.name is distinct from v_account.name
        or student.password_hash is distinct from v_account.password_hash
        or student.access is distinct from v_target_access
        or student.deleted_at is not null
        or student.shared_account_id is distinct from v_account.id
      );
  end if;

  return v_student_id;
end;
$$;

revoke all on function public.shared_flashcard_ensure_profile(uuid, jsonb) from public;

create or replace function public.shared_writing_ensure_profile(p_account_id uuid, p_access jsonb default null)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_account public.student_accounts%rowtype;
  v_student_id uuid;
  v_target_access jsonb;
begin
  select *
  into v_account
  from public.student_accounts account
  where account.id = p_account_id
    and account.deleted_at is null;

  if not found then
    return null;
  end if;

  select student.id
  into v_student_id
  from public.writing_student_accounts student
  where student.shared_account_id = v_account.id
     or lower(student.name) = lower(v_account.name)
  order by student.updated_at desc
  limit 1;

  if v_student_id is null then
    insert into public.writing_student_accounts (name, password_hash, access, session_token, shared_account_id)
    values (
      v_account.name,
      v_account.password_hash,
      coalesce(p_access, public.writing_default_access()),
      gen_random_uuid(),
      v_account.id
    )
    returning writing_student_accounts.id into v_student_id;
  else
    select coalesce(p_access, student.access, public.writing_default_access())
    into v_target_access
    from public.writing_student_accounts student
    where student.id = v_student_id;

    update public.writing_student_accounts student
    set name = v_account.name,
        password_hash = v_account.password_hash,
        access = v_target_access,
        shared_account_id = v_account.id
    where student.id = v_student_id
      and (
        student.name is distinct from v_account.name
        or student.password_hash is distinct from v_account.password_hash
        or student.access is distinct from v_target_access
        or student.shared_account_id is distinct from v_account.id
      );
  end if;

  return v_student_id;
end;
$$;

revoke all on function public.shared_writing_ensure_profile(uuid, jsonb) from public;

create or replace function public.flashcard_student_login(p_name text, p_password text)
returns table(id uuid, name text, role text, access jsonb, created_at timestamptz, session_token uuid)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_account_id uuid;
  v_student_id uuid;
  v_student public.flashcard_students%rowtype;
  v_token uuid;
begin
  v_account_id := public.shared_student_account_login_id(p_name, p_password);

  if v_account_id is null then
    return;
  end if;

  v_student_id := public.shared_flashcard_ensure_profile(v_account_id);
  if v_student_id is null then
    return;
  end if;

  select *
  into v_student
  from public.flashcard_students student
  where student.id = v_student_id;

  if not found then
    return;
  end if;

  insert into public.flashcard_student_sessions (student_id)
  values (v_student.id)
  returning token into v_token;

  return query
  select v_student.id, account.name, 'student'::text, v_student.access, account.created_at, v_token
  from public.student_accounts account
  where account.id = v_account_id;
end;
$$;

create or replace function public.flashcard_admin_list_students(p_admin_name text, p_admin_password text)
returns table(id uuid, name text, access jsonb, created_at timestamptz, updated_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return;
  end if;

  perform public.shared_flashcard_ensure_profile(account.id)
  from public.student_accounts account
  where account.deleted_at is null;

  return query
  select student.id, account.name, student.access, account.created_at, greatest(student.updated_at, account.updated_at)
  from public.student_accounts account
  join public.flashcard_students student on student.shared_account_id = account.id
  where account.deleted_at is null
    and student.deleted_at is null
  order by account.created_at desc, account.name asc;
end;
$$;

create or replace function public.flashcard_admin_upsert_student(
  p_admin_name text,
  p_admin_password text,
  p_student_name text,
  p_student_password text,
  p_access jsonb default '{}'::jsonb
)
returns table(id uuid, name text, access jsonb, created_at timestamptz, updated_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text := trim(p_student_name);
  v_hash text;
  v_account_id uuid;
  v_student_id uuid;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return;
  end if;

  if v_name = '' or coalesce(p_student_password, '') = '' then
    raise exception 'Student name and password are required.';
  end if;

  v_hash := extensions.crypt(p_student_password, extensions.gen_salt('bf'));

  insert into public.student_accounts (name, password_hash, deleted_at)
  values (v_name, v_hash, null)
  on conflict (name) do update
  set password_hash = excluded.password_hash,
      deleted_at = null,
      updated_at = now()
  returning student_accounts.id into v_account_id;

  v_student_id := public.shared_flashcard_ensure_profile(v_account_id, coalesce(p_access, '{}'::jsonb));

  update public.writing_student_accounts student
  set password_hash = v_hash,
      session_token = gen_random_uuid()
  where student.shared_account_id = v_account_id
     or lower(student.name) = lower(v_name);

  return query
  select student.id, account.name, student.access, account.created_at, greatest(student.updated_at, account.updated_at)
  from public.flashcard_students student
  join public.student_accounts account on account.id = student.shared_account_id
  where student.id = v_student_id;
end;
$$;

create or replace function public.flashcard_admin_set_student_access(
  p_admin_name text,
  p_admin_password text,
  p_student_name text,
  p_access jsonb
)
returns table(id uuid, name text, access jsonb, created_at timestamptz, updated_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_account_id uuid;
  v_student_id uuid;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return;
  end if;

  v_account_id := public.shared_student_account_id_by_name(p_student_name, false);
  if v_account_id is null then
    return;
  end if;

  v_student_id := public.shared_flashcard_ensure_profile(v_account_id, coalesce(p_access, '{}'::jsonb));

  return query
  select student.id, account.name, student.access, account.created_at, greatest(student.updated_at, account.updated_at)
  from public.flashcard_students student
  join public.student_accounts account on account.id = student.shared_account_id
  where student.id = v_student_id;
end;
$$;

create or replace function public.flashcard_admin_change_student_password(
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
  v_account_id uuid;
  v_student_id uuid;
  v_hash text;
  v_account_name text;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return false;
  end if;

  if coalesce(p_new_password, '') = '' then
    raise exception 'New password is required.';
  end if;

  v_account_id := public.shared_student_account_id_by_name(p_student_name, false);
  if v_account_id is null then
    return false;
  end if;

  v_hash := extensions.crypt(p_new_password, extensions.gen_salt('bf'));

  update public.student_accounts account
  set password_hash = v_hash
  where account.id = v_account_id
  returning account.name into v_account_name;

  v_student_id := public.shared_flashcard_ensure_profile(v_account_id);

  update public.flashcard_students student
  set password_hash = v_hash
  where student.shared_account_id = v_account_id
     or lower(student.name) = lower(v_account_name);

  update public.writing_student_accounts student
  set password_hash = v_hash,
      session_token = gen_random_uuid()
  where student.shared_account_id = v_account_id
     or lower(student.name) = lower(v_account_name);

  if v_student_id is not null then
    insert into public.flashcard_student_password_logs (student_id, student_name, changed_by)
    values (v_student_id, v_account_name, trim(p_admin_name));
  end if;

  return true;
end;
$$;

create or replace function public.flashcard_admin_delete_student(
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
  v_account_id uuid;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return false;
  end if;

  v_account_id := public.shared_student_account_id_by_name(p_student_name, false);
  if v_account_id is null then
    return false;
  end if;

  update public.student_accounts account
  set deleted_at = now()
  where account.id = v_account_id;

  update public.flashcard_students student
  set deleted_at = now()
  where student.shared_account_id = v_account_id
     or lower(student.name) = lower(trim(p_student_name));

  return true;
end;
$$;

create or replace function public.flashcard_admin_delete_student_with_state(
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
  v_account_id uuid;
  v_student_id uuid;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return false;
  end if;

  v_account_id := public.shared_student_account_id_by_name(p_student_name, true);

  select student.id
  into v_student_id
  from public.flashcard_students student
  where (v_account_id is not null and student.shared_account_id = v_account_id)
     or lower(student.name) = lower(trim(p_student_name))
  order by (student.deleted_at is null) desc, student.updated_at desc
  limit 1;

  if v_account_id is not null then
    update public.student_accounts account
    set deleted_at = now()
    where account.id = v_account_id;
  end if;

  if v_student_id is null then
    return true;
  end if;

  delete from public.flashcard_student_state state where state.student_id = v_student_id;
  delete from public.flashcard_student_sessions session where session.student_id = v_student_id;
  delete from public.flashcard_student_password_logs log where log.student_id = v_student_id;
  delete from public.flashcard_students student where student.id = v_student_id;

  return not exists (
    select 1
    from public.flashcard_students student
    where student.id = v_student_id
  );
end;
$$;

create or replace function public.flashcard_admin_get_student_state(
  p_admin_name text,
  p_admin_password text,
  p_student_name text
)
returns table(key text, value jsonb, updated_at timestamptz)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_account_id uuid;
  v_student_id uuid;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return;
  end if;

  v_account_id := public.shared_student_account_id_by_name(p_student_name, false);
  if v_account_id is null then
    return;
  end if;

  v_student_id := public.shared_flashcard_ensure_profile(v_account_id);

  return query
  select state.key, state.value, state.updated_at
  from public.flashcard_student_state state
  where state.student_id = v_student_id
  order by state.updated_at desc;
end;
$$;

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
set search_path = public, pg_temp
as $$
declare
  v_account_id uuid;
  v_student_id uuid;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return false;
  end if;

  v_account_id := public.shared_student_account_id_by_name(p_student_name, false);
  if v_account_id is null then
    return false;
  end if;

  v_student_id := public.shared_flashcard_ensure_profile(v_account_id);
  if v_student_id is null or trim(p_key) = '' then
    return false;
  end if;

  insert into public.flashcard_student_state (student_id, key, value)
  values (v_student_id, trim(p_key), coalesce(p_value, '{}'::jsonb))
  on conflict (student_id, key) do update
  set value = excluded.value,
      updated_at = now();

  return true;
end;
$$;

create or replace function public.flashcard_session_student_id(p_token uuid)
returns uuid
language sql
security definer
set search_path = public, pg_temp
as $$
  select session.student_id
  from public.flashcard_student_sessions session
  join public.flashcard_students student on student.id = session.student_id
  left join public.student_accounts account on account.id = student.shared_account_id
  where session.token = p_token
    and session.expires_at > now()
    and student.deleted_at is null
    and (student.shared_account_id is null or account.deleted_at is null)
  limit 1;
$$;

create or replace function public.writing_admin_list_students(p_admin_name text, p_admin_password text)
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

  perform public.shared_writing_ensure_profile(account.id)
  from public.student_accounts account
  where account.deleted_at is null;

  return query
  select student.id, account.name, student.access, account.created_at
  from public.student_accounts account
  join public.writing_student_accounts student on student.shared_account_id = account.id
  where account.deleted_at is null
  order by account.created_at desc, account.name asc;
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
declare
  v_name text := trim(p_student_name);
  v_hash text;
  v_account_id uuid;
  v_student_id uuid;
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials';
  end if;

  if nullif(v_name, '') is null or nullif(p_student_password, '') is null then
    raise exception 'Student name and password are required';
  end if;

  v_hash := extensions.crypt(p_student_password, extensions.gen_salt('bf'));

  insert into public.student_accounts (name, password_hash, deleted_at)
  values (v_name, v_hash, null)
  on conflict (name) do update
  set password_hash = excluded.password_hash,
      deleted_at = null,
      updated_at = now()
  returning student_accounts.id into v_account_id;

  v_student_id := public.shared_writing_ensure_profile(v_account_id, coalesce(p_access, public.writing_default_access()));

  update public.flashcard_students student
  set password_hash = v_hash
  where student.shared_account_id = v_account_id
     or lower(student.name) = lower(v_name);

  return query
  select student.id, account.name, student.access, account.created_at
  from public.writing_student_accounts student
  join public.student_accounts account on account.id = student.shared_account_id
  where student.id = v_student_id;
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
  v_account_id uuid;
  v_student_id uuid;
  v_hash text;
  v_account_name text;
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials';
  end if;

  if nullif(p_new_password, '') is null then
    raise exception 'New password is required';
  end if;

  v_account_id := public.shared_student_account_id_by_name(p_student_name, false);
  if v_account_id is null then
    return false;
  end if;

  v_hash := extensions.crypt(p_new_password, extensions.gen_salt('bf'));

  update public.student_accounts account
  set password_hash = v_hash
  where account.id = v_account_id
  returning account.name into v_account_name;

  v_student_id := public.shared_writing_ensure_profile(v_account_id);

  update public.writing_student_accounts student
  set password_hash = v_hash,
      session_token = gen_random_uuid()
  where student.shared_account_id = v_account_id
     or lower(student.name) = lower(v_account_name);

  update public.flashcard_students student
  set password_hash = v_hash
  where student.shared_account_id = v_account_id
     or lower(student.name) = lower(v_account_name);

  if v_student_id is not null then
    insert into public.writing_password_logs (student_id, student_name, changed_by)
    values (v_student_id, v_account_name, p_admin_name);
  end if;

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
declare
  v_account_id uuid;
  v_student_id uuid;
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials';
  end if;

  v_account_id := public.shared_student_account_id_by_name(p_student_name, false);
  if v_account_id is null then
    return;
  end if;

  v_student_id := public.shared_writing_ensure_profile(v_account_id, coalesce(p_access, public.writing_default_access()));

  return query
  select student.id, account.name, student.access, account.created_at
  from public.writing_student_accounts student
  join public.student_accounts account on account.id = student.shared_account_id
  where student.id = v_student_id;
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
  v_account_id uuid;
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials';
  end if;

  v_account_id := public.shared_student_account_id_by_name(p_student_name, false);
  if v_account_id is null then
    return false;
  end if;

  update public.student_accounts account
  set deleted_at = now()
  where account.id = v_account_id;

  update public.flashcard_students student
  set deleted_at = now()
  where student.shared_account_id = v_account_id
     or lower(student.name) = lower(trim(p_student_name));

  delete from public.writing_student_accounts student
  where student.shared_account_id = v_account_id
     or lower(student.name) = lower(trim(p_student_name));

  return true;
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
  v_account_id uuid;
  v_student_id uuid;
  v_student public.writing_student_accounts%rowtype;
  v_token uuid := gen_random_uuid();
begin
  v_account_id := public.shared_student_account_login_id(p_name, p_password);

  if v_account_id is null then
    return;
  end if;

  v_student_id := public.shared_writing_ensure_profile(v_account_id);
  if v_student_id is null then
    return;
  end if;

  select *
  into v_student
  from public.writing_student_accounts student
  where student.id = v_student_id;

  if not found then
    return;
  end if;

  update public.writing_student_accounts student
  set session_token = v_token
  where student.id = v_student.id;

  return query
  select v_student.id, account.name, v_student.access, account.created_at, v_token
  from public.student_accounts account
  where account.id = v_account_id;
end;
$$;

create or replace function public.writing_student_get_state(p_token uuid)
returns table (
  key text,
  value jsonb,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_student_id uuid;
begin
  select student.id
  into v_student_id
  from public.writing_student_accounts student
  left join public.student_accounts account on account.id = student.shared_account_id
  where student.session_token = p_token
    and (student.shared_account_id is null or account.deleted_at is null);

  if v_student_id is null then
    return;
  end if;

  return query
  select state.key, state.value, state.updated_at
  from public.writing_student_state state
  where state.student_id = v_student_id
  order by state.key asc;
end;
$$;

create or replace function public.writing_student_upsert_state(
  p_token uuid,
  p_key text,
  p_value jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_student_id uuid;
begin
  select student.id
  into v_student_id
  from public.writing_student_accounts student
  left join public.student_accounts account on account.id = student.shared_account_id
  where student.session_token = p_token
    and (student.shared_account_id is null or account.deleted_at is null);

  if v_student_id is null or nullif(trim(p_key), '') is null then
    return false;
  end if;

  insert into public.writing_student_state (student_id, key, value)
  values (v_student_id, trim(p_key), coalesce(p_value, '{}'::jsonb))
  on conflict (student_id, key) do update
  set value = excluded.value,
      updated_at = now();

  return true;
end;
$$;

create or replace function public.writing_admin_get_student_state(
  p_admin_name text,
  p_admin_password text,
  p_student_name text
)
returns table (
  key text,
  value jsonb,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_account_id uuid;
  v_student_id uuid;
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials';
  end if;

  v_account_id := public.shared_student_account_id_by_name(p_student_name, false);
  if v_account_id is null then
    return;
  end if;

  v_student_id := public.shared_writing_ensure_profile(v_account_id);

  return query
  select state.key, state.value, state.updated_at
  from public.writing_student_state state
  where state.student_id = v_student_id
  order by state.key asc;
end;
$$;

create or replace function public.writing_admin_upsert_student_state(
  p_admin_name text,
  p_admin_password text,
  p_student_name text,
  p_key text,
  p_value jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_account_id uuid;
  v_student_id uuid;
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials';
  end if;

  v_account_id := public.shared_student_account_id_by_name(p_student_name, false);
  if v_account_id is null then
    return false;
  end if;

  v_student_id := public.shared_writing_ensure_profile(v_account_id);
  if v_student_id is null or nullif(trim(p_key), '') is null then
    return false;
  end if;

  insert into public.writing_student_state (student_id, key, value)
  values (v_student_id, trim(p_key), coalesce(p_value, '{}'::jsonb))
  on conflict (student_id, key) do update
  set value = excluded.value,
      updated_at = now();

  return true;
end;
$$;

grant execute on function public.flashcard_student_login(text, text) to anon, authenticated;
grant execute on function public.flashcard_admin_list_students(text, text) to anon, authenticated;
grant execute on function public.flashcard_admin_upsert_student(text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.flashcard_admin_set_student_access(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.flashcard_admin_change_student_password(text, text, text, text) to anon, authenticated;
grant execute on function public.flashcard_admin_delete_student(text, text, text) to anon, authenticated;
grant execute on function public.flashcard_admin_delete_student_with_state(text, text, text) to anon, authenticated;
grant execute on function public.flashcard_admin_get_student_state(text, text, text) to anon, authenticated;
grant execute on function public.flashcard_admin_upsert_student_state(text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.flashcard_session_student_id(uuid) to anon, authenticated;

grant execute on function public.writing_admin_list_students(text, text) to anon, authenticated;
grant execute on function public.writing_admin_upsert_student(text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.writing_admin_change_student_password(text, text, text, text) to anon, authenticated;
grant execute on function public.writing_admin_set_student_access(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.writing_admin_delete_student(text, text, text) to anon, authenticated;
grant execute on function public.writing_student_login(text, text) to anon, authenticated;
grant execute on function public.writing_student_get_state(uuid) to anon, authenticated;
grant execute on function public.writing_student_upsert_state(uuid, text, jsonb) to anon, authenticated;
grant execute on function public.writing_admin_get_student_state(text, text, text) to anon, authenticated;
grant execute on function public.writing_admin_upsert_student_state(text, text, text, text, jsonb) to anon, authenticated;
