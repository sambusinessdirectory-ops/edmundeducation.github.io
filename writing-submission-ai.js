export const WRITING_GRAMMAR_ENGINE_IDS = Object.freeze({
  corpus: "edmund-approved-grammar-corpus",
  local: "edmund-esl-basics",
  harper: "harper.js",
  ai: "cloudflare-workers-ai"
});

export const REMOTE_GRAMMAR_FAILURE_KINDS = Object.freeze({
  cancelled: "cancelled",
  timeout: "timeout",
  inconclusive: "inconclusive",
  quotaExhausted: "quota_exhausted",
  rateLimited: "rate_limited",
  network: "network"
});

const REMOTE_GRAMMAR_FAILURE_POLICIES = Object.freeze({
  [REMOTE_GRAMMAR_FAILURE_KINDS.cancelled]: Object.freeze({
    kind: REMOTE_GRAMMAR_FAILURE_KINDS.cancelled,
    shouldWarn: false,
    backoffMs: 0,
    globalStatus: "unchanged"
  }),
  [REMOTE_GRAMMAR_FAILURE_KINDS.timeout]: Object.freeze({
    kind: REMOTE_GRAMMAR_FAILURE_KINDS.timeout,
    shouldWarn: true,
    backoffMs: 0,
    globalStatus: "unchanged"
  }),
  [REMOTE_GRAMMAR_FAILURE_KINDS.inconclusive]: Object.freeze({
    kind: REMOTE_GRAMMAR_FAILURE_KINDS.inconclusive,
    shouldWarn: true,
    backoffMs: 0,
    globalStatus: "unchanged"
  }),
  [REMOTE_GRAMMAR_FAILURE_KINDS.quotaExhausted]: Object.freeze({
    kind: REMOTE_GRAMMAR_FAILURE_KINDS.quotaExhausted,
    shouldWarn: true,
    backoffMs: 60 * 60 * 1000,
    globalStatus: "quota_exhausted"
  }),
  [REMOTE_GRAMMAR_FAILURE_KINDS.rateLimited]: Object.freeze({
    kind: REMOTE_GRAMMAR_FAILURE_KINDS.rateLimited,
    shouldWarn: true,
    backoffMs: 60000,
    globalStatus: "rate_limited"
  }),
  [REMOTE_GRAMMAR_FAILURE_KINDS.network]: Object.freeze({
    kind: REMOTE_GRAMMAR_FAILURE_KINDS.network,
    shouldWarn: true,
    backoffMs: 30000,
    globalStatus: "error"
  })
});

/**
 * Classify a remote grammar failure without mutating editor state. An
 * inconclusive model response is a per-sentence review failure, not proof that
 * the grammar service is offline. A timed-out request is also kept separate
 * from an intentional AbortController cancellation.
 */
export function classifyRemoteGrammarFailure(errorValue, { timedOut = false } = {}) {
  const error = errorValue && typeof errorValue === "object" ? errorValue : {};
  const status = Number.isFinite(Number(error.status)) ? Number(error.status) : 0;
  const code = typeof error.code === "string" ? error.code : "";

  if (timedOut) return REMOTE_GRAMMAR_FAILURE_POLICIES[REMOTE_GRAMMAR_FAILURE_KINDS.timeout];
  if (error.name === "AbortError") {
    return REMOTE_GRAMMAR_FAILURE_POLICIES[REMOTE_GRAMMAR_FAILURE_KINDS.cancelled];
  }
  if (code === "GRAMMAR_CHECK_QUOTA_EXHAUSTED") {
    return REMOTE_GRAMMAR_FAILURE_POLICIES[REMOTE_GRAMMAR_FAILURE_KINDS.quotaExhausted];
  }
  if (status === 429) {
    return REMOTE_GRAMMAR_FAILURE_POLICIES[REMOTE_GRAMMAR_FAILURE_KINDS.rateLimited];
  }
  if (code === "GRAMMAR_CHECK_INCONCLUSIVE") {
    return REMOTE_GRAMMAR_FAILURE_POLICIES[REMOTE_GRAMMAR_FAILURE_KINDS.inconclusive];
  }
  return REMOTE_GRAMMAR_FAILURE_POLICIES[REMOTE_GRAMMAR_FAILURE_KINDS.network];
}

/** Build the sentence-level notice without ever presenting an incomplete AI review as clean. */
export function writingGrammarReviewNotice(warningKindsValue, visibleIssueCountValue) {
  const warningKinds = Array.isArray(warningKindsValue)
    ? warningKindsValue.filter((kind) => typeof kind === "string")
    : [];
  const warningCount = warningKinds.length;
  if (!warningCount) return null;
  const hasVisibleIssues = (Number.parseInt(visibleIssueCountValue, 10) || 0) > 0;
  if (warningKinds.includes(REMOTE_GRAMMAR_FAILURE_KINDS.quotaExhausted)) {
    return Object.freeze({
      state: "warning",
      title: "Workers AI 每日額度已用完",
      detail: hasVisibleIssues
        ? "Workers AI 今日的文法檢查額度已用完，會於香港時間 08:00 重設。以下本機提示仍然保留；AI 未完成的句子可能仍有其他問題。"
        : "Workers AI 今日的文法檢查額度已用完，會於香港時間 08:00 重設。本機暫未提出建議，但這不代表句子沒有文法問題。"
    });
  }
  return Object.freeze({
    state: "warning",
    title: warningCount === 1
      ? "AI 未能完成這句的進階檢查"
      : `AI 未能完成 ${warningCount} 句的進階檢查`,
    detail: hasVisibleIssues
      ? "以下本機提示仍然保留；AI 未完成的句子可能仍有其他問題。"
      : "本機暫未提出建議，但這不代表句子沒有文法問題。請稍後再試。"
  });
}

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
  [WRITING_GRAMMAR_ENGINE_IDS.corpus]: -1,
  [WRITING_GRAMMAR_ENGINE_IDS.local]: 0,
  [WRITING_GRAMMAR_ENGINE_IDS.harper]: 1,
  [WRITING_GRAMMAR_ENGINE_IDS.ai]: 2
});
const KNOWN_ENGINE_IDS = new Set(Object.keys(ENGINE_PRIORITY));
const REMOTE_ENGINE_IDS = new Set([
  WRITING_GRAMMAR_ENGINE_IDS.corpus,
  WRITING_GRAMMAR_ENGINE_IDS.ai
]);
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
  ai = false,
  teacherApproved = false
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
    ? (teacherApproved
      ? (boundedText(issue.ruleId, MAX_TITLE_LENGTH) || `EdmundCorpus:${categoryId}`)
      : `EdmundAI:${categoryId}`)
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

export function writingGrammarEnginePriority(value) {
  const name = typeof value === "string"
    ? value
    : String(value?.engineId || value?.engine?.name || "");
  return Object.prototype.hasOwnProperty.call(ENGINE_PRIORITY, name)
    ? ENGINE_PRIORITY[name]
    : Number.MAX_SAFE_INTEGER;
}

function writingGrammarTokens(value) {
  const tokens = [];
  const pattern = /\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]+/gu;
  for (const match of String(value || "").matchAll(pattern)) {
    tokens.push({ text: match[0], start: match.index, end: match.index + match[0].length });
  }
  return tokens;
}

function writingGrammarLcsMap(sourceTokens, targetTokens) {
  const rows = sourceTokens.length + 1;
  const columns = targetTokens.length + 1;
  const lengths = Array.from({ length: rows }, () => new Uint16Array(columns));
  for (let sourceIndex = sourceTokens.length - 1; sourceIndex >= 0; sourceIndex -= 1) {
    for (let targetIndex = targetTokens.length - 1; targetIndex >= 0; targetIndex -= 1) {
      lengths[sourceIndex][targetIndex] = sourceTokens[sourceIndex].text === targetTokens[targetIndex].text
        ? lengths[sourceIndex + 1][targetIndex + 1] + 1
        : Math.max(lengths[sourceIndex + 1][targetIndex], lengths[sourceIndex][targetIndex + 1]);
    }
  }
  const mapping = new Map();
  let sourceIndex = 0;
  let targetIndex = 0;
  while (sourceIndex < sourceTokens.length && targetIndex < targetTokens.length) {
    if (sourceTokens[sourceIndex].text === targetTokens[targetIndex].text) {
      mapping.set(sourceIndex, targetIndex);
      sourceIndex += 1;
      targetIndex += 1;
    } else if (lengths[sourceIndex + 1][targetIndex] >= lengths[sourceIndex][targetIndex + 1]) {
      sourceIndex += 1;
    } else {
      targetIndex += 1;
    }
  }
  return mapping;
}

function writingGrammarTokenSequenceOccurs(tokens, sequence, startIndex, endIndex) {
  if (!sequence.length) return false;
  for (let index = startIndex; index + sequence.length <= endIndex; index += 1) {
    if (sequence.every((token, offset) => tokens[index + offset]?.text === token.text)) return true;
  }
  return false;
}

function isSpecificWritingGrammarFragmentReversed(original, suggested, offset, after, before) {
  if (
    !Number.isSafeInteger(offset)
    || offset < 0
    || original.slice(offset, offset + after.length) !== after
  ) return false;
  const sourceTokens = writingGrammarTokens(original);
  const targetTokens = writingGrammarTokens(suggested);
  const beforeTokens = writingGrammarTokens(before);
  const lockedStart = offset;
  const lockedEnd = offset + after.length;
  const lockedIndices = sourceTokens
    .map((token, index) => ({ token, index }))
    .filter(({ token }) => token.end > lockedStart && token.start < lockedEnd)
    .map(({ index }) => index);
  if (!lockedIndices.length) {
    return suggested.slice(offset, offset + before.length) === before;
  }
  const mapping = writingGrammarLcsMap(sourceTokens, targetTokens);
  if (lockedIndices.every((index) => mapping.has(index))) return false;
  let leftTarget = -1;
  for (let index = lockedIndices[0] - 1; index >= 0; index -= 1) {
    if (mapping.has(index)) {
      leftTarget = mapping.get(index);
      break;
    }
  }
  let rightTarget = targetTokens.length;
  for (let index = lockedIndices[lockedIndices.length - 1] + 1; index < sourceTokens.length; index += 1) {
    if (mapping.has(index)) {
      rightTarget = mapping.get(index);
      break;
    }
  }
  return writingGrammarTokenSequenceOccurs(
    targetTokens,
    beforeTokens,
    leftTarget + 1,
    rightTarget
  );
}

function isRepeatedWritingGrammarCorrectionInsideAcceptedReplacement(
  issue,
  absoluteStart,
  entry,
  before,
  after
) {
  const candidateOriginal = String(issue?.originalText || "");
  const candidateSuggested = String(issue?.suggestedText || "");
  const acceptedStart = Number(entry?.absoluteStart);
  const acceptedEnd = Number(entry?.absoluteEnd);
  if (
    !before
    || !after
    || !Number.isSafeInteger(absoluteStart)
    || !Number.isSafeInteger(acceptedStart)
    || !Number.isSafeInteger(acceptedEnd)
    || acceptedEnd - acceptedStart !== after.length
  ) return false;

  if (absoluteStart >= acceptedStart) {
    const relativeInsideAccepted = absoluteStart - acceptedStart;
    return (
      candidateOriginal === before
      && candidateSuggested === after
      && after.slice(relativeInsideAccepted, relativeInsideAccepted + before.length) === before
    );
  }

  const relativeStart = acceptedStart - absoluteStart;
  const candidateEnd = absoluteStart + candidateOriginal.length;
  // A wider suggestion may legitimately retain the accepted wording and fix
  // something later in that phrase. A source span containing the complete
  // accepted replacement is preserving it, not repeating the old transform.
  if (
    candidateEnd >= acceptedEnd
    && candidateOriginal.slice(relativeStart, relativeStart + after.length) === after
  ) return false;
  return (
    candidateOriginal.slice(0, relativeStart) === candidateSuggested.slice(0, relativeStart)
    && candidateOriginal.slice(relativeStart, relativeStart + before.length) === before
    && candidateSuggested.slice(relativeStart, relativeStart + after.length) === after
  );
}

/**
 * Once a student accepts a correction, do not let any checker repeat that
 * same transform inside the newly inserted replacement. Also prevent the
 * same or a weaker checker from offering the exact inverse at that place. A
 * stronger deterministic checker may still override an AI suggestion with a
 * genuinely different correction.
 */
export function isBlockedInverseWritingGrammarIssue(issue, segment, context, correctionHistory) {
  if (!issue || !segment || !context || !Array.isArray(correctionHistory)) return false;
  const absoluteStart = Number(segment.start) + Number(issue.start);
  const candidatePriority = writingGrammarEnginePriority(issue);
  return correctionHistory.some((entry) => {
    if (
      !entry
      || entry.generation !== context.generation
      || entry.documentId !== context.documentId
    ) return false;
    const candidateOriginal = String(issue.originalText || "");
    const candidateSuggested = String(issue.suggestedText || "");
    const before = String(entry.before || "");
    const after = String(entry.after || "");
    if (isRepeatedWritingGrammarCorrectionInsideAcceptedReplacement(
      issue,
      absoluteStart,
      entry,
      before,
      after
    )) return true;
    if (candidatePriority < writingGrammarEnginePriority(entry.engineId)) return false;
    const offset = Number(entry.absoluteStart) - absoluteStart;
    return Boolean(before && after && isSpecificWritingGrammarFragmentReversed(
      candidateOriginal,
      candidateSuggested,
      offset,
      after,
      before
    ));
  });
}

/**
 * Apply one atomic suggestion to the active editor diagnostics without
 * throwing away independent cards later in the same sentence.
 */
export function rebaseWritingGrammarIssuesAfterAppliedCorrection(issueValues, appliedIssue) {
  if (!Array.isArray(issueValues) || !appliedIssue) return [];
  const beforeSentence = String(appliedIssue.sentenceText || "");
  const afterSentence = String(appliedIssue.correctedSentence || "");
  const sentenceStart = Number(appliedIssue.sentenceStart);
  const sentenceEnd = Number(appliedIssue.sentenceEnd);
  const replacementDelta = afterSentence.length - beforeSentence.length;
  if (
    !beforeSentence
    || !Number.isSafeInteger(sentenceStart)
    || !Number.isSafeInteger(sentenceEnd)
    || sentenceEnd - sentenceStart !== beforeSentence.length
  ) return issueValues.filter((issue) => issue?.id !== appliedIssue.id);

  const rebased = [];
  for (const issue of issueValues) {
    if (!issue || issue.id === appliedIssue.id) continue;

    const belongsToOriginalSentence = (
      issue.sentenceStart === sentenceStart
      && issue.sentenceEnd === sentenceEnd
      && issue.sentenceText === beforeSentence
    );
    if (belongsToOriginalSentence) {
      if (grammarIssueRangesOverlap(issue, appliedIssue)) continue;
      const shift = issue.start >= appliedIssue.end ? replacementDelta : 0;
      const start = issue.start + shift;
      const end = issue.end + shift;
      if (
        !Number.isSafeInteger(start)
        || !Number.isSafeInteger(end)
        || start < 0
        || end <= start
        || afterSentence.slice(start, end) !== issue.originalText
      ) continue;
      rebased.push({
        ...issue,
        id: issue.fingerprint
          ? `${issue.fingerprint}:${issue.segmentOrdinal}:${start}:${end}`
          : issue.id,
        sentenceText: afterSentence,
        sentenceEnd: sentenceStart + afterSentence.length,
        start,
        end,
        absoluteStart: sentenceStart + start,
        absoluteEnd: sentenceStart + end,
        correctedSentence: `${afterSentence.slice(0, start)}${issue.suggestedText}${afterSentence.slice(end)}`
      });
      continue;
    }

    // Anything positioned inside the old sentence but not tied to its exact
    // text is stale. Diagnostics in later sentences shift with the edit.
    if (issue.sentenceStart < sentenceEnd && issue.sentenceEnd > sentenceStart) continue;
    if (issue.sentenceStart >= sentenceEnd) {
      rebased.push({
        ...issue,
        sentenceStart: issue.sentenceStart + replacementDelta,
        sentenceEnd: issue.sentenceEnd + replacementDelta,
        absoluteStart: issue.absoluteStart + replacementDelta,
        absoluteEnd: issue.absoluteEnd + replacementDelta
      });
      continue;
    }
    rebased.push(issue);
  }
  return rebased;
}

/** Return whether this exact completed sentence still has active issue cards. */
export function hasWritingGrammarIssuesForSentence(issueValues, sentenceStart, sentenceText) {
  if (
    !Array.isArray(issueValues)
    || !Number.isSafeInteger(sentenceStart)
    || typeof sentenceText !== "string"
  ) return false;
  return issueValues.some((issue) => (
    issue
    && issue.sentenceStart === sentenceStart
    && issue.sentenceText === sentenceText
  ));
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
  let remoteEngineId = WRITING_GRAMMAR_ENGINE_IDS.ai;
  if (topLevelEngine !== undefined) {
    const normalized = normalizeEngine(topLevelEngine);
    if (!normalized || !REMOTE_ENGINE_IDS.has(normalized.name)) {
      throw new TypeError("Grammar AI response uses an unknown engine");
    }
    remoteEngineId = normalized.name;
  }

  const normalized = container.issues
    .map((issue) => normalizeIssue(sentence, {
      ...issue,
      engine: issue?.engine ?? topLevelEngine
    }, {
      expectedEngineId: remoteEngineId,
      ai: true,
      teacherApproved: remoteEngineId === WRITING_GRAMMAR_ENGINE_IDS.corpus
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
 * Merge immediate local/Harper findings with Worker findings. An exact,
 * teacher-approved corpus record is authoritative, local ESL is next, Harper
 * follows, and generated AI is accepted only where no stronger source already
 * owns an overlapping editor span.
 */
export function mergeWritingGrammarIssues(sentenceValue, localIssueValues, aiValue) {
  const sentence = requireSentence(sentenceValue);
  const local = normalizeLocalGrammarIssues(sentence, localIssueValues || []);
  const ai = Array.isArray(aiValue)
    ? dedupeAndRemoveOverlaps(aiValue
      .map((issue) => {
        const remoteEngineId = String(issue?.engineId || issue?.engine?.name || "");
        if (!REMOTE_ENGINE_IDS.has(remoteEngineId)) return null;
        return normalizeIssue(sentence, issue, {
          expectedEngineId: remoteEngineId,
          ai: true,
          teacherApproved: remoteEngineId === WRITING_GRAMMAR_ENGINE_IDS.corpus
        });
      })
      .filter(Boolean))
    : normalizeWritingAiResponse(sentence, aiValue || { issues: [] });
  return dedupeAndRemoveOverlaps([...local, ...ai], { enginePriorityFirst: true });
}
