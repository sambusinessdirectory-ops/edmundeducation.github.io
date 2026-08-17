import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";
import { HOMEWORK_RESOURCE_CATALOG } from "../homework-resource-catalog.mjs";
import {
  HOMEWORK_ENTRY_TAGS,
  MAX_HOMEWORK_RESOURCES,
  SCHEDULE_MESSAGE_MAX_LENGTH,
  acceptHomeworkAutocomplete,
  filterHomeworkResources,
  fullHomeworkTriggerAtCursor,
  homeworkAutocomplete,
  homeworkResourceDisplayTitle,
  insertHomeworkResourceTitle,
  normalizeHomeworkResource,
  parseScheduleMessage,
  serializeScheduleMessage
} from "../schedule-homework-links.mjs";

const execFileAsync = promisify(execFile);
const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDirectory, "..");
const read = (file) => readFile(path.join(root, file), "utf8");

const readingAnalysisContext = { window: {} };
vm.createContext(readingAnalysisContext);
for (const file of ["ielts-reading-analysis-index.js", "ielts-reading-analysis-availability.js"]) {
  vm.runInContext(await read(file), readingAnalysisContext, { filename: file, timeout: 20_000 });
}
const readingAnalysisIndex = readingAnalysisContext.window.EDMUND_IELTS_READING_ANALYSIS_INDEX;
const readingAnalysisAvailability = readingAnalysisContext.window.EDMUND_IELTS_READING_ANALYSIS_AVAILABILITY;
const readingIndexById = new Map(
  Object.values(readingAnalysisIndex.passages).flat().map((record) => [record.id, record])
);
const straightApostrophes = (value) => String(value || "").replaceAll("’", "'");

const ids = new Set(HOMEWORK_RESOURCE_CATALOG.map((resource) => resource.id));
assert.equal(ids.size, HOMEWORK_RESOURCE_CATALOG.length, "catalog ids must be unique");
assert.equal(HOMEWORK_RESOURCE_CATALOG.length, 4841, "the Homework/Schedule catalogue should include every current learning resource, downloadable file, Common Expression lesson, IELTS Listening part and learning portal");
const byType = HOMEWORK_RESOURCE_CATALOG.reduce((groups, resource) => {
  (groups[resource.type] ||= []).push(resource);
  return groups;
}, {});
assert.equal((byType.flashcards || []).length, 1301, "all current static and lazy-loaded flashcard leaf decks should be indexed");
assert.equal((byType["fill-blanks"] || []).length, 320, "all current writing exercises should be indexed");
assert.equal((byType.speaking || []).length, 787, "all currently visible speaking exercises should be indexed");
assert.equal((byType["sentence-structure"] || []).length, 345, "all sentence structure lessons should be indexed");
assert.equal((byType.idiom || []).length, 138, "all Idiom lessons should be indexed");
assert.equal((byType.proverb || []).length, 3, "all Proverb lessons should be indexed");
assert.equal((byType["phrasal-verb"] || []).length, 329, "all Phrasal Verb lessons should be indexed");
assert.equal((byType["writing-submission"] || []).length, 320, "every Writing Practice exercise should have a Writing Submission assignment link");
assert.equal((byType["reading-analysis"] || []).length, 157, "all unique available IELTS Reading analyses should be indexed once");
assert.equal((byType["model-essay-download"] || []).length, 14, "all DSE Writing Part A model-answer downloads should be indexed");
assert.equal((byType["download-material"] || []).length, 857, "every item in the DSE/IELTS download portal should be indexed");
assert.equal((byType["common-expression"] || []).length, 172, "all six Common Expression catalogues should be indexed");
assert.equal((byType.listening || []).length, 80, "all 20 IELTS Listening practices and four parts should be indexed");
assert.equal((byType["learning-portal"] || []).length, 18, "all new learning portals should be available for Homework/Schedule linking");
const writingPracticeAssignments = new Map((byType["writing-submission"] || []).map((resource) => [
  resource.id.slice("writing-submission:".length),
  resource
]));
for (const exercise of byType["fill-blanks"] || []) {
  const exerciseId = exercise.id.slice("fill:".length);
  const assignment = writingPracticeAssignments.get(exerciseId);
  assert.ok(assignment, `Writing Submission assignment should exist for ${exerciseId}`);
  assert.equal(assignment.label, exercise.label, `Writing Submission should preserve the exercise title: ${exerciseId}`);
  assert.equal(assignment.sectionKey, exercise.sectionKey, `Writing Submission should preserve the exercise hierarchy: ${exerciseId}`);
  assert.deepEqual(assignment.questionPrompt, exercise.questionPrompt, `Writing Submission should preserve the writing prompt: ${exerciseId}`);
  assert.deepEqual(assignment.questionImages, exercise.questionImages, `Writing Submission should preserve prompt images: ${exerciseId}`);
  assert.equal(
    assignment.url,
    `writing-submission.html?exercise=${encodeURIComponent(exerciseId)}`,
    `Writing Submission should open the exact exercise: ${exerciseId}`
  );
}
assert.ok(ids.has("flash:ielts/writing/task-2/advantage-and-disadvantage/EdmundBd9AdDisAd-Q2"));
assert.ok(ids.has("fill:model-essay-2-ielts-advantage-disadvantage"));
assert.ok(ids.has("speaking:ielts-part-2-book-1-exercise-01"));
assert.ok(ids.has("sentence:ss345"));
assert.ok(ids.has("idiom:idiom-138"));
assert.ok(ids.has("proverb:proverb-03"));
assert.ok(ids.has("phrasal-verb:phrasal-verb-329"));
assert.ok(ids.has("writing-submission:model-essay-2-ielts-advantage-disadvantage"));
assert.ok(ids.has("fill:business-english-standard-response-book-1-q1"));
assert.ok(ids.has("fill:business-english-standard-response-book-1-q10"));
assert.ok(ids.has("writing-submission:business-english-standard-response-book-1-q1"));
assert.ok(ids.has("writing-submission:business-english-standard-response-book-1-q10"));
assert.ok(ids.has("reading-analysis:mungo-man"));
assert.ok(ids.has("reading-analysis:if-you-can-get-used-to-the-taste"));
assert.ok(ids.has("reading-analysis:p1-082-graffiti"));
assert.ok(ids.has("common-expression:speaking:common-expression-01"));
assert.ok(ids.has("common-expression:written:common-expression-11"));
assert.ok(ids.has("common-expression:speaking:common-expression-31"), "latest Speaking lesson should be linkable from Homework");
assert.ok(ids.has("common-expression:written:common-expression-30"), "latest Written lesson should be linkable from Homework");
assert.ok(ids.has("common-expression:rhetorical-speaking:common-expression-29"), "latest Rhetorical Speaking lesson should be linkable from Homework");
assert.ok(ids.has("common-expression:rhetorical-writing:common-expression-29"), "latest Rhetorical Writing lesson should be linkable from Homework");
assert.ok(ids.has("common-expression:professional-message:common-expression-27"), "latest Professional Message lesson should be linkable from Homework");
assert.ok(ids.has("common-expression:business-speaking:common-expression-26"), "latest Business Speaking lesson should be linkable from Homework");
assert.ok(ids.has("listening:ielts-listening-practice-20-part-4"));
assert.ok(ids.has("learning-portal:quotes"));
assert.ok(ids.has("learning-portal:english-joke-collection"));
assert.ok([...ids].some((id) => id.startsWith("download:dse-writing-part-a:")));
assert.ok([...ids].some((id) => id.startsWith("download-material:dse-writing-part-a:")));
assert.ok([...ids].some((id) => id.startsWith("download-material:task1:")));
assert.ok([...ids].some((id) => id.startsWith("download-material:task2:")));
assert.ok([...ids].some((id) => id.startsWith("download-material:speaking:")));
assert.ok([...ids].some((id) => id.startsWith("download-material:reading-passage-1:")));
assert.ok([...ids].some((id) => id.startsWith("download-material:reading-passage-2:")));
assert.ok([...ids].some((id) => id.startsWith("download-material:reading-passage-3:")));
assert.ok([...ids].some((id) => id.startsWith("download-material:listening:")));

const downloadMaterialsByCatalog = (byType["download-material"] || []).reduce((counts, resource) => {
  const catalog = new URL(resource.url, "https://edmundeducation.com/").searchParams.get("catalog");
  counts[catalog] = (counts[catalog] || 0) + 1;
  return counts;
}, {});
assert.deepEqual(downloadMaterialsByCatalog, {
  "dse-writing-part-a": 14,
  listening: 20,
  "reading-passage-1": 163,
  "reading-passage-2": 149,
  "reading-passage-3": 165,
  speaking: 46,
  task1: 62,
  task2: 238
}, "Download materials should mirror every live catalogue on the authenticated download portal");

const readingAnalysisResources = byType["reading-analysis"] || [];
const expectedReadingArticleIds = Object.keys(readingAnalysisAvailability.articles).sort();
assert.deepEqual(
  readingAnalysisResources.map((resource) => resource.id.slice("reading-analysis:".length)).sort(),
  expectedReadingArticleIds,
  "Homework must contain exactly one resource for every routable IELTS Reading analysis article"
);
const mappedReadingCatalogueIds = new Set();
for (const [articleId, article] of Object.entries(readingAnalysisAvailability.articles)) {
  const catalogueIds = Array.isArray(article.catalogueIds) ? article.catalogueIds : [article.catalogueId];
  const records = catalogueIds.map((catalogueId) => {
    mappedReadingCatalogueIds.add(catalogueId);
    const record = readingIndexById.get(catalogueId);
    assert.ok(record, `reading analysis catalogue record should exist: ${catalogueId}`);
    assert.equal(record.passage, article.passage, `reading analysis passage should match its catalogue record: ${articleId}`);
    return record;
  }).sort((left, right) => left.sourceOrder - right.sourceOrder);
  const resource = readingAnalysisResources.find((item) => item.id === `reading-analysis:${articleId}`);
  assert.ok(resource, `reading analysis Homework resource should exist: ${articleId}`);
  assert.equal(
    resource.label,
    `Answer Analysis - IELTS Reading - ${straightApostrophes(records[0].title)}`,
    `reading analysis Homework label should use the canonical passage name: ${articleId}`
  );
  assert.equal(
    resource.url,
    `ielts-reading-analysis.html?article=${encodeURIComponent(articleId)}`,
    `reading analysis Homework link should open the exact available article: ${articleId}`
  );
  assert.equal(resource.ordinal, records[0].sourceOrder, `reading analysis should retain its first catalogue order: ${articleId}`);
}
assert.equal(mappedReadingCatalogueIds.size, 160, "157 unique analyses should cover all 160 currently available Passage 1 catalogue positions");
for (const unavailableId of ["p1-033", "p1-053", "p1-066", "p1-164"]) {
  assert.equal(mappedReadingCatalogueIds.has(unavailableId), false, `${unavailableId} must stay unavailable until analysis content exists`);
}
assert.equal(
  readingAnalysisResources.find((resource) => resource.id === "reading-analysis:p1-088-its-dynamite")?.label,
  "Answer Analysis - IELTS Reading - It's Dynamite",
  "smart apostrophes in source titles must be normalized for reliable Homework search"
);
assert.equal(
  readingAnalysisResources.filter((resource) => resource.id === "reading-analysis:p1-009-flight-of-the-honeybee").length,
  1,
  "catalogue aliases must not create duplicate Homework choices"
);

const civicsBookOneFlashcards = (byType.flashcards || []).filter((resource) =>
  resource.id.startsWith("flash:government/concept-vocabulary/book-1/")
);
assert.equal(civicsBookOneFlashcards.length, 12, "all 12 Civics Book 1 decks should be indexed");
assert.ok(
  civicsBookOneFlashcards.every((resource) => /[\u3400-\u9fff]/u.test(resource.label)),
  "Civics Book 1 Homework labels should include their Chinese PDF titles"
);
assert.equal(
  civicsBookOneFlashcards.find((resource) => resource.id.endsWith("/a-core-policy-group-discussion"))?.url,
  "flashcards.html?deck=government%2Fconcept-vocabulary%2Fbook-1%2Fa-core-policy-group-discussion",
  "Civics Book 1 Homework links should open the exact flashcard deck"
);

const civicsBookTwoFlashcards = (byType.flashcards || []).filter((resource) =>
  resource.id.startsWith("flash:government/concept-vocabulary/book-2/")
);
assert.equal(civicsBookTwoFlashcards.length, 14, "all 14 Civics Book 2 decks should be indexed");
assert.ok(
  civicsBookTwoFlashcards.every((resource) => /[\u3400-\u9fff]/u.test(resource.label)),
  "Civics Book 2 Homework labels should include their Chinese catalogue titles"
);
assert.equal(
  civicsBookTwoFlashcards.find((resource) => resource.id.endsWith("/n-public-safety-emergency-preparedness-building-safety"))?.url,
  "flashcards.html?deck=government%2Fconcept-vocabulary%2Fbook-2%2Fn-public-safety-emergency-preparedness-building-safety",
  "Civics Book 2 Homework links should open the exact flashcard deck"
);

for (const [type, count, prefix] of [
  ["idiom", 138, "idiom"],
  ["proverb", 3, "proverb"],
  ["phrasal-verb", 329, "phrasal-verb"]
]) {
  assert.deepEqual(
    (byType[type] || []).map((resource) => resource.ordinal),
    Array.from({ length: count }, (_, index) => index + 1),
    `${type} resources should appear in exact lesson order`
  );
  for (let ordinal = 1; ordinal <= count; ordinal += 1) {
    const lessonId = `${prefix}-${String(ordinal).padStart(2, "0")}`;
    const resource = HOMEWORK_RESOURCE_CATALOG.find((item) => item.id === `${type}:${lessonId}`);
    assert.ok(resource, `${type} #${ordinal} should be indexed`);
    assert.match(resource.label, new RegExp(`^#${ordinal} · `), `${type} #${ordinal} should show its order`);
    assert.equal(resource.url, `${type}-system.html?lesson=${lessonId}`, `${type} #${ordinal} should have an exact deep link`);
  }
}

const enrichedWritingTask = HOMEWORK_RESOURCE_CATALOG.find(
  (resource) => resource.id === "fill:model-essay-1-ielts-task1-bar-charts"
);
assert.equal(enrichedWritingTask?.sectionKey, "ielts-writing");
assert.match(enrichedWritingTask?.questionPrompt?.join(" ") || "", /number of households in the US/);
assert.equal(enrichedWritingTask?.questionImages?.[0]?.src, "assets/writing-practice/questions/ielts-task1/model-essay-1-ielts-task1-bar-charts.webp");
assert.equal(
  normalizeHomeworkResource(enrichedWritingTask)?.questionPrompt,
  undefined,
  "large writing prompts and images must never be copied into stored Schedule markers"
);
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
assert.equal(normalizeHomeworkResource({
  id: "idiom:idiom-01",
  type: "idiom",
  label: "Idiom 1",
  url: "idiom-system.html?lesson=idiom-01"
})?.url, "idiom-system.html?lesson=idiom-01");
assert.equal(normalizeHomeworkResource({
  id: "writing-submission:model-essay-2-ielts-advantage-disadvantage",
  type: "writing-submission",
  label: "Model Essay 2 - IELTS - Advantages / Disadvantages",
  url: "writing-submission.html?exercise=model-essay-2-ielts-advantage-disadvantage"
})?.url, "writing-submission.html?exercise=model-essay-2-ielts-advantage-disadvantage");
assert.equal(normalizeHomeworkResource({
  id: "writing-submission:bad",
  type: "writing-submission",
  label: "Unsafe query",
  url: "writing-submission.html?student=someone"
}), null, "Writing Submission must not accept unexpected query parameters");
assert.equal(normalizeHomeworkResource({
  id: "proverb:proverb-01",
  type: "proverb",
  label: "Wrong target",
  url: "idiom-system.html?lesson=idiom-01"
}), null, "resource types must stay bound to their exact portal");
assert.equal(normalizeHomeworkResource({
  id: "reading-analysis:p1-082-graffiti",
  type: "reading-analysis",
  label: "Answer Analysis - IELTS Reading - GRAFFITI",
  url: "ielts-reading-analysis.html?article=p1-082-graffiti"
})?.url, "ielts-reading-analysis.html?article=p1-082-graffiti");
assert.equal(normalizeHomeworkResource({
  id: "common-expression:speaking:common-expression-01",
  type: "common-expression",
  label: "Common Expression - 會話 Speaking - #1 · See you around",
  url: "common-expression-speaking.html?lesson=common-expression-01"
})?.url, "common-expression-speaking.html?lesson=common-expression-01");
assert.equal(normalizeHomeworkResource({
  id: "listening:ielts-listening-practice-20-part-4",
  type: "listening",
  label: "IELTS Listening Practice 20 - Part 4",
  url: "listening-system.html?section=ielts&practice=20&part=4"
})?.url, "listening-system.html?section=ielts&practice=20&part=4");
assert.equal(normalizeHomeworkResource({
  id: "download-material:listening:04c672d5277d8916",
  type: "download-material",
  label: "IELTS Listening · Practice 1",
  url: "model-essay-downloads.html?catalog=listening&item=04c672d5277d8916"
})?.url, "model-essay-downloads.html?catalog=listening&item=04c672d5277d8916");
for (const unsafeDownloadUrl of [
  "model-essay-downloads.html?catalog=unknown&item=04c672d5277d8916",
  "model-essay-downloads.html?catalog=listening&item=not-an-item",
  "model-essay-downloads.html?catalog=listening&item=04c672d5277d8916&student=someone",
  "model-essay-downloads.html?catalog=listening&item=04c672d5277d8916#download",
  "https://evil.example/model-essay-downloads.html?catalog=listening&item=04c672d5277d8916"
]) {
  assert.equal(normalizeHomeworkResource({
    id: "download-material:listening:04c672d5277d8916",
    type: "download-material",
    label: "IELTS Listening · Practice 1",
    url: unsafeDownloadUrl
  }), null, `unsafe Download materials URL must be rejected: ${unsafeDownloadUrl}`);
}
assert.equal(normalizeHomeworkResource({
  id: "download:dse-writing-part-a:04c672d5277d8916",
  type: "model-essay-download",
  label: "Legacy DSE download",
  url: "model-essay-downloads.html?catalog=listening&item=04c672d5277d8916"
}), null, "legacy DSE-only download markers must not be widened to another catalogue");
for (const unsafeListeningUrl of [
  "listening-system.html?section=ielts&practice=0&part=1",
  "listening-system.html?section=ielts&practice=1&part=5",
  "listening-system.html?section=dse&practice=1&part=1",
  "listening-system.html?section=ielts&practice=1&part=1&student=someone",
  "https://evil.example/listening-system.html?section=ielts&practice=1&part=1"
]) {
  assert.equal(normalizeHomeworkResource({
    id: "listening:ielts-listening-practice-1-part-1",
    type: "listening",
    label: "IELTS Listening Practice 1 - Part 1",
    url: unsafeListeningUrl
  }), null, `unsafe IELTS Listening URL must be rejected: ${unsafeListeningUrl}`);
}
for (const unsafeReadingUrl of [
  "flashcards.html?article=p1-082-graffiti",
  "ielts-reading-analysis.html",
  "ielts-reading-analysis.html?article=p1-082-graffiti&student=someone",
  "ielts-reading-analysis.html?article=p1-082-graffiti#q1",
  "https://evil.example/ielts-reading-analysis.html?article=p1-082-graffiti"
]) {
  assert.equal(normalizeHomeworkResource({
    id: "reading-analysis:p1-082-graffiti",
    type: "reading-analysis",
    label: "Answer Analysis - IELTS Reading - GRAFFITI",
    url: unsafeReadingUrl
  }), null, `unsafe IELTS Reading analysis URL must be rejected: ${unsafeReadingUrl}`);
}

const flashCompletion = homeworkAutocomplete("F", 1);
assert.equal(flashCompletion.trigger, "Flash Cards");
assert.equal(flashCompletion.remainder, "lash Cards");
assert.equal(homeworkAutocomplete("Fi", 2).trigger, "Fill in the blanks");
assert.equal(homeworkAutocomplete("Review Se", 9).trigger, "Sentence Structure");
assert.equal(homeworkAutocomplete("Review Id", 9).trigger, "Idiom");
assert.equal(homeworkAutocomplete("Review Ph", 9).trigger, "Phrasal Verbs");
assert.equal(homeworkAutocomplete("Review Pr", 9).trigger, "Proverb");
assert.equal(homeworkAutocomplete("Choose Wr", 9).trigger, "Writing Submission");
assert.equal(homeworkAutocomplete("Choose Su", 9).trigger, "Submission Writing");
assert.equal(homeworkAutocomplete("Add An", 6).trigger, "Answer Analysis - IELTS Reading");
assert.equal(homeworkAutocomplete("Add Co", 6).trigger, "Common Expression");
assert.equal(homeworkAutocomplete("Add IELTS L", 11).trigger, "IELTS Listening");
assert.equal(homeworkAutocomplete("Add Dow", 7).trigger, "Download materials");
assert.equal(fullHomeworkTriggerAtCursor("Download materials", 18).type, "download-material");
const accepted = acceptHomeworkAutocomplete("Please finish Fi", 16, 16, homeworkAutocomplete("Please finish Fi", 16));
assert.equal(accepted.value, "Please finish Fill in the blanks");
assert.equal(fullHomeworkTriggerAtCursor(accepted.value, accepted.cursor).type, "fill-blanks");
assert.equal(fullHomeworkTriggerAtCursor(`${accepted.value} today`, accepted.value.length + 6), null, "continuing prose must dismiss the picker");

const replacedHomeworkTitle = "Please finish Model Essay 2 - IELTS - Advantages / Disadvantages";
assert.deepEqual(
  insertHomeworkResourceTitle(accepted.value, accepted, "Model Essay 2 - IELTS - Advantages / Disadvantages"),
  {
    value: replacedHomeworkTitle,
    cursor: replacedHomeworkTitle.length,
    inserted: true
  },
  "selecting a homework resource should replace the exact accepted trigger with its title"
);
const appendedHomeworkTitle = "Read Chapter 1\n#2 · 快一點／加快動作";
assert.deepEqual(
  insertHomeworkResourceTitle("Read Chapter 1", null, "#2 · 快一點／加快動作"),
  { value: appendedHomeworkTitle, cursor: appendedHomeworkTitle.length, inserted: true },
  "a selection without a live trigger should append its title on a new editable line"
);
assert.equal(
  insertHomeworkResourceTitle("#2 · 快一點／加快動作", null, "#2 · 快一點／加快動作").inserted,
  false,
  "the same standalone title should not be duplicated"
);
assert.equal(
  homeworkResourceDisplayTitle({ type: "idiom", label: "#1 · 開始行動／帶頭開始" }),
  "Idiom - #1 · 開始行動／帶頭開始",
  "the auto-inserted title should include its exact Homework taxonomy type"
);
assert.equal(
  homeworkResourceDisplayTitle({ type: "writing-submission", label: "Model Essay 2" }),
  "Writing Submission - Model Essay 2",
  "Writing Submission choices should identify their assignment type"
);
assert.equal(
  homeworkResourceDisplayTitle({ type: "reading-analysis", label: "Answer Analysis - IELTS Reading - Mungo Man" }),
  "Answer Analysis - IELTS Reading - Mungo Man",
  "a reading analysis label must not receive a duplicate taxonomy prefix"
);

const selected = HOMEWORK_RESOURCE_CATALOG.find((resource) => resource.id === "fill:model-essay-2-ielts-advantage-disadvantage");
const stored = serializeScheduleMessage("Fill in the blanks", [selected]);
assert.match(stored, /\[\[@edmund-homework:v1:/);
const parsed = parseScheduleMessage(stored);
assert.equal(parsed.text, "Fill in the blanks");
assert.equal(parsed.resources.length, 1);
assert.equal(parsed.resources[0].url, "writing-practice.html?exercise=model-essay-2-ielts-advantage-disadvantage");
assert.doesNotMatch(parsed.text, /@edmund-homework/);
assert.equal(parseScheduleMessage("普通舊安排").text, "普通舊安排", "legacy messages must stay unchanged");
assert.deepEqual(
  HOMEWORK_ENTRY_TAGS.map(({ label, color }) => [label, color]),
  [
    ["唔想做...", "#ab12e6"],
    ["我最喜愛功課", "#ff3473"],
    ["老師新加", "#920909"],
    ["Well done!", "#ffd591"],
    ["每15分鐘休息一次", "#a1ff80"],
    ["準備材料", "#32cd32"]
  ],
  "Homework tags must keep the requested labels and exact colours"
);
assert.deepEqual(
  HOMEWORK_ENTRY_TAGS.map(({ key, textColor }) => [key, textColor]),
  [
    ["reluctant", "#ffffff"],
    ["favourite", "#25182b"],
    ["teacher-added", "#ffffff"],
    ["well-done", "#25182b"],
    ["break-15", "#25182b"],
    ["prepare-materials", "#143714"]
  ],
  "dark tag colours must use accessible white label text"
);
const taggedStored = serializeScheduleMessage("Tagged homework", [selected], [
  "老師新加",
  "Well done!",
  "not-a-real-tag",
  "老師新加"
]);
const taggedParsed = parseScheduleMessage(taggedStored);
assert.equal(taggedParsed.text, "Tagged homework");
assert.deepEqual(taggedParsed.tags.map(tag => tag.label), ["老師新加", "Well done!"], "known tags should round-trip uniquely");
assert.deepEqual(
  parseScheduleMessage(serializeScheduleMessage("", [], ["well-done", "teacher-added"])).tags.map(({ key }) => key),
  ["well-done", "teacher-added"],
  "tag-only slots must round-trip in the order selected"
);
assert.deepEqual(
  parseScheduleMessage(serializeScheduleMessage("", [], ["prepare-materials"])).tags.map(({ label, color }) => [label, color]),
  [["準備材料", "#32cd32"]],
  "the lime-green 準備材料 tag must round-trip on a new content-free slot"
);
assert.equal(taggedParsed.resources[0]?.id, selected.id, "tag markers must not disrupt homework resources");
assert.deepEqual(
  parseScheduleMessage("Legacy text\n[[@edmund-homework-tag:v1:unknown]]").tags,
  [],
  "unknown stored tag markers must not become trusted tags"
);
const legacyWritingSubmission = {
  id: "writing-submission:portal",
  type: "writing-submission",
  label: "Edmund Sir Writing 交文系統",
  url: "writing-submission.html"
};
assert.equal(
  normalizeHomeworkResource(legacyWritingSubmission)?.url,
  "writing-submission.html",
  "legacy queryless Writing Submission links must remain valid"
);
const legacyWritingSubmissionStored = serializeScheduleMessage("提交作文", [legacyWritingSubmission]);
assert.equal(
  parseScheduleMessage(legacyWritingSubmissionStored).resources[0]?.url,
  "writing-submission.html",
  "legacy Writing Submission markers must still round-trip as links"
);
for (const unsafeLegacyWritingUrl of [
  "writing-submission.html?student=someone",
  "writing-submission.html?exercise=valid&student=someone",
  "writing-submission.html#draft"
]) {
  assert.equal(normalizeHomeworkResource({ ...legacyWritingSubmission, url: unsafeLegacyWritingUrl }), null);
}
assert.equal(filterHomeworkResources(HOMEWORK_RESOURCE_CATALOG, "speaking", "Part 2 Book 1 Advertisements").total >= 1, true);
assert.equal(filterHomeworkResources(HOMEWORK_RESOURCE_CATALOG, "reading-analysis", "Mungo Man").items[0]?.id, "reading-analysis:mungo-man");
assert.equal(filterHomeworkResources(HOMEWORK_RESOURCE_CATALOG, "reading-analysis", "ielts reading graffiti").items[0]?.id, "reading-analysis:p1-082-graffiti");
assert.equal(filterHomeworkResources(HOMEWORK_RESOURCE_CATALOG, "reading-analysis", "it's dynamite").items[0]?.id, "reading-analysis:p1-088-its-dynamite");
assert.equal(filterHomeworkResources(HOMEWORK_RESOURCE_CATALOG, "reading-analysis", "flight honeybee").total, 1, "shared analysis aliases should remain one searchable choice");
assert.equal(filterHomeworkResources(HOMEWORK_RESOURCE_CATALOG, "common-expression", "See you around").items[0]?.id, "common-expression:speaking:common-expression-01");
assert.equal(filterHomeworkResources(HOMEWORK_RESOURCE_CATALOG, "listening", "20 Part 4").items[0]?.id, "listening:ielts-listening-practice-20-part-4");
assert.equal(
  filterHomeworkResources(HOMEWORK_RESOURCE_CATALOG, "download-material", "reading passage 3 water treatment").items[0]?.url,
  "model-essay-downloads.html?catalog=reading-passage-3&item=bfb889ad9e2ba334",
  "Download materials search should find an exact authenticated download item by catalogue and title"
);
assert.equal(
  filterHomeworkResources(HOMEWORK_RESOURCE_CATALOG, "fill-blanks", "number households annual income 2015").items[0]?.id,
  "fill:model-essay-1-ielts-task1-bar-charts",
  "enriched writing prompts should be searchable without loading every full exercise source"
);

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

const [scheduleHtml, scheduleJs, studentTagsSql, flashcards, writing, speaking, sentence, idiom, proverb, phrasalVerb, workflow] = await Promise.all([
  read("schedule-system.html"),
  read("schedule-system.js"),
  read("supabase-schedule-student-entry-tags.sql"),
  read("flashcards.html"),
  read("writing-practice.html"),
  read("speaking-system.js"),
  read("sentence-structure.js"),
  read("idiom-system.js"),
  read("proverb-system.js"),
  read("phrasal-verb-system.js"),
  read(".github/workflows/pages.yml")
]);
assert.match(scheduleHtml, /data-homework-autocomplete/);
assert.match(scheduleHtml, /data-homework-picker-search/);
assert.match(scheduleHtml, /data-homework-attachments/);
assert.ok(
  scheduleHtml.indexOf("data-entry-tags") < scheduleHtml.indexOf('id="schedule-message"'),
  "multi-select homework tags must be available before a new slot has content"
);
assert.match(scheduleHtml, /\.schedule-slot\.has-entry\.has-entry-tag-wraps::after\s*\{[\s\S]*?--entry-tag-wrap-6/s);
assert.match(scheduleJs, /serializeScheduleMessage\(visibleMessage, state\.editing\.resources, selectedTags\)/);
assert.match(scheduleJs, /input\.type = "checkbox"/);
assert.match(scheduleJs, /input\.id = `schedule-homework-tag-\$\{tag\.key\}`/, "every tag checkbox needs an explicit unique id");
assert.match(scheduleJs, /label\.htmlFor = input\.id/, "clicking the complete coloured tag must toggle its checkbox");
assert.match(scheduleHtml, /\.entry-tag-option:has\(input:checked\)/, "selected tags need an unmistakable visual state");
assert.match(scheduleJs, /state\.editing\.tags\.push\(input\.value\)/, "new tag selections must preserve click order");
assert.match(scheduleJs, /input\.disabled = false/, "student tag controls on protected teacher homework must remain interactive");
assert.match(scheduleJs, /function isStudentTagOnlyEntry\(/, "teacher content protection and student tag editing must be separate states");
assert.match(scheduleJs, /callRpc\("schedule_student_set_entry_tags"/, "student tag-only edits must use the narrow database operation");
assert.match(scheduleJs, /p_tag_keys: selectedTags/, "all selected tags must be persisted together in one request");
assert.match(scheduleJs, /p_entry_id: state\.editing\.entry\.id/);
assert.match(scheduleJs, /p_expected_updated_at: state\.editing\.entry\.updatedAt/);
assert.match(scheduleJs, /!visibleMessage && !selectedTags\.length/, "a tag-only slot must be savable before content is added");
assert.match(scheduleJs, /button\.classList\.add\("has-entry-tag-wraps"\)/);
assert.match(scheduleJs, /button\.style\.setProperty\(`--entry-tag-wrap-\$\{index \+ 1\}`, tag\.color\)/);
assert.match(scheduleJs, /badge\.className = "entry-custom-tag"/, "tag labels must remain readable alongside coloured wraps");
assert.match(scheduleJs, /HOMEWORK_CATALOG_URL = "\.\/homework-resource-catalog\.mjs\?v=20260817-1"/, "Homework catalog cache key is stale");
assert.match(scheduleJs, /schedule-homework-links\.mjs\?v=20260814-1/, "Homework link helper cache key is stale");
assert.match(scheduleJs, /isDownload \? "↓" : "↗"/, "download materials should be visibly presented as downloads to students");
assert.match(scheduleJs, /insertHomeworkResourceTitle\(/, "selected homework titles should be copied into editable slot text");
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
assert.match(studentTagsSql, /create or replace function public\.schedule_student_set_entry_tags\(/);
assert.match(studentTagsSql, /if \(select auth\.uid\(\)\) is null/, "the SECURITY DEFINER endpoint must require a signed-in caller");
assert.match(studentTagsSql, /entry\.student_id = v_student_id/, "a student token must only reach its own entry");
assert.match(studentTagsSql, /if v_entry\.source <> 'admin'/, "the narrow endpoint must not replace normal student-entry editing");
assert.match(studentTagsSql, /public\._schedule_message_with_tags\(v_entry\.message, p_tag_keys\)/, "the database must preserve teacher content and construct trusted tag markers itself");
assert.doesNotMatch(
  studentTagsSql.match(/create or replace function public\.schedule_student_set_entry_tags\([\s\S]*?\)\nreturns jsonb/)?.[0] || "",
  /p_message/,
  "students must never be able to submit replacement teacher content through the tag endpoint"
);
assert.match(studentTagsSql, /p_expected_updated_at is null or v_entry\.updated_at <> p_expected_updated_at/);
assert.match(studentTagsSql, /revoke all on function public\.schedule_student_set_entry_tags[\s\S]*?from public, anon, authenticated/);
assert.match(studentTagsSql, /grant execute on function public\.schedule_student_set_entry_tags[\s\S]*?to authenticated/);
assert.match(flashcards, /URLSearchParams\(window\.location\.search\)\.get\("deck"\)/);
assert.match(writing, /URLSearchParams\(window\.location\.search\)\.get\("exercise"\)/);
assert.match(speaking, /URLSearchParams\(window\.location\.search\)\.get\("exercise"\)/);
assert.match(sentence, /URLSearchParams\(window\.location\.search\)\.get\("lesson"\)/);
assert.match(idiom, /URLSearchParams\(window\.location\.search\)\.get\("lesson"\)/);
assert.match(proverb, /URLSearchParams\(window\.location\.search\)\.get\("lesson"\)/);
assert.match(phrasalVerb, /URLSearchParams\(window\.location\.search\)\.get\("lesson"\)/);
assert.ok(
  workflow.indexOf("node tools/generate-homework-resource-catalog.mjs") < workflow.indexOf("rsync -av"),
  "Pages must refresh the catalog before copying deployment files"
);

console.log(`Schedule homework links verified (${HOMEWORK_RESOURCE_CATALOG.length} resources).`);
