const COMMON_ABBREVIATIONS = new Set([
  "mr", "mrs", "ms", "dr", "prof", "sr", "jr", "st", "vs", "etc",
  "e.g", "i.e"
]);

export function countEnglishWords(value) {
  const text = String(value || "").trim();
  if (!text) return 0;
  return text.split(/\s+/u).filter(Boolean).length;
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
