const {chromium}=require(process.env.PLAYWRIGHT_MODULE||process.env.HOME+'/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {curation}=JSON.parse(fs.readFileSync(path.join(__dirname,'../dse-curation-data/2018.json')));
(async()=>{const b=await chromium.launch({headless:true});try{const p=await b.newPage({viewport:{width:1440,height:1000}});
 const key='edmund-dse-super-curation:fixture:dse2018-part-a';const saved={version:curation.version,id:curation.id,part:2,revealMode:'auto',parts:{}};
 for(const t of curation.parts)saved.parts[t.part]={completedIds:t.cues.map(c=>c.id),revealedIds:[],drafts:t.part===2?{17:'{"A4":"O"}'}:{}};
 await p.addInitScript(({key,saved})=>localStorage.setItem(key,JSON.stringify(saved)),{key,saved});await p.goto('http://127.0.0.1:8768/listening-system.html?section=dse&year=2018&task=2');await p.locator('.isc-launch').click();await p.locator('.isc').waitFor();await p.waitForFunction(()=>document.querySelector('.isc audio').readyState>=2);
 // Replay Q17: model route appears only after the animated text completes.
 const part=curation.parts[1],index=part.cues.findIndex(c=>c.question===17),cue=part.cues[index];await p.locator('[data-jump]').selectOption(String(index));await p.locator('[data-act="play"]').click();
 await p.locator('[data-seek]').evaluate((el,t)=>{el.value=t;el.dispatchEvent(new Event('change',{bubbles:true}));},cue.end-.18);await p.waitForFunction(()=>!document.querySelector('.isc audio').seeking);await p.locator('[data-act="next"]').click();await p.waitForFunction(()=>document.querySelector('.isc-teaching h2').textContent.includes('寫入'));
 assert.equal(await p.locator('[data-generated="17"] .isc-maze-solution').count(),0);await p.waitForFunction(()=>document.querySelector('[data-count="2"]').textContent==='4/13');assert.equal(await p.locator('[data-generated="17"] .isc-maze-solution').count(),1);assert.equal(await p.locator('.isc [data-dse-maze-q="17"][data-cell="A4"]').textContent(),'O');
 // Restore final progress, then hear each real outro; totals must not assume ten.
 await p.locator('.isc-settings summary').click();await p.locator('[data-import]').setInputFiles({name:'dse.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(saved))});await p.locator('[data-speed]').selectOption('3');
 for(const t of curation.parts){await p.locator(`button[data-part="${t.part}"]`).click();await p.waitForFunction(()=>document.querySelector('.isc audio').readyState>=2&&!document.querySelector('.isc audio').seeking);await p.locator('[data-act="next"]').click();await p.waitForFunction(total=>document.querySelector('.isc-teaching h2').textContent===`${total} 個答案，逐一有證據。`,t.cues.length,{timeout:20000});assert.ok(await p.locator('.isc audio').evaluate(a=>a.paused));}
 // A foreign save cannot replace DSE progress.
 await p.locator('[data-import]').setInputFiles({name:'ielts.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:curation.version,practice:2}))});await p.waitForFunction(()=>document.querySelector('[data-save-status]').textContent.includes('未能匯入'));assert.equal(await p.locator('[data-count="4"]').textContent(),'12/12');
 console.log('PASS DSE animated model maze, independent draft, four real outros with 13/13/13/12 totals, foreign import rejection.');
 await p.locator('[data-act="close"]').click();
 // The adapter blocks changed source material before creating a modal.
 const guarded=await b.newPage();await guarded.route('**/dse-curation-data/2018.json*',route=>route.fulfill({contentType:'application/json',body:JSON.stringify({...JSON.parse(fs.readFileSync(path.join(__dirname,'../dse-curation-data/2018.json'))),curation:{...curation,source:{...curation.source,guideSha256:'changed'}}})}));
 await guarded.goto('http://127.0.0.1:8768/listening-system.html?section=dse&year=2018&task=1');await guarded.locator('.isc-launch').click();await guarded.waitForFunction(()=>document.body.textContent.includes('題解書已更新'));assert.equal(await guarded.locator('.isc').count(),0);console.log('PASS changed source fails closed before timed playback.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
