import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {resolve,extname} from 'node:path';
import {createRequire} from 'node:module';
import {buildCourse,cleanProgress,emptyProgress,visibleEvidence,markedText} from '../reading-curation-core.mjs';
const root=resolve(import.meta.dirname,'..'),json=async p=>JSON.parse(await readFile(resolve(root,p),'utf8'));
const [data,article,analysis]=await Promise.all([json('reading-curation/2023-a.json'),json('dse-reading-data/dse-2023-a.json'),json('dse-reading-analysis/dse-2023-a/index.json')]);
const sourceBefore=JSON.stringify(article),steps=buildCourse(data,article,analysis),at=id=>steps.findIndex(s=>s.id===id);
assert.equal(createHash('sha256').update(await readFile(resolve(root,'dse-reading-data/dse-2023-a.json'))).digest('hex'),data.articleSha256);
assert.deepEqual(data.questions.map(q=>q.number),Array.from({length:22},(_,i)=>i+1));
assert.equal(data.sourceParagraphs.length,16);assert.equal(data.sourceParagraphs.flatMap(p=>p.sentences).length,62);
assert.equal(data.questions.flatMap(q=>q.units).length,44);
assert.equal(data.questions.flatMap(q=>q.units.flatMap(u=>u.evidence)).length,74);
assert.deepEqual(steps.filter(s=>s.kind==='analysis').map(s=>s.page),Array.from({length:287},(_,i)=>i+35));
for(const q of data.questions){
  assert.deepEqual(q.analysisPages,analysis.questions.find(a=>a.number===q.number).pages);
  for(const u of q.units){assert.ok(u.answer&&u.why&&u.evidence.length&&u.traps.length);for(const p of u.pages)assert.ok(q.analysisPages.includes(p));}
}
for(const p of data.sourceParagraphs){
  const text=article.paragraphs.find(x=>x.number===p.number).text;
  let previous=0;for(const s of p.sentences){assert.equal(text.slice(previous,s.start).trim(),'','No source text omitted between reading units');assert.equal(text.slice(s.start,s.end),s.text);previous=s.end;}
  assert.equal(text.slice(previous).trim(),'','No omitted paragraph tail');
}
assert.equal(visibleEvidence(data,steps,at('q1-attempt')).length,0);
assert.equal(visibleEvidence(data,steps,at('q1-history-e1')).length,1);
assert.ok(visibleEvidence(data,steps,at('q1-transfer')).length>1);
assert.equal(visibleEvidence(data,steps,at('q1-attempt')).length,0,'Rewinding removes future evidence');
assert.ok(visibleEvidence(data,steps,at('q21-not-good-verify-0')).filter(e=>e.used).some(e=>e.id==='q21-not-good-e1'));
assert.match(data.questions[20].units[0].answer,/A good example/);assert.match(data.questions[20].units[1].answer,/Not a good example/);
const clean=cleanProgress({...emptyProgress(data),current:'unknown',done:['q1-attempt','bad','q1-attempt'],drafts:{1:'hello',99:'drop'},preferences:{spotlight:'true'}},data,steps);
assert.deepEqual(clean.done,['q1-attempt']);assert.deepEqual(clean.drafts,{'1':'hello'});assert.equal(clean.current,'welcome');assert.equal(clean.preferences.spotlight,false);
assert.throws(()=>cleanProgress({version:'bad'},data,steps));
assert.equal(markedText('<script>',[]),'&lt;script&gt;');assert.equal(JSON.stringify(article),sourceBefore);
console.log(`Data QA: ${steps.length} steps; 62 complete reading units; 44 answer units; 74 exact evidence spans; 287 original analysis pages; both Q21 routes.`);
if(process.argv.includes('--data-only'))process.exit(0);
const require=createRequire(import.meta.url);
let chromium;try{({chromium}=require('playwright'));}catch{({chromium}=require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));}
const types={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp'};
const fixture=`<!doctype html><html lang="zh-Hant"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Reading curation QA</title><button id="launch">Open</button><script type="module">import {createReadingSuperCuration} from '/reading-super-curation.mjs';const a=await(await fetch('/dse-reading-data/dse-2023-a.json')).json();const reader=await createReadingSuperCuration({article:a,userId:'qa-test',onClose:()=>window.closedReader=true,onHome:()=>window.homeClicked=true});document.getElementById('launch').onclick=()=>reader.open(document.getElementById('launch'));window.ready=true;</script></html>`;
const server=createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(path==='/__curation-test'){res.setHeader('Content-Type','text/html');res.end(fixture);return;}const file=resolve(root,'.'+path);if(!file.startsWith(root+'/')){res.writeHead(403).end();return;}const bytes=await readFile(file);res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(bytes);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const goto=async(id)=>{await page.locator('.rc [data-rc-action=jump]').click();await page.locator(`.rc-modal [data-id="${id}"]`).click();};
try{
  await page.goto(base+'/__curation-test');await page.waitForFunction(()=>window.ready);await page.locator('#launch').click();
  assert.equal(await page.locator('.rc').getAttribute('open'),'');
  await page.screenshot({path:'/private/tmp/reading-curation-desktop-welcome.png'});
  await goto('q1-attempt');assert.equal(await page.locator('.rc-evidence-card').count(),0);assert.equal(await page.locator('.rc-source .rc-original-question').count(),1);
  await page.locator('.rc [data-rc-action=next]').click();await page.locator('.rc-modal>header [data-rc-action=dismiss]').click();
  await page.locator('[data-rc-draft]').fill('My initial reasoning: compare history, not length.');
  await page.locator('.rc [data-rc-action=next]').click();assert.equal(await page.locator('.rc-evidence-card').count(),1);
  assert.ok((await page.locator('.rc-source .rc-active').textContent()).length>5);
  await page.locator('.rc [data-rc-action=prev]').click();assert.equal(await page.locator('.rc-evidence-card').count(),0);assert.equal(await page.locator('[data-rc-draft]').inputValue(),'My initial reasoning: compare history, not length.');
  await goto('q6-if-reason');await page.screenshot({path:'/private/tmp/reading-curation-desktop-evidence.png'});
  const sourceBeforeVisit=await page.locator('.rc-source-scroll').evaluate(e=>e.scrollTop);
  await page.locator('.rc-evidence-card').first().click();assert.equal(await page.locator('.rc-modal[data-kind=source]').count(),1);
  const before=await page.locator('.rc-modal').boundingBox();await page.locator('.rc-modal>header').focus();await page.keyboard.press('ArrowRight');const after=await page.locator('.rc-modal').boundingBox();assert.ok(after.x>before.x);
  await page.locator('.rc-resize-se').focus();await page.keyboard.press('ArrowLeft');const smaller=await page.locator('.rc-modal').boundingBox();assert.ok(smaller.width<after.width);
  await page.locator('.rc-modal>header [data-rc-action=dismiss]').click();assert.equal(await page.locator('.rc-source-scroll').evaluate(e=>e.scrollTop),sourceBeforeVisit);
  await page.setViewportSize({width:390,height:844});await page.locator('[data-tab=source]').click();
  assert.ok(await page.locator('.rc-source-scroll').evaluate(p=>Math.abs(p.querySelector('[data-paragraph="4"]').getBoundingClientRect().top-p.getBoundingClientRect().top-12)<3),'Viewport reflow keeps the current source in view');
  await page.setViewportSize({width:1440,height:1000});
  await goto('q6-if-trap-0');assert.ok(await page.locator('[data-rc-teaching] .rc-rejected').isVisible());
  await page.locator('.rc [data-rc-action=prev]').click();assert.equal(await page.locator('[data-rc-teaching] .rc-rejected').count(),0);
  await goto('q21-good-answer');assert.match(await page.locator('.rc-answer').innerText(),/A good example/);
  await goto('q21-not-good-answer');assert.match(await page.locator('.rc-answer').innerText(),/Not a good example/);
  await goto('analysis-173');assert.match(await page.locator('.rc-original-analysis').innerText(),/speech verb/);await page.screenshot({path:'/private/tmp/reading-curation-original-analysis.png'});
  await page.locator('.rc [data-rc-action=reference]').first().click();assert.equal(await page.locator('.rc-page-link').count(),51);await page.locator('.rc-modal [data-page="173"]').click();assert.match(await page.locator('.rc-modal .deep-source-body').innerText(),/speech verb/);await page.locator('.rc-modal>header [data-rc-action=dismiss]').click();
  await goto('q21-not-good-verify-0');assert.ok(await page.locator('.rc-used').count()>0);await page.locator('.rc [data-rc-action=prev]').click();assert.equal(await page.locator('.rc-used[data-evidence-ids~="q21-not-good-e1"]').count(),0);
  await page.locator('.rc [data-rc-action=bookmark]').click();await page.locator('.rc [data-rc-action=done]').click();
  await page.locator('.rc [data-rc-action=close]').click();assert.equal(await page.evaluate(()=>window.closedReader),true);assert.equal(await page.evaluate(()=>document.activeElement.id),'launch');
  await page.reload();await page.waitForFunction(()=>window.ready);await page.locator('#launch').click();assert.match(await page.locator('.rc-position').innerText(),/Q21/);assert.match(await page.locator('.rc [data-rc-action=bookmark]').innerText(),/已加書籤/);
  await page.locator('.rc [data-rc-action=storage]').click();await page.locator('.rc-modal [data-rc-action=save-slot][data-slot="1"]').click();await page.locator('.rc-modal [data-rc-action=confirm-save-slot]').click();await page.locator('.rc-modal>header [data-rc-action=dismiss]').click();
  await goto('q1-attempt');assert.equal(await page.locator('[data-rc-draft]').inputValue(),'My initial reasoning: compare history, not length.');
  await page.locator('.rc [data-rc-action=storage]').click();await page.locator('.rc-modal [data-rc-action=load-slot][data-slot="1"]').click();await page.locator('.rc-modal [data-rc-action=restore]').click();assert.match(await page.locator('.rc-position').innerText(),/Q21/);
  await page.locator('.rc [data-rc-action=storage]').click();const downloading=page.waitForEvent('download');await page.locator('.rc-modal [data-rc-action=export]').click();const download=await downloading;const exported=JSON.parse(await readFile(await download.path(),'utf8'));assert.equal(exported.articleId,'dse-2023-a');assert.equal(exported.drafts['1'],'My initial reasoning: compare history, not length.');assert.ok(!JSON.stringify(exported).includes('test-only'));
  await page.locator('[data-rc-import]').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(exported))});await page.locator('.rc-modal [data-rc-action=restore]').click();assert.match(await page.locator('.rc-position').innerText(),/Q21/);
  // Malformed and incompatible imports must preserve current work.
  const savedBefore=await page.evaluate(()=>localStorage.getItem('edmund-reading-super:2023-a-super-curation-v1:qa-test'));
  await page.locator('.rc [data-rc-action=storage]').click();await page.locator('[data-rc-import]').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad')});await page.getByRole('heading',{name:'無法匯入這份進度'}).waitFor();assert.match(await page.locator('.rc-modal').innerText(),/現有進度沒有變更/);assert.equal(await page.evaluate(()=>localStorage.getItem('edmund-reading-super:2023-a-super-curation-v1:qa-test')),savedBefore);await page.locator('.rc-modal>header [data-rc-action=dismiss]').click();
  for(const width of [1100,768,390,720]){
    await page.setViewportSize({width,height:width===720?450:900});await goto('q13-audience-reason');
    if(width<=900)await page.locator('[data-tab=source]').click();
    assert.ok(await page.locator('.rc-source').isVisible());
    const alignment=await page.locator('.rc-source-scroll').evaluate(p=>{const t=p.querySelector('[data-paragraph="10"]');return t.getBoundingClientRect().top-p.getBoundingClientRect().top;});assert.ok(Math.abs(alignment-12)<3,`Current paragraph is in view at ${width}: ${alignment}`);
    assert.ok(await page.locator('.rc').evaluate(e=>e.scrollWidth<=e.clientWidth+1),`No viewport overflow at ${width}`);
    assert.ok(await page.locator('.rc-source').evaluate(e=>e.scrollWidth<=e.clientWidth+1),`Source fits at ${width}`);
    await page.screenshot({path:`/private/tmp/reading-curation-${width}.png`});
    if(width<=900){await page.locator('[data-tab=bank]').click();await page.locator('.rc-evidence-card').first().click();const box=await page.locator('.rc-modal').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1);await page.locator('.rc-modal>header [data-rc-action=dismiss]').click();await page.locator('[data-tab=guide]').click();}
  }
  // A failed local write is reported and never blocks navigation.
  await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('blocked','QuotaExceededError');};});
  await page.locator('.rc [data-rc-action=next]').click();assert.match(await page.locator('.rc-save').innerText(),/儲存失敗/);await page.locator('.rc [data-rc-action=prev]').click();
  const integrated=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await integrated.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'application/javascript',body:`window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'local-test'}}}})},rpc:async(name)=>({data:name==='flashcard_student_session_profile'?[{id:'local-test',name:'Local Test',session_token:'test-only'}]:name==='flashcard_student_login'?[{session_token:'test-only'}]:name.includes('translation')?null:[],error:null})})};`});
    if(url.hostname!=='127.0.0.1')return route.abort();
    if(url.pathname==='/reading-comprehension.html'){const r=await route.fetch();return route.fulfill({response:r,body:(await r.text()).replace(/ integrity="[^"]+"/g,'')});}
    return route.continue();
  });
  const app=await integrated.newPage();app.on('pageerror',e=>errors.push(e.message));
  await app.goto(base+'/reading-comprehension.html?view=dse&year=2023&section=A&article=dse-2023-a&curation=1');
  await app.locator('input[name=username]').fill('Local Test');await app.locator('input[name=password]').fill('test-only');await app.locator('[data-login-button]').click();
  await app.locator('.rc[open]').waitFor({timeout:20000});
  await app.screenshot({path:'/private/tmp/reading-curation-integrated.png'});
  await app.locator('.rc [data-rc-action=close]').click();assert.ok(await app.locator('[data-reading-super-entry]').isVisible());assert.ok(!app.url().includes('curation=1'));
  await app.locator('[name=q2]').fill('unfortunately');await app.locator('[data-reading-super-open]').click();await app.locator('.rc[open]').waitFor();await app.locator('.rc [data-rc-action=close]').click();assert.equal(await app.locator('[name=q2]').inputValue(),'unfortunately');
  await app.locator('[data-deep-analysis="2"]').click();await app.locator('.deep-reader[open]').waitFor();assert.match(await app.locator('.deep-comparison').innerText(),/unfortunately/);await app.keyboard.press('Escape');
  await app.goto(base+'/reading-comprehension.html?view=dse&year=2024&section=A&article=dse-2024-a');await app.locator('[data-question="1"]').waitFor();assert.ok(await app.locator('[data-reading-super-entry]').isHidden());assert.equal(await app.locator('.rc').count(),0);
  await integrated.close();
  const animated=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'no-preference'});await animated.goto(base+'/__curation-test');await animated.waitForFunction(()=>window.ready);await animated.locator('#launch').click();await animated.locator('.rc [data-rc-action=jump]').click();await animated.locator('.rc-modal [data-id="q1-history-e1"]').click();await animated.locator('.rc [data-rc-action=prev]').click();await animated.waitForTimeout(1100);assert.equal(await animated.locator('.rc-source .rc-mark').count(),0,'No delayed ghost marks after Back during animation');await animated.close();
  assert.deepEqual(errors,[]);
  console.log('Browser QA passed: forward/back reveal, source visit/return, keyboard movement/resizing, complete original pages, two Q21 routes, notes/reload/bookmarks, malformed import, storage failure, 1440/1100/768/390 and 200%-equivalent viewport.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
