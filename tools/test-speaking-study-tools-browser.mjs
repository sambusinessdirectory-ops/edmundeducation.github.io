import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
const require=createRequire(import.meta.url);
const { chromium }=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const base=process.env.STUDY_TEST_URL||'http://127.0.0.1:8773';
const output=process.env.STUDY_QA_DIR||'/private/tmp/speaking-study-qa';await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1280,height:950}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());if(url.origin===base)return route.continue();
  if(url.hostname.includes('edmund-speaking-system'))return route.fulfill({json:url.pathname.endsWith('/student/me')?{student:{id:'test-student',name:'Test Student'},access:{}}:url.pathname.endsWith('/bookmarks')?{bookmarks:[]}:{}});
  return route.abort();
 });
 await page.addInitScript(()=>{
  sessionStorage.setItem('edmundSpeakingSessionV1',JSON.stringify({id:'test-student',name:'Test Student',role:'student',token:'test-token'}));
  window.testWords=[];
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'test-auth'}}}})},rpc:async(name,args)=>{
    if(name==='learning_word_set_bookmark'){const row={item_key:args.p_item_key,phrase:args.p_phrase,context_en:args.p_context_en,href:args.p_href};window.testWords=window.testWords.filter(x=>x.item_key!==row.item_key);window.testWords.push(row);return {data:[]};}
    if(name==='learning_word_list_bookmarks')return {data:window.testWords};return {data:[]};
  }})};
 });
 await page.goto(`${base}/speaking-system.html`,{waitUntil:'domcontentloaded'});
 await page.waitForTimeout(1200);
 // Exercise the actual speaking brush, route and bookmark page.
 await page.goto(`${base}/speaking-system.html?exercise=ielts-part-2-book-1-exercise-01`,{waitUntil:'domcontentloaded'});
 await page.locator('[data-speaking-pen]').waitFor();await page.locator('[data-speaking-pen]').click();
 for(const index of [0,1]){
  await page.evaluate(index=>{const paragraph=document.querySelectorAll('.response-en')[index];const text=paragraph.querySelector('[data-timing-index]')?.firstChild||paragraph.firstChild;const range=document.createRange();range.selectNodeContents(text);getSelection().removeAllRanges();getSelection().addRange(range);paragraph.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));},index);
  await page.waitForFunction(n=>window.testWords.length===n,index+1);
 }
 const saved=await page.evaluate(()=>window.testWords);assert.equal(saved.length,2);assert.ok(saved[1].href.includes('answer=1'));
 await page.locator('.speaking-brush-toolbar [data-go="bookmarks"]').click();await page.locator('.speaking-phrase-row').first().waitFor();
 assert.equal(await page.locator('.speaking-phrase-row').count(),2);
 await page.locator('[data-grip="0"]').focus();await page.keyboard.press('ArrowDown');
 assert.equal(await page.locator('.speaking-phrase-row strong').first().textContent(),saved[1].phrase);
 const grip=await page.locator('[data-grip="0"]').boundingBox(),second=await page.locator('[data-phrase-index="1"]').boundingBox();
 await page.mouse.move(grip.x+15,grip.y+15);await page.mouse.down();await page.mouse.move(second.x+25,second.y+second.height/2,{steps:10});await page.mouse.up();
 assert.equal(await page.locator('.speaking-phrase-row strong').first().textContent(),saved[0].phrase);
 await page.screenshot({path:`${output}/speaking-phrase-bookmarks.png`});
 const href=await page.locator('.speaking-phrase-row a').nth(1).getAttribute('href');await page.goto(href,{waitUntil:'domcontentloaded'});
 await page.locator('#speaking-answer-1').waitFor();assert.ok(await page.locator('#speaking-answer-1').isVisible());
 for(const [exercise,index] of [['ielts-part-1-book-1-accommodation',3],['ielts-part-3-book-1-exercise-01',5]]){
  await page.goto(`${base}/speaking-system.html?exercise=${exercise}&answer=${index}`,{waitUntil:'domcontentloaded'});
  await page.locator(`#speaking-answer-${index}`).waitFor();assert.ok(await page.locator(`#speaking-answer-${index}`).isVisible());
  await page.locator('[data-speaking-pen]').click();
  await page.evaluate(index=>{const paragraph=document.querySelector(`#speaking-answer-${index}`);const text=paragraph.querySelector('[data-timing-index]')?.firstChild||paragraph.firstChild;const range=document.createRange();range.selectNodeContents(text);getSelection().removeAllRanges();getSelection().addRange(range);paragraph.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));},index);
  await page.waitForFunction(()=>window.testWords.length===1);
 }
 // Mount the actual checklist in each exam mode, maintaining real script and styles.
 for(const mode of ['IELTS Part 1','IELTS Part 2','IELTS Part 3','DSE Group Discussion','DSE Individual Response']){
  await page.evaluate(mode=>{document.querySelector('[data-view-content]').innerHTML=`<article class="exam-practice-view ${mode.startsWith('DSE')?'dse-practice-view':''}"><header class="${mode.startsWith('DSE')?'dse-practice-header':'exam-progress-card'}">${mode}<time data-exam-elapsed-clock>00:00</time></header><section class="exam-question-card"><h1>Test question</h1></section><section class="${mode.startsWith('DSE')?'recorder-card':'exam-answer-recorder'}"></section></article>`;},mode);
  const notes=page.locator('[data-performance-notes]');await notes.fill(`Notes for ${mode}`);
  await assert.equal(await page.locator('[data-notes-status]').textContent(),'已儲存於此瀏覽器 · Saved in this browser');
  await page.locator('[data-performance-float]').click();await page.locator('[data-resize-corner=se]').waitFor();
  const panel=page.locator('[data-performance-indicator]');const before=await panel.boundingBox();
  await page.locator('[data-resize-corner=nw]').focus();await page.keyboard.press('ArrowLeft');
  const after=await panel.boundingBox();assert.ok(after.width>before.width);
  for(const c of ['ne','sw','se']){await page.locator(`[data-resize-corner=${c}]`).focus();await page.keyboard.press('ArrowLeft');}
  const head=await page.locator('#performance-indicator-title').boundingBox();const old=await panel.boundingBox();
  await page.mouse.move(head.x+15,head.y+10);await page.mouse.down();await page.mouse.move(head.x-85,head.y-40,{steps:8});await page.mouse.up();
  assert.ok((await panel.boundingBox()).x<old.x);
  if(mode==='IELTS Part 1')await page.screenshot({path:`${output}/speaking-notes-floating.png`});
  await page.locator('[data-performance-float]').click();assert.equal(await panel.getAttribute('style'),'');
  await page.evaluate(()=>{document.querySelector('[data-exam-elapsed-clock]').textContent='01:23';const panel=document.querySelector('[data-performance-indicator]');panel.remove();});
  await page.locator('[data-performance-notes]').waitFor();assert.equal(await page.locator('[data-performance-notes]').inputValue(),`Notes for ${mode}`);
 }
 // The digitised paper uses semantic layout, reconstructed illustrations and actual input controls.
 await page.evaluate(async()=>{const m=await import('./dse-listening-original-paper.mjs');window.paperAnswers=new Map();await m.openOriginalPaper({answers:window.paperAnswers,owner:'test-student',task:1});});
 await page.locator('[data-original-q="1"]').waitFor();assert.equal(await page.locator('.original-paper-page').count(),8);
 assert.equal(await page.locator('.digital-paper-page').count(),8);
 assert.equal(await page.locator('.original-paper-page > img').count(),0);
 assert.equal(await page.locator('.digital-paper-exhibit-table img').count(),2);
 assert.equal(await page.locator('.digital-paper-james > img').count(),1);
 assert.equal(await page.locator('[data-original-q]').evaluateAll(xs=>new Set(xs.map(x=>x.dataset.originalQ)).size),58);
 await page.locator('[data-original-q="1"]').fill('Space Invaders');
 await page.locator('[data-original-q="10"][value=A]').check();
 await page.locator('[data-original-q="40"][value=A]').check();await page.locator('[data-original-q="40"][value=C]').check();
 assert.equal(await page.evaluate(()=>window.paperAnswers.get(40)),'A,C');
 await page.locator('[data-paper-page]').selectOption('3');await page.screenshot({path:`${output}/listening-original-task1.png`});
 for(const n of ['4','5','6','7','8']){await page.locator('[data-paper-page]').selectOption(n);await page.screenshot({path:`${output}/listening-original-page-${n}.png`});}
 await page.locator('[data-paper-close]').click();
 assert.equal(await page.evaluate(async()=>{const m=await import('./dse-listening-original-paper.mjs');const map=new Map();m.restoreOriginalAnswers('test-student',map);return map.get(1);}), 'Space Invaders');
 assert.equal(await page.evaluate(async()=>{const m=await import('./dse-listening-original-paper.mjs');const map=new Map();m.restoreOriginalAnswers('another-student',map);return map.size;}),0);
 assert.deepEqual(errors,[]);console.log('All five mock modes: saved notes, drag, four corners and restore passed. Crisp digital paper: 8 semantic pages, 58 questions, reconstructed illustrations, controls, persistence and account isolation passed.');
} finally {await browser.close();}
