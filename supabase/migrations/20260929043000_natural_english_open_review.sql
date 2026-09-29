-- Self-reviewed writing is completion evidence, not an exact-match grade.
-- Keep the existing event validation and student-session checks in place.
create or replace function natural_english_private.sync_modules(p_token uuid,p_events jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare sid uuid;e jsonb;q jsonb;k text;m text;ok boolean;ts timestamptz;result jsonb;choice_length integer;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='28000';end if;
 sid:=public.flashcard_session_student_id(p_token);if sid is null then raise exception 'Student session expired. Please sign in again.' using errcode='28000';end if;
 if jsonb_typeof(p_events) is distinct from 'array' or jsonb_array_length(p_events)>100 or octet_length(p_events::text)>100000 then raise exception 'Invalid event batch' using errcode='22023';end if;
 for e in select value from jsonb_array_elements(p_events) loop
  k:=e->>'kind';m:=coalesce(nullif(e->>'module',''),'scoop');ok:=null;
  if k is null or k not in ('view','start','answer','time') or e->>'id' is null or e->>'at' is null or not exists(select 1 from natural_english_private.catalogue c where c.module=m) then raise exception 'Invalid event' using errcode='22023';end if;
  ts:=(e->>'at')::timestamptz;if not isfinite(ts) or ts>now()+interval '5 minutes' or ts<now()-interval '90 days' then raise exception 'Invalid event date' using errcode='22023';end if;
  if k='view' then
   if coalesce(e->>'sense','') !~ '^(recorded|skipped):[0-9a-f-]{36}:(phrase|dialogue)$' or not exists(select 1 from natural_english_private.events t where t.student_id=sid and t.module=m and t.kind='start' and t.run::text=split_part(e->>'sense',':',2)) then raise exception 'Invalid speaking status' using errcode='22023';end if;
  end if;
  if k in ('start','answer') and e->>'run' is null then raise exception 'Missing practice run' using errcode='22023';end if;
  if k='answer' then
   select c.questions->(e->>'question') into q from natural_english_private.catalogue c where c.module=m;
   choice_length:=length(e->>'choice');
   if q is null or q->>'type' not in ('mc','blank','open') or coalesce((e->>'round')::integer,0) not between 1 and 1000 or
      (q->>'type'='open' and coalesce(choice_length,0) not between 3 and 400) or
      (q->>'type'<>'open' and coalesce(choice_length,0) not between 1 and 160) or
      (q->>'type'='mc' and not coalesce(q->'options' ? (e->>'choice'),false)) then raise exception 'Invalid answer' using errcode='22023';end if;
   if not exists(select 1 from natural_english_private.events t where t.student_id=sid and t.module=m and t.kind='start' and t.run=(e->>'run')::uuid) then raise exception 'Unknown practice run' using errcode='22023';end if;
   if q->>'type'<>'open' then
    ok:=exists(select 1 from jsonb_array_elements_text(q->'answers') a where natural_english_private.normalise_answer(e->>'choice')=natural_english_private.normalise_answer(a));
   end if;
  end if;
  if k='time' and coalesce((e->>'seconds')::integer,0) not between 1 and 60 then raise exception 'Invalid study duration' using errcode='22023';end if;
  insert into natural_english_private.events(student_id,id,module,kind,run,round,question,choice,sense,correct,seconds,happened_at)
  values(sid,(e->>'id')::uuid,m,k,case when k in ('start','answer') then (e->>'run')::uuid end,case when k='answer' then (e->>'round')::integer end,case when k='answer' then e->>'question' end,case when k='answer' then e->>'choice' end,case when k='view' then e->>'sense' end,ok,case when k='time' then (e->>'seconds')::integer end,ts) on conflict do nothing;
 end loop;
 select jsonb_build_object(
  'events',coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',t.id,'module',t.module,'kind',t.kind,'run',t.run,'round',t.round,'question',t.question,'choice',t.choice,'sense',t.sense,'correct',t.correct,'at',t.happened_at)) order by t.happened_at,t.id) from natural_english_private.events t where t.student_id=sid and t.kind<>'time'),'[]'::jsonb),
  'timeDays',coalesce((select jsonb_agg(to_jsonb(d) order by d.date) from (select (t.happened_at at time zone 'Asia/Hong_Kong')::date date,sum(t.seconds)::bigint seconds from natural_english_private.events t where t.student_id=sid and t.kind='time' group by 1)d),'[]'::jsonb),'updatedAt',now()) into result;
 return result;
end;$$;
