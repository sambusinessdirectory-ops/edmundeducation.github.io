-- Validate both the revised MCQ catalogue and the original choices still used
-- by older browser tabs. Existing event IDs and student progress stay unchanged.
create or replace function polysemy_private.sync_modules(p_token uuid,p_events jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 v_student uuid; e jsonb; q jsonb; v_mcq jsonb; v_kind text; v_correct boolean;
 v_at timestamptz; v_result jsonb; v_module text; v_answer_index integer; v_choice_index integer;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='28000'; end if;
 v_student:=public.flashcard_session_student_id(p_token);
 if v_student is null then raise exception 'Student session expired. Please sign in again.' using errcode='28000'; end if;
 if jsonb_typeof(p_events) is distinct from 'array' or jsonb_array_length(p_events)>100 then raise exception 'Invalid event batch' using errcode='22023'; end if;
 for e in select value from jsonb_array_elements(p_events) loop
  v_kind:=e->>'kind';v_correct:=null;v_module:=coalesce(e->>'module','show');
  if not exists(select 1 from polysemy_private.catalogue c where c.module=v_module) then raise exception 'Unknown module' using errcode='22023';end if;
  if v_kind is null or v_kind not in ('view','start','answer','time') or e->>'id' is null or e->>'at' is null then raise exception 'Invalid event' using errcode='22023'; end if;
  v_at:=(e->>'at')::timestamptz;
  if not isfinite(v_at) or v_at>now()+interval '5 minutes' or v_at<now()-interval '90 days' then raise exception 'Invalid event date' using errcode='22023'; end if;
  if v_kind='view' and not exists(select 1 from polysemy_private.catalogue c where c.module=v_module and (c.senses ? (e->>'sense') or coalesce(c.mcq->'senses' ? (e->>'sense'),false))) then raise exception 'Unknown meaning' using errcode='22023'; end if;
  if v_kind in ('start','answer') and e->>'run' is null then raise exception 'Missing practice run' using errcode='22023'; end if;
  if v_kind='answer' then
   select c.questions->(e->>'question'),c.mcq into q,v_mcq from polysemy_private.catalogue c where c.module=v_module;
   if coalesce((e->>'round')::integer,0) not between 1 and 1000 then raise exception 'Invalid answer' using errcode='22023'; end if;
   if coalesce(q->'options' ? (e->>'choice'),false) then
    v_correct:=e->>'choice'=q->>'answer';
   else
    if v_mcq is null or not coalesce(v_mcq->'answers' ? (e->>'question'),false) then raise exception 'Invalid answer' using errcode='22023'; end if;
    v_answer_index:=(v_mcq->'answers'->>(e->>'question'))::integer;
    select (s.ordinality-1)::integer into v_choice_index
      from jsonb_array_elements_text(v_mcq->'senses') with ordinality as s(id,ordinality)
      where s.id=e->>'choice';
    if v_choice_index is null or not exists(
      select 1 from jsonb_array_elements_text(v_mcq->'options'->(v_answer_index::text)) as o(index_text)
      where o.index_text::integer=v_choice_index
    ) then raise exception 'Invalid answer' using errcode='22023'; end if;
    v_correct:=v_choice_index=v_answer_index;
   end if;
   if not exists(select 1 from polysemy_private.events t where t.student_id=v_student and t.module=v_module and t.kind='start' and t.run=(e->>'run')::uuid) then raise exception 'Unknown practice run' using errcode='22023'; end if;
  end if;
  if v_kind='time' and coalesce((e->>'seconds')::integer,0) not between 1 and 60 then raise exception 'Invalid study duration' using errcode='22023'; end if;
  insert into polysemy_private.events(student_id,id,module,kind,run,round,question,choice,sense,correct,seconds,happened_at)
  values(v_student,(e->>'id')::uuid,v_module,v_kind,case when v_kind in ('start','answer') then (e->>'run')::uuid end,case when v_kind='answer' then (e->>'round')::integer end,case when v_kind='answer' then e->>'question' end,case when v_kind='answer' then e->>'choice' end,case when v_kind='view' then e->>'sense' end,v_correct,case when v_kind='time' then (e->>'seconds')::integer end,v_at)
  on conflict do nothing;
 end loop;
 select jsonb_build_object('events',coalesce((select jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',t.id,'module',t.module,'kind',t.kind,'run',t.run,'round',t.round,'question',t.question,'choice',t.choice,'sense',t.sense,'at',t.happened_at)) order by t.happened_at,t.id) from polysemy_private.events t where t.student_id=v_student and t.kind<>'time'),'[]'::jsonb),
 'timeDays',coalesce((select jsonb_agg(to_jsonb(d) order by d.date) from (select (t.happened_at at time zone 'Asia/Hong_Kong')::date as date,sum(t.seconds)::bigint as seconds from polysemy_private.events t where t.student_id=v_student and t.kind='time' group by 1)d),'[]'::jsonb),'updatedAt',now()) into v_result;
 return v_result;
end;$$;
