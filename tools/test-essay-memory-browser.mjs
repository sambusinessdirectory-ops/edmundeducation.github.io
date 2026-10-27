import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1365,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.MEMORY_QA_URL || 'http://127.0.0.1:8633/essay-memorization.html');
await page.evaluate(()=>{window.answerEvents=[];document.addEventListener('edmund:answer-result',e=>answerEvents.push(e.detail.correct));});
for(const stage of [6,11]){
 await page.locator(`[data-stage="${stage}"]`).click();
 const count=await page.locator('#step-select option').count();
 for(let i=0;i<count;i++){
  await page.locator('#step-select').selectOption(String(i));assert.equal(await page.locator('[data-choice]').count(),4);
  await page.locator('[data-choice="1"]').click();assert.equal(await page.locator('[data-continue]').count(),0);
  await page.locator('[data-choice="0"]').click();assert.equal(await page.locator('[data-continue]').count(),1);
 }
}
assert((await page.evaluate(()=>answerEvents)).includes(false));assert((await page.evaluate(()=>answerEvents)).includes(true));
await page.locator('[data-stage="0"]').click();const orders=new Set();for(let i=0;i<8;i++){await page.locator('#restart-round').click();orders.add(await page.locator('[data-choice]').evaluateAll(els=>els.map(e=>e.dataset.choice).join(',')));}assert(orders.size>1);
await page.locator('[data-stage="1"]').click();assert((await page.locator('[data-sequence="0"] strong').innerText()).includes('交代圖書館'));await page.locator('[data-sequence="0"]').click();assert((await page.locator('.sequence-slot.filled').innerText()).includes('交代圖書館'));
await page.locator('[data-stage="5"]').click();await page.locator('#step-select').selectOption('1');assert.equal(await page.locator('[data-build-prerequisite]').count(),1);await page.locator('[data-build-prerequisite]').click();
await page.locator('[data-build="1"]').click();assert.equal(await page.locator('.build-track .filled').count(),0);
for(let r=0;r<32;r++){
 await page.locator('#step-select').selectOption(String(r));let count=0;
 while(await page.locator('[data-build="0"]').count()){await page.locator('[data-build="0"]').click();assert(++count<50);}
 assert.equal(await page.locator('[data-continue]').count(),1);
}
await page.locator('[data-stage="7"]').click();await page.locator('#step-select').selectOption('20');let built=0;while(await page.locator('[data-build="0"]').count()){await page.locator('[data-build="0"]').click();assert(++built<200);}assert.equal(await page.locator('[data-continue]').count(),1);
await page.locator('[data-stage="9"]').click();assert(await page.locator('[data-speaking-done]').isDisabled());assert.equal(await page.locator('[data-play-chunk]').count(),1);
await page.locator('[data-stage="10"]').click();
for(let i=0;i<16;i++){await page.locator('#step-select').selectOption(String(i));assert((await page.locator('.speaking-text').innerText()).includes('＿'));assert(await page.locator('[data-speaking-done]').isDisabled());}
await page.evaluate(()=>document.dispatchEvent(new CustomEvent('edmund:recording-saved',{detail:{recordId:'wrong'}})));assert(await page.locator('[data-speaking-done]').isDisabled());
await page.evaluate(()=>document.dispatchEvent(new CustomEvent('edmund:recording-saved',{detail:{recordId:'essay80-10-15'}})));assert(!(await page.locator('[data-speaking-done]').isDisabled()));
await page.setViewportSize({width:390,height:844});let total=0;
for(let stage=0;stage<12;stage++){
 await page.locator(`[data-stage="${stage}"]`).click();const count=await page.locator('#step-select option').count();
 for(let i=0;i<count;i++){await page.locator('#step-select').selectOption(String(i));assert((await page.locator('#game-card').innerText()).length>20);assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`Overflow ${stage}:${i}`);total++;}
}
await page.locator('[data-stage="5"]').click();await page.locator('#game-card').scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/memory-active-mobile.png'});
await page.setViewportSize({width:1365,height:1000});await page.locator('[data-stage="3"]').click();await page.locator('#game-card').scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/memory-active-desktop.png'});
await page.evaluate(()=>{localStorage.removeItem('edmund-essay80-memory-active-v3');localStorage.setItem('edmund-essay80-memory-scaffold-v2',JSON.stringify({solved:{'0:0':2,'5:0':2,'8:3':2,'10:0':2}}));});await page.reload();const migrated=await page.evaluate(()=>JSON.parse(localStorage.getItem('edmund-essay80-memory-active-v3')));assert.equal(migrated.solved['0:0'],2);assert.equal(migrated.solved['8:3'],2);assert(!migrated.solved['5:0']);assert(!migrated.solved['10:0']);
assert.deepEqual(errors,[]);console.log(`PASS: ${total} rounds at mobile width, 38 application MCs, all 32 two-way rebuilds, whole-essay simple reconstruction, sound, randomization, recording gate and migration.`);await browser.close();
