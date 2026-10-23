#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const base = resolve(root, 'course-materials/advanced-native');
const readJson = path => JSON.parse(readFileSync(resolve(base, path), 'utf8'));
const readJsonl = path => readFileSync(resolve(base, path), 'utf8').trim().split('\n').map(JSON.parse);

const sourceById = new Map(readJsonl('books10-16/source-inventory.jsonl').map(row => [row.sourceId, row]));
const manifest = readJson('books10-16/editorial-decision-manifest.json');
const held = new Map(manifest.decisionFiles.flatMap(name => readJsonl(`books10-16/${name}`))
  .filter(row => row.action === 'hold-editorial').map(row => [row.sourceOrdinal, row]));
const reports = [
  ['reviews-books10-16/read-only-grouped-hold-disposition-2112-3000-a.json', 'sourceExample', 'workingGroup'],
  ['reviews-books10-16/independent-ai-readonly-hold-disposition-3001-3900-b.json', 'sourceSentence', 'category'],
  ['reviews-books10-16/read-only-hold-disposition-3901-4715-all253-review-pilot.json', 'exactSourceSentence', 'category'],
];
const seen = new Set();
const categories = {};
const errors = [];
for (const [path, sentenceKey, categoryKey] of reports) {
  for (const row of readJson(path).rows) {
    const ordinal = row.sourceOrdinal;
    const source = sourceById.get(row.sourceId);
    if (seen.has(ordinal)) errors.push(`${ordinal}: duplicate triage row`);
    seen.add(ordinal);
    if (!held.has(ordinal)) errors.push(`${ordinal}: no longer a current hold`);
    if (!source || source.example !== row[sentenceKey]) errors.push(`${ordinal}: source sentence mismatch`);
    const category = row[categoryKey];
    if (!category) errors.push(`${ordinal}: missing category`);
    categories[category] = (categories[category] ?? 0) + 1;
    if (row.approvedExclusion === true || row.approvedAlias === true || row.approvedNewOwner === true)
      errors.push(`${ordinal}: read-only report claims approval`);
  }
}
for (const ordinal of held.keys()) if (!seen.has(ordinal)) errors.push(`${ordinal}: missing triage row`);
const result = {currentHolds: held.size, triageRows: seen.size, reports: reports.length, categories, errorCount: errors.length, errors};
console.log(JSON.stringify(result));
if (errors.length) process.exitCode = 1;
