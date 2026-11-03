import assert from 'node:assert/strict';

const {chromium}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',route=>route.fulfill({contentType:'application/javascript',body:''}));
await page.addInitScript(()=>{
  sessionStorage.setItem('edmund-essay-memory-student-v1',JSON.stringify({id:'pathway-qa',name:'Learner',role:'student',token:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'}));
  for(const offset of [0,-1]){
    const date=new Date();date.setDate(date.getDate()+offset);
    const key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    localStorage.setItem(`edmund-night-return-v1:seen:student:pathway-qa:${key}`,'1');
  }
  localStorage.removeItem('edmund-night-return-v1:pending:student:pathway-qa');
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null},error:null}),signInAnonymously:async()=>({data:{session:{user:{id:'anonymous'}}},error:null})},rpc:async(_name,args)=>({error:null,data:[{id:'pathway-qa',name:'Learner',role:'student',session_token:args.p_token}]})})};
});
const base=process.env.MEMORY_QA_URL||'http://127.0.0.1:8764/essay-memorization.html';
const noOverflow=async label=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${label}: horizontal overflow`);
const snapshot=async name=>{
  if(!process.env.MEMORY_QA_SCREENSHOT_DIR)return;
  await page.screenshot({path:`${process.env.MEMORY_QA_SCREENSHOT_DIR}/${name}.png`});
};

await page.goto(base);
await page.locator('.shell').waitFor({state:'visible'});
assert((await page.title()).includes('IELTS Model Essays'));
assert.equal(await page.locator('.memory-lessons').count(),0);
assert.equal(await page.locator('[data-memory-catalogue-search]').count(),0);
assert.equal(await page.locator('.setup-card').isVisible(),false);
assert.equal(await page.locator('.mission').isVisible(),false);
assert.equal(await page.locator('[data-memory-pathway-task]').count(),2);
assert((await page.locator('[data-memory-pathway-count]').innerText()).includes('288'));
await noOverflow('landing');

await page.locator('[data-memory-pathway-task="task-2"]').click();
assert.equal(await page.locator('[data-memory-pathway-type]').count(),5);
assert.equal(new Set(await page.locator('[data-memory-pathway-type]').evaluateAll(nodes=>nodes.map(node=>node.dataset.memoryPathwayTone))).size,5);
assert.equal(await page.locator('.memory-pathway-symbol').count(),5);
assert((await page.locator('[data-memory-pathway-count]').innerText()).includes('228'));
await snapshot('memory-types-phone');
if(process.env.MEMORY_QA_SCREENSHOT_DIR){await page.setViewportSize({width:1440,height:1000});await snapshot('memory-types-desktop');await page.setViewportSize({width:390,height:844});}
await page.locator('[data-memory-pathway-type="Opinion"]').click();
assert.equal(await page.locator('[data-memory-essay]').count(),24);
const firstEssay=page.locator('[data-memory-essay]').first();
assert.equal(await firstEssay.locator('.memory-essay-number strong').innerText(),'3');
assert.equal(await firstEssay.locator('.memory-essay-type strong').innerText(),'Opinions');
assert((await firstEssay.locator('.memory-essay-question').innerText()).includes('museums and galleries'));
assert.equal(new Set(await firstEssay.locator('.memory-essay-number,.memory-essay-type,.memory-essay-question').evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).backgroundColor))).size,3);
assert((await page.locator('[data-memory-pathway-count]').innerText()).includes('24 / 103'));
await snapshot('memory-essays-phone');
if(process.env.MEMORY_QA_SCREENSHOT_DIR){await page.setViewportSize({width:1440,height:1000});await snapshot('memory-essays-desktop');await page.setViewportSize({width:390,height:844});}
await page.locator('[data-memory-pathway-more]').click();
assert.equal(await page.locator('[data-memory-essay]').count(),48);
await noOverflow('Task 2 Opinions');
await page.locator('[data-memory-essay="opinion:3"]').click();
await page.locator('.mission').waitFor({state:'visible'});
await page.waitForFunction(()=>document.title.includes('Model Essay 3'));
assert((await page.title()).includes('Model Essay 3'));
await page.locator('[data-memory-pathway-task="task-2"]').click();
await page.locator('[data-memory-pathway-type="Opinion"]').click();
assert.equal(await page.locator('[data-memory-essay="opinion:3"][aria-current="page"]').count(),1);

await page.locator('[data-memory-pathway-go="home"]').click();
await page.locator('[data-memory-pathway-task="task-1"]').click();
assert.equal(await page.locator('[data-memory-pathway-type]').count(),7);
assert.equal(new Set(await page.locator('[data-memory-pathway-type]').evaluateAll(nodes=>nodes.map(node=>node.dataset.memoryPathwayTone))).size,7);
assert((await page.locator('[data-memory-pathway-count]').innerText()).includes('60'));
await page.locator('[data-memory-pathway-type="Bar Charts"]').click();
assert.equal(await page.locator('[data-memory-essay]').count(),8);
assert.equal(await page.locator('[data-memory-pathway-more]').isVisible(),false);
await page.setViewportSize({width:320,height:700});
await noOverflow('Task 1 Bar Charts mobile');
await page.locator('[data-memory-essay="task1-bar-charts:1"]').click();
await page.locator('.memory-task1-visual img').waitFor({state:'visible'});
assert.deepEqual(errors,[]);
await browser.close();
console.log('PASS: neutral 288-essay entrance, Task 1/Task 2 pathway, categories, pagination, deep links and mobile layout.');
