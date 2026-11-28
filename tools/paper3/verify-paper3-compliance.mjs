import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const posix = value => value.split(path.sep).join('/').replace(/^\.\//, '');
const absolute = relative => path.join(root, relative);
const read = relative => fs.readFileSync(absolute(relative), 'utf8');
const exists = relative => fs.existsSync(absolute(relative));
const fail = message => { throw new Error(`Paper 3 compliance: ${message}`); };

const ledgerPath = 'tools/paper3/paper3-compliance.json';
const reportPath = 'docs/paper3/PAPER3_COMPLIANCE_REPORT.md';
const lineByLinePath = '2025_B2_Super_Curation_Line_by_Line.md';
const ledger = JSON.parse(read(ledgerPath));
const report = read(reportPath);
const agents = read('AGENTS.md');

if (ledger.schemaVersion !== 1) fail('unsupported ledger schemaVersion');
if (!ledger.revision || ledger.report !== reportPath) fail('ledger revision/report is invalid');
if (!report.includes(`Compliance revision: \`${ledger.revision}\``)) fail('report revision does not match the ledger');

for (const phrase of [
  'Before modifying any Paper 3 implementation',
  'read the applicable Golden Manual requirements',
  'inspect `2025_B2_Super_Curation_Line_by_Line.md`',
  'examine the corresponding actual 2025 source code',
  'inspect the reference implementation rather than invent or simplify',
  'traceable implementation evidence and verification before being marked complete'
]) {
  if (!agents.includes(phrase)) fail(`AGENTS.md is missing mandatory rule text: ${phrase}`);
}

const references = new Map();
for (const reference of ledger.requiredReferences || []) {
  if (!reference.id || !reference.path || !reference.status) fail('a required reference is incomplete');
  if (references.has(reference.id)) fail(`duplicate reference ID ${reference.id}`);
  references.set(reference.id, reference);
  const present = exists(reference.path);
  if (reference.status === 'available' && !present) fail(`${reference.id} is marked available but ${reference.path} is missing`);
  if (reference.status === 'missing' && present) fail(`${reference.id} is present but the ledger still marks it missing`);
}
const lineReference = [...references.values()].find(item => item.path === lineByLinePath);
if (!lineReference?.requiredForImplementation) fail('the 2025 line-by-line source is not a required implementation reference');

const workflowHooks = [
  '.github/workflows/paper3-compliance.yml',
  '.github/workflows/pages-paper3-fast.yml',
  '.github/workflows/pages.yml'
];
for (const workflow of workflowHooks) {
  if (!exists(workflow)) fail(`mandatory workflow is missing: ${workflow}`);
  if (!read(workflow).includes('verify-paper3-compliance.mjs')) fail(`${workflow} does not run the compliance verifier`);
}

const args = process.argv.slice(2);
let changedFiles = [];
if (args.length) {
  if (args.length !== 2 || args[0] !== '--changed-files') fail('usage: verify-paper3-compliance.mjs [--changed-files <path-list>]');
  if (!fs.existsSync(args[1])) fail(`changed-files list not found: ${args[1]}`);
  changedFiles = fs.readFileSync(args[1], 'utf8').split(/\r?\n/).map(posix).filter(Boolean);
  for (const file of changedFiles) {
    if (path.posix.isAbsolute(file) || file.split('/').includes('..')) fail(`unsafe changed path: ${file}`);
  }
}

const rootImplementation = /^(?:dse-paper3-|paper3-).+\.(?:html|css|js|mjs|cjs|json)$/;
const implementationHelpers = new Set([
  'tools/add-paper3-study-support.py',
  'tools/build-2023-b2-reader.py'
]);
const isImplementation = file => (
  (file.startsWith('paper3/') && !file.endsWith('.md') && !file.includes('/audit/')) ||
  rootImplementation.test(file) ||
  implementationHelpers.has(file)
);
const implementationChanges = [...new Set(changedFiles.filter(isImplementation))].sort();

if (implementationChanges.length) {
  if (!exists(lineByLinePath)) fail(`${lineByLinePath} is missing; Paper 3 implementation changes are blocked`);
  if (!changedFiles.includes(reportPath) || !changedFiles.includes(ledgerPath)) {
    fail(`implementation changes must update both ${reportPath} and ${ledgerPath}`);
  }
  if (lineReference.status !== 'available' || !lineReference.sha256) fail('the line-by-line reference must be marked available with a SHA-256 digest');
  const referenceDigest = crypto.createHash('sha256').update(fs.readFileSync(absolute(lineByLinePath))).digest('hex');
  if (referenceDigest !== lineReference.sha256) fail('the line-by-line reference digest is stale');

  const evidence = new Map();
  for (const item of ledger.implementationEvidence || []) {
    if (!item.id || !item.path) fail('an implementation evidence record is incomplete');
    if (evidence.has(item.path)) fail(`duplicate implementation evidence for ${item.path}`);
    evidence.set(posix(item.path), item);
  }
  for (const file of implementationChanges) {
    const item = evidence.get(file);
    if (!item) fail(`missing implementation evidence for ${file}`);
    if (item.status !== 'verified') fail(`${item.id} is not verified`);
    for (const key of ['requirementIds', 'goldenManualCitations', 'lineByLineCitations', 'verification']) {
      if (!Array.isArray(item[key]) || !item[key].length || item[key].some(value => !String(value).trim())) fail(`${item.id} has no ${key}`);
    }
    const expectedDigest = exists(file)
      ? crypto.createHash('sha256').update(fs.readFileSync(absolute(file))).digest('hex')
      : 'DELETED';
    if (item.sha256 !== expectedDigest) fail(`${item.id} has a stale SHA-256 digest for ${file}`);
    if (!report.includes(item.id)) fail(`the human compliance report does not cite ${item.id}`);
  }
}

console.log(`Paper 3 governance valid (${ledger.revision}); ${implementationChanges.length} implementation change(s) checked.`);
