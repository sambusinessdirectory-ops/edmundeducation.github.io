import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import {
  SCHEDULE_MAX_DATE,
  SCHEDULE_MIN_DATE,
  addDays,
  defaultWeekStart,
  firstWeekStart,
  hongKongDayKey,
  isDateInScheduleRange,
  isWeekStartInScheduleRange,
  lastWeekStart,
  parseISODate,
  toISODate,
  weekDates
} from "../schedule-calendar.mjs";
import {
  COUNTDOWN_BATCH_SIZE,
  COUNTDOWN_INITIAL_CAPACITY,
  COUNTDOWN_MAX_CAPACITY,
  countdownBreakdown,
  countdownBreakdownFromHongKongNow,
  formatEstimatedMinutes,
  isAdjacentSpanTarget,
  planCountdownCapacityChange,
  spanBounds,
  spanLaneLayout,
  studyHoursBefore,
  studyHoursFromHongKongNow
} from "../schedule-enhancements.mjs";
import {
  buildScheduleWeekUrl,
  scheduleWeekShareMessage,
  scheduleWeekStartFromUrl
} from "../schedule-share.mjs";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

const [
  homepage,
  modelEssayHtml,
  scheduleHtml,
  scheduleJs,
  scheduleSql,
  massEditSql,
  accountManagementSql,
  moreThanHalfMigrationSql,
  announcementMigrationSql,
  announcementEditMigrationSql,
  announcementScript,
  announcementCss,
  databaseSmokeTest,
  worker
] = await Promise.all([
  read("index.html"),
  read("model-essay-downloads.html"),
  read("schedule-system.html"),
  read("schedule-system.js"),
  read("supabase-schedule-system.sql"),
  read("supabase-schedule-mass-edit.sql"),
  read("supabase-schedule-account-management.sql"),
  read("supabase-schedule-more-than-half-completed.sql"),
  read("supabase-schedule-announcements.sql"),
  read("supabase-schedule-announcement-edit.sql"),
  read("site-announcements.js"),
  read("site-announcements.css"),
  read("tools/test-schedule-batch-database.sql"),
  read("workers/schedule-system/src/index.js")
]);

assert.match(homepage, /site-announcements\.css\?v=/);
assert.match(homepage, /site-announcements\.js\?v=/);
assert.match(scheduleHtml, /announcement-admin-panel/);
assert.match(scheduleHtml, /data-announcement-message/);
assert.match(scheduleHtml, /data-announcement-image-action/);
assert.match(scheduleHtml, /data-announcement-cancel-edit/);
assert.match(scheduleHtml, /data-entry-tags/);
assert.match(scheduleJs, /HOMEWORK_ENTRY_TAGS/);
assert.match(scheduleJs, /announcementApi/);
assert.match(scheduleJs, /function beginAnnouncementEdit\(/);
assert.match(scheduleJs, /body\.set\("imageAction", imageAction\)/);
assert.match(scheduleJs, /Authorization:\s*`Bearer \$\{state\.currentUser\.adminToken\}`/);
assert.match(announcementScript, /STORAGE_KEY/);
assert.match(announcementScript, /localStorage\.setItem/);
assert.doesNotMatch(announcementScript, /method:\s*["'](?:POST|PATCH|PUT|DELETE)/i);
assert.match(announcementScript, /聯絡 Edmund 以知道更多/);
assert.match(announcementScript, /知道了/);
assert.match(announcementCss, /\.site-announcement-contact[^}]*color:\s*#fff[^}]*background:\s*#[0-9a-f]{6}/is);
assert.match(announcementMigrationSql, /alter table public\.schedule_announcements enable row level security/i);
assert.match(announcementMigrationSql, /revoke all on table public\.schedule_announcements/i);
assert.match(announcementMigrationSql, /schedule_announcement_public_list/);
assert.match(announcementMigrationSql, /schedule_announcement_admin_auth/);
assert.match(announcementMigrationSql, /schedule_announcement_admin_delete/);
assert.doesNotMatch(announcementMigrationSql, /grant (?:select|insert|update|delete) on table/i);
assert.match(announcementEditMigrationSql, /create or replace function public\.schedule_announcement_admin_update/);
assert.match(announcementEditMigrationSql, /security definer\s+set search_path = ''/i);
assert.match(announcementEditMigrationSql, /announcement\.version = p_expected_version/);
assert.match(announcementEditMigrationSql, /p_image_action in \('keep', 'remove'\)/);
assert.match(announcementEditMigrationSql, /revoke all on function public\.schedule_announcement_admin_update\([\s\S]*?from public, anon, authenticated, service_role/i);
assert.match(announcementEditMigrationSql, /grant execute on function public\.schedule_announcement_admin_update\([\s\S]*?to anon/i);
assert.doesNotMatch(announcementEditMigrationSql, /grant (?:select|insert|update|delete|all) on table/i);
assert.match(worker, /imageContentTypeFromBytes/);
assert.match(worker, /schedule_announcement_admin_update/);
assert.match(worker, /headers\.set\("Cache-Control", "no-store"\)/);

assert.equal(SCHEDULE_MIN_DATE, "2026-01-01");
assert.equal(SCHEDULE_MAX_DATE, "2050-12-31");
assert.equal(toISODate(firstWeekStart()), "2025-12-29");
assert.ok(isWeekStartInScheduleRange(toISODate(firstWeekStart())));
assert.ok(isWeekStartInScheduleRange(toISODate(lastWeekStart())));
assert.equal(parseISODate(toISODate(firstWeekStart())).getDay(), 1);
assert.equal(parseISODate(toISODate(lastWeekStart())).getDay(), 1);
assert.equal(hongKongDayKey("2026-08-09T15:59:59Z"), "2026-08-09");
assert.equal(hongKongDayKey("2026-08-09T16:00:00Z"), "2026-08-10");
assert.equal(defaultWeekStart(new Date("2026-08-09T16:00:00Z")), "2026-08-10");

let cursor = parseISODate(SCHEDULE_MIN_DATE);
const finalDate = parseISODate(SCHEDULE_MAX_DATE);
let supportedDays = 0;
while (cursor <= finalDate) {
  const iso = toISODate(cursor);
  assert.ok(isDateInScheduleRange(iso));
  supportedDays += 1;
  cursor = addDays(cursor, 1);
}
assert.equal(supportedDays, 9131, "2026-01-01 through 2050-12-31 must contain 9,131 days");

assert.equal(formatEstimatedMinutes(45), "45 分鐘");
assert.equal(formatEstimatedMinutes(60), "1 小時");
assert.equal(formatEstimatedMinutes(123), "2 小時 3 分鐘");
assert.equal(COUNTDOWN_INITIAL_CAPACITY, 6);
assert.equal(COUNTDOWN_BATCH_SIZE, 5);
assert.equal(COUNTDOWN_MAX_CAPACITY, 101);
const spanEntries = [
  { id: "a", spanGroupId: "project", scheduleDate: "2026-07-13" },
  { id: "b", spanGroupId: "project", scheduleDate: "2026-07-14" },
  { id: "c", spanGroupId: "project", scheduleDate: "2026-07-15" }
];
assert.deepEqual(spanBounds(spanEntries, spanEntries[1]), {
  start: "2026-07-13", end: "2026-07-15", length: 3
});
assert.equal(isAdjacentSpanTarget(spanEntries, spanEntries[1], "2026-07-12"), true);
assert.equal(isAdjacentSpanTarget(spanEntries, spanEntries[1], "2026-07-16"), true);
assert.equal(isAdjacentSpanTarget(spanEntries, spanEntries[1], "2026-07-17"), false);
const laneDates = ["2026-07-13", "2026-07-14", "2026-07-15", "2026-07-16", "2026-07-17"];
const laneLayout = spanLaneLayout([
  { id: "a1", spanGroupId: "alpha", scheduleDate: "2026-07-13" },
  { id: "a2", spanGroupId: "alpha", scheduleDate: "2026-07-14" },
  { id: "a3", spanGroupId: "alpha", scheduleDate: "2026-07-15" },
  { id: "b1", spanGroupId: "beta", scheduleDate: "2026-07-14" },
  { id: "b2", spanGroupId: "beta", scheduleDate: "2026-07-15" },
  { id: "b3", spanGroupId: "beta", scheduleDate: "2026-07-16" },
  { id: "c1", spanGroupId: "charlie", scheduleDate: "2026-07-16" },
  { id: "c2", spanGroupId: "charlie", scheduleDate: "2026-07-17" }
], laneDates);
assert.equal(laneLayout.laneCount, 2, "overlapping spans must reserve separate global lanes");
assert.equal(laneLayout.laneByGroup.alpha, laneLayout.laneByGroup.charlie, "non-overlapping spans may reuse a lane");
assert.notEqual(laneLayout.laneByGroup.alpha, laneLayout.laneByGroup.beta);
assert.deepEqual(
  laneLayout.cells["2026-07-13"],
  ["alpha", null],
  "every date must expose placeholder cells for inactive global span lanes"
);
assert.deepEqual(laneLayout.cells["2026-07-16"], ["charlie", "beta"]);
assert.deepEqual(countdownBreakdown("2026-07-26", "2026-08-25"), {
  days: 30, months: 1, monthWeeks: 0, weeks: 4, weekDays: 2,
  hours: 720, hourMinutes: 0, minutes: 43200
});
assert.equal(studyHoursBefore("2026-07-26", "2026-08-25", 1.5), 45);
assert.equal(countdownBreakdown("2026-08-25", "2026-07-26").days, 0);
assert.equal(countdownBreakdown("2026-02-01", "2026-02-31").days, 0, "impossible dates must not be normalized silently");
assert.deepEqual(
  countdownBreakdownFromHongKongNow("2026-08-11", "2026-08-10T15:30:00Z"),
  {
    days: 1, months: 0, monthWeeks: 0, weeks: 0, weekDays: 1,
    hours: 24, hourMinutes: 29, minutes: 1469
  },
  "the countdown must use the current instant and the end of the selected Hong Kong date"
);
assert.deepEqual(
  countdownBreakdownFromHongKongNow("2026-08-11", "2026-08-10T16:30:00Z"),
  {
    days: 0, months: 0, monthWeeks: 0, weeks: 0, weekDays: 0,
    hours: 23, hourMinutes: 29, minutes: 1409
  },
  "remaining time must roll over at Hong Kong midnight"
);
assert.equal(studyHoursFromHongKongNow("2026-08-11", 2, "2026-08-10T15:30:00Z"), 2.04);
assert.equal(studyHoursFromHongKongNow("2026-08-10", 2, "2026-08-10T16:00:00Z"), 0);

const firstShareWeek = toISODate(firstWeekStart());
const lastShareWeek = toISODate(lastWeekStart());
assert.equal(scheduleWeekStartFromUrl(`https://edmundeducation.com/schedule-system.html?week=${firstShareWeek}`, "2026-08-10"), firstShareWeek);
assert.equal(scheduleWeekStartFromUrl(`https://edmundeducation.com/schedule-system.html?week=${lastShareWeek}`, "2026-08-10"), lastShareWeek);
assert.equal(scheduleWeekStartFromUrl("https://edmundeducation.com/schedule-system.html?week=2026-08-11", "2026-08-10"), "2026-08-10");
assert.equal(scheduleWeekStartFromUrl("https://edmundeducation.com/schedule-system.html?week=2026-08-10&week=2026-08-17", "2026-08-10"), "2026-08-10");
assert.equal(
  buildScheduleWeekUrl("https://name:password@edmundeducation.com/schedule-system.html?token=secret&student=abc#private", "2026-08-10"),
  "https://edmundeducation.com/schedule-system.html?week=2026-08-10",
  "shared links must contain only the selected week"
);
assert.equal(
  scheduleWeekShareMessage("https://edmundeducation.com/schedule-system.html?week=2026-08-10"),
  "Edmund 提醒：\n已安排本週功課，請努力溫習！ 😬💪🏻\nhttps://edmundeducation.com/schedule-system.html?week=2026-08-10"
);
assert.deepEqual(planCountdownCapacityChange(6, 5), {
  allowed: true,
  reason: "ok",
  current: 6,
  target: 11,
  createdPositions: [7, 8, 9, 10, 11],
  removedPositions: []
});
assert.deepEqual(planCountdownCapacityChange(11, -5), {
  allowed: true,
  reason: "ok",
  current: 11,
  target: 6,
  createdPositions: [],
  removedPositions: [7, 8, 9, 10, 11]
});
assert.equal(planCountdownCapacityChange(11, -5, { dirtyPositions: [8] }).reason, "dirty");
assert.deepEqual(
  planCountdownCapacityChange(11, -5, { savedPositions: [9] }).blockedPositions,
  [9]
);
assert.equal(planCountdownCapacityChange(5, 5).reason, "invalid", "legacy five-clock capacity must migrate to six");

for (let week = firstWeekStart(); week <= lastWeekStart(); week = addDays(week, 7)) {
  const dates = weekDates(toISODate(week));
  assert.equal(dates.length, 7);
  assert.equal(parseISODate(dates[0]).getDay(), 1);
  assert.equal(parseISODate(dates[6]).getDay(), 0);
}

const homepageCards = [...homepage.matchAll(/<a class="category(?:\s[^"]*)?"/g)];
assert.equal(homepageCards.length, 55, "homepage must contain all 55 linked category cards");
const homepageCardHrefs = [...homepage.matchAll(/<a class="category(?:\s[^"]*)?" href="([^"]+)"/g)].map(([, href]) => href);
assert.equal(homepageCardHrefs[9], "schedule-system.html", "Schedule must be numbered card 10");
assert.equal(homepageCardHrefs[12], "flashcards.html", "Flashcards must be numbered card 13");
assert.equal(homepageCardHrefs[13], "parent-communication.html", "Parent Communication must be numbered card 14");
assert.equal(homepageCardHrefs[16], "listening-system.html", "Listening must be numbered card 17");
assert.deepEqual(
  homepageCardHrefs.slice(20, 29),
  [
    "phrasal-verb-system.html",
    "dse-paper3-analysis.html",
    "student-progress.html",
    "common-expression-speaking.html",
    "common-expression-written.html",
    "common-expression-rhetorical-speaking.html",
    "common-expression-rhetorical-writing.html",
    "common-expression-professional-message.html",
    "common-expression-business-speaking.html"
  ],
  "cards 21-29 must keep Phrasal Verbs, DSE Paper 3, Student Progress and the six Common Expression portals in order"
);
assert.match(
  homepage,
  /class="category dse-paper3-analysis-card" href="dse-paper3-analysis\.html"[\s\S]*?<span class="category-name">DSE 卷3<br>綜合能力分析<\/span>/,
  "DSE Paper 3 Analysis must use the requested two-line homepage title"
);
assert.match(homepage, /schedule-system-card/);
assert.match(homepage, /href="schedule-system\.html"/);
assert.match(homepage, /功課及溫習安排系統/);
assert.match(
  homepage,
  /href="model-essay-downloads\.html"[\s\S]*?<span class="category-name">學生使用<br>DSE \/ IELTS<br>教材及範文<br>下載區<\/span>/,
  "model-essay homepage card must use the requested four lines"
);
assert.match(
  homepage,
  /href="schedule-system\.html"[\s\S]*?<span class="category-name"><span class="schedule-card-first-line">\(學生使用\) 功課及溫習<\/span><br>安排系統<\/span>/,
  "schedule homepage card must use the requested two lines"
);
assert.match(
  homepage,
  /class="category writing-submission-card" href="writing-submission\.html"[\s\S]*?<span class="writing-submission-scroll" aria-hidden="true"><\/span>[\s\S]*?<span class="writing-submission-quill" aria-hidden="true"><\/span>[\s\S]*?<span class="writing-submission-seal" aria-hidden="true">E<\/span>[\s\S]*?<span class="category-name">\(學生使用\)<br>Edmund Sir<br>Writing 交文系統<\/span>/,
  "Writing Submission card must use the requested three-line label and original parchment decorations"
);

assert.match(modelEssayHtml, /assets\/model-essays\/essay-cover\.webp/);
assert.match(modelEssayHtml, /assets\/model-essays\/mascot-reading-essays\.webp/);
assert.match(
  modelEssayHtml,
  /login-cover-art[^>]*essay-cover\.webp[\s\S]*?<p class="eyebrow">EDMUND STUDENT LIBRARY/,
  "essay cover must appear above the download-site heading"
);
assert.match(
  modelEssayHtml,
  /login-reading-mascot[^>]*mascot-reading-essays\.webp[\s\S]*?<h2>學生 \/ 管理員登入/,
  "reading mascot must appear above the login credentials"
);

assert.match(scheduleHtml, /Background%20for%20Schedule%20System\.jpg/);
assert.match(scheduleHtml, /opacity:\s*\.5/);
assert.match(scheduleHtml, /grid-template-columns:\s*repeat\(7/);
assert.match(scheduleHtml, /匯出 \/ 列印 PDF/);
assert.match(scheduleHtml, /刪除後無法復原/);
assert.match(scheduleHtml, /按 Enter 儲存/);
assert.match(scheduleHtml, /@media print/);
assert.match(scheduleHtml, /data-print-grid/);
assert.doesNotMatch(scheduleHtml, /data-print-head|data-print-body/);
assert.match(
  scheduleHtml,
  /\.calendar-panel\.glass-card\s*\{[^}]*background:\s*rgba\(\s*255\s*,\s*252\s*,\s*245\s*,\s*\.05\s*\)[^}]*backdrop-filter:\s*none/s,
  "calendar panel must use the requested 5% opaque background without blur"
);
assert.match(
  scheduleHtml,
  /\.day-column\s*\{[^}]*background:\s*rgba\(\s*255\s*,\s*253\s*,\s*248\s*,\s*\.8\s*\)/s,
  "weekday columns must use the requested 80% alpha"
);
assert.match(
  scheduleHtml,
  /\.day-column\.is-weekend\s*\{[^}]*background:\s*rgba\(\s*249\s*,\s*243\s*,\s*234\s*,\s*\.8\s*\)/s,
  "weekend columns must use the requested 80% alpha"
);
assert.match(scheduleHtml, /\.day-header\s*\{[^}]*position:\s*(?:relative|static)\s*;/s);
assert.doesNotMatch(scheduleHtml, /\.day-header\s*\{[^}]*position:\s*sticky\b/s);
assert.match(scheduleHtml, /\.legend-badge,\s*\.entry-source\s*\{[^}]*font-size:\s*13\.2px/s);
assert.match(scheduleHtml, /#schedule-export-help\s*\{[^}]*background:\s*rgba\([^)]*,\s*\.9\)/s);
assert.match(scheduleHtml, /\.entry-message\s*\{[^}]*font-size:\s*17px/s);
assert.match(scheduleHtml, /data-toggle-table/);
assert.match(scheduleHtml, /aria-controls="schedule-table-region"/);
assert.match(scheduleHtml, /data-toggle-unused/);
assert.match(scheduleHtml, /data-toggle-unused[^>]*aria-pressed="false"/);
assert.match(scheduleHtml, /data-toggle-mascots/);
assert.match(scheduleHtml, /data-toggle-mascots[^>]*aria-controls="schedule-week-grid"[^>]*aria-pressed="false"/);
assert.match(scheduleHtml, /\.week-grid\.mascots-hidden \.day-header\s*\{[^}]*min-height:\s*78px[^}]*padding:\s*18px/s);
assert.match(scheduleHtml, /\.week-grid\.mascots-hidden \.day-mascot\s*\{[^}]*display:\s*none/s);
assert.match(scheduleHtml, /remove-slots-button/);
assert.match(scheduleHtml, /－5 格/);
assert.match(scheduleHtml, /data-toggle-complete/);
assert.match(scheduleHtml, /\.schedule-slot\.has-entry\.is-completed/);
assert.match(scheduleHtml, /\.completion-badge/);
assert.match(scheduleHtml, />標記完成</);
assert.match(scheduleHtml, /data-toggle-progress/);
assert.match(scheduleHtml, />標記進行中</);
assert.match(scheduleHtml, /data-toggle-previous-incomplete/);
assert.match(scheduleHtml, />標記之前功課未完成</);
assert.match(scheduleHtml, /\.previous-incomplete-badge/);
assert.match(scheduleHtml, /schedule-estimated-minutes/);
assert.match(scheduleHtml, /預計需時/);
assert.match(scheduleHtml, /重大事件倒數/);
assert.match(scheduleHtml, /data-countdown-grid/);
assert.match(scheduleHtml, /data-homework-type-total/);
assert.match(scheduleHtml, /data-homework-type-pie[^>]*role="img"/);
assert.match(scheduleHtml, /data-homework-type-legend/);
assert.ok(
  scheduleHtml.indexOf("data-homework-type-pie") < scheduleHtml.indexOf("data-countdown-grid"),
  "homework-type dashboard should appear above the major-events countdown"
);
assert.match(scheduleHtml, /dialog\[data-entry-dialog\]\s*\{[^}]*height:\s*min\(760px,\s*calc\(100dvh - 28px\)\)[^}]*overflow:\s*hidden/s);
assert.match(scheduleHtml, /dialog\[data-entry-dialog\] \.dialog-card\s*\{[^}]*height:\s*100%[^}]*overflow-y:\s*auto/s);
assert.match(scheduleHtml, /\.homework-picker-results\s*\{[^}]*height:\s*min\(244px,\s*30dvh\)[^}]*overflow:\s*auto/s);
assert.match(scheduleHtml, /data-add-countdowns/);
assert.match(scheduleHtml, /data-remove-countdowns/);
assert.match(scheduleHtml, />增加 5 個倒數鐘</);
assert.match(scheduleHtml, />減少 5 個倒數鐘</);
assert.match(scheduleHtml, /按住 Shift 再拖到相鄰日期即可延伸/);
assert.match(scheduleHtml, /\.schedule-slot\.has-entry\.is-in-progress/);
assert.match(scheduleHtml, /\.schedule-slot\.has-entry\.is-more-than-half-completed/);
assert.match(scheduleHtml, /\.more-than-half-completed-badge\s*\{[^}]*#ffe05a/i);
assert.match(scheduleHtml, /\.schedule-slot\.is-touch-action/);
assert.match(scheduleHtml, /\.schedule-slot\.is-span-project/);
assert.match(scheduleHtml, /\.schedule-slot\.is-span-project\.span-start\s*\{[^}]*width:\s*var\(--span-project-width/s);
assert.match(scheduleHtml, /\.schedule-slot\.is-span-project\.span-continuation\s*\{[^}]*visibility:\s*hidden[^}]*pointer-events:\s*none/s);
assert.doesNotMatch(scheduleHtml, /span-continues-right/, "multi-day projects must render as one continuous rectangle");
assert.match(scheduleHtml, /\.span-lane-placeholder\s*\{[^}]*height:\s*142px/s);
assert.match(scheduleHtml, /@media\s*\(pointer:\s*coarse\)[\s\S]*?\.schedule-slot\.has-entry\.can-touch-drag\s*\{[^}]*touch-action:\s*none/s);
assert.match(scheduleHtml, /\.span-drop-zone\s*\{/);
assert.match(scheduleHtml, /data-toggle-selection[^>]*aria-pressed="false"/);
assert.match(scheduleHtml, />選取多項</);
assert.match(scheduleHtml, /data-selection-actions/);
assert.match(scheduleHtml, /data-batch-complete/);
assert.match(scheduleHtml, /data-batch-more-than-half-completed/);
assert.match(scheduleHtml, />標記已完成超過一半</);
assert.match(scheduleHtml, /data-move-selected/);
assert.match(scheduleHtml, /data-batch-delete/);
assert.match(scheduleHtml, /data-cancel-selection/);
assert.match(scheduleHtml, /assets\/schedule\/mascot-timetable-planning\.webp/);
assert.match(scheduleHtml, /assets\/schedule\/day-week-post-it\.webp/);
assert.match(scheduleHtml, /\.day-mascot\b/);
assert.match(scheduleHtml, /\.unused-day-note\s*\{[^}]*white-space:\s*pre-line/s);
assert.match(scheduleHtml, /\.print-entry-admin\s*\{[^}]*#f4dfc2/i);
assert.match(scheduleHtml, /\.print-entry-student\s*\{[^}]*#dfe9ff/i);
assert.match(scheduleHtml, /\.print-entry-more-than-half-completed\s*\{[^}]*#ffe36f/i);
assert.match(scheduleHtml, /data-toggle-countdown-collapse|countdown-collapse-toggle/);
assert.match(scheduleHtml, /data-toggle-mass-edit[^>]*aria-pressed="false"/);
assert.match(scheduleHtml, />批量編輯（Mass Edit）</);
assert.match(scheduleHtml, /1 選取／框選 → 2 複製所選 → 3 切換學生 → 4 貼上 → 5 一次儲存全部/);
assert.match(scheduleHtml, /data-mass-edit-actions/);
assert.match(scheduleHtml, /data-save-mass-edit/);
assert.match(scheduleHtml, /data-cancel-mass-edit/);
assert.match(scheduleHtml, />一次儲存全部</);
assert.match(scheduleHtml, /\.schedule-slot\.has-entry\.is-mass-edit-draft/);
assert.match(scheduleHtml, /\.draft-badge/);
assert.match(scheduleHtml, /data-toggle-clipboard-selection[^>]*aria-pressed="false"/);
assert.match(scheduleHtml, /data-copy-clipboard-selection/);
assert.match(scheduleHtml, /data-paste-clipboard-selection/);
assert.match(scheduleHtml, /data-clear-clipboard-selection/);
assert.match(scheduleHtml, /clipboard-selection-marquee/);
assert.match(scheduleHtml, /\.schedule-slot\.is-clipboard-selected/);
assert.match(scheduleHtml, /schedule-system\.js\?v=20260821-shared-pomodoro1/);
assert.match(scheduleHtml, /data-copy-week-link/);
assert.match(scheduleHtml, /\[data-student-list\]\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
assert.match(scheduleHtml, /@media\s*\(max-width:\s*980px\)[\s\S]*?\[data-student-list\]\s*\{[^}]*repeat\(2,/s);
assert.match(scheduleHtml, /@media\s*\(max-width:\s*680px\)[\s\S]*?\[data-student-list\]\s*\{[^}]*minmax\(0,\s*1fr\)/s);

const metricCards = [...scheduleHtml.matchAll(/<article\s+class="metric-card(?:\s[^"]*)?"/g)];
assert.equal(metricCards.length, 4, "schedule progress dashboard must contain exactly four metric cards");
for (const metric of [
  "week-goals",
  "total-goals",
  "week-completed",
  "total-completed"
]) {
  assert.match(scheduleHtml, new RegExp(`data-metric-${metric}\\b`), `missing ${metric} metric card`);
}

assert.match(scheduleJs, /Math\.max\(10/);
assert.match(scheduleJs, /＋5 格/);
assert.match(scheduleJs, /window\.print\(\)/);
assert.match(scheduleJs, /flashcard_student_login/);
assert.match(scheduleJs, /schedule_admin_get_week/);
assert.match(scheduleJs, /schedule_student_upsert_entry/);
assert.match(scheduleJs, /more_than_half_completed:\s*\{\s*property:\s*"isMoreThanHalfCompleted"/);
assert.match(scheduleJs, /toggleEntryMoreThanHalfCompleted/);
assert.match(scheduleJs, /print-entry-more-than-half-completed/);
assert.match(scheduleJs, /p_expected_updated_at/);
assert.match(scheduleJs, /restoreCalendarFocus/);
assert.match(scheduleJs, /state\.tableHidden/);
assert.match(scheduleJs, /state\.hideUnused/);
assert.match(scheduleJs, /state\.hideMascots/);
assert.match(scheduleJs, /state\.showUnusedTemporarily/);
assert.match(scheduleJs, /displayPreferenceRequestId/);
assert.match(scheduleJs, /function displayPreferenceOwner\(/);
assert.match(scheduleJs, /const isCurrentRequest = \(\) =>/);
assert.match(scheduleJs, /if \(!isCurrentRequest\(\)\) return;/);
assert.match(scheduleJs, /if \(isCurrentRequest\(\)\) setMutationInFlight\(false\)/);
assert.match(scheduleJs, /function toggleTableVisibility\(/);
assert.match(scheduleJs, /function toggleUnusedSlots\(/);
assert.match(scheduleJs, /function toggleMascots\(/);
assert.match(scheduleJs, /function unusedSlotsAreHidden\(/);
assert.match(scheduleJs, /schedule_student_set_display_preferences/);
assert.match(scheduleJs, /schedule_admin_set_display_preferences/);
assert.match(scheduleJs, /payload\.displayPreferences/);
assert.match(scheduleJs, /function renderMetrics\(/);
assert.match(scheduleJs, /capacityVersions/);
assert.match(scheduleJs, /if\s*\(hideUnusedNow\s*&&\s*!focusLimited\s*&&\s*!entry\)\s*continue/);
assert.doesNotMatch(scheduleJs, /UNUSED_HIDDEN_KEY|edmund-schedule-unused-hidden-v1/);
assert.doesNotMatch(scheduleJs, /saveDisplayPreference\([^\n]*hideUnused/);
assert.match(scheduleJs, /unused-day-note/);
assert.match(scheduleJs, /data\.removeSlotsDate|dataset\.removeSlotsDate/);
assert.match(scheduleJs, /schedule_admin_change_capacity/);
assert.match(scheduleJs, /schedule_student_change_capacity/);
assert.match(scheduleJs, /schedule_admin_set_entry_completed/);
assert.match(scheduleJs, /schedule_student_set_entry_completed/);
assert.match(scheduleJs, /p_expected_version/);
assert.match(scheduleJs, /p_delta/);
assert.match(scheduleJs, /classList\.add\("is-completed"\)/);
assert.match(scheduleJs, /completion-badge/);
assert.match(scheduleJs, /textContent\s*=\s*"已完成"/);
assert.match(scheduleJs, /elements\.toggleTable\.addEventListener\(/);
assert.match(scheduleJs, /elements\.toggleUnused\.addEventListener\(/);
assert.match(scheduleJs, /elements\.toggleComplete\.addEventListener\(/);
assert.match(scheduleJs, /changeCapacity\([^,]+,\s*-5\s*,/);
assert.doesNotMatch(scheduleJs, /\baddSlots\(/, "legacy addSlots handler must be replaced by versioned capacity changes");
assert.match(scheduleJs, /本日未有安排；\\n未使用格已隱藏。/);
assert.match(scheduleJs, /WEEKDAY_MASCOTS/);
for (const mascot of [
  "monday-walking-to-school",
  "tuesday-basketball",
  "wednesday-piano",
  "thursday-reading",
  "friday-pizza",
  "saturday-sleeping",
  "sunday-side-sleeping"
]) {
  assert.match(scheduleJs, new RegExp(`${mascot}\\.webp`));
}
assert.match(scheduleJs, /selectedEntryIds:\s*new Set\(\)/);
assert.match(scheduleJs, /function batchSetCompletion\(/);
assert.match(scheduleJs, /function batchDeleteEntries\(/);
assert.match(scheduleJs, /function beginMoveSelected\(/);
assert.match(scheduleJs, /function moveEntryTo\(/);
assert.match(scheduleJs, /function extendEntryToDay\(/);
assert.match(scheduleJs, /spanLaneLayout\(state\.weekPayload\.entries, dates\)/);
assert.match(scheduleJs, /span-lane-placeholder/);
assert.match(scheduleJs, /dataSpanDropDate|spanDropDate|data-span-drop-date/);
assert.match(scheduleJs, /LONG_PRESS_MS\s*=\s*2000/);
assert.match(scheduleJs, /addEventListener\("pointerdown"/);
assert.match(scheduleJs, /addEventListener\("pointermove"/);
assert.match(scheduleJs, /setPointerCapture\(event\.pointerId\)/);
assert.match(
  scheduleJs,
  /weekGrid\.addEventListener\("click",[\s\S]*?Date\.now\(\) < state\.suppressClickUntil[\s\S]*?const slot[\s\S]*?if \(state\.touchActionEntryId\)/,
  "the synthesized click after a two-second long press must be consumed before touch action-mode handling"
);
assert.match(scheduleJs, /isAdjacentSpanTarget/);
assert.match(scheduleJs, /is-swap-target/);
assert.match(scheduleJs, /schedule_student_extend_entry_span/);
assert.match(scheduleJs, /schedule_admin_extend_entry_span/);
assert.match(scheduleJs, /const shiftExtension = event\.shiftKey/);
assert.doesNotMatch(scheduleJs, /shiftExtensionMode/, "Shift extension mode must follow each DragEvent instead of becoming sticky");
assert.match(scheduleJs, /extendEntryToDay\(entry, column\.dataset\.columnDate, \{ adjacentOnly: true \}\)/);
assert.match(scheduleJs, /--span-project-width/);
assert.match(scheduleJs, /bounds\.length \* 100/);
assert.match(scheduleJs, /classList\.add\("span-continuation"\)/);
assert.match(scheduleJs, /schedule_student_set_entry_in_progress/);
assert.match(scheduleJs, /schedule_admin_set_entry_in_progress/);
assert.match(scheduleJs, /p_estimated_minutes/);
assert.match(scheduleJs, /function renderCountdowns\(/);
assert.match(scheduleJs, /function updateCountdownCard\(/);
assert.match(scheduleJs, /countdownBreakdownFromHongKongNow\(end, now\)/);
assert.match(scheduleJs, /studyHoursFromHongKongNow\(end, daily\.value, now\)/);
assert.doesNotMatch(
  scheduleJs.match(/function updateCountdownCard\([^)]*\)\s*\{([\s\S]*?)\n\}/)?.[1] || "",
  /data-countdown-start|studyHoursBefore|countdownBreakdown\(start/,
  "live countdown and study projections must not use the saved original start date"
);
assert.match(scheduleJs, /window\.setInterval\(refreshCountdownCards,\s*60_000\)/);
assert.match(scheduleJs, /document\.addEventListener\("visibilitychange"/);
assert.match(scheduleJs, /start\.min\s*=\s*SCHEDULE_MIN_DATE/);
assert.match(scheduleJs, /start\.max\s*=\s*SCHEDULE_MAX_DATE/);
assert.match(scheduleJs, /end\.min\s*=\s*SCHEDULE_MIN_DATE/);
assert.match(scheduleJs, /end\.max\s*=\s*SCHEDULE_MAX_DATE/);
assert.match(scheduleJs, /values\.endDate < values\.startDate/);
assert.match(scheduleJs, /schedule_student_upsert_countdown/);
assert.match(scheduleJs, /schedule_admin_upsert_countdown/);
assert.match(scheduleJs, /addEventListener\("dragstart"/);
assert.match(scheduleJs, /addEventListener\("drop"/);
assert.match(scheduleJs, /state\.currentUser\?\.role === "student" && entry\.source === "admin"/);
assert.match(scheduleJs, /p_source_capacity_version/);
assert.match(scheduleJs, /p_target_capacity_version/);
assert.match(scheduleJs, /p_target_expected_updated_at:\s*targetEntry\?\.updatedAt\s*\|\|\s*null/);
assert.match(scheduleJs, /schedule_student_move_entry_checked/);
assert.match(scheduleJs, /schedule_admin_move_entry_checked/);
assert.match(scheduleJs, /countdownDrafts:\s*new Map\(\)/);
assert.match(scheduleJs, /countdownCollapsedPositions:\s*new Set\(\)/);
assert.match(scheduleJs, /COUNTDOWN_COLLAPSED_KEY/);
assert.match(scheduleJs, /function setCountdownCardCollapsed\(/);
assert.match(scheduleJs, /localStorage\.setItem\([\s\S]*?countdownCollapseStorageKey/s);
assert.match(scheduleJs, /function captureCountdownDrafts\(/);
assert.match(scheduleJs, /planCountdownCapacityChange\(current, delta/);
assert.match(scheduleJs, /schedule_student_change_countdown_capacity_checked/);
assert.match(scheduleJs, /schedule_admin_change_countdown_capacity_checked/);
assert.match(scheduleJs, /const dayEntries = state\.weekPayload\.entries/);
assert.doesNotMatch(scheduleJs, /const maxSlots =/, "print rendering must not recreate unused slot rows");
assert.doesNotMatch(scheduleJs, /elements\.printHead|elements\.printBody/);
assert.match(scheduleJs, /massEditChanges:\s*new Map\(\)/);
assert.match(scheduleJs, /function beginMassEdit\(/);
assert.match(scheduleJs, /function rebuildMassEditPreview\(/);
assert.match(scheduleJs, /function queueMassEditUpsert\(/);
assert.match(scheduleJs, /function queueMassEditDelete\(/);
assert.match(scheduleJs, /async function saveMassEdit\(/);
assert.match(scheduleJs, /schedule_student_apply_entry_batch/);
assert.match(scheduleJs, /schedule_admin_apply_entry_batch/);
assert.match(scheduleJs, /window\.addEventListener\("beforeunload"/);
assert.match(scheduleJs, /schedule-clipboard\.mjs\?v=20260727-1/);
assert.match(scheduleJs, /HOMEWORK_CATALOG_URL = "\.\/homework-resource-catalog\.mjs\?v=20260820-1"/);
assert.match(scheduleJs, /homeworkCatalogPromise = Promise\.all\(\[\s*import\(HOMEWORK_CATALOG_URL\),\s*loadVideoClassHomeworkResources\(\)/);
assert.match(scheduleJs, /function mergeHomeworkCatalog\([\s\S]*?startsWith\("video-class-"\)[\s\S]*?\(videoClassResources \|\| \[\]\)\.forEach/);
assert.match(scheduleJs, /if \(retryVideoClass \|\| refreshManualWriting\) \{[\s\S]*?retryVideoClass \? loadVideoClassHomeworkResources\(\)[\s\S]*?mergeHomeworkCatalog/);
assert.doesNotMatch(scheduleJs, /^import\s+\{\s*HOMEWORK_RESOURCE_CATALOG\s*\}/m, "the large exercise catalogue must not block login or Supabase startup");
assert.match(scheduleJs, /schedule-homework-links\.mjs\?v=20260820-email-hotkey1/);
assert.match(scheduleJs, /schedule-mass-edit\.mjs\?v=20260803-1/);
assert.match(scheduleJs, /insertHomeworkResourceTitle\(/);
assert.match(scheduleJs, /function renderHomeworkTypeDashboard\(/);
assert.match(scheduleJs, /conic-gradient/);
assert.match(scheduleJs, /clipboardSelectedEntryIds:\s*new Set\(\)/);
assert.match(scheduleJs, /function beginClipboardMarquee\(/);
assert.match(scheduleJs, /function updateClipboardMarquee\(/);
assert.match(scheduleJs, /function stageScheduleClipboardPaste\(/);
assert.match(scheduleJs, /document\.addEventListener\("copy", handleScheduleCopy\)/);
assert.match(scheduleJs, /document\.addEventListener\("paste", handleSchedulePaste\)/);
assert.match(scheduleJs, /if \(state\.massEditMode\) toggleClipboardSelectionMode\(\)/, "the prominent selection button must become clipboard selection during Mass Edit");
assert.match(scheduleJs, /!state\.massEditMode[\s\S]*?event\.pointerType !== "mouse"/, "mouse marquee selection must start directly in Mass Edit without a hidden prerequisite toggle");
assert.doesNotMatch(scheduleJs.match(/function beginClipboardMarquee[\s\S]*?\n\}/)?.[0] || "", /!state\.clipboardSelectionMode/, "direct mouse marquee must not require selecting a second mode first");
assert.match(scheduleJs, /commandKey[\s\S]*?shortcut === "c"[\s\S]*?copyClipboardSelectionFromButton\(\)[\s\S]*?shortcut === "v"[\s\S]*?pasteScheduleClipboardFromButton\(\)/, "Cmd\/Ctrl+C and V must have an explicit PWA-safe fallback");
assert.match(scheduleJs, /let payload = readStoredScheduleClipboardPayload\(\);[\s\S]*?!payload && navigator\.clipboard\?\.readText/, "Paste must use the reliable same-tab buffer before the permission-sensitive OS clipboard");
assert.match(scheduleJs, /function handleSchedulePaste[\s\S]*?let payload = readStoredScheduleClipboardPayload\(\);[\s\S]*?if \(!payload\) \{[\s\S]*?event\.clipboardData/, "context-menu and ClipboardEvent paste must also prefer the same-tab buffer");
assert.match(scheduleJs, /function handleScheduleCopy[\s\S]*?storeScheduleClipboardPayload\(payload\);\s*updateClipboardControls\(\);/, "native Cmd\/Ctrl+C must immediately reveal the buffered item count in the Paste button");
assert.match(scheduleJs, /shortcut === "v" && readStoredScheduleClipboardPayload\(\)/, "keyboard paste must leave the browser ClipboardEvent available when no same-tab payload exists");
assert.match(scheduleJs, /if \(state\.scheduleClipboardPayload\) return state\.scheduleClipboardPayload/, "marquee control updates must reuse the parsed payload rather than repeatedly parsing session storage");
assert.match(scheduleHtml, /@supabase\/supabase-js@2\.110\.8\/dist\/umd\/supabase\.js/, "Schedule must use a pinned, cacheable Supabase client build");
assert.match(scheduleJs, /let supabaseAuthPromise = null/);
assert.match(scheduleJs, /scheduleWeekStartFromUrl\(window\.location\.href, defaultWeekStart\(\)\)/);
assert.match(scheduleJs, /function syncDisplayedWeekUrl\(/);
assert.match(scheduleJs, /scheduleWeekShareMessage\(displayedWeekUrl\(\)\)/);
assert.match(scheduleJs, /navigator\.clipboard\?\.writeText/);
assert.match(scheduleJs, /document\.execCommand\("copy"\)/);
assert.match(scheduleJs, /window\.prompt\("請複製以下訊息：", text\)/);
assert.match(scheduleJs, /if \(!supabaseAuthPromise\)[\s\S]*?supabaseAuthPromise = \(async \(\) =>/, "Supabase anonymous authentication must be shared instead of repeated before every RPC");
const restoreSessionBody = scheduleJs.match(/async function restoreSession\(\)\s*\{([\s\S]*?)\n\}\n\nasync function login/)?.[1] || "";
assert.doesNotMatch(restoreSessionBody, /schedule_admin_me|schedule_student_profile/, "restoring a saved session must let the first useful list\/week RPC validate the token instead of making a duplicate validation request");
assert.match(scheduleJs, /sessionStorage\.setItem\(SCHEDULE_CLIPBOARD_SESSION_KEY/);
assert.match(scheduleJs, /clearStoredScheduleClipboard\(\);[\s\S]*?forgetStudentSession/);
assert.match(scheduleJs, /system will not|系統不會移動或覆蓋任何現有安排/);
const openStudentScheduleBody = scheduleJs.match(
  /async function openStudentSchedule\([^)]*\)\s*\{([\s\S]*?)\n\}\n\nfunction activeStudent/
)?.[1] || "";
assert.doesNotMatch(
  openStudentScheduleBody,
  /state\.weekStart\s*=\s*defaultWeekStart\(\)/,
  "switching admin students must preserve the displayed week for exact weekday clipboard mapping"
);
assert.match(
  scheduleJs,
  /weekIsLoading[\s\S]*?elements\.toggleMassEdit\.disabled[\s\S]*?childElementCount === 0/,
  "Mass Edit must stay unavailable until a complete week baseline has rendered"
);
assert.match(
  scheduleJs,
  /const source = originalEntry\?\.source[\s\S]*?state\.currentUser\?\.role === "admin"/,
  "editing an existing task must preserve its student or teacher ownership"
);
assert.match(
  scheduleJs,
  /if \(isConcurrencyError\(error\)\)[\s\S]*?您的草稿仍保留/s,
  "a concurrent Mass Edit conflict must keep the local draft visible"
);
assert.match(
  scheduleJs,
  /leaveMassEdit\(\{ restoreOriginal: false \}\);[\s\S]*?await loadWeek\(\);/s,
  "a successful Mass Edit must leave draft mode and reload the week once"
);
const massEditSaveBody = scheduleJs.match(
  /async function saveMassEdit\(\)\s*\{([\s\S]*?)\n\}\n\nfunction openEntryDialog/
)?.[1] || "";
assert.equal(
  (massEditSaveBody.match(/await callRpc\(/g) || []).length,
  2,
  "Mass Edit save should contain one role-specific RPC per branch, not a per-slot RPC loop"
);
assert.doesNotMatch(
  massEditSaveBody,
  /schedule_(?:student|admin)_(?:upsert|delete)_entry/,
  "Mass Edit must use the atomic batch RPC instead of sequential slot mutations"
);

const rpcNames = [
  "schedule_admin_login",
  "schedule_admin_me",
  "schedule_admin_logout",
  "schedule_admin_list_students",
  "schedule_admin_get_week",
  "schedule_admin_upsert_entry",
  "schedule_admin_delete_entry",
  "schedule_admin_change_capacity",
  "schedule_admin_set_entry_completed",
  "schedule_admin_batch_delete_entries",
  "schedule_admin_batch_set_entries_completed",
  "schedule_admin_move_entry",
  "schedule_admin_move_entry_checked",
  "schedule_admin_set_entry_in_progress",
  "schedule_admin_set_entry_previous_incomplete",
  "schedule_admin_extend_entry_span",
  "schedule_admin_upsert_countdown",
  "schedule_admin_delete_countdown",
  "schedule_admin_change_countdown_capacity",
  "schedule_admin_change_countdown_capacity_checked",
  "schedule_admin_apply_entry_batch",
  "schedule_admin_set_display_preferences",
  "schedule_student_profile",
  "schedule_student_logout",
  "schedule_student_get_week",
  "schedule_student_upsert_entry",
  "schedule_student_delete_entry",
  "schedule_student_change_capacity",
  "schedule_student_set_entry_completed",
  "schedule_student_batch_delete_entries",
  "schedule_student_batch_set_entries_completed",
  "schedule_student_move_entry",
  "schedule_student_move_entry_checked",
  "schedule_student_set_entry_in_progress",
  "schedule_student_set_entry_previous_incomplete",
  "schedule_student_extend_entry_span",
  "schedule_student_upsert_countdown",
  "schedule_student_delete_countdown",
  "schedule_student_change_countdown_capacity",
  "schedule_student_change_countdown_capacity_checked",
  "schedule_student_apply_entry_batch",
  "schedule_student_set_display_preferences"
];
for (const name of rpcNames) {
  assert.match(scheduleSql, new RegExp(`function public\\.${name}\\b`), `missing SQL RPC ${name}`);
  if (name !== "schedule_admin_login") {
    assert.match(scheduleSql, new RegExp(`grant execute on function public\\.${name}\\b`));
  }
}

assert.match(scheduleSql, /references public\.flashcard_students\(id\)/);
assert.match(scheduleSql, /flashcard_session_student_id\(p_token\)/);
assert.match(scheduleSql, /enable row level security/g);
assert.match(scheduleSql, /revoke all on table public\.schedule_entries/);
assert.match(scheduleSql, /schedule_date between date '2026-01-01' and date '2050-12-31'/);
assert.match(scheduleSql, /slot_count between 10 and 100/);
assert.match(scheduleSql, /for update/);
assert.match(scheduleSql, /create or replace function public\._schedule_lock_student_mutations\b/);
assert.match(scheduleSql, /pg_advisory_xact_lock\([\s\S]*?hashtextextended\('edmund-schedule:'/);
assert.ok(
  (scheduleSql.match(/perform public\._schedule_lock_student_mutations\(p_student_id\)/g) || []).length >= 10,
  "all schedule mutation families must acquire the per-student advisory lock"
);
assert.match(scheduleSql, /version bigint not null default 0/);
assert.match(scheduleSql, /add column if not exists version bigint not null default 0/);
assert.match(scheduleSql, /is_completed boolean not null default false/);
assert.match(scheduleSql, /completed_at timestamptz/);
assert.match(scheduleSql, /completion_source text/);
assert.match(scheduleSql, /completed_by_admin uuid/);
assert.match(scheduleSql, /schedule_entries_completed_by_admin_fkey[\s\S]*?on delete restrict/);
assert.match(scheduleSql, /'isCompleted',\s*entry\.is_completed/);
assert.match(scheduleSql, /'completedAt',\s*entry\.completed_at/);
assert.match(scheduleSql, /'completionSource',\s*entry\.completion_source/);
assert.match(scheduleSql, /'metrics',\s*pg_catalog\.jsonb_build_object/);
assert.match(scheduleSql, /'weekGoals'/);
assert.match(scheduleSql, /'totalGoals'/);
assert.match(scheduleSql, /'weekCompleted'/);
assert.match(scheduleSql, /'totalCompleted'/);
assert.match(scheduleSql, /'capacityVersions'/);
assert.match(scheduleSql, /'displayPreferences'/);
assert.match(scheduleSql, /edmundStudentDisplayPreferences/);
assert.match(scheduleSql, /scheduleHideUnused/);
assert.match(scheduleSql, /scheduleHideMascots/);
assert.match(scheduleSql, /create or replace function public\._schedule_display_preferences\b/);
assert.match(scheduleSql, /create or replace function public\._schedule_set_display_preferences\b/);
assert.match(scheduleSql, /state\.value \|\| excluded\.value|existing\.value \|\| excluded\.value/);
assert.match(scheduleSql, /create or replace function public\._schedule_set_entry_completed\b/);
assert.match(scheduleSql, /set is_completed = p_completed/);
assert.match(
  scheduleSql,
  /create or replace function public\._schedule_set_entry_completed\b[\s\S]*?from public\.schedule_entries entry[\s\S]*?for update;[\s\S]*?set is_completed = p_completed/,
  "completion changes must lock the current entry before updating it"
);
assert.match(scheduleSql, /create or replace function public\._schedule_change_capacity\b/);
assert.match(scheduleSql, /p_delta is null or p_delta not in \(-5, 5\)/);
assert.match(scheduleSql, /p_expected_version is null or p_expected_version < 0/);
assert.match(scheduleSql, /v_capacity\.version <> p_expected_version/);
assert.match(scheduleSql, /entry\.slot_index > v_target/);
assert.match(scheduleSql, /version = capacity\.version \+ 1/);
assert.match(scheduleSql, /v_reopens_completion := v_existing\.message is distinct from v_message/);
assert.match(scheduleSql, /is_completed = case when v_reopens_completion then false else v_existing\.is_completed end/);
assert.match(
  scheduleSql,
  /create or replace function public\._schedule_upsert_entry\([\s\S]*?p_expected_updated_at timestamptz,[\s\S]*?if v_existing\.span_group_id is not null then[\s\S]*?entry\.span_group_id = v_existing\.span_group_id/s,
  "the legacy upsert path must propagate edits across every member of a span group"
);
assert.doesNotMatch(scheduleSql, /create or replace function public\.schedule_(?:student|admin)_add_slots\b/);
assert.match(
  scheduleSql,
  /create or replace function public\._schedule_change_capacity\b[\s\S]*?from public\.schedule_day_capacity capacity[\s\S]*?where capacity\.student_id = p_student_id[\s\S]*?for update;/,
  "capacity changes must lock the current day-capacity row"
);
assert.match(scheduleSql, /Schedule entry changed in another session/);
assert.match(scheduleSql, /Teacher assignments can only be changed by an administrator/);
assert.match(scheduleSql, /Teacher assignments can only be deleted by an administrator/);
assert.match(scheduleSql, /create or replace function public\._schedule_batch_delete_entries\b/);
assert.match(scheduleSql, /create or replace function public\._schedule_batch_set_entries_completed\b/);
assert.match(scheduleSql, /create or replace function public\._schedule_move_entry\b/);
assert.match(scheduleSql, /jsonb_array_length\(p_items\)/);
assert.match(scheduleSql, /expected_updated_at/);
assert.match(scheduleSql, /order by schedule_entry\.id[\s\S]*?for update/);
assert.match(scheduleSql, /Target slot is occupied/);
assert.match(scheduleSql, /is_in_progress boolean not null default false/);
assert.match(scheduleSql, /is_more_than_half_completed boolean not null default false/);
assert.match(scheduleSql, /is_previous_incomplete boolean not null default false/);
assert.match(scheduleSql, /estimated_minutes integer/);
assert.match(scheduleSql, /span_group_id uuid/);
assert.match(scheduleSql, /schedule_entries_progress_state_check/);
assert.match(scheduleSql, /create table if not exists public\.schedule_countdowns/);
assert.match(scheduleSql, /create table if not exists public\.schedule_countdown_capacity/);
assert.match(scheduleSql, /clock_count smallint not null default 6/);
assert.match(scheduleSql, /mod\(clock_count - 6, 5\) = 0/);
assert.match(scheduleSql, /where mod\(capacity\.clock_count, 5\) = 0/);
assert.match(scheduleSql, /set clock_count = least\(101, capacity\.clock_count \+ 1\)/);
assert.match(scheduleSql, /check \(position between 1 and 101\)/);
assert.match(scheduleSql, /start_date between date '2026-01-01' and date '2050-12-31'/);
assert.match(scheduleSql, /end_date between start_date and date '2050-12-31'/);
assert.match(scheduleSql, /create or replace function public\._schedule_set_entry_in_progress/);
assert.match(scheduleSql, /create or replace function public\._schedule_set_entry_previous_incomplete/);
assert.match(scheduleSql, /create or replace function public\._schedule_extend_entry_span/);
assert.match(scheduleSql, /p_target_date between v_start and v_end/);
assert.match(scheduleJs, /adjacentOnly && !isAdjacentSpanTarget/);
assert.match(scheduleSql, /v_common_slot/);
assert.match(scheduleSql, /create or replace function public\._schedule_upsert_countdown/);
assert.match(scheduleSql, /create or replace function public\._schedule_change_countdown_capacity/);
assert.match(scheduleSql, /'countdownCapacity'/);
assert.match(scheduleSql, /'countdowns'/);
assert.match(scheduleSql, /'estimatedMinutes'/);
assert.match(scheduleSql, /'spanGroupId'/);
assert.match(scheduleSql, /'isInProgress'/);
assert.match(scheduleSql, /'isMoreThanHalfCompleted'/);
assert.match(scheduleSql, /'isPreviousIncomplete'/);
assert.match(scheduleJs, /prepareMassEditWeekNavigation\(\)/);
assert.match(scheduleJs, /Mass Edit 保持開啟/);
assert.doesNotMatch(
  scheduleJs,
  /if \(state\.massEditMode\) \{\s*elements\.previousWeek\.disabled = true/,
  "week navigation controls must remain usable while Mass Edit is active"
);
assert.match(scheduleJs, /planCurrentMassEditGroupShift/);
assert.match(scheduleJs, /stageMassEditGroupShift/);
assert.match(scheduleSql, /create or replace function public\._schedule_homework_types\b/);
assert.match(scheduleSql, /pg_catalog\.regexp_matches\(/);
assert.match(scheduleSql, /pg_catalog\.decode\(v_encoded, 'base64'\)/);
assert.match(scheduleSql, /'homeworkTypeCounts'/);
for (const homeworkType of [
  "flashcards",
  "fill-blanks",
  "writing-submission",
  "idiom",
  "proverb",
  "phrasal-verb",
  "speaking",
  "sentence-structure",
  "reading-analysis"
]) {
  assert.match(scheduleSql, new RegExp(`'${homeworkType.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}'`));
}
assert.match(scheduleSql, /'swapped'/);
assert.match(scheduleSql, /create or replace function public\._schedule_move_entry_checked\b/);
assert.match(scheduleSql, /p_target_expected_updated_at timestamptz/);
assert.match(scheduleSql, /Swap target changed in another session/);
assert.match(scheduleSql, /create or replace function public\.schedule_student_move_entry\b/);
assert.match(scheduleSql, /create or replace function public\.schedule_student_move_entry_checked\b/);
assert.match(scheduleSql, /create or replace function public\._schedule_change_countdown_capacity_checked\b/);
assert.match(scheduleSql, /v_capacity\.clock_count <> p_expected_count/);
assert.match(scheduleSql, /create or replace function public\._schedule_apply_entry_batch\b/);
assert.match(scheduleSql, /Mass Edit contains duplicate schedule slots/);
assert.match(scheduleSql, /schedule_student_apply_entry_batch\(uuid, date, jsonb\) to authenticated/);
assert.match(scheduleSql, /schedule_admin_apply_entry_batch\(uuid, uuid, date, jsonb\) to authenticated/);
assert.match(massEditSql, /^begin;/m);
assert.match(massEditSql, /^commit;/m);
assert.match(massEditSql, /create or replace function public\._schedule_apply_entry_batch\b/);
assert.match(massEditSql, /perform public\._schedule_lock_student_mutations\(p_student_id\)/);
assert.match(massEditSql, /pg_catalog\.jsonb_array_length\(p_changes\) not between 1 and 700/);
assert.match(massEditSql, /Mass Edit contains duplicate schedule slots/);
assert.match(massEditSql, /isPreviousIncomplete/);
assert.match(massEditSql, /isMoreThanHalfCompleted/);
assert.match(massEditSql, /is_more_than_half_completed = v_is_more_than_half_completed/);
assert.match(massEditSql, /is_previous_incomplete = v_is_previous_incomplete/);
assert.match(massEditSql, /using errcode = '40001'/);
assert.match(massEditSql, /v_effective_source := coalesce\(v_requested_source, v_existing\.source\)/);
assert.match(massEditSql, /group_entry\.updated_at <> v_expected_updated_at/);
assert.match(massEditSql, /Teacher assignments can only be changed by an administrator[\s\S]*?errcode = '42501'/);
assert.match(massEditSql, /Teacher assignments can only be deleted by an administrator[\s\S]*?errcode = '42501'/);
assert.match(
  massEditSql,
  /revoke all on function public\._schedule_apply_entry_batch\(uuid, date, jsonb, text, uuid\)[\s\S]*?from public, anon, authenticated/
);
assert.match(
  massEditSql,
  /grant execute on function public\.schedule_student_apply_entry_batch\(uuid, date, jsonb\)\s+to authenticated/
);
assert.match(
  massEditSql,
  /grant execute on function public\.schedule_admin_apply_entry_batch\(uuid, uuid, date, jsonb\)\s+to authenticated/
);

assert.match(accountManagementSql, /more_than_half_completed/);
assert.match(accountManagementSql, /is_more_than_half_completed = p_status = 'more_than_half_completed'/);
assert.match(accountManagementSql, /'isMoreThanHalfCompleted',\s*entry\.is_more_than_half_completed/);
assert.match(moreThanHalfMigrationSql, /^begin;/m);
assert.match(moreThanHalfMigrationSql, /^commit;/m);
assert.match(moreThanHalfMigrationSql, /add column if not exists is_more_than_half_completed boolean not null default false/);
assert.match(moreThanHalfMigrationSql, /schedule_entries_exclusive_status_before_update/);
assert.match(moreThanHalfMigrationSql, /schedule_entries_inherit_span_status_before_insert/);
assert.match(moreThanHalfMigrationSql, /create or replace function public\._schedule_week_payload\b/);
assert.match(moreThanHalfMigrationSql, /create or replace function public\._schedule_move_entry\b/);
assert.match(moreThanHalfMigrationSql, /create or replace function public\._schedule_apply_entry_batch\b/);
assert.match(moreThanHalfMigrationSql, /create or replace function public\._schedule_batch_set_entry_status\b/);
assert.match(moreThanHalfMigrationSql, /notify pgrst, 'reload schema'/);
assert.match(databaseSmokeTest, /^begin;/m);
assert.match(databaseSmokeTest, /^rollback;/m);
assert.match(databaseSmokeTest, /_schedule_batch_set_entries_completed/);
assert.match(databaseSmokeTest, /_schedule_batch_delete_entries/);
assert.match(databaseSmokeTest, /_schedule_move_entry/);
assert.match(databaseSmokeTest, /_schedule_set_display_preferences/);
assert.match(databaseSmokeTest, /schedule_student_set_display_preferences/);
assert.match(databaseSmokeTest, /schedule_admin_set_display_preferences/);
assert.match(databaseSmokeTest, /flashcardHideLockedSections/);
assert.match(databaseSmokeTest, /schedule preference isolation/i);
assert.match(databaseSmokeTest, /Schedule enhancement database smoke test passed/);
assert.match(databaseSmokeTest, /Three-day project/);
assert.match(databaseSmokeTest, /Exact-slot swap/);
assert.match(databaseSmokeTest, /Legacy group-aware edit/);
assert.match(databaseSmokeTest, /Expected stale swap-target rejection/);
assert.match(databaseSmokeTest, /Expected stale countdown-capacity rejection/);
assert.match(databaseSmokeTest, /Expected invalid countdown-date rejection/);
assert.match(databaseSmokeTest, /Schedule Mass Edit database smoke test passed/);
assert.match(databaseSmokeTest, /current 10-key payload/i);
assert.match(databaseSmokeTest, /legacy six-key support/i);
assert.match(databaseSmokeTest, /Expected mutually-exclusive Mass Edit status rejection/);
assert.match(databaseSmokeTest, /Expected stale Mass Edit rejection/);
assert.match(databaseSmokeTest, /Stale Mass Edit was not atomic/);
assert.match(databaseSmokeTest, /Mass Edit transferred student-entry ownership/);
assert.match(databaseSmokeTest, /Protected Mass Edit rejection was not atomic/);
assert.match(databaseSmokeTest, /Expected protected Mass Edit delete rejection/);
assert.match(databaseSmokeTest, /Expected stale Mass Edit span rejection/);
assert.match(databaseSmokeTest, /Stale Mass Edit span overwrote another member change/);
assert.match(databaseSmokeTest, /when sqlstate '40001'/);
assert.match(databaseSmokeTest, /when sqlstate '42501'/);
assert.match(
  scheduleSql,
  /schedule_student_upsert_entry\(uuid, date, integer, text, timestamptz\) to authenticated/
);

assert.match(worker, /ADMIN_LOGIN_RATE_LIMITER/);
assert.match(worker, /SCHEDULE_SERVICE_SECRET/);
assert.match(worker, /Origin not allowed/);
assert.match(worker, /readLimitedText\(request, 4096\)/);

const background = await stat(new URL("assets/schedule/Background for Schedule System.jpg", root));
assert.ok(background.size > 100_000, "schedule background image must be present");

for (const asset of [
  "assets/model-essays/essay-cover.webp",
  "assets/model-essays/mascot-reading-essays.webp",
  "assets/schedule/mascot-timetable-planning.webp",
  "assets/schedule/day-week-post-it.webp",
  "assets/schedule/weekdays/monday-walking-to-school.webp",
  "assets/schedule/weekdays/tuesday-basketball.webp",
  "assets/schedule/weekdays/wednesday-piano.webp",
  "assets/schedule/weekdays/thursday-reading.webp",
  "assets/schedule/weekdays/friday-pizza.webp",
  "assets/schedule/weekdays/saturday-sleeping.webp",
  "assets/schedule/weekdays/sunday-side-sleeping.webp"
]) {
  const file = await stat(new URL(asset, root));
  assert.ok(file.size > 10_000, `${asset} must be a non-empty optimized image`);
}

console.log(`Schedule checks passed: ${supportedDays.toLocaleString()} supported dates, ${homepageCards.length} homepage cards, ${rpcNames.length} secured RPCs.`);
