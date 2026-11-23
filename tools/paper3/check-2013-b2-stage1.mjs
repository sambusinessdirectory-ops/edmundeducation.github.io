import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {chromium} = require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base = process.argv[2] || 'http://127.0.0.1:4173';
const outputDir = process.argv[3] || path.resolve('tmp/2013-b2-stage1-screenshots');
fs.mkdirSync(outputDir, {recursive:true});

const browser = await chromium.launch({headless:true});
const context = await browser.newContext({viewport:{width:1600, height:1000}, deviceScaleFactor:1});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });

const url = `${base}/paper3/2013-b2/?curation=1`;
await page.goto(url, {waitUntil:'networkidle'});
await page.evaluate(() => localStorage.clear());
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_STAGE1__?.steps?.length > 0);

const steps = await page.evaluate(() => window.__EDMUND_2013_STAGE1__.steps.map(step => ({id:step.id, kind:step.kind})));
assert.equal(steps.length, 52, 'Stage 1 step count changed without updating the acceptance record');
assert.equal(new Set(steps.map(step => step.id)).size, steps.length, 'Step IDs must be unique');
assert.deepEqual(await page.evaluate(() => window.__EDMUND_2013_STAGE1__.missingTargets), [], 'Every step must resolve to its exact source or route target');
assert.equal(await page.locator('#curation-stage [data-stage-id]').count(), 5);
assert.equal(await page.locator('#curation-stage [data-stage-id]:not([disabled])').count(), 4, 'Stages 1-4 must be freely accessible');
assert.deepEqual(await page.locator('#curation-stage .curation-stage-label').allTextContents(), ['任務指示','資料分類','聆聽錄音','逐句取證','三篇寫作']);
const stageGeometry = await page.locator('#curation-stage').evaluate(node => {
  const rect = node.getBoundingClientRect();
  const style = getComputedStyle(node);
  const dotStyle = getComputedStyle(node.querySelector('.curation-stage-dot'));
  return {left:rect.left, right:rect.right, top:rect.top, height:rect.height, radius:style.borderRadius, background:style.backgroundColor, dotWidth:dotStyle.width, dotHeight:dotStyle.height};
});
assert.deepEqual(stageGeometry, {left:16, right:1584, top:68, height:88, radius:'16px', background:'rgb(255, 253, 248)', dotWidth:'35px', dotHeight:'35px'}, 'Stage bar must match the inset 2025 reference card geometry');
assert.equal(await page.locator('#curation-stage .curation-stage-item.active .curation-stage-dot').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(239, 191, 58)', 'Current stage dot should use the reference amber state');
assert.equal(await page.locator('#curation-step-count').textContent(), '1 / 52 步');
assert.equal(await page.locator('.curation-source-mark.is-revealed').count(), 1, 'Only the first annotation should be visible on entry');
assert.equal(await page.locator('.curation-fact-stamp').count(), 0, 'Fact File stamps must wait for their source-route steps');
assert.equal(await page.locator('.curation-source-target').getAttribute('data-curation-current'), 'neutral', 'The opening identity must not use the old yellow focus treatment');
await page.waitForTimeout(950);
await page.screenshot({path:path.join(outputDir, '2013-b2-stage1-first-step.png')});
await page.locator('#curation-stage').screenshot({path:path.join(outputDir, '2013-b2-stage1-progress-bar-active.png')});

assert.equal(await page.locator('.curation-mask:not([hidden])').count(), 4, 'Spotlight should start enabled');
await page.locator('#curation-spotlight').uncheck();
assert.equal(await page.locator('.curation-mask:not([hidden])').count(), 0, 'Spotlight should be disableable');
await page.locator('#curation-spotlight').check();

async function goTo(id) {
  await page.evaluate(stepId => window.__EDMUND_2013_STAGE1__.goToId(stepId), id);
  await page.waitForFunction(stepId => window.__EDMUND_2013_STAGE1__.getState().currentStepId === stepId, id);
  await page.waitForFunction(() => {
    const active = document.querySelector('.curation-source-target,.curation-route-target');
    const rect = active?.getBoundingClientRect();
    return !!rect && rect.bottom > 106 && rect.top < innerHeight;
  });
  const target = await page.evaluate(() => {
    const item = window.__EDMUND_2013_STAGE1__.steps.find(step => step.id === window.__EDMUND_2013_STAGE1__.getState().currentStepId);
    const active = document.querySelector('.curation-source-target,.curation-route-target');
    const rect = active?.getBoundingClientRect();
    return {kind:item.kind, activeId:active?.dataset.stepId || item.id, visible:!!rect && rect.bottom > 106 && rect.top < innerHeight};
  });
  assert.equal(target.activeId, id, `active target mismatch for ${id}`);
  assert.equal(target.visible, true, `active target should be in the desktop viewport for ${id}`);
}

// The 2025 visual grammar: A/cyan, B/yellow, C/pink, source cues/green,
// rejected or administrative language/red pen, and red route arrows.
await page.evaluate(() => {
  window.__stage1FocusBehaviors = [];
  const original = Element.prototype.scrollIntoView;
  Element.prototype.scrollIntoView = function(options) {
    window.__stage1FocusBehaviors.push(options?.behavior);
    return original.call(this, options);
  };
});
await goTo('task-a-topic-title');
assert.equal(await page.locator('#page-4 [data-curation-task].curation-task-revealed').count(), 1, 'Task A stamp should arrive with its opening instruction');
assert.equal(await page.locator('#page-4 [data-curation-task="A"].curation-task-revealed').count(), 1);
assert.equal(await page.locator('#page-4 [data-curation-task="A"]').evaluate(node => getComputedStyle(node, '::after').animationName), 'curation-task-stamp-arrive', 'Task stamp should use the reference arrival motion');
assert.equal(await page.locator('.curation-source-target').getAttribute('data-curation-current'), 'A');
assert.equal(await page.evaluate(() => window.__stage1FocusBehaviors.includes('smooth')), true, 'Normal step focus should animate smoothly');
await goTo('task-a-required-examples');
await page.waitForTimeout(450);
assert.equal(await page.locator('[data-step-id="task-a-topic-title"]').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(143, 228, 232)', 'Task A evidence must be cyan');
await goTo('task-a-source-mei');
assert.equal(await page.locator('.curation-source-target').getAttribute('data-curation-current'), 'hint', 'Source-direction phrases must use the green hint role');
await goTo('route-task-a-mei-interview');
await page.waitForTimeout(450);
assert.equal(await page.locator('[data-step-id="task-a-source-mei"]').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(185, 231, 170)', 'Reached source-direction phrases must be green');
assert.equal(await page.locator('#page-10 .curation-fact-heading').first().locator('.curation-fact-stamp-A').count(), 1, 'Mei Cheng Fact File should receive its square A stamp');
assert.equal(await page.locator('#page-10 .curation-fact-heading').nth(1).locator('.curation-fact-stamp').count(), 0, 'Kevin Hui must not receive a future C stamp');
assert.equal(await page.locator('#page-10 .curation-fact-stamp-A').evaluate(node => getComputedStyle(node).animationName), 'curation-fact-stamp-arrive', 'Fact File stamp should use the reference arrival motion');
await page.waitForTimeout(750);
await page.screenshot({path:path.join(outputDir, '2013-b2-stage1-fact-route-stamp-a.png')});
await goTo('route-task-a-podcast-notes');
assert.equal(await page.locator('#page-3 .curation-fact-stamp-A').count(), 1, 'Podcast notes should receive the square A stamp');
await goTo('task-b-submission-context');
assert.equal(await page.locator('#page-4 [data-curation-task].curation-task-revealed').count(), 2, 'Task B stamp should join Task A');
await goTo('task-b-review-change');
await page.waitForTimeout(450);
assert.equal(await page.locator('[data-step-id="task-b-submission-context"]').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(255, 228, 123)', 'Task B evidence must be yellow');
await goTo('task-b-actions-and-deadline');
const taskBPoints = page.locator('[data-step-id="task-b-actions-and-deadline"][data-point]');
assert.equal(await taskBPoints.count(), 2, 'Task B must show two numbered Boss-file requirements');
assert.deepEqual(await taskBPoints.evaluateAll(nodes => nodes.map(node => ({point:node.dataset.point, text:node.textContent}))), [
  {point:'1', text:'tell her what’s needed'},
  {point:'2', text:'remind her about the deadline for submission'}
]);
assert.equal(await taskBPoints.first().evaluate(node => getComputedStyle(node, '::before').content), '"1"');
assert.equal(await taskBPoints.nth(1).evaluate(node => getComputedStyle(node, '::before').content), '"2"');
await page.waitForTimeout(750);
await page.screenshot({path:path.join(outputDir, '2013-b2-stage1-task-b-numbered-requirements.png')});
await goTo('route-task-b-editorial-notes');
assert.equal(await page.locator('#page-7 .curation-fact-stamp-B').count(), 1, 'Editorial notes should receive the square B stamp');
await page.waitForTimeout(750);
await page.screenshot({path:path.join(outputDir, '2013-b2-stage1-fact-route-stamp-b.png')});
await goTo('task-c-purpose-positive-effects');
assert.equal(await page.locator('#page-4 [data-curation-task].curation-task-revealed').count(), 3, 'All A/B/C stamps should be visible after Task C begins');
await goTo('task-c-source-kevin-start');
await page.waitForTimeout(450);
assert.equal(await page.locator('[data-step-id="task-c-purpose-positive-effects"]').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(245, 177, 191)', 'Task C evidence must be pink');
await goTo('task-c-purpose-positive-effects');
await page.waitForTimeout(950);
await page.screenshot({path:path.join(outputDir, '2013-b2-stage1-boss-email-abc-stamps.png')});
await page.evaluate(() => {
  for (const node of document.querySelectorAll('#curation-stage,#curation-dock,.curation-mask')) node.style.visibility = 'hidden';
});
await page.locator('#page-4 .email-window').screenshot({path:path.join(outputDir, '2013-b2-stage1-boss-email-all-stamps-source.png')});
await page.evaluate(() => {
  for (const node of document.querySelectorAll('#curation-stage,#curation-dock,.curation-mask')) node.style.removeProperty('visibility');
});
await goTo('admin-reading-time');
assert.equal(await page.locator('.curation-source-target.is-excluded').count(), 1, 'Administrative wording must receive the red pen treatment');
assert.equal(await page.locator('.curation-source-target.is-excluded').evaluate(node => getComputedStyle(node).backgroundSize.split(' ')[0]), '100%');

await goTo('task-b-review-change');
await page.waitForTimeout(950);
await page.screenshot({path:path.join(outputDir, '2013-b2-stage1-middle-step.png')});
await goTo('route-task-c-kevin-letter');
assert.equal(await page.locator('.curation-route-target').count(), 1);
assert.equal(await page.locator('.curation-route-callout:not([hidden])').count(), 1);
assert.equal(await page.locator('.curation-route-arrow.is-drawing').count(), 1, 'Route pen should draw in');
assert.equal(await page.locator('.curation-route-path').evaluate(node => getComputedStyle(node).stroke), 'rgb(208, 40, 45)', 'Route arrow must be red, not yellow');
assert.equal(await page.locator('.curation-route-callout').evaluate(node => getComputedStyle(node).borderTopColor), 'rgb(208, 40, 45)', 'Route callout must use the same red ink');
assert.equal(await page.locator('#page-10 .curation-fact-heading').nth(1).locator('.curation-fact-stamp-C').count(), 1, 'Kevin Hui Fact File should receive its square C stamp');
assert.equal(await page.locator('#page-10 .curation-fact-heading').first().locator('.curation-fact-stamp-A').count(), 1, 'The earlier Mei Cheng A stamp should persist');
await page.waitForTimeout(950);
await page.screenshot({path:path.join(outputDir, '2013-b2-stage1-source-route.png')});
await goTo('route-task-c-podcast-notes');
assert.equal(await page.locator('#page-3 .curation-fact-stamp').count(), 2, 'Shared podcast notes should carry both A and C stamps');
assert.deepEqual(await page.locator('#page-3 .curation-fact-stamp').allTextContents(), ['A','C']);
await page.waitForTimeout(750);
await page.screenshot({path:path.join(outputDir, '2013-b2-stage1-fact-route-stamps-ac.png')});

// Forward learner path: use the visible Next button through every step.
await page.evaluate(() => window.__EDMUND_2013_STAGE1__.reset());
for (let index = 0; index < steps.length; index += 1) {
  const state = await page.evaluate(() => window.__EDMUND_2013_STAGE1__.getState());
  assert.equal(state.currentStepId, steps[index].id, `forward step ${index + 1}`);
  const futureReveal = await page.evaluate(currentIndex => {
    const runtime = window.__EDMUND_2013_STAGE1__;
    const indexes = new Map(runtime.steps.map((step, index) => [step.id, index]));
    return [...document.querySelectorAll('.curation-source-mark.is-revealed')]
      .some(mark => indexes.get(mark.dataset.stepId) > currentIndex);
  }, index);
  assert.equal(futureReveal, false, `future annotation leaked at step ${index + 1}`);
  const futureStamp = await page.evaluate(currentIndex => [...document.querySelectorAll('#page-4 [data-curation-stamp-step].curation-task-revealed')]
    .some(node => window.__EDMUND_2013_STAGE1__.steps.find(step => step.id === node.dataset.curationStampStep).index > currentIndex), index);
  assert.equal(futureStamp, false, `future task stamp leaked at step ${index + 1}`);
  const futureFactStamp = await page.evaluate(currentIndex => [...document.querySelectorAll('[data-curation-route-step]')]
    .some(node => window.__EDMUND_2013_STAGE1__.steps.find(step => step.id === node.dataset.curationRouteStep).index > currentIndex), index);
  assert.equal(futureFactStamp, false, `future Fact File stamp leaked at step ${index + 1}`);
  if (index < steps.length - 1) await page.locator('#curation-next').click();
}
assert.equal(await page.locator('.curation-route-arrow').isVisible(), false, 'A route arrow must not leak into the final instruction step');
await page.waitForTimeout(950);
await page.locator('.curation-source-target').evaluate(node => node.scrollIntoView({block:'center', inline:'nearest', behavior:'instant'}));
await page.waitForTimeout(550);
await page.screenshot({path:path.join(outputDir, '2013-b2-stage1-final-step.png')});
await page.locator('#curation-next').click();
let finalState = await page.evaluate(() => window.__EDMUND_2013_STAGE1__.getState());
assert.equal(finalState.stageComplete, true);
assert.equal(finalState.completed.length, 52);
assert.equal(await page.locator('#curation-next').textContent(), '進入 Stage 2 →');
assert.equal(await page.locator('#curation-stage [data-stage-id]:not([disabled])').count(), 4, 'Stages 1-4 remain accessible while Stage 5 stays locked');
assert.equal(await page.locator('#curation-stage .curation-stage-item.done .curation-stage-dot').textContent(), '✓');
assert.equal(await page.locator('#curation-stage .curation-stage-item.done .curation-stage-count').textContent(), '完成');
await page.waitForTimeout(400);
assert.equal(await page.locator('#curation-stage .curation-stage-item.done .curation-stage-dot').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(40, 122, 112)', 'Completed stage dot should settle to the reference green state');
await page.locator('#curation-stage').screenshot({path:path.join(outputDir, '2013-b2-stage1-progress-bar-complete.png')});

// Reverse learner path: each Back action must hide all later annotations.
for (let index = steps.length - 1; index > 0; index -= 1) {
  await page.locator('#curation-prev').click();
  const state = await page.evaluate(() => window.__EDMUND_2013_STAGE1__.getState());
  assert.equal(state.currentStepId, steps[index - 1].id, `reverse step ${index}`);
  const futureReveal = await page.evaluate(currentIndex => {
    const runtime = window.__EDMUND_2013_STAGE1__;
    const indexes = new Map(runtime.steps.map((step, index) => [step.id, index]));
    return [...document.querySelectorAll('.curation-source-mark.is-revealed')]
      .some(mark => indexes.get(mark.dataset.stepId) > currentIndex);
  }, index - 1);
  assert.equal(futureReveal, false, `future annotation remained after Back at ${index}`);
  const futureStamp = await page.evaluate(currentIndex => [...document.querySelectorAll('#page-4 [data-curation-stamp-step].curation-task-revealed')]
    .some(node => window.__EDMUND_2013_STAGE1__.steps.find(step => step.id === node.dataset.curationStampStep).index > currentIndex), index - 1);
  assert.equal(futureStamp, false, `future task stamp remained after Back at ${index}`);
  const futureFactStamp = await page.evaluate(currentIndex => [...document.querySelectorAll('[data-curation-route-step]')]
    .some(node => window.__EDMUND_2013_STAGE1__.steps.find(step => step.id === node.dataset.curationRouteStep).index > currentIndex), index - 1);
  assert.equal(futureFactStamp, false, `future Fact File stamp remained after Back at ${index}`);
}

// Reload from beginning, middle and final, using stable IDs instead of indexes.
await page.evaluate(() => { localStorage.clear(); location.reload(); });
await page.waitForFunction(() => window.__EDMUND_2013_STAGE1__?.getState().currentStepId === 'context-writer-name');
await goTo('task-b-review-change');
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_STAGE1__?.getState().currentStepId === 'task-b-review-change');
await goTo('qab-task-c-word-count');
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_STAGE1__?.getState().currentStepId === 'qab-task-c-word-count');

// Spotlight preference survives reload without affecting the current step.
await page.locator('#curation-spotlight').uncheck();
await page.reload({waitUntil:'networkidle'});
await page.waitForFunction(() => window.__EDMUND_2013_STAGE1__?.getState().currentStepId === 'qab-task-c-word-count');
assert.equal(await page.locator('#curation-spotlight').isChecked(), false);
assert.equal(await page.locator('.curation-mask:not([hidden])').count(), 0);

// The untouched 2025 lesson still mounts its own controller.
const referencePage = await context.newPage();
const referenceErrors = [];
referencePage.on('pageerror', error => referenceErrors.push(error.message));
await referencePage.goto(`${base}/paper3/2025-b2/`, {waitUntil:'networkidle'});
await referencePage.waitForSelector('#curation-toggle');
assert.equal(referenceErrors.length, 0, `2025 smoke errors: ${referenceErrors.join('; ')}`);
await referencePage.close();

assert.equal(errors.length, 0, `2013 browser errors: ${errors.join('; ')}`);
await browser.close();
console.log(JSON.stringify({
  status:'pass',
  steps:steps.length,
  forward:steps.length,
  reverse:steps.length,
  reloads:['beginning','middle','final'],
  spotlight:['enabled','disabled','disabled-after-reload'],
  visualGrammar:['A-cyan','B-yellow','C-pink','source-green','excluded-red','route-red'],
  motion:['smooth-focus','stamp-arrival','fact-stamp-arrival','route-draw'],
  screenshots:fs.readdirSync(outputDir).sort(),
  reference2025:'mounted-without-page-errors'
}, null, 2));
