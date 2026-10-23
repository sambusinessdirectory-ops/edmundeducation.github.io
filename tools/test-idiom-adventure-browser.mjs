// Run a local static server at IDIOM_TEST_BASE_URL (default http://127.0.0.1:8765).
// Install Playwright, or set PLAYWRIGHT_MODULE to its importable module path.
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const {fileURLToPath}=await import('node:url');
const root=fileURLToPath(new URL('../',import.meta.url));
const base=process.env.IDIOM_TEST_BASE_URL||'http://127.0.0.1:8765';
assert.equal(new URL(base).hostname,'127.0.0.1','Browser fixture must use a local server; never a live student session.');
let source=await fs.readFile(root+'/idiom-system.js','utf8');
source=source.slice(0,source.lastIndexOf('initialise().catch'))+`
window.__gameTest={state,clearSession,openDashboard,openLesson,compassMcOptions,compassPracticeQuestions,getLesson,syncIdiomAdventure,showView};
window.__saved=[];
apiJson=async (path,opts)=>{if(opts?.method==='PUT'){if(window.__failSave)throw Error('simulated offline');const payload=JSON.parse(opts.body);window.__saved.push(payload);return {attempt:{id:path.split('/').pop(),...payload}};}return {attempts:[],bookmarks:[]};};
state.user={id:'adventure-test-a',name:'探險者',role:'student'};state.authToken='local-test';state.dashboardLoaded=true;
bindEvents();showView('dashboard');renderLessonChoices();
`;
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1360,height:1100},reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',async route=>{
 const u=new URL(route.request().url());
 if(u.hostname!=='127.0.0.1')return route.abort();
 if(u.pathname==='/idiom-system.js')return route.fulfill({contentType:'application/javascript',body:source});
 return route.continue();
});
await page.goto(base+'/idiom-system.html');
await page.locator('.ia-hub').waitFor();
await page.locator('[data-idiom-adventure]').screenshot({path:'/tmp/idiom-isles-hub-desktop.png'});
assert.equal(await page.locator('.ia-region').count(),6);
// All 138 lessons are reachable across the six region pickers.
let total=0;
for(let i=0;i<6;i++){await page.locator(`[data-ia-action="region"][data-value="${i}"]`).click();total+=await page.locator('[data-ia-lesson] option').count();}
assert.equal(total,138);
await page.locator('[data-ia-lesson]').selectOption({index:22});
await page.locator('[data-ia-action="companion"][data-value="tide"]').click();
await page.locator('.ia-hero [data-ia-action="start"]').click();
await page.locator('.ia-dialog[open]').waitFor();
assert.match(await page.locator('.ia-question-heading').innerText(),/138/);
await page.locator('[data-ia-action="skill"]').click();
assert.equal(await page.locator('.ia-answer.is-eliminated').count(),1);
assert.equal(await page.locator('.ia-answer:disabled').count(),1);
async function mc(){return page.evaluate(()=>{const t=window.__gameTest,a=JSON.parse(localStorage.getItem('edmund-idiom-isles-v1:'+t.state.user.id)).active,l=t.getLesson(a.lessonId),q=t.compassPracticeQuestions(l).find(q=>q.id===a.ids[a.index]);return t.compassMcOptions(q,l);});}
let m=await mc();
const bad=await page.locator('.ia-answer:not(:disabled)').evaluateAll((bs,correct)=>bs.map(b=>+b.dataset.value).find(i=>i!==correct),m.correctAt);
await page.locator(`[data-ia-action="answer"][data-value="${bad}"]`).click();
assert.match(await page.locator('.ia-feedback').innerText(),/發現一個線索/);
assert.equal(await page.evaluate(()=>window.__gameTest.state.exercise.correctIds.length),0);
await page.locator(`[data-ia-action="answer"][data-value="${m.correctAt}"]`).click();
await page.locator('[data-ia-action="next"]').waitFor();
assert.equal(await page.evaluate(()=>window.__saved.at(-1).result.correctIds.length),1);
await page.screenshot({path:'/tmp/idiom-isles-answer-desktop.png'});
await page.locator('[data-ia-action="next"]').click();
await page.keyboard.press('Escape');
assert.equal(await page.locator('.ia-dialog[open]').count(),0);
await page.waitForFunction(()=>document.querySelector('.ia-hero .ia-button')===document.activeElement);
// Reload and resume exact room and depleted support charge.
await page.reload();await page.locator('.ia-hub').waitFor();
await page.locator('.ia-hero [data-ia-action="resume"]').click();
assert.match(await page.locator('.ia-journey-caption').innerText(),/2 \/ 6/);
assert.match(await page.locator('[data-ia-action="skill"]').innerText(),/1 \/ 2/);
await page.setViewportSize({width:390,height:844});
await page.waitForFunction(()=>Math.abs(document.querySelector('.ia-dialog').getBoundingClientRect().top)<1);
await page.screenshot({path:'/tmp/idiom-isles-encounter-mobile.png'});
assert.ok(await page.evaluate(()=>document.querySelector('.ia-dialog').scrollWidth<=390));
for(let i=1;i<6;i++){m=await mc();await page.locator(`[data-ia-action="answer"][data-value="${m.correctAt}"]`).click();await page.locator('[data-ia-action="next"]').click();}
await page.locator('.ia-result').waitFor();
assert.match(await page.locator('.ia-result-stats').innerText(),/60/);
await page.screenshot({path:'/tmp/idiom-isles-result-mobile.png'});
await page.locator('[data-ia-action="finish"]').click();
await page.locator('.ia-hub').waitFor();
await page.locator('[data-idiom-adventure]').screenshot({path:'/tmp/idiom-isles-hub-mobile.png'});
assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('edmund-idiom-isles-v1:adventure-test-a')).runs),1);
// Account isolation and modal cleanup.
await page.locator('.ia-hero [data-ia-action="start"]').click();
await page.evaluate(()=>{const t=window.__gameTest;t.clearSession();t.state.user={id:'adventure-test-b',name:'B',role:'student'};t.state.authToken='b';t.state.dashboardLoaded=true;t.showView('dashboard');t.syncIdiomAdventure();});
assert.equal(await page.locator('.ia-dialog[open]').count(),0);
assert.match(await page.locator('.ia-player').innerText(),/0 XP/);
assert.ok(!await page.locator('body').evaluate(e=>e.classList.contains('ia-playing')));
// Save failure: do not award or complete until the account pipeline accepts the answer.
await page.locator('.ia-hero [data-ia-action="start"]').click();
await page.evaluate(()=>window.__failSave=true);
let failMc=await page.evaluate(()=>{const t=window.__gameTest,q=t.compassPracticeQuestions(t.getLesson())[0];return t.compassMcOptions(q,t.getLesson());});
await page.locator(`[data-ia-action="answer"][data-value="${failMc.correctAt}"]`).click();
await page.waitForFunction(()=>document.querySelector('.ia-feedback')?.textContent.includes('未能記錄'));
assert.equal(await page.locator('[data-ia-action="next"]').count(),0);
assert.equal(await page.locator('.ia-answer.is-wrong').count(),0);
assert.equal(await page.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('edmund-idiom-isles-v1:adventure-test-b')).records).reduce((n,r)=>n+r.xp,0)),0);
await page.evaluate(()=>window.__failSave=false);
await page.locator(`[data-ia-action="answer"][data-value="${failMc.correctAt}"]`).click();
await page.locator('[data-ia-action="next"]').waitFor();
await page.keyboard.press('Escape');
await page.locator('[data-ia-action="discard"]').click();
// Meaning and comparison skills both work; a trip only has two uses.
for(const id of ['moss','ember']){
 await page.locator(`[data-ia-action="companion"][data-value="${id}"]`).click();
 await page.locator('.ia-hero [data-ia-action="start"]').click();
 await page.locator('[data-ia-action="skill"]').click();
 assert.ok(await page.locator(id==='moss'?'.ia-clue':'.ia-answer mark').count()>0);
 if(id==='moss'){
  for(let j=0;j<2;j++){
   const choice=await mc();await page.locator(`[data-ia-action="answer"][data-value="${choice.correctAt}"]`).click();
   await page.locator('[data-ia-action="next"]').click();
   if(j===0)await page.locator('[data-ia-action="skill"]').click();
  }
  assert.ok(await page.locator('[data-ia-action="skill"]').isDisabled());
  await page.locator('[data-ia-action="sound"]').click();
  assert.equal(await page.locator('[data-ia-action="sound"]').getAttribute('aria-pressed'),'true');
 }

 await page.keyboard.press('Escape');await page.locator('[data-ia-action="discard"]').click();
}
assert.ok(await page.locator('.ia-float').evaluate(e=>getComputedStyle(e).animationName==='none'));
console.log(JSON.stringify({passed:true,reachableLessons:total,originalIdsSaved:true,resume:true,support:true,retry:true,completion:true,accountIsolation:true,errors},null,2));
assert.deepEqual(errors,[]);
await browser.close();
