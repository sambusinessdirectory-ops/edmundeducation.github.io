const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = path.resolve(__dirname, '..');
const server = http.createServer((request, response) => {
  if (request.url === '/') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    response.end(`<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1">
      <link rel="stylesheet" href="/eddy-first-question-dialogue.css"><link rel="stylesheet" href="/eddy-five-streak-dialogue.css"><link rel="stylesheet" href="/eddy-student-progress-dialogue.css">
      <section data-view="dashboard"></section><button id="focus">Focus</button>
      <script src="/eddy-five-streak-dialogue.js"></script><script src="/eddy-student-progress-dialogue.js"></script>`);
    return;
  }
  const file = path.join(root, decodeURIComponent(request.url.split('?')[0].slice(1)));
  if (!file.startsWith(root) || !fs.existsSync(file)) { response.writeHead(404).end(); return; }
  response.writeHead(200, { 'content-type': file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'image/png' });
  fs.createReadStream(file).pipe(response);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await page.addInitScript(() => { Math.random = () => 0; });
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    for (const [streak, image] of [[30, 'eddy-thirty-streak-alien.png'], [35, 'eddy-thirty-five-streak-gentleman.png']]) {
      await page.evaluate(streak => document.dispatchEvent(new CustomEvent('edmund:eddy-streak-answer', {
        detail: { scope: 'student:lesson', correct: true, streak }
      })), streak);
      const overlay = page.locator('.eddy-five-streak-overlay');
      await overlay.waitFor();
      assert.equal(await overlay.locator('img').getAttribute('src'), image);
      await overlay.locator('img').evaluate(img => img.decode());
      assert.ok((await overlay.locator('.eddy-first-question-message').textContent()).includes(String(streak)));
      const fit = await overlay.locator('.eddy-first-question-message').evaluate(node => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
      assert.ok(fit.scroll <= fit.visible + 1, `${streak} copy fits on mobile: ${JSON.stringify(fit)}`);
      await page.keyboard.press('Escape');
      await overlay.waitFor({ state: 'detached' });
    }
    await page.evaluate(() => document.dispatchEvent(new CustomEvent('edmund:student-progress-opened', { detail: { studentId: 'student-1' } })));
    const progress = page.locator('.eddy-student-progress-overlay');
    await progress.waitFor();
    assert.equal(await progress.locator('img').getAttribute('src'), 'eddy-student-progress-dialogue.png');
    await progress.locator('img').evaluate(img => img.decode());
    await page.keyboard.press('Escape');
    await progress.waitFor({ state: 'detached' });
    await page.evaluate(() => document.dispatchEvent(new CustomEvent('edmund:student-progress-opened', { detail: { studentId: 'student-1' } })));
    assert.equal(await progress.count(), 0, 'progress greeting appears once per student session');
    console.log('Correct streak and progress greeting browser checks passed.');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
