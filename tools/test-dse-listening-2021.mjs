#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "dse-listening-2021-transcript.js"), "utf8"), context);
vm.runInNewContext(fs.readFileSync(path.join(root, "dse-listening-2021-data.js"), "utf8"), context);
const data = context.window.EDMUND_DSE_LISTENING_2021;

assert.equal(data.year, 2021);
assert.equal(data.tasks.length, 4);
assert.equal(data.questionCount, 56);
assert.match(data.situation, /Events Horizon/);
assert.match(data.situation, /World Expos/);
assert.match(data.instructions, /total of four tasks/);
assert.match(data.familiarisation, /two minutes/);

const numbers = new Set();
for (const task of data.tasks) {
  for (const block of task.blocks) {
    if (Number(block.number)) numbers.add(Number(block.number));
    String(block.html || "").replace(/\{\{(\d+)\}\}/g, (_, number) => numbers.add(Number(number)));
  }
}
assert.deepEqual([...numbers].sort((left, right) => left - right), Array.from({ length: 56 }, (_, index) => index + 1));

const durationLimits = { 1: 406.55, 2: 408.54, 3: 372.54, 4: 461.04 };
for (const [task, rows] of Object.entries(data.transcript.partA)) {
  assert.ok(rows.length >= 50, `Task ${task} transcript is unexpectedly short`);
  assert.ok(rows.every((row) => row.speaker && row.text && Number.isFinite(row.start) && Number.isFinite(row.end)));
  assert.ok(rows.at(-1).end <= durationLimits[task] + 0.1, `Task ${task} transcript exceeds the split recording`);
}
assert.ok(data.transcript.partB.length >= 100, "Part B transcript is unexpectedly short");
assert.ok(data.transcript.partB.at(-1).end <= 849.54, "Part B transcript exceeds the split recording");
assert.match(JSON.stringify(data.transcript), /Professor Leung/);
assert.match(JSON.stringify(data.transcript), /Ota Benga/);
assert.match(JSON.stringify(data.transcript), /Lara Terranova/);
assert.match(JSON.stringify(data.transcript), /Victor Laurent/);
assert.match(JSON.stringify(data.transcript), /Anthony Au/);

const image = fs.statSync(path.join(root, "assets/dse-listening/2021/ota-benga.jpg"));
assert.ok(image.size > 5_000, "Ota Benga source image is missing or too small");

console.log("2021 DSE listening data validated: 56 questions, one source image, four complete Part A transcripts and one complete Part B transcript.");
