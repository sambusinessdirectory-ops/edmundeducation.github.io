(() => {
  "use strict";

  const CATEGORY_DEFINITIONS = Object.freeze({
    "advantage-disadvantage": Object.freeze({
      task: 2,
      flashType: "advantage-and-disadvantage",
      flashRef: "EdmundBd9AdDisAd",
      writingSuffix: "advantage-disadvantage",
      label: "Advantage and Disadvantage"
    }),
    opinion: Object.freeze({
      task: 2,
      flashType: "opinions",
      flashRef: "EdmundBd9OP",
      writingSuffix: "opinion",
      label: "Opinions"
    }),
    "discuss-both-views": Object.freeze({
      task: 2,
      flashType: "discuss-both-views-your-opinion",
      flashRef: "EdmundBd9ExpBth",
      writingSuffix: "discuss-both-views",
      label: "Express Both Views + Your Opinion"
    }),
    "cause-solution": Object.freeze({
      task: 2,
      flashType: "problem-and-cause",
      flashRef: "EdmundBd9CnS",
      writingSuffix: "cause-solution",
      label: "Cause and Solution"
    }),
    "direct-question": Object.freeze({
      task: 2,
      flashType: "direct-question",
      flashRef: "EdmundBd9Dir",
      writingSuffix: "direct-question",
      label: "Direct Question"
    }),
    "bar-charts": Object.freeze({
      task: 1,
      flashType: "bar-charts",
      flashItemPrefix: "bar-chart",
      writingSuffix: "bar-charts",
      label: "Bar Charts",
      count: 8
    }),
    "line-graph": Object.freeze({
      task: 1,
      flashType: "line-graphs",
      flashItemPrefix: "line-graph",
      writingSuffix: "line-graph",
      label: "Line Graph",
      count: 9
    }),
    "pie-charts": Object.freeze({
      task: 1,
      flashType: "pie-charts",
      flashItemPrefix: "pie-chart",
      writingSuffix: "pie-charts",
      label: "Pie Charts",
      count: 6
    }),
    "process-diagram": Object.freeze({
      task: 1,
      flashType: "process-diagrams",
      flashItemPrefix: "process-diagram",
      writingSuffix: "process-diagram",
      label: "Process Diagram",
      count: 9
    }),
    maps: Object.freeze({
      task: 1,
      flashType: "maps",
      flashItemPrefix: "maps",
      writingSuffix: "maps",
      label: "Maps",
      count: 10
    }),
    tables: Object.freeze({
      task: 1,
      flashType: "tables",
      flashItemPrefix: "table",
      writingSuffix: "tables",
      label: "Tables",
      count: 11
    }),
    "mixed-charts": Object.freeze({
      task: 1,
      flashType: "mixed-charts",
      flashItemPrefix: "mixed-charts",
      writingSuffix: "mixed-charts",
      label: "Mixed Charts",
      count: 7
    })
  });

  const FLASH_TYPE_TO_CATEGORY = Object.freeze(Object.fromEntries(
    Object.entries(CATEGORY_DEFINITIONS)
      .filter(([, definition]) => definition.task === 2)
      .map(([category, definition]) => [definition.flashType, category])
  ));

  const TASK1_FLASH_TYPE_TO_CATEGORY = Object.freeze(Object.fromEntries(
    Object.entries(CATEGORY_DEFINITIONS)
      .filter(([, definition]) => definition.task === 1)
      .map(([category, definition]) => [definition.flashType, category])
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
    const raw = String(value || "").trim();
    const taskOneMatch = /^model-essay-(\d+)-ielts-task1-(bar-charts|line-graph|pie-charts|process-diagram|maps|tables|mixed-charts)$/i.exec(raw);
    if (taskOneMatch) return key(taskOneMatch[2], taskOneMatch[1]);
    const match = /^model-essay-(\d+)-ielts-(advantage-disadvantage|opinion|discuss-both-views|cause-solution|direct-question)$/i.exec(raw);
    if (!match) return "";
    const category = Object.entries(CATEGORY_DEFINITIONS)
      .find(([, definition]) => definition.writingSuffix === match[2].toLowerCase())?.[0] || "";
    return key(category, match[1]);
  }

  function fromFlashDeckId(value) {
    const raw = String(value || "").trim();
    const taskOneMatch = /^ielts\/writing\/task-1\/([^/]+)\/([^/]+)-(\d+)$/i.exec(raw);
    if (taskOneMatch) {
      const category = TASK1_FLASH_TYPE_TO_CATEGORY[taskOneMatch[1].toLowerCase()] || "";
      const definition = CATEGORY_DEFINITIONS[category];
      return definition && taskOneMatch[2].toLowerCase() === definition.flashItemPrefix
        ? key(category, taskOneMatch[3])
        : "";
    }
    const match = /^ielts\/writing\/task-2\/([^/]+)\/[^/]+-Q(\d+)$/i.exec(raw);
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
    if (target.definition.task === 1) {
      return `ielts/writing/task-1/${target.definition.flashType}/${target.definition.flashItemPrefix}-${target.number}`;
    }
    return `ielts/writing/task-2/${target.definition.flashType}/${target.definition.flashRef}-Q${target.number}`;
  }

  function writingExerciseId(value) {
    const target = parts(value);
    return target
      ? target.definition.task === 1
        ? `model-essay-${target.number}-ielts-task1-${target.definition.writingSuffix}`
        : `model-essay-${target.number}-ielts-${target.definition.writingSuffix}`
      : "";
  }

  function hasWritingPractice(value) {
    const target = parts(value);
    if (!target) return false;
    const number = target.number;
    if (target.definition.task === 1) return number <= Number(target.definition.count || 0);
    if (target.category === "advantage-disadvantage") return number >= 2 && number <= 30 && number !== 13;
    if (target.category === "opinion") return number >= 3 && number <= 106 && number !== 102;
    if (target.category === "discuss-both-views") return number >= 4 && number <= 43 && number !== 38;
    if (target.category === "cause-solution") return number >= 2 && number <= 20 && ![5, 8].includes(number);
    if (target.category === "direct-question") return number >= 2 && number <= 48 && ![19, 20, 21, 22, 23, 24].includes(number);
    return false;
  }

  function hasFlashcards(value) {
    const normalized = parse(value);
    const target = parts(normalized);
    if (!target || FLASHCARD_UNAVAILABLE.has(normalized)) return false;
    if (target.definition.task === 1) {
      return target.number <= Number(target.definition.count || 0)
        && !(target.category === "maps" && target.number === 9);
    }
    return true;
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
