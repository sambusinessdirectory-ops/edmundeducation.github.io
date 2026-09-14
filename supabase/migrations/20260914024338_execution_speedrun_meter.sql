-- Speedrun templates, immutable run snapshots and idempotent timing events.
-- Uses the existing Execution account-session boundary (including auth.uid()).
begin;

create table public.execution_speedrun_meters (
  id uuid primary key,
  owner_kind text not null check (owner_kind in ('student','admin')),
  owner_id uuid not null,
  title text not null check (char_length(title) between 1 and 160),
  sections jsonb not null check (jsonb_typeof(sections) = 'array'),
  version integer not null default 1,
  updated_at timestamptz not null default now()
);
create index execution_speedrun_meters_owner_idx on public.execution_speedrun_meters(owner_kind, owner_id, updated_at desc);

create table public.execution_speedrun_runs (
  id uuid primary key,
  meter_id uuid not null references public.execution_speedrun_meters(id),
  owner_kind text not null check (owner_kind in ('student','admin')),
  owner_id uuid not null,
  title text not null,
  sections jsonb not null,
  meter_version integer not null,
  status text not null check (status in ('running','paused','completed','ended')),
  elapsed_ms bigint not null default 0 check (elapsed_ms >= 0),
  splits jsonb not null default '[]',
  anchor_at timestamptz,
  started_at timestamptz not null,
  ended_at timestamptz,
  revision integer not null default 0
);
create unique index execution_speedrun_one_active_idx on public.execution_speedrun_runs(owner_kind, owner_id) where status in ('running','paused');
create index execution_speedrun_runs_history_idx on public.execution_speedrun_runs(owner_kind, owner_id, meter_id, started_at desc);
create index execution_speedrun_runs_meter_idx on public.execution_speedrun_runs(meter_id, meter_version, status, elapsed_ms);

create table public.execution_speedrun_events (
  id uuid primary key,
  run_id uuid not null references public.execution_speedrun_runs(id),
  action text not null check (action in ('start','split','pause','resume','end')),
  elapsed_ms bigint not null,
  occurred_at timestamptz not null,
  saved_at timestamptz not null default now(),
  revision integer not null,
  unique(run_id, revision)
);

alter table public.execution_speedrun_meters enable row level security;
alter table public.execution_speedrun_runs enable row level security;
alter table public.execution_speedrun_events enable row level security;
revoke all on public.execution_speedrun_meters, public.execution_speedrun_runs, public.execution_speedrun_events from public, anon, authenticated;

-- RPC-only access: every operation derives ownership from validated account tokens.
create function public.execution_speedrun_meter_save(
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
    if jsonb_array_length(s->'items') not between 1 and 100 then raise exception 'Each section needs 1–100 subsections'; end if;
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

create function public.execution_speedrun_start(
  p_id uuid, p_meter_id uuid, p_version integer, p_at timestamptz,
  p_student_token uuid default null, p_admin_token uuid default null
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare o record; m public.execution_speedrun_meters; r public.execution_speedrun_runs;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into strict o from execution_private.execution_system_owner(p_student_token, p_admin_token);
  perform pg_advisory_xact_lock(hashtextextended(o.owner_kind || o.owner_id::text, 73571));
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

create function public.execution_speedrun_event(
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
    select sum(jsonb_array_length(s->'items')) into total from jsonb_array_elements(r.sections) s;
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

create function public.execution_speedrun_load(
  p_meter_id uuid default null, p_offset integer default 0,
  p_student_token uuid default null, p_admin_token uuid default null
) returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare o record; meters jsonb; active jsonb; history jsonb; stats jsonb; best jsonb; m public.execution_speedrun_meters; count_runs bigint;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select * into strict o from execution_private.execution_system_owner(p_student_token, p_admin_token);
  if p_offset is null or p_offset < 0 then raise exception 'Invalid history offset'; end if;
  select coalesce(jsonb_agg(to_jsonb(t) - 'owner_id' - 'owner_kind' order by t.updated_at desc),'[]') into meters
    from public.execution_speedrun_meters t where t.owner_kind = o.owner_kind and t.owner_id = o.owner_id;
  select to_jsonb(r) - 'owner_id' - 'owner_kind' into active from public.execution_speedrun_runs r
    where r.owner_kind = o.owner_kind and r.owner_id = o.owner_id and r.status in ('running','paused');
  select * into m from public.execution_speedrun_meters where id = coalesce(p_meter_id,(active->>'meter_id')::uuid,(meters->0->>'id')::uuid)
    and owner_kind = o.owner_kind and owner_id = o.owner_id;
  select count(*) into count_runs from public.execution_speedrun_runs r where r.owner_kind = o.owner_kind and r.owner_id = o.owner_id and r.meter_id = m.id and r.status in ('completed','ended');
  select coalesce(jsonb_agg(to_jsonb(t) - 'owner_id' - 'owner_kind' order by t.started_at desc),'[]') into history from (
    select * from public.execution_speedrun_runs r where r.owner_kind = o.owner_kind and r.owner_id = o.owner_id and r.meter_id = m.id and r.status in ('completed','ended')
    order by r.started_at desc, r.id limit 30 offset p_offset
  ) t;
  select jsonb_build_object('completed',count(*),'fastest',min(elapsed_ms),'slowest',max(elapsed_ms),'average',round(avg(elapsed_ms))) into stats
    from public.execution_speedrun_runs r where r.owner_kind = o.owner_kind and r.owner_id = o.owner_id and r.meter_id = m.id and r.meter_version = m.version and r.status = 'completed';
  select coalesce(jsonb_agg(t.best_ms order by t.position),'[]') into best from (
    select s.ordinality as position, min((s.value->>'elapsed_ms')::bigint) as best_ms
    from public.execution_speedrun_runs r cross join lateral jsonb_array_elements(r.splits) with ordinality s
    where r.owner_kind = o.owner_kind and r.owner_id = o.owner_id and r.meter_id = m.id and r.meter_version = m.version and r.status in ('completed','ended')
    group by s.ordinality
  ) t;
  return jsonb_build_object('meters',meters,'active',active,'selected_id',m.id,'history',history,'history_count',count_runs,'stats',stats || jsonb_build_object('best_segments',best));
end $$;

revoke all on function public.execution_speedrun_meter_save(uuid,text,jsonb,integer,uuid,uuid) from public,anon,authenticated;
revoke all on function public.execution_speedrun_start(uuid,uuid,integer,timestamptz,uuid,uuid) from public,anon,authenticated;
revoke all on function public.execution_speedrun_event(uuid,uuid,text,integer,bigint,timestamptz,uuid,uuid) from public,anon,authenticated;
revoke all on function public.execution_speedrun_load(uuid,integer,uuid,uuid) from public,anon,authenticated;
grant execute on function public.execution_speedrun_meter_save(uuid,text,jsonb,integer,uuid,uuid) to authenticated;
grant execute on function public.execution_speedrun_start(uuid,uuid,integer,timestamptz,uuid,uuid) to authenticated;
grant execute on function public.execution_speedrun_event(uuid,uuid,text,integer,bigint,timestamptz,uuid,uuid) to authenticated;
grant execute on function public.execution_speedrun_load(uuid,integer,uuid,uuid) to authenticated;
commit;
