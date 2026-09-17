-- Card 65 uses the homework/schedule account family. No changes to existing login RPCs.
create schema if not exists polysemy_private;
revoke all on schema polysemy_private from public, anon;
grant usage on schema polysemy_private to authenticated;
create table polysemy_private.catalogue(module text primary key, senses jsonb not null, questions jsonb not null);
create table polysemy_private.events(
 student_id uuid not null references public.flashcard_students(id) on delete cascade,
 id uuid not null, module text not null references polysemy_private.catalogue(module),
 kind text not null check(kind in ('view','start','answer','time')),
 run uuid, round integer, question text, choice text, sense text,
 correct boolean, seconds integer, happened_at timestamptz not null, received_at timestamptz not null default now(),
 primary key(student_id,id)
);
create unique index polysemy_lab_answer_once on polysemy_private.events(student_id,module,run,round,question) where kind='answer';
create unique index polysemy_lab_view_once on polysemy_private.events(student_id,module,sense) where kind='view';
create index polysemy_lab_events_date on polysemy_private.events(student_id,module,happened_at);
alter table polysemy_private.catalogue enable row level security;
alter table polysemy_private.events enable row level security;
revoke all on all tables in schema polysemy_private from public, anon, authenticated;

create function polysemy_private.sync(p_token uuid,p_events jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_student uuid; e jsonb; q jsonb; v_kind text; v_correct boolean; v_at timestamptz; v_result jsonb;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='28000'; end if;
 v_student:=public.flashcard_session_student_id(p_token);
 if v_student is null then raise exception 'Student session expired. Please sign in again.' using errcode='28000'; end if;
 if jsonb_typeof(p_events) is distinct from 'array' or jsonb_array_length(p_events)>100 then raise exception 'Invalid event batch' using errcode='22023'; end if;
 for e in select value from jsonb_array_elements(p_events) loop
  v_kind:=e->>'kind';v_correct:=null;
  if v_kind is null or v_kind not in ('view','start','answer','time') or e->>'id' is null or e->>'at' is null then raise exception 'Invalid event' using errcode='22023'; end if;
  v_at:=(e->>'at')::timestamptz;
  if not isfinite(v_at) or v_at>now()+interval '5 minutes' or v_at<now()-interval '90 days' then raise exception 'Invalid event date' using errcode='22023'; end if;
  if v_kind='view' and not exists(select 1 from polysemy_private.catalogue c where c.module='show' and c.senses ? (e->>'sense')) then raise exception 'Unknown meaning' using errcode='22023'; end if;
  if v_kind in ('start','answer') and e->>'run' is null then raise exception 'Missing practice run' using errcode='22023'; end if;
  if v_kind='answer' then
   select c.questions->(e->>'question') into q from polysemy_private.catalogue c where c.module='show';
   if q is null or coalesce((e->>'round')::integer,0) not between 1 and 1000 or not coalesce(q->'options' ? (e->>'choice'),false) then raise exception 'Invalid answer' using errcode='22023'; end if;
   if not exists(select 1 from polysemy_private.events t where t.student_id=v_student and t.module='show' and t.kind='start' and t.run=(e->>'run')::uuid) then raise exception 'Unknown practice run' using errcode='22023'; end if;
   v_correct:=e->>'choice'=q->>'answer';
  end if;
  if v_kind='time' and coalesce((e->>'seconds')::integer,0) not between 1 and 60 then raise exception 'Invalid study duration' using errcode='22023'; end if;
  insert into polysemy_private.events(student_id,id,module,kind,run,round,question,choice,sense,correct,seconds,happened_at)
  values(v_student,(e->>'id')::uuid,'show',v_kind,case when v_kind in ('start','answer') then (e->>'run')::uuid end,case when v_kind='answer' then (e->>'round')::integer end,case when v_kind='answer' then e->>'question' end,case when v_kind='answer' then e->>'choice' end,case when v_kind='view' then e->>'sense' end,v_correct,case when v_kind='time' then (e->>'seconds')::integer end,v_at)
  on conflict do nothing;
 end loop;
 select jsonb_build_object('events',coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',t.id,'kind',t.kind,'run',t.run,'round',t.round,'question',t.question,'choice',t.choice,'sense',t.sense,'at',t.happened_at)) order by t.happened_at,t.id) from polysemy_private.events t where t.student_id=v_student and t.module='show' and t.kind<>'time'),'[]'::jsonb),
 'timeDays',coalesce((select jsonb_agg(to_jsonb(d) order by d.date) from (select (t.happened_at at time zone 'Asia/Hong_Kong')::date as date,sum(t.seconds)::bigint as seconds from polysemy_private.events t where t.student_id=v_student and t.module='show' and t.kind='time' group by 1)d),'[]'::jsonb),'updatedAt',now()) into v_result;
 return v_result;
end;$$;
revoke all on function polysemy_private.sync(uuid,jsonb) from public,anon,authenticated;
grant execute on function polysemy_private.sync(uuid,jsonb) to authenticated;
create function public.polysemy_lab_sync(p_token uuid,p_events jsonb default '[]'::jsonb) returns jsonb
language sql security invoker set search_path='' as $$select polysemy_private.sync(p_token,p_events);$$;
revoke all on function public.polysemy_lab_sync(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.polysemy_lab_sync(uuid,jsonb) to authenticated;

insert into polysemy_private.catalogue(module,senses,questions) values('show','["depict","present","guide","demonstrate","evidence","display","express","ability","map","visible","screen","entertainment","exhibition","pretence","screening","result"]','{"depict-1":{"answer":"depict","options":["depict","present","guide","demonstrate","express","visible"]},"depict-2":{"answer":"depict","options":["depict","present","guide","demonstrate","express","visible"]},"present-0":{"answer":"present","options":["present","guide","demonstrate","evidence","express","visible"]},"present-1":{"answer":"present","options":["present","guide","demonstrate","evidence","express","visible"]},"guide-0":{"answer":"guide","options":["guide","depict","evidence","express","visible","screen"]},"guide-1":{"answer":"guide","options":["guide","depict","evidence","express","visible","screen"]},"demonstrate-0":{"answer":"demonstrate","options":["demonstrate","depict","evidence","express","visible","screen"]},"demonstrate-1":{"answer":"demonstrate","options":["demonstrate","depict","evidence","express","visible","screen"]},"evidence-0":{"answer":"evidence","options":["evidence","present","guide","demonstrate","express","screen"]},"evidence-1":{"answer":"evidence","options":["evidence","present","guide","demonstrate","express","screen"]},"display-0":{"answer":"display","options":["display","present","guide","demonstrate","express","screen"]},"display-1":{"answer":"display","options":["display","present","guide","demonstrate","express","screen"]},"express-0":{"answer":"express","options":["express","depict","present","guide","demonstrate","screen"]},"express-1":{"answer":"express","options":["express","depict","present","guide","demonstrate","screen"]},"ability-0":{"answer":"ability","options":["ability","depict","present","guide","demonstrate","screen"]},"ability-1":{"answer":"ability","options":["ability","depict","present","guide","demonstrate","screen"]},"map-0":{"answer":"map","options":["map","present","guide","demonstrate","express","screen"]},"map-1":{"answer":"map","options":["map","present","guide","demonstrate","express","screen"]},"visible-0":{"answer":"visible","options":["visible","present","guide","demonstrate","evidence","screen"]},"visible-1":{"answer":"visible","options":["visible","present","guide","demonstrate","evidence","screen"]},"screen-0":{"answer":"screen","options":["screen","present","guide","demonstrate","evidence","express"]},"screen-1":{"answer":"screen","options":["screen","present","guide","demonstrate","evidence","express"]},"entertainment-0":{"answer":"entertainment","options":["entertainment","exhibition","pretence","result","guide","demonstrate"]},"entertainment-1":{"answer":"entertainment","options":["entertainment","exhibition","pretence","result","guide","demonstrate"]},"exhibition-0":{"answer":"exhibition","options":["exhibition","entertainment","pretence","result","guide","demonstrate"]},"exhibition-1":{"answer":"exhibition","options":["exhibition","entertainment","pretence","result","guide","demonstrate"]},"pretence-0":{"answer":"pretence","options":["pretence","entertainment","exhibition","screening","result","demonstrate"]},"pretence-1":{"answer":"pretence","options":["pretence","entertainment","exhibition","screening","result","demonstrate"]},"screening-0":{"answer":"screening","options":["screening","result","pretence","guide","demonstrate","express"]},"screening-1":{"answer":"screening","options":["screening","result","pretence","guide","demonstrate","express"]},"result-0":{"answer":"result","options":["result","screening","pretence","exhibition","guide","demonstrate"]},"result-1":{"answer":"result","options":["result","screening","pretence","exhibition","guide","demonstrate"]},"depict-0":{"answer":"depict","options":["depict","present","guide","demonstrate","express","visible"]}}');
