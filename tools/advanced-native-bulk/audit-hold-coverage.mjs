import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const contentRoot = resolve(root, 'course-materials/advanced-native');
const decisionRoot = resolve(contentRoot, 'books10-16');
const reviewRoot = resolve(contentRoot, 'reviews-books10-16');
const readJsonl = path => readFileSync(path, 'utf8').trim().split('\n').map(line => JSON.parse(line));
const reports = readdirSync(reviewRoot)
  .filter(name => /^hold-editorial-independent-audit-\d+-\d+-b\.json$/.test(name))
  .sort();
const decisionFiles = readdirSync(decisionRoot)
  .filter(name => /^editorial-decisions-\d+-\d+\.jsonl$/.test(name))
  .sort();
const source = readJsonl(resolve(decisionRoot, 'source-inventory.jsonl'));
const decisions = decisionFiles.flatMap(name => readJsonl(resolve(decisionRoot, name)));
const audited = new Map();
const errors = [];
const supplementalOwnerReviews = [
  {name: 'independent-owner-comparison-3413-3672-b.json', ordinal: 3672, actionField: 'recommendedAction'},
  {name: 'independent-ai-owner-comparison-3703-vs-568-b.json', ordinal: 3703, actionField: 'recommendation'},
];

for (const name of reports) {
  const report = JSON.parse(readFileSync(resolve(reviewRoot, name), 'utf8'));
  if (report.items.length !== report.counts.holdRows) errors.push(`${name}: item/count mismatch`);
  for (const item of report.items) {
    const ordinal = item.sourceOrdinal ?? item.ordinal;
    if (audited.has(ordinal)) errors.push(`${name}: duplicate audited ordinal ${ordinal}`);
    const expectedId = source[ordinal - 2112]?.sourceId;
    if (item.sourceId !== expectedId) errors.push(`${name}: source mismatch at ${ordinal}`);
    if (item.currentAction !== 'hold-editorial') errors.push(`${name}: audited item ${ordinal} was not held at review time`);
    audited.set(ordinal, name);
  }
}

const currentHolds = decisions.filter(row => row.action === 'hold-editorial');
const supplementalOrdinals = new Set();
for (const spec of supplementalOwnerReviews) {
  const review = JSON.parse(readFileSync(resolve(reviewRoot, spec.name), 'utf8'));
  const supportsHold = spec.actionField === 'recommendedAction'
    ? review.recommendedAction === 'hold-editorial' && review.recommendedCanonicalId === null
    : String(review.recommendation).includes('Hold the proposed-new row');
  if (!supportsHold || review.sourceId !== source[spec.ordinal - 2112]?.sourceId || (review.sourceOrdinal ?? review.provisionalSourceOrdinal) !== spec.ordinal) errors.push(`${spec.name}: supplemental review does not support the source/action`);
  supplementalOrdinals.add(spec.ordinal);
}
const newlyHeldReviewed = currentHolds.filter(row => !audited.has(row.sourceOrdinal) && supplementalOrdinals.has(row.sourceOrdinal));
for (const row of currentHolds) {
  if (!audited.has(row.sourceOrdinal) && !newlyHeldReviewed.some(item => item.sourceOrdinal === row.sourceOrdinal)) errors.push(`Current hold ${row.sourceOrdinal} lacks independent audit`);
}
if (reports.length !== 5) errors.push(`Expected five complete hold-audit ranges, found ${reports.length}`);
if (audited.size !== 966) errors.push(`Expected 966 original held entries, found ${audited.size}`);
if (decisions.length !== source.length) errors.push('Decision/source row counts differ');

const result = {
  reportFiles: reports.length,
  originallyAuditedHolds: audited.size,
  currentHolds: currentHolds.length,
  provisionallyReclassified: audited.size - currentHolds.filter(row => audited.has(row.sourceOrdinal)).length,
  newlyHeldReviewed: newlyHeldReviewed.length,
  unauditedCurrentHolds: currentHolds.filter(row => !audited.has(row.sourceOrdinal) && !newlyHeldReviewed.some(item => item.sourceOrdinal === row.sourceOrdinal)).length,
  errorCount: errors.length,
  errors,
};
console.log(JSON.stringify(result));
if (errors.length) process.exitCode = 1;
