-- EdmundEducation Card 57: secure administrator authentication.
-- The supplied administrator password is deliberately not stored in this file.

begin;

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.execution_system_admin_accounts (
  id uuid primary key default extensions.gen_random_uuid(),
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

create unique index if not exists execution_system_admin_name_lower_idx
  on public.execution_system_admin_accounts (pg_catalog.lower(name));

create table if not exists public.execution_system_admin_sessions (
  token_hash bytea primary key,
  admin_id uuid not null references public.execution_system_admin_accounts(id) on delete cascade,
  created_at timestamptz not null default pg_catalog.now(),
  expires_at timestamptz not null,
  check (pg_catalog.octet_length(token_hash) = 32),
  check (expires_at > created_at)
);

create index if not exists execution_system_admin_sessions_admin_idx
  on public.execution_system_admin_sessions (admin_id);
create index if not exists execution_system_admin_sessions_expires_idx
  on public.execution_system_admin_sessions (expires_at);

create table if not exists public.execution_system_admin_login_throttles (
  normalized_name text primary key,
  failure_count integer not null default 0,
  last_failed_at timestamptz not null default pg_catalog.now(),
  blocked_until timestamptz,
  check (failure_count between 0 and 1000)
);

alter table public.execution_system_admin_accounts enable row level security;
alter table public.execution_system_admin_sessions enable row level security;
alter table public.execution_system_admin_login_throttles enable row level security;

revoke all on table public.execution_system_admin_accounts from public, anon, authenticated, service_role;
revoke all on table public.execution_system_admin_sessions from public, anon, authenticated, service_role;
revoke all on table public.execution_system_admin_login_throttles from public, anon, authenticated, service_role;

create or replace function public._execution_system_revoke_admin_sessions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.password_hash is distinct from new.password_hash
    or old.is_active is distinct from new.is_active
  then
    delete from public.execution_system_admin_sessions session_row
    where session_row.admin_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists execution_system_admin_security_change on public.execution_system_admin_accounts;
create trigger execution_system_admin_security_change
after update of password_hash, is_active on public.execution_system_admin_accounts
for each row execute function public._execution_system_revoke_admin_sessions();

create or replace function public.execution_system_admin_login(p_name text, p_password text)
returns table (admin_id uuid, admin_token uuid, name text, expires_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text := pg_catalog.lower(pg_catalog.btrim(coalesce(p_name, '')));
  v_admin public.execution_system_admin_accounts%rowtype;
  v_throttle public.execution_system_admin_login_throttles%rowtype;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_token uuid := extensions.gen_random_uuid();
  v_expires_at timestamptz := v_now + interval '8 hours';
  v_failures integer;
begin
  if pg_catalog.char_length(v_name) not between 1 and 100
    or p_password is null
    or pg_catalog.char_length(p_password) not between 1 and 200
  then
    return;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_name, 91357));
  select throttle.* into v_throttle
  from public.execution_system_admin_login_throttles throttle
  where throttle.normalized_name = v_name
  for update;

  if found and v_throttle.blocked_until > v_now then return; end if;

  select account.* into v_admin
  from public.execution_system_admin_accounts account
  where pg_catalog.lower(account.name) = v_name
  limit 1
  for update;

  if not found
    or not v_admin.is_active
    or v_admin.password_hash <> extensions.crypt(p_password, v_admin.password_hash)
  then
    if v_admin.id is null then
      perform extensions.crypt(p_password, extensions.gen_salt('bf', 12));
    end if;
    v_failures := case
      when v_throttle.last_failed_at is null or v_throttle.last_failed_at < v_now - interval '30 minutes' then 1
      else least(v_throttle.failure_count + 1, 1000)
    end;
    insert into public.execution_system_admin_login_throttles as throttle
      (normalized_name, failure_count, last_failed_at, blocked_until)
    values
      (v_name, v_failures, v_now, case when v_failures >= 5 then v_now + interval '15 minutes' end)
    on conflict (normalized_name) do update
      set failure_count = excluded.failure_count,
          last_failed_at = excluded.last_failed_at,
          blocked_until = excluded.blocked_until;
    return;
  end if;

  delete from public.execution_system_admin_login_throttles throttle where throttle.normalized_name = v_name;
  delete from public.execution_system_admin_sessions session_row where session_row.expires_at <= v_now;
  insert into public.execution_system_admin_sessions (token_hash, admin_id, created_at, expires_at)
  values (extensions.digest(v_token::text, 'sha256'), v_admin.id, v_now, v_expires_at);
  return query select v_admin.id, v_token, v_admin.name, v_expires_at;
end;
$$;

create or replace function public.execution_system_admin_me(p_admin_token uuid)
returns table (id uuid, name text, expires_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select account.id, account.name, session_row.expires_at
  from public.execution_system_admin_sessions session_row
  join public.execution_system_admin_accounts account on account.id = session_row.admin_id
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256')
    and session_row.expires_at > pg_catalog.now()
    and account.is_active
  limit 1;
$$;

create or replace function public.execution_system_admin_logout(p_admin_token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.execution_system_admin_sessions session_row
  where session_row.token_hash = extensions.digest(p_admin_token::text, 'sha256');
  return found;
end;
$$;

revoke all on function public._execution_system_revoke_admin_sessions() from public, anon, authenticated, service_role;
revoke all on function public.execution_system_admin_login(text, text) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_admin_me(uuid) from public, anon, authenticated, service_role;
revoke all on function public.execution_system_admin_logout(uuid) from public, anon, authenticated, service_role;
grant execute on function public.execution_system_admin_login(text, text) to authenticated;
grant execute on function public.execution_system_admin_me(uuid) to authenticated;
grant execute on function public.execution_system_admin_logout(uuid) to authenticated;

commit;
