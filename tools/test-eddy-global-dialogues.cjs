const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

const root = path.resolve(__dirname, '..');
const nav = fs.readFileSync(path.join(root, 'shared-system-nav.js'), 'utf8');
const systemList = nav.slice(nav.indexOf('const SYSTEMS = Object.freeze(['), nav.indexOf(']);', nav.indexOf('const SYSTEMS = Object.freeze([')));
for (const [, href] of systemList.matchAll(/href:\s*"([^"]+\.html)"/g)) {
  const file = path.join(root, href);
  if (fs.existsSync(file)) {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /eddy-global-dialogues\.js\?v=20261025-1/, `${href} must load the sitewide dialogue`);
    assert.match(html, /eddy-global-dialogues\.css\?v=20261025-1/, `${href} must load its stylesheet`);
  }
}
assert.match(nav, /queuePomodoroBreak\(pomodoroOwnerKey \|\| currentPomodoroStorageKey\(\), pomodoroState\.endsAt\)/);
assert.match(nav, /element\.hasAttribute\("data-eddy-global-dialogue"\)/);
for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  if (!/<script[^>]+shared-system-nav\.js/.test(html)) continue;
  const globalAt = html.search(/<script[^>]*src="\/?eddy-global-dialogues\.js\?v=20261025-1"/);
  const navAt = html.search(/<script[^>]*src="\/?shared-system-nav\.js\?v=20261025-eddy-moments1"/);
  assert.ok(globalAt >= 0 && navAt > globalAt, `${file} must load Eddy before navigation`);
}
for (const file of ['eddy-first-question-dialogue.js', 'eddy-five-streak-dialogue.js', 'eddy-schedule-empty-day-dialogue.js', 'eddy-schedule-homework-completion-dialogue.js', 'eddy-writing-daily-dialogue.js']) {
  const script = fs.readFileSync(path.join(root, file), 'utf8');
  assert.match(script, /EdmundEddyGlobalDialogue\?\.isBlocking\(\)/, `${file} must yield to tea`);
  assert.match(script, /edmund:eddy-global-dialogue-finished/, `${file} must resume afterward`);
}

const server = http.createServer((req, res) => {
  if (req.url === '/fixture') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/eddy-global-dialogues.css"></head><body><main>Learning system</main><script src="/eddy-global-dialogues.js"></script></body></html>');
    return;
  }
  if (req.url === '/pomodoro-fixture') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/eddy-global-dialogues.css"><link rel="stylesheet" href="/shared-system-nav.css"></head><body><main>Learning system</main><button data-edmund-pomodoro-header>Timer</button><script>localStorage.setItem("edmund-schedule-pomodoro-v1:device", JSON.stringify({ settings: { enabled: true, allowSkipBreak: false, workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 25, sessionsBeforeLongBreak: 4 }, phase: "short-break", completedSessions: 1, endsAt: Date.now() + 5 * 60000 }));</script><script src="/eddy-global-dialogues.js"></script><script src="/shared-system-nav.js"></script></body></html>');
    return;
  }
  const file = path.join(root, decodeURIComponent(req.url.slice(1).split('?')[0]));
  if (!['eddy-global-dialogues.js', 'eddy-global-dialogues.css', 'shared-system-nav.js', 'shared-system-nav.css', 'eddy-afternoon-tea-dialogue.png', 'eddy-pomodoro-tomato-dialogue.png'].includes(path.basename(file))) {
    res.writeHead(404).end(); return;
  }
  res.writeHead(200, { 'Content-Type': file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'image/png' });
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1100, height: 750 } });
  const pageAt = async (iso, viewport) => {
    const page = await context.newPage();
    if (viewport) await page.setViewportSize(viewport);
    await page.addInitScript((value) => {
      const RealDate = Date;
      window.__fakeNow = RealDate.parse(value);
      window.Date = class extends RealDate {
        constructor(...args) { super(...(args.length ? args : [window.__fakeNow])); }
        static now() { return window.__fakeNow; }
      };
      Math.random = () => 0;
    }, iso);
    await page.goto(base + '/fixture');
    return page;
  };
  try {
    const page = await pageAt('2026-10-25T06:59:00Z', { width: 375, height: 667 });
    const art = page.locator('.eddy-global-art img');
    assert.equal(await art.count(), 0, '14:59 Hong Kong time is too early');
    await page.evaluate(() => { window.__fakeNow = Date.parse('2026-10-25T07:00:00Z'); window.EdmundEddyGlobalDialogue.checkTea(); });
    await art.waitFor();
    await art.evaluate((img) => img.decode());
    assert.match(await art.getAttribute('src'), /afternoon-tea/);
    assert.equal(await art.evaluate((img) => img.naturalWidth), 1672);
    assert.match(await page.locator('.eddy-global-copy strong').textContent(), /下午茶/);
    const box = await page.locator('.eddy-global-copy').boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= 375);
    await page.screenshot({ path: '/tmp/eddy-afternoon-tea-mobile.png' });
    await page.evaluate(() => window.EdmundEddyGlobalDialogue.queuePomodoroBreak('student-1', Date.now() + 5 * 60000));
    assert.match(await art.getAttribute('src'), /afternoon-tea/, 'tea precedes a simultaneous break');
    await page.keyboard.press('Tab');
    assert.match(await art.getAttribute('src'), /pomodoro-tomato/);
    await art.evaluate((img) => img.decode());
    assert.match(await page.locator('.eddy-global-copy span').textContent(), /^（.*）$/);
    assert.equal(await art.evaluate((img) => img.naturalWidth), 1672);
    await page.screenshot({ path: '/tmp/eddy-pomodoro-tomato-mobile.png' });
    await page.keyboard.press('Enter');
    await art.waitFor({ state: 'detached' });
    await page.evaluate(() => window.EdmundEddyGlobalDialogue.queuePomodoroBreak('student-1', Date.now() + 5 * 60000));
    assert.equal(await art.count(), 0, 'the same break is shown once');
    await page.close();

    const sameDay = await pageAt('2026-10-25T07:30:00Z');
    assert.equal(await sameDay.locator('.eddy-global-overlay').count(), 0, 'tea appears once per Hong Kong day across pages');
    await sameDay.close();
    const nextDay = await pageAt('2026-10-26T07:30:00Z');
    await nextDay.locator('.eddy-global-overlay').waitFor();
    await nextDay.close();
    const outsideWindow = await pageAt('2026-10-27T08:00:00Z');
    assert.equal(await outsideWindow.locator('.eddy-global-overlay').count(), 0, '16:00 Hong Kong time is outside tea');
    await outsideWindow.evaluate(() => {
      window.__fakeNow = Date.parse('2026-10-28T07:30:00Z');
      Math.random = () => .99;
      window.EdmundEddyGlobalDialogue.checkTea();
    });
    await outsideWindow.locator('.eddy-global-overlay').waitFor();
    const teaFit = await outsideWindow.locator('.eddy-global-copy').evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
    assert.ok(teaFit.scroll <= teaFit.visible + 1, `long afternoon tea copy overflows desktop box: ${JSON.stringify(teaFit)}`);
    await outsideWindow.close();
    const breakPage = await pageAt('2026-10-29T06:00:00Z');
    await breakPage.goto(base + '/pomodoro-fixture');
    await breakPage.locator('.eddy-global-overlay').waitFor();
    assert.match(await breakPage.locator('.eddy-global-art img').getAttribute('src'), /pomodoro-tomato/);
    assert.equal(await breakPage.locator('[data-edmund-pomodoro-break-lock]').isVisible(), true, 'the real timer entered its break lock');
    await breakPage.keyboard.press('Tab');
    await breakPage.locator('.eddy-global-overlay').waitFor({ state: 'detached' });
    assert.equal(await breakPage.locator('[data-edmund-pomodoro-break-lock]').isVisible(), true, 'the break lock remains after Eddy is dismissed');
    await breakPage.close();
    console.log('Sitewide Eddy tea and Pomodoro browser checks passed.');
  } finally {
    await context.close();
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; server.close(); });
