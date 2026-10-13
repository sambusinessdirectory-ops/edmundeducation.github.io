import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = name => readFile(path.join(root, name), 'utf8');
const story = JSON.parse(await read('junior-quiz-review/the-last-train.json'));
const audio = JSON.parse(await read('junior-quiz-review/audio-manifest.json'));
const app = await read('junior-quiz-review/app.mjs');
const html = await read('junior-quiz-review.html');
const homepage = await read('index.html');
const config = await read('learning-portal-config.js');
const sql = await read('supabase-junior-quiz-review-20261013.sql');
const manifest = JSON.parse(await read('pwa-manifests/junior-quiz-review.webmanifest'));

assert.equal(story.title, 'The Last Train');
assert.equal(story.paragraphs.length, 14);
const sentences = story.paragraphs.flatMap(p => p.sentences);
assert.equal(sentences.length, 39);
for (const [index, paragraph] of story.paragraphs.entries()) {
  assert.equal(paragraph.number, index + 1);
  assert.ok(paragraph.zh.length > 5);
  assert.ok(paragraph.sentences.every(sentence => sentence.trim() === sentence && sentence.length > 3));
}
assert.match(story.paragraphs[0].sentences.join(' '), /23\.45\.$/);
assert.match(story.paragraphs[10].sentences.join(' '), /More haste, less speed\. Remember\? Rush your life away/);
assert.match(story.paragraphs[12].sentences.join(' '), /His identical twin, Martin, sadly did not survive the crash\.’/);
assert.equal(audio.voice, 'bf_isabella');
assert.equal(audio.locale, 'en-gb');
assert.equal(audio.sentences.length, 39);
assert.ok((await stat(path.join(root, audio.full))).size > 100000);
for (const [index, clip] of audio.sentences.entries()) {
  assert.equal(clip, `junior-quiz-review/audio/s${String(index + 1).padStart(2,'0')}.mp3`);
  assert.ok((await stat(path.join(root, clip))).size > 1500);
}
assert.match(app, /0\.25|length: 16/);
assert.match(app, /data-prev/);
assert.match(app, /data-next/);
assert.match(app, /data-submit="partial"/);
assert.match(app, /data-submit="full"/);
assert.match(app, /queue\.filter\(id => !solved\[id\]\)/);
assert.match(app, /junior_quiz_submit/);
assert.match(html, /data-learning-portal="junior-quiz-review"/);
assert.match(config, /ordinal: 72, id: "junior-quiz-review"/);
assert.equal([...homepage.matchAll(/<a class="category(?:\s[^\"]*)?" href=/g)].length, 72);
assert.match(homepage, /href="junior-quiz-review\.html" aria-label="初中測驗溫習系統"/);
assert.equal(manifest.start_url, '/junior-quiz-review.html?source=pwa');
assert.equal((sql.match(/\('the-last-train-2026', \d+, '[0-9a-f]{64}'\)/g) || []).length, 39);
assert.match(sql, /student\.id='df2a3ba9-25be-4b0c-823a-304d4c29c2ba'/);
assert.match(sql, /alter table public\.junior_quiz_responses enable row level security/);
assert.match(sql, /p_final and v_count<>39/);
console.log('Junior Quiz Review verified: card 72, 14 translated paragraphs, 39 sentence clips, full Kokoro narration, 0.25–4× speeds and Jayden-only submission.');
