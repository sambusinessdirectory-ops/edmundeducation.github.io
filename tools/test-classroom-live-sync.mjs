import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createClassroomLiveSync,classroomPollDelay} from '../classroom-live-sync.mjs';
const originalNow=Date.now;let now=100000;Date.now=()=>now;
const rows=new Map();let version=0,calls=0,offline=false;
function device(owner='mary',scope='lesson1'){
 const doc=new EventTarget();doc.hidden=false;const env={document:doc,crypto:webcrypto,setInterval:()=>1,clearInterval(){}};
 let c={owner,token:owner,scope,active:true},value={},applied=0;
 const sync=createClassroomLiveSync({system:'synonyms',environment:env,context:()=>c,read:()=>value,apply:v=>{value=v;applied++;},rpc:async(name,args)=>{
  calls++;if(offline)throw Error('offline');const key=args.p_token+':'+args.p_scope;
  if(args.p_payload&&rows.get(key)?.mutation!==args.p_mutation)rows.set(key,{revision:++version,payload:args.p_payload,mutation:args.p_mutation});
  const row=rows.get(key);return row?{revision:row.revision,payload:row.revision!==args.p_since?structuredClone(row.payload):null}:{revision:0};
 }});
 return {sync,doc,set:v=>value=v,get:()=>value,context:v=>Object.assign(c,v),applied:()=>applied};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
try{
 const a=device(),b=device(),other=device('john');
 a.set({question:1,feedback:'correct',explanation:'why'});a.sync.publish();await settle();await b.sync.tick();await other.sync.tick();
 assert.deepEqual(b.get(),a.get());assert.deepEqual(other.get(),{});
 const applied=b.applied();now+=2000;await b.sync.tick();assert.equal(b.applied(),applied,'unchanged snapshots do not re-render');
 b.set({question:2,feedback:null});b.sync.publish();await settle();now+=2000;await a.sync.tick();assert.deepEqual(a.get(),b.get());
 offline=true;a.set({question:2,feedback:'wrong'});a.sync.publish();await settle();const failed=calls;await a.sync.tick();assert.equal(calls,failed,'failed writes back off');
 offline=false;now+=4000;await a.sync.tick();now+=2000;await b.sync.tick();assert.equal(b.get().feedback,'wrong');
 b.doc.hidden=true;now+=100000;const hidden=calls;await b.sync.tick();assert.equal(calls,hidden);
 b.doc.hidden=false;b.context({scope:null});await b.sync.tick();assert.equal(calls,hidden,'leaving exercise stops requests');
 b.context({scope:'lesson2'});await b.sync.tick();assert.equal(b.get().feedback,'wrong'); // no unrelated payload applied
 b.context({owner:null,token:null});now+=100000;const loggedOut=calls;await b.sync.tick();assert.equal(calls,loggedOut);
 assert.equal(classroomPollDelay(true,now,now),2000);assert.equal(classroomPollDelay(true,now-60001,now),30000);assert.equal(classroomPollDelay(false,now,now),60000);
 const racingDoc=new EventTarget();racingDoc.hidden=false;let resolveRead,remoteApplied=0;
 const racing=createClassroomLiveSync({system:'writing',environment:{document:racingDoc,crypto:webcrypto,setInterval:()=>1,clearInterval(){}},context:()=>({owner:'mary',token:'mary',scope:'workspace',active:true}),read:()=>({answer:'local'}),apply:()=>remoteApplied++,rpc:()=>new Promise(resolve=>resolveRead=resolve)});
 const reading=racing.tick();racingDoc.dispatchEvent(new Event('input'));resolveRead({revision:1,payload:{answer:'older remote'}});await reading;
 assert.equal(remoteApplied,0,'an in-flight read must not erase a newly typed character');racing.stop();
 for(const d of [a,b,other])d.sync.stop();
 console.log('PASS classroom transport: two-way feedback/next, account and lesson isolation, unchanged DOM, offline retry/backoff, hidden/logout/leave cleanup, adaptive polling.');
}finally{Date.now=originalNow;}
