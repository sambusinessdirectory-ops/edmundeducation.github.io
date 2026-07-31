import {
  checkLocalLearnerEnglish,
  mergeGrammarIssues
} from "./writing-submission-esl-rules.js?v=20260731-2";
import {
  Dialect,
  SuggestionKind,
  WorkerLinter
} from "./assets/vendor/harper/2.7.0/index.js";
import { slimBinary } from "./assets/vendor/harper/2.7.0/slimBinary.js";

export const WRITING_GRAMMAR_ENGINE = Object.freeze({
  name: "harper.js",
  version: "2.7.0",
  variant: "slim",
  dialect: "British"
});

const TERMINATORS = new Set([".", ";"]);
const DEFAULT_LINT_OPTIONS = Object.freeze({
  language: "plaintext",
  dedup: true,
  isolateEnglish: false
});

function requireString(value, name) {
  if (typeof value !== "string") {
    throw new TypeError(`${name} must be a string.`);
  }
  return value;
}

function safeFree(value) {
  try {
    value?.free?.();
  } catch {
    // Releasing a diagnostic must never hide an otherwise usable result.
  }
}

function readSpanCoordinate(span, key) {
  const member = span?.[key];
  const value = typeof member === "function" ? member.call(span) : member;
  return Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : 0;
}

function clampOffset(value, maximum) {
  return Math.max(0, Math.min(maximum, value));
}

/**
 * Convert a Unicode scalar-value index into the UTF-16 offset used by browser
 * textarea selection APIs. Harper 2.7's public span() already yields UTF-16
 * offsets, but its serialized inner diagnostic contains scalar indices. This
 * converter is retained as a checked fallback so either representation is safe.
 */
export function unicodeScalarIndexToUtf16Offset(text, scalarIndex) {
  const source = requireString(text, "text");
  const target = Math.max(0, Math.trunc(Number(scalarIndex) || 0));
  let scalarPosition = 0;
  let utf16Position = 0;

  for (const character of source) {
    if (scalarPosition >= target) break;
    utf16Position += character.length;
    scalarPosition += 1;
  }

  return utf16Position;
}

/**
 * Return a browser-safe UTF-16 span. Prefer Harper's public span as-is when it
 * selects the reported problem text; otherwise interpret it as scalar indices.
 */
export function normalizeHarperSpan(text, span, problemText = "") {
  const source = requireString(text, "text");
  const problem = typeof problemText === "string" ? problemText : "";
  const rawStart = clampOffset(readSpanCoordinate(span, "start"), source.length);
  const rawEnd = clampOffset(readSpanCoordinate(span, "end"), source.length);
  const utf16Candidate = {
    start: Math.min(rawStart, rawEnd),
    end: Math.max(rawStart, rawEnd)
  };

  if (!problem || source.slice(utf16Candidate.start, utf16Candidate.end) === problem) {
    return utf16Candidate;
  }

  const scalarCandidate = {
    start: unicodeScalarIndexToUtf16Offset(source, Math.min(rawStart, rawEnd)),
    end: unicodeScalarIndexToUtf16Offset(source, Math.max(rawStart, rawEnd))
  };

  if (source.slice(scalarCandidate.start, scalarCandidate.end) === problem) {
    return scalarCandidate;
  }

  return utf16Candidate;
}

/** Return the smallest UTF-16 range that changed between two editor values. */
export function getWritingChangeRange(previousText, currentText) {
  const previous = requireString(previousText, "previousText");
  const current = requireString(currentText, "currentText");
  const sharedLength = Math.min(previous.length, current.length);
  let start = 0;

  while (start < sharedLength && previous[start] === current[start]) start += 1;

  let previousEnd = previous.length;
  let currentEnd = current.length;
  while (
    previousEnd > start
    && currentEnd > start
    && previous[previousEnd - 1] === current[currentEnd - 1]
  ) {
    previousEnd -= 1;
    currentEnd -= 1;
  }

  return Object.freeze({
    start,
    previousEnd,
    currentEnd,
    removedText: previous.slice(start, previousEnd),
    insertedText: current.slice(start, currentEnd)
  });
}

function previousTerminatorOffset(text, beforeOffset) {
  for (let index = beforeOffset - 1; index >= 0; index -= 1) {
    if (TERMINATORS.has(text[index])) return index;
  }
  return -1;
}

/**
 * Identify only sentences/clauses completed by a newly inserted full stop or
 * semicolon. Existing punctuation does not retrigger Harper on ordinary edits.
 */
export function getNewlyCompletedWritingSegments(previousText, currentText) {
  const previous = requireString(previousText, "previousText");
  const current = requireString(currentText, "currentText");
  const change = getWritingChangeRange(previous, current);
  const segments = [];
  const seenEnds = new Set();

  for (let offset = change.start; offset < change.currentEnd; offset += 1) {
    const terminator = current[offset];
    if (!TERMINATORS.has(terminator) || seenEnds.has(offset + 1)) continue;

    let start = previousTerminatorOffset(current, offset) + 1;
    const end = offset + 1;
    while (start < end && /\s/u.test(current[start])) start += 1;

    const segmentText = current.slice(start, end);
    const contentWithoutTerminator = segmentText.slice(0, -1).trim();
    if (!contentWithoutTerminator) continue;

    seenEnds.add(end);
    segments.push(Object.freeze({
      start,
      end,
      text: segmentText,
      terminator
    }));
  }

  return Object.freeze(segments);
}

export function shouldTriggerWritingGrammarCheck(previousText, currentText) {
  return getNewlyCompletedWritingSegments(previousText, currentText).length > 0;
}

function humanizeRuleId(ruleId) {
  const readable = String(ruleId || "Grammar")
    .replace(/[_-]+/gu, " ")
    .replace(/([a-z\d])([A-Z])/gu, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/gu, "$1 $2")
    .trim();
  return readable || "Grammar";
}

function suggestionKindName(kind) {
  switch (kind) {
    case SuggestionKind.Replace:
      return "replace";
    case SuggestionKind.Remove:
      return "remove";
    case SuggestionKind.InsertAfter:
      return "insertAfter";
    default:
      return "unknown";
  }
}

function applySerializableSuggestion(text, span, suggestion) {
  if (!suggestion) return null;
  const replacement = suggestion.replacementText;

  if (suggestion.kind === "insertAfter") {
    return `${text.slice(0, span.end)}${replacement}${text.slice(span.end)}`;
  }

  if (suggestion.kind === "remove") {
    return `${text.slice(0, span.start)}${text.slice(span.end)}`;
  }

  if (suggestion.kind === "replace") {
    return `${text.slice(0, span.start)}${replacement}${text.slice(span.end)}`;
  }

  return null;
}

/**
 * Convert Harper's organized lint map into detached, serializable objects.
 * All WASM-backed spans, suggestions and lints are released before returning.
 */
export async function serializeOrganizedHarperLints(text, organizedLints) {
  const source = requireString(text, "text");
  const groups = organizedLints && typeof organizedLints === "object" ? organizedLints : {};
  const issues = [];

  for (const [ruleId, lints] of Object.entries(groups)) {
    if (!Array.isArray(lints) || lints.length === 0) continue;

    for (const lint of lints) {
      let spanObject;
      let suggestionObjects = [];

      try {
        const originalText = String(lint.get_problem_text?.() ?? "");
        spanObject = lint.span?.();
        const span = normalizeHarperSpan(source, spanObject, originalText);
        suggestionObjects = Array.from(lint.suggestions?.() ?? []);
        const suggestions = suggestionObjects.map((suggestion) => {
          const kindValue = suggestion.kind?.();
          return Object.freeze({
            kind: suggestionKindName(kindValue),
            replacementText: String(suggestion.get_replacement_text?.() ?? "")
          });
        });
        const primarySuggestion = suggestions[0] || null;
        const category = String(lint.lint_kind?.() ?? "Grammar");

        issues.push(Object.freeze({
          ruleId: String(ruleId),
          title: humanizeRuleId(ruleId),
          category,
          message: String(lint.message?.() ?? ""),
          originalText,
          suggestedText: primarySuggestion?.replacementText ?? "",
          correctedSentence: applySerializableSuggestion(source, span, primarySuggestion),
          start: span.start,
          end: span.end,
          suggestions: Object.freeze(suggestions),
          engine: WRITING_GRAMMAR_ENGINE
        }));
      } finally {
        suggestionObjects.forEach(safeFree);
        safeFree(spanObject);
        safeFree(lint);
      }
    }
  }

  issues.sort((left, right) => (
    left.start - right.start
    || left.end - right.end
    || left.ruleId.localeCompare(right.ruleId)
  ));
  return Object.freeze(issues);
}

function createBrowserWorkerLinter() {
  if (
    typeof Worker === "undefined"
    || typeof Blob === "undefined"
    || typeof URL === "undefined"
    || typeof URL.createObjectURL !== "function"
  ) {
    throw new Error("Harper grammar checking requires browser Web Worker support.");
  }

  return new WorkerLinter({
    binary: slimBinary,
    dialect: Dialect.British
  });
}

/**
 * Create the stage-one writing checker. Construction is side-effect free;
 * setup() lazily starts the Worker and downloads/compiles the same-origin WASM.
 */
export function createWritingGrammarChecker({
  linterFactory = createBrowserWorkerLinter
} = {}) {
  let linter = null;
  let setupPromise = null;
  let disposed = false;

  async function setup() {
    if (disposed) throw new Error("The writing grammar checker has been disposed.");
    if (!linter) linter = linterFactory();
    if (!linter || typeof linter.setup !== "function" || typeof linter.organizedLints !== "function") {
      throw new TypeError("linterFactory must return a Harper-compatible linter.");
    }

    if (!setupPromise) {
      setupPromise = Promise.resolve(linter.setup()).catch((error) => {
        setupPromise = null;
        throw error;
      });
    }
    await setupPromise;
  }

  async function check(text) {
    const source = requireString(text, "text");
    if (!source.trim()) return Object.freeze([]);
    const localIssues = checkLocalLearnerEnglish(source);
    await setup();
    const organized = await linter.organizedLints(source, DEFAULT_LINT_OPTIONS);
    const harperIssues = (await serializeOrganizedHarperLints(source, organized))
      .filter((issue) => ![
        "EllipsisLength", "UseEllipsisCharacter"
      ].includes(issue.ruleId));
    return mergeGrammarIssues(localIssues, harperIssues);
  }

  async function dispose() {
    if (disposed) return;
    disposed = true;
    setupPromise = null;
    const activeLinter = linter;
    linter = null;
    if (activeLinter && typeof activeLinter.dispose === "function") {
      await activeLinter.dispose();
    }
  }

  return Object.freeze({ setup, check, dispose });
}
