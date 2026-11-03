create or replace function public.schedule_assigned_weeks(p_token uuid,p_year integer,p_student uuid default null)
returns table(week_start date) language plpgsql stable security definer set search_path='' as $$
declare who uuid; first_day date;
begin
 if p_student is null then who:=public.flashcard_session_student_id(p_token);
 elsif public._schedule_admin_id(p_token) is not null then who:=p_student; end if;
 if who is null then raise exception 'Session expired' using errcode='42501'; end if;
 if p_year not between 2025 and 2051 then raise exception 'Invalid year'; end if;
 first_day:=date_trunc('week',make_date(p_year,1,4)::timestamp)::date;
 return query select distinct date_trunc('week',e.schedule_date::timestamp)::date from public.schedule_entries e
 where e.student_id=who and e.schedule_date>=first_day and e.schedule_date<date_trunc('week',make_date(p_year+1,1,4)::timestamp)::date
 and regexp_replace(e.message,'\[\[@edmund-homework-tag:v1:[a-z0-9-]+\]\]|[[:space:]]','','g')<>'' order by 1;
end $$;
revoke all on function public.schedule_assigned_weeks(uuid,integer,uuid) from public,anon,authenticated;
grant execute on function public.schedule_assigned_weeks(uuid,integer,uuid) to authenticated;