// Isolated fixture: verify source fidelity, manual reveal and five-second transport.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
(async()=>{
 const root=path.resolve(__dirname,'..');const {curation}=await import(require('node:url').pathToFileURL(path.join(root,'ielts-practice2-curation-data.mjs')));
 const content=JSON.parse(fs.readFileSync(path.join(root,'assets/listening/practices/practice-2.json')));
 const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8768/listening-system.html?section=ielts&practice=2');await page.locator('.isc-launch').click();await page.locator('.isc').waitFor();
 assert.equal(await page.locator('.isc-authored-explanation').count(),0);
 const restore=async(part,count,mode='auto',revealed=[])=>{await page.locator('[data-import]').setInputFiles({name:'progress.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:curation.version,practice:2,revealMode:mode,part:part.part,parts:{[part.part]:{completedIds:part.cues.slice(0,count).map(c=>c.id),revealedIds:revealed,drafts:{}}}}))});await page.waitForFunction(({n,count,mode})=>document.querySelector('.isc').dataset.part===String(n)&&document.querySelector(`[data-count="${n}"]`).textContent===`${count}/10`&&document.querySelector('[data-reveal-mode]').value===mode,{n:part.part,count,mode});};
 for(const part of curation.parts)for(let i=0;i<10;i++){
  await restore(part,i+1);assert.equal(await page.locator('.isc-authored-explanation').textContent(),content.analysis[part.cues[i].question].explanation);
 }
 console.log('PASS all 40 full explanations match the authored source exactly.');
 await restore(curation.parts[0],3,'manual');
 assert.equal(await page.locator('.isc-generated.is-written').count(),0);assert.equal(await page.locator('.isc-authored-explanation').count(),0);assert.equal(await page.locator('.isc-transcript-body .isc-evidence,.isc-transcript-body .isc-rejected,.isc-transcript-body .isc-candidate').count(),0);assert.equal(await page.locator('.isc-bank output').textContent(),'0/10');
 await page.locator('[data-draft="3"]').fill('my attempt');await page.locator('.isc-note [data-reveal="1"]').click();assert.equal(await page.locator('.isc-authored-explanation').textContent(),content.analysis[1].explanation);assert.equal(await page.locator('[data-generated="3"]').textContent(),'');
 await page.locator('.isc-note [data-reveal="3"]').click();assert.equal(await page.locator('.isc-authored-explanation').textContent(),content.analysis[3].explanation);assert.equal(await page.locator('[data-draft="3"]').inputValue(),'my attempt');assert.equal(await page.locator('[data-generated="2"]').textContent(),'');
 await page.locator('[data-act="close"]').click();await page.locator('.isc-launch').click();await page.locator('.isc').waitFor();assert.equal(await page.locator('[data-reveal-mode]').inputValue(),'manual');assert.equal(await page.locator('[data-generated="2"]').textContent(),'');assert.ok((await page.locator('[data-generated="3"]').textContent()).includes('shower'));
 await page.screenshot({path:'/tmp/ielts-authored-desktop.png'});
 await restore(curation.parts[0],0,'manual');await page.waitForFunction(()=>document.querySelector('.isc audio').readyState>=2);
 const seek=async t=>{await page.locator('[data-seek]').evaluate((el,t)=>{el.value=t;el.dispatchEvent(new Event('change',{bubbles:true}));},t);await page.waitForTimeout(200);};
 await seek(30);await page.locator('[data-act="back-five"]').click();assert.ok(Math.abs(Number(await page.locator('[data-seek]').inputValue())-25)<.1);await page.locator('[data-act="forward-five"]').click();assert.ok(Math.abs(Number(await page.locator('[data-seek]').inputValue())-30)<.1);assert.ok(await page.locator('.isc audio').evaluate(a=>a.paused));
 await seek(0);await page.locator('[data-act="back-five"]').click();assert.equal(Number(await page.locator('[data-seek]').inputValue()),0);
 await seek(curation.parts[0].cues[0].end-1);await page.locator('[data-act="forward-five"]').click();assert.ok(Number(await page.locator('[data-seek]').inputValue())<curation.parts[0].cues[0].end);assert.equal(await page.locator('[data-count="1"]').textContent(),'0/10');
 await page.locator('[data-act="next"]').click();await page.waitForFunction(()=>document.querySelector('[data-count="1"]').textContent==='1/10');assert.equal(await page.locator('[data-generated="1"]').textContent(),'');assert.ok(await page.locator('.isc audio').evaluate(a=>a.paused));assert.ok(await page.locator('.isc-note [data-reveal="1"]').isVisible());
 await page.locator('.isc-note [data-reveal="1"]').click();assert.equal(await page.locator('.isc-authored-explanation').textContent(),content.analysis[1].explanation);
 await page.locator('[data-act="next"]').click();await page.waitForFunction(()=>!document.querySelector('.isc audio').paused);await page.locator('[data-act="forward-five"]').click();await page.waitForFunction(()=>!document.querySelector('.isc audio').paused);await page.locator('[data-act="play"]').click();
 await page.locator('[data-act="back-five"]').click();assert.equal(await page.locator('[data-generated="2"]').textContent(),'');
 await restore(curation.parts[0],1,'manual');await page.setViewportSize({width:390,height:844});await page.locator('[data-act="back-five"]').waitFor({state:'visible'});await page.locator('[data-act="forward-five"]').waitFor({state:'visible'});await page.screenshot({path:'/tmp/ielts-try-first-mobile.png'});
 await page.locator('.isc-note [data-reveal="1"]').click();await page.locator('.isc-authored-explanation').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/ielts-authored-mobile.png'});
 assert.deepEqual(errors,[]);console.log('PASS manual pause, per-question reveal, previous-question explanation, draft retention, persistence, ±5s controls, bounds, playback preservation and mobile controls.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
