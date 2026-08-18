#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const exerciseId = "hkfsd-incident-report-3";
const flashDeckId = "government/hkfsd/incident-reports/incident-report-3";
const expectedModes = ["blank", "start", "end", "both"];
const expectedDifficulties = ["standard", "medium", "hard", "hell"];
const expectedSourceExercises = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]];
const expectedBlankCounts = [30, 45, 75, 70];

const sandbox = { window: {} };
vm.runInNewContext(read("writing-practice-hkfsd-incident-report-data.js"), sandbox, {
  filename: "writing-practice-hkfsd-incident-report-data.js",
  timeout: 30_000
});
vm.runInNewContext(read("writing-audio-manifest.js"), sandbox, {
  filename: "writing-audio-manifest.js",
  timeout: 30_000
});

const exercise = sandbox.window.EDMUND_HKFSD_INCIDENT_REPORT_EXERCISES?.[exerciseId];
assert.ok(exercise, "Incident Report 3 writing exercise missing");
assert.equal(exercise.id, exerciseId);
assert.equal(exercise.title, "Incident Report 3");
assert.equal(exercise.exam, "HKFSD");
assert.equal(exercise.taskType, "事故報告 Incident Report");
assert.equal(exercise.sourceFile, "Fill in the blanks - HKFSD - Incident Report 3.pdf");
assert.equal(exercise.sourcePageCount, 15);
assert.equal(exercise.showWordBank, false);
assert.deepEqual(Array.from(exercise.practiceModes), expectedModes);
assert.deepEqual(Array.from(exercise.practiceDifficultySets, set => set.key), expectedDifficulties);
assert.equal(exercise.practiceModes.length * exercise.practiceDifficultySets.length, 16);
assert.deepEqual(Array.from(exercise.paragraphs, paragraph => paragraph.sentences.length), [2, 5, 5, 4, 3]);

const canonical = exercise.paragraphs.flatMap(paragraph => paragraph.sentences)
  .map(sentence => sentence.parts.map(part => typeof part === "string" ? part : part?.answer || "").join(""))
  .join(" ");
assert.match(canonical, /^At 18:07 hours on 9 July 2026,/);
assert.match(canonical, /returned to the station at 19:18 hours\.$/);
for (const [index, difficulty] of exercise.practiceDifficultySets.entries()) {
  assert.deepEqual(Array.from(difficulty.sourceExerciseNumbers), expectedSourceExercises[index]);
  assert.equal(difficulty.answers.length, expectedBlankCounts[index]);
  let cursor = 0;
  for (const [answerIndex, answer] of difficulty.answers.entries()) {
    const found = canonical.indexOf(answer, cursor);
    assert.ok(found >= 0, `${difficulty.key}: answer ${answerIndex + 1} is not an ordered canonical span: ${answer}`);
    cursor = found + answer.length;
  }
}

const audio = sandbox.window.EDMUND_WRITING_AUDIO?.[exerciseId];
const audioMeta = sandbox.window.EDMUND_WRITING_AUDIO_META;
assert.ok(audio, "whole-report Kokoro audio missing");
assert.equal(audio.wordCount, 326);
assert.equal(audio.words?.length, 326, "word-level highlighting timings are incomplete");
assert.ok(audio.duration > 120 && audio.duration < 180, `audio duration is implausible (${audio.duration})`);
assert.ok(fs.statSync(path.join(root, audio.path)).size > 10_000, "writing MP3 missing or implausibly small");
assert.equal(audioMeta?.count, 321);
assert.equal(audioMeta?.complete, true);
assert.equal(audioMeta?.engine, "Kokoro-82M");
assert.equal(audioMeta?.voice, "af_heart");

const html = read("writing-practice.html");
assert.match(html, /writing-practice-hkfsd-incident-report-data\.js\?v=20260818-1/);
assert.match(html, /writing-audio-manifest\.js\?v=writing-audio-v5-20260818-1/);
assert.match(html, /key:\s*"incident-reports"/);
assert.match(html, /label:\s*"事故報告 Incident Report"/);
assert.match(html, /items:\s*Array\.from\(\{ length: 10 \}/);
assert.match(html, /number === 3 \? "hkfsd-incident-report-3" : ""/);
assert.match(html, /currentPathwayLevel === "government-category"/);
assert.match(html, /data-open-government-category/);

const { HOMEWORK_RESOURCE_CATALOG } = await import(
  `${pathToFileURL(path.join(root, "homework-resource-catalog.mjs")).href}?hkfsd-writing=${Date.now()}`
);
const homework = HOMEWORK_RESOURCE_CATALOG.filter(resource => resource.id === `fill:${exerciseId}`);
assert.equal(homework.length, 1, "Homework must itemize Incident Report 3 exactly once");
assert.equal(homework[0].url, `writing-practice.html?exercise=${exerciseId}`);
assert.equal(homework[0].sectionKey, "government-writing");

const { WRITING_SUBMISSION_REFERENCE_DATA } = await import(
  `${pathToFileURL(path.join(root, "writing-submission-reference-data.mjs")).href}?hkfsd-writing=${Date.now()}`
);
const reference = WRITING_SUBMISSION_REFERENCE_DATA[exerciseId];
assert.equal(reference?.flashDeckId, flashDeckId);
assert.equal(reference?.vocabulary.length, 86);
assert.equal(reference?.paragraphs.length, 5);

console.log("HKFSD Incident Report 3 Writing Practice verified: 16 modes, canonical blanks, Kokoro narration, hierarchy, Homework and Writing Submission links.");
