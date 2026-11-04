import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('dse-practical-writing.html');
const app = read('dse-practical-writing.mjs');
const css = read('dse-practical-writing.css');
const homepage = read('index.html');
const nav = read('shared-system-nav.js');
const source = read('writing-practice-dse-part-a-data.js');

test('Card 80 routes to the new DSE practical-writing system with the requested line break', () => {
  assert.match(homepage, /href="dse-practical-writing\.html"[^>]*aria-label="DSE 學生使用 實用文練習系統"/);
  assert.match(homepage, /DSE 學生使用<br>實用文練習系統/);
  assert.match(nav, /id: "dse-practical-writing"[^\n]+homepageCard: 80/);
});

test('system is protected by an existing-student login and restores shared student sessions', () => {
  assert.match(html, /data-view="login"/);
  assert.match(html, /name="username"/);
  assert.match(html, /name="password"[^>]+type="password"/);
  assert.match(app, /flashcard_student_login/);
  assert.match(app, /flashcard_student_session_profile/);
  assert.match(app, /rememberStudentSession/);
  assert.match(app, /getStudentSession/);
});

test('practice catalogue exposes only prompt metadata to the new UI and includes every authored Part A task', () => {
  const sandbox = { window: {} };
  vm.runInNewContext(source, sandbox);
  const exercises = Object.values(sandbox.window.EDMUND_DSE_WRITING_PART_A_EXERCISES || {});
  assert.equal(exercises.length, 15);
  assert.ok(exercises.every(item => item.id && item.exam && item.taskType && item.questionPrompt?.length));
  assert.match(html, /writing-practice-dse-part-a-data\.js/);
  assert.match(app, /questionPrompt/);
  assert.doesNotMatch(app, /translationSections|practiceDifficultySets|essayLeadLines|paragraphs/);
});

test('drafting is student-scoped, autosaved and responsive', () => {
  assert.match(app, /edmund-dse-practical-writing-draft-v1/);
  assert.match(app, /state\.user\?\.id/);
  assert.match(app, /setTimeout\(saveActiveDraft, 500\)/);
  assert.match(app, /localStorage\.setItem/);
  assert.match(app, /wordCount/);
  assert.match(css, /@media \(max-width: 900px\)/);
  assert.match(css, /grid-template-columns: 1fr/);
  assert.match(html, /data-draft-count/);
});
