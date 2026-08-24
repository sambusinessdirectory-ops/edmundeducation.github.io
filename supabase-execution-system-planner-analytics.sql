-- Card 57 planner timing, ratings, carry-forward, reactivation and analytics.
-- Apply after supabase-execution-system-persistent-tools.sql.

begin;

alter table public.execution_system_planner_tasks
  add column if not exists difficulty_rating smallint,
  add column if not exists writing_elapsed_seconds integer not null default 0,
  add column if not exists writing_timer_started_at timestamptz;

alter table public.execution_system_planner_tasks
  drop constraint if exists execution_system_planner_tasks_difficulty_rating_check,
  drop constraint if exists execution_system_planner_tasks_writing_elapsed_seconds_check;

alter table public.execution_system_planner_tasks
  add constraint execution_system_planner_tasks_difficulty_rating_check
    check (difficulty_rating is null or difficulty_rating between 1 and 5),
  add constraint execution_system_planner_tasks_writing_elapsed_seconds_check
    check (writing_elapsed_seconds between 0 and 315576000);

create index if not exists execution_system_planner_tasks_owner_created_idx
  on public.execution_system_planner_tasks (owner_kind, owner_id, created_at);

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
  writing_timer_started_at timestamptz
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
         task.writing_timer_started_at
  from public.execution_system_planner_tasks task
  where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
    and task.task_date = p_task_date and task.status = p_status
  order by case when p_status = 'active' then task.slot_number end,
           case when p_status = 'archived' then task.completed_at end desc;
end;
$$;

create or replace function public.execution_system_planner_task_timer(
  p_task_id uuid,
  p_action text,
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns table (
  id uuid,
  writing_elapsed_seconds integer,
  writing_timer_started_at timestamptz,
  updated_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner_kind text;
  v_owner_id uuid;
begin
  if p_task_id is null or p_action not in ('start', 'stop') then
    raise exception 'Timer request is invalid' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  if p_action = 'start' then
    return query
    update public.execution_system_planner_tasks task
    set writing_timer_started_at = coalesce(task.writing_timer_started_at, pg_catalog.now()),
        updated_at = pg_catalog.now()
    where task.id = p_task_id and task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
      and task.status = 'active'
    returning task.id, task.writing_elapsed_seconds, task.writing_timer_started_at, task.updated_at;
  else
    return query
    update public.execution_system_planner_tasks task
    set writing_elapsed_seconds = least(
          315576000,
          task.writing_elapsed_seconds + case
            when task.writing_timer_started_at is null then 0
            else greatest(0, pg_catalog.floor(extract(epoch from (pg_catalog.now() - task.writing_timer_started_at)))::integer)
          end
        ),
        writing_timer_started_at = null,
        updated_at = pg_catalog.now()
    where task.id = p_task_id and task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
      and task.status = 'active'
    returning task.id, task.writing_elapsed_seconds, task.writing_timer_started_at, task.updated_at;
  end if;
end;
$$;

create or replace function public.execution_system_planner_task_rating(
  p_task_id uuid,
  p_rating integer,
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns smallint
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner_kind text;
  v_owner_id uuid;
  v_rating smallint;
begin
  if p_task_id is null or p_rating is null or p_rating not between 1 and 5 then
    raise exception 'Task rating must be between 1 and 5' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  update public.execution_system_planner_tasks task
  set difficulty_rating = p_rating::smallint, updated_at = pg_catalog.now()
  where task.id = p_task_id and task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
  returning task.difficulty_rating into v_rating;
  if v_rating is null then raise exception 'Task was not found' using errcode = 'P0002'; end if;
  return v_rating;
end;
$$;

create or replace function public.execution_system_planner_task_move_tomorrow(
  p_task_id uuid,
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns table (id uuid, task_date date, slot_number integer)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner_kind text;
  v_owner_id uuid;
  v_task public.execution_system_planner_tasks%rowtype;
  v_target_date date;
  v_target_slot integer;
  v_capacity integer;
begin
  if p_task_id is null then raise exception 'Task ID is required' using errcode = '22023'; end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  select task.* into v_task
  from public.execution_system_planner_tasks task
  where task.id = p_task_id and task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
    and task.status = 'active'
  for update;
  if v_task.id is null then raise exception 'Active task was not found' using errcode = 'P0002'; end if;

  v_target_date := v_task.task_date + 1;
  if v_target_date > date '2050-12-31' then
    raise exception 'The planner cannot move beyond 2050-12-31' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_owner_kind || ':' || v_owner_id::text || ':' || v_target_date::text, 57)
  );
  insert into public.execution_system_planner_days as planner_day
    (owner_kind, owner_id, task_date, capacity)
  values (v_owner_kind, v_owner_id, v_target_date, 10)
  on conflict on constraint execution_system_planner_days_pkey do update set updated_at = planner_day.updated_at
  returning planner_day.capacity into v_capacity;

  if v_task.slot_number <= v_capacity and not exists (
    select 1 from public.execution_system_planner_tasks occupied
    where occupied.owner_kind = v_owner_kind and occupied.owner_id = v_owner_id
      and occupied.task_date = v_target_date and occupied.slot_number = v_task.slot_number
      and occupied.status = 'active'
  ) then
    v_target_slot := v_task.slot_number;
  else
    select candidate.slot into v_target_slot
    from pg_catalog.generate_series(1, v_capacity) candidate(slot)
    where not exists (
      select 1 from public.execution_system_planner_tasks occupied
      where occupied.owner_kind = v_owner_kind and occupied.owner_id = v_owner_id
        and occupied.task_date = v_target_date and occupied.slot_number = candidate.slot
        and occupied.status = 'active'
    )
    order by candidate.slot
    limit 1;
  end if;

  if v_target_slot is null then
    if v_capacity >= 1000 then raise exception 'Tomorrow has no available task slots' using errcode = '22023'; end if;
    update public.execution_system_planner_days planner_day
    set capacity = least(1000, planner_day.capacity + 10), updated_at = pg_catalog.now()
    where planner_day.owner_kind = v_owner_kind and planner_day.owner_id = v_owner_id
      and planner_day.task_date = v_target_date
    returning planner_day.capacity - 9 into v_target_slot;
  end if;

  return query
  update public.execution_system_planner_tasks task
  set task_date = v_target_date,
      slot_number = v_target_slot,
      writing_elapsed_seconds = least(
        315576000,
        task.writing_elapsed_seconds + case
          when task.writing_timer_started_at is null then 0
          else greatest(0, pg_catalog.floor(extract(epoch from (pg_catalog.now() - task.writing_timer_started_at)))::integer)
        end
      ),
      writing_timer_started_at = null,
      updated_at = pg_catalog.now()
  where task.id = v_task.id
  returning task.id, task.task_date, task.slot_number;
end;
$$;

create or replace function public.execution_system_planner_task_reactivate(
  p_task_id uuid,
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns table (id uuid, task_date date, slot_number integer)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_owner_kind text;
  v_owner_id uuid;
  v_task public.execution_system_planner_tasks%rowtype;
  v_target_slot integer;
  v_capacity integer;
begin
  if p_task_id is null then raise exception 'Task ID is required' using errcode = '22023'; end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  select task.* into v_task
  from public.execution_system_planner_tasks task
  where task.id = p_task_id and task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
    and task.status = 'archived'
  for update;
  if v_task.id is null then raise exception 'Archived task was not found' using errcode = 'P0002'; end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_owner_kind || ':' || v_owner_id::text || ':' || v_task.task_date::text, 57)
  );
  insert into public.execution_system_planner_days as planner_day
    (owner_kind, owner_id, task_date, capacity)
  values (v_owner_kind, v_owner_id, v_task.task_date, 10)
  on conflict on constraint execution_system_planner_days_pkey do update set updated_at = planner_day.updated_at
  returning planner_day.capacity into v_capacity;

  if v_task.slot_number <= v_capacity and not exists (
    select 1 from public.execution_system_planner_tasks occupied
    where occupied.owner_kind = v_owner_kind and occupied.owner_id = v_owner_id
      and occupied.task_date = v_task.task_date and occupied.slot_number = v_task.slot_number
      and occupied.status = 'active'
  ) then
    v_target_slot := v_task.slot_number;
  else
    select candidate.slot into v_target_slot
    from pg_catalog.generate_series(1, v_capacity) candidate(slot)
    where not exists (
      select 1 from public.execution_system_planner_tasks occupied
      where occupied.owner_kind = v_owner_kind and occupied.owner_id = v_owner_id
        and occupied.task_date = v_task.task_date and occupied.slot_number = candidate.slot
        and occupied.status = 'active'
    )
    order by candidate.slot
    limit 1;
  end if;

  if v_target_slot is null then
    if v_capacity >= 1000 then raise exception 'This day has no available task slots' using errcode = '22023'; end if;
    update public.execution_system_planner_days planner_day
    set capacity = least(1000, planner_day.capacity + 10), updated_at = pg_catalog.now()
    where planner_day.owner_kind = v_owner_kind and planner_day.owner_id = v_owner_id
      and planner_day.task_date = v_task.task_date
    returning planner_day.capacity - 9 into v_target_slot;
  end if;

  return query
  update public.execution_system_planner_tasks task
  set status = 'active', completed_at = null, slot_number = v_target_slot, updated_at = pg_catalog.now()
  where task.id = v_task.id
  returning task.id, task.task_date, task.slot_number;
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
  set status = 'archived',
      completed_at = pg_catalog.now(),
      writing_elapsed_seconds = least(
        315576000,
        task.writing_elapsed_seconds + case
          when task.writing_timer_started_at is null then 0
          else greatest(0, pg_catalog.floor(extract(epoch from (pg_catalog.now() - task.writing_timer_started_at)))::integer)
        end
      ),
      writing_timer_started_at = null,
      updated_at = pg_catalog.now()
  where task.id = p_task_id and task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
    and task.status = 'active';
  return found;
end;
$$;

create or replace function public.execution_system_planner_analytics_load(
  p_period text default 'week',
  p_reference_date date default current_date,
  p_student_token uuid default null,
  p_admin_token uuid default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_owner_kind text;
  v_owner_id uuid;
  v_reference date := coalesce(p_reference_date, current_date);
  v_week_start date;
  v_month_start date;
  v_year_start date;
  v_series jsonb := '[]'::jsonb;
  v_summary jsonb := '{}'::jsonb;
  v_achievement_tables jsonb := '[]'::jsonb;
  v_achievement_steps jsonb := '[]'::jsonb;
begin
  if p_period not in ('week', 'month', 'year', 'all')
    or v_reference not between date '2026-01-01' and date '2050-12-31'
  then
    raise exception 'Analytics request is invalid' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  v_week_start := pg_catalog.date_trunc('week', v_reference::timestamp)::date;
  v_month_start := pg_catalog.date_trunc('month', v_reference::timestamp)::date;
  v_year_start := pg_catalog.date_trunc('year', v_reference::timestamp)::date;

  with owned as (
    select task.*,
      (task.created_at at time zone 'Asia/Hong_Kong')::date as written_date,
      least(315576000, task.writing_elapsed_seconds + case
        when task.writing_timer_started_at is null then 0
          else greatest(0, pg_catalog.floor(extract(epoch from (pg_catalog.now() - task.writing_timer_started_at)))::integer)
      end) as effective_seconds
    from public.execution_system_planner_tasks task
    where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
  )
  select pg_catalog.jsonb_build_object(
    'total_tasks', count(*),
    'active_tasks', count(*) filter (where status = 'active'),
    'completed_tasks', count(*) filter (where status = 'archived'),
    'week_tasks', count(*) filter (where written_date between v_week_start and v_week_start + 6),
    'month_tasks', count(*) filter (where written_date between v_month_start and (v_month_start + interval '1 month - 1 day')::date),
    'year_tasks', count(*) filter (where written_date between v_year_start and (v_year_start + interval '1 year - 1 day')::date),
    'timed_tasks', count(*) filter (where effective_seconds > 0),
    'average_seconds', coalesce(pg_catalog.round(avg(effective_seconds) filter (where effective_seconds > 0))::integer, 0),
    'median_seconds', coalesce(pg_catalog.round(percentile_cont(0.5) within group (order by effective_seconds) filter (where effective_seconds > 0))::integer, 0),
    'average_rating', coalesce(pg_catalog.round(avg(difficulty_rating) filter (where difficulty_rating is not null), 2), 0)
  ) into v_summary
  from owned;

  if p_period = 'week' then
    with buckets as (
      select day::date as bucket_date
      from pg_catalog.generate_series(v_week_start, v_week_start + 6, interval '1 day') day
    ), counts as (
      select (task.created_at at time zone 'Asia/Hong_Kong')::date as written_date, count(*)::integer as value
      from public.execution_system_planner_tasks task
      where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
      group by 1
    )
    select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'label', pg_catalog.to_char(bucket_date, 'MM/DD'), 'value', coalesce(counts.value, 0)
    ) order by bucket_date), '[]'::jsonb) into v_series
    from buckets left join counts on counts.written_date = buckets.bucket_date;
  elsif p_period = 'month' then
    with buckets as (
      select day::date as bucket_date
      from pg_catalog.generate_series(v_month_start, (v_month_start + interval '1 month - 1 day')::date, interval '1 day') day
    ), counts as (
      select (task.created_at at time zone 'Asia/Hong_Kong')::date as written_date, count(*)::integer as value
      from public.execution_system_planner_tasks task
      where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
      group by 1
    )
    select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'label', pg_catalog.to_char(bucket_date, 'DD'), 'value', coalesce(counts.value, 0)
    ) order by bucket_date), '[]'::jsonb) into v_series
    from buckets left join counts on counts.written_date = buckets.bucket_date;
  elsif p_period = 'year' then
    with buckets as (
      select month::date as bucket_date
      from pg_catalog.generate_series(v_year_start, (v_year_start + interval '11 months')::date, interval '1 month') month
    ), counts as (
      select pg_catalog.date_trunc('month', task.created_at at time zone 'Asia/Hong_Kong')::date as written_month,
             count(*)::integer as value
      from public.execution_system_planner_tasks task
      where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
      group by 1
    )
    select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'label', pg_catalog.to_char(bucket_date, 'MM'), 'value', coalesce(counts.value, 0)
    ) order by bucket_date), '[]'::jsonb) into v_series
    from buckets left join counts on counts.written_month = buckets.bucket_date;
  else
    with bounds as (
      select least(
        extract(year from v_reference)::integer,
        coalesce(pg_catalog.min(extract(year from task.created_at at time zone 'Asia/Hong_Kong'))::integer, extract(year from v_reference)::integer)
      ) as first_year,
      greatest(
        extract(year from v_reference)::integer,
        coalesce(pg_catalog.max(extract(year from task.created_at at time zone 'Asia/Hong_Kong'))::integer, extract(year from v_reference)::integer)
      ) as last_year
      from public.execution_system_planner_tasks task
      where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
    ), buckets as (
      select year::integer as bucket_year from bounds, pg_catalog.generate_series(first_year, last_year) year
    ), counts as (
      select extract(year from task.created_at at time zone 'Asia/Hong_Kong')::integer as written_year,
             count(*)::integer as value
      from public.execution_system_planner_tasks task
      where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
      group by 1
    )
    select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
      'label', bucket_year::text, 'value', coalesce(counts.value, 0)
    ) order by bucket_year), '[]'::jsonb) into v_series
    from buckets left join counts on counts.written_year = buckets.bucket_year;
  end if;

  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'table_id', totals.table_id, 'total', totals.total
  ) order by totals.total desc, totals.table_id), '[]'::jsonb) into v_achievement_tables
  from (
    select achievement.table_id, sum(achievement.success_count)::bigint as total
    from public.execution_system_step_achievements achievement
    where achievement.owner_kind = v_owner_kind and achievement.owner_id = v_owner_id
    group by achievement.table_id
  ) totals;

  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'table_id', leaders.table_id, 'step_index', leaders.step_index, 'count', leaders.success_count
  ) order by leaders.success_count desc, leaders.table_id, leaders.step_index), '[]'::jsonb) into v_achievement_steps
  from (
    select achievement.table_id, achievement.step_index, achievement.success_count
    from public.execution_system_step_achievements achievement
    where achievement.owner_kind = v_owner_kind and achievement.owner_id = v_owner_id
      and achievement.success_count > 0
    order by achievement.success_count desc, achievement.table_id, achievement.step_index
    limit 20
  ) leaders;

  return pg_catalog.jsonb_build_object(
    'period', p_period,
    'reference_date', v_reference,
    'summary', v_summary,
    'series', v_series,
    'achievement_tables', v_achievement_tables,
    'achievement_steps', v_achievement_steps
  );
end;
$$;

revoke all on function public.execution_system_planner_tasks_load(date, text, uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_task_timer(uuid, text, uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_task_rating(uuid, integer, uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_task_move_tomorrow(uuid, uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_task_reactivate(uuid, uuid, uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_planner_analytics_load(text, date, uuid, uuid) from public, anon, authenticated, service_role;

grant execute on function public.execution_system_planner_tasks_load(date, text, uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_task_timer(uuid, text, uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_task_rating(uuid, integer, uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_task_move_tomorrow(uuid, uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_task_reactivate(uuid, uuid, uuid) to authenticated;
grant execute on function public.execution_system_planner_analytics_load(text, date, uuid, uuid) to authenticated;

commit;
