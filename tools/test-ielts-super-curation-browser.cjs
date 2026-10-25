// Run tools/listening/preview-server.mjs with a public audio catalogue first.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const {curation}=await import(require('node:url').pathToFileURL(require('node:path').resolve(__dirname,'../ielts-practice2-curation-data.mjs')));const browser=await chromium.launch({headless:true});try{
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8768/listening-system.html?section=ielts&practice=2');await page.locator('.isc-launch').click();const root=page.locator('.isc');
await page.locator('[data-draft="1"]').fill('My own note');
assert.equal(await page.locator('.isc-generated.is-written').count(),0);
assert.equal(await page.locator('.isc-line .isc-evidence').count(),0);
await page.locator('[data-act="pins"]').click();assert.equal(await page.locator('.isc-pins button').count(),10);
assert.equal(await page.locator('.isc-transcript [data-resize-corner]').count(),4);
const seek=async time=>{await page.locator('[data-seek]').evaluate((el,time)=>{el.value=time;el.dispatchEvent(new Event('change',{bubbles:true}));},time);await page.waitForTimeout(100);};
for(const part of curation.parts){
 if(part.part!==1)await page.locator(`[data-part="${part.part}"]`).click();
 await page.waitForFunction(()=>document.querySelector('.isc audio').readyState>=2);
 for(const [i,c] of part.cues.entries()){
  // Seek is deliberately a learner action; it must never award a heard checkpoint.
  await seek(c.end-.6);
  assert.equal(await page.locator(`[data-generated="${c.question}"]`).innerText(),'');
  const scroll=await page.locator('.isc-transcript-body').evaluate(el=>{el.scrollTop=100;return el.scrollTop;});
  await page.locator('[data-act="next"]').click();
  await page.waitForFunction(q=>document.querySelector(`[data-generated="${q}"]`).classList.contains('is-written')&&!document.querySelector('[data-act="next"]').disabled,c.question,{timeout:8000});
  const audio=await page.locator('.isc audio').evaluate(a=>({time:a.currentTime,paused:a.paused}));assert.equal(audio.paused,true);assert.ok(Math.abs(audio.time-c.end)<.08,`${c.id} exact stop ${audio.time}`);
  assert.ok((await page.locator(`[data-generated="${c.question}"]`).innerText()).includes(c.answer));
  assert.equal(await page.locator('.isc-transcript-body').evaluate(el=>el.scrollTop),scroll,'no transcript autoscroll');
  assert.equal(await page.locator(`[data-count="${part.part}"]`).innerText(),`${i+1}/10`);
  console.log('PASS',c.id,c.end);
  if(i===0){await page.locator('[data-act="zh"]').click();assert.equal(await page.locator('.isc-zh:visible').count(),part.annotations.length);await page.locator('[data-act="zh"]').click();}
 }
 await page.screenshot({path:`/tmp/ielts-part${part.part}-complete.png`});
}
await page.locator('[data-part="1"]').click();await page.waitForFunction(()=>document.querySelector('.isc audio').readyState>=2);assert.equal(await page.locator('[data-draft="1"]').inputValue(),'My own note');
await seek(70);assert.equal(await page.locator('.isc-generated.is-written').count(),0);assert.equal(await page.locator('[data-draft="1"]').inputValue(),'My own note');
assert.equal(await page.locator('.isc-line .isc-evidence').count(),0,'future evidence removed');
await seek(999);assert.equal(await page.locator('[data-count="1"]').innerText(),'0/10');assert.equal(await page.locator('.isc audio').evaluate(a=>a.currentTime),curation.parts[0].cues[0].start);
for(const width of [1100,768,390]){await page.setViewportSize({width,height:844});await page.screenshot({path:`/tmp/ielts-curation-${width}.png`});const dims=await root.evaluate(el=>({scroll:el.scrollWidth,width:el.clientWidth}));assert.ok(dims.scroll<=dims.width+1,`${width} no horizontal overflow ${JSON.stringify(dims)}`);}
await page.locator('[data-act="close"]').click();assert.equal(await root.count(),0);assert.equal(await page.locator('body').evaluate(el=>el.style.overflow),'');assert.equal(await page.locator('.isc-launch').evaluate(el=>el.closest('[inert]')),null);
assert.deepEqual(errors,[]);console.log('PASS all 40 real-media stops, source marking, independent notes, rewind, part persistence, responsive widths, and cleanup');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
