import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';
import {join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const {chromium, webkit} = await import(process.env.PROFESSIONAL_QA_PLAYWRIGHT || 'playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
const base = process.env.EDDY_OVERLAY_QA_BASE || 'http://127.0.0.1:8633';

async function pagesIn(directory) {
  const pages = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    if (entry.isDirectory()) {
      if (!['assets', 'node_modules', '.git'].includes(entry.name)) pages.push(...await pagesIn(join(directory, entry.name)));
    } else if (entry.name.endsWith('.html')) {
      const path = join(directory, entry.name);
      if ((await readFile(path, 'utf8')).includes('eddy-global-dialogues.css')) pages.push(relative(root, path));
    }
  }
  return pages;
}

const pages = await pagesIn(root);
assert.ok(pages.length > 80, `expected the shared overlay across the site; found ${pages.length} pages`);
const browser = await (process.argv.includes('WebKit') ? webkit : chromium).launch({headless: true});
const context = await browser.newContext({serviceWorkers: 'block', viewport: {width: 1280, height: 900}});
await context.route('**/*', route => {
  const request = route.request();
  if (!request.url().startsWith(base) || ['script', 'image', 'font', 'media'].includes(request.resourceType())) return route.abort();
  return route.continue();
});
const page = await context.newPage();
try {
  for (const path of pages) {
    if (process.env.EDDY_OVERLAY_QA_VERBOSE) console.log(path);
    await page.goto(`${base}/${path}`, {waitUntil: 'domcontentloaded'});
    await page.evaluate(() => {
      // The video page's frame guard normally clears this class in its script.
      document.documentElement.classList.remove('frame-guard');
      const overlay = document.createElement('div');
      overlay.className = 'eddy-global-overlay';
      overlay.innerHTML = '<button type="button"><span class="eddy-global-art"><span class="eddy-global-copy">Eddy</span></span></button>';
      document.body.append(overlay);
    });
    const button = page.locator('.eddy-global-overlay button');
    try {
      await button.hover({position: {x: 10, y: 10}, timeout: 3000});
    } catch (error) {
      const styles = await button.evaluate(element => ({
        display: getComputedStyle(element).display,
        visibility: getComputedStyle(element).visibility,
        rect: element.getBoundingClientRect().toJSON(),
        parentDisplay: getComputedStyle(element.parentElement).display,
        parentPosition: getComputedStyle(element.parentElement).position,
        parentInset: getComputedStyle(element.parentElement).inset,
        parentRect: element.parentElement.getBoundingClientRect().toJSON(),
        bodyRect: document.body.getBoundingClientRect().toJSON(),
        htmlRect: document.documentElement.getBoundingClientRect().toJSON(),
      }));
      throw new Error(`${path}: ${JSON.stringify(styles)}`, {cause: error});
    }
    const hoverBackground = await button.evaluate(element => getComputedStyle(element).backgroundColor);
    assert.equal(hoverBackground, 'rgba(0, 0, 0, 0)', `${path}: hover must not paint over the page`);
    await button.focus();
    const focusBackground = await button.evaluate(element => getComputedStyle(element).backgroundColor);
    assert.equal(focusBackground, 'rgba(0, 0, 0, 0)', `${path}: keyboard focus must not paint over the page`);
    const backdrop = await page.locator('.eddy-global-overlay').evaluate(element => getComputedStyle(element).backgroundColor);
    assert.notEqual(backdrop, 'rgba(0, 0, 0, 0)', `${path}: expected a visible backdrop`);
  }
} finally {
  await browser.close();
}
console.log(`PASS: Eddy overlay stays transparent on hover and focus across ${pages.length} pages.`);
