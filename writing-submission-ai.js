export const WRITING_GRAMMAR_ENGINE_IDS = Object.freeze({
  local: "edmund-esl-basics",
  harper: "harper.js",
  ai: "cloudflare-workers-ai"
});

export const WRITING_GRAMMAR_CATEGORY_TITLES = Object.freeze({
  subject_verb_agreement: "主語與動詞一致",
  article_or_determiner: "冠詞與限定詞",
  singular_plural: "名詞單複數",
  countability: "可數與不可數名詞",
  verb_form_or_tense: "動詞形式與時態",
  modal_or_auxiliary: "助動詞與情態動詞",
  infinitive_or_gerund: "不定詞與動名詞",
  preposition: "介詞用法",
  pronoun: "代名詞用法",
  sentence_structure: "句子結構",
  conjunction: "連接詞用法",
  parallelism: "平行結構",
  comparison: "比較結構",
  possessive: "所有格",
  punctuation: "標點符號",
  spelling_or_spacing: "拼字與空格",
  word_form: "詞性與字形",
  word_choice: "字詞用法",
  other_grammar: "其他文法問題"
});

const ENGINE_PRIORITY = Object.freeze({
  [WRITING_GRAMMAR_ENGINE_IDS.local]: 0,
  [WRITING_GRAMMAR_ENGINE_IDS.harper]: 1,
  [WRITING_GRAMMAR_ENGINE_IDS.ai]: 2
});
const KNOWN_ENGINE_IDS = new Set(Object.keys(ENGINE_PRIORITY));
const KNOWN_CATEGORY_IDS = new Set(Object.keys(WRITING_GRAMMAR_CATEGORY_TITLES));
const MAX_AI_ISSUES = 8;
const MAX_ORIGINAL_LENGTH = 180;
const MAX_SUGGESTED_LENGTH = 220;
const MAX_MESSAGE_LENGTH = 1000;
const MAX_TITLE_LENGTH = 180;
const MAX_ENGINE_FIELD_LENGTH = 160;
const TEXT_CONTROL_RE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const UNSAFE_AI_REPLACEMENT_RE = /<|>|https?:\/\//iu;

function requireSentence(value) {
  if (typeof value !== "string") throw new TypeError("sentence must be a string");
  return value;
}

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function boundedText(value, maximum, { allowEmpty = false } = {}) {
  if (typeof value !== "string" || value.length > maximum || TEXT_CONTROL_RE.test(value)) return null;
  if (!allowEmpty && !value.trim()) return null;
  return value;
}

function normalizeEngine(value, fallbackName = "") {
  const source = isPlainObject(value) ? value : {};
  const name = boundedText(source.name, MAX_ENGINE_FIELD_LENGTH)
    || boundedText(fallbackName, MAX_ENGINE_FIELD_LENGTH);
  if (!name || !KNOWN_ENGINE_IDS.has(name)) return null;

  const engine = { name };
  for (const key of ["version", "model", "variant", "dialect", "execution"]) {
    const normalized = boundedText(source[key], MAX_ENGINE_FIELD_LENGTH);
    if (normalized) engine[key] = normalized;
  }
  return Object.freeze(engine);
}

function inferredCategoryId(issue) {
  const explicit = typeof issue.categoryId === "string" ? issue.categoryId : issue.category;
  if (typeof explicit === "string" && KNOWN_CATEGORY_IDS.has(explicit)) return explicit;

  const clue = [issue.ruleId, issue.title, issue.category]
    .filter((value) => typeof value === "string")
    .join(" ")
    .toLocaleLowerCase("en-GB");
  if (/subject.?verb|agreement|plural.?subject/u.test(clue)) return "subject_verb_agreement";
  if (/article|determiner/u.test(clue)) return "article_or_determiner";
  if (/singular|plural/u.test(clue)) return "singular_plural";
  if (/countab|uncountab/u.test(clue)) return "countability";
  if (/infinitive|gerund|to.?verb/u.test(clue)) return "infinitive_or_gerund";
  if (/modal|auxiliary|double.?verb/u.test(clue)) return "modal_or_auxiliary";
  if (/tense|verb.?form/u.test(clue)) return "verb_form_or_tense";
  if (/preposition/u.test(clue)) return "preposition";
  if (/pronoun/u.test(clue)) return "pronoun";
  if (/parallel/u.test(clue)) return "parallelism";
  if (/conjunction/u.test(clue)) return "conjunction";
  if (/comparison/u.test(clue)) return "comparison";
  if (/possessive/u.test(clue)) return "possessive";
  if (/punctuation/u.test(clue)) return "punctuation";
  if (/spell|spacing/u.test(clue)) return "spelling_or_spacing";
  if (/word.?form/u.test(clue)) return "word_form";
  if (/word.?choice/u.test(clue)) return "word_choice";
  if (/structure|complex/u.test(clue)) return "sentence_structure";
  return "other_grammar";
}

function normalizedSpan(sentence, issue) {
  const start = issue.start;
  const end = issue.end;
  if (
    !Number.isSafeInteger(start)
    || !Number.isSafeInteger(end)
    || start < 0
    || end <= start
    || end > sentence.length
  ) return null;

  const originalText = boundedText(issue.originalText, MAX_ORIGINAL_LENGTH);
  if (!originalText || sentence.slice(start, end) !== originalText) return null;
  return Object.freeze({ start, end, originalText });
}

function issueSuggestion(issue) {
  const first = typeof issue.suggestedText === "string" ? issue.suggestedText : null;
  const second = typeof issue.replacementText === "string" ? issue.replacementText : null;
  if (first !== null && second !== null && first !== second) return null;
  return first ?? second;
}

function normalizeIssue(sentence, issue, {
  expectedEngineId = "",
  ai = false
} = {}) {
  if (!isPlainObject(issue)) return null;
  const engine = normalizeEngine(issue.engine, expectedEngineId);
  if (!engine || (expectedEngineId && engine.name !== expectedEngineId)) return null;

  const span = normalizedSpan(sentence, issue);
  if (!span) return null;

  const reviewRequired = issue.reviewRequired === true;
  const rawSuggestion = issueSuggestion(issue);
  const suggestedText = boundedText(rawSuggestion, MAX_SUGGESTED_LENGTH, {
    allowEmpty: reviewRequired
  });
  if (suggestedText === null) return null;
  if (!reviewRequired && suggestedText === span.originalText) return null;
  if (ai && suggestedText && UNSAFE_AI_REPLACEMENT_RE.test(suggestedText)) return null;

  const categoryId = ai
    ? (typeof issue.categoryId === "string" ? issue.categoryId : issue.category)
    : inferredCategoryId(issue);
  if (typeof categoryId !== "string" || !KNOWN_CATEGORY_IDS.has(categoryId)) return null;

  const message = boundedText(
    issue.message ?? issue.explanationZhHant,
    MAX_MESSAGE_LENGTH
  );
  if (!message) return null;

  const confidence = issue.confidence === undefined ? null : Number(issue.confidence);
  if (confidence !== null && (!Number.isFinite(confidence) || confidence < 0 || confidence > 1)) {
    return null;
  }

  const canonicalTitle = WRITING_GRAMMAR_CATEGORY_TITLES[categoryId];
  const localTitle = boundedText(issue.title, MAX_TITLE_LENGTH);
  const title = ai ? canonicalTitle : (localTitle || canonicalTitle);
  const ruleId = ai
    ? `EdmundAI:${categoryId}`
    : (boundedText(issue.ruleId, MAX_TITLE_LENGTH) || `${engine.name}:${categoryId}`);
  const correctedSentence = reviewRequired || !suggestedText
    ? sentence
    : `${sentence.slice(0, span.start)}${suggestedText}${sentence.slice(span.end)}`;
  const suggestions = reviewRequired || !suggestedText
    ? Object.freeze([])
    : Object.freeze([Object.freeze({
      kind: "replace",
      replacementText: suggestedText
    })]);

  return Object.freeze({
    ruleId,
    title,
    category: categoryId,
    categoryId,
    message,
    originalText: span.originalText,
    suggestedText: suggestedText || "",
    correctedSentence,
    start: span.start,
    end: span.end,
    ...(confidence === null ? {} : { confidence }),
    ...(reviewRequired ? { reviewRequired: true } : {}),
    suggestions,
    engine,
    engineId: engine.name
  });
}

function issueSelectionOrder(left, right) {
  return (
    left.start - right.start
    || (left.end - left.start) - (right.end - right.start)
    || (right.confidence ?? 0) - (left.confidence ?? 0)
    || left.categoryId.localeCompare(right.categoryId)
    || left.suggestedText.localeCompare(right.suggestedText)
  );
}

export function grammarIssueRangesOverlap(left, right) {
  return Math.max(left.start, right.start) < Math.min(left.end, right.end);
}

function dedupeAndRemoveOverlaps(issues, { enginePriorityFirst = false } = {}) {
  const candidates = [...issues].sort((left, right) => (
    (enginePriorityFirst
      ? ENGINE_PRIORITY[left.engineId] - ENGINE_PRIORITY[right.engineId]
      : 0)
    || issueSelectionOrder(left, right)
  ));
  const accepted = [];
  const seen = new Set();
  for (const issue of candidates) {
    const key = [
      issue.start,
      issue.end,
      issue.suggestedText.toLocaleLowerCase("en-GB")
    ].join(":");
    if (seen.has(key) || accepted.some((existing) => grammarIssueRangesOverlap(existing, issue))) {
      continue;
    }
    seen.add(key);
    accepted.push(issue);
  }
  accepted.sort((left, right) => (
    left.start - right.start
    || left.end - right.end
    || ENGINE_PRIORITY[left.engineId] - ENGINE_PRIORITY[right.engineId]
    || left.ruleId.localeCompare(right.ruleId)
  ));
  return Object.freeze(accepted);
}

function responseContainer(value) {
  if (!isPlainObject(value)) throw new TypeError("Grammar AI response must be an object");
  if (isPlainObject(value.grammarReview)) return value.grammarReview;
  return value;
}

/**
 * Convert a Worker response into editor-safe issues for this exact sentence.
 * Invalid individual findings are discarded; a wholly unusable non-empty
 * response throws so the UI can show an unavailable state instead of a false
 * clean bill of health.
 */
export function normalizeWritingAiResponse(sentenceValue, responseValue) {
  const sentence = requireSentence(sentenceValue);
  const container = responseContainer(responseValue);
  if (!Array.isArray(container.issues)) {
    throw new TypeError("Grammar AI response must contain an issues array");
  }
  if (container.issues.length > MAX_AI_ISSUES) {
    throw new RangeError("Grammar AI response contains too many issues");
  }

  const topLevelEngine = container.engine ?? responseValue.engine;
  if (topLevelEngine !== undefined) {
    const normalized = normalizeEngine(topLevelEngine);
    if (!normalized || normalized.name !== WRITING_GRAMMAR_ENGINE_IDS.ai) {
      throw new TypeError("Grammar AI response uses an unknown engine");
    }
  }

  const normalized = container.issues
    .map((issue) => normalizeIssue(sentence, {
      ...issue,
      engine: issue?.engine ?? topLevelEngine
    }, {
      expectedEngineId: WRITING_GRAMMAR_ENGINE_IDS.ai,
      ai: true
    }))
    .filter(Boolean);

  if (container.issues.length > 0 && normalized.length === 0) {
    throw new TypeError("Grammar AI response contains no usable issues");
  }
  return dedupeAndRemoveOverlaps(normalized);
}

/** Normalize already-local ESL/Harper findings against the current sentence. */
export function normalizeLocalGrammarIssues(sentenceValue, issueValues) {
  const sentence = requireSentence(sentenceValue);
  if (!Array.isArray(issueValues)) throw new TypeError("local issues must be an array");
  const normalized = issueValues
    .map((issue) => normalizeIssue(sentence, issue))
    .filter((issue) => (
      issue
      && issue.engineId !== WRITING_GRAMMAR_ENGINE_IDS.ai
    ));
  return dedupeAndRemoveOverlaps(normalized, { enginePriorityFirst: true });
}

/**
 * Merge immediate local/Harper findings with Worker AI findings. Local ESL is
 * authoritative, Harper is second, and AI is accepted only where neither
 * local source already owns an overlapping editor span.
 */
export function mergeWritingGrammarIssues(sentenceValue, localIssueValues, aiValue) {
  const sentence = requireSentence(sentenceValue);
  const local = normalizeLocalGrammarIssues(sentence, localIssueValues || []);
  const ai = Array.isArray(aiValue)
    ? dedupeAndRemoveOverlaps(aiValue
      .map((issue) => normalizeIssue(sentence, issue, {
        expectedEngineId: WRITING_GRAMMAR_ENGINE_IDS.ai,
        ai: true
      }))
      .filter(Boolean))
    : normalizeWritingAiResponse(sentence, aiValue || { issues: [] });

  const accepted = [];
  const localByPriority = [...local].sort((left, right) => (
    ENGINE_PRIORITY[left.engineId] - ENGINE_PRIORITY[right.engineId]
    || issueSelectionOrder(left, right)
  ));
  for (const issue of localByPriority) {
    if (!accepted.some((existing) => grammarIssueRangesOverlap(existing, issue))) {
      accepted.push(issue);
    }
  }
  for (const issue of ai) {
    if (!accepted.some((existing) => grammarIssueRangesOverlap(existing, issue))) {
      accepted.push(issue);
    }
  }

  accepted.sort((left, right) => (
    left.start - right.start
    || left.end - right.end
    || ENGINE_PRIORITY[left.engineId] - ENGINE_PRIORITY[right.engineId]
    || left.ruleId.localeCompare(right.ruleId)
  ));
  return Object.freeze(accepted);
}
