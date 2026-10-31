// Generate exact bilingual sentence/audio records for the three essay lessons.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const context = { window: {} };
for (const file of [
  'writing-practice-model-essays-opinion-3-16-data.js',
  'writing-practice-model-essays-discuss-4-23-data.js',
  'writing-practice-model-essays-cause-2-20-data.js',
  'writing-audio-manifest.js',
]) vm.runInNewContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
const targets = [
  ['opinion:3', 'model-essay-3-ielts-opinion', 'EDMUND_IELTS_WRITING_OPINIONS_3_16_EXERCISES'],
  ['discuss-both-views:4', 'model-essay-4-ielts-discuss-both-views', 'EDMUND_IELTS_WRITING_DISCUSS_4_23_EXERCISES'],
  ['cause-solution:2', 'model-essay-2-ielts-cause-solution', 'EDMUND_IELTS_WRITING_CAUSE_2_20_EXERCISES'],
];
const tokenize = text => [...text.matchAll(/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu)].map(match => match[0]);
const lessons = {};
for (const [key, id, collection] of targets) {
  const source = context.window[collection]?.[id];
  const narration = context.window.EDMUND_WRITING_AUDIO?.[id];
  if (!source || !narration?.path || !Array.isArray(narration.words)) throw Error(`Missing canonical source/audio: ${id}`);
  const lines = source.translationSections.flatMap((section, paragraph) => section.items.map((item, index) => ({
    paragraph, index, role: item.label, english: item.english, chinese: item.chinese,
  })));
  const tokens = lines.flatMap(line => tokenize(line.english));
  if (tokens.length !== narration.words.length || tokens.some((word, index) => word !== narration.words[index][0])) {
    throw Error(`Narration differs from canonical essay: ${id}`);
  }
  let cursor = 0;
  const sentences = lines.map(line => {
    const count = tokenize(line.english).length;
    const words = narration.words.slice(cursor, cursor + count);
    const next = narration.words[cursor + count];
    cursor += count;
    return {
      ...line, words,
      start: Math.max(0, words[0][1] - 0.16),
      end: next ? Math.max(words.at(-1)[2], next[1] - 0.08) : words.at(-1)[2] + 0.4,
    };
  });
  const medium = source.practiceDifficultySets.find(set => set.key === 'medium');
  if (!medium?.answers?.length) throw Error(`Missing medium blanks: ${id}`);
  lessons[key] = { id, key, title: source.title, question: source.questionPrompt,
    audio: narration.path, sentences, mediumAnswers: medium.answers };
}
fs.writeFileSync(path.join(root, 'essay-memory-lessons-data.js'),
  `/* Generated from the canonical writing-practice essays and narration. */\nwindow.ESSAY_MEMORY_LESSONS = ${JSON.stringify(lessons, null, 2)};\n`);
