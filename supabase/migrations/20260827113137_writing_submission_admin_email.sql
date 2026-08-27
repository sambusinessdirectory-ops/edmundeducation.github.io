-- Notification routing is configured privately after deployment, never in browser code.
-- Filename matches the applied production migration version.
begin;

create table public.writing_submission_email_settings (
 singleton boolean primary key default true check(singleton),
 admin_id uuid not null unique references public.schedule_admin_accounts(id),
 sender_email text not null check(sender_email ~ '^[^[:space:]<>@]+@[^[:space:]<>@]+[.][^[:space:]<>@]+$'),
 recipients text[] not null check(cardinality(recipients) between 1 and 10)
  check(array_position(recipients,null) is null)
  check(array_to_string(recipients,',') !~ '[[:space:]<>]')
  check(octet_length(array_to_string(recipients,',')) <= 2540),
 enabled boolean not null default true,
 configured_at timestamptz not null default now()
);
alter table public.writing_submission_email_settings enable row level security;
revoke all on public.writing_submission_email_settings from public,anon,authenticated,service_role;

alter table public.schedule_email_delivery_jobs drop constraint schedule_email_delivery_jobs_kind_check;
alter table public.schedule_email_delivery_jobs add constraint schedule_email_delivery_jobs_kind_check
 check(kind in ('student','visitor_confirmation','visitor_update','writing_submission'));

-- Internal trigger only: same transaction as the successful submission, no Gmail call
-- in the student's request. Existing cron claims these jobs with its shared quota.
create function public._writing_submission_queue_admin_email()
returns trigger language plpgsql security definer set search_path='' as $$
declare settings public.writing_submission_email_settings%rowtype; student_name text; body text;
begin
 select * into settings from public.writing_submission_email_settings where singleton and enabled;
 if not found or new.deleted_at is not null then return new; end if;
 select left(s.name,120) into student_name from public.flashcard_students s where s.id=new.student_id;
 body:='A student has submitted new writing.'||E'\n\nStudent: '||coalesce(student_name,'Student')
  ||E'\nTitle: '||left(new.topic,500)
  ||E'\nSubmitted (Hong Kong): '||to_char(new.submitted_at at time zone 'Asia/Hong_Kong','YYYY-MM-DD HH24:MI:SS')
  ||E'\nWord count: '||new.word_count::text||E'\nSubmission ID: '||new.id::text
  ||E'\n\nSign in with your Writing Submission admin account to review this submission.';
 with queued as (
  insert into public.schedule_email_delivery_jobs(
   admin_id,recipient_name,recipient_email,subject,content,idempotency_key,
   kind,topic,request_id,action_url,requested_sender_email
  )
  select settings.admin_id,'Admin',recipient.email,'EdmundEducation — New writing submission',body,
   'writing-submission:'||new.id::text||':'||recipient.email,
   'writing_submission',new.id::text,new.id,'https://edmundeducation.com/writing-submission.html',settings.sender_email
  from (select distinct lower(btrim(value)) as email from unnest(settings.recipients) value) recipient
  on conflict(idempotency_key) do nothing
  returning id,admin_id,request_id
 )
 insert into public.schedule_email_events(admin_id,request_id,job_id,stage,outcome,details)
 select q.admin_id,q.request_id,q.id,'writing_submitted','queued',
  jsonb_build_object('submissionId',new.id,'source','writing_submissions','trigger','after_insert') from queued q;
 return new;
end $$;
revoke all on function public._writing_submission_queue_admin_email() from public,anon,authenticated,service_role;

create trigger writing_submission_admin_email
 after insert on public.writing_submissions
 for each row execute function public._writing_submission_queue_admin_email();

-- Deliberately no backfill. Draft saves, retries of an existing ID, edits and
-- feedback publication do not insert writing_submissions and do not send mail.
commit;
