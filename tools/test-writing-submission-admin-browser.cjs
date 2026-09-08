// Run against a local static server. Every worker endpoint is mocked; no student account is used.
// WRITING_QA_ORIGIN=http://127.0.0.1:8766 PLAYWRIGHT_MODULE=playwright node tools/test-writing-submission-admin-browser.cjs
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const origin=process.env.WRITING_QA_ORIGIN || 'http://127.0.0.1:8766';
const artifacts=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'writing-admin-qa-'));
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const source=fs.readFileSync(root+'/writing-submission.js','utf8')+'\nwindow.adminQA={state,elements,showView,renderAdminFeedbackEditor,openAdminPendingSubmissions,openAdminSubmission,closeFeedbackFullscreen,clearFeedbackSelectionRanges,createFeedbackRichEditor};';
(async()=>{const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000},serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/writing-submission.js?*',r=>r.fulfill({contentType:'text/javascript',body:source}));
let failPage2=false,delayPage2=0,published=false,requests=[];
const row=(n,extra={})=>({id:id(n),studentId:id(100+n),studentName:n===1?'Alice':'Student '+n,topic:'Article '+n,wordCount:350,submittedAt:`2026-09-0${n}T01:00:00Z`,hasPublishedFeedback:false,...extra});
let saved=null;
await page.route('https://*.workers.dev/**',async r=>{const u=new URL(r.request().url()),path=u.pathname;requests.push(path+u.search);let body={};
if(path==='/v1/admin/submissions'){if(u.searchParams.has('studentId'))return r.fulfill({contentType:'application/json',body:JSON.stringify({submissions:[row(1)],hasMore:false})});if(u.searchParams.get('page')==='1')body={submissions:[row(1,{hasPublishedFeedback:published}),row(2,{hasPublishedFeedback:true}),row(3,{deletedAt:'2026-09-08'})],hasMore:true};else{if(delayPage2)await new Promise(x=>setTimeout(x,delayPage2));if(failPage2)return r.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Temporary test failure'})});body={submissions:[row(4),row(1,{hasPublishedFeedback:published})],hasMore:false};}}
else if(path.endsWith('/feedback')&&r.request().method()==='PUT'){saved=r.request().postDataJSON();published=saved.status==='published';body={feedback:{...saved,id:id(999),submissionId:id(1),version:1,fragments:[],status:saved.status}};}
else if(path.endsWith('/feedback'))body={feedback:null};
else if(path===`/v1/admin/submissions/${id(1)}`)body={submission:{...row(1),answer:'The student article.'}};
else if(path.includes('feedback-questions'))body={questions:[]};
else if(path.includes('health'))body={ok:true};
return r.fulfill({contentType:'application/json',body:JSON.stringify(body)});});
await page.goto(origin+'/writing-submission.html');await page.waitForFunction(()=>window.adminQA&&window.adminQA.state.currentView==='login');
await page.evaluate(({id})=>{const q=window.adminQA;q.state.user={role:'admin',id,name:'QA Admin'};q.state.authToken='test-admin';q.showView('admin');q.state.selectedAdminSubmissionId=id;q.renderAdminFeedbackEditor({id,topic:'QA article',answer:'A student article.',studentName:'Alice'},null,q.elements.adminDetail);},{id:id(1)});
const editor=page.locator('[data-feedback-rich-editor="overall"]');await editor.fill('Delete this line. Keep this sentence.');
await editor.evaluate(el=>{el.focus();const r=document.createRange();r.setStart(el.firstChild,0);r.setEnd(el.firstChild,18);const s=getSelection();s.removeAllRanges();s.addRange(r);});
await page.waitForFunction(()=>window.adminQA.state.feedbackSelectionRanges.length===1);
await editor.click({button:'right',position:{x:Math.floor((await editor.boundingBox()).width)-24,y:30}});
assert.equal(await editor.innerText(),'Keep this sentence.');
await page.keyboard.press(process.platform==='darwin'?'Meta+z':'Control+z');assert.ok((await editor.innerText()).includes('Delete this line.'));
// Keyboard/trackpad contextmenu events may use button=0.
await editor.evaluate(el=>{el.focus();const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);});
await page.waitForFunction(()=>window.adminQA.state.feedbackSelectionRanges.length===1);
await editor.dispatchEvent('contextmenu',{button:0});assert.equal((await editor.innerText()).trim(),'');
await editor.fill('Unsaved feedback survives fullscreen.');
await editor.evaluate(el=>el.dataset.qaIdentity='same-editor');
await page.locator('[data-feedback-fullscreen]').click();
assert.equal(await page.locator('dialog.feedback-fullscreen-dialog').evaluate(el=>el.open),true);
assert.equal(await editor.getAttribute('data-qa-identity'),'same-editor');
assert.equal(await page.locator('dialog [data-feedback-selection-toolbar]').count(),1);
await page.screenshot({path:path.join(artifacts,'writing-fullscreen-desktop.png')});
await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(artifacts,'writing-fullscreen-mobile.png')});assert.equal(await page.locator('.feedback-fullscreen-dialog').evaluate(el=>el.scrollWidth>el.clientWidth),false);await page.setViewportSize({width:1440,height:1000});
await page.keyboard.press('Escape');assert.equal(await page.locator('.feedback-fullscreen-dialog').count(),0);assert.equal(await editor.innerText(),'Unsaved feedback survives fullscreen.');
await page.locator('[data-feedback-fullscreen]').click();
await page.locator('dialog [data-feedback-save="draft"]').first().click();
await page.waitForFunction(()=>document.querySelector('[data-feedback-status]')?.textContent.includes('尚未'));
assert.equal(saved.overallComment,'Unsaved feedback survives fullscreen.');assert.equal(await page.locator('.feedback-fullscreen-dialog').count(),1);
await page.locator('.feedback-fullscreen-bar button').click();
await page.locator('[data-admin-pending-button]').click();await page.waitForFunction(()=>window.adminQA.state.adminPendingComplete);
assert.deepEqual(await page.locator('[data-pending-submission-id]').evaluateAll(ns=>ns.map(n=>n.dataset.pendingSubmissionId)),[id(1),id(4)]);
await page.screenshot({path:path.join(artifacts,'writing-pending-desktop.png')});
await page.locator('[data-admin-pending-search]').fill('Alice');assert.equal(await page.locator('.admin-pending-card').count(),1);await page.locator('[data-admin-pending-search]').fill('');
await page.locator('[data-pending-submission-id]').first().click();await page.waitForFunction(()=>document.querySelector('[data-feedback-editor]')&&window.adminQA.state.selectedAdminStudentId.endsWith('000000000101'));assert.ok(await page.locator('[data-feedback-editor]').isVisible());await page.locator('[data-admin-pending-button]').click();await page.waitForFunction(()=>window.adminQA.state.adminPendingComplete);
failPage2=true;await page.locator('[data-admin-pending-refresh]').click();await page.waitForFunction(()=>document.querySelector('[data-admin-pending-status]').dataset.state==='error');assert.equal(await page.locator('[data-admin-pending-refresh]').isEnabled(),true);assert.ok((await page.locator('[data-admin-pending-status]').innerText()).includes('不完整'));
failPage2=false;published=true;await page.locator('[data-admin-pending-refresh]').click();await page.waitForFunction(()=>window.adminQA.state.adminPendingComplete);assert.equal(await page.locator('.admin-pending-card').count(),1);
await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(artifacts,'writing-pending-mobile.png')});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
// Abandoning the queue must ignore a delayed page.
delayPage2=300;await page.locator('[data-admin-pending-refresh]').click();await page.waitForFunction(()=>window.adminQA.state.adminPendingSubmissions.length===0);await page.evaluate(()=>window.adminQA.showView('admin'));await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>window.adminQA.state.currentView),'admin');assert.equal(await page.evaluate(()=>window.adminQA.state.adminPendingSubmissions.length),0);
// Student UI never exposes the queue and its handler never issues an admin request.
const before=requests.length;await page.evaluate(()=>{const q=window.adminQA;q.state.user.role='student';q.showView('submissions');return q.openAdminPendingSubmissions()});assert.equal(await page.locator('[data-admin-pending-button]').isVisible(),false);assert.equal(requests.length,before);
assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,artifacts,errors,checks:['right click outside selected glyphs','undo','button 0 contextmenu','fullscreen preserves editor','Escape','save in fullscreen','all-student multi-page queue','deleted/published excluded','deduplication','search','failed page and retry','published refresh','mobile overflow','correct student and article navigation','stale page cancellation','student exclusion']},null,2));await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
