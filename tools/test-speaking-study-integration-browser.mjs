import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const base=process.env.STUDY_TEST_URL||'http://127.0.0.1:8773', out='/private/tmp/speaking-study-qa';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1280,height:950}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 await page.addInitScript(()=>{
  sessionStorage.setItem('edmund-listening-session-v1',JSON.stringify({id:'integration-student',name:'Test',token:'test-token',role:'student'}));
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'auth-test'}}}})},rpc:async(name)=>({data:name==='flashcard_student_session_profile'?[{id:'integration-student',name:'Test',session_token:'test-token'}]:[]})})};
 });
 await page.goto(`${base}/listening-system.html?section=dse&year=2016&task=1`,{waitUntil:'domcontentloaded'});
 await page.locator('.dse-digital-paper-frame').waitFor();
 assert.equal(await page.locator('.original-paper-dialog').count(),0);
 assert.equal(await page.locator('.digital-paper-page').count(),1);
 assert.equal(await page.locator('.digital-paper-page').getAttribute('id'),'original-paper-3');
 await page.locator('[data-dse-answer-q="1"]').fill('Ping Pong');
 await page.locator('[data-dse-answer-q="10"][value=B]').check();
 await page.locator('[data-dse-reveal="1"]').waitFor();
 assert.equal(await page.locator('[data-dse-digital-answer-dock]').count(),0);
 assert.ok(await page.locator('.digital-paper-translation').count()>20);
 await page.locator('.digital-paper-page .pos-guess').first().waitFor();
 await page.locator('[data-check-dse-task]').click();
 assert.match(await page.locator('[data-dse-paper-score]').textContent(),/1 \/ 15/);
 await page.locator('[data-dse-reveal="1"]').click();
 await page.locator('[data-dse-analysis="1"]').click();
 assert.equal(await page.locator('[data-dse-study-dialog]').isHidden(),false);
 await page.locator('[data-dse-close-analysis]').click();
 await page.locator('[data-toggle-dse-layout]').click();
 assert.equal(await page.locator('.dse-digital-paper-frame').count(),0);
 assert.equal(await page.locator('.dse-paper-sheet').count(),1);
 assert.equal(await page.locator('[data-dse-answer-q="1"]').inputValue(),'Ping Pong');
 await page.locator('[data-dse-answer-q="1"]').fill('Edited in optional layout');
 await page.locator('[data-toggle-dse-layout]').click();
 assert.equal(await page.locator('.dse-digital-paper-frame').count(),1);
 assert.equal(await page.locator('[data-dse-answer-q="1"]').inputValue(),'Edited in optional layout');
 await page.reload({waitUntil:'domcontentloaded'});await page.locator('.dse-digital-paper-frame').waitFor();
 assert.equal(await page.locator('[data-dse-answer-q="1"]').inputValue(),'Edited in optional layout');
 await page.setViewportSize({width:390,height:844});await page.locator('[data-dse-answer-q="1"]').fill('Mobile answer');
 await page.screenshot({path:`${out}/listening-digital-default-mobile.png`});
 const frame=await page.locator('.dse-digital-paper-frame').boundingBox();assert.ok(frame.width<=390);
 assert.equal(await page.locator('[data-dse-answer-q="1"]').inputValue(),'Mobile answer');
 assert.deepEqual(errors,[]);
 // Exercise the two book controls with production markup and stylesheet.
 const html=await readFile(new URL('../schedule-system.html',import.meta.url),'utf8');
 const section=html.slice(html.indexOf('<section class="learning-purpose-panel"'),html.indexOf('</section>',html.indexOf('<section class="learning-purpose-panel"'))+10);
 await page.goto(`${base}/schedule-system.html`,{waitUntil:'domcontentloaded'});
 await page.setViewportSize({width:1280,height:950});
 await page.evaluate(section=>{document.body.innerHTML='<main style="padding:40px;background:#6b263e;color:white">'+section+'</main>';},section);
 await page.locator('[data-purpose-book="True Ferries"]').hover();await page.waitForTimeout(600);
 assert.notEqual(await page.locator('.purpose-book-ferries .purpose-book-cover').evaluate(x=>getComputedStyle(x).transform),'none');
 await page.screenshot({path:`${out}/purpose-books.png`});
 for(const name of ['True Ferries','Happy Stack']){await page.locator(`[data-purpose-book="${name}"]`).click();await page.locator('.purpose-book-dialog').waitFor();assert.equal(await page.locator('.purpose-book-dialog h2').textContent(),name);await page.locator('.purpose-book-dialog button').click();}
 console.log('Actual listening integration: digitised paper defaults, checking, analysis, POS guesses, optional custom layout, persistence and mobile controls. Purpose books passed.');
}finally{await browser.close();}
