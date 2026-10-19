(() => {
  "use strict";
  const portal = window.EDMUND_LEARNING_PORTAL_CONTEXT;
  const questions = window.ERROR_IDENTIFIER_QUESTIONS;
  const dashboard = document.querySelector('[data-view="dashboard"]');
  if (!portal || !dashboard || !Array.isArray(questions)) return;

  const escaped = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const words = new Map(questions.map(q => [q.number, q.sentence.match(/\S+/g) || []]));
  const state = { answers: {}, submittedAnswers: {}, feedback: {}, userId: "", loading: false, submitting: false, submittedAt: "", stamp: 0, mode: "", range: "core", view: "one", current: 1, syncTimer: null, syncedSignature: "" };
  const key = () => `edmund-error-identifier-draft-v1:${state.userId}`;
  const answer = number => state.answers[number] || {};
  const rangeBounds = () => state.range === "core" ? [1, 60] : state.range === "new" ? [61, questions.length] : [1, questions.length];
  const selectedText = (number, a) => {
    if (!Number.isInteger(a.start) || !Number.isInteger(a.end)) return "";
    return words.get(number).slice(Math.min(a.start, a.end), Math.max(a.start, a.end) + 1).join(" ");
  };
  const complete = (number, a) => a.mark === "tick" || (a.mark === "cross" && selectedText(number, a) && (a.remove === true || String(a.correction || "").trim()));
  const completedCount = () => questions.filter(q => complete(q.number, answer(q.number))).length;
  const rangeCount = () => {
    const [first, last] = rangeBounds();
    return questions.filter(q => q.number >= first && q.number <= last && complete(q.number, answer(q.number))).length;
  };
  const firstIncomplete = (first, last) => {
    for (let number = first; number <= last; number++) if (!complete(number, answer(number))) return number;
    return first;
  };
  const saveDraft = () => {
    state.stamp = Date.now();
    try { localStorage.setItem(key(), JSON.stringify({ answers: state.answers, stamp: state.stamp })); } catch { /* Storage may be unavailable. */ }
  };
  const loadDraft = () => {
    try {
      const draft = JSON.parse(localStorage.getItem(key()) || "null");
      if (draft && draft.answers && typeof draft.answers === "object") return draft;
    } catch { /* Ignore stale local data. */ }
    return null;
  };

  dashboard.insertAdjacentHTML("beforeend", `<section class="error-id-mode-page" data-error-id-modes aria-labelledby="error-id-mode-heading">
    <div class="error-id-mode-intro"><p class="eyebrow">ERROR IDENTIFIER · PROOFREADING STUDIO</p><h2 id="error-id-mode-heading">選擇你的校對方式</h2></div>
    <div class="error-id-mode-grid">
      <button class="error-id-mode-card" type="button" data-open-mode="single"><span class="error-id-mode-card__icon" aria-hidden="true">Aa</span><span class="error-id-mode-card__eyebrow">MODE 01 · SINGLE SENTENCE</span><strong>單句模式</strong><span class="error-id-mode-card__foot"><b>共 ${questions.length} 題</b><span>開始練習 ↗</span></span></button>
      <button class="error-id-mode-card error-id-mode-card--passage" type="button" data-open-mode="passage"><span class="error-id-mode-card__icon" aria-hidden="true">¶</span><span class="error-id-mode-card__eyebrow">MODE 02 · PASSAGE</span><strong>文章模式</strong><span class="error-id-mode-card__foot"><b>11 篇文章</b><span>開始練習 ↗</span></span></button>
    </div>
  </section>
  <section class="error-id-workspace" data-error-id-single hidden aria-labelledby="error-id-heading">
    <div class="error-id-workspace__top"><button type="button" class="error-id-back" data-back-modes>← 返回模式選擇</button><span class="error-id-workspace__label">MODE 01 · 單句模式</span></div>
    <div class="error-id-intro"><div><p class="eyebrow">ONE SENTENCE AT A TIME</p><h2 id="error-id-heading">細看一句，改好一處</h2><p>選擇 ✓ 或 ✕。若句子有錯，點選錯誤字詞；要選連續多字，再點最後一字。</p></div><div class="error-id-progress"><strong data-error-id-range-count>0 / 60</strong><span>本組已完成</span></div></div>
    <div class="error-id-controls"><div class="error-id-range-tabs" role="group" aria-label="選擇單句題組"><button type="button" data-range="core">基礎 60 題 <span>01–60</span></button><button type="button" data-range="new">新增 284 題 <span>61–344</span></button><button type="button" data-range="all">全部 ${questions.length} 題</button></div><div class="error-id-view-tabs" role="group" aria-label="題目顯示方式"><button type="button" data-view-mode="one">單題</button><button type="button" data-view-mode="list">列表</button></div></div>
    <div class="error-id-progress-track" aria-hidden="true"><span data-error-id-progress-fill></span></div>
    <div class="error-id-feedback-summary" data-error-id-feedback-summary hidden></div>
    <div class="error-id-list" data-error-id-list></div>
    <nav class="error-id-navigation" aria-label="題目導覽"><button type="button" data-navigate="previous">← 上一題</button><div class="error-id-navigation__center"><span data-error-id-position>01 / 60</span><label>跳至第 <input type="number" min="1" max="${questions.length}" data-jump-input aria-label="題號"> 題</label><button type="button" data-jump>前往</button></div><button type="button" data-navigate="next">下一題 →</button></nav>
    <button class="error-id-next-open" type="button" data-next-open>前往本組下一題未完成題目 ↗</button>
  </section>
  <section class="error-id-passage-page" data-error-id-passage hidden aria-labelledby="error-id-passage-heading"><button type="button" class="error-id-back" data-back-modes>← 返回模式選擇</button><div data-passage-root></div></section>
  <div class="error-id-submit-bar" data-error-id-bar hidden><div class="error-id-submit-bar__inner"><div><strong data-error-id-count>0 / ${questions.length} 已完成</strong><small data-error-id-status role="status" aria-live="polite">完成作答後自動顯示參考答案。</small></div></div></div>`);

  const modes = dashboard.querySelector("[data-error-id-modes]");
  const single = dashboard.querySelector("[data-error-id-single]");
  const passage = dashboard.querySelector("[data-error-id-passage]");
  const bar = dashboard.querySelector("[data-error-id-bar]");
  const list = dashboard.querySelector("[data-error-id-list]");
  const summary = dashboard.querySelector("[data-error-id-feedback-summary]");
  const count = dashboard.querySelector("[data-error-id-count]");
  const rangeCountLabel = dashboard.querySelector("[data-error-id-range-count]");
  const progressFill = dashboard.querySelector("[data-error-id-progress-fill]");
  const position = dashboard.querySelector("[data-error-id-position]");
  const status = dashboard.querySelector("[data-error-id-status]");

  function setHomeworkRoute() {
    const route = new URL(location.href);
    if (state.mode) route.searchParams.set("mode", state.mode); else route.searchParams.delete("mode");
    if (state.mode === "single") route.searchParams.set("question", state.current); else route.searchParams.delete("question");
    if (state.mode !== "passage") route.searchParams.delete("passage");
    history.replaceState(null, "", route);
  }
  function applyHomeworkRoute() {
    const route = new URLSearchParams(location.search);
    const mode = route.get("mode");
    if (mode === "single") {
      const raw = route.get("question"), number = Number(raw);
      if (raw !== null && (!/^[1-9]\d*$/.test(raw) || number > questions.length)) return;
      state.current = raw === null ? firstIncomplete(1, questions.length) : number;
      state.range = state.current <= 60 ? "core" : "new"; state.view = "one";
      setMode("single");
    } else if (mode === "passage") setMode("passage");
  }
  function setMode(mode) {
    state.mode = mode;
    setHomeworkRoute();
    modes.hidden = !!mode;
    single.hidden = mode !== "single";
    passage.hidden = mode !== "passage";
    bar.hidden = mode !== "single";
    render();
    window.dispatchEvent(new CustomEvent("edmund:error-id-mode", { detail: { mode } }));
    (mode === "single" ? single : mode === "passage" ? passage : modes).scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderFeedback(number) {
    const reference = state.feedback[number];
    const submitted = state.submittedAnswers[number];
    if (!reference || !submitted) return "";
    const sameJudgment = submitted.mark === reference.mark;
    const referenceAnswer = reference.mark === "tick" ? "✓ 原句正確，無須修改。" : `✕ ${escaped(reference.wrong)} → ${escaped(reference.fix)}`;
    const studentAnswer = submitted.mark === "tick" ? "✓ 正確" : `✕ ${escaped(submitted.selected)} → ${submitted.remove ? "刪除" : escaped(submitted.correction)}`;
    return `<section class="error-id-feedback" aria-label="第 ${number} 題參考答案"><div class="error-id-feedback__heading"><div><p class="eyebrow">REFERENCE ANSWER</p><h3>參考答案與解說</h3></div><span class="${sameJudgment ? "is-match" : "is-different"}">${sameJudgment ? "判斷吻合" : "判斷需修正"}</span></div>
      <div class="error-id-feedback__compare"><div><small>你的提交</small><p lang="en">${studentAnswer}</p></div><div><small>參考改法</small><p lang="en">${referenceAnswer}</p></div></div>
      ${reference.correct_sentence ? `<p class="error-id-feedback__sentence"><b>完整句子</b><span lang="en">${escaped(reference.correct_sentence)}</span></p>` : ""}
      <div class="error-id-feedback__reason"><span>${escaped(reference.topic)}</span><p>${escaped(reference.reason)}</p></div>
      <details><summary>記憶提示</summary><p>${escaped(reference.tip)}</p></details>
    </section>`;
  }

  function renderSummary() {
    const revealed = Object.keys(state.feedback).length;
    summary.hidden = revealed === 0;
    summary.innerHTML = revealed ? `<span class="error-id-feedback-summary__dot"></span><strong>${revealed} 題參考答案已顯示</strong>` : "";
  }

  function renderQuestion(q) {
    const a = answer(q.number);
    const tokens = words.get(q.number);
    const lo = Math.min(a.start ?? -1, a.end ?? -1);
    const hi = Math.max(a.start ?? -1, a.end ?? -1);
    const sentence = tokens.map((word, index) => `<button type="button" class="error-id-word${a.mark === "cross" && lo >= 0 && index >= lo && index <= hi ? " is-selected" : ""}" data-word="${index}" data-number="${q.number}" ${a.mark === "cross" ? "" : "disabled"} aria-label="選取 ${escaped(word)}">${escaped(word)}</button>`).join(" ");
    return `<article class="error-id-question${a.mark ? " is-answered" : ""}" data-question="${q.number}">
      <div class="error-id-question__meta"><span>${q.number <= 60 ? "基礎練習" : "延伸練習"}</span><span>${String(q.number).padStart(3, "0")} / ${questions.length}</span></div>
      <div class="error-id-sentence" lang="en">${sentence}</div>
      <div class="error-id-choice"><span>這句正確嗎？</span><div role="group" aria-label="第 ${q.number} 題判斷"><button type="button" data-mark="tick" data-number="${q.number}" class="${a.mark === "tick" ? "is-active" : ""}" aria-pressed="${a.mark === "tick"}">✓ 正確</button><button type="button" data-mark="cross" data-number="${q.number}" class="${a.mark === "cross" ? "is-active" : ""}" aria-pressed="${a.mark === "cross"}">✕ 錯誤</button></div></div>
      ${a.mark === "cross" ? `<div class="error-id-correction"><div><span class="error-id-correction__step">01</span><div><b>選出錯誤字詞</b><p>${selectedText(q.number, a) ? escaped(selectedText(q.number, a)) : "點選上方句子；連續多字可點選起點與終點。"}</p></div></div><div><span class="error-id-correction__step">02</span><div><label for="error-id-correction-${q.number}">寫出正確改法</label><input id="error-id-correction-${q.number}" data-correction="${q.number}" type="text" autocomplete="off" maxlength="180" value="${escaped(a.correction || "")}" placeholder="例如：were / the United Kingdom" ${a.remove ? "disabled" : ""}><label class="error-id-remove"><input type="checkbox" data-remove="${q.number}" ${a.remove ? "checked" : ""}> 刪除所選字詞</label></div></div></div>` : ""}
      <div data-feedback-slot="${q.number}">${renderFeedback(q.number)}</div>
    </article>`;
  }

  function refreshCounter() {
    const done = completedCount();
    const [first, last] = rangeBounds();
    const inRange = rangeCount();
    count.textContent = `${done} / ${questions.length} 已完成`;
    rangeCountLabel.textContent = `${inRange} / ${last - first + 1}`;
    progressFill.style.width = `${Math.round(inRange / (last - first + 1) * 100)}%`;
    position.textContent = `${String(state.current).padStart(3, "0")} / ${questions.length}`;
  }
  function render() {
    if (state.mode !== "single") return;
    renderSummary();
    const [first, last] = rangeBounds();
    list.classList.toggle("is-list-view", state.view === "list");
    list.innerHTML = state.view === "list" ? questions.slice(first - 1, last).map(renderQuestion).join("") : renderQuestion(questions[state.current - 1]);
    dashboard.querySelectorAll("[data-range]").forEach(button => {
      const active = button.dataset.range === state.range;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    dashboard.querySelector('[data-navigate="previous"]').disabled = state.current <= first;
    dashboard.querySelector('[data-navigate="next"]').disabled = state.current >= last;
    dashboard.querySelector(".error-id-navigation").hidden = state.view === "list";
    dashboard.querySelector("[data-next-open]").hidden = state.view === "list";
    dashboard.querySelectorAll("[data-view-mode]").forEach(button => {
      const active = button.dataset.viewMode === state.view;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    refreshCounter();
  }
  function mutate(number, updater, rerender = true) {
    const a = { ...answer(number) };
    updater(a);
    state.answers[number] = a;
    saveDraft();
    if (rerender) {
      if (state.view === "list") {
        const card = list.querySelector(`[data-question="${number}"]`);
        if (card) card.outerHTML = renderQuestion(questions[number - 1]);
        renderSummary();
        refreshCounter();
      } else render();
    } else refreshCounter();
    if (complete(number, a)) scheduleSync(a.mark === "tick" ? 0 : 850);
  }
  function goTo(number) {
    if (!Number.isInteger(number) || number < 1 || number > questions.length) return;
    state.current = number;
    state.range = number <= 60 ? "core" : "new";
    setHomeworkRoute();
    render();
    list.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  dashboard.addEventListener("click", event => {
    const open = event.target.closest("[data-open-mode]");
    if (open) {
      if (open.dataset.openMode === "single") {
        state.range = state.current <= 60 ? "core" : "new";
        state.current = firstIncomplete(...rangeBounds());
      }
      setMode(open.dataset.openMode);
      return;
    }
    if (event.target.closest("[data-back-modes]")) { setMode(""); return; }
    const range = event.target.closest("[data-range]");
    if (range) {
      state.range = range.dataset.range;
      state.current = firstIncomplete(...rangeBounds());
      render();
      return;
    }
    const view = event.target.closest("[data-view-mode]");
    if (view) { state.view = view.dataset.viewMode; render(); return; }
    const navigate = event.target.closest("[data-navigate]");
    if (navigate) { goTo(state.current + (navigate.dataset.navigate === "next" ? 1 : -1)); return; }
    if (event.target.closest("[data-jump]")) { goTo(Number(dashboard.querySelector("[data-jump-input]").value)); return; }
    if (event.target.closest("[data-next-open]")) {
      const [first, last] = rangeBounds();
      const next = [...questions.slice(state.current, last), ...questions.slice(first - 1, state.current - 1)].find(q => !complete(q.number, answer(q.number)));
      if (next) goTo(next.number); else status.textContent = "本組題目已全部完成。";
      return;
    }
    const mark = event.target.closest("[data-mark]");
    if (mark) { mutate(Number(mark.dataset.number), a => { a.mark = mark.dataset.mark; }); return; }
    const word = event.target.closest("[data-word]");
    if (word) {
      const number = Number(word.dataset.number);
      const index = Number(word.dataset.word);
      mutate(number, a => {
        if (a.mark !== "cross") return;
        if (a.start === index && a.end === index) { delete a.start; delete a.end; }
        else if (Number.isInteger(a.start) && a.start === a.end) a.end = index;
        else { a.start = index; a.end = index; }
      });
    }
  });
  dashboard.addEventListener("keydown", event => {
    if (event.key === "Enter" && event.target.matches("[data-jump-input]")) {
      event.preventDefault();
      goTo(Number(event.target.value));
    }
  });
  list.addEventListener("input", event => {
    if (event.target.matches("[data-correction]")) mutate(Number(event.target.dataset.correction), a => { a.correction = event.target.value; }, false);
  });
  list.addEventListener("change", event => {
    if (event.target.matches("[data-remove]")) mutate(Number(event.target.dataset.remove), a => { a.remove = event.target.checked; });
  });

  function payload() {
    const result = {};
    questions.forEach(q => {
      const a = answer(q.number);
      if (!complete(q.number, a)) return;
      result[q.number] = a.mark === "tick" ? { mark: "tick" } : {
        mark: "cross", start: Math.min(a.start, a.end), end: Math.max(a.start, a.end),
        selected: selectedText(q.number, a), correction: a.remove ? "" : a.correction.trim(), remove: a.remove === true
      };
    });
    return result;
  }
  function scheduleSync(delay) {
    clearTimeout(state.syncTimer);
    state.syncTimer = setTimeout(syncAnswers, delay);
  }
  async function syncAnswers() {
    const session = portal.getSession();
    if (!session.token || state.loading) return;
    if (state.submitting) { scheduleSync(400); return; }
    const answers = payload();
    const signature = JSON.stringify(answers);
    if (!Object.keys(answers).length || signature === state.syncedSignature) return;
    state.submitting = true;
    let saved = false;
    status.textContent = "正在儲存並載入參考答案…";
    try {
      const result = await portal.rpc("error_identifier_submission", { p_token: session.token, p_action: "submit", p_answers: answers });
      state.submittedAt = result.submitted_at || new Date().toISOString();
      state.submittedAnswers = result.answers || answers;
      state.syncedSignature = signature;
      saved = true;
      saveDraft();
      try {
        state.feedback = await portal.rpc("error_identifier_feedback", { p_token: session.token });
        renderSummary();
        list.querySelectorAll("[data-feedback-slot]").forEach(slot => { slot.innerHTML = renderFeedback(Number(slot.dataset.feedbackSlot)); });
        status.textContent = `${result.answered_count} 題已儲存；參考答案已顯示。`;
      } catch {
        status.textContent = `${result.answered_count} 題已儲存；參考答案暫時無法載入。`;
      }
    } catch (error) {
      status.textContent = `儲存失敗：${error.message || "請稍後再試"}`;
    } finally {
      state.submitting = false;
      refreshCounter();
      if (saved && JSON.stringify(payload()) !== state.syncedSignature) scheduleSync(850);
    }
  }

  async function onSession() {
    const session = portal.getSession();
    if (!session.user || !session.token) {
      clearTimeout(state.syncTimer);
      state.userId = ""; state.mode = ""; state.answers = {}; state.submittedAnswers = {}; state.feedback = {}; state.submittedAt = ""; state.syncedSignature = "";
      modes.hidden = false; single.hidden = true; passage.hidden = true; bar.hidden = true;
      return;
    }
    if (state.userId === session.user.id) return;
    state.userId = session.user.id;
    state.mode = "";
    state.loading = true;
    const draft = loadDraft();
    state.answers = draft?.answers || {};
    state.stamp = draft?.stamp || 0;
    status.textContent = "正在載入已提交答案…";
    try {
      const remote = await portal.rpc("error_identifier_submission", { p_token: session.token, p_action: "get", p_answers: {} });
      if (state.userId !== session.user.id) return;
      const remoteStamp = remote.submitted_at ? Date.parse(remote.submitted_at) : 0;
      if (remoteStamp > state.stamp && remote.answers) state.answers = remote.answers;
      state.submittedAnswers = remote.answers || {};
      state.syncedSignature = JSON.stringify(remote.answers || {});
      state.submittedAt = remote.submitted_at || "";
      if (remote.submitted_at) {
        try {
          state.feedback = await portal.rpc("error_identifier_feedback", { p_token: session.token });
          status.textContent = `${remote.answered_count} 題已儲存；完成新題目會自動顯示參考答案。`;
        } catch {
          status.textContent = `${remote.answered_count} 題已儲存；參考答案暫時無法載入。`;
        }
      } else status.textContent = "完成作答後自動顯示參考答案。";
    } catch (error) {
      status.textContent = `暫時無法載入已提交答案：${error.message || "請稍後再試"}`;
    } finally {
      state.current = firstIncomplete(1, 60);
      state.loading = false;
      render();
      if (state.userId === session.user.id) applyHomeworkRoute();
      if (Object.keys(payload()).length && JSON.stringify(payload()) !== state.syncedSignature) scheduleSync(500);
    }
  }
  window.addEventListener("edmund:learning-portal-session", onSession);
  onSession();
})();
