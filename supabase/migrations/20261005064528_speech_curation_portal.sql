-- Card 69: a private speech collection with existing student accounts and a scoped editor.
create schema if not exists speech_curation_private;
revoke all on schema speech_curation_private from public, anon, authenticated;

create table speech_curation_private.admins (
  name text primary key,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table speech_curation_private.admin_sessions (
  token uuid primary key default gen_random_uuid(),
  admin_name text not null references speech_curation_private.admins(name) on delete cascade,
  auth_uid uuid not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '12 hours')
);
create index admin_sessions_owner_expiry on speech_curation_private.admin_sessions(auth_uid, expires_at);

create table speech_curation_private.speeches (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  speaker text not null check (char_length(speaker) between 1 and 160),
  url text not null check (char_length(url) between 9 and 2048 and url ~ '^https://[^[:space:]]+$'),
  description text not null default '' check (char_length(description) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index speeches_recent on speech_curation_private.speeches(created_at desc);

alter table speech_curation_private.admins enable row level security;
alter table speech_curation_private.admin_sessions enable row level security;
alter table speech_curation_private.speeches enable row level security;

create or replace function public.speech_curation_admin_login(p_name text, p_password text)
returns table(name text, session_token uuid, expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare v_name text; v_token uuid; v_expires timestamptz;
begin
  if auth.uid() is null or char_length(coalesce(p_name, '')) > 160 or char_length(coalesce(p_password, '')) > 200 then return; end if;
  select a.name into v_name from speech_curation_private.admins a
  where lower(a.name) = lower(trim(p_name))
    and a.password_hash = extensions.crypt(p_password, a.password_hash)
  limit 1;
  if v_name is null then return; end if;
  insert into speech_curation_private.admin_sessions as s(admin_name, auth_uid)
  values (v_name, auth.uid()) returning s.token, s.expires_at into v_token, v_expires;
  return query select v_name, v_token, v_expires;
end $$;

create or replace function public.speech_curation_admin_profile(p_token uuid)
returns table(name text, session_token uuid)
language sql stable security definer set search_path = '' as $$
  select s.admin_name, s.token from speech_curation_private.admin_sessions s
  where s.token = p_token and s.auth_uid = auth.uid() and s.expires_at > now()
  limit 1
$$;

create or replace function public.speech_curation_admin_logout(p_token uuid)
returns void language sql security definer set search_path = '' as $$
  delete from speech_curation_private.admin_sessions s
  where s.token = p_token and s.auth_uid = auth.uid()
$$;

create or replace function public.speech_curation_list(p_student_token uuid default null, p_admin_token uuid default null)
returns table(id uuid, title text, speaker text, url text, description text, created_at timestamptz)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not (
    exists (select 1 from speech_curation_private.admin_sessions s
      where s.token = p_admin_token and s.auth_uid = auth.uid() and s.expires_at > now())
    or exists (select 1 from public.flashcard_student_sessions s
      join public.flashcard_students st on st.id = s.student_id
      where s.token = p_student_token and s.expires_at > now() and st.deleted_at is null)
  ) then raise exception 'Access denied'; end if;
  return query select e.id, e.title, e.speaker, e.url, e.description, e.created_at
    from speech_curation_private.speeches e order by e.created_at desc, e.id;
end $$;

create or replace function public.speech_curation_save(
  p_token uuid, p_id uuid, p_title text, p_speaker text, p_url text, p_description text default ''
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_title text := trim(coalesce(p_title, '')); v_speaker text := trim(coalesce(p_speaker, ''));
  v_url text := trim(coalesce(p_url, '')); v_description text := trim(coalesce(p_description, ''));
begin
  if not exists (select 1 from speech_curation_private.admin_sessions s
      where s.token = p_token and s.auth_uid = auth.uid() and s.expires_at > now())
    then raise exception 'Access denied'; end if;
  if char_length(v_title) not between 1 and 200 or char_length(v_speaker) not between 1 and 160
     or char_length(v_url) not between 9 and 2048 or v_url !~ '^https://[^[:space:]]+$'
     or char_length(v_description) > 5000 then raise exception 'Invalid speech details'; end if;
  if p_id is null then
    insert into speech_curation_private.speeches(title, speaker, url, description)
    values (v_title, v_speaker, v_url, v_description) returning id into v_id;
  else
    update speech_curation_private.speeches e set title = v_title, speaker = v_speaker,
      url = v_url, description = v_description, updated_at = now()
    where e.id = p_id returning e.id into v_id;
    if v_id is null then raise exception 'Speech not found'; end if;
  end if;
  return v_id;
end $$;

create or replace function public.speech_curation_delete(p_token uuid, p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from speech_curation_private.admin_sessions s
      where s.token = p_token and s.auth_uid = auth.uid() and s.expires_at > now())
    then raise exception 'Access denied'; end if;
  delete from speech_curation_private.speeches e where e.id = p_id;
end $$;

revoke all on function public.speech_curation_admin_login(text,text) from public, anon;
revoke all on function public.speech_curation_admin_profile(uuid) from public, anon;
revoke all on function public.speech_curation_admin_logout(uuid) from public, anon;
revoke all on function public.speech_curation_list(uuid,uuid) from public, anon;
revoke all on function public.speech_curation_save(uuid,uuid,text,text,text,text) from public, anon;
revoke all on function public.speech_curation_delete(uuid,uuid) from public, anon;
grant execute on function public.speech_curation_admin_login(text,text) to authenticated;
grant execute on function public.speech_curation_admin_profile(uuid) to authenticated;
grant execute on function public.speech_curation_admin_logout(uuid) to authenticated;
grant execute on function public.speech_curation_list(uuid,uuid) to authenticated;
grant execute on function public.speech_curation_save(uuid,uuid,text,text,text,text) to authenticated;
grant execute on function public.speech_curation_delete(uuid,uuid) to authenticated;
