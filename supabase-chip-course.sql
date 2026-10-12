-- Card 70: a small, admin-only chip-design lesson area.
-- Provision the administrator and lesson content separately. Never commit a password.
begin;

create table if not exists public.chip_course_admin_accounts (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default pg_catalog.now(),
  check (username = pg_catalog.btrim(username)),
  check (pg_catalog.char_length(username) between 1 and 100),
  check (password_hash ~ '^\$2a\$12\$[./A-Za-z0-9]{53}$')
);

create table if not exists public.chip_course_admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null references public.chip_course_admin_accounts(id) on delete cascade,
  created_at timestamptz not null default pg_catalog.now(),
  expires_at timestamptz not null,
  check (pg_catalog.octet_length(token_hash) = 32),
  check (expires_at > created_at),
  check (expires_at <= created_at + interval '8 hours')
);
create index if not exists chip_course_admin_sessions_expires_idx
  on public.chip_course_admin_sessions (expires_at);

create table if not exists public.chip_course_login_throttles (
  login_key_hash bytea primary key,
  failed_attempts integer not null,
  window_started_at timestamptz not null,
  locked_until timestamptz,
  last_failed_at timestamptz not null,
  check (pg_catalog.octet_length(login_key_hash) = 32),
  check (failed_attempts between 1 and 5)
);

create table if not exists public.chip_course_lessons (
  slug text primary key,
  content jsonb not null,
  published boolean not null default false,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (pg_catalog.jsonb_typeof(content) = 'object')
);

alter table public.chip_course_admin_accounts enable row level security;
alter table public.chip_course_admin_sessions enable row level security;
alter table public.chip_course_login_throttles enable row level security;
alter table public.chip_course_lessons enable row level security;

revoke all on table public.chip_course_admin_accounts from public, anon, authenticated, service_role;
revoke all on table public.chip_course_admin_sessions from public, anon, authenticated, service_role;
revoke all on table public.chip_course_login_throttles from public, anon, authenticated, service_role;
revoke all on table public.chip_course_lessons from public, anon, authenticated, service_role;

create or replace function public.chip_course_admin_login(
  p_username text,
  p_password text
)
returns table (admin_token uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_username, '')));
  v_admin public.chip_course_admin_accounts%rowtype;
  v_found boolean;
  v_key bytea;
  v_failed integer;
  v_started timestamptz;
  v_locked timestamptz;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_token uuid := pg_catalog.gen_random_uuid();
  v_expires timestamptz := v_now + interval '8 hours';
  v_valid boolean := false;
begin
  if pg_catalog.char_length(v_username) not between 1 and 100
    or p_password is null
    or pg_catalog.octet_length(p_password) not between 1 and 72
  then
    return;
  end if;

  select account.* into v_admin
  from public.chip_course_admin_accounts account
  where pg_catalog.lower(account.username) = v_username
  limit 1 for update;
  v_found := found;

  v_key := extensions.digest(
    pg_catalog.convert_to(
      case when v_found then 'known:' || v_admin.id::text else 'unknown' end,
      'UTF8'
    ),
    'sha256'
  );
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('chip-course-login:' || pg_catalog.encode(v_key, 'hex'), 0)
  );

  select throttle.failed_attempts, throttle.window_started_at, throttle.locked_until
  into v_failed, v_started, v_locked
  from public.chip_course_login_throttles throttle
  where throttle.login_key_hash = v_key for update;

  if v_locked > v_now then return; end if;
  if v_started <= v_now - interval '15 minutes' then
    delete from public.chip_course_login_throttles where login_key_hash = v_key;
    v_failed := null;
    v_started := null;
  end if;

  if v_found then
    v_valid := v_admin.password_hash = extensions.crypt(p_password, v_admin.password_hash);
  else
    perform extensions.crypt(p_password, extensions.gen_salt('bf', 12));
  end if;

  if not v_found or not v_admin.is_active or not v_valid then
    v_failed := least(coalesce(v_failed, 0) + 1, 5);
    insert into public.chip_course_login_throttles as throttle (
      login_key_hash, failed_attempts, window_started_at, locked_until, last_failed_at
    ) values (
      v_key, v_failed, coalesce(v_started, v_now),
      case when v_failed >= 5 then v_now + interval '15 minutes' else null end,
      v_now
    )
    on conflict (login_key_hash) do update
    set failed_attempts = excluded.failed_attempts,
        window_started_at = excluded.window_started_at,
        locked_until = excluded.locked_until,
        last_failed_at = excluded.last_failed_at;
    return;
  end if;

  delete from public.chip_course_login_throttles where login_key_hash = v_key;
  delete from public.chip_course_admin_sessions session_row
  where session_row.expires_at <= v_now;
  insert into public.chip_course_admin_sessions (token_hash, admin_id, created_at, expires_at)
  values (
    extensions.digest(pg_catalog.convert_to(v_token::text, 'UTF8'), 'sha256'),
    v_admin.id, v_now, v_expires
  );
  return query select v_token, v_expires;
end;
$$;

create or replace function public.chip_course_admin_me(p_admin_token uuid)
returns table (username text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select account.username, session_row.expires_at
  from public.chip_course_admin_sessions session_row
  join public.chip_course_admin_accounts account on account.id = session_row.admin_id
  where session_row.token_hash = extensions.digest(
    pg_catalog.convert_to(p_admin_token::text, 'UTF8'), 'sha256'
  )
    and session_row.expires_at > pg_catalog.now()
    and account.is_active
  limit 1;
$$;

create or replace function public.chip_course_get_lesson(
  p_admin_token uuid,
  p_slug text
)
returns table (slug text, content jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select lesson.slug, lesson.content
  from public.chip_course_lessons lesson
  where lesson.slug = p_slug
    and lesson.published
    and exists (
      select 1
      from public.chip_course_admin_sessions session_row
      join public.chip_course_admin_accounts account on account.id = session_row.admin_id
      where session_row.token_hash = extensions.digest(
        pg_catalog.convert_to(p_admin_token::text, 'UTF8'), 'sha256'
      )
        and session_row.expires_at > pg_catalog.now()
        and account.is_active
    );
$$;

create or replace function public.chip_course_admin_logout(p_admin_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.chip_course_admin_sessions session_row
  where session_row.token_hash = extensions.digest(
    pg_catalog.convert_to(p_admin_token::text, 'UTF8'), 'sha256'
  );
  return found;
end;
$$;

revoke all on function public.chip_course_admin_login(text, text) from public, anon, authenticated, service_role;
revoke all on function public.chip_course_admin_me(uuid) from public, anon, authenticated, service_role;
revoke all on function public.chip_course_get_lesson(uuid, text) from public, anon, authenticated, service_role;
revoke all on function public.chip_course_admin_logout(uuid) from public, anon, authenticated, service_role;
grant execute on function public.chip_course_admin_login(text, text) to anon, authenticated;
grant execute on function public.chip_course_admin_me(uuid) to anon, authenticated;
grant execute on function public.chip_course_get_lesson(uuid, text) to anon, authenticated;
grant execute on function public.chip_course_admin_logout(uuid) to anon, authenticated;

notify pgrst, 'reload schema';
commit;
