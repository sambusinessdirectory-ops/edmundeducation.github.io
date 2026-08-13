export const WRITING_RANDOM_TOPIC_CATEGORIES = Object.freeze([
  Object.freeze({ id: "dse-part-a", label: "DSE Part A" }),
  Object.freeze({ id: "dse-part-b", label: "DSE Part B" }),
  Object.freeze({ id: "ielts-task-1", label: "IELTS Task 1" }),
  Object.freeze({ id: "ielts-task-2", label: "IELTS Task 2" })
]);

const CATEGORY_IDS = new Set(WRITING_RANDOM_TOPIC_CATEGORIES.map((category) => category.id));
const UINT32_RANGE = 0x100000000;
const SAFE_INTEGER_RANGE = 0x20000000000000;
const MAX_RANDOM_ATTEMPTS = 128;

export function writingRandomTopicCategory(resource) {
  const id = String(resource?.id || "");
  const detail = String(resource?.detail || "");
  const sectionKey = String(resource?.sectionKey || "");

  if (sectionKey === "dse-writing") {
    if (/^fill:dse-writing-.+-part-a(?:-|$)/i.test(id)) return "dse-part-a";
    if (/^fill:dse-writing-.+-part-b(?:-|$)/i.test(id)) return "dse-part-b";
  }
  if (sectionKey === "ielts-writing") {
    if (/\bIELTS Writing Task 1\b/i.test(detail)) return "ielts-task-1";
    if (/\bIELTS Writing Task 2\b/i.test(detail)) return "ielts-task-2";
  }
  return "";
}

export function writingRandomTopicCandidates(catalog, categoryId, canAccess) {
  if (!CATEGORY_IDS.has(String(categoryId || "")) || !Array.isArray(catalog) || typeof canAccess !== "function") {
    return [];
  }
  return catalog.filter((resource) => (
    writingRandomTopicCategory(resource) === categoryId
    && canAccess(resource) === true
  ));
}

function randomUint32(cryptoSource) {
  if (!cryptoSource || typeof cryptoSource.getRandomValues !== "function") return null;
  const value = new Uint32Array(1);
  cryptoSource.getRandomValues(value);
  return value[0];
}

function fallbackRandomInteger(randomSource) {
  if (typeof randomSource !== "function") return null;
  const value = Number(randomSource());
  if (!Number.isFinite(value) || value < 0 || value >= 1) return null;
  return Math.floor(value * SAFE_INTEGER_RANGE);
}

export function unbiasedRandomIndex(length, options = {}) {
  const size = Number(length);
  if (!Number.isSafeInteger(size) || size < 1 || size > UINT32_RANGE) {
    throw new RangeError("Random selection length must be between 1 and 2^32");
  }

  const cryptoSource = Object.prototype.hasOwnProperty.call(options, "cryptoSource")
    ? options.cryptoSource
    : globalThis.crypto;
  const randomSource = Object.prototype.hasOwnProperty.call(options, "randomSource")
    ? options.randomSource
    : Math.random;
  const cryptoLimit = Math.floor(UINT32_RANGE / size) * size;

  for (let attempt = 0; attempt < MAX_RANDOM_ATTEMPTS; attempt += 1) {
    let value;
    try { value = randomUint32(cryptoSource); } catch { value = null; }
    if (value === null) break;
    if (value < cryptoLimit) return value % size;
  }

  // Math.random is not cryptographically secure, but rejection sampling over
  // its 53-bit integer range avoids modulo bias when Web Crypto is unavailable.
  const fallbackLimit = Math.floor(SAFE_INTEGER_RANGE / size) * size;
  for (let attempt = 0; attempt < MAX_RANDOM_ATTEMPTS; attempt += 1) {
    const value = fallbackRandomInteger(randomSource);
    if (value === null) continue;
    if (value < fallbackLimit) return value % size;
  }
  throw new Error("A usable random number source is unavailable");
}
