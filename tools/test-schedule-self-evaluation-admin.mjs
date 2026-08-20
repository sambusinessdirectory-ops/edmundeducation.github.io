import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  SELF_EVALUATION_DEFINITIONS,
  selfEvaluationRatingsCsv
} from "../schedule-wellbeing.mjs";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");
const [html, js, css] = await Promise.all([
  read("schedule-motivation-admin.html"),
  read("schedule-motivation-admin.js"),
  read("schedule-motivation-admin.css")
]);

const metricKeys = [
  "motivation",
  "confidence",
  "concentration",
  "attention-span",
  "stress",
  "homework-difficulty"
];

assert.deepEqual(
  SELF_EVALUATION_DEFINITIONS.map((definition) => definition.key),
  metricKeys,
  "admin selector and database RPC must share the canonical six metric keys"
);

assert.match(html, /<select[^>]+name="metric"[^>]+data-metric-selector/);
for (const definition of SELF_EVALUATION_DEFINITIONS) {
  assert.match(
    html,
    new RegExp(`<option value="${definition.key}">${definition.label}</option>`),
    `missing ${definition.key} selector option`
  );
}
for (const hook of [
  "data-report-eyebrow",
  "data-report-title",
  "data-report-description",
  "data-rating-heading",
  "data-filter-form",
  "data-export-csv",
  "data-previous",
  "data-next"
]) {
  assert.match(html, new RegExp(hook), `missing ${hook} report hook`);
}
assert.match(html, /schedule-motivation-admin\.css\?v=20260820-1/);

assert.match(js, /SELF_EVALUATION_DEFINITIONS/);
assert.match(js, /selfEvaluationDefinition/);
assert.match(js, /selfEvaluationRatingsCsv/);
assert.match(js, /schedule_admin_list_self_evaluation_ratings/g);
assert.doesNotMatch(js, /schedule_admin_list_motivation_ratings/);
assert.match(js, /p_metric:\s*METRIC_KEYS\.has\(requestedMetric\)/);
assert.match(js, /state\.committedFilters\s*=\s*readFilters\(\)/);
assert.match(js, /\.\.\.committedRpcFilters\(\),\s*p_limit:\s*PAGE_SIZE/);
assert.match(js, /\.\.\.committedRpcFilters\(\),\s*p_limit:\s*1000/);
assert.match(js, /daily-self-evaluation-\$\{exportFilters\.p_metric\}/);
assert.match(js, /elements\.metricSelector\.disabled\s*=\s*state\.loading/);
assert.match(js, /schedule_admin_me/);
assert.match(js, /SESSION_KEY\s*=\s*"edmund-schedule-session-v1"/);

for (const metric of metricKeys.slice(1)) {
  assert.match(
    css,
    new RegExp(`body\\[data-self-evaluation-metric="${metric}"\\]\\s*\\{`),
    `missing ${metric} visual theme`
  );
}
assert.match(css, /\.rating\s*\{[^}]*linear-gradient\(135deg,\s*var\(--metric-start\),\s*var\(--metric-end\)\)/s);
assert.match(css, /button\.secondary\s*\{[^}]*linear-gradient\(135deg,\s*var\(--metric-start\),\s*var\(--metric-end\)\)/s);

const csv = selfEvaluationRatingsCsv([
  {
    student_name: "=HYPERLINK(\"bad\")",
    schedule_date: "2026-08-20",
    metric: "confidence",
    rating: 2,
    updated_at: "2026-08-20T10:00:00Z"
  }
]);
assert.ok(csv.startsWith("\uFEFF"));
assert.match(csv, /"'\=HYPERLINK\(""bad""\)"/);
assert.match(csv, /"今天的自信評分"/);

console.log("Schedule self-evaluation admin report tests passed.");
