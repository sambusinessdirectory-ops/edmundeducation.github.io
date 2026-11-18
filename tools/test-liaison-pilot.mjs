import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [page, script, lessonLoop, styles, homepage, navigation] = await Promise.all([
  readFile(new URL("../liaison.html", import.meta.url), "utf8"),
  readFile(new URL("../liaison/liaison.mjs", import.meta.url), "utf8"),
  readFile(new URL("../liaison/lesson-loop.mjs", import.meta.url), "utf8"),
  readFile(new URL("../liaison/liaison.css", import.meta.url), "utf8"),
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../shared-system-nav.js", import.meta.url), "utf8")
]);

const questionSource = script.match(/const questions = \[([\s\S]*?)\n\];/);
assert(questionSource, "Question bank must remain statically discoverable");
const ids = [...questionSource[1].matchAll(/^\s+id:\s*(\d+),/gm)].map(match => Number(match[1]));
assert.deepEqual(ids, Array.from({ length: 30 }, (_, index) => index + 1), "Pilot must contain questions 1–30 exactly once");

const forbiddenStudentNotation = ["dʒ", "tʃ", "ʒ", "ʃ", "ŋ", "ɾ", "ʔ"];
for (const notation of forbiddenStudentNotation) {
  assert(!page.includes(notation), `Student page must not expose ${notation}`);
  assert(!script.includes(notation), `Question content must not expose ${notation}`);
  assert(!lessonLoop.includes(notation), `Lesson loop must not expose ${notation}`);
}

assert(page.includes('data-system="liaison"'), "Page must register with shared system navigation");
assert(page.includes("data-login-form"), "Student login form is required");
assert(page.includes("data-view=\"practice\" hidden"), "Practice content must be gated before login");
assert(page.includes("liaison/lesson-loop.mjs"), "Seven-stage lesson module must be loaded");
assert(page.includes("每題七個階段"), "Student page must explain the seven-stage central loop");
const lessonStepSource = script.match(/const LESSON_STEPS = Object\.freeze\(\[([\s\S]*?)\n\]\);/);
assert.equal((lessonStepSource?.[1].match(/^\s+\["/gm) || []).length, 7, "Seven stage labels must remain present");
for (const stage of ["理解訊息", "預測與找位", "聆聽與辨別", "建立連音", "分段模仿", "錄音與回饋", "轉移與複習"]) {
  assert(page.includes(stage) || script.includes(stage), `Missing lesson stage: ${stage}`);
}
assert(styles.includes(".lesson-stepper"), "Visible lesson-stepper styles are required");
assert(styles.includes(".build-tile"), "Playable sound-unit tile styles are required");
assert(lessonLoop.includes("draggable = true"), "Build stage must support dragging sound units");
assert(lessonLoop.includes("dataTransfer?.getData"), "Build stage must accept dropped sound units");
for (const feedbackArea of ["聲音交界", "可理解度", "重音起伏", "節奏"]) {
  assert(lessonLoop.includes(feedbackArea), `Recording feedback must cover ${feedbackArea}`);
}
assert(lessonLoop.includes("transferPhrase"), "Every lesson must transfer the rule to an unseen phrase");
assert(lessonLoop.includes("scheduleReview"), "Every lesson must schedule spaced review");
assert(lessonLoop.includes("state.completed.add(question.id)"), "Completion must happen after transfer and review");
assert(lessonLoop.includes("[...state.lessons.entries()].map"), "In-progress lesson stages must persist across reloads");
assert(lessonLoop.includes('complete ? "已完成" : "進行中"'), "Completed lesson cards must update their visible status");
assert(lessonLoop.includes('["127.0.0.1", "localhost"].includes(window.location.hostname)'), "Sample feedback must be limited to localhost preview");
assert(lessonLoop.includes('get("preview") === "1"'), "Sample feedback must require the explicit preview flag");

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

console.log("Liaison pilot checks passed: 30 complete seven-stage lessons, persistent progress, card 83, sound blocks, and no learner-facing phonetic symbols.");
