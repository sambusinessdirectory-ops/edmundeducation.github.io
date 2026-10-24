import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync(path.join(root, 'idiom-system-data.js'), 'utf8'), context);
const lessons = context.window.EDMUND_IDIOM_SYSTEM_DATA.lessons.filter((lesson) => lesson.order >= 31 && lesson.order <= 108);
assert.equal(lessons.length, 78);
const ids = new Set();
for (const lesson of lessons) {
  assert.equal(lesson.questions.length, 50, `${lesson.id}: protected source count`);
  assert.ok(lesson.meaning.en.split(/\s+/).length >= 3 && lesson.meaning.en.split(/\s+/).length <= 35,
    `${lesson.id}: concise, informative English meaning`);
  assert.match(lesson.meaning.zh, /[\u3400-\u9fff]/u, `${lesson.id}: Traditional Chinese meaning`);
  assert.ok(lesson.meaning.naturalZh?.length, `${lesson.id}: at least one natural Chinese gloss`);
  assert.doesNotMatch([lesson.meaning.en, lesson.meaning.zh, ...lesson.meaning.naturalZh, lesson.register.labelEn,
    lesson.register.summaryEn].join(' '), /source-guided|supplied model answers|accepted alternative|included meaning/i,
  `${lesson.id}: placeholder source metadata`);
  for (const question of lesson.questions) {
    assert.ok(!ids.has(question.id), `${lesson.id}: duplicate ${question.id}`);
    ids.add(question.id);
    assert.equal(question.targetMeaning, lesson.meaning.en, `${question.id}: sense snapshot drift`);
    assert.ok(question.prompt && question.promptZh && question.answer && question.answerZh, `${question.id}: source bilingual pair`);
  }
}
const byOrder = (number) => lessons.find((lesson) => lesson.order === number);
assert.match(byOrder(41).meaning.en, /humiliation.*also.*mistake/i, 'eat dirt retains both source senses');
assert.match(byOrder(72).meaning.en, /stay in power.*disagreements/i, 'divide and rule is no longer circular');
assert.match(byOrder(82).meaning.en, /fear upsetting someone/i, 'eggshells has a real meaning');
assert.match(byOrder(104).meaning.zh, /司機.*比喻/u, 'back-seat driver includes literal and figurative uses in Chinese');
console.log('78 source meanings, registers, 3,900 original IDs and sense snapshots pass readiness checks.');
