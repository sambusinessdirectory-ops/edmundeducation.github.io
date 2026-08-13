const MARKER_PREFIX = "[[@edmund-homework:v1:";
const MARKER_PATTERN = /^\[\[@edmund-homework:v1:([A-Za-z0-9_-]+)\]\]$/gm;
const TAG_MARKER_PREFIX = "[[@edmund-homework-tag:v1:";
const TAG_MARKER_PATTERN = /^\[\[@edmund-homework-tag:v1:([a-z0-9-]+)\]\]$/gm;
export const MAX_HOMEWORK_RESOURCES = 12;
export const SCHEDULE_MESSAGE_MAX_LENGTH = 2000;

export const HOMEWORK_ENTRY_TAGS = Object.freeze([
  Object.freeze({ key: "reluctant", label: "唔想做...", color: "#ab12e6", textColor: "#ffffff" }),
  Object.freeze({ key: "favourite", label: "我最喜愛功課", color: "#ff3473", textColor: "#25182b" }),
  Object.freeze({ key: "teacher-added", label: "老師新加", color: "#920909", textColor: "#ffffff" }),
  Object.freeze({ key: "well-done", label: "Well done!", color: "#ffd591", textColor: "#25182b" }),
  Object.freeze({ key: "break-15", label: "每15分鐘休息一次", color: "#a1ff80", textColor: "#25182b" })
]);

const HOMEWORK_ENTRY_TAG_BY_KEY = new Map(HOMEWORK_ENTRY_TAGS.map((tag) => [tag.key, tag]));

export const HOMEWORK_RESOURCE_TYPES = Object.freeze([
  Object.freeze({ type: "flashcards", trigger: "Flash Cards", label: "Flash Cards", color: "#3f73d8" }),
  Object.freeze({ type: "fill-blanks", trigger: "Fill in the blanks", label: "Fill in the blanks", color: "#e49a31" }),
  Object.freeze({
    type: "writing-submission",
    trigger: "Submission Writing",
    aliases: Object.freeze(["Writing Submission"]),
    label: "Writing Submission",
    color: "#b75ac7"
  }),
  Object.freeze({ type: "idiom", trigger: "Idiom", label: "Idiom", color: "#e65b3d" }),
  Object.freeze({ type: "proverb", trigger: "Proverb", label: "Proverb", color: "#94613c" }),
  Object.freeze({ type: "phrasal-verb", trigger: "Phrasal Verbs", label: "Phrasal Verbs", color: "#31966a" }),
  Object.freeze({ type: "speaking", trigger: "Speaking", label: "Speaking", color: "#2b9caf" }),
  Object.freeze({ type: "sentence-structure", trigger: "Sentence Structure", label: "Sentence Structure", color: "#6e62c9" }),
  Object.freeze({ type: "reading-analysis", trigger: "Answer Analysis - IELTS Reading", label: "Answer Analysis - IELTS Reading", color: "#8b5fbf" }),
  Object.freeze({ type: "model-essay-download", trigger: "DSE Writing Part A Download", label: "DSE Writing Part A Download", color: "#d08b3e" }),
  Object.freeze({ type: "common-expression", trigger: "Common Expression", label: "Common Expression", color: "#7b65c8" }),
  Object.freeze({ type: "listening", trigger: "IELTS Listening", label: "IELTS Listening", color: "#218e9b" }),
  Object.freeze({ type: "learning-portal", trigger: "Learning Portal", label: "Learning Portal", color: "#356f9f" })
]);

const TYPE_BY_NAME = new Map(HOMEWORK_RESOURCE_TYPES.map((item) => [item.type, item]));
const ALLOWED_PAGES_BY_TYPE = Object.freeze({
  flashcards: Object.freeze(["/flashcards.html"]),
  "fill-blanks": Object.freeze(["/writing-practice.html"]),
  "writing-submission": Object.freeze(["/writing-submission.html"]),
  idiom: Object.freeze(["/idiom-system.html"]),
  proverb: Object.freeze(["/proverb-system.html"]),
  "phrasal-verb": Object.freeze(["/phrasal-verb-system.html"]),
  speaking: Object.freeze(["/speaking-system.html"]),
  "sentence-structure": Object.freeze(["/sentence-structure.html"]),
  "reading-analysis": Object.freeze(["/ielts-reading-analysis.html"]),
  "model-essay-download": Object.freeze(["/model-essay-downloads.html"]),
  "common-expression": Object.freeze([
    "/common-expression-speaking.html",
    "/common-expression-written.html",
    "/common-expression-rhetorical-speaking.html",
    "/common-expression-rhetorical-writing.html",
    "/common-expression-professional-message.html",
    "/common-expression-business-speaking.html"
  ]),
  listening: Object.freeze(["/listening-system.html"]),
  "learning-portal": Object.freeze([
    "/quotes-system.html",
    "/grammar-system.html",
    "/collocation-system.html",
    "/irregular-verb-system.html",
    "/thematic-vocabulary-system.html",
    "/part-of-speech-system.html",
    "/synonyms-system.html",
    "/error-identifier-system.html",
    "/learning-roadmap.html",
    "/spelling-system.html",
    "/reading-logic-system.html",
    "/translation-skills-system.html",
    "/business-school-system.html",
    "/complex-questions-system.html",
    "/leisurely-reading.html",
    "/english-humour-speaking.html",
    "/english-humour-writing.html",
    "/english-joke-collection.html"
  ])
});
const EXPECTED_PARAMETERS_BY_PAGE = Object.freeze({
  "/flashcards.html": Object.freeze(["deck"]),
  "/writing-practice.html": Object.freeze(["exercise"]),
  "/writing-submission.html": Object.freeze(["exercise"]),
  "/idiom-system.html": Object.freeze(["lesson"]),
  "/proverb-system.html": Object.freeze(["lesson"]),
  "/phrasal-verb-system.html": Object.freeze(["lesson"]),
  "/speaking-system.html": Object.freeze(["exercise"]),
  "/sentence-structure.html": Object.freeze(["lesson"]),
  "/ielts-reading-analysis.html": Object.freeze(["article"]),
  "/model-essay-downloads.html": Object.freeze(["catalog", "item"]),
  "/common-expression-speaking.html": Object.freeze(["lesson"]),
  "/common-expression-written.html": Object.freeze(["lesson"]),
  "/common-expression-rhetorical-speaking.html": Object.freeze(["lesson"]),
  "/common-expression-rhetorical-writing.html": Object.freeze(["lesson"]),
  "/common-expression-professional-message.html": Object.freeze(["lesson"]),
  "/common-expression-business-speaking.html": Object.freeze(["lesson"]),
  "/listening-system.html": Object.freeze(["section", "practice", "part"]),
  "/quotes-system.html": Object.freeze([]),
  "/grammar-system.html": Object.freeze([]),
  "/collocation-system.html": Object.freeze([]),
  "/irregular-verb-system.html": Object.freeze([]),
  "/thematic-vocabulary-system.html": Object.freeze([]),
  "/part-of-speech-system.html": Object.freeze([]),
  "/synonyms-system.html": Object.freeze([]),
  "/error-identifier-system.html": Object.freeze([]),
  "/learning-roadmap.html": Object.freeze([]),
  "/spelling-system.html": Object.freeze([]),
  "/reading-logic-system.html": Object.freeze([]),
  "/translation-skills-system.html": Object.freeze([]),
  "/business-school-system.html": Object.freeze([]),
  "/complex-questions-system.html": Object.freeze([]),
  "/leisurely-reading.html": Object.freeze([]),
  "/english-humour-speaking.html": Object.freeze([]),
  "/english-humour-writing.html": Object.freeze([]),
  "/english-joke-collection.html": Object.freeze([])
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
        : type === "model-essay-download"
          ? "download"
        : type;
  if (!id || !label || !id.startsWith(`${idPrefix}:`)) return null;

  const url = normalizeHomeworkHref(value.url);
  if (!url) return null;
  const parsed = new URL(url, "https://edmundeducation.com/");
  if (!ALLOWED_PAGES_BY_TYPE[type]?.includes(parsed.pathname)) return null;
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
  if (!Object.hasOwn(EXPECTED_PARAMETERS_BY_PAGE, parsed.pathname)) return null;
  const expectedParameters = EXPECTED_PARAMETERS_BY_PAGE[parsed.pathname];
  const actualParameters = [...parsed.searchParams.keys()];
  // Older Schedule entries linked to the Writing Submission landing page
  // before exercise-specific assignments existed. Keep that exact, queryless
  // route valid so stored markers continue to render, while all new deep links
  // below remain restricted to one allow-listed `exercise` parameter.
  if (parsed.pathname === "/writing-submission.html" && actualParameters.length === 0) {
    return "writing-submission.html";
  }
  if (actualParameters.length !== expectedParameters.length) return null;
  if (expectedParameters.some((key) => !parsed.searchParams.get(key))) return null;
  if (actualParameters.some((key) => !expectedParameters.includes(key))) return null;
  if (parsed.pathname === "/model-essay-downloads.html") {
    if (parsed.searchParams.get("catalog") !== "dse-writing-part-a") return null;
  }
  if (parsed.pathname === "/writing-submission.html") {
    if (!/^[a-z0-9][a-z0-9._~-]{0,239}$/i.test(parsed.searchParams.get("exercise") || "")) return null;
  }
  if (parsed.pathname.startsWith("/common-expression-")) {
    if (!/^common-expression-\d+$/i.test(parsed.searchParams.get("lesson") || "")) return null;
  }
  if (parsed.pathname === "/listening-system.html") {
    const practice = Number(parsed.searchParams.get("practice"));
    const part = Number(parsed.searchParams.get("part"));
    if (parsed.searchParams.get("section") !== "ielts") return null;
    if (!Number.isSafeInteger(practice) || practice < 1 || practice > 20) return null;
    if (!Number.isSafeInteger(part) || part < 1 || part > 4) return null;
  }
  const query = parsed.searchParams.toString();
  return `${parsed.pathname.slice(1)}${query ? `?${query}` : ""}`;
}

function cleanVisibleMessage(value) {
  const resources = [];
  const seen = new Set();
  const tags = [];
  const seenTags = new Set();
  const withoutResources = String(value || "").replace(MARKER_PATTERN, (marker, payload) => {
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
  const text = withoutResources.replace(TAG_MARKER_PATTERN, (marker, key) => {
    const tag = HOMEWORK_ENTRY_TAG_BY_KEY.get(String(key || ""));
    if (!tag || seenTags.has(tag.key)) return marker;
    seenTags.add(tag.key);
    tags.push(tag);
    return "";
  });
  return {
    text: text.replace(/\n{3,}/g, "\n\n").trim(),
    resources,
    tags
  };
}

export function parseScheduleMessage(value) {
  return cleanVisibleMessage(value);
}

export function serializeScheduleMessage(text, resources = [], tags = []) {
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
  const normalizedTags = [];
  const seenTags = new Set();
  for (const rawTag of Array.isArray(tags) ? tags : []) {
    const key = typeof rawTag === "string" ? rawTag : String(rawTag?.key || "");
    const tag = HOMEWORK_ENTRY_TAG_BY_KEY.get(key)
      || HOMEWORK_ENTRY_TAGS.find((candidate) => candidate.label === key);
    if (!tag || seenTags.has(tag.key)) continue;
    seenTags.add(tag.key);
    normalizedTags.push(tag);
  }
  const tagMarkers = normalizedTags.map((tag) => `${TAG_MARKER_PREFIX}${tag.key}]]`);
  return [clean, ...markers, ...tagMarkers].filter(Boolean).join("\n\n");
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
    const triggers = [definition.trigger, ...(Array.isArray(definition.aliases) ? definition.aliases : [])];
    triggers.forEach((trigger, aliasPriority) => {
      for (let length = trigger.length; length >= 1; length -= 1) {
        const typed = before.slice(-length);
        const start = end - length;
        if (!boundaryBefore(before, start) || typed.toLocaleLowerCase("en") !== trigger.slice(0, length).toLocaleLowerCase("en")) continue;
        candidates.push({ ...definition, trigger, typed, remainder: trigger.slice(length), start, end, priority, aliasPriority });
        break;
      }
    });
  });
  return candidates.sort((left, right) => (
    right.typed.length - left.typed.length
    || left.priority - right.priority
    || left.aliasPriority - right.aliasPriority
  ))[0] || null;
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
