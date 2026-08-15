-- Protect Flashcard attempt history from stale tabs and pre-hydration writes.
-- Attempt snapshots remain backwards-compatible JSON, but updates are now merged
-- transactionally by attempt identity instead of replacing the whole array.

begin;

create or replace function public.flashcard_merge_attempt_arrays(
  p_existing jsonb,
  p_incoming jsonb
)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  with normalized as (
    select
      case when jsonb_typeof(p_existing) = 'array' then p_existing else '[]'::jsonb end as existing_value,
      case when jsonb_typeof(p_incoming) = 'array' then p_incoming else '[]'::jsonb end as incoming_value
  ),
  existing_count as (
    select jsonb_array_length(existing_value)::bigint as item_count
    from normalized
  ),
  items as (
    select item, ordinal::bigint as sort_position, 0 as source_priority
    from normalized
    cross join lateral jsonb_array_elements(existing_value) with ordinality as rows(item, ordinal)

    union all

    select item, existing_count.item_count + ordinal::bigint as sort_position, 1 as source_priority
    from normalized
    cross join existing_count
    cross join lateral jsonb_array_elements(incoming_value) with ordinality as rows(item, ordinal)
  ),
  scored as (
    select
      item,
      sort_position,
      source_priority,
      case
        when nullif(btrim(item ->> 'id'), '') is not null
          then 'id:' || btrim(item ->> 'id')
        else 'legacy:' || md5(concat_ws('|',
          lower(btrim(coalesce(item ->> 'studentName', ''))),
          coalesce(item ->> 'startedAt', ''),
          coalesce(item ->> 'deckId', ''),
          coalesce(item ->> 'mode', '')
        ))
      end as attempt_key,
      case
        when lower(coalesce(item ->> 'completed', 'false')) = 'true'
          or nullif(btrim(coalesce(item ->> 'completedAt', '')), '') is not null
        then 1 else 0
      end as completed_score,
      greatest(
        case when coalesce(item ->> 'answeredCount', '') ~ '^[0-9]{1,18}$'
          then (item ->> 'answeredCount')::numeric else 0 end,
        case when coalesce(item ->> 'green', '') ~ '^[0-9]{1,18}$'
          then (item ->> 'green')::numeric else 0 end
          + case when coalesce(item ->> 'red', '') ~ '^[0-9]{1,18}$'
            then (item ->> 'red')::numeric else 0 end,
        case when jsonb_typeof(item -> 'cardOutcomes') = 'array'
          then jsonb_array_length(item -> 'cardOutcomes') else 0 end
      ) as answered_score,
      greatest(
        case when coalesce(item ->> 'updatedAt', '') ~ '^[0-9]{1,18}$'
          then (item ->> 'updatedAt')::numeric else 0 end,
        case when coalesce(item ->> 'completedAt', '') ~ '^[0-9]{1,18}$'
          then (item ->> 'completedAt')::numeric else 0 end,
        case when coalesce(item ->> 'startedAt', '') ~ '^[0-9]{1,18}$'
          then (item ->> 'startedAt')::numeric else 0 end
      ) as updated_score,
      case when coalesce(item ->> 'durationMs', '') ~ '^[0-9]{1,18}$'
        then (item ->> 'durationMs')::numeric else 0 end as duration_score
    from items
    where jsonb_typeof(item) = 'object'
  ),
  ranked as (
    select
      item,
      attempt_key,
      min(sort_position) over (partition by attempt_key) as first_position,
      row_number() over (
        partition by attempt_key
        order by
          completed_score desc,
          answered_score desc,
          updated_score desc,
          duration_score desc,
          source_priority desc
      ) as winner_rank
    from scored
  )
  select coalesce(
    jsonb_agg(item order by first_position, attempt_key) filter (where winner_rank = 1),
    '[]'::jsonb
  )
  from ranked;
$$;

revoke all on function public.flashcard_merge_attempt_arrays(jsonb, jsonb)
  from public, anon, authenticated, service_role;

create or replace function public.flashcard_student_upsert_state(
  p_token uuid,
  p_key text,
  p_value jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public.flashcard_session_student_id(p_token);
  v_key text := btrim(coalesce(p_key, ''));
  v_value jsonb;
  v_affected bigint := 0;
begin
  if v_student_id is null or v_key = '' then
    return false;
  end if;

  v_value := case
    when v_key = 'edmundFlashcardAttempts'
      then case when jsonb_typeof(p_value) = 'array' then p_value else '[]'::jsonb end
    else coalesce(p_value, '{}'::jsonb)
  end;

  perform pg_catalog.set_config('flashcard_integrity.actor_kind', 'legacy_student', true);
  perform pg_catalog.set_config(
    'flashcard_integrity.session_fingerprint',
    pg_catalog.encode(
      extensions.digest(pg_catalog.convert_to(p_token::text, 'UTF8'), 'sha256'),
      'hex'
    ),
    true
  );
  insert into public.flashcard_student_state as state (student_id, key, value)
  values (v_student_id, v_key, v_value)
  on conflict (student_id, key) do update
  set value = case
        when excluded.key = 'edmundFlashcardAttempts'
          then public.flashcard_merge_attempt_arrays(state.value, excluded.value)
        else excluded.value
      end,
      updated_at = now();
  get diagnostics v_affected = row_count;

  return v_affected > 0;
end;
$$;

create or replace function public.flashcard_admin_upsert_student_state(
  p_admin_name text,
  p_admin_password text,
  p_student_name text,
  p_key text,
  p_value jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_key text := btrim(coalesce(p_key, ''));
  v_value jsonb;
  v_affected bigint := 0;
begin
  if not public.flashcard_admin_ok(p_admin_name, p_admin_password) then
    return false;
  end if;

  select st.id into v_student_id
  from public.flashcard_students st
  where st.name = btrim(p_student_name)
    and st.deleted_at is null
  limit 1;

  if v_student_id is null or v_key = '' then
    return false;
  end if;

  v_value := case
    when v_key = 'edmundFlashcardAttempts'
      then case when jsonb_typeof(p_value) = 'array' then p_value else '[]'::jsonb end
    else coalesce(p_value, '{}'::jsonb)
  end;

  perform pg_catalog.set_config('flashcard_integrity.actor_kind', 'legacy_admin', true);
  insert into public.flashcard_student_state as state (student_id, key, value)
  values (v_student_id, v_key, v_value)
  on conflict (student_id, key) do update
  set value = case
        when excluded.key = 'edmundFlashcardAttempts'
          then public.flashcard_merge_attempt_arrays(state.value, excluded.value)
        else excluded.value
      end,
      updated_at = now();
  get diagnostics v_affected = row_count;

  return v_affected > 0;
end;
$$;

revoke all on function public.flashcard_student_upsert_state(uuid, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.flashcard_admin_upsert_student_state(text, text, text, text, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function public.flashcard_student_upsert_state(uuid, text, jsonb) to authenticated;
grant execute on function public.flashcard_admin_upsert_student_state(text, text, text, text, jsonb) to authenticated;

notify pgrst, 'reload schema';

commit;
