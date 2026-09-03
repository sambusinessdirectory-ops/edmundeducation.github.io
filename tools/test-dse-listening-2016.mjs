#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "dse-listening-2016-transcript.js"), "utf8"), context);
vm.runInNewContext(fs.readFileSync(path.join(root, "dse-listening-2016-data.js"), "utf8"), context);
const data = context.window.EDMUND_DSE_LISTENING_2016;

assert.equal(data.year, 2016);
assert.equal(data.tasks.length, 4);
assert.equal(data.questionCount, 58);
assert.match(data.situation, /Chau family is on holiday in London/);
assert.match(data.instructions, /total of four tasks/);
assert.match(data.familiarisation, /two minutes/);

const numbers = new Set();
for (const task of data.tasks) {
  for (const block of task.blocks) {
    if (Number(block.number)) numbers.add(Number(block.number));
    const sources = [block.html, block.copy, ...(block.rows || []).flatMap((row) => [row.copy, row.concern, row.consequence])];
    for (const source of sources) String(source || "").replace(/\{\{(\d+)\}\}/g, (_, number) => numbers.add(Number(number)));
  }
}
assert.deepEqual([...numbers].sort((left, right) => left - right), Array.from({ length: 58 }, (_, index) => index + 1));

const durationLimits = { 1: 335.34, 2: 323.09, 3: 379.85, 4: 445.86 };
for (const [task, rows] of Object.entries(data.transcript.partA)) {
  assert.ok(rows.length >= 15, `Task ${task} transcript is unexpectedly short`);
  assert.ok(rows.every((row) => row.speaker && row.text && Number.isFinite(row.start) && Number.isFinite(row.end)));
  assert.ok(rows.at(-1).end <= durationLimits[task] + 0.1, `Task ${task} transcript exceeds the split recording`);
}
assert.ok(data.transcript.partB.length >= 40, "Part B transcript is unexpectedly short");
assert.ok(data.transcript.partB.at(-1).end <= 831.67, "Part B transcript exceeds the split recording");
assert.match(JSON.stringify(data.transcript), /Angela Chau/);
assert.match(JSON.stringify(data.transcript), /David Stott/);
assert.match(JSON.stringify(data.transcript), /Patty Leung/);
assert.match(JSON.stringify(data.transcript), /Dr Jack Jones/);

for (const file of ["cabbage-patch-doll.jpg", "space-hopper.jpg", "james-dean.jpg"]) {
  const stat = fs.statSync(path.join(root, "assets/dse-listening/2016", file));
  assert.ok(stat.size > 5_000, `${file} is missing or too small`);
}

console.log("2016 DSE listening data validated: 58 questions, three source images, four complete Part A transcripts and one complete Part B transcript.");
