import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateSpeechTiming, cueIndexAtTime, wordIndexAtTime, sentenceClipEnd } from '../speech-curation-audio-timing.mjs';

const map = JSON.parse(readFileSync(new URL('../speech-curation-assets/churchill-sentence-timing-v2.json', import.meta.url)));
const lines = map.lines.map(cue => ({ english: 'x'.repeat(cue.words.reduce((sum, word) => sum + word.length, 0)) }));
assert.equal(map.lines.length, 221);
assert.equal(map.lines.reduce((sum, cue) => sum + cue.words.length, 0), 1963);
assert.ok(validateSpeechTiming(map, lines, map.audio, 1168.2));
assert.equal(validateSpeechTiming(map, lines, 'wrong-audio.mp3', 1168.2), false);
assert.equal(validateSpeechTiming(map, lines, map.audio, 1150), false);
const broken = structuredClone(map);
broken.lines[12].start = broken.lines[11].start - 0.1;
assert.equal(validateSpeechTiming(broken, lines, map.audio, 1168.2), false);
assert.equal(cueIndexAtTime(map.lines, 0), -1);
for (const [index, cue] of map.lines.entries()) {
  assert.equal(cueIndexAtTime(map.lines, cue.start), index, `start of line ${index + 1}`);
  assert.equal(cueIndexAtTime(map.lines, (cue.start + cue.end) / 2), index, `midpoint of line ${index + 1}`);
  assert.ok(wordIndexAtTime(cue.words, cue.words[0].start) >= 0);
  assert.ok(sentenceClipEnd(cue) > cue.start && sentenceClipEnd(cue) <= cue.end);
  if (index + 1 < map.lines.length) assert.equal(cue.end, map.lines[index + 1].start);
}
assert.equal(cueIndexAtTime(map.lines, map.duration + 0.05), -1);
console.log('Churchill audio timing: 221 lines, 1,963 aligned word groups, seek boundaries and independent clip windows pass.');
