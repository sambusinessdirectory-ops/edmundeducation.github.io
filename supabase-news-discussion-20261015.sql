-- Card 75. All access to these tables is through authenticated, validated RPCs.
begin;

create table if not exists public.news_discussion_admins (
  name text primary key,
  password_hash text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.news_discussion_admin_sessions (
  token uuid primary key default gen_random_uuid(),
  admin_name text not null references public.news_discussion_admins(name) on delete cascade,
  auth_uid uuid not null,
  expires_at timestamptz not null default now() + interval '7 days'
);
create index if not exists news_discussion_admin_sessions_expiry on public.news_discussion_admin_sessions(expires_at);
create table if not exists public.news_discussion_login_attempts (
  auth_uid uuid primary key,
  window_start timestamptz not null default now(),
  attempts integer not null default 0
);
create table if not exists public.news_discussion_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  brief text not null default '',
  source_url text,
  content jsonb not null default '{"questions":[]}'::jsonb,
  image_mime text,
  image_bytes bytea,
  hidden boolean not null default false,
  deleted_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_discussion_image_pair check ((image_mime is null) = (image_bytes is null)),
  constraint news_discussion_image_type check (image_mime is null or image_mime in ('image/webp','image/jpeg','image/png')),
  constraint news_discussion_image_size check (image_bytes is null or octet_length(image_bytes) <= 1500000),
  constraint news_discussion_source_url check (source_url is null or source_url ~ '^https://[^[:space:]]{1,1900}$')
);
create index if not exists news_discussion_articles_order on public.news_discussion_articles(sort_order,created_at) where deleted_at is null;
create table if not exists public.news_discussion_item_state (
  account_key text not null,
  article_id uuid not null references public.news_discussion_articles(id) on delete cascade,
  item_id text not null check (char_length(item_id) between 3 and 90),
  checked boolean not null default false,
  bookmarked boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key(account_key,article_id,item_id)
);
create index if not exists news_discussion_item_state_bookmarks on public.news_discussion_item_state(account_key,bookmarked) where bookmarked;

alter table public.news_discussion_admins enable row level security;
alter table public.news_discussion_admin_sessions enable row level security;
alter table public.news_discussion_login_attempts enable row level security;
alter table public.news_discussion_articles enable row level security;
alter table public.news_discussion_item_state enable row level security;
revoke all on public.news_discussion_admins,public.news_discussion_admin_sessions,
  public.news_discussion_login_attempts,public.news_discussion_articles,
  public.news_discussion_item_state from public,anon,authenticated;

create or replace function public.news_discussion_admin_name(p_token uuid)
returns text language sql stable security definer set search_path = '' as $$
  select s.admin_name from public.news_discussion_admin_sessions s
  where s.token=p_token and s.auth_uid=auth.uid() and s.expires_at>now() limit 1
$$;

create or replace function public.news_discussion_account_key(p_student_token uuid,p_admin_token uuid)
returns text language plpgsql stable security definer set search_path = '' as $$
declare v_student uuid; v_admin text;
begin
  if auth.uid() is null or (p_student_token is null and p_admin_token is null)
     or (p_student_token is not null and p_admin_token is not null) then
    raise exception 'Sign in required' using errcode='42501';
  end if;
  if p_student_token is not null then
    select public.flashcard_session_student_id(p_student_token) into v_student;
    if v_student is null then raise exception 'Student session expired' using errcode='42501'; end if;
    return 'student:'||v_student::text;
  end if;
  select public.news_discussion_admin_name(p_admin_token) into v_admin;
  if v_admin is null then raise exception 'Admin session expired' using errcode='42501'; end if;
  return 'admin:'||v_admin;
end;
$$;

create or replace function public.news_discussion_admin_login(p_name text,p_password text)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare v_admin public.news_discussion_admins%rowtype; v_attempt public.news_discussion_login_attempts%rowtype; v_token uuid;
begin
  if auth.uid() is null or p_name is null or p_password is null or
     char_length(p_name)>100 or char_length(p_password)>200 then
    raise exception 'Invalid credentials' using errcode='42501';
  end if;
  select * into v_attempt from public.news_discussion_login_attempts where auth_uid=auth.uid() for update;
  if v_attempt.window_start>now()-interval '15 minutes' and v_attempt.attempts>=5 then
    raise exception 'Too many attempts; try again later' using errcode='42501';
  end if;
  select * into v_admin from public.news_discussion_admins where name=btrim(p_name);
  if v_admin.name is null or v_admin.password_hash<>extensions.crypt(p_password,v_admin.password_hash) then
    insert into public.news_discussion_login_attempts(auth_uid,window_start,attempts)
    values(auth.uid(),now(),1)
    on conflict(auth_uid) do update set
      window_start=case when public.news_discussion_login_attempts.window_start<now()-interval '15 minutes' then now() else public.news_discussion_login_attempts.window_start end,
      attempts=case when public.news_discussion_login_attempts.window_start<now()-interval '15 minutes' then 1 else public.news_discussion_login_attempts.attempts+1 end;
    return null;
  end if;
  delete from public.news_discussion_login_attempts where auth_uid=auth.uid();
  insert into public.news_discussion_admin_sessions(admin_name,auth_uid)
  values(v_admin.name,auth.uid()) returning token into v_token;
  return jsonb_build_object('name',v_admin.name,'token',v_token);
end;
$$;

create or replace function public.news_discussion_admin_me(p_admin_token uuid)
returns text language sql stable security definer set search_path = '' as $$
  select public.news_discussion_admin_name(p_admin_token)
$$;

create or replace function public.news_discussion_admin_logout(p_admin_token uuid)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  delete from public.news_discussion_admin_sessions
  where token=p_admin_token and auth_uid=auth.uid();
end;
$$;

create or replace function public.news_discussion_list(p_student_token uuid default null,p_admin_token uuid default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_key text; v_admin boolean;
begin
  v_key:=public.news_discussion_account_key(p_student_token,p_admin_token);
  v_admin:=left(v_key,6)='admin:';
  return coalesce((select jsonb_agg(jsonb_build_object(
    'id',a.id,'title',a.title,'brief',a.brief,'source_url',a.source_url,
    'has_image',a.image_bytes is not null,'hidden',a.hidden,'created_at',a.created_at,
    'question_count',jsonb_array_length(coalesce(a.content->'questions','[]'::jsonb)))
    order by a.sort_order,a.created_at,a.id)
    from public.news_discussion_articles a
    where a.deleted_at is null and (v_admin or not a.hidden)), '[]'::jsonb);
end;
$$;

create or replace function public.news_discussion_get(p_article_id uuid,p_student_token uuid default null,p_admin_token uuid default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_key text; v_admin boolean; v_result jsonb;
begin
  v_key:=public.news_discussion_account_key(p_student_token,p_admin_token);
  v_admin:=left(v_key,6)='admin:';
  select jsonb_build_object('id',a.id,'title',a.title,'brief',a.brief,
    'source_url',a.source_url,'content',a.content,'has_image',a.image_bytes is not null,
    'hidden',a.hidden,'created_at',a.created_at)
  into v_result from public.news_discussion_articles a
  where a.id=p_article_id and a.deleted_at is null and (v_admin or not a.hidden);
  if v_result is null then raise exception 'News item unavailable' using errcode='22023'; end if;
  return v_result;
end;
$$;

create or replace function public.news_discussion_image(p_article_id uuid,p_student_token uuid default null,p_admin_token uuid default null)
returns text language plpgsql stable security definer set search_path = '' as $$
declare v_key text; v_mime text; v_bytes bytea;
begin
  v_key:=public.news_discussion_account_key(p_student_token,p_admin_token);
  select a.image_mime,a.image_bytes into v_mime,v_bytes
  from public.news_discussion_articles a where a.id=p_article_id and a.deleted_at is null
    and (left(v_key,6)='admin:' or not a.hidden);
  if v_bytes is null then return null; end if;
  return 'data:'||v_mime||';base64,'||encode(v_bytes,'base64');
end;
$$;

create or replace function public.news_discussion_state(p_article_id uuid,p_student_token uuid default null,p_admin_token uuid default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_key text;
begin
  v_key:=public.news_discussion_account_key(p_student_token,p_admin_token);
  perform 1 from public.news_discussion_articles a where a.id=p_article_id and a.deleted_at is null
    and (left(v_key,6)='admin:' or not a.hidden);
  if not found then raise exception 'News item unavailable' using errcode='22023'; end if;
  return coalesce((select jsonb_object_agg(s.item_id,jsonb_build_object('checked',s.checked,'bookmarked',s.bookmarked))
    from public.news_discussion_item_state s where s.account_key=v_key and s.article_id=p_article_id),'{}'::jsonb);
end;
$$;

create or replace function public.news_discussion_save_state(p_article_id uuid,p_item_id text,p_checked boolean,p_bookmarked boolean,p_student_token uuid default null,p_admin_token uuid default null)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare v_key text;
begin
  v_key:=public.news_discussion_account_key(p_student_token,p_admin_token);
  if p_item_id !~ '^(q:[a-z0-9-]+|arg:(for|against):[0-9]+|gloss:(for|against):[0-9]+:[0-9]+|structure:[0-9]+)$'
     or char_length(p_item_id)>90 or p_checked is null or p_bookmarked is null then
    raise exception 'Invalid checklist item' using errcode='22023';
  end if;
  perform 1 from public.news_discussion_articles a where a.id=p_article_id and a.deleted_at is null
    and (left(v_key,6)='admin:' or not a.hidden);
  if not found then raise exception 'News item unavailable' using errcode='22023'; end if;
  insert into public.news_discussion_item_state(account_key,article_id,item_id,checked,bookmarked)
  values(v_key,p_article_id,p_item_id,p_checked,p_bookmarked)
  on conflict(account_key,article_id,item_id) do update set
    checked=excluded.checked,bookmarked=excluded.bookmarked,updated_at=now();
end;
$$;

create or replace function public.news_discussion_admin_create(p_admin_token uuid,p_title text)
returns uuid language plpgsql volatile security definer set search_path = '' as $$
declare v_id uuid;
begin
  if public.news_discussion_admin_name(p_admin_token) is null then raise exception 'Admin required' using errcode='42501'; end if;
  if p_title is null or char_length(btrim(p_title)) not between 1 and 160 then raise exception 'Invalid title' using errcode='22023'; end if;
  insert into public.news_discussion_articles(title,sort_order)
  values(btrim(p_title),(select coalesce(max(sort_order),0)+1 from public.news_discussion_articles)) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.news_discussion_admin_set_url(p_admin_token uuid,p_article_id uuid,p_source_url text)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare v_url text;
begin
  if public.news_discussion_admin_name(p_admin_token) is null then raise exception 'Admin required' using errcode='42501'; end if;
  v_url:=nullif(btrim(coalesce(p_source_url,'')),'');
  if v_url is not null and (char_length(v_url)>1900 or v_url !~ '^https://[^[:space:]]+$') then
    raise exception 'Use a valid HTTPS news URL' using errcode='22023';
  end if;
  update public.news_discussion_articles set source_url=v_url,updated_at=now()
  where id=p_article_id and deleted_at is null;
  if not found then raise exception 'News item unavailable' using errcode='22023'; end if;
end;
$$;

create or replace function public.news_discussion_admin_set_image(p_admin_token uuid,p_article_id uuid,p_mime text,p_base64 text)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare v_bytes bytea;
begin
  if public.news_discussion_admin_name(p_admin_token) is null then raise exception 'Admin required' using errcode='42501'; end if;
  if p_mime not in ('image/webp','image/jpeg','image/png') or p_base64 is null or char_length(p_base64)>2000000
     or p_base64 !~ '^[A-Za-z0-9+/]+={0,2}$' then raise exception 'Invalid image' using errcode='22023'; end if;
  v_bytes:=decode(p_base64,'base64');
  if octet_length(v_bytes)>1500000 or octet_length(v_bytes)<100 then raise exception 'Image size invalid' using errcode='22023'; end if;
  if (p_mime='image/webp' and substring(v_bytes from 1 for 4)<>decode('52494646','hex'))
     or (p_mime='image/jpeg' and substring(v_bytes from 1 for 3)<>decode('ffd8ff','hex'))
     or (p_mime='image/png' and substring(v_bytes from 1 for 8)<>decode('89504e470d0a1a0a','hex')) then
    raise exception 'Image format invalid' using errcode='22023';
  end if;
  update public.news_discussion_articles set image_mime=p_mime,image_bytes=v_bytes,updated_at=now()
  where id=p_article_id and deleted_at is null;
  if not found then raise exception 'News item unavailable' using errcode='22023'; end if;
end;
$$;

create or replace function public.news_discussion_admin_set_hidden(p_admin_token uuid,p_article_id uuid,p_hidden boolean)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  if public.news_discussion_admin_name(p_admin_token) is null then raise exception 'Admin required' using errcode='42501'; end if;
  if p_hidden is null then raise exception 'Invalid visibility' using errcode='22023'; end if;
  update public.news_discussion_articles set hidden=p_hidden,updated_at=now()
  where id=p_article_id and deleted_at is null;
  if not found then raise exception 'News item unavailable' using errcode='22023'; end if;
end;
$$;

create or replace function public.news_discussion_admin_remove(p_admin_token uuid,p_article_id uuid)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  if public.news_discussion_admin_name(p_admin_token) is null then raise exception 'Admin required' using errcode='42501'; end if;
  update public.news_discussion_articles set deleted_at=now(),hidden=true,updated_at=now()
  where id=p_article_id and deleted_at is null;
  if not found then raise exception 'News item unavailable' using errcode='22023'; end if;
end;
$$;

revoke all on function public.news_discussion_admin_name(uuid),public.news_discussion_account_key(uuid,uuid)
  from public,anon,authenticated;
revoke all on function public.news_discussion_admin_login(text,text),public.news_discussion_admin_me(uuid),
  public.news_discussion_admin_logout(uuid),public.news_discussion_list(uuid,uuid),
  public.news_discussion_get(uuid,uuid,uuid),public.news_discussion_image(uuid,uuid,uuid),
  public.news_discussion_state(uuid,uuid,uuid),public.news_discussion_save_state(uuid,text,boolean,boolean,uuid,uuid),
  public.news_discussion_admin_create(uuid,text),public.news_discussion_admin_set_url(uuid,uuid,text),
  public.news_discussion_admin_set_image(uuid,uuid,text,text),public.news_discussion_admin_set_hidden(uuid,uuid,boolean),
  public.news_discussion_admin_remove(uuid,uuid) from public,anon,authenticated;
grant execute on function public.news_discussion_admin_login(text,text),public.news_discussion_admin_me(uuid),
  public.news_discussion_admin_logout(uuid),public.news_discussion_list(uuid,uuid),
  public.news_discussion_get(uuid,uuid,uuid),public.news_discussion_image(uuid,uuid,uuid),
  public.news_discussion_state(uuid,uuid,uuid),public.news_discussion_save_state(uuid,text,boolean,boolean,uuid,uuid),
  public.news_discussion_admin_create(uuid,text),public.news_discussion_admin_set_url(uuid,uuid,text),
  public.news_discussion_admin_set_image(uuid,uuid,text,text),public.news_discussion_admin_set_hidden(uuid,uuid,boolean),
  public.news_discussion_admin_remove(uuid,uuid) to authenticated;
commit;
