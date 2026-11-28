import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourceFile = process.argv[2] || '/Users/sammak/Desktop/Paper 3 Factline Analysis - final list (V1)/2016_B2_Paper3_Fact_Line_Line_by_Line_Deep_Analysis_V2.1_2026-11-12.md';
const markdown = fs.readFileSync(sourceFile, 'utf8').replace(/\r\n?/g, '\n');

const sources = [
  {key:'manual', block:11, page:4, title:'Staff manual on borrowing of items', rootSelector:'#page-4 .museum-manual', start:'# Analysis Block 11', end:'# Release Appendix', expectedTask:'A'},
  {key:'minutes', block:7, page:5, title:'Minutes from museum staff meeting', rootSelector:'#page-5 .museum-minutes', start:'# Analysis Block 7', end:'## How to use this analysis'},
  {key:'ip-email', block:5, page:6, title:'Email from Ip Lai Ping', rootSelector:'#page-6 .museum-email', start:'# Analysis Block 5', end:'# Analysis Block 6', expectedTask:'A'},
  {key:'whatsapp', block:6, page:7, title:'WhatsApp messages from the Social History Museum group', rootSelector:'#page-7 .museum-whatsapp', start:'# Analysis Block 6', end:'# Analysis Block 7'},
  {key:'resident-interview', block:3, page:8, title:'Transcript of interview with Wang Chung Village resident', rootSelector:'#page-8 .museum-interview', start:'# Analysis Block 3', end:'# Analysis Block 4', expectedTask:'B'},
  {key:'news-survey', block:4, page:9, title:'1983 newspaper article and visitor survey', rootSelector:'#page-9 .museum-news-survey', start:'# Analysis Block 4', end:'# Analysis Block 5'},
  {key:'oconnor-email', block:2, page:10, title:'Email from Ms O’Conner', rootSelector:'#page-10 .museum-email', start:'# Analysis Block 2', end:'# Analysis Block 3', expectedTask:'C'}
];

const clean = value => String(value || '').replace(/\s{2,}$/gm, '').trim();
const unquote = value => clean(value).replace(/^[“”"]|[“”"]$/g, '');
const slugify = value => unquote(value)
  .normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  .split('-').filter(Boolean).slice(0, 10).join('-') || 'visual-unit';
const digest = value => crypto.createHash('sha256').update(value).digest('hex').slice(0, 7);

function field(body, labels) {
  for (const label of labels) {
    const match = body.match(new RegExp(`\\*\\*${label.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}[:：]\\*\\*\\s*([^\\n]+)`));
    if (match) return clean(match[1].replace(/\\s{2,}$/g, ''));
  }
  return '';
}

function bullet(body, labels) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
    const match = body.match(new RegExp(`- \\*\\*${escaped}[:：]\\*\\*\\s*([\\s\\S]*?)(?=\\n- \\*\\*|\\n---|$)`));
    if (match) return clean(match[1]);
  }
  return '';
}

function taskFor(typeLabel, source) {
  if (/Task\s*8|任務\s*8/i.test(typeLabel)) return 'A';
  if (/Task\s*9|任務\s*9/i.test(typeLabel)) return 'B';
  if (/Task\s*10|任務\s*10/i.test(typeLabel)) return 'C';
  const type = Number(typeLabel.match(/^\s*(\d)/)?.[1] || 0);
  if (type === 1) return 'A';
  if (type === 2) return 'B';
  if (type === 3) return 'C';
  return source.expectedTask || null;
}

function matchParts(excerpt) {
  const original = unquote(excerpt);
  const parts = original
    .replace(/^Issue:\s*/i, '')
    .replace(/\[[^\]]+\]/g, ' ')
    .split(/\s+(?:\.{3}|…|\/)\s+|\s*→\s*/)
    .map(part => part.replace(/^Visual\s*[—-]\s*/i, '').trim())
    .filter(part => part.length >= 3);
  return parts.length ? parts : [original.replace(/[\[\]]/g, '').trim()].filter(Boolean);
}

function parseSource(source) {
  const start = markdown.indexOf(source.start);
  const end = markdown.indexOf(source.end, start + source.start.length);
  if (start < 0 || end < 0) throw new Error(`Could not find block boundaries for ${source.key}`);
  const slice = markdown.slice(start, end);
  const chunks = [...slice.matchAll(/^###\s+(.+)\n([\s\S]*?)(?=^###\s+|(?![\s\S]))/gm)];
  return chunks.map((match, index) => {
    const heading = clean(match[1]);
    const body = match[2];
    const visual = /^Visual\b/i.test(heading) || /\*\*Visual observation:|\*\*中文說明：/.test(body);
    const excerpt = field(body, visual ? ['Visual observation'] : ['Excerpt']) || unquote(heading);
    const translation = field(body, visual ? ['中文說明'] : ['中文翻譯']);
    const typeLabel = field(body, ['類型']);
    const decision = field(body, ['作答決定']);
    const type = Number(typeLabel.match(/^\s*(\d)/)?.[1] || 0);
    const task = taskFor(typeLabel, source);
    const idBase = `p4-${source.key}-${slugify(heading)}`;
    const id = `${idBase}-${digest(`${source.key}|${heading}|${excerpt}`)}`;
    const analysis = {
      meaning: bullet(body, visual ? ['圖像顯示甚麼', '這句在說甚麼'] : ['這句在說甚麼', '圖像顯示甚麼']),
      use: bullet(body, visual ? ['圖像有甚麼用', '這句有甚麼用'] : ['這句有甚麼用', '圖像有甚麼用']),
      rationale: bullet(body, ['為甚麼採用這個作答決定']),
      treatment: bullet(body, ['答案可以怎樣處理'])
    };
    const bankEligible = type >= 1 && type <= 3 && !/不寫入|只作指路|只控制語氣|只用來判斷/.test(decision);
    const status = type === 6 ? 'rejected' : bankEligible ? 'confirmed' : /只用來判斷|尚待|待批准/.test(`${decision} ${typeLabel}`) ? 'provisional' : type === 4 ? 'related' : 'context';
    return {
      id, ordinal:index + 1, sourceKey:source.key, sourceBlock:source.block, sourceTitle:source.title,
      page:source.page, sourcePage:`Data File p.${source.page}`, rootSelector:source.rootSelector,
      heading, excerpt, translation, type, typeLabel, decision, analysis, visual, task,
      bankEligible, status, matchParts:matchParts(visual ? '' : excerpt)
    };
  });
}

const records = sources.flatMap(parseSource).map((record, index) => ({...record, index}));
const ids = new Set(records.map(record => record.id));
if (ids.size !== records.length) throw new Error('Stage 4 stable IDs are not unique.');
for (const record of records) {
  const missing = ['translation','typeLabel','decision',...Object.keys(record.analysis).filter(key => !record.analysis[key])].filter(key => !record[key] && !record.analysis[key]);
  if (missing.length) throw new Error(`${record.id} is missing: ${missing.join(', ')}`);
}

const manifest = {
  version:'2016-b2-super-curation-stage4-v1', architectureVersion:'golden-manual-2025-b2-v8.2-stage4',
  storageKey:'edmund-2016-b2-super-curation-stage4-v1', generatedFrom:path.basename(sourceFile),
  generatedAt:'2026-11-28', sources:sources.map(({start,end,expectedTask,...source}) => source), records,
  excludedBlocks:[1,8,9,10], excludedContent:['podcast','Question-Answer Book','Data File cover/situation/contents/note sheet','Lara Gau instruction email'],
  taskLabels:{A:'回覆 Ms Ip 的電郵',B:'博物館網站介紹',C:'呈交 Museum Board 的報告主體'}
};

const auditDir = path.join(root, 'tools/paper3/2016-b2/audit');
const sourceDir = path.join(root, 'tools/paper3/2016-b2/source');
fs.mkdirSync(auditDir, {recursive:true});
fs.mkdirSync(sourceDir, {recursive:true});
fs.writeFileSync(path.join(auditDir, 'stage4-factline-records.json'), `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(path.join(sourceDir, 'super-curation-stage4-data.js'), `(() => {\n  'use strict';\n  window.EDMUND_2016_B2_CURATION_STAGE4 = ${JSON.stringify(manifest, null, 2)};\n})();\n`);

const docsDir = path.join(root, 'docs/paper3');
fs.mkdirSync(docsDir, {recursive:true});
const md = value => String(value ?? '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
const sourceInventory = `# 2016 B2 Super Curation — Stage 4 Source Inventory\n\nAuthoritative input: \`${path.basename(sourceFile)}\`\n\n| Order | Source | Page | Root selector | Fact-line records | Direct bank evidence |\n|---:|---|---:|---|---:|---:|\n${sources.map((source,index) => `| ${index + 1} | ${source.title} | ${source.page} | \`${source.rootSelector}\` | ${records.filter(record => record.sourceKey === source.key).length} | ${records.filter(record => record.sourceKey === source.key && record.bankEligible).length} |`).join('\n')}\n\nTotal: **${records.length}** fact-line/visual records; **${records.filter(record => record.bankEligible).length}** confirmed bank entries; **${records.filter(record => record.visual).length}** visual units.\n\nExcluded by the approved Stage 4 boundary: recording/podcast, Question-Answer Book task instructions and answer pages, Data File cover/situation/contents/note sheet, and Lara Gau's instruction email.\n`;
const routeAction = record => {
  if (record.sourceKey === 'minutes' && /according to policy a glass cover/i.test(record.heading)) return 'visit staff-manual policy; return';
  if (record.sourceKey === 'whatsapp' && /link to the transcript/i.test(record.heading)) return 'visit resident transcript; return';
  if (record.sourceKey === 'resident-interview' && /right door of the cupboard/i.test(record.heading)) return 'visit left-door correction; return';
  if (record.sourceKey === 'resident-interview' && /typhoon ellen in 1983/i.test(record.heading)) return 'visit contemporary news confirmation; return';
  if (record.sourceKey === 'minutes' && /results of the online survey/i.test(record.heading)) return 'visit full survey; return';
  if (record.sourceKey === 'whatsapp' && /opens the toilet door/i.test(record.heading)) return 'visit director approval; return';
  return '—';
};
const domTarget = record => record.visual
  ? (/survey table/i.test(record.heading) ? '#page-9 .survey-results-museum table' : /photograph/i.test(record.heading) ? '#page-7 .museum-whatsapp img' : '#page-7 .museum-bubble:last-child p[lang="en"]')
  : `${record.rootSelector} → exact scoped text range`;
const mapping = `# 2016 B2 Super Curation — Stage 4 Source Mapping\n\nEvery authoritative Stage 4 fact-line record maps to one stable runtime ID. Browser QA separately proves that all ${records.length} records resolve to exact native targets.\n\n## Causality boundaries\n\n- **Paper-specific evidence data:** \`tools/paper3/2016-b2/source/super-curation-stage4-data.js\` and the audit JSON define the 148 IDs, exact excerpts, classifications and analysis.\n- **Exact runtime causality:** \`resolveTarget\`, \`renderHighlights\`, \`renderBank\`, \`beginRoute\` and \`returnRoute\` in the Stage 4 controller resolve, reveal, bank and route those IDs.\n- **Stage-level shared infrastructure:** the existing rail, dock, help dialog, spotlight masks and route SVG are reused by ID; they do not uniquely execute for any single screenshot.\n- **Shared reader/UI code:** \`paper3/2016-b2/index.html\` supplies native source DOM; \`super-curation.css\` supplies shared and Stage 4 visual rules.\n\n| # | Stable ID | Source ID | Printed page | Reader page | Exact phrase / visual unit | DOM target | Task | Evidence type | Bank action | Detour / return | Implementation cause |\n|---:|---|---|---|---|---|---|:---:|---|---|---|---|\n${records.map(record => `| ${record.index + 1} | \`${record.id}\` | \`${record.sourceKey}\` | Data File p.${record.page} | \`#page-${record.page}\` | ${md(record.excerpt)} | \`${domTarget(record)}\` | ${record.task || '—'} | ${md(record.typeLabel)} | ${record.bankEligible ? `insert Task ${record.task} row on commit` : 'none'} | ${routeAction(record)} | Stage 4 data → \`resolveTarget/renderHighlights${record.bankEligible ? '/renderBank' : ''}\` |`).join('\n')}\n`;
const ledger = `# 2016 B2 Super Curation — Stage 4 Evidence Ledger\n\nThe ledger keeps provisional, related, contextual, rejected and confirmed evidence distinct. Only confirmed direct Task A/B/C entries are eligible for the writing bank.\n\n| # | Stable ID | Task | Status | Bank | Meaning | Treatment |\n|---:|---|:---:|---|:---:|---|---|\n${records.map(record => `| ${record.index + 1} | \`${record.id}\` | ${record.task || '—'} | ${record.status} | ${record.bankEligible ? 'yes' : 'no'} | ${md(record.analysis.meaning)} | ${md(record.analysis.treatment)} |`).join('\n')}\n`;
fs.writeFileSync(path.join(docsDir, '2016_B2_STAGE4_SOURCE_INVENTORY.md'), sourceInventory);
fs.writeFileSync(path.join(docsDir, '2016_B2_STAGE4_SOURCE_MAPPING.md'), mapping);
fs.writeFileSync(path.join(docsDir, '2016_B2_STAGE4_EVIDENCE_LEDGER.md'), ledger);

const counts = Object.fromEntries(sources.map(source => [source.key, records.filter(record => record.sourceKey === source.key).length]));
console.log(JSON.stringify({records:records.length, ids:ids.size, counts, bankEligible:records.filter(record => record.bankEligible).length, visual:records.filter(record => record.visual).length}, null, 2));
