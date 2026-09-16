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
  await page.goto(`${base}/listening-system.html`, {waitUntil: 'domcontentloaded'});
  await page.evaluate(async () => {
    const module = await import('./dse-listening-original-paper.mjs');
    window.digitalPaperAnswers = new Map();
    await module.openOriginalPaper({answers: window.digitalPaperAnswers, owner: 'digital-paper-test', task: 1});
  });
  await page.locator('[data-original-q="1"]').waitFor();
  await page.waitForFunction(() => [...document.images].filter(image => image.closest('.original-paper-dialog')).every(image => image.complete));

  assert.equal(await page.locator('.digital-paper-page').count(), 8);
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
    await page.locator(`[data-paper-page]`).selectOption(String(number));
    await page.locator(`#original-paper-${number}`).screenshot({path: `${output}/page-${number}.png`});
  }
  assert.deepEqual(errors, []);
  console.log('2016 digitised paper browser: eight unclipped pages, 58 controls, high-resolution illustrations and scan-free layout passed.');
} finally {
  await browser.close();
}
