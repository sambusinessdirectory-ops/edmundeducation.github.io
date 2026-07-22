-- One-time, idempotent migration for same-origin portal switching.
-- It validates an existing Flashcard session for the Flashcard portal and
-- exchanges it for the Writing Practice session format without resending a password.

create or replace function public.flashcard_student_session_profile(p_token uuid)
returns table (
  id uuid,
  name text,
  role text,
  access jsonb,
  created_at timestamptz,
  session_token uuid
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    student.id,
    student.name,
    'student'::text,
    student.access,
    student.created_at,
    session_row.token
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student
    on student.id = session_row.student_id
  where session_row.token = p_token
    and session_row.expires_at > now()
    and student.deleted_at is null
  limit 1;
$$;

revoke all on function public.flashcard_student_session_profile(uuid) from public, anon, authenticated;
grant execute on function public.flashcard_student_session_profile(uuid) to authenticated;

create or replace function public.writing_student_session_from_flashcard(p_token uuid)
returns table (
  id uuid,
  name text,
  access jsonb,
  created_at timestamptz,
  session_token uuid
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_flashcard_student_id uuid;
  v_writing_student_id uuid;
  v_session_token uuid := gen_random_uuid();
begin
  v_flashcard_student_id := public.flashcard_session_student_id(p_token);
  if v_flashcard_student_id is null then
    return;
  end if;

  v_writing_student_id := public.writing_sync_flashcard_student(v_flashcard_student_id);
  if v_writing_student_id is null then
    return;
  end if;

  update public.writing_student_accounts writing_student
  set session_token = v_session_token,
      updated_at = now()
  where writing_student.id = v_writing_student_id;

  return query
  select
    writing_student.id,
    flashcard_student.name,
    coalesce(writing_student.access, public.writing_default_access()),
    coalesce(writing_student.created_at, flashcard_student.created_at),
    v_session_token
  from public.writing_student_accounts writing_student
  join public.flashcard_students flashcard_student
    on flashcard_student.id = v_flashcard_student_id
  where writing_student.id = v_writing_student_id
    and flashcard_student.deleted_at is null
  limit 1;
end;
$$;

revoke all on function public.writing_student_session_from_flashcard(uuid) from public, anon, authenticated;
grant execute on function public.writing_student_session_from_flashcard(uuid) to authenticated;
