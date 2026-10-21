-- Teacher reference answers are stored server-side and shown only for submitted items.
create table if not exists public.error_identifier_answer_key (
  question_no integer primary key check (question_no between 1 and 60),
  sentence text not null,
  mark text not null check (mark in ('tick','cross')),
  topic text not null,
  wrong text not null default '',
  fix text not null default '',
  correct_sentence text not null default '',
  reason text not null,
  tip text not null
);
alter table public.error_identifier_answer_key enable row level security;
revoke all on public.error_identifier_answer_key from public, anon, authenticated;

-- Answer content is seeded privately in Supabase from the teacher source file.
-- It is intentionally absent from this public website repository.

create or replace function public.error_identifier_feedback(p_token uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $function$
declare
  v_student uuid;
  v_result jsonb;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student := public.flashcard_session_student_id(p_token);
  if v_student is null then
    raise exception 'Student session expired' using errcode = '42501';
  end if;
  select coalesce(pg_catalog.jsonb_object_agg(answer_key.question_no::text,
    pg_catalog.jsonb_build_object(
      'mark', answer_key.mark,
      'topic', answer_key.topic,
      'wrong', answer_key.wrong,
      'fix', answer_key.fix,
      'correct_sentence', answer_key.correct_sentence,
      'reason', answer_key.reason,
      'tip', answer_key.tip
    ) order by answer_key.question_no), '{}'::jsonb)
  into v_result
  from public.error_identifier_submissions submission
  join public.error_identifier_answer_key answer_key
    on submission.answers ? answer_key.question_no::text
  where submission.student_id = v_student;
  return v_result;
end;
$function$;
revoke all on function public.error_identifier_feedback(uuid) from public, anon, authenticated;
grant execute on function public.error_identifier_feedback(uuid) to authenticated;
