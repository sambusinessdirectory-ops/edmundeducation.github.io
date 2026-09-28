const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=process.env.WRITING_QA_BASE||'http://127.0.0.1:8775';

(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1180,height:900}});
  await page.addInitScript(()=>{
   sessionStorage.setItem('edmund-writing-submission-session-v1',JSON.stringify({token:'local-test-token',id:'local-test-student',name:'Test student',role:'student'}));
   sessionStorage.setItem('edmund-writing-submission-draft-v1:local-test-student',JSON.stringify({documentId:'11111111-1111-4111-8111-111111111111',topic:'Virtual sports versus real sports',answer:'',selectedTopicResource:{id:'fill:dse-writing-2012-part-b-q2',type:'fill-blanks',label:'2012 Q2 — Virtual Sports versus Real Sports',sectionKey:'dse-writing',questionPrompt:['Virtual sports versus real sports'],questionImages:[]}}));
  });
  await page.route('**/v1/**',route=>{
   const path=new URL(route.request().url()).pathname;
   const body=path.endsWith('/student/me')?{student:{id:'local-test-student',name:'Test student',access:{'dse-writing':true,dse:true}}}:path.endsWith('/preferences')?{preferences:{grammarDetectionEnabled:false}}:{};
   route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
  });
  await page.goto(base+'/writing-submission.html');
  const toggle=page.locator('[data-model-essay-toggle]');
  await toggle.waitFor({state:'visible',timeout:15000});
  assert.match(await toggle.textContent(),/顯示範文底字/);
  await toggle.click();
  await page.locator('[data-model-essay-mini-panel]').waitFor({state:'visible'});
  assert.equal(await page.locator('[data-writing-editor-stack]').getAttribute('data-model-essay-visible'),'true');
  assert.ok(await page.locator('.model-essay-mini-chip').count()>1);
  await page.locator('[data-model-essay-paragraph-open]').click();
  assert.equal(await page.locator('[data-model-essay-paragraph-dialog]').evaluate(el=>el.open),true);
  console.log('PASS: text-only topic shows model-essay button, base text, paragraph controls, and preview');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
