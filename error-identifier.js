(() => {
  "use strict";
  const portal = window.EDMUND_LEARNING_PORTAL_CONTEXT;
  const questions = window.ERROR_IDENTIFIER_QUESTIONS;
  const dashboard = document.querySelector('[data-view="dashboard"]');
  if (!portal || !dashboard || !Array.isArray(questions)) return;

  const escaped = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const words = new Map(questions.map(q => [q.number, q.sentence.match(/\S+/g) || []]));
  const state = { answers: {}, userId: "", loading: false, submitting: false, submittedAt: "", stamp: 0 };
  const key = () => `edmund-error-identifier-draft-v1:${state.userId}`;
  const answer = number => state.answers[number] || {};
  const selectedText = (number, a) => {
    if (!Number.isInteger(a.start) || !Number.isInteger(a.end)) return "";
    return words.get(number).slice(Math.min(a.start, a.end), Math.max(a.start, a.end) + 1).join(" ");
  };
  const complete = (number, a) => a.mark === "tick" || (a.mark === "cross" && selectedText(number, a) && (a.remove === true || String(a.correction || "").trim()));
  const completedCount = () => questions.filter(q => complete(q.number, answer(q.number))).length;
  const saveDraft = () => {
    state.stamp = Date.now();
    try { localStorage.setItem(key(), JSON.stringify({ answers: state.answers, stamp: state.stamp })); } catch { /* Private browsing may disable local storage. */ }
  };
  const loadDraft = () => {
    try {
      const draft = JSON.parse(localStorage.getItem(key()) || "null");
      if (draft && draft.answers && typeof draft.answers === "object") return draft;
    } catch { /* Ignore stale local data. */ }
    return null;
  };

  dashboard.insertAdjacentHTML("beforeend", `<section class="error-id-workspace panel" aria-labelledby="error-id-heading">
    <div class="error-id-intro"><div><p class="eyebrow">PROOFREADING · 60 SENTENCES</p><h2 id="error-id-heading">找出錯誤，寫出改法</h2><p>逐句選擇 ✓ 正確或 ✕ 錯誤。選擇錯誤後，點選句子中的字；如需選取連續多字，再點選最後一字，然後輸入改法。</p></div><span class="error-id-total">共 60 題</span></div>
    <div class="error-id-list" data-error-id-list></div>
  </section>
  <div class="error-id-submit-bar" data-error-id-bar><div class="error-id-submit-bar__inner"><div><strong data-error-id-count>0 / 60 已完成</strong><small data-error-id-status role="status" aria-live="polite">可以提交部分答案，稍後繼續。</small></div><button type="button" class="error-id-submit" data-error-id-submit disabled>提交部分答案</button></div></div>`);
  const list = dashboard.querySelector("[data-error-id-list]");
  const count = dashboard.querySelector("[data-error-id-count]");
  const status = dashboard.querySelector("[data-error-id-status]");
  const submit = dashboard.querySelector("[data-error-id-submit]");

  function renderQuestion(q) {
    const a = answer(q.number);
    const tokens = words.get(q.number);
    const lo = Math.min(a.start ?? -1, a.end ?? -1);
    const hi = Math.max(a.start ?? -1, a.end ?? -1);
    const sentence = tokens.map((word, index) => `<button type="button" class="error-id-word${a.mark === "cross" && lo >= 0 && index >= lo && index <= hi ? " is-selected" : ""}" data-word="${index}" data-number="${q.number}" ${a.mark === "cross" ? "" : "disabled"} aria-label="選取 ${escaped(word)}">${escaped(word)}</button>`).join(" ");
    return `<article class="error-id-question${a.mark ? " is-answered" : ""}" data-question="${q.number}">
      <div class="error-id-question__main"><span class="error-id-number">${String(q.number).padStart(2, "0")}</span><div class="error-id-sentence" lang="en">${sentence}</div></div>
      <div class="error-id-choice" role="group" aria-label="第 ${q.number} 題判斷"><button type="button" data-mark="tick" data-number="${q.number}" class="${a.mark === "tick" ? "is-active" : ""}" aria-pressed="${a.mark === "tick"}">✓ <span>正確</span></button><button type="button" data-mark="cross" data-number="${q.number}" class="${a.mark === "cross" ? "is-active" : ""}" aria-pressed="${a.mark === "cross"}">✕ <span>錯誤</span></button></div>
      ${a.mark === "cross" ? `<div class="error-id-correction"><span>錯誤字詞：<strong>${selectedText(q.number, a) ? escaped(selectedText(q.number, a)) : "請點選上方句子"}</strong></span><label for="error-id-correction-${q.number}">應改為</label><input id="error-id-correction-${q.number}" data-correction="${q.number}" type="text" autocomplete="off" maxlength="180" value="${escaped(a.correction || "")}" placeholder="輸入正確字詞或片語" ${a.remove ? "disabled" : ""}><label class="error-id-remove"><input type="checkbox" data-remove="${q.number}" ${a.remove ? "checked" : ""}> 刪除所選字詞</label></div>` : ""}
    </article>`;
  }
  function refreshCounter() {
    const done = completedCount();
    count.textContent = `${done} / ${questions.length} 已完成`;
    submit.textContent = done === questions.length ? "提交全部答案" : "提交部分答案";
    submit.disabled = state.loading || state.submitting || done === 0;
  }
  function render() {
    list.innerHTML = questions.map(renderQuestion).join("");
    refreshCounter();
  }
  function mutate(number, updater, rerender = true) {
    const a = { ...answer(number) };
    updater(a);
    state.answers[number] = a;
    saveDraft();
    if (rerender) render(); else refreshCounter();
    if (state.submittedAt) status.textContent = "有未提交的修改。";
  }
  list.addEventListener("click", event => {
    const mark = event.target.closest("[data-mark]");
    if (mark) {
      const number = Number(mark.dataset.number);
      mutate(number, a => { a.mark = mark.dataset.mark; });
      return;
    }
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
  list.addEventListener("input", event => {
    if (event.target.matches("[data-correction]")) {
      const number = Number(event.target.dataset.correction);
      mutate(number, a => { a.correction = event.target.value; }, false);
    }
  });
  list.addEventListener("change", event => {
    if (event.target.matches("[data-remove]")) {
      const number = Number(event.target.dataset.remove);
      mutate(number, a => { a.remove = event.target.checked; });
    }
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
  submit.addEventListener("click", async () => {
    const session = portal.getSession();
    if (!session.token || state.submitting) return;
    const answers = payload();
    state.submitting = true;
    refreshCounter();
    status.textContent = "正在提交…";
    try {
      const result = await portal.rpc("error_identifier_submission", { p_token: session.token, p_action: "submit", p_answers: answers });
      state.submittedAt = result.submitted_at || new Date().toISOString();
      status.textContent = `${result.answered_count} 題已提交並儲存。${result.is_complete ? "全部完成！" : "可以繼續作答並再次提交。"}`;
      saveDraft();
    } catch (error) {
      status.textContent = `提交失敗：${error.message || "請稍後再試"}`;
    } finally {
      state.submitting = false;
      refreshCounter();
    }
  });

  async function onSession() {
    const session = portal.getSession();
    if (!session.user || !session.token) { state.userId = ""; state.answers = {}; state.submittedAt = ""; render(); return; }
    if (state.userId === session.user.id) return;
    state.userId = session.user.id;
    state.loading = true;
    const draft = loadDraft();
    state.answers = draft?.answers || {};
    state.stamp = draft?.stamp || 0;
    render();
    status.textContent = "正在載入已提交答案…";
    try {
      const remote = await portal.rpc("error_identifier_submission", { p_token: session.token, p_action: "get", p_answers: {} });
      if (state.userId !== session.user.id) return;
      const remoteStamp = remote.submitted_at ? Date.parse(remote.submitted_at) : 0;
      if (remoteStamp > state.stamp && remote.answers) state.answers = remote.answers;
      state.submittedAt = remote.submitted_at || "";
      status.textContent = remote.submitted_at ? `${remote.answered_count} 題已提交。可以繼續作答。` : "可以提交部分答案，稍後繼續。";
    } catch (error) {
      status.textContent = `暫時無法載入已提交答案：${error.message || "請稍後再試"}`;
    } finally {
      state.loading = false;
      render();
    }
  }
  window.addEventListener("edmund:learning-portal-session", onSession);
  render();
  onSession();
})();
