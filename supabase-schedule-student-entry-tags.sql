-- Allow a student to change only the homework tags on a teacher-created entry.
-- The teacher's visible message, attached resource markers, source, timing and
-- completion state remain protected.

begin;

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
    or pg_catalog.cardinality(p_tag_keys) > 6
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
          'prepare-materials'
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

  -- Tags are stored as trusted marker-only lines. Remove only those lines;
  -- all teacher text and resource markers are left untouched.
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

create or replace function public.schedule_student_set_entry_tags(
  p_token uuid,
  p_entry_id uuid,
  p_expected_updated_at timestamptz,
  p_tag_keys text[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_entry public.schedule_entries%rowtype;
  v_message text;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  v_student_id := public.flashcard_session_student_id(p_token);
  if v_student_id is null then
    raise exception 'Invalid or expired student session' using errcode = '42501';
  end if;

  perform public._schedule_lock_student_mutations(v_student_id);

  select *
  into v_entry
  from public.schedule_entries entry
  where entry.id = p_entry_id
    and entry.student_id = v_student_id
  for update;

  if not found then
    raise exception 'Schedule entry not found' using errcode = 'P0002';
  end if;
  if p_expected_updated_at is null or v_entry.updated_at <> p_expected_updated_at then
    raise exception 'Schedule entry changed in another session; reload and try again'
      using errcode = '40001';
  end if;
  if v_entry.source <> 'admin' then
    raise exception 'Student-created entries must be edited with the regular schedule editor'
      using errcode = '42501';
  end if;

  if v_entry.span_group_id is not null then
    perform 1
    from public.schedule_entries entry
    where entry.student_id = v_student_id
      and entry.span_group_id = v_entry.span_group_id
    order by entry.id
    for update;
  end if;

  v_message := public._schedule_message_with_tags(v_entry.message, p_tag_keys);

  if v_message is distinct from v_entry.message then
    update public.schedule_entries entry
    set message = v_message,
        updated_at = pg_catalog.now()
    where entry.student_id = v_student_id
      and (
        entry.id = v_entry.id
        or (
          v_entry.span_group_id is not null
          and entry.span_group_id = v_entry.span_group_id
        )
      );

    select *
    into v_entry
    from public.schedule_entries entry
    where entry.id = p_entry_id;
  end if;

  return pg_catalog.jsonb_build_object(
    'id', v_entry.id,
    'scheduleDate', pg_catalog.to_char(v_entry.schedule_date, 'YYYY-MM-DD'),
    'slotIndex', v_entry.slot_index,
    'message', v_entry.message,
    'source', v_entry.source,
    'isCompleted', v_entry.is_completed,
    'isInProgress', v_entry.is_in_progress,
    'isMoreThanHalfCompleted', v_entry.is_more_than_half_completed,
    'isPreviousIncomplete', v_entry.is_previous_incomplete,
    'estimatedMinutes', v_entry.estimated_minutes,
    'spanGroupId', v_entry.span_group_id,
    'completedAt', v_entry.completed_at,
    'completionSource', v_entry.completion_source,
    'updatedAt', v_entry.updated_at
  );
end;
$$;

revoke all on function public.schedule_student_set_entry_tags(uuid, uuid, timestamptz, text[])
  from public, anon, authenticated;
grant execute on function public.schedule_student_set_entry_tags(uuid, uuid, timestamptz, text[])
  to authenticated;

notify pgrst, 'reload schema';

commit;
