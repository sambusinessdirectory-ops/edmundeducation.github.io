window.__EDMUND_LIAISON_LOOP_V2__ = true;

const { questions, LESSON_STEPS } = await import("./liaison.mjs?bank=20261118-loop2");
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const SESSION_KEY = "edmund-liaison-session-v1";
const PROGRESS_PREFIX = "edmund-liaison-pilot-progress-v2:";
const localPreview = ["127.0.0.1", "localhost"].includes(window.location.hostname)
  && new URLSearchParams(window.location.search).get("preview") === "1";
let authGeneration = 0;

const state = {
  user: null,
  token: "",
  completed: new Set(),
  reviews: new Map(),
  lessons: new Map(),
  recording: null
};

const views = Object.fromEntries($$("[data-view]").map(view => [view.dataset.view, view]));

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
}

function normalizeWord(value) {
  return String(value || "").toLowerCase().replace(/[’]/g, "'").replace(/[^a-z']/g, "");
}

function wordsIn(value) {
  return String(value || "").match(/[A-Za-z]+(?:[’'][A-Za-z]+)?/g) || [];
}

function focusParts(focus) {
  return String(focus).split("+").map(part => part.trim()).filter(Boolean);
}

function lessonState(question) {
  if (!state.lessons.has(question.id)) {
    const completed = state.completed.has(question.id);
    state.lessons.set(question.id, {
      step: completed ? 6 : 0,
      highest: completed ? 6 : 0,
      done: new Set(completed ? LESSON_STEPS.map((_, index) => index) : []),
      predicted: false,
      audioHeard: false,
      spotted: false,
      heardVersions: new Set(),
      buildChoice: null,
      imitates: new Set(),
      transferChoice: null,
      transferCorrect: completed,
      recordingResult: null,
      recordingUrl: "",
      recordingFallback: false
    });
  }
  return state.lessons.get(question.id);
}

function showView(name) {
  Object.entries(views).forEach(([id, view]) => { view.hidden = id !== name; });
  const loggedIn = Boolean(state.user && state.token);
  $("[data-student]").hidden = !loggedIn;
  $("[data-logout]").hidden = !loggedIn;
  $("[data-account-status]").textContent = loggedIn ? "已登入" : "學生帳戶";
  if (loggedIn) $("[data-student]").textContent = state.user.name;
}

async function rpc(name, args) {
  const config = window.EDMUND_SUPABASE || {};
  if (!config.url || !config.anonKey) throw Error("登入服務暫時未能載入，請重新整理頁面。");
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  let response;
  try {
    response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: { apikey: config.anonKey, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
      credentials: "omit",
      signal: controller.signal
    });
  } catch (error) {
    if (error?.name === "AbortError") throw Error("登入服務回應逾時，請再試一次。");
    throw Error("登入服務暫時未能連接，請檢查網絡後重試。");
  } finally {
    window.clearTimeout(timeout);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw Error(data?.message || "登入服務暫時未能連接。");
  return Array.isArray(data) ? data[0] : data;
}

function progressKey() {
  return `${PROGRESS_PREFIX}${state.user?.id || "student"}`;
}

function saveProgress() {
  if (!state.user) return;
  const lessons = [...state.lessons.entries()].map(([id, progress]) => [id, {
    step: progress.step,
    highest: progress.highest,
    done: [...progress.done],
    predicted: progress.predicted,
    audioHeard: progress.audioHeard,
    spotted: progress.spotted,
    heardVersions: [...progress.heardVersions],
    buildChoice: progress.buildChoice,
    imitates: [...progress.imitates],
    transferChoice: progress.transferChoice,
    transferCorrect: progress.transferCorrect,
    recordingResult: progress.recordingResult,
    recordingFallback: progress.recordingFallback
  }]);
  const payload = { completed: [...state.completed], reviews: [...state.reviews.entries()], lessons };
  try { localStorage.setItem(progressKey(), JSON.stringify(payload)); } catch { /* Progress can remain in memory. */ }
}

function loadProgress() {
  state.completed.clear();
  state.reviews.clear();
  state.lessons.clear();
  if (!state.user) return;
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey()) || "null");
    for (const id of saved?.completed || []) {
      if (questions.some(question => question.id === Number(id))) state.completed.add(Number(id));
    }
    for (const [id, review] of saved?.reviews || []) {
      if (questions.some(question => question.id === Number(id)) && review?.due) state.reviews.set(Number(id), review);
    }
    for (const [id, draft] of saved?.lessons || []) {
      const numericId = Number(id);
      if (!questions.some(question => question.id === numericId) || !draft) continue;
      const step = Math.max(0, Math.min(LESSON_STEPS.length - 1, Number(draft.step) || 0));
      const highest = Math.max(step, Math.min(LESSON_STEPS.length - 1, Number(draft.highest) || 0));
      state.lessons.set(numericId, {
        step,
        highest,
        done: new Set((draft.done || []).map(Number).filter(index => index >= 0 && index < LESSON_STEPS.length)),
        predicted: Boolean(draft.predicted),
        audioHeard: Boolean(draft.audioHeard),
        spotted: Boolean(draft.spotted),
        heardVersions: new Set(draft.heardVersions || []),
        buildChoice: Number.isInteger(draft.buildChoice) ? draft.buildChoice : null,
        imitates: new Set((draft.imitates || []).map(Number)),
        transferChoice: Number.isInteger(draft.transferChoice) ? draft.transferChoice : null,
        transferCorrect: Boolean(draft.transferCorrect),
        recordingResult: draft.recordingResult || null,
        recordingUrl: "",
        recordingFallback: Boolean(draft.recordingFallback)
      });
    }
  } catch { /* Invalid drafts are ignored. */ }
}

function remember(row, token) {
  state.user = { id: String(row.id || ""), name: String(row.name || "Student"), role: "student" };
  state.token = String(token || row.session_token || "");
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...state.user, token: state.token })); } catch { /* Session continues in memory. */ }
  try { window.EdmundSystemNav?.rememberStudentSession?.({ ...state.user, token: state.token }); } catch { /* Shared navigation is optional. */ }
  loadProgress();
  renderAllQuestions();
}

function stopRecording({ discard = false } = {}) {
  const active = state.recording;
  if (!active) return;
  window.clearTimeout(active.timeout);
  active.recognition?.stop?.();
  if (active.recorder?.state === "recording") active.recorder.stop();
  active.stream?.getTracks().forEach(track => track.stop());
  if (discard) state.recording = null;
}

function forget() {
  authGeneration += 1;
  stopRecording({ discard: true });
  state.user = null;
  state.token = "";
  state.completed.clear();
  state.reviews.clear();
  state.lessons.clear();
  try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Ignore storage failures. */ }
  try { window.EdmundSystemNav?.forgetStudentSession?.(); } catch { /* Shared navigation is optional. */ }
  showView("login");
}

async function restore() {
  const generation = authGeneration;
  let shared = null;
  let own = null;
  try { shared = window.EdmundSystemNav?.getStudentSession?.(); } catch { /* No shared session. */ }
  try { own = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { /* No local session. */ }
  const candidate = shared?.role === "student" ? shared : own?.role === "student" ? own : null;
  if (!candidate?.token) return false;
  const row = await rpc("flashcard_student_session_profile", { p_token: String(candidate.token) });
  if (generation !== authGeneration) return false;
  if (!row?.session_token || !row?.name) throw Error("登入時段已失效，請重新登入。");
  remember(row, row.session_token);
  showView("practice");
  return true;
}

function chooseVoice(accent = "en-GB") {
  const voices = speechSynthesis.getVoices();
  return voices.find(voice => voice.lang.toLowerCase() === accent.toLowerCase())
    || voices.find(voice => voice.lang.toLowerCase().startsWith(accent.slice(0, 2).toLowerCase()))
    || voices.find(voice => /^en-/i.test(voice.lang))
    || null;
}

function speak(text, { rate = .82, accent = "en-GB", pitch = 1 } = {}) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(String(text));
  utterance.lang = accent;
  utterance.rate = rate;
  utterance.pitch = pitch;
  const voice = chooseVoice(accent);
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

function brokenVersion(question, phrase = question.phrase) {
  const parts = focusParts(question.focus);
  if (parts.length !== 2) return String(phrase).replace(new RegExp(`\\b${parts[0]}\\b`, "i"), `${parts[0]}.`);
  const pattern = new RegExp(`\\b${parts[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+${parts[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  return String(phrase).replace(pattern, `${parts[0]}. ${parts[1]}`);
}

function meaningOptions(question) {
  const distractors = [questions[question.id % questions.length].meaning, questions[(question.id + 7) % questions.length].meaning];
  const options = [{ text: question.meaning, correct: true }, ...distractors.map(text => ({ text, correct: false }))];
  const shift = question.id % options.length;
  return [...options.slice(shift), ...options.slice(0, shift)];
}

function predictOptions(question) {
  const tokens = wordsIn(question.phrase);
  const target = question.focus;
  const parts = focusParts(target);
  const alternatives = parts.length === 2
    ? tokens.slice(0, -1).map((word, index) => `${word} + ${tokens[index + 1]}`)
    : tokens;
  const unique = [target, ...alternatives].filter((value, index, values) => {
    const key = value.split("+").map(normalizeWord).join("+");
    return values.findIndex(candidate => candidate.split("+").map(normalizeWord).join("+") === key) === index;
  });
  while (unique.length < 3) unique.push(unique.length === 1 ? "句子結尾 + 停頓" : "沒有需要處理的位置");
  const options = unique.slice(0, 3).map(text => ({ text, correct: text === target }));
  const shift = question.id % options.length;
  return [...options.slice(shift), ...options.slice(0, shift)];
}

function spotTarget(question) {
  const tokens = wordsIn(question.phrase);
  const parts = focusParts(question.focus).map(normalizeWord);
  if (parts.length === 1) return { mode: "word", tokens, index: tokens.findIndex(token => normalizeWord(token) === parts[0]) };
  const index = tokens.findIndex((token, tokenIndex) => normalizeWord(token) === parts[0] && normalizeWord(tokens[tokenIndex + 1]) === parts[1]);
  return { mode: "boundary", tokens, index };
}

function stageIntro(number, title, text) {
  return `<header class="stage-intro"><span>STAGE ${number + 1} / ${LESSON_STEPS.length}</span><h4>${escapeHtml(title)}</h4><p>${escapeHtml(text)}</p></header>`;
}

function addNextButton(root, question, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "stage-next";
  button.textContent = label;
  button.addEventListener("click", () => {
    const progress = lessonState(question);
    progress.step = Math.min(LESSON_STEPS.length - 1, progress.step + 1);
    progress.highest = Math.max(progress.highest, progress.step);
    renderLessonStage(root.closest(".question-card"), question);
  });
  root.append(button);
}

function finishStage(card, question) {
  const progress = lessonState(question);
  progress.done.add(progress.step);
  progress.highest = Math.max(progress.highest, Math.min(LESSON_STEPS.length - 1, progress.step + 1));
  renderLessonStage(card, question);
}

function renderMeaning(root, card, question, progress) {
  root.innerHTML = `${stageIntro(0, "先理解訊息", "先知道整句在說甚麼，才不會只模仿一串聲音。")}
    <div class="context-card"><small>情境</small><p>${escapeHtml(question.context)}</p><blockquote lang="en">${escapeHtml(question.phrase)}</blockquote></div>
    <p class="stage-question">哪一個意思符合這個情境？</p>
    <div class="choice-grid" data-meaning-options></div><p class="stage-status" role="status"></p>`;
  const optionRoot = root.querySelector("[data-meaning-options]");
  meaningOptions(question).forEach(option => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.textContent = option.text;
    button.disabled = progress.done.has(0);
    button.addEventListener("click", () => {
      if (!option.correct) {
        root.querySelector(".stage-status").textContent = "再看一次情境：意思不是逐字猜，而是理解整句用途。";
        return;
      }
      finishStage(card, question);
    });
    optionRoot.append(button);
  });
  if (progress.done.has(0)) {
    root.querySelector(".stage-status").textContent = `✓ ${question.meaning}`;
    addNextButton(root, question, "下一步：預測與找位");
  }
}

function renderSpotControls(root, card, question, progress) {
  const spot = spotTarget(question);
  const spotRoot = root.querySelector("[data-spot-root]");
  spotRoot.replaceChildren();
  spot.tokens.forEach((token, index) => {
    const word = document.createElement("button");
    word.type = "button";
    word.className = "word-chip";
    word.textContent = token;
    word.disabled = !progress.audioHeard || spot.mode !== "word";
    if (spot.mode === "word") word.addEventListener("click", () => checkSpot(index));
    spotRoot.append(word);
    if (index < spot.tokens.length - 1) {
      const boundary = document.createElement("button");
      boundary.type = "button";
      boundary.className = "boundary-tap";
      boundary.innerHTML = "<span aria-hidden=\"true\">⌁</span><span class=\"sr-only\">選擇字詞交界</span>";
      boundary.disabled = !progress.audioHeard || spot.mode !== "boundary";
      if (spot.mode === "boundary") boundary.addEventListener("click", () => checkSpot(index));
      spotRoot.append(boundary);
    }
  });
  function checkSpot(index) {
    const status = root.querySelector("[data-spot-status]");
    if (index !== spot.index) {
      status.textContent = "這裡不是本課目標。重聽一次，再留意兩個聲音碰面的地方。";
      return;
    }
    progress.spotted = true;
    finishStage(card, question);
  }
}

function renderPredict(root, card, question, progress) {
  root.innerHTML = `${stageIntro(1, "預測並找出交界", "先預測本課的聲音交界，再播放句子並親手點出位置。")}
    <p class="stage-question">哪一個位置是本課要處理的聲音交界或弱讀字？</p>
    <div class="choice-grid predict-grid" data-predict-options></div>
    <section class="spot-panel" data-spot-panel ${progress.predicted ? "" : "hidden"}>
      <div class="spot-panel__actions"><button class="play-control" type="button" data-hear-spot>▶ 先聽整句</button><span>${progress.audioHeard ? "已播放，可以找位" : "播放後才可點選"}</span></div>
      <div class="word-boundary-row" data-spot-root></div><p class="stage-status" data-spot-status role="status"></p>
    </section><p class="stage-status" data-predict-status role="status"></p>`;
  const optionRoot = root.querySelector("[data-predict-options]");
  predictOptions(question).forEach(option => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button boundary-choice";
    button.textContent = option.text.replace("+", "→");
    button.disabled = progress.predicted;
    button.addEventListener("click", () => {
      if (!option.correct) {
        root.querySelector("[data-predict-status]").textContent = "再試一次：哪兩個相鄰聲音會互相影響？";
        return;
      }
      progress.predicted = true;
      renderLessonStage(card, question);
    });
    optionRoot.append(button);
  });
  if (progress.predicted) {
    root.querySelector("[data-predict-status]").textContent = `✓ 預測位置：${question.focus}`;
    root.querySelector("[data-hear-spot]").addEventListener("click", event => {
      speak(question.phrase, { rate: .78 });
      progress.audioHeard = true;
      event.currentTarget.nextElementSibling.textContent = "已播放，可以找位";
      renderSpotControls(root, card, question, progress);
    });
    renderSpotControls(root, card, question, progress);
  }
  if (progress.done.has(1)) {
    root.querySelector("[data-spot-status]").textContent = `✓ 找到了 ${question.focus} 的目標位置。`;
    addNextButton(root, question, "下一步：聆聽與辨別");
  }
}

function versionDefinitions(question) {
  return [
    { id: "clear", label: "清楚慢讀", note: "每個字都清楚，但不刻意停頓", text: question.phrase, options: { rate: .62 } },
    { id: "natural", label: "自然連音", note: "保持意思，同時讓聲音順滑流動", text: question.phrase, options: { rate: .9 } },
    { id: "broken", label: "有意停頓", note: "用來比較不自然的字界中斷", text: brokenVersion(question), options: { rate: .7 } },
    { id: "accent", label: "另一口音", note: "口音可不同；清晰度和連續性仍重要", text: question.phrase, options: { rate: .86, accent: "en-US" } }
  ];
}

function renderListen(root, card, question, progress) {
  const versions = versionDefinitions(question);
  const heardAll = versions.every(version => progress.heardVersions.has(version.id));
  root.innerHTML = `${stageIntro(2, "聆聽並辨別", "比較清楚、自然、有停頓及另一口音的版本；先聽完，再判斷。")}
    <div class="version-grid" data-version-grid></div>
    <p class="stage-question">哪一個版本最符合本課的自然語流目標？</p>
    <div class="choice-grid compact" data-discriminate>
      <button class="choice-button" type="button" data-version-choice="clear" ${heardAll ? "" : "disabled"}>清楚慢讀</button>
      <button class="choice-button" type="button" data-version-choice="natural" ${heardAll ? "" : "disabled"}>自然連音</button>
      <button class="choice-button" type="button" data-version-choice="broken" ${heardAll ? "" : "disabled"}>有意停頓</button>
    </div><p class="stage-status" role="status">${heardAll ? "四個版本已聽完。" : `已聽 ${progress.heardVersions.size} / ${versions.length}`}</p>`;
  const versionRoot = root.querySelector("[data-version-grid]");
  versions.forEach(version => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "version-card";
    button.dataset.heard = String(progress.heardVersions.has(version.id));
    button.innerHTML = `<strong>▶ ${escapeHtml(version.label)}</strong><span>${escapeHtml(version.note)}</span>`;
    button.addEventListener("click", () => {
      speak(version.text, version.options);
      progress.heardVersions.add(version.id);
      renderLessonStage(card, question);
    });
    versionRoot.append(button);
  });
  root.querySelectorAll("[data-version-choice]").forEach(button => button.addEventListener("click", () => {
    if (button.dataset.versionChoice !== "natural") {
      root.querySelector(".stage-status").textContent = "這個版本有比較作用，但本課目標是保持清楚而順滑的自然連音。";
      return;
    }
    finishStage(card, question);
  }));
  if (progress.done.has(2)) {
    root.querySelector(".stage-status").textContent = "✓ 你已分辨自然連音和刻意停頓。";
    addNextButton(root, question, "下一步：建立聲音連接");
  }
}

function renderBuild(root, card, question, progress) {
  const parts = focusParts(question.focus);
  const left = parts[0];
  const right = parts[1] || "自然語流";
  const selected = progress.buildChoice === null ? null : question.choices[progress.buildChoice];
  root.innerHTML = `${stageIntro(3, "建立聲音連接", "拖曳或點選可播放的聲音單位，把口形／聲音動作放進兩端之間。這些不是字母或音標。")}
    <div class="build-lane"><span class="edge-block"><small>前段</small><strong>${escapeHtml(left)}</strong></span>
      <div class="build-slot" data-build-slot data-filled="${Boolean(selected)}">${selected ? `<strong>${escapeHtml(selected.title)}</strong><small>${escapeHtml(selected.anchor)}</small>` : "把聲音單位放到這裡"}</div>
      <span class="edge-block"><small>後段</small><strong>${escapeHtml(right)}</strong></span></div>
    <div class="sound-unit-palette" data-unit-palette></div>
    <div class="stage-actions"><button class="stage-check" type="button" data-check-build ${selected ? "" : "disabled"}>檢查聲音連接</button></div>
    <p class="stage-status" role="status"></p>`;
  const palette = root.querySelector("[data-unit-palette]");
  const place = index => { progress.buildChoice = index; renderLessonStage(card, question); };
  question.choices.forEach((choice, index) => {
    const tile = document.createElement("article");
    tile.className = "sound-unit";
    tile.draggable = true;
    tile.dataset.selected = String(index === progress.buildChoice);
    tile.innerHTML = `<span class="sound-unit__grip" aria-hidden="true">⠿</span><button type="button" class="build-tile"><strong>${escapeHtml(choice.title)}</strong><span>${escapeHtml(choice.anchor)}</span></button><button type="button" class="tile-play">▶ 聽</button>`;
    tile.addEventListener("dragstart", event => event.dataTransfer?.setData("text/plain", String(index)));
    tile.querySelector(".build-tile").addEventListener("click", () => place(index));
    tile.querySelector(".tile-play").addEventListener("click", () => speak(choice.audio, { rate: .7 }));
    palette.append(tile);
  });
  const slot = root.querySelector("[data-build-slot]");
  slot.addEventListener("dragover", event => event.preventDefault());
  slot.addEventListener("drop", event => {
    event.preventDefault();
    const index = Number(event.dataTransfer?.getData("text/plain"));
    if (Number.isInteger(index) && question.choices[index]) place(index);
  });
  root.querySelector("[data-check-build]").addEventListener("click", () => {
    if (!question.accepted.includes(progress.buildChoice)) {
      root.querySelector(".stage-status").textContent = "這個聲音動作未能保持本句的自然連接。試聽其他單位，再拖入中間。";
      return;
    }
    finishStage(card, question);
  });
  if (progress.done.has(3)) {
    root.querySelector(".stage-status").textContent = `✓ ${question.feedback}`;
    addNextButton(root, question, "下一步：分段模仿");
  }
}

function shortPhrase(question) {
  const tokens = wordsIn(question.phrase);
  const parts = focusParts(question.focus).map(normalizeWord);
  const index = tokens.findIndex(token => normalizeWord(token) === parts[0]);
  return tokens.slice(Math.max(0, index - 1), Math.min(tokens.length, index + (parts.length === 2 ? 3 : 2))).join(" ") || question.phrase;
}

function imitationChunks(question) {
  const parts = focusParts(question.focus);
  return [
    { label: "單字", text: parts[0] },
    { label: parts.length === 2 ? "聲音交界" : "弱讀位置", text: parts.join(" ") },
    { label: "短語", text: shortPhrase(question) },
    { label: "完整句子", text: question.phrase }
  ];
}

function renderImitate(root, card, question, progress) {
  const chunks = imitationChunks(question);
  root.innerHTML = `${stageIntro(4, "分段模仿", "依次跟讀：單字 → 交界 → 短語 → 完整句。每次先聽，再立即影子跟讀。")}
    <div class="chunk-ladder" data-chunk-ladder></div><p class="stage-status" role="status">已跟讀 ${progress.imitates.size} / ${chunks.length}</p>`;
  const ladder = root.querySelector("[data-chunk-ladder]");
  chunks.forEach((chunk, index) => {
    const row = document.createElement("article");
    row.className = "chunk-row";
    row.dataset.complete = String(progress.imitates.has(index));
    row.innerHTML = `<span>${index + 1}</span><div><small>${escapeHtml(chunk.label)}</small><strong lang="en">${escapeHtml(chunk.text)}</strong></div><button type="button" class="play-control">▶ 播放並跟讀</button><button type="button" class="shadow-confirm">${progress.imitates.has(index) ? "✓ 已跟讀" : "我已跟讀"}</button>`;
    row.querySelector(".play-control").addEventListener("click", () => speak(chunk.text, { rate: index < 2 ? .65 : index === 2 ? .76 : .88 }));
    row.querySelector(".shadow-confirm").addEventListener("click", () => {
      progress.imitates.add(index);
      if (progress.imitates.size === chunks.length) finishStage(card, question);
      else renderLessonStage(card, question);
    });
    ladder.append(row);
  });
  if (progress.done.has(4)) {
    root.querySelector(".stage-status").textContent = "✓ 四個層次已完成影子跟讀。";
    addNextButton(root, question, "下一步：錄音與針對性回饋");
  }
}

function recognitionSession() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return { stop() {}, result: Promise.resolve("") };
  const recognition = new Recognition();
  recognition.lang = "en-GB";
  recognition.interimResults = true;
  recognition.continuous = true;
  let transcript = "";
  const result = new Promise(resolve => {
    recognition.onresult = event => { transcript = Array.from(event.results).map(item => item[0]?.transcript || "").join(" ").trim(); };
    recognition.onerror = () => resolve(transcript);
    recognition.onend = () => resolve(transcript);
  });
  try { recognition.start(); } catch { return { stop() {}, result: Promise.resolve("") }; }
  return { stop() { try { recognition.stop(); } catch {} }, result };
}

function simpleTextScore(expected, transcript) {
  const expectedWords = wordsIn(expected).map(normalizeWord);
  const actualWords = wordsIn(transcript).map(normalizeWord);
  if (!actualWords.length) return null;
  const matches = expectedWords.filter(word => actualWords.includes(word)).length;
  return matches / Math.max(expectedWords.length, actualWords.length, 1);
}

async function analyseRecording(blob, expected, question, transcript) {
  let duration = 0;
  let longestPause = 0;
  let energyVariation = 0;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContextClass();
    const buffer = await context.decodeAudioData((await blob.arrayBuffer()).slice(0));
    duration = buffer.duration;
    const samples = buffer.getChannelData(0);
    const frameSize = Math.max(1, Math.floor(buffer.sampleRate * .02));
    const levels = [];
    for (let offset = 0; offset + frameSize <= samples.length; offset += frameSize) {
      let energy = 0;
      for (let index = 0; index < frameSize; index += 1) energy += samples[offset + index] ** 2;
      levels.push(Math.sqrt(energy / frameSize));
    }
    const peak = Math.max(...levels, .001);
    const threshold = Math.max(.006, peak * .12);
    const voiced = levels.map(level => level >= threshold);
    const first = voiced.indexOf(true);
    const last = voiced.lastIndexOf(true);
    let silence = 0;
    if (first > -1 && last > first) {
      const voicedLevels = levels.slice(first, last + 1).filter((_, index) => voiced[first + index]);
      const mean = voicedLevels.reduce((sum, value) => sum + value, 0) / Math.max(voicedLevels.length, 1);
      const variance = voicedLevels.reduce((sum, value) => sum + (value - mean) ** 2, 0) / Math.max(voicedLevels.length, 1);
      energyVariation = mean ? Math.sqrt(variance) / mean : 0;
      for (let index = first; index <= last; index += 1) {
        silence = voiced[index] ? 0 : silence + .02;
        longestPause = Math.max(longestPause, silence);
      }
    }
    await context.close();
  } catch { /* Text and duration fallbacks remain available. */ }
  const natural = window.EdmundPronunciation?.analyseNaturalTextMatch?.(expected, transcript);
  const intelligibilityScore = natural?.score ?? simpleTextScore(expected, transcript);
  const wordCount = Math.max(wordsIn(expected).length, 1);
  const secondsPerWord = duration / wordCount;
  const hasBoundary = focusParts(question.focus).length === 2;
  const boundaryPass = !hasBoundary || longestPause <= .24;
  const stressPass = energyVariation >= .16;
  const rhythmPass = secondsPerWord >= .18 && secondsPerWord <= .95 && longestPause <= .42;
  return {
    transcript,
    duration,
    boundary: {
      pass: boundaryPass,
      text: hasBoundary
        ? boundaryPass ? "交界保持連續，沒有明顯停頓。" : "交界出現較長停頓；重做時把兩端放在同一口氣內。"
        : "目標弱讀字已放在完整語流中檢查。"
    },
    intelligibility: {
      pass: intelligibilityScore === null ? null : intelligibilityScore >= .72,
      text: intelligibilityScore === null
        ? "裝置未能提供文字辨識；請用回放核對字詞是否清楚。"
        : intelligibilityScore >= .72 ? `主要字詞可辨識（約 ${Math.round(intelligibilityScore * 100)}%）。` : "部分字詞未被清楚辨識；先放慢，再保留完整單字。"
    },
    stress: {
      pass: stressPass,
      text: stressPass ? "音量有自然起伏，不是每個字一樣重。" : "起伏較平；把內容字說得稍突出，小字保持輕短。"
    },
    rhythm: {
      pass: rhythmPass,
      text: rhythmPass ? "速度與停頓形成連續節奏。" : "節奏偏慢或中斷；先練短語，再回到完整句。"
    }
  };
}

async function beginRecording(card, question, progress) {
  if (!navigator.mediaDevices?.getUserMedia || !("MediaRecorder" in window)) {
    progress.recordingFallback = true;
    renderLessonStage(card, question);
    return;
  }
  if (state.recording) stopRecording({ discard: true });
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    const recognition = recognitionSession();
    const expected = focusParts(question.focus).length === 2 ? focusParts(question.focus).join(" ") : question.phrase;
    recorder.addEventListener("dataavailable", event => { if (event.data.size) chunks.push(event.data); });
    recorder.addEventListener("stop", async () => {
      stream.getTracks().forEach(track => track.stop());
      recognition.stop();
      const transcript = await Promise.race([recognition.result, new Promise(resolve => window.setTimeout(() => resolve(""), 700))]);
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      if (progress.recordingUrl) URL.revokeObjectURL(progress.recordingUrl);
      progress.recordingUrl = URL.createObjectURL(blob);
      progress.recordingResult = await analyseRecording(blob, expected, question, transcript);
      state.recording = null;
      renderLessonStage(card, question);
    });
    recorder.start(100);
    state.recording = {
      id: question.id,
      recorder,
      stream,
      recognition,
      timeout: window.setTimeout(() => stopRecording(), 8000)
    };
    renderLessonStage(card, question);
  } catch {
    progress.recordingFallback = true;
    renderLessonStage(card, question);
  }
}

function feedbackCard(label, result) {
  const stateName = result.pass === true ? "pass" : result.pass === false ? "coach" : "neutral";
  const mark = result.pass === true ? "✓" : result.pass === false ? "↻" : "•";
  return `<article class="feedback-metric" data-state="${stateName}"><span>${mark}</span><div><strong>${escapeHtml(label)}</strong><p>${escapeHtml(result.text)}</p></div></article>`;
}

function renderProduce(root, card, question, progress) {
  const expected = focusParts(question.focus).length === 2 ? focusParts(question.focus).join(" ") : question.phrase;
  const active = state.recording?.id === question.id;
  root.innerHTML = `${stageIntro(5, "錄音並取得針對性回饋", "先聽目標交界，再獨立錄音。裝置會分開提示交界、清晰度、重音和節奏；錄音不會上載。")}
    <div class="record-target"><small>錄音目標</small><strong lang="en">${escapeHtml(expected)}</strong><button class="play-control" type="button" data-play-target>▶ 聽示範</button></div>
    <div class="record-console"><button class="record-button" type="button" data-record-loop>${active ? "■ 停止並分析" : progress.recordingResult ? "● 重新錄音" : "● 開始錄音"}</button><span>${active ? "正在錄音；完成後會在裝置上分析。" : "最長 8 秒"}</span></div>
    ${progress.recordingUrl ? `<audio controls src="${escapeHtml(progress.recordingUrl)}"></audio>` : ""}
    ${progress.recordingResult ? `<div class="feedback-grid">${feedbackCard("聲音交界", progress.recordingResult.boundary)}${feedbackCard("可理解度", progress.recordingResult.intelligibility)}${feedbackCard("重音起伏", progress.recordingResult.stress)}${feedbackCard("節奏", progress.recordingResult.rhythm)}</div><p class="analysis-note">這是裝置端練習提示，不是口音評分；目標是清楚、連續和符合語意。</p>` : ""}
    ${progress.recordingFallback ? `<div class="fallback-note"><strong>此瀏覽器未能錄音。</strong><p>請用自己的錄音程式錄下「${escapeHtml(expected)}」，回聽交界、清晰度、重音和節奏。</p></div>` : ""}`;
  root.querySelector("[data-play-target]").addEventListener("click", () => speak(expected, { rate: .76 }));
  root.querySelector("[data-record-loop]").addEventListener("click", () => {
    if (active) stopRecording();
    else void beginRecording(card, question, progress);
  });
  if (localPreview && !progress.recordingResult && !progress.recordingFallback) {
    const previewButton = document.createElement("button");
    previewButton.type = "button";
    previewButton.className = "stage-check";
    previewButton.dataset.previewFeedback = "";
    previewButton.textContent = "本機預覽：顯示示範回饋";
    previewButton.addEventListener("click", () => {
      progress.recordingResult = {
        transcript: expected,
        duration: 1.4,
        boundary: { pass: true, text: "交界保持連續，沒有明顯停頓。" },
        intelligibility: { pass: true, text: "主要字詞清楚可辨識。" },
        stress: { pass: true, text: "音量有自然起伏，不是每個字一樣重。" },
        rhythm: { pass: true, text: "速度與停頓形成連續節奏。" }
      };
      renderLessonStage(card, question);
    });
    root.append(previewButton);
  }
  if (!progress.done.has(5) && (progress.recordingResult || progress.recordingFallback)) {
    const continueButton = document.createElement("button");
    continueButton.type = "button";
    continueButton.className = "stage-next";
    continueButton.textContent = progress.recordingResult ? "接受回饋並進入轉移練習" : "我已用其他方式錄音並自我核對";
    continueButton.addEventListener("click", () => finishStage(card, question));
    root.append(continueButton);
  }
  if (progress.done.has(5)) addNextButton(root, question, "下一步：新句轉移與安排複習");
}

function reviewLabel(review) {
  if (!review?.due) return "";
  return new Intl.DateTimeFormat("zh-HK", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(review.due));
}

function scheduleReview(question, level, delay) {
  const review = { level, due: Date.now() + delay };
  state.reviews.set(question.id, review);
  state.completed.add(question.id);
  const progress = lessonState(question);
  LESSON_STEPS.forEach((_, index) => progress.done.add(index));
  progress.highest = 6;
  progress.step = 6;
  saveProgress();
  updateProgress();
  renderLessonStage($(`#liaison-question-${question.id}`), question);
}

function renderTransfer(root, card, question, progress) {
  const review = state.reviews.get(question.id);
  root.innerHTML = `${stageIntro(6, "轉移並安排間隔複習", "把同一連音規律用在未見過的句子；答對後決定何時再遇見它。")}
    <div class="transfer-card"><small>UNSEEN SENTENCE</small><strong lang="en">${escapeHtml(question.transferPhrase)}</strong><button class="play-control" type="button" data-play-transfer>▶ 播放新句</button></div>
    <p class="stage-question">哪個聲音單位可以把新句的目標位置自然連起來？</p>
    <div class="choice-grid transfer-choices" data-transfer-choices></div><p class="stage-status" role="status"></p>
    <section class="review-scheduler" ${progress.transferCorrect ? "" : "hidden"}>
      <h5>你想何時再見到這個規律？</h5>
      <div><button type="button" data-review="再練一次">10 分鐘後</button><button type="button" data-review="明天再看">明天</button><button type="button" data-review="已掌握">3 天後</button></div>
      ${review ? `<p>✓ 已安排：${escapeHtml(review.level)} · ${escapeHtml(reviewLabel(review))}</p>` : ""}
    </section>`;
  root.querySelector("[data-play-transfer]").addEventListener("click", () => speak(question.transferPhrase, { rate: .84 }));
  const choiceRoot = root.querySelector("[data-transfer-choices]");
  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "choice-button";
    button.innerHTML = `<strong>${escapeHtml(choice.title)}</strong><span>${escapeHtml(choice.anchor)}</span>`;
    button.addEventListener("click", () => {
      progress.transferChoice = index;
      if (!question.accepted.includes(index)) {
        root.querySelector(".stage-status").textContent = "這個新句仍要使用同一類聲音動作。重聽，再把規律轉移過去。";
        return;
      }
      progress.transferCorrect = true;
      renderLessonStage(card, question);
    });
    choiceRoot.append(button);
  });
  if (progress.transferCorrect) {
    root.querySelector(".stage-status").textContent = `✓ 已把規律轉移到 ${question.transferFocus}。`;
    const delays = [10 * 60 * 1000, 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000];
    root.querySelectorAll("[data-review]").forEach((button, index) => button.addEventListener("click", () => scheduleReview(question, button.dataset.review, delays[index])));
  }
  if (review) {
    card.classList.add("is-complete");
    const completion = document.createElement("div");
    completion.className = "lesson-complete-note";
    completion.innerHTML = `<strong>本課七階段已完成</strong><span>下次複習：${escapeHtml(reviewLabel(review))}</span>`;
    root.append(completion);
  }
}

const stageRenderers = [renderMeaning, renderPredict, renderListen, renderBuild, renderImitate, renderProduce, renderTransfer];

function renderLessonStage(card, question) {
  const progress = lessonState(question);
  const complete = state.completed.has(question.id);
  card.dataset.step = String(progress.step + 1);
  card.classList.toggle("is-complete", complete);
  card.querySelector("[data-lesson-status]").textContent = complete ? "已完成" : "進行中";
  const stepper = card.querySelector("[data-stepper]");
  stepper.replaceChildren();
  LESSON_STEPS.forEach(([zh, en], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "step-pill";
    button.dataset.current = String(index === progress.step);
    button.dataset.complete = String(progress.done.has(index));
    button.disabled = index > progress.highest;
    button.innerHTML = `<span>${progress.done.has(index) ? "✓" : index + 1}</span><strong>${escapeHtml(zh)}</strong><small>${escapeHtml(en)}</small>`;
    button.addEventListener("click", () => { progress.step = index; renderLessonStage(card, question); });
    stepper.append(button);
  });
  const root = card.querySelector("[data-stage-root]");
  root.replaceChildren();
  stageRenderers[progress.step](root, card, question, progress);
  saveProgress();
}

function renderQuestion(question) {
  const card = document.createElement("article");
  card.className = "question-card lesson-card";
  card.id = `liaison-question-${question.id}`;
  card.dataset.question = String(question.id);
  card.innerHTML = `<div class="question-meta"><span>LESSON ${String(question.id).padStart(2, "0")} · ${escapeHtml(question.group)}</span><span>7 STAGES · 8–12 MIN</span></div>
    <div class="phrase-row"><h3 lang="en">${escapeHtml(question.phrase)}</h3><span class="lesson-status" data-lesson-status>${state.completed.has(question.id) ? "已完成" : "進行中"}</span></div>
    <nav class="lesson-stepper" data-stepper aria-label="七階段學習流程"></nav>
    <section class="lesson-stage" data-stage-root></section>`;
  renderLessonStage(card, question);
  return card;
}

function updateProgress() {
  const count = state.completed.size;
  const percent = Math.round(count / questions.length * 100);
  $("[data-progress-label]").textContent = `完成七階段課堂 ${count} / ${questions.length}`;
  $("[data-progress-percent]").textContent = `${percent}%`;
  $("[data-progress-bar]").style.width = `${percent}%`;
  $("[data-completion]").hidden = count !== questions.length;
}

function renderAllQuestions() {
  const root = $("[data-question-list]");
  root.replaceChildren(...questions.map(renderQuestion));
  updateProgress();
}

function firstPracticeTarget() {
  const now = Date.now();
  const due = questions.find(question => Number(state.reviews.get(question.id)?.due) <= now);
  return due || questions.find(question => !state.completed.has(question.id)) || questions[0];
}

$("[data-login-form]").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = $("[data-login-status]");
  const button = $("[data-login-button]");
  const values = new FormData(form);
  const username = String(values.get("username") || "").trim();
  const password = String(values.get("password") || "");
  if (!username || !password) {
    status.textContent = "請輸入學生名稱及密碼。";
    status.dataset.state = "error";
    return;
  }
  const generation = ++authGeneration;
  const originalLabel = button.textContent;
  status.textContent = "正在驗證學生帳戶…";
  status.dataset.state = "pending";
  button.disabled = true;
  button.textContent = "正在登入…";
  try {
    const row = await rpc("flashcard_student_login", { p_name: username, p_password: password });
    if (generation !== authGeneration) return;
    if (!row?.session_token) throw Error("學生帳戶或密碼不正確。");
    remember(row, row.session_token);
    form.reset();
    status.textContent = "登入成功。";
    status.dataset.state = "complete";
    showView("practice");
  } catch (error) {
    if (generation === authGeneration) {
      status.textContent = error?.message || "登入失敗，請再試一次。";
      status.dataset.state = "error";
    }
  } finally {
    if (generation === authGeneration) {
      button.disabled = false;
      button.textContent = originalLabel;
    }
  }
});

$("[data-password-toggle]").addEventListener("click", event => {
  const input = $("[name='password']");
  const show = input.type === "password";
  input.type = show ? "text" : "password";
  event.currentTarget.textContent = show ? "隱藏" : "顯示";
  event.currentTarget.setAttribute("aria-pressed", String(show));
});

$("[data-start-practice]").addEventListener("click", () => {
  const target = firstPracticeTarget();
  $(`#liaison-question-${target.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
});
$("[data-review-from-start]").addEventListener("click", () => $("#liaison-question-1").scrollIntoView({ behavior: "smooth" }));
$("[data-logout]").addEventListener("click", forget);
$("[data-reset-progress]").addEventListener("click", () => {
  if (!confirm("確定重設這個裝置上的 30 課七階段進度及複習安排？")) return;
  stopRecording({ discard: true });
  for (const progress of state.lessons.values()) if (progress.recordingUrl) URL.revokeObjectURL(progress.recordingUrl);
  try { localStorage.removeItem(progressKey()); } catch { /* Ignore storage failures. */ }
  state.completed.clear();
  state.reviews.clear();
  state.lessons.clear();
  renderAllQuestions();
});

window.addEventListener("beforeunload", () => {
  stopRecording({ discard: true });
  for (const progress of state.lessons.values()) if (progress.recordingUrl) URL.revokeObjectURL(progress.recordingUrl);
});

renderAllQuestions();
if (localPreview) {
  state.user = { id: "local-preview", name: "Preview Student", role: "student" };
  state.token = "local-preview-only";
  loadProgress();
  renderAllQuestions();
  showView("practice");
} else {
  restore().catch(error => {
    forget();
    $("[data-login-status]").textContent = error?.message || "登入時段已失效，請重新登入。";
    $("[data-login-status]").dataset.state = "error";
  });
}
