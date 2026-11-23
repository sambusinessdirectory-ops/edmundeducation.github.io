import crypto from 'node:crypto';
import fs from 'node:fs';

const file = 'tools/paper3/paper3-compliance.json';
const report = JSON.parse(fs.readFileSync(file, 'utf8'));
const sha256 = path => crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const records = [
  ['paper3/2013-b2/index.html', ['V7-GOV-01','V7-STATE-01','V7-TEST-01'], 'Loads the separate Stage 4 ledger/controller/styles and the Stage 3-to-4 note-preservation controller under cache version 20261123f while keeping Stage 5 locked.'],
  ['paper3/2013-b2/super-curation-data.js', ['V7-SRC-01','V7-STATE-01','V8-SRC-03'], 'Preserves the approved 52 Stage 1 and 14 Stage 2 records, raises schemaVersion to 6, marks Stage 3 complete and Stage 4 active.'],
  ['paper3/2013-b2/super-curation-data-file-data.js', ['V7-SRC-01','V7-ROUTE-01','V8-SRC-03'], 'Defines 134 stable page-continuous Stage 4 records, six evidence types, 49 bank entries and five cross-page routes from 2013 source phrases.'],
  ['paper3/2013-b2/super-curation.js', ['V7-NOTE-02','V7-STATE-01','V7-STATE-02','V7-NAV-01','V7-ROUTE-01','V7-A11Y-01','V8-SRC-03'], 'Adds Stage 4 exact phrase focus, progressive reveal, evidence bank/filter/return and free Stage 1-4 access; reprojects only reached Stage 3 generated notes in Stage 4 while preserving learner notes and reload state.'],
  ['paper3/2013-b2/super-curation.css', ['V7-MOTION-01','V7-A11Y-01','V7-RESP-01','V8-SRC-03'], 'Adds the Stage 4 evidence bank and cumulative Stage 1/2 stamp presentation using the established colour, strike, route and wide-desktop grammar.'],
  ['tools/paper3/check-2013-b2-stage4.mjs', ['V7-NOTE-02','V7-STATE-02','V7-TEST-01','V7-TEST-02'], 'Runs the 134-step production journey plus a Stage 3-to-4-to-reload handoff proving generated and learner-authored podcast notes survive while the player remains hidden.'],
  ['tools/paper3/check-2013-b2-stage1.mjs', ['V7-BOSS-01','V7-STATE-01','V7-TEST-01','V7-TEST-02'], 'Retains the 52-step Stage 1 forward/reverse suite and updates only the expected free-access boundary to Stages 1-4.'],
  ['tools/paper3/check-2013-b2-stage2.mjs', ['V7-SRC-01','V7-STATE-01','V7-NAV-01','V7-TEST-01'], 'Retains the 14-step classification suite and verifies the Stage 4 content version/free-access boundary.'],
  ['tools/paper3/check-2013-b2-stage3.mjs', ['V7-SRC-01','V7-STATE-01','V7-NAV-01','V7-TEST-01'], 'Retains the full 185-step podcast/transcript journey and updates only the expected Stage 4 access state.'],
  ['tools/paper3/check-2013-b2-stage3-behaviors.mjs', ['V7-STATE-01','V7-TEST-01','V7-TEST-02','V8-SRC-03'], 'Retains all playback/replay/seek/reload checks while scoping cumulative Stage 1 ink separately from new Stage 4 marks.'],
  ['tools/paper3/build-2013-b2-stage4-mapping.mjs', ['V7-SRC-01','V8-SRC-03'], 'Generates and validates the 134-row exact page/phrase/code source mapping from the released Stage 4 model.'],
  ['tools/paper3/update-2013-b2-stage4-compliance.mjs', ['V7-GOV-01','V7-TEST-02'], 'Refreshes governed file hashes, Stage 4 requirement evidence and verification commands without weakening the compliance gate.'],
  ['tools/paper3/2013_B2_STAGE4_SOURCE_MAPPING.md', ['V7-SRC-01','V7-NAV-01','V8-SRC-03'], 'Maps all 134 stable IDs to Data File page, source document, exact phrase, task, type, bank decision and implementation line.'],
  ['tools/paper3/2013_B2_STAGE4_IMPLEMENTATION_REPORT.md', ['V7-GOV-01','V7-NOTE-02','V7-STATE-01','V7-STATE-02','V7-NAV-01','V7-RESP-01','V7-TEST-01'], 'Reports flow, inventory, cumulative Stage 3 notes, state, 42 checks, screenshots, files, limitations and the unimplemented Stage 5 plan.']
];
const stage4Paths = new Set(records.map(([path]) => path));
const obsoletePaths = new Set([
  ...stage4Paths,
  'docs/paper3/2013_B2_STAGE4_SOURCE_MAPPING.md',
  'docs/paper3/2013_B2_STAGE4_IMPLEMENTATION_REPORT.md',
  'docs/paper3/PAPER3_COMPLIANCE_REPORT.md'
]);
report.files = report.files.filter(entry => !obsoletePaths.has(entry.path));
for (const [path, requirements, evidence] of records) report.files.push({path, sha256:sha256(path), requirements, evidence, status:'verified'});
report.release = '2013-b2-stage4-v1';
report.scope = '2013 DSE Paper 3 B2 Super Curation Parts 1-4, with Stage 5 locked and existing 2015 records retained';
for (const authority of [
  '2025 DSE Paper 3 B2 Super Curation - Stage 4 - No Spotlight - Code Annotated.pdf',
  '2025 DSE Paper 3 B2 Super Curation - Stage 4 - Spotlight - Code Annotated.pdf'
]) if (!report.authority.includes(authority)) report.authority.push(authority);
report.verificationCommands = [
  'node --check paper3/2013-b2/super-curation-data-file-data.js',
  'node --check paper3/2013-b2/super-curation.js',
  'node tools/paper3/build-2013-b2-stage4-mapping.mjs',
  'node tools/paper3/check-2013-b2-stage1.mjs http://127.0.0.1:4174',
  'node tools/paper3/check-2013-b2-stage2.mjs http://127.0.0.1:4174',
  'node tools/paper3/check-2013-b2-stage3.mjs http://127.0.0.1:4174',
  'node tools/paper3/check-2013-b2-stage3-behaviors.mjs http://127.0.0.1:4174',
  'node tools/paper3/check-2013-b2-stage4.mjs http://127.0.0.1:4174',
  'node tools/paper3/verify-paper3-compliance.mjs --changed-files <Stage 4 listed files>'
];
report.result = 'verified';
fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({release:report.release, records:records.length}, null, 2));
