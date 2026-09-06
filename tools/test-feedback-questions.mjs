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
 const q=(sql,args=[])=>db.query(sql,args);const scalar=async(sql,args=[])=>Object.values((await q(sql,args)).rows[0])[0];
 const student=crypto.randomUUID(),other=crypto.randomUUID(),admin=crypto.randomUUID(),token=crypto.randomUUID(),submission=crypto.randomUUID(),feedback=crypto.randomUUID();
 await q('insert into flashcard_students(id,name) values($1,$2),($3,$4)',[student,'QA Student',other,'Other']);
 await q('insert into schedule_admin_accounts values($1,$2,$3)',[admin,'QA Admin','fake']);
 await q("insert into schedule_admin_sessions(token_hash,admin_id,expires_at) values(extensions.digest($1,'sha256'),$2,now()+interval '1 hour')",[token,admin]);
 await q("insert into writing_submissions values($1,$2,'QA Article',100,now(),null)",[submission,student]);
 await q("insert into writing_submission_feedback values($1,$2,$3,'published')",[feedback,submission,student]);
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
