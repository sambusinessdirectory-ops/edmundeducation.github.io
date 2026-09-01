const FEEDBACK_HIGHLIGHT_SHORTCUTS = Object.freeze({
  y: "yellow",
  o: "orange",
  b: "blue",
  g: "green",
  r: "red"
});

const FEEDBACK_HIGHLIGHTS = new Set(Object.values(FEEDBACK_HIGHLIGHT_SHORTCUTS));
const MAX_FEEDBACK_FORMATTING_RUNS = 500;
const MAX_FEEDBACK_LIST_ITEMS = 100;
const MAX_FEEDBACK_ENHANCEMENT_PARTS = 100;
const MAX_FEEDBACK_LIST_ITEM_LENGTH = 20_000;
const SENTENCE_STRUCTURE_LESSON_RE = /^[a-z0-9][a-z0-9_-]{0,79}$/iu;
const DEFAULT_FEEDBACK_TABLE_COLUMN_WIDTHS = Object.freeze([30, 40, 30]);
const MIN_FEEDBACK_TABLE_COLUMN_WIDTH = 15;

function safeInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

function trimRange(text, startValue, endValue) {
  let start = Math.max(0, safeInteger(startValue) ?? 0);
  let end = Math.min(text.length, Math.max(start, safeInteger(endValue) ?? start));
  while (start < end && /\s/u.test(text[start])) start += 1;
  while (end > start && /\s/u.test(text[end - 1])) end -= 1;
  return { start, end };
}

function feedbackLines(text) {
  const lines = [];
  let start = 0;
  while (start < text.length) {
    const newline = text.indexOf("\n", start);
    const nextStart = newline < 0 ? text.length : newline + 1;
    let end = newline < 0 ? text.length : newline;
    if (end > start && text[end - 1] === "\r") end -= 1;
    lines.push({
      start,
      end,
      nextStart,
      text: text.slice(start, end)
    });
    start = nextStart;
  }
  return lines;
}

/**
 * Resolves the five feedback highlighter keyboard shortcuts. The integration
 * layer remains responsible for preventing the browser default and applying
 * the returned command to the active rich-text editor.
 */
export function feedbackHighlightCommandFromEvent(event) {
  if (!event || (!event.metaKey && !event.ctrlKey) || event.altKey || event.shiftKey) return null;
  return FEEDBACK_HIGHLIGHT_SHORTCUTS[String(event.key || "").toLowerCase()] || null;
}

/** Resolves color and bold keyboard commands for the rich feedback editor. */
export function feedbackFormattingCommandFromEvent(event) {
  if (!event || (!event.metaKey && !event.ctrlKey) || event.altKey) return null;
  const key = String(event.key || "").toLowerCase();
  if (event.shiftKey && key === "b") return "bold";
  if (event.shiftKey) return null;
  return FEEDBACK_HIGHLIGHT_SHORTCUTS[key] || null;
}

/**
 * Splits feedback into ordinary text blocks and numbered-card groups.
 *
 * A line beginning with `1.`, `2.`, etc. starts a card. Subsequent non-empty,
 * non-numbered lines remain part of that card. A blank line closes the entire
 * numbered group, which lets the editor integration use Shift+Enter as the
 * explicit escape back to an ordinary paragraph.
 *
 * Every text/card `start` and `end` range points into the unmodified source;
 * callers can therefore pass the range directly to sliceFeedbackFormattingRuns.
 */
export function parseNumberedFeedbackBlocks(value) {
  const text = String(value || "");
  if (!text.trim()) return [];

  const blocks = [];
  let ordinaryStart = null;
  let ordinaryEnd = null;
  let numberedBlock = null;
  let numberedItem = null;

  const flushOrdinary = () => {
    if (ordinaryStart === null) return;
    const range = trimRange(text, ordinaryStart, ordinaryEnd);
    if (range.end > range.start) {
      blocks.push({
        type: "text",
        text: text.slice(range.start, range.end),
        start: range.start,
        end: range.end
      });
    }
    ordinaryStart = null;
    ordinaryEnd = null;
  };

  const flushNumberedItem = () => {
    if (!numberedBlock || !numberedItem) return;
    const range = trimRange(text, numberedItem.start, numberedItem.end);
    if (range.end > range.start) {
      numberedBlock.items.push({
        number: numberedItem.number,
        text: text.slice(range.start, range.end),
        start: range.start,
        end: range.end
      });
      numberedBlock.end = range.end;
    }
    numberedItem = null;
  };

  const flushNumberedBlock = () => {
    flushNumberedItem();
    if (numberedBlock?.items.length) blocks.push(numberedBlock);
    numberedBlock = null;
  };

  for (const line of feedbackLines(text)) {
    if (!line.text.trim()) {
      flushNumberedBlock();
      flushOrdinary();
      continue;
    }

    const marker = line.text.match(/^([ \t]*)([1-9][0-9]{0,2})\.[ \t]*(?=\S)/u);
    if (marker) {
      flushOrdinary();
      flushNumberedItem();
      if (!numberedBlock) {
        numberedBlock = {
          type: "numbered",
          start: line.start + marker[1].length,
          end: line.end,
          items: []
        };
      }
      numberedItem = {
        number: Number(marker[2]),
        start: line.start + marker[0].length,
        end: line.end
      };
      continue;
    }

    if (numberedBlock && numberedItem) {
      numberedItem.end = line.end;
      continue;
    }

    flushNumberedBlock();
    if (ordinaryStart === null) ordinaryStart = line.start;
    ordinaryEnd = line.end;
  }

  flushNumberedBlock();
  flushOrdinary();
  return blocks;
}

/**
 * Clips rich-formatting runs to [start, end) and rebases their offsets so the
 * returned runs address the sliced text beginning at zero.
 */
export function sliceFeedbackFormattingRuns(value, startValue, endValue) {
  if (!Array.isArray(value)) return [];
  const start = safeInteger(startValue);
  const end = safeInteger(endValue);
  if (start === null || end === null || start < 0 || end <= start) return [];

  const clipped = value.map(run => {
    const runStart = safeInteger(run?.start);
    const runEnd = safeInteger(run?.end);
    if (runStart === null || runEnd === null || runStart < 0 || runEnd <= runStart) return null;
    const clippedStart = Math.max(start, runStart);
    const clippedEnd = Math.min(end, runEnd);
    if (clippedEnd <= clippedStart) return null;
    const highlight = FEEDBACK_HIGHLIGHTS.has(String(run?.highlight || ""))
      ? String(run.highlight)
      : "";
    const normalized = {
      start: clippedStart - start,
      end: clippedEnd - start,
      bold: run?.bold === true,
      italic: run?.italic === true,
      strikethrough: run?.strikethrough === true,
      highlight
    };
    return normalized.bold || normalized.italic || normalized.strikethrough || normalized.highlight
      ? normalized
      : null;
  }).filter(Boolean).sort((left, right) => left.start - right.start || left.end - right.end);

  const output = [];
  let cursor = 0;
  for (const run of clipped) {
    if (run.start < cursor) continue;
    const previous = output[output.length - 1];
    if (
      previous
      && previous.end === run.start
      && previous.bold === run.bold
      && previous.italic === run.italic
      && previous.strikethrough === run.strikethrough
      && previous.highlight === run.highlight
    ) {
      previous.end = run.end;
    } else {
      output.push(run);
    }
    cursor = run.end;
    if (output.length >= MAX_FEEDBACK_FORMATTING_RUNS) break;
  }
  return output;
}

function normalizeFeedbackTextItems(value) {
  if (!Array.isArray(value)) return [];
  const output = [];
  for (const item of value) {
    if (!item || typeof item !== "object" || Array.isArray(item) || typeof item.text !== "string") continue;
    const rawText = item.text;
    const text = rawText.trim();
    if (!text || text.length > MAX_FEEDBACK_LIST_ITEM_LENGTH) continue;
    const trimStart = rawText.indexOf(text);
    output.push({
      text,
      formatting: sliceFeedbackFormattingRuns(
        Array.isArray(item.formatting) ? item.formatting : [],
        trimStart,
        trimStart + text.length
      )
    });
    if (output.length >= MAX_FEEDBACK_LIST_ITEMS) break;
  }
  return output;
}

/** Returns a bounded, canonical `{ text, formatting }[]` grammar-point list. */
export function normalizeGrammarFeedbackPoints(value) {
  return normalizeFeedbackTextItems(value);
}

/** Returns a bounded, canonical `{ text, formatting }[]` structure-method list. */
export function normalizeSentenceStructureMethods(value) {
  return normalizeFeedbackTextItems(value);
}

function emptyRichFeedbackValue() {
  return { text: "", formatting: [] };
}

/** Returns three bounded percentages whose sum is exactly 100. */
export function normalizeFeedbackTableColumnWidths(value) {
  if (!Array.isArray(value) || value.length !== 3) {
    return [...DEFAULT_FEEDBACK_TABLE_COLUMN_WIDTHS];
  }
  const widths = value.map(Number);
  if (widths.some(width => !Number.isFinite(width) || width < MIN_FEEDBACK_TABLE_COLUMN_WIDTH)) {
    return [...DEFAULT_FEEDBACK_TABLE_COLUMN_WIDTHS];
  }
  const total = widths.reduce((sum, width) => sum + width, 0);
  if (total <= 0) return [...DEFAULT_FEEDBACK_TABLE_COLUMN_WIDTHS];
  const normalized = widths.map(width => Math.round((width / total) * 10_000) / 100);
  normalized[2] = Math.round((100 - normalized[0] - normalized[1]) * 100) / 100;
  if (normalized.some(width => width < MIN_FEEDBACK_TABLE_COLUMN_WIDTH)) {
    return [...DEFAULT_FEEDBACK_TABLE_COLUMN_WIDTHS];
  }
  return normalized;
}

function normalizeRichFeedbackValue(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || typeof value.text !== "string") {
    return emptyRichFeedbackValue();
  }
  const rawText = value.text;
  const text = rawText.trim();
  if (!text || text.length > MAX_FEEDBACK_LIST_ITEM_LENGTH) return emptyRichFeedbackValue();
  const trimStart = rawText.indexOf(text);
  return {
    text,
    formatting: sliceFeedbackFormattingRuns(
      Array.isArray(value.formatting) ? value.formatting : [],
      trimStart,
      trimStart + text.length
    )
  };
}

/**
 * Canonicalizes ordered Original / Enhancement / Benefit records. Legacy
 * sentence-method items remain visible as enhancement-only records.
 */
export function normalizeFeedbackEnhancementParts(value) {
  if (!Array.isArray(value)) return [];
  const output = [];
  for (const item of value) {
    let normalized;
    if (item && typeof item === "object" && !Array.isArray(item) && typeof item.text === "string") {
      normalized = {
        originalSentence: emptyRichFeedbackValue(),
        enhancement: normalizeRichFeedbackValue(item),
        benefit: emptyRichFeedbackValue()
      };
    } else if (item && typeof item === "object" && !Array.isArray(item)) {
      normalized = {
        originalSentence: normalizeRichFeedbackValue(item.originalSentence),
        enhancement: normalizeRichFeedbackValue(item.enhancement),
        benefit: normalizeRichFeedbackValue(item.benefit)
      };
    } else {
      continue;
    }
    if (
      !normalized.originalSentence.text
      && !normalized.enhancement.text
      && !normalized.benefit.text
    ) continue;
    if (output.length === 0 && Array.isArray(item?.columnWidths)) {
      normalized.columnWidths = normalizeFeedbackTableColumnWidths(item.columnWidths);
    }
    output.push(normalized);
    if (output.length >= MAX_FEEDBACK_ENHANCEMENT_PARTS) break;
  }
  return output;
}

/**
 * Accepts only the Edmund sentence-structure lesson path (absolute HTTPS or
 * relative) with one safe `lesson` parameter, and returns its canonical
 * relative form. All other hosts, paths, parameters, fragments and protocols
 * fail closed.
 */
export function normalizeSentenceStructureDeepLink(value) {
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (!input || input.length > 500 || input.startsWith("//")) return null;

  let url;
  try {
    url = new URL(input, "https://edmundeducation.com/");
  } catch {
    return null;
  }

  if (
    url.protocol !== "https:"
    || url.hostname !== "edmundeducation.com"
    || url.port
    || url.username
    || url.password
    || url.pathname !== "/sentence-structure.html"
    || url.hash
  ) return null;

  const parameters = [...url.searchParams.entries()];
  if (parameters.length !== 1 || parameters[0][0] !== "lesson") return null;
  const lesson = parameters[0][1];
  if (!SENTENCE_STRUCTURE_LESSON_RE.test(lesson)) return null;
  return `/sentence-structure.html?lesson=${encodeURIComponent(lesson)}`;
}
