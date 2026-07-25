#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const years = ["2019", "2020", "2021", "2022", "2024", "2025"];
const sandbox = { window: {} };

function run(relativePath) {
  const source = fs.readFileSync(path.join(siteDir, relativePath), "utf8");
  vm.runInNewContext(source, sandbox, { filename: relativePath });
}

function normalizeCardText(value) {
  return String(value || "")
    .replace(/[\u2018\u2019\u02bc\u02bb\uff07]/g, "'")
    .replace(/([A-Za-z])\s+'\s*([A-Za-z])/g, "$1'$2")
    .replace(/([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b/gi, "$1'$2")
    .trim();
}

run("flashcards-dse-listening-data.js");
run("flashcards-audio-manifest.js");

const manifest = sandbox.window.EDMUND_FLASHCARD_AUDIO;
const meta = sandbox.window.EDMUND_FLASHCARD_AUDIO_META;
assert.equal(meta.complete, true, "The flashcard audio manifest must be complete");
assert.equal(meta.engine, "Kokoro-82M");
assert.equal(meta.voice, "af_heart");
assert.equal(meta.language, "en-us");
assert.equal(meta.speed, 0.96);
assert.equal(meta.sampleRate, 24000);

let checkedCards = 0;
const missing = [];
for (const year of years) {
  const deckId = `dse/paper-3/podcast/${year}`;
  for (const card of sandbox.window.EDMUND_FLASHCARD_SEED[deckId]) {
    const front = normalizeCardText(card.front);
    const audioUrl = manifest[front];
    if (!audioUrl) {
      missing.push(`${deckId}: ${front}`);
      continue;
    }
    if (audioUrl.startsWith("assets/")) {
      const audioPath = path.join(siteDir, audioUrl);
      assert.ok(fs.existsSync(audioPath), `${front} points to a missing local MP3`);
      assert.ok(fs.statSync(audioPath).size > 1000, `${front} has an invalid local MP3`);
    } else {
      assert.match(
        audioUrl,
        /^https:\/\/edmund-neural-audio\.edmundeducation\.workers\.dev\/assets\/flashcards\/audio\/edmund-neural\//,
        `${front} has an unexpected audio URL`
      );
    }
    checkedCards += 1;
  }
}

assert.deepEqual(missing, [], `Missing Podcast audio:\n${missing.join("\n")}`);
assert.equal(checkedCards, 851, "All 851 Podcast card rows must have neural audio");
console.log("DSE Paper 3 Podcast audio checks passed: 851/851 card rows covered.");
