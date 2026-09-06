begin;
alter table public.writing_submission_feedback add column extensions jsonb not null default '{}'::jsonb check(jsonb_typeof(extensions)='object' and pg_column_size(extensions)<=262144);
alter table public.writing_feedback_questions drop constraint writing_feedback_questions_context_text_check;
alter table public.writing_feedback_questions add constraint writing_feedback_questions_context_text_check check(length(context_text)<=100000);
create function public.writing_feedback_extensions_get(p_feedback_id uuid) returns jsonb language sql security definer set search_path='' as $$ select extensions from public.writing_submission_feedback where id=p_feedback_id $$;
revoke all on function public.writing_feedback_extensions_get(uuid) from public,anon,authenticated;
grant execute on function public.writing_feedback_extensions_get(uuid) to service_role;
create function public.writing_feedback_save_extended(p_admin_token uuid,p_submission_id uuid,p_payload jsonb,p_extensions jsonb) returns setof jsonb language plpgsql security definer set search_path='' as $$
declare saved jsonb; legacy jsonb := p_payload;
begin
 if jsonb_typeof(p_extensions)<>'object' or pg_column_size(p_extensions)>262144 then raise exception 'Invalid feedback extensions';end if;
 if coalesce(legacy->>'p_overall_comment','')='' and (jsonb_array_length(coalesce(p_extensions->'idiomParts','[]'::jsonb))>0 or jsonb_array_length(coalesce(p_extensions->'proverbParts','[]'::jsonb))>0) then legacy:=jsonb_set(legacy,'{p_overall_comment}','"請參閱以下學習建議。"'::jsonb);end if;
 select to_jsonb(f) into saved from public.writing_submission_feedback_admin_save_v5(
p_admin_token => p_admin_token,
p_submission_id => p_submission_id,
p_overall_comment => (legacy->>'p_overall_comment')::text,
p_overall_formatting => legacy->'p_overall_formatting',
p_fragments => legacy->'p_fragments',
p_final_comment => (legacy->>'p_final_comment')::text,
p_final_formatting => legacy->'p_final_formatting',
p_improved_version => (legacy->>'p_improved_version')::text,
p_improved_formatting => legacy->'p_improved_formatting',
p_grammar_points => legacy->'p_grammar_points',
p_sentence_structure_methods => legacy->'p_sentence_structure_methods',
p_sentence_structure_links => legacy->'p_sentence_structure_links',
p_sentence_structure_parts => legacy->'p_sentence_structure_parts',
p_rhetorical_parts => legacy->'p_rhetorical_parts',
p_phrasal_verb_parts => legacy->'p_phrasal_verb_parts',
p_writing_common_expression_parts => legacy->'p_writing_common_expression_parts',
p_rhetorical_common_expression_parts => legacy->'p_rhetorical_common_expression_parts',
p_synonym_improvement_parts => legacy->'p_synonym_improvement_parts',
p_status => (legacy->>'p_status')::text,
p_expected_version => (legacy->>'p_expected_version')::integer,
p_expected_feedback_id => (legacy->>'p_expected_feedback_id')::uuid) f;
 if saved is not null then update public.writing_submission_feedback set extensions=p_extensions where id=(saved->>'id')::uuid;end if;
 return next saved||jsonb_build_object('extensions',p_extensions);return;end $$;
revoke all on function public.writing_feedback_save_extended(uuid,uuid,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.writing_feedback_save_extended(uuid,uuid,jsonb,jsonb) to service_role;

create or replace function public.writing_feedback_question_add(
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
 values(p_id,p_submission_id,p_feedback_id,p_student_id,'student',p_section_key,left(p_section_label,250),left(coalesce(p_context_text,''),100000),btrim(p_body),case when notification<=10 then notification end) returning * into question;
 if notification<=10 then
  select * into settings from public.writing_submission_email_settings where singleton and enabled;
  if found then
   select left(name,120) into student_name from public.flashcard_students where id=p_student_id;
   email_body:='A student has asked a question about your writing feedback.'||E'\n\nStudent: '||coalesce(student_name,'Student')||E'\nArticle: '||left(submission.topic,500)||E'\nFeedback: '||question.section_label||E'\n\nFeedback excerpt:\n'||left(question.context_text,3000)||E'\n\nStudent question:\n'||question.body||E'\n\nNotification '||notification||' of 10 for this article.'||E'\nSubmission ID: '||p_submission_id::text;
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

create function public.writing_feedback_context(p_feedback_id uuid,p_key text) returns text language plpgsql security definer set search_path='' as $$
declare f jsonb; part jsonb; n integer; field text; result text;
begin
 select to_jsonb(x) into f from public.writing_submission_feedback x where id=p_feedback_id;
 if f is null then return '';end if;
 if p_key='overall' then return f->>'overall_comment'; elsif p_key='final' then return f->>'final_comment'; elsif p_key='improved' then return f->>'improved_version';
 elsif p_key like 'fragment:%' then
  select 'Original writing: '||original_fragment||E'\n\nTeacher comment: '||edmund_comment||E'\n\nSuggested writing: '||suggested_writing into result from public.writing_submission_feedback_fragments where feedback_id=p_feedback_id and id::text=split_part(p_key,':',2); return coalesce(result,'');
 elsif p_key like 'grammar:%' then return coalesce(f->'grammar_points'->(split_part(p_key,':',2)::int-1)->>'text','');
 elsif p_key like 'enhancement:%' then
  n:=split_part(p_key,':',3)::int-1;
  field:=case split_part(p_key,':',2) when 'sentence' then 'sentence_structure_parts' when 'rhetorical' then 'rhetorical_parts' when 'phrasal' then 'phrasal_verb_parts' when 'writingExpression' then 'writing_common_expression_parts' when 'rhetoricalExpression' then 'rhetorical_common_expression_parts' when 'synonym' then 'synonym_improvement_parts' end;
  if field is not null then part:=f->field->n;else part:=f->'extensions'->(split_part(p_key,':',2)||'Parts')->n;end if;
  return concat_ws(E'\n\n','Original: '||(part->'originalSentence'->>'text'),'Enhancement: '||(part->'enhancement'->>'text'),'Benefit: '||(part->'benefit'->>'text'));
 end if;
 return '';
end $$;
revoke all on function public.writing_feedback_context(uuid,text) from public,anon,authenticated;
create function public.writing_feedback_capture_context() returns trigger language plpgsql security definer set search_path='' as $$
declare context text;
begin
 if new.author_role='student' then context:=public.writing_feedback_context(new.feedback_id,new.section_key);if length(context)>0 then new.context_text:=left(context,100000);end if;end if;
 return new;
end $$;
revoke all on function public.writing_feedback_capture_context() from public,anon,authenticated;
create trigger writing_feedback_capture_context before insert on public.writing_feedback_questions for each row execute function public.writing_feedback_capture_context();
update public.writing_feedback_questions q set context_text=left(public.writing_feedback_context(q.feedback_id,q.section_key),100000) where q.author_role='student' and length(public.writing_feedback_context(q.feedback_id,q.section_key))>0;
create function public.writing_feedback_questions_inbox(p_admin_token uuid,p_offset integer default 0) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.writing_submission_admin_me(p_admin_token)) then raise exception 'Forbidden' using errcode='42501';end if;
 return coalesce((select jsonb_agg(row_data order by created_at desc,id desc) from (
 select q.created_at,q.id,to_jsonb(q)||jsonb_build_object('student_name',st.name,'topic',s.topic,'replies',coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at,r.id) from public.writing_feedback_questions r where r.parent_id=q.id),'[]'::jsonb)) row_data
 from public.writing_feedback_questions q join public.writing_submissions s on s.id=q.submission_id join public.flashcard_students st on st.id=q.student_id where q.author_role='student' order by q.created_at desc,q.id desc limit 50 offset greatest(0,p_offset)) page),'[]'::jsonb);
end $$;
revoke all on function public.writing_feedback_questions_inbox(uuid,integer) from public,anon,authenticated;
grant execute on function public.writing_feedback_questions_inbox(uuid,integer) to service_role;

create table public.schedule_challenge_logs(student_id uuid not null references public.flashcard_students(id) on delete cascade,log_date date not null,body text not null default '' check(length(body)<=20000),version integer not null default 1,updated_at timestamptz not null default now(),primary key(student_id,log_date));
alter table public.schedule_challenge_logs enable row level security;
revoke all on public.schedule_challenge_logs from public,anon,authenticated;
create function public.schedule_challenge_log(p_token uuid,p_date date,p_body text default null,p_expected_version integer default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare student uuid:=public.flashcard_session_student_id(p_token); saved public.schedule_challenge_logs%rowtype;
begin
 if student is null then raise exception 'Invalid student session' using errcode='42501';end if;
 if p_date is null then raise exception 'Date required';end if;
 if p_body is not null then
  if length(p_body)>20000 then raise exception 'Log too long';end if;
  -- Serialize writes to a date even before its first row exists.
  perform pg_advisory_xact_lock(hashtextextended(student::text||p_date::text,0));
  select * into saved from public.schedule_challenge_logs where student_id=student and log_date=p_date;
  if coalesce(saved.version,0) is distinct from p_expected_version then raise exception 'Log changed on another device. Reopen it before saving.' using errcode='40001';end if;
  insert into public.schedule_challenge_logs(student_id,log_date,body) values(student,p_date,p_body) on conflict(student_id,log_date) do update set body=excluded.body,version=schedule_challenge_logs.version+1,updated_at=now();
 end if;
 select * into saved from public.schedule_challenge_logs where student_id=student and log_date=p_date;
 if not found then return jsonb_build_object('body','','version',0);end if;
 return to_jsonb(saved);
end $$;
revoke all on function public.schedule_challenge_log(uuid,date,text,integer) from public,anon;
grant execute on function public.schedule_challenge_log(uuid,date,text,integer) to authenticated;
alter table public.speaking_recording_attempts drop constraint speaking_recordings_performance_checklist_check;
alter table public.speaking_recording_attempts add constraint speaking_recordings_performance_checklist_check check (
 performance_checklist is null or (
 jsonb_typeof(performance_checklist)='object' and performance_checklist ?& array['version','content','language']
 and performance_checklist-'version'-'content'-'language'='{}'::jsonb and performance_checklist->'version'='1'::jsonb
 and jsonb_typeof(performance_checklist->'content')='array' and jsonb_array_length(performance_checklist->'content')<=28
 and jsonb_typeof(performance_checklist->'language')='array' and jsonb_array_length(performance_checklist->'language')<=23
 and pg_column_size(performance_checklist)<=4096));
create index writing_paper3_topic_idx on public.writing_submissions(student_id,(topic_resource->>'id'),submitted_at desc) where deleted_at is null;
create function public.writing_paper3_latest(p_student_id uuid,p_topic_id text) returns jsonb language sql security definer set search_path='' as $$
 select to_jsonb(s) from public.writing_submissions s where s.student_id=p_student_id and s.topic_resource->>'id'=p_topic_id and s.deleted_at is null order by s.submitted_at desc,s.id desc limit 1
$$;
revoke all on function public.writing_paper3_latest(uuid,text) from public,anon,authenticated;
grant execute on function public.writing_paper3_latest(uuid,text) to service_role;
notify pgrst,'reload schema';
commit;
