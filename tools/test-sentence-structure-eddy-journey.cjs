// Local fixture only. External services are blocked.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

const root = path.resolve(__dirname, '..');
const out = process.env.EDDY_JOURNEY_ARTIFACTS || '/tmp/sentence-eddy-journey';
fs.mkdirSync(out, { recursive: true });
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
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/sentence-structure.js?*', (route) => {
    const source = fs.readFileSync(path.join(root, 'sentence-structure.js'), 'utf8').replace(/\ninitialise\(\)\.catch\([\s\S]*$/, '');
    return route.fulfill({ contentType: 'text/javascript', body: `${source}
bindEvents();
window.journeyTest = {
  async login(){await lessonLibrary.catalog();state.user={id:'eddy-fixture',name:'Eddy Preview',role:'student'};state.authToken='local-fixture';state.dashboardLoaded=true;renderLessonChoices();showView('dashboard',{preserveScroll:true});},
  openLesson,
  state
};` });
  });
  for (const file of ['shared-system-nav.js', 'pwa-register.js', 'shared-speaking-practice.js']) {
    await page.route(`**/${file}*`, (route) => route.fulfill({ contentType: 'text/javascript', body: '' }));
  }
  await page.route('https://**/*', (route) => route.abort());
  await page.goto(`${origin}/sentence-structure.html`);
  await page.waitForFunction(() => window.journeyTest);
  await page.evaluate(() => journeyTest.login());
  await page.evaluate(() => journeyTest.openLesson('ss1', { page: 4 }));
  await page.waitForSelector('.question-list.has-sentence-journey');

  assert.equal(await page.locator('.sentence-journey-stop').count(), 50);
  assert.equal(await page.locator('.sentence-journey-platform').count(), 50);
  assert.equal(await page.locator('[data-sentence-journey-eddy]').count(), 1);
  assert.equal(await page.locator('.sentence-journey-platform strong').first().textContent(), '01');
  assert.equal(await page.locator('.sentence-journey-platform strong').last().textContent(), '50');
  const firstPlatformImage = await page.locator('.sentence-journey-platform image').first().getAttribute('href');
  assert.equal(firstPlatformImage, 'assets/sentence-structure/coast/props.webp');

  const actor = page.locator('[data-sentence-journey-eddy]');
  const firstInput = page.locator('[data-answer-input]').first();
  const thirdInput = page.locator('[data-answer-input]').nth(2);
  await firstInput.focus();
  const firstTop = Number.parseFloat(await actor.evaluate((node) => node.style.top));
  await thirdInput.focus();
  const thirdTop = Number.parseFloat(await actor.evaluate((node) => node.style.top));
  assert.ok(thirdTop > firstTop, 'Eddy moves down the vertical path');
  assert.equal(await actor.getAttribute('data-motion'), 'walk');
  assert.equal(await page.locator('[data-eddy-active=true]').getAttribute('data-question-number'), '3');

  const module = await page.evaluate(async () => {
    const journey = await import('/sentence-structure-exercise-journey.mjs');
    journey.reactSentenceJourney(document.querySelector('[data-lesson-content]'), { questionId: document.querySelector('[data-answer-input]').dataset.answerInput, correct: true });
    await new Promise((resolve) => setTimeout(resolve, 600));
    return document.querySelector('[data-sentence-journey-eddy]').dataset.motion;
  });
  assert.equal(module, 'jump');
  assert.match(await actor.locator('.sentence-journey-eddy-sprite').evaluate((node) => getComputedStyle(node).backgroundImage), /eddy-jump-v2\.webp/);
  await page.evaluate(async () => {
    const journey = await import('/sentence-structure-exercise-journey.mjs');
    const input = document.querySelectorAll('[data-answer-input]')[1];
    journey.reactSentenceJourney(document.querySelector('[data-lesson-content]'), { questionId: input.dataset.answerInput, correct: false });
  });
  await page.waitForTimeout(600);
  assert.equal(await actor.getAttribute('data-motion'), 'encourage');
  assert.match(await actor.locator('.sentence-journey-eddy-sprite').evaluate((node) => getComputedStyle(node).backgroundImage), /eddy-encourage-v1\.webp/);

  await firstInput.focus();
  await page.waitForTimeout(1400);
  await page.locator('.sentence-journey-stop').first().screenshot({ path: path.join(out, 'eddy-journey-desktop.png') });
  for (const [name, width, height] of [['tablet', 820, 1180], ['phone', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.locator('.sentence-journey-stop').first().scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name} has no horizontal overflow`);
    await page.locator('.sentence-journey-stop').first().screenshot({ path: path.join(out, `eddy-journey-${name}.png`) });
  }

  await page.evaluate(() => journeyTest.openLesson('ss31', { page: 4 }));
  await page.waitForFunction(() => journeyTest.state.lessonId === 'ss31' && journeyTest.state.lessonPage === 4);
  assert.equal(await page.locator('.sentence-journey-stop').count(), 0, 'Journey stays limited to modules 1–30');
  assert.deepEqual(errors, []);
  console.log('PASS: 50-platform Eddy journey, movement, reactions, module scope and responsive layout');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await browser?.close();
  server.close();
});
