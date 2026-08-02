import {
  CORPUS_GUIDANCE_SENTENCES,
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
  "quoted_text", "suspect_preference_bare_complement",
  "suspect_singular_subject_base_verb"
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
const SIMPLE_BASE_VERBS = new Set([
  "accept", "allow", "answer", "arrive", "ask", "avoid", "become", "begin",
  "believe", "bring", "build", "buy", "call", "carry", "change", "choose",
  "collect", "consider", "create", "decide", "deliver", "deny", "develop",
  "discuss", "drink", "drive", "eat", "enjoy", "expect", "explain", "feel",
  "find", "finish", "follow", "get", "give", "go", "grow", "hate", "help",
  "hope", "imagine", "improve", "include", "increase", "keep", "know", "learn",
  "leave", "like", "live", "look", "love", "make", "manage", "mean", "need",
  "offer", "open", "pay", "plan", "play", "prefer", "prepare", "provide",
  "read", "receive", "recommend", "reduce", "remember", "repair", "reply",
  "require", "return", "risk", "run", "save", "say", "see", "sell", "send",
  "show", "sleep", "spend", "start", "stay", "stop", "study", "suggest",
  "support", "take", "talk", "teach", "tell", "think", "travel", "try", "use",
  "visit", "wait", "walk", "want", "watch", "wear", "win", "work", "write"
]);
const PREFERENCE_VERBS = new Set([
  "hate", "hates", "like", "likes", "love", "loves", "prefer", "prefers"
]);
const NON_NAME_INITIALS = new Set([
  "always", "although", "every", "many", "may", "never", "please", "some",
  "the", "these", "those", "to"
]);
const SINGULAR_DETERMINERS = new Set([
  "a", "an", "each", "every", "her", "his", "its", "my", "that", "the", "this"
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

function inferredStructuralCategories(sentence) {
  const words = [...sentence.matchAll(/[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*/gu)]
    .map((match) => ({
      exact: match[0],
      lower: match[0].toLocaleLowerCase("en-GB")
    }));
  const categories = new Set();
  for (let index = 0; index < words.length - 1; index += 1) {
    if (
      PREFERENCE_VERBS.has(words[index].lower)
      && SIMPLE_BASE_VERBS.has(words[index + 1].lower)
    ) {
      categories.add("infinitive_or_gerund");
    }
  }
  const first = words[0];
  const second = words[1];
  if (first && second && SIMPLE_BASE_VERBS.has(second.lower)) {
    const singularPronoun = ["he", "it", "she", "that", "this"].includes(first.lower);
    const likelyProperName = (
      /^[\p{Lu}][\p{L}\p{M}'’\-]*$/u.test(first.exact)
      && !NON_NAME_INITIALS.has(first.lower)
    );
    if (singularPronoun || likelyProperName) {
      categories.add("subject_verb_agreement");
    }
  }
  const third = words[2];
  if (
    first
    && second
    && third
    && SINGULAR_DETERMINERS.has(first.lower)
    && !/s$/u.test(second.lower)
    && SIMPLE_BASE_VERBS.has(third.lower)
  ) {
    categories.add("subject_verb_agreement");
  }
  return categories;
}

function structuralProfile(sentence) {
  const tokens = [];
  const tags = new Set();
  const inferredCategories = inferredStructuralCategories(sentence);
  if (inferredCategories.has("subject_verb_agreement")) {
    tags.add("suspect_singular_subject_base_verb");
  }
  if (inferredCategories.has("infinitive_or_gerund")) {
    tags.add("suspect_preference_bare_complement");
  }
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
    tags,
    inferredCategories
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
  const explanations = (Array.isArray(entry.issues) ? entry.issues : [])
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

function normalizeGuideEntry(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Approved grammar corpus guide must be an object");
  }
  if (
    value.evaluationHoldout === true
    || value.partition === "holdout"
    || value.reviewPolicy === "abstain"
    || (value.status !== undefined && value.status !== "approved")
  ) {
    throw new TypeError("Holdout or abstaining grammar corpus material cannot enter guidance");
  }
  const sentenceId = requireBoundedString(value.sentenceId, "guide sentence id", 120);
  const paragraphId = requireBoundedString(value.paragraphId, "guide paragraph id", 120);
  const sourceSentence = requireBoundedString(
    value.sourceSentence,
    "guide source sentence",
    GENERAL_CORRECTION_MAX_SOURCE_CHARACTERS
  );
  const correctedSentence = requireBoundedString(
    value.correctedSentence,
    "guide corrected sentence",
    GENERAL_CORRECTION_MAX_TARGET_CHARACTERS
  );
  const categories = normalizedStringArray(
    value.categories,
    "guide categories",
    { allowed: CATEGORY_IDS }
  );
  const ruleIds = normalizedStringArray(value.ruleIds, "guide rule ids");
  const explicitTags = normalizedStringArray(value.structureTags, "guide structure tags");
  const profile = structuralProfile(sourceSentence);
  return Object.freeze({
    sentenceId,
    paragraphId,
    sourceSentence,
    correctedSentence,
    categories,
    ruleIds,
    structureTags: new Set([...explicitTags, ...profile.tags]),
    profile,
    explanationZhHant: guideExplanation(value)
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
  corpusSentences = CORPUS_SENTENCES,
  corpusGuidanceSentences = null
} = {}) {
  const version = requireBoundedString(corpusVersion, "version", 120);
  if (!Array.isArray(corpusSentences)) {
    throw new TypeError("CORPUS_SENTENCES must be an array");
  }
  const guidanceSource = corpusGuidanceSentences === null
    ? (corpusSentences === CORPUS_SENTENCES ? CORPUS_GUIDANCE_SENTENCES : corpusSentences)
    : corpusGuidanceSentences;
  if (!Array.isArray(guidanceSource)) {
    throw new TypeError("CORPUS_GUIDANCE_SENTENCES must be an array");
  }
  const engine = Object.freeze({
    name: "edmund-approved-grammar-corpus",
    model: "approved-corpus",
    version,
    execution: "cloudflare-worker"
  });
  const entries = corpusSentences.map((entry) => normalizeEntry(entry, engine));
  const guides = guidanceSource.map(normalizeGuideEntry);
  const exact = new Map();
  const approvedClean = new Map();
  const ids = new Set();
  const guideIds = new Set();
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
  for (const guide of guides) {
    if (guideIds.has(guide.sentenceId)) {
      throw new TypeError(`Duplicate approved grammar corpus guide id: ${guide.sentenceId}`);
    }
    guideIds.add(guide.sentenceId);
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
    const profile = structuralProfile(sentence);
    const categories = new Set([
      ...profile.inferredCategories,
      ...(Array.isArray(categoryHints) ? categoryHints : [])
        .filter((category) => CATEGORY_IDS.has(category))
    ]);
    const ranked = [];
    for (const entry of guides) {
      if (entry.sourceSentence === sentence) continue;
      const entryCategories = new Set(entry.categories);
      const categoryOverlap = intersectionCount(categories, entryCategories);
      if (categories.size && !categoryOverlap) continue;
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
    guideSize: guides.length,
    lookupApprovedExactCorrection,
    selectApprovedGrammarGuides
  });
}

const DEFAULT_RUNTIME = createGrammarCorpusRuntime();

export const GRAMMAR_CORPUS_ENGINE = DEFAULT_RUNTIME.engine;
export const GRAMMAR_CORPUS_VERSION = DEFAULT_RUNTIME.version;
export const GRAMMAR_CORPUS_SIZE = DEFAULT_RUNTIME.size;
export const GRAMMAR_CORPUS_GUIDE_SIZE = DEFAULT_RUNTIME.guideSize;
export const lookupApprovedExactCorrection = DEFAULT_RUNTIME.lookupApprovedExactCorrection;
export const selectApprovedGrammarGuides = DEFAULT_RUNTIME.selectApprovedGrammarGuides;
