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

  -- The champagne status is a fourth, mutually exclusive state and uses the
  -- same atomic multi-select endpoint as the existing status tags.
  v_result := public._schedule_batch_set_entry_status(
    v_student_id,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'entry_id', v_student_b,
        'expected_updated_at', v_student_b_updated
      )
    ),
    'more_than_half_completed',
    'student',
    null
  );
  if (v_result ->> 'changedCount')::integer <> 1 then
    raise exception 'More-than-half status changed an unexpected number of rows: %', v_result;
  end if;
  if not exists (
    select 1
    from public.schedule_entries entry
    where entry.id = v_student_b
      and entry.is_more_than_half_completed
      and not entry.is_completed
      and not entry.is_in_progress
      and not entry.is_previous_incomplete
  ) then
    raise exception 'More-than-half status was not stored as an exclusive state';
  end if;
  select entry.updated_at into v_student_b_updated
  from public.schedule_entries entry where entry.id = v_student_b;

  begin
    perform public._schedule_batch_set_entry_status(
      v_student_id,
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'entry_id', v_student_b,
          'expected_updated_at', v_student_b_updated - interval '1 second'
        )
      ),
      'none',
      'student',
      null
    );
    raise exception 'Expected a stale more-than-half status failure';
  exception when sqlstate '40001' then
    null;
  end;
  if not exists (
    select 1 from public.schedule_entries entry
    where entry.id = v_student_b and entry.is_more_than_half_completed
  ) then
    raise exception 'Stale status update was not rolled back atomically';
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

  -- Students cannot swap with, or directly move, teacher-created work.
  begin
    perform public._schedule_move_entry(
      v_student_id, v_student_b, v_student_b_updated,
      v_source_date, 99, v_source_date, 100,
      v_source_version, v_source_version, 'student'
    );
    raise exception 'Expected a teacher-target swap failure';
  exception when sqlstate '42501' then
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

do $schedule_enhancements_test$
declare
  v_marker text := 'codex-schedule-enhancements-' || gen_random_uuid()::text;
  v_student_id uuid;
  v_entry_id uuid;
  v_entry_updated timestamptz;
  v_group_id uuid;
  v_countdown_id uuid;
  v_countdown_updated timestamptz;
  v_swap_a uuid;
  v_swap_b uuid;
  v_swap_a_updated timestamptz;
  v_swap_b_updated timestamptz;
  v_capacity_version bigint;
  v_result jsonb;
  v_payload jsonb;
begin
  insert into public.flashcard_students (name, password_hash, access)
  values (v_marker, 'rollback-test-only', '{}'::jsonb)
  returning id into v_student_id;

  insert into public.schedule_day_capacity (student_id, schedule_date, slot_count, version)
  select v_student_id, day.schedule_date::date, 10, 0
  from pg_catalog.generate_series(date '2049-01-04'::timestamp, date '2049-01-10'::timestamp, interval '1 day') day(schedule_date);

  v_result := public._schedule_upsert_entry(
    v_student_id, date '2049-01-04', 1, 'Three-day project', 123,
    null, 'student', null
  );
  v_entry_id := (v_result ->> 'id')::uuid;
  select entry.updated_at into v_entry_updated from public.schedule_entries entry where entry.id = v_entry_id;

  v_result := public._schedule_set_entry_in_progress(v_student_id, v_entry_id, v_entry_updated, true);
  if v_result ->> 'isInProgress' <> 'true' or v_result ->> 'isCompleted' <> 'false' then
    raise exception 'Progress state did not persist: %', v_result;
  end if;
  select entry.updated_at into v_entry_updated from public.schedule_entries entry where entry.id = v_entry_id;

  -- Desktop may span several days in one drop; the helper fills every date in between.
  v_result := public._schedule_extend_entry_span(
    v_student_id, v_entry_id, v_entry_updated, date '2049-01-06', 'student'
  );
  v_group_id := (v_result ->> 'spanGroupId')::uuid;
  if (select count(*) from public.schedule_entries entry where entry.span_group_id = v_group_id) <> 3 then
    raise exception 'Multi-day project did not fill all three contiguous dates';
  end if;
  if (select count(distinct entry.slot_index) from public.schedule_entries entry
      where entry.span_group_id = v_group_id) <> 1
  then
    raise exception 'Multi-day project members did not reserve one aligned database lane';
  end if;
  if exists (
    select 1 from public.schedule_entries entry
    where entry.span_group_id = v_group_id
      and (entry.estimated_minutes <> 123 or not entry.is_in_progress)
  ) then
    raise exception 'Multi-day project did not preserve estimate/progress state';
  end if;

  -- The legacy no-estimate upsert remains compatible and must update every
  -- member of an existing multi-day project, not only the clicked day.
  select entry.updated_at into v_entry_updated
  from public.schedule_entries entry where entry.id = v_entry_id;
  v_result := public._schedule_upsert_entry(
    v_student_id, date '2049-01-04',
    (select entry.slot_index from public.schedule_entries entry where entry.id = v_entry_id),
    'Legacy group-aware edit', v_entry_updated, 'student', null
  );
  if (select count(*) from public.schedule_entries entry
      where entry.span_group_id = v_group_id and entry.message = 'Legacy group-aware edit') <> 3
  then
    raise exception 'Legacy upsert did not propagate across the span group';
  end if;

  -- Two ordinary entries swap atomically when dropped onto one another.
  insert into public.schedule_entries (student_id, schedule_date, slot_index, message, source)
  values (v_student_id, date '2049-01-07', 1, 'Swap A', 'student')
  returning id, updated_at into v_swap_a, v_swap_a_updated;
  insert into public.schedule_entries (student_id, schedule_date, slot_index, message, source)
  values (v_student_id, date '2049-01-07', 2, 'Swap B', 'student')
  returning id, updated_at into v_swap_b, v_swap_b_updated;
  select capacity.version into v_capacity_version from public.schedule_day_capacity capacity
  where capacity.student_id = v_student_id and capacity.schedule_date = date '2049-01-07';
  begin
    perform public._schedule_move_entry_checked(
      v_student_id, v_swap_a, v_swap_a_updated,
      date '2049-01-07', 1, date '2049-01-07', 2,
      v_capacity_version, v_capacity_version,
      v_swap_b_updated - interval '1 second', 'student'
    );
    raise exception 'Expected stale swap-target rejection';
  exception when sqlstate '40001' then null;
  end;

  v_result := public._schedule_move_entry_checked(
    v_student_id, v_swap_a, v_swap_a_updated,
    date '2049-01-07', 1, date '2049-01-07', 2,
    v_capacity_version, v_capacity_version, v_swap_b_updated, 'student'
  );
  if v_result ->> 'swapped' <> 'true'
    or (select entry.slot_index from public.schedule_entries entry where entry.id = v_swap_a) <> 2
    or (select entry.slot_index from public.schedule_entries entry where entry.id = v_swap_b) <> 1
  then raise exception 'Exact-slot swap returned an unexpected result: %', v_result; end if;

  if public._schedule_change_countdown_capacity_checked(v_student_id, 6, 5) <> 11 then
    raise exception 'Countdown capacity did not increase by five';
  end if;
  begin
    perform public._schedule_change_countdown_capacity_checked(v_student_id, 6, 5);
    raise exception 'Expected stale countdown-capacity rejection';
  exception when sqlstate '40001' then null;
  end;
  v_result := public._schedule_upsert_countdown(
    v_student_id, 11, 'Public examination', date '2049-01-04', date '2049-12-31',
    1.5, 0.5, 0.5, 0.5, null
  );
  v_countdown_id := (v_result ->> 'id')::uuid;
  v_countdown_updated := (v_result ->> 'updatedAt')::timestamptz;

  begin
    perform public._schedule_change_countdown_capacity(v_student_id, -5);
    raise exception 'Expected a countdown shrink failure while Clock 11 contains data';
  exception when others then
    if sqlerrm = 'Expected a countdown shrink failure while Clock 11 contains data' then raise; end if;
  end;

  begin
    perform public._schedule_upsert_countdown(
      v_student_id, 1, 'Invalid dates', date '2049-02-01', date '2049-01-01',
      0, 0, 0, 0, null
    );
    raise exception 'Expected invalid countdown-date rejection';
  exception when sqlstate '22023' then null;
  end;

  v_payload := public._schedule_week_payload(v_student_id, date '2049-01-04');
  if (v_payload ->> 'countdownCapacity')::integer <> 11
    or pg_catalog.jsonb_array_length(v_payload -> 'countdowns') <> 1
    or not exists (
      select 1 from pg_catalog.jsonb_array_elements(v_payload -> 'entries') item
      where item ->> 'estimatedMinutes' = '123'
        and item ->> 'isInProgress' = 'true'
        and item ->> 'spanGroupId' = v_group_id::text
    )
  then raise exception 'Enhanced week payload omitted persisted data: %', v_payload; end if;

  if not public._schedule_delete_countdown(v_student_id, v_countdown_id, v_countdown_updated) then
    raise exception 'Countdown delete helper returned false';
  end if;
  if public._schedule_change_countdown_capacity_checked(v_student_id, 11, -5) <> 6 then
    raise exception 'Countdown capacity did not shrink after Clock 11 was cleared';
  end if;

  raise notice 'Schedule enhancement database smoke test passed';
end;
$schedule_enhancements_test$;

do $schedule_mass_edit_test$
declare
  v_marker text := 'codex-schedule-mass-edit-' || gen_random_uuid()::text;
  v_student_id uuid;
  v_week_start date := date_trunc('week', date '2049-03-01')::date;
  v_first_updated timestamptz;
  v_second_updated timestamptz;
  v_third_updated timestamptz;
  v_teacher_updated timestamptz;
  v_admin_actor uuid := gen_random_uuid();
  v_span_group uuid := gen_random_uuid();
  v_span_updated timestamptz;
  v_result jsonb;
begin
  insert into public.flashcard_students (name, password_hash, access)
  values (v_marker, 'rollback-test-only', '{}'::jsonb)
  returning id into v_student_id;

  insert into public.schedule_entries (
    student_id, schedule_date, slot_index, message, source, estimated_minutes
  )
  values (
    v_student_id, v_week_start, 1, 'Mass Edit original one', 'student', 20
  )
  returning updated_at into v_first_updated;

  insert into public.schedule_entries (
    student_id, schedule_date, slot_index, message, source, estimated_minutes
  )
  values (
    v_student_id, v_week_start, 2, 'Mass Edit original two', 'student', 30
  )
  returning updated_at into v_second_updated;

  v_result := public._schedule_apply_entry_batch(
    v_student_id,
    v_week_start,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'action', 'upsert',
        'scheduleDate', pg_catalog.to_char(v_week_start, 'YYYY-MM-DD'),
        'slotIndex', 1,
        'message', 'Mass Edit updated one',
        'estimatedMinutes', 45,
        'expectedUpdatedAt', v_first_updated
      ),
      pg_catalog.jsonb_build_object(
        'action', 'delete',
        'scheduleDate', pg_catalog.to_char(v_week_start, 'YYYY-MM-DD'),
        'slotIndex', 2,
        'message', null,
        'estimatedMinutes', null,
        'expectedUpdatedAt', v_second_updated
      ),
      pg_catalog.jsonb_build_object(
        'action', 'upsert',
        'scheduleDate', pg_catalog.to_char(v_week_start, 'YYYY-MM-DD'),
        'slotIndex', 3,
        'message', 'Mass Edit created three',
        'estimatedMinutes', 60,
        'expectedUpdatedAt', null
      )
    ),
    'student',
    null
  );

  if v_result <> pg_catalog.jsonb_build_object(
    'appliedCount', 3,
    'createdCount', 1,
    'updatedCount', 1,
    'deletedCount', 1
  ) then
    raise exception 'Unexpected Mass Edit result: %', v_result;
  end if;

  if not exists (
    select 1
    from public.schedule_entries entry
    where entry.student_id = v_student_id
      and entry.schedule_date = v_week_start
      and entry.slot_index = 1
      and entry.message = 'Mass Edit updated one'
      and entry.estimated_minutes = 45
  ) or exists (
    select 1
    from public.schedule_entries entry
    where entry.student_id = v_student_id
      and entry.schedule_date = v_week_start
      and entry.slot_index = 2
  ) or not exists (
    select 1
    from public.schedule_entries entry
    where entry.student_id = v_student_id
      and entry.schedule_date = v_week_start
      and entry.slot_index = 3
      and entry.message = 'Mass Edit created three'
      and entry.estimated_minutes = 60
  ) then
    raise exception 'Mass Edit did not apply its mixed operations';
  end if;

  select entry.updated_at
  into v_first_updated
  from public.schedule_entries entry
  where entry.student_id = v_student_id
    and entry.schedule_date = v_week_start
    and entry.slot_index = 1;

  select entry.updated_at
  into v_third_updated
  from public.schedule_entries entry
  where entry.student_id = v_student_id
    and entry.schedule_date = v_week_start
    and entry.slot_index = 3;

  -- The current 10-key payload must preserve the selected mutually-exclusive
  -- status, while the mixed operation above proves legacy six-key support.
  perform public._schedule_apply_entry_batch(
    v_student_id,
    v_week_start,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'action', 'upsert',
        'scheduleDate', pg_catalog.to_char(v_week_start, 'YYYY-MM-DD'),
        'slotIndex', 3,
        'message', 'Mass Edit created three',
        'estimatedMinutes', 60,
        'expectedUpdatedAt', v_third_updated,
        'source', 'student',
        'isCompleted', false,
        'isInProgress', false,
        'isPreviousIncomplete', true
      )
    ),
    'student',
    null
  );

  if not exists (
    select 1 from public.schedule_entries entry
    where entry.student_id = v_student_id
      and entry.schedule_date = v_week_start
      and entry.slot_index = 3
      and entry.is_previous_incomplete
      and not entry.is_completed
      and not entry.is_in_progress
  ) then
    raise exception 'Current Mass Edit payload did not preserve previous-homework status';
  end if;

  select entry.updated_at
  into v_third_updated
  from public.schedule_entries entry
  where entry.student_id = v_student_id
    and entry.schedule_date = v_week_start
    and entry.slot_index = 3;

  begin
    perform public._schedule_apply_entry_batch(
      v_student_id,
      v_week_start,
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'action', 'upsert',
          'scheduleDate', pg_catalog.to_char(v_week_start, 'YYYY-MM-DD'),
          'slotIndex', 3,
          'message', 'Invalid overlapping statuses',
          'estimatedMinutes', 60,
          'expectedUpdatedAt', v_third_updated,
          'source', 'student',
          'isCompleted', true,
          'isInProgress', false,
          'isPreviousIncomplete', true
        )
      ),
      'student',
      null
    );
    raise exception 'Expected mutually-exclusive Mass Edit status rejection';
  exception when sqlstate '22023' then
    null;
  end;

  begin
    perform public._schedule_apply_entry_batch(
      v_student_id,
      v_week_start,
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'action', 'upsert',
          'scheduleDate', pg_catalog.to_char(v_week_start, 'YYYY-MM-DD'),
          'slotIndex', 1,
          'message', 'This valid update must roll back',
          'estimatedMinutes', 90,
          'expectedUpdatedAt', v_first_updated
        ),
        pg_catalog.jsonb_build_object(
          'action', 'upsert',
          'scheduleDate', pg_catalog.to_char(v_week_start, 'YYYY-MM-DD'),
          'slotIndex', 2,
          'message', 'This valid create must roll back',
          'estimatedMinutes', 90,
          'expectedUpdatedAt', null
        ),
        pg_catalog.jsonb_build_object(
          'action', 'delete',
          'scheduleDate', pg_catalog.to_char(v_week_start, 'YYYY-MM-DD'),
          'slotIndex', 3,
          'message', null,
          'estimatedMinutes', null,
          'expectedUpdatedAt', v_third_updated - interval '1 second'
        )
      ),
      'student',
      null
    );
    raise exception 'Expected stale Mass Edit rejection';
  exception when sqlstate '40001' then
    null;
  end;

  if not exists (
    select 1
    from public.schedule_entries entry
    where entry.student_id = v_student_id
      and entry.schedule_date = v_week_start
      and entry.slot_index = 1
      and entry.message = 'Mass Edit updated one'
      and entry.estimated_minutes = 45
  ) or exists (
    select 1
    from public.schedule_entries entry
    where entry.student_id = v_student_id
      and entry.schedule_date = v_week_start
      and entry.slot_index = 2
  ) or not exists (
    select 1
    from public.schedule_entries entry
    where entry.student_id = v_student_id
      and entry.schedule_date = v_week_start
      and entry.slot_index = 3
      and entry.message = 'Mass Edit created three'
  ) then
    raise exception 'Stale Mass Edit was not atomic';
  end if;

  select entry.updated_at
  into v_first_updated
  from public.schedule_entries entry
  where entry.student_id = v_student_id
    and entry.schedule_date = v_week_start
    and entry.slot_index = 1;

  -- An administrator may correct a student's entry without turning it into a
  -- protected teacher assignment.
  perform public._schedule_apply_entry_batch(
    v_student_id,
    v_week_start,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'action', 'upsert',
        'scheduleDate', pg_catalog.to_char(v_week_start, 'YYYY-MM-DD'),
        'slotIndex', 1,
        'message', 'Admin corrected student-owned entry',
        'estimatedMinutes', 50,
        'expectedUpdatedAt', v_first_updated
      )
    ),
    'admin',
    v_admin_actor
  );

  if not exists (
    select 1
    from public.schedule_entries entry
    where entry.student_id = v_student_id
      and entry.schedule_date = v_week_start
      and entry.slot_index = 1
      and entry.message = 'Admin corrected student-owned entry'
      and entry.source = 'student'
      and entry.created_by_admin is null
  ) then
    raise exception 'Mass Edit transferred student-entry ownership to the administrator';
  end if;

  select entry.updated_at
  into v_first_updated
  from public.schedule_entries entry
  where entry.student_id = v_student_id
    and entry.schedule_date = v_week_start
    and entry.slot_index = 1;

  insert into public.schedule_entries (
    student_id, schedule_date, slot_index, message, source, estimated_minutes
  ) values (
    v_student_id, v_week_start, 4, 'Protected teacher assignment', 'admin', 25
  ) returning updated_at into v_teacher_updated;

  -- A protected teacher edit must reject the entire student batch, including
  -- a valid operation that was applied earlier in the function loop.
  begin
    perform public._schedule_apply_entry_batch(
      v_student_id,
      v_week_start,
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'action', 'upsert',
          'scheduleDate', pg_catalog.to_char(v_week_start, 'YYYY-MM-DD'),
          'slotIndex', 1,
          'message', 'This ownership batch update must roll back',
          'estimatedMinutes', 55,
          'expectedUpdatedAt', v_first_updated
        ),
        pg_catalog.jsonb_build_object(
          'action', 'upsert',
          'scheduleDate', pg_catalog.to_char(v_week_start, 'YYYY-MM-DD'),
          'slotIndex', 4,
          'message', 'Student must not edit this teacher assignment',
          'estimatedMinutes', 30,
          'expectedUpdatedAt', v_teacher_updated
        )
      ),
      'student',
      null
    );
    raise exception 'Expected protected Mass Edit rejection';
  exception when sqlstate '42501' then
    null;
  end;

  if not exists (
    select 1
    from public.schedule_entries entry
    where entry.student_id = v_student_id
      and entry.schedule_date = v_week_start
      and entry.slot_index = 1
      and entry.message = 'Admin corrected student-owned entry'
  ) or not exists (
    select 1
    from public.schedule_entries entry
    where entry.student_id = v_student_id
      and entry.schedule_date = v_week_start
      and entry.slot_index = 4
      and entry.message = 'Protected teacher assignment'
      and entry.source = 'admin'
  ) then
    raise exception 'Protected Mass Edit rejection was not atomic';
  end if;

  begin
    perform public._schedule_apply_entry_batch(
      v_student_id,
      v_week_start,
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'action', 'delete',
          'scheduleDate', pg_catalog.to_char(v_week_start, 'YYYY-MM-DD'),
          'slotIndex', 4,
          'message', null,
          'estimatedMinutes', null,
          'expectedUpdatedAt', v_teacher_updated
        )
      ),
      'student',
      null
    );
    raise exception 'Expected protected Mass Edit delete rejection';
  exception when sqlstate '42501' then
    null;
  end;

  if not exists (
    select 1
    from public.schedule_entries entry
    where entry.student_id = v_student_id
      and entry.schedule_date = v_week_start
      and entry.slot_index = 4
      and entry.message = 'Protected teacher assignment'
  ) then
    raise exception 'Protected teacher assignment was deleted by student Mass Edit';
  end if;

  insert into public.schedule_entries (
    student_id, schedule_date, slot_index, message, source, span_group_id, updated_at
  ) values
    (
      v_student_id, v_week_start, 5, 'Mass Edit span original',
      'student', v_span_group, now()
    ),
    (
      v_student_id, v_week_start + 1, 5, 'Mass Edit span original',
      'student', v_span_group, now() + interval '1 second'
    );

  select entry.updated_at
  into v_span_updated
  from public.schedule_entries entry
  where entry.student_id = v_student_id
    and entry.schedule_date = v_week_start
    and entry.slot_index = 5;

  -- The second member's later version simulates a change in another session
  -- without changing the clicked member. The whole edit must be rejected.
  begin
    perform public._schedule_apply_entry_batch(
      v_student_id,
      v_week_start,
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'action', 'upsert',
          'scheduleDate', pg_catalog.to_char(v_week_start, 'YYYY-MM-DD'),
          'slotIndex', 5,
          'message', 'Stale span edit must not apply',
          'estimatedMinutes', 40,
          'expectedUpdatedAt', v_span_updated
        )
      ),
      'student',
      null
    );
    raise exception 'Expected stale Mass Edit span rejection';
  exception when sqlstate '40001' then
    null;
  end;

  if exists (
    select 1
    from public.schedule_entries entry
    where entry.student_id = v_student_id
      and entry.span_group_id = v_span_group
      and entry.message <> 'Mass Edit span original'
  ) then
    raise exception 'Stale Mass Edit span overwrote another member change';
  end if;

  raise notice 'Schedule Mass Edit database smoke test passed';
end;
$schedule_mass_edit_test$;

rollback;
