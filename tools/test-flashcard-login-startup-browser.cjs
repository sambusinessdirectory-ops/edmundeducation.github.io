const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const url = 'https://edmundeducation.com/flashcards.html';
const source = fs.readFileSync(path.join(root, 'flashcards.html'), 'utf8');

(async () => {
  const browser = await chromium.launch({headless: true});
  try {
    async function scenario(mode) {
      const context = await browser.newContext({serviceWorkers: 'block'});
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      let nativeSubmits = 0;
      let release;
      const paused = new Promise(resolve => { release = resolve; });
      await page.route('https://edmundeducation.com/**', async route => {
        const requestUrl = new URL(route.request().url());
        if (requestUrl.pathname === '/flashcards.html' && requestUrl.searchParams.has('password')) {
          nativeSubmits++;
          return route.abort();
        }
        if (mode === 'slow-script' && requestUrl.pathname === '/flashcards-ielts-writing-data.js') await paused;
        const file = path.resolve(root, '.' + decodeURIComponent(requestUrl.pathname));
        if (!file.startsWith(root + path.sep)) return route.abort();
        if (requestUrl.pathname === '/flashcards.html') {
          let html = source;
          if (mode === 'startup-error') html = html.replace('void initialiseFlashcardPortal().catch', 'renderNeuralSpeechState = () => { throw new Error("Synthetic startup failure"); };\n    void initialiseFlashcardPortal().catch');
          return route.fulfill({contentType: 'text/html', body: html});
        }
        if (fs.existsSync(file) && fs.statSync(file).isFile()) return route.fulfill({path: file});
        return route.abort();
      });
      if (mode === 'storage-denied') await page.addInitScript(() => { indexedDB.open = () => { throw new Error('Synthetic storage denied'); }; });
      await page.goto(url, {waitUntil: 'commit'});
      const form = page.locator('[data-login-form]');
      const button = form.locator('button[type=submit]');
      await form.locator('#username').fill('Synthetic Student');
      await form.locator('#password').fill('synthetic-password');
      if (mode === 'slow-script') {
        assert.equal(await button.isDisabled(), true);
        assert.match(await form.locator('[data-login-status]').textContent(), /Preparing login|Loading learning resources/);
        await form.locator('#password').press('Enter');
        assert.equal(await form.evaluate(el => el.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}))), false);
        assert.equal(nativeSubmits, 0);
        assert.equal(await form.locator('#username').inputValue(), 'Synthetic Student');
        // Exercise the real slow-loading notice, then allow startup to finish.
        await page.waitForTimeout(15500);
        assert.match(await page.locator('[data-login-progress-detail]').textContent(), /Still working/);
        assert.ok(Number(await page.locator('[data-login-progress-bar]').getAttribute('aria-valuenow')) < 100);
        release();
      }
      await page.waitForLoadState('domcontentloaded');
      if (mode === 'storage-denied' || mode === 'startup-error') {
        await page.waitForFunction(() => !document.querySelector('[data-login-form]').hasAttribute('aria-busy'));
        assert.equal(await button.isDisabled(), true);
        assert.match(await form.locator('[data-login-status]').textContent(), mode === 'storage-denied' ? /耐久待同步紀錄/ : /Login could not finish loading/);
        assert.equal(await form.evaluate(el => el.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}))), false);
      } else if (mode.startsWith('login-')) {
        await testLoginProgress(page, mode);
      } else {
        await page.waitForFunction(() => !document.querySelector('[data-login-form] button[type=submit]').disabled);
        assert.equal(await form.locator('#username').inputValue(), 'Synthetic Student');
        await page.evaluate(() => {
          window.testLoginCalls = [];
          login = async (name, password) => { window.testLoginCalls.push({name, password}); return false; };
        });
        await button.click();
        await page.waitForFunction(() => window.testLoginCalls.length === 1);
        assert.deepEqual(await page.evaluate(() => window.testLoginCalls), [{name: 'Synthetic Student', password: 'synthetic-password'}]);
        assert.match(await form.locator('[data-login-status]').textContent(), /Wrong user name or password/);
        assert.equal(await button.isEnabled(), true);
      }
      assert.equal(nativeSubmits, 0);
      assert.equal(page.url(), url);
      assert.deepEqual(errors, []);
      console.log('PASS', mode);
      await context.close();
    }
    async function testLoginProgress(page, mode) {
      await page.waitForFunction(() => !document.querySelector('[data-login-form] button[type=submit]').disabled);
      await page.evaluate(mode => {
        window.milestones = [];
        const panel = document.querySelector('[data-login-progress]');
        new MutationObserver(() => window.milestones.push({
          value: Number(panel.querySelector('[data-login-progress-bar]').getAttribute('aria-valuenow')),
          message: panel.querySelector('[data-login-progress-message]').textContent
        })).observe(panel, {subtree: true, childList: true, attributes: true});
        reloadForCurrentFlashcardClientUpdate = () => new Promise(resolve => { window.releaseUpdate = resolve; });
        reuseAuthenticatedFlashcardRecovery = async () => null;
        callSupabaseRpc = () => new Promise(resolve => { window.releaseCredentials = () => resolve([{id: 'synthetic-id', name: 'Synthetic Student', session_token: 'synthetic-token', access: {}}]); });
        setSession = user => { currentUser = user; return true; };
        loadAutomaticLearningWordDeck = async () => {};
        loadStudentStateFromSupabase = () => new Promise(resolve => { window.releaseRecords = () => resolve(mode !== 'login-degraded'); });
        captureSupabaseStateSaveContext = () => ({owner: 'synthetic', epoch: 1});
        isSupabaseStateHydrated = () => mode !== 'login-degraded';
        hydrateFlashcardDisplayPreferences = () => {};
        refreshCurrentView = () => {};
        openRequestedFlashcardTarget = () => {};
        if (mode === 'login-thrown') login = async () => { throw new Error('Synthetic unexpected login failure'); };
      }, mode);
      await page.locator('[data-login-form] button[type=submit]').click();
      const panel = page.locator('[data-login-progress]');
      const bar = page.locator('[data-login-progress-bar]');
      if (mode === 'login-thrown') {
        await page.waitForFunction(() => document.querySelector('[data-login-progress]').dataset.state === 'error');
        assert.match(await panel.textContent(), /Login could not finish/);
        assert.equal(await page.locator('[data-login-form] button[type=submit]').isEnabled(), true);
        return;
      }
      await page.waitForFunction(() => typeof window.releaseUpdate === 'function');
      assert.equal(await bar.getAttribute('aria-valuenow'), '12');
      await page.evaluate(() => window.releaseUpdate(false));
      await page.waitForFunction(() => typeof window.releaseCredentials === 'function');
      assert.equal(await bar.getAttribute('aria-valuenow'), '35');
      assert.match(await panel.textContent(), /Checking your account and password/);
      if (mode === 'login-success') {
        await page.screenshot({path: '/private/tmp/flashcard-login-progress-desktop.png'});
        await page.setViewportSize({width: 390, height: 844});
        await page.screenshot({path: '/private/tmp/flashcard-login-progress-mobile.png'});
        const bounds = await panel.boundingBox();
        assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 390);
        await page.emulateMedia({reducedMotion: 'reduce'});
        assert.equal(await page.locator('[data-login-progress-fill]').evaluate(el => getComputedStyle(el, '::after').animationName), 'none');
      }
      await page.evaluate(() => window.releaseCredentials());
      await page.waitForFunction(() => typeof window.releaseRecords === 'function');
      assert.equal(await bar.getAttribute('aria-valuenow'), '65');
      assert.equal(await panel.isVisible(), true, 'Progress must remain visible after the login form is hidden');
      assert.equal(await page.locator('[data-login-view]').isVisible(), false);
      await page.evaluate(() => window.releaseRecords());
      await page.waitForFunction(() => document.querySelector('[data-login-progress]').dataset.state !== 'working');
      const values = await page.evaluate(() => window.milestones.map(item => item.value));
      assert.ok(values.every((value, i) => i === 0 || value >= values[i - 1]), 'Progress cannot go backwards within one login');
      if (mode === 'login-success') {
        assert.equal(await bar.getAttribute('aria-valuenow'), '100');
        assert.equal(await panel.getAttribute('data-state'), 'complete');
      } else {
        assert.ok(Number(await bar.getAttribute('aria-valuenow')) < 100);
        assert.equal(await panel.getAttribute('data-state'), 'warning');
      }
    }
    for (const mode of ['slow-script', 'normal', 'storage-denied', 'startup-error', 'login-success', 'login-degraded', 'login-thrown']) await scenario(mode);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
