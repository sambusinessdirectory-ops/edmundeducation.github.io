import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1365,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.MEMORY_QA_URL || 'http://127.0.0.1:8633/essay-memorization.html');
await page.locator('[data-stage="6"]').click();
for(let i=0;i<22;i++){
 await page.locator('#step-select').selectOption(String(i));
 assert.equal(await page.locator('[data-choice]').count(),4);
 await page.locator('[data-choice="1"]').click();assert(await page.locator('#feedback').innerText());assert.equal(await page.locator('[data-continue]').count(),0);
 await page.locator('[data-choice="0"]').click();assert.equal(await page.locator('[data-continue]').count(),1);
 await page.waitForTimeout(50);assert.equal(await page.locator('#step-select').inputValue(),String(i));
}
await page.locator('[data-stage="9"]').click();assert(await page.locator('.speaking-text').innerText());assert(await page.locator('[data-speaking-done]').isDisabled());
await page.locator('[data-self-check="0"]').check();assert(await page.locator('[data-speaking-done]').isDisabled());await page.locator('[data-self-check="1"]').check();await page.locator('[data-speaking-done]').click();assert((await page.locator('#feedback').innerText()).includes('自我核對'));await page.locator('[data-continue]').click();
await page.reload();assert.equal(await page.locator('#step-select').inputValue(),'1');
await page.locator('[data-stage="10"]').click();assert.equal(await page.locator('.speaking-text').count(),0);await page.locator('[data-reveal-speaking]').click();assert(await page.locator('.speaking-text').innerText());await page.locator('[data-retry-speaking]').click();assert.equal(await page.locator('.speaking-text').count(),0);
await page.locator('[data-guided-help]').click();assert((await page.locator('#play-title').innerText()).includes('有提示'));
await page.locator('[data-stage="7"]').click();await page.locator('#step-select').selectOption('20');await page.locator('[data-reveal-speaking]').click();assert.equal(await page.locator('.speaking-text p').count(),16);assert.equal(await page.locator('[data-self-check]').count(),3);
// Inspect every round at mobile width for overflow and missing rendering.
await page.setViewportSize({width:390,height:844});
for(let stage=0;stage<11;stage++){
 await page.locator(`[data-stage="${stage}"]`).click();const count=await page.locator('#step-select option').count();
 for(let i=0;i<count;i++){
  await page.locator('#step-select').selectOption(String(i));
  assert((await page.locator('#game-card').innerText()).length>20);
  assert(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)),`Overflow stage ${stage}, round ${i}`);
 }
}
await page.locator('[data-stage="6"]').click();await page.locator('#game-card').scrollIntoViewIfNeeded();await page.screenshot({path:'/private/tmp/memory-structures-mobile-final.png'});
await page.setViewportSize({width:1365,height:1000});await page.screenshot({path:'/private/tmp/memory-structures-final.png'});
// Existing learners keep their answered original questions and original record.
await page.evaluate(()=>{localStorage.removeItem('edmund-essay80-memory-scaffold-v2');localStorage.setItem('edmund-essay80-memory-pilot-v1',JSON.stringify({stage:5,round:18,unlocked:6,solved:{'0:0':2,'5:3':2,'5:18':2}}));});await page.reload();
const migrated=await page.evaluate(()=>JSON.parse(localStorage.getItem('edmund-essay80-memory-scaffold-v2')));assert.equal(migrated.solved['0:0'],2);assert.equal(migrated.solved['8:3'],2);assert.equal(migrated.stage,5);assert(!migrated.completed);assert(await page.evaluate(()=>!!localStorage.getItem('edmund-essay80-memory-pilot-v1')));
assert.deepEqual(errors,[]);console.log('PASS: all 252 rounds render at mobile width; all 22 structure questions grade correctly; supported/blind/retell self-checks, explicit navigation, resume and old-progress migration.');await browser.close();
