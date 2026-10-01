import { HOMEWORK_RESOURCE_TYPES, normalizeHomeworkResource, parseScheduleMessage } from "./schedule-homework-links.mjs";

const STATUS = Object.freeze({
  completed: "completed",
  more_than_half_completed: "more_than_half_completed",
  in_progress: "in_progress",
  previous_incomplete: "previous_incomplete",
  not_started: "not_started"
});

export function homeworkExportStatus(entry) {
  if (entry.isCompleted) return STATUS.completed;
  if (entry.isMoreThanHalfCompleted) return STATUS.more_than_half_completed;
  if (entry.isInProgress) return STATUS.in_progress;
  if (entry.isPreviousIncomplete) return STATUS.previous_incomplete;
  return STATUS.not_started;
}

export function validExportWeek(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value && date.getUTCDay() === 1;
}

function field(value) {
  return String(value ?? "").replace(/\\/g, "\\\\").replace(/\t/g, "\\t").replace(/\r/g, "\\r").replace(/\n/g, "\\n");
}

export const homeworkLinkExportSystem = (type) =>
  String(type || "").startsWith("video-class-") ? "video-class" : String(type || "");

export const HOMEWORK_LINK_EXPORT_SYSTEMS = Object.freeze([...new Map(
  HOMEWORK_RESOURCE_TYPES.map((type) => [
    homeworkLinkExportSystem(type.type),
    Object.freeze({ id: homeworkLinkExportSystem(type.type), label: type.type.startsWith("video-class-") ? "Video Class" : type.label })
  ])
).values()]);

export function filterHomeworkLinkExportResources(resources, system = "all") {
  if (system !== "all" && !HOMEWORK_LINK_EXPORT_SYSTEMS.some((item) => item.id === system)) {
    throw new Error("請選擇有效的功課系統。");
  }
  return system === "all" ? resources : resources.filter((resource) => homeworkLinkExportSystem(resource.type) === system);
}

export function formatHomeworkLinkExport({ resources, exportedAt }) {
  const typeNames = new Map(HOMEWORK_LINK_EXPORT_SYSTEMS.map((type) => [type.id, type.label]));
  const seen = new Set();
  const rows = [];
  for (const raw of resources) {
    const resource = normalizeHomeworkResource(raw);
    if (!resource) throw new Error(`Invalid homework hyperlink: ${String(raw?.id || "unknown")}`);
    if (seen.has(resource.id)) continue;
    seen.add(resource.id);
    const detail = String(raw.detail || "").replace(/\s+/g, " ").trim();
    rows.push({
      system: typeNames.get(homeworkLinkExportSystem(resource.type)),
      description: detail && detail !== resource.label ? `${resource.label} — ${detail}` : resource.label,
      url: new URL(resource.url, "https://edmundeducation.com/").href
    });
  }
  const lines = [
    "# EdmundEducation homework hyperlinks (UTF-8; tab-separated; \\t and \\n escaped)",
    `# exported_at=${field(exportedAt)} links=${rows.length}`,
    "系統\t內容\t連結",
    ...rows.map((row) => [row.system, row.description, row.url].map(field).join("\t"))
  ];
  return `${lines.join("\n")}\n`;
}

export function formatHomeworkExport({ students, entries, scope, exportedAt }) {
  const byId = new Map(students.map((student) => [String(student.id), student]));
  const lines = [
    "# EdmundEducation homework export v1 (UTF-8; tab-separated; \\t and \\n escaped)",
    `# exported_at=${field(exportedAt)} students=${students.length} entries=${entries.length} weeks=${field(scope)}`,
    "# S\tstudent_id\tname\taccount_status",
    "# H\tstudent_id\tdate\tslot\tassigned_by\tstatus\ttags\tmessage\tresources"
  ];
  for (const student of students) {
    lines.push(["S", student.id, student.name, student.is_active === false || student.deleted_at ? "inactive" : "active"].map(field).join("\t"));
  }
  const ordered = [...entries].sort((a, b) =>
    String(a.studentId).localeCompare(String(b.studentId))
    || String(a.scheduleDate).localeCompare(String(b.scheduleDate))
    || Number(a.slotIndex) - Number(b.slotIndex)
    || String(a.id).localeCompare(String(b.id))
  );
  for (const entry of ordered) {
    if (!byId.has(String(entry.studentId))) throw new Error("Export contains an unselected student's entry");
    const parsed = parseScheduleMessage(entry.message);
    lines.push([
      "H", entry.studentId, entry.scheduleDate, entry.slotIndex,
      entry.source === "admin" ? "teacher" : "student", homeworkExportStatus(entry),
      parsed.tags.map((tag) => tag.key).join(","), parsed.text,
      parsed.resources.map((resource) => resource.url || resource.id).join(",")
    ].map(field).join("\t"));
  }
  return `${lines.join("\n")}\n`;
}
