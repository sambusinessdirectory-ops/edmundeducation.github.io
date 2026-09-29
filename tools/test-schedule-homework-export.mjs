import assert from "node:assert/strict";
import { formatHomeworkExport, homeworkExportStatus, validExportWeek } from "../schedule-homework-export.mjs";
import { serializeScheduleMessage } from "../schedule-homework-links.mjs";

assert.equal(validExportWeek("2026-09-28"), true);
assert.equal(validExportWeek("2026-09-29"), false);
assert.equal(validExportWeek("2026-02-30"), false);
assert.equal(homeworkExportStatus({ isCompleted: true, isInProgress: true }), "completed");
assert.equal(homeworkExportStatus({ isMoreThanHalfCompleted: true }), "more_than_half_completed");
assert.equal(homeworkExportStatus({ isInProgress: true }), "in_progress");
assert.equal(homeworkExportStatus({ isPreviousIncomplete: true }), "previous_incomplete");
assert.equal(homeworkExportStatus({}), "not_started");

const message = serializeScheduleMessage("完整中文\nsecond line\twith tab", [], ["teacher-added", "hardest-today"]);
const content = formatHomeworkExport({
  students: [{ id: "student-2", name: "陳同學", is_active: true }],
  entries: [{
    id: "entry-1", studentId: "student-2", scheduleDate: "2026-09-29", slotIndex: 3,
    source: "admin", isInProgress: true, message
  }],
  scope: "2026-09-28", exportedAt: "2026-09-29T15:00:00.000Z"
});
assert.match(content, /S\tstudent-2\t陳同學\tactive/);
assert.match(content, /H\tstudent-2\t2026-09-29\t3\tteacher\tin_progress\tteacher-added,hardest-today\t完整中文\\nsecond line\\twith tab\t/);
assert.doesNotMatch(content, /\[\[@edmund-homework-tag/);
assert.throws(() => formatHomeworkExport({
  students: [], entries: [{ studentId: "other", message: "x" }], scope: "all", exportedAt: "now"
}), /unselected/);
console.log("Homework text export formatting passed");
