#!/usr/bin/env node
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import vm from 'node:vm';

const dataUrl = new URL('../flashcards-sunny-s3-grammar-book-data.js', import.meta.url);
const source = readFileSync(dataUrl, 'utf8');
const existing = [{ front: 'Existing deck must stay intact' }];
const sandbox = { window: { EDMUND_FLASHCARD_SEED: { existing } } };
vm.runInNewContext(source, sandbox, { filename: dataUrl.pathname, timeout: 1000 });
const seed = sandbox.window.EDMUND_SUNNY_S3_GRAMMAR_BOOK_SEED;
const prefix = 'custom-setup/sunny-s3-grammar-book';
const deckIds = Array.from({ length: 47 }, (_, index) => `${prefix}/page-${index + 1}`);
assert.deepEqual(Object.keys(seed), deckIds, 'Expected exactly Page 1–47 in numeric order');
assert.equal(sandbox.window.EDMUND_FLASHCARD_SEED.existing, existing, 'Import replaced an existing deck');

const counts = [17, 17, 17, 20, 25, 22, 13];
const sourcePages = [[1, 2], [2, 3], [3, 4, 5], [5, 6], [6, 7, 8, 9], [9, 10], [10, 11]];
// Content-only digests independently checked against every bilingual cell in the supplied PDF.
const pdfContentDigests = [
  "07593498f59819d99d8e3aee578e9f19b45801ed563d0ca43438b1efc4ee5674",
  "c10f9ea8603b754d32014406a32bd792493c70aeac9a50a1c55c9d87363dc73e",
  "d97a954e85a03d421e631731d8fb4d394795f99d9e87ab2e349dfaa13648bf37",
  "f37692eba34a256de03d3f0f9c2db7f775b79b1cba3c987852c65d72e12777dd",
  "62947ea8a6eda0307d8cc704ff5f4558b75b736a45876fac0a616ac3b7bafc11",
  "a8fbf6511473f59a1e066ff1ded5ecf7b86517e966f993c82e6845f132d58ba5",
  "3e98b83fb1bf3dca8aa61a87e83140437e1ac9a5bada15d9871cd0c198451f7c"
];
let cardCount = 0;
let exampleCount = 0;
for (const [index, id] of deckIds.entries()) {
  const cards = seed[id];
  assert.ok(Array.isArray(cards), `${id}: missing card list`);
  assert.equal(cards.length, counts[index] || 0, `${id}: unexpected number of cards`);
  assert.equal(sandbox.window.EDMUND_FLASHCARD_SEED[id], cards, `${id}: seed not registered`);
  const fronts = new Set();
  for (const [cardIndex, card] of cards.entries()) {
    const label = `${id} card ${cardIndex + 1}`;
    assert.equal(typeof card.front, 'string', `${label}: front must be text`);
    assert.match(card.front, /[a-z]/i, `${label}: missing English front`);
    assert.match(card.meaning, /[\u3400-\u9fff]/u, `${label}: missing Chinese meaning`);
    assert.doesNotMatch(card.front, /^(?:table\s*)?\d+$/i, `${label}: table-number cell was imported`);
    assert.doesNotMatch(card.meaning, /^(?:表\s*)?\d+$/u, `${label}: table-number cell was imported`);
    assert.ok(!fronts.has(card.front), `${label}: duplicate front`);
    fronts.add(card.front);
    assert.equal(card.source, 'Flash card system for website - Custom Made.pdf', `${label}: source filename`);
    assert.equal(card.sourceTable, index + 1, `${label}: wrong source table`);
    assert.ok(sourcePages[index].includes(card.sourcePage), `${label}: invalid source page`);
    assert.equal(card.examples.length, 5, `${label}: five examples required`);
    for (const [exampleIndex, example] of card.examples.entries()) {
      assert.match(example.en, /[a-z]/i, `${label}: missing English example ${exampleIndex + 1}`);
      assert.match(example.zh, /[\u3400-\u9fff]/u, `${label}: missing Chinese example ${exampleIndex + 1}`);
      assert.doesNotMatch(`${example.en}${example.zh}`, /\uFFFD|\u0000/u, `${label}: corrupt example text`);
    }
    assert.doesNotMatch(`${card.front}${card.meaning}`, /\uFFFD|\u0000/u, `${label}: corrupt card text`);
    cardCount += 1;
    exampleCount += card.examples.length;
  }
  if (index < counts.length) {
    const content = Array.from(cards, ({ front, meaning, examples }) => ({
      front, meaning, examples: Array.from(examples, ({ en, zh }) => ({ en, zh }))
    }));
    const digest = createHash('sha256').update(JSON.stringify(content)).digest('hex');
    assert.equal(digest, pdfContentDigests[index], `${id}: text differs from the verified PDF import`);
  }
}
assert.equal(cardCount, 131);
assert.equal(exampleCount, 655);
const audioSandbox = { window: {} };
const audioUrl = new URL('../flashcards-audio-manifest.js', import.meta.url);
vm.runInNewContext(readFileSync(audioUrl, 'utf8'), audioSandbox, { filename: audioUrl.pathname, timeout: 5000 });
const audioManifest = audioSandbox.window.EDMUND_FLASHCARD_AUDIO;
assert.equal(audioSandbox.window.EDMUND_FLASHCARD_AUDIO_META?.complete, true, 'Audio generation is incomplete');
const spokenFronts = new Set(Object.values(seed).flat().map(card => card.front
  .replace(/[\u2018\u2019\u02bc\u02bb\uff07]/g, "'")
  .replace(/([A-Za-z])\s+'\s*([A-Za-z])/g, "$1'$2")
  .replace(/([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b/gi, "$1'$2")
  .trim()));
assert.equal(spokenFronts.size, 131, 'Expected audio for all 131 unique terms');
for (const front of spokenFronts) {
  const audioPath = audioManifest[front];
  assert.ok(audioPath, `Missing term audio: ${front}`);
  if (!audioPath.startsWith('https://')) {
    const file = new URL(`../${audioPath}`, import.meta.url);
    assert.ok(statSync(file).size > 1000, `Missing or empty term audio: ${front}`);
  }
}
console.log(JSON.stringify({ decks: deckIds.length, populatedDecks: counts.length, cards: cardCount, bilingualExamples: exampleCount, audioTerms: spokenFronts.size, pdfTextVerified: true }));
