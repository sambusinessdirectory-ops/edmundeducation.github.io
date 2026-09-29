// Local fixture: the level 31–60 exercise journey, without external services.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = http.createServer((request, response) => {
  const file = path.resolve(root, `.${decodeURIComponent(new URL(request.url, 'http://localhost').pathname)}`);
  if (!file.startsWith(`${root}${path.sep}`)) return response.writeHead(403).end();
  fs.readFile(file, (error, body) => {
    if (error) return response.writeHead(404).end();
    response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    response.end(body);
  });
});

let browser;
(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/sentence-structure.js?*', (route) => {
    const source = fs.readFileSync(path.join(root, 'sentence-structure.js'), 'utf8').replace(/\ninitialise\(\)\.catch\([\s\S]*?\n\}\);\s*/, '\n');
    return route.fulfill({ contentType: 'text/javascript', body: `${source}\nbindEvents();window.autumnJourneyTest={async open(id){await lessonLibrary.catalog();state.user={id:'autumn-journey-fixture',name:'Preview',role:'student'};state.authToken='fixture';state.dashboardLoaded=true;await openLesson(id,{page:4});},getLesson,submitExercise};` });
  });
  for (const file of ['shared-system-nav.js', 'pwa-register.js', 'shared-speaking-practice.js']) await page.route(`**/${file}*`, (route) => route.fulfill({ contentType: 'text/javascript', body: '' }));
  await page.route('https://**/*', (route) => route.abort());
  await page.goto(`http://127.0.0.1:${server.address().port}/sentence-structure.html`);
  await page.waitForFunction(() => window.autumnJourneyTest);

  for (const lessonId of ['ss31', 'ss45', 'ss60']) {
    await page.evaluate((id) => autumnJourneyTest.open(id), lessonId);
    await page.waitForSelector('.sentence-autumn-lesson .has-sentence-journey');
    assert.equal(await page.locator('.sentence-journey-stop').count(), 50, `${lessonId}: 50 question-bound stops`);
    assert.equal(await page.locator('.sentence-journey-platform').count(), 50, `${lessonId}: 50 logs`);
    assert.equal(await page.locator('[data-sentence-journey-eddy]').count(), 1, `${lessonId}: one actor`);
    assert.match(await page.locator('.sentence-journey-platform').first().evaluate((node) => getComputedStyle(node).backgroundImage), /autumn\/stone\.webp/);
    assert.match(await page.locator('.has-sentence-journey').evaluate((node) => getComputedStyle(node, '::after').backgroundImage), /exercise-wooden-path-v3\.webp/);
  }

  const actor = page.locator('[data-sentence-journey-eddy]');
  await page.locator('[data-eddy-stop][data-question-number="1"] [data-answer-input]').focus();
  const firstTop = Number.parseFloat(await actor.evaluate((node) => node.style.top));
  await page.locator('[data-eddy-stop][data-question-number="3"] [data-answer-input]').focus();
  const thirdTop = Number.parseFloat(await actor.evaluate((node) => node.style.top));
  assert.ok(thirdTop > firstTop, 'Eddy walks down the autumn route');
  assert.equal(await actor.getAttribute('data-motion'), 'walk');
  assert.ok(Number.parseFloat(await actor.evaluate((node) => node.style.getPropertyValue('--eddy-walk-duration'))) >= 2070);

  const stop = page.locator('[data-eddy-stop][data-question-number="12"]');
  const input = stop.locator('[data-answer-input]').first();
  await input.scrollIntoViewIfNeeded();
  await input.focus();
  await page.waitForFunction(() => document.querySelector('[data-sentence-journey-eddy]').dataset.motion === 'idle', null, { timeout: 6500 });
  const before = await page.evaluate(() => {
    const actor = document.querySelector('[data-sentence-journey-eddy]');
    const list = document.querySelector('[data-question-list]');
    const platform = document.querySelector('[data-eddy-active=true] .sentence-journey-platform');
    return { top: Number.parseFloat(actor.style.top), platformTop: platform.getBoundingClientRect().top - list.getBoundingClientRect().top };
  });
  await input.fill(await page.evaluate(() => autumnJourneyTest.getLesson().questions[11].answer));
  const frames = await page.evaluate(() => {
    const original = document.querySelector('[data-sentence-journey-eddy]');
    void autumnJourneyTest.submitExercise('partial');
    return new Promise((resolve) => {
      const samples = [];
      const sample = () => {
        const actor = document.querySelector('[data-sentence-journey-eddy]');
        const list = document.querySelector('[data-question-list]');
        const platform = document.querySelector('[data-eddy-active=true] .sentence-journey-platform');
        const actorBox = actor.getBoundingClientRect();
        const platformBox = platform.getBoundingClientRect();
        samples.push({ sameActor: actor === original, top: Number.parseFloat(actor.style.top), platformTop: platformBox.top - list.getBoundingClientRect().top, feetGap: Math.abs(actorBox.bottom - actorBox.height * .1 - platformBox.top - platformBox.height * .48), visible: getComputedStyle(actor).visibility === 'visible', logs: [...document.querySelectorAll('.sentence-journey-platform')].filter((node) => getComputedStyle(node).backgroundImage.includes('stone.webp')).length });
        if (samples.length < 12) requestAnimationFrame(sample); else resolve(samples);
      };
      requestAnimationFrame(sample);
    });
  });
  assert.ok(frames.every((frame) => frame.sameActor && frame.visible && frame.logs === 50), 'No actor or log disappears during grading');
  assert.ok(frames.every((frame) => Math.abs(frame.top - before.top) < 1 && Math.abs(frame.platformTop - before.platformTop) < 1 && frame.feetGap < 4), 'Card expansion preserves the hoof contact point');
  await page.waitForFunction(() => document.querySelector('[data-eddy-stop][data-question-number="12"] .question-card')?.classList.contains('is-correct'));

  for (const [label, width, height] of [['tablet', 820, 1180], ['phone', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await stop.scrollIntoViewIfNeeded();
    await page.waitForTimeout(180);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${label}: no horizontal overflow`);
    const gap = await page.evaluate(() => {
      const actor = document.querySelector('[data-sentence-journey-eddy]').getBoundingClientRect();
      const platform = document.querySelector('[data-eddy-active=true] .sentence-journey-platform').getBoundingClientRect();
      return Math.abs(actor.bottom - actor.height * .1 - platform.top - platform.height * .48);
    });
    assert.ok(gap < 4, `${label}: Eddy stays planted on the log (${gap})`);
  }
  assert.deepEqual(errors, []);
  console.log('PASS: autumn log journey across levels 31, 45 and 60; walking, grading stability and responsive alignment');
})().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); server.close(); });
