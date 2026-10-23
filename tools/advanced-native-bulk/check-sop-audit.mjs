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
const holdCoverage = JSON.parse(execFileSync(process.execPath, [resolve(root, 'tools/advanced-native-bulk/audit-hold-coverage.mjs')], {
  cwd: root,
  encoding: 'utf8',
}));
const reconciliation = readFileSync(resolve(root, 'course-materials/advanced-native/books10-16/reconciliation-register.jsonl'), 'utf8')
  .trim().split(/\r?\n/).map(line => JSON.parse(line));

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
expect(holdCoverage.errorCount === 0 && holdCoverage.unauditedCurrentHolds === 0, 'Current editorial holds lack independent audit coverage');
expect(holdCoverage.currentHolds === report.provisionalEditorialTriage['hold-editorial'], 'Hold audit and decision counts disagree');

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

const triage = report.provisionalEditorialTriage;
const expectText = (section, text, message) => expect(section.includes(text), message);
const initialStates = reconciliation.reduce((counts, row) => {
  counts[row.state] = (counts[row.state] ?? 0) + 1;
  return counts;
}, {});
for (const [state, phrase] of [
  ['drafted-pending-review-audio-qa', 'drafted source occurrences'],
  ['new-phrase-authoring-pending', 'other first-use authoring candidates'],
  ['new-phrase-near-existing-review-pending', 'first-use near-prior candidates'],
  ['exact-existing-phrase-sense-review-pending', 'exact-prior occurrences'],
  ['repeat-in-new-source-sense-review-pending', 'remaining repeated-source occurrences'],
]) expectText(scope, `${formatted(initialStates[state] ?? 0)} ${phrase}`, `Initial reconciliation count is stale for ${state}`);
expectText(scope, `- New document: ${formatted(report.intakeRows)} source rows`, 'Source-row total is stale in the scope bullet');
expectText(scope, `- Draft set: ${report.pilotDrafts} independently AI-reviewed`, 'Selected draft total is stale in the scope bullet');
expectText(scope, `${formatted(report.pilotDrafts * 7)} steps, ${formatted(report.pilotQuestions)} assessed questions, ${formatted(report.pilotDrafts * 2)} writing examples and ${formatted(report.pilotAudioRequests)} required audio roles`, 'Draft component totals are stale in the scope bullet');
expectText(scope, `${triage['proposed-new-lesson']} proposed new lessons, ${triage['proposed-alias-existing']} proposed aliases to existing lessons, ${triage['proposed-alias-new']} proposed aliases within this document, and ${triage['hold-editorial']} wording`, 'Provisional triage counts are stale in the scope bullet');
expectText(scope, `${holdCoverage.provisionallyReclassified} of the earlier ${holdCoverage.originallyAuditedHolds} holds were provisionally reclassified`, 'Editorial-hold reclassification count is stale');
expectText(scope, `The remaining ${holdCoverage.currentHolds} are still tracked`, 'Remaining editorial-hold count is stale');
expectText(scope, '4,237 and 4,680', 'Historical hold-promotion source IDs changed');
expectText(audit, 'then-selected 342 writing examples', 'Historical 171-lesson writing audit scope changed');
expectText(scope, `All ${triage['proposed-alias-existing']} existing-owner links match full source sentences. Of ${triage['proposed-alias-new']} new-owner links`, 'Alias-owner counts are stale in the scope bullet');
expectText(audit, `Existing-owner alias audit reports ${triage['proposed-alias-existing']}/${triage['proposed-alias-existing']} full-source detector matches`, 'Existing-owner audit count is stale');
expectText(audit, `${formatted(report.existingCanonical - 10 + report.pilotDrafts)} authored records, 0 schema errors`, 'Combined imported-plus-draft record count is stale');

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else {
  console.log(`SOP audit matches ${report.intakeRows} source rows, ${report.editorialDecisionRows} provisional decisions, ${report.pilotDrafts} reviewed drafts, and all 55/20/30 checklist sections.`);
}
