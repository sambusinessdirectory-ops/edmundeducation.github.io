-- Secure Gmail OAuth delivery, dynamic email templates, signatures and PDF attachments.
-- Apply after supabase-schedule-email-designer-and-linked-homework-20260821.sql.
begin;

do $$
begin
  if pg_catalog.to_regclass('public.schedule_email_templates') is null
    or pg_catalog.to_regprocedure('public._schedule_worker_ok(text)') is null
  then
    raise exception 'Apply the Schedule email-designer and base migrations first';
  end if;
end;
$$;

alter table public.schedule_email_templates
  drop constraint if exists schedule_email_templates_slot_check,
  drop constraint if exists schedule_email_templates_cadence_check,
  drop constraint if exists schedule_email_templates_check;
alter table public.schedule_email_templates
  add constraint schedule_email_templates_slot_check check (slot between 1 and 100),
  add constraint schedule_email_templates_cadence_check check (cadence in ('once','15m','30m','45m','1h','24h','daily')),
  add constraint schedule_email_templates_daily_time_check check ((cadence='daily' and daily_time is not null) or (cadence<>'daily' and daily_time is null));
alter table public.schedule_email_templates
  add column if not exists signature_link text,
  add column if not exists signature_image bytea,
  add column if not exists signature_image_content_type text,
  add column if not exists signature_image_filename text,
  add column if not exists next_run_at timestamptz;

alter table public.schedule_email_logs drop constraint if exists schedule_email_logs_template_slot_check;
alter table public.schedule_email_logs add constraint schedule_email_logs_template_slot_check check(template_slot between 1 and 100);

create table if not exists public.schedule_email_sender_settings (
  admin_id uuid primary key references public.schedule_admin_accounts(id) on delete cascade,
  sender_email text not null,
  connected_email text,
  refresh_token_ciphertext text,
  refresh_token_iv text,
  connected_at timestamptz,
  updated_at timestamptz not null default now(),
  check (char_length(sender_email) between 6 and 254),
  check ((connected_email is null and refresh_token_ciphertext is null and refresh_token_iv is null and connected_at is null)
    or (connected_email is not null and refresh_token_ciphertext is not null and refresh_token_iv is not null and connected_at is not null))
);

create table if not exists public.schedule_email_oauth_states (
  state_hash text primary key check (state_hash ~ '^[0-9a-f]{64}$'),
  admin_id uuid not null references public.schedule_admin_accounts(id) on delete cascade,
  sender_email text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists schedule_email_oauth_states_expires_idx on public.schedule_email_oauth_states(expires_at);

create table if not exists public.schedule_email_template_attachments (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  slot smallint not null,
  filename text not null check (char_length(filename) between 1 and 180),
  content_type text not null default 'application/pdf' check (content_type='application/pdf'),
  content bytea not null check (octet_length(content) between 5 and 5242880),
  size_bytes integer not null check (size_bytes between 5 and 5242880),
  created_at timestamptz not null default now(),
  foreign key(admin_id,slot) references public.schedule_email_templates(admin_id,slot) on delete cascade
);
create index if not exists schedule_email_attachments_template_idx on public.schedule_email_template_attachments(admin_id,slot,created_at,id);

create table if not exists public.schedule_email_delivery_jobs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  template_slot smallint not null,
  student_id uuid references public.flashcard_students(id) on delete set null,
  recipient_name text not null,
  recipient_email text not null,
  subject text not null default 'EdmundEducation 學習提醒',
  content text not null,
  idempotency_key text not null unique,
  status text not null default 'queued' check(status in ('queued','processing','accepted','failed','cancelled')),
  attempt_count smallint not null default 0 check(attempt_count between 0 and 10),
  next_attempt_at timestamptz not null default now(),
  locked_at timestamptz,
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key(admin_id,template_slot) references public.schedule_email_templates(admin_id,slot) on delete cascade
);
create index if not exists schedule_email_jobs_due_idx on public.schedule_email_delivery_jobs(status,next_attempt_at,created_at);
alter table public.schedule_email_logs add column if not exists job_id uuid unique references public.schedule_email_delivery_jobs(id) on delete set null;

alter table public.schedule_email_sender_settings enable row level security;
alter table public.schedule_email_oauth_states enable row level security;
alter table public.schedule_email_template_attachments enable row level security;
alter table public.schedule_email_delivery_jobs enable row level security;
revoke all on table public.schedule_email_sender_settings,public.schedule_email_oauth_states,public.schedule_email_template_attachments,public.schedule_email_delivery_jobs from public,anon,authenticated,service_role;

insert into public.schedule_email_templates(admin_id,slot,content,enabled,cadence,daily_time)
select a.id,n,'',false,'24h',null
from public.schedule_admin_accounts a cross join generate_series(1,4) n
on conflict(admin_id,slot) do nothing;

create or replace function public._schedule_email_next_run(p_cadence text,p_daily_time time,p_from timestamptz default now())
returns timestamptz language plpgsql stable security definer set search_path='' as $$
declare v_candidate timestamptz;
begin
  if p_cadence='15m' then return p_from+interval '15 minutes'; end if;
  if p_cadence='30m' then return p_from+interval '30 minutes'; end if;
  if p_cadence='45m' then return p_from+interval '45 minutes'; end if;
  if p_cadence='1h' then return p_from+interval '1 hour'; end if;
  if p_cadence='24h' then return p_from+interval '24 hours'; end if;
  if p_cadence='daily' then
    v_candidate:=((pg_catalog.timezone('Asia/Hong_Kong',p_from)::date+p_daily_time) at time zone 'Asia/Hong_Kong');
    if v_candidate<=p_from then v_candidate:=v_candidate+interval '1 day'; end if;
    return v_candidate;
  end if;
  return null;
end $$;
revoke all on function public._schedule_email_next_run(text,time,timestamptz) from public,anon,authenticated,service_role;

create or replace function public.schedule_admin_email_designer_snapshot(p_admin_token uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_admin uuid; v_setting public.schedule_email_sender_settings%rowtype;
begin
  if (select auth.uid()) is null then raise exception 'Authentication required' using errcode='42501'; end if;
  v_admin:=public._schedule_admin_id(p_admin_token);
  if v_admin is null then raise exception 'Invalid or expired admin session' using errcode='42501'; end if;
  select * into v_setting from public.schedule_email_sender_settings s where s.admin_id=v_admin;
  return jsonb_build_object(
    'transportConnected',v_setting.refresh_token_ciphertext is not null and lower(v_setting.sender_email)=lower(v_setting.connected_email),
    'sender',jsonb_build_object('email',coalesce(v_setting.sender_email,'edmundeducationedu@gmail.com'),'connectedEmail',v_setting.connected_email,'connectedAt',v_setting.connected_at),
    'gmailDailyLimit',400,
    'students',coalesce((select jsonb_agg(jsonb_build_object('studentId',s.id,'studentName',s.name,'email',e.email) order by lower(s.name)) from public.flashcard_students s left join public.schedule_student_reminder_emails e on e.student_id=s.id where s.deleted_at is null),'[]'::jsonb),
    'templates',coalesce((select jsonb_agg(jsonb_build_object(
      'slot',t.slot,'configured',true,'content',t.content,'enabled',t.enabled,'cadence',t.cadence,'dailyTime',t.daily_time,
      'signatureLink',t.signature_link,'signatureFilename',t.signature_image_filename,'hasSignatureImage',t.signature_image is not null,
      'attachments',coalesce((select jsonb_agg(jsonb_build_object('id',a.id,'filename',a.filename,'sizeBytes',a.size_bytes) order by a.created_at,a.id) from public.schedule_email_template_attachments a where a.admin_id=v_admin and a.slot=t.slot),'[]'::jsonb),
      'recipientIds',coalesce((select jsonb_agg(r.student_id) from public.schedule_email_template_recipients r where r.admin_id=v_admin and r.slot=t.slot and r.enabled),'[]'::jsonb)
    ) order by t.slot) from public.schedule_email_templates t where t.admin_id=v_admin),'[]'::jsonb)
  );
end $$;

create or replace function public.schedule_email_service_save_sender(p_service_secret text,p_admin_token uuid,p_sender_email text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_admin uuid; v_email text:=lower(btrim(coalesce(p_sender_email,''))); v_connected text; v_connected_at timestamptz;
begin
  if not public._schedule_worker_ok(p_service_secret) then return null; end if;
  v_admin:=public._schedule_admin_id(p_admin_token); if v_admin is null then return null; end if;
  if char_length(v_email) not between 6 and 254 or v_email !~ '^[a-z0-9.!#$%&''*+/=?^_`{|}~-]+@(gmail|googlemail)\.com$' then raise exception 'A valid personal Gmail address is required' using errcode='22023'; end if;
  insert into public.schedule_email_sender_settings(admin_id,sender_email) values(v_admin,v_email)
  on conflict(admin_id) do update set sender_email=excluded.sender_email,
    connected_email=case when lower(public.schedule_email_sender_settings.sender_email)=v_email then public.schedule_email_sender_settings.connected_email else null end,
    refresh_token_ciphertext=case when lower(public.schedule_email_sender_settings.sender_email)=v_email then public.schedule_email_sender_settings.refresh_token_ciphertext else null end,
    refresh_token_iv=case when lower(public.schedule_email_sender_settings.sender_email)=v_email then public.schedule_email_sender_settings.refresh_token_iv else null end,
    connected_at=case when lower(public.schedule_email_sender_settings.sender_email)=v_email then public.schedule_email_sender_settings.connected_at else null end,
    updated_at=clock_timestamp()
  returning connected_email,connected_at into v_connected,v_connected_at;
  return jsonb_build_object('email',v_email,'connected',v_connected is not null and lower(v_connected)=v_email,'connectedEmail',v_connected,'connectedAt',v_connected_at);
end $$;

create or replace function public.schedule_email_service_disconnect(p_service_secret text,p_admin_token uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_admin uuid;
begin
  if not public._schedule_worker_ok(p_service_secret) then return false; end if;
  v_admin:=public._schedule_admin_id(p_admin_token); if v_admin is null then return false; end if;
  update public.schedule_email_sender_settings set connected_email=null,refresh_token_ciphertext=null,refresh_token_iv=null,connected_at=null,updated_at=clock_timestamp() where admin_id=v_admin;
  return found;
end $$;

create or replace function public.schedule_email_service_oauth_begin(p_service_secret text,p_admin_token uuid,p_sender_email text,p_state_hash text)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_admin uuid; v_email text:=lower(btrim(coalesce(p_sender_email,'')));
begin
  if not public._schedule_worker_ok(p_service_secret) then return false; end if;
  v_admin:=public._schedule_admin_id(p_admin_token); if v_admin is null then return false; end if;
  if p_state_hash !~ '^[0-9a-f]{64}$' or not exists(select 1 from public.schedule_email_sender_settings s where s.admin_id=v_admin and lower(s.sender_email)=v_email) then return false; end if;
  delete from public.schedule_email_oauth_states where expires_at<=now() or admin_id=v_admin;
  insert into public.schedule_email_oauth_states(state_hash,admin_id,sender_email,expires_at) values(p_state_hash,v_admin,v_email,now()+interval '10 minutes');
  return true;
end $$;

create or replace function public.schedule_email_service_oauth_consume(p_service_secret text,p_state_hash text)
returns table(admin_id uuid,sender_email text) language plpgsql security definer set search_path='' as $$
begin
  if not public._schedule_worker_ok(p_service_secret) then return; end if;
  return query delete from public.schedule_email_oauth_states s where s.state_hash=p_state_hash and s.expires_at>now() returning s.admin_id,s.sender_email;
end $$;

create or replace function public.schedule_email_service_oauth_complete(p_service_secret text,p_admin_id uuid,p_expected_email text,p_connected_email text,p_ciphertext text,p_iv text)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  if not public._schedule_worker_ok(p_service_secret)
    or lower(p_expected_email)<>lower(p_connected_email)
    or char_length(coalesce(p_ciphertext,'')) not between 20 and 4096
    or char_length(coalesce(p_iv,'')) not between 12 and 128
  then return false; end if;
  update public.schedule_email_sender_settings set connected_email=lower(p_connected_email),refresh_token_ciphertext=p_ciphertext,refresh_token_iv=p_iv,connected_at=clock_timestamp(),updated_at=clock_timestamp()
  where admin_id=p_admin_id and lower(sender_email)=lower(p_expected_email);
  return found;
end $$;

create or replace function public.schedule_email_service_add_template(p_service_secret text,p_admin_token uuid)
returns integer language plpgsql security definer set search_path='' as $$
declare v_admin uuid; v_slot integer;
begin
  if not public._schedule_worker_ok(p_service_secret) then return null; end if;
  v_admin:=public._schedule_admin_id(p_admin_token); if v_admin is null then return null; end if;
  select n into v_slot from generate_series(1,100) n where not exists(select 1 from public.schedule_email_templates t where t.admin_id=v_admin and t.slot=n) order by n limit 1;
  if v_slot is null then raise exception 'The 100-message limit has been reached' using errcode='22023'; end if;
  insert into public.schedule_email_templates(admin_id,slot,content,enabled,cadence,daily_time) values(v_admin,v_slot,'',false,'once',null);
  return v_slot;
end $$;

create or replace function public.schedule_email_service_delete_template(p_service_secret text,p_admin_token uuid,p_slot integer)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_admin uuid;
begin
  if not public._schedule_worker_ok(p_service_secret) then return false; end if;
  v_admin:=public._schedule_admin_id(p_admin_token); if v_admin is null then return false; end if;
  update public.schedule_email_logs l set status='cancelled'
  where l.admin_id=v_admin and l.template_slot=p_slot and l.status='queued'
    and exists(select 1 from public.schedule_email_delivery_jobs j where j.id=l.job_id and j.status in ('queued','processing'));
  delete from public.schedule_email_templates where admin_id=v_admin and slot=p_slot;
  return found;
end $$;

create or replace function public.schedule_email_service_save_template(
  p_service_secret text,p_admin_token uuid,p_slot integer,p_content text,p_enabled boolean,p_cadence text,p_daily_time time,p_recipient_ids jsonb,
  p_signature_link text,p_signature_action text,p_signature_content text,p_signature_content_type text,p_signature_filename text,
  p_remove_attachment_ids jsonb,p_attachments jsonb
)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_admin uuid; v_ids uuid[]; v_remove uuid[]; v_current integer; v_new integer; v_item jsonb; v_bytes bytea;
begin
  if not public._schedule_worker_ok(p_service_secret) then return null; end if;
  v_admin:=public._schedule_admin_id(p_admin_token); if v_admin is null then return null; end if;
  if p_slot not between 1 and 100 or p_content is null or char_length(p_content)>8000 or octet_length(p_content)>24000 or regexp_replace(p_content,E'[\n\r\t]','','g') ~ '[[:cntrl:]]'
    or p_enabled is null or p_cadence not in ('once','15m','30m','45m','1h','24h','daily') or (p_cadence='daily')<>(p_daily_time is not null)
    or p_recipient_ids is null or jsonb_typeof(p_recipient_ids)<>'array' or jsonb_array_length(p_recipient_ids)>1000
    or p_signature_action not in ('keep','replace','remove') or (p_signature_link is not null and (char_length(p_signature_link)>2048 or p_signature_link !~ '^https://[^[:space:]]+$'))
    or p_remove_attachment_ids is null or jsonb_typeof(p_remove_attachment_ids)<>'array' or jsonb_array_length(p_remove_attachment_ids)>3
    or p_attachments is null or jsonb_typeof(p_attachments)<>'array' or jsonb_array_length(p_attachments)>3
  then raise exception 'Invalid email-template payload' using errcode='22023'; end if;
  if p_signature_action='replace' then
    if p_signature_content is null or p_signature_content_type not in ('image/jpeg','image/png','image/webp','image/gif') or char_length(coalesce(p_signature_filename,'')) not between 1 and 180 or char_length(p_signature_content)>2796204 or p_signature_content !~ '^[A-Za-z0-9+/]*={0,2}$' then raise exception 'Invalid signature image' using errcode='22023'; end if;
    v_bytes:=decode(p_signature_content,'base64'); if octet_length(v_bytes) not between 1 and 2097152 then raise exception 'Invalid signature image' using errcode='22023'; end if;
  elsif p_signature_content is not null then raise exception 'Unexpected signature image' using errcode='22023'; end if;
  select coalesce(array_agg(distinct value::uuid),'{}'::uuid[]) into v_ids from jsonb_array_elements_text(p_recipient_ids);
  if exists(select 1 from unnest(v_ids) id where not exists(select 1 from public.flashcard_students s join public.schedule_student_reminder_emails e on e.student_id=s.id where s.id=id and s.deleted_at is null)) then raise exception 'Recipient unavailable' using errcode='22023'; end if;
  select coalesce(array_agg(distinct value::uuid),'{}'::uuid[]) into v_remove from jsonb_array_elements_text(p_remove_attachment_ids);
  if exists(select 1 from unnest(v_remove) id where not exists(select 1 from public.schedule_email_template_attachments a where a.id=id and a.admin_id=v_admin and a.slot=p_slot)) then raise exception 'Attachment unavailable' using errcode='22023'; end if;
  v_new:=jsonb_array_length(p_attachments);
  select count(*) into v_current from public.schedule_email_template_attachments a where a.admin_id=v_admin and a.slot=p_slot and not(a.id=any(v_remove));
  if v_current+v_new>3 then raise exception 'A message can contain at most three PDFs' using errcode='22023'; end if;
  insert into public.schedule_email_templates(admin_id,slot,content,enabled,cadence,daily_time,signature_link,next_run_at,updated_at)
  values(v_admin,p_slot,p_content,p_enabled,p_cadence,p_daily_time,nullif(p_signature_link,''),case when p_enabled then public._schedule_email_next_run(p_cadence,p_daily_time,now()) else null end,clock_timestamp())
  on conflict(admin_id,slot) do update set content=excluded.content,enabled=excluded.enabled,cadence=excluded.cadence,daily_time=excluded.daily_time,signature_link=excluded.signature_link,
    next_run_at=case when excluded.enabled and (public.schedule_email_templates.enabled is false or public.schedule_email_templates.cadence<>excluded.cadence or public.schedule_email_templates.daily_time is distinct from excluded.daily_time) then public._schedule_email_next_run(excluded.cadence,excluded.daily_time,now()) when excluded.enabled then public.schedule_email_templates.next_run_at else null end,updated_at=excluded.updated_at;
  if p_signature_action='replace' then update public.schedule_email_templates set signature_image=v_bytes,signature_image_content_type=p_signature_content_type,signature_image_filename=p_signature_filename where admin_id=v_admin and slot=p_slot;
  elsif p_signature_action='remove' then update public.schedule_email_templates set signature_image=null,signature_image_content_type=null,signature_image_filename=null where admin_id=v_admin and slot=p_slot; end if;
  delete from public.schedule_email_template_recipients where admin_id=v_admin and slot=p_slot;
  insert into public.schedule_email_template_recipients(admin_id,slot,student_id,enabled) select v_admin,p_slot,id,true from unnest(v_ids) id;
  delete from public.schedule_email_template_attachments where admin_id=v_admin and slot=p_slot and id=any(v_remove);
  for v_item in select value from jsonb_array_elements(p_attachments) loop
    if v_item->>'contentType'<>'application/pdf' or char_length(coalesce(v_item->>'filename','')) not between 1 and 180 or coalesce((v_item->>'sizeBytes')::integer,0) not between 5 and 5242880 or char_length(coalesce(v_item->>'content',''))>6990512 or (v_item->>'content') !~ '^[A-Za-z0-9+/]*={0,2}$' then raise exception 'Invalid PDF attachment' using errcode='22023'; end if;
    v_bytes:=decode(v_item->>'content','base64'); if octet_length(v_bytes)<>(v_item->>'sizeBytes')::integer or substring(v_bytes from 1 for 5)<>decode('255044462d','hex') then raise exception 'Invalid PDF attachment' using errcode='22023'; end if;
    insert into public.schedule_email_template_attachments(admin_id,slot,filename,content_type,content,size_bytes) values(v_admin,p_slot,v_item->>'filename','application/pdf',v_bytes,octet_length(v_bytes));
  end loop;
  return jsonb_build_object('slot',p_slot,'saved',true);
end $$;

create or replace function public._schedule_email_insert_jobs(p_admin uuid,p_slot integer,p_key_prefix text)
returns integer language plpgsql security definer set search_path='' as $$
declare v_count integer;
begin
  with inserted as (
    insert into public.schedule_email_delivery_jobs(admin_id,template_slot,student_id,recipient_name,recipient_email,content,idempotency_key)
    select p_admin,p_slot,s.id,s.name,e.email,t.content,p_key_prefix||':'||s.id::text
    from public.schedule_email_templates t join public.schedule_email_template_recipients r on r.admin_id=t.admin_id and r.slot=t.slot and r.enabled
    join public.flashcard_students s on s.id=r.student_id and s.deleted_at is null join public.schedule_student_reminder_emails e on e.student_id=s.id
    where t.admin_id=p_admin and t.slot=p_slot and btrim(t.content)<>''
    on conflict(idempotency_key) do nothing returning *
  ), logged as (
    insert into public.schedule_email_logs(job_id,admin_id,template_slot,student_id,recipient_email,subject,rendered_content,status)
    select id,admin_id,template_slot,student_id,recipient_email,subject,'Hi '||recipient_name||E'\n\n'||content,'queued' from inserted returning 1
  ) select count(*) into v_count from logged;
  return v_count;
end $$;
revoke all on function public._schedule_email_insert_jobs(uuid,integer,text) from public,anon,authenticated,service_role;

create or replace function public.schedule_email_service_queue_once(p_service_secret text,p_admin_token uuid,p_slot integer,p_request_id uuid)
returns integer language plpgsql security definer set search_path='' as $$
declare v_admin uuid;
begin
  if not public._schedule_worker_ok(p_service_secret) then return null; end if;
  v_admin:=public._schedule_admin_id(p_admin_token); if v_admin is null then return null; end if;
  if not exists(select 1 from public.schedule_email_templates t where t.admin_id=v_admin and t.slot=p_slot and t.cadence='once') then raise exception 'Save this message as one-time first' using errcode='22023'; end if;
  return public._schedule_email_insert_jobs(v_admin,p_slot,'once:'||p_request_id::text);
end $$;

create or replace function public.schedule_email_service_enqueue_due(p_service_secret text)
returns integer language plpgsql security definer set search_path='' as $$
declare v_row record; v_total integer:=0; v_scheduled timestamptz;
begin
  if not public._schedule_worker_ok(p_service_secret) then return 0; end if;
  for v_row in select t.* from public.schedule_email_templates t join public.schedule_email_sender_settings s on s.admin_id=t.admin_id and s.refresh_token_ciphertext is not null and lower(s.sender_email)=lower(s.connected_email) where t.enabled and t.cadence<>'once' and t.next_run_at<=now() order by t.next_run_at for update of t skip locked limit 100 loop
    v_scheduled:=v_row.next_run_at;
    v_total:=v_total+public._schedule_email_insert_jobs(v_row.admin_id,v_row.slot,'scheduled:'||extract(epoch from v_scheduled)::bigint::text);
    update public.schedule_email_templates set next_run_at=public._schedule_email_next_run(v_row.cadence,v_row.daily_time,greatest(now(),v_scheduled)),updated_at=clock_timestamp() where admin_id=v_row.admin_id and slot=v_row.slot;
  end loop;
  return v_total;
end $$;

create or replace function public.schedule_email_service_claim_job(p_service_secret text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_job public.schedule_email_delivery_jobs%rowtype; v_result jsonb;
begin
  if not public._schedule_worker_ok(p_service_secret) then return null; end if;
  update public.schedule_email_logs l set status='failed'
  where l.status='queued' and exists(select 1 from public.schedule_email_delivery_jobs j where j.id=l.job_id and j.status='processing' and j.locked_at<now()-interval '15 minutes' and j.attempt_count>=3);
  update public.schedule_email_delivery_jobs set status='failed',locked_at=null,last_error='DELIVERY_WORKER_TIMEOUT',updated_at=clock_timestamp()
  where status='processing' and locked_at<now()-interval '15 minutes' and attempt_count>=3;
  update public.schedule_email_delivery_jobs set status='queued',locked_at=null,next_attempt_at=now(),updated_at=clock_timestamp() where status='processing' and locked_at<now()-interval '15 minutes' and attempt_count<3;
  select j.* into v_job from public.schedule_email_delivery_jobs j join public.schedule_email_sender_settings s on s.admin_id=j.admin_id and s.refresh_token_ciphertext is not null and lower(s.sender_email)=lower(s.connected_email)
  where j.status='queued' and j.next_attempt_at<=now() and (select count(*) from public.schedule_email_delivery_jobs sent where sent.admin_id=j.admin_id and sent.status='accepted' and sent.updated_at>now()-interval '24 hours')<400
  order by j.created_at,j.id for update of j skip locked limit 1;
  if not found then return null; end if;
  update public.schedule_email_delivery_jobs set status='processing',attempt_count=attempt_count+1,locked_at=clock_timestamp(),updated_at=clock_timestamp() where id=v_job.id;
  select jsonb_build_object('jobId',v_job.id,'recipientEmail',v_job.recipient_email,'recipientName',v_job.recipient_name,'subject',v_job.subject,'content',v_job.content,
    'senderEmail',s.connected_email,'refreshTokenCiphertext',s.refresh_token_ciphertext,'refreshTokenIv',s.refresh_token_iv,
    'signatureLink',t.signature_link,'signatureContent',case when t.signature_image is null then null else encode(t.signature_image,'base64') end,'signatureContentType',t.signature_image_content_type,'signatureFilename',t.signature_image_filename,
    'attachments',coalesce((select jsonb_agg(jsonb_build_object('filename',a.filename,'contentType',a.content_type,'content',encode(a.content,'base64')) order by a.created_at,a.id) from public.schedule_email_template_attachments a where a.admin_id=v_job.admin_id and a.slot=v_job.template_slot),'[]'::jsonb))
  into v_result from public.schedule_email_sender_settings s join public.schedule_email_templates t on t.admin_id=s.admin_id and t.slot=v_job.template_slot where s.admin_id=v_job.admin_id;
  return v_result;
end $$;

create or replace function public.schedule_email_service_finish_job(p_service_secret text,p_job_id uuid,p_success boolean,p_provider_message_id text,p_error text,p_retry boolean)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_status text;
begin
  if not public._schedule_worker_ok(p_service_secret) then return false; end if;
  if p_success then v_status:='accepted'; elsif p_retry and exists(select 1 from public.schedule_email_delivery_jobs j where j.id=p_job_id and j.attempt_count<3) then v_status:='queued'; else v_status:='failed'; end if;
  update public.schedule_email_delivery_jobs set status=v_status,provider_message_id=case when p_success then left(p_provider_message_id,500) else null end,last_error=case when p_success then null else left(p_error,1000) end,locked_at=null,next_attempt_at=case when v_status='queued' then now()+interval '10 minutes' else next_attempt_at end,updated_at=clock_timestamp() where id=p_job_id and status='processing';
  if not found then return false; end if;
  update public.schedule_email_logs set status=case when v_status='queued' then 'queued' else v_status end,provider_message_id=case when p_success then left(p_provider_message_id,500) else null end where job_id=p_job_id;
  return true;
end $$;

revoke all on function public.schedule_admin_email_designer_snapshot(uuid),public.schedule_email_service_save_sender(text,uuid,text),public.schedule_email_service_disconnect(text,uuid),public.schedule_email_service_oauth_begin(text,uuid,text,text),public.schedule_email_service_oauth_consume(text,text),public.schedule_email_service_oauth_complete(text,uuid,text,text,text,text),public.schedule_email_service_add_template(text,uuid),public.schedule_email_service_delete_template(text,uuid,integer),public.schedule_email_service_save_template(text,uuid,integer,text,boolean,text,time,jsonb,text,text,text,text,text,jsonb,jsonb),public.schedule_email_service_queue_once(text,uuid,integer,uuid),public.schedule_email_service_enqueue_due(text),public.schedule_email_service_claim_job(text),public.schedule_email_service_finish_job(text,uuid,boolean,text,text,boolean) from public,anon,authenticated,service_role;
grant execute on function public.schedule_admin_email_designer_snapshot(uuid) to authenticated;
grant execute on function public.schedule_email_service_save_sender(text,uuid,text),public.schedule_email_service_disconnect(text,uuid),public.schedule_email_service_oauth_begin(text,uuid,text,text),public.schedule_email_service_oauth_consume(text,text),public.schedule_email_service_oauth_complete(text,uuid,text,text,text,text),public.schedule_email_service_add_template(text,uuid),public.schedule_email_service_delete_template(text,uuid,integer),public.schedule_email_service_save_template(text,uuid,integer,text,boolean,text,time,jsonb,text,text,text,text,text,jsonb,jsonb),public.schedule_email_service_queue_once(text,uuid,integer,uuid),public.schedule_email_service_enqueue_due(text),public.schedule_email_service_claim_job(text),public.schedule_email_service_finish_job(text,uuid,boolean,text,text,boolean) to anon;
commit;
