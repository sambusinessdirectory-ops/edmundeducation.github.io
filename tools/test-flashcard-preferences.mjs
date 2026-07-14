import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const source = readFileSync(path.join(siteDir, "flashcards.html"), "utf8");

function sourceBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing source marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `Missing source marker: ${endMarker}`);
  return source.slice(start, end);
}

assert.match(source, /const DISPLAY_PREFERENCES_KEY = "edmundFlashcardUiPreferences";/);
assert.doesNotMatch(
  sourceBetween("const DISPLAY_PREFERENCES_KEY", "const BOOKMARK_DECK_ID"),
  /edmundStudentDisplayPreferences/,
  "Flashcard UI settings must use their own row so stale tabs cannot overwrite Schedule settings"
);
const syncKeys = sourceBetween("const SUPABASE_SYNC_KEYS = [", "];",);
assert.match(syncKeys, /DISPLAY_PREFERENCES_KEY/);

assert.doesNotMatch(source, /edmund-hide-locked-sections/);
assert.match(source, /let hideLockedSections = false;/);
assert.match(
  source,
  /data-toggle-locked-visibility aria-pressed="false">隱藏尚未開啟範圍<\/button>/
);

const renderControl = sourceBetween(
  "function updateLockedVisibilityControl()",
  "function resetFlashcardDisplayPreferences()"
);
assert.match(renderControl, /setAttribute\("aria-pressed", String\(hideLockedSections\)\)/);
assert.match(renderControl, /toggle\.disabled = displayPreferenceSaveInFlight \|\| waitingForPreferences/);

const resetPreferences = sourceBetween(
  "function resetFlashcardDisplayPreferences()",
  "function hydrateFlashcardDisplayPreferences()"
);
assert.match(resetPreferences, /delete remoteStore\[DISPLAY_PREFERENCES_KEY\]/);
assert.match(resetPreferences, /hideLockedSections = false/);
assert.match(resetPreferences, /displayPreferencesHydratedOwner = ""/);

const persistPreferences = sourceBetween(
  "async function persistFlashcardHideLockedSections(nextHidden)",
  "function applyRemoteStateRow(row)"
);
assert.match(
  persistPreferences,
  /const nextPreferences = \{\s*\.\.\.previousPreferences,\s*flashcardHideLockedSections: Boolean\(nextHidden\)/s
);
assert.match(
  persistPreferences,
  /await saveSupabaseState\(DISPLAY_PREFERENCES_KEY, nextPreferences, \{ silent: true \}\)/
);
assert.match(persistPreferences, /if \(!saved\) \{/);
assert.match(persistPreferences, /hideLockedSections = previousHidden/);
assert.match(persistPreferences, /remoteStore\[DISPLAY_PREFERENCES_KEY\] = previousPreferences/);
assert.match(persistPreferences, /Supabase: preference save failed/);

const normalLogin = sourceBetween("async function login(username, password)", "function getKnownDeckIds()");
const loginLoad = normalLogin.indexOf("await loadStudentStateFromSupabase()");
const loginHydrate = normalLogin.indexOf("hydrateFlashcardDisplayPreferences()");
const loginShow = normalLogin.indexOf('showAppPanel("dashboard", false)');
assert.ok(loginLoad !== -1 && loginLoad < loginHydrate && loginHydrate < loginShow);

const restoredLoad = sourceBetween("async function initSupabaseState()", "async function callSupabaseRpc");
assert.match(
  restoredLoad,
  /loadStudentStateForAdmin\(currentUser\.name\)[\s\S]*applyAdminStateToRemote\(currentUser\.name\)[\s\S]*hydrateFlashcardDisplayPreferences\(\)/
);
assert.match(
  restoredLoad,
  /loadStudentStateFromSupabase\(\)[\s\S]*hydrateFlashcardDisplayPreferences\(\)/
);

const adminSwitch = sourceBetween("async function switchAdminToStudent(studentName)", "function returnToAdminAccount()");
const switchSession = adminSwitch.indexOf("setSession(currentUser)");
const switchLoad = adminSwitch.indexOf("await loadStudentStateForAdmin(student.name)");
const switchHydrate = adminSwitch.indexOf("hydrateFlashcardDisplayPreferences()");
const switchShow = adminSwitch.indexOf('showAppPanel("dashboard", false)');
assert.ok(
  switchSession !== -1
  && switchSession < switchLoad
  && switchLoad < switchHydrate
  && switchHydrate < switchShow
);

const toggleHandler = sourceBetween(
  'const toggleLockedButton = event.target.closest("[data-toggle-locked-visibility]")',
  'if (event.target.closest("[data-toggle-dashboard-move]"))'
);
assert.match(toggleHandler, /await persistFlashcardHideLockedSections\(!hideLockedSections\)/);

const existingSharedPreferences = { anotherFlashcardPreference: "keep" };
const mergedPreferences = {
  ...existingSharedPreferences,
  flashcardHideLockedSections: true
};
assert.deepEqual(mergedPreferences, {
  anotherFlashcardPreference: "keep",
  flashcardHideLockedSections: true
});

console.log("Flashcard display preference checks passed.");
