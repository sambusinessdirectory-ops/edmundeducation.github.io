-- Record a student visit on each Hong Kong date, even when the browser session stays open.
create or replace function public.schedule_student_record_system_visit(p_token uuid, p_system text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  student uuid := public.flashcard_session_student_id(p_token);
  cleaned text := lower(btrim(coalesce(p_system, '')));
  visit_date date := (now() at time zone 'Asia/Hong_Kong')::date;
begin
  if student is null then raise exception 'Please sign in again.' using errcode = '42501'; end if;
  if cleaned !~ '^[a-z0-9][a-z0-9_-]{0,99}$' then raise exception 'Invalid system.' using errcode = '22023'; end if;
  insert into public.student_system_activity_log(student_id, system_id, session_fingerprint)
  values(student, cleaned, md5(p_token::text || ':' || visit_date::text)) on conflict do nothing;
  return true;
end
$$;

create index if not exists student_system_activity_log_student_recent_idx
  on public.student_system_activity_log (student_id, visited_at desc);

-- Return only the authenticated student's prior visit date and the calendar-day gap.
-- The first check-in also records today's visit, so the schedule page works without
-- depending on the shared navigation's background activity request.
create or replace function public.schedule_student_check_in(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  student uuid := public.flashcard_session_student_id(p_token);
  today_hk date := (now() at time zone 'Asia/Hong_Kong')::date;
  last_visit timestamptz;
  previous_day date;
begin
  if student is null then raise exception 'Please sign in again.' using errcode = '42501'; end if;
  select max(visited_at) into last_visit
  from public.student_system_activity_log
  where student_id = student
    and visited_at < (today_hk::timestamp at time zone 'Asia/Hong_Kong');
  if last_visit is not null then previous_day := (last_visit at time zone 'Asia/Hong_Kong')::date; end if;
  perform public.schedule_student_record_system_visit(p_token, 'schedule');
  return jsonb_build_object(
    'date', today_hk,
    'lastDate', previous_day,
    'gapDays', case when previous_day is null then null else today_hk - previous_day end
  );
end
$$;

revoke all on function public.schedule_student_record_system_visit(uuid,text) from public, anon, authenticated, service_role;
grant execute on function public.schedule_student_record_system_visit(uuid,text) to anon, authenticated;
revoke all on function public.schedule_student_check_in(uuid) from public, anon, authenticated, service_role;
grant execute on function public.schedule_student_check_in(uuid) to anon, authenticated;
