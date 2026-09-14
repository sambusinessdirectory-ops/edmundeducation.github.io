begin;
alter table public.execution_speedrun_runs add column mapper_parts jsonb, add column mapper_request uuid, add column mapper_request_hash bytea;

-- Reconstruct legacy mappings from their immutable splits and event timestamps.
create function public.execution_speedrun_mapper_open(p_run_id uuid,p_student_token uuid default null,p_admin_token uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare o record; r public.execution_speedrun_runs; m public.execution_speedrun_meters;
 parts jsonb:='[]'; s jsonb; i jsonb; n int:=0; duration bigint; ended timestamptz;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into strict o from execution_private.execution_system_owner(p_student_token,p_admin_token);
 perform pg_advisory_xact_lock(hashtextextended(o.owner_kind||o.owner_id::text,73571));
 select * into r from public.execution_speedrun_runs where id=p_run_id and owner_kind=o.owner_kind and owner_id=o.owner_id and source='mapper' and status='completed';
 if not found then raise exception 'Mapping record not found' using errcode='42501'; end if;
 select * into strict m from public.execution_speedrun_meters where id=r.meter_id;
 if m.version<>r.meter_version then raise exception 'This meter has changed since this mapping. Reopen the latest mapping instead.' using errcode='40001'; end if;
 if r.mapper_parts is not null then parts:=r.mapper_parts;
 else
  for s in select value from jsonb_array_elements(r.sections) loop
   for i in select value from jsonb_array_elements(case when jsonb_array_length(s->'items')=0 then jsonb_build_array(s) else s->'items' end) loop
    duration:=(r.splits->n->>'elapsed_ms')::bigint;
    select occurred_at into ended from public.execution_speedrun_events where run_id=r.id and revision=n+1 and action='split';
    ended:=coalesce(ended,r.ended_at);
    parts:=parts||jsonb_build_array(jsonb_build_object('id',case when jsonb_array_length(s->'items')=0 then extensions.gen_random_uuid()::text else i->>'id' end,'section_id',s->>'id','section_title',s->>'title','title',case when jsonb_array_length(s->'items')=0 then null else i->>'title' end,'elapsed_ms',duration,'started_at',ended-duration*interval '1 millisecond','ended_at',ended,'anchor',null));
    n:=n+1;
   end loop;
  end loop;
 end if;
 return jsonb_build_object('id',m.id,'run_id',r.id,'title',m.title,'parts',parts,'current',null,'inputs',jsonb_build_object('main','','sub','','choice','same'),'base_revision',r.revision,'meter_updated_at',m.updated_at);
end $$;

-- Update the original attempt atomically. A stable request ID makes retries safe;
-- revisions and meter timestamps prevent another device's edits being overwritten.
create function public.execution_speedrun_mapper_update(p_run_id uuid,p_request_id uuid,p_revision integer,p_meter_updated_at timestamptz,p_title text,p_parts jsonb,p_student_token uuid default null,p_admin_token uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare o record; r public.execution_speedrun_runs; m public.execution_speedrun_meters; saved jsonb;
 part jsonb; shape jsonb:='[]'; items jsonb:='[]'; measured_splits jsonb:='[]'; sid text; stitle text;
 duration bigint; total bigint:=0; started timestamptz; ended timestamptz; first_at timestamptz; last_at timestamptz;
 fingerprint bytea;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into strict o from execution_private.execution_system_owner(p_student_token,p_admin_token);
 perform pg_advisory_xact_lock(hashtextextended(o.owner_kind||o.owner_id::text,73571));
 select * into r from public.execution_speedrun_runs where id=p_run_id and owner_kind=o.owner_kind and owner_id=o.owner_id and source='mapper' and status='completed' for update;
 if not found then raise exception 'Mapping record not found or deleted' using errcode='42501'; end if;
 if p_request_id is null or coalesce(jsonb_typeof(p_parts),'')<>'array' or jsonb_array_length(p_parts) not between 1 and 500 or octet_length(p_parts::text)>500000 then raise exception 'Invalid mapping parts'; end if;
 fingerprint:=extensions.digest(jsonb_build_object('title',p_title,'parts',p_parts)::text,'sha256');
 if r.mapper_request=p_request_id then
  if r.mapper_request_hash<>fingerprint then raise exception 'Save request changed' using errcode='40001'; end if;
  return jsonb_build_object('id',r.meter_id,'run_id',r.id);
 end if;
 select * into strict m from public.execution_speedrun_meters where id=r.meter_id for update;
 if p_revision is distinct from r.revision or p_meter_updated_at is distinct from m.updated_at or m.version<>r.meter_version then raise exception 'This mapping or meter changed on another device. Close this draft and reopen the latest record.' using errcode='40001'; end if;
 if exists(select 1 from public.execution_speedrun_runs where owner_kind=o.owner_kind and owner_id=o.owner_id and status in ('running','paused')) then raise exception 'Finish the active challenge before saving this mapping' using errcode='40001'; end if;
 for part in select value from jsonb_array_elements(p_parts) loop
  if coalesce(jsonb_typeof(part->'id'),'')<>'string' or coalesce(jsonb_typeof(part->'section_id'),'')<>'string' or coalesce(jsonb_typeof(part->'section_title'),'')<>'string' or coalesce(jsonb_typeof(part->'elapsed_ms'),'')<>'number' or coalesce(jsonb_typeof(part->'started_at'),'')<>'string' or coalesce(jsonb_typeof(part->'ended_at'),'')<>'string' then raise exception 'Invalid measured part'; end if;
  if (part->>'elapsed_ms')::numeric not between 0 and 86400000 or mod((part->>'elapsed_ms')::numeric,1)<>0 then raise exception 'Each measured part must be within 24 hours'; end if;
  duration:=(part->>'elapsed_ms')::bigint; started:=(part->>'started_at')::timestamptz; ended:=(part->>'ended_at')::timestamptz;
  if not isfinite(started) or not isfinite(ended) or started<r.started_at-interval '1 millisecond' or ended>now()+interval '5 minutes' or ended<started or duration>extract(epoch from ended-started)*1000 then raise exception 'Invalid mapping timeline'; end if;
  first_at:=least(coalesce(first_at,started),started); last_at:=greatest(coalesce(last_at,ended),ended);
  total:=total+duration; measured_splits:=measured_splits||jsonb_build_array(jsonb_build_object('elapsed_ms',duration,'completed',true));
  if sid is distinct from part->>'section_id' then
   if sid is not null then
    shape:=shape||jsonb_build_array(case when jsonb_array_length(items)=1 and items->0->>'title' is null then jsonb_build_object('id',sid,'title',stitle,'items','[]'::jsonb,'expected_ms',items->0->'expected_ms') else jsonb_build_object('id',sid,'title',stitle,'items',(select jsonb_agg(jsonb_set(x,'{title}',to_jsonb(coalesce(x->>'title',stitle)))) from jsonb_array_elements(items) x)) end);
   end if;
   sid:=part->>'section_id'; stitle:=part->>'section_title'; items:='[]';
  elsif stitle is distinct from part->>'section_title' then raise exception 'Inconsistent section title'; end if;
  items:=items||jsonb_build_array(jsonb_build_object('id',part->>'id','title',nullif(part->>'title',''),'expected_ms',greatest(1000,ceil(duration/1000.0)*1000)));
 end loop;
 shape:=shape||jsonb_build_array(case when jsonb_array_length(items)=1 and items->0->>'title' is null then jsonb_build_object('id',sid,'title',stitle,'items','[]'::jsonb,'expected_ms',items->0->'expected_ms') else jsonb_build_object('id',sid,'title',stitle,'items',(select jsonb_agg(jsonb_set(x,'{title}',to_jsonb(coalesce(x->>'title',stitle)))) from jsonb_array_elements(items) x)) end);
 if total>2592000000 or (select count(distinct x->>'id') from jsonb_array_elements(p_parts) x)<>jsonb_array_length(p_parts) then raise exception 'Invalid total or duplicate parts'; end if;
 saved:=public.execution_speedrun_meter_save(m.id,p_title,shape,m.version,p_student_token,p_admin_token);
 update public.execution_speedrun_runs set title=saved->>'title',sections=shape,meter_version=(saved->>'version')::int,elapsed_ms=total,splits=measured_splits,ended_at=last_at,revision=r.revision+1,mapper_parts=p_parts,mapper_request=p_request_id,mapper_request_hash=fingerprint where id=r.id;
 insert into public.execution_speedrun_events(id,run_id,action,elapsed_ms,occurred_at,revision) values(p_request_id,r.id,'end',total,now(),r.revision+1);
 return jsonb_build_object('id',m.id,'run_id',r.id);
end $$;
revoke all on function public.execution_speedrun_mapper_open(uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function public.execution_speedrun_mapper_update(uuid,uuid,integer,timestamptz,text,jsonb,uuid,uuid) from public,anon,authenticated;
grant execute on function public.execution_speedrun_mapper_open(uuid,uuid,uuid) to authenticated;
grant execute on function public.execution_speedrun_mapper_update(uuid,uuid,integer,timestamptz,text,jsonb,uuid,uuid) to authenticated;
commit;
