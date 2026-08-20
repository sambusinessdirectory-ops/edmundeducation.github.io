-- EdmundEducation Homework System: expanded self-evaluations, learning-purpose
-- history, and the two new per-entry priority tags.
-- Apply after supabase-schedule-daily-motivation.sql,
-- supabase-schedule-quote-encouragement.sql, and
-- supabase-schedule-student-entry-tags.sql.

begin;

do $$
begin
  if pg_catalog.to_regclass('public.flashcard_students') is null
    or pg_catalog.to_regclass('public.flashcard_student_state') is null
    or pg_catalog.to_regclass('public.schedule_daily_motivation_ratings') is null
    or pg_catalog.to_regprocedure('public.flashcard_session_student_id(uuid)') is null
    or pg_catalog.to_regprocedure('public._schedule_admin_id(uuid)') is null
    or pg_catalog.to_regprocedure('public._schedule_week_start_valid(date)') is null
    or pg_catalog.to_regprocedure('public._schedule_lock_student_mutations(uuid)') is null
    or pg_catalog.to_regprocedure('public.schedule_touch_updated_at()') is null
  then
    raise exception 'Missing Schedule System wellbeing dependencies';
  end if;
end;
$$;

create table if not exists public.schedule_daily_wellbeing_ratings (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  schedule_date date not null,
  metric text not null,
  rating smallint not null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  primary key (student_id, schedule_date, metric),
  check (schedule_date between date '2026-01-01' and date '2050-12-31'),
  check (metric in (
    'confidence',
    'concentration',
    'attention-span',
    'stress',
    'homework-difficulty'
  )),
  check (rating between 1 and 5)
);

create index if not exists schedule_daily_wellbeing_metric_date_student_idx
  on public.schedule_daily_wellbeing_ratings (metric, schedule_date desc, student_id);

alter table public.schedule_daily_wellbeing_ratings enable row level security;
revoke all on table public.schedule_daily_wellbeing_ratings
  from public, anon, authenticated;

drop trigger if exists schedule_daily_wellbeing_touch_updated_at
  on public.schedule_daily_wellbeing_ratings;
create trigger schedule_daily_wellbeing_touch_updated_at
before update on public.schedule_daily_wellbeing_ratings
for each row execute function public.schedule_touch_updated_at();

create table if not exists public.schedule_learning_purpose_versions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default pg_catalog.now(),
  check (pg_catalog.char_length(pg_catalog.btrim(message)) between 1 and 1000),
  check (pg_catalog.octet_length(message) <= 4000),
  check (pg_catalog.regexp_replace(message, E'[\n\r\t]', '', 'g') !~ '[[:cntrl:]]')
);

create index if not exists schedule_learning_purpose_student_history_idx
  on public.schedule_learning_purpose_versions (student_id, created_at desc, id desc);

alter table public.schedule_learning_purpose_versions enable row level security;
revoke all on table public.schedule_learning_purpose_versions
  from public, anon, authenticated;

-- Add the two requested priority tags while retaining strict marker validation.
create or replace function public._schedule_message_with_tags(
  p_message text,
  p_tag_keys text[]
)
returns text
language plpgsql
immutable
security invoker
set search_path = ''
as $$
declare
  v_message text;
  v_tag_block text;
begin
  if p_message is null or p_tag_keys is null
    or pg_catalog.cardinality(p_tag_keys) > 8
    or exists (
      select 1
      from pg_catalog.unnest(p_tag_keys) as requested(tag_key)
      where requested.tag_key is null
        or requested.tag_key not in (
          'reluctant',
          'favourite',
          'teacher-added',
          'well-done',
          'break-15',
          'prepare-materials',
          'hardest-today',
          'easiest-today'
        )
    )
    or (
      select pg_catalog.count(*)
      from pg_catalog.unnest(p_tag_keys) as requested(tag_key)
    ) <> (
      select pg_catalog.count(distinct requested.tag_key)
      from pg_catalog.unnest(p_tag_keys) as requested(tag_key)
    )
  then
    raise exception 'Invalid homework tags' using errcode = '22023';
  end if;

  v_message := pg_catalog.btrim(
    pg_catalog.regexp_replace(
      p_message,
      E'(^|\\r?\\n)\\[\\[@edmund-homework-tag:v1:[a-z0-9-]+\\]\\](?=\\r?\\n|$)',
      '',
      'g'
    ),
    E' \t\n\r'
  );

  select pg_catalog.string_agg(
    pg_catalog.format('[[@edmund-homework-tag:v1:%s]]', requested.tag_key),
    E'\n\n'
    order by requested.position
  )
  into v_tag_block
  from pg_catalog.unnest(p_tag_keys) with ordinality as requested(tag_key, position);

  v_message := pg_catalog.concat_ws(E'\n\n', nullif(v_message, ''), v_tag_block);
  if pg_catalog.char_length(pg_catalog.btrim(v_message)) not between 1 and 2000 then
    raise exception 'Homework content with tags must contain between 1 and 2000 characters'
      using errcode = '22023';
  end if;
  return v_message;
end;
$$;

revoke all on function public._schedule_message_with_tags(text, text[])
  from public, anon, authenticated;

-- Collapse choices are stored in the existing per-student preference document.
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
      'hideUnused', 'hideMascots', 'hideDailyQuote', 'hideEncouragement',
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

create or replace function public._schedule_wellbeing_week_payload(
  p_student_id uuid,
  p_week_start date
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    pg_catalog.jsonb_agg(
      pg_catalog.jsonb_build_object(
        'scheduleDate', rating.schedule_date,
        'metric', rating.metric,
        'rating', rating.rating,
        'updatedAt', rating.updated_at
      ) order by rating.schedule_date, rating.metric
    ),
    '[]'::jsonb
  )
  from public.schedule_daily_wellbeing_ratings rating
  where rating.student_id = p_student_id
    and rating.schedule_date between p_week_start and p_week_start + 6;
$$;

revoke all on function public._schedule_wellbeing_week_payload(uuid, date)
  from public, anon, authenticated;

create or replace function public.schedule_student_get_wellbeing_week(
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
  v_student_id uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then raise exception 'Invalid or expired student session' using errcode = '42501'; end if;
  if not public._schedule_week_start_valid(p_week_start) then raise exception 'Invalid schedule week' using errcode = '22023'; end if;
  return public._schedule_wellbeing_week_payload(v_student_id, p_week_start);
end;
$$;

create or replace function public.schedule_admin_get_wellbeing_week(
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
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if public._schedule_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session' using errcode = '42501'; end if;
  if not public._schedule_week_start_valid(p_week_start) then raise exception 'Invalid schedule week' using errcode = '22023'; end if;
  if not exists (select 1 from public.flashcard_students student where student.id = p_student_id and student.deleted_at is null) then raise exception 'Student not found'; end if;
  return public._schedule_wellbeing_week_payload(p_student_id, p_week_start);
end;
$$;

create or replace function public.schedule_student_save_wellbeing_rating(
  p_token uuid,
  p_schedule_date date,
  p_metric text,
  p_rating integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_saved public.schedule_daily_wellbeing_ratings%rowtype;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then raise exception 'Invalid or expired student session' using errcode = '42501'; end if;
  if p_schedule_date is null or p_schedule_date not between date '2026-01-01' and date '2050-12-31'
    or p_metric is null
    or p_metric not in ('confidence', 'concentration', 'attention-span', 'stress', 'homework-difficulty')
    or p_rating is null or p_rating not between 1 and 5
  then raise exception 'Invalid wellbeing rating' using errcode = '22023'; end if;
  perform public._schedule_lock_student_mutations(v_student_id);
  insert into public.schedule_daily_wellbeing_ratings as rating (student_id, schedule_date, metric, rating)
  values (v_student_id, p_schedule_date, p_metric, p_rating)
  on conflict (student_id, schedule_date, metric) do update
  set rating = excluded.rating, updated_at = pg_catalog.now()
  returning * into v_saved;
  return pg_catalog.jsonb_build_object(
    'scheduleDate', v_saved.schedule_date,
    'metric', v_saved.metric,
    'rating', v_saved.rating,
    'updatedAt', v_saved.updated_at
  );
end;
$$;

create or replace function public.schedule_admin_save_wellbeing_rating(
  p_admin_token uuid,
  p_student_id uuid,
  p_schedule_date date,
  p_metric text,
  p_rating integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_saved public.schedule_daily_wellbeing_ratings%rowtype;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if public._schedule_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session' using errcode = '42501'; end if;
  if p_schedule_date is null or p_schedule_date not between date '2026-01-01' and date '2050-12-31'
    or p_metric is null
    or p_metric not in ('confidence', 'concentration', 'attention-span', 'stress', 'homework-difficulty')
    or p_rating is null or p_rating not between 1 and 5
  then raise exception 'Invalid wellbeing rating' using errcode = '22023'; end if;
  if not exists (select 1 from public.flashcard_students student where student.id = p_student_id and student.deleted_at is null) then raise exception 'Student not found'; end if;
  perform public._schedule_lock_student_mutations(p_student_id);
  insert into public.schedule_daily_wellbeing_ratings as rating (student_id, schedule_date, metric, rating)
  values (p_student_id, p_schedule_date, p_metric, p_rating)
  on conflict (student_id, schedule_date, metric) do update
  set rating = excluded.rating, updated_at = pg_catalog.now()
  returning * into v_saved;
  return pg_catalog.jsonb_build_object(
    'scheduleDate', v_saved.schedule_date,
    'metric', v_saved.metric,
    'rating', v_saved.rating,
    'updatedAt', v_saved.updated_at
  );
end;
$$;

create or replace function public.schedule_admin_list_self_evaluation_ratings(
  p_admin_token uuid,
  p_metric text,
  p_date_from date,
  p_date_to date,
  p_student_query text default '',
  p_limit integer default 500,
  p_offset integer default 0
)
returns table (
  student_id uuid,
  student_name text,
  schedule_date date,
  metric text,
  rating smallint,
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
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if public._schedule_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session' using errcode = '42501'; end if;
  if p_metric is null
    or p_metric not in ('motivation', 'confidence', 'concentration', 'attention-span', 'stress', 'homework-difficulty')
    or p_date_from is null or p_date_to is null or p_date_from > p_date_to
    or p_date_from < date '2026-01-01' or p_date_to > date '2050-12-31'
    or pg_catalog.char_length(v_query) > 100
  then raise exception 'Invalid self-evaluation report filters' using errcode = '22023'; end if;
  if p_limit is null or p_limit not between 1 and 1000
    or p_offset is null or p_offset not between 0 and 100000
  then raise exception 'Invalid self-evaluation report pagination' using errcode = '22023'; end if;

  return query
  with self_evaluations as (
    select motivation.student_id, motivation.schedule_date, 'motivation'::text as metric,
      motivation.rating, motivation.updated_at
    from public.schedule_daily_motivation_ratings motivation
    where p_metric = 'motivation'
    union all
    select wellbeing.student_id, wellbeing.schedule_date, wellbeing.metric,
      wellbeing.rating, wellbeing.updated_at
    from public.schedule_daily_wellbeing_ratings wellbeing
    where wellbeing.metric = p_metric
  )
  select student.id, student.name, evaluation.schedule_date, evaluation.metric,
    evaluation.rating, evaluation.updated_at, pg_catalog.count(*) over ()
  from self_evaluations evaluation
  join public.flashcard_students student on student.id = evaluation.student_id
  where evaluation.schedule_date between p_date_from and p_date_to
    and student.deleted_at is null
    and (v_query = '' or pg_catalog.strpos(pg_catalog.lower(student.name), v_query) > 0)
  order by evaluation.schedule_date desc, pg_catalog.lower(student.name), student.id
  limit p_limit offset p_offset;
end;
$$;

create or replace function public._schedule_learning_purpose_payload(
  p_student_id uuid,
  p_version_id uuid default null
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with ranked as (
    select purpose.id, purpose.message, purpose.created_at,
      pg_catalog.row_number() over (order by purpose.created_at desc, purpose.id desc)::integer as position,
      pg_catalog.count(*) over ()::integer as total_count,
      pg_catalog.lag(purpose.id) over (order by purpose.created_at desc, purpose.id desc) as newer_id,
      pg_catalog.lead(purpose.id) over (order by purpose.created_at desc, purpose.id desc) as older_id
    from public.schedule_learning_purpose_versions purpose
    where purpose.student_id = p_student_id
  ), selected as (
    select ranked.* from ranked
    where (p_version_id is null and ranked.position = 1) or ranked.id = p_version_id
    limit 1
  )
  select coalesce(
    (select pg_catalog.jsonb_build_object(
      'id', selected.id,
      'message', selected.message,
      'updatedAt', selected.created_at,
      'position', selected.position,
      'totalCount', selected.total_count,
      'newerId', selected.newer_id,
      'olderId', selected.older_id,
      'isLatest', selected.position = 1
    ) from selected),
    pg_catalog.jsonb_build_object(
      'id', null, 'message', '', 'updatedAt', null, 'position', 0,
      'totalCount', 0, 'newerId', null, 'olderId', null, 'isLatest', false
    )
  );
$$;

revoke all on function public._schedule_learning_purpose_payload(uuid, uuid)
  from public, anon, authenticated;

create or replace function public.schedule_student_get_learning_purpose(
  p_token uuid,
  p_version_id uuid default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then raise exception 'Invalid or expired student session' using errcode = '42501'; end if;
  return public._schedule_learning_purpose_payload(v_student_id, p_version_id);
end;
$$;

create or replace function public.schedule_admin_get_learning_purpose(
  p_admin_token uuid,
  p_student_id uuid,
  p_version_id uuid default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if public._schedule_admin_id(p_admin_token) is null then raise exception 'Invalid or expired admin session' using errcode = '42501'; end if;
  if not exists (select 1 from public.flashcard_students student where student.id = p_student_id and student.deleted_at is null) then raise exception 'Student not found'; end if;
  return public._schedule_learning_purpose_payload(p_student_id, p_version_id);
end;
$$;

create or replace function public.schedule_student_save_learning_purpose(
  p_token uuid,
  p_message text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_saved_id uuid;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then raise exception 'Invalid or expired student session' using errcode = '42501'; end if;
  if p_message is null
    or pg_catalog.char_length(pg_catalog.btrim(p_message)) not between 1 and 1000
    or pg_catalog.octet_length(p_message) > 4000
    or pg_catalog.regexp_replace(p_message, E'[\n\r\t]', '', 'g') ~ '[[:cntrl:]]'
  then raise exception 'Invalid learning purpose' using errcode = '22023'; end if;
  perform public._schedule_lock_student_mutations(v_student_id);
  insert into public.schedule_learning_purpose_versions (student_id, message)
  values (v_student_id, pg_catalog.btrim(p_message))
  returning id into v_saved_id;
  return public._schedule_learning_purpose_payload(v_student_id, v_saved_id);
end;
$$;

create or replace function public.schedule_student_delete_learning_purpose(
  p_token uuid,
  p_version_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_deleted integer;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then raise exception 'Invalid or expired student session' using errcode = '42501'; end if;
  if p_version_id is null then raise exception 'Learning-purpose version is required' using errcode = '22023'; end if;
  perform public._schedule_lock_student_mutations(v_student_id);
  delete from public.schedule_learning_purpose_versions purpose
  where purpose.id = p_version_id and purpose.student_id = v_student_id;
  get diagnostics v_deleted = row_count;
  if v_deleted <> 1 then raise exception 'Learning-purpose version not found' using errcode = 'P0002'; end if;
  return public._schedule_learning_purpose_payload(v_student_id, null);
end;
$$;

revoke all on function public.schedule_student_get_wellbeing_week(uuid, date) from public, anon, authenticated;
revoke all on function public.schedule_admin_get_wellbeing_week(uuid, uuid, date) from public, anon, authenticated;
revoke all on function public.schedule_student_save_wellbeing_rating(uuid, date, text, integer) from public, anon, authenticated;
revoke all on function public.schedule_admin_save_wellbeing_rating(uuid, uuid, date, text, integer) from public, anon, authenticated;
revoke all on function public.schedule_admin_list_self_evaluation_ratings(uuid, text, date, date, text, integer, integer) from public, anon, authenticated;
revoke all on function public.schedule_student_get_learning_purpose(uuid, uuid) from public, anon, authenticated;
revoke all on function public.schedule_admin_get_learning_purpose(uuid, uuid, uuid) from public, anon, authenticated;
revoke all on function public.schedule_student_save_learning_purpose(uuid, text) from public, anon, authenticated;
revoke all on function public.schedule_student_delete_learning_purpose(uuid, uuid) from public, anon, authenticated;

grant execute on function public.schedule_student_get_wellbeing_week(uuid, date) to authenticated;
grant execute on function public.schedule_admin_get_wellbeing_week(uuid, uuid, date) to authenticated;
grant execute on function public.schedule_student_save_wellbeing_rating(uuid, date, text, integer) to authenticated;
grant execute on function public.schedule_admin_save_wellbeing_rating(uuid, uuid, date, text, integer) to authenticated;
grant execute on function public.schedule_admin_list_self_evaluation_ratings(uuid, text, date, date, text, integer, integer) to authenticated;
grant execute on function public.schedule_student_get_learning_purpose(uuid, uuid) to authenticated;
grant execute on function public.schedule_admin_get_learning_purpose(uuid, uuid, uuid) to authenticated;
grant execute on function public.schedule_student_save_learning_purpose(uuid, text) to authenticated;
grant execute on function public.schedule_student_delete_learning_purpose(uuid, uuid) to authenticated;

notify pgrst, 'reload schema';

commit;
