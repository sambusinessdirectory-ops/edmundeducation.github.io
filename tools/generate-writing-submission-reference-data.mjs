import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDirectory, "..");
const outputArgument = process.argv.indexOf("--output");
const outputPath = outputArgument >= 0 && process.argv[outputArgument + 1]
  ? path.resolve(process.cwd(), process.argv[outputArgument + 1])
  : path.join(root, "writing-submission-reference-data.mjs");

function localScriptSources(html, pattern) {
  return [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1].split("?", 1)[0])
    .filter((source) => !source.includes("://") && pattern.test(source));
}

function makeContext(window = {}) {
  const sandbox = { window, URLSearchParams };
  vm.createContext(sandbox);
  return sandbox;
}

async function evaluateFiles(files, sandbox = makeContext()) {
  for (const file of files) {
    const source = await readFile(path.join(root, file), "utf8");
    vm.runInContext(source, sandbox, { filename: file, timeout: 30_000 });
  }
  return sandbox;
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

// Mirrors the text normalization used by getDeckCards() before Flash Cards
// builds its existing English / Chinese PDF list.
function normalizeCardText(value) {
  return String(value || "")
    .replace(/[\u2018\u2019\u02bc\u02bb\uff07]/g, "'")
    .replace(/([A-Za-z])\s+'\s*([A-Za-z])/g, "$1'$2")
    .replace(/([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b/gi, "$1'$2")
    .trim();
}

function compactEssay(exercise) {
  const translations = Array.isArray(exercise?.translation) ? exercise.translation : [];
  const paragraphs = Array.isArray(exercise?.paragraphs) ? exercise.paragraphs : [];
  if (translations.length !== paragraphs.length) {
    throw new Error(
      `Translation/paragraph mismatch for ${exercise?.id || "unknown exercise"}: `
      + `${translations.length}/${paragraphs.length}`
    );
  }
  return paragraphs.map((paragraph, index) => ({
    label: cleanText(paragraph?.label || `Paragraph ${index + 1}`),
    english: cleanText((Array.isArray(paragraph?.sentences) ? paragraph.sentences : [])
      .map((sentence) => (Array.isArray(sentence?.parts) ? sentence.parts : []).map(cleanText).join(""))
      .filter(Boolean)
      .join(" ")),
    chinese: cleanText(translations[index])
  }));
}

const writingHtml = await readFile(path.join(root, "writing-practice.html"), "utf8");
const writingFiles = [...new Set(localScriptSources(
  writingHtml,
  /^writing-practice-.*-data\.js$/
))];
const writingContext = await evaluateFiles(writingFiles);
const writingExercises = new Map();
for (const collection of Object.values(writingContext.window)) {
  if (!collection || typeof collection !== "object" || Array.isArray(collection)) continue;
  for (const exercise of Object.values(collection)) {
    if (!exercise?.id || !exercise?.title) continue;
    writingExercises.set(String(exercise.id), exercise);
  }
}

const portalContext = await evaluateFiles(
  ["essay-portal-links.js"],
  makeContext({ location: { search: "" } })
);
const essayPortals = portalContext.window.EDMUND_ESSAY_PORTALS;
if (!essayPortals) throw new Error("Essay portal mapper did not load");

const flashcardsHtml = await readFile(path.join(root, "flashcards.html"), "utf8");
const seedStart = flashcardsHtml.indexOf("window.EDMUND_FLASHCARD_SEED = {");
const seedEnd = flashcardsHtml.indexOf("\n};\n  </script>", seedStart);
if (seedStart < 0 || seedEnd <= seedStart) throw new Error("Could not locate inline Flash Cards seed");
const flashcardContext = makeContext();
vm.runInContext(
  flashcardsHtml.slice(seedStart, seedEnd + 3),
  flashcardContext,
  { filename: "flashcards.html#EDMUND_FLASHCARD_SEED", timeout: 30_000 }
);
const flashcardFiles = [...new Set(localScriptSources(
  flashcardsHtml,
  /^flashcards-ielts-writing(?:-.*)?-data\.js$/
))];
await evaluateFiles(flashcardFiles, flashcardContext);
const flashcardSeed = flashcardContext.window.EDMUND_FLASHCARD_SEED || {};

const referenceEntries = [];
for (const [exerciseId, exercise] of [...writingExercises].sort(([left], [right]) => left.localeCompare(right, "en", { numeric: true }))) {
  const essayKey = essayPortals.fromWritingExerciseId(exerciseId);
  if (!essayKey || !essayPortals.hasWritingPractice(essayKey)) continue;
  const flashDeckId = essayPortals.flashDeckId(essayKey);
  const flashcards = Array.isArray(flashcardSeed[flashDeckId]) ? flashcardSeed[flashDeckId] : [];
  const vocabulary = flashcards
    .map((card) => ({
      english: normalizeCardText(card?.front || card?.term),
      chinese: normalizeCardText(card?.meaning || card?.back)
    }))
    .filter((card) => card.english);
  if (essayPortals.hasFlashcards(essayKey) !== Boolean(vocabulary.length)) {
    throw new Error(`Flash Cards availability mismatch for ${exerciseId} (${essayKey})`);
  }
  referenceEntries.push([exerciseId, {
    essayKey,
    paragraphs: compactEssay(exercise),
    vocabulary
  }]);
}

const serialized = JSON.stringify(Object.fromEntries(referenceEntries));
const generated = `// Generated by tools/generate-writing-submission-reference-data.mjs. Do not edit by hand.\n`
  + `const referenceData = ${serialized};\n`
  + `for (const reference of Object.values(referenceData)) {\n`
  + `  reference.paragraphs.forEach(Object.freeze);\n`
  + `  reference.vocabulary.forEach(Object.freeze);\n`
  + `  Object.freeze(reference.paragraphs);\n`
  + `  Object.freeze(reference.vocabulary);\n`
  + `  Object.freeze(reference);\n`
  + `}\n`
  + `export const WRITING_SUBMISSION_REFERENCE_DATA = Object.freeze(referenceData);\n`;

await writeFile(outputPath, generated, "utf8");
console.log(
  `Wrote ${referenceEntries.length} writing references to `
  + `${path.relative(process.cwd(), outputPath) || outputPath}`
);
