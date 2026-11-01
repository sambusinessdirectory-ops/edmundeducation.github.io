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
await page.locator('#step-select').evaluate(select=>{select.value='4';select.dispatchEvent(new Event('change'));});
assert.equal(await page.locator('[data-build]').count(),4);
assert((await page.locator('#game-card h3').innerText()).includes('第 3–4 句'));
assert(await page.evaluate(()=>[...document.querySelectorAll('[data-build]')].every(button=>[...document.querySelectorAll('.word-bank td')].some(cell=>cell.textContent===button.textContent))));
for(let step=0;step<4;step++) await page.locator('[data-build="0"]').click();
await page.locator('[data-continue]').click();
assert((await page.locator('#game-card h3').innerText()).includes('從簡單說法拼回原文'));
assert.equal(await page.locator('.build-source .support-source').count(),1);
assert.equal(await page.locator('.simple-source').count(),1);
assert(await page.locator('.vocabulary-highlight').count()>0);
for(let step=0;step<4;step++) await page.locator('[data-build="0"]').click({force:true});
assert(await page.locator('[data-continue]').count());
assert.equal(await page.locator('.build-source .support-source').count(),1);
assert.equal(await page.locator('.simple-source').count(),1);
assert(await page.locator('.vocabulary-highlight').count()>0);
await page.locator('[data-stage="6"]').click();
const fontSizes=await page.evaluate(()=>['.structure-translation','.structure-card .support-source','.structure-card .structure-part','.structure-card .concept-card p'].map(selector=>parseFloat(getComputedStyle(document.querySelector(selector)).fontSize)));
assert(fontSizes[0]<fontSizes[1]&&fontSizes[1]<fontSizes[2]&&fontSizes[2]<fontSizes[3]);
assert(!(await page.locator('.concept-card').last().innerText()).includes('清楚陳述一項意思'));
await page.locator('[data-stage="9"]').click();
assert.equal(await page.locator('#step-select option').count(),4);
const remaining=await page.locator('.sentence-map [data-sequence]').count();
await page.locator('.sentence-map [data-sequence="0"]').click();
assert.equal(await page.locator('.sentence-map [data-sequence]').count(),remaining-1);
await page.locator('.sentence-map [data-undo]').click();
assert.equal(await page.locator('.sentence-map [data-sequence]').count(),remaining);
assert.equal((await page.locator('.sentence-map .sequence-card strong').first().innerText()),(await page.locator('.sentence-map .sequence-card strong').first().innerText()).toLowerCase());
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
console.log('PASS: paired real choices, highlighted reverse bridge, structure hierarchy, disappearing map card, hint retry and separate recordings.');
