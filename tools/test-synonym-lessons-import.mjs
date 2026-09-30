import assert from 'node:assert/strict';
import { lessons } from '../synonyms/lessons-data.mjs';

assert.equal(lessons.length, 100);
assert.equal(new Set(lessons.map(lesson => lesson.sourceId)).size, 100);
let alternatives = 0;
let questions = 0;
let feedback = 0;
for (const [index, lesson] of lessons.entries()) {
  const moduleNumber = index + 3;
  assert.equal(lesson.moduleNumber, moduleNumber);
  assert.equal(lesson.id, `lesson-${String(moduleNumber).padStart(3, '0')}`);
  assert.ok(lesson.headword && lesson.sourceSense && lesson.falseSynonyms.length);
  for (const word of lesson.words) {
    alternatives++;
    assert.ok(word.word && word.meaning && word.note && word.collocations && word.contrast && word.example && word.exampleZh);
    assert.equal(word.exercises.length, 2);
    for (const exercise of word.exercises) {
      questions++;
      assert.ok(exercise.original && exercise.zh && exercise.upgrade && exercise.answer);
      assert.equal(exercise.options.length, 6);
      assert.deepEqual(exercise.options.map(option => option.letter), [...'ABCDEF']);
      assert.equal(exercise.options.filter(option => option.text === exercise.answer).length, 1);
      for (const option of exercise.options) {
        assert.ok(option.explanation);
        feedback++;
      }
    }
  }
}
assert.equal(alternatives, 392);
assert.equal(questions, 784);
assert.equal(feedback, 4704);
console.log(`Validated ${lessons.length} modules, ${alternatives} alternatives, ${questions} questions, ${feedback} option explanations.`);
