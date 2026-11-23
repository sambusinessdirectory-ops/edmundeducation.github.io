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

// Direct Stage 3 access is free, but must not disclose untouched Stage 1/2 ink.
await page.goto(`${base}/paper3/2013-b2/?curation=1&stage=3`, {waitUntil:'networkidle'});
await page.evaluate(() => localStorage.clear());
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.categories?.length === 14);
assert.equal(await page.locator('.curation-source-mark.is-revealed').count(), 0, 'fresh Stage 3 must not reveal untouched Stage 1 marks');
assert.equal(await page.locator('.curation-category-stamps .curation-fact-stamp').count(), 0, 'fresh Stage 3 must not reveal untouched classifications');
assert.equal(await page.locator('.curation-note-stamps .curation-fact-stamp').count(), 0, 'fresh Stage 3 must not reveal untouched note stamps');
assert.equal(await page.locator('.curation-note-noise').count(), 0, 'fresh Stage 3 must not reveal untouched listening-only strikes');

// A partial Stage 2 visit carries only the completed classification into Stage 3.
await page.locator('[data-stage-id="categorization"]').click();
await page.locator('#curation-next').click();
await page.locator('[data-stage-id="podcast"]').click();
assert.deepEqual(await page.locator('.curation-category-stamps .curation-fact-stamp').allTextContents(), ['B']);
assert.equal(await page.locator('.curation-category-clue.is-revealed').count(), 1);
assert.equal(await page.locator('.curation-note-stamps .curation-fact-stamp').count(), 0);
assert.equal(await page.locator('.curation-note-noise').count(), 0);

// Complete Stages 1 and 2 through production controls, then enter Stage 3.
await page.evaluate(() => localStorage.clear());
await page.goto(`${base}/paper3/2013-b2/?curation=1&stage=1`, {waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.steps?.length === 52);
for (let index = 0; index < 52; index += 1) await page.locator('#curation-next').click();
await page.locator('[data-stage-id="categorization"]').click();
for (let index = 0; index < 14; index += 1) await page.locator('#curation-next').click();
let state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.stageComplete, true);
assert.equal(state.categoryStageComplete, true);
await page.locator('[data-stage-id="podcast"]').click();
await page.waitForTimeout(1500);
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.activeStage, 'podcast');
assert.equal(state.podcastCurrentStepId, 'podcast-orientation-travel-report');
assert.equal(await page.locator('.curation-player-play').textContent(), '▶', 're-entry must not autoplay');
assert.equal(await page.locator('[data-stage-id="categorization"]').evaluate(node => node.classList.contains('done')), true);
assert.equal(await page.locator('.curation-transcript-row').count(), 154);
assert.equal(await page.locator('.curation-transcript-row.is-locked').count(), 0, 'the complete transcript remains inspectable');

const cumulativeInk = await page.evaluate(() => ({
  hiddenStage1Marks:[...document.querySelectorAll('.curation-source-mark')]
    .filter(node => !node.classList.contains('is-revealed')).map(node => node.dataset.stepId),
  bossStamps:[...document.querySelectorAll('[data-curation-task].curation-task-revealed')]
    .map(node => node.dataset.curationTask),
  routeStamps:[...document.querySelectorAll('.curation-fact-stamps .curation-fact-stamp')]
    .map(node => node.textContent.trim()),
  categoryStamps:[...document.querySelectorAll('.curation-category-stamps .curation-fact-stamp')]
    .map(node => ({task:node.textContent.trim(), visible:getComputedStyle(node.parentElement).display !== 'none'})),
  noteStamps:[...document.querySelectorAll('.curation-note-stamps .curation-fact-stamp')]
    .map(node => ({task:node.textContent.trim(), visible:getComputedStyle(node.parentElement).display !== 'none'})),
  noteNoise:[...document.querySelectorAll('.curation-note-noise')].map(node => node.id),
  revealedCategoryClues:document.querySelectorAll('.curation-category-clue.is-revealed').length
}));
assert.deepEqual(cumulativeInk.hiddenStage1Marks, [], 'all completed Stage 1 annotations remain revealed');
assert.deepEqual(cumulativeInk.bossStamps.sort(), ['A','B','C']);
assert.deepEqual(cumulativeInk.routeStamps.sort(), ['A','A','B','C','C'], 'Stage 1 route stamps remain mounted');
assert.deepEqual(cumulativeInk.categoryStamps, [
  {task:'B', visible:true}, {task:'B', visible:true}, {task:'B', visible:true}, {task:'C', visible:true},
  {task:'C', visible:true}, {task:'A', visible:true}, {task:'C', visible:true}, {task:'A', visible:true}
]);
assert.deepEqual(cumulativeInk.noteStamps, [{task:'A', visible:true}, {task:'C', visible:true}]);
assert.deepEqual(cumulativeInk.noteNoise.sort(), [
  'note-2013-adrian-statistics', 'note-2013-unusual-hotels', 'note-2013-why-people-travel'
]);
assert.equal(cumulativeInk.revealedCategoryClues, 4);

// Reload keeps the cumulative Stage 1/2 document state while Stage 3 remains current.
await page.evaluate(() => history.replaceState(null, '', `${location.pathname}?curation=1&stage=3`));
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.getState().activeStage === 'podcast');
assert.equal(await page.locator('.curation-source-mark:not(.is-revealed)').count(), 0);
assert.equal(await page.locator('.curation-category-stamps .curation-fact-stamp').count(), 8);
assert.equal(await page.locator('.curation-note-stamps .curation-fact-stamp').count(), 2);
assert.equal(await page.locator('.curation-note-noise').count(), 3);

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
assert.ok(pausedAt >= cue1NearEnd - .05 && pausedAt < cue1NearEnd + .8, `paused at ${pausedAt}; expected ${cue1NearEnd}-${cue1NearEnd + .8}`);
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

// Forward seeking materialises every crossed cue; rewinding to before the
// fourth endpoint removes that cue and its downstream note/mark state.
await goCue(3);
await seek(cues[3].endpoint - 388.2 + 2);
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.generatedCueIds.includes(cues[3].id), true);
assert.equal(state.generatedCueIds.length, 4);
await seek(cues[3].replayStart - 388.2);
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.generatedCueIds.includes(cues[3].id), false);
assert.equal(state.generatedCueIds.length, 3);
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
  checks:['fresh-stage3-no-prior-answer-leak','partial-stage2-carry-forward','complete-stage1-stage2-cumulative-ink','cumulative-reload','full-transcript-visible','manual-pause-resume','repeated-replay','previous-during-playback','bidirectional-seek-reconciliation','first-middle-final-cue-reload','no-autoplay']
}, null, 2));
