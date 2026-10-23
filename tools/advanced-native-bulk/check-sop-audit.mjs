import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const audit = readFileSync(resolve(root, 'course-materials/advanced-native/books10-16/GOLDEN_SOP_AUDIT_CHECKLIST.md'), 'utf8');
const report = JSON.parse(execFileSync(process.execPath, [resolve(root, 'tools/advanced-native-bulk/verify-books10-16.mjs')], {
  cwd: root,
  encoding: 'utf8',
}));

const errors = [];
const expect = (condition, message) => { if (!condition) errors.push(message); };
const formatted = number => Number(number).toLocaleString('en-US');
const scope = audit.split('## Scope and exact counts\n')[1]?.split('\n## Requirement-by-requirement register')[0] ?? '';
const gateIds = [...audit.matchAll(/^- \[[ x]\] \*\*([A-Z0-9]+\d\d) —/gm)].map(match => match[1]);
const steps = [...audit.matchAll(/^\d+\. \[[ x]\]/gm)];
const chapters = [...audit.matchAll(/^- \*\*Chapter \d+ —/gm)];

expect(gateIds.length === 55 && new Set(gateIds).size === 55, `Expected 55 unique gates, found ${gateIds.length}`);
expect(steps.length === 20, `Expected 20 production steps, found ${steps.length}`);
expect(chapters.length === 30, `Expected 30 chapter crosswalks, found ${chapters.length}`);
expect(audit.includes('**Release verdict: NOT APPROVED.**'), 'Audit must retain NOT APPROVED until every release gate passes');
expect(report.published === false && report.releaseApproved === false, 'Draft verifier unexpectedly reports publication or approval');

for (const [label, value] of [
  ['source rows', report.intakeRows],
  ['selected decision rows', report.editorialDecisionRows],
  ['proposed new lessons', report.provisionalEditorialTriage['proposed-new-lesson']],
  ['existing-owner aliases', report.provisionalEditorialTriage['proposed-alias-existing']],
  ['new-owner aliases', report.provisionalEditorialTriage['proposed-alias-new']],
  ['editorial holds', report.provisionalEditorialTriage['hold-editorial']],
  ['draft lessons', report.pilotDrafts],
  ['assessed questions', report.pilotQuestions],
  ['audio roles', report.pilotAudioRequests],
]) {
  expect(scope.includes(formatted(value)), `Scope is missing current ${label} count ${formatted(value)}`);
}
expect(scope.includes(report.projectedDisplayRange), `Scope is missing display range ${report.projectedDisplayRange}`);

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(`SOP audit matches ${report.intakeRows} source rows, ${report.editorialDecisionRows} provisional decisions, ${report.pilotDrafts} reviewed drafts, and all 55/20/30 checklist sections.`);
}
