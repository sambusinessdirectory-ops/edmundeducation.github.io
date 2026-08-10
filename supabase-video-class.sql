-- EdmundEducation Video Class: shared student identities, manual entitlements,
-- secure admin sessions, playback audit, and private-R2 authorization.
--
-- Dependencies:
--   * public.flashcard_students
--   * public.flashcard_student_sessions
--   * public.flashcard_session_student_id(uuid)
--   * pgcrypto installed in the extensions schema
--
-- The first admin bcrypt and the Worker-secret SHA-256 are provisioned
-- separately during deployment. Plaintext credentials never belong here.

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
  if to_regprocedure('public.flashcard_session_student_id(uuid)') is null then
    raise exception 'Missing dependency: public.flashcard_session_student_id(uuid)';
  end if;
  if not exists (
    select 1
    from pg_catalog.pg_extension extension
    join pg_catalog.pg_namespace namespace on namespace.oid = extension.extnamespace
    where extension.extname = 'pgcrypto'
      and namespace.nspname = 'extensions'
  ) then
    raise exception 'pgcrypto must be installed in the extensions schema';
  end if;
end;
$$;

create table if not exists public.video_class_admin_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 100),
  password_hash text not null check (password_hash like '$2%'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists video_class_admin_name_lower_idx
  on public.video_class_admin_accounts (lower(trim(name)));

create table if not exists public.video_class_admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null references public.video_class_admin_accounts(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > created_at)
);

create index if not exists video_class_admin_sessions_admin_idx
  on public.video_class_admin_sessions (admin_id, expires_at desc);
create index if not exists video_class_admin_sessions_expiry_idx
  on public.video_class_admin_sessions (expires_at);

create table if not exists public.video_class_worker_secrets (
  name text primary key check (name = 'video-class-worker'),
  secret_hash bytea not null,
  updated_at timestamptz not null default now()
);

-- A durable marker makes the launch entitlement rollout genuinely one-time,
-- even if this schema file is applied again after more students sign up.
create table if not exists public.video_class_rollouts (
  rollout_key text primary key check (rollout_key ~ '^[a-z0-9-]+$'),
  completed_at timestamptz not null default now()
);

create table if not exists public.video_class_student_access (
  student_id uuid primary key references public.flashcard_students(id) on delete cascade,
  video_key text not null unique
    check (video_key ~ '^EDU-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$'),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references public.video_class_admin_accounts(id) on delete set null
);

create index if not exists video_class_student_access_enabled_idx
  on public.video_class_student_access (student_id)
  where enabled = true;
create index if not exists video_class_student_access_updated_by_idx
  on public.video_class_student_access (updated_by)
  where updated_by is not null;

create table if not exists public.video_class_student_sessions (
  token_hash bytea primary key,
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  minted_flashcard_token uuid references public.flashcard_student_sessions(token) on delete set null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > created_at)
);

alter table public.video_class_student_sessions
  add column if not exists minted_flashcard_token uuid
  references public.flashcard_student_sessions(token) on delete set null;

create index if not exists video_class_student_sessions_student_idx
  on public.video_class_student_sessions (student_id, expires_at desc);
create index if not exists video_class_student_sessions_expiry_idx
  on public.video_class_student_sessions (expires_at);
create index if not exists video_class_student_sessions_minted_flashcard_idx
  on public.video_class_student_sessions (minted_flashcard_token)
  where minted_flashcard_token is not null;

create table if not exists public.video_class_lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (length(trim(title)) between 1 and 160),
  description text not null default '' check (length(description) <= 2000),
  course_label text not null default '錄影班' check (length(trim(course_label)) between 1 and 120),
  object_key text not null unique check (length(object_key) between 1 and 900),
  duration_seconds integer check (duration_seconds is null or duration_seconds between 1 and 86400),
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.video_class_admin_accounts(id) on delete set null
);

create index if not exists video_class_lessons_published_sort_idx
  on public.video_class_lessons (sort_order, created_at, id)
  where published = true;
create index if not exists video_class_lessons_created_by_idx
  on public.video_class_lessons (created_by)
  where created_by is not null;

create table if not exists public.video_class_playback_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  student_session_hash bytea not null
    references public.video_class_student_sessions(token_hash) on delete cascade,
  video_key_snapshot text not null,
  user_agent_hash text not null check (user_agent_hash ~ '^[0-9a-f]{64}$'),
  network_hash text not null check (network_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_position_seconds numeric(10,2) not null default 0 check (last_position_seconds >= 0),
  check (expires_at > created_at)
);

create index if not exists video_class_playbacks_student_active_idx
  on public.video_class_playback_sessions (student_id, created_at desc)
  where revoked_at is null;
create index if not exists video_class_playbacks_lesson_idx
  on public.video_class_playback_sessions (lesson_id, created_at desc);
create index if not exists video_class_playbacks_expiry_idx
  on public.video_class_playback_sessions (expires_at)
  where revoked_at is null;
create index if not exists video_class_playbacks_student_session_idx
  on public.video_class_playback_sessions (student_session_hash);

create table if not exists public.video_class_progress (
  student_id uuid not null references public.flashcard_students(id) on delete cascade,
  lesson_id uuid not null references public.video_class_lessons(id) on delete cascade,
  position_seconds numeric(10,2) not null default 0 check (position_seconds >= 0),
  duration_seconds numeric(10,2) check (duration_seconds is null or duration_seconds > 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, lesson_id)
);

create index if not exists video_class_progress_lesson_idx
  on public.video_class_progress (lesson_id, updated_at desc);

create table if not exists public.video_class_admin_audit_events (
  id bigint generated always as identity primary key,
  admin_id uuid references public.video_class_admin_accounts(id) on delete set null,
  student_id uuid references public.flashcard_students(id) on delete set null,
  action text not null check (action in ('issue_key', 'rotate_key', 'clear_key', 'enable_access', 'disable_access')),
  detail jsonb not null default '{}'::jsonb check (jsonb_typeof(detail) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists video_class_admin_audit_time_idx
  on public.video_class_admin_audit_events (created_at desc, id desc);
create index if not exists video_class_admin_audit_student_idx
  on public.video_class_admin_audit_events (student_id, created_at desc);
create index if not exists video_class_admin_audit_admin_idx
  on public.video_class_admin_audit_events (admin_id, created_at desc);

alter table public.video_class_admin_accounts enable row level security;
alter table public.video_class_admin_sessions enable row level security;
alter table public.video_class_worker_secrets enable row level security;
alter table public.video_class_rollouts enable row level security;
alter table public.video_class_student_access enable row level security;
alter table public.video_class_student_sessions enable row level security;
alter table public.video_class_lessons enable row level security;
alter table public.video_class_playback_sessions enable row level security;
alter table public.video_class_progress enable row level security;
alter table public.video_class_admin_audit_events enable row level security;

revoke all on table public.video_class_admin_accounts from public, anon, authenticated;
revoke all on table public.video_class_admin_sessions from public, anon, authenticated;
revoke all on table public.video_class_worker_secrets from public, anon, authenticated;
revoke all on table public.video_class_rollouts from public, anon, authenticated;
revoke all on table public.video_class_student_access from public, anon, authenticated;
revoke all on table public.video_class_student_sessions from public, anon, authenticated;
revoke all on table public.video_class_lessons from public, anon, authenticated;
revoke all on table public.video_class_playback_sessions from public, anon, authenticated;
revoke all on table public.video_class_progress from public, anon, authenticated;
revoke all on table public.video_class_admin_audit_events from public, anon, authenticated;

create or replace function public.video_class_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.video_class_touch_updated_at() from public, anon, authenticated;

drop trigger if exists video_class_admin_accounts_touch on public.video_class_admin_accounts;
create trigger video_class_admin_accounts_touch
before update on public.video_class_admin_accounts
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_student_access_touch on public.video_class_student_access;
create trigger video_class_student_access_touch
before update on public.video_class_student_access
for each row execute function public.video_class_touch_updated_at();

drop trigger if exists video_class_lessons_touch on public.video_class_lessons;
create trigger video_class_lessons_touch
before update on public.video_class_lessons
for each row execute function public.video_class_touch_updated_at();

create or replace function public.video_class_revoke_admin_sessions_on_password_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.password_hash is distinct from new.password_hash then
    delete from public.video_class_admin_sessions session
    where session.admin_id = new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.video_class_revoke_admin_sessions_on_password_change() from public, anon, authenticated;

drop trigger if exists video_class_admin_password_revoke on public.video_class_admin_accounts;
create trigger video_class_admin_password_revoke
after update of password_hash on public.video_class_admin_accounts
for each row execute function public.video_class_revoke_admin_sessions_on_password_change();

create or replace function public.video_class_revoke_student_sessions_on_password_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.password_hash is distinct from new.password_hash then
    -- A password change invalidates every shared bearer session as well as the
    -- derived video sessions, preventing immediate re-entry via token exchange.
    delete from public.flashcard_student_sessions session
    where session.student_id = new.id;

    delete from public.video_class_student_sessions session
    where session.student_id = new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.video_class_revoke_student_sessions_on_password_change() from public, anon, authenticated;

-- This update-only trigger revokes video sessions after a shared-account
-- password change. It never creates an entitlement or key for a new student.
drop trigger if exists video_class_student_password_revoke on public.flashcard_students;
create trigger video_class_student_password_revoke
after update of password_hash on public.flashcard_students
for each row execute function public.video_class_revoke_student_sessions_on_password_change();

create or replace function public.video_class_revoke_playbacks_on_access_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := coalesce(new.student_id, old.student_id);
begin
  if tg_op = 'DELETE' then
    update public.video_class_playback_sessions playback
    set revoked_at = coalesce(playback.revoked_at, now())
    where playback.student_id = v_student_id
      and playback.revoked_at is null;
    return old;
  end if;

  if old.video_key is distinct from new.video_key
    or old.enabled is distinct from new.enabled
  then
    update public.video_class_playback_sessions playback
    set revoked_at = coalesce(playback.revoked_at, now())
    where playback.student_id = v_student_id
      and playback.revoked_at is null;
  end if;
  return new;
end;
$$;

revoke all on function public.video_class_revoke_playbacks_on_access_change() from public, anon, authenticated;

drop trigger if exists video_class_access_revoke_playbacks on public.video_class_student_access;
create trigger video_class_access_revoke_playbacks
after update of video_key, enabled or delete on public.video_class_student_access
for each row execute function public.video_class_revoke_playbacks_on_access_change();

create or replace function public._video_class_worker_ok(p_service_secret text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(length(p_service_secret), 0) >= 48
    and exists (
      select 1
      from public.video_class_worker_secrets secret
      where secret.name = 'video-class-worker'
        and secret.secret_hash = extensions.digest(p_service_secret, 'sha256')
    );
$$;

revoke all on function public._video_class_worker_ok(text) from public, anon, authenticated;

create or replace function public._video_class_admin_id(p_admin_token uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select session.admin_id
  from public.video_class_admin_sessions session
  where p_admin_token is not null
    and session.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session.expires_at > now()
  limit 1;
$$;

revoke all on function public._video_class_admin_id(uuid) from public, anon, authenticated;

create or replace function public._video_class_next_key()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_raw text;
  v_key text;
begin
  loop
    v_raw := upper(encode(extensions.gen_random_bytes(6), 'hex'));
    v_key := 'EDU-' || substr(v_raw, 1, 4) || '-' || substr(v_raw, 5, 4) || '-' || substr(v_raw, 9, 4);
    exit when not exists (
      select 1 from public.video_class_student_access access
      where access.video_key = v_key
    );
  end loop;
  return v_key;
end;
$$;

revoke all on function public._video_class_next_key() from public, anon, authenticated;

create or replace function public.video_class_student_login(
  p_service_secret text,
  p_name text,
  p_password text
)
returns table (
  video_token uuid,
  flashcard_token uuid,
  student_id uuid,
  name text,
  video_key text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_student_name text;
  v_video_key text;
  v_video_token uuid := gen_random_uuid();
  v_flashcard_token uuid;
  v_now timestamptz := clock_timestamp();
  v_expires_at timestamptz := v_now + interval '8 hours';
begin
  if not public._video_class_worker_ok(p_service_secret)
    or nullif(trim(coalesce(p_name, '')), '') is null
    or length(trim(p_name)) > 100
    or p_password is null
    or length(p_password) > 200
  then
    return;
  end if;

  select student.id, student.name, access.video_key
  into v_student_id, v_student_name, v_video_key
  from public.flashcard_students student
  join public.video_class_student_access access on access.student_id = student.id
  where lower(student.name) = lower(trim(p_name))
    and student.deleted_at is null
    and access.enabled = true
    and student.password_hash = extensions.crypt(p_password, student.password_hash)
  limit 1
  for no key update of student;

  if not found then
    return;
  end if;

  delete from public.video_class_student_sessions session
  where session.expires_at <= v_now;

  insert into public.flashcard_student_sessions (student_id, expires_at)
  values (v_student_id, v_expires_at)
  returning token into v_flashcard_token;

  insert into public.video_class_student_sessions (
    token_hash, student_id, minted_flashcard_token, expires_at
  )
  values (
    extensions.digest(v_video_token::text, 'sha256'),
    v_student_id,
    v_flashcard_token,
    v_expires_at
  );

  return query
  select v_video_token, v_flashcard_token, v_student_id, v_student_name, v_video_key, v_expires_at;
end;
$$;

create or replace function public.video_class_student_exchange(
  p_service_secret text,
  p_flashcard_token uuid
)
returns table (
  video_token uuid,
  flashcard_token uuid,
  student_id uuid,
  name text,
  video_key text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_student_name text;
  v_video_key text;
  v_video_token uuid := gen_random_uuid();
  v_now timestamptz := clock_timestamp();
  v_expires_at timestamptz := v_now + interval '8 hours';
begin
  if not public._video_class_worker_ok(p_service_secret) or p_flashcard_token is null then
    return;
  end if;

  -- Read the parent identifier, then lock in parent-to-child order and
  -- revalidate the exact bearer session. This serializes exchange with both
  -- password changes and shared-session logout.
  select session.student_id into v_student_id
  from public.flashcard_student_sessions session
  where session.token = p_flashcard_token
    and session.expires_at > clock_timestamp()
  limit 1;

  if not found then
    return;
  end if;

  select student.id, student.name, access.video_key
  into v_student_id, v_student_name, v_video_key
  from public.flashcard_students student
  join public.video_class_student_access access on access.student_id = student.id
  where student.id = v_student_id
    and student.deleted_at is null
    and access.enabled = true
  for key share of student;

  if not found then
    return;
  end if;

  perform session.token
  from public.flashcard_student_sessions session
  where session.token = p_flashcard_token
    and session.student_id = v_student_id
    and session.expires_at > clock_timestamp()
  for key share of session;

  if not found then
    return;
  end if;

  delete from public.video_class_student_sessions session
  where session.expires_at <= v_now;

  insert into public.video_class_student_sessions (token_hash, student_id, expires_at)
  values (extensions.digest(v_video_token::text, 'sha256'), v_student_id, v_expires_at);

  return query
  select v_video_token, p_flashcard_token, v_student_id, v_student_name, v_video_key, v_expires_at;
end;
$$;

create or replace function public.video_class_student_me(
  p_service_secret text,
  p_student_token uuid
)
returns table (
  student_id uuid,
  name text,
  video_key text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret) or p_student_token is null then
    return;
  end if;

  update public.video_class_student_sessions session
  set last_seen_at = now()
  where session.token_hash = extensions.digest(p_student_token::text, 'sha256')
    and session.expires_at > now();

  if not found then
    return;
  end if;

  return query
  select student.id, student.name, access.video_key, session.expires_at
  from public.video_class_student_sessions session
  join public.flashcard_students student on student.id = session.student_id
  join public.video_class_student_access access on access.student_id = student.id
  where session.token_hash = extensions.digest(p_student_token::text, 'sha256')
    and session.expires_at > now()
    and student.deleted_at is null
    and access.enabled = true
  limit 1;
end;
$$;

create or replace function public.video_class_student_logout(
  p_service_secret text,
  p_student_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_minted_flashcard_token uuid;
begin
  if not public._video_class_worker_ok(p_service_secret) or p_student_token is null then
    return false;
  end if;
  delete from public.video_class_student_sessions session
  where session.token_hash = extensions.digest(p_student_token::text, 'sha256')
  returning session.minted_flashcard_token into v_minted_flashcard_token;
  if not found then
    return false;
  end if;
  if v_minted_flashcard_token is not null then
    delete from public.flashcard_student_sessions session
    where session.token = v_minted_flashcard_token;
  end if;
  return true;
end;
$$;

create or replace function public.video_class_admin_login(
  p_service_secret text,
  p_name text,
  p_password text
)
returns table (admin_token uuid, name text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin public.video_class_admin_accounts%rowtype;
  v_token uuid := gen_random_uuid();
  v_now timestamptz := clock_timestamp();
  v_expires_at timestamptz := v_now + interval '8 hours';
begin
  if not public._video_class_worker_ok(p_service_secret)
    or nullif(trim(coalesce(p_name, '')), '') is null
    or length(trim(p_name)) > 100
    or p_password is null
    or length(p_password) > 200
  then
    return;
  end if;

  select admin.*
  into v_admin
  from public.video_class_admin_accounts admin
  where lower(trim(admin.name)) = lower(trim(p_name))
    and admin.password_hash = extensions.crypt(p_password, admin.password_hash)
  limit 1
  for no key update of admin;

  if not found then
    return;
  end if;

  delete from public.video_class_admin_sessions session
  where session.expires_at <= v_now;

  insert into public.video_class_admin_sessions (token_hash, admin_id, expires_at)
  values (extensions.digest(v_token::text, 'sha256'), v_admin.id, v_expires_at);

  return query select v_token, v_admin.name, v_expires_at;
end;
$$;

create or replace function public.video_class_admin_me(
  p_service_secret text,
  p_admin_token uuid
)
returns table (admin_id uuid, name text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select admin.id, admin.name, session.expires_at
  from public.video_class_admin_sessions session
  join public.video_class_admin_accounts admin on admin.id = session.admin_id
  where public._video_class_worker_ok(p_service_secret)
    and p_admin_token is not null
    and session.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session.expires_at > now()
  limit 1;
$$;

create or replace function public.video_class_admin_logout(
  p_service_secret text,
  p_admin_token uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret) or p_admin_token is null then
    return false;
  end if;
  delete from public.video_class_admin_sessions session
  where session.token_hash = extensions.digest(p_admin_token::text, 'sha256');
  return found;
end;
$$;

create or replace function public.video_class_admin_list_students(
  p_service_secret text,
  p_admin_token uuid
)
returns table (
  student_id uuid,
  name text,
  video_key text,
  enabled boolean,
  account_created_at timestamptz,
  key_created_at timestamptz,
  key_updated_at timestamptz,
  last_video_login_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret)
    or public._video_class_admin_id(p_admin_token) is null
  then
    raise exception 'Invalid or expired admin session';
  end if;

  return query
  select
    student.id,
    student.name,
    access.video_key,
    access.enabled,
    student.created_at,
    access.created_at,
    access.updated_at,
    login.last_video_login_at
  from public.flashcard_students student
  left join public.video_class_student_access access on access.student_id = student.id
  left join lateral (
    select max(session.created_at) as last_video_login_at
    from public.video_class_student_sessions session
    where session.student_id = student.id
  ) login on true
  where student.deleted_at is null
  order by student.created_at, lower(student.name), student.id;
end;
$$;

create or replace function public.video_class_admin_issue_key(
  p_service_secret text,
  p_admin_token uuid,
  p_student_id uuid,
  p_rotate boolean default false
)
returns table (student_id uuid, video_key text, enabled boolean, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
  v_existing public.video_class_student_access%rowtype;
  v_key text;
  v_action text;
begin
  if not public._video_class_worker_ok(p_service_secret) then
    raise exception 'Worker authorization failed';
  end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session';
  end if;
  if not exists (
    select 1 from public.flashcard_students student
    where student.id = p_student_id and student.deleted_at is null
  ) then
    raise exception 'Student not found';
  end if;

  select access.* into v_existing
  from public.video_class_student_access access
  where access.student_id = p_student_id;

  if found and not coalesce(p_rotate, false) then
    return query
    select v_existing.student_id, v_existing.video_key, v_existing.enabled, v_existing.updated_at;
    return;
  end if;

  v_key := public._video_class_next_key();
  v_action := case when v_existing.student_id is null then 'issue_key' else 'rotate_key' end;

  insert into public.video_class_student_access (student_id, video_key, enabled, updated_by)
  values (p_student_id, v_key, coalesce(v_existing.enabled, true), v_admin_id)
  on conflict (student_id) do update
  set video_key = excluded.video_key,
      enabled = public.video_class_student_access.enabled,
      updated_by = excluded.updated_by,
      updated_at = now();

  insert into public.video_class_admin_audit_events (admin_id, student_id, action)
  values (v_admin_id, p_student_id, v_action);

  return query
  select access.student_id, access.video_key, access.enabled, access.updated_at
  from public.video_class_student_access access
  where access.student_id = p_student_id;
end;
$$;

create or replace function public.video_class_admin_clear_key(
  p_service_secret text,
  p_admin_token uuid,
  p_student_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
begin
  if not public._video_class_worker_ok(p_service_secret) then
    return false;
  end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session';
  end if;

  delete from public.video_class_student_access access
  where access.student_id = p_student_id;
  if not found then
    return false;
  end if;

  insert into public.video_class_admin_audit_events (admin_id, student_id, action)
  values (v_admin_id, p_student_id, 'clear_key');
  return true;
end;
$$;

create or replace function public.video_class_admin_set_enabled(
  p_service_secret text,
  p_admin_token uuid,
  p_student_id uuid,
  p_enabled boolean
)
returns table (student_id uuid, video_key text, enabled boolean, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin_id uuid;
begin
  if not public._video_class_worker_ok(p_service_secret) or p_enabled is null then
    raise exception 'Invalid access update';
  end if;
  v_admin_id := public._video_class_admin_id(p_admin_token);
  if v_admin_id is null then
    raise exception 'Invalid or expired admin session';
  end if;

  update public.video_class_student_access access
  set enabled = p_enabled,
      updated_by = v_admin_id,
      updated_at = now()
  where access.student_id = p_student_id;
  if not found then
    raise exception 'Issue a video key before changing access';
  end if;

  insert into public.video_class_admin_audit_events (admin_id, student_id, action)
  values (v_admin_id, p_student_id, case when p_enabled then 'enable_access' else 'disable_access' end);

  return query
  select access.student_id, access.video_key, access.enabled, access.updated_at
  from public.video_class_student_access access
  where access.student_id = p_student_id;
end;
$$;

create or replace function public.video_class_student_list_lessons(
  p_service_secret text,
  p_student_token uuid
)
returns table (
  lesson_id uuid,
  slug text,
  title text,
  description text,
  course_label text,
  duration_seconds integer,
  sort_order integer,
  resume_seconds numeric,
  completed_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
begin
  if not public._video_class_worker_ok(p_service_secret) or p_student_token is null then
    return;
  end if;

  select session.student_id into v_student_id
  from public.video_class_student_sessions session
  join public.flashcard_students student on student.id = session.student_id
  join public.video_class_student_access access on access.student_id = student.id
  where session.token_hash = extensions.digest(p_student_token::text, 'sha256')
    and session.expires_at > now()
    and student.deleted_at is null
    and access.enabled = true
  limit 1;

  if v_student_id is null then
    return;
  end if;

  return query
  select
    lesson.id,
    lesson.slug,
    lesson.title,
    lesson.description,
    lesson.course_label,
    lesson.duration_seconds,
    lesson.sort_order,
    coalesce(progress.position_seconds, 0),
    progress.completed_at
  from public.video_class_lessons lesson
  left join public.video_class_progress progress
    on progress.lesson_id = lesson.id and progress.student_id = v_student_id
  where lesson.published = true
  order by lesson.sort_order, lesson.created_at, lesson.id;
end;
$$;

create or replace function public.video_class_create_playback(
  p_service_secret text,
  p_student_token uuid,
  p_lesson_slug text,
  p_user_agent_hash text,
  p_network_hash text
)
returns table (
  playback_id uuid,
  student_id uuid,
  lesson_id uuid,
  slug text,
  title text,
  object_key text,
  video_key text,
  resume_seconds numeric,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_session_hash bytea;
  v_session_expires_at timestamptz;
  v_video_key text;
  v_lesson public.video_class_lessons%rowtype;
  v_playback_id uuid := gen_random_uuid();
  v_expires_at timestamptz;
  v_resume numeric := 0;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_token is null
    or p_lesson_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or p_user_agent_hash !~ '^[0-9a-f]{64}$'
    or p_network_hash !~ '^[0-9a-f]{64}$'
  then
    return;
  end if;

  -- Establish a consistent parent-to-child lock order. Password changes lock
  -- the shared student row first, so grants must do the same before locking the
  -- video session/access rows and finally touching playback rows.
  select session.student_id into v_student_id
  from public.video_class_student_sessions session
  where session.token_hash = extensions.digest(p_student_token::text, 'sha256')
    and session.expires_at > now()
  limit 1;

  if not found then
    return;
  end if;

  select student.id into v_student_id
  from public.flashcard_students student
  where student.id = v_student_id
    and student.deleted_at is null
  for key share;

  if not found then
    return;
  end if;

  select session.student_id, session.token_hash, session.expires_at, access.video_key
  into v_student_id, v_session_hash, v_session_expires_at, v_video_key
  from public.video_class_student_sessions session
  join public.flashcard_students student on student.id = session.student_id
  join public.video_class_student_access access on access.student_id = student.id
  where session.token_hash = extensions.digest(p_student_token::text, 'sha256')
    and session.expires_at > now()
    and student.id = v_student_id
    and student.deleted_at is null
    and access.enabled = true
  limit 1
  for update of session, access;

  if not found then
    return;
  end if;

  select lesson.* into v_lesson
  from public.video_class_lessons lesson
  where lesson.slug = p_lesson_slug
    and lesson.published = true
  limit 1;

  if not found then
    return;
  end if;

  v_expires_at := least(v_session_expires_at, clock_timestamp() + interval '6 hours');

  update public.video_class_playback_sessions playback
  set revoked_at = coalesce(playback.revoked_at, now())
  where playback.student_id = v_student_id
    and playback.revoked_at is null
    and playback.expires_at > now();

  select coalesce(progress.position_seconds, 0)
  into v_resume
  from public.video_class_progress progress
  where progress.student_id = v_student_id
    and progress.lesson_id = v_lesson.id;

  insert into public.video_class_playback_sessions (
    id, student_id, lesson_id, student_session_hash, video_key_snapshot,
    user_agent_hash, network_hash, expires_at
  )
  values (
    v_playback_id, v_student_id, v_lesson.id, v_session_hash,
    v_video_key, p_user_agent_hash, p_network_hash, v_expires_at
  );

  return query
  select
    v_playback_id,
    v_student_id,
    v_lesson.id,
    v_lesson.slug,
    v_lesson.title,
    v_lesson.object_key,
    v_video_key,
    coalesce(v_resume, 0),
    v_expires_at;
end;
$$;

create or replace function public.video_class_authorize_playback(
  p_service_secret text,
  p_playback_id uuid,
  p_student_id uuid,
  p_lesson_slug text,
  p_user_agent_hash text,
  p_network_hash text
)
returns table (object_key text, video_key text, lesson_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_playback_id is null
    or p_student_id is null
    or p_user_agent_hash !~ '^[0-9a-f]{64}$'
    or p_network_hash !~ '^[0-9a-f]{64}$'
  then
    return;
  end if;

  -- Media requests are intentionally read-only. Progress heartbeats update
  -- activity in a controlled cadence instead of writing for every byte range.
  return query
  select lesson.object_key, playback.video_key_snapshot, lesson.id, playback.expires_at
  from public.video_class_playback_sessions playback
  join public.video_class_lessons lesson on lesson.id = playback.lesson_id
  join public.flashcard_students student on student.id = playback.student_id
  join public.video_class_student_access access on access.student_id = student.id
  join public.video_class_student_sessions session
    on session.token_hash = playback.student_session_hash
  where playback.id = p_playback_id
    and playback.student_id = p_student_id
    and lesson.slug = p_lesson_slug
    and lesson.published = true
    and student.deleted_at is null
    and access.enabled = true
    and access.video_key = playback.video_key_snapshot
    and session.expires_at > now()
    and playback.user_agent_hash = p_user_agent_hash
    and playback.network_hash = p_network_hash
    and playback.revoked_at is null
    and playback.expires_at > now();
end;
$$;

create or replace function public.video_class_record_progress(
  p_service_secret text,
  p_student_token uuid,
  p_playback_id uuid,
  p_position_seconds numeric,
  p_duration_seconds numeric
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid;
  v_lesson_id uuid;
  v_completed_at timestamptz;
begin
  if not public._video_class_worker_ok(p_service_secret)
    or p_student_token is null
    or p_playback_id is null
    or p_position_seconds is null
    or p_position_seconds < 0
    or p_position_seconds > 86400
    or p_duration_seconds is null
    or p_duration_seconds <= 0
    or p_duration_seconds > 86400
    or p_position_seconds > p_duration_seconds + 30
  then
    return false;
  end if;

  select playback.student_id, playback.lesson_id
  into v_student_id, v_lesson_id
  from public.video_class_playback_sessions playback
  join public.video_class_student_sessions session
    on session.token_hash = playback.student_session_hash
  join public.flashcard_students student on student.id = playback.student_id
  join public.video_class_student_access access on access.student_id = playback.student_id
  where playback.id = p_playback_id
    and session.token_hash = extensions.digest(p_student_token::text, 'sha256')
    and session.expires_at > now()
    and playback.revoked_at is null
    and playback.expires_at > now()
    and student.deleted_at is null
    and access.enabled = true
    and access.video_key = playback.video_key_snapshot
  limit 1;

  if not found then
    return false;
  end if;

  v_completed_at := case
    when p_duration_seconds >= 10 and p_position_seconds / p_duration_seconds >= 0.92 then now()
    else null
  end;

  update public.video_class_playback_sessions playback
  set last_seen_at = now(),
      last_position_seconds = p_position_seconds
  where playback.id = p_playback_id;

  insert into public.video_class_progress (
    student_id, lesson_id, position_seconds, duration_seconds, completed_at, updated_at
  )
  values (
    v_student_id, v_lesson_id, p_position_seconds, p_duration_seconds, v_completed_at, now()
  )
  on conflict (student_id, lesson_id) do update
  set position_seconds = excluded.position_seconds,
      duration_seconds = excluded.duration_seconds,
      completed_at = coalesce(public.video_class_progress.completed_at, excluded.completed_at),
      updated_at = now();

  return true;
end;
$$;

-- One-time rollout backfill. The durable marker is inserted atomically before
-- the backfill, so reapplying this schema never grants keys to future students.
do $$
begin
  insert into public.video_class_rollouts (rollout_key)
  values ('initial-current-students')
  on conflict (rollout_key) do nothing;

  -- A pre-marker deployment may already contain the original rollout. Treat
  -- any populated entitlement table as completed instead of backfilling users
  -- who joined later. A fresh install has no entitlement rows and runs once.
  if found and not exists (
    select 1 from public.video_class_student_access access
  ) then
    insert into public.video_class_student_access (student_id, video_key, enabled)
    select student.id, public._video_class_next_key(), true
    from public.flashcard_students student
    where student.deleted_at is null
    on conflict (student_id) do nothing;
  end if;
end;
$$;

-- The pilot lesson points to the private bucket key populated during deployment.
insert into public.video_class_lessons (
  slug, title, description, course_label, object_key, duration_seconds, sort_order, published
)
values (
  'bourree',
  'Bourrée 示範課堂',
  'Edmund Sir 錄影班試播影片。登入後可隨時重溫。',
  '錄影班 · 試播課堂',
  'lessons/bourree.mp4',
  38,
  10,
  true
)
on conflict (slug) do nothing;

revoke all on function public.video_class_student_login(text, text, text) from public, anon, authenticated;
revoke all on function public.video_class_student_exchange(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_student_me(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_student_logout(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_login(text, text, text) from public, anon, authenticated;
revoke all on function public.video_class_admin_me(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_logout(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_list_students(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_issue_key(text, uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.video_class_admin_clear_key(text, uuid, uuid) from public, anon, authenticated;
revoke all on function public.video_class_admin_set_enabled(text, uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.video_class_student_list_lessons(text, uuid) from public, anon, authenticated;
revoke all on function public.video_class_create_playback(text, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.video_class_authorize_playback(text, uuid, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.video_class_record_progress(text, uuid, uuid, numeric, numeric) from public, anon, authenticated;

-- PostgREST sees only narrow functions. Every function is additionally gated by
-- a high-entropy secret held by the Cloudflare Worker, never by the browser.
grant execute on function public.video_class_student_login(text, text, text) to anon;
grant execute on function public.video_class_student_exchange(text, uuid) to anon;
grant execute on function public.video_class_student_me(text, uuid) to anon;
grant execute on function public.video_class_student_logout(text, uuid) to anon;
grant execute on function public.video_class_admin_login(text, text, text) to anon;
grant execute on function public.video_class_admin_me(text, uuid) to anon;
grant execute on function public.video_class_admin_logout(text, uuid) to anon;
grant execute on function public.video_class_admin_list_students(text, uuid) to anon;
grant execute on function public.video_class_admin_issue_key(text, uuid, uuid, boolean) to anon;
grant execute on function public.video_class_admin_clear_key(text, uuid, uuid) to anon;
grant execute on function public.video_class_admin_set_enabled(text, uuid, uuid, boolean) to anon;
grant execute on function public.video_class_student_list_lessons(text, uuid) to anon;
grant execute on function public.video_class_create_playback(text, uuid, text, text, text) to anon;
grant execute on function public.video_class_authorize_playback(text, uuid, uuid, text, text, text) to anon;
grant execute on function public.video_class_record_progress(text, uuid, uuid, numeric, numeric) to anon;

notify pgrst, 'reload schema';

commit;
