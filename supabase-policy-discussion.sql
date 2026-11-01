-- Separate policy content and learning records; existing validated accounts are reused.
begin;
create table if not exists public.policy_discussion_articles (
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
  constraint policy_discussion_image_pair check ((image_mime is null) = (image_bytes is null)),
  constraint policy_discussion_image_type check (image_mime is null or image_mime in ('image/webp','image/jpeg','image/png')),
  constraint policy_discussion_image_size check (image_bytes is null or octet_length(image_bytes) <= 1500000),
  constraint policy_discussion_source_url check (source_url is null or (char_length(source_url)<=1900 and source_url ~ '^https://[^[:space:]]+$'))
);
create index if not exists policy_discussion_articles_order on public.policy_discussion_articles(sort_order,created_at) where deleted_at is null;
create table if not exists public.policy_discussion_item_state (
  account_key text not null,
  article_id uuid not null references public.policy_discussion_articles(id) on delete cascade,
  item_id text not null check (char_length(item_id) between 3 and 90),
  checked boolean not null default false,
  bookmarked boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key(account_key,article_id,item_id)
);
create index if not exists policy_discussion_item_state_bookmarks on public.policy_discussion_item_state(account_key,bookmarked) where bookmarked;

alter table public.policy_discussion_articles enable row level security;
alter table public.policy_discussion_item_state enable row level security;
revoke all on public.policy_discussion_articles,public.policy_discussion_item_state from public,anon,authenticated;
create or replace function public.policy_discussion_list(p_student_token uuid default null,p_admin_token uuid default null)
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
    from public.policy_discussion_articles a
    where a.deleted_at is null and (v_admin or not a.hidden)), '[]'::jsonb);
end;
$$;

create or replace function public.policy_discussion_get(p_article_id uuid,p_student_token uuid default null,p_admin_token uuid default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_key text; v_admin boolean; v_result jsonb;
begin
  v_key:=public.news_discussion_account_key(p_student_token,p_admin_token);
  v_admin:=left(v_key,6)='admin:';
  select jsonb_build_object('id',a.id,'title',a.title,'brief',a.brief,
    'source_url',a.source_url,'content',a.content,'has_image',a.image_bytes is not null,
    'hidden',a.hidden,'created_at',a.created_at)
  into v_result from public.policy_discussion_articles a
  where a.id=p_article_id and a.deleted_at is null and (v_admin or not a.hidden);
  if v_result is null then raise exception 'Policy item unavailable' using errcode='22023'; end if;
  return v_result;
end;
$$;

create or replace function public.policy_discussion_image(p_article_id uuid,p_student_token uuid default null,p_admin_token uuid default null)
returns text language plpgsql stable security definer set search_path = '' as $$
declare v_key text; v_mime text; v_bytes bytea;
begin
  v_key:=public.news_discussion_account_key(p_student_token,p_admin_token);
  select a.image_mime,a.image_bytes into v_mime,v_bytes
  from public.policy_discussion_articles a where a.id=p_article_id and a.deleted_at is null
    and (left(v_key,6)='admin:' or not a.hidden);
  if v_bytes is null then return null; end if;
  return 'data:'||v_mime||';base64,'||encode(v_bytes,'base64');
end;
$$;

create or replace function public.policy_discussion_state(p_article_id uuid,p_student_token uuid default null,p_admin_token uuid default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_key text;
begin
  v_key:=public.news_discussion_account_key(p_student_token,p_admin_token);
  perform 1 from public.policy_discussion_articles a where a.id=p_article_id and a.deleted_at is null
    and (left(v_key,6)='admin:' or not a.hidden);
  if not found then raise exception 'Policy item unavailable' using errcode='22023'; end if;
  return coalesce((select jsonb_object_agg(s.item_id,jsonb_build_object('checked',s.checked,'bookmarked',s.bookmarked))
    from public.policy_discussion_item_state s where s.account_key=v_key and s.article_id=p_article_id),'{}'::jsonb);
end;
$$;

create or replace function public.policy_discussion_save_state(p_article_id uuid,p_item_id text,p_checked boolean,p_bookmarked boolean,p_student_token uuid default null,p_admin_token uuid default null)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare v_key text;
begin
  v_key:=public.news_discussion_account_key(p_student_token,p_admin_token);
  if p_item_id !~ '^(q:[a-z0-9-]+|arg:(for|against):[0-9]+|gloss:(for|against):[0-9]+:[0-9]+|structure:[0-9]+)$'
     or char_length(p_item_id)>90 or p_checked is null or p_bookmarked is null then
    raise exception 'Invalid checklist item' using errcode='22023';
  end if;
  perform 1 from public.policy_discussion_articles a where a.id=p_article_id and a.deleted_at is null
    and (left(v_key,6)='admin:' or not a.hidden);
  if not found then raise exception 'Policy item unavailable' using errcode='22023'; end if;
  insert into public.policy_discussion_item_state(account_key,article_id,item_id,checked,bookmarked)
  values(v_key,p_article_id,p_item_id,p_checked,p_bookmarked)
  on conflict(account_key,article_id,item_id) do update set
    checked=excluded.checked,bookmarked=excluded.bookmarked,updated_at=now();
end;
$$;

create or replace function public.policy_discussion_admin_create(p_admin_token uuid,p_title text)
returns uuid language plpgsql volatile security definer set search_path = '' as $$
declare v_id uuid;
begin
  if public.news_discussion_admin_name(p_admin_token) is null then raise exception 'Admin required' using errcode='42501'; end if;
  if p_title is null or char_length(btrim(p_title)) not between 1 and 160 then raise exception 'Invalid title' using errcode='22023'; end if;
  insert into public.policy_discussion_articles(title,sort_order)
  values(btrim(p_title),(select coalesce(max(sort_order),0)+1 from public.policy_discussion_articles)) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.policy_discussion_admin_set_url(p_admin_token uuid,p_article_id uuid,p_source_url text)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare v_url text;
begin
  if public.news_discussion_admin_name(p_admin_token) is null then raise exception 'Admin required' using errcode='42501'; end if;
  v_url:=nullif(btrim(coalesce(p_source_url,'')),'');
  if v_url is not null and (char_length(v_url)>1900 or v_url !~ '^https://[^[:space:]]+$') then
    raise exception 'Use a valid HTTPS news URL' using errcode='22023';
  end if;
  update public.policy_discussion_articles set source_url=v_url,updated_at=now()
  where id=p_article_id and deleted_at is null;
  if not found then raise exception 'Policy item unavailable' using errcode='22023'; end if;
end;
$$;

create or replace function public.policy_discussion_admin_set_image(p_admin_token uuid,p_article_id uuid,p_mime text,p_base64 text)
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
  update public.policy_discussion_articles set image_mime=p_mime,image_bytes=v_bytes,updated_at=now()
  where id=p_article_id and deleted_at is null;
  if not found then raise exception 'Policy item unavailable' using errcode='22023'; end if;
end;
$$;

create or replace function public.policy_discussion_admin_set_hidden(p_admin_token uuid,p_article_id uuid,p_hidden boolean)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  if public.news_discussion_admin_name(p_admin_token) is null then raise exception 'Admin required' using errcode='42501'; end if;
  if p_hidden is null then raise exception 'Invalid visibility' using errcode='22023'; end if;
  update public.policy_discussion_articles set hidden=p_hidden,updated_at=now()
  where id=p_article_id and deleted_at is null;
  if not found then raise exception 'Policy item unavailable' using errcode='22023'; end if;
end;
$$;

create or replace function public.policy_discussion_admin_remove(p_admin_token uuid,p_article_id uuid)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  if public.news_discussion_admin_name(p_admin_token) is null then raise exception 'Admin required' using errcode='42501'; end if;
  update public.policy_discussion_articles set deleted_at=now(),hidden=true,updated_at=now()
  where id=p_article_id and deleted_at is null;
  if not found then raise exception 'Policy item unavailable' using errcode='22023'; end if;
end;
$$;

revoke all on function public.policy_discussion_list(uuid,uuid) from public,anon,authenticated;
grant execute on function public.policy_discussion_list(uuid,uuid) to authenticated;
revoke all on function public.policy_discussion_get(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.policy_discussion_get(uuid,uuid,uuid) to authenticated;
revoke all on function public.policy_discussion_image(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.policy_discussion_image(uuid,uuid,uuid) to authenticated;
revoke all on function public.policy_discussion_state(uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.policy_discussion_state(uuid,uuid,uuid) to authenticated;
revoke all on function public.policy_discussion_save_state(uuid,text,boolean,boolean,uuid,uuid) from public,anon,authenticated;
grant execute on function public.policy_discussion_save_state(uuid,text,boolean,boolean,uuid,uuid) to authenticated;
revoke all on function public.policy_discussion_admin_create(uuid,text) from public,anon,authenticated;
grant execute on function public.policy_discussion_admin_create(uuid,text) to authenticated;
revoke all on function public.policy_discussion_admin_set_url(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.policy_discussion_admin_set_url(uuid,uuid,text) to authenticated;
revoke all on function public.policy_discussion_admin_set_image(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.policy_discussion_admin_set_image(uuid,uuid,text,text) to authenticated;
revoke all on function public.policy_discussion_admin_set_hidden(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.policy_discussion_admin_set_hidden(uuid,uuid,boolean) to authenticated;
revoke all on function public.policy_discussion_admin_remove(uuid,uuid) from public,anon,authenticated;
grant execute on function public.policy_discussion_admin_remove(uuid,uuid) to authenticated;

commit;
