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

function straightApostrophes(value) {
  return String(value || "").replaceAll("’", "'");
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

function writingSectionKey(exercise) {
  const id = String(exercise?.id || "").toLowerCase();
  const exam = String(exercise?.exam || "").toLowerCase();
  if (id.startsWith("dse-") || /\bdse\b/.test(exam)) return "dse-writing";
  if (id.startsWith("hkpf-") || /civil servant|government|hkpf/.test(exam)) return "government-writing";
  if (/\bielts\b/.test(exam) || id.includes("ielts")) return "ielts-writing";
  if (/\btoeic\b/.test(exam) || id.includes("toeic")) return "toeic-writing";
  if (/\btoefl\b/.test(exam) || id.includes("toefl")) return "toefl-writing";
  if (/\bpte\b/.test(exam) || id.includes("pte")) return "pte-writing";
  return "";
}

function writingQuestionPrompt(exercise) {
  const prompt = Array.isArray(exercise?.questionPrompt)
    ? exercise.questionPrompt
    : exercise?.questionPrompt
      ? [exercise.questionPrompt]
      : [];
  return prompt.map((line) => String(line || "").trim()).filter(Boolean);
}

function writingQuestionImages(exercise) {
  const images = Array.isArray(exercise?.questionImages) ? exercise.questionImages : [];
  return images.map((image) => {
    if (typeof image === "string") return { src: String(image).trim(), alt: "" };
    return {
      src: String(image?.src || "").trim(),
      alt: compactText(image?.alt || "", 240)
    };
  }).filter((image) => image.src);
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
  const readingTitlesByPassage = new Map([
    ["1", { "Practice 1": "Andrea Palladio - Italian Architect", ...(sandbox.window.EDMUND_IELTS_READING_PASSAGE_1_TITLES || {}) }],
    ["2", { "Practice 1": "Such a Fascinating Game", ...(sandbox.window.EDMUND_IELTS_READING_PASSAGE_2_TITLES || {}) }],
    ["3", { "Practice 1": "ARE WE MANAGING TO DESTROY SCIENCE?", ...(sandbox.window.EDMUND_IELTS_READING_PASSAGE_3_TITLES || {}) }]
  ]);
  const civicsBookOneTitles = new Map([
    ["government/concept-vocabulary/book-1/a-core-policy-group-discussion", "A. Core Policy & Group Discussion 政策及小組討論"],
    ["government/concept-vocabulary/book-1/b-housing-living-conditions", "B. Housing & Living Conditions 房屋及居住環境"],
    ["government/concept-vocabulary/book-1/c-healthcare-mental-health", "C. Healthcare & Mental Health 醫療及精神健康"],
    ["government/concept-vocabulary/book-1/d-elderly-people-carers", "D. Elderly People & Carers 長者及照顧者"],
    ["government/concept-vocabulary/book-1/e-families-children-working-parents", "E. Families, Children & Working Parents 家庭、兒童及在職父母"],
    ["government/concept-vocabulary/book-1/f-jobs-wages-employment", "F. Jobs, Wages & Employment 就業、工資及勞工"],
    ["government/concept-vocabulary/book-1/g-education-young-people", "G. Education & Young People 教育及青年"],
    ["government/concept-vocabulary/book-1/h-transport-getting-around", "H. Transport & Getting Around 交通及市民出行"],
    ["government/concept-vocabulary/book-1/i-welfare-poverty-helping-people-in-need", "I. Welfare, Poverty & Helping People in Need 社會福利、扶貧及支援有需要人士"],
    ["government/concept-vocabulary/book-1/j-cost-of-living-peoples-financial-burden", "J. Cost of Living & People's Financial Burden 生活成本及市民經濟負擔"],
    ["government/concept-vocabulary/book-1/k-environment-everyday-green-living", "K. Environment & Everyday Green Living 環境及日常綠色生活"],
    ["government/concept-vocabulary/book-1/l-scams-online-safety-technology", "L. Scams, Online Safety & Technology 騙案、網絡安全及科技"]
  ]);

  return Object.entries(sandbox.window.EDMUND_FLASHCARD_SEED || {})
    .filter(([, cards]) => Array.isArray(cards) && cards.length > 0)
    .map(([deckId, cards]) => {
      const readingMatch = deckId.match(/^ielts\/reading\/passage-([123])\/(Practice \d+)$/);
      const readingPassage = readingMatch?.[1] || "";
      const readingPractice = readingMatch?.[2] || "";
      const readingTitle = readingTitlesByPassage.get(readingPassage)?.[readingPractice] || "";
      const exactTitle = civicsBookOneTitles.get(deckId)
        || taskTwoTitles.get(deckId)
        || (readingPractice && readingTitle
          ? `IELTS / Reading / Passage ${readingPassage} / ${readingPractice} — ${readingTitle}`
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
    url: `writing-practice.html?exercise=${encodeURIComponent(exercise.id)}`,
    sectionKey: writingSectionKey(exercise),
    questionPrompt: writingQuestionPrompt(exercise),
    questionImages: writingQuestionImages(exercise)
  }));
}

function writingSubmissionResources() {
  return [{
    id: "writing-submission:portal",
    type: "writing-submission",
    ordinal: 1,
    label: "Edmund Sir Writing 交文系統",
    detail: "Writing Submission · 寫作交文",
    url: "writing-submission.html"
  }];
}

async function dseWritingPartADownloadResources() {
  const globals = await evaluateFiles(["dse-writing-part-a-downloads.js"]);
  const items = Array.isArray(globals.EDMUND_DSE_WRITING_PART_A_DOWNLOADS)
    ? globals.EDMUND_DSE_WRITING_PART_A_DOWNLOADS
    : [];
  if (!items.length) throw new Error("DSE Writing Part A download catalogue is empty");
  return items.map((item) => {
    const year = Number(item?.year || item?.number || 0);
    if (!Number.isSafeInteger(year) || year < 2012 || year > 2100 || !item?.id) {
      throw new Error(`Invalid DSE Writing Part A download item: ${JSON.stringify(item)}`);
    }
    return {
      id: `download:dse-writing-part-a:${item.id}`,
      type: "model-essay-download",
      ordinal: year,
      label: `DSE Writing Part A Download - ${year} 5** Model Answer`,
      detail: `DSE Writing Part A · ${year} · PDF Model Answer`,
      url: `model-essay-downloads.html?catalog=dse-writing-part-a&item=${encodeURIComponent(item.id)}`
    };
  });
}

async function readingAnalysisResources() {
  const globals = await evaluateFiles([
    "ielts-reading-analysis-index.js",
    "ielts-reading-analysis-availability.js"
  ]);
  const index = globals.EDMUND_IELTS_READING_ANALYSIS_INDEX;
  const availability = globals.EDMUND_IELTS_READING_ANALYSIS_AVAILABILITY;
  const indexRecords = Object.values(index?.passages || {}).flat();
  const indexById = new Map(indexRecords.map((record) => [String(record?.id || ""), record]));
  const articles = Object.entries(availability?.articles || {});

  if (!articles.length) throw new Error("IELTS Reading analysis availability index is empty");

  return articles.map(([articleId, article]) => {
    if (String(article?.id || "") !== articleId) {
      throw new Error(`IELTS Reading analysis id mismatch: key=${articleId}, value=${article?.id || "missing"}`);
    }
    const catalogueIds = Array.isArray(article?.catalogueIds)
      ? article.catalogueIds.map(String)
      : article?.catalogueId
        ? [String(article.catalogueId)]
        : [];
    if (!catalogueIds.length) {
      throw new Error(`IELTS Reading analysis has no catalogue id: ${articleId}`);
    }
    const catalogueRecords = catalogueIds.map((catalogueId) => {
      const record = indexById.get(catalogueId);
      if (!record) throw new Error(`IELTS Reading analysis catalogue id is missing from the index: ${catalogueId}`);
      if (Number(record.passage) !== Number(article.passage)) {
        throw new Error(`IELTS Reading analysis passage mismatch for ${articleId}: ${catalogueId}`);
      }
      return record;
    }).sort((left, right) => Number(left.sourceOrder || 0) - Number(right.sourceOrder || 0));
    const normalizedTitles = new Set(catalogueRecords.map((record) => straightApostrophes(compactText(record.title))));
    if (normalizedTitles.size !== 1) {
      throw new Error(`IELTS Reading analysis aliases have different titles: ${articleId}`);
    }
    const primary = catalogueRecords[0];
    const title = [...normalizedTitles][0];
    return {
      id: `reading-analysis:${articleId}`,
      type: "reading-analysis",
      ordinal: Number(primary.sourceOrder) || null,
      label: `Answer Analysis - IELTS Reading - ${title}`,
      detail: `IELTS Reading · Passage ${Number(article.passage)} · Answer Analysis`,
      url: `ielts-reading-analysis.html?article=${encodeURIComponent(articleId)}`
    };
  });
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

async function commonExpressionResources() {
  const globals = await evaluateFiles([
    "common-expression-system-data.js",
    "common-expression-system-imported-data.js"
  ]);
  const systems = Object.values(globals.EDMUND_COMMON_EXPRESSION_DATA?.systems || {});
  if (!systems.length) throw new Error("Common Expression system catalogue is empty");

  return systems.flatMap((system) => {
    const lessons = Array.isArray(system?.lessons) ? system.lessons : [];
    return lessons.map((lesson, index) => {
      const ordinal = index + 1;
      if (Number(lesson?.order) !== ordinal || !lesson?.id) {
        throw new Error(`Common Expression lesson order mismatch: ${system?.key || "unknown"} #${ordinal}`);
      }
      return {
        id: `common-expression:${system.key}:${lesson.id}`,
        type: "common-expression",
        ordinal,
        label: `Common Expression - ${compactText(system.titleZh)} ${compactText(system.titleEn)} - #${ordinal} · ${compactText(lesson.titleEn || lesson.titleZh)}`,
        detail: `${compactText(system.titleZh)} ${compactText(system.titleEn)} · ${compactText(lesson.titleZh || lesson.titleEn, 120)}`,
        url: `${system.href}?lesson=${encodeURIComponent(lesson.id)}`
      };
    });
  });
}

async function listeningResources() {
  const globals = await evaluateFiles(["listening-system-catalog.js"]);
  const practices = Array.isArray(globals.EDMUND_LISTENING_CATALOG?.practices)
    ? globals.EDMUND_LISTENING_CATALOG.practices
    : [];
  if (practices.length !== 20) throw new Error(`IELTS Listening catalogue should contain 20 practices, found ${practices.length}`);

  return practices.flatMap((practice, practiceIndex) => {
    const practiceNumber = practiceIndex + 1;
    if (Number(practice?.practice) !== practiceNumber || !Array.isArray(practice?.parts) || practice.parts.length !== 4) {
      throw new Error(`Invalid IELTS Listening Practice ${practiceNumber} catalogue record`);
    }
    return practice.parts.map((part, partIndex) => {
      const partNumber = partIndex + 1;
      if (Number(part?.part) !== partNumber || !part?.id) {
        throw new Error(`Invalid IELTS Listening Practice ${practiceNumber} Part ${partNumber} catalogue record`);
      }
      return {
        id: `listening:${part.id}`,
        type: "listening",
        ordinal: practiceNumber,
        label: `IELTS Listening Practice ${practiceNumber} - Part ${partNumber}`,
        detail: `IELTS Listening · Practice ${practiceNumber} · Part ${partNumber}`,
        url: `listening-system.html?section=ielts&practice=${practiceNumber}&part=${partNumber}`
      };
    });
  });
}

async function learningPortalResources() {
  const globals = await evaluateFiles(["learning-portal-config.js"]);
  const resources = globals.EDMUND_HOMEWORK_RESOURCES;
  if (!Array.isArray(resources) || resources.length !== 18) {
    throw new Error(`Learning portal catalogue should contain 18 portals, found ${resources?.length || 0}`);
  }
  return resources.map((resource) => ({ ...resource }));
}

async function registeredProviderResources(allFiles) {
  const files = allFiles.filter((file) => /(?:^|-)homework-resources\.js$/i.test(file)).sort();
  const resources = [];
  for (const file of files) {
    const globals = await evaluateFiles([file]);
    const provided = globals.EDMUND_HOMEWORK_RESOURCES;
    if (!Array.isArray(provided)) {
      throw new Error(`${file} must assign an array to window.EDMUND_HOMEWORK_RESOURCES`);
    }
    for (const resource of provided) {
      if (!resource?.id || !resource?.type || !resource?.label || !resource?.url) {
        throw new Error(`${file} contains an incomplete homework resource`);
      }
      resources.push({ ...resource });
    }
  }
  return resources;
}

async function orderedLessonResources({ file, globalName, type, idPrefix, systemLabel, page }) {
  const globals = await evaluateFiles([file]);
  const data = globals[globalName];
  const lessons = Array.isArray(data?.lessons) ? data.lessons : [];
  if (Number(data?.lessonCount) !== lessons.length) {
    throw new Error(`${systemLabel} lesson count mismatch: metadata=${data?.lessonCount || 0}, lessons=${lessons.length}`);
  }
  return lessons.map((lesson, index) => {
    const ordinal = index + 1;
    if (Number(lesson?.order) !== ordinal) {
      throw new Error(`${systemLabel} lesson order mismatch at option #${ordinal}: ${lesson?.order || "missing order"}`);
    }
    const expectedId = `${idPrefix}-${String(ordinal).padStart(2, "0")}`;
    if (String(lesson?.id || "") !== expectedId) {
      throw new Error(`${systemLabel} lesson id mismatch at option #${ordinal}: ${lesson?.id || "missing id"}`);
    }
    const titleZh = compactText(lesson.titleZh || lesson.title || lesson.titleEn || `${systemLabel} ${ordinal}`);
    const titleEn = compactText(lesson.titleEn || lesson.title || titleZh, 140);
    return {
      id: `${type}:${lesson.id}`,
      type,
      ordinal,
      label: `#${ordinal} · ${titleZh}`,
      detail: `${systemLabel} #${ordinal} · ${titleEn}`,
      url: `${page}?lesson=${encodeURIComponent(lesson.id)}`
    };
  });
}

const allFiles = await readdir(root);
const resources = [
  ...await flashcardResources(allFiles),
  ...await writingResources(),
  ...writingSubmissionResources(),
  ...await dseWritingPartADownloadResources(),
  ...await readingAnalysisResources(),
  ...await speakingResources(),
  ...await sentenceResources(),
  ...await commonExpressionResources(),
  ...await listeningResources(),
  ...await learningPortalResources(),
  ...await orderedLessonResources({
    file: "idiom-system-data.js",
    globalName: "EDMUND_IDIOM_SYSTEM_DATA",
    type: "idiom",
    idPrefix: "idiom",
    systemLabel: "Idiom",
    page: "idiom-system.html"
  }),
  ...await orderedLessonResources({
    file: "proverb-system-data.js",
    globalName: "EDMUND_PROVERB_SYSTEM_DATA",
    type: "proverb",
    idPrefix: "proverb",
    systemLabel: "Proverb",
    page: "proverb-system.html"
  }),
  ...await orderedLessonResources({
    file: "phrasal-verb-system-data.js",
    globalName: "EDMUND_PHRASAL_VERB_SYSTEM_DATA",
    type: "phrasal-verb",
    idPrefix: "phrasal-verb",
    systemLabel: "Phrasal Verb",
    page: "phrasal-verb-system.html"
  }),
  ...await registeredProviderResources(allFiles)
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
