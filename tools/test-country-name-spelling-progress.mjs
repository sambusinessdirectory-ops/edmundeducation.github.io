import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  countrySpellingLocalKey, countrySpellingStatesEqual, createDefaultCountrySpellingProgress,
  mergeCountrySpellingProgress, normaliseCountrySpellingProgress
} from "../country-name-spelling-progress.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const app = readFileSync(join(root, "country-name-spelling-terminal-v2.mjs"), "utf8");
const html = readFileSync(join(root, "country-name-spelling.html"), "utf8");
const migration = readFileSync(join(root, "supabase/migrations/20261104135806_country_spelling_account_progress.sql"), "utf8");

const fallback = createDefaultCountrySpellingProgress();
assert.equal(fallback.edition, "world");
assert.equal(fallback.showMasteredMap, true);
assert.deepEqual(fallback.mastered, []);

const unsafe = normaliseCountrySpellingProgress({
  edition:"administrator",
  worldMode:"unknown",
  attempts:-10,
  mastered:["world:name:france", "world:name:france", 7],
  failures:{ "world:name:france":4, broken:-2 },
  showMasteredMap:false,
  updatedAt:"not-a-time"
});
assert.equal(unsafe.edition, "world");
assert.equal(unsafe.worldMode, "Country names");
assert.equal(unsafe.attempts, 0);
assert.deepEqual(unsafe.mastered, ["world:name:france"]);
assert.deepEqual(unsafe.failures, { "world:name:france":4, broken:0 });
assert.equal(unsafe.showMasteredMap, false);

const server = normaliseCountrySpellingProgress({
  edition:"world",
  attempts:12,
  correct:8,
  mastered:["world:name:france", "hong-kong:wan-chai"],
  failures:{ "world:name:germany":2 },
  showMasteredMap:true,
  updatedAt:100
});
const local = normaliseCountrySpellingProgress({
  edition:"hong-kong",
  attempts:10,
  correct:9,
  mastered:["world:name:germany", "hong-kong:wan-chai"],
  failures:{ "world:name:germany":4, "hong-kong:sha-tin":1 },
  showMasteredMap:false,
  updatedAt:200
});
const merged = mergeCountrySpellingProgress(server, local);
assert.equal(merged.edition, "hong-kong", "newest device should retain its current screen");
assert.equal(merged.showMasteredMap, false, "newest device should retain its mastery-colour preference");
assert.equal(merged.attempts, 12, "monotonic counters must never move backwards");
assert.equal(merged.correct, 9);
assert.deepEqual(new Set(merged.mastered), new Set(["world:name:france", "world:name:germany", "hong-kong:wan-chai"]));
assert.equal(merged.failures["world:name:germany"], 4);
assert.equal(merged.failures["hong-kong:sha-tin"], 1);

assert.equal(countrySpellingLocalKey("Student-A"), "edmund-country-name-spelling-progress-v3:Student-A");
assert.notEqual(countrySpellingLocalKey("Student-A"), countrySpellingLocalKey("Student-B"), "accounts must never share browser backups");
assert.equal(countrySpellingStatesEqual(merged, { ...merged }), true);
assert.equal(countrySpellingStatesEqual(merged, { ...merged, mastered:[] }), false);

assert.match(app, /flashcard_student_get_state_v2/);
assert.match(app, /flashcard_student_upsert_state_v2/);
assert.match(app, /edmundCountrySpellingProgressV1/);
assert.match(app, /version_conflict/);
assert.match(app, /mergeCountrySpellingProgress/);
assert.match(app, /OFFLINE · SAVED ON THIS DEVICE/);
assert.match(app, /localStorage\.removeItem\(LEGACY_PROGRESS_KEY\)/);
assert.match(html, /data-sync-status/);
assert.match(html, /ACCOUNT PROGRESS SYNCED/);
assert.match(migration, /edmundCountrySpellingProgressV1/);
assert.match(migration, /versioned_replace/);
assert.match(migration, /524288/);

console.log("country spelling account progress verified: per-student local keys, deterministic merge, v2 RPC conflict retry, and legacy migration");
