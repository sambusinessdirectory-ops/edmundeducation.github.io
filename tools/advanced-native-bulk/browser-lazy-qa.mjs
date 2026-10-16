// Local development QA only: synthetic accounts and intercepted RPC, never student records.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import advancedIndex from '../../natural-english/advanced-expressions.mjs';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const origin=process.argv[2]||'http://127.0.0.1:8769';
const output=process.argv[3]||'/private/tmp/advanced-native-lazy-browser-qa.json';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const watched=['natural-english/app.mjs','natural-english/catalogue.mjs','natural-english/advanced-loader.mjs','natural-english/advanced-expressions.mjs','natural-english/advanced-imported.generated.mjs','natural-english/advanced-targets.generated.mjs','advanced-native/style.css'];
async function fingerprint(){return Object.fromEntries(await Promise.all(watched.map(async f=>[f,crypto.createHash('sha256').update(await fs.readFile(path.join(root,f))).digest('hex')])));}
const before=await fingerprint();
const browser=await chromium.launch({headless:true});
const results=[];
async function context(){
 const ctx=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:1000}});
 await ctx.route('https://cdn.jsdelivr.net/**',route=>route.abort());
 await ctx.route('**/rest/v1/rpc/**',route=>route.fulfill({status:200,contentType:'application/json',body:'[]'}));
 await ctx.addInitScript(()=>{
  const student='f940019e-0588-4ab9-8b81-135b280a9066',token='46744942-d0cf-4823-92ba-b35581d407dc',events=new Map();
  window.__syntheticEvents=[];
  const nativeFetch=window.fetch;window.fetch=function(input,init){const url=typeof input==='string'?input:input?.url;if(url?.includes('/v1/learning-hub/identity'))return Promise.resolve(new Response('null',{status:200,headers:{'Content-Type':'application/json'}}));return nativeFetch.call(this,input,init);};
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{access_token:'synthetic-preview'}}}),signInAnonymously:async()=>({data:{}})},rpc:(name,args)=>({abortSignal:async()=>{
   let data=[];
   if(name==='flashcard_student_login')data=[{session_token:token}];
   else if(name==='flashcard_student_session_profile')data=[{id:student,name:'Lazy Content Preview',session_token:token}];
   else if(name==='natural_english_modules_sync'){for(const event of args.p_events||[])events.set(event.id,event);window.__syntheticEvents=[...events.values()];data={events:[...events.values()],timeDays:[]};}
   return {data,error:null};
  }})})};
 });
 return ctx;
}
async function login(page){
 await page.goto(origin+'/advanced-native.html',{waitUntil:'networkidle'});
 await page.locator('[name=username]').fill('Lazy Content Preview');await page.locator('[name=password]').fill('preview');await page.locator('[data-login-form] [type=submit]').click();
 await page.locator('[data-module="advanced-native-025"]').waitFor();
}
async function heldScenario(name,action,check){
 const ctx=await context(),page=await ctx.newPage();let release,requested;
 const gate=new Promise(resolve=>release=resolve),requestSeen=new Promise(resolve=>requested=resolve);
 await page.route('**/advanced-content/**',async route=>{requested();await gate;await route.continue();});
 await login(page);await page.locator('[data-module="advanced-native-011"]').click();await requestSeen;
 await action(page);release();
 // Await the already requested loader promise: an intercepted request can leave
 // the document's earlier networkidle state fulfilled before module evaluation.
 await page.evaluate(async()=>{const {loadAdvancedExpression}=await import('/natural-english/advanced-loader.mjs');await loadAdvancedExpression('advanced-native-011');});
 await check(page);results.push({case:name,passed:true});await ctx.close();
}
try{
 {
  const ctx=await context(),page=await ctx.newPage(),requests=[];
  page.on('request',request=>{if(request.url().includes('/advanced-content/'))requests.push(request.url());});
  await page.goto(origin+'/natural-english.html',{waitUntil:'networkidle'});assert.equal(requests.length,0,'Standard Native does not fetch new Advanced lesson payloads.');
  await login(page);assert.equal(requests.length,0,'Advanced library does not fetch full lesson payloads before selection.');
  const numbers=await page.locator('[data-module-grid] [data-module]').evaluateAll(nodes=>nodes.map(n=>n.dataset.module));
  assert.deepEqual(numbers,advancedIndex.map(lesson=>lesson.id),'Every indexed lesson stays discoverable and in source order.');
  await page.locator('[data-module="advanced-native-011"]').click();await page.locator('[data-stage] h2').waitFor();
  assert.equal(await page.locator('[data-lesson-kicker]').textContent(),'第 11 課');assert.equal(requests.length,1);
  await page.locator('[data-back-modules]').click();await page.locator('[data-module="advanced-native-012"]').click();await page.locator('[data-stage] h2').waitFor();
  assert.equal(requests.length,1,'A second lesson in the same shard reuses content.');
  results.push({case:'initial payload isolation, all cards/order, successful load and shared-shard cache',passed:true});await ctx.close();
 }
 {
  const ctx=await context(),page=await ctx.newPage();let attempts=0;
  await page.route('**/advanced-content/**',route=>++attempts===1?route.abort('failed'):route.continue());
  await login(page);await page.locator('[data-module="advanced-native-011"]').click();
  await page.locator('[data-module-load-status]').filter({hasText:'重試'}).waitFor();
  await page.locator('[data-module="advanced-native-011"]').click();await page.locator('[data-stage] h2').waitFor();
  assert.equal(attempts,2);assert.equal(await page.locator('[data-lesson-kicker]').textContent(),'第 11 課');
  results.push({case:'failed load remains usable and same-card retry succeeds',passed:true});await ctx.close();
 }
 await heldScenario('stale load cannot replace a newer selected lesson',async page=>{
  await page.locator('[data-module="advanced-native-012"]').click();
 },async page=>{assert.equal(await page.locator('[data-lesson-kicker]').textContent(),'第 12 課');assert.ok(!(await page.evaluate(()=>window.__syntheticEvents)).some(event=>event.kind==='start'&&event.module==='advanced-native-011'));});
 await heldScenario('stale load cannot reopen after logout',async page=>{
  await page.locator('[data-logout]').click();await page.locator('[data-login-form]').waitFor();
 },async page=>{assert.equal(await page.locator('[data-app]').isHidden(),true);assert.equal(await page.locator('[data-lesson-view]').evaluate(node=>node.hidden),true);assert.ok(!(await page.evaluate(()=>window.__syntheticEvents)).some(event=>event.kind==='start'&&event.module==='advanced-native-011'));});
 await heldScenario('search cancels pending navigation and keeps library visible',async page=>{
  await page.locator('[data-module-search]').fill('comfort');
 },async page=>{assert.equal(await page.locator('[data-library-view]').isVisible(),true);assert.equal(await page.locator('[data-lesson-view]').isHidden(),true);assert.equal(await page.locator('[data-module-grid] [data-module]').count(),advancedIndex.filter(l=>[String(l.number),l.titleZh,l.titleEn].some(value=>value.toLocaleLowerCase().includes('comfort'))).length);});
 {
  const ctx=await context(),page=await ctx.newPage();let release,requested;
  const gate=new Promise(resolve=>release=resolve),seen=new Promise(resolve=>requested=resolve);
  await page.route('**/advanced-content/**',async route=>{requested();await gate;await route.continue();});
  await login(page);await page.locator('[data-module="advanced-native-001"]').click();await page.locator('[data-back-modules]').click();
  await page.locator('[data-module="advanced-native-011"]').click();await seen;await page.goBack();
  release();await page.waitForLoadState('networkidle');assert.equal(await page.locator('[data-lesson-kicker]').textContent(),'第 1 課');
  results.push({case:'browser Back cancels a stale pending lesson',passed:true});await ctx.close();
 }
 const after=await fingerprint();assert.deepEqual(after,before,'Frozen runtime changed during lazy browser QA.');
 await fs.writeFile(output,JSON.stringify({stagedLessons:advancedIndex.length,runtimeSha256:before,runtimeUnchanged:true,syntheticSessionsOnly:true,realStudentWrites:false,physicalDeviceReviewClaimed:false,results},null,2)+'\n');
 console.log(`${results.length} lazy browser cases passed; ${output}`);
}finally{await browser.close();}
