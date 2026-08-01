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
assert.equal(HOMEWORK_RESOURCE_CATALOG.length, 2576, "the Homework/Schedule catalogue should include every current learning resource and all 142 August flashcard decks");
const byType = HOMEWORK_RESOURCE_CATALOG.reduce((groups, resource) => {
  (groups[resource.type] ||= []).push(resource);
  return groups;
}, {});
assert.equal((byType.flashcards || []).length, 1261, "all current static and lazy-loaded flashcard leaf decks should be indexed");
assert.equal((byType["fill-blanks"] || []).length, 310, "all current writing exercises should be indexed");
assert.equal((byType.speaking || []).length, 787, "all currently visible speaking exercises should be indexed");
assert.equal((byType["sentence-structure"] || []).length, 218, "all sentence structure lessons should be indexed");
assert.ok(ids.has("flash:ielts/writing/task-2/advantage-and-disadvantage/EdmundBd9AdDisAd-Q2"));
assert.ok(ids.has("fill:model-essay-2-ielts-advantage-disadvantage"));
assert.ok(ids.has("speaking:ielts-part-2-book-1-exercise-01"));
assert.ok(ids.has("sentence:ss218"));
assert.equal(
  HOMEWORK_RESOURCE_CATALOG.find((resource) => resource.id === "flash:ielts/reading/passage-1/Practice 1")?.label,
  "IELTS / Reading / Passage 1 / Practice 1 — Andrea Palladio - Italian Architect",
  "Passage 1 Practice 1 should use its requested title"
);

const passageTwoFlashcards = (byType.flashcards || []).filter((resource) =>
  resource.id.startsWith("flash:ielts/reading/passage-2/Practice ")
);
assert.equal(
  passageTwoFlashcards.find((resource) => resource.ordinal === 1)?.label,
  "IELTS / Reading / Passage 2 / Practice 1 — Such a Fascinating Game",
  "Passage 2 Practice 1 should retain its source title"
);
assert.equal(passageTwoFlashcards.length, 151, "Passage 2 should expose Practice 1 plus all 150 generated decks");
assert.deepEqual(
  passageTwoFlashcards.map((resource) => resource.ordinal).sort((left, right) => left - right),
  [1, ...Array.from({ length: 150 }, (_, index) => index + 24)],
  "Passage 2 Homework links must preserve the exact source-practice inventory"
);
assert.equal(
  passageTwoFlashcards.some((resource) => resource.ordinal === 170),
  true,
  "the newly supplied Passage 2 Practice 170 must be itemized"
);

const passageTwoSentinels = [
  [24, "Caveat Scriptor"],
  [28, "The Ant and the Mandarin"],
  [49, "Are Artists Liars?"],
  [55, "The Evolutionary Mystery: Crocodile Survives"],
  [78, "Therapeutic Jurisprudence: An Overview"],
  [170, "Australian parrots and their adaptation to habitat change"],
  [173, "Bovids"]
];
for (const [ordinal, title] of passageTwoSentinels) {
  const resource = passageTwoFlashcards.find((item) => item.id === `flash:ielts/reading/passage-2/Practice ${ordinal}`);
  assert.ok(resource, `Passage 2 Practice ${ordinal} should be itemized in Homework/Schedule`);
  assert.equal(
    resource.label,
    `IELTS / Reading / Passage 2 / Practice ${ordinal} — ${title}`,
    `Passage 2 Practice ${ordinal} should use its canonical middle-column title`
  );
  assert.equal(
    resource.url,
    `flashcards.html?deck=ielts%2Freading%2Fpassage-2%2FPractice%20${ordinal}`,
    `Passage 2 Practice ${ordinal} should have an exact fresh-session deep link`
  );
  assert.match(
    resource.detail,
    new RegExp(`^IELTS / Reading / Passage 2 / Practice ${ordinal} · \\d+ cards$`),
    `Passage 2 Practice ${ordinal} should display its source-derived card count`
  );
}

const passageThreeFlashcards = (byType.flashcards || []).filter((resource) =>
  resource.id.startsWith("flash:ielts/reading/passage-3/Practice ")
);
assert.equal(
  passageThreeFlashcards.find((resource) => resource.ordinal === 1)?.label,
  "IELTS / Reading / Passage 3 / Practice 1 — ARE WE MANAGING TO DESTROY SCIENCE?",
  "Passage 3 Practice 1 should retain its source title"
);
const missingPassageThreeOrdinals = new Set([2, 10, 11, 12, 13, 18, 21, 120, 155]);
const expectedPassageThreeOrdinals = [
  1,
  ...Array.from({ length: 173 }, (_, index) => index + 3)
    .filter((ordinal) => !missingPassageThreeOrdinals.has(ordinal))
];
assert.equal(passageThreeFlashcards.length, 166, "Passage 3 should expose existing Practice 1 plus all 165 supplied decks");
assert.deepEqual(
  passageThreeFlashcards.map((resource) => resource.ordinal).sort((left, right) => left - right),
  expectedPassageThreeOrdinals,
  "Passage 3 Homework links must preserve the exact supplied practice inventory"
);
const passageThreeSentinels = [
  [3, "What’s in Blood?"],
  [48, "Improving Patient Safety"],
  [129, "The Bite That Heals"],
  [169, "The fluoridation controversy"],
  [175, "Science and the Stradivarius: Uncovering the secret of quality"]
];
for (const [ordinal, title] of passageThreeSentinels) {
  const resource = passageThreeFlashcards.find((item) => item.id === `flash:ielts/reading/passage-3/Practice ${ordinal}`);
  assert.ok(resource, `Passage 3 Practice ${ordinal} should be itemized in Homework/Schedule`);
  assert.equal(
    resource.label,
    `IELTS / Reading / Passage 3 / Practice ${ordinal} — ${title}`,
    `Passage 3 Practice ${ordinal} should use its canonical title`
  );
  assert.equal(
    resource.url,
    `flashcards.html?deck=ielts%2Freading%2Fpassage-3%2FPractice%20${ordinal}`,
    `Passage 3 Practice ${ordinal} should have an exact fresh-session deep link`
  );
}

const taskOneFlashcards = (byType.flashcards || []).filter((resource) =>
  /^flash:ielts\/writing\/task-1\/(?:bar-charts|line-graphs|pie-charts|process-diagrams|tables|maps|mixed-charts)\//.test(resource.id)
);
assert.equal(taskOneFlashcards.length, 59, "all supplied IELTS Writing Task 1 decks should be indexed");
assert.equal(
  taskOneFlashcards.find((resource) => resource.id === "flash:ielts/writing/task-1/bar-charts/bar-chart-1")?.url,
  "flashcards.html?deck=ielts%2Fwriting%2Ftask-1%2Fbar-charts%2Fbar-chart-1",
  "Bar Chart 1 should have an exact Homework/Schedule deep link"
);
assert.equal(
  taskOneFlashcards.find((resource) => resource.id === "flash:ielts/writing/task-1/process-diagrams/process-diagram-9")?.detail,
  "IELTS / Writing / Task 1 / Process Diagrams / Process Diagram 9 · 63 cards",
  "Process Diagram 9 should retain its source-derived card count in the picker"
);
assert.equal(
  taskOneFlashcards.find((resource) => resource.id === "flash:ielts/writing/task-1/tables/table-11")?.url,
  "flashcards.html?deck=ielts%2Fwriting%2Ftask-1%2Ftables%2Ftable-11",
  "Table 11 should have an exact Homework/Schedule deep link"
);
assert.equal(
  taskOneFlashcards.find((resource) => resource.id === "flash:ielts/writing/task-1/maps/maps-10")?.detail,
  "IELTS / Writing / Task 1 / Maps / Maps 10 · 66 cards",
  "Maps 10 should retain its source-derived title and card count in the picker"
);
assert.equal(
  taskOneFlashcards.find((resource) => resource.id === "flash:ielts/writing/task-1/mixed-charts/mixed-charts-7")?.url,
  "flashcards.html?deck=ielts%2Fwriting%2Ftask-1%2Fmixed-charts%2Fmixed-charts-7",
  "Mixed Charts 7 should have an exact Homework/Schedule deep link"
);

const taskOneWriting = (byType["fill-blanks"] || []).filter((resource) =>
  /^fill:model-essay-\d+-ielts-task1-(?:bar-charts|line-graph|pie-charts|process-diagram|tables|maps|mixed-charts)$/.test(resource.id)
);
assert.equal(taskOneWriting.length, 60, "all 60 logical IELTS Writing Task 1 fill-in-the-blanks sets should be indexed");
assert.equal(
  taskOneWriting.find((resource) => resource.id === "fill:model-essay-1-ielts-task1-bar-charts")?.url,
  "writing-practice.html?exercise=model-essay-1-ielts-task1-bar-charts",
  "Task 1 Bar Chart 1 should have an exact Homework/Schedule deep link"
);
assert.equal(
  taskOneWriting.find((resource) => resource.id === "fill:model-essay-11-ielts-task1-tables")?.detail,
  "IELTS Writing Task 1 · Tables",
  "Task 1 Table 11 should retain its source-derived type in the picker"
);
assert.equal(
  taskOneWriting.find((resource) => resource.id === "fill:model-essay-9-ielts-task1-maps")?.url,
  "writing-practice.html?exercise=model-essay-9-ielts-task1-maps",
  "Task 1 Maps 9 should remain available in Writing Practice even without a matching Flash Cards deck"
);
assert.equal(
  taskOneWriting.find((resource) => resource.id === "fill:model-essay-7-ielts-task1-mixed-charts")?.url,
  "writing-practice.html?exercise=model-essay-7-ielts-task1-mixed-charts",
  "Task 1 Mixed Charts 7 should have an exact Homework/Schedule deep link"
);

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

const numericFixture = [32, 24, 2, 111, 13, 22, 1, 23, 12, 11].map((ordinal) => ({
  id: `sentence:ss${ordinal}`,
  type: "sentence-structure",
  ordinal,
  label: `#${ordinal} · Lesson ${ordinal}`,
  detail: `Sentence Structure #${ordinal}`
}));
assert.deepEqual(
  filterHomeworkResources(numericFixture, "sentence-structure", "2").items.map((resource) => resource.ordinal),
  [2, 12, 22, 23, 24, 32],
  "numeric searches must show the exact number first, followed by naturally ascending containing numbers"
);
assert.deepEqual(
  filterHomeworkResources(numericFixture, "sentence-structure", "1").items.map((resource) => resource.ordinal),
  [1, 11, 12, 13, 111],
  "numeric ordering must not fall back to alphabetical title order"
);
assert.deepEqual(
  filterHomeworkResources(numericFixture, "sentence-structure", "２").items.map((resource) => resource.ordinal),
  [2, 12, 22, 23, 24, 32],
  "full-width numeric searches must use the same ordering"
);
const sentenceThreeResults = filterHomeworkResources(HOMEWORK_RESOURCE_CATALOG, "sentence-structure", "3");
assert.equal(sentenceThreeResults.items[0]?.id, "sentence:ss3", "Sentence Structure #3 must rank before #13, #23 and incidental matches");
assert.match(sentenceThreeResults.items[0]?.label || "", /^#3\b/, "Sentence Structure numbers must be visible in picker labels");
assert.match(sentenceThreeResults.items[0]?.detail || "", /Sentence Structure #3\b/, "Sentence Structure numbers must be visible in picker details");
assert.deepEqual(
  sentenceThreeResults.items.slice(0, 5).map((resource) => resource.ordinal),
  [3, 13, 23, 30, 31],
  "Sentence Structure number matches must remain in natural numeric order"
);

const flashNumericSubset = [
  "flash:ielts/writing/task-2/advantage-and-disadvantage/EdmundBd9AdDisAd-Q2",
  "flash:ielts/writing/task-2/discuss-both-views-your-opinion/EdmundBd9ExpBth-Q12",
  "flash:ielts/writing/task-2/direct-question/EdmundBd9Dir-Q20"
].map((id) => HOMEWORK_RESOURCE_CATALOG.find((resource) => resource.id === id));
assert.ok(flashNumericSubset.every(Boolean), "real Flashcard Q2/Q12/Q20 fixtures must stay indexed");
assert.deepEqual(
  filterHomeworkResources(flashNumericSubset, "flashcards", "2").items.map((resource) => resource.ordinal),
  [2, 12, 20],
  "real Flashcard question numbers must use natural numeric ordering"
);

const writingNumericSubset = [2, 12, 20].map((ordinal) => HOMEWORK_RESOURCE_CATALOG.find(
  (resource) => resource.id === `fill:model-essay-${ordinal}-ielts-advantage-disadvantage`
));
assert.ok(writingNumericSubset.every(Boolean), "real Model Essay 2/12/20 fixtures must stay indexed");
assert.deepEqual(
  filterHomeworkResources(writingNumericSubset, "fill-blanks", "2").items.map((resource) => resource.ordinal),
  [2, 12, 20],
  "real writing exercise numbers must use natural numeric ordering"
);

const speakingNumericSubset = [
  "speaking:ielts-part-2-book-1-exercise-02",
  "speaking:ielts-part-2-book-1-exercise-03"
].map((id) => HOMEWORK_RESOURCE_CATALOG.find((resource) => resource.id === id));
assert.ok(speakingNumericSubset.every(Boolean), "real Speaking Exercise 2/3 fixtures must stay indexed");
assert.deepEqual(
  filterHomeworkResources(speakingNumericSubset, "speaking", "2").items.map((resource) => resource.ordinal),
  [2, 3],
  "Speaking Exercise 2 must rank before an incidental Part 2 match"
);

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
assert.match(scheduleJs, /HOMEWORK_CATALOG_URL = "\.\/homework-resource-catalog\.mjs\?v=20260801-1"/, "Homework catalog cache key is stale");
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
