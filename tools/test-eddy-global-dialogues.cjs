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
    assert.match(html, /eddy-global-dialogues\.js\?v=20261026-timed1/, `${href} must load the sitewide dialogue`);
    assert.match(html, /eddy-global-dialogues\.css\?v=20261025-1/, `${href} must load its stylesheet`);
  }
}
assert.match(nav, /queuePomodoroBreak\(pomodoroOwnerKey \|\| currentPomodoroStorageKey\(\), pomodoroState\.endsAt\)/);
assert.match(nav, /element\.hasAttribute\("data-eddy-global-dialogue"\)/);
for (const file of fs.readdirSync(root).filter((name) => name.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  if (!/<script[^>]+shared-system-nav\.js/.test(html)) continue;
  const globalAt = html.search(/<script[^>]*src="\/?eddy-global-dialogues\.js\?v=20261026-timed1"/);
  const navAt = html.search(/<script[^>]*src="\/?shared-system-nav\.js\?v=20261026-daily-visit1"/);
  assert.ok(globalAt >= 0 && navAt > globalAt, `${file} must load Eddy before navigation`);
}
assert.match(fs.readFileSync(path.join(root, 'paper3/2025-b2/index.html'), 'utf8'), /eddy-global-dialogues\.js\?v=20261026-timed1/, 'nested Paper 3 reader must load the current sitewide dialogue');
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
  if (!['eddy-global-dialogues.js', 'eddy-global-dialogues.css', 'shared-system-nav.js', 'shared-system-nav.css', 'eddy-after-lunch-dialogue.png', 'eddy-afternoon-tea-dialogue.png', 'eddy-coffee-break-dialogue.png', 'eddy-finishing-work-dialogue.png', 'eddy-gaming-time-dialogue.png', 'eddy-pomodoro-tomato-dialogue.png', 'eddy-saturday-plant-dialogue.png', 'eddy-sunday-hobbies-dialogue.png', 'eddy-evening-teddy-dialogue.png', 'eddy-bedtime-pyjamas-dialogue.png'].includes(path.basename(file))) {
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
  const pageAt = async (iso, viewport, random = 0) => {
    const page = await context.newPage();
    if (viewport) await page.setViewportSize(viewport);
    await page.addInitScript(({ value, random }) => {
      const RealDate = Date;
      window.__fakeNow = RealDate.parse(value);
      window.Date = class extends RealDate {
        constructor(...args) { super(...(args.length ? args : [window.__fakeNow])); }
        static now() { return window.__fakeNow; }
      };
      Math.random = () => random;
    }, { value: iso, random });
    await page.goto(base + '/fixture');
    return page;
  };
  try {
    const beforeLunch = await pageAt('2026-10-26T04:59:00Z', { width: 375, height: 667 });
    const lunchArt = beforeLunch.locator('.eddy-global-art img');
    assert.equal(await lunchArt.count(), 0, '12:59 Hong Kong time is too early');
    await beforeLunch.evaluate(() => { window.__fakeNow = Date.parse('2026-10-26T05:00:00Z'); window.EdmundEddyGlobalDialogue.checkLunch(); });
    await lunchArt.waitFor();
    await lunchArt.evaluate((img) => img.decode());
    assert.match(await lunchArt.getAttribute('src'), /after-lunch/);
    const lunchCopy = beforeLunch.locator('.eddy-global-copy');
    const lunchSizes = await lunchCopy.evaluate((node) => ({ main: parseFloat(getComputedStyle(node.querySelector('strong')).fontSize), sub: parseFloat(getComputedStyle(node.querySelector('span')).fontSize), scroll: node.scrollHeight, visible: node.clientHeight }));
    assert.ok(lunchSizes.main > lunchSizes.sub, 'the opening line is larger');
    assert.ok(lunchSizes.scroll <= lunchSizes.visible + 1, 'lunchtime copy fits on mobile');
    await beforeLunch.screenshot({ path: '/tmp/eddy-after-lunch-mobile.png' });
    await beforeLunch.keyboard.press('Tab');
    await lunchArt.waitFor({ state: 'detached' });
    await beforeLunch.close();
    const lunchRepeat = await pageAt('2026-10-26T05:30:00Z');
    assert.equal(await lunchRepeat.locator('.eddy-global-overlay').count(), 0, 'lunchtime greeting appears once per Hong Kong day across pages');
    await lunchRepeat.close();
    const afterLunch = await pageAt('2026-10-27T06:00:00Z');
    assert.equal(await afterLunch.locator('.eddy-global-overlay').count(), 0, '14:00 Hong Kong time is outside lunch');
    await afterLunch.close();
    for (let variant = 0; variant < 6; variant += 1) {
      const day = String(9 + variant).padStart(2, '0');
      const variantPage = await pageAt(`2026-11-${day}T05:30:00Z`, { width: 375, height: 667 }, (variant + .01) / 6);
      const copy = variantPage.locator('.eddy-global-copy');
      assert.match(await variantPage.locator('.eddy-global-art img').getAttribute('src'), /after-lunch/);
      const fit = await copy.evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
      assert.ok(fit.scroll <= fit.visible + 1, `lunchtime comment ${variant + 1} fits on mobile: ${JSON.stringify(fit)}`);
      await variantPage.close();
    }
    const lunchWeekend = await pageAt('2026-11-07T05:00:00Z', { width: 375, height: 667 });
    const lunchWeekendArt = lunchWeekend.locator('.eddy-global-art img');
    assert.match(await lunchWeekendArt.getAttribute('src'), /after-lunch/, 'lunch precedes Saturday when both are due');
    await lunchWeekend.keyboard.press('Tab');
    assert.match(await lunchWeekendArt.getAttribute('src'), /saturday-plant/);
    await lunchWeekend.close();

    const page = await pageAt('2026-10-26T06:59:00Z', { width: 375, height: 667 });
    const art = page.locator('.eddy-global-art img');
    assert.equal(await art.count(), 0, '14:59 Hong Kong time is too early');
    await page.evaluate(() => { window.__fakeNow = Date.parse('2026-10-26T07:00:00Z'); window.EdmundEddyGlobalDialogue.checkTea(); });
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

    const sameDay = await pageAt('2026-10-26T07:30:00Z');
    assert.equal(await sameDay.locator('.eddy-global-overlay').count(), 0, 'tea appears once per Hong Kong day across pages');
    await sameDay.close();
    const nextDay = await pageAt('2026-10-27T07:30:00Z');
    await nextDay.locator('.eddy-global-overlay').waitFor();
    await nextDay.close();
    const outsideWindow = await pageAt('2026-10-28T08:00:00Z');
    assert.match(await outsideWindow.locator('.eddy-global-art img').getAttribute('src'), /coffee-break/, '16:00 Hong Kong time begins the coffee greeting');
    await outsideWindow.keyboard.press('Tab');
    await outsideWindow.evaluate(() => {
      window.__fakeNow = Date.parse('2026-10-29T07:30:00Z');
      Math.random = () => .99;
      window.EdmundEddyGlobalDialogue.checkTea();
    });
    await outsideWindow.locator('.eddy-global-overlay').waitFor();
    const teaFit = await outsideWindow.locator('.eddy-global-copy').evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
    assert.ok(teaFit.scroll <= teaFit.visible + 1, `long afternoon tea copy overflows desktop box: ${JSON.stringify(teaFit)}`);
    await outsideWindow.close();

    for (const { label, hour, utcHour, image, variants } of [
      { label: 'coffee', hour: 16, utcHour: 8, image: 'coffee-break', variants: 6 },
      { label: 'finishing work', hour: 18, utcHour: 10, image: 'finishing-work', variants: 7 },
      { label: 'gaming', hour: 20, utcHour: 12, image: 'gaming-time', variants: 7 }
    ]) {
      const before = await pageAt(`2026-12-01T${String(utcHour - 1).padStart(2, '0')}:59:00Z`, { width: 375, height: 667 });
      const timedArt = before.locator('.eddy-global-art img');
      if (await timedArt.count()) {
        assert.doesNotMatch(await timedArt.getAttribute('src'), new RegExp(image), `${label} does not appear before ${hour}:00 Hong Kong time`);
        await before.keyboard.press('Tab');
      }
      await before.evaluate((iso) => {
        window.__fakeNow = Date.parse(iso);
        window.EdmundEddyGlobalDialogue.checkNewTimedMoments();
      }, `2026-12-01T${String(utcHour).padStart(2, '0')}:00:00Z`);
      await timedArt.waitFor();
      assert.match(await timedArt.getAttribute('src'), new RegExp(image));
      await before.keyboard.press('Tab');
      await before.close();
      const repeat = await pageAt(`2026-12-01T${String(utcHour).padStart(2, '0')}:30:00Z`);
      assert.equal(await repeat.locator('.eddy-global-overlay').count(), 0, `${label} appears once per Hong Kong day across pages`);
      await repeat.close();
      const after = await pageAt(`2026-12-02T${String(utcHour + 1).padStart(2, '0')}:00:00Z`);
      const afterArt = after.locator('.eddy-global-art img');
      if (await afterArt.count()) assert.doesNotMatch(await afterArt.getAttribute('src'), new RegExp(image), `${label} ends at ${hour + 1}:00 Hong Kong time`);
      await after.close();
      for (let variant = 0; variant < variants; variant += 1) {
        const day = String(10 + variant).padStart(2, '0');
        const sample = await pageAt(`2026-12-${day}T${String(utcHour).padStart(2, '0')}:30:00Z`, { width: 375, height: 667 }, (variant + .01) / variants);
        const sampleArt = sample.locator('.eddy-global-art img');
        await sampleArt.evaluate((img) => img.decode());
        assert.match(await sampleArt.getAttribute('src'), new RegExp(image));
        assert.equal(await sampleArt.evaluate((img) => img.naturalWidth), 1672, `${label} art loads`);
        const copy = sample.locator('.eddy-global-copy');
        const fit = await copy.evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
        assert.ok(fit.scroll <= fit.visible + 1, `${label} comment ${variant + 1} fits mobile: ${JSON.stringify(fit)}`);
        if (variant === 0) {
          const sizes = await copy.evaluate((node) => ({ main: parseFloat(getComputedStyle(node.querySelector('strong')).fontSize), sub: parseFloat(getComputedStyle(node.querySelector('span')).fontSize) }));
          assert.ok(sizes.main > sizes.sub, `${label} opening line is larger`);
          await sample.screenshot({ path: `/tmp/eddy-${image}-mobile.png` });
        }
        await sample.close();
      }
    }

    const breakPage = await pageAt('2026-10-30T06:00:00Z');
    await breakPage.goto(base + '/pomodoro-fixture');
    await breakPage.locator('.eddy-global-overlay').waitFor();
    assert.match(await breakPage.locator('.eddy-global-art img').getAttribute('src'), /pomodoro-tomato/);
    assert.equal(await breakPage.locator('[data-edmund-pomodoro-break-lock]').isVisible(), true, 'the real timer entered its break lock');
    await breakPage.keyboard.press('Tab');
    await breakPage.locator('.eddy-global-overlay').waitFor({ state: 'detached' });
    assert.equal(await breakPage.locator('[data-edmund-pomodoro-break-lock]').isVisible(), true, 'the break lock remains after Eddy is dismissed');
    await breakPage.close();

    const saturday = await pageAt('2026-10-31T06:59:00Z', { width: 375, height: 667 });
    const weekendArt = saturday.locator('.eddy-global-art img');
    await weekendArt.waitFor();
    await weekendArt.evaluate((img) => img.decode());
    assert.match(await weekendArt.getAttribute('src'), /saturday-plant/);
    assert.match(await saturday.locator('.eddy-global-copy strong').textContent(), /星期六/);
    const saturdaySizes = await saturday.locator('.eddy-global-copy').evaluate((node) => ({ main: parseFloat(getComputedStyle(node.querySelector('strong')).fontSize), sub: parseFloat(getComputedStyle(node.querySelector('span')).fontSize), scroll: node.scrollHeight, visible: node.clientHeight }));
    assert.ok(saturdaySizes.main > saturdaySizes.sub, 'Saturday opening has a larger first line');
    assert.ok(saturdaySizes.scroll <= saturdaySizes.visible + 1, 'Saturday copy fits mobile');
    await saturday.screenshot({ path: '/tmp/eddy-saturday-mobile.png' });
    await saturday.keyboard.press('Tab');
    await weekendArt.waitFor({ state: 'detached' });
    await saturday.evaluate(() => { window.__fakeNow = Date.parse('2026-10-31T07:00:00Z'); window.EdmundEddyGlobalDialogue.checkTea(); });
    await weekendArt.waitFor();
    assert.match(await weekendArt.getAttribute('src'), /afternoon-tea/, 'tea appears when its window begins');
    await saturday.keyboard.press('Tab');
    await saturday.close();
    const saturdayAgain = await pageAt('2026-10-31T07:30:00Z');
    assert.equal(await saturdayAgain.locator('.eddy-global-overlay').count(), 0, 'Saturday greeting and tea each appear once across pages');
    await saturdayAgain.close();

    const sunday = await pageAt('2026-11-01T07:30:00Z', { width: 375, height: 667 }, .99);
    const sundayArt = sunday.locator('.eddy-global-art img');
    await sundayArt.waitFor();
    assert.match(await sundayArt.getAttribute('src'), /afternoon-tea/, 'tea precedes Sunday when both are due');
    await sunday.keyboard.press('Tab');
    assert.match(await sundayArt.getAttribute('src'), /sunday-hobbies/);
    await sundayArt.evaluate((img) => img.decode());
    assert.match(await sunday.locator('.eddy-global-copy strong').textContent(), /星期天/);
    const sundayFit = await sunday.locator('.eddy-global-copy').evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
    assert.ok(sundayFit.scroll <= sundayFit.visible + 1, `Sunday copy fits mobile: ${JSON.stringify(sundayFit)}`);
    await sunday.screenshot({ path: '/tmp/eddy-sunday-mobile.png' });
    await sunday.keyboard.press('Tab');
    await sunday.close();
    const sundayAgain = await pageAt('2026-11-01T08:00:00Z');
    assert.match(await sundayAgain.locator('.eddy-global-art img').getAttribute('src'), /coffee-break/, 'the new coffee window starts after the once-per-day Sunday greeting');
    await sundayAgain.close();
    const longSunday = await pageAt('2026-11-08T06:00:00Z', { width: 375, height: 667 });
    assert.match(await longSunday.locator('.eddy-global-art img').getAttribute('src'), /sunday-hobbies/);
    const longSundayFit = await longSunday.locator('.eddy-global-copy').evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
    assert.ok(longSundayFit.scroll <= longSundayFit.visible + 1, `long Sunday copy fits mobile: ${JSON.stringify(longSundayFit)}`);
    await longSunday.close();

    const beforeSleepy = await pageAt('2026-10-26T12:59:00Z', { width: 375, height: 667 });
    const eveningArt = beforeSleepy.locator('.eddy-global-art img');
    assert.match(await eveningArt.getAttribute('src'), /gaming-time/, '20:59 Hong Kong time still shows gaming');
    await beforeSleepy.keyboard.press('Tab');
    await beforeSleepy.evaluate(() => { window.__fakeNow = Date.parse('2026-10-26T13:00:00Z'); window.EdmundEddyGlobalDialogue.checkEvening(); });
    await eveningArt.waitFor();
    await eveningArt.evaluate((img) => img.decode());
    assert.match(await eveningArt.getAttribute('src'), /evening-teddy/);
    assert.match(await beforeSleepy.locator('.eddy-global-copy strong').textContent(), /眼皮/);
    const sleepyFit = await beforeSleepy.locator('.eddy-global-copy').evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
    assert.ok(sleepyFit.scroll <= sleepyFit.visible + 1, `21:00 mobile copy fits: ${JSON.stringify(sleepyFit)}`);
    await beforeSleepy.screenshot({ path: '/tmp/eddy-evening-teddy-mobile.png' });
    await beforeSleepy.keyboard.press('Tab');
    await eveningArt.waitFor({ state: 'detached' });
    await beforeSleepy.evaluate(() => { window.__fakeNow = Date.parse('2026-10-26T14:00:00Z'); window.EdmundEddyGlobalDialogue.checkEvening(); });
    await eveningArt.waitFor();
    await eveningArt.evaluate((img) => img.decode());
    assert.match(await eveningArt.getAttribute('src'), /bedtime-pyjamas/);
    const bedtimeFit = await beforeSleepy.locator('.eddy-global-copy').evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
    assert.ok(bedtimeFit.scroll <= bedtimeFit.visible + 1, `22:00 mobile copy fits: ${JSON.stringify(bedtimeFit)}`);
    await beforeSleepy.screenshot({ path: '/tmp/eddy-bedtime-mobile.png' });
    await beforeSleepy.keyboard.press('Tab');
    await beforeSleepy.close();
    const sameNight = await pageAt('2026-10-26T16:30:00Z');
    assert.equal(await sameNight.locator('.eddy-global-overlay').count(), 0, 'bedtime does not repeat after midnight in the same Hong Kong night');
    await sameNight.close();
    const afterBedtime = await pageAt('2026-10-27T18:00:00Z');
    assert.equal(await afterBedtime.locator('.eddy-global-overlay').count(), 0, '02:00 Hong Kong time is outside bedtime');
    await afterBedtime.close();
    const midnightArrival = await pageAt('2026-11-03T16:30:00Z', { width: 375, height: 667 });
    assert.match(await midnightArrival.locator('.eddy-global-art img').getAttribute('src'), /bedtime-pyjamas/, 'first arrival after midnight shows bedtime');
    await midnightArrival.keyboard.press('Tab');
    await midnightArrival.close();
    const midnightRepeat = await pageAt('2026-11-03T17:30:00Z');
    assert.equal(await midnightRepeat.locator('.eddy-global-overlay').count(), 0, 'the same late night appears once across pages');
    await midnightRepeat.close();
    const secondSleepy = await pageAt('2026-11-02T13:30:00Z', { width: 375, height: 667 }, .2);
    assert.match(await secondSleepy.locator('.eddy-global-art img').getAttribute('src'), /evening-teddy/);
    assert.match(await secondSleepy.locator('.eddy-global-copy strong').textContent(), /\n/);
    const secondSleepyFit = await secondSleepy.locator('.eddy-global-copy').evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
    assert.ok(secondSleepyFit.scroll <= secondSleepyFit.visible + 1, `two-line sleepy copy fits mobile: ${JSON.stringify(secondSleepyFit)}`);
    await secondSleepy.close();
    console.log('Sitewide Eddy timed, weekend and Pomodoro browser checks passed.');
  } finally {
    await context.close();
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((error) => { console.error(error); process.exitCode = 1; server.close(); });
