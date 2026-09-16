-- Anonymous responses deliberately have no account, session, name or IP columns.
create table public.special_course_assessments (
 id uuid primary key, submitted_at timestamptz not null default now(),
 version integer not null default 1, ratings jsonb not null, comment text not null default ''
);
create index special_course_assessments_date_idx on public.special_course_assessments(submitted_at desc,id);
alter table public.special_course_assessments enable row level security;
revoke all on public.special_course_assessments from public,anon,authenticated,service_role;
create function public.special_flash_assessment_submit(p_id uuid,p_ratings jsonb,p_comment text default '',p_trap text default '')
returns jsonb language plpgsql security definer set search_path='' as $$
declare old public.special_course_assessments;
begin
 if p_id is null or p_trap<>'' or p_ratings is null or jsonb_typeof(p_ratings)<>'array' then raise exception 'Invalid response.' using errcode='22023';end if;
 if jsonb_array_length(p_ratings)<>8 or exists(select 1 from jsonb_array_elements(p_ratings) x where jsonb_typeof(x)<>'number' or x::text !~ '^[1-7]$') or length(coalesce(p_comment,''))>4000 then raise exception 'Choose one rating from 1 to 7 for every question.' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended('anonymous-assessment:'||p_id,0));
 select * into old from public.special_course_assessments where id=p_id;
 if old.id is not null then
  if old.ratings=p_ratings and old.comment=btrim(coalesce(p_comment,'')) then return jsonb_build_object('saved',true);end if;
  raise exception 'This response was already submitted.' using errcode='PT409';
 end if;
 if (select count(*) from public.special_course_assessments where submitted_at>now()-interval '1 minute')>=200 then raise exception 'Please try again in a minute.' using errcode='PT429';end if;
 insert into public.special_course_assessments(id,ratings,comment) values(p_id,p_ratings,btrim(coalesce(p_comment,'')));
 return jsonb_build_object('saved',true);
end $$;
revoke all on function public.special_flash_assessment_submit(uuid,jsonb,text,text) from public,anon,authenticated,service_role;
grant execute on function public.special_flash_assessment_submit(uuid,jsonb,text,text) to anon,authenticated;
create function public.special_flash_assessment_results(p_token uuid,p_page integer default 1)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);
begin
 if a.id is null or a.role<>'admin' then raise exception 'Administrator access required.' using errcode='42501';end if;
 if p_page is null or p_page<1 or p_page>100000 then raise exception 'Invalid page.' using errcode='22023';end if;
 return jsonb_build_object('total',(select count(*) from public.special_course_assessments),'page',p_page,'page_size',20,'rows',
  (select coalesce(jsonb_agg(to_jsonb(r) order by r.submitted_at desc,r.id),'[]') from (select id,submitted_at,version,ratings,comment from public.special_course_assessments order by submitted_at desc,id limit 20 offset (p_page-1)*20) r));
end $$;
revoke all on function public.special_flash_assessment_results(uuid,integer) from public,anon,authenticated,service_role;
grant execute on function public.special_flash_assessment_results(uuid,integer) to anon,authenticated;

create table public.special_team_encouragement (
 course_id uuid primary key references public.special_flash_courses(id) on delete cascade,
 heart bigint not null default 0, thumb bigint not null default 0, flex bigint not null default 0
);
create table public.special_team_encouragement_batches (
 account_id uuid not null references public.special_flash_accounts(id) on delete cascade,
 request_id uuid not null, course_id uuid not null references public.special_flash_courses(id) on delete cascade,
 heart integer not null,thumb integer not null,flex integer not null,created_at timestamptz not null default now(),primary key(account_id,request_id)
);
create index special_team_encouragement_batches_course_idx on public.special_team_encouragement_batches(course_id);
alter table public.special_team_encouragement enable row level security;
alter table public.special_team_encouragement_batches enable row level security;
revoke all on public.special_team_encouragement,public.special_team_encouragement_batches from public,anon,authenticated,service_role;
create function public.special_flash_encouragement(p_token uuid,p_course uuid,p_request uuid default null,p_heart integer default 0,p_thumb integer default 0,p_flex integer default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);old public.special_team_encouragement_batches;n integer;
begin
 if a.id is null or not exists(select 1 from public.special_flash_courses c where c.id=p_course and c.active and (a.role='admin' or exists(select 1 from public.special_flash_enrollments en where en.account_id=a.id and en.course_id=c.id))) then raise exception 'Course is not available.' using errcode='42501';end if;
 if p_heart is null or p_thumb is null or p_flex is null or least(p_heart,p_thumb,p_flex)<0 or greatest(p_heart,p_thumb,p_flex)>1000 then raise exception 'Invalid encouragement.' using errcode='22023';end if;
 if p_heart+p_thumb+p_flex>0 then
  if p_request is null then raise exception 'Missing request ID.' using errcode='22023';end if;
  insert into public.special_team_encouragement_batches(account_id,request_id,course_id,heart,thumb,flex) values(a.id,p_request,p_course,p_heart,p_thumb,p_flex) on conflict do nothing;
  get diagnostics n=row_count;
  select * into old from public.special_team_encouragement_batches where account_id=a.id and request_id=p_request;
  if old.course_id<>p_course or old.heart<>p_heart or old.thumb<>p_thumb or old.flex<>p_flex then raise exception 'This request has changed.' using errcode='PT409';end if;
  if n=1 then
   insert into public.special_team_encouragement(course_id,heart,thumb,flex) values(p_course,p_heart,p_thumb,p_flex)
    on conflict(course_id) do update set heart=special_team_encouragement.heart+excluded.heart,thumb=special_team_encouragement.thumb+excluded.thumb,flex=special_team_encouragement.flex+excluded.flex;
   begin perform realtime.send('{}'::jsonb,'encouragement','professional-learning',false);exception when others then null;end;
  end if;
 end if;
 return coalesce((select jsonb_build_object('heart',heart,'thumb',thumb,'flex',flex) from public.special_team_encouragement where course_id=p_course),'{"heart":0,"thumb":0,"flex":0}'::jsonb);
end $$;
revoke all on function public.special_flash_encouragement(uuid,uuid,uuid,integer,integer,integer) from public,anon,authenticated,service_role;
grant execute on function public.special_flash_encouragement(uuid,uuid,uuid,integer,integer,integer) to anon,authenticated;

create table public.special_flash_card_marks (
 account_id uuid not null references public.special_flash_accounts(id) on delete cascade,
 deck_id uuid not null references public.special_flash_decks(id) on delete cascade,
 card_id uuid not null,attempt text not null,mark text not null check(mark in ('green','red')),occurred_at timestamptz not null default now(),
 primary key(account_id,deck_id,card_id,attempt)
);
create index special_flash_card_marks_deck_idx on public.special_flash_card_marks(deck_id);
alter table public.special_flash_card_marks enable row level security;
revoke all on public.special_flash_card_marks from public,anon,authenticated,service_role;
-- Recover attributable correct attempts; aggregate legacy rounds cannot be assigned to individual cards.
insert into public.special_flash_card_marks(account_id,deck_id,card_id,attempt,mark,occurred_at)
select e.account_id,(parts[1])::uuid,(parts[3])::uuid,parts[2],'green',e.occurred_at
from public.special_learning_events e cross join lateral regexp_match(e.event_key,'^card:([0-9a-f-]{36}):(.+):([0-9a-f-]{36})$') parts
where e.kind='card' and e.points>0 and parts is not null and exists(select 1 from public.special_flash_decks d where d.id=(parts[1])::uuid)
on conflict do nothing;
insert into public.special_flash_card_marks(account_id,deck_id,card_id,attempt,mark,occurred_at)
select p.account_id,p.deck_id,m.key::uuid,'legacy-current',m.value,p.updated_at
from public.special_flash_progress p cross join lateral jsonb_each_text(p.marks) m
where m.key ~ '^[0-9a-f-]{36}$' and m.value in ('green','red') and not exists(select 1 from public.special_flash_card_marks h where h.account_id=p.account_id and h.deck_id=p.deck_id and h.card_id=m.key::uuid and h.mark=m.value)
on conflict do nothing;
create function public.special_flash_record_marks(p_token uuid,p_events jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);e jsonb;d uuid;c uuid;
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 if jsonb_typeof(p_events) is distinct from 'array' then raise exception 'Invalid events.' using errcode='22023';end if;
 if jsonb_array_length(p_events)>50 or octet_length(p_events::text)>50000 then raise exception 'Event batch is too large.' using errcode='22023';end if;
 for e in select value from jsonb_array_elements(p_events) loop
  if e->>'mark' is null or e->>'mark' not in ('green','red') or coalesce(length(e->>'attempt'),0) not between 1 and 80 then raise exception 'Invalid attempt.' using errcode='22023';end if;
  d:=(e->>'deck')::uuid;c:=(e->>'card')::uuid;
  if not public._special_flash_access(a.id,d) or not exists(select 1 from public.special_flash_decks x cross join lateral jsonb_array_elements(x.cards) card where x.id=d and card->>'id'=c::text) then raise exception 'Card is not available.' using errcode='42501';end if;
  insert into public.special_flash_card_marks(account_id,deck_id,card_id,attempt,mark,occurred_at) values(a.id,d,c,e->>'attempt',e->>'mark',greatest(now()-interval '7 days',least(now(),coalesce(to_timestamp((e->>'at')::double precision/1000),now())))) on conflict do nothing;
 end loop;
 return jsonb_build_object('saved',true);
end $$;
revoke all on function public.special_flash_record_marks(uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.special_flash_record_marks(uuid,jsonb) to anon,authenticated;
create function public.special_flash_card_records(p_token uuid,p_course uuid default null)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);result jsonb;
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 select coalesce(jsonb_agg(to_jsonb(r) order by r.deck_title,r.position),'[]') into result from (
 select d.id deck_id,d.course_id,d.title deck_title,c->>'id' card_id,c->>'front' front,c->>'back' back,c->>'note' note,c->'examples' examples,c->'examples_zh' examples_zh,ordinal position,p.marks->>(c->>'id') status,h.attempts,h.last_at
 from public.special_flash_decks d cross join lateral jsonb_array_elements(d.cards) with ordinality cards(c,ordinal)
 left join public.special_flash_progress p on p.deck_id=d.id and p.account_id=a.id
 left join lateral(select count(*) attempts,max(occurred_at) last_at from public.special_flash_card_marks m where m.account_id=a.id and m.deck_id=d.id and m.card_id::text=c->>'id') h on true
 where (p_course is null or d.course_id=p_course) and public._special_flash_access(a.id,d.id) and (p.marks ? (c->>'id') or h.attempts>0)
 ) r;
 return result;
end $$;
revoke all on function public.special_flash_card_records(uuid,uuid) from public,anon,authenticated,service_role;
grant execute on function public.special_flash_card_records(uuid,uuid) to anon,authenticated;
create function public.special_flash_exercise_progress(p_token uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 return jsonb_build_object('drafts',(select coalesce(jsonb_object_agg(key,jsonb_build_object('credited',case when jsonb_typeof(value->'credited')='array' then jsonb_array_length(value->'credited') else 0 end,'complete',value->'complete','contentVersion',value->'contentVersion','difficulty',value->'difficulty','hint',value->'hint')),'{}') from public.special_learning_state where account_id=a.id and key ~ '^draft:l[123]d'),
 'polysemy',(select coalesce(jsonb_object_agg(lesson,n),'{}') from (
 select lesson,count(*) n from (select distinct
 case when key like 'draft:poly-complete:lesson-%:%' then split_part(key,':',3) else 'lesson-1' end lesson,
 case when key like 'draft:poly-complete:lesson-%:%' then split_part(key,':',4) else split_part(key,':',3) end word
 from public.special_learning_state where account_id=a.id and key like 'draft:poly-complete:%' and jsonb_typeof(value->'completedAt')='number') done
 where exists(select 1 from public.special_learning_catalog c where c.kind='polysemy' and c.exercise=done.lesson||':'||done.word) group by lesson) p));
end $$;
revoke all on function public.special_flash_exercise_progress(uuid) from public,anon,authenticated,service_role;
grant execute on function public.special_flash_exercise_progress(uuid) to anon,authenticated;

create or replace function public.special_flash_team_effort(p_token uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);result jsonb;
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 with courses as (select c.* from public.special_flash_courses c where c.active and
  (a.role='admin' or exists(select 1 from public.special_flash_enrollments en where en.account_id=a.id and en.course_id=c.id))),
 members as (select c.id course_id,u.id account_id,u.username from courses c join public.special_flash_enrollments en on en.course_id=c.id join public.special_flash_accounts u on u.id=en.account_id where u.active and u.role='student' and u.team_effort_visible),
 totals as (select m.course_id,m.account_id,m.username,coalesce(sum(e.points),0) cards,coalesce(sum(e.points) filter(where e.kind='card'),0) card_questions,coalesce(sum(e.points) filter(where e.kind='blank'),0) blank_questions,coalesce(sum(e.points) filter(where e.kind='polysemy'),0) polysemy_words from members m left join public.special_learning_events e on e.course_id=m.course_id and e.account_id=m.account_id group by 1,2,3),
 daily as (select m.course_id,m.account_id,m.username,(e.occurred_at at time zone 'Asia/Hong_Kong')::date date,sum(e.points) cards,sum(e.points) filter(where e.kind='card') card_questions,sum(e.points) filter(where e.kind='blank') blank_questions,sum(e.points) filter(where e.kind='polysemy') polysemy_words from members m join public.special_learning_events e on e.course_id=m.course_id and e.account_id=m.account_id where e.points>0 group by 1,2,3,4)
 select jsonb_build_object('courses',coalesce(jsonb_agg(jsonb_build_object('course_id',c.id,'course_title',c.title,
  'total_cards',(select coalesce(sum(t.cards),0) from totals t where t.course_id=c.id),
  'members',(select coalesce(jsonb_agg(jsonb_build_object('account_id',t.account_id,'username',t.username,'cards',t.cards,'card_questions',t.card_questions,'blank_questions',t.blank_questions,'polysemy_words',t.polysemy_words) order by t.cards desc,t.username),'[]') from totals t where t.course_id=c.id),
  'daily',(select coalesce(jsonb_agg(jsonb_build_object('date',d.date,'account_id',d.account_id,'username',d.username,'cards',d.cards,'card_questions',d.card_questions,'blank_questions',d.blank_questions,'polysemy_words',d.polysemy_words) order by d.date,d.username),'[]') from daily d where d.course_id=c.id)) order by c.title),'[]')) into result from courses c;
 return result;
end $$;

notify pgrst, 'reload schema';
