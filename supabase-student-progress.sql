-- EdmundEducation unified student progress portal.
--
-- Apply the source-system migrations first, including
-- supabase-writing-submission-enhancements.sql. This migration adds no copied
-- progress table: every response is one transactionally consistent snapshot
-- over the canonical source records, so the portal cannot drift away from the
-- dashboards inside the individual systems.

begin;

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if to_regclass('public.flashcard_students') is null
    or to_regclass('public.flashcard_student_sessions') is null
    or to_regclass('public.flashcard_student_state') is null
    or to_regclass('public.writing_student_accounts') is null
    or to_regclass('public.writing_practice_attempts') is null
    or to_regclass('public.sentence_structure_attempts') is null
    or to_regclass('public.speaking_recording_attempts') is null
    or to_regclass('public.phrasal_verb_system_attempts') is null
    or to_regclass('public.idiom_system_attempts') is null
    or to_regclass('public.proverb_system_attempts') is null
    or to_regclass('public.common_expression_question_completions') is null
    or to_regclass('public.common_expression_time_activity_days') is null
    or to_regclass('public.writing_submissions') is null
  then
    raise exception 'Apply every source-system migration before supabase-student-progress.sql';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_attribute attribute
    where attribute.attrelid = 'public.writing_submissions'::regclass
      and attribute.attname = 'duration_seconds'
      and not attribute.attisdropped
  ) then
    raise exception 'Apply supabase-writing-submission-enhancements.sql first';
  end if;
end;
$$;

-- A Writing Practice profile name is a logical account key used only when an
-- older profile predates the shared UUID. Prevent case/spacing variants from
-- producing ambiguous dashboard ownership in future.
create unique index if not exists writing_student_accounts_name_normalized_idx
  on public.writing_student_accounts (
    pg_catalog.lower(pg_catalog.btrim(name))
  );

-- Canonical progress events for the newer learning-portal family. The portals
-- currently have no exercises, so this table is empty on first release; future
-- content can record a stable event key without changing the unified dashboard
-- schema or creating a second copy of its progress data.
create table if not exists public.learning_portal_progress_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  system_key text not null,
  event_key text not null,
  activity_count integer not null default 0,
  duration_ms bigint not null default 0,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (system_key in (
    'quotes', 'grammar', 'collocation', 'irregular-verb',
    'thematic-vocabulary', 'part-of-speech', 'synonyms',
    'error-identifier', 'spelling', 'reading-logic',
    'translation-skills', 'business-school', 'complex-questions',
    'english-humour-speaking', 'english-humour-writing',
    'false-friends'
  )),
  check (event_key = pg_catalog.btrim(event_key)),
  check (pg_catalog.char_length(event_key) between 1 and 240),
  check (event_key !~ '[[:cntrl:]]'),
  check (activity_count between 0 and 100000),
  check (duration_ms between 0 and 86400000),
  unique (student_id, system_key, event_key)
);

create index if not exists learning_portal_progress_student_system_date_idx
  on public.learning_portal_progress_events (student_id, system_key, occurred_at);

alter table public.learning_portal_progress_events enable row level security;
revoke all on table public.learning_portal_progress_events
  from public, anon, authenticated, service_role;

create table if not exists public.student_progress_admin_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (name = pg_catalog.btrim(name)),
  check (pg_catalog.char_length(name) between 1 and 100),
  check (name !~ '[[:cntrl:]]'),
  check (password_hash ~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$')
);

create unique index if not exists student_progress_admin_name_lower_idx
  on public.student_progress_admin_accounts (pg_catalog.lower(name));

create table if not exists public.student_progress_admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null
    references public.student_progress_admin_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (pg_catalog.octet_length(token_hash) = 32),
  check (expires_at > created_at)
);

create index if not exists student_progress_admin_sessions_expires_idx
  on public.student_progress_admin_sessions (expires_at);

alter table public.student_progress_admin_accounts enable row level security;
alter table public.student_progress_admin_sessions enable row level security;

revoke all on table public.student_progress_admin_accounts
  from public, anon, authenticated, service_role;
revoke all on table public.student_progress_admin_sessions
  from public, anon, authenticated, service_role;

create or replace function public._student_progress_revoke_admin_sessions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.password_hash is distinct from new.password_hash
    or old.is_active is distinct from new.is_active
  then
    delete from public.student_progress_admin_sessions session_row
    where session_row.admin_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists student_progress_admin_security_change
  on public.student_progress_admin_accounts;
create trigger student_progress_admin_security_change
after update of password_hash, is_active on public.student_progress_admin_accounts
for each row execute function public._student_progress_revoke_admin_sessions();

create or replace function public._student_progress_admin_id(p_admin_token uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select session_row.admin_id
  from public.student_progress_admin_sessions session_row
  join public.student_progress_admin_accounts account
    on account.id = session_row.admin_id
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session_row.expires_at > pg_catalog.now()
    and account.is_active
  limit 1;
$$;

-- Owner-only provisioning. Generate a cost-12 bcrypt hash locally and pass
-- only that one-way hash. This function intentionally has no service_role
-- grant, so neither the public site nor its Worker can provision an account.
create or replace function public.student_progress_provision_admin(
  p_name text,
  p_bcrypt_hash text
)
returns table (admin_id uuid, admin_name text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := pg_catalog.btrim(coalesce(p_name, ''));
  v_admin_id uuid;
begin
  if pg_catalog.char_length(v_name) not between 1 and 100
    or v_name ~ '[[:cntrl:]]'
    or coalesce(p_bcrypt_hash, '')
      !~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$'
  then
    raise exception 'A valid name and cost-12 bcrypt hash are required'
      using errcode = '22023';
  end if;

  select account.id
  into v_admin_id
  from public.student_progress_admin_accounts account
  where pg_catalog.lower(account.name) = pg_catalog.lower(v_name)
  limit 1
  for update;

  if v_admin_id is null then
    insert into public.student_progress_admin_accounts (
      name,
      password_hash,
      is_active
    ) values (v_name, p_bcrypt_hash, true)
    returning id into v_admin_id;
  else
    update public.student_progress_admin_accounts account
    set name = v_name,
        password_hash = p_bcrypt_hash,
        is_active = true,
        updated_at = pg_catalog.now()
    where account.id = v_admin_id;
  end if;

  delete from public.student_progress_admin_sessions session_row
  where session_row.admin_id = v_admin_id;

  return query
  select account.id, account.name
  from public.student_progress_admin_accounts account
  where account.id = v_admin_id;
end;
$$;

create or replace function public.student_progress_admin_login(
  p_name text,
  p_password text
)
returns table (
  admin_id uuid,
  admin_token uuid,
  name text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_name, '')));
  v_admin public.student_progress_admin_accounts%rowtype;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_token uuid := gen_random_uuid();
  v_expires_at timestamptz := v_now + interval '8 hours';
begin
  if pg_catalog.char_length(v_name) not between 1 and 100
    or p_password is null
    or pg_catalog.char_length(p_password) not between 1 and 200
  then
    return;
  end if;

  select account.*
  into v_admin
  from public.student_progress_admin_accounts account
  where pg_catalog.lower(account.name) = v_name
  limit 1
  for update;

  if not found then
    perform extensions.crypt(p_password, extensions.gen_salt('bf', 12));
    return;
  end if;

  if not v_admin.is_active
    or v_admin.password_hash <> extensions.crypt(p_password, v_admin.password_hash)
  then
    return;
  end if;

  delete from public.student_progress_admin_sessions session_row
  where session_row.expires_at <= v_now;

  insert into public.student_progress_admin_sessions (
    token_hash,
    admin_id,
    created_at,
    expires_at
  ) values (
    extensions.digest(v_token::text, 'sha256'),
    v_admin.id,
    v_now,
    v_expires_at
  );

  return query select v_admin.id, v_token, v_admin.name, v_expires_at;
end;
$$;

create or replace function public.student_progress_admin_me(p_admin_token uuid)
returns table (id uuid, name text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select account.id, account.name, session_row.expires_at
  from public.student_progress_admin_sessions session_row
  join public.student_progress_admin_accounts account
    on account.id = session_row.admin_id
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session_row.expires_at > pg_catalog.now()
    and account.is_active
  limit 1;
$$;

create or replace function public.student_progress_admin_logout(p_admin_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.student_progress_admin_sessions session_row
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256');
  return found;
end;
$$;

create or replace function public.student_progress_student_me(p_token uuid)
returns table (id uuid, name text, session_expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select student.id, student.name, session_row.expires_at
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student
    on student.id = session_row.student_id
  where session_row.token = p_token
    and session_row.expires_at > pg_catalog.now()
    and student.deleted_at is null
  limit 1;
$$;

create or replace function public.student_progress_admin_students(p_admin_token uuid)
returns table (id uuid, name text, created_at timestamptz, updated_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select student.id, student.name, student.created_at, student.updated_at
  from public.flashcard_students student
  where public._student_progress_admin_id(p_admin_token) is not null
    and student.deleted_at is null
  order by pg_catalog.lower(student.name), student.id;
$$;

-- Convert a bounded JSON number/string without ever throwing on malformed
-- legacy client data.
create or replace function public._student_progress_json_number(p_value jsonb)
returns numeric
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_text text;
  v_number numeric;
begin
  if p_value is null or pg_catalog.jsonb_typeof(p_value) not in ('number', 'string') then
    return null;
  end if;
  v_text := p_value #>> '{}';
  if v_text !~ '^-?[0-9]{1,16}([.][0-9]{1,6})?$' then
    return null;
  end if;
  v_number := v_text::numeric;
  if pg_catalog.abs(v_number) > 9007199254740991 then
    return null;
  end if;
  return v_number;
exception
  when numeric_value_out_of_range or invalid_text_representation then
    return null;
end;
$$;

-- Learning clients currently store submittedAt as an ISO string; older
-- payloads may contain epoch milliseconds. Parse either representation without
-- allowing malformed legacy JSON to abort the complete portal snapshot.
create or replace function public._student_progress_json_timestamptz(p_value jsonb)
returns timestamptz
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_number numeric;
  v_text text;
  v_timestamp timestamptz;
begin
  v_number := public._student_progress_json_number(p_value);
  if v_number between 1577836800000 and 7258118400000 then
    return pg_catalog.to_timestamp(v_number / 1000.0);
  end if;

  if p_value is null or pg_catalog.jsonb_typeof(p_value) <> 'string' then
    return null;
  end if;
  v_text := p_value #>> '{}';
  if v_text !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}([.][0-9]{1,6})?(Z|[+-][0-9]{2}:[0-9]{2})$' then
    return null;
  end if;
  v_timestamp := v_text::timestamptz;
  if v_timestamp < timestamptz '2020-01-01 00:00:00+00'
    or v_timestamp > timestamptz '2200-01-01 00:00:00+00'
  then
    return null;
  end if;
  return v_timestamp;
exception
  when datetime_field_overflow or invalid_datetime_format or invalid_text_representation then
    return null;
end;
$$;

create or replace function public._student_progress_learning_portal_source(
  p_student_id uuid,
  p_system_key text
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'activityDays', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date,
        'questions', day.questions
      ) order by day.activity_date)
      from (
        select
          (event.occurred_at at time zone 'Asia/Hong_Kong')::date as activity_date,
          pg_catalog.sum(event.activity_count)::bigint as questions
        from public.learning_portal_progress_events event
        where event.student_id = p_student_id
          and event.system_key = p_system_key
          and event.activity_count > 0
        group by 1
      ) day
    ), '[]'::jsonb),
    'timeDays', coalesce((
      select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date,
        'totalMs', day.total_ms
      ) order by day.activity_date)
      from (
        select
          (event.occurred_at at time zone 'Asia/Hong_Kong')::date as activity_date,
          pg_catalog.sum(event.duration_ms)::bigint as total_ms
        from public.learning_portal_progress_events event
        where event.student_id = p_student_id
          and event.system_key = p_system_key
          and event.duration_ms > 0
        group by 1
      ) day
    ), '[]'::jsonb)
  );
$$;

-- One SQL statement builds the complete portal payload. PostgreSQL therefore
-- evaluates all dashboard systems against one MVCC snapshot.
create or replace function public._student_progress_snapshot(p_student_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
with
student_profile as (
  select student.id, student.name
  from public.flashcard_students student
  where student.id = p_student_id
    and student.deleted_at is null
  limit 1
),
flash_state as (
  select
    case
      when pg_catalog.jsonb_typeof(state.value) = 'array' then state.value
      when pg_catalog.jsonb_typeof(state.value -> 'attempts') = 'array' then state.value -> 'attempts'
      else '[]'::jsonb
    end as attempts
  from public.flashcard_student_state state
  where state.student_id = p_student_id
    and state.key = 'edmundFlashcardAttempts'
  limit 1
),
flash_attempts as (
  select
    attempt_ordinal::bigint as attempt_ordinal,
    attempt,
    coalesce(nullif(attempt ->> 'id', ''), 'attempt-' || attempt_ordinal::text) as attempt_id,
    coalesce(attempt ->> 'deckId', '') as deck_id,
    greatest(0, pg_catalog.floor(coalesce(public._student_progress_json_number(attempt -> 'green'), 0)))::bigint as aggregate_green,
    greatest(0, pg_catalog.floor(coalesce(public._student_progress_json_number(attempt -> 'red'), 0)))::bigint as aggregate_red,
    greatest(0, pg_catalog.floor(coalesce(public._student_progress_json_number(attempt -> 'answeredCount'), 0)))::bigint as answered_count,
    public._student_progress_json_number(
      coalesce(attempt -> 'updatedAt', attempt -> 'completedAt', attempt -> 'startedAt')
    ) as activity_at_ms,
    public._student_progress_json_number(
      coalesce(attempt -> 'completedAt', attempt -> 'updatedAt', attempt -> 'startedAt')
    ) as duration_at_ms,
    greatest(0, coalesce(public._student_progress_json_number(attempt -> 'durationMs'), 0))::bigint as duration_ms,
    greatest(0, pg_catalog.floor(coalesce(public._student_progress_json_number(attempt -> 'totalCards'), 0)))::bigint as total_cards
  from flash_state state
  cross join lateral pg_catalog.jsonb_array_elements(state.attempts)
    with ordinality as attempt_row(attempt, attempt_ordinal)
  cross join student_profile student
  where pg_catalog.jsonb_typeof(attempt) = 'object'
    and coalesce(nullif(attempt ->> 'studentName', ''), student.name) = student.name
),
flash_outcome_rows as (
  select
    attempt.attempt_ordinal,
    case
      when nullif(outcome ->> 'key', '') is not null then outcome ->> 'key'
      when public._student_progress_json_number(outcome -> 'index') is not null
        and public._student_progress_json_number(outcome -> 'index') >= 0
        and public._student_progress_json_number(outcome -> 'index') = pg_catalog.floor(public._student_progress_json_number(outcome -> 'index'))
        then coalesce(nullif(outcome ->> 'deckId', ''), attempt.deck_id)
          || '::' || pg_catalog.floor(public._student_progress_json_number(outcome -> 'index'))::text
      when nullif(pg_catalog.btrim(outcome ->> 'front'), '') is not null
        then coalesce(nullif(outcome ->> 'deckId', ''), attempt.deck_id)
          || '::front::' || pg_catalog.lower(pg_catalog.btrim(outcome ->> 'front'))
      else attempt.attempt_id || '::outcome::' || outcome_ordinal::text
    end as outcome_key,
    outcome ->> 'status' as status,
    coalesce(
      public._student_progress_json_number(outcome -> 'answeredAt'),
      public._student_progress_json_number(outcome -> 'updatedAt'),
      0
    ) as answered_at_ms,
    outcome_ordinal
  from flash_attempts attempt
  cross join lateral pg_catalog.jsonb_array_elements(
    case
      when pg_catalog.jsonb_typeof(attempt.attempt -> 'cardOutcomes') = 'array'
        then attempt.attempt -> 'cardOutcomes'
      else '[]'::jsonb
    end
  ) with ordinality as outcome_row(outcome, outcome_ordinal)
  where outcome ->> 'status' in ('green', 'red')
),
flash_final_outcomes as (
  select distinct on (row.attempt_ordinal, row.outcome_key)
    row.attempt_ordinal,
    row.outcome_key,
    row.status
  from flash_outcome_rows row
  order by row.attempt_ordinal, row.outcome_key, row.answered_at_ms desc, row.outcome_ordinal desc
),
flash_detail_counts as (
  select
    outcome.attempt_ordinal,
    pg_catalog.count(*)::bigint as detail_count,
    pg_catalog.count(*) filter (where outcome.status = 'green')::bigint as detail_green,
    pg_catalog.count(*) filter (where outcome.status = 'red')::bigint as detail_red
  from flash_final_outcomes outcome
  group by outcome.attempt_ordinal
),
flash_summaries as (
  select
    attempt.*,
    case
      when coalesce(detail.detail_count, 0) > 0
       and detail.detail_count >= greatest(attempt.answered_count, attempt.aggregate_green + attempt.aggregate_red)
        then detail.detail_green
      else attempt.aggregate_green
    end as green,
    case
      when coalesce(detail.detail_count, 0) > 0
       and detail.detail_count >= greatest(attempt.answered_count, attempt.aggregate_green + attempt.aggregate_red)
        then detail.detail_red
      else attempt.aggregate_red
    end as red
  from flash_attempts attempt
  left join flash_detail_counts detail
    on detail.attempt_ordinal = attempt.attempt_ordinal
),
flash_activity_days as (
  select
    (pg_catalog.to_timestamp(summary.activity_at_ms / 1000.0) at time zone 'Asia/Hong_Kong')::date as activity_date,
    pg_catalog.sum(summary.green)::bigint as green,
    pg_catalog.sum(summary.red)::bigint as red
  from flash_summaries summary
  where summary.activity_at_ms between 1577836800000 and 7258118400000
    and summary.green + summary.red > 0
  group by 1
),
flash_time_days as (
  select
    (pg_catalog.to_timestamp(summary.duration_at_ms / 1000.0) at time zone 'Asia/Hong_Kong')::date as activity_date,
    pg_catalog.sum(summary.duration_ms)::bigint as total_ms
  from flash_summaries summary
  where summary.duration_at_ms between 1577836800000 and 7258118400000
    and summary.duration_ms > 0
    and summary.total_cards > 0
  group by 1
),
writing_account as (
  select distinct account.id
  from public.writing_student_accounts account
  cross join student_profile student
  where account.id = student.id
     or pg_catalog.lower(pg_catalog.btrim(account.name)) = pg_catalog.lower(pg_catalog.btrim(student.name))
),
writing_practice_activity_days as (
  select
    (attempt.created_at at time zone 'Asia/Hong_Kong')::date as activity_date,
    pg_catalog.sum(attempt.total_count)::bigint as questions,
    pg_catalog.count(*)::bigint as attempts
  from public.writing_practice_attempts attempt
  join writing_account account on account.id = attempt.student_id
  group by 1
),
writing_practice_time_days as (
  select
    (attempt.created_at at time zone 'Asia/Hong_Kong')::date as activity_date,
    pg_catalog.sum(
      greatest(0, coalesce(public._student_progress_json_number(attempt.attempt -> 'durationMs'), 0))
    )::bigint as total_ms
  from public.writing_practice_attempts attempt
  join writing_account account on account.id = attempt.student_id
  where coalesce(public._student_progress_json_number(attempt.attempt -> 'durationMs'), 0) > 0
  group by 1
),
learning_attempts as (
  select 'sentenceStructure'::text as system_id, attempt.lesson_id, attempt.result,
         attempt.updated_at, attempt.completed_at, attempt.started_at, attempt.duration_ms
  from public.sentence_structure_attempts attempt where attempt.student_id = p_student_id
  union all
  select 'idioms', attempt.lesson_id, attempt.result,
         attempt.updated_at, attempt.completed_at, attempt.started_at, attempt.duration_ms
  from public.idiom_system_attempts attempt where attempt.student_id = p_student_id
  union all
  select 'proverbs', attempt.lesson_id, attempt.result,
         attempt.updated_at, attempt.completed_at, attempt.started_at, attempt.duration_ms
  from public.proverb_system_attempts attempt where attempt.student_id = p_student_id
  union all
  select 'phrasalVerbs', attempt.lesson_id, attempt.result,
         attempt.updated_at, attempt.completed_at, attempt.started_at, attempt.duration_ms
  from public.phrasal_verb_system_attempts attempt where attempt.student_id = p_student_id
),
learning_round_events as (
  select
    attempt.system_id,
    attempt.lesson_id,
    question_id,
    coalesce(
      public._student_progress_json_timestamptz(round_value -> 'submittedAt'),
      attempt.completed_at,
      attempt.updated_at,
      attempt.started_at
    ) as event_at
  from learning_attempts attempt
  cross join lateral pg_catalog.jsonb_array_elements(
    case when pg_catalog.jsonb_typeof(attempt.result -> 'rounds') = 'array'
      then attempt.result -> 'rounds' else '[]'::jsonb end
  ) as round_row(round_value)
  cross join lateral pg_catalog.jsonb_array_elements_text(
    case when pg_catalog.jsonb_typeof(round_value -> 'checkedIds') = 'array'
      then round_value -> 'checkedIds' else '[]'::jsonb end
  ) as question_row(question_id)
),
learning_fallback_events as (
  select
    attempt.system_id,
    attempt.lesson_id,
    question_id,
    coalesce(attempt.completed_at, attempt.updated_at, attempt.started_at) as event_at
  from learning_attempts attempt
  cross join lateral pg_catalog.jsonb_array_elements_text(
    case when pg_catalog.jsonb_typeof(attempt.result -> 'correctIds') = 'array'
      then attempt.result -> 'correctIds' else '[]'::jsonb end
  ) as question_row(question_id)
  where pg_catalog.jsonb_array_length(
    case when pg_catalog.jsonb_typeof(attempt.result -> 'rounds') = 'array'
      then attempt.result -> 'rounds' else '[]'::jsonb end
  ) = 0
),
learning_unique_questions as (
  select
    event.system_id,
    event.lesson_id,
    event.question_id,
    pg_catalog.min(event.event_at) as first_event_at
  from (
    select * from learning_round_events
    union all
    select * from learning_fallback_events
  ) event
  where nullif(event.question_id, '') is not null
  group by event.system_id, event.lesson_id, event.question_id
),
learning_activity_days as (
  select
    question.system_id,
    (question.first_event_at at time zone 'Asia/Hong_Kong')::date as activity_date,
    pg_catalog.count(*)::bigint as questions
  from learning_unique_questions question
  group by question.system_id, 2
),
learning_time_days as (
  select
    attempt.system_id,
    (coalesce(attempt.completed_at, attempt.updated_at, attempt.started_at)
      at time zone 'Asia/Hong_Kong')::date as activity_date,
    pg_catalog.sum(attempt.duration_ms)::bigint as total_ms
  from learning_attempts attempt
  where attempt.duration_ms > 0
  group by attempt.system_id, 2
),
speaking_activity_days as (
  select
    (attempt.created_at at time zone 'Asia/Hong_Kong')::date as activity_date,
    pg_catalog.count(*)::bigint as recordings
  from public.speaking_recording_attempts attempt
  where attempt.student_id = p_student_id
    and attempt.storage_state = 'ready'
  group by 1
),
speaking_time_days as (
  select
    (attempt.created_at at time zone 'Asia/Hong_Kong')::date as activity_date,
    pg_catalog.sum(attempt.duration_ms)::bigint as total_ms
  from public.speaking_recording_attempts attempt
  where attempt.student_id = p_student_id
    and attempt.storage_state = 'ready'
    and attempt.duration_ms > 0
  group by 1
),
common_expression_activity_days as (
  select
    completion.system_key,
    (completion.completed_at at time zone 'Asia/Hong_Kong')::date as activity_date,
    pg_catalog.count(*)::bigint as questions
  from public.common_expression_question_completions completion
  where completion.student_id = p_student_id
    and completion.system_key in (
      'speaking',
      'written',
      'rhetorical-speaking',
      'rhetorical-writing',
      'professional-message',
      'business-speaking'
    )
  group by completion.system_key, 2
),
common_expression_time_days as (
  select
    activity.system_key,
    activity.activity_date,
    pg_catalog.sum(activity.duration_ms)::bigint as total_ms
  from public.common_expression_time_activity_days activity
  where activity.student_id = p_student_id
    and activity.duration_ms > 0
    and activity.system_key in (
      'speaking',
      'written',
      'rhetorical-speaking',
      'rhetorical-writing',
      'professional-message',
      'business-speaking'
    )
  group by activity.system_key, activity.activity_date
),
-- Deliberately do not filter deleted_at: student deletion hides an article
-- from the archive but must not rewrite historical progress or timing.
writing_submission_days as (
  select
    (submission.submitted_at at time zone 'Asia/Hong_Kong')::date as activity_date,
    pg_catalog.count(*)::bigint as articles,
    pg_catalog.sum(submission.duration_seconds::bigint * 1000)::bigint as total_ms
  from public.writing_submissions submission
  where submission.student_id = p_student_id
  group by 1
),
sources_json as (
  select pg_catalog.jsonb_build_object(
    'flashcards', pg_catalog.jsonb_build_object(
      'activityDays', coalesce((
        select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
          'date', day.activity_date, 'total', day.green + day.red,
          'green', day.green, 'red', day.red
        ) order by day.activity_date) from flash_activity_days day
      ), '[]'::jsonb),
      'timeDays', coalesce((
        select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
          'date', day.activity_date, 'totalMs', day.total_ms
        ) order by day.activity_date) from flash_time_days day
      ), '[]'::jsonb)
    ),
    'writingPractice', pg_catalog.jsonb_build_object(
      'activityDays', coalesce((
        select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
          'date', day.activity_date, 'questions', day.questions, 'attempts', day.attempts
        ) order by day.activity_date) from writing_practice_activity_days day
      ), '[]'::jsonb),
      'timeDays', coalesce((
        select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
          'date', day.activity_date, 'totalMs', day.total_ms
        ) order by day.activity_date) from writing_practice_time_days day
      ), '[]'::jsonb)
    ),
    'sentenceStructure', pg_catalog.jsonb_build_object(
      'activityDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'questions', day.questions) order by day.activity_date)
        from learning_activity_days day where day.system_id = 'sentenceStructure'), '[]'::jsonb),
      'timeDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'totalMs', day.total_ms) order by day.activity_date)
        from learning_time_days day where day.system_id = 'sentenceStructure'), '[]'::jsonb)
    ),
    'speaking', pg_catalog.jsonb_build_object(
      'activityDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'recordings', day.recordings) order by day.activity_date)
        from speaking_activity_days day), '[]'::jsonb),
      'timeDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'totalMs', day.total_ms) order by day.activity_date)
        from speaking_time_days day), '[]'::jsonb)
    ),
    'phrasalVerbs', pg_catalog.jsonb_build_object(
      'activityDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'questions', day.questions) order by day.activity_date)
        from learning_activity_days day where day.system_id = 'phrasalVerbs'), '[]'::jsonb),
      'timeDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'totalMs', day.total_ms) order by day.activity_date)
        from learning_time_days day where day.system_id = 'phrasalVerbs'), '[]'::jsonb)
    ),
    'idioms', pg_catalog.jsonb_build_object(
      'activityDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'questions', day.questions) order by day.activity_date)
        from learning_activity_days day where day.system_id = 'idioms'), '[]'::jsonb),
      'timeDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'totalMs', day.total_ms) order by day.activity_date)
        from learning_time_days day where day.system_id = 'idioms'), '[]'::jsonb)
    ),
    'proverbs', pg_catalog.jsonb_build_object(
      'activityDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'questions', day.questions) order by day.activity_date)
        from learning_activity_days day where day.system_id = 'proverbs'), '[]'::jsonb),
      'timeDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'totalMs', day.total_ms) order by day.activity_date)
        from learning_time_days day where day.system_id = 'proverbs'), '[]'::jsonb)
    ),
    'commonExpressionSpeaking', pg_catalog.jsonb_build_object(
      'activityDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'questions', day.questions) order by day.activity_date)
        from common_expression_activity_days day where day.system_key = 'speaking'), '[]'::jsonb),
      'timeDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'totalMs', day.total_ms) order by day.activity_date)
        from common_expression_time_days day where day.system_key = 'speaking'), '[]'::jsonb)
    ),
    'commonExpressionWritten', pg_catalog.jsonb_build_object(
      'activityDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'questions', day.questions) order by day.activity_date)
        from common_expression_activity_days day where day.system_key = 'written'), '[]'::jsonb),
      'timeDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'totalMs', day.total_ms) order by day.activity_date)
        from common_expression_time_days day where day.system_key = 'written'), '[]'::jsonb)
    ),
    'commonExpressionRhetoricalSpeaking', pg_catalog.jsonb_build_object(
      'activityDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'questions', day.questions) order by day.activity_date)
        from common_expression_activity_days day where day.system_key = 'rhetorical-speaking'), '[]'::jsonb),
      'timeDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'totalMs', day.total_ms) order by day.activity_date)
        from common_expression_time_days day where day.system_key = 'rhetorical-speaking'), '[]'::jsonb)
    ),
    'commonExpressionRhetoricalWriting', pg_catalog.jsonb_build_object(
      'activityDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'questions', day.questions) order by day.activity_date)
        from common_expression_activity_days day where day.system_key = 'rhetorical-writing'), '[]'::jsonb),
      'timeDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'totalMs', day.total_ms) order by day.activity_date)
        from common_expression_time_days day where day.system_key = 'rhetorical-writing'), '[]'::jsonb)
    ),
    'commonExpressionProfessionalMessage', pg_catalog.jsonb_build_object(
      'activityDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'questions', day.questions) order by day.activity_date)
        from common_expression_activity_days day where day.system_key = 'professional-message'), '[]'::jsonb),
      'timeDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'totalMs', day.total_ms) order by day.activity_date)
        from common_expression_time_days day where day.system_key = 'professional-message'), '[]'::jsonb)
    ),
    'commonExpressionBusinessSpeaking', pg_catalog.jsonb_build_object(
      'activityDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'questions', day.questions) order by day.activity_date)
        from common_expression_activity_days day where day.system_key = 'business-speaking'), '[]'::jsonb),
      'timeDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'totalMs', day.total_ms) order by day.activity_date)
        from common_expression_time_days day where day.system_key = 'business-speaking'), '[]'::jsonb)
    ),
    'writingSubmission', pg_catalog.jsonb_build_object(
      'activityDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'articles', day.articles, 'totalMs', day.total_ms
      ) order by day.activity_date) from writing_submission_days day), '[]'::jsonb),
      'timeDays', coalesce((select pg_catalog.jsonb_agg(pg_catalog.jsonb_build_object(
        'date', day.activity_date, 'totalMs', day.total_ms
      ) order by day.activity_date) from writing_submission_days day where day.total_ms > 0), '[]'::jsonb)
    ),
    'quotes', public._student_progress_learning_portal_source(p_student_id, 'quotes'),
    'grammar', public._student_progress_learning_portal_source(p_student_id, 'grammar'),
    'collocation', public._student_progress_learning_portal_source(p_student_id, 'collocation'),
    'irregularVerb', public._student_progress_learning_portal_source(p_student_id, 'irregular-verb'),
    'thematicVocabulary', public._student_progress_learning_portal_source(p_student_id, 'thematic-vocabulary'),
    'partOfSpeech', public._student_progress_learning_portal_source(p_student_id, 'part-of-speech'),
    'synonyms', public._student_progress_learning_portal_source(p_student_id, 'synonyms'),
    'errorIdentifier', public._student_progress_learning_portal_source(p_student_id, 'error-identifier'),
    'spelling', public._student_progress_learning_portal_source(p_student_id, 'spelling'),
    'readingLogic', public._student_progress_learning_portal_source(p_student_id, 'reading-logic'),
    'translationSkills', public._student_progress_learning_portal_source(p_student_id, 'translation-skills'),
    'businessSchool', public._student_progress_learning_portal_source(p_student_id, 'business-school'),
    'complexQuestions', public._student_progress_learning_portal_source(p_student_id, 'complex-questions'),
    'englishHumourSpeaking', public._student_progress_learning_portal_source(p_student_id, 'english-humour-speaking'),
    'englishHumourWriting', public._student_progress_learning_portal_source(p_student_id, 'english-humour-writing'),
    'falseFriends', public._student_progress_learning_portal_source(p_student_id, 'false-friends')
  ) as value
)
select pg_catalog.jsonb_build_object(
  'schemaVersion', 1,
  'generatedAt', pg_catalog.clock_timestamp(),
  'timeZone', 'Asia/Hong_Kong',
  'student', pg_catalog.jsonb_build_object('id', student.id, 'name', student.name),
  'sources', sources.value
)
from student_profile student
cross join sources_json sources;
$$;

create or replace function public.student_progress_student_snapshot(p_token uuid)
returns table (snapshot jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select public._student_progress_snapshot(student.id)
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student on student.id = session_row.student_id
  where session_row.token = p_token
    and session_row.expires_at > pg_catalog.now()
    and student.deleted_at is null
  limit 1;
$$;

create or replace function public.student_progress_admin_snapshot(
  p_admin_token uuid,
  p_student_id uuid
)
returns table (snapshot jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select public._student_progress_snapshot(student.id)
  from public.flashcard_students student
  where public._student_progress_admin_id(p_admin_token) is not null
    and student.id = p_student_id
    and student.deleted_at is null
  limit 1;
$$;

revoke all on function public._student_progress_revoke_admin_sessions()
  from public, anon, authenticated, service_role;
revoke all on function public._student_progress_admin_id(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public._student_progress_json_number(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._student_progress_json_timestamptz(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._student_progress_learning_portal_source(uuid, text)
  from public, anon, authenticated, service_role;
revoke all on function public._student_progress_snapshot(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.student_progress_provision_admin(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.student_progress_admin_login(text, text)
  from public, anon, authenticated;
revoke all on function public.student_progress_admin_me(uuid)
  from public, anon, authenticated;
revoke all on function public.student_progress_admin_logout(uuid)
  from public, anon, authenticated;
revoke all on function public.student_progress_student_me(uuid)
  from public, anon, authenticated;
revoke all on function public.student_progress_admin_students(uuid)
  from public, anon, authenticated;
revoke all on function public.student_progress_student_snapshot(uuid)
  from public, anon, authenticated;
revoke all on function public.student_progress_admin_snapshot(uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.student_progress_admin_login(text, text)
  to service_role;
grant execute on function public.student_progress_admin_me(uuid)
  to service_role;
grant execute on function public.student_progress_admin_logout(uuid)
  to service_role;
grant execute on function public.student_progress_student_me(uuid)
  to service_role;
grant execute on function public.student_progress_admin_students(uuid)
  to service_role;
grant execute on function public.student_progress_student_snapshot(uuid)
  to service_role;
grant execute on function public.student_progress_admin_snapshot(uuid, uuid)
  to service_role;

notify pgrst, 'reload schema';

commit;
