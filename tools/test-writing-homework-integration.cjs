const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
const browser=await chromium.launch({headless:true});const p=await browser.newPage({viewport:{width:1100,height:900}});p.setDefaultTimeout(12000);
const origin=process.env.WRITING_QA_ORIGIN||'http://127.0.0.1:8644';
await p.route('**/qa-integration',r=>r.fulfill({contentType:'text/html',body:'<link rel="stylesheet" href="/writing-synonyms.css"><link rel="stylesheet" href="/schedule-entry-draft-guard.css"><div id="pocket"></div><dialog id="entry"><textarea></textarea></dialog>'}));
await p.goto(origin+'/qa-integration');
await p.evaluate(async()=>{
 const {mountWritingSynonyms}=await import('/writing-synonyms.mjs');const {mountReferencePocket}=await import('/writing-reference-pocket.mjs');const {mountEntryDraftGuard}=await import('/schedule-entry-draft-guard.mjs');
 const search=mountWritingSynonyms({getSession:()=>null});window.search=search;
 const pocket=mountReferencePocket({host:document.querySelector('#pocket'),getOwner:()=> 'test',getGlossary:async()=>[],getHistory:async()=>[],appendRich:()=>{},openSynonymSearch:button=>search.open(button)});await pocket.refresh();
 const dialog=document.querySelector('#entry'),input=dialog.querySelector('textarea');window.saved=0;window.guard=mountEntryDraftGuard({dialog,input,getOriginal:()=>'',onSave:()=>{window.saved++;dialog.close();}});
});
await p.locator('.reference-pocket-trigger').click();await p.locator('[data-category="synonym-search"]').click();await p.getByRole('button',{name:'Synonym Search · 搜尋同義詞',exact:true}).click();
await p.locator('#writing-synonyms-search').fill('important');await p.locator('[data-syn-results] article').first().waitFor();await p.locator('[data-syn-results] article').first().locator('summary').click();await p.locator('.writing-synonym-example').first().waitFor();
assert.match(await p.locator('.example-en').first().textContent(),/significant/);assert.match(await p.locator('.example-zh').first().textContent(),/政策/);
await p.setViewportSize({width:390,height:844});assert.ok(await p.locator('.writing-synonyms-dialog').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
await p.locator('[data-syn-close]').click();
await p.evaluate(()=>{document.querySelector('#entry').showModal();document.querySelector('textarea').value='x'.repeat(101);guard.requestClose();});
assert.ok(await p.locator('.entry-draft-warning').evaluate(e=>e.open));await p.locator('[data-draft-keep]').click();assert.equal((await p.locator('textarea').inputValue()).length,101);
await p.keyboard.press('Escape');assert.ok(await p.locator('.entry-draft-warning').evaluate(e=>e.open));
const download=p.waitForEvent('download');await p.locator('[data-draft-download]').click();assert.equal((await download).suggestedFilename(),'homework-writing-draft.txt');assert.equal((await p.locator('textarea').inputValue()).length,101);
await p.locator('[data-draft-save]').click();assert.equal(await p.evaluate(()=>saved),1);
await p.evaluate(()=>{document.querySelector('#entry').showModal();guard.requestClose();});await p.locator('[data-draft-discard]').click();assert.equal(await p.locator('#entry').evaluate(e=>e.open),false);
await p.evaluate(()=>{document.querySelector('#entry').showModal();document.querySelector('textarea').value='short';guard.requestClose();});assert.equal(await p.locator('#entry').evaluate(e=>e.open),false);
await p.goto(origin+'/reading-comprehension.html');assert.equal(await p.locator('[data-open-dse-question-finder]').count(),0);assert.equal(await p.locator('[data-view="dse-dashboard"] [data-dse-question-finder]').count(),1);
await p.route('**/schedule-system.js?*',r=>r.fulfill({contentType:'text/javascript',body:fs.readFileSync('schedule-system.js','utf8').replace('initialize();','')+`\nwindow.homeworkQA={state,elements,renderHomeworkPickerResults,setCatalog:rows=>homeworkResourceCatalog=rows};`}));
await p.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@**',r=>r.fulfill({contentType:'text/javascript',body:`window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'mock'}}}})},rpc:async(name)=>({data:name==='schedule_admin_list_manual_writing_resources'?[{id:'writing-submission:manual:00000000-0000-4000-8000-000000000001',type:'writing-submission',label:'My created topic',url:'https://edmundeducation.com/writing-submission.html?manualTopic=00000000-0000-4000-8000-000000000001',detail:'手動創作題目'}]:[],error:null})})};`}));
await p.route('**/schedule-system.html',r=>r.fulfill({contentType:'text/html',body:fs.readFileSync('schedule-system.html','utf8').replace(/ integrity="[^"]+"/g,'')}));await p.goto(origin+'/schedule-system.html');await p.waitForFunction(()=>window.homeworkQA);
const result=await p.evaluate(async()=>{
 const q=homeworkQA;q.state.currentUser={role:'admin',adminToken:'mock'};q.state.homeworkPickerType='writing-submission';
 q.setCatalog([{id:'writing-submission:dse',type:'writing-submission',label:'DSE question',sectionKey:'dse-writing',detail:'Part A'}, {id:'writing-submission:ielts',type:'writing-submission',label:'IELTS question',sectionKey:'ielts-writing',detail:'Task 1'}]);
 q.renderHomeworkPickerResults();document.querySelector('[data-writing-category="ielts-task-1"]').click();
 q.elements.homeworkPickerSearch.value='DSE';q.renderHomeworkPickerResults();const across=q.elements.homeworkPickerResults.textContent;
 document.querySelector('[data-writing-category="manual"]').click();
 return {across,cleared:q.elements.homeworkPickerSearch.value};
});assert.match(result.across,/DSE question/);assert.equal(result.cleared,'');
await p.waitForFunction(()=>homeworkQA.elements.homeworkPickerResults.textContent.includes('My created topic')).catch(async e=>{console.log(await p.evaluate(()=>({count:homeworkQA.elements.homeworkPickerCount.textContent,result:homeworkQA.elements.homeworkPickerResults.textContent,client:!!window.supabase})));throw e;});
console.log('Passed: pocket #11, synonym examples/translations, mobile layout, long-draft keep/save/download/discard/Escape, short draft close, DSE finder separation.');await browser.close();

})().catch(error=>{console.error(error);process.exit(1)});
