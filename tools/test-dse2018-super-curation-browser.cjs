const {chromium}=require(process.env.PLAYWRIGHT_MODULE||process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {curation,content}=JSON.parse(fs.readFileSync(path.join(__dirname,'../dse-curation-data/2018.json')));
(async()=>{const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));try{
 await page.goto('http://127.0.0.1:8768/listening-system.html?section=dse&year=2018&task=1');
 await page.locator('.isc-launch').click();await page.locator('.isc').waitFor();assert.match(await page.locator('.isc h1').textContent(),/2018 DSE/);
 const seek=async t=>{await page.locator('[data-seek]').evaluate((el,t)=>{el.value=t;el.dispatchEvent(new Event('change',{bubbles:true}));},t);await page.waitForFunction(t=>Math.abs(document.querySelector('.isc audio').currentTime-t)<.05&&!document.querySelector('.isc audio').seeking,t);};
 for(const part of curation.parts){
  await page.locator(`button[data-part="${part.part}"]`).click();await page.waitForFunction(()=>{const a=document.querySelector('.isc audio');return a.readyState>=2&&!a.seeking},null,{timeout:60000});
  const total=part.cues.length;assert.equal(await page.locator('.isc-note').count(),total);assert.ok(await page.locator('.isc audio').evaluate((a,d)=>Math.abs(a.duration-d)<.1,part.duration));assert.equal(await page.locator('.isc-error').isVisible(),false);
  await page.locator('[data-reveal-mode]').selectOption('manual');
  const question=part.cues.find(c=>![17,18].includes(c.question)).question;await page.locator(`[data-draft="${question}"]`).fill(`my Task ${part.part} draft`);
  if(part.part===2){await page.locator('[data-dse-maze-q="17"][data-cell="A4"]').click();await page.locator('[data-dse-maze-q="17"][data-cell="B6"]').click();await page.locator('[data-dse-maze-q="17"][data-cell="B6"]').press('Enter');assert.equal(await page.locator('[data-dse-maze-q="17"][data-cell="B6"]').textContent(),'M');}
  for(let i=0;i<total;){const cue=part.cues[i];let end=i;while(end+1<total&&part.cues[end+1].end===cue.end)end++;
   await seek(cue.end-.18);await page.locator('[data-act="next"]').click();await page.waitForFunction(({part,count,total})=>document.querySelector(`[data-count="${part}"]`).textContent===`${count}/${total}`,{part:part.part,count:end+1,total},{timeout:15000});
   assert.ok(await page.locator('.isc audio').evaluate(a=>a.paused));for(let k=i;k<=end;k++)assert.equal(await page.locator(`[data-generated="${part.cues[k].question}"]`).textContent(),'','manual mode hides answers');i=end+1;
  }
  assert.equal(await page.locator('.isc-evidence,.isc-candidate,.isc-rejected').count(),2,'only static legend until reveal'); // legend has candidate/rejected; evidence legend uses mark
  assert.equal(await page.locator('.isc-transcript-body .isc-evidence,.isc-transcript-body .isc-rejected').count(),0);
  for(const cue of part.cues){await page.locator(`.isc-note [data-reveal="${cue.question}"]`).click();assert.equal(await page.locator('.isc-authored-explanation').textContent(),content.analysis[cue.question].explanation);assert.ok((await page.locator(`[data-generated="${cue.question}"]`).textContent()).startsWith(cue.answer));}
  assert.equal(await page.locator('.isc-bank output').textContent(),`${total}/${total}`);
  assert.equal(await page.locator(`[data-draft="${question}"]`).inputValue(),`my Task ${part.part} draft`);
  if(part.part===2){assert.equal(await page.locator('[data-dse-maze-q="17"][data-cell="A4"]').textContent(),'O');assert.equal(await page.locator('.isc-maze-solution').count(),2);await page.screenshot({path:'/tmp/dse2018-maze.png'});}
  await page.locator('.isc-original').evaluate(el=>el.open=true);for(const image of await page.locator('.isc-original img,.isc-context img').all())await image.evaluate(el=>el.decode());await page.locator('.isc-original').evaluate(el=>el.open=false);
  console.log(`PASS DSE Task ${part.part}: ${total} real-media answers, manual reveal, verbatim explanations, original figures, independent draft.`);
 }
 const key='edmund-dse-super-curation:fixture:dse2018-part-a';const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);assert.equal(saved.id,curation.id);assert.equal(Object.values(saved.parts).reduce((n,p)=>n+p.completedIds.length,0),51);
 await page.locator('button[data-part="3"]').click();await page.locator('.isc-note [data-reveal="32"]').click();await page.screenshot({path:'/tmp/dse2018-painting.png'});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/tmp/dse2018-mobile.png'});assert.ok(await page.locator('[data-act="back-five"]').isVisible());assert.ok(await page.locator('[data-act="forward-five"]').isVisible());
 await page.locator('[data-act="close"]').click();await page.reload();await page.locator('.isc-launch').click();await page.locator('.isc').waitFor();assert.equal(await page.locator('[data-count="4"]').textContent(),'12/12');assert.equal(await page.locator('[data-reveal-mode]').inputValue(),'manual');
 await page.locator('button[data-part="2"]').click();assert.equal(await page.locator('[data-dse-maze-q="17"][data-cell="A4"]').textContent(),'O');
 await page.locator('[data-act="back-five"]').click();assert.equal(await page.locator('[data-dse-maze-q="17"][data-cell="A4"]').textContent(),'O');
 await page.locator('[data-act="close"]').click();await page.locator('[data-dse-task-tab="2"]').click();assert.equal(await page.locator('[data-dse-maze-q="17"][data-cell="A4"]').textContent(),'','curation must not alter ordinary paper answers');assert.deepEqual(errors,[]);console.log('PASS year-specific persistence, maze drafts, rewind preservation, mobile controls and cleanup.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
