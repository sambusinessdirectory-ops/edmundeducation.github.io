import {
  VOCABULARY,
  createMask,
  isAnswerCorrect,
  requiredCorrectTotal
} from "./spelling-practice-core.mjs";
import { createClassroomLiveSync } from "./classroom-live-sync.mjs?v=20261028-1";

const PORTAL_ID = "spelling";
const STORAGE_VERSION = "v1";
const SYNC_SCHEMA_VERSION = 2;
const SYNC_SCOPE = `practice:${STORAGE_VERSION}`;
let appState = null;
let activeUser = null;
let wordAudio = null;
let storedAudioIndex = null;
const FLASHCARD_PACKED_AUDIO_BASE = "https://edmund-site-assets.edmundeducation.workers.dev/site-assets/v1/";
let correctAdvanceTimer = null;
let elapsedTimer = null;
let historySaveTimer = null;
let historyRows = [];
let historyLoading = false;
let selectionGesture = null;
let suppressRowClick = false;
const SELECTION_CATALOG = window.SPELLING_SELECTION_CATALOG || { libraries: [], decks: [], entries: [] };
const CATALOG_DECKS = Array.isArray(SELECTION_CATALOG.decks) ? SELECTION_CATALOG.decks : [];
const LIBRARY_IDS = new Set(["core", ...(SELECTION_CATALOG.libraries || []).map((library) => library.id)]);
const ALL_DECK_IDS = new Set(CATALOG_DECKS.map((deck) => deck.id));
const CORE_IDS = VOCABULARY.filter((entry) => entry.libraryId === "core").map((entry) => entry.id);

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
}

function storageKey(userId) {
  return `edmund-spelling-practice:${STORAGE_VERSION}:${userId || "student"}`;
}

function defaultState() {
  return {
    selectedIds: [...CORE_IDS],
    difficulty: 50,
    frequency: 2,
    displayMode: "slots",
    setupView: "bank",
    libraryId: "core",
    libraryGroupId: "",
    librarySectionId: "",
    selectedDeckIds: [],
    wordFilter: "all",
    phase: "setup",
    correctById: {},
    totalCorrect: 0,
    totalAttempts: 0,
    currentId: "",
    mask: [],
    draftLetters: {},
    awaitingNext: false,
    feedback: "",
    pendingNextId: "",
    pendingNextMask: [],
    advanceAt: 0,
    queue: [],
    roundId: "",
    startedAt: 0,
    completedAt: 0,
    attemptEvents: [],
    lastAttempt: null
  };
}

function randomUuid() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const value = Math.random() * 16 | 0;
    return (character === "x" ? value : (value & 3) | 8).toString(16);
  });
}

function shuffled(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  for (let index = 1; index < result.length; index += 1) {
    if (result[index] !== result[index - 1]) continue;
    const swap = result.findIndex((value, candidate) => candidate > index && value !== result[index]);
    if (swap > index) [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function buildQueue(ids, frequency) {
  return shuffled(ids.flatMap((id) => Array.from({ length: frequency }, () => id)));
}

function normalizeAnswer(value) {
  return String(value || "").toLocaleLowerCase("en").replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
}

function formatDuration(seconds) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remainder = safe % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}` : `${minutes}:${String(remainder).padStart(2, "0")}`;
}

function validMask(word, candidate) {
  if (!Array.isArray(candidate)) return [];
  const positions = [...new Set(candidate.map(Number).filter((position) => Number.isInteger(position)
    && position >= 0 && position < word.length && /[a-z]/i.test(word[position])))]
    .sort((a, b) => a - b);
  return positions;
}

function validDraft(mask, candidate) {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return {};
  const allowed = new Set(mask.map(String));
  return Object.fromEntries(Object.entries(candidate)
    .filter(([position]) => allowed.has(String(position)))
    .map(([position, value]) => [position, String(value || "").replace(/[^a-z]/gi, "").slice(-1).toLocaleLowerCase("en")])
    .filter(([, value]) => value));
}

function normalizeState(candidate) {
  const fallback = defaultState();
  if (!candidate || typeof candidate !== "object") return fallback;
  const validIds = new Set(VOCABULARY.map((entry) => entry.id));
  const selectedIds = Array.isArray(candidate.selectedIds)
    ? candidate.selectedIds.filter((id) => validIds.has(id))
    : fallback.selectedIds;
  const libraryId = LIBRARY_IDS.has(candidate.libraryId) ? candidate.libraryId : "core";
  const selectedDeckIds = Array.isArray(candidate.selectedDeckIds)
    ? [...new Set(candidate.selectedDeckIds.filter((id) => ALL_DECK_IDS.has(id)))]
    : [];
  const libraryGroups = (SELECTION_CATALOG.libraries || []).find((library) => library.id === libraryId)?.groups || [];
  const libraryGroupId = libraryGroups.some((group) => group.id === candidate.libraryGroupId)
    ? candidate.libraryGroupId
    : (libraryGroups[0]?.id || "");
  const availableSectionIds = new Set(CATALOG_DECKS
    .filter((deck) => deck.libraryId === libraryId && deck.groupId === libraryGroupId)
    .map((deck) => deck.sectionId));
  const librarySectionId = availableSectionIds.has(candidate.librarySectionId) ? candidate.librarySectionId : "";
  const difficulty = Math.min(100, Math.max(10, Math.round((Number(candidate.difficulty) || 50) / 10) * 10));
  const frequency = Math.min(100, Math.max(1, Math.floor(Number(candidate.frequency) || 2)));
  const correctById = {};
  selectedIds.forEach((id) => {
    correctById[id] = Math.min(frequency, Math.max(0, Math.floor(Number(candidate.correctById?.[id]) || 0)));
  });
  const totalCorrect = Object.values(correctById).reduce((sum, value) => sum + value, 0);
  const pendingCorrectFeedback = candidate.phase === "practice" && candidate.feedback === "correct";
  const phase = candidate.phase === "practice" && (totalCorrect < requiredCorrectTotal(selectedIds.length, frequency) || pendingCorrectFeedback)
    ? "practice"
    : candidate.phase === "complete" && totalCorrect >= requiredCorrectTotal(selectedIds.length, frequency)
      ? "complete"
      : "setup";
  const selectedSet = new Set(selectedIds);
  const currentId = phase === "practice" && selectedSet.has(candidate.currentId) ? candidate.currentId : "";
  const currentWord = VOCABULARY.find((entry) => entry.id === currentId)?.word || "";
  const mask = validMask(currentWord, candidate.mask);
  const feedback = phase === "practice" && candidate.feedback === "correct" ? "correct" : "";
  const awaitingNext = phase === "practice" && !feedback && candidate.awaitingNext === true;
  const pendingNextId = feedback && selectedSet.has(candidate.pendingNextId) ? candidate.pendingNextId : "";
  const pendingWord = VOCABULARY.find((entry) => entry.id === pendingNextId)?.word || "";
  const displayMode = candidate.displayMode === "line" ? "line" : "slots";
  const queue = Array.isArray(candidate.queue)
    ? candidate.queue.filter((id) => selectedSet.has(id))
    : [];
  const rawEvents = Array.isArray(candidate.attemptEvents) ? candidate.attemptEvents.slice(-3000) : [];
  const attemptEvents = rawEvents.map((event) => ({
    at: Math.max(0, Math.floor(Number(event?.at) || 0)),
    wordId: validIds.has(event?.wordId) ? event.wordId : "",
    word: String(event?.word || "").slice(0, 300),
    answer: String(event?.answer || "").slice(0, 300),
    correct: event?.correct === true
  })).filter((event) => event.wordId && event.word);
  const lastAttempt = candidate.lastAttempt && typeof candidate.lastAttempt === "object"
    ? {
      wordId: validIds.has(candidate.lastAttempt.wordId) ? candidate.lastAttempt.wordId : "",
      answer: String(candidate.lastAttempt.answer || "").slice(0, 300),
      correct: candidate.lastAttempt.correct === true
    }
    : null;
  return {
    selectedIds,
    difficulty,
    frequency,
    displayMode,
    setupView: candidate.setupView === "history" ? "history" : "bank",
    libraryId,
    libraryGroupId,
    librarySectionId,
    selectedDeckIds,
    wordFilter: ["all", "unmastered", "mastered"].includes(candidate.wordFilter) ? candidate.wordFilter : "all",
    phase,
    correctById,
    totalCorrect,
    totalAttempts: Math.max(totalCorrect, Math.floor(Number(candidate.totalAttempts) || totalCorrect)),
    currentId,
    mask,
    draftLetters: displayMode === "line"
      ? (String(candidate.draftLetters?.line || "").slice(0, 300) ? { line: String(candidate.draftLetters.line).slice(0, 300) } : {})
      : validDraft(mask, candidate.draftLetters),
    awaitingNext,
    feedback,
    pendingNextId,
    pendingNextMask: validMask(pendingWord, candidate.pendingNextMask),
    advanceAt: feedback ? Math.max(0, Math.floor(Number(candidate.advanceAt) || 0)) : 0,
    queue,
    roundId: /^[0-9a-f-]{36}$/i.test(String(candidate.roundId || "")) ? String(candidate.roundId) : "",
    startedAt: Math.max(0, Math.floor(Number(candidate.startedAt) || 0)),
    completedAt: Math.max(0, Math.floor(Number(candidate.completedAt) || 0)),
    attemptEvents,
    lastAttempt: lastAttempt?.wordId ? lastAttempt : null
  };
}

function readState(userId) {
  try { return normalizeState(JSON.parse(localStorage.getItem(storageKey(userId)) || "null")); }
  catch { return defaultState(); }
}

function saveState() {
  if (!activeUser || !appState) return;
  try { localStorage.setItem(storageKey(activeUser.id), JSON.stringify(appState)); }
  catch { /* The exercise remains usable without persistent browser storage. */ }
}

function persistAndPublish() {
  saveState();
  classroomLive?.publish();
  scheduleHistorySave();
}

function elapsedSeconds() {
  if (!appState?.startedAt) return 0;
  const end = appState.completedAt || Date.now();
  return Math.max(0, Math.floor((end - appState.startedAt) / 1000));
}

function historyPayload() {
  if (!appState?.roundId || !appState.startedAt) return null;
  return {
    round_id: appState.roundId,
    started_at: new Date(appState.startedAt).toISOString(),
    completed_at: appState.completedAt ? new Date(appState.completedAt).toISOString() : "",
    selected_count: appState.selectedIds.length,
    required_correct: requiredCorrectTotal(appState.selectedIds.length, appState.frequency),
    total_attempts: appState.totalAttempts,
    correct_attempts: appState.totalCorrect,
    duration_seconds: elapsedSeconds(),
    display_mode: appState.displayMode,
    difficulty: appState.difficulty,
    frequency: appState.frequency,
    details: appState.attemptEvents
  };
}

function historyStorageKey() {
  return `edmund-spelling-history:${STORAGE_VERSION}:${activeUser?.id || "student"}`;
}

function readLocalHistory() {
  try {
    const rows = JSON.parse(localStorage.getItem(historyStorageKey()) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function readAllLocalHistory() {
  const groups = [readLocalHistory()];
  const accountSuffix = `:${activeUser?.id || "student"}`;
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (!key?.startsWith("edmund-spelling-history:") || !key.endsWith(accountSuffix) || key === historyStorageKey()) continue;
      const rows = JSON.parse(localStorage.getItem(key) || "[]");
      if (Array.isArray(rows)) groups.push(rows);
    }
  } catch {
    /* The current-version history remains available if a browser blocks key enumeration. */
  }
  return mergeHistoryRows(...groups);
}

function writeLocalHistory(rows) {
  try { localStorage.setItem(historyStorageKey(), JSON.stringify(rows.slice(0, 100))); }
  catch { /* Remote history remains available when local storage is blocked. */ }
}

function mergeHistoryRows(...groups) {
  const merged = new Map();
  groups.flat().filter(Boolean).forEach((row) => {
    if (!row?.round_id) return;
    merged.set(row.round_id, { ...(merged.get(row.round_id) || {}), ...row });
  });
  return [...merged.values()].sort((left, right) => Date.parse(right.started_at || 0) - Date.parse(left.started_at || 0));
}

function upsertLocalHistory(payload) {
  historyRows = mergeHistoryRows([payload], historyRows, readAllLocalHistory());
  writeLocalHistory(historyRows);
}

async function historyRpc(action, payload = {}) {
  const session = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.();
  if (!session?.token) throw new Error("Missing student session");
  return window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc("spelling_attempt_history", {
    p_token: session.token,
    p_action: action,
    p_payload: payload
  });
}

function scheduleHistorySave(immediate = false) {
  if (historySaveTimer) clearTimeout(historySaveTimer);
  historySaveTimer = null;
  const payload = historyPayload();
  if (!payload || !activeUser) return;
  upsertLocalHistory(payload);
  const save = () => historyRpc("upsert", payload).catch(() => {});
  if (immediate) save();
  else historySaveTimer = setTimeout(save, 450);
}

async function loadHistory() {
  if (!activeUser || historyLoading) return;
  const current = historyPayload();
  historyRows = mergeHistoryRows(readAllLocalHistory(), current ? [current] : [], historyRows);
  historyLoading = true;
  if (appState?.phase === "setup" && appState.setupView === "history") render();
  try {
    const result = await historyRpc("list");
    historyRows = mergeHistoryRows(Array.isArray(result) ? result : [], historyRows);
    writeLocalHistory(historyRows);
  } catch {
    /* Keep the local and current-round records when the remote history service is unavailable. */
  } finally {
    historyLoading = false;
    if (appState?.phase === "setup") render();
  }
}

function masteredIds() {
  const result = new Set();
  [...historyRows.flatMap((row) => Array.isArray(row.details) ? row.details : []), ...(appState?.attemptEvents || [])]
    .forEach((event) => { if (event?.correct && event.wordId) result.add(event.wordId); });
  return result;
}

function tickElapsed() {
  document.querySelectorAll("[data-elapsed]").forEach((node) => { node.textContent = formatDuration(elapsedSeconds()); });
}

function restartElapsedTimer() {
  if (elapsedTimer) clearInterval(elapsedTimer);
  elapsedTimer = null;
  tickElapsed();
  if (appState?.phase === "practice" && appState.startedAt && !appState.completedAt) elapsedTimer = setInterval(tickElapsed, 1000);
}

function clearAttemptState() {
  appState.draftLetters = {};
  appState.awaitingNext = false;
  appState.feedback = "";
  appState.pendingNextId = "";
  appState.pendingNextMask = [];
  appState.advanceAt = 0;
  appState.lastAttempt = null;
  if (correctAdvanceTimer) clearTimeout(correctAdvanceTimer);
  correctAdvanceTimer = null;
}

function selectedEntries() {
  const selected = new Set(appState.selectedIds);
  return VOCABULARY.filter((entry) => selected.has(entry.id));
}

function currentEntry() {
  return VOCABULARY.find((entry) => entry.id === appState.currentId) || null;
}

function incompleteEntries() {
  return selectedEntries().filter((entry) => (appState.correctById[entry.id] || 0) < appState.frequency);
}

function chooseNextEntry(avoidId = "") {
  if (appState.queue?.length) {
    const preferred = appState.queue.find((id) => id !== avoidId) || appState.queue[0];
    return VOCABULARY.find((entry) => entry.id === preferred) || null;
  }
  const available = incompleteEntries();
  if (!available.length) return null;
  const alternatives = available.filter((entry) => entry.id !== avoidId);
  const pool = alternatives.length ? alternatives : available;
  return pool[Math.floor(Math.random() * pool.length)];
}

function icon(name) {
  const paths = {
    sound: '<path d="M4 10v4h4l5 4V6L8 10H4Z"/><path d="M16 9a5 5 0 0 1 0 6M18.5 6.5a9 9 0 0 1 0 11"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="m9 18 6-6-6-6"/>',
    replay: '<path d="M20 11a8 8 0 1 0 2 5M20 4v7h-7"/>'
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ""}</svg>`;
}

function historyMarkup() {
  const current = historyPayload();
  const availableRows = mergeHistoryRows(readAllLocalHistory(), current ? [current] : [], historyRows);
  if (historyLoading && !availableRows.length) return '<div class="spelling-history-empty">正在載入作答記錄……</div>';
  if (!availableRows.length) return '<div class="spelling-history-empty"><strong>尚未有作答記錄</strong><span>完成第一輪練習後，準確率與每次嘗試會顯示在這裡。</span></div>';
  const rows = availableRows.map((round) => {
    const attempts = Math.max(0, Number(round.total_attempts) || 0);
    const correct = Math.max(0, Number(round.correct_attempts) || 0);
    const accuracy = attempts ? Math.round(correct / attempts * 100) : 0;
    const details = (Array.isArray(round.details) ? round.details : []).map((event, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(event.word || "")}</td><td class="${event.correct ? "is-correct" : "is-wrong"}">${escapeHtml(event.answer || "（未作答）")}</td><td>${event.correct ? "正確" : "錯誤"}</td></tr>`).join("");
    const date = new Intl.DateTimeFormat("zh-HK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(round.started_at));
    return `<details class="spelling-history-row"><summary><span><strong>${date}</strong><small>${Number(round.selected_count) || 0} 個生字／詞組 · ${round.display_mode === "line" ? "整行輸入" : "字母格"}</small></span><span><strong>${accuracy}%</strong><small>${correct} / ${attempts} 次正確 · ${formatDuration(round.duration_seconds)}</small></span></summary><div class="spelling-history-detail"><table><thead><tr><th>#</th><th>題目</th><th>你的拼寫</th><th>結果</th></tr></thead><tbody>${details || '<tr><td colspan="4">這輪尚未作答。</td></tr>'}</tbody></table></div></details>`;
  }).join("");
  return `<div class="spelling-history-list">${rows}</div>`;
}

function activeLibraryEntries() {
  if (appState.libraryId === "core") return VOCABULARY.filter((entry) => entry.libraryId === "core");
  const decks = new Set(appState.selectedDeckIds);
  return VOCABULARY.filter((entry) => entry.libraryId === appState.libraryId && entry.deckIds.some((id) => decks.has(id)));
}

function libraryNavigationMarkup() {
  const libraries = [
    { id: "core", label: "My Word Bank", zh: "我的生字", description: "已建立的個人詞彙及課堂詞組" },
    ...(SELECTION_CATALOG.libraries || [])
  ];
  return `<section class="spelling-library" aria-labelledby="spelling-library-heading">
    <div class="spelling-library__heading"><div><p class="spelling-eyebrow">CHOOSE YOUR ADVENTURE · 選擇詞庫</p><h2 id="spelling-library-heading">從哪一個詞庫開始？</h2></div><p>每個詞庫保留原有分組；你可以整組加入，再逐項調整。</p></div>
    <div class="spelling-library__tabs">${libraries.map((library, index) => `<button type="button" data-library-id="${escapeHtml(library.id)}" aria-pressed="${appState.libraryId === library.id}" class="spelling-library-card spelling-library-card--${index % 3}"><span class="spelling-library-card__number">${String(index + 1).padStart(2, "0")}</span><span><strong>${escapeHtml(library.label)}</strong><small>${escapeHtml(library.zh || "")}</small><em>${escapeHtml(library.description || "")}</em></span></button>`).join("")}</div>
  </section>`;
}

function deckExplorerMarkup() {
  if (appState.libraryId === "core") return "";
  const library = (SELECTION_CATALOG.libraries || []).find((item) => item.id === appState.libraryId);
  if (!library) return "";
  const groups = library.groups || [];
  const activeGroup = groups.find((group) => group.id === appState.libraryGroupId) || groups[0];
  const groupDecks = CATALOG_DECKS.filter((deck) => deck.libraryId === appState.libraryId && deck.groupId === activeGroup?.id);
  const sections = [...new Map(groupDecks.map((deck) => [deck.sectionId, { id: deck.sectionId, label: deck.sectionLabel, zh: deck.sectionZh }])).values()];
  const selected = new Set(appState.selectedDeckIds);
  const activeSection = sections.find((section) => section.id === appState.librarySectionId);
  const visibleDecks = activeSection
    ? groupDecks.filter((deck) => deck.sectionId === activeSection.id).sort((a, b) => a.label.localeCompare(b.label, "en", { numeric: true }))
    : [];
  return `<section class="spelling-deck-explorer">
    <div class="spelling-deck-explorer__top"><div><p class="spelling-eyebrow">COLLECTION · 分類選擇</p><h2>${escapeHtml(library.label)}</h2></div><div class="spelling-deck-actions"><span>${appState.selectedDeckIds.length} 個分組已加入</span>${activeSection ? '<button type="button" data-select-visible-decks>加入本頁全部</button>' : ''}<button type="button" data-clear-library-decks>清除本詞庫</button></div></div>
    ${groups.length > 1 ? `<div class="spelling-group-tabs">${groups.map((group) => `<button type="button" data-library-group="${escapeHtml(group.id)}" aria-pressed="${group.id === activeGroup?.id}"><strong>${escapeHtml(group.label)}</strong><span>${escapeHtml(group.zh || "")}</span></button>`).join("")}</div>` : ""}
    ${activeSection ? `<div class="spelling-section-stage"><button type="button" class="spelling-section-back" data-library-section-back>← 返回分類</button><div><p class="spelling-eyebrow">${escapeHtml(activeGroup?.label || "")}</p><h3>${escapeHtml(activeSection.label)}</h3><p>${escapeHtml(activeSection.zh || "")}</p></div></div><div class="spelling-deck-grid spelling-deck-grid--stage">${visibleDecks.map((deck) => `<button type="button" data-deck-id="${escapeHtml(deck.id)}" aria-pressed="${selected.has(deck.id)}"><span class="spelling-deck-check" aria-hidden="true">${selected.has(deck.id) ? "✓" : "+"}</span><span><strong>${escapeHtml(deck.label)}</strong><small>${deck.entryIds.length} 項</small></span></button>`).join("")}</div>` : `<div class="spelling-section-menu">${sections.map((section, sectionIndex) => {
      const decks = groupDecks.filter((deck) => deck.sectionId === section.id);
      const selectedCount = decks.filter((deck) => selected.has(deck.id)).length;
      return `<button type="button" class="spelling-section-choice" data-library-section="${escapeHtml(section.id)}"><span class="spelling-section-card__badge">${String(sectionIndex + 1).padStart(2, "0")}</span><span><strong>${escapeHtml(section.label)}</strong><small>${escapeHtml(section.zh || "")}</small></span><em>${selectedCount} / ${decks.length}</em><b aria-hidden="true">→</b></button>`;
    }).join("")}</div>`}
  </section>`;
}

function setupMarkup() {
  const mastered = masteredIds();
  const visibleEntries = activeLibraryEntries();
  const rows = visibleEntries.map((entry) => {
    const selected = appState.selectedIds.includes(entry.id);
    return `<tr class="spelling-word-row" data-word-row="${entry.id}" data-mastered="${mastered.has(entry.id)}" tabindex="0" aria-label="${selected ? "取消選擇" : "選擇"} ${escapeHtml(entry.word)}">
      <td><label class="spelling-check"><input type="checkbox" value="${entry.id}" data-word-select ${selected ? "checked" : ""}><span aria-hidden="true"></span><span class="sr-only">選擇 ${escapeHtml(entry.word)}</span></label></td>
      <td><span class="spelling-word-cell"><strong>${escapeHtml(entry.word)}</strong>${mastered.has(entry.id) ? '<em class="spelling-mastered">已答對</em>' : ""}<button class="spelling-row-sound" type="button" data-speak-word="${entry.id}" aria-label="播放 ${escapeHtml(entry.word)} 的讀音">${icon("sound")}</button></span></td>
      <td>${escapeHtml(entry.meaning)}</td>
    </tr>`;
  }).join("");
  const total = requiredCorrectTotal(appState.selectedIds.length, appState.frequency);
  return `<section class="spelling-workspace" data-spelling-app>
    <header class="spelling-hero">
      <div><p class="spelling-eyebrow">SPELLING LAB · 拼寫實驗室</p><h1>拼寫練習設定</h1><p>選擇生字、設定測試比例與完成次數。每一輪的出題次序及測試字母均會重新隨機排列。</p></div>
      <div class="spelling-hero__count"><strong>${appState.selectedIds.length}</strong><span>本輪已選項目</span></div>
    </header>
    <nav class="spelling-view-tabs" aria-label="拼寫系統頁面"><button type="button" data-setup-view="bank" aria-current="${appState.setupView === "bank" ? "page" : "false"}">生字庫</button><button type="button" data-setup-view="history" aria-current="${appState.setupView === "history" ? "page" : "false"}">作答記錄</button></nav>
    ${appState.setupView === "history" ? `<section class="spelling-bank spelling-history"><div class="spelling-bank__toolbar"><div><p class="spelling-eyebrow">ATTEMPTS · 作答記錄</p><h2>每輪練習詳情</h2></div><button type="button" class="spelling-refresh-history" data-refresh-history>重新整理</button></div>${historyMarkup()}</section>` : `
    ${libraryNavigationMarkup()}
    ${deckExplorerMarkup()}
    <section class="spelling-controls" aria-label="練習設定">
      <div class="spelling-control spelling-control--difficulty">
        <label for="spelling-difficulty">測試難度</label>
        <div class="spelling-range-row"><input id="spelling-difficulty" data-difficulty type="range" min="10" max="100" step="10" value="${appState.difficulty}"><output data-difficulty-output>${appState.difficulty}%</output></div>
        <small>按英文字母總數向上取整；空格不計算。</small>
      </div>
      <div class="spelling-control">
        <label for="spelling-frequency">每個生字需答對</label>
        <div class="spelling-frequency-row"><button type="button" data-frequency-preset="2" aria-pressed="${appState.frequency === 2}">2 次</button><button type="button" data-frequency-preset="3" aria-pressed="${appState.frequency === 3}">3 次</button><label><span>自訂</span><input id="spelling-frequency" data-frequency type="number" min="1" max="100" inputmode="numeric" value="${appState.frequency}"><span>次</span></label></div>
        <small>答錯不會增加完成次數。</small>
      </div>
      <div class="spelling-control spelling-control--mode"><span>作答顯示方式</span><div class="spelling-mode-options"><button type="button" data-display-mode="slots" aria-pressed="${appState.displayMode === "slots"}">字母格</button><button type="button" data-display-mode="line" aria-pressed="${appState.displayMode === "line"}">整行輸入</button></div><small>${appState.displayMode === "line" ? "不顯示字母數目或空格位置。" : "以字母格顯示已提供及待填字母。"}</small></div>
      <div class="spelling-control spelling-control--summary"><span>本輪目標</span><strong data-target-total>${total}</strong><small>共選 ${appState.selectedIds.length} 項 × ${appState.frequency} 次</small><button class="spelling-primary" type="button" data-start ${appState.selectedIds.length ? "" : "disabled"}>開始練習 ${icon("arrow")}</button></div>
    </section>
    <section class="spelling-bank">
      <div class="spelling-bank__toolbar"><div><p class="spelling-eyebrow">WORD BANK · 生字庫</p><div class="spelling-bank__title-row"><h2>${appState.libraryId === "core" ? "選擇本輪生字" : "調整已加入的詞彙"}</h2><label class="spelling-search"><span class="sr-only">搜尋英文或繁體中文</span><input type="search" data-word-search placeholder="搜尋英文或繁體中文" autocomplete="off"></label><label class="spelling-filter"><span class="sr-only">按掌握狀態篩選</span><select data-word-filter><option value="all" ${appState.wordFilter === "all" ? "selected" : ""}>顯示全部</option><option value="unmastered" ${appState.wordFilter === "unmastered" ? "selected" : ""}>隱藏已答對</option><option value="mastered" ${appState.wordFilter === "mastered" ? "selected" : ""}>只看已答對</option></select></label></div></div><div class="spelling-bank__actions"><span data-selected-count>本輪共選 ${appState.selectedIds.length} 項</span><button type="button" data-select-all>選取目前詞庫</button><button type="button" data-deselect-all>取消目前詞庫</button></div></div>
      <p class="spelling-drag-hint">可按住並拖過多行，快速選取或取消多個生字。</p>
      ${visibleEntries.length ? `<div class="spelling-table-wrap"><table><thead><tr><th scope="col">選擇</th><th scope="col">生字／詞組</th><th scope="col">繁體中文意思</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="spelling-library-empty"><strong>先選擇一個分組</strong><span>從上方的收藏分類加入 IELTS 或 DSE 詞彙，然後再逐項調整。</span></div>`}
    </section>`}
  </section>`;
}

function renderMask(entry) {
  const blanks = new Set(appState.mask);
  let position = 0;
  return entry.word.split(" ").map((token) => {
    const slots = [...token].map((character) => {
      const current = position;
      position += 1;
      if (appState.awaitingNext && blanks.has(current)) return `<span class="spelling-slot spelling-slot--corrected">${escapeHtml(character)}</span>`;
      if (!blanks.has(current)) return `<span class="spelling-slot spelling-slot--given">${escapeHtml(character)}</span>`;
      return `<label class="spelling-slot spelling-slot--blank"><span class="sr-only">輸入第 ${current + 1} 個字母</span><input data-letter-position="${current}" maxlength="1" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="輸入第 ${current + 1} 個字母" value="${escapeHtml(appState.draftLetters[current] || "")}" ${appState.feedback === "correct" ? "disabled" : ""}></label>`;
    }).join("");
    position += 1;
    return `<span class="spelling-token" style="--token-length:${Math.max(1, [...token].length)}">${slots}</span>`;
  }).join('<span class="spelling-word-gap" aria-hidden="true"></span>');
}

function submittedAnswer(entry, values = {}) {
  if (appState.displayMode === "line") return normalizeAnswer(values.line || "");
  return [...entry.word].map((character, position) => /[a-z]/i.test(character) && appState.mask.includes(position)
    ? String(values[position] || "").toLocaleLowerCase("en")
    : character).join("");
}

function comparisonHtml(answer, expected) {
  const actual = [...normalizeAnswer(answer)];
  const target = [...normalizeAnswer(expected)];
  const rows = Array.from({ length: actual.length + 1 }, () => Array(target.length + 1).fill(0));
  for (let index = 0; index <= actual.length; index += 1) rows[index][0] = index;
  for (let index = 0; index <= target.length; index += 1) rows[0][index] = index;
  for (let left = 1; left <= actual.length; left += 1) for (let right = 1; right <= target.length; right += 1) {
    rows[left][right] = Math.min(rows[left - 1][right] + 1, rows[left][right - 1] + 1, rows[left - 1][right - 1] + (actual[left - 1] === target[right - 1] ? 0 : 1));
  }
  const output = [];
  let left = actual.length;
  let right = target.length;
  while (left || right) {
    if (left && right && rows[left][right] === rows[left - 1][right - 1] + (actual[left - 1] === target[right - 1] ? 0 : 1)) {
      output.unshift(`<mark class="${actual[left - 1] === target[right - 1] ? "is-match" : "is-different"}">${escapeHtml(actual[left - 1] || "＿")}</mark>`);
      left -= 1;
      right -= 1;
    } else if (left && rows[left][right] === rows[left - 1][right] + 1) {
      output.unshift(`<mark class="is-different">${escapeHtml(actual[left - 1] || "＿")}</mark>`);
      left -= 1;
    } else {
      output.unshift('<mark class="is-different is-missing">＿</mark>');
      right -= 1;
    }
  }
  return output.join("");
}

function wholeLineHintLetters(entry) {
  const mask = new Set(appState.mask);
  const visible = [...entry.word.toLocaleLowerCase("en")]
    .map((character, index) => ({ character, index }))
    .filter(({ character, index }) => /[a-z]/.test(character) && !mask.has(index))
    .map(({ character }) => character);
  const letters = [...entry.word.toLocaleLowerCase("en")].filter((character) => /[a-z]/.test(character));
  const fallback = [letters[0], letters[Math.floor(letters.length / 2)], letters.at(-1)].filter(Boolean);
  return [...new Set(visible.length ? visible : fallback)].slice(0, 5);
}

function answerArea(entry) {
  if (appState.displayMode === "line") {
    const hints = wholeLineHintLetters(entry);
    const hintText = hints.map(escapeHtml).join(" · ");
    return `<div class="spelling-line-mode"><label class="spelling-line-answer"><span class="sr-only">輸入完整英文拼寫；提示字母為 ${hintText}</span><input data-line-answer type="text" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="輸入完整英文拼寫；提示字母為 ${hintText}" placeholder="${hintText}" value="${escapeHtml(appState.draftLetters.line || "")}" ${appState.feedback === "correct" || appState.awaitingNext ? "disabled" : ""}></label></div>`;
  }
  return `<div class="spelling-slots" role="group" aria-label="填寫缺少的英文字母">${renderMask(entry)}</div>`;
}

function feedbackHtml(entry) {
  if (appState.awaitingNext && appState.lastAttempt) return `<div class="spelling-comparison"><div><span>你的拼寫</span><strong>${comparisonHtml(appState.lastAttempt.answer, entry.word)}</strong></div><div><span>正確拼寫</span><strong>${escapeHtml(entry.word)}</strong></div></div>`;
  if (appState.feedback === "correct") return "拼寫正確！已計入一次。";
  return "";
}

function practiceMarkup() {
  const entry = currentEntry();
  const required = requiredCorrectTotal(appState.selectedIds.length, appState.frequency);
  const completed = appState.totalCorrect;
  const percentage = required ? Math.round(completed / required * 100) : 0;
  const wordCorrect = appState.correctById[entry.id] || 0;
  const meaningLength = [...entry.meaning].length;
  const lengthClass = meaningLength > 32 ? " is-very-long" : meaningLength > 18 ? " is-long" : "";
  return `<section class="spelling-workspace spelling-workspace--practice" data-spelling-app data-spelling-practice data-spelling-completed="${completed}" data-spelling-total="${required}" data-spelling-awaiting-next="${appState.awaitingNext}">
    <header class="spelling-practice-header"><button type="button" data-back-to-bank>返回生字庫</button><div class="spelling-practice-metrics"><span>本輪進度 <strong>${completed} / ${required}</strong></span><span>作答時間 <strong data-elapsed>${formatDuration(elapsedSeconds())}</strong></span></div></header>
    <div class="spelling-progress" aria-label="本輪完成 ${percentage}%"><i style="width:${percentage}%"></i></div>
    <main class="spelling-card${lengthClass}">
      <div class="spelling-meaning-row"><h1>${escapeHtml(entry.meaning)}</h1><button class="spelling-sound" type="button" data-speak aria-label="播放英文讀音">${icon("sound")}<span>聆聽</span></button></div>
      <p class="spelling-word-progress">這個生字已答對 <strong>${wordCorrect}</strong> / ${appState.frequency} 次</p>
      <form data-answer-form novalidate>
        ${answerArea(entry)}
        <div class="spelling-feedback" data-feedback data-state="${appState.awaitingNext ? "wrong" : appState.feedback}" role="status" aria-live="assertive">${feedbackHtml(entry)}</div>
        ${appState.awaitingNext ? `<button class="spelling-primary spelling-submit" type="button" data-ready-next>準備好，下一題 ${icon("arrow")}</button>` : appState.feedback === "correct" ? `<button class="spelling-primary spelling-submit" type="button" data-next-now>立即下一題 ${icon("arrow")}</button>` : `<button class="spelling-primary spelling-submit" type="submit">檢查拼寫 ${icon("check")}</button>`}
      </form>
      <p class="spelling-attempts">本輪作答 ${appState.totalAttempts} 次；只有答對才會計入完成次數。</p>
    </main>
  </section>`;
}

function completeMarkup() {
  const required = requiredCorrectTotal(appState.selectedIds.length, appState.frequency);
  const accuracy = appState.totalAttempts ? Math.round(appState.totalCorrect / appState.totalAttempts * 100) : 100;
  return `<section class="spelling-workspace spelling-workspace--complete" data-spelling-app data-spelling-complete data-spelling-total="${required}">
    <div class="spelling-complete-card"><span class="spelling-complete-card__icon">${icon("check")}</span><p class="spelling-eyebrow">ROUND COMPLETE · 本輪完成</p><h1>所有指定拼寫已完成</h1><p>你已累積答對 ${required} 次。答錯的嘗試沒有被計入完成次數。</p><div class="spelling-complete-stats"><div><strong>${appState.selectedIds.length}</strong><span>個生字／詞組</span></div><div><strong>${appState.frequency}</strong><span>每項答對次數</span></div><div><strong>${accuracy}%</strong><span>作答準確率</span></div><div><strong>${formatDuration(elapsedSeconds())}</strong><span>完成時間</span></div></div><div class="spelling-complete-actions"><button class="spelling-primary" type="button" data-repeat>${icon("replay")} 再練一次</button><button type="button" data-back-to-bank>重新選字</button><button type="button" data-open-history>查看作答記錄</button></div></div>
  </section>`;
}

function render() {
  const dashboard = document.querySelector('[data-learning-portal-root] [data-view="dashboard"]');
  if (!dashboard || !activeUser) return;
  if (appState.phase === "practice") {
    if (!appState.feedback && !appState.awaitingNext && (!currentEntry() || (appState.correctById[appState.currentId] || 0) >= appState.frequency)) {
      const next = chooseNextEntry();
      if (!next) {
        appState.phase = "complete";
        appState.completedAt ||= Date.now();
      }
      else {
        appState.currentId = next.id;
        appState.mask = [...createMask(next.word, appState.difficulty)];
        appState.draftLetters = {};
      }
    }
    const active = currentEntry();
    if (active && !appState.awaitingNext && !appState.mask.length) {
      appState.mask = [...createMask(active.word, appState.difficulty)];
    }
  }
  dashboard.innerHTML = appState.phase === "practice" ? practiceMarkup() : appState.phase === "complete" ? completeMarkup() : setupMarkup();
  saveState();
  restartElapsedTimer();
  if (appState.phase === "setup" && appState.setupView === "bank") applyWordSearch(dashboard, dashboard.querySelector("[data-word-search]")?.value || "");
  if (appState.phase === "practice") {
    scheduleCorrectAdvance();
    if (!appState.feedback && !appState.awaitingNext) requestAnimationFrame(() => (dashboard.querySelector("[data-letter-position]") || dashboard.querySelector("[data-line-answer]"))?.focus());
  }
}

function updateSetupSummary(root) {
  const selectedCount = appState.selectedIds.length;
  const required = requiredCorrectTotal(selectedCount, appState.frequency);
  const difficultyOutput = root.querySelector("[data-difficulty-output]");
  if (difficultyOutput) difficultyOutput.textContent = `${appState.difficulty}%`;
  const selectedOutput = root.querySelector("[data-selected-count]");
  if (selectedOutput) selectedOutput.textContent = `已選 ${selectedCount} / ${VOCABULARY.length}`;
  const totalOutput = root.querySelector("[data-target-total]");
  if (totalOutput) totalOutput.textContent = String(required);
  const summary = root.querySelector(".spelling-control--summary small");
  if (summary) summary.textContent = `共選 ${selectedCount} 項 × ${appState.frequency} 次`;
  const start = root.querySelector("[data-start]");
  if (start) start.disabled = selectedCount === 0;
  root.querySelectorAll("[data-frequency-preset]").forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.frequencyPreset) === appState.frequency)));
  persistAndPublish();
}

function fallbackSpeak(entry) {
  if (!entry || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(entry.word);
  utterance.lang = "en-GB";
  utterance.rate = 0.82;
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find((voice) => /^en-GB/i.test(voice.lang)) || voices.find((voice) => /^en/i.test(voice.lang)) || null;
  window.speechSynthesis.speak(utterance);
}

function normalizeAudioKey(value) {
  return String(value || "").normalize("NFKC").toLocaleLowerCase("en")
    .replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
}

function storedAudioSource(entry) {
  const manifests = [window.EDMUND_FLASHCARD_AUDIO || {}, window.EDMUND_SPELLING_AUDIO || {}];
  for (const manifest of manifests) {
    if (manifest[entry.word]) return resolveStoredAudioUrl(manifest[entry.word]);
  }
  if (!storedAudioIndex) {
    storedAudioIndex = new Map();
    manifests.forEach((manifest) => Object.entries(manifest).forEach(([term, source]) => {
      const key = normalizeAudioKey(term);
      if (key && source && !storedAudioIndex.has(key)) storedAudioIndex.set(key, source);
    }));
  }
  return resolveStoredAudioUrl(storedAudioIndex.get(normalizeAudioKey(entry.word)) || "");
}

function resolveStoredAudioUrl(source) {
  const value = String(source || "");
  if (!value || /^https?:\/\//i.test(value)) return value;
  if (value.startsWith("assets/flashcards/audio/edmund-neural/v1/")) {
    return `${FLASHCARD_PACKED_AUDIO_BASE}${value}`;
  }
  return value;
}

function speakWord(entry) {
  if (!entry) return;
  const source = storedAudioSource(entry);
  if (!source) {
    fallbackSpeak(entry);
    return;
  }
  try {
    wordAudio?.pause();
    wordAudio = new Audio(source);
    wordAudio.preload = "auto";
    wordAudio.play().catch(() => fallbackSpeak(entry));
  } catch {
    fallbackSpeak(entry);
  }
}

function speakCurrentWord() {
  speakWord(currentEntry());
}

function playTone(correct) {
  try {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    const context = new Context();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.setValueAtTime(correct ? 660 : 210, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(correct ? 880 : 145, context.currentTime + 0.16);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.23);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.24);
    oscillator.addEventListener("ended", () => context.close(), { once: true });
  } catch { /* Sound feedback is an enhancement; visual feedback remains available. */ }
}

function prepareFreshAttempt(entry) {
  clearAttemptState();
  appState.mask = [...createMask(entry.word, appState.difficulty)];
  render();
  persistAndPublish();
}

function advanceCorrect() {
  if (!appState || appState.feedback !== "correct") return;
  if (appState.advanceAt > Date.now()) {
    scheduleCorrectAdvance();
    return;
  }
  const next = VOCABULARY.find((entry) => entry.id === appState.pendingNextId) || null;
  const nextMask = next ? validMask(next.word, appState.pendingNextMask) : [];
  clearAttemptState();
  if (!next) {
    appState.phase = "complete";
    appState.completedAt ||= Date.now();
    appState.currentId = "";
    appState.mask = [];
  } else {
    appState.currentId = next.id;
    appState.mask = nextMask.length ? nextMask : [...createMask(next.word, appState.difficulty)];
  }
  render();
  persistAndPublish();
  if (appState.phase === "complete") scheduleHistorySave(true);
}

function scheduleCorrectAdvance() {
  if (correctAdvanceTimer) clearTimeout(correctAdvanceTimer);
  correctAdvanceTimer = null;
  if (!appState || appState.feedback !== "correct") return;
  correctAdvanceTimer = setTimeout(advanceCorrect, Math.max(0, appState.advanceAt - Date.now()));
}

function advanceCorrectNow() {
  if (!appState || appState.feedback !== "correct") return;
  if (correctAdvanceTimer) clearTimeout(correctAdvanceTimer);
  correctAdvanceTimer = null;
  appState.advanceAt = 0;
  advanceCorrect();
}

function handleAnswer(form) {
  const entry = currentEntry();
  if (!entry) return;
  const values = {};
  if (appState.displayMode === "line") {
    values.line = form.querySelector("[data-line-answer]")?.value || "";
    appState.draftLetters = values.line ? { line: values.line } : {};
  } else {
    form.querySelectorAll("[data-letter-position]").forEach((input) => { values[input.dataset.letterPosition] = input.value; });
    appState.draftLetters = Object.fromEntries(Object.entries(values).filter(([, value]) => String(value).trim()));
  }
  const feedback = form.querySelector("[data-feedback]");
  if (!Object.values(values).length || Object.values(values).some((value) => !String(value).trim())) {
    feedback.textContent = "請先填寫所有空格。";
    feedback.dataset.state = "warning";
    ([...form.querySelectorAll("[data-letter-position]")]
      .find((input) => !input.value.trim())
      || form.querySelector("[data-line-answer]"))?.focus();
    return;
  }
  const answer = submittedAnswer(entry, values);
  appState.totalAttempts += 1;
  const correct = appState.displayMode === "line" ? normalizeAnswer(answer) === normalizeAnswer(entry.word) : isAnswerCorrect(entry.word, values);
  appState.lastAttempt = { wordId: entry.id, answer, correct };
  appState.attemptEvents.push({ at: Date.now(), wordId: entry.id, word: entry.word, answer, correct });
  playTone(correct);
  if (!correct) {
    appState.awaitingNext = true;
    appState.feedback = "";
    render();
    persistAndPublish();
    return;
  }
  appState.correctById[entry.id] = Math.min(appState.frequency, (appState.correctById[entry.id] || 0) + 1);
  appState.totalCorrect += 1;
  const queueIndex = appState.queue.indexOf(entry.id);
  if (queueIndex >= 0) appState.queue.splice(queueIndex, 1);
  const next = chooseNextEntry(entry.id);
  appState.feedback = "correct";
  appState.awaitingNext = false;
  appState.pendingNextId = next?.id || "";
  appState.pendingNextMask = next ? [...createMask(next.word, appState.difficulty)] : [];
  // Keep correct feedback visible long enough for a second device's two-second poll.
  appState.advanceAt = Date.now() + 5000;
  render();
  persistAndPublish();
}

function startRound() {
  if (!appState.selectedIds.length) return;
  appState.phase = "practice";
  appState.correctById = Object.fromEntries(appState.selectedIds.map((id) => [id, 0]));
  appState.totalCorrect = 0;
  appState.totalAttempts = 0;
  appState.queue = buildQueue(appState.selectedIds, appState.frequency);
  appState.roundId = randomUuid();
  appState.startedAt = Date.now();
  appState.completedAt = 0;
  appState.attemptEvents = [];
  clearAttemptState();
  const first = chooseNextEntry();
  appState.currentId = first?.id || "";
  appState.mask = first ? [...createMask(first.word, appState.difficulty)] : [];
  render();
  persistAndPublish();
  scheduleHistorySave(true);
}

function returnToBank() {
  scheduleHistorySave(true);
  appState.phase = "setup";
  appState.setupView = "bank";
  appState.currentId = "";
  appState.mask = [];
  clearAttemptState();
  render();
  persistAndPublish();
}

function readyForNext() {
  const previous = currentEntry();
  if (previous && appState.queue[0] === previous.id && appState.queue.length > 1) {
    const [failed] = appState.queue.splice(0, 1);
    const destination = 1 + Math.floor(Math.random() * appState.queue.length);
    appState.queue.splice(destination, 0, failed);
  }
  const next = chooseNextEntry(previous?.id || "");
  clearAttemptState();
  if (!next) {
    appState.phase = "complete";
    appState.completedAt ||= Date.now();
    appState.currentId = "";
    appState.mask = [];
  } else {
    appState.currentId = next.id;
    appState.mask = [...createMask(next.word, appState.difficulty)];
  }
  render();
  persistAndPublish();
  if (appState.phase === "complete") scheduleHistorySave(true);
}

function applyWordSearch(root, query) {
  const needle = String(query || "").trim().toLocaleLowerCase("zh-Hant");
  root.querySelectorAll("[data-word-row]").forEach((row) => {
    const entry = VOCABULARY.find((item) => item.id === row.dataset.wordRow);
    const haystack = `${entry?.word || ""} ${entry?.meaning || ""}`.toLocaleLowerCase("zh-Hant");
    const matchesText = !needle || haystack.includes(needle);
    const mastered = row.dataset.mastered === "true";
    const matchesFilter = appState.wordFilter === "all" || (appState.wordFilter === "mastered" ? mastered : !mastered);
    row.hidden = !matchesText || !matchesFilter;
  });
}

function setWordSelection(root, id, checked) {
  const input = root.querySelector(`[data-word-select][value="${CSS.escape(id)}"]`);
  if (!input || input.checked === checked) return;
  input.checked = checked;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  root.querySelector(`[data-word-row="${CSS.escape(id)}"]`)?.setAttribute("aria-label", `${checked ? "取消選擇" : "選擇"} ${VOCABULARY.find((entry) => entry.id === id)?.word || ""}`);
}

function toggleWordSelection(root, id) {
  const input = root.querySelector(`[data-word-select][value="${CSS.escape(id)}"]`);
  if (!input) return;
  setWordSelection(root, id, !input.checked);
}

document.addEventListener("input", (event) => {
  const app = event.target.closest("[data-spelling-app]");
  if (!app || !appState) return;
  if (event.target.matches("[data-difficulty]")) {
    appState.difficulty = Number(event.target.value);
    updateSetupSummary(app);
  }
  if (event.target.matches("[data-frequency]")) {
    appState.frequency = Math.min(100, Math.max(1, Math.floor(Number(event.target.value) || 1)));
    event.target.value = String(appState.frequency);
    updateSetupSummary(app);
  }
  if (event.target.matches("[data-letter-position]")) {
    event.target.value = event.target.value.replace(/[^a-z]/gi, "").slice(-1).toLocaleLowerCase("en");
    const position = String(event.target.dataset.letterPosition);
    if (event.target.value) appState.draftLetters[position] = event.target.value;
    else delete appState.draftLetters[position];
    persistAndPublish();
    if (event.target.value) {
      const inputs = [...app.querySelectorAll("[data-letter-position]")];
      inputs[inputs.indexOf(event.target) + 1]?.focus();
    }
  }
  if (event.target.matches("[data-line-answer]")) {
    appState.draftLetters = event.target.value ? { line: event.target.value } : {};
    persistAndPublish();
  }
  if (event.target.matches("[data-word-search]")) applyWordSearch(app, event.target.value);
});

document.addEventListener("beforeinput", (event) => {
  if (event.inputType !== "deleteContentBackward" || !event.target.matches("[data-letter-position]") || event.target.value) return;
  const app = event.target.closest("[data-spelling-app]");
  const inputs = [...app.querySelectorAll("[data-letter-position]")];
  const previous = inputs[inputs.indexOf(event.target) - 1];
  if (!previous) return;
  event.preventDefault();
  previous.value = "";
  delete appState.draftLetters[String(previous.dataset.letterPosition)];
  persistAndPublish();
  previous.focus();
});

document.addEventListener("keydown", (event) => {
  const app = event.target.closest("[data-spelling-app]");
  if (!app || !appState) return;
  if (event.target.matches("[data-letter-position]") && event.key === "Backspace" && !event.target.value) {
    const inputs = [...app.querySelectorAll("[data-letter-position]")];
    const previous = inputs[inputs.indexOf(event.target) - 1];
    if (previous) {
      event.preventDefault();
      previous.value = "";
      delete appState.draftLetters[String(previous.dataset.letterPosition)];
      persistAndPublish();
      previous.focus();
    }
  }
  const row = event.target.closest("[data-word-row]");
  if (row && ["Enter", " "].includes(event.key) && !event.target.closest("button,input,label")) {
    event.preventDefault();
    toggleWordSelection(app, row.dataset.wordRow);
  }
});

document.addEventListener("change", (event) => {
  const app = event.target.closest("[data-spelling-app]");
  if (!app) return;
  if (event.target.matches("[data-word-filter]")) {
    appState.wordFilter = event.target.value;
    applyWordSearch(app, app.querySelector("[data-word-search]")?.value || "");
    persistAndPublish();
    return;
  }
  if (!event.target.matches("[data-word-select]")) return;
  const selected = new Set(appState.selectedIds);
  if (event.target.checked) selected.add(event.target.value);
  else selected.delete(event.target.value);
  appState.selectedIds = VOCABULARY.filter((entry) => selected.has(entry.id)).map((entry) => entry.id);
  updateSetupSummary(app);
});

function rowAtPoint(x, y) {
  return document.elementFromPoint(x, y)?.closest?.("[data-word-row]") || null;
}

function activateSelectionGesture(row, pointerId, target, startedByTouch) {
  selectionGesture = { pointerId, target, visited: new Set(), active: true, moved: false, startedByTouch };
  row.setPointerCapture?.(pointerId);
  const app = row.closest("[data-spelling-app]");
  selectionGesture.visited.add(row.dataset.wordRow);
  setWordSelection(app, row.dataset.wordRow, target);
}

document.addEventListener("pointerdown", (event) => {
  const row = event.target.closest?.("[data-word-row]");
  if (!row || event.target.closest("button,input,label") || (event.pointerType === "mouse" && event.button !== 0)) return;
  const input = row.querySelector("[data-word-select]");
  if (event.pointerType === "touch") {
    const timer = setTimeout(() => activateSelectionGesture(row, event.pointerId, !input.checked, true), 360);
    selectionGesture = { pointerId: event.pointerId, pending: true, timer, startX: event.clientX, startY: event.clientY };
  } else activateSelectionGesture(row, event.pointerId, !input.checked, false);
});

document.addEventListener("pointermove", (event) => {
  if (!selectionGesture || selectionGesture.pointerId !== event.pointerId) return;
  if (selectionGesture.pending) {
    if (Math.hypot(event.clientX - selectionGesture.startX, event.clientY - selectionGesture.startY) > 12) {
      clearTimeout(selectionGesture.timer);
      selectionGesture = null;
    }
    return;
  }
  if (!selectionGesture.active) return;
  event.preventDefault();
  selectionGesture.moved = true;
  const row = rowAtPoint(event.clientX, event.clientY);
  if (!row || selectionGesture.visited.has(row.dataset.wordRow)) return;
  selectionGesture.visited.add(row.dataset.wordRow);
  setWordSelection(row.closest("[data-spelling-app]"), row.dataset.wordRow, selectionGesture.target);
});

function endSelectionGesture(event) {
  if (!selectionGesture || selectionGesture.pointerId !== event.pointerId) return;
  if (selectionGesture.timer) clearTimeout(selectionGesture.timer);
  if (selectionGesture.active) {
    suppressRowClick = true;
    setTimeout(() => { suppressRowClick = false; }, 80);
  }
  selectionGesture = null;
}

document.addEventListener("pointerup", endSelectionGesture);
document.addEventListener("pointercancel", endSelectionGesture);

document.addEventListener("submit", (event) => {
  if (!event.target.matches("[data-answer-form]")) return;
  event.preventDefault();
  handleAnswer(event.target);
});

document.addEventListener("click", (event) => {
  const app = event.target.closest("[data-spelling-app]");
  if (!app || !appState) return;
  const libraryButton = event.target.closest("[data-library-id]");
  if (libraryButton) {
    appState.libraryId = LIBRARY_IDS.has(libraryButton.dataset.libraryId) ? libraryButton.dataset.libraryId : "core";
    const groups = (SELECTION_CATALOG.libraries || []).find((library) => library.id === appState.libraryId)?.groups || [];
    appState.libraryGroupId = groups[0]?.id || "";
    appState.librarySectionId = "";
    render();
    persistAndPublish();
    return;
  }
  const groupButton = event.target.closest("[data-library-group]");
  if (groupButton) {
    appState.libraryGroupId = groupButton.dataset.libraryGroup;
    appState.librarySectionId = "";
    render();
    persistAndPublish();
    return;
  }
  const sectionButton = event.target.closest("[data-library-section]");
  if (sectionButton) {
    appState.librarySectionId = sectionButton.dataset.librarySection;
    render();
    persistAndPublish();
    return;
  }
  if (event.target.closest("[data-library-section-back]")) {
    appState.librarySectionId = "";
    render();
    persistAndPublish();
    return;
  }
  const deckButton = event.target.closest("[data-deck-id]");
  if (deckButton) {
    const deck = CATALOG_DECKS.find((item) => item.id === deckButton.dataset.deckId);
    if (!deck) return;
    const selectedDecks = new Set(appState.selectedDeckIds);
    const selectedWords = new Set(appState.selectedIds);
    if (selectedDecks.has(deck.id)) {
      selectedDecks.delete(deck.id);
      deck.entryIds.forEach((id) => selectedWords.delete(id));
    } else {
      selectedDecks.add(deck.id);
      deck.entryIds.forEach((id) => selectedWords.add(id));
    }
    appState.selectedDeckIds = [...selectedDecks];
    appState.selectedIds = [...selectedWords];
    render();
    persistAndPublish();
    return;
  }
  if (event.target.closest("[data-select-visible-decks]")) {
    const groupDecks = CATALOG_DECKS.filter((deck) => deck.libraryId === appState.libraryId && deck.groupId === appState.libraryGroupId && (!appState.librarySectionId || deck.sectionId === appState.librarySectionId));
    const selectedDecks = new Set(appState.selectedDeckIds);
    const selectedWords = new Set(appState.selectedIds);
    groupDecks.forEach((deck) => {
      selectedDecks.add(deck.id);
      deck.entryIds.forEach((id) => selectedWords.add(id));
    });
    appState.selectedDeckIds = [...selectedDecks];
    appState.selectedIds = [...selectedWords];
    render();
    persistAndPublish();
    return;
  }
  if (event.target.closest("[data-clear-library-decks]")) {
    const libraryDecks = CATALOG_DECKS.filter((deck) => deck.libraryId === appState.libraryId);
    const libraryDeckIds = new Set(libraryDecks.map((deck) => deck.id));
    const libraryEntryIds = new Set(libraryDecks.flatMap((deck) => deck.entryIds));
    appState.selectedDeckIds = appState.selectedDeckIds.filter((id) => !libraryDeckIds.has(id));
    appState.selectedIds = appState.selectedIds.filter((id) => !libraryEntryIds.has(id));
    render();
    persistAndPublish();
    return;
  }
  const setupView = event.target.closest("[data-setup-view]");
  if (setupView) {
    appState.setupView = setupView.dataset.setupView;
    render();
    persistAndPublish();
    if (appState.setupView === "history") loadHistory();
    return;
  }
  const displayMode = event.target.closest("[data-display-mode]");
  if (displayMode) {
    appState.displayMode = displayMode.dataset.displayMode === "line" ? "line" : "slots";
    render();
    persistAndPublish();
    return;
  }
  const preset = event.target.closest("[data-frequency-preset]");
  if (preset) {
    appState.frequency = Number(preset.dataset.frequencyPreset);
    app.querySelector("[data-frequency]").value = String(appState.frequency);
    updateSetupSummary(app);
  }
  if (event.target.closest("[data-select-all]")) {
    const selected = new Set(appState.selectedIds);
    activeLibraryEntries().forEach((entry) => selected.add(entry.id));
    appState.selectedIds = [...selected];
    app.querySelectorAll("[data-word-select]").forEach((input) => { input.checked = true; });
    updateSetupSummary(app);
  }
  if (event.target.closest("[data-deselect-all]")) {
    const activeIds = new Set(activeLibraryEntries().map((entry) => entry.id));
    appState.selectedIds = appState.selectedIds.filter((id) => !activeIds.has(id));
    app.querySelectorAll("[data-word-select]").forEach((input) => { input.checked = false; });
    updateSetupSummary(app);
  }
  if (event.target.closest("[data-start]")) startRound();
  if (event.target.closest("[data-speak]")) speakCurrentWord();
  const rowSound = event.target.closest("[data-speak-word]");
  if (rowSound) speakWord(VOCABULARY.find((entry) => entry.id === rowSound.dataset.speakWord));
  const row = event.target.closest("[data-word-row]");
  if (row && !suppressRowClick && !event.target.closest("button,input,label")) toggleWordSelection(app, row.dataset.wordRow);
  if (event.target.closest("[data-ready-next]")) readyForNext();
  if (event.target.closest("[data-next-now]")) advanceCorrectNow();
  if (event.target.closest("[data-back-to-bank]")) returnToBank();
  if (event.target.closest("[data-repeat]")) startRound();
  if (event.target.closest("[data-refresh-history]")) loadHistory();
  if (event.target.closest("[data-open-history]")) {
    appState.phase = "setup";
    appState.setupView = "history";
    render();
    persistAndPublish();
    loadHistory();
  }
});

const classroomLive = createClassroomLiveSync({
  system: "spelling",
  context: () => {
    const session = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.();
    return {
      owner: activeUser?.id || null,
      token: session?.token || null,
      scope: activeUser ? SYNC_SCOPE : null,
      active: Boolean(activeUser && appState && session?.token)
    };
  },
  rpc: (name, args) => window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc(name, args),
  read: () => appState ? { schema: SYNC_SCHEMA_VERSION, state: appState } : null,
  apply: (payload) => {
    if (payload?.schema !== SYNC_SCHEMA_VERSION || !payload.state || !activeUser) return;
    appState = normalizeState(payload.state);
    saveState();
    render();
  }
});

function activate(user) {
  if (!user?.id) return;
  if (correctAdvanceTimer) clearTimeout(correctAdvanceTimer);
  correctAdvanceTimer = null;
  activeUser = { id: String(user.id), name: String(user.name || "學生") };
  appState = readState(activeUser.id);
  render();
  classroomLive.refresh();
  loadHistory();
}

window.addEventListener("edmund:learning-portal-session", (event) => {
  if (event.detail?.portalId !== PORTAL_ID) return;
  if (event.detail.user) activate(event.detail.user);
  else {
    if (correctAdvanceTimer) clearTimeout(correctAdvanceTimer);
    correctAdvanceTimer = null;
    if (elapsedTimer) clearInterval(elapsedTimer);
    elapsedTimer = null;
    activeUser = null;
    appState = null;
    classroomLive.refresh();
  }
});

const existing = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.();
if (existing?.portalId === PORTAL_ID && existing.user) activate(existing.user);

// Local-only browser QA hook. It cannot bypass authentication on production.
if (["127.0.0.1", "localhost"].includes(window.location.hostname)
  && new URLSearchParams(window.location.search).get("spellingQa") === "1") {
  window.addEventListener("load", () => {
    document.querySelector('[data-learning-portal-root] [data-view="login"]')?.setAttribute("hidden", "");
    document.querySelector('[data-learning-portal-root] [data-view="dashboard"]')?.removeAttribute("hidden");
    activate({ id: "spelling-qa-student", name: "QA Student" });
  }, { once: true });
}
