const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium} = require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = path.resolve(__dirname, '..');
const outputDir = "/Volumes/(Pro-G) Sam's Data/CodexData/workspaces/2026-11-15/you-are-implementing-a-2014-dse/outputs/2014-b2-part2";
fs.mkdirSync(outputDir, {recursive: true});
const contentTypes = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://127.0.0.1').pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filename = path.resolve(root, relative);
  if (!filename.startsWith(root) || !fs.existsSync(filename) || fs.statSync(filename).isDirectory()) {
    response.writeHead(404); response.end('Not found'); return;
  }
  response.writeHead(200, {'content-type': contentTypes[path.extname(filename)] || 'application/octet-stream'});
  fs.createReadStream(filename).pipe(response);
});

(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({viewport: {width: 1600, height: 1000}});
  const page = await context.newPage();
  const consoleFailures = [];
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) consoleFailures.push(`${message.type()}: ${message.text()}`); });
  page.on('pageerror', error => consoleFailures.push(`pageerror: ${error.message}`));

  await page.goto(`${origin}/paper3/2014-b2/index.html?curation=1`, {waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.EDMUND_2014_B2_CURATION_DEBUG?.stage2Version);
  assert.equal(await page.locator('.curation-stage-item').count(), 5);
  assert.equal(await page.locator('.curation-stage-item[data-stage="instruction"]').isEnabled(), true);
  assert.equal(await page.locator('.curation-stage-item[data-stage="categorize"]').isEnabled(), true);
  assert.equal(await page.locator('.curation-stage-item[data-stage="podcast"]').isEnabled(), true, 'Stage 3 is now released while Stage 2 remains freely available');
  assert.equal(await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.targetAudit.length), 0, 'all authored selectors and phrases must resolve');

  await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p1-stage-complete'));
  await page.locator('#page-4 .email-window').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const highlightRatio = await page.evaluate(() => {
    const highlighted = [...document.querySelectorAll('#page-4 .curation-mark.is-revealed')].reduce((sum, mark) => sum + mark.textContent.trim().length, 0);
    const source = [...document.querySelectorAll('#page-4 .email-content p[lang="en"], #page-4 .email-content li')].reduce((sum, node) => sum + node.textContent.trim().length, 0);
    return highlighted / source;
  });
  assert.ok(highlightRatio < 0.58, `persistent highlight coverage must remain selective (ratio=${highlightRatio.toFixed(3)})`);
  assert.equal(await page.locator('#page-4 .curation-mark').filter({hasText: 'We’re updating our website and we’ve decided'}).count(), 0, 'connective wording must not be highlighted as one block');
  await page.locator('#curation-spotlight').uncheck();
  await page.screenshot({path: path.join(outputDir, '01-stage1-sparse-highlights.png'), fullPage: false});

  await page.locator('.curation-stage-item[data-stage="categorize"]').click();
  await page.waitForFunction(() => window.EDMUND_2014_B2_CURATION_DEBUG.getState().currentStage === 'categorize');
  assert.match(await page.locator('#curation-title').innerText(), /Stage 2 開始/);
  assert.equal(await page.locator('#curation-step-jump option').count(), 20, 'all document and finer podcast-heading steps must be freely available');

  await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p2-p03-pet-club-notes'));
  await page.locator('#page-3 .conference-notes > h2').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  assert.equal(await page.locator('.curation-content').evaluate(node => node.scrollTop), 0, 'each newly selected step must open its tutor card at the top');
  assert.equal(await page.locator('.curation-category-choices input[value="A"]').isChecked(), true);
  assert.equal(await page.locator('.curation-category-choices input[value="B"]').isChecked(), false);
  assert.equal(await page.locator('.curation-category-choices input[value="C"]').isChecked(), true);
  assert.match(await page.locator('#curation-document-type').innerText(), /錄音筆記頁/);
  assert.deepEqual(await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.getState().categories['p2-p03-pet-club-notes']), ['A', 'C']);
  assert.equal(await page.locator('#page-3 .curation-file-stamp-A').count(), 1);
  assert.equal(await page.locator('#page-3 .curation-file-stamp-C').count(), 1, 'multitask classification uses separate badges');
  assert.equal(await page.locator('#curation-subheading-list .curation-subheading-row').count(), 6, 'dock must preview all six podcast sub-headings');
  assert.equal(await page.locator('#curation-subheading-list .curation-subheading-tag').count(), 0, 'the parent document step must not reveal all six decisions at once');
  assert.equal(await page.locator('#page-3 .curation-subheading-tags:visible').count(), 0, 'finer labels begin only when their own steps are visited');
  await page.screenshot({path: path.join(outputDir, '02-stage2-listening-sheet.png'), fullPage: false});
  await page.locator('.curation-category-choices input[value="?"]').check();
  assert.deepEqual(await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.getState().categories['p2-p03-pet-club-notes']), ['?']);
  assert.equal(await page.locator('#page-3 .curation-file-stamp').count(), 0, 'uncertain classification must not leave a misleading task stamp');
  await page.locator('.curation-category-choices input[value="A"]').check();
  await page.locator('.curation-category-choices input[value="C"]').check();

  await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p2-p03-definition'));
  assert.equal(await page.locator('#page-3 .curation-subheading-tags:visible').count(), 1, 'the first finer heading must reveal independently');
  assert.equal(await page.locator('#page-3 .notes-form-body > h3:nth-of-type(1) .curation-subheading-tag-listening').innerText(), '聆聽筆記');
  assert.equal(await page.locator('#page-3 .notes-form-body > h3:nth-of-type(1)').evaluate(node => node.classList.contains('curation-subheading-listening')), true);

  await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p2-p03-email-2'));
  assert.equal(await page.locator('#page-3 .curation-subheading-tags:visible').count(), 5, 'labels must reveal cumulatively through the selected finer heading');
  assert.equal(await page.locator('#page-3 .notes-form-body > h3:nth-of-type(5) .curation-subheading-tag-A').innerText(), 'Task A');
  assert.equal(await page.locator('#page-3 .curation-subheading-tag-listening:visible').count(), 4, 'Definition, Reasons, Examples and Email 1 must remain listening-note routes rather than writing-task routes');
  assert.equal(await page.locator('#page-3 .curation-subheading-tag-C:visible').count(), 0, 'the later Advice route must remain unrevealed at Email 2');
  assert.match(await page.locator('#curation-title').innerText(), /Email 2/);
  await page.locator('#page-3 .notes-form-body > h3:nth-of-type(5)').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await page.screenshot({path: path.join(outputDir, '02b-stage2-podcast-email-routes.png'), fullPage: false});

  await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p2-p03-advice'));
  assert.equal(await page.locator('#page-3 .curation-subheading-tags:visible').count(), 6, 'all six printed sub-headings must receive labels by the final finer-heading step');
  assert.equal(await page.locator('#page-3 .notes-form-body > h3:nth-of-type(6) .curation-subheading-tag-C').innerText(), 'Task C');
  assert.equal(await page.locator('#page-3 .curation-subheading-tag-B').count(), 0, 'no podcast sub-heading belongs to Task B');
  assert.equal(await page.locator('#curation-subheading-panel').isVisible(), false, 'finer-heading steps use their own decision card rather than the document checkbox panel');
  assert.equal(await page.locator('.curation-subheading-decision .curation-subheading-tag-C').innerText(), 'Task C');
  await page.locator('#page-3 .notes-form-body > h3:nth-of-type(6)').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await page.screenshot({path: path.join(outputDir, '02c-stage2-podcast-final-routes.png'), fullPage: false});

  await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p2-p05-veterinary-course-ad'));
  assert.equal(await page.locator('.curation-category-choices input[value="A"]').isChecked(), true);
  await page.locator('.curation-category-choices input[value="C"]').check();
  assert.equal(await page.locator('#page-5 .exotic-course-gamer > h2:first-of-type .curation-file-stamp-A').count(), 1);
  assert.equal(await page.locator('#page-5 .exotic-course-gamer > h2:first-of-type .curation-file-stamp-C').count(), 1);
  await page.locator('#curation-revision-toggle').click();
  assert.equal(await page.locator('#curation-revision').isVisible(), true);
  assert.match(await page.locator('#curation-revision-guidance').innerText(), /Stage 4/);
  await page.locator('#curation-bookmark').click();
  const savedBeforeReload = await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.getState());
  assert.deepEqual(savedBeforeReload.categories['p2-p05-veterinary-course-ad'], ['A', 'C']);
  await page.reload({waitUntil: 'networkidle'});
  await page.waitForFunction(() => window.EDMUND_2014_B2_CURATION_DEBUG?.stage2Version);
  const restored = await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.getState());
  assert.equal(restored.currentStage, 'categorize');
  assert.equal(restored.stepId, 'p2-p05-veterinary-course-ad');
  assert.deepEqual(restored.categories['p2-p05-veterinary-course-ad'], ['A', 'C']);
  assert.ok(restored.bookmarks.includes('p2-p05-veterinary-course-ad'));
  await page.locator('.curation-category-choices input[value="C"]').uncheck();

  await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p2-stage-complete'));
  assert.equal(await page.locator('#curation-next').isEnabled(), true, 'free jump to completion must not be blocked');
  await page.locator('#page-11 .exotic-thanks > h2').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await page.screenshot({path: path.join(outputDir, '03-stage2-completion-review.png'), fullPage: false});
  await page.locator('#curation-next').click();
  assert.equal(await page.locator('#curation-next').isEnabled(), true, 'entering Stage 3 must preserve free navigation');
  assert.ok((await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.getState().completedStages)).includes('categorize'));
  assert.equal(await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.getState().currentStage), 'podcast');
  assert.equal(await page.locator('.curation-stage-item[data-stage="podcast"]').isEnabled(), true);

  await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p2-stage-intro'));
  assert.equal(await page.locator('#page-4 .exotic-email-chart > h2:nth-of-type(2) .curation-file-stamp').count(), 0, 'rewind must hide future category stamps');
  assert.equal(await page.locator('#page-3 .curation-subheading-tags:visible').count(), 0, 'rewind before the podcast step must hide all sub-heading labels');
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p2-p04-online-today-statistics'));
  assert.equal(await page.locator('#page-4 .exotic-email-chart > h2:nth-of-type(2) .curation-file-stamp-B').evaluate(node => getComputedStyle(node).animationName), 'none');

  const mobile = await context.newPage();
  await mobile.setViewportSize({width: 390, height: 844});
  await mobile.goto(`${origin}/paper3/2014-b2/index.html?curation=1`, {waitUntil: 'networkidle'});
  await mobile.waitForFunction(() => window.EDMUND_2014_B2_CURATION_DEBUG?.stage2Version);
  await mobile.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.goById('p2-p05-gamer-article'));
  assert.equal(await mobile.locator('#curation-category-panel').isVisible(), true);
  await mobile.screenshot({path: path.join(outputDir, '04-stage2-mobile.png'), fullPage: false});
  await mobile.close();

  const migrationContext = await browser.newContext({viewport: {width: 1400, height: 900}});
  const migration = await migrationContext.newPage();
  await migration.goto(`${origin}/paper3/2014-b2/index.html`, {waitUntil: 'domcontentloaded'});
  await migration.evaluate(() => localStorage.setItem('edmund-paper3-2014-b2-curation-stage1-v1', JSON.stringify({
    schema: 1, version: '2014-b2-super-curation-stage1-v3', state: {
      currentStepId: 'p1-task-b-open-day-speech', completedIds: ['p1-situation-identity-joey'],
      bookmarks: ['p1-task-b-open-day-speech'], spotlight: false, open: true, stageComplete: false, helpDrafts: {}
    }
  })));
  await migration.reload({waitUntil: 'networkidle'});
  await migration.waitForFunction(() => window.EDMUND_2014_B2_CURATION_DEBUG?.stage2Version);
  const migrated = await migration.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.getState());
  assert.equal(migrated.currentStage, 'instruction');
  assert.equal(migrated.stepId, 'p1-task-b-open-day-speech');
  assert.equal(migrated.spotlight, false);
  assert.ok(migrated.bookmarks.includes('p1-task-b-open-day-speech'));
  await migrationContext.close();

  const v1Context = await browser.newContext({viewport: {width: 1400, height: 900}});
  const v1Migration = await v1Context.newPage();
  await v1Migration.goto(`${origin}/paper3/2014-b2/index.html`, {waitUntil: 'domcontentloaded'});
  await v1Migration.evaluate(() => localStorage.setItem('edmund-paper3-2014-b2-curation-stage1-v1', JSON.stringify({
    schema: 2, version: '2014-b2-super-curation-stage2-v1', state: {
      currentStage: 'categorize', positions: {instruction: 'p1-stage-complete', categorize: 'p2-p03-pet-club-notes'},
      completed: {instruction: [], categorize: []}, completedStages: ['instruction'], categories: {'p2-p03-pet-club-notes': ['A']},
      bookmarks: [], spotlight: true, open: true, helpDrafts: {}
    }
  })));
  await v1Migration.reload({waitUntil: 'networkidle'});
  await v1Migration.waitForFunction(() => window.EDMUND_2014_B2_CURATION_DEBUG?.stage2Version === '2014-b2-super-curation-stage2-v3');
  assert.deepEqual(await v1Migration.evaluate(() => window.EDMUND_2014_B2_CURATION_DEBUG.getState().categories['p2-p03-pet-club-notes']), ['A', 'C'], 'v1 default A must migrate to the corrected A+C route');
  await v1Context.close();

  assert.deepEqual(consoleFailures, [], `browser console must remain clean:\n${consoleFailures.join('\n')}`);
  await context.close();
  await browser.close();
  server.close();
  console.log('2014 B2 Super Curation Part 2 browser journey: PASS');
  console.log(`highlightRatio=${highlightRatio.toFixed(3)} screenshots=${outputDir}`);
})().catch(error => {
  server.close();
  console.error(error);
  process.exitCode = 1;
});
