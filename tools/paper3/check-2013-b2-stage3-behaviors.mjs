import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.argv[2] || 'http://127.0.0.1:4174';
const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1800, height:1100}});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });

// Fresh Stage 3 entry immediately after completing Stage 2 through production UI.
await page.goto(`${base}/paper3/2013-b2/?curation=1&stage=2`, {waitUntil:'networkidle'});
await page.evaluate(() => localStorage.clear());
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.categories?.length === 14);
for (let index = 0; index < 14; index += 1) await page.locator('#curation-next').click();
let state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.categoryStageComplete, true);
await page.locator('[data-stage-id="podcast"]').click();
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.activeStage, 'podcast');
assert.equal(state.podcastCurrentStepId, 'podcast-orientation-travel-report');
assert.equal(await page.locator('.curation-player-play').textContent(), '▶', 're-entry must not autoplay');
assert.equal(await page.locator('[data-stage-id="categorization"]').evaluate(node => node.classList.contains('done')), true);

const cues = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.podcastCues.map(item => ({id:item.id, replayStart:item.replayStart, endpoint:item.endpoint})));
const goCue = async index => page.evaluate(id => window.__EDMUND_2013_SUPER_CURATION__.goToId(`podcast-cue-${id}`), cues[index].id);
const seek = async value => page.locator('.curation-player-seek').evaluate((node, next) => {
  node.value = String(next);
  node.dispatchEvent(new Event('input', {bubbles:true}));
}, value);

// Pause immediately before an answer, then Normal Play resumes at the same
// position and only unlocks the cue after the real endpoint is reached.
await goCue(0);
await page.locator('.curation-player-speed').selectOption('1');
const cue1NearEnd = cues[0].endpoint - 388.2 - 1.4;
await seek(cue1NearEnd);
await page.locator('.curation-player-play').click();
await page.waitForTimeout(240);
await page.locator('.curation-player-play').click();
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.heardCueIds.includes(cues[0].id), false);
const pausedAt = Number(await page.locator('.curation-player-seek').inputValue());
assert.ok(pausedAt >= cue1NearEnd && pausedAt < cue1NearEnd + .8);
await page.locator('.curation-player-play').click();
await page.waitForFunction(id => window.__EDMUND_2013_SUPER_CURATION__.getState().heardCueIds.includes(id), cues[0].id, {timeout:5000});
assert.equal(await page.locator('#curation-next').isDisabled(), false);

// Repeated Replay restarts the same completed cue without duplicate records.
await page.locator('.curation-player-replay').click();
await page.waitForTimeout(180);
await page.locator('.curation-player-replay').click();
await page.waitForFunction(() => document.querySelector('.curation-player-play')?.textContent === '❚❚');
await page.waitForFunction(() => document.querySelector('.curation-player-play')?.textContent === '▶', null, {timeout:15000});
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.heardCueIds.filter(id => id === cues[0].id).length, 1);
assert.equal(state.generatedCueIds.filter(id => id === cues[0].id).length, 1);

// Moving Previous while audio is running must stop playback, clear the pending
// cue boundary and leave the unrelated cue locked.
await goCue(2);
assert.equal(await page.locator('#curation-next').isDisabled(), true);
await page.locator('.curation-player-replay').click();
await page.waitForFunction(() => document.querySelector('.curation-player-play')?.textContent === '❚❚');
await page.waitForTimeout(180);
await page.locator('#curation-prev').click();
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.podcastCurrentStepId, `podcast-cue-${cues[1].id}`);
assert.equal(state.heardCueIds.includes(cues[2].id), false);
assert.equal(await page.locator('.curation-player-play').textContent(), '▶');

// Forward/back seeking to an unheard cue never generates its answer.
await goCue(3);
await seek(cues[3].endpoint - 388.2 + 2);
await seek(cues[3].replayStart - 388.2);
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.generatedCueIds.includes(cues[3].id), false);
assert.equal(await page.locator('#curation-next').isDisabled(), true);

// Stable-ID reload at the first, middle and final cue never autoplays.
for (const index of [0, 13, 27]) {
  await goCue(index);
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(id => window.__EDMUND_2013_SUPER_CURATION__?.getState().podcastCurrentStepId === `podcast-cue-${id}`, cues[index].id);
  assert.equal(await page.locator('.curation-player-play').textContent(), '▶');
}

assert.deepEqual(errors, []);
await browser.close();
console.log(JSON.stringify({
  status:'PASS',
  checks:['fresh-after-stage2','manual-pause-resume','repeated-replay','previous-during-playback','seek-both-directions','first-middle-final-cue-reload','no-autoplay']
}, null, 2));
