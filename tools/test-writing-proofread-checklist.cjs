const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=process.env.WRITING_QA_BASE||'http://127.0.0.1:8775';

(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1180,height:900}});
  await page.addInitScript(()=>{
   if(!sessionStorage.getItem('edmund-writing-submission-session-v1'))sessionStorage.setItem('edmund-writing-submission-session-v1',JSON.stringify({token:'local-test-token',id:'proofread-student',name:'Test student',role:'student'}));
   if(!sessionStorage.getItem('edmund-writing-submission-draft-v1:proofread-student'))sessionStorage.setItem('edmund-writing-submission-draft-v1:proofread-student',JSON.stringify({documentId:'22222222-2222-4222-8222-222222222222',topic:'A school event',answer:''}));
  });
  await page.route('**/v1/**',route=>{
   const path=new URL(route.request().url()).pathname;
   const body=path.endsWith('/student/me')?{student:{id:'proofread-student',name:'Test student',access:{}}}:path.endsWith('/preferences')?{preferences:{grammarDetectionEnabled:false}}:{};
   route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  await page.goto(base+'/writing-submission.html');
  const panel=page.locator('[data-proofread-checklist]');
  await page.locator('[data-writing-input]').waitFor({state:'visible'});
  assert.equal(await panel.isVisible(),false);
  await page.locator('[data-writing-input]').fill('I enjoyed the school event.');
  await page.locator('[data-submit-writing]').click();
  await panel.waitFor({state:'visible'});
  if(process.env.WRITING_QA_SCREENSHOT)await page.screenshot({path:process.env.WRITING_QA_SCREENSHOT});
  assert.equal(await panel.locator('input[type="checkbox"]').count(),24);
  assert.match(await panel.locator('[data-proofread-checklist-progress]').textContent(),/0 \/ 24/);
  await panel.locator('input[value="articles"]').check();
  await panel.locator('input[value="plural"]').check();
  await panel.locator('input[value="plural"]').uncheck();
  assert.match(await panel.locator('[data-proofread-checklist-progress]').textContent(),/1 \/ 24/);
  const beforeDrag=await panel.boundingBox();
  await page.mouse.move(beforeDrag.x+100,beforeDrag.y+27);
  await page.mouse.down();await page.mouse.move(beforeDrag.x+210,beforeDrag.y+97,{steps:7});await page.mouse.up();
  const afterDrag=await panel.boundingBox();
  assert.ok(afterDrag.x>beforeDrag.x+80&&afterDrag.y>beforeDrag.y+45,'header drags the panel');
  const corner=panel.locator('[data-resize-corner="se"]');
  const cornerBox=await corner.boundingBox();
  await page.mouse.move(cornerBox.x+15,cornerBox.y+15);
  await page.mouse.down();await page.mouse.move(cornerBox.x+95,cornerBox.y+75,{steps:7});await page.mouse.up();
  const afterResize=await panel.boundingBox();
  assert.ok(afterResize.width>afterDrag.width+50&&afterResize.height>afterDrag.height+30,'corner resizes the panel');
  assert.equal(await page.locator('[data-submit-writing]').isDisabled(),true);
  await page.reload();
  await panel.waitFor({state:'visible'});
  assert.equal(await panel.locator('input[value="articles"]').isChecked(),true);
  const draft=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('edmund-writing-submission-draft-v1:proofread-student')));
  assert.deepEqual(draft.proofreadChecklist.checkedIds,['articles']);
  assert.deepEqual(draft.proofreadChecklist.touchedIds,['articles','plural']);
  assert.equal(draft.proofreadChecklist.toggleCount,3);
  assert.equal(await panel.locator('[data-resize-corner]').count(),4);
  await panel.getByRole('button',{name:'收起'}).click();
  assert.equal(await panel.locator('[data-proofread-checklist-list]').isVisible(),false);
  await panel.getByRole('button',{name:'展開清單'}).click();
  await page.setViewportSize({width:390,height:760});
  const bounds=await panel.boundingBox();
  assert.ok(bounds&&bounds.x>=0&&bounds.x+bounds.width<=390&&bounds.y+bounds.height<=760,JSON.stringify(bounds));
  console.log('PASS: proofreading panel drags, resizes, saves interactions, collapses, and fits mobile');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
