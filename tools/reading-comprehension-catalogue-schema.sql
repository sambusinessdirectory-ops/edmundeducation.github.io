-- Additive Reading catalogue rollout. Existing attempts/results are preserved.
-- Apply through the Supabase migration tool, then seed the approved catalogue.
create table if not exists public.reading_comprehension_catalogue (
  id text primary key check (id ~ '^p[123]-[0-9]{3}(-[a-z0-9-]+)?$'),
  title text not null check (char_length(title) between 1 and 500),
  answer_key jsonb not null check (jsonb_typeof(answer_key) = 'object'),
  enabled boolean not null default true
);
alter table public.reading_comprehension_catalogue enable row level security;
revoke all on public.reading_comprehension_catalogue from public, anon, authenticated;

insert into public.reading_comprehension_catalogue(id,title,answer_key)
select 'p1-069-albert-einstein','Albert Einstein',jsonb_object_agg('q'||n,
  jsonb_build_object('display',public._reading_comprehension_correct_answer(n),
    'accepted',jsonb_build_array(public._reading_comprehension_correct_answer(n)), 'requiresReview',false))
from generate_series(1,13) as n
on conflict(id) do nothing;

alter table public.reading_comprehension_attempts drop constraint if exists reading_comprehension_attempts_article_id_check;
alter table public.reading_comprehension_attempts add constraint reading_comprehension_attempts_catalogue_fk
  foreign key(article_id) references public.reading_comprehension_catalogue(id);
create index if not exists reading_comprehension_attempts_article_idx on public.reading_comprehension_attempts(article_id);
alter table public.reading_comprehension_question_results drop constraint if exists reading_comprehension_question_results_question_number_check;
alter table public.reading_comprehension_question_results add constraint reading_comprehension_question_results_question_number_check
  check(question_number between 1 and 40);

create or replace function public._reading_comprehension_mark_answer(p_answer text,p_key jsonb,p_answers jsonb,p_name text)
returns boolean language plpgsql immutable set search_path='' as $$
declare v_expected text; v_normal text; v_candidate text; v_other text;
begin
  if coalesce((p_key->>'requiresReview')::boolean,false) then return false; end if;
  v_normal:=public._reading_comprehension_normalize_answer(p_answer);
  if v_normal ~ '^[a-z](\s*(,|and|&)\s*[a-z])+$' then
    select pg_catalog.string_agg(s,',' order by s) into v_normal
      from pg_catalog.regexp_split_to_table(v_normal,'\s*(,|and|&)\s*') s;
  end if;
  for v_other in select pg_catalog.jsonb_array_elements_text(coalesce(p_key->'unorderedGroup','[]'::jsonb)) loop
    if v_other<>p_name and public._reading_comprehension_normalize_answer(p_answers->>v_other)=v_normal then return false; end if;
  end loop;
  for v_expected in select pg_catalog.jsonb_array_elements_text(p_key->'accepted') loop
    v_candidate:=public._reading_comprehension_normalize_answer(v_expected);
    if v_candidate ~ '^[a-z](\s*(,|and|&)\s*[a-z])+$' then
      select pg_catalog.string_agg(s,',' order by s) into v_candidate
        from pg_catalog.regexp_split_to_table(v_candidate,'\s*(,|and|&)\s*') s;
    end if;
    if v_normal=v_candidate then return true; end if;
  end loop;
  return false;
end;
$$;
revoke all on function public._reading_comprehension_mark_answer(text,jsonb,jsonb,text) from public,anon,authenticated;

create or replace function public.reading_comprehension_save_attempt(
  p_token uuid,p_attempt_id uuid,p_article_id text,p_answers jsonb,p_duration_ms bigint,p_submit boolean,p_force_submit boolean
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_student_id uuid;
  v_attempt public.reading_comprehension_attempts%rowtype;
  v_keys jsonb; v_key text; v_value jsonb; v_answer text; v_correct text; v_count integer; v_review integer;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
  v_student_id:=public.flashcard_session_student_id(p_token);
  if v_student_id is null then raise exception 'Invalid or expired student session' using errcode='42501'; end if;
  select answer_key into v_keys from public.reading_comprehension_catalogue where id=p_article_id and enabled;
  if v_keys is null or pg_catalog.jsonb_typeof(coalesce(p_answers,'{}'::jsonb))<>'object'
    or coalesce(p_duration_ms,0) not between 0 and 14400000
    or (coalesce(p_force_submit,false) and not coalesce(p_submit,false)) then
    raise exception 'Invalid attempt data' using errcode='22023';
  end if;
  for v_key,v_value in select key,value from pg_catalog.jsonb_each(coalesce(p_answers,'{}'::jsonb)) loop
    if not (v_keys ? v_key) or pg_catalog.jsonb_typeof(v_value)<>'string'
      or pg_catalog.char_length(pg_catalog.btrim(v_value#>>'{}')) not between 1 and 100 then
      raise exception 'Invalid answer payload' using errcode='22023';
    end if;
  end loop;
  if p_attempt_id is null then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_student_id::text||':'||p_article_id,0));
    insert into public.reading_comprehension_attempts(student_id,article_id,attempt_number,answers,duration_ms)
    select v_student_id,p_article_id,coalesce(max(attempt_number),0)+1,coalesce(p_answers,'{}'::jsonb),coalesce(p_duration_ms,0)
    from public.reading_comprehension_attempts where student_id=v_student_id and article_id=p_article_id returning * into v_attempt;
  else
    select * into v_attempt from public.reading_comprehension_attempts
      where id=p_attempt_id and student_id=v_student_id and article_id=p_article_id for update;
    if not found then raise exception 'Attempt not found' using errcode='P0002'; end if;
    if v_attempt.status<>'in_progress' then return public._reading_comprehension_attempt_payload(v_attempt.id); end if;
    -- p_answers is the complete form snapshot, so cleared fields stay cleared.
    update public.reading_comprehension_attempts set answers=coalesce(p_answers,'{}'::jsonb),
      duration_ms=greatest(duration_ms,coalesce(p_duration_ms,0)),updated_at=pg_catalog.now()
      where id=v_attempt.id returning * into v_attempt;
  end if;
  -- A cleared or edited answer must not retain an earlier correctness result.
  delete from public.reading_comprehension_question_results r where r.attempt_id=v_attempt.id
    and r.submitted_answer is distinct from v_attempt.answers->>('q'||r.question_number);
  if coalesce(p_submit,false) then
    for v_key,v_value in select key,value from pg_catalog.jsonb_each(v_keys) loop
      v_answer:=nullif(pg_catalog.btrim(v_attempt.answers->>v_key),'');
      if v_answer is not null and not coalesce((v_value->>'requiresReview')::boolean,false) then
        v_correct:=pg_catalog.left(v_value->>'display',100);
        insert into public.reading_comprehension_question_results(attempt_id,student_id,question_number,submitted_answer,correct_answer,is_correct)
        values(v_attempt.id,v_student_id,pg_catalog.substr(v_key,2)::integer,v_answer,v_correct,
          public._reading_comprehension_mark_answer(v_answer,v_value,v_attempt.answers,v_key))
        on conflict(attempt_id,question_number) do update set submitted_answer=excluded.submitted_answer,
          correct_answer=excluded.correct_answer,is_correct=excluded.is_correct,submitted_at=pg_catalog.now(),updated_at=pg_catalog.now();
      end if;
    end loop;
    select count(*) into v_count from pg_catalog.jsonb_object_keys(v_keys);
    if coalesce(p_force_submit,false) or (select count(*) from pg_catalog.jsonb_object_keys(v_attempt.answers))=v_count then
      update public.reading_comprehension_attempts set status=case when coalesce(p_force_submit,false) then 'force_submitted' else 'submitted' end,
        force_submit=coalesce(p_force_submit,false),completed_at=pg_catalog.now(),updated_at=pg_catalog.now() where id=v_attempt.id;
    end if;
  end if;
  select count(*) into v_review from pg_catalog.jsonb_each(v_keys) k
    where coalesce((k.value->>'requiresReview')::boolean,false) and v_attempt.answers ? k.key;
  return public._reading_comprehension_attempt_payload(v_attempt.id)||pg_catalog.jsonb_build_object('review_count',v_review);
end;
$$;
revoke all on function public.reading_comprehension_save_attempt(uuid,uuid,text,jsonb,bigint,boolean,boolean) from public,anon;
grant execute on function public.reading_comprehension_save_attempt(uuid,uuid,text,jsonb,bigint,boolean,boolean) to authenticated;

create or replace function public.reading_comprehension_current_attempt(p_token uuid,p_article_id text)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_student uuid; v_id uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
  v_student:=public.flashcard_session_student_id(p_token);
  if v_student is null then raise exception 'Invalid or expired student session' using errcode='42501'; end if;
  select a.id into v_id from public.reading_comprehension_attempts a
    join public.reading_comprehension_catalogue c on c.id=a.article_id and c.enabled
    where a.student_id=v_student and a.article_id=p_article_id and a.status='in_progress'
    order by a.started_at desc limit 1;
  return public._reading_comprehension_attempt_payload(v_id);
end;
$$;
revoke all on function public.reading_comprehension_current_attempt(uuid,text) from public,anon;
grant execute on function public.reading_comprehension_current_attempt(uuid,text) to authenticated;

-- Preserve the existing dashboard's activity/time calculations, replacing only
-- its hard-coded title and adding the article ID for correct cross-article history.
do $$
declare v_definition text;
begin
  select pg_catalog.pg_get_functiondef('public.reading_comprehension_student_dashboard(uuid)'::regprocedure) into v_definition;
  if pg_catalog.strpos(v_definition,'''title'', ''Albert Einstein''')>0 then
    v_definition:=pg_catalog.replace(v_definition,'''title'', ''Albert Einstein''',
      '''article_id'', attempt.article_id, ''title'', coalesce((select c.title from public.reading_comprehension_catalogue c where c.id=attempt.article_id), attempt.article_id)');
    execute v_definition;
  else
    raise exception 'Dashboard definition changed: review before applying';
  end if;
end;
$$;
