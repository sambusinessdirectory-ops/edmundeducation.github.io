import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

global.window = {};
await import(path.resolve('paper3/2013-b2/super-curation-data-file-data.js'));
const model = window.EDMUND_2013_B2_DATA_FILE;
const esc = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
assert.equal(model.contentVersion, '2013-b2-stage4-v3-v4-source-rebuilt');
assert.equal(model.steps.length, 207);
assert.equal(new Set(model.steps.map(item => item.id)).size, 207);
assert.deepEqual(model.analysisSource.pageUnitCounts, {5:24,6:17,7:21,8:35,9:43,10:38,11:29});
assert.ok(model.steps.every(item => item.sourceLine && item.excerpt && item.chinese && item.type && item.decision && Object.values(item.analysis).length === 4 && Object.values(item.analysis).every(Boolean) && Object.values(item.analysisLabels).length === 4 && Object.values(item.analysisLabels).every(Boolean) && /^[a-f0-9]{64}$/.test(item.authoredBlockSha256)));
const rows = model.steps.map(item => `| ${item.order} | \`${item.id}\` | ${item.page} | ${item.sourceLine} | ${esc(item.sourcePhrase)} | ${item.task || '—'} | ${esc(item.type)} | ${esc(item.decision)} | \`${item.authoredBlockSha256}\` | \`paper3/2013-b2/super-curation-data-file-data.js\` |`);
const output = `# 2013 B2 Super Curation — Stage 4 Source Mapping\n\n- Release: \`${model.contentVersion}\`\n- Authored source: \`${model.analysisSource.file}\`\n- Authored source SHA-256: \`${model.analysisSource.sha256}\`\n- Included authored fact-file units: **${model.steps.length} / ${model.steps.length}**\n- Explicitly excluded sections: Situation, Contents page, Podcast/Track 7 and Track 8, and the boss letter/Casey email already taught in Stages 1–3\n- Data File pages: **5–11**\n- Page-unit counts: **5:24 · 6:17 · 7:21 · 8:35 · 9:43 · 10:38 · 11:29**\n- Evidence-bank entries: **${model.steps.filter(item => item.bank).length}**\n- Stage 5 content: **none**\n\nEvery row retains the complete authored clause-level unit: excerpt or visual observation, Chinese rendering, type, answer decision, exact field labels, and all four analysis subsections. The source line and block SHA-256 point to the user-authored Markdown; the exact highlight phrase points to the reconstructed 2013 source document.\n\n| # | Stable step ID | Data File page | Authored source line | Exact highlighted phrase | Task | Authored type | Authored answer decision | Authored block SHA-256 | Implementation file |\n|---:|---|---:|---:|---|:---:|---|---|---|---|\n${rows.join('\n')}\n`;
const outputs = [path.resolve('tools/paper3/2013_B2_STAGE4_SOURCE_MAPPING.md'), path.resolve('docs/paper3/2013_B2_STAGE4_SOURCE_MAPPING.md')];
for (const outputPath of outputs) fs.writeFileSync(outputPath, output);
console.log(JSON.stringify({outputs, steps:model.steps.length, bank:model.steps.filter(item => item.bank).length}, null, 2));
