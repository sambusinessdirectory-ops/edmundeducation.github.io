import assert from 'node:assert/strict';
import {modules} from '../polysemy-lab/catalogue.mjs';
const {chromium}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT||'playwright');
const browser=await chromium.launch({headless:true});
const base=process.env.POLYSEMY_QA_BASE||'http://127.0.0.1:8647';
const store=[],calls=[],errors=[];
const student={id:'11111111-1111-4111-8111-111111111111',name:'Live lesson QA',role:'student'};
async function device(label){
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
 page.setDefaultTimeout(12000);page.setDefaultNavigationTimeout(12000);let offline=false;
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await context.route('**/polysemy-lab.html*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace(/ integrity="[^"]+"/g,'')});});
 await context.route('**/supabase.min.js',r=>r.fulfill({contentType:'application/javascript',body:`window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{}}})},rpc:(name,args)=>({abortSignal:signal=>fetch('/qa-rpc/'+name,{method:'POST',body:JSON.stringify(args),signal}).then(async r=>({data:r.ok?await r.json():null,error:r.ok?null:{message:'Offline'}}))})})};`}));
 await context.route('**/qa-rpc/**',async r=>{
  const name=r.request().url().split('/').at(-1),args=r.request().postDataJSON();
  if(name==='flashcard_student_login'||name==='flashcard_student_session_profile')return r.fulfill({json:[{...student,session_token:label+'-session'}]});
  if(name==='polysemy_lab_modules_sync'){
   calls.push({label,args});if(offline)return r.fulfill({status:503,json:{}});
   for(const e of args.p_events)if(!store.some(x=>x.id===e.id))store.push(e);
   return r.fulfill({json:{events:store.filter(e=>e.kind!=='time'),timeDays:[]}});
  }
  return r.fulfill({json:[]});
 });
 // Keep unrelated site widgets out of this focused test.
 await context.route('**/shared-system-nav.js*',r=>r.fulfill({body:'',contentType:'application/javascript'}));
 await context.route('**/eddy-*.js*',r=>r.fulfill({body:'',contentType:'application/javascript'}));
 await page.goto(base+'/polysemy-lab.html?module=show');
 await page.locator('[name=username]').fill('qa');await page.locator('[name=password]').fill('qa');await page.locator('[type=submit]').click();
 await page.waitForFunction(()=>!document.querySelector('[data-app]').hidden&&!document.querySelector('[data-app]').inert);
 return {page,context,setOffline:value=>{offline=value;}};
}
try{
 const a=await device('student'),b=await device('second-device');
 assert.equal(await a.page.locator('[data-tutor-view]').count(),0);
 await a.page.locator('[data-mode=practice]').click();
 await a.page.waitForFunction(()=>document.querySelector('[data-sync]').textContent==='已儲存至學生帳戶');
 // Entering practice fetches the shared run through the normal login sync.
 await b.page.evaluate(()=>window.dispatchEvent(new Event('focus')));
 await b.page.waitForTimeout(300);
 await b.page.locator('[data-mode=practice]').click();
 assert.equal(await b.page.locator('.sentence').innerText(),await a.page.locator('.sentence').innerText());
 async function answer(correct=true){
  const sentence=await a.page.locator('.sentence').innerText();
  const q=modules.find(m=>m.id==='show').questions.find(q=>q.en.replace(/\s+/g,' ')===sentence.replace(/\s+/g,' '));assert.ok(q);
  const choice=correct?(q.correctOption||q.sense):q.options.find(x=>x!==(q.correctOption||q.sense));
  await a.page.locator(`[data-answer="${choice}"]`).click();return {sentence,choice};
 }
 const first=await answer();await b.page.locator('.feedback').waitFor();
 assert.equal(await b.page.locator('.sentence').innerText(),first.sentence);
 assert.equal(await b.page.locator('#practice-progress').evaluate(n=>n.value),1);
 assert.equal(await b.page.locator('.feedback').innerText(),await a.page.locator('.feedback').innerText());
 assert.equal(await b.page.locator('[data-answer]:enabled').count(),0);
 // Unchanged polls preserve the explanation and media DOM until Next is pressed.
 await b.page.locator('.sentence').evaluate(n=>n.dataset.stability='keep');
 await b.page.waitForTimeout(3500);assert.equal(await b.page.locator('.sentence').getAttribute('data-stability'),'keep');
 await a.page.locator('[data-next]').click();await b.page.locator('.feedback').waitFor({state:'detached'});
 assert.equal(await b.page.locator('.sentence').innerText(),await a.page.locator('.sentence').innerText());
 b.setOffline(true);const second=await answer(false);await b.page.locator('[data-sync].error').waitFor();
 b.setOffline(false);await b.page.locator('[data-sync-retry]').click();await b.page.locator('.feedback.wrong').waitFor();
 assert.equal(await b.page.locator('.sentence').innerText(),second.sentence);
 // Next works from either device and does not add a scored answer.
 const answerCount=store.filter(e=>e.kind==='answer').length;
 await b.page.locator('[data-next]').click();await a.page.locator('.feedback').waitFor({state:'detached'});
 assert.equal(store.filter(e=>e.kind==='answer').length,answerCount);
 assert.equal(await b.page.locator('.sentence').innerText(),await a.page.locator('.sentence').innerText());
 await answer();await b.page.locator('.feedback').waitFor();
 // Returning from meanings preserves the shared explanation rather than skipping it.
 await b.page.locator('[data-mode=directory]').click();await b.page.locator('[data-mode=practice]').click();
 assert.equal(await b.page.locator('.feedback').innerText(),await a.page.locator('.feedback').innerText());
 for(const width of [1280,390,320]){await b.page.setViewportSize({width,height:900});assert.ok(await b.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await b.page.screenshot({path:'/tmp/polysemy-shared-feedback.png',fullPage:true});
 // Exercise left open but idle: one catch-up, then no two-second polling.
 await b.page.clock.install();await b.page.clock.fastForward(65000);await b.page.waitForTimeout(300);
 const count=()=>calls.filter(c=>c.label==='second-device').length;
 const idle=count();await b.page.clock.runFor(10000);await b.page.waitForTimeout(200);assert.equal(count(),idle,'idle polling slows down');
 // Leaving the module also stops fast polling and no longer accrues study time.
 await b.page.locator('[data-back-modules]').click();await b.page.waitForTimeout(300);
 const outside=count();await b.page.clock.runFor(15000);await b.page.waitForTimeout(200);assert.equal(count(),outside,'module catalogue does not poll intensively');
 await b.page.evaluate(()=>Object.defineProperty(document,'hidden',{configurable:true,get:()=>true}));
 const hidden=count();await b.page.clock.runFor(70000);await b.page.waitForTimeout(200);assert.equal(count(),hidden,'hidden page stops periodic calls');
 await b.page.evaluate(()=>delete document.hidden);await b.page.clock.resume();
 await b.page.locator('[data-logout]').click();await b.page.locator('[data-login]').waitFor();
 const before=count();await b.page.waitForTimeout(3500);assert.equal(count(),before);
 assert.deepEqual(errors,[]);
 console.log('PASS: normal devices share correct/wrong feedback and Next in both directions; unchanged DOM; offline recovery; responsive layout; idle/left-module/hidden/logout polling.');
}finally{await browser.close();}
