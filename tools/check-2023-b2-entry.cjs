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
    assert.match(await counter.innerText(), /1 \/ 21/);
    const bossAudit = await page.evaluate(() => {
      const boss = rows.filter(row => row.stage === 0);
      const page4 = boss.filter(row => row.leaf === 4);
      const find = quote => page4.find(row => row.q === quote);
      return {
        total: boss.length,
        page4: page4.length,
        sourceComplete: page4.every(row => nativePages23[3].includes(row.q)),
        taskA: find('I need you to write the announcement for our website to show our support for Teen NetChef TV star William Puddle.')?.marks,
        danteRoute: [...routes].find(([cue]) => find('Dante Cruz’s most recent email sets the scene for this, so take a look at that first.')?.q.includes(cue))?.[1],
        taskB: find('Three courses will be enough: briefly describe the three courses staff should sign up for (I think it’s pretty clear which three stand out) and explain how their work will benefit from each one.')?.marks,
        taskC: find('Next, please write the script for the promotional video for our new cookery show Viewer’s Choice.')?.marks,
        storyboardRoute: [...routes].find(([cue]) => find('I’ve sent you a draft of the storyboard for the video, along with comments from Dante, so you know what to write about.')?.q.includes(cue))?.[1],
      };
    });
    assert.equal(bossAudit.total,21);
    assert.equal(bossAudit.page4,20);
    assert.equal(bossAudit.sourceComplete,true);
    assert.deepEqual(bossAudit.taskA.map(mark => mark[0]),['announcement for our website','show our support','Teen NetChef TV','William Puddle']);
    assert.equal(bossAudit.danteRoute,8);
    assert.deepEqual(bossAudit.taskB.map(mark => [mark[0],mark[2]]),[['Three courses will be enough','1'],['briefly describe the three courses staff should sign up for','2'],['explain how their work will benefit from each one','3']]);
    assert(bossAudit.taskC.some(mark => mark[0] === 'Viewer’s Choice'));
    assert.equal(bossAudit.storyboardRoute,6);
    await next.click();
    assert(await page.locator('.source #page-4').isVisible());
    await next.click();
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
