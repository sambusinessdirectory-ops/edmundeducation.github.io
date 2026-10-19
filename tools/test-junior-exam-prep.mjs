import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => readFile(path.join(root, name), 'utf8');
const runtime = await read('junior-exam-prep/app.mjs');
const app = runtime + '\n' + await read('junior-exam-prep/modules.mjs');
const style = await read('junior-exam-prep/style.css');
const html = await read('junior-exam-prep.html');
const legacyHtml = await read('junior-exam-prep-legacy.html');
const legacyApp = await read('junior-exam-prep/legacy.mjs');
const sql = await read('supabase-junior-advanced-exams-20261019.sql');
const old = JSON.parse(await read('junior-exam-prep/s2-oct-2026-questions.json'));

assert.equal(old.questions.length, 470, 'the earlier exercise data must remain available');
assert.match(app, /s2-exam-prep-oct-2026/);
assert.match(app, /junior-exam-prep-legacy\.html#module/);
assert.match(app, /module\.total \|\| 50/);
assert.match(legacyHtml, /junior-exam-prep\/legacy\.mjs/);
assert.match(legacyApp, /s2-oct-2026-questions\.json/);
assert.match(legacyApp, /audio-manifest\.json/);
assert.match(legacyApp, /junior_exam_list_responses/);
assert.match(legacyApp, /junior_exam_submit/);
assert.match(html, /data-learning-portal="junior-exam-prep"/);
assert.match(html, /junior-exam-prep\/app\.mjs\?v=20261019-homework-courses1/);
assert.match(app, /junior_exam_list_responses/);
assert.match(app, /junior_exam_submit/);
assert.match(app, /p_final: final/);
assert.match(app, /data-submit-now="partial"/);
assert.match(app, /question\.steps\.map/);
assert.match(style, /\.junior-advanced-passage/);
assert.match(sql, /v_count <> v_total/, 'the final submission count must follow the selected module');
assert.match(sql, /v_number not between 1 and v_total/);
assert.match(sql, /session_row\.token = p_token and session_row\.expires_at > pg_catalog\.now\(\)/);

const modules = [
  ['tense', 's2-exam-prep-advanced-tense', 'S2 Exam Prep - Advanced - Tense'],
  ['articles', 's2-exam-prep-advanced-articles', 'S2 Exam Prep - Advanced - Articles'],
  ['other', 's2-exam-prep-advanced-non-tense-non-articles', 'S2 Exam Prep - Advanced - Non-Tense & Non-Articles']
];
for (const [type, key, title] of modules) {
  const data = JSON.parse(await read(`junior-exam-prep/advanced-${type}.json`));
  assert.equal(data.module, key);
  assert.equal(data.passages.length, 5);
  assert.equal(data.questions.length, 50);
  assert.ok(app.includes(title));
  assert.ok(app.includes(`advanced-${type}.json`));
  assert.ok(sql.includes(`('${key}', 'df2a3ba9-25be-4b0c-823a-304d4c29c2ba'::uuid)`));
  for (const [index, passage] of data.passages.entries()) {
    assert.equal(passage.number, index + 1);
    const markers = [...passage.text.matchAll(type === 'articles' ? /\[(\d+): ([^\]]+)\]/g : type === 'other' ? /\[(\d+)\] _____ \(([^)]+)\)/g : /\((\d+)\) _____ \(([^)]+)\)/g)];
    assert.equal(markers.length, 10, `${type} passage ${passage.number} must have ten marked items`);
  }
  for (const [index, question] of data.questions.entries()) {
    assert.equal(question.number, index + 1);
    assert.equal(question.passage, Math.floor(index / 10) + 1);
    assert.equal(question.steps.length, 7);
    const normalized = question.answer.trim().replace(/\s+/g, ' ').toLowerCase();
    const hash = createHash('sha256').update(normalized).digest('hex');
    assert.ok(sql.includes(`('${key}', ${question.number}, '${hash}')`), `${type} answer hash ${question.number}`);
  }
}
assert.equal((sql.match(/'s2-exam-prep-advanced-[^']+', \d+, '[0-9a-f]{64}'/g) || []).length, 150);
console.log('Jayden exam verified: restored 470-question module plus three advanced modules, 15 passages, 150 new answers, and account-scoped checks.');
