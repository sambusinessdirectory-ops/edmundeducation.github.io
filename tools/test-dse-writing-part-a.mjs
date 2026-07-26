import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(process.argv[2] || dirname(fileURLToPath(import.meta.url)));
const dataPath = resolve(root, "writing-practice-dse-part-a-data.js");
const htmlPath = resolve(root, "writing-practice.html");
const expected = new Map([
  ["dse-writing-2012-part-a", [30, 45, 75, 57]],
  ["dse-writing-2013-part-a", [32, 45, 75, 63]],
  ["dse-writing-2014-part-a", [30, 45, 75, 55]],
  ["dse-writing-2015-part-a-argument-for", [30, 45, 75, 40]],
  ["dse-writing-2015-part-a-argument-against", [31, 45, 75, 45]],
  ["dse-writing-2016-part-a", [33, 45, 75, 54]],
  ["dse-writing-2017-part-a", [32, 45, 75, 40]],
  ["dse-writing-2018-part-a", [33, 45, 75, 59]],
  ["dse-writing-2019-part-a", [33, 45, 75, 38]],
  ["dse-writing-2020-part-a", [32, 45, 75, 63]],
  ["dse-writing-2021-part-a", [30, 45, 75, 40]],
  ["dse-writing-2022-part-a", [33, 45, 75, 47]],
  ["dse-writing-2023-part-a", [29, 45, 75, 39]],
  ["dse-writing-2024-part-a", [32, 45, 75, 75]],
  ["dse-writing-2025-part-a", [30, 45, 75, 54]]
]);
const difficultyKeys = ["standard", "medium", "hard", "hell"];
const practiceModes = ["blank", "start", "end", "both"];
const wordPattern = /[^\W_]+(?:[’'][^\W_]+)*(?:-[^\W_]+)*/gu;

function loadWindowScript(path) {
  const window = {};
  vm.runInNewContext(readFileSync(path, "utf8"), { window });
  return window;
}

function sentenceText(sentence) {
  return sentence.parts.map(part => typeof part === "string" ? part : part.answer).join("");
}

function paragraphText(paragraph) {
  return paragraph.sentences.map(sentenceText).join(" ");
}

function splitByAnswers(text, answers, state) {
  const parts = [];
  let cursor = 0;
  while (state.index < answers.length) {
    const answer = answers[state.index];
    const found = text.indexOf(answer, cursor);
    if (found < 0) break;
    if (found > cursor) parts.push(text.slice(cursor, found));
    parts.push({ answer });
    cursor = found + answer.length;
    state.index += 1;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.length ? parts : [text];
}

function reconstruct(exercise, answers, paragraphScoped = false) {
  const state = { index: 0 };
  const paragraphs = exercise.paragraphs.map(paragraph => {
    if (paragraphScoped) {
      return { sentences: [{ parts: splitByAnswers(paragraphText(paragraph), answers, state) }] };
    }
    return {
      sentences: paragraph.sentences.map(sentence => ({
        parts: splitByAnswers(sentenceText(sentence), answers, state)
      }))
    };
  });
  return { state, paragraphs };
}

function normalized(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—‐]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const dataWindow = loadWindowScript(dataPath);
const exercises = dataWindow.EDMUND_DSE_WRITING_PART_A_EXERCISES;
assert.equal(Object.keys(exercises).length, 15, "exactly 15 Part A exercises should be exported");
assert.deepEqual(new Set(Object.keys(exercises)), new Set(expected.keys()), "exercise IDs should match the route catalog");

for (const [id, counts] of expected) {
  const exercise = exercises[id];
  assert.equal(exercise.id, id);
  assert.ok(exercise.title);
  assert.match(exercise.exam, /DSE Writing Part A/);
  assert.ok(Array.isArray(exercise.questionPrompt) && exercise.questionPrompt.length, `${id}: question transcript missing`);
  assert.deepEqual(Array.from(exercise.practiceModes), practiceModes, `${id}: cue modes`);
  assert.deepEqual(
    Array.from(exercise.practiceDifficultySets, set => set.key),
    difficultyKeys,
    `${id}: difficulty modes`
  );
  assert.ok(Array.isArray(exercise.paragraphs) && exercise.paragraphs.length, `${id}: essay missing`);
  assert.ok(Array.isArray(exercise.translationSections) && exercise.translationSections.length, `${id}: translation missing`);

  const canonicalParagraphs = exercise.paragraphs.map(paragraphText);
  const canonical = canonicalParagraphs.join("\n\n");
  assert.ok(canonical.length > 500, `${id}: essay is unexpectedly short`);

  exercise.practiceDifficultySets.forEach((set, index) => {
    assert.equal(set.answers.length, counts[index], `${id} ${set.key}: answer count`);
    assert.ok(set.answers.every(answer => typeof answer === "string" && answer.trim() === answer && answer.length));
    let built = reconstruct(exercise, set.answers);
    if (built.state.index !== set.answers.length) built = reconstruct(exercise, set.answers, true);
    assert.equal(built.state.index, set.answers.length, `${id} ${set.key}: every answer must align`);
    assert.deepEqual(built.paragraphs.map(paragraphText), canonicalParagraphs, `${id} ${set.key}: canonical reconstruction`);
  });

  const translatedEnglish = exercise.translationSections
    .flatMap(section => section.items || section.units || section.sentences || [])
    .map(item => normalized(Array.isArray(item) ? item[1] : item.english || item.en || item.text))
    .filter(Boolean);
  const translatedChinese = exercise.translationSections
    .flatMap(section => section.items || section.units || section.sentences || [])
    .map(item => String(Array.isArray(item) ? item[2] : item.chinese || item.zh || item.translation || "").trim())
    .filter(Boolean);
  assert.equal(translatedEnglish.length, translatedChinese.length, `${id}: English/Chinese translation pair count`);
  exercise.paragraphs.flatMap(paragraph => paragraph.sentences).forEach(sentence => {
    const text = normalized(sentenceText(sentence));
    assert.ok(
      translatedEnglish.some(english => english === text || english.includes(text) || text.includes(english)),
      `${id}: no translation pair for ${sentenceText(sentence)}`
    );
  });

  for (const image of exercise.questionImages || []) {
    const src = typeof image === "string" ? image : image.src;
    assert.ok(existsSync(resolve(root, src)), `${id}: missing question image ${src}`);
  }
}

const html = readFileSync(htmlPath, "utf8");
assert.match(html, /writing-practice-dse-part-a-data\.js\?v=/);
for (const id of expected.keys()) assert.ok(html.includes(id), `route missing ${id}`);

if (process.argv.includes("--audio")) {
  const audioWindow = loadWindowScript(resolve(root, "writing-audio-manifest.js"));
  for (const [id] of expected) {
    const exercise = exercises[id];
    const entry = audioWindow.EDMUND_WRITING_AUDIO[id];
    assert.ok(entry, `${id}: audio manifest entry missing`);
    const words = Array.from(exercise.paragraphs)
      .flatMap(paragraph => Array.from(paragraph.sentences))
      .flatMap(sentence => sentenceText(sentence).match(wordPattern) || []);
    assert.deepEqual(Array.from(entry.words, row => row[0]), words, `${id}: word timings do not match essay`);
    assert.ok(existsSync(resolve(root, entry.path)), `${id}: audio MP3 missing`);
  }
}

console.log("DSE Writing Part A validation passed: 15 exercises, 60 difficulty sets, 240 rendered combinations.");
