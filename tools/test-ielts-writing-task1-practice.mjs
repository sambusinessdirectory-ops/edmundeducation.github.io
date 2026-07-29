import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { HOMEWORK_RESOURCE_CATALOG } from "../homework-resource-catalog.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const normalize = value => String(value || "").replace(/\s+/g, " ").trim();
const chinese = /[\u3400-\u9fff]/;

function evaluate(file, context) {
  vm.runInContext(read(file), context, { filename: file, timeout: 30_000 });
}

function paragraphText(paragraph) {
  return normalize((paragraph?.sentences || []).map(sentence =>
    (sentence?.parts || []).map(part => typeof part === "string" ? part : part?.answer || "").join("")
  ).join(" "));
}

function fileSha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

const expectedCategories = Object.freeze({
  "bar-charts": 8,
  "line-graph": 9,
  "pie-charts": 6,
  "process-diagram": 9,
  maps: 10,
  tables: 11,
  "mixed-charts": 7
});
const expectedDifficultyKeys = ["standard", "medium", "hard", "hell"];
const expectedModes = ["blank", "start", "end", "both"];

const context = { window: { location: { search: "" } }, URLSearchParams };
vm.createContext(context);
evaluate("writing-practice-ielts-task1-data.js", context);
evaluate("writing-audio-manifest.js", context);
evaluate("essay-portal-links.js", context);
evaluate("ielts-task1-downloads.js", context);
evaluate("flashcards-ielts-writing-task1-data.js", context);

const exercises = context.window.EDMUND_IELTS_WRITING_TASK1_EXERCISES;
const audio = context.window.EDMUND_WRITING_AUDIO;
const audioMeta = context.window.EDMUND_WRITING_AUDIO_META;
const portals = context.window.EDMUND_ESSAY_PORTALS;
const downloads = context.window.EDMUND_IELTS_TASK1_DOWNLOADS;
const flashcards = context.window.EDMUND_IELTS_WRITING_TASK1_SEED;

assert.equal(Object.keys(exercises).length, 60, "exactly 60 logical Task 1 writing sets should be generated");
assert.equal(downloads.length, 62, "the Download Site should retain its two additional physical source variants");
assert.equal(new Set(downloads.map(item => `${item.category}:${item.number}`)).size, 60);
assert.equal(Object.keys(flashcards).length, 59, "Maps 9 is the sole Task 1 set without a supplied Flash Cards deck");
assert.deepEqual(
  Object.fromEntries(Object.keys(expectedCategories).map(category => [
    category,
    Object.values(exercises).filter(exercise => exercise.downloadCategory === category).length
  ])),
  expectedCategories
);

let configurationCount = 0;
for (const [category, count] of Object.entries(expectedCategories)) {
  for (let number = 1; number <= count; number += 1) {
    const id = `model-essay-${number}-ielts-task1-${category}`;
    const exercise = exercises[id];
    assert.ok(exercise, `missing generated exercise ${id}`);
    assert.equal(exercise.id, id);
    assert.equal(exercise.exam, "IELTS Writing Task 1");
    assert.equal(exercise.modelEssayNumber, number);
    assert.equal(exercise.downloadCategory, category);
    assert.deepEqual([...exercise.practiceModes], expectedModes, `${id}: four cue modes must retain their established order`);
    assert.equal(Object.keys(exercise.practiceModeDetails || {}).length, 4, `${id}: four cue-mode descriptions are required`);

    const difficultySets = exercise.practiceDifficultySets || [];
    assert.deepEqual(Array.from(difficultySets, item => item.key), expectedDifficultyKeys, `${id}: all four difficulty tiers are required`);
    assert.equal(difficultySets.length * exercise.practiceModes.length, 16, `${id}: the source's 16 exercise modes must be represented`);
    configurationCount += difficultySets.length * exercise.practiceModes.length;

    assert.equal(exercise.questionPrompt?.length, 3, `${id}: task wording, IELTS instruction and word-count instruction are required`);
    assert.match(exercise.questionPrompt[0], /^(?:The|These)\b/, `${id}: the real page-2 task wording should lead the prompt`);
    assert.equal(exercise.questionPrompt[2], "Write at least 150 words.");
    assert.doesNotMatch(exercise.questionPrompt.join(" "), /spend about 20 minutes/i, `${id}: generic timing boilerplate should not replace the task wording`);
    assert.doesNotMatch(exercise.questionPrompt.join(" "), /fordifferent|features,and|selectingand|mail features|seconachart/i, `${id}: known source text-joining defects should be repaired`);

    assert.equal(exercise.questionImages?.length, 1, `${id}: one page-2 task graphic is required`);
    const imagePath = path.join(root, exercise.questionImages[0].src);
    assert.ok(fs.statSync(imagePath).size > 2_000, `${id}: cropped task graphic is missing or implausibly small`);
    const imageHeader = fs.readFileSync(imagePath).subarray(0, 12);
    assert.equal(imageHeader.subarray(0, 4).toString("ascii"), "RIFF", `${id}: task graphic should be WebP`);
    assert.equal(imageHeader.subarray(8, 12).toString("ascii"), "WEBP", `${id}: task graphic should be WebP`);

    assert.equal(exercise.paragraphs?.length, 4, `${id}: canonical Task 1 essay should contain four paragraphs`);
    assert.equal(exercise.translation?.length, 4, `${id}: every paragraph needs Traditional Chinese support`);
    assert.equal(exercise.translationSections?.length, 4, `${id}: bilingual study view should preserve four sections`);
    const canonicalParagraphs = exercise.paragraphs.map(paragraphText);
    const canonical = canonicalParagraphs.join("\n\n");
    const canonicalWordCount = canonical.split(/\s+/).filter(Boolean).length;
    assert.ok(canonicalWordCount >= 150 && canonicalWordCount <= 350, `${id}: canonical essay word count is implausible (${canonicalWordCount})`);

    canonicalParagraphs.forEach((paragraph, paragraphIndex) => {
      const section = exercise.translationSections[paragraphIndex];
      assert.ok(paragraph.length > 40, `${id}: paragraph ${paragraphIndex + 1} is implausibly short`);
      assert.equal(
        normalize((section?.items || []).map(item => item.english).join(" ")),
        paragraph,
        `${id}: bilingual English must reconstruct paragraph ${paragraphIndex + 1}`
      );
      assert.ok((section?.items || []).every(item => chinese.test(item.chinese || "")), `${id}: each bilingual segment needs Chinese`);
      assert.ok(chinese.test(exercise.translation[paragraphIndex] || ""), `${id}: paragraph ${paragraphIndex + 1} needs Chinese`);
    });

    for (const difficulty of difficultySets) {
      assert.ok(difficulty.answers?.length > 0, `${id}/${difficulty.key}: answer list is empty`);
      let cursor = 0;
      for (const [answerIndex, answer] of difficulty.answers.entries()) {
        const found = canonical.indexOf(answer, cursor);
        assert.ok(found >= 0, `${id}/${difficulty.key}: answer ${answerIndex + 1} is not an ordered canonical span: ${answer}`);
        cursor = found + answer.length;
      }
    }

    const key = `${category}:${number}`;
    assert.equal(portals.writingExerciseId(key), id);
    assert.ok(downloads.some(item => portals.fromDownloadItem(item) === key), `${id}: Download Site link target is missing`);
    const flashDeckId = portals.flashDeckId(key);
    if (category === "maps" && number === 9) {
      assert.equal(portals.hasFlashcards(key), false);
      assert.equal(Boolean(flashcards[flashDeckId]), false);
    } else {
      assert.equal(portals.hasFlashcards(key), true);
      assert.ok(flashcards[flashDeckId]?.length > 0, `${id}: reciprocal Flash Cards deck is missing`);
    }

    const manifestEntry = audio[id];
    assert.ok(manifestEntry, `${id}: whole-essay female narration is missing`);
    assert.ok(manifestEntry.duration > 20 && manifestEntry.duration < 300, `${id}: narration duration is implausible`);
    assert.equal(manifestEntry.wordCount, manifestEntry.words?.length, `${id}: narration timing count is inconsistent`);
    assert.ok(manifestEntry.words?.length >= 150, `${id}: narration word timings are incomplete`);
    const audioPath = path.join(root, manifestEntry.path);
    assert.ok(fs.statSync(audioPath).size > 10_000, `${id}: narration MP3 is missing or implausibly small`);
  }
}

assert.equal(configurationCount, 960, "60 sets × 16 exercise configurations should be available");
assert.equal(audioMeta.count, 310, "writing narration manifest should cover the existing 250 plus 60 new essays");
assert.equal(audioMeta.complete, true);
assert.equal(audioMeta.engine, "Kokoro-82M");
assert.equal(audioMeta.voice, "af_heart", "whole essays should use the established female voice");
assert.equal(audioMeta.language, "en-us");
assert.equal(audioMeta.sampleRate, 24_000);
assert.equal(audioMeta.format, "audio/mpeg");

const maps6 = exercises["model-essay-6-ielts-task1-maps"];
const maps9 = exercises["model-essay-9-ielts-task1-maps"];
assert.deepEqual(Array.from(maps9.questionPrompt), Array.from(maps6.questionPrompt), "Maps 9 should use the audited matching Grange Park prompt from Maps 6");
assert.equal(JSON.stringify(maps9.translationSections), JSON.stringify(maps6.translationSections), "Maps 9 should use the audited matching Grange Park bilingual source");
assert.equal(
  fileSha256(path.join(root, maps9.questionImages[0].src)),
  fileSha256(path.join(root, maps6.questionImages[0].src)),
  "Maps 9 should use the audited matching Grange Park task graphic"
);

const mixed4 = exercises["model-essay-4-ielts-task1-mixed-charts"];
const mixed5 = exercises["model-essay-5-ielts-task1-mixed-charts"];
assert.deepEqual(Array.from(mixed4.questionPrompt), Array.from(mixed5.questionPrompt), "Mixed Charts 4 should use its audited export-earnings prompt source");
assert.equal(
  fileSha256(path.join(root, mixed4.questionImages[0].src)),
  fileSha256(path.join(root, mixed5.questionImages[0].src)),
  "Mixed Charts 4 should use its audited export-earnings task graphic"
);

const mixed6 = exercises["model-essay-6-ielts-task1-mixed-charts"];
const mixed7 = exercises["model-essay-7-ielts-task1-mixed-charts"];
assert.deepEqual(Array.from(mixed7.questionPrompt), Array.from(mixed6.questionPrompt), "Mixed Charts 7 should use its audited Ashdown Museum prompt source");
assert.equal(JSON.stringify(mixed7.translationSections), JSON.stringify(mixed6.translationSections), "Mixed Charts 7 should use its exact duplicate's bilingual source");
assert.equal(
  fileSha256(path.join(root, mixed7.questionImages[0].src)),
  fileSha256(path.join(root, mixed6.questionImages[0].src)),
  "Mixed Charts 7 should use its audited Ashdown Museum task graphic"
);

const homeworkTask1 = HOMEWORK_RESOURCE_CATALOG.filter(resource =>
  /^fill:model-essay-\d+-ielts-task1-/.test(resource.id)
);
assert.equal(homeworkTask1.length, 60, "Homework/Schedule should itemise all Task 1 writing sets");
for (const exercise of Object.values(exercises)) {
  assert.ok(
    homeworkTask1.some(resource => resource.id === `fill:${exercise.id}` && resource.url === `writing-practice.html?exercise=${exercise.id}`),
    `${exercise.id}: exact Homework/Schedule deep link is missing`
  );
}

const html = read("writing-practice.html");
assert.match(html, /writing-practice-ielts-task1-data\.js\?v=20260730-1/);
assert.match(html, /writing-audio-manifest\.js\?v=writing-audio-v5-20260730-1/);
assert.match(html, /window\.EDMUND_IELTS_WRITING_TASK1_EXERCISES/);
assert.match(html, /questionImages/);
assert.match(html, /writingEssayPortalLinksHtml/);

console.log("IELTS Writing Task 1 practice verified: 60 sets, 960 configurations, 60 prompt graphics, bilingual essays, female narration, reciprocal portals and Homework/Schedule links.");
