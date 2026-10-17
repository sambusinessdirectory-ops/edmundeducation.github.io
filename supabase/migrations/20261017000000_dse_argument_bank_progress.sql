-- Card 76: account-scoped checklist and bookmark records for the DSE speaking bank.
begin;

create table if not exists public.dse_argument_item_state (
  account_key text not null,
  module_id text not null check (char_length(module_id) between 3 and 80),
  item_id text not null check (char_length(item_id) between 3 and 90),
  checked boolean not null default false,
  bookmarked boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (account_key, module_id, item_id)
);
create index if not exists dse_argument_item_state_bookmarks
  on public.dse_argument_item_state(account_key, bookmarked) where bookmarked;
alter table public.dse_argument_item_state enable row level security;
revoke all on public.dse_argument_item_state from public, anon, authenticated;

create or replace function public.dse_argument_state(p_student_token uuid, p_module_id text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_key text;
begin
  if p_module_id <> '2025-1-2-photo-taking-visitors' then
    raise exception 'Unknown DSE module' using errcode='22023';
  end if;
  v_key := public.news_discussion_account_key(p_student_token, null::uuid);
  return coalesce((
    select jsonb_object_agg(s.item_id, jsonb_build_object('checked',s.checked,'bookmarked',s.bookmarked))
    from public.dse_argument_item_state s
    where s.account_key=v_key and s.module_id=p_module_id
  ), '{}'::jsonb);
end;
$$;

create or replace function public.dse_argument_save_state(
  p_student_token uuid, p_module_id text, p_item_id text,
  p_checked boolean, p_bookmarked boolean
)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare v_key text;
begin
  if p_module_id <> '2025-1-2-photo-taking-visitors'
     or p_item_id !~ '^(arg:(A[123]|B[1-8])-[A-Z0-9]+|gloss:(A[123]|B[1-8])-[A-Z0-9]+:[0-4]|structure:([1-9]|1[0-9]|20)|syn:([0-9]|[1-5][0-9]|6[0-3]))$'
     or p_checked is null or p_bookmarked is null then
    raise exception 'Invalid DSE item' using errcode='22023';
  end if;
  v_key := public.news_discussion_account_key(p_student_token, null::uuid);
  insert into public.dse_argument_item_state(account_key,module_id,item_id,checked,bookmarked)
  values(v_key,p_module_id,p_item_id,p_checked,p_bookmarked)
  on conflict(account_key,module_id,item_id) do update set
    checked=excluded.checked,bookmarked=excluded.bookmarked,updated_at=now();
end;
$$;

revoke all on function public.dse_argument_state(uuid,text),
  public.dse_argument_save_state(uuid,text,text,boolean,boolean)
  from public,anon,authenticated;
grant execute on function public.dse_argument_state(uuid,text),
  public.dse_argument_save_state(uuid,text,text,boolean,boolean)
  to authenticated;
commit;
