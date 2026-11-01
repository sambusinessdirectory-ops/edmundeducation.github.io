const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

const root = path.resolve(__dirname, '..');
const fixture = (body) => `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/eddy-first-question-dialogue.css"><link rel="stylesheet" href="/eddy-portal-entry-dialogue.css"><link rel="stylesheet" href="/eddy-global-dialogues.css"><body>${body}</body>`;
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/grammar-system.html') {
    response.writeHead(200, { 'Content-Type': 'text/html' }).end(fixture('<main data-view="dashboard">Grammar</main><script>window.EDMUND_LEARNING_PORTAL_CONTEXT={portalId:"grammar",getSession:()=>({user:{id:"student-1",role:"student"},token:"test"})}</script><script src="/eddy-portal-entry-dialogue.js"></script>'));
    return;
  }
  if (url.pathname === '/song-appreciation.html') {
    response.writeHead(200, { 'Content-Type': 'text/html' }).end(fixture('<main data-view="student">Songs</main><script src="/eddy-portal-entry-dialogue.js"></script>'));
    return;
  }
  if (['/index.html', '/other-system.html'].includes(url.pathname)) {
    response.writeHead(200, { 'Content-Type': 'text/html' }).end(fixture('<main>Home</main><script src="/eddy-global-dialogues.js"></script>'));
    return;
  }
  const file = path.resolve(root, '.' + url.pathname);
  if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, bytes) => {
    response.writeHead(error ? 404 : 200, { 'Content-Type': file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'image/png' }).end(error ? '' : bytes);
  });
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const grammar = await context.newPage();
    const errors = [];
    grammar.on('pageerror', error => errors.push(error.message));
    await grammar.addInitScript(() => { Math.random = () => .18; });
    await grammar.goto(origin + '/grammar-system.html');
    await grammar.locator('.eddy-portal-entry-overlay').waitFor();
    assert.match(await grammar.locator('.eddy-portal-entry-message').textContent(), /放馬過來/);
    assert.equal(await grammar.locator('.eddy-horse-pun').innerText(), '馬');
    assert.equal(await grammar.locator('.eddy-portal-entry-overlay img').evaluate(image => image.complete && image.naturalWidth > 0), true);
    await grammar.reload();
    await grammar.locator('.eddy-portal-entry-overlay').waitFor();
    assert.equal(await grammar.locator('.eddy-portal-entry-overlay').count(), 1, 'grammar greeting appears again when the system is reopened');
    assert.deepEqual(errors, []);

    const songs = await context.newPage();
    songs.on('pageerror', error => errors.push(error.message));
    await songs.goto(origin + '/song-appreciation.html');
    await songs.evaluate(() => window.dispatchEvent(new CustomEvent('edmund:song-appreciation-student-opened', { detail: { studentId: 'student-1' } })));
    await songs.locator('.eddy-portal-entry-overlay').waitFor();
    assert.equal(await songs.locator('.eddy-portal-entry-overlay img').evaluate(image => image.complete && image.naturalWidth > 0), true);
    await songs.keyboard.press('Escape');
    await songs.locator('.eddy-portal-entry-overlay').waitFor({ state: 'detached' });
    await songs.evaluate(() => { window.dispatchEvent(new Event('edmund:song-appreciation-student-closed')); window.dispatchEvent(new CustomEvent('edmund:song-appreciation-student-opened', { detail: { studentId: 'student-1' } })); });
    await songs.locator('.eddy-portal-entry-overlay').waitFor();
    assert.deepEqual(errors, []);

    const candy = await context.newPage();
    await candy.addInitScript(() => {
      const RealDate = Date;
      window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2027-02-08T03:00:00Z'])); } static now() { return RealDate.parse('2027-02-08T03:00:00Z'); } };
      Math.random = () => .05;
    });
    await candy.goto(origin + '/index.html');
    assert.match(await candy.locator('.eddy-global-art img').getAttribute('src'), /cotton-candy/);
    assert.equal(await candy.locator('.eddy-global-copy strong').innerText(), '拉絲雲朵棉花糖!');
    assert.equal(await candy.locator('.eddy-global-copy > span').isVisible(), false);
    const other = await context.newPage();
    await other.addInitScript(() => { Math.random = () => 0; });
    await other.goto(origin + '/other-system.html');
    assert.equal(await other.locator('.eddy-global-overlay').count(), 0, 'cotton candy stays on the homepage');
    const noCandy = await context.newPage();
    await noCandy.addInitScript(() => {
      const RealDate = Date;
      window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2027-02-08T03:00:00Z'])); } static now() { return RealDate.parse('2027-02-08T03:00:00Z'); } };
      Math.random = () => .1;
    });
    await noCandy.goto(origin + '/index.html');
    assert.equal(await noCandy.locator('.eddy-global-overlay').count(), 0, '10% threshold excludes .1');
    await context.close();
    console.log('PASS: grammar entry greeting, song login greeting, and homepage-only 10% cotton candy event');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
