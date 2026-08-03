-- Schedule System: atomic Mass Edit for entry creation, editing and deletion.
-- Apply after supabase-schedule-system.sql. Re-running this migration is safe.

begin;

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
      or (select count(*) from pg_catalog.jsonb_object_keys(v_item)) not between 6 and 10
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
          and not (v_item ? 'isPreviousIncomplete')
        )
        or (
          v_item ? 'isCompleted'
          and v_item ? 'isInProgress'
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
            or pg_catalog.jsonb_typeof(v_item -> 'isPreviousIncomplete') <> 'boolean'
            or (
              (v_item ->> 'isCompleted')::boolean::integer
              + (v_item ->> 'isInProgress')::boolean::integer
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

create or replace function public.schedule_student_apply_entry_batch(
  p_token uuid,
  p_week_start date,
  p_changes jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
begin
  if v_student_id is null then
    raise exception 'Invalid or expired student session';
  end if;
  return public._schedule_apply_entry_batch(
    v_student_id,
    p_week_start,
    p_changes,
    'student',
    null
  );
end;
$$;

create or replace function public.schedule_admin_apply_entry_batch(
  p_admin_token uuid,
  p_student_id uuid,
  p_week_start date,
  p_changes jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._schedule_admin_id(p_admin_token);
begin
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session';
  end if;
  return public._schedule_apply_entry_batch(
    p_student_id,
    p_week_start,
    p_changes,
    'admin',
    v_admin_id
  );
end;
$$;

revoke all on function public._schedule_apply_entry_batch(uuid, date, jsonb, text, uuid)
  from public, anon, authenticated;
revoke all on function public.schedule_student_apply_entry_batch(uuid, date, jsonb)
  from public, anon, authenticated;
revoke all on function public.schedule_admin_apply_entry_batch(uuid, uuid, date, jsonb)
  from public, anon, authenticated;

grant execute on function public.schedule_student_apply_entry_batch(uuid, date, jsonb)
  to authenticated;
grant execute on function public.schedule_admin_apply_entry_batch(uuid, uuid, date, jsonb)
  to authenticated;

notify pgrst, 'reload schema';

commit;
