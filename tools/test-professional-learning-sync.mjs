import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Run the actual module functions in independent tab globals with shared browser
// storage/locks. Network responses are controlled; no production account is used.
let source=fs.readFileSync(new URL('../professional-english/learning-state.mjs',import.meta.url),'utf8');
source=source.replace(/^import[^\n]+\n/gm,'').replace(/^export /gm,'');
source=source.slice(0,source.indexOf("if(typeof document!=="))+'\nglobalThis.api={record,saveState,flush,checkAccount,onCardMarked,onStorage};';
class Storage {
 getItem(key){return Object.hasOwn(this,key)?this[key]:null;}
 setItem(key,value){Object.defineProperty(this,key,{value:String(value),enumerable:true,writable:true,configurable:true});}
 removeItem(key){delete this[key];}
}
function locks(){
 const tails=new Map();
 return {request(name,options,callback){
  assert.equal(options.mode,'exclusive');
  const previous=tails.get(name)||Promise.resolve(),next=previous.catch(()=>{}).then(callback);
  tails.set(name,next);return next.finally(()=>{if(tails.get(name)===next)tails.delete(name);});
 }};
}
const pause=()=>new Promise(resolve=>setImmediate(resolve));
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
const response=value=>({ok:true,json:async()=>value});
const rejected=(code,message)=>({ok:false,json:async()=>({code,message})});
const alice={token:'alice-token',user:{id:'alice'}},bob={token:'bob-token',user:{id:'bob'}};
const prefix=id=>`professional-learning-v2:${id}:`;
const event=(item,extra={})=>({kind:'blank',exercise:'l1d1',attempt:'attempt-1',item,answer:'correct',...extra});
const eventID=e=>[e.kind,e.exercise,e.attempt,e.item].join(':');
const queued=(storage,id,type)=>Object.keys(storage).filter(k=>k.startsWith(prefix(id)+type+':'));
function browser(server,owner=alice){
 const storage=new Storage(),sharedLocks=locks();storage.setItem('special-flash-session-v1',JSON.stringify(owner));
 function tab({statusTarget=true}={}){
  const status={textContent:''},statusNodes=statusTarget?[status]:[],notifications=[];
  const context={localStorage:storage,navigator:{locks:sharedLocks},window:{location:{reload(){notifications.push({type:'reload'});}}},document:{querySelectorAll:()=>statusNodes,querySelector:()=>null,createElement:()=>({dataset:{},setAttribute(){}}),body:{prepend:node=>statusNodes.unshift(node)},dispatchEvent:e=>notifications.push(e)},
   CustomEvent:class {constructor(type,options){this.type=type;this.detail=options?.detail;}},
   fetch:async(url,options)=>server(url.split('/').at(-1),JSON.parse(options.body)),AbortSignal:{timeout:()=>null},
   setTimeout:()=>1,clearTimeout:()=>{},requestAnimationFrame:()=>1,
   RealtimeClient:class {channel(){return {on(){return this;},subscribe(){}};}disconnect(){}},
  };
  vm.createContext(context);vm.runInContext(source,context);return {...context.api,status,statusNodes,notifications};
 }
 return {storage,tab,login:owner=>storage.setItem('special-flash-session-v1',JSON.stringify(owner))};
}

// A second correct answer and a draft written during a request drain immediately.
{
 const gate=deferred(),received=[],stored=new Map();let first=true;
 const browserState=browser(async(name,body)=>{
  if(name==='special_flash_activity'){
   received.push(body.p_events);if(first){first=false;await gate.promise;}
   return response({accepted:body.p_events.length});
  }
  stored.set(body.p_key,body.p_value);return response(body.p_value);
 });
 const tab=browserState.tab();tab.record(event('first'));await pause();assert.equal(received.length,1);
 tab.record(event('second'));tab.saveState('draft:l1d1:standard:both',{question:3});
 gate.resolve();await tab.flush();
 assert.deepEqual(received.flat().map(e=>e.item),['first','second']);
 assert.deepEqual(stored.get('draft:l1d1:standard:both'),{question:3});
 assert.equal(queued(browserState.storage,'alice','event').length,0);
 assert.equal(queued(browserState.storage,'alice','pending').length,0);assert.equal(tab.status.textContent,'已儲存 · Saved');
}

// A committed response lost in transit retries with the same event identity.
{
 const committed=new Set();let calls=0;
 const browserState=browser(async(name,body)=>{
  for(const e of body.p_events)committed.add(body.p_token+':'+eventID(e));
  if(++calls===1)throw Error('Connection interrupted after commit');
  return response({accepted:0});
 });
 const tab=browserState.tab();tab.record(event('retry'));await tab.flush();
 assert.equal(queued(browserState.storage,'alice','event').length,1);assert.match(tab.status.textContent,/sync pending/);
 await tab.flush();assert.equal(calls,2);assert.equal(committed.size,1);assert.equal(queued(browserState.storage,'alice','event').length,0);
}

// One rejected answer is preserved without blocking other scores or saved drafts.
{
 const committed=new Set(),stored=new Map(),batches=[];
 const browserState=browser(async(name,body)=>{
  if(name==='special_flash_activity'){
   batches.push(body.p_events);
   if(body.p_events.some(e=>e.answer==='obsolete'))return rejected('22023','Answer is not correct.');
   for(const e of body.p_events)committed.add(eventID(e));return response({accepted:body.p_events.length});
  }
  stored.set(body.p_key,body.p_value);return response(body.p_value);
 });
 const tab=browserState.tab();tab.record(event('bad',{answer:'obsolete'}));tab.record(event('good'));tab.saveState('draft:l1d1:standard:both',{question:4});await tab.flush();
 assert.equal(committed.size,1);assert.equal(stored.get('draft:l1d1:standard:both').question,4);
 const failed=queued(browserState.storage,'alice','failed');assert.equal(failed.length,1);
 const retained=JSON.parse(browserState.storage.getItem(failed[0]));assert.equal(JSON.parse(retained.payload).answer,'obsolete');assert.equal(retained.code,'22023');
 assert.equal(queued(browserState.storage,'alice','event').length,0);assert.match(tab.status.textContent,/1 activity records need attention/);
 const count=batches.length;await tab.flush();assert.equal(batches.length,count,'permanent rejection must not spin on the same payload');
 const reloaded=browserState.tab({statusTarget:false});await reloaded.flush();assert.equal(reloaded.statusNodes.length,1,'retained failures create a visible status when the page has none');assert.match(reloaded.statusNodes[0].textContent,/activity records need attention/);
 tab.record(event('bad'));await tab.flush();assert.equal(committed.size,2);assert.equal(queued(browserState.storage,'alice','failed').length,0,'a corrected resubmission clears the retained failure');
}

// Expired authentication is retryable, not a permanent loss of queued activity.
{
 const browserState=browser(async()=>rejected('42501','Please sign in again.'));
 const tab=browserState.tab();tab.record(event('auth-retry'));await tab.flush();
 assert.equal(queued(browserState.storage,'alice','event').length,1);assert.equal(queued(browserState.storage,'alice','failed').length,0);
}

// Cross-tab locks serialize older/newer preference writes; the newest stays saved.
{
 const gate=deferred(),received=[];let serverValue=null,active=0,maxActive=0;
 const browserState=browser(async(name,body)=>{
  active++;maxActive=Math.max(maxActive,active);received.push(body.p_value);
  if(received.length===1)await gate.promise;
  serverValue=body.p_value;active--;return response(body.p_value);
 });
 const a=browserState.tab(),b=browserState.tab();a.saveState('font:home',1);const doneA=a.flush();await pause();
 b.saveState('font:home',5);const doneB=b.flush();await pause();assert.deepEqual(received,[1],'second tab waits for the same account lock');
 gate.resolve();await Promise.all([doneA,doneB]);assert.deepEqual(received,[1,5]);assert.equal(serverValue,5);assert.equal(maxActive,1);
 assert.equal(queued(browserState.storage,'alice','pending').length,0);
}

// A new account can flush while an old response is pending; tokens never mix.
{
 const gate=deferred(),received=[];
 const browserState=browser(async(name,body)=>{
  received.push({name,...body});if(body.p_token===alice.token)await gate.promise;
  return response(name==='special_flash_activity'?{accepted:1}:body.p_value);
 });
 const tab=browserState.tab();tab.record(event('alice-question'));const oldFlush=tab.flush();await pause();
 tab.saveState('font:home',2);browserState.login(bob);tab.record(event('bob-question'));tab.saveState('font:home',5);await tab.flush();
 assert.equal(queued(browserState.storage,'bob','event').length,0);assert.equal(queued(browserState.storage,'bob','pending').length,0);
 gate.resolve();await oldFlush;
 assert.equal(queued(browserState.storage,'alice','pending').length,1,'do not send further old-session state after switching account');
 assert.equal(received.filter(r=>r.p_token===alice.token).length,1);
 assert.equal(received.find(r=>r.p_key==='font:home').p_token,bob.token);assert.equal(tab.status.textContent,'已儲存 · Saved');
}

// Delayed preference hydration must not populate a subsequently signed-in user.
{
 const gate=deferred();
 const browserState=browser(async()=>{await gate.promise;return response({'font:home':5,'bookmark:l1d1:morning':{word:'morning',bookmarked:true}});});
 const tab=browserState.tab(),loading=tab.checkAccount();await pause();browserState.login(bob);gate.resolve();await loading;
 assert.equal(browserState.storage.getItem(prefix('bob')+'state:font:home'),null);
 assert.equal(browserState.storage.getItem(prefix('bob')+'state:bookmark:l1d1:morning'),null);
}
// Stale callbacks carry their original owner and cannot write to the new account.
{
 const browserState=browser(async()=>response({accepted:1}));const tab=browserState.tab();browserState.login(bob);
 tab.saveState('draft:l1d1:standard:both',{question:9},alice.user.id);tab.record(event('stale'),alice.user.id);
 tab.onCardMarked({detail:{account:alice.user.id,mark:'green',deck:'deck',card:'card',attempt:'round'}});
 assert.equal(queued(browserState.storage,'bob','pending').length,0);assert.equal(queued(browserState.storage,'bob','event').length,0);
 tab.onCardMarked({detail:{account:bob.user.id,mark:'green',deck:'deck',card:'card',attempt:'round'}});await tab.flush();assert.ok(tab.notifications.some(n=>n.type==='professional-learning-changed'));
 tab.onStorage({key:'special-flash-session-v1'});assert.ok(tab.notifications.some(n=>n.type==='reload'));
}

// Actual controllers cannot persist/pagehide, bookmark or credit stale exercise
// contents after another tab replaces the session, even before reload executes.
{
 const [{mountDialoguePage},{mountPolysemyPage},{createRequire}]=await Promise.all([import('../professional-english/dialogue-practice.mjs'),import('../professional-english/polysemy-practice.mjs'),import('node:module')]);
 const require=createRequire(new URL('./email-qa/package.json',import.meta.url));const {JSDOM}=require('jsdom');
 const dom=new JSDOM('<body></body>',{url:'https://edmundeducation.com/professional-english/dialogue.html?id=fixture&view=practice',pretendToBeVisual:true}),w=dom.window;
 for(const key of ['window','document','localStorage','history','location','navigator','CustomEvent','innerHeight','innerWidth'])Object.defineProperty(globalThis,key,{value:w[key],configurable:true});
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};globalThis.fetch=async()=>response(null);
 localStorage.setItem('special-flash-session-v1',JSON.stringify(alice));
 const dialogue={id:'fixture',lesson:1,title:'Fixture',titleZh:'測試',variant:'professional',lines:[{role:'Tenant',en:'Welcome back today.',zh:'歡迎回來。'}]};
 const mounted=mountDialoguePage({dialogues:[dialogue],audioManifest:{}});await mounted.ready;
 const input=mounted.page.querySelector('[data-blank]');assert.ok(input);input.value='unfinished';input.dispatchEvent(new w.Event('input'));
 const word={id:'word',word:'word',baseWord:'word',senses:[{id:'meaning',zh:'字詞'}],questions:[{id:'q',answer:'meaning',kind:'passage',en:'Read this word.',zh:'讀這個字詞。',zhMasked:'讀這個____。'}]};
 const poly=mountPolysemyPage({data:{words:[word]}});poly.page.querySelector('[data-poly-word]').click();await poly.ready;
 localStorage.setItem('special-flash-session-v1',JSON.stringify(bob));
 // The final answer now awards completion immediately, so attempt that answer
 // after the account switch as well as the later results/navigation callback.
 poly.page.querySelector('[data-poly-answer]').click();
 input.value=input.dataset.answer;input.dispatchEvent(new w.Event('input'));input.dispatchEvent(new w.Event('change'));
 mounted.page.querySelector('[data-check-answers]').click();mounted.page.querySelector('[data-bookmark-word]')?.click();
 poly.page.querySelector('[data-poly-next]').click();w.dispatchEvent(new w.Event('pagehide'));
 assert.equal(Object.keys(localStorage).filter(k=>k.startsWith(prefix('bob'))).length,0,'stale exercise data never enters Bob’s draft, bookmark or activity keys');
 assert.equal(localStorage.getItem('professional-polysemy-v1:bob:lesson-1'),null,'stale completion cannot appear in Bob’s word list');
 assert.equal(poly.page.querySelector('.poly-complete'),null);
 await pause();w.close();
}
// A corrected professional script cannot consume the old beginner script's
// positional answers. Preserve that old attempt before pagehide saves v2.
{
 const [{mountDialoguePage,blankPositions,lineTokens},{createRequire}]=await Promise.all([import('../professional-english/dialogue-practice.mjs'),import('node:module')]);
 const require=createRequire(new URL('./email-qa/package.json',import.meta.url));const {JSDOM}=require('jsdom');
 const dialogues=JSON.parse(fs.readFileSync(new URL('../professional-english/dialogues.json',import.meta.url),'utf8')).dialogues;
 const beginner=dialogues.find(d=>d.id==='l2d2-beginner'),professional=dialogues.find(d=>d.id==='l2d2');
 assert.equal(beginner.contentVersion,1);assert.equal(professional.contentVersion,2);
 const gaps=beginner.lines.flatMap((line,index)=>[...blankPositions(line.en,index,.25)].map(token=>({key:`${index}:${token}`,answer:lineTokens(line.en)[token]})));
 const oldKey='draft:l2d2:standard:both',beginnerKey='draft:l2d2-beginner:standard:both',lastKey='draft:l2d2-beginner:last';
 const legacy={id:'11111111-1111-4111-8111-111111111111',answers:{[gaps[0].key]:gaps[0].answer,[gaps[1].key]:'still typing'},credited:[gaps[0].key],complete:false,started:true};
 function setup(id,handler=async()=>response(null)){
  const dom=new JSDOM('<body></body>',{url:`https://edmundeducation.com/professional-english/dialogue.html?id=${id}&view=practice&difficulty=standard&hints=both`,pretendToBeVisual:true}),w=dom.window;
  for(const key of ['window','document','localStorage','history','location','navigator','CustomEvent','innerHeight','innerWidth'])Object.defineProperty(globalThis,key,{value:w[key],configurable:true});
  w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=function(){};globalThis.fetch=handler;localStorage.setItem('special-flash-session-v1',JSON.stringify(alice));return w;
 }
 function seed(key,value){localStorage.setItem(prefix('alice')+'state:'+key,JSON.stringify(value));localStorage.setItem(prefix('alice')+'pending:'+key,JSON.stringify({key,value}));}
 const cached=key=>JSON.parse(localStorage.getItem(prefix('alice')+'state:'+key)||'null');
 {
  const w=setup('l2d2');seed(oldKey,legacy);
  const mounted=mountDialoguePage({dialogues,audioManifest:{}});await mounted.ready;
  const retained=cached(beginnerKey);assert.equal(retained.id,legacy.id);assert.deepEqual(retained.answers,legacy.answers);assert.deepEqual(retained.credited,legacy.credited);assert.equal(retained.contentVersion,1);
  assert.deepEqual(cached(lastKey),{difficulty:'standard',hint:'both',complete:false,started:true,contentVersion:1});
  assert.ok([...mounted.page.querySelectorAll('[data-blank]')].every(input=>input.value===''),'professional v2 starts without old beginner answers');
  assert.match(mounted.page.querySelector('[data-result-status]').textContent,/^0 \//);
  w.dispatchEvent(new w.Event('pagehide'));
  assert.notEqual(cached(oldKey).id,legacy.id);assert.equal(cached(oldKey).contentVersion,2);assert.equal(cached(oldKey).credited.length,0);
  assert.deepEqual(cached(beginnerKey),retained,'professional pagehide must not overwrite the migrated beginner attempt');
  history.replaceState(null,'','?id=l2d2-beginner&view=practice&difficulty=standard&hints=both');
  const resumed=mountDialoguePage({dialogues,audioManifest:{}});await resumed.ready;
  assert.equal(resumed.page.querySelector(`[data-blank="${gaps[0].key}"]`).value,gaps[0].answer);assert.equal(resumed.page.querySelector(`[data-blank="${gaps[0].key}"]`).readOnly,true);
  assert.equal(resumed.page.querySelector(`[data-blank="${gaps[1].key}"]`).value,'still typing');
  w.dispatchEvent(new w.Event('pagehide'));assert.equal(cached(beginnerKey).id,legacy.id);w.close();
 }
 {
  const w=setup('l2d2'),existing={...legacy,id:'22222222-2222-4222-8222-222222222222',contentVersion:1,answers:{[gaps[0].key]:'newer beginner work'},credited:[]},last={difficulty:'hard',hint:'none',complete:false,started:true,contentVersion:1};
  seed(oldKey,legacy);seed(beginnerKey,existing);seed(lastKey,last);
  const mounted=mountDialoguePage({dialogues,audioManifest:{}});await mounted.ready;
  assert.deepEqual(cached(beginnerKey),existing,'an existing beginner attempt wins over the legacy migration');assert.deepEqual(cached(lastKey),last,'existing beginner mode preference is not replaced');
  w.dispatchEvent(new w.Event('pagehide'));assert.deepEqual(cached(beginnerKey),existing);w.close();
 }
 {
  const w=setup('l2d2-beginner');seed(oldKey,legacy);
  const mounted=mountDialoguePage({dialogues,audioManifest:{}});await mounted.ready;
  assert.equal(mounted.page.querySelector(`[data-blank="${gaps[1].key}"]`).value,'still typing','beginner can directly load its compatible old key');
  w.dispatchEvent(new w.Event('pagehide'));assert.equal(cached(beginnerKey).id,legacy.id);assert.deepEqual(cached(beginnerKey).credited,legacy.credited);w.close();
 }
 {
  const gate=deferred(),started=deferred();let waiting=true;
  const w=setup('l2d2',async(url,options)=>{const body=JSON.parse(options.body);if(body.p_key===beginnerKey&&waiting){waiting=false;started.resolve();await gate.promise;}return response(null);});seed(oldKey,legacy);
  const mounted=mountDialoguePage({dialogues,audioManifest:{}});await started.promise;
  localStorage.setItem('special-flash-session-v1',JSON.stringify(bob));gate.resolve();await mounted.ready;w.dispatchEvent(new w.Event('pagehide'));
  assert.equal(Object.keys(localStorage).filter(key=>key.startsWith(prefix('bob'))).length,0,'an interrupted migration cannot copy the old account’s attempt into the newly signed-in account');w.close();
 }
}
console.log('Passed: versioned dialogue migration, preserved beginner attempts and pagehide safety, stale exercise and flashcard owner guards, cross-tab reauthentication, continuous outbox draining, duplicate-safe response retry, rejected-activity retention and isolation, expired-session retry, cross-tab preference ordering, concurrent account switch, and private preference hydration.');
