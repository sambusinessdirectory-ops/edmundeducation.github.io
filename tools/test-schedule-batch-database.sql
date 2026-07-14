-- Transactional smoke test for the schedule batch and move helpers.
-- This script always rolls back, so it leaves production data unchanged.

begin;

do $schedule_batch_test$
declare
  v_student_id uuid;
  v_source_date date;
  v_target_date date;
  v_source_version bigint;
  v_target_version bigint;
  v_marker text := 'codex-schedule-batch-test-' || gen_random_uuid()::text;
  v_student_a uuid;
  v_student_b uuid;
  v_teacher uuid;
  v_student_a_updated timestamptz;
  v_student_b_updated timestamptz;
  v_teacher_updated timestamptz;
  v_result jsonb;
begin
  select student.id
  into v_student_id
  from public.flashcard_students student
  where student.deleted_at is null
  order by student.created_at, student.id
  limit 1;

  if v_student_id is null then
    raise exception 'Schedule batch smoke test needs one active student';
  end if;

  select candidate.schedule_date
  into v_source_date
  from pg_catalog.generate_series(
    date '2049-01-01'::timestamp,
    date '2050-12-29'::timestamp,
    interval '1 day'
  ) candidate(schedule_date)
  where not exists (
    select 1
    from public.schedule_entries entry
    where entry.student_id = v_student_id
      and entry.schedule_date in (
        candidate.schedule_date::date,
        candidate.schedule_date::date + 1
      )
      and entry.slot_index in (98, 99, 100)
  )
  order by candidate.schedule_date desc
  limit 1;

  if v_source_date is null then
    raise exception 'Could not find two empty future dates for the schedule smoke test';
  end if;
  v_target_date := v_source_date + 1;

  insert into public.schedule_day_capacity (student_id, schedule_date, slot_count, version)
  values (v_student_id, v_source_date, 100, 0)
  on conflict (student_id, schedule_date) do update
    set slot_count = 100,
        version = public.schedule_day_capacity.version + 1
  returning version into v_source_version;

  insert into public.schedule_day_capacity (student_id, schedule_date, slot_count, version)
  values (v_student_id, v_target_date, 100, 0)
  on conflict (student_id, schedule_date) do update
    set slot_count = 100,
        version = public.schedule_day_capacity.version + 1
  returning version into v_target_version;

  insert into public.schedule_entries (
    student_id, schedule_date, slot_index, message, source
  ) values (
    v_student_id, v_source_date, 98, v_marker || '-student-a', 'student'
  ) returning id, updated_at into v_student_a, v_student_a_updated;

  insert into public.schedule_entries (
    student_id, schedule_date, slot_index, message, source
  ) values (
    v_student_id, v_source_date, 99, v_marker || '-student-b', 'student'
  ) returning id, updated_at into v_student_b, v_student_b_updated;

  insert into public.schedule_entries (
    student_id, schedule_date, slot_index, message, source
  ) values (
    v_student_id, v_source_date, 100, v_marker || '-teacher', 'admin'
  ) returning id, updated_at into v_teacher, v_teacher_updated;

  -- Students may mark both their own and teacher-created assignments complete.
  v_result := public._schedule_batch_set_entries_completed(
    v_student_id,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('entry_id', v_student_a, 'expected_updated_at', v_student_a_updated),
      pg_catalog.jsonb_build_object('entry_id', v_teacher, 'expected_updated_at', v_teacher_updated)
    ),
    true,
    'student',
    null
  );
  if (v_result ->> 'changedCount')::integer <> 2 then
    raise exception 'Batch completion changed an unexpected number of rows: %', v_result;
  end if;

  select entry.updated_at into v_student_a_updated
  from public.schedule_entries entry where entry.id = v_student_a;
  select entry.updated_at into v_teacher_updated
  from public.schedule_entries entry where entry.id = v_teacher;

  -- One stale item must abort the entire batch without changing its valid peer.
  begin
    perform public._schedule_batch_set_entries_completed(
      v_student_id,
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('entry_id', v_student_a, 'expected_updated_at', v_student_a_updated),
        pg_catalog.jsonb_build_object(
          'entry_id', v_teacher,
          'expected_updated_at', v_teacher_updated - interval '1 second'
        )
      ),
      false,
      'student',
      null
    );
    raise exception 'Expected a stale batch-completion failure';
  exception when sqlstate '40001' then
    null;
  end;

  if exists (
    select 1 from public.schedule_entries entry
    where entry.id in (v_student_a, v_teacher) and not entry.is_completed
  ) then
    raise exception 'Stale batch completion was not atomic';
  end if;

  -- Occupied destinations and student attempts to move teacher work are rejected.
  begin
    perform public._schedule_move_entry(
      v_student_id, v_student_b, v_student_b_updated,
      v_source_date, 99, v_source_date, 100,
      v_source_version, v_source_version, 'student'
    );
    raise exception 'Expected an occupied-target move failure';
  exception when sqlstate '40001' then
    null;
  end;

  begin
    perform public._schedule_move_entry(
      v_student_id, v_teacher, v_teacher_updated,
      v_source_date, 100, v_target_date, 99,
      v_source_version, v_target_version, 'student'
    );
    raise exception 'Expected a teacher-assignment move failure';
  exception when sqlstate '42501' then
    null;
  end;

  v_result := public._schedule_move_entry(
    v_student_id, v_student_a, v_student_a_updated,
    v_source_date, 98, v_target_date, 98,
    v_source_version, v_target_version, 'student'
  );
  if v_result ->> 'scheduleDate' <> pg_catalog.to_char(v_target_date, 'YYYY-MM-DD')
    or (v_result ->> 'slotIndex')::integer <> 98
  then
    raise exception 'Move helper returned an unexpected destination: %', v_result;
  end if;

  select entry.updated_at into v_student_a_updated
  from public.schedule_entries entry where entry.id = v_student_a;

  -- Students cannot delete teacher work; authorized batches still remain atomic.
  begin
    perform public._schedule_batch_delete_entries(
      v_student_id,
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('entry_id', v_teacher, 'expected_updated_at', v_teacher_updated)
      ),
      'student'
    );
    raise exception 'Expected a teacher-assignment delete failure';
  exception when sqlstate '42501' then
    null;
  end;

  v_result := public._schedule_batch_delete_entries(
    v_student_id,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('entry_id', v_student_b, 'expected_updated_at', v_student_b_updated)
    ),
    'student'
  );
  if (v_result ->> 'deletedCount')::integer <> 1 then
    raise exception 'Student batch delete returned an unexpected result: %', v_result;
  end if;

  v_result := public._schedule_batch_delete_entries(
    v_student_id,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('entry_id', v_student_a, 'expected_updated_at', v_student_a_updated),
      pg_catalog.jsonb_build_object('entry_id', v_teacher, 'expected_updated_at', v_teacher_updated)
    ),
    'admin'
  );
  if (v_result ->> 'deletedCount')::integer <> 2 then
    raise exception 'Admin batch delete returned an unexpected result: %', v_result;
  end if;

  if exists (
    select 1 from public.schedule_entries entry
    where entry.message like v_marker || '%'
  ) then
    raise exception 'Smoke-test entries were not fully deleted';
  end if;

  raise notice 'Schedule batch database smoke test passed';
end;
$schedule_batch_test$;

do $schedule_preferences_test$
declare
  v_marker text := 'codex-schedule-preferences-' || gen_random_uuid()::text;
  v_student_a uuid;
  v_student_b uuid;
  v_student_token uuid := gen_random_uuid();
  v_admin_id uuid;
  v_admin_token uuid := gen_random_uuid();
  v_result jsonb;
  v_stored jsonb;
  v_payload jsonb;
begin
  insert into public.flashcard_students (name, password_hash, access)
  values (v_marker || '-student-a', 'rollback-test-only', '{}'::jsonb)
  returning id into v_student_a;

  insert into public.flashcard_students (name, password_hash, access)
  values (v_marker || '-student-b', 'rollback-test-only', '{}'::jsonb)
  returning id into v_student_b;

  insert into public.flashcard_student_sessions (token, student_id, expires_at)
  values (v_student_token, v_student_a, now() + interval '1 hour');

  insert into public.schedule_admin_accounts (name, password_hash)
  values (v_marker || '-admin', 'rollback-test-only')
  returning id into v_admin_id;

  insert into public.schedule_admin_sessions (token_hash, admin_id, expires_at)
  values (
    extensions.digest(v_admin_token::text, 'sha256'),
    v_admin_id,
    now() + interval '1 hour'
  );

  -- Students with no state row receive stable false/false defaults.
  v_result := public._schedule_display_preferences(v_student_a);
  if v_result <> '{"hideUnused": false, "hideMascots": false}'::jsonb then
    raise exception 'Unexpected default display preferences: %', v_result;
  end if;

  insert into public.flashcard_student_state (student_id, key, value)
  values (
    v_student_a,
    'edmundStudentDisplayPreferences',
    pg_catalog.jsonb_build_object(
      'flashcardHideLockedSections', true,
      'nestedFlashcardState', pg_catalog.jsonb_build_object('level', 7),
      'scheduleHideUnused', false
    )
  );

  -- Each one-field patch preserves the other preference and unrelated state.
  v_result := public.schedule_student_set_display_preferences(
    v_student_token,
    pg_catalog.jsonb_build_object('hideUnused', true)
  );
  if v_result <> '{"hideUnused": true, "hideMascots": false}'::jsonb then
    raise exception 'Student hide-unused patch returned unexpected preferences: %', v_result;
  end if;

  v_result := public._schedule_set_display_preferences(
    v_student_a,
    pg_catalog.jsonb_build_object('hideMascots', true)
  );
  if v_result <> '{"hideUnused": true, "hideMascots": true}'::jsonb then
    raise exception 'Student hide-mascots patch did not preserve hide-unused: %', v_result;
  end if;

  select student_state.value
  into v_stored
  from public.flashcard_student_state student_state
  where student_state.student_id = v_student_a
    and student_state.key = 'edmundStudentDisplayPreferences';

  if v_stored -> 'flashcardHideLockedSections' <> 'true'::jsonb
    or v_stored -> 'nestedFlashcardState' <> '{"level": 7}'::jsonb
    or v_stored -> 'scheduleHideUnused' <> 'true'::jsonb
    or v_stored -> 'scheduleHideMascots' <> 'true'::jsonb
  then
    raise exception 'Schedule patches damaged unrelated flashcard state: %', v_stored;
  end if;

  -- Student B remains isolated from student A's settings.
  v_result := public._schedule_display_preferences(v_student_b);
  if v_result <> '{"hideUnused": false, "hideMascots": false}'::jsonb then
    raise exception 'Display preferences leaked between students: %', v_result;
  end if;

  insert into public.flashcard_student_state (student_id, key, value)
  values (
    v_student_b,
    'edmundStudentDisplayPreferences',
    pg_catalog.jsonb_build_object('flashcardHideLockedSections', false)
  );

  -- The authenticated admin wrapper targets only the selected student.
  v_result := public.schedule_admin_set_display_preferences(
    v_admin_token,
    v_student_b,
    pg_catalog.jsonb_build_object('hideMascots', true)
  );
  if v_result <> '{"hideUnused": false, "hideMascots": true}'::jsonb then
    raise exception 'Admin preference patch returned an unexpected result: %', v_result;
  end if;

  select student_state.value
  into v_stored
  from public.flashcard_student_state student_state
  where student_state.student_id = v_student_b
    and student_state.key = 'edmundStudentDisplayPreferences';
  if v_stored -> 'flashcardHideLockedSections' <> 'false'::jsonb
    or v_stored -> 'scheduleHideMascots' <> 'true'::jsonb
  then
    raise exception 'Admin preference patch damaged the target state: %', v_stored;
  end if;

  -- Schedule preference isolation: an admin target patch cannot alter student A.
  if public._schedule_display_preferences(v_student_a)
    <> '{"hideUnused": true, "hideMascots": true}'::jsonb
  then
    raise exception 'Admin target patch changed another student';
  end if;

  v_payload := public._schedule_week_payload(v_student_b, date '2049-01-04');
  if v_payload -> 'displayPreferences'
    <> '{"hideUnused": false, "hideMascots": true}'::jsonb
  then
    raise exception 'Week payload omitted persisted display preferences: %', v_payload;
  end if;

  -- Unknown keys and non-boolean values are rejected before any merge.
  begin
    perform public.schedule_student_set_display_preferences(
      v_student_token,
      pg_catalog.jsonb_build_object('hideUnused', 'yes')
    );
    raise exception 'Expected a non-boolean preference patch failure';
  exception when sqlstate '22023' then
    null;
  end;

  begin
    perform public.schedule_admin_set_display_preferences(
      v_admin_token,
      v_student_b,
      pg_catalog.jsonb_build_object('unrelatedSetting', true)
    );
    raise exception 'Expected an unsupported preference property failure';
  exception when sqlstate '22023' then
    null;
  end;

  if public._schedule_display_preferences(v_student_a)
      <> '{"hideUnused": true, "hideMascots": true}'::jsonb
    or public._schedule_display_preferences(v_student_b)
      <> '{"hideUnused": false, "hideMascots": true}'::jsonb
  then
    raise exception 'Invalid preference patches changed persisted state';
  end if;

  raise notice 'Schedule display-preference database smoke test passed';
end;
$schedule_preferences_test$;

rollback;
