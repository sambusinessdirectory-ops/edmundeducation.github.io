// Static/MIME checks always run. Set EMAIL_QA_MODULES for isolated PostgreSQL checks.
// No production connection or email request is made by this test.
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {buildMime} from '../workers/schedule-system/src/index.js';
process.on('uncaughtException',error=>{console.error(error.message,error.where||'');process.exit(1);});
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const migrations=await readdir(new URL('../supabase/migrations/',import.meta.url));
const filename=migrations.find(p=>p.endsWith('_writing_submission_admin_email.sql'));
assert.ok(filename);
const migration=await read(`../supabase/migrations/${filename}`);
assert.match(migration,/after insert on public\.writing_submissions/i);
assert.match(migration,/on conflict\s*\(idempotency_key\) do nothing/i);
assert.doesNotMatch(migration,/new\.answer/i);
assert.match(migration,/enable row level security/i);
assert.match(await read('../schedule-email-log-v2.js'),/寫作提交通知（管理員）/);
const sample={jobId:crypto.randomUUID(),kind:'writing_submission',senderEmail:'sender@example.invalid',recipientEmail:'admin@example.invalid',recipientName:'Admin',subject:'New writing submission',content:'Student: <img src=x>\nTitle: A & B',actionUrl:'https://edmundeducation.com/writing-submission.html'};
const mime=buildMime(sample),html=Buffer.from(mime.split('Content-Transfer-Encoding: base64\r\n\r\n')[1].split('\r\n--')[0].replace(/\r\n/g,''),'base64').toString('utf8');
assert.match(html,/&lt;img src=x&gt;/);assert.match(html,/A &amp; B/);
assert.match(html,/https:\/\/edmundeducation.com\/writing-submission.html/);
assert.doesNotMatch(html,/Unsubscribe/);
assert.match(mime,/X-Edmund-Email-ID:/);
if(process.env.EMAIL_QA_MODULES){
 const require=createRequire(`${process.env.EMAIL_QA_MODULES}/package.json`);
 const {PGlite}=require('@electric-sql/pglite');const db=new PGlite();
 try {
  await db.exec(await read('./email-v2-test-baseline.sql'));
  await db.exec(await read('../supabase-schedule-gmail-delivery-20260822.sql'));
  await db.exec(await read('../supabase/migrations/20260827110241_email_audit_preview_subscriptions.sql'));
  await db.exec(`create table public.writing_submissions(id uuid primary key,student_id uuid references flashcard_students(id),topic text,answer text,word_count integer,submitted_at timestamptz default now(),created_at timestamptz default now(),deleted_at timestamptz);
   create table public.writing_submission_issue_occurrences(student_id uuid,document_id uuid,submission_id uuid);
   create table public.writing_submission_drafts(id uuid primary key,answer text);`);
  const writing=await read('../supabase-writing-submission.sql');
  for(const name of ['_writing_submission_word_count','writing_submission_submit']){
   const start=writing.indexOf(`create or replace function public.${name}(`);
   assert.ok(start>=0);await db.exec(writing.slice(start,writing.indexOf('$$;',writing.indexOf('as $$',start))+3));
  }
  const q=(sql,args=[])=>db.query(sql,args);
  const scalar=async(sql,args=[])=>Object.values((await q(sql,args)).rows[0])[0];
  const admin=crypto.randomUUID(),student=crypto.randomUUID(),old=crypto.randomUUID(),id=crypto.randomUUID(),token=crypto.randomUUID();
  const secret='isolated-writing-notification-secret-32';
  await q('insert into schedule_admin_accounts values($1,$2,$3)',[admin,'QA Admin','not-a-password']);
  await q('insert into flashcard_students(id,name) values($1,$2)',[student,'Student <QA>']);
  await q('insert into schedule_worker_secrets values($1,extensions.digest($2,$3))',['schedule-worker',secret,'sha256']);
  await q("insert into schedule_admin_sessions(token_hash,admin_id,expires_at) values(extensions.digest($1,'sha256'),$2,now()+interval '1 hour')",[token,admin]);
  await q('insert into schedule_email_sender_settings(admin_id,sender_email,connected_email,refresh_token_ciphertext,refresh_token_iv,connected_at) values($1,$2,$2,$3,$4,now())',[admin,'sender@example.invalid','fake','fake']);
  const submit=(uid,topic='QA topic',answer='Private essay body')=>q('select * from writing_submission_submit($1,$2,$3,$4,3)',[uid,student,topic,answer]);
  await submit(old);await db.exec(migration);
  assert.equal(await scalar('select count(*) from schedule_email_delivery_jobs'),0,'No historical backfill');
  await q('insert into writing_submission_email_settings(admin_id,sender_email,recipients) values($1,$2,$3)',[admin,'sender@example.invalid',['one@example.invalid','two@example.invalid','ONE@example.invalid']]);
  await submit(id);await submit(id);
  let jobs=(await q('select * from schedule_email_delivery_jobs order by recipient_email')).rows;
  assert.equal(jobs.length,2,'Exactly one notification per unique recipient, including on request retry');
  assert.deepEqual(jobs.map(j=>j.recipient_email),['one@example.invalid','two@example.invalid']);
  assert.ok(jobs.every(j=>j.request_id===id&&j.kind==='writing_submission'&&j.requested_sender_email==='sender@example.invalid'));
  assert.ok(jobs.every(j=>j.content.includes('Student <QA>')&&j.content.includes('QA topic')&&j.content.includes(id)&&!j.content.includes('Private essay body')));
  assert.equal(await scalar('select count(*) from schedule_email_logs'),2);
  assert.equal(await scalar("select count(*) from schedule_email_events where stage='writing_submitted'"),2);
  await q('update writing_submissions set topic=$2 where id=$1',[id,'Administrative edit']);
  await q('insert into writing_submission_drafts values($1,$2)',[crypto.randomUUID(),'Draft only']);
  assert.equal(await scalar('select count(*) from schedule_email_delivery_jobs'),2,'Edits and drafts do not notify');
  await assert.rejects(submit(id,'Conflicting retry'),/identifier conflict/);
  await db.exec('begin');await submit(crypto.randomUUID());await db.exec('rollback');
  assert.equal(await scalar('select count(*) from schedule_email_delivery_jobs'),2,'Queue rolls back with submission');
  await q('update schedule_email_sender_settings set refresh_token_ciphertext=null,refresh_token_iv=null,connected_at=null,connected_email=null');
  assert.equal(await scalar('select schedule_email_service_claim_job($1)',[secret]),null,'Disconnect pauses mail');
  await q("update schedule_email_sender_settings set refresh_token_ciphertext='fake',refresh_token_iv='fake',connected_at=now(),connected_email='other@example.invalid',sender_email='other@example.invalid'");
  assert.equal(await scalar('select schedule_email_service_claim_job($1)',[secret]),null,'Never switch silently to another Gmail');
  await q("update schedule_email_sender_settings set connected_email='sender@example.invalid',sender_email='sender@example.invalid'");
  const claimed=await scalar('select schedule_email_service_claim_job($1)',[secret]);
  assert.equal(claimed.kind,'writing_submission');assert.equal(claimed.senderEmail,'sender@example.invalid');
  assert.equal(claimed.actionUrl,'https://edmundeducation.com/writing-submission.html');
  assert.equal(await scalar('select schedule_email_v2_begin_send($1,$2,$3)',[secret,claimed.jobId,claimed.attempt]),true);
  assert.equal(await scalar('select schedule_email_v2_finish($1,$2,$3,$4,$5,$6)',[secret,claimed.jobId,claimed.attempt,'accepted','mock-gmail-id',null]),true);
  const logs=await scalar("select schedule_email_v2_admin($1,$2,'logs','{}')",[secret,token]);
  assert.equal(logs.logs.length,2);assert.ok(logs.logs.some(l=>l.provider_message_id==='mock-gmail-id'));
  for(const role of ['anon','authenticated','service_role']){
   assert.equal(await scalar('select has_table_privilege($1,$2,$3)',[role,'public.writing_submission_email_settings','select']),false);
   assert.equal(await scalar('select has_function_privilege($1,$2,$3)',[role,'public._writing_submission_queue_admin_email()','execute']),false);
  }
  await q('update writing_submission_email_settings set enabled=false');await submit(crypto.randomUUID());
  assert.equal(await scalar('select count(*) from schedule_email_delivery_jobs'),2,'Disabled configuration respected');
  console.log('Isolated DB: two recipients, retry deduplication, drafts/edits/rollback, privacy, sender pinning, queue/audit and Gmail ID recording passed.');
 }finally{await db.close();}
}
console.log('Writing-submission notification contracts and safe MIME passed. No real emails sent.');
