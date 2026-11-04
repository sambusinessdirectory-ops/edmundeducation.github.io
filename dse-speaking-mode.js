(function initialiseDseSpeakingMode() {
  "use strict";

  const MODES = Object.freeze([
    Object.freeze({ id: "dse-combined", label: "Group Discussion + Individual Response", labelZh: "小組討論 + 個人發言", parts: Object.freeze(["group", "individual"]) }),
    Object.freeze({ id: "dse-group", label: "Group Discussion", labelZh: "只練習小組討論", parts: Object.freeze(["group"]) }),
    Object.freeze({ id: "dse-individual", label: "Individual Response", labelZh: "只練習個人發言", parts: Object.freeze(["individual"]) })
  ]);
  const MODE_BY_ID = new Map(MODES.map(mode => [mode.id, mode]));

  function modeForId(modeId) {
    return MODE_BY_ID.get(String(modeId || "")) || null;
  }

  function randomIndex(length) {
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

  function createId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `dse-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function sourceKey(set) {
    return `${Number(set?.year || 0)}:${String(set?.set || "")}`;
  }

  function createSession(modeId, sets, options = {}) {
    const mode = modeForId(modeId);
    const available = Array.isArray(sets) ? sets.filter(set => (
      set && Array.isArray(set.groupDiscussion) && set.groupDiscussion.length === 3
      && Array.isArray(set.individualResponse) && set.individualResponse.length >= 8
    )) : [];
    if (!mode || !available.length) throw new Error("DSE speaking questions are unavailable.");
    const excludedKey = String(options.excludedKey || "");
    const candidates = available.filter(set => sourceKey(set) !== excludedKey);
    const pool = candidates.length ? candidates : available;
    const selected = pool[randomIndex(pool.length)];
    const now = Number(options.now || Date.now());
    const startsWithGroup = mode.parts[0] === "group";
    return {
      id: createId(),
      modeId: mode.id,
      set: JSON.parse(JSON.stringify(selected)),
      sourceKey: sourceKey(selected),
      phase: startsWithGroup ? "preparation" : "individual",
      prepEndsAt: startsWithGroup ? now + 10 * 60 * 1000 : null,
      startedAt: new Date(now).toISOString(),
      completedAt: null,
      individualIndex: 0,
      selectedRating: null,
      rating: null
    };
  }

  window.EDMUND_DSE_SPEAKING_MODE = Object.freeze({
    modes: MODES,
    modeForId,
    createSession,
    sourceKey
  });
})();
