import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import { HOMEWORK_RESOURCE_CATALOG } from "../homework-resource-catalog.mjs";
import {
  MAX_HOMEWORK_RESOURCES,
  SCHEDULE_MESSAGE_MAX_LENGTH,
  acceptHomeworkAutocomplete,
  filterHomeworkResources,
  fullHomeworkTriggerAtCursor,
  homeworkAutocomplete,
  normalizeHomeworkResource,
  parseScheduleMessage,
  serializeScheduleMessage
} from "../schedule-homework-links.mjs";

const execFileAsync = promisify(execFile);
const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDirectory, "..");
const read = (file) => readFile(path.join(root, file), "utf8");

const ids = new Set(HOMEWORK_RESOURCE_CATALOG.map((resource) => resource.id));
assert.equal(ids.size, HOMEWORK_RESOURCE_CATALOG.length, "catalog ids must be unique");
const byType = HOMEWORK_RESOURCE_CATALOG.reduce((groups, resource) => {
  (groups[resource.type] ||= []).push(resource);
  return groups;
}, {});
assert.equal((byType.flashcards || []).length, 745, "all current static and lazy-loaded flashcard leaf decks should be indexed");
assert.equal((byType["fill-blanks"] || []).length, 250, "all current writing exercises should be indexed");
assert.equal((byType.speaking || []).length, 787, "all currently visible speaking exercises should be indexed");
assert.equal((byType["sentence-structure"] || []).length, 114, "all sentence structure lessons should be indexed");
assert.ok(ids.has("flash:ielts/writing/task-2/advantage-and-disadvantage/EdmundBd9AdDisAd-Q2"));
assert.ok(ids.has("fill:model-essay-2-ielts-advantage-disadvantage"));
assert.ok(ids.has("speaking:ielts-part-2-book-1-exercise-01"));
assert.ok(ids.has("sentence:ss114"));

const taskTwoFlashcards = (byType.flashcards || []).filter((resource) => resource.id.startsWith("flash:ielts/writing/task-2/"));
assert.equal(taskTwoFlashcards.length, 232, "every current non-empty IELTS Task 2 flashcard deck should be indexed");
assert.equal(
  taskTwoFlashcards.find((resource) => resource.id === "flash:ielts/writing/task-2/advantage-and-disadvantage/EdmundBd9AdDisAd-Q2")?.label,
  "An increasing number of people are buying what they need online. What are the advantages and disadvantages for both individuals and companies to shop online? (repeated most years)",
  "IELTS Task 2 resources should use the real question rather than an internal deck id"
);
assert.equal(
  taskTwoFlashcards.some((resource) => /^IELTS \/ Writing \/ Task 2 \/.*EdmundBd9/i.test(resource.label)),
  false,
  "every indexed IELTS Task 2 deck should have a source-derived question label"
);

const visibleSpeakingBookLimits = { 1: 14, 2: 16, 3: 16 };
for (const resource of byType.speaking || []) {
  const match = resource.detail.match(/Part (\d+) · Book (\d+)/);
  assert.ok(match, `speaking resource should identify its part and book: ${resource.id}`);
  assert.ok(Number(match[2]) <= visibleSpeakingBookLimits[Number(match[1])], `hidden speaking book leaked into catalog: ${resource.id}`);
}

for (const resource of HOMEWORK_RESOURCE_CATALOG) {
  assert.ok(normalizeHomeworkResource(resource), `resource URL must pass same-origin allowlisting: ${resource.id}`);
}
assert.equal(normalizeHomeworkResource({
  id: "flash:bad",
  type: "flashcards",
  label: "Unsafe",
  url: "https://evil.example/flashcards.html?deck=bad"
}), null);

const flashCompletion = homeworkAutocomplete("F", 1);
assert.equal(flashCompletion.trigger, "Flash Cards");
assert.equal(flashCompletion.remainder, "lash Cards");
assert.equal(homeworkAutocomplete("Fi", 2).trigger, "Fill in the blanks");
assert.equal(homeworkAutocomplete("Review Se", 9).trigger, "Sentence Structure");
const accepted = acceptHomeworkAutocomplete("Please finish Fi", 16, 16, homeworkAutocomplete("Please finish Fi", 16));
assert.equal(accepted.value, "Please finish Fill in the blanks");
assert.equal(fullHomeworkTriggerAtCursor(accepted.value, accepted.cursor).type, "fill-blanks");
assert.equal(fullHomeworkTriggerAtCursor(`${accepted.value} today`, accepted.value.length + 6), null, "continuing prose must dismiss the picker");

const selected = HOMEWORK_RESOURCE_CATALOG.find((resource) => resource.id === "fill:model-essay-2-ielts-advantage-disadvantage");
const stored = serializeScheduleMessage("Fill in the blanks", [selected]);
assert.match(stored, /\[\[@edmund-homework:v1:/);
const parsed = parseScheduleMessage(stored);
assert.equal(parsed.text, "Fill in the blanks");
assert.equal(parsed.resources.length, 1);
assert.equal(parsed.resources[0].url, "writing-practice.html?exercise=model-essay-2-ielts-advantage-disadvantage");
assert.doesNotMatch(parsed.text, /@edmund-homework/);
assert.equal(parseScheduleMessage("普通舊安排").text, "普通舊安排", "legacy messages must stay unchanged");
assert.equal(filterHomeworkResources(HOMEWORK_RESOURCE_CATALOG, "speaking", "Part 2 Book 1 Advertisements").total >= 1, true);

const flashResources = byType.flashcards || [];
const fittingFlashResources = [];
let firstOversizedFlashMessage = "";
for (const resource of flashResources.slice(0, MAX_HOMEWORK_RESOURCES)) {
  const candidate = serializeScheduleMessage("F", [...fittingFlashResources, resource]);
  if (candidate.length > SCHEDULE_MESSAGE_MAX_LENGTH) {
    firstOversizedFlashMessage = candidate;
    break;
  }
  fittingFlashResources.push(resource);
}
assert.ok(fittingFlashResources.length > 0, "at least one homework resource must fit in a schedule message");
assert.ok(
  fittingFlashResources.length < MAX_HOMEWORK_RESOURCES && firstOversizedFlashMessage.length > SCHEDULE_MESSAGE_MAX_LENGTH,
  "the UI must enforce serialized marker overhead before reaching the nominal resource-count cap"
);
assert.ok(
  serializeScheduleMessage("F", fittingFlashResources).length <= SCHEDULE_MESSAGE_MAX_LENGTH,
  "the last accepted attachment set must fit the database message limit"
);

const tempDirectory = await mkdtemp(path.join(tmpdir(), "edmund-homework-catalog-"));
try {
  const regenerated = path.join(tempDirectory, "homework-resource-catalog.mjs");
  const regeneratedAgain = path.join(tempDirectory, "homework-resource-catalog-again.mjs");
  await execFileAsync(process.execPath, [path.join(toolsDirectory, "generate-homework-resource-catalog.mjs"), "--output", regenerated], { cwd: root });
  await execFileAsync(process.execPath, [path.join(toolsDirectory, "generate-homework-resource-catalog.mjs"), "--output", regeneratedAgain], { cwd: root });
  assert.equal(
    await readFile(regeneratedAgain, "utf8"),
    await readFile(regenerated, "utf8"),
    "catalog generation must be byte-for-byte deterministic"
  );
  const module = await import(`${pathToFileURL(regenerated).href}?test=${Date.now()}`);
  assert.deepEqual(
    module.HOMEWORK_RESOURCE_CATALOG,
    HOMEWORK_RESOURCE_CATALOG,
    "tracked local catalog, including labels and URLs, must match the canonical source files"
  );
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}

const [scheduleHtml, scheduleJs, flashcards, writing, speaking, sentence, workflow] = await Promise.all([
  read("schedule-system.html"),
  read("schedule-system.js"),
  read("flashcards.html"),
  read("writing-practice.html"),
  read("speaking-system.js"),
  read("sentence-structure.js"),
  read(".github/workflows/pages.yml")
]);
assert.match(scheduleHtml, /data-homework-autocomplete/);
assert.match(scheduleHtml, /data-homework-picker-search/);
assert.match(scheduleHtml, /data-homework-attachments/);
assert.match(scheduleJs, /serializeScheduleMessage\(visibleMessage, state\.editing\.resources\)/);
assert.match(scheduleJs, /nextMessage\.length > SCHEDULE_MESSAGE_MAX_LENGTH/, "attachment selection must enforce the serialized database budget");
assert.match(scheduleJs, /message\.length > SCHEDULE_MESSAGE_MAX_LENGTH/, "Save must recheck the serialized database budget");
assert.match(scheduleJs, /resources\.length >= MAX_HOMEWORK_RESOURCES/, "attachment selection must enforce the resource-count cap without silent truncation");
assert.match(scheduleJs, /queueMassEditUpsert\(message, estimatedMinutes\)/, "resource markers must flow through Mass Edit");
assert.match(scheduleJs, /parseScheduleMessage\(entry\.message\)/, "saved markers must be hidden when rendered");
assert.match(scheduleJs, /const link = document\.createElement\("a"\)/, "saved calendar homework links must be native keyboard-focusable anchors");
assert.match(scheduleJs, /links\.setAttribute\("aria-label"/, "calendar homework links must have an accessible group label");
assert.match(scheduleJs, /cell\.append\(links\)/, "calendar anchors must be siblings rather than descendants of the slot button");
assert.doesNotMatch(scheduleJs, /button\.append\(links\)/, "interactive anchors must never be nested inside the slot button");
assert.doesNotMatch(scheduleJs, /link\.setAttribute\("role", "link"\)/, "calendar links must not use a non-focusable span role");
assert.doesNotMatch(scheduleJs, /window\.location\.assign\(href\)/, "native anchors must retain keyboard and modifier-click navigation semantics");
assert.match(flashcards, /URLSearchParams\(window\.location\.search\)\.get\("deck"\)/);
assert.match(writing, /URLSearchParams\(window\.location\.search\)\.get\("exercise"\)/);
assert.match(speaking, /URLSearchParams\(window\.location\.search\)\.get\("exercise"\)/);
assert.match(sentence, /URLSearchParams\(window\.location\.search\)\.get\("lesson"\)/);
assert.ok(
  workflow.indexOf("node tools/generate-homework-resource-catalog.mjs") < workflow.indexOf("rsync -av"),
  "Pages must refresh the catalog before copying deployment files"
);

console.log(`Schedule homework links verified (${HOMEWORK_RESOURCE_CATALOG.length} resources).`);
