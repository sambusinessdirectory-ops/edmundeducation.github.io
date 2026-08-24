-- Card 57 per-question thinking logs, 24-hour day planner and completed-task history.
-- Apply after supabase-execution-system-planner-analytics.sql.

begin;

create table if not exists public.execution_system_planner_thinking_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  owner_kind text not null,
  owner_id uuid not null,
  task_id uuid not null references public.execution_system_planner_tasks(id) on delete cascade,
  question_number smallint not null,
  elapsed_seconds integer not null,
  started_at timestamptz not null,
  ended_at timestamptz not null default pg_catalog.now(),
  created_at timestamptz not null default pg_catalog.now(),
  check (owner_kind in ('student', 'admin')),
  check (question_number between 1 and 27),
  check (elapsed_seconds between 1 and 86400),
  check (started_at <= ended_at)
);

create index if not exists execution_system_planner_thinking_owner_date_idx
  on public.execution_system_planner_thinking_logs (owner_kind, owner_id, ended_at desc);
create index if not exists execution_system_planner_thinking_task_question_idx
  on public.execution_system_planner_thinking_logs (task_id, question_number);

create table if not exists public.execution_system_planner_hour_blocks (
  owner_kind text not null,
  owner_id uuid not null,
  task_date date not null,
  hour_number smallint not null,
  plan_text text not null default '',
  task_slots integer[] not null default '{}'::integer[],
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  primary key (owner_kind, owner_id, task_date, hour_number),
  check (owner_kind in ('student', 'admin')),
  check (task_date between date '2026-01-01' and date '2050-12-31'),
  check (hour_number between 0 and 23),
  check (plan_text = pg_catalog.btrim(plan_text)),
  check (pg_catalog.char_length(plan_text) <= 2000),
  check (pg_catalog.cardinality(task_slots) <= 1000),
  check (pg_catalog.array_position(task_slots, null) is null)
);

create index if not exists execution_system_planner_hour_blocks_owner_date_idx
  on public.execution_system_planner_hour_blocks (owner_kind, owner_id, task_date, hour_number);

alter table public.execution_system_planner_thinking_logs enable row level security;
alter table public.execution_system_planner_hour_blocks enable row level security;
revoke all on table public.execution_system_planner_thinking_logs from public, anon, authenticated, service_role;
revoke all on table public.execution_system_planner_hour_blocks from public, anon, authenticated, service_role;

drop function if exists public.execution_system_planner_tasks_load(date, text, uuid, uuid);

create function public.execution_system_planner_tasks_load(
  p_task_date date,
  p_status text default 'active',
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns table (
  id uuid, slot_number integer, title text, answers jsonb, status text,
  completed_at timestamptz, created_at timestamptz, updated_at timestamptz,
  difficulty_rating smallint, writing_elapsed_seconds integer,
  writing_timer_started_at timestamptz, thinking_seconds jsonb
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
         task.completed_at, task.created_at, task.updated_at,
         task.difficulty_rating, task.writing_elapsed_seconds,
         task.writing_timer_started_at,
         coalesce((
           select pg_catalog.jsonb_object_agg('q' || totals.question_number::text, totals.total_seconds)
           from (
             select log.question_number, sum(log.elapsed_seconds)::bigint as total_seconds
             from public.execution_system_planner_thinking_logs log
             where log.task_id = task.id and log.owner_kind = v_owner_kind and log.owner_id = v_owner_id
             group by log.question_number
           ) totals
         ), '{}'::jsonb)
  from public.execution_system_planner_tasks task
  where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
    and task.task_date = p_task_date and task.status = p_status
  order by case when p_status = 'active' then task.slot_number end,
           case when p_status = 'archived' then task.completed_at end desc;
end;
$$;

create or replace function public.execution_system_planner_thinking_record(
  p_task_id uuid,
  p_question_number integer,
  p_elapsed_seconds integer,
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
  v_total integer;
begin
  if p_task_id is null or p_question_number not between 1 and 27
    or p_elapsed_seconds not between 1 and 86400
  then
    raise exception 'Thinking-time record is invalid' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;
  if not exists (
    select 1 from public.execution_system_planner_tasks task
    where task.id = p_task_id and task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
  ) then
    raise exception 'Planner task was not found' using errcode = 'P0002';
  end if;

  insert into public.execution_system_planner_thinking_logs
    (owner_kind, owner_id, task_id, question_number, elapsed_seconds, started_at, ended_at)
  values
    (v_owner_kind, v_owner_id, p_task_id, p_question_number, p_elapsed_seconds,
     pg_catalog.now() - pg_catalog.make_interval(secs => p_elapsed_seconds), pg_catalog.now());

  select sum(log.elapsed_seconds)::integer into v_total
  from public.execution_system_planner_thinking_logs log
  where log.task_id = p_task_id and log.owner_kind = v_owner_kind and log.owner_id = v_owner_id
    and log.question_number = p_question_number;
  return coalesce(v_total, 0);
end;
$$;

create or replace function public.execution_system_planner_thinking_logs_load(
  p_from_date date,
  p_to_date date,
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns table (
  log_id uuid, task_id uuid, task_date date, slot_number integer, task_title text,
  question_number smallint, elapsed_seconds integer, started_at timestamptz, ended_at timestamptz
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
  if p_from_date is null or p_to_date is null or p_from_date > p_to_date
    or p_from_date < date '2026-01-01' or p_to_date > date '2050-12-31'
    or p_to_date - p_from_date > 366
  then
    raise exception 'Thinking-log date range is invalid' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  return query
  select log.id, task.id, task.task_date, task.slot_number, task.title,
         log.question_number, log.elapsed_seconds, log.started_at, log.ended_at
  from public.execution_system_planner_thinking_logs log
  join public.execution_system_planner_tasks task on task.id = log.task_id
  where log.owner_kind = v_owner_kind and log.owner_id = v_owner_id
    and (log.ended_at at time zone 'Asia/Hong_Kong')::date between p_from_date and p_to_date
  order by log.ended_at desc
  limit 5000;
end;
$$;

create or replace function public.execution_system_planner_hour_blocks_load(
  p_task_date date,
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns table (hour_number smallint, plan_text text, task_slots integer[], updated_at timestamptz)
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
  then raise exception 'Day-planner date is invalid' using errcode = '22023'; end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  return query
  select block.hour_number, block.plan_text, block.task_slots, block.updated_at
  from public.execution_system_planner_hour_blocks block
  where block.owner_kind = v_owner_kind and block.owner_id = v_owner_id and block.task_date = p_task_date
  order by block.hour_number;
end;
$$;

create or replace function public.execution_system_planner_hour_block_save(
  p_task_date date,
  p_hour_number integer,
  p_plan_text text default '',
  p_task_slots integer[] default '{}'::integer[],
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns table (hour_number smallint, plan_text text, task_slots integer[], updated_at timestamptz)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner_kind text;
  v_owner_id uuid;
  v_capacity integer;
  v_text text := pg_catalog.btrim(coalesce(p_plan_text, ''));
  v_slots integer[];
begin
  if p_task_date is null or p_task_date not between date '2026-01-01' and date '2050-12-31'
    or p_hour_number not between 0 and 23 or pg_catalog.char_length(v_text) > 2000
  then raise exception 'Day-planner block is invalid' using errcode = '22023'; end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  select coalesce(planner_day.capacity, 10) into v_capacity
  from public.execution_system_planner_days planner_day
  where planner_day.owner_kind = v_owner_kind and planner_day.owner_id = v_owner_id and planner_day.task_date = p_task_date;
  v_capacity := coalesce(v_capacity, 10);
  select coalesce(pg_catalog.array_agg(slot order by slot), '{}'::integer[]) into v_slots
  from (select distinct slot from pg_catalog.unnest(coalesce(p_task_slots, '{}'::integer[])) slot
        where slot between 1 and v_capacity) valid_slots;
  if pg_catalog.cardinality(coalesce(p_task_slots, '{}'::integer[])) <> pg_catalog.cardinality(v_slots)
  then raise exception 'One or more task tags are unavailable' using errcode = '22023'; end if;

  if v_text = '' and pg_catalog.cardinality(v_slots) = 0 then
    delete from public.execution_system_planner_hour_blocks block
    where block.owner_kind = v_owner_kind and block.owner_id = v_owner_id
      and block.task_date = p_task_date and block.hour_number = p_hour_number;
    return query select p_hour_number::smallint, ''::text, '{}'::integer[], pg_catalog.now();
    return;
  end if;

  return query
  insert into public.execution_system_planner_hour_blocks as block
    (owner_kind, owner_id, task_date, hour_number, plan_text, task_slots, updated_at)
  values (v_owner_kind, v_owner_id, p_task_date, p_hour_number, v_text, v_slots, pg_catalog.now())
  on conflict on constraint execution_system_planner_hour_blocks_pkey do update
    set plan_text = excluded.plan_text, task_slots = excluded.task_slots, updated_at = pg_catalog.now()
  returning block.hour_number, block.plan_text, block.task_slots, block.updated_at;
end;
$$;

create or replace function public.execution_system_planner_completed_tasks_load(
  p_month date,
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns table (
  id uuid, task_date date, slot_number integer, title text, completed_at timestamptz,
  difficulty_rating smallint, writing_elapsed_seconds integer, thinking_elapsed_seconds bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_owner_kind text;
  v_owner_id uuid;
  v_month date := pg_catalog.date_trunc('month', p_month::timestamp)::date;
begin
  if p_month is null or p_month not between date '2026-01-01' and date '2050-12-31'
  then raise exception 'Completed-task month is invalid' using errcode = '22023'; end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  return query
  select task.id, task.task_date, task.slot_number, task.title, task.completed_at,
         task.difficulty_rating, task.writing_elapsed_seconds,
         coalesce((select sum(log.elapsed_seconds) from public.execution_system_planner_thinking_logs log
                   where log.task_id = task.id and log.owner_kind = v_owner_kind and log.owner_id = v_owner_id), 0)::bigint
  from public.execution_system_planner_tasks task
  where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id and task.status = 'archived'
    and task.completed_at >= v_month::timestamp
    and task.completed_at < (v_month + interval '1 month')::timestamp
  order by task.completed_at desc;
end;
$$;

revoke all on function public.execution_system_planner_tasks_load(date, text, uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_thinking_record(uuid, integer, integer, uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_thinking_logs_load(date, date, uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_hour_blocks_load(date, uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_hour_block_save(date, integer, text, integer[], uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_completed_tasks_load(date, uuid, uuid) from public, anon, authenticated, service_role;

grant execute on function public.execution_system_planner_tasks_load(date, text, uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_thinking_record(uuid, integer, integer, uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_thinking_logs_load(date, date, uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_hour_blocks_load(date, uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_hour_block_save(date, integer, text, integer[], uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_completed_tasks_load(date, uuid, uuid) to authenticated;

commit;
