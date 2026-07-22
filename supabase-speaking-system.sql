-- Edmund Education Speaking System: private recording metadata and admin auth.
--
-- The Flashcard account tables remain the only student credential store. This
-- migration deliberately creates no Speaking student/password table. Run the
-- Flashcard account migration before this file.

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
  if to_regclass('storage.buckets') is null or to_regclass('storage.objects') is null then
    raise exception 'Missing dependency: Supabase Storage is not enabled';
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

-- Dedicated Speaking administrators. Provision bcrypt hashes privately with
-- speaking_provision_admin(); never put a plaintext password in this file.
create table if not exists public.speaking_admin_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (name = btrim(name)),
  check (char_length(name) between 1 and 100),
  check (name !~ '[[:cntrl:]]'),
  check (password_hash ~ '^\$2[aby]\$12\$[./A-Za-z0-9]{53}$')
);

create unique index if not exists speaking_admin_accounts_name_lower_idx
  on public.speaking_admin_accounts (lower(name));

-- Only a SHA-256 digest of each bearer token is persisted. Raw tokens are
-- returned once at login and expire after eight hours.
create table if not exists public.speaking_admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null
    references public.speaking_admin_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (octet_length(token_hash) = 32),
  check (expires_at > created_at)
);

create index if not exists speaking_admin_sessions_expires_idx
  on public.speaking_admin_sessions (expires_at);

-- Owner-configurable, database-authoritative student quotas. The Worker cannot
-- raise these limits: every reservation reads this singleton row while holding
-- a per-student transaction lock. Adjust the row only from a private SQL
-- session after reviewing project-wide Storage capacity.
create table if not exists public.speaking_system_settings (
  singleton boolean primary key default true,
  max_recordings_per_student integer not null default 500,
  max_storage_bytes_per_student bigint not null default 1073741824,
  updated_at timestamptz not null default now(),
  check (singleton),
  check (max_recordings_per_student between 1 and 5000),
  check (max_storage_bytes_per_student between 10485760 and 10737418240)
);

insert into public.speaking_system_settings (
  singleton,
  max_recordings_per_student,
  max_storage_bytes_per_student
)
values (true, 500, 1073741824)
on conflict (singleton) do nothing;

-- The object name is deterministic and server-generated:
-- students/<canonical-student-uuid>/<attempt-uuid>.mp3
create table if not exists public.speaking_recording_attempts (
  id uuid primary key,
  student_id uuid not null
    references public.flashcard_students(id) on delete restrict,
  object_path text not null unique,
  exercise_id text not null,
  exercise_title text not null,
  exam text not null,
  part_number smallint,
  book_number smallint,
  original_filename text not null,
  content_type text not null default 'audio/mpeg',
  size_bytes integer not null,
  duration_ms integer not null,
  client_duration_ms integer,
  sha256_hex text not null,
  crc32_value bigint not null,
  storage_state text not null default 'uploading',
  delete_requested_at timestamptz,
  last_storage_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    object_path = 'students/' || student_id::text || '/' || id::text || '.mp3'
  ),
  check (exercise_id ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,119}$'),
  check (exercise_title = btrim(exercise_title)),
  check (char_length(exercise_title) between 1 and 240),
  check (exercise_title !~ '[[:cntrl:]]'),
  check (exam in (
    'ielts',
    'dse',
    'business-english',
    'school-job-interview',
    'civil-service-interview'
  )),
  check (part_number is null or part_number between 1 and 99),
  check (book_number is null or book_number between 1 and 999),
  check (
    exam <> 'ielts'
    or (
      part_number is not null
      and book_number is not null
      and part_number between 1 and 3
      and book_number between 1 and 16
    )
  ),
  check (original_filename = btrim(original_filename)),
  check (char_length(original_filename) between 1 and 240),
  check (original_filename !~ '[[:cntrl:]/\\]'),
  check (content_type = 'audio/mpeg'),
  check (size_bytes between 512 and 20971520),
  check (duration_ms between 1 and 1800000),
  check (client_duration_ms is null or client_duration_ms between 0 and 1800000),
  check (sha256_hex ~ '^[0-9a-f]{64}$'),
  check (crc32_value between 0 and 4294967295),
  constraint speaking_recordings_storage_state_check
    check (storage_state in ('uploading', 'ready', 'deleting')),
  constraint speaking_recordings_delete_state_check
    check (
      (storage_state = 'deleting' and delete_requested_at is not null)
      or (
        storage_state in ('uploading', 'ready')
        and delete_requested_at is null
      )
    ),
  constraint speaking_recordings_storage_error_check
    check (
      last_storage_error is null
      or (
        char_length(last_storage_error) between 1 and 500
        and last_storage_error !~ '[[:cntrl:]]'
      )
  )
);

-- One parent row records the randomly selected questions and the student's
-- final self-evaluation. The UUID is the same attempt UUID embedded in each
-- exam recording exercise_id, so existing recording rows need no migration.
create table if not exists public.speaking_exam_attempts (
  id uuid primary key,
  student_id uuid not null
    references public.flashcard_students(id) on delete cascade,
  attempt_number bigint not null,
  exam text not null default 'ielts'
    check (exam = 'ielts'),
  mode_id text not null
    check (mode_id in ('full', 'p1', 'p2', 'p3', 'p1-p2', 'p1-p3', 'p2-p3')),
  natural_exchange boolean not null default true,
  manifest_version smallint not null default 1
    check (manifest_version = 1),
  question_manifest jsonb not null,
  skipped_question_orders smallint[] not null default '{}'::smallint[],
  nervousness_rating smallint
    check (nervousness_rating between 1 and 7),
  rated_at timestamptz,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint speaking_exam_attempt_number_positive
    check (attempt_number > 0),
  check (jsonb_typeof(question_manifest) = 'array'),
  check (
    jsonb_array_length(question_manifest) = case mode_id
      when 'full' then 19
      when 'p1' then 12
      when 'p2' then 1
      when 'p3' then 6
      when 'p1-p2' then 13
      when 'p1-p3' then 18
      when 'p2-p3' then 7
    end
  ),
  check (octet_length(question_manifest::text) between 2 and 65536),
  check (
    (nervousness_rating is null and rated_at is null and completed_at is null)
    or (
      nervousness_rating is not null
      and rated_at is not null
      and completed_at is not null
      and rated_at >= started_at
      and completed_at >= started_at
    )
  )
);

-- `attempt_number` is the authoritative per-student order for the X -> X+1
-- cooldown. Backfill it when upgrading an installation that briefly received
-- an earlier draft of this table before the ordinal was introduced.
alter table public.speaking_exam_attempts
  add column if not exists attempt_number bigint;

with ranked_attempts as (
  select id,
         row_number() over (
           partition by student_id
           order by started_at, id
         ) as ordinal
  from public.speaking_exam_attempts
)
update public.speaking_exam_attempts attempt
set attempt_number = ranked.ordinal
from ranked_attempts ranked
where attempt.id = ranked.id
  and attempt.attempt_number is null;

alter table public.speaking_exam_attempts
  alter column attempt_number set not null;

alter table public.speaking_exam_attempts
  add column if not exists skipped_question_orders smallint[]
    not null default '{}'::smallint[];

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.speaking_exam_attempts'::regclass
      and conname = 'speaking_exam_attempt_number_positive'
  ) then
    alter table public.speaking_exam_attempts
      add constraint speaking_exam_attempt_number_positive
      check (attempt_number > 0);
  end if;
end;
$$;

-- This private state is deliberately independent from the history parent, but
-- is data-minimized at write time. It retains only the monotonic ordinal/UUID
-- and the exact identities needed for the one-attempt cooldown. Prompts, mode,
-- ratings and timestamps remain solely in the deletable history parent.
create table if not exists public.speaking_exam_student_state (
  student_id uuid primary key
    references public.flashcard_students(id) on delete cascade,
  attempt_id uuid not null,
  attempt_number bigint not null
    check (attempt_number > 0),
  cooldown_manifest jsonb not null,
  constraint speaking_exam_state_cooldown_shape_check
    check (
      jsonb_typeof(cooldown_manifest) = 'array'
      and jsonb_array_length(cooldown_manifest) between 1 and 19
    ),
  constraint speaking_exam_state_cooldown_size_check
    check (octet_length(cooldown_manifest::text) between 2 and 65536)
);

-- Upgrade and immediately scrub the earlier full-snapshot draft without losing
-- cooldown after its parent has already been deleted.
alter table public.speaking_exam_student_state
  add column if not exists cooldown_manifest jsonb;

do $migration$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'speaking_exam_student_state'
      and column_name = 'question_manifest'
  ) then
    execute $sql$
      update public.speaking_exam_student_state state_row
      set cooldown_manifest = (
        select coalesce(
          jsonb_agg(
            jsonb_build_object(
              'sourceKey', question.item ->> 'sourceKey',
              'contentKey', question.item ->> 'contentKey'
            )
            order by question.ordinality
          ),
          '[]'::jsonb
        )
        from jsonb_array_elements(state_row.question_manifest)
          with ordinality as question(item, ordinality)
      )
      where state_row.cooldown_manifest is null
    $sql$;
  end if;
end;
$migration$;

-- Preserve an existing state row on reruns: it may intentionally point at a
-- latest parent that the student has since hard-deleted. Missing rows are
-- backfilled from the latest remaining visible parent.
insert into public.speaking_exam_student_state (
  student_id,
  attempt_id,
  attempt_number,
  cooldown_manifest
)
select distinct on (attempt.student_id)
  attempt.student_id,
  attempt.id,
  attempt.attempt_number,
  (
    select jsonb_agg(
      jsonb_build_object(
        'sourceKey', question.item ->> 'sourceKey',
        'contentKey', question.item ->> 'contentKey'
      )
      order by question.ordinality
    )
    from jsonb_array_elements(attempt.question_manifest)
      with ordinality as question(item, ordinality)
  )
from public.speaking_exam_attempts attempt
order by attempt.student_id, attempt.attempt_number desc
on conflict (student_id) do nothing;

alter table public.speaking_exam_student_state
  alter column cooldown_manifest set not null;

do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'public.speaking_exam_student_state'::regclass
      and conname = 'speaking_exam_state_cooldown_shape_check'
  ) then
    alter table public.speaking_exam_student_state
      add constraint speaking_exam_state_cooldown_shape_check
      check (
        jsonb_typeof(cooldown_manifest) = 'array'
        and jsonb_array_length(cooldown_manifest) between 1 and 19
      );
  end if;
  if not exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'public.speaking_exam_student_state'::regclass
      and conname = 'speaking_exam_state_cooldown_size_check'
  ) then
    alter table public.speaking_exam_student_state
      add constraint speaking_exam_state_cooldown_size_check
      check (octet_length(cooldown_manifest::text) between 2 and 65536);
  end if;
end;
$$;

-- DROP COLUMN removes the superseded same-table checks as well. No full prompt,
-- mode, self-rating or timestamp copy remains after this migration commits.
alter table public.speaking_exam_student_state
  drop column if exists mode_id,
  drop column if exists natural_exchange,
  drop column if exists manifest_version,
  drop column if exists question_manifest,
  drop column if exists skipped_question_orders,
  drop column if exists nervousness_rating,
  drop column if exists rated_at,
  drop column if exists started_at,
  drop column if exists completed_at,
  drop column if exists updated_at;

-- Upgrade a pre-lifecycle installation without treating existing valid rows as
-- incomplete uploads. Fresh installations already have these columns.
alter table public.speaking_recording_attempts
  add column if not exists storage_state text not null default 'ready';
alter table public.speaking_recording_attempts
  add column if not exists delete_requested_at timestamptz;
alter table public.speaking_recording_attempts
  add column if not exists last_storage_error text;
alter table public.speaking_recording_attempts
  add column if not exists updated_at timestamptz not null default now();
alter table public.speaking_recording_attempts
  alter column storage_state set default 'uploading';

do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'public.speaking_recording_attempts'::regclass
      and conname = 'speaking_recordings_storage_state_check'
  ) then
    alter table public.speaking_recording_attempts
      add constraint speaking_recordings_storage_state_check
      check (storage_state in ('uploading', 'ready', 'deleting'));
  end if;
  if not exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'public.speaking_recording_attempts'::regclass
      and conname = 'speaking_recordings_delete_state_check'
  ) then
    alter table public.speaking_recording_attempts
      add constraint speaking_recordings_delete_state_check
      check (
        (storage_state = 'deleting' and delete_requested_at is not null)
        or (
          storage_state in ('uploading', 'ready')
          and delete_requested_at is null
        )
      );
  end if;
  if not exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'public.speaking_recording_attempts'::regclass
      and conname = 'speaking_recordings_storage_error_check'
  ) then
    alter table public.speaking_recording_attempts
      add constraint speaking_recordings_storage_error_check
      check (
        last_storage_error is null
        or (
          char_length(last_storage_error) between 1 and 500
          and last_storage_error !~ '[[:cntrl:]]'
        )
      );
  end if;
end;
$$;

create index if not exists speaking_recordings_student_created_idx
  on public.speaking_recording_attempts (student_id, created_at desc, id desc);

create index if not exists speaking_recordings_created_idx
  on public.speaking_recording_attempts (created_at desc, id desc);

create index if not exists speaking_recordings_state_updated_idx
  on public.speaking_recording_attempts (storage_state, updated_at, id);

create index if not exists speaking_exam_attempts_student_started_idx
  on public.speaking_exam_attempts (student_id, started_at desc, id desc);

create unique index if not exists speaking_exam_attempts_student_number_uidx
  on public.speaking_exam_attempts (student_id, attempt_number);

alter table public.speaking_admin_accounts enable row level security;
alter table public.speaking_admin_sessions enable row level security;
alter table public.speaking_system_settings enable row level security;
alter table public.speaking_recording_attempts enable row level security;
alter table public.speaking_exam_attempts enable row level security;
alter table public.speaking_exam_student_state enable row level security;

revoke all on table public.speaking_admin_accounts
  from public, anon, authenticated;
revoke all on table public.speaking_admin_sessions
  from public, anon, authenticated;
revoke all on table public.speaking_system_settings
  from public, anon, authenticated, service_role;
revoke all on table public.speaking_recording_attempts
  from public, anon, authenticated;
revoke all on table public.speaking_exam_attempts
  from public, anon, authenticated;
revoke all on table public.speaking_exam_student_state
  from public, anon, authenticated;

-- The Worker may read metadata directly, but every mutation goes through a
-- transaction-locked SECURITY DEFINER function below. This prevents a race
-- between simultaneous quota checks and inserts.
revoke insert, update, delete on table public.speaking_recording_attempts
  from service_role;
grant select on table public.speaking_recording_attempts to service_role;
revoke insert, update, delete on table public.speaking_exam_attempts
  from service_role;
grant select on table public.speaking_exam_attempts to service_role;
revoke insert, update, delete on table public.speaking_exam_student_state
  from service_role;
grant select on table public.speaking_exam_student_state to service_role;

-- Keep the recording objects private. There are intentionally no anon or
-- authenticated storage.objects policies for this bucket: all object access
-- is brokered by the Speaking Worker after custom-token validation.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'speaking-recordings',
  'speaking-recordings',
  false,
  20971520,
  array['audio/mpeg']::text[]
)
on conflict (id) do update
set name = excluded.name,
    public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.speaking_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.speaking_touch_updated_at()
  from public, anon, authenticated;

drop trigger if exists speaking_admin_accounts_touch_updated_at
  on public.speaking_admin_accounts;
create trigger speaking_admin_accounts_touch_updated_at
before update on public.speaking_admin_accounts
for each row execute function public.speaking_touch_updated_at();

drop trigger if exists speaking_settings_touch_updated_at
  on public.speaking_system_settings;
create trigger speaking_settings_touch_updated_at
before update on public.speaking_system_settings
for each row execute function public.speaking_touch_updated_at();

drop trigger if exists speaking_recordings_touch_updated_at
  on public.speaking_recording_attempts;
create trigger speaking_recordings_touch_updated_at
before update on public.speaking_recording_attempts
for each row execute function public.speaking_touch_updated_at();

drop trigger if exists speaking_exam_attempts_touch_updated_at
  on public.speaking_exam_attempts;
create trigger speaking_exam_attempts_touch_updated_at
before update on public.speaking_exam_attempts
for each row execute function public.speaking_touch_updated_at();

create or replace function public.speaking_revoke_admin_sessions_on_password_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.password_hash is distinct from old.password_hash then
    delete from public.speaking_admin_sessions session_row
    where session_row.admin_id = new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.speaking_revoke_admin_sessions_on_password_change()
  from public, anon, authenticated;

drop trigger if exists speaking_admin_password_change_revoke_sessions
  on public.speaking_admin_accounts;
create trigger speaking_admin_password_change_revoke_sessions
after update of password_hash on public.speaking_admin_accounts
for each row execute function public.speaking_revoke_admin_sessions_on_password_change();

create or replace function public._speaking_admin_id(p_admin_token uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select session_row.admin_id
  from public.speaking_admin_sessions session_row
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session_row.expires_at > now()
  limit 1;
$$;

revoke all on function public._speaking_admin_id(uuid)
  from public, anon, authenticated;

-- Owner-only provisioning helper. It accepts a pre-generated cost-12 bcrypt,
-- not a plaintext password, and revokes every earlier session on rotation.
-- It is deliberately not granted to service_role or any API role.
create or replace function public.speaking_provision_admin(
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
  from public.speaking_admin_accounts account
  where lower(account.name) = lower(v_name)
  limit 1
  for update;

  if v_admin_id is null then
    insert into public.speaking_admin_accounts (name, password_hash)
    values (v_name, p_bcrypt_hash)
    returning id into v_admin_id;
  else
    update public.speaking_admin_accounts account
    set name = v_name,
        password_hash = p_bcrypt_hash,
        updated_at = now()
    where account.id = v_admin_id;
  end if;

  delete from public.speaking_admin_sessions session_row
  where session_row.admin_id = v_admin_id;

  return query
  select account.id, account.name
  from public.speaking_admin_accounts account
  where account.id = v_admin_id;
end;
$$;

revoke all on function public.speaking_provision_admin(text, text)
  from public, anon, authenticated, service_role;

create or replace function public.speaking_admin_login(
  p_name text,
  p_password text
)
returns table (admin_token uuid, name text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := lower(btrim(coalesce(p_name, '')));
  v_admin public.speaking_admin_accounts%rowtype;
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
  from public.speaking_admin_accounts account
  where lower(account.name) = v_name
  limit 1;

  if not found then
    -- Match the bcrypt work factor for an unknown name to reduce timing-based
    -- account discovery. The Worker rate limiter bounds this expensive path.
    perform extensions.crypt(p_password, extensions.gen_salt('bf', 12));
    return;
  end if;

  if v_admin.password_hash
    <> extensions.crypt(p_password, v_admin.password_hash)
  then
    return;
  end if;

  delete from public.speaking_admin_sessions session_row
  where session_row.expires_at <= v_now;

  insert into public.speaking_admin_sessions (
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

  return query select v_token, v_admin.name, v_expires_at;
end;
$$;

create or replace function public.speaking_admin_me(p_admin_token uuid)
returns table (id uuid, name text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select account.id, account.name, session_row.expires_at
  from public.speaking_admin_sessions session_row
  join public.speaking_admin_accounts account
    on account.id = session_row.admin_id
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session_row.expires_at > now()
  limit 1;
$$;

create or replace function public.speaking_admin_logout(p_admin_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.speaking_admin_sessions session_row
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256');
  return found;
end;
$$;

-- Validate the existing Flashcard bearer token directly against its canonical
-- tables. No Speaking password or shadow student session is created.
create or replace function public.speaking_student_profile(p_token uuid)
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

-- Reserve both quota and metadata before writing Storage. Every reservation and
-- terminal metadata deletion takes the same per-student advisory lock, making
-- the count/byte limits authoritative under concurrent uploads.
create or replace function public.speaking_reserve_recording_attempt(
  p_id uuid,
  p_student_id uuid,
  p_object_path text,
  p_exercise_id text,
  p_exercise_title text,
  p_exam text,
  p_part_number integer,
  p_book_number integer,
  p_original_filename text,
  p_size_bytes integer,
  p_duration_ms integer,
  p_client_duration_ms integer,
  p_sha256_hex text,
  p_crc32_value bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_settings public.speaking_system_settings%rowtype;
  v_file_count integer;
  v_total_bytes bigint;
  v_recording public.speaking_recording_attempts%rowtype;
  v_exam_attempt public.speaking_exam_attempts%rowtype;
begin
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    return jsonb_build_object('ok', false, 'code', 'STUDENT_NOT_FOUND');
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_student_id::text, 874312)
  );

  select settings.*
  into strict v_settings
  from public.speaking_system_settings settings
  where settings.singleton
  for share;

  select count(*)::integer, coalesce(sum(attempt.size_bytes), 0)::bigint
  into v_file_count, v_total_bytes
  from public.speaking_recording_attempts attempt
  where attempt.student_id = p_student_id;

  -- Exam slots carry a unique attempt/question identifier in exercise_id.
  -- Take the exam lock after the recording lock so a parent cannot be deleted
  -- between validation and insertion. Ordinary non-exam practice is repeatable.
  if p_exercise_id like 'exam:%' then
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended(p_student_id::text, 874314)
    );

    select attempt.*
    into v_exam_attempt
    from public.speaking_exam_attempts attempt
    where attempt.student_id = p_student_id
      and left(
        p_exercise_id,
        char_length(format('exam:%s:%s:', attempt.mode_id, attempt.id::text))
      ) = format('exam:%s:%s:', attempt.mode_id, attempt.id::text)
    limit 1
    for share;

    if not found then
      return jsonb_build_object('ok', false, 'code', 'EXAM_ATTEMPT_NOT_FOUND');
    end if;

    select attempt.*
    into v_recording
    from public.speaking_recording_attempts attempt
    where attempt.student_id = p_student_id
      and attempt.exercise_id = p_exercise_id
      and attempt.storage_state in ('uploading', 'ready')
    order by (attempt.storage_state = 'ready') desc, attempt.created_at desc
    limit 1;

    if found then
      if v_recording.storage_state = 'ready' then
        return jsonb_build_object(
          'ok', true,
          'idempotent', true,
          'recording', to_jsonb(v_recording),
          'usage', jsonb_build_object(
            'fileCount', v_file_count,
            'storageBytes', v_total_bytes
          ),
          'quota', jsonb_build_object(
            'maxFiles', v_settings.max_recordings_per_student,
            'maxBytes', v_settings.max_storage_bytes_per_student
          )
        );
      end if;
      return jsonb_build_object(
        'ok', false,
        'code', 'RECORDING_UPLOAD_IN_PROGRESS'
      );
    end if;

    if not (
      (
        v_exam_attempt.natural_exchange
        and p_exercise_id = format(
          'exam:%s:%s:p%s:intro',
          v_exam_attempt.mode_id,
          v_exam_attempt.id::text,
          v_exam_attempt.question_manifest -> 0 ->> 'part'
        )
      )
      or exists (
        select 1
        from jsonb_array_elements(v_exam_attempt.question_manifest) question
        where p_exercise_id = format(
          'exam:%s:%s:p%s:q%s',
          v_exam_attempt.mode_id,
          v_exam_attempt.id::text,
          question ->> 'part',
          lpad(question ->> 'order', 2, '0')
        )
      )
    ) then
      return jsonb_build_object('ok', false, 'code', 'INVALID_EXAM_RECORDING_SLOT');
    end if;

    if v_exam_attempt.completed_at is not null then
      return jsonb_build_object('ok', false, 'code', 'EXAM_ATTEMPT_ALREADY_COMPLETED');
    end if;

    if exists (
      select 1
      from jsonb_array_elements(v_exam_attempt.question_manifest) question
      where (question ->> 'order')::smallint = any(v_exam_attempt.skipped_question_orders)
        and p_exercise_id = format(
          'exam:%s:%s:p%s:q%s',
          v_exam_attempt.mode_id,
          v_exam_attempt.id::text,
          question ->> 'part',
          lpad(question ->> 'order', 2, '0')
        )
    ) then
      return jsonb_build_object('ok', false, 'code', 'EXAM_QUESTION_SKIPPED');
    end if;
  end if;

  if v_file_count >= v_settings.max_recordings_per_student then
    return jsonb_build_object(
      'ok', false,
      'code', 'STUDENT_FILE_QUOTA_REACHED',
      'usage', jsonb_build_object(
        'fileCount', v_file_count,
        'storageBytes', v_total_bytes
      ),
      'quota', jsonb_build_object(
        'maxFiles', v_settings.max_recordings_per_student,
        'maxBytes', v_settings.max_storage_bytes_per_student
      )
    );
  end if;

  if v_total_bytes + p_size_bytes > v_settings.max_storage_bytes_per_student then
    return jsonb_build_object(
      'ok', false,
      'code', 'STUDENT_STORAGE_QUOTA_REACHED',
      'usage', jsonb_build_object(
        'fileCount', v_file_count,
        'storageBytes', v_total_bytes
      ),
      'quota', jsonb_build_object(
        'maxFiles', v_settings.max_recordings_per_student,
        'maxBytes', v_settings.max_storage_bytes_per_student
      )
    );
  end if;

  insert into public.speaking_recording_attempts (
    id,
    student_id,
    object_path,
    exercise_id,
    exercise_title,
    exam,
    part_number,
    book_number,
    original_filename,
    content_type,
    size_bytes,
    duration_ms,
    client_duration_ms,
    sha256_hex,
    crc32_value,
    storage_state
  )
  values (
    p_id,
    p_student_id,
    p_object_path,
    p_exercise_id,
    p_exercise_title,
    p_exam,
    p_part_number,
    p_book_number,
    p_original_filename,
    'audio/mpeg',
    p_size_bytes,
    p_duration_ms,
    p_client_duration_ms,
    p_sha256_hex,
    p_crc32_value,
    'uploading'
  )
  returning * into v_recording;

  return jsonb_build_object(
    'ok', true,
    'recording', to_jsonb(v_recording),
    'usage', jsonb_build_object(
      'fileCount', v_file_count + 1,
      'storageBytes', v_total_bytes + p_size_bytes
    ),
    'quota', jsonb_build_object(
      'maxFiles', v_settings.max_recordings_per_student,
      'maxBytes', v_settings.max_storage_bytes_per_student
    )
  );
end;
$$;

create or replace function public.speaking_mark_recording_ready(
  p_id uuid,
  p_student_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recording public.speaking_recording_attempts%rowtype;
begin
  update public.speaking_recording_attempts attempt
  set storage_state = 'ready',
      delete_requested_at = null,
      last_storage_error = null
  where attempt.id = p_id
    and attempt.student_id = p_student_id
    and attempt.storage_state = 'uploading'
  returning attempt.* into v_recording;

  if not found then
    select attempt.*
    into v_recording
    from public.speaking_recording_attempts attempt
    where attempt.id = p_id
      and attempt.student_id = p_student_id
      and attempt.storage_state = 'ready'
    limit 1;
  end if;

  if v_recording.id is null then
    return jsonb_build_object('ok', false, 'code', 'RECORDING_STATE_CONFLICT');
  end if;
  return jsonb_build_object('ok', true, 'recording', to_jsonb(v_recording));
end;
$$;

-- Mark first, remove Storage second, and delete metadata last. A crash leaves a
-- hidden `deleting` tombstone that either a repeated DELETE or the admin
-- reconciliation endpoint can finish safely.
create or replace function public.speaking_begin_recording_delete(
  p_id uuid,
  p_student_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_recording public.speaking_recording_attempts%rowtype;
begin
  -- Resolve ownership before taking a row lock, then use the same per-student
  -- advisory lock as upload reservation and final deletion. This lock ordering
  -- avoids deadlocks with exam completion/deletion (recording lock first).
  select attempt.student_id
  into v_student_id
  from public.speaking_recording_attempts attempt
  where attempt.id = p_id
    and (p_student_id is null or attempt.student_id = p_student_id)
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'RECORDING_NOT_FOUND');
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_student_id::text, 874312)
  );

  select attempt.*
  into v_recording
  from public.speaking_recording_attempts attempt
  where attempt.id = p_id
    and attempt.student_id = v_student_id
    and (p_student_id is null or attempt.student_id = p_student_id)
  limit 1
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'RECORDING_NOT_FOUND');
  end if;

  if v_recording.storage_state = 'uploading' then
    return jsonb_build_object('ok', false, 'code', 'RECORDING_UPLOAD_IN_PROGRESS');
  end if;

  if v_recording.storage_state = 'ready' then
    update public.speaking_recording_attempts attempt
    set storage_state = 'deleting',
        delete_requested_at = clock_timestamp(),
        last_storage_error = null
    where attempt.id = v_recording.id
    returning attempt.* into v_recording;
  elsif v_recording.storage_state <> 'deleting' then
    return jsonb_build_object('ok', false, 'code', 'RECORDING_STATE_CONFLICT');
  end if;

  return jsonb_build_object('ok', true, 'recording', to_jsonb(v_recording));
end;
$$;

create or replace function public.speaking_recording_lifecycle_error(
  p_id uuid,
  p_message text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.speaking_recording_attempts attempt
  set last_storage_error = left(
    regexp_replace(coalesce(p_message, 'Storage operation failed'), '[[:cntrl:]]+', ' ', 'g'),
    500
  )
  where attempt.id = p_id
    and attempt.storage_state in ('uploading', 'deleting');
  return found;
end;
$$;

create or replace function public.speaking_claim_stale_recording_upload(
  p_id uuid,
  p_updated_before timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recording public.speaking_recording_attempts%rowtype;
begin
  update public.speaking_recording_attempts attempt
  set storage_state = 'deleting',
      delete_requested_at = clock_timestamp(),
      last_storage_error = null
  where attempt.id = p_id
    and attempt.storage_state = 'uploading'
    and attempt.updated_at <= p_updated_before
  returning attempt.* into v_recording;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'RECORDING_NOT_CLAIMED');
  end if;
  return jsonb_build_object('ok', true, 'recording', to_jsonb(v_recording));
end;
$$;

create or replace function public.speaking_finalize_recording_delete(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  select attempt.student_id
  into v_student_id
  from public.speaking_recording_attempts attempt
  where attempt.id = p_id
    and attempt.storage_state = 'deleting'
  limit 1;

  if not found then
    return not exists (
      select 1 from public.speaking_recording_attempts attempt
      where attempt.id = p_id
    );
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_student_id::text, 874312)
  );
  delete from public.speaking_recording_attempts attempt
  where attempt.id = p_id
    and attempt.student_id = v_student_id
    and attempt.storage_state = 'deleting';
  return found;
end;
$$;

-- Used only after Storage confirms an unsuccessful upload object is absent.
create or replace function public.speaking_cancel_recording_upload(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  select attempt.student_id
  into v_student_id
  from public.speaking_recording_attempts attempt
  where attempt.id = p_id
    and attempt.storage_state = 'uploading'
  limit 1;

  if not found then
    return false;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_student_id::text, 874312)
  );
  delete from public.speaking_recording_attempts attempt
  where attempt.id = p_id
    and attempt.student_id = v_student_id
    and attempt.storage_state = 'uploading';
  return found;
end;
$$;

-- Atomically creates an exam attempt and enforces the one-attempt cooldown.
-- Only the immediately preceding attempt is compared, so questions from X are
-- automatically eligible again after X+1 has been created.
create or replace function public.speaking_create_exam_attempt(
  p_id uuid,
  p_student_id uuid,
  p_mode_id text,
  p_natural_exchange boolean,
  p_question_manifest jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing public.speaking_exam_attempts%rowtype;
  v_state public.speaking_exam_student_state%rowtype;
  v_attempt public.speaking_exam_attempts%rowtype;
  v_attempt_number bigint;
  v_cooldown_manifest jsonb;
  v_started_at timestamptz;
begin
  if not exists (
    select 1
    from public.flashcard_students student
    where student.id = p_student_id
      and student.deleted_at is null
  ) then
    return jsonb_build_object('ok', false, 'code', 'STUDENT_NOT_FOUND');
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_student_id::text, 874314)
  );

  select attempt.*
  into v_existing
  from public.speaking_exam_attempts attempt
  where attempt.id = p_id
  limit 1;

  if found then
    if v_existing.student_id = p_student_id
      and v_existing.mode_id = p_mode_id
      and v_existing.natural_exchange = p_natural_exchange
      and v_existing.question_manifest = p_question_manifest
    then
      return jsonb_build_object(
        'ok', true,
        'idempotent', true,
        'attempt', to_jsonb(v_existing)
      );
    end if;
    return jsonb_build_object('ok', false, 'code', 'EXAM_ATTEMPT_CONFLICT');
  end if;

  select state_row.*
  into v_state
  from public.speaking_exam_student_state state_row
  where state_row.student_id = p_student_id
  for update;

  if v_state.attempt_id is not null and exists (
    select 1
    from jsonb_array_elements(v_state.cooldown_manifest) previous_item
    cross join jsonb_array_elements(p_question_manifest) proposed_item
    where (
      previous_item ->> 'sourceKey' <> ''
      and previous_item ->> 'sourceKey' = proposed_item ->> 'sourceKey'
    ) or (
      previous_item ->> 'contentKey' <> ''
      and previous_item ->> 'contentKey' = proposed_item ->> 'contentKey'
    )
  ) then
    return jsonb_build_object(
      'ok', false,
      'code', 'EXAM_COOLDOWN_CONFLICT',
      'latestAttemptId', v_state.attempt_id
    );
  end if;

  v_attempt_number := coalesce(v_state.attempt_number, 0) + 1;
  v_started_at := clock_timestamp();
  select jsonb_agg(
    jsonb_build_object(
      'sourceKey', question.item ->> 'sourceKey',
      'contentKey', question.item ->> 'contentKey'
    )
    order by question.ordinality
  )
  into v_cooldown_manifest
  from jsonb_array_elements(p_question_manifest)
    with ordinality as question(item, ordinality);

  insert into public.speaking_exam_attempts (
    id,
    student_id,
    attempt_number,
    mode_id,
    natural_exchange,
    manifest_version,
    question_manifest,
    started_at,
    updated_at
  )
  values (
    p_id,
    p_student_id,
    v_attempt_number,
    p_mode_id,
    p_natural_exchange,
    1,
    p_question_manifest,
    v_started_at,
    v_started_at
  )
  returning * into v_attempt;

  insert into public.speaking_exam_student_state (
    student_id,
    attempt_id,
    attempt_number,
    cooldown_manifest
  )
  values (
    v_attempt.student_id,
    v_attempt.id,
    v_attempt.attempt_number,
    v_cooldown_manifest
  )
  on conflict (student_id) do update
  set attempt_id = excluded.attempt_id,
      attempt_number = excluded.attempt_number,
      cooldown_manifest = excluded.cooldown_manifest;

  return jsonb_build_object(
    'ok', true,
    'attempt', to_jsonb(v_attempt)
  );
end;
$$;

-- Persist an intentional unanswered question. Recording and exam locks make
-- the decision atomic with upload reservation, readiness, deletion and final
-- completion. A saved or currently-uploading answer must be deleted first.
create or replace function public.speaking_skip_exam_question(
  p_id uuid,
  p_student_id uuid,
  p_question_order integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.speaking_exam_attempts%rowtype;
  v_question jsonb;
  v_skipped_orders smallint[];
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_student_id::text, 874312)
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_student_id::text, 874314)
  );

  select attempt.*
  into v_attempt
  from public.speaking_exam_attempts attempt
  where attempt.id = p_id
    and attempt.student_id = p_student_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'EXAM_ATTEMPT_NOT_FOUND');
  end if;

  if p_question_order is null
    or p_question_order < 1
    or p_question_order > jsonb_array_length(v_attempt.question_manifest)
  then
    return jsonb_build_object('ok', false, 'code', 'INVALID_EXAM_QUESTION_ORDER');
  end if;

  v_question := v_attempt.question_manifest -> (p_question_order - 1);
  if jsonb_typeof(v_question) <> 'object'
    or v_question ->> 'order' <> p_question_order::text
    or (v_question ->> 'part') not in ('1', '2', '3')
  then
    return jsonb_build_object('ok', false, 'code', 'INVALID_EXAM_QUESTION_ORDER');
  end if;

  if v_attempt.completed_at is not null then
    return jsonb_build_object('ok', false, 'code', 'EXAM_ATTEMPT_ALREADY_COMPLETED');
  end if;

  if exists (
    select 1
    from public.speaking_recording_attempts recording
    where recording.student_id = p_student_id
      and recording.storage_state in ('uploading', 'ready')
      and recording.exercise_id = format(
        'exam:%s:%s:p%s:q%s',
        v_attempt.mode_id,
        v_attempt.id::text,
        v_question ->> 'part',
        lpad(p_question_order::text, 2, '0')
      )
  ) then
    return jsonb_build_object('ok', false, 'code', 'EXAM_QUESTION_HAS_RECORDING');
  end if;

  if p_question_order::smallint = any(v_attempt.skipped_question_orders) then
    return jsonb_build_object(
      'ok', true,
      'idempotent', true,
      'attempt', to_jsonb(v_attempt)
    );
  end if;

  select coalesce(array_agg(item.order_value order by item.order_value), '{}'::smallint[])
  into v_skipped_orders
  from (
    select distinct skipped.order_value
    from unnest(
      array_append(v_attempt.skipped_question_orders, p_question_order::smallint)
    ) as skipped(order_value)
  ) item;

  update public.speaking_exam_attempts attempt
  set skipped_question_orders = v_skipped_orders,
      updated_at = clock_timestamp()
  where attempt.id = p_id
    and attempt.student_id = p_student_id
  returning * into v_attempt;

  return jsonb_build_object(
    'ok', true,
    'attempt', to_jsonb(v_attempt)
  );
end;
$$;

create or replace function public.speaking_complete_exam_attempt(
  p_id uuid,
  p_student_id uuid,
  p_nervousness_rating integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.speaking_exam_attempts%rowtype;
  v_completed_at timestamptz;
begin
  if p_nervousness_rating < 1 or p_nervousness_rating > 7 then
    return jsonb_build_object('ok', false, 'code', 'INVALID_NERVOUSNESS_RATING');
  end if;

  -- Use the same recording lock before the exam lock so deletion, readiness
  -- transitions and the completeness check are one atomic decision.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_student_id::text, 874312)
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_student_id::text, 874314)
  );

  select attempt.*
  into v_attempt
  from public.speaking_exam_attempts attempt
  where attempt.id = p_id
    and attempt.student_id = p_student_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'EXAM_ATTEMPT_NOT_FOUND');
  end if;

  if v_attempt.completed_at is not null then
    if v_attempt.nervousness_rating = p_nervousness_rating then
      return jsonb_build_object(
        'ok', true,
        'idempotent', true,
        'attempt', to_jsonb(v_attempt)
      );
    end if;
    return jsonb_build_object('ok', false, 'code', 'EXAM_ATTEMPT_ALREADY_COMPLETED');
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_attempt.question_manifest) question
    where not (
      (question ->> 'order')::smallint = any(v_attempt.skipped_question_orders)
      or exists (
        select 1
        from public.speaking_recording_attempts recording
        where recording.student_id = p_student_id
          and recording.storage_state = 'ready'
          and recording.exercise_id = format(
            'exam:%s:%s:p%s:q%s',
            v_attempt.mode_id,
            v_attempt.id::text,
            question ->> 'part',
            lpad(question ->> 'order', 2, '0')
          )
      )
    )
  ) or (
    v_attempt.natural_exchange
    and not exists (
      select 1
      from public.speaking_recording_attempts recording
      where recording.student_id = p_student_id
        and recording.storage_state = 'ready'
        and recording.exercise_id = format(
          'exam:%s:%s:p%s:intro',
          v_attempt.mode_id,
          v_attempt.id::text,
          v_attempt.question_manifest -> 0 ->> 'part'
        )
    )
  ) then
    return jsonb_build_object('ok', false, 'code', 'EXAM_RECORDINGS_INCOMPLETE');
  end if;

  v_completed_at := clock_timestamp();
  update public.speaking_exam_attempts attempt
  set nervousness_rating = p_nervousness_rating,
      rated_at = v_completed_at,
      completed_at = v_completed_at,
      updated_at = v_completed_at
  where attempt.id = p_id
    and attempt.student_id = p_student_id
  returning * into v_attempt;

  return jsonb_build_object(
    'ok', true,
    'attempt', to_jsonb(v_attempt)
  );
end;
$$;

-- Hard-delete the complete history parent. Only the separately minimized
-- ordinal/UUID and cooldown identity pairs survive history cleanup.
-- Every physical object must first be removed through the recording deletion
-- saga, which finalizes its metadata row only after Storage confirms removal.
create or replace function public.speaking_delete_exam_attempt(
  p_id uuid,
  p_student_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.speaking_exam_attempts%rowtype;
  v_recording_prefix text;
  v_recording_count bigint;
  v_deleting_count bigint;
  v_deleting_recordings jsonb;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_student_id::text, 874312)
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_student_id::text, 874314)
  );

  select attempt.*
  into v_attempt
  from public.speaking_exam_attempts attempt
  where attempt.id = p_id
    and attempt.student_id = p_student_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'EXAM_ATTEMPT_NOT_FOUND');
  end if;

  v_recording_prefix := format(
    'exam:%s:%s:',
    v_attempt.mode_id,
    v_attempt.id::text
  );

  select count(*),
         count(*) filter (where recording.storage_state = 'deleting')
  into v_recording_count, v_deleting_count
  from public.speaking_recording_attempts recording
  where recording.student_id = p_student_id
    and left(recording.exercise_id, char_length(v_recording_prefix)) = v_recording_prefix;

  if v_recording_count <> 0 then
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', tombstone.id,
          'objectPath', tombstone.object_path
        )
        order by tombstone.created_at, tombstone.id
      ),
      '[]'::jsonb
    )
    into v_deleting_recordings
    from (
      select recording.id, recording.object_path, recording.created_at
      from public.speaking_recording_attempts recording
      where recording.student_id = p_student_id
        and recording.storage_state = 'deleting'
        and left(recording.exercise_id, char_length(v_recording_prefix)) = v_recording_prefix
      order by recording.created_at, recording.id
      limit 20
    ) tombstone;

    return jsonb_build_object(
      'ok', false,
      'code', 'EXAM_RECORDINGS_REMAIN',
      'attemptNumber', v_attempt.attempt_number,
      'recordingCount', v_recording_count,
      'deletingCount', v_deleting_count,
      'deletingRecordings', v_deleting_recordings
    );
  end if;

  delete from public.speaking_exam_attempts attempt
  where attempt.id = p_id
    and attempt.student_id = p_student_id;

  return jsonb_build_object('ok', true, 'id', p_id);
end;
$$;

-- Storage is removed before this batch finalizer is called. Missing IDs are
-- accepted for idempotency with concurrent/retried deletion, but any supplied
-- ID that still exists must be an owned `deleting` row under the exact parent
-- prefix. The 20-row ceiling matches the largest legitimate exam slot count.
create or replace function public.speaking_finalize_exam_recording_deletes(
  p_attempt_id uuid,
  p_student_id uuid,
  p_attempt_number bigint,
  p_recording_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.speaking_exam_attempts%rowtype;
  v_recording_prefix text;
  v_distinct_count integer;
  v_deleted_count integer;
begin
  if p_recording_ids is null
    or cardinality(p_recording_ids) < 1
    or cardinality(p_recording_ids) > 20
    or array_position(p_recording_ids, null) is not null
  then
    return jsonb_build_object('ok', false, 'code', 'INVALID_RECORDING_IDS');
  end if;

  select count(distinct supplied.recording_id)::integer
  into v_distinct_count
  from unnest(p_recording_ids) as supplied(recording_id);

  if v_distinct_count <> cardinality(p_recording_ids) then
    return jsonb_build_object('ok', false, 'code', 'INVALID_RECORDING_IDS');
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_student_id::text, 874312)
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_student_id::text, 874314)
  );

  select attempt.*
  into v_attempt
  from public.speaking_exam_attempts attempt
  where attempt.id = p_attempt_id
    and attempt.student_id = p_student_id
  for share;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'EXAM_ATTEMPT_NOT_FOUND');
  end if;

  if p_attempt_number is null or v_attempt.attempt_number <> p_attempt_number then
    return jsonb_build_object('ok', false, 'code', 'EXAM_ATTEMPT_CHANGED');
  end if;

  v_recording_prefix := format(
    'exam:%s:%s:',
    v_attempt.mode_id,
    v_attempt.id::text
  );

  if exists (
    select 1
    from public.speaking_recording_attempts recording
    where recording.id = any(p_recording_ids)
      and (
        recording.student_id <> p_student_id
        or recording.storage_state <> 'deleting'
        or left(recording.exercise_id, char_length(v_recording_prefix)) <> v_recording_prefix
      )
  ) then
    return jsonb_build_object('ok', false, 'code', 'RECORDING_STATE_CONFLICT');
  end if;

  delete from public.speaking_recording_attempts recording
  where recording.id = any(p_recording_ids)
    and recording.student_id = p_student_id
    and recording.storage_state = 'deleting'
    and left(recording.exercise_id, char_length(v_recording_prefix)) = v_recording_prefix;
  get diagnostics v_deleted_count = row_count;

  return jsonb_build_object(
    'ok', true,
    'deletedCount', v_deleted_count
  );
end;
$$;

-- The retry is version-guarded so a concurrently deleted UUID can never cause
-- a newly-created parent that reused that UUID to be removed accidentally.
create or replace function public.speaking_delete_exam_attempt_if_number(
  p_id uuid,
  p_student_id uuid,
  p_attempt_number bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.speaking_exam_attempts%rowtype;
  v_recording_prefix text;
  v_recording_count bigint;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_student_id::text, 874312)
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_student_id::text, 874314)
  );

  select attempt.*
  into v_attempt
  from public.speaking_exam_attempts attempt
  where attempt.id = p_id
    and attempt.student_id = p_student_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'EXAM_ATTEMPT_NOT_FOUND');
  end if;

  if p_attempt_number is null or v_attempt.attempt_number <> p_attempt_number then
    return jsonb_build_object('ok', false, 'code', 'EXAM_ATTEMPT_CHANGED');
  end if;

  v_recording_prefix := format(
    'exam:%s:%s:',
    v_attempt.mode_id,
    v_attempt.id::text
  );

  select count(*)
  into v_recording_count
  from public.speaking_recording_attempts recording
  where recording.student_id = p_student_id
    and left(recording.exercise_id, char_length(v_recording_prefix)) = v_recording_prefix;

  if v_recording_count <> 0 then
    return jsonb_build_object(
      'ok', false,
      'code', 'EXAM_RECORDINGS_REMAIN',
      'recordingCount', v_recording_count
    );
  end if;

  delete from public.speaking_exam_attempts attempt
  where attempt.id = p_id
    and attempt.student_id = p_student_id
    and attempt.attempt_number = p_attempt_number;

  return jsonb_build_object('ok', true, 'id', p_id);
end;
$$;

revoke all on function public.speaking_admin_login(text, text)
  from public, anon, authenticated;
revoke all on function public.speaking_admin_me(uuid)
  from public, anon, authenticated;
revoke all on function public.speaking_admin_logout(uuid)
  from public, anon, authenticated;
revoke all on function public.speaking_student_profile(uuid)
  from public, anon, authenticated;
revoke all on function public.speaking_reserve_recording_attempt(
  uuid, uuid, text, text, text, text, integer, integer, text,
  integer, integer, integer, text, bigint
)
  from public, anon, authenticated;
revoke all on function public.speaking_mark_recording_ready(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.speaking_begin_recording_delete(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.speaking_recording_lifecycle_error(uuid, text)
  from public, anon, authenticated;
revoke all on function public.speaking_claim_stale_recording_upload(uuid, timestamptz)
  from public, anon, authenticated;
revoke all on function public.speaking_finalize_recording_delete(uuid)
  from public, anon, authenticated;
revoke all on function public.speaking_cancel_recording_upload(uuid)
  from public, anon, authenticated;
revoke all on function public.speaking_create_exam_attempt(uuid, uuid, text, boolean, jsonb)
  from public, anon, authenticated;
revoke all on function public.speaking_skip_exam_question(uuid, uuid, integer)
  from public, anon, authenticated;
revoke all on function public.speaking_complete_exam_attempt(uuid, uuid, integer)
  from public, anon, authenticated;
revoke all on function public.speaking_delete_exam_attempt(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.speaking_finalize_exam_recording_deletes(uuid, uuid, bigint, uuid[])
  from public, anon, authenticated;
revoke all on function public.speaking_delete_exam_attempt_if_number(uuid, uuid, bigint)
  from public, anon, authenticated;

grant execute on function public.speaking_admin_login(text, text)
  to service_role;
grant execute on function public.speaking_admin_me(uuid)
  to service_role;
grant execute on function public.speaking_admin_logout(uuid)
  to service_role;
grant execute on function public.speaking_student_profile(uuid)
  to service_role;
grant execute on function public.speaking_reserve_recording_attempt(
  uuid, uuid, text, text, text, text, integer, integer, text,
  integer, integer, integer, text, bigint
)
  to service_role;
grant execute on function public.speaking_mark_recording_ready(uuid, uuid)
  to service_role;
grant execute on function public.speaking_begin_recording_delete(uuid, uuid)
  to service_role;
grant execute on function public.speaking_recording_lifecycle_error(uuid, text)
  to service_role;
grant execute on function public.speaking_claim_stale_recording_upload(uuid, timestamptz)
  to service_role;
grant execute on function public.speaking_finalize_recording_delete(uuid)
  to service_role;
grant execute on function public.speaking_cancel_recording_upload(uuid)
  to service_role;
grant execute on function public.speaking_create_exam_attempt(uuid, uuid, text, boolean, jsonb)
  to service_role;
grant execute on function public.speaking_skip_exam_question(uuid, uuid, integer)
  to service_role;
grant execute on function public.speaking_complete_exam_attempt(uuid, uuid, integer)
  to service_role;
grant execute on function public.speaking_delete_exam_attempt(uuid, uuid)
  to service_role;
grant execute on function public.speaking_finalize_exam_recording_deletes(uuid, uuid, bigint, uuid[])
  to service_role;
grant execute on function public.speaking_delete_exam_attempt_if_number(uuid, uuid, bigint)
  to service_role;

notify pgrst, 'reload schema';

commit;
