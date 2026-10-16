import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const pw=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const engine=process.env.ADVANCED_NATIVE_QA_BROWSER||'chromium';
const {hydrateModule}=await import(path.join(root,'natural-english/catalogue.mjs'));
const testLesson=await hydrateModule('advanced-native-011');
const {default:stagedIndex}=await import(path.join(root,'natural-english/advanced-expressions.mjs'));
const origin=process.argv[2]||'http://127.0.0.1:8768';
const output=process.argv[3]||path.join(root,'work/advanced-native-full-20261016/qa/resilience-a11y-audio',engine);
await fs.mkdir(output,{recursive:true});
const files=['natural-english/app.mjs','natural-english/catalogue.mjs','natural-english/style.css','advanced-native/style.css','advanced-native.html','natural-english/advanced-expressions.mjs','natural-english/advanced-imported.generated.mjs','natural-english/advanced-targets.generated.mjs','natural-english/audio/manifest.mjs'];
async function fingerprints(){return Object.fromEntries(await Promise.all(files.map(async f=>[f,crypto.createHash('sha256').update(await fs.readFile(path.join(root,f))).digest('hex')])));}
const before=await fingerprints();
const browser=await pw[engine].launch({headless:true});
const report={engine,origin,stagedLessons:stagedIndex.length,harnessSha256:crypto.createHash('sha256').update(await fs.readFile(fileURLToPath(import.meta.url))).digest('hex'),started:new Date().toISOString(),scope:'Synthetic account and controllable Audio/getUserMedia/storage/RPC failures. Desktop/mobile browser emulation only; no real hearing, microphone hardware, physical device or live account verification.',sampledLessons:['advanced-native-011','advanced-native-012','advanced-native-013'],checks:[],observations:[],pageErrors:[],fingerprintsBefore:before};
const check=async(name,fn)=>{console.log('CHECK '+name);try{const evidence=await fn();report.checks.push({name,pass:true,evidence});}catch(e){report.checks.push({name,pass:false,error:e.message});}await fs.writeFile(path.join(output,'checkpoint.json'),JSON.stringify(report,null,2));};
function require(value,message){if(!value)throw Error(message);}
async function fixture(mobile=false){
 const context=await browser.newContext({serviceWorkers:'block',viewport:mobile?{width:390,height:844}:{width:1280,height:1000},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
 await context.route('https://cdn.jsdelivr.net/**',r=>r.abort());
 await context.route('**/rest/v1/rpc/**',r=>r.fulfill({status:200,contentType:'application/json',body:'[]'}));
 await context.route('**/v1/learning-hub/identity',r=>r.fulfill({status:200,headers:{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization,content-type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'},contentType:'application/json',body:'null'}));
 await context.addInitScript(()=>{
  window.__qa={offline:false,storageFailed:false,syncCalls:[],audio:[],pendingAudio:[],micCalls:0};
  const nativeFetch=window.fetch;window.fetch=function(input,init){const url=typeof input==='string'?input:input?.url;if(url?.includes('/v1/learning-hub/identity'))return Promise.resolve(new Response('null',{status:200,headers:{'Content-Type':'application/json'}}));return nativeFetch.call(this,input,init);};
  const nativeSet=Storage.prototype.setItem;
  Storage.prototype.setItem=function(k,v){if(this===localStorage&&window.__qa.storageFailed&&k.startsWith('edmund-natural-english-v1:'))throw new DOMException('Simulated quota exceeded','QuotaExceededError');return nativeSet.call(this,k,v);};
  class ControlledAudio{
   constructor(){this.src='';this.currentTime=0;this.playbackRate=1;this.paused=true;window.__qa.audioInstance=this;}
   pause(){this.paused=true;window.__qa.audio.push({op:'pause',src:this.src});}
   removeAttribute(n){if(n==='src')this.src='';}
   play(){this.paused=false;window.__qa.audio.push({op:'play',src:this.src,rate:this.playbackRate,time:this.currentTime});return new Promise((resolve,reject)=>window.__qa.pendingAudio.push({resolve,reject}));}
  }
  window.Audio=ControlledAudio;
  window.__qa.resolvePlay=()=>window.__qa.pendingAudio.splice(0).forEach(p=>p.resolve());
  window.__qa.rejectPlay=()=>window.__qa.pendingAudio.splice(0).forEach(p=>p.reject(Error('Simulated media failure')));
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>{window.__qa.micCalls++;throw new DOMException('Simulated denied','NotAllowedError');}}});
  window.MediaRecorder=class {static isTypeSupported(){return true;}};
  const id='004cf420-279f-4a83-a779-ae860b9ac729',token='1f41063f-8af5-429a-9dd2-8ea9c9dcb925';
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{access_token:'synthetic-preview'}}}),signInAnonymously:async()=>({data:{}})},rpc:(name,args)=>({abortSignal:async()=>{
   let data=[];
   if(name==='flashcard_student_login')data=[{session_token:token}];
   else if(name==='flashcard_student_session_profile')data=[{id,name:'Resilience Preview',session_token:token}];
   else if(name==='natural_english_modules_sync'){
    window.__qa.syncCalls.push({count:args.p_events.length,offline:window.__qa.offline});
    if(window.__qa.offline)return{data:null,error:{message:'Simulated network failure'}};
    const events=new Map(JSON.parse(sessionStorage.getItem('__qaRemoteEvents')||'[]').map(e=>[e.id,e]));
    for(const e of args.p_events||[])events.set(e.id,e);
    sessionStorage.setItem('__qaRemoteEvents',JSON.stringify([...events.values()]));data={events:[...events.values()],timeDays:[]};
   }
   return{data,error:null};
  }})})};
 });
 const page=await context.newPage();page.setDefaultTimeout(8000);page.on('pageerror',e=>report.pageErrors.push(e.message));
 await page.goto(origin+'/advanced-native.html',{waitUntil:'networkidle'});
 if(await page.locator('[data-login-form]').isVisible()){
 await page.locator('[name=username]').fill('Resilience Preview');await page.locator('[name=password]').fill('preview');await page.locator('[data-login-form] [type=submit]').click();}
 await page.locator('[data-module="advanced-native-011"]').waitFor();
 return{context,page};
}
async function open(page,id='advanced-native-011'){const c=page.locator(`[data-module="${id}"]`);await c.evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));await c.click();await page.locator('[data-stage] h2').waitFor();}
async function step(page,n){const b=page.locator(`[data-step="${n}"]`);await b.evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));await b.click();await page.waitForTimeout(50);}
async function status(page){return page.locator('[data-sync]').innerText();}
try{
 for(const mobile of [false,true]){
 const {context,page}=await fixture(mobile),prefix=mobile?'mobile390':'desktop1280';
 await check(prefix+' keyboard card activation and lesson heading focus',async()=>{
  const c=page.locator('[data-module="advanced-native-011"]');await page.keyboard.press('Tab');await c.focus();
  const focus=await c.evaluate(el=>({active:document.activeElement===el,outline:getComputedStyle(el).outlineStyle,width:getComputedStyle(el).outlineWidth}));
  await page.keyboard.press('Enter');await page.locator('[data-stage] h2').waitFor();
  const destination=await page.evaluate(()=>({tag:document.activeElement.tagName,text:document.activeElement.textContent?.slice(0,80)}));
  report.observations.push({name:prefix+' focus after opening card',destination});
  require(await page.locator('[data-lesson-view]').isVisible(),'Enter did not open lesson');require(await page.locator('[data-stage] h2').evaluate(el=>document.activeElement===el),'Opening lesson leaves keyboard focus on '+destination.tag);require(focus.active&&focus.outline!=='none'&&focus.width!=='0px','Focused course card has no visible outline: '+JSON.stringify(focus));return{focus,destination};
 });
 await check(prefix+' step navigation keyboard focus and reduced motion',async()=>{
  await page.locator('[data-step="1"]').focus();await page.keyboard.press('Enter');
  require(await page.locator('[data-stage] h2').evaluate(el=>document.activeElement===el),'Step activation does not focus the new heading');
  const styles=await page.locator('[data-stage]').evaluate(el=>({reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,animation:getComputedStyle(el).animationName,transition:getComputedStyle(el).transitionDuration,scroll:getComputedStyle(el).scrollBehavior}));
  require(styles.reduce&&styles.animation==='none'&&styles.transition==='0s','Reduced motion preference leaves stage animation active');return styles;
 });
 await check(prefix+' keyboard answer selection empty writing guard and recording dialog Escape',async()=>{
  await step(page,1);const option=page.locator('[data-q]').first();await option.focus();await page.keyboard.press('Space');await page.locator('.feedback').waitFor();
  require((await page.locator('.feedback').innerText()).includes('答對'),'Keyboard Space did not submit a valid reply');require(await page.locator('.feedback').getAttribute('role')==='status','Answer feedback is not exposed as status');require(await page.locator('[data-sync]').getAttribute('aria-live')==='polite','Sync status lacks polite live region');
  await step(page,6);await page.locator('[data-open-reveal]').focus();await page.keyboard.press('Enter');
  require(await page.locator('textarea').evaluate(el=>document.activeElement===el&&!!document.querySelector('label[for="'+el.id+'"]')),'Empty writing guard did not focus labelled textarea');
  require(await page.locator('.open-review').count()===0,'Empty writing revealed suggested answers');
  const trigger=page.locator('[data-my-recordings]');await trigger.focus();await page.keyboard.press('Enter');await page.locator('[data-recordings-dialog]').waitFor({state:'visible'});await page.keyboard.press('Escape');
  require(!await page.locator('[data-recordings-dialog]').isVisible(),'Escape did not close native dialog');require(await trigger.evaluate(el=>document.activeElement===el),'Dialog close did not return trigger focus');
  return{spaceSubmitted:true,emptyWritingBlocked:true,dialogEscapeAndFocusReturn:true};
 });
 await check(prefix+' visible controls44CSSpx target sizes across7steps',async()=>{
  const small=[],all=[];for(let n=0;n<7;n++){await step(page,n);const rows=await page.locator('header button:visible,header a:visible,.account-line button:visible,[data-lesson-view] button:visible,[data-lesson-view] textarea:visible').evaluateAll(es=>es.filter(e=>!e.disabled).map(e=>{const r=e.getBoundingClientRect();return{text:e.innerText.slice(0,65),width:r.width,height:r.height};}));for(const r of rows){all.push({...r,step:n+1});if(r.width<44||r.height<44)small.push({...r,step:n+1});}}
  require(!small.length,'Controls smaller than44CSSpx: '+JSON.stringify(small));return{controlsMeasured:all.length,minimumWidth:Math.min(...all.map(r=>r.width)),minimumHeight:Math.min(...all.map(r=>r.height)),below44:all.filter(r=>r.width<44||r.height<44)};
 });
 await check(prefix+' denied microphone offers recoverable skip',async()=>{
  await step(page,5);await page.locator('[data-record]').click();await page.locator('[data-record-status]').filter({hasText:'未能使用麥克風'}).waitFor();
  require(await page.locator('[data-record]').isEnabled(),'Mic denial left recording button disabled');await page.locator('[data-skip]').click();require(await page.locator('[data-next]').isEnabled(),'Skip after mic denial did not enable continuation');return{status:await page.locator('[data-record-status]').innerText(),calls:await page.evaluate(()=>window.__qa.micCalls)};
 });
 await check(prefix+' normal slow replay rapid clicks stale completion and switch cancellation',async()=>{
  await step(page,0);const normal=page.locator('[data-stage] [data-say]:not([data-slow])'),slow=page.locator('[data-stage] [data-slow]');
  await normal.click();await page.evaluate(()=>window.__qa.resolvePlay());await page.waitForTimeout(20);require((await page.locator('[data-audio-status]').innerText()).includes('正在播放'),'Normal play status missing');
  await page.evaluate(()=>window.__qa.audioInstance.onended?.());require((await page.locator('[data-audio-status]').innerText()).includes('播放完畢'),'Ended event status missing');
  await slow.click();await page.evaluate(()=>window.__qa.resolvePlay());await normal.click();await normal.click();
  let plays=await page.evaluate(()=>window.__qa.audio.filter(e=>e.op==='play'));require(plays.length===4&&plays[0].rate===1&&plays[1].rate===.75&&plays[2].rate===1&&plays.every(p=>p.time===0),'Rate/replay/start-position mismatch');
  await step(page,1);await page.evaluate(()=>window.__qa.resolvePlay());
  require(await page.evaluate(()=>window.__qa.audioInstance.paused&&window.__qa.audioInstance.src===''),'Step switch left Audio active');require(await page.locator('[data-audio-status]').count()===0,'Prior audio label leaked to different step');
  await step(page,0);await normal.click();await page.evaluate(()=>window.__qa.rejectPlay());await page.waitForTimeout(20);require((await page.locator('[data-audio-status]').innerText()).includes('重試'),'Failed play not recoverable');
  await normal.click();await page.evaluate(()=>window.__qa.resolvePlay());await page.locator('[data-back-modules]').click();await open(page,'advanced-native-012');
  require(await page.evaluate(()=>window.__qa.audioInstance.paused&&window.__qa.audioInstance.src===''),'Lesson switch left prior audio active');
  return{plays:await page.evaluate(()=>window.__qa.audio.filter(e=>e.op==='play')),normalRate:1,slowRate:.75};
 });
 await check(prefix+' background interruption cancels pending media',async()=>{
  await step(page,0);await page.locator('[data-stage] [data-say]:not([data-slow])').click();
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));window.__qa.resolvePlay();});
  require(await page.evaluate(()=>window.__qa.audioInstance.paused&&window.__qa.audioInstance.src===''),'Hidden document left voice active');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});return{simulatedVisibilityEvent:true};
 });
 await check(prefix+' speaking audio and two completed takeaway controls use distinct mapped media',async()=>{
  await page.locator('[data-back-modules]').click();await open(page,'advanced-native-011');
  await step(page,5);await page.locator('[data-stage] [data-say]:not([data-slow])').click();await page.evaluate(()=>window.__qa.resolvePlay());
  const speaking=await page.evaluate(()=>window.__qa.audio.filter(e=>e.op==='play').at(-1));require(speaking.src&&speaking.rate===1,'Speaking clip missing');
  for(let n=0;n<7;n++){
   await step(page,n);const q=testLesson.questions.find(q=>testLesson.steps[n].questions.includes(q.id));
   if(!q){if(await page.locator('[data-skip]').count())await page.locator('[data-skip]').click();continue;}
   if(q.type==='open'){
    if(await page.locator('textarea').isEnabled()){await page.locator('textarea').fill('A new context can help me take this step and explain my decision.');if(await page.locator('[data-open-reveal]').count())await page.locator('[data-open-reveal]').click();if(await page.locator('[data-open-complete]').count())await page.locator('[data-open-complete]').click();}
   }else{
    const choice=q.options.indexOf(q.allCorrect?q.golden:q.answers[0]);const b=page.locator(`[data-q="${q.id}"][data-choice="${choice}"]`);if(await b.isEnabled()){await b.evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));await b.click();}
   }
  }
  await page.locator('[data-next]').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));await page.locator('[data-next]').click();await page.locator('.finish').waitFor();
  const clips=[];for(let n=0;n<2;n++){await page.locator('.finish .takeaway').nth(n).click();await page.evaluate(()=>window.__qa.resolvePlay());clips.push(await page.evaluate(()=>window.__qa.audio.filter(e=>e.op==='play').at(-1)));}
  require(clips.every(c=>c.src&&c.rate===1&&c.time===0)&&clips[0].src!==clips[1].src,'Takeaway controls do not map to two distinct normal-rate clips');
  await page.locator('.finish [data-back-modules]').click();await open(page,'advanced-native-012');return{speaking,clips};
 });
 await check(prefix+' network failure durable outbox writing survives reload retry',async()=>{
  await step(page,6);const draft='My unsent draft remains here while the connection is unavailable.';
  await page.evaluate(()=>window.__qa.offline=true);await page.locator('textarea').fill(draft);await page.locator('[data-open-reveal]').click();await page.locator('[data-open-complete]').click();await page.waitForTimeout(80);
  const message=await status(page),cache=await page.evaluate(()=>JSON.parse(localStorage.getItem('edmund-natural-english-v1:004cf420-279f-4a83-a779-ae860b9ac729')));
  require(message.includes('暫時未能連線')&&cache.outbox.length>0,'Network failure lost pending outbox or falsely claimed saved');
  require(Object.values(cache.inputs).includes(draft),'Typed writing absent from device cache');
  await page.reload({waitUntil:'networkidle'});await page.locator('[data-stage] h2').waitFor();await step(page,6);require(await page.locator('textarea').inputValue()===draft,'Reload lost writing');
  const fresh=await page.evaluate(()=>JSON.parse(localStorage.getItem('edmund-natural-english-v1:004cf420-279f-4a83-a779-ae860b9ac729')));require(fresh.outbox.length===0,'Successful reload sync left old outbox pending');return{failureMessage:message,pendingBeforeReload:cache.outbox.length,pendingAfterReload:fresh.outbox.length,writingRestored:true};
 });
 await check(prefix+' concurrent storage and network failure has truthful warning and in-page recovery',async()=>{
  // Use a fresh unanswered writing slot so completion cannot mask the input test.
  await page.locator('[data-back-modules]').click();await open(page,'advanced-native-013');await step(page,6);
  const draft='This draft is in memory only until device storage works again.';
  await page.evaluate(()=>{window.__qa.offline=true;window.__qa.storageFailed=true;});await page.locator('textarea').fill(draft);
  const deviceWarning=await status(page);require(deviceWarning.includes('本機儲存不可用'),'Storage rejection did not warn');
  await page.locator('[data-open-reveal]').click();await page.locator('[data-open-complete]').click();await page.waitForTimeout(80);
  const bothWarning=await status(page);require(bothWarning.includes('且本機儲存不可用')&&bothWarning.includes('保持此頁開啟'),'Combined failure falsely promised saved data');
  require(await page.locator('textarea').inputValue()===draft,'In-page draft lost');
  await page.evaluate(()=>{window.__qa.offline=false;window.__qa.storageFailed=false;});await page.locator('[data-retry]').click();await page.waitForTimeout(80);
  const cache=await page.evaluate(()=>JSON.parse(localStorage.getItem('edmund-natural-english-v1:004cf420-279f-4a83-a779-ae860b9ac729')));require(Object.values(cache.inputs).includes(draft)&&cache.outbox.length===0,'Recovery failed to persist in-memory writing/events');return{deviceWarning,bothWarning,recovered:true,limitation:'Reload while both stores fail cannot preserve an unsaved draft; warning explicitly requires keeping page open.'};
 });
 await page.screenshot({path:path.join(output,prefix+'.png'),fullPage:false});await context.close();
 }
}finally{
 report.fingerprintsAfter=await fingerprints();report.runtimeUnchanged=JSON.stringify(report.fingerprintsBefore)===JSON.stringify(report.fingerprintsAfter);report.finished=new Date().toISOString();report.passed=report.checks.every(c=>c.pass)&&report.runtimeUnchanged&&!report.pageErrors.length;
 await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));await browser.close();
 process.exitCode=report.passed?0:1;
 console.log(JSON.stringify({output,passed:report.passed,checks:report.checks.map(c=>({name:c.name,pass:c.pass,error:c.error})),pageErrors:report.pageErrors,runtimeUnchanged:report.runtimeUnchanged},null,2));
}
