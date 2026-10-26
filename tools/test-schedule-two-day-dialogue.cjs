const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

(async () => {
  const root = path.resolve(__dirname, '..');
  const schedule = fs.readFileSync(path.join(root, 'schedule-system.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'schedule-system.html'), 'utf8');
  assert.match(schedule, /learningDaySummary\(payload\?\.snapshot, hongKongDayKey\(new Date\(\)\)\)/);
  assert.match(schedule, /edmund:schedule-learning-day-summary/);
  assert.match(html, /eddy-schedule-two-day-dialogue\.js\?v=20261026-1/);
  assert.match(html, /eddy-schedule-two-day-dialogue\.css\?v=20261026-1/);

  const browser = await chromium.launch({ headless: true, args: ['--allow-file-access-from-files'] });
  const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const setup = async () => {
    const page = await context.newPage();
    await page.goto('file://' + path.join(root, 'schedule-calendar.mjs'));
    await page.setContent(`<link rel="stylesheet" href="file://${root}/eddy-first-question-dialogue.css"><link rel="stylesheet" href="file://${root}/eddy-schedule-two-day-dialogue.css"><section data-view="calendar"></section>`);
    await page.addScriptTag({ path: path.join(root, 'eddy-schedule-two-day-dialogue.js') });
    return page;
  };
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const date = `${values.year}-${values.month}-${values.day}`;
  const previousDate = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)) - 86400000).toISOString().slice(0, 10);
  const fire = (page, studentId, streak, latestDay = date) => page.evaluate(({ studentId, streak, latestDay, date }) => {
    sessionStorage.setItem('edmund-schedule-session-v1', JSON.stringify({ role: 'student', id: studentId }));
    document.dispatchEvent(new CustomEvent('edmund:schedule-learning-day-summary', { detail: { studentId, date, streak, latestDay, total: 2 } }));
  }, { studentId, streak, latestDay, date });

  try {
    const page = await setup();
    const overlay = page.locator('.eddy-schedule-two-day-overlay');
    const message = page.locator('.eddy-first-question-message--schedule-two-day');
    await fire(page, 'student-1', 1);
    await fire(page, 'student-1', 3);
    await fire(page, 'student-1', 2, previousDate);
    assert.equal(await overlay.count(), 0, 'only a current two-day streak qualifies');

    for (let variant = 0; variant < 5; variant += 1) {
      const id = `student-${variant + 1}`;
      await page.evaluate((fraction) => { Math.random = () => fraction; }, (variant + .01) / 5);
      await fire(page, id, 2);
      await overlay.waitFor();
      const art = page.locator('.eddy-schedule-two-day-overlay img');
      await art.evaluate((img) => img.decode());
      assert.equal(await art.evaluate((img) => img.naturalWidth), 1670);
      const fit = await message.evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
      assert.ok(fit.scroll <= fit.visible + 1, `variant ${variant + 1} overflows mobile box: ${JSON.stringify(fit)}`);
      const bounds = await message.boundingBox();
      assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 375);
      if (variant === 0) {
        const sizes = await message.evaluate((node) => ({ main: parseFloat(getComputedStyle(node.querySelector('strong')).fontSize), sub: parseFloat(getComputedStyle(node.querySelector('span')).fontSize) }));
        assert.ok(sizes.main > sizes.sub, 'first line is larger');
        assert.match(await message.textContent(), /見到您/);
        await page.screenshot({ path: '/tmp/eddy-schedule-two-day-mobile.png' });
      }
      if (variant >= 2) {
        const first = await message.textContent();
        await page.keyboard.press('Tab');
        assert.notEqual(await message.textContent(), first, 'two-step comments advance on Tab');
        assert.equal(await overlay.count(), 1);
      }
      await page.keyboard.press('Enter');
      await overlay.waitFor({ state: 'detached' });
      await fire(page, id, 2);
      assert.equal(await overlay.count(), 0, 'the same student sees the milestone once that day');
    }

    await page.evaluate(() => { window.EdmundEddyGlobalDialogue = { isBlocking: () => true }; });
    await fire(page, 'blocked-student', 2);
    assert.equal(await overlay.count(), 0, 'sitewide dialogue takes priority');
    await page.evaluate(() => {
      window.EdmundEddyGlobalDialogue.isBlocking = () => false;
      document.dispatchEvent(new Event('edmund:eddy-global-dialogue-finished'));
    });
    await overlay.waitFor();
    await page.keyboard.press('Escape');
    await overlay.waitFor({ state: 'detached' });

    await page.evaluate(() => {
      const blocker = document.createElement('div');
      blocker.className = 'eddy-first-question-overlay';
      blocker.id = 'other-eddy';
      document.body.append(blocker);
    });
    await fire(page, 'queued-student', 2);
    assert.equal(await overlay.count(), 0, 'an existing Eddy dialogue keeps its place');
    await page.locator('#other-eddy').evaluate((node) => node.remove());
    await overlay.waitFor();
    await page.keyboard.press('Escape');
    await overlay.waitFor({ state: 'detached' });
    await page.close();

    const secondPage = await setup();
    await fire(secondPage, 'student-1', 2);
    assert.equal(await secondPage.locator('.eddy-schedule-two-day-overlay').count(), 0, 'the once-per-day result persists across page loads');
    await secondPage.close();
    console.log('Eddy two-day homework streak browser checks passed.');
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
