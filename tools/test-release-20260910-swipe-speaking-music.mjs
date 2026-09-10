import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = file => readFileSync(new URL(file, root), "utf8");

const homepage = read("index.html");
const deckScript = read("homepage-system-deck.js");
const musicScript = read("background-music-player.mjs");
const musicCss = read("background-music-player.css");
const excellent = read("excellent-learning-system.html");

const deckPosition = homepage.indexOf("data-system-card-deck");
const homeworkPosition = homepage.indexOf("data-system-card-start");
assert.ok(deckPosition >= 0 && deckPosition < homeworkPosition, "the swipe selector should sit before card 10");
assert.match(homepage, /href="excellent-learning-system\.html"/);
assert.match(homepage, /homepage-system-deck\.js\?v=20260910-swipe1/);
for (const behavior of ["wheel", "pointerdown", "ArrowUp", "ArrowDown", "cloneNode(true)"]) {
  assert.ok(deckScript.includes(behavior), `missing interactive deck behavior: ${behavior}`);
}

assert.doesNotMatch(musicScript, /window\.open\s*\(/);
assert.match(musicScript, /class="music-track-heading"/);
assert.match(musicScript, /classList\.toggle\('is-expanded'\)/);
assert.match(musicCss, /writing-mode:\s*horizontal-tb/);
assert.match(musicCss, /grid-template-areas:\s*"heading heading"/);

assert.match(excellent, /data-system="excellent-learning"/);
assert.match(excellent, /supabase-config\.js/);
assert.match(excellent, /內容即將加入/);

console.log("Homepage swipe selector, floating music player, and Excellent Learning shell validated.");
