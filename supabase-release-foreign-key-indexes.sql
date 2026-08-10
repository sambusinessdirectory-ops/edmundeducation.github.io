-- Release follow-up: cover every foreign key introduced or exercised by the
-- 2026-08-10 portal expansion.  PostgreSQL does not create indexes on the
-- referencing side of foreign keys automatically; these indexes keep parent
-- deletion, session cleanup, catalogue updates and audit queries predictable.

begin;

create index if not exists common_expression_bookmarks_catalogue_idx
  on public.common_expression_bookmarks (system_key, lesson_id);

create index if not exists common_expression_lesson_states_catalogue_idx
  on public.common_expression_lesson_states (system_key, lesson_id);

create index if not exists common_expression_question_completions_catalogue_idx
  on public.common_expression_question_completions (system_key, lesson_id);

create index if not exists common_expression_time_activity_days_catalogue_idx
  on public.common_expression_time_activity_days (system_key, lesson_id);

create index if not exists parent_communication_assignments_admin_idx
  on public.parent_communication_assignments (assigned_by_admin);

create index if not exists parent_communication_sessions_parent_idx
  on public.parent_communication_sessions (parent_id);

create index if not exists schedule_admin_sessions_admin_idx
  on public.schedule_admin_sessions (admin_id);

create index if not exists schedule_entries_completed_admin_idx
  on public.schedule_entries (completed_by_admin);

create index if not exists schedule_entries_created_admin_idx
  on public.schedule_entries (created_by_admin);

create index if not exists schedule_student_account_audit_actor_idx
  on public.schedule_student_account_audit (actor_admin_id);

create index if not exists speaking_admin_sessions_admin_idx
  on public.speaking_admin_sessions (admin_id);

create index if not exists student_progress_admin_sessions_admin_idx
  on public.student_progress_admin_sessions (admin_id);

commit;

notify pgrst, 'reload schema';
