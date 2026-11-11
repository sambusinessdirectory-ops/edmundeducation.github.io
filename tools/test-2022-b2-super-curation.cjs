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
    await page.locator('.curation-hub').waitFor();
    assert.equal(await page.locator('.paper-page').count(), 19, `${name}: complete page count`);
    assert.equal(await page.locator('.curation-tag').count() > 100, true, `${name}: sentence/source-unit coverage`);
    for (let type = 1; type <= 6; type += 1) assert.equal(await page.locator(`.curation-tag.type-${type}`).count() > 0, true, `${name}: type ${type} represented`);
    assert.equal(await page.locator('.curation-tag').evaluateAll(nodes => nodes.every(node => /^curation-tag type-[1-6]$/.test(node.className))), true, `${name}: one primary type per unit`);

    await page.locator('[data-stage="listen"]').click();
    const audio = page.locator('#b2-podcast');
    assert.match(await audio.getAttribute('src'), /DSE%202022%20Part%20B\.mp3$/, `${name}: authentic podcast URL`);
    assert.equal(await page.locator('[data-cue]').count(), 8, `${name}: cue manifest`);
    await page.locator('[data-cue="1"]').click();
    assert.equal(await page.locator('.cue-note-prompt').isVisible(), true, `${name}: listening-to-note transaction`);

    await page.locator('[data-stage="write"]').click();
    await page.locator('[data-essay="10"]').click();
    assert.match(await page.locator('#essay-view').innerText(), /Neon gas comes from inside stars/, `${name}: revised Task 10 essay`);
    assert.equal(await page.locator('#essay-view .essay-sentence').count() >= 10, true, `${name}: line-by-line essay analysis`);

    const note = page.locator('#page-3 textarea').first();
    await note.fill('Neon Award persistence check');
    await note.dispatchEvent('input');
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('#page-3 textarea').first().inputValue(), 'Neon Award persistence check', `${name}: original note field persistence`);
    assert.deepEqual(errors, [], `${name}: no page errors`);

    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), true, `${name}: no mobile horizontal overflow`);
    return { engine: name, units: await page.locator('.curation-tag').count(), guides: await page.locator('.essay-guide-stack').count() };
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
