import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.argv[2] || 'http://127.0.0.1:4174';
const rates = [0.75, 1, 1.25, 1.5, 2];
const browser = await chromium.launch({headless:true});
const results = [];

for (const rate of rates) {
  const context = await browser.newContext({viewport:{width:1600, height:1000}});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(`${base}/paper3/2013-b2/?curation=1&stage=3&matrix=${rate}`, {waitUntil:'networkidle'});
  await page.evaluate(() => localStorage.clear());
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.podcastCues?.length === 28);
  const cues = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.podcastCues.map(item => ({
    id:item.id,
    replayStart:item.replayStart,
    endpoint:item.endpoint
  })));
  await page.locator('.curation-player-speed').selectOption(String(rate));

  for (const [index, cue] of cues.entries()) {
    await page.evaluate(id => window.__EDMUND_2013_SUPER_CURATION__.goToId(`podcast-cue-${id}`), cue.id);
    await page.locator('.curation-player-replay').click();
    const timeout = Math.ceil(((cue.endpoint - cue.replayStart) / rate) * 1000 + 12000);
    await page.waitForFunction(id => window.__EDMUND_2013_SUPER_CURATION__.getState().heardCueIds.includes(id), cue.id, {timeout});
    const snapshot = await page.evaluate(id => {
      const state = window.__EDMUND_2013_SUPER_CURATION__.getState();
      return {
        heard:state.heardCueIds.filter(value => value === id).length,
        generated:state.generatedCueIds.filter(value => value === id).length,
        playing:document.querySelector('.curation-player-play')?.textContent,
        time:Number(document.querySelector('.curation-player-seek')?.value)
      };
    }, cue.id);
    assert.equal(snapshot.heard, 1, `${cue.id} heard count at ${rate}x`);
    assert.equal(snapshot.generated, 1, `${cue.id} generated count at ${rate}x`);
    assert.equal(snapshot.playing, '▶', `${cue.id} must pause at ${rate}x`);
    assert.ok(Math.abs(snapshot.time - (cue.endpoint - 388.2)) < .12, `${cue.id} endpoint drift at ${rate}x`);
    if ((index + 1) % 7 === 0) console.log(`rate ${rate}x: ${index + 1}/28 cues passed`);
  }

  const state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
  assert.equal(state.heardCueIds.length, 28);
  assert.equal(state.generatedCueIds.length, 28);
  assert.deepEqual(errors, [], `console errors at ${rate}x: ${errors.join('; ')}`);
  results.push({rate, cues:28, status:'PASS'});
  await context.close();
}

await browser.close();
console.log(JSON.stringify({status:'PASS', matrix:results, totalCueRuns:rates.length * 28}, null, 2));
