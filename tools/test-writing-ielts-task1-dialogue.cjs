const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

(async () => {
  const root = path.resolve(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'writing-submission.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'writing-submission.js'), 'utf8');
  assert.match(html, /eddy-writing-ielts-task1-dialogue\.js\?v=20261026-1/);
  assert.match(html, /eddy-writing-ielts-task1-dialogue\.css\?v=20261026-1/);
  assert.match(app, /edmund:writing-topic-selected/);
  assert.match(app, /sectionKey: resource\.sectionKey, detail: resource\.detail/);

  const browser = await chromium.launch({ headless: true, args: ['--allow-file-access-from-files'] });
  const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await context.newPage();
  try {
    await page.goto('file://' + path.join(root, 'eddy-writing-daily-dialogue.css'));
    await page.setContent(`<link rel="stylesheet" href="file://${root}/eddy-first-question-dialogue.css"><link rel="stylesheet" href="file://${root}/eddy-writing-daily-dialogue.css"><link rel="stylesheet" href="file://${root}/eddy-writing-ielts-task1-dialogue.css"><section data-view="workspace" hidden></section>`);
    await page.evaluate(() => { window.EdmundEddyGlobalDialogue = { isBlocking: () => true }; });
    await page.addScriptTag({ path: path.join(root, 'eddy-writing-daily-dialogue.js') });
    await page.addScriptTag({ path: path.join(root, 'eddy-writing-ielts-task1-dialogue.js') });
    const daily = page.locator('.eddy-first-question-overlay:not(.eddy-writing-ielts-task1-overlay)');
    const topic = page.locator('.eddy-writing-ielts-task1-overlay');
    const art = topic.locator('img');
    const message = topic.locator('.eddy-first-question-message');
    const fire = (detail) => page.evaluate((value) => document.dispatchEvent(new CustomEvent('edmund:writing-topic-selected', { detail: value })), detail);
    const process = { sectionKey: 'ielts-writing', detail: 'IELTS Writing Task 1 · Process Diagram' };
    const maps = { sectionKey: 'ielts-writing', detail: 'IELTS Writing Task 1 · Maps' };

    await page.locator('[data-view="workspace"]').evaluate((node) => { node.hidden = false; });
    await fire(process);
    assert.equal(await topic.count(), 0, 'the sitewide greeting blocks the topic dialogue');
    await page.evaluate(() => {
      window.EdmundEddyGlobalDialogue.isBlocking = () => false;
      document.dispatchEvent(new Event('edmund:eddy-global-dialogue-finished'));
    });
    await daily.waitFor();
    assert.equal(await topic.count(), 0, 'the universal writing greeting goes first');
    await page.keyboard.press('Tab');
    await topic.waitFor();
    assert.match(await art.getAttribute('src'), /ielts-process/);
    await page.keyboard.press('Enter');
    await topic.waitFor({ state: 'detached' });

    await fire({ sectionKey: 'ielts-writing', detail: 'IELTS Writing Task 2 · Maps' });
    await fire({ sectionKey: 'dse-writing', detail: 'Task 1 · Process Diagram' });
    assert.equal(await topic.count(), 0, 'unrelated tasks do not trigger the IELTS art');

    await page.evaluate(() => {
      const picker = document.createElement('dialog');
      picker.id = 'random-topic-picker';
      document.body.append(picker);
      picker.showModal();
    });
    await fire(maps);
    assert.equal(await topic.count(), 0, 'the topic picker closes before the selected artwork appears');
    await page.evaluate(() => document.querySelector('#random-topic-picker').close());
    await topic.waitFor();
    assert.match(await art.getAttribute('src'), /ielts-maps/);
    await page.keyboard.press('Escape');
    await topic.waitFor({ state: 'detached' });

    for (const [kind, variants, image] of [[process, 6, 'ielts-process'], [maps, 7, 'ielts-maps']]) {
      for (let index = 0; index < variants; index += 1) {
        await page.evaluate((fraction) => { Math.random = () => fraction; }, (index + .01) / variants);
        await fire(kind);
        await topic.waitFor();
        assert.match(await art.getAttribute('src'), new RegExp(image));
        await art.evaluate((node) => node.decode());
        assert.ok(await art.evaluate((node) => node.naturalWidth >= 1600), 'the selected artwork loads');
        const fit = await message.evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
        assert.ok(fit.scroll <= fit.visible + 1, `${image} comment ${index + 1} fits mobile: ${JSON.stringify(fit)}`);
        if (index === 0) {
          const sizes = await message.evaluate((node) => ({ main: parseFloat(getComputedStyle(node.querySelector('strong')).fontSize), sub: parseFloat(getComputedStyle(node.querySelector('span')).fontSize) }));
          assert.ok(sizes.main > sizes.sub, 'the first comment has a larger opening line');
          await page.screenshot({ path: `/tmp/eddy-writing-${image}-mobile.png` });
        }
        await page.keyboard.press('Tab');
        await topic.waitFor({ state: 'detached' });
      }
    }
    console.log('IELTS process and map writing dialogues passed browser checks.');
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
