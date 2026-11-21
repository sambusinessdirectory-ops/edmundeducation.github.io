import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const has = (file, pattern, label) => assert.match(read(file), pattern, label);

const config = read("learning-portal-config.js");
for (let ordinal = 85; ordinal <= 93; ordinal += 1) {
  assert.match(config, new RegExp(`ordinal:\\s*${ordinal}\\b`), `missing system ${ordinal}`);
}
for (const file of ["homonomy-system.html","eddy-dialogue-box-index.html","thematic-vocabulary-learning-system.html","cre-system.html","abbreviation-system.html","childrens-stories-system.html","teens-stories-system.html","adults-stories-system.html","mock-exam-system.html"]) {
  assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
}
has("learning-portal-config.js", /Business System[\s\S]*Marketing System[\s\S]*Finance System/, "Business School modules missing");
assert.match(config, /Junior High[\s\S]*High School/, "Mock modes missing");

const registrySource = read("eddy-dialogue-registry.js");
const registryContext = { window: {} };
vm.runInNewContext(registrySource, registryContext);
assert.ok(registryContext.window.EDMUND_EDDY_DIALOGUE_REGISTRY.length >= 60, "Eddy dialogue registry is unexpectedly small");
has("shared-system-nav.js", /eddy_dialogue_discovery_record/, "dialogue discovery persistence missing");
has("eddy-dialogue-box-index.js", /jsPDF/, "admin PDF export missing");

const catalogue = { libraries: [], decks: [], entries: [] };
vm.runInNewContext(read("spelling-common-traps-catalog.js"), { window: { SPELLING_SELECTION_CATALOG: catalogue } });
assert.equal(catalogue.counts.commonTrapDecks, 6, "common-trap mode count changed");
assert.ok(catalogue.counts.commonTrapEntries >= 400, "common-trap word bank is incomplete");
has("spelling-practice.js", /AudioContext[\s\S]*createOscillator[\s\S]*createGain/, "typing audio synthesis missing");
has("spelling-practice.js", /NumpadEnter/, "Numpad Enter shortcut missing");
has("spelling-practice.js", /streak[\s\S]*(5|STREAK)/i, "streak feedback missing");
has("spelling-system.html", /spelling-common-traps-catalog\.js/, "common-trap catalogue not loaded");

has("song-appreciation.js", /feelingLucky|lucky/i, "I'm Feeling Lucky logic missing");
has("schedule-system.html", /data-jump-homework/, "homework jump missing");
has("schedule-homework-export.mjs", /searchParams\.set\("view", "practice"\)[\s\S]*searchParams\.delete\("passage"\)/, "module-level homework export missing");
has("flashcards.html", /function offerLoginReview\(\)/, "login review modal missing");
has("flashcards.html", /rows\.slice\(0, 10\)/, "login review is not capped at ten cards");

has("grammar-block-tools.js", /grammar_qna_student_edit/, "student Q&A editing missing");
has("grammar-block-tools.js", /grammar_qna_admin_queue/, "teacher queue missing");
has("grammar-block-tools.js", /grammar_qna_admin_reply/, "teacher reply flow missing");
has("shared-system-nav.js", /Running Horse Mascot\.gif/, "animated transition asset missing");
has("shared-system-nav.js", /eddy_dialogue_discovery_record/, "global Eddy discovery hook missing");

for (const system of ["polysemy","phrasal-verb","sentence-structure","reading-logic","native-english","advanced-native","reading-comprehension","idiom","proverb"]) {
  assert.ok(fs.existsSync(path.join(root, `admin-${system}-export.html`)), `missing admin ${system} export entry`);
}
has("admin-markdown-export.js", /flashcard_admin_login/, "admin authorization missing from Markdown exports");
has("admin-markdown-export.js", /text\/markdown|\.md/, "Markdown download missing");

console.log(`PASS: release bundle integrity (${catalogue.counts.commonTrapEntries} common-trap entries, ${registryContext.window.EDMUND_EDDY_DIALOGUE_REGISTRY.length} Eddy dialogues).`);
