#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("portal has the requested identity, shared login, and expanded dashboard hierarchy", async () => {
  const [html, config, script] = await Promise.all([
    read("student-progress.html"),
    read("student-progress-config.js"),
    read("student-progress.js")
  ]);
  assert.match(html, /\(學生使用\)/);
  assert.match(html, /全面英文能力<br>發展進度表/);
  assert.match(html, /data-edmund-system-switcher data-system="progress"/);
  assert.match(html, /data-dashboard-group="master"/);
  assert.match(html, /<details class="dashboard-group master-group" open/);
  assert.match(html, /data-master-cumulative-chart/);
  assert.match(html, /data-master-daily-chart/);
  assert.match(html, /data-admin-student-select/);
  assert.match(html, /data-custom-range-start/);
  assert.match(html, /data-custom-range-end/);
  assert.match(html, /data-schedule-snapshot/);
  assert.match(html, /<span class="group-index">16<\/span>/);
  assert.match(html, /data-schedule-previous/);
  assert.match(html, /data-schedule-next/);
  assert.match(html, /data-progress-export-open/);
  assert.match(html, /data-progress-export-dialog/);
  assert.match(html, /建立／列印 PDF/);
  assert.match(html, /shared-system-nav\.js\?v=/);
  assert.match(config, /adminUsername:\s*"Sam Admin Dashboard"/);
  assert.match(config, /studentLoginRpc:\s*"flashcard_student_login"/);
  assert.match(script, /edmund-student-progress-session-v1/);
  assert.match(script, /EdmundSystemNav\?\.rememberStudentSession/);
  assert.match(script, /EdmundSystemNav\?\.getStudentSession/);
  assert.match(script, /\/v1\/progress/);
  assert.match(script, /\/v1\/admin\/students/);
  assert.match(script, /source\.id === "writingSubmission"/);
  assert.match(script, /details class="dashboard-group source-group" open/);
  assert.match(script, /data-source-activity-period/);
  assert.match(script, /data-source-activity-all/);
  assert.match(script, /data-source-time-period/);
  assert.match(script, /data-source-time-all/);
  assert.match(script, /schedule_student_get_week/);
  assert.match(script, /p_token:\s*state\.authToken/);
  assert.match(script, /scheduleIsOwnStudentView/);
  assert.match(script, /state\.user\?\.role === "student"/);
  assert.match(script, /buildStudentProgressPrintDocument/);
  assert.match(script, /progressExportPreferenceKey/);
  assert.match(script, /window\.localStorage\.setItem/);
  assert.doesNotMatch(script, /schedule_(?:student|admin)_(?:upsert|delete|set_capacity|batch)/, "the progress snapshot must remain read-only");
});

test("student and parent portals share the complete-progress PDF chooser", async () => {
  const [studentHtml, parentHtml, exportScript] = await Promise.all([
    read("student-progress.html"),
    read("parent-communication.html"),
    read("student-progress-export.js")
  ]);
  for (const html of [studentHtml, parentHtml]) {
    assert.match(html, /匯出完整進度 PDF/);
    assert.match(html, /data-progress-export-list/);
    assert.match(html, /data-progress-export-select-all/);
    assert.match(html, /data-progress-export-save/);
    assert.match(html, /每個系統獨立一頁/);
  }
  assert.match(exportScript, /const pageTotal = definitions\.length \+ 1/);
  assert.match(exportScript, /break-after:page/);
  assert.match(exportScript, /buildMasterTimeSeries/);
  assert.match(exportScript, /buildActivitySeries/);
  assert.match(exportScript, /buildSourceTimeSeries/);
});

test("core declares all fourteen source systems in the requested order", async () => {
  const core = await read("student-progress-core.js");
  const expected = [
    "flashcards", "writingPractice", "sentenceStructure", "speaking",
    "phrasalVerbs", "idioms", "proverbs",
    "commonExpressionSpeaking", "commonExpressionWritten",
    "commonExpressionRhetoricalSpeaking", "commonExpressionRhetoricalWriting",
    "commonExpressionProfessionalMessage", "commonExpressionBusinessSpeaking",
    "writingSubmission"
  ];
  let previous = -1;
  for (const id of expected) {
    const index = core.indexOf(`id: "${id}"`);
    assert.ok(index > previous, `${id} must follow the requested source order`);
    previous = index;
  }
  assert.match(core, /buildMasterTimeSeries/);
  assert.match(core, /cumulativeTotalMs/);
  assert.match(core, /buildWritingAverageSeries/);
});

test("database snapshot reads canonical tables and deduplicates retries by question identity", async () => {
  const sql = await read("supabase-student-progress.sql");
  for (const table of [
    "flashcard_student_state",
    "writing_practice_attempts",
    "sentence_structure_attempts",
    "speaking_recording_attempts",
    "phrasal_verb_system_attempts",
    "idiom_system_attempts",
    "proverb_system_attempts",
    "common_expression_question_completions",
    "common_expression_time_activity_days",
    "writing_submissions"
  ]) assert.match(sql, new RegExp(`public\\.${table}`), table);
  assert.match(sql, /language sql\s+stable\s+security definer[\s\S]*?with\s+student_profile as/);
  assert.match(sql, /group by event\.system_id, event\.lesson_id, event\.question_id/);
  assert.match(sql, /round_value -> 'checkedIds'/);
  assert.match(sql, /_student_progress_json_timestamptz\(round_value -> 'submittedAt'\)/);
  assert.match(sql, /attempt\.storage_state = 'ready'/);
  assert.match(sql, /state\.key = 'edmundFlashcardAttempts'/);
  assert.match(sql, /detail\.detail_count >= greatest\(attempt\.answered_count, attempt\.aggregate_green \+ attempt\.aggregate_red\)/);
  assert.match(sql, /attempt\.attempt -> 'durationMs'/);
  const writingAccountCte = sql.match(/writing_account as \(([\s\S]*?)\n\),\n\s*writing_practice_activity_days as/)?.[1] || "";
  assert.ok(writingAccountCte, "Writing Practice account bridge CTE must exist");
  assert.match(writingAccountCte, /lower\(pg_catalog\.btrim\(account\.name\)\)\s*=\s*pg_catalog\.lower\(pg_catalog\.btrim\(student\.name\)\)/);
  assert.doesNotMatch(writingAccountCte, /limit\s+1/i, "all normalized matching Writing profiles must contribute their real attempt rows");
  assert.match(sql, /create unique index if not exists writing_student_accounts_name_normalized_idx[\s\S]*?lower\(pg_catalog\.btrim\(name\)\)/, "normalized Writing profile names must remain unambiguous");
  assert.match(sql, /attempt -> 'totalCards'/);
  assert.match(sql, /summary\.duration_ms > 0\s+and summary\.total_cards > 0/, "Flashcard time must use the native duration-and-card filter");
  const submissionCte = sql.match(/writing_submission_days as \(([\s\S]*?)\n\),\n\s*sources_json as/)?.[1] || "";
  assert.ok(submissionCte, "Writing Submission CTE must exist");
  assert.doesNotMatch(submissionCte, /deleted_at/, "soft-deleted articles must remain in historical progress");
  assert.match(submissionCte, /duration_seconds::bigint \* 1000/);
  assert.match(sql, /'timeZone', 'Asia\/Hong_Kong'/);
  assert.doesNotMatch(sql, /pg_catalog\.(?:coalesce|greatest|least|nullif)\(/, "SQL special expressions cannot be schema-qualified");
});

test("database snapshot keeps all six Common Expression dashboards separate", async () => {
  const sql = await read("supabase-student-progress.sql");
  const sourceMappings = [
    ["commonExpressionSpeaking", "speaking"],
    ["commonExpressionWritten", "written"],
    ["commonExpressionRhetoricalSpeaking", "rhetorical-speaking"],
    ["commonExpressionRhetoricalWriting", "rhetorical-writing"],
    ["commonExpressionProfessionalMessage", "professional-message"],
    ["commonExpressionBusinessSpeaking", "business-speaking"]
  ];

  assert.match(sql, /common_expression_activity_days as \([\s\S]*?completion\.completed_at at time zone 'Asia\/Hong_Kong'/);
  assert.match(sql, /from public\.common_expression_question_completions completion/);
  assert.match(sql, /group by completion\.system_key, 2/);
  assert.match(sql, /common_expression_time_days as \([\s\S]*?from public\.common_expression_time_activity_days activity/);
  assert.match(sql, /sum\(activity\.duration_ms\)::bigint as total_ms/);
  assert.match(sql, /group by activity\.system_key, activity\.activity_date/);

  for (const [sourceId, systemKey] of sourceMappings) {
    assert.match(sql, new RegExp(`'${sourceId}', pg_catalog\\.jsonb_build_object\\(`));
    assert.match(sql, new RegExp(`day\\.system_key = '${systemKey}'`));
  }
});

test("progress administrator is provisioned only with a private cost-12 hash", async () => {
  const [sql, readme, config, worker] = await Promise.all([
    read("supabase-student-progress.sql"),
    read("workers/student-progress/README.md"),
    read("student-progress-config.js"),
    read("workers/student-progress/src/index.js")
  ]);
  assert.match(sql, /student_progress_provision_admin\(\s*p_name text,\s*p_bcrypt_hash text/);
  assert.match(sql, /revoke all on function public\.student_progress_provision_admin\(text, text\)[\s\S]*?service_role/);
  assert.doesNotMatch(sql, /grant execute on function public\.student_progress_provision_admin/);
  assert.match(readme, /non-echoing prompt/);
  assert.match(readme, /<PASTE_COST_12_BCRYPT_HASH_ONLY>/);
  const allPublicSources = [sql, readme, config, worker].join("\n");
  assert.doesNotMatch(allPublicSources, /Dashboard Admin Control 5194/);
});

test("homepage, PWA manifest, sitemap, and workflow register the new portal", async () => {
  const [home, manifestSource, sitemap, workflow] = await Promise.all([
    read("index.html"),
    read("manifest.webmanifest"),
    read("sitemap.xml"),
    read(".github/workflows/pages.yml")
  ]);
  assert.match(home, /class="category student-progress-card" href="student-progress\.html"/);
  assert.match(home, /全面英文能力<br>發展進度表/);
  const manifest = JSON.parse(manifestSource);
  assert.ok(manifest.shortcuts.some(({ url }) => url === "/student-progress.html?source=pwa-shortcut"));
  assert.match(sitemap, /https:\/\/edmundeducation\.com\/student-progress\.html/);
  assert.match(workflow, /node tools\/test-student-progress-core\.mjs/);
  assert.match(workflow, /node tools\/test-student-progress-portal\.mjs/);
});

test("SQL migration has complete transaction and function delimiters", async () => {
  const sql = await read("supabase-student-progress.sql");
  assert.match(sql, /^-- EdmundEducation unified student progress portal/);
  assert.match(sql, /\nbegin;[\s\S]*\ncommit;\s*$/);
  assert.equal((sql.match(/\$\$/g) || []).length % 2, 0, "dollar-quoted functions must be balanced");
  assert.equal((sql.match(/create or replace function/g) || []).length, 13);
});

test("ISO round submission time wins across the Hong Kong midnight boundary", async () => {
  const sql = await read("supabase-student-progress.sql");
  assert.match(sql, /jsonb_typeof\(p_value\) <> 'string'/);
  assert.match(sql, /\^\[0-9\]\{4\}-\[0-9\]\{2\}-\[0-9\]\{2\}T/);
  assert.match(sql, /coalesce\(\s*public\._student_progress_json_timestamptz\(round_value -> 'submittedAt'\),\s*attempt\.completed_at/);
  const dayInHongKong = (value) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Hong_Kong", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(new Date(value));
    const get = (type) => parts.find((part) => part.type === type)?.value;
    return `${get("year")}-${get("month")}-${get("day")}`;
  };
  const submittedAt = "2026-07-28T15:59:30.000Z";
  const attemptCompletedAt = "2026-07-28T16:01:00.000Z";
  assert.equal(dayInHongKong(submittedAt), "2026-07-28");
  assert.equal(dayInHongKong(attemptCompletedAt), "2026-07-29");
});
