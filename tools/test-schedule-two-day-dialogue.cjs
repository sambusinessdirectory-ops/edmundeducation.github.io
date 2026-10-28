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
  assert.match(html, /eddy-schedule-two-day-dialogue\.js\?v=20261028-days7-10/);
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
    await fire(page, 'student-1', 11);
    await fire(page, 'student-1', 2, previousDate);
    assert.equal(await overlay.count(), 0, 'only a current milestone qualifies');

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

    for (const [streak, count, image] of [
      [3, 7, 'eddy-schedule-three-day-dialogue.png'],
      [4, 5, 'eddy-schedule-four-day-dialogue.png'],
      [5, 7, 'eddy-schedule-five-day-dialogue.png'],
      [6, 6, 'eddy-schedule-six-day-dialogue.png'],
      [7, 7, 'eddy-schedule-seven-day-dialogue.png'],
      [8, 5, 'eddy-schedule-eight-day-dialogue.png'],
      [9, 6, 'eddy-schedule-nine-day-dialogue.png'],
      [10, 3, 'eddy-schedule-ten-day-dialogue.png']
    ]) {
      for (let variant = 0; variant < count; variant += 1) {
        const id = `student-${streak}-${variant}`;
        await page.evaluate((fraction) => { Math.random = () => fraction; }, (variant + .01) / count);
        await fire(page, id, streak);
        await overlay.waitFor();
        const art = overlay.locator('img');
        assert.equal(await art.getAttribute('src'), image);
        await art.evaluate((img) => img.decode());
        assert.ok(await art.evaluate((img) => img.naturalWidth >= 1600), 'milestone art loads');
        const fit = await message.evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
        assert.ok(fit.scroll <= fit.visible + 1, `${streak}-day variant ${variant + 1} overflows mobile box: ${JSON.stringify(fit)}`);
        if (streak <= 4) assert.doesNotMatch(await message.textContent(), /你/);
        if (streak === 3 && variant === 0) {
          const sizes = await message.evaluate((node) => ({ main: parseFloat(getComputedStyle(node.querySelector('strong')).fontSize), sub: parseFloat(getComputedStyle(node.querySelector('span')).fontSize) }));
          assert.ok(sizes.main > sizes.sub, 'three-day headline is larger');
          await page.screenshot({ path: '/tmp/eddy-schedule-three-day-mobile.png' });
        }
        if (streak === 4 && variant === 0) await page.screenshot({ path: '/tmp/eddy-schedule-four-day-mobile.png' });
        if ([5, 6, 7, 8, 9].includes(streak) && variant === 0) {
          const sizes = await message.evaluate((node) => ({ main: parseFloat(getComputedStyle(node.querySelector('strong')).fontSize), sub: parseFloat(getComputedStyle(node.querySelector('span')).fontSize) }));
          assert.ok(sizes.main > sizes.sub, `${streak}-day headline is larger`);
          await page.screenshot({ path: `/tmp/eddy-schedule-${streak}-day-mobile.png` });
        }
        if (streak === 6 && variant === 5) {
          assert.match(await message.textContent(), /值得這朵玫瑰/);
          await page.keyboard.press('Tab');
          assert.match(await message.textContent(), /嘴裡還咬著玫瑰/);
          assert.equal(await overlay.count(), 1, 'the final rose comment advances before closing');
        }
        if ((streak === 7 && variant === 4) || (streak === 9 && variant === 5)) {
          const first = await message.textContent();
          await page.keyboard.press('Tab');
          assert.notEqual(await message.textContent(), first, 'the requested second page appears');
        }
        await page.keyboard.press('Enter');
        await overlay.waitFor({ state: 'detached' });
        await fire(page, id, streak);
        assert.equal(await overlay.count(), 0, `${streak}-day greeting is shown once to that student that day`);
      }
      await fire(page, `stale-${streak}`, streak, previousDate);
      assert.equal(await overlay.count(), 0, 'a stale milestone does not show');
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
    for (const [studentId, streak] of [['student-1', 2], ['student-3-0', 3], ['student-4-0', 4], ['student-5-0', 5], ['student-6-0', 6], ['student-7-0', 7], ['student-8-0', 8], ['student-9-0', 9], ['student-10-0', 10]]) {
      await fire(secondPage, studentId, streak);
      assert.equal(await secondPage.locator('.eddy-schedule-two-day-overlay').count(), 0, `${streak}-day greeting stays dismissed across page loads`);
    }
    await secondPage.close();
    console.log('Eddy two- through ten-day homework streak browser checks passed.');
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
