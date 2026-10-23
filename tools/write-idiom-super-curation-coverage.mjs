import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const context = vm.createContext({ window: {} });
for (const name of ['idiom-system-data.js', 'idiom-first-five-curation.js',
  'idiom-compass-06-30-curation.js', 'idiom-compass-06-30-bonus.js',
  'idiom-compass-31-108-curation.js']) {
  const file = path.join(root, name);
  if (fs.existsSync(file)) vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}
const guides = context.window.EDMUND_IDIOM_COMPASS || {};
const lessons = context.window.EDMUND_IDIOM_SYSTEM_DATA.lessons.filter((lesson) => lesson.order <= 108);
const out = path.join(root, 'docs', 'Idiom_Super_Curation_001-108_Coverage_Matrix_2026-10-23.md');
const escape = (value) => String(value || '').replaceAll('|', '\\|').replaceAll(/\r?\n/g, ' ');
const lines = [
  '# Idiom Super Curation 001–108: lesson coverage matrix',
  '',
  'Generated structural snapshot. “Present” means content fields exist, not that their English, Chinese or scoring was individually approved. The item ledger contains 6,480 individual review records. Current owner review method is AI-only; independent human review is an explicit exception.',
  '',
  '| No. | Lesson | Original IDs | Guide | Guided choices | Extensions | Item-level editorial review |',
  '|---:|---|---:|---|---:|---:|---|',
];
for (const lesson of lessons) {
  const guide = guides[lesson.id];
  const choiceCount = guide ? [2, 3, 5, 6].reduce((sum, page) => sum + (guide.choices?.[page]?.optionsEn?.length || 0), 0) : 0;
  lines.push(`| ${lesson.order} | ${escape(lesson.titleEn)} | ${lesson.questions?.length || 0}/50 | ${guide ? 'Present, unreviewed' : 'Missing'} | ${choiceCount}/12 | ${guide?.bonusPractice?.length || 0}/10 | Pending |`);
}
lines.push('', 'Acceptance condition: every row reads 50/50, Present, 12/12 and 10/10, **and** every item passes the twelve-axis rubric with recorded evidence. These counts alone never release content.', '');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, lines.join('\n'));
console.log(`108-lesson coverage matrix -> ${out}`);
