-- Card 57 Step 20 exports, homework tags, priority ordering and completion/time metrics.
-- Apply after supabase-execution-system-thinking-day-planner.sql.

begin;

alter table public.execution_system_planner_tasks
  add column if not exists tag_keys text[] not null default '{}'::text[],
  add column if not exists priority_order integer;

alter table public.execution_system_planner_tasks
  drop constraint if exists execution_system_planner_tasks_tag_keys_check,
  drop constraint if exists execution_system_planner_tasks_priority_order_check;

alter table public.execution_system_planner_tasks
  add constraint execution_system_planner_tasks_tag_keys_check check (
    pg_catalog.cardinality(tag_keys) <= 8
    and pg_catalog.array_position(tag_keys, null) is null
    and tag_keys <@ array[
      'reluctant','favourite','teacher-added','well-done','break-15',
      'prepare-materials','hardest-today','easiest-today'
    ]::text[]
  ),
  add constraint execution_system_planner_tasks_priority_order_check check (
    priority_order is null or priority_order between 1 and 1000
  );

create index if not exists execution_system_planner_tasks_owner_priority_idx
  on public.execution_system_planner_tasks (owner_kind, owner_id, task_date, priority_order, slot_number)
  where status = 'active';
create index if not exists execution_system_planner_tasks_tags_idx
  on public.execution_system_planner_tasks using gin (tag_keys);

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
  writing_timer_started_at timestamptz, thinking_seconds jsonb,
  tag_keys text[], priority_order integer
)
language plpgsql stable security definer set search_path = ''
as $$
declare v_owner_kind text; v_owner_id uuid;
begin
  if p_task_date is null or p_task_date not between date '2026-01-01' and date '2050-12-31'
    or p_status not in ('active', 'archived') then
    raise exception 'Planner request is invalid' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;

  return query
  select task.id, task.slot_number, task.title, task.answers, task.status,
         task.completed_at, task.created_at, task.updated_at,
         task.difficulty_rating, task.writing_elapsed_seconds, task.writing_timer_started_at,
         coalesce((
           select pg_catalog.jsonb_object_agg('q' || totals.question_number::text, totals.total_seconds)
           from (
             select log.question_number, sum(log.elapsed_seconds)::bigint as total_seconds
             from public.execution_system_planner_thinking_logs log
             where log.task_id = task.id and log.owner_kind = v_owner_kind and log.owner_id = v_owner_id
             group by log.question_number
           ) totals
         ), '{}'::jsonb), task.tag_keys, task.priority_order
  from public.execution_system_planner_tasks task
  where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
    and task.task_date = p_task_date and task.status = p_status
  order by case when p_status = 'active' then coalesce(task.priority_order, task.slot_number) end,
           case when p_status = 'active' then task.slot_number end,
           case when p_status = 'archived' then task.completed_at end desc;
end;
$$;

create or replace function public.execution_system_planner_task_tags_set(
  p_task_id uuid, p_tag_keys text[] default '{}'::text[],
  p_student_token uuid default null, p_admin_token uuid default null
)
returns text[] language plpgsql volatile security definer set search_path = ''
as $$
declare v_owner_kind text; v_owner_id uuid; v_tags text[]; v_result text[];
begin
  if p_task_id is null then raise exception 'Task ID is required' using errcode = '22023'; end if;
  select coalesce(pg_catalog.array_agg(tag order by first_position), '{}'::text[]) into v_tags
  from (
    select tag, min(position)::integer as first_position
    from pg_catalog.unnest(coalesce(p_tag_keys, '{}'::text[])) with ordinality input(tag, position)
    where tag = any(array['reluctant','favourite','teacher-added','well-done','break-15','prepare-materials','hardest-today','easiest-today']::text[])
    group by tag
  ) valid;
  if pg_catalog.cardinality(v_tags) <> pg_catalog.cardinality(coalesce(p_tag_keys, '{}'::text[])) then
    raise exception 'One or more task tags are invalid or duplicated' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;
  update public.execution_system_planner_tasks task set tag_keys = v_tags, updated_at = pg_catalog.now()
  where task.id = p_task_id and task.owner_kind = v_owner_kind and task.owner_id = v_owner_id
  returning task.tag_keys into v_result;
  if v_result is null then raise exception 'Task was not found' using errcode = 'P0002'; end if;
  return v_result;
end;
$$;

create or replace function public.execution_system_planner_task_time_set(
  p_task_id uuid, p_elapsed_seconds integer,
  p_student_token uuid default null, p_admin_token uuid default null
)
returns integer language plpgsql volatile security definer set search_path = ''
as $$
declare v_owner_kind text; v_owner_id uuid; v_result integer;
begin
  if p_task_id is null or p_elapsed_seconds not between 0 and 315576000 then
    raise exception 'Task time is invalid' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;
  update public.execution_system_planner_tasks task
  set writing_elapsed_seconds = p_elapsed_seconds, writing_timer_started_at = null, updated_at = pg_catalog.now()
  where task.id = p_task_id and task.owner_kind = v_owner_kind and task.owner_id = v_owner_id and task.status = 'active'
  returning task.writing_elapsed_seconds into v_result;
  if v_result is null then raise exception 'Active task was not found' using errcode = 'P0002'; end if;
  return v_result;
end;
$$;

create or replace function public.execution_system_planner_priorities_save(
  p_task_date date, p_task_ids uuid[],
  p_student_token uuid default null, p_admin_token uuid default null
)
returns integer language plpgsql volatile security definer set search_path = ''
as $$
declare v_owner_kind text; v_owner_id uuid; v_expected integer; v_updated integer;
begin
  if p_task_date is null or p_task_date not between date '2026-01-01' and date '2050-12-31'
    or pg_catalog.cardinality(coalesce(p_task_ids, '{}'::uuid[])) > 1000
    or pg_catalog.array_position(coalesce(p_task_ids, '{}'::uuid[]), null) is not null then
    raise exception 'Priority request is invalid' using errcode = '22023';
  end if;
  if (select count(*) from (select distinct id from pg_catalog.unnest(coalesce(p_task_ids, '{}'::uuid[])) id) distinct_ids)
     <> pg_catalog.cardinality(coalesce(p_task_ids, '{}'::uuid[])) then
    raise exception 'Priority list contains duplicates' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;
  select count(*)::integer into v_expected from public.execution_system_planner_tasks task
  where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id and task.task_date = p_task_date and task.status = 'active';
  if v_expected <> pg_catalog.cardinality(coalesce(p_task_ids, '{}'::uuid[])) or exists (
    select 1 from pg_catalog.unnest(coalesce(p_task_ids, '{}'::uuid[])) id
    where not exists (select 1 from public.execution_system_planner_tasks task where task.id = id and task.owner_kind = v_owner_kind and task.owner_id = v_owner_id and task.task_date = p_task_date and task.status = 'active')
  ) then raise exception 'Priority list must contain every active task for the selected date' using errcode = '22023'; end if;
  update public.execution_system_planner_tasks task set priority_order = ordered.position::integer, updated_at = pg_catalog.now()
  from pg_catalog.unnest(coalesce(p_task_ids, '{}'::uuid[])) with ordinality ordered(id, position)
  where task.id = ordered.id and task.owner_kind = v_owner_kind and task.owner_id = v_owner_id;
  get diagnostics v_updated = row_count;
  return v_updated;
end;
$$;

create or replace function public.execution_system_planner_day_summary(
  p_task_date date, p_student_token uuid default null, p_admin_token uuid default null
)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare v_owner_kind text; v_owner_id uuid; v_result jsonb;
begin
  if p_task_date is null or p_task_date not between date '2026-01-01' and date '2050-12-31' then
    raise exception 'Planner date is invalid' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;
  select pg_catalog.jsonb_build_object(
    'created_tasks', count(*), 'completed_tasks', count(*) filter (where status = 'archived'),
    'completion_rate', case when count(*) = 0 then 0 else pg_catalog.round(100.0 * count(*) filter (where status = 'archived') / count(*), 1) end,
    'writing_seconds', coalesce(sum(least(315576000, writing_elapsed_seconds + case when writing_timer_started_at is null then 0 else greatest(0, pg_catalog.floor(extract(epoch from (pg_catalog.now() - writing_timer_started_at)))::integer) end)), 0)
  ) into v_result from public.execution_system_planner_tasks
  where owner_kind = v_owner_kind and owner_id = v_owner_id and task_date = p_task_date;
  return v_result;
end;
$$;

create or replace function public.execution_system_planner_step20_load(
  p_student_token uuid default null, p_admin_token uuid default null
)
returns table (id uuid, task_date date, slot_number integer, title text, step20 text, status text, completed_at timestamptz, tag_keys text[])
language plpgsql stable security definer set search_path = ''
as $$
declare v_owner_kind text; v_owner_id uuid;
begin
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;
  return query select task.id, task.task_date, task.slot_number, task.title, pg_catalog.btrim(task.answers->>'q20'), task.status, task.completed_at, task.tag_keys
  from public.execution_system_planner_tasks task
  where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id and pg_catalog.btrim(coalesce(task.answers->>'q20','')) <> ''
  order by task.task_date desc, task.slot_number limit 5000;
end;
$$;

create or replace function public.execution_system_planner_tagged_tasks_load(
  p_tag_key text, p_page integer default 1, p_page_size integer default 20,
  p_student_token uuid default null, p_admin_token uuid default null
)
returns table (id uuid, task_date date, slot_number integer, title text, status text, completed_at timestamptz, tag_keys text[], total_count bigint)
language plpgsql stable security definer set search_path = ''
as $$
declare v_owner_kind text; v_owner_id uuid;
begin
  if p_tag_key <> all(array['reluctant','favourite','teacher-added','well-done','break-15','prepare-materials','hardest-today','easiest-today']::text[])
    or p_page not between 1 and 100000 or p_page_size not between 1 and 100 then
    raise exception 'Tagged-task request is invalid' using errcode = '22023';
  end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id
  from execution_private.execution_system_owner(p_student_token, p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode = '42501'; end if;
  return query select task.id, task.task_date, task.slot_number, task.title, task.status, task.completed_at, task.tag_keys,
    count(*) over() from public.execution_system_planner_tasks task
  where task.owner_kind = v_owner_kind and task.owner_id = v_owner_id and p_tag_key = any(task.tag_keys)
  order by task.task_date desc, task.slot_number
  offset (p_page - 1) * p_page_size limit p_page_size;
end;
$$;

create or replace function public.execution_system_planner_metrics_load(
  p_period text default 'week', p_reference_date date default current_date,
  p_student_token uuid default null, p_admin_token uuid default null
)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare v_owner_kind text; v_owner_id uuid; v_reference date := coalesce(p_reference_date,current_date);
  v_start date; v_end date; v_unit text; v_points jsonb; v_total bigint;
begin
  if p_period not in ('week','month','year','all') or v_reference not between date '2026-01-01' and date '2050-12-31' then raise exception 'Metrics request is invalid' using errcode='22023'; end if;
  select owner.owner_kind, owner.owner_id into v_owner_kind, v_owner_id from execution_private.execution_system_owner(p_student_token,p_admin_token) owner;
  if v_owner_id is null then raise exception 'Account session is invalid or expired' using errcode='42501'; end if;
  if p_period='week' then v_start:=pg_catalog.date_trunc('week',v_reference::timestamp)::date; v_end:=v_start+6; v_unit:='day';
  elsif p_period='month' then v_start:=pg_catalog.date_trunc('month',v_reference::timestamp)::date; v_end:=(v_start+interval '1 month - 1 day')::date; v_unit:='day';
  elsif p_period='year' then v_start:=pg_catalog.date_trunc('year',v_reference::timestamp)::date; v_end:=(v_start+interval '1 year - 1 day')::date; v_unit:='month';
  else select coalesce(min(task_date),v_reference), greatest(coalesce(max(task_date),v_reference),v_reference) into v_start,v_end from public.execution_system_planner_tasks where owner_kind=v_owner_kind and owner_id=v_owner_id; v_start:=pg_catalog.date_trunc('year',v_start::timestamp)::date; v_end:=(pg_catalog.date_trunc('year',v_end::timestamp)+interval '1 year - 1 day')::date; v_unit:='year'; end if;
  select coalesce(sum(least(315576000, writing_elapsed_seconds + case when writing_timer_started_at is null then 0 else greatest(0,pg_catalog.floor(extract(epoch from(pg_catalog.now()-writing_timer_started_at)))::integer) end)),0)::bigint into v_total
  from public.execution_system_planner_tasks where owner_kind=v_owner_kind and owner_id=v_owner_id;
  with buckets as (
    select bucket::date from pg_catalog.generate_series(v_start,v_end,case v_unit when 'day' then interval '1 day' when 'month' then interval '1 month' else interval '1 year' end) bucket
  ), owned as (
    select task_date,status,least(315576000,writing_elapsed_seconds+case when writing_timer_started_at is null then 0 else greatest(0,pg_catalog.floor(extract(epoch from(pg_catalog.now()-writing_timer_started_at)))::integer) end) seconds
    from public.execution_system_planner_tasks where owner_kind=v_owner_kind and owner_id=v_owner_id
  ), grouped as (
    select case v_unit when 'day' then task_date when 'month' then pg_catalog.date_trunc('month',task_date::timestamp)::date else pg_catalog.date_trunc('year',task_date::timestamp)::date end bucket,
      count(*) total, count(*) filter(where status='archived') completed, sum(seconds)::bigint seconds from owned group by 1
  ), points as (
    select buckets.bucket, coalesce(grouped.total,0)::integer total, coalesce(grouped.completed,0)::integer completed,
      case when coalesce(grouped.total,0)=0 then 0 else pg_catalog.round(100.0*grouped.completed/grouped.total,1) end rate,
      coalesce(grouped.seconds,0)::bigint seconds from buckets left join grouped using(bucket)
  ), cumulative_points as (
    select points.*,
      sum(points.seconds) over(order by points.bucket) as cumulative_seconds
    from points
  ) select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'date',bucket,'label',case v_unit when 'day' then pg_catalog.to_char(bucket,'MM/DD') when 'month' then pg_catalog.to_char(bucket,'YYYY-MM') else pg_catalog.to_char(bucket,'YYYY') end,
    'total',total,'completed',completed,'rate',rate,'seconds',seconds,
    'cumulative_seconds',cumulative_seconds
  ) order by bucket),'[]'::jsonb) into v_points from cumulative_points;
  return pg_catalog.jsonb_build_object('period',p_period,'points',v_points,'total_writing_seconds',v_total);
end;
$$;

revoke all on function public.execution_system_planner_tasks_load(date,text,uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.execution_system_planner_task_tags_set(uuid,text[],uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.execution_system_planner_task_time_set(uuid,integer,uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.execution_system_planner_priorities_save(date,uuid[],uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.execution_system_planner_day_summary(date,uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.execution_system_planner_step20_load(uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.execution_system_planner_tagged_tasks_load(text,integer,integer,uuid,uuid) from public,anon,authenticated,service_role;
revoke all on function public.execution_system_planner_metrics_load(text,date,uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.execution_system_planner_tasks_load(date,text,uuid,uuid) to authenticated;
grant execute on function public.execution_system_planner_task_tags_set(uuid,text[],uuid,uuid) to authenticated;
grant execute on function public.execution_system_planner_task_time_set(uuid,integer,uuid,uuid) to authenticated;
grant execute on function public.execution_system_planner_priorities_save(date,uuid[],uuid,uuid) to authenticated;
grant execute on function public.execution_system_planner_day_summary(date,uuid,uuid) to authenticated;
grant execute on function public.execution_system_planner_step20_load(uuid,uuid) to authenticated;
grant execute on function public.execution_system_planner_tagged_tasks_load(text,integer,integer,uuid,uuid) to authenticated;
grant execute on function public.execution_system_planner_metrics_load(text,date,uuid,uuid) to authenticated;

commit;
