-- EdmundEducation Writing Practice: durable, append-only attempt history.
--
-- Apply supabase-writing-accounts.sql first. This migration intentionally keeps
-- the existing writing_student_state table for bookmarks and mastery, while
-- moving Writing Practice attempts into independently addressable rows.
-- Re-running this file is safe.

begin;

do $$
begin
  if to_regclass('public.writing_student_accounts') is null then
    raise exception 'Missing dependency: public.writing_student_accounts';
  end if;

  if to_regprocedure('public._writing_admin_ok(text,text)') is null then
    raise exception 'Missing dependency: public._writing_admin_ok(text,text)';
  end if;
end;
$$;

-- Keep malformed, forged, or unexpectedly large client payloads out of the
-- append-only history. Unknown optional keys remain allowed for forward
-- compatibility, while the fields used for identity and aggregation are
-- strictly bounded.
create or replace function public._writing_practice_attempt_valid(p_attempt jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_total integer;
  v_correct integer;
  v_round integer;
  v_mistakes integer;
  v_created_at_ms numeric;
begin
  if p_attempt is null
    or pg_catalog.jsonb_typeof(p_attempt) <> 'object'
    or pg_catalog.octet_length(p_attempt::text) > 524288
    or not (p_attempt ?& array['id', 'exerciseId', 'createdAt', 'total', 'correct', 'round'])
    or pg_catalog.jsonb_typeof(p_attempt -> 'id') <> 'string'
    or p_attempt ->> 'id' <> pg_catalog.btrim(p_attempt ->> 'id')
    or pg_catalog.char_length(p_attempt ->> 'id') not between 1 and 240
    or p_attempt ->> 'id' ~ '[[:cntrl:]]'
    or pg_catalog.jsonb_typeof(p_attempt -> 'exerciseId') <> 'string'
    or p_attempt ->> 'exerciseId' <> pg_catalog.btrim(p_attempt ->> 'exerciseId')
    or pg_catalog.char_length(p_attempt ->> 'exerciseId') not between 1 and 180
    or p_attempt ->> 'exerciseId' ~ '[[:cntrl:]]'
    or pg_catalog.jsonb_typeof(p_attempt -> 'createdAt') not in ('number', 'string')
    or coalesce(p_attempt ->> 'createdAt', '') !~ '^[0-9]{12,13}$'
    or pg_catalog.jsonb_typeof(p_attempt -> 'total') not in ('number', 'string')
    or coalesce(p_attempt ->> 'total', '') !~ '^[0-9]{1,4}$'
    or pg_catalog.jsonb_typeof(p_attempt -> 'correct') not in ('number', 'string')
    or coalesce(p_attempt ->> 'correct', '') !~ '^[0-9]{1,4}$'
    or pg_catalog.jsonb_typeof(p_attempt -> 'round') not in ('number', 'string')
    or coalesce(p_attempt ->> 'round', '') !~ '^[0-9]{1,4}$'
  then
    return false;
  end if;

  v_created_at_ms := (p_attempt ->> 'createdAt')::numeric;
  v_total := (p_attempt ->> 'total')::integer;
  v_correct := (p_attempt ->> 'correct')::integer;
  v_round := (p_attempt ->> 'round')::integer;

  if v_created_at_ms < 1577836800000
    or v_created_at_ms > 7258118400000
    or v_total not between 0 and 5000
    or v_correct not between 0 and v_total
    or v_round not between 1 and 1000
  then
    return false;
  end if;

  if p_attempt ? 'schemaVersion'
    and (
      pg_catalog.jsonb_typeof(p_attempt -> 'schemaVersion') not in ('number', 'string')
      or coalesce(p_attempt ->> 'schemaVersion', '') !~ '^[1-9][0-9]{0,2}$'
    )
  then
    return false;
  end if;

  if p_attempt ? 'exerciseTitle'
    and (
      pg_catalog.jsonb_typeof(p_attempt -> 'exerciseTitle') <> 'string'
      or pg_catalog.char_length(p_attempt ->> 'exerciseTitle') > 500
      or p_attempt ->> 'exerciseTitle' ~ '[[:cntrl:]]'
    )
  then
    return false;
  end if;

  if p_attempt ? 'mistakeDetails'
    and (
      pg_catalog.jsonb_typeof(p_attempt -> 'mistakeDetails') <> 'array'
      or pg_catalog.jsonb_array_length(p_attempt -> 'mistakeDetails') > 5000
    )
  then
    return false;
  end if;

  if p_attempt ? 'mistakes' then
    if pg_catalog.jsonb_typeof(p_attempt -> 'mistakes') = 'array' then
      v_mistakes := pg_catalog.jsonb_array_length(p_attempt -> 'mistakes');
    elsif pg_catalog.jsonb_typeof(p_attempt -> 'mistakes') in ('number', 'string')
      and coalesce(p_attempt ->> 'mistakes', '') ~ '^[0-9]{1,4}$'
    then
      v_mistakes := (p_attempt ->> 'mistakes')::integer;
    else
      return false;
    end if;

    if v_mistakes <> v_total - v_correct then
      return false;
    end if;
  end if;

  if p_attempt ? 'mistakeDetails'
    and pg_catalog.jsonb_array_length(p_attempt -> 'mistakeDetails') <> v_total - v_correct
  then
    return false;
  end if;

  if p_attempt ? 'completed'
    and (
      pg_catalog.jsonb_typeof(p_attempt -> 'completed') <> 'boolean'
      or (p_attempt ->> 'completed')::boolean <> (v_correct = v_total)
    )
  then
    return false;
  end if;

  return true;
exception
  when numeric_value_out_of_range or invalid_text_representation then
    return false;
end;
$$;

create table if not exists public.writing_practice_attempts (
  student_id uuid not null
    references public.writing_student_accounts(id) on delete cascade,
  attempt_id text not null,
  exercise_id text not null,
  total_count integer not null,
  correct_count integer not null,
  round_number integer not null,
  attempt jsonb not null,
  created_at timestamptz not null,
  stored_at timestamptz not null default now(),
  primary key (student_id, attempt_id),
  check (attempt_id = pg_catalog.btrim(attempt_id)),
  check (pg_catalog.char_length(attempt_id) between 1 and 240),
  check (attempt_id !~ '[[:cntrl:]]'),
  check (exercise_id = pg_catalog.btrim(exercise_id)),
  check (pg_catalog.char_length(exercise_id) between 1 and 180),
  check (exercise_id !~ '[[:cntrl:]]'),
  check (total_count between 0 and 5000),
  check (correct_count between 0 and total_count),
  check (round_number between 1 and 1000),
  check (created_at >= timestamptz '2020-01-01 00:00:00+00'),
  check (public._writing_practice_attempt_valid(attempt)),
  check (attempt ->> 'id' = attempt_id),
  check (attempt ->> 'exerciseId' = exercise_id),
  check ((attempt ->> 'total')::integer = total_count),
  check ((attempt ->> 'correct')::integer = correct_count),
  check ((attempt ->> 'round')::integer = round_number)
);

create index if not exists writing_practice_attempts_student_history_idx
  on public.writing_practice_attempts (student_id, created_at desc, attempt_id desc);

create index if not exists writing_practice_attempts_student_exercise_idx
  on public.writing_practice_attempts
    (student_id, exercise_id, created_at desc, attempt_id desc);

-- A reset barrier prevents an offline or stale device from re-appending an
-- attempt that existed before the user reset an exercise. The barrier is kept
-- even after the matching attempt rows are deleted.
create table if not exists public.writing_practice_attempt_resets (
  student_id uuid not null
    references public.writing_student_accounts(id) on delete cascade,
  exercise_id text not null,
  reset_at timestamptz not null,
  primary key (student_id, exercise_id),
  check (exercise_id = pg_catalog.btrim(exercise_id)),
  check (pg_catalog.char_length(exercise_id) between 1 and 180),
  check (exercise_id !~ '[[:cntrl:]]')
);

alter table public.writing_practice_attempts enable row level security;
alter table public.writing_practice_attempt_resets enable row level security;

-- No permissive policies are created. Browser clients can reach these rows
-- only through the credential-checking SECURITY DEFINER functions below.
revoke all on table public.writing_practice_attempts
  from public, anon, authenticated, service_role;
revoke all on table public.writing_practice_attempt_resets
  from public, anon, authenticated, service_role;

-- Import the old combined JSON state when it exists. This is deliberately
-- non-destructive and idempotent. Reset barriers are honored, so rerunning the
-- migration cannot resurrect attempts that were cleared after the first run.
do $$
declare
  v_row record;
  v_created_at timestamptz;
begin
  if to_regclass('public.writing_student_state') is null then
    return;
  end if;

  for v_row in execute $legacy$
    select
      state.student_id,
      attempt_row.attempt
    from public.writing_student_state state
    cross join lateral pg_catalog.jsonb_array_elements(
      case
        when pg_catalog.jsonb_typeof(state.value) = 'array' then state.value
        when pg_catalog.jsonb_typeof(state.value -> 'attempts') = 'array'
          then state.value -> 'attempts'
        else '[]'::jsonb
      end
    ) as attempt_row(attempt)
    where state.key = 'writing-attempts-v1'
  $legacy$
  loop
    if public._writing_practice_attempt_valid(v_row.attempt) then
      v_created_at := pg_catalog.to_timestamp(
        (((v_row.attempt ->> 'createdAt')::numeric) / 1000.0)::double precision
      );

      if v_created_at <= pg_catalog.clock_timestamp() + interval '1 day'
        and not exists (
          select 1
          from public.writing_practice_attempt_resets reset_row
          where reset_row.student_id = v_row.student_id
            and reset_row.exercise_id = v_row.attempt ->> 'exerciseId'
            and v_created_at <= reset_row.reset_at
        )
      then
        insert into public.writing_practice_attempts (
          student_id,
          attempt_id,
          exercise_id,
          total_count,
          correct_count,
          round_number,
          attempt,
          created_at
        )
        values (
          v_row.student_id,
          v_row.attempt ->> 'id',
          v_row.attempt ->> 'exerciseId',
          (v_row.attempt ->> 'total')::integer,
          (v_row.attempt ->> 'correct')::integer,
          (v_row.attempt ->> 'round')::integer,
          v_row.attempt,
          v_created_at
        )
        on conflict (student_id, attempt_id) do nothing;
      end if;
    end if;
  end loop;
end;
$$;

create or replace function public._writing_practice_student_id(p_token uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select student.id
  from public.writing_student_accounts student
  where student.session_token = p_token
  limit 1;
$$;

create or replace function public._writing_practice_admin_student_id(
  p_admin_name text,
  p_admin_password text,
  p_student_name text
)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if not public._writing_admin_ok(p_admin_name, p_admin_password) then
    raise exception 'Invalid admin credentials' using errcode = '28000';
  end if;

  select student.id
  into v_student_id
  from public.writing_student_accounts student
  where student.name = pg_catalog.btrim(p_student_name)
  limit 1;

  if v_student_id is null then
    raise exception 'Writing student not found' using errcode = '23503';
  end if;

  return v_student_id;
end;
$$;

create or replace function public._writing_practice_append_attempt(
  p_student_id uuid,
  p_attempt jsonb
)
returns table (
  attempt_id text,
  attempt jsonb,
  created_at timestamptz,
  write_status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt_id text;
  v_exercise_id text;
  v_total integer;
  v_correct integer;
  v_round integer;
  v_created_at timestamptz;
  v_existing public.writing_practice_attempts%rowtype;
  v_inserted boolean := false;
  v_reset_at timestamptz;
begin
  if not exists (
    select 1
    from public.writing_student_accounts student
    where student.id = p_student_id
  ) then
    raise exception 'Writing student not found' using errcode = '23503';
  end if;

  if not public._writing_practice_attempt_valid(p_attempt) then
    raise exception 'Invalid Writing Practice attempt' using errcode = '22023';
  end if;

  v_attempt_id := p_attempt ->> 'id';
  v_exercise_id := p_attempt ->> 'exerciseId';
  v_total := (p_attempt ->> 'total')::integer;
  v_correct := (p_attempt ->> 'correct')::integer;
  v_round := (p_attempt ->> 'round')::integer;
  v_created_at := pg_catalog.to_timestamp(
    (((p_attempt ->> 'createdAt')::numeric) / 1000.0)::double precision
  );

  if v_created_at > pg_catalog.clock_timestamp() + interval '1 day' then
    raise exception 'Writing Practice attempt date is in the future'
      using errcode = '22023';
  end if;

  -- This single student-level lock serializes append and reset operations.
  -- It prevents an attempt racing a reset from surviving unpredictably.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'writing-practice-attempts:' || p_student_id::text,
      0
    )
  );

  select reset_row.reset_at
  into v_reset_at
  from public.writing_practice_attempt_resets reset_row
  where reset_row.student_id = p_student_id
    and reset_row.exercise_id = v_exercise_id;

  if v_reset_at is not null and v_created_at <= v_reset_at then
    return query
    select
      v_attempt_id,
      p_attempt,
      v_created_at,
      'ignored_reset'::text;
    return;
  end if;

  insert into public.writing_practice_attempts (
    student_id,
    attempt_id,
    exercise_id,
    total_count,
    correct_count,
    round_number,
    attempt,
    created_at
  )
  values (
    p_student_id,
    v_attempt_id,
    v_exercise_id,
    v_total,
    v_correct,
    v_round,
    p_attempt,
    v_created_at
  )
  on conflict (student_id, attempt_id) do nothing
  returning true into v_inserted;

  select attempt_row.*
  into v_existing
  from public.writing_practice_attempts attempt_row
  where attempt_row.student_id = p_student_id
    and attempt_row.attempt_id = v_attempt_id;

  if v_existing.student_id is null then
    raise exception 'Writing Practice attempt could not be stored';
  end if;

  -- First-write-wins for optional metadata. The legacy JSON-state import keeps
  -- fields such as mistakeDetails, while the new bounded browser cache stores a
  -- compact form of that same attempt. Treat those representations as the same
  -- immutable attempt when every identity/score field agrees.
  if v_existing.exercise_id <> v_exercise_id
    or v_existing.created_at <> v_created_at
    or v_existing.total_count <> v_total
    or v_existing.correct_count <> v_correct
    or v_existing.round_number <> v_round
  then
    raise exception 'Writing Practice attempt identifier conflict'
      using errcode = '23505';
  end if;

  return query
  select
    v_existing.attempt_id,
    v_existing.attempt,
    v_existing.created_at,
    case when v_inserted then 'inserted' else 'existing' end::text;
end;
$$;

create or replace function public._writing_practice_list_attempts(
  p_student_id uuid,
  p_limit integer,
  p_before_created_at timestamptz,
  p_before_attempt_id text
)
returns table (
  attempt_id text,
  attempt jsonb,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_limit is null
    or p_limit not between 1 and 500
    or ((p_before_created_at is null) <> (p_before_attempt_id is null))
    or (
      p_before_attempt_id is not null
      and (
        p_before_attempt_id <> pg_catalog.btrim(p_before_attempt_id)
        or pg_catalog.char_length(p_before_attempt_id) not between 1 and 240
        or p_before_attempt_id ~ '[[:cntrl:]]'
      )
    )
  then
    raise exception 'Invalid Writing Practice attempt page'
      using errcode = '22023';
  end if;

  return query
  select
    attempt_row.attempt_id,
    attempt_row.attempt,
    attempt_row.created_at
  from public.writing_practice_attempts attempt_row
  where attempt_row.student_id = p_student_id
    and (
      p_before_created_at is null
      or (attempt_row.created_at, attempt_row.attempt_id)
        < (p_before_created_at, p_before_attempt_id)
    )
  order by attempt_row.created_at desc, attempt_row.attempt_id desc
  limit p_limit;
end;
$$;

-- p_reset_at is captured by the client when the reset button is pressed, not
-- when this RPC eventually reaches the server. Only attempts at or before that
-- boundary are cleared. This preserves a new offline attempt created after the
-- reset even when its append request arrives before the queued reset request.
create or replace function public._writing_practice_delete_attempts_by_exercise(
  p_student_id uuid,
  p_exercise_ids text[],
  p_reset_at timestamptz
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_exercise_ids text[];
  v_deleted_count integer;
begin
  if p_exercise_ids is null
    or pg_catalog.cardinality(p_exercise_ids) not between 1 and 250
    or p_reset_at is null
    or p_reset_at < timestamptz '2020-01-01 00:00:00+00'
    or p_reset_at > pg_catalog.clock_timestamp() + interval '1 day'
    or exists (
      select 1
      from pg_catalog.unnest(p_exercise_ids) as item(exercise_id)
      where item.exercise_id is null
        or item.exercise_id <> pg_catalog.btrim(item.exercise_id)
        or pg_catalog.char_length(item.exercise_id) not between 1 and 180
        or item.exercise_id ~ '[[:cntrl:]]'
    )
  then
    raise exception 'Invalid Writing Practice exercise identifiers'
      using errcode = '22023';
  end if;

  select pg_catalog.array_agg(distinct item.exercise_id order by item.exercise_id)
  into v_exercise_ids
  from pg_catalog.unnest(p_exercise_ids) as item(exercise_id);

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'writing-practice-attempts:' || p_student_id::text,
      0
    )
  );

  insert into public.writing_practice_attempt_resets (
    student_id,
    exercise_id,
    reset_at
  )
  select p_student_id, exercise_id, p_reset_at
  from pg_catalog.unnest(v_exercise_ids) as item(exercise_id)
  on conflict (student_id, exercise_id) do update
  set reset_at = case
    when writing_practice_attempt_resets.reset_at >= excluded.reset_at
      then writing_practice_attempt_resets.reset_at
    else excluded.reset_at
  end;

  delete from public.writing_practice_attempts attempt_row
  where attempt_row.student_id = p_student_id
    and attempt_row.exercise_id = any(v_exercise_ids)
    and attempt_row.created_at <= p_reset_at;

  get diagnostics v_deleted_count = row_count;
  return v_deleted_count;
end;
$$;

create or replace function public.writing_student_append_attempt(
  p_token uuid,
  p_attempt jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_write_status text;
begin
  v_student_id := public._writing_practice_student_id(p_token);
  if v_student_id is null then
    raise exception 'Invalid writing student session' using errcode = '28000';
  end if;

  select result.write_status
  into v_write_status
  from public._writing_practice_append_attempt(v_student_id, p_attempt) result;

  return v_write_status;
end;
$$;

create or replace function public.writing_admin_append_student_attempt(
  p_admin_name text,
  p_admin_password text,
  p_student_name text,
  p_attempt jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_write_status text;
begin
  v_student_id := public._writing_practice_admin_student_id(
    p_admin_name,
    p_admin_password,
    p_student_name
  );

  select result.write_status
  into v_write_status
  from public._writing_practice_append_attempt(v_student_id, p_attempt) result;

  return v_write_status;
end;
$$;

-- Fetch the first page with both cursor arguments NULL. For each subsequent
-- page, pass the created_at and attempt_id from the previous page's final row.
-- Continue until fewer than p_limit rows are returned to aggregate all history.
create or replace function public.writing_student_list_attempts(
  p_token uuid,
  p_limit integer,
  p_before_created_at timestamptz,
  p_before_attempt_id text
)
returns table (
  attempt_id text,
  attempt jsonb,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  v_student_id := public._writing_practice_student_id(p_token);
  if v_student_id is null then
    raise exception 'Invalid writing student session' using errcode = '28000';
  end if;

  return query
  select result.attempt_id, result.attempt, result.created_at
  from public._writing_practice_list_attempts(
    v_student_id,
    p_limit,
    p_before_created_at,
    p_before_attempt_id
  ) result;
end;
$$;

create or replace function public.writing_admin_list_student_attempts(
  p_admin_name text,
  p_admin_password text,
  p_student_name text,
  p_limit integer,
  p_before_created_at timestamptz,
  p_before_attempt_id text
)
returns table (
  attempt_id text,
  attempt jsonb,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  v_student_id := public._writing_practice_admin_student_id(
    p_admin_name,
    p_admin_password,
    p_student_name
  );

  return query
  select result.attempt_id, result.attempt, result.created_at
  from public._writing_practice_list_attempts(
    v_student_id,
    p_limit,
    p_before_created_at,
    p_before_attempt_id
  ) result;
end;
$$;

create or replace function public.writing_student_delete_attempts_by_exercise(
  p_token uuid,
  p_exercise_ids text[],
  p_reset_at timestamptz
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  v_student_id := public._writing_practice_student_id(p_token);
  if v_student_id is null then
    raise exception 'Invalid writing student session' using errcode = '28000';
  end if;

  return public._writing_practice_delete_attempts_by_exercise(
    v_student_id,
    p_exercise_ids,
    p_reset_at
  );
end;
$$;

create or replace function public.writing_admin_delete_student_attempts_by_exercise(
  p_admin_name text,
  p_admin_password text,
  p_student_name text,
  p_exercise_ids text[],
  p_reset_at timestamptz
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  v_student_id := public._writing_practice_admin_student_id(
    p_admin_name,
    p_admin_password,
    p_student_name
  );

  return public._writing_practice_delete_attempts_by_exercise(
    v_student_id,
    p_exercise_ids,
    p_reset_at
  );
end;
$$;

-- PostgreSQL grants function execution to PUBLIC by default. Remove that
-- default from helpers and RPCs before granting only the six supported public
-- entry points to Supabase API roles.
revoke all on function public._writing_practice_attempt_valid(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._writing_practice_student_id(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public._writing_practice_admin_student_id(text, text, text)
  from public, anon, authenticated, service_role;
revoke all on function public._writing_practice_append_attempt(uuid, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._writing_practice_list_attempts(
  uuid, integer, timestamptz, text
)
  from public, anon, authenticated, service_role;
revoke all on function public._writing_practice_delete_attempts_by_exercise(
  uuid, text[], timestamptz
)
  from public, anon, authenticated, service_role;

revoke all on function public.writing_student_append_attempt(uuid, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_admin_append_student_attempt(text, text, text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_student_list_attempts(
  uuid, integer, timestamptz, text
)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_admin_list_student_attempts(
  text, text, text, integer, timestamptz, text
)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_student_delete_attempts_by_exercise(
  uuid, text[], timestamptz
)
  from public, anon, authenticated, service_role;
revoke all on function public.writing_admin_delete_student_attempts_by_exercise(
  text, text, text, text[], timestamptz
)
  from public, anon, authenticated, service_role;

grant execute on function public.writing_student_append_attempt(uuid, jsonb)
  to anon, authenticated, service_role;
grant execute on function public.writing_admin_append_student_attempt(text, text, text, jsonb)
  to anon, authenticated, service_role;
grant execute on function public.writing_student_list_attempts(
  uuid, integer, timestamptz, text
)
  to anon, authenticated, service_role;
grant execute on function public.writing_admin_list_student_attempts(
  text, text, text, integer, timestamptz, text
)
  to anon, authenticated, service_role;
grant execute on function public.writing_student_delete_attempts_by_exercise(
  uuid, text[], timestamptz
)
  to anon, authenticated, service_role;
grant execute on function public.writing_admin_delete_student_attempts_by_exercise(
  text, text, text, text[], timestamptz
)
  to anon, authenticated, service_role;

comment on table public.writing_practice_attempts is
  'Immutable, one-row-per-attempt Writing Practice history.';
comment on table public.writing_practice_attempt_resets is
  'Per-student exercise reset barriers that prevent stale attempt resurrection.';
comment on function public.writing_student_append_attempt(uuid, jsonb) is
  'Idempotently appends one attempt and returns inserted, existing, or ignored_reset.';
comment on function public.writing_student_list_attempts(
  uuid, integer, timestamptz, text
) is
  'Keyset-paginated Writing Practice history; loop pages to aggregate all rows.';
comment on function public.writing_student_delete_attempts_by_exercise(
  uuid, text[], timestamptz
) is
  'Clears attempts at or before the client-captured reset action time and installs per-exercise reset barriers.';

notify pgrst, 'reload schema';

commit;
