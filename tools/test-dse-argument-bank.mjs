import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => JSON.parse(readFileSync(`dse-argument-bank/${file}`, 'utf8'));
const modules = [
  { data: read('data.json'), groupCounts: [41, 35, 48], responseCount: 41, synonyms: 64 },
  { data: read('driving-data.json'), groupCounts: [45, 41, 42], responseCount: 67, synonyms: 101 },
];

assert.equal(new Set(modules.map(({ data }) => data.id)).size, modules.length);
assert.match(readFileSync('index.html', 'utf8'), /href="dse-argument-bank\.html"/);
assert.match(readFileSync('dse-argument-bank/app.mjs', 'utf8'), /data-module="\$\{index\}"/);

for (const { data, groupCounts, responseCount, synonyms } of modules) {
  assert.equal(data.groups.length, 3, `${data.id}: group count`);
  assert.deepEqual(data.groups.map(section => section.arguments.length), groupCounts, `${data.id}: group arguments`);
  assert.equal(data.responses.length, 8, `${data.id}: response count`);
  assert.equal(data.responses.reduce((count, section) => count + section.arguments.length, 0), responseCount, `${data.id}: response arguments`);
  assert.equal(data.structures.length, 20, `${data.id}: speaking structures`);
  assert.equal(data.synonyms.length, synonyms, `${data.id}: synonym groups`);
  assert.ok(data.heroTitle && data.context.length === 3 && data.synonymWarning, `${data.id}: module metadata`);
  const argumentsInModule = data.groups.concat(data.responses).flatMap(section => {
    assert.ok(section.question && section.angles.length, `${data.id}: section heading`);
    if ('samples' in section) assert.ok(section.samples.length, `${data.id}: response examples`);
    for (const item of section.arguments) {
      assert.ok(section.angles.includes(item.angle), `${data.id}: ${item.id} angle`);
      assert.ok(item.description && item.glossary.length === 5, `${data.id}: ${item.id} glossary`);
      assert.ok(item.glossary.every(term => term.english && term.chinese), `${data.id}: ${item.id} bilingual terms`);
    }
    return section.arguments;
  });
  assert.equal(new Set(argumentsInModule.map(item => item.id)).size, argumentsInModule.length, `${data.id}: duplicate arguments`);
  assert.ok(data.synonyms.every(item => item.category && item.keyword && item.chinese && item.alternatives.length === 5 && item.alternatives.every(Boolean)), `${data.id}: synonym alternatives`);
}

console.log('DSE modules: complete bilingual arguments, speaking structures, and synonyms.');
