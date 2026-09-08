#!/usr/bin/env node
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const directory = new URL('assets/sentence-structure/library/', root);
const check = process.argv.includes('--check');
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const file of ['sentence-structure-lessons-5-345.js', 'sentence-structure-data.js']) {
  vm.runInContext(await readFile(new URL(file, root), 'utf8'), sandbox);
}
const { version, lessons } = sandbox.window.EDMUND_SENTENCE_STRUCTURE_DATA;
const files = new Map();
function asset(name, data) {
  const body = JSON.stringify(data) + '\n';
  const hash = createHash('sha256').update(body).digest('hex').slice(0, 12);
  const filename = `${name}.${hash}.json`;
  files.set(filename, body);
  return filename;
}
function strings(value, output = [], key = '') {
  if (value == null || ['source', 'image', 'illustration', 'src', 'file', 'sourcePage', 'answerSourcePage'].includes(key)) return output;
  if (typeof value === 'string') {
    const text = value.replace(/\s+/g, ' ').trim();
    if (text) output.push(text);
  } else if (Array.isArray(value)) value.forEach(item => strings(item, output, key));
  else if (typeof value === 'object') Object.entries(value).forEach(([child, item]) => strings(item, output, child));
  return output;
}
const index = [];
const pageFields = [['formula', 'formulas', 'example', 'exampleZh', 'examples', 'meaning'], ['benefits'], ['rules'], ['instructions']];
const manifestLessons = lessons.map(lesson => {
  index.push([lesson.id, 1, 'title', '', 0, [lesson.title, lesson.titleEn, lesson.slug].filter(Boolean)]);
  pageFields.forEach((fields, i) => {
    const texts = fields.flatMap(field => strings(lesson[field]));
    if (texts.length) index.push([lesson.id, i + 1, 'page', '', 0, [...new Set(texts)]]);
  });
  lesson.questions.forEach((q, i) => index.push([lesson.id, 4, 'question', q.id, i + 1, [...new Set(strings(q))]]));
  return { id: lesson.id, title: lesson.title, titleEn: lesson.titleEn, version: lesson.version,
    detail: asset(lesson.id, lesson), questionRefs: lesson.questions.map(q => [q.id, q.number]) };
});
files.set('manifest.json', JSON.stringify({ version, search: asset('search', index), lessons: manifestLessons }) + '\n');
if (!check) await mkdir(directory, { recursive: true });
for (const [name, body] of files) {
  if (check) assert.equal(await readFile(new URL(name, directory), 'utf8'), body, `Regenerate ${name}`);
  else await writeFile(new URL(name, directory), body);
}
if (check) assert.deepEqual((await readdir(directory)).sort(), [...files.keys()].sort(), 'Remove obsolete generated library files');
console.log(`${check ? 'Verified' : 'Built'} ${lessons.length} individual lessons; directory ${Buffer.byteLength(files.get('manifest.json'))} bytes. Login loads none of these files.`);
