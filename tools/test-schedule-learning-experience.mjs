import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import {
  DEFAULT_POMODORO_SETTINGS,
  formatPomodoroRemaining,
  learningDaySummary,
  nextPomodoroPhase,
  normalizePomodoroSettings,
  normalizePurposeFontSize
} from "../schedule-learning-experience.mjs";

const root = new URL("../", import.meta.url);
const read = (name) => readFile(new URL(name, root), "utf8");
const [html, script, sharedNav, sharedNavCss, scheduleMigration, writingMigration, linkModule] = await Promise.all([
  read("schedule-system.html"), read("schedule-system.js"),
  read("shared-system-nav.js"), read("shared-system-nav.css"),
  read("supabase-schedule-learning-experience-20260820.sql"),
  read("supabase-writing-submission-manual-topics-20260820.sql"),
  read("schedule-homework-links.mjs")
]);

assert.deepEqual(
  learningDaySummary({ sources: {
    flashcards: { activityDays: [{ date: "2026-08-18" }, { date: "2026-08-19" }] },
    writing: { timeDays: [{ date: "2026-08-19" }, { date: "2026-08-20" }] }
  } }, "2026-08-20"),
  { streak: 3, total: 3, latestDay: "2026-08-20" }
);
assert.equal(learningDaySummary({ sources: { x: { activityDays: [{ date: "2026-08-01" }] } } }, "2026-08-20").streak, 0);
assert.equal(normalizePurposeFontSize(99), 2);
assert.equal(normalizePurposeFontSize(3), 3);
assert.deepEqual(normalizePomodoroSettings({}), DEFAULT_POMODORO_SETTINGS);
assert.equal(normalizePomodoroSettings({ allowSkipBreak: true }).allowSkipBreak, true);
assert.deepEqual(nextPomodoroPhase({ phase: "work", completedSessions: 3, settings: DEFAULT_POMODORO_SETTINGS }), { phase: "long-break", completedSessions: 4 });
assert.equal(formatPomodoroRemaining(61000), "01:01");

for (const asset of ["day-streak-fire.gif", "lifetime-learning-days.gif", "pomodoro-method.png"]) {
  assert.ok((await stat(new URL(`assets/schedule/${asset}`, root))).size > 0, `${asset} must be deployed`);
}
assert.match(html, /data-learning-day-counters/);
assert.match(html, /連續學習日數/);
assert.match(html, /總學習日數/);
assert.match(html, /data-purpose-font-size="3"/);
assert.match(html, /語言與機遇/);
assert.match(sharedNav, /data-edmund-pomodoro-break-lock/);
assert.match(sharedNav, /data-edmund-pomodoro-allow-skip/);
assert.match(sharedNav, /data-edmund-pomodoro-skip-break/);
assert.match(sharedNav, /className = "edmund-pomodoro-header-button"/);
assert.match(sharedNavCss, /html\.edmund-pomodoro-page-locked[\s\S]*?overflow: hidden !important/);
assert.match(sharedNavCss, /\.edmund-pomodoro-dialog\s*\{[^}]*width: min\(760px, calc\(100vw - 24px\)\)[^}]*overflow: visible/s);
assert.doesNotMatch(html, /data-pomodoro-header|data-pomodoro-dialog|data-pomodoro-break-lock/);
assert.match(html, /\.learning-day-counter\s*\{[^}]*padding:0[^}]*\}/s);
assert.doesNotMatch(html, /\.learning-day-counter\s*\{[^}]*border:1px/s);
assert.match(sharedNavCss, /\.edmund-pomodoro-break-lock\s*\{[^}]*background: rgba\(102, 48, 45, \.7\)/s);
assert.match(sharedNav, /function skipPomodoroBreak\(\)/);
assert.match(sharedNav, /pomodoroState\.settings\.allowSkipBreak/);
assert.match(script, /edmund-student-progress\.edmundeducation\.workers\.dev/);
assert.match(script, /STUDENT_PROGRESS_WORKER_URL\}\/v1\/progress/);
assert.match(script, /schedule_admin_teacher_assignment_students/);
assert.match(script, /schedule_admin_resource_usage/);
assert.match(script, /refreshManualWriting: type === "writing-submission"/);
assert.match(script, /elements\.homeworkPickerSearch\.focus\(\)/);
assert.match(sharedNav, /element\.inert = true[\s\S]*?element\.inert = false/);
assert.match(scheduleMigration, /alter table public\.schedule_language_opportunities enable row level security/i);
assert.match(scheduleMigration, /public\._schedule_admin_id\(p_admin_token\) is null/i);
assert.match(scheduleMigration, /schedule_admin_resource_usage/);
assert.match(writingMigration, /schedule_admin_list_manual_writing_resources/);
assert.match(linkModule, /manualTopic/);

console.log("Schedule learning-experience checks passed.");
