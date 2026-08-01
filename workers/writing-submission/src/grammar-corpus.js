import {
  CORPUS_SENTENCES,
  CORPUS_VERSION
} from "./grammar-corpus.generated.js";
import {
  GENERAL_CORRECTION_CATEGORIES,
  GENERAL_CORRECTION_MAX_ISSUES,
  GENERAL_CORRECTION_MAX_SOURCE_CHARACTERS,
  GENERAL_CORRECTION_MAX_TARGET_CHARACTERS,
  applyGeneralCorrectionIssues,
  materializeGeneralCorrection
} from "./general-correction.js";

const CATEGORY_IDS = new Set(Object.keys(GENERAL_CORRECTION_CATEGORIES));
const MAX_GUIDES = 3;
const MAX_GUIDE_EXPLANATION_CHARACTERS = 700;
const MIN_GUIDE_BIGRAM_SIMILARITY = 0.65;
const MIN_GUIDE_BIGRAM_COUNT = 3;
const TOKEN_RE = /[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*|\p{N}+(?:[.,:/-]\p{N}+)*|[^\p{L}\p{M}\p{N}\s]/gu;

// Morphological and length tags (for example, s_form or short_sentence) are
// useful for ranking after a candidate is known to be structurally relevant,
// but are far too broad to establish relevance by themselves. Without this
// gate, an already-correct sentence such as "Water evaporates." can retrieve
// unrelated modal/countability examples merely because both contain an
// s-ending word. Only these higher-signal tags may independently qualify a
// guide when the first model pass supplied no category hint.
const GUIDE_SIGNAL_TAGS = new Set([
  "contains_modal", "contains_auxiliary", "contains_to", "coordination",
  "conditional", "comparison", "negation", "semicolon", "question",
  "quoted_text"
]);

// Closed-class words carry useful grammatical structure. Content words are
// deliberately reduced to morphological shapes so names and subject matter do
// not make an otherwise unrelated corpus example look relevant.
const STRUCTURAL_WORDS = new Set([
  "a", "an", "the", "this", "that", "these", "those", "some", "any",
  "each", "every", "many", "much", "few", "fewer", "less", "more", "most",
  "i", "me", "my", "mine", "you", "your", "yours", "he", "him", "his",
  "she", "her", "hers", "it", "its", "we", "us", "our", "ours", "they",
  "them", "their", "theirs", "who", "whom", "whose", "which", "what",
  "am", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "having", "do", "does", "did", "doing", "done",
  "can", "could", "may", "might", "must", "shall", "should", "will", "would",
  "and", "but", "or", "nor", "so", "yet", "because", "if", "unless",
  "when", "while", "although", "though", "than", "as",
  "at", "by", "for", "from", "in", "into", "of", "on", "onto", "to",
  "with", "about", "through", "during", "before", "after", "above", "below",
  "not", "no", "never"
]);

const MODALS = new Set([
  "can", "could", "may", "might", "must", "shall", "should", "will", "would"
]);
const AUXILIARIES = new Set([
  "am", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "having", "do", "does", "did", "doing", "done"
]);

function freezeArray(values) {
  return Object.freeze(values.map((value) => (
    value && typeof value === "object" ? Object.freeze(value) : value
  )));
}

function requireBoundedString(value, label, maximum) {
  if (typeof value !== "string" || !value.trim() || value.length > maximum) {
    throw new TypeError(`Approved grammar corpus ${label} is invalid`);
  }
  return value;
}

function normalizedStringArray(value, label, { allowed = null } = {}) {
  if (!Array.isArray(value)) throw new TypeError(`Approved grammar corpus ${label} must be an array`);
  const normalized = [];
  const seen = new Set();
  for (const item of value) {
    if (typeof item !== "string" || !item.trim() || item.length > 120) {
      throw new TypeError(`Approved grammar corpus ${label} contains an invalid value`);
    }
    const text = item.trim();
    if (allowed && !allowed.has(text)) {
      throw new TypeError(`Approved grammar corpus ${label} contains an unknown value`);
    }
    if (!seen.has(text)) {
      seen.add(text);
      normalized.push(text);
    }
  }
  return Object.freeze(normalized);
}

function normalizeIssueMetadata(value, ruleIds, categories) {
  if (!Array.isArray(value) || value.length > GENERAL_CORRECTION_MAX_ISSUES) {
    throw new TypeError("Approved grammar corpus issue metadata is invalid");
  }
  return Object.freeze(value.map((issue) => {
    if (!issue || typeof issue !== "object" || Array.isArray(issue)) {
      throw new TypeError("Approved grammar corpus issue metadata must contain objects");
    }
    const ruleId = requireBoundedString(issue.ruleId, "issue rule id", 120);
    const category = requireBoundedString(issue.category, "issue category", 120);
    if (!ruleIds.includes(ruleId)) {
      throw new TypeError(`Approved grammar corpus issue refers to an undeclared rule: ${ruleId}`);
    }
    if (!CATEGORY_IDS.has(category) || !categories.includes(category)) {
      throw new TypeError(`Approved grammar corpus issue refers to an undeclared category: ${category}`);
    }
    requireBoundedString(issue.originalText, "issue original text", 500);
    requireBoundedString(issue.replacementText, "issue replacement text", 700);
    requireBoundedString(issue.explanationZhHant, "issue explanation", 700);
    if (!Number.isSafeInteger(issue.occurrence) || issue.occurrence < 1) {
      throw new TypeError("Approved grammar corpus issue occurrence is invalid");
    }
    if (!Number.isFinite(issue.confidence) || issue.confidence < 0.5 || issue.confidence > 1) {
      throw new TypeError("Approved grammar corpus issue confidence is invalid");
    }
    return Object.freeze({ ...issue, ruleId, category });
  }));
}

function contentWordShape(word) {
  if (/ing$/u.test(word) && word.length > 4) return "WORD_ING";
  if (/ed$/u.test(word) && word.length > 3) return "WORD_ED";
  if (/(?:ies|es|s)$/u.test(word) && word.length > 3) return "WORD_S";
  return "WORD";
}

function structuralProfile(sentence) {
  const tokens = [];
  const tags = new Set();
  for (const match of sentence.matchAll(TOKEN_RE)) {
    const token = match[0];
    if (/^\p{N}/u.test(token)) {
      tokens.push("NUMBER");
      tags.add("contains_number");
      continue;
    }
    if (/^[\p{L}\p{M}]/u.test(token)) {
      const word = token.toLocaleLowerCase("en-GB");
      tokens.push(STRUCTURAL_WORDS.has(word) ? word : contentWordShape(word));
      if (MODALS.has(word)) tags.add("contains_modal");
      if (AUXILIARIES.has(word)) tags.add("contains_auxiliary");
      if (word === "to") tags.add("contains_to");
      if (["and", "but", "or", "nor"].includes(word)) tags.add("coordination");
      if (["if", "unless"].includes(word)) tags.add("conditional");
      if (["than", "as", "more", "most", "less", "fewer"].includes(word)) {
        tags.add("comparison");
      }
      if (["not", "no", "never"].includes(word)) tags.add("negation");
      continue;
    }
    tokens.push(token);
    if (token === ";") tags.add("semicolon");
    if (token === "?") tags.add("question");
    if (["\"", "“", "”", "‘", "’"].includes(token)) tags.add("quoted_text");
  }
  if (tokens.includes("WORD_ING")) tags.add("ing_form");
  if (tokens.includes("WORD_ED")) tags.add("ed_form");
  if (tokens.includes("WORD_S")) tags.add("s_form");
  if (tokens.length > 16) tags.add("long_sentence");
  else if (tokens.length <= 7) tags.add("short_sentence");

  const unigrams = new Set(tokens);
  const bigrams = new Set();
  for (let index = 1; index < tokens.length; index += 1) {
    bigrams.add(`${tokens[index - 1]}\u0000${tokens[index]}`);
  }
  return Object.freeze({
    tokens: Object.freeze(tokens),
    unigrams,
    bigrams,
    tags
  });
}

function diceSimilarity(left, right) {
  if (!left.size && !right.size) return 1;
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const value of left) if (right.has(value)) intersection += 1;
  return (2 * intersection) / (left.size + right.size);
}

function intersectionCount(left, right) {
  let count = 0;
  for (const value of left) if (right.has(value)) count += 1;
  return count;
}

function guideExplanation(entry) {
  if (typeof entry.explanationZhHant === "string" && entry.explanationZhHant.trim()) {
    return entry.explanationZhHant.trim().slice(0, MAX_GUIDE_EXPLANATION_CHARACTERS);
  }
  const explanations = entry.issues
    .map((issue) => issue?.explanationZhHant)
    .filter((value) => typeof value === "string" && value.trim());
  return explanations.join(" ").slice(0, MAX_GUIDE_EXPLANATION_CHARACTERS);
}

function normalizeEntry(value, engine) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Approved grammar corpus entry must be an object");
  }
  if (
    value.evaluationHoldout === true
    || value.retrievalEligible === false
    || value.partition === "holdout"
    || (value.status !== undefined && value.status !== "approved")
  ) {
    throw new TypeError("Non-retrieval grammar corpus material cannot enter the runtime");
  }
  const sentenceId = requireBoundedString(value.sentenceId, "sentence id", 120);
  const paragraphId = requireBoundedString(value.paragraphId, "paragraph id", 120);
  const sourceSentence = requireBoundedString(
    value.sourceSentence,
    "source sentence",
    GENERAL_CORRECTION_MAX_SOURCE_CHARACTERS
  );
  const correctedSentence = requireBoundedString(
    value.correctedSentence,
    "corrected sentence",
    GENERAL_CORRECTION_MAX_TARGET_CHARACTERS
  );
  const categories = normalizedStringArray(
    value.categories,
    "categories",
    { allowed: CATEGORY_IDS }
  );
  const ruleIds = normalizedStringArray(value.ruleIds, "rule ids");
  const explicitTags = normalizedStringArray(value.structureTags, "structure tags");
  const issuesMetadata = normalizeIssueMetadata(value.issues, ruleIds, categories);
  const profile = structuralProfile(sourceSentence);
  const structureTags = new Set([...explicitTags, ...profile.tags]);
  const issues = materializeGeneralCorrection(
    sourceSentence,
    correctedSentence,
    issuesMetadata,
    engine,
    { allowMeaningSensitiveChanges: true }
  );
  if (
    !issues
    || issues.length > GENERAL_CORRECTION_MAX_ISSUES
    || applyGeneralCorrectionIssues(sourceSentence, issues) !== correctedSentence
  ) {
    throw new TypeError(`Approved grammar corpus entry cannot be safely materialized: ${sentenceId}`);
  }
  return Object.freeze({
    sentenceId,
    paragraphId,
    sourceSentence,
    correctedSentence,
    categories,
    ruleIds,
    structureTags,
    profile,
    explanationZhHant: guideExplanation({ ...value, issues: issuesMetadata }),
    issues
  });
}

function guideFromEntry(entry) {
  return Object.freeze({
    sentenceId: entry.sentenceId,
    paragraphId: entry.paragraphId,
    sourceSentence: entry.sourceSentence,
    correctedSentence: entry.correctedSentence,
    categories: entry.categories,
    ruleIds: entry.ruleIds,
    structureTags: Object.freeze([...entry.structureTags].sort()),
    explanationZhHant: entry.explanationZhHant
  });
}

export function createGrammarCorpusRuntime({
  corpusVersion = CORPUS_VERSION,
  corpusSentences = CORPUS_SENTENCES
} = {}) {
  const version = requireBoundedString(corpusVersion, "version", 120);
  if (!Array.isArray(corpusSentences)) {
    throw new TypeError("CORPUS_SENTENCES must be an array");
  }
  const engine = Object.freeze({
    name: "edmund-approved-grammar-corpus",
    model: "approved-corpus",
    version,
    execution: "cloudflare-worker"
  });
  const entries = corpusSentences.map((entry) => normalizeEntry(entry, engine));
  const exact = new Map();
  const approvedClean = new Map();
  const ids = new Set();
  for (const entry of entries) {
    if (ids.has(entry.sentenceId)) {
      throw new TypeError(`Duplicate approved grammar corpus sentence id: ${entry.sentenceId}`);
    }
    if (exact.has(entry.sourceSentence)) {
      throw new TypeError(`Duplicate approved grammar corpus sentence: ${entry.sentenceId}`);
    }
    ids.add(entry.sentenceId);
    exact.set(entry.sourceSentence, entry);
  }
  for (const entry of entries) {
    const conflictingSource = exact.get(entry.correctedSentence);
    if (
      conflictingSource
      && conflictingSource.correctedSentence !== entry.correctedSentence
    ) {
      throw new TypeError(
        `Approved grammar corpus marks a corrected sentence as incorrect: ${entry.sentenceId}`
      );
    }
    if (!approvedClean.has(entry.correctedSentence)) {
      approvedClean.set(entry.correctedSentence, entry);
    }
  }

  function lookupApprovedExactCorrection(sentence) {
    if (typeof sentence !== "string") throw new TypeError("sentence must be a string");
    const sourceEntry = exact.get(sentence);
    const entry = sourceEntry || approvedClean.get(sentence);
    if (!entry) return null;
    return Object.freeze({
      corpusId: entry.sentenceId,
      sentenceId: entry.sentenceId,
      paragraphId: entry.paragraphId,
      corpusVersion: version,
      sourceSentence: sentence,
      correctedSentence: sourceEntry ? entry.correctedSentence : sentence,
      categories: sourceEntry ? entry.categories : Object.freeze([]),
      ruleIds: sourceEntry ? entry.ruleIds : Object.freeze([]),
      engine,
      issues: sourceEntry ? entry.issues : Object.freeze([])
    });
  }

  function selectApprovedGrammarGuides(sentence, categoryHints = [], { limit = MAX_GUIDES } = {}) {
    if (typeof sentence !== "string") throw new TypeError("sentence must be a string");
    const requestedLimit = Math.max(0, Math.min(
      MAX_GUIDES,
      Number.isSafeInteger(limit) ? limit : MAX_GUIDES
    ));
    if (!requestedLimit || !sentence.trim()) return Object.freeze([]);
    const categories = new Set(
      (Array.isArray(categoryHints) ? categoryHints : [])
        .filter((category) => CATEGORY_IDS.has(category))
    );
    const profile = structuralProfile(sentence);
    const ranked = [];
    for (const entry of entries) {
      if (entry.sourceSentence === sentence || entry.sourceSentence === entry.correctedSentence) continue;
      const entryCategories = new Set(entry.categories);
      const categoryOverlap = intersectionCount(categories, entryCategories);
      const tagOverlap = intersectionCount(profile.tags, entry.structureTags);
      const signalTagOverlap = intersectionCount(
        new Set([...profile.tags].filter((tag) => GUIDE_SIGNAL_TAGS.has(tag))),
        entry.structureTags
      );
      const bigramSimilarity = diceSimilarity(profile.bigrams, entry.profile.bigrams);
      const hasSubstantialBigramEvidence = (
        profile.bigrams.size >= MIN_GUIDE_BIGRAM_COUNT
        && bigramSimilarity >= MIN_GUIDE_BIGRAM_SIMILARITY
      );
      const unigramSimilarity = diceSimilarity(profile.unigrams, entry.profile.unigrams);
      const lengthSimilarity = 1 - (
        Math.abs(profile.tokens.length - entry.profile.tokens.length)
        / Math.max(1, profile.tokens.length, entry.profile.tokens.length)
      );
      const score = (
        categoryOverlap * 20
        + tagOverlap * 4
        + bigramSimilarity * 8
        + unigramSimilarity * 3
        + lengthSimilarity
      );
      // Category agreement is strongest. Without it, require a meaningful
      // structural signal or substantial token-shape bigram similarity. Weak
      // morphology/length tags alone may rank a qualified candidate but must
      // never make an unrelated example eligible.
      if (
        !categoryOverlap
        && !signalTagOverlap
        && !hasSubstantialBigramEvidence
      ) continue;
      ranked.push({
        entry,
        score,
        categoryOverlap,
        tagOverlap,
        signalTagOverlap,
        bigramSimilarity
      });
    }
    ranked.sort((left, right) => (
      right.score - left.score
      || right.categoryOverlap - left.categoryOverlap
      || right.signalTagOverlap - left.signalTagOverlap
      || right.tagOverlap - left.tagOverlap
      || right.bigramSimilarity - left.bigramSimilarity
      || left.entry.sentenceId.localeCompare(right.entry.sentenceId, "en")
    ));
    return freezeArray(ranked.slice(0, requestedLimit).map(({ entry }) => guideFromEntry(entry)));
  }

  return Object.freeze({
    version,
    engine,
    size: entries.length,
    lookupApprovedExactCorrection,
    selectApprovedGrammarGuides
  });
}

const DEFAULT_RUNTIME = createGrammarCorpusRuntime();

export const GRAMMAR_CORPUS_ENGINE = DEFAULT_RUNTIME.engine;
export const GRAMMAR_CORPUS_VERSION = DEFAULT_RUNTIME.version;
export const GRAMMAR_CORPUS_SIZE = DEFAULT_RUNTIME.size;
export const lookupApprovedExactCorrection = DEFAULT_RUNTIME.lookupApprovedExactCorrection;
export const selectApprovedGrammarGuides = DEFAULT_RUNTIME.selectApprovedGrammarGuides;
