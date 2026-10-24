import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';import fs from 'node:fs';import {questions} from '../polysemy-lab/show.mjs';import {modules} from '../polysemy-lab/catalogue.mjs';
const {chromium,webkit}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT||'playwright');const engine=process.argv.includes('WebKit')?webkit:chromium;
const browser=await engine.launch({headless:true,...(engine===chromium?{args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']}: {})}),context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:900}}),page=await context.newPage(),errors=[],calls=[],stores=new Map();let offline=false;const recordings=new Map();
const out='/tmp/polysemy-lab-qa';fs.mkdirSync(out,{recursive:true});page.on('pageerror',e=>errors.push(e.message));
const student={id:'11111111-1111-4111-8111-111111111111',name:'Homework Student',role:'student',session_token:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'};
// Only the test response removes SRI so the isolated SDK stub can run; production retains SRI.
await context.route('**/polysemy-lab.html*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace(/ integrity="[^"]+"/g,'')});});
await context.route('**/supabase.min.js',route=>route.fulfill({contentType:'application/javascript',body:`window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'transport'}}}})},rpc:(name,args)=>({abortSignal:signal=>fetch('https://ookkxzgpdclzrrhfmvqx.supabase.co/rest/v1/rpc/'+name,{method:'POST',body:JSON.stringify(args),signal}).then(async r=>({data:r.ok?await r.json():null,error:r.ok?null:{message:'Synthetic offline'}}))})})};`}));
await context.route('https://edmund-speaking-system.edmundeducation.workers.dev/**',r=>r.fulfill({json:{}}));
await context.route('**/rest/v1/**',async route=>{const name=route.request().url().split('/').at(-1),args=route.request().postDataJSON()||{};calls.push({name,args});if(name==='flashcard_student_login')return route.fulfill({json:args.p_name==='homework'&&args.p_password==='correct'?[student]:[]});if(name==='flashcard_student_session_profile')return route.fulfill({json:args.p_token===student.session_token?[student]:[]});
 if(name==='polysemy_lab_modules_recording'){if(offline)return route.fulfill({status:503,json:{}});const p=args.p_payload;if(args.p_action==='save'){recordings.set(p.id,{...p,at:new Date().toISOString()});return route.fulfill({json:{saved:true}});}if(args.p_action==='list')return route.fulfill({json:[...recordings.values()].map(({audio,...r})=>r)});if(args.p_action==='get')return route.fulfill({json:recordings.get(p.id)});}
 if(name==='polysemy_lab_modules_sync'){if(offline)return route.fulfill({status:503,json:{message:'Synthetic offline'}});const all=stores.get(args.p_token)||[];for(const e of args.p_events||[])if(!all.some(x=>x.id===e.id||e.kind==='view'&&x.kind==='view'&&x.sense===e.sense||e.kind==='answer'&&x.kind==='answer'&&x.run===e.run&&x.round===e.round&&x.question===e.question))all.push(e);stores.set(args.p_token,all);const map=new Map();all.filter(e=>e.kind==='time').forEach(e=>{const d=new Date(e.at).toISOString().slice(0,10);map.set(d,(map.get(d)||0)+e.seconds);});return route.fulfill({json:{events:all.filter(e=>e.kind!=='time'),timeDays:[...map].map(([date,seconds])=>({date,seconds}))}});}return route.fulfill({json:{}});
});

// Isolate this grading test from the separately tested milestone dialogue.
await context.route('**/eddy-first-question-dialogue.js*',r=>r.fulfill({contentType:'application/javascript',body:''}));
await context.route('**/eddy-five-streak-dialogue.js*',r=>r.fulfill({contentType:'application/javascript',body:''}));
await page.clock.install({time:new Date('2026-10-25T04:00:00Z')});
const spend=(await import('../polysemy-lab/content/spend.mjs')).default;
const labels=new Map([...spend.senses,...spend.mcqMeanings||[]].map(s=>[s.id,s.title]));
const base=process.env.POLYSEMY_QA_BASE||'http://127.0.0.1:8633';
for(const [i,text] of ['strength','three weeks','too much money','months working','a lot of energy'].entries()){
 const q=spend.questions.find(q=>q.en.includes(text));const run=crypto.randomUUID(),now=Date.now();
 stores.set(student.session_token,[{id:crypto.randomUUID(),kind:'start',module:'spend',run,at:new Date(now-100000).toISOString()},...spend.questions.filter(x=>x.id!==q.id).map((x,j)=>({id:crypto.randomUUID(),kind:'answer',module:'spend',run,question:x.id,choice:x.correctOption||x.sense,round:1,at:new Date(now-90000+j).toISOString()}))]);
 await page.goto(base+'/polysemy-lab.html?module=spend');
 if(await page.locator('[name=username]').isVisible()){
 await page.locator('[name=username]').fill('homework');await page.locator('[name=password]').fill('correct');await page.locator('[data-login-form] [type=submit]').click();}
 await page.locator('[data-app]').waitFor({state:'visible'});await page.getByText('已儲存至學生帳戶',{exact:true}).waitFor();
 await page.locator('[data-mode=practice]').click();await page.locator('.sentence').filter({hasText:q.en}).waitFor();
 assert.equal(await page.locator('[data-answer]').count(),q.options.length);assert.equal(await page.locator('.module-numbers strong').nth(2).innerText(),`${Math.min(...spend.questions.map(q=>q.options.length))}–${Math.max(...spend.questions.map(q=>q.options.length))}`);
 const answer=q.correctOption||q.sense;const chosen=i%2?answer:q.options.find(x=>x!==answer);
 await page.keyboard.press('Escape');await page.locator('[data-answer="'+chosen+'"]').click();
 assert.equal(await page.locator('.answer-grid .correct').count(),1);
 assert.equal(await page.locator('.answer-grid .wrong').count(),i%2?0:1);
 assert.ok((await page.locator('.feedback').innerText()).includes(labels.get(answer)));
 await page.clock.runFor(5000);await page.screenshot({path:out+'/fairness-'+i+'.png',fullPage:true});
 await page.evaluate(()=>{localStorage.clear();sessionStorage.clear();});
}
assert.deepEqual(errors,[]);await browser.close();console.log('PASS: all five reported sentences render their revised choices, give correct/wrong feedback, and sync using isolated test accounts.');
