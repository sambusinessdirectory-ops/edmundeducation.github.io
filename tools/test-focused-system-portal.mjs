#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";


const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const existsWithBytes = async (path) => (await stat(new URL(path, root))).size > 0;

const checks = {
  async "background-music"() {
    const [html, player, catalog] = await Promise.all([
      read("background-music.html"),
      read("background-music-player.mjs"),
      read("background-music-catalog.json"),
    ]);
    assert.match(html, /data-system="background-music"/);
    assert.match(html, /background-music-player\.mjs/);
    assert.match(player, /background-music-catalog\.json/);
    assert.ok(JSON.parse(catalog));
  },

  async "question-collection"() {
    const [html, runtime] = await Promise.all([
      read("question-collection.html"),
      read("question-collection.mjs"),
    ]);
    assert.match(html, /data-system="question-collection"/);
    assert.match(html, /question-collection\.mjs/);
    assert.match(runtime, /question-collection/);
  },

  async "accent"() {
    const [html, runtime, css] = await Promise.all([
      read("excellent-learning-system.html"),
      read("excellent-learning-system.js"),
      read("excellent-learning-system.css"),
    ]);
    assert.match(html, /data-system="excellent-learning"/);
    assert.match(html, /excellent-learning-system\.js/);
    assert.match(html, /excellent-learning-system\.css/);
    assert.match(runtime, /flashcard_student_login/);
    assert.match(css, /excellent-/);
  },

  async "news-reader"() {
    const [html, runtime, css, lesson, audio] = await Promise.all([
      read("news-reader.html"),
      read("news-reader/news.mjs"),
      read("news-reader/news.css"),
      existsWithBytes("news-reader/lesson.bin"),
      existsWithBytes("news-reader/audio.bin"),
    ]);
    assert.match(html, /news-reader\/news\.mjs/);
    assert.match(html, /news-reader\/news\.css/);
    assert.match(runtime, /unpack\('lesson'/);
    assert.match(runtime, /unpack\('audio'/);
    assert.match(css, /\.portal-header/);
    assert.equal(lesson, true);
    assert.equal(audio, true);
  },
};

const selected = process.argv.slice(2);
if (!selected.length || selected.some((name) => !checks[name])) {
  throw new Error(`Usage: ${process.argv[1]} ${Object.keys(checks).join("|")}`);
}
for (const name of selected) {
  await checks[name]();
  console.log(`Focused ${name} portal contract passed.`);
}
