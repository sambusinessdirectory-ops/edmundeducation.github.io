import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

global.window = {};
await import(path.resolve('paper3/2013-b2/super-curation-data-file-data.js'));
const model = window.EDMUND_2013_B2_DATA_FILE;
const esc = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
assert.equal(model.contentVersion, '2013-b2-stage4-v2-full-analysis');
assert.equal(model.steps.length, 59);
assert.equal(new Set(model.steps.map(item => item.id)).size, 59);
assert.ok(model.steps.every(item => item.sourceLine && item.excerpt && item.chinese && item.type && item.decision && Object.values(item.analysis).every(Boolean)));
const rows = model.steps.map(item => `| ${item.order} | \`${item.id}\` | ${item.page} | ${item.sourceLine} | ${esc(item.sourcePhrase)} | ${item.task || '—'} | ${esc(item.type)} | ${esc(item.decision)} | \`paper3/2013-b2/super-curation-data-file-data.js\` |`);
const output = `# 2013 B2 Super Curation — Stage 4 Source Mapping\n\n- Release: \`${model.contentVersion}\`\n- Authored source: \`${model.analysisSource.file}\`\n- Authored source SHA-256: \`${model.analysisSource.sha256}\`\n- Included authored fact-file units: **${model.steps.length} / 59**\n- Excluded as already curated: **${model.analysisSource.excludedAlreadyCuratedUnits}** units (Situation/Boss Letter, listening sheet/answer frames, and Podcast)\n- Data File pages: **5–11**\n- Evidence-bank entries: **${model.steps.filter(item => item.bank).length}**\n- Stage 5 content: **none**\n\nEvery row retains the authored excerpt/visual observation, Chinese rendering, type, answer decision and all four analysis subsections. The source line points to the user-authored Markdown; the exact highlight phrase points to the reconstructed 2013 source document.\n\n| # | Stable step ID | Data File page | Authored source line | Exact highlighted phrase | Task | Authored type | Authored answer decision | Implementation file |\n|---:|---|---:|---:|---|:---:|---|---|---|\n${rows.join('\n')}\n`;
const outputs = [path.resolve('tools/paper3/2013_B2_STAGE4_SOURCE_MAPPING.md'), path.resolve('docs/paper3/2013_B2_STAGE4_SOURCE_MAPPING.md')];
for (const outputPath of outputs) fs.writeFileSync(outputPath, output);
console.log(JSON.stringify({outputs, steps:model.steps.length, bank:model.steps.filter(item => item.bank).length}, null, 2));
