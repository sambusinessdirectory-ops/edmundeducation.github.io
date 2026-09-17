create or replace function public.special_flash_activity(p_token uuid,p_events jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.special_flash_accounts:=public._special_flash_account(p_token);e jsonb;c uuid;expected jsonb;k text;item text;attempt text;ek text;pts integer;ms bigint;accepted integer:=0;changed integer;occurred timestamptz;q record;
begin
 if a.id is null then raise exception 'Please sign in again.' using errcode='42501';end if;
 if jsonb_typeof(p_events) is distinct from 'array' or jsonb_array_length(p_events)>50 or octet_length(p_events::text)>200000 then raise exception 'Invalid event batch.' using errcode='22023';end if;
 for e in select value from jsonb_array_elements(p_events) loop
  k:=e->>'kind';item:=e->>'item';attempt:=e->>'attempt';
  if k is null or k not in ('card','blank','polysemy') or coalesce(length(item),0) not between 1 and 150 or coalesce(length(attempt),0) not between 1 and 80 or coalesce(length(e->>'exercise'),0) not between 1 and 150 then raise exception 'Invalid activity.' using errcode='22023';end if;
  c:=public._special_learning_course(a.id,k,e->>'exercise');
  pts:=0;ms:=0;
  if item like 'time:%' then
   ms:=(e->>'ms')::bigint;
   if ms is null or ms not between 1 and 60000 then raise exception 'Invalid study time.' using errcode='22023';end if;
  elsif k='card' then
   if e->>'answer' is distinct from 'green' or not exists(select 1 from public.special_flash_decks d cross join lateral jsonb_array_elements(d.cards) v where d.id=(e->>'exercise')::uuid and v->>'id'=item) then raise exception 'Invalid card.' using errcode='22023';end if;
   pts:=1;
  else
   select answers into expected from public.special_learning_catalog where kind=k and exercise=e->>'exercise';
   if k='blank' then
    if expected->>item is null or lower(replace(trim(e->>'answer'),'’','''')) is distinct from expected->>item then raise exception 'Answer is not correct.' using errcode='22023';end if;
   else
    if item='word' then
     -- Cached clients still send one verified whole-word completion. Expand it
     -- into the same question keys used by new clients, never an extra point.
     if e->'answers' is distinct from expected then raise exception 'Complete every meaning first.' using errcode='22023';end if;
     occurred:=greatest(now()-interval '7 days',least(now(),coalesce(to_timestamp((e->>'at')::double precision/1000),now())));
     for q in select key from jsonb_each(expected) loop
      ek:=k||':'||(e->>'exercise')||':'||attempt||':'||q.key;
      insert into public.special_learning_events(account_id,course_id,event_key,kind,points,occurred_at)
      values(a.id,c,ek,k,1,occurred) on conflict(account_id,event_key) do nothing;
      get diagnostics changed=row_count;accepted:=accepted+changed;
     end loop;
     continue;
    end if;
    if expected->>item is null or e->>'answer' is distinct from expected->>item then raise exception 'Answer is not correct.' using errcode='22023';end if;
   end if;
   pts:=1;
  end if;
  ek:=k||':'||(e->>'exercise')||':'||attempt||':'||item;
  occurred:=greatest(now()-interval '7 days',least(now(),coalesce(to_timestamp((e->>'at')::double precision/1000),now())));
  insert into public.special_learning_events(account_id,course_id,event_key,kind,points,duration_ms,occurred_at)
   values(a.id,c,ek,k,pts,ms,occurred) on conflict(account_id,event_key) do nothing;
  get diagnostics changed=row_count;accepted:=accepted+changed;
 end loop;
 -- Public notification contains no identities, scores, account tokens or answers.
 -- Every subscriber must still use the authenticated RPC to read its permitted data.
 if accepted>0 then
  begin perform realtime.send('{}'::jsonb,'changed','professional-learning',false);
  exception when others then null;end;
 end if;
 return jsonb_build_object('accepted',accepted);
end $$;

-- Expand proven historical word completions using the validated answer catalogue.
-- Preserve original dates; retain zero-point aggregate rows as audit markers.
insert into public.special_learning_events(account_id,course_id,event_key,kind,points,occurred_at)
select e.account_id,e.course_id,regexp_replace(e.event_key,':word$',':'||q.key),'polysemy',1,e.occurred_at
from public.special_learning_events e
cross join lateral regexp_match(e.event_key,'^polysemy:(lesson-[0-9]+:[^:]+):(.+):word$') m
join public.special_learning_catalog c on c.kind='polysemy' and c.exercise=m[1] and c.course_id=e.course_id
cross join lateral jsonb_each(c.answers) q
where e.kind='polysemy' and e.points>0
on conflict(account_id,event_key) do nothing;
update public.special_learning_events e set points=0
from public.special_learning_catalog c
where e.kind='polysemy' and e.points>0 and c.kind=e.kind and c.course_id=e.course_id
and (regexp_match(e.event_key,'^polysemy:(lesson-[0-9]+:[^:]+):(.+):word$'))[1]=c.exercise;
create or replace function public.special_flash_learning_details(p_token uuid,p_course uuid,p_from date,p_to date,p_page integer default 1)
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
   regexp_match(event_key,'^polysemy:(lesson-[0-9]+:[^:]+):(.+):([^:]+)$') pp
  from activity order by occurred_at desc,event_key limit 100 offset (p_page-1)*100
 ), expanded as (
  select p.*,coalesce(cp[1],bp[1],pp[1],legacy.deck_id::text,
   case when event_key ~ '^legacy-marks:[0-9a-f-]{36}$' then split_part(event_key,':',2) end) exercise,
   coalesce(cp[3],bp[3],pp[3]) item
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

notify pgrst,'reload schema';
