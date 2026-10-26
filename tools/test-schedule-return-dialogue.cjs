const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

(async () => {
  const root = path.resolve(__dirname, '..');
  const schedule = fs.readFileSync(path.join(root, 'schedule-system.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'schedule-system.html'), 'utf8');
  assert.match(schedule, /schedule_student_check_in/);
  assert.match(html, /eddy-schedule-return-dialogue\.js\?v=20261026-1/);
  assert.match(html, /eddy-schedule-return-dialogue\.css\?v=20261026-1/);

  const browser = await chromium.launch({ headless: true, args: ['--allow-file-access-from-files'] });
  const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const setup = async () => {
    const page = await context.newPage();
    await page.goto('file://' + path.join(root, 'schedule-calendar.mjs'));
    await page.setContent(`<link rel="stylesheet" href="file://${root}/eddy-first-question-dialogue.css"><link rel="stylesheet" href="file://${root}/eddy-schedule-return-dialogue.css"><section data-view="calendar"></section>`);
    await page.addScriptTag({ path: path.join(root, 'eddy-schedule-return-dialogue.js') });
    return page;
  };
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const date = `${values.year}-${values.month}-${values.day}`;
  const fire = (page, studentId, gapDays, day = date) => page.evaluate(({ studentId, gapDays, date }) => {
    sessionStorage.setItem('edmund-schedule-session-v1', JSON.stringify({ role: 'student', id: studentId }));
    document.dispatchEvent(new CustomEvent('edmund:schedule-student-return-gap', { detail: { studentId, gapDays, date } }));
  }, { studentId, gapDays, date: day });

  try {
    const page = await setup();
    const overlay = page.locator('.eddy-schedule-return-overlay');
    const message = page.locator('.eddy-schedule-return-message');
    await fire(page, 'student-no-gap', 1);
    await fire(page, 'student-unknown', null);
    assert.equal(await overlay.count(), 0, 'only a missed Hong Kong calendar day qualifies');

    for (let variant = 0; variant < 4; variant += 1) {
      const id = `student-${variant}`;
      await page.evaluate((fraction) => { Math.random = () => fraction; }, (variant + .01) / 4);
      await fire(page, id, variant + 2);
      await overlay.waitFor();
      const art = overlay.locator('img');
      assert.match(await art.getAttribute('src'), /return-1/);
      await art.evaluate((img) => img.decode());
      assert.ok(await art.evaluate((img) => img.naturalWidth) > 0);
      assert.match(await message.textContent(), new RegExp(String(variant + 2)));
      const fit = await message.evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
      assert.ok(fit.scroll <= fit.visible + 1, `opening ${variant + 1} overflows mobile box: ${JSON.stringify(fit)}`);
      if (variant === 0) {
        const sizes = await message.evaluate((node) => ({ main: parseFloat(getComputedStyle(node.querySelector('strong')).fontSize), sub: parseFloat(getComputedStyle(node.querySelector('span')).fontSize) }));
        assert.ok(sizes.main > sizes.sub, 'opening first line is larger');
        await page.screenshot({ path: '/tmp/eddy-schedule-return-mobile.png' });
      }
      await page.keyboard.press('Tab');
      assert.match(await art.getAttribute('src'), /return-2/);
      if (variant === 1) assert.equal(await message.textContent(), '開玩笑的！見到您真開心！');
      else assert.notEqual(await message.textContent(), '開玩笑的！見到您真開心！');
      await page.keyboard.press('Tab');
      assert.match(await art.getAttribute('src'), /return-3/);
      await page.keyboard.press('Tab');
      await overlay.waitFor({ state: 'detached' });
      await fire(page, id, variant + 2);
      assert.equal(await overlay.count(), 0, 'the return sequence appears once per student and day');
    }

    await page.evaluate(() => { window.EdmundEddyGlobalDialogue = { isBlocking: () => true }; });
    await fire(page, 'blocked-student', 5);
    assert.equal(await overlay.count(), 0, 'sitewide dialogue has priority');
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
    await fire(page, 'queued-student', 4);
    assert.equal(await overlay.count(), 0, 'other Eddy dialogues finish first');
    await page.locator('#other-eddy').evaluate((node) => node.remove());
    await overlay.waitFor();
    await page.keyboard.press('Escape');
    await overlay.waitFor({ state: 'detached' });
    await page.close();

    const secondPage = await setup();
    await fire(secondPage, 'student-0', 2);
    assert.equal(await secondPage.locator('.eddy-schedule-return-overlay').count(), 0, 'deduplication persists across page loads');
    await secondPage.close();
    console.log('Eddy return-to-homework dialogue browser checks passed.');
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
