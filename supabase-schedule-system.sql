-- EdmundEducation Homework & Revision Schedule System
-- Flashcard remains the master student-account system.

begin;

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if to_regclass('public.flashcard_students') is null then
    raise exception 'Missing dependency: public.flashcard_students';
  end if;
  if to_regclass('public.flashcard_student_sessions') is null then
    raise exception 'Missing dependency: public.flashcard_student_sessions';
  end if;
  if to_regprocedure('public.flashcard_session_student_id(uuid)') is null then
    raise exception 'Missing dependency: public.flashcard_session_student_id(uuid)';
  end if;
  if not exists (
    select 1
    from pg_catalog.pg_extension extension
    join pg_catalog.pg_namespace namespace on namespace.oid = extension.extnamespace
    where extension.extname = 'pgcrypto'
      and namespace.nspname = 'extensions'
  ) then
    raise exception 'pgcrypto must be installed in the extensions schema';
  end if;
end;
$$;

create table if not exists public.schedule_admin_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists schedule_admin_accounts_name_lower_idx
  on public.schedule_admin_accounts (lower(name));

create table if not exists public.schedule_admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null references public.schedule_admin_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > created_at)
);

create index if not exists schedule_admin_sessions_expires_idx
  on public.schedule_admin_sessions (expires_at);

create table if not exists public.schedule_worker_secrets (
  name text primary key check (name = 'schedule-worker'),
  secret_hash bytea not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.schedule_day_capacity (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  schedule_date date not null,
  slot_count smallint not null default 10,
  updated_at timestamptz not null default now(),
  primary key (student_id, schedule_date),
  check (schedule_date between date '2026-01-01' and date '2050-12-31'),
  check (slot_count between 10 and 100),
  check (mod(slot_count, 5) = 0)
);

create table if not exists public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  schedule_date date not null,
  slot_index smallint not null,
  message text not null,
  source text not null default 'student',
  created_by_admin uuid references public.schedule_admin_accounts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, schedule_date, slot_index),
  check (schedule_date between date '2026-01-01' and date '2050-12-31'),
  check (slot_index between 1 and 100),
  check (source in ('student', 'admin')),
  check (char_length(btrim(message)) between 1 and 2000)
);

create index if not exists schedule_entries_student_week_idx
  on public.schedule_entries (student_id, schedule_date, slot_index);

alter table public.schedule_admin_accounts enable row level security;
alter table public.schedule_admin_sessions enable row level security;
alter table public.schedule_worker_secrets enable row level security;
alter table public.schedule_day_capacity enable row level security;
alter table public.schedule_entries enable row level security;

revoke all on table public.schedule_admin_accounts from public, anon, authenticated;
revoke all on table public.schedule_admin_sessions from public, anon, authenticated;
revoke all on table public.schedule_worker_secrets from public, anon, authenticated;
revoke all on table public.schedule_day_capacity from public, anon, authenticated;
revoke all on table public.schedule_entries from public, anon, authenticated;

-- Provision the first administrator bcrypt and the Worker-secret SHA-256
-- separately during deployment. Credentials intentionally do not live here.

create or replace function public.schedule_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.schedule_touch_updated_at() from public, anon, authenticated;

drop trigger if exists schedule_admin_accounts_touch_updated_at on public.schedule_admin_accounts;
create trigger schedule_admin_accounts_touch_updated_at
before update on public.schedule_admin_accounts
for each row execute function public.schedule_touch_updated_at();

drop trigger if exists schedule_day_capacity_touch_updated_at on public.schedule_day_capacity;
create trigger schedule_day_capacity_touch_updated_at
before update on public.schedule_day_capacity
for each row execute function public.schedule_touch_updated_at();

drop trigger if exists schedule_entries_touch_updated_at on public.schedule_entries;
create trigger schedule_entries_touch_updated_at
before update on public.schedule_entries
for each row execute function public.schedule_touch_updated_at();

create or replace function public._schedule_admin_id(p_admin_token uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select session.admin_id
  from public.schedule_admin_sessions session
  where session.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session.expires_at > now()
  limit 1;
$$;

revoke all on function public._schedule_admin_id(uuid) from public, anon, authenticated;

create or replace function public._schedule_worker_ok(p_service_secret text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(length(p_service_secret), 0) >= 32
    and exists (
      select 1
      from public.schedule_worker_secrets secret
      where secret.name = 'schedule-worker'
        and secret.secret_hash = extensions.digest(p_service_secret, 'sha256')
    );
$$;

revoke all on function public._schedule_worker_ok(text) from public, anon, authenticated;

create or replace function public._schedule_week_start_valid(p_week_start date)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_week_start is not null
    and extract(isodow from p_week_start) = 1
    and p_week_start <= date '2050-12-31'
    and p_week_start + 6 >= date '2026-01-01';
$$;

revoke all on function public._schedule_week_start_valid(date) from public, anon, authenticated;

create or replace function public._schedule_week_payload(
  p_student_id uuid,
  p_week_start date
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with days as (
    select series.day::date as schedule_date
    from pg_catalog.generate_series(
      p_week_start::timestamp,
      (p_week_start + 6)::timestamp,
      interval '1 day'
    ) as series(day)
  ), capacities as (
    select
      day.schedule_date,
      case
        when day.schedule_date between date '2026-01-01' and date '2050-12-31'
          then coalesce(capacity.slot_count, 10)
        else 0
      end as slot_count
    from days day
    left join public.schedule_day_capacity capacity
      on capacity.student_id = p_student_id
     and capacity.schedule_date = day.schedule_date
  ), week_entries as (
    select entry.*
    from public.schedule_entries entry
    where entry.student_id = p_student_id
      and entry.schedule_date between p_week_start and p_week_start + 6
  )
  select pg_catalog.jsonb_build_object(
    'weekStart', p_week_start,
    'capacities', (
      select pg_catalog.jsonb_object_agg(
        pg_catalog.to_char(capacity.schedule_date, 'YYYY-MM-DD'),
        capacity.slot_count
        order by capacity.schedule_date
      )
      from capacities capacity
    ),
    'entries', coalesce((
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object(
          'id', entry.id,
          'scheduleDate', pg_catalog.to_char(entry.schedule_date, 'YYYY-MM-DD'),
          'slotIndex', entry.slot_index,
          'message', entry.message,
          'source', entry.source,
          'updatedAt', entry.updated_at
        )
        order by entry.schedule_date, entry.slot_index
      )
      from week_entries entry
    ), '[]'::jsonb)
  );
$$;

revoke all on function public._schedule_week_payload(uuid, date) from public, anon, authenticated;

-- Remove pre-concurrency overloads if an earlier development migration was run.
drop function if exists public._schedule_upsert_entry(uuid, date, integer, text, text, uuid);

create or replace function public._schedule_upsert_entry(
  p_student_id uuid,
  p_schedule_date date,
  p_slot_index integer,
  p_message text,
  p_expected_updated_at timestamptz,
  p_source text,
  p_admin_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_capacity integer;
  v_entry public.schedule_entries%rowtype;
  v_existing public.schedule_entries%rowtype;
  v_message text := btrim(coalesce(p_message, ''));
begin
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;

  if p_schedule_date is null
    or p_schedule_date not between date '2026-01-01' and date '2050-12-31'
  then
    raise exception 'Schedule date is outside the supported range';
  end if;

  if p_slot_index is null or p_slot_index not between 1 and 100 then
    raise exception 'Invalid schedule slot';
  end if;

  if char_length(v_message) not between 1 and 2000 then
    raise exception 'Message must contain between 1 and 2000 characters';
  end if;

  if p_source not in ('student', 'admin')
    or (p_source = 'admin' and p_admin_id is null)
  then
    raise exception 'Invalid schedule source';
  end if;

  select coalesce(capacity.slot_count, 10)
  into v_capacity
  from (select 1) seed
  left join public.schedule_day_capacity capacity
    on capacity.student_id = p_student_id
   and capacity.schedule_date = p_schedule_date;

  if p_slot_index > v_capacity then
    raise exception 'Add more slots before saving in this position';
  end if;

  select *
  into v_existing
  from public.schedule_entries entry
  where entry.student_id = p_student_id
    and entry.schedule_date = p_schedule_date
    and entry.slot_index = p_slot_index
  for update;

  if found then
    if p_expected_updated_at is null or v_existing.updated_at <> p_expected_updated_at then
      raise exception 'Schedule entry changed in another session; reload and try again';
    end if;
    if p_source = 'student' and v_existing.source = 'admin' then
      raise exception 'Teacher assignments can only be changed by an administrator';
    end if;

    update public.schedule_entries entry
    set message = v_message,
        source = p_source,
        created_by_admin = case when p_source = 'admin' then p_admin_id else null end,
        updated_at = now()
    where entry.id = v_existing.id
      and entry.updated_at = p_expected_updated_at
    returning * into v_entry;
  else
    if p_expected_updated_at is not null then
      raise exception 'Schedule entry changed in another session; reload and try again';
    end if;

    insert into public.schedule_entries (
      student_id,
      schedule_date,
      slot_index,
      message,
      source,
      created_by_admin
    )
    values (
      p_student_id,
      p_schedule_date,
      p_slot_index,
      v_message,
      p_source,
      case when p_source = 'admin' then p_admin_id else null end
    )
    on conflict (student_id, schedule_date, slot_index) do nothing
    returning * into v_entry;
  end if;

  if v_entry.id is null then
    raise exception 'Schedule entry changed in another session; reload and try again';
  end if;

  return pg_catalog.jsonb_build_object(
    'id', v_entry.id,
    'scheduleDate', pg_catalog.to_char(v_entry.schedule_date, 'YYYY-MM-DD'),
    'slotIndex', v_entry.slot_index,
    'message', v_entry.message,
    'source', v_entry.source,
    'updatedAt', v_entry.updated_at
  );
end;
$$;

revoke all on function public._schedule_upsert_entry(uuid, date, integer, text, timestamptz, text, uuid)
  from public, anon, authenticated;

drop function if exists public._schedule_delete_entry(uuid, date, integer);

create or replace function public._schedule_delete_entry(
  p_student_id uuid,
  p_schedule_date date,
  p_slot_index integer,
  p_expected_updated_at timestamptz,
  p_actor_source text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entry public.schedule_entries%rowtype;
begin
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    return false;
  end if;

  select *
  into v_entry
  from public.schedule_entries entry
  where entry.student_id = p_student_id
    and entry.schedule_date = p_schedule_date
    and entry.slot_index = p_slot_index
  for update;

  if not found then
    return false;
  end if;
  if p_expected_updated_at is null or v_entry.updated_at <> p_expected_updated_at then
    raise exception 'Schedule entry changed in another session; reload and try again';
  end if;
  if p_actor_source = 'student' and v_entry.source = 'admin' then
    raise exception 'Teacher assignments can only be deleted by an administrator';
  end if;

  delete from public.schedule_entries entry
  where entry.id = v_entry.id
    and entry.updated_at = p_expected_updated_at;

  return found;
end;
$$;

revoke all on function public._schedule_delete_entry(uuid, date, integer, timestamptz, text)
  from public, anon, authenticated;

create or replace function public._schedule_add_slots(
  p_student_id uuid,
  p_schedule_date date
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_slot_count integer;
begin
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;

  if p_schedule_date is null
    or p_schedule_date not between date '2026-01-01' and date '2050-12-31'
  then
    raise exception 'Schedule date is outside the supported range';
  end if;

  insert into public.schedule_day_capacity (student_id, schedule_date, slot_count)
  values (p_student_id, p_schedule_date, 15)
  on conflict (student_id, schedule_date) do update
  set slot_count = least(100, public.schedule_day_capacity.slot_count + 5),
      updated_at = now()
  returning slot_count into v_slot_count;

  return v_slot_count;
end;
$$;

revoke all on function public._schedule_add_slots(uuid, date)
  from public, anon, authenticated;

create or replace function public.schedule_admin_login(
  p_service_secret text,
  p_name text,
  p_password text
)
returns table (admin_token uuid, name text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin public.schedule_admin_accounts%rowtype;
  v_admin_key text := lower(btrim(coalesce(p_name, '')));
  v_now timestamptz := clock_timestamp();
  v_token uuid := gen_random_uuid();
  v_expires_at timestamptz := v_now + interval '8 hours';
begin
  if not public._schedule_worker_ok(p_service_secret)
    or v_admin_key = ''
    or length(v_admin_key) > 100
    or p_password is null
    or length(p_password) > 200
  then
    return;
  end if;

  select *
  into v_admin
  from public.schedule_admin_accounts admin
  where lower(admin.name) = v_admin_key
    and admin.password_hash = extensions.crypt(p_password, admin.password_hash)
  limit 1;

  if not found then
    return;
  end if;

  delete from public.schedule_admin_sessions session
  where session.expires_at <= v_now;

  insert into public.schedule_admin_sessions (token_hash, admin_id, expires_at)
  values (extensions.digest(v_token::text, 'sha256'), v_admin.id, v_expires_at);

  return query select v_token, v_admin.name, v_expires_at;
end;
$$;

create or replace function public.schedule_admin_me(p_admin_token uuid)
returns table (name text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select admin.name, session.expires_at
  from public.schedule_admin_sessions session
  join public.schedule_admin_accounts admin on admin.id = session.admin_id
  where session.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session.expires_at > now()
  limit 1;
$$;

create or replace function public.schedule_admin_logout(p_admin_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.schedule_admin_sessions session
  where session.token_hash = extensions.digest(p_admin_token::text, 'sha256');
  return found;
end;
$$;

create or replace function public.schedule_student_profile(p_token uuid)
returns table (id uuid, name text)
language plpgsql
stable
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
  select student.id, student.name
  from public.flashcard_students student
  where student.id = v_student_id
    and student.deleted_at is null;
end;
$$;

create or replace function public.schedule_student_logout(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.flashcard_student_sessions session
  where session.token = p_token;
  return found;
end;
$$;

create or replace function public.schedule_student_get_week(
  p_token uuid,
  p_week_start date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then
    return null;
  end if;
  if not public._schedule_week_start_valid(p_week_start) then
    raise exception 'Invalid week';
  end if;
  return public._schedule_week_payload(v_student_id, p_week_start);
end;
$$;

drop function if exists public.schedule_student_upsert_entry(uuid, date, integer, text);

create or replace function public.schedule_student_upsert_entry(
  p_token uuid,
  p_schedule_date date,
  p_slot_index integer,
  p_message text,
  p_expected_updated_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then
    raise exception 'Invalid or expired student session';
  end if;
  return public._schedule_upsert_entry(
    v_student_id,
    p_schedule_date,
    p_slot_index,
    p_message,
    p_expected_updated_at,
    'student',
    null
  );
end;
$$;

drop function if exists public.schedule_student_delete_entry(uuid, date, integer);

create or replace function public.schedule_student_delete_entry(
  p_token uuid,
  p_schedule_date date,
  p_slot_index integer,
  p_expected_updated_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then
    raise exception 'Invalid or expired student session';
  end if;
  return public._schedule_delete_entry(
    v_student_id,
    p_schedule_date,
    p_slot_index,
    p_expected_updated_at,
    'student'
  );
end;
$$;

create or replace function public.schedule_student_add_slots(
  p_token uuid,
  p_schedule_date date
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then
    raise exception 'Invalid or expired student session';
  end if;
  return public._schedule_add_slots(v_student_id, p_schedule_date);
end;
$$;

create or replace function public.schedule_admin_list_students(p_admin_token uuid)
returns table (id uuid, name text, created_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;

  return query
  select student.id, student.name, student.created_at
  from public.flashcard_students student
  where student.deleted_at is null
  order by lower(student.name), student.created_at;
end;
$$;

create or replace function public.schedule_admin_get_week(
  p_admin_token uuid,
  p_student_id uuid,
  p_week_start date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;
  if not public._schedule_week_start_valid(p_week_start) then
    raise exception 'Invalid week';
  end if;
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;
  return public._schedule_week_payload(p_student_id, p_week_start);
end;
$$;

drop function if exists public.schedule_admin_upsert_entry(uuid, uuid, date, integer, text);

create or replace function public.schedule_admin_upsert_entry(
  p_admin_token uuid,
  p_student_id uuid,
  p_schedule_date date,
  p_slot_index integer,
  p_message text,
  p_expected_updated_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session';
  end if;
  return public._schedule_upsert_entry(
    p_student_id,
    p_schedule_date,
    p_slot_index,
    p_message,
    p_expected_updated_at,
    'admin',
    v_admin_id
  );
end;
$$;

drop function if exists public.schedule_admin_delete_entry(uuid, uuid, date, integer);

create or replace function public.schedule_admin_delete_entry(
  p_admin_token uuid,
  p_student_id uuid,
  p_schedule_date date,
  p_slot_index integer,
  p_expected_updated_at timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;
  return public._schedule_delete_entry(
    p_student_id,
    p_schedule_date,
    p_slot_index,
    p_expected_updated_at,
    'admin'
  );
end;
$$;

create or replace function public.schedule_admin_add_slots(
  p_admin_token uuid,
  p_student_id uuid,
  p_schedule_date date
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;
  return public._schedule_add_slots(p_student_id, p_schedule_date);
end;
$$;

revoke all on function public.schedule_admin_login(text, text, text) from public, anon, authenticated;
revoke all on function public.schedule_admin_me(uuid) from public, anon, authenticated;
revoke all on function public.schedule_admin_logout(uuid) from public, anon, authenticated;
revoke all on function public.schedule_student_profile(uuid) from public, anon, authenticated;
revoke all on function public.schedule_student_logout(uuid) from public, anon, authenticated;
revoke all on function public.schedule_student_get_week(uuid, date) from public, anon, authenticated;
revoke all on function public.schedule_student_upsert_entry(uuid, date, integer, text, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_student_delete_entry(uuid, date, integer, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_student_add_slots(uuid, date) from public, anon, authenticated;
revoke all on function public.schedule_admin_list_students(uuid) from public, anon, authenticated;
revoke all on function public.schedule_admin_get_week(uuid, uuid, date) from public, anon, authenticated;
revoke all on function public.schedule_admin_upsert_entry(uuid, uuid, date, integer, text, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_admin_delete_entry(uuid, uuid, date, integer, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_admin_add_slots(uuid, uuid, date) from public, anon, authenticated;

-- The rate-limited Worker supplies the private service secret.
grant execute on function public.schedule_admin_login(text, text, text) to anon;

grant execute on function public.schedule_admin_me(uuid) to authenticated;
grant execute on function public.schedule_admin_logout(uuid) to authenticated;
grant execute on function public.schedule_admin_list_students(uuid) to authenticated;
grant execute on function public.schedule_admin_get_week(uuid, uuid, date) to authenticated;
grant execute on function public.schedule_admin_upsert_entry(uuid, uuid, date, integer, text, timestamptz) to authenticated;
grant execute on function public.schedule_admin_delete_entry(uuid, uuid, date, integer, timestamptz) to authenticated;
grant execute on function public.schedule_admin_add_slots(uuid, uuid, date) to authenticated;

grant execute on function public.schedule_student_profile(uuid) to authenticated;
grant execute on function public.schedule_student_logout(uuid) to authenticated;
grant execute on function public.schedule_student_get_week(uuid, date) to authenticated;
grant execute on function public.schedule_student_upsert_entry(uuid, date, integer, text, timestamptz) to authenticated;
grant execute on function public.schedule_student_delete_entry(uuid, date, integer, timestamptz) to authenticated;
grant execute on function public.schedule_student_add_slots(uuid, date) to authenticated;

notify pgrst, 'reload schema';

commit;
