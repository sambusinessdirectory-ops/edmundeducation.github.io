-- Transactional acceptance test for the legacy object merge guard.
-- Run only after installing the guard migration.  Every test row and alert is rolled
-- back; identity sequences can retain harmless numeric gaps.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

do $verification$
declare
  v_student_id uuid := pg_catalog.gen_random_uuid();
  v_student_name text := '__legacy_object_guard_student__' || v_student_id::text;
  v_session_token uuid := pg_catalog.gen_random_uuid();
  v_admin_name text := '__legacy_object_guard_admin__' || v_student_id::text;
  v_admin_password text := 'test-only-never-committed';
  v_result boolean;
  v_receipt jsonb;
  v_state public.flashcard_student_state%rowtype;
  v_count bigint;
begin
  if not exists (
       select 1
       from pg_catalog.pg_trigger trigger_row
       where trigger_row.tgrelid = 'public.flashcard_student_state'::pg_catalog.regclass
         and trigger_row.tgname = 'flashcard_state_zy_legacy_object_merge'
         and trigger_row.tgenabled <> 'D'
     )
     or pg_catalog.has_function_privilege(
       'anon',
       'flashcard_integrity.protect_legacy_object_members()',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'authenticated',
       'flashcard_integrity.protect_legacy_object_members()',
       'EXECUTE'
     )
     or pg_catalog.has_function_privilege(
       'service_role',
       'flashcard_integrity.protect_legacy_object_members()',
       'EXECUTE'
     ) then
    raise exception 'Guard trigger is absent/disabled or its private trigger function is directly executable.';
  end if;

  insert into public.flashcard_students (id, name, password_hash, access)
  values (v_student_id, v_student_name, 'test-only-never-used-for-login', '{}'::jsonb);
  insert into public.flashcard_student_sessions (token, student_id, expires_at)
  values (v_session_token, v_student_id, now() + interval '1 hour');
  insert into public.flashcard_admins (name, password_hash)
  values (
    v_admin_name,
    extensions.crypt(v_admin_password, extensions.gen_salt('bf'))
  );

  insert into public.flashcard_student_state (student_id, key, value)
  values (
    v_student_id,
    'edmundFlashcardProgress',
    '{"a":1,"b":2,"c":3}'::jsonb
  );

  -- Student v1: supplied values update, omitted top-level members survive, and the
  -- ordinary version/checksum/revision machinery sees the merged result.
  v_result := public.flashcard_student_upsert_state(
    v_session_token,
    'edmundFlashcardProgress',
    '{"a":9}'::jsonb
  );
  select * into v_state
  from public.flashcard_student_state state
  where state.student_id = v_student_id
    and state.key = 'edmundFlashcardProgress';

  if not v_result
     or v_state.value <> '{"a":9,"b":2,"c":3}'::jsonb
     or v_state.version <> 2
     or v_state.value_checksum <> flashcard_integrity.jsonb_checksum(v_state.value)
     or not exists (
       select 1
       from flashcard_integrity.alerts alert
       join flashcard_integrity.alert_outbox outbox on outbox.alert_id = alert.alert_id
       where alert.student_id = v_student_id
         and alert.state_key = 'edmundFlashcardProgress'
         and alert.actor_kind = 'legacy_student'
         and alert.code = 'legacy_object_regression_prevented'
         and alert.action_taken = 'lossless_top_level_merge'
         and alert.incoming_metrics ->> 'missingTopLevelMembers' = '2'
     )
     or not exists (
       select 1
       from flashcard_integrity.state_revisions revision
       where revision.student_id = v_student_id
         and revision.state_key = 'edmundFlashcardProgress'
         and revision.version_before = 1
         and revision.version_after = 2
         and revision.before_value = '{"a":1,"b":2,"c":3}'::jsonb
         and revision.after_value = '{"a":9,"b":2,"c":3}'::jsonb
         and revision.actor_kind = 'legacy_student'
     ) then
    raise exception 'Student legacy subset write was not losslessly merged and audited: %', v_state;
  end if;

  -- Admin v1 uses the same guard and preserves all members omitted by the admin's
  -- stale state snapshot.
  v_result := public.flashcard_admin_upsert_student_state(
    v_admin_name,
    v_admin_password,
    v_student_name,
    'edmundFlashcardProgress',
    '{"b":7}'::jsonb
  );
  select * into v_state
  from public.flashcard_student_state state
  where state.student_id = v_student_id
    and state.key = 'edmundFlashcardProgress';

  if not v_result
     or v_state.value <> '{"a":9,"b":7,"c":3}'::jsonb
     or v_state.version <> 3
     or not exists (
       select 1
       from flashcard_integrity.alerts alert
       join flashcard_integrity.alert_outbox outbox on outbox.alert_id = alert.alert_id
       where alert.student_id = v_student_id
         and alert.state_key = 'edmundFlashcardProgress'
         and alert.actor_kind = 'legacy_admin'
         and alert.code = 'legacy_object_regression_prevented'
         and alert.action_taken = 'lossless_top_level_merge'
     )
     or not exists (
       select 1
       from flashcard_integrity.state_revisions revision
       where revision.student_id = v_student_id
         and revision.state_key = 'edmundFlashcardProgress'
         and revision.version_before = 2
         and revision.version_after = 3
         and revision.after_value = '{"a":9,"b":7,"c":3}'::jsonb
         and revision.actor_kind = 'legacy_admin'
     ) then
    raise exception 'Admin legacy subset write was not losslessly merged and audited: %', v_state;
  end if;

  -- Attempts never enter the object guard; their stronger identity/quality merge must
  -- keep both attempts and the richer version of attempt-b.
  v_result := public.flashcard_student_upsert_state(
    v_session_token,
    'edmundFlashcardAttempts',
    '[
      {"id":"attempt-a","startedAt":100,"answeredCount":2,"durationMs":2000},
      {"id":"attempt-b","startedAt":200,"answeredCount":1,"durationMs":1000}
    ]'::jsonb
  );
  v_result := v_result and public.flashcard_student_upsert_state(
    v_session_token,
    'edmundFlashcardAttempts',
    '[
      {"id":"attempt-b","startedAt":200,"answeredCount":4,"durationMs":4000,"completed":true,"completedAt":300}
    ]'::jsonb
  );
  select * into v_state
  from public.flashcard_student_state state
  where state.student_id = v_student_id
    and state.key = 'edmundFlashcardAttempts';
  select pg_catalog.count(*) into v_count
  from pg_catalog.jsonb_array_elements(v_state.value) entry(item)
  where entry.item ->> 'id' in ('attempt-a', 'attempt-b');

  if not v_result
     or v_count <> 2
     or not exists (
       select 1
       from pg_catalog.jsonb_array_elements(v_state.value) entry(item)
       where entry.item ->> 'id' = 'attempt-b'
         and entry.item ->> 'answeredCount' = '4'
         and entry.item ->> 'completed' = 'true'
     )
     or exists (
       select 1
       from flashcard_integrity.alerts alert
       where alert.student_id = v_student_id
         and alert.state_key = 'edmundFlashcardAttempts'
         and alert.code = 'legacy_object_regression_prevented'
     ) then
    raise exception 'Attempt-array strongest merge was changed by the object guard: %', v_state.value;
  end if;

  -- An explicit version-checked v2 replacement remains a replacement: the new guard
  -- is compatibility protection, not a change to v2 optimistic-concurrency semantics.
  select * into v_state
  from public.flashcard_student_state state
  where state.student_id = v_student_id
    and state.key = 'edmundFlashcardProgress';
  v_receipt := flashcard_integrity.write_state_v2(
    v_student_id,
    'acceptance_test',
    'verification-session',
    'edmundFlashcardProgress',
    '{"a":42}'::jsonb,
    pg_catalog.gen_random_uuid(),
    v_state.version
  );
  select * into v_state
  from public.flashcard_student_state state
  where state.student_id = v_student_id
    and state.key = 'edmundFlashcardProgress';
  if v_receipt ->> 'status' <> 'accepted'
     or v_state.value <> '{"a":42}'::jsonb then
    raise exception 'Version-checked v2 replacement semantics changed: receipt=%, state=%', v_receipt, v_state;
  end if;

  -- Preserve the current explicit-delete contract exactly: protected v2 state is
  -- rejected/preserved, while an enabled non-v2 shared state key can still be deleted.
  -- Store the volatile RPC result before checking the row.  Keeping both operations
  -- in one OR expression would allow SQL expression reordering to observe the row
  -- before the DELETE has executed and produce a false test failure.
  v_result := public.flashcard_student_delete_state(
    v_session_token,
    'edmundFlashcardProgress'
  );
  if v_result
     or not exists (
       select 1 from public.flashcard_student_state state
       where state.student_id = v_student_id
         and state.key = 'edmundFlashcardProgress'
     ) then
    raise exception 'Protected explicit-delete behavior changed.';
  end if;

  insert into public.flashcard_student_state (student_id, key, value)
  values (
    v_student_id,
    'edmundStudentDisplayPreferences',
    '{"theme":"dark"}'::jsonb
  );
  v_result := public.flashcard_student_delete_state(
    v_session_token,
    'edmundStudentDisplayPreferences'
  );
  if not v_result
     or exists (
       select 1 from public.flashcard_student_state state
       where state.student_id = v_student_id
         and state.key = 'edmundStudentDisplayPreferences'
     ) then
    raise exception 'Allowed non-v2 explicit-delete behavior changed.';
  end if;

  raise notice 'Legacy Flashcard object guard verification PASSED; rolling back test rows.';
end;
$verification$;

rollback;
