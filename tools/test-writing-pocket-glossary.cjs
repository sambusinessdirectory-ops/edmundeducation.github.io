const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=process.env.WRITING_QA_BASE||'http://127.0.0.1:8775';

(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1100,height:800}});
  await page.goto(base+'/writing-submission-qr.html');
  await page.setContent('<link rel="stylesheet" href="/writing-submission.css"><div class="view" id="workspace" style="transform:translateX(40px);width:390px"><aside id="sidebar"><section id="pocket"></section></aside></div><textarea id="essay"></textarea>');
  await page.evaluate(async()=>{
   const {mountReferencePocket}=await import('/writing-reference-pocket.mjs');
   const {vocabularyEntryUsed}=await import('/writing-submission-core.js');
   window.pocket=mountReferencePocket({host:document.querySelector('#pocket'),getOwner:()=> 'student',getGlossary:async()=>[{english:'academic success',chinese:'學業成功'},{english:'in this context',chinese:'在這個背景下'}],getHistory:async()=>[],appendRich:()=>{},getEssayText:()=>document.querySelector('#essay').value,entryUsed:vocabularyEntryUsed});
   document.querySelector('#essay').addEventListener('input',()=>window.pocket.refreshGlossaryUsage());
   await window.pocket.refresh();
  });
  const rows=page.locator('.reference-vocabulary');
  assert.equal(await rows.count(),2);
  assert.equal(await rows.first().evaluate(el=>getComputedStyle(el).color),'rgb(36, 35, 66)');
  await page.locator('#essay').fill('I want academic success.');
  assert.equal(await rows.first().getAttribute('class'),'reference-vocabulary is-used');
  assert.equal(await rows.first().evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(220, 246, 229)');
  assert.equal(await rows.nth(1).evaluate(el=>el.classList.contains('is-used')),false);
  await page.getByRole('button',{name:'Float · 浮動'}).click();
  assert.equal(await page.locator('#pocket').evaluate(el=>el.parentElement===document.body),true);
  const bounds=await page.locator('#pocket').boundingBox();
  assert.ok(bounds&&bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=1100&&bounds.y<800,JSON.stringify(bounds));
  await page.getByRole('button',{name:'Dock · 放回'}).click();
  assert.equal(await page.locator('#pocket').evaluate(el=>el.parentElement.id),'sidebar');
  await page.getByRole('button',{name:'Float · 浮動'}).click();
  await page.locator('#workspace').evaluate(el=>el.hidden=true);
  await page.waitForFunction(()=>document.querySelector('#pocket').parentElement.id==='sidebar');
  await page.locator('#essay').fill('No matching phrases.');
  assert.equal(await rows.first().evaluate(el=>el.classList.contains('is-used')),false);
  console.log('PASS: readable glossary, live green matching, visible float, dock, and workspace hide');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
