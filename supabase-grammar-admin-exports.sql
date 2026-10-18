-- Grammar-only admin authentication; credentials are provisioned separately.
create schema if not exists grammar_admin_private;
revoke all on schema grammar_admin_private from public, anon, authenticated;
create table grammar_admin_private.accounts (
  name text primary key,
  password_hash text not null,
  active boolean not null default true
);
create table grammar_admin_private.sessions (
  token uuid primary key default gen_random_uuid(),
  admin_name text not null references grammar_admin_private.accounts(name) on delete cascade,
  auth_uid uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '8 hours')
);
create index on grammar_admin_private.sessions(auth_uid);
create index on grammar_admin_private.sessions(admin_name);
alter table grammar_admin_private.accounts enable row level security;
alter table grammar_admin_private.sessions enable row level security;
revoke all on all tables in schema grammar_admin_private from public, anon, authenticated;
create function grammar_admin_private.login(p_name text, p_password text)
returns table(name text, session_token uuid, expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare v_name text;
begin
  if auth.uid() is null or length(coalesce(p_name,'')) > 160 or length(coalesce(p_password,'')) > 200 then return; end if;
  select a.name into v_name from grammar_admin_private.accounts a
  where a.active and lower(a.name)=lower(trim(p_name))
  and a.password_hash=extensions.crypt(p_password,a.password_hash);
  if v_name is null then return; end if;
  delete from grammar_admin_private.sessions s where s.expires_at <= now();
  return query insert into grammar_admin_private.sessions as s(admin_name,auth_uid)
  values(v_name,auth.uid()) returning s.admin_name,s.token,s.expires_at;
end $$;
create function grammar_admin_private.profile(p_token uuid)
returns table(name text, session_token uuid, expires_at timestamptz)
language sql stable security definer set search_path = '' as $$
 select a.name,s.token,s.expires_at from grammar_admin_private.sessions s
 join grammar_admin_private.accounts a on a.name=s.admin_name
 where auth.uid() is not null and s.auth_uid=auth.uid() and s.token=p_token
 and s.expires_at > now() and a.active;
$$;
create function grammar_admin_private.logout(p_token uuid) returns void
language sql security definer set search_path = '' as $$
 delete from grammar_admin_private.sessions where token=p_token and auth_uid=auth.uid();
$$;
revoke all on all functions in schema grammar_admin_private from public,anon,authenticated;
grant usage on schema grammar_admin_private to authenticated;
grant execute on all functions in schema grammar_admin_private to authenticated;
create function public.grammar_admin_login(p_name text,p_password text)
returns table(name text,session_token uuid,expires_at timestamptz)
language sql security invoker set search_path = '' as $$ select * from grammar_admin_private.login(p_name,p_password); $$;
create function public.grammar_admin_profile(p_token uuid)
returns table(name text,session_token uuid,expires_at timestamptz)
language sql stable security invoker set search_path = '' as $$ select * from grammar_admin_private.profile(p_token); $$;
create function public.grammar_admin_logout(p_token uuid) returns void
language sql security invoker set search_path = '' as $$ select grammar_admin_private.logout(p_token); $$;
revoke all on function public.grammar_admin_login(text,text),public.grammar_admin_profile(uuid),public.grammar_admin_logout(uuid) from public,anon;
grant execute on function public.grammar_admin_login(text,text),public.grammar_admin_profile(uuid),public.grammar_admin_logout(uuid) to authenticated;
create table grammar_admin_private.login_attempts (
  auth_uid uuid primary key references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(), attempts integer not null default 0
);
alter table grammar_admin_private.login_attempts enable row level security;
revoke all on grammar_admin_private.login_attempts from public,anon,authenticated;
create or replace function grammar_admin_private.login(p_name text, p_password text)
returns table(name text, session_token uuid, expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare v_name text; v_attempts integer;
begin
  if auth.uid() is null or length(coalesce(p_name,'')) > 160 or length(coalesce(p_password,'')) > 200 then return; end if;
  insert into grammar_admin_private.login_attempts as l(auth_uid,attempts) values(auth.uid(),1)
  on conflict(auth_uid) do update set
  attempts=case when l.started_at < now()-interval '15 minutes' then 1 else l.attempts+1 end,
  started_at=case when l.started_at < now()-interval '15 minutes' then now() else l.started_at end
  returning attempts into v_attempts;
  if v_attempts > 10 then raise exception 'Too many login attempts. Please try again in 15 minutes.'; end if;
  select a.name into v_name from grammar_admin_private.accounts a
  where a.active and lower(a.name)=lower(trim(p_name))
  and a.password_hash=extensions.crypt(p_password,a.password_hash);
  if v_name is null then return; end if;
  delete from grammar_admin_private.login_attempts where auth_uid=auth.uid();
  delete from grammar_admin_private.sessions s where s.expires_at <= now();
  return query insert into grammar_admin_private.sessions as s(admin_name,auth_uid)
  values(v_name,auth.uid()) returning s.admin_name,s.token,s.expires_at;
end $$;
