import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = file => readFileSync(new URL(file, root), "utf8");

const homepage = read("index.html");
const deckScript = read("homepage-system-deck.js");
const musicScript = read("background-music-player.mjs");
const musicCss = read("background-music-player.css");
const excellent = read("excellent-learning-system.html");
const professionalSpeaking = read("speaking-professional.mjs");
const professionalSpeakingHtml = read("speaking-professional.html");

const deckPosition = homepage.indexOf("data-system-card-deck");
const homeworkPosition = homepage.indexOf("data-system-card-start");
assert.ok(deckPosition >= 0 && deckPosition < homeworkPosition, "the swipe selector should sit before card 10");
assert.match(homepage, /href="excellent-learning-system\.html"/);
assert.match(homepage, /homepage-system-deck\.js\?v=20260910-swipe3/);
for (const behavior of ["wheel", "pointerdown", "ArrowUp", "ArrowDown", "cloneNode(true)", "rawDelta", "data-system-card-deck-search", "data-system-card-deck-first", "data-system-card-deck-last"]) {
  assert.ok(deckScript.includes(behavior), `missing interactive deck behavior: ${behavior}`);
}
assert.match(deckScript, /querySelectorAll\("a\.category\[href\]"\)/, "the selector should include cards 1 through 64");
assert.match(homepage, /data-system-card-deck-first[^>]*>01</);

assert.doesNotMatch(musicScript, /window\.open\s*\(/);
assert.match(musicScript, /class="music-track-heading"/);
assert.match(musicScript, /makeFloating\(dialog\)/);
assert.match(musicScript, /classList\.toggle\('is-collapsed'\)/);
assert.match(musicCss, /writing-mode:\s*horizontal-tb/);
assert.match(musicCss, /grid-template-areas:\s*"heading heading"/);

assert.match(excellent, /data-system="excellent-learning"/);
assert.match(excellent, /supabase-config\.js/);
assert.match(excellent, /English Accent Learning System/);
assert.doesNotMatch(excellent, /Excellent Learning System/);
assert.doesNotMatch(professionalSpeaking, /pro-paper-facsimile/);
assert.match(professionalSpeaking, /pro-paper-illustration/);
assert.match(professionalSpeaking, /EDMUND_DSE_SPEAKING_SUPPLEMENT/);
assert.match(professionalSpeakingHtml, /dse-speaking-paper-manifest\.js/);

console.log("Homepage swipe selector, floating music player, and English Accent Learning shell validated.");
