import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(root, 'content', 'idiom-compass-editorial-31-108');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'idiom-import-manifest.json'), 'utf8'));
const sourceById = new Map(manifest.sources.map((source) => [source.lessonId, source]));
const files = fs.readdirSync(directory).filter((name) => /^idiom-\d{2,3}\.json$/.test(name)).sort();
const practiceFiles = fs.readdirSync(directory).filter((name) => /^idiom-\d{2,3}-practice-\d{2}-\d{2}\.json$/.test(name)).sort();
const hasEnglish = (value) => /[A-Za-z]/.test(String(value || ''));
const hasChinese = (value) => /[\u3400-\u9fff]/u.test(String(value || ''));
const failures = [];

for (const name of files) {
  const fail = (message) => failures.push(`${name}: ${message}`);
  let draft;
  try {
    draft = JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
  } catch (error) {
    fail(`invalid JSON: ${error.message}`);
    continue;
  }
  const lessonId = name.slice(0, -5);
  const source = sourceById.get(lessonId);
  if (!source || draft.lessonId !== lessonId) fail('lesson ID does not match source manifest');
  if (source && (draft.sourcePdf !== source.sourceFile || draft.sourcePdfSha256 !== source.sha256)) fail('source PDF identity/hash mismatch');
  if (draft.status !== 'EDITORIAL_DRAFT_NOT_LIVE') fail('draft status must be explicit');
  if (!draft.targetFormPattern) fail('missing target-form check');
  let form;
  try { form = new RegExp(draft.targetFormPattern, 'i'); } catch { fail('invalid target-form regex'); }
  const guide = draft.guide || {};
  for (const [en, zh] of [
    ['meaningEn', 'meaningZh'], ['modelEn', 'modelZh'], ['pictureEn', 'pictureZh'],
    ['boundaryEn', 'boundaryZh'], ['whereEn', 'whereZh'], ['toneEn', 'toneZh'],
    ['formalEn', 'formalZh'], ['movingEn', 'movingZh'], ['readAloudEn', 'readAloudZh']
  ]) {
    if (!hasEnglish(guide[en]) || !hasChinese(guide[zh])) fail(`missing bilingual ${en}/${zh}`);
  }
  if (guide.modelEn === guide.readAloudEn) fail('read-aloud repeats model');
  if (form && (!form.test(guide.modelEn || '') || !form.test(guide.readAloudEn || ''))) fail('model or read-aloud omits target form');
  if (!Array.isArray(guide.forms) || guide.forms.length < 2) fail('fewer than two approved form examples');
  if (!Array.isArray(guide.checksEn) || guide.checksEn.length !== 3 ||
      !Array.isArray(guide.checks) || guide.checks.length !== 3) fail('Pocket Check must have three bilingual questions');
  const choices = guide.choices || {};
  if (Object.keys(choices).sort().join(',') !== '2,3,5,6') fail('decision pages must be 2, 3, 5 and 6');
  const lines = [guide.modelEn, guide.readAloudEn];
  const jobs = new Set();
  for (const page of [2, 3, 5, 6]) {
    const choice = choices[page] || {};
    if (!hasEnglish(choice.job) || jobs.has(choice.job)) fail(`page ${page}: missing or repeated cognitive job`);
    jobs.add(choice.job);
    if (!hasEnglish(choice.promptEn) || !hasChinese(choice.promptZh)) fail(`page ${page}: missing bilingual stem`);
    if (!Array.isArray(choice.optionsEn) || choice.optionsEn.length !== 3 ||
        !Array.isArray(choice.options) || choice.options.length !== 3) {
      fail(`page ${page}: requires three bilingual options`);
    } else {
      choice.optionsEn.forEach((line) => { if (!hasEnglish(line)) fail(`page ${page}: English option missing`); lines.push(line); });
      choice.options.forEach((line) => { if (!hasChinese(line)) fail(`page ${page}: Chinese reason missing`); });
    }
    if (!Number.isInteger(choice.correct) || choice.correct < 0 || choice.correct > 2) fail(`page ${page}: invalid key`);
    if (!hasEnglish(choice.feedbackEn) || !hasChinese(choice.feedback)) fail(`page ${page}: missing bilingual feedback`);
  }
  if (lines.length === 14 && new Set(lines.map((line) => String(line).toLocaleLowerCase('en'))).size !== 14) fail('model, read-aloud and decision lines must be distinct');
  const bonuses = draft.bonusBlueprint || [];
  if (bonuses.length !== 10) fail('expected ten extension blueprints');
  if (new Set(bonuses.map((row) => row[0])).size !== 10) fail('extension themes repeat');
  bonuses.forEach((row, index) => {
    if (row.length !== 5 || !hasEnglish(row[1]) || !hasChinese(row[2]) ||
        !hasEnglish(row[3]) || !hasChinese(row[4])) fail(`extension ${index + 1}: incomplete bilingual prompt/answer`);
    if (form && !form.test(row[3] || '')) fail(`extension ${index + 1}: answer omits target form`);
  });
  if (!Array.isArray(draft.openGates) || !draft.openGates.length) fail('unfinished review gates are not recorded');
}

let practiceCount = 0;
for (const name of practiceFiles) {
  const fail = (message) => failures.push(`${name}: ${message}`);
  let draft;
  try { draft = JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')); }
  catch (error) { fail(`invalid JSON: ${error.message}`); continue; }
  const lessonId = name.match(/^idiom-\d{2,3}/)?.[0];
  const sourceOrder = lessonId.slice(6).padStart(3, '0');
  const sourceName = fs.readdirSync(path.join(root, 'tools', 'idiom-lessons'))
    .find((filename) => filename.startsWith(`lesson-${sourceOrder}-`) && filename.endsWith('.json'));
  if (!sourceName || draft.lessonId !== lessonId || draft.status !== 'AI_EDITORIAL_DRAFT_NOT_LIVE') {
    fail('source lesson, ID or draft status mismatch');
    continue;
  }
  const lesson = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'idiom-lessons', sourceName), 'utf8')).lesson;
  const questions = new Map(lesson.questions.map((question) => [question.id, question]));
  for (const [id, choice] of Object.entries(draft.items || {})) {
    practiceCount++;
    const source = questions.get(id);
    if (!source) { fail(`unknown original ID ${id}`); continue; }
    if (!hasEnglish(choice.truthCondition) || !hasChinese(choice.correctReason)) fail(`${id}: missing truth condition or correct reason`);
    if (!Array.isArray(choice.foils) || choice.foils.length !== 3) { fail(`${id}: requires three foils`); continue; }
    const lines = [source.answer, ...choice.foils.map((foil) => foil.text)];
    if (new Set(lines.map((line) => String(line).toLocaleLowerCase('en'))).size !== 4) fail(`${id}: repeated answer/foil`);
    if (new Set(choice.foils.map((foil) => foil.kind)).size !== 3) fail(`${id}: repeated foil mechanisms`);
    if (!choice.foils.every((foil) => hasEnglish(foil.text) && hasChinese(foil.reason) && hasEnglish(foil.kind))) fail(`${id}: incomplete English/Chinese foil`);
    const lengths = lines.map((line) => String(line).trim().split(/\s+/).length).sort((a, b) => a - b);
    const median = (lengths[1] + lengths[2]) / 2;
    if (lengths[3] > median * 1.3) fail(`${id}: option length requires editorial review (${lengths.join(',')})`);
  }
}

assert.ok(files.length, 'No editorial draft files found');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`${files.length} source-linked guide draft(s) and ${practiceCount} practice item draft(s) pass structural checks; none is approved for release.`);
}
