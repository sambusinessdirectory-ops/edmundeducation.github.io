import assert from 'node:assert/strict';
const {chromium}=await import('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',route=>route.fulfill({contentType:'application/javascript',body:''}));
await page.addInitScript(()=>{
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null},error:null}),signInAnonymously:async()=>({data:{session:{user:{id:'anonymous'}}},error:null})},
    rpc:async(name,args)=>({error:null,data:name==='flashcard_student_login'
      ? [{id:'student-1',name:'Learner',role:'student',session_token:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'}]
      : [{id:'student-1',name:'Learner',role:'student',session_token:args.p_token}]})})};
});
const base=process.env.MEMORY_QA_BASE||'http://127.0.0.1:8764';
await page.goto(`${base}/essay-memorization.html?essay=opinion%3A999`);
await page.locator('[name=username]').fill('learner');
await page.locator('[name=password]').fill('secret');
await page.locator('[data-memory-login-submit]').click();
await page.locator('.shell').waitFor({state:'visible'});
assert((await page.locator('.setup-card strong').innerText()).includes('找不到這篇範文'));
assert.equal(await page.locator('.mission').isVisible(),false);
assert.equal(await page.locator('.play-area').isVisible(),false);
assert.equal(await page.locator('.setup-card > a').getAttribute('href'),'writing-practice.html');
assert(!(await page.locator('body').innerText()).includes('Essay 80 · Libraries and technology'));
await page.goto(`${base}/essay-memorization.html?essay=task1-bar-charts%3A999`);
await page.locator('.shell').waitFor({state:'visible'});
assert((await page.locator('.setup-card strong').innerText()).includes('找不到這篇範文'));
assert.equal(await page.locator('.play-area').isVisible(),false);
assert.equal(await page.locator('.setup-card > a').getAttribute('href'),'writing-practice.html');
assert.deepEqual(errors,[]);
await browser.close();
console.log('PASS: unknown essay URLs show a safe fallback and never open Essay 80.');
