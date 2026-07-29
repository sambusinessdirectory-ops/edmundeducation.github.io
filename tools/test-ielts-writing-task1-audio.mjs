#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDirectory, "..");
const sandbox = { window: {} };
vm.createContext(sandbox);

function run(relativePath) {
  const source = fs.readFileSync(path.join(root, relativePath), "utf8");
  vm.runInContext(source, sandbox, { filename: relativePath, timeout: 20_000 });
}

function normalizeCardText(value) {
  return String(value || "")
    .replace(/[\u2018\u2019\u02bc\u02bb\uff07]/g, "'")
    .replace(/([A-Za-z])\s+'\s*([A-Za-z])/g, "$1'$2")
    .replace(/([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b/gi, "$1'$2")
    .trim();
}

run("flashcards-ielts-writing-task1-data.js");
run("flashcards-audio-manifest.js");

const decks = sandbox.window.EDMUND_IELTS_WRITING_TASK1_SEED;
const manifest = sandbox.window.EDMUND_FLASHCARD_AUDIO;
const meta = sandbox.window.EDMUND_FLASHCARD_AUDIO_META;
assert.equal(Object.keys(decks).length, 59, "all 59 Task 1 decks must be loaded");
assert.equal(meta.complete, true, "the female voice manifest must be complete");
assert.equal(meta.count, 67163, "the full flashcard voice corpus count changed unexpectedly");
assert.equal(meta.engine, "Kokoro-82M");
assert.equal(meta.name, "Edmund Neural");
assert.equal(meta.voice, "af_heart", "Task 1 must use the established female voice");
assert.equal(meta.language, "en-us");
assert.equal(meta.speed, 0.96);
assert.equal(meta.sampleRate, 24000);
assert.equal(meta.format, "audio/mpeg");

let checkedCards = 0;
const missing = [];
for (const [deckId, cards] of Object.entries(decks)) {
  for (const card of cards) {
    const front = normalizeCardText(card.front);
    const audioUrl = manifest[front];
    if (!audioUrl) {
      missing.push(`${deckId}: ${front}`);
      continue;
    }
    if (audioUrl.startsWith("assets/")) {
      const audioPath = path.join(root, audioUrl);
      assert.ok(fs.existsSync(audioPath), `${front} points to a missing local MP3`);
      assert.ok(fs.statSync(audioPath).size > 1000, `${front} has an invalid local MP3`);
    } else {
      assert.match(
        audioUrl,
        /^https:\/\/edmund-neural-audio\.edmundeducation\.workers\.dev\/assets\/flashcards\/audio\/edmund-neural\//,
        `${front} has an unexpected voice URL`
      );
    }
    checkedCards += 1;
  }
}

assert.deepEqual(missing, [], `Missing Task 1 female audio:\n${missing.join("\n")}`);
assert.equal(checkedCards, 3631, "all 3,631 Task 1 card rows must have female audio");

const html = fs.readFileSync(path.join(root, "flashcards.html"), "utf8");
assert.match(
  html,
  /flashcards-audio-manifest\.js\?v=edmund-neural-v1-20260729-2/,
  "the flashcard audio cache key is stale"
);

console.log("IELTS Writing Task 1 female audio checks passed: 3,631/3,631 cards covered.");
