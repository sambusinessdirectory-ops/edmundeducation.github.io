create extension if not exists pgcrypto with schema extensions;

create table if not exists public.flashcard_admins (
  name text primary key,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.flashcard_admins
  add column if not exists student_sort_mode text not null default 'custom';

create table if not exists public.flashcard_students (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text not null,
  access jsonb not null default '{}'::jsonb,
  sort_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table public.flashcard_students
  add column if not exists sort_order integer;

with ranked_students as (
  select
    s.id,
    row_number() over (order by s.created_at, s.id)::integer as next_sort_order
  from public.flashcard_students s
  where s.deleted_at is null
)
update public.flashcard_students s
set sort_order = ranked_students.next_sort_order
from ranked_students
where s.id = ranked_students.id
  and s.sort_order is null;

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

create or replace function public.flashcard_assign_student_sort_order()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.deleted_at is null and new.sort_order is null then
    select coalesce(max(s.sort_order), 0) + 1
    into new.sort_order
    from public.flashcard_students s
    where s.deleted_at is null
      and s.id is distinct from new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists flashcard_students_touch_updated_at on public.flashcard_students;
create trigger flashcard_students_touch_updated_at
before update on public.flashcard_students
for each row
execute function public.flashcard_touch_updated_at();

drop trigger if exists flashcard_students_assign_sort_order on public.flashcard_students;
create trigger flashcard_students_assign_sort_order
before insert or update of deleted_at, sort_order on public.flashcard_students
for each row
execute function public.flashcard_assign_student_sort_order();

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
  v_next_sort_order integer;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return;
  end if;

  if v_name = '' or coalesce(p_student_password, '') = '' then
    raise exception 'Student name and password are required.';
  end if;

  select coalesce(max(s.sort_order), 0) + 1
  into v_next_sort_order
  from public.flashcard_students s
  where s.deleted_at is null;

  insert into public.flashcard_students (name, password_hash, access, sort_order, deleted_at)
  values (
    v_name,
    extensions.crypt(p_student_password, extensions.gen_salt('bf')),
    coalesce(p_access, '{}'::jsonb),
    v_next_sort_order,
    null
  )
  on conflict on constraint flashcard_students_name_key do update
  set password_hash = excluded.password_hash,
      access = excluded.access,
      deleted_at = null,
      sort_order = coalesce(flashcard_students.sort_order, excluded.sort_order),
      updated_at = now();

  return query
  select s.id, s.name, s.access, s.created_at, s.updated_at
  from public.flashcard_students s
  where s.name = v_name;
end;
$$;

create or replace function public.flashcard_admin_get_student_list_preferences(
  p_admin_name text,
  p_admin_password text
)
returns table(sort_mode text, student_order jsonb)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return;
  end if;

  return query
  select
    case
      when a.student_sort_mode in ('asc', 'desc', 'custom') then a.student_sort_mode
      else 'custom'
    end,
    coalesce(
      (
        select jsonb_agg(s.name order by s.sort_order nulls last, s.created_at, s.name)
        from public.flashcard_students s
        where s.deleted_at is null
      ),
      '[]'::jsonb
    )
  from public.flashcard_admins a
  where a.name = p_admin_name;
end;
$$;

create or replace function public.flashcard_admin_set_student_sort_mode(
  p_admin_name text,
  p_admin_password text,
  p_sort_mode text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sort_mode text := lower(trim(coalesce(p_sort_mode, '')));
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return null;
  end if;

  if v_sort_mode not in ('asc', 'desc', 'custom') then
    raise exception 'Unsupported student sort mode.';
  end if;

  update public.flashcard_admins a
  set student_sort_mode = v_sort_mode
  where a.name = p_admin_name;

  return v_sort_mode;
end;
$$;

create or replace function public.flashcard_admin_reorder_students(
  p_admin_name text,
  p_admin_password text,
  p_student_names text[]
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_expected_count integer;
  v_submitted_count integer := coalesce(cardinality(p_student_names), 0);
  v_distinct_count integer;
  v_matching_count integer;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return false;
  end if;

  select count(*)::integer
  into v_expected_count
  from public.flashcard_students s
  where s.deleted_at is null;

  select count(distinct names.student_name)::integer
  into v_distinct_count
  from unnest(coalesce(p_student_names, array[]::text[])) as names(student_name);

  select count(*)::integer
  into v_matching_count
  from public.flashcard_students s
  join unnest(coalesce(p_student_names, array[]::text[])) as names(student_name)
    on names.student_name = s.name
  where s.deleted_at is null;

  if v_submitted_count <> v_expected_count
    or v_distinct_count <> v_submitted_count
    or v_matching_count <> v_expected_count
  then
    return false;
  end if;

  update public.flashcard_students s
  set sort_order = ordered.position::integer,
      updated_at = now()
  from unnest(p_student_names) with ordinality as ordered(student_name, position)
  where s.name = ordered.student_name
    and s.deleted_at is null;

  update public.flashcard_admins a
  set student_sort_mode = 'custom'
  where a.name = p_admin_name;

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

  return not exists (
    select 1
    from public.flashcard_students st
    where st.name = trim(p_student_name)
      and st.deleted_at is null
  );
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
set search_path = public
as $$
declare
  v_student_name text := trim(p_student_name);
  v_student_id uuid;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return false;
  end if;

  select st.id
  into v_student_id
  from public.flashcard_students st
  where st.name = v_student_name
  limit 1;

  if v_student_id is null then
    return true;
  end if;

  delete from public.flashcard_student_state s where s.student_id = v_student_id;
  delete from public.flashcard_student_sessions s where s.student_id = v_student_id;
  delete from public.flashcard_student_password_logs l where l.student_id = v_student_id;
  delete from public.flashcard_students st where st.id = v_student_id;

  return not exists (
    select 1
    from public.flashcard_students st
    where st.id = v_student_id
  );
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

create or replace function public.flashcard_admin_get_student_state(
  p_admin_name text,
  p_admin_password text,
  p_student_name text
)
returns table(key text, value jsonb, updated_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return;
  end if;

  return query
  select s.key, s.value, s.updated_at
  from public.flashcard_student_state s
  join public.flashcard_students st on st.id = s.student_id
  where st.name = trim(p_student_name)
    and st.deleted_at is null
  order by s.updated_at desc;
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
set search_path = public
as $$
declare
  v_student_id uuid;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return false;
  end if;

  select st.id into v_student_id
  from public.flashcard_students st
  where st.name = trim(p_student_name)
    and st.deleted_at is null
  limit 1;

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
revoke all on function public.flashcard_admin_get_student_list_preferences(text, text) from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_set_student_sort_mode(text, text, text) from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_reorder_students(text, text, text[]) from public, anon, authenticated, service_role;
grant execute on function public.flashcard_admin_get_student_list_preferences(text, text) to authenticated;
grant execute on function public.flashcard_admin_set_student_sort_mode(text, text, text) to authenticated;
grant execute on function public.flashcard_admin_reorder_students(text, text, text[]) to authenticated;
grant execute on function public.flashcard_admin_delete_student(text, text, text) to authenticated;
grant execute on function public.flashcard_admin_delete_student_with_state(text, text, text) to authenticated;
grant execute on function public.flashcard_admin_set_student_access(text, text, text, jsonb) to authenticated;
grant execute on function public.flashcard_admin_change_student_password(text, text, text, text) to authenticated;
grant execute on function public.flashcard_admin_get_password_logs(text, text, text) to authenticated;
grant execute on function public.flashcard_admin_get_student_state(text, text, text) to authenticated;
grant execute on function public.flashcard_admin_upsert_student_state(text, text, text, text, jsonb) to authenticated;
grant execute on function public.flashcard_student_get_state(uuid) to authenticated;
grant execute on function public.flashcard_student_upsert_state(uuid, text, jsonb) to authenticated;
grant execute on function public.flashcard_student_delete_state(uuid, text) to authenticated;
