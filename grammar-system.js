(function () {
  "use strict";

  function replaceMiaWithTom(value) {
    if (typeof value === "string") return value.replace(/\bMia\b/g, "Tom").replaceAll("米婭", "湯姆");
    if (Array.isArray(value)) return value.map(replaceMiaWithTom);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, replaceMiaWithTom(item)]));
    return value;
  }

  const questions = Array.isArray(window.EDMUND_GRAMMAR_TENSE_QUESTIONS)
    ? replaceMiaWithTom(window.EDMUND_GRAMMAR_TENSE_QUESTIONS)
    : [];
  const portalRoot = document.querySelector('[data-learning-portal-root]');
  if (!portalRoot || questions.length !== 150 || questions.some((item, index) => item.number !== index + 1)) {
    console.error("Tense practice data is incomplete.");
    return;
  }

  const state = {
    current: 1,
    attempts: {},
    remoteCorrect: new Set(),
    userId: "",
    token: "",
    questionStartedAt: performance.now(),
    loadingProgress: false,
    bookmarks: new Set()
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  })[character]);

  function normaliseAnswer(value) {
    return String(value ?? "")
      .normalize("NFKC")
      .replace(/[‘’]/g, "'")
      .replace(/(?:\.\.\.|…|\/|,|;)/g, " ")
      .replace(/[.!?]+$/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLocaleLowerCase("en");
  }

  function isCorrect(question, answer) {
    const response = normaliseAnswer(answer);
    if (!response) return false;
    if (question.acceptedAnswers.some((candidate) => normaliseAnswer(candidate) === response)) return true;
    const blanks = question.prompt.match(/_+/g) || [];
    if (!blanks.length) return false;
    return question.acceptedAnswers.some((candidate) => {
      const parts = String(candidate).split(/\s*(?:\.{2,}|\/)\s*|\s+/).filter(Boolean);
      if (blanks.length > 1 && parts.length !== blanks.length) return false;
      let partIndex = 0;
      const completed = question.prompt
        .replace(/_+(?:\s*\([^)]*\))?/g, () => blanks.length === 1 ? candidate : parts[partIndex++] || "")
        .replace(/\s+([,.!?;:])/g, "$1");
      return normaliseAnswer(completed) === response;
    });
  }

  function localKey() {
    return `edmund-grammar-tense-v1:${state.userId || "guest"}`;
  }

  function readLocal() {
    try {
      const saved = JSON.parse(localStorage.getItem(localKey()) || "null");
      if (!saved || typeof saved !== "object") return;
      if (Number.isInteger(saved.current) && saved.current >= 1 && saved.current <= 150) state.current = saved.current;
      if (saved.attempts && typeof saved.attempts === "object") {
        state.attempts = Object.fromEntries(Object.entries(saved.attempts).filter(([key, value]) => {
          const number = Number(key);
          return number >= 1 && number <= 150 && value && ["correct", "wrong"].includes(value.status);
        }));
      }
    } catch { /* Local progress is optional. */ }
  }

  function saveLocal() {
    try {
      localStorage.setItem(localKey(), JSON.stringify({ current: state.current, attempts: state.attempts }));
    } catch { /* Local progress is optional. */ }
  }

  const dashboard = portalRoot.querySelector('[data-view="dashboard"]');
  const placeholder = dashboard?.querySelector(".learning-portal-empty");
  if (!dashboard || !placeholder) return;

  placeholder.outerHTML = `
    <section class="panel grammar-library" data-grammar-library aria-labelledby="grammar-library-title">
      <div class="grammar-library__head">
        <div><p class="eyebrow">GRAMMAR PRACTICE</p><h2 id="grammar-library-title">語法練習</h2><p>先作答，再逐步理解時態選擇。</p></div>
      </div>
      <article class="grammar-lesson-card">
        <div class="grammar-lesson-card__copy"><p class="eyebrow">EXERCISE 01 · 150 QUESTIONS</p><h3>Tense <span lang="zh-Hant">時態</span></h3><p>每題提交後即時顯示對錯，並開啟逐步解析。無需先背誦長篇規則。</p></div>
        <div class="grammar-lesson-card__stats" aria-label="Tense 練習進度">
          <div><strong data-correct-count>0</strong><span>已答對</span></div>
          <div><strong data-attempted-count>0</strong><span>已作答</span></div>
          <button class="grammar-button" type="button" data-start-tense>開始練習</button>
        </div>
      </article>
    </section>
    <section class="panel grammar-practice" data-grammar-practice hidden aria-labelledby="grammar-practice-title">
      <div class="grammar-practice__head">
        <div><button class="grammar-button--ghost" type="button" data-back-library>← 返回練習目錄</button><p class="eyebrow">TENSE · 時態</p><h2 id="grammar-practice-title">逐題練習</h2></div>
        <div class="grammar-practice__summary"><strong data-practice-score>0</strong><span>/ 150<br>已答對</span></div>
      </div>
      <div class="grammar-progress" role="progressbar" aria-label="答對進度" aria-valuemin="0" aria-valuemax="150" aria-valuenow="0"><span data-progress-fill></span></div>
      <div class="grammar-navigator">
        <div class="grammar-navigator__bar"><label><span class="sr-only">題目範圍</span><select class="grammar-range-select" data-question-range aria-label="選擇題目範圍"></select></label><span class="grammar-navigator__legend">綠色：答對 · 紅色：需再試</span></div>
        <div class="grammar-number-grid" data-question-grid aria-label="選擇題目"></div>
      </div>
      <article class="grammar-question">
        <div class="grammar-question__meta"><span class="grammar-question__number" data-question-number></span><span class="grammar-question__tense" data-question-tense></span><button class="grammar-bookmark" type="button" data-question-bookmark aria-pressed="false">☆ 收藏這題</button></div>
        <p class="grammar-question__prompt" data-question-prompt></p>
        <p class="grammar-question__translation" data-question-translation></p>
        <form class="grammar-answer" data-answer-form novalidate>
          <label>您的答案<input name="answer" autocomplete="off" autocapitalize="none" spellcheck="false" required aria-describedby="grammar-answer-hint grammar-feedback"></label>
          <p class="grammar-answer__hint" id="grammar-answer-hint">可輸入單獨答案或完整句子；如有兩個空格，請依次輸入答案。</p>
          <div class="grammar-answer__actions"><button class="grammar-button grammar-button--primary" type="submit">提交答案</button></div>
          <div class="grammar-feedback" id="grammar-feedback" data-feedback hidden aria-live="polite"></div>
        </form>
        <section class="grammar-explanation" data-inline-explanation hidden aria-labelledby="grammar-explanation-title">
          <div class="grammar-explanation__head"><div><p class="eyebrow">STEP-BY-STEP</p><h3 id="grammar-explanation-title" data-explanation-title>逐步解析</h3></div><p data-explanation-answer></p></div>
          <p class="grammar-explanation__instruction">請讀完每一步，再勾選「我已讀懂」，下一步才會顯示。</p>
          <div class="grammar-steps" data-inline-steps></div>
        </section>
      </article>
      <nav class="grammar-nav" aria-label="題目導覽"><button type="button" data-previous-question>← 上一題</button><button type="button" data-next-question>下一題 →</button></nav>
      <p class="grammar-save-status" data-save-status aria-live="polite"></p>
    </section>`;

  const elements = {
    library: dashboard.querySelector("[data-grammar-library]"), practice: dashboard.querySelector("[data-grammar-practice]"),
    start: dashboard.querySelector("[data-start-tense]"), back: dashboard.querySelector("[data-back-library]"),
    correctCount: dashboard.querySelector("[data-correct-count]"), attemptedCount: dashboard.querySelector("[data-attempted-count]"),
    score: dashboard.querySelector("[data-practice-score]"), progress: dashboard.querySelector(".grammar-progress"), progressFill: dashboard.querySelector("[data-progress-fill]"),
    range: dashboard.querySelector("[data-question-range]"), grid: dashboard.querySelector("[data-question-grid]"),
    number: dashboard.querySelector("[data-question-number]"), tense: dashboard.querySelector("[data-question-tense]"), prompt: dashboard.querySelector("[data-question-prompt]"), translation: dashboard.querySelector("[data-question-translation]"),
    form: dashboard.querySelector("[data-answer-form]"), input: dashboard.querySelector('[name="answer"]'), feedback: dashboard.querySelector("[data-feedback]"),
    previous: dashboard.querySelector("[data-previous-question]"), next: dashboard.querySelector("[data-next-question]"), saveStatus: dashboard.querySelector("[data-save-status]"),
    questionBookmark: dashboard.querySelector("[data-question-bookmark]"), explanation: dashboard.querySelector("[data-inline-explanation]"), explanationTitle: dashboard.querySelector("[data-explanation-title]"), explanationAnswer: dashboard.querySelector("[data-explanation-answer]"), explanationSteps: dashboard.querySelector("[data-inline-steps]")
  };

  for (let start = 1; start <= 150; start += 25) {
    const end = Math.min(start + 24, 150);
    elements.range.insertAdjacentHTML("beforeend", `<option value="${start}">第 ${start}–${end} 題</option>`);
  }

  function correctNumbers() {
    return new Set([...state.remoteCorrect, ...Object.entries(state.attempts).filter(([, item]) => item.status === "correct").map(([number]) => Number(number))]);
  }

  function updateTotals() {
    const correct = correctNumbers().size;
    const attempted = Object.keys(state.attempts).length;
    elements.correctCount.textContent = String(correct);
    elements.attemptedCount.textContent = String(attempted);
    elements.score.textContent = String(correct);
    elements.progress.setAttribute("aria-valuenow", String(correct));
    elements.progressFill.style.width = `${correct / 150 * 100}%`;
    elements.start.textContent = attempted || correct ? "繼續練習" : "開始練習";
  }

  function rangeStart(number = state.current) { return Math.floor((number - 1) / 25) * 25 + 1; }

  function renderGrid() {
    const start = Number(elements.range.value) || rangeStart();
    elements.grid.replaceChildren();
    for (let number = start; number < start + 25 && number <= 150; number += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(number);
      button.dataset.questionNumber = String(number);
      if (number === state.current) button.setAttribute("aria-current", "true");
      const attempt = state.attempts[number];
      if (state.remoteCorrect.has(number) || attempt?.status === "correct") button.dataset.state = "correct";
      else if (attempt?.status === "wrong") button.dataset.state = "wrong";
      button.setAttribute("aria-label", `第 ${number} 題${button.dataset.state === "correct" ? "，已答對" : button.dataset.state === "wrong" ? "，需要再試" : ""}`);
      button.addEventListener("click", () => showQuestion(number, true));
      elements.grid.append(button);
    }
  }

  function showQuestion(number, focus = false) {
    state.current = Math.min(150, Math.max(1, Number(number) || 1));
    state.questionStartedAt = performance.now();
    saveLocal();
    const question = questions[state.current - 1];
    elements.range.value = String(rangeStart());
    elements.number.textContent = `QUESTION ${question.number} / 150`;
    elements.tense.textContent = question.tense;
    elements.prompt.textContent = question.prompt;
    elements.translation.textContent = question.translation;
    elements.input.value = state.attempts[state.current]?.answer || "";
    elements.input.removeAttribute("aria-invalid");
    elements.feedback.hidden = true;
    elements.feedback.textContent = "";
    delete elements.feedback.dataset.state;
    elements.explanation.hidden = true;
    elements.explanationSteps.replaceChildren();
    updateQuestionBookmark();
    elements.previous.disabled = state.current === 1;
    elements.next.disabled = state.current === 150;
    elements.saveStatus.textContent = "";
    delete elements.saveStatus.dataset.state;
    renderGrid();
    const route = new URL(window.location.href);
    route.searchParams.set("lesson", "tense");
    route.searchParams.set("question", String(state.current));
    window.history.replaceState(null, "", `${route.pathname}${route.search}${route.hash}`);
    if (focus) elements.input.focus({ preventScroll: true });
  }

  function requestedQuestion() {
    const number = Number(new URLSearchParams(window.location.search).get("question"));
    return Number.isInteger(number) && number >= 1 && number <= 150 ? number : 0;
  }

  function explanationSteps(question) {
    const steps = [];
    question.explanation.forEach((paragraph) => {
      const match = paragraph.match(/^(步驟[一二三四五六七八九十]+：)(.*)$/);
      if (match) steps.push({ title: match[1], paragraphs: match[2] ? [match[2].trim()] : [] });
      else if (steps.length) steps.at(-1).paragraphs.push(paragraph);
      else steps.push({ title: "解析", paragraphs: [paragraph] });
    });
    return steps;
  }

  function bookmarkKey(number, step = 0) {
    return step ? `tense:q${String(number).padStart(3, "0")}:step${String(step).padStart(2, "0")}` : `tense:q${String(number).padStart(3, "0")}`;
  }

  function updateQuestionBookmark() {
    const active = state.bookmarks.has(bookmarkKey(state.current));
    elements.questionBookmark.setAttribute("aria-pressed", String(active));
    elements.questionBookmark.textContent = active ? "★ 已收藏這題" : "☆ 收藏這題";
  }

  async function setBookmark(itemKey, title, detail, bookmarked, button) {
    if (!state.token || !window.EDMUND_LEARNING_PORTAL_CONTEXT?.rpc) {
      elements.saveStatus.textContent = "請先登入學生帳戶才可收藏。";
      elements.saveStatus.dataset.state = "error";
      return;
    }
    button.disabled = true;
    try {
      await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc("learning_portal_set_bookmark", {
        p_token: state.token, p_system_key: "grammar", p_item_key: itemKey,
        p_title: title, p_detail: detail, p_href: `grammar-system.html?lesson=tense&question=${state.current}`,
        p_bookmarked: bookmarked
      });
      if (bookmarked) state.bookmarks.add(itemKey); else state.bookmarks.delete(itemKey);
      elements.saveStatus.textContent = bookmarked ? "已加入書簽總目錄。" : "已從書簽移除。";
      updateQuestionBookmark();
      button.setAttribute("aria-pressed", String(bookmarked));
      if (button.matches("[data-step-bookmark]")) button.textContent = bookmarked ? "★ 已收藏這一步" : "☆ 收藏這一步";
    } catch (error) {
      console.warn("Grammar bookmark save failed", error);
      elements.saveStatus.textContent = "書簽暫時未能儲存，請稍後再試。";
      elements.saveStatus.dataset.state = "error";
    } finally { button.disabled = false; }
  }

  function showExplanation(question, correct) {
    elements.explanation.dataset.result = correct ? "correct" : "wrong";
    elements.explanationTitle.textContent = correct ? "答對了！逐步解析" : "再想一想：逐步解析";
    elements.explanationAnswer.textContent = `正確答案：${question.answer}`;
    elements.explanationSteps.innerHTML = explanationSteps(question).map((step, index) => {
      const number = index + 1;
      const key = bookmarkKey(question.number, number);
      const active = state.bookmarks.has(key);
      return `<article class="grammar-step" data-step-number="${number}"${index ? " hidden" : ""}><div class="grammar-step__head"><h4>${escapeHtml(step.title)}</h4><button type="button" class="grammar-step__bookmark" data-step-bookmark="${number}" aria-pressed="${active}">${active ? "★ 已收藏這一步" : "☆ 收藏這一步"}</button></div>${step.paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join("")}<label class="grammar-step__confirm"><input type="checkbox" data-reveal-step="${number}"><span>我已讀懂這一步${number < explanationSteps(question).length ? "，顯示下一步" : "，完成解析"}</span></label></article>`;
    }).join("");
    elements.explanation.hidden = false;
    elements.explanation.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function recordCompletion(number) {
    if (!state.token || state.remoteCorrect.has(number)) return;
    const context = window.EDMUND_LEARNING_PORTAL_CONTEXT;
    if (!context?.rpc) return;
    const duration = Math.max(0, Math.min(1800000, Math.round(performance.now() - state.questionStartedAt)));
    elements.saveStatus.textContent = "正在安全儲存進度…";
    try {
      const rows = await context.rpc("grammar_tense_record_completion", { p_token: state.token, p_question_number: number, p_duration_ms: duration });
      const row = Array.isArray(rows) ? rows[0] : rows;
      if (!row || Number(row.question_number) !== number) throw new Error("Progress save was not confirmed");
      state.remoteCorrect.add(number);
      elements.saveStatus.textContent = "進度已安全儲存至您的帳戶。";
      updateTotals();
      renderGrid();
    } catch (error) {
      console.warn("Grammar progress save failed", error);
      elements.saveStatus.textContent = "答案已儲存在此裝置；雲端暫時未能同步。";
      elements.saveStatus.dataset.state = "error";
    }
  }

  function submitAnswer(event) {
    event.preventDefault();
    const answer = elements.input.value.trim();
    if (!answer) {
      elements.input.setAttribute("aria-invalid", "true");
      elements.feedback.textContent = "請先輸入答案。";
      elements.feedback.dataset.state = "wrong";
      elements.feedback.hidden = false;
      elements.input.focus();
      return;
    }
    const question = questions[state.current - 1];
    const correct = isCorrect(question, answer);
    state.attempts[state.current] = { answer, status: correct ? "correct" : "wrong", checkedAt: new Date().toISOString() };
    saveLocal();
    elements.input.setAttribute("aria-invalid", String(!correct));
    elements.feedback.dataset.state = correct ? "correct" : "wrong";
    elements.feedback.textContent = correct ? "✓ 答案正確！以下逐步解析會說明原因。" : `✗ 答案未正確。正確答案是：${question.answer}`;
    elements.feedback.hidden = false;
    updateTotals();
    renderGrid();
    showExplanation(question, correct);
    if (correct) void recordCompletion(question.number);
  }

  async function loadRemoteProgress() {
    if (!state.token || state.loadingProgress) return;
    state.loadingProgress = true;
    try {
      const rows = await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc("grammar_tense_list_progress", { p_token: state.token });
      state.remoteCorrect = new Set((Array.isArray(rows) ? rows : []).map((row) => Number(row.question_number)).filter((number) => number >= 1 && number <= 150));
      updateTotals();
      renderGrid();
    } catch (error) {
      console.warn("Grammar progress load failed", error);
      elements.saveStatus.textContent = "雲端進度暫時未能載入；您仍可在此裝置練習。";
      elements.saveStatus.dataset.state = "error";
    } finally { state.loadingProgress = false; }
  }

  async function loadBookmarks() {
    if (!state.token || !window.EDMUND_LEARNING_PORTAL_CONTEXT?.rpc) return;
    try {
      const rows = await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc("learning_portal_list_bookmarks", { p_token: state.token, p_system_key: "grammar" });
      state.bookmarks = new Set((Array.isArray(rows) ? rows : []).map((row) => String(row.item_key)));
      updateQuestionBookmark();
    } catch (error) { console.warn("Grammar bookmarks load failed", error); }
  }

  function adoptSession() {
    const session = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.();
    if (!session?.user?.id || !session.token) return;
    const changed = state.userId !== String(session.user.id);
    state.userId = String(session.user.id);
    state.token = String(session.token);
    if (changed) {
      state.current = 1;
      state.attempts = {};
      state.remoteCorrect.clear();
      readLocal();
      showQuestion(requestedQuestion() || state.current);
    }
    void loadRemoteProgress();
    void loadBookmarks();
  }

  elements.start.addEventListener("click", () => { elements.library.hidden = true; elements.practice.hidden = false; showQuestion(state.current, true); });
  elements.back.addEventListener("click", () => { elements.practice.hidden = true; elements.library.hidden = false; elements.library.scrollIntoView({ behavior: "smooth", block: "start" }); });
  elements.range.addEventListener("change", () => showQuestion(Number(elements.range.value), true));
  elements.form.addEventListener("submit", submitAnswer);
  elements.previous.addEventListener("click", () => showQuestion(state.current - 1, true));
  elements.next.addEventListener("click", () => showQuestion(state.current + 1, true));
  elements.questionBookmark.addEventListener("click", () => {
    const question = questions[state.current - 1];
    const key = bookmarkKey(question.number);
    void setBookmark(key, `Tense 時態 · 第 ${question.number} 題`, `${question.prompt}\n${question.translation}`, !state.bookmarks.has(key), elements.questionBookmark);
  });
  elements.explanationSteps.addEventListener("change", (event) => {
    const input = event.target.closest("[data-reveal-step]");
    if (!input) return;
    const currentNumber = Number(input.dataset.revealStep);
    const later = [...elements.explanationSteps.querySelectorAll("[data-step-number]")].filter((step) => Number(step.dataset.stepNumber) > currentNumber);
    if (!input.checked) {
      later.forEach((step) => {
        step.hidden = true;
        const checkbox = step.querySelector("[data-reveal-step]");
        if (checkbox) checkbox.checked = false;
      });
      return;
    }
    const next = elements.explanationSteps.querySelector(`[data-step-number="${currentNumber + 1}"]`);
    if (next) { next.hidden = false; next.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
  });
  elements.explanationSteps.addEventListener("click", (event) => {
    const button = event.target.closest("[data-step-bookmark]");
    if (!button) return;
    const question = questions[state.current - 1];
    const stepNumber = Number(button.dataset.stepBookmark);
    const step = explanationSteps(question)[stepNumber - 1];
    const key = bookmarkKey(question.number, stepNumber);
    const detail = `${step.title} ${step.paragraphs.join(" ")}`;
    void setBookmark(key, `Tense 時態 · 第 ${question.number} 題 · ${step.title.replace("：", "")}`, detail, !state.bookmarks.has(key), button);
  });
  window.addEventListener("edmund:learning-portal-session", (event) => {
    if (event.detail?.portalId !== "grammar") return;
    if (!event.detail.user) { state.userId = ""; state.token = ""; state.remoteCorrect.clear(); state.bookmarks.clear(); return; }
    adoptSession();
  });

  showQuestion(requestedQuestion() || 1);
  updateTotals();
  queueMicrotask(adoptSession);
})();
