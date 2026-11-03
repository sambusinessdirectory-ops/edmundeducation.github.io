// Run with Playwright installed. Pass the public Paper 3 entry URL to check a deployment.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

async function checkReader() {
  const url = process.argv[2] || pathToFileURL(path.resolve(__dirname, '../paper3/2023-b2/index.html')).href + '?curation=1';
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    // An older cached script once tried to hide the removed PDF iframe on restore.
    // The native reader must load a coherent release even if that URL is stale.
    await page.route('**/lesson.js*', route => route.fulfill({
      contentType: 'text/javascript',
      body: "document.getElementById('pdf').hidden = true;",
    }));
    await page.goto(url);
    const next = page.locator('#curation-next');
    const counter = page.locator('#curation-step-jump');
    await counter.waitFor();
    assert.match(await counter.innerText(), /1 \/ 16/);
    await next.click();
    assert(await page.locator('.source #page-4').isVisible());
    await next.click();
    await next.click();
    await next.click();
    await page.reload();
    assert(await page.locator('.source #page-5').isVisible());
    assert.match(await next.innerText(), /返回/);
    await next.click();
    assert(await page.locator('.source #page-4').isVisible());
    assert.match(await page.locator('#curation-quote').innerText(), /see the article/);
    await page.locator('[data-chapter=categorize]').click();
    await page.reload();
    assert.match(await counter.innerText(), /1 \/ 15/);
    assert(await page.locator('.source #page-5 h5').first().isVisible());
    assert.match(await page.locator('#curation-explanation').innerText(), /小報/);
    assert.equal(await page.locator('#curation-bank-groups details').count(), 3);
    assert.deepEqual(errors, []);
    for (const mode of ['denied', 'full']) {
      const restricted = await browser.newPage();
      await restricted.addInitScript(mode => {
        if (mode === 'full') {
          Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
        } else {
          for (const key of ['localStorage', 'sessionStorage']) {
            Object.defineProperty(window, key, { get() { throw new DOMException('Blocked', 'SecurityError'); } });
          }
        }
      }, mode);
      await restricted.goto(url);
      await restricted.locator('[data-chapter=categorize]').click();
      assert.equal(await restricted.locator('html[data-loading]').count(), 0);
      assert.equal(await restricted.locator('#curation-bank-groups details').count(), 3);
      assert.match(await restricted.locator('#curation-save-status').textContent(), /匯出/);
      await restricted.close();
    }
  } finally {
    await browser.close();
  }
}
checkReader().catch(error => { console.error(error); process.exitCode = 1; });
