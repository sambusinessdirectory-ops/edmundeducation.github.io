-- Authoritative Writing Submission topic permissions for restored/shared
-- student sessions. Apply this migration before deploying the matching Worker.

begin;

do $$
begin
  if to_regclass('public.flashcard_students') is null then
    raise exception 'Missing dependency: public.flashcard_students';
  end if;
  if to_regclass('public.flashcard_student_sessions') is null then
    raise exception 'Missing dependency: public.flashcard_student_sessions';
  end if;
end;
$$;

-- PostgreSQL cannot replace a function while changing its table return type.
-- The transaction makes this drop/recreate atomic for callers.
drop function if exists public.writing_submission_student_profile(uuid);

create function public.writing_submission_student_profile(p_token uuid)
returns table (id uuid, name text, session_expires_at timestamptz, access jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select
    student.id,
    student.name,
    session_row.expires_at,
    student.access - '__adminMessage' as access
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student
    on student.id = session_row.student_id
  where session_row.token = p_token
    and session_row.expires_at > now()
    and student.deleted_at is null
    and jsonb_typeof(student.access) = 'object'
    and not exists (
      select 1
      from jsonb_each(student.access) access_entry
      where access_entry.key <> '__adminMessage'
        and jsonb_typeof(access_entry.value) <> 'boolean'
    )
  limit 1;
$$;

revoke all on function public.writing_submission_student_profile(uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.writing_submission_student_profile(uuid) to service_role;

notify pgrst, 'reload schema';

commit;
