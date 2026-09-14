begin;
alter table public.execution_speedrun_meters add column favourite boolean not null default false;
alter table public.execution_speedrun_meters add column sort_order bigint not null default 0;
-- Opaque anti-replay fingerprints contain no timing, title, owner or session data.
create table execution_private.speedrun_deleted_ids (id_hash bytea primary key);
alter table execution_private.speedrun_deleted_ids enable row level security;
revoke all on execution_private.speedrun_deleted_ids from public,anon,authenticated;
create or replace function public.execution_speedrun_meter_save(
  p_id uuid, p_title text, p_sections jsonb, p_version integer,
  p_student_token uuid default null, p_admin_token uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare o record; m public.execution_speedrun_meters; s jsonb; i jsonb; n integer := 0; ids text[] := '{}';
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into strict o from execution_private.execution_system_owner(p_student_token, p_admin_token);
  if p_id is null or p_version is null or p_title is null or char_length(btrim(p_title)) not between 1 and 160
    or p_sections is null or jsonb_typeof(p_sections) <> 'array' then raise exception 'Invalid meter'; end if;
  if jsonb_array_length(p_sections) not between 1 and 50 then raise exception 'Use 1–50 main sections'; end if;
  for s in select value from jsonb_array_elements(p_sections) loop
    if coalesce(jsonb_typeof(s->'title'), '') <> 'string' or coalesce(char_length(btrim(s->>'title')), 0) not between 1 and 160
      or coalesce(jsonb_typeof(s->'items'), '') <> 'array' or coalesce(s->>'id','') = '' then raise exception 'Invalid section'; end if;
    if jsonb_array_length(s->'items') > 100 then raise exception 'Use at most 100 subsections'; end if;
    if jsonb_array_length(s->'items') = 0 then
      n := n + 1;
      if coalesce(jsonb_typeof(s->'expected_ms'),'') <> 'number' then raise exception 'Standalone section needs expected time'; end if;
      if (s->>'expected_ms')::numeric not between 1000 and 86400000 or mod((s->>'expected_ms')::numeric,1000) <> 0 then raise exception 'Invalid section time'; end if;
    end if;
    if s->>'id' = any(ids) then raise exception 'Duplicate section ID'; end if;
    ids := array_append(ids, s->>'id');
    for i in select value from jsonb_array_elements(s->'items') loop
      n := n + 1;
      if coalesce(jsonb_typeof(i->'title'), '') <> 'string' or coalesce(char_length(btrim(i->>'title')), 0) not between 1 and 160
        or coalesce(jsonb_typeof(i->'expected_ms'), '') <> 'number' or coalesce(i->>'id','') = '' then raise exception 'Invalid subsection'; end if;
      if (i->>'expected_ms')::numeric not between 1000 and 86400000 or mod((i->>'expected_ms')::numeric, 1000) <> 0 then raise exception 'Invalid expected time'; end if;
      if i->>'id' = any(ids) then raise exception 'Duplicate subsection ID'; end if;
      ids := array_append(ids, i->>'id');
    end loop;
  end loop;
  if n > 500 or octet_length(p_sections::text) > 250000 then raise exception 'Meter is too large'; end if;
  perform pg_advisory_xact_lock(hashtextextended(o.owner_kind || o.owner_id::text, 73571));
  if exists(select 1 from execution_private.speedrun_deleted_ids where id_hash=extensions.digest(p_id::text,'sha256')) then raise exception 'This meter was permanently deleted' using errcode='40001'; end if;
  select * into m from public.execution_speedrun_meters where id = p_id for update;
  if found then
    if m.owner_kind <> o.owner_kind or m.owner_id <> o.owner_id then raise exception 'Meter not found' using errcode = '42501'; end if;
    if m.version <> p_version then raise exception 'Meter changed in another window. Reload before editing.' using errcode = '40001'; end if;
    update public.execution_speedrun_meters set title = btrim(p_title), sections = p_sections,
      version = m.version + case when m.sections = p_sections then 0 else 1 end, updated_at = now()
      where id = p_id returning * into m;
  else
    if p_version <> 0 then raise exception 'Meter not found'; end if;
    insert into public.execution_speedrun_meters(id,owner_kind,owner_id,title,sections)
      values(p_id,o.owner_kind,o.owner_id,btrim(p_title),p_sections) returning * into m;
  end if;
  return to_jsonb(m) - 'owner_id' - 'owner_kind';
end $$;

create or replace function public.execution_speedrun_start(
  p_id uuid, p_meter_id uuid, p_version integer, p_at timestamptz,
  p_student_token uuid default null, p_admin_token uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare o record; m public.execution_speedrun_meters; r public.execution_speedrun_runs;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into strict o from execution_private.execution_system_owner(p_student_token, p_admin_token);
  perform pg_advisory_xact_lock(hashtextextended(o.owner_kind || o.owner_id::text, 73571));
  if exists(select 1 from execution_private.speedrun_deleted_ids where id_hash = extensions.digest(p_id::text,'sha256')) then raise exception 'This attempt was permanently deleted' using errcode = '40001'; end if;
  select * into r from public.execution_speedrun_runs where id = p_id and owner_kind = o.owner_kind and owner_id = o.owner_id;
  if found then return to_jsonb(r) - 'owner_id' - 'owner_kind'; end if;
  if p_id is null or p_at is null or p_at > now() + interval '5 minutes' or p_at < now() - interval '30 days' then raise exception 'Invalid start time'; end if;
  select * into m from public.execution_speedrun_meters where id = p_meter_id and owner_kind = o.owner_kind and owner_id = o.owner_id;
  if not found or m.version is distinct from p_version then raise exception 'Meter changed. Reload before starting.' using errcode = '40001'; end if;
  if exists(select 1 from public.execution_speedrun_runs where owner_kind = o.owner_kind and owner_id = o.owner_id and status in ('running','paused')) then
    raise exception 'An active session already exists. Reload to resume it.' using errcode = '40001';
  end if;
  insert into public.execution_speedrun_runs(id,meter_id,owner_kind,owner_id,title,sections,meter_version,status,anchor_at,started_at)
    values(p_id,m.id,o.owner_kind,o.owner_id,m.title,m.sections,m.version,'running',p_at,p_at) returning * into r;
  insert into public.execution_speedrun_events(id,run_id,action,elapsed_ms,occurred_at,revision) values(p_id,p_id,'start',0,p_at,0);
  return to_jsonb(r) - 'owner_id' - 'owner_kind';
end $$;

create or replace function public.execution_speedrun_event(
  p_id uuid, p_run_id uuid, p_action text, p_revision integer, p_elapsed_ms bigint, p_at timestamptz,
  p_student_token uuid default null, p_admin_token uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare o record; r public.execution_speedrun_runs; e public.execution_speedrun_events; total integer; previous bigint;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into strict o from execution_private.execution_system_owner(p_student_token, p_admin_token);
  select * into r from public.execution_speedrun_runs where id = p_run_id and owner_kind = o.owner_kind and owner_id = o.owner_id for update;
  if not found then raise exception 'Session not found' using errcode = '42501'; end if;
  select * into e from public.execution_speedrun_events where id = p_id;
  if found then
    if e.run_id <> p_run_id or e.action <> p_action or e.elapsed_ms <> p_elapsed_ms then raise exception 'Event ID conflict'; end if;
    return to_jsonb(r) - 'owner_id' - 'owner_kind';
  end if;
  if r.revision is distinct from p_revision then raise exception 'Session changed in another window. Your unsaved timing is retained on this device.' using errcode = '40001'; end if;
  if p_id is null or p_action is null or p_elapsed_ms is null or p_at is null or p_action not in ('split','pause','resume','end')
    or r.status not in ('running','paused') or p_elapsed_ms < r.elapsed_ms or p_elapsed_ms > 2592000000
    or p_at < r.started_at or p_at > now() + interval '5 minutes' then raise exception 'Invalid timing event'; end if;
  if r.status = 'paused' and (p_action not in ('resume','end') or p_elapsed_ms <> r.elapsed_ms) then raise exception 'Session is paused'; end if;
  if p_action = 'resume' and r.status <> 'paused' then raise exception 'Session is already running'; end if;
  if p_action = 'split' then
    select sum(greatest(1,jsonb_array_length(s->'items'))) into total from jsonb_array_elements(r.sections) s;
    select coalesce(sum((s->>'elapsed_ms')::bigint),0) into previous from jsonb_array_elements(r.splits) s;
    if jsonb_array_length(r.splits) >= total then raise exception 'No subsection remaining'; end if;
    r.splits := r.splits || jsonb_build_array(jsonb_build_object('elapsed_ms',p_elapsed_ms - previous,'completed',true));
    if jsonb_array_length(r.splits) = total then r.status := 'completed'; end if;
  elsif p_action = 'pause' then r.status := 'paused';
  elsif p_action = 'resume' then r.status := 'running';
  elsif p_action = 'end' then r.status := 'ended'; end if;
  update public.execution_speedrun_runs set status = r.status, elapsed_ms = p_elapsed_ms, splits = r.splits,
    anchor_at = case when r.status = 'running' then p_at else null end,
    ended_at = case when r.status in ('completed','ended') then p_at else null end, revision = r.revision + 1
    where id = p_run_id returning * into r;
  insert into public.execution_speedrun_events(id,run_id,action,elapsed_ms,occurred_at,revision)
    values(p_id,p_run_id,p_action,p_elapsed_ms,p_at,r.revision);
  return to_jsonb(r) - 'owner_id' - 'owner_kind';
end $$;

create function public.execution_speedrun_library_update(
  p_id uuid, p_action text, p_favourite boolean default null,
  p_student_token uuid default null, p_admin_token uuid default null
) returns void language plpgsql security definer set search_path = '' as $$
declare o record; ids uuid[]; pos integer; other integer; swap uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into strict o from execution_private.execution_system_owner(p_student_token,p_admin_token);
  perform pg_advisory_xact_lock(hashtextextended(o.owner_kind || o.owner_id::text,73571));
  if not exists(select 1 from public.execution_speedrun_meters where id=p_id and owner_kind=o.owner_kind and owner_id=o.owner_id) then raise exception 'Meter not found' using errcode='42501'; end if;
  if p_action = 'favourite' and p_favourite is not null then
    update public.execution_speedrun_meters set favourite=p_favourite where id=p_id;
  elsif p_action in ('up','down') then
    select array_agg(id order by sort_order,updated_at desc,id) into ids from public.execution_speedrun_meters where owner_kind=o.owner_kind and owner_id=o.owner_id;
    pos := array_position(ids,p_id); other := pos + case when p_action='up' then -1 else 1 end;
    while other between 1 and cardinality(ids) and p_favourite is true and not exists(select 1 from public.execution_speedrun_meters where id=ids[other] and favourite) loop
      other := other + case when p_action='up' then -1 else 1 end;
    end loop;
    if other between 1 and cardinality(ids) then
      swap := ids[other]; ids[other] := p_id; ids[pos] := swap;
      update public.execution_speedrun_meters m set sort_order = a.position
      from unnest(ids) with ordinality a(id,position) where m.id=a.id and m.owner_kind=o.owner_kind and m.owner_id=o.owner_id;
    end if;
  else raise exception 'Invalid library action'; end if;
end $$;

create function public.execution_speedrun_records(
  p_meter_id uuid default null, p_offset integer default 0,
  p_student_token uuid default null, p_admin_token uuid default null
) returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare o record; rows jsonb; total bigint;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into strict o from execution_private.execution_system_owner(p_student_token,p_admin_token);
  if p_offset is null or p_offset<0 then raise exception 'Invalid offset'; end if;
  select count(*) into total from public.execution_speedrun_runs r
  where r.owner_kind=o.owner_kind and r.owner_id=o.owner_id and (p_meter_id is null or r.meter_id=p_meter_id);
  select coalesce(jsonb_agg(to_jsonb(r)-'owner_kind'-'owner_id' order by r.started_at desc,r.id),'[]') into rows from (
    select * from public.execution_speedrun_runs r where r.owner_kind=o.owner_kind and r.owner_id=o.owner_id and (p_meter_id is null or r.meter_id=p_meter_id)
    order by r.started_at desc,r.id limit 30 offset p_offset
  ) r;
  return jsonb_build_object('history',rows,'history_count',total);
end $$;

create function public.execution_speedrun_delete(
  p_id uuid, p_kind text, p_revision integer,
  p_student_token uuid default null, p_admin_token uuid default null
) returns void language plpgsql security definer set search_path = '' as $$
declare o record; version integer; ids uuid[];
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into strict o from execution_private.execution_system_owner(p_student_token,p_admin_token);
  perform pg_advisory_xact_lock(hashtextextended(o.owner_kind || o.owner_id::text,73571));
  if p_kind='meter' then
    select m.version into version from public.execution_speedrun_meters m where m.id=p_id and m.owner_kind=o.owner_kind and m.owner_id=o.owner_id for update;
    if not found then raise exception 'Meter not found' using errcode='42501'; end if;
    if version is distinct from p_revision then raise exception 'Meter changed. Reload before deleting.' using errcode='40001'; end if;
    select array_agg(r.id) into ids from public.execution_speedrun_runs r where r.meter_id=p_id and r.owner_kind=o.owner_kind and r.owner_id=o.owner_id;
  elsif p_kind='run' then
    select r.revision into version from public.execution_speedrun_runs r where r.id=p_id and r.owner_kind=o.owner_kind and r.owner_id=o.owner_id for update;
    if not found then raise exception 'Attempt not found' using errcode='42501'; end if;
    if version is distinct from p_revision then raise exception 'Attempt changed. Reload before deleting.' using errcode='40001'; end if;
    ids := array[p_id];
  else raise exception 'Invalid deletion type'; end if;
  insert into execution_private.speedrun_deleted_ids(id_hash) select extensions.digest(id::text,'sha256') from unnest(ids) id on conflict do nothing;
  delete from public.execution_speedrun_events where run_id=any(ids);
  delete from public.execution_speedrun_runs where id=any(ids) and owner_kind=o.owner_kind and owner_id=o.owner_id;
  if p_kind='meter' then
    insert into execution_private.speedrun_deleted_ids(id_hash) values(extensions.digest(p_id::text,'sha256')) on conflict do nothing;
    delete from public.execution_speedrun_meters where id=p_id and owner_kind=o.owner_kind and owner_id=o.owner_id; end if;
end $$;
revoke all on function public.execution_speedrun_library_update(uuid,text,boolean,uuid,uuid) from public,anon,authenticated;
revoke all on function public.execution_speedrun_records(uuid,integer,uuid,uuid) from public,anon,authenticated;
revoke all on function public.execution_speedrun_delete(uuid,text,integer,uuid,uuid) from public,anon,authenticated;
grant execute on function public.execution_speedrun_library_update(uuid,text,boolean,uuid,uuid) to authenticated;
grant execute on function public.execution_speedrun_records(uuid,integer,uuid,uuid) to authenticated;
grant execute on function public.execution_speedrun_delete(uuid,text,integer,uuid,uuid) to authenticated;
commit;
