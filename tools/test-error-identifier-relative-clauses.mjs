import assert from 'node:assert/strict';
import fs from 'node:fs';

const {chromium} = await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const reference = JSON.parse(fs.readFileSync('course-materials/error-identifier/source/relative-clauses-400.json', 'utf8')).questions;
const browser = await chromium.launch();
const page = await browser.newPage({viewport:{width:1300, height:1000}});
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.route('**/error-identifier.css', route => route.fulfill({contentType:'text/css', body:fs.readFileSync('error-identifier.css', 'utf8')}));
await page.route('**/error-identifier-system.html', route => route.fulfill({contentType:'text/html', body:`<html><head><link rel="stylesheet" href="error-identifier.css"></head><body><div data-view="dashboard"><section data-error-id-modes><div class="error-id-module-list"><button class="error-id-module-card">Module 1</button><button class="error-id-module-card">Module 2</button><button class="error-id-module-card">Module 3</button></div></section><section data-error-id-single hidden></section><section data-error-id-passage hidden></section><section data-error-id-bar hidden></section></div></body></html>`}));
await page.goto('http://127.0.0.1:8633/error-identifier-system.html');
await page.evaluate(referenceData => {
  window.qaSession = {user:{id:'qa-relative'}, token:'qa-token'};
  window.qaAnswers = {};
  window.qaReference = referenceData;
  window.EDMUND_LEARNING_PORTAL_CONTEXT = {
    getSession:() => window.qaSession,
    rpc:async (name, args) => {
      if (name !== 'error_identifier_relative_clauses_action') throw Error(`unexpected RPC ${name}`);
      if (args.p_answer) window.qaAnswers[args.p_number] = args.p_answer;
      return {
        answers:window.qaAnswers,
        feedback:Object.fromEntries(Object.keys(window.qaAnswers).map(number => [number, window.qaReference[Number(number) - 1]]))
      };
    }
  };
}, reference);
await page.addScriptTag({path:'error-identifier-relative-clauses-questions.js'});
await page.addScriptTag({path:'error-identifier-relative-clauses.js'});

assert.equal(await page.evaluate(() => ERROR_IDENTIFIER_RELATIVE_CLAUSES_QUESTIONS.length), 400);
assert.equal(await page.locator('.error-id-module-card').count(), 4);
await page.locator('[data-open-relative-clauses]').click();
assert.equal(await page.locator('[data-relative-paper] option').count(), 20);
assert.equal(await page.locator('[data-relative-go]').count(), 20);
assert.match(await page.locator('[data-relative-question]').innerText(), /第 1 \/ 400 題/);
await page.locator('[data-relative-mark=cross]').click();
await page.locator('[data-relative-word="2"]').click();
await page.locator('[data-relative-field=fix]').fill('whom');
await page.locator('.error-id-feedback').waitFor();
assert.equal(await page.locator('.relative-guide').count(), 4);
assert.match(await page.locator('.error-id-feedback').innerText(), /RC\.16\.01/);
assert.match(await page.locator('[data-relative-progress]').innerText(), /^1 \/ 400/);
await page.locator('[data-relative-paper]').selectOption('20');
await page.locator('[data-relative-go="400"]').click();
assert.match(await page.locator('[data-relative-question]').innerText(), /400 \/ 400/);
await page.setViewportSize({width:390, height:844});
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
await page.screenshot({path:'/private/tmp/error-identifier-relative-clauses-mobile.png', fullPage:true});
await page.locator('[data-relative-back]').click();
assert.equal(await page.locator('[data-error-id-modes]').isVisible(), true);
await page.evaluate(() => { window.qaSession = {user:null, token:''}; dispatchEvent(new Event('edmund:learning-portal-session')); });
assert.equal(await page.locator('.relative-workspace').isHidden(), true);
assert.deepEqual(errors, []);
await browser.close();
console.log('PASS Module 4 has 400 questions, 20 sets, secure automatic feedback, four-part recurated explanations, navigation, logout isolation and mobile layout.');
