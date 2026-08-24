import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");
const [html, css, js, dataSource, configSource, sql, persistentSql, analyticsSql, thinkingSql, plannerHtml, plannerCss, plannerJs, dashboardHtml, dashboardCss, dashboardJs, thinkingHtml, thinkingCss, thinkingJs, home, nav] = await Promise.all([
  read("execution-system.html"), read("execution-system.css"), read("execution-system.js"),
  read("execution-system-data.js"), read("execution-system-config.js"), read("supabase-execution-system.sql"),
  read("supabase-execution-system-persistent-tools.sql"),
  read("supabase-execution-system-planner-analytics.sql"),
  read("supabase-execution-system-thinking-day-planner.sql"),
  read("execution-task-planner.html"), read("execution-task-planner.css"), read("execution-task-planner.js"),
  read("execution-dashboard.html"), read("execution-dashboard.css"), read("execution-dashboard.js"),
  read("execution-thinking-log.html"), read("execution-thinking-log.css"), read("execution-thinking-log.js"),
  read("index.html"), read("shared-system-nav.js")
]);

const dataContext = { window: {} };
vm.createContext(dataContext);
vm.runInContext(dataSource, dataContext, { filename: "execution-system-data.js" });
const tables = dataContext.window.EDMUND_EXECUTION_TABLES;
assert.equal(tables.length, 8, "Card 57 must contain exactly eight source tools");
assert.deepEqual(Array.from(tables, ({ number }) => number), ["01", "02", "03", "04", "05", "06", "07", "08"]);
assert.equal(tables.find(({ id }) => id === "before-each-item").groups[0].rows.length, 27, "pre-task evaluation must retain all 27 prompts");
assert.equal(tables.find(({ id }) => id === "complete-execution").groups[1].rows.length, 36, "the complete workflow must retain all 36 stages");
for (const table of tables) {
  assert.ok(table.groups.length, `${table.id} must have sections`);
  assert.ok(table.groups.flatMap(({ rows }) => rows).length >= 10, `${table.id} unexpectedly lost checklist steps`);
}

assert.match(home, /href="execution-system\.html"[^>]*aria-label="執行動力系統"/);
assert.match(nav, /id: "execution", href: "execution-system\.html"/);
assert.match(html, /data-role-tab="student"/);
assert.match(html, /data-role-tab="admin"/);
assert.match(html, /data-progress-track/);
assert.match(html, /data-reset-dialog/);
assert.match(html, /href="execution-task-planner\.html"/);
assert.match(html, /href="execution-dashboard\.html"/);
assert.match(html, /href="execution-thinking-log\.html"/);
assert.match(js, /status === "locked"/);
assert.match(js, /localStorage\.setItem\(progressKey\(\)/);
assert.match(js, /event\.key !== "Enter"/);
assert.match(js, /addEventListener\("contextmenu"/);
assert.match(js, /execution_system_step_achievement_adjust|achievementAdjustRpc/);
assert.match(css, /\.step-toggle[^}]*border-radius:50%/);
assert.match(css, /\.achievement-control/);

assert.match(plannerHtml, /工作構思簿/);
assert.match(plannerHtml, /min="2026-01-01"/);
assert.match(plannerHtml, /max="2050-12-31"/);
assert.match(plannerHtml, /再加 10 個/);
assert.match(plannerJs, /before-each-item/);
assert.match(plannerJs, /plannerTaskArchiveRpc/);
assert.match(plannerJs, /plannerTaskMoveRpc/);
assert.match(plannerJs, /plannerTaskTimerRpc/);
assert.match(plannerJs, /plannerTaskRatingRpc/);
assert.match(plannerJs, /plannerTaskReactivateRpc/);
assert.match(plannerJs, /plannerThinkingRecordRpc/);
assert.match(plannerJs, /plannerHourBlockSaveRpc/);
assert.match(plannerJs, /移到明天/);
assert.match(plannerJs, /重新啟動這項工作/);
assert.match(plannerJs, /plannerCapacityRpc/);
assert.match(plannerCss, /\.task-card/);
assert.match(plannerCss, /\.difficulty-rating/);
assert.match(plannerCss, /\.task-timer-bar/);
assert.match(plannerCss, /\.saved-task-title/);
assert.match(plannerCss, /\.day-planner/);
assert.match(plannerHtml, /data-hour-grid/);

assert.match(dashboardHtml, /數據儀表板/);
assert.match(dashboardHtml, /data-period="week"/);
assert.match(dashboardHtml, /data-period="month"/);
assert.match(dashboardHtml, /data-period="year"/);
assert.match(dashboardHtml, /data-period="all"/);
assert.match(dashboardJs, /plannerAnalyticsRpc/);
assert.match(dashboardJs, /plannerCompletedTasksRpc/);
assert.match(dashboardJs, /createElementNS\("http:\/\/www\.w3\.org\/2000\/svg"/);
assert.match(dashboardCss, /\.chart-axis/);
assert.match(dashboardCss, /\.completed-log/);

assert.match(thinkingHtml, /思考時間紀錄/);
assert.match(thinkingHtml, /data-question-bars/);
assert.match(thinkingJs, /plannerThinkingLogsRpc/);
assert.match(thinkingCss, /\.question-bars/);

assert.match(persistentSql, /check \(success_count between 0 and 99999\)/i);
assert.match(persistentSql, /check \(task_date between date '2026-01-01' and date '2050-12-31'\)/i);
assert.match(persistentSql, /least\(99999/i);
assert.match(persistentSql, /least\(1000/i);
assert.match(persistentSql, /enable row level security/i);
assert.match(persistentSql, /revoke all on table public\.execution_system_step_achievements/i);
assert.match(persistentSql, /execution_system_planner_task_archive/i);
assert.match(analyticsSql, /add column if not exists difficulty_rating smallint/i);
assert.match(analyticsSql, /add column if not exists writing_elapsed_seconds integer/i);
assert.match(analyticsSql, /execution_system_planner_task_move_tomorrow/i);
assert.match(analyticsSql, /execution_system_planner_task_reactivate/i);
assert.match(analyticsSql, /execution_system_planner_task_timer/i);
assert.match(analyticsSql, /execution_system_planner_task_rating/i);
assert.match(analyticsSql, /execution_system_planner_analytics_load/i);
assert.match(analyticsSql, /pg_advisory_xact_lock/i);
assert.match(analyticsSql, /grant execute on function public\.execution_system_planner_analytics_load\(text, date, uuid, uuid\) to authenticated/i);
assert.match(analyticsSql, /revoke all on function public\.execution_system_planner_task_move_tomorrow/i);
assert.doesNotMatch(analyticsSql, /pg_catalog\.(?:coalesce|least|greatest|extract)\s*\(/i, "PostgreSQL special forms cannot be schema-qualified");
assert.match(thinkingSql, /execution_system_planner_thinking_logs/i);
assert.match(thinkingSql, /execution_system_planner_hour_blocks/i);
assert.match(thinkingSql, /execution_system_planner_completed_tasks_load/i);
assert.match(thinkingSql, /enable row level security/i);
assert.match(thinkingSql, /revoke all on table public\.execution_system_planner_thinking_logs/i);
assert.match(thinkingSql, /grant execute on function public\.execution_system_planner_thinking_logs_load\(date, date, uuid, uuid\) to authenticated/i);
assert.doesNotMatch(thinkingSql, /pg_catalog\.(?:coalesce|least|greatest|extract)\s*\(/i, "PostgreSQL special forms cannot be schema-qualified");

const secret = "Execution?PsychologyHelps!5194?Yes!@";
assert.doesNotMatch([html, css, js, dataSource, configSource, sql, persistentSql, analyticsSql, thinkingSql, plannerHtml, plannerCss, plannerJs, dashboardHtml, dashboardCss, dashboardJs, thinkingHtml, thinkingCss, thinkingJs].join("\n"), new RegExp(secret.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "plaintext administrator password must never be committed");
for (const fn of ["execution_system_admin_login", "execution_system_admin_me", "execution_system_admin_logout"]) {
  assert.match(sql, new RegExp(`security definer[\\s\\S]*?set search_path = ''[\\s\\S]*?${fn}|${fn}[\\s\\S]*?security definer[\\s\\S]*?set search_path = ''`, "i"));
}
assert.match(sql, /enable row level security/i);
assert.match(sql, /revoke all on table public\.execution_system_admin_accounts/i);
assert.match(sql, /grant execute on function public\.execution_system_admin_login\(text, text\) to authenticated/i);
assert.match(sql, /failure_count/i);
assert.doesNotMatch(sql, /pg_catalog\.(?:coalesce|least|greatest)\s*\(/i, "PostgreSQL special forms cannot be schema-qualified");

console.log(`Execution system checks passed (${tables.length} tools, ${tables.reduce((sum, table) => sum + table.groups.flatMap(({ rows }) => rows).length, 0)} checklist rows).`);
