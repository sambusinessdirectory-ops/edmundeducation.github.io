import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const transcriptPath = path.join(root, 'dse-listening-2016-transcript.js');
const dataPath = path.join(root, 'paper3/2016-b2/super-curation-stage3-data.js');
const audioPath = path.join(root, 'paper3/2016-b2/part-b-podcast.mp3');
const sandbox = {window: {}};
vm.runInNewContext(fs.readFileSync(transcriptPath, 'utf8'), sandbox, {filename: transcriptPath});
vm.runInNewContext(fs.readFileSync(dataPath, 'utf8'), sandbox, {filename: dataPath});
const data = sandbox.window.EDMUND_2016_B2_STAGE3;
const controller = read('paper3/2016-b2/super-curation-stage3.js');
const css = read('paper3/2016-b2/super-curation.css');
const html = read('paper3/2016-b2/index.html');

assert.equal(data.version, '2016-b2-super-curation-stage3-v1');
assert.equal(data.schema, 2);
assert.equal(data.architectureVersion, '2016-b2-podcast-v1-single-owner');
assert.equal(data.fields.length, 4);
assert.equal(data.cues.length, 13);
assert.equal(data.cues.filter(cue => cue.note).length, 12);
assert.equal(data.transcript.length, 44);
assert.equal(data.steps.length, 61);
assert.equal(new Set(data.steps.map(step => step.id)).size, 61);
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
  for (const phrase of [...turn.noisePhrases, ...turn.highlightPhrases]) {
    assert.ok(turn.text.includes(phrase), `semantic phrase missing in transcript turn ${turn.index}: ${phrase}`);
  }
}
assert.equal(data.transcript.filter(turn => turn.highlightPhrases.length).length, 9);
assert.equal(data.transcript[37].text.includes('Chang Yee Tak Plough'), true);
assert.equal(data.transcript[37].sourceText.includes('Chang Yi Tak Plough'), true);
assert.equal(data.transcript.some(turn => turn.text.includes('Indy Wong')), true);
assert.equal(data.transcript.some(turn => turn.sourceText.includes('Indi Wong')), true);
assert.deepEqual(Array.from(data.cues.find(cue => cue.id === 'plough-qualified-uniqueness').rejectedTranscriptIndexes), [39,40]);

assert.equal(fs.existsSync(audioPath), true);
const hash = crypto.createHash('sha256').update(fs.readFileSync(audioPath)).digest('hex');
assert.equal(hash, data.audio.sha256);
const probe = JSON.parse(execFileSync('ffprobe', ['-v','error','-show_entries','format=duration,size','-of','json',audioPath], {encoding:'utf8'}));
assert.equal(Number(probe.format.duration), 831.63);
assert.equal(Number(probe.format.size), 9980375);

assert.match(controller, /document\.createElement\('audio'\)/);
assert.match(controller, /audio\.src = data\.audio\.src/);
assert.match(controller, /edmund:2016-stage3-cue/);
assert.match(controller, /typingCueId = cue\.id/);
assert.match(controller, /customizedCueIds/);
assert.match(controller, /curation-transcript-inline-task/);
assert.match(controller, /\['nw','ne','sw','se'\]/);
assert.doesNotMatch(controller, /你會先標哪個任務/);
assert.doesNotMatch(controller, /\?['"]\s*;\s*\/\/.*podcast/i);
assert.match(css, /curation-stage3-heading-task-A/);
assert.match(css, /curation-stage3-heading-listening/);
assert.match(css, /curation-transcript-inline-task-A/);
assert.match(css, /curation-transcript-inline-noise/);
assert.doesNotMatch(css, /curation-transcript-task\[data-task=A\] \.curation-transcript-copy\{background:/);
assert.match(html, /Listening note-taking sheet for podcast <em>Nosing Around<\/em>/);
assert.doesNotMatch(html, /Listening note-taking sheet for podcast <em>Nosing Around<\/em>\s*\?/);
const scriptOrder = [
  '/dse-listening-2016-transcript.js',
  '/paper3/2016-b2/super-curation-stage3-data.js',
  '/paper3/2016-b2/super-curation-stage3.js'
].map(src => html.indexOf(src));
assert.equal(scriptOrder.every(index => index >= 0), true);
assert.equal(scriptOrder[0] < scriptOrder[1] && scriptOrder[1] < scriptOrder[2], true);
for (const file of [
  'paper3/2016-b2/recording-provenance.json',
  'docs/paper3/2016_B2_PART3_CUE_LEDGER.md',
  'docs/paper3/2016_B2_PART3_SOURCE_INVENTORY.md',
  'docs/paper3/2016_B2_PART3_IMPLEMENTATION_REPORT.md'
]) assert.equal(fs.existsSync(path.join(root, file)), true, `${file} must exist`);

console.log('2016 B2 Super Curation Stage 3 static contract: PASS');
console.log('fields=4 cues=13 notes=12 transcript=44 steps=61 selectiveHighlightTurns=9');
