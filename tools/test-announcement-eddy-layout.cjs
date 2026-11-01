const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));

const root = path.resolve(__dirname, '..');
const html = `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/site-announcements.css"><body><dialog class="site-announcement-dialog" id="announcement"><article class="site-announcement-card"><div class="site-announcement-gallery" style="height:180px">圖片 1 / 4</div><div class="site-announcement-copy"><p class="site-announcement-kicker">EDMUNDEDUCATION · 最新公告</p><h2>重要通知</h2><div class="site-announcement-message-wrap"><div class="site-announcement-message">好消息！<br><br>Phrasal Verbs 迎來了新改動<br>不需要再寫句子，直接使用MC完成則可以<br>大大降低難度～做得更稱心！</div><button class="site-announcement-eddy" type="button"><img src="/eddy-new-announcement-dialogue.png" alt=""><span class="site-announcement-eddy-copy">Eddy 有個天大的好消息要宣布啦！嘿嘿，準備好大吃一驚了嗎？</span></button></div><div class="site-announcement-actions"><button>聯絡 Edmund 以知道更多</button><button>知道了</button></div></div></article></dialog><script>document.getElementById('announcement').showModal()</script></body></html>`;
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (pathname === '/fixture') { response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(html); return; }
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, bytes) => response.writeHead(error ? 404 : 200, { 'Content-Type': file.endsWith('.css') ? 'text/css' : 'image/png' }).end(error ? '' : bytes));
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [390, 665, 1100]) {
      const page = await browser.newPage({ viewport: { width, height: 844 } });
      await page.goto(`http://127.0.0.1:${server.address().port}/fixture`);
      const box = await page.evaluate(() => {
        const rect = selector => document.querySelector(selector).getBoundingClientRect();
        const message = rect('.site-announcement-message');
        const wrap = rect('.site-announcement-message-wrap');
        const eddy = rect('.site-announcement-eddy');
        const actions = rect('.site-announcement-actions');
        return { messageBottom: message.bottom, wrapBottom: wrap.bottom, eddyTop: eddy.top, eddyBottom: eddy.bottom, actionsTop: actions.top };
      });
      assert(box.eddyTop <= box.messageBottom + 2, `Eddy touches the announcement message at ${width}px: ${JSON.stringify(box)}`);
      assert(Math.abs(box.eddyBottom - box.wrapBottom - 1) <= 2, `Eddy's dialogue wraps over the message bottom at ${width}px`);
      assert(box.actionsTop >= box.eddyBottom, `buttons remain after the attached Eddy panel at ${width}px`);
      assert.equal(await page.locator('.site-announcement-eddy img').evaluate(image => image.complete && image.naturalWidth > 0), true);
      if (width === 665) await page.screenshot({ path: '/tmp/eddy-announcement-attached.png' });
      if (width === 390) await page.screenshot({ path: '/tmp/eddy-announcement-attached-mobile.png' });
      await page.close();
    }
    console.log('PASS: announcement Eddy overlaps and anchors to the message edge at phone, narrow, and desktop widths');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
