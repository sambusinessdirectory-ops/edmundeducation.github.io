-- Homework Schedule: learning counters presentation, purpose typography,
-- language opportunities, weekly teacher-assignment signals, and resource history.
-- Apply after supabase-schedule-reminder-email.sql and
-- supabase-schedule-wellbeing-and-learning-purpose.sql.

begin;

do $$
begin
  if pg_catalog.to_regclass('public.schedule_entries') is null
    or pg_catalog.to_regclass('public.flashcard_student_state') is null
    or pg_catalog.to_regprocedure('public.flashcard_session_student_id(uuid)') is null
    or pg_catalog.to_regprocedure('public._schedule_admin_id(uuid)') is null
  then
    raise exception 'Missing Schedule learning-experience dependencies';
  end if;
end;
$$;

create table if not exists public.schedule_language_opportunities (
  student_id uuid primary key references public.flashcard_students(id) on delete cascade,
  message text not null default '',
  updated_at timestamptz not null default pg_catalog.clock_timestamp(),
  check (pg_catalog.char_length(message) <= 1000),
  check (pg_catalog.octet_length(message) <= 4000)
);

alter table public.schedule_language_opportunities enable row level security;
revoke all on table public.schedule_language_opportunities from public, anon, authenticated;

create or replace function public._schedule_display_preferences(p_student_id uuid)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'hideUnused', coalesce(case when pg_catalog.jsonb_typeof(s.value -> 'scheduleHideUnused') = 'boolean' then (s.value ->> 'scheduleHideUnused')::boolean else false end, false),
    'hideMascots', coalesce(case when pg_catalog.jsonb_typeof(s.value -> 'scheduleHideMascots') = 'boolean' then (s.value ->> 'scheduleHideMascots')::boolean else false end, false),
    'hideDailyQuote', coalesce(case when pg_catalog.jsonb_typeof(s.value -> 'scheduleHideDailyQuote') = 'boolean' then (s.value ->> 'scheduleHideDailyQuote')::boolean else false end, false),
    'hideEncouragement', coalesce(case when pg_catalog.jsonb_typeof(s.value -> 'scheduleHideEncouragement') = 'boolean' then (s.value ->> 'scheduleHideEncouragement')::boolean else false end, false),
    'hideReminderEmail', coalesce(case when pg_catalog.jsonb_typeof(s.value -> 'scheduleHideReminderEmail') = 'boolean' then (s.value ->> 'scheduleHideReminderEmail')::boolean else false end, false),
    'collapseMotivation', coalesce(case when pg_catalog.jsonb_typeof(s.value -> 'scheduleCollapseMotivation') = 'boolean' then (s.value ->> 'scheduleCollapseMotivation')::boolean else false end, false),
    'collapseConfidence', coalesce(case when pg_catalog.jsonb_typeof(s.value -> 'scheduleCollapseConfidence') = 'boolean' then (s.value ->> 'scheduleCollapseConfidence')::boolean else false end, false),
    'collapseConcentration', coalesce(case when pg_catalog.jsonb_typeof(s.value -> 'scheduleCollapseConcentration') = 'boolean' then (s.value ->> 'scheduleCollapseConcentration')::boolean else false end, false),
    'collapseAttentionSpan', coalesce(case when pg_catalog.jsonb_typeof(s.value -> 'scheduleCollapseAttentionSpan') = 'boolean' then (s.value ->> 'scheduleCollapseAttentionSpan')::boolean else false end, false),
    'collapseStress', coalesce(case when pg_catalog.jsonb_typeof(s.value -> 'scheduleCollapseStress') = 'boolean' then (s.value ->> 'scheduleCollapseStress')::boolean else false end, false),
    'collapseHomeworkDifficulty', coalesce(case when pg_catalog.jsonb_typeof(s.value -> 'scheduleCollapseHomeworkDifficulty') = 'boolean' then (s.value ->> 'scheduleCollapseHomeworkDifficulty')::boolean else false end, false),
    'purposeFontSize', coalesce(case when pg_catalog.jsonb_typeof(s.value -> 'schedulePurposeFontSize') = 'number' and (s.value ->> 'schedulePurposeFontSize') ~ '^[1-3]$' then (s.value ->> 'schedulePurposeFontSize')::integer else 2 end, 2)
  )
  from (select 1) seed
  left join public.flashcard_student_state s
    on s.student_id = p_student_id and s.key = 'edmundStudentDisplayPreferences';
$$;

create or replace function public._schedule_set_display_preferences(p_student_id uuid, p_patch jsonb)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare v_storage_patch jsonb := '{}'::jsonb;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if not exists (select 1 from public.flashcard_students s where s.id = p_student_id and s.deleted_at is null) then raise exception 'Student not found'; end if;
  if p_patch is null or pg_catalog.jsonb_typeof(p_patch) <> 'object' or p_patch = '{}'::jsonb then raise exception 'Display-preference patch must be a non-empty JSON object' using errcode='22023'; end if;
  if exists (select 1 from pg_catalog.jsonb_object_keys(p_patch) k(key) where k.key not in (
    'hideUnused','hideMascots','hideDailyQuote','hideEncouragement','hideReminderEmail',
    'collapseMotivation','collapseConfidence','collapseConcentration','collapseAttentionSpan','collapseStress','collapseHomeworkDifficulty','purposeFontSize'
  )) then raise exception 'Display-preference patch contains an unsupported property' using errcode='22023'; end if;
  if exists (select 1 from pg_catalog.jsonb_each(p_patch) e(key,value) where e.key <> 'purposeFontSize' and pg_catalog.jsonb_typeof(e.value) <> 'boolean') then raise exception 'Display-preference values must be boolean' using errcode='22023'; end if;
  if p_patch ? 'purposeFontSize' and (pg_catalog.jsonb_typeof(p_patch->'purposeFontSize') <> 'number' or (p_patch->>'purposeFontSize') !~ '^[1-3]$') then raise exception 'Invalid purpose font size' using errcode='22023'; end if;
  if p_patch ? 'hideUnused' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleHideUnused',p_patch->'hideUnused'); end if;
  if p_patch ? 'hideMascots' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleHideMascots',p_patch->'hideMascots'); end if;
  if p_patch ? 'hideDailyQuote' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleHideDailyQuote',p_patch->'hideDailyQuote'); end if;
  if p_patch ? 'hideEncouragement' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleHideEncouragement',p_patch->'hideEncouragement'); end if;
  if p_patch ? 'hideReminderEmail' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleHideReminderEmail',p_patch->'hideReminderEmail'); end if;
  if p_patch ? 'collapseMotivation' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleCollapseMotivation',p_patch->'collapseMotivation'); end if;
  if p_patch ? 'collapseConfidence' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleCollapseConfidence',p_patch->'collapseConfidence'); end if;
  if p_patch ? 'collapseConcentration' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleCollapseConcentration',p_patch->'collapseConcentration'); end if;
  if p_patch ? 'collapseAttentionSpan' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleCollapseAttentionSpan',p_patch->'collapseAttentionSpan'); end if;
  if p_patch ? 'collapseStress' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleCollapseStress',p_patch->'collapseStress'); end if;
  if p_patch ? 'collapseHomeworkDifficulty' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('scheduleCollapseHomeworkDifficulty',p_patch->'collapseHomeworkDifficulty'); end if;
  if p_patch ? 'purposeFontSize' then v_storage_patch := v_storage_patch || pg_catalog.jsonb_build_object('schedulePurposeFontSize',p_patch->'purposeFontSize'); end if;
  insert into public.flashcard_student_state as state(student_id,key,value)
  values(p_student_id,'edmundStudentDisplayPreferences',v_storage_patch)
  on conflict(student_id,key) do update set value=case when pg_catalog.jsonb_typeof(state.value)='object' then state.value||excluded.value else excluded.value end;
  return public._schedule_display_preferences(p_student_id);
end;
$$;

create or replace function public.schedule_student_get_language_opportunities(p_token uuid)
returns table(message text, updated_at timestamptz)
language plpgsql stable security definer set search_path=''
as $$ declare v_student uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
  v_student := public.flashcard_session_student_id(p_token);
  if v_student is null then raise exception 'Invalid or expired student session' using errcode='42501'; end if;
  return query select coalesce(o.message,''),o.updated_at from (select 1) seed left join public.schedule_language_opportunities o on o.student_id=v_student;
end $$;

create or replace function public.schedule_student_save_language_opportunities(p_token uuid,p_message text)
returns table(message text, updated_at timestamptz)
language plpgsql security definer set search_path=''
as $$ declare v_student uuid; v_message text:=pg_catalog.btrim(coalesce(p_message,''));
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
  v_student := public.flashcard_session_student_id(p_token);
  if v_student is null then raise exception 'Invalid or expired student session' using errcode='42501'; end if;
  if pg_catalog.char_length(v_message)>1000 or pg_catalog.octet_length(v_message)>4000 or v_message~'[[:cntrl:]]' then raise exception 'Invalid language opportunities' using errcode='22023'; end if;
  insert into public.schedule_language_opportunities as o(student_id,message,updated_at) values(v_student,v_message,pg_catalog.clock_timestamp())
  on conflict(student_id) do update set message=excluded.message,updated_at=excluded.updated_at;
  return query select o.message,o.updated_at from public.schedule_language_opportunities o where o.student_id=v_student;
end $$;

create or replace function public.schedule_admin_get_language_opportunities(p_admin_token uuid,p_student_id uuid)
returns table(message text, updated_at timestamptz)
language plpgsql stable security definer set search_path=''
as $$ begin
  if (select auth.uid()) is null or public._schedule_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session' using errcode='42501'; end if;
  return query select coalesce(o.message,''),o.updated_at from (select 1) seed left join public.schedule_language_opportunities o on o.student_id=p_student_id;
end $$;

create or replace function public.schedule_admin_teacher_assignment_students(p_admin_token uuid,p_week_start date)
returns table(student_id uuid)
language plpgsql stable security definer set search_path=''
as $$ begin
  if (select auth.uid()) is null or public._schedule_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session' using errcode='42501'; end if;
  if not public._schedule_week_start_valid(p_week_start) then raise exception 'Invalid schedule week' using errcode='22023'; end if;
  return query select distinct e.student_id from public.schedule_entries e where e.source='admin' and e.schedule_date between p_week_start and p_week_start+6;
end $$;

create index if not exists schedule_entries_admin_week_idx on public.schedule_entries(schedule_date,student_id) where source='admin';

create or replace function public._schedule_homework_resources(p_message text)
returns setof jsonb language plpgsql immutable set search_path=''
as $$
declare m text[]; encoded text; padded text; payload jsonb;
begin
  for m in select pg_catalog.regexp_matches(coalesce(p_message,''),'\[\[@edmund-homework:v1:([A-Za-z0-9_-]+)\]\]','g') loop
    begin
      encoded:=pg_catalog.translate(m[1],'-_','+/');
      padded:=encoded||pg_catalog.repeat('=',(4-pg_catalog.length(encoded)%4)%4);
      payload:=pg_catalog.convert_from(pg_catalog.decode(padded,'base64'),'UTF8')::jsonb;
      if pg_catalog.jsonb_typeof(payload)='object' and payload ? 'id' and payload ? 'url' then return next payload; end if;
    exception when others then null;
    end;
  end loop;
end $$;

create or replace function public.schedule_admin_resource_usage(p_admin_token uuid,p_student_id uuid)
returns table(resource_id text,resource_url text,usage_status text,last_schedule_date date)
language plpgsql stable security definer set search_path=''
as $$ begin
  if (select auth.uid()) is null or public._schedule_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session' using errcode='42501'; end if;
  if not exists(select 1 from public.flashcard_students s where s.id=p_student_id and s.deleted_at is null) then raise exception 'Student not found'; end if;
  return query
  select r->>'id',r->>'url',case
    when pg_catalog.bool_or(e.is_completed) then 'completed'
    when pg_catalog.bool_or(e.is_in_progress or e.is_more_than_half_completed) then 'partial'
    else 'unengaged' end,
    pg_catalog.max(e.schedule_date)
  from public.schedule_entries e cross join lateral public._schedule_homework_resources(e.message) r
  where e.student_id=p_student_id group by r->>'id',r->>'url';
end $$;

revoke all on function public._schedule_display_preferences(uuid),public._schedule_set_display_preferences(uuid,jsonb),public._schedule_homework_resources(text) from public,anon,authenticated;
revoke all on function public.schedule_student_get_language_opportunities(uuid),public.schedule_student_save_language_opportunities(uuid,text),public.schedule_admin_get_language_opportunities(uuid,uuid),public.schedule_admin_teacher_assignment_students(uuid,date),public.schedule_admin_resource_usage(uuid,uuid) from public,anon,authenticated;
grant execute on function public.schedule_student_get_language_opportunities(uuid),public.schedule_student_save_language_opportunities(uuid,text),public.schedule_admin_get_language_opportunities(uuid,uuid),public.schedule_admin_teacher_assignment_students(uuid,date),public.schedule_admin_resource_usage(uuid,uuid) to authenticated;

notify pgrst,'reload schema';
commit;
