import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceFiles = [
  'speaking-system-part1-data.js',
  'speaking-system-data.js',
  'speaking-system-part3-data.js',
  'dse-speaking-data.js',
  'dse-speaking-paper-supplement.js',
  'dse-speaking-exclusions.js'
];

export function buildWritingSpeakingTopics() {
  const sandbox = { window: {} };
  for (const filename of sourceFiles) {
    vm.runInNewContext(fs.readFileSync(path.join(root, filename), 'utf8'), sandbox, { filename });
  }
  const data = sandbox.window;
  const contexts = {};
  const questions = [];
  const dseSets = new Map();
  for (const set of [...data.EDMUND_DSE_SPEAKING_DATA.sets, ...data.EDMUND_DSE_SPEAKING_SUPPLEMENT.sets]) {
    dseSets.set(`${set.year}:${set.set}`, set);
  }
  for (const set of dseSets.values()) {
    const contextId = `dse-${set.year}-${set.set}`;
    contexts[contextId] = String(set.sourceText || '').trim();
    for (const [part, source] of [
      ['dse-group', set.groupDiscussion],
      ['dse-individual', set.individualResponse]
    ]) {
      source.forEach((question, index) => questions.push({
        id: `${contextId}-${part}-${index + 1}`,
        category: part,
        year: set.year,
        set: set.set,
        title: set.title,
        number: index + 1,
        contextId,
        question: String(question).trim()
      }));
    }
  }
  for (const book of data.EDMUND_SPEAKING_PART1_DATA.books) {
    for (const exercise of book.exercises) {
      for (const question of exercise.questions) questions.push({
        id: `${exercise.id}-question-${question.number}`,
        category: 'ielts-1',
        book: book.book,
        title: exercise.title,
        titleZh: exercise.titleZh || '',
        number: question.number,
        question: question.questionEn,
        questionZh: question.questionZh || ''
      });
    }
  }
  for (const book of data.EDMUND_SPEAKING_DATA.books) {
    for (const exercise of book.exercises) questions.push({
      id: exercise.id,
      category: 'ielts-2',
      book: book.book,
      title: exercise.cue.titleEn || exercise.title,
      titleZh: exercise.cue.titleZh || '',
      question: exercise.cue.promptEn,
      questionZh: exercise.cue.promptZh || '',
      hints: exercise.cue.hints.map(hint => String(hint.en || '').trim()).filter(Boolean)
    });
  }
  for (const book of data.EDMUND_SPEAKING_PART3_DATA.books) {
    for (const exercise of book.exercises) questions.push({
      id: exercise.id,
      category: 'ielts-3',
      book: book.book,
      title: exercise.categoryTitle || exercise.title,
      titleZh: exercise.titleZh || '',
      question: exercise.question.english,
      questionZh: exercise.question.chinese || ''
    });
  }
  const ids = new Set();
  for (const item of questions) {
    if (!item.id || !item.question || ids.has(item.id)) throw new Error(`Invalid or duplicate speaking question: ${item.id}`);
    ids.add(item.id);
  }
  return { schemaVersion: 1, contexts, questions };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const catalog = buildWritingSpeakingTopics();
  const destination = path.join(root, 'writing-speaking-topics.json');
  fs.writeFileSync(destination, `${JSON.stringify(catalog)}\n`);
  const categories = ['dse-group', 'dse-individual', 'ielts-1', 'ielts-2', 'ielts-3'];
  const counts = {};
  for (const category of categories) {
    const questions = catalog.questions.filter(item => item.category === category);
    const contextIds = new Set(questions.map(item => item.contextId).filter(Boolean));
    const contexts = Object.fromEntries([...contextIds].map(id => [id, catalog.contexts[id]]));
    const chunk = { schemaVersion: 1, category, contexts, questions };
    fs.writeFileSync(path.join(root, `writing-speaking-topics-${category}.json`), `${JSON.stringify(chunk)}\n`);
    counts[category] = questions.length;
  }
  fs.writeFileSync(path.join(root, 'writing-speaking-topics-manifest.json'), `${JSON.stringify({ schemaVersion: 1, counts })}\n`);
  console.log(`Wrote ${catalog.questions.length} speaking questions to ${destination}`);
}
