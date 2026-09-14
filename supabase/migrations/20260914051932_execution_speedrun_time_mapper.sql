begin;
alter table public.execution_speedrun_runs add column source text not null default 'speedrun' check (source in ('speedrun','mapper'));
-- Atomic import into the existing owner-guarded meter and immutable attempt model.
-- No direct table grants; validated Execution sessions remain the authority.
create function public.execution_speedrun_mapper_save(
  p_id uuid, p_run_id uuid, p_title text, p_sections jsonb, p_splits jsonb,
  p_student_token uuid default null, p_admin_token uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  o record; m jsonb; r public.execution_speedrun_runs; item jsonb; split jsonb;
  n integer := 0; total bigint := 0; duration bigint; splits jsonb := '[]';
  started timestamptz; ended timestamptz; first_at timestamptz; last_at timestamptz;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into strict o from execution_private.execution_system_owner(p_student_token,p_admin_token);
  perform pg_advisory_xact_lock(hashtextextended(o.owner_kind || o.owner_id::text,73571));
  if p_id is null or p_run_id is null or p_id=p_run_id then raise exception 'Invalid mapping IDs'; end if;
  if exists(select 1 from execution_private.speedrun_deleted_ids where id_hash in (extensions.digest(p_id::text,'sha256'),extensions.digest(p_run_id::text,'sha256'))) then
    raise exception 'This mapping was permanently deleted' using errcode='40001'; end if;
  select * into r from public.execution_speedrun_runs where id=p_run_id;
  if found then
    if r.owner_kind<>o.owner_kind or r.owner_id<>o.owner_id or r.meter_id<>p_id or r.source<>'mapper' then raise exception 'Mapping ID conflict' using errcode='42501'; end if;
    return jsonb_build_object('id',p_id,'run_id',p_run_id);
  end if;
  if exists(select 1 from public.execution_speedrun_meters where id=p_id) then raise exception 'Meter ID conflict' using errcode='40001'; end if;
  if coalesce(jsonb_typeof(p_splits),'')<>'array' or octet_length(p_splits::text)>250000 then raise exception 'Invalid measured splits'; end if;
  -- Reuse all existing title, shape, ownership and size validation. Any later error
  -- rolls back this meter too, so a mapping can never be only partially saved.
  m := public.execution_speedrun_meter_save(p_id,p_title,p_sections,0,p_student_token,p_admin_token);
  for item in select i from jsonb_array_elements(p_sections) s cross join lateral jsonb_array_elements(case when jsonb_array_length(s->'items')=0 then jsonb_build_array(s) else s->'items' end) i loop
    split := p_splits->n;
    if coalesce(jsonb_typeof(split->'elapsed_ms'),'')<>'number' or coalesce(jsonb_typeof(split->'started_at'),'')<>'string' or coalesce(jsonb_typeof(split->'ended_at'),'')<>'string' then raise exception 'Invalid measured time'; end if;
    if (split->>'elapsed_ms')::numeric not between 0 and 86400000 or mod((split->>'elapsed_ms')::numeric,1)<>0 then raise exception 'Each measured part must be within 24 hours'; end if;
    duration := (split->>'elapsed_ms')::bigint;
    started := (split->>'started_at')::timestamptz; ended := (split->>'ended_at')::timestamptz;
    if not isfinite(started) or not isfinite(ended) or started<now()-interval '30 days' or ended>now()+interval '5 minutes' or ended<started or started<last_at or duration>extract(epoch from ended-started)*1000 then raise exception 'Invalid mapping timeline'; end if;
    if (item->>'expected_ms')::bigint<>greatest(1000,ceil(duration/1000.0)*1000) then raise exception 'Expected time must match measured time rounded up to seconds'; end if;
    first_at := coalesce(first_at,started); last_at := ended;
    total := total+duration; n := n+1;
    splits := splits || jsonb_build_array(jsonb_build_object('elapsed_ms',duration,'completed',true));
  end loop;
  if n<>jsonb_array_length(p_splits) or total>2592000000 then raise exception 'Invalid number or total of measured splits'; end if;
  insert into public.execution_speedrun_runs(id,meter_id,owner_kind,owner_id,title,sections,meter_version,status,elapsed_ms,splits,started_at,ended_at,revision,source)
    values(p_run_id,p_id,o.owner_kind,o.owner_id,m->>'title',p_sections,1,'completed',total,splits,first_at,last_at,n,'mapper');
  insert into public.execution_speedrun_events(id,run_id,action,elapsed_ms,occurred_at,revision) values(p_run_id,p_run_id,'start',0,first_at,0);
  total := 0; n := 0;
  for split in select value from jsonb_array_elements(p_splits) loop
    total := total+(split->>'elapsed_ms')::bigint; n := n+1;
    insert into public.execution_speedrun_events(id,run_id,action,elapsed_ms,occurred_at,revision) values(extensions.gen_random_uuid(),p_run_id,'split',total,(split->>'ended_at')::timestamptz,n);
  end loop;
  return jsonb_build_object('id',p_id,'run_id',p_run_id);
end $$;
revoke all on function public.execution_speedrun_mapper_save(uuid,uuid,text,jsonb,jsonb,uuid,uuid) from public,anon,authenticated;
grant execute on function public.execution_speedrun_mapper_save(uuid,uuid,text,jsonb,jsonb,uuid,uuid) to authenticated;
commit;
