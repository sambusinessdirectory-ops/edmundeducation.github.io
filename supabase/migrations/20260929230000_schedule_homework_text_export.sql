-- Read-only, paged homework export for an authenticated Schedule administrator.
begin;

create or replace function public.schedule_admin_export_homework_entries(
  p_admin_token uuid,
  p_student_ids uuid[],
  p_week_starts date[] default null,
  p_from_week date default null,
  p_to_week date default null,
  p_after_id uuid default null,
  p_limit integer default 500
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_rows jsonb;
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session' using errcode = '42501';
  end if;
  if p_student_ids is null or pg_catalog.cardinality(p_student_ids) < 1
     or pg_catalog.cardinality(p_student_ids) > 1000
     or p_limit is null or p_limit < 1 or p_limit > 500 then
    raise exception 'Invalid export selection or page size';
  end if;
  if (p_week_starts is not null and (p_from_week is not null or p_to_week is not null))
     or (p_from_week is null) <> (p_to_week is null)
     or (p_from_week is not null and (
       not public._schedule_week_start_valid(p_from_week)
       or not public._schedule_week_start_valid(p_to_week)
       or p_to_week < p_from_week
     ))
     or (p_week_starts is not null and (
       pg_catalog.cardinality(p_week_starts) < 1
       or pg_catalog.cardinality(p_week_starts) > 1306
       or exists (
         select 1 from pg_catalog.unnest(p_week_starts) as selected(week_start)
         where not public._schedule_week_start_valid(selected.week_start)
       )
     )) then
    raise exception 'Invalid export weeks';
  end if;
  if exists (
    select 1 from pg_catalog.unnest(p_student_ids) as selected(student_id)
    where not exists (
      select 1 from public.flashcard_students student where student.id = selected.student_id
    )
  ) then
    raise exception 'Student not found';
  end if;

  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'id', page.id,
    'studentId', page.student_id,
    'scheduleDate', page.schedule_date,
    'slotIndex', page.slot_index,
    'message', page.message,
    'source', page.source,
    'isCompleted', page.is_completed,
    'isInProgress', page.is_in_progress,
    'isMoreThanHalfCompleted', page.is_more_than_half_completed,
    'isPreviousIncomplete', page.is_previous_incomplete
  ) order by page.id), '[]'::jsonb)
  into v_rows
  from (
    select entry.id, entry.student_id, entry.schedule_date, entry.slot_index,
      entry.message, entry.source, entry.is_completed, entry.is_in_progress,
      entry.is_more_than_half_completed, entry.is_previous_incomplete
    from public.schedule_entries entry
    where entry.student_id = any(p_student_ids)
      and (p_after_id is null or entry.id > p_after_id)
      and (p_from_week is null or (
        entry.schedule_date >= p_from_week and entry.schedule_date < p_to_week + 7
      ))
      and (p_week_starts is null or exists (
        select 1 from pg_catalog.unnest(p_week_starts) as selected(week_start)
        where entry.schedule_date >= selected.week_start
          and entry.schedule_date < selected.week_start + 7
      ))
    order by entry.id
    limit p_limit
  ) page;
  return v_rows;
end;
$$;

revoke all on function public.schedule_admin_export_homework_entries(uuid, uuid[], date[], date, date, uuid, integer)
  from public, anon, authenticated;
grant execute on function public.schedule_admin_export_homework_entries(uuid, uuid[], date[], date, date, uuid, integer)
  to authenticated;

commit;
