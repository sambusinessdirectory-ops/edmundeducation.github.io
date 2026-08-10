import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const html = fs.readFileSync(path.join(root, "writing-practice.html"), "utf8");

test("fill-in-the-blanks listening controls remain below the live page header", () => {
  assert.match(html, /\.practice-listening-panel\s*\{[\s\S]*?position:\s*sticky;/);
  assert.match(html, /top:\s*var\(--writing-listening-sticky-top,\s*84px\)/);
  assert.match(html, /document\.documentElement\.style\.setProperty\("--writing-listening-sticky-top"/);
  assert.match(html, /getBoundingClientRect\?\.\(\)\.height/);
  assert.match(html, /new ResizeObserver\(syncListeningStickyTop\)\.observe\(header\)/);
});

test("the sticky row contains navigation and playback speed controls together", () => {
  assert.match(html, /<section class="practice-listening-panel"[\s\S]*?data-previous-practice-listening[\s\S]*?data-replay-practice-listening[\s\S]*?renderPracticeListeningNext\(exercise\)[\s\S]*?data-essay-audio-rate/);
  assert.match(html, /\.practice-listening-panel \.essay-rate-selector/);
});

test("mobile listening controls remain usable without covering the passage", () => {
  assert.match(html, /max-height:\s*calc\(100dvh - var\(--writing-listening-sticky-top,\s*148px\) - 10px\)/);
  assert.match(html, /\.practice-listening-panel\s*\.essay-rate-selector\s*\{[\s\S]*?overflow-x:\s*auto;/);
  assert.match(html, /\.practice-listening-navigation\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,/);
});
