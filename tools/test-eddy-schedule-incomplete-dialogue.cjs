const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

(async () => {
  const root = path.resolve(__dirname, '..');
  const browser = await chromium.launch({ headless: true, args: ['--allow-file-access-from-files'] });
  const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const setup = async () => {
    const page = await context.newPage();
    await page.goto('file://' + path.join(root, 'schedule-calendar.mjs'));
    await page.setContent(`<link rel="stylesheet" href="file://${root}/eddy-first-question-dialogue.css"><link rel="stylesheet" href="file://${root}/eddy-schedule-two-day-dialogue.css"><section data-view="calendar"></section>`);
    await page.addScriptTag({ path: path.join(root, 'eddy-schedule-incomplete-dialogue.js') });
    return page;
  };
  const fire = (page, studentId = 'student-1', date = today) => page.evaluate(({ studentId, date }) => {
    sessionStorage.setItem('edmund-schedule-session-v1', JSON.stringify({ role: 'student', id: studentId }));
    document.dispatchEvent(new CustomEvent('edmund:schedule-two-day-incomplete-homework', { detail: { studentId, date } }));
    document.dispatchEvent(new CustomEvent('edmund:schedule-learning-day-summary', { detail: { studentId, date, streak: 0 } }));
  }, { studentId, date });
  try {
    const page = await setup();
    const overlay = page.locator('.eddy-schedule-incomplete-overlay');
    const message = overlay.locator('.eddy-first-question-message');
    await fire(page, 'student-1', '2020-01-01');
    assert.equal(await overlay.count(), 0, 'old dates are ignored');
    for (let variant = 0; variant < 7; variant += 1) {
      await page.evaluate((fraction) => { Math.random = () => fraction; }, (variant + .01) / 7);
      await fire(page, `student-${variant + 1}`);
      await overlay.waitFor();
      const art = overlay.locator('img');
      assert.equal(await art.getAttribute('src'), 'eddy-schedule-two-day-incomplete-dialogue.png');
      await art.evaluate((img) => img.decode());
      assert.ok(await art.evaluate((img) => img.naturalWidth >= 1600));
      const fit = await message.evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
      assert.ok(fit.scroll <= fit.visible + 1, `variant ${variant + 1} fits on mobile: ${JSON.stringify(fit)}`);
      await page.keyboard.press('Tab');
      await overlay.waitFor({ state: 'detached' });
      await fire(page, `student-${variant + 1}`);
      assert.equal(await overlay.count(), 0, 'reminder is once per student per Hong Kong day');
    }
    await page.close();
    const next = await setup();
    await fire(next, 'student-1');
    assert.equal(await next.locator('.eddy-schedule-incomplete-overlay').count(), 0, 'reminder stays dismissed across page loads');
    await next.close();
    console.log('Two-day incomplete homework Eddy browser checks passed.');
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
