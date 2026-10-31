-- Return the answer only for Task 2 questions this signed-in student has answered.
-- The private answer-key table remains unreadable through the Data API.
create or replace function public.ielts_preview_student_feedback(p_token uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_student uuid;
  v_results jsonb;
begin
  v_student := public.flashcard_session_student_id(p_token);
  if v_student is null then
    raise exception 'Valid student sign-in required' using errcode = '28000';
  end if;

  select coalesce(
    jsonb_object_agg(a.question_id, jsonb_build_object(
      'selected', a.answer,
      'correct', a.answer = l.label,
      'answer', l.label
    )), '{}'::jsonb
  ) into v_results
  from ielts_preview_private.answers a
  join ielts_preview_private.type_labels l on l.question_id = a.question_id
  where a.student_id = v_student;

  return jsonb_build_object('results', v_results, 'serverTime', pg_catalog.clock_timestamp());
end; $$;

revoke all on function public.ielts_preview_student_feedback(uuid) from public;
grant execute on function public.ielts_preview_student_feedback(uuid) to anon, authenticated;
