import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

async function source(file) {
  return readFile(new URL(file, root), "utf8");
}

function functionBody(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  assert.ok(start >= 0, `Missing ${startMarker}`);
  const end = text.indexOf(endMarker, start + startMarker.length);
  assert.ok(end > start, `Missing ${endMarker} after ${startMarker}`);
  return text.slice(start, end);
}

function assertBefore(text, first, second, message) {
  const firstAt = text.indexOf(first);
  const secondAt = text.indexOf(second);
  assert.ok(firstAt >= 0, `${message}: missing ${first}`);
  assert.ok(secondAt >= 0, `${message}: missing ${second}`);
  assert.ok(firstAt < secondAt, message);
}

const [
  flashcards,
  commonExpression,
  speaking,
  writingPractice,
  schedule,
  song,
  idiom,
  proverb,
  phrasalVerb,
  sentenceStructure,
  studentProgress,
  downloads
] = await Promise.all([
  source("flashcards.html"),
  source("common-expression-system.js"),
  source("speaking-system.js"),
  source("writing-practice.html"),
  source("schedule-system.js"),
  source("song-appreciation.js"),
  source("idiom-system.js"),
  source("proverb-system.js"),
  source("phrasal-verb-system.js"),
  source("sentence-structure.js"),
  source("student-progress.js"),
  source("model-essay-downloads.js")
]);

const flashcardLogin = functionBody(
  flashcards,
  "async function performFlashcardLogin",
  "function login(username, password)"
);
assertBefore(
  flashcardLogin,
  'showAppPanel("dashboard", false)',
  "await loadStudentStateFromSupabase()",
  "Flashcards must reveal the main page before restoring old progress"
);
assert.match(flashcardLogin, /record restore failed after login/i);
assert.doesNotMatch(
  flashcardLogin.slice(flashcardLogin.indexOf('showAppPanel("dashboard", false)')),
  /clearSession\(\)|showLogin\(\)/,
  "A Flashcard record outage must not undo accepted credentials"
);
assert.match(
  flashcards,
  /if \(ok && context && isSupabaseStateHydrated\(context\)\)[\s\S]*?openRequestedFlashcardTarget/,
  "Deep links must wait for the authoritative Flashcard record"
);

const commonLogin = functionBody(commonExpression, "async function handleLogin", "async function restoreSession");
assertBefore(
  commonLogin,
  "openDashboard();",
  "await loadSnapshot(state.token)",
  "Common Expression must show its dashboard before restoring the cloud snapshot"
);
const commonStudentLogin = functionBody(commonExpression, "async function studentLogin", "async function handleLogin");
assert.doesNotMatch(commonStudentLogin, /await loadSnapshot/);
assert.match(commonStudentLogin, /applySnapshot\(\{\}\)/, "Device progress should seed the first dashboard paint");
const commonRestore = functionBody(commonExpression, "async function restoreSession", "async function logout");
assertBefore(
  commonRestore,
  "openDashboard();",
  "await loadSnapshot(state.token)",
  "A restored Common Expression session must also enter the dashboard before its snapshot loads"
);

const speakingLogin = functionBody(speaking, "async function handleLogin", "function showLogin");
assertBefore(
  speakingLogin,
  "showPortal();",
  "await loadBookmarks({ quiet: true })",
  "Speaking must show its main portal before restoring bookmarks"
);
const speakingInit = functionBody(speaking, "async function init()", "init();");
assertBefore(
  speakingInit,
  "showPortal();",
  "await loadBookmarks({ quiet: true })",
  "A restored Speaking session must also enter the portal before bookmarks load"
);

const writingLogin = functionBody(writingPractice, "async function login(username, password)", "function sectionToggleLabelHtml");
assertBefore(
  writingLogin,
  'showAppPanel("dashboard")',
  "loadWritingStudentState()",
  "Writing Practice must reveal its dashboard before restoring old attempts"
);
const writingInit = functionBody(writingPractice, "async function init()", "init();");
assertBefore(
  writingInit,
  'showAppPanel(currentUser.role === "admin" ? "admin-panel" : "dashboard")',
  "await loadWritingStudentState()",
  "A restored Writing Practice session must reveal its dashboard before restoring attempts"
);

// These portals already followed the required ordering. Keep the audit as a
// regression contract so a future history feature cannot put login in front of
// the authenticated main page again.
const scheduleLogin = functionBody(schedule, "async function login(event)", "async function logout");
assertBefore(scheduleLogin, 'showView("calendar")', "await loadWeek()", "Schedule main page first");

const songStudent = functionBody(song, "async function enterStudent", "function renderLibrary");
assertBefore(songStudent, 'showView("student")', "await loadStudentData()", "Song Appreciation main page first");

for (const [label, text] of [
  ["Idiom", idiom],
  ["Proverb", proverb],
  ["Phrasal Verb", phrasalVerb],
  ["Sentence Structure", sentenceStructure]
]) {
  const dashboard = functionBody(text, "async function openDashboard", "function openLesson");
  assertBefore(dashboard, 'showView("dashboard")', "await loadDashboardData", `${label} main page first`);
}

const progressDashboard = functionBody(studentProgress, "async function openDashboard", "async function handleLogin");
assertBefore(progressDashboard, 'showView("dashboard")', "await loadSnapshot()", "Student Progress main page first");

const downloadLogin = functionBody(
  downloads,
  'loginForm?.addEventListener("submit"',
  'document.querySelector("[data-password-toggle]")'
);
assertBefore(downloadLogin, 'showView("dashboard")', "void openDownloadSession()", "Download portal main page first");

console.log("Authenticated main-page-first login tests passed.");
