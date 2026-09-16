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
        assert.match(await form.locator('[data-login-status]').textContent(), /Preparing login/);
        await form.locator('#password').press('Enter');
        assert.equal(await form.evaluate(el => el.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}))), false);
        assert.equal(nativeSubmits, 0);
        assert.equal(await form.locator('#username').inputValue(), 'Synthetic Student');
        // Exercise the real slow-loading notice, then allow startup to finish.
        await page.waitForTimeout(15500);
        assert.match(await form.locator('[data-login-status]').textContent(), /Loading is taking longer/);
        release();
      }
      await page.waitForLoadState('domcontentloaded');
      if (mode === 'storage-denied' || mode === 'startup-error') {
        await page.waitForFunction(() => !document.querySelector('[data-login-form]').hasAttribute('aria-busy'));
        assert.equal(await button.isDisabled(), true);
        assert.match(await form.locator('[data-login-status]').textContent(), mode === 'storage-denied' ? /耐久待同步紀錄/ : /Login could not finish loading/);
        assert.equal(await form.evaluate(el => el.dispatchEvent(new Event('submit', {bubbles: true, cancelable: true}))), false);
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
    for (const mode of ['slow-script', 'normal', 'storage-denied', 'startup-error']) await scenario(mode);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
