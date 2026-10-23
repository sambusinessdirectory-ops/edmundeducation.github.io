import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({ window: {}, console });
const scripts = [
  'idiom-system-data.js',
  'idiom-first-five-curation.js',
  'idiom-compass-06-30-curation.js',
  'idiom-compass-06-30-bonus.js',
  'idiom-compass-31-108-curation.js',
];
for (const name of scripts) {
  const filename = path.join(root, name);
  if (fs.existsSync(filename)) vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename });
}

const catalogue = context.window.EDMUND_IDIOM_SYSTEM_DATA?.lessons || [];
const guides = context.window.EDMUND_IDIOM_COMPASS || {};
const lessons = catalogue.filter((lesson) => lesson.order >= 1 && lesson.order <= 108);
const errors = [];
const rows = [];
const allIds = new Set();
const text = (value) => String(value || '').trim();
const english = (value) => /[A-Za-z]/.test(text(value));
const chinese = (value) => /[\u3400-\u9fff]/u.test(text(value));

for (const lesson of lessons) {
  const guide = guides[lesson.id];
  const questions = lesson.questions || [];
  const row = {
    order: lesson.order,
    lessonId: lesson.id,
    title: lesson.titleEn,
    originalCount: questions.length,
    bonusCount: guide?.bonusPractice?.length || 0,
    guidePresent: Boolean(guide),
    issues: [],
  };
  const issue = (code, detail = '') => row.issues.push(detail ? `${code}: ${detail}` : code);
  if (questions.length !== 50) issue('ORIGINAL_COUNT', String(questions.length));
  for (const question of questions) {
    if (allIds.has(question.id)) issue('DUPLICATE_ITEM_ID', question.id);
    allIds.add(question.id);
    if (![question.prompt, question.answer].every(english)) issue('MISSING_ENGLISH', question.id);
    if (![question.promptZh, question.answerZh].every(chinese)) issue('MISSING_CHINESE', question.id);
    if (!text(question.answer).toLocaleLowerCase('en').includes(text(question.highlight).toLocaleLowerCase('en')))
      issue('HIGHLIGHT_NOT_IN_ANSWER', question.id);
  }
  if (!guide) {
    issue('NO_COMPASS_GUIDE');
  } else {
    if (row.bonusCount !== 10) issue('BONUS_COUNT', String(row.bonusCount));
    if (![guide.meaningEn, guide.modelEn, guide.readAloudEn, guide.pictureEn, guide.boundaryEn,
      guide.whereEn, guide.toneEn, guide.movingEn].every(english)) issue('GUIDE_ENGLISH_FIELD');
    if (![guide.meaningZh, guide.modelZh, guide.readAloudZh, guide.picture, guide.boundary,
      guide.where, guide.tone, guide.moving].every(chinese)) issue('GUIDE_CHINESE_FIELD');
    if (text(guide.modelEn) === text(guide.readAloudEn)) issue('READ_ALOUD_DUPLICATES_MODEL');
    if (!Array.isArray(guide.forms) || guide.forms.length < 2) issue('MISSING_FORMS');
    if (!Array.isArray(guide.checksEn) || guide.checksEn.length !== 3 ||
        !Array.isArray(guide.checks) || guide.checks.length !== 3) issue('POCKET_CHECK_COUNT');
    const lines = [];
    for (const page of [2, 3, 5, 6]) {
      const choice = guide.choices?.[page];
      if (!choice) { issue('MISSING_DECISION', String(page)); continue; }
      if (!english(choice.promptEn) || !chinese(choice.promptZh)) issue('DECISION_PROMPT_LANGUAGE', String(page));
      if (!Array.isArray(choice.optionsEn) || choice.optionsEn.length !== 3 ||
          !Array.isArray(choice.options) || choice.options.length !== 3) issue('GUIDED_OPTION_COUNT', String(page));
      if (!Number.isInteger(choice.correct) || choice.correct < 0 || choice.correct > 2) issue('GUIDED_KEY', String(page));
      if (!english(choice.feedbackEn) || !chinese(choice.feedback)) issue('GUIDED_FEEDBACK_LANGUAGE', String(page));
      (choice.optionsEn || []).forEach((option) => {
        if (!english(option)) issue('GUIDED_CHOICE_ENGLISH', String(page));
        lines.push(text(option).toLocaleLowerCase('en'));
      });
      (choice.options || []).forEach((option) => { if (!chinese(option)) issue('GUIDED_CHOICE_CHINESE', String(page)); });
    }
    row.distinctGuidedChoices = new Set(lines).size;
    if (lines.length === 12 && row.distinctGuidedChoices !== 12) issue('REPEATED_GUIDED_CHOICE');
    if (!guide.bonusPractice?.every((question, index) => question.id === `${lesson.id}-bonus-${String(index + 1).padStart(2, '0')}` &&
      question.number === 51 + index && english(question.prompt) && english(question.answer))) issue('BONUS_ID_OR_CONTENT');
    if (lesson.order >= 31) {
      const practiceQuestions = [...questions, ...(guide.bonusPractice || [])];
      const practiceChoices = guide.practiceChoices || {};
      if (Object.keys(practiceChoices).length !== 60) issue('AUTHORED_PRACTICE_COUNT', String(Object.keys(practiceChoices).length));
      for (const question of practiceQuestions) {
        const choice = practiceChoices[question.id];
        if (!choice || !Array.isArray(choice.foils) || choice.foils.length !== 3 || !chinese(choice.correctReason)) {
          issue('AUTHORED_PRACTICE_MISSING', question.id);
          continue;
        }
        const answer = text(question.answer);
        const alternatives = choice.foils.map((foil) => text(foil.text));
        if (new Set([answer, ...alternatives].map((line) => line.toLocaleLowerCase('en'))).size !== 4 ||
            !choice.foils.every((foil) => english(foil.text) && chinese(foil.reason) && text(foil.kind))) {
          issue('AUTHORED_PRACTICE_INVALID', question.id);
        }
        if (new Set(choice.foils.map((foil) => text(foil.kind))).size !== 3) issue('REPEATED_FOIL_MECHANISM', question.id);
        const lengths = [answer, ...alternatives].map((line) => line.split(/\s+/).length).sort((a, b) => a - b);
        const median = (lengths[1] + lengths[2]) / 2;
        if (median && lengths[3] > median * 1.3) issue('OPTION_LENGTH_REVIEW', question.id);
      }
    }
    if (lesson.order >= 6 && lesson.order <= 30 && typeof context.window.EDMUND_IDIOM_COMPASS_FOILS === 'function') {
      const rationales = new Map();
      for (const question of [...questions, ...(guide.bonusPractice || [])]) {
        for (const foil of context.window.EDMUND_IDIOM_COMPASS_FOILS(question, lesson) || []) {
          rationales.set(foil.reason, (rationales.get(foil.reason) || 0) + 1);
        }
      }
      row.mostRepeatedRationale = Math.max(0, ...rationales.values());
      if (row.mostRepeatedRationale >= 50) issue('REPEATED_RATIONALE_REVIEW', String(row.mostRepeatedRationale));
    }
  }
  rows.push(row);
  errors.push(...row.issues.map((error) => `${lesson.id} ${error}`));
}

const report = {
  date: new Date().toISOString(),
  scope: 'idiom-01 through idiom-108',
  lessonCount: lessons.length,
  originalQuestionCount: lessons.reduce((sum, lesson) => sum + (lesson.questions?.length || 0), 0),
  compassCoverage: rows.filter((row) => row.guidePresent).length,
  zeroStructuralIssueLessons: rows.filter((row) => !row.issues.length).length,
  errorCount: errors.length,
  errors,
  lessons: rows,
};
console.log(JSON.stringify(report, null, 2));
if (process.argv.includes('--strict') && errors.length) process.exitCode = 1;
