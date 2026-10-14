import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await readFile(path.join(root, 'irregular-verbs/data.json'), 'utf8'));
const pageHtml = await readFile(path.join(root, 'irregular-verb-system.html'), 'utf8');
assert.match(pageHtml, /irregular-verbs\/app\.mjs/);
assert.match(pageHtml, /irregular-verbs\/app\.css/);
const source = await readFile(path.join(root, 'irregular-verbs', data.source));
assert.equal(createHash('sha256').update(source).digest('hex'), data.source_sha256);
assert.equal(data.entries.length, 220);
assert.deepEqual(data.entries.map(entry => entry.id), Array.from({length:220}, (_, i) => i + 1));
assert.equal(data.entries.flatMap(entry => entry.sentences).length, 660);
assert.equal(data.entries.flatMap(entry => entry.sentences).reduce((count,sample)=>count+sample.answers.length,0),661);
for (const entry of data.entries) {
  assert.ok(entry.meaning && entry.forms.every(Boolean));
  assert.deepEqual(entry.sentences.map(sample => sample.form), [1,2,3]);
  for (const sample of entry.sentences) {
    assert.equal(sample.parts.length, sample.answers.length + 1);
    assert.ok(sample.chinese);
    assert.equal(sample.parts.reduce((sentence, part, i) => sentence + part + (sample.answers[i] || ''), ''), sample.english);
  }
  if (!process.argv.includes('--ui-only')) {
    for (const filename of [`v${String(entry.id).padStart(3,'0')}.mp3`, ...[1,2,3].map(form => `q${String(entry.id).padStart(3,'0')}-${form}.mp3`)]) {
      assert.ok((await stat(path.join(root,'irregular-verbs/audio',filename))).size > 1000, filename);
    }
  }
}
console.log('220 entries and 660 example sentences verified' + (process.argv.includes('--ui-only') ? '' : '; 880 British-male Kokoro audio clips verified'));
if (!process.argv.includes('--browser') && !process.argv.includes('--ui-only')) process.exit(0);

const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || path.join(process.env.HOME,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'));
const types = {'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.mp3':'audio/mpeg'};
const server = createServer(async (request, response) => {
  if (request.url === '/irregular-preview') {
    response.setHeader('Content-Type','text/html');
    response.end('<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/irregular-verbs/app.css"><section data-view="dashboard"></section><script>window.EDMUND_LEARNING_PORTAL_CONTEXT={getSession:()=>({user:{id:"test-student"}})}</script><script type="module" src="/irregular-verbs/app.mjs"></script></html>');
    return;
  }
  const filename = path.resolve(root, '.' + decodeURIComponent(new URL(request.url,'http://localhost').pathname));
  if (!filename.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  try { response.setHeader('Content-Type',types[path.extname(filename)] || 'application/octet-stream'); response.end(await readFile(filename)); }
  catch { response.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
let browser;
try {
  browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  const errors=[]; page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/irregular-preview`);
  await page.locator('.iv-table tbody tr').first().waitFor();
  if (process.argv.includes('--screenshots')) await page.screenshot({path:'/private/tmp/irregular-verbs-table.png',fullPage:false});
  assert.equal(await page.locator('.iv-table tbody tr').count(),220);
  assert.deepEqual(await page.locator('.iv-table thead th').allTextContents().then(x=>x.map(y=>y.trim())),['中文意思','V1 原形','V2 過去式','V3 過去分詞']);
  await page.locator('[data-view-tab="memory"]').click();
  for (const [mode,count] of [['v1',220],['v2',220],['v3',220],['v23',440],['all',660]]) {
    await page.locator(`[data-memory-mode="${mode}"]`).click();
    assert.equal(await page.locator('[data-memory]').count(),count,mode);
  }
  await page.locator('[data-memory-mode="all"]').click();
  await page.locator('[data-memory="1:0"]').fill('arise');
  await page.locator('[data-memory="1:1"]').fill('arose');
  await page.locator('[data-memory="1:2"]').fill('arisen');
  await page.locator('[data-check-row="1"]').click();
  assert.match(await page.locator('[data-row-result="1"]').textContent(),/正確/);
  await page.locator('[data-view-tab="examples"]').click();
  if (process.argv.includes('--screenshots')) await page.screenshot({path:'/private/tmp/irregular-verbs-examples.png',fullPage:false});
  assert.equal(await page.locator('.iv-question').count(),20);
  assert.equal(await page.locator('.iv-hint').count(),20);
  await page.locator('[data-example-mode="nohint"]').click();
  assert.equal(await page.locator('.iv-hint').count(),0);
  await page.locator('[data-toggle-chinese]').click();
  assert.equal(await page.locator('.iv-chinese:visible').count(),0);
  const keys=[];
  for (let index=0;index<33;index++) {
    keys.push(...await page.locator('.iv-question').evaluateAll(cards => cards.map(card=>card.dataset.question)));
    if (index<32) await page.locator('[data-page="next"]').click();
  }
  assert.equal(keys.length,660);
  assert.equal(new Set(keys).size,660);
  assert.ok(keys.every((key,index)=>!index || key.split(':')[0] !== keys[index-1].split(':')[0]));
  if (process.argv.includes('--screenshots')) {
    await page.locator('[data-view-tab="table"]').click();
    await page.setViewportSize({width:390,height:844});
    assert.equal(await page.locator('.iv-swipe-hint:visible').count(),1);
    await page.evaluate(() => window.scrollTo(0,0));
    await page.screenshot({path:'/private/tmp/irregular-verbs-mobile.png',fullPage:false});
  }
  assert.deepEqual(errors,[]);
  console.log('Four-column table, five memory modes, 660 shuffled questions, two hint modes, and Chinese toggle verified');
} finally { await browser?.close(); server.close(); }
