import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const sourcePath = process.argv[2] || "/Volumes/(Pro-G) Sam's Data/CodexData/user-data/Documents/ChatGPT/Astra/output/md/2013_B2_Paper3_Complete_Clause_by_Clause_Fact_Line_Analysis_V4.0_SOURCE_REBUILT_2026-11-29.md";
const outputPath = process.argv[3] || path.resolve('paper3/2013-b2/super-curation-data-file-data.js');
const mappingPath = process.argv[4] || path.resolve('docs/paper3/2013_B2_STAGE4_SOURCE_MAPPING.md');
const toolMappingPath = path.resolve('tools/paper3/2013_B2_STAGE4_SOURCE_MAPPING.md');

// The source line is the durable join key back to the user-authored deep analysis.
// The sequence follows the printed Data File (pages 5–11), not task order.
const LEGACY_V2_STEPS = [
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
const sourceSha256 = crypto.createHash('sha256').update(text).digest('hex');

const fieldValue = (block, labels) => {
  for (const label of labels) {
    const row = block.find(line => line.startsWith(`**${label}**`));
    if (row) return row.replace(/^\*\*[^*]+\*\*\s*/, '').replace(/\s{2}$/, '');
  }
  return '';
};
const parseBullet = line => {
  const match = line.match(/^- \*\*(.+?)：\*\*\s*(.*)$/);
  return match ? {label:match[1], value:match[2].trim()} : null;
};

const authoredUnits = [];
let currentPage = 0;
let inIncludedDataFile = false;
for (let index = 0; index < lines.length; index += 1) {
  const pageHeading = lines[index].match(/^# Data File page (\d+)/);
  if (pageHeading) {
    currentPage = Number(pageHeading[1]);
    inIncludedDataFile = currentPage >= 5 && currentPage <= 11;
    continue;
  }
  if (inIncludedDataFile && lines[index].startsWith('# ') && !lines[index].startsWith('# Data File page ')) {
    inIncludedDataFile = false;
    continue;
  }
  if (!inIncludedDataFile || !lines[index].startsWith('### ')) continue;

  let end = index + 1;
  while (end < lines.length && !/^#{1,3} /.test(lines[end])) end += 1;
  const block = lines.slice(index, end);
  const bullets = block.map(parseBullet).filter(Boolean);
  const unparsed = block.slice(1).filter(line => {
    const trimmed = line.trim();
    return trimmed && trimmed !== '---' && trimmed !== '**分析：**' &&
      !trimmed.startsWith('**Excerpt:**') && !trimmed.startsWith('**Visual observation:**') &&
      !trimmed.startsWith('**中文翻譯：**') && !trimmed.startsWith('**中文說明：**') &&
      !trimmed.startsWith('**類型：**') && !trimmed.startsWith('**作答決定：**') &&
      !trimmed.startsWith('- **');
  });
  assert.deepEqual(unparsed, [], `unparsed authored content at source line ${index + 1}`);
  assert.equal(bullets.length, 4, `source line ${index + 1} must retain exactly four authored analysis lines`);

  const unit = {
    sourceLine:index + 1,
    page:currentPage,
    title:block[0].slice(4).trim(),
    visual:block[0].startsWith('### Visual element:'),
    excerpt:fieldValue(block, ['Excerpt:', 'Visual observation:']),
    chinese:fieldValue(block, ['中文翻譯：', '中文說明：']),
    type:fieldValue(block, ['類型：']),
    decision:fieldValue(block, ['作答決定：']),
    analysisLabels:{
      meaning:bullets[0].label,
      use:bullets[1].label,
      rationale:bullets[2].label,
      handling:bullets[3].label
    },
    analysis:{
      meaning:bullets[0].value,
      use:bullets[1].value,
      rationale:bullets[2].value,
      handling:bullets[3].value
    },
    authoredBlockSha256:crypto.createHash('sha256').update(block.join('\n')).digest('hex')
  };
  assert.ok(unit.excerpt && unit.chinese && unit.type && unit.decision, `incomplete authored fields at source line ${unit.sourceLine}`);
  assert.ok(Object.values(unit.analysis).every(Boolean), `incomplete authored analysis at source line ${unit.sourceLine}`);
  authoredUnits.push(unit);
}

assert.equal(authoredUnits.length, 207, 'V4.0 Stage 4 must contain every one of the 207 page 5–11 units');
assert.deepEqual(
  Object.fromEntries([5,6,7,8,9,10,11].map(page => [page, authoredUnits.filter(unit => unit.page === page).length])),
  {5:24,6:17,7:21,8:35,9:43,10:38,11:29},
  'V4.0 page-by-page unit inventory changed'
);

const stripOuterQuotes = value => {
  const textValue = String(value).trim();
  if ((textValue.startsWith('“') && textValue.endsWith('”')) || (textValue.startsWith('"') && textValue.endsWith('"'))) return textValue.slice(1, -1);
  return textValue;
};
const targetPhraseFor = unit => stripOuterQuotes(unit.excerpt)
  .replace(/\*([^*]+)\*/g, '$1')
  .replace(/\s+\.\.\.$/, '')
  .replace(/\s+\.\.\.\s+/g, '... ')
  .trim();
const stableSlug = value => String(value)
  .normalize('NFKD')
  .replace(/^Visual element:\s*/i, 'visual-')
  .replace(/[’‘]/g, "'")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .split('-').filter(Boolean).slice(0, 13).join('-') || 'source-unit';
const pageSourceId = unit => unit.page === 5 ? 'doc-2013-editorial-minutes'
  : unit.page === 6 ? 'doc-2013-writers-guidelines'
  : unit.page === 7 ? 'doc-2013-queenie-review'
  : unit.page === 8 ? 'doc-2013-see-the-world'
  : unit.page === 9 ? 'doc-2013-tourism-forum'
  : unit.page === 10 && unit.sourceLine >= 3964 ? 'doc-2013-kevin-letter'
  : unit.page === 10 ? 'doc-2013-mei-interview'
  : 'doc-2013-historian-blog';

const SOURCE_OVERRIDES = new Map([
  [1463,{sourcePhrase:'Minutes from editorial meeting at Asia Life magazine'}],
  [1478,{focusSelector:'#page-5 .meeting-meta'}],
  [1825,{sourcePhrase:"2013 Writers' Guidelines for Publication"}],
  [1840,{focusSelector:'#page-6 .memo-sheet'}],
  [2124,{focusSelector:'#page-7 .review-grid'}],
  [2139,{focusSelector:'#page-7 .review-grid'}],
  [2154,{focusSelector:'#page-7 .review-sheet'}],
  [2274,{sourcePhrase:'No. of words: 1200'}],
  [2319,{focusSelector:'#page-7 .review-choice'}],
  [2938,{sourcePhrase:'Tourism and local people'}],
  [2953,{focusSelector:'#page-9 .forum-window'}],
  [2561,{focusSelector:'#page-8 .tv-sheet'}],
  [3602,{focusSelector:'#page-10 .interview-note'}],
  [4129,{sourcePhrase:'Yours faithfully'}],
  [4178,{focusSelector:'#page-11 .historian-browser'}],
  // These clauses overlap smaller authored units in the same sentence. Stable
  // source spans let each current step highlight the complete exact clause
  // without nested marks fragmenting either clause.
  [4270,{focusSelector:'#source-p11-edgar-identity'}],
  [4315,{focusSelector:'#source-p11-edgar-year'}],
  [4330,{focusSelector:'#page-11 .historian-photo.tiger'}],
  [4452,{focusSelector:'#page-11 .table-scroll tbody tr:nth-child(1)'}],
  [4467,{focusSelector:'#page-11 .table-scroll tbody tr:nth-child(2)'}],
  [4527,{focusSelector:'#page-11 .historian-photo.hotel'}],
  [4587,{sourcePhrase:'2013-DSE-ENG LANG 3-B2-DF-11 / 70'}]
]);
const ROUTES = new Map([
  [1613,{routeTarget:'#doc-2013-writers-guidelines',routeLabel:'第 6 頁：2013 Writers’ Guidelines for Publication'}],
  [2199,{routeTarget:'#doc-2013-editorial-minutes',routeLabel:'第 5 頁：每篇提交 15–20 張圖片，編輯選用 5 張'}],
  [2214,{routeTarget:'#doc-2013-writers-guidelines',routeLabel:'第 6 頁：高解像度 JPEG 電子檔'}],
  [2229,{routeTarget:'#doc-2013-writers-guidelines',routeLabel:'第 6 頁：註明圖片來源'}],
  [2259,{routeTarget:'#doc-2013-writers-guidelines',routeLabel:'第 6 頁：標題不超過 80 個字元'}],
  [2289,{routeTarget:'#doc-2013-editorial-minutes',routeLabel:'第 5 頁：本期文章上限 900 字'}]
]);

const usedIds = new Map();
const steps = authoredUnits.map((unit, index) => {
  const baseId = `data-analysis-p${String(unit.page).padStart(2, '0')}-${stableSlug(unit.title)}`;
  const occurrence = (usedIds.get(baseId) || 0) + 1;
  usedIds.set(baseId, occurrence);
  const id = occurrence === 1 ? baseId : `${baseId}-${occurrence}`;
  const typeNumber = Number(unit.type.match(/^([1-6])\b/)?.[1] || 6);
  const task = typeNumber <= 3 ? 'ABC'[typeNumber - 1] : null;
  const rejected = unit.decision.includes('不寫入答案');
  const override = SOURCE_OVERRIDES.get(unit.sourceLine) || {};
  const route = ROUTES.get(unit.sourceLine) || {};
  return {
    id,
    order:index + 1,
    sourceId:pageSourceId(unit),
    sourcePhrase:override.sourcePhrase || targetPhraseFor(unit),
    sourceRoot:`#page-${unit.page} .recreated-page`,
    focusSelector:override.focusSelector || '',
    routeTarget:route.routeTarget || '',
    routeLabel:route.routeLabel || '',
    legacyIds:[],
    task,
    evidenceType:typeNumber,
    bank:Boolean(task && !rejected),
    rejected,
    final:index === authoredUnits.length - 1,
    ...unit
  };
});
assert.equal(new Set(steps.map(step => step.id)).size, steps.length, 'stable V4.0 IDs must be unique');

// Preserve safe re-entry from the 59-step V2 release. Each old step and all of
// its earlier aliases migrate to the closest V4.0 unit on the same printed page.
const tokens = value => new Set(String(value).toLowerCase().replace(/[’‘]/g, "'").match(/[a-z0-9]+/g) || []);
const overlapScore = (left, right) => {
  const a = tokens(left), b = tokens(right);
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / Math.max(a.size, b.size);
};
for (const legacy of LEGACY_V2_STEPS) {
  const pageSteps = steps.filter(step => step.page === legacy.page);
  const exact = pageSteps.find(step => {
    const phrase = targetPhraseFor(step);
    return phrase.includes(legacy.phrase) || legacy.phrase.includes(phrase);
  });
  const target = exact || pageSteps.map(step => ({step, score:overlapScore(`${step.title} ${step.sourcePhrase}`, legacy.phrase)}))
    .sort((a, b) => b.score - a.score)[0]?.step;
  assert.ok(target, `unable to migrate V2 step ${legacy.id}`);
  target.legacyIds.push(legacy.id, ...(legacy.legacy || []));
}
for (const step of steps) step.legacyIds = [...new Set(step.legacyIds)];

const payload = {
  schemaVersion:3,
  contentVersion:'2013-b2-stage4-v3-v4-source-rebuilt',
  analysisSource:{
    file:path.basename(sourcePath),
    sha256:sourceSha256,
    includedRange:'Data File pages 5–11 only',
    authoredUnits:207,
    includedFactFileUnits:207,
    excludedSections:['Question-Answer Book pages 1–6','Data File pages 1–4 (instructions, Situation, Contents, note sheet and Casey Wong assignment email)','Track 7 and Track 8 podcast analysis'],
    pageUnitCounts:{5:24,6:17,7:21,8:35,9:43,10:38,11:29}
  },
  steps,
  evidenceTypes:{1:'Task A 直接可用',2:'Task B 直接可用',3:'Task C 直接可用',4:'語義相關／背景',5:'視覺提示／來源導航',6:'不採用／行政／噪音'}
};

const js = `(() => {\n  'use strict';\n  const model = ${JSON.stringify(payload, null, 2)};\n  model.steps = Object.freeze(model.steps.map(step => Object.freeze({...step, analysis:Object.freeze(step.analysis), legacyIds:Object.freeze(step.legacyIds)})));\n  model.analysisSource = Object.freeze(model.analysisSource);\n  model.evidenceTypes = Object.freeze(model.evidenceTypes);\n  window.EDMUND_2013_B2_DATA_FILE = Object.freeze(model);\n})();\n`;
fs.writeFileSync(outputPath, js);

const esc = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
const rows = steps.map(step => `| ${step.order} | \`${step.id}\` | ${step.page} | ${step.sourceLine} | ${esc(step.sourcePhrase)} | ${step.task || '—'} | ${esc(step.type)} | ${esc(step.decision)} | \`${step.authoredBlockSha256}\` | \`paper3/2013-b2/super-curation-data-file-data.js\` |`);
const mapping = `# 2013 B2 Super Curation — Stage 4 Source Mapping\n\n- Release: \`${payload.contentVersion}\`\n- Authored source: \`${payload.analysisSource.file}\`\n- Authored source SHA-256: \`${sourceSha256}\`\n- Included authored fact-file units: **${steps.length} / 207**\n- Page inventory: **5:24 · 6:17 · 7:21 · 8:35 · 9:43 · 10:38 · 11:29**\n- Explicit exclusions: **Question-Answer Book pages 1–6; Data File pages 1–4 (including Situation, Contents, note sheet and Boss Letter); Track 7/8 Podcast analysis**\n- Evidence-bank entries: **${steps.filter(step => step.bank).length}**\n- Stage 5 content: **none**\n\nEvery row retains the complete authored excerpt/visual observation, Chinese rendering, type, answer decision, exact analysis labels and all four analysis lines. Each authored block has an independent SHA-256 digest so omission or alteration is detectable.\n\n| # | Stable step ID | Data File page | Authored source line | Exact highlighted phrase / visual target | Task | Authored type | Authored answer decision | Authored block SHA-256 | Implementation file |\n|---:|---|---:|---:|---|:---:|---|---|---|---|\n${rows.join('\n')}\n`;
fs.mkdirSync(path.dirname(mappingPath), {recursive:true});
fs.writeFileSync(mappingPath, mapping);
fs.writeFileSync(toolMappingPath, mapping);
console.log(JSON.stringify({ok:true, steps:steps.length, bank:steps.filter(step => step.bank).length, sha256:sourceSha256, pageUnitCounts:payload.analysisSource.pageUnitCounts, outputPath, mappingPath}, null, 2));
