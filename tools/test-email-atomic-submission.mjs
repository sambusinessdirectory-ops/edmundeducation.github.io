// All database and transport calls are isolated. No real emails or production data.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import worker,{buildMime} from '../workers/schedule-system/src/index.js';
import {submitWithRecovery,resolveSubmission} from '../email-submit.mjs';
const require=createRequire(`${process.env.EMAIL_QA_MODULES}/package.json`);
process.on('uncaughtException',error=>{console.error(error.message,error.where||'',error.stack?.split('\n').find(line=>line.includes('test-email-atomic'))||'');process.exit(1);});
const {PGlite}=require('@electric-sql/pglite');
const db=new PGlite();
const read=p=>readFile(new URL(p,import.meta.url),'utf8');
const scalar=async(sql,args=[])=>Object.values((await db.query(sql,args)).rows[0])[0];
const rpc=(name,args)=>scalar(`select public.${name}(${args.map((_,i)=>`$${i+1}`).join(',')})`,args);
const image=Buffer.alloc(741626);image.set([137,80,78,71,13,10,26,10]);
const pdf=Buffer.alloc(601244);pdf.set(Buffer.from('%PDF-1.7\n'));
const secret='isolated-service-secret-at-least-32-characters',admin=crypto.randomUUID(),token=crypto.randomUUID(),student=crypto.randomUUID();
let payload,receipt;
try {
 for(const path of ['./email-v2-test-baseline.sql','../supabase-schedule-gmail-delivery-20260822.sql','../supabase/migrations/20260827110241_email_audit_preview_subscriptions.sql','../supabase/migrations/20260827123503_email_atomic_submission.sql']) await db.exec(await read(path));
 await db.query('insert into schedule_worker_secrets values($1,extensions.digest($2,$3))',['schedule-worker',secret,'sha256']);
 await db.query('insert into schedule_admin_accounts values($1,$2,$3)',[admin,'QA','not-a-login']);
 await db.query("insert into schedule_admin_sessions(token_hash,admin_id,expires_at) values(extensions.digest($1,'sha256'),$2,now()+interval '1 hour')",[token,admin]);
 await db.query('insert into flashcard_students(id,name) values($1,$2)',[student,'QA']);
 await db.query('insert into schedule_student_reminder_emails values($1,$2)',[student,'test@example.invalid']);
 await db.query('insert into schedule_email_sender_settings(admin_id,sender_email,connected_email,refresh_token_ciphertext,refresh_token_iv,connected_at) values($1,$2,$2,$3,$4,now())',[admin,'sender@gmail.com','fake-token','fake-iv']);
 await db.query('insert into schedule_email_templates(admin_id,slot) values($1,1)',[admin]);
 const revision=()=>scalar('select updated_at::text from schedule_email_templates where admin_id=$1 and slot=1',[admin]);
 payload={content:'Attachment test',enabled:false,cadence:'once',dailyTime:null,recipientIds:[student],signatureAction:'replace',signatureContent:image.toString('base64'),signatureContentType:'image/png',signatureFilename:'image.png',signatureLink:'https://example.invalid/',removeAttachmentIds:[],attachments:[{filename:'test.pdf',contentType:'application/pdf',sizeBytes:pdf.length,content:pdf.toString('base64')}],expectedRevision:await revision(),sendNow:true,previewApproved:true,spellcheck:'passed'};
 const submit=(id,p=payload)=>rpc('schedule_email_v3_submit',[secret,token,1,id,JSON.stringify(p)]);
 const request=crypto.randomUUID();
 const results=await Promise.all([submit(request),submit(request)]);
 receipt=results[0];assert.deepEqual(results[1],receipt);assert.equal(receipt.state,'queued');assert.equal(receipt.emailIds.length,1);
 assert.equal(Number(await scalar('select count(*) from schedule_email_delivery_jobs')),1);
 assert.equal(Number(await scalar('select count(*) from schedule_email_template_attachments')),1);
 assert.equal(receipt.assets.signatureBytes,image.length);assert.equal(receipt.assets.attachments[0].sizeBytes,pdf.length);
 const assets=await scalar('select assets from schedule_email_snapshots');
 assert.deepEqual(Buffer.from(assets.signatureContent,'base64'),image);assert.deepEqual(Buffer.from(assets.attachments[0].content,'base64'),pdf);
 const snapshot=await rpc('schedule_admin_email_designer_snapshot',[token]);assert.ok(snapshot.templates[0].revision);
 await assert.rejects(submit(request,{...payload,content:'Changed'}),/REQUEST_REUSED/);
 await assert.rejects(submit(crypto.randomUUID()),/DRAFT_CHANGED/);
 const before=await revision(),pdfCount=await scalar('select count(*) from schedule_email_template_attachments');
 await assert.rejects(submit(crypto.randomUUID(),{...payload,expectedRevision:before,recipientIds:[]}),/NO_RECIPIENTS/);
 assert.equal(await revision(),before);assert.equal(await scalar('select count(*) from schedule_email_template_attachments'),pdfCount);
 await assert.rejects(submit(crypto.randomUUID(),{...payload,expectedRevision:before,previewApproved:false}),/PREVIEW_REQUIRED/);
 await db.query('update schedule_email_sender_settings set refresh_token_ciphertext=null,refresh_token_iv=null,connected_email=null,connected_at=null where admin_id=$1',[admin]);
 await assert.rejects(submit(crypto.randomUUID(),{...payload,expectedRevision:before}),/GMAIL_DISCONNECTED/);
 assert.equal(await revision(),before);assert.equal(await scalar('select count(*) from schedule_email_template_attachments'),pdfCount);
 await db.query("update schedule_email_sender_settings set refresh_token_ciphertext='fake-token',refresh_token_iv='fake-iv',connected_email=sender_email,connected_at=now() where admin_id=$1",[admin]);
 const noSend=crypto.randomUUID(),draft={...payload,sendNow:false,expectedRevision:before,attachments:[]};
 const saved=await submit(noSend,draft);assert.equal(saved.state,'saved');assert.deepEqual(await submit(noSend,draft),saved);
 assert.equal(Number(await scalar('select count(*) from schedule_email_delivery_jobs')),1);
 assert.deepEqual(await rpc('schedule_email_v3_receipt',[secret,token,request,true]),receipt);
 const cancelledId=crypto.randomUUID();
 assert.equal((await rpc('schedule_email_v3_receipt',[secret,token,cancelledId,false])).state,'pending');
 assert.equal((await rpc('schedule_email_v3_receipt',[secret,token,cancelledId,true])).state,'cancelled');
 assert.equal((await submit(cancelledId)).state,'cancelled');
 assert.equal(Number(await scalar('select count(*) from schedule_email_delivery_jobs')),1);
 await assert.rejects(rpc('schedule_email_v3_receipt',['wrong',token,request,false]),/Forbidden/);
 await assert.rejects(rpc('schedule_email_v3_receipt',[secret,crypto.randomUUID(),request,false]),/Expired admin/);
 const otherAdmin=crypto.randomUUID(),otherToken=crypto.randomUUID();
 await db.query('insert into schedule_admin_accounts values($1,$2,$3)',[otherAdmin,'Other QA','none']);
 await db.query("insert into schedule_admin_sessions(token_hash,admin_id,expires_at) values(extensions.digest($1,'sha256'),$2,now()+interval '1 hour')",[otherToken,otherAdmin]);
 assert.equal((await rpc('schedule_email_v3_receipt',[secret,otherToken,request,false])).state,'pending');
 assert.equal(await scalar("select has_table_privilege('anon','schedule_email_submission_receipts','select')"),false);
 assert.equal(await scalar("select relrowsecurity from pg_class where oid='schedule_email_submission_receipts'::regclass"),true);
 assert.equal(await scalar("select has_function_privilege('anon','_schedule_email_designer_snapshot_v2(uuid)','execute')"),false);
 console.log('PASS database: realistic files, atomic save/queue rollback, replay, stale revision, private receipts, safe cancellation fence, snapshot integrity.');
} finally {await db.close();}

const originalFetch=globalThis.fetch,events=[],background=[];
let releaseAudit,savedPayload;
const json=data=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}});
const env={ALLOWED_ORIGIN:'https://edmundeducation.com',SUPABASE_URL:'https://db.example.invalid',SUPABASE_ANON_KEY:'fake-public',SCHEDULE_SERVICE_SECRET:'fake-secret'};
globalThis.fetch=async(url,options)=>{
 assert.ok(String(url).startsWith(env.SUPABASE_URL),'Real network forbidden');
 const name=String(url).split('/').pop(),body=JSON.parse(options.body);
 if(name==='schedule_announcement_admin_auth') return json([{id:admin}]);
 if(name==='schedule_email_v3_submit') {savedPayload=body.p_payload;return json(receipt);}
 if(name==='schedule_email_v3_events') {events.push(...body.p_events);await new Promise(resolve=>{releaseAudit=resolve;});return json(true);}
 throw new Error(`Unexpected RPC: ${name}`);
};
try {
 const form=new FormData();
 for(const [k,v] of Object.entries({content:'Attachment test',enabled:'false',cadence:'once',recipientIds:JSON.stringify([student]),signatureAction:'replace',removeAttachmentIds:'[]',previewApproved:'true',spellcheck:'passed',sendNow:'true',expectedRevision:payload.expectedRevision})) form.set(k,v);
 form.set('signature',new File([image],'image.png',{type:'image/png'}));form.append('attachments',new File([pdf],'test.pdf',{type:'application/pdf'}));
 const response=await Promise.race([worker.fetch(new Request('https://worker.example/v1/admin/email/templates/1/submit',{method:'POST',headers:{Authorization:`Bearer ${token}`,'X-Email-Request-ID':crypto.randomUUID()},body:form}),env,{waitUntil:p=>background.push(p)}),new Promise((_,reject)=>{const timer=setTimeout(()=>reject(new Error('Audit blocked the response')),1000);timer.unref();})]);
 assert.equal(response.status,202);assert.deepEqual((await response.json()).emailIds,receipt.emailIds);
 assert.equal(Buffer.from(savedPayload.signatureContent,'base64').length,image.length);assert.equal(savedPayload.attachments[0].sizeBytes,pdf.length);
 assert.ok(background.length>=2);assert.ok(events.some(e=>e.stage==='request_complete'));releaseAudit();await Promise.all(background);
 console.log('PASS Worker: multipart file bytes preserved; background audit does not delay authoritative receipt; in-flight operation registered with waitUntil.');
} finally {globalThis.fetch=originalFetch;}

const mime=buildMime({jobId:receipt.emailIds[0],recipientName:'QA',recipientEmail:'test@example.invalid',senderEmail:'sender@gmail.com',subject:'Test',content:'Test',signatureContent:image.toString('base64'),signatureContentType:'image/png',attachments:payload.attachments});
assert.ok(mime.includes('Content-ID: <signature-'));assert.ok(mime.includes('application/pdf'));
const pdfPart=mime.split('Content-Type: application/pdf\r\n')[1].split('\r\n\r\n')[1].split('\r\n--')[0];assert.deepEqual(Buffer.from(pdfPart,'base64'),pdf);
let sends=0;
const uploadedForm=new FormData();uploadedForm.set('content','test');
const recovered=await submitWithRecovery({api:async(path,options)=>{if(path.endsWith('/submit')){sends++;throw new TypeError('lost response');}assert.equal(options,undefined);return receipt;},slot:1,form:uploadedForm,requestId:receipt.requestId});
assert.deepEqual(recovered,receipt);assert.equal(sends,1);
let lastBody,requestIds=[],attempts=0;
await submitWithRecovery({api:async(path,options)=>{if(path.endsWith('/submit')){requestIds.push(options.headers['X-Email-Request-ID']);if(lastBody) assert.equal(options.body,lastBody);lastBody=options.body;if(attempts++===0)throw new TypeError('offline');return receipt;}return {state:'pending'};},slot:1,form:uploadedForm,requestId:receipt.requestId});
assert.deepEqual(requestIds,[receipt.requestId,receipt.requestId]);
const fenced=await submitWithRecovery({api:async(path)=>{if(path.endsWith('/resolve'))return {state:'cancelled',emailIds:[]};if(path.endsWith('/submit'))throw new TypeError('offline');return {state:'pending'};},slot:1,form:uploadedForm,requestId:receipt.requestId});
assert.equal(fenced.state,'cancelled');
await assert.rejects(resolveSubmission(async()=>{throw new TypeError('offline');},receipt.requestId),/offline/);
console.log('PASS frontend: lost-response recovery, same-ID/body retry, cancellation resolution, and realistic PDF MIME round-trip. No real email sent.');
