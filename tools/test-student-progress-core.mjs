#!/usr/bin/env node

import assert from "node:assert/strict";
import test from "node:test";
import {
  STUDENT_PROGRESS_SOURCES,
  buildActivitySeries,
  buildMasterTimeSeries,
  buildSourceTimeSeries,
  buildWritingAverageSeries,
  formatProgressDuration,
  localDayKey,
  normalizeProgressSnapshot
} from "../student-progress-core.js";
import {
  buildStudentProgressPrintDocument,
  normalizeProgressExportSelection,
  progressExportPreferenceKey
} from "../student-progress-export.js";

const hour = 60 * 60 * 1000;
const sourceHours = {
  flashcards: 3,
  writingPractice: 2,
  sentenceStructure: 4,
  speaking: 5,
  phrasalVerbs: 1,
  idioms: 2,
  proverbs: 1,
  commonExpressionSpeaking: 0,
  commonExpressionWritten: 0,
  commonExpressionRhetoricalSpeaking: 0,
  commonExpressionRhetoricalWriting: 0,
  commonExpressionProfessionalMessage: 0,
  commonExpressionBusinessSpeaking: 0,
  writingSubmission: 0
};

function fixture() {
  const sources = {};
  for (const source of STUDENT_PROGRESS_SOURCES) {
    sources[source.id] = {
      activityDays: [],
      timeDays: [{ date: "2026-07-28", totalMs: sourceHours[source.id] * hour }]
    };
  }
  sources.flashcards.timeDays.unshift({ date: "2026-07-27", totalMs: hour });
  sources.flashcards.activityDays = [{ date: "2026-07-28", total: 20, green: 15, red: 5 }];
  sources.sentenceStructure.activityDays = [{ date: "2026-07-28", questions: 3 }];
  sources.writingSubmission.activityDays = [{ date: "2026-07-28", articles: 2, totalMs: 90 * 60 * 1000 }];
  sources.writingSubmission.timeDays = [{ date: "2026-07-28", totalMs: 90 * 60 * 1000 }];
  return {
    schemaVersion: 1,
    generatedAt: "2026-07-28T12:00:00+08:00",
    timeZone: "Asia/Hong_Kong",
    student: { id: "11111111-1111-4111-8111-111111111111", name: "Test Student" },
    sources
  };
}

test("source order matches the requested portal priority", () => {
  assert.deepEqual(STUDENT_PROGRESS_SOURCES.map(({ id }) => id), [
    "flashcards",
    "writingPractice",
    "sentenceStructure",
    "speaking",
    "phrasalVerbs",
    "idioms",
    "proverbs",
    "commonExpressionSpeaking",
    "commonExpressionWritten",
    "commonExpressionRhetoricalSpeaking",
    "commonExpressionRhetoricalWriting",
    "commonExpressionProfessionalMessage",
    "commonExpressionBusinessSpeaking",
    "writingSubmission"
  ]);
});

test("the supplied seven-system example totals exactly 18 hours on one date", () => {
  const snapshot = fixture();
  snapshot.sources.writingSubmission.timeDays = [];
  const master = buildMasterTimeSeries(snapshot, "week", new Date(2026, 6, 28, 12));
  const point = master.points.find(({ key }) => key === "2026-07-28");
  assert.equal(point.totalMs, 18 * hour);
  assert.equal(point.systems.flashcards, 3 * hour);
  assert.equal(point.systems.speaking, 5 * hour);
  assert.equal(point.cumulativeTotalMs, 19 * hour, "the prior one-hour record remains in the cumulative line");
  assert.equal(master.periodTotalMs, 19 * hour);
  assert.equal(master.allTimeTotalMs, 19 * hour);
});

test("Writing Submission joins the master total with all fourteen sources", () => {
  const master = buildMasterTimeSeries(fixture(), "week", new Date(2026, 6, 28, 12));
  const point = master.points.find(({ key }) => key === "2026-07-28");
  assert.equal(point.systems.writingSubmission, 90 * 60 * 1000);
  assert.equal(point.totalMs, 19.5 * hour);
  assert.equal(master.allTimeTotalMs, 20.5 * hour);
});

test("all six Common Expression systems contribute independent activity and time series", () => {
  const snapshot = fixture();
  const sourceIds = [
    "commonExpressionSpeaking",
    "commonExpressionWritten",
    "commonExpressionRhetoricalSpeaking",
    "commonExpressionRhetoricalWriting",
    "commonExpressionProfessionalMessage",
    "commonExpressionBusinessSpeaking"
  ];
  sourceIds.forEach((sourceId, index) => {
    snapshot.sources[sourceId] = {
      activityDays: [{ date: "2026-07-28", questions: index + 1 }],
      timeDays: [{ date: "2026-07-28", totalMs: (index + 1) * 10 * 60 * 1000 }]
    };
  });

  sourceIds.forEach((sourceId, index) => {
    const activity = buildActivitySeries(snapshot, sourceId, "week", new Date(2026, 6, 28, 12));
    const time = buildSourceTimeSeries(snapshot, sourceId, "week", new Date(2026, 6, 28, 12));
    assert.equal(activity.primaryTotal, index + 1, `${sourceId} question total`);
    assert.equal(time.allTimeMs, (index + 1) * 10 * 60 * 1000, `${sourceId} time total`);
  });

  const master = buildMasterTimeSeries(snapshot, "week", new Date(2026, 6, 28, 12));
  const point = master.points.find(({ key }) => key === "2026-07-28");
  assert.equal(point.systems.commonExpressionSpeaking, 10 * 60 * 1000);
  assert.equal(point.systems.commonExpressionBusinessSpeaking, 60 * 60 * 1000);
  assert.equal(point.totalMs, 23 * hour, "six Common Expression time totals join the existing 19.5 hours");
});

test("source activity and time totals preserve canonical source metrics", () => {
  const snapshot = fixture();
  const flashcards = buildActivitySeries(snapshot, "flashcards", "week", new Date(2026, 6, 28, 12));
  assert.deepEqual(flashcards.allTimeTotals, { total: 20, green: 15, red: 5 });
  assert.equal(flashcards.primaryTotal, 20);
  const sentence = buildActivitySeries(snapshot, "sentenceStructure", "week", new Date(2026, 6, 28, 12));
  assert.equal(sentence.primaryTotal, 3);
  const speakingTime = buildSourceTimeSeries(snapshot, "speaking", "week", new Date(2026, 6, 28, 12));
  assert.equal(speakingTime.allTimeMs, 5 * hour);
});

test("canonical Writing Practice attempt rows feed both progress dashboards", () => {
  const snapshot = fixture();
  snapshot.sources.writingPractice = {
    activityDays: [{ date: "2026-07-28", questions: 7, attempts: 2 }],
    timeDays: [{ date: "2026-07-28", totalMs: 185000 }]
  };
  const activity = buildActivitySeries(snapshot, "writingPractice", "week", "2026-07-28T04:00:00.000Z");
  const time = buildSourceTimeSeries(snapshot, "writingPractice", "week", "2026-07-28T04:00:00.000Z");
  assert.deepEqual(activity.allTimeTotals, { questions: 7, attempts: 2 });
  assert.equal(time.allTimeMs, 185000);
  const master = buildMasterTimeSeries(snapshot, "week", "2026-07-28T04:00:00.000Z");
  assert.equal(master.points.find(({ key }) => key === "2026-07-28").systems.writingPractice, 185000);
});

test("selected-period and all-time source totals come from one snapshot without label drift", () => {
  const snapshot = fixture();
  snapshot.sources.sentenceStructure.activityDays.unshift({ date: "2025-01-01", questions: 7 });
  snapshot.sources.sentenceStructure.timeDays.unshift({ date: "2025-01-01", totalMs: 2 * hour });
  const activity = buildActivitySeries(snapshot, "sentenceStructure", "week", new Date(2026, 6, 28, 12));
  const time = buildSourceTimeSeries(snapshot, "sentenceStructure", "week", new Date(2026, 6, 28, 12));
  assert.equal(activity.totals.questions, 3, "period activity excludes earlier history");
  assert.equal(activity.allTimeTotals.questions, 10, "all-time activity retains earlier history");
  assert.equal(time.periodTotalMs, 4 * hour);
  assert.equal(time.allTimeMs, 6 * hour);
});

test("Writing Submission average is total composition time divided by articles", () => {
  const average = buildWritingAverageSeries(fixture(), "week", new Date(2026, 6, 28, 12));
  assert.equal(average.allTimeAverageMs, 45 * 60 * 1000);
  assert.equal(average.points.find(({ key }) => key === "2026-07-28").averageMs, 45 * 60 * 1000);
});

test("malformed payloads normalize to safe empty sources", () => {
  const normalized = normalizeProgressSnapshot({ student: { name: "A" }, sources: { flashcards: null } });
  assert.equal(normalized.student.name, "A");
  assert.equal(Object.keys(normalized.sources).length, 14);
  assert.deepEqual(normalized.sources.flashcards, { activityDays: [], timeDays: [] });
  assert.equal(formatProgressDuration(3661000), "1 小時 01 分 01 秒");
});

test("Hong Kong day boundaries and inclusive custom date ranges are deterministic", () => {
  assert.equal(localDayKey("2026-07-27T15:59:59.000Z"), "2026-07-27");
  assert.equal(localDayKey("2026-07-27T16:00:00.000Z"), "2026-07-28");
  const snapshot = fixture();
  snapshot.sources.flashcards.activityDays = [
    { date: "2026-07-26", total: 1, green: 1, red: 0 },
    { date: "2026-07-27", total: 2, green: 2, red: 0 },
    { date: "2026-07-28", total: 3, green: 3, red: 0 }
  ];
  const custom = { id: "custom", start: "2026-07-27", end: "2026-07-28" };
  const series = buildActivitySeries(snapshot, "flashcards", custom, "2026-07-28T04:00:00.000Z");
  assert.deepEqual(series.points.map(({ key }) => key), ["2026-07-27", "2026-07-28"]);
  assert.equal(series.totals.total, 5, "both custom-range boundary dates are included");
  assert.equal(series.allTimeTotals.total, 6, "all-time totals remain independent of the selected custom start date");
  assert.throws(
    () => buildActivitySeries(snapshot, "flashcards", { id: "custom", start: "2026-07-29", end: "2026-07-28" }, "2026-07-28T04:00:00.000Z"),
    /start must not follow/
  );
});

test("PDF export defaults to one overview plus one standalone page per connected system", () => {
  const html = buildStudentProgressPrintDocument({
    snapshot: fixture(),
    range: { id: "custom", start: "2026-07-27", end: "2026-07-28" },
    selectedSourceIds: normalizeProgressExportSelection(undefined),
    viewerLabel: "Test Student"
  });
  assert.equal((html.match(/class="print-page(?:\s|\")/g) || []).length, 15);
  assert.match(html, /第 1 \/ 15 頁/);
  assert.match(html, /第 15 \/ 15 頁/);
  assert.match(html, /2026-07-27 至 2026-07-28/);
  assert.match(html, /全面英文能力發展進度表/);
  for (const source of STUDENT_PROGRESS_SOURCES) assert.match(html, new RegExp(source.labelEn));
});

test("PDF export keeps a saved subset ordered and scoped to its viewer", () => {
  const html = buildStudentProgressPrintDocument({
    snapshot: fixture(),
    range: "week",
    selectedSourceIds: ["writingSubmission", "flashcards", "invalid", "flashcards"]
  });
  assert.equal((html.match(/class="print-page(?:\s|\")/g) || []).length, 3);
  assert.match(html, /Flashcard System/);
  assert.match(html, /Writing Submission/);
  assert.doesNotMatch(html, /Sentence Structure/);
  assert.deepEqual(normalizeProgressExportSelection(["flashcards", "invalid", "flashcards"]), ["flashcards"]);
  assert.equal(progressExportPreferenceKey({ role: "parent", viewerId: "Parent 01" }), "edmund-student-progress-export-v1:parent:parent01");
});
