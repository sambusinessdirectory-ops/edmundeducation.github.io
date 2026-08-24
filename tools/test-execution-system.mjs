import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");
const [html, css, js, dataSource, configSource, sql, persistentSql, plannerHtml, plannerCss, plannerJs, home, nav] = await Promise.all([
  read("execution-system.html"), read("execution-system.css"), read("execution-system.js"),
  read("execution-system-data.js"), read("execution-system-config.js"), read("supabase-execution-system.sql"),
  read("supabase-execution-system-persistent-tools.sql"),
  read("execution-task-planner.html"), read("execution-task-planner.css"), read("execution-task-planner.js"),
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
assert.match(plannerJs, /plannerCapacityRpc/);
assert.match(plannerCss, /\.task-card/);

assert.match(persistentSql, /check \(success_count between 0 and 99999\)/i);
assert.match(persistentSql, /check \(task_date between date '2026-01-01' and date '2050-12-31'\)/i);
assert.match(persistentSql, /least\(99999/i);
assert.match(persistentSql, /least\(1000/i);
assert.match(persistentSql, /enable row level security/i);
assert.match(persistentSql, /revoke all on table public\.execution_system_step_achievements/i);
assert.match(persistentSql, /execution_system_planner_task_archive/i);

const secret = "Execution?PsychologyHelps!5194?Yes!@";
assert.doesNotMatch([html, css, js, dataSource, configSource, sql, persistentSql, plannerHtml, plannerCss, plannerJs].join("\n"), new RegExp(secret.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "plaintext administrator password must never be committed");
for (const fn of ["execution_system_admin_login", "execution_system_admin_me", "execution_system_admin_logout"]) {
  assert.match(sql, new RegExp(`security definer[\\s\\S]*?set search_path = ''[\\s\\S]*?${fn}|${fn}[\\s\\S]*?security definer[\\s\\S]*?set search_path = ''`, "i"));
}
assert.match(sql, /enable row level security/i);
assert.match(sql, /revoke all on table public\.execution_system_admin_accounts/i);
assert.match(sql, /grant execute on function public\.execution_system_admin_login\(text, text\) to authenticated/i);
assert.match(sql, /failure_count/i);
assert.doesNotMatch(sql, /pg_catalog\.(?:coalesce|least|greatest)\s*\(/i, "PostgreSQL special forms cannot be schema-qualified");

console.log(`Execution system checks passed (${tables.length} tools, ${tables.reduce((sum, table) => sum + table.groups.flatMap(({ rows }) => rows).length, 0)} checklist rows).`);
