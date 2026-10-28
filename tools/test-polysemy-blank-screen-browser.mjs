import assert from 'node:assert/strict';
import {questions} from '../polysemy-lab/show.mjs';

const {chromium, webkit} = await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || 'playwright');
const browser = await (process.argv.includes('WebKit') ? webkit : chromium).launch({headless: true});
const context = await browser.newContext({serviceWorkers: 'block', viewport: {width: 1280, height: 900}});
const page = await context.newPage();
const errors = [];
const saved = [];
const student = {id: '11111111-1111-4111-8111-111111111111', name: 'Student', role: 'student', session_token: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'};
page.on('pageerror', error => errors.push(error.message));
await context.route('**/polysemy-lab.html*', async route => {
  const response = await route.fetch();
  await route.fulfill({response, body: (await response.text()).replace(/ integrity="[^"]+"/g, '')});
});
await context.route('**/supabase.min.js', route => route.fulfill({contentType: 'application/javascript', body: `window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:{user:{id:'transport'}}}})},rpc:(name,args)=>({abortSignal:signal=>fetch('https://ookkxzgpdclzrrhfmvqx.supabase.co/rest/v1/rpc/'+name,{method:'POST',body:JSON.stringify(args),signal}).then(async r=>({data:r.ok?await r.json():null,error:r.ok?null:{message:'Synthetic offline'}}))})})};`}));
await context.route('**/eddy-five-streak-dialogue.js*', route => route.fulfill({contentType: 'application/javascript', body: ''}));
await context.route('**/rest/v1/**', async route => {
  const name = route.request().url().split('/').at(-1);
  const args = route.request().postDataJSON() || {};
  if (name === 'flashcard_student_login' || name === 'flashcard_student_session_profile') return route.fulfill({json: [student]});
  if (name === 'polysemy_lab_modules_sync') {
    for (const event of args.p_events || []) if (!saved.some(item => item.id === event.id)) saved.push(event);
    return route.fulfill({json: {events: saved.filter(event => event.kind !== 'time'), timeDays: []}});
  }
  return route.fulfill({json: {}});
});
await page.goto((process.env.POLYSEMY_QA_BASE || 'http://127.0.0.1:8633') + '/polysemy-lab.html');
await page.locator('[name=username]').fill('homework');
await page.locator('[name=password]').fill('correct');
await page.locator('[data-login-form] [type=submit]').click();
await page.locator('[data-app]').waitFor({state: 'visible'});
await page.locator('[data-module=show]').click();
await page.locator('[data-mode=practice]').click();
await page.locator('.eddy-first-question-dismiss').click();

for (let number = 1; number <= 6; number++) {
  const sentence = await page.locator('.sentence').innerText();
  const question = questions.find(item => item.en.replaceAll('’', "'") === sentence.replaceAll('’', "'"));
  assert.ok(question, `question ${number} renders`);
  await page.locator(`[data-answer="${question.correctOption || question.sense}"]`).click();
  await page.locator('[data-next]').click();
  assert.equal(await page.locator('.sentence').isVisible(), true, `question ${number + 1} is present`);
  const position = await page.locator('[data-practice]').evaluate(element => element.getBoundingClientRect().top);
  assert.ok(position >= -1 && position < 900, `question ${number + 1} stays in the viewport: ${position}`);
}
await page.locator('.eddy-first-question-overlay').waitFor({state: 'visible'});
assert.match(await page.locator('.eddy-first-question-message').innerText(), /第 7 關/);
await page.locator('.eddy-first-question-dismiss').hover({position: {x: 10, y: 10}});
assert.equal(await page.locator('.eddy-first-question-dismiss').evaluate(element => getComputedStyle(element).backgroundColor), 'rgba(0, 0, 0, 0)', 'hover never covers the page with an opaque background');
if (process.env.POLYSEMY_QA_DEBUG) console.log(await page.evaluate(() => {
  const overlay = document.querySelector('.eddy-first-question-overlay');
  const practice = document.querySelector('[data-practice]');
  const app = document.querySelector('[data-app]');
  return {overlayBackground: getComputedStyle(overlay).backgroundColor, overlayOpacity: getComputedStyle(overlay).opacity, overlayRect: overlay.getBoundingClientRect().toJSON(), practiceRect: practice.getBoundingClientRect().toJSON(), practiceVisible: getComputedStyle(practice).display, appVisible: getComputedStyle(app).display, scrollY, bodyText: document.body.innerText.slice(0, 200)};
}));
if (process.env.POLYSEMY_QA_SCREENSHOT) await page.screenshot({path: process.env.POLYSEMY_QA_SCREENSHOT});
await page.locator('.eddy-first-question-dismiss').click();
assert.equal(await page.locator('.sentence').isVisible(), true, 'question remains visible after Eddy closes');
if (process.env.POLYSEMY_QA_SCREENSHOT) await page.screenshot({path: process.env.POLYSEMY_QA_SCREENSHOT.replace(/\.png$/, '-dismissed.png')});
assert.deepEqual(errors, []);
await browser.close();
console.log('PASS: Polysemy questions 1–7 stay visible through the Eddy milestone.');
