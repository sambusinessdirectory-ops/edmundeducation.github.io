const COMMON_ABBREVIATIONS = new Set([
  "mr", "mrs", "ms", "dr", "prof", "sr", "jr", "st", "vs", "etc",
  "e.g", "i.e"
]);

const WRITING_SUBMISSION_UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const WRITING_EXERCISE_ID_RE = /^[a-z0-9][a-z0-9._~-]{0,239}$/iu;

export function normalizeWritingSubmissionEntryLink(value) {
  let parameters;
  try {
    parameters = value instanceof URLSearchParams
      ? value
      : new URLSearchParams(String(value || "").replace(/^\?/, ""));
  } catch {
    return null;
  }

  const entries = [...parameters.entries()];
  if (entries.length !== 1 || !["submission", "exercise"].includes(entries[0][0])) return null;

  const submissionId = String(parameters.get("submission") || "").trim();
  if (submissionId && WRITING_SUBMISSION_UUID_RE.test(submissionId)) {
    return Object.freeze({ type: "submission", submissionId: submissionId.toLowerCase() });
  }

  const exerciseId = String(parameters.get("exercise") || "").trim();
  if (exerciseId && WRITING_EXERCISE_ID_RE.test(exerciseId)) {
    return Object.freeze({ type: "exercise", exerciseId });
  }

  return null;
}

export function writingSubmissionArticlePath(submissionId) {
  const normalized = String(submissionId || "").trim().toLowerCase();
  if (!WRITING_SUBMISSION_UUID_RE.test(normalized)) return "";
  return `writing-submission.html?submission=${encodeURIComponent(normalized)}`;
}

export function writingSubmissionNotificationMessage(submissionId, baseHref = "https://edmundeducation.com/") {
  const path = writingSubmissionArticlePath(submissionId);
  if (!path) return "";
  let url;
  try {
    url = new URL(path, String(baseHref || "https://edmundeducation.com/")).href;
  } catch {
    return "";
  }
  return `Edmund 通知：\n您的作文已改好，請努力溫習！ 😬💪🏻\n${url}`;
}

export function writingTopicResourceForTransport(resource) {
  if (!resource || typeof resource !== "object" || Array.isArray(resource)) return null;
  return {
    id: String(resource.id || ""),
    type: String(resource.type || ""),
    label: String(resource.label || ""),
    detail: String(resource.detail || ""),
    sectionKey: String(resource.sectionKey || ""),
    questionPrompt: Array.isArray(resource.questionPrompt)
      ? resource.questionPrompt.map(value => String(value || ""))
      : [],
    questionImages: Array.isArray(resource.questionImages)
      ? resource.questionImages.map(image => ({
          src: String(image?.src || ""),
          alt: String(image?.alt || "")
        }))
      : []
  };
}

export function countEnglishWords(value) {
  const text = String(value || "").trim();
  if (!text) return 0;
  return text.split(/\s+/u).filter(Boolean).length;
}

export function normalizeVocabularyMatchText(value) {
  return String(value || "")
    .normalize("NFKC")
    .replace(/[\u2018\u2019\u02bc]/gu, "'")
    .replace(/[\u201c\u201d]/gu, '"')
    .replace(/\u2026/gu, "...")
    .toLocaleLowerCase("en-GB")
    .replace(/\s+/gu, " ")
    .trim();
}

function escapeVocabularyPattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

export function vocabularyEntryUsed(answerValue, entryValue) {
  const answer = normalizeVocabularyMatchText(answerValue);
  const entry = normalizeVocabularyMatchText(entryValue);
  if (!answer || !entry) return false;
  const pattern = escapeVocabularyPattern(entry).replace(/ /gu, "\\s+");
  const leadingBoundary = /^[\p{L}\p{N}']/u.test(entry) ? "(?<![\\p{L}\\p{N}'])" : "";
  const trailingBoundary = /[\p{L}\p{N}']$/u.test(entry) ? "(?![\\p{L}\\p{N}'])" : "";
  return new RegExp(`${leadingBoundary}${pattern}${trailingBoundary}`, "u").test(answer);
}

export function isCompletedSentenceTerminator(textValue, index) {
  const text = String(textValue || "");
  const character = text[index];
  if (character === ";") return true;
  if (character !== ".") return false;

  const before = text[index - 1] || "";
  const after = text[index + 1] || "";

  // Decimal numbers and domains are not sentence endings.
  if (/\d/u.test(before) && /\d/u.test(after)) return false;
  if (/[\p{L}\p{N}]/u.test(before) && /[\p{L}\p{N}]/u.test(after)) return false;

  // Only the last point in an ellipsis completes the sentence.
  if (after === ".") return false;

  const prefix = text.slice(Math.max(0, index - 12), index).toLowerCase();
  const abbreviation = prefix.match(/([a-z](?:\.[a-z])?|[a-z]{2,5})$/u)?.[1] || "";
  if (COMMON_ABBREVIATIONS.has(abbreviation)) return false;

  return true;
}

export function completedWritingSegments(value) {
  const text = String(value || "");
  const segments = [];
  let boundary = 0;

  for (let index = 0; index < text.length; index += 1) {
    if (!isCompletedSentenceTerminator(text, index)) continue;
    const rawStart = boundary;
    const rawEnd = index + 1;
    const raw = text.slice(rawStart, rawEnd);
    const leading = raw.match(/^\s*/u)?.[0].length || 0;
    const trailing = raw.match(/\s*$/u)?.[0].length || 0;
    const start = rawStart + leading;
    const end = Math.max(start, rawEnd - trailing);
    if (end > start) {
      segments.push({
        start,
        end,
        text: text.slice(start, end),
        ordinal: segments.length + 1,
        terminatorIndex: index
      });
    }
    boundary = rawEnd;
  }

  return segments;
}

export function isLiveCompletedWritingSegment(value, candidate) {
  if (!candidate || typeof candidate !== "object") return false;
  return completedWritingSegments(value).some((segment) => (
    segment.start === candidate.start
    && segment.end === candidate.end
    && segment.text === candidate.text
  ));
}

export function completedWritingSegmentsOverlappingRange(value, startValue, endValue) {
  const text = String(value || "");
  const start = Math.max(0, Math.min(text.length, Number(startValue) || 0));
  const end = Math.max(start, Math.min(text.length, Number(endValue) || start));
  return completedWritingSegments(text).filter((segment) => (
    segment.end > start && segment.start < end
  ));
}

export function completedWritingSegmentsAffectedByEdit(previousValue, nextValue) {
  const previous = String(previousValue || "");
  const next = String(nextValue || "");
  if (previous === next) return [];
  const change = insertedRange(previous, next);
  const suffixLength = next.length - change.end;
  const previousEnd = previous.length - suffixLength;
  const delta = (change.end - change.start) - (previousEnd - change.start);
  const probeEnd = Math.max(previousEnd, change.start + 1);
  const affectedPrevious = completedWritingSegments(previous).filter((segment) => (
    segment.end > change.start && segment.start < probeEnd
  ));
  if (!affectedPrevious.length) return [];
  const affectedRanges = affectedPrevious.map((segment) => ({
    start: segment.start,
    end: Math.max(segment.start, segment.end + delta)
  }));
  return completedWritingSegments(next).filter((segment) => (
    affectedRanges.some((range) => segment.end > range.start && segment.start < range.end)
  ));
}

export function insertedRange(previousValue, nextValue) {
  const previous = String(previousValue || "");
  const next = String(nextValue || "");
  let prefixLength = 0;
  const maximumPrefix = Math.min(previous.length, next.length);
  while (prefixLength < maximumPrefix && previous[prefixLength] === next[prefixLength]) {
    prefixLength += 1;
  }

  let suffixLength = 0;
  const maximumSuffix = Math.min(previous.length - prefixLength, next.length - prefixLength);
  while (
    suffixLength < maximumSuffix
    && previous[previous.length - 1 - suffixLength] === next[next.length - 1 - suffixLength]
  ) {
    suffixLength += 1;
  }

  return {
    start: prefixLength,
    end: next.length - suffixLength,
    text: next.slice(prefixLength, next.length - suffixLength)
  };
}

export function newlyCompletedWritingSegments(previousValue, nextValue) {
  const next = String(nextValue || "");
  const insertion = insertedRange(previousValue, next);
  if (!insertion.text || !/[.;]/u.test(insertion.text)) return [];

  return completedWritingSegments(next).filter((segment) => (
    segment.terminatorIndex >= insertion.start
    && segment.terminatorIndex < insertion.end
  ));
}

export function normalizedIssueFingerprintPart(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLocaleLowerCase("en-GB")
    .replace(/\s+/gu, " ")
    .trim();
}

export function grammarOccurrenceIdentity({
  engineIdentity = "",
  documentId = "",
  ruleId = "",
  segmentOrdinal = 0,
  sentenceText = "",
  start = 0,
  end = 0,
  originalText = "",
  suggestedText = "",
  correctedSentence = ""
} = {}) {
  // JSON keeps the fields unambiguous even when the student's sentence
  // contains punctuation used by simpler delimiter-based identities.
  return JSON.stringify([
    String(engineIdentity),
    String(documentId).toLocaleLowerCase("en-GB"),
    String(ruleId),
    Math.max(0, Number(segmentOrdinal) || 0),
    String(sentenceText),
    Math.max(0, Number(start) || 0),
    Math.max(0, Number(end) || 0),
    String(originalText),
    String(suggestedText),
    String(correctedSentence)
  ]);
}

export function formatSubmissionDate(value, locale = "zh-HK") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "日期未詳";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
