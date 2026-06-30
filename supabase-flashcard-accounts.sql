create extension if not exists pgcrypto with schema extensions;

create table if not exists public.flashcard_admins (
  name text primary key,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.flashcard_students (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text not null,
  access jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.flashcard_student_sessions (
  token uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);

create table if not exists public.flashcard_student_state (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (student_id, key)
);

create table if not exists public.flashcard_student_password_logs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  student_name text not null,
  changed_by text not null default 'Sam',
  changed_at timestamptz not null default now()
);

create or replace function public.flashcard_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists flashcard_students_touch_updated_at on public.flashcard_students;
create trigger flashcard_students_touch_updated_at
before update on public.flashcard_students
for each row
execute function public.flashcard_touch_updated_at();

drop trigger if exists flashcard_student_state_touch_updated_at on public.flashcard_student_state;
create trigger flashcard_student_state_touch_updated_at
before update on public.flashcard_student_state
for each row
execute function public.flashcard_touch_updated_at();

insert into public.flashcard_admins (name, password_hash)
values ('Sam', extensions.crypt('FlashCardEdmund', extensions.gen_salt('bf')))
on conflict (name) do nothing;

alter table public.flashcard_admins enable row level security;
alter table public.flashcard_students enable row level security;
alter table public.flashcard_student_sessions enable row level security;
alter table public.flashcard_student_state enable row level security;
alter table public.flashcard_student_password_logs enable row level security;

revoke all on public.flashcard_admins from anon, authenticated;
revoke all on public.flashcard_students from anon, authenticated;
revoke all on public.flashcard_student_sessions from anon, authenticated;
revoke all on public.flashcard_student_state from anon, authenticated;
revoke all on public.flashcard_student_password_logs from anon, authenticated;

create or replace function public.flashcard_admin_ok(p_name text, p_password text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.flashcard_admins a
    where a.name = trim(p_name)
      and a.password_hash = extensions.crypt(p_password, a.password_hash)
  );
$$;

create or replace function public.flashcard_admin_login(p_name text, p_password text)
returns table(name text, role text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.flashcard_admin_ok(p_name, p_password) then
    return;
  end if;

  return query select trim(p_name), 'admin'::text;
end;
$$;

create or replace function public.flashcard_student_login(p_name text, p_password text)
returns table(id uuid, name text, role text, access jsonb, created_at timestamptz, session_token uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student public.flashcard_students%rowtype;
  v_token uuid;
begin
  select *
  into v_student
  from public.flashcard_students st
  where lower(st.name) = lower(trim(p_name))
    and st.deleted_at is null
    and st.password_hash = extensions.crypt(p_password, st.password_hash)
  limit 1;

  if not found then
    return;
  end if;

  insert into public.flashcard_student_sessions (student_id)
  values (v_student.id)
  returning token into v_token;

  return query
  select v_student.id, v_student.name, 'student'::text, v_student.access, v_student.created_at, v_token;
end;
$$;

create or replace function public.flashcard_admin_list_students(p_admin_name text, p_admin_password text)
returns table(id uuid, name text, access jsonb, created_at timestamptz, updated_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return;
  end if;

  return query
  select s.id, s.name, s.access, s.created_at, s.updated_at
  from public.flashcard_students s
  where s.deleted_at is null
  order by s.created_at desc;
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
set search_path = public
as $$
declare
  v_name text := trim(p_student_name);
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return;
  end if;

  if v_name = '' or coalesce(p_student_password, '') = '' then
    raise exception 'Student name and password are required.';
  end if;

  insert into public.flashcard_students (name, password_hash, access, deleted_at)
  values (v_name, extensions.crypt(p_student_password, extensions.gen_salt('bf')), coalesce(p_access, '{}'::jsonb), null)
  on conflict on constraint flashcard_students_name_key do update
  set password_hash = excluded.password_hash,
      access = excluded.access,
      deleted_at = null,
      updated_at = now();

  return query
  select s.id, s.name, s.access, s.created_at, s.updated_at
  from public.flashcard_students s
  where s.name = v_name;
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
set search_path = public
as $$
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return false;
  end if;

  update public.flashcard_students st
  set deleted_at = now()
  where st.name = trim(p_student_name)
    and st.deleted_at is null;

  return found;
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
set search_path = public
as $$
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return;
  end if;

  update public.flashcard_students st
  set access = coalesce(p_access, '{}'::jsonb)
  where st.name = trim(p_student_name)
    and st.deleted_at is null;

  return query
  select s.id, s.name, s.access, s.created_at, s.updated_at
  from public.flashcard_students s
  where s.name = trim(p_student_name)
    and s.deleted_at is null;
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
set search_path = public
as $$
declare
  v_student public.flashcard_students%rowtype;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return false;
  end if;

  if coalesce(p_new_password, '') = '' then
    raise exception 'New password is required.';
  end if;

  select *
  into v_student
  from public.flashcard_students st
  where st.name = trim(p_student_name)
    and st.deleted_at is null
  limit 1;

  if not found then
    return false;
  end if;

  update public.flashcard_students st
  set password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf'))
  where st.id = v_student.id;

  insert into public.flashcard_student_password_logs (student_id, student_name, changed_by)
  values (v_student.id, v_student.name, trim(p_admin_name));

  return true;
end;
$$;

create or replace function public.flashcard_admin_get_password_logs(
  p_admin_name text,
  p_admin_password text,
  p_student_name text
)
returns table(student_name text, changed_by text, changed_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return;
  end if;

  return query
  select l.student_name, l.changed_by, l.changed_at
  from public.flashcard_student_password_logs l
  where l.student_name = trim(p_student_name)
  order by l.changed_at desc;
end;
$$;

create or replace function public.flashcard_session_student_id(p_token uuid)
returns uuid
language sql
security definer
set search_path = public
as $$
  select s.student_id
  from public.flashcard_student_sessions s
  join public.flashcard_students st on st.id = s.student_id
  where s.token = p_token
    and s.expires_at > now()
    and st.deleted_at is null
  limit 1;
$$;

create or replace function public.flashcard_student_get_state(p_token uuid)
returns table(key text, value jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then
    return;
  end if;

  return query
  select s.key, s.value
  from public.flashcard_student_state s
  where s.student_id = v_student_id;
end;
$$;

create or replace function public.flashcard_student_upsert_state(p_token uuid, p_key text, p_value jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
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

create or replace function public.flashcard_student_delete_state(p_token uuid, p_key text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then
    return false;
  end if;

  delete from public.flashcard_student_state s
  where s.student_id = v_student_id
    and s.key = trim(p_key);

  return true;
end;
$$;

grant execute on function public.flashcard_admin_login(text, text) to authenticated;
grant execute on function public.flashcard_student_login(text, text) to authenticated;
grant execute on function public.flashcard_admin_list_students(text, text) to authenticated;
grant execute on function public.flashcard_admin_upsert_student(text, text, text, text, jsonb) to authenticated;
grant execute on function public.flashcard_admin_delete_student(text, text, text) to authenticated;
grant execute on function public.flashcard_admin_set_student_access(text, text, text, jsonb) to authenticated;
grant execute on function public.flashcard_admin_change_student_password(text, text, text, text) to authenticated;
grant execute on function public.flashcard_admin_get_password_logs(text, text, text) to authenticated;
grant execute on function public.flashcard_student_get_state(uuid) to authenticated;
grant execute on function public.flashcard_student_upsert_state(uuid, text, jsonb) to authenticated;
grant execute on function public.flashcard_student_delete_state(uuid, text) to authenticated;
