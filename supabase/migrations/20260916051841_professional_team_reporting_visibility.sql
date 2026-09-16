-- Reporting visibility does not affect login, enrollment or personal progress.
alter table public.special_flash_accounts add column if not exists team_effort_visible boolean not null default true;
comment on column public.special_flash_accounts.team_effort_visible is 'Include this account in team totals, charts and member lists.';
update public.special_flash_accounts set team_effort_visible=false where lower(username)=lower('test3GR');

create or replace function public.special_flash_team_effort(p_token uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);result jsonb;
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 with courses as (select c.* from public.special_flash_courses c where c.active and
  (a.role='admin' or exists(select 1 from public.special_flash_enrollments en where en.account_id=a.id and en.course_id=c.id))),
 members as (select c.id course_id,u.id account_id,u.username from courses c join public.special_flash_enrollments en on en.course_id=c.id join public.special_flash_accounts u on u.id=en.account_id where u.active and u.role='student' and u.team_effort_visible),
 totals as (select m.course_id,m.account_id,m.username,coalesce(sum(e.points),0) cards from members m left join public.special_learning_events e on e.course_id=m.course_id and e.account_id=m.account_id group by 1,2,3),
 daily as (select m.course_id,m.account_id,m.username,(e.occurred_at at time zone 'Asia/Hong_Kong')::date date,sum(e.points) cards from members m join public.special_learning_events e on e.course_id=m.course_id and e.account_id=m.account_id where e.points>0 group by 1,2,3,4)
 select jsonb_build_object('courses',coalesce(jsonb_agg(jsonb_build_object('course_id',c.id,'course_title',c.title,
  'total_cards',(select coalesce(sum(t.cards),0) from totals t where t.course_id=c.id),
  'members',(select coalesce(jsonb_agg(jsonb_build_object('account_id',t.account_id,'username',t.username,'cards',t.cards) order by t.cards desc,t.username),'[]') from totals t where t.course_id=c.id),
  'daily',(select coalesce(jsonb_agg(jsonb_build_object('date',d.date,'account_id',d.account_id,'username',d.username,'cards',d.cards) order by d.date,d.username),'[]') from daily d where d.course_id=c.id)) order by c.title),'[]')) into result from courses c;
 return result;
end $$;
