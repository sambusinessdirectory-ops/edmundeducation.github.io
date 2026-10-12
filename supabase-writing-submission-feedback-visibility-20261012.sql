-- A hidden feedback item keeps its published content and publication date, but
-- all student RPCs that require status = 'published' stop exposing it.
begin;

alter table public.writing_submission_feedback
  drop constraint writing_submission_feedback_status_valid;
alter table public.writing_submission_feedback
  add constraint writing_submission_feedback_status_valid
  check (status in ('draft', 'published', 'hidden'));
alter table public.writing_submission_feedback
  drop constraint writing_submission_feedback_publication_state;
alter table public.writing_submission_feedback
  add constraint writing_submission_feedback_publication_state
  check ((status = 'draft' and published_at is null)
    or (status in ('published', 'hidden') and published_at is not null));

create or replace function public.writing_submission_feedback_admin_set_hidden(
  p_admin_token uuid,
  p_submission_id uuid,
  p_hidden boolean,
  p_expected_feedback_id uuid,
  p_expected_version integer
)
returns table (id uuid, status text, version integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_next_status text;
  v_feedback public.writing_submission_feedback%rowtype;
begin
  select admin.id into v_admin_id
  from public.writing_submission_admin_me(p_admin_token) admin;
  if v_admin_id is null then
    raise exception 'Administrator authentication required' using errcode = '42501';
  end if;
  if p_hidden is null or p_expected_feedback_id is null or p_expected_version is null then
    raise exception 'Invalid feedback visibility update' using errcode = '22023';
  end if;

  select feedback.* into v_feedback
  from public.writing_submission_feedback feedback
  where feedback.submission_id = p_submission_id
  for update;
  if not found then return; end if;
  if v_feedback.id is distinct from p_expected_feedback_id
    or v_feedback.version is distinct from p_expected_version then
    raise exception 'Feedback changed in another session' using errcode = 'P4090';
  end if;
  if v_feedback.status = 'draft' then
    raise exception 'Only published feedback can be hidden or restored' using errcode = '22023';
  end if;
  v_next_status := case when p_hidden then 'hidden' else 'published' end;
  if v_feedback.status is distinct from v_next_status then
    update public.writing_submission_feedback feedback
    set status = v_next_status,
        version = feedback.version + 1,
        updated_at = clock_timestamp(),
        updated_by_admin_id = v_admin_id
    where feedback.id = v_feedback.id
    returning feedback.* into v_feedback;
  end if;
  return query select v_feedback.id, v_feedback.status, v_feedback.version;
end;
$$;

-- Past feedback discussions can contain quoted feedback. Keep them available
-- to administrators but hide them from students while feedback is hidden.
create or replace function public.writing_feedback_questions_list(
  p_submission_id uuid,
  p_student_id uuid default null,
  p_admin_token uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_admin_token is not null then
    if not exists(select 1 from public.writing_submission_admin_me(p_admin_token)) then
      raise exception 'Forbidden' using errcode = '42501';
    end if;
  elsif p_student_id is null or not exists (
    select 1 from public.writing_submissions submission
    where submission.id = p_submission_id
      and submission.student_id = p_student_id
      and submission.deleted_at is null
  ) then
    raise exception 'Forbidden' using errcode = '42501';
  elsif not exists (
    select 1 from public.writing_submission_feedback feedback
    where feedback.submission_id = p_submission_id
      and feedback.student_id = p_student_id
      and feedback.status = 'published'
  ) then
    return '[]'::jsonb;
  end if;
  return coalesce((
    select jsonb_agg(to_jsonb(question) order by question.created_at, question.id)
    from public.writing_feedback_questions question
    where question.submission_id = p_submission_id
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.writing_submission_feedback_admin_set_hidden(uuid, uuid, boolean, uuid, integer)
  from public, anon, authenticated, service_role;
grant execute on function public.writing_submission_feedback_admin_set_hidden(uuid, uuid, boolean, uuid, integer)
  to service_role;
notify pgrst, 'reload schema';
commit;
