-- Private email audit, immutable assets, and double-opt-in visitor subscriptions.
-- Existing custom Homework admin tokens are checked in addition to the Worker secret.
begin;

create table public.schedule_email_snapshots (
  id uuid primary key default gen_random_uuid(), admin_id uuid not null references public.schedule_admin_accounts(id),
  assets jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.schedule_email_subscribers (
  id uuid primary key default gen_random_uuid(), admin_id uuid not null references public.schedule_admin_accounts(id),
  email text not null check(char_length(email) between 6 and 254), name text not null default '',
  topics text[] not null default '{}', status text not null default 'pending' check(status in ('pending','active','unsubscribed')),
  confirmed_at timestamptz, unsubscribed_at timestamptz, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), unique(admin_id,email),
  check(topics <@ array['resources','daily-newsletter','major-music','news-analysis','english-study'])
);
create table public.schedule_email_subscription_requests (
  id uuid primary key default gen_random_uuid(), subscriber_id uuid not null references public.schedule_email_subscribers(id),
  token_hash text not null unique check(token_hash ~ '^[a-f0-9]{64}$'), name text not null, topics text[] not null,
  created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '24 hours', used_at timestamptz
);
create index on public.schedule_email_subscription_requests(subscriber_id,created_at desc);
create index on public.schedule_email_subscribers(admin_id,status,created_at desc);
create table public.schedule_email_events (
  id bigint generated always as identity primary key, admin_id uuid not null references public.schedule_admin_accounts(id),
  request_id uuid, job_id uuid, stage text not null, outcome text not null, details jsonb not null default '{}',
  created_at timestamptz not null default clock_timestamp(), check(pg_column_size(details)<10000)
);
create index on public.schedule_email_events(admin_id,created_at desc);
create index on public.schedule_email_events(job_id,id);
create index on public.schedule_email_events(request_id,id);
create table public.schedule_email_page_versions (
  topic text primary key check(topic in ('resources','daily-newsletter','major-music','news-analysis','english-study')),
  fingerprint text, version bigint not null default 1, checked_at timestamptz, changed_at timestamptz, last_error text
);
create table public.schedule_email_public_sender (
  singleton boolean primary key default true check(singleton),
  admin_id uuid not null unique references public.schedule_admin_accounts(id)
);
create table public.schedule_email_scheduler_health (
  singleton boolean primary key default true check(singleton), started_at timestamptz, completed_at timestamptz, last_error text
);
-- Pin the existing sender's admin identity, not its mutable email address.
insert into public.schedule_email_public_sender(admin_id)
select admin_id from public.schedule_email_sender_settings where refresh_token_ciphertext is not null
and (select count(*) from public.schedule_email_sender_settings where refresh_token_ciphertext is not null)=1;

alter table public.schedule_email_delivery_jobs
  alter column template_slot drop not null,
  drop constraint schedule_email_delivery_jobs_admin_id_template_slot_fkey,
  add constraint schedule_email_jobs_template_fk foreign key(admin_id,template_slot) references public.schedule_email_templates(admin_id,slot) on delete set null (template_slot),
  add column snapshot_id uuid references public.schedule_email_snapshots(id),
  add column subscriber_id uuid references public.schedule_email_subscribers(id),
  add column kind text not null default 'student' check(kind in ('student','visitor_confirmation','visitor_update')),
  add column topic text, add column request_id uuid, add column delivery_started_at timestamptz,
  add column action_url text, add column requested_sender_email text;
alter table public.schedule_email_delivery_jobs drop constraint schedule_email_delivery_jobs_status_check;
alter table public.schedule_email_delivery_jobs add constraint schedule_email_delivery_jobs_status_check check(status in ('queued','processing','accepted','failed','cancelled','uncertain'));
alter table public.schedule_email_logs alter column template_slot drop not null;
alter table public.schedule_email_logs drop constraint schedule_email_logs_status_check;
alter table public.schedule_email_logs add constraint schedule_email_logs_status_check check(status in ('queued','processing','accepted','failed','cancelled','uncertain'));
create index on public.schedule_email_delivery_jobs(admin_id,status,updated_at);
create index on public.schedule_email_delivery_jobs(subscriber_id,status);
create index on public.schedule_email_delivery_jobs(snapshot_id);
create index on public.schedule_email_delivery_jobs(request_id);

alter table public.schedule_email_snapshots enable row level security;
alter table public.schedule_email_subscribers enable row level security;
alter table public.schedule_email_subscription_requests enable row level security;
alter table public.schedule_email_events enable row level security;
alter table public.schedule_email_page_versions enable row level security;
alter table public.schedule_email_public_sender enable row level security;
alter table public.schedule_email_scheduler_health enable row level security;
revoke all on public.schedule_email_scheduler_health from public,anon,authenticated,service_role;
revoke all on public.schedule_email_snapshots,public.schedule_email_subscribers,public.schedule_email_subscription_requests,public.schedule_email_events,public.schedule_email_page_versions,public.schedule_email_public_sender from public,anon,authenticated,service_role;

create function public._schedule_email_assets(p_admin uuid,p_slot integer) returns jsonb
language sql stable security definer set search_path='' as $$
select jsonb_build_object('signatureLink',t.signature_link,'signatureContent',case when t.signature_image is not null then encode(t.signature_image,'base64') end,
 'signatureContentType',t.signature_image_content_type,'signatureFilename',t.signature_image_filename,
 'attachments',coalesce((select jsonb_agg(jsonb_build_object('filename',a.filename,'contentType',a.content_type,'content',encode(a.content,'base64'),'sizeBytes',a.size_bytes) order by a.created_at,a.id)
 from public.schedule_email_template_attachments a where a.admin_id=p_admin and a.slot=p_slot),'[]'::jsonb))
from public.schedule_email_templates t where t.admin_id=p_admin and t.slot=p_slot
$$;

-- Wrap the existing validated upload routine, keeping the total limit atomic across retained + new PDFs.
alter function public.schedule_email_service_save_template(text,uuid,integer,text,boolean,text,time,jsonb,text,text,text,text,text,jsonb,jsonb) rename to _schedule_email_save_template_v1;
revoke all on function public._schedule_email_save_template_v1(text,uuid,integer,text,boolean,text,time,jsonb,text,text,text,text,text,jsonb,jsonb) from public,anon,authenticated,service_role;
create function public.schedule_email_service_save_template(
 p_service_secret text,p_admin_token uuid,p_slot integer,p_content text,p_enabled boolean,p_cadence text,p_daily_time time,p_recipient_ids jsonb,
 p_signature_link text,p_signature_action text,p_signature_content text,p_signature_content_type text,p_signature_filename text,p_remove_attachment_ids jsonb,p_attachments jsonb
) returns jsonb language plpgsql security definer set search_path='' as $$
declare a uuid; r jsonb; revision timestamptz;
begin
 if not public._schedule_worker_ok(p_service_secret) then return null; end if;
 a:=public._schedule_admin_id(p_admin_token); if a is null then return null; end if;
 perform pg_advisory_xact_lock(hashtextextended(a::text||':'||p_slot,0));
 r:=public._schedule_email_save_template_v1(p_service_secret,p_admin_token,p_slot,p_content,p_enabled,p_cadence,p_daily_time,p_recipient_ids,
 p_signature_link,p_signature_action,p_signature_content,p_signature_content_type,p_signature_filename,p_remove_attachment_ids,p_attachments);
 if (select coalesce(sum(size_bytes),0) from public.schedule_email_template_attachments where admin_id=a and slot=p_slot)>10485760 then raise exception 'PDF_TOTAL_LIMIT: retained and new PDFs exceed 10 MB' using errcode='22023'; end if;
 select updated_at into revision from public.schedule_email_templates where admin_id=a and slot=p_slot;
 return r||jsonb_build_object('revision',revision);
end $$;
revoke all on function public.schedule_email_service_save_template(text,uuid,integer,text,boolean,text,time,jsonb,text,text,text,text,text,jsonb,jsonb) from public,anon,authenticated,service_role;
grant execute on function public.schedule_email_service_save_template(text,uuid,integer,text,boolean,text,time,jsonb,text,text,text,text,text,jsonb,jsonb) to anon;

-- Preserve historical jobs when a template is removed. Only queued jobs are cancelled.
create or replace function public.schedule_email_service_delete_template(p_service_secret text,p_admin_token uuid,p_slot integer)
returns boolean language plpgsql security definer set search_path='' as $$
declare a uuid;
begin
 if not public._schedule_worker_ok(p_service_secret) then return false; end if;
 a:=public._schedule_admin_id(p_admin_token); if a is null then return false; end if;
 if exists(select 1 from public.schedule_email_delivery_jobs where admin_id=a and template_slot=p_slot and status='processing') then raise exception 'An email is processing; try deleting later' using errcode='22023'; end if;
 update public.schedule_email_delivery_jobs set status='cancelled',last_error='TEMPLATE_DELETED',updated_at=clock_timestamp() where admin_id=a and template_slot=p_slot and status='queued';
 delete from public.schedule_email_templates where admin_id=a and slot=p_slot;
 return found;
end $$;

create function public._schedule_email_audit_job() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if TG_OP='INSERT' or new.status is distinct from old.status then
  insert into public.schedule_email_logs(job_id,admin_id,template_slot,student_id,recipient_email,subject,rendered_content,status,provider_message_id)
  values(new.id,new.admin_id,new.template_slot,new.student_id,new.recipient_email,new.subject,'Hi '||new.recipient_name||E'\n\n'||new.content,new.status,new.provider_message_id)
  on conflict(job_id) do update set status=excluded.status,provider_message_id=excluded.provider_message_id;
  insert into public.schedule_email_events(admin_id,request_id,job_id,stage,outcome,details)
  values(new.admin_id,new.request_id,new.id,case when new.status='processing' then 'claimed' else new.status end,new.status,
   jsonb_build_object('attempt',new.attempt_count,'error',new.last_error,'gmailId',new.provider_message_id));
 end if;
 return new;
end $$;
create trigger schedule_email_audit_job after insert or update of status on public.schedule_email_delivery_jobs for each row execute function public._schedule_email_audit_job();

create or replace function public._schedule_email_insert_jobs(p_admin uuid,p_slot integer,p_key_prefix text)
returns integer language plpgsql security definer set search_path='' as $$
declare n integer; snap uuid;
begin
 if not exists(select 1 from public.schedule_email_templates where admin_id=p_admin and slot=p_slot and btrim(content)<>'') then return 0; end if;
 insert into public.schedule_email_snapshots(admin_id,assets) values(p_admin,public._schedule_email_assets(p_admin,p_slot)) returning id into snap;
 insert into public.schedule_email_delivery_jobs(admin_id,template_slot,student_id,recipient_name,recipient_email,content,idempotency_key,snapshot_id,requested_sender_email,request_id)
 select p_admin,p_slot,s.id,s.name,e.email,t.content,p_key_prefix||':'||p_slot||':'||s.id,snap,ss.connected_email,
 case when p_key_prefix like 'once:%' then substring(p_key_prefix from 6)::uuid else null end
 from public.schedule_email_templates t join public.schedule_email_template_recipients r on r.admin_id=t.admin_id and r.slot=t.slot and r.enabled
 join public.flashcard_students s on s.id=r.student_id and s.deleted_at is null join public.schedule_student_reminder_emails e on e.student_id=s.id
 join public.schedule_email_sender_settings ss on ss.admin_id=p_admin
 where t.admin_id=p_admin and t.slot=p_slot on conflict(idempotency_key) do nothing;
 get diagnostics n=row_count;
 if n=0 then delete from public.schedule_email_snapshots where id=snap; end if;
 return n;
end $$;

create function public.schedule_email_v2_event(p_service_secret text,p_admin_token uuid,p_job_id uuid,p_request_id uuid,p_stage text,p_outcome text,p_details jsonb)
returns boolean language plpgsql security definer set search_path='' as $$
declare a uuid;
begin
 if not public._schedule_worker_ok(p_service_secret) then return false; end if;
 if p_job_id is not null then select admin_id into a from public.schedule_email_delivery_jobs where id=p_job_id;
 else a:=public._schedule_admin_id(p_admin_token); end if;
 if a is null then return false; end if;
 insert into public.schedule_email_events(admin_id,request_id,job_id,stage,outcome,details)
 values(a,p_request_id,p_job_id,left(p_stage,60),left(p_outcome,30),coalesce(p_details,'{}'));
 return true;
end $$;

create function public.schedule_email_v2_admin(p_service_secret text,p_admin_token uuid,p_operation text,p_payload jsonb default '{}')
returns jsonb language plpgsql security definer set search_path='' as $$
declare a uuid; t public.schedule_email_templates%rowtype; r jsonb; lim integer; offst integer;
begin
 if not public._schedule_worker_ok(p_service_secret) then raise exception 'Forbidden' using errcode='42501'; end if;
 a:=public._schedule_admin_id(p_admin_token); if a is null then raise exception 'Expired admin session' using errcode='42501'; end if;
 if p_operation='public_sender' then
  if not exists(select 1 from public.schedule_email_sender_settings where admin_id=a and refresh_token_ciphertext is not null and sender_email=connected_email) then raise exception 'Connect Gmail first' using errcode='22023'; end if;
  if exists(select 1 from public.schedule_email_public_sender where admin_id<>a) then raise exception 'A different administrator owns visitor subscriptions; contact the site owner' using errcode='22023'; end if;
  insert into public.schedule_email_public_sender(admin_id) values(a) on conflict(singleton) do nothing;
  return jsonb_build_object('configured',true);
 elsif p_operation='assets' then
  select * into t from public.schedule_email_templates where admin_id=a and slot=(p_payload->>'slot')::integer;
  r:=public._schedule_email_assets(a,t.slot);
  return jsonb_build_object('revision',t.updated_at,'signatureContent',r->'signatureContent','signatureContentType',r->'signatureContentType');
 elsif p_operation='logs' then
  lim:=least(greatest(coalesce((p_payload->>'limit')::integer,100),1),200); offst:=greatest(coalesce((p_payload->>'offset')::integer,0),0);
  return jsonb_build_object('logs',coalesce((select jsonb_agg(x order by x.created_at desc) from (
   select l.id,l.job_id as email_id,l.template_slot,l.recipient_email,l.subject,l.rendered_content,l.status,l.provider_message_id,l.created_at,
    j.kind,j.recipient_name,j.attempt_count,j.next_attempt_at,j.last_error,j.request_id,j.topic,j.updated_at,
    case when j.snapshot_id is not null or j.kind<>'student' then '<'||j.id::text||'@edmundeducation.com>' end as message_id,
    case when j.status='queued' then case when ss.refresh_token_ciphertext is null then 'GMAIL_DISCONNECTED' when ss.connected_email is distinct from j.requested_sender_email and j.requested_sender_email is not null then 'SENDER_CHANGED' when j.next_attempt_at>now() then 'RETRY_BACKOFF' else 'WAITING_FOR_WORKER_OR_400_CAP' end end as waiting_reason,
    coalesce((select jsonb_agg(jsonb_build_object('time',e.created_at,'stage',e.stage,'outcome',e.outcome,'details',e.details) order by e.id) from public.schedule_email_events e where e.job_id=j.id or (j.request_id is not null and e.request_id=j.request_id and e.job_id is null)),'[]') as checkpoints,
    coalesce((select jsonb_agg(jsonb_build_object('filename',f->>'filename','sizeBytes',f->'sizeBytes')) from public.schedule_email_snapshots sn cross join lateral jsonb_array_elements(sn.assets->'attachments') f where sn.id=j.snapshot_id),'[]') as attachments
   from public.schedule_email_logs l left join public.schedule_email_delivery_jobs j on j.id=l.job_id left join public.schedule_email_sender_settings ss on ss.admin_id=l.admin_id
   where l.admin_id=a and (coalesce(p_payload->>'audience','all')='all' or (p_payload->>'audience'='student' and coalesce(j.kind,'student')='student') or (p_payload->>'audience'='visitor' and j.kind like 'visitor_%'))
   and (coalesce(p_payload->>'search','')='' or l.job_id::text=p_payload->>'search' or j.request_id::text=p_payload->>'search' or l.provider_message_id=p_payload->>'search' or l.recipient_email ilike '%'||left(p_payload->>'search',254)||'%')
   order by l.created_at desc,l.id limit lim offset offst) x),'[]'),
   'requests',coalesce((select jsonb_agg(x) from (select request_id,stage,outcome,details,created_at from public.schedule_email_events where admin_id=a and job_id is null order by id desc limit 100) x),'[]'),
   'subscribers',coalesce((select jsonb_agg(x) from (select id,email,name,topics,status,confirmed_at,created_at from public.schedule_email_subscribers where admin_id=a order by created_at desc limit 200) x),'[]'),
   'monitors',coalesce((select jsonb_agg(v) from public.schedule_email_page_versions v),'[]'),
   'scheduler',(select to_jsonb(h)-'singleton' from public.schedule_email_scheduler_health h));
 end if;
 raise exception 'Unknown operation' using errcode='22023';
end $$;

create function public.schedule_email_v2_queue(p_service_secret text,p_admin_token uuid,p_slot integer,p_request_id uuid,p_revision timestamptz)
returns jsonb language plpgsql security definer set search_path='' as $$
declare a uuid; n integer;
begin
 if not public._schedule_worker_ok(p_service_secret) then raise exception 'Forbidden' using errcode='42501'; end if;
 a:=public._schedule_admin_id(p_admin_token); if a is null then raise exception 'Expired admin session' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended(a::text||p_request_id::text,0));
 if not exists(select 1 from public.schedule_email_delivery_jobs where admin_id=a and request_id=p_request_id) then
  perform 1 from public.schedule_email_templates where admin_id=a and slot=p_slot and updated_at=p_revision and cadence='once' for update;
  if not found then raise exception 'DRAFT_CHANGED: reload and preview again' using errcode='22023'; end if;
  if not exists(select 1 from public.schedule_email_sender_settings where admin_id=a and refresh_token_ciphertext is not null and sender_email=connected_email) then raise exception 'GMAIL_DISCONNECTED' using errcode='22023'; end if;
  n:=public._schedule_email_insert_jobs(a,p_slot,'once:'||p_request_id::text);
  if n=0 then raise exception 'NO_RECIPIENTS_OR_EMPTY_CONTENT' using errcode='22023'; end if;
 end if;
 return jsonb_build_object('queued',coalesce(n,0),'emailIds',(select jsonb_agg(id) from public.schedule_email_delivery_jobs where admin_id=a and request_id=p_request_id),'requestId',p_request_id);
end $$;

create or replace function public.schedule_email_service_claim_job(p_service_secret text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_job public.schedule_email_delivery_jobs%rowtype; v_sender public.schedule_email_sender_settings%rowtype; assets jsonb;
begin
 if not public._schedule_worker_ok(p_service_secret) then return null; end if;
 -- Serializes reservation of the shared 400/rolling-24h cap across all Workers.
 perform pg_advisory_xact_lock(80327104);
 update public.schedule_email_delivery_jobs set status=case when delivery_started_at is not null then 'uncertain' when attempt_count>=3 then 'failed' else 'queued' end,
  last_error='WORKER_TIMEOUT',locked_at=null,updated_at=clock_timestamp()
 where status='processing' and locked_at<now()-interval '15 minutes';
 update public.schedule_email_delivery_jobs j set status='cancelled',last_error='UNSUBSCRIBED_OR_CONFIRMATION_EXPIRED',updated_at=clock_timestamp()
 where status='queued' and ((kind='visitor_update' and not exists(select 1 from public.schedule_email_subscribers s where s.id=j.subscriber_id and s.status='active' and j.topic=any(s.topics)))
 or (kind='visitor_confirmation' and not exists(select 1 from public.schedule_email_subscription_requests r where r.id::text=split_part(j.idempotency_key,':',2) and r.used_at is null and r.expires_at>now())));
 select q.* into v_job from public.schedule_email_delivery_jobs q join public.schedule_email_sender_settings ss on ss.admin_id=q.admin_id
 where q.status='queued' and q.next_attempt_at<=now() and ss.refresh_token_ciphertext is not null and ss.sender_email=ss.connected_email
 and (q.requested_sender_email is null or q.requested_sender_email=ss.connected_email)
 and (select count(*) from public.schedule_email_delivery_jobs sent join public.schedule_email_sender_settings ss2 on ss2.admin_id=sent.admin_id where ss2.connected_email=ss.connected_email and sent.status in ('accepted','processing','uncertain') and sent.updated_at>now()-interval '24 hours')<400
 order by q.created_at,q.id for update of q skip locked limit 1;
 if not found then return null; end if;
 update public.schedule_email_delivery_jobs set status='processing',attempt_count=attempt_count+1,locked_at=clock_timestamp(),delivery_started_at=null,updated_at=clock_timestamp() where id=v_job.id returning * into v_job;
 select * into v_sender from public.schedule_email_sender_settings where admin_id=v_job.admin_id;
 if v_job.snapshot_id is not null then select sn.assets into assets from public.schedule_email_snapshots sn where sn.id=v_job.snapshot_id;
 else assets:=coalesce(public._schedule_email_assets(v_job.admin_id,v_job.template_slot),'{}'); end if;
 return coalesce(assets,'{}')||jsonb_build_object('jobId',v_job.id,'requestId',v_job.request_id,'attempt',v_job.attempt_count,'kind',v_job.kind,'subscriberId',v_job.subscriber_id,'actionUrl',v_job.action_url,
 'recipientEmail',v_job.recipient_email,'recipientName',v_job.recipient_name,'subject',v_job.subject,'content',v_job.content,'senderEmail',v_sender.connected_email,
 'refreshTokenCiphertext',v_sender.refresh_token_ciphertext,'refreshTokenIv',v_sender.refresh_token_iv);
end $$;

create function public.schedule_email_v2_begin_send(p_service_secret text,p_job_id uuid,p_attempt integer) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 if not public._schedule_worker_ok(p_service_secret) then return false; end if;
 update public.schedule_email_delivery_jobs j set delivery_started_at=clock_timestamp() where id=p_job_id and status='processing' and attempt_count=p_attempt
 and (kind<>'visitor_update' or exists(select 1 from public.schedule_email_subscribers s where s.id=j.subscriber_id and s.status='active' and j.topic=any(s.topics)));
 return found;
end $$;

create function public.schedule_email_v2_finish(p_service_secret text,p_job_id uuid,p_attempt integer,p_status text,p_provider_id text,p_error text)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 if not public._schedule_worker_ok(p_service_secret) then return false; end if;
 if p_status not in ('accepted','failed','queued','uncertain','cancelled') then raise exception 'Invalid status'; end if;
 update public.schedule_email_delivery_jobs set status=case when p_status='queued' and attempt_count>=3 then 'failed' else p_status end,
 provider_message_id=left(p_provider_id,500),last_error=left(p_error,1000),locked_at=null,
 next_attempt_at=case when p_status='queued' then now()+interval '10 minutes' else next_attempt_at end,updated_at=clock_timestamp()
 where id=p_job_id and status='processing' and attempt_count=p_attempt;
 return found;
end $$;

create function public.schedule_email_v2_scheduler(p_service_secret text,p_state text,p_error text default null)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 if not public._schedule_worker_ok(p_service_secret) then return false; end if;
 insert into public.schedule_email_scheduler_health(singleton,started_at,completed_at,last_error)
 values(true,case when p_state='started' then now() end,case when p_state='complete' then now() end,left(p_error,700))
 on conflict(singleton) do update set started_at=coalesce(excluded.started_at,public.schedule_email_scheduler_health.started_at),
 completed_at=coalesce(excluded.completed_at,public.schedule_email_scheduler_health.completed_at),last_error=excluded.last_error;
 return true;
end $$;

-- Visitor requests never disclose whether the email already exists. Updating preferences also requires proof of mailbox ownership.
create function public.schedule_email_subscription_request(p_service_secret text,p_email text,p_name text,p_topics text[],p_token_hash text,p_confirmation_url text)
returns boolean language plpgsql security definer set search_path='' as $$
declare a uuid; sub uuid; req uuid;
begin
 if not public._schedule_worker_ok(p_service_secret) then return false; end if;
 if p_email is null or char_length(p_email) not between 6 and 254 or p_email ~ '[[:space:][:cntrl:]]' or p_email !~ '^[^@]+@[^@]+\.[^@]+$' or char_length(coalesce(p_name,''))>80
 or cardinality(p_topics) not between 1 and 5 or not p_topics <@ array['resources','daily-newsletter','major-music','news-analysis','english-study'] or p_token_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid subscription'; end if;
 select ss.admin_id into a from public.schedule_email_sender_settings ss join public.schedule_email_public_sender ps on ps.admin_id=ss.admin_id where ss.refresh_token_ciphertext is not null and ss.sender_email=ss.connected_email;
 if a is null then raise exception 'EMAIL_SERVICE_UNAVAILABLE'; end if;
 perform pg_advisory_xact_lock(80327105);
 -- Global confirmation cap plus recipient cooldown protects the public form from email bombing.
 if (select count(*) from public.schedule_email_subscription_requests where created_at>now()-interval '24 hours')>=50 then return true; end if;
 select id into sub from public.schedule_email_subscribers where admin_id=a and email=lower(btrim(p_email));
 if sub is not null and exists(select 1 from public.schedule_email_subscription_requests where subscriber_id=sub and created_at>now()-interval '1 hour') then return true; end if;
 if sub is null then insert into public.schedule_email_subscribers(admin_id,email) values(a,lower(btrim(p_email))) returning id into sub; end if;
 update public.schedule_email_subscription_requests set expires_at=now() where subscriber_id=sub and used_at is null;
 insert into public.schedule_email_subscription_requests(subscriber_id,token_hash,name,topics) values(sub,p_token_hash,btrim(p_name),p_topics) returning id into req;
 insert into public.schedule_email_delivery_jobs(admin_id,recipient_name,recipient_email,subject,content,idempotency_key,subscriber_id,kind,action_url,requested_sender_email)
 select a,coalesce(nullif(btrim(p_name),''),'there'),lower(btrim(p_email)),'確認訂閱 EdmundEducation / Confirm subscription',
 '請按下方連結確認你希望收到所選頁面的更新通知。連結有效期為 24 小時。若不是你提出申請，請忽略此電郵。'||E'\n\nConfirm your subscription using the link below. If you did not request this, ignore this email.',
 'confirm:'||req,sub,'visitor_confirmation',p_confirmation_url,connected_email from public.schedule_email_sender_settings where admin_id=a;
 return true;
end $$;

create function public.schedule_email_subscription_confirm(p_service_secret text,p_token_hash text) returns boolean
language plpgsql security definer set search_path='' as $$
declare r public.schedule_email_subscription_requests%rowtype;
begin
 if not public._schedule_worker_ok(p_service_secret) then return false; end if;
 select * into r from public.schedule_email_subscription_requests where token_hash=p_token_hash for update;
 if not found or r.expires_at<=now() then return false; end if;
 if r.used_at is not null then return true; end if;
 update public.schedule_email_subscribers set name=r.name,topics=r.topics,status='active',confirmed_at=now(),unsubscribed_at=null,updated_at=now() where id=r.subscriber_id;
 update public.schedule_email_subscription_requests set used_at=now() where id=r.id;
 return true;
end $$;

create function public.schedule_email_subscription_unsubscribe(p_service_secret text,p_subscriber_id uuid) returns boolean
language plpgsql security definer set search_path='' as $$
begin
 if not public._schedule_worker_ok(p_service_secret) then return false; end if;
 update public.schedule_email_subscribers set status='unsubscribed',unsubscribed_at=now(),updated_at=now() where id=p_subscriber_id;
 update public.schedule_email_subscription_requests set expires_at=now() where subscriber_id=p_subscriber_id and used_at is null;
 update public.schedule_email_delivery_jobs set status='cancelled',last_error='UNSUBSCRIBED',updated_at=clock_timestamp() where subscriber_id=p_subscriber_id and status='queued';
 return true;
end $$;

-- Database-backed published content hashes (no article bodies leave this function).
create function public.schedule_email_published_hashes(p_service_secret text) returns jsonb
language plpgsql stable security definer set search_path='' as $$
begin
 if not public._schedule_worker_ok(p_service_secret) then return null; end if;
 return jsonb_build_object(
 'daily-newsletter',(select md5(coalesce(string_agg(md5(to_jsonb(p)::text),'' order by p.id),'')) from public.daily_newsletter_posts p where p.published),
 'major-music',(select md5(coalesce(string_agg(md5(p.payload::text||p.sort_index::text),'' order by p.id),'')) from public.music_journal_posts p where p.published));
end $$;

create function public.schedule_email_page_check(p_service_secret text,p_topic text,p_fingerprint text,p_title text,p_error text default null)
returns integer language plpgsql security definer set search_path='' as $$
declare old_hash text; n integer:=0; current_version bigint;
begin
 if not public._schedule_worker_ok(p_service_secret) then return 0; end if;
 if p_topic not in ('resources','daily-newsletter','major-music','news-analysis','english-study') then raise exception 'Invalid topic'; end if;
 perform pg_advisory_xact_lock(hashtextextended('email-page:'||p_topic,0));
 select fingerprint into old_hash from public.schedule_email_page_versions where topic=p_topic;
 if p_error is null and p_fingerprint !~ '^[a-f0-9]{64}$' then raise exception 'Invalid fingerprint'; end if;
 insert into public.schedule_email_page_versions(topic,fingerprint,checked_at,changed_at,last_error)
 values(p_topic,case when p_error is null then p_fingerprint else null end,now(),now(),left(p_error,300))
 on conflict(topic) do update set fingerprint=case when p_error is null then excluded.fingerprint else public.schedule_email_page_versions.fingerprint end,
 checked_at=now(),last_error=excluded.last_error,changed_at=case when p_error is null and old_hash is distinct from p_fingerprint then now() else public.schedule_email_page_versions.changed_at end,
 version=case when p_error is null and old_hash is distinct from p_fingerprint then public.schedule_email_page_versions.version+1 else public.schedule_email_page_versions.version end
 returning version into current_version;
 -- The initial baseline deliberately does not notify existing visitors.
 if p_error is null and old_hash is not null and old_hash<>p_fingerprint then
  insert into public.schedule_email_delivery_jobs(admin_id,recipient_name,recipient_email,subject,content,idempotency_key,subscriber_id,kind,topic,action_url,requested_sender_email)
  select s.admin_id,coalesce(nullif(s.name,''),'there'),s.email,left(p_title,100)||' — 網頁有更新',
   '你訂閱的「'||left(p_title,100)||'」已有更新。請按下方連結瀏覽。'||E'\n\nA page you follow has been updated. Open the link below to read it.',
   'page:'||p_topic||':'||current_version||':'||s.id,s.id,'visitor_update',p_topic,'https://edmundeducation.com/'||p_topic||'.html',ss.connected_email
  from public.schedule_email_subscribers s join public.schedule_email_sender_settings ss on ss.admin_id=s.admin_id
  where s.status='active' and p_topic=any(s.topics) on conflict(idempotency_key) do nothing;
  get diagnostics n=row_count;
 end if;
 -- Bounded retention of unaffiliated request diagnostics; delivery history remains intact.
 delete from public.schedule_email_events where job_id is null and created_at<now()-interval '30 days';
 return n;
end $$;

-- Revoke default PUBLIC execution, explicitly expose only secret-guarded Worker entrypoints.
revoke all on function public._schedule_email_assets(uuid,integer),public._schedule_email_audit_job() from public,anon,authenticated,service_role;
do $$ declare f record; begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and (p.proname like 'schedule_email_v2_%' or p.proname in ('schedule_email_subscription_request','schedule_email_subscription_confirm','schedule_email_subscription_unsubscribe','schedule_email_published_hashes','schedule_email_page_check')) loop
  execute format('revoke all on function %s from public,anon,authenticated,service_role',f.signature);
  execute format('grant execute on function %s to anon',f.signature);
 end loop;
end $$;
commit;
