import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { articles } from './dse-reading-translations.mjs';
import { readingNarrationParagraphText, validateReadingAudioTimings } from '../reading-comprehension-features.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const context = { window: {} };
vm.runInNewContext(await read('dse-reading-audio-manifest.js'), context);
const manifest = context.window.EDMUND_DSE_READING_AUDIO;
const meta = context.window.EDMUND_DSE_READING_AUDIO_META;
const data = await articles();
const expectedIds = data.map(article => article.id).sort();
assert.equal(data.length, 44);
assert.ok(expectedIds.includes('dse-2024-b2'));
assert.ok(!expectedIds.includes('dse-2024-a') && expectedIds.includes('dse-2024-b1'));
assert.ok(Object.keys(manifest).every(id => expectedIds.includes(id)));
const complete = process.argv.includes('--require-complete');
if (complete || Object.keys(manifest).length) {
  assert.deepEqual(Object.keys(manifest).sort(), expectedIds);
  for (const [key, value] of Object.entries({voice:'bf_isabella',language:'en-gb',speed:1.05,sentencePause:0.65,paragraphPause:0.76,sampleRate:24000,complete:true,count:44,catalogueCount:44})) {
    assert.equal(meta[key], value, `DSE voice recipe: ${key}`);
  }
}
let words = 0;
for (const article of data) {
  const entry = manifest[article.id];
  if (!entry) continue;
  const source = article.paragraphs.map(readingNarrationParagraphText).join('\n\n');
  assert.equal(entry.sourceSha256, createHash('sha256').update(source).digest('hex'), `${article.id}: source changed`);
  assert.match(entry.src, /^https:\/\/edmund-neural-audio\.edmundeducation\.workers\.dev\/assets\/reading-comprehension\/audio\/edmund-neural\/v1-dse-20260904-pause065-1\//);
  assert.match(entry.audioSha256, /^[a-f0-9]{64}$/);
  assert.ok(entry.bytes > 1000);
  assert.ok(entry.timingsSrc.startsWith(`/dse-reading-audio-data/${article.id}-`));
  const timings = JSON.parse(await read(entry.timingsSrc.slice(1)));
  assert.ok(validateReadingAudioTimings(timings, entry, article), `${article.id}: timings do not match displayed text`);
  assert.equal(entry.paragraphs.length, article.paragraphs.length);
  let previous = 0, cursor = 0;
  for (const [index, paragraph] of article.paragraphs.entries()) {
    const range = entry.paragraphs[index];
    assert.equal(range.number, paragraph.number);
    assert.ok(range.start >= previous && range.end > range.start && range.end <= entry.duration + 0.002);
    if (index) assert.ok(Math.abs(range.start - previous - 0.76) < 0.003, `${article.id}: paragraph pause`);
    const count = (readingNarrationParagraphText(paragraph).match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*(?:-[\p{L}\p{N}]+)*/gu) || []).length;
    assert.ok(timings.words[cursor].start >= range.start - 0.002);
    assert.ok(timings.words[cursor + count - 1].end <= range.end + 0.002);
    previous = range.end; cursor += count;
  }
  assert.equal(cursor, entry.wordCount);
  words += cursor;
}
const table = data.find(article => article.id === 'dse-2021-b1').paragraphs.find(paragraph => paragraph.table);
assert.ok(readingNarrationParagraphText(table).includes('Moon Orchid.'));
assert.ok(readingNarrationParagraphText(table).includes('Possible plants for the residents of the housing estate.'));
assert.equal(readingNarrationParagraphText({text:'Keep this unchanged.'}), 'Keep this unchanged.');
const script = await read('reading-comprehension.js');
const page = await read('reading-comprehension.html');
assert.match(page, /dse-reading-audio-manifest\.js\?v=/);
assert.doesNotMatch(page, /class="audio-control"[^>]*data-ielts-only/);
assert.match(script, /state\.system === 'dse' \? window\.EDMUND_DSE_READING_AUDIO/);
const sync = script.slice(script.indexOf('function syncWord('), script.indexOf('\n', script.indexOf('function syncWord(')));
assert.doesNotMatch(sync, /scroll|focus\(/i);
console.log(`DSE narration: ${Object.keys(manifest).length}/${data.length} published recordings, ${words} aligned words; ${Object.keys(manifest).length ? 'voice recipe and paragraph ranges verified; ' : ''}table-text and no-forced-scroll contracts verified.`);
