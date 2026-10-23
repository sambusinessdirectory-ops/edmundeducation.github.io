import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [lessonId = 'idiom-31', startText = '1', endText = '10', mode = 'cards'] = process.argv.slice(2);
const start = Number(startText);
const end = Number(endText);
if (!/^idiom-\d{2,3}$/.test(lessonId) || !Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end > 60 || end < start || !['cards', 'key', 'score'].includes(mode)) {
  console.error('Usage: node tools/print-idiom-editorial-blind-review.mjs idiom-31 1 10 [cards|key|score]');
  process.exit(1);
}

const editorial = path.join(root, 'content', 'idiom-compass-editorial-31-108');
const sourceOrder = lessonId.slice(6).padStart(3, '0');
const lessonFile = fs.readdirSync(path.join(root, 'tools', 'idiom-lessons'))
  .find((name) => name.startsWith(`lesson-${sourceOrder}-`) && name.endsWith('.json'));
if (!lessonFile) throw new Error(`No canonical source for ${lessonId}`);
const lesson = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'idiom-lessons', lessonFile), 'utf8')).lesson;
const questions = new Map(lesson.questions.map((question) => [question.id, question]));
const guide = JSON.parse(fs.readFileSync(path.join(editorial, `${lessonId}.json`), 'utf8'));
guide.bonusBlueprint.forEach((row, index) => {
  const id = `${lessonId}-q${String(51 + index).padStart(2, '0')}`;
  questions.set(id, { id, prompt: row[1], promptZh: row[2], answer: row[3], answerZh: row[4] });
});
const drafts = new Map();
for (const file of fs.readdirSync(editorial).filter((name) => name.startsWith(`${lessonId}-practice-`) && name.endsWith('.json'))) {
  const data = JSON.parse(fs.readFileSync(path.join(editorial, file), 'utf8'));
  for (const [id, row] of Object.entries(data.items)) {
    if (drafts.has(id)) throw new Error(`Duplicate draft ${id}`);
    drafts.set(id, row);
  }
}
const letters = 'ABCD';
const review = mode === 'score'
  ? JSON.parse(fs.readFileSync(path.join(editorial, `${lessonId}-blind-review.json`), 'utf8'))
  : null;
let matches = 0;
for (let number = start; number <= end; number++) {
  const id = `${lessonId}-q${String(number).padStart(2, '0')}`;
  const source = questions.get(id);
  const draft = drafts.get(id);
  if (!source || !draft) throw new Error(`Missing source or draft ${id}`);
  // Stable hash prevents a repeating letter sequence from becoming a clue.
  // The cards view never prints the key or reasons.
  const keyIndex = createHash('sha256').update(`idiom-editorial-review-v2:${id}`).digest()[0] % 4;
  const options = draft.foils.map((foil) => foil.text);
  options.splice(keyIndex, 0, source.answer);
  if (mode === 'score') {
    const selected = review.selections?.[id]?.letter;
    if (selected === letters[keyIndex]) matches++;
    else console.log(`${id}: ${selected || 'UNREVIEWED'}; expected ${letters[keyIndex]}`);
  } else if (mode === 'key') {
    console.log(`${id}: ${letters[keyIndex]}`);
  } else {
    console.log(`\n${id}\n${source.prompt}\n${source.promptZh}`);
    options.forEach((option, index) => console.log(`${letters[index]}. ${option}`));
  }
}
if (mode === 'score') {
  console.log(`${matches}/${end - start + 1} key-hidden selections match for ${lessonId} items ${start}–${end}`);
  if (matches !== end - start + 1) process.exitCode = 1;
}
