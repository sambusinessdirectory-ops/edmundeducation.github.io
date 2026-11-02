import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const manifest = JSON.parse(fs.readFileSync('tools/indefinite-pronouns-import-manifest.json', 'utf8'));
const files = {
  guide: 'course-materials/grammar/source/indefinite-pronouns-curation.md',
  exercises: 'course-materials/grammar/source/indefinite-pronouns-exercises-250.md',
  proofreading: 'course-materials/error-identifier/source/indefinite-pronouns-200-student.md'
};
for (const [kind, file] of Object.entries(files)) {
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'), manifest.sourceHashes[kind], `${kind} source changed without rebuilding`);
}
const context = { window: {} };
vm.runInNewContext(fs.readFileSync('grammar-indefinite-pronouns-data.js','utf8'), context);
const data = context.window.EDMUND_INDEFINITE_PRONOUNS;
assert.equal(data.guide.count, 68);
assert.equal((data.guide.html.match(/<h3 data-concept-number="\d{2}">/g) || []).length, 68);
assert.doesNotMatch(data.guide.html, /(?:來源|教材|PDF|掃描|高頻|IP\d{2}|十、檢查理解|本次來源與編寫方式)/);
assert.doesNotMatch(data.guide.html, /(?:Q01｜|答案與最重要的對照|七步示範)/);
assert.equal(data.guide.chapters.length, 9);
assert.equal(data.guide.chapters.length, manifest.guideChapters);
assert.equal(data.exercises.length, 250);
assert.deepEqual(Array.from(data.exercises, q => q.number), Array.from({length:250}, (_, i) => i + 1));
assert(data.exercises.every(q => q.prompt && q.translation));
assert.equal(data.passages.length, 10);
assert(data.passages.every(p => p.questions.length === 20));
assert.deepEqual(Array.from(data.passages.flatMap(p => p.questions), q => q.number), Array.from({length:200}, (_, i) => i + 1));
assert(!/jayden/i.test(JSON.stringify(data.passages)));
assert.equal(manifest.answerKeySupplied, false);
console.log('PASS: source hashes, 68 guide points, 250 grammar exercises, 10 passages and 200 proofreading questions.');
