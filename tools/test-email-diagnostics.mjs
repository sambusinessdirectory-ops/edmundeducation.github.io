// Real early bootstrap and log renderer. All transport is synthetic; no mail sent.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import * as attempts from '../email-attempt.mjs';
import * as shared from '../email-shared.mjs';
const require=createRequire(`${process.env.EMAIL_QA_MODULES}/package.json`),{JSDOM}=require('jsdom');
const script=await readFile(new URL('../email-diagnostics.js',import.meta.url),'utf8');
const html=await readFile(new URL('../schedule-email-log-admin.html',import.meta.url),'utf8');
const log=await readFile(new URL('../schedule-email-log-v2.js',import.meta.url),'utf8');
const until=async fn=>{for(let i=0;i<200;i++){if(fn())return;await new Promise(r=>setTimeout(r,5));}throw new Error('Diagnostic test timed out');};
function fixture({disk=new Map(),owner='a'.repeat(64),token='token-one',mode='ok',blockedStorage=false}={}){
 const dom=new JSDOM(html,{url:'https://edmundeducation.com/schedule-email-log-admin.html',runScripts:'outside-only'}),w=dom.window;
 const calls=[],state={mode};
 Object.assign(w,{Headers,AbortController,TextEncoder,...attempts,...shared});
 Object.defineProperty(w,'localStorage',{get:()=>{if(blockedStorage)throw new Error('Storage blocked');return {getItem:k=>disk.get(k),setItem:(k,v)=>disk.set(k,v)};}});
 if(token)w.sessionStorage.setItem('edmund-schedule-session-v1',JSON.stringify({role:'admin',adminToken:token}));
 w.EDMUND_SCHEDULE_CONFIG={workerBaseUrl:'https://worker.example.invalid'};
 w.fetch=async(url,options={})=>{
  const path=new URL(url).pathname,body=options.body?JSON.parse(options.body):{};calls.push({path,body});
  if(state.mode==='offline')throw new TypeError('Failed to fetch');
  if(path.endsWith('/diagnostics'))return new Response(JSON.stringify(state.mode==='probe-failed'?{code:'AUDIT_WRITE_FAILED',error:'Write failed'}:{ok:true,ownerKey:owner,noEmailSent:true,emailVersion:5,requestId:'proof-id',checks:{databaseRead:'ok',databaseWrite:'ok'}}),{status:state.mode==='probe-failed'?503:200});
  if(path.endsWith('/client-events'))return new Response(JSON.stringify({recorded:state.mode!=='ack-missing'}));
  if(path.endsWith('/logs'))return new Response(JSON.stringify({logs:[],requests:[],subscribers:[],monitors:[]}));
  throw new Error('Unexpected network');
 };
 w.eval(script);return {dom,w,calls,disk,state};
}
const open=[];
try{
 const a=fixture();open.push(a.dom);await until(()=>a.w.document.querySelector('[data-diagnostic-status]').textContent.includes('通過'));
 await a.w.EDMUND_EMAIL_DIAGNOSTICS.ensureRecording();
 assert.ok(a.calls.some(c=>c.body.stage==='page_loaded'));
 const broken=a.w.document.createElement('script');broken.src='/email-preview.mjs';a.w.document.head.append(broken);broken.dispatchEvent(new a.w.Event('error'));
 await a.w.EDMUND_EMAIL_DIAGNOSTICS.ensureRecording();
 assert.ok(a.w.EDMUND_EMAIL_DIAGNOSTICS.history().some(r=>r.code==='SCRIPT_LOAD_FAILED' && r.file==='email-preview.mjs'));
 a.w.dispatchEvent(new a.w.ErrorEvent('error',{error:new TypeError('Cannot read property'),filename:'https://edmundeducation.com/editor.js',lineno:42}));
 await a.w.EDMUND_EMAIL_DIAGNOSTICS.ensureRecording();
 assert.ok(a.calls.some(c=>c.body.line===42 && c.body.stage==='startup_failed'));
 a.w.eval(log.replace(/^import .*;\n/gm,''));await until(()=>!a.w.document.querySelector('[data-app]').hidden);
 assert.ok(a.w.document.querySelector('[data-local-attempts]').children.length);
 assert.match(a.w.document.querySelector('[data-page]').textContent,/0/);
 // Same administrator: new tab + new login token retains metadata via stable owner.
 const b=fixture({disk:a.disk,token:'new-session-token'});open.push(b.dom);
 await until(()=>b.w.document.querySelector('[data-diagnostic-status]').textContent.includes('通過'));
 assert.ok(b.w.EDMUND_EMAIL_DIAGNOSTICS.history().some(r=>r.code==='SCRIPT_LOAD_FAILED'));
 // An already-open log tab must observe the designer's latest event, and
 // writing its own event must not replace another tab's history.
 a.w.EDMUND_EMAIL_DIAGNOSTICS.failure({code:'CROSS_TAB_TEST',message:'Synthetic failure'},{step:'preview'});
 await a.w.EDMUND_EMAIL_DIAGNOSTICS.ensureRecording();
 const diskKey='edmund-email-diagnostics-v5:'+'a'.repeat(64);
 b.w.dispatchEvent(new b.w.StorageEvent('storage',{key:diskKey,newValue:a.disk.get(diskKey)}));
 assert.ok(b.w.EDMUND_EMAIL_DIAGNOSTICS.history().some(r=>r.code==='CROSS_TAB_TEST'));
 b.w.EDMUND_EMAIL_DIAGNOSTICS.record('log_ready',{step:'logs'});await b.w.EDMUND_EMAIL_DIAGNOSTICS.ensureRecording();
 assert.ok(JSON.parse(a.disk.get(diskKey)).some(r=>r.code==='CROSS_TAB_TEST'));
 const other=fixture({disk:a.disk,owner:'b'.repeat(64)});open.push(other.dom);
 await until(()=>other.w.document.querySelector('[data-diagnostic-status]').textContent.includes('通過'));
 assert.equal(other.w.EDMUND_EMAIL_DIAGNOSTICS.history().some(r=>r.code==='SCRIPT_LOAD_FAILED'),false);
 const blocked=fixture({blockedStorage:true});open.push(blocked.dom);await blocked.w.EDMUND_EMAIL_DIAGNOSTICS.selfTest();
 assert.match(blocked.w.document.querySelector('[data-diagnostic-storage]').textContent,/不可用/);
 assert.ok(blocked.calls.some(c=>c.body.stage==='page_loaded'),'Server recording works even when local storage is blocked');
 for(const mode of ['probe-failed','offline','ack-missing']){
  const bad=fixture({mode});open.push(bad.dom);
  assert.equal(await bad.w.EDMUND_EMAIL_DIAGNOSTICS.selfTest(),false);
  assert.match(bad.w.document.querySelector('[data-diagnostic-status]').textContent,/未通過/);
  await assert.rejects(bad.w.EDMUND_EMAIL_DIAGNOSTICS.ensureRecording());
  assert.ok(bad.w.document.querySelector('[data-diagnostic-events]').children.length,'Failure never renders as a blank panel');
  bad.state.mode='ok';assert.equal(await bad.w.EDMUND_EMAIL_DIAGNOSTICS.selfTest(),true);
 }
 const signedOut=fixture({token:null});open.push(signedOut.dom);await signedOut.w.EDMUND_EMAIL_DIAGNOSTICS.selfTest();
 assert.match(signedOut.w.document.querySelector('[data-diagnostic-status]').textContent,/ADMIN_SESSION_MISSING/);
 assert.equal(signedOut.calls.length,0);
 // No fake positive events and no message content, credentials or recipients persisted.
 assert.equal([...a.disk.values()].join('').includes('token-one'),false);
 assert.ok(a.calls.every(c=>!c.path.includes('/submit')&&!c.path.includes('/send-once')));
 console.log('PASS early diagnostics: module/runtime failures, explicit empty state, cross-tab/new-login persistence, owner isolation, blocked storage, no auth, offline, failed write/ack and recovery. No email sent.');
}finally{open.forEach(d=>d.window.close());}
