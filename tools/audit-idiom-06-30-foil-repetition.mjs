import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({ window: {} });
for (const name of ['idiom-system-data.js', 'idiom-first-five-curation.js',
  'idiom-compass-06-30-curation.js', 'idiom-compass-06-30-bonus.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, name), 'utf8'), context, { filename: name });
}
const lessons = context.window.EDMUND_IDIOM_SYSTEM_DATA.lessons.filter((lesson) => lesson.order >= 6 && lesson.order <= 30);
const guides = context.window.EDMUND_IDIOM_COMPASS;
const getFoils = context.window.EDMUND_IDIOM_COMPASS_FOILS;
const report = [];
for (const lesson of lessons) {
  const questions = [...lesson.questions, ...guides[lesson.id].bonusPractice];
  const reasons = new Map();
  const foilTexts = new Set();
  let badFoilCount = 0;
  let longOptionOutliers = 0;
  for (const question of questions) {
    const foils = getFoils(question, lesson) || [];
    if (foils.length !== 3 || new Set(foils.map((foil) => foil.text)).size !== 3) badFoilCount++;
    const lengths = [question.answer, ...foils.map((foil) => foil.text)].map((line) => line.trim().split(/\s+/).length);
    const sorted = [...lengths].sort((a, b) => a - b);
    const median = (sorted[1] + sorted[2]) / 2;
    if (lengths.some((length) => length > median * 1.3)) longOptionOutliers++;
    for (const foil of foils) {
      reasons.set(foil.reason, (reasons.get(foil.reason) || 0) + 1);
      foilTexts.add(foil.text);
    }
  }
  report.push({
    lessonId: lesson.id,
    lemma: lesson.titleEn,
    itemCount: questions.length,
    badFoilCount,
    longOptionOutliers,
    uniqueFoilTexts: foilTexts.size,
    uniqueRationales: reasons.size,
    mostRepeatedRationaleCount: Math.max(...reasons.values()),
    mostRepeatedRationale: [...reasons].sort((a, b) => b[1] - a[1])[0]?.[0] || '',
    editorialNote: 'Quantitative triage only; repeated text counts cannot establish or refute semantic validity.',
  });
}
const output = {
  scope: 'idiom-06..idiom-30',
  itemCount: report.reduce((sum, row) => sum + row.itemCount, 0),
  structuralFoilFailures: report.reduce((sum, row) => sum + row.badFoilCount, 0),
  optionLengthOutliers: report.reduce((sum, row) => sum + row.longOptionOutliers, 0),
  lessonsWithRationaleRepeatedAtLeast50Times: report.filter((row) => row.mostRepeatedRationaleCount >= 50).length,
  lessons: report,
};
const out = path.join(root, 'content', 'idiom-existing-foil-audit-06-30.json');
fs.writeFileSync(out, JSON.stringify(output, null, 2) + '\n');
console.log(`Audited ${output.itemCount} existing items; ${output.lessonsWithRationaleRepeatedAtLeast50Times} lessons repeat one rationale at least 50 times.`);
