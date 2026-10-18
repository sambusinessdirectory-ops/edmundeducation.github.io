-- Track active DSE practice time and expose account-scoped daily progress.
alter table public.dse_reading_attempts
  add column if not exists duration_ms bigint not null default 0
  check (duration_ms between 0 and 86400000);

create or replace function public.dse_reading_timed_attempt(
  p_token uuid, p_paper_id text, p_revision text,
  p_action text, p_attempt_id uuid, p_answers jsonb, p_duration_ms bigint
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_result jsonb;
  v_student uuid;
  v_duration bigint;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student := public.flashcard_session_student_id(p_token);
  if v_student is null then
    raise exception 'Invalid student session' using errcode = '42501';
  end if;
  if p_duration_ms is null or p_duration_ms not between 0 and 86400000 then
    raise exception 'Invalid practice time' using errcode = '22023';
  end if;
  v_result := public.dse_reading_attempt(
    p_token, p_paper_id, p_revision, p_action, p_attempt_id, p_answers
  );
  if v_result is null then return null; end if;
  if p_action in ('save', 'submit') then
    update public.dse_reading_attempts
       set duration_ms = greatest(duration_ms, p_duration_ms)
     where id = (v_result->>'attempt_id')::uuid and student_id = v_student;
  end if;
  select duration_ms into v_duration from public.dse_reading_attempts
    where id = (v_result->>'attempt_id')::uuid and student_id = v_student;
  return v_result || pg_catalog.jsonb_build_object('duration_ms', v_duration);
end;
$$;
revoke all on function public.dse_reading_timed_attempt(uuid,text,text,text,uuid,jsonb,bigint) from public, anon, authenticated;
grant execute on function public.dse_reading_timed_attempt(uuid,text,text,text,uuid,jsonb,bigint) to authenticated;

create or replace function public.dse_reading_student_dashboard(p_token uuid)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_student uuid;
  v_result jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student := public.flashcard_session_student_id(p_token);
  if v_student is null then
    raise exception 'Invalid student session' using errcode = '42501';
  end if;

  with submitted as (
    select (a.submitted_at at time zone 'Asia/Hong_Kong')::date as activity_date,
      (select pg_catalog.count(*)::integer from pg_catalog.jsonb_each_text(a.answers) answer
        where pg_catalog.btrim(answer.value) <> '') as questions,
      a.duration_ms as duration_ms
    from public.dse_reading_attempts a
    where a.student_id = v_student and a.status = 'submitted' and a.submitted_at is not null
    union all
    select (e.completed_at at time zone 'Asia/Hong_Kong')::date,
      (select pg_catalog.count(*)::integer
        from pg_catalog.jsonb_each(e.answers) article
        cross join lateral pg_catalog.jsonb_each_text(article.value) answer
        where pg_catalog.btrim(answer.value) <> ''),
      greatest(0::bigint,
        least(5400000::bigint,
          (pg_catalog.date_part('epoch', e.completed_at - e.started_at) * 1000)::bigint))
    from public.reading_full_exam_sessions e
    where e.student_id = v_student and e.exam_type = 'dse'
      and e.status in ('submitted', 'time_up') and e.completed_at is not null
  ), days as (
    select activity_date, pg_catalog.sum(questions)::bigint as questions,
      pg_catalog.sum(duration_ms)::bigint as duration_ms
    from submitted group by activity_date
  )
  select pg_catalog.jsonb_build_object(
    'activityDays', coalesce((select pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object('date', activity_date, 'questions', questions)
      order by activity_date) from days), '[]'::jsonb),
    'timeDays', coalesce((select pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object('date', activity_date, 'duration_ms', duration_ms)
      order by activity_date) from days), '[]'::jsonb),
    'totals', pg_catalog.jsonb_build_object(
      'questions', coalesce((select pg_catalog.sum(questions) from submitted), 0),
      'duration_ms', coalesce((select pg_catalog.sum(duration_ms) from submitted), 0)
    ),
    'attempts', '[]'::jsonb
  ) into v_result;
  return v_result;
end;
$$;
revoke all on function public.dse_reading_student_dashboard(uuid) from public, anon, authenticated;
grant execute on function public.dse_reading_student_dashboard(uuid) to authenticated;
