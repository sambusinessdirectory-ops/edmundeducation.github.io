// PUBLIC READ-ONLY SMOKE: real assets/media; isolated synthetic account/RPC only.
// Execute only after the release owner confirms the deployed version is ready.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import index from '../../natural-english/advanced-expressions.mjs';
import {hydrateModule} from '../../natural-english/catalogue.mjs';
import {audioManifest} from '../../natural-english/audio/manifest.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const origin=process.argv[2]||'https://edmundeducation.com';
if(new URL(origin).protocol!=='https:')throw Error('Use the confirmed public HTTPS origin.');
const output=process.argv[3]||path.join(root,'work/advanced-native-full-20261016/qa/live-public-smoke');
const playwright=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const imported=index.filter(l=>l.number>10),newPicks=[imported[0],imported[Math.floor(imported.length/2)],imported.at(-1)];
const samples=await Promise.all([index.find(l=>l.id==='advanced-native-001'),index.find(l=>l.id==='advanced-native-010'),...newPicks].map(l=>hydrateModule(l.id)));
const metadata=JSON.parse(await fs.readFile(path.join(root,'natural-english/audio/advanced-metadata.json'),'utf8'));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const watched=['advanced-native.html','natural-english.html','natural-english/app.mjs','natural-english/catalogue.mjs','natural-english/advanced-expressions.mjs','natural-english/advanced-loader.mjs','natural-english/advanced-imported.generated.mjs','natural-english/advanced-targets.generated.mjs','natural-english/advanced-display.mjs','natural-english/style.css','advanced-native/style.css','natural-english/audio/manifest.mjs'];
const expected=Object.fromEntries(await Promise.all(watched.map(async f=>[f,hash(await fs.readFile(path.join(root,f)))])));
await fs.mkdir(output,{recursive:true});
const report={origin,started:new Date().toISOString(),expectedIndexedLessons:index.length,expectedStandardNativeLessons:466,sampledNewLessons:newPicks.map(l=>({id:l.id,number:l.number,title:l.titleEn})),baselineSamples:['advanced-native-001','advanced-native-010'],scope:'Actual public HTML/runtime/index/shards/MP3 retrieval and native audio events; synthetic Supabase Auth/RPC and header identity only. No real student sign-in/writes; no human hearing or physical-device claim.',expectedLocalSha256:expected,runs:[],assets:[],media:[],issues:[],physicalDeviceReviewClaimed:false,humanHearingClaimed:false,realStudentWrites:false};
const assetMap=new Map(),mediaMap=new Map(),requestedAssetUrls=new Set();let activePage=null;
async function checkpoint(){await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2)+'\n');}
function localPathFor(url){const u=new URL(url);return u.origin===new URL(origin).origin?decodeURIComponent(u.pathname).replace(/^\//,''):null;}
async function checkedAudio(context,url,lesson,text){
 if(mediaMap.has(url))return mediaMap.get(url);
 const response=await context.request.get(url),bytes=await response.body(),row=metadata[lesson.id]?.find(r=>r.text===text);
 const item={url,status:response.status(),contentType:response.headers()['content-type'],bytes:bytes.length,sha256:hash(bytes),expectedSha256:row?.sha256||null,lesson:lesson.id,text};
 item.matchesPinnedSha256=!!row&&item.sha256===row.sha256;report.media.push(item);mediaMap.set(url,item);
 assert.equal(item.status,200,'Public MP3 retrieval failed: '+url);assert.ok(item.bytes>1800,'Public MP3 is empty/too small');assert.match(item.contentType||'',/audio|octet-stream/);assert.ok(item.matchesPinnedSha256,'Public MP3 does not match frozen metadata pin: '+url);return item;
}
async function click(page,locator,mobile){await locator.evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));if(mobile)await locator.tap();else await locator.click();}
async function login(page,url){await page.goto(url,{waitUntil:'networkidle'});if(await page.locator('[data-login-form]').isVisible()){await page.locator('[name=username]').fill('Public Release Smoke');await page.locator('[name=password]').fill('synthetic-only');await page.locator('[data-login-form] [type=submit]').click();}await page.locator('[data-module]').first().waitFor();}
async function open(page,lesson,mobile){await click(page,page.locator(`[data-module="${lesson.id}"]`),mobile);await page.waitForFunction(label=>document.querySelector('[data-lesson-kicker]')?.textContent===label,`第 ${lesson.number} 課`);assert.ok(await page.locator('[data-lesson-view]').isVisible());}
async function actualPlayback(page,context,lesson,text,locator,mobile,label,availability){
 const url=new URL(audioManifest[lesson.id]?.[text]||'',origin+'/').href;assert.ok(audioManifest[lesson.id]?.[text],'Missing frozen media mapping');await checkedAudio(context,url,lesson,text);
 await click(page,locator,mobile);
 const observation={label,lesson:lesson.id,url,slow:await locator.getAttribute('data-slow')!==null,nativeMetadata:false,nativeTimeupdate:false};
 try{
  await page.waitForFunction(src=>window.__liveAudio.some(a=>(a.el.currentSrc||a.el.src)===src&&a.el.readyState>=1&&a.el.duration>0),url,{timeout:12000});observation.nativeMetadata=true;
  if(!availability.nativePlaybackUnavailable){await page.waitForFunction(src=>window.__liveAudio.some(a=>(a.el.currentSrc||a.el.src)===src&&a.el.currentTime>.05&&a.events.some(e=>e.type==='timeupdate')),url,{timeout:10000});observation.nativeTimeupdate=true;}else observation.limitation='Native progression was unavailable earlier in this same context; not repeatedly awaited.';
 }catch(e){observation.limitation=e.message.split('\n')[0];availability.nativePlaybackUnavailable=true;}
 const state=await page.evaluate(src=>{const a=window.__liveAudio.find(a=>(a.el.currentSrc||a.el.src)===src);return a?{duration:a.el.duration,currentTime:a.el.currentTime,rate:a.el.playbackRate,paused:a.el.paused,error:a.el.error?{code:a.el.error.code,message:a.el.error.message}:null,events:a.events.slice(-12)}:null;},url);observation.state=state;
 if(state?.error)throw Error('Native public media element error: '+JSON.stringify(state.error));
 if(observation.nativeTimeupdate)assert.equal(state.rate,observation.slow?.75:1);
 return observation;
}
try{
 for(const engine of ['chromium','webkit']){
  const browser=await playwright[engine].launch({headless:true});
  try{for(const mobile of [false,true]){
   const run={engine,viewport:mobile?{width:390,height:844}:{width:1280,height:1000},mobileEmulation:mobile,activation:mobile?'native touch tap':'ordinary pointer click',checks:[],lessons:[],audio:[],pageErrors:[],interceptedNetwork:[],syntheticRpc:[]};report.runs.push(run);
   const context=await browser.newContext({serviceWorkers:'block',viewport:run.viewport,isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'}),pending=[],assetErrors=[];
   await context.route('**/rest/v1/rpc/**',route=>{run.interceptedNetwork.push({url:route.request().url(),method:route.request().method(),kind:'synthetic-RPC-no-production-write'});return route.fulfill({status:200,contentType:'application/json',body:'[]'});});
   await context.addInitScript(()=>{
    window.__answerResults=[];window.__notes=0;window.__liveAudio=[];window.__syntheticRpc=[];window.__identityIntercepts=0;
    const NativeAudio=window.Audio;function ObservedAudio(...args){const el=new NativeAudio(...args),entry={el,events:[]};window.__liveAudio.push(entry);for(const type of ['loadedmetadata','canplay','playing','timeupdate','pause','ended','error'])el.addEventListener(type,()=>entry.events.push({type,time:el.currentTime,rate:el.playbackRate}));return el;}ObservedAudio.prototype=NativeAudio.prototype;window.Audio=ObservedAudio;
    document.addEventListener('edmund:answer-result',e=>window.__answerResults.push(e.detail.correct));const ac=window.AudioContext||window.webkitAudioContext;if(ac){const create=ac.prototype.createOscillator;ac.prototype.createOscillator=function(...args){window.__notes++;return create.apply(this,args);};}
    const nativeFetch=window.fetch;window.fetch=function(input,init){const url=typeof input==='string'?input:input?.url;if(url?.includes('/v1/learning-hub/identity')){window.__identityIntercepts++;return Promise.resolve(new Response('null',{status:200,headers:{'Content-Type':'application/json'}}));}return nativeFetch.call(this,input,init);};
    const id='346f7621-f726-42ae-93e7-efb9a3c654d4',token='8e6877b4-f899-460c-bb50-d55a1a7db3c5',events=new Map();
    const stub={createClient:()=>({auth:{getSession:async()=>({data:{session:{access_token:'synthetic-live-smoke'}}}),signInAnonymously:async()=>({data:{}})},rpc:(name,args)=>({abortSignal:async()=>{window.__syntheticRpc.push({name,eventCount:args.p_events?.length||0});let data=[];if(name==='flashcard_student_login')data=[{session_token:token}];else if(name==='flashcard_student_session_profile')data=[{id,name:'Public Release Smoke',session_token:token}];else if(name==='natural_english_modules_sync'){for(const e of args.p_events||[])events.set(e.id,e);data={events:[...events.values()],timeDays:[]};}return{data,error:null};}})})};
    // Keep the real CDN asset request while ensuring its global assignment cannot
    // replace the synthetic Auth/RPC client or start anonymous production auth.
    Object.defineProperty(window,'supabase',{configurable:true,get:()=>stub,set:()=>{}});
   });
   const page=await context.newPage();activePage=page;page.setDefaultTimeout(20000);page.on('pageerror',e=>run.pageErrors.push(e.message));
   page.on('response',response=>{const url=response.url(),relative=localPathFor(url);if(!relative||!(/\.(mjs|js|css|html)$/.test(new URL(url).pathname))||requestedAssetUrls.has(url))return;requestedAssetUrls.add(url);const job=(async()=>{const bytes=await response.body(),item={url,status:response.status(),bytes:bytes.length,sha256:hash(bytes),expectedSha256:expected[relative]||null,path:relative};if(relative.startsWith('natural-english/advanced-content/')){try{item.expectedSha256=hash(await fs.readFile(path.join(root,relative)));}catch{}}
    item.matchesExpected=item.expectedSha256?item.sha256===item.expectedSha256:null;assetMap.set(url,item);if(item.expectedSha256)assert.ok(item.matchesExpected,'Deployed asset differs from frozen local version: '+url);})();pending.push(job.catch(error=>assetErrors.push({url,message:error.message})));});
   await login(page,origin+'/natural-english.html');assert.equal(await page.locator('[data-module]').count(),466);assert.equal(await page.locator('[data-module="advanced-native-001"]').count(),0);run.checks.push('Standard Native retains466cards and course separation.');
   await login(page,origin+'/advanced-native.html');const ids=await page.locator('[data-module-grid] [data-module]').evaluateAll(es=>es.map(e=>e.dataset.module));assert.deepEqual(ids,index.map(l=>l.id));run.checks.push('All1893Advancedcards match exact frozen order and IDs.');
   for(const lesson of samples){
    const row={id:lesson.id,number:lesson.number,title:lesson.titleEn,sevenSteps:false,translations:0,glossaryRows:0,completed:false};run.lessons.push(row);await open(page,lesson,mobile);
    await click(page,page.locator('[data-back-modules]'),mobile);await open(page,lesson,mobile);row.reselected=true;
    for(const [n,step] of lesson.steps.entries()){
     await page.mouse.move(0,0);await page.keyboard.press('Escape');await click(page,page.locator(`[data-step="${n}"]`),mobile);
     if(n===0){run.audio.push(await actualPlayback(page,context,lesson,step.model,page.locator('[data-stage] [data-say]:not([data-slow])'),mobile,'listening normal',run));run.audio.push(await actualPlayback(page,context,lesson,step.model,page.locator('[data-stage] [data-slow]'),mobile,'listening slow',run));}
     const q=lesson.questions.find(q=>step.questions.includes(q.id));
     if(!q){run.audio.push(await actualPlayback(page,context,lesson,step.model,page.locator('[data-stage] [data-say]:not([data-slow])'),mobile,'speaking normal',run));await click(page,page.locator('[data-skip]'),mobile);assert.ok(await page.locator('.model .target-green').count());continue;}
     if(q.promptZh){assert.equal(await page.locator('h3 .sentence-translation').textContent(),`（${q.promptZh}）`);row.translations++;}
     if(q.type==='mc'){
      for(const [i,choice] of q.options.entries()){if(q.optionZh?.[choice]){assert.equal(await page.locator(`[data-q="${q.id}"][data-choice="${i}"] .sentence-translation`).textContent(),`（${q.optionZh[choice]}）`);row.translations++;}}
      if(n===0){const bad=q.options.find(o=>!q.answers.includes(o));await click(page,page.locator(`[data-q="${q.id}"][data-choice="${q.options.indexOf(bad)}"]`),mobile);assert.equal(await page.evaluate(()=>window.__answerResults.at(-1)),false);}
      if(q.allCorrect){const other=q.options.find(o=>o!==q.golden);await click(page,page.locator(`[data-q="${q.id}"][data-choice="${q.options.indexOf(other)}"]`),mobile);assert.equal(await page.locator(`[data-q="${q.id}"]:disabled`).count(),0);await click(page,page.locator(`[data-q="${q.id}"][data-choice="${q.options.indexOf(q.golden)}"]`),mobile);assert.equal(await page.locator(`[data-q="${q.id}"].golden`).count(),1);}else{await click(page,page.locator(`[data-q="${q.id}"][data-choice="${q.options.indexOf(q.answers[0])}"]`),mobile);assert.equal(await page.evaluate(()=>window.__answerResults.at(-1)),true);}
      if(n===0)assert.ok(await page.locator('.model .target-green').count());
     }else{
      assert.equal(await page.locator('.open-review').count(),0);const rows=await page.locator('.writing-glossary tbody tr').count();assert.equal(rows,q.glossary.length);const glossary=await page.locator('.writing-glossary tbody tr').evaluateAll(es=>es.map(e=>[...e.querySelectorAll('td')].map(td=>td.textContent)));const clean=x=>x.replace(/[\u200b\u2060]/g,'').replace(/\s+/g,' ').trim();assert.deepEqual(glossary.map(row=>row.map(clean)),q.glossary.map(row=>row.map(clean)));row.glossaryRows=rows;
      await page.locator('textarea').fill(q.answers[0]);await click(page,page.locator('[data-open-reveal]'),mobile);assert.ok(await page.locator('.open-review .target-yellow').count());for(const [i,a] of q.answers.entries()){assert.equal(await page.locator('.open-review li .sentence-translation').nth(i).textContent(),`（${q.answersZh[a]}）`);row.translations++;}await click(page,page.locator('[data-open-complete]'),mobile);
     }
    }
    row.sevenSteps=true;assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Public mobile/desktop content overflows viewport');assert.match(await page.locator('[data-count]').innerText(),/6 \/ 6/);await click(page,page.locator('[data-next]'),mobile);await page.locator('.finish').waitFor();assert.equal(await page.locator('.finish .takeaway').count(),2);
    for(const [i,text] of lesson.takeaways.entries()){assert.equal(await page.locator('.finish .takeaway').nth(i).getAttribute('data-say'),text);run.audio.push(await actualPlayback(page,context,lesson,text,page.locator('.finish .takeaway').nth(i),mobile,'takeaway'+(i+1),run));}
    row.completed=true;await page.locator('.finish h2').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));await page.screenshot({path:path.join(output,`${engine}-${mobile?'mobile':'desktop'}-${lesson.id}-complete.png`),fullPage:false});await click(page,page.locator('.finish [data-back-modules]'),mobile);await checkpoint();
   }
   const events=await page.evaluate(()=>({answers:window.__answerResults,notes:window.__notes,rpc:window.__syntheticRpc,identity:window.__identityIntercepts}));assert.ok(events.answers.includes(false)&&events.answers.includes(true)&&events.notes>0);run.soundEvents={correct:events.answers.filter(Boolean).length,wrong:events.answers.filter(x=>!x).length,oscillatorNotes:events.notes};run.syntheticRpc=events.rpc;run.identityIntercepts=events.identity;
   const assets=await Promise.allSettled(pending);const failures=assets.filter(r=>r.status==='rejected');assert.equal(failures.length,0,failures.map(r=>r.reason?.message).join('\n'));assert.equal(assetErrors.length,0,JSON.stringify(assetErrors));assert.deepEqual(run.pageErrors,[]);run.passed=true;await context.close();await checkpoint();
  }}catch(error){try{if(activePage&&!activePage.isClosed())await activePage.screenshot({path:path.join(output,engine+'-failure.png'),fullPage:false});}catch{}throw error;}finally{await browser.close();}
 }
}catch(error){report.issues.push({message:error.message,stack:error.stack});process.exitCode=1;}finally{report.assets=[...assetMap.values()];report.finished=new Date().toISOString();report.passed=!report.issues.length&&report.runs.length===4&&report.runs.every(r=>r.passed);report.realMediaTimeupdateChecks=report.runs.flatMap(r=>r.audio).filter(a=>a.nativeTimeupdate).length;report.realMediaLimitedChecks=report.runs.flatMap(r=>r.audio).filter(a=>!a.nativeTimeupdate).length;await checkpoint();console.log(JSON.stringify({output,passed:report.passed,runs:report.runs.length,issues:report.issues,publicAssets:report.assets.length,publicAudioFiles:report.media.length,realMediaTimeupdateChecks:report.realMediaTimeupdateChecks,realMediaLimitedChecks:report.realMediaLimitedChecks},null,2));}
