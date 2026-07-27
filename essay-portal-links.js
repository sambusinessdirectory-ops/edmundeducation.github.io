(() => {
  "use strict";

  const CATEGORY_DEFINITIONS = Object.freeze({
    "advantage-disadvantage": Object.freeze({
      flashType: "advantage-and-disadvantage",
      flashRef: "EdmundBd9AdDisAd",
      writingSuffix: "advantage-disadvantage",
      label: "Advantage and Disadvantage"
    }),
    opinion: Object.freeze({
      flashType: "opinions",
      flashRef: "EdmundBd9OP",
      writingSuffix: "opinion",
      label: "Opinions"
    }),
    "discuss-both-views": Object.freeze({
      flashType: "discuss-both-views-your-opinion",
      flashRef: "EdmundBd9ExpBth",
      writingSuffix: "discuss-both-views",
      label: "Express Both Views + Your Opinion"
    }),
    "cause-solution": Object.freeze({
      flashType: "problem-and-cause",
      flashRef: "EdmundBd9CnS",
      writingSuffix: "cause-solution",
      label: "Cause and Solution"
    }),
    "direct-question": Object.freeze({
      flashType: "direct-question",
      flashRef: "EdmundBd9Dir",
      writingSuffix: "direct-question",
      label: "Direct Question"
    })
  });

  const FLASH_TYPE_TO_CATEGORY = Object.freeze(Object.fromEntries(
    Object.entries(CATEGORY_DEFINITIONS).map(([category, definition]) => [definition.flashType, category])
  ));

  // These catalogue questions exist, but the published Flash Cards seed currently
  // contains no study cards for them. Keep their download records available without
  // advertising a destination that would open an empty deck.
  const FLASHCARD_UNAVAILABLE = new Set([
    "opinion:55",
    "opinion:76",
    "opinion:102",
    "discuss-both-views:38",
    "cause-solution:2",
    "direct-question:26"
  ]);

  function normalizeNumber(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 && number <= 999 ? number : 0;
  }

  function key(category, number) {
    const normalizedCategory = String(category || "").trim().toLowerCase();
    const normalizedNumber = normalizeNumber(number);
    return CATEGORY_DEFINITIONS[normalizedCategory] && normalizedNumber
      ? `${normalizedCategory}:${normalizedNumber}`
      : "";
  }

  function fromWritingExerciseId(value) {
    const match = /^model-essay-(\d+)-ielts-(advantage-disadvantage|opinion|discuss-both-views|cause-solution|direct-question)$/i.exec(String(value || "").trim());
    if (!match) return "";
    const category = Object.entries(CATEGORY_DEFINITIONS)
      .find(([, definition]) => definition.writingSuffix === match[2].toLowerCase())?.[0] || "";
    return key(category, match[1]);
  }

  function fromFlashDeckId(value) {
    const match = /^ielts\/writing\/task-2\/([^/]+)\/[^/]+-Q(\d+)$/i.exec(String(value || "").trim());
    return match ? key(FLASH_TYPE_TO_CATEGORY[match[1].toLowerCase()], match[2]) : "";
  }

  function parse(value) {
    const raw = String(value || "").trim();
    const direct = /^([a-z-]+):(\d+)$/i.exec(raw);
    if (direct) return key(direct[1], direct[2]);
    return fromWritingExerciseId(raw) || fromFlashDeckId(raw);
  }

  function parts(value) {
    const normalized = parse(value);
    if (!normalized) return null;
    const separator = normalized.lastIndexOf(":");
    const category = normalized.slice(0, separator);
    const number = Number(normalized.slice(separator + 1));
    return Object.freeze({ key: normalized, category, number, definition: CATEGORY_DEFINITIONS[category] });
  }

  function flashDeckId(value) {
    const target = parts(value);
    if (!target) return "";
    return `ielts/writing/task-2/${target.definition.flashType}/${target.definition.flashRef}-Q${target.number}`;
  }

  function writingExerciseId(value) {
    const target = parts(value);
    return target
      ? `model-essay-${target.number}-ielts-${target.definition.writingSuffix}`
      : "";
  }

  function hasWritingPractice(value) {
    const target = parts(value);
    if (!target) return false;
    const number = target.number;
    if (target.category === "advantage-disadvantage") return number >= 2 && number <= 30 && number !== 13;
    if (target.category === "opinion") return number >= 3 && number <= 106 && number !== 102;
    if (target.category === "discuss-both-views") return number >= 4 && number <= 43 && number !== 38;
    if (target.category === "cause-solution") return number >= 2 && number <= 20 && ![5, 8].includes(number);
    if (target.category === "direct-question") return number >= 2 && number <= 48 && ![19, 20, 21, 22, 23, 24].includes(number);
    return false;
  }

  function hasFlashcards(value) {
    const normalized = parse(value);
    return Boolean(normalized && !FLASHCARD_UNAVAILABLE.has(normalized));
  }

  function href(portal, value) {
    const target = parts(value);
    if (!target) return "";
    const page = {
      flashcards: "flashcards.html",
      writing: "writing-practice.html",
      downloads: "model-essay-downloads.html"
    }[portal];
    return page ? `${page}?essay=${encodeURIComponent(target.key)}` : "";
  }

  function fromDownloadItem(item) {
    return key(item?.category, item?.number);
  }

  function requestedKey(search = window.location.search) {
    try {
      return parse(new URLSearchParams(search).get("essay"));
    } catch (error) {
      return "";
    }
  }

  window.EDMUND_ESSAY_PORTALS = Object.freeze({
    categories: CATEGORY_DEFINITIONS,
    key,
    parse,
    parts,
    fromDownloadItem,
    fromFlashDeckId,
    fromWritingExerciseId,
    flashDeckId,
    writingExerciseId,
    hasFlashcards,
    hasWritingPractice,
    href,
    requestedKey
  });
})();
