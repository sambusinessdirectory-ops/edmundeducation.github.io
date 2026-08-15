-- Flashcard integrity phase 1 / stage 03 of 14: metrics and attempt routines.
-- Function replacement takes no long-lived lock on the public state table.

begin;
set local lock_timeout = '3s';
set local statement_timeout = '2min';

create or replace function flashcard_integrity.state_metrics(
  p_state_key text,
  p_value jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_type text := coalesce(pg_catalog.jsonb_typeof(p_value), 'null');
  v_bytes bigint := pg_catalog.octet_length(coalesce(p_value, 'null'::jsonb)::text);
  v_result jsonb;
begin
  if p_state_key = 'edmundFlashcardAttempts' and v_type = 'array' then
    select pg_catalog.jsonb_build_object(
      'jsonType', 'array',
      'bytes', v_bytes,
      'items', pg_catalog.count(*),
      'completed', pg_catalog.count(*) filter (
        where pg_catalog.lower(coalesce(item ->> 'completed', 'false')) = 'true'
           or nullif(pg_catalog.btrim(coalesce(item ->> 'completedAt', '')), '') is not null
      ),
      'answered', coalesce(pg_catalog.sum(
        flashcard_integrity.safe_nonnegative_bigint(item, 'answeredCount')
      ), 0),
      'durationMs', coalesce(pg_catalog.sum(
        flashcard_integrity.safe_nonnegative_bigint(item, 'durationMs')
      ), 0),
      'uniqueAttemptIds', pg_catalog.count(distinct case
        when nullif(pg_catalog.btrim(item ->> 'id'), '') is not null
          then pg_catalog.btrim(item ->> 'id')
        else 'legacy:' || pg_catalog.md5(pg_catalog.concat_ws('|',
          pg_catalog.lower(pg_catalog.btrim(coalesce(item ->> 'studentName', ''))),
          coalesce(item ->> 'startedAt', ''),
          coalesce(item ->> 'deckId', ''),
          coalesce(item ->> 'mode', '')
        ))
      end)
    )
    into v_result
    from pg_catalog.jsonb_array_elements(p_value) as entries(item)
    where pg_catalog.jsonb_typeof(item) = 'object';
    return coalesce(v_result, pg_catalog.jsonb_build_object(
      'jsonType', 'array', 'bytes', v_bytes, 'items', 0,
      'completed', 0, 'answered', 0, 'durationMs', 0, 'uniqueAttemptIds', 0
    ));
  end if;

  if v_type = 'array' then
    return pg_catalog.jsonb_build_object(
      'jsonType', v_type,
      'bytes', v_bytes,
      'items', pg_catalog.jsonb_array_length(p_value)
    );
  end if;

  if v_type = 'object' then
    select pg_catalog.jsonb_build_object(
      'jsonType', v_type,
      'bytes', v_bytes,
      'keys', pg_catalog.count(*)
    )
    into v_result
    from pg_catalog.jsonb_object_keys(p_value);
    return v_result;
  end if;

  return pg_catalog.jsonb_build_object('jsonType', v_type, 'bytes', v_bytes);
end;
$$;

create or replace function flashcard_integrity.record_alert(
  p_student_id uuid,
  p_state_key text,
  p_severity text,
  p_code text,
  p_request_id uuid,
  p_current_metrics jsonb,
  p_incoming_metrics jsonb,
  p_action_taken text,
  p_actor_kind text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_alert_id bigint;
begin
  insert into flashcard_integrity.alerts (
    student_id,
    state_key,
    severity,
    code,
    request_id,
    current_metrics,
    incoming_metrics,
    action_taken,
    actor_kind
  )
  values (
    p_student_id,
    p_state_key,
    case when p_severity in ('info', 'warning', 'critical') then p_severity else 'warning' end,
    p_code,
    p_request_id,
    coalesce(p_current_metrics, '{}'::jsonb),
    coalesce(p_incoming_metrics, '{}'::jsonb),
    p_action_taken,
    coalesce(nullif(p_actor_kind, ''), flashcard_integrity.current_actor_kind())
  )
  returning alert_id into v_alert_id;

  insert into flashcard_integrity.alert_outbox (alert_id)
  values (v_alert_id);

  return v_alert_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Lossless attempt union and one-attempt-at-a-time current/audit records
-- ---------------------------------------------------------------------------

create or replace function flashcard_integrity.attempt_key(p_attempt jsonb)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when nullif(pg_catalog.btrim(p_attempt ->> 'id'), '') is not null
      then pg_catalog.btrim(p_attempt ->> 'id')
    else 'legacy:' || pg_catalog.md5(pg_catalog.concat_ws('|',
      pg_catalog.lower(pg_catalog.btrim(coalesce(p_attempt ->> 'studentName', ''))),
      coalesce(p_attempt ->> 'startedAt', ''),
      coalesce(p_attempt ->> 'deckId', ''),
      coalesce(p_attempt ->> 'mode', '')
    ))
  end;
$$;

create or replace function flashcard_integrity.attempt_answered_score(p_attempt jsonb)
returns bigint
language sql
immutable
set search_path = ''
as $$
  select greatest(
    flashcard_integrity.safe_nonnegative_bigint(p_attempt, 'answeredCount'),
    flashcard_integrity.safe_nonnegative_bigint(p_attempt, 'green')
      + flashcard_integrity.safe_nonnegative_bigint(p_attempt, 'red'),
    case
      when pg_catalog.jsonb_typeof(p_attempt -> 'cardOutcomes') = 'array'
        then pg_catalog.jsonb_array_length(p_attempt -> 'cardOutcomes')::bigint
      else 0::bigint
    end
  );
$$;

create or replace function flashcard_integrity.attempt_completed_score(p_attempt jsonb)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when pg_catalog.lower(coalesce(p_attempt ->> 'completed', 'false')) = 'true'
      or nullif(pg_catalog.btrim(coalesce(p_attempt ->> 'completedAt', '')), '') is not null
    then 1 else 0
  end;
$$;

create or replace function flashcard_integrity.attempt_updated_score(p_attempt jsonb)
returns bigint
language sql
immutable
set search_path = ''
as $$
  select greatest(
    flashcard_integrity.safe_nonnegative_bigint(p_attempt, 'updatedAt'),
    flashcard_integrity.safe_nonnegative_bigint(p_attempt, 'completedAt'),
    flashcard_integrity.safe_nonnegative_bigint(p_attempt, 'startedAt')
  );
$$;

create or replace function flashcard_integrity.merge_attempt_objects(
  p_existing jsonb,
  p_incoming jsonb
)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_existing jsonb := case when pg_catalog.jsonb_typeof(p_existing) = 'object' then p_existing else '{}'::jsonb end;
  v_incoming jsonb := case when pg_catalog.jsonb_typeof(p_incoming) = 'object' then p_incoming else '{}'::jsonb end;
  v_result jsonb;
  v_existing_quality bigint[];
  v_incoming_quality bigint[];
  v_completed boolean;
  v_number bigint;
begin
  v_existing_quality := array[
    flashcard_integrity.attempt_completed_score(v_existing)::bigint,
    flashcard_integrity.attempt_answered_score(v_existing),
    flashcard_integrity.attempt_updated_score(v_existing),
    flashcard_integrity.safe_nonnegative_bigint(v_existing, 'durationMs')
  ];
  v_incoming_quality := array[
    flashcard_integrity.attempt_completed_score(v_incoming)::bigint,
    flashcard_integrity.attempt_answered_score(v_incoming),
    flashcard_integrity.attempt_updated_score(v_incoming),
    flashcard_integrity.safe_nonnegative_bigint(v_incoming, 'durationMs')
  ];

  -- The higher-quality object wins conflicts, while JSON concatenation preserves
  -- fields that exist only in the lower-quality object.
  if v_incoming_quality > v_existing_quality then
    v_result := v_existing || v_incoming;
  else
    v_result := v_incoming || v_existing;
  end if;

  v_completed := flashcard_integrity.attempt_completed_score(v_existing) = 1
    or flashcard_integrity.attempt_completed_score(v_incoming) = 1;
  if v_completed
     or v_existing ? 'completed'
     or v_incoming ? 'completed'
     or v_existing ? 'completedAt'
     or v_incoming ? 'completedAt' then
    v_result := pg_catalog.jsonb_set(v_result, '{completed}', pg_catalog.to_jsonb(v_completed), true);
  end if;

  v_number := greatest(
    flashcard_integrity.safe_nonnegative_bigint(v_existing, 'answeredCount'),
    flashcard_integrity.safe_nonnegative_bigint(v_incoming, 'answeredCount')
  );
  if v_number > 0 or v_existing ? 'answeredCount' or v_incoming ? 'answeredCount' then
    v_result := pg_catalog.jsonb_set(v_result, '{answeredCount}', pg_catalog.to_jsonb(v_number), true);
  end if;

  v_number := greatest(
    flashcard_integrity.safe_nonnegative_bigint(v_existing, 'durationMs'),
    flashcard_integrity.safe_nonnegative_bigint(v_incoming, 'durationMs')
  );
  if v_number > 0 or v_existing ? 'durationMs' or v_incoming ? 'durationMs' then
    v_result := pg_catalog.jsonb_set(v_result, '{durationMs}', pg_catalog.to_jsonb(v_number), true);
  end if;

  v_number := greatest(
    flashcard_integrity.safe_nonnegative_bigint(v_existing, 'updatedAt'),
    flashcard_integrity.safe_nonnegative_bigint(v_incoming, 'updatedAt')
  );
  if v_number > 0 then
    v_result := pg_catalog.jsonb_set(v_result, '{updatedAt}', pg_catalog.to_jsonb(v_number), true);
  end if;

  v_number := greatest(
    flashcard_integrity.safe_nonnegative_bigint(v_existing, 'completedAt'),
    flashcard_integrity.safe_nonnegative_bigint(v_incoming, 'completedAt')
  );
  if v_number > 0 then
    v_result := pg_catalog.jsonb_set(v_result, '{completedAt}', pg_catalog.to_jsonb(v_number), true);
  end if;

  if pg_catalog.jsonb_typeof(v_existing -> 'cardOutcomes') = 'array'
     and pg_catalog.jsonb_typeof(v_incoming -> 'cardOutcomes') = 'array' then
    if pg_catalog.jsonb_array_length(v_existing -> 'cardOutcomes')
         > pg_catalog.jsonb_array_length(v_incoming -> 'cardOutcomes')
       or (
         pg_catalog.jsonb_array_length(v_existing -> 'cardOutcomes')
           = pg_catalog.jsonb_array_length(v_incoming -> 'cardOutcomes')
         and v_existing_quality >= v_incoming_quality
       ) then
      v_result := pg_catalog.jsonb_set(v_result, '{cardOutcomes}', v_existing -> 'cardOutcomes', true);
    else
      v_result := pg_catalog.jsonb_set(v_result, '{cardOutcomes}', v_incoming -> 'cardOutcomes', true);
    end if;
  end if;

  if pg_catalog.jsonb_typeof(v_existing -> 'cardAttempts') = 'array'
     and pg_catalog.jsonb_typeof(v_incoming -> 'cardAttempts') = 'array' then
    if pg_catalog.jsonb_array_length(v_existing -> 'cardAttempts')
         > pg_catalog.jsonb_array_length(v_incoming -> 'cardAttempts')
       or (
         pg_catalog.jsonb_array_length(v_existing -> 'cardAttempts')
           = pg_catalog.jsonb_array_length(v_incoming -> 'cardAttempts')
         and v_existing_quality >= v_incoming_quality
       ) then
      v_result := pg_catalog.jsonb_set(v_result, '{cardAttempts}', v_existing -> 'cardAttempts', true);
    else
      v_result := pg_catalog.jsonb_set(v_result, '{cardAttempts}', v_incoming -> 'cardAttempts', true);
    end if;
  end if;

  -- These fields identify an existing attempt and may not be rewritten by a stale tab.
  if v_existing ? 'id' then
    v_result := pg_catalog.jsonb_set(v_result, '{id}', v_existing -> 'id', true);
  end if;
  if v_existing ? 'deckId' then
    v_result := pg_catalog.jsonb_set(v_result, '{deckId}', v_existing -> 'deckId', true);
  end if;
  if v_existing ? 'startedAt' then
    v_result := pg_catalog.jsonb_set(v_result, '{startedAt}', v_existing -> 'startedAt', true);
  end if;

  return v_result;
end;
$$;

create or replace function flashcard_integrity.merge_attempt_arrays(
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
      case when pg_catalog.jsonb_typeof(p_existing) = 'array' then p_existing else '[]'::jsonb end as existing_value,
      case when pg_catalog.jsonb_typeof(p_incoming) = 'array' then p_incoming else '[]'::jsonb end as incoming_value
  ),
  existing_items as (
    select
      flashcard_integrity.attempt_key(item) as attempt_id,
      item,
      ordinal::bigint as position,
      pg_catalog.row_number() over (
        partition by flashcard_integrity.attempt_key(item)
        order by
          flashcard_integrity.attempt_completed_score(item) desc,
          flashcard_integrity.attempt_answered_score(item) desc,
          flashcard_integrity.attempt_updated_score(item) desc,
          flashcard_integrity.safe_nonnegative_bigint(item, 'durationMs') desc,
          ordinal desc
      ) as winner_rank
    from normalized
    cross join lateral pg_catalog.jsonb_array_elements(existing_value) with ordinality as rows(item, ordinal)
    where pg_catalog.jsonb_typeof(item) = 'object'
  ),
  incoming_items as (
    select
      flashcard_integrity.attempt_key(item) as attempt_id,
      item,
      ordinal::bigint as position,
      pg_catalog.row_number() over (
        partition by flashcard_integrity.attempt_key(item)
        order by
          flashcard_integrity.attempt_completed_score(item) desc,
          flashcard_integrity.attempt_answered_score(item) desc,
          flashcard_integrity.attempt_updated_score(item) desc,
          flashcard_integrity.safe_nonnegative_bigint(item, 'durationMs') desc,
          ordinal desc
      ) as winner_rank
    from normalized
    cross join lateral pg_catalog.jsonb_array_elements(incoming_value) with ordinality as rows(item, ordinal)
    where pg_catalog.jsonb_typeof(item) = 'object'
  ),
  winners as (
    select
      coalesce(e.attempt_id, i.attempt_id) as attempt_id,
      flashcard_integrity.merge_attempt_objects(e.item, i.item) as item,
      coalesce(e.position, 1000000000::bigint + i.position) as position
    from (select * from existing_items where winner_rank = 1) e
    full join (select * from incoming_items where winner_rank = 1) i using (attempt_id)
  )
  select coalesce(
    pg_catalog.jsonb_agg(item order by position, attempt_id),
    '[]'::jsonb
  )
  from winners;
$$;

create or replace function flashcard_integrity.missing_attempt_count(
  p_existing jsonb,
  p_incoming jsonb
)
returns bigint
language sql
immutable
set search_path = ''
as $$
  with existing_keys as (
    select distinct flashcard_integrity.attempt_key(item) as attempt_id
    from pg_catalog.jsonb_array_elements(
      case when pg_catalog.jsonb_typeof(p_existing) = 'array' then p_existing else '[]'::jsonb end
    ) entries(item)
    where pg_catalog.jsonb_typeof(item) = 'object'
  ),
  incoming_keys as (
    select distinct flashcard_integrity.attempt_key(item) as attempt_id
    from pg_catalog.jsonb_array_elements(
      case when pg_catalog.jsonb_typeof(p_incoming) = 'array' then p_incoming else '[]'::jsonb end
    ) entries(item)
    where pg_catalog.jsonb_typeof(item) = 'object'
  )
  select pg_catalog.count(*)
  from existing_keys e
  where not exists (
    select 1 from incoming_keys i where i.attempt_id = e.attempt_id
  );
$$;

create or replace function flashcard_integrity.missing_top_level_member_count(
  p_existing jsonb,
  p_incoming jsonb
)
returns bigint
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_existing_type text := pg_catalog.jsonb_typeof(p_existing);
  v_incoming_type text := pg_catalog.jsonb_typeof(p_incoming);
  v_missing bigint := 0;
begin
  if v_existing_type = 'object' and v_incoming_type = 'object' then
    select pg_catalog.count(*)
    into v_missing
    from pg_catalog.jsonb_object_keys(p_existing) existing_key(key_name)
    where not (p_incoming ? existing_key.key_name);
    return v_missing;
  end if;

  if v_existing_type = 'array' and v_incoming_type = 'array' then
    return greatest(
      pg_catalog.jsonb_array_length(p_existing)
        - pg_catalog.jsonb_array_length(p_incoming),
      0
    )::bigint;
  end if;

  return 0;
end;
$$;
create or replace function flashcard_integrity.attempt_metrics(p_attempt jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'answered', flashcard_integrity.attempt_answered_score(p_attempt),
    'durationMs', flashcard_integrity.safe_nonnegative_bigint(p_attempt, 'durationMs'),
    'completed', flashcard_integrity.attempt_completed_score(p_attempt) = 1,
    'updatedAt', flashcard_integrity.attempt_updated_score(p_attempt),
    'bytes', pg_catalog.octet_length(p_attempt::text)
  );
$$;

create or replace function flashcard_integrity.upsert_attempt_record(
  p_student_id uuid,
  p_attempt jsonb,
  p_request_id uuid default null,
  p_actor_kind text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt_id text;
  v_existing flashcard_integrity.attempt_records%rowtype;
  v_merged jsonb;
  v_checksum text;
  v_revision bigint;
  v_completed_at bigint;
begin
  if p_student_id is null or pg_catalog.jsonb_typeof(p_attempt) <> 'object' then
    return;
  end if;

  v_attempt_id := flashcard_integrity.attempt_key(p_attempt);
  if nullif(pg_catalog.btrim(v_attempt_id), '') is null then
    return;
  end if;

  -- Protect the first-insert path as well as updates. The parent state row normally
  -- serializes writes, but this lock also covers repair/backfill calls made directly.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_student_id::text || ':attempt:' || v_attempt_id, 0)
  );

  select *
  into v_existing
  from flashcard_integrity.attempt_records
  where student_id = p_student_id
    and attempt_id = v_attempt_id
  for update;

  if found then
    v_merged := flashcard_integrity.merge_attempt_objects(v_existing.payload, p_attempt);
    v_checksum := flashcard_integrity.jsonb_checksum(v_merged);
    if v_checksum = v_existing.payload_checksum then
      return;
    end if;
    v_revision := v_existing.revision + 1;
  else
    v_merged := flashcard_integrity.merge_attempt_objects('{}'::jsonb, p_attempt);
    v_checksum := flashcard_integrity.jsonb_checksum(v_merged);
    v_revision := 1;
  end if;

  v_completed_at := flashcard_integrity.safe_nonnegative_bigint(v_merged, 'completedAt');

  insert into flashcard_integrity.attempt_records as records (
    student_id,
    attempt_id,
    payload,
    payload_checksum,
    revision,
    deck_id,
    started_at_ms,
    answered_count,
    duration_ms,
    completed,
    completed_at_ms,
    created_at,
    updated_at
  )
  values (
    p_student_id,
    v_attempt_id,
    v_merged,
    v_checksum,
    v_revision,
    coalesce(v_merged ->> 'deckId', ''),
    flashcard_integrity.safe_nonnegative_bigint(v_merged, 'startedAt'),
    flashcard_integrity.attempt_answered_score(v_merged),
    flashcard_integrity.safe_nonnegative_bigint(v_merged, 'durationMs'),
    flashcard_integrity.attempt_completed_score(v_merged) = 1,
    case when v_completed_at > 0 then v_completed_at else null end,
    coalesce(v_existing.created_at, now()),
    now()
  )
  on conflict (student_id, attempt_id) do update
  set payload = excluded.payload,
      payload_checksum = excluded.payload_checksum,
      revision = excluded.revision,
      deck_id = excluded.deck_id,
      started_at_ms = excluded.started_at_ms,
      answered_count = excluded.answered_count,
      duration_ms = excluded.duration_ms,
      completed = excluded.completed,
      completed_at_ms = excluded.completed_at_ms,
      updated_at = now();

  insert into flashcard_integrity.attempt_mutations (
    student_id,
    attempt_id,
    revision_before,
    revision_after,
    before_payload,
    before_checksum,
    after_checksum,
    before_metrics,
    after_metrics,
    request_id,
    actor_kind
  )
  values (
    p_student_id,
    v_attempt_id,
    case when v_existing.attempt_id is null then null else v_existing.revision end,
    v_revision,
    case when v_existing.attempt_id is null then null else v_existing.payload end,
    case when v_existing.attempt_id is null then null else v_existing.payload_checksum end,
    v_checksum,
    case when v_existing.attempt_id is null then '{}'::jsonb else flashcard_integrity.attempt_metrics(v_existing.payload) end,
    flashcard_integrity.attempt_metrics(v_merged),
    p_request_id,
    coalesce(nullif(p_actor_kind, ''), flashcard_integrity.current_actor_kind())
  )
  on conflict (student_id, attempt_id, revision_after) do nothing;
end;
$$;

create or replace function flashcard_integrity.sync_attempt_records(
  p_student_id uuid,
  p_attempts jsonb,
  p_request_id uuid default null,
  p_actor_kind text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt jsonb;
begin
  if p_student_id is null or pg_catalog.jsonb_typeof(p_attempts) <> 'array' then
    return;
  end if;

  for v_attempt in
    select item
    from pg_catalog.jsonb_array_elements(p_attempts) entries(item)
    where pg_catalog.jsonb_typeof(item) = 'object'
  loop
    perform flashcard_integrity.upsert_attempt_record(
      p_student_id,
      v_attempt,
      p_request_id,
      p_actor_kind
    );
  end loop;
end;
$$;

commit;
