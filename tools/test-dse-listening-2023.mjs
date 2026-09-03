#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "dse-listening-2023-transcript.js"), "utf8"), context);
vm.runInNewContext(fs.readFileSync(path.join(root, "dse-listening-2023-data.js"), "utf8"), context);
const data = context.window.EDMUND_DSE_LISTENING_2023;

assert.equal(data.year, 2023);
assert.equal(data.tasks.length, 4);
assert.equal(data.questionCount, 53);

const numbers = new Set();
for (const task of data.tasks) {
  for (const block of task.blocks) {
    if (Number(block.number)) numbers.add(Number(block.number));
    const sources = [block.html, block.copy, ...(block.rows || []).flatMap((row) => [row.copy, row.concern, row.consequence])];
    for (const source of sources) String(source || "").replace(/\{\{(\d+)\}\}/g, (_, number) => numbers.add(Number(number)));
  }
}
assert.deepEqual([...numbers].sort((left, right) => left - right), Array.from({ length: 53 }, (_, index) => index + 1));

const durationLimits = { 1: 366.16, 2: 371.83, 3: 426.15, 4: 395.35 };
for (const [task, rows] of Object.entries(data.transcript.partA)) {
  assert.ok(rows.length >= 15, `Task ${task} transcript is unexpectedly short`);
  assert.ok(rows.every((row) => row.speaker && row.text && Number.isFinite(row.start) && Number.isFinite(row.end)));
  assert.ok(rows.at(-1).end <= durationLimits[task] + 0.1, `Task ${task} transcript exceeds the split recording`);
}
assert.ok(data.transcript.partB.length >= 80, "Part B transcript is unexpectedly short");
assert.ok(data.transcript.partB.at(-1).end <= 871.16 + 0.1, "Part B transcript exceeds the split recording");
assert.match(JSON.stringify(data.transcript), /Winnie Tang/);
assert.match(JSON.stringify(data.transcript), /Dante Cruz/);
assert.match(JSON.stringify(data.transcript), /Archie Lee/);

for (const file of [
  "task-2-marble-racing.jpg",
  "task-2-relay.jpg",
  "task-2-high-jump.jpg",
  "task-2-marathon.jpg",
  "task-3-mr-suess.jpg",
  "task-4-emoji-pioneers.jpg",
  "task-4-kiss-emoji.jpg"
]) {
  const stat = fs.statSync(path.join(root, "assets/dse-listening/2023", file));
  assert.ok(stat.size > 5_000, `${file} is missing or too small`);
}

console.log("2023 DSE listening data validated: 53 questions, seven source images, four complete Part A transcripts and one complete Part B transcript.");
