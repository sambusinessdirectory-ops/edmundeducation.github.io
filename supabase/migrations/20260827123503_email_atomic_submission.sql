-- A durable receipt makes both file uploads and queue creation idempotent.
-- Filename aligned with the production migration ledger after application.
-- Custom administrator sessions are checked by every callable entry point.
create table public.schedule_email_submission_receipts (
 admin_id uuid not null references public.schedule_admin_accounts(id) on delete cascade,
 request_id uuid not null,
 payload_hash text,
 response jsonb not null,
 created_at timestamptz not null default clock_timestamp(),
 primary key(admin_id,request_id)
);
alter table public.schedule_email_submission_receipts enable row level security;
revoke all on public.schedule_email_submission_receipts from public,anon,authenticated,service_role;

create function public.schedule_email_v3_submit(p_service_secret text,p_admin_token uuid,p_slot integer,p_request_id uuid,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a uuid; fingerprint text; prior public.schedule_email_submission_receipts%rowtype;
 saved jsonb; receipt jsonb; queued jsonb; send_now boolean; asset_info jsonb;
begin
 if not public._schedule_worker_ok(p_service_secret) then raise exception 'Forbidden' using errcode='42501'; end if;
 a:=public._schedule_admin_id(p_admin_token); if a is null then raise exception 'Expired admin session' using errcode='42501'; end if;
 if p_request_id is null or p_slot is null or p_slot not between 1 and 100 or jsonb_typeof(p_payload) is distinct from 'object' then raise exception 'Invalid submission' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(a::text||p_request_id::text,0));
 fingerprint:=encode(extensions.digest(p_slot::text||':'||p_payload::text,'sha256'),'hex');
 select * into prior from public.schedule_email_submission_receipts where admin_id=a and request_id=p_request_id;
 if found then
  -- A cancellation fence also prevents a delayed upload from queueing later.
  if prior.payload_hash is null then return prior.response; end if;
  if prior.payload_hash<>fingerprint then raise exception 'REQUEST_REUSED: the request ID belongs to another payload' using errcode='22023'; end if;
  return prior.response;
 end if;
 send_now:=coalesce((p_payload->>'sendNow')::boolean,false);
 if (send_now or coalesce((p_payload->>'enabled')::boolean,false)) and (p_payload->>'previewApproved') is distinct from 'true' then raise exception 'PREVIEW_REQUIRED' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(a::text||':'||p_slot,0));
 perform 1 from public.schedule_email_templates where admin_id=a and slot=p_slot and updated_at=(p_payload->>'expectedRevision')::timestamptz for update;
 if not found then raise exception 'DRAFT_CHANGED: reload and preview again' using errcode='22023'; end if;
 saved:=public.schedule_email_service_save_template(p_service_secret,p_admin_token,p_slot,p_payload->>'content',(p_payload->>'enabled')::boolean,
 p_payload->>'cadence',(p_payload->>'dailyTime')::time,p_payload->'recipientIds',nullif(p_payload->>'signatureLink',''),p_payload->>'signatureAction',
 p_payload->>'signatureContent',p_payload->>'signatureContentType',p_payload->>'signatureFilename',p_payload->'removeAttachmentIds',p_payload->'attachments');
 if saved is null then raise exception 'SAVE_FAILED' using errcode='22023'; end if;
 if send_now then
  queued:=public.schedule_email_v2_queue(p_service_secret,p_admin_token,p_slot,p_request_id,(saved->>'revision')::timestamptz);
 end if;
 select jsonb_build_object('signatureFilename',t.signature_image_filename,'signatureBytes',coalesce(octet_length(t.signature_image),0),
 'attachments',coalesce((select jsonb_agg(jsonb_build_object('filename',f.filename,'sizeBytes',f.size_bytes) order by f.created_at,f.id)
 from public.schedule_email_template_attachments f where f.admin_id=a and f.slot=p_slot),'[]')) into asset_info
 from public.schedule_email_templates t where t.admin_id=a and t.slot=p_slot;
 receipt:=coalesce(queued,'{}')||jsonb_build_object('state',case when send_now then 'queued' else 'saved' end,'template',saved,
 'revision',saved->'revision','requestId',p_request_id,'slot',p_slot,'emailIds',coalesce(queued->'emailIds','[]'),'assets',asset_info);
 insert into public.schedule_email_submission_receipts(admin_id,request_id,payload_hash,response) values(a,p_request_id,fingerprint,receipt);
 insert into public.schedule_email_events(admin_id,request_id,stage,outcome,details) values
 (a,p_request_id,'submit_committed','ok',jsonb_build_object('state',receipt->'state','slot',p_slot,'revision',saved->'revision',
 'emailIds',receipt->'emailIds','assets',asset_info,'previewApproved',p_payload->'previewApproved','spellcheck',left(p_payload->>'spellcheck',60)));
 return receipt;
end $$;

-- GET-style lookup never queues mail. Resolve either returns the committed receipt
-- or fences a missing request so it can never commit after the admin starts over.
create function public.schedule_email_v3_receipt(p_service_secret text,p_admin_token uuid,p_request_id uuid,p_resolve boolean default false)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a uuid; receipt jsonb;
begin
 if not public._schedule_worker_ok(p_service_secret) then raise exception 'Forbidden' using errcode='42501'; end if;
 a:=public._schedule_admin_id(p_admin_token); if a is null then raise exception 'Expired admin session' using errcode='42501'; end if;
 if p_request_id is null then raise exception 'Invalid request ID' using errcode='22023'; end if;
 if p_resolve then perform pg_advisory_xact_lock(hashtextextended(a::text||p_request_id::text,0)); end if;
 select response into receipt from public.schedule_email_submission_receipts where admin_id=a and request_id=p_request_id;
 if receipt is not null then return receipt; end if;
 if not p_resolve then return jsonb_build_object('state','pending','requestId',p_request_id); end if;
 receipt:=jsonb_build_object('state','cancelled','requestId',p_request_id,'emailIds','[]'::jsonb);
 insert into public.schedule_email_submission_receipts(admin_id,request_id,response) values(a,p_request_id,receipt);
 insert into public.schedule_email_events(admin_id,request_id,stage,outcome,details) values(a,p_request_id,'submission_cancelled','cancelled',jsonb_build_object('reason','UNCOMMITTED_REQUEST_FENCED'));
 return receipt;
end $$;

create function public.schedule_email_v3_events(p_service_secret text,p_admin_token uuid,p_request_id uuid,p_events jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare a uuid;
begin
 if not public._schedule_worker_ok(p_service_secret) then return false; end if;
 a:=public._schedule_admin_id(p_admin_token); if a is null then return false; end if;
 if jsonb_typeof(p_events) is distinct from 'array' or jsonb_array_length(p_events)>50 or octet_length(p_events::text)>64000 then return false; end if;
 insert into public.schedule_email_events(admin_id,request_id,stage,outcome,details,created_at)
 select a,p_request_id,left(e->>'stage',60),left(e->>'outcome',30),coalesce(e->'details','{}'),(e->>'time')::timestamptz from jsonb_array_elements(p_events) e;
 return true;
end $$;

-- Expose a revision alongside metadata, never the actual attachment bytes.
alter function public.schedule_admin_email_designer_snapshot(uuid) rename to _schedule_email_designer_snapshot_v2;
revoke all on function public._schedule_email_designer_snapshot_v2(uuid) from public,anon,authenticated,service_role;
create function public.schedule_admin_email_designer_snapshot(p_admin_token uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb; a uuid;
begin
 result:=public._schedule_email_designer_snapshot_v2(p_admin_token);
 a:=public._schedule_admin_id(p_admin_token);
 return jsonb_set(result,'{templates}',coalesce((select jsonb_agg(e||jsonb_build_object('revision',t.updated_at) order by ord)
 from jsonb_array_elements(result->'templates') with ordinality as x(e,ord)
 join public.schedule_email_templates t on t.admin_id=a and t.slot=(e->>'slot')::integer),'[]'));
end $$;
revoke all on function public.schedule_admin_email_designer_snapshot(uuid) from public,anon,authenticated,service_role;
grant execute on function public.schedule_admin_email_designer_snapshot(uuid) to authenticated;
revoke all on function public.schedule_email_v3_submit(text,uuid,integer,uuid,jsonb),public.schedule_email_v3_receipt(text,uuid,uuid,boolean),public.schedule_email_v3_events(text,uuid,uuid,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.schedule_email_v3_submit(text,uuid,integer,uuid,jsonb),public.schedule_email_v3_receipt(text,uuid,uuid,boolean),public.schedule_email_v3_events(text,uuid,uuid,jsonb) to anon;
