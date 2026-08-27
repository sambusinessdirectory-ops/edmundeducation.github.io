// Exercise the actual designer script with synthetic files, auth and transport.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {webcrypto} from 'node:crypto';
import * as submit from '../email-submit.mjs';
import * as attempts from '../email-attempt.mjs';
import * as shared from '../email-shared.mjs';
const require=createRequire(`${process.env.EMAIL_QA_MODULES}/package.json`);
const {JSDOM}=require('jsdom');
const html=await readFile(new URL('../schedule-email-content-admin.html',import.meta.url),'utf8');
const source=await readFile(new URL('../schedule-email-content-admin.js',import.meta.url),'utf8');
const dom=new JSDOM(html,{url:'https://edmundeducation.com/schedule-email-content-admin.html',runScripts:'outside-only'});
const w=dom.window,id='11111111-1111-4111-8111-111111111111';
const snapshot={transportConnected:true,gmailDailyLimit:400,sender:{email:'sender@gmail.com',connectedEmail:'sender@gmail.com'},students:[{studentId:id,studentName:'QA',email:'test@example.invalid'}],templates:[{slot:1,content:'Hello',enabled:false,cadence:'once',attachments:[],recipientIds:[id],revision:'2026-08-27T12:00:00Z'}]};
Object.defineProperty(w.crypto,'subtle',{value:webcrypto.subtle});
Object.assign(w,{TextEncoder,Headers,AbortController,confirm:()=>false,...submit,...attempts,...shared});
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
w.HTMLDialogElement.prototype.close=function(){this.open=false;};
w.eval((await readFile(new URL('../email-preview.mjs',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/^export /gm,''));
w.checkEmailSpelling=async()=>[];
w.HTMLElement.prototype.scrollIntoView=function(){};
w.URL.createObjectURL=()=> 'blob:synthetic';w.URL.revokeObjectURL=()=>{};
w.EDMUND_SCHEDULE_CONFIG={workerBaseUrl:'https://worker.example.invalid'};
w.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{}}})},rpc:async()=>({data:structuredClone(snapshot)})})};
w.sessionStorage.setItem('edmund-schedule-session-v1',JSON.stringify({role:'admin',adminToken:id}));
let mode='deferred',release,requests=[],receipt={state:'queued',emailIds:['fake-email-id'],requestId:'',revision:'2026-08-27T12:30:00Z'};
w.fetch=async(url,options)=>{
 const path=new URL(url).pathname;requests.push(path);
 if(mode==='offline') throw new TypeError('offline');
 if(path.endsWith('/submit')) {
  receipt.requestId=options.headers.get('X-Email-Request-ID');
  if(mode==='deferred') {
   assert.equal(options.body.get('signature').size,741626);assert.equal(options.body.get('attachments').size,601244);
   assert.equal(options.body.get('sendNow'),'true');assert.equal(options.body.get('expectedRevision'),snapshot.templates[0].revision);
   await new Promise(resolve=>{release=resolve;});
  }
  if(mode==='lost') throw new TypeError('response lost');
 }
 return new Response(JSON.stringify(receipt),{status:200,headers:{'Content-Type':'application/json'}});
};
const settle=async test=>{for(let i=0;i<100;i++){if(test())return;await new Promise(resolve=>setTimeout(resolve,5));}throw new Error('DOM condition timed out');};
const confirmPreview=async()=>{await settle(()=>w.document.querySelector('dialog [data-next]')?.disabled===false);w.document.querySelector('dialog [data-next]').click();};
try {
 w.eval(source.replace(/^import .*;\n/gm,''));
 await settle(()=>w.document.querySelector('[data-send]'));
 const signature=w.document.querySelector('[data-signature]'),pdf=w.document.querySelector('[data-attachments]');
 Object.defineProperty(signature,'files',{value:[new w.File([new Uint8Array(741626)],'image.png',{type:'image/png'})]});
 Object.defineProperty(pdf,'files',{value:[new w.File([new Uint8Array(601244)],'test.pdf',{type:'application/pdf'})]});
 w.document.querySelector('[data-send]').click();await confirmPreview();await settle(()=>release);
 const leave=new w.Event('beforeunload',{cancelable:true});w.dispatchEvent(leave);assert.equal(leave.defaultPrevented,true);
 assert.equal(w.document.querySelector('[data-send]').disabled,true);
 w.document.querySelector('[data-send]').click();assert.equal(requests.filter(p=>p.endsWith('/submit')).length,1);
 release();await settle(()=>w.document.querySelector('[data-status]').textContent.includes('fake-email-id'));
 assert.equal(requests.some(p=>p.endsWith('/send-once')),false);
 assert.equal(w.document.querySelector('[data-submission-recovery]').hidden,true);
 await settle(()=>!w.document.querySelector('[data-send]').disabled);
 mode='lost';requests=[];w.document.querySelector('[data-send]').click();await confirmPreview();await settle(()=>requests.some(p=>p.includes('/requests/')));await settle(()=>!w.document.querySelector('[data-send]').disabled);
 assert.equal(requests.filter(p=>p.endsWith('/submit')).length,1);assert.equal(w.document.querySelector('[data-submission-recovery]').hidden,true);
 mode='offline';w.document.querySelector('[data-send]').click();await confirmPreview();await settle(()=>!w.document.querySelector('[data-send]').disabled);
 assert.equal(w.document.querySelector('[data-submission-recovery]').hidden,false);
 const pendingKey=Object.keys(w.sessionStorage).find(k=>k.startsWith('edmund-email-pending-v3:') && !k.endsWith(':attempts'));
 assert.ok(pendingKey);const pending=JSON.parse(w.sessionStorage.getItem(pendingKey));assert.ok(pending.requestId);
 // Reload retains only the receipt ID, not image/PDF bytes or credentials.
 assert.deepEqual(Object.keys(pending).sort(),['requestId','sendNow','slot']);
 requests=[];w.document.querySelector('[data-send]').click();await new Promise(resolve=>setTimeout(resolve,10));assert.equal(requests.length,0);
 mode='recover';w.document.querySelector('[data-submission-recovery] button').click();await settle(()=>w.document.querySelector('[data-submission-recovery]').hidden);
 assert.equal(w.sessionStorage.getItem(pendingKey),null);assert.ok(requests.some(p=>p.endsWith('/resolve')));
 mode='recover';requests=[];
 w.document.querySelector('[data-send]').click();await settle(()=>w.document.querySelector('dialog'));
 w.document.querySelector('dialog [data-edit]').click();await settle(()=>!w.document.querySelector('[data-send]').disabled);
 assert.match(w.document.querySelector('[data-status]').textContent,/沒有提交或發送/);
 assert.equal(requests.some(p=>p.endsWith('/submit')),false);
 assert.ok(attempts.attemptHistory(w.sessionStorage,pendingKey+':attempts').some(e=>e.stage==='preview_cancelled'));
 w.document.querySelector('textarea').value='';requests=[];w.document.querySelector('[data-send]').click();
 await settle(()=>w.document.querySelector('[data-status]').textContent.includes('尚未提交'));
 assert.ok(attempts.attemptHistory(w.sessionStorage,pendingKey+':attempts').some(e=>e.stage==='browser_failed' && e.step==='validation'));
 assert.equal(requests.some(p=>p.endsWith('/submit')),false);
 console.log('PASS designer DOM: selected files submitted, one operation only, navigation warning, double-click protection, lost response recovery, offline lock and safe recovery.');
}finally{w.close();}
