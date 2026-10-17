-- Make the Super Mario speaking bank available to the same per-student progress store.
create or replace function public.dse_argument_state(p_student_token uuid, p_module_id text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_key text;
begin
  if p_module_id is null or p_module_id not in (
    '2025-1-2-photo-taking-visitors',
    '2025-learning-to-drive-in-hong-kong',
    '2025-the-art-of-self-care',
    '2025-why-was-super-mario-a-plumber'
  ) then
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
declare v_max_syn integer;
begin
  v_max_syn := case p_module_id
    when '2025-1-2-photo-taking-visitors' then 63
    when '2025-learning-to-drive-in-hong-kong' then 100
    when '2025-the-art-of-self-care' then 119
    when '2025-why-was-super-mario-a-plumber' then 119
    else null
  end;
  if v_max_syn is null or p_checked is null or p_bookmarked is null then
    raise exception 'Invalid DSE item' using errcode='22023';
  end if;
  if p_item_id is null or p_item_id !~ '^(arg:(A[123]|B[1-8])-[A-Z0-9]+|gloss:(A[123]|B[1-8])-[A-Z0-9]+:[0-4]|structure:([1-9]|1[0-9]|20)|syn:([0-9]|[1-9][0-9]|1[01][0-9]))$' then
    raise exception 'Invalid DSE item' using errcode='22023';
  end if;
  if p_item_id like 'syn:%' and substring(p_item_id from 5)::integer > v_max_syn then
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
