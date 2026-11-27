import assert from 'node:assert/strict';

const {chromium}=await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT||'playwright');
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1280,height:900}});
const page=await context.newPage(),errors=[];
const student={id:'11111111-1111-4111-8111-111111111111',name:'Student',role:'student',session_token:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'};
page.on('pageerror',error=>errors.push(error.message));

await context.route('**/polysemy-lab.html*',async route=>{
 const response=await route.fetch();
 await route.fulfill({response,body:(await response.text()).replace(/ integrity="[^"]+"/g,'')});
});
await context.route('**/supabase.min.js',route=>route.fulfill({contentType:'application/javascript',body:`window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'qa'}}},error:null})},rpc:(name,args)=>({abortSignal:async()=>({data:name==='flashcard_admin_login'?(args.p_name==='admin'&&args.p_password==='correct'?[{name:'admin',role:'admin'}]:[]):name==='flashcard_student_login'?(args.p_name==='student'&&args.p_password==='correct'?[${JSON.stringify(student)}]:[]):name==='flashcard_student_session_profile'?(args.p_token==='${student.session_token}'?[${JSON.stringify(student)}]:[]):name==='polysemy_lab_modules_sync'?{events:[],timeDays:[]}:[],error:null})})})};`}));

const base=process.env.POLYSEMY_QA_BASE||'http://127.0.0.1:8633';
await page.goto(`${base}/polysemy-lab.html`);
assert.equal(await page.locator('[data-manual]').count(),0,'student page must not contain a manual PDF control');

await page.locator('[name=username]').fill('admin');
await page.locator('[name=password]').fill('correct');
await page.locator('[data-login-form] [type=submit]').click();
await page.locator('[data-admin-app]').waitFor({state:'visible'});
assert.equal(await page.locator('[data-app]').isVisible(),false,'admin must not enter the student application');
await page.locator('[data-admin-search]').fill('seem');
await page.locator('[data-admin-preview="seem"]').click();
await page.locator('[data-admin-preview-dialog]').waitFor({state:'visible'});
const preview=await page.locator('[data-admin-preview-dialog] pre').innerText();
assert.match(preview,/# seem/);
assert.match(preview,/\*\*Answer:\*\*/);
assert.match(preview,/### Explanation/);
assert.match(preview,/question_count: 25/);
await page.locator('[data-admin-preview-close]').click();
await page.locator('[data-logout]').click();

await page.locator('[name=username]').fill('student');
await page.locator('[name=password]').fill('correct');
await page.locator('[data-login-form] [type=submit]').click();
await page.locator('[data-app]').waitFor({state:'visible'});
await page.locator('[data-module-search]').fill('seem');
await page.locator('[data-module="seem"]').click();
await page.locator('[data-module-page]').waitFor({state:'visible'});
assert.equal(await page.locator('[data-manual]').count(),0);
assert.equal(await page.getByText('閱讀本單元完整教材 PDF',{exact:true}).count(),0);
assert.deepEqual(errors,[]);

await browser.close();
console.log('PASS Polysemy admin exports current questions, answers and explanations while students never see PDF manuals');
