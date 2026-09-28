-- Store the student's optional proofreading checklist beside the final essay.
alter table public.writing_submissions
  add column if not exists proofread_checklist jsonb;

alter table public.writing_submissions
  add constraint writing_submissions_proofread_checklist_shape
  check (proofread_checklist is null or (
    jsonb_typeof(proofread_checklist) = 'object'
    and octet_length(proofread_checklist::text) <= 4096
  ));

create function public.writing_submission_submit_v5(
  p_id uuid,
  p_student_id uuid,
  p_topic text,
  p_answer text,
  p_word_count integer,
  p_duration_seconds integer,
  p_topic_resource jsonb,
  p_proofread_checklist jsonb
)
returns table (
  id uuid,
  topic text,
  answer text,
  word_count integer,
  duration_seconds integer,
  submitted_at timestamptz,
  deleted_at timestamptz,
  topic_resource jsonb,
  proofread_checklist jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_proofread_checklist is not null and (
    jsonb_typeof(p_proofread_checklist) <> 'object'
    or octet_length(p_proofread_checklist::text) > 4096
    or p_proofread_checklist ->> 'version' is distinct from '1'
  ) then
    raise exception 'Invalid proofreading checklist' using errcode = '22023';
  end if;

  perform 1 from public.writing_submission_submit_v4(
    p_id, p_student_id, p_topic, p_answer, p_word_count,
    p_duration_seconds, p_topic_resource
  );
  if not found then return; end if;

  if exists (
    select 1 from public.writing_submissions submission
    where submission.id = p_id and submission.student_id = p_student_id
      and submission.proofread_checklist is not null
      and submission.proofread_checklist is distinct from p_proofread_checklist
  ) then
    raise exception 'Submission proofreading checklist conflict' using errcode = '23505';
  end if;

  update public.writing_submissions submission
  set proofread_checklist = p_proofread_checklist
  where submission.id = p_id and submission.student_id = p_student_id
    and submission.proofread_checklist is null;

  return query
  select submission.id, submission.topic, submission.answer,
         submission.word_count, submission.duration_seconds,
         submission.submitted_at, submission.deleted_at,
         submission.topic_resource, submission.proofread_checklist
  from public.writing_submissions submission
  where submission.id = p_id and submission.student_id = p_student_id;
end;
$$;

create function public.writing_submission_admin_get_submission_v3(
  p_admin_token uuid,
  p_id uuid
)
returns table (
  id uuid,
  student_id uuid,
  student_name text,
  topic text,
  answer text,
  word_count integer,
  duration_seconds integer,
  submitted_at timestamptz,
  deleted_at timestamptz,
  proofread_checklist jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select existing.id, existing.student_id, existing.student_name,
         existing.topic, existing.answer, existing.word_count,
         existing.duration_seconds, existing.submitted_at, existing.deleted_at,
         submission.proofread_checklist
  from public.writing_submission_admin_get_submission_v2(p_admin_token, p_id) existing
  join public.writing_submissions submission on submission.id = existing.id;
$$;

revoke all on function public.writing_submission_submit_v5(uuid, uuid, text, text, integer, integer, jsonb, jsonb)
  from public, anon, authenticated;
revoke all on function public.writing_submission_admin_get_submission_v3(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.writing_submission_submit_v5(uuid, uuid, text, text, integer, integer, jsonb, jsonb)
  to service_role;
grant execute on function public.writing_submission_admin_get_submission_v3(uuid, uuid)
  to service_role;
