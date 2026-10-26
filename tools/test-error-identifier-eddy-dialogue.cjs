const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

(async () => {
  const root = path.resolve(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'error-identifier-system.html'), 'utf8');
  assert.match(html, /eddy-error-identifier-dialogue\.js\?v=20261026-1/);
  assert.match(html, /eddy-error-identifier-dialogue\.css\?v=20261026-1/);
  assert.match(fs.readFileSync(path.join(root, 'learning-portal-scaffold.js'), 'utf8'), /edmund:learning-portal-session/);

  const browser = await chromium.launch({ headless: true, args: ['--allow-file-access-from-files'] });
  const context = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await context.newPage();
  try {
    await page.goto('file://' + path.join(root, 'eddy-error-identifier-dialogue.css'));
    await page.setContent(`<link rel="stylesheet" href="file://${root}/eddy-first-question-dialogue.css"><link rel="stylesheet" href="file://${root}/eddy-error-identifier-dialogue.css"><section data-view="dashboard" hidden></section>`);
    await page.evaluate(() => {
      window.testSession = { portalId: 'error-identifier', user: null, token: '' };
      window.EDMUND_LEARNING_PORTAL_CONTEXT = { portalId: 'error-identifier', getSession: () => window.testSession };
      window.EdmundEddyGlobalDialogue = { isBlocking: () => false };
    });
    await page.addScriptTag({ path: path.join(root, 'eddy-error-identifier-dialogue.js') });
    const overlay = page.locator('.eddy-error-identifier-overlay');
    const message = overlay.locator('.eddy-error-identifier-message');
    const announce = (id, role = 'student') => page.evaluate(({ id, role }) => {
      window.testSession = { portalId: 'error-identifier', user: id ? { id, role } : null, token: id ? 'test-token' : '' };
      window.dispatchEvent(new CustomEvent('edmund:learning-portal-session', { detail: { portalId: 'error-identifier', user: window.testSession.user } }));
    }, { id, role });

    await announce('student-1');
    assert.equal(await overlay.count(), 0, 'the login screen does not show the dialogue');
    await page.locator('[data-view="dashboard"]').evaluate((node) => { node.hidden = false; });
    await announce('student-1');
    await overlay.waitFor();
    await page.keyboard.press('Tab');
    await overlay.waitFor({ state: 'detached' });
    await announce('student-1');
    assert.equal(await overlay.count(), 0, 'repeated session announcements do not reopen the dialogue');

    await announce(null);
    await announce('staff-1', 'staff');
    assert.equal(await overlay.count(), 0, 'staff accounts do not receive the student greeting');
    await announce(null);
    await page.evaluate(() => { window.EdmundEddyGlobalDialogue.isBlocking = () => true; });
    await announce('student-2');
    assert.equal(await overlay.count(), 0, 'the sitewide dialogue has priority');
    await page.evaluate(() => {
      window.EdmundEddyGlobalDialogue.isBlocking = () => false;
      document.dispatchEvent(new Event('edmund:eddy-global-dialogue-finished'));
    });
    await overlay.waitFor();
    await page.keyboard.press('Escape');
    await overlay.waitFor({ state: 'detached' });

    for (let index = 0; index < 7; index += 1) {
      await announce(null);
      await page.evaluate((fraction) => { Math.random = () => fraction; }, (index + .01) / 7);
      await announce(`variant-${index}`);
      await overlay.waitFor();
      const art = overlay.locator('img');
      await art.evaluate((node) => node.decode());
      assert.ok(await art.evaluate((node) => node.naturalWidth >= 1600), 'the supplied illustration loads');
      const fit = await message.evaluate((node) => ({ scroll: node.scrollHeight, visible: node.clientHeight }));
      assert.ok(fit.scroll <= fit.visible + 1, `comment ${index + 1} fits the mobile dialogue box: ${JSON.stringify(fit)}`);
      if (index === 0) {
        const sizes = await message.evaluate((node) => ({ main: parseFloat(getComputedStyle(node.querySelector('strong')).fontSize), sub: parseFloat(getComputedStyle(node.querySelector('span')).fontSize) }));
        assert.ok(sizes.main > sizes.sub, 'the opening line is larger');
        await page.screenshot({ path: '/tmp/eddy-error-identifier-mobile.png' });
      }
      await page.keyboard.press('Tab');
      await overlay.waitFor({ state: 'detached' });
    }
    console.log('Error Identifier Eddy login dialogue passed browser checks.');
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
