const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
let playwright;
try { playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright'); }
catch { playwright = require(path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }
const { chromium } = playwright;

const root = path.resolve(__dirname, '..');
const types = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.json':'application/json' };
const server = http.createServer((request, response) => {
  const target = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
  if (!target.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  fs.readFile(target, (error, body) => {
    if (error) { response.writeHead(404).end(); return; }
    response.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
    response.end(body);
  });
});

let browser;
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  const failed = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('requestfailed', request => failed.push(request.url()));
  await page.goto(origin + '/closet-model-review.html');
  await page.locator('#open-closet').click();
  await page.waitForSelector('.expression-closet[open] canvas');
  await page.waitForFunction(() => document.querySelector('.expression-closet canvas')?.dataset.actorPosition === '-3.55,1.2');
  await page.waitForTimeout(1800);
  assert.equal(await page.locator('#expression-closet-title').textContent(), 'The Rose Atelier 3D 衣櫥');
  assert.match(await page.locator('.expression-closet-header').textContent(), /ELSIE’S DRESSING ROOM/);
  assert.match(await page.locator('.expression-closet-controls').textContent(), /move Elsie/);
  assert.equal(await page.locator('.expression-closet-inventory .expression-closet-item').count(), 4);
  assert.equal(errors.length, 0, errors.join('\n'));
  assert.equal(failed.length, 0, failed.join('\n'));
  const screenshot = path.join(os.tmpdir(), 'elsie-closet-review.png');
  await page.screenshot({ path: screenshot });
  await page.evaluate(() => { for (let index = 0; index < 7; index++) document.querySelector('[data-closet-camera="right"]').click(); });
  await page.waitForTimeout(250);
  const texturedWallScreenshot = path.join(os.tmpdir(), 'elsie-closet-textured-wall.png');
  await page.screenshot({ path: texturedWallScreenshot });
  await page.evaluate(() => {
    document.querySelector('[data-closet-camera="reset"]').click();
    for (let index = 0; index < 5; index++) document.querySelector('[data-closet-camera="left"]').click();
  });
  const canvasBox = await page.locator('.expression-closet canvas').boundingBox();
  await page.mouse.move(canvasBox.x + canvasBox.width * .5, canvasBox.y + canvasBox.height * .55);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x + canvasBox.width * .5, canvasBox.y + canvasBox.height * .48, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(250);
  const windowScreenshot = path.join(os.tmpdir(), 'elsie-closet-window.png');
  await page.screenshot({ path: windowScreenshot });
  await page.evaluate(() => {
    document.querySelector('[data-closet-camera="reset"]').click();
    for (let index = 0; index < 14; index++) document.querySelector('[data-closet-camera="right"]').click();
  });
  await page.waitForTimeout(250);
  const doorwayScreenshot = path.join(os.tmpdir(), 'elsie-closet-doorway.png');
  await page.screenshot({ path: doorwayScreenshot });
  console.log([screenshot, texturedWallScreenshot, windowScreenshot, doorwayScreenshot].join('\n'));
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await browser?.close();
  server.close();
});
