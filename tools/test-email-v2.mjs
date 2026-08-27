import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderEmailHtml} from '../email-shared.mjs';
import {validateEmailDraft} from '../email-preview.mjs';
import worker,{buildMime,sendGmailJob,processEmailJobs} from '../workers/schedule-system/src/index.js';
import {publishedPageContent,visitorRoute,safeDiagnostic} from '../workers/schedule-system/src/email-v2.js';

const job={jobId:'2a1e6a97-8ee2-4667-ad21-dafbc6b00b63',attempt:1,recipientName:'測試 <script>',recipientEmail:'test@example.invalid',senderEmail:'sender@gmail.com',subject:'Edmund 學習提醒',content:'Hello\n<img src=x onerror=alert(1)>',signatureContent:'iVBORw0KGgo=',signatureContentType:'image/png',signatureLink:'https://example.com/signature',attachments:[{filename:'中文 report.pdf',content:'JVBERi0xLjQK',contentType:'application/pdf'}]};
const mime=buildMime(job);
assert.match(mime,/Message-ID: <2a1e6a97-8ee2-4667-ad21-dafbc6b00b63@edmundeducation.com>/);
assert.match(mime,/Content-ID: <signature-/);assert.match(mime,/filename\*=UTF-8''%E4%B8%AD%E6%96%87%20report.pdf/);
assert.ok(!mime.replace(/\r\n/g,'').includes('\n'));
const encoded=mime.split('Content-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n')[1].split('\r\n\r\n')[0];
const html=Buffer.from(encoded,'base64').toString();
assert.equal(html,renderEmailHtml(job,`cid:signature-${job.jobId}@edmundeducation.com`));
assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<img src=x/);
assert.doesNotMatch(renderEmailHtml({...job,signatureLink:'javascript:alert(1)'},'data:image/png;base64,AA=='),/href="javascript:/);
assert.equal(publishedPageContent('<style>x</style><main><h1>Hi</h1><!-- email-subscription-start -->ignore<!-- email-subscription-end --></main><script>noise</script>'),'<h1>Hi</h1>');
assert.throws(()=>publishedPageContent('Cloudflare error page'),/PAGE_MAIN_MISSING/);
const draft={content:'hello',recipientCount:1,attachments:[],existingAttachments:[],signatureLink:''};
validateEmailDraft(draft);
assert.throws(()=>validateEmailDraft({...draft,recipientCount:0}));
assert.throws(()=>validateEmailDraft({...draft,attachments:[{size:5*1024*1024}],existingAttachments:[{sizeBytes:5*1024*1024},{sizeBytes:1}]}),/合共/);
assert.throws(()=>validateEmailDraft({...draft,signatureLink:'javascript:alert(1)'}));
assert.equal(safeDiagnostic('Bearer abc access_token=xyz\nrefresh_token=secret'),'Bearer [redacted] access_token=[redacted] refresh_token=[redacted]');

const env={ALLOWED_ORIGIN:'https://edmundeducation.com',SUPABASE_URL:'https://db.example.invalid',SUPABASE_ANON_KEY:'test-publishable',SCHEDULE_SERVICE_SECRET:'test-service-secret-at-least-32-characters',GOOGLE_OAUTH_CLIENT_ID:'test',GOOGLE_OAUTH_CLIENT_SECRET:'test',GMAIL_TOKEN_ENCRYPTION_KEY:Buffer.alloc(32,4).toString('base64')};
const aes=await crypto.subtle.importKey('raw',Buffer.alloc(32,4),'AES-GCM',false,['encrypt']);const iv=Buffer.alloc(12,8);
const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},aes,new TextEncoder().encode('fake-refresh-token'));
job.refreshTokenCiphertext=Buffer.from(encrypted).toString('base64');job.refreshTokenIv=iv.toString('base64');
const originalFetch=globalThis.fetch;
let gmailCalls=0,events=[],finishCalls=0,claimCalls=0;
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
function mock({gmailStatus=200,networkFailure=false,tokenStatus=200,failRecordOnce=false}={}){
 gmailCalls=0;events=[];finishCalls=0;claimCalls=0;
 globalThis.fetch=async(url,options)=>{
  if(String(url).includes('/rpc/')){
   const method=String(url).split('/').pop(),body=JSON.parse(options.body);
   if(method==='schedule_email_v2_event'){events.push(body);return json(true);}
   if(method==='schedule_email_v2_begin_send')return json(true);
   if(method==='schedule_email_service_claim_job')return json(claimCalls++===0?{...job}:null);
   if(method==='schedule_email_v2_finish'){finishCalls++;if(failRecordOnce && finishCalls===1)return json({code:'503',message:'transient record failure'},503);assert.equal(body.p_provider_id,'gmail-test-id');assert.equal(body.p_status,'accepted');return json(true);}
   throw new Error(`Unexpected RPC ${method}`);
  }
  if(String(url).includes('oauth2.googleapis.com'))return json(tokenStatus===200?{access_token:'fake-access-token'}:{error:'invalid_grant'},tokenStatus);
  if(String(url).includes('gmail.googleapis.com')){gmailCalls++;if(networkFailure)throw new Error('socket closed');assert.ok(JSON.parse(options.body).raw);return json(gmailStatus===200?{id:'gmail-test-id'}:{error:{status:'PERMISSION_DENIED',message:'Test rejection'}},gmailStatus);}
  throw new Error(`Unexpected URL ${url}`);
 };
}
try{
 mock();assert.equal(await sendGmailJob(env,{...job}),'gmail-test-id');assert.equal(gmailCalls,1);assert.ok(events.some(e=>e.p_stage==='mime_built'));assert.ok(events.some(e=>e.p_stage==='gmail_accepted'));
 mock({gmailStatus:403});await assert.rejects(sendGmailJob(env,{...job}),e=>!e.retry&&!e.uncertain);
 mock({gmailStatus:429});await assert.rejects(sendGmailJob(env,{...job}),e=>e.retry===true);
 mock({gmailStatus:500});await assert.rejects(sendGmailJob(env,{...job}),e=>e.uncertain===true&&!e.retry);
 mock({networkFailure:true});await assert.rejects(sendGmailJob(env,{...job}),e=>e.uncertain===true);
 mock({tokenStatus:400});await assert.rejects(sendGmailJob(env,{...job}),/invalid_grant/);assert.equal(gmailCalls,0);
 mock({failRecordOnce:true});await processEmailJobs(env,2);assert.equal(gmailCalls,1);assert.equal(finishCalls,2);
 globalThis.fetch=async()=>{throw new Error('Must not access network');};
 const blocked=await worker.fetch(new Request('https://worker.example/v1/admin/email/templates/1/send-once',{method:'POST'}),env);assert.equal(blocked.status,401);
}finally{globalThis.fetch=originalFetch;}

let publicRpcCalls=0;
const helpers={rpc:async()=>{publicRpcCalls++;return true;},json:(data,status)=>json(data,status),readLimitedJson:async r=>r.json(),sha256Hex:async()=> 'a'.repeat(64)};
const request=(payload,origin='https://edmundeducation.com')=>new Request('https://worker.example/v1/email/subscriptions/request',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(payload)});
const publicEnv={...env,EMAIL_SIGNUP_RATE_LIMITER:{limit:async()=>({success:true})}};
assert.equal((await visitorRoute(request({website:'bot'}),publicEnv,helpers)).status,202);assert.equal(publicRpcCalls,0);
assert.equal((await visitorRoute(request({email:'x@example.com',topics:['resources'],consent:true},'https://evil.invalid'),publicEnv,helpers)).status,403);
assert.equal((await visitorRoute(request({email:'x@example.com',topics:['not-a-topic'],consent:true}),publicEnv,helpers)).status,400);
assert.equal((await visitorRoute(request({email:'x@example.com',topics:['resources'],consent:true}),publicEnv,helpers)).status,202);assert.equal(publicRpcCalls,1);
for(const topic of ['resources','daily-newsletter','major-music','news-analysis','english-study'])assert.match(await readFile(new URL(`../${topic}.html`,import.meta.url),'utf8'),new RegExp(`email-subscribe.html\\?topic=${topic}`));
console.log('Email v2: MIME/image/PDF parity, validation, audit, auth, retry/uncertain handling, signup protection, and five page links passed. No real emails sent.');
