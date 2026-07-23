-- Edmund Education Sentence Structure: durable attempts, bookmarks, and admin auth.
--
-- Flashcard remains the only student credential store. This migration creates
-- no Sentence Structure student or password table. Apply
-- supabase-shared-student-accounts.sql before running this file.

begin;

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if to_regclass('public.flashcard_students') is null then
    raise exception 'Missing dependency: public.flashcard_students';
  end if;
  if to_regclass('public.flashcard_student_sessions') is null then
    raise exception 'Missing dependency: public.flashcard_student_sessions';
  end if;
  if not exists (
    select 1
    from pg_catalog.pg_extension extension_row
    join pg_catalog.pg_namespace namespace_row
      on namespace_row.oid = extension_row.extnamespace
    where extension_row.extname = 'pgcrypto'
      and namespace_row.nspname = 'extensions'
  ) then
    raise exception 'pgcrypto must be installed in the extensions schema';
  end if;
end;
$$;

-- The Worker performs the deep, content-aware validation. This immutable
-- database check is a second boundary that keeps malformed or unbounded JSON
-- out even if a future server implementation calls the RPC incorrectly.
create or replace function public._sentence_structure_result_valid(
  p_lesson_id text,
  p_result jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_question_pattern text;
  v_question_id text;
  v_item jsonb;
  v_round jsonb;
  v_array_name text;
  v_key_count integer;
  v_has_correction_state boolean;
begin
  if p_lesson_id !~ '^ss([1-9]|[12][0-9]|3[0-9])$'
    or p_result is null
    or jsonb_typeof(p_result) <> 'object'
    or octet_length(p_result::text) > 98304
  then
    return false;
  end if;

  v_question_pattern := '^' || p_lesson_id || '-q(0[1-9]|[1-4][0-9]|50)$';
  select count(*) into v_key_count from jsonb_object_keys(p_result);
  v_has_correction_state := p_result ? 'correctionMode'
    or p_result ? 'correctionIds'
    or p_result ? 'collapsedCorrectIds';

  if v_key_count not in (6, 9)
    or not (p_result ?& array[
      'round',
      'correctIds',
      'questionState',
      'rounds',
      'awaitingNextRound',
      'contentVersion'
    ])
    or exists (
      select 1
      from jsonb_object_keys(p_result) as key_row(key_name)
      where key_name not in (
        'round',
        'correctIds',
        'questionState',
        'rounds',
        'awaitingNextRound',
        'correctionMode',
        'correctionIds',
        'collapsedCorrectIds',
        'contentVersion'
      )
    )
    or (
      v_has_correction_state
      and not (p_result ?& array['correctionMode', 'correctionIds', 'collapsedCorrectIds'])
    )
  then
    return false;
  end if;

  if jsonb_typeof(p_result -> 'round') <> 'number'
    or coalesce(p_result ->> 'round', '') !~ '^[1-9][0-9]{0,3}$'
    or jsonb_typeof(p_result -> 'correctIds') <> 'array'
    or jsonb_array_length(p_result -> 'correctIds') > 50
    or jsonb_typeof(p_result -> 'questionState') <> 'object'
    or (select count(*) from jsonb_object_keys(p_result -> 'questionState')) > 50
    or jsonb_typeof(p_result -> 'rounds') <> 'array'
    or jsonb_array_length(p_result -> 'rounds') > 250
    or jsonb_typeof(p_result -> 'awaitingNextRound') <> 'boolean'
    or jsonb_typeof(p_result -> 'contentVersion') <> 'string'
    or p_result ->> 'contentVersion' <> '1'
  then
    return false;
  end if;

  if v_has_correction_state then
    if jsonb_typeof(p_result -> 'correctionMode') <> 'boolean'
      or jsonb_typeof(p_result -> 'correctionIds') <> 'array'
      or jsonb_array_length(p_result -> 'correctionIds') > 50
      or jsonb_typeof(p_result -> 'collapsedCorrectIds') <> 'array'
      or jsonb_array_length(p_result -> 'collapsedCorrectIds') > 50
    then
      return false;
    end if;

    foreach v_array_name in array array['correctionIds', 'collapsedCorrectIds']
    loop
      for v_item in
        select value
        from jsonb_array_elements(p_result -> v_array_name)
      loop
        if jsonb_typeof(v_item) <> 'string'
          or coalesce(v_item #>> '{}', '') !~ v_question_pattern
        then
          return false;
        end if;
      end loop;

      if (
        select count(*)
        from jsonb_array_elements(p_result -> v_array_name)
      ) <> (
        select count(distinct value #>> '{}')
        from jsonb_array_elements(p_result -> v_array_name)
      ) then
        return false;
      end if;
    end loop;

    if ((p_result ->> 'correctionMode')::boolean and jsonb_array_length(p_result -> 'correctionIds') = 0)
      or (not (p_result ->> 'correctionMode')::boolean and jsonb_array_length(p_result -> 'correctionIds') <> 0)
      or ((p_result ->> 'correctionMode')::boolean and (p_result ->> 'awaitingNextRound')::boolean)
      or exists (
        select 1
        from jsonb_array_elements_text(p_result -> 'correctionIds') as correction_id(question_id)
        where not (p_result -> 'questionState' ? correction_id.question_id)
          or coalesce(p_result -> 'questionState' -> correction_id.question_id ->> 'status', '') not in ('wrong', 'correct')
      )
      or exists (
        select 1
        from jsonb_array_elements_text(p_result -> 'collapsedCorrectIds') as collapsed_id(question_id)
        where not (p_result -> 'correctIds' ? collapsed_id.question_id)
      )
    then
      return false;
    end if;
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_result -> 'correctIds')
  loop
    if jsonb_typeof(v_item) <> 'string'
      or coalesce(v_item #>> '{}', '') !~ v_question_pattern
    then
      return false;
    end if;
  end loop;

  if (
    select count(*)
    from jsonb_array_elements(p_result -> 'correctIds')
  ) <> (
    select count(distinct value #>> '{}')
    from jsonb_array_elements(p_result -> 'correctIds')
  ) then
    return false;
  end if;

  for v_question_id in
    select key_name
    from jsonb_object_keys(p_result -> 'questionState') as key_row(key_name)
  loop
    if v_question_id !~ v_question_pattern then
      return false;
    end if;
  end loop;

  for v_round in
    select value
    from jsonb_array_elements(p_result -> 'rounds')
  loop
    if jsonb_typeof(v_round) <> 'object' then
      return false;
    end if;

    foreach v_array_name in array array['checkedIds', 'correctIds', 'incorrectIds']
    loop
      if jsonb_typeof(v_round -> v_array_name) is distinct from 'array'
        or jsonb_array_length(v_round -> v_array_name) > 50
      then
        return false;
      end if;
      for v_item in
        select value
        from jsonb_array_elements(v_round -> v_array_name)
      loop
        if jsonb_typeof(v_item) <> 'string'
          or coalesce(v_item #>> '{}', '') !~ v_question_pattern
        then
          return false;
        end if;
      end loop;
    end loop;
  end loop;

  return true;
end;
$$;

create or replace function public._sentence_structure_bookmark_payload_valid(p_bookmarks jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_item jsonb;
  v_item_count integer;
  v_distinct_count integer;
begin
  if p_bookmarks is null
    or jsonb_typeof(p_bookmarks) <> 'array'
    or jsonb_array_length(p_bookmarks) > 2000
    or octet_length(p_bookmarks::text) > 262144
  then
    return false;
  end if;

  for v_item in
    select value
    from jsonb_array_elements(p_bookmarks)
  loop
    if jsonb_typeof(v_item) <> 'object'
      or (select count(*) from jsonb_object_keys(v_item)) <> 3
      or exists (
        select 1
        from jsonb_object_keys(v_item) as key_row(key_name)
        where key_name not in ('lessonId', 'questionId', 'includeAnswer')
      )
      or jsonb_typeof(v_item -> 'lessonId') <> 'string'
      or coalesce(v_item ->> 'lessonId', '') !~ '^ss([1-9]|[12][0-9]|3[0-9])$'
      or jsonb_typeof(v_item -> 'questionId') <> 'string'
      or coalesce(v_item ->> 'questionId', '') !~ (
        '^' || (v_item ->> 'lessonId') || '-q(0[1-9]|[1-4][0-9]|50)$'
      )
      or jsonb_typeof(v_item -> 'includeAnswer') <> 'boolean'
    then
      return false;
    end if;
  end loop;

  select count(*), count(distinct (
    value ->> 'lessonId',
    value ->> 'questionId'
  ))
  into v_item_count, v_distinct_count
  from jsonb_array_elements(p_bookmarks);

  return v_item_count = v_distinct_count;
end;
$$;

-- Administrators are intentionally subsystem-specific. Only password hashes
-- are stored; provisioning is owner-only and accepts a pre-generated hash.
create table if not exists public.sentence_structure_admin_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (name = btrim(name)),
  check (char_length(name) between 1 and 100),
  check (name !~ '[[:cntrl:]]'),
  check (password_hash ~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$')
);

create unique index if not exists sentence_structure_admin_name_lower_idx
  on public.sentence_structure_admin_accounts (lower(name));

-- Raw bearer tokens are returned once. Supabase persists only SHA-256 digests.
create table if not exists public.sentence_structure_admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null
    references public.sentence_structure_admin_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (octet_length(token_hash) = 32),
  check (expires_at > created_at)
);

create index if not exists sentence_structure_admin_sessions_expires_idx
  on public.sentence_structure_admin_sessions (expires_at);

create table if not exists public.sentence_structure_attempts (
  id uuid primary key,
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  lesson_id text not null,
  lesson_version text not null,
  status text not null,
  round_number integer not null,
  correct_count integer not null,
  total_count integer not null,
  duration_ms integer not null,
  result jsonb not null,
  started_at timestamptz not null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sentence_structure_attempts_lesson_id_check
    check (lesson_id ~ '^ss([1-9]|[12][0-9]|3[0-9])$'),
  check (lesson_version = '1'),
  check (status in ('in_progress', 'completed')),
  check (round_number between 1 and 1000),
  check (total_count = 50),
  check (correct_count between 0 and total_count),
  check (duration_ms between 0 and 604800000),
  check (public._sentence_structure_result_valid(lesson_id, result)),
  check (
    (status = 'in_progress' and completed_at is null)
    or (
      status = 'completed'
      and completed_at is not null
      and completed_at >= started_at
      and correct_count = total_count
    )
  )
);

create index if not exists sentence_structure_attempts_student_history_idx
  on public.sentence_structure_attempts (student_id, updated_at desc, id desc);

create index if not exists sentence_structure_attempts_student_lesson_idx
  on public.sentence_structure_attempts (student_id, lesson_id, status, updated_at desc);

create table if not exists public.sentence_structure_bookmarks (
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  lesson_id text not null,
  question_id text not null,
  include_answer boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, lesson_id, question_id),
  constraint sentence_structure_bookmarks_lesson_id_check
    check (lesson_id ~ '^ss([1-9]|[12][0-9]|3[0-9])$'),
  check (question_id ~ ('^' || lesson_id || '-q(0[1-9]|[1-4][0-9]|50)$'))
);

create index if not exists sentence_structure_bookmarks_student_created_idx
  on public.sentence_structure_bookmarks (student_id, created_at desc, lesson_id, question_id);

alter table public.sentence_structure_admin_accounts enable row level security;
alter table public.sentence_structure_admin_sessions enable row level security;
alter table public.sentence_structure_attempts enable row level security;
alter table public.sentence_structure_bookmarks enable row level security;

-- There are deliberately no permissive policies. The browser never receives
-- table access; the Worker may invoke only the security-definer RPCs granted
-- near the end of this migration.
revoke all on table public.sentence_structure_admin_accounts
  from public, anon, authenticated, service_role;
revoke all on table public.sentence_structure_admin_sessions
  from public, anon, authenticated, service_role;
revoke all on table public.sentence_structure_attempts
  from public, anon, authenticated, service_role;
revoke all on table public.sentence_structure_bookmarks
  from public, anon, authenticated, service_role;

create or replace function public._sentence_structure_revoke_admin_sessions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.password_hash is distinct from new.password_hash
    or old.is_active is distinct from new.is_active
  then
    delete from public.sentence_structure_admin_sessions session_row
    where session_row.admin_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists sentence_structure_admin_security_change
  on public.sentence_structure_admin_accounts;
create trigger sentence_structure_admin_security_change
after update of password_hash, is_active on public.sentence_structure_admin_accounts
for each row execute function public._sentence_structure_revoke_admin_sessions();

create or replace function public._sentence_structure_admin_id(p_admin_token uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select session_row.admin_id
  from public.sentence_structure_admin_sessions session_row
  join public.sentence_structure_admin_accounts account
    on account.id = session_row.admin_id
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session_row.expires_at > now()
    and account.is_active
  limit 1;
$$;

-- Owner-only provisioning. Pass a locally generated cost-12 bcrypt hash, never
-- the plaintext password. Re-provisioning rotates the password and revokes all
-- active Sentence Structure admin sessions.
create or replace function public.sentence_structure_provision_admin(
  p_name text,
  p_bcrypt_hash text
)
returns table (admin_id uuid, admin_name text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := btrim(coalesce(p_name, ''));
  v_admin_id uuid;
begin
  if char_length(v_name) not between 1 and 100
    or v_name ~ '[[:cntrl:]]'
    or coalesce(p_bcrypt_hash, '')
      !~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$'
  then
    raise exception 'A valid name and cost-12 bcrypt hash are required'
      using errcode = '22023';
  end if;

  select account.id
  into v_admin_id
  from public.sentence_structure_admin_accounts account
  where lower(account.name) = lower(v_name)
  limit 1
  for update;

  if v_admin_id is null then
    insert into public.sentence_structure_admin_accounts (
      name,
      password_hash,
      is_active
    )
    values (v_name, p_bcrypt_hash, true)
    returning id into v_admin_id;
  else
    update public.sentence_structure_admin_accounts account
    set name = v_name,
        password_hash = p_bcrypt_hash,
        is_active = true,
        updated_at = now()
    where account.id = v_admin_id;
  end if;

  delete from public.sentence_structure_admin_sessions session_row
  where session_row.admin_id = v_admin_id;

  return query
  select account.id, account.name
  from public.sentence_structure_admin_accounts account
  where account.id = v_admin_id;
end;
$$;

create or replace function public.sentence_structure_admin_login(
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
  v_name text := lower(btrim(coalesce(p_name, '')));
  v_admin public.sentence_structure_admin_accounts%rowtype;
  v_now timestamptz := clock_timestamp();
  v_token uuid := gen_random_uuid();
  v_expires_at timestamptz := v_now + interval '8 hours';
begin
  if char_length(v_name) not between 1 and 100
    or p_password is null
    or char_length(p_password) not between 1 and 200
  then
    return;
  end if;

  select account.*
  into v_admin
  from public.sentence_structure_admin_accounts account
  where lower(account.name) = v_name
  limit 1
  for update;

  if not found then
    -- Spend the same bcrypt work factor for an unknown account. The Worker
    -- rate limiter bounds this deliberately expensive path.
    perform extensions.crypt(p_password, extensions.gen_salt('bf', 12));
    return;
  end if;

  if not v_admin.is_active
    or v_admin.password_hash <> extensions.crypt(p_password, v_admin.password_hash)
  then
    return;
  end if;

  delete from public.sentence_structure_admin_sessions session_row
  where session_row.expires_at <= v_now;

  insert into public.sentence_structure_admin_sessions (
    token_hash,
    admin_id,
    created_at,
    expires_at
  )
  values (
    extensions.digest(v_token::text, 'sha256'),
    v_admin.id,
    v_now,
    v_expires_at
  );

  return query select v_admin.id, v_token, v_admin.name, v_expires_at;
end;
$$;

create or replace function public.sentence_structure_admin_me(p_admin_token uuid)
returns table (id uuid, name text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select account.id, account.name, session_row.expires_at
  from public.sentence_structure_admin_sessions session_row
  join public.sentence_structure_admin_accounts account
    on account.id = session_row.admin_id
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session_row.expires_at > now()
    and account.is_active
  limit 1;
$$;

create or replace function public.sentence_structure_admin_logout(p_admin_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.sentence_structure_admin_sessions session_row
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256');
  return found;
end;
$$;

-- Validate the canonical Flashcard session directly. The custom session UUID
-- is distinct from the anonymous Supabase Auth user ID used by the browser.
create or replace function public.sentence_structure_student_profile(p_token uuid)
returns table (
  id uuid,
  name text,
  session_expires_at timestamptz
)
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
    and session_row.expires_at > now()
    and student.deleted_at is null
  limit 1;
$$;

create or replace function public.sentence_structure_upsert_attempt(
  p_id uuid,
  p_student_id uuid,
  p_lesson_id text,
  p_lesson_version text,
  p_status text,
  p_round_number integer,
  p_correct_count integer,
  p_total_count integer,
  p_duration_ms integer,
  p_started_at timestamptz,
  p_result jsonb
)
returns table (
  id uuid,
  lesson_id text,
  lesson_version text,
  status text,
  round_number integer,
  correct_count integer,
  total_count integer,
  duration_ms integer,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz,
  result jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.sentence_structure_attempts%rowtype;
  v_now timestamptz := clock_timestamp();
  v_started_at timestamptz;
begin
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Active student not found' using errcode = '23503';
  end if;

  if p_id is null
    or p_lesson_id !~ '^ss([1-9]|[12][0-9]|3[0-9])$'
    or p_lesson_version <> '1'
    or p_status not in ('in_progress', 'completed')
    or p_round_number not between 1 and 1000
    or p_total_count <> 50
    or p_correct_count not between 0 and p_total_count
    or p_duration_ms not between 0 and 604800000
    or p_started_at is null
    or p_started_at < timestamptz '2020-01-01 00:00:00+00'
    or p_started_at > v_now + interval '5 minutes'
    or not public._sentence_structure_result_valid(p_lesson_id, p_result)
    or (p_result ->> 'round')::integer <> p_round_number
    or jsonb_array_length(p_result -> 'correctIds') <> p_correct_count
    or (p_status = 'completed' and p_correct_count <> p_total_count)
  then
    raise exception 'Invalid Sentence Structure attempt' using errcode = '22023';
  end if;

  v_started_at := least(p_started_at, v_now);

  -- Serialize both quota checks and individual UUID updates. Every attempt for
  -- a student takes the student lock first, preventing races at the 1,000-row
  -- retained-history ceiling.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'sentence-structure-student:' || p_student_id::text,
      0
    )
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'sentence-structure-attempt:' || p_id::text,
      0
    )
  );

  select attempt.*
  into v_existing
  from public.sentence_structure_attempts attempt
  where attempt.id = p_id
  for update;

  if found then
    if v_existing.student_id <> p_student_id
      or v_existing.lesson_id <> p_lesson_id
      or v_existing.lesson_version <> p_lesson_version
      or v_existing.total_count <> p_total_count
    then
      raise exception 'Attempt identifier conflict' using errcode = '23505';
    end if;

    -- Completed attempts are immutable. Returning the existing row makes a
    -- retry after a lost response idempotent without permitting rewrites.
    if v_existing.status <> 'completed' then
      if p_round_number < v_existing.round_number
        or p_correct_count < v_existing.correct_count
        or p_duration_ms < v_existing.duration_ms
        or exists (
          select 1
          from jsonb_array_elements_text(v_existing.result -> 'correctIds')
            as old_id(question_id)
          where not (p_result -> 'correctIds' ? old_id.question_id)
        )
      then
        raise exception 'Attempt progress cannot move backwards'
          using errcode = '22023';
      end if;

      update public.sentence_structure_attempts attempt
      set status = p_status,
          round_number = p_round_number,
          correct_count = p_correct_count,
          total_count = p_total_count,
          duration_ms = p_duration_ms,
          result = p_result,
          completed_at = case
            when p_status = 'completed' then greatest(v_now, v_existing.started_at)
            else null
          end,
          updated_at = v_now
      where attempt.id = p_id;
    end if;
  else
    if (
      select count(*)
      from public.sentence_structure_attempts attempt
      where attempt.student_id = p_student_id
    ) >= 1000 then
      -- Returning no row lets the Worker report a bounded, non-upstream 409.
      return;
    end if;

    insert into public.sentence_structure_attempts (
      id,
      student_id,
      lesson_id,
      lesson_version,
      status,
      round_number,
      correct_count,
      total_count,
      duration_ms,
      result,
      started_at,
      completed_at,
      created_at,
      updated_at
    )
    values (
      p_id,
      p_student_id,
      p_lesson_id,
      p_lesson_version,
      p_status,
      p_round_number,
      p_correct_count,
      p_total_count,
      p_duration_ms,
      p_result,
      v_started_at,
      case
        when p_status = 'completed' then greatest(v_now, v_started_at)
        else null
      end,
      v_now,
      v_now
    );
  end if;

  return query
  select
    attempt.id,
    attempt.lesson_id,
    attempt.lesson_version,
    attempt.status,
    attempt.round_number,
    attempt.correct_count,
    attempt.total_count,
    attempt.duration_ms,
    attempt.started_at,
    attempt.completed_at,
    attempt.updated_at,
    attempt.result
  from public.sentence_structure_attempts attempt
  where attempt.id = p_id
    and attempt.student_id = p_student_id;
end;
$$;

create or replace function public.sentence_structure_get_attempt(
  p_student_id uuid,
  p_id uuid
)
returns table (
  id uuid,
  lesson_id text,
  lesson_version text,
  status text,
  round_number integer,
  correct_count integer,
  total_count integer,
  duration_ms integer,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz,
  result jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    attempt.id,
    attempt.lesson_id,
    attempt.lesson_version,
    attempt.status,
    attempt.round_number,
    attempt.correct_count,
    attempt.total_count,
    attempt.duration_ms,
    attempt.started_at,
    attempt.completed_at,
    attempt.updated_at,
    attempt.result
  from public.sentence_structure_attempts attempt
  where attempt.student_id = p_student_id
    and attempt.id = p_id
  limit 1;
$$;

create or replace function public.sentence_structure_list_attempts(
  p_student_id uuid,
  p_limit integer,
  p_offset integer
)
returns table (
  id uuid,
  lesson_id text,
  lesson_version text,
  status text,
  round_number integer,
  correct_count integer,
  total_count integer,
  duration_ms integer,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz,
  result jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_limit not between 1 and 101
    or p_offset not between 0 and 1000000
  then
    raise exception 'Invalid attempt page' using errcode = '22023';
  end if;

  return query
  select
    attempt.id,
    attempt.lesson_id,
    attempt.lesson_version,
    attempt.status,
    attempt.round_number,
    attempt.correct_count,
    attempt.total_count,
    attempt.duration_ms,
    attempt.started_at,
    attempt.completed_at,
    attempt.updated_at,
    attempt.result
  from public.sentence_structure_attempts attempt
  where attempt.student_id = p_student_id
  order by attempt.updated_at desc, attempt.id desc
  limit p_limit
  offset p_offset;
end;
$$;

create or replace function public.sentence_structure_replace_bookmarks(
  p_student_id uuid,
  p_bookmarks jsonb
)
returns table (
  lesson_id text,
  question_id text,
  include_answer boolean,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Active student not found' using errcode = '23503';
  end if;

  if not public._sentence_structure_bookmark_payload_valid(p_bookmarks) then
    raise exception 'Invalid Sentence Structure bookmarks' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'sentence-structure-bookmarks:' || p_student_id::text,
      0
    )
  );

  insert into public.sentence_structure_bookmarks as bookmark (
    student_id,
    lesson_id,
    question_id,
    include_answer,
    created_at,
    updated_at
  )
  select
    p_student_id,
    item ->> 'lessonId',
    item ->> 'questionId',
    (item ->> 'includeAnswer')::boolean,
    now(),
    now()
  from jsonb_array_elements(p_bookmarks) item
  on conflict (student_id, lesson_id, question_id) do update
  set include_answer = excluded.include_answer,
      updated_at = now();

  delete from public.sentence_structure_bookmarks bookmark
  where bookmark.student_id = p_student_id
    and not exists (
      select 1
      from jsonb_array_elements(p_bookmarks) item
      where item ->> 'lessonId' = bookmark.lesson_id
        and item ->> 'questionId' = bookmark.question_id
    );

  return query
  select
    bookmark.lesson_id,
    bookmark.question_id,
    bookmark.include_answer,
    bookmark.created_at
  from public.sentence_structure_bookmarks bookmark
  where bookmark.student_id = p_student_id
  order by bookmark.created_at desc, bookmark.lesson_id, bookmark.question_id;
end;
$$;

create or replace function public.sentence_structure_list_bookmarks(p_student_id uuid)
returns table (
  lesson_id text,
  question_id text,
  include_answer boolean,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    bookmark.lesson_id,
    bookmark.question_id,
    bookmark.include_answer,
    bookmark.created_at
  from public.sentence_structure_bookmarks bookmark
  where bookmark.student_id = p_student_id
  order by bookmark.created_at desc, bookmark.lesson_id, bookmark.question_id
  limit 1000;
$$;

create or replace function public.sentence_structure_list_bookmarks_page(
  p_student_id uuid,
  p_offset integer,
  p_limit integer
)
returns table (
  lesson_id text,
  question_id text,
  include_answer boolean,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_offset not between 0 and 2000
    or p_limit not between 1 and 1000
  then
    raise exception 'Invalid bookmark page' using errcode = '22023';
  end if;

  return query
  select
    bookmark.lesson_id,
    bookmark.question_id,
    bookmark.include_answer,
    bookmark.created_at
  from public.sentence_structure_bookmarks bookmark
  where bookmark.student_id = p_student_id
  order by bookmark.created_at desc, bookmark.lesson_id, bookmark.question_id
  offset p_offset
  limit p_limit;
end;
$$;

create or replace function public.sentence_structure_admin_list_students(
  p_admin_token uuid
)
returns table (
  id uuid,
  name text,
  attempt_count bigint,
  completed_count bigint,
  bookmark_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._sentence_structure_admin_id(p_admin_token) is null then
    return;
  end if;

  return query
  select
    student.id,
    student.name,
    coalesce(attempt_stats.attempt_count, 0::bigint),
    coalesce(attempt_stats.completed_count, 0::bigint),
    coalesce(bookmark_stats.bookmark_count, 0::bigint)
  from public.flashcard_students student
  left join (
    select
      attempt.student_id,
      count(*)::bigint as attempt_count,
      count(*) filter (where attempt.status = 'completed')::bigint as completed_count
    from public.sentence_structure_attempts attempt
    group by attempt.student_id
  ) attempt_stats on attempt_stats.student_id = student.id
  left join (
    select bookmark.student_id, count(*)::bigint as bookmark_count
    from public.sentence_structure_bookmarks bookmark
    group by bookmark.student_id
  ) bookmark_stats on bookmark_stats.student_id = student.id
  where student.deleted_at is null
  order by lower(student.name), student.id;
end;
$$;

create or replace function public.sentence_structure_admin_student_profile(
  p_admin_token uuid,
  p_student_id uuid
)
returns table (id uuid, name text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select student.id, student.name, student.created_at
  from public.flashcard_students student
  where public._sentence_structure_admin_id(p_admin_token) is not null
    and student.id = p_student_id
    and student.deleted_at is null
  limit 1;
$$;

create or replace function public.sentence_structure_admin_list_attempts(
  p_admin_token uuid,
  p_student_id uuid,
  p_limit integer
)
returns table (
  id uuid,
  lesson_id text,
  lesson_version text,
  status text,
  round_number integer,
  correct_count integer,
  total_count integer,
  duration_ms integer,
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz,
  result jsonb
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._sentence_structure_admin_id(p_admin_token) is null then
    return;
  end if;
  if p_limit not between 1 and 100 then
    raise exception 'Invalid attempt limit' using errcode = '22023';
  end if;

  return query
  select
    attempt.id,
    attempt.lesson_id,
    attempt.lesson_version,
    attempt.status,
    attempt.round_number,
    attempt.correct_count,
    attempt.total_count,
    attempt.duration_ms,
    attempt.started_at,
    attempt.completed_at,
    attempt.updated_at,
    attempt.result
  from public.sentence_structure_attempts attempt
  where attempt.student_id = p_student_id
  order by attempt.updated_at desc, attempt.id desc
  limit p_limit;
end;
$$;

create or replace function public.sentence_structure_admin_list_bookmarks(
  p_admin_token uuid,
  p_student_id uuid
)
returns table (
  lesson_id text,
  question_id text,
  include_answer boolean,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    bookmark.lesson_id,
    bookmark.question_id,
    bookmark.include_answer,
    bookmark.created_at
  from public.sentence_structure_bookmarks bookmark
  where public._sentence_structure_admin_id(p_admin_token) is not null
    and bookmark.student_id = p_student_id
  order by bookmark.created_at desc, bookmark.lesson_id, bookmark.question_id
  limit 1000;
$$;

create or replace function public.sentence_structure_admin_list_bookmarks_page(
  p_admin_token uuid,
  p_student_id uuid,
  p_offset integer,
  p_limit integer
)
returns table (
  lesson_id text,
  question_id text,
  include_answer boolean,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._sentence_structure_admin_id(p_admin_token) is null then
    return;
  end if;
  if p_offset not between 0 and 2000
    or p_limit not between 1 and 1000
  then
    raise exception 'Invalid bookmark page' using errcode = '22023';
  end if;

  return query
  select
    bookmark.lesson_id,
    bookmark.question_id,
    bookmark.include_answer,
    bookmark.created_at
  from public.sentence_structure_bookmarks bookmark
  where bookmark.student_id = p_student_id
  order by bookmark.created_at desc, bookmark.lesson_id, bookmark.question_id
  offset p_offset
  limit p_limit;
end;
$$;

-- Remove PostgreSQL's default PUBLIC execute privilege, including from helper
-- functions. Provisioning remains owner-only; only browser-needed server RPCs
-- are granted to the Worker service role.
revoke all on function public._sentence_structure_result_valid(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._sentence_structure_bookmark_payload_valid(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._sentence_structure_revoke_admin_sessions()
  from public, anon, authenticated, service_role;
revoke all on function public._sentence_structure_admin_id(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.sentence_structure_provision_admin(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.sentence_structure_admin_login(text, text)
  from public, anon, authenticated;
revoke all on function public.sentence_structure_admin_me(uuid)
  from public, anon, authenticated;
revoke all on function public.sentence_structure_admin_logout(uuid)
  from public, anon, authenticated;
revoke all on function public.sentence_structure_student_profile(uuid)
  from public, anon, authenticated;
revoke all on function public.sentence_structure_upsert_attempt(
  uuid, uuid, text, text, text, integer, integer, integer, integer,
  timestamptz, jsonb
)
  from public, anon, authenticated;
revoke all on function public.sentence_structure_get_attempt(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.sentence_structure_list_attempts(uuid, integer, integer)
  from public, anon, authenticated;
revoke all on function public.sentence_structure_replace_bookmarks(uuid, jsonb)
  from public, anon, authenticated;
revoke all on function public.sentence_structure_list_bookmarks(uuid)
  from public, anon, authenticated;
revoke all on function public.sentence_structure_list_bookmarks_page(uuid, integer, integer)
  from public, anon, authenticated;
revoke all on function public.sentence_structure_admin_list_students(uuid)
  from public, anon, authenticated;
revoke all on function public.sentence_structure_admin_student_profile(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.sentence_structure_admin_list_attempts(uuid, uuid, integer)
  from public, anon, authenticated;
revoke all on function public.sentence_structure_admin_list_bookmarks(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.sentence_structure_admin_list_bookmarks_page(
  uuid, uuid, integer, integer
)
  from public, anon, authenticated;

grant execute on function public.sentence_structure_admin_login(text, text)
  to service_role;
grant execute on function public.sentence_structure_admin_me(uuid)
  to service_role;
grant execute on function public.sentence_structure_admin_logout(uuid)
  to service_role;
grant execute on function public.sentence_structure_student_profile(uuid)
  to service_role;
grant execute on function public.sentence_structure_upsert_attempt(
  uuid, uuid, text, text, text, integer, integer, integer, integer,
  timestamptz, jsonb
)
  to service_role;
grant execute on function public.sentence_structure_get_attempt(uuid, uuid)
  to service_role;
grant execute on function public.sentence_structure_list_attempts(uuid, integer, integer)
  to service_role;
grant execute on function public.sentence_structure_replace_bookmarks(uuid, jsonb)
  to service_role;
grant execute on function public.sentence_structure_list_bookmarks(uuid)
  to service_role;
grant execute on function public.sentence_structure_list_bookmarks_page(uuid, integer, integer)
  to service_role;
grant execute on function public.sentence_structure_admin_list_students(uuid)
  to service_role;
grant execute on function public.sentence_structure_admin_student_profile(uuid, uuid)
  to service_role;
grant execute on function public.sentence_structure_admin_list_attempts(uuid, uuid, integer)
  to service_role;
grant execute on function public.sentence_structure_admin_list_bookmarks(uuid, uuid)
  to service_role;
grant execute on function public.sentence_structure_admin_list_bookmarks_page(
  uuid, uuid, integer, integer
)
  to service_role;

notify pgrst, 'reload schema';

commit;
