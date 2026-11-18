import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [page, script, styles, homepage, navigation] = await Promise.all([
  readFile(new URL("../liaison.html", import.meta.url), "utf8"),
  readFile(new URL("../liaison/liaison.mjs", import.meta.url), "utf8"),
  readFile(new URL("../liaison/liaison.css", import.meta.url), "utf8"),
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../shared-system-nav.js", import.meta.url), "utf8")
]);

const questionSource = script.match(/const questions = \[([\s\S]*?)\n\];\n\nconst state/);
assert(questionSource, "Question bank must remain statically discoverable");
const ids = [...questionSource[1].matchAll(/^\s+id:\s*(\d+),/gm)].map(match => Number(match[1]));
assert.deepEqual(ids, Array.from({ length: 30 }, (_, index) => index + 1), "Pilot must contain questions 1–30 exactly once");

const forbiddenStudentNotation = ["dʒ", "tʃ", "ʒ", "ʃ", "ŋ", "ɾ", "ʔ"];
for (const notation of forbiddenStudentNotation) {
  assert(!page.includes(notation), `Student page must not expose ${notation}`);
  assert(!script.includes(notation), `Question content must not expose ${notation}`);
}

assert(page.includes('data-system="liaison"'), "Page must register with shared system navigation");
assert(page.includes("data-login-form"), "Student login form is required");
assert(page.includes("data-view=\"practice\" hidden"), "Practice content must be gated before login");
assert(page.includes("liaison/liaison.mjs"), "Pilot module must be loaded");
assert(styles.includes(".sound-option"), "Sound-block presentation styles are required");

const liaisonCard = homepage.indexOf('href="liaison.html"');
const dailyReadingCard = homepage.indexOf('href="daily-reading.html"', liaisonCard);
assert(liaisonCard > -1, "Homepage liaison card is required");
assert(dailyReadingCard > liaisonCard, "Liaison must occupy card 83 before Daily Reading card 84");
assert(homepage.includes("01 / 84"), "Homepage deck total must be 84");
assert(homepage.includes("Liaison<br>學生使用<br>英文連音<br>學習系統"), "Homepage card line breaks must match the brief");

assert(navigation.includes('id: "liaison"'), "Shared navigation must include the liaison system");
assert(navigation.includes('homepageCard: 83'), "Liaison must be registered as homepage card 83");
assert(navigation.includes('homepageCard: 84'), "Daily Reading must move to homepage card 84");
assert(navigation.includes('liaison: "edmund-liaison-session-v1"'), "Shared student-session bridge must include liaison");

console.log("Liaison pilot checks passed: 30 questions, login gate, card 83, sound blocks, and no learner-facing phonetic symbols.");
