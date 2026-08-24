-- Repair follow-up saves for Reading Comprehension attempts.
-- GREATEST and NULLIF are SQL expressions, not pg_catalog functions.

create index if not exists reading_comprehension_results_attempt_student_idx
  on public.reading_comprehension_question_results (attempt_id, student_id);

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
        duration_ms = greatest(attempt.duration_ms, coalesce(p_duration_ms, 0)),
        updated_at = pg_catalog.now()
    where attempt.id = v_attempt.id
    returning * into v_attempt;
  end if;

  if coalesce(p_submit, false) then
    for v_question in 1..13 loop
      v_answer := nullif(pg_catalog.btrim(v_attempt.answers ->> ('q' || v_question::text)), '');
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
          duration_ms = greatest(attempt.duration_ms, coalesce(p_duration_ms, 0)),
          completed_at = pg_catalog.now(), updated_at = pg_catalog.now()
      where attempt.id = v_attempt.id;
    end if;
  end if;
  return public._reading_comprehension_attempt_payload(v_attempt.id);
end;
$$;

revoke all on function public.reading_comprehension_save_attempt(uuid, uuid, text, jsonb, bigint, boolean, boolean)
  from public, anon;
grant execute on function public.reading_comprehension_save_attempt(uuid, uuid, text, jsonb, bigint, boolean, boolean)
  to authenticated;
