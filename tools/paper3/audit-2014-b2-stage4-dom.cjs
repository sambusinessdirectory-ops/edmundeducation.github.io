const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {chromium} = require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const origin = process.env.CURATION_ORIGIN || 'http://127.0.0.1:8815';
const root = path.resolve(__dirname, '../..');
const source = fs.readFileSync(path.join(root, 'paper3/2014-b2/super-curation-stage4-data.js'), 'utf8');
const sandbox = {window:{}};
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const data = sandbox.window.EDMUND_2014_B2_CURATION_STAGE4;

const canonical = value => String(value)
  .normalize('NFKC')
  .replace(/(?<=\p{L})[123](?=\s)/gu, '')
  .replace(/[’‘]/g, "'")
  .replace(/[¹²³]/g, '')
  .replace(/[–—−]/g, '-')
  .toLocaleLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, ' ')
  .trim()
  .replace(/\s+/g, ' ');
(async () => {
  assert.equal(data.inventory.length, 11);
  assert.equal(data.records.length, 174);
  assert.deepEqual(JSON.parse(JSON.stringify(data.counts.types)), {1:17, 2:22, 3:47, 4:51, 5:12, 6:25});
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1600, height:1000}});
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  try {
    await page.goto(`${origin}/paper3/2014-b2/index.html`, {waitUntil:'networkidle'});
    const sourceText = {};
    for (const item of data.inventory) {
      const locator = page.locator(item.selector);
      assert.equal(await locator.count(), 1, `${item.id}: source selector must identify one native document`);
      sourceText[item.id] = canonical(await locator.evaluate(root => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const text = [];
        let node;
        while ((node = walker.nextNode())) {
          if (node.parentElement.closest('.translation')) continue;
          text.push(node.textContent);
        }
        return text.join(' ');
      }));
    }
    const misses = [];
    for (const record of data.records) {
      const target = page.locator(record.targetSelector);
      if (await target.count() !== 1) {
        misses.push({id:record.id, sourceId:record.sourceId, excerpt:record.excerpt, reason:'target-selector', selector:record.targetSelector});
        continue;
      }
      if (record.targetKind === 'visual' || record.targetKind === 'scan-only') continue;
      const targetText = canonical(await target.evaluate(root => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        const text = [];
        let node;
        while ((node = walker.nextNode())) {
          if (node.parentElement.closest('.translation')) continue;
          text.push(node.textContent);
        }
        return text.join(' ');
      }));
      const segments = record.matchSegments.map(canonical);
      const haystack = record.targetSelector === record.sourceSelector ? sourceText[record.sourceId] : targetText;
      const matched = segments.filter(segment => haystack.includes(segment));
      if (!segments.length || matched.length !== segments.length) {
        misses.push({id:record.id, sourceId:record.sourceId, excerpt:record.excerpt, segments, matched});
      }
    }
    const report = {
      version:data.version,
      sourceHash:data.sourceHash,
      sources:data.inventory.length,
      records:data.records.length,
      textRecords:data.records.filter(record => record.targetKind === 'text').length,
      visualRecords:data.records.filter(record => record.targetKind === 'visual').length,
      textRecordsWithAtLeastOneNativeMatch:data.records.filter(record => record.targetKind === 'text').length - misses.length,
      misses,
      pageErrors
    };
    const output = path.join(root, 'outputs/2014-b2-part4');
    fs.mkdirSync(output, {recursive:true});
    fs.writeFileSync(path.join(output, 'stage4-dom-target-audit.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    assert.equal(pageErrors.length, 0, 'native reader emitted page errors');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
