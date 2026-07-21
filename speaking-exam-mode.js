(function initialiseEdmundSpeakingExamMode() {
  "use strict";

  const MODES = Object.freeze([
    Object.freeze({ id: "full", label: "完整考試（Part 1、2 及 3）", shortLabel: "完整考試", parts: Object.freeze([1, 2, 3]) }),
    Object.freeze({ id: "p1", label: "只練習 Part 1", shortLabel: "只練習 Part 1", parts: Object.freeze([1]) }),
    Object.freeze({ id: "p2", label: "只練習 Part 2", shortLabel: "只練習 Part 2", parts: Object.freeze([2]) }),
    Object.freeze({ id: "p3", label: "只練習 Part 3", shortLabel: "只練習 Part 3", parts: Object.freeze([3]) }),
    Object.freeze({ id: "p1-p2", label: "Part 1 及 Part 2", shortLabel: "Part 1 + Part 2", parts: Object.freeze([1, 2]) }),
    Object.freeze({ id: "p1-p3", label: "Part 1 及 Part 3", shortLabel: "Part 1 + Part 3", parts: Object.freeze([1, 3]) }),
    Object.freeze({ id: "p2-p3", label: "Part 2 及 Part 3", shortLabel: "Part 2 + Part 3", parts: Object.freeze([2, 3]) })
  ]);

  const PART1_GROUPS = Object.freeze([
    Object.freeze({ slot: 1, start: 0, count: 3 }),
    Object.freeze({ slot: 2, start: 3, count: 3 }),
    Object.freeze({ slot: 3, start: 6, count: 3 }),
    Object.freeze({ slot: 4, start: 9, count: 3 })
  ]);

  const MODE_BY_ID = new Map(MODES.map(mode => [mode.id, mode]));
  const EXAM_RECORDING_ID_RE = /^exam:([a-z0-9-]+):([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}):p([123]):q(\d{2})$/i;

  function modeForId(modeId) {
    return MODE_BY_ID.get(String(modeId || "")) || null;
  }

  function expectedRecordingCount(modeId) {
    const mode = modeForId(modeId);
    return mode?.parts?.reduce((total, part) => total + (part === 1 ? 12 : part === 2 ? 1 : 6), 0) || 0;
  }

  function expectedPartForOrder(modeId, globalOrder) {
    const mode = modeForId(modeId);
    const order = Number(globalOrder);
    if (!mode || !Number.isInteger(order) || order < 1) return null;
    let cursor = 0;
    for (const part of mode.parts) {
      const count = part === 1 ? 12 : part === 2 ? 1 : 6;
      if (order <= cursor + count) return part;
      cursor += count;
    }
    return null;
  }

  function defaultRandomIndex(length) {
    const size = Number(length);
    if (!Number.isSafeInteger(size) || size < 1) throw new RangeError("Random selection requires a non-empty list.");
    if (globalThis.crypto?.getRandomValues) {
      const ceiling = 0x100000000;
      const accepted = Math.floor(ceiling / size) * size;
      const values = new Uint32Array(1);
      do globalThis.crypto.getRandomValues(values); while (values[0] >= accepted);
      return values[0] % size;
    }
    return Math.floor(Math.random() * size);
  }

  function chooseOne(list, randomIndex) {
    if (!Array.isArray(list) || !list.length) return null;
    const index = Number(randomIndex(list.length));
    if (!Number.isInteger(index) || index < 0 || index >= list.length) {
      throw new RangeError("The random index provider returned an invalid index.");
    }
    return list[index];
  }

  function takeRandom(list, count, randomIndex) {
    const remaining = Array.isArray(list) ? [...list] : [];
    const picked = [];
    while (picked.length < count && remaining.length) {
      const item = chooseOne(remaining, randomIndex);
      picked.push(item);
      remaining.splice(remaining.indexOf(item), 1);
    }
    return picked;
  }

  function part1ThemesAreFeasible(themes) {
    const lengths = (Array.isArray(themes) ? themes : [])
      .map(theme => Array.isArray(theme?.questions) ? theme.questions.length : 0);
    for (const group of [...PART1_GROUPS].reverse()) {
      const match = lengths.findIndex(length => length >= group.start + group.count);
      if (match < 0) return false;
      lengths.splice(match, 1);
    }
    return true;
  }

  function modeIsFeasible(modeId, pools) {
    const mode = modeForId(modeId);
    if (!mode) return false;
    if (mode.parts.includes(1) && !part1ThemesAreFeasible(pools?.[1])) return false;
    if (mode.parts.includes(2) && (!Array.isArray(pools?.[2]) || pools[2].length < 1)) return false;
    if (mode.parts.includes(3) && (!Array.isArray(pools?.[3]) || pools[3].length < 6)) return false;
    return true;
  }

  function buildPart1Items(themes, randomIndex) {
    const selected = new Map();
    const constrainedGroups = [...PART1_GROUPS].reverse();
    const questionKey = value => String(value || "").normalize("NFKC").toLocaleLowerCase("en").replace(/\s+/g, " ").trim();
    const assign = (groupIndex, remaining, usedQuestions) => {
      if (groupIndex >= constrainedGroups.length) return true;
      const group = constrainedGroups[groupIndex];
      const candidates = takeRandom(remaining.filter(theme => (
        Array.isArray(theme?.questions) && theme.questions.length >= group.start + group.count
      )), remaining.length, randomIndex);
      for (const theme of candidates) {
        const slice = theme.questions.slice(group.start, group.start + group.count);
        const keys = slice.map(question => questionKey(question?.questionEn));
        if (keys.some((key, index) => !key || usedQuestions.has(key) || keys.indexOf(key) !== index)) continue;
        selected.set(group.slot, theme);
        const nextRemaining = remaining.filter(candidate => candidate !== theme);
        const nextUsed = new Set([...usedQuestions, ...keys]);
        if (assign(groupIndex + 1, nextRemaining, nextUsed)) return true;
        selected.delete(group.slot);
      }
      return false;
    };
    if (!assign(0, [...themes], new Set())) {
      throw new Error("可用的 Part 1 主題不足，未能建立四組不重複的漸進題目。");
    }

    return PART1_GROUPS.flatMap(group => {
      const theme = selected.get(group.slot);
      return theme.questions.slice(group.start, group.start + group.count).map((question, questionIndex) => ({
        kind: "part1",
        part: 1,
        sourceId: String(theme.id || ""),
        sourceBook: Number(theme.book || 1),
        sourceIndex: Number(theme.index || 0),
        themeSlot: group.slot,
        themeTitle: String(theme.title || "Part 1 topic"),
        themeTitleZh: String(theme.titleZh || ""),
        questionInTheme: group.start + questionIndex + 1,
        questionNumber: Number(question?.number || group.start + questionIndex + 1),
        title: String(question?.questionEn || ""),
        titleZh: String(question?.questionZh || "")
      }));
    });
  }

  function buildPart2Item(exercise) {
    const cue = exercise?.cueCard || exercise?.cue || {};
    const normalizedCue = Boolean(exercise?.cueCard);
    return {
      kind: "part2",
      part: 2,
      sourceId: String(exercise?.id || ""),
      sourceBook: Number(exercise?.book || 1),
      sourceIndex: Number(exercise?.index || 0),
      title: String(cue.promptEn || exercise?.title || ""),
      titleZh: String(cue.promptZh || exercise?.titleZh || ""),
      cueTitle: String(normalizedCue ? cue.titleEn || "" : cue.titleEn || exercise?.title || ""),
      cueTitleZh: String(normalizedCue ? cue.titleZh || "" : cue.titleZh || exercise?.titleZh || ""),
      hints: Array.isArray(cue.hints) ? cue.hints.map(hint => ({
        en: String(hint?.en || ""),
        zh: String(hint?.zh || "")
      })) : [],
      ppf: cue.ppf && typeof cue.ppf === "object" ? {
        en: String(cue.ppf.en || ""),
        zh: String(cue.ppf.zh || "")
      } : null
    };
  }

  function buildPart3Item(exercise) {
    return {
      kind: "part3",
      part: 3,
      sourceId: String(exercise?.id || ""),
      sourceBook: Number(exercise?.book || 1),
      sourceIndex: Number(exercise?.index || 0),
      themeTitle: String(exercise?.themeTitle || "Discussion"),
      title: String(exercise?.title || ""),
      titleZh: String(exercise?.titleZh || "")
    };
  }

  function buildExamItems(modeId, pools, options = {}) {
    const mode = modeForId(modeId);
    if (!mode) throw new Error("未能辨認考試練習模式。");
    if (!modeIsFeasible(modeId, pools)) throw new Error("你的帳戶目前沒有足夠已開放題目建立這個考試模式。");
    const randomIndex = typeof options.randomIndex === "function" ? options.randomIndex : defaultRandomIndex;
    const items = [];
    if (mode.parts.includes(1)) items.push(...buildPart1Items(pools[1], randomIndex));
    if (mode.parts.includes(2)) items.push(buildPart2Item(chooseOne(pools[2], randomIndex)));
    if (mode.parts.includes(3)) {
      items.push(...takeRandom(pools[3], 6, randomIndex).map(buildPart3Item));
    }
    return items.map((item, index) => ({ ...item, globalOrder: index + 1 }));
  }

  function createAttemptId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    if (globalThis.crypto?.getRandomValues) {
      const bytes = new Uint8Array(16);
      globalThis.crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = [...bytes].map(value => value.toString(16).padStart(2, "0"));
      return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
    }
    throw new Error("這個瀏覽器未能安全建立考試編號，請更新瀏覽器後再試。");
  }

  function recordingExerciseId(modeId, attemptId, part, globalOrder) {
    if (!modeForId(modeId)) throw new Error("Invalid exam mode.");
    const normalizedAttempt = String(attemptId || "").toLowerCase();
    const value = `exam:${modeId}:${normalizedAttempt}:p${Number(part)}:q${String(Number(globalOrder)).padStart(2, "0")}`;
    if (!EXAM_RECORDING_ID_RE.test(value) || expectedPartForOrder(modeId, globalOrder) !== Number(part)) {
      throw new Error("Invalid exam recording identifier.");
    }
    return value;
  }

  function parseRecordingExerciseId(value) {
    const match = String(value || "").match(EXAM_RECORDING_ID_RE);
    if (!match || !modeForId(match[1])) return null;
    const part = Number(match[3]);
    const globalOrder = Number(match[4]);
    if (expectedPartForOrder(match[1], globalOrder) !== part) return null;
    return {
      modeId: match[1],
      attemptId: match[2].toLowerCase(),
      part,
      globalOrder
    };
  }

  window.EDMUND_SPEAKING_EXAM = Object.freeze({
    modes: MODES,
    modeForId,
    expectedRecordingCount,
    expectedPartForOrder,
    modeIsFeasible,
    buildExamItems,
    createAttemptId,
    recordingExerciseId,
    parseRecordingExerciseId
  });
})();
