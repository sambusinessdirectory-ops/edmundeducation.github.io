import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const sandbox = {window: {}};
vm.runInNewContext(read('dse-listening-2014-transcript.js'), sandbox);
vm.runInNewContext(read('paper3/2014-b2/super-curation-stage3-data.js'), sandbox);

const stage3 = sandbox.window.EDMUND_2014_B2_CURATION_STAGE3;
const cues = Array.from(stage3.cues);
const transcript = Array.from(stage3.transcript);
const controller = read('paper3/2014-b2/super-curation-v2.js');
const loader = read('paper3/2014-b2/super-curation.js');
const css = read('paper3/2014-b2/super-curation-stage3.css');
const provenance = JSON.parse(read('paper3/2014-b2/recording-provenance.json'));

assert.equal(stage3.version, '2014-b2-super-curation-stage3-v1');
assert.equal(stage3.architecture, '2014-podcast-v1-continuous-single-owner');
assert.equal(cues.length, 21, '20 answer transactions plus one listening-only ending cue');
assert.equal(transcript.length, 77, 'the podcast transcript must contain turns 9-85 exactly once');
assert.deepEqual(Object.keys(stage3.fields), ['3-1','3-2','3-3','3-4','3-5','3-6']);
assert.equal(cues[0].playbackStart, stage3.audio.segmentStart);
assert.equal(cues.at(-1).sourceEnd, stage3.audio.segmentEnd);
for (const [index, cue] of cues.entries()) {
  assert.equal(cue.number, index + 1);
  assert.ok(cue.sourceStart >= cue.playbackStart, `${cue.id}: source starts before playback interval`);
  assert.ok(cue.sourceEnd > cue.sourceStart, `${cue.id}: invalid source interval`);
  if (index) assert.equal(cue.playbackStart, cues[index - 1].sourceEnd, `${cue.id}: continuous coverage gap/overlap`);
  if (cue.field) assert.ok(stage3.fields[cue.field], `${cue.id}: invalid printed field`);
}
assert.equal(Number((cues.at(-1).sourceEnd - cues[0].playbackStart).toFixed(2)), stage3.audio.segmentDuration);
assert.deepEqual(['3-1','3-2','3-3','3-4','3-5','3-6'].map(field => cues.filter(cue => cue.field === field).length), [1,4,4,2,4,5]);
assert.equal(cues.filter(cue => cue.task === 'A').length, 4);
assert.equal(cues.filter(cue => cue.task === 'C').length, 5);
assert.equal(cues.filter(cue => cue.task === 'B').length, 0);
assert.equal(cues.filter(cue => cue.note).length, 20);
assert.equal(cues.filter(cue => cue.classification === 'listening-only').length, 12);
assert.equal(new Set(cues.map(cue => cue.id)).size, cues.length);
assert.equal(new Set(transcript.map(turn => turn.id)).size, transcript.length);
assert.equal(transcript.filter(turn => typeof turn.translation === 'string' && turn.translation.trim()).length, 77, 'every English turn needs a Traditional Chinese translation');
assert.deepEqual(Array.from(new Set(transcript.map(turn => turn.speaker))).sort(), ['Freeman','Neelay','Neelay / Wendy','Wendy']);
assert.equal(transcript.filter(turn => turn.provenance === 'audio-backed-repair').length, 5);
assert.match(transcript.find(turn => turn.sourceIndex === 18).text, /wild animal/);
assert.match(transcript.find(turn => turn.sourceIndex === 39).translation, /蜜袋鼯/);
assert.match(transcript.find(turn => turn.sourceIndex === 60).translation, /溝通技巧/);
assert.match(transcript.find(turn => turn.sourceIndex === 79).translation, /孤兒計劃/);
assert.equal(provenance.sourceSha256, stage3.audio.sha256);
assert.equal(provenance.podcastSegmentStartSeconds, stage3.audio.segmentStart);
assert.equal(provenance.podcastSegmentEndSeconds, stage3.audio.segmentEnd);

assert.match(controller, /const stageOrder = \['instruction', 'categorize', 'podcast', 'data', 'writing'\]/);
assert.match(controller, /completePodcastCue/);
assert.match(controller, /playCue/);
assert.match(controller, /projectCompletedNotes/);
assert.match(controller, /reconcilePodcastProgress/);
assert.match(controller, /syncTranscriptEvidence/);
assert.match(controller, /audio\.addEventListener\('seeked'/);
assert.match(controller, /followTranscript/);
assert.match(controller, /sourceStart/);
assert.match(controller, /playbackStart/);
assert.doesNotMatch(controller, /setInterval\s*\(/, 'the podcast controller must not poll cue boundaries');
assert.doesNotMatch(controller, /maxUnlocked|option\.disabled\s*=/, 'all Stage 3 steps must remain freely browsable');
assert.match(loader, /dse-listening-2014-transcript\.js\?v=20261118-part3-v1/);
assert.match(loader, /super-curation-stage3-data\.js\?v=20261122-transcript-v3/);
assert.match(loader, /super-curation-v2\.js\?v=20261128-stage-rail-exact-2025-v1/);
assert.match(css, /curation-podcast-player/);
assert.match(css, /curation-podcast-transcript/);
assert.match(css, /curation-podcast-source-phrase\.is-current\[data-task="listening"\]::after/);
assert.match(css, /curation-podcast-noise/);
assert.match(css, /curation-transcript-translation/);
assert.match(css, /prefers-reduced-motion/);

console.log('2014 B2 Super Curation Part 3 static contract: PASS');
console.log(`cues=${cues.length} transcriptTurns=${transcript.length} duration=${stage3.audio.segmentDuration}s taskA=4 taskC=5`);
