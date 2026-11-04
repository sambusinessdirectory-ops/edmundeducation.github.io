import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('dse-practical-writing.html');
const app = read('dse-practical-writing.mjs');
const css = read('dse-practical-writing.css');
const homepage = read('index.html');
const nav = read('shared-system-nav.js');
const dataSource = read('dse-practical-writing-data.mjs');
const { learningUnits, practiceMissions, writingFormats } = await import('../dse-practical-writing-data.mjs');

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

test('Homework deep links open one exact learning unit or practice mission after login', () => {
  assert.match(app, /params\.get\('mode'\)/);
  assert.match(app, /params\.get\('item'\)/);
  assert.match(app, /mode === 'learning' \? writingFormats : mode === 'practice' \? practiceMissions/);
  assert.match(app, /state\.mode = requestedDestination\.mode/);
  assert.match(app, /state\.activeId = requestedDestination\.activeId/);
  assert.match(app, /renderBriefing\(\)/);
});

test('two source-derived modes contain 13 learning units and 13 complete bilingual missions', () => {
  assert.equal(learningUnits.length, 13);
  assert.equal(practiceMissions.length, 13);
  assert.equal(writingFormats.length, 13);
  assert.ok(learningUnits.every(item => item.id && item.title && item.zhTitle && item.purpose && item.purposeZh && item.structure.length >= 4 && item.expressions.length >= 3));
  assert.ok(practiceMissions.every(item => item.id && item.title && item.zhTitle && item.situation && item.situationZh && item.requirements.length >= 2 && item.model.en && item.model.zh));
  assert.ok(writingFormats.every((item, index) => item.model === practiceMissions[index].model), 'Learning and Practice must share one canonical model');
  assert.ok(writingFormats.every(item => item.audience?.length === 2 && item.register?.length === 2 && item.formatRules?.length >= 2 && item.commonErrors?.length >= 2));
  assert.ok(writingFormats.every(item => item.model.blocks.length >= 4 && item.model.blocks.every(block => block.id && block.type && block.functionEn && block.functionZh && block.en && block.zh)));
  assert.ok(writingFormats.every(item => item.requirements.length >= 2 && item.practiceMissionId));
  assert.match(app, /Learning mode/);
  assert.match(app, /Practice mode/);
  assert.match(dataSource, /Letter of Enquiry/);
  assert.match(dataSource, /The Growing Problem of Electronic Waste/);
});

test('generic catalogue, briefing, three-column writing workspace and model review follow the requested flow', () => {
  assert.match(app, /campaign-map/);
  assert.match(app, /briefing-scene/);
  assert.match(app, /desk-requirements/);
  assert.match(app, /desk-editor/);
  assert.match(app, /desk-expressions/);
  assert.match(app, /data-model-dialog/);
  assert.match(html, /data-model-dialog/);
  assert.match(app, /renderModelBlocks/);
  assert.match(app, /COMPLETE MODEL · 完整參考範文/);
  assert.match(app, /REQUIREMENT COVERAGE · 題目要求對照/);
  assert.match(app, /COMMON ERRORS · 常見錯誤/);
  assert.doesNotMatch(app, /state\.modelTranslation \? item\.model\.zh : item\.model\.en/);
  assert.doesNotMatch(app, /sceneArt|scene-art|operations-map|mission-briefing|writing-desk\.jpg/);
  assert.doesNotMatch(css, /operations-map|mission-briefing|writing-desk\.jpg|scene-art/);
  assert.doesNotMatch(app, /showFunctions|model-function|寫作功能對齊/);
  assert.doesNotMatch(css, /model-function|counter-increment|counter\(modelBlock/);
});

test('drafting is student-scoped, autosaved, completable and responsive', () => {
  assert.match(app, /edmund-dse-practical-writing-mission-v2/);
  assert.match(app, /ownerKey/);
  assert.match(app, /setTimeout\(saveActiveDraft, 420\)/);
  assert.match(app, /localStorage\.setItem/);
  assert.match(app, /wordCount/);
  assert.match(app, /setComplete/);
  assert.match(app, /完成並提交/);
  assert.match(css, /@media \(max-width: 800px\)/);
  assert.match(css, /grid-template-columns: 1fr/);
  assert.match(app, /顯示繁體中文翻譯/);
});
