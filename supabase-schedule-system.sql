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
  if to_regclass('public.flashcard_student_state') is null then
    raise exception 'Missing dependency: public.flashcard_student_state';
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
  version bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (student_id, schedule_date),
  check (schedule_date between date '2026-01-01' and date '2050-12-31'),
  check (slot_count between 10 and 100),
  check (mod(slot_count, 5) = 0),
  check (version >= 0)
);

create table if not exists public.schedule_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  schedule_date date not null,
  slot_index smallint not null,
  message text not null,
  source text not null default 'student',
  created_by_admin uuid references public.schedule_admin_accounts(id) on delete set null,
  is_completed boolean not null default false,
  completed_at timestamptz,
  completion_source text,
  completed_by_admin uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, schedule_date, slot_index),
  check (schedule_date between date '2026-01-01' and date '2050-12-31'),
  check (slot_index between 1 and 100),
  check (source in ('student', 'admin')),
  check (char_length(btrim(message)) between 1 and 2000)
);

create table if not exists public.schedule_countdown_capacity (
  student_id uuid primary key references public.flashcard_students(id) on delete cascade,
  clock_count smallint not null default 6,
  updated_at timestamptz not null default now(),
  check (clock_count between 6 and 101),
  check (mod(clock_count - 6, 5) = 0)
);

create table if not exists public.schedule_countdowns (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  position smallint not null,
  title text not null,
  start_date date not null,
  end_date date not null,
  daily_hours numeric(5,2) not null default 0,
  morning_hours numeric(5,2) not null default 0,
  afternoon_hours numeric(5,2) not null default 0,
  evening_hours numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, position),
  check (position between 1 and 101),
  check (char_length(btrim(title)) between 1 and 160),
  check (start_date between date '2026-01-01' and date '2050-12-31'),
  check (end_date between start_date and date '2050-12-31'),
  check (daily_hours between 0 and 24),
  check (morning_hours between 0 and 24),
  check (afternoon_hours between 0 and 24),
  check (evening_hours between 0 and 24)
);

-- The first countdown row now contains six cards, while subsequent controls
-- continue to add or remove five. Existing 5/10/15… capacities move to
-- 6/11/16… without deleting or renumbering any saved countdown.
alter table public.schedule_countdown_capacity
  drop constraint if exists schedule_countdown_capacity_clock_count_check;
alter table public.schedule_countdown_capacity
  drop constraint if exists schedule_countdown_capacity_clock_count_check1;
alter table public.schedule_countdown_capacity
  alter column clock_count set default 6;

update public.schedule_countdown_capacity capacity
set clock_count = least(101, capacity.clock_count + 1),
    updated_at = now()
where mod(capacity.clock_count, 5) = 0;

alter table public.schedule_countdown_capacity
  add constraint schedule_countdown_capacity_clock_count_check
  check (clock_count between 6 and 101);
alter table public.schedule_countdown_capacity
  add constraint schedule_countdown_capacity_clock_count_check1
  check (mod(clock_count - 6, 5) = 0);

alter table public.schedule_countdowns
  drop constraint if exists schedule_countdowns_position_check;
alter table public.schedule_countdowns
  add constraint schedule_countdowns_position_check
  check (position between 1 and 101);

alter table public.schedule_day_capacity
  add column if not exists version bigint not null default 0;

alter table public.schedule_entries
  add column if not exists is_completed boolean not null default false;
alter table public.schedule_entries
  add column if not exists completed_at timestamptz;
alter table public.schedule_entries
  add column if not exists completion_source text;
alter table public.schedule_entries
  add column if not exists completed_by_admin uuid;
alter table public.schedule_entries
  add column if not exists is_in_progress boolean not null default false;
alter table public.schedule_entries
  add column if not exists is_previous_incomplete boolean not null default false;
alter table public.schedule_entries
  add column if not exists estimated_minutes integer;
alter table public.schedule_entries
  add column if not exists span_group_id uuid;

alter table public.schedule_entries
  drop constraint if exists schedule_entries_completed_by_admin_fkey;
alter table public.schedule_entries
  add constraint schedule_entries_completed_by_admin_fkey
  foreign key (completed_by_admin)
  references public.schedule_admin_accounts(id)
  on delete restrict;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = 'public.schedule_day_capacity'::regclass
      and constraint_row.conname = 'schedule_day_capacity_version_check'
  ) then
    alter table public.schedule_day_capacity
      add constraint schedule_day_capacity_version_check check (version >= 0);
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = 'public.schedule_entries'::regclass
      and constraint_row.conname = 'schedule_entries_completion_state_check'
  ) then
    alter table public.schedule_entries
      add constraint schedule_entries_completion_state_check check (
        (
          not is_completed
          and completed_at is null
          and completion_source is null
          and completed_by_admin is null
        )
        or
        (
          is_completed
          and completed_at is not null
          and completion_source is not null
          and (
            (completion_source = 'student' and completed_by_admin is null)
            or
            (completion_source = 'admin' and completed_by_admin is not null)
          )
        )
      );
  end if;

  alter table public.schedule_entries
    drop constraint if exists schedule_entries_progress_state_check;
  alter table public.schedule_entries
    add constraint schedule_entries_progress_state_check check (
      (is_completed::integer + is_in_progress::integer + is_previous_incomplete::integer) <= 1
    );

  if not exists (
    select 1 from pg_catalog.pg_constraint constraint_row
    where constraint_row.conrelid = 'public.schedule_entries'::regclass
      and constraint_row.conname = 'schedule_entries_estimated_minutes_check'
  ) then
    alter table public.schedule_entries
      add constraint schedule_entries_estimated_minutes_check check (
        estimated_minutes is null or estimated_minutes between 1 and 10080
      );
  end if;
end;
$$;

create index if not exists schedule_entries_student_week_idx
  on public.schedule_entries (student_id, schedule_date, slot_index);

create index if not exists schedule_entries_student_completed_idx
  on public.schedule_entries (student_id, schedule_date)
  where is_completed;

create index if not exists schedule_entries_span_group_idx
  on public.schedule_entries (student_id, span_group_id, schedule_date)
  where span_group_id is not null;

create index if not exists schedule_countdowns_student_position_idx
  on public.schedule_countdowns (student_id, position);

alter table public.schedule_admin_accounts enable row level security;
alter table public.schedule_admin_sessions enable row level security;
alter table public.schedule_worker_secrets enable row level security;
alter table public.schedule_day_capacity enable row level security;
alter table public.schedule_entries enable row level security;
alter table public.schedule_countdown_capacity enable row level security;
alter table public.schedule_countdowns enable row level security;

revoke all on table public.schedule_admin_accounts from public, anon, authenticated;
revoke all on table public.schedule_admin_sessions from public, anon, authenticated;
revoke all on table public.schedule_worker_secrets from public, anon, authenticated;
revoke all on table public.schedule_day_capacity from public, anon, authenticated;
revoke all on table public.schedule_entries from public, anon, authenticated;
revoke all on table public.schedule_countdown_capacity from public, anon, authenticated;
revoke all on table public.schedule_countdowns from public, anon, authenticated;

-- Retire the pre-versioning capacity endpoints. The current page uses the
-- compare-and-swap change-capacity RPCs below.
drop function if exists public.schedule_student_add_slots(uuid, date);
drop function if exists public.schedule_admin_add_slots(uuid, uuid, date);
drop function if exists public._schedule_add_slots(uuid, date);

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

drop trigger if exists schedule_countdown_capacity_touch_updated_at on public.schedule_countdown_capacity;
create trigger schedule_countdown_capacity_touch_updated_at
before update on public.schedule_countdown_capacity
for each row execute function public.schedule_touch_updated_at();

drop trigger if exists schedule_countdowns_touch_updated_at on public.schedule_countdowns;
create trigger schedule_countdowns_touch_updated_at
before update on public.schedule_countdowns
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

-- Schedule-only properties share the Flashcard display-preference document.
-- The reader tolerates missing or malformed properties and exposes safe defaults.
create or replace function public._schedule_display_preferences(p_student_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'hideUnused', coalesce(
      case
        when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleHideUnused') = 'boolean'
          then (student_state.value ->> 'scheduleHideUnused')::boolean
        else false
      end,
      false
    ),
    'hideMascots', coalesce(
      case
        when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleHideMascots') = 'boolean'
          then (student_state.value ->> 'scheduleHideMascots')::boolean
        else false
      end,
      false
    )
  )
  from (select 1) seed
  left join public.flashcard_student_state student_state
    on student_state.student_id = p_student_id
   and student_state.key = 'edmundStudentDisplayPreferences';
$$;

revoke all on function public._schedule_display_preferences(uuid)
  from public, anon, authenticated;

-- Serialize all mutations for one student before any row-level locks are
-- acquired. This gives span, swap, capacity and countdown helpers one stable
-- lock order while still allowing different students to update concurrently.
create or replace function public._schedule_lock_student_mutations(p_student_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if p_student_id is null then
    raise exception 'Student is required' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('edmund-schedule:' || p_student_id::text, 0)
  );
end;
$$;

revoke all on function public._schedule_lock_student_mutations(uuid)
  from public, anon, authenticated;

-- A row-level UPSERT merges only validated schedule properties into the latest
-- JSON document, so concurrent one-property patches retain unrelated settings.
create or replace function public._schedule_set_display_preferences(
  p_student_id uuid,
  p_patch jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_storage_patch jsonb := '{}'::jsonb;
  v_merged_value jsonb;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;

  if p_patch is null
    or pg_catalog.jsonb_typeof(p_patch) <> 'object'
    or p_patch = '{}'::jsonb
  then
    raise exception 'Display-preference patch must be a non-empty JSON object'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_object_keys(p_patch) patch_key(key)
    where patch_key.key not in ('hideUnused', 'hideMascots')
  ) then
    raise exception 'Display-preference patch contains an unsupported property'
      using errcode = '22023';
  end if;

  if (p_patch ? 'hideUnused'
      and pg_catalog.jsonb_typeof(p_patch -> 'hideUnused') <> 'boolean')
    or (p_patch ? 'hideMascots'
      and pg_catalog.jsonb_typeof(p_patch -> 'hideMascots') <> 'boolean')
  then
    raise exception 'Display-preference values must be boolean'
      using errcode = '22023';
  end if;

  if p_patch ? 'hideUnused' then
    v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object(
      'scheduleHideUnused',
      p_patch -> 'hideUnused'
    );
  end if;
  if p_patch ? 'hideMascots' then
    v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object(
      'scheduleHideMascots',
      p_patch -> 'hideMascots'
    );
  end if;

  insert into public.flashcard_student_state as state (student_id, key, value)
  values (
    p_student_id,
    'edmundStudentDisplayPreferences',
    v_storage_patch
  )
  on conflict (student_id, key) do update
  set value = case
    when pg_catalog.jsonb_typeof(state.value) = 'object'
      then state.value || excluded.value
    else excluded.value
  end
  returning value into v_merged_value;

  return pg_catalog.jsonb_build_object(
    'hideUnused', coalesce(
      case
        when pg_catalog.jsonb_typeof(v_merged_value -> 'scheduleHideUnused') = 'boolean'
          then (v_merged_value ->> 'scheduleHideUnused')::boolean
        else false
      end,
      false
    ),
    'hideMascots', coalesce(
      case
        when pg_catalog.jsonb_typeof(v_merged_value -> 'scheduleHideMascots') = 'boolean'
          then (v_merged_value ->> 'scheduleHideMascots')::boolean
        else false
      end,
      false
    )
  );
end;
$$;

revoke all on function public._schedule_set_display_preferences(uuid, jsonb)
  from public, anon, authenticated;

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
  ), all_metrics as (
    select
      count(*)::integer as total_goals,
      count(*) filter (where entry.is_completed)::integer as total_completed
    from public.schedule_entries entry
    where entry.student_id = p_student_id
  )
  select pg_catalog.jsonb_build_object(
    'weekStart', p_week_start,
    'displayPreferences', public._schedule_display_preferences(p_student_id),
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
          'isCompleted', entry.is_completed,
          'completedAt', entry.completed_at,
          'completionSource', entry.completion_source,
          'updatedAt', entry.updated_at
        )
        order by entry.schedule_date, entry.slot_index
      )
      from week_entries entry
    ), '[]'::jsonb),
    'metrics', pg_catalog.jsonb_build_object(
      'weekGoals', (select count(*)::integer from week_entries),
      'totalGoals', (select metric.total_goals from all_metrics metric),
      'weekCompleted', (
        select count(*)::integer
        from week_entries entry
        where entry.is_completed
      ),
      'totalCompleted', (select metric.total_completed from all_metrics metric)
    ),
    'capacityVersions', (
      select pg_catalog.jsonb_object_agg(
        pg_catalog.to_char(day.schedule_date, 'YYYY-MM-DD'),
        coalesce(capacity.version, 0)
        order by day.schedule_date
      )
      from days day
      left join public.schedule_day_capacity capacity
        on capacity.student_id = p_student_id
       and capacity.schedule_date = day.schedule_date
    )
  );
$$;

revoke all on function public._schedule_week_payload(uuid, date) from public, anon, authenticated;

create or replace function public._schedule_upsert_entry(
  p_student_id uuid,
  p_schedule_date date,
  p_slot_index integer,
  p_message text,
  p_estimated_minutes integer,
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
  v_result jsonb;
  v_entry public.schedule_entries%rowtype;
begin
  if p_estimated_minutes is not null and p_estimated_minutes not between 1 and 10080 then
    raise exception 'Estimated minutes must be between 1 and 10080' using errcode = '22023';
  end if;

  v_result := public._schedule_upsert_entry(
    p_student_id, p_schedule_date, p_slot_index, p_message,
    p_expected_updated_at, p_source, p_admin_id
  );

  select * into v_entry
  from public.schedule_entries entry
  where entry.id = (v_result ->> 'id')::uuid
  for update;

  if v_entry.span_group_id is not null then
    perform 1 from public.schedule_entries entry
    where entry.student_id = p_student_id and entry.span_group_id = v_entry.span_group_id
    order by entry.id for update;
  end if;

  update public.schedule_entries entry
  set message = v_entry.message,
      source = v_entry.source,
      created_by_admin = v_entry.created_by_admin,
      estimated_minutes = p_estimated_minutes,
      is_completed = v_entry.is_completed,
      is_in_progress = case when v_entry.is_completed then false else v_entry.is_in_progress end,
      is_previous_incomplete = case
        when v_entry.is_completed or v_entry.is_in_progress then false
        else v_entry.is_previous_incomplete
      end,
      completed_at = v_entry.completed_at,
      completion_source = v_entry.completion_source,
      completed_by_admin = v_entry.completed_by_admin,
      updated_at = now()
  where entry.id = v_entry.id
     or (v_entry.span_group_id is not null and entry.span_group_id = v_entry.span_group_id);

  select * into v_entry from public.schedule_entries entry where entry.id = v_entry.id;
  return pg_catalog.jsonb_build_object(
    'id', v_entry.id,
    'scheduleDate', pg_catalog.to_char(v_entry.schedule_date, 'YYYY-MM-DD'),
    'slotIndex', v_entry.slot_index,
    'message', v_entry.message,
    'source', v_entry.source,
    'isCompleted', v_entry.is_completed,
    'isInProgress', v_entry.is_in_progress,
    'isPreviousIncomplete', v_entry.is_previous_incomplete,
    'estimatedMinutes', v_entry.estimated_minutes,
    'spanGroupId', v_entry.span_group_id,
    'completedAt', v_entry.completed_at,
    'completionSource', v_entry.completion_source,
    'updatedAt', v_entry.updated_at
  );
end;
$$;

revoke all on function public._schedule_upsert_entry(uuid, date, integer, text, integer, timestamptz, text, uuid)
  from public, anon, authenticated;

create or replace function public.schedule_student_upsert_entry(
  p_token uuid,
  p_schedule_date date,
  p_slot_index integer,
  p_message text,
  p_estimated_minutes integer,
  p_expected_updated_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then raise exception 'Invalid or expired student session'; end if;
  return public._schedule_upsert_entry(
    v_student_id, p_schedule_date, p_slot_index, p_message, p_estimated_minutes,
    p_expected_updated_at, 'student', null
  );
end;
$$;

create or replace function public.schedule_admin_upsert_entry(
  p_admin_token uuid,
  p_student_id uuid,
  p_schedule_date date,
  p_slot_index integer,
  p_message text,
  p_estimated_minutes integer,
  p_expected_updated_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_admin_id uuid := public._schedule_admin_id(p_admin_token);
begin
  if v_admin_id is null then raise exception 'Invalid or expired admin session'; end if;
  return public._schedule_upsert_entry(
    p_student_id, p_schedule_date, p_slot_index, p_message, p_estimated_minutes,
    p_expected_updated_at, 'admin', v_admin_id
  );
end;
$$;

create or replace function public._schedule_set_entry_in_progress(
  p_student_id uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_in_progress boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_entry public.schedule_entries%rowtype;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if p_in_progress is null then raise exception 'Invalid progress request' using errcode = '22023'; end if;
  select * into v_entry
  from public.schedule_entries entry
  where entry.student_id = p_student_id and entry.id = p_entry_id
  for update;
  if not found then raise exception 'Schedule entry not found'; end if;
  if p_expected_updated_at is null or v_entry.updated_at <> p_expected_updated_at then
    raise exception 'Schedule entry changed in another session; reload and try again' using errcode = '40001';
  end if;
  if v_entry.span_group_id is not null then
    perform 1 from public.schedule_entries entry
    where entry.student_id = p_student_id and entry.span_group_id = v_entry.span_group_id
    order by entry.id for update;
  end if;

  update public.schedule_entries entry
  set is_in_progress = p_in_progress,
      is_completed = case when p_in_progress then false else entry.is_completed end,
      is_previous_incomplete = case when p_in_progress then false else entry.is_previous_incomplete end,
      completed_at = case when p_in_progress then null else entry.completed_at end,
      completion_source = case when p_in_progress then null else entry.completion_source end,
      completed_by_admin = case when p_in_progress then null else entry.completed_by_admin end,
      updated_at = now()
  where entry.id = v_entry.id
     or (v_entry.span_group_id is not null and entry.span_group_id = v_entry.span_group_id);

  select * into v_entry from public.schedule_entries entry where entry.id = p_entry_id;
  return pg_catalog.jsonb_build_object(
    'id', v_entry.id,
    'isInProgress', v_entry.is_in_progress,
    'isCompleted', v_entry.is_completed,
    'isPreviousIncomplete', v_entry.is_previous_incomplete,
    'updatedAt', v_entry.updated_at
  );
end;
$$;

revoke all on function public._schedule_set_entry_in_progress(uuid, uuid, timestamptz, boolean)
  from public, anon, authenticated;

create or replace function public.schedule_student_set_entry_in_progress(
  p_token uuid, p_entry_id uuid, p_expected_updated_at timestamptz, p_in_progress boolean
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then raise exception 'Invalid or expired student session'; end if;
  return public._schedule_set_entry_in_progress(v_student_id, p_entry_id, p_expected_updated_at, p_in_progress);
end;
$$;

create or replace function public.schedule_admin_set_entry_in_progress(
  p_admin_token uuid, p_student_id uuid, p_entry_id uuid,
  p_expected_updated_at timestamptz, p_in_progress boolean
)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session'; end if;
  return public._schedule_set_entry_in_progress(p_student_id, p_entry_id, p_expected_updated_at, p_in_progress);
end;
$$;

create or replace function public._schedule_set_entry_previous_incomplete(
  p_student_id uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_previous_incomplete boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_entry public.schedule_entries%rowtype;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if p_previous_incomplete is null then
    raise exception 'Invalid previous-homework request' using errcode = '22023';
  end if;
  select * into v_entry
  from public.schedule_entries entry
  where entry.student_id = p_student_id and entry.id = p_entry_id
  for update;
  if not found then raise exception 'Schedule entry not found'; end if;
  if p_expected_updated_at is null or v_entry.updated_at <> p_expected_updated_at then
    raise exception 'Schedule entry changed in another session; reload and try again' using errcode = '40001';
  end if;
  if v_entry.span_group_id is not null then
    perform 1 from public.schedule_entries entry
    where entry.student_id = p_student_id and entry.span_group_id = v_entry.span_group_id
    order by entry.id for update;
  end if;

  update public.schedule_entries entry
  set is_previous_incomplete = p_previous_incomplete,
      is_completed = case when p_previous_incomplete then false else entry.is_completed end,
      is_in_progress = case when p_previous_incomplete then false else entry.is_in_progress end,
      completed_at = case when p_previous_incomplete then null else entry.completed_at end,
      completion_source = case when p_previous_incomplete then null else entry.completion_source end,
      completed_by_admin = case when p_previous_incomplete then null else entry.completed_by_admin end,
      updated_at = now()
  where entry.id = v_entry.id
     or (v_entry.span_group_id is not null and entry.span_group_id = v_entry.span_group_id);

  select * into v_entry from public.schedule_entries entry where entry.id = p_entry_id;
  return pg_catalog.jsonb_build_object(
    'id', v_entry.id,
    'isPreviousIncomplete', v_entry.is_previous_incomplete,
    'isInProgress', v_entry.is_in_progress,
    'isCompleted', v_entry.is_completed,
    'updatedAt', v_entry.updated_at
  );
end;
$$;

revoke all on function public._schedule_set_entry_previous_incomplete(uuid, uuid, timestamptz, boolean)
  from public, anon, authenticated;

create or replace function public.schedule_student_set_entry_previous_incomplete(
  p_token uuid, p_entry_id uuid, p_expected_updated_at timestamptz, p_previous_incomplete boolean
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then raise exception 'Invalid or expired student session'; end if;
  return public._schedule_set_entry_previous_incomplete(
    v_student_id, p_entry_id, p_expected_updated_at, p_previous_incomplete
  );
end;
$$;

create or replace function public.schedule_admin_set_entry_previous_incomplete(
  p_admin_token uuid, p_student_id uuid, p_entry_id uuid,
  p_expected_updated_at timestamptz, p_previous_incomplete boolean
)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;
  return public._schedule_set_entry_previous_incomplete(
    p_student_id, p_entry_id, p_expected_updated_at, p_previous_incomplete
  );
end;
$$;

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
  v_reopens_completion boolean := false;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
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

  insert into public.schedule_day_capacity (
    student_id,
    schedule_date,
    slot_count,
    version
  )
  values (p_student_id, p_schedule_date, 10, 0)
  on conflict (student_id, schedule_date) do nothing;

  select capacity.slot_count
  into v_capacity
  from public.schedule_day_capacity capacity
  where capacity.student_id = p_student_id
    and capacity.schedule_date = p_schedule_date
  for update;

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
      raise exception 'Schedule entry changed in another session; reload and try again'
        using errcode = '40001';
    end if;
    if p_source = 'student' and v_existing.source = 'admin' then
      raise exception 'Teacher assignments can only be changed by an administrator';
    end if;

    v_reopens_completion := v_existing.message is distinct from v_message
      or v_existing.source is distinct from p_source;

    if v_existing.span_group_id is not null then
      perform 1
      from public.schedule_entries group_entry
      where group_entry.student_id = p_student_id
        and group_entry.span_group_id = v_existing.span_group_id
      order by group_entry.id
      for update;
    end if;

    update public.schedule_entries entry
    set message = v_message,
        source = p_source,
        created_by_admin = case when p_source = 'admin' then p_admin_id else null end,
        is_completed = case when v_reopens_completion then false else v_existing.is_completed end,
        completed_at = case when v_reopens_completion then null else v_existing.completed_at end,
        completion_source = case when v_reopens_completion then null else v_existing.completion_source end,
        completed_by_admin = case when v_reopens_completion then null else v_existing.completed_by_admin end,
        updated_at = now()
    where entry.student_id = p_student_id
      and (
        entry.id = v_existing.id
        or (
          v_existing.span_group_id is not null
          and entry.span_group_id = v_existing.span_group_id
        )
      );

    select * into v_entry
    from public.schedule_entries entry
    where entry.id = v_existing.id;
  else
    if p_expected_updated_at is not null then
      raise exception 'Schedule entry changed in another session; reload and try again'
        using errcode = '40001';
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
    raise exception 'Schedule entry changed in another session; reload and try again'
      using errcode = '40001';
  end if;

  return pg_catalog.jsonb_build_object(
    'id', v_entry.id,
    'scheduleDate', pg_catalog.to_char(v_entry.schedule_date, 'YYYY-MM-DD'),
    'slotIndex', v_entry.slot_index,
    'message', v_entry.message,
    'source', v_entry.source,
    'isCompleted', v_entry.is_completed,
    'completedAt', v_entry.completed_at,
    'completionSource', v_entry.completion_source,
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
  perform public._schedule_lock_student_mutations(p_student_id);
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
    raise exception 'Schedule entry changed in another session; reload and try again'
      using errcode = '40001';
  end if;
  if p_actor_source = 'student' and v_entry.source = 'admin' then
    raise exception 'Teacher assignments can only be deleted by an administrator';
  end if;

  delete from public.schedule_entries entry
  where entry.id = v_entry.id
     or (v_entry.span_group_id is not null and entry.span_group_id = v_entry.span_group_id);

  return found;
end;
$$;

revoke all on function public._schedule_delete_entry(uuid, date, integer, timestamptz, text)
  from public, anon, authenticated;

create or replace function public._schedule_set_entry_completed(
  p_student_id uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_completed boolean,
  p_actor_source text,
  p_admin_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entry public.schedule_entries%rowtype;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if p_completed is null
    or p_actor_source is null
    or p_actor_source not in ('student', 'admin')
    or (p_actor_source = 'student' and p_admin_id is not null)
    or (p_actor_source = 'admin' and p_admin_id is null)
  then
    raise exception 'Invalid completion request';
  end if;

  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;

  select *
  into v_entry
  from public.schedule_entries entry
  where entry.id = p_entry_id
    and entry.student_id = p_student_id
  for update;

  if not found then
    raise exception 'Schedule entry not found';
  end if;
  if p_expected_updated_at is null or v_entry.updated_at <> p_expected_updated_at then
    raise exception 'Schedule entry changed in another session; reload and try again'
      using errcode = '40001';
  end if;

  if v_entry.span_group_id is not null then
    perform 1 from public.schedule_entries entry
    where entry.student_id = p_student_id and entry.span_group_id = v_entry.span_group_id
    order by entry.id for update;
  end if;

  update public.schedule_entries entry
  set is_completed = p_completed,
      is_in_progress = case when p_completed then false else entry.is_in_progress end,
      is_previous_incomplete = case when p_completed then false else entry.is_previous_incomplete end,
      completed_at = case when p_completed then now() else null end,
      completion_source = case when p_completed then p_actor_source else null end,
      completed_by_admin = case
        when p_completed and p_actor_source = 'admin' then p_admin_id
        else null
      end,
      updated_at = now()
  where entry.student_id = p_student_id
    and (
      entry.id = v_entry.id
      or (v_entry.span_group_id is not null and entry.span_group_id = v_entry.span_group_id)
    );

  select * into v_entry
  from public.schedule_entries entry
  where entry.id = p_entry_id;

  if v_entry.id is null then
    raise exception 'Schedule entry changed in another session; reload and try again'
      using errcode = '40001';
  end if;

  return pg_catalog.jsonb_build_object(
    'id', v_entry.id,
    'scheduleDate', pg_catalog.to_char(v_entry.schedule_date, 'YYYY-MM-DD'),
    'slotIndex', v_entry.slot_index,
    'message', v_entry.message,
    'source', v_entry.source,
    'isCompleted', v_entry.is_completed,
    'completedAt', v_entry.completed_at,
    'completionSource', v_entry.completion_source,
    'updatedAt', v_entry.updated_at
  );
end;
$$;

revoke all on function public._schedule_set_entry_completed(uuid, uuid, timestamptz, boolean, text, uuid)
  from public, anon, authenticated;

create or replace function public._schedule_batch_delete_entries(
  p_student_id uuid,
  p_items jsonb,
  p_actor_source text
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
  v_deleted_count integer;
  v_deleted_ids jsonb;
  v_row record;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if p_actor_source is null or p_actor_source not in ('student', 'admin') then
    raise exception 'Invalid batch-delete actor' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;
  if p_items is null or pg_catalog.jsonb_typeof(p_items) <> 'array' then
    raise exception 'Batch request must be a JSON array' using errcode = '22023';
  end if;
  if pg_catalog.jsonb_array_length(p_items) not between 1 and 700 then
    raise exception 'Batch request must contain between 1 and 700 entries'
      using errcode = '22023';
  end if;
  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(p_items) item(value)
    where pg_catalog.jsonb_typeof(item.value) <> 'object'
  ) then
    raise exception 'Batch request items must be objects' using errcode = '22023';
  end if;

  select
    count(*)::integer,
    count(distinct requested.entry_id)::integer,
    count(*) filter (
      where requested.entry_id is null
        or requested.expected_updated_at is null
    )::integer
  into v_item_count, v_distinct_count, v_null_count
  from pg_catalog.jsonb_to_recordset(p_items) as requested(
    entry_id uuid,
    expected_updated_at timestamptz
  );

  if v_item_count <> v_distinct_count or v_null_count <> 0 then
    raise exception 'Batch request contains duplicate or incomplete entries'
      using errcode = '22023';
  end if;

  for v_row in
    select
      schedule_entry.*,
      requested.expected_updated_at as requested_updated_at
    from public.schedule_entries schedule_entry
    join pg_catalog.jsonb_to_recordset(p_items) as requested(
      entry_id uuid,
      expected_updated_at timestamptz
    ) on requested.entry_id = schedule_entry.id
    where schedule_entry.student_id = p_student_id
    order by schedule_entry.id
    for update of schedule_entry
  loop
    v_locked_count := v_locked_count + 1;
    if v_row.updated_at <> v_row.requested_updated_at then
      raise exception 'Schedule entry changed in another session; reload and try again'
        using errcode = '40001';
    end if;
    if p_actor_source = 'student' and v_row.source = 'admin' then
      raise exception 'Teacher assignments can only be deleted by an administrator'
        using errcode = '42501';
    end if;
  end loop;

  if v_locked_count <> v_item_count then
    raise exception 'Schedule entry changed in another session; reload and try again'
      using errcode = '40001';
  end if;

  with requested as (
    select request.entry_id
    from pg_catalog.jsonb_to_recordset(p_items) as request(
      entry_id uuid,
      expected_updated_at timestamptz
    )
  ), deleted as (
    delete from public.schedule_entries schedule_entry
    using requested
    where schedule_entry.student_id = p_student_id
      and schedule_entry.id = requested.entry_id
    returning schedule_entry.id
  )
  select
    count(*)::integer,
    coalesce(
      pg_catalog.jsonb_agg(deleted.id order by deleted.id),
      '[]'::jsonb
    )
  into v_deleted_count, v_deleted_ids
  from deleted;

  if v_deleted_count <> v_item_count then
    raise exception 'Schedule entry changed in another session; reload and try again'
      using errcode = '40001';
  end if;

  return pg_catalog.jsonb_build_object(
    'deletedCount', v_deleted_count,
    'deletedIds', v_deleted_ids
  );
end;
$$;

revoke all on function public._schedule_batch_delete_entries(uuid, jsonb, text)
  from public, anon, authenticated;

create or replace function public._schedule_batch_set_entries_completed(
  p_student_id uuid,
  p_items jsonb,
  p_completed boolean,
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
  if p_completed is null
    or p_actor_source is null
    or p_actor_source not in ('student', 'admin')
    or (p_actor_source = 'student' and p_admin_id is not null)
    or (p_actor_source = 'admin' and p_admin_id is null)
  then
    raise exception 'Invalid batch-completion request' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;
  if p_items is null or pg_catalog.jsonb_typeof(p_items) <> 'array' then
    raise exception 'Batch request must be a JSON array' using errcode = '22023';
  end if;
  if pg_catalog.jsonb_array_length(p_items) not between 1 and 700 then
    raise exception 'Batch request must contain between 1 and 700 entries'
      using errcode = '22023';
  end if;
  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(p_items) item(value)
    where pg_catalog.jsonb_typeof(item.value) <> 'object'
  ) then
    raise exception 'Batch request items must be objects' using errcode = '22023';
  end if;

  select
    count(*)::integer,
    count(distinct requested.entry_id)::integer,
    count(*) filter (
      where requested.entry_id is null
        or requested.expected_updated_at is null
    )::integer
  into v_item_count, v_distinct_count, v_null_count
  from pg_catalog.jsonb_to_recordset(p_items) as requested(
    entry_id uuid,
    expected_updated_at timestamptz
  );

  if v_item_count <> v_distinct_count or v_null_count <> 0 then
    raise exception 'Batch request contains duplicate or incomplete entries'
      using errcode = '22023';
  end if;

  for v_row in
    select
      schedule_entry.*,
      requested.expected_updated_at as requested_updated_at
    from public.schedule_entries schedule_entry
    join pg_catalog.jsonb_to_recordset(p_items) as requested(
      entry_id uuid,
      expected_updated_at timestamptz
    ) on requested.entry_id = schedule_entry.id
    where schedule_entry.student_id = p_student_id
    order by schedule_entry.id
    for update of schedule_entry
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
    from pg_catalog.jsonb_to_recordset(p_items) as request(
      entry_id uuid,
      expected_updated_at timestamptz
    )
  )
  update public.schedule_entries schedule_entry
  set is_completed = p_completed,
      is_in_progress = case when p_completed then false else schedule_entry.is_in_progress end,
      is_previous_incomplete = case when p_completed then false else schedule_entry.is_previous_incomplete end,
      completed_at = case when p_completed then now() else null end,
      completion_source = case when p_completed then p_actor_source else null end,
      completed_by_admin = case
        when p_completed and p_actor_source = 'admin' then p_admin_id
        else null
      end,
      updated_at = now()
  from requested
  where schedule_entry.student_id = p_student_id
    and schedule_entry.id = requested.entry_id
    and schedule_entry.updated_at = requested.expected_updated_at
    and schedule_entry.is_completed is distinct from p_completed;

  get diagnostics v_changed_count = row_count;

  select coalesce(
    pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object(
        'id', schedule_entry.id,
        'scheduleDate', pg_catalog.to_char(schedule_entry.schedule_date, 'YYYY-MM-DD'),
        'slotIndex', schedule_entry.slot_index,
        'message', schedule_entry.message,
        'source', schedule_entry.source,
        'isCompleted', schedule_entry.is_completed,
        'completedAt', schedule_entry.completed_at,
        'completionSource', schedule_entry.completion_source,
        'updatedAt', schedule_entry.updated_at
      ) order by schedule_entry.schedule_date, schedule_entry.slot_index, schedule_entry.id
    ),
    '[]'::jsonb
  )
  into v_entries
  from public.schedule_entries schedule_entry
  join pg_catalog.jsonb_to_recordset(p_items) as requested(
    entry_id uuid,
    expected_updated_at timestamptz
  ) on requested.entry_id = schedule_entry.id
  where schedule_entry.student_id = p_student_id;

  return pg_catalog.jsonb_build_object(
    'requestedCount', v_item_count,
    'changedCount', v_changed_count,
    'entries', v_entries
  );
end;
$$;

revoke all on function public._schedule_batch_set_entries_completed(uuid, jsonb, boolean, text, uuid)
  from public, anon, authenticated;

create or replace function public._schedule_move_entry(
  p_student_id uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_source_date date,
  p_source_slot_index integer,
  p_target_date date,
  p_target_slot_index integer,
  p_source_capacity_version bigint,
  p_target_capacity_version bigint,
  p_actor_source text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_capacity record;
  v_capacity_count integer := 0;
  v_expected_capacity_count integer;
  v_source_capacity integer;
  v_target_capacity integer;
  v_locked_entry_id uuid;
  v_target_occupied boolean := false;
  v_entry public.schedule_entries%rowtype;
begin
  if p_actor_source is null or p_actor_source not in ('student', 'admin') then
    raise exception 'Invalid move actor' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;
  if p_entry_id is null or p_expected_updated_at is null then
    raise exception 'Move source is incomplete' using errcode = '22023';
  end if;
  if p_source_date is null
    or p_target_date is null
    or p_source_date not between date '2026-01-01' and date '2050-12-31'
    or p_target_date not between date '2026-01-01' and date '2050-12-31'
  then
    raise exception 'Schedule date is outside the supported range'
      using errcode = '22023';
  end if;
  if p_source_slot_index is null
    or p_target_slot_index is null
    or p_source_slot_index not between 1 and 100
    or p_target_slot_index not between 1 and 100
  then
    raise exception 'Invalid schedule slot' using errcode = '22023';
  end if;
  if p_source_capacity_version is null
    or p_target_capacity_version is null
    or p_source_capacity_version < 0
    or p_target_capacity_version < 0
  then
    raise exception 'Invalid capacity version' using errcode = '22023';
  end if;
  if p_source_date = p_target_date
    and p_source_capacity_version <> p_target_capacity_version
  then
    raise exception 'Capacity versions for the same day must match'
      using errcode = '22023';
  end if;

  insert into public.schedule_day_capacity (
    student_id,
    schedule_date,
    slot_count,
    version
  )
  select
    p_student_id,
    requested.schedule_date,
    10,
    0
  from (
    select distinct candidate.schedule_date
    from (values (p_source_date), (p_target_date)) as candidate(schedule_date)
  ) requested
  order by requested.schedule_date
  on conflict (student_id, schedule_date) do nothing;

  v_expected_capacity_count := case when p_source_date = p_target_date then 1 else 2 end;
  for v_capacity in
    select capacity.*
    from public.schedule_day_capacity capacity
    where capacity.student_id = p_student_id
      and capacity.schedule_date in (p_source_date, p_target_date)
    order by capacity.schedule_date
    for update
  loop
    v_capacity_count := v_capacity_count + 1;
    if v_capacity.schedule_date = p_source_date then
      v_source_capacity := v_capacity.slot_count;
      if v_capacity.version <> p_source_capacity_version then
        raise exception 'Schedule capacity changed in another session; reload and try again'
          using errcode = '40001';
      end if;
    end if;
    if v_capacity.schedule_date = p_target_date then
      v_target_capacity := v_capacity.slot_count;
      if v_capacity.version <> p_target_capacity_version then
        raise exception 'Schedule capacity changed in another session; reload and try again'
          using errcode = '40001';
      end if;
    end if;
  end loop;

  if v_capacity_count <> v_expected_capacity_count then
    raise exception 'Schedule capacity changed in another session; reload and try again'
      using errcode = '40001';
  end if;
  if p_source_slot_index > v_source_capacity or p_target_slot_index > v_target_capacity then
    raise exception 'Target slot is outside the current daily capacity'
      using errcode = '40001';
  end if;

  for v_locked_entry_id in
    select schedule_entry.id
    from public.schedule_entries schedule_entry
    where schedule_entry.student_id = p_student_id
      and (
        schedule_entry.id = p_entry_id
        or (
          schedule_entry.schedule_date = p_target_date
          and schedule_entry.slot_index = p_target_slot_index
        )
      )
    order by schedule_entry.id
    for update
  loop
    if v_locked_entry_id <> p_entry_id then
      v_target_occupied := true;
    end if;
  end loop;

  select *
  into v_entry
  from public.schedule_entries schedule_entry
  where schedule_entry.student_id = p_student_id
    and schedule_entry.id = p_entry_id;

  if not found
    or v_entry.updated_at <> p_expected_updated_at
    or v_entry.schedule_date <> p_source_date
    or v_entry.slot_index <> p_source_slot_index
  then
    raise exception 'Schedule entry changed in another session; reload and try again'
      using errcode = '40001';
  end if;
  if p_actor_source = 'student' and v_entry.source = 'admin' then
    raise exception 'Teacher assignments can only be moved by an administrator'
      using errcode = '42501';
  end if;

  if p_source_date = p_target_date and p_source_slot_index = p_target_slot_index then
    return pg_catalog.jsonb_build_object(
      'id', v_entry.id,
      'scheduleDate', pg_catalog.to_char(v_entry.schedule_date, 'YYYY-MM-DD'),
      'slotIndex', v_entry.slot_index,
      'message', v_entry.message,
      'source', v_entry.source,
      'isCompleted', v_entry.is_completed,
      'completedAt', v_entry.completed_at,
      'completionSource', v_entry.completion_source,
      'updatedAt', v_entry.updated_at
    );
  end if;
  if v_target_occupied then
    raise exception 'Target slot is occupied; reload and choose an empty slot'
      using errcode = '40001';
  end if;

  update public.schedule_entries schedule_entry
  set schedule_date = p_target_date,
      slot_index = p_target_slot_index,
      updated_at = now()
  where schedule_entry.id = v_entry.id
    and schedule_entry.updated_at = p_expected_updated_at
  returning * into v_entry;

  if v_entry.id is null then
    raise exception 'Schedule entry changed in another session; reload and try again'
      using errcode = '40001';
  end if;

  return pg_catalog.jsonb_build_object(
    'id', v_entry.id,
    'scheduleDate', pg_catalog.to_char(v_entry.schedule_date, 'YYYY-MM-DD'),
    'slotIndex', v_entry.slot_index,
    'message', v_entry.message,
    'source', v_entry.source,
    'isCompleted', v_entry.is_completed,
    'completedAt', v_entry.completed_at,
    'completionSource', v_entry.completion_source,
    'updatedAt', v_entry.updated_at
  );
end;
$$;

revoke all on function public._schedule_move_entry(
  uuid, uuid, timestamptz, date, integer, date, integer, bigint, bigint, text
) from public, anon, authenticated;

create or replace function public._schedule_change_capacity(
  p_student_id uuid,
  p_schedule_date date,
  p_expected_version bigint,
  p_delta integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_capacity public.schedule_day_capacity%rowtype;
  v_target integer;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
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
  if p_delta is null or p_delta not in (-5, 5) then
    raise exception 'Capacity can only change by five slots';
  end if;
  if p_expected_version is null or p_expected_version < 0 then
    raise exception 'Invalid capacity version';
  end if;

  insert into public.schedule_day_capacity (
    student_id,
    schedule_date,
    slot_count,
    version
  )
  values (p_student_id, p_schedule_date, 10, 0)
  on conflict (student_id, schedule_date) do nothing;

  select *
  into v_capacity
  from public.schedule_day_capacity capacity
  where capacity.student_id = p_student_id
    and capacity.schedule_date = p_schedule_date
  for update;

  if v_capacity.version <> p_expected_version then
    raise exception 'Schedule capacity changed in another session; reload and try again'
      using errcode = '40001';
  end if;

  v_target := v_capacity.slot_count + p_delta;
  if v_target < 10 then
    raise exception 'Daily schedule already has the minimum 10 slots';
  end if;
  if v_target > 100 then
    raise exception 'Daily schedule already has the maximum 100 slots';
  end if;

  if p_delta < 0 and exists (
    select 1
    from public.schedule_entries entry
    where entry.student_id = p_student_id
      and entry.schedule_date = p_schedule_date
      and entry.slot_index > v_target
  ) then
    raise exception 'Last five slots contain assignments; clear them before reducing capacity';
  end if;

  update public.schedule_day_capacity capacity
  set slot_count = v_target,
      version = capacity.version + 1,
      updated_at = now()
  where capacity.student_id = p_student_id
    and capacity.schedule_date = p_schedule_date
  returning * into v_capacity;

  return pg_catalog.jsonb_build_object(
    'slotCount', v_capacity.slot_count,
    'version', v_capacity.version,
    'updatedAt', v_capacity.updated_at
  );
end;
$$;

revoke all on function public._schedule_change_capacity(uuid, date, bigint, integer)
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

create or replace function public.schedule_student_set_display_preferences(
  p_token uuid,
  p_patch jsonb
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
  return public._schedule_set_display_preferences(v_student_id, p_patch);
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

create or replace function public.schedule_student_change_capacity(
  p_token uuid,
  p_schedule_date date,
  p_expected_version bigint,
  p_delta integer
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
  return public._schedule_change_capacity(
    v_student_id,
    p_schedule_date,
    p_expected_version,
    p_delta
  );
end;
$$;

create or replace function public.schedule_student_set_entry_completed(
  p_token uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_completed boolean
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
  return public._schedule_set_entry_completed(
    v_student_id,
    p_entry_id,
    p_expected_updated_at,
    p_completed,
    'student',
    null
  );
end;
$$;

create or replace function public.schedule_student_batch_delete_entries(
  p_token uuid,
  p_items jsonb
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
  return public._schedule_batch_delete_entries(
    v_student_id,
    p_items,
    'student'
  );
end;
$$;

create or replace function public.schedule_student_batch_set_entries_completed(
  p_token uuid,
  p_items jsonb,
  p_completed boolean
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
  return public._schedule_batch_set_entries_completed(
    v_student_id,
    p_items,
    p_completed,
    'student',
    null
  );
end;
$$;

create or replace function public.schedule_student_move_entry(
  p_token uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_source_date date,
  p_source_slot_index integer,
  p_target_date date,
  p_target_slot_index integer,
  p_source_capacity_version bigint,
  p_target_capacity_version bigint
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
  return public._schedule_move_entry(
    v_student_id,
    p_entry_id,
    p_expected_updated_at,
    p_source_date,
    p_source_slot_index,
    p_target_date,
    p_target_slot_index,
    p_source_capacity_version,
    p_target_capacity_version,
    'student'
  );
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

create or replace function public.schedule_admin_set_display_preferences(
  p_admin_token uuid,
  p_student_id uuid,
  p_patch jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;
  return public._schedule_set_display_preferences(p_student_id, p_patch);
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

create or replace function public.schedule_admin_change_capacity(
  p_admin_token uuid,
  p_student_id uuid,
  p_schedule_date date,
  p_expected_version bigint,
  p_delta integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;
  return public._schedule_change_capacity(
    p_student_id,
    p_schedule_date,
    p_expected_version,
    p_delta
  );
end;
$$;

create or replace function public.schedule_admin_set_entry_completed(
  p_admin_token uuid,
  p_student_id uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_completed boolean
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
  return public._schedule_set_entry_completed(
    p_student_id,
    p_entry_id,
    p_expected_updated_at,
    p_completed,
    'admin',
    v_admin_id
  );
end;
$$;

create or replace function public.schedule_admin_batch_delete_entries(
  p_admin_token uuid,
  p_student_id uuid,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;
  return public._schedule_batch_delete_entries(
    p_student_id,
    p_items,
    'admin'
  );
end;
$$;

create or replace function public.schedule_admin_batch_set_entries_completed(
  p_admin_token uuid,
  p_student_id uuid,
  p_items jsonb,
  p_completed boolean
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
  return public._schedule_batch_set_entries_completed(
    p_student_id,
    p_items,
    p_completed,
    'admin',
    v_admin_id
  );
end;
$$;

create or replace function public.schedule_admin_move_entry(
  p_admin_token uuid,
  p_student_id uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_source_date date,
  p_source_slot_index integer,
  p_target_date date,
  p_target_slot_index integer,
  p_source_capacity_version bigint,
  p_target_capacity_version bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;
  return public._schedule_move_entry(
    p_student_id,
    p_entry_id,
    p_expected_updated_at,
    p_source_date,
    p_source_slot_index,
    p_target_date,
    p_target_slot_index,
    p_source_capacity_version,
    p_target_capacity_version,
    'admin'
  );
end;
$$;

-- Schedule enhancements: progress state, estimates, multi-day projects and
-- persistent important-event countdowns.
create or replace function public._schedule_homework_types(p_message text)
returns text[]
language plpgsql
immutable
strict
set search_path = ''
as $$
declare
  v_match text[];
  v_encoded text;
  v_payload jsonb;
  v_type text;
  v_types text[] := array[]::text[];
begin
  for v_match in
    select marker.capture
    from pg_catalog.regexp_matches(
      p_message,
      '\[\[@edmund-homework:v1:([A-Za-z0-9_-]+)\]\]',
      'g'
    ) as marker(capture)
  loop
    begin
      v_encoded := pg_catalog.translate(v_match[1], '-_', '+/');
      v_encoded := v_encoded || pg_catalog.repeat('=', (4 - pg_catalog.length(v_encoded) % 4) % 4);
      v_payload := pg_catalog.convert_from(pg_catalog.decode(v_encoded, 'base64'), 'UTF8')::jsonb;
      v_type := v_payload ->> 'type';
      if v_type = any(array[
        'flashcards',
        'fill-blanks',
        'writing-submission',
        'idiom',
        'proverb',
        'phrasal-verb',
        'speaking',
        'sentence-structure',
        'reading-analysis'
      ]::text[]) then
        v_types := pg_catalog.array_append(v_types, v_type);
      end if;
    exception when others then
      -- A malformed legacy marker must not prevent the student's week loading.
      null;
    end;
  end loop;
  return v_types;
end;
$$;

revoke all on function public._schedule_homework_types(text)
  from public, anon, authenticated;

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
    select day.schedule_date,
      case when day.schedule_date between date '2026-01-01' and date '2050-12-31'
        then coalesce(capacity.slot_count, 10) else 0 end as slot_count
    from days day
    left join public.schedule_day_capacity capacity
      on capacity.student_id = p_student_id and capacity.schedule_date = day.schedule_date
  ), week_entries as (
    select entry.*
    from public.schedule_entries entry
    where entry.student_id = p_student_id
      and entry.schedule_date between p_week_start and p_week_start + 6
  ), metric_all_entries as (
    select entry.*
    from public.schedule_entries entry
    where entry.student_id = p_student_id
      and (
        entry.span_group_id is null
        or entry.schedule_date = (
          select min(member.schedule_date)
          from public.schedule_entries member
          where member.student_id = entry.student_id
            and member.span_group_id = entry.span_group_id
        )
      )
  ), all_metrics as (
    select count(*)::integer as total_goals,
      count(*) filter (where entry.is_completed)::integer as total_completed
    from metric_all_entries entry
  ), homework_type_counts as (
    select homework_type.type_name,
      count(*)::integer as item_count
    from metric_all_entries entry
    cross join lateral pg_catalog.unnest(public._schedule_homework_types(entry.message)) as homework_type(type_name)
    group by homework_type.type_name
  ), homework_type_summary as (
    select pg_catalog.jsonb_object_agg(
      definition.type_name,
      coalesce(type_count.item_count, 0)
      order by definition.sort_order
    ) as counts
    from (values
      (1, 'flashcards'),
      (2, 'fill-blanks'),
      (3, 'writing-submission'),
      (4, 'idiom'),
      (5, 'proverb'),
      (6, 'phrasal-verb'),
      (7, 'speaking'),
      (8, 'sentence-structure'),
      (9, 'reading-analysis')
    ) as definition(sort_order, type_name)
    left join homework_type_counts type_count
      on type_count.type_name = definition.type_name
  ), metric_week_entries as (
    select entry.*
    from week_entries entry
    where entry.span_group_id is null
       or entry.schedule_date = (
         select min(member.schedule_date)
         from public.schedule_entries member
         where member.student_id = entry.student_id
           and member.span_group_id = entry.span_group_id
       )
  )
  select pg_catalog.jsonb_build_object(
    'weekStart', p_week_start,
    'displayPreferences', public._schedule_display_preferences(p_student_id),
    'capacities', (
      select pg_catalog.jsonb_object_agg(
        pg_catalog.to_char(capacity.schedule_date, 'YYYY-MM-DD'), capacity.slot_count order by capacity.schedule_date
      ) from capacities capacity
    ),
    'entries', coalesce((
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object(
          'id', entry.id,
          'scheduleDate', pg_catalog.to_char(entry.schedule_date, 'YYYY-MM-DD'),
          'slotIndex', entry.slot_index,
          'message', entry.message,
          'source', entry.source,
          'isCompleted', entry.is_completed,
          'isInProgress', entry.is_in_progress,
          'isPreviousIncomplete', entry.is_previous_incomplete,
          'estimatedMinutes', entry.estimated_minutes,
          'spanGroupId', entry.span_group_id,
          'completedAt', entry.completed_at,
          'completionSource', entry.completion_source,
          'updatedAt', entry.updated_at
        ) order by entry.schedule_date, entry.slot_index
      ) from week_entries entry
    ), '[]'::jsonb),
    'metrics', pg_catalog.jsonb_build_object(
      'weekGoals', (select count(*)::integer from metric_week_entries),
      'totalGoals', (select metric.total_goals from all_metrics metric),
      'weekCompleted', (select count(*)::integer from metric_week_entries entry where entry.is_completed),
      'totalCompleted', (select metric.total_completed from all_metrics metric),
      'homeworkTypeCounts', coalesce(
        (select summary.counts from homework_type_summary summary),
        '{}'::jsonb
      )
    ),
    'capacityVersions', (
      select pg_catalog.jsonb_object_agg(
        pg_catalog.to_char(day.schedule_date, 'YYYY-MM-DD'), coalesce(capacity.version, 0) order by day.schedule_date
      )
      from days day
      left join public.schedule_day_capacity capacity
        on capacity.student_id = p_student_id and capacity.schedule_date = day.schedule_date
    ),
    'countdownCapacity', coalesce((
      select capacity.clock_count from public.schedule_countdown_capacity capacity
      where capacity.student_id = p_student_id
    ), 6),
    'countdowns', coalesce((
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object(
          'id', countdown.id,
          'position', countdown.position,
          'title', countdown.title,
          'startDate', pg_catalog.to_char(countdown.start_date, 'YYYY-MM-DD'),
          'endDate', pg_catalog.to_char(countdown.end_date, 'YYYY-MM-DD'),
          'dailyHours', countdown.daily_hours,
          'morningHours', countdown.morning_hours,
          'afternoonHours', countdown.afternoon_hours,
          'eveningHours', countdown.evening_hours,
          'updatedAt', countdown.updated_at
        ) order by countdown.position
      ) from public.schedule_countdowns countdown where countdown.student_id = p_student_id
    ), '[]'::jsonb)
  );
$$;

revoke all on function public._schedule_week_payload(uuid, date) from public, anon, authenticated;

create or replace function public._schedule_extend_entry_span(
  p_student_id uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_target_date date,
  p_actor_source text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entry public.schedule_entries%rowtype;
  v_group_id uuid;
  v_start date;
  v_end date;
  v_common_slot integer;
  v_required_capacity integer;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if p_actor_source not in ('student', 'admin') then raise exception 'Invalid span actor' using errcode = '22023'; end if;
  select * into v_entry
  from public.schedule_entries entry
  where entry.student_id = p_student_id and entry.id = p_entry_id
  for update;
  if not found then raise exception 'Schedule entry not found'; end if;
  if p_expected_updated_at is null or v_entry.updated_at <> p_expected_updated_at then
    raise exception 'Schedule entry changed in another session; reload and try again' using errcode = '40001';
  end if;
  if p_actor_source = 'student' and v_entry.source = 'admin' then
    raise exception 'Teacher assignments can only be extended by an administrator' using errcode = '42501';
  end if;

  v_group_id := coalesce(v_entry.span_group_id, gen_random_uuid());
  if v_entry.span_group_id is null then
    v_start := v_entry.schedule_date;
    v_end := v_entry.schedule_date;
  else
    select min(entry.schedule_date), max(entry.schedule_date)
    into v_start, v_end
    from public.schedule_entries entry
    where entry.student_id = p_student_id and entry.span_group_id = v_group_id;
  end if;

  if p_target_date is null
    or p_target_date not between date '2026-01-01' and date '2050-12-31'
    or p_target_date between v_start and v_end
  then
    raise exception 'Choose a new day outside the current multi-day project' using errcode = '22023';
  end if;
  if date_trunc('week', p_target_date::timestamp)::date
    <> date_trunc('week', v_entry.schedule_date::timestamp)::date
  then
    raise exception 'A multi-day project must stay within one week' using errcode = '22023';
  end if;

  v_start := least(v_start, p_target_date);
  v_end := greatest(v_end, p_target_date);

  insert into public.schedule_day_capacity (student_id, schedule_date, slot_count, version)
  select p_student_id, day.schedule_date::date, 10, 0
  from pg_catalog.generate_series(v_start::timestamp, v_end::timestamp, interval '1 day') day(schedule_date)
  order by day.schedule_date
  on conflict (student_id, schedule_date) do nothing;

  perform 1
  from public.schedule_day_capacity capacity
  where capacity.student_id = p_student_id and capacity.schedule_date between v_start and v_end
  order by capacity.schedule_date
  for update;

  perform 1
  from public.schedule_entries entry
  where entry.student_id = p_student_id
    and (entry.id = v_entry.id or entry.span_group_id = v_group_id)
  order by entry.id
  for update;

  select coalesce(max(entry.slot_index), 0) + 1 into v_common_slot
  from public.schedule_entries entry
  where entry.student_id = p_student_id
    and entry.schedule_date between v_start and v_end
    and entry.id <> v_entry.id
    and (entry.span_group_id is null or entry.span_group_id <> v_group_id);

  if v_common_slot > 100 then raise exception 'No room remains for a multi-day project'; end if;
  v_required_capacity := greatest(10, least(100, ((v_common_slot + 4) / 5) * 5));

  update public.schedule_day_capacity capacity
  set slot_count = greatest(capacity.slot_count, v_required_capacity),
      version = case when capacity.slot_count < v_required_capacity then capacity.version + 1 else capacity.version end,
      updated_at = now()
  where capacity.student_id = p_student_id and capacity.schedule_date between v_start and v_end;

  update public.schedule_entries entry
  set span_group_id = v_group_id,
      slot_index = v_common_slot,
      updated_at = now()
  where entry.student_id = p_student_id
    and (entry.id = v_entry.id or entry.span_group_id = v_group_id);

  insert into public.schedule_entries (
    student_id, schedule_date, slot_index, message, source, created_by_admin,
    is_completed, is_in_progress, is_previous_incomplete, estimated_minutes, completed_at,
    completion_source, completed_by_admin, span_group_id
  )
  select
    p_student_id, day.schedule_date::date, v_common_slot,
    v_entry.message, v_entry.source, v_entry.created_by_admin,
    v_entry.is_completed, v_entry.is_in_progress, v_entry.is_previous_incomplete, v_entry.estimated_minutes,
    v_entry.completed_at, v_entry.completion_source, v_entry.completed_by_admin, v_group_id
  from pg_catalog.generate_series(v_start::timestamp, v_end::timestamp, interval '1 day') day(schedule_date)
  where not exists (
    select 1 from public.schedule_entries existing
    where existing.student_id = p_student_id
      and existing.span_group_id = v_group_id
      and existing.schedule_date = day.schedule_date::date
  )
  order by day.schedule_date;

  return pg_catalog.jsonb_build_object(
    'spanGroupId', v_group_id,
    'startDate', pg_catalog.to_char(v_start, 'YYYY-MM-DD'),
    'endDate', pg_catalog.to_char(v_end, 'YYYY-MM-DD'),
    'slotIndex', v_common_slot
  );
end;
$$;

revoke all on function public._schedule_extend_entry_span(uuid, uuid, timestamptz, date, text)
  from public, anon, authenticated;

create or replace function public.schedule_student_extend_entry_span(
  p_token uuid, p_entry_id uuid, p_expected_updated_at timestamptz, p_target_date date
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then raise exception 'Invalid or expired student session'; end if;
  return public._schedule_extend_entry_span(v_student_id, p_entry_id, p_expected_updated_at, p_target_date, 'student');
end;
$$;

create or replace function public.schedule_admin_extend_entry_span(
  p_admin_token uuid, p_student_id uuid, p_entry_id uuid,
  p_expected_updated_at timestamptz, p_target_date date
)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session'; end if;
  return public._schedule_extend_entry_span(p_student_id, p_entry_id, p_expected_updated_at, p_target_date, 'admin');
end;
$$;

create or replace function public._schedule_move_entry(
  p_student_id uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_source_date date,
  p_source_slot_index integer,
  p_target_date date,
  p_target_slot_index integer,
  p_source_capacity_version bigint,
  p_target_capacity_version bigint,
  p_actor_source text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source public.schedule_entries%rowtype;
  v_target public.schedule_entries%rowtype;
  v_capacity record;
  v_source_capacity integer;
  v_target_capacity integer;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if p_actor_source not in ('student', 'admin') then raise exception 'Invalid move actor' using errcode = '22023'; end if;
  if p_entry_id is null or p_expected_updated_at is null then raise exception 'Move source is incomplete' using errcode = '22023'; end if;
  if p_source_slot_index not between 1 and 100 or p_target_slot_index not between 1 and 100 then
    raise exception 'Invalid schedule slot' using errcode = '22023';
  end if;

  insert into public.schedule_day_capacity (student_id, schedule_date, slot_count, version)
  select p_student_id, requested.schedule_date, 10, 0
  from (select distinct schedule_date from (values (p_source_date), (p_target_date)) value(schedule_date)) requested
  order by requested.schedule_date
  on conflict (student_id, schedule_date) do nothing;

  for v_capacity in
    select capacity.* from public.schedule_day_capacity capacity
    where capacity.student_id = p_student_id and capacity.schedule_date in (p_source_date, p_target_date)
    order by capacity.schedule_date for update
  loop
    if v_capacity.schedule_date = p_source_date then
      v_source_capacity := v_capacity.slot_count;
      if v_capacity.version <> p_source_capacity_version then
        raise exception 'Schedule capacity changed in another session; reload and try again' using errcode = '40001';
      end if;
    end if;
    if v_capacity.schedule_date = p_target_date then
      v_target_capacity := v_capacity.slot_count;
      if v_capacity.version <> p_target_capacity_version then
        raise exception 'Schedule capacity changed in another session; reload and try again' using errcode = '40001';
      end if;
    end if;
  end loop;
  if p_source_slot_index > v_source_capacity or p_target_slot_index > v_target_capacity then
    raise exception 'Target slot is outside the current daily capacity' using errcode = '40001';
  end if;

  perform 1 from public.schedule_entries entry
  where entry.student_id = p_student_id
    and (entry.id = p_entry_id or (entry.schedule_date = p_target_date and entry.slot_index = p_target_slot_index))
  order by entry.id for update;

  select * into v_source from public.schedule_entries entry
  where entry.student_id = p_student_id and entry.id = p_entry_id;
  if not found or v_source.updated_at <> p_expected_updated_at
    or v_source.schedule_date <> p_source_date or v_source.slot_index <> p_source_slot_index
  then
    raise exception 'Schedule entry changed in another session; reload and try again' using errcode = '40001';
  end if;
  if v_source.span_group_id is not null then
    raise exception 'Multi-day projects remain bottom-aligned and cannot be slot-swapped' using errcode = '22023';
  end if;
  if p_actor_source = 'student' and v_source.source = 'admin' then
    raise exception 'Teacher assignments can only be moved by an administrator' using errcode = '42501';
  end if;
  if p_source_date = p_target_date and p_source_slot_index = p_target_slot_index then
    return pg_catalog.jsonb_build_object('id', v_source.id, 'swapped', false, 'updatedAt', v_source.updated_at);
  end if;

  select * into v_target from public.schedule_entries entry
  where entry.student_id = p_student_id
    and entry.schedule_date = p_target_date and entry.slot_index = p_target_slot_index;
  if found then
    if v_target.span_group_id is not null then
      raise exception 'Multi-day projects remain bottom-aligned and cannot be slot-swapped' using errcode = '22023';
    end if;
    if p_actor_source = 'student' and v_target.source = 'admin' then
      raise exception 'Teacher assignments can only be moved by an administrator' using errcode = '42501';
    end if;
    delete from public.schedule_entries entry where entry.id = v_target.id;
  end if;

  update public.schedule_entries entry
  set schedule_date = p_target_date, slot_index = p_target_slot_index, updated_at = now()
  where entry.id = v_source.id;

  if v_target.id is not null then
    insert into public.schedule_entries (
      id, student_id, schedule_date, slot_index, message, source, created_by_admin,
      is_completed, is_in_progress, is_previous_incomplete, estimated_minutes, span_group_id,
      completed_at, completion_source, completed_by_admin, created_at, updated_at
    ) values (
      v_target.id, v_target.student_id, p_source_date, p_source_slot_index,
      v_target.message, v_target.source, v_target.created_by_admin,
      v_target.is_completed, v_target.is_in_progress, v_target.is_previous_incomplete, v_target.estimated_minutes, null,
      v_target.completed_at, v_target.completion_source, v_target.completed_by_admin,
      v_target.created_at, now()
    );
  end if;

  select * into v_source from public.schedule_entries entry where entry.id = p_entry_id;
  return pg_catalog.jsonb_build_object(
    'id', v_source.id,
    'scheduleDate', pg_catalog.to_char(v_source.schedule_date, 'YYYY-MM-DD'),
    'slotIndex', v_source.slot_index,
    'message', v_source.message,
    'source', v_source.source,
    'isCompleted', v_source.is_completed,
    'isInProgress', v_source.is_in_progress,
    'isPreviousIncomplete', v_source.is_previous_incomplete,
    'estimatedMinutes', v_source.estimated_minutes,
    'swapped', v_target.id is not null,
    'updatedAt', v_source.updated_at
  );
end;
$$;

revoke all on function public._schedule_move_entry(
  uuid, uuid, timestamptz, date, integer, date, integer, bigint, bigint, text
) from public, anon, authenticated;

-- Preserve the legacy move helper while adding an atomic target-version check
-- for swaps and empty-slot moves used by current clients.
create or replace function public._schedule_move_entry_checked(
  p_student_id uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_source_date date,
  p_source_slot_index integer,
  p_target_date date,
  p_target_slot_index integer,
  p_source_capacity_version bigint,
  p_target_capacity_version bigint,
  p_target_expected_updated_at timestamptz,
  p_actor_source text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target public.schedule_entries%rowtype;
  v_target_found boolean := false;
begin
  perform public._schedule_lock_student_mutations(p_student_id);

  select * into v_target
  from public.schedule_entries entry
  where entry.student_id = p_student_id
    and entry.schedule_date = p_target_date
    and entry.slot_index = p_target_slot_index
  for update;
  v_target_found := found;

  if (p_target_expected_updated_at is null and v_target_found)
    or (
      p_target_expected_updated_at is not null
      and (
        not v_target_found
        or v_target.updated_at <> p_target_expected_updated_at
      )
    )
  then
    raise exception 'Swap target changed in another session; reload and try again'
      using errcode = '40001';
  end if;

  return public._schedule_move_entry(
    p_student_id,
    p_entry_id,
    p_expected_updated_at,
    p_source_date,
    p_source_slot_index,
    p_target_date,
    p_target_slot_index,
    p_source_capacity_version,
    p_target_capacity_version,
    p_actor_source
  );
end;
$$;

revoke all on function public._schedule_move_entry_checked(
  uuid, uuid, timestamptz, date, integer, date, integer, bigint, bigint, timestamptz, text
) from public, anon, authenticated;

create or replace function public.schedule_student_move_entry_checked(
  p_token uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_source_date date,
  p_source_slot_index integer,
  p_target_date date,
  p_target_slot_index integer,
  p_source_capacity_version bigint,
  p_target_capacity_version bigint,
  p_target_expected_updated_at timestamptz
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then raise exception 'Invalid or expired student session'; end if;
  return public._schedule_move_entry_checked(
    v_student_id, p_entry_id, p_expected_updated_at,
    p_source_date, p_source_slot_index, p_target_date, p_target_slot_index,
    p_source_capacity_version, p_target_capacity_version,
    p_target_expected_updated_at, 'student'
  );
end;
$$;

create or replace function public.schedule_admin_move_entry_checked(
  p_admin_token uuid,
  p_student_id uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_source_date date,
  p_source_slot_index integer,
  p_target_date date,
  p_target_slot_index integer,
  p_source_capacity_version bigint,
  p_target_capacity_version bigint,
  p_target_expected_updated_at timestamptz
)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session'; end if;
  return public._schedule_move_entry_checked(
    p_student_id, p_entry_id, p_expected_updated_at,
    p_source_date, p_source_slot_index, p_target_date, p_target_slot_index,
    p_source_capacity_version, p_target_capacity_version,
    p_target_expected_updated_at, 'admin'
  );
end;
$$;

create or replace function public._schedule_upsert_countdown(
  p_student_id uuid,
  p_position integer,
  p_title text,
  p_start_date date,
  p_end_date date,
  p_daily_hours numeric,
  p_morning_hours numeric,
  p_afternoon_hours numeric,
  p_evening_hours numeric,
  p_expected_updated_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_capacity integer;
  v_existing public.schedule_countdowns%rowtype;
  v_countdown public.schedule_countdowns%rowtype;
  v_title text := btrim(coalesce(p_title, ''));
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if char_length(v_title) not between 1 and 160 then raise exception 'Countdown title is required' using errcode = '22023'; end if;
  if p_start_date not between date '2026-01-01' and date '2050-12-31'
    or p_end_date not between p_start_date and date '2050-12-31'
  then raise exception 'Countdown dates are outside the supported range' using errcode = '22023'; end if;
  if coalesce(p_daily_hours, 0) not between 0 and 24
    or coalesce(p_morning_hours, 0) not between 0 and 24
    or coalesce(p_afternoon_hours, 0) not between 0 and 24
    or coalesce(p_evening_hours, 0) not between 0 and 24
  then raise exception 'Study hours must be between 0 and 24' using errcode = '22023'; end if;

  insert into public.schedule_countdown_capacity (student_id, clock_count)
  values (p_student_id, 6) on conflict (student_id) do nothing;
  select capacity.clock_count into v_capacity
  from public.schedule_countdown_capacity capacity
  where capacity.student_id = p_student_id for update;
  if p_position is null or p_position not between 1 and v_capacity then
    raise exception 'Countdown position is outside the current capacity' using errcode = '22023';
  end if;

  select * into v_existing from public.schedule_countdowns countdown
  where countdown.student_id = p_student_id and countdown.position = p_position
  for update;
  if found then
    if p_expected_updated_at is null or v_existing.updated_at <> p_expected_updated_at then
      raise exception 'Countdown changed in another session; reload and try again' using errcode = '40001';
    end if;
    update public.schedule_countdowns countdown
    set title = v_title, start_date = p_start_date, end_date = p_end_date,
        daily_hours = coalesce(p_daily_hours, 0), morning_hours = coalesce(p_morning_hours, 0),
        afternoon_hours = coalesce(p_afternoon_hours, 0), evening_hours = coalesce(p_evening_hours, 0),
        updated_at = now()
    where countdown.id = v_existing.id
    returning * into v_countdown;
  else
    if p_expected_updated_at is not null then
      raise exception 'Countdown changed in another session; reload and try again' using errcode = '40001';
    end if;
    insert into public.schedule_countdowns (
      student_id, position, title, start_date, end_date,
      daily_hours, morning_hours, afternoon_hours, evening_hours
    ) values (
      p_student_id, p_position, v_title, p_start_date, p_end_date,
      coalesce(p_daily_hours, 0), coalesce(p_morning_hours, 0),
      coalesce(p_afternoon_hours, 0), coalesce(p_evening_hours, 0)
    ) returning * into v_countdown;
  end if;

  return pg_catalog.jsonb_build_object(
    'id', v_countdown.id, 'position', v_countdown.position, 'title', v_countdown.title,
    'startDate', pg_catalog.to_char(v_countdown.start_date, 'YYYY-MM-DD'),
    'endDate', pg_catalog.to_char(v_countdown.end_date, 'YYYY-MM-DD'),
    'dailyHours', v_countdown.daily_hours, 'morningHours', v_countdown.morning_hours,
    'afternoonHours', v_countdown.afternoon_hours, 'eveningHours', v_countdown.evening_hours,
    'updatedAt', v_countdown.updated_at
  );
end;
$$;

revoke all on function public._schedule_upsert_countdown(
  uuid, integer, text, date, date, numeric, numeric, numeric, numeric, timestamptz
) from public, anon, authenticated;

create or replace function public._schedule_delete_countdown(
  p_student_id uuid, p_countdown_id uuid, p_expected_updated_at timestamptz
)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_countdown public.schedule_countdowns%rowtype;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  select * into v_countdown from public.schedule_countdowns countdown
  where countdown.student_id = p_student_id and countdown.id = p_countdown_id for update;
  if not found then return false; end if;
  if p_expected_updated_at is null or v_countdown.updated_at <> p_expected_updated_at then
    raise exception 'Countdown changed in another session; reload and try again' using errcode = '40001';
  end if;
  delete from public.schedule_countdowns countdown where countdown.id = v_countdown.id;
  return true;
end;
$$;

revoke all on function public._schedule_delete_countdown(uuid, uuid, timestamptz)
  from public, anon, authenticated;

create or replace function public._schedule_change_countdown_capacity(p_student_id uuid, p_delta integer)
returns integer language plpgsql security definer set search_path = '' as $$
declare v_capacity public.schedule_countdown_capacity%rowtype; v_target integer;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if p_delta not in (-5, 5) then raise exception 'Countdown capacity changes must use five clocks' using errcode = '22023'; end if;
  insert into public.schedule_countdown_capacity (student_id, clock_count)
  values (p_student_id, 6) on conflict (student_id) do nothing;
  select * into v_capacity from public.schedule_countdown_capacity capacity
  where capacity.student_id = p_student_id for update;
  v_target := v_capacity.clock_count + p_delta;
  if v_target not between 6 and 101 or mod(v_target - 6, 5) <> 0 then
    raise exception 'Countdown capacity is outside the supported range' using errcode = '22023';
  end if;
  if p_delta < 0 and exists (
    select 1 from public.schedule_countdowns countdown
    where countdown.student_id = p_student_id and countdown.position > v_target
  ) then raise exception 'The last five countdown clocks still contain data'; end if;
  update public.schedule_countdown_capacity capacity set clock_count = v_target, updated_at = now()
  where capacity.student_id = p_student_id;
  return v_target;
end;
$$;

revoke all on function public._schedule_change_countdown_capacity(uuid, integer)
  from public, anon, authenticated;

create or replace function public._schedule_change_countdown_capacity_checked(
  p_student_id uuid,
  p_expected_count integer,
  p_delta integer
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare v_capacity public.schedule_countdown_capacity%rowtype;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if p_expected_count is null or p_expected_count not between 6 and 101
    or mod(p_expected_count - 6, 5) <> 0
  then
    raise exception 'Invalid expected countdown capacity' using errcode = '22023';
  end if;

  insert into public.schedule_countdown_capacity (student_id, clock_count)
  values (p_student_id, 6)
  on conflict (student_id) do nothing;

  select * into v_capacity
  from public.schedule_countdown_capacity capacity
  where capacity.student_id = p_student_id
  for update;

  if v_capacity.clock_count <> p_expected_count then
    raise exception 'Countdown capacity changed in another session; reload and try again'
      using errcode = '40001';
  end if;

  return public._schedule_change_countdown_capacity(p_student_id, p_delta);
end;
$$;

revoke all on function public._schedule_change_countdown_capacity_checked(uuid, integer, integer)
  from public, anon, authenticated;

create or replace function public.schedule_student_upsert_countdown(
  p_token uuid, p_position integer, p_title text, p_start_date date, p_end_date date,
  p_daily_hours numeric, p_morning_hours numeric, p_afternoon_hours numeric,
  p_evening_hours numeric, p_expected_updated_at timestamptz default null
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then raise exception 'Invalid or expired student session'; end if;
  return public._schedule_upsert_countdown(v_student_id, p_position, p_title, p_start_date, p_end_date,
    p_daily_hours, p_morning_hours, p_afternoon_hours, p_evening_hours, p_expected_updated_at);
end;
$$;

create or replace function public.schedule_admin_upsert_countdown(
  p_admin_token uuid, p_student_id uuid, p_position integer, p_title text,
  p_start_date date, p_end_date date, p_daily_hours numeric, p_morning_hours numeric,
  p_afternoon_hours numeric, p_evening_hours numeric, p_expected_updated_at timestamptz default null
)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session'; end if;
  return public._schedule_upsert_countdown(p_student_id, p_position, p_title, p_start_date, p_end_date,
    p_daily_hours, p_morning_hours, p_afternoon_hours, p_evening_hours, p_expected_updated_at);
end;
$$;

create or replace function public.schedule_student_delete_countdown(
  p_token uuid, p_countdown_id uuid, p_expected_updated_at timestamptz
)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then raise exception 'Invalid or expired student session'; end if;
  return public._schedule_delete_countdown(v_student_id, p_countdown_id, p_expected_updated_at);
end;
$$;

create or replace function public.schedule_admin_delete_countdown(
  p_admin_token uuid, p_student_id uuid, p_countdown_id uuid, p_expected_updated_at timestamptz
)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session'; end if;
  return public._schedule_delete_countdown(p_student_id, p_countdown_id, p_expected_updated_at);
end;
$$;

create or replace function public.schedule_student_change_countdown_capacity(p_token uuid, p_delta integer)
returns integer language plpgsql security definer set search_path = '' as $$
declare v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then raise exception 'Invalid or expired student session'; end if;
  return public._schedule_change_countdown_capacity(v_student_id, p_delta);
end;
$$;

create or replace function public.schedule_admin_change_countdown_capacity(
  p_admin_token uuid, p_student_id uuid, p_delta integer
)
returns integer language plpgsql security definer set search_path = '' as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session'; end if;
  return public._schedule_change_countdown_capacity(p_student_id, p_delta);
end;
$$;

-- Checked lifecycle RPCs keep the original two-argument capacity RPCs intact
-- for older clients while preventing stale +5/-5 actions in the new portal.
create or replace function public.schedule_student_change_countdown_capacity_checked(
  p_token uuid, p_expected_count integer, p_delta integer
)
returns integer language plpgsql security definer set search_path = '' as $$
declare v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then raise exception 'Invalid or expired student session'; end if;
  return public._schedule_change_countdown_capacity_checked(v_student_id, p_expected_count, p_delta);
end;
$$;

create or replace function public.schedule_admin_change_countdown_capacity_checked(
  p_admin_token uuid, p_student_id uuid, p_expected_count integer, p_delta integer
)
returns integer language plpgsql security definer set search_path = '' as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session'; end if;
  return public._schedule_change_countdown_capacity_checked(p_student_id, p_expected_count, p_delta);
end;
$$;

-- Apply all locally staged entry creates, edits and deletes in one transaction.
create or replace function public._schedule_apply_entry_batch(
  p_student_id uuid,
  p_week_start date,
  p_changes jsonb,
  p_actor_source text,
  p_admin_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_action text;
  v_schedule_date date;
  v_slot_index integer;
  v_expected_updated_at timestamptz;
  v_estimated_minutes integer;
  v_existing public.schedule_entries%rowtype;
  v_effective_source text;
  v_effective_admin_id uuid;
  v_requested_source text;
  v_has_status boolean;
  v_is_completed boolean;
  v_is_in_progress boolean;
  v_is_previous_incomplete boolean;
  v_preserve_completion_metadata boolean;
  v_result jsonb;
  v_deleted boolean;
  v_applied_count integer := 0;
  v_created_count integer := 0;
  v_updated_count integer := 0;
  v_deleted_count integer := 0;
  v_item_count integer;
  v_distinct_count integer;
begin
  if p_actor_source not in ('student', 'admin')
    or (p_actor_source = 'admin' and p_admin_id is null)
    or (p_actor_source = 'student' and p_admin_id is not null)
  then
    raise exception 'Invalid Mass Edit actor' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Student not found' using errcode = '23503';
  end if;

  if p_week_start is null
    or extract(isodow from p_week_start) <> 1
    or p_week_start not between date '2025-12-29' and date '2050-12-26'
  then
    raise exception 'Invalid Mass Edit week' using errcode = '22023';
  end if;

  if p_changes is null
    or pg_catalog.jsonb_typeof(p_changes) <> 'array'
    or pg_catalog.jsonb_array_length(p_changes) not between 1 and 700
    or pg_catalog.octet_length(p_changes::text) > 524288
  then
    raise exception 'Invalid Mass Edit payload' using errcode = '22023';
  end if;

  for v_item in
    select value
    from pg_catalog.jsonb_array_elements(p_changes)
  loop
    if pg_catalog.jsonb_typeof(v_item) <> 'object'
      or (select count(*) from pg_catalog.jsonb_object_keys(v_item)) not between 6 and 10
      or exists (
        select 1
        from pg_catalog.jsonb_object_keys(v_item) as key_row(key_name)
        where key_name not in (
          'action',
          'scheduleDate',
          'slotIndex',
          'message',
          'estimatedMinutes',
          'expectedUpdatedAt',
          'source',
          'isCompleted',
          'isInProgress',
          'isPreviousIncomplete'
        )
      )
      or not (
        v_item ? 'action'
        and v_item ? 'scheduleDate'
        and v_item ? 'slotIndex'
        and v_item ? 'message'
        and v_item ? 'estimatedMinutes'
        and v_item ? 'expectedUpdatedAt'
      )
      or not (
        (
          not (v_item ? 'isCompleted')
          and not (v_item ? 'isInProgress')
          and not (v_item ? 'isPreviousIncomplete')
        )
        or (
          v_item ? 'isCompleted'
          and v_item ? 'isInProgress'
          and v_item ? 'isPreviousIncomplete'
        )
      )
      or pg_catalog.jsonb_typeof(v_item -> 'action') <> 'string'
      or coalesce(v_item ->> 'action', '') not in ('upsert', 'delete')
      or pg_catalog.jsonb_typeof(v_item -> 'scheduleDate') <> 'string'
      or coalesce(v_item ->> 'scheduleDate', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      or pg_catalog.jsonb_typeof(v_item -> 'slotIndex') <> 'number'
      or (v_item ->> 'slotIndex')::numeric <> pg_catalog.trunc((v_item ->> 'slotIndex')::numeric)
      or (v_item ->> 'slotIndex')::numeric not between 1 and 100
      or pg_catalog.jsonb_typeof(v_item -> 'expectedUpdatedAt') not in ('string', 'null')
      or (
        v_item ? 'source'
        and (
          pg_catalog.jsonb_typeof(v_item -> 'source') <> 'string'
          or coalesce(v_item ->> 'source', '') not in ('student', 'admin')
          or (p_actor_source = 'student' and coalesce(v_item ->> 'source', '') <> 'student')
        )
      )
    then
      raise exception 'Invalid Mass Edit item' using errcode = '22023';
    end if;

    v_action := v_item ->> 'action';
    v_has_status := v_item ? 'isCompleted';
    begin
      v_schedule_date := (v_item ->> 'scheduleDate')::date;
      v_expected_updated_at := case
        when pg_catalog.jsonb_typeof(v_item -> 'expectedUpdatedAt') = 'null' then null
        else (v_item ->> 'expectedUpdatedAt')::timestamptz
      end;
    exception when others then
      raise exception 'Invalid Mass Edit date or version' using errcode = '22023';
    end;

    if v_schedule_date not between date '2026-01-01' and date '2050-12-31'
      or v_schedule_date < p_week_start
      or v_schedule_date >= p_week_start + 7
    then
      raise exception 'Mass Edit item is outside the selected week' using errcode = '22023';
    end if;

    if v_action = 'upsert' then
      if pg_catalog.jsonb_typeof(v_item -> 'message') <> 'string'
        or pg_catalog.char_length(pg_catalog.btrim(coalesce(v_item ->> 'message', ''))) not between 1 and 2000
        or pg_catalog.jsonb_typeof(v_item -> 'estimatedMinutes') not in ('number', 'null')
        or (
          pg_catalog.jsonb_typeof(v_item -> 'estimatedMinutes') = 'number'
          and (
            (v_item ->> 'estimatedMinutes')::numeric <> pg_catalog.trunc((v_item ->> 'estimatedMinutes')::numeric)
            or (v_item ->> 'estimatedMinutes')::numeric not between 1 and 10080
          )
        )
        or (
          v_has_status
          and (
            pg_catalog.jsonb_typeof(v_item -> 'isCompleted') <> 'boolean'
            or pg_catalog.jsonb_typeof(v_item -> 'isInProgress') <> 'boolean'
            or pg_catalog.jsonb_typeof(v_item -> 'isPreviousIncomplete') <> 'boolean'
            or (
              (v_item ->> 'isCompleted')::boolean::integer
              + (v_item ->> 'isInProgress')::boolean::integer
              + (v_item ->> 'isPreviousIncomplete')::boolean::integer
            ) > 1
          )
        )
      then
        raise exception 'Invalid Mass Edit upsert' using errcode = '22023';
      end if;
    elsif pg_catalog.jsonb_typeof(v_item -> 'message') <> 'null'
      or pg_catalog.jsonb_typeof(v_item -> 'estimatedMinutes') <> 'null'
      or (v_has_status and (
        pg_catalog.jsonb_typeof(v_item -> 'isCompleted') <> 'null'
        or pg_catalog.jsonb_typeof(v_item -> 'isInProgress') <> 'null'
        or pg_catalog.jsonb_typeof(v_item -> 'isPreviousIncomplete') <> 'null'
      ))
      or v_expected_updated_at is null
    then
      raise exception 'Invalid Mass Edit delete' using errcode = '22023';
    end if;
  end loop;

  select
    count(*),
    count(distinct (
      value ->> 'scheduleDate',
      value ->> 'slotIndex'
    ))
  into v_item_count, v_distinct_count
  from pg_catalog.jsonb_array_elements(p_changes);

  if v_item_count <> v_distinct_count then
    raise exception 'Mass Edit contains duplicate schedule slots' using errcode = '22023';
  end if;

  perform public._schedule_lock_student_mutations(p_student_id);

  for v_item in
    select value
    from pg_catalog.jsonb_array_elements(p_changes)
    order by value ->> 'scheduleDate', ((value ->> 'slotIndex')::integer)
  loop
    v_action := v_item ->> 'action';
    v_schedule_date := (v_item ->> 'scheduleDate')::date;
    v_slot_index := (v_item ->> 'slotIndex')::integer;
    v_expected_updated_at := case
      when pg_catalog.jsonb_typeof(v_item -> 'expectedUpdatedAt') = 'null' then null
      else (v_item ->> 'expectedUpdatedAt')::timestamptz
    end;
    v_has_status := v_item ? 'isCompleted';
    v_requested_source := case when v_item ? 'source' then v_item ->> 'source' else null end;

    if v_action = 'upsert' then
      v_estimated_minutes := case
        when pg_catalog.jsonb_typeof(v_item -> 'estimatedMinutes') = 'null' then null
        else (v_item ->> 'estimatedMinutes')::integer
      end;

      v_existing := null;
      select *
      into v_existing
      from public.schedule_entries entry
      where entry.student_id = p_student_id
        and entry.schedule_date = v_schedule_date
        and entry.slot_index = v_slot_index
      for update;

      if found then
        if v_existing.span_group_id is not null then
          perform 1
          from public.schedule_entries group_entry
          where group_entry.student_id = p_student_id
            and group_entry.span_group_id = v_existing.span_group_id
          order by group_entry.id
          for update;

          if v_expected_updated_at is not null and exists (
            select 1
            from public.schedule_entries group_entry
            where group_entry.student_id = p_student_id
              and group_entry.span_group_id = v_existing.span_group_id
              and group_entry.updated_at <> v_expected_updated_at
          ) then
            raise exception 'Schedule entry changed in another session; reload and try again'
              using errcode = '40001';
          end if;
        end if;

        if p_actor_source = 'student' and v_existing.source = 'admin' then
          raise exception 'Teacher assignments can only be changed by an administrator'
            using errcode = '42501';
        end if;
        v_effective_source := coalesce(v_requested_source, v_existing.source);
        v_effective_admin_id := case
          when coalesce(v_requested_source, v_existing.source) = 'admin'
            then coalesce(v_existing.created_by_admin, p_admin_id)
          else null
        end;
      else
        v_effective_source := coalesce(v_requested_source, p_actor_source);
        v_effective_admin_id := case when coalesce(v_requested_source, p_actor_source) = 'admin' then p_admin_id else null end;
      end if;

      if v_has_status then
        v_is_completed := (v_item ->> 'isCompleted')::boolean;
        v_is_in_progress := (v_item ->> 'isInProgress')::boolean;
        v_is_previous_incomplete := (v_item ->> 'isPreviousIncomplete')::boolean;
        v_preserve_completion_metadata := v_is_completed
          and v_existing.id is not null
          and v_existing.is_completed
          and v_existing.message = (v_item ->> 'message')
          and v_existing.source = v_effective_source;
      end if;

      v_result := public._schedule_upsert_entry(
        p_student_id,
        v_schedule_date,
        v_slot_index,
        v_item ->> 'message',
        v_estimated_minutes,
        v_expected_updated_at,
        v_effective_source,
        v_effective_admin_id
      );
      if v_has_status then
        update public.schedule_entries entry
        set is_completed = v_is_completed,
            is_in_progress = v_is_in_progress,
            is_previous_incomplete = v_is_previous_incomplete,
            completed_at = case
              when v_is_completed and v_preserve_completion_metadata then coalesce(v_existing.completed_at, now())
              when v_is_completed then now()
              else null
            end,
            completion_source = case
              when v_is_completed and v_preserve_completion_metadata then coalesce(v_existing.completion_source, p_actor_source)
              when v_is_completed then p_actor_source
              else null
            end,
            completed_by_admin = case
              when v_is_completed and v_preserve_completion_metadata and coalesce(v_existing.completion_source, p_actor_source) = 'admin'
                then coalesce(v_existing.completed_by_admin, p_admin_id)
              when v_is_completed and p_actor_source = 'admin' then p_admin_id
              else null
            end,
            updated_at = now()
        where entry.id = (v_result ->> 'id')::uuid
           or (
             nullif(v_result ->> 'spanGroupId', '') is not null
             and entry.span_group_id = (v_result ->> 'spanGroupId')::uuid
           );
      end if;
      if v_expected_updated_at is null then
        v_created_count := v_created_count + 1;
      else
        v_updated_count := v_updated_count + 1;
      end if;
    else
      select *
      into v_existing
      from public.schedule_entries entry
      where entry.student_id = p_student_id
        and entry.schedule_date = v_schedule_date
        and entry.slot_index = v_slot_index
      for update;

      if found and v_existing.span_group_id is not null then
        perform 1
        from public.schedule_entries group_entry
        where group_entry.student_id = p_student_id
          and group_entry.span_group_id = v_existing.span_group_id
        order by group_entry.id
        for update;

        if exists (
          select 1
          from public.schedule_entries group_entry
          where group_entry.student_id = p_student_id
            and group_entry.span_group_id = v_existing.span_group_id
            and group_entry.updated_at <> v_expected_updated_at
        ) then
          raise exception 'Schedule entry changed in another session; reload and try again'
            using errcode = '40001';
        end if;
      end if;

      if found and p_actor_source = 'student' and v_existing.source = 'admin' then
        raise exception 'Teacher assignments can only be deleted by an administrator'
          using errcode = '42501';
      end if;

      v_deleted := public._schedule_delete_entry(
        p_student_id,
        v_schedule_date,
        v_slot_index,
        v_expected_updated_at,
        p_actor_source
      );
      if not v_deleted then
        raise exception 'Schedule entry changed in another session; reload and try again'
          using errcode = '40001';
      end if;
      v_deleted_count := v_deleted_count + 1;
    end if;
    v_applied_count := v_applied_count + 1;
  end loop;

  return pg_catalog.jsonb_build_object(
    'appliedCount', v_applied_count,
    'createdCount', v_created_count,
    'updatedCount', v_updated_count,
    'deletedCount', v_deleted_count
  );
end;
$$;

create or replace function public.schedule_student_apply_entry_batch(
  p_token uuid,
  p_week_start date,
  p_changes jsonb
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
  return public._schedule_apply_entry_batch(
    v_student_id,
    p_week_start,
    p_changes,
    'student',
    null
  );
end;
$$;

create or replace function public.schedule_admin_apply_entry_batch(
  p_admin_token uuid,
  p_student_id uuid,
  p_week_start date,
  p_changes jsonb
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
  return public._schedule_apply_entry_batch(
    p_student_id,
    p_week_start,
    p_changes,
    'admin',
    v_admin_id
  );
end;
$$;

revoke all on function public._schedule_apply_entry_batch(uuid, date, jsonb, text, uuid)
  from public, anon, authenticated;
revoke all on function public.schedule_student_apply_entry_batch(uuid, date, jsonb)
  from public, anon, authenticated;
revoke all on function public.schedule_admin_apply_entry_batch(uuid, uuid, date, jsonb)
  from public, anon, authenticated;

revoke all on function public.schedule_admin_login(text, text, text) from public, anon, authenticated;
revoke all on function public.schedule_admin_me(uuid) from public, anon, authenticated;
revoke all on function public.schedule_admin_logout(uuid) from public, anon, authenticated;
revoke all on function public.schedule_student_profile(uuid) from public, anon, authenticated;
revoke all on function public.schedule_student_logout(uuid) from public, anon, authenticated;
revoke all on function public.schedule_student_get_week(uuid, date) from public, anon, authenticated;
revoke all on function public.schedule_student_set_display_preferences(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.schedule_student_upsert_entry(uuid, date, integer, text, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_student_upsert_entry(uuid, date, integer, text, integer, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_student_delete_entry(uuid, date, integer, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_student_change_capacity(uuid, date, bigint, integer) from public, anon, authenticated;
revoke all on function public.schedule_student_set_entry_completed(uuid, uuid, timestamptz, boolean) from public, anon, authenticated;
revoke all on function public.schedule_student_batch_delete_entries(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.schedule_student_batch_set_entries_completed(uuid, jsonb, boolean) from public, anon, authenticated;
revoke all on function public.schedule_student_move_entry(uuid, uuid, timestamptz, date, integer, date, integer, bigint, bigint) from public, anon, authenticated;
revoke all on function public.schedule_student_move_entry_checked(uuid, uuid, timestamptz, date, integer, date, integer, bigint, bigint, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_student_set_entry_in_progress(uuid, uuid, timestamptz, boolean) from public, anon, authenticated;
revoke all on function public.schedule_student_set_entry_previous_incomplete(uuid, uuid, timestamptz, boolean) from public, anon, authenticated;
revoke all on function public.schedule_student_extend_entry_span(uuid, uuid, timestamptz, date) from public, anon, authenticated;
revoke all on function public.schedule_student_upsert_countdown(uuid, integer, text, date, date, numeric, numeric, numeric, numeric, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_student_delete_countdown(uuid, uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_student_change_countdown_capacity(uuid, integer) from public, anon, authenticated;
revoke all on function public.schedule_student_change_countdown_capacity_checked(uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.schedule_admin_list_students(uuid) from public, anon, authenticated;
revoke all on function public.schedule_admin_get_week(uuid, uuid, date) from public, anon, authenticated;
revoke all on function public.schedule_admin_set_display_preferences(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.schedule_admin_upsert_entry(uuid, uuid, date, integer, text, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_admin_upsert_entry(uuid, uuid, date, integer, text, integer, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_admin_delete_entry(uuid, uuid, date, integer, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_admin_change_capacity(uuid, uuid, date, bigint, integer) from public, anon, authenticated;
revoke all on function public.schedule_admin_set_entry_completed(uuid, uuid, uuid, timestamptz, boolean) from public, anon, authenticated;
revoke all on function public.schedule_admin_batch_delete_entries(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.schedule_admin_batch_set_entries_completed(uuid, uuid, jsonb, boolean) from public, anon, authenticated;
revoke all on function public.schedule_admin_move_entry(uuid, uuid, uuid, timestamptz, date, integer, date, integer, bigint, bigint) from public, anon, authenticated;
revoke all on function public.schedule_admin_move_entry_checked(uuid, uuid, uuid, timestamptz, date, integer, date, integer, bigint, bigint, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_admin_set_entry_in_progress(uuid, uuid, uuid, timestamptz, boolean) from public, anon, authenticated;
revoke all on function public.schedule_admin_set_entry_previous_incomplete(uuid, uuid, uuid, timestamptz, boolean) from public, anon, authenticated;
revoke all on function public.schedule_admin_extend_entry_span(uuid, uuid, uuid, timestamptz, date) from public, anon, authenticated;
revoke all on function public.schedule_admin_upsert_countdown(uuid, uuid, integer, text, date, date, numeric, numeric, numeric, numeric, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_admin_delete_countdown(uuid, uuid, uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.schedule_admin_change_countdown_capacity(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.schedule_admin_change_countdown_capacity_checked(uuid, uuid, integer, integer) from public, anon, authenticated;

-- The rate-limited Worker supplies the private service secret.
grant execute on function public.schedule_admin_login(text, text, text) to anon;

grant execute on function public.schedule_admin_me(uuid) to authenticated;
grant execute on function public.schedule_admin_logout(uuid) to authenticated;
grant execute on function public.schedule_admin_list_students(uuid) to authenticated;
grant execute on function public.schedule_admin_get_week(uuid, uuid, date) to authenticated;
grant execute on function public.schedule_admin_set_display_preferences(uuid, uuid, jsonb) to authenticated;
grant execute on function public.schedule_admin_upsert_entry(uuid, uuid, date, integer, text, timestamptz) to authenticated;
grant execute on function public.schedule_admin_upsert_entry(uuid, uuid, date, integer, text, integer, timestamptz) to authenticated;
grant execute on function public.schedule_admin_delete_entry(uuid, uuid, date, integer, timestamptz) to authenticated;
grant execute on function public.schedule_admin_change_capacity(uuid, uuid, date, bigint, integer) to authenticated;
grant execute on function public.schedule_admin_set_entry_completed(uuid, uuid, uuid, timestamptz, boolean) to authenticated;
grant execute on function public.schedule_admin_batch_delete_entries(uuid, uuid, jsonb) to authenticated;
grant execute on function public.schedule_admin_batch_set_entries_completed(uuid, uuid, jsonb, boolean) to authenticated;
grant execute on function public.schedule_admin_move_entry(uuid, uuid, uuid, timestamptz, date, integer, date, integer, bigint, bigint) to authenticated;
grant execute on function public.schedule_admin_move_entry_checked(uuid, uuid, uuid, timestamptz, date, integer, date, integer, bigint, bigint, timestamptz) to authenticated;
grant execute on function public.schedule_admin_set_entry_in_progress(uuid, uuid, uuid, timestamptz, boolean) to authenticated;
grant execute on function public.schedule_admin_set_entry_previous_incomplete(uuid, uuid, uuid, timestamptz, boolean) to authenticated;
grant execute on function public.schedule_admin_extend_entry_span(uuid, uuid, uuid, timestamptz, date) to authenticated;
grant execute on function public.schedule_admin_upsert_countdown(uuid, uuid, integer, text, date, date, numeric, numeric, numeric, numeric, timestamptz) to authenticated;
grant execute on function public.schedule_admin_delete_countdown(uuid, uuid, uuid, timestamptz) to authenticated;
grant execute on function public.schedule_admin_change_countdown_capacity(uuid, uuid, integer) to authenticated;
grant execute on function public.schedule_admin_change_countdown_capacity_checked(uuid, uuid, integer, integer) to authenticated;
grant execute on function public.schedule_admin_apply_entry_batch(uuid, uuid, date, jsonb) to authenticated;

grant execute on function public.schedule_student_profile(uuid) to authenticated;
grant execute on function public.schedule_student_logout(uuid) to authenticated;
grant execute on function public.schedule_student_get_week(uuid, date) to authenticated;
grant execute on function public.schedule_student_set_display_preferences(uuid, jsonb) to authenticated;
grant execute on function public.schedule_student_upsert_entry(uuid, date, integer, text, timestamptz) to authenticated;
grant execute on function public.schedule_student_upsert_entry(uuid, date, integer, text, integer, timestamptz) to authenticated;
grant execute on function public.schedule_student_delete_entry(uuid, date, integer, timestamptz) to authenticated;
grant execute on function public.schedule_student_change_capacity(uuid, date, bigint, integer) to authenticated;
grant execute on function public.schedule_student_set_entry_completed(uuid, uuid, timestamptz, boolean) to authenticated;
grant execute on function public.schedule_student_batch_delete_entries(uuid, jsonb) to authenticated;
grant execute on function public.schedule_student_batch_set_entries_completed(uuid, jsonb, boolean) to authenticated;
grant execute on function public.schedule_student_move_entry(uuid, uuid, timestamptz, date, integer, date, integer, bigint, bigint) to authenticated;
grant execute on function public.schedule_student_move_entry_checked(uuid, uuid, timestamptz, date, integer, date, integer, bigint, bigint, timestamptz) to authenticated;
grant execute on function public.schedule_student_set_entry_in_progress(uuid, uuid, timestamptz, boolean) to authenticated;
grant execute on function public.schedule_student_set_entry_previous_incomplete(uuid, uuid, timestamptz, boolean) to authenticated;
grant execute on function public.schedule_student_extend_entry_span(uuid, uuid, timestamptz, date) to authenticated;
grant execute on function public.schedule_student_upsert_countdown(uuid, integer, text, date, date, numeric, numeric, numeric, numeric, timestamptz) to authenticated;
grant execute on function public.schedule_student_delete_countdown(uuid, uuid, timestamptz) to authenticated;
grant execute on function public.schedule_student_change_countdown_capacity(uuid, integer) to authenticated;
grant execute on function public.schedule_student_change_countdown_capacity_checked(uuid, integer, integer) to authenticated;
grant execute on function public.schedule_student_apply_entry_batch(uuid, date, jsonb) to authenticated;

notify pgrst, 'reload schema';

commit;
