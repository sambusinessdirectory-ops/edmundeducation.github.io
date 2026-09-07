create or replace function public.schedule_challenge_history(p_token uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=public.flashcard_session_student_id(p_token);
begin
 if uid is null then raise exception 'Sign in required' using errcode='42501';end if;
 return (select coalesce(jsonb_agg(jsonb_build_object('log_date',log_date,'body',body,'updated_at',updated_at) order by log_date desc),'[]') from public.schedule_challenge_logs where student_id=uid and btrim(body)<>'');
end $$;
revoke all on function public.schedule_challenge_history(uuid) from public,anon;
grant execute on function public.schedule_challenge_history(uuid) to authenticated;

-- Reuse the established owner Gmail settings and idempotent delivery queue.
create or replace function public.classroom_enqueue_notifications() returns integer language plpgsql security definer set search_path='' as $$
declare settings public.writing_submission_email_settings%rowtype; pending_count integer; body_text text; bucket text; queued_count integer:=0; added integer; run record;
begin
 if not pg_try_advisory_xact_lock(7823490717::bigint) then return 0;end if;
 select * into settings from public.writing_submission_email_settings where singleton and enabled;
 if not found then return 0;end if;
 bucket:=floor(extract(epoch from now())/21600)::text;
 select count(*),string_agg('• '||coalesce(st.name,'Student')||' — '||left(s.topic,180),E'\n' order by s.submitted_at) into pending_count,body_text
 from public.writing_submissions s left join public.flashcard_students st on st.id=s.student_id
 where s.deleted_at is null and s.submitted_at<now()-interval '6 hours'
 and not exists(select 1 from public.writing_submission_feedback f where f.submission_id=s.id and f.status='published');
 if pending_count>0 and not exists(select 1 from public.schedule_email_delivery_jobs where topic='review-reminder' and created_at>now()-interval '6 hours') then
  insert into public.schedule_email_delivery_jobs(admin_id,recipient_name,recipient_email,subject,content,idempotency_key,kind,topic,request_id,action_url,requested_sender_email)
  select settings.admin_id,'Admin',lower(btrim(email)),'EdmundEducation — '||pending_count||' writing submissions awaiting feedback',
   'Please review these student submissions. They have been waiting at least six hours without published feedback.'||E'\n\n'||left(body_text,30000)||E'\n\nThis reminder is sent every six hours while submissions remain unreviewed.',
   'writing-review-reminder:'||bucket||':'||lower(btrim(email)),'writing_submission','review-reminder',gen_random_uuid(),'https://edmundeducation.com/writing-submission.html',settings.sender_email
  from (select distinct unnest(settings.recipients) email) recipients on conflict(idempotency_key) do nothing;
  get diagnostics added=row_count;queued_count:=queued_count+added;
 end if;
 -- A receipt is eligible only after cloud verification and staging cleanup.
 for run in select * from system_backup.runs where status='verified' and staging_released_at is not null and verified_at>now()-interval '24 hours' loop
  insert into public.schedule_email_delivery_jobs(admin_id,recipient_name,recipient_email,subject,content,idempotency_key,kind,topic,request_id,action_url,requested_sender_email)
  select settings.admin_id,'Admin',lower(btrim(email)),'EdmundEducation — Nightly backup verified',
   'The private encrypted Cloudflare backup has completed and passed verification.'||E'\n\nScheduled (Hong Kong): '||to_char(run.requested_for at time zone 'Asia/Hong_Kong','YYYY-MM-DD HH24:MI')||E'\nCaptured: '||to_char(run.captured_at at time zone 'Asia/Hong_Kong','YYYY-MM-DD HH24:MI')||E'\nVerified: '||to_char(run.verified_at at time zone 'Asia/Hong_Kong','YYYY-MM-DD HH24:MI')||E'\nTables: '||run.table_count||E'\nRows: '||run.row_count||E'\nPrivate archive: '||run.object_key||E'\n\nIncludes account and learning database data and Supabase recordings. Cloudflare teaching-media files and unsaved device drafts are outside this backup.',
   'nightly-backup-receipt:'||run.id||':'||lower(btrim(email)),'writing_submission','backup-receipt',run.id,'https://edmundeducation.com/',settings.sender_email
  from (select distinct unnest(settings.recipients) email) recipients on conflict(idempotency_key) do nothing;
  get diagnostics added=row_count;queued_count:=queued_count+added;
 end loop;
 return queued_count;
end $$;
revoke all on function public.classroom_enqueue_notifications() from public,anon,authenticated;
grant execute on function public.classroom_enqueue_notifications() to service_role;
notify pgrst,'reload schema';
