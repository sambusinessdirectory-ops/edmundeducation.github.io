import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const base=process.env.STUDY_TEST_URL||'http://127.0.0.1:8774';
const catalogue=JSON.parse(readFileSync(new URL('../dse-listening-question-types.json',import.meta.url),'utf8'));
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
  await page.addInitScript(()=>{
    sessionStorage.setItem('edmund-listening-session-v1',JSON.stringify({id:'type-finder-test',name:'Test',token:'test-token',role:'student'}));
    window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'auth-test'}}}})},rpc:async name=>({data:name==='flashcard_student_session_profile'?[{id:'type-finder-test',name:'Test',session_token:'test-token'}]:[]})})};
  });
  await page.goto(`${base}/listening-system.html?section=dse`,{waitUntil:'domcontentloaded'});
  await page.locator('.dse-type-finder > summary').click();
  const finder=page.locator('[data-dse-listening-types]');
  await finder.locator('[data-qtf-type]').first().waitFor();
  assert.equal(await finder.locator('[data-qtf-type]').count(),15);
  assert.match(await finder.locator('.qtf-total').first().textContent(),/817 題/);
  await finder.locator('[data-qtf-type="map-plan"]').click();
  assert.match(await finder.locator('[data-qtf-status]').textContent(),/20 題/);
  await finder.locator('[data-qtf-year]').selectOption('2026');
  await finder.locator('[data-qtf-section]').selectOption('2');
  assert.match(await finder.locator('[data-qtf-status]').textContent(),/4 題/);
  assert.equal(await finder.locator('.qtf-result').count(),4);
  await finder.locator('[data-qtf-clear]').click();
  await finder.locator('[data-qtf-type="route-tracing"]').click();
  assert.equal(await finder.locator('.qtf-result').count(),2);
  await finder.locator('.qtf-result a').first().click();
  await page.locator('.dse-question-type-target').waitFor();
  assert.match(new URL(page.url()).search,/year=2018&task=2&question=17/);
  assert.ok(await page.locator('.dse-maze.dse-question-type-target').count());
  await page.goto(`${base}/listening-system.html?section=dse&year=2016&task=4&question=50`,{waitUntil:'domcontentloaded'});
  await page.locator('.dse-question-type-target').waitFor();
  assert.ok(await page.locator('[data-dse-answer-q="50"]').count());
  for(const paper of catalogue.papers)for(const task of paper.tasks){
    await page.goto(`${base}/listening-system.html?section=dse&year=${paper.year}&task=${task.number}`,{waitUntil:'domcontentloaded'});
    await page.locator('[data-dse-task-host] .dse-task').waitFor();
    const rendered=await page.locator('[data-dse-task-host]').evaluate(host=>{
      const numbers=new Set();
      for(const node of host.querySelectorAll('[data-dse-answer-q],[data-dse-maze-q],[data-dse-ranking],[data-dse-answer-group],[data-dse-order-group]')){
        for(const key of ['dseAnswerQ','dseMazeQ','dseRanking','dseAnswerGroup','dseOrderGroup'])
          for(const part of (node.dataset[key]||'').split(','))if(Number(part))numbers.add(Number(part));
      }
      return [...numbers].sort((a,b)=>a-b);
    });
    const expected=catalogue.rows.filter(row=>row.year===paper.year&&row.task===task.number).map(row=>row.number).sort((a,b)=>a-b);
    assert.deepEqual(rendered,expected,`${paper.year} Task ${task.number} rendered answer controls`);
  }
  assert.deepEqual(errors,[]);
  console.log('DSE Listening browser: filters, exact links and all 817 rendered answer controls across 60 Tasks passed.');
}finally{await browser.close();}
