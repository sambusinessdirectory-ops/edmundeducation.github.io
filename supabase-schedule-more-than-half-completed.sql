-- Homework Schedule: champagne "more than half completed" status.
-- Safe to re-run after the main schedule and account-management migrations.

begin;

alter table public.schedule_entries
  add column if not exists is_more_than_half_completed boolean not null default false;

alter table public.schedule_entries
  drop constraint if exists schedule_entries_progress_state_check;
alter table public.schedule_entries
  add constraint schedule_entries_progress_state_check check (
    (
      is_completed::integer
      + is_in_progress::integer
      + is_more_than_half_completed::integer
      + is_previous_incomplete::integer
    ) <= 1

  );

create or replace function public._schedule_enforce_exclusive_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_completed and not old.is_completed then
    new.is_in_progress := false;
    new.is_more_than_half_completed := false;
    new.is_previous_incomplete := false;
  elsif new.is_in_progress and not old.is_in_progress then
    new.is_completed := false;
    new.is_more_than_half_completed := false;
    new.is_previous_incomplete := false;
  elsif new.is_more_than_half_completed and not old.is_more_than_half_completed then
    new.is_completed := false;
    new.is_in_progress := false;
    new.is_previous_incomplete := false;
    new.completed_at := null;
    new.completion_source := null;
    new.completed_by_admin := null;
  elsif new.is_previous_incomplete and not old.is_previous_incomplete then
    new.is_completed := false;
    new.is_in_progress := false;
    new.is_more_than_half_completed := false;
  end if;
  return new;
end;
$$;

revoke all on function public._schedule_enforce_exclusive_status() from public, anon, authenticated;
drop trigger if exists schedule_entries_exclusive_status_before_update on public.schedule_entries;
create trigger schedule_entries_exclusive_status_before_update
before update of is_completed, is_in_progress, is_more_than_half_completed, is_previous_incomplete
on public.schedule_entries
for each row execute function public._schedule_enforce_exclusive_status();

create or replace function public._schedule_inherit_span_status()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_is_more_than_half_completed boolean;
begin
  if new.span_group_id is not null and not new.is_more_than_half_completed then
    select member.is_more_than_half_completed
    into v_is_more_than_half_completed
    from public.schedule_entries member
    where member.student_id = new.student_id
      and member.span_group_id = new.span_group_id
    order by member.schedule_date, member.id
    limit 1;
    new.is_more_than_half_completed := coalesce(v_is_more_than_half_completed, false);
  end if;
  return new;
end;
$$;

revoke all on function public._schedule_inherit_span_status() from public, anon, authenticated;
drop trigger if exists schedule_entries_inherit_span_status_before_insert on public.schedule_entries;
create trigger schedule_entries_inherit_span_status_before_insert
before insert on public.schedule_entries
for each row execute function public._schedule_inherit_span_status();

create or replace function public._schedule_week_payload(
  p_student_id uuid,
  p_week_start date
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with days as (
    select series.day::date as schedule_date
    from pg_catalog.generate_series(
      p_week_start::timestamp,
      (p_week_start + 6)::timestamp,
      interval '1 day'
    ) as series(day)
  ), capacities as (
    select day.schedule_date,
      case when day.schedule_date between date '2026-01-01' and date '2050-12-31'
        then coalesce(capacity.slot_count, 10) else 0 end as slot_count
    from days day
    left join public.schedule_day_capacity capacity
      on capacity.student_id = p_student_id and capacity.schedule_date = day.schedule_date
  ), week_entries as (
    select entry.*
    from public.schedule_entries entry
    where entry.student_id = p_student_id
      and entry.schedule_date between p_week_start and p_week_start + 6
  ), metric_all_entries as (
    select entry.*
    from public.schedule_entries entry
    where entry.student_id = p_student_id
      and (
        entry.span_group_id is null
        or entry.schedule_date = (
          select min(member.schedule_date)
          from public.schedule_entries member
          where member.student_id = entry.student_id
            and member.span_group_id = entry.span_group_id
        )
      )
  ), all_metrics as (
    select count(*)::integer as total_goals,
      count(*) filter (where entry.is_completed)::integer as total_completed
    from metric_all_entries entry
  ), homework_type_counts as (
    select homework_type.type_name,
      count(*)::integer as item_count
    from metric_all_entries entry
    cross join lateral pg_catalog.unnest(public._schedule_homework_types(entry.message)) as homework_type(type_name)
    group by homework_type.type_name
  ), homework_type_summary as (
    select pg_catalog.jsonb_object_agg(
      definition.type_name,
      coalesce(type_count.item_count, 0)
      order by definition.sort_order
    ) as counts
    from (values
      (1, 'flashcards'),
      (2, 'fill-blanks'),
      (3, 'writing-submission'),
      (4, 'idiom'),
      (5, 'proverb'),
      (6, 'phrasal-verb'),
      (7, 'speaking'),
      (8, 'sentence-structure'),
      (9, 'reading-analysis')
    ) as definition(sort_order, type_name)
    left join homework_type_counts type_count
      on type_count.type_name = definition.type_name
  ), metric_week_entries as (
    select entry.*
    from week_entries entry
    where entry.span_group_id is null
       or entry.schedule_date = (
         select min(member.schedule_date)
         from public.schedule_entries member
         where member.student_id = entry.student_id
           and member.span_group_id = entry.span_group_id
       )
  )
  select pg_catalog.jsonb_build_object(
    'weekStart', p_week_start,
    'displayPreferences', public._schedule_display_preferences(p_student_id),
    'capacities', (
      select pg_catalog.jsonb_object_agg(
        pg_catalog.to_char(capacity.schedule_date, 'YYYY-MM-DD'), capacity.slot_count order by capacity.schedule_date
      ) from capacities capacity
    ),
    'entries', coalesce((
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object(
          'id', entry.id,
          'scheduleDate', pg_catalog.to_char(entry.schedule_date, 'YYYY-MM-DD'),
          'slotIndex', entry.slot_index,
          'message', entry.message,
          'source', entry.source,
          'isCompleted', entry.is_completed,
          'isInProgress', entry.is_in_progress,
          'isMoreThanHalfCompleted', entry.is_more_than_half_completed,
          'isPreviousIncomplete', entry.is_previous_incomplete,
          'estimatedMinutes', entry.estimated_minutes,
          'spanGroupId', entry.span_group_id,
          'completedAt', entry.completed_at,
          'completionSource', entry.completion_source,
          'updatedAt', entry.updated_at
        ) order by entry.schedule_date, entry.slot_index
      ) from week_entries entry
    ), '[]'::jsonb),
    'metrics', pg_catalog.jsonb_build_object(
      'weekGoals', (select count(*)::integer from metric_week_entries),
      'totalGoals', (select metric.total_goals from all_metrics metric),
      'weekCompleted', (select count(*)::integer from metric_week_entries entry where entry.is_completed),
      'totalCompleted', (select metric.total_completed from all_metrics metric),
      'homeworkTypeCounts', coalesce(
        (select summary.counts from homework_type_summary summary),
        '{}'::jsonb
      )
    ),
    'capacityVersions', (
      select pg_catalog.jsonb_object_agg(
        pg_catalog.to_char(day.schedule_date, 'YYYY-MM-DD'), coalesce(capacity.version, 0) order by day.schedule_date
      )
      from days day
      left join public.schedule_day_capacity capacity
        on capacity.student_id = p_student_id and capacity.schedule_date = day.schedule_date
    ),
    'countdownCapacity', coalesce((
      select capacity.clock_count from public.schedule_countdown_capacity capacity
      where capacity.student_id = p_student_id
    ), 6),
    'countdowns', coalesce((
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object(
          'id', countdown.id,
          'position', countdown.position,
          'title', countdown.title,
          'startDate', pg_catalog.to_char(countdown.start_date, 'YYYY-MM-DD'),
          'endDate', pg_catalog.to_char(countdown.end_date, 'YYYY-MM-DD'),
          'dailyHours', countdown.daily_hours,
          'morningHours', countdown.morning_hours,
          'afternoonHours', countdown.afternoon_hours,
          'eveningHours', countdown.evening_hours,
          'updatedAt', countdown.updated_at
        ) order by countdown.position
      ) from public.schedule_countdowns countdown where countdown.student_id = p_student_id
    ), '[]'::jsonb)
  );
$$;

revoke all on function public._schedule_week_payload(uuid, date) from public, anon, authenticated;

create or replace function public._schedule_move_entry(
  p_student_id uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_source_date date,
  p_source_slot_index integer,
  p_target_date date,
  p_target_slot_index integer,
  p_source_capacity_version bigint,
  p_target_capacity_version bigint,
  p_actor_source text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source public.schedule_entries%rowtype;
  v_target public.schedule_entries%rowtype;
  v_capacity record;
  v_source_capacity integer;
  v_target_capacity integer;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if p_actor_source not in ('student', 'admin') then raise exception 'Invalid move actor' using errcode = '22023'; end if;
  if p_entry_id is null or p_expected_updated_at is null then raise exception 'Move source is incomplete' using errcode = '22023'; end if;
  if p_source_slot_index not between 1 and 100 or p_target_slot_index not between 1 and 100 then
    raise exception 'Invalid schedule slot' using errcode = '22023';
  end if;

  insert into public.schedule_day_capacity (student_id, schedule_date, slot_count, version)
  select p_student_id, requested.schedule_date, 10, 0
  from (select distinct schedule_date from (values (p_source_date), (p_target_date)) value(schedule_date)) requested
  order by requested.schedule_date
  on conflict (student_id, schedule_date) do nothing;

  for v_capacity in
    select capacity.* from public.schedule_day_capacity capacity
    where capacity.student_id = p_student_id and capacity.schedule_date in (p_source_date, p_target_date)
    order by capacity.schedule_date for update
  loop
    if v_capacity.schedule_date = p_source_date then
      v_source_capacity := v_capacity.slot_count;
      if v_capacity.version <> p_source_capacity_version then
        raise exception 'Schedule capacity changed in another session; reload and try again' using errcode = '40001';
      end if;
    end if;
    if v_capacity.schedule_date = p_target_date then
      v_target_capacity := v_capacity.slot_count;
      if v_capacity.version <> p_target_capacity_version then
        raise exception 'Schedule capacity changed in another session; reload and try again' using errcode = '40001';
      end if;
    end if;
  end loop;
  if p_source_slot_index > v_source_capacity or p_target_slot_index > v_target_capacity then
    raise exception 'Target slot is outside the current daily capacity' using errcode = '40001';
  end if;

  perform 1 from public.schedule_entries entry
  where entry.student_id = p_student_id
    and (entry.id = p_entry_id or (entry.schedule_date = p_target_date and entry.slot_index = p_target_slot_index))
  order by entry.id for update;

  select * into v_source from public.schedule_entries entry
  where entry.student_id = p_student_id and entry.id = p_entry_id;
  if not found or v_source.updated_at <> p_expected_updated_at
    or v_source.schedule_date <> p_source_date or v_source.slot_index <> p_source_slot_index
  then
    raise exception 'Schedule entry changed in another session; reload and try again' using errcode = '40001';
  end if;
  if v_source.span_group_id is not null then
    raise exception 'Multi-day projects remain bottom-aligned and cannot be slot-swapped' using errcode = '22023';
  end if;
  if p_actor_source = 'student' and v_source.source = 'admin' then
    raise exception 'Teacher assignments can only be moved by an administrator' using errcode = '42501';
  end if;
  if p_source_date = p_target_date and p_source_slot_index = p_target_slot_index then
    return pg_catalog.jsonb_build_object('id', v_source.id, 'swapped', false, 'updatedAt', v_source.updated_at);
  end if;

  select * into v_target from public.schedule_entries entry
  where entry.student_id = p_student_id
    and entry.schedule_date = p_target_date and entry.slot_index = p_target_slot_index;
  if found then
    if v_target.span_group_id is not null then
      raise exception 'Multi-day projects remain bottom-aligned and cannot be slot-swapped' using errcode = '22023';
    end if;
    if p_actor_source = 'student' and v_target.source = 'admin' then
      raise exception 'Teacher assignments can only be moved by an administrator' using errcode = '42501';
    end if;
    delete from public.schedule_entries entry where entry.id = v_target.id;
  end if;

  update public.schedule_entries entry
  set schedule_date = p_target_date, slot_index = p_target_slot_index, updated_at = now()
  where entry.id = v_source.id;

  if v_target.id is not null then
    insert into public.schedule_entries (
      id, student_id, schedule_date, slot_index, message, source, created_by_admin,
      is_completed, is_in_progress, is_more_than_half_completed, is_previous_incomplete,
      estimated_minutes, span_group_id,
      completed_at, completion_source, completed_by_admin, created_at, updated_at
    ) values (
      v_target.id, v_target.student_id, p_source_date, p_source_slot_index,
      v_target.message, v_target.source, v_target.created_by_admin,
      v_target.is_completed, v_target.is_in_progress, v_target.is_more_than_half_completed,
      v_target.is_previous_incomplete, v_target.estimated_minutes, null,
      v_target.completed_at, v_target.completion_source, v_target.completed_by_admin,
      v_target.created_at, now()
    );
  end if;

  select * into v_source from public.schedule_entries entry where entry.id = p_entry_id;
  return pg_catalog.jsonb_build_object(
    'id', v_source.id,
    'scheduleDate', pg_catalog.to_char(v_source.schedule_date, 'YYYY-MM-DD'),
    'slotIndex', v_source.slot_index,
    'message', v_source.message,
    'source', v_source.source,
    'isCompleted', v_source.is_completed,
    'isInProgress', v_source.is_in_progress,
    'isMoreThanHalfCompleted', v_source.is_more_than_half_completed,
    'isPreviousIncomplete', v_source.is_previous_incomplete,
    'estimatedMinutes', v_source.estimated_minutes,
    'swapped', v_target.id is not null,
    'updatedAt', v_source.updated_at
  );
end;
$$;

revoke all on function public._schedule_move_entry(uuid, uuid, timestamptz, date, integer, date, integer, bigint, bigint, text) from public, anon, authenticated;

create or replace function public._schedule_apply_entry_batch(
  p_student_id uuid,
  p_week_start date,
  p_changes jsonb,
  p_actor_source text,
  p_admin_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_action text;
  v_schedule_date date;
  v_slot_index integer;
  v_expected_updated_at timestamptz;
  v_estimated_minutes integer;
  v_existing public.schedule_entries%rowtype;
  v_effective_source text;
  v_effective_admin_id uuid;
  v_requested_source text;
  v_has_status boolean;
  v_is_completed boolean;
  v_is_in_progress boolean;
  v_is_more_than_half_completed boolean;
  v_is_previous_incomplete boolean;
  v_preserve_completion_metadata boolean;
  v_result jsonb;
  v_deleted boolean;
  v_applied_count integer := 0;
  v_created_count integer := 0;
  v_updated_count integer := 0;
  v_deleted_count integer := 0;
  v_item_count integer;
  v_distinct_count integer;
begin
  if p_actor_source not in ('student', 'admin')
    or (p_actor_source = 'admin' and p_admin_id is null)
    or (p_actor_source = 'student' and p_admin_id is not null)
  then
    raise exception 'Invalid Mass Edit actor' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Student not found' using errcode = '23503';
  end if;

  if p_week_start is null
    or extract(isodow from p_week_start) <> 1
    or p_week_start not between date '2025-12-29' and date '2050-12-26'
  then
    raise exception 'Invalid Mass Edit week' using errcode = '22023';
  end if;

  if p_changes is null
    or pg_catalog.jsonb_typeof(p_changes) <> 'array'
    or pg_catalog.jsonb_array_length(p_changes) not between 1 and 700
    or pg_catalog.octet_length(p_changes::text) > 524288
  then
    raise exception 'Invalid Mass Edit payload' using errcode = '22023';
  end if;

  for v_item in
    select value
    from pg_catalog.jsonb_array_elements(p_changes)
  loop
    if pg_catalog.jsonb_typeof(v_item) <> 'object'
      or (select count(*) from pg_catalog.jsonb_object_keys(v_item)) not between 6 and 11
      or exists (
        select 1
        from pg_catalog.jsonb_object_keys(v_item) as key_row(key_name)
        where key_name not in (
          'action',
          'scheduleDate',
          'slotIndex',
          'message',
          'estimatedMinutes',
          'expectedUpdatedAt',
          'source',
          'isCompleted',
          'isInProgress',
          'isMoreThanHalfCompleted',
          'isPreviousIncomplete'
        )
      )
      or not (
        v_item ? 'action'
        and v_item ? 'scheduleDate'
        and v_item ? 'slotIndex'
        and v_item ? 'message'
        and v_item ? 'estimatedMinutes'
        and v_item ? 'expectedUpdatedAt'
      )
      or not (
        (
          not (v_item ? 'isCompleted')
          and not (v_item ? 'isInProgress')
          and not (v_item ? 'isMoreThanHalfCompleted')
          and not (v_item ? 'isPreviousIncomplete')
        )
        or (
          v_item ? 'isCompleted'
          and v_item ? 'isInProgress'
          and v_item ? 'isMoreThanHalfCompleted'
          and v_item ? 'isPreviousIncomplete'
        )
      )
      or pg_catalog.jsonb_typeof(v_item -> 'action') <> 'string'
      or coalesce(v_item ->> 'action', '') not in ('upsert', 'delete')
      or pg_catalog.jsonb_typeof(v_item -> 'scheduleDate') <> 'string'
      or coalesce(v_item ->> 'scheduleDate', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      or pg_catalog.jsonb_typeof(v_item -> 'slotIndex') <> 'number'
      or (v_item ->> 'slotIndex')::numeric <> pg_catalog.trunc((v_item ->> 'slotIndex')::numeric)
      or (v_item ->> 'slotIndex')::numeric not between 1 and 100
      or pg_catalog.jsonb_typeof(v_item -> 'expectedUpdatedAt') not in ('string', 'null')
      or (
        v_item ? 'source'
        and (
          pg_catalog.jsonb_typeof(v_item -> 'source') <> 'string'
          or coalesce(v_item ->> 'source', '') not in ('student', 'admin')
          or (p_actor_source = 'student' and coalesce(v_item ->> 'source', '') <> 'student')
        )
      )
    then
      raise exception 'Invalid Mass Edit item' using errcode = '22023';
    end if;

    v_action := v_item ->> 'action';
    v_has_status := v_item ? 'isCompleted';
    begin
      v_schedule_date := (v_item ->> 'scheduleDate')::date;
      v_expected_updated_at := case
        when pg_catalog.jsonb_typeof(v_item -> 'expectedUpdatedAt') = 'null' then null
        else (v_item ->> 'expectedUpdatedAt')::timestamptz
      end;
    exception when others then
      raise exception 'Invalid Mass Edit date or version' using errcode = '22023';
    end;

    if v_schedule_date not between date '2026-01-01' and date '2050-12-31'
      or v_schedule_date < p_week_start
      or v_schedule_date >= p_week_start + 7
    then
      raise exception 'Mass Edit item is outside the selected week' using errcode = '22023';
    end if;

    if v_action = 'upsert' then
      if pg_catalog.jsonb_typeof(v_item -> 'message') <> 'string'
        or pg_catalog.char_length(pg_catalog.btrim(coalesce(v_item ->> 'message', ''))) not between 1 and 2000
        or pg_catalog.jsonb_typeof(v_item -> 'estimatedMinutes') not in ('number', 'null')
        or (
          pg_catalog.jsonb_typeof(v_item -> 'estimatedMinutes') = 'number'
          and (
            (v_item ->> 'estimatedMinutes')::numeric <> pg_catalog.trunc((v_item ->> 'estimatedMinutes')::numeric)
            or (v_item ->> 'estimatedMinutes')::numeric not between 1 and 10080
          )
        )
        or (
          v_has_status
          and (
            pg_catalog.jsonb_typeof(v_item -> 'isCompleted') <> 'boolean'
            or pg_catalog.jsonb_typeof(v_item -> 'isInProgress') <> 'boolean'
            or pg_catalog.jsonb_typeof(v_item -> 'isMoreThanHalfCompleted') <> 'boolean'
            or pg_catalog.jsonb_typeof(v_item -> 'isPreviousIncomplete') <> 'boolean'
            or (
              (v_item ->> 'isCompleted')::boolean::integer
              + (v_item ->> 'isInProgress')::boolean::integer
              + (v_item ->> 'isMoreThanHalfCompleted')::boolean::integer
              + (v_item ->> 'isPreviousIncomplete')::boolean::integer
            ) > 1
          )
        )
      then
        raise exception 'Invalid Mass Edit upsert' using errcode = '22023';
      end if;
    elsif pg_catalog.jsonb_typeof(v_item -> 'message') <> 'null'
      or pg_catalog.jsonb_typeof(v_item -> 'estimatedMinutes') <> 'null'
      or (v_has_status and (
        pg_catalog.jsonb_typeof(v_item -> 'isCompleted') <> 'null'
        or pg_catalog.jsonb_typeof(v_item -> 'isInProgress') <> 'null'
        or pg_catalog.jsonb_typeof(v_item -> 'isMoreThanHalfCompleted') <> 'null'
        or pg_catalog.jsonb_typeof(v_item -> 'isPreviousIncomplete') <> 'null'
      ))
      or v_expected_updated_at is null
    then
      raise exception 'Invalid Mass Edit delete' using errcode = '22023';
    end if;
  end loop;

  select
    count(*),
    count(distinct (
      value ->> 'scheduleDate',
      value ->> 'slotIndex'
    ))
  into v_item_count, v_distinct_count
  from pg_catalog.jsonb_array_elements(p_changes);

  if v_item_count <> v_distinct_count then
    raise exception 'Mass Edit contains duplicate schedule slots' using errcode = '22023';
  end if;

  perform public._schedule_lock_student_mutations(p_student_id);

  for v_item in
    select value
    from pg_catalog.jsonb_array_elements(p_changes)
    order by value ->> 'scheduleDate', ((value ->> 'slotIndex')::integer)
  loop
    v_action := v_item ->> 'action';
    v_schedule_date := (v_item ->> 'scheduleDate')::date;
    v_slot_index := (v_item ->> 'slotIndex')::integer;
    v_expected_updated_at := case
      when pg_catalog.jsonb_typeof(v_item -> 'expectedUpdatedAt') = 'null' then null
      else (v_item ->> 'expectedUpdatedAt')::timestamptz
    end;
    v_has_status := v_item ? 'isCompleted';
    v_requested_source := case when v_item ? 'source' then v_item ->> 'source' else null end;

    if v_action = 'upsert' then
      v_estimated_minutes := case
        when pg_catalog.jsonb_typeof(v_item -> 'estimatedMinutes') = 'null' then null
        else (v_item ->> 'estimatedMinutes')::integer
      end;

      v_existing := null;
      select *
      into v_existing
      from public.schedule_entries entry
      where entry.student_id = p_student_id
        and entry.schedule_date = v_schedule_date
        and entry.slot_index = v_slot_index
      for update;

      if found then
        if v_existing.span_group_id is not null then
          perform 1
          from public.schedule_entries group_entry
          where group_entry.student_id = p_student_id
            and group_entry.span_group_id = v_existing.span_group_id
          order by group_entry.id
          for update;

          if v_expected_updated_at is not null and exists (
            select 1
            from public.schedule_entries group_entry
            where group_entry.student_id = p_student_id
              and group_entry.span_group_id = v_existing.span_group_id
              and group_entry.updated_at <> v_expected_updated_at
          ) then
            raise exception 'Schedule entry changed in another session; reload and try again'
              using errcode = '40001';
          end if;
        end if;

        if p_actor_source = 'student' and v_existing.source = 'admin' then
          raise exception 'Teacher assignments can only be changed by an administrator'
            using errcode = '42501';
        end if;
        v_effective_source := coalesce(v_requested_source, v_existing.source);
        v_effective_admin_id := case
          when coalesce(v_requested_source, v_existing.source) = 'admin'
            then coalesce(v_existing.created_by_admin, p_admin_id)
          else null
        end;
      else
        v_effective_source := coalesce(v_requested_source, p_actor_source);
        v_effective_admin_id := case when coalesce(v_requested_source, p_actor_source) = 'admin' then p_admin_id else null end;
      end if;

      if v_has_status then
        v_is_completed := (v_item ->> 'isCompleted')::boolean;
        v_is_in_progress := (v_item ->> 'isInProgress')::boolean;
        v_is_more_than_half_completed := (v_item ->> 'isMoreThanHalfCompleted')::boolean;
        v_is_previous_incomplete := (v_item ->> 'isPreviousIncomplete')::boolean;
        v_preserve_completion_metadata := v_is_completed
          and v_existing.id is not null
          and v_existing.is_completed
          and v_existing.message = (v_item ->> 'message')
          and v_existing.source = v_effective_source;
      end if;

      v_result := public._schedule_upsert_entry(
        p_student_id,
        v_schedule_date,
        v_slot_index,
        v_item ->> 'message',
        v_estimated_minutes,
        v_expected_updated_at,
        v_effective_source,
        v_effective_admin_id
      );
      if v_has_status then
        update public.schedule_entries entry
        set is_completed = v_is_completed,
            is_in_progress = v_is_in_progress,
            is_more_than_half_completed = v_is_more_than_half_completed,
            is_previous_incomplete = v_is_previous_incomplete,
            completed_at = case
              when v_is_completed and v_preserve_completion_metadata then coalesce(v_existing.completed_at, now())
              when v_is_completed then now()
              else null
            end,
            completion_source = case
              when v_is_completed and v_preserve_completion_metadata then coalesce(v_existing.completion_source, p_actor_source)
              when v_is_completed then p_actor_source
              else null
            end,
            completed_by_admin = case
              when v_is_completed and v_preserve_completion_metadata and coalesce(v_existing.completion_source, p_actor_source) = 'admin'
                then coalesce(v_existing.completed_by_admin, p_admin_id)
              when v_is_completed and p_actor_source = 'admin' then p_admin_id
              else null
            end,
            updated_at = now()
        where entry.id = (v_result ->> 'id')::uuid
           or (
             nullif(v_result ->> 'spanGroupId', '') is not null
             and entry.span_group_id = (v_result ->> 'spanGroupId')::uuid
           );
      end if;
      if v_expected_updated_at is null then
        v_created_count := v_created_count + 1;
      else
        v_updated_count := v_updated_count + 1;
      end if;
    else
      select *
      into v_existing
      from public.schedule_entries entry
      where entry.student_id = p_student_id
        and entry.schedule_date = v_schedule_date
        and entry.slot_index = v_slot_index
      for update;

      if found and v_existing.span_group_id is not null then
        perform 1
        from public.schedule_entries group_entry
        where group_entry.student_id = p_student_id
          and group_entry.span_group_id = v_existing.span_group_id
        order by group_entry.id
        for update;

        if exists (
          select 1
          from public.schedule_entries group_entry
          where group_entry.student_id = p_student_id
            and group_entry.span_group_id = v_existing.span_group_id
            and group_entry.updated_at <> v_expected_updated_at
        ) then
          raise exception 'Schedule entry changed in another session; reload and try again'
            using errcode = '40001';
        end if;
      end if;

      if found and p_actor_source = 'student' and v_existing.source = 'admin' then
        raise exception 'Teacher assignments can only be deleted by an administrator'
          using errcode = '42501';
      end if;

      v_deleted := public._schedule_delete_entry(
        p_student_id,
        v_schedule_date,
        v_slot_index,
        v_expected_updated_at,
        p_actor_source
      );
      if not v_deleted then
        raise exception 'Schedule entry changed in another session; reload and try again'
          using errcode = '40001';
      end if;
      v_deleted_count := v_deleted_count + 1;
    end if;
    v_applied_count := v_applied_count + 1;
  end loop;

  return pg_catalog.jsonb_build_object(
    'appliedCount', v_applied_count,
    'createdCount', v_created_count,
    'updatedCount', v_updated_count,
    'deletedCount', v_deleted_count
  );
end;
$$;

revoke all on function public._schedule_apply_entry_batch(uuid, date, jsonb, text, uuid) from public, anon, authenticated;

create or replace function public._schedule_batch_set_entry_status(
  p_student_id uuid,
  p_items jsonb,
  p_status text,
  p_actor_source text,
  p_admin_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item_count integer;
  v_distinct_count integer;
  v_null_count integer;
  v_locked_count integer := 0;
  v_changed_count integer := 0;
  v_entries jsonb;
  v_row record;
begin
  perform public._schedule_lock_student_mutations(p_student_id);
  if p_status not in ('none', 'completed', 'in_progress', 'more_than_half_completed', 'previous_incomplete')
    or p_actor_source not in ('student', 'admin')
    or (p_actor_source = 'student' and p_admin_id is not null)
    or (p_actor_source = 'admin' and p_admin_id is null)
  then
    raise exception 'Invalid batch-status request' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;
  if p_items is null or pg_catalog.jsonb_typeof(p_items) <> 'array'
    or pg_catalog.jsonb_array_length(p_items) not between 1 and 700
    or exists (
      select 1 from pg_catalog.jsonb_array_elements(p_items) item(value)
      where pg_catalog.jsonb_typeof(item.value) <> 'object'
    )
  then
    raise exception 'Batch request must contain 1 to 700 object entries'
      using errcode = '22023';
  end if;

  select count(*)::integer,
         count(distinct requested.entry_id)::integer,
         count(*) filter (where requested.entry_id is null or requested.expected_updated_at is null)::integer
  into v_item_count, v_distinct_count, v_null_count
  from pg_catalog.jsonb_to_recordset(p_items) requested(
    entry_id uuid, expected_updated_at timestamptz
  );
  if v_item_count <> v_distinct_count or v_null_count <> 0 then
    raise exception 'Batch request contains duplicate or incomplete entries'
      using errcode = '22023';
  end if;

  for v_row in
    select entry.*, requested.expected_updated_at as requested_updated_at
    from public.schedule_entries entry
    join pg_catalog.jsonb_to_recordset(p_items) requested(
      entry_id uuid, expected_updated_at timestamptz
    ) on requested.entry_id = entry.id
    where entry.student_id = p_student_id
    order by entry.id
    for update of entry
  loop
    v_locked_count := v_locked_count + 1;
    if v_row.updated_at <> v_row.requested_updated_at then
      raise exception 'Schedule entry changed in another session; reload and try again'
        using errcode = '40001';
    end if;
  end loop;
  if v_locked_count <> v_item_count then
    raise exception 'Schedule entry changed in another session; reload and try again'
      using errcode = '40001';
  end if;

  with requested as (
    select request.entry_id, request.expected_updated_at
    from pg_catalog.jsonb_to_recordset(p_items) request(
      entry_id uuid, expected_updated_at timestamptz
    )
  )
  update public.schedule_entries entry
  set is_completed = p_status = 'completed',
      is_in_progress = p_status = 'in_progress',
      is_more_than_half_completed = p_status = 'more_than_half_completed',
      is_previous_incomplete = p_status = 'previous_incomplete',
      completed_at = case when p_status = 'completed' then pg_catalog.clock_timestamp() else null end,
      completion_source = case when p_status = 'completed' then p_actor_source else null end,
      completed_by_admin = case when p_status = 'completed' and p_actor_source = 'admin' then p_admin_id else null end,
      updated_at = pg_catalog.clock_timestamp()
  from requested
  where entry.student_id = p_student_id
    and entry.id = requested.entry_id
    and entry.updated_at = requested.expected_updated_at
    and (entry.is_completed, entry.is_in_progress, entry.is_more_than_half_completed, entry.is_previous_incomplete)
      is distinct from (
        p_status = 'completed', p_status = 'in_progress', p_status = 'more_than_half_completed',
        p_status = 'previous_incomplete'
      );
  get diagnostics v_changed_count = row_count;

  select coalesce(pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
    'id', entry.id,
    'isCompleted', entry.is_completed,
    'isInProgress', entry.is_in_progress,
    'isMoreThanHalfCompleted', entry.is_more_than_half_completed,
    'isPreviousIncomplete', entry.is_previous_incomplete,
    'completedAt', entry.completed_at,
    'updatedAt', entry.updated_at
  ) order by entry.schedule_date, entry.slot_index, entry.id), '[]'::jsonb)
  into v_entries
  from public.schedule_entries entry
  join pg_catalog.jsonb_to_recordset(p_items) requested(
    entry_id uuid, expected_updated_at timestamptz
  ) on requested.entry_id = entry.id
  where entry.student_id = p_student_id;

  return pg_catalog.jsonb_build_object(
    'requestedCount', v_item_count,
    'changedCount', v_changed_count,
    'status', p_status,
    'entries', v_entries
  );
end;
$$;

revoke all on function public._schedule_batch_set_entry_status(uuid, jsonb, text, text, uuid) from public, anon, authenticated;

notify pgrst, 'reload schema';

commit;
