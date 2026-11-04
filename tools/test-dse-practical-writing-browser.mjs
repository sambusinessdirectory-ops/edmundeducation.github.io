import assert from 'node:assert/strict';
import { chromium } from '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

const origin = process.env.DSE_PRACTICAL_WRITING_ORIGIN || 'http://127.0.0.1:8123';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('console', message => {
  if (message.type() !== 'error') return;
  const text = message.text();
  // Shared third-party support scripts attempt an optional inline style; this page's strict CSP correctly blocks it.
  if (text.includes("Applying inline style violates the following Content Security Policy directive")) return;
  errors.push(text);
});
page.on('pageerror', error => errors.push(error.message));

try {
  await page.goto(`${origin}/dse-practical-writing.html?preview=1`, { waitUntil: 'networkidle' });
  assert.match(await page.locator('.mode-hub').evaluate(node => getComputedStyle(node).backgroundImage), /mode-folders-v2\.webp/);
  await page.locator('[data-mode="learning"]').click();
  assert.equal(await page.locator('.map-index button').count(), 13, 'learning route must expose 13 units');
  assert.match(await page.locator('.campaign-map').evaluate(node => getComputedStyle(node).backgroundImage), /selection-map-v2\.webp/);
  assert.match(await page.locator('.map-index button').first().evaluate(node => getComputedStyle(node).backgroundImage), /location-marker-v2\.webp/);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2), true, 'desktop route must not overflow horizontally');

  const [label8, label9] = await Promise.all([
    page.locator('.map-index button').nth(7).locator('span').boundingBox(),
    page.locator('.map-index button').nth(8).locator('span').boundingBox()
  ]);
  assert.ok(label8 && label9);
  const overlap = label8.x < label9.x + label9.width && label8.x + label8.width > label9.x && label8.y < label9.y + label9.height && label8.y + label8.height > label9.y;
  assert.equal(overlap, false, 'neighbouring route labels must not overlap');

  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2), true, 'mobile route must not overflow horizontally');
  assert.equal(await page.locator('.map-index button').count(), 13);

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${origin}/dse-practical-writing.html?preview=1&mode=practice&item=workshop-enquiry`, { waitUntil: 'networkidle' });
  assert.match(await page.locator('.briefing-scene').evaluate(node => getComputedStyle(node).backgroundImage), /briefing-dossier-v2\.webp/);
  await page.locator('[data-action="start"]').click();
  await page.locator('.writing-desk').waitFor();
  assert.equal(await page.evaluate(() => window.scrollY), 0, 'workspace must open at the top');
  assert.match(await page.locator('.writing-desk').evaluate(node => getComputedStyle(node).backgroundImage), /writing-file-v2\.webp/);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2), true, 'desktop workspace must not overflow horizontally');

  const submit = page.locator('.submit-writing');
  assert.equal(await submit.textContent(), '完成並提交');
  const submitStyle = await submit.evaluate(node => ({ background: getComputedStyle(node).backgroundImage, color: getComputedStyle(node).color }));
  assert.notEqual(submitStyle.background, 'none', 'submit button must retain its accent fill');
  assert.equal(submitStyle.color, 'rgb(255, 255, 255)');

  await page.locator('.model-button').click();
  assert.equal(await page.locator('[data-model-dialog]').getAttribute('open'), '');
  const englishBlocks = await page.locator('[data-model-copy] .model-english').count();
  await page.locator('[data-model-language]').click();
  assert.equal(await page.locator('[data-model-copy] .model-chinese').count(), englishBlocks, 'every English model block must reveal its paired Traditional Chinese block');
  assert.equal(errors.length, 0, `browser console errors: ${errors.join(' | ')}`);
  console.log('DSE practical-writing visual browser checks passed.');
} finally {
  await browser.close();
}
