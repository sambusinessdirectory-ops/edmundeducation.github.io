-- EdmundEducation Homework System: private reminder-email storage and the
-- persistent "hide email row" display preference.
-- Apply after supabase-schedule-wellbeing-and-learning-purpose.sql.

begin;

do $$
begin
  if pg_catalog.to_regclass('public.flashcard_students') is null
    or pg_catalog.to_regclass('public.flashcard_student_state') is null
    or pg_catalog.to_regprocedure('public.flashcard_session_student_id(uuid)') is null
    or pg_catalog.to_regprocedure('public._schedule_admin_id(uuid)') is null
    or pg_catalog.to_regprocedure('public._schedule_lock_student_mutations(uuid)') is null
  then
    raise exception 'Missing Schedule reminder-email dependencies';
  end if;
end;
$$;

create table if not exists public.schedule_student_reminder_emails (
  student_id uuid primary key references public.flashcard_students(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  check (email = pg_catalog.btrim(email)),
  check (pg_catalog.char_length(email) between 3 and 254),
  check (pg_catalog.octet_length(email) <= 254),
  check (email !~ '[[:space:][:cntrl:]]'),
  check (email ~ '^[^@]+@[^@]+\.[^@]+$')
);

comment on table public.schedule_student_reminder_emails is
  'Private student reminder addresses. Access is only through token-scoped Schedule RPCs.';

alter table public.schedule_student_reminder_emails enable row level security;
revoke all on table public.schedule_student_reminder_emails
  from public, anon, authenticated;

create or replace function public._schedule_normalize_reminder_email(p_email text)
returns text
language plpgsql
immutable
strict
security invoker
set search_path = ''
as $$
declare
  v_email text := pg_catalog.btrim(p_email);
begin
  if pg_catalog.char_length(v_email) not between 3 and 254
    or pg_catalog.octet_length(v_email) > 254
    or v_email ~ '[[:space:][:cntrl:]]'
    or v_email !~ '^[^@]+@[^@]+\.[^@]+$'
  then
    raise exception 'Invalid reminder email' using errcode = '22023';
  end if;
  return v_email;
end;
$$;

revoke all on function public._schedule_normalize_reminder_email(text)
  from public, anon, authenticated;

create or replace function public._schedule_reminder_email_payload(p_student_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select pg_catalog.jsonb_build_object(
        'email', reminder.email,
        'updatedAt', reminder.updated_at
      )
      from public.schedule_student_reminder_emails reminder
      where reminder.student_id = p_student_id
    ),
    pg_catalog.jsonb_build_object('email', '', 'updatedAt', null)
  );
$$;

revoke all on function public._schedule_reminder_email_payload(uuid)
  from public, anon, authenticated;

create or replace function public.schedule_student_get_reminder_email(p_token uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then
    raise exception 'Invalid or expired student session' using errcode = '42501';
  end if;
  return public._schedule_reminder_email_payload(v_student_id);
end;
$$;

create or replace function public.schedule_student_set_reminder_email(
  p_token uuid,
  p_email text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_email text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then
    raise exception 'Invalid or expired student session' using errcode = '42501';
  end if;
  v_email := public._schedule_normalize_reminder_email(p_email);
  perform public._schedule_lock_student_mutations(v_student_id);

  insert into public.schedule_student_reminder_emails as reminder (
    student_id, email, updated_at
  ) values (
    v_student_id, v_email, pg_catalog.clock_timestamp()
  )
  on conflict (student_id) do update
  set email = excluded.email,
      updated_at = excluded.updated_at;

  return public._schedule_reminder_email_payload(v_student_id);
end;
$$;

create or replace function public.schedule_student_delete_reminder_email(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then
    raise exception 'Invalid or expired student session' using errcode = '42501';
  end if;
  perform public._schedule_lock_student_mutations(v_student_id);
  delete from public.schedule_student_reminder_emails reminder
  where reminder.student_id = v_student_id;
  return true;
end;
$$;

create or replace function public.schedule_admin_list_reminder_emails(
  p_admin_token uuid,
  p_student_query text default '',
  p_limit integer default 100,
  p_offset integer default 0
)
returns table (
  student_id uuid,
  student_name text,
  email text,
  updated_at timestamptz,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_query text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_student_query, '')));
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if public._schedule_admin_id(p_admin_token) is null then
    raise exception 'Invalid or expired admin session' using errcode = '42501';
  end if;
  if pg_catalog.char_length(v_query) > 100
    or p_limit is null or p_limit not between 1 and 500
    or p_offset is null or p_offset not between 0 and 100000
  then
    raise exception 'Invalid reminder-email directory filters' using errcode = '22023';
  end if;

  return query
  select student.id, student.name, reminder.email, reminder.updated_at,
    pg_catalog.count(*) over ()
  from public.flashcard_students student
  left join public.schedule_student_reminder_emails reminder
    on reminder.student_id = student.id
  where student.deleted_at is null
    and (v_query = '' or pg_catalog.strpos(pg_catalog.lower(student.name), v_query) > 0)
  order by pg_catalog.lower(student.name), student.id
  limit p_limit offset p_offset;
end;
$$;

-- Extend the existing Schedule display-preference document without creating a
-- second preference store.
create or replace function public._schedule_display_preferences(p_student_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'hideUnused', coalesce(case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleHideUnused') = 'boolean' then (student_state.value ->> 'scheduleHideUnused')::boolean else false end, false),
    'hideMascots', coalesce(case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleHideMascots') = 'boolean' then (student_state.value ->> 'scheduleHideMascots')::boolean else false end, false),
    'hideDailyQuote', coalesce(case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleHideDailyQuote') = 'boolean' then (student_state.value ->> 'scheduleHideDailyQuote')::boolean else false end, false),
    'hideEncouragement', coalesce(case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleHideEncouragement') = 'boolean' then (student_state.value ->> 'scheduleHideEncouragement')::boolean else false end, false),
    'hideReminderEmail', coalesce(case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleHideReminderEmail') = 'boolean' then (student_state.value ->> 'scheduleHideReminderEmail')::boolean else false end, false),
    'collapseMotivation', coalesce(case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleCollapseMotivation') = 'boolean' then (student_state.value ->> 'scheduleCollapseMotivation')::boolean else false end, false),
    'collapseConfidence', coalesce(case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleCollapseConfidence') = 'boolean' then (student_state.value ->> 'scheduleCollapseConfidence')::boolean else false end, false),
    'collapseConcentration', coalesce(case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleCollapseConcentration') = 'boolean' then (student_state.value ->> 'scheduleCollapseConcentration')::boolean else false end, false),
    'collapseAttentionSpan', coalesce(case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleCollapseAttentionSpan') = 'boolean' then (student_state.value ->> 'scheduleCollapseAttentionSpan')::boolean else false end, false),
    'collapseStress', coalesce(case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleCollapseStress') = 'boolean' then (student_state.value ->> 'scheduleCollapseStress')::boolean else false end, false),
    'collapseHomeworkDifficulty', coalesce(case when pg_catalog.jsonb_typeof(student_state.value -> 'scheduleCollapseHomeworkDifficulty') = 'boolean' then (student_state.value ->> 'scheduleCollapseHomeworkDifficulty')::boolean else false end, false)
  )
  from (select 1) seed
  left join public.flashcard_student_state student_state
    on student_state.student_id = p_student_id
   and student_state.key = 'edmundStudentDisplayPreferences';
$$;

revoke all on function public._schedule_display_preferences(uuid)
  from public, anon, authenticated;

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
  if p_patch is null or pg_catalog.jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb then
    raise exception 'Display-preference patch must be a non-empty JSON object'
      using errcode = '22023';
  end if;
  if exists (
    select 1 from pg_catalog.jsonb_object_keys(p_patch) patch_key(key)
    where patch_key.key not in (
      'hideUnused', 'hideMascots', 'hideDailyQuote', 'hideEncouragement', 'hideReminderEmail',
      'collapseMotivation', 'collapseConfidence', 'collapseConcentration',
      'collapseAttentionSpan', 'collapseStress', 'collapseHomeworkDifficulty'
    )
  ) then
    raise exception 'Display-preference patch contains an unsupported property'
      using errcode = '22023';
  end if;
  if exists (
    select 1 from pg_catalog.jsonb_each(p_patch) patch_entry(key, value)
    where pg_catalog.jsonb_typeof(patch_entry.value) <> 'boolean'
  ) then
    raise exception 'Display-preference values must be boolean' using errcode = '22023';
  end if;

  if p_patch ? 'hideUnused' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleHideUnused', p_patch -> 'hideUnused'); end if;
  if p_patch ? 'hideMascots' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleHideMascots', p_patch -> 'hideMascots'); end if;
  if p_patch ? 'hideDailyQuote' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleHideDailyQuote', p_patch -> 'hideDailyQuote'); end if;
  if p_patch ? 'hideEncouragement' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleHideEncouragement', p_patch -> 'hideEncouragement'); end if;
  if p_patch ? 'hideReminderEmail' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleHideReminderEmail', p_patch -> 'hideReminderEmail'); end if;
  if p_patch ? 'collapseMotivation' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleCollapseMotivation', p_patch -> 'collapseMotivation'); end if;
  if p_patch ? 'collapseConfidence' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleCollapseConfidence', p_patch -> 'collapseConfidence'); end if;
  if p_patch ? 'collapseConcentration' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleCollapseConcentration', p_patch -> 'collapseConcentration'); end if;
  if p_patch ? 'collapseAttentionSpan' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleCollapseAttentionSpan', p_patch -> 'collapseAttentionSpan'); end if;
  if p_patch ? 'collapseStress' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleCollapseStress', p_patch -> 'collapseStress'); end if;
  if p_patch ? 'collapseHomeworkDifficulty' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleCollapseHomeworkDifficulty', p_patch -> 'collapseHomeworkDifficulty'); end if;

  insert into public.flashcard_student_state as state (student_id, key, value)
  values (p_student_id, 'edmundStudentDisplayPreferences', v_storage_patch)
  on conflict (student_id, key) do update
  set value = case
    when pg_catalog.jsonb_typeof(state.value) = 'object' then state.value || excluded.value
    else excluded.value
  end;
  return public._schedule_display_preferences(p_student_id);
end;
$$;

revoke all on function public._schedule_set_display_preferences(uuid, jsonb)
  from public, anon, authenticated;

revoke all on function public.schedule_student_get_reminder_email(uuid)
  from public, anon, authenticated;
revoke all on function public.schedule_student_set_reminder_email(uuid, text)
  from public, anon, authenticated;
revoke all on function public.schedule_student_delete_reminder_email(uuid)
  from public, anon, authenticated;
revoke all on function public.schedule_admin_list_reminder_emails(uuid, text, integer, integer)
  from public, anon, authenticated;

grant execute on function public.schedule_student_get_reminder_email(uuid) to authenticated;
grant execute on function public.schedule_student_set_reminder_email(uuid, text) to authenticated;
grant execute on function public.schedule_student_delete_reminder_email(uuid) to authenticated;
grant execute on function public.schedule_admin_list_reminder_emails(uuid, text, integer, integer) to authenticated;

notify pgrst, 'reload schema';

commit;
