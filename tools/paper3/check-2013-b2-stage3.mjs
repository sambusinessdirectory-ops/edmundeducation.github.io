import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.argv[2] || 'http://127.0.0.1:4174';
const outputDir = process.argv[3] || path.resolve('outputs/2013-b2-stage3-v2');
fs.mkdirSync(outputDir, {recursive:true});
for (const name of fs.readdirSync(outputDir)) if (name.endsWith('.png')) fs.rmSync(path.join(outputDir, name));

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1800, height:1100}, deviceScaleFactor:1});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });

const url = `${base}/paper3/2013-b2/?curation=1&stage=3&release=stage3-v2`;
await page.goto(url, {waitUntil:'networkidle'});
await page.evaluate(() => localStorage.clear());
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.podcastSteps?.length === 185);

const inventory = await page.evaluate(() => {
  const runtime = window.__EDMUND_2013_SUPER_CURATION__;
  return {
    version:runtime.version,
    ids:runtime.podcastSteps.map(item => item.id),
    kinds:runtime.podcastSteps.map(item => item.kind),
    cueIds:runtime.podcastCues.map(item => item.id),
    cueRanges:runtime.podcastCues.map(item => ({id:item.id, number:item.number, replayStart:item.replayStart, endpoint:item.endpoint})),
    missing:runtime.missingTargets
  };
});
assert.equal(inventory.version, '2013-b2-stage3-v2');
assert.equal(inventory.ids.length, 185);
assert.equal(new Set(inventory.ids).size, 185, 'Stage 3 stable IDs must be unique');
assert.equal(inventory.cueIds.length, 28);
assert.equal(inventory.kinds.filter(kind => kind === 'podcast-review').length, 154);
assert.deepEqual(inventory.missing, []);

// Three stages are freely accessible, while Stage 4-5 remain genuinely locked.
assert.equal(await page.locator('#curation-stage [data-stage-id]:not([disabled])').count(), 3);
assert.deepEqual(await page.locator('#curation-stage [data-stage-id]').evaluateAll(nodes => nodes.map(node => node.disabled)), [false,false,false,true,true]);
assert.deepEqual(await page.locator('#curation-stage [data-stage-id]').evaluateAll(nodes => nodes.map(node => node.classList.contains('done'))), [false,false,false,false,false]);
assert.equal(await page.locator('#curation-step-count').textContent(), '1 / 185 步');
assert.equal(await page.locator('#curation-podcast-player').count(), 1);
assert.equal(await page.locator('#curation-transcript-window').count(), 1);
assert.equal(await page.locator('.curation-transcript-translation').isDisabled(), false);
assert.equal(await page.locator('.curation-transcript-row').count(), 154);
assert.equal(await page.locator('.curation-transcript-row.is-locked').count(), 0);
assert.equal(await page.locator('.curation-transcript-row.is-point').count(), 39);
assert.equal(await page.locator('.curation-transcript-row.is-nonpoint').count(), 115);
assert.equal(await page.locator('.curation-transcript-copy').count(), 154);
assert.equal(await page.locator('.curation-transcript-translation-copy').count(), 154);
assert.equal(await page.locator('.curation-transcript-translation-copy:visible').count(), 0);
await page.screenshot({path:path.join(outputDir, '01-first-step-spotlight-on.png')});

// The optional Chinese layer is complete, does not replace English, and its
// persisted state survives a reload.
await page.locator('.curation-transcript-translation').click();
assert.equal(await page.locator('.curation-transcript-translation').getAttribute('aria-pressed'), 'true');
assert.equal(await page.locator('.curation-transcript-translation-copy:visible').count(), 154);
assert.equal(await page.locator('.curation-transcript-copy:visible').count(), 154);
assert.equal(await page.locator('.curation-transcript-translation-copy').first().textContent(), '錄音即將開始。');
await page.screenshot({path:path.join(outputDir, '02-chinese-line-by-line.png')});
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.podcastSteps?.length === 185);
assert.equal(await page.locator('.curation-transcript-translation-copy:visible').count(), 154);
await page.locator('.curation-transcript-translation').click();

// Forward seeking deterministically reveals every crossed cue and transcript
// mark; rewinding removes all downstream generated state again.
await page.locator('.curation-player-seek').evaluate((node, value) => {
  node.value = String(value);
  node.dispatchEvent(new Event('input', {bubbles:true}));
}, 420);
let state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.heardCueIds.length, 18);
assert.equal(state.generatedCueIds.length, 18);
assert.ok(await page.locator('.curation-generated-notes li').count() > 0);
assert.ok(await page.locator('.curation-transcript-row.is-reviewed.is-nonpoint').count() > 0);
await page.screenshot({path:path.join(outputDir, '03-forward-seek-reveals-notes-and-strikes.png')});

// The learner's notes survive generated-note activity and reloads.
await page.locator('textarea[data-note="3-1"]').fill('MY OWN NOTE — keep this text');
await page.locator('.curation-player-speed').selectOption('2');
await page.locator('.curation-player-seek').evaluate(node => {
  node.value = '0';
  node.dispatchEvent(new Event('input', {bubbles:true}));
});
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.deepEqual(state.heardCueIds, []);
assert.deepEqual(state.generatedCueIds, []);
assert.equal(await page.locator('.curation-generated-notes li').count(), 0);
assert.equal(await page.locator('.curation-transcript-row.is-reviewed').count(), 0);
await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.goToId('podcast-orientation-travel-report'));

async function waitForCue(id, timeout = 22000) {
  await page.waitForFunction(cueId => window.__EDMUND_2013_SUPER_CURATION__.getState().heardCueIds.includes(cueId), id, {timeout});
  assert.equal(await page.locator('.curation-player-play').textContent(), '▶');
  const snapshot = await page.evaluate(cueId => {
    const state = window.__EDMUND_2013_SUPER_CURATION__.getState();
    return {
      heard:state.heardCueIds.filter(id => id === cueId).length,
      generated:state.generatedCueIds.filter(id => id === cueId).length,
      current:state.podcastCurrentStepId
    };
  }, id);
  assert.deepEqual(snapshot, {heard:1, generated:1, current:`podcast-cue-${id}`});
}

// Complete the orientation through the production Next control; it starts cue 1.
await page.locator('#curation-next').click();
await page.waitForFunction(() => document.querySelector('.curation-player-play')?.textContent === '❚❚');
await page.locator('.curation-player-play').click();
await page.screenshot({path:path.join(outputDir, '04-active-cue-before-playback.png')});
await page.locator('.curation-player-replay').click();
await waitForCue(inventory.cueIds[0]);
assert.equal(await page.locator('textarea[data-note="3-1"]').inputValue(), 'MY OWN NOTE — keep this text');
assert.equal(await page.locator('#generated-notes-3-1 li').count(), 2);
await page.screenshot({path:path.join(outputDir, '05-generated-note-automatic-pause.png')});

const screenshotAtCue = new Map([
  [4, '06-task-a-evidence.png'],
  [13, '07-middle-qualification.png'],
  [16, '08-correction-cue.png'],
  [21, '09-task-c-evidence.png'],
  [23, '10-spotlight-off.png']
]);

// Real-audio pass: every replay interval reaches its declared endpoint through
// the production controls. At 2x this still uses the authentic remote MP3.
for (let index = 1; index < inventory.cueIds.length; index += 1) {
  await page.locator('#curation-next').click();
  await page.waitForFunction(() => document.querySelector('.curation-player-play')?.textContent === '❚❚');
  await page.locator('.curation-player-replay').click();
  await waitForCue(inventory.cueIds[index], 30000);
  if (index === 23) {
    await page.locator('#curation-spotlight').uncheck();
    assert.equal(await page.locator('.curation-mask:not([hidden])').count(), 0);
  }
  const name = screenshotAtCue.get(index);
  if (name) await page.screenshot({path:path.join(outputDir, name)});
}

state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.heardCueIds.length, 28);
assert.equal(state.generatedCueIds.length, 28);
assert.equal(new Set(state.heardCueIds).size, 28, 'each cue is recorded exactly once');
assert.equal(await page.locator('textarea[data-note="3-1"]').inputValue(), 'MY OWN NOTE — keep this text');

// All supported rates operate through the same boundary guard. A short cue is
// replayed at each rate; the generated record remains deduplicated.
await page.evaluate(id => window.__EDMUND_2013_SUPER_CURATION__.goToId(id), `podcast-cue-${inventory.cueIds[17]}`);
for (const rate of ['0.75','1','1.25','1.5','2']) {
  await page.locator('.curation-player-speed').selectOption(rate);
  await page.locator('.curation-player-replay').click();
  await page.waitForFunction(() => document.querySelector('.curation-player-play')?.textContent === '❚❚');
  await page.waitForFunction(() => document.querySelector('.curation-player-play')?.textContent === '▶', null, {timeout:8000});
  assert.equal(await page.locator('.curation-player-speed').inputValue(), rate);
}
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.generatedCueIds.filter(id => id === inventory.cueIds[17]).length, 1);

// Normal Play continues from the slider; the seek also maps the controller to
// the next unreached cue, whose explicit Replay starts at its own replay point.
await page.locator('.curation-player-seek').evaluate(node => {
  node.value = '250';
  node.dispatchEvent(new Event('input', {bubbles:true}));
});
await page.locator('.curation-player-play').click();
await page.waitForTimeout(180);
let playPosition = Number(await page.locator('.curation-player-seek').inputValue());
assert.ok(playPosition >= 249.9, `normal play must continue near 250s, got ${playPosition}`);
await page.locator('.curation-player-play').click();
await page.locator('.curation-player-replay').click();
await page.waitForTimeout(180);
playPosition = Number(await page.locator('.curation-player-seek').inputValue());
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
const mappedCueId = state.podcastCurrentStepId.replace('podcast-cue-', '');
const mappedCue = inventory.cueRanges.find(item => item.id === mappedCueId);
const expectedReplay = mappedCue.replayStart - 388.2;
assert.ok(playPosition >= expectedReplay && playPosition < expectedReplay + 1.5, `replay must reset near ${expectedReplay}, got ${playPosition}`);
await page.locator('.curation-player-play').click();

// Transcript follow can be relinquished by real user scrolling and restored.
await page.locator('.curation-transcript-window-body').hover();
await page.mouse.wheel(0, 500);
await page.waitForFunction(() => document.querySelector('.curation-transcript-follow')?.getAttribute('aria-pressed') === 'false');
await page.locator('.curation-transcript-follow').click();
assert.equal(await page.locator('.curation-transcript-follow').getAttribute('aria-pressed'), 'true');

// The transcript window is both movable and resizable on the wide desktop.
const beforeMove = await page.locator('#curation-transcript-window').boundingBox();
const head = await page.locator('.curation-transcript-window-head').boundingBox();
await page.mouse.move(head.x + 12, head.y + 15);
await page.mouse.down();
await page.mouse.move(head.x - 70, head.y + 35, {steps:4});
await page.mouse.up();
const afterMove = await page.locator('#curation-transcript-window').boundingBox();
assert.notEqual(Math.round(afterMove.x), Math.round(beforeMove.x));
const corner = await page.locator('.curation-resize-se').boundingBox();
await page.mouse.move(corner.x + 5, corner.y + 5);
await page.mouse.down();
await page.mouse.move(corner.x - 40, corner.y - 35, {steps:4});
await page.mouse.up();
const afterResize = await page.locator('#curation-transcript-window').boundingBox();
assert.ok(afterResize.width < afterMove.width && afterResize.height < afterMove.height);
await page.locator('.curation-transcript-fit').click();

// Enter review, inspect every transcript row in order, and verify explicit
// review navigation scrolls the requested line into the floating window.
await page.locator('.curation-player-seek').evaluate((node, value) => {
  node.value = String(value);
  node.dispatchEvent(new Event('input', {bubbles:true}));
}, 591.82);
await page.evaluate(id => window.__EDMUND_2013_SUPER_CURATION__.goToId(id), `podcast-cue-${inventory.cueIds.at(-1)}`);
await page.locator('#curation-next').click();
assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).podcastCurrentStepId, 'podcast-transcript-review-intro');
assert.equal(await page.locator('.curation-transcript-row.is-reviewed').count(), 154);
await page.locator('#curation-next').click();
assert.equal(await page.locator('.curation-transcript-row.is-current-review').count(), 1);
await page.waitForTimeout(950);
const currentReviewVisible = await page.locator('.curation-transcript-row.is-current-review').evaluate((node) => {
  const row = node.getBoundingClientRect();
  const body = node.closest('.curation-transcript-window-body').getBoundingClientRect();
  return row.top >= body.top && row.bottom <= body.bottom;
});
assert.equal(currentReviewVisible, true);
await page.screenshot({path:path.join(outputDir, '11-transcript-review.png')});

// Finish 154 review rows and the final step with production Next navigation.
while ((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).podcastCurrentStepId !== 'podcast-stage-complete') {
  await page.locator('#curation-next').click();
}
await page.locator('#curation-next').click();
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.podcastStageComplete, true);
assert.equal(state.podcastCompleted.length, 185);
assert.equal(state.transcriptReviewCompleted.length, 154);
assert.equal(await page.locator('[data-stage-id="podcast"]').evaluate(node => node.classList.contains('done')), true);
assert.deepEqual(await page.locator('#curation-stage [data-stage-id]').evaluateAll(nodes => nodes.map(node => node.disabled)), [false,false,false,true,true]);
await page.waitForTimeout(950);
await page.screenshot({path:path.join(outputDir, '12-final-stage-complete.png')});

// A completed final state is stable across reload before any deliberate rewind.
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.getState().podcastCurrentStepId === 'podcast-stage-complete');
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.podcastStageComplete, true);
assert.equal(await page.locator('#curation-step-count').textContent(), '185 / 185 步');
assert.equal(await page.locator('.curation-mask:not([hidden])').count(), 0, 'spotlight-off choice must survive reload');

// Full reverse traversal must preserve the current step and hide annotations
// generated by later cues even though the saved heard/generated ledger remains.
for (let index = 184; index > 0; index -= 1) {
  assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).podcastCurrentStepId, inventory.ids[index]);
  await page.locator('#curation-prev').click();
}
assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).podcastCurrentStepId, inventory.ids[0]);
assert.equal(await page.locator('.curation-generated-notes li').count(), 0, 'back at orientation, future generated notes must be hidden');

await page.evaluate(id => window.__EDMUND_2013_SUPER_CURATION__.goToId(id), `podcast-cue-${inventory.cueIds[0]}`);
assert.equal(await page.locator('#generated-notes-3-1 li').count(), 2);
assert.equal(await page.locator('#generated-notes-3-2 li').count(), 0, 'later note fields stay hidden on backward navigation');

// Reload restoration at beginning, middle and final; middle also restores
// bounded currentTime and the learner-authored note.
await page.evaluate(id => window.__EDMUND_2013_SUPER_CURATION__.goToId(id), inventory.ids[0]);
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(id => window.__EDMUND_2013_SUPER_CURATION__?.getState().podcastCurrentStepId === id, inventory.ids[0]);

await page.evaluate(id => window.__EDMUND_2013_SUPER_CURATION__.goToId(id), `podcast-cue-${inventory.cueIds[16]}`);
await page.locator('.curation-player-seek').evaluate(node => {
  node.value = '333.25';
  node.dispatchEvent(new Event('input', {bubbles:true}));
});
const mappedMiddleId = (await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).podcastCurrentStepId;
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(id => window.__EDMUND_2013_SUPER_CURATION__?.getState().podcastCurrentStepId === id, mappedMiddleId);
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.ok(Math.abs(state.podcastCurrentTime - 333.25) < .15);
assert.equal(await page.locator('textarea[data-note="3-1"]').inputValue(), 'MY OWN NOTE — keep this text');

// Rewinding after completion correctly invalidates downstream review/final
// completion; a direct final-step reload keeps the stable ID without reviving it.
await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.goToId('podcast-stage-complete'));
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.getState().podcastCurrentStepId === 'podcast-stage-complete');
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.podcastStageComplete, false);
assert.equal(await page.locator('#curation-step-count').textContent(), '185 / 185 步');

// Closing and reopening creates no duplicate chrome.
await page.locator('#curation-close').click();
assert.equal(await page.locator('#curation-podcast-player').isHidden(), true);
await page.locator('#curation-toggle').click();
assert.equal(await page.locator('#curation-podcast-player').count(), 1);
assert.equal(await page.locator('#curation-transcript-window').count(), 1);
assert.deepEqual(errors, [], `browser errors: ${errors.join('\n')}`);

await browser.close();
console.log(JSON.stringify({
  ok:true,
  steps:inventory.ids.length,
  cues:inventory.cueIds.length,
  transcriptReviews:inventory.kinds.filter(kind => kind === 'podcast-review').length,
  screenshots:fs.readdirSync(outputDir).filter(name => name.endsWith('.png')).sort(),
  outputDir
}, null, 2));
