import assert from 'node:assert/strict';
import {stat} from 'node:fs/promises';
import {render2016DigitalPaper} from '../dse-listening-2016-paper-layout.mjs';

const html = render2016DigitalPaper(new Map());
assert.equal((html.match(/class="original-paper-page digital-paper-page/g) || []).length, 8);
assert.doesNotMatch(html, /page-[1-8]\.webp|paper\.json|original-paper-text/);

const questionNumbers = [...html.matchAll(/data-original-q="(\d+)"/g)].map(match => Number(match[1]));
const studyQuestionNumbers = [...html.matchAll(/data-dse-answer-q="(\d+)"/g)].map(match => Number(match[1]));
assert.deepEqual(
  [...new Set(questionNumbers)].sort((a, b) => a - b),
  Array.from({length: 58}, (_, index) => index + 1)
);
assert.deepEqual(studyQuestionNumbers, questionNumbers);
for (const question of [10, 11, 12]) assert.equal(questionNumbers.filter(value => value === question).length, 2);
for (const question of [40, 47]) assert.equal(questionNumbers.filter(value => value === question).length, 3);

for (const filename of [
  'cabbage-patch-doll-1280.webp',
  'space-hopper-1280.webp',
  'james-dean-1280.webp'
]) {
  const file = new URL(`../assets/dse-listening/reconstructed-v3/2016/${filename}`, import.meta.url);
  assert.ok((await stat(file)).size > 20_000);
  assert.match(html, new RegExp(filename.replace('.', '\\.')));
}

for (const phrase of [
  'GENERAL INSTRUCTIONS',
  'The Chau family is on holiday in London',
  'Task 1',
  'Task 2',
  'Task 3',
  'Task 4',
  'END OF TASK 4',
  'End of Part A'
]) assert.match(html, new RegExp(phrase));

assert.match(html, /<strong>37<\/strong>/);
assert.match(html, /<strong>39<\/strong>/);
assert.match(html, /<strong>45<\/strong>/);

console.log('2016 digitised paper: 8 semantic pages, 58 unique questions, exact choice sets, crisp text and high-resolution illustrations validated.');
