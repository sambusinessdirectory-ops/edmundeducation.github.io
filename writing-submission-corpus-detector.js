import {
  CORPUS_APPROVED_INCORRECT_SENTENCES,
  CORPUS_DETECTOR_PATTERNS,
  CORPUS_DETECTOR_RULES,
  CORPUS_DETECTOR_VERSION
} from "./writing-submission-corpus-detector.generated.js?v=20260802-grammar3";

export {
  CORPUS_DETECTOR_PATTERNS,
  CORPUS_DETECTOR_RULES,
  CORPUS_DETECTOR_VERSION
};

export const WRITING_CORPUS_RULE_ENGINE = Object.freeze({
  name: "edmund-esl-basics",
  version: "2.0.0",
  corpusVersion: CORPUS_DETECTOR_VERSION,
  detector: "teacher-approved-corpus",
  locale: "zh-Hant",
  execution: "browser"
});

export const CORPUS_COMPILED_RULE_COUNT = CORPUS_DETECTOR_RULES.length;
export const CORPUS_COMPILED_PATTERN_COUNT = CORPUS_DETECTOR_PATTERNS.length;

const WORD_RE = /[\p{L}\p{M}\p{N}]+(?:[\u2019'\-][\p{L}\p{M}\p{N}]+)*/gu;
const WORD_CHARACTER_RE = /[\p{L}\p{M}\p{N}\u2019'\-]/u;
const RULE_BY_ID = new Map(CORPUS_DETECTOR_RULES.map((rule) => [rule.ruleId, rule]));
const APPROVED_INCORRECT = new Map(CORPUS_APPROVED_INCORRECT_SENTENCES.map((entry) => [
  normalizeSentence(entry.sourceSentence),
  entry.sentenceId
]));

function normalizeSentence(value) {
  return String(value || "")
    .replaceAll("\u00a0", " ")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase("en-GB");
}

/** Return the approved source id only for an exact normalized corpus sentence. */
export function approvedCorpusIncorrectSentenceId(value) {
  return APPROVED_INCORRECT.get(normalizeSentence(value)) || "";
}

function escapedFlexibleText(value) {
  return String(value)
    .split(/(\s+)/u)
    .map((part) => (/^\s+$/u.test(part)
      ? "\\s+"
      : part.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")))
    .join("");
}

function compilePattern(pattern) {
  return Object.freeze({
    ...pattern,
    search: new RegExp(escapedFlexibleText(pattern.matchText), "giu"),
    replacementAtStart: new RegExp(`^${escapedFlexibleText(pattern.replacementText)}`, "iu"),
    matchStartsWithWord: WORD_CHARACTER_RE.test(pattern.matchText[0] || ""),
    matchEndsWithWord: WORD_CHARACTER_RE.test(pattern.matchText.at(-1) || "")
  });
}

const COMPILED_PATTERNS = CORPUS_DETECTOR_PATTERNS.map(compilePattern);

function wordsWithRanges(value) {
  return [...value.matchAll(WORD_RE)].map((match) => Object.freeze({
    value: match[0].toLocaleLowerCase("en-GB"),
    start: match.index,
    end: match.index + match[0].length
  }));
}

function contextMatches(words, start, end, leftContext, rightContext) {
  if (leftContext.length) {
    const actual = words.filter((word) => word.end <= start).slice(-leftContext.length);
    if (
      actual.length !== leftContext.length
      || actual.some((word, index) => word.value !== leftContext[index])
    ) return false;
  }
  if (rightContext.length) {
    const actual = words.filter((word) => word.start >= end).slice(0, rightContext.length);
    if (
      actual.length !== rightContext.length
      || actual.some((word, index) => word.value !== rightContext[index])
    ) return false;
  }
  return true;
}

function hasWordBoundary(source, start, end, pattern) {
  if (
    pattern.matchStartsWithWord
    && start > 0
    && WORD_CHARACTER_RE.test(source[start - 1])
  ) return false;
  if (
    pattern.matchEndsWithWord
    && end < source.length
    && WORD_CHARACTER_RE.test(source[end])
  ) return false;
  return true;
}

function startsSentenceAt(source, start) {
  const before = source.slice(0, start).trimEnd();
  return !before || /[.!?;:][\u201d"')\]]?$/u.test(before);
}

function endsSentenceAt(source, end) {
  const after = source.slice(end).trimStart();
  return !after || /^[.!?;][\u201d"')\]]?(?:\s|$)/u.test(after);
}

function replacementIsAlreadyPresent(source, start, pattern) {
  const normalizedMatch = normalizeSentence(pattern.matchText);
  const normalizedReplacement = normalizeSentence(pattern.replacementText);
  if (
    normalizedReplacement === normalizedMatch
    && pattern.replacementText !== pattern.matchText
  ) return false;
  // This guard is for insertion patterns such as "for example" ->
  // "for example,". A deletion such as "near from" -> "near" naturally
  // begins with its replacement and must not be suppressed.
  if (!normalizedReplacement.includes(normalizedMatch)) return false;
  const match = pattern.replacementAtStart.exec(source.slice(start));
  if (!match) return false;
  const end = start + match[0].length;
  return !pattern.matchEndsWithWord || end >= source.length || !WORD_CHARACTER_RE.test(source[end]);
}

function preserveLeadingCase(original, replacement, template) {
  if (!replacement || !original) return replacement;
  const originalLetter = original.match(/\p{L}/u)?.[0] || "";
  const templateLetter = template.match(/\p{L}/u)?.[0] || "";
  const replacementLetter = replacement.match(/\p{L}/u)?.[0] || "";
  if (
    originalLetter
    && templateLetter
    && replacementLetter
    && originalLetter === originalLetter.toLocaleUpperCase("en-GB")
    && templateLetter === templateLetter.toLocaleLowerCase("en-GB")
    && replacementLetter === replacementLetter.toLocaleLowerCase("en-GB")
  ) {
    const index = replacement.indexOf(replacementLetter);
    return `${replacement.slice(0, index)}${replacementLetter.toLocaleUpperCase("en-GB")}${replacement.slice(index + replacementLetter.length)}`;
  }
  return replacement;
}

function ruleExceptionApplies(normalizedSource, rule) {
  return rule.exceptions.some((exception) => (
    normalizedSource.includes(normalizeSentence(exception.exampleText))
  ));
}

function createCandidate(source, normalizedSource, exactSourceSentenceId, words, pattern, match) {
  const start = match.index;
  const end = start + match[0].length;
  if (exactSourceSentenceId && pattern.sentenceId !== exactSourceSentenceId) return null;
  if (!hasWordBoundary(source, start, end, pattern)) return null;
  if (pattern.startsSentence && !startsSentenceAt(source, start)) return null;
  if (pattern.endsSentence && !endsSentenceAt(source, end)) return null;
  if (!contextMatches(words, start, end, pattern.leftContext, pattern.rightContext)) return null;
  if (replacementIsAlreadyPresent(source, start, pattern)) return null;

  const rule = RULE_BY_ID.get(pattern.ruleId);
  if (!rule || ruleExceptionApplies(normalizedSource, rule)) return null;
  const replacement = preserveLeadingCase(
    match[0],
    pattern.replacementText,
    pattern.matchText
  );
  if (!replacement || match[0] === replacement) return null;

  const alternatives = [replacement, ...pattern.acceptableAlternatives]
    .filter((value, index, values) => (
      typeof value === "string"
      && value.trim()
      && values.findIndex((candidate) => normalizeSentence(candidate) === normalizeSentence(value)) === index
    ));
  const contextStrength = pattern.leftContext.length + pattern.rightContext.length;
  const sourceStrength = pattern.source === "issue" ? 2 : 0;
  return Object.freeze({
    patternId: pattern.patternId,
    corpusSentenceId: pattern.sentenceId || "",
    ruleId: pattern.ruleId,
    title: rule.titleZhHant,
    category: rule.category,
    message: rule.explanationZhHant,
    originalText: source.slice(start, end),
    suggestedText: replacement,
    correctedSentence: `${source.slice(0, start)}${replacement}${source.slice(end)}`,
    start,
    end,
    confidence: pattern.confidence,
    reviewRequired: false,
    suggestions: Object.freeze(alternatives.map((replacementText) => Object.freeze({
      kind: "replace",
      replacementText
    }))),
    engine: WRITING_CORPUS_RULE_ENGINE,
    _rank: (
      contextStrength * 10000
      + sourceStrength * 1000
      + Math.min(999, match[0].length) * 10
      + Math.round(pattern.confidence * 9)
    )
  });
}

function sameReplacement(left, right) {
  return normalizeSentence(left.suggestedText) === normalizeSentence(right.suggestedText);
}

function selectRangeWinners(candidates) {
  const ranges = new Map();
  for (const candidate of candidates) {
    const key = `${candidate.start}:${candidate.end}`;
    const bucket = ranges.get(key) || [];
    bucket.push(candidate);
    ranges.set(key, bucket);
  }
  const winners = [];
  for (const bucket of ranges.values()) {
    bucket.sort((left, right) => right._rank - left._rank || left.ruleId.localeCompare(right.ruleId));
    const bestRank = bucket[0]._rank;
    const strongest = bucket.filter((candidate) => candidate._rank === bestRank);
    if (strongest.some((candidate) => !sameReplacement(candidate, strongest[0]))) continue;
    winners.push(bucket[0]);
  }
  return winners;
}

function rangesOverlap(left, right) {
  return Math.max(left.start, right.start) < Math.min(left.end, right.end);
}

function publicIssue(issue) {
  const { _rank, ...value } = issue;
  return Object.freeze(value);
}

/**
 * Applies every approved, non-holdout corpus mapping as a deterministic local
 * detector. Issue-derived rules use lexical context for short or ambiguous
 * replacements; reviewed multi-word patterns can match inside new sentences.
 */
export function checkCorpusGrammar(text, { maximumIssues = 8 } = {}) {
  const source = String(text || "");
  if (!source.trim()) return Object.freeze([]);
  const normalizedSource = normalizeSentence(source);
  const exactSourceSentenceId = approvedCorpusIncorrectSentenceId(source);
  const safeMaximum = Number.isSafeInteger(maximumIssues)
    ? Math.max(0, Math.min(32, maximumIssues))
    : 8;
  if (!safeMaximum) return Object.freeze([]);

  const words = wordsWithRanges(source);
  const candidates = [];
  for (const pattern of COMPILED_PATTERNS) {
    pattern.search.lastIndex = 0;
    for (const match of source.matchAll(pattern.search)) {
      const candidate = createCandidate(
        source,
        normalizedSource,
        exactSourceSentenceId,
        words,
        pattern,
        match
      );
      if (candidate) candidates.push(candidate);
    }
  }

  const ranked = selectRangeWinners(candidates).sort((left, right) => (
    right._rank - left._rank
    || left.start - right.start
    || right.end - left.end
    || left.ruleId.localeCompare(right.ruleId)
  ));
  const selected = [];
  for (const candidate of ranked) {
    if (selected.some((existing) => rangesOverlap(existing, candidate))) continue;
    selected.push(candidate);
    if (selected.length >= safeMaximum) break;
  }
  selected.sort((left, right) => (
    left.start - right.start
    || left.end - right.end
    || left.ruleId.localeCompare(right.ruleId)
  ));
  return Object.freeze(selected.map(publicIssue));
}
