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
    const announcementScripts = url.searchParams.has('announcement')
      ? '<script>window.EdmundAnnouncementRich={render:(node,runs,message)=>{node.textContent=message},mountCarousel:()=>()=>{}}</script><script src="/site-announcements.js"></script>'
      : '';
    const page = fixture(`<main>Home</main><script src="/eddy-fun-facts.js"></script><script src="/eddy-global-dialogues.js"></script>${announcementScripts}`);
    response.writeHead(200, { 'Content-Type': 'text/html' }).end(url.searchParams.has('loading') ? page.replace('<body>', '<body class="is-homepage-loading">') : page);
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
      const draws = [.05, .05, .9];
      Math.random = () => draws.shift() ?? .05;
    });
    await candy.goto(origin + '/index.html');
    assert.match(await candy.locator('.eddy-global-art img').getAttribute('src'), /cotton-candy/);
    assert.equal(await candy.locator('.eddy-global-copy strong').innerText(), '拉絲雲朵棉花糖!');
    assert.equal(await candy.locator('.eddy-global-copy > span').isVisible(), false);
    const bubble = await context.newPage();
    await bubble.addInitScript(() => {
      const RealDate = Date;
      window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2027-02-07T05:30:00Z'])); } static now() { return RealDate.parse('2027-02-07T05:30:00Z'); } };
      const draws = [.05, .5, .9];
      Math.random = () => draws.shift() ?? .05;
    });
    await bubble.goto(origin + '/index.html?loading=1');
    assert.equal(await bubble.locator('.eddy-global-overlay').count(), 0);
    await bubble.evaluate(() => document.body.classList.remove('is-homepage-loading'));
    await bubble.locator('.eddy-global-overlay').waitFor();
    assert.match(await bubble.locator('.eddy-global-art img').getAttribute('src'), /bubble-gum/, 'bubble gum wins the other half of the 10% draw');
    assert.equal(await bubble.locator('.eddy-global-copy strong').innerText(), '感覺香口膠快要爆了...');
    assert.equal(await bubble.locator('.eddy-global-art img').evaluate(image => image.complete && image.naturalWidth > 0), true);
    await bubble.keyboard.press('Escape');
    await bubble.locator('.eddy-global-overlay').waitFor();
    assert.doesNotMatch(await bubble.locator('.eddy-global-art img').getAttribute('src'), /bubble-gum/, 'scheduled Sunday greeting follows bubble gum');
    const first = await context.newPage();
    await first.addInitScript(() => {
      const RealDate = Date;
      window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2027-02-07T05:30:00Z'])); } static now() { return RealDate.parse('2027-02-07T05:30:00Z'); } };
      const draws = [.05, .05, .9];
      Math.random = () => draws.shift() ?? .05;
    });
    await first.goto(origin + '/index.html?loading=1');
    assert.equal(await first.locator('.eddy-global-overlay').count(), 0, 'dialogues wait for the homepage loader');
    await first.evaluate(() => document.body.classList.remove('is-homepage-loading'));
    await first.locator('.eddy-global-overlay').waitFor();
    assert.match(await first.locator('.eddy-global-art img').getAttribute('src'), /cotton-candy/, 'cotton candy appears before the Sunday greetings');
    await first.keyboard.press('Escape');
    await first.locator('.eddy-global-overlay').waitFor();
    assert.doesNotMatch(await first.locator('.eddy-global-art img').getAttribute('src'), /cotton-candy/, 'normal greetings follow the surprise');
    const priority = await context.newPage();
    await priority.addInitScript(() => {
      const RealDate = Date;
      window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2027-02-08T03:00:00Z'])); } static now() { return RealDate.parse('2027-02-08T03:00:00Z'); } };
      const draws = [.05, .05, .9];
      Math.random = () => draws.shift() ?? .05;
    });
    await priority.route('https://edmund-schedule-system.edmundeducation.workers.dev/v1/announcements', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ announcements: [{ id: 'test-announcement', version: 1, message: 'Important announcement' }] }) }));
    await priority.goto(origin + '/index.html?loading=1&announcement=1');
    await priority.evaluate(() => document.body.classList.remove('is-homepage-loading'));
    await priority.locator('.eddy-global-overlay').waitFor();
    assert.match(await priority.locator('.eddy-global-art img').getAttribute('src'), /cotton-candy/);
    await priority.waitForTimeout(100);
    assert.equal(await priority.locator('.site-announcement-dialog[open]').count(), 0, 'announcement waits while cotton candy is showing');
    await priority.keyboard.press('Escape');
    await priority.locator('.site-announcement-dialog[open]').waitFor();
    const other = await context.newPage();
    await other.addInitScript(() => { Math.random = () => 0; });
    await other.goto(origin + '/other-system.html');
    assert.equal(await other.locator('.eddy-global-overlay').count(), 0, 'cotton candy stays on the homepage');
    const noCandy = await context.newPage();
    await noCandy.addInitScript(() => {
      const RealDate = Date;
      window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2027-02-08T03:00:00Z'])); } static now() { return RealDate.parse('2027-02-08T03:00:00Z'); } };
      Math.random = () => .3;
    });
    await noCandy.goto(origin + '/index.html');
    assert.equal(await noCandy.locator('.eddy-global-overlay').count(), 0, 'draws outside both thresholds show no surprise');
    const factOnly = await context.newPage();
    await factOnly.addInitScript(() => {
      const RealDate = Date;
      window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2027-02-08T03:00:00Z'])); } static now() { return RealDate.parse('2027-02-08T03:00:00Z'); } };
      const draws = [.5, .2, 0];
      Math.random = () => draws.shift() ?? 0;
    });
    await factOnly.goto(origin + '/index.html');
    assert.match(await factOnly.locator('.eddy-global-art img').getAttribute('src'), /fun-fact/);
    assert.equal(await factOnly.locator('.eddy-global-art img').evaluate(image => image.complete && image.naturalWidth > 0), true);
    assert.equal(await factOnly.locator('.eddy-global-copy > span').isVisible(), false);
    assert.match(await factOnly.locator('.eddy-global-copy strong').innerText(), /章魚居然有三顆心臟/);
    const factPages = await factOnly.evaluate(() => [...new Intl.Segmenter('zh-Hant', { granularity: 'word' }).segment(window.EdmundEddyFunFacts[0][0])].filter(part => part.isWordLike).length > 30 ? 2 : 1);
    for (let page = 0; page < factPages; page++) await factOnly.keyboard.press('Tab');
    assert.equal(await factOnly.locator('.eddy-global-copy strong').innerText(), '大海裡還真是藏著不少不可思議的傢伙呢！', 'Eddy opinion is a separate final page');
    await factOnly.locator('.eddy-global-overlay').click({ position: { x: 10, y: 10 } });
    await factOnly.locator('.eddy-global-overlay').waitFor({ state: 'detached' });
    await factOnly.reload();
    assert.match(await factOnly.locator('.eddy-global-copy strong').innerText(), /章魚居然有三顆心臟/, 'each visit redraws, so the same fact can appear again');
    const longFact = await context.newPage();
    await longFact.addInitScript(() => {
      const RealDate = Date;
      window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2027-02-08T03:00:00Z'])); } static now() { return RealDate.parse('2027-02-08T03:00:00Z'); } };
      const draws = [.5, .2, .07];
      Math.random = () => draws.shift() ?? 0;
    });
    await longFact.goto(origin + '/index.html');
    assert.match(await longFact.locator('.eddy-global-copy strong').innerText(), /電腦使用的二進位/);
    await longFact.keyboard.press('Tab');
    assert.doesNotMatch(await longFact.locator('.eddy-global-copy strong').innerText(), /資訊科學令人著迷/, 'long fact uses a second fact page');
    await longFact.keyboard.press('Tab');
    assert.match(await longFact.locator('.eddy-global-copy strong').innerText(), /資訊科學令人著迷/, 'the reaction is the third page');
    await longFact.keyboard.press('Tab');
    await longFact.locator('.eddy-global-overlay').waitFor({ state: 'detached' });
    const both = await context.newPage();
    await both.addInitScript(() => {
      const RealDate = Date;
      window.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2027-02-07T05:30:00Z'])); } static now() { return RealDate.parse('2027-02-07T05:30:00Z'); } };
      const draws = [.05, .5, .2, 0];
      Math.random = () => draws.shift() ?? 0;
    });
    await both.route('https://edmund-schedule-system.edmundeducation.workers.dev/v1/announcements', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ announcements: [{ id: 'both-surprises-announcement', version: 1, message: 'Later announcement' }] }) }));
    await both.goto(origin + '/index.html?loading=1&announcement=1');
    await both.evaluate(() => document.body.classList.remove('is-homepage-loading'));
    await both.locator('.eddy-global-overlay').waitFor();
    assert.match(await both.locator('.eddy-global-art img').getAttribute('src'), /bubble-gum/, '10% surprise shows first when both draws hit');
    await both.keyboard.press('Escape');
    await both.locator('.eddy-global-overlay').waitFor();
    assert.match(await both.locator('.eddy-global-art img').getAttribute('src'), /fun-fact/, '30% fact shows second');
    for (let page = 0; page < factPages + 1; page++) await both.keyboard.press('Tab');
    await both.locator('.eddy-global-overlay').waitFor({ state: 'detached' });
    assert.equal(await both.locator('.site-announcement-dialog[open]').count(), 0, 'other dialogues are suppressed for this visit when both surprises hit');
    await both.evaluate(() => window.EdmundEddyGlobalDialogue.checkWeekend());
    assert.equal(await both.locator('.eddy-global-overlay').count(), 0, 'Sunday greeting stays suppressed for this visit');
    await context.close();
    console.log('PASS: grammar and song greetings; independent 10% and 30% homepage draws, fact pages, dual-hit suppression');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
