#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

const [html, script, catalogue, worker, home] = await Promise.all([
  read("listening-system.html"),
  read("listening-system.js"),
  read("listening-system-catalog.js"),
  read("workers/edmund-audio/src/index.js"),
  read("index.html")
]);

assert.match(html, /data-system="listening"/);
assert.match(html, /DSE Paper 3 Part A 聆聽/);
assert.match(html, /IELTS 聆聽/);
assert.match(html, /Practice 1 → 20/);
assert.match(html, /Practice 20 → 1/);
assert.match(html, /listening-system-catalog\.js/);
assert.match(html, /shared-system-nav\.js/);
assert.match(script, /flashcard_student_login/);
assert.match(script, /flashcard_student_session_profile/);
assert.match(script, /Array\.isArray\(payload\?\.tracks\)/);
assert.match(script, /const SPEEDS = Object\.freeze\(\[0\.25, 0\.5, 0\.75, 1, 1\.25, 1\.5, 1\.75, 2\]\)/);
assert.match(script, /audio\.playbackRate = state\.speed/);
assert.match(catalogue, /Array\.from\(\{ length: 20 \}/);
assert.match(catalogue, /Array\.from\(\{ length: 4 \}/);
assert.match(catalogue, /listening-system\.html\?section=ielts&practice=/);
assert.match(worker, /\/v1\/listening\/catalog/);
assert.match(worker, /IELTS Listening - Recordings\//);

const scheduleIndex = home.indexOf('href="schedule-system.html"');
const flashcardIndex = home.indexOf('href="flashcards.html"');
const parentIndex = home.indexOf('href="parent-communication.html"');
const listeningIndex = home.indexOf('href="listening-system.html"');
assert.ok(scheduleIndex >= 0 && flashcardIndex > scheduleIndex, "Schedule must precede Flashcards after the ordinal swap");
assert.ok(parentIndex > flashcardIndex && listeningIndex > parentIndex, "Parent and Listening portals must follow Flashcards in the requested order");

console.log("Listening portal, 80-track catalogue contract, playback speeds, and homepage order validated.");
