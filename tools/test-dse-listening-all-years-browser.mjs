import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const base=process.env.STUDY_TEST_URL||'http://127.0.0.1:8774',output='/private/tmp/speaking-study-qa/dse-all-years';await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1200}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 await page.addInitScript(()=>{sessionStorage.setItem('edmund-listening-session-v1',JSON.stringify({id:'all-years-test',name:'Test',token:'test-token',role:'student'}));window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'auth-test'}}}})},rpc:async name=>({data:name==='flashcard_student_session_profile'?[{id:'all-years-test',name:'Test',session_token:'test-token'}]:[]})})};});
 for(const year of Array.from({length:13},(_,i)=>2012+i)){
  await page.goto(`${base}/listening-system.html?section=dse&year=${year}&task=1`,{waitUntil:'domcontentloaded'});
  await page.locator('.dse-digital-paper-frame').waitFor();
  assert.equal(await page.locator('[data-toggle-dse-layout]').count(),1,`${year} optional toggle`);
  assert.equal(await page.locator('.dse-layout-switch').count(),0,`${year} default is digital`);
  assert.ok(await page.locator('[data-dse-answer-q]').count()>0,`${year} answer controls`);
 }
 await page.goto(`${base}/listening-system.html?section=dse&year=2022&task=1`,{waitUntil:'domcontentloaded'});
 await page.locator('[data-dse-answer-q="1"]').waitFor();await page.waitForFunction(()=>document.querySelectorAll('[data-dse-reveal]').length===13);
 assert.ok(await page.locator('.digital-paper-translation:visible').count()>=8);
 assert.equal(await page.locator('.dse-2022-map').count(),1);
 await page.locator('[data-dse-answer-q="1"]').fill('December');await page.locator('[data-check-dse-task]').click();
 assert.match(await page.locator('[data-dse-paper-score]').textContent(),/1 \/ 13/);
 await page.locator('[data-toggle-dse-layout]').click();assert.equal(await page.locator('.dse-layout-switch').count(),1);
 await page.locator('[data-toggle-dse-layout]').click();await page.locator('.dse-digital-paper-frame').waitFor();
 await page.screenshot({path:`${output}/2022-task1-desktop.png`,fullPage:true});
 await page.goto(`${base}/listening-system.html?section=dse&year=2024&task=2`,{waitUntil:'domcontentloaded'});
 await page.locator('[data-dse-answer-q="13"]').waitFor();await page.waitForFunction(()=>document.querySelectorAll('[data-dse-reveal]').length===14);
 assert.equal(await page.locator('.dse-boat-diagram').count(),1);assert.ok(await page.locator('.digital-paper-translation:visible').count()>=10);
 await page.setViewportSize({width:390,height:844});await page.locator('.dse-digital-paper-frame').scrollIntoViewIfNeeded();await page.waitForTimeout(150);await page.screenshot({path:`${output}/2024-task2-mobile.png`,fullPage:false});
 assert.deepEqual(errors,[]);console.log('DSE digital paper browser: 2012–2024 default routing, 2022 checking/layout switch, 2024 translations and responsive rendering passed.');
}finally{await browser.close();}
