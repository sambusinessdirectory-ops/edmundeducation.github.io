// Load every released essay through the student journey and render each mission.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../essay-memory-catalog.js',import.meta.url),'utf8'),context);
const allKeys=context.window.ESSAY_MEMORY_CATALOG.map(row=>row.key);
assert.equal(allKeys.length,288);
const requested=process.argv.slice(2);
const start=Number(process.env.MEMORY_QA_START||0);
const end=Number(process.env.MEMORY_QA_END||allKeys.length);
assert(Number.isInteger(start)&&Number.isInteger(end)&&start>=0&&start<=end&&end<=allKeys.length);
const keys=requested.length?requested:allKeys.slice(start,end);
assert(keys.every(key=>allKeys.includes(key)));

const {chromium}=await import('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',route=>route.fulfill({contentType:'application/javascript',body:''}));
await page.addInitScript(()=>{
  sessionStorage.setItem('edmund-essay-memory-student-v1',JSON.stringify({id:'full-catalog-qa',name:'Learner',role:'student',token:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'}));
  // Prevent the timed site-wide return prompt from covering mission controls.
  for(const offset of [0,-1]){
    const date=new Date();
    date.setDate(date.getDate()+offset);
    const key=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    localStorage.setItem(`edmund-night-return-v1:seen:student:full-catalog-qa:${key}`,'1');
  }
  localStorage.removeItem('edmund-night-return-v1:pending:student:full-catalog-qa');
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null},error:null}),signInAnonymously:async()=>({data:{session:{user:{id:'anonymous'}}},error:null})},rpc:async(_name,args)=>({error:null,data:[{id:'full-catalog-qa',name:'Learner',role:'student',session_token:args.p_token}]})})};
});

const base=process.env.MEMORY_QA_BASE||'http://127.0.0.1:8764';
for(const [index,key] of keys.entries()){
  await page.goto(`${base}/essay-memorization.html?essay=${encodeURIComponent(key)}`);
  await page.locator('.shell').waitFor({state:'visible'});
  assert.equal(await page.locator('[data-stage]').count(),11,`${key}: stage count`);
  if(key.startsWith('task1-'))assert(await page.locator('.memory-task1-visual img').count()>0,`${key}: chart`);
  for(let stage=0;stage<11;stage++){
    const node=page.locator(`[data-stage="${stage}"]`);
    const checkAllStructures=process.env.MEMORY_QA_ALL_STRUCTURES==='1'&&(await node.getAttribute('aria-label')).includes('拆解與運用句型');
    await node.click();
    const rounds=checkAllStructures?await page.locator('#step-select option').count():1;
    for(let round=0;round<rounds;round++){
      if(round)await page.locator('#step-select').evaluate((select,index)=>{select.value=String(index);select.dispatchEvent(new Event('change'));},round);
      assert((await page.locator('#game-card').innerText()).trim().length>20,`${key}: blank stage ${stage+1}, round ${round+1}`);
      if(checkAllStructures)assert((await page.locator('#step-select option').nth(round).innerText()).trim().length>5,`${key}: blank structure formula ${round+1}`);
      const overflowing=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth
        ? [...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1)
          .sort((a,b)=>b.getBoundingClientRect().right-a.getBoundingClientRect().right)
          .slice(0,8).map(el=>`${el.tagName}.${el.className||''}: ${Math.round(el.getBoundingClientRect().right)}px ${el.textContent?.trim().slice(0,45)}`)
        : []);
      const layout=overflowing.length?await page.evaluate(()=>{const rail=document.querySelector('#stage-rail'),mission=document.querySelector('.mission'),play=document.querySelector('.play-area');return {html:document.documentElement.scrollWidth,body:document.body.scrollWidth,rail:{width:rail.getBoundingClientRect().width,scrollWidth:rail.scrollWidth,overflow:getComputedStyle(rail).overflowX},mission:mission.getBoundingClientRect().width,play:play.getBoundingClientRect().width,intrinsic:[...document.querySelectorAll('.play-area *')].filter(el=>el.clientWidth>0&&el.scrollWidth>el.clientWidth+2&&getComputedStyle(el).overflowX==='visible').slice(0,12).map(el=>[el.tagName,el.className,el.clientWidth,el.scrollWidth,el.textContent?.trim().slice(0,30)])};}):null;
      assert(!overflowing.length,`${key}: horizontal overflow at stage ${stage+1}, round ${round+1}: ${JSON.stringify(layout)}; ${overflowing.join('; ')}`);
    }
  }
  assert.deepEqual(errors,[],`${key}: page errors`);
  if((index+1)%24===0)console.log(`Checked ${index+1}/${keys.length} lessons in this run`);
}
await browser.close();
console.log(`PASS: ${keys.length} released essays loaded, all eleven missions rendered at mobile width, with no page errors or overflow.`);
