// Local-only synthetic authentication; never submits real student records.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright');
const base=process.env.READING_TEST_URL||'http://127.0.0.1:8126';
assert.equal(new URL(base).hostname,'127.0.0.1');
const assets=process.env.DSE_ANALYSIS_ASSETS;
const output=process.env.DSE_TEST_OUTPUT||'/tmp/dse-analysis-batch-browser';await mkdir(output,{recursive:true});
const ids=['dse-2023-b1','dse-2023-b2','dse-2024-a','dse-2024-b1','dse-2024-b2','dse-2025-a','dse-2025-b1','dse-2025-b2'];
const browser=await chromium.launch({headless:true});const errors=[];let opened=0,rendered=0;
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'application/javascript',body:`window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'local-test'}}}})},rpc:async(name)=>({data:name==='flashcard_admin_login'?(window.__sourceAdminAllowed?[{name:'Local Admin',role:'admin'}]:[]):name==='flashcard_student_session_profile'?[{id:'local-test',name:'Local Test',session_token:'test-only'}]:name==='flashcard_student_login'?[{session_token:'test-only'}]:name.includes('translation')?null:[],error:null})})};`});
  if(url.hostname==='edmund-site-assets.edmundeducation.workers.dev'){
   if(!assets)return route.continue();
   const match=url.pathname.match(/\/dse-reading-analysis\/[^/]+\/(dse-\d{4}-(?:a|b1|b2))\/[0-9a-f]+\/([A-Za-z0-9.-]+)$/);
   if(!match)return route.abort();
   return route.fulfill({body:await readFile(resolve(assets,match[1],match[2])),contentType:match[2].endsWith('.pdf')?'application/pdf':'image/webp',headers:{'Access-Control-Allow-Origin':'*'}});
  }
  if(url.hostname!=='127.0.0.1')return route.abort();
  if(url.pathname==='/reading-comprehension.html'){const response=await route.fetch();return route.fulfill({response,body:(await response.text()).replace(/ integrity="[^"]+"/g,'')});}
  return route.continue();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 for(const id of ids){
  const data=JSON.parse(await readFile(new URL(`../dse-reading-analysis/${id}/index.json`,import.meta.url),'utf8'));
  const [,year,section]=id.split('-');
  await page.goto(`${base}/reading-comprehension.html?view=dse&year=${year}&section=${section.toUpperCase()}&article=${id}`);
  if(id===ids[0]){await page.locator('input[name=username]').fill('Local Test');await page.locator('input[name=password]').fill('test-only');await page.locator('[data-login-button]').click();}
  await page.locator(`[data-deep-analysis="${data.questions[0].number}"]`).waitFor();assert.equal(await page.locator('[data-deep-analysis]').count(),data.questions.length);
  await page.locator('[data-answer-part]').evaluateAll(inputs=>{const checked=new Map();for(const input of inputs){if(input.type==='radio'||input.type==='checkbox'){const count=checked.get(input.name)||0;const needed=input.type==='checkbox'?Number(input.dataset.answerSlots||1):1;if(count>=needed)continue;checked.set(input.name,count+1);input.checked=true;}else if(input.tagName==='SELECT')input.value=input.options[1].value;else input.value='Synthetic local answer';input.dispatchEvent(new Event('input',{bubbles:true}));}});
  for(const q of data.questions){
   console.log(`Opening ${id} Q${q.number}`);
   await page.locator(`[data-deep-analysis="${q.number}"]`).click();await page.locator('.deep-reader[open] [data-deep-main] .deep-page').first().waitFor().catch(async e=>{await page.screenshot({path:resolve(output,'error.png')});console.log(await page.locator('[data-question]').allTextContents());console.log(await page.locator('dialog').allTextContents());throw e;});
   assert.match(await page.locator('#deep-title').innerText(),new RegExp(`第 ${q.number} 題`));assert.equal(await page.locator('[data-deep-steps] button').count(),q.pages.length);
   assert.ok(!(await page.locator('.deep-comparison').innerText()).includes('第 280–301 頁'),'2023 A caveat must not leak into other papers');
   if(q.referenceOnly){assert.match(await page.locator('.deep-intro').innerText(),/p.27、190/);assert.match(await page.locator('.deep-scroll>.deep-source-note').innerText(),/沒有.*獨立/);}
   await page.locator(`[data-deep-step="${q.pages.length-1}"]`).click();assert.match(await page.locator('[data-deep-position]').innerText(),new RegExp(`p.${q.endPage}$`));
   await page.locator('[data-deep-mode=full]').click();assert.equal(await page.locator('.deep-page').count(),q.pages.length);
   for(const width of [390,820,1440]){
    await page.setViewportSize({width,height:1000});
    assert.equal(await page.locator('.deep-reader').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,`${id} Q${q.number} ${width}px dialog overflow`);
    // Source full stops deliberately hang into the page padding; the page itself must never overflow.
    const overflow=await page.locator('.deep-page').evaluateAll(els=>els.filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.id));assert.deepEqual(overflow,[],`${id} Q${q.number} ${width}px body overflow`);
   }
   if(q===data.questions[0]){await page.locator('[data-deep-understood]').isHidden();await page.locator('[data-deep-mode=guided]').click();await page.locator('[data-deep-step="0"]').click();await page.locator('[data-deep-understood]').click();assert.match(await page.locator('[data-deep-progress-label]').innerText(),/已理解 1/);await page.locator('[data-deep-search]').fill('原');await page.locator('[data-deep-clear]').click();await page.screenshot({path:resolve(output,`${id}-desktop.png`)});}
   assert.equal(await page.locator('.deep-original,.deep-furniture,[data-deep-mode=original]').count(),0);await page.keyboard.press('Escape');opened++;
  }
  // Supplementary pages include cover and all article/translation/summary material.
  await page.locator(`[data-deep-analysis="${data.questions[0].number}"]`).click();await page.locator('.deep-reader[open] .deep-page').first().waitFor();await page.locator('.deep-map>details').last().locator('summary').click();await page.locator('[data-deep-supplement]').click();assert.equal(await page.locator('[data-deep-steps] button').count(),data.supplementaryPages.length);await page.locator('.deep-source-figure img').evaluate(img=>img.decode());await page.keyboard.press('Escape');
  // Source tools are available only after verified admin and use the CDN, actual PDF count.
  await page.evaluate(()=>{sessionStorage.setItem('edmundFlashcardSession',JSON.stringify({name:'Local Admin',role:'admin'}));sessionStorage.setItem('edmundFlashcardAdminPassword','local-test-only');window.__sourceAdminAllowed=true;});
  await page.locator(`[data-deep-analysis="${data.questions[0].number}"]`).click();await page.locator('.deep-original summary').waitFor();const pdf=page.locator('.deep-map a[href$="original.pdf"]');assert.equal(await pdf.getAttribute('href'),data.assetBase+'original.pdf');assert.match(await pdf.textContent(),new RegExp(`${data.pageCount} 頁`));
  await page.locator('[data-deep-mode=original]').click();await page.locator('.deep-page img').evaluate(img=>img.decode());await page.keyboard.press('Escape');
  await page.evaluate(()=>{sessionStorage.removeItem('edmundFlashcardSession');sessionStorage.removeItem('edmundFlashcardAdminPassword');window.__sourceAdminAllowed=false;});
  console.log(`${id}: ${data.questions.length} question readers, source and cover checked`);
 }
 // Render every imported page independently with all font sizes and widths, including supplementary pages.
 const harness=await context.newPage();await harness.goto(`${base}/reading-comprehension.html`);
 for(const id of ids){
  const data=JSON.parse(await readFile(new URL(`../dse-reading-analysis/${id}/index.json`,import.meta.url),'utf8'));
  await harness.evaluate(async data=>{const {renderRichBody,analysisAssetUrl}=await import('/dse-deep-analysis.mjs');document.body.innerHTML='<div class="deep-reader" style="position:relative;margin:0;width:100%;max-width:none;height:auto;max-height:none"><main>'+data.pages.map(p=>`<article class="deep-page" id="sample-${p.number}"><div class="deep-source-body">${renderRichBody(p,'',name=>analysisAssetUrl(data,name))}</div></article>`).join('')+'</main></div>';},data);
  for(const width of [390,820,1440])for(const font of ['normal','large','larger']){
   await harness.setViewportSize({width,height:1000});await harness.locator('.deep-reader').evaluate((el,font)=>el.dataset.font=font,font);
   const overflow=await harness.locator('.deep-page').evaluateAll(els=>els.filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.id));assert.deepEqual(overflow,[],`${id} ${width}px ${font} source overflow`);rendered+=data.pageCount;
  }
  console.log(`${id}: all ${data.pageCount} source pages checked at 3 widths and 3 font sizes`);
  for(const p of data.pages.filter(p=>p.figures?.some(f=>f.alt!=='原書封面'))){await harness.setViewportSize({width:820,height:1180});const el=harness.locator(`#sample-${p.number}`);await el.locator('img').scrollIntoViewIfNeeded();await el.locator('img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));await el.scrollIntoViewIfNeeded();await el.screenshot({path:resolve(output,`${id}-figure-p${p.number}.png`)});}
 }
 assert.deepEqual(errors,[]);assert.equal(opened,173);console.log(`PASS: ${opened} question readers; ${rendered} source-page/width/font combinations, no overflow; synthetic auth only.`);
}finally{await browser.close();}
