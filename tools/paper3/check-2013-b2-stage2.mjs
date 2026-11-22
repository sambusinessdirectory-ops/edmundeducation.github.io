import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.argv[2] || 'http://127.0.0.1:4174';
const outputDir = process.argv[3] || path.resolve('outputs/2013-b2-stage2-v3');
fs.mkdirSync(outputDir, {recursive:true});
for (const name of fs.readdirSync(outputDir)) if (name.endsWith('.png')) fs.rmSync(path.join(outputDir, name));

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1600, height:1000}, deviceScaleFactor:1});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });

await page.goto(`${base}/paper3/2013-b2/?curation=1&release=stage2-v3`, {waitUntil:'networkidle'});
await page.evaluate(() => localStorage.clear());
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.categories?.length === 14);

const inventory = await page.evaluate(() => {
  const runtime = window.__EDMUND_2013_SUPER_CURATION__;
  return {
    version:runtime.version,
    stage1Ids:runtime.steps.map(item => item.id),
    categoryIds:runtime.categories.map(item => item.id),
    categoryKinds:runtime.categories.map(item => item.categoryKind),
    missing:runtime.missingTargets
  };
});
assert.equal(inventory.version, '2013-b2-stage3-v1');
assert.equal(inventory.stage1Ids.length, 52, 'approved Part 1 sequence must remain 52 steps');
assert.equal(new Set(inventory.stage1Ids).size, 52, 'Part 1 IDs must remain unique');
assert.equal(inventory.categoryIds.length, 14, 'Stage 2 must contain 8 documents, 1 note overview and 5 note headings');
assert.equal(new Set(inventory.categoryIds).size, 14, 'Stage 2 IDs must be stable and unique');
assert.deepEqual(inventory.categoryKinds, [
  'document','document','document','document','document','document','document','document',
  'note-overview','note','note','note','note','note'
]);
assert.deepEqual(inventory.missing, [], 'every Part 1 and Stage 2 target must resolve');

// Stage 2 and every stable step are directly accessible without completing
// Stage 1. Explicit URL navigation must override any saved active stage.
assert.equal(await page.locator('#curation-stage [data-stage-id]:not([disabled])').count(), 3);
assert.equal(await page.locator('[data-stage-id="categorization"]').isDisabled(), false);
assert.equal(await page.locator('[data-stage-id="podcast"]').isDisabled(), false);
await page.locator('[data-stage-id="categorization"]').click();
let state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.stageComplete, false);
assert.equal(state.activeStage, 'categorization');
assert.equal(state.categoryCurrentStepId, inventory.categoryIds[0]);
assert.equal(await page.locator('#curation-step-count').textContent(), '1 / 14 步');
await page.locator('[data-stage-id="instructions"]').click();
assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).activeStage, 'instructions');

await page.goto(`${base}/paper3/2013-b2/?curation=1&stage=2&step=${inventory.categoryIds[13]}`, {waitUntil:'networkidle'});
await page.waitForFunction(id => window.__EDMUND_2013_SUPER_CURATION__?.getState().categoryCurrentStepId === id, inventory.categoryIds[13]);
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.stageComplete, false);
assert.equal(state.activeStage, 'categorization');
assert.equal(await page.locator('#curation-step-count').textContent(), '14 / 14 步');

await page.goto(`${base}/paper3/2013-b2/?curation=1&stage=1&step=task-b-review-change`, {waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.getState().currentStepId === 'task-b-review-change');
assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).activeStage, 'instructions');

// Reset after the free-navigation audit, then run the complete learner path.
await page.evaluate(() => localStorage.clear());
await page.goto(`${base}/paper3/2013-b2/?curation=1&release=stage2-v3`, {waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.categories?.length === 14);

// Complete preserved Stage 1, then explicitly enter Stage 2.
for (let index = 0; index < inventory.stage1Ids.length; index += 1) {
  assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).currentStepId, inventory.stage1Ids[index]);
  await page.locator('#curation-next').click();
}
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.stageComplete, true);
assert.equal(state.activeStage, 'instructions');
await page.locator('#curation-next').click();
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__.getState().activeStage === 'categorization');

assert.equal(await page.locator('#curation-step-count').textContent(), '1 / 14 步');
assert.equal(await page.locator('[data-stage-id="podcast"]').isDisabled(), false);
assert.equal(await page.locator('#curation-uncertain').count(), 0, 'invented uncertainty control must not exist');
assert.equal(await page.locator('.curation-fact-stamp-uncertain').count(), 0, 'invented uncertainty stamp class must not exist');
assert.equal(await page.locator('.curation-fact-stamp').filter({hasText:'?'}).count(), 0, 'no square question-mark stamp may render');

const control = task => page.locator(`#curation-category-controls input[value="${task}"]`);

async function assertCategory(index) {
  const expected = inventory.categoryIds[index];
  await page.waitForFunction(id => window.__EDMUND_2013_SUPER_CURATION__.getState().categoryCurrentStepId === id, expected);
  await page.waitForFunction(() => {
    const rect = document.querySelector('.curation-category-target')?.getBoundingClientRect();
    return !!rect && rect.bottom > 106 && rect.top < innerHeight;
  });
  const snapshot = await page.evaluate(currentIndex => {
    const runtime = window.__EDMUND_2013_SUPER_CURATION__;
    const active = document.querySelector('.curation-category-target');
    const rect = active?.getBoundingClientRect();
    const futureLeaks = runtime.categories.slice(currentIndex + 1).filter(item => {
      if (item.categoryKind === 'document') {
        const heading = document.querySelector(item.stampTarget);
        return (heading?.closest('.curation-fact-heading')?.querySelector('.curation-category-stamps')?.children.length || 0) > 0;
      }
      if (item.categoryKind === 'note') {
        const heading = document.querySelector(item.target);
        const wrapper = heading?.closest('.curation-note-heading');
        return heading?.classList.contains('curation-note-noise') || (wrapper?.querySelector('.curation-note-stamps')?.children.length || 0) > 0;
      }
      return false;
    }).map(item => item.id);
    const futureClues = runtime.categories.slice(currentIndex + 1)
      .filter(item => item.cluePhrase && item.targetNode?.classList.contains('is-revealed')).map(item => item.id);
    return {
      id:runtime.getState().categoryCurrentStepId,
      active:!!active,
      activeText:active?.textContent.trim() || '',
      visible:!!rect && rect.bottom > 106 && rect.top < innerHeight,
      futureLeaks,
      futureClues,
      questionStamps:[...document.querySelectorAll('.curation-fact-stamp')].filter(node => node.textContent.trim() === '?').length
    };
  }, index);
  assert.equal(snapshot.id, expected);
  assert.equal(snapshot.active, true);
  assert.equal(snapshot.visible, true);
  assert.deepEqual(snapshot.futureLeaks, [], `future classification mark leaked at step ${index + 1}`);
  assert.deepEqual(snapshot.futureClues, [], `future decisive clue leaked at step ${index + 1}`);
  assert.equal(snapshot.questionStamps, 0);
  return snapshot;
}

await assertCategory(0);
assert.equal((await page.locator('.curation-category-target').textContent()).trim(), 'Queenie Lau', 'first document must stop on its first decisive clue');
assert.deepEqual(await page.locator('#page-5 .curation-category-stamps .curation-fact-stamp').allTextContents(), ['B']);
assert.equal(await page.locator('.curation-category-stamps .curation-fact-stamp').count(), 1, 'future document stamps stay absent');
assert.equal(await control('B').isChecked(), true);
assert.equal(await page.locator('#curation-completion-count').textContent(), '0 已完成');

// Stable selection, no-choice gate, spotlight and beginning reload.
await control('B').uncheck();
assert.equal(await page.locator('#curation-next').isDisabled(), true);
await control('B').check();
await page.locator('#curation-spotlight').uncheck();
assert.equal(await page.locator('.curation-mask:not([hidden])').count(), 0);
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(id => window.__EDMUND_2013_SUPER_CURATION__.getState().categoryCurrentStepId === id, inventory.categoryIds[0]);
assert.equal(await control('B').isChecked(), true);
await page.waitForTimeout(950);
await page.screenshot({path:path.join(outputDir, '01-first-decisive-clue.png')});

// Shared bookmark and stable-ID picker architecture.
await page.locator('#curation-bookmark').click();
assert.equal((await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState())).bookmarks.includes(inventory.categoryIds[0]), true);
await page.locator('#curation-bookmark').click();
await page.locator('#curation-step-jump').click();
assert.equal(await page.locator('#curation-picker-list .curation-picker-option').count(), 14);
await page.locator('#curation-picker-close').click();

// Documents 2–8: title-first or exact first-clue focus.
await page.locator('#curation-next').click();
await assertCategory(1);
assert.equal((await page.locator('.curation-category-target').textContent()).trim(), '2013 Writers’ Guidelines for Publication');
await page.waitForTimeout(950);
await page.screenshot({path:path.join(outputDir, '02-title-first-classification.png')});

await page.locator('#curation-next').click();
await assertCategory(2);
await page.locator('#curation-next').click();
await assertCategory(3);
assert.match((await page.locator('.curation-category-target').textContent()).trim(), /impact might be on local people/i);
await page.waitForTimeout(950);
await page.screenshot({path:path.join(outputDir, '03-content-clue-classification.png')});

await page.locator('#curation-next').click();
await assertCategory(4);
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(id => window.__EDMUND_2013_SUPER_CURATION__.getState().categoryCurrentStepId === id, inventory.categoryIds[4]);
assert.equal(await control('C').isChecked(), true, 'middle-step reload restores category choice');

await page.locator('#curation-next').click();
await assertCategory(5);
assert.match((await page.locator('.curation-category-target').textContent()).trim(), /Hong Kong Tourism: Past and Present/);
await page.locator('#curation-next').click();
await assertCategory(6);
assert.match((await page.locator('.curation-category-target').textContent()).trim(), /effects of tourism are increasingly negative/i);
await page.waitForTimeout(950);
await page.screenshot({path:path.join(outputDir, '04-second-document-on-page-10.png')});
await page.locator('#curation-next').click();
await assertCategory(7);
assert.match((await page.locator('.curation-category-target').textContent()).trim(), /American tourist.*1923/i);

// Note-sheet overview has no A/B/C choice and reveals no blanket A+C stamp.
await page.locator('#curation-next').click();
await assertCategory(8);
assert.equal(await page.locator('#curation-category-controls').isHidden(), true);
assert.equal(await page.locator('#page-3 .curation-note-stamps .curation-fact-stamp').count(), 0);

// Five authentic note headings: noise, A, noise, noise, C.
await page.locator('#curation-next').click();
await assertCategory(9);
assert.equal((await page.locator('#note-2013-why-people-travel').getAttribute('class')).includes('curation-note-noise'), true);
await page.waitForTimeout(950);
await page.screenshot({path:path.join(outputDir, '05-listening-only-heading.png')});

await page.locator('#curation-next').click();
await assertCategory(10);
assert.deepEqual(await page.locator('#note-2013-tourism-in-the-past').locator('xpath=..').locator('.curation-note-stamps .curation-fact-stamp').allTextContents(), ['A']);
await page.locator('#curation-next').click();
await assertCategory(11);
assert.equal((await page.locator('#note-2013-adrian-statistics').getAttribute('class')).includes('curation-note-noise'), true);
await page.locator('#curation-next').click();
await assertCategory(12);
assert.equal((await page.locator('#note-2013-unusual-hotels').getAttribute('class')).includes('curation-note-noise'), true);
await page.locator('#curation-next').click();
await assertCategory(13);
assert.deepEqual(await page.locator('#note-2013-effects-of-tourism').locator('xpath=..').locator('.curation-note-stamps .curation-fact-stamp').allTextContents(), ['C']);
assert.equal(await page.locator('#curation-category-controls').isHidden(), true);
await page.waitForTimeout(950);
await page.screenshot({path:path.join(outputDir, '06-final-note-heading.png')});

// Final reload, complete reverse traversal, then return and complete Stage 2.
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(id => window.__EDMUND_2013_SUPER_CURATION__.getState().categoryCurrentStepId === id, inventory.categoryIds[13]);
for (let index = 13; index > 0; index -= 1) {
  await page.locator('#curation-prev').click();
  await assertCategory(index - 1);
}
await page.evaluate(id => window.__EDMUND_2013_SUPER_CURATION__.goToId(id), inventory.categoryIds[13]);
await assertCategory(13);
await page.locator('#curation-next').click();
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.categoryStageComplete, true);
assert.equal(state.categoryCompleted.length, 14);
assert.equal((await page.locator('[data-stage-id="categorization"]').getAttribute('class')).includes('done'), true);
assert.equal(await page.locator('[data-stage-id="podcast"]').isDisabled(), false, 'Stage 3 remains freely accessible');
assert.equal(await page.locator('#curation-next').textContent(), 'Stage 2 已完成 ✓');

await page.locator('#curation-spotlight').check();
assert.equal(await page.locator('.curation-mask:not([hidden])').count(), 4);
await page.reload({waitUntil:'networkidle'});
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.categoryCurrentStepId, inventory.categoryIds[13]);
assert.equal(state.categoryStageComplete, true);

// V1 Stage 2 saves migrate by stable IDs. The removed uncertainty field is ignored,
// and the former whole-note-sheet step maps to the new overview without falsely
// completing the five new heading steps.
await page.evaluate(({stage1Ids, categoryIds}) => {
  const expected = [['B'],['B'],['B'],['C'],['C'],['A'],['C'],['A']];
  const selections = Object.fromEntries(categoryIds.slice(0, 8).map((id, index) => [id, {tasks:expected[index], uncertain:true}]));
  selections['2013-category-03-travel-report-notes'] = {tasks:['A','C'], uncertain:true};
  localStorage.setItem('edmund-paper3-2013-b2-super-curation-stage1-v1', JSON.stringify({
    version:'2013-b2-stage2-v1', activeSlot:'1', slots:{1:{
      schemaVersion:2, activeStage:'categorization', currentStepId:stage1Ids.at(-1), position:stage1Ids.length - 1,
      completed:stage1Ids, stageComplete:true,
      categoryCurrentStepId:'2013-category-03-travel-report-notes', categoryPosition:8,
      categoryCompleted:[...categoryIds.slice(0, 8), '2013-category-03-travel-report-notes'],
      categorySelections:selections, categoryStageComplete:true, bookmarks:['2013-category-03-travel-report-notes'],
      spotlight:false, open:true, updated:Date.now()
    }}
  }));
  location.reload();
}, {stage1Ids:inventory.stage1Ids, categoryIds:inventory.categoryIds});
await page.waitForFunction(() => window.__EDMUND_2013_SUPER_CURATION__?.getState().activeStage === 'categorization');
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.categoryCurrentStepId, '2013-category-03-note-sheet-overview');
assert.equal(state.categoryCompleted.length, 9);
assert.equal(state.categoryStageComplete, false);
assert.equal(Object.values(state.categorySelections).some(selection => Object.hasOwn(selection, 'uncertain')), false);
assert.deepEqual(state.bookmarks, ['2013-category-03-note-sheet-overview']);
assert.equal(await page.locator('.curation-fact-stamp').filter({hasText:'?'}).count(), 0);

// A v2 save that entered Stage 2 before recording Stage 1 completion must stay
// in Stage 2 after migration; completion and access are independent.
await page.evaluate(categoryId => {
  localStorage.setItem('edmund-paper3-2013-b2-super-curation-stage1-v1', JSON.stringify({
    version:'2013-b2-stage2-v2', activeSlot:'1', slots:{1:{
      schemaVersion:3, activeStage:'categorization', currentStepId:'context-writer-name', position:0,
      completed:[], stageComplete:false, categoryCurrentStepId:categoryId, categoryPosition:3,
      categoryCompleted:[], categorySelections:{}, categoryStageComplete:false,
      bookmarks:[], spotlight:true, open:true, updated:Date.now()
    }}
  }));
  location.reload();
}, inventory.categoryIds[3]);
await page.waitForFunction(id => window.__EDMUND_2013_SUPER_CURATION__?.getState().categoryCurrentStepId === id, inventory.categoryIds[3]);
state = await page.evaluate(() => window.__EDMUND_2013_SUPER_CURATION__.getState());
assert.equal(state.stageComplete, false);
assert.equal(state.activeStage, 'categorization');
assert.equal(await page.locator('[data-stage-id="categorization"]').isDisabled(), false);

assert.deepEqual(errors, [], `browser errors: ${errors.join('\n')}`);
await browser.close();
console.log(JSON.stringify({
  result:'PASS', stage1Steps:inventory.stage1Ids.length, stage2Steps:inventory.categoryIds.length,
  documents:8, noteOverview:1, noteHeadings:5,
  screenshots:fs.readdirSync(outputDir).filter(name => name.endsWith('.png')).sort()
}, null, 2));
