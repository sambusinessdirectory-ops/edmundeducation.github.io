import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.argv[2] || 'http://127.0.0.1:4174';
const outputDir = process.argv[3] || path.resolve('outputs/2013-b2-stage4-v1');
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
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.dataSteps?.length > 100);

const inventory = await page.evaluate(() => {
  const runtime = window.__EDMUND_2013_SUPER_CURATION__;
  return {
    version:runtime.version,
    ids:runtime.dataSteps.map(item => item.id),
    tasks:runtime.dataSteps.map(item => item.task),
    pages:runtime.dataSteps.map(item => item.page),
    bankCount:runtime.dataSteps.filter(item => item.bank).length,
    routeCount:runtime.dataSteps.filter(item => item.routeTarget).length,
    missing:runtime.missingTargets
  };
});
assert.equal(inventory.version, '2013-b2-stage4-v1');
assert.equal(inventory.ids.length, 134);
assert.equal(new Set(inventory.ids).size, inventory.ids.length);
assert.deepEqual([...new Set(inventory.pages)], [5,6,7,8,9,10,11]);
assert.ok(inventory.bankCount >= 45);
assert.ok(inventory.routeCount >= 5);
assert.deepEqual(inventory.missing, []);
assert.equal(await page.locator('#curation-stage [data-stage-id]:not([disabled])').count(), 4);
assert.equal(await page.locator('[data-stage-id="writing"]').isDisabled(), true);
assert.equal(await page.locator('.curation-podcast-player').isHidden(), true);
assert.equal(await page.locator('.curation-transcript-window').isHidden(), true);
assert.equal(await page.locator('#curation-evidence-bank').isVisible(), true);
assert.equal(await page.locator('#curation-step-count').textContent(), '1 / 134 步');
assert.equal(await page.locator('[data-stage-id="instructions"] .curation-stage-count').textContent(), '完成');
assert.equal(await page.locator('[data-stage-id="categorization"] .curation-stage-count').textContent(), '完成');
assert.equal(await page.locator('[data-stage-id="podcast"] .curation-stage-count').textContent(), '完成');
assert.equal(await page.locator('.curation-category-stamps .curation-fact-stamp').count(), 8);
assert.equal(await page.locator('.curation-note-stamps .curation-fact-stamp').count(), 2);
assert.equal(await page.locator('.curation-note-noise').count(), 3);
assert.equal(await page.locator('.curation-source-mark[data-step-id^="data-"]:not([data-step-id="data-p05-minutes-title"]).is-revealed').count(), 0);

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
assert.equal(await page.locator('textarea[data-note="3-1"]').inputValue(), '我的 Stage 3 筆記');
assert.equal(await page.locator('.curation-generated-notes li').count(), generatedBeforeStage4, 'Stage 4 reload must restore generated Stage 3 notes');
await page.screenshot({path:path.join(outputDir, '01-first-step.png'), fullPage:false});

await page.locator('#curation-spotlight').uncheck();
assert.equal(await page.locator('.curation-mask:not([hidden])').count(), 0);
await page.locator('#curation-spotlight').check();
await page.waitForTimeout(80);
assert.ok(await page.locator('.curation-mask:not([hidden])').count() > 0);

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
  if (index === 56) await page.screenshot({path:path.join(outputDir, '02-representative-middle-step.png'), fullPage:false});
  if (inventory.ids[index] === 'data-p07-title-route') await page.screenshot({path:path.join(outputDir, '03-source-reference-step.png'), fullPage:false});
  await page.locator('#curation-next').click();
}

let state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.dataStageComplete, true);
assert.equal(state.dataCompleted.length, 134);
assert.equal(state.reachedEvidenceIds.length, 134);
assert.equal(state.evidenceBankIds.length, inventory.bankCount);
assert.equal(await page.locator('#curation-next').isDisabled(), true);
assert.equal(await page.locator('[data-stage-id="data-file"] .curation-stage-count').textContent(), '完成');
await page.screenshot({path:path.join(outputDir, '04-final-step.png'), fullPage:false});

await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.getState().dataStageComplete === true);
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.dataCurrentStepId, inventory.ids.at(-1));
assert.equal(state.evidenceBankIds.length, inventory.bankCount);

for (let i = 0; i < 12; i += 1) await page.locator('#curation-prev').click();
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.dataCurrentStepId, inventory.ids[121]);
const backward = await snapshot(121);
assert.deepEqual(backward.future, []);
await page.reload({waitUntil:'networkidle'});
assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).dataCurrentStepId, inventory.ids[121]);

await page.locator('[data-bank-filter="A"]').click();
assert.ok(await page.locator('#curation-bank-list li.task-A').count() > 0);
assert.equal(await page.locator('#curation-bank-list li.task-B').count(), 0);
assert.equal(await page.locator('#curation-bank-list li.task-C').count(), 0);
await page.reload({waitUntil:'networkidle'});
assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).dataBankFilter, 'A');

await page.locator('[data-stage-id="instructions"]').click();
assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).activeStage, 'instructions');
await page.locator('[data-stage-id="data-file"]').click();
assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).dataCurrentStepId, inventory.ids[121]);

await page.goto(`${base}/paper3/2013-b2/?curation=1&stage=4&step=${inventory.ids[45]}`, {waitUntil:'networkidle'});
await page.waitForFunction(id => window.__EDMUND_2013_SUPER_CURATION__?.getState().dataCurrentStepId === id, inventory.ids[45]);
assert.equal(await page.locator('#curation-step-count').textContent(), '46 / 134 步');
assert.deepEqual(errors, []);

await browser.close();
console.log(JSON.stringify({ok:true, steps:inventory.ids.length, bank:inventory.bankCount, routes:inventory.routeCount, screenshots:4}, null, 2));
