-- Card 66 uses the homework/schedule account family. No changes to existing login RPCs.
create schema if not exists natural_english_private;
revoke all on schema natural_english_private from public, anon;
grant usage on schema natural_english_private to authenticated;
create table natural_english_private.catalogue(module text primary key, senses jsonb not null, questions jsonb not null);
create table natural_english_private.events(
 student_id uuid not null references public.flashcard_students(id) on delete cascade,
 id uuid not null, module text not null references natural_english_private.catalogue(module),
 kind text not null check(kind in ('view','start','answer','time')),
 run uuid, round integer, question text, choice text, sense text,
 correct boolean, seconds integer, happened_at timestamptz not null, received_at timestamptz not null default now(),
 primary key(student_id,id)
);
create unique index natural_english_answer_once on natural_english_private.events(student_id,module,run,round,question) where kind='answer';
create unique index natural_english_view_once on natural_english_private.events(student_id,module,sense) where kind='view';
create index natural_english_events_date on natural_english_private.events(student_id,module,happened_at);
alter table natural_english_private.catalogue enable row level security;
alter table natural_english_private.events enable row level security;
revoke all on all tables in schema natural_english_private from public, anon, authenticated;

create function natural_english_private.sync(p_token uuid,p_events jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare v_student uuid; e jsonb; q jsonb; v_kind text; v_correct boolean; v_at timestamptz; v_result jsonb;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='28000'; end if;
 v_student:=public.flashcard_session_student_id(p_token);
 if v_student is null then raise exception 'Student session expired. Please sign in again.' using errcode='28000'; end if;
 if jsonb_typeof(p_events) is distinct from 'array' or jsonb_array_length(p_events)>100 or octet_length(p_events::text)>100000 then raise exception 'Invalid event batch' using errcode='22023'; end if;
 for e in select value from jsonb_array_elements(p_events) loop
  v_kind:=e->>'kind';v_correct:=null;
  if v_kind is null or v_kind not in ('view','start','answer','time') or e->>'id' is null or e->>'at' is null then raise exception 'Invalid event' using errcode='22023'; end if;
  v_at:=(e->>'at')::timestamptz;
  if not isfinite(v_at) or v_at>now()+interval '5 minutes' or v_at<now()-interval '90 days' then raise exception 'Invalid event date' using errcode='22023'; end if;
  if v_kind='view' then
   if coalesce(e->>'sense','') !~ '^(recorded|skipped):[0-9a-f-]{36}:(phrase|dialogue)$' or not exists(select 1 from natural_english_private.events t where t.student_id=v_student and t.module='scoop' and t.kind='start' and t.run::text=split_part(e->>'sense',':',2)) then raise exception 'Invalid speaking status' using errcode='22023';end if;
  end if;
  if v_kind in ('start','answer') and e->>'run' is null then raise exception 'Missing practice run' using errcode='22023'; end if;
  if v_kind='answer' then
   select c.questions->(e->>'question') into q from natural_english_private.catalogue c where c.module='scoop';
   if q is null or coalesce((e->>'round')::integer,0) not between 1 and 1000 or coalesce(length(e->>'choice'),0) not between 1 and 160 or (q->>'type'='mc' and not coalesce(q->'options' ? (e->>'choice'),false)) then raise exception 'Invalid answer' using errcode='22023'; end if;
   if not exists(select 1 from natural_english_private.events t where t.student_id=v_student and t.module='scoop' and t.kind='start' and t.run=(e->>'run')::uuid) then raise exception 'Unknown practice run' using errcode='22023'; end if;
   v_correct:=exists(select 1 from jsonb_array_elements_text(q->'answers') answer where lower(regexp_replace(trim(e->>'choice'),'\s+',' ','g'))=lower(answer));
  end if;
  if v_kind='time' and coalesce((e->>'seconds')::integer,0) not between 1 and 60 then raise exception 'Invalid study duration' using errcode='22023'; end if;
  insert into natural_english_private.events(student_id,id,module,kind,run,round,question,choice,sense,correct,seconds,happened_at)
  values(v_student,(e->>'id')::uuid,'scoop',v_kind,case when v_kind in ('start','answer') then (e->>'run')::uuid end,case when v_kind='answer' then (e->>'round')::integer end,case when v_kind='answer' then e->>'question' end,case when v_kind='answer' then e->>'choice' end,case when v_kind='view' then e->>'sense' end,v_correct,case when v_kind='time' then (e->>'seconds')::integer end,v_at)
  on conflict do nothing;
 end loop;
 select jsonb_build_object('events',coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',t.id,'kind',t.kind,'run',t.run,'round',t.round,'question',t.question,'choice',t.choice,'sense',t.sense,'correct',t.correct,'at',t.happened_at)) order by t.happened_at,t.id) from natural_english_private.events t where t.student_id=v_student and t.module='scoop' and t.kind<>'time'),'[]'::jsonb),
 'timeDays',coalesce((select jsonb_agg(to_jsonb(d) order by d.date) from (select (t.happened_at at time zone 'Asia/Hong_Kong')::date as date,sum(t.seconds)::bigint as seconds from natural_english_private.events t where t.student_id=v_student and t.module='scoop' and t.kind='time' group by 1)d),'[]'::jsonb),'updatedAt',now()) into v_result;
 return v_result;
end;$$;
revoke all on function natural_english_private.sync(uuid,jsonb) from public,anon,authenticated;
grant execute on function natural_english_private.sync(uuid,jsonb) to authenticated;
create function public.natural_english_sync(p_token uuid,p_events jsonb default '[]'::jsonb) returns jsonb
language sql security invoker set search_path='' as $$select natural_english_private.sync(p_token,p_events);$$;
revoke all on function public.natural_english_sync(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.natural_english_sync(uuid,jsonb) to authenticated;


insert into natural_english_private.catalogue(module,senses,questions) values('scoop','[]','{"spot":{"type":"mc","answers":["balls"],"options":["get","two","balls","please"]},"listen":{"type":"mc","answers":["你要一球還是兩球？"],"options":["你想要哪種口味？","你要一球還是兩球？","你想不想試吃？","你需要加醬嗎？","你要杯子還是甜筒？","你準備付款了嗎？"]},"choose":{"type":"mc","answers":["Can I get two scoops of strawberry ice cream?"],"options":["Can I try the strawberry ice cream?","Can I get one scoop of strawberry ice cream?","Can I get two scoops of chocolate ice cream?","Can I get two scoops of strawberry ice cream?","Can I get extra strawberry sauce?","Can I get one scoop of vanilla ice cream?"]},"blank1":{"type":"blank","answers":["scoop"],"options":[]},"blank2":{"type":"blank","answers":["scoops"],"options":[]},"blank3":{"type":"blank","answers":["two scoops"],"options":[]},"cup":{"type":"mc","answers":["你要用杯子還是甜筒裝？"],"options":["你要一球還是兩球？","你要巧克力還是香草？","你要用杯子還是甜筒裝？","你要不要加巧克力醬？","你要不要再點一份？","你要現金還是刷卡？"]},"dialogue1":{"type":"blank","answers":["scoops"],"options":[]},"dialogue2":{"type":"blank","answers":["vanilla"],"options":[]},"dialogue3":{"type":"blank","answers":["cup"],"options":[]},"final":{"type":"blank","answers":["scoops"],"options":[]}}');
notify pgrst,'reload schema';
