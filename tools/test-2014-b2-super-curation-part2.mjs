import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sandbox = {window: {}};
vm.runInNewContext(read('paper3/2014-b2/super-curation-data.js'), sandbox);
vm.runInNewContext(read('paper3/2014-b2/super-curation-stage2-data.js'), sandbox);

const lesson = sandbox.window.EDMUND_2014_B2_CURATION;
const stage2 = sandbox.window.EDMUND_2014_B2_CURATION_STAGE2;
const inventory = Array.from(stage2.inventory);
const steps = Array.from(stage2.steps);
const html = read('paper3/2014-b2/index.html');
const controller = read('paper3/2014-b2/super-curation-v2.js');
const loader = read('paper3/2014-b2/super-curation.js');
const css = read('paper3/2014-b2/super-curation-stage2.css');
const canonical = value => String(value).normalize('NFKC')
  .replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'").replace(/[’‘]/g, "'").replace(/[“”]/g, '"')
  .replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
const readerText = canonical(html);

assert.equal(lesson.version, '2014-b2-super-curation-stage2-v3');
assert.equal(stage2.version, '2014-b2-super-curation-stage2-v3');
assert.equal(inventory.length, 12, 'Stage 2 must classify every relevant source document exactly once');
assert.equal(steps.length, 20, 'Stage 2 must include transition, 12 document decisions, six podcast sub-heading decisions and completion');
assert.equal(steps[0].id, 'p2-stage-intro');
assert.equal(steps.at(-1).id, 'p2-stage-complete');
assert.equal(steps.at(-1).final, true);
assert.equal(new Set(inventory.map(record => record.id)).size, inventory.length);
assert.deepEqual(inventory.map(record => record.page), [3, 4, 5, 5, 6, 7, 7, 8, 9, 9, 10, 11]);

const allowedTasks = new Set(['A', 'B', 'C']);
const allowedStatuses = new Set(['subheading-routed', 'strong-initial', 'explicit-route']);
for (const record of inventory) {
  assert.match(record.id, /^p2-p\d{2}-[a-z0-9-]+$/);
  assert.ok(record.selector.startsWith(`#page-${record.page} `), `${record.id}: selector must point to its declared native page`);
  assert.ok(readerText.includes(canonical(record.documentTitle)), `${record.id}: native document title is missing`);
  for (const field of ['title', 'documentType', 'writer', 'reader', 'date', 'contents', 'reason', 'revisionGuidance', 'risk']) {
    assert.ok(record[field], `${record.id}: missing ${field}`);
  }
  assert.ok(Array.isArray(record.sourceRefs) && record.sourceRefs.length > 0, `${record.id}: missing source route references`);
  assert.ok(record.initialTasks.length > 0 && record.initialTasks.every(task => allowedTasks.has(task)), `${record.id}: invalid initial task set`);
  assert.ok(record.possibleFinalTasks.length > 0 && record.possibleFinalTasks.every(task => allowedTasks.has(task)), `${record.id}: invalid possible-final task set`);
  assert.ok(allowedStatuses.has(record.classificationStatus), `${record.id}: invalid classification status`);
}

assert.equal(inventory.filter(record => record.initialTasks.includes('A')).length, 3);
assert.equal(inventory.filter(record => record.initialTasks.includes('B')).length, 4);
assert.equal(inventory.filter(record => record.initialTasks.includes('C')).length, 6);
assert.deepEqual(Array.from(inventory[0].possibleFinalTasks), ['A', 'C'], 'the listening sheet must retain both routed tasks for Stage 3 verification');
assert.deepEqual(Array.from(inventory[0].initialTasks), ['A', 'C'], 'the listening sheet must expose both task routes');
assert.equal(inventory.filter(record => record.initialTasks.length > 1).length, 1, 'the listening sheet is the one explicit multitask document');
assert.equal(inventory[0].subheadings.length, 6, 'all six printed podcast sub-headings must be classified');
assert.deepEqual(Array.from(inventory[0].subheadings, item => Array.from(item.tasks)), [[], [], [], [], ['A'], ['C']]);
assert.deepEqual(Array.from(inventory[0].subheadings, item => item.title), ['Exotic pets — Definition', 'Reasons to have an exotic pet', 'Examples of exotic pets in Hong Kong', 'Email 1', 'Email 2', 'Advice for exotic pet owners']);
const podcastSubheadingSteps = steps.filter(step => step.subheadingStep);
assert.equal(podcastSubheadingSteps.length, 6, 'every printed podcast sub-heading must be independently navigable');
assert.deepEqual(podcastSubheadingSteps.map(step => step.id), Array.from(inventory[0].subheadings, item => item.id));
assert.deepEqual(podcastSubheadingSteps.map(step => Array.from(step.labelTasks)), [[], [], [], [], ['A'], ['C']]);
assert.deepEqual(steps.slice(1, 8).map(step => step.id), ['p2-p03-pet-club-notes', ...podcastSubheadingSteps.map(step => step.id)], 'the six finer headings must immediately follow the podcast document step');

for (const premature of ['Operation Gar', 'Orphan Programme', '26%', 'six-month internship', 'take blood', 'dental cleaning']) {
  assert.doesNotMatch(read('paper3/2014-b2/super-curation-stage2-data.js'), new RegExp(premature, 'i'), `Stage 2 must not reveal later evidence: ${premature}`);
}

assert.match(controller, /const SCHEMA = 5/);
assert.match(controller, /LEGACY_VERSION = '2014-b2-super-curation-stage1-v3'/);
assert.match(controller, /migrateLegacy/);
assert.match(controller, /migrateStage2V1/);
assert.match(controller, /categories: \{\}/);
assert.match(controller, /curation-category-choices/);
assert.match(controller, /value="\?"/);
assert.match(controller, /顯示讀後修正提示/);
assert.match(controller, /syncFileStamps/);
assert.match(controller, /syncSubheadingLabels/);
assert.match(controller, /curation-subheading-panel/);
assert.match(controller, /categorySelection/);
assert.match(controller, /stepsByStage/);
assert.match(controller, /setStage/);
assert.match(controller, /自由瀏覽本階段/);
assert.doesNotMatch(controller, /maxUnlocked|option\.disabled\s*=|index\s*<=\s*maxUnlocked/, 'all Stage 2 steps must remain freely selectable');
assert.match(loader, /super-curation-stage2-data\.js\?v=20261118-part2-v3/);
assert.match(loader, /super-curation-v2\.js\?v=20261128-stage-rail-exact-2025-v1/);
assert.match(css, /exact task-bearing phrase/);
assert.match(css, /curation-category-choices/);
assert.match(css, /curation-subheading-excluded/);
assert.match(css, /prefers-reduced-motion/);

console.log('2014 B2 Super Curation Part 2 static contract: PASS');
console.log(`inventory=${inventory.length} steps=${steps.length} initialA=3 initialB=4 initialC=6 podcastSubheadings=6`);
