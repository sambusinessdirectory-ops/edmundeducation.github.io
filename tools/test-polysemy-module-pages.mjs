import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || 'playwright');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
const student = { id: '11111111-1111-4111-8111-111111111111', name: 'Module Test Student', role: 'student', session_token: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' };
page.on('pageerror', error => errors.push(error.message));

await context.route('**/polysemy-lab.html*', async route => {
  const response = await route.fetch();
  await route.fulfill({ response, body: (await response.text()).replace(/ integrity="[^"]+"/g, '') });
});
await context.route('**/supabase.min.js', route => route.fulfill({ contentType: 'application/javascript', body: `window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'test-auth'}}},error:null})},rpc:(name,args)=>({abortSignal:async()=>({data:name==='flashcard_student_login'?(args.p_name==='homework'&&args.p_password==='correct'?[${JSON.stringify(student)}]:[]):name==='flashcard_student_session_profile'?(args.p_token==='${student.session_token}'?[${JSON.stringify(student)}]:[]):name==='polysemy_lab_modules_sync'?{events:args.p_events||[],timeDays:[]}:[],error:null})})})};` }));

const base = process.env.POLYSEMY_QA_BASE || 'http://127.0.0.1:8633';
await page.goto(`${base}/polysemy-lab.html`);
await page.locator('[name=username]').fill('homework');
await page.locator('[name=password]').fill('correct');
await page.locator('[data-login-form] [type=submit]').click();
await page.locator('[data-app]').waitFor({ state: 'visible' });
assert.equal(await page.locator('[data-catalog]').isVisible(), true);
assert.equal(await page.locator('[data-module-page]').isVisible(), false);
assert.ok(await page.locator('[data-module]').count() > 80);

await page.locator('[data-module=work]').click();
await page.locator('[data-module-page]').waitFor({ state: 'visible' });
assert.equal(await page.locator('[data-catalog]').isVisible(), false);
assert.equal(await page.locator('.module-heading h1').innerText(), 'work');
assert.equal(new URL(page.url()).searchParams.get('module'), 'work');
assert.ok(await page.evaluate(() => scrollY < 100), 'opening a lower catalog card must return to the top');
assert.ok(await page.locator('[data-sense]').count() > 0);
await page.locator('[data-mode=practice]').click();
assert.equal(await page.locator('[data-practice]').isVisible(), true);
assert.equal(await page.locator('[data-catalog]').isVisible(), false);
await page.locator('[data-back-modules]').click();
assert.equal(await page.locator('[data-catalog]').isVisible(), true);
assert.equal(await page.locator('[data-module-page]').isVisible(), false);
assert.equal(new URL(page.url()).searchParams.has('module'), false);
await page.goBack();
await page.locator('[data-module-page]').waitFor({ state: 'visible' });
assert.equal(await page.locator('.module-heading h1').innerText(), 'work');

await page.goto(`${base}/polysemy-lab.html?module=life`);
await page.locator('[data-module-page]').waitFor({ state: 'visible' });
assert.equal(await page.locator('[data-catalog]').isVisible(), false);
assert.equal(await page.locator('.module-heading h1').innerText(), 'life');
assert.match(await page.title(), /^life ·/);
for (const width of [390, 320]) {
  await page.setViewportSize({ width, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `No horizontal overflow at ${width}px`);
}
assert.deepEqual(errors, []);
await browser.close();
console.log('PASS polysemy catalog, focused module views, practice, direct links, history and mobile widths');
