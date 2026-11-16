import {
  VOCABULARY,
  characterLabel,
  createMask,
  isAnswerCorrect,
  requiredCorrectTotal
} from "./spelling-practice-core.mjs";

const PORTAL_ID = "spelling";
const STORAGE_VERSION = "v1";
let appState = null;
let activeUser = null;

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
    selectedIds: VOCABULARY.map((entry) => entry.id),
    difficulty: 50,
    frequency: 2,
    phase: "setup",
    correctById: {},
    totalCorrect: 0,
    totalAttempts: 0,
    currentId: "",
    mask: []
  };
}

function normalizeState(candidate) {
  const fallback = defaultState();
  if (!candidate || typeof candidate !== "object") return fallback;
  const validIds = new Set(VOCABULARY.map((entry) => entry.id));
  const selectedIds = Array.isArray(candidate.selectedIds)
    ? candidate.selectedIds.filter((id) => validIds.has(id))
    : fallback.selectedIds;
  const difficulty = Math.min(100, Math.max(10, Math.round((Number(candidate.difficulty) || 50) / 10) * 10));
  const frequency = Math.min(100, Math.max(1, Math.floor(Number(candidate.frequency) || 2)));
  const correctById = {};
  selectedIds.forEach((id) => {
    correctById[id] = Math.min(frequency, Math.max(0, Math.floor(Number(candidate.correctById?.[id]) || 0)));
  });
  const totalCorrect = Object.values(correctById).reduce((sum, value) => sum + value, 0);
  const phase = candidate.phase === "practice" && totalCorrect < requiredCorrectTotal(selectedIds.length, frequency)
    ? "practice"
    : candidate.phase === "complete" && totalCorrect >= requiredCorrectTotal(selectedIds.length, frequency)
      ? "complete"
      : "setup";
  return {
    selectedIds,
    difficulty,
    frequency,
    phase,
    correctById,
    totalCorrect,
    totalAttempts: Math.max(totalCorrect, Math.floor(Number(candidate.totalAttempts) || totalCorrect)),
    currentId: validIds.has(candidate.currentId) ? candidate.currentId : "",
    mask: []
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

function setupMarkup() {
  const rows = VOCABULARY.map((entry) => {
    const selected = appState.selectedIds.includes(entry.id);
    return `<tr>
      <td><label class="spelling-check"><input type="checkbox" value="${entry.id}" data-word-select ${selected ? "checked" : ""}><span aria-hidden="true"></span><span class="sr-only">選擇 ${escapeHtml(entry.word)}</span></label></td>
      <td><strong>${escapeHtml(entry.word)}</strong></td>
      <td class="spelling-characters">${escapeHtml(characterLabel(entry.word))}</td>
      <td>${escapeHtml(entry.meaning)}</td>
    </tr>`;
  }).join("");
  const total = requiredCorrectTotal(appState.selectedIds.length, appState.frequency);
  return `<section class="spelling-workspace" data-spelling-app>
    <header class="spelling-hero">
      <div><p class="spelling-eyebrow">SPELLING LAB · 拼寫實驗室</p><h1>看、聽、拆字，再準確拼寫</h1><p>選擇生字、設定測試比例與完成次數。每次出題都會重新隨機抽走字母。</p></div>
      <div class="spelling-hero__count"><strong>${VOCABULARY.length}</strong><span>個試行生字</span></div>
    </header>
    <section class="spelling-controls" aria-label="練習設定">
      <div class="spelling-control spelling-control--difficulty">
        <label for="spelling-difficulty">測試難度</label>
        <div class="spelling-range-row"><input id="spelling-difficulty" data-difficulty type="range" min="10" max="100" step="10" value="${appState.difficulty}"><output data-difficulty-output>${appState.difficulty}%</output></div>
        <small>按英文字母總數向上取整；空格不計算。</small>
      </div>
      <div class="spelling-control">
        <label for="spelling-frequency">每個生字需答對</label>
        <div class="spelling-frequency-row">
          <button type="button" data-frequency-preset="2" aria-pressed="${appState.frequency === 2}">2 次</button>
          <button type="button" data-frequency-preset="3" aria-pressed="${appState.frequency === 3}">3 次</button>
          <label><span>自訂</span><input id="spelling-frequency" data-frequency type="number" min="1" max="100" inputmode="numeric" value="${appState.frequency}"><span>次</span></label>
        </div>
        <small>答錯不會扣除或增加完成次數。</small>
      </div>
      <div class="spelling-control spelling-control--summary">
        <span>本輪目標</span><strong data-target-total>${total}</strong><small>共選 ${appState.selectedIds.length} 字 × ${appState.frequency} 次</small>
        <button class="spelling-primary" type="button" data-start ${appState.selectedIds.length ? "" : "disabled"}>開始練習 ${icon("arrow")}</button>
      </div>
    </section>
    <section class="spelling-bank">
      <div class="spelling-bank__toolbar"><div><p class="spelling-eyebrow">WORD BANK · 生字庫</p><h2>選擇本輪生字</h2></div><div class="spelling-bank__actions"><span data-selected-count>已選 ${appState.selectedIds.length} / ${VOCABULARY.length}</span><button type="button" data-select-all>全選</button><button type="button" data-deselect-all>取消全選</button></div></div>
      <div class="spelling-table-wrap"><table><thead><tr><th scope="col">選擇</th><th scope="col">生字／詞組</th><th scope="col">字母拆分</th><th scope="col">繁體中文意思</th></tr></thead><tbody>${rows}</tbody></table></div>
    </section>
  </section>`;
}

function renderMask(entry) {
  const blanks = new Set(appState.mask);
  return [...entry.word].map((character, position) => {
    if (character === " ") return '<span class="spelling-slot spelling-slot--space" aria-hidden="true"></span>';
    if (!blanks.has(position)) return `<span class="spelling-slot spelling-slot--given">${escapeHtml(character)}</span>`;
    return `<label class="spelling-slot spelling-slot--blank"><span class="sr-only">輸入第 ${position + 1} 個字母</span><input data-letter-position="${position}" maxlength="1" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="輸入第 ${position + 1} 個字母"></label>`;
  }).join("");
}

function practiceMarkup() {
  const entry = currentEntry();
  const required = requiredCorrectTotal(appState.selectedIds.length, appState.frequency);
  const completed = appState.totalCorrect;
  const percentage = required ? Math.round(completed / required * 100) : 0;
  const wordCorrect = appState.correctById[entry.id] || 0;
  return `<section class="spelling-workspace spelling-workspace--practice" data-spelling-app>
    <header class="spelling-practice-header"><button type="button" data-back-to-bank>返回生字庫</button><div><span>本輪進度</span><strong>${completed} / ${required}</strong></div></header>
    <div class="spelling-progress" aria-label="本輪完成 ${percentage}%"><i style="width:${percentage}%"></i></div>
    <main class="spelling-card">
      <p class="spelling-eyebrow">LISTEN · COMPLETE · CHECK</p>
      <div class="spelling-meaning-row"><h1>${escapeHtml(entry.meaning)}</h1><button class="spelling-sound" type="button" data-speak aria-label="播放英文讀音">${icon("sound")}<span>聆聽</span></button></div>
      <p class="spelling-word-progress">這個生字已答對 <strong>${wordCorrect}</strong> / ${appState.frequency} 次</p>
      <form data-answer-form novalidate>
        <div class="spelling-slots" role="group" aria-label="填寫缺少的英文字母">${renderMask(entry)}</div>
        <p class="spelling-feedback" data-feedback role="status" aria-live="assertive"></p>
        <button class="spelling-primary spelling-submit" type="submit">檢查拼寫 ${icon("check")}</button>
      </form>
      <p class="spelling-attempts">本輪作答 ${appState.totalAttempts} 次；只有答對才會計入完成次數。</p>
    </main>
  </section>`;
}

function completeMarkup() {
  const required = requiredCorrectTotal(appState.selectedIds.length, appState.frequency);
  const accuracy = appState.totalAttempts ? Math.round(appState.totalCorrect / appState.totalAttempts * 100) : 100;
  return `<section class="spelling-workspace spelling-workspace--complete" data-spelling-app>
    <div class="spelling-complete-card"><span class="spelling-complete-card__icon">${icon("check")}</span><p class="spelling-eyebrow">ROUND COMPLETE · 本輪完成</p><h1>所有指定拼寫已完成</h1><p>你已累積答對 ${required} 次。答錯的嘗試沒有被計入完成次數。</p><div class="spelling-complete-stats"><div><strong>${appState.selectedIds.length}</strong><span>個生字</span></div><div><strong>${appState.frequency}</strong><span>每字答對次數</span></div><div><strong>${accuracy}%</strong><span>作答準確率</span></div></div><div class="spelling-complete-actions"><button class="spelling-primary" type="button" data-repeat>${icon("replay")} 再練一次</button><button type="button" data-back-to-bank>重新選字</button></div></div>
  </section>`;
}

function render() {
  const dashboard = document.querySelector('[data-learning-portal-root] [data-view="dashboard"]');
  if (!dashboard || !activeUser) return;
  if (appState.phase === "practice") {
    if (!currentEntry() || (appState.correctById[appState.currentId] || 0) >= appState.frequency) {
      const next = chooseNextEntry();
      if (!next) appState.phase = "complete";
      else {
        appState.currentId = next.id;
        appState.mask = [...createMask(next.word, appState.difficulty)];
      }
    }
  }
  dashboard.innerHTML = appState.phase === "practice" ? practiceMarkup() : appState.phase === "complete" ? completeMarkup() : setupMarkup();
  saveState();
  if (appState.phase === "practice") requestAnimationFrame(() => dashboard.querySelector("[data-letter-position]")?.focus());
}

function updateSetupSummary(root) {
  const selectedCount = appState.selectedIds.length;
  const required = requiredCorrectTotal(selectedCount, appState.frequency);
  root.querySelector("[data-difficulty-output]").textContent = `${appState.difficulty}%`;
  root.querySelector("[data-selected-count]").textContent = `已選 ${selectedCount} / ${VOCABULARY.length}`;
  root.querySelector("[data-target-total]").textContent = String(required);
  root.querySelector(".spelling-control--summary small").textContent = `共選 ${selectedCount} 字 × ${appState.frequency} 次`;
  root.querySelector("[data-start]").disabled = selectedCount === 0;
  root.querySelectorAll("[data-frequency-preset]").forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.frequencyPreset) === appState.frequency)));
  saveState();
}

function speakCurrentWord() {
  const entry = currentEntry();
  if (!entry || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(entry.word);
  utterance.lang = "en-GB";
  utterance.rate = 0.82;
  const voices = window.speechSynthesis.getVoices();
  utterance.voice = voices.find((voice) => /^en-GB/i.test(voice.lang)) || voices.find((voice) => /^en/i.test(voice.lang)) || null;
  window.speechSynthesis.speak(utterance);
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
  appState.mask = [...createMask(entry.word, appState.difficulty)];
  saveState();
  render();
}

function handleAnswer(form) {
  const entry = currentEntry();
  if (!entry) return;
  const values = {};
  form.querySelectorAll("[data-letter-position]").forEach((input) => { values[input.dataset.letterPosition] = input.value; });
  const feedback = form.querySelector("[data-feedback]");
  if (Object.values(values).some((value) => !String(value).trim())) {
    feedback.textContent = "請先填寫所有空格。";
    feedback.dataset.state = "warning";
    [...form.querySelectorAll("[data-letter-position]")]
      .find((input) => !input.value.trim())
      ?.focus();
    return;
  }
  appState.totalAttempts += 1;
  const correct = isAnswerCorrect(entry.word, values);
  playTone(correct);
  if (!correct) {
    feedback.textContent = "未完全正確。這次不計入完成次數，正在重新抽選字母。";
    feedback.dataset.state = "wrong";
    saveState();
    setTimeout(() => prepareFreshAttempt(entry), 950);
    return;
  }
  appState.correctById[entry.id] = Math.min(appState.frequency, (appState.correctById[entry.id] || 0) + 1);
  appState.totalCorrect += 1;
  feedback.textContent = "拼寫正確！已計入一次。";
  feedback.dataset.state = "correct";
  saveState();
  setTimeout(() => {
    const next = chooseNextEntry(entry.id);
    if (!next) {
      appState.phase = "complete";
      appState.currentId = "";
      appState.mask = [];
    } else {
      appState.currentId = next.id;
      appState.mask = [...createMask(next.word, appState.difficulty)];
    }
    render();
  }, 760);
}

function startRound() {
  if (!appState.selectedIds.length) return;
  appState.phase = "practice";
  appState.correctById = Object.fromEntries(appState.selectedIds.map((id) => [id, 0]));
  appState.totalCorrect = 0;
  appState.totalAttempts = 0;
  const first = chooseNextEntry();
  appState.currentId = first?.id || "";
  appState.mask = first ? [...createMask(first.word, appState.difficulty)] : [];
  render();
}

function returnToBank() {
  appState.phase = "setup";
  appState.currentId = "";
  appState.mask = [];
  render();
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
    if (event.target.value) {
      const inputs = [...app.querySelectorAll("[data-letter-position]")];
      inputs[inputs.indexOf(event.target) + 1]?.focus();
    }
  }
});

document.addEventListener("change", (event) => {
  const app = event.target.closest("[data-spelling-app]");
  if (!app || !event.target.matches("[data-word-select]")) return;
  const selected = new Set(appState.selectedIds);
  if (event.target.checked) selected.add(event.target.value);
  else selected.delete(event.target.value);
  appState.selectedIds = VOCABULARY.filter((entry) => selected.has(entry.id)).map((entry) => entry.id);
  updateSetupSummary(app);
});

document.addEventListener("submit", (event) => {
  if (!event.target.matches("[data-answer-form]")) return;
  event.preventDefault();
  handleAnswer(event.target);
});

document.addEventListener("click", (event) => {
  const app = event.target.closest("[data-spelling-app]");
  if (!app || !appState) return;
  const preset = event.target.closest("[data-frequency-preset]");
  if (preset) {
    appState.frequency = Number(preset.dataset.frequencyPreset);
    app.querySelector("[data-frequency]").value = String(appState.frequency);
    updateSetupSummary(app);
  }
  if (event.target.closest("[data-select-all]")) {
    appState.selectedIds = VOCABULARY.map((entry) => entry.id);
    app.querySelectorAll("[data-word-select]").forEach((input) => { input.checked = true; });
    updateSetupSummary(app);
  }
  if (event.target.closest("[data-deselect-all]")) {
    appState.selectedIds = [];
    app.querySelectorAll("[data-word-select]").forEach((input) => { input.checked = false; });
    updateSetupSummary(app);
  }
  if (event.target.closest("[data-start]")) startRound();
  if (event.target.closest("[data-speak]")) speakCurrentWord();
  if (event.target.closest("[data-back-to-bank]")) returnToBank();
  if (event.target.closest("[data-repeat]")) startRound();
});

function activate(user) {
  if (!user?.id) return;
  activeUser = { id: String(user.id), name: String(user.name || "學生") };
  appState = readState(activeUser.id);
  render();
}

window.addEventListener("edmund:learning-portal-session", (event) => {
  if (event.detail?.portalId !== PORTAL_ID) return;
  if (event.detail.user) activate(event.detail.user);
  else {
    activeUser = null;
    appState = null;
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
