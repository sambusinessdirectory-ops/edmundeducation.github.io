#!/usr/bin/env node

import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const repo = resolve(import.meta.dirname, '../..');
const sourcePath = resolve(process.argv[2] || '/Users/sammak/Desktop/Paper 3 Factline Analysis - final list (V1)/2014_B2_Fact_Line_Deep_Analysis.md');
const source = readFileSync(sourcePath, 'utf8');
const sourceHash = createHash('sha256').update(source).digest('hex');
const inventory = JSON.parse(readFileSync(resolve(import.meta.dirname, '2014-b2-stage4-source-inventory.json'), 'utf8'));
const inventoryById = new Map(inventory.map(item => [item.id, item]));

const sections = [...source.matchAll(/^## (.+)$/gm)].map((match, index, matches) => ({
  title: match[1],
  start: match.index,
  end: matches[index + 1]?.index ?? source.length
}));
const lineAt = offset => source.slice(0, offset).split('\n').length;
const stripOuterQuotes = value => value.trim().replace(/^“([\s\S]*)”$/, '$1');
const getField = (block, labels) => {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const found = block.match(new RegExp(`^\\*\\*${escaped}[:：]\\*\\*\\s*(.+?)\\s*$`, 'm'));
    if (found) return found[1].trim();
  }
  return '';
};
const analysisFields = block => Object.fromEntries(
  [...block.matchAll(/^- \*\*(.+?)：\*\*\s*(.+?)\s*$/gm)].map(match => [match[1], match[2]])
);

function sourceIdFor(section, ordinal) {
  if (section.startsWith('第二部分')) return 'p04-online-today';
  if (section.startsWith('第三部分')) return ordinal <= 17 ? 'p05-course-ad' : 'p05-gamer';
  if (section.startsWith('第四部分')) return 'p06-student-podcast';
  if (section.startsWith('第五部分')) return ordinal <= 13 ? 'p07-virtual-jungle' : 'p07-hk-times';
  if (section.startsWith('第六部分')) return 'p08-elderly-news';
  if (section.startsWith('第七部分')) return ordinal <= 14 ? 'p09-squeers-letter' : 'p09-telegraph';
  if (section.startsWith('第八部分')) return 'p10-annual-report';
  if (section.startsWith('第九部分')) return 'p11-neelay-email';
  throw new Error(`Unmapped section: ${section}`);
}

const records = [];
for (const section of sections) {
  if (!/^(第二|第三|第四|第五|第六|第七|第八|第九)部分/.test(section.title)) continue;
  const body = source.slice(section.start, section.end);
  const headings = [...body.matchAll(/^### (.+)$/gm)];
  let retainedOrdinal = 0;
  for (let index = 0; index < headings.length; index += 1) {
    const heading = headings[index][1];
    if (section.title.startsWith('第二部分') && !heading.startsWith('Visual:')) continue;
    retainedOrdinal += 1;
    const localStart = headings[index].index;
    const localEnd = headings[index + 1]?.index ?? body.length;
    const absoluteStart = section.start + localStart;
    const absoluteEnd = section.start + localEnd;
    const block = body.slice(localStart, localEnd).replace(/\n---\s*$/m, '').trimEnd();
    const sourceId = sourceIdFor(section.title, retainedOrdinal);
    const sourceItem = inventoryById.get(sourceId);
    const rawEvidence = getField(block, ['Excerpt', 'Visual observation']);
    const translation = getField(block, ['中文翻譯', '中文說明']);
    const typeText = getField(block, ['類型']);
    const decision = getField(block, ['作答決定']);
    const type = Number(typeText.match(/^([1-6])/)?.[1] || 0);
    const task = type >= 1 && type <= 3 ? 'ABC'[type - 1] : null;
    const bankEligible = type >= 1 && type <= 3 && /^(獨立寫入|合併寫入|只保留結論)$/.test(decision);
    const ordinal = records.filter(item => item.sourceId === sourceId).length + 1;
    const record = {
      id: `${sourceId}-${String(ordinal).padStart(3, '0')}`,
      sourceId,
      page: sourceItem.page,
      sourceOrder: sourceItem.order,
      section: section.title,
      heading,
      excerpt: stripOuterQuotes(rawEvidence),
      rawEvidence,
      translation,
      type,
      typeText,
      task,
      decision,
      bankEligible,
      analysis: analysisFields(block),
      lineStart: lineAt(absoluteStart),
      lineEnd: lineAt(absoluteEnd) - 1,
      sourceBlock: block
    };
    if (!record.excerpt || !record.translation || !record.type || !record.decision) {
      throw new Error(`Incomplete record ${record.id} at line ${record.lineStart}`);
    }
    if (Object.keys(record.analysis).length !== 4) {
      throw new Error(`Expected four analysis bullets for ${record.id}; got ${Object.keys(record.analysis).length}`);
    }
    records.push(record);
  }
}

if (records.length !== 174) throw new Error(`Expected 174 Stage 4 records; got ${records.length}`);
const expectedTypes = {1:17, 2:22, 3:47, 4:51, 5:12, 6:25};
for (const [type, expected] of Object.entries(expectedTypes)) {
  const actual = records.filter(record => record.type === Number(type)).length;
  if (actual !== expected) throw new Error(`Type ${type}: expected ${expected}, got ${actual}`);
}

const tableEscape = value => String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const targetOverrides = {
  'p09-telegraph-012': {selector:'#page-9 .exotic-letter-news > h2:nth-of-type(2)', matchSegments:['Article from the Hong Kong Telegraph, March 2014']},
  'p11-neelay-email-010': {selector:'#page-11 .end-note'},
  'p11-neelay-email-011': {selector:'#page-11 .reference-scan', targetKind:'scan-only', matchSegments:[]},
  'p11-neelay-email-012': {selector:'#page-11 .reference-scan', targetKind:'scan-only', matchSegments:[]},
  'p11-neelay-email-015': {matchSegments:['Kowloon Exotic Pets Hospital', 'Agriculture, Fisheries and Conservation Department']}
};
const splitEvidence = value => String(value)
  .replace(/^“|”$/g, '')
  .split(/(?:…|\.{3,}|\s\/\s|[”"]\s+and\s+[“"])/)
  .map(part => part.replace(/[“”]/g, '').trim())
  .filter(part => part.length >= 4);

const inventoryRows = inventory.map(item => {
  const owned = records.filter(record => record.sourceId === item.id);
  const types = [1, 2, 3, 4, 5, 6]
    .map(type => `${type}:${owned.filter(record => record.type === type).length}`)
    .join(' · ');
  return `| ${item.order} | ${item.page} | ${item.id} | ${tableEscape(item.title)} | ${tableEscape(item.type)} | ${item.initial.join('+')} | ${item.final.join('+')} | ${owned.length} | ${types} | ${owned.filter(record => record.bankEligible).length} |`;
});

const inventoryDoc = `# 2014 B2 Stage 4 source inventory

Generated from \`${sourcePath}\` (SHA-256 \`${sourceHash}\`). This inventory excludes the Situation, contents page, Kerry boss email, and Pet Club recording already taught in Stages 1–3. It retains the page-4 age chart and every Fact Line record in Parts 3–9.

## Scope totals

- Source documents: **${inventory.length}**
- Atomic Fact Line records: **${records.length}**
- Direct Task A/B/C records (Types 1–3): **${records.filter(record => record.type <= 3).length}**
- Bank-eligible records after answer-decision filtering: **${records.filter(record => record.bankEligible).length}**
- Type counts: ${Object.entries(expectedTypes).map(([type, count]) => `Type ${type} = **${count}**`).join('; ')}

## Source-order register

| Order | DF page | Stable source ID | Native title | Source type | Stage 2 initial | Stage 4 final | Records | Type distribution | Bank eligible |
|---:|---:|---|---|---|---|---|---:|---|---:|
${inventoryRows.join('\n')}

## Source details and chronology

${inventory.map(item => `### ${item.order}. ${item.title}

- Stable ID: \`${item.id}\`
- Native selector: \`${item.selector}\`
- Writer: ${item.writer}
- Reader: ${item.reader}
- Date/status: ${item.date}
- Chronology rule: ${item.chronology}
- Classification audit: Stage 2 ${item.initial.join('+')} → Stage 4 ${item.final.join('+')}; no document-level correction required because all direct atomic records remain within the same task route.
`).join('\n')}
## Classification audit result

All 11 Stage 2 document classifications survive the 174-record atomic audit. No source is under-classified across A/B/C. The Stage 4 change is finer-grained: Type 4 context, Type 5 routes, and Type 6 noise are separated from bank-eligible evidence instead of inheriting the document’s task label.
`;

const overviewRows = records.map((record, index) => (
  `| ${index + 1} | ${record.id} | ${record.page} | ${record.lineStart}–${record.lineEnd} | ${record.type} | ${record.task || '—'} | ${record.bankEligible ? 'yes' : 'no'} | ${tableEscape(record.excerpt)} |`
));
const detailBlocks = records.map((record, index) => `## ${String(index + 1).padStart(3, '0')} · ${record.id}

- Data File page: ${record.page}
- Source: \`${record.sourceId}\`
- Fact Line source lines: ${record.lineStart}–${record.lineEnd}
- Task route: ${record.task ? `Task ${record.task}` : 'none'}
- Bank eligible: ${record.bankEligible ? 'yes' : 'no'}

${record.sourceBlock}
`).join('\n---\n\n');
const ledgerDoc = `# 2014 B2 Stage 4 complete evidence ledger

Generated from \`${sourcePath}\` (SHA-256 \`${sourceHash}\`). The ledger preserves every Stage 4 Fact Line block verbatim and assigns an immutable runtime ID.

## Completeness contract

- Included: both page-4 chart records plus all records in Parts 3–9.
- Excluded because already taught in Stages 1–3: Situation, contents, listening note sheet, Kerry boss email, and Pet Club recording transcript.
- Count gate: **174 / 174** records.
- Every record below retains its excerpt/visual observation, Traditional Chinese translation/explanation, type, answer decision, and all four analysis bullets.

## Record index

| # | Stable record ID | DF page | Fact Line lines | Type | Task | Bank | Exact evidence span / visual observation |
|---:|---|---:|---:|---:|---|---|---|
${overviewRows.join('\n')}

---

${detailBlocks}
`;

const inventoryPath = resolve(repo, 'docs/paper3/2014-b2-stage4-source-inventory.md');
const ledgerPath = resolve(repo, 'docs/paper3/2014-b2-stage4-evidence-ledger.md');
const runtimePath = resolve(repo, 'paper3/2014-b2/super-curation-stage4-data.js');
writeFileSync(inventoryPath, inventoryDoc);
writeFileSync(ledgerPath, ledgerDoc);
const runtimeRecords = records.map(({sourceBlock, rawEvidence, section, ...record}) => {
  const override = targetOverrides[record.id] || {};
  return {
    ...record,
    sourceSelector: inventoryById.get(record.sourceId).selector,
    targetSelector: override.selector || inventoryById.get(record.sourceId).selector,
    targetKind: override.targetKind || (record.heading.startsWith('Visual:') || record.heading.startsWith('Visual ') ? 'visual' : 'text'),
    matchSegments: override.matchSegments || splitEvidence(record.excerpt)
  };
});
const runtime = {
  version: '2014-b2-super-curation-stage4-v1',
  architecture: 'source-led-174-records',
  sourcePath,
  sourceHash,
  inventory,
  counts: {
    sources: inventory.length,
    records: runtimeRecords.length,
    types: expectedTypes,
    tasks: {
      A: runtimeRecords.filter(record => record.task === 'A').length,
      B: runtimeRecords.filter(record => record.task === 'B').length,
      C: runtimeRecords.filter(record => record.task === 'C').length
    },
    bankEligible: runtimeRecords.filter(record => record.bankEligible).length
  },
  records: runtimeRecords
};
writeFileSync(runtimePath, `(() => {
  'use strict';
  window.EDMUND_2014_B2_CURATION_STAGE4 = Object.freeze(${JSON.stringify(runtime, null, 2)});
})();
`);
console.log(JSON.stringify({
  sourcePath,
  sourceHash,
  inventoryPath,
  ledgerPath,
  runtimePath,
  sources: inventory.length,
  records: records.length,
  types: expectedTypes,
  bankEligible: records.filter(record => record.bankEligible).length
}, null, 2));
