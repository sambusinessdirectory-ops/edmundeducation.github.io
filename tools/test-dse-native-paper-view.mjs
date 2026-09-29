#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const catalogue = read('dse-reading-catalogue.json');
const manifest = read('dse-reading-paper-scans.json');
const entries = catalogue.years.flatMap((year) => Object.values(year.sections).filter(Boolean));
const ids = entries.map((entry) => entry.id);

assert.ok(ids.length > 0, 'the DSE catalogue must contain papers');
assert.deepEqual(Object.keys(manifest).sort(), [...ids].sort(), 'scan manifest must account for every paper, including those without scans');

let retainedScans = 0;
for (const entry of entries) {
  const paper = read(`dse-reading-data/${entry.id}.json`);
  assert.equal(paper.id, entry.id);
  assert.ok(paper.paragraphs?.length, `${entry.id}: no native passage paragraphs`);
  assert.ok(paper.questions?.length, `${entry.id}: no interactive questions`);
  assert.ok(paper.paragraphs?.every((paragraph) => typeof paragraph.text === 'string' && paragraph.text.trim()), `${entry.id}: missing native passage text`);
  assert.ok(paper.questions?.every((question) => typeof question.prompt === 'string' && question.prompt.trim()), `${entry.id}: missing native question text`);
  assert.equal(paper.questions.length, entry.questionCount, `${entry.id}: question count differs from catalogue`);

  const pages = manifest[entry.id];
  assert.ok(Array.isArray(pages));
  if (!pages.length) continue;
  assert.ok(pages.some((page) => page.kind === 'passage'), `${entry.id}: passage scan missing`);
  assert.ok(pages.some((page) => page.kind === 'questions'), `${entry.id}: question scan missing`);
  for (const page of pages) {
    assert.match(page.src, /^assets\/reading-comprehension\/dse\/papers\/\d{4}\/(?:a|b1|b2)\/(?:passage|questions)-\d+\.webp$/);
    assert.ok(fs.existsSync(path.join(root, page.src)), `${entry.id}: missing ${page.src}`);
    retainedScans++;
  }
}

console.log(`DSE native paper view: ${entries.length} interactive papers and ${retainedScans} retained source-page scans verified.`);
