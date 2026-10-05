-- Speech accounts are independent of the general student account list.
-- Existing active students receive a one-time copy of their current login hash.
create table speech_curation_private.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 160),
  password_hash text not null,
  source_student_id uuid unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index speech_accounts_name_ci on speech_curation_private.accounts (lower(trim(name)));
alter table speech_curation_private.accounts enable row level security;

create table speech_curation_private.account_sessions (
  token uuid primary key default gen_random_uuid(),
  account_id uuid not null references speech_curation_private.accounts(id) on delete cascade,
  auth_uid uuid not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);
create index speech_account_sessions_owner on speech_curation_private.account_sessions(auth_uid, expires_at);
alter table speech_curation_private.account_sessions enable row level security;

insert into speech_curation_private.accounts(name, password_hash, source_student_id)
select trim(st.name), st.password_hash, st.id
from public.flashcard_students st
where st.deleted_at is null;

create or replace function public.speech_curation_account_login(p_name text, p_password text)
returns table(id uuid, name text, session_token uuid)
language plpgsql security definer set search_path = '' as $$
declare v_account speech_curation_private.accounts%rowtype; v_token uuid;
begin
  if auth.uid() is null or char_length(coalesce(p_name, '')) > 160
     or char_length(coalesce(p_password, '')) > 200 then return; end if;
  select * into v_account from speech_curation_private.accounts a
  where lower(trim(a.name)) = lower(trim(p_name)) and a.active
    and a.password_hash = extensions.crypt(p_password, a.password_hash)
  limit 1;
  if not found then return; end if;
  insert into speech_curation_private.account_sessions(account_id, auth_uid)
  values (v_account.id, auth.uid()) returning token into v_token;
  return query select v_account.id, v_account.name, v_token;
end $$;

create or replace function public.speech_curation_account_profile(p_token uuid)
returns table(id uuid, name text, session_token uuid)
language sql stable security definer set search_path = '' as $$
  select a.id, a.name, s.token
  from speech_curation_private.account_sessions s
  join speech_curation_private.accounts a on a.id = s.account_id
  where s.token = p_token and s.auth_uid = auth.uid()
    and s.expires_at > now() and a.active
  limit 1
$$;

create or replace function public.speech_curation_account_from_student_session(p_student_token uuid)
returns table(id uuid, name text, session_token uuid)
language plpgsql security definer set search_path = '' as $$
declare v_account speech_curation_private.accounts%rowtype; v_token uuid;
begin
  if auth.uid() is null then return; end if;
  select a.* into v_account
  from public.flashcard_student_sessions ss
  join public.flashcard_students st on st.id = ss.student_id
  join speech_curation_private.accounts a on a.source_student_id = st.id
  where ss.token = p_student_token and ss.expires_at > now()
    and st.deleted_at is null and a.active
  limit 1;
  if not found then return; end if;
  insert into speech_curation_private.account_sessions(account_id, auth_uid)
  values (v_account.id, auth.uid()) returning token into v_token;
  return query select v_account.id, v_account.name, v_token;
end $$;

create or replace function public.speech_curation_account_logout(p_token uuid)
returns void language sql security definer set search_path = '' as $$
  delete from speech_curation_private.account_sessions s
  where s.token = p_token and s.auth_uid = auth.uid()
$$;

-- Keep the original parameter name for older open browser tabs. The token may
-- now be a speech-account session or a mapped legacy student session.
create or replace function public.speech_curation_list(p_student_token uuid default null, p_admin_token uuid default null)
returns table(id uuid, title text, speaker text, url text, description text, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not (
    exists (select 1 from speech_curation_private.admin_sessions s
      where s.token = p_admin_token and s.auth_uid = auth.uid() and s.expires_at > now())
    or exists (select 1 from speech_curation_private.account_sessions s
      join speech_curation_private.accounts a on a.id = s.account_id
      where s.token = p_student_token and s.auth_uid = auth.uid()
        and s.expires_at > now() and a.active)
    or exists (select 1 from public.flashcard_student_sessions s
      join public.flashcard_students st on st.id = s.student_id
      join speech_curation_private.accounts a on a.source_student_id = st.id
      where s.token = p_student_token and s.expires_at > now()
        and st.deleted_at is null and a.active)
  ) then raise exception 'Access denied'; end if;
  return query select e.id, e.title, e.speaker, e.url, e.description, e.created_at
    from speech_curation_private.speeches e order by e.created_at desc, e.id;
end $$;

create or replace function public.speech_curation_accounts(p_admin_token uuid)
returns table(id uuid, name text, source_student_id uuid, active boolean, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from speech_curation_private.admin_sessions s
    where s.token = p_admin_token and s.auth_uid = auth.uid() and s.expires_at > now())
    then raise exception 'Access denied'; end if;
  return query select a.id, a.name, a.source_student_id, a.active, a.created_at
    from speech_curation_private.accounts a order by lower(a.name), a.id;
end $$;

create or replace function public.speech_curation_account_save(
  p_admin_token uuid, p_id uuid, p_name text, p_password text, p_active boolean default true
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_name text := trim(coalesce(p_name, ''));
begin
  if not exists (select 1 from speech_curation_private.admin_sessions s
    where s.token = p_admin_token and s.auth_uid = auth.uid() and s.expires_at > now())
    then raise exception 'Access denied'; end if;
  if char_length(v_name) not between 2 and 160
     or (p_password is not null and char_length(p_password) > 200)
     or (p_password is not null and p_password <> '' and char_length(p_password) < 12)
    then raise exception 'Invalid speech account'; end if;
  if p_id is null then
    if coalesce(p_password, '') = '' then raise exception 'Password required'; end if;
    insert into speech_curation_private.accounts(name, password_hash, active)
    values (v_name, extensions.crypt(p_password, extensions.gen_salt('bf', 12)), coalesce(p_active, true))
    returning id into v_id;
  else
    update speech_curation_private.accounts a
    set name = v_name,
      password_hash = case when coalesce(p_password, '') = '' then a.password_hash
        else extensions.crypt(p_password, extensions.gen_salt('bf', 12)) end,
      active = coalesce(p_active, true), updated_at = now()
    where a.id = p_id returning a.id into v_id;
    if v_id is null then raise exception 'Speech account not found'; end if;
    if not coalesce(p_active, true) then
      delete from speech_curation_private.account_sessions s where s.account_id = v_id;
    end if;
  end if;
  return v_id;
end $$;

revoke all on function public.speech_curation_account_login(text,text) from public, anon;
revoke all on function public.speech_curation_account_profile(uuid) from public, anon;
revoke all on function public.speech_curation_account_from_student_session(uuid) from public, anon;
revoke all on function public.speech_curation_account_logout(uuid) from public, anon;
revoke all on function public.speech_curation_accounts(uuid) from public, anon;
revoke all on function public.speech_curation_account_save(uuid,uuid,text,text,boolean) from public, anon;
grant execute on function public.speech_curation_account_login(text,text) to authenticated;
grant execute on function public.speech_curation_account_profile(uuid) to authenticated;
grant execute on function public.speech_curation_account_from_student_session(uuid) to authenticated;
grant execute on function public.speech_curation_account_logout(uuid) to authenticated;
grant execute on function public.speech_curation_accounts(uuid) to authenticated;
grant execute on function public.speech_curation_account_save(uuid,uuid,text,text,boolean) to authenticated;
