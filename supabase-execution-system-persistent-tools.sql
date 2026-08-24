-- Card 57 persistent achievement counters and dated task planner.
-- Apply after supabase-execution-system.sql and the shared Flashcard student accounts.

begin;

do $$
begin
  if pg_catalog.to_regclass('public.flashcard_students') is null
    or pg_catalog.to_regclass('public.flashcard_student_sessions') is null
    or pg_catalog.to_regclass('public.execution_system_admin_accounts') is null
    or pg_catalog.to_regclass('public.execution_system_admin_sessions') is null
  then
    raise exception 'Apply the shared student accounts and Card 57 authentication migrations first';
  end if;
end;
$$;

create schema if not exists execution_private;
revoke all on schema execution_private from public, anon, authenticated;

create table if not exists public.execution_system_step_achievements (
  owner_kind text not null,
  owner_id uuid not null,
  table_id text not null,
  step_index integer not null,
  success_count integer not null default 0,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  primary key (owner_kind, owner_id, table_id, step_index),
  check (owner_kind in ('student', 'admin')),
  check (table_id in (
    'understand-procrastination', 'start-now', 'fixed-action-patterns', 'before-each-item',
    'complete-execution', 'loneliness', 'finish-line-phobia', 'reply-phobia'
  )),
  check (step_index between 0 and 199),
  check (success_count between 0 and 99999)
);

create index if not exists execution_system_step_achievements_owner_idx
  on public.execution_system_step_achievements (owner_kind, owner_id);

create table if not exists public.execution_system_planner_days (
  owner_kind text not null,
  owner_id uuid not null,
  task_date date not null,
  capacity integer not null default 10,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  primary key (owner_kind, owner_id, task_date),
  check (owner_kind in ('student', 'admin')),
  check (task_date between date '2026-01-01' and date '2050-12-31'),
  check (capacity between 10 and 1000 and capacity % 10 = 0)
);

create table if not exists public.execution_system_planner_tasks (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_kind text not null,
  owner_id uuid not null,
  task_date date not null,
  slot_number integer not null,
  title text not null,
  answers jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  completed_at timestamptz,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  check (owner_kind in ('student', 'admin')),
  check (task_date between date '2026-01-01' and date '2050-12-31'),
  check (slot_number between 1 and 1000),
  check (title = pg_catalog.btrim(title)),
  check (pg_catalog.char_length(title) between 1 and 500),
  check (pg_catalog.jsonb_typeof(answers) = 'object'),
  check (pg_catalog.octet_length(answers::text) <= 65536),
  check (status in ('active', 'archived')),
  check ((status = 'active' and completed_at is null) or (status = 'archived' and completed_at is not null))
);

create unique index if not exists execution_system_planner_tasks_active_slot_idx
  on public.execution_system_planner_tasks (owner_kind, owner_id, task_date, slot_number)
  where status = 'active';
create index if not exists execution_system_planner_tasks_owner_date_idx
  on public.execution_system_planner_tasks (owner_kind, owner_id, task_date, status, slot_number);
create index if not exists execution_system_planner_tasks_archive_idx
  on public.execution_system_planner_tasks (owner_kind, owner_id, completed_at desc)
  where status = 'archived';

alter table public.execution_system_step_achievements enable row level security;
alter table public.execution_system_planner_days enable row level security;
alter table public.execution_system_planner_tasks enable row level security;

revoke all on table public.execution_system_step_achievements from public, anon, authenticated, service_role;
revoke all on table public.execution_system_planner_days from public, anon, authenticated, service_role;
revoke all on table public.execution_system_planner_tasks from public, anon, authenticated, service_role;

create or replace function execution_private.execution_system_owner(
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns table (owner_kind text, owner_id uuid)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication is required' using errcode = '42501';
  end if;
  if (p_student_token is null) = (p_admin_token is null) then
    raise exception 'Provide exactly one account session' using errcode = '22023';
  end if;

  if p_student_token is not null then
    return query
    select 'student'::text, session_row.student_id
    from public.flashcard_student_sessions session_row
    join public.flashcard_students student on student.id = session_row.student_id
    where session_row.token = p_student_token
      and session_row.expires_at > pg_catalog.now()
      and student.deleted_at is null
    limit 1;
  else
    return query
    select 'admin'::text, session_row.admin_id
    from public.execution_system_admin_sessions session_row
    join public.execution_system_admin_accounts account on account.id = session_row.admin_id
    where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256')
      and session_row.expires_at > pg_catalog.now()
      and account.is_active
    limit 1;
  end if;

  if not found then
    raise exception 'Account session is invalid or expired' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.execution_system_step_achievements_load(
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns table (table_id text, step_index integer, success_count integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_owner_kind text;
  v_owner_id uuid;
begin
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  return query
  select achievement.table_id, achievement.step_index, achievement.success_count
  from public.execution_system_step_achievements achievement
  where achievement.owner_kind = v_owner_kind and achievement.owner_id = v_owner_id
  order by achievement.table_id, achievement.step_index;
end;
$$;

create or replace function public.execution_system_step_achievement_adjust(
  p_table_id text,
  p_step_index integer,
  p_delta integer,
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner_kind text;
  v_owner_id uuid;
  v_count integer;
begin
  if p_table_id not in (
    'understand-procrastination', 'start-now', 'fixed-action-patterns', 'before-each-item',
    'complete-execution', 'loneliness', 'finish-line-phobia', 'reply-phobia'
  ) or p_step_index is null or p_step_index not between 0 and 199 or p_delta not in (-1, 1)
  then
    raise exception 'Achievement request is invalid' using errcode = '22023';
  end if;

  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  insert into public.execution_system_step_achievements as achievement
    (owner_kind, owner_id, table_id, step_index, success_count, updated_at)
  values
    (v_owner_kind, v_owner_id, p_table_id, p_step_index, case when p_delta = 1 then 1 else 0 end, pg_catalog.now())
  on conflict (owner_kind, owner_id, table_id, step_index) do update
    set success_count = greatest(0, least(99999, achievement.success_count + p_delta)),
        updated_at = pg_catalog.now()
  returning achievement.success_count into v_count;

  return v_count;
end;
$$;

create or replace function public.execution_system_planner_day_capacity(
  p_task_date date,
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner_kind text;
  v_owner_id uuid;
  v_capacity integer;
begin
  if p_task_date is null or p_task_date not between date '2026-01-01' and date '2050-12-31' then
    raise exception 'Planner date is outside 2026-2050' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  insert into public.execution_system_planner_days as planner_day
    (owner_kind, owner_id, task_date, capacity)
  values (v_owner_kind, v_owner_id, p_task_date, 10)
  on conflict (owner_kind, owner_id, task_date) do update set updated_at = planner_day.updated_at
  returning planner_day.capacity into v_capacity;
  return v_capacity;
end;
$$;

create or replace function public.execution_system_planner_capacity_add(
  p_task_date date,
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns integer
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner_kind text;
  v_owner_id uuid;
  v_capacity integer;
begin
  if p_task_date is null or p_task_date not between date '2026-01-01' and date '2050-12-31' then
    raise exception 'Planner date is outside 2026-2050' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  insert into public.execution_system_planner_days as planner_day
    (owner_kind, owner_id, task_date, capacity)
  values (v_owner_kind, v_owner_id, p_task_date, 20)
  on conflict (owner_kind, owner_id, task_date) do update
    set capacity = least(1000, planner_day.capacity + 10), updated_at = pg_catalog.now()
  returning planner_day.capacity into v_capacity;
  return v_capacity;
end;
$$;

create or replace function public.execution_system_planner_tasks_load(
  p_task_date date,
  p_status text default 'active',
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns table (
  id uuid, slot_number integer, title text, answers jsonb, status text,
  completed_at timestamptz, created_at timestamptz, updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_owner_kind text;
  v_owner_id uuid;
begin
  if p_task_date is null or p_task_date not between date '2026-01-01' and date '2050-12-31'
    or p_status not in ('active', 'archived')
  then
    raise exception 'Planner request is invalid' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  return query
  select task.id, task.slot_number, task.title, task.answers, task.status,
         task.completed_at, task.created_at, task.updated_at
  from public.execution_system_planner_tasks task
  where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
    and task.task_date = p_task_date and task.status = p_status
  order by case when p_status = 'active' then task.slot_number end,
           case when p_status = 'archived' then task.completed_at end desc;
end;
$$;

create or replace function public.execution_system_planner_task_save(
  p_task_date date,
  p_slot_number integer,
  p_title text,
  p_answers jsonb default '{}'::jsonb,
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns table (id uuid, slot_number integer, title text, answers jsonb, updated_at timestamptz)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner_kind text;
  v_owner_id uuid;
  v_capacity integer;
  v_title text := pg_catalog.btrim(coalesce(p_title, ''));
begin
  if p_task_date is null or p_task_date not between date '2026-01-01' and date '2050-12-31'
    or p_slot_number is null or p_slot_number not between 1 and 1000
    or pg_catalog.char_length(v_title) not between 1 and 500
    or p_answers is null or pg_catalog.jsonb_typeof(p_answers) <> 'object'
    or pg_catalog.octet_length(p_answers::text) > 65536
  then
    raise exception 'Planner task is invalid' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  select planner_day.capacity into v_capacity
  from public.execution_system_planner_days planner_day
  where planner_day.owner_kind = v_owner_kind and planner_day.owner_id = v_owner_id
    and planner_day.task_date = p_task_date;
  if v_capacity is null then
    insert into public.execution_system_planner_days (owner_kind, owner_id, task_date, capacity)
    values (v_owner_kind, v_owner_id, p_task_date, 10)
    on conflict (owner_kind, owner_id, task_date) do nothing;
    v_capacity := 10;
  end if;
  if p_slot_number > v_capacity then raise exception 'Planner slot is not available' using errcode = '22023'; end if;

  return query
  update public.execution_system_planner_tasks task
  set title = v_title, answers = p_answers, updated_at = pg_catalog.now()
  where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
    and task.task_date = p_task_date and task.slot_number = p_slot_number
    and task.status = 'active'
  returning task.id, task.slot_number, task.title, task.answers, task.updated_at;
  if found then return; end if;

  return query
  insert into public.execution_system_planner_tasks as task
    (owner_kind, owner_id, task_date, slot_number, title, answers, status, completed_at, updated_at)
  values
    (v_owner_kind, v_owner_id, p_task_date, p_slot_number, v_title, p_answers, 'active', null, pg_catalog.now())
  returning task.id, task.slot_number, task.title, task.answers, task.updated_at;
end;
$$;

create or replace function public.execution_system_planner_task_archive(
  p_task_id uuid,
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner_kind text;
  v_owner_id uuid;
begin
  if p_task_id is null then raise exception 'Planner task ID is required' using errcode = '22023'; end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  update public.execution_system_planner_tasks task
  set status = 'archived', completed_at = pg_catalog.now(), updated_at = pg_catalog.now()
  where task.id = p_task_id and task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
    and task.status = 'active';
  return found;
end;
$$;

revoke all on function execution_private.execution_system_owner(uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_step_achievements_load(uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_step_achievement_adjust(text, integer, integer, uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_day_capacity(date, uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_capacity_add(date, uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_tasks_load(date, text, uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_task_save(date, integer, text, jsonb, uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_task_archive(uuid, uuid, uuid) from public, anon, authenticated, service_role;

grant execute on function public.execution_system_step_achievements_load(uuid, uuid) to authenticated;
grant execute on function public.execution_system_step_achievement_adjust(text, integer, integer, uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_day_capacity(date, uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_capacity_add(date, uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_tasks_load(date, text, uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_task_save(date, integer, text, jsonb, uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_task_archive(uuid, uuid, uuid) to authenticated;

commit;
