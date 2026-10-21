import fs from 'node:fs';
import vm from 'node:vm';
import { classifyIeltsPart3, labels } from './ielts-speaking-part3-types.mjs';

const context = { window: {} };
vm.runInNewContext(fs.readFileSync('speaking-system-part3-data.js', 'utf8'), context);
const payload = context.window.EDMUND_SPEAKING_PART3_DATA;
const rows = payload.books.flatMap(book => book.exercises.map(exercise => {
  const text = exercise.question?.english || exercise.title;
  return { id: exercise.id, book: book.book, number: exercise.index, theme: exercise.categoryTitle,
    text, translation: exercise.question?.chinese || exercise.titleZh || '',
    types: classifyIeltsPart3(text), href: `speaking-system.html?exercise=${encodeURIComponent(exercise.id)}` };
}));
const counts = Object.fromEntries(Object.keys(labels).map(type => [type, rows.filter(row => row.types.includes(type)).length]));
if (rows.length !== payload.metadata.exerciseCount || rows.some(row => !row.types.length || !row.text || !row.translation)) {
  throw Error('IELTS Part 3 question-type extraction is incomplete');
}
fs.writeFileSync('ielts-speaking-part3-question-types.json', JSON.stringify({ version: 1, labels, questionCount: rows.length,
  bookCount: payload.books.length, counts, rows }, null, 2) + '\n');
console.log(`IELTS Speaking Part 3: ${rows.length} questions, ${Object.keys(labels).length} types, ${counts.country} country/local and ${counts.should} should/duty questions`);
