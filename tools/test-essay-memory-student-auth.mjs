import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',route=>route.fulfill({contentType:'application/javascript',body:''}));
await page.addInitScript(() => {
  window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null},error:null}),signInAnonymously:async()=>({data:{session:{user:{id:'anonymous'}}},error:null})},
    rpc:async(name,args)=>({error:null,data:name==='flashcard_student_login'
      ? args.p_name==='learner' && args.p_password==='secret' ? [{id:'student-1',name:'Learner',role:'student',session_token:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'}] : []
      : name==='flashcard_student_session_profile' && args.p_token==='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
        ? [{id:'student-1',name:'Learner',role:'student',session_token:args.p_token}] : []})})};
});
await page.goto('http://127.0.0.1:8633/essay-memorization.html');
await assert.equal(await page.locator('[data-memory-login]').isVisible(),true);
await assert.equal(await page.locator('.shell').isVisible(),false);
await page.locator('[name=username]').fill('learner');
await page.locator('[name=password]').fill('wrong');
await page.locator('[data-memory-login-submit]').click();
await assert.equal(await page.locator('[data-memory-login]').isVisible(),true);
await page.locator('[name=password]').fill('secret');
await page.locator('[data-memory-login-submit]').click();
await page.locator('.shell').waitFor({state:'visible'});
assert((await page.locator('[data-memory-student-name]').innerText()).includes('Learner'));
await page.evaluate(async () => {
  await EssayMemoryRecordings.save({id:'memory-test',essayId:'test',title:'Test',savedAt:new Date().toISOString(),blob:new Blob(['recording'])});
  if ((await EssayMemoryRecordings.list()).length !== 1) throw Error('Student recording missing');
  window.EssayMemoryAuth={user:{id:'student-2'}};
  if ((await EssayMemoryRecordings.list()).length !== 0) throw Error('Recording crossed student accounts');
  window.EssayMemoryAuth={user:{id:'student-1'}};
  await EssayMemoryRecordings.remove('memory-test');
});
await page.reload();
await page.locator('.shell').waitFor({state:'visible'});
await page.locator('[data-memory-logout]').click();
await page.locator('[data-memory-login]').waitFor({state:'visible'});
await assert.equal(await page.locator('.shell').isVisible(),false);
await page.evaluate(() => {
  sessionStorage.setItem('edmund-universal-student-session-v1',JSON.stringify({id:'expired',name:'Expired',role:'student',token:'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'}));
  sessionStorage.setItem('edmund-essay-memory-student-v1',JSON.stringify({id:'student-1',name:'Learner',role:'student',token:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'}));
});
await page.reload();
await page.locator('.shell').waitFor({state:'visible'});
await page.locator('[data-memory-logout]').click();
await page.locator('[data-memory-login]').waitFor({state:'visible'});
await page.goto('http://127.0.0.1:8633/essay-memory-recordings.html');
await assert.equal(await page.locator('[data-memory-login]').isVisible(),true);
await page.locator('[name=username]').fill('learner');
await page.locator('[name=password]').fill('secret');
await page.locator('[data-memory-login-submit]').click();
await page.locator('.shell').waitFor({state:'visible'});
assert((await page.locator('#recordings-status').innerText()).includes('錄音'));
assert.deepEqual(errors,[]);
console.log('PASS: student-only gates, wrong credentials, login, restore, logout and recording isolation.');
await browser.close();
