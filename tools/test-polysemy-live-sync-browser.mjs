import assert from 'node:assert/strict';
import {modules} from '../polysemy-lab/catalogue.mjs';
const {chromium}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT||'playwright');
const browser=await chromium.launch({headless:true});
const base=process.env.POLYSEMY_QA_BASE||'http://127.0.0.1:8647';
const store=[],calls=[],errors=[];
const student={id:'11111111-1111-4111-8111-111111111111',name:'Live lesson QA',role:'student'};
async function device(label){
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
 let offline=false;
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
 const a=await device('student'),b=await device('tutor');
 await b.page.locator('[data-tutor-view]').click();
 const tutorStart=calls.length;
 await a.page.locator('[data-mode=practice]').click();
 await b.page.locator('.sentence').waitFor();
 assert.equal(await b.page.locator('.sentence').innerText(),await a.page.locator('.sentence').innerText());
 assert.equal(await b.page.locator('[data-answer]:enabled').count(),0);
 async function answer(module,correct=true){
  const sentence=await a.page.locator('.sentence').innerText();
  const q=modules.find(m=>m.id===module).questions.find(q=>q.en.replace(/\s+/g,' ')===sentence.replace(/\s+/g,' '));assert.ok(q);
  const choice=correct?(q.correctOption||q.sense):q.options.find(x=>x!==(q.correctOption||q.sense));
  await a.page.locator(`[data-answer="${choice}"]`).click();return {sentence,choice};
 }
 const first=await answer('show');
 await b.page.locator('.feedback').waitFor();
 assert.equal(await b.page.locator('.sentence').innerText(),first.sentence);
 assert.equal(await b.page.locator('#practice-progress').evaluate(n=>n.value),1);
 await a.page.locator('[data-next]').click();
 // Unchanged polls must not replace the student's DOM or interrupt media.
 await a.page.locator('.sentence').evaluate(n=>n.dataset.stability='keep');
 await a.page.waitForTimeout(3500);
 assert.equal(await a.page.locator('.sentence').getAttribute('data-stability'),'keep');
 b.setOffline(true);const second=await answer('show',false);
 await b.page.locator('[data-sync].error').waitFor();
 b.setOffline(false);await b.page.locator('[data-sync-retry]').click();
 await b.page.waitForFunction(text=>document.querySelector('.sentence')?.textContent===text,second.sentence);
 assert.equal(await b.page.locator('.feedback.wrong').count(),1);
 // A new module/run automatically follows on the tutor's device.
 await a.page.locator('[data-back-modules]').click();await a.page.locator('[data-module=busy]').click();await a.page.locator('[data-mode=practice]').click();
 await b.page.waitForFunction(()=>document.querySelector('.module-heading h1').textContent==='busy');
 assert.equal(await b.page.locator('.sentence').innerText(),await a.page.locator('.sentence').innerText());
 const third=await answer('busy');await b.page.locator('.feedback').waitFor();assert.equal(await b.page.locator('.sentence').innerText(),third.sentence);
 await b.page.waitForTimeout(31000);
 assert.equal(calls.slice(tutorStart).filter(c=>c.label==='tutor').flatMap(c=>c.args.p_events).length,0,'watching must never write answers, views, starts or study time');
 assert.notEqual(calls.find(c=>c.label==='tutor').args.p_token,calls.find(c=>c.label==='student').args.p_token,'separate device sessions');
 for(const width of [1280,390,320]){await b.page.setViewportSize({width,height:900});assert.ok(await b.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 await b.page.screenshot({path:'/tmp/polysemy-live-sync-tutor.png',fullPage:true});
 await b.page.locator('[data-logout]').click();await b.page.locator('[data-login]').waitFor();
 const before=calls.filter(c=>c.label==='tutor').length;await b.page.waitForTimeout(3500);assert.equal(calls.filter(c=>c.label==='tutor').length,before);
 assert.deepEqual(errors,[]);
 console.log('PASS: separate sessions follow starts, answers, explanations, scores and module changes; offline recovery; stable DOM; read-only tutor/time; mobile layout; logout stops polling.');
}finally{await browser.close();}
