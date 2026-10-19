(() => {
  "use strict";
  const portal = window.EDMUND_LEARNING_PORTAL_CONTEXT;
  const passages = window.ERROR_IDENTIFIER_PASSAGES;
  const root = document.querySelector("[data-passage-root]");
  if (!portal || !root || !Array.isArray(passages)) return;

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const state = { userId: "", passageId: 0, answers: {}, submitted: {}, feedback: {}, stamp: 0, loading: false, saving: false, status: "" };
  const passage = () => passages.find(item => item.id === state.passageId);
  const storageKey = id => `edmund-error-identifier-passage-v1:${state.userId}:${id}`;
  const words = line => (passage()?.lines[line - 1] || "").match(/\S+/g) || [];
  const answer = line => state.answers[line] || {};
  const selectedText = (line, a) => Number.isInteger(a.start) && Number.isInteger(a.end)
    ? words(line).slice(Math.min(a.start, a.end), Math.max(a.start, a.end) + 1).join(" ") : "";
  const complete = line => {
    const a = answer(line);
    return a.mark === "tick" || (a.mark === "cross" && selectedText(line, a) && (a.remove || String(a.correction || "").trim()));
  };
  const needsWordSelection = line => {
    const a = answer(line);
    return a.mark === "cross" && !selectedText(line, a) && !!(a.remove || String(a.correction || "").trim());
  };
  const firstMissingWord = () => Array.from({ length: 16 }, (_, i) => i + 1).find(needsWordSelection);
  const completedCount = () => Array.from({ length: 16 }, (_, i) => i + 1).filter(complete).length;
  const readDraft = id => {
    try { return JSON.parse(localStorage.getItem(storageKey(id)) || "null"); } catch { return null; }
  };
  const saveDraft = () => {
    state.stamp = Date.now();
    try { localStorage.setItem(storageKey(state.passageId), JSON.stringify({ answers: state.answers, stamp: state.stamp })); } catch { /* Local storage may be unavailable. */ }
  };
  const payload = () => {
    const result = {};
    for (let line = 1; line <= 16; line++) {
      if (!complete(line)) continue;
      const a = answer(line);
      result[line] = a.mark === "tick" ? { mark: "tick" } : {
        mark: "cross", start: Math.min(a.start, a.end), end: Math.max(a.start, a.end),
        selected: selectedText(line, a), correction: a.remove ? "" : a.correction.trim(), remove: a.remove === true
      };
    }
    return result;
  };

  function renderLibrary() {
    root.innerHTML = `<div class="error-id-passage-header"><p class="eyebrow">MODE 02 · PASSAGE PROOFREADING</p><h2 id="error-id-passage-heading">文章校對</h2><p>先閱讀整篇文章，再逐行判斷與修改。</p></div><div class="error-id-passage-library">${passages.map(item => {
      const saved = readDraft(item.id);
      const count = Object.values(saved?.answers || {}).filter(a => a.mark === "tick" || (a.mark === "cross" && Number.isInteger(a.start) && Number.isInteger(a.end) && (a.remove || String(a.correction || "").trim()))).length;
      return `<button type="button" class="error-id-passage-library__card" data-passage-open="${item.id}"><span>PASSAGE ${String(item.id).padStart(2, "0")}</span><strong lang="en">${esc(item.title)}</strong><small>${count ? `${count} / 16 已作答` : "16 句 · 開始閱讀"}</small><b aria-hidden="true">↗</b></button>`;
    }).join("")}</div>`;
  }

  function renderFeedback(line) {
    const ref = state.feedback[line];
    const student = state.submitted[line];
    if (!ref || !student) return "";
    const matching = ref.mark === student.mark;
    const submittedText = student.mark === "tick" ? "✓ 正確" : `✕ ${esc(student.selected)} → ${student.remove ? "刪除" : esc(student.correction)}`;
    const referenceText = ref.mark === "tick" ? "✓ 原句正確" : `✕ ${esc(ref.wrong)} → ${esc(ref.fix)}`;
    return `<div class="error-id-passage-feedback"><div class="error-id-passage-feedback__top"><b>參考答案</b><span class="${matching ? "is-match" : "is-different"}">${matching ? "判斷吻合" : "判斷需修正"}</span></div><div class="error-id-passage-feedback__pair"><p><small>你的答案</small><span lang="en">${submittedText}</span></p><p><small>參考改法</small><span lang="en">${referenceText}</span></p></div>${ref.mark === "cross" ? `<p class="error-id-passage-feedback__correct" lang="en">${esc(ref.correct_sentence)}</p>` : ""}<details><summary>逐步解說</summary><p>${esc(ref.reason).replaceAll("\n", "<br>")}</p>${ref.tip ? `<p>${esc(ref.tip)}</p>` : ""}</details></div>`;
  }

  function renderLine(line) {
    const a = answer(line);
    const low = Math.min(a.start ?? -1, a.end ?? -1);
    const high = Math.max(a.start ?? -1, a.end ?? -1);
    const sentence = words(line).map((word, i) => `<button type="button" data-passage-word="${i}" data-line="${line}" class="error-id-passage-word${a.mark === "cross" && low >= 0 && i >= low && i <= high ? " is-selected" : ""}" ${a.mark === "cross" ? "" : "disabled"} aria-label="選取 ${esc(word)}">${esc(word)}</button>`).join(" ");
    return `<section class="error-id-passage-line${complete(line) ? " is-complete" : ""}${needsWordSelection(line) ? " needs-word-selection" : ""}" data-passage-line="${line}"><div class="error-id-passage-line__main"><span class="error-id-passage-line__number">${String(line).padStart(2, "0")}</span><p lang="en">${sentence}</p><div class="error-id-passage-line__choices" role="group" aria-label="第 ${line} 行判斷"><button type="button" data-passage-mark="tick" data-line="${line}" class="${a.mark === "tick" ? "is-active" : ""}" aria-pressed="${a.mark === "tick"}">✓</button><button type="button" data-passage-mark="cross" data-line="${line}" class="${a.mark === "cross" ? "is-active" : ""}" aria-pressed="${a.mark === "cross"}">✕</button></div></div>${a.mark === "cross" ? `<div class="error-id-passage-correction"><span>${selectedText(line, a) ? `錯誤字詞：<b lang="en">${esc(selectedText(line, a))}</b>` : "點選句子中的錯誤字詞；連續多字可點選起點與終點。"}</span><label for="passage-correction-${line}">改為</label><input id="passage-correction-${line}" data-passage-correction="${line}" type="text" maxlength="180" autocomplete="off" value="${esc(a.correction || "")}" ${a.remove ? "disabled" : ""}><label class="error-id-passage-correction__remove"><input type="checkbox" data-passage-remove="${line}" ${a.remove ? "checked" : ""}> 刪除所選字詞</label></div><p class="error-id-passage-word-hint" data-passage-word-hint="${line}" role="status" ${needsWordSelection(line) ? "" : "hidden"}>請先點選句子中的錯誤字詞。</p>` : ""}${renderFeedback(line)}</section>`;
  }

  function renderReader() {
    const item = passage();
    if (!item) { renderLibrary(); return; }
    root.innerHTML = `<div class="error-id-passage-reader"><div class="error-id-passage-reader__top"><button type="button" class="error-id-back" data-passage-library>← 返回文章列表</button><span>PASSAGE ${String(item.id).padStart(2, "0")} / 11</span></div><header><p class="eyebrow">READ THE WHOLE STORY FIRST</p><h2 id="error-id-passage-heading" lang="en">${esc(item.title)}</h2><p>逐行選擇 ✓ 或 ✕。若有錯，點選字詞並填寫改法。</p></header><div class="error-id-passage-lines">${item.lines.map((_, i) => renderLine(i + 1)).join("")}</div><div class="error-id-passage-submit"><div><strong data-passage-count>${completedCount()} / 16 已作答</strong><small data-passage-status role="status" aria-live="polite">${esc(state.status)}</small></div><button type="button" data-passage-submit ${(completedCount() || firstMissingWord()) && !state.saving ? "" : "disabled"}>${completedCount() === 16 ? "提交全部答案" : completedCount() ? "提交已完成答案" : "提交答案"}</button></div></div>`;
  }
  function refreshReader() {
    if (!passage()) return;
    const count = root.querySelector("[data-passage-count]");
    const status = root.querySelector("[data-passage-status]");
    const button = root.querySelector("[data-passage-submit]");
    if (count) count.textContent = `${completedCount()} / 16 已作答`;
    if (status) status.textContent = state.status;
    if (button) { button.disabled = !(completedCount() || firstMissingWord()) || state.saving || state.loading; button.textContent = completedCount() === 16 ? "提交全部答案" : completedCount() ? "提交已完成答案" : "提交答案"; }
  }
  function mutate(line, updater, rerender = true) {
    const a = { ...answer(line) };
    updater(a);
    state.answers[line] = a;
    state.status = "答案已暫存；提交後查看參考改法。";
    saveDraft();
    if (rerender) {
      const section = root.querySelector(`[data-passage-line="${line}"]`);
      if (section) section.outerHTML = renderLine(line);
    } else {
      const section = root.querySelector(`[data-passage-line="${line}"]`);
      if (section) section.classList.toggle("needs-word-selection", needsWordSelection(line));
      const hint = root.querySelector(`[data-passage-word-hint="${line}"]`);
      if (hint) hint.hidden = !needsWordSelection(line);
    }
    refreshReader();
  }
  async function openPassage(id) {
    const expectedOwner = state.userId;
    const session = portal.getSession();
    if (!passages.some(item => item.id === id) || !expectedOwner || !session.token || session.user?.id !== expectedOwner) return;
    const route = new URL(location.href); route.searchParams.set("mode", "passage"); route.searchParams.set("passage", id); route.searchParams.delete("question"); history.replaceState(null, "", route);
    state.passageId = id;
    state.answers = {}; state.submitted = {}; state.feedback = {}; state.loading = true; state.status = "正在載入練習…";
    const draft = readDraft(id);
    state.answers = draft?.answers || {};
    state.stamp = draft?.stamp || 0;
    renderReader();

    try {
      const remote = await portal.rpc("error_identifier_passage_action", { p_token: session.token, p_passage_id: id, p_action: "get", p_answers: {} });
      if (state.passageId !== id || state.userId !== expectedOwner) return;
      const remoteStamp = remote.submitted_at ? Date.parse(remote.submitted_at) : 0;
      if (remoteStamp > state.stamp) state.answers = remote.answers || {};
      state.submitted = remote.answers || {};
      if (remote.submitted_at) {
        const feedback = await portal.rpc("error_identifier_passage_feedback", { p_token: session.token, p_passage_id: id });
        if (state.passageId !== id || state.userId !== expectedOwner) return;
        state.feedback = feedback;
        state.status = `${remote.answered_count} 行已提交；可在各行下方查看解說。`;
      } else state.status = "完成一行後可繼續；提交時可保留未完成的行。";
    } catch (error) { if (state.passageId !== id || state.userId !== expectedOwner) return; state.status = `載入失敗：${error.message || "請稍後再試"}`; }
    finally { if (state.passageId === id && state.userId === expectedOwner) { state.loading = false; renderReader(); } }
  }

  root.addEventListener("click", event => {
    const open = event.target.closest("[data-passage-open]");
    if (open) { openPassage(Number(open.dataset.passageOpen)); return; }
    if (event.target.closest("[data-passage-library]")) { state.passageId = 0; const route = new URL(location.href); route.searchParams.delete("passage"); history.replaceState(null, "", route); renderLibrary(); return; }
    const mark = event.target.closest("[data-passage-mark]");
    if (mark) { mutate(Number(mark.dataset.line), a => { a.mark = mark.dataset.passageMark; }); return; }
    const word = event.target.closest("[data-passage-word]");
    if (word) {
      const line = Number(word.dataset.line), index = Number(word.dataset.passageWord);
      mutate(line, a => {
        if (a.mark !== "cross") return;
        if (a.start === index && a.end === index) { delete a.start; delete a.end; }
        else if (Number.isInteger(a.start) && a.start === a.end) a.end = index;
        else { a.start = index; a.end = index; }
      });
      return;
    }
    if (event.target.closest("[data-passage-submit]")) submitPassage();
  });
  root.addEventListener("input", event => {
    if (event.target.matches("[data-passage-correction]")) mutate(Number(event.target.dataset.passageCorrection), a => { a.correction = event.target.value; }, false);
  });
  root.addEventListener("change", event => {
    if (event.target.matches("[data-passage-remove]")) mutate(Number(event.target.dataset.passageRemove), a => { a.remove = event.target.checked; });
  });

  async function submitPassage() {
    const id = state.passageId;
    const session = portal.getSession();
    const missingWord = firstMissingWord();
    if (missingWord) {
      state.status = `第 ${String(missingWord).padStart(2, "0")} 行：請先點選句子中的錯誤字詞。`;
      refreshReader();
      root.querySelector(`[data-passage-line="${missingWord}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const answers = payload();
    if (!session.token || !id || !Object.keys(answers).length || state.saving) return;
    state.saving = true; state.status = "正在提交…"; refreshReader();
    try {
      const result = await portal.rpc("error_identifier_passage_action", { p_token: session.token, p_passage_id: id, p_action: "submit", p_answers: answers });
      if (state.passageId !== id) return;
      state.submitted = result.answers || answers;
      state.feedback = await portal.rpc("error_identifier_passage_feedback", { p_token: session.token, p_passage_id: id });
      state.status = `${result.answered_count} 行已提交；參考答案顯示在各行下方。`;
    } catch (error) { state.status = `提交失敗：${error.message || "請稍後再試"}`; }
    finally { state.saving = false; if (state.passageId === id) renderReader(); }
  }

  function applyHomeworkPassage() {
    const route = new URLSearchParams(location.search), raw = route.get("passage");
    const id = Number(raw);
    if (route.get("mode") === "passage" && /^[1-9]\d*$/.test(raw || "") && passages.some(p => p.id === id) && state.userId && state.passageId !== id) void openPassage(id);
  }
  window.addEventListener("edmund:error-id-mode", event => {
    if (event.detail?.mode === "passage") { if (!state.passageId) renderLibrary(); applyHomeworkPassage(); }
  });
  window.addEventListener("edmund:learning-portal-session", () => {
    const session = portal.getSession();
    const id = session.user?.id || "";
    if (state.userId === id) return;
    state.userId = id;
    state.passageId = 0;
    state.answers = {}; state.submitted = {}; state.feedback = {};
    renderLibrary();
    applyHomeworkPassage();
  });
  state.userId = portal.getSession().user?.id || "";
  renderLibrary();
  applyHomeworkPassage();
})();
