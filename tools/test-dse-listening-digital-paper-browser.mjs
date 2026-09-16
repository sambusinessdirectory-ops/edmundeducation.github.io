import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdir} from 'node:fs/promises';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const base = process.env.STUDY_TEST_URL || 'http://127.0.0.1:8774';
const output = '/private/tmp/speaking-study-qa/digital-paper';
await mkdir(output, {recursive: true});

const browser = await chromium.launch({headless: true});
try {
  const page = await browser.newPage({viewport: {width: 1500, height: 1600}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  await page.addInitScript(() => {
    sessionStorage.setItem('edmund-listening-session-v1', JSON.stringify({id: 'digital-paper-test', name: 'Test', token: 'test-token', role: 'student'}));
    window.supabase = {createClient: () => ({auth: {getSession: async () => ({data: {session: {user: {id: 'auth-test'}}}})}, rpc: async name => ({data: name === 'flashcard_student_session_profile' ? [{id: 'digital-paper-test', name: 'Test', session_token: 'test-token'}] : []})})};
  });
  await page.goto(`${base}/listening-system.html?section=dse&year=2016&task=1`, {waitUntil: 'domcontentloaded'});
  await page.locator('.dse-digital-paper-frame [data-original-q="1"]').waitFor();
  await page.locator('.digital-paper-page .pos-guess').first().waitFor();
  await page.waitForFunction(() => [...document.images].filter(image => image.closest('.dse-digital-paper-frame')).every(image => image.complete));

  assert.equal(await page.locator('.digital-paper-page').count(), 8);
  assert.equal(await page.locator('.original-paper-dialog').count(), 0);
  assert.equal(await page.locator('.original-paper-page > img').count(), 0);
  assert.equal(await page.locator('[data-original-q]').evaluateAll(inputs => new Set(inputs.map(input => input.dataset.originalQ)).size), 58);
  assert.equal(await page.locator('.digital-paper-exhibit-table img').count(), 2);
  assert.equal(await page.locator('.digital-paper-james > img').count(), 1);
  assert.ok(await page.locator('.digital-paper-exhibit-table img').evaluateAll(images => images.every(image => image.naturalWidth >= 1000)));
  assert.ok(await page.locator('.digital-paper-james > img').evaluate(image => image.naturalWidth >= 1000));

  const clipping = await page.locator('.digital-paper-page').evaluateAll(pages => pages.map((paper, index) => ({
    page: index + 1,
    scrollHeight: paper.scrollHeight,
    clientHeight: paper.clientHeight
  })).filter(item => item.scrollHeight > item.clientHeight + 2));
  assert.deepEqual(clipping, []);
  const answerCollisions = await page.locator('.digital-paper-page').evaluateAll(pages => pages.flatMap((paper, index) => {
    const footerTop = paper.querySelector('footer').getBoundingClientRect().top;
    const answerBottom = Math.max(...[...paper.querySelectorAll('[data-original-q]')].map(input => input.getBoundingClientRect().bottom), -Infinity);
    return answerBottom > footerTop - 8 ? [{page: index + 1, answerBottom, footerTop}] : [];
  }));
  assert.deepEqual(answerCollisions, []);

  for (let number = 1; number <= 8; number += 1) {
    await page.locator(`[data-dse-paper-page]`).selectOption(String(number));
    const expectedTask = ({3: 1, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4})[number];
    if (expectedTask) assert.match(await page.locator('[data-check-dse-task]').textContent(), new RegExp(`Task ${expectedTask}`));
    await page.locator(`#original-paper-${number}`).screenshot({path: `${output}/page-${number}.png`});
  }
  assert.deepEqual(errors, []);
  console.log('2016 digitised paper browser: default inline view, eight unclipped pages, 58 controls, high-resolution illustrations and scan-free layout passed.');
} finally {
  await browser.close();
}
