import fs from 'node:fs';
import path from 'node:path';

global.window = {};
await import(path.resolve('paper3/2013-b2/super-curation-data-file-data.js'));
const model = window.EDMUND_2013_B2_DATA_FILE;
const sourcePath = path.resolve('paper3/2013-b2/super-curation-data-file-data.js');
const sourceLines = fs.readFileSync(sourcePath, 'utf8').split('\n');
const esc = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const rows = model.steps.map(item => {
  const shortId = item.id.replace(/^data-/, '');
  const line = sourceLines.findIndex(value => value.includes(`'${shortId}'`)) + 1;
  if (!line) throw new Error(`Implementation line not found for ${item.id}`);
  return `| ${item.order} | \`${item.id}\` | ${item.page} | \`${item.sourceId}\` | ${esc(item.sourcePhrase)} | ${item.task || '—'} | ${item.evidenceType} | ${item.bank ? '收錄' : (item.rejected ? '不採用' : '語境')} | \`paper3/2013-b2/super-curation-data-file-data.js:${line}\` |`;
});
const output = `# 2013 B2 Super Curation — Stage 4 Source Mapping\n\n- Release: \`${model.contentVersion}\`\n- Stable steps: **${model.steps.length}**\n- Data File pages: **5–11**\n- Evidence-bank entries: **${model.steps.filter(item => item.bank).length}**\n- Cross-page routes: **${model.steps.filter(item => item.routeTarget).length}**\n- Stage 5 content: **none**\n\nEvidence types: 1 = Task A usable; 2 = Task B usable; 3 = Task C usable; 4 = semantic/context/relationship; 5 = update/qualification/cross-page relationship; 6 = rejected/admin/noise. Exact phrases are copied from the reconstructed 2013 paper.\n\n| # | Stable step ID | 2013 Data File page | Source document ID | Exact source phrase | Task | Type | Bank decision | Implementation location |\n|---:|---|---:|---|---|:---:|---:|---|---|\n${rows.join('\n')}\n`;
const outputPath = path.resolve('docs/paper3/2013_B2_STAGE4_SOURCE_MAPPING.md');
fs.writeFileSync(outputPath, output);
console.log(JSON.stringify({output:outputPath, steps:model.steps.length, bank:model.steps.filter(item => item.bank).length}, null, 2));
