import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PROFESSIONAL_QA_PLAYWRIGHT||'/private/tmp/github-log-reader/node_modules/playwright');

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:900}});
const page=await context.newPage(),errors=[],calls=[];
page.on('pageerror',error=>errors.push(error.message));

const student={id:'11111111-1111-4111-8111-111111111111',name:'Progress Student',session_token:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'};
const answers=Array.from({length:28},(_,index)=>({
  question_key:`lesson-v2-021-${Math.floor(index/2)+1}-${index%2+1}`,
  attempts:1,mastered:true,last_choice:'A',last_correct:true,updated_at:'2026-11-06T01:00:00Z'
}));
let timeTotal=90000;
await context.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',route=>route.fulfill({contentType:'application/javascript',body:`
window.supabase={createClient:()=>({
 auth:{getSession:async()=>({data:{session:{user:{id:'transport'}}},error:null}),signInAnonymously:async()=>({data:{session:{user:{id:'transport'}}},error:null})},
 rpc:async(name,args)=>({data:await window.__qaRpc(name,args),error:null})
})};`}));
await page.exposeFunction('__qaRpc',(name,args)=>{
  calls.push({name,args});
  if(name==='flashcard_student_login')return [student];
  if(name==='flashcard_student_session_profile')return [student];
  if(name==='synonyms_important_list')return [];
  if(name==='synonyms_progress_overview')return [{module_id:'lesson-v2-021',answered:28,mastered:28}];
  if(name==='synonyms_progress_dashboard')return {activityDays:[{date:'2026-11-06',questions:28}],timeDays:[{date:'2026-11-06',totalMs:timeTotal}]};
  if(name==='synonyms_progress_record_time'){timeTotal+=args.p_duration_ms;return timeTotal;}
  if(name==='synonyms_important_record')return [];
  return [];
});

await page.clock.install({time:new Date('2026-11-06T08:00:00+08:00')});
const base=process.env.SYNONYMS_QA_BASE||'http://127.0.0.1:8647';
await page.goto(base+'/synonyms-system.html');
await page.locator('[name=username]').fill('progress');
await page.locator('[name=password]').fill('correct');
await page.locator('[data-login-form] button[type=submit]').click();

const nervous=page.locator('[data-module="lesson-v2-021"]');
await nervous.waitFor();
assert.equal(await nervous.locator('.syn-module-progress').innerText(),'已作答 28 / 28 題','home card must use canonical account totals before the module is opened');
assert.equal(calls.filter(call=>call.name==='synonyms_progress_overview').length,1,'homepage must request the account-wide module overview');
assert.equal(await page.locator('.syn-dashboard-card').count(),2);
assert.match(await page.locator('.syn-dashboard-card').first().innerText(),/28 題/);
assert.match(await page.locator('.syn-dashboard-card').nth(1).innerText(),/1 分 30 秒/);
await page.screenshot({path:'/private/tmp/synonyms-progress-dashboard-desktop.png',fullPage:true});
await page.locator('.syn-dashboard-panel').screenshot({path:'/private/tmp/synonyms-progress-dashboard-panel.png'});

await page.locator('[data-dashboard-range]').selectOption('30');
assert.equal(await page.locator('.syn-bar-chart').first().locator('.syn-bar-column').count(),30);
await page.clock.runFor(31000);
assert.ok(calls.some(call=>call.name==='synonyms_progress_record_time'&&call.args.p_duration_ms>=30000),'active visible study time is recorded');

await page.setViewportSize({width:390,height:844});
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'dashboard and module cards fit a phone viewport');
await page.screenshot({path:'/private/tmp/synonyms-progress-dashboard-mobile.png',fullPage:true});
await page.locator('.syn-dashboard-panel').screenshot({path:'/private/tmp/synonyms-progress-dashboard-panel-mobile.png'});
assert.deepEqual(errors,[]);
await browser.close();
console.log('PASS: Nervous renders 28/28 from the account overview before module hydration, both dashboards render, time records, and mobile layout fits.');
