-- Edmund Education Phrasal Verb System: durable attempts, bookmarks, and admin auth.
--
-- Flashcard remains the only student credential store. This migration creates
-- no Phrasal Verb System student or password table. Apply
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

-- Published lesson sizes are immutable content metadata. Keeping the mapping
-- in one helper lets database checks support the source PDFs' real 30, 50,
-- 60, and 70-question units without weakening per-lesson validation.
create or replace function public._phrasal_verb_system_question_count(
  p_lesson_id text
)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case p_lesson_id
    when 'phrasal-verb-01' then 70
    when 'phrasal-verb-02' then 50
    when 'phrasal-verb-03' then 70
    when 'phrasal-verb-04' then 60
    when 'phrasal-verb-05' then 50
    when 'phrasal-verb-06' then 70
    when 'phrasal-verb-07' then 70
    when 'phrasal-verb-08' then 70
    when 'phrasal-verb-09' then 50
    when 'phrasal-verb-10' then 70
    when 'phrasal-verb-11' then 50
    when 'phrasal-verb-12' then 50
    when 'phrasal-verb-13' then 50
    when 'phrasal-verb-14' then 70
    when 'phrasal-verb-15' then 50
    when 'phrasal-verb-16' then 50
    when 'phrasal-verb-17' then 50
    when 'phrasal-verb-18' then 50
    when 'phrasal-verb-19' then 70
    when 'phrasal-verb-20' then 50
    when 'phrasal-verb-21' then 60
    when 'phrasal-verb-22' then 50
    when 'phrasal-verb-23' then 60
    when 'phrasal-verb-24' then 60
    when 'phrasal-verb-25' then 50
    when 'phrasal-verb-26' then 50
    when 'phrasal-verb-27' then 60
    when 'phrasal-verb-28' then 60
    when 'phrasal-verb-29' then 50
    when 'phrasal-verb-30' then 50
    when 'phrasal-verb-31' then 50
    when 'phrasal-verb-32' then 30
    when 'phrasal-verb-33' then 50
    when 'phrasal-verb-34' then 50
    when 'phrasal-verb-35' then 70
    else null
  end;
$$;

-- The Worker performs the deep, content-aware validation. This immutable
-- database check is a second boundary that keeps malformed or unbounded JSON
-- out even if a future server implementation calls the RPC incorrectly.
create or replace function public._phrasal_verb_system_result_valid(
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
  v_question_count integer;
  v_question_id text;
  v_item jsonb;
  v_round jsonb;
  v_array_name text;
  v_key_count integer;
  v_has_correction_state boolean;
begin
  v_question_count := public._phrasal_verb_system_question_count(p_lesson_id);
  if v_question_count is null
    or p_result is null
    or jsonb_typeof(p_result) <> 'object'
    or octet_length(p_result::text) > 98304
  then
    return false;
  end if;

  v_question_pattern := '^' || p_lesson_id || '-q' || case v_question_count
    when 30 then '(0[1-9]|[12][0-9]|30)$'
    when 50 then '(0[1-9]|[1-4][0-9]|50)$'
    when 60 then '(0[1-9]|[1-5][0-9]|60)$'
    when 70 then '(0[1-9]|[1-6][0-9]|70)$'
  end;
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
    or jsonb_array_length(p_result -> 'correctIds') > v_question_count
    or jsonb_typeof(p_result -> 'questionState') <> 'object'
    or (select count(*) from jsonb_object_keys(p_result -> 'questionState')) > v_question_count
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
      or jsonb_array_length(p_result -> 'correctionIds') > v_question_count
      or jsonb_typeof(p_result -> 'collapsedCorrectIds') <> 'array'
      or jsonb_array_length(p_result -> 'collapsedCorrectIds') > v_question_count
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
    v_item := p_result -> 'questionState' -> v_question_id;
    if v_question_id !~ v_question_pattern
      or jsonb_typeof(v_item) <> 'object'
      or (select count(*) from jsonb_object_keys(v_item)) <> 3
      or not (v_item ?& array['status', 'lastAnswer', 'reveal'])
      or jsonb_typeof(v_item -> 'status') <> 'string'
      or coalesce(v_item ->> 'status', '') not in ('pending', 'correct', 'wrong')
      or jsonb_typeof(v_item -> 'lastAnswer') <> 'string'
      or char_length(v_item ->> 'lastAnswer') > 1000
      or (v_item ->> 'lastAnswer') ~ '[[:cntrl:]]'
      or jsonb_typeof(v_item -> 'reveal') <> 'boolean'
      or (
        coalesce(v_item ->> 'status', '') = 'pending'
        and v_item -> 'reveal' = 'true'::jsonb
      )
      or (
        coalesce(v_item ->> 'status', '') = 'correct'
        and v_item -> 'reveal' <> 'true'::jsonb
      )
      or (
        coalesce(v_item ->> 'status', '') = 'wrong'
        and v_has_correction_state
        and p_result -> 'correctionMode' = 'true'::jsonb
        and (p_result -> 'correctionIds' ? v_question_id)
        and v_item -> 'reveal' = 'true'::jsonb
      )
      or (
        coalesce(v_item ->> 'status', '') = 'wrong'
        and not (
          v_has_correction_state
          and p_result -> 'correctionMode' = 'true'::jsonb
          and (p_result -> 'correctionIds' ? v_question_id)
        )
        and v_item -> 'reveal' <> 'true'::jsonb
      )
      or (
        coalesce(v_item ->> 'status', '') = 'correct'
        and not (p_result -> 'correctIds' ? v_question_id)
      )
    then
      return false;
    end if;
  end loop;

  if exists (
    select 1
    from jsonb_array_elements_text(p_result -> 'correctIds') as correct_id(question_id)
    where coalesce(
      p_result -> 'questionState' -> correct_id.question_id ->> 'status',
      ''
    ) <> 'correct'
  ) then
    return false;
  end if;

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
        or jsonb_array_length(v_round -> v_array_name) > v_question_count
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

create or replace function public._phrasal_verb_system_bookmark_payload_valid(p_bookmarks jsonb)
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
    or jsonb_array_length(p_bookmarks) > 2005
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
      or public._phrasal_verb_system_question_count(v_item ->> 'lessonId') is null
      or jsonb_typeof(v_item -> 'questionId') <> 'string'
      or (
        coalesce(v_item ->> 'questionId', '') <> '__section__'
        and (
          coalesce(v_item ->> 'questionId', '') !~ ('^' || coalesce(v_item ->> 'lessonId', '') || '-q[0-9]{2}$')
          or substring(coalesce(v_item ->> 'questionId', '') from '-q([0-9]{2})$')::integer not between 1 and public._phrasal_verb_system_question_count(v_item ->> 'lessonId')
        )
      )
      or jsonb_typeof(v_item -> 'includeAnswer') <> 'boolean'
      or (
        coalesce(v_item ->> 'questionId', '') = '__section__'
        and v_item -> 'includeAnswer' <> 'false'::jsonb
      )
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
create table if not exists public.phrasal_verb_system_admin_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (name = btrim(name)),
  check (char_length(name) between 1 and 100),
  check (name !~ '[[:cntrl:]]'),
  check (password_hash ~ '^\$2a\$12\$[./A-Za-z0-9]{53}$')
);

create unique index if not exists phrasal_verb_system_admin_name_lower_idx
  on public.phrasal_verb_system_admin_accounts (lower(name));

-- Raw bearer tokens are returned once. Supabase persists only SHA-256 digests.
create table if not exists public.phrasal_verb_system_admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null
    references public.phrasal_verb_system_admin_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (octet_length(token_hash) = 32),
  check (expires_at > created_at)
);

create index if not exists phrasal_verb_system_admin_sessions_expires_idx
  on public.phrasal_verb_system_admin_sessions (expires_at);

create table if not exists public.phrasal_verb_system_attempts (
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
  constraint phrasal_verb_system_attempts_lesson_id_check
    check (public._phrasal_verb_system_question_count(lesson_id) is not null),
  check (lesson_version = '1'),
  check (status in ('in_progress', 'completed')),
  check (round_number between 1 and 1000),
  constraint phrasal_verb_system_attempts_total_count_check
    check (total_count = public._phrasal_verb_system_question_count(lesson_id)),
  check (correct_count between 0 and total_count),
  check (duration_ms between 0 and 604800000),
  check (public._phrasal_verb_system_result_valid(lesson_id, result)),
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

create index if not exists phrasal_verb_system_attempts_student_history_idx
  on public.phrasal_verb_system_attempts (student_id, updated_at desc, id desc);

create index if not exists phrasal_verb_system_attempts_student_lesson_idx
  on public.phrasal_verb_system_attempts (student_id, lesson_id, status, updated_at desc);

create table if not exists public.phrasal_verb_system_bookmarks (
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  lesson_id text not null,
  question_id text not null,
  include_answer boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (student_id, lesson_id, question_id),
  constraint phrasal_verb_system_bookmarks_lesson_id_check
    check (public._phrasal_verb_system_question_count(lesson_id) is not null),
  constraint phrasal_verb_system_bookmarks_question_id_check
    check (
      (question_id = '__section__' and include_answer = false)
      or (
        question_id ~ ('^' || lesson_id || '-q[0-9]{2}$')
        and substring(question_id from '-q([0-9]{2})$')::integer between 1 and public._phrasal_verb_system_question_count(lesson_id)
      )
    )
);

-- Earlier installations allowed only individual-question bookmarks. Replace
-- that constraint idempotently so a lesson-level sentinel can share the same
-- account-isolated table and primary key without changing existing rows.
-- The first production migration used an unnamed CHECK, which PostgreSQL named
-- `phrasal_verb_system_bookmarks_check`; drop that legacy name as well.
alter table public.phrasal_verb_system_bookmarks
  drop constraint if exists phrasal_verb_system_bookmarks_check;
alter table public.phrasal_verb_system_bookmarks
  drop constraint if exists phrasal_verb_system_bookmarks_question_id_check;
alter table public.phrasal_verb_system_bookmarks
  add constraint phrasal_verb_system_bookmarks_question_id_check
  check (
    (question_id = '__section__' and include_answer = false)
    or (
      question_id ~ ('^' || lesson_id || '-q[0-9]{2}$')
      and substring(question_id from '-q([0-9]{2})$')::integer between 1 and public._phrasal_verb_system_question_count(lesson_id)
    )
  );

-- Expand existing one-lesson installations without dropping stored progress.
alter table public.phrasal_verb_system_bookmarks
  drop constraint if exists phrasal_verb_system_bookmarks_lesson_id_check;
alter table public.phrasal_verb_system_bookmarks
  add constraint phrasal_verb_system_bookmarks_lesson_id_check
  check (public._phrasal_verb_system_question_count(lesson_id) is not null);
alter table public.phrasal_verb_system_attempts
  drop constraint if exists phrasal_verb_system_attempts_lesson_id_check;
alter table public.phrasal_verb_system_attempts
  add constraint phrasal_verb_system_attempts_lesson_id_check
  check (public._phrasal_verb_system_question_count(lesson_id) is not null);
alter table public.phrasal_verb_system_attempts
  drop constraint if exists phrasal_verb_system_attempts_total_count_check;
alter table public.phrasal_verb_system_attempts
  add constraint phrasal_verb_system_attempts_total_count_check
  check (total_count = public._phrasal_verb_system_question_count(lesson_id));

create index if not exists phrasal_verb_system_bookmarks_student_created_idx
  on public.phrasal_verb_system_bookmarks (student_id, created_at desc, lesson_id, question_id);

alter table public.phrasal_verb_system_admin_accounts enable row level security;
alter table public.phrasal_verb_system_admin_sessions enable row level security;
alter table public.phrasal_verb_system_attempts enable row level security;
alter table public.phrasal_verb_system_bookmarks enable row level security;

-- There are deliberately no permissive policies. The browser never receives
-- table access; the Worker may invoke only the security-definer RPCs granted
-- near the end of this migration.
revoke all on table public.phrasal_verb_system_admin_accounts
  from public, anon, authenticated, service_role;
revoke all on table public.phrasal_verb_system_admin_sessions
  from public, anon, authenticated, service_role;
revoke all on table public.phrasal_verb_system_attempts
  from public, anon, authenticated, service_role;
revoke all on table public.phrasal_verb_system_bookmarks
  from public, anon, authenticated, service_role;

create or replace function public._phrasal_verb_system_revoke_admin_sessions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.password_hash is distinct from new.password_hash
    or old.is_active is distinct from new.is_active
  then
    delete from public.phrasal_verb_system_admin_sessions session_row
    where session_row.admin_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists phrasal_verb_system_admin_security_change
  on public.phrasal_verb_system_admin_accounts;
create trigger phrasal_verb_system_admin_security_change
after update of password_hash, is_active on public.phrasal_verb_system_admin_accounts
for each row execute function public._phrasal_verb_system_revoke_admin_sessions();

create or replace function public._phrasal_verb_system_admin_id(p_admin_token uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select session_row.admin_id
  from public.phrasal_verb_system_admin_sessions session_row
  join public.phrasal_verb_system_admin_accounts account
    on account.id = session_row.admin_id
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session_row.expires_at > now()
    and account.is_active
  limit 1;
$$;

-- Owner-only provisioning. Pass a locally generated cost-12 bcrypt hash, never
-- the plaintext password. Re-provisioning rotates the password and revokes all
-- active Phrasal Verb System admin sessions.
create or replace function public.phrasal_verb_system_provision_admin(
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
      !~ '^\$2a\$12\$[./A-Za-z0-9]{53}$'
  then
    raise exception 'A valid name and cost-12 bcrypt hash are required'
      using errcode = '22023';
  end if;

  select account.id
  into v_admin_id
  from public.phrasal_verb_system_admin_accounts account
  where lower(account.name) = lower(v_name)
  limit 1
  for update;

  if v_admin_id is null then
    insert into public.phrasal_verb_system_admin_accounts (
      name,
      password_hash,
      is_active
    )
    values (v_name, p_bcrypt_hash, true)
    returning id into v_admin_id;
  else
    update public.phrasal_verb_system_admin_accounts account
    set name = v_name,
        password_hash = p_bcrypt_hash,
        is_active = true,
        updated_at = now()
    where account.id = v_admin_id;
  end if;

  delete from public.phrasal_verb_system_admin_sessions session_row
  where session_row.admin_id = v_admin_id;

  return query
  select account.id, account.name
  from public.phrasal_verb_system_admin_accounts account
  where account.id = v_admin_id;
end;
$$;

create or replace function public.phrasal_verb_system_admin_login(
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
  v_admin public.phrasal_verb_system_admin_accounts%rowtype;
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
  from public.phrasal_verb_system_admin_accounts account
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

  delete from public.phrasal_verb_system_admin_sessions session_row
  where session_row.expires_at <= v_now;

  insert into public.phrasal_verb_system_admin_sessions (
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

create or replace function public.phrasal_verb_system_admin_me(p_admin_token uuid)
returns table (id uuid, name text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select account.id, account.name, session_row.expires_at
  from public.phrasal_verb_system_admin_sessions session_row
  join public.phrasal_verb_system_admin_accounts account
    on account.id = session_row.admin_id
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session_row.expires_at > now()
    and account.is_active
  limit 1;
$$;

create or replace function public.phrasal_verb_system_admin_logout(p_admin_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.phrasal_verb_system_admin_sessions session_row
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256');
  return found;
end;
$$;

-- Validate the canonical Flashcard session directly. The custom session UUID
-- is distinct from the anonymous Supabase Auth user ID used by the browser.
create or replace function public.phrasal_verb_system_student_profile(p_token uuid)
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

create or replace function public.phrasal_verb_system_upsert_attempt(
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
  v_existing public.phrasal_verb_system_attempts%rowtype;
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
    or public._phrasal_verb_system_question_count(p_lesson_id) is null
    or p_lesson_version <> '1'
    or p_status not in ('in_progress', 'completed')
    or p_round_number not between 1 and 1000
    or p_total_count <> public._phrasal_verb_system_question_count(p_lesson_id)
    or p_correct_count not between 0 and p_total_count
    or p_duration_ms not between 0 and 604800000
    or p_started_at is null
    or p_started_at < timestamptz '2020-01-01 00:00:00+00'
    or p_started_at > v_now + interval '5 minutes'
    or not public._phrasal_verb_system_result_valid(p_lesson_id, p_result)
    or (p_result ->> 'round')::integer <> p_round_number
    or jsonb_array_length(p_result -> 'correctIds') <> p_correct_count
    or (p_status = 'completed' and p_correct_count <> p_total_count)
  then
    raise exception 'Invalid Phrasal Verb System attempt' using errcode = '22023';
  end if;

  v_started_at := least(p_started_at, v_now);

  -- Serialize both quota checks and individual UUID updates. Every attempt for
  -- a student takes the student lock first, preventing races at the 1,000-row
  -- retained-history ceiling.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'phrasal-verb-system-student:' || p_student_id::text,
      0
    )
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'phrasal-verb-system-attempt:' || p_id::text,
      0
    )
  );

  select attempt.*
  into v_existing
  from public.phrasal_verb_system_attempts attempt
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

      update public.phrasal_verb_system_attempts attempt
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
      from public.phrasal_verb_system_attempts attempt
      where attempt.student_id = p_student_id
    ) >= 1000 then
      -- Returning no row lets the Worker report a bounded, non-upstream 409.
      return;
    end if;

    insert into public.phrasal_verb_system_attempts (
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
  from public.phrasal_verb_system_attempts attempt
  where attempt.id = p_id
    and attempt.student_id = p_student_id;
end;
$$;

create or replace function public.phrasal_verb_system_get_attempt(
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
  from public.phrasal_verb_system_attempts attempt
  where attempt.student_id = p_student_id
    and attempt.id = p_id
  limit 1;
$$;

create or replace function public.phrasal_verb_system_list_attempts(
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
  from public.phrasal_verb_system_attempts attempt
  where attempt.student_id = p_student_id
  order by attempt.updated_at desc, attempt.id desc
  limit p_limit
  offset p_offset;
end;
$$;

create or replace function public.phrasal_verb_system_replace_bookmarks(
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

  if not public._phrasal_verb_system_bookmark_payload_valid(p_bookmarks) then
    raise exception 'Invalid Phrasal Verb System bookmarks' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'phrasal-verb-system-bookmarks:' || p_student_id::text,
      0
    )
  );

  insert into public.phrasal_verb_system_bookmarks as bookmark (
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
  on conflict on constraint phrasal_verb_system_bookmarks_pkey do update
  set include_answer = excluded.include_answer,
      updated_at = now();

  delete from public.phrasal_verb_system_bookmarks bookmark
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
  from public.phrasal_verb_system_bookmarks bookmark
  where bookmark.student_id = p_student_id
  order by bookmark.created_at desc, bookmark.lesson_id, bookmark.question_id;
end;
$$;

create or replace function public.phrasal_verb_system_list_bookmarks(p_student_id uuid)
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
  from public.phrasal_verb_system_bookmarks bookmark
  where bookmark.student_id = p_student_id
  order by bookmark.created_at desc, bookmark.lesson_id, bookmark.question_id
  limit 100;
$$;

create or replace function public.phrasal_verb_system_list_bookmarks_page(
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
  if p_offset not between 0 and 2005
    or p_limit not between 1 and 100
  then
    raise exception 'Invalid bookmark page' using errcode = '22023';
  end if;

  return query
  select
    bookmark.lesson_id,
    bookmark.question_id,
    bookmark.include_answer,
    bookmark.created_at
  from public.phrasal_verb_system_bookmarks bookmark
  where bookmark.student_id = p_student_id
  order by bookmark.created_at desc, bookmark.lesson_id, bookmark.question_id
  offset p_offset
  limit p_limit;
end;
$$;

create or replace function public.phrasal_verb_system_admin_list_students(
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
  if public._phrasal_verb_system_admin_id(p_admin_token) is null then
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
    from public.phrasal_verb_system_attempts attempt
    group by attempt.student_id
  ) attempt_stats on attempt_stats.student_id = student.id
  left join (
    select bookmark.student_id, count(*)::bigint as bookmark_count
    from public.phrasal_verb_system_bookmarks bookmark
    group by bookmark.student_id
  ) bookmark_stats on bookmark_stats.student_id = student.id
  where student.deleted_at is null
  order by lower(student.name), student.id;
end;
$$;

create or replace function public.phrasal_verb_system_admin_student_profile(
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
  where public._phrasal_verb_system_admin_id(p_admin_token) is not null
    and student.id = p_student_id
    and student.deleted_at is null
  limit 1;
$$;

create or replace function public.phrasal_verb_system_admin_list_attempts(
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
  if public._phrasal_verb_system_admin_id(p_admin_token) is null then
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
  from public.phrasal_verb_system_attempts attempt
  where attempt.student_id = p_student_id
  order by attempt.updated_at desc, attempt.id desc
  limit p_limit;
end;
$$;

create or replace function public.phrasal_verb_system_admin_list_bookmarks(
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
  from public.phrasal_verb_system_bookmarks bookmark
  where public._phrasal_verb_system_admin_id(p_admin_token) is not null
    and bookmark.student_id = p_student_id
  order by bookmark.created_at desc, bookmark.lesson_id, bookmark.question_id
  limit 100;
$$;

create or replace function public.phrasal_verb_system_admin_list_bookmarks_page(
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
  if public._phrasal_verb_system_admin_id(p_admin_token) is null then
    return;
  end if;
  if p_offset not between 0 and 2005
    or p_limit not between 1 and 100
  then
    raise exception 'Invalid bookmark page' using errcode = '22023';
  end if;

  return query
  select
    bookmark.lesson_id,
    bookmark.question_id,
    bookmark.include_answer,
    bookmark.created_at
  from public.phrasal_verb_system_bookmarks bookmark
  where bookmark.student_id = p_student_id
  order by bookmark.created_at desc, bookmark.lesson_id, bookmark.question_id
  offset p_offset
  limit p_limit;
end;
$$;

-- Remove PostgreSQL's default PUBLIC execute privilege, including from helper
-- functions. Provisioning remains owner-only; only browser-needed server RPCs
-- are granted to the Worker service role.
revoke all on function public._phrasal_verb_system_result_valid(text, jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._phrasal_verb_system_question_count(text)
  from public, anon, authenticated, service_role;
revoke all on function public._phrasal_verb_system_bookmark_payload_valid(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._phrasal_verb_system_revoke_admin_sessions()
  from public, anon, authenticated, service_role;
revoke all on function public._phrasal_verb_system_admin_id(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.phrasal_verb_system_provision_admin(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.phrasal_verb_system_admin_login(text, text)
  from public, anon, authenticated;
revoke all on function public.phrasal_verb_system_admin_me(uuid)
  from public, anon, authenticated;
revoke all on function public.phrasal_verb_system_admin_logout(uuid)
  from public, anon, authenticated;
revoke all on function public.phrasal_verb_system_student_profile(uuid)
  from public, anon, authenticated;
revoke all on function public.phrasal_verb_system_upsert_attempt(
  uuid, uuid, text, text, text, integer, integer, integer, integer,
  timestamptz, jsonb
)
  from public, anon, authenticated;
revoke all on function public.phrasal_verb_system_get_attempt(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.phrasal_verb_system_list_attempts(uuid, integer, integer)
  from public, anon, authenticated;
revoke all on function public.phrasal_verb_system_replace_bookmarks(uuid, jsonb)
  from public, anon, authenticated;
revoke all on function public.phrasal_verb_system_list_bookmarks(uuid)
  from public, anon, authenticated;
revoke all on function public.phrasal_verb_system_list_bookmarks_page(uuid, integer, integer)
  from public, anon, authenticated;
revoke all on function public.phrasal_verb_system_admin_list_students(uuid)
  from public, anon, authenticated;
revoke all on function public.phrasal_verb_system_admin_student_profile(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.phrasal_verb_system_admin_list_attempts(uuid, uuid, integer)
  from public, anon, authenticated;
revoke all on function public.phrasal_verb_system_admin_list_bookmarks(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.phrasal_verb_system_admin_list_bookmarks_page(
  uuid, uuid, integer, integer
)
  from public, anon, authenticated;

grant execute on function public.phrasal_verb_system_admin_login(text, text)
  to service_role;
grant execute on function public.phrasal_verb_system_admin_me(uuid)
  to service_role;
grant execute on function public.phrasal_verb_system_admin_logout(uuid)
  to service_role;
grant execute on function public.phrasal_verb_system_student_profile(uuid)
  to service_role;
grant execute on function public.phrasal_verb_system_upsert_attempt(
  uuid, uuid, text, text, text, integer, integer, integer, integer,
  timestamptz, jsonb
)
  to service_role;
grant execute on function public.phrasal_verb_system_get_attempt(uuid, uuid)
  to service_role;
grant execute on function public.phrasal_verb_system_list_attempts(uuid, integer, integer)
  to service_role;
grant execute on function public.phrasal_verb_system_replace_bookmarks(uuid, jsonb)
  to service_role;
grant execute on function public.phrasal_verb_system_list_bookmarks(uuid)
  to service_role;
grant execute on function public.phrasal_verb_system_list_bookmarks_page(uuid, integer, integer)
  to service_role;
grant execute on function public.phrasal_verb_system_admin_list_students(uuid)
  to service_role;
grant execute on function public.phrasal_verb_system_admin_student_profile(uuid, uuid)
  to service_role;
grant execute on function public.phrasal_verb_system_admin_list_attempts(uuid, uuid, integer)
  to service_role;
grant execute on function public.phrasal_verb_system_admin_list_bookmarks(uuid, uuid)
  to service_role;
grant execute on function public.phrasal_verb_system_admin_list_bookmarks_page(
  uuid, uuid, integer, integer
)
  to service_role;

notify pgrst, 'reload schema';

commit;
