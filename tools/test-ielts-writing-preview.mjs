import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const task1 = JSON.parse(read('ielts-writing-preview/task1-diagrams.json'));
const task2 = JSON.parse(read('ielts-writing-preview/task2-questions.json'));
const narration = JSON.parse(read('ielts-writing-preview/question-audio.json'));
const homepage = read('index.html');
const page = read('ielts-writing-question-preview.html');
const app = read('ielts-writing-preview/app.js');
const style = read('ielts-writing-preview/style.css');
const liveSchema = read('supabase-ielts-writing-preview-live-20261031.sql');
const imageUrlSource = app.match(/^  const imageUrl = (.+);$/m)?.[1];
assert.ok(imageUrlSource, 'Task 1 image URL resolver exists');
const imageUrl = new Function(`return ${imageUrlSource}`)();
assert.equal(imageUrl('assets/writing-practice/questions/example.webp'), '/assets/writing-practice/questions/example.webp');
assert.equal(imageUrl('https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/assets/example.webp'), 'https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/assets/example.webp', 'published R2 assets must remain absolute URLs');

assert.equal(task1.length, 60, 'All existing Task 1 diagrams should be available');
assert.equal(task2.length, 242, 'All 242 essay prompts extracted from the 39-page source should be available');
assert.equal(new Set(task1.map((item) => item.id)).size, 60);
assert.equal(new Set(task2.map((item) => item.id)).size, 242);
assert.equal(new Set(task2.map((item) => item.topic)).size, 20);
assert.equal(new Set(task2.map((item) => item.sourcePage)).size, 39);
assert.equal(Object.keys(narration).length, 302, 'Every Task 1 and Task 2 question has narration');
const voiceCycle = ['british-male', 'british-female', 'american-female'];
for (const [index, item] of [...task1.map((item) => ['task1', item]), ...task2.map((item) => ['task2', item])].entries()) {
  const [section, question] = item;
  const clip = narration[`${section}:${question.id}`];
  assert.ok(clip?.path && existsSync(new URL(`../${clip.path}`, import.meta.url)), `${question.id} audio file exists`);
  assert.equal(clip.voice, voiceCycle[index % 3], `${question.id} follows the three-voice rotation`);
  const spoken = section === 'task1' ? question.quizPrompt : question.en;
  assert.equal(clip.sourceSha256, createHash('sha256').update(spoken).digest('hex'), `${question.id} audio matches visible question text`);
}
for (const item of task1) {
  assert.ok(item.prompt && item.quizPrompt && item.image && item.type, `${item.id} has a complete diagram record and quiz wording`);
  assert.ok(existsSync(new URL(`../${item.image}`, import.meta.url)), `${item.id} image exists`);
  assert.doesNotMatch(item.quizPrompt, /\b(?:bar chart|pie chart|line graph|table chart|maps|tables)\b/i, `${item.id} does not say its graph type`);
}
for (const item of task2) {
  assert.ok(item.en && item.zh && item.topic, `${item.id} has English, Traditional Chinese and a topic`);
  assert.match(item.zh, /[一-龥]/, `${item.id} has a Chinese translation`);
  assert.doesNotMatch(item.zh, /不是.{0,20}而是/, `${item.id} avoids the banned formula`);
  assert.doesNotMatch(item.en, /disadvantagess|payed|pervious|to what extend|opinion\.\./i, `${item.id} fixes source typos`);
}
const links = [...homepage.matchAll(/<a[^>]*class="category [^>]*href="([^"]+)"/g)].map((match) => match[1]);
assert.equal(links[76], 'ielts-writing-question-preview.html', 'Card 77 opens the new preview');
assert.equal(links.length, 78, 'All existing cards remain present');
assert.match(app, /translationsShown = false/, 'Translations start hidden');
assert.match(app, /safeStorage\('localStorage'\)\?\.setItem\(activeStorageKey/, 'Dropdown choices persist on this device');
assert.match(app, /edmund-universal-student-session-v1/, 'Signed-in students have separate saved choices');
assert.match(app, /storage\.removeItem\(LEGACY_STORAGE_KEY\)/, 'Existing saved choices migrate without loss');
assert.match(app, /menuitemradio/, 'Single question choices use an accessible custom menu');
assert.match(app, /menuitemcheckbox/, 'Tense selections use an accessible multi-select menu');
assert.match(app, /task1Answer\(item\.id\)/, 'Task 1 choices are restored per question');
assert.match(app, /:task1`, JSON\.stringify\(savedTask1\)/, 'Task 1 choices persist locally per student');
assert.match(app, /quizPrompt\(item\)/, 'Task 1 text uses the neutral quiz wording');
assert.match(app, /task1-diagrams\.json\?v=/, 'Task 1 data cache is refreshed with the new quiz wording');
assert.match(page, /適用時態（可多選）/, 'Task 1 has a separate tense column');
assert.match(page, /動態 \/ 靜態/, 'Task 1 has a separate dynamic/static column');
for (const tense of ['Past Tense', 'Present Tense', 'Future Tense', 'Present Perfect Tense', 'Past Perfect Tense']) {
  assert.ok(app.includes(tense), `${tense} is selectable`);
}
assert.match(page, /class="site-header edmund-system-header"/, 'The standard system head beam is used');
assert.doesNotMatch(page, /class="intro"/, 'The oversized hero is removed');
assert.match(page, /href="\/pwa-ui\.css"/, 'The existing PWA update notice is styled');
assert.match(style, /--cement: #d9dbda/, 'The page uses the cement-gray palette');
assert.match(page, /id="logout-button"/, 'The head beam has a logout control');
assert.match(page, /id="playback-speed"/, 'The prompt header has a playback-speed control');
assert.match(page, /id="text-size"/, 'The prompt header has a text-size control');
assert.match(page, /<th scope="col">聆聽題目<\/th><th scope="col"><div class="prompt-heading">/, 'Audio has its own column before the prompt');
assert.match(app, /window\.setInterval\(\(\) => \{ void refreshAdmin\(\); \}, 2000\)/, 'Admin presence and answers refresh every two seconds');
assert.match(app, /adminSlots\.length < 10/, 'The admin table has at most ten student columns');
assert.match(app, /ielts_preview_student_sync/, 'Student choices use the protected shared save');
assert.match(app, /ielts_preview_admin_snapshot/, 'Admin columns use the protected shared read');
assert.match(liveSchema, /revoke all on all tables in schema ielts_preview_private from public, anon, authenticated/, 'Private student data has no direct browser table access');
assert.doesNotMatch(app, /IESL\$A%T/, 'Admin password is not embedded in client code');
for (const type of ['Opinions', 'Discuss both views + Opinions', 'Advantages & Disadvantages', 'Cause & Solution', 'Direct question']) {
  assert.ok(app.includes(type), `${type} is available in the dropdown`);
}
console.log('IELTS preview: 60 diagrams, 242 bilingual essays, 302 three-voice clips, three Task 1 answer columns verified.');
