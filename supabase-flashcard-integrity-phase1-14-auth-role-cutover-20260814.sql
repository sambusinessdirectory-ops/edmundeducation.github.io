-- Flashcard integrity phase 1 / optional stage 14: authenticated-only client cut-over.
--
-- FAILS CLOSED BY DEFAULT. In the SAME database session, the operator must first run:
--   set flashcard_integrity.authenticated_client_cutover_approved =
--     'confirmed-authenticated-only-20260814';
-- Then run this file only after production telemetry proves current Flashcard clients
-- establish an authenticated (anonymous-auth user) JWT before every RPC. Stage 13 is
-- safe to leave active indefinitely while old clients are upgraded.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

do $$
begin
  if pg_catalog.current_setting(
       'flashcard_integrity.authenticated_client_cutover_approved', true
     ) is distinct from 'confirmed-authenticated-only-20260814' then
    raise exception using
      errcode = '55000',
      message = 'Authenticated-client cut-over not approved in this session; no grants changed.';
  end if;
end;
$$;

-- Existing state/account endpoints: remove PostgreSQL's default PUBLIC execute grant,
-- remove anon explicitly, and preserve the confirmed authenticated clients.
revoke all on function public.flashcard_student_get_state(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_student_upsert_state(uuid, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_student_delete_state(uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_get_student_state(text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_upsert_student_state(text, text, text, text, jsonb)
  from public, anon, authenticated, service_role;

grant execute on function public.flashcard_student_get_state(uuid) to authenticated;
grant execute on function public.flashcard_student_upsert_state(uuid, text, jsonb) to authenticated;
-- Shared Speaking/display-preference consumers still need this generic delete RPC;
-- the table trigger rejects physical deletion for Flashcard v2-writable keys.
grant execute on function public.flashcard_student_delete_state(uuid, text) to authenticated;
grant execute on function public.flashcard_admin_get_student_state(text, text, text) to authenticated;
grant execute on function public.flashcard_admin_upsert_student_state(text, text, text, text, jsonb) to authenticated;

revoke all on function public.flashcard_admin_login(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_student_login(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_list_students(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_upsert_student(text, text, text, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_delete_student(text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_set_student_access(text, text, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_change_student_password(text, text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_get_password_logs(text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_reorder_students(text, text, text[])
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_get_student_list_preferences(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_set_student_sort_mode(text, text, text)
  from public, anon, authenticated, service_role;

grant execute on function public.flashcard_admin_login(text, text) to authenticated;
grant execute on function public.flashcard_student_login(text, text) to authenticated;
grant execute on function public.flashcard_admin_list_students(text, text) to authenticated;
grant execute on function public.flashcard_admin_upsert_student(text, text, text, text, jsonb) to authenticated;
grant execute on function public.flashcard_admin_delete_student(text, text, text) to authenticated;
grant execute on function public.flashcard_admin_set_student_access(text, text, text, jsonb) to authenticated;
grant execute on function public.flashcard_admin_change_student_password(text, text, text, text) to authenticated;
grant execute on function public.flashcard_admin_get_password_logs(text, text, text) to authenticated;
grant execute on function public.flashcard_admin_reorder_students(text, text, text[]) to authenticated;
grant execute on function public.flashcard_admin_get_student_list_preferences(text, text) to authenticated;
grant execute on function public.flashcard_admin_set_student_sort_mode(text, text, text) to authenticated;

do $$
begin
  if pg_catalog.to_regprocedure('public.flashcard_student_session_profile(uuid)') is not null then
    execute 'revoke all on function public.flashcard_student_session_profile(uuid) '
      || 'from public, anon, authenticated, service_role';
    execute 'grant execute on function public.flashcard_student_session_profile(uuid) to authenticated';
  end if;
end;
$$;

notify pgrst, 'reload schema';
commit;
