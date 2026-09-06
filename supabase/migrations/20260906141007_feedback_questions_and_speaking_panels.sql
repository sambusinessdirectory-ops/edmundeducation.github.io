begin;
create table public.writing_feedback_questions (
 id uuid primary key,
 submission_id uuid not null references public.writing_submissions(id) on delete cascade,
 feedback_id uuid references public.writing_submission_feedback(id) on delete set null,
 student_id uuid not null references public.flashcard_students(id) on delete cascade,
 parent_id uuid references public.writing_feedback_questions(id) on delete cascade,
 author_role text not null check(author_role in ('student','admin')),
 section_key text not null check(length(section_key) between 1 and 150),
 section_label text not null check(length(section_label) between 1 and 250),
 context_text text not null default '' check(length(context_text)<=3000),
 body text not null check(length(btrim(body)) between 1 and 5000),
 notification_number integer check(notification_number between 1 and 10),
 created_at timestamptz not null default now(),
 check((author_role='student' and parent_id is null) or (author_role='admin' and parent_id is not null and notification_number is null)),
 unique(submission_id,notification_number)
);
create index writing_feedback_questions_submission_idx on public.writing_feedback_questions(submission_id,created_at,id);
create index writing_feedback_questions_student_idx on public.writing_feedback_questions(student_id);
create index writing_feedback_questions_feedback_idx on public.writing_feedback_questions(feedback_id);
create index writing_feedback_questions_parent_idx on public.writing_feedback_questions(parent_id);
alter table public.writing_feedback_questions enable row level security;
revoke all on public.writing_feedback_questions from public,anon,authenticated,service_role;
-- Only the trusted Worker may supply an already authenticated student ID.
create function public.writing_feedback_questions_list(p_submission_id uuid,p_student_id uuid default null,p_admin_token uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if p_admin_token is not null then
  if not exists(select 1 from public.writing_submission_admin_me(p_admin_token)) then raise exception 'Forbidden' using errcode='42501';end if;
 elsif p_student_id is null or not exists(select 1 from public.writing_submissions s where s.id=p_submission_id and s.student_id=p_student_id and s.deleted_at is null) then
  raise exception 'Forbidden' using errcode='42501';
 end if;
 return coalesce((select jsonb_agg(to_jsonb(q) order by q.created_at,q.id) from public.writing_feedback_questions q where q.submission_id=p_submission_id),'[]'::jsonb);
end $$;
create function public.writing_feedback_question_add(
 p_submission_id uuid,p_student_id uuid,p_id uuid,p_feedback_id uuid,p_section_key text,p_section_label text,p_context_text text,p_body text
) returns jsonb language plpgsql security definer set search_path='' as $$
declare submission public.writing_submissions%rowtype; question public.writing_feedback_questions%rowtype;
 settings public.writing_submission_email_settings%rowtype; notification integer; student_name text; email_body text;
begin
 -- Serialize against the article, including requests from different tabs/devices.
 select * into submission from public.writing_submissions where id=p_submission_id and student_id=p_student_id and deleted_at is null for update;
 if not found then raise exception 'Forbidden' using errcode='42501';end if;
 select * into question from public.writing_feedback_questions where id=p_id;
 if found then
  if question.submission_id<>p_submission_id or question.student_id<>p_student_id or question.author_role<>'student' or question.body<>btrim(p_body) or question.section_key<>p_section_key then raise exception 'Request ID conflict' using errcode='23505';end if;
  return to_jsonb(question);
 end if;
 if not exists(select 1 from public.writing_submission_feedback where id=p_feedback_id and submission_id=p_submission_id and student_id=p_student_id and status='published') then raise exception 'Published feedback required' using errcode='42501';end if;
 if p_section_key !~ '^(overall|final|improved|model|transcriptions|grammar:[0-9]+|fragment:[0-9a-f-]+|enhancement:[a-zA-Z]+:[0-9]+)$' then raise exception 'Invalid feedback section';end if;
 select count(*)+1 into notification from public.writing_feedback_questions where submission_id=p_submission_id and author_role='student';
 insert into public.writing_feedback_questions(id,submission_id,feedback_id,student_id,author_role,section_key,section_label,context_text,body,notification_number)
 values(p_id,p_submission_id,p_feedback_id,p_student_id,'student',p_section_key,left(p_section_label,250),left(coalesce(p_context_text,''),3000),btrim(p_body),case when notification<=10 then notification end) returning * into question;
 if notification<=10 then
  select * into settings from public.writing_submission_email_settings where singleton and enabled;
  if found then
   select left(name,120) into student_name from public.flashcard_students where id=p_student_id;
   email_body:='A student has asked a question about your writing feedback.'||E'\n\nStudent: '||coalesce(student_name,'Student')||E'\nArticle: '||left(submission.topic,500)||E'\nFeedback: '||question.section_label||E'\n\nFeedback excerpt:\n'||question.context_text||E'\n\nStudent question:\n'||question.body||E'\n\nNotification '||notification||' of 10 for this article.'||E'\nSubmission ID: '||p_submission_id::text;
   with queued as (
    insert into public.schedule_email_delivery_jobs(admin_id,recipient_name,recipient_email,subject,content,idempotency_key,kind,topic,request_id,action_url,requested_sender_email)
    select settings.admin_id,'Admin',recipient.email,'EdmundEducation — Writing feedback question',email_body,
     'writing-feedback-question:'||p_id::text||':'||recipient.email,'writing_submission',p_submission_id::text,p_id,
     'https://edmundeducation.com/writing-submission.html?submission='||p_submission_id::text,settings.sender_email
    from (select distinct lower(btrim(value)) email from unnest(settings.recipients) value) recipient
    on conflict(idempotency_key) do nothing returning id,admin_id,request_id
   ) insert into public.schedule_email_events(admin_id,request_id,job_id,stage,outcome,details)
    select admin_id,request_id,id,'writing_feedback_question','queued',jsonb_build_object('submissionId',p_submission_id,'questionId',p_id,'notificationNumber',notification) from queued;
  end if;
 end if;
 return to_jsonb(question);
end $$;
create function public.writing_feedback_question_reply(p_submission_id uuid,p_admin_token uuid,p_id uuid,p_parent_id uuid,p_body text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare parent public.writing_feedback_questions%rowtype; reply public.writing_feedback_questions%rowtype;
begin
 if not exists(select 1 from public.writing_submission_admin_me(p_admin_token)) then raise exception 'Forbidden' using errcode='42501';end if;
 select * into parent from public.writing_feedback_questions where id=p_parent_id and submission_id=p_submission_id and author_role='student';
 if not found then raise exception 'Question not found';end if;
 insert into public.writing_feedback_questions(id,submission_id,feedback_id,student_id,parent_id,author_role,section_key,section_label,context_text,body)
 values(p_id,p_submission_id,parent.feedback_id,parent.student_id,p_parent_id,'admin',parent.section_key,parent.section_label,parent.context_text,btrim(p_body)) on conflict(id) do nothing;
 select * into reply from public.writing_feedback_questions where id=p_id;
 if reply.parent_id is distinct from p_parent_id or reply.author_role<>'admin' or reply.body<>btrim(p_body) then raise exception 'Request ID conflict' using errcode='23505';end if;
 return to_jsonb(reply);
end $$;
revoke all on function public.writing_feedback_questions_list(uuid,uuid,uuid) from public,anon,authenticated;
revoke all on function public.writing_feedback_question_add(uuid,uuid,uuid,uuid,text,text,text,text) from public,anon,authenticated;
revoke all on function public.writing_feedback_question_reply(uuid,uuid,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.writing_feedback_questions_list(uuid,uuid,uuid),public.writing_feedback_question_add(uuid,uuid,uuid,uuid,text,text,text,text),public.writing_feedback_question_reply(uuid,uuid,uuid,uuid,text) to service_role;

alter table public.speaking_recording_attempts drop constraint speaking_recordings_performance_checklist_check;
alter table public.speaking_recording_attempts add constraint speaking_recordings_performance_checklist_check check (
 performance_checklist is null or (
 jsonb_typeof(performance_checklist)='object' and performance_checklist ?& array['version','content','language']
 and performance_checklist-'version'-'content'-'language'='{}'::jsonb and performance_checklist->'version'='1'::jsonb
 and jsonb_typeof(performance_checklist->'content')='array' and jsonb_array_length(performance_checklist->'content')<=22
 and jsonb_typeof(performance_checklist->'language')='array' and jsonb_array_length(performance_checklist->'language')<=23
 and pg_column_size(performance_checklist)<=4096));
notify pgrst,'reload schema';
commit;
