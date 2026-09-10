import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../pronunciation-checker.js", import.meta.url), "utf8");
const window = { AudioContext: class {}, webkitAudioContext: null };
vm.runInNewContext(source, { window, navigator: {}, AudioBuffer: class {}, Blob, fetch });

const { analyseTextMatch } = window.EdmundPronunciation;
const exact = analyseTextMatch("have other things to do", "have other things to do", .8);
const gibberish = analyseTextMatch("have other things to do", "japanisch und deutsche wörter", .98);
const incomplete = analyseTextMatch("the appointment has been confirmed yet", "the appointment", .95);
const accentEquivalent = analyseTextMatch("Would you mind waiting in the reception area?", "would you mind waiting in the reception area", .7);

assert.ok(exact.passed && exact.score >= .99, `exact speech should score at least 99%, received ${exact.score}`);
assert.ok(accentEquivalent.passed && accentEquivalent.score >= .99, "punctuation and letter case must not penalize a correct reading");
assert.ok(!gibberish.passed && gibberish.score < .5, `unrelated speech must fail, received ${gibberish.score}`);
assert.ok(!incomplete.passed, "a short fragment of a longer sentence must fail");
assert.match(source, /reason: "no-speech"/);
assert.match(source, /reason: "unrecognized"/);
assert.doesNotMatch(source, /\.62 \+ \.38 \* acoustic/);

console.log("Pronunciation gating rejects silence/unrecognized speech and calibrates exact readings to 99–100%.");
