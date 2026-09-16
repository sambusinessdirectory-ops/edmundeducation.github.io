import {createStudyClock} from './study-clock.mjs';
import {RealtimeClient} from './realtime-client.mjs';
export const API='https://ookkxzgpdclzrrhfmvqx.supabase.co';
export const PUBLIC_KEY='sb_publishable_0BOvquSJ_34TVHCoboQjVg_gRrggI7x';
export function session(){try{return JSON.parse(localStorage.getItem('special-flash-session-v1')||'null');}catch{return null;}}
const notify=()=>document.dispatchEvent(new CustomEvent('professional-learning-changed'));
export async function rpc(name,args={},owner=session()){
 if(!owner?.token)throw Error('請先登入。');
 const response=await fetch(`${API}/rest/v1/rpc/special_flash_${name}`,{method:'POST',headers:{apikey:PUBLIC_KEY,'Content-Type':'application/json'},body:JSON.stringify({p_token:owner.token,...args}),signal:AbortSignal.timeout(15000),keepalive:true});
 const value=await response.json();if(!response.ok)throw Object.assign(Error(value.message||'未能同步'),{code:value.code});return value;
}
const prefix=id=>`professional-learning-v2:${id}:`;
const localKey=key=>session()?.user?.id?prefix(session().user.id)+key:null;
function read(key,fallback=null){try{return JSON.parse(localStorage.getItem(localKey(key))||'null')??fallback;}catch{return fallback;}}
function write(key,value,account=session()?.user?.id){if(account)localStorage.setItem(prefix(account)+key,JSON.stringify(value));}
const flushing=new Map();let stateTimer=null;
function syncStatus(text,needsAttention=false){
 const targets=[...document.querySelectorAll('[data-learning-sync]')];
 if(needsAttention&&!targets.length){
  const notice=document.createElement('p');notice.dataset.learningSync='';notice.className='learning-sync';notice.setAttribute('role','status');
  (document.querySelector('.pro-practice-page,#root .workspace')||document.body).prepend(notice);targets.push(notice);
 }
 targets.forEach(el=>el.textContent=text);
}
const sameSession=owner=>session()?.user?.id===owner.user.id&&session()?.token===owner.token;
const permanentActivityError=error=>/^22/.test(error?.code||'')||['23502','23503','23514'].includes(error?.code)||(error?.code==='42501'&&error?.message==='Exercise is not available.');
export async function flush(){
 const owner=session();if(!owner?.user?.id||!owner.token)return;
 const identity=owner.user.id+':'+owner.token;if(flushing.has(identity))return flushing.get(identity);
 const own=prefix(owner.user.id);
 const entries=type=>Object.keys(localStorage).filter(k=>k.startsWith(own+type+':')).map(k=>[k,localStorage.getItem(k)]).filter(([,raw])=>raw!==null);
 const failedKey=key=>own+'failed:'+key.slice((own+'event:').length);
 function acknowledge(batch){
  for(const [key,raw]of batch){if(localStorage.getItem(key)===raw)localStorage.removeItem(key);localStorage.removeItem(failedKey(key));}
  if(sameSession(owner))notify();
 }
 function retainFailure([key,raw],error){
  // Keep the exact rejected payload for recovery, outside the retry queue so it
  // cannot prevent other activity or the student's saved exercise from syncing.
  if(localStorage.getItem(key)!==raw)return;
  localStorage.setItem(failedKey(key),JSON.stringify({payload:raw,code:error.code||'22023',message:error.message,failedAt:Date.now()}));
  if(localStorage.getItem(key)===raw)localStorage.removeItem(key);
 }
 async function send(batch){
  const valid=[],events=[];
  for(const entry of batch){try{events.push(JSON.parse(entry[1]));valid.push(entry);}catch{retainFailure(entry,{code:'22023',message:'The saved activity could not be read.'});}}
  if(!valid.length||!sameSession(owner))return;
  try{await rpc('activity',{p_events:events},owner);acknowledge(valid);}
  catch(error){
   if(!permanentActivityError(error))throw error;
   if(valid.length===1){retainFailure(valid[0],error);return;}
   // An RPC batch is atomic. Isolate the invalid record, then continue the valid
   // records; stable event identities make a lost-response retry duplicate-safe.
   for(const entry of valid){if(!sameSession(owner))return;await send([entry]);}
  }
 }
 async function drain(){
  if(!sameSession(owner))return;
  try{
   // Re-read after every response. Answers entered while a request is in flight
   // and newer versions of a draft must be included before reporting Saved.
   while(sameSession(owner)){
    const batch=entries('event').slice(0,50);
    if(batch.length){await send(batch);continue;}
    const pending=entries('pending')[0];if(!pending)break;
    const [key,raw]=pending,{key:stateKey,value}=JSON.parse(raw);
    await rpc('learning_state',{p_key:stateKey,p_value:value},owner);
    if(localStorage.getItem(key)===raw)localStorage.removeItem(key);
   }
   if(sameSession(owner)){
    const failed=entries('failed').length;
    syncStatus(failed?`${failed} 項練習紀錄未能同步，已保留在此裝置；其他進度已儲存 · ${failed} activity records need attention; other progress saved`:'已儲存 · Saved',failed>0);
   }
  }catch(error){if(sameSession(owner))syncStatus('已保存在此裝置，連線後同步 · Saved on this device; sync pending');}
 }
 // Tabs share the outbox. A per-account Web Lock prevents an older in-flight
 // preference write from arriving after a newer value another tab has saved.
 const task=Promise.resolve().then(()=>globalThis.navigator?.locks?.request?globalThis.navigator.locks.request('professional-learning-sync:'+owner.user.id,{mode:'exclusive'},drain):drain());
 flushing.set(identity,task);
 try{await task;}finally{if(flushing.get(identity)===task)flushing.delete(identity);}
}
export function record(event,account=session()?.user?.id){
 if(!account||session()?.user?.id!==account)return;
 const key=[event.kind,event.exercise,event.attempt,event.item].join(':');
 write('event:'+key,{...event,at:event.at||Date.now()},account);syncStatus('正在儲存 · Saving…');void flush();
}
export function getCached(key,fallback=null){return read('state:'+key,fallback);}
export function saveState(key,value,account=session()?.user?.id){
 if(!account||session()?.user?.id!==account)return;
 write('state:'+key,value,account);write('pending:'+key,{key,value},account);syncStatus('正在儲存 · Saving…');
 document.dispatchEvent(new CustomEvent('professional-preferences-changed',{detail:{key,value}}));
 clearTimeout(stateTimer);stateTimer=setTimeout(()=>void flush(),500);
}
export async function loadState(key,fallback=null){
 const owner=session(),cached=getCached(key,fallback);if(read('pending:'+key))return cached;
 try{
  const value=await rpc('learning_state',{p_key:key},owner);
  if(session()?.user?.id!==owner.user.id)return fallback;
  if(read('pending:'+key))return getCached(key,fallback);
  if(value!==null)write('state:'+key,value);
  return value??cached;
 }catch{return cached;}
}
export const getFont=area=>Math.max(1,Math.min(5,Number(getCached('font:'+area,1))||1));
export function setFont(area,value){saveState('font:'+area,Math.max(1,Math.min(5,Math.round(Number(value)||1))))}
export function fontControl(area){return `<label class="learning-font-control">字體大小 · Text size <select data-learning-font="${area}" aria-label="字體大小 · Text size">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===getFont(area)?'selected':''}>${n}×${n===1?' 原大小':''}</option>`).join('')}</select></label><span class="learning-sync" data-learning-sync role="status"></span>`;}
export function bookmarks(){
 const id=session()?.user?.id;if(!id)return [];
 const own=prefix(id)+'state:bookmark:';
 return Object.keys(localStorage).filter(k=>k.startsWith(own)).map(k=>{try{return {key:k.slice((prefix(id)+'state:').length),...JSON.parse(localStorage.getItem(k))}}catch{return null}}).filter(v=>v?.bookmarked);
}
export function savedStates(type){
 const id=session()?.user?.id;if(!id)return [];const own=prefix(id)+'state:'+type+':';
 return Object.keys(localStorage).filter(k=>k.startsWith(own)).map(k=>{try{return {key:k.slice((prefix(id)+'state:').length),...JSON.parse(localStorage.getItem(k))};}catch{return null;}}).filter(Boolean);
}
export async function loadPreferences(){
 const owner=session();if(!owner)return;const values=await rpc('learning_state',{},owner);if(!sameSession(owner))return;
 for(const [key,value]of Object.entries(values||{}))if(!read('pending:'+key))write('state:'+key,value);
 document.dispatchEvent(new CustomEvent('professional-preferences-changed'));
}
export const bookmarkKey=(dialogue,word)=>`bookmark:${dialogue}:${word.toLowerCase().replace(/[^a-z]/g,'')}`;
export function toggleWord(dialogue,word,line,account=session()?.user?.id){
 if(!account||session()?.user?.id!==account)return false;
 const key=bookmarkKey(dialogue.id,word),old=getCached(key,{});
 saveState(key,{bookmarked:!old.bookmarked,word,dialogue:dialogue.id,title:dialogue.titleZh,line,context:dialogue.lines[line].en,translation:dialogue.lines[line].zh},account);
 return !old.bookmarked;
}
export function startStudy(kind,exercise,{initialMs=0,onSample=()=>{},onCheckpoint=()=>{}}={}){
 const owner=session()?.user?.id,attempt=crypto.randomUUID();
 const owns=()=>Boolean(owner)&&session()?.user?.id===owner;
 const visible=()=>!document.hidden&&document.hasFocus()&&owns();
 const clock=createStudyClock({initialMs,active:visible()});
 let previous=clock.sample().elapsedMs,pending=0,stopped=false,suspended=false;
 function sample(){
  if(!owns()){clock.setActive(false);return clock.sample();}
  const value=clock.sample();pending+=Math.max(0,value.elapsedMs-previous);previous=value.elapsedMs;
  onSample(value);return value;
 }
 function send(){
  if(pending>0&&owns()){
   // A delayed foreground tick may span several minutes; every RPC event must
   // stay inside the server's per-event time limit.
   while(pending>=1){const ms=Math.min(60000,Math.floor(pending));pending-=ms;record({kind,exercise,attempt,item:'time:'+crypto.randomUUID(),ms},owner);}
   onCheckpoint(clock.sample());
  }
 }
 const timer=window.setInterval(()=>{if(stopped||suspended)return;sample();if(pending>=15000)send();},1000);
 const visibility=()=>{if(stopped)return;sample();clock.setActive(!suspended&&visible());send();};
 const hide=()=>{if(stopped)return;sample();suspended=true;clock.setActive(false);send();};
 const show=()=>{if(stopped)return;suspended=false;clock.setActive(visible());sample();};
 document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',visibility);window.addEventListener('focus',visibility);
 window.addEventListener('pagehide',hide);window.addEventListener('pageshow',show);
 const stop=()=>{
  if(stopped)return;sample();clock.setActive(false);send();stopped=true;window.clearInterval(timer);
  document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',visibility);window.removeEventListener('focus',visibility);window.removeEventListener('pagehide',hide);window.removeEventListener('pageshow',show);
 };
 stop.progress=()=>{if(stopped||!owns())return;sample();const value=clock.progress();onSample(value);};
 stop.snapshot=()=>stopped?clock.sample():sample();
 sample();return stop;
}
export function subscribe(callback){
 let timer=null;const changed=()=>{if(!timer)timer=setTimeout(()=>{timer=null;callback();},120);};
 document.addEventListener('professional-learning-changed',changed);
 const fallback=setInterval(()=>{if(!document.hidden)callback();},5000);
 window.addEventListener('online',changed);
 return()=>{clearInterval(fallback);clearTimeout(timer);document.removeEventListener('professional-learning-changed',changed);window.removeEventListener('online',changed);};
}
let channelClient=null,currentOwner=null,fontScheduled=false;
function applyFonts(){
 fontScheduled=false;document.documentElement.classList.add('learning-measure-font');
 const groups=[['home',document.querySelector('#root .workspace:not(.study-workspace)')],['home',document.querySelector('.library-page')],['flashcards',document.querySelector('.study-workspace')],['dialogue',document.querySelector('.pro-practice-page:not(.poly-page):not(.library-page)')],['polysemy',document.querySelector('.poly-page')]];
 for(const [area,container]of groups){
  if(!container)continue;container.style.setProperty('--learning-scale',getFont(area));
  const nodes=[...container.querySelectorAll('h1,h2,h3,h4,p,span,small,strong,label,button,a,input,select,li,div')].filter(el=>!el.closest('svg,.learning-font-control,.font-size-control,.learning-sync')&&!el.dataset.fontPx);
  const sizes=nodes.map(el=>[el,parseFloat(getComputedStyle(el).fontSize)]);
  for(const [el,size]of sizes){el.dataset.fontPx=String(size);el.style.setProperty('--font-px',size);}
 }
 document.documentElement.classList.remove('learning-measure-font');
 document.querySelectorAll('[data-learning-font]').forEach(el=>{el.value=String(getFont(el.dataset.learningFont));});
}
function scheduleFonts(){if(!fontScheduled){fontScheduled=true;requestAnimationFrame(applyFonts)}}
async function checkAccount(){
 const owner=session();if(owner?.user?.id===currentOwner)return;
 currentOwner=owner?.user?.id;channelClient?.disconnect();channelClient=null;
 if(!currentOwner)return;const id=currentOwner;
 void flush();
 try{
  const values=await rpc('learning_state',{},owner);if(currentOwner!==id||session()?.user?.id!==id||session()?.token!==owner.token)return;
  for(const [key,value]of Object.entries(values))if(!read('pending:'+key))write('state:'+key,value);
  document.dispatchEvent(new CustomEvent('professional-preferences-changed'));scheduleFonts();
 }catch{}
 if(currentOwner!==id||session()?.user?.id!==id||session()?.token!==owner.token)return;
 channelClient=new RealtimeClient(`${API.replace('https:','wss:')}/realtime/v1`,{params:{apikey:PUBLIC_KEY}});
 channelClient.channel('professional-learning',{config:{private:false}}).on('broadcast',{event:'changed'},notify).subscribe(status=>{document.documentElement.dataset.learningRealtime=status;if(status==='SUBSCRIBED')notify();});
}
function onCardMarked(event){
 const d=event.detail;
 if(d?.account&&d.account===session()?.user?.id&&d.mark==='green'&&d.deck&&d.card&&d.attempt)record({kind:'card',exercise:d.deck,attempt:d.attempt,item:d.card,answer:'green'},d.account);
}
function onStorage(event){
 // Re-authenticate the whole UI after another tab changes its login. Exercise
 // controllers also guard their mount owner before pagehide can save anything.
 if(event.key==='special-flash-session-v1'||event.key===null){window.location.reload();return;}
 scheduleFonts();void checkAccount();notify();
}
if(typeof document!=='undefined'){
 window.ProfessionalLearning={record,startStudy,subscribe,rpc,getFont,setFont,bookmarks,saveState,loadState,getCached};
 document.addEventListener('change',event=>{const area=event.target.dataset.learningFont;if(area)setFont(area,event.target.value);});
 document.addEventListener('professional-preferences-changed',scheduleFonts);
 document.addEventListener('professional-card-marked',onCardMarked);
 window.addEventListener('online',()=>void flush());
 window.addEventListener('storage',onStorage);
 new MutationObserver(scheduleFonts).observe(document.body,{childList:true,subtree:true});
 setInterval(()=>{void checkAccount();void flush();},5000);void checkAccount();scheduleFonts();
}
