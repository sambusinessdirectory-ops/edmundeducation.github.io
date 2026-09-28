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
  assert.match(await panel.locator('[data-proofread-checklist-progress]').textContent(),/1 \/ 24/);
  assert.equal(await page.locator('[data-submit-writing]').isDisabled(),true);
  await page.reload();
  await panel.waitFor({state:'visible'});
  assert.equal(await panel.locator('input[value="articles"]').isChecked(),true);
  await panel.getByRole('button',{name:'收起'}).click();
  assert.equal(await panel.locator('[data-proofread-checklist-list]').isVisible(),false);
  await panel.getByRole('button',{name:'展開清單'}).click();
  await page.setViewportSize({width:390,height:760});
  const bounds=await panel.boundingBox();
  assert.ok(bounds&&bounds.x>=0&&bounds.x+bounds.width<=390&&bounds.y+bounds.height<=760,JSON.stringify(bounds));
  console.log('PASS: proofread checklist appears on submit, tracks progress, saves ticks, collapses, and fits mobile');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
