import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const source = readFileSync(path.join(siteDir, "speaking-system.js"), "utf8");
const css = readFileSync(path.join(siteDir, "speaking-system.css"), "utf8");
const worker = readFileSync(path.join(siteDir, "workers/speaking-system/src/index.js"), "utf8");
const sql = readFileSync(path.join(siteDir, "supabase-speaking-system.sql"), "utf8");

function sourceBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing source marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `Missing source marker: ${endMarker}`);
  return source.slice(start, end);
}

assert.match(source, /const PAGE_RECORDING_HISTORY_LIMIT = 20;/);
assert.match(source, /pageRecordings: \[\]/);
assert.match(source, /function archiveSavedPageRecording\(recording, context\)/);
assert.match(source, /archiveSavedPageRecording\(response\?\.recording, context\)/);
assert.match(source, /data-page-recording-list/);
assert.match(source, /data-download-page-recording/);
assert.match(source, /儲存這段錄音/);
assert.match(source, /＋ 再錄一段/);
assert.match(source, /if \(!\(await preflightRecordingQuota\(\)\)\) return;/, "every new recording must retain the per-student quota preflight");
assert.match(source, /EDMUND_SPEAKING_PERFORMANCE_INDICATOR\?\.snapshot\?\.\(\)/, "saving a recording must snapshot its current checklist");
assert.match(source, /form\.append\("performanceChecklist", JSON\.stringify\(performanceChecklist\)\)/, "the snapshot must travel with the recording upload");
assert.match(source, /function renderAttemptPerformanceChecklist\(attempt\)/, "My Recordings must render the saved checklist");

const part1 = sourceBetween("function renderPart1Exercise(", "function renderPart3Model(");
assert.ok(part1.indexOf("${renderRecorderCard(exercise)}") < part1.indexOf('<section class="part1-dialogue-stage"'), "Part 1 recorder should be reachable before its long dialogue");
const part3 = sourceBetween("function renderPart3Exercise(", "function focusRoutedQuestion(");
assert.ok(part3.indexOf("${renderRecorderCard(exercise)}") < part3.indexOf('<section class="part3-response-section"'), "Part 3 recorder should be reachable before its long response content");
const standard = sourceBetween("function renderExercise(", "function currentAudioContext(");
assert.ok(standard.indexOf("${renderRecorderCard(exercise)}") < standard.indexOf('<div class="response-grid"'), "standard recorder should be reachable before the model-answer grid");

const baseRecorderCss = css.match(/\.recorder-card \{([\s\S]*?)\n\}/)?.[1] || "";
assert.ok(baseRecorderCss, "base recorder styles must remain available");
assert.doesNotMatch(baseRecorderCss, /position:\s*sticky/, "the Speaking recorder must not use sticky positioning");
assert.match(css, /\.recorder-card-anchor \{[\s\S]*?display: block;[\s\S]*?height: 0;[\s\S]*?pointer-events: none;/, "the dock sentinel must remain measurable before scrolling");
assert.match(css, /\.recorder-card\.is-floating \{[\s\S]*?position: fixed;[\s\S]*?right: max\(18px, env\(safe-area-inset-right\)\);[\s\S]*?bottom: calc\(var\(--recorder-floating-bottom, 12px\) \+ env\(safe-area-inset-bottom\)\);[\s\S]*?max-height: min\(70vh, 620px\);/);
assert.match(css, /\.exercise-view\.has-floating-recorder \{[\s\S]*?padding-bottom: var\(--floating-recorder-reserve, 0\)/, "floating controls must reserve scroll room instead of permanently hiding the final content");
assert.match(css, /\.page-recording-list \{[\s\S]*?max-height: 260px;[\s\S]*?overflow: auto;/);
assert.match(css, /@media \(max-width: 820px\) \{[\s\S]*?\.recorder-card\.is-floating \{[\s\S]*?right: max\(7px, env\(safe-area-inset-right\)\);[\s\S]*?max-height: min\(72vh, 580px\);/);
assert.match(source, /function setupFloatingRecorder\(\)[\s\S]*?window\.addEventListener\("scroll", state\.floatingRecorderScrollHandler, \{ passive: true \}\);/);
assert.match(source, /function updateFloatingRecorder\(\)[\s\S]*?const shouldFloat = anchorRect\.top < safeTop && exerciseRect\.bottom > safeTop \+ 96;/);
assert.match(source, /const requiredBottom = Math\.max\(safeBottom, viewportHeight - exercise\.getBoundingClientRect\(\)\.bottom \+ 12\);/, "the floating recorder must move upward at the exercise boundary");
assert.match(source, /typeof ResizeObserver === "function"/, "the floating dock must remeasure previews and recording state changes");
assert.match(source, /function stopFloatingRecorderListeners\(\)[\s\S]*?removeEventListener\("scroll", state\.floatingRecorderScrollHandler\)/, "floating listeners must be cleaned up during navigation and page exit");

const makeClassList = () => {
  const values = new Set();
  return {
    add: (...names) => names.forEach(name => values.add(name)),
    remove: (...names) => names.forEach(name => values.delete(name)),
    contains: name => values.has(name)
  };
};
const makeStyle = () => {
  const values = new Map();
  return {
    setProperty: (name, value) => values.set(name, value),
    removeProperty: name => values.delete(name),
    getPropertyValue: name => values.get(name) || "",
    set height(value) { values.set("height", value); },
    get height() { return values.get("height") || ""; }
  };
};
let anchorTop = 160;
let exerciseBottom = 1200;
const exerciseMock = {
  classList: makeClassList(),
  style: makeStyle(),
  getBoundingClientRect: () => ({ bottom: exerciseBottom })
};
const cardMock = {
  classList: makeClassList(),
  style: makeStyle(),
  closest: selector => selector === ".exercise-view" ? exerciseMock : null,
  getBoundingClientRect: () => ({ height: cardMock.classList.contains("is-floating") ? 220 : 300 })
};
const placeholderMock = {
  classList: makeClassList(),
  style: makeStyle(),
  getBoundingClientRect: () => ({ top: anchorTop }),
  remove() {}
};
const floatingState = {
  route: { view: "exercise" },
  floatingRecorderFrame: 1,
  floatingRecorderPlaceholder: placeholderMock,
  floatingRecorderScrollHandler: null,
  floatingRecorderResizeHandler: null,
  floatingRecorderResizeObserver: null
};
const floatingWindow = {
  innerHeight: 800,
  removeEventListener() {},
  addEventListener() {}
};
const floatingDocument = {
  documentElement: { clientHeight: 800 },
  querySelector: selector => selector === "[data-recorder-card]"
    ? cardMock
    : selector === "[data-site-header]"
      ? { getBoundingClientRect: () => ({ bottom: 90 }) }
      : null
};
const floatingHelpers = Function(
  "state", "window", "document", "cancelAnimationFrame", "requestAnimationFrame", "ResizeObserver",
  `${sourceBetween("function stopFloatingRecorderListeners(", "function renderPageRecordingHistory(")}; return { updateFloatingRecorder };`
)(floatingState, floatingWindow, floatingDocument, () => {}, () => 1, undefined);

floatingHelpers.updateFloatingRecorder();
assert.equal(cardMock.classList.contains("is-floating"), false, "the recorder must remain docked before users scroll past it");

anchorTop = -20;
floatingHelpers.updateFloatingRecorder();
assert.equal(cardMock.classList.contains("is-floating"), true, "the recorder must float after its natural anchor leaves the viewport");
assert.equal(placeholderMock.classList.contains("is-reserving"), true, "floating must preserve the card's natural document space");
assert.equal(cardMock.style.getPropertyValue("--recorder-floating-bottom"), "12px");

exerciseBottom = 500;
floatingHelpers.updateFloatingRecorder();
assert.equal(cardMock.style.getPropertyValue("--recorder-floating-bottom"), "312px", "the floating recorder must move up before reaching the exercise boundary");

anchorTop = 160;
floatingHelpers.updateFloatingRecorder();
assert.equal(cardMock.classList.contains("is-floating"), false, "the recorder must return to its natural position when users scroll back up");
assert.equal(exerciseMock.classList.contains("has-floating-recorder"), false);

assert.match(sql, /Ordinary non-exam practice is repeatable/, "ordinary practice recordings must remain repeatable in the database");
assert.match(worker, /const attemptId = crypto\.randomUUID\(\)/, "each ordinary upload must receive its own recording ID");
assert.match(worker, /rpc\(env, "speaking_reserve_recording_attempt"/, "uploads must retain the atomic quota reservation");
assert.match(worker, /rpc\(env, "speaking_set_recording_performance_checklist"/, "the Worker must persist the checklist before uploading audio");
assert.match(sql, /performance_checklist jsonb/, "recording attempts must store a checklist snapshot");
assert.match(sql, /speaking_set_recording_performance_checklist/, "the schema must include the private checklist mutation RPC");

console.log("Speaking dynamic floating multi-recording workflow checks passed.");
