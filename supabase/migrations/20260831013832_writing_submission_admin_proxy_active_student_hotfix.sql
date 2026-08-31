begin;

do $$
begin
  if to_regprocedure(
    'public.writing_submission_admin_submit_for_student(uuid,uuid,uuid,text,text,integer)'
  ) is null then
    raise exception 'Missing Writing Submission admin proxy dependency';
  end if;
end
$$;

create or replace function public.writing_submission_admin_submit_for_student(
  p_admin_token uuid,
  p_id uuid,
  p_student_id uuid,
  p_topic text,
  p_answer text,
  p_word_count integer
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
  topic_resource jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_row record;
begin
  v_admin_id := public._writing_submission_admin_id(p_admin_token);
  if v_admin_id is null then return; end if;

  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    return;
  end if;

  select submitted.*
  into v_row
  from public.writing_submission_submit_v4(
    p_id, p_student_id, p_topic, p_answer, p_word_count, 0, null
  ) submitted;
  if v_row.id is null then return; end if;

  insert into public.writing_submission_admin_audit (
    admin_id, student_id, action, submission_id, affected_count
  ) values (
    v_admin_id, p_student_id, 'proxy_submission', v_row.id, 1
  );

  return query
  select v_row.id,
         p_student_id,
         student.name,
         v_row.topic,
         v_row.answer,
         v_row.word_count,
         v_row.duration_seconds,
         v_row.submitted_at,
         v_row.deleted_at,
         v_row.topic_resource
  from public.flashcard_students student
  where student.id = p_student_id
    and student.deleted_at is null;
end;
$$;

revoke all on function public.writing_submission_admin_submit_for_student(
  uuid, uuid, uuid, text, text, integer
) from public, anon, authenticated;
grant execute on function public.writing_submission_admin_submit_for_student(
  uuid, uuid, uuid, text, text, integer
) to service_role;

commit;
