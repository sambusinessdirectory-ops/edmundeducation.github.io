const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = path.resolve(__dirname, '..');
for (const page of ['phrasal-verb-system.html', 'proverb-system.html', 'idiom-system.html', 'polysemy-lab.html', 'synonyms-system.html', 'natural-english.html', 'irregular-verb-system.html', 'reading-logic-system.html', 'reading-logic-exercise-1.html']) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert.match(html, /eddy-mc-wrong-streak-dialogue\.css\?v=20261101-1/);
  assert.match(html, /eddy-mc-wrong-streak-dialogue\.js\?v=20261101-1/);
}
for (const source of ['phrasal-verb-system.js', 'proverb-system.js', 'idiom-system.js', 'polysemy-lab/app.mjs', 'synonyms/app.mjs', 'natural-english/app.mjs', 'reading-logic/reading-logic.js', 'irregular-verbs/app.mjs']) {
  assert.ok(/mc\s*:\s*true|mc:true|correct, mc/.test(fs.readFileSync(path.join(root, source), 'utf8')), `${source} marks MC results`);
}
for (const asset of ['eddy-two-wrong-mc-dialogue.png', 'eddy-three-wrong-mc-dialogue.png']) assert.ok(fs.statSync(path.join(root, asset)).size > 100000);
const fixture = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/eddy-first-question-dialogue.css"><link rel="stylesheet" href="/eddy-mc-wrong-streak-dialogue.css"></head><body><button id="answer">Answer</button><script src="/eddy-mc-wrong-streak-dialogue.js"></script></body></html>';
const server = http.createServer((req, res) => {
  if (req.url === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(fixture); return; }
  const file = path.join(root, decodeURIComponent(req.url.slice(1)));
  if (!file.startsWith(root) || !fs.existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'image/png' });
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
  await page.addInitScript(() => { Math.random = () => 0; });
  const send = (correct, scope = 'polysemy:student:lesson', mc = true) => page.evaluate(({ correct, scope, mc }) => {
    document.dispatchEvent(new CustomEvent('edmund:eddy-streak-answer', { detail: { scope, correct, mc } }));
  }, { correct, scope, mc });
  const art = page.locator('.eddy-mc-wrong-overlay img');
  try {
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await send(false, undefined, false);
    await send(false);
    assert.equal(await art.count(), 0, 'one MC error is below threshold');
    await send(false);
    await art.waitFor();
    await art.evaluate(img => img.decode());
    assert.match(await art.getAttribute('src'), /two-wrong-mc/);
    assert.match(await page.locator('.eddy-mc-wrong-message strong').textContent(), /連錯兩題/);
    const fit = await page.locator('.eddy-mc-wrong-message').evaluate(node => ({ scroll: node.scrollHeight, height: node.clientHeight }));
    assert.ok(fit.scroll <= fit.height + 1, `two-error copy fits mobile: ${JSON.stringify(fit)}`);
    await page.keyboard.press('Escape');
    await art.waitFor({ state: 'detached' });
    await send(false);
    await art.waitFor();
    assert.match(await art.getAttribute('src'), /three-wrong-mc/);
    await page.keyboard.press('Escape');
    await art.waitFor({ state: 'detached' });
    await send(false);
    assert.equal(await art.count(), 0, 'fourth error does not repeat milestone');
    await send(true);
    await send(false);
    assert.equal(await art.count(), 0, 'correct answer resets streak');
    await send(false);
    await art.waitFor();
    assert.match(await art.getAttribute('src'), /two-wrong-mc/, 'new streak can reach two again');
    await page.keyboard.press('Escape');
    await page.reload();
    await send(false, 'idiom:student:lesson');
    assert.equal(await art.count(), 0, 'other lesson scope starts at one');
    await send(false, 'idiom:student:lesson');
    await art.waitFor();
    assert.match(await art.getAttribute('src'), /two-wrong-mc/);
    console.log('MC wrong-streak browser checks passed.');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
