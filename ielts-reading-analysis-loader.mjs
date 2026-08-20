const DEFAULT_DATA_DIRECTORY = "/ielts-reading-analysis-data/";
const SAFE_ARTICLE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_JSON_FILE = /^[a-z0-9][a-z0-9._-]*\.json$/i;
const SUPPORTED_BLOCK_KINDS = new Set(["paragraph", "label", "quote", "comparison", "bullet"]);

export class ArticleLoadError extends Error {
  constructor(code, message, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = "ArticleLoadError";
    this.code = code;
  }
}

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function validPassage(value) {
  return Number.isInteger(value) && value >= 1 && value <= 3;
}

function normalizeDirectory(value) {
  const directory = typeof value === "string" && value.endsWith("/")
    ? value
    : `${value || ""}/`;
  return directory === DEFAULT_DATA_DIRECTORY ? directory : DEFAULT_DATA_DIRECTORY;
}

function normalizeAvailabilityEntry(id, rawEntry) {
  const entry = asObject(rawEntry);
  if (!SAFE_ARTICLE_ID.test(id) || !entry) return null;
  if (entry.id && entry.id !== id) return null;
  const catalogueIds = Array.isArray(entry.catalogueIds)
    ? entry.catalogueIds.filter((value) => typeof value === "string" && value.trim())
    : typeof entry.catalogueId === "string" && entry.catalogueId.trim()
      ? [entry.catalogueId]
      : [];
  if (!catalogueIds.length || new Set(catalogueIds).size !== catalogueIds.length) return null;
  if (!validPassage(entry.passage)) return null;
  if (entry.source !== "bundled" && entry.source !== "json") return null;

  const normalized = {
    id,
    catalogueId: catalogueIds[0],
    catalogueIds: Object.freeze([...catalogueIds]),
    passage: entry.passage,
    source: entry.source,
  };
  if (entry.source === "json") {
    const file = entry.file || `${id}.json`;
    if (!SAFE_JSON_FILE.test(file) || file.includes("..")) return null;
    normalized.file = file;
    if (typeof entry.version === "string" && entry.version.trim()) {
      normalized.version = entry.version.trim();
    }
  }
  return Object.freeze(normalized);
}

export function articleDataUrl(entry, dataDirectory = DEFAULT_DATA_DIRECTORY) {
  if (!entry || entry.source !== "json") return null;
  const file = entry.file || `${entry.id}.json`;
  if (!SAFE_JSON_FILE.test(file) || file.includes("..")) {
    throw new ArticleLoadError("invalid-file", `Invalid article data filename for ${entry.id}.`);
  }
  const url = `${normalizeDirectory(dataDirectory)}${file}`;
  return entry.version ? `${url}?v=${encodeURIComponent(entry.version)}` : url;
}

export function questionNumbers(question) {
  const numbers = Array.isArray(question?.numbers) && question.numbers.length
    ? question.numbers
    : [question?.number];
  return numbers.filter(Number.isInteger);
}

export function questionNumberLabel(question) {
  const numbers = questionNumbers(question);
  if (!numbers.length) return "";
  const consecutive = numbers.every((number, index) => index === 0 || number === numbers[index - 1] + 1);
  return consecutive && numbers.length > 1
    ? `${numbers[0]}–${numbers[numbers.length - 1]}`
    : numbers.join("、");
}

function articleFromPayload(payload, id) {
  const object = asObject(payload);
  if (!object) return null;
  if (asObject(object.article)) return object.article;
  if (asObject(object.articles)?.[id]) return object.articles[id];
  return object;
}

export function validateArticlePayload(payload, availability) {
  const article = articleFromPayload(payload, availability.id);
  const fail = (detail) => {
    throw new ArticleLoadError(
      "invalid-payload",
      `${availability.id} article data is invalid: ${detail}`,
    );
  };

  if (!article) fail("missing article object");
  if (article.id !== availability.id) fail("article ID does not match the manifest");
  const acceptedCatalogueIds = availability.catalogueIds || [availability.catalogueId];
  if (!acceptedCatalogueIds.includes(article.catalogueId)) {
    fail("catalogue ID does not match the manifest");
  }
  if (article.passage !== availability.passage) fail("passage does not match the manifest");
  if (typeof article.title !== "string" || !article.title.trim()) fail("title is missing");
  if (typeof article.eyebrow !== "string" || typeof article.description !== "string") {
    fail("article heading copy is missing");
  }
  if (
    article.sourceNotes !== undefined
    && (
      !Array.isArray(article.sourceNotes)
      || article.sourceNotes.some((note) => typeof note !== "string" || !note.trim())
    )
  ) {
    fail("sourceNotes must contain non-empty text notes");
  }
  if (article.paragraphOverview !== undefined) {
    const overview = asObject(article.paragraphOverview);
    if (
      !overview
      || typeof overview.title !== "string"
      || typeof overview.intro !== "string"
      || !Array.isArray(overview.paragraphs)
      || !overview.paragraphs.length
    ) {
      fail("paragraphOverview is invalid");
    }
    overview.paragraphs.forEach((paragraph, paragraphIndex) => {
      const number = paragraph?.number;
      if (
        !asObject(paragraph)
        || (typeof number !== "string" && !Number.isInteger(number))
        || !String(number).trim()
        || typeof paragraph.summary !== "string"
        || !paragraph.summary.trim()
        || (paragraph.label !== undefined && typeof paragraph.label !== "string")
        || (paragraph.badge !== undefined && typeof paragraph.badge !== "string")
      ) {
        fail(`paragraphOverview entry ${paragraphIndex + 1} is invalid`);
      }
    });
  }
  if (!Number.isInteger(article.questionCount) || article.questionCount < 1) {
    fail("questionCount must be a positive integer");
  }
  const questionNumberStart = article.questionNumberStart === undefined
    ? 1
    : article.questionNumberStart;
  if (!Number.isInteger(questionNumberStart) || questionNumberStart < 1) {
    fail("questionNumberStart must be a positive integer");
  }
  if (!Array.isArray(article.answerKey) || article.answerKey.length !== article.questionCount) {
    fail("answerKey length does not match questionCount");
  }
  if (!Array.isArray(article.questions) || !article.questions.length) {
    fail("questions must contain at least one analysis unit");
  }
  const coveredQuestionNumbers = [];
  article.questions.forEach((question, questionIndex) => {
    const rawNumbers = Array.isArray(question?.numbers) && question.numbers.length
      ? question.numbers
      : [question?.number];
    const numbers = questionNumbers(question);
    if (
      !asObject(question)
      || !numbers.length
      || numbers.length !== rawNumbers.length
      || numbers.some(
        (number) => number < questionNumberStart
          || number >= questionNumberStart + article.questionCount,
      )
      || new Set(numbers).size !== numbers.length
      || numbers.some((number, index) => index > 0 && number <= numbers[index - 1])
    ) {
      fail(`analysis unit ${questionIndex + 1} has invalid question numbers`);
    }
    if (Number.isInteger(question.number) && question.number !== numbers[0]) {
      fail(`analysis unit ${questionIndex + 1} number must match its first covered question`);
    }
    coveredQuestionNumbers.push(...numbers);
    for (const field of ["answer", "type", "prompt", "translation"]) {
      if (typeof question[field] !== "string") fail(`question ${numbers[0]} is missing ${field}`);
    }
    if (
      typeof question.answerKey !== "string"
      && !(
        Array.isArray(question.answerKeys)
        && question.answerKeys.length === numbers.length
        && question.answerKeys.every((answer) => typeof answer === "string")
      )
    ) {
      fail(`question ${numbers[0]} is missing answerKey or answerKeys`);
    }
    if (!Array.isArray(question.sections)) fail(`question ${numbers[0]} has no sections`);
    question.sections.forEach((section) => {
      if (
        !asObject(section)
        || typeof section.id !== "string"
        || typeof section.title !== "string"
        || !Array.isArray(section.blocks)
        || !section.blocks.length
      ) {
        fail(`question ${numbers[0]} has an invalid section`);
      }
      section.blocks.forEach((block) => {
        if (!asObject(block) || !SUPPORTED_BLOCK_KINDS.has(block.kind)) {
          fail(`question ${numbers[0]} has an unsupported content block`);
        }
        if (block.kind === "comparison") {
          if (typeof block.from !== "string" || typeof block.to !== "string") {
            fail(`question ${numbers[0]} has an invalid comparison block`);
          }
        } else if (typeof block.text !== "string") {
          fail(`question ${numbers[0]} has a content block without text`);
        }
      });
    });
  });
  const expectedQuestionNumbers = Array.from(
    { length: article.questionCount },
    (_, questionIndex) => questionNumberStart + questionIndex,
  );
  const sortedCoveredNumbers = [...coveredQuestionNumbers].sort((left, right) => left - right);
  if (
    sortedCoveredNumbers.length !== expectedQuestionNumbers.length
    || sortedCoveredNumbers.some((number, index) => number !== expectedQuestionNumbers[index])
  ) {
    fail("analysis units must cover every answer-key question exactly once");
  }
  return article;
}

export function createArticleRepository({
  availabilityManifest,
  bundledArticles,
  fetchImpl = globalThis.fetch,
} = {}) {
  const manifest = asObject(availabilityManifest) || {};
  const availableEntries = asObject(manifest.articles) || {};
  const loadedArticles = new Map(Object.entries(asObject(bundledArticles) || {}));
  const availabilityById = new Map();
  const availabilityByCatalogueId = new Map();
  const inFlightLoads = new Map();

  for (const [id, rawEntry] of Object.entries(availableEntries)) {
    const entry = normalizeAvailabilityEntry(id, rawEntry);
    if (!entry) continue;
    availabilityById.set(id, entry);
    entry.catalogueIds.forEach((catalogueId) => {
      if (!availabilityByCatalogueId.has(catalogueId)) {
        availabilityByCatalogueId.set(catalogueId, entry);
      }
    });
    if (entry.source === "json") loadedArticles.delete(id);
  }

  // Keep legacy bundled content usable even if an older page omits the new
  // manifest. This also makes the migration additive rather than destructive.
  for (const [id, article] of loadedArticles) {
    if (availabilityById.has(id)) continue;
    const entry = normalizeAvailabilityEntry(id, {
      id,
      catalogueId: article?.catalogueId,
      passage: article?.passage,
      source: "bundled",
    });
    if (!entry) continue;
    availabilityById.set(id, entry);
    entry.catalogueIds.forEach((catalogueId) => {
      if (!availabilityByCatalogueId.has(catalogueId)) {
        availabilityByCatalogueId.set(catalogueId, entry);
      }
    });
  }

  const load = (id) => {
    if (loadedArticles.has(id)) return Promise.resolve(loadedArticles.get(id));
    if (inFlightLoads.has(id)) return inFlightLoads.get(id);

    const entry = availabilityById.get(id);
    if (!entry) {
      return Promise.reject(new ArticleLoadError("not-found", `Unknown IELTS Reading article: ${id}`));
    }
    if (entry.source !== "json") {
      return Promise.reject(new ArticleLoadError("missing-bundle", `Bundled article data is missing: ${id}`));
    }
    if (typeof fetchImpl !== "function") {
      return Promise.reject(new ArticleLoadError("fetch-unavailable", "Article loading is unavailable."));
    }

    const url = articleDataUrl(entry, manifest.dataDirectory);
    const request = Promise.resolve()
      .then(() => fetchImpl(url, {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
      }))
      .then((response) => {
        if (!response?.ok) {
          throw new ArticleLoadError(
            "http-error",
            `Article request failed (${response?.status || "network error"}).`,
          );
        }
        return response.json();
      })
      .then((payload) => validateArticlePayload(payload, entry))
      .then((article) => {
        loadedArticles.set(id, article);
        return article;
      })
      .catch((error) => {
        if (error instanceof ArticleLoadError) throw error;
        throw new ArticleLoadError("network-error", `Could not load article ${id}.`, error);
      })
      .finally(() => inFlightLoads.delete(id));

    inFlightLoads.set(id, request);
    return request;
  };

  return Object.freeze({
    availabilityForCatalogueId: (catalogueId) => availabilityByCatalogueId.get(catalogueId) || null,
    availabilityForId: (id) => availabilityById.get(id) || null,
    getLoaded: (id) => loadedArticles.get(id) || null,
    load,
  });
}
