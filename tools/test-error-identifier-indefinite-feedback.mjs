import assert from 'node:assert/strict';
import fs from 'node:fs';

const { chromium } = await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1300, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));

await page.route('**/error-identifier.css', route => route.fulfill({
  contentType: 'text/css',
  body: fs.readFileSync('error-identifier.css', 'utf8')
}));
await page.route('**/error-identifier-indefinite.css', route => route.fulfill({
  contentType: 'text/css',
  body: fs.readFileSync('error-identifier-indefinite.css', 'utf8')
}));
await page.route('**/error-identifier-system.html', route => route.fulfill({
  contentType: 'text/html',
  body: '<html><head><link rel="stylesheet" href="error-identifier.css"><link rel="stylesheet" href="error-identifier-indefinite.css"></head><body><div data-view="dashboard"><section data-error-id-modes><div class="error-id-module-list"><button class="error-id-module-card" data-module="1">Module 1</button></div></section><section data-error-id-single hidden></section><section data-error-id-passage hidden></section><section data-error-id-bar hidden></section></div></body></html>'
}));
await page.goto('http://127.0.0.1:8633/error-identifier-system.html');

await page.evaluate(() => {
  window.qaSession = { user: { id: 'qa-indefinite' }, token: 'qa-token' };
  window.qaAnswers = {};
  window.qaWrites = 0;
  window.EDMUND_DURABLE_STUDENT_PROGRESS = {
    read: async () => ({ current: 1, answers: {} }),
    write: async () => 'stored'
  };
  window.EDMUND_LEARNING_PORTAL_CONTEXT = {
    getSession: () => window.qaSession,
    rpc: async (name, args) => {
      if (name !== 'error_identifier_indefinite_action') throw Error('unexpected RPC');
      if (args.p_answer) {
        window.qaAnswers[args.p_number] = args.p_answer;
        window.qaWrites++;
      }
      const feedback = Object.fromEntries(Object.keys(window.qaAnswers).map(number => [number, {
        mark: Number(number) === 1 ? 'cross' : 'tick',
        wrong: 'Anybody',
        fix: 'Somebody',
        correct_sentence: 'Somebody left a scarf on the library desk this morning.',
        reason: '肯定陳述句一般使用 some- 字頭的不定代名詞。'
      }]));
      return { answers: window.qaAnswers, feedback };
    }
  };
});

await page.addScriptTag({ path: 'grammar-indefinite-pronouns-data.js' });
await page.addScriptTag({ path: 'error-identifier-indefinite.js' });
assert.equal(await page.locator('[data-module="2"]').count(), 1);
await page.locator('[data-module="2"]').click();
assert.equal(await page.locator('[data-j-submit]').count(), 0);

await page.locator('[data-mark="tick"]').click();
await page.locator('.error-id-feedback').waitFor();
assert.equal(await page.locator('.error-id-feedback__compare').count(), 1);
assert((await page.locator('.error-id-feedback').innerText()).includes('判斷需修正'));
assert.equal(await page.evaluate(() => window.qaWrites), 1);

await page.locator('[data-next]').click();
await page.locator('[data-mark="cross"]').click();
await page.locator('[data-field="wrong"]').fill('Anybody');
await page.locator('[data-field="fix"]').fill('Somebody');
await page.locator('.error-id-feedback').waitFor();
assert.equal(await page.evaluate(() => window.qaWrites), 2);
assert((await page.locator('[data-progress]').innerText()).startsWith('2 / 200'));
assert((await page.locator('[data-status]').innerText()).includes('參考答案已顯示'));
assert.deepEqual(errors, []);
await page.screenshot({ path: '/private/tmp/indefinite-feedback-parity.png', fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)));

await browser.close();
console.log('PASS Module 2 automatically saves complete answers and reveals Module 1-style comparison and rationale.');
