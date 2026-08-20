-- Register the empty False Friends backbone in the unified Student Progress
-- snapshot. Apply after supabase-student-progress.sql.

begin;

do $$
begin
  if to_regclass('public.learning_portal_progress_events') is null
    or to_regprocedure('public._student_progress_snapshot(uuid)') is null
    or to_regprocedure('public._student_progress_learning_portal_source(uuid,text)') is null
  then
    raise exception 'Apply supabase-student-progress.sql first';
  end if;
end;
$$;

alter table public.learning_portal_progress_events
  drop constraint if exists learning_portal_progress_events_system_key_check;

alter table public.learning_portal_progress_events
  add constraint learning_portal_progress_events_system_key_check
  check (system_key in (
    'quotes', 'grammar', 'collocation', 'irregular-verb',
    'thematic-vocabulary', 'part-of-speech', 'synonyms',
    'error-identifier', 'spelling', 'reading-logic',
    'translation-skills', 'business-school', 'complex-questions',
    'english-humour-speaking', 'english-humour-writing',
    'false-friends'
  ));

create or replace function public.student_progress_student_snapshot(p_token uuid)
returns table (snapshot jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select pg_catalog.jsonb_set(
    public._student_progress_snapshot(student.id),
    '{sources,falseFriends}',
    public._student_progress_learning_portal_source(student.id, 'false-friends'),
    true
  )
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id = session_row.student_id
  where session_row.token = p_token
    and session_row.expires_at > pg_catalog.now()
    and student.deleted_at is null
  limit 1;
$$;

create or replace function public.student_progress_admin_snapshot(
  p_admin_token uuid,
  p_student_id uuid
)
returns table (snapshot jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select pg_catalog.jsonb_set(
    public._student_progress_snapshot(student.id),
    '{sources,falseFriends}',
    public._student_progress_learning_portal_source(student.id, 'false-friends'),
    true
  )
  from public.flashcard_students student
  where public._student_progress_admin_id(p_admin_token) is not null
    and student.id = p_student_id
    and student.deleted_at is null
  limit 1;
$$;

revoke all on function public.student_progress_student_snapshot(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.student_progress_admin_snapshot(uuid, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.student_progress_student_snapshot(uuid)
  to service_role;
grant execute on function public.student_progress_admin_snapshot(uuid, uuid)
  to service_role;

notify pgrst, 'reload schema';

commit;
