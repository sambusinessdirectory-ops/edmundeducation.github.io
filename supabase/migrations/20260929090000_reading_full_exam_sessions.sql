-- One fixed, account-owned paper and deadline per reading mock exam.
create table if not exists public.reading_full_exam_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null,
  exam_type text not null check (exam_type in ('ielts','dse')),
  mode text not null check (mode in ('random','same-year','mixed-year')),
  path text check (path in ('B1','B2')),
  articles jsonb not null check (jsonb_typeof(articles) = 'array'),
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  result jsonb,
  status text not null default 'active' check (status in ('active','submitted','time_up')),
  started_at timestamptz not null default now(),
  ends_at timestamptz not null,
  completed_at timestamptz
);
create index if not exists reading_full_exam_student_idx on public.reading_full_exam_sessions(student_id, started_at desc);
alter table public.reading_full_exam_sessions enable exam_row level security;
revoke all on public.reading_full_exam_sessions from public, anon, authenticated;

create or replace function public.reading_full_exam(p_token uuid, p_action text, p_args jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  sid uuid; exam_row public.reading_full_exam_sessions%rowtype; item jsonb; ids text[] := '{}';
  aid text; section text; yr integer; first_year integer; second_year integer;
  total integer := 0; expected_count integer; provided jsonb; answer_key jsonb;
  answer_name text; answer_value jsonb; results jsonb := '[]'::jsonb; correct_count integer;
  article_answers jsonb; exam_result jsonb; requested_id uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  sid := public.flashcard_session_student_id(p_token);
  if sid is null then raise exception 'Invalid or expired student session' using errcode = '42501'; end if;
  if p_action = 'active' then
    select * into exam_row from public.reading_full_exam_sessions
      where student_id = sid and status = 'active' order by started_at desc limit 1;
    if not found then return null; end if;
  elsif p_action = 'history' then
    return coalesce((select jsonb_agg(jsonb_build_object('id',id,'examType',exam_type,'mode',mode,
      'path',path,'articles',articles,'result',result,'status',status,'startedAt',started_at,
      'completedAt',completed_at) order by started_at desc)
      from (select * from public.reading_full_exam_sessions where student_id = sid and status <> 'active'
        order by started_at desc limit 30) recent), '[]'::jsonb);
  elsif p_action = 'start' then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(sid::text || ':reading-full-exam',0));
    if exists (select 1 from public.reading_full_exam_sessions where student_id = sid
      and status = 'active' and ends_at > now()) then
      raise exception 'An exam is already in progress' using errcode = '23505';
    end if;
    if jsonb_typeof(p_args->'articles') <> 'array' then
      raise exception 'Invalid paper' using errcode = '22023';
    end if;
    if p_args->>'examType' = 'ielts' then
      if jsonb_array_length(p_args->'articles') <> 3 or p_args->>'mode' <> 'random'
        or (p_args->'articles'->0->>'id') !~ '^p1-' or (p_args->'articles'->1->>'id') !~ '^p2-'
        or (p_args->'articles'->2->>'id') !~ '^p3-' then
        raise exception 'Invalid IELTS paper' using errcode = '22023';
      end if;
      select sum(k.n) into total
        from jsonb_array_elements(p_args->'articles') a
        join public.reading_comprehension_catalogue c on c.id = a->>'id' and c.enabled
        cross join lateral (select count(*) n from jsonb_object_keys(c.answer_key)) k;
      if total <> 40 then raise exception 'IELTS paper must contain 40 questions' using errcode = '22023'; end if;
    elsif p_args->>'examType' = 'dse' then
      if jsonb_array_length(p_args->'articles') <> 2 or p_args->>'path' not in ('B1','B2') then
        raise exception 'Invalid DSE paper' using errcode = '22023'; end if;
      first_year := (p_args->'articles'->0->>'year')::integer;
      second_year := (p_args->'articles'->1->>'year')::integer;
      if first_year not between 2012 and 2026 or first_year = 2024
        or second_year not between 2012 and 2026
        or p_args->'articles'->0->>'id' <> 'dse-' || first_year || '-a'
        or p_args->'articles'->1->>'id' <> 'dse-' || second_year || '-' || lower(p_args->>'path')
        or p_args->'articles'->0->>'section' <> 'A'
        or p_args->'articles'->1->>'section' <> p_args->>'path'
        or (p_args->>'mode' = 'same-year' and first_year <> second_year)
        or (p_args->>'mode' = 'mixed-year' and first_year = second_year)
        or p_args->>'mode' not in ('same-year','mixed-year') then
        raise exception 'Invalid DSE combination' using errcode = '22023'; end if;
    else
      raise exception 'Invalid exam type' using errcode = '22023';
    end if;
    insert into public.reading_full_exam_sessions(student_id,exam_type,mode,path,articles,ends_at)
      values(sid,p_args->>'examType',p_args->>'mode',nullif(p_args->>'path',''),p_args->'articles',
        now() + case when p_args->>'examType' = 'ielts' then interval '60 minutes' else interval '90 minutes' end)
      returning * into exam_row;
  elsif p_action in ('save','finish') then
    requested_id := nullif(p_args->>'id','')::uuid;
    select * into exam_row from public.reading_full_exam_sessions
      where id = requested_id and student_id = sid for update;
    if not found then raise exception 'Exam not found' using errcode = 'P0002'; end if;
    if exam_row.status <> 'active' then return jsonb_build_object('id',exam_row.id,'status',exam_row.status,'result',exam_row.result); end if;
    if now() < exam_row.ends_at then
      provided := coalesce(p_args->'answers','{}'::jsonb);
      if jsonb_typeof(provided) <> 'object' then raise exception 'Invalid answers' using errcode = '22023'; end if;
      for aid, article_answers in select key,value from jsonb_each(provided) loop
        if not exists (select 1 from jsonb_array_elements(exam_row.articles) e where e->>'id' = aid)
          or jsonb_typeof(article_answers) <> 'object' then raise exception 'Invalid article answers' using errcode = '22023'; end if;
        if exam_row.exam_type = 'ielts' then
          select c.answer_key into answer_key from public.reading_comprehension_catalogue c where c.id = aid and c.enabled;
        end if;
        for answer_name, answer_value in select key,value from jsonb_each(article_answers) loop
          if answer_name !~ '^q[0-9]{1,2}(_[a-zA-Z0-9-]+)?$' or jsonb_typeof(answer_value) <> 'string'
            or char_length(answer_value#>>'{}') > 500
            or (exam_row.exam_type = 'ielts' and not (answer_key ? answer_name)) then
            raise exception 'Invalid answer field' using errcode = '22023'; end if;
        end loop;
        exam_row.answers := jsonb_set(exam_row.answers,array[aid],article_answers,true);
      end loop;
      update public.reading_full_exam_sessions set answers = exam_row.answers where id = exam_row.id;
    end if;
    if p_action = 'finish' or now() >= exam_row.ends_at then
      if exam_row.exam_type = 'ielts' then
        for item in select value from jsonb_array_elements(exam_row.articles) loop
          aid := item->>'id'; article_answers := coalesce(exam_row.answers->aid,'{}'::jsonb);
          select c.answer_key into answer_key from public.reading_comprehension_catalogue c where c.id = aid and c.enabled;
          correct_count := 0;
          for answer_name, answer_value in select key,value from jsonb_each(answer_key) loop
            if article_answers ? answer_name and public._reading_comprehension_mark_answer(
              article_answers->>answer_name,answer_value,article_answers,answer_name) then
              correct_count := correct_count + 1;
            end if;
          end loop;
          select count(*) into expected_count from jsonb_object_keys(answer_key);
          results := results || jsonb_build_array(jsonb_build_object('id',aid,'section',item->>'section',
            'correct',correct_count,'total',expected_count));
        end loop;
        select sum((v->>'correct')::integer),sum((v->>'total')::integer) into correct_count,total
          from jsonb_array_elements(results) v;
        exam_result := jsonb_build_object('correct',correct_count,'total',total,'sections',results);
      else
        exam_result := jsonb_build_object('sections',exam_row.articles,'answers',exam_row.answers);
      end if;
      update public.reading_full_exam_sessions set status = case when now() >= ends_at then 'time_up' else 'submitted' end,
        result = exam_result, completed_at = now() where id = exam_row.id returning * into exam_row;
    end if;
  else
    raise exception 'Unknown exam action' using errcode = '22023';
  end if;
  return jsonb_build_object('id',exam_row.id,'examType',exam_row.exam_type,'mode',exam_row.mode,'path',exam_row.path,
    'articles',exam_row.articles,'answers',exam_row.answers,'result',exam_row.result,'status',exam_row.status,
    'startedAt',exam_row.started_at,'endsAt',exam_row.ends_at,'completedAt',exam_row.completed_at);
end;
$$;
revoke all on function public.reading_full_exam(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.reading_full_exam(uuid,text,jsonb) to authenticated;
