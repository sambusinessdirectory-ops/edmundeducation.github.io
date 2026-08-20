import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  SELF_EVALUATION_DEFINITIONS,
  WELLBEING_METRIC_KEYS,
  normalizeLearningPurposePayload,
  normalizeRatingCollapsePreferences,
  normalizeWellbeingMetric,
  selfEvaluationRatingsCsv,
  shouldLimitHomeworkSlots,
  wellbeingRatingsByMetricAndDate
} from "../schedule-wellbeing.mjs";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [html, js, links, sql] = await Promise.all([
  read("schedule-system.html"),
  read("schedule-system.js"),
  read("schedule-homework-links.mjs"),
  read("supabase-schedule-wellbeing-and-learning-purpose.sql")
]);

assert.deepEqual(
  SELF_EVALUATION_DEFINITIONS.map(({ key, label }) => [key, label]),
  [
    ["motivation", "今天的動力指數"],
    ["confidence", "今天的自信評分"],
    ["concentration", "專注力評分"],
    ["attention-span", "持續時間評分"],
    ["stress", "壓力評分"],
    ["homework-difficulty", "功課難度評分"]
  ]
);
assert.deepEqual(WELLBEING_METRIC_KEYS, [
  "confidence", "concentration", "attention-span", "stress", "homework-difficulty"
]);
assert.equal(normalizeWellbeingMetric("confidence"), "confidence");
assert.equal(normalizeWellbeingMetric("motivation"), null);
assert.equal(normalizeWellbeingMetric(null), null);

const wellbeing = wellbeingRatingsByMetricAndDate([
  { scheduleDate: "2026-08-20", metric: "confidence", rating: 2, updatedAt: "now" },
  { schedule_date: "2026-08-20", metric: "stress", rating: "4", updated_at: "later" },
  { scheduleDate: "bad", metric: "concentration", rating: 2 },
  { scheduleDate: "2026-08-20", metric: "unknown", rating: 2 }
]);
assert.deepEqual(wellbeing.confidence["2026-08-20"], {
  rating: 2, persistedRating: 2, updatedAt: "now"
});
assert.deepEqual(wellbeing.stress["2026-08-20"], {
  rating: 4, persistedRating: 4, updatedAt: "later"
});
assert.equal(shouldLimitHomeworkSlots({}, wellbeing, "2026-08-20"), true);
assert.equal(shouldLimitHomeworkSlots({}, {
  ...wellbeing,
  confidence: { "2026-08-20": { rating: 3 } },
  stress: { "2026-08-20": { rating: 3 } }
}, "2026-08-20"), false, "focus mode must restore immediately when no threshold remains");
assert.equal(shouldLimitHomeworkSlots({ "2026-08-20": { rating: 2 } }, {}, "2026-08-20"), true);
assert.equal(shouldLimitHomeworkSlots({ "2026-08-20": { rating: 3 } }, {
  "homework-difficulty": { "2026-08-20": { rating: 4 } }
}, "2026-08-20"), true);
assert.equal(shouldLimitHomeworkSlots({ "2026-08-20": { rating: 3 } }, {}, "2026-08-20"), false);

assert.deepEqual(normalizeRatingCollapsePreferences({
  collapseMotivation: true,
  collapseStress: true,
  collapseConfidence: "true"
}), {
  motivation: true,
  confidence: false,
  concentration: false,
  "attention-span": false,
  stress: true,
  "homework-difficulty": false
});

const csv = selfEvaluationRatingsCsv([{
  student_name: "=HYPERLINK(\"bad\")",
  schedule_date: "2026-08-20",
  metric: "attention-span",
  rating: 2,
  updated_at: "now"
}]);
assert.ok(csv.startsWith("\uFEFF"));
assert.match(csv, /"'\=HYPERLINK\(""bad""\)"/);
assert.match(csv, /"持續時間評分"/);

assert.deepEqual(normalizeLearningPurposePayload({
  id: "11111111-1111-4111-8111-111111111111",
  message: "初心",
  position: 2,
  totalCount: 3,
  olderId: "22222222-2222-4222-8222-222222222222",
  newerId: "33333333-3333-4333-8333-333333333333",
  isLatest: false,
  updatedAt: "now"
}), {
  id: "11111111-1111-4111-8111-111111111111",
  message: "初心",
  updatedAt: "now",
  totalCount: 3,
  position: 2,
  olderId: "22222222-2222-4222-8222-222222222222",
  newerId: "33333333-3333-4333-8333-333333333333",
  isLatest: false
});
assert.equal(normalizeLearningPurposePayload(null).isLatest, false);

for (const [label, colour] of [["本日最難", "#7f1734"], ["本日最簡單", "#74c9f1"]]) {
  assert.match(links, new RegExp(`label: "${label}", color: "${colour}"`));
}
assert.match(html, /--entry-tag-wrap-8/);

for (const hook of [
  "data-learning-purpose",
  "data-learning-purpose-message",
  "data-save-learning-purpose",
  "data-delete-learning-purpose",
  "data-learning-purpose-older",
  "data-learning-purpose-newer",
  "data-learning-purpose-latest",
  "data-learning-purpose-updated"
]) assert.match(html, new RegExp(hook));
assert.match(html, /學習英文，艱免感到疲倦。可以休息，但不要放棄！回歸當初，請寫下您學習英文的初心/);
assert.match(html, /\.learning-purpose-panel\s*\{[\s\S]*linear-gradient\(135deg, #7c1735, #4f1025\)/);
assert.match(html, /\.daily-self-rating-list\s*\{[^}]*display:\s*flex;[^}]*flex-wrap:\s*wrap/s);
assert.match(html, /\.daily-self-rating\.is-collapsed\s*\{[^}]*width:\s*max-content;[^}]*flex:\s*0 0 auto/s);
for (const selector of ["rating-confidence", "rating-concentration", "rating-attention-span", "rating-stress", "rating-homework-difficulty"]) {
  assert.match(html, new RegExp(`\\.daily-self-rating\\.${selector}\\s*\\{`));
}
for (const colour of ["#d9edb8", "#6482b8", "#cb4770", "#cc7764", "#8d5bc4"]) {
  assert.match(html, new RegExp(colour));
}

assert.match(js, /schedule_student_get_wellbeing_week/);
assert.match(js, /schedule_admin_get_wellbeing_week/);
assert.match(js, /schedule_student_save_wellbeing_rating/);
assert.match(js, /schedule_admin_save_wellbeing_rating/);
assert.match(js, /SELF_EVALUATION_DEFINITIONS\.map/);
assert.match(js, /data-rating-collapse/);
assert.match(js, /dataset\.ratingCollapseDate = scheduleDate/);
assert.match(js, /restoreRatingCollapseFocus\(definition\.key, scheduleDate\)/,
  "collapse rerenders must restore keyboard focus to the same weekday control");
assert.match(js, /data-rating-collapse-date="\$\{scheduleDate\}"/);
assert.match(js, /restoreSelfRatingFocus\("motivation", scheduleDate, rating\)/);
assert.match(js, /restoreSelfRatingFocus\(metric, scheduleDate, rating\)/);
assert.match(js, /if \(hideUnusedNow && !focusLimited && !entry\) continue;/,
  "focus mode must display an empty Slot 1 even when unused slots are normally hidden");
assert.match(js, /if \(focusLimited && slotIndex > 1\) continue;/);
assert.match(js, /更新自評後會即時恢復其他格/);
assert.match(js, /schedule_student_get_learning_purpose/);
assert.match(js, /schedule_admin_get_learning_purpose/);
assert.match(js, /schedule_student_save_learning_purpose/);
assert.match(js, /schedule_student_delete_learning_purpose/);
assert.match(js, /elements\.learningPurposeSave\?\.addEventListener\("click", saveLearningPurpose\)/);

for (const table of ["schedule_daily_wellbeing_ratings", "schedule_learning_purpose_versions"]) {
  assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`));
  assert.match(sql, new RegExp(`revoke all on table public\\.${table}\\s+from public, anon, authenticated`));
  assert.doesNotMatch(sql, new RegExp(`grant\\s+(?:select|insert|update|delete|all)[^;]*${table}`, "i"));
}
assert.match(sql, /schedule_daily_wellbeing_metric_date_student_idx/);
assert.match(sql, /schedule_learning_purpose_student_history_idx/);
assert.match(sql, /'hardest-today',[\s\S]*'easiest-today'/);
assert.match(sql, /pg_catalog\.cardinality\(p_tag_keys\) > 8/);
assert.match(sql, /or p_metric is null[\s\S]*or p_metric not in/g);
assert.match(sql, /pg_catalog\.char_length\(v_query\) > 100/);
assert.match(sql, /p_offset is null or p_offset not between 0 and 100000/);
assert.match(sql, /pg_catalog\.octet_length\(p_message\) > 4000/);
assert.match(sql, /regexp_replace\(p_message, E'\[\\n\\r\\t\]', '', 'g'\) ~ '\[\[:cntrl:\]\]'/);
assert.match(sql, /delete from public\.schedule_learning_purpose_versions purpose\s+where purpose\.id = p_version_id and purpose\.student_id = v_student_id/s,
  "a student must only be able to delete their own selected history version");
const purposeSave = sql.match(/create or replace function public\.schedule_student_save_learning_purpose\([\s\S]*?\n\$\$;/)?.[0] || "";
assert.match(purposeSave, /insert into public\.schedule_learning_purpose_versions/);
assert.doesNotMatch(purposeSave, /update public\.schedule_learning_purpose_versions/,
  "saving must create immutable history rather than overwrite a version");
assert.doesNotMatch(sql, /schedule_admin_(?:save|delete)_learning_purpose/,
  "the administrator's Learning Purpose access must remain read-only");
assert.match(sql, /with self_evaluations as \([\s\S]*schedule_daily_motivation_ratings[\s\S]*schedule_daily_wellbeing_ratings/);

for (const rpc of [
  "schedule_student_get_wellbeing_week(uuid, date)",
  "schedule_admin_get_wellbeing_week(uuid, uuid, date)",
  "schedule_student_save_wellbeing_rating(uuid, date, text, integer)",
  "schedule_admin_save_wellbeing_rating(uuid, uuid, date, text, integer)",
  "schedule_admin_list_self_evaluation_ratings(uuid, text, date, date, text, integer, integer)",
  "schedule_student_get_learning_purpose(uuid, uuid)",
  "schedule_admin_get_learning_purpose(uuid, uuid, uuid)",
  "schedule_student_save_learning_purpose(uuid, text)",
  "schedule_student_delete_learning_purpose(uuid, uuid)"
]) {
  const escaped = rpc.replace(/[().]/g, "\\$&");
  assert.match(sql, new RegExp(`revoke all on function public\\.${escaped} from public, anon, authenticated`));
  assert.match(sql, new RegExp(`grant execute on function public\\.${escaped} to authenticated`));
}
assert.ok((sql.match(/if \(select auth\.uid\(\)\) is null/g) || []).length >= 9,
  "every public wellbeing/report/purpose RPC must require an authenticated caller");

console.log("Schedule wellbeing, focus mode, tags, and Learning Purpose tests passed.");
