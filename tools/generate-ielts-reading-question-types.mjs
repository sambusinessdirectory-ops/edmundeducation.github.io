#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const TOOL_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIRECTORY = path.resolve(TOOL_DIRECTORY, "..");
export const CATALOGUE_FILE = path.join(ROOT_DIRECTORY, "reading-comprehension-catalogue.json");
export const DATA_DIRECTORY = path.join(ROOT_DIRECTORY, "reading-comprehension-data");
export const OVERRIDES_FILE = path.join(TOOL_DIRECTORY, "ielts-reading-question-type-overrides.json");
export const OUTPUT_FILE = path.join(ROOT_DIRECTORY, "ielts-reading-question-types.js");
export const EXPECTED_ARTICLE_COUNT = 437;
export const GENERATOR_VERSION = "2026-08-29.2";

export const CANONICAL_TYPES = Object.freeze([
  {
    id: "sentence-completion",
    nameEn: "Sentence Completion",
    nameZh: "句子填空",
    aliases: ["sentence completion", "complete the sentence", "complete the sentences", "sentence fill in", "句子填空", "完成句子", "補完整句子"],
  },
  {
    id: "summary-completion",
    nameEn: "Summary Completion",
    nameZh: "摘要填空",
    aliases: ["summary completion", "complete the summary", "summary with word list", "摘要填空", "摘要完成", "補摘要", "補 summary"],
  },
  {
    id: "note-completion",
    nameEn: "Note Completion",
    nameZh: "筆記填空",
    aliases: ["note completion", "notes completion", "complete the notes", "筆記填空", "補筆記"],
  },
  {
    id: "table-completion",
    nameEn: "Table Completion",
    nameZh: "表格填空",
    aliases: ["table completion", "complete the table", "表格填空", "補表格"],
  },
  {
    id: "flowchart-completion",
    nameEn: "Flowchart Completion",
    nameZh: "流程圖填空",
    aliases: ["flowchart completion", "flow chart completion", "flow-chart completion", "complete the flowchart", "流程圖填空", "流程填空", "補流程"],
  },
  {
    id: "diagram-labelling",
    nameEn: "Diagram Labelling",
    nameZh: "圖表標示",
    aliases: ["diagram labelling", "diagram labeling", "diagram label completion", "diagram completion", "label the diagram", "圖表標示", "圖表標籤", "標圖", "圖示填空"],
  },
  {
    id: "short-answer-questions",
    nameEn: "Short Answer Questions",
    nameZh: "短答題",
    aliases: ["short answer questions", "short-answer questions", "short answer", "短答題", "簡答題", "直接回答"],
  },
  {
    id: "multiple-choice",
    nameEn: "Multiple Choice",
    nameZh: "選擇題",
    aliases: ["multiple choice", "multiple answer", "multiple-answer questions", "choose two", "choose three", "choose four", "choose five", "選擇題", "多項選擇", "複選題", "選正確選項"],
  },
  {
    id: "true-false-not-given",
    nameEn: "True / False / Not Given",
    nameZh: "判斷事實",
    aliases: ["true false not given", "true / false / not given", "tfng", "判斷事實", "事實判斷", "是非無資料"],
  },
  {
    id: "yes-no-not-given",
    nameEn: "Yes / No / Not Given",
    nameZh: "判斷作者觀點",
    aliases: ["yes no not given", "yes / no / not given", "ynng", "判斷作者觀點", "作者觀點判斷", "觀點判斷"],
  },
  {
    id: "matching-sentence-endings",
    nameEn: "Matching Sentence Endings",
    nameZh: "配句尾",
    aliases: ["matching sentence endings", "sentence endings", "match sentence endings", "phrase completion", "配句尾", "句尾配對"],
  },
  {
    id: "matching-names-features",
    nameEn: "Matching Names / Features",
    nameZh: "人物、國家、特徵配對",
    aliases: ["matching names", "matching features", "matching people", "matching researchers", "classification", "人物配對", "人名配對", "國家配對", "特徵配對", "分類配對", "人物國家特徵配對"],
  },
  {
    id: "matching-information",
    nameEn: "Matching Information",
    nameZh: "哪段有某資訊",
    aliases: ["matching information", "which paragraph contains", "matching paragraphs", "段落資訊配對", "哪段有某資訊", "哪段有資料"],
  },
  {
    id: "matching-headings",
    nameEn: "Matching Headings",
    nameZh: "段落標題配對",
    aliases: ["matching headings", "match headings", "paragraph headings", "段落標題配對", "配標題", "標題配對"],
  },
]);

export const UMBRELLA_ALIASES = Object.freeze([
  {
    id: "completion-types",
    nameEn: "Completion",
    nameZh: "填空題",
    aliases: ["completion", "completion questions", "fill in the blanks", "fill in blanks", "填空", "填空題"],
    typeIds: [
      "sentence-completion",
      "summary-completion",
      "note-completion",
      "table-completion",
      "flowchart-completion",
      "diagram-labelling",
    ],
  },
  {
    id: "matching-types",
    nameEn: "Matching",
    nameZh: "配對題",
    aliases: ["matching", "matching questions", "match", "配對", "配對題"],
    typeIds: [
      "matching-sentence-endings",
      "matching-names-features",
      "matching-information",
      "matching-headings",
    ],
  },
  {
    id: "judgement-types",
    nameEn: "Judgement",
    nameZh: "判斷題",
    aliases: ["judgement", "judgment", "judgement questions", "statement judgement", "判斷", "判斷題"],
    typeIds: ["true-false-not-given", "yes-no-not-given"],
  },
]);

const TYPE_ID_SET = new Set(CANONICAL_TYPES.map(({ id }) => id));

export function normalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/[’‘`´]/g, "'")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function foldInstruction(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("en")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function has(text, expression) {
  return expression.test(text);
}

function groupQuestionSlice(article, group) {
  return article.questions.filter(({ number }) => number >= group.start && number <= group.end);
}

function allOptionsAre(questions, expected) {
  const normalizedExpected = expected.map(normalizeSearchText);
  return questions.length > 0 && questions.every((question) => {
    const options = Array.isArray(question.options) ? question.options.map(normalizeSearchText) : [];
    return options.length === normalizedExpected.length
      && options.every((option, index) => option === normalizedExpected[index]);
  });
}

function optionLetters(questions) {
  return questions.flatMap((question) => Array.isArray(question.options) ? question.options : [])
    .map((option) => normalizeSearchText(option))
    .filter((option) => /^[a-z]$/.test(option));
}

/**
 * Classify one exact source question-group instruction. Rules deliberately use
 * task wording rather than answer letters or the imported analysis label.
 */
export function classifyQuestionGroup(article, group) {
  const text = foldInstruction(group.text);
  const questions = groupQuestionSlice(article, group);

  if (!text) return null;

  if (
    has(text, /\blist of headings\b/)
    || has(text, /\bchoose (?:the )?(?:correct|most suitable|appropriate)?\s*headings?\b/)
    || has(text, /\bwhich paragraph does .*?\bheadings? best fit\b/)
    || has(text, /\bmatch(?:ing)? .*?\bheadings?\b/)
  ) return { type: "matching-headings", evidence: "heading instruction" };

  if (
    has(text, /\bwhich (?:paragraph|section|chapter) contains (?:each of )?(?:the following )?(?:pieces? of )?information\b/)
    || has(text, /\bwhich (?:paragraph|section|chapter|finding) contains each of the following\b/)
    || has(text, /\bparagraph contains each of the following pieces of information\b/)
    || has(text, /\bwhich paragraph does .*?information.*?fit\b/)
    || has(text, /\bwhich (?:paragraph|section) mentions? (?:each of )?(?:the following)?\b/)
  ) return { type: "matching-information", evidence: "paragraph-information instruction" };

  if (
    has(text, /\btrue\b[\s\S]*\bfalse\b[\s\S]*\bnot given\b/)
    || allOptionsAre(questions, ["TRUE", "FALSE", "NOT GIVEN"])
  ) return { type: "true-false-not-given", evidence: "TRUE/FALSE/NOT GIVEN instruction" };

  if (
    has(text, /\byes\b[\s\S]*\bno\b[\s\S]*\bnot given\b/)
    || allOptionsAre(questions, ["YES", "NO", "NOT GIVEN"])
  ) return { type: "yes-no-not-given", evidence: "YES/NO/NOT GIVEN instruction" };

  if (
    has(text, /\bsentence endings?\b/)
    || has(text, /\bcomplete (?:each|the following|the) (?:sentences?|statements?) with (?:the )?(?:correct|best) ending\b/)
    || has(text, /\bcomplete each of the following (?:sentences?|statements?).{0,100}\bwith (?:the )?(?:correct|best) ending\b/)
    || has(text, /\bmatch .*?\b(?:sentence beginnings|first halves).*?\bendings?\b/)
    || has(text, /\bchoose .*?\b(?:phrase|ending)\b.*?\bcomplete .*?sentences?\b/)
    || has(text, /\bcompleted sentences should be an accurate summary\b/)
  ) return { type: "matching-sentence-endings", evidence: "sentence-ending instruction" };

  if (has(text, /\bflow[ -]?chart\b/)) {
    return { type: "flowchart-completion", evidence: "flowchart instruction" };
  }

  if (
    has(text, /\b(?:complete|label) (?:the |each )?(?:following )?(?:labels? (?:on )?(?:the )?)?(?:diagrams?|illustrations?|maps?)\b/)
    || has(text, /\b(?:diagrams?|illustrations?|maps?) (?:below )?.{0,50}\b(?:complete|label)\b/)
    || has(text, /\bdiagram labels?\b/)
  ) return { type: "diagram-labelling", evidence: "diagram-labelling instruction" };

  if (
    has(text, /\bcomplete (?:the )?(?:following )?table\b/)
    || has(text, /\btable (?:below )?.{0,50}\bcomplete\b/)
    || has(text, /\bspecific term\s+definition\b/)
  ) return { type: "table-completion", evidence: "table instruction" };

  if (
    has(text, /\bcomplete (?:the )?(?:following )?notes?\b/)
    || has(text, /\bnotes? (?:below )?.{0,50}\bcomplete\b/)
  ) return { type: "note-completion", evidence: "note instruction" };

  if (
    has(text, /\bcomplete (?:the )?(?:following )?summary\b/)
    || has(text, /\bsummary (?:below )?.{0,50}\bcomplete\b/)
  ) return { type: "summary-completion", evidence: "summary instruction" };

  if (
    has(text, /\bcomplete (?:each of )?(?:the )?(?:following )?(?:sentences?|statements?)\b/)
    || has(text, /\bcomplete each sentence\b/)
  ) return { type: "sentence-completion", evidence: "sentence-completion instruction" };

  if (
    has(text, /\bclassify\b/)
    || has(text, /\bmatch (?:each |the )?(?:people|person|researchers?|scientists?|companies|names|features|findings|statements|opinions|claims|projects|items|categories|descriptions|uses|applications|advantages|disadvantages|groups|organisations|organizations|countries|locations|animals|species|periods|paintings|painters|theories|factors|reasons|dates|languages)\b/)
    || has(text, /\buse the information .*? to match\b/)
    || has(text, /\bmatch (?:each|one of|the|a|an)?\b.{0,160}\b(?:with|to) (?:the )?(?:correct|appropriate|each of)\b/)
    || has(text, /\bmatch one of the .*? to each of the\b/)
    || has(text, /\bwhich of the following statements applies to the .*?categories\b/)
    || has(text, /\bwhat basis was used to form each\b/)
    || has(text, /\buse each answer only once\b/)
    || has(text, /\bchoose the (?:type|category|group|class) .*? which corresponds to\b/)
    || has(text, /\breorder the following letters .*?\bsequence of events\b/)
    || has(text, /\bmatch\b/)
  ) return { type: "matching-names-features", evidence: "name/feature/classification instruction" };

  if (
    has(text, /\bchoose (?:the )?(?:two|three|four|five)\b/)
    || has(text, /\bwhich (?:two|three|four|five)\b/)
    || has(text, /\bfive of the following statements are true\b/)
    || has(text, /\bthere are two correct answers\b/)
    || has(text, /\bchoose the corresponding letters\b/)
  ) return { type: "multiple-choice", evidence: "multiple-answer instruction" };

  if (
    has(text, /\bchoose the correct (?:answer|letter|option)\b/)
    || has(text, /\bchoose the best (?:answer|letter|option)\b/)
    || has(text, /\bcircle the correct answer\b/)
    || has(text, /\bchoose the appropriate letters?\b/)
    || has(text, /\bonly one of the choices is correct\b/)
    || has(text, /\bwhich of the following\b/)
    || has(text, /\baccording to .*? choose the correct answer(?: or answers)?\b/)
  ) return { type: "multiple-choice", evidence: "multiple-choice instruction" };

  if (
    has(text, /\banswer the (?:following )?questions\b/)
    || has(text, /\bwrite answers? to questions\b/)
    || has(text, /\busing .*?\banswer the following\b/)
    || has(text, /\bprovide answers? to the questions\b/)
    || (
      questions.length > 0
      && questions.every((question) => question.type === "text")
      && (text.match(/\?/g) || []).length >= Math.min(questions.length, 2)
      && !has(text, /_{3,}/)
    )
  ) return { type: "short-answer-questions", evidence: "short-answer instruction" };

  // A final, deliberately narrow structural fallback handles a single-answer
  // lettered choice whose OCR instruction only says to write a letter.
  if (
    questions.length === 1
    && questions[0]?.type === "choice"
    && optionLetters(questions).length >= 3
    && has(text, /\bwrite the (?:appropriate|correct) letter\b/)
  ) return { type: "multiple-choice", evidence: "single lettered-choice structure" };

  return null;
}

function expandRange(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function compressQuestionRanges(numbers) {
  const sorted = [...new Set(numbers)].sort((left, right) => left - right);
  const ranges = [];
  for (const number of sorted) {
    const current = ranges.at(-1);
    if (current && number === current[1] + 1) current[1] = number;
    else ranges.push([number, number]);
  }
  return ranges;
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function validateTaxonomy() {
  if (CANONICAL_TYPES.length !== 14) {
    throw new Error(`Expected exactly 14 canonical types; found ${CANONICAL_TYPES.length}.`);
  }
  if (TYPE_ID_SET.size !== CANONICAL_TYPES.length) throw new Error("Canonical type IDs are not unique.");
  for (const type of CANONICAL_TYPES) {
    if (!type.id || !type.nameEn || !type.nameZh || !type.aliases?.length) {
      throw new Error(`Canonical type ${type.id || "(missing ID)"} is not bilingual or has no aliases.`);
    }
  }
  for (const umbrella of UMBRELLA_ALIASES) {
    if (umbrella.typeIds.some((id) => !TYPE_ID_SET.has(id))) {
      throw new Error(`Umbrella alias ${umbrella.id} refers to an unknown type.`);
    }
  }
}

function validateOverride(override, article, usedQuestionNumbers) {
  if (!Number.isInteger(override.start) || !Number.isInteger(override.end) || override.end < override.start) {
    throw new Error(`${article.id} has an invalid override range.`);
  }
  if (override.start < article.questionStart || override.end > article.questionEnd) {
    throw new Error(`${article.id} override ${override.start}–${override.end} is outside the article range.`);
  }
  if (!TYPE_ID_SET.has(override.type)) {
    throw new Error(`${article.id} override ${override.start}–${override.end} uses unknown type ${override.type}.`);
  }
  if (!override.reason?.trim()) throw new Error(`${article.id} override ${override.start}–${override.end} has no reason.`);
  for (const number of expandRange(override.start, override.end)) {
    if (usedQuestionNumbers.has(number)) throw new Error(`${article.id} override question ${number} overlaps another override.`);
    usedQuestionNumbers.add(number);
  }
}

function exactOverrideForGroup(overrides, group) {
  return overrides.find(({ start, end }) => start === group.start && end === group.end);
}

function typeEntriesFromUnits(units) {
  const numbersByType = new Map();
  for (const unit of units) {
    const numbers = numbersByType.get(unit.type) || [];
    numbers.push(...expandRange(unit.start, unit.end));
    numbersByType.set(unit.type, numbers);
  }
  return CANONICAL_TYPES
    .filter(({ id }) => numbersByType.has(id))
    .map(({ id }) => {
      const questionNumbers = [...new Set(numbersByType.get(id))].sort((left, right) => left - right);
      return { id, questionNumbers, ranges: compressQuestionRanges(questionNumbers) };
    });
}

export async function generateQuestionTypePayload() {
  validateTaxonomy();
  const [catalogue, overrideManifest] = await Promise.all([
    readJson(CATALOGUE_FILE),
    readJson(OVERRIDES_FILE),
  ]);
  const catalogueArticles = Array.isArray(catalogue.articles) ? catalogue.articles : [];
  if (catalogueArticles.length !== EXPECTED_ARTICLE_COUNT) {
    throw new Error(`Expected ${EXPECTED_ARTICLE_COUNT} production catalogue articles; found ${catalogueArticles.length}.`);
  }
  const catalogueIds = new Set(catalogueArticles.map(({ id }) => id));
  if (catalogueIds.size !== EXPECTED_ARTICLE_COUNT) throw new Error("Production catalogue article IDs are not unique.");

  const overrideArticles = overrideManifest?.articles || {};
  const ignoredGroupsByArticle = overrideManifest?.ignoredGroups || {};
  for (const id of Object.keys(overrideArticles)) {
    if (!catalogueIds.has(id)) throw new Error(`Override manifest refers to non-production article ${id}.`);
  }
  for (const id of Object.keys(ignoredGroupsByArticle)) {
    if (!catalogueIds.has(id)) throw new Error(`Ignored-group manifest refers to non-production article ${id}.`);
  }

  const unresolved = [];
  const evidenceCounts = new Map();
  const ignoredGroupAudit = [];
  const articles = [];

  for (const catalogueArticle of catalogueArticles) {
    const article = await readJson(path.join(DATA_DIRECTORY, `${catalogueArticle.id}.json`));
    if (article.id !== catalogueArticle.id) throw new Error(`${catalogueArticle.id} data ID does not match catalogue.`);
    if (
      (article.passage !== undefined && article.passage !== catalogueArticle.passage)
      || (article.practice !== undefined && article.practice !== catalogueArticle.practice)
    ) {
      throw new Error(`${catalogueArticle.id} passage/practice metadata does not match catalogue.`);
    }
    if (article.questionStart !== undefined && article.questionStart !== catalogueArticle.questionStart) {
      throw new Error(`${catalogueArticle.id} questionStart does not match catalogue.`);
    }
    const articleOverrides = overrideArticles[catalogueArticle.id] || [];
    const overrideNumbers = new Set();
    articleOverrides.forEach((override) => validateOverride(override, catalogueArticle, overrideNumbers));
    const units = [];
    const rawGroups = Array.isArray(article.questionGroups) ? article.questionGroups : [];
    const ignoredGroupSpecs = ignoredGroupsByArticle[catalogueArticle.id] || [];
    const ignoredGroupIds = new Set();
    for (const ignored of ignoredGroupSpecs) {
      if (!ignored?.id || !ignored.reason?.trim()) {
        throw new Error(`${catalogueArticle.id} has an invalid ignored-group review entry.`);
      }
      const ignoredGroup = rawGroups.find(({ id }) => id === ignored.id);
      if (!ignoredGroup) throw new Error(`${catalogueArticle.id} ignored group ${ignored.id} does not exist.`);
      const containingGroup = rawGroups.find(
        (candidate) => candidate.id !== ignored.id
          && candidate.start <= ignoredGroup.start
          && candidate.end >= ignoredGroup.end,
      );
      if (!containingGroup) {
        throw new Error(`${catalogueArticle.id} ignored group ${ignored.id} is not contained by a reviewed real group.`);
      }
      if (ignoredGroupIds.has(ignored.id)) throw new Error(`${catalogueArticle.id} ignores group ${ignored.id} twice.`);
      ignoredGroupIds.add(ignored.id);
      ignoredGroupAudit.push({
        articleId: catalogueArticle.id,
        ignoredGroupId: ignored.id,
        containingGroupId: containingGroup.id,
        reason: ignored.reason,
      });
    }
    const groups = rawGroups.filter(({ id }) => !ignoredGroupIds.has(id));

    if (!groups.length) {
      units.push(...articleOverrides.map(({ start, end, type }) => ({ start, end, type, evidence: "reviewed override" })));
    } else {
      for (const group of groups) {
        if (!Number.isInteger(group.start) || !Number.isInteger(group.end) || group.end < group.start) {
          throw new Error(`${catalogueArticle.id} has invalid question-group bounds.`);
        }
        const reviewed = exactOverrideForGroup(articleOverrides, group);
        const classification = reviewed
          ? { type: reviewed.type, evidence: "reviewed override" }
          : classifyQuestionGroup(article, group);
        if (!classification) {
          unresolved.push({
            articleId: catalogueArticle.id,
            start: group.start,
            end: group.end,
            instruction: foldInstruction(group.text).slice(0, 500),
          });
          continue;
        }
        units.push({ start: group.start, end: group.end, ...classification });
        evidenceCounts.set(classification.evidence, (evidenceCounts.get(classification.evidence) || 0) + 1);
      }
      const unusedOverrides = articleOverrides.filter(
        (override) => !groups.some((group) => group.start === override.start && group.end === override.end),
      );
      if (unusedOverrides.length) {
        throw new Error(`${catalogueArticle.id} has override ranges that do not match an exact question group.`);
      }
    }

    const classifiedNumbers = units.flatMap(({ start, end }) => expandRange(start, end));
    const expectedNumbers = expandRange(catalogueArticle.questionStart, catalogueArticle.questionEnd);
    const sortedNumbers = [...classifiedNumbers].sort((left, right) => left - right);
    if (
      sortedNumbers.length !== expectedNumbers.length
      || sortedNumbers.some((number, index) => number !== expectedNumbers[index])
    ) {
      const actual = sortedNumbers.join(",");
      const expected = expectedNumbers.join(",");
      unresolved.push({
        articleId: catalogueArticle.id,
        start: catalogueArticle.questionStart,
        end: catalogueArticle.questionEnd,
        instruction: `Question coverage mismatch. Expected ${expected}; classified ${actual}.`,
      });
    }

    articles.push({
      id: catalogueArticle.id,
      analysisId: catalogueArticle.analysisId,
      title: catalogueArticle.title,
      passage: catalogueArticle.passage,
      practice: catalogueArticle.practice,
      questionStart: catalogueArticle.questionStart,
      questionEnd: catalogueArticle.questionEnd,
      types: typeEntriesFromUnits(units),
    });
  }

  if (unresolved.length) {
    const details = unresolved
      .map(({ articleId, start, end, instruction }) => `${articleId} Q${start}–${end}: ${instruction}`)
      .join("\n");
    throw new Error(`Unclassified or incompletely classified question groups (${unresolved.length}):\n${details}`);
  }

  const byType = Object.fromEntries(CANONICAL_TYPES.map(({ id }) => [
    id,
    articles.filter((article) => article.types.some((type) => type.id === id)).map(({ id: articleId }) => articleId),
  ]));

  return {
    version: GENERATOR_VERSION,
    corpusVersion: catalogue.version,
    articleCount: articles.length,
    taxonomy: CANONICAL_TYPES,
    umbrellaAliases: UMBRELLA_ALIASES,
    articles,
    byType,
    buildAudit: {
      overridesVersion: overrideManifest.version,
      overrideArticleCount: Object.keys(overrideArticles).length,
      ignoredGroups: ignoredGroupAudit,
      classificationEvidence: Object.fromEntries([...evidenceCounts].sort(([left], [right]) => left.localeCompare(right))),
    },
  };
}

export function serializeQuestionTypePayload(payload) {
  return `// Generated by tools/generate-ielts-reading-question-types.mjs. Do not edit manually.\nwindow.EDMUND_IELTS_READING_QUESTION_TYPES = Object.freeze(${JSON.stringify(payload)});\n`;
}

export function resolveSearchTypeIds(payload, query) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];
  const ids = new Set();
  for (const type of payload.taxonomy) {
    const haystack = [type.id, type.nameEn, type.nameZh, ...type.aliases].map(normalizeSearchText);
    if (haystack.some((alias) => alias === normalized || alias.includes(normalized) || normalized.includes(alias))) {
      ids.add(type.id);
    }
  }
  for (const umbrella of payload.umbrellaAliases) {
    const haystack = [umbrella.id, umbrella.nameEn, umbrella.nameZh, ...umbrella.aliases].map(normalizeSearchText);
    if (haystack.some((alias) => alias === normalized || alias.includes(normalized))) {
      umbrella.typeIds.forEach((id) => ids.add(id));
    }
  }
  return CANONICAL_TYPES.map(({ id }) => id).filter((id) => ids.has(id));
}

async function runCli() {
  const payload = await generateQuestionTypePayload();
  const serialized = serializeQuestionTypePayload(payload);
  if (process.argv.includes("--check")) {
    const current = await readFile(OUTPUT_FILE, "utf8").catch(() => "");
    if (current !== serialized) {
      throw new Error(`${path.basename(OUTPUT_FILE)} is stale. Run node tools/generate-ielts-reading-question-types.mjs.`);
    }
    console.log(`Verified ${payload.articleCount} IELTS Reading question-type records.`);
    return;
  }
  await writeFile(OUTPUT_FILE, serialized, "utf8");
  const typeSummary = payload.taxonomy
    .map(({ id }) => `${id}=${payload.byType[id].length}`)
    .join(", ");
  console.log(`Generated ${path.relative(ROOT_DIRECTORY, OUTPUT_FILE)} for ${payload.articleCount} articles.`);
  console.log(typeSummary);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
