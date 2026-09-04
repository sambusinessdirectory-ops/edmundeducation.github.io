import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const paper = JSON.parse(await read('dse-reading-data/dse-2023-b1.json'));
const question = number => paper.questions.find(item => item.number === number);
const keys = ['i', 'ii', 'iii', 'iv', 'v'];

assert.equal(paper.questionRevision, '20260904-b1-source-verified');
assert.deepEqual(paper.questions.map(item => item.number), Array.from({length:23}, (_, i) => i + 23));
assert.equal(paper.paragraphs.length, 16);
assert.match(paper.paragraphs[3].text, /Sami is just like.*four-legged member/);
assert.match(paper.paragraphs[4].text, /kept pulling towards each other/);
assert.match(paper.paragraphs[4].text, /they both had the same disability/);
assert.match(paper.paragraphs[7].text, /dog in!.*the worker said/);
assert.deepEqual(paper.paragraphs.slice(5).map(item => item.label), Array.from({length:11}, (_, i) => `Text 3 - Paragraph ${i + 1}`));
assert.ok(paper.paragraphs.every(item => !item.translation));
assert.ok(paper.questions.every(item => !('answer' in item)));

for (const [number, count] of [[24,3],[27,3],[30,2],[31,2],[33,3],[36,4],[41,3],[44,5],[45,3]]) {
  assert.deepEqual(question(number).parts.map(item => item.key), keys.slice(0, count), `Q${number}: a separate field for every printed blank`);
}
assert.equal(question(25).type, 'multiple');
assert.equal(question(25).slots, 3);
assert.deepEqual(question(25).options.map(item => item.value), ['a','b','c','d','e']);
assert.deepEqual(question(25).options.map(item => item.label), [
  'a. Owners do not walk into people.', 'b. Owners become more independent.',
  'c. Owners bump into obstacles.', 'd. Owners lead their guide dogs confidently.',
  'e. Owners avoid accidents.',
]);
for (const number of [24,41]) {
  for (const part of question(number).parts) {
    assert.equal(part.type, 'select');
    assert.deepEqual(part.options, ['T','F','NG']);
  }
}
assert.equal(question(27).tables[0].flow, true);
assert.equal(question(27).tables[0].rows.length, 9);
assert.deepEqual(question(30).tables[0].rows[0].map(cell => cell.text), ['Cause','Result']);
assert.match(question(44).parts[1].label, /public can make a difference/);
assert.equal(question(44).tables[0].rows[1][1].text, '10 (example)');

const matching = question(45);
assert.equal(matching.type, 'parts');
assert.equal(matching.marks, 3);
assert.equal(matching.figuresAfterControls, true);
assert.doesNotMatch(matching.prompt, /Meicy|People in Text 3 Letter|I believe|I have been doing/);
assert.deepEqual(matching.tables[0].rows.map(row => row.map(cell => cell.text || '')), [
  ['People in Text 3','Letter'], ['Meicy Choi','(i)'], ['Raymond Cheung','(ii)'],
  ['LCSD Spokeswoman','C (example)'], ['The worker at Lai Chi Kok Park','(iii)'],
]);
assert.ok(!matching.tables[0].rows[3][1].part, 'the printed example must not be editable or count as an answer');
for (const part of matching.parts) {
  assert.equal(part.type, 'select');
  assert.deepEqual(part.options, ['A','B','D','E']);
}
assert.equal(matching.figures[0].src, 'assets/reading-comprehension/dse/content/2023/b1/questions-4-visual-1.webp');
const script = await read('reading-comprehension.js');
const css = await read('reading-comprehension.css');
assert.match(script, /\$\{controls\}\$\{question\.figuresAfterControls \? figure : ''\}/);
assert.match(css, /\.source-table\.is-compact\s*\{[^}]*min-width:0/);
console.log('DSE 2023 B1: all 23 questions, native matching tables, 3-choice checkboxes, printed examples and complete source paragraphs verified.');
