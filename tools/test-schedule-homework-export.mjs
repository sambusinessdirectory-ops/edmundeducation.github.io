import assert from "node:assert/strict";
import { HOMEWORK_LINK_EXPORT_SYSTEMS, filterHomeworkLinkExportResources, formatHomeworkExport, formatHomeworkLinkExport, homeworkExportStatus, homeworkLinkExportSystem, validExportWeek } from "../schedule-homework-export.mjs";
import { serializeScheduleMessage } from "../schedule-homework-links.mjs";
import { HOMEWORK_RESOURCE_CATALOG } from "../homework-resource-catalog.mjs";

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
const links = formatHomeworkLinkExport({
  resources: HOMEWORK_RESOURCE_CATALOG,
  exportedAt: "2026-10-01T00:00:00.000Z"
});
const lines = links.trimEnd().split("\n");
assert.equal(lines.length, HOMEWORK_RESOURCE_CATALOG.length + 3, "export every homework catalogue link without the picker display limit");
assert.equal(lines[2], "系統\t內容\t連結");
assert.match(links, /Flash Cards\t[^\n]+\thttps:\/\/edmundeducation\.com\/flashcards\.html\?deck=/);
assert.match(links, /Writing Submission\t[^\n]+\thttps:\/\/edmundeducation\.com\/writing-submission\.html\?exercise=/);
assert.equal(homeworkLinkExportSystem("video-class-series"), "video-class");
assert.equal(homeworkLinkExportSystem("video-class-video"), "video-class");
assert.equal(HOMEWORK_LINK_EXPORT_SYSTEMS.filter((item) => item.id === "video-class").length, 1);
assert.equal(filterHomeworkLinkExportResources([
  { type: "video-class-series" }, { type: "video-class-video" }, { type: "flashcards" }
], "video-class").length, 2);
const nativeResources = filterHomeworkLinkExportResources(HOMEWORK_RESOURCE_CATALOG, "native-english");
assert.equal(nativeResources.length, 466);
const nativeLinks = formatHomeworkLinkExport({ resources: nativeResources, exportedAt: "2026-10-01T00:00:00.000Z" });
assert.equal(nativeLinks.trimEnd().split("\n").length, nativeResources.length + 3);
assert.doesNotMatch(nativeLinks, /Flash Cards\t/);
assert.throws(() => filterHomeworkLinkExportResources(HOMEWORK_RESOURCE_CATALOG, "unknown"), /請選擇有效/);
assert.throws(() => formatHomeworkLinkExport({
  resources: [{ id: "flash:unsafe", type: "flashcards", label: "Unsafe", url: "https://other.example/" }],
  exportedAt: "now"
}), /Invalid homework hyperlink/);
console.log("Homework text export formatting passed");
