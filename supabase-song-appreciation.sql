-- Edmund Education Song Appreciation portal.
--
-- Apply supabase-shared-student-accounts.sql first. Flashcard remains the
-- canonical student credential/session store; this migration creates no
-- second student account or password table. It also deliberately contains no
-- song seed data and no plaintext administrator password.

begin;

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if pg_catalog.to_regclass('public.flashcard_students') is null then
    raise exception 'Missing dependency: public.flashcard_students';
  end if;
  if pg_catalog.to_regclass('public.flashcard_student_sessions') is null then
    raise exception 'Missing dependency: public.flashcard_student_sessions';
  end if;
  if pg_catalog.to_regprocedure('public.flashcard_student_login(text,text)') is null then
    raise exception 'Missing dependency: public.flashcard_student_login(text,text)';
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

-- This helper makes the array constraint reusable without putting a subquery
-- inside a CHECK constraint. Tags are canonical lowercase values.
create or replace function public._song_appreciation_tags_valid(p_tags text[])
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_tag text;
  v_seen jsonb := '{}'::jsonb;
begin
  if p_tags is null
    or pg_catalog.cardinality(p_tags) > 30
    or (
      pg_catalog.cardinality(p_tags) > 0
      and pg_catalog.array_ndims(p_tags) <> 1
    )
  then
    return false;
  end if;

  foreach v_tag in array p_tags
  loop
    if v_tag is null
      or v_tag <> pg_catalog.lower(pg_catalog.btrim(v_tag))
      or pg_catalog.char_length(v_tag) not between 1 and 60
      or v_tag ~ '[[:cntrl:]]'
      or v_seen ? v_tag
    then
      return false;
    end if;
    v_seen := v_seen || pg_catalog.jsonb_build_object(v_tag, true);
  end loop;

  return true;
end;
$$;

create or replace function public._song_appreciation_youtube_url_valid(p_url text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select p_url is null
    or (
      pg_catalog.char_length(p_url) between 12 and 500
      and p_url = pg_catalog.btrim(p_url)
      and pg_catalog.lower(p_url) ~ '^https://(((www|m|music)[.])?youtube[.]com|youtu[.]be|(www[.])?youtube-nocookie[.]com)(/|$)'
      and p_url !~ '[[:space:][:cntrl:]]'
    );
$$;

create or replace function public._song_appreciation_translations_valid(p_rows jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_row jsonb;
begin
  if p_rows is null
    or pg_catalog.jsonb_typeof(p_rows) <> 'array'
    or pg_catalog.jsonb_array_length(p_rows) > 2000
  then
    return false;
  end if;

  for v_row in
    select value from pg_catalog.jsonb_array_elements(p_rows)
  loop
    if pg_catalog.jsonb_typeof(v_row) <> 'object' then
      return false;
    end if;

    if v_row ? 'break' then
      if pg_catalog.jsonb_typeof(v_row -> 'break') <> 'boolean'
        or (v_row ->> 'break')::boolean is not true
      then
        return false;
      end if;
    elsif pg_catalog.jsonb_typeof(v_row -> 'english') <> 'string'
      or pg_catalog.jsonb_typeof(v_row -> 'chinese') <> 'string'
      or pg_catalog.char_length(v_row ->> 'english') > 4000
      or pg_catalog.char_length(v_row ->> 'chinese') > 4000
    then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

-- Published songs contain the four fixed difficulty modes. Every question is
-- numbered contiguously, has exactly three distinct options, and has one
-- answer present in those options. An empty array is reserved for drafts and
-- is handled by the table/upsert checks rather than accepted here.
create or replace function public._song_appreciation_exercises_valid(p_modes jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_mode jsonb;
  v_mode_id text;
  v_seen_modes jsonb := '{}'::jsonb;
  v_questions jsonb;
  v_question jsonb;
  v_ordinal bigint;
  v_option jsonb;
  v_option_text text;
  v_seen_options jsonb;
  v_answer text;
  v_question_count integer;
begin
  if p_modes is null
    or pg_catalog.jsonb_typeof(p_modes) <> 'array'
    or pg_catalog.jsonb_array_length(p_modes) <> 4
  then
    return false;
  end if;

  for v_mode in
    select value from pg_catalog.jsonb_array_elements(p_modes)
  loop
    if pg_catalog.jsonb_typeof(v_mode) <> 'object'
      or pg_catalog.jsonb_typeof(v_mode -> 'id') <> 'string'
    then
      return false;
    end if;

    v_mode_id := pg_catalog.lower(pg_catalog.btrim(v_mode ->> 'id'));
    if v_mode_id not in ('standard', 'medium', 'hard', 'hell')
      or v_mode ->> 'id' <> v_mode_id
      or v_seen_modes ? v_mode_id
    then
      return false;
    end if;
    v_seen_modes := v_seen_modes || pg_catalog.jsonb_build_object(v_mode_id, true);

    if v_mode ? 'version' and (
      pg_catalog.jsonb_typeof(v_mode -> 'version') <> 'number'
      or coalesce(v_mode ->> 'version', '') !~ '^[1-9][0-9]{0,5}$'
      or (v_mode ->> 'version')::integer > 100000
    ) then
      return false;
    end if;

    v_questions := v_mode -> 'questions';
    if pg_catalog.jsonb_typeof(v_questions) <> 'array'
      or pg_catalog.jsonb_array_length(v_questions) not between 1 and 500
      or pg_catalog.jsonb_typeof(v_mode -> 'questionCount') <> 'number'
      or coalesce(v_mode ->> 'questionCount', '') !~ '^[1-9][0-9]{0,2}$'
      or (v_mode ->> 'questionCount')::integer
        <> pg_catalog.jsonb_array_length(v_questions)
    then
      return false;
    end if;

    v_question_count := pg_catalog.jsonb_array_length(v_questions);
    for v_question, v_ordinal in
      select question_row.value, question_row.ordinality
      from pg_catalog.jsonb_array_elements(v_questions)
        with ordinality as question_row(value, ordinality)
    loop
      if pg_catalog.jsonb_typeof(v_question) <> 'object'
        or pg_catalog.jsonb_typeof(v_question -> 'number') <> 'number'
        or coalesce(v_question ->> 'number', '') !~ '^[1-9][0-9]{0,2}$'
        or (v_question ->> 'number')::integer <> v_ordinal::integer
        or v_ordinal > v_question_count
        or pg_catalog.jsonb_typeof(v_question -> 'prompt') <> 'string'
        or pg_catalog.char_length(v_question ->> 'prompt') not between 1 and 4000
        or pg_catalog.jsonb_typeof(v_question -> 'options') <> 'array'
        or pg_catalog.jsonb_array_length(v_question -> 'options') <> 3
        or pg_catalog.jsonb_typeof(v_question -> 'answer') <> 'string'
        or pg_catalog.char_length(v_question ->> 'answer') not between 1 and 500
      then
        return false;
      end if;

      v_seen_options := '{}'::jsonb;
      for v_option in
        select value
        from pg_catalog.jsonb_array_elements(v_question -> 'options')
      loop
        if pg_catalog.jsonb_typeof(v_option) <> 'string' then
          return false;
        end if;
        v_option_text := v_option #>> '{}';
        if pg_catalog.char_length(v_option_text) not between 1 and 500
          or v_option_text ~ '[[:cntrl:]]'
          or v_seen_options ? v_option_text
        then
          return false;
        end if;
        v_seen_options := v_seen_options
          || pg_catalog.jsonb_build_object(v_option_text, true);
      end loop;

      v_answer := v_question ->> 'answer';
      if not (v_seen_options ? v_answer) then
        return false;
      end if;
    end loop;
  end loop;

  return v_seen_modes ?& array['standard', 'medium', 'hard', 'hell'];
exception
  when invalid_text_representation or numeric_value_out_of_range then
    return false;
end;
$$;

-- Students need prompts and options but never the answer key. Scoring uses the
-- untouched private JSON inside song_appreciation_attempt_save.
create or replace function public._song_appreciation_public_exercises(p_modes jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    pg_catalog.jsonb_agg(
      (mode_row.value - 'questions')
      || pg_catalog.jsonb_build_object(
        'questions',
        (
          select coalesce(
            pg_catalog.jsonb_agg(
              question_row.value - 'answer'
              order by question_row.ordinality
            ),
            '[]'::jsonb
          )
          from pg_catalog.jsonb_array_elements(mode_row.value -> 'questions')
            with ordinality as question_row(value, ordinality)
        )
      )
      order by mode_row.ordinality
    ),
    '[]'::jsonb
  )
  from pg_catalog.jsonb_array_elements(p_modes)
    with ordinality as mode_row(value, ordinality);
$$;

create table if not exists public.song_appreciation_admin_accounts (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  name text not null,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  check (name = pg_catalog.btrim(name)),
  check (pg_catalog.char_length(name) between 1 and 100),
  check (name !~ '[[:cntrl:]]'),
  check (password_hash ~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$')
);

create unique index if not exists song_appreciation_admin_name_lower_idx
  on public.song_appreciation_admin_accounts (pg_catalog.lower(name));

create table if not exists public.song_appreciation_admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null
    references public.song_appreciation_admin_accounts(id) on delete cascade,
  created_at timestamptz not null default pg_catalog.now(),
  expires_at timestamptz not null,
  check (pg_catalog.octet_length(token_hash) = 32),
  check (expires_at > created_at),
  check (expires_at <= created_at + interval '8 hours')
);

create index if not exists song_appreciation_admin_sessions_admin_idx
  on public.song_appreciation_admin_sessions (admin_id);
create index if not exists song_appreciation_admin_sessions_expires_idx
  on public.song_appreciation_admin_sessions (expires_at);

-- Database-side throttling is the last line of defence when no Worker is in
-- front of the Data API. Known accounts receive their own bucket; every
-- unknown name shares one bucket so randomized usernames cannot force an
-- unbounded stream of bcrypt work or database rows.
create table if not exists public.song_appreciation_admin_login_throttles (
  login_key_hash bytea primary key,
  failed_attempts integer not null,
  window_started_at timestamptz not null,
  locked_until timestamptz,
  last_failed_at timestamptz not null,
  check (pg_catalog.octet_length(login_key_hash) = 32),
  check (failed_attempts between 1 and 5),
  check (locked_until is null or locked_until >= last_failed_at)
);

create index if not exists song_appreciation_admin_login_throttles_stale_idx
  on public.song_appreciation_admin_login_throttles (last_failed_at);

create table if not exists public.song_appreciation_songs (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  slug text not null,
  title text not null,
  singer text not null,
  exercise_name text not null,
  description text not null,
  youtube_url text,
  tags text[] not null default '{}'::text[],
  translations jsonb not null default '[]'::jsonb,
  exercises jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  check (slug = pg_catalog.lower(pg_catalog.btrim(slug))),
  check (pg_catalog.char_length(slug) between 1 and 160),
  check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  check (title = pg_catalog.btrim(title)),
  check (pg_catalog.char_length(title) between 1 and 240),
  check (title !~ '[[:cntrl:]]'),
  check (singer = pg_catalog.btrim(singer)),
  check (pg_catalog.char_length(singer) between 1 and 160),
  check (singer !~ '[[:cntrl:]]'),
  check (exercise_name = pg_catalog.btrim(exercise_name)),
  check (pg_catalog.char_length(exercise_name) between 1 and 240),
  check (exercise_name !~ '[[:cntrl:]]'),
  check (pg_catalog.char_length(description) between 1 and 12000),
  check (public._song_appreciation_youtube_url_valid(youtube_url)),
  check (public._song_appreciation_tags_valid(tags)),
  check (pg_catalog.jsonb_typeof(translations) = 'array'),
  check (pg_catalog.octet_length(translations::text) <= 2097152),
  check (public._song_appreciation_translations_valid(translations)),
  check (pg_catalog.jsonb_typeof(exercises) = 'array'),
  check (pg_catalog.octet_length(exercises::text) <= 2097152),
  check (exercises = '[]'::jsonb or public._song_appreciation_exercises_valid(exercises)),
  check (not published or public._song_appreciation_exercises_valid(exercises)),
  check (sort_order between -1000000 and 1000000)
);

create unique index if not exists song_appreciation_songs_slug_idx
  on public.song_appreciation_songs (slug);
create index if not exists song_appreciation_songs_public_order_idx
  on public.song_appreciation_songs (published, sort_order, title, id);
create index if not exists song_appreciation_songs_tags_gin_idx
  on public.song_appreciation_songs using gin (tags);

-- An absent row means allowed. Only exceptions to that default are stored.
create table if not exists public.song_appreciation_access_overrides (
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  song_id uuid not null
    references public.song_appreciation_songs(id) on delete cascade,
  allowed boolean not null,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  primary key (student_id, song_id)
);

create index if not exists song_appreciation_access_song_idx
  on public.song_appreciation_access_overrides (song_id, student_id);

create table if not exists public.song_appreciation_bookmarks (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  song_id uuid not null
    references public.song_appreciation_songs(id) on delete cascade,
  kind text not null,
  bookmark_text text not null,
  source_text text not null default '',
  source_locator jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default pg_catalog.now(),
  check (kind in ('word', 'phrase')),
  check (bookmark_text = pg_catalog.btrim(bookmark_text)),
  check (pg_catalog.char_length(bookmark_text) between 1 and 500),
  check (bookmark_text !~ '[[:cntrl:]]'),
  check (pg_catalog.char_length(source_text) <= 1500),
  check (pg_catalog.jsonb_typeof(source_locator) = 'object'),
  check (pg_catalog.octet_length(source_locator::text) <= 8192)
);

create index if not exists song_appreciation_bookmarks_student_created_idx
  on public.song_appreciation_bookmarks (student_id, created_at desc, id);
create index if not exists song_appreciation_bookmarks_song_idx
  on public.song_appreciation_bookmarks (song_id, student_id);
create unique index if not exists song_appreciation_bookmarks_identity_idx
  on public.song_appreciation_bookmarks (
    student_id,
    song_id,
    kind,
    extensions.digest(bookmark_text, 'sha256'),
    extensions.digest(source_text, 'sha256')
  );

-- Each row is an immutable, completed submission. Client-generated UUIDs make
-- retries idempotent; a retry with different content is rejected.
create table if not exists public.song_appreciation_attempts (
  id uuid primary key,
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  song_id uuid not null
    references public.song_appreciation_songs(id) on delete cascade,
  mode_id text not null,
  exercise_version integer not null,
  answers jsonb not null,
  result jsonb not null,
  correct_count integer not null,
  total_count integer not null,
  duration_ms bigint not null,
  started_at timestamptz not null,
  completed_at timestamptz not null,
  created_at timestamptz not null default pg_catalog.now(),
  check (pg_catalog.jsonb_typeof(answers) = 'object'),
  check (pg_catalog.octet_length(answers::text) <= 262144),
  check (pg_catalog.jsonb_typeof(result) = 'object'),
  check (pg_catalog.octet_length(result::text) <= 524288),
  check (total_count between 1 and 500),
  check (correct_count between 0 and total_count),
  check (mode_id in ('standard', 'medium', 'hard', 'hell')),
  check (exercise_version between 1 and 100000),
  check (duration_ms between 0 and 14400000),
  check (completed_at >= started_at)
);

create index if not exists song_appreciation_attempts_student_completed_idx
  on public.song_appreciation_attempts (student_id, completed_at desc, id);
create index if not exists song_appreciation_attempts_student_song_idx
  on public.song_appreciation_attempts (student_id, song_id, completed_at desc);
create index if not exists song_appreciation_attempts_song_idx
  on public.song_appreciation_attempts (song_id, completed_at desc);

alter table public.song_appreciation_admin_accounts enable row level security;
alter table public.song_appreciation_admin_sessions enable row level security;
alter table public.song_appreciation_admin_login_throttles enable row level security;
alter table public.song_appreciation_songs enable row level security;
alter table public.song_appreciation_access_overrides enable row level security;
alter table public.song_appreciation_bookmarks enable row level security;
alter table public.song_appreciation_attempts enable row level security;

-- No permissive policies are created. Browser roles have no direct table
-- privileges; all authorized access is mediated by the RPCs below.
revoke all on table public.song_appreciation_admin_accounts
  from public, anon, authenticated, service_role;
revoke all on table public.song_appreciation_admin_sessions
  from public, anon, authenticated, service_role;
revoke all on table public.song_appreciation_admin_login_throttles
  from public, anon, authenticated, service_role;
revoke all on table public.song_appreciation_songs
  from public, anon, authenticated, service_role;
revoke all on table public.song_appreciation_access_overrides
  from public, anon, authenticated, service_role;
revoke all on table public.song_appreciation_bookmarks
  from public, anon, authenticated, service_role;
revoke all on table public.song_appreciation_attempts
  from public, anon, authenticated, service_role;

create or replace function public._song_appreciation_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := pg_catalog.clock_timestamp();
  return new;
end;
$$;

drop trigger if exists song_appreciation_admin_accounts_touch_updated_at
  on public.song_appreciation_admin_accounts;
create trigger song_appreciation_admin_accounts_touch_updated_at
before update on public.song_appreciation_admin_accounts
for each row execute function public._song_appreciation_touch_updated_at();

drop trigger if exists song_appreciation_songs_touch_updated_at
  on public.song_appreciation_songs;
create trigger song_appreciation_songs_touch_updated_at
before update on public.song_appreciation_songs
for each row execute function public._song_appreciation_touch_updated_at();

drop trigger if exists song_appreciation_access_touch_updated_at
  on public.song_appreciation_access_overrides;
create trigger song_appreciation_access_touch_updated_at
before update on public.song_appreciation_access_overrides
for each row execute function public._song_appreciation_touch_updated_at();

create or replace function public._song_appreciation_revoke_admin_sessions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.password_hash is distinct from new.password_hash
    or old.is_active is distinct from new.is_active
  then
    delete from public.song_appreciation_admin_sessions session_row
    where session_row.admin_id = new.id;

    delete from public.song_appreciation_admin_login_throttles throttle
    where throttle.login_key_hash = extensions.digest(
      pg_catalog.convert_to('known:' || new.id::text, 'UTF8'),
      'sha256'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists song_appreciation_admin_security_change
  on public.song_appreciation_admin_accounts;
create trigger song_appreciation_admin_security_change
after update of password_hash, is_active
on public.song_appreciation_admin_accounts
for each row execute function public._song_appreciation_revoke_admin_sessions();

create or replace function public._song_appreciation_admin_id(p_admin_token uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select session_row.admin_id
  from public.song_appreciation_admin_sessions session_row
  join public.song_appreciation_admin_accounts account
    on account.id = session_row.admin_id
  where session_row.token_hash = extensions.digest(
      pg_catalog.convert_to(p_admin_token::text, 'UTF8'),
      'sha256'
    )
    and session_row.expires_at > pg_catalog.now()
    and account.is_active
  limit 1;
$$;

create or replace function public._song_appreciation_student_id(p_student_token uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select session_row.student_id
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student
    on student.id = session_row.student_id
  where session_row.token = p_student_token
    and session_row.expires_at > pg_catalog.now()
    and student.deleted_at is null
  limit 1;
$$;

create or replace function public._song_appreciation_student_can_access(
  p_student_id uuid,
  p_song_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.song_appreciation_songs song
    where song.id = p_song_id
      and song.published
      and not exists (
        select 1
        from public.song_appreciation_access_overrides access_row
        where access_row.student_id = p_student_id
          and access_row.song_id = song.id
          and not access_row.allowed
      )
  );
$$;

-- Owner-only provisioning. Generate a cost-12 bcrypt hash locally and pass
-- only that one-way hash. Re-provisioning rotates the password and revokes all
-- existing Song Appreciation admin sessions.
create or replace function public.song_appreciation_provision_admin(
  p_name text,
  p_password_hash text
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
    or coalesce(p_password_hash, '')
      !~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$'
  then
    raise exception 'A valid name and cost-12 bcrypt hash are required'
      using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'song-appreciation-admin:' || pg_catalog.lower(v_name),
      0
    )
  );

  select account.id
  into v_admin_id
  from public.song_appreciation_admin_accounts account
  where pg_catalog.lower(account.name) = pg_catalog.lower(v_name)
  limit 1
  for update;

  if v_admin_id is null then
    insert into public.song_appreciation_admin_accounts (
      name,
      password_hash,
      is_active
    ) values (
      v_name,
      p_password_hash,
      true
    )
    returning id into v_admin_id;
  else
    update public.song_appreciation_admin_accounts account
    set name = v_name,
        password_hash = p_password_hash,
        is_active = true
    where account.id = v_admin_id;
  end if;

  delete from public.song_appreciation_admin_sessions session_row
  where session_row.admin_id = v_admin_id;

  return query
  select account.id, account.name
  from public.song_appreciation_admin_accounts account
  where account.id = v_admin_id;
end;
$$;

create or replace function public.song_appreciation_admin_login(
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
  v_admin public.song_appreciation_admin_accounts%rowtype;
  v_account_found boolean := false;
  v_throttle_found boolean := false;
  v_prior_failed_attempts integer;
  v_window_started_at timestamptz;
  v_locked_until timestamptz;
  v_login_key_hash bytea;
  v_password_ok boolean := false;
  v_failed_attempts integer;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_token uuid := pg_catalog.gen_random_uuid();
  v_expires_at timestamptz := v_now + interval '8 hours';
begin
  if pg_catalog.char_length(v_name) not between 1 and 100
    or p_password is null
    -- bcrypt only considers the first 72 bytes. Reject longer inputs instead
    -- of silently making distinct passwords authenticate as the same value.
    or pg_catalog.octet_length(p_password) not between 1 and 72
  then
    return;
  end if;

  delete from public.song_appreciation_admin_login_throttles throttle
  where throttle.last_failed_at < v_now - interval '24 hours';

  select account.*
  into v_admin
  from public.song_appreciation_admin_accounts account
  where pg_catalog.lower(account.name) = v_name
  limit 1
  for update;
  v_account_found := found;

  v_login_key_hash := extensions.digest(
    pg_catalog.convert_to(
      case
        when v_account_found then 'known:' || v_admin.id::text
        else 'unknown'
      end,
      'UTF8'
    ),
    'sha256'
  );

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'song-appreciation-login:'
        || pg_catalog.encode(v_login_key_hash, 'hex'),
      0
    )
  );

  select
    throttle.failed_attempts,
    throttle.window_started_at,
    throttle.locked_until
  into
    v_prior_failed_attempts,
    v_window_started_at,
    v_locked_until
  from public.song_appreciation_admin_login_throttles throttle
  where throttle.login_key_hash = v_login_key_hash
  for update;
  v_throttle_found := found;

  if v_throttle_found and v_locked_until > v_now then
    return;
  end if;

  if v_throttle_found
    and v_window_started_at <= v_now - interval '15 minutes'
  then
    delete from public.song_appreciation_admin_login_throttles throttle
    where throttle.login_key_hash = v_login_key_hash;
    v_throttle_found := false;
    v_prior_failed_attempts := null;
    v_window_started_at := null;
  end if;

  if v_account_found then
    v_password_ok := v_admin.password_hash
      = extensions.crypt(p_password, v_admin.password_hash);
  else
    -- The single unknown-name bucket allows only five dummy bcrypt operations
    -- per window, preventing randomized usernames from becoming a CPU attack.
    perform extensions.crypt(p_password, extensions.gen_salt('bf', 12));
  end if;

  if not v_account_found or not v_admin.is_active or not v_password_ok then
    v_failed_attempts := least(
      coalesce(v_prior_failed_attempts, 0) + 1,
      5
    );

    insert into public.song_appreciation_admin_login_throttles as throttle (
      login_key_hash,
      failed_attempts,
      window_started_at,
      locked_until,
      last_failed_at
    ) values (
      v_login_key_hash,
      v_failed_attempts,
      case
        when v_throttle_found then v_window_started_at
        else v_now
      end,
      case
        when v_failed_attempts >= 5 then v_now + interval '15 minutes'
        else null
      end,
      v_now
    )
    on conflict (login_key_hash) do update
    set failed_attempts = excluded.failed_attempts,
        window_started_at = excluded.window_started_at,
        locked_until = excluded.locked_until,
        last_failed_at = excluded.last_failed_at;
    return;
  end if;

  delete from public.song_appreciation_admin_login_throttles throttle
  where throttle.login_key_hash = v_login_key_hash;

  delete from public.song_appreciation_admin_sessions session_row
  where session_row.expires_at <= v_now;

  insert into public.song_appreciation_admin_sessions (
    token_hash,
    admin_id,
    created_at,
    expires_at
  ) values (
    extensions.digest(pg_catalog.convert_to(v_token::text, 'UTF8'), 'sha256'),
    v_admin.id,
    v_now,
    v_expires_at
  );

  return query select v_admin.id, v_token, v_admin.name, v_expires_at;
end;
$$;

create or replace function public.song_appreciation_admin_me(p_admin_token uuid)
returns table (id uuid, name text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select account.id, account.name, session_row.expires_at
  from public.song_appreciation_admin_sessions session_row
  join public.song_appreciation_admin_accounts account
    on account.id = session_row.admin_id
  where session_row.token_hash = extensions.digest(
      pg_catalog.convert_to(p_admin_token::text, 'UTF8'),
      'sha256'
    )
    and session_row.expires_at > pg_catalog.now()
    and account.is_active
  limit 1;
$$;

create or replace function public.song_appreciation_admin_logout(p_admin_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public._song_appreciation_admin_id(p_admin_token) is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  delete from public.song_appreciation_admin_sessions session_row
  where session_row.token_hash = extensions.digest(
    pg_catalog.convert_to(p_admin_token::text, 'UTF8'),
    'sha256'
  );
  return found;
end;
$$;

create or replace function public.song_appreciation_student_me(p_student_token uuid)
returns table (
  id uuid,
  name text,
  access jsonb,
  session_expires_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select student.id, student.name, student.access, session_row.expires_at
  from public.flashcard_student_sessions session_row
  join public.flashcard_students student
    on student.id = session_row.student_id
  where session_row.token = p_student_token
    and session_row.expires_at > pg_catalog.now()
    and student.deleted_at is null
  limit 1;
$$;

create or replace function public.song_appreciation_student_list_songs(
  p_student_token uuid
)
returns table (
  id uuid,
  slug text,
  title text,
  singer text,
  exercise_name text,
  description text,
  youtube_url text,
  tags text[],
  sort_order integer,
  bookmark_count bigint,
  attempt_count bigint,
  latest_completed_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public._song_appreciation_student_id(p_student_token);
begin
  if v_student_id is null then
    return;
  end if;

  return query
  select
    song.id,
    song.slug,
    song.title,
    song.singer,
    song.exercise_name,
    song.description,
    song.youtube_url,
    song.tags,
    song.sort_order,
    (
      select pg_catalog.count(*)
      from public.song_appreciation_bookmarks bookmark
      where bookmark.student_id = v_student_id
        and bookmark.song_id = song.id
    ),
    (
      select pg_catalog.count(*)
      from public.song_appreciation_attempts attempt
      where attempt.student_id = v_student_id
        and attempt.song_id = song.id
    ),
    (
      select pg_catalog.max(attempt.completed_at)
      from public.song_appreciation_attempts attempt
      where attempt.student_id = v_student_id
        and attempt.song_id = song.id
    )
  from public.song_appreciation_songs song
  where song.published
    and not exists (
      select 1
      from public.song_appreciation_access_overrides access_row
      where access_row.student_id = v_student_id
        and access_row.song_id = song.id
        and not access_row.allowed
    )
  order by song.sort_order, pg_catalog.lower(song.title), song.id;
end;
$$;

create or replace function public.song_appreciation_student_get_song(
  p_student_token uuid,
  p_song_id uuid
)
returns table (
  id uuid,
  slug text,
  title text,
  singer text,
  exercise_name text,
  description text,
  youtube_url text,
  tags text[],
  translations jsonb,
  exercises jsonb,
  sort_order integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public._song_appreciation_student_id(p_student_token);
begin
  if v_student_id is null
    or not public._song_appreciation_student_can_access(v_student_id, p_song_id)
  then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  return query
  select
    song.id,
    song.slug,
    song.title,
    song.singer,
    song.exercise_name,
    song.description,
    song.youtube_url,
    song.tags,
    song.translations,
    public._song_appreciation_public_exercises(song.exercises),
    song.sort_order,
    song.created_at,
    song.updated_at
  from public.song_appreciation_songs song
  where song.id = p_song_id;
end;
$$;

create or replace function public.song_appreciation_bookmark_list(
  p_student_token uuid,
  p_song_id uuid,
  p_offset integer,
  p_limit integer
)
returns table (
  id uuid,
  song_id uuid,
  song_title text,
  singer text,
  kind text,
  bookmark_text text,
  source_text text,
  source_locator jsonb,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public._song_appreciation_student_id(p_student_token);
begin
  if v_student_id is null then
    return;
  end if;
  if p_offset is null
    or p_limit is null
    or p_offset not between 0 and 100000
    or p_limit not between 1 and 500
  then
    raise exception 'Invalid bookmark page' using errcode = '22023';
  end if;

  return query
  select
    bookmark.id,
    bookmark.song_id,
    song.title,
    song.singer,
    bookmark.kind,
    bookmark.bookmark_text,
    bookmark.source_text,
    bookmark.source_locator,
    bookmark.created_at
  from public.song_appreciation_bookmarks bookmark
  join public.song_appreciation_songs song
    on song.id = bookmark.song_id
  where bookmark.student_id = v_student_id
    and (p_song_id is null or bookmark.song_id = p_song_id)
    and song.published
    and not exists (
      select 1
      from public.song_appreciation_access_overrides access_row
      where access_row.student_id = v_student_id
        and access_row.song_id = bookmark.song_id
        and not access_row.allowed
    )
  order by bookmark.created_at desc, bookmark.id
  offset p_offset
  limit p_limit;
end;
$$;

create or replace function public.song_appreciation_bookmark_add(
  p_student_token uuid,
  p_song_id uuid,
  p_kind text,
  p_bookmark_text text,
  p_source_text text,
  p_source_locator jsonb
)
returns table (
  id uuid,
  song_id uuid,
  kind text,
  bookmark_text text,
  source_text text,
  source_locator jsonb,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public._song_appreciation_student_id(p_student_token);
  v_kind text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_kind, '')));
  v_text text := pg_catalog.btrim(coalesce(p_bookmark_text, ''));
  v_source_text text := coalesce(p_source_text, '');
  v_source_locator jsonb := coalesce(p_source_locator, '{}'::jsonb);
  v_id uuid;
begin
  if v_student_id is null
    or not public._song_appreciation_student_can_access(v_student_id, p_song_id)
  then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if v_kind not in ('word', 'phrase')
    or pg_catalog.char_length(v_text) not between 1 and 500
    or v_text ~ '[[:cntrl:]]'
    or pg_catalog.char_length(v_source_text) > 1500
    or pg_catalog.jsonb_typeof(v_source_locator) <> 'object'
    or pg_catalog.octet_length(v_source_locator::text) > 8192
  then
    raise exception 'Invalid bookmark' using errcode = '22023';
  end if;

  insert into public.song_appreciation_bookmarks (
    student_id,
    song_id,
    kind,
    bookmark_text,
    source_text,
    source_locator
  ) values (
    v_student_id,
    p_song_id,
    v_kind,
    v_text,
    v_source_text,
    v_source_locator
  )
  on conflict do nothing
  returning song_appreciation_bookmarks.id into v_id;

  if v_id is null then
    select bookmark.id
    into v_id
    from public.song_appreciation_bookmarks bookmark
    where bookmark.student_id = v_student_id
      and bookmark.song_id = p_song_id
      and bookmark.kind = v_kind
      and bookmark.bookmark_text = v_text
      and bookmark.source_text = v_source_text;
  end if;

  return query
  select
    bookmark.id,
    bookmark.song_id,
    bookmark.kind,
    bookmark.bookmark_text,
    bookmark.source_text,
    bookmark.source_locator,
    bookmark.created_at
  from public.song_appreciation_bookmarks bookmark
  where bookmark.id = v_id;
end;
$$;

create or replace function public.song_appreciation_bookmark_delete(
  p_student_token uuid,
  p_bookmark_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public._song_appreciation_student_id(p_student_token);
  v_song_id uuid;
begin
  if v_student_id is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  select bookmark.song_id
  into v_song_id
  from public.song_appreciation_bookmarks bookmark
  where bookmark.id = p_bookmark_id
    and bookmark.student_id = v_student_id;

  if not found then
    return false;
  end if;
  if not public._song_appreciation_student_can_access(v_student_id, v_song_id) then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  delete from public.song_appreciation_bookmarks bookmark
  where bookmark.id = p_bookmark_id
    and bookmark.student_id = v_student_id;
  return found;
end;
$$;

create or replace function public.song_appreciation_attempt_list(
  p_student_token uuid,
  p_song_id uuid,
  p_offset integer,
  p_limit integer
)
returns table (
  id uuid,
  song_id uuid,
  song_title text,
  exercise_name text,
  mode_id text,
  exercise_version integer,
  answers jsonb,
  result jsonb,
  correct_count integer,
  total_count integer,
  duration_ms bigint,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public._song_appreciation_student_id(p_student_token);
begin
  if v_student_id is null then
    return;
  end if;
  if p_offset is null
    or p_limit is null
    or p_offset not between 0 and 100000
    or p_limit not between 1 and 500
  then
    raise exception 'Invalid attempt page' using errcode = '22023';
  end if;

  return query
  select
    attempt.id,
    attempt.song_id,
    song.title,
    song.exercise_name,
    attempt.mode_id,
    attempt.exercise_version,
    attempt.answers,
    attempt.result,
    attempt.correct_count,
    attempt.total_count,
    attempt.duration_ms,
    attempt.started_at,
    attempt.completed_at,
    attempt.created_at
  from public.song_appreciation_attempts attempt
  join public.song_appreciation_songs song
    on song.id = attempt.song_id
  where attempt.student_id = v_student_id
    and (p_song_id is null or attempt.song_id = p_song_id)
    and song.published
    and not exists (
      select 1
      from public.song_appreciation_access_overrides access_row
      where access_row.student_id = v_student_id
        and access_row.song_id = attempt.song_id
        and not access_row.allowed
    )
  order by attempt.completed_at desc, attempt.id
  offset p_offset
  limit p_limit;
end;
$$;

-- Remove the pre-hardening overload. Its caller supplied scores and answer
-- keys, so merely adding a safer overload would leave an insecure RPC usable.
drop function if exists public.song_appreciation_attempt_save(
  uuid, uuid, uuid, text, integer, jsonb, jsonb, integer, integer, bigint,
  timestamptz, timestamptz
);

create or replace function public.song_appreciation_attempt_save(
  p_student_token uuid,
  p_attempt_id uuid,
  p_song_id uuid,
  p_mode_id text,
  p_exercise_version integer,
  p_answers jsonb,
  p_duration_ms bigint,
  p_started_at timestamptz,
  p_completed_at timestamptz
)
returns table (
  id uuid,
  song_id uuid,
  mode_id text,
  exercise_version integer,
  answers jsonb,
  result jsonb,
  correct_count integer,
  total_count integer,
  duration_ms bigint,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := public._song_appreciation_student_id(p_student_token);
  v_existing public.song_appreciation_attempts%rowtype;
  v_mode_id text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_mode_id, '')));
  v_exercises jsonb;
  v_mode jsonb;
  v_questions jsonb;
  v_question jsonb;
  v_ordinal bigint;
  v_question_key text;
  v_selected_json jsonb;
  v_selected text;
  v_answer text;
  v_stored_version integer;
  v_answer_count integer;
  v_total_count integer;
  v_correct_count integer := 0;
  v_result jsonb := '{}'::jsonb;
  v_now timestamptz := pg_catalog.clock_timestamp();
begin
  if v_student_id is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  if p_attempt_id is null
    or v_mode_id not in ('standard', 'medium', 'hard', 'hell')
    or p_exercise_version is null
    or p_exercise_version not between 1 and 100000
    or p_answers is null
    or pg_catalog.jsonb_typeof(p_answers) <> 'object'
    or pg_catalog.octet_length(p_answers::text) > 262144
    or p_duration_ms is null
    or p_duration_ms not between 0 and 14400000
    or p_started_at is null
    or p_completed_at is null
    or p_started_at < timestamptz '2020-01-01 00:00:00+00'
    or p_completed_at < p_started_at
  then
    raise exception 'Invalid completed attempt' using errcode = '22023';
  end if;

  -- Lock the content row for the duration of a new submission. The same query
  -- enforces publication and the missing-row-means-allowed override rule.
  select song.exercises
  into v_exercises
  from public.song_appreciation_songs song
  where song.id = p_song_id
    and song.published
    and not exists (
      select 1
      from public.song_appreciation_access_overrides access_row
      where access_row.student_id = v_student_id
        and access_row.song_id = song.id
        and not access_row.allowed
    )
  for share;

  if not found then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(
      'song-appreciation-attempt:' || p_attempt_id::text,
      0
    )
  );

  select attempt.*
  into v_existing
  from public.song_appreciation_attempts attempt
  where attempt.id = p_attempt_id;

  if found then
    if v_existing.student_id is distinct from v_student_id
      or v_existing.song_id is distinct from p_song_id
      or v_existing.mode_id is distinct from v_mode_id
      or v_existing.exercise_version is distinct from p_exercise_version
      or v_existing.answers is distinct from p_answers
      or v_existing.duration_ms is distinct from p_duration_ms
      or v_existing.started_at is distinct from p_started_at
      or v_existing.completed_at is distinct from p_completed_at
    then
      raise exception 'Attempt UUID already belongs to different content'
        using errcode = '23505';
    end if;
  else
    -- Refresh after any row/advisory-lock wait so the accepted completion
    -- window is measured against validation time, not function-entry time.
    v_now := pg_catalog.clock_timestamp();
    if p_completed_at < v_now - interval '10 minutes'
      or p_completed_at > v_now + interval '5 minutes'
      or p_started_at < p_completed_at - interval '4 hours 5 minutes'
      or p_duration_ms > (
        pg_catalog.date_part('epoch', p_completed_at - p_started_at) * 1000
      )::bigint + 60000
    then
      raise exception 'Attempt timing is outside the accepted submission window'
        using errcode = '22023';
    end if;

    if not public._song_appreciation_exercises_valid(v_exercises) then
      raise exception 'Stored exercise definition is invalid'
        using errcode = '22023';
    end if;

    select mode_row.value
    into v_mode
    from pg_catalog.jsonb_array_elements(v_exercises) mode_row(value)
    where mode_row.value ->> 'id' = v_mode_id
    limit 1;

    if not found then
      raise exception 'Exercise mode not found' using errcode = '22023';
    end if;

    v_stored_version := case
      when v_mode ? 'version' then (v_mode ->> 'version')::integer
      else 1
    end;
    if p_exercise_version <> v_stored_version then
      raise exception 'Exercise version is stale' using errcode = '22023';
    end if;

    v_questions := v_mode -> 'questions';
    v_total_count := pg_catalog.jsonb_array_length(v_questions);
    select pg_catalog.count(*)::integer
    into v_answer_count
    from pg_catalog.jsonb_object_keys(p_answers);
    if v_answer_count <> v_total_count then
      raise exception 'Every exercise question must be answered exactly once'
        using errcode = '22023';
    end if;

    for v_question, v_ordinal in
      select question_row.value, question_row.ordinality
      from pg_catalog.jsonb_array_elements(v_questions)
        with ordinality as question_row(value, ordinality)
    loop
      v_question_key := v_ordinal::text;
      v_selected_json := p_answers -> v_question_key;
      if pg_catalog.jsonb_typeof(v_selected_json) <> 'string' then
        raise exception 'Invalid answer for question %', v_question_key
          using errcode = '22023';
      end if;

      v_selected := v_selected_json #>> '{}';
      if not exists (
        select 1
        from pg_catalog.jsonb_array_elements_text(v_question -> 'options')
          option_row(option_text)
        where option_row.option_text = v_selected
      ) then
        raise exception 'Answer is not an option for question %', v_question_key
          using errcode = '22023';
      end if;

      v_answer := v_question ->> 'answer';
      if v_selected = v_answer then
        v_correct_count := v_correct_count + 1;
      end if;
      v_result := v_result || pg_catalog.jsonb_build_object(
        v_question_key,
        pg_catalog.jsonb_build_object(
          'selected', v_selected,
          'answer', v_answer,
          'correct', v_selected = v_answer
        )
      );
    end loop;

    if pg_catalog.octet_length(v_result::text) > 524288 then
      raise exception 'Computed result is too large' using errcode = '22023';
    end if;

    insert into public.song_appreciation_attempts (
      id,
      student_id,
      song_id,
      mode_id,
      exercise_version,
      answers,
      result,
      correct_count,
      total_count,
      duration_ms,
      started_at,
      completed_at
    ) values (
      p_attempt_id,
      v_student_id,
      p_song_id,
      v_mode_id,
      p_exercise_version,
      p_answers,
      v_result,
      v_correct_count,
      v_total_count,
      p_duration_ms,
      p_started_at,
      p_completed_at
    );
  end if;

  return query
  select
    attempt.id,
    attempt.song_id,
    attempt.mode_id,
    attempt.exercise_version,
    attempt.answers,
    attempt.result,
    attempt.correct_count,
    attempt.total_count,
    attempt.duration_ms,
    attempt.started_at,
    attempt.completed_at,
    attempt.created_at
  from public.song_appreciation_attempts attempt
  where attempt.id = p_attempt_id;
end;
$$;

create or replace function public.song_appreciation_admin_list_songs(
  p_admin_token uuid
)
returns table (
  id uuid,
  slug text,
  title text,
  singer text,
  exercise_name text,
  description text,
  youtube_url text,
  tags text[],
  translations jsonb,
  exercises jsonb,
  published boolean,
  sort_order integer,
  created_at timestamptz,
  updated_at timestamptz,
  denied_student_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    song.id,
    song.slug,
    song.title,
    song.singer,
    song.exercise_name,
    song.description,
    song.youtube_url,
    song.tags,
    song.translations,
    song.exercises,
    song.published,
    song.sort_order,
    song.created_at,
    song.updated_at,
    (
      select pg_catalog.count(*)
      from public.song_appreciation_access_overrides access_row
      where access_row.song_id = song.id
        and not access_row.allowed
    )
  from public.song_appreciation_songs song
  where public._song_appreciation_admin_id(p_admin_token) is not null
  order by song.sort_order, pg_catalog.lower(song.title), song.id;
$$;

create or replace function public.song_appreciation_admin_upsert_song(
  p_admin_token uuid,
  p_id uuid,
  p_slug text,
  p_title text,
  p_singer text,
  p_exercise_name text,
  p_description text,
  p_youtube_url text,
  p_tags text[],
  p_translations jsonb,
  p_exercises jsonb,
  p_published boolean,
  p_sort_order integer
)
returns table (
  id uuid,
  slug text,
  title text,
  singer text,
  exercise_name text,
  description text,
  youtube_url text,
  tags text[],
  translations jsonb,
  exercises jsonb,
  published boolean,
  sort_order integer,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid := public._song_appreciation_admin_id(p_admin_token);
  v_id uuid := p_id;
  v_slug text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_slug, '')));
  v_title text := pg_catalog.btrim(coalesce(p_title, ''));
  v_singer text := pg_catalog.btrim(coalesce(p_singer, ''));
  v_exercise_name text := pg_catalog.btrim(coalesce(p_exercise_name, ''));
  v_description text := coalesce(p_description, '');
  v_youtube_url text := nullif(pg_catalog.btrim(coalesce(p_youtube_url, '')), '');
  v_tags text[];
  v_translations jsonb := coalesce(p_translations, '[]'::jsonb);
  v_exercises jsonb := coalesce(p_exercises, '[]'::jsonb);
begin
  if v_admin_id is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;

  select coalesce(
    pg_catalog.array_agg(normalized.tag order by normalized.tag),
    '{}'::text[]
  )
  into v_tags
  from (
    select distinct pg_catalog.lower(pg_catalog.btrim(input_tag.tag)) as tag
    from pg_catalog.unnest(coalesce(p_tags, '{}'::text[])) as input_tag(tag)
  ) normalized
  where normalized.tag <> '';

  if pg_catalog.char_length(v_slug) not between 1 and 160
    or v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    or pg_catalog.char_length(v_title) not between 1 and 240
    or v_title ~ '[[:cntrl:]]'
    or pg_catalog.char_length(v_singer) not between 1 and 160
    or v_singer ~ '[[:cntrl:]]'
    or pg_catalog.char_length(v_exercise_name) not between 1 and 240
    or v_exercise_name ~ '[[:cntrl:]]'
    or pg_catalog.char_length(v_description) not between 1 and 12000
    or not public._song_appreciation_youtube_url_valid(v_youtube_url)
    or not public._song_appreciation_tags_valid(v_tags)
    or pg_catalog.jsonb_typeof(v_translations) <> 'array'
    or pg_catalog.octet_length(v_translations::text) > 2097152
    or not public._song_appreciation_translations_valid(v_translations)
    or pg_catalog.jsonb_typeof(v_exercises) <> 'array'
    or pg_catalog.octet_length(v_exercises::text) > 2097152
    or (
      v_exercises <> '[]'::jsonb
      and not public._song_appreciation_exercises_valid(v_exercises)
    )
    or p_published is null
    or (p_published and not public._song_appreciation_exercises_valid(v_exercises))
    or p_sort_order is null
    or p_sort_order not between -1000000 and 1000000
  then
    raise exception 'Invalid song payload' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('song-appreciation-song:' || v_slug, 0)
  );

  if v_id is null then
    select song.id
    into v_id
    from public.song_appreciation_songs song
    where song.slug = v_slug
    limit 1
    for update;
    v_id := coalesce(v_id, pg_catalog.gen_random_uuid());
  end if;

  insert into public.song_appreciation_songs as song (
    id,
    slug,
    title,
    singer,
    exercise_name,
    description,
    youtube_url,
    tags,
    translations,
    exercises,
    published,
    sort_order
  ) values (
    v_id,
    v_slug,
    v_title,
    v_singer,
    v_exercise_name,
    v_description,
    v_youtube_url,
    v_tags,
    v_translations,
    v_exercises,
    p_published,
    p_sort_order
  )
  on conflict (id) do update
  set slug = excluded.slug,
      title = excluded.title,
      singer = excluded.singer,
      exercise_name = excluded.exercise_name,
      description = excluded.description,
      youtube_url = excluded.youtube_url,
      tags = excluded.tags,
      translations = excluded.translations,
      exercises = excluded.exercises,
      published = excluded.published,
      sort_order = excluded.sort_order;

  return query
  select
    song.id,
    song.slug,
    song.title,
    song.singer,
    song.exercise_name,
    song.description,
    song.youtube_url,
    song.tags,
    song.translations,
    song.exercises,
    song.published,
    song.sort_order,
    song.created_at,
    song.updated_at
  from public.song_appreciation_songs song
  where song.id = v_id;
end;
$$;

create or replace function public.song_appreciation_admin_list_students_with_access(
  p_admin_token uuid,
  p_song_id uuid
)
returns table (
  student_id uuid,
  student_name text,
  explicit_allowed boolean,
  effective_allowed boolean,
  access_updated_at timestamptz,
  completed_attempts bigint,
  total_duration_ms bigint,
  latest_completed_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if public._song_appreciation_admin_id(p_admin_token) is null then
    return;
  end if;
  if not exists (
    select 1
    from public.song_appreciation_songs song
    where song.id = p_song_id
  ) then
    raise exception 'Song not found' using errcode = '22023';
  end if;

  return query
  select
    student.id,
    student.name,
    access_row.allowed,
    coalesce(access_row.allowed, true),
    access_row.updated_at,
    pg_catalog.count(attempt.id),
    coalesce(pg_catalog.sum(attempt.duration_ms), 0)::bigint,
    pg_catalog.max(attempt.completed_at)
  from public.flashcard_students student
  left join public.song_appreciation_access_overrides access_row
    on access_row.student_id = student.id
   and access_row.song_id = p_song_id
  left join public.song_appreciation_attempts attempt
    on attempt.student_id = student.id
   and attempt.song_id = p_song_id
  where student.deleted_at is null
  group by
    student.id,
    student.name,
    access_row.allowed,
    access_row.updated_at
  order by pg_catalog.lower(student.name), student.id;
end;
$$;

-- Pass NULL for p_allowed to remove the override and restore the default
-- (allowed). This makes access management reversible and avoids redundant
-- "allowed = true" rows when the administrator wants the system default.
create or replace function public.song_appreciation_admin_set_access(
  p_admin_token uuid,
  p_student_id uuid,
  p_song_id uuid,
  p_allowed boolean
)
returns table (
  student_id uuid,
  song_id uuid,
  explicit_allowed boolean,
  effective_allowed boolean,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public._song_appreciation_admin_id(p_admin_token) is null then
    raise exception 'Unauthorized' using errcode = '42501';
  end if;
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    raise exception 'Active student not found' using errcode = '22023';
  end if;
  if not exists (
    select 1
    from public.song_appreciation_songs song
    where song.id = p_song_id
  ) then
    raise exception 'Song not found' using errcode = '22023';
  end if;

  if p_allowed is null then
    delete from public.song_appreciation_access_overrides access_row
    where access_row.student_id = p_student_id
      and access_row.song_id = p_song_id;
  else
    insert into public.song_appreciation_access_overrides as access_row (
      student_id,
      song_id,
      allowed
    ) values (
      p_student_id,
      p_song_id,
      p_allowed
    )
    on conflict (student_id, song_id) do update
    set allowed = excluded.allowed;
  end if;

  return query
  select
    p_student_id,
    p_song_id,
    access_row.allowed,
    coalesce(access_row.allowed, true),
    access_row.updated_at
  from (select 1) singleton
  left join public.song_appreciation_access_overrides access_row
    on access_row.student_id = p_student_id
   and access_row.song_id = p_song_id;
end;
$$;

-- PostgreSQL grants PUBLIC execute on new functions by default. Revoke it from
-- every routine, including helpers and owner-only provisioning, then expose
-- only the browser RPC surface to the Data API roles used by the site.
revoke all on function public._song_appreciation_tags_valid(text[])
  from public, anon, authenticated, service_role;
revoke all on function public._song_appreciation_youtube_url_valid(text)
  from public, anon, authenticated, service_role;
revoke all on function public._song_appreciation_translations_valid(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._song_appreciation_exercises_valid(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._song_appreciation_public_exercises(jsonb)
  from public, anon, authenticated, service_role;
revoke all on function public._song_appreciation_touch_updated_at()
  from public, anon, authenticated, service_role;
revoke all on function public._song_appreciation_revoke_admin_sessions()
  from public, anon, authenticated, service_role;
revoke all on function public._song_appreciation_admin_id(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public._song_appreciation_student_id(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public._song_appreciation_student_can_access(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_provision_admin(text, text)
  from public, anon, authenticated, service_role;

revoke all on function public.song_appreciation_admin_login(text, text)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_admin_me(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_admin_logout(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_student_me(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_student_list_songs(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_student_get_song(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_bookmark_list(uuid, uuid, integer, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_bookmark_add(
  uuid, uuid, text, text, text, jsonb
)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_bookmark_delete(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_attempt_list(uuid, uuid, integer, integer)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_attempt_save(
  uuid, uuid, uuid, text, integer, jsonb, bigint, timestamptz, timestamptz
)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_admin_list_songs(uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_admin_upsert_song(
  uuid, uuid, text, text, text, text, text, text, text[], jsonb, jsonb,
  boolean, integer
)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_admin_list_students_with_access(uuid, uuid)
  from public, anon, authenticated, service_role;
revoke all on function public.song_appreciation_admin_set_access(
  uuid, uuid, uuid, boolean
)
  from public, anon, authenticated, service_role;

grant execute on function public.song_appreciation_admin_login(text, text)
  to anon, authenticated;
grant execute on function public.song_appreciation_admin_me(uuid)
  to anon, authenticated;
grant execute on function public.song_appreciation_admin_logout(uuid)
  to anon, authenticated;
grant execute on function public.song_appreciation_student_me(uuid)
  to anon, authenticated;
grant execute on function public.song_appreciation_student_list_songs(uuid)
  to anon, authenticated;
grant execute on function public.song_appreciation_student_get_song(uuid, uuid)
  to anon, authenticated;
grant execute on function public.song_appreciation_bookmark_list(uuid, uuid, integer, integer)
  to anon, authenticated;
grant execute on function public.song_appreciation_bookmark_add(
  uuid, uuid, text, text, text, jsonb
)
  to anon, authenticated;
grant execute on function public.song_appreciation_bookmark_delete(uuid, uuid)
  to anon, authenticated;
grant execute on function public.song_appreciation_attempt_list(uuid, uuid, integer, integer)
  to anon, authenticated;
grant execute on function public.song_appreciation_attempt_save(
  uuid, uuid, uuid, text, integer, jsonb, bigint, timestamptz, timestamptz
)
  to anon, authenticated;
grant execute on function public.song_appreciation_admin_list_songs(uuid)
  to anon, authenticated;
grant execute on function public.song_appreciation_admin_upsert_song(
  uuid, uuid, text, text, text, text, text, text, text[], jsonb, jsonb,
  boolean, integer
)
  to anon, authenticated;
grant execute on function public.song_appreciation_admin_list_students_with_access(uuid, uuid)
  to anon, authenticated;
grant execute on function public.song_appreciation_admin_set_access(
  uuid, uuid, uuid, boolean
)
  to anon, authenticated;

notify pgrst, 'reload schema';

commit;
