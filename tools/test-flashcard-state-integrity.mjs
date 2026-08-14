import assert from "node:assert/strict";
import vm from "node:vm";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const source = readFileSync(path.join(siteDir, "flashcards.html"), "utf8");
const migration = readFileSync(
  path.join(siteDir, "supabase-flashcard-attempt-integrity-20260814.sql"),
  "utf8"
);
const baseSchema = readFileSync(path.join(siteDir, "supabase-flashcard-accounts.sql"), "utf8");

function sourceBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing source marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `Missing source marker: ${endMarker}`);
  return source.slice(start, end);
}

function extractFunction(name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `Missing function: ${name}`);
  const paramsStart = source.indexOf("(", start);
  let paramsDepth = 0;
  let paramsEnd = -1;
  for (let index = paramsStart; index < source.length; index += 1) {
    if (source[index] === "(") paramsDepth += 1;
    if (source[index] === ")") {
      paramsDepth -= 1;
      if (paramsDepth === 0) {
        paramsEnd = index;
        break;
      }
    }
  }
  const bodyStart = source.indexOf("{", paramsEnd);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = bodyStart; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  throw new Error(`Unterminated function: ${name}`);
}

const mergeRuntime = vm.runInNewContext(`(() => {
  ${extractFunction("flashcardAttemptIdentity")}
  ${extractFunction("flashcardAttemptStrength")}
  ${extractFunction("compareFlashcardAttemptStrength")}
  ${extractFunction("mergeFlashcardAttempts")}
  return mergeFlashcardAttempts;
})()`);

const merged = mergeRuntime(
  [
    { id: "complete", completed: true, answeredCount: 10, updatedAt: 100 },
    { id: "older", answeredCount: 2, updatedAt: 90 },
    { id: "improves", answeredCount: 1, updatedAt: 80 }
  ],
  [
    { id: "new-empty", answeredCount: 0, updatedAt: 200 },
    { id: "complete", completed: false, answeredCount: 0, updatedAt: 300 },
    { id: "improves", answeredCount: 3, updatedAt: 110 }
  ]
);
assert.deepEqual([...merged.map(row => row.id)], ["complete", "older", "improves", "new-empty"]);
assert.equal(merged.find(row => row.id === "complete")?.answeredCount, 10);
assert.equal(merged.find(row => row.id === "complete")?.completed, true);
assert.equal(merged.find(row => row.id === "improves")?.answeredCount, 3);

assert.match(source, /const ATTEMPTS_BACKUP_LOCAL_PREFIX = "edmundFlashcardAttemptsBackup::account::";/);
assert.match(source, /hydratingOwner: "",\s*hydratedOwner: ""/);

const queuedSave = sourceBetween("function queueSupabaseStateSave", "async function flushSupabaseStateSaves");
assert.match(queuedSave, /!isSupabaseStateHydrated\(context\)/);
assert.match(queuedSave, /pendingSupabaseStateSaves\.set/);

const directSave = sourceBetween("async function saveSupabaseState", "function displayPreferenceOwner");
assert.match(directSave, /!isSupabaseStateHydrated\(context\)/);
assert.match(directSave, /if \(!stillActive\(\)\) return false/);

const hydration = sourceBetween("async function loadStudentStateFromSupabase", "async function saveStudentAccessToSupabase");
assert.match(hydration, /const requestContext = captureSupabaseStateSaveContext\(\)/);
assert.match(hydration, /captureSupabaseStateSaveContext\(\)\?\.owner !== requestContext\.owner/);
assert.match(hydration, /mergeFlashcardAttempts\(remoteAttempts, accountBackup\)/);
assert.match(hydration, /supabaseState\.hydratedOwner = requestContext\.owner/);

const boot = sourceBetween("async function initialiseFlashcardPortal", "void initialiseFlashcardPortal");
assert.ok(
  boot.indexOf("await initSupabaseState()") < boot.indexOf("showAppPanel("),
  "A restored dashboard must not become interactive before state hydration finishes"
);
assert.match(boot, /isSupabaseStateHydrated\(context\)/);

const deckStart = sourceBetween("function startDeckSession", "function startRedCrossSession");
assert.match(deckStart, /requireFlashcardStateReady\(status\)/);

const logoutHandler = sourceBetween('if (event.target.closest("[data-logout]"))', 'if (event.target.closest("[data-speak-card]"))');
assert.match(logoutHandler, /await flushSupabaseStateSaves\(\)/);

assert.match(migration, /create or replace function public\.flashcard_merge_attempt_arrays/);
assert.equal(
  (migration.match(/then public\.flashcard_merge_attempt_arrays\(state\.value, excluded\.value\)/g) || []).length,
  2,
  "Both student and admin state writers must merge attempt history"
);
assert.match(migration, /answered_score desc,[\s\S]*updated_score desc/);
assert.match(migration, /revoke all on function public\.flashcard_merge_attempt_arrays/);
assert.match(baseSchema, /create or replace function public\.flashcard_merge_attempt_arrays/);
assert.equal(
  (baseSchema.match(/then public\.flashcard_merge_attempt_arrays\(state\.value, excluded\.value\)/g) || []).length,
  2,
  "Fresh Flashcard account installations must include the same merge protection"
);

console.log("Flashcard state-integrity checks passed.");
