import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const sourcePath = process.argv[2] || '/Users/sammak/Desktop/Paper 3 Factline Analysis - final list (V1)/2013_B2_Fact_Line_Deep_Analysis_v1.1_Congruence_Corrected_2026-11-12.md';
const outputPath = process.argv[3] || path.resolve('paper3/2013-b2/super-curation-data-file-data.js');
const mappingPath = process.argv[4] || path.resolve('docs/paper3/2013_B2_STAGE4_SOURCE_MAPPING.md');
const toolMappingPath = path.resolve('tools/paper3/2013_B2_STAGE4_SOURCE_MAPPING.md');

// The source line is the durable join key back to the user-authored deep analysis.
// The sequence follows the printed Data File (pages 5–11), not task order.
const MAPPING = [
  {line:1147,id:'data-analysis-p05-meeting-administration',page:5,sourceId:'doc-2013-editorial-minutes',phrase:'James Lee · Casey Wong · Mavis Lam · Vicki Swan',legacy:['data-p05-minutes-title','data-p05-present','data-p05-date','data-p05-venue','data-p05-confirmation']},
  {line:1130,id:'data-analysis-p05-issue-topics',page:5,sourceId:'doc-2013-editorial-minutes',phrase:'Three topics were decided: unusual travel and tourism, buying a new car and the benefits of evening classes.',legacy:['data-p05-topics','data-p05-main-focus']},
  {line:1162,id:'data-analysis-p05-writer-contact',page:5,sourceId:'doc-2013-editorial-minutes',phrase:'JL agreed to contact Tony Kwok and Queenie Lau and ask them to contribute articles for publication.',legacy:['data-p05-writers-contact','data-p05-guidelines-route']},
  {line:568,id:'data-analysis-p05-image-quantity',page:5,sourceId:'doc-2013-editorial-minutes',phrase:'writers should be encouraged to submit 15-20 images per article',legacy:['data-p05-images-submit','data-p05-images-select']},
  {line:675,id:'data-analysis-p05-deadline',page:5,sourceId:'doc-2013-editorial-minutes',phrase:'All agreed to set the deadline for 30th April.',legacy:['data-p05-deadline']},
  {line:692,id:'data-analysis-p05-writer-payment',page:5,sourceId:'doc-2013-editorial-minutes',phrase:'the payment to writers would be HKD 1000 per page',legacy:['data-p05-payment-rate','data-p05-payment-includes']},
  {line:1177,id:'data-analysis-p05-next-meeting',page:5,sourceId:'doc-2013-editorial-minutes',phrase:'The next meeting date was decided as 6th May to give the team time to read through any submitted articles.',legacy:['data-p05-next-meeting','data-p05-email-writers']},

  {line:583,id:'data-analysis-p06-image-format',page:6,sourceId:'doc-2013-writers-guidelines',phrase:'soft copy (high resolution JPEG file format)',legacy:['data-p06-guidelines-title','data-p06-to','data-p06-from','data-p06-effective-date','data-p06-on-time','data-p06-revision-purpose','data-p06-late','data-p06-image-format']},
  {line:598,id:'data-analysis-p06-image-source',page:6,sourceId:'doc-2013-writers-guidelines',phrase:'Writers should state the source of images.',legacy:['data-p06-copyright','data-p06-image-source']},
  {line:1192,id:'data-analysis-p06-writer-style',page:6,sourceId:'doc-2013-writers-guidelines',phrase:'Style of article to be decided by the writer, unless otherwise indicated by the editor.',legacy:['data-p06-word-route','data-p06-title-limit','data-p06-style']},
  {line:707,id:'data-analysis-p06-rights-payment',page:6,sourceId:'doc-2013-writers-guidelines',phrase:'Asia Life magazine retains the rights to any articles published.',legacy:['data-p06-rights','data-p06-payment']},

  {line:1209,id:'data-analysis-p07-review-metadata',page:7,sourceId:'doc-2013-queenie-review',phrase:'Vol 12 – June 2013',legacy:['data-p07-review-title','data-p07-issue','data-p07-reviewed-date','data-p07-writer','data-p07-topic','data-p07-reviewer']},
  {line:553,id:'data-analysis-p07-publication-decision',page:7,sourceId:'doc-2013-queenie-review',phrase:'Yes (with changes)',legacy:['data-p07-publish-changes']},
  {line:615,id:'data-analysis-p07-missing-title',page:7,sourceId:'doc-2013-queenie-review',phrase:'Title is missing!!',legacy:['data-p07-title-missing','data-p07-title-route'],routeTarget:'#doc-2013-writers-guidelines',routeLabel:'第 6 頁：標題最多 80 個字元'},
  {line:630,id:'data-analysis-p07-word-limit',page:7,sourceId:'doc-2013-queenie-review',phrase:'No. of words: 1200',legacy:['data-p05-word-limit','data-p07-current-words','data-p07-check-limit','data-p07-reduce-words'],routeTarget:'#doc-2013-editorial-minutes',routeLabel:'第 5 頁：本期文章上限 900 字'},
  {line:645,id:'data-analysis-p07-thai-place-spelling',page:7,sourceId:'doc-2013-queenie-review',phrase:'the spelling of Thai place names – she needs to check these carefully',legacy:['data-p07-spelling']},
  {line:660,id:'data-analysis-p07-factual-accuracy',page:7,sourceId:'doc-2013-queenie-review',phrase:'ask her if all the details in the article are accurate',legacy:['data-p07-accuracy']},
  {line:1224,id:'data-analysis-p07-direct-follow-up',page:7,sourceId:'doc-2013-queenie-review',phrase:'Follow this up with her directly.',legacy:['data-p07-images-route','data-p07-follow-directly']},

  {line:1241,id:'data-analysis-p08-programme-introduction',page:8,sourceId:'doc-2013-see-the-world',phrase:'We’ve all heard of student gap years',legacy:['data-p08-tv-title','data-p08-gap-years','data-p08-south-america','data-p08-culture-tourism']},
  {line:1256,id:'data-analysis-p08-sauri-location',page:8,sourceId:'doc-2013-see-the-world',phrase:'I’m in Kenya and I’m going to a small village called Sauri',legacy:['data-p08-sauri-purpose']},
  {line:1271,id:'data-analysis-p08-kemi-overall-view',page:8,sourceId:'doc-2013-see-the-world',phrase:'I’d say positive for Sauri on the whole.',legacy:['data-p08-kemi-role','data-p08-effect-question','data-p08-positive-overall','data-p08-ceci-reaction','data-p08-how-positive']},
  {line:850,id:'data-analysis-p08-practical-idea-exchange',page:8,sourceId:'doc-2013-see-the-world',phrase:'people are starting to share ideas with tourists',legacy:['data-p08-share-ideas','data-p08-practical-question']},
  {line:865,id:'data-analysis-p08-village-webpage',page:8,sourceId:'doc-2013-see-the-world',phrase:'helped us create a village webpage',legacy:['data-p08-yusuf-webpage','data-p08-web-information']},
  {line:880,id:'data-analysis-p08-published-local-stories',page:8,sourceId:'doc-2013-see-the-world',phrase:'wrote down some of the stories and helped us to get those published',legacy:['data-p08-writer-prompt','data-p08-jessica-name','data-p08-stories-published','data-p08-learn-traditions']},
  {line:895,id:'data-analysis-p08-culture-kept-alive',page:8,sourceId:'doc-2013-see-the-world',phrase:'tourism is helping you keep your culture alive',legacy:['data-p08-culture-alive']},

  {line:1288,id:'data-analysis-p09-immersion-definition',page:9,sourceId:'doc-2013-tourism-forum',phrase:'It’s when you go and live like a local person',legacy:['data-p09-forum-title','data-p09-immersion-query','data-p09-definition']},
  {line:927,id:'data-analysis-p09-culture-change-opinion',page:9,sourceId:'doc-2013-tourism-forum',phrase:'it changes the local culture',legacy:['data-p09-change-culture']},
  {line:1303,id:'data-analysis-p09-unfairness-opinion',page:9,sourceId:'doc-2013-tourism-forum',phrase:'Any kind of tourism is really unfair.',legacy:['data-p09-unfair']},
  {line:1318,id:'data-analysis-p09-self-esteem-speculation',page:9,sourceId:'doc-2013-tourism-forum',phrase:'That must really affect their self-esteem.',legacy:['data-p09-self-esteem']},
  {line:773,id:'data-analysis-p09-income-and-education',page:9,sourceId:'doc-2013-tourism-forum',phrase:'at least they have some money because tourists go to their countries',legacy:['data-p09-money','data-p09-education']},
  {line:942,id:'data-analysis-p09-mocking-and-throwing',page:9,sourceId:'doc-2013-tourism-forum',phrase:'Some tourists just laugh at the local people.',legacy:['data-p09-laugh','data-p09-throwing']},
  {line:957,id:'data-analysis-p09-over-dependence',page:9,sourceId:'doc-2013-tourism-forum',phrase:'the local people will start to over-depend on tourists and their money',legacy:['data-p09-overdepend']},
  {line:788,id:'data-analysis-p09-more-tourism-more-jobs',page:9,sourceId:'doc-2013-tourism-forum',phrase:'more tourism = more jobs!!',legacy:['data-p09-jobs','data-p09-job-easier']},
  {line:803,id:'data-analysis-p09-clean-water-projects',page:9,sourceId:'doc-2013-tourism-forum',phrase:'government projects to bring clean water into poor areas',legacy:['data-p09-government-money','data-p09-clean-water']},
  {line:1333,id:'data-analysis-p09-education-question',page:9,sourceId:'doc-2013-tourism-forum',phrase:'Do local people get education from tourism?',legacy:['data-p09-education-question','data-p09-not-sure']},
  {line:835,id:'data-analysis-p09-language-learning',page:9,sourceId:'doc-2013-tourism-forum',phrase:'the local people learn some things from tourists, like language',legacy:['data-p09-language','data-p09-english']},

  {line:1350,id:'data-analysis-p10-mei-authority',page:10,sourceId:'doc-2013-mei-interview',phrase:'Age = 97',legacy:['data-p10-mei-title','data-p10-mei-topic','data-p10-mei-age','data-p10-mei-father']},
  {line:1365,id:'data-analysis-p10-hotel-staff-rooms',page:10,sourceId:'doc-2013-mei-interview',phrase:'125 staff, 48 rooms',legacy:[]},
  {line:1380,id:'data-analysis-p10-second-world-war',page:10,sourceId:'doc-2013-mei-interview',phrase:'Used by Japanese army in 2nd World War',legacy:[]},
  {line:519,id:'data-analysis-p10-anniversary-and-spa',page:10,sourceId:'doc-2013-mei-interview',phrase:'100th Anniversary Ball planned for October 2013',legacy:['data-p10-anniversary','data-p10-spa']},
  {line:363,id:'data-analysis-p10-horse-and-carriage',page:10,sourceId:'doc-2013-mei-interview',phrase:'DH had stables for horses – like other hotels',legacy:['data-p10-stables','data-p10-carriage']},
  {line:534,id:'data-analysis-p10-taxi-pollution',page:10,sourceId:'doc-2013-mei-interview',phrase:'she doesn’t like taxis = pollution',legacy:['data-p10-taxi-pollution']},
  {line:410,id:'data-analysis-p10-servants-and-rooms',page:10,sourceId:'doc-2013-mei-interview',phrase:'DH had extra rooms for servants',legacy:['data-p10-richer','data-p10-servant-rooms','data-p10-servants']},
  {line:425,id:'data-analysis-p10-luggage-and-outfits',page:10,sourceId:'doc-2013-mei-interview',phrase:'Tourists used to have so much luggage!!',legacy:['data-p10-luggage','data-p10-outfits','data-p10-luggage-now']},
  {line:457,id:'data-analysis-p10-dancing-after-dinner',page:10,sourceId:'doc-2013-mei-interview',phrase:'Mei liked watching people dance after dinner',legacy:['data-p10-dancing']},
  {line:726,id:'data-analysis-p10-kevin-negative-position',page:10,sourceId:'doc-2013-kevin-letter',phrase:'the effects of tourism are increasingly negative',legacy:['data-p10-kevin-title','data-p10-salutation','data-p10-kevin-experience','data-p10-negative-position']},
  {line:741,id:'data-analysis-p10-uncontacted-tribe',page:10,sourceId:'doc-2013-kevin-letter',phrase:'they have decided to leave the tribes of people uncontacted',legacy:['data-p10-lost-tribe','data-p10-uncontacted','data-p10-guards']},
  {line:756,id:'data-analysis-p10-protecting-traditions',page:10,sourceId:'doc-2013-kevin-letter',phrase:'live immersed in their own traditions and without being negatively influenced by anyone from outside',legacy:['data-p10-agree','data-p10-traditions','data-p10-signoff','data-p10-signature']},

  {line:1397,id:'data-analysis-p11-historian-source',page:11,sourceId:'doc-2013-historian-blog',phrase:'Dr. Laurence Lieu is a Lecturer at the Department of History at Hong Kong Metropolitan University',legacy:['data-p11-blog-title','data-p11-authority','data-p11-book','data-p11-hunting-context']},
  {line:472,id:'data-analysis-p11-edgar-derby-tiger',page:11,sourceId:'doc-2013-historian-blog',phrase:'an American tourist, Mr. Edgar Derby, who shot this tiger in Lung Yeuk Tau, near Fanling in 1923',legacy:['data-p11-derby']},
  {line:502,id:'data-analysis-p11-tiger-photograph',page:11,sourceId:'doc-2013-historian-blog',phrase:'Edgar Derby, Lung Yeuk Tau, 1923',legacy:['data-p11-photo-caption'],sourceRoot:'#page-11 .historian-photo.tiger'},
  {line:487,id:'data-analysis-p11-north-american-tiger-hunters',page:11,sourceId:'doc-2013-historian-blog',phrase:'lots of tourists from North America used to come to Hong Kong in the 1920s to go tiger hunting in the New Territories',legacy:['data-p11-many-tourists']},
  {line:1412,id:'data-analysis-p11-successful-and-wild-boars',page:11,sourceId:'doc-2013-historian-blog',phrase:'none were as ‘successful’ as Mr. Derby',legacy:['data-p11-none-successful','data-p11-boars']},
  {line:440,id:'data-analysis-p11-room-price-comparison',page:11,sourceId:'doc-2013-historian-blog',phrase:'$10,300',legacy:['data-p11-stat-reaction','data-p11-room-1928','data-p11-room-2013'],sourceRoot:'#page-11 .table-scroll'},
  {line:378,id:'data-analysis-p11-rickshaw-licences',page:11,sourceId:'doc-2013-historian-blog',phrase:'3,243',legacy:['data-p11-rickshaw-1928','data-p11-rickshaw-2013','data-p11-rickshaw-popular'],sourceRoot:'#page-11 .table-scroll'},
  {line:1427,id:'data-analysis-p11-pity-and-anniversary',page:11,sourceId:'doc-2013-historian-blog',phrase:'A great pity they’ve gone.',legacy:['data-p11-gone','data-p11-anniversary']},
  {line:1051,id:'data-analysis-p11-room-price-visual-basis',page:11,sourceId:'doc-2013-historian-blog',phrase:'Approx. $10,300',legacy:[],sourceRoot:'#page-11 .table-scroll',focusSelector:'#page-11 .table-scroll'},
  {line:1066,id:'data-analysis-p11-dragon-hotel-photograph',page:11,sourceId:'doc-2013-historian-blog',phrase:'Dragon Hotel, 1920s',legacy:['data-p11-hotel-photo','data-p11-hotel-caption'],sourceRoot:'#page-11 .historian-photo.hotel'},
  {line:1081,id:'data-analysis-p11-data-file-boundary',page:11,sourceId:'doc-2013-historian-blog',phrase:'THIS IS THE LAST PAGE OF THE PART B2 DATA FILE',legacy:['data-p11-end','data-stage-complete'],sourceRoot:'#page-11',focusSelector:'#page-11 .source-end',final:true}
];

const text = fs.readFileSync(sourcePath, 'utf8');
const lines = text.split(/\r?\n/);
const units = new Map();
for (let index = 328; index < Math.min(lines.length, 1518); index += 1) {
  if (!lines[index].startsWith('### ')) continue;
  const start = index + 1;
  let end = index + 1;
  while (end < Math.min(lines.length, 1518) && !lines[end].startsWith('### ') && !lines[end].startsWith('## ') && !lines[end].startsWith('# ')) end += 1;
  const block = lines.slice(index, end);
  const value = label => {
    const row = block.find(line => line.startsWith(`**${label}`));
    return row ? row.replace(/^\*\*[^*]+\*\*\s*/, '').replace(/\s{2}$/, '') : '';
  };
  const bullet = label => {
    const row = block.find(line => line.startsWith(`- **${label}：**`));
    return row ? row.slice(row.indexOf('：**') + 3).trim() : '';
  };
  units.set(start, {
    sourceLine:start,
    title:block[0].slice(4).trim(),
    excerpt:value('Excerpt:') || value('Visual observation:'),
    chinese:value('中文翻譯：') || value('中文描述：'),
    type:value('類型：'),
    decision:value('作答決定：'),
    analysis:{
      meaning:bullet('這句在說甚麼'),
      use:bullet('這句有甚麼用'),
      rationale:bullet('為甚麼採用這個作答決定'),
      handling:bullet('答案可以怎樣處理')
    }
  });
}

assert.equal(MAPPING.length, 59, 'Stage 4 must contain the 59 authored fact-file analysis units');
assert.equal(new Set(MAPPING.map(item => item.id)).size, MAPPING.length, 'stable IDs must be unique');
const selectedLines = new Set(MAPPING.map(item => item.line));
for (const excludedLine of [333,348,395,818,910,972,987,1006,1021,1036,1100,1115,1444,1459,1474,1489,1504]) {
  assert.ok(!selectedLines.has(excludedLine), `excluded Boss/Podcast/already-curated unit leaked: ${excludedLine}`);
}

const steps = MAPPING.map((mapping, index) => {
  const authored = units.get(mapping.line);
  assert.ok(authored, `missing authored analysis at source line ${mapping.line}`);
  assert.ok(authored.excerpt && authored.chinese && authored.type && authored.decision, `incomplete authored fields at line ${mapping.line}`);
  assert.ok(Object.values(authored.analysis).every(Boolean), `incomplete four-part analysis at line ${mapping.line}`);
  const typeNumber = Number(authored.type.match(/^\d/)?.[0] || 6);
  const task = [1,2,3].includes(typeNumber) ? 'ABC'[typeNumber - 1] : null;
  const rejected = authored.decision.includes('不寫入答案');
  const bank = Boolean(task && !rejected && !authored.decision.includes('只用來判斷證據狀態') && !authored.decision.includes('只作指路') && !authored.decision.includes('只控制語氣'));
  return {
    id:mapping.id,
    order:index + 1,
    page:mapping.page,
    sourceId:mapping.sourceId,
    sourcePhrase:mapping.phrase,
    sourceRoot:mapping.sourceRoot || `#page-${mapping.page} .recreated-page`,
    focusSelector:mapping.focusSelector || '',
    routeTarget:mapping.routeTarget || '',
    routeLabel:mapping.routeLabel || '',
    legacyIds:mapping.legacy || [],
    task,
    evidenceType:typeNumber,
    bank,
    rejected,
    final:mapping.final === true,
    ...authored
  };
});

const sha256 = crypto.createHash('sha256').update(text).digest('hex');
const payload = {
  schemaVersion:2,
  contentVersion:'2013-b2-stage4-v2-full-analysis',
  analysisSource:{
    file:path.basename(sourcePath),
    sha256,
    includedRange:'329–1518',
    authoredUnits:76,
    includedFactFileUnits:59,
    excludedAlreadyCuratedUnits:17
  },
  steps,
  evidenceTypes:{1:'Task A 直接可用',2:'Task B 直接可用',3:'Task C 直接可用',4:'語義相關／背景',5:'視覺提示／來源導航',6:'不採用／行政／噪音'}
};

const js = `(() => {\n  'use strict';\n  const model = ${JSON.stringify(payload, null, 2)};\n  model.steps = Object.freeze(model.steps.map(step => Object.freeze({...step, analysis:Object.freeze(step.analysis), legacyIds:Object.freeze(step.legacyIds)})));\n  model.analysisSource = Object.freeze(model.analysisSource);\n  model.evidenceTypes = Object.freeze(model.evidenceTypes);\n  window.EDMUND_2013_B2_DATA_FILE = Object.freeze(model);\n})();\n`;
fs.writeFileSync(outputPath, js);

const esc = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const rows = steps.map(step => `| ${step.order} | \`${step.id}\` | ${step.page} | ${step.sourceLine} | ${esc(step.sourcePhrase)} | ${step.task || '—'} | ${esc(step.type)} | ${esc(step.decision)} | \`paper3/2013-b2/super-curation-data-file-data.js\` |`);
const mapping = `# 2013 B2 Super Curation — Stage 4 Source Mapping\n\n- Release: \`${payload.contentVersion}\`\n- Authored source: \`${payload.analysisSource.file}\`\n- Authored source SHA-256: \`${sha256}\`\n- Included authored fact-file units: **${steps.length} / 59**\n- Excluded as already curated: **17** units (Situation/Boss Letter, listening sheet/answer frames, and Podcast)\n- Data File pages: **5–11**\n- Evidence-bank entries: **${steps.filter(step => step.bank).length}**\n- Stage 5 content: **none**\n\nEvery row retains the authored excerpt/visual observation, Chinese rendering, type, answer decision and all four analysis subsections. The source line points to the user-authored Markdown; the exact highlight phrase points to the reconstructed 2013 source document.\n\n| # | Stable step ID | Data File page | Authored source line | Exact highlighted phrase | Task | Authored type | Authored answer decision | Implementation file |\n|---:|---|---:|---:|---|:---:|---|---|---|\n${rows.join('\n')}\n`;
fs.mkdirSync(path.dirname(mappingPath), {recursive:true});
fs.writeFileSync(mappingPath, mapping);
fs.writeFileSync(toolMappingPath, mapping);
console.log(JSON.stringify({ok:true, steps:steps.length, bank:steps.filter(step => step.bank).length, sha256, outputPath, mappingPath}, null, 2));
