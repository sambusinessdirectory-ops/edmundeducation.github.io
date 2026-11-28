import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = path.join(root, 'paper3/2014-b2/super-curation-data.js');
const controllerPath = path.join(root, 'paper3/2014-b2/super-curation.js');
const cssPath = path.join(root, 'paper3/2014-b2/super-curation.css');
const htmlPath = path.join(root, 'paper3/2014-b2/index.html');

const sandbox = {window: {}};
vm.runInNewContext(fs.readFileSync(dataPath, 'utf8'), sandbox, {filename: dataPath});
const lesson = sandbox.window.EDMUND_2014_B2_CURATION;
const html = fs.readFileSync(htmlPath, 'utf8');
const controller = fs.readFileSync(controllerPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const canonical = value => String(value).normalize('NFKC')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
const readerText = canonical(html.replace(/<[^>]+>/g, ' '));

assert.equal(lesson.version, '2014-b2-super-curation-stage2-v3');
assert.equal(lesson.steps.length, 47, 'Stage 1 must retain 38 atomic source units, 8 route transactions and one completion step');
assert.equal(new Set(lesson.steps.map(step => step.id)).size, lesson.steps.length, 'stable IDs must be unique');
assert.equal(
  JSON.stringify(Array.from(lesson.stages, stage => stage.enabled)),
  JSON.stringify([true, true, false, false, false]),
  'Stages 1 and 2 must be enabled while Stages 3–5 stay locked'
);

const sourceUnits = Array.from(lesson.steps, step => step).filter(step => !step.sourceJump && !step.routeReturn && !step.final);
assert.equal(sourceUnits.length, 38, 'every reviewed situation/email source unit must have exactly one primary teaching step');
assert.equal(new Set(sourceUnits.map(step => canonical(step.phrase))).size, sourceUnits.length, 'primary source units must not be duplicated or bundled');
assert.equal(Array.from(lesson.steps, step => step).filter(step => step.essential || step.sourceJump).length, 25, 'persistent colour must be limited to essential phrases and route destinations');
assert.equal(Array.from(lesson.steps, step => step).find(step => step.id === 'p1-letter-to-joey').essential, undefined, 'administrative email fields must not remain highlighted');

const allowedKinds = new Set(['A', 'B', 'C', 'hint', 'noise']);
for (const [index, step] of Array.from(lesson.steps).entries()) {
  assert.match(step.id, /^p1-[a-z0-9-]+$/, `invalid stable ID at step ${index + 1}`);
  assert.ok(Number.isInteger(step.page) && step.page >= 2 && step.page <= 9, `${step.id}: invalid page`);
  assert.ok(step.sourcePage, `${step.id}: missing source page`);
  assert.ok(step.selector, `${step.id}: missing exact selector`);
  assert.ok(step.title && step.translation && step.explanation && step.help, `${step.id}: incomplete teaching copy`);
  assert.ok(allowedKinds.has(step.kind), `${step.id}: invalid highlight kind`);
  if (!step.final) {
    assert.ok(step.phrase, `${step.id}: missing exact source phrase`);
    assert.ok(readerText.includes(canonical(step.phrase)), `${step.id}: phrase not present verbatim in the 2014 native reader`);
  }
}

assert.equal(lesson.steps.at(-1).id, 'p1-stage-complete');
assert.equal(lesson.steps.at(-1).final, true);
assert.deepEqual(
  Array.from(lesson.steps, step => step).filter(step => step.sourceJump).map(step => step.id),
  [
    'p1-route-note-sheet-visit',
    'p1-route-task-a-podcast-visit',
    'p1-route-task-b-book-visit',
    'p1-route-task-c-squeers-visit'
  ]
);
assert.equal(
  JSON.stringify([...new Set(Array.from(lesson.steps, step => step.task).filter(Boolean))]),
  JSON.stringify(['A', 'B', 'C']),
  'all three task contracts must be covered'
);
assert.equal(sourceUnits.filter(step => step.task === 'A').length, 8);
assert.equal(sourceUnits.filter(step => step.task === 'B').length, 5);
assert.equal(sourceUnits.filter(step => step.task === 'C').length, 4);
assert.deepEqual(Array.from(sourceUnits.filter(step => step.task === 'A' && step.point), step => step.point), ['1', '2', '3']);
assert.deepEqual(Array.from(sourceUnits.filter(step => step.task === 'B' && step.point), step => step.point), ['1', '2']);
assert.deepEqual(Array.from(sourceUnits.filter(step => step.task === 'C' && step.point), step => step.point), ['1', '2']);

assert.match(html, /super-curation-data\.js\?v=20261118-part2-v3/);
assert.match(html, /super-curation\.js\?v=20261118-part2-v3/);
assert.match(controller, /super-curation-stage2-data\.js\?v=20261118-part2-v3/);
assert.match(controller, /super-curation-v2\.js\?v=20261128-stage-rail-exact-2025-v1/);
assert.match(controller, /super-curation-stage2\.css\?v=20261122-transcript-v3/);
assert.match(controller, /localStorage\.setItem/);
assert.match(controller, /targetAudit/);
assert.match(controller, /goById/);
assert.match(controller, /setSpotlight/);
assert.match(controller, /helpDrafts/);
assert.match(controller, /EDMUND_2014_B2_CURATION_DEBUG/);
assert.match(controller, /syncFileStamps/);
assert.match(controller, /curation-file-stamp/);
assert.match(controller, /自由瀏覽所有步驟/);
assert.doesNotMatch(controller, /maxUnlocked|option\.disabled\s*=|step\.index\s*<=\s*maxUnlocked/, 'every Stage 1 step must remain freely selectable');
assert.match(controller, /item\.essential \|\| item\.sourceJump/, 'only essential phrases and route destinations may remain highlighted');
assert.doesNotMatch(controller, /EDMUND_2016_B2/);
assert.match(css, /@media \(min-width:1200px\)/);
assert.match(css, /\.curation-mask/);
assert.match(css, /\.curation-route-callout/);
assert.match(css, /\.curation-file-stamp/);
assert.match(css, /\[data-point\]::before/);
assert.match(css, /right:-55px/);

const teachingOnly = fs.readFileSync(dataPath, 'utf8');
for (const premature of ['Operation Gar', 'Orphan Programme', '26% of virtual-pet users', 'six-month internship']) {
  assert.doesNotMatch(teachingOnly, new RegExp(premature, 'i'), `Stage 1 must not reveal later evidence: ${premature}`);
}

console.log('2014 B2 Super Curation Part 1 static contract: PASS');
console.log(`steps=${lesson.steps.length} sourceUnits=${sourceUnits.length} stableIds=${new Set(lesson.steps.map(step => step.id)).size} routes=${lesson.steps.filter(step => step.sourceJump).length}`);
