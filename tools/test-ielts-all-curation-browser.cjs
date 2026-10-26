// Uses only the local fixture; no student accounts or database writes.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');const context={window:{}};for(const s of ['data','analysis','transcript','timings'])vm.runInNewContext(fs.readFileSync(path.join(root,`listening-practice-1-${s}.js`),'utf8'),context);
const w=context.window;const first={...w.EDMUND_IELTS_LISTENING_PRACTICE_1,practice:1,analysis:w.EDMUND_IELTS_LISTENING_PRACTICE_1_ANALYSIS,timings:w.EDMUND_IELTS_LISTENING_PRACTICE_1_TIMINGS};
(async()=>{const {curation:pilot}=await import(require('node:url').pathToFileURL(path.join(root,'ielts-practice2-curation-data.mjs')));const b=await chromium.launch({headless:true});const failures=[];let count=0,tracks=0;
const todo=process.env.PRACTICES?process.env.PRACTICES.split(',').map(Number):Array.from({length:20},(_,i)=>i+1);
try{await Promise.all(Array.from({length:Number(process.env.CONCURRENCY||3)},async()=>{while(todo.length){const n=todo.shift();const page=await b.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 const ledger=n===2?pilot:JSON.parse(fs.readFileSync(path.join(root,`ielts-curation-data/practice-${n}.json`)));const c=n===1?first:JSON.parse(fs.readFileSync(path.join(root,`assets/listening/practices/practice-${n}.json`)));
 await page.goto(`http://127.0.0.1:8768/listening-system.html?section=ielts&practice=${n}`);await page.locator('.isc-launch').click();await page.locator('.isc').waitFor();assert.match(await page.locator('.isc h1').textContent(),new RegExp(`Practice ${n} `));
 for(const part of ledger.parts){
  await page.locator(`button[data-part="${part.part}"]`).click();await page.waitForFunction(()=>{const a=document.querySelector('.isc audio');return a.readyState>=2&&!a.seeking},null,{timeout:60000});
  const metadata=await page.locator('.isc audio').evaluate(a=>({url:a.currentSrc,duration:a.duration}));assert.ok(Math.abs(metadata.duration-part.duration)<=1,`P${n}.${part.part} duration ${metadata.duration} vs ${part.duration}`);assert.equal(await page.locator('.isc-error').isVisible(),false,`P${n}.${part.part} media`);tracks++;
  for(let i=0;i<10;){const cue=part.cues[i];let end=i;while(end+1<10&&part.cues[end+1].end===cue.end)end++;
   await page.locator('[data-seek]').evaluate((el,t)=>{el.value=t;el.dispatchEvent(new Event('change',{bubbles:true}));},cue.end-.18);
   await page.waitForFunction(t=>Math.abs(document.querySelector('.isc audio').currentTime-t)<.05&&!document.querySelector('.isc audio').seeking,cue.end-.18);
   await page.locator('[data-act="next"]').click();await page.waitForFunction(({part,total})=>document.querySelector(`[data-count="${part}"]`).textContent===`${total}/10`,{part:part.part,total:end+1},{timeout:20000});
   assert.ok(await page.locator('.isc audio').evaluate(a=>a.paused));for(let k=i;k<=end;k++){assert.ok((await page.locator(`[data-generated="${part.cues[k].question}"]`).textContent()).length);count++;}i=end+1;
  }
  await page.locator('[data-reveal-mode]').selectOption('manual');assert.equal(await page.locator('.isc-generated.is-written').count(),0);assert.equal(await page.locator('.isc-bank output').textContent(),'0/10');
  for(const cue of part.cues){await page.locator(`.isc-note [data-reveal="${cue.question}"]`).click();assert.equal(await page.locator('.isc-authored-explanation').textContent(),c.analysis[cue.question].explanation,`P${n} Q${cue.question} exact explanation`);}
  assert.equal(await page.locator('.isc-generated.is-written').count(),10);await page.locator('[data-reveal-mode]').selectOption('auto');
  const images=c.parts[part.part-1].sourceBlocks?.filter(x=>x.type==='image')||[];
  if(images.length){await page.locator('.isc-original').evaluate(el=>el.open=true);for(const img of await page.locator('.isc-original img').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(el=>el.decode());}await page.locator('.isc-original').evaluate(el=>el.open=false);}
 }
 assert.deepEqual(errors,[]);console.log(`PASS Practice ${n}: 40 answers, 4 real audio tracks, grouped stops, manual reveals, exact explanations, source diagrams.`);
 if([1,3,20].includes(n)){await page.screenshot({path:`/tmp/ielts-all-practice-${n}.png`});await page.setViewportSize({width:390,height:844});await page.screenshot({path:`/tmp/ielts-all-practice-${n}-mobile.png`});}
}catch(e){failures.push(`Practice ${n}: ${e.stack}`);console.error(failures.at(-1));}finally{await page.close();}
}}));}finally{await b.close();}
console.log(`Checked ${count} answer stops and ${tracks} real recordings.`);if(failures.length)throw Error(failures.join('\n'));
})().catch(e=>{console.error(e);process.exit(1)});
