const MARKER_PREFIX = "[[@edmund-homework:v1:";
const MARKER_PATTERN = /^\[\[@edmund-homework:v1:([A-Za-z0-9_-]+)\]\]$/gm;
export const MAX_HOMEWORK_RESOURCES = 12;
export const SCHEDULE_MESSAGE_MAX_LENGTH = 2000;

export const HOMEWORK_RESOURCE_TYPES = Object.freeze([
  Object.freeze({ type: "flashcards", trigger: "Flash Cards", label: "Flash Cards", color: "#3f73d8" }),
  Object.freeze({ type: "fill-blanks", trigger: "Fill in the blanks", label: "Fill in the blanks", color: "#e49a31" }),
  Object.freeze({ type: "writing-submission", trigger: "Writing Submission", label: "Writing Submission", color: "#b75ac7" }),
  Object.freeze({ type: "idiom", trigger: "Idiom", label: "Idiom", color: "#e65b3d" }),
  Object.freeze({ type: "proverb", trigger: "Proverb", label: "Proverb", color: "#94613c" }),
  Object.freeze({ type: "phrasal-verb", trigger: "Phrasal Verbs", label: "Phrasal Verbs", color: "#31966a" }),
  Object.freeze({ type: "speaking", trigger: "Speaking", label: "Speaking", color: "#2b9caf" }),
  Object.freeze({ type: "sentence-structure", trigger: "Sentence Structure", label: "Sentence Structure", color: "#6e62c9" })
]);

const TYPE_BY_NAME = new Map(HOMEWORK_RESOURCE_TYPES.map((item) => [item.type, item]));
const ALLOWED_PAGE_BY_TYPE = Object.freeze({
  flashcards: "/flashcards.html",
  "fill-blanks": "/writing-practice.html",
  "writing-submission": "/writing-submission.html",
  idiom: "/idiom-system.html",
  proverb: "/proverb-system.html",
  "phrasal-verb": "/phrasal-verb-system.html",
  speaking: "/speaking-system.html",
  "sentence-structure": "/sentence-structure.html"
});
const EXPECTED_PARAMETER_BY_PAGE = Object.freeze({
  "/flashcards.html": "deck",
  "/writing-practice.html": "exercise",
  "/writing-submission.html": null,
  "/idiom-system.html": "lesson",
  "/proverb-system.html": "lesson",
  "/phrasal-verb-system.html": "lesson",
  "/speaking-system.html": "exercise",
  "/sentence-structure.html": "lesson"
});

function encodeBase64Url(value) {
  const bytes = new TextEncoder().encode(String(value));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}

export function normalizeHomeworkResource(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const type = String(value.type || "");
  if (!TYPE_BY_NAME.has(type)) return null;
  const id = String(value.id || "").trim().slice(0, 240);
  const label = String(value.label || "").replace(/\s+/g, " ").trim().slice(0, 180);
  const idPrefix = type === "flashcards"
    ? "flash"
    : type === "fill-blanks"
      ? "fill"
      : type === "sentence-structure"
        ? "sentence"
        : type;
  if (!id || !label || !id.startsWith(`${idPrefix}:`)) return null;

  const url = normalizeHomeworkHref(value.url);
  if (!url) return null;
  const parsed = new URL(url, "https://edmundeducation.com/");
  if (parsed.pathname !== ALLOWED_PAGE_BY_TYPE[type]) return null;
  return Object.freeze({ id, type, label, url });
}

export function normalizeHomeworkHref(value) {
  let parsed;
  try {
    parsed = new URL(String(value || ""), "https://edmundeducation.com/");
  } catch {
    return null;
  }
  if (parsed.origin !== "https://edmundeducation.com" || parsed.username || parsed.password || parsed.hash) return null;
  if (!Object.hasOwn(EXPECTED_PARAMETER_BY_PAGE, parsed.pathname)) return null;
  const expectedParameter = EXPECTED_PARAMETER_BY_PAGE[parsed.pathname];
  if (expectedParameter === null) {
    return parsed.search ? null : parsed.pathname.slice(1);
  }
  if (!parsed.search) return null;
  if (!parsed.searchParams.get(expectedParameter) || [...parsed.searchParams.keys()].some((key) => key !== expectedParameter)) return null;
  return `${parsed.pathname.slice(1)}?${parsed.searchParams.toString()}`;
}

function cleanVisibleMessage(value) {
  const resources = [];
  const seen = new Set();
  const text = String(value || "").replace(MARKER_PATTERN, (marker, payload) => {
    try {
      const resource = normalizeHomeworkResource(JSON.parse(decodeBase64Url(payload)));
      if (!resource || seen.has(resource.id)) return marker;
      seen.add(resource.id);
      resources.push(resource);
      return "";
    } catch {
      return marker;
    }
  });
  return {
    text: text.replace(/\n{3,}/g, "\n\n").trim(),
    resources
  };
}

export function parseScheduleMessage(value) {
  return cleanVisibleMessage(value);
}

export function serializeScheduleMessage(text, resources = []) {
  const clean = cleanVisibleMessage(text).text;
  const normalized = [];
  const seen = new Set();
  for (const rawResource of Array.isArray(resources) ? resources : []) {
    const resource = normalizeHomeworkResource(rawResource);
    if (!resource || seen.has(resource.id)) continue;
    seen.add(resource.id);
    normalized.push(resource);
    if (normalized.length >= MAX_HOMEWORK_RESOURCES) break;
  }
  const markers = normalized.map((resource) => `${MARKER_PREFIX}${encodeBase64Url(JSON.stringify(resource))}]]`);
  return [clean, ...markers].filter(Boolean).join("\n\n");
}

function boundaryBefore(value, index) {
  return index === 0 || /[\s,.;:!?，。；：！？()（）\[\]{}]/.test(value[index - 1]);
}

export function homeworkAutocomplete(value, cursor = String(value || "").length) {
  const text = String(value || "");
  const end = Math.max(0, Math.min(text.length, Number(cursor) || 0));
  const before = text.slice(0, end);
  const candidates = [];
  HOMEWORK_RESOURCE_TYPES.forEach((definition, priority) => {
    const trigger = definition.trigger;
    for (let length = trigger.length; length >= 1; length -= 1) {
      const typed = before.slice(-length);
      const start = end - length;
      if (!boundaryBefore(before, start) || typed.toLocaleLowerCase("en") !== trigger.slice(0, length).toLocaleLowerCase("en")) continue;
      candidates.push({ ...definition, typed, remainder: trigger.slice(length), start, end, priority });
      break;
    }
  });
  return candidates.sort((left, right) => right.typed.length - left.typed.length || left.priority - right.priority)[0] || null;
}

export function acceptHomeworkAutocomplete(value, selectionStart, selectionEnd, completion) {
  const text = String(value || "");
  if (!completion || completion.start < 0 || completion.end > text.length) return null;
  const end = Number.isInteger(selectionEnd) ? selectionEnd : Number(selectionStart) || completion.end;
  const next = `${text.slice(0, completion.start)}${completion.trigger}${text.slice(end)}`;
  const cursor = completion.start + completion.trigger.length;
  return { value: next, cursor, start: completion.start, end: cursor, type: completion.type, trigger: completion.trigger };
}

export function insertHomeworkResourceTitle(value, replacement, label) {
  const text = String(value || "");
  const title = String(label || "").replace(/\s+/g, " ").trim();
  if (!title) return { value: text, cursor: text.length, inserted: false };

  const start = Number(replacement?.start);
  const end = Number(replacement?.end);
  const trigger = String(replacement?.trigger || "");
  const validReplacement = Number.isInteger(start)
    && Number.isInteger(end)
    && start >= 0
    && end >= start
    && end <= text.length
    && trigger
    && text.slice(start, end).toLocaleLowerCase("en") === trigger.toLocaleLowerCase("en");
  if (validReplacement) {
    return {
      value: `${text.slice(0, start)}${title}${text.slice(end)}`,
      cursor: start + title.length,
      inserted: true
    };
  }
  if (text.split(/\r?\n/).some((line) => line.trim() === title)) {
    return { value: text, cursor: text.length, inserted: false };
  }
  const separator = !text || /\n$/.test(text) ? "" : "\n";
  return {
    value: `${text}${separator}${title}`,
    cursor: text.length + separator.length + title.length,
    inserted: true
  };
}

export function homeworkResourceDisplayTitle(value) {
  const resource = value && typeof value === "object" ? value : null;
  const definition = TYPE_BY_NAME.get(String(resource?.type || ""));
  const label = String(resource?.label || "").replace(/\s+/g, " ").trim();
  if (!definition || !label) return label;
  const prefix = definition.label;
  const normalizedLabel = label.toLocaleLowerCase("en");
  const normalizedPrefix = prefix.toLocaleLowerCase("en");
  const nextCharacter = label.slice(prefix.length, prefix.length + 1);
  if (
    normalizedLabel.startsWith(normalizedPrefix)
    && (!nextCharacter || /[\s\-–—:：/·]/.test(nextCharacter))
  ) return label;
  return `${prefix} - ${label}`;
}

export function fullHomeworkTriggerAtCursor(value, cursor = String(value || "").length) {
  const completion = homeworkAutocomplete(value, cursor);
  return completion && completion.remainder === "" ? completion : null;
}

function homeworkResourceOrdinal(resource) {
  const raw = resource?.ordinal;
  if (raw === null || raw === undefined || raw === "" || typeof raw === "boolean") return null;
  const ordinal = Number(raw);
  return Number.isSafeInteger(ordinal) && ordinal >= 0 ? ordinal : null;
}

export function filterHomeworkResources(catalog, type, query = "", limit = 60) {
  const normalizedQuery = String(query || "").normalize("NFKC").trim().toLocaleLowerCase("en");
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const matches = (Array.isArray(catalog) ? catalog : []).filter((resource) => {
    if (resource?.type !== type) return false;
    const normalizedOrdinal = homeworkResourceOrdinal(resource);
    const ordinal = normalizedOrdinal === null ? "" : String(normalizedOrdinal);
    const prompt = Array.isArray(resource?.questionPrompt) ? resource.questionPrompt.join(" ") : "";
    const imageAlt = Array.isArray(resource?.questionImages)
      ? resource.questionImages.map((image) => image?.alt || "").join(" ")
      : "";
    const haystack = `${ordinal} ${resource.label || ""} ${resource.detail || ""} ${resource.id || ""} ${prompt} ${imageAlt}`.normalize("NFKC").toLocaleLowerCase("en");
    return tokens.every((token) => haystack.includes(token));
  });
  if (/^\d+$/.test(normalizedQuery)) {
    const collator = new Intl.Collator(["zh-Hant", "en"], { numeric: true, sensitivity: "base" });
    matches.sort((left, right) => {
      const leftOrdinal = homeworkResourceOrdinal(left);
      const rightOrdinal = homeworkResourceOrdinal(right);
      const leftHasOrdinal = leftOrdinal !== null;
      const rightHasOrdinal = rightOrdinal !== null;
      const leftOrdinalText = leftHasOrdinal ? String(leftOrdinal) : "";
      const rightOrdinalText = rightHasOrdinal ? String(rightOrdinal) : "";
      const leftTier = leftOrdinalText === normalizedQuery ? 0 : leftOrdinalText.includes(normalizedQuery) ? 1 : 2;
      const rightTier = rightOrdinalText === normalizedQuery ? 0 : rightOrdinalText.includes(normalizedQuery) ? 1 : 2;
      return leftTier - rightTier
        || (leftHasOrdinal && rightHasOrdinal ? leftOrdinal - rightOrdinal : Number(rightHasOrdinal) - Number(leftHasOrdinal))
        || collator.compare(String(left.label || ""), String(right.label || ""))
        || collator.compare(String(left.detail || ""), String(right.detail || ""))
        || collator.compare(String(left.id || ""), String(right.id || ""));
    });
  }
  return { total: matches.length, items: matches.slice(0, Math.max(1, Number(limit) || 60)) };
}
