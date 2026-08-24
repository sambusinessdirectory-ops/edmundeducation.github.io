-- Reading Comprehension learning system: secure attempts, marking, dashboards,
-- Student Progress integration, and analysis bookmarks.
-- Apply after supabase-flashcard-accounts.sql, supabase-student-progress.sql,
-- supabase-student-progress-false-friends.sql, and
-- supabase-learning-portal-bookmarks-20260822.sql.

begin;

do $$
begin
  if pg_catalog.to_regprocedure('public.flashcard_session_student_id(uuid)') is null
    or pg_catalog.to_regprocedure('public._student_progress_snapshot(uuid)') is null
    or pg_catalog.to_regclass('public.learning_portal_bookmarks') is null
  then
    raise exception 'Apply the shared account, Student Progress, and bookmark migrations first';
  end if;
end;
$$;

create table if not exists public.reading_comprehension_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  article_id text not null check (article_id = 'p1-069-albert-einstein'),
  attempt_number integer not null check (attempt_number > 0),
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'force_submitted')),
  duration_ms bigint not null default 0 check (duration_ms between 0 and 14400000),
  force_submit boolean not null default false,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (student_id, article_id, attempt_number),
  unique (id, student_id)
);

create table if not exists public.reading_comprehension_question_results (
  attempt_id uuid not null,
  student_id uuid not null,
  question_number integer not null check (question_number between 1 and 13),
  submitted_answer text not null check (char_length(submitted_answer) between 1 and 100),
  correct_answer text not null check (char_length(correct_answer) between 1 and 100),
  is_correct boolean not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (attempt_id, question_number),
  foreign key (attempt_id, student_id)
    references public.reading_comprehension_attempts(id, student_id)
    on delete cascade
);

create index if not exists reading_comprehension_attempts_student_started_idx
  on public.reading_comprehension_attempts (student_id, started_at desc);
create index if not exists reading_comprehension_results_student_submitted_idx
  on public.reading_comprehension_question_results (student_id, submitted_at desc);

alter table public.reading_comprehension_attempts enable row level security;
alter table public.reading_comprehension_question_results enable row level security;
revoke all on table public.reading_comprehension_attempts from public, anon, authenticated;
revoke all on table public.reading_comprehension_question_results from public, anon, authenticated;

create or replace function public._reading_comprehension_correct_answer(p_question integer)
returns text
language sql
immutable
set search_path = ''
as $$
  select (array[
    'TRUE', 'TRUE', 'FALSE', 'FALSE', 'NOT GIVEN', 'FALSE', 'FALSE',
    'NOT GIVEN', 'pointed north', 'on his own', 'B', 'A', 'B'
  ])[p_question];
$$;

create or replace function public._reading_comprehension_normalize_answer(p_answer text)
returns text
language sql
immutable
set search_path = ''
as $$
  select pg_catalog.lower(
    pg_catalog.regexp_replace(
      pg_catalog.regexp_replace(pg_catalog.btrim(coalesce(p_answer, '')), '[.!?]+$', ''),
      '\s+', ' ', 'g'
    )
  );
$$;

create or replace function public._reading_comprehension_attempt_payload(p_attempt_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'attempt_id', attempt.id,
    'article_id', attempt.article_id,
    'attempt_number', attempt.attempt_number,
    'answers', attempt.answers,
    'status', attempt.status,
    'duration_ms', attempt.duration_ms,
    'answered_count', coalesce(result_summary.answered_count, 0),
    'correct_count', coalesce(result_summary.correct_count, 0),
    'question_results', coalesce(result_summary.question_results, '[]'::jsonb)
  )
  from public.reading_comprehension_attempts attempt
  left join lateral (
    select
      pg_catalog.count(*)::integer as answered_count,
      pg_catalog.count(*) filter (where result.is_correct)::integer as correct_count,
      pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'question_number', result.question_number,
        'submitted_answer', result.submitted_answer,
        'correct_answer', result.correct_answer,
        'correct', result.is_correct
      ) order by result.question_number) as question_results
    from public.reading_comprehension_question_results result
    where result.attempt_id = attempt.id
  ) result_summary on true
  where attempt.id = p_attempt_id;
$$;

create or replace function public.reading_comprehension_save_attempt(
  p_token uuid,
  p_attempt_id uuid,
  p_article_id text,
  p_answers jsonb,
  p_duration_ms bigint,
  p_submit boolean,
  p_force_submit boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_attempt public.reading_comprehension_attempts%rowtype;
  v_key text;
  v_value jsonb;
  v_question integer;
  v_answer text;
  v_correct text;
  v_answered integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then
    raise exception 'Invalid or expired student session' using errcode = '42501';
  end if;
  if p_article_id <> 'p1-069-albert-einstein'
    or pg_catalog.jsonb_typeof(coalesce(p_answers, '{}'::jsonb)) <> 'object'
    or coalesce(p_duration_ms, 0) not between 0 and 14400000
    or (coalesce(p_force_submit, false) and not coalesce(p_submit, false))
  then
    raise exception 'Invalid attempt data' using errcode = '22023';
  end if;
  for v_key, v_value in select key, value from pg_catalog.jsonb_each(coalesce(p_answers, '{}'::jsonb)) loop
    if v_key !~ '^q([1-9]|1[0-3])$'
      or pg_catalog.jsonb_typeof(v_value) <> 'string'
      or pg_catalog.char_length(pg_catalog.btrim(v_value #>> '{}')) not between 1 and 100
    then
      raise exception 'Invalid answer payload' using errcode = '22023';
    end if;
  end loop;

  if p_attempt_id is null then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_student_id::text || ':' || p_article_id, 0));
    insert into public.reading_comprehension_attempts(student_id, article_id, attempt_number, answers, duration_ms)
    select v_student_id, p_article_id, coalesce(max(attempt.attempt_number), 0) + 1,
      coalesce(p_answers, '{}'::jsonb), coalesce(p_duration_ms, 0)
    from public.reading_comprehension_attempts attempt
    where attempt.student_id = v_student_id and attempt.article_id = p_article_id
    returning * into v_attempt;
  else
    select * into v_attempt
    from public.reading_comprehension_attempts attempt
    where attempt.id = p_attempt_id and attempt.student_id = v_student_id
    for update;
    if not found then raise exception 'Attempt not found' using errcode = 'P0002'; end if;
    if v_attempt.status <> 'in_progress' then return public._reading_comprehension_attempt_payload(v_attempt.id); end if;
    update public.reading_comprehension_attempts attempt
    set answers = attempt.answers || coalesce(p_answers, '{}'::jsonb),
        duration_ms = pg_catalog.greatest(attempt.duration_ms, coalesce(p_duration_ms, 0)),
        updated_at = pg_catalog.now()
    where attempt.id = v_attempt.id
    returning * into v_attempt;
  end if;

  if coalesce(p_submit, false) then
    for v_question in 1..13 loop
      v_answer := pg_catalog.nullif(pg_catalog.btrim(v_attempt.answers ->> ('q' || v_question::text)), '');
      if v_answer is not null then
        v_correct := public._reading_comprehension_correct_answer(v_question);
        insert into public.reading_comprehension_question_results as result(
          attempt_id, student_id, question_number, submitted_answer, correct_answer, is_correct
        ) values (
          v_attempt.id, v_student_id, v_question, v_answer, v_correct,
          public._reading_comprehension_normalize_answer(v_answer) = public._reading_comprehension_normalize_answer(v_correct)
        )
        on conflict (attempt_id, question_number) do update
          set submitted_answer = excluded.submitted_answer,
              correct_answer = excluded.correct_answer,
              is_correct = excluded.is_correct,
              submitted_at = pg_catalog.now(),
              updated_at = pg_catalog.now();
      end if;
    end loop;
    select pg_catalog.count(*)::integer into v_answered
    from public.reading_comprehension_question_results result
    where result.attempt_id = v_attempt.id;
    if coalesce(p_force_submit, false) or v_answered = 13 then
      update public.reading_comprehension_attempts attempt
      set status = case when coalesce(p_force_submit, false) then 'force_submitted' else 'submitted' end,
          force_submit = coalesce(p_force_submit, false),
          duration_ms = pg_catalog.greatest(attempt.duration_ms, coalesce(p_duration_ms, 0)),
          completed_at = pg_catalog.now(), updated_at = pg_catalog.now()
      where attempt.id = v_attempt.id;
    end if;
  end if;
  return public._reading_comprehension_attempt_payload(v_attempt.id);
end;
$$;

create or replace function public.reading_comprehension_student_dashboard(p_token uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then raise exception 'Invalid or expired student session' using errcode = '42501'; end if;
  return pg_catalog.jsonb_build_object(
    'attempts', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'attempt_id', attempt.id, 'title', 'Albert Einstein', 'status', attempt.status,
        'duration_ms', attempt.duration_ms, 'started_at', attempt.started_at,
        'answered_count', coalesce(summary.answered_count, 0), 'correct_count', coalesce(summary.correct_count, 0)
      ) order by attempt.started_at desc)
      from public.reading_comprehension_attempts attempt
      left join lateral (
        select pg_catalog.count(*)::integer answered_count,
          pg_catalog.count(*) filter (where result.is_correct)::integer correct_count
        from public.reading_comprehension_question_results result where result.attempt_id = attempt.id
      ) summary on true
      where attempt.student_id = v_student_id
    ), '[]'::jsonb),
    'activityDays', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('date', day.activity_date, 'questions', day.questions) order by day.activity_date)
      from (
        select (result.submitted_at at time zone 'Asia/Hong_Kong')::date activity_date, pg_catalog.count(*)::integer questions
        from public.reading_comprehension_question_results result where result.student_id = v_student_id group by 1
      ) day
    ), '[]'::jsonb),
    'timeDays', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('date', day.activity_date, 'duration_ms', day.duration_ms) order by day.activity_date)
      from (
        select (attempt.started_at at time zone 'Asia/Hong_Kong')::date activity_date, pg_catalog.sum(attempt.duration_ms)::bigint duration_ms
        from public.reading_comprehension_attempts attempt where attempt.student_id = v_student_id group by 1
      ) day
    ), '[]'::jsonb),
    'totals', pg_catalog.jsonb_build_object(
      'questions', (select pg_catalog.count(*) from public.reading_comprehension_question_results result where result.student_id = v_student_id),
      'duration_ms', (select coalesce(pg_catalog.sum(attempt.duration_ms), 0) from public.reading_comprehension_attempts attempt where attempt.student_id = v_student_id)
    )
  );
end;
$$;

create or replace function public._student_progress_reading_comprehension_source(p_student_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with activity_days as (
    select (result.submitted_at at time zone 'Asia/Hong_Kong')::date activity_date,
      pg_catalog.count(*)::integer questions
    from public.reading_comprehension_question_results result
    where result.student_id = p_student_id group by 1
  ), time_days as (
    select (attempt.started_at at time zone 'Asia/Hong_Kong')::date activity_date,
      pg_catalog.sum(attempt.duration_ms)::bigint total_ms
    from public.reading_comprehension_attempts attempt
    where attempt.student_id = p_student_id group by 1
  )
  select pg_catalog.jsonb_build_object(
    'activityDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('date', day.activity_date, 'questions', day.questions) order by day.activity_date) from activity_days day), '[]'::jsonb),
    'timeDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object('date', day.activity_date, 'totalMs', day.total_ms) order by day.activity_date) from time_days day where day.total_ms > 0), '[]'::jsonb)
  );
$$;

create or replace function public.student_progress_student_snapshot(p_token uuid)
returns table (snapshot jsonb)
language sql stable security definer set search_path = ''
as $$
  select pg_catalog.jsonb_set(
    pg_catalog.jsonb_set(public._student_progress_snapshot(student.id), '{sources,falseFriends}', public._student_progress_learning_portal_source(student.id, 'false-friends'), true),
    '{sources,readingComprehension}', public._student_progress_reading_comprehension_source(student.id), true
  )
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id = session_row.student_id
  where session_row.token = p_token and session_row.expires_at > pg_catalog.now() and student.deleted_at is null limit 1;
$$;

create or replace function public.student_progress_admin_snapshot(p_admin_token uuid, p_student_id uuid)
returns table (snapshot jsonb)
language sql stable security definer set search_path = ''
as $$
  select pg_catalog.jsonb_set(
    pg_catalog.jsonb_set(public._student_progress_snapshot(student.id), '{sources,falseFriends}', public._student_progress_learning_portal_source(student.id, 'false-friends'), true),
    '{sources,readingComprehension}', public._student_progress_reading_comprehension_source(student.id), true
  )
  from public.flashcard_students student
  where public._student_progress_admin_id(p_admin_token) is not null and student.id = p_student_id and student.deleted_at is null limit 1;
$$;

alter table public.learning_portal_bookmarks drop constraint if exists learning_portal_bookmarks_system_key_check;
alter table public.learning_portal_bookmarks add constraint learning_portal_bookmarks_system_key_check
  check (system_key in ('grammar', 'listening', 'reading-comprehension'));

create or replace function public.learning_portal_set_bookmark(
  p_token uuid, p_system_key text, p_item_key text, p_title text, p_detail text, p_href text, p_bookmarked boolean
)
returns table(item_key text, bookmarked boolean)
language plpgsql security definer set search_path = ''
as $$
declare v_student_id uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then raise exception 'Invalid or expired student session' using errcode = '42501'; end if;
  if p_system_key not in ('grammar', 'listening', 'reading-comprehension')
    or pg_catalog.char_length(coalesce(p_item_key, '')) not between 1 and 180
    or pg_catalog.char_length(coalesce(p_title, '')) not between 1 and 300
    or pg_catalog.char_length(coalesce(p_detail, '')) > 3000
    or pg_catalog.char_length(coalesce(p_href, '')) not between 1 and 500
    or p_href ~* '^(?:[a-z]+:|//)' or p_href like '%..%'
  then raise exception 'Invalid bookmark data' using errcode = '22023'; end if;
  if coalesce(p_bookmarked, false) then
    insert into public.learning_portal_bookmarks as saved(student_id, system_key, item_key, title, detail, href)
    values(v_student_id, p_system_key, p_item_key, p_title, coalesce(p_detail, ''), p_href)
    on conflict on constraint learning_portal_bookmarks_pkey do update
      set title = excluded.title, detail = excluded.detail, href = excluded.href, updated_at = pg_catalog.now();
    return query select p_item_key, true;
  else
    delete from public.learning_portal_bookmarks saved where saved.student_id = v_student_id and saved.system_key = p_system_key and saved.item_key = p_item_key;
    return query select p_item_key, false;
  end if;
end;
$$;

create or replace function public.learning_portal_list_bookmarks(p_token uuid, p_system_key text)
returns table(item_key text, title text, detail text, href text, created_at timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
declare v_student_id uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then raise exception 'Invalid or expired student session' using errcode = '42501'; end if;
  if p_system_key not in ('grammar', 'listening', 'reading-comprehension') then raise exception 'Invalid system key' using errcode = '22023'; end if;
  return query select saved.item_key, saved.title, saved.detail, saved.href, saved.created_at
    from public.learning_portal_bookmarks saved where saved.student_id = v_student_id and saved.system_key = p_system_key
    order by saved.created_at desc, saved.item_key;
end;
$$;

revoke all on function public._reading_comprehension_correct_answer(integer) from public, anon, authenticated, service_role;
revoke all on function public._reading_comprehension_normalize_answer(text) from public, anon, authenticated, service_role;
revoke all on function public._reading_comprehension_attempt_payload(uuid) from public, anon, authenticated, service_role;
revoke all on function public._student_progress_reading_comprehension_source(uuid) from public, anon, authenticated, service_role;
revoke all on function public.reading_comprehension_save_attempt(uuid, uuid, text, jsonb, bigint, boolean, boolean) from public, anon, authenticated;
revoke all on function public.reading_comprehension_student_dashboard(uuid) from public, anon, authenticated;
grant execute on function public.reading_comprehension_save_attempt(uuid, uuid, text, jsonb, bigint, boolean, boolean) to authenticated;
grant execute on function public.reading_comprehension_student_dashboard(uuid) to authenticated;
revoke all on function public.learning_portal_set_bookmark(uuid, text, text, text, text, text, boolean) from public, anon, authenticated;
grant execute on function public.learning_portal_set_bookmark(uuid, text, text, text, text, text, boolean) to authenticated;
revoke all on function public.learning_portal_list_bookmarks(uuid, text) from public, anon, authenticated;
grant execute on function public.learning_portal_list_bookmarks(uuid, text) to authenticated;
revoke all on function public.student_progress_student_snapshot(uuid) from public, anon, authenticated, service_role;
revoke all on function public.student_progress_admin_snapshot(uuid, uuid) from public, anon, authenticated, service_role;
grant execute on function public.student_progress_student_snapshot(uuid) to service_role;
grant execute on function public.student_progress_admin_snapshot(uuid, uuid) to service_role;

notify pgrst, 'reload schema';
commit;
