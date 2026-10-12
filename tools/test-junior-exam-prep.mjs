import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFile(path.join(root, name), 'utf8');
const data = JSON.parse(await read('junior-exam-prep/s2-oct-2026-questions.json'));
const audio = JSON.parse(await read('junior-exam-prep/audio-manifest.json'));
const app = await read('junior-exam-prep/app.mjs');
const style = await read('junior-exam-prep/style.css');
const html = await read('junior-exam-prep.html');
const homepage = await read('index.html');
const config = await read('learning-portal-config.js');
const sql = await read('supabase-junior-exam-prep-20261012.sql');
const manifest = JSON.parse(await read('pwa-manifests/junior-exam-prep.webmanifest'));
const pwaCatalog = await read('pwa-app-catalog.mjs');
const sitemap = await read('sitemap.xml');

assert.equal(data.module, 's2-exam-prep-oct-2026');
assert.equal(data.questionCount, 470);
assert.equal(data.formCount, 47);
assert.match(data.sourceSha256, /^[0-9a-f]{64}$/);
assert.equal(data.questions.length, 470);
assert.equal(Object.keys(audio).length, 470);
const voices = ['British female', 'British male', 'American female'];
for (let number = 1; number <= 470; number++) {
  const question = data.questions[number - 1];
  const key = String(number).padStart(3, '0');
  assert.equal(question.number, number);
  assert.equal(question.sentence.split('_____').length, 2, `question ${number} must have one blank`);
  assert.ok(question.clue && question.translation);
  assert.equal(audio[key]?.voice, voices[(number - 1) % 3]);
  assert.equal(audio[key]?.path, `junior-exam-prep/audio/q${key}.mp3`);
  assert.ok((await stat(path.join(root, audio[key].path))).size > 1500);
}

const groups = app.match(/const FORM_GROUPS = (\[[\s\S]*?\]);\nconst FORM_COUNT/)?.[1];
assert.ok(groups, 'the visible reference table must have a defined source');
const forms = vm.runInNewContext(`(${groups})`);
assert.equal(forms.length, 15);
assert.equal(forms.reduce((sum, [, variants]) => sum + variants.length, 0), 47);
assert.match(app, /position|data-toggle-table/);
assert.match(app, /data-table-shell[\s\S]*data-table-float[\s\S]*junior-exam-toolbar[\s\S]*data-exam-form/);
assert.doesNotMatch(app, /question\.clue|clip\.voice|詞族提示|British female|British male|American female/);
assert.match(style, /\.junior-table-float \.junior-table-scroll \{ max-height: 170px; overflow: auto; \}/);
assert.match(style, /\.junior-table-scroll \{ border:/, 'the full 47-row table must not be height-capped');
assert.match(html, /class="junior-eddy-cursor"/);
assert.match(app, /p_final: final/);
assert.match(app, /junior_exam_list_responses/);
assert.match(html, /data-learning-portal="junior-exam-prep"/);
assert.match(config, /ordinal: 71, id: "junior-exam-prep"/);
assert.match(homepage, /href="junior-exam-prep\.html"[^>]*aria-label="初中考試溫習系統"/);
assert.equal([...homepage.matchAll(/<a class="category(?:\s[^"]*)?" href=/g)].length, 71);
assert.match(html, /rel="manifest" href="\/pwa-manifests\/junior-exam-prep\.webmanifest"/);
assert.equal(manifest.start_url, '/junior-exam-prep.html?source=pwa');
assert.match(pwaCatalog, /"id": "junior-exam-prep"/);
assert.match(sitemap, /https:\/\/edmundeducation\.com\/junior-exam-prep\.html/);

assert.equal((sql.match(/\('s2-exam-prep-oct-2026', \d+, '[0-9a-f]{64}'\)/g) || []).length, 470);
assert.match(sql, /junior_exam_module_access/);
assert.match(sql, /alter table public\.junior_exam_responses enable row level security/);
assert.match(sql, /revoke all on public\.junior_exam_module_access/);
assert.match(sql, /session_row\.token = p_token and session_row\.expires_at > pg_catalog\.now\(\)/);
assert.match(sql, /p_final and v_count <> 470/);

console.log('Junior Exam Prep verified: 470 questions, 47 forms, 470 rotating Kokoro clips, and restricted submissions.');
