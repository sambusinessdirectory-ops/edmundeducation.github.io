-- Flashcard integrity phase 1 / stage 13 of 14: least privilege and API activation.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

alter table flashcard_integrity.state_key_rules enable row level security;
alter table flashcard_integrity.alerts enable row level security;
alter table flashcard_integrity.alert_outbox enable row level security;
alter table flashcard_integrity.write_receipts enable row level security;
alter table flashcard_integrity.state_revisions enable row level security;
alter table flashcard_integrity.attempt_records enable row level security;
alter table flashcard_integrity.attempt_mutations enable row level security;
alter table flashcard_integrity.snapshot_runs enable row level security;
alter table flashcard_integrity.student_snapshots enable row level security;

revoke all on all tables in schema flashcard_integrity
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema flashcard_integrity
  from public, anon, authenticated, service_role;
revoke execute on all functions in schema flashcard_integrity
  from public, anon, authenticated, service_role;

revoke all on function public.flashcard_student_get_state_v2(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_student_upsert_state_v2(uuid, text, jsonb, uuid, bigint)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_get_student_state_v2(text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_upsert_student_state_v2(text, text, text, text, jsonb, uuid, bigint)
  from public, anon, authenticated, service_role;

grant execute on function public.flashcard_student_get_state_v2(uuid) to authenticated;
grant execute on function public.flashcard_student_upsert_state_v2(uuid, text, jsonb, uuid, bigint) to authenticated;
grant execute on function public.flashcard_admin_get_student_state_v2(text, text, text) to authenticated;
grant execute on function public.flashcard_admin_upsert_student_state_v2(text, text, text, text, jsonb, uuid, bigint) to authenticated;

-- Helper functions and unused destructive APIs are not client endpoints.
revoke all on function public.flashcard_merge_attempt_arrays(jsonb, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_session_student_id(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_ok(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_assign_student_sort_order()
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_touch_updated_at()
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_delete_student_with_state(text, text, text)
  from public, anon, authenticated, service_role;

-- Do not remove legacy anon/PUBLIC endpoint grants in this stage. Existing web clients
-- must first be observed using an authenticated Supabase Auth role. The optional,
-- manually gated stage 14 performs that kill-switch cut-over after confirmation.

notify pgrst, 'reload schema';

-- Deliberately NO cron.schedule here. An automatic same-database snapshot job remains
-- disabled until an independent dispatcher can (1) detect a failed run, (2) verify an
-- encrypted immutable offsite copy, and (3) enforce retention only after that receipt.
-- This prevents silent cron "success" and unbounded same-project quota consumption.

commit;
