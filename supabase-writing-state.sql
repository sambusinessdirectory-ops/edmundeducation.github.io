-- EdmundEducation Writing Practice state layer
-- Run supabase-writing-accounts.sql first.

create extension if not exists pgcrypto;

create table if not exists public.writing_student_state (
  student_id uuid not null references public.writing_student_accounts(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (student_id, key)
);

alter table public.writing_student_state enable row level security;

create or replace function public.writing_state_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists writing_student_state_touch_updated_at on public.writing_student_state;
create trigger writing_student_state_touch_updated_at
before update on public.writing_student_state
for each row execute function public.writing_state_touch_updated_at();

create or replace function public.writing_student_get_state(p_token uuid)
returns table (
  key text,
  value jsonb,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_student_id uuid;
begin
  select student.id
  into v_student_id
  from public.writing_student_accounts student
  where student.session_token = p_token;

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
  where student.session_token = p_token;

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
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_student_id uuid;
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials';
  end if;

  select student.id
  into v_student_id
  from public.writing_student_accounts student
  where student.name = trim(p_student_name);

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
  v_student_id uuid;
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials';
  end if;

  select student.id
  into v_student_id
  from public.writing_student_accounts student
  where student.name = trim(p_student_name);

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

grant execute on function public.writing_student_get_state(uuid) to anon, authenticated;
grant execute on function public.writing_student_upsert_state(uuid, text, jsonb) to anon, authenticated;
grant execute on function public.writing_admin_get_student_state(text, text, text) to anon, authenticated;
grant execute on function public.writing_admin_upsert_student_state(text, text, text, text, jsonb) to anon, authenticated;
