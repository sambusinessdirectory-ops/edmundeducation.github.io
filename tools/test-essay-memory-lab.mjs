import assert from 'node:assert/strict';

const {chromium}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',route=>route.fulfill({contentType:'application/javascript',body:''}));
await page.addInitScript(()=>{
  sessionStorage.setItem('edmund-essay-memory-student-v1',JSON.stringify({id:'lab-qa',name:'Learner',role:'student',token:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'}));
  for(const offset of [0,-1]){
    const date=new Date();date.setDate(date.getDate()+offset);
    const key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    localStorage.setItem(`edmund-night-return-v1:seen:student:lab-qa:${key}`,'1');
  }
  localStorage.removeItem('edmund-night-return-v1:pending:student:lab-qa');
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null},error:null}),signInAnonymously:async()=>({data:{session:{user:{id:'anonymous'}}},error:null})},rpc:async(_name,args)=>({error:null,data:[{id:'lab-qa',name:'Learner',role:'student',session_token:args.p_token}]})})};
});
const base=process.env.MEMORY_QA_URL||'http://127.0.0.1:8764/essay-memorization.html';
await page.goto(`${base}?essay=opinion%3A3`);
await page.locator('body.memory-lab').waitFor();
assert.equal(await page.locator('.lab-shell').evaluate(node=>node.firstElementChild.classList.contains('play-area')),true);
assert.equal(await page.locator('.hero').isVisible(),false);
assert.equal(await page.locator('.lab-library').evaluate(node=>node.open),false);
assert.equal(await page.locator('.lab-tools').evaluate(node=>node.open),false);
assert.equal(await page.locator('.lab-source').evaluate(node=>node.open),false);
assert.equal(await page.locator('[data-stage]').count(),11);
assert.equal(await page.locator('.stage-rail').evaluate(node=>getComputedStyle(node).display),'flex');
assert.equal(await page.locator('.lab-audio-strip').isVisible(),false);
assert((await page.locator('#game-card').boundingBox()).y<1000);
assert((await page.locator('#game-card').boundingBox()).y<(await page.locator('.mission').boundingBox()).y);
if(process.env.MEMORY_QA_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.MEMORY_QA_SCREENSHOT_DIR}/memory-lab-desktop.png`});

await page.setViewportSize({width:390,height:844});
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
assert((await page.locator('.memory-header').boundingBox()).height<=70);
if(process.env.MEMORY_QA_SCREENSHOT_DIR)await page.screenshot({path:`${process.env.MEMORY_QA_SCREENSHOT_DIR}/memory-lab-phone.png`});
await page.locator('.lab-system-toggle').click();
await page.waitForFunction(()=>document.querySelector('.memory-header').getBoundingClientRect().height>100);
await page.locator('.lab-system-toggle').click();
await page.waitForFunction(()=>document.querySelector('.memory-header').getBoundingClientRect().height<=70);
await page.evaluate(()=>document.activeElement?.blur());
await page.keyboard.press('1');
assert((await page.locator('#feedback').textContent()).trim().length>0);
await page.locator('[data-stage="4"]').click();
assert.equal(await page.locator('[data-choice]').count(),4);
assert((await page.locator('.lab-session-kicker').textContent()).includes('PHASE 1/3'));
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
if(process.env.MEMORY_QA_SCREENSHOT_DIR){await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:`${process.env.MEMORY_QA_SCREENSHOT_DIR}/memory-lab-transfer.png`});await page.setViewportSize({width:390,height:844});}
await page.locator('[data-stage="7"]').click();
assert.equal(await page.locator('.lab-audio-strip').isVisible(),true);
assert((await page.locator('.lab-session-kicker').textContent()).includes('PHASE 3/3'));
await page.locator('#playback-speed').selectOption('0.75');
assert.equal(await page.locator('#playback-speed').inputValue(),'0.75');
await page.locator('.lab-tools > summary').click();
assert.equal(await page.locator('#font-size-button').isVisible(),true);
await page.locator('.lab-library-trigger').click();
assert.equal(await page.locator('.lab-library').evaluate(node=>node.open),true);
assert.equal(await page.locator('[data-memory-pathway-task]').count(),2);
assert.deepEqual(errors,[]);
await browser.close();
console.log('PASS: Cognitive Lab hierarchy, journey rail, on-demand tools, speaking speed, library access and mobile layout.');
