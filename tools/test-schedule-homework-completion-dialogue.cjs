const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--allow-file-access-from-files'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 750 } });
    const root = path.resolve(__dirname, '..');
    assert.match(fs.readFileSync(path.join(root, 'schedule-system.js'), 'utf8'), /count <= Math\.min\(5, after\)/, 'calendar emits fourth and fifth milestones');
    await page.goto('file://' + path.join(root, 'schedule-calendar.mjs'));
    await page.setContent(`<link rel="stylesheet" href="file://${root}/eddy-first-question-dialogue.css"><link rel="stylesheet" href="file://${root}/eddy-schedule-homework-completion-dialogue.css">`);
    await page.addScriptTag({ path: path.join(root, 'eddy-schedule-homework-completion-dialogue.js') });
    await page.evaluate(() => { window.celebrationCount = 0; document.addEventListener('edmund:schedule-homework-dialogues-finished', () => { window.celebrationCount += 1; }); });
    const fire = (counts) => page.evaluate((milestones) => document.dispatchEvent(new CustomEvent('edmund:schedule-homework-completed', {
      detail: { studentId: 'student-1', milestones: milestones.map((count) => ({ date: '2026-10-25', count })) }
    })), counts);
    const art = page.locator('.eddy-first-question-art img');
    const message = page.locator('.eddy-first-question-message--homework-completed');

    await fire([1]);
    await art.waitFor();
    assert.match(await art.getAttribute('src'), /homework-one/);
    assert.ok((await message.textContent()).length > 5);
    assert.ok((await art.evaluate((img) => img.naturalWidth)) >= 1671);
    await page.keyboard.press('Tab');
    await art.waitFor({ state: 'detached' });

    await fire([2]);
    await art.waitFor();
    assert.match(await art.getAttribute('src'), /homework-two\.png/);
    await page.mouse.click(20, 20);
    assert.match(await art.getAttribute('src'), /homework-two-break/);
    await page.keyboard.press('Enter');
    await art.waitFor({ state: 'detached' });
    assert.equal(await page.evaluate(() => window.celebrationCount), 2);

    await fire([3]);
    await art.waitFor();
    assert.match(await art.getAttribute('src'), /homework-three\.png/);
    await page.keyboard.press(' ');
    assert.match(await art.getAttribute('src'), /homework-three-celebrate/);
    await page.keyboard.press('Tab');
    await art.waitFor({ state: 'detached' });
    assert.equal(await page.evaluate(() => window.celebrationCount), 3);

    await fire([4]);
    await art.waitFor();
    assert.match(await art.getAttribute('src'), /homework-four\.png/);
    assert.ok((await art.evaluate((img) => img.naturalWidth)) >= 1671);
    await page.keyboard.press('Tab');
    assert.match(await art.getAttribute('src'), /homework-four-celebrate/);
    await page.keyboard.press('Enter');
    await art.waitFor({ state: 'detached' });

    await fire([5]);
    await art.waitFor();
    assert.match(await art.getAttribute('src'), /homework-five\.png/);
    assert.ok((await art.evaluate((img) => img.naturalWidth)) >= 1671);
    await page.keyboard.press('Tab');
    assert.match(await art.getAttribute('src'), /homework-five-celebrate/);
    await page.keyboard.press('Enter');
    await art.waitFor({ state: 'detached' });
    assert.equal(await page.evaluate(() => window.celebrationCount), 5);

    await fire([1, 2]);
    await art.waitFor();
    assert.match(await art.getAttribute('src'), /homework-one/);
    await page.keyboard.press('Escape');
    await art.waitFor();
    assert.match(await art.getAttribute('src'), /homework-two\.png/);
    await page.keyboard.press('Escape');
    await art.waitFor({ state: 'detached' });
    assert.equal(await page.evaluate(() => window.celebrationCount), 6, 'queued milestone dialogues trigger the celebration once');

    await page.setViewportSize({ width: 375, height: 667 });
    await fire([3]);
    await art.waitFor();
    const box = await message.boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= 375, `mobile copy outside viewport: ${JSON.stringify(box)}`);
    assert.ok((await art.evaluate((img) => img.naturalWidth)) >= 1671);
    await page.screenshot({ path: '/tmp/eddy-homework-completion-mobile.png' });
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await art.waitFor({ state: 'detached' });
    for (const [count, variants] of [[4, 5], [5, 5]]) {
      for (let variant = 0; variant < variants; variant += 1) {
        await page.evaluate((fraction) => { Math.random = () => fraction; }, (variant + .01) / variants);
        await fire([count]);
        await art.waitFor();
        for (let frame = 0; frame < 2; frame += 1) {
          const fit = await message.evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
          assert.ok(fit.scroll <= fit.visible + 1, `homework ${count}, variant ${variant}, frame ${frame} overflows mobile box: ${JSON.stringify(fit)}`);
          if (variant === 0 && frame === 0) await page.screenshot({ path: `/tmp/eddy-homework-${count}-mobile.png` });
          await page.keyboard.press('Tab');
        }
        await art.waitFor({ state: 'detached' });
      }
    }
    await page.evaluate(() => {
      const dialog = document.createElement('dialog');
      dialog.id = 'celebration-test';
      document.body.append(dialog);
      document.addEventListener('edmund:schedule-homework-dialogues-finished', () => dialog.showModal(), { once: true });
    });
    await fire([2]);
    await art.waitFor();
    assert.equal(await page.locator('#celebration-test').evaluate((dialog) => dialog.open), false);
    await page.keyboard.press('Tab');
    assert.match(await art.getAttribute('src'), /homework-two-break/);
    assert.equal(await page.locator('#celebration-test').evaluate((dialog) => dialog.open), false);
    await page.keyboard.press('Tab');
    await art.waitFor({ state: 'detached' });
    assert.equal(await page.locator('#celebration-test').evaluate((dialog) => dialog.open), true, 'hand-up celebration opens after both dialogue images');
    console.log('Eddy schedule homework completion dialogue browser checks passed.');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
