const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME, '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = path.resolve(__dirname, '..');
for (const name of ['eddy-morning-strength-dialogue.png', 'eddy-self-rating-low-motivation-dialogue.png', 'eddy-self-rating-high-motivation-dialogue.png', 'eddy-coin-wallet-dialogue.png']) assert.ok(fs.statSync(path.join(root, name)).size > 100000);
const pages = {
  '/': '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/eddy-global-dialogues.css"></head><body><script src="/eddy-global-dialogues.js"></script></body></html>',
  '/schedule-system.html': '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/eddy-first-question-dialogue.css"><link rel="stylesheet" href="/eddy-schedule-two-day-dialogue.css"></head><body><div data-view="calendar"></div><script>sessionStorage.setItem("edmund-schedule-session-v1",JSON.stringify({role:"student",id:"student-1"}));</script><script src="/eddy-schedule-self-rating-dialogue.js"></script></body></html>',
  '/nav-coin': '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/shared-system-nav.css"></head><body><div class="edmund-system-switcher" data-edmund-system-switcher data-system="schedule"></div><div class="edmund-system-header__actions"></div><script>sessionStorage.setItem("edmund-schedule-session-v1",JSON.stringify({role:"student",id:"student-1",name:"Student",studentToken:"test-token"}));window.EDMUND_SUPABASE={url:"https://invalid.example",anonKey:"test"};</script><script src="/shared-system-nav.js"></script></body></html>',
  '/coin': '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><button id="wallet">Coins</button><script type="module">import{showCoinEddy}from"/eddy-coin-wallet-dialogue.mjs";document.querySelector("#wallet").onclick=()=>showCoinEddy(()=>document.body.dataset.walletOpened="true")</script></body></html>'
};
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (pages[url.pathname]) { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(pages[url.pathname]); return; }
  const file = path.resolve(root, '.' + url.pathname);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'content-type': file.endsWith('.css') ? 'text/css' : file.endsWith('.png') ? 'image/png' : 'text/javascript' });
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless:true});
  const context = await browser.newContext({viewport:{width:375,height:667}});
  const origin = `http://127.0.0.1:${server.address().port}`;
  try {
    const morning = await context.newPage();
    await morning.addInitScript(() => { const RealDate=Date; window.Date=class extends RealDate { constructor(...args){super(...(args.length?args:['2026-11-02T01:30:00Z']));} static now(){return RealDate.parse('2026-11-02T01:30:00Z');} }; Math.random=()=>.4; });
    await morning.goto(origin+'/');
    await morning.locator('.eddy-global-art img').waitFor();
    assert.match(await morning.locator('.eddy-global-art img').getAttribute('src'), /morning-strength/);
    assert.equal(await morning.locator('.eddy-horse-pun').textContent(), '馬');
    const morningFit=await morning.locator('.eddy-global-copy').evaluate(n=>n.scrollHeight<=n.clientHeight+1);
    assert.ok(morningFit,'morning text fits on a phone');
    await morning.keyboard.press('Escape');
    const morningAgain=await context.newPage();
    await morningAgain.addInitScript(() => { const RealDate=Date; window.Date=class extends RealDate { constructor(...args){super(...(args.length?args:['2026-11-02T01:40:00Z']));} static now(){return RealDate.parse('2026-11-02T01:40:00Z');} }; });
    await morningAgain.goto(origin+'/');
    assert.equal(await morningAgain.locator('.eddy-global-overlay').count(),0);
    await morning.close(); await morningAgain.close();
    const rating=await context.newPage(); await rating.goto(origin+'/schedule-system.html');
    const send=(metric,value,date='2026-11-02')=>rating.evaluate(({metric,value,date})=>document.dispatchEvent(new CustomEvent('edmund:schedule-self-rating-selected',{detail:{studentId:'student-1',date,metric,rating:value}})),{metric,value,date});
    await send('motivation',1);
    await rating.locator('.eddy-self-rating-overlay img').waitFor();
    assert.match(await rating.locator('.eddy-self-rating-overlay img').getAttribute('src'),/low-motivation/);
    assert.ok(await rating.locator('.eddy-first-question-message').evaluate(n=>n.scrollHeight<=n.clientHeight+1),'low-motivation text fits');
    await rating.keyboard.press('Escape');
    await send('motivation',5,'2026-11-03');
    await rating.locator('.eddy-self-rating-overlay img').waitFor();
    assert.match(await rating.locator('.eddy-self-rating-overlay img').getAttribute('src'),/high-motivation/);
    assert.ok(await rating.locator('.eddy-first-question-message').evaluate(n=>n.scrollHeight<=n.clientHeight+1),'high-motivation text fits');
    await rating.keyboard.press('Escape');
    await send('motivation',3,'2026-11-04');
    assert.equal(await rating.locator('.eddy-self-rating-overlay').count(),0);
    await rating.close();
    const coin=await context.newPage(); await coin.goto(origin+'/coin');
    await coin.locator('#wallet').click();
    await coin.locator('.eddy-coin-wallet-overlay img').waitFor();
    assert.ok(await coin.locator('.eddy-global-copy').evaluate(n=>n.scrollHeight<=n.clientHeight+1),'coin text fits');
    assert.equal(await coin.locator('body').getAttribute('data-wallet-opened'),null);
    await coin.keyboard.press('Escape');
    assert.equal(await coin.locator('body').getAttribute('data-wallet-opened'),'true');
    await coin.close();
    const navCoin=await context.newPage(); await navCoin.goto(origin+'/nav-coin');
    await navCoin.locator('[data-edmund-coin-wallet]').click();
    await navCoin.locator('.eddy-coin-wallet-overlay img').waitFor();
    assert.equal(await navCoin.locator('[data-edmund-coin-dialog]').count(),0,'wallet waits for Eddy');
    await navCoin.keyboard.press('Escape');
    await navCoin.locator('[data-edmund-coin-dialog][open]').waitFor();
    await navCoin.close();
    console.log('Morning, motivation, and coin dialogue browser checks passed.');
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
