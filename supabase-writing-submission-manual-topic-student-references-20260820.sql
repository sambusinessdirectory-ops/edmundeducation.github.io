-- Writing Submission: expose admin-curated learning references to authenticated students.
-- Apply after supabase-writing-submission-manual-topics-20260820.sql.
begin;

drop function if exists public.writing_submission_student_list_manual_topics(uuid);

create function public.writing_submission_student_list_manual_topics(p_token uuid)
returns table(
  id uuid,
  title text,
  prompt text,
  flashcard_url text,
  writing_practice_url text,
  model_essay_url text,
  word_list text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path=''
as $$
  select
    t.id,
    t.title,
    t.prompt,
    t.flashcard_url,
    t.writing_practice_url,
    t.model_essay_url,
    t.word_list,
    t.created_at,
    t.updated_at
  from public._writing_manual_topic_rows() t
  where exists (
    select 1
    from public.writing_submission_student_profile(p_token) student
  );
$$;

revoke all on function public.writing_submission_student_list_manual_topics(uuid)
  from public, anon, authenticated;
grant execute on function public.writing_submission_student_list_manual_topics(uuid)
  to service_role;

notify pgrst,'reload schema';
commit;
