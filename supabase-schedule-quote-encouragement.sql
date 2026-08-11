-- Schedule Quote of the Day preferences and private weekly encouragement notes.
-- Apply after supabase-schedule-system.sql.

begin;

do $$
begin
  if pg_catalog.to_regclass('public.flashcard_students') is null
    or pg_catalog.to_regclass('public.flashcard_student_state') is null
  then
    raise exception 'Missing Flashcard student account dependencies';
  end if;
  if pg_catalog.to_regprocedure('public.flashcard_session_student_id(uuid)') is null
    or pg_catalog.to_regprocedure('public._schedule_admin_id(uuid)') is null
    or pg_catalog.to_regprocedure('public._schedule_week_start_valid(date)') is null
    or pg_catalog.to_regprocedure('public._schedule_lock_student_mutations(uuid)') is null
    or pg_catalog.to_regprocedure('public.schedule_touch_updated_at()') is null
  then
    raise exception 'Missing Schedule System function dependencies';
  end if;
end;
$$;

create table if not exists public.schedule_weekly_encouragements (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  week_start date not null,
  message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, week_start),
  check (week_start between date '2025-12-29' and date '2050-12-31'),
  check (extract(isodow from week_start) = 1),
  check (char_length(btrim(message)) between 1 and 600)
);

alter table public.schedule_weekly_encouragements enable row level security;
revoke all on table public.schedule_weekly_encouragements from public, anon, authenticated;

drop trigger if exists schedule_weekly_encouragements_touch_updated_at
  on public.schedule_weekly_encouragements;
create trigger schedule_weekly_encouragements_touch_updated_at
before update on public.schedule_weekly_encouragements
for each row execute function public.schedule_touch_updated_at();

-- These properties live in the existing per-student display-preference JSON.
-- Missing properties default to visible, which is the required first-release state.
create or replace function public._schedule_display_preferences(p_student_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'hideUnused', coalesce(
      case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleHideUnused') = 'boolean'
        then (student_state.value ->> 'scheduleHideUnused')::boolean else false end,
      false
    ),
    'hideMascots', coalesce(
      case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleHideMascots') = 'boolean'
        then (student_state.value ->> 'scheduleHideMascots')::boolean else false end,
      false
    ),
    'hideDailyQuote', coalesce(
      case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleHideDailyQuote') = 'boolean'
        then (student_state.value ->> 'scheduleHideDailyQuote')::boolean else false end,
      false
    ),
    'hideEncouragement', coalesce(
      case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleHideEncouragement') = 'boolean'
        then (student_state.value ->> 'scheduleHideEncouragement')::boolean else false end,
      false
    )
  )
  from (select 1) seed
  left join public.flashcard_student_state student_state
    on student_state.student_id = p_student_id
   and student_state.key = 'edmundStudentDisplayPreferences';
$$;

create or replace function public._schedule_set_display_preferences(
  p_student_id uuid,
  p_patch jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_storage_patch jsonb := '{}'::jsonb;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if not exists (
    select 1 from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;

  if p_patch is null
    or pg_catalog.jsonb_typeof(p_patch) <> 'object'
    or p_patch = '{}'::jsonb
  then
    raise exception 'Display-preference patch must be a non-empty JSON object'
      using errcode = '22023';
  end if;

  if exists (
    select 1 from pg_catalog.jsonb_object_keys(p_patch) patch_key(key)
    where patch_key.key not in (
      'hideUnused',
      'hideMascots',
      'hideDailyQuote',
      'hideEncouragement'
    )
  ) then
    raise exception 'Display-preference patch contains an unsupported property'
      using errcode = '22023';
  end if;

  if exists (
    select 1 from pg_catalog.jsonb_each(p_patch) patch_entry(key, value)
    where pg_catalog.jsonb_typeof(patch_entry.value) <> 'boolean'
  ) then
    raise exception 'Display-preference values must be boolean'
      using errcode = '22023';
  end if;

  if p_patch ? 'hideUnused' then
    v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object(
      'scheduleHideUnused', p_patch -> 'hideUnused'
    );
  end if;
  if p_patch ? 'hideMascots' then
    v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object(
      'scheduleHideMascots', p_patch -> 'hideMascots'
    );
  end if;
  if p_patch ? 'hideDailyQuote' then
    v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object(
      'scheduleHideDailyQuote', p_patch -> 'hideDailyQuote'
    );
  end if;
  if p_patch ? 'hideEncouragement' then
    v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object(
      'scheduleHideEncouragement', p_patch -> 'hideEncouragement'
    );
  end if;

  insert into public.flashcard_student_state as state (student_id, key, value)
  values (p_student_id, 'edmundStudentDisplayPreferences', v_storage_patch)
  on conflict (student_id, key) do update
  set value = case
    when pg_catalog.jsonb_typeof(state.value) = 'object'
      then state.value || excluded.value
    else excluded.value
  end;

  return public._schedule_display_preferences(p_student_id);
end;
$$;

create or replace function public._schedule_encouragement_payload(
  p_student_id uuid,
  p_week_start date
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with current_note as (
    select note.message, note.updated_at
    from public.schedule_weekly_encouragements note
    where note.student_id = p_student_id
      and note.week_start = p_week_start
  ), previous_note as (
    select note.message
    from public.schedule_weekly_encouragements note
    where note.student_id = p_student_id
      and note.week_start = p_week_start - 7
  )
  select pg_catalog.jsonb_build_object(
    'message', coalesce((select note.message from current_note note), ''),
    'updatedAt', (select note.updated_at from current_note note),
    'previousMessage', case
      when exists (select 1 from current_note) then ''
      else coalesce((select note.message from previous_note note), '')
    end,
    'canUsePrevious', not exists (select 1 from current_note)
      and exists (select 1 from previous_note)
  );
$$;

create or replace function public._schedule_save_encouragement(
  p_student_id uuid,
  p_week_start date,
  p_message text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_message text := pg_catalog.btrim(coalesce(p_message, ''));
begin
  if not public._schedule_week_start_valid(p_week_start) then
    raise exception 'Invalid schedule week' using errcode = '22023';
  end if;
  if pg_catalog.char_length(v_message) > 600 then
    raise exception 'Encouragement message is too long' using errcode = '22023';
  end if;

  perform public._schedule_lock_student_mutations(p_student_id);
  if not exists (
    select 1 from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;

  if v_message = '' then
    delete from public.schedule_weekly_encouragements note
    where note.student_id = p_student_id and note.week_start = p_week_start;
  else
    insert into public.schedule_weekly_encouragements as note (
      student_id,
      week_start,
      message
    ) values (
      p_student_id,
      p_week_start,
      v_message
    )
    on conflict (student_id, week_start) do update
    set message = excluded.message,
        updated_at = now();
  end if;

  return public._schedule_encouragement_payload(p_student_id, p_week_start);
end;
$$;

create or replace function public._schedule_use_previous_encouragement(
  p_student_id uuid,
  p_week_start date
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_previous_message text;
begin
  if not public._schedule_week_start_valid(p_week_start) then
    raise exception 'Invalid schedule week' using errcode = '22023';
  end if;
  perform public._schedule_lock_student_mutations(p_student_id);

  if exists (
    select 1 from public.schedule_weekly_encouragements note
    where note.student_id = p_student_id and note.week_start = p_week_start
  ) then
    raise exception 'This week already has an encouragement message'
      using errcode = '23505';
  end if;

  select note.message into v_previous_message
  from public.schedule_weekly_encouragements note
  where note.student_id = p_student_id
    and note.week_start = p_week_start - 7
  for update;

  if v_previous_message is null then
    raise exception 'Last week has no encouragement message'
      using errcode = 'P0002';
  end if;

  insert into public.schedule_weekly_encouragements (
    student_id,
    week_start,
    message
  ) values (
    p_student_id,
    p_week_start,
    v_previous_message
  );

  return public._schedule_encouragement_payload(p_student_id, p_week_start);
end;
$$;

create or replace function public.schedule_student_get_encouragement(
  p_token uuid,
  p_week_start date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then raise exception 'Invalid or expired student session'; end if;
  if not public._schedule_week_start_valid(p_week_start) then
    raise exception 'Invalid schedule week' using errcode = '22023';
  end if;
  return public._schedule_encouragement_payload(v_student_id, p_week_start);
end;
$$;

create or replace function public.schedule_student_save_encouragement(
  p_token uuid,
  p_week_start date,
  p_message text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then raise exception 'Invalid or expired student session'; end if;
  return public._schedule_save_encouragement(v_student_id, p_week_start, p_message);
end;
$$;

create or replace function public.schedule_student_use_previous_encouragement(
  p_token uuid,
  p_week_start date
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then raise exception 'Invalid or expired student session'; end if;
  return public._schedule_use_previous_encouragement(v_student_id, p_week_start);
end;
$$;

create or replace function public.schedule_admin_get_encouragement(
  p_admin_token uuid,
  p_student_id uuid,
  p_week_start date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;
  if not public._schedule_week_start_valid(p_week_start) then
    raise exception 'Invalid schedule week' using errcode = '22023';
  end if;
  return public._schedule_encouragement_payload(p_student_id, p_week_start);
end;
$$;

create or replace function public.schedule_admin_save_encouragement(
  p_admin_token uuid,
  p_student_id uuid,
  p_week_start date,
  p_message text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;
  return public._schedule_save_encouragement(p_student_id, p_week_start, p_message);
end;
$$;

create or replace function public.schedule_admin_use_previous_encouragement(
  p_admin_token uuid,
  p_student_id uuid,
  p_week_start date
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session';
  end if;
  return public._schedule_use_previous_encouragement(p_student_id, p_week_start);
end;
$$;

revoke all on function public._schedule_display_preferences(uuid)
  from public, anon, authenticated;
revoke all on function public._schedule_set_display_preferences(uuid, jsonb)
  from public, anon, authenticated;
revoke all on function public._schedule_encouragement_payload(uuid, date)
  from public, anon, authenticated;
revoke all on function public._schedule_save_encouragement(uuid, date, text)
  from public, anon, authenticated;
revoke all on function public._schedule_use_previous_encouragement(uuid, date)
  from public, anon, authenticated;

revoke all on function public.schedule_student_get_encouragement(uuid, date)
  from public, anon, authenticated;
revoke all on function public.schedule_student_save_encouragement(uuid, date, text)
  from public, anon, authenticated;
revoke all on function public.schedule_student_use_previous_encouragement(uuid, date)
  from public, anon, authenticated;
revoke all on function public.schedule_admin_get_encouragement(uuid, uuid, date)
  from public, anon, authenticated;
revoke all on function public.schedule_admin_save_encouragement(uuid, uuid, date, text)
  from public, anon, authenticated;
revoke all on function public.schedule_admin_use_previous_encouragement(uuid, uuid, date)
  from public, anon, authenticated;

grant execute on function public.schedule_student_get_encouragement(uuid, date)
  to authenticated;
grant execute on function public.schedule_student_save_encouragement(uuid, date, text)
  to authenticated;
grant execute on function public.schedule_student_use_previous_encouragement(uuid, date)
  to authenticated;
grant execute on function public.schedule_admin_get_encouragement(uuid, uuid, date)
  to authenticated;
grant execute on function public.schedule_admin_save_encouragement(uuid, uuid, date, text)
  to authenticated;
grant execute on function public.schedule_admin_use_previous_encouragement(uuid, uuid, date)
  to authenticated;

notify pgrst, 'reload schema';

commit;
