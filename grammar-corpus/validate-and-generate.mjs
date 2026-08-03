import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = path.join(DIRECTORY, "corpus-v1.json");
const WORKER_OUTPUT = path.resolve(
  DIRECTORY,
  "../workers/writing-submission/src/grammar-corpus.generated.js"
);
const SQL_OUTPUT = path.join(DIRECTORY, "seed-corpus-v1.sql");
const CSV_DIRECTORY = path.join(DIRECTORY, "sheets-v1");

const CATEGORIES = new Set([
  "subject_verb_agreement", "article_or_determiner", "singular_plural",
  "countability", "verb_form_or_tense", "modal_or_auxiliary",
  "infinitive_or_gerund", "preposition", "pronoun", "sentence_structure",
  "conjunction", "parallelism", "comparison", "possessive", "punctuation",
  "spelling_or_spacing", "word_form", "word_choice", "other_grammar"
]);
const ENGLISH_VARIANTS = new Set(["British English", "American English", "both"]);
const REVIEW_POLICIES = new Set(["exact", "guidance", "abstain"]);

function fail(message) {
  throw new Error(`Grammar corpus validation failed: ${message}`);
}

function requireString(value, label, { maximum = 20000 } = {}) {
  if (
    typeof value !== "string"
    || !value.trim()
    || value !== value.trim()
    || value.length > maximum
    || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)
  ) fail(`${label} must be a trimmed, bounded, non-empty string`);
  return value;
}

function requireOptionalString(value, label, { maximum = 20000 } = {}) {
  if (
    typeof value !== "string"
    || value !== value.trim()
    || value.length > maximum
    || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)
  ) fail(`${label} must be a trimmed, bounded string`);
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  return value;
}

function requireStringArray(value, label, { maximum = 2000 } = {}) {
  return requireArray(value, label).map((item, index) => (
    requireString(item, `${label}[${index}]`, { maximum })
  ));
}

function requireBoolean(value, label) {
  if (typeof value !== "boolean") fail(`${label} must be a boolean`);
  return value;
}

function requireInteger(value, label, { minimum = 1, maximum = 1000000 } = {}) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    fail(`${label} must be an integer between ${minimum} and ${maximum}`);
  }
  return value;
}

function requireEnum(value, allowed, label) {
  if (!allowed.has(value)) fail(`${label} has an invalid value`);
  return value;
}

function requireUniqueOrders(values, label, { maximum = 500 } = {}) {
  const seen = new Set();
  for (const value of values) {
    const order = requireInteger(value.order, `${label}.order`, { maximum });
    if (seen.has(order)) fail(`${label} has duplicate order ${order}`);
    seen.add(order);
  }
}

function wordCount(value) {
  return value.trim() ? value.trim().split(/\s+/u).length : 0;
}

function normalizedExactSentence(value) {
  return value.replaceAll("\u00a0", " ").trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-GB");
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => (
      `${JSON.stringify(key)}:${canonicalJson(value[key])}`
    )).join(",")}}`;
  }
  return JSON.stringify(value);
}

function nthOccurrence(source, fragment, occurrence) {
  let from = 0;
  let found = -1;
  for (let index = 0; index < occurrence; index += 1) {
    found = source.indexOf(fragment, from);
    if (found < 0) return -1;
    from = found + fragment.length;
  }
  return found;
}

function issueRangesForSentence(sentence, issues) {
  const ranges = issues.map((issue) => {
    const start = nthOccurrence(sentence.incorrectSentence, issue.wrongText, issue.occurrence);
    if (start < 0) fail(`${issue.issueId} wrongText is not present at occurrence ${issue.occurrence}`);
    return {
      issue,
      start,
      end: start + issue.wrongText.length
    };
  }).sort((left, right) => left.start - right.start || left.end - right.end);

  for (let index = 1; index < ranges.length; index += 1) {
    if (ranges[index].start < ranges[index - 1].end) {
      fail(`${ranges[index - 1].issue.issueId} overlaps ${ranges[index].issue.issueId}`);
    }
  }
  return ranges;
}

function applyRanges(source, ranges) {
  return [...ranges]
    .sort((left, right) => right.start - left.start)
    .reduce((value, range) => (
      `${value.slice(0, range.start)}${range.issue.replacementText}${value.slice(range.end)}`
    ), source);
}

function structureTags(sentence, issues) {
  const source = sentence.incorrectSentence.toLocaleLowerCase("en-GB");
  const tags = new Set();
  for (const issue of issues) {
    tags.add(`rule:${issue.ruleId}`);
    tags.add(`category:${issue.category}`);
  }
  const patterns = [
    ["modal", /\b(?:can|could|may|might|must|shall|should|will|would)\b/u],
    ["infinitive_to", /\bto\s+[a-z]+\b/u],
    ["quantifier", /\b(?:many|several|some|much)\b/u],
    ["conditional", /\bif\b/u],
    ["question_word", /\b(?:where|what|when|why|how|who)\b/u],
    ["coordination", /\b(?:and|or|but)\b/u],
    ["be_auxiliary", /\b(?:am|is|are|was|were|be|been|being)\b/u],
    ["have_auxiliary", /\b(?:have|has|had)\b/u],
    ["verb_ing_surface", /\b[a-z]+ing\b/u],
    ["verb_ed_surface", /\b[a-z]+ed\b/u],
    ["negation", /\b(?:not|never|no)\b/u]
  ];
  for (const [tag, pattern] of patterns) if (pattern.test(source)) tags.add(tag);
  return [...tags].sort();
}

function sqlLiteral(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlJson(value) {
  return `${sqlLiteral(JSON.stringify(value))}::jsonb`;
}

function csvCell(value) {
  const text = Array.isArray(value) || (value && typeof value === "object")
    ? JSON.stringify(value)
    : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function csv(rows, columns) {
  return [
    columns.map(csvCell).join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))
  ].join("\n") + "\n";
}

function validateCorpus(corpus) {
  assert.equal(corpus.schemaVersion, 1, "schemaVersion must be 1");
  requireString(corpus.corpusVersion, "corpusVersion", { maximum: 80 });
  requireString(corpus.title, "title", { maximum: 200 });
  assert.equal(corpus.status, "approved");
  requireString(corpus.author, "author", { maximum: 120 });
  requireOptionalString(corpus.notes, "notes", { maximum: 4000 });
  requireString(corpus.approvedAt, "approvedAt", { maximum: 40 });
  const approvedAt = new Date(corpus.approvedAt);
  if (!Number.isFinite(approvedAt.valueOf()) || approvedAt.toISOString() !== corpus.approvedAt) {
    fail("approvedAt must be a canonical UTC ISO timestamp");
  }

  const groups = requireArray(corpus.groups, "groups");
  const rules = requireArray(corpus.rules, "rules");
  const paragraphs = requireArray(corpus.paragraphs, "paragraphs");
  const sentences = requireArray(corpus.sentences, "sentences");
  const issues = requireArray(corpus.issues, "issues");
  const exceptions = requireArray(corpus.exceptions, "exceptions");

  const uniqueMap = (values, key, label) => {
    const result = new Map();
    for (const value of values) {
      const id = requireString(value[key], `${label}.${key}`, { maximum: 160 });
      if (result.has(id)) fail(`duplicate ${label} key ${id}`);
      result.set(id, value);
    }
    return result;
  };

  const groupMap = uniqueMap(groups, "groupKey", "group");
  const ruleMap = uniqueMap(rules, "ruleId", "rule");
  const paragraphMap = uniqueMap(paragraphs, "paragraphId", "paragraph");
  const sentenceMap = uniqueMap(sentences, "sentenceId", "sentence");
  uniqueMap(issues, "issueId", "issue");
  uniqueMap(exceptions, "exceptionId", "exception");

  for (const group of groups) {
    requireString(group.groupKey, "group.groupKey", { maximum: 120 });
    requireEnum(
      group.partition,
      new Set(["retrieval", "development", "holdout", "regression"]),
      `${group.groupKey}.partition`
    );
    requireOptionalString(group.description, `${group.groupKey}.description`, { maximum: 1000 });
  }

  for (const rule of rules) {
    if (!/^[A-Z][A-Z0-9_]{1,119}$/u.test(rule.ruleId)) fail(`${rule.ruleId} is invalid`);
    if (!CATEGORIES.has(rule.grammarCategory)) fail(`${rule.ruleId} has an invalid category`);
    requireString(rule.titleZhHant, `${rule.ruleId}.titleZhHant`, { maximum: 200 });
    requireOptionalString(rule.formula, `${rule.ruleId}.formula`, { maximum: 2000 });
    requireOptionalString(rule.incorrectPattern, `${rule.ruleId}.incorrectPattern`, { maximum: 2000 });
    requireOptionalString(rule.correctPattern, `${rule.ruleId}.correctPattern`, { maximum: 2000 });
    requireString(rule.explanationZhHant, `${rule.ruleId}.explanationZhHant`, { maximum: 2000 });
    requireStringArray(rule.structuralSignature, `${rule.ruleId}.structuralSignature`);
    requireStringArray(rule.correctExamples, `${rule.ruleId}.correctExamples`);
    requireStringArray(rule.incorrectExamples, `${rule.ruleId}.incorrectExamples`);
    requireStringArray(rule.alternativeCorrections, `${rule.ruleId}.alternativeCorrections`);
    requireEnum(rule.englishVariant, ENGLISH_VARIANTS, `${rule.ruleId}.englishVariant`);
    requireString(rule.author, `${rule.ruleId}.author`, { maximum: 120 });
    requireInteger(rule.version, `${rule.ruleId}.version`);
    if (rule.status !== "approved") fail(`${rule.ruleId} is not approved`);
  }

  const issuesBySentence = new Map();
  for (const issue of issues) {
    const sentence = sentenceMap.get(issue.sentenceId);
    if (!sentence) fail(`${issue.issueId} references missing sentence ${issue.sentenceId}`);
    const rule = ruleMap.get(issue.ruleId);
    if (!rule) fail(`${issue.issueId} references missing rule ${issue.ruleId}`);
    if (!/^PARA-[0-9]{4,}-I[0-9]{3,}$/u.test(issue.issueId)) fail(`${issue.issueId} is invalid`);
    requireString(issue.sourceIssueId, `${issue.issueId}.sourceIssueId`, { maximum: 160 });
    if (!/^I[0-9]{3,}$/u.test(issue.sourceIssueId)) fail(`${issue.issueId}.sourceIssueId is invalid`);
    requireString(issue.wrongText, `${issue.issueId}.wrongText`, { maximum: 2000 });
    requireString(issue.replacementText, `${issue.issueId}.replacementText`, { maximum: 2000 });
    requireString(issue.explanationZhHant, `${issue.issueId}.explanationZhHant`, { maximum: 2000 });
    requireInteger(issue.occurrence, `${issue.issueId}.occurrence`, { maximum: 100 });
    if (issue.wrongText === issue.replacementText) fail(`${issue.issueId} does not change the text`);
    requireStringArray(issue.acceptableAlternatives, `${issue.issueId}.acceptableAlternatives`);
    if (typeof issue.confidence !== "number" || issue.confidence < 0.5 || issue.confidence > 1) {
      fail(`${issue.issueId}.confidence must be between 0.5 and 1`);
    }
    if (issue.status !== "approved") fail(`${issue.issueId} is not approved`);
    const bucket = issuesBySentence.get(issue.sentenceId) || [];
    bucket.push({ ...issue, category: rule.grammarCategory });
    issuesBySentence.set(issue.sentenceId, bucket);
  }

  const exactSentences = new Map();
  for (const sentence of sentences) {
    const paragraph = paragraphMap.get(sentence.paragraphId);
    if (!paragraph) fail(`${sentence.sentenceId} references missing paragraph ${sentence.paragraphId}`);
    const group = groupMap.get(paragraph.groupKey);
    if (!/^PARA-[0-9]{4,}-S[0-9]{2,}$/u.test(sentence.sentenceId)) fail(`${sentence.sentenceId} is invalid`);
    if (!sentence.sentenceId.startsWith(`${sentence.paragraphId}-S`)) {
      fail(`${sentence.sentenceId} does not belong to ${sentence.paragraphId}`);
    }
    requireString(sentence.incorrectSentence, `${sentence.sentenceId}.incorrectSentence`, { maximum: 10000 });
    requireString(sentence.correctedSentence, `${sentence.sentenceId}.correctedSentence`, { maximum: 10000 });
    requireEnum(sentence.reviewPolicy, REVIEW_POLICIES, `${sentence.sentenceId}.reviewPolicy`);
    if (sentence.status !== "approved") fail(`${sentence.sentenceId} is not approved`);
    if (sentence.reviewPolicy === "exact") {
      const normalized = normalizedExactSentence(sentence.incorrectSentence);
      const duplicate = exactSentences.get(normalized);
      if (duplicate) fail(`${sentence.sentenceId} duplicates exact sentence ${duplicate}`);
      exactSentences.set(normalized, sentence.sentenceId);
    }
    // Guidance records may deliberately preserve missing source punctuation as an
    // annotated error. Exact-match records must still be complete, and every
    // approved correction must be complete regardless of partition.
    if (sentence.reviewPolicy === "exact" && !/[.!?;][\u201d"')\]]?$/u.test(sentence.incorrectSentence)) {
      fail(`${sentence.sentenceId} is not complete`);
    }
    if (!/[.!?;][\u201d"')\]]?$/u.test(sentence.correctedSentence)) {
      fail(`${sentence.sentenceId} correction is not complete`);
    }
    const sentenceIssues = (issuesBySentence.get(sentence.sentenceId) || [])
      .sort((left, right) => left.order - right.order);
    requireUniqueOrders(sentenceIssues, `${sentence.sentenceId} issues`);
    for (const issue of sentenceIssues) {
      if (!issue.issueId.startsWith(`${sentence.paragraphId}-I`)) {
        fail(`${issue.issueId} does not belong to ${sentence.paragraphId}`);
      }
    }
    const ranges = issueRangesForSentence(sentence, sentenceIssues);
    const reconstructed = applyRanges(sentence.incorrectSentence, ranges);
    if (reconstructed !== sentence.correctedSentence) {
      fail(`${sentence.sentenceId} issues reconstruct ${JSON.stringify(reconstructed)}, not the approved correction`);
    }
    const isRuntimeCandidate = (
      sentence.reviewPolicy === "exact"
      && paragraph.retrievalEligible
      && !paragraph.evaluationHoldout
      && group?.partition === "retrieval"
    );
    if (isRuntimeCandidate && sentenceIssues.length > 8) {
      fail(`${sentence.sentenceId} exceeds the portal's eight-issue limit`);
    }
  }

  for (const paragraph of paragraphs) {
    const group = groupMap.get(paragraph.groupKey);
    if (!group) fail(`${paragraph.paragraphId} references a missing group`);
    if (!/^PARA-[0-9]{4,}$/u.test(paragraph.paragraphId)) fail(`${paragraph.paragraphId} is invalid`);
    requireString(paragraph.title, `${paragraph.paragraphId}.title`, { maximum: 200 });
    requireString(paragraph.topicCategory, `${paragraph.paragraphId}.topicCategory`, { maximum: 200 });
    requireString(paragraph.studentLevel, `${paragraph.paragraphId}.studentLevel`, { maximum: 80 });
    requireString(paragraph.incorrectParagraph, `${paragraph.paragraphId}.incorrectParagraph`);
    requireString(paragraph.correctedParagraph, `${paragraph.paragraphId}.correctedParagraph`);
    requireInteger(paragraph.originalWordCount, `${paragraph.paragraphId}.originalWordCount`, { maximum: 5000 });
    requireInteger(paragraph.correctedWordCount, `${paragraph.paragraphId}.correctedWordCount`, { maximum: 5000 });
    requireInteger(paragraph.sentenceCount, `${paragraph.paragraphId}.sentenceCount`, { maximum: 500 });
    requireInteger(paragraph.issueCount, `${paragraph.paragraphId}.issueCount`, { minimum: 0, maximum: 5000 });
    requireEnum(paragraph.englishVariant, ENGLISH_VARIANTS, `${paragraph.paragraphId}.englishVariant`);
    requireString(paragraph.author, `${paragraph.paragraphId}.author`, { maximum: 120 });
    requireInteger(paragraph.version, `${paragraph.paragraphId}.version`);
    requireBoolean(paragraph.retrievalEligible, `${paragraph.paragraphId}.retrievalEligible`);
    requireBoolean(paragraph.evaluationHoldout, `${paragraph.paragraphId}.evaluationHoldout`);
    requireOptionalString(paragraph.notes, `${paragraph.paragraphId}.notes`, { maximum: 4000 });
    if (paragraph.status !== "approved") fail(`${paragraph.paragraphId} is not approved`);
    if (paragraph.evaluationHoldout && paragraph.retrievalEligible) {
      fail(`${paragraph.paragraphId} cannot be holdout and retrieval-eligible`);
    }
    if (paragraph.retrievalEligible && group.partition !== "retrieval") {
      fail(`${paragraph.paragraphId} is retrieval-eligible outside the retrieval partition`);
    }
    if (paragraph.evaluationHoldout !== (group.partition === "holdout")) {
      fail(`${paragraph.paragraphId} holdout flag does not match its group partition`);
    }
    const paragraphSentences = sentences
      .filter((sentence) => sentence.paragraphId === paragraph.paragraphId)
      .sort((left, right) => left.order - right.order);
    requireUniqueOrders(paragraphSentences, `${paragraph.paragraphId} sentences`);
    const paragraphIssues = issues.filter((issue) => (
      sentenceMap.get(issue.sentenceId)?.paragraphId === paragraph.paragraphId
    ));
    if (paragraphSentences.length !== paragraph.sentenceCount) fail(`${paragraph.paragraphId} sentence count mismatch`);
    if (paragraphIssues.length !== paragraph.issueCount) fail(`${paragraph.paragraphId} issue count mismatch`);
    if (wordCount(paragraph.incorrectParagraph) !== paragraph.originalWordCount) fail(`${paragraph.paragraphId} original word count mismatch`);
    if (wordCount(paragraph.correctedParagraph) !== paragraph.correctedWordCount) fail(`${paragraph.paragraphId} corrected word count mismatch`);
    if (paragraphSentences.map((value) => value.incorrectSentence).join(" ") !== paragraph.incorrectParagraph) {
      fail(`${paragraph.paragraphId} incorrect paragraph is not the ordered sentence join`);
    }
    if (paragraphSentences.map((value) => value.correctedSentence).join(" ") !== paragraph.correctedParagraph) {
      fail(`${paragraph.paragraphId} corrected paragraph is not the ordered sentence join`);
    }
  }

  for (const exception of exceptions) {
    if (!ruleMap.has(exception.ruleId)) fail(`${exception.exceptionId} references a missing rule`);
    if (!/^EX-[A-Z0-9_]+-[0-9]{2,}$/u.test(exception.exceptionId)) fail(`${exception.exceptionId} is invalid`);
    requireString(exception.conditionEn, `${exception.exceptionId}.conditionEn`, { maximum: 1000 });
    requireString(exception.exampleText, `${exception.exceptionId}.exampleText`, { maximum: 2000 });
    requireString(exception.explanationZhHant, `${exception.exceptionId}.explanationZhHant`, { maximum: 2000 });
    requireEnum(exception.englishVariant, ENGLISH_VARIANTS, `${exception.exceptionId}.englishVariant`);
    if (exception.status !== "approved") fail(`${exception.exceptionId} is not approved`);
  }
  for (const rule of rules) {
    requireUniqueOrders(
      exceptions.filter((exception) => exception.ruleId === rule.ruleId),
      `${rule.ruleId} exceptions`
    );
  }

  return { groups, rules, paragraphs, sentences, issues, exceptions, paragraphMap, sentenceMap, ruleMap, issuesBySentence };
}

function generatedWorkerModule(corpus, validated) {
  const entries = validated.sentences.flatMap((sentence) => {
    const paragraph = validated.paragraphMap.get(sentence.paragraphId);
    const group = validated.groups.find((value) => value.groupKey === paragraph.groupKey);
    if (
      corpus.status !== "approved"
      || paragraph.status !== "approved"
      || sentence.status !== "approved"
      || sentence.reviewPolicy !== "exact"
      || !paragraph.retrievalEligible
      || paragraph.evaluationHoldout
      || group?.partition !== "retrieval"
    ) return [];
    const sentenceIssues = (validated.issuesBySentence.get(sentence.sentenceId) || [])
      .sort((left, right) => left.order - right.order)
      .map((issue) => ({
        issueId: issue.issueId,
        ruleId: issue.ruleId,
        category: issue.category,
        originalText: issue.wrongText,
        replacementText: issue.replacementText,
        occurrence: issue.occurrence,
        explanationZhHant: issue.explanationZhHant,
        confidence: issue.confidence
      }));
    return [{
      sentenceId: sentence.sentenceId,
      paragraphId: sentence.paragraphId,
      sourceSentence: sentence.incorrectSentence,
      correctedSentence: sentence.correctedSentence,
      categories: [...new Set(sentenceIssues.map((issue) => issue.category))].sort(),
      ruleIds: [...new Set(sentenceIssues.map((issue) => issue.ruleId))].sort(),
      structureTags: structureTags(sentence, sentenceIssues),
      issues: sentenceIssues
    }];
  });

  return `// GENERATED FILE. Edit grammar-corpus/corpus-v1.json and run\n// node grammar-corpus/validate-and-generate.mjs instead.\n\nexport const CORPUS_VERSION = ${JSON.stringify(corpus.corpusVersion)};\n\nexport const CORPUS_SENTENCES = Object.freeze(${JSON.stringify(entries, null, 2)}.map((entry) => Object.freeze({\n  ...entry,\n  categories: Object.freeze(entry.categories),\n  ruleIds: Object.freeze(entry.ruleIds),\n  structureTags: Object.freeze(entry.structureTags),\n  issues: Object.freeze(entry.issues.map((issue) => Object.freeze(issue)))\n})));\n`;
}

function seedSql(corpus, validated, contentHash) {
  const lines = [
    "-- GENERATED FILE. Apply after ../supabase-writing-grammar-corpus.sql.",
    "-- Source: corpus-v1.json",
    "",
    "begin;",
    "",
    "do $$",
    "declare",
    "  v_existing_hash text;",
    "  v_existing_status text;",
    "begin",
    `  select content_sha256, status into v_existing_hash, v_existing_status from public.writing_grammar_corpus_releases where corpus_version = ${sqlLiteral(corpus.corpusVersion)};`,
    `  if v_existing_hash is not null and v_existing_hash <> ${sqlLiteral(contentHash)} then`,
    "    raise exception 'Corpus version already exists with different content';",
    "  end if;",
    "  if v_existing_hash is not null and v_existing_status <> 'approved' then",
    "    raise exception 'Corpus version exists but is not an approved release';",
    "  end if;",
    "end;",
    "$$;",
    "",
    `update public.writing_grammar_corpus_releases set is_current = false where is_current and corpus_version <> ${sqlLiteral(corpus.corpusVersion)};`,
    "",
    "insert into public.writing_grammar_corpus_releases (corpus_version, schema_version, status, is_current, title, notes, content_sha256, approved_at)",
    `values (${sqlLiteral(corpus.corpusVersion)}, ${corpus.schemaVersion}, 'reviewed', false, ${sqlLiteral(corpus.title)}, ${sqlLiteral(corpus.notes)}, ${sqlLiteral(contentHash)}, null)`,
    "on conflict (corpus_version) do nothing;",
    ""
  ];

  for (const group of validated.groups) {
    lines.push(
      "insert into public.writing_grammar_corpus_groups (corpus_version, group_key, partition, description)",
      `select ${sqlLiteral(corpus.corpusVersion)}, ${sqlLiteral(group.groupKey)}, ${sqlLiteral(group.partition)}, ${sqlLiteral(group.description)}`,
      `where exists (select 1 from public.writing_grammar_corpus_releases where corpus_version = ${sqlLiteral(corpus.corpusVersion)} and status = 'reviewed') on conflict do nothing;`
    );
  }
  lines.push("");

  for (const rule of validated.rules) {
    lines.push(
      "insert into public.writing_grammar_rules (corpus_version, rule_id, title_zh_hant, grammar_category, formula, structural_signature, incorrect_pattern, correct_pattern, explanation_zh_hant, correct_examples, incorrect_examples, alternative_corrections, english_variant, status, author, version)",
      `select ${sqlLiteral(corpus.corpusVersion)}, ${sqlLiteral(rule.ruleId)}, ${sqlLiteral(rule.titleZhHant)}, ${sqlLiteral(rule.grammarCategory)}, ${sqlLiteral(rule.formula)}, ${sqlJson(rule.structuralSignature)}, ${sqlLiteral(rule.incorrectPattern)}, ${sqlLiteral(rule.correctPattern)}, ${sqlLiteral(rule.explanationZhHant)}, ${sqlJson(rule.correctExamples)}, ${sqlJson(rule.incorrectExamples)}, ${sqlJson(rule.alternativeCorrections)}, ${sqlLiteral(rule.englishVariant)}, ${sqlLiteral(rule.status)}, ${sqlLiteral(rule.author)}, ${rule.version}`,
      `where exists (select 1 from public.writing_grammar_corpus_releases where corpus_version = ${sqlLiteral(corpus.corpusVersion)} and status = 'reviewed') on conflict do nothing;`
    );
  }
  lines.push("");

  for (const paragraph of validated.paragraphs) {
    lines.push(
      "insert into public.writing_grammar_paragraphs (corpus_version, paragraph_id, group_key, title, topic_category, student_level, incorrect_paragraph, corrected_paragraph, original_word_count, corrected_word_count, sentence_count, issue_count, english_variant, author, status, version, retrieval_eligible, evaluation_holdout, notes)",
      `select ${sqlLiteral(corpus.corpusVersion)}, ${sqlLiteral(paragraph.paragraphId)}, ${sqlLiteral(paragraph.groupKey)}, ${sqlLiteral(paragraph.title)}, ${sqlLiteral(paragraph.topicCategory)}, ${sqlLiteral(paragraph.studentLevel)}, ${sqlLiteral(paragraph.incorrectParagraph)}, ${sqlLiteral(paragraph.correctedParagraph)}, ${paragraph.originalWordCount}, ${paragraph.correctedWordCount}, ${paragraph.sentenceCount}, ${paragraph.issueCount}, ${sqlLiteral(paragraph.englishVariant)}, ${sqlLiteral(paragraph.author)}, ${sqlLiteral(paragraph.status)}, ${paragraph.version}, ${paragraph.retrievalEligible}, ${paragraph.evaluationHoldout}, ${sqlLiteral(paragraph.notes)}`,
      `where exists (select 1 from public.writing_grammar_corpus_releases where corpus_version = ${sqlLiteral(corpus.corpusVersion)} and status = 'reviewed') on conflict do nothing;`
    );
  }
  lines.push("");

  for (const sentence of validated.sentences) {
    lines.push(
      "insert into public.writing_grammar_sentences (corpus_version, sentence_id, paragraph_id, sentence_order, incorrect_sentence, corrected_sentence, review_policy, status)",
      `select ${sqlLiteral(corpus.corpusVersion)}, ${sqlLiteral(sentence.sentenceId)}, ${sqlLiteral(sentence.paragraphId)}, ${sentence.order}, ${sqlLiteral(sentence.incorrectSentence)}, ${sqlLiteral(sentence.correctedSentence)}, ${sqlLiteral(sentence.reviewPolicy)}, ${sqlLiteral(sentence.status)}`,
      `where exists (select 1 from public.writing_grammar_corpus_releases where corpus_version = ${sqlLiteral(corpus.corpusVersion)} and status = 'reviewed') on conflict do nothing;`
    );
  }
  lines.push("");

  for (const issue of validated.issues) {
    lines.push(
      "insert into public.writing_grammar_issues (corpus_version, issue_id, source_issue_id, sentence_id, issue_order, wrong_text, replacement_text, occurrence_index, rule_id, explanation_zh_hant, acceptable_alternatives, confidence, status)",
      `select ${sqlLiteral(corpus.corpusVersion)}, ${sqlLiteral(issue.issueId)}, ${sqlLiteral(issue.sourceIssueId)}, ${sqlLiteral(issue.sentenceId)}, ${issue.order}, ${sqlLiteral(issue.wrongText)}, ${sqlLiteral(issue.replacementText)}, ${issue.occurrence}, ${sqlLiteral(issue.ruleId)}, ${sqlLiteral(issue.explanationZhHant)}, ${sqlJson(issue.acceptableAlternatives)}, ${issue.confidence}, ${sqlLiteral(issue.status)}`,
      `where exists (select 1 from public.writing_grammar_corpus_releases where corpus_version = ${sqlLiteral(corpus.corpusVersion)} and status = 'reviewed') on conflict do nothing;`
    );
  }
  lines.push("");

  for (const exception of validated.exceptions) {
    lines.push(
      "insert into public.writing_grammar_rule_exceptions (corpus_version, exception_id, rule_id, exception_order, condition_en, example_text, explanation_zh_hant, english_variant, status)",
      `select ${sqlLiteral(corpus.corpusVersion)}, ${sqlLiteral(exception.exceptionId)}, ${sqlLiteral(exception.ruleId)}, ${exception.order}, ${sqlLiteral(exception.conditionEn)}, ${sqlLiteral(exception.exampleText)}, ${sqlLiteral(exception.explanationZhHant)}, ${sqlLiteral(exception.englishVariant)}, ${sqlLiteral(exception.status)}`,
      `where exists (select 1 from public.writing_grammar_corpus_releases where corpus_version = ${sqlLiteral(corpus.corpusVersion)} and status = 'reviewed') on conflict do nothing;`
    );
  }

  lines.push(
    "",
    "do $$",
    "begin",
    `  if (select count(*) from public.writing_grammar_corpus_groups where corpus_version = ${sqlLiteral(corpus.corpusVersion)}) <> ${validated.groups.length}`,
    `    or (select count(*) from public.writing_grammar_paragraphs where corpus_version = ${sqlLiteral(corpus.corpusVersion)}) <> ${validated.paragraphs.length}`,
    `    or (select count(*) from public.writing_grammar_sentences where corpus_version = ${sqlLiteral(corpus.corpusVersion)}) <> ${validated.sentences.length}`,
    `    or (select count(*) from public.writing_grammar_issues where corpus_version = ${sqlLiteral(corpus.corpusVersion)}) <> ${validated.issues.length}`,
    `    or (select count(*) from public.writing_grammar_rules where corpus_version = ${sqlLiteral(corpus.corpusVersion)}) <> ${validated.rules.length}`,
    `    or (select count(*) from public.writing_grammar_rule_exceptions where corpus_version = ${sqlLiteral(corpus.corpusVersion)}) <> ${validated.exceptions.length}`,
    "  then",
    "    raise exception 'Corpus seed counts do not match the approved release';",
    "  end if;",
    "end;",
    "$$;",
    "",
    `update public.writing_grammar_corpus_releases set status = 'approved', is_current = true, approved_at = ${sqlLiteral(corpus.approvedAt)}::timestamptz where corpus_version = ${sqlLiteral(corpus.corpusVersion)} and status = 'reviewed';`,
    `update public.writing_grammar_corpus_releases set is_current = true where corpus_version = ${sqlLiteral(corpus.corpusVersion)} and status = 'approved' and not is_current;`,
    "",
    "commit;",
    ""
  );
  return lines.join("\n");
}

function writeSheets(validated) {
  fs.mkdirSync(CSV_DIRECTORY, { recursive: true });
  fs.writeFileSync(path.join(CSV_DIRECTORY, "Groups.csv"), csv(validated.groups, [
    "groupKey", "partition", "description"
  ]));
  fs.writeFileSync(path.join(CSV_DIRECTORY, "Paragraphs.csv"), csv(validated.paragraphs, [
    "paragraphId", "groupKey", "title", "topicCategory", "studentLevel",
    "incorrectParagraph", "correctedParagraph", "originalWordCount", "correctedWordCount",
    "sentenceCount", "issueCount", "englishVariant", "author", "status", "version",
    "retrievalEligible", "evaluationHoldout", "notes"
  ]));
  fs.writeFileSync(path.join(CSV_DIRECTORY, "Sentences.csv"), csv(validated.sentences, [
    "sentenceId", "paragraphId", "order", "incorrectSentence", "correctedSentence",
    "reviewPolicy", "status"
  ]));
  fs.writeFileSync(path.join(CSV_DIRECTORY, "Issues.csv"), csv(validated.issues, [
    "issueId", "sourceIssueId", "sentenceId", "order", "wrongText", "replacementText",
    "occurrence", "ruleId", "explanationZhHant", "acceptableAlternatives", "confidence", "status"
  ]));
  fs.writeFileSync(path.join(CSV_DIRECTORY, "Rules.csv"), csv(validated.rules, [
    "ruleId", "titleZhHant", "grammarCategory", "formula", "structuralSignature",
    "incorrectPattern", "correctPattern", "explanationZhHant", "correctExamples",
    "incorrectExamples", "alternativeCorrections", "englishVariant", "status", "version", "author"
  ]));
  fs.writeFileSync(path.join(CSV_DIRECTORY, "Exceptions.csv"), csv(validated.exceptions, [
    "exceptionId", "ruleId", "order", "conditionEn", "exampleText", "explanationZhHant",
    "englishVariant", "status"
  ]));
}

const source = fs.readFileSync(SOURCE_PATH, "utf8");
const corpus = JSON.parse(source);
const validated = validateCorpus(corpus);
const canonical = canonicalJson(corpus);
const contentHash = crypto.createHash("sha256").update(canonical).digest("hex");

fs.writeFileSync(WORKER_OUTPUT, generatedWorkerModule(corpus, validated));
fs.writeFileSync(SQL_OUTPUT, seedSql(corpus, validated, contentHash));
writeSheets(validated);

console.log(JSON.stringify({
  corpusVersion: corpus.corpusVersion,
  contentSha256: contentHash,
  groups: validated.groups.length,
  paragraphs: validated.paragraphs.length,
  sentences: validated.sentences.length,
  issues: validated.issues.length,
  rules: validated.rules.length,
  exceptions: validated.exceptions.length,
  workerOutput: WORKER_OUTPUT,
  sqlOutput: SQL_OUTPUT,
  csvDirectory: CSV_DIRECTORY
}, null, 2));
