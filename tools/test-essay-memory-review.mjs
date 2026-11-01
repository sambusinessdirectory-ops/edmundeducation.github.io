import assert from 'node:assert/strict';
const {chromium}=await import('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
await context.addInitScript(()=>{
  Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[{stop(){}}]})}});
  class FakeRecorder {
    static isTypeSupported(){return true}
    constructor(stream,options){this.stream=stream;this.mimeType=options?.mimeType||'audio/webm';this.state='inactive'}
    start(){this.state='recording'}
    stop(){this.state='inactive';this.ondataavailable?.({data:new Blob([new Uint8Array(1600)],{type:this.mimeType})});this.onstop?.()}
  }
  window.MediaRecorder=FakeRecorder;
});
const base=process.env.MEMORY_QA_BASE || 'http://127.0.0.1:8764';
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(`${base}/essay-memorization.html?essay=opinion%3A3`);
await page.locator('[data-stage="5"]').click();
assert.equal(await page.locator('[data-build]').count(),4);
await page.locator('[data-stage="9"]').click();
assert.equal(await page.locator('#step-select option').count(),4);
assert((await page.locator('.sentence-map .sequence-card').first().innerText()).includes('museum') || (await page.locator('.sentence-map .sequence-card').first().innerText()).includes('because'));
await page.locator('[data-stage="10"]').click();
assert((await page.locator('.phrase-options .sequence-card').count())>0);
await page.locator('[data-stage="8"]').click();
assert(await page.locator('.speaking-text').innerText().then(t=>t.includes('＿')));
await page.locator('[data-reveal-full]').click();
assert(!(await page.locator('.speaking-text').innerText()).includes('＿'));
await page.locator('[data-record-toggle]').click();
await page.waitForTimeout(780);
await page.locator('[data-record-toggle]').click();
await page.waitForFunction(()=>!document.querySelector('[data-speaking-done]').disabled);
await page.locator('[data-speaking-done]').click();
assert((await page.locator('#round-number').innerText()).includes('1 / 19'));
assert((await page.locator('.speaking-text').innerText()).includes('＿'));
assert(await page.locator('[data-speaking-done]').isDisabled());
await page.locator('[data-record-toggle]').click();
await page.waitForTimeout(780);
await page.locator('[data-record-toggle]').click();
await page.waitForFunction(()=>!document.querySelector('[data-speaking-done]').disabled);
await page.locator('[data-speaking-done]').click();
assert((await page.locator('#round-number').innerText()).includes('2 / 19'));
assert.equal(await page.locator('[data-edmund-record-id]').count(),0);
assert.deepEqual(errors,[]);
await page.goto(`${base}/essay-memory-recordings.html`);
assert.equal(await page.locator('.recording-item').count(),1);
assert((await page.locator('.recording-item h2').innerText()).includes('第 1 句'));
await browser.close();
console.log('PASS: four-option bridge, hint retry, second unhinted recording advances, separate local recording collection.');
