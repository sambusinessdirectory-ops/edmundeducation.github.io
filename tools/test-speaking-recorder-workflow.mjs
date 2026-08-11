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

const part1 = sourceBetween("function renderPart1Exercise(", "function renderPart3Model(");
assert.ok(part1.indexOf("${renderRecorderCard(exercise)}") < part1.indexOf('<section class="part1-dialogue-stage"'), "Part 1 recorder should be reachable before its long dialogue");
const part3 = sourceBetween("function renderPart3Exercise(", "function focusRoutedQuestion(");
assert.ok(part3.indexOf("${renderRecorderCard(exercise)}") < part3.indexOf('<section class="part3-response-section"'), "Part 3 recorder should be reachable before its long response content");
const standard = sourceBetween("function renderExercise(", "function currentAudioContext(");
assert.ok(standard.indexOf("${renderRecorderCard(exercise)}") < standard.indexOf('<div class="response-grid"'), "standard recorder should be reachable before the model-answer grid");

assert.match(css, /\.recorder-card \{[\s\S]*?position: sticky;[\s\S]*?bottom: max\(12px, env\(safe-area-inset-bottom\)\);[\s\S]*?max-height: min\(76vh, 680px\);[\s\S]*?overflow: auto;/);
assert.match(css, /\.page-recording-list \{[\s\S]*?max-height: 260px;[\s\S]*?overflow: auto;/);
assert.match(css, /@media \(max-width: 820px\) \{[\s\S]*?\.recorder-card \{[\s\S]*?bottom: max\(7px, env\(safe-area-inset-bottom\)\);[\s\S]*?max-height: min\(72vh, 580px\);/);

assert.match(sql, /Ordinary non-exam practice is repeatable/, "ordinary practice recordings must remain repeatable in the database");
assert.match(worker, /const attemptId = crypto\.randomUUID\(\)/, "each ordinary upload must receive its own recording ID");
assert.match(worker, /rpc\(env, "speaking_reserve_recording_attempt"/, "uploads must retain the atomic quota reservation");

console.log("Speaking sticky multi-recording workflow checks passed.");
