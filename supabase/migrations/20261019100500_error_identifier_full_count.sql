-- A complete assignment now contains all 344 sentences.
update public.error_identifier_submissions
  set is_complete = (answered_count = 344);

create or replace function public.error_identifier_submission(
  p_token uuid, p_action text, p_answers jsonb default '{}'::jsonb
) returns jsonb
language plpgsql security definer set search_path = ''
as $function$
declare
  v_student uuid;
  v_saved public.error_identifier_submissions%rowtype;
  v_key text;
  v_answer jsonb;
  v_count integer;
  v_start integer;
  v_end integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student := public.flashcard_session_student_id(p_token);
  if v_student is null then
    raise exception 'Student session expired' using errcode = '42501';
  end if;
  if p_action = 'get' then
    select * into v_saved from public.error_identifier_submissions where student_id = v_student;
    return pg_catalog.jsonb_build_object(
      'answers', coalesce(v_saved.answers, '{}'::jsonb),
      'answered_count', coalesce(v_saved.answered_count, 0),
      'is_complete', coalesce(v_saved.is_complete, false),
      'submitted_at', v_saved.submitted_at
    );
  end if;
  if p_action <> 'submit' then raise exception 'Invalid action' using errcode = '22023'; end if;
  if p_answers is null or pg_catalog.jsonb_typeof(p_answers) <> 'object'
    or pg_catalog.pg_column_size(p_answers) > 250000 then
    raise exception 'Invalid answers' using errcode = '22023';
  end if;
  v_count := 0;
  for v_key, v_answer in select key, value from pg_catalog.jsonb_each(p_answers) loop
    if v_key !~ '^[1-9][0-9]{0,2}$'
      or v_key::integer > 344
      or pg_catalog.jsonb_typeof(v_answer) <> 'object' then
      raise exception 'Invalid question number or answer' using errcode = '22023';
    end if;
    if v_answer->>'mark' = 'tick' then
      if v_answer <> '{"mark":"tick"}'::jsonb then
        raise exception 'Invalid correct mark' using errcode = '22023';
      end if;
    elsif v_answer->>'mark' = 'cross' then
      if (v_answer->>'start') !~ '^[0-9]{1,2}$'
        or (v_answer->>'end') !~ '^[0-9]{1,2}$' then
        raise exception 'Select the incorrect word' using errcode = '22023';
      end if;
      v_start := (v_answer->>'start')::integer;
      v_end := (v_answer->>'end')::integer;
      if v_start > v_end or v_end > 40
        or pg_catalog.length(coalesce(v_answer->>'selected','')) not between 1 and 180
        or pg_catalog.length(coalesce(v_answer->>'correction','')) > 180
        or (coalesce(v_answer->>'remove','false') <> 'true'
          and pg_catalog.length(pg_catalog.btrim(coalesce(v_answer->>'correction',''))) = 0) then
        raise exception 'Complete the correction before submitting' using errcode = '22023';
      end if;
    else
      raise exception 'Choose correct or incorrect' using errcode = '22023';
    end if;
    v_count := v_count + 1;
  end loop;
  if v_count = 0 then raise exception 'Answer at least one question' using errcode = '22023'; end if;
  insert into public.error_identifier_submissions
    (student_id, answers, answered_count, is_complete, submitted_at)
  values (v_student, p_answers, v_count, v_count = 344, pg_catalog.now())
  on conflict (student_id) do update set
    answers = excluded.answers,
    answered_count = excluded.answered_count,
    is_complete = excluded.is_complete,
    submitted_at = excluded.submitted_at
  returning * into v_saved;
  return pg_catalog.jsonb_build_object(
    'answers', v_saved.answers,
    'answered_count', v_saved.answered_count,
    'is_complete', v_saved.is_complete,
    'submitted_at', v_saved.submitted_at
  );
end;
$function$;
revoke all on function public.error_identifier_submission(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.error_identifier_submission(uuid,text,jsonb) to authenticated;
