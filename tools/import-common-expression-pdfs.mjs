#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "tools", "common-expression-import-manifest.json");
const outputPath = path.join(root, "common-expression-system-imported-data.js");
const downloadsDirectory = path.resolve(process.env.COMMON_EXPRESSION_PDF_DIR || "/Users/sammak/Downloads");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const popplerRoot = "/Users/sammak/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin";
const pdftotext = process.env.PDFTOTEXT || path.join(popplerRoot, "pdftotext");
const pdfinfo = process.env.PDFINFO || path.join(popplerRoot, "pdfinfo");

const systemDetails = {
  speaking: {
    level: "A2-B1",
    lessonTypeZh: "日常會話",
    lessonTypeEn: "Everyday conversation"
  },
  written: {
    level: "B1-B2",
    lessonTypeZh: "專業寫作",
    lessonTypeEn: "Professional writing"
  },
  "rhetorical-speaking": {
    level: "B1-B2",
    lessonTypeZh: "修辭會話",
    lessonTypeEn: "Rhetorical speaking"
  },
  "rhetorical-writing": {
    level: "B2-C1",
    lessonTypeZh: "修辭寫作",
    lessonTypeEn: "Rhetorical writing"
  },
  "professional-message": {
    level: "A2-B2",
    lessonTypeZh: "商業溝通",
    lessonTypeEn: "Professional messages"
  },
  "business-speaking": {
    level: "B1-B2",
    lessonTypeZh: "商務會話",
    lessonTypeEn: "Business speaking"
  }
};

function normalizePunctuation(value) {
  return String(value || "")
    .normalize("NFC")
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .replace(/\u00a0/g, " ")
    .replace(/[\u00ad\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g, "")
    .replace(/\*\*/g, "");
}

function normalizedDocument(value) {
  return normalizePunctuation(value)
    .replace(/\r/g, "")
    .replace(/\f/g, "\n\f\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{4,}/g, "\n\n\n");
}

function findExecutable(candidate, label) {
  if (fs.existsSync(candidate)) return candidate;
  throw new Error(`${label} was not found at ${candidate}. Set the corresponding environment variable.`);
}

function extractPdf(filePath) {
  const text = execFileSync(findExecutable(pdftotext, "pdftotext"), ["-layout", filePath, "-"], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024
  });
  const metadata = execFileSync(findExecutable(pdfinfo, "pdfinfo"), [filePath], {
    encoding: "utf8",
    maxBuffer: 2 * 1024 * 1024
  });
  const pageCount = Number(metadata.match(/^Pages:\s+(\d+)$/m)?.[1]);
  if (!Number.isInteger(pageCount) || pageCount < 1) throw new Error(`${filePath}: invalid page count`);
  return { raw: normalizePunctuation(text).replace(/\r/g, ""), text: normalizedDocument(text), pageCount };
}

function matchIndex(text, pattern, fromIndex = 0) {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const matcher = new RegExp(pattern.source, flags);
  matcher.lastIndex = fromIndex;
  const match = matcher.exec(text);
  return match ? { index: match.index, end: matcher.lastIndex, match } : null;
}

function between(text, startPattern, endPattern) {
  const start = matchIndex(text, startPattern);
  if (!start) return "";
  const end = matchIndex(text, endPattern, start.end);
  return text.slice(start.end, end?.index ?? text.length).trim();
}

function after(text, startPattern) {
  const start = matchIndex(text, startPattern);
  return start ? text.slice(start.end).trim() : "";
}

function cleanLine(value) {
  return normalizePunctuation(value)
    .replace(/[［］\[\]]/g, "")
    .replace(/^[●•▪◦]\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isBoilerplate(line) {
  return !line
    || /^\f$/.test(line)
    || /^P\.\d+/i.test(line)
    || /^EXAMPLE(?:\s+\d+)?(?:\s*·\s*例句)?$/i.test(line)
    || /^(?:Original|Target) (?:sentences?|messages?)\s*·/i.test(line)
    || /^(?:Pattern|Examples?|Why useful\??|Traditional Chinese|Correct|Incorrect|Natural|Not natural)\s*:?[：]?$/i.test(line)
    || /^(?:(?:Pattern|Examples?|Meaning|Feeling|Original|Target)\s*(?:句型|例句|意思|感覺|原句|目標句)?\s*)+$/i.test(line)
    || /^\d+$/.test(line);
}

function joinLanguageLines(lines, language) {
  const cleaned = lines.map(cleanLine).filter((line) => !isBoilerplate(line));
  const selected = cleaned.filter((line) => language === "zh" ? /[\u3400-\u9fff]/u.test(line) : /[A-Za-z]/.test(line) && !/[\u3400-\u9fff]/u.test(line));
  const pieces = [];
  const speakerPattern = language === "zh"
    ? /^(?:A|B|客戶|你|同事|經理|顧客|員工|面試官|應徵者)[：:]/
    : /^(?:A|B|Client|You|Colleague|Manager|Customer|Employee|Interviewer|Candidate|Speaker|Staff)\s*:/i;
  for (const line of selected) {
    if (!line) continue;
    if (!pieces.length) pieces.push(line);
    else if (speakerPattern.test(line)) pieces.push(`\n${line}`);
    else pieces.push(` ${line}`);
  }
  return pieces.join("").replace(/\s+([,.;!?])/g, "$1").trim();
}

function splitBilingual(segment) {
  const lines = normalizePunctuation(segment).replace(/\f/g, "\n").split("\n");
  return {
    en: joinLanguageLines(lines, "en"),
    zh: joinLanguageLines(lines, "zh")
  };
}

function parseExamples(text) {
  const section = between(text, /^P\.1 Examples\s*$/im, /^P\.2\s+/im);
  if (!section) return [];
  const markers = [...section.matchAll(/^EXAMPLE(?:\s+\d+)?\s*·\s*例句\s*$/gim)];
  const examples = [];
  for (let index = 0; index < markers.length; index += 1) {
    const start = (markers[index].index || 0) + markers[index][0].length;
    const end = markers[index + 1]?.index ?? section.length;
    const block = section.slice(start, end);
    const original = matchIndex(block, /^Original (?:sentences?|messages?)\s*·\s*原句\s*$/im);
    const target = original ? matchIndex(block, /^Target (?:sentences?|messages?)\s*·\s*目標句\s*$/im, original.end) : null;
    if (!original || !target) continue;
    const originalPair = splitBilingual(block.slice(original.end, target.index));
    const targetPair = splitBilingual(block.slice(target.end));
    if (originalPair.en && targetPair.en) {
      examples.push({
        originalEn: originalPair.en,
        originalZh: originalPair.zh,
        targetEn: targetPair.en,
        targetZh: targetPair.zh
      });
    }
  }
  return examples;
}

function sequentialBlocks(section) {
  const lines = normalizePunctuation(section).replace(/\f/g, "\n").split("\n");
  const blocks = [];
  let expected = 1;
  let current = null;
  for (const rawLine of lines) {
    const line = cleanLine(rawLine);
    const marker = line.match(/^(\d{1,2})\.?(?:\s+(.+))?$/);
    if (marker && Number(marker[1]) === expected) {
      if (current) blocks.push(current);
      current = { number: expected, inlineTitle: cleanLine(marker[2] || ""), lines: [] };
      expected += 1;
      continue;
    }
    if (current) current.lines.push(rawLine);
  }
  if (current) blocks.push(current);
  return blocks;
}

function firstMeaningful(lines, predicate = () => true) {
  return lines.map(cleanLine).find((line) => !isBoilerplate(line) && predicate(line)) || "";
}

function compact(value, maximum = 420) {
  const text = cleanLine(value);
  if (text.length <= maximum) return text;
  return `${text.slice(0, maximum - 1).trimEnd()}…`;
}

function parseBilingualTeachingList(section, titleEn, kind) {
  return sequentialBlocks(section).map((block) => {
    const lines = block.inlineTitle ? [block.inlineTitle, ...block.lines] : block.lines;
    const zh = firstMeaningful(lines, (line) => /[\u3400-\u9fff]/u.test(line));
    const inlineTitle = cleanLine(block.inlineTitle);
    const englishLines = lines
      .map(cleanLine)
      .filter((line) => (
        !isBoilerplate(line)
        && /[A-Za-z]/.test(line)
        && !/[\u3400-\u9fff]/u.test(line)
        && !/^(?:Instead of|You can (?:say|write)|For example|Correct|Incorrect|Natural|Not natural)\s*:?[：]?$/i.test(line)
      ));
    const englishHeading = /[A-Za-z]/.test(inlineTitle) && !/[\u3400-\u9fff]/u.test(inlineTitle)
      ? inlineTitle
      : "";
    const englishSummary = kind === "benefit"
      ? [...englishLines].reverse().find((line) => line.length >= 20) || ""
      : "";
    const en = englishHeading || englishSummary || (kind === "benefit"
      ? `A practical benefit of using “${titleEn}” accurately.`
      : `An important usage rule for “${titleEn}”.`);
    return [
      compact(zh || `掌握「${titleEn}」的第 ${block.number} 項實用重點。`),
      compact(en)
    ];
  });
}

function usageExampleScore(line, titleEn) {
  const text = cleanLine(line);
  if (!text || text.length > 460) return Number.NEGATIVE_INFINITY;
  if (/^(?:Pattern|Example|Meaning|Feeling|Instead of|Correct|Incorrect|Natural|Less suitable)\b/i.test(text)) return -1000;
  const words = text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [];
  if (words.length < 2) return -500;
  if (/(?:\b(?:and|but|or|to)|[,;:])$/i.test(text)) return -300;
  const uniqueWords = new Set(words);
  if (uniqueWords.size === 1 && words.length > 1) return -400;

  const titleWords = (normalizePunctuation(titleEn).toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || [])
    .filter((word) => !new Set(["a", "an", "and", "at", "for", "in", "is", "it", "of", "on", "or", "the", "to", "x", "y", "z"]).has(word));
  const overlap = titleWords.filter((word) => uniqueWords.has(word)).length;
  const expressionBonus = titleWords.length && overlap === titleWords.length ? 80 : overlap * 12;
  const punctuationBonus = /[.!?:]$/.test(text) ? 8 : 0;
  const sentenceStart = /^[A-Z“"']/.test(text) ? 10 : -40;
  return expressionBonus + punctuationBonus + sentenceStart + Math.min(text.length, 180) / 18;
}

function parseUsageGroups(section, titleEn) {
  return sequentialBlocks(section).map((block) => {
    const lines = block.lines.map(cleanLine).filter((line) => !isBoilerplate(line));
    const inline = cleanLine(block.inlineTitle);
    const title = inline || firstMeaningful(lines) || `用法 ${block.number}`;
    const englishCandidates = lines.filter((line) => /[A-Za-z]/.test(line) && !/[\u3400-\u9fff]/u.test(line));
    const bestExample = englishCandidates
      .map((line) => ({ line, score: usageExampleScore(line, titleEn) }))
      .sort((left, right) => right.score - left.score)[0];
    const example = bestExample?.score >= 25 ? bestExample.line : titleEn;
    const explanation = firstMeaningful(lines, (line) => /[\u3400-\u9fff]/u.test(line))
      || `「${titleEn}」的實際運用方式。`;
    return [compact(title, 180), compact(example, 420), compact(explanation, 520)];
  });
}

function parseSummaryPoints(section, titleEn) {
  const blocks = sequentialBlocks(section);
  const points = blocks.map((block) => {
    const lines = block.inlineTitle ? [block.inlineTitle, ...block.lines] : block.lines;
    const en = firstMeaningful(lines, (line) => /[A-Za-z]/.test(line) && !/[\u3400-\u9fff]/u.test(line));
    const zh = firstMeaningful(lines, (line) => /[\u3400-\u9fff]/u.test(line));
    return compact([en, zh].filter(Boolean).join(" — "), 520);
  }).filter(Boolean);
  if (points.length) return points;
  return [
    `掌握 ${titleEn} 的核心意思和自然語氣。`,
    "改寫時保留原句的重要資料，不加入題目沒有的新內容。",
    "按語境選擇最自然的句型及標點。"
  ];
}

function parseNumberedEntries(section) {
  const markers = [...section.matchAll(/^\s*(\d{1,3})\.\s*$/gm)];
  const accepted = [];
  let expected = 1;
  for (const marker of markers) {
    if (Number(marker[1]) !== expected) continue;
    accepted.push(marker);
    expected += 1;
  }
  return accepted.map((marker, index) => {
    const start = (marker.index || 0) + marker[0].length;
    const end = accepted[index + 1]?.index ?? section.length;
    return { number: Number(marker[1]), ...splitBilingual(section.slice(start, end)) };
  });
}

function pageContaining(raw, pattern) {
  const pages = raw.split("\f");
  const index = pages.findIndex((page) => pattern.test(normalizedDocument(page)));
  return index < 0 ? 0 : index + 1;
}

function range(start, end) {
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function slugify(value) {
  return normalizePunctuation(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
}

function buildLesson(entry) {
  const details = systemDetails[entry.systemKey];
  if (!details) throw new Error(`${entry.file}: unknown system ${entry.systemKey}`);
  const filePath = path.join(downloadsDirectory, entry.file);
  if (!fs.existsSync(filePath)) throw new Error(`Missing requested PDF: ${filePath}`);
  const { raw, text, pageCount } = extractPdf(filePath);
  const questionSection = between(text, /^Questions\s+題目\s*$/im, /^Answer List\s+答案\s*$/im);
  const answerSection = after(text, /^Answer List\s+答案\s*$/im);
  const prompts = parseNumberedEntries(questionSection);
  const answers = parseNumberedEntries(answerSection);
  if (!prompts.length || prompts.length !== answers.length) {
    throw new Error(`${entry.file}: question/answer mismatch (${prompts.length}/${answers.length})`);
  }
  for (let index = 0; index < prompts.length; index += 1) {
    if (prompts[index].number !== index + 1 || answers[index].number !== index + 1) {
      throw new Error(`${entry.file}: non-contiguous exercise numbering at ${index + 1}`);
    }
    if (!prompts[index].en || !prompts[index].zh || !answers[index].en || !answers[index].zh) {
      throw new Error(`${entry.file}: incomplete bilingual exercise ${index + 1}`);
    }
  }

  const lessonNumber = String(entry.idNumber).padStart(2, "0");
  const examples = parseExamples(text);
  const fallbackExamples = prompts.slice(0, 3).map((prompt, index) => ({
    originalEn: prompt.en,
    originalZh: prompt.zh,
    targetEn: answers[index].en,
    targetZh: answers[index].zh
  }));
  const benefitsSection = between(text, /^P\.2 Benefits\s+學習好處\s*$/im, /^P\.3\s+/im);
  const remindersSection = between(text, /^P\.3 Important Reminders\s+重要規則\s*$/im, /^P\.4\s+/im);
  const usageSection = between(text, /^P\.4 Full Practical Usage List\s+完整實用用法\s*$/im, /^Best Teaching Summary\s+教學總結\s*$/im);
  const summarySection = between(text, /^Best Teaching Summary\s+教學總結\s*$/im, /^P\.5 Exercise Time\s*$/im);
  const instructionSection = between(text, /^P\.5 Exercise Time\s*$/im, /^Questions\s+題目\s*$/im);
  const instruction = splitBilingual(instructionSection);
  const benefits = parseBilingualTeachingList(benefitsSection, entry.titleEn, "benefit");
  const reminders = parseBilingualTeachingList(remindersSection, entry.titleEn, "reminder");
  const usageGroups = parseUsageGroups(usageSection, entry.titleEn);
  const summaryPoints = parseSummaryPoints(summarySection, entry.titleEn);
  const exercisePage = pageContaining(raw, /^P\.5 Exercise Time\s*$/im) || pageCount;
  const answerPage = pageContaining(raw, /^Answer List\s+答案\s*$/im) || pageCount;

  const questions = prompts.map((prompt, index) => {
    const answer = answers[index];
    return {
      id: `ce${lessonNumber}-q${String(index + 1).padStart(2, "0")}`,
      promptEn: prompt.en,
      promptZh: prompt.zh,
      answerEn: answer.en,
      answerZh: answer.zh,
      acceptedAnswers: [answer.en]
    };
  });

  return {
    id: `common-expression-${lessonNumber}`,
    order: entry.idNumber,
    slug: slugify(entry.titleEn),
    titleEn: normalizePunctuation(entry.titleEn),
    titleZh: entry.titleZh,
    level: details.level,
    lessonTypeZh: details.lessonTypeZh,
    lessonTypeEn: details.lessonTypeEn,
    summaryZh: `本課整理「${normalizePunctuation(entry.titleEn)}」的意思、語氣、句型、常見用法及改寫練習。`,
    summaryEn: `Learn the meaning, tone, patterns and practical uses of ${normalizePunctuation(entry.titleEn)}.`,
    source: {
      file: entry.file,
      originalLessonNumber: entry.sourceNumber,
      pageCount,
      teachingPdfPages: range(1, Math.max(1, exercisePage - 1)),
      exercisePdfPages: range(exercisePage, Math.max(exercisePage, answerPage)),
      answerKeyPdfPages: range(answerPage, pageCount)
    },
    examples: examples.length >= 3 ? examples : fallbackExamples,
    benefits: benefits.length >= 3 ? benefits : [
      [`掌握「${entry.titleEn}」的核心意思。`, `Understand the core meaning of ${entry.titleEn}.`],
      ["根據語境選擇自然語氣。", "Choose a natural tone for the context."],
      ["透過改寫練習鞏固用法。", "Reinforce usage through rewriting practice."]
    ],
    reminders: reminders.length >= 3 ? reminders : [
      ["先理解原句意思，再選擇目標表達。", "Understand the original meaning before choosing the target expression."],
      ["保留原句的重要資料。", "Preserve important information from the original."],
      ["不要加入題目沒有的新人物、時間、地點或原因。", "Do not add people, times, places or reasons that are not in the prompt."]
    ],
    usageGroups: usageGroups.length >= 3 ? usageGroups : fallbackExamples.map((example, index) => [
      `實用用法 ${index + 1}`,
      example.targetEn,
      example.targetZh
    ]),
    summaryPoints,
    exerciseInstructionEn: instruction.en || `Rewrite each item using ${normalizePunctuation(entry.titleEn)} or a natural form of it.`,
    exerciseInstructionZh: instruction.zh || `使用「${normalizePunctuation(entry.titleEn)}」或它的自然變化形式改寫。`,
    questions
  };
}

function existingImportedLessonsBySourceFile() {
  if (!fs.existsSync(outputPath)) return new Map();
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(root, "common-expression-system-data.js"), "utf8"), { window }, {
    filename: "common-expression-system-data.js"
  });
  vm.runInNewContext(fs.readFileSync(outputPath, "utf8"), { window }, {
    filename: "common-expression-system-imported-data.js"
  });
  const lessons = new Map();
  for (const system of Object.values(window.EDMUND_COMMON_EXPRESSION_DATA?.systems || {})) {
    for (const lesson of system.lessons || []) {
      const file = lesson?.source?.file;
      if (!file || file === "Common Expression 1 - See you around.pdf" || file === "Common Expression 2 - “That’s good to hear.pdf") continue;
      if (lessons.has(file)) throw new Error(`Existing generated catalogue contains duplicate source file: ${file}`);
      lessons.set(file, JSON.parse(JSON.stringify(lesson)));
    }
  }
  return lessons;
}

function buildOrReuseLesson(entry, existingByFile) {
  const filePath = path.join(downloadsDirectory, entry.file);
  if (fs.existsSync(filePath)) return buildLesson(entry);
  const lesson = existingByFile.get(entry.file);
  if (!lesson) throw new Error(`Missing requested PDF and generated review record: ${filePath}`);
  const expectedId = `common-expression-${String(entry.idNumber).padStart(2, "0")}`;
  if (lesson.id !== expectedId || lesson.order !== entry.idNumber) {
    throw new Error(`${entry.file}: preserved lesson identity does not match manifest (${lesson.id}/${lesson.order})`);
  }
  if (lesson.titleEn !== entry.titleEn || lesson.titleZh !== entry.titleZh) {
    throw new Error(`${entry.file}: preserved lesson title does not match manifest`);
  }
  return lesson;
}

function validateManifest(entries) {
  if (entries.length !== 170) throw new Error(`Expected 170 explicitly requested PDFs, found ${entries.length}`);
  const files = new Set();
  const ids = new Set();
  for (const entry of entries) {
    if (files.has(entry.file)) throw new Error(`Duplicate manifest file: ${entry.file}`);
    files.add(entry.file);
    const composite = `${entry.systemKey}:common-expression-${String(entry.idNumber).padStart(2, "0")}`;
    if (ids.has(composite)) throw new Error(`Duplicate manifest lesson id: ${composite}`);
    ids.add(composite);
  }
}

function validateLessons(bySystem) {
  for (const [systemKey, lessons] of Object.entries(bySystem)) {
    const ids = new Set();
    const slugs = new Set();
    for (const lesson of lessons) {
      if (ids.has(lesson.id)) throw new Error(`${systemKey}: duplicate lesson id ${lesson.id}`);
      if (slugs.has(lesson.slug)) throw new Error(`${systemKey}: duplicate slug ${lesson.slug}`);
      ids.add(lesson.id);
      slugs.add(lesson.slug);
      if (lesson.questions.length < 1 || lesson.questions.length > 100) throw new Error(`${lesson.id}: invalid question count`);
      const prefix = `ce${lesson.id.slice(-2)}-q`;
      for (const question of lesson.questions) {
        if (!question.id.startsWith(prefix)) throw new Error(`${systemKey}/${lesson.id}: mismatched question id ${question.id}`);
        if (/[\u2018\u2019\u02bc]/.test(`${question.promptEn}${question.answerEn}${lesson.titleEn}`)) {
          throw new Error(`${systemKey}/${lesson.id}: curly apostrophe escaped normalization`);
        }
      }
    }
  }
}

validateManifest(manifest);
const existingByFile = existingImportedLessonsBySourceFile();
const imported = Object.fromEntries(Object.keys(systemDetails).map((key) => [key, []]));
for (const entry of manifest) imported[entry.systemKey].push(buildOrReuseLesson(entry, existingByFile));
for (const lessons of Object.values(imported)) lessons.sort((left, right) => left.order - right.order);
validateLessons(imported);

const output = `// Generated by tools/import-common-expression-pdfs.mjs from the explicit reviewed PDF manifest.\n` +
`// Do not add files by broad glob: Downloads intentionally contains unrequested future lessons.\n` +
`(function attachImportedCommonExpressionLessons() {\n` +
`  \"use strict\";\n` +
`  const catalogue = window.EDMUND_COMMON_EXPRESSION_DATA;\n` +
`  if (!catalogue?.systems) throw new Error(\"Common Expression base catalogue must load first.\");\n` +
`  const imported = ${JSON.stringify(imported)};\n` +
`  for (const [systemKey, lessons] of Object.entries(imported)) {\n` +
`    const system = catalogue.systems[systemKey];\n` +
`    if (!system) throw new Error(\`Unknown imported Common Expression system: \${systemKey}\`);\n` +
`    const existingIds = new Set(system.lessons.map(({ id }) => id));\n` +
`    for (const lesson of lessons) {\n` +
`      if (existingIds.has(lesson.id)) throw new Error(\`Duplicate Common Expression lesson: \${systemKey}/\${lesson.id}\`);\n` +
`      system.lessons.push(lesson);\n` +
`      existingIds.add(lesson.id);\n` +
`    }\n` +
`    system.lessons.sort((left, right) => left.order - right.order);\n` +
`  }\n` +
`})();\n`;

fs.writeFileSync(outputPath, output);

const counts = Object.fromEntries(Object.entries(imported).map(([key, lessons]) => [
  key,
  {
    lessons: lessons.length,
    questions: lessons.reduce((total, lesson) => total + lesson.questions.length, 0),
    pages: lessons.reduce((total, lesson) => total + lesson.source.pageCount, 0)
  }
]));
console.log(JSON.stringify({ output: path.relative(root, outputPath), importedFiles: manifest.length, systems: counts }, null, 2));
