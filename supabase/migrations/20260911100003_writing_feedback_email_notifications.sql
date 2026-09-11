begin;
-- Optional account preference. Only the authenticated Writing Worker may call
-- these service-only RPCs; no email addresses are exposed through public tables.
create table public.writing_feedback_email_preferences (
 student_id uuid primary key references public.flashcard_students(id) on delete cascade,
 email text not null check(length(email)<=254 and email ~ '^[^[:space:]<>@]+@[^[:space:]<>@]+[.][^[:space:]<>@]+$' and email !~ '[[:cntrl:]]'),
 consented_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.writing_feedback_email_preferences enable row level security;
revoke all on public.writing_feedback_email_preferences from public,anon,authenticated,service_role;

alter table public.schedule_email_delivery_jobs drop constraint schedule_email_delivery_jobs_kind_check;
alter table public.schedule_email_delivery_jobs add constraint schedule_email_delivery_jobs_kind_check
 check(kind in ('student','visitor_confirmation','visitor_update','writing_submission','writing_feedback_ready'));
create index writing_feedback_email_jobs_student_idx on public.schedule_email_delivery_jobs(student_id)
 where kind='writing_feedback_ready' and status in ('queued','processing');

create function public.writing_feedback_email_get(p_student_id uuid)
returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('email',coalesce(p.email,''),'enabled',p.student_id is not null)
 from public.flashcard_students s left join public.writing_feedback_email_preferences p on p.student_id=s.id
 where s.id=p_student_id and s.deleted_at is null;
$$;
create function public.writing_feedback_email_set(p_student_id uuid,p_email text,p_enabled boolean)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if p_enabled is null or not exists(select 1 from public.flashcard_students where id=p_student_id and deleted_at is null)
 then raise exception 'Invalid notification preference' using errcode='22023'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('writing-feedback-email:'||p_student_id::text,0));
 if p_enabled then
  if p_email is null or length(btrim(p_email))>254 or btrim(p_email) !~ '^[^[:space:]<>@]+@[^[:space:]<>@]+[.][^[:space:]<>@]+$' or p_email ~ '[[:cntrl:]]'
  then raise exception 'Invalid email address' using errcode='22023'; end if;
  insert into public.writing_feedback_email_preferences(student_id,email) values(p_student_id,lower(btrim(p_email)))
  on conflict(student_id) do update set email=excluded.email,consented_at=clock_timestamp(),updated_at=clock_timestamp();
 else
  delete from public.writing_feedback_email_preferences where student_id=p_student_id;
 end if;
 -- Cancel old destinations and opt-outs before delivery starts. Already sent mail
 -- remains in the administrator's existing delivery audit.
 update public.schedule_email_delivery_jobs j set status='cancelled',locked_at=null,updated_at=clock_timestamp(),last_error='WRITING_NOTIFICATION_PREFERENCE_CHANGED'
 where j.kind='writing_feedback_ready' and j.student_id=p_student_id and j.status in ('queued','processing') and j.delivery_started_at is null
 and not exists(select 1 from public.writing_feedback_email_preferences p where p.student_id=p_student_id and p.email=j.recipient_email);
 return public.writing_feedback_email_get(p_student_id);
end $$;
revoke all on function public.writing_feedback_email_get(uuid),public.writing_feedback_email_set(uuid,text,boolean) from public,anon,authenticated;
grant execute on function public.writing_feedback_email_get(uuid),public.writing_feedback_email_set(uuid,text,boolean) to service_role;

create function public._writing_feedback_queue_ready_email()
returns trigger language plpgsql security definer set search_path='' as $$
declare settings public.writing_submission_email_settings%rowtype; preference public.writing_feedback_email_preferences%rowtype;
begin
 if tg_op='UPDATE' and new.status=old.status and new.version=old.version then return new; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('writing-feedback-email:'||new.student_id::text,0));
 -- A withdrawn or replaced version must never announce unavailable comments.
 update public.schedule_email_delivery_jobs set status='cancelled',locked_at=null,updated_at=clock_timestamp(),last_error='FEEDBACK_REPLACED_OR_WITHDRAWN'
 where kind='writing_feedback_ready' and request_id=new.submission_id and status in ('queued','processing') and delivery_started_at is null;
 if new.status<>'published' then return new; end if;
 select * into preference from public.writing_feedback_email_preferences where student_id=new.student_id;
 if not found then return new; end if;
 select * into settings from public.writing_submission_email_settings where singleton and enabled;
 if not found then return new; end if;
 if not exists(select 1 from public.writing_submissions w join public.flashcard_students s on s.id=w.student_id
  where w.id=new.submission_id and w.student_id=new.student_id and w.deleted_at is null and s.deleted_at is null) then return new; end if;
 with queued as (
  insert into public.schedule_email_delivery_jobs(admin_id,student_id,recipient_name,recipient_email,subject,content,idempotency_key,kind,topic,request_id,action_url,requested_sender_email)
  values(settings.admin_id,new.student_id,'同學',preference.email,'EdmundEducation — 文章評改已完成',
   E'你的文章已完成評改。請登入交文系統，在「我的文章」查看老師的評語及學習建議。\n\n你已自願登記評改通知。如不想再收到通知，可登入交文首頁，在「評改完成電郵通知」取消訂閱及刪除通知電郵設定。',
   'writing-feedback-ready:'||new.id::text||':'||new.version::text,'writing_feedback_ready',new.id::text||':'||new.version::text,new.submission_id,
   'https://edmundeducation.com/writing-submission.html',settings.sender_email)
  on conflict(idempotency_key) do nothing returning id,admin_id,request_id
 ) insert into public.schedule_email_events(admin_id,request_id,job_id,stage,outcome,details)
 select q.admin_id,q.request_id,q.id,'writing_feedback_published','queued',jsonb_build_object('feedbackId',new.id,'version',new.version) from queued q;
 return new;
end $$;
revoke all on function public._writing_feedback_queue_ready_email() from public,anon,authenticated,service_role;
create trigger writing_feedback_ready_email after insert or update on public.writing_submission_feedback
 for each row execute function public._writing_feedback_queue_ready_email();

create function public.writing_feedback_email_status(p_feedback_id uuid,p_version integer)
returns text language sql stable security definer set search_path='' as $$
 select case when j.id is not null then j.status when p.student_id is null then 'not_subscribed' else 'unavailable' end
 from public.writing_submission_feedback f left join public.writing_feedback_email_preferences p on p.student_id=f.student_id
 left join public.schedule_email_delivery_jobs j on j.idempotency_key='writing-feedback-ready:'||f.id::text||':'||p_version::text
 where f.id=p_feedback_id and f.version=p_version;
$$;
revoke all on function public.writing_feedback_email_status(uuid,integer) from public,anon,authenticated;
grant execute on function public.writing_feedback_email_status(uuid,integer) to service_role;

-- Preserve all existing sender authorization and visitor subscription checks.
-- Recheck student consent immediately before the mail provider request as a job
-- may already have been claimed when the student removes their preference.
create or replace function public.schedule_email_v2_begin_send(p_service_secret text,p_job_id uuid,p_attempt integer)
returns boolean language plpgsql security definer set search_path='' as $$
declare target public.schedule_email_delivery_jobs%rowtype;
begin
 if not public._schedule_worker_ok(p_service_secret) then return false; end if;
 select * into target from public.schedule_email_delivery_jobs where id=p_job_id;
 if target.kind='writing_feedback_ready' then
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('writing-feedback-email:'||target.student_id::text,0));
  if not exists(select 1 from public.writing_feedback_email_preferences p
   join public.flashcard_students s on s.id=p.student_id and s.deleted_at is null
   join public.writing_submission_feedback f on f.student_id=p.student_id and f.status='published'
   join public.writing_submissions w on w.id=f.submission_id and w.deleted_at is null
   where p.student_id=target.student_id and p.email=target.recipient_email and f.submission_id=target.request_id and f.id::text||':'||f.version::text=target.topic)
  then
   update public.schedule_email_delivery_jobs set status='cancelled',locked_at=null,updated_at=clock_timestamp(),last_error='WRITING_NOTIFICATION_NO_LONGER_ACTIVE'
   where id=p_job_id and status='processing' and attempt_count=p_attempt and delivery_started_at is null;
   return false;
  end if;
 end if;
 update public.schedule_email_delivery_jobs j set delivery_started_at=clock_timestamp() where id=p_job_id and status='processing' and attempt_count=p_attempt
 and (kind<>'visitor_update' or exists(select 1 from public.schedule_email_subscribers s where s.id=j.subscriber_id and s.status='active' and j.topic=any(s.topics)));
 return found;
end $$;
commit;
