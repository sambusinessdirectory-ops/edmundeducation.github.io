import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const transcriptPath = path.join(root, 'dse-listening-2016-transcript.js');
const dataPath = path.join(root, 'tools/paper3/2016-b2/source/super-curation-stage3-data.js');
const provenance = JSON.parse(read('tools/paper3/2016-b2/audit/recording-provenance.json'));
const sandbox = {window: {}};
vm.runInNewContext(fs.readFileSync(transcriptPath, 'utf8'), sandbox, {filename: transcriptPath});
vm.runInNewContext(fs.readFileSync(dataPath, 'utf8'), sandbox, {filename: dataPath});
const data = sandbox.window.EDMUND_2016_B2_STAGE3;
const controller = read('tools/paper3/2016-b2/source/super-curation-stage3.js');
const stage2 = read('paper3/2016-b2/super-curation-stage2.js');
const loader = read('paper3/2016-b2/super-curation-stage3-loader.js');
const css = read('paper3/2016-b2/super-curation.css');
const html = read('paper3/2016-b2/index.html');

assert.equal(data.version, '2016-b2-super-curation-stage3-v2');
assert.equal(data.schema, 3);
assert.equal(data.architectureVersion, '2016-b2-podcast-v2-sentence-owner');
assert.equal(data.fields.length, 4);
assert.equal(data.cues.length, 13);
assert.equal(data.cues.filter(cue => cue.note).length, 12);
assert.equal(data.transcript.length, 44);
assert.equal(data.transcriptSentences.length, 107);
assert.equal(data.steps.length, 124);
assert.equal(new Set(data.steps.map(step => step.id)).size, 124);
assert.equal(new Set(data.cues.map(cue => cue.id)).size, 13);
assert.deepEqual(Array.from(data.fields, field => field.id), ['3-1','3-2','3-3','3-4']);
assert.deepEqual(Array.from(data.fields, field => field.selector), [
  'textarea[data-note="3-1"]','textarea[data-note="3-2"]','textarea[data-note="3-3"]','textarea[data-note="3-4"]'
]);
assert.deepEqual(Array.from(data.cues, cue => cue.endpoint), [496.88,552.19,587.99,603.57,621.62,648.12,663.68,670.56,686.66,708.83,737.24,793.22,830.86]);
assert.equal(data.cues.every((cue, index) => index === 0 || cue.endpoint > data.cues[index - 1].endpoint), true);
assert.equal(data.cues.every(cue => cue.start < cue.endpoint && cue.endpoint <= data.audio.duration), true);
assert.equal(data.cues.filter(cue => cue.use === 'listening').length, 6);
assert.equal(data.cues.filter(cue => cue.task === 'A').length, 2);
assert.equal(data.cues.filter(cue => cue.task === 'B').length, 4);
assert.equal(data.cues.filter(cue => cue.task === 'C').length, 0);

for (const turn of data.transcript) {
  assert.ok(turn.id && Number.isFinite(turn.start) && Number.isFinite(turn.end));
  assert.ok(turn.translation && turn.explanation && turn.sourceText);
  assert.equal(turn.rejectUnhighlighted, true, `turn ${turn.index} must reject every non-point span`);
  assert.doesNotMatch(turn.translation, /[这们来时为说个里发过还让听见从对与应关]/,
    `turn ${turn.index} contains a common Simplified Chinese character`);
  const intervals = [];
  for (const phrase of turn.highlightPhrases) {
    assert.ok(turn.text.includes(phrase), `semantic phrase missing in transcript turn ${turn.index}: ${phrase}`);
    const start = turn.text.indexOf(phrase);
    intervals.push([start, start + phrase.length]);
  }
  intervals.sort((a, b) => a[0] - b[0]);
  assert.equal(intervals.every((item, index) => index === 0 || item[0] >= intervals[index - 1][1]), true,
    `semantic point ranges overlap in transcript turn ${turn.index}`);
}
assert.equal(data.transcript.filter(turn => turn.highlightPhrases.length).length, 21);
assert.equal(data.transcript.filter(turn => !turn.highlightPhrases.length).length, 23);
assert.match(data.transcript[36].translation, /各位聽眾/);
assert.match(data.transcript[38].translation, /很多聽眾/);
assert.match(data.transcript[41].translation, /我剛才還未說完/);
assert.equal(data.transcript[37].text.includes('Chang Yee Tak Plough'), true);
assert.equal(data.transcript[37].sourceText.includes('Chang Yi Tak Plough'), true);
assert.equal(data.transcript.some(turn => turn.text.includes('Indy Wong')), true);
assert.equal(data.transcript.some(turn => turn.sourceText.includes('Indi Wong')), true);
assert.deepEqual(Array.from(data.cues.find(cue => cue.id === 'plough-qualified-uniqueness').rejectedTranscriptIndexes), [39,40]);

for (const sentence of data.transcriptSentences) {
  assert.ok(sentence.id && Number.isFinite(sentence.start) && Number.isFinite(sentence.end));
  assert.ok(sentence.start < sentence.end, `${sentence.id} must have positive duration`);
  assert.ok(sentence.text && sentence.translation && sentence.explanation);
  assert.equal(sentence.rejectUnhighlighted, true);
  assert.doesNotMatch(sentence.translation, /[这们来时为说个里发过还让听见从对与应关]/,
    `${sentence.id} contains a common Simplified Chinese character`);
  assert.equal(sentence.highlightRanges.every(range =>
    Number.isInteger(range.start) && Number.isInteger(range.end) && range.start >= 0 && range.start < range.end && range.end <= sentence.text.length
  ), true, `${sentence.id} has an out-of-bounds highlight range`);
  assert.equal(sentence.highlightRanges.every((range, index) =>
    index === 0 || range.start >= sentence.highlightRanges[index - 1].end
  ), true, `${sentence.id} has overlapping highlight ranges`);
}
for (const turn of data.transcript) {
  const sentences = data.transcriptSentences.filter(sentence => sentence.sourceTurnIndex === turn.index);
  assert.ok(sentences.length > 0, `${turn.id} must contain at least one sentence`);
  assert.equal(sentences[0].start, turn.start, `${turn.id} sentence start must match turn start`);
  assert.equal(sentences.at(-1).end, turn.end, `${turn.id} sentence end must match turn end`);
  assert.equal(sentences.every((sentence, index) => index === 0 || sentence.start === sentences[index - 1].end), true,
    `${turn.id} sentence timings must be contiguous`);
}
assert.equal(data.transcriptSentences.filter(sentence => sentence.highlightRanges.length).length, 32);
assert.equal(data.transcriptSentences.filter(sentence => !sentence.highlightRanges.length).length, 75);
const programmePreview = data.transcriptSentences.filter(sentence => sentence.sourceTurnIndex === 5);
assert.equal(programmePreview.length, 3);
assert.equal(programmePreview.every(sentence => sentence.kind === 'noise'), true);
assert.deepEqual(Array.from(programmePreview, sentence => sentence.translation), [
  '本星期節目內容豐富：我們會報道成為香港本地足球死忠球迷是怎樣的體驗，並邀請香港超級聯賽十支球隊的球迷會成員到場。',
  '我們亦會訪問新加坡酒店主管 Hav 博士；他日間在酒店工作，晚上則兼任唱片騎師。',
  '不過首先，我會訪問另一位截然不同的博士。'
]);
assert.equal(data.steps.some(step => step.id === 'p3-review-part-b-turn-06-sentence-01'), true);
assert.equal(data.steps.some(step => step.id === 'p3-review-part-b-turn-42-sentence-03'), true);

assert.equal(provenance.sourceUrl, data.audio.sourceUrl);
assert.equal(provenance.publicRelayUrl, data.audio.src);
assert.equal(provenance.sha256, data.audio.sha256);
assert.equal(provenance.durationSeconds, 831.63);
assert.equal(provenance.bytes, 9980375);

assert.match(controller, /document\.createElement\('audio'\)/);
assert.match(controller, /audio\.src = data\.audio\.src/);
assert.match(controller, /edmund:2016-stage3-cue/);
assert.match(controller, /typingCueId = cue\.id/);
assert.match(controller, /customizedCueIds/);
assert.match(controller, /curation-transcript-inline-task/);
assert.match(controller, /curation-transcript-inline-listening/);
assert.match(controller, /curation-transcript-inline-noise/);
assert.match(controller, /transcriptSentenceEls/);
assert.match(controller, /sentence\.end <= time \+ 0\.12/);
assert.match(controller, /renderTranscript\(false\)/);
assert.match(stage2, /curation-stage2-category-target/);
assert.match(controller, /\['nw','ne','sw','se'\]/);
assert.match(loader, /DecompressionStream\('gzip'\)/);
assert.match(loader, /stage3-runtime\.js\.gz/);
assert.match(loader, /20261128-stage3-v5/);
assert.doesNotMatch(controller, /你會先標哪個任務/);
assert.doesNotMatch(controller, /\?['"]\s*;\s*\/\/.*podcast/i);
assert.match(css, /curation-stage3-heading-task-A/);
assert.match(css, /curation-stage3-heading-listening/);
assert.match(css, /curation-stage3-active \.curation-stage3-heading-state\{display:inline-grid\}/);
assert.match(css, /curation-transcript-inline-task-A/);
assert.match(css, /curation-transcript-inline-noise/);
assert.match(css, /curation-transcript-inline-listening/);
assert.match(css, /curation-stage2-category-target>\.curation-source-task\.is-revealed/);
assert.doesNotMatch(css, /curation-transcript-task\[data-task=A\] \.curation-transcript-copy\{background:/);
assert.doesNotMatch(css, /curation-transcript-listening \.curation-transcript-copy\{background:/);
assert.doesNotMatch(css, /curation-transcript-hint \.curation-transcript-copy\{background:/);
assert.match(html, /Listening note-taking sheet for podcast <em>Nosing Around<\/em>/);
assert.doesNotMatch(html, /Listening note-taking sheet for podcast <em>Nosing Around<\/em>\s*\?/);
const scriptOrder = [
  '/dse-listening-2016-transcript.js',
  '/paper3/2016-b2/super-curation-stage3-loader.js'
].map(src => html.indexOf(src));
assert.equal(scriptOrder.every(index => index >= 0), true);
assert.equal(scriptOrder[0] < scriptOrder[1], true);
const runtime = zlib.gunzipSync(fs.readFileSync(path.join(root, 'paper3/2016-b2/stage3-runtime.js.gz'))).toString('utf8');
assert.match(runtime, /2016-b2-super-curation-stage3-v2/);
assert.match(runtime, /EDMUND_2016_B2_CURATION_STAGE3_DEBUG/);
assert.match(runtime, /curation-transcript-inline-listening/);
assert.match(runtime, /我剛才還未說完/);
assert.match(runtime, /107 sentence decisions/);
assert.match(html, /20261128-stage3-sentence-v1/);
assert.match(html, /20261123-stage2-v4/);
assert.match(html, /20261128-stage3-v5/);
for (const file of [
  'tools/paper3/2016-b2/audit/recording-provenance.json',
  'tools/paper3/2016-b2/docs/CUE_LEDGER.md',
  'tools/paper3/2016-b2/docs/SOURCE_INVENTORY.md',
  'tools/paper3/2016-b2/docs/IMPLEMENTATION_REPORT.md'
]) assert.equal(fs.existsSync(path.join(root, file)), true, `${file} must exist`);

console.log('2016 B2 Super Curation Stage 3 static contract: PASS');
console.log('fields=4 cues=13 notes=12 turns=44 sentences=107 steps=124 pointSentences=32 fullyRejectedSentences=75');
