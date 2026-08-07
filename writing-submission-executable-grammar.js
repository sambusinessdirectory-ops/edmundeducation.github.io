import { WRITING_ESL_RULE_ENGINE } from "./writing-submission-esl-rules-core.js?v=20260802-grammar3";
import {
  EXECUTABLE_GRAMMAR_COUNTS,
  EXECUTABLE_GRAMMAR_FAMILIES,
  EXECUTABLE_GRAMMAR_PATTERNS,
  EXECUTABLE_GRAMMAR_VERSION
} from "./writing-submission-executable-grammar.generated.js?v=20260803-grammar6";

export {
  EXECUTABLE_GRAMMAR_COUNTS,
  EXECUTABLE_GRAMMAR_FAMILIES,
  EXECUTABLE_GRAMMAR_PATTERNS,
  EXECUTABLE_GRAMMAR_VERSION
};

export const EXECUTABLE_COMPILED_FAMILY_COUNT = EXECUTABLE_GRAMMAR_COUNTS.runtimeFamilies;
export const EXECUTABLE_COMPILED_PATTERN_COUNT = EXECUTABLE_GRAMMAR_PATTERNS.length;

const RUNTIME_APPROVAL_STATUS = "approved_for_bounded_surface_runtime";
const BROWSER_CAPABILITIES = new Set([
  "case_preservation",
  "lexical_context",
  "sentence_boundaries",
  "surface_literal",
  "tokenize",
  "unicode_word_boundaries"
]);
const WORD_RE = /[\p{L}\p{M}\p{N}]+(?:[\u2019'\-][\p{L}\p{M}\p{N}]+)*/gu;
const WORD_CHARACTER_RE = /[\p{L}\p{M}\p{N}\u2019'\-]/u;
const SENTENCE_BOUNDARY_RE = /[.!?;]/u;

function normalizeText(value) {
  return String(value || "")
    .replaceAll("\u00a0", " ")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase("en-GB");
}

function escapedFlexibleText(value) {
  return String(value)
    .split(/(\s+)/u)
    .map((part) => (/^\s+$/u.test(part)
      ? "\\s+"
      : part.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")))
    .join("");
}

function isCanonicalContextToken(value) {
  if (typeof value !== "string" || !value || value !== value.trim()) return false;
  const words = [...value.matchAll(WORD_RE)].map((match) => match[0].toLocaleLowerCase("en-GB"));
  return words.length === 1 && words[0] === value;
}

function requireRuntimeArray(value, label, maximum = 8) {
  if (!Array.isArray(value) || value.length > maximum) {
    throw new TypeError(`Executable grammar ${label} is invalid`);
  }
  return value;
}

function compilePattern(pattern, familyById) {
  if (!pattern || typeof pattern !== "object" || Array.isArray(pattern)) {
    throw new TypeError("Executable grammar pattern must be an object");
  }
  const family = familyById.get(pattern.familyId);
  if (
    pattern.matcherType !== "surface_literal"
    || pattern.runtimeEligible !== true
    || pattern.runtimeApprovalStatus !== RUNTIME_APPROVAL_STATUS
    || !["local_auto", "local_review"].includes(pattern.executionPolicy)
    || !family
    || family.browserRuntimeSupported !== true
    || family.runtimeApprovalStatus !== RUNTIME_APPROVAL_STATUS
    || family.executionPolicy !== pattern.executionPolicy
  ) {
    throw new TypeError(`Unsafe executable grammar pattern: ${String(pattern.patternId || "unknown")}`);
  }
  if (
    typeof pattern.matchText !== "string"
    || !pattern.matchText.trim()
    || pattern.matchText !== pattern.matchText.trim()
    || pattern.matchText.length > 180
    || typeof pattern.replacementText !== "string"
    || !pattern.replacementText.trim()
    || pattern.replacementText !== pattern.replacementText.trim()
    || pattern.replacementText.length > 220
    || pattern.matchText === pattern.replacementText
  ) throw new TypeError(`Invalid executable grammar repair: ${pattern.patternId}`);
  if (
    typeof pattern.confidence !== "number"
    || !Number.isFinite(pattern.confidence)
    || pattern.confidence < 0.5
    || pattern.confidence > 1
    || (pattern.executionPolicy === "local_auto" && pattern.confidence < 0.99)
  ) throw new TypeError(`Unsafe executable grammar confidence: ${pattern.patternId}`);
  if (!Number.isSafeInteger(pattern.priority) || pattern.priority < 0 || pattern.priority > 100000) {
    throw new TypeError(`Invalid executable grammar priority: ${pattern.patternId}`);
  }
  const requiredCapabilities = requireRuntimeArray(
    pattern.requiredCapabilities,
    `${pattern.patternId} capabilities`,
    BROWSER_CAPABILITIES.size
  );
  if (
    !requiredCapabilities.includes("surface_literal")
    || requiredCapabilities.some((capability) => !BROWSER_CAPABILITIES.has(capability))
  ) throw new TypeError(`Unavailable executable grammar capability: ${pattern.patternId}`);
  const leftContext = requireRuntimeArray(pattern.leftContext, `${pattern.patternId} left context`, 4);
  const rightContext = requireRuntimeArray(pattern.rightContext, `${pattern.patternId} right context`, 4);
  if (
    leftContext.some((value) => !isCanonicalContextToken(value))
    || rightContext.some((value) => !isCanonicalContextToken(value))
    || typeof pattern.startsSentence !== "boolean"
    || typeof pattern.endsSentence !== "boolean"
    || (pattern.startsSentence && leftContext.length)
    || (pattern.endsSentence && rightContext.length)
  ) throw new TypeError(`Invalid executable grammar context: ${pattern.patternId}`);
  const acceptableAlternatives = requireRuntimeArray(
    pattern.acceptableAlternatives,
    `${pattern.patternId} alternatives`,
    8
  );
  if (acceptableAlternatives.some((value) => (
    typeof value !== "string" || !value.trim() || value.length > 220
  ))) throw new TypeError(`Invalid executable grammar alternative: ${pattern.patternId}`);

  const matchCharacters = [...pattern.matchText];
  return Object.freeze({
    ...pattern,
    acceptableAlternatives: Object.freeze([...acceptableAlternatives]),
    leftContext: Object.freeze([...leftContext]),
    rightContext: Object.freeze([...rightContext]),
    requiredCapabilities: Object.freeze([...requiredCapabilities]),
    search: new RegExp(escapedFlexibleText(pattern.matchText), "giu"),
    replacementAtStart: new RegExp(`^${escapedFlexibleText(pattern.replacementText)}`, "iu"),
    matchStartsWithWord: WORD_CHARACTER_RE.test(matchCharacters[0] || ""),
    matchEndsWithWord: WORD_CHARACTER_RE.test(matchCharacters.at(-1) || "")
  });
}

function wordsWithRanges(value) {
  return [...value.matchAll(WORD_RE)].map((match) => Object.freeze({
    value: match[0].toLocaleLowerCase("en-GB"),
    start: match.index,
    end: match.index + match[0].length
  }));
}

function contextMatches(source, words, start, end, leftContext, rightContext) {
  if (leftContext.length) {
    const actual = words.filter((word) => word.end <= start).slice(-leftContext.length);
    if (
      actual.length !== leftContext.length
      || actual.some((word, index) => word.value !== leftContext[index])
      || SENTENCE_BOUNDARY_RE.test(source.slice(actual[0].end, start))
    ) return false;
  }
  if (rightContext.length) {
    const actual = words.filter((word) => word.start >= end).slice(0, rightContext.length);
    if (
      actual.length !== rightContext.length
      || actual.some((word, index) => word.value !== rightContext[index])
      || SENTENCE_BOUNDARY_RE.test(source.slice(end, actual.at(-1).start))
    ) return false;
  }
  return true;
}

function hasWordBoundary(source, start, end, pattern) {
  if (pattern.matchStartsWithWord && start > 0 && WORD_CHARACTER_RE.test(source[start - 1])) return false;
  if (pattern.matchEndsWithWord && end < source.length && WORD_CHARACTER_RE.test(source[end])) return false;
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
  const normalizedMatch = normalizeText(pattern.matchText);
  const normalizedReplacement = normalizeText(pattern.replacementText);
  if (normalizedReplacement === normalizedMatch && pattern.replacementText !== pattern.matchText) return false;
  if (!normalizedReplacement.includes(normalizedMatch)) return false;
  const match = pattern.replacementAtStart.exec(source.slice(start));
  if (!match) return false;
  const end = start + match[0].length;
  return !pattern.matchEndsWithWord || end >= source.length || !WORD_CHARACTER_RE.test(source[end]);
}

function preserveLeadingCase(original, replacement, template) {
  if (!replacement || !original) return replacement;
  const originalLetters = [...original].filter((character) => /\p{L}/u.test(character));
  const templateLetters = [...template].filter((character) => /\p{L}/u.test(character));
  const originalCasedLetters = originalLetters.filter((character) => (
    character.toLocaleLowerCase("en-GB") !== character.toLocaleUpperCase("en-GB")
  ));
  if (
    originalCasedLetters.length
    && originalCasedLetters.every((character) => character === character.toLocaleUpperCase("en-GB"))
    && templateLetters.some((character) => character === character.toLocaleLowerCase("en-GB"))
  ) {
    return replacement.toLocaleUpperCase("en-GB");
  }
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

function createCandidate(source, words, pattern, family, engine, match) {
  const start = match.index;
  const end = start + match[0].length;
  if (!hasWordBoundary(source, start, end, pattern)) return null;
  if (pattern.startsSentence && !startsSentenceAt(source, start)) return null;
  if (pattern.endsSentence && !endsSentenceAt(source, end)) return null;
  if (!contextMatches(source, words, start, end, pattern.leftContext, pattern.rightContext)) return null;
  if (replacementIsAlreadyPresent(source, start, pattern)) return null;

  const replacement = preserveLeadingCase(match[0], pattern.replacementText, pattern.matchText);
  if (!replacement || match[0] === replacement) return null;
  const reviewRequired = pattern.executionPolicy !== "local_auto";
  const alternatives = [replacement, ...pattern.acceptableAlternatives]
    .filter((value, index, values) => (
      typeof value === "string"
      && value.trim()
      && values.findIndex((candidate) => normalizeText(candidate) === normalizeText(value)) === index
    ));
  const contextStrength = pattern.leftContext.length + pattern.rightContext.length;
  const specificity = (
    contextStrength * 10000
    + Math.min(999, match[0].length) * 10
    + Number(pattern.startsSentence)
    + Number(pattern.endsSentence)
  );
  return Object.freeze({
    patternId: pattern.patternId,
    corpusSentenceId: pattern.sentenceId || "",
    ruleId: pattern.familyId,
    title: family.nameZhHant || family.name,
    category: family.grammarCategory,
    message: pattern.explanationZhHant || family.explanationZhHant,
    originalText: source.slice(start, end),
    suggestedText: reviewRequired ? "" : replacement,
    correctedSentence: reviewRequired
      ? source
      : `${source.slice(0, start)}${replacement}${source.slice(end)}`,
    start,
    end,
    confidence: pattern.confidence,
    detectorPriority: pattern.priority,
    reviewRequired,
    suggestions: reviewRequired
      ? Object.freeze([])
      : Object.freeze(alternatives.map((replacementText) => Object.freeze({
        kind: "replace",
        replacementText
      }))),
    engine,
    _priority: pattern.priority,
    _specificity: specificity,
    _conflictGroup: pattern.conflictGroup,
    _proposedReplacement: replacement
  });
}

function candidateOrder(left, right) {
  return (
    right._priority - left._priority
    || right._specificity - left._specificity
    || Number(right.reviewRequired) - Number(left.reviewRequired)
    || right.confidence - left.confidence
    || left.ruleId.localeCompare(right.ruleId)
    || left.patternId.localeCompare(right.patternId)
  );
}

function sameReplacement(left, right) {
  return normalizeText(left._proposedReplacement) === normalizeText(right._proposedReplacement);
}

function rangesOverlap(left, right) {
  return Math.max(left.start, right.start) < Math.min(left.end, right.end);
}

function collapseExactRanges(candidates) {
  const ranges = new Map();
  for (const candidate of candidates) {
    const key = `${candidate.start}:${candidate.end}`;
    const bucket = ranges.get(key) || [];
    bucket.push(candidate);
    ranges.set(key, bucket);
  }
  const winners = [];
  for (const bucket of ranges.values()) {
    bucket.sort(candidateOrder);
    const best = bucket[0];
    const strongest = bucket.filter((candidate) => (
      candidate._priority === best._priority
      && candidate._specificity === best._specificity
    ));
    if (strongest.some((candidate) => !sameReplacement(candidate, best))) continue;
    const cautious = strongest.find((candidate) => candidate.reviewRequired) || best;
    winners.push(cautious);
  }
  return winners;
}

function suppressAmbiguousOverlaps(candidates) {
  const suppressed = new Set();
  for (let leftIndex = 0; leftIndex < candidates.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < candidates.length; rightIndex += 1) {
      const left = candidates[leftIndex];
      const right = candidates[rightIndex];
      if (!rangesOverlap(left, right)) continue;
      if (left._priority !== right._priority) {
        suppressed.add(left._priority < right._priority ? left : right);
        continue;
      }
      if (left._conflictGroup === right._conflictGroup && left._specificity !== right._specificity) {
        suppressed.add(left._specificity < right._specificity ? left : right);
        continue;
      }
      suppressed.add(left);
      suppressed.add(right);
    }
  }
  return candidates.filter((candidate) => !suppressed.has(candidate));
}

function publicIssue(issue) {
  const {
    _priority,
    _specificity,
    _conflictGroup,
    _proposedReplacement,
    ...value
  } = issue;
  return Object.freeze(value);
}

export function createExecutableGrammarRuntime({
  families = [],
  patterns = [],
  engine = WRITING_ESL_RULE_ENGINE
} = {}) {
  if (!Array.isArray(families) || !Array.isArray(patterns)) {
    throw new TypeError("Executable grammar runtime data must contain arrays");
  }
  const familyById = new Map();
  for (const family of families) {
    if (!family || typeof family !== "object" || familyById.has(family.familyId)) {
      throw new TypeError("Executable grammar family data is invalid");
    }
    familyById.set(family.familyId, family);
  }
  const compiledPatterns = Object.freeze(patterns.map((pattern) => compilePattern(pattern, familyById)));

  function check(text, { maximumIssues = 8 } = {}) {
    const source = String(text || "");
    if (!source.trim()) return Object.freeze([]);
    const safeMaximum = Number.isSafeInteger(maximumIssues)
      ? Math.max(0, Math.min(32, maximumIssues))
      : 8;
    if (!safeMaximum) return Object.freeze([]);

    const words = wordsWithRanges(source);
    const candidates = [];
    for (const pattern of compiledPatterns) {
      pattern.search.lastIndex = 0;
      const family = familyById.get(pattern.familyId);
      for (const match of source.matchAll(pattern.search)) {
        const candidate = createCandidate(source, words, pattern, family, engine, match);
        if (candidate) candidates.push(candidate);
      }
    }

    const selected = suppressAmbiguousOverlaps(collapseExactRanges(candidates))
      .sort(candidateOrder)
      .slice(0, safeMaximum)
      .sort((left, right) => (
        left.start - right.start
        || left.end - right.end
        || left.ruleId.localeCompare(right.ruleId)
      ));
    return Object.freeze(selected.map(publicIssue));
  }

  return Object.freeze({
    familyCount: familyById.size,
    patternCount: compiledPatterns.length,
    check
  });
}

const DEFAULT_RUNTIME = createExecutableGrammarRuntime({
  families: EXECUTABLE_GRAMMAR_FAMILIES,
  patterns: EXECUTABLE_GRAMMAR_PATTERNS
});

/** Run only compiler-approved surface patterns. Unsupported parser-dependent families stay inactive. */
export function checkExecutableGrammar(text, options) {
  return DEFAULT_RUNTIME.check(text, options);
}
