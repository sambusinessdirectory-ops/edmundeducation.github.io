import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(new URL('..', import.meta.url).pathname);
const context = { window: {} };
vm.runInNewContext(readFileSync(resolve(root, 'italian-2-torta-coi-bischeri-data.js'), 'utf8'), context);
const lesson = context.window.EDMUND_ITALIAN_LESSON_2;
assert.equal(lesson.cards.length, 48);
assert.equal(new Set(lesson.cards.map(card => card.front)).size, 48);
for (const card of lesson.cards) {
  assert.equal(card.examples.length, 5, card.front);
  assert.ok(card.meaning.includes('\n('), card.front);
  for (const example of card.examples) {
    assert.ok(example.en && example.translation && example.zh, card.front);
  }
}
const exercise = lesson.exercise;
assert.equal(exercise.paragraphs.length, 15);
assert.equal(exercise.translationSections[0].items.length, 15);
assert.equal(exercise.practiceModes.length, 4);
assert.equal(exercise.practiceDifficultySets.length, 4);
for (const [index, difficulty] of exercise.practiceDifficultySets.entries()) {
  assert.equal(difficulty.answers.length, [12, 24, 37, 50][index]);
  assert.equal(difficulty.sourceParagraphs.length, exercise.paragraphs.length);
  const blanks = difficulty.sourceParagraphs.flatMap(paragraph => paragraph.sentences.flatMap(sentence => sentence.parts.filter(part => typeof part === 'object').map(part => part.answer)));
  assert.equal(JSON.stringify(blanks), JSON.stringify(difficulty.answers));
  for (const [paragraphIndex, paragraph] of difficulty.sourceParagraphs.entries()) {
    const passage = paragraph.sentences.map(sentence => sentence.parts.map(part => typeof part === 'object' ? part.answer : part).join('')).join(' ');
    assert.equal(passage, exercise.paragraphs[paragraphIndex].sentences[0].parts[0]);
  }
}
for (const page of ['flashcards.html', 'writing-practice.html']) {
  const html = readFileSync(resolve(root, page), 'utf8');
  assert.ok(html.includes('italian-2-torta-coi-bischeri-data.js?v=20260929-1'), page);
  assert.ok(html.includes('italian-2-audio.js?v=20260929-1'), page);
  assert.ok(html.includes('editionLessons'), page);
}

const audioFile = resolve(root, 'italian-2-audio.js');
if (existsSync(audioFile)) {
  vm.runInNewContext(readFileSync(audioFile, 'utf8'), context);
  const audio = context.window.EDMUND_ITALIAN_AUDIO_2;
  assert.equal(Object.keys(audio.flashcards).length, 48);
  for (const path of Object.values(audio.flashcards)) assert.ok(existsSync(resolve(root, path)), path);
  const writing = audio.writing[exercise.id];
  assert.ok(writing && existsSync(resolve(root, writing.path)));
  assert.equal(writing.voice, 'if_sara');
  assert.equal(writing.wordCount, writing.words.length);
  assert.ok(writing.duration > 0 && writing.words.length > 200);
}
console.log('PASS: Italian Text 2 cards, examples, translations, 16 modes, site wiring and audio');
