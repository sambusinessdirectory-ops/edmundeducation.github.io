const assert = require('node:assert/strict');
const { chromium, firefox } = require(process.env.PLAYWRIGHT_MODULE || process.env.HOME + '/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const origin = process.env.PAPER3_2022_ORIGIN || 'http://127.0.0.1:8765';

async function journey(engine, name) {
  const browser = await engine.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/paper3/2022-b2/`, { waitUntil: 'domcontentloaded' });
    await page.locator('.curation-launch').waitFor();
    assert.equal(await page.locator('.paper-page').count(), 19, `${name}: complete page count`);
    assert.equal(await page.locator('.curation-unit').count() > 100, true, `${name}: sentence/source-unit coverage`);
    assert.equal(await page.locator('.curation-hub').count(), 0, `${name}: obsolete in-flow overlay removed`);
    await page.locator('.curation-launch').click();
    assert.equal(await page.locator('#curation-stage [data-chapter]').count(), 5, `${name}: five-stage rail`);
    assert.equal(await page.locator('#curation-dock').isVisible(), true, `${name}: fixed left curation dock`);
    assert.equal(await page.locator('#curation-bank').isVisible(), true, `${name}: fixed right evidence bank`);
    assert.equal(await page.locator('#curation-slot option').count(), 5, `${name}: five persistent save slots`);
    const geometry = await page.evaluate(() => ({stage:getComputedStyle(document.querySelector('#curation-stage')).position,dock:getComputedStyle(document.querySelector('#curation-dock')).position,bank:getComputedStyle(document.querySelector('#curation-bank')).position}));
    assert.deepEqual(geometry, {stage:'fixed',dock:'fixed',bank:'fixed'}, `${name}: 2025 desktop architecture`);

    await page.locator('#curation-stage [data-chapter="podcast"]').click();
    const audio = page.locator('#b2-podcast');
    assert.match(await audio.getAttribute('src'), /DSE%202022%20Part%20B\.mp3$/, `${name}: authentic podcast URL`);
    assert.equal(await page.locator('[data-cue]').count(), 8, `${name}: cue manifest`);
    await page.locator('#curation-podcast [data-cue="1"]').click();
    await page.locator('#curation-next').click();
    assert.match(await page.locator('#page-3 textarea').first().inputValue(), /Neon Award/, `${name}: listening-to-note transaction`);

    await page.locator('#curation-stage [data-chapter="writing"]').click();
    await page.locator('#curation-task-jump button', { hasText: 'Task C' }).click();
    assert.match(await page.locator('#curation-writing').innerText(), /REVISED BENCHMARK · TASK 10/, `${name}: revised Task 10 essay`);
    assert.match(await page.locator('#curation-analysis').innerText(), /句子功能/, `${name}: line-by-line essay analysis`);

    const note = page.locator('#page-3 textarea').first();
    await note.fill('Neon Award persistence check');
    await note.dispatchEvent('input');
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('#page-3 textarea').first().inputValue(), 'Neon Award persistence check', `${name}: original note field persistence`);
    assert.deepEqual(errors, [], `${name}: no page errors`);

    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), true, `${name}: no mobile horizontal overflow`);
    return { engine: name, units: await page.locator('.curation-unit').count(), stages: await page.locator('#curation-stage [data-chapter]').count() };
  } finally {
    await browser.close();
  }
}

(async () => {
  const results = [];
  results.push(await journey(chromium, 'Chromium'));
  results.push(await journey(firefox, 'Firefox'));
  console.log(`PASS 2022 B2 Super Curation: ${JSON.stringify(results)}`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
