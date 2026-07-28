import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDirectory, "..");
const outputArgument = process.argv.indexOf("--output");
const outputPath = outputArgument >= 0 && process.argv[outputArgument + 1]
  ? path.resolve(process.cwd(), process.argv[outputArgument + 1])
  : path.join(root, "homework-resource-catalog.mjs");

const context = () => {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  return sandbox;
};

async function evaluateFiles(files) {
  const sandbox = context();
  for (const file of files) {
    const source = await readFile(path.join(root, file), "utf8");
    vm.runInContext(source, sandbox, { filename: file, timeout: 20_000 });
  }
  return sandbox.window;
}

async function portalDataFiles(htmlFile, pattern) {
  const html = await readFile(path.join(root, htmlFile), "utf8");
  const sources = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => match[1].split("?", 1)[0])
    .filter((source) => !source.includes("://") && pattern.test(source));
  return [...new Set(sources)];
}

function humanizeDeckId(deckId) {
  const preserved = new Map([
    ["dse", "DSE"],
    ["ielts", "IELTS"],
    ["hkpf", "HKPF"],
    ["toeic", "TOEIC"],
    ["toefl", "TOEFL"],
    ["pte", "PTE"],
    ["q", "Question"]
  ]);
  return String(deckId || "")
    .split("/")
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      if (preserved.has(lower)) return preserved.get(lower);
      if (/^q\d+$/i.test(part)) return part.toUpperCase();
      if (/^\d{4}$/.test(part) || /^\d+(?:\.\d+)*$/.test(part)) return part;
      return part.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    })
    .join(" / ");
}

function compactText(value, limit = 180) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function numericMatch(value, patterns) {
  for (const pattern of patterns) {
    const match = String(value || "").match(pattern);
    const number = Number(match?.[1]);
    if (Number.isSafeInteger(number) && number >= 0) return number;
  }
  return null;
}

function flashcardOrdinal(deckId) {
  const lastSegment = String(deckId || "").split("/").filter(Boolean).at(-1) || "";
  return numericMatch(lastSegment, [
    /(?:^|[-_ ])q(?:uestion)?[-_ ]?(\d+)(?:\D|$)/i,
    /(?:^|[-_ ])practice[-_ ]?(\d+)(?:\D|$)/i,
    /(?:^|[-_ ])exercise[-_ ]?(\d+)(?:\D|$)/i,
    /(?:^|[-_ ])model[-_ ]?essay[-_ ]?(\d+)(?:\D|$)/i,
    /(?:^|\D)(\d{4})(?:\D|$)/,
    /(?:^|\D)(\d+)(?:\D|$)/
  ]);
}

function writingOrdinal(exercise) {
  return numericMatch(exercise?.id, [
    /(?:^|-)model-essay-(\d+)(?:-|$)/i,
    /(?:^|-)q(?:uestion)?-?(\d+)(?:-|$)/i,
    /(?:^|-)exercise-?(\d+)(?:-|$)/i,
    /(?:^|-)composition-?(\d+)(?:-|$)/i,
    /(?:^|\D)(\d{4})(?:\D|$)/,
    /(?:^|\D)(\d+)(?:\D|$)/
  ]);
}

async function flashcardResources(allFiles) {
  const html = await readFile(path.join(root, "flashcards.html"), "utf8");
  const assignmentStart = html.indexOf("window.EDMUND_FLASHCARD_SEED = {");
  const assignmentEnd = html.indexOf("\n  </script>", assignmentStart);
  if (assignmentStart < 0 || assignmentEnd < 0) throw new Error("Could not locate the inline flashcard seed");

  const sandbox = context();
  vm.runInContext(html.slice(assignmentStart, assignmentEnd), sandbox, {
    filename: "flashcards.html#EDMUND_FLASHCARD_SEED",
    timeout: 20_000
  });
  const dataFiles = allFiles
    .filter((file) => /^flashcards-.*-data\.js$/.test(file))
    .sort();
  for (const file of dataFiles) {
    const source = await readFile(path.join(root, file), "utf8");
    vm.runInContext(source, sandbox, { filename: file, timeout: 20_000 });
  }

  const taskTwoTitles = new Map();
  Object.entries(sandbox.window.EDMUND_IELTS_WRITING_TASK2 || {}).forEach(([type, rows]) => {
    (Array.isArray(rows) ? rows : []).forEach((row) => {
      if (!row?.ref || !row?.question) return;
      taskTwoTitles.set(`ielts/writing/task-2/${type}/${row.ref}`, compactText(row.question, 180));
    });
  });
  const readingTitles = sandbox.window.EDMUND_IELTS_READING_PASSAGE_1_TITLES || {};

  return Object.entries(sandbox.window.EDMUND_FLASHCARD_SEED || {})
    .filter(([, cards]) => Array.isArray(cards) && cards.length > 0)
    .map(([deckId, cards]) => {
      const readingPractice = deckId.match(/^ielts\/reading\/passage-1\/(Practice \d+)$/)?.[1];
      const exactTitle = taskTwoTitles.get(deckId)
        || (readingPractice && readingTitles[readingPractice]
          ? `IELTS / Reading / Passage 1 / ${readingPractice} — ${readingTitles[readingPractice]}`
          : "");
      return {
        id: `flash:${deckId}`,
        type: "flashcards",
        ordinal: flashcardOrdinal(deckId),
        label: exactTitle || humanizeDeckId(deckId),
        detail: `${humanizeDeckId(deckId)} · ${cards.length} cards`,
        url: `flashcards.html?deck=${encodeURIComponent(deckId)}`
      };
    });
}

async function writingResources() {
  const files = await portalDataFiles("writing-practice.html", /^writing-practice-.*-data\.js$/);
  const globals = await evaluateFiles(files);
  const exercises = new Map();
  for (const value of Object.values(globals)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    for (const exercise of Object.values(value)) {
      if (!exercise?.id || !exercise?.title) continue;
      exercises.set(String(exercise.id), exercise);
    }
  }
  return [...exercises.values()].map((exercise) => ({
    id: `fill:${exercise.id}`,
    type: "fill-blanks",
    ordinal: writingOrdinal(exercise),
    label: compactText(exercise.title),
    detail: compactText([exercise.exam, exercise.taskType].filter(Boolean).join(" · "), 140),
    url: `writing-practice.html?exercise=${encodeURIComponent(exercise.id)}`
  }));
}

async function speakingResources() {
  const files = await portalDataFiles("speaking-system.html", /^speaking-system(?:-.*)?-data\.js$/);
  const globals = await evaluateFiles(files);
  const applicationSource = await readFile(path.join(root, "speaking-system.js"), "utf8");
  const configuredLimits = applicationSource.match(/const\s+VISIBLE_BOOK_LIMITS\s*=\s*({[^;]+})\s*;/)?.[1];
  const visibleBookLimits = configuredLimits
    ? vm.runInNewContext(`(${configuredLimits})`, Object.create(null), { timeout: 1_000 })
    : {};
  const exercises = [];
  for (const value of Object.values(globals)) {
    if (!Array.isArray(value?.books)) continue;
    for (const book of value.books) {
      const part = Number(book?.part || value?.metadata?.part || 0);
      const bookNumber = Number(book?.book || 0);
      const visibleBookLimit = Number(visibleBookLimits[part] || Number.POSITIVE_INFINITY);
      if (!part || !bookNumber || bookNumber > visibleBookLimit) continue;
      for (const exercise of Array.isArray(book?.exercises) ? book.exercises : []) {
        if (!exercise?.id) continue;
        exercises.push({
          id: `speaking:${exercise.id}`,
          type: "speaking",
          ordinal: Number(exercise.index || 0) || null,
          label: compactText(exercise.title || exercise.topic || `Exercise ${exercise.index || ""}`),
          detail: `IELTS Speaking · Part ${part} · Book ${bookNumber} · Exercise ${Number(exercise.index || 0) || "—"}`,
          url: `speaking-system.html?exercise=${encodeURIComponent(exercise.id)}`
        });
      }
    }
  }
  return exercises;
}

async function sentenceResources() {
  const files = await portalDataFiles("sentence-structure.html", /^sentence-structure(?:-.*)?(?:data|lessons[^/]*)\.js$/);
  const globals = await evaluateFiles(files);
  return (globals.EDMUND_SENTENCE_STRUCTURE_DATA?.lessons || []).map((lesson, index) => {
    const ordinal = index + 1;
    if (String(lesson.id || "") !== `ss${ordinal}`) {
      throw new Error(`Sentence Structure lesson numbering mismatch at option #${ordinal}: ${lesson.id || "missing id"}`);
    }
    const title = compactText(lesson.titleZh || lesson.title || lesson.titleEn || `Sentence Structure ${ordinal}`);
    const detail = compactText(lesson.titleEn || title, 140);
    return {
      id: `sentence:${lesson.id}`,
      type: "sentence-structure",
      ordinal,
      label: `#${ordinal} · ${title}`,
      detail: `Sentence Structure #${ordinal} · ${detail}`,
      url: `sentence-structure.html?lesson=${encodeURIComponent(lesson.id)}`
    };
  });
}

const allFiles = await readdir(root);
const resources = [
  ...await flashcardResources(allFiles),
  ...await writingResources(),
  ...await speakingResources(),
  ...await sentenceResources()
]
  .sort((left, right) => left.type.localeCompare(right.type) || left.label.localeCompare(right.label, "en", { numeric: true }));

const ids = new Set();
for (const resource of resources) {
  if (ids.has(resource.id)) throw new Error(`Duplicate homework resource id: ${resource.id}`);
  ids.add(resource.id);
}

const generated = `// Generated by tools/generate-homework-resource-catalog.mjs. Do not edit by hand.\n` +
  `export const HOMEWORK_RESOURCE_CATALOG = Object.freeze(${JSON.stringify(resources, null, 2)}.map((resource) => Object.freeze(resource)));\n`;
await writeFile(outputPath, generated, "utf8");
console.log(`Wrote ${resources.length} homework resources to ${path.relative(process.cwd(), outputPath) || outputPath}`);
