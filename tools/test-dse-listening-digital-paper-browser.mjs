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

  assert.equal(await page.locator('.digital-paper-page').count(), 1);
  assert.equal(await page.locator('.digital-paper-page').getAttribute('id'), 'original-paper-3');
  assert.equal(await page.locator('.original-paper-dialog').count(), 0);
  assert.equal(await page.locator('.original-paper-page > img').count(), 0);
  assert.equal(await page.locator('[data-original-q]').evaluateAll(inputs => new Set(inputs.map(input => input.dataset.originalQ)).size), 15);
  assert.equal(await page.locator('[data-dse-reveal]').count(), 15);
  assert.equal(await page.locator('[data-dse-digital-answer-dock]').count(), 0);
  assert.ok(await page.locator('.digital-paper-translation').count() >= 20);
  assert.equal(await page.locator('[data-dse-toggle-question-zh]').count(), 0);
  const translationToggle = page.locator('[data-toggle-dse-digital-zh]');
  assert.equal(await translationToggle.getAttribute('aria-pressed'), 'true');
  assert.match(await translationToggle.textContent(), /隱藏中文翻譯/);
  await translationToggle.click();
  assert.equal(await translationToggle.getAttribute('aria-pressed'), 'false');
  assert.equal(await page.locator('.digital-paper-translation:visible').count(), 0);
  assert.match(await translationToggle.textContent(), /顯示中文翻譯/);
  await page.reload({waitUntil: 'domcontentloaded'});
  await page.locator('.dse-digital-paper-frame').waitFor();
  assert.equal(await translationToggle.getAttribute('aria-pressed'), 'false');
  assert.equal(await page.locator('.digital-paper-translation:visible').count(), 0);
  await translationToggle.click();
  assert.ok(await page.locator('.digital-paper-translation:visible').count() >= 20);
  const firstAnswerDistance = await page.locator('[data-dse-answer-q="1"]').evaluate(input => {
    const button = input.closest('p')?.querySelector('[data-dse-reveal="1"]');
    return button ? Math.abs(button.getBoundingClientRect().left - input.getBoundingClientRect().right) : Infinity;
  });
  assert.ok(firstAnswerDistance < 220, `answer button too far from Q1: ${firstAnswerDistance}`);
  const firstEnglish = page.locator('.digital-paper-task-one h3').first();
  const firstChinese = firstEnglish.locator('xpath=following-sibling::*[1]');
  assert.ok(await firstChinese.evaluate(node => node.classList.contains('digital-paper-translation')));
  assert.equal(await firstChinese.getAttribute('lang'), 'zh-Hant');

  for (const [task, expectedPages, firstQuestion, lastQuestion] of [[1,[3],1,15],[2,[4],16,31],[3,[5,6],32,47],[4,[7,8],48,58]]) {
    if (task !== 1) await page.locator(`[data-dse-task-tab="${task}"]`).click();
    await page.locator(`#original-paper-${expectedPages[0]}`).waitFor();
    await page.waitForFunction(() => [...document.images].filter(image => image.closest('.dse-digital-paper-frame')).every(image => image.complete && image.naturalWidth > 0));
    assert.equal(await page.locator('.digital-paper-page').count(), expectedPages.length);
    assert.deepEqual(await page.locator('.digital-paper-page').evaluateAll(nodes => nodes.map(node => Number(node.id.replace('original-paper-','')))), expectedPages);
    const questions = await page.locator('[data-original-q]').evaluateAll(inputs => [...new Set(inputs.map(input => Number(input.dataset.originalQ)))].sort((a,b) => a-b));
    assert.deepEqual(questions, Array.from({length:lastQuestion-firstQuestion+1},(_,index)=>firstQuestion+index));
    assert.equal(await page.locator('[data-dse-reveal]').count(), lastQuestion-firstQuestion+1);
    assert.ok(await page.locator('.digital-paper-translation').count() > 0);
    if (task === 2) {
      assert.equal(await page.locator('.digital-paper-exhibit-table img').count(), 2);
      assert.ok(await page.locator('.digital-paper-exhibit-table img').evaluateAll(images => images.every(image => image.naturalWidth >= 1000)));
    }
    if (task === 4) assert.ok(await page.locator('.digital-paper-james > img').evaluate(image => image.naturalWidth >= 1000));
    await page.locator(`#original-paper-${expectedPages[0]}`).screenshot({path: `${output}/task-${task}.png`});
  }
  assert.equal(await page.locator('.digital-paper-exhibit-table img').count(), 0);
  assert.equal(await page.locator('.digital-paper-james > img').count(), 1);
  assert.ok(await page.locator('.digital-paper-james > img').evaluate(image => image.naturalWidth >= 1000));
  assert.deepEqual(errors, []);
  console.log('2016 digitised paper browser: four separate tasks, inline Paper 3-style Chinese and per-question answer controls passed.');
} finally {
  await browser.close();
}
