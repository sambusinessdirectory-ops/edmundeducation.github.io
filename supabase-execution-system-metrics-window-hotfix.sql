-- Fix Card 57 dashboard metrics: calculate the cumulative window in its own
-- query stage before aggregating the points into JSON.

begin;

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

revoke all on function public.execution_system_planner_metrics_load(text,date,uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.execution_system_planner_metrics_load(text,date,uuid,uuid) to authenticated;

commit;
