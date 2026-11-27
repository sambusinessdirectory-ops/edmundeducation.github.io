import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [page, script, lessonLoop, styles, audioManifest, homepage, navigation] = await Promise.all([
  readFile(new URL("../liaison.html", import.meta.url), "utf8"),
  readFile(new URL("../liaison/liaison.mjs", import.meta.url), "utf8"),
  readFile(new URL("../liaison/lesson-loop.mjs", import.meta.url), "utf8"),
  readFile(new URL("../liaison/liaison.css", import.meta.url), "utf8"),
  readFile(new URL("../liaison/liaison-audio-manifest.js", import.meta.url), "utf8"),
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../shared-system-nav.js", import.meta.url), "utf8")
]);

const questionSource = script.match(/const questions = \[([\s\S]*?)\n\];/);
assert(questionSource, "Question bank must remain statically discoverable");
const ids = [...questionSource[1].matchAll(/^\s+id:\s*(\d+),/gm)].map(match => Number(match[1]));
assert.deepEqual(ids, Array.from({ length: 30 }, (_, index) => index + 1), "Pilot must contain questions 1–30 exactly once");

for (const notation of ["dʒ", "tʃ", "ʒ", "ʃ", "ŋ", "ɾ", "ʔ"]) {
  assert(!page.includes(notation), `Student page must not expose ${notation}`);
  assert(!script.includes(notation), `Question content must not expose ${notation}`);
  assert(!lessonLoop.includes(notation), `Lesson loop must not expose ${notation}`);
}

assert(page.includes('data-system="liaison"'), "Page must register with shared system navigation");
assert(page.includes("data-login-form"), "Student login form is required");
assert(page.includes('data-view="practice" hidden'), "Practice content must be gated before login");
assert(page.includes("liaison/lesson-loop.mjs"), "Lesson module must be loaded");
assert(page.includes('data-module="sentence"') && page.includes('data-module="paragraph"'), "Login destination must offer sentence and paragraph modules");

const lessonStepSource = script.match(/const LESSON_STEPS = Object\.freeze\(\[([\s\S]*?)\n\]\);/);
assert.equal((lessonStepSource?.[1].match(/^\s+\["/gm) || []).length, 6, "Six simplified stage labels must remain present");
for (const stage of ["理解訊息", "點選連音字母", "聆聽", "分段模仿", "錄音", "新句轉移"]) {
  assert(page.includes(stage) || script.includes(stage), `Missing lesson stage: ${stage}`);
}
assert(styles.includes(".lesson-stepper"), "Visible lesson-stepper styles are required");
assert(styles.includes(".letter-picker"), "Touch-friendly letter picker styles are required");
assert(lessonLoop.includes("targetLetters") && lessonLoop.includes("letterPicker"), "Students must identify liaison by tapping letters");
assert(lessonLoop.includes('addEventListener("pointermove"') && lessonLoop.includes("elementFromPoint"), "Letter identification must support finger and mouse dragging");
assert(lessonLoop.includes("selected.delete(index)") && lessonLoop.includes("clear-selection"), "A mistaken liaison selection must be cancellable or clearable");
assert(lessonLoop.includes("檢查答案") && lessonLoop.includes("尚未正確"), "Letter selection must be explicitly checked with visible error feedback");
assert(lessonLoop.includes('data-rate="1"') && lessonLoop.includes('data-rate="0.5"'), "Listening must offer normal and 0.5x speed");
assert(lessonLoop.includes('data-phrase-rate="1"') && lessonLoop.includes('data-phrase-rate="0.5"'), "The lesson sentence audio must remain available throughout all stages");
assert(!lessonLoop.includes("知道句子在說什麼，再開始聽和說。"), "Removed stage-one wording must not return");
assert(lessonLoop.includes("transferPhrase"), "Every lesson must transfer the rule to an unseen phrase");
assert(lessonLoop.includes("transferMeaning"), "Every unseen sentence must include a Chinese translation");
assert(!lessonLoop.includes("scheduleReview"), "Spaced-review scheduling must be removed");
assert(lessonLoop.includes("state.completed.add(question.id)"), "Completion must happen after unseen-sentence letter transfer");
assert(lessonLoop.includes("[...state.lessons].map"), "In-progress lesson stages must persist across reloads");
assert(lessonLoop.includes('["127.0.0.1", "localhost"].includes(location.hostname)'), "Local preview must be limited to localhost");
assert(lessonLoop.includes('get("preview") === "1"'), "Local preview must require the explicit preview flag");
assert(script.includes('["an + orange", "rolled + away"]'), "An orange rolled away must require both liaison boundaries");
assert(page.includes("liaison-audio-manifest.js"), "The British male audio manifest must load before the lesson loop");
assert(audioManifest.includes('"voice": "bm_george"') && audioManifest.includes('"language": "en-gb"'), "Liaison audio must use Kokoro British male bm_george");
assert.equal((audioManifest.match(/\.mp3"/g) || []).length, 93, "Every active liaison pronunciation must have a generated MP3");

const liaisonCard = homepage.indexOf('href="liaison.html"');
const dailyReadingCard = homepage.indexOf('href="daily-reading.html"', liaisonCard);
assert(liaisonCard > -1, "Homepage liaison card is required");
assert(dailyReadingCard > liaisonCard, "Liaison must occupy card 83 before Daily Reading card 84");
assert(/01 \/ \d+/.test(homepage), "Homepage deck total must remain visible");
assert(navigation.includes('id: "liaison"'), "Shared navigation must include the liaison system");
assert(navigation.includes('homepageCard: 83'), "Liaison must be registered as homepage card 83");
assert(navigation.includes('homepageCard: 84'), "Daily Reading must remain homepage card 84");
assert(navigation.includes('liaison: "edmund-liaison-session-v1"'), "Shared student-session bridge must include liaison");

console.log("Liaison pilot checks passed: two modules, six-step letter-tapping lessons, bilingual transfer, persistent progress, and no learner-facing phonetic symbols.");
