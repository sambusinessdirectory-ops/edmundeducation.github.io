import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.argv[2] || 'http://127.0.0.1:4174';
const outputDir = process.argv[3] || path.resolve('outputs/2013-b2-stage4-v3-v4-source-rebuilt');
fs.mkdirSync(outputDir, {recursive:true});

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1800, height:1100}, deviceScaleFactor:1});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });

await page.goto(`${base}/paper3/2013-b2/?curation=1&stage=4`, {waitUntil:'networkidle'});
await page.evaluate(() => localStorage.clear());
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.dataSteps?.length === 207);

const inventory = await page.evaluate(() => {
  const runtime = window.__EDMUND_2013_SUPER_CURATION__;
  const comparable = value => String(value).replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
  return {
    version:runtime.version,
    ids:runtime.dataSteps.map(item => item.id),
    tasks:runtime.dataSteps.map(item => item.task),
    pages:runtime.dataSteps.map(item => item.page),
    bankCount:runtime.dataSteps.filter(item => item.bank).length,
    routeCount:runtime.dataSteps.filter(item => item.routeTarget).length,
    authoredComplete:runtime.dataSteps.every(item => item.excerpt && item.chinese && item.type && item.decision && Object.values(item.analysis || {}).length === 4 && Object.values(item.analysis || {}).every(Boolean)),
    authoredLabelsComplete:runtime.dataSteps.every(item => Object.values(item.analysisLabels || {}).length === 4 && Object.values(item.analysisLabels || {}).every(Boolean)),
    authoredBlockHashesComplete:runtime.dataSteps.every(item => /^[a-f0-9]{64}$/.test(item.authoredBlockSha256 || '')),
    exactTextTargetMismatches:runtime.dataSteps.filter(item => !item.focusSelector && (item.target?.tagName !== 'MARK' || comparable(item.target.textContent) !== comparable(item.sourcePhrase))).map(item => ({id:item.id, phrase:item.sourcePhrase, target:item.target?.textContent || '', tag:item.target?.tagName || ''})),
    explicitClauseTargetMismatches:runtime.dataSteps.filter(item => ['#source-p11-edgar-identity','#source-p11-edgar-year'].includes(item.focusSelector) && comparable(item.target?.textContent) !== comparable(item.sourcePhrase)).map(item => ({id:item.id, phrase:item.sourcePhrase, target:item.target?.textContent || ''})),
    pageCounts:Object.fromEntries([5,6,7,8,9,10,11].map(sourcePage => [sourcePage, runtime.dataSteps.filter(item => item.page === sourcePage).length])),
    analysisSource:window.EDMUND_2013_B2_DATA_FILE.analysisSource,
    sourceLines:runtime.dataSteps.map(item => item.sourceLine),
    missing:runtime.missingTargets
  };
});
assert.equal(inventory.version, '2013-b2-stage4-v3-v4-source-rebuilt');
assert.equal(inventory.ids.length, 207);
assert.equal(new Set(inventory.ids).size, inventory.ids.length);
assert.deepEqual([...new Set(inventory.pages)], [5,6,7,8,9,10,11]);
assert.deepEqual(inventory.pageCounts, {5:24,6:17,7:21,8:35,9:43,10:38,11:29});
assert.equal(inventory.bankCount, 62);
assert.equal(inventory.routeCount, 6);
assert.equal(inventory.authoredComplete, true);
assert.equal(inventory.authoredLabelsComplete, true);
assert.equal(inventory.authoredBlockHashesComplete, true);
assert.deepEqual(inventory.exactTextTargetMismatches, []);
assert.deepEqual(inventory.explicitClauseTargetMismatches, []);
assert.equal(inventory.analysisSource.sha256, '7d928ea01e6ef825e4cb8f37db084ba9edf1613f72bcbf1118705b4196d0c9d4');
assert.equal(inventory.analysisSource.includedFactFileUnits, 207);
assert.deepEqual(inventory.analysisSource.pageUnitCounts, {5:24,6:17,7:21,8:35,9:43,10:38,11:29});
assert.ok(inventory.sourceLines.every(line => line >= 1463 && line <= 4587));
assert.deepEqual(inventory.missing, []);
assert.equal(await page.locator('#curation-stage [data-stage-id]:not([disabled])').count(), 4);
assert.equal(await page.locator('[data-stage-id="writing"]').isDisabled(), true);
assert.equal(await page.locator('.curation-podcast-player').isHidden(), true);
assert.equal(await page.locator('.curation-transcript-window').isHidden(), true);
assert.equal(await page.locator('#curation-evidence-bank').isVisible(), true);
assert.equal(await page.locator('#curation-dock #curation-evidence-bank').count(), 0);
assert.equal(await page.locator('#curation-step-count').textContent(), '1 / 207 步');
assert.equal(await page.locator('.curation-authored-analysis .curation-analysis-field').count(), 8);
assert.ok((await page.locator('.curation-authored-analysis').innerText()).includes('為甚麼採用這個作答決定'));
const geometry = await page.evaluate(() => {
  const dock = document.querySelector('#curation-dock').getBoundingClientRect();
  const bank = document.querySelector('#curation-evidence-bank').getBoundingClientRect();
  return {dockRight:dock.right, bankLeft:bank.left, bankRight:bank.right, viewport:innerWidth};
});
assert.ok(geometry.bankLeft > geometry.dockRight);
assert.ok(geometry.bankRight <= geometry.viewport);
assert.equal(await page.locator('[data-stage-id="instructions"] .curation-stage-count').textContent(), '完成');
assert.equal(await page.locator('[data-stage-id="categorization"] .curation-stage-count').textContent(), '完成');
assert.equal(await page.locator('[data-stage-id="podcast"] .curation-stage-count').textContent(), '完成');
assert.equal(await page.locator('.curation-category-stamps .curation-fact-stamp').count(), 8);
assert.equal(await page.locator('.curation-note-stamps .curation-fact-stamp').count(), 2);
assert.equal(await page.locator('.curation-note-noise').count(), 3);
assert.equal(await page.locator('.curation-source-mark[data-step-id^="data-"].is-revealed').count(), 1);
assert.equal(await page.locator(`.curation-source-mark[data-step-id="${inventory.ids[0]}"]`).isVisible(), true);

// Stage 4 must inherit the authentic Stage 3 note sheet. Prove both note
// layers: learner-authored text from native reader storage and generated cue
// notes from the versioned Super Curation state, including a full reload.
await page.locator('[data-stage-id="podcast"]').click();
await page.locator('textarea[data-note="3-1"]').fill('我的 Stage 3 筆記');
await page.locator('.curation-player-seek').evaluate(input => {
  input.value = '100';
  input.dispatchEvent(new Event('input', {bubbles:true}));
});
const generatedBeforeStage4 = await page.locator('.curation-generated-notes li').count();
assert.ok(generatedBeforeStage4 > 0, 'Stage 3 seek should generate reached podcast notes');
await page.waitForTimeout(260);
await page.locator('[data-stage-id="data-file"]').click();
assert.equal(await page.locator('textarea[data-note="3-1"]').inputValue(), '我的 Stage 3 筆記');
assert.equal(await page.locator('.curation-generated-notes li').count(), generatedBeforeStage4, 'Stage 4 must preserve generated Stage 3 notes');
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.getState().activeStage === 'data-file');
await page.waitForTimeout(120);
assert.equal(await page.locator('textarea[data-note="3-1"]').inputValue(), '我的 Stage 3 筆記');
assert.equal(await page.locator('.curation-generated-notes li').count(), generatedBeforeStage4, 'Stage 4 reload must restore generated Stage 3 notes');
await page.locator('#curation-spotlight').uncheck();
assert.equal(await page.locator('.curation-mask:not([hidden])').count(), 0);
await page.screenshot({path:path.join(outputDir, '01-first-step.png'), fullPage:false});
await page.locator('#curation-spotlight').check();
await page.waitForTimeout(80);
assert.ok(await page.locator('.curation-mask:not([hidden])').count() > 0);
await page.locator('#curation-spotlight').uncheck();
assert.equal(await page.locator('.curation-mask:not([hidden])').count(), 0);

const snapshot = async index => page.evaluate(currentIndex => {
  const runtime = window.__EDMUND_2013_SUPER_CURATION__;
  return {
    id:runtime.getState().dataCurrentStepId,
    future:runtime.dataSteps.slice(currentIndex + 1).filter(item => item.target?.classList.contains('is-revealed')).map(item => item.id),
    current:document.querySelectorAll('.curation-source-target').length,
    bankIds:runtime.getState().evidenceBankIds
  };
}, index);

for (let index = 0; index < inventory.ids.length; index += 1) {
  const state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
  assert.equal(state.dataCurrentStepId, inventory.ids[index]);
  const view = await snapshot(index);
  assert.deepEqual(view.future, [], `future Stage 4 ink leaked at ${index + 1}`);
  assert.ok(view.current >= 1);
  if (index === 103) await page.screenshot({path:path.join(outputDir, '02-representative-middle-step.png'), fullPage:false});
  if (inventory.sourceLines[index] === 2259) await page.screenshot({path:path.join(outputDir, '03-source-reference-step.png'), fullPage:false});
  await page.locator('#curation-next').click();
}

let state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.dataStageComplete, true);
assert.equal(state.dataCompleted.length, 207);
assert.equal(state.reachedEvidenceIds.length, 207);
assert.equal(state.evidenceBankIds.length, inventory.bankCount);
assert.equal(await page.locator('#curation-next').isDisabled(), true);
assert.equal(await page.locator('[data-stage-id="data-file"] .curation-stage-count').textContent(), '完成');
await page.screenshot({path:path.join(outputDir, '04-final-step.png'), fullPage:false});

await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.getState().dataStageComplete === true);
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.dataCurrentStepId, inventory.ids.at(-1));
assert.equal(state.evidenceBankIds.length, inventory.bankCount);

// Traverse every step in reverse as well. Each backward move must restore the
// exact stable ID and remove every annotation belonging to a later step.
for (let index = inventory.ids.length - 2; index >= 0; index -= 1) {
  await page.locator('#curation-prev').click();
  state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
  assert.equal(state.dataCurrentStepId, inventory.ids[index]);
  const backward = await snapshot(index);
  assert.deepEqual(backward.future, [], `future Stage 4 ink leaked while reversing to ${index + 1}`);
}
assert.equal(await page.locator('#curation-prev').isDisabled(), true);
await page.reload({waitUntil:'networkidle'});
assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).dataCurrentStepId, inventory.ids[0]);

await page.locator('[data-bank-filter="A"]').click();
assert.ok(await page.locator('#curation-bank-list li.task-A').count() > 0);
assert.equal(await page.locator('#curation-bank-list li.task-B').count(), 0);
assert.equal(await page.locator('#curation-bank-list li.task-C').count(), 0);
await page.reload({waitUntil:'networkidle'});
assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).dataBankFilter, 'A');

await page.locator('[data-stage-id="instructions"]').click();
assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).activeStage, 'instructions');
await page.locator('[data-stage-id="data-file"]').click();
assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).dataCurrentStepId, inventory.ids[0]);

await page.goto(`${base}/paper3/2013-b2/?curation=1&stage=4&step=${inventory.ids[100]}`, {waitUntil:'networkidle'});
await page.waitForFunction(id => window.__EDMUND_2013_SUPER_CURATION__?.getState().dataCurrentStepId === id, inventory.ids[100]);
assert.equal(await page.locator('#curation-step-count').textContent(), '101 / 207 步');
assert.deepEqual(errors, []);

await browser.close();
console.log(JSON.stringify({ok:true, steps:inventory.ids.length, bank:inventory.bankCount, routes:inventory.routeCount, screenshots:4}, null, 2));
