-- Read-only reporting additions. Reuse the established account/session checks;
-- neither the login path nor the progress-writing functions change.
create index special_learning_events_account_course_date_idx
 on public.special_learning_events(account_id,course_id,occurred_at desc);
create or replace function public.special_flash_team_effort(p_token uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);result jsonb;
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 with courses as (select c.* from public.special_flash_courses c where c.active and
  (a.role='admin' or exists(select 1 from public.special_flash_enrollments en where en.account_id=a.id and en.course_id=c.id))),
 members as (select c.id course_id,u.id account_id,u.username from courses c join public.special_flash_enrollments en on en.course_id=c.id join public.special_flash_accounts u on u.id=en.account_id where u.active and u.role='student' and u.team_effort_visible),
 totals as (select m.course_id,m.account_id,m.username,coalesce(sum(e.points),0) cards,coalesce(sum(e.points) filter(where e.occurred_at >= now()-interval '24 hours' and e.occurred_at<=now()),0) recent_questions,coalesce(sum(e.points) filter(where e.kind='card'),0) card_questions,coalesce(sum(e.points) filter(where e.kind='blank'),0) blank_questions,coalesce(sum(e.points) filter(where e.kind='polysemy'),0) polysemy_words from members m left join public.special_learning_events e on e.course_id=m.course_id and e.account_id=m.account_id group by 1,2,3),
 daily as (select m.course_id,m.account_id,m.username,(e.occurred_at at time zone 'Asia/Hong_Kong')::date date,sum(e.points) cards,sum(e.points) filter(where e.kind='card') card_questions,sum(e.points) filter(where e.kind='blank') blank_questions,sum(e.points) filter(where e.kind='polysemy') polysemy_words from members m join public.special_learning_events e on e.course_id=m.course_id and e.account_id=m.account_id where e.points>0 group by 1,2,3,4)
 select jsonb_build_object('generated_at',now(),'courses',coalesce(jsonb_agg(jsonb_build_object('course_id',c.id,'course_title',c.title,
  'total_cards',(select coalesce(sum(t.cards),0) from totals t where t.course_id=c.id),
  'last_24h_questions',(select coalesce(sum(t.recent_questions),0) from totals t where t.course_id=c.id),
  'total_before_24h',(select coalesce(sum(t.cards-t.recent_questions),0) from totals t where t.course_id=c.id),
  'members',(select coalesce(jsonb_agg(jsonb_build_object('account_id',t.account_id,'username',t.username,'cards',t.cards,'card_questions',t.card_questions,'blank_questions',t.blank_questions,'polysemy_words',t.polysemy_words) order by t.cards desc,t.username),'[]') from totals t where t.course_id=c.id),
  'daily',(select coalesce(jsonb_agg(jsonb_build_object('date',d.date,'account_id',d.account_id,'username',d.username,'cards',d.cards,'card_questions',d.card_questions,'blank_questions',d.blank_questions,'polysemy_words',d.polysemy_words) order by d.date,d.username),'[]') from daily d where d.course_id=c.id)) order by c.title),'[]')) into result from courses c;
 return result;
end $$;

create or replace function public.special_flash_learning_summary(p_token uuid,p_course uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);result jsonb;
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 if not exists(select 1 from public.special_flash_courses c where c.id=p_course and c.active and
  (a.role='admin' or exists(select 1 from public.special_flash_enrollments en where en.account_id=a.id and en.course_id=c.id))) then raise exception 'Course is not available.' using errcode='42501';end if;
 select jsonb_build_object('questions',coalesce(sum(points),0),'duration_ms',coalesce(sum(duration_ms),0),
  'cards',coalesce(sum(points) filter(where kind='card'),0),'blanks',coalesce(sum(points) filter(where kind='blank'),0),'words',coalesce(sum(points) filter(where kind='polysemy'),0),
  'daily',(select coalesce(jsonb_agg(to_jsonb(d) order by d.date),'[]') from (
   select (occurred_at at time zone 'Asia/Hong_Kong')::date as date,sum(points) as questions,sum(duration_ms) as duration_ms,
    coalesce(sum(points) filter(where kind='card'),0) cards,coalesce(sum(points) filter(where kind='blank'),0) blanks,coalesce(sum(points) filter(where kind='polysemy'),0) words
   from public.special_learning_events where account_id=a.id and course_id=p_course group by 1) d)) into result
 from public.special_learning_events where account_id=a.id and course_id=p_course;
 return result;
end $$;
revoke all on function public.special_flash_learning_summary(uuid,uuid) from public;
grant execute on function public.special_flash_learning_summary(uuid,uuid) to anon,authenticated;


-- Page through every correct completion, scoped to the current account only.
-- Hong Kong date boundaries match learning_summary; the team window is rolling 24h.
create function public.special_flash_learning_details(p_token uuid,p_course uuid,p_from date,p_to date,p_page integer default 1)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);result jsonb;
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 if not exists(select 1 from public.special_flash_courses c where c.id=p_course and c.active and
  (a.role='admin' or exists(select 1 from public.special_flash_enrollments en where en.account_id=a.id and en.course_id=c.id))) then raise exception 'Course is not available.' using errcode='42501';end if;
 if p_from is null or p_to is null or p_to<p_from or p_to-p_from>366 or p_page is null or p_page<1 or p_page>100000 then raise exception 'Invalid date range or page.' using errcode='22023';end if;
 with activity as materialized (
  select event_key,kind,points,occurred_at from public.special_learning_events
  where account_id=a.id and course_id=p_course and points>0
   and occurred_at >= (p_from::timestamp at time zone 'Asia/Hong_Kong')
   and occurred_at < ((p_to+1)::timestamp at time zone 'Asia/Hong_Kong')
 ), page as (
  select *,regexp_match(event_key,'^card:([0-9a-f-]{36}):(.+):([0-9a-f-]{36})$') cp,
   regexp_match(event_key,'^blank:([^:]+):(.+):([0-9]+:[0-9]+)$') bp,
   regexp_match(event_key,'^polysemy:(lesson-[0-9]+:[^:]+):(.+):word$') pp
  from activity order by occurred_at desc,event_key limit 100 offset (p_page-1)*100
 ), expanded as (
  select p.*,coalesce(cp[1],bp[1],pp[1],legacy.deck_id::text,
   case when event_key ~ '^legacy-marks:[0-9a-f-]{36}$' then split_part(event_key,':',2) end) exercise,
   coalesce(cp[3],bp[3]) item
  from page p left join public.special_flash_attempts legacy
   on p.event_key='legacy-attempt:'||legacy.id::text and legacy.account_id=a.id
 ), display as (
  select x.event_key id,x.kind,x.points,x.occurred_at,(x.occurred_at at time zone 'Asia/Hong_Kong')::date date,
   x.exercise,x.item,d.title deck_title,c.value->>'front' front,c.value->>'back' back,
   (x.cp is null and x.bp is null and x.pp is null) legacy
  from expanded x left join public.special_flash_decks d on d.id::text=x.exercise and d.course_id=p_course
  left join lateral (select v value from jsonb_array_elements(d.cards) v where v->>'id'=x.item limit 1) c on true
 )
 select jsonb_build_object('from',p_from,'to',p_to,'page',p_page,'page_size',100,
  'total',(select count(*) from activity),'questions',(select coalesce(sum(points),0) from activity),
  'rows',(select coalesce(jsonb_agg(to_jsonb(d) order by occurred_at desc,id),'[]') from display d)) into result;
 return result;
end $$;
revoke all on function public.special_flash_learning_details(uuid,uuid,date,date,integer) from public,anon,authenticated,service_role;
grant execute on function public.special_flash_learning_details(uuid,uuid,date,date,integer) to anon,authenticated;
notify pgrst, 'reload schema';
