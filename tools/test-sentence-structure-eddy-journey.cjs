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
    const source = fs.readFileSync(path.join(root, 'sentence-structure.js'), 'utf8').replace(/\ninitialise\(\)\.catch\([\s\S]*?\n\}\);\s*/, '\n');
    return route.fulfill({ contentType: 'text/javascript', body: `${source}
bindEvents();
window.journeyTest = {
  async login(){await lessonLibrary.catalog();state.user={id:'eddy-fixture',name:'Eddy Preview',role:'student'};state.authToken='local-fixture';state.dashboardLoaded=true;renderLessonChoices();showView('dashboard',{preserveScroll:true});},
  openLesson,
  getLesson,
  submitExercise,
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
  const exerciseLoadMs = await page.evaluate(async () => {
    const started = performance.now();
    await journeyTest.openLesson('ss1', { page: 4 });
    return performance.now() - started;
  });
  await page.waitForSelector('.question-list.has-sentence-journey');
  assert.ok(exerciseLoadMs < 3500, `Exercise rendered in ${Math.round(exerciseLoadMs)}ms`);

  assert.equal(await page.locator('.sentence-journey-stop').count(), 50);
  assert.equal(await page.locator('.sentence-journey-platform').count(), 50);
  assert.equal(await page.locator('[data-sentence-journey-eddy]').count(), 1);
  assert.equal(await page.locator('.sentence-journey-platform strong').first().textContent(), '01');
  assert.equal(await page.locator('.sentence-journey-platform strong').last().textContent(), '50');
  assert.equal(await page.locator('.sentence-journey-platform img').count(), 0, 'Platforms do not depend on recreated lazy image elements');
  assert.match(await page.locator('.sentence-journey-platform').first().evaluate((node) => getComputedStyle(node).backgroundImage), /coast-platform\.webp/);
  assert.equal(await page.locator('.sentence-journey-platform span').count(), 0, 'Platforms have no stray status punctuation');
  assert.match(await page.locator('.question-list.has-sentence-journey').evaluate((node) => getComputedStyle(node, '::before').backgroundImage), /coast-route-v2\.webp/);

  const actor = page.locator('[data-sentence-journey-eddy]');
  await page.waitForFunction(() => document.querySelector('[data-sentence-journey-eddy]').dataset.motion === 'idle', null, { timeout: 6500 });
  assert.match(await actor.locator('.sentence-journey-eddy-sprite').evaluate((node) => getComputedStyle(node).backgroundImage), /eddy-standing\.png/);
  assert.equal(await actor.locator('.sentence-journey-eddy-blink').evaluate((node) => getComputedStyle(node).animationName), 'sentence-eddy-blink');
  const keyboardStop = page.locator('[data-eddy-stop][data-question-number="4"]');
  const keyboardInput = keyboardStop.locator('[data-answer-input]').first();
  await keyboardInput.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -120));
  await keyboardInput.focus();
  await page.waitForTimeout(60);
  const beforeKeyboardTop = await keyboardStop.evaluate((node) => node.getBoundingClientRect().top);
  await page.setViewportSize({ width: 1440, height: 650 });
  await page.waitForTimeout(60);
  await page.evaluate(() => window.scrollBy(0, 180));
  const keyboardShiftedTop = await keyboardStop.evaluate((node) => node.getBoundingClientRect().top);
  assert.ok(Math.abs(keyboardShiftedTop - beforeKeyboardTop) > 100, 'Keyboard simulation pushes the active question card');
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.waitForTimeout(480);
  const afterKeyboardTop = await keyboardStop.evaluate((node) => node.getBoundingClientRect().top);
  assert.ok(Math.abs(afterKeyboardTop - beforeKeyboardTop) < 12, `Closing the keyboard restores the question card (${beforeKeyboardTop.toFixed(1)} → ${afterKeyboardTop.toFixed(1)})`);
  const firstInput = page.locator('[data-answer-input]').first();
  const thirdInput = page.locator('[data-answer-input]').nth(2);
  await firstInput.focus();
  const firstTop = Number.parseFloat(await actor.evaluate((node) => node.style.top));
  await thirdInput.focus();
  const thirdTop = Number.parseFloat(await actor.evaluate((node) => node.style.top));
  assert.ok(thirdTop > firstTop, 'Eddy moves down the vertical path');
  assert.equal(await actor.getAttribute('data-motion'), 'walk');
  assert.equal(await page.locator('[data-eddy-active=true]').getAttribute('data-question-number'), '3');
  assert.ok(Number.parseFloat(await actor.evaluate((node) => node.style.getPropertyValue('--eddy-walk-duration'))) >= 2070, 'Eddy travels thirty percent slower');
  assert.equal(await actor.locator('.sentence-journey-eddy-sprite').evaluate((node) => getComputedStyle(node).animationDuration), '1.46s');

  await page.evaluate(async () => {
    const journey = await import('/sentence-structure-exercise-journey.mjs');
    journey.reactSentenceJourney(document.querySelector('[data-lesson-content]'), { questionId: document.querySelectorAll('[data-answer-input]')[2].dataset.answerInput, correct: true });
  });
  await page.waitForFunction(() => document.querySelector('[data-sentence-journey-eddy]').dataset.motion === 'jump');
  assert.match(await actor.locator('.sentence-journey-eddy-sprite').evaluate((node) => getComputedStyle(node).backgroundImage), /eddy-standing\.png/, 'the standing layer remains painted beneath every reaction');
  assert.match(await actor.locator('.sentence-journey-eddy-jump').evaluate((node) => getComputedStyle(node).backgroundImage), /eddy-jump-v3\.webp/);
  assert.equal(await actor.locator('.sentence-journey-eddy-jump').evaluate((node) => getComputedStyle(node).opacity), '1');
  await page.evaluate(async () => {
    const journey = await import('/sentence-structure-exercise-journey.mjs');
    const input = document.querySelectorAll('[data-answer-input]')[2];
    journey.reactSentenceJourney(document.querySelector('[data-lesson-content]'), { questionId: input.dataset.answerInput, correct: false });
  });
  await page.waitForFunction(() => document.querySelector('[data-sentence-journey-eddy]').dataset.motion === 'encourage');
  assert.match(await actor.locator('.sentence-journey-eddy-encourage').evaluate((node) => getComputedStyle(node).backgroundImage), /eddy-encourage-v2\.webp/);
  assert.equal(await actor.locator('.sentence-journey-eddy-encourage').evaluate((node) => getComputedStyle(node).opacity), '1');

  await page.waitForTimeout(650);
  const twelfthStop = page.locator('[data-eddy-stop][data-question-number="12"]');
  const twelfthInput = twelfthStop.locator('[data-answer-input]').first();
  await twelfthInput.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -180));
  await twelfthInput.focus();
  await page.waitForFunction(() => document.querySelector('[data-sentence-journey-eddy]').dataset.motion === 'idle', null, { timeout: 6500 });
  const beforeGradeTop = await twelfthStop.evaluate((node) => node.getBoundingClientRect().top);
  const beforeGradeGeometry = await page.evaluate(() => {
    const list = document.querySelector('[data-question-list]');
    const actor = document.querySelector('[data-sentence-journey-eddy]');
    const platform = document.querySelector('[data-eddy-active=true] .sentence-journey-platform');
    return {
      actorTop: Number.parseFloat(actor.style.top),
      actorHeight: actor.offsetHeight,
      platformTop: platform.getBoundingClientRect().top - list.getBoundingClientRect().top
    };
  });
  await twelfthInput.fill(await page.evaluate(() => journeyTest.getLesson().questions[11].answer));
  const gradingFrames = await page.evaluate(() => {
    const originalActor = document.querySelector('[data-sentence-journey-eddy]');
    void journeyTest.submitExercise('partial');
    return new Promise((resolve) => {
      const frames = [];
      const sample = () => {
        const currentActor = document.querySelector('[data-sentence-journey-eddy]');
        const actorBox = currentActor.getBoundingClientRect();
        const platformBox = document.querySelector('[data-eddy-active=true] .sentence-journey-platform').getBoundingClientRect();
        const listBox = document.querySelector('[data-question-list]').getBoundingClientRect();
        frames.push({
          sameActor: currentActor === originalActor,
          styledTop: Number.parseFloat(currentActor.style.top),
          actorHeight: currentActor.offsetHeight,
          platformTop: platformBox.top - listBox.top,
          feetGap: Math.abs((actorBox.bottom - actorBox.height * .1) - (platformBox.top + platformBox.height * .48)),
          visibility: getComputedStyle(currentActor).visibility,
          standingLayerPainted: getComputedStyle(currentActor.querySelector('.sentence-journey-eddy-sprite')).backgroundImage !== 'none',
          reactionLayerCount: currentActor.querySelectorAll('.sentence-journey-eddy-action').length,
          platformCount: document.querySelectorAll('.sentence-journey-platform').length,
          paintedPlatforms: [...document.querySelectorAll('.sentence-journey-platform')].filter((node) => getComputedStyle(node).backgroundImage.includes('coast-platform.webp')).length
        });
        if (frames.length < 12) requestAnimationFrame(sample);
        else resolve(frames);
      };
      requestAnimationFrame(sample);
    });
  });
  assert.ok(gradingFrames.every((frame) => frame.sameActor), 'Grading preserves the same Eddy element without a replacement-frame flash');
  assert.ok(gradingFrames.every((frame) => frame.styledTop > 1000), 'Eddy never flashes back to the start of the route while grading');
  assert.ok(gradingFrames.every((frame) => Math.abs(frame.styledTop - beforeGradeGeometry.actorTop) < 1), `Card expansion never changes Eddy’s route coordinate: ${JSON.stringify({ beforeGradeGeometry, gradingFrames })}`);
  assert.ok(gradingFrames.every((frame) => Math.abs(frame.platformTop - beforeGradeGeometry.platformTop) < 1), 'Card expansion never changes the active platform coordinate');
  assert.ok(gradingFrames.every((frame) => frame.feetGap < 4), `Eddy remains planted on the active platform throughout the grading rerender: ${JSON.stringify(gradingFrames)}`);
  assert.ok(gradingFrames.every((frame) => frame.visibility === 'visible'), 'Eddy is visible only after a final platform position is applied');
  assert.ok(gradingFrames.every((frame) => frame.standingLayerPainted && frame.reactionLayerCount === 2), `A painted Eddy sprite remains underneath both permanently loaded reaction layers: ${JSON.stringify(gradingFrames)}`);
  assert.ok(gradingFrames.every((frame) => frame.platformCount === 50 && frame.paintedPlatforms === 50), 'All fifty CSS-painted platforms remain visible throughout grading');
  await page.waitForFunction(() => document.querySelector('[data-eddy-stop][data-question-number="12"] .question-card')?.classList.contains('is-correct'));
  await page.waitForTimeout(240);
  const afterGradeTop = await page.locator('[data-eddy-stop][data-question-number="12"]').evaluate((node) => node.getBoundingClientRect().top);
  assert.ok(Math.abs(afterGradeTop - beforeGradeTop) < 12, `Question 12 remains anchored after grading (${beforeGradeTop.toFixed(1)} → ${afterGradeTop.toFixed(1)})`);

  const eighthInput = page.locator('[data-answer-input]').nth(7);
  await eighthInput.scrollIntoViewIfNeeded();
  await eighthInput.focus();
  await page.waitForFunction(() => document.querySelector('[data-sentence-journey-eddy]').dataset.motion === 'idle', null, { timeout: 6500 });
  assert.equal(await page.locator('[data-eddy-active=true]').getAttribute('data-question-number'), '8', 'Eddy follows question 8, not question 7');
  const alignment = async () => page.evaluate(() => {
    const actorBox = document.querySelector('[data-sentence-journey-eddy]').getBoundingClientRect();
    const platformBox = document.querySelector('[data-eddy-active=true] .sentence-journey-platform').getBoundingClientRect();
    return Math.abs((actorBox.bottom - actorBox.height * .1) - (platformBox.top + platformBox.height * .48));
  });
  assert.ok(await alignment() < 4, 'Eddy’s feet rest on the active platform');
  const beforeExpansion = Number.parseFloat(await actor.evaluate((node) => node.style.top));
  await page.locator('[data-question-number="7"] .question-card-content').evaluate((node) => { node.style.minHeight = '520px'; });
  await page.waitForTimeout(150);
  const afterExpansion = Number.parseFloat(await actor.evaluate((node) => node.style.top));
  assert.ok(afterExpansion > beforeExpansion + 200, 'Eddy follows the platform after earlier answer feedback changes height');
  assert.ok(await alignment() < 4, 'Eddy remains planted after the card layout changes');
  await page.evaluate(async () => {
    const journey = await import('/sentence-structure-exercise-journey.mjs');
    const input = document.querySelectorAll('[data-answer-input]')[7];
    journey.reactSentenceJourney(document.querySelector('[data-lesson-content]'), { questionId: input.dataset.answerInput, correct: false });
  });
  await page.waitForTimeout(30);
  assert.notEqual(await actor.getAttribute('data-motion'), 'walk', 'A same-platform reaction never starts with walking legs');
  await page.waitForTimeout(70);
  assert.equal(await actor.getAttribute('data-motion'), 'encourage');
  await page.waitForTimeout(450);
  await page.locator('[data-eddy-active=true]').screenshot({ path: path.join(out, 'eddy-journey-question-8.png') });

  await firstInput.focus();
  await page.waitForTimeout(1400);
  await page.locator('.sentence-journey-stop').first().screenshot({ path: path.join(out, 'eddy-journey-desktop.png') });
  for (const [name, width, height] of [['tablet', 820, 1180], ['phone', 390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.locator('.sentence-journey-stop').first().scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name} has no horizontal overflow`);
    await page.locator('.sentence-journey-stop').first().screenshot({ path: path.join(out, `eddy-journey-${name}.png`) });
  }

  await page.evaluate(() => journeyTest.openLesson('ss61', { page: 4 }));
  await page.waitForFunction(() => journeyTest.state.lessonId === 'ss61' && journeyTest.state.lessonPage === 4);
  assert.equal(await page.locator('.sentence-journey-stop').count(), 0, 'Journey remains scoped to modules 1–60');
  await page.evaluate(() => localStorage.setItem('edmund-eddy-wardrobe-v1:eddy-fixture', JSON.stringify({ equipped: { eddyTop: 'olive-plain-tee', eddyHeadwear: 'white-fedora' }, outfits: [] })));
  await page.reload();
  await page.waitForFunction(() => window.journeyTest);
  await page.evaluate(async () => { await journeyTest.login(); await journeyTest.openLesson('ss1', { page: 4 }); });
  const dressed = page.locator('[data-sentence-journey-eddy]');
  await page.waitForFunction(() => document.querySelector('[data-sentence-journey-eddy]')?.dataset.outfit === 'olive-plain-tee-white-fedora');
  assert.match(await dressed.locator('.sentence-journey-eddy-jump').evaluate((node) => getComputedStyle(node).backgroundImage), /eddy-olive-plain-tee-white-fedora-jump-v1\.webp/);
  assert.match(await dressed.locator('.sentence-journey-eddy-encourage').evaluate((node) => getComputedStyle(node).backgroundImage), /eddy-olive-plain-tee-white-fedora-encourage-v1\.webp/);
  await dressed.screenshot({ path: path.join(out, 'eddy-journey-dressed-idle.png') });
  const dressedInputs = page.locator('[data-answer-input]');
  await dressedInputs.nth(2).focus();
  assert.match(await dressed.locator('.sentence-journey-eddy-sprite').evaluate((node) => getComputedStyle(node).backgroundImage), /eddy-olive-plain-tee-white-fedora-walk-v1\.webp/);
  assert.deepEqual(errors, []);
  console.log(`PASS: 50-platform Eddy journey rendered in ${Math.round(exerciseLoadMs)}ms; movement, reactions, saved clothing, module scope and responsive layout passed`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await browser?.close();
  server.close();
});
