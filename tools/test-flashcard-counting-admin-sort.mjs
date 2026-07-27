import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const siteDir = path.resolve(toolsDir, "..");
const source = readFileSync(path.join(siteDir, "flashcards.html"), "utf8");
const accountSql = readFileSync(path.join(siteDir, "supabase-flashcard-accounts.sql"), "utf8");
const orderingMigrationSql = readFileSync(path.join(siteDir, "supabase-flashcard-student-order.sql"), "utf8");

for (const [index, match] of [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].entries()) {
  if (match[1].trim()) new vm.Script(match[1], { filename: `flashcards-inline-${index}.js` });
}

function sourceBetween(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `Missing source marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `Missing source marker: ${endMarker}`);
  return source.slice(start, end);
}

const outcomeSource = sourceBetween(
  "function attemptOutcomeIdentity(",
  "function highAttemptGroupsForStudent("
);
const makeOutcomeHelpers = attempts => Function(
  "attempts",
  "normalizeCardText",
  `
    const currentUser = { name: "Student" };
    const attemptsForStudent = () => attempts;
    ${outcomeSource}
    return { finalAttemptOutcomeDetails, attemptProgressOutcome, progressRowsForStudent };
  `
)(attempts, value => String(value || ""));

const intraAttempt = {
  id: "rounds",
  studentName: "Student",
  answeredCount: 2,
  green: 1,
  red: 1,
  updatedAt: 100,
  cardOutcomes: [
    { key: "deck::0", index: 0, status: "red", answeredAt: 10 },
    { key: "deck::1", index: 1, status: "red", answeredAt: 15 },
    { key: "deck::0", index: 0, status: "green", answeredAt: 20 }
  ]
};
const intraResult = makeOutcomeHelpers([intraAttempt]).attemptProgressOutcome(intraAttempt);
assert.equal(intraResult.details.length, 2, "a card repeated in later rounds must count once within its attempt");
assert.deepEqual(
  { total: intraResult.total, green: intraResult.green, red: intraResult.red },
  { total: 2, green: 1, red: 1 },
  "the latest intra-attempt result must replace the earlier red result"
);
assert.equal(intraResult.details.find(item => item.key === "deck::0").status, "green");

const separateAttempts = [
  {
    id: "day-one",
    studentName: "Student",
    answeredCount: 1,
    green: 0,
    red: 1,
    updatedAt: 100,
    cardOutcomes: [{ key: "same-card", status: "red", answeredAt: 100 }]
  },
  {
    id: "day-two",
    studentName: "Student",
    answeredCount: 1,
    green: 1,
    red: 0,
    updatedAt: 200,
    cardOutcomes: [{ key: "same-card", status: "green", answeredAt: 200 }]
  }
];
const separateRows = makeOutcomeHelpers(separateAttempts).progressRowsForStudent("Student");
assert.equal(separateRows.length, 2, "the same card in separate attempts/dates must remain two progress rows");
assert.deepEqual(separateRows.map(row => row.time), [100, 200]);
assert.deepEqual(separateRows.map(row => [row.total, row.green, row.red]), [[1, 0, 1], [1, 1, 0]]);

const legacyAttempt = {
  id: "legacy",
  studentName: "Student",
  answeredCount: 4,
  green: 3,
  red: 1,
  updatedAt: 300,
  cardOutcomes: [{ key: "only-one-detail", status: "green", answeredAt: 300 }]
};
const mixedRows = makeOutcomeHelpers([...separateAttempts, legacyAttempt]).progressRowsForStudent("Student");
assert.equal(mixedRows.length, 3, "a legacy aggregate must survive alongside modern detailed attempts");
const legacyRow = mixedRows.find(row => row.attemptId === "legacy");
assert.ok(legacyRow, "legacy attempt row must remain present");
assert.deepEqual(
  { total: legacyRow.total, green: legacyRow.green, red: legacyRow.red, detailed: legacyRow.useDetailedOutcomes },
  { total: 4, green: 3, red: 1, detailed: false },
  "incomplete detailed history must not collapse a legacy aggregate"
);
assert.ok(mixedRows.every(row => row.total === row.green + row.red), "every progress row must add up");

const inconsistentLegacyAttempt = {
  id: "inconsistent-legacy",
  studentName: "Student",
  answeredCount: 2,
  green: 3,
  red: 1,
  updatedAt: 350,
  cardOutcomes: [
    { key: "one", status: "green", answeredAt: 340 },
    { key: "two", status: "red", answeredAt: 345 }
  ]
};
const inconsistentLegacyRow = makeOutcomeHelpers([inconsistentLegacyAttempt])
  .progressRowsForStudent("Student")[0];
assert.deepEqual(
  {
    total: inconsistentLegacyRow.total,
    green: inconsistentLegacyRow.green,
    red: inconsistentLegacyRow.red,
    detailed: inconsistentLegacyRow.useDetailedOutcomes
  },
  { total: 4, green: 3, red: 1, detailed: false },
  "detailed coverage must satisfy the larger of answered total and aggregate total"
);

const daySource = sourceBetween(
  "function progressRowsForDay(",
  "function renderProgressDayPanel("
);
const datedLegacyAttempt = {
  ...legacyAttempt,
  updatedAt: new Date(2026, 6, 27, 12, 0, 0).getTime(),
  cardOutcomes: [{
    key: "only-one-detail",
    status: "green",
    answeredAt: new Date(2026, 6, 27, 11, 0, 0).getTime(),
    front: "Known detail"
  }]
};
const progressRowsForDay = Function(
  "attempts",
  "normalizeCardText",
  `
    const currentUser = { name: "Student" };
    const attemptsForStudent = () => attempts;
    const deckTitleFromId = value => value || "Deck";
    const dayKey = value => {
      const date = new Date(value);
      return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
    };
    ${outcomeSource}
    ${daySource}
    return progressRowsForDay;
  `
)([datedLegacyAttempt], value => String(value || ""));
const legacyDayRows = progressRowsForDay("2026-07-27");
assert.equal(
  legacyDayRows.reduce((sum, row) => sum + row.count, 0),
  4,
  "day drilldown must preserve the full legacy aggregate"
);
assert.equal(legacyDayRows.filter(row => row.front === "Known detail").length, 1);
assert.deepEqual(
  legacyDayRows.filter(row => row.front !== "Known detail").map(row => [row.status, row.count]),
  [["green", 2], ["red", 1]],
  "day drilldown must expose a status-specific summary remainder"
);

assert.match(
  source,
  /if \(redStat\) redStat\.textContent = allTime\.red/,
  "red stat must use the same attempt series as the graph and total"
);
assert.match(source, /紅叉總數（全部時間）/);
assert.match(source, /data-current-red-practice-count>目前紅叉：0｜練習/);

const sortSource = sourceBetween(
  "function normalizeStudentSortMode(",
  "function applyStudentOrder("
);
const sortHelpers = Function(
  "normalizeStudent",
  `${sortSource}; return { normalizeStudentSortMode, orderedStudents };`
)(student => ({ ...student }));
const students = [
  { name: "Mia", sortOrder: 3, createdAt: 3 },
  { name: "althea", sortOrder: 1, createdAt: 1 },
  { name: "Danny", sortOrder: 2, createdAt: 2 }
];
assert.deepEqual(sortHelpers.orderedStudents(students, "asc").map(row => row.name), ["althea", "Danny", "Mia"]);
assert.deepEqual(sortHelpers.orderedStudents(students, "desc").map(row => row.name), ["Mia", "Danny", "althea"]);
assert.deepEqual(sortHelpers.orderedStudents(students, "custom").map(row => row.name), ["althea", "Danny", "Mia"]);
assert.equal(sortHelpers.normalizeStudentSortMode("unsupported"), "custom");

assert.match(source, /data-student-sort-mode="asc">A → Z/);
assert.match(source, /data-student-sort-mode="desc">Z → A/);
assert.match(source, /data-student-sort-mode="custom">自訂排序/);
assert.match(source, /data-move-student-order=/, "custom order must have touch-friendly move buttons");
assert.match(source, /flashcard_admin_reorder_students/);
assert.match(source, /flashcard_admin_set_student_sort_mode/);
assert.match(source, /const ADMIN_STUDENT_SORT_LOCAL_PREFIX = "edmundFlashcardAdminStudentSort::account::"/);
assert.match(source, /catch \(error\) \{[\s\S]*?studentSortMode = readLocalAdminStudentSortMode\(\)/);
assert.match(
  sourceBetween("async function persistStudentSortMode(", "async function persistCustomStudentOrder("),
  /\} else \{\s*cacheLocalAdminStudentSortMode\(normalizedMode\)/,
  "local-backup mode must remember A→Z/Z→A without overriding Supabase"
);

const initSupabaseSource = sourceBetween(
  "async function initSupabaseState()",
  "async function callSupabaseRpc("
);
assert.equal(
  (initSupabaseSource.match(/studentSortMode = readLocalAdminStudentSortMode\(\)/g) || []).length,
  2,
  "both missing-client and anonymous-auth fallback exits must restore the local sort mode"
);
assert.equal(
  (initSupabaseSource.match(/refreshCurrentView\(\);/g) || []).length,
  3,
  "fallback restoration and the connected path must all refresh the visible ordering"
);

const studentHydrationSource = sourceBetween(
  "function studentFromSupabase(",
  "function normalizeStudentSortMode("
);
const studentFromSupabase = Function(
  "normalizeStudent",
  "defaultAccess",
  `${studentHydrationSource}; return studentFromSupabase;`
)(student => ({ ...student }), () => ({}));
const preservedStudent = studentFromSupabase(
  { id: "1", name: "Mia", access: { dse: true } },
  { id: "1", name: "Mia", sortOrder: 4, createdAt: 100, password: "protected", access: { dse: true } }
);
assert.equal(preservedStudent.sortOrder, 4, "access RPC responses without sort_order must preserve custom order");
assert.match(
  sourceBetween("async function saveStudentAccessToSupabase(", "async function loadPasswordLogsFromSupabase("),
  /studentFromSupabase\(rows\[0\], student\)/,
  "access/message/all-access saves must hydrate against the existing student"
);
assert.doesNotMatch(
  sourceBetween("async function persistCustomStudentOrder(", "function moveStudentInCustomOrder("),
  /localStorage/,
  "custom student order must not use localStorage as its authoritative persistence"
);

assert.match(accountSql, /add column if not exists sort_order integer/i);
assert.match(accountSql, /add column if not exists student_sort_mode text not null default 'custom'/i);
assert.match(accountSql, /create or replace function public\.flashcard_admin_reorder_students/i);
assert.match(accountSql, /from unnest\(p_student_names\) with ordinality/i);
assert.match(accountSql, /create or replace function public\.flashcard_admin_set_student_sort_mode/i);
assert.match(accountSql, /create or replace function public\.flashcard_admin_get_student_list_preferences/i);
assert.match(accountSql, /revoke all on function public\.flashcard_admin_reorder_students\(text, text, text\[\]\) from public, anon, authenticated, service_role/i);
assert.match(accountSql, /grant execute on function public\.flashcard_admin_reorder_students\(text, text, text\[\]\) to authenticated/i);
assert.match(orderingMigrationSql, /add column if not exists sort_order integer/i);
assert.match(orderingMigrationSql, /add column if not exists student_sort_mode text not null default 'custom'/i);
assert.match(orderingMigrationSql, /create trigger flashcard_students_assign_sort_order/i);
assert.match(orderingMigrationSql, /create or replace function public\.flashcard_admin_reorder_students/i);
assert.match(orderingMigrationSql, /revoke all on function public\.flashcard_admin_reorder_students\(text, text, text\[\]\) from public, anon, authenticated, service_role/i);
assert.match(orderingMigrationSql, /grant execute on function public\.flashcard_admin_reorder_students\(text, text, text\[\]\) to authenticated/i);

console.log("Flashcard outcome counting and admin student ordering checks passed.");
