// Build the browser data from the three supplied, student-facing Markdown files.
// Usage: node tools/import-indefinite-pronouns.mjs <curation.md> <exercises.md> <proofreading.md>
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';

const require = createRequire(import.meta.url);
const { marked } = require('/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/marked');
const [guidePath, exercisePath, proofreadingPath] = process.argv.slice(2);
assert(guidePath && exercisePath && proofreadingPath, 'Pass the three Markdown source paths.');
const read = path => fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const guide = read(guidePath), exercise = read(exercisePath), proofreading = read(proofreadingPath);
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const safe = text => String(text).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

const conceptIds = [...guide.matchAll(/^### IP(\d{2})｜/gm)].map(match => Number(match[1]));
assert.deepEqual(conceptIds, Array.from({length:68}, (_, index) => index + 1));
// This source contains no needed raw HTML. Reject any such element so the generated
// browser data cannot import markup that the Markdown renderer would pass through.
assert(!/<\/?[a-z][^>]*>/i.test(guide), 'Review raw HTML in the guide before import.');
let guideHtml = marked.parse(guide.replace(/^# .+\n/, ''), { gfm: true });
let chapter = 0;
const chapters = [];
guideHtml = guideHtml.replace(/<h2>(.*?)<\/h2>/g, (_, title) => {
  const id = `indefinite-section-${++chapter}`;
  chapters.push({ id, title: title.replace(/<[^>]*>/g, '') });
  return `<h2 id="${id}">${title}</h2>`;
});
assert(chapters.length >= 10);
guideHtml = guideHtml.replace(/<table>/g, '<div class="grammar-new-table-wrap"><table>')
  .replace(/<\/table>/g, '</table></div>');

const exercises = [...exercise.matchAll(/^### 第 (\d+) 題\n([\s\S]*?)(?=^### 第 \d+ 題\n|(?![\s\S]))/gm)].map(match => {
  const number = Number(match[1]);
  const block = match[2].trim();
  const translation = block.match(/【([\s\S]*?)】/);
  assert(translation, `Missing Chinese context for exercise ${number}`);
  const prompt = block.slice(0, translation.index).trim().replace(/\n+/g, ' ');
  assert(prompt && !/答案：/.test(prompt), `Missing prompt for exercise ${number}`);
  return { number, prompt, translation: translation[1].trim(), section: number <= 50 ? '分組練習' : '混合練習' };
});
assert.deepEqual(exercises.map(item => item.number), Array.from({length:250}, (_, index) => index + 1));

const passages = [...proofreading.matchAll(/^### Passage (\d{2})｜([^\n]+)\n([\s\S]*?)(?=^### Passage \d{2}｜|(?![\s\S]))/gm)].map(match => {
  const number = Number(match[1]);
  const subtitle = match[3].match(/^\s*\*([^\n*]+)\*/m);
  const questions = [...match[3].matchAll(/^\*\*(\d{3})\.\*\* (.+)$/gm)].map(entry => ({ number: Number(entry[1]), sentence: entry[2].trim() }));
  assert.equal(questions.length, 20, `Passage ${number} must have 20 questions.`);
  return { number, title: match[2].trim(), subtitle: subtitle?.[1]?.trim() || '', questions };
});
assert.equal(passages.length, 10);
assert.deepEqual(passages.flatMap(p => p.questions.map(q => q.number)), Array.from({length:200}, (_, index) => index + 1));
assert(!passages.some(p => /jayden/i.test(JSON.stringify(p))), 'Remove names from published proofreading content.');

const payload = { guide: { slug: 'indefinite-pronouns', english: 'Someone, Anything, Nowhere, etc.', chinese: '不定代名詞與地點詞', count: 68, practiceCount: 250, html: guideHtml, chapters }, exercises, passages };
fs.writeFileSync('grammar-indefinite-pronouns-data.js', `// Generated from supplied Markdown; student-only sets have no answer key.\nwindow.EDMUND_INDEFINITE_PRONOUNS = ${JSON.stringify(payload)};\n`);
fs.writeFileSync('tools/indefinite-pronouns-import-manifest.json', JSON.stringify({ sourceHashes: { guide: hash(guide), exercises: hash(exercise), proofreading: hash(proofreading) }, guideConcepts: conceptIds.length, guideChapters: chapters.length, exercises: exercises.length, proofreadingPassages: passages.length, proofreadingQuestions: 200, answerKeySupplied: false }, null, 2) + '\n');
console.log(`Imported ${conceptIds.length} guide points, ${exercises.length} grammar questions, ${passages.length} proofreading passages and 200 proofreading questions.`);
