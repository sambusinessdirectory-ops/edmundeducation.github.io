import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
process.on('uncaughtException',error=>{console.error(error.message,error.where||'');process.exit(1);});
const require=createRequire(new URL('./email-qa/package.json',import.meta.url));
const {PGlite}=require('@electric-sql/pglite');const db=new PGlite();
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
try {
 await db.exec(read('tools/email-v2-test-baseline.sql'));
 await db.exec(read('supabase-schedule-gmail-delivery-20260822.sql'));
 await db.exec(read('supabase/migrations/20260827110241_email_audit_preview_subscriptions.sql'));
 await db.exec(`create table public.writing_submissions(id uuid primary key,student_id uuid references flashcard_students(id),topic text,word_count integer,submitted_at timestamptz default now(),deleted_at timestamptz);
 create table public.writing_submission_feedback(id uuid primary key,submission_id uuid references writing_submissions(id),student_id uuid,status text);
 create table public.speaking_recording_attempts(id uuid,performance_checklist jsonb,constraint speaking_recordings_performance_checklist_check check(true));
 create function public.writing_submission_admin_me(uuid) returns table(id uuid) language sql as $$ select public._schedule_admin_id($1) where public._schedule_admin_id($1) is not null $$;`);
 const old=fs.readdirSync(new URL('../supabase/migrations/',import.meta.url)).find(n=>n.endsWith('_writing_submission_admin_email.sql'));
 await db.exec(read('supabase/migrations/'+old));
 await db.exec(read('supabase/migrations/20260906141007_feedback_questions_and_speaking_panels.sql'));
 await db.exec(`
 alter table writing_submissions add column answer text, add column topic_resource jsonb;
 alter table writing_submission_feedback add column overall_comment text default 'Full teacher feedback', add column final_comment text,add column improved_version text,add column grammar_points jsonb default '[]',add column sentence_structure_parts jsonb default '[]',add column version integer default 1;
 create table writing_submission_feedback_fragments(id uuid,feedback_id uuid,original_fragment text,edmund_comment text,suggested_writing text);
 create function public.flashcard_session_student_id(p_token uuid) returns uuid language sql as $$ select id from public.flashcard_students where id=p_token $$;
 `);
 await db.exec(`create function public.writing_submission_feedback_admin_save_v5(p_admin_token uuid, p_submission_id uuid, p_overall_comment text, p_overall_formatting jsonb, p_fragments jsonb, p_final_comment text, p_final_formatting jsonb, p_improved_version text, p_improved_formatting jsonb, p_grammar_points jsonb, p_sentence_structure_methods jsonb, p_sentence_structure_links jsonb, p_sentence_structure_parts jsonb, p_rhetorical_parts jsonb, p_phrasal_verb_parts jsonb, p_writing_common_expression_parts jsonb, p_rhetorical_common_expression_parts jsonb, p_synonym_improvement_parts jsonb, p_status text, p_expected_version integer, p_expected_feedback_id uuid) returns table(id uuid,submission_id uuid,version integer) language plpgsql as $$
 begin
 if not exists(select 1 from public.writing_submission_admin_me(p_admin_token)) then raise exception 'Forbidden';end if;
 if p_expected_version is distinct from (select f.version from public.writing_submission_feedback f where f.id=p_expected_feedback_id) then raise exception 'Version conflict';end if;
 update public.writing_submission_feedback f set version=f.version+1,overall_comment=p_overall_comment where f.submission_id=p_submission_id;
 return query select f.id,f.submission_id,f.version from public.writing_submission_feedback f where f.submission_id=p_submission_id;
 end $$;`);
 await db.exec(read('supabase/migrations/20260906145815_classroom_feedback_and_logbooks.sql'));
 const q=(sql,args=[])=>db.query(sql,args);const scalar=async(sql,args=[])=>Object.values((await q(sql,args)).rows[0])[0];
 const student=crypto.randomUUID(),other=crypto.randomUUID(),admin=crypto.randomUUID(),token=crypto.randomUUID(),submission=crypto.randomUUID(),feedback=crypto.randomUUID();
 await q('insert into flashcard_students(id,name) values($1,$2),($3,$4)',[student,'QA Student',other,'Other']);
 await q('insert into schedule_admin_accounts values($1,$2,$3)',[admin,'QA Admin','fake']);
 await q("insert into schedule_admin_sessions(token_hash,admin_id,expires_at) values(extensions.digest($1,'sha256'),$2,now()+interval '1 hour')",[token,admin]);
 await q("insert into writing_submissions(id,student_id,topic,word_count,submitted_at,deleted_at) values($1,$2,'QA Article',100,now(),null)",[submission,student]);
 await q("insert into writing_submission_feedback(id,submission_id,student_id,status) values($1,$2,$3,'published')",[feedback,submission,student]);
 await q("insert into writing_submission_email_settings(admin_id,sender_email,recipients) values($1,'sender@example.invalid',array['teacher@example.invalid','TEACHER@example.invalid'])",[admin]);
 const add=(id,body='Why?',who=student)=>scalar('select writing_feedback_question_add($1,$2,$3,$4,$5,$6,$7,$8)',[submission,who,id,feedback,'overall','Overall','Feedback text',body]);
 const first=crypto.randomUUID();await add(first);await add(first);
 assert.equal(await scalar('select count(*) from writing_feedback_questions'),1,'Retry is idempotent');
 assert.equal(await scalar('select count(*) from schedule_email_delivery_jobs'),1,'Retry does not send duplicate mail');
 await assert.rejects(add(first,'Changed question'),/conflict/);
 await assert.rejects(add(crypto.randomUUID(),'Why?',other),/Forbidden/);
 for(let i=1;i<12;i++)await add(crypto.randomUUID(),'Question '+i);
 assert.equal(await scalar('select count(*) from writing_feedback_questions'),12,'Questions remain allowed beyond email cap');
 assert.equal(await scalar('select count(*) from schedule_email_delivery_jobs'),10,'Exactly 10 unique recipient emails for 12 questions');
 const inbox=await scalar('select writing_feedback_questions_inbox($1)',[token]);assert.equal(inbox.length,12);assert.equal(inbox[0].context_text,'Full teacher feedback');assert.equal(inbox[0].student_name,'QA Student');
 await assert.rejects(scalar('select writing_feedback_questions_inbox($1)',[crypto.randomUUID()]),/Forbidden/);
 const latestTopic='fill:paper3-2025-b2-task-8';await q('update writing_submissions set answer=$1,topic_resource=$2 where id=$3',['My full answer',JSON.stringify({id:latestTopic}),submission]);
 assert.equal((await scalar('select writing_paper3_latest($1,$2)',[student,latestTopic])).answer,'My full answer');assert.equal(await scalar('select writing_paper3_latest($1,$2)',[other,latestTopic]),null);
 assert.equal((await scalar('select schedule_challenge_log($1,$2)',[student,'2026-09-06'])).version,0);
 const log=await scalar('select schedule_challenge_log($1,$2,$3,$4)',[student,'2026-09-06','I corrected a tense mistake.',0]);assert.equal(log.version,1);
 await assert.rejects(scalar('select schedule_challenge_log($1,$2,$3,$4)',[student,'2026-09-06','Stale change',0]),/another device/);
 assert.equal((await scalar('select schedule_challenge_log($1,$2)',[other,'2026-09-06'])).body,'');
 await assert.rejects(scalar('select schedule_challenge_log($1,$2)',[crypto.randomUUID(),'2026-09-06']),/Invalid/);
 const extension={idiomParts:[{originalSentence:{text:'Original'},enhancement:{text:'Break the ice'},benefit:{text:'Start a conversation'}}],proverbParts:[],moduleLinks:{}};
 const extended=await scalar('select writing_feedback_save_extended($1,$2,$3,$4)',[token,submission,JSON.stringify({p_overall_comment:'Updated teacher feedback',p_expected_version:1,p_expected_feedback_id:feedback}),JSON.stringify(extension)]);assert.equal(extended.version,2);assert.equal(extended.extensions.idiomParts[0].enhancement.text,'Break the ice');
 await assert.rejects(scalar('select writing_feedback_save_extended($1,$2,$3,$4)',[token,submission,JSON.stringify({p_overall_comment:'Stale edit',p_expected_version:1,p_expected_feedback_id:feedback}),JSON.stringify({})]),/Version conflict/);
 assert.equal((await scalar('select writing_feedback_extensions_get($1)',[feedback])).idiomParts.length,1);
 assert.match(await scalar('select writing_feedback_context($1,$2)',[feedback,'enhancement:idiom:1']),/Break the ice/);
 assert.equal((await scalar('select writing_feedback_questions_inbox($1)',[token]))[0].context_text,'Full teacher feedback','Original question snapshot survives teacher revisions');
 const reply=crypto.randomUUID();await scalar('select writing_feedback_question_reply($1,$2,$3,$4,$5)',[submission,token,reply,first,'Because...']);
 assert.equal(await scalar('select count(*) from schedule_email_delivery_jobs'),10,'Teacher replies do not notify teacher');
 const messages=await scalar('select writing_feedback_questions_list($1,$2)',[submission,student]);assert.equal(messages.length,13);
 await assert.rejects(scalar('select writing_feedback_questions_list($1,$2)',[submission,other]),/Forbidden/);
 await assert.rejects(scalar('select writing_feedback_question_reply($1,$2,$3,$4,$5)',[submission,crypto.randomUUID(),crypto.randomUUID(),first,'Intruder']),/Forbidden/);
 for(const role of ['anon','authenticated']){
  assert.equal(await scalar("select has_table_privilege($1,'writing_feedback_questions','select')",[role]),false);
  assert.equal(await scalar("select has_function_privilege($1,'writing_feedback_question_add(uuid,uuid,uuid,uuid,text,text,text,text)','execute')",[role]),false);
 }
 console.log('Feedback questions: ownership, replies, request retries, 12 questions / 10 emails and private grants passed. No real emails sent.');
} finally {await db.close();}
