import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context = { window: {} };
vm.runInNewContext(fs.readFileSync('grammar-indefinite-pronouns-answers.js', 'utf8'), context);
const references = context.window.EDMUND_INDEFINITE_ANSWERS;
const guide = fs.readFileSync('course-materials/grammar/source/indefinite-pronouns-curation.md', 'utf8');
const topics = new Set([...guide.matchAll(/^### (IP\d{2})｜/gm)].map(match => match[1]));
assert.equal(references.length, 250);
for (const [index, entry] of references.entries()) {
  assert.equal(entry.number, index + 1);
  assert(entry.answer?.trim(), `Missing answer for ${index + 1}`);
  assert(entry.explanation?.trim(), `Missing explanation for ${index + 1}`);
  assert(topics.has(entry.topic), `Unknown guide topic for ${index + 1}: ${entry.topic}`);
}
assert.equal(references[0].answer, 'someone');
assert.match(references[0].explanation, /人/);
assert.match(fs.readFileSync('grammar-indefinite-pronouns.js', 'utf8'), /data-reveal/);
console.log('PASS: 250 ordered editorial references with explanations and existing guide topics.');
