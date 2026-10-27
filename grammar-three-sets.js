(function () {
  "use strict";

  const modules = window.EDMUND_GRAMMAR_THREE_SETS;
  const dashboard = document.querySelector('[data-learning-portal-root] [data-view="dashboard"]');
  const library = dashboard?.querySelector('[data-grammar-library]');
  if (!dashboard || !library || !Array.isArray(modules) || modules.length !== 3) return;

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
  const normalize = (value) => String(value ?? "").normalize("NFKC").replace(/[‘’]/g, "'")
    .replace(/[.!?]+$/g, "").replace(/\s+/g, " ").trim().toLocaleLowerCase("en");
  const views = '[data-tense-curation], [data-grammar-practice], [data-articles-curation], [data-articles-practice], [data-advanced-articles-curation], [data-advanced-articles-practice], [data-new-grammar-curation], [data-new-grammar-practice]';
  let accountId = "guest";
  const editors = [];

  function setRoute(slug, question, view = "practice") {
    const route = new URL(window.location.href);
    route.searchParams.set("lesson", slug);
    route.searchParams.set("view", view);
    route.searchParams.set("question", String(question));
    window.history.replaceState(null, "", `${route.pathname}${route.search}${route.hash}`);
  }

  function clearRoute() {
    const route = new URL(window.location.href);
    for (const key of ["lesson", "view", "question"]) route.searchParams.delete(key);
    window.history.replaceState(null, "", `${route.pathname}${route.search}${route.hash}`);
  }

  function hideViews() {
    dashboard.querySelectorAll(views).forEach((section) => { section.hidden = true; });
  }

  function stateKey(slug) { return `edmund-grammar-three-sets-v1:${slug}:${accountId}`; }

  function readState(slug) {
    try {
      const saved = JSON.parse(localStorage.getItem(stateKey(slug)) || "{}");
      return { question: Math.min(150, Math.max(1, Number(saved.question) || 1)), attempts: saved.attempts || {} };
    } catch { return { question: 1, attempts: {} }; }
  }

  function writeState(slug, state) {
    try { localStorage.setItem(stateKey(slug), JSON.stringify(state)); }
    catch { /* Practice remains usable if this browser blocks storage. */ }
  }

  modules.forEach((module, index) => {
    if (module.questions?.length !== 150 || module.questions.some((q, offset) => q.number !== offset + 1 || q.steps?.length !== 7)) {
      console.error(`Grammar module ${module.slug} is incomplete.`);
      return;
    }
    const card = library.querySelectorAll('.grammar-lesson-card--new-curation')[index];
    const guideSlug = module.slug === "modal-verbs" ? "modal" : module.slug;
    const guide = dashboard.querySelector(`[data-new-grammar-curation="${guideSlug}"]`);
    if (!card || !guide) return;
    const practiceButton = document.createElement("button");
    practiceButton.className = "grammar-button grammar-lesson-card__secondary";
    practiceButton.type = "button";
    practiceButton.textContent = "開始 150 題練習";
    practiceButton.dataset.openNewGrammarPractice = module.slug;
    card.querySelector('.grammar-lesson-card__stats').append(practiceButton);
    const guideButton = document.createElement("button");
    guideButton.className = "grammar-button grammar-button--primary";
    guideButton.type = "button";
    guideButton.textContent = "開始 150 題練習";
    guide.querySelector('.grammar-articles-curation__finish').prepend(guideButton);

    const practice = document.createElement("section");
    practice.className = "panel grammar-practice grammar-extra-practice";
    practice.dataset.newGrammarPractice = module.slug;
    practice.hidden = true;
    practice.innerHTML = `
      <div class="grammar-practice__head"><div><button class="grammar-button--ghost" type="button" data-back-guide>← 返回導讀</button><button class="grammar-button--ghost" type="button" data-back-menu>返回練習目錄</button><p class="eyebrow">MODULE ${String(index + 4).padStart(2, "0")} · ${escapeHtml(module.title)}</p><h2>逐題練習</h2></div><div class="grammar-practice__tools"><div class="grammar-reading-mode" role="group" aria-label="解析閱讀模式"><span class="grammar-reading-mode__label">解析模式</span><button type="button" data-mode="step" aria-pressed="true">逐步</button><button type="button" data-mode="scroll" aria-pressed="false">捲動閱讀</button></div><div class="grammar-practice__summary"><strong data-score>0</strong><span>/ 150<br>已核對</span></div></div></div>
      <div class="grammar-progress" role="progressbar" aria-label="已核對進度" aria-valuemin="0" aria-valuemax="150" aria-valuenow="0"><span data-progress-fill></span></div>
      <div class="grammar-navigator"><div class="grammar-navigator__bar"><label><span class="sr-only">題目範圍</span><select class="grammar-range-select" data-range aria-label="選擇題目範圍"></select></label><span class="grammar-navigator__legend">綠色：已核對 · 紅色：再試一次</span></div><div class="grammar-number-grid" data-grid aria-label="選擇題目"></div></div>
      <article class="grammar-question"><div class="grammar-question__meta"><span class="grammar-question__number" data-number></span><span class="grammar-extra-section" data-section></span></div><aside class="grammar-question__focus"><strong>本題重點</strong><p data-instruction></p></aside><p class="grammar-question__prompt" lang="en" data-prompt></p><p class="grammar-question__translation" lang="zh-Hant" data-translation></p><form class="grammar-answer" data-form novalidate><label>您的答案<input data-short-answer autocomplete="off" autocapitalize="none" spellcheck="false"><textarea data-long-answer rows="3" autocomplete="off" autocapitalize="sentences" spellcheck="true" hidden></textarea></label><p class="grammar-answer__hint" data-hint></p><div class="grammar-answer__actions"><button class="grammar-button grammar-button--primary" type="submit">提交答案</button></div><div class="grammar-feedback" data-feedback hidden aria-live="polite"></div></form><section class="grammar-explanation" data-explanation hidden aria-label="逐步解析"><div class="grammar-explanation__head"><div><p class="eyebrow">STEP-BY-STEP</p><h3>逐步解析</h3></div><p data-model-answer></p></div><p class="grammar-explanation__instruction" data-step-instruction></p><div class="grammar-steps" data-steps></div><div class="grammar-extra-review" data-self-review hidden><p>改寫或解釋可能有多個自然答案。請對照示範，確認你的答案是否保留原意、人物、時間和否定。</p><button type="button" class="grammar-button grammar-button--primary" data-mark-reviewed>我的答案符合要點</button><button type="button" class="grammar-button--ghost" data-retry>再修改答案</button></div></section></article>
      <nav class="grammar-nav" aria-label="題目導覽"><button type="button" data-prev>← 上一題</button><button type="button" data-next>下一題 →</button></nav><p class="grammar-save-status" data-save-status aria-live="polite">進度保存在這個瀏覽器的帳戶記錄中。</p>`;
    dashboard.append(practice);

    const get = (selector) => practice.querySelector(selector);
    const state = readState(module.slug);
    let readingMode = "step";
    let stepCount = 1;
    let lastAnswer = "";

    for (let first = 1; first <= 150; first += 25) {
      const option = document.createElement("option");
      option.value = String(first);
      option.textContent = `第 ${first}–${Math.min(first + 24, 150)} 題`;
      get('[data-range]').append(option);
    }

    function updateTotals() {
      const complete = Object.values(state.attempts).filter((entry) => entry.status === "correct").length;
      get('[data-score]').textContent = String(complete);
      get('.grammar-progress').setAttribute('aria-valuenow', String(complete));
      get('[data-progress-fill]').style.width = `${complete / 150 * 100}%`;
      const copy = card.querySelector('.grammar-lesson-card__copy p:last-child');
      if (copy) copy.textContent = `${module.questions.length} 題練習 · 已核對 ${complete} 題。先讀導讀，再逐題作答和閱讀七步解析。`;
    }

    function renderGrid() {
      const first = Math.floor((state.question - 1) / 25) * 25 + 1;
      get('[data-range]').value = String(first);
      get('[data-grid]').innerHTML = module.questions.slice(first - 1, first + 24).map((q) => {
        const status = state.attempts[q.number]?.status || "";
        return `<button type="button" data-question="${q.number}" data-state="${escapeHtml(status)}" aria-current="${q.number === state.question}">${q.number}</button>`;
      }).join("");
    }

    function renderSteps() {
      const question = module.questions[state.question - 1];
      const visible = readingMode === "scroll" ? 7 : stepCount;
      get('[data-steps]').innerHTML = question.steps.slice(0, visible).map((step, offset) => `<article class="grammar-extra-step" data-step-number="${offset + 1}"><span>0${offset + 1}</span><div><h4>${escapeHtml(step.title)}</h4><p>${escapeHtml(step.body)}</p></div></article>`).join("");
      if (readingMode === "step" && stepCount < 7) {
        const button = document.createElement("button");
        button.className = "grammar-button--ghost grammar-extra-next-step";
        button.type = "button";
        button.textContent = "我已讀懂 · 下一步";
        button.addEventListener("click", () => { stepCount += 1; renderSteps(); });
        get('[data-steps]').append(button);
      }
      get('[data-step-instruction]').textContent = readingMode === "step" && stepCount < 7
        ? `閱讀第 ${stepCount} 步後，按「我已讀懂」顯示下一步。` : "七步解析已全部顯示。";
    }

    function renderQuestion() {
      const q = module.questions[state.question - 1];
      const prior = state.attempts[q.number];
      get('[data-number]').textContent = `第 ${q.number} / 150 題`;
      get('[data-section]').textContent = q.number <= 50 ? `分組練習 · ${q.section}` : "混合練習";
      get('[data-instruction]').textContent = q.mode === "exact"
        ? "只填入空格所需字詞；系統核對形式，再閱讀逐步解析。"
        : "先自行改寫或解釋，再對照示範答案及七步解析；合理的其他寫法也可接受。";
      get('[data-prompt]').textContent = q.prompt;
      get('[data-translation]').textContent = `【${q.translation}】`;
      get('[data-short-answer]').hidden = q.mode !== "exact";
      get('[data-long-answer]').hidden = q.mode === "exact";
      get('[data-short-answer]').value = q.mode === "exact" ? prior?.answer || "" : "";
      get('[data-long-answer]').value = q.mode !== "exact" ? prior?.answer || "" : "";
      lastAnswer = prior?.answer || "";
      get('[data-hint]').textContent = q.mode === "exact"
        ? "請輸入空格中的字或詞；大小寫與句末標點不影響判斷。"
        : "請寫完整句子或簡短解釋。題目可能有多個自然答案，請在看完示範後自行核對。";
      get('[data-feedback]').hidden = true;
      get('[data-explanation]').hidden = true;
      get('[data-self-review]').hidden = true;
      get('[data-prev]').disabled = q.number === 1;
      get('[data-next]').disabled = q.number === 150;
      renderGrid(); updateTotals(); setRoute(module.slug, q.number);
    }

    function open(number = state.question) {
      hideViews(); library.hidden = true; practice.hidden = false;
      state.question = Math.min(150, Math.max(1, Number(number) || 1));
      writeState(module.slug, state); renderQuestion();
      practice.scrollIntoView({ behavior: "instant", block: "start" });
    }

    function showExplanation(question) {
      stepCount = 1;
      get('[data-model-answer]').textContent = `示範答案：${question.answer}`;
      get('[data-explanation]').hidden = false;
      get('[data-self-review]').hidden = question.mode === "exact";
      renderSteps();
    }

    get('[data-form]').addEventListener("submit", (event) => {
      event.preventDefault();
      const q = module.questions[state.question - 1];
      const answer = (q.mode === "exact" ? get('[data-short-answer]') : get('[data-long-answer]')).value.trim();
      if (!answer) { get('[data-feedback]').hidden = false; get('[data-feedback]').textContent = "請先寫下你的答案。"; return; }
      lastAnswer = answer;
      const accepted = q.answers || [q.answer];
      const correct = q.mode === "exact" && accepted.some((value) => normalize(answer) === normalize(value));
      state.attempts[q.number] = { answer, status: correct ? "correct" : q.mode === "exact" ? "wrong" : "review" };
      writeState(module.slug, state);
      get('[data-feedback]').hidden = false;
      get('[data-feedback]').dataset.state = correct ? "correct" : q.mode === "exact" ? "wrong" : "review";
      get('[data-feedback]').textContent = correct ? "答對了！請讀完七步解析。"
        : q.mode === "exact" ? `請再看形式。示範答案是「${q.answer}」；可以修改後重試。`
        : "請對照示範答案與七步解析，再決定自己的寫法是否保留原意。";
      showExplanation(q); renderGrid(); updateTotals();
    });
    get('[data-mark-reviewed]').addEventListener("click", () => {
      if (!lastAnswer) return;
      state.attempts[state.question] = { answer: lastAnswer, status: "correct", selfReviewed: true };
      writeState(module.slug, state);
      get('[data-feedback]').textContent = "已完成自我核對。";
      get('[data-self-review]').hidden = true;
      renderGrid(); updateTotals();
    });
    get('[data-retry]').addEventListener("click", () => { get('[data-explanation]').hidden = true; get('[data-long-answer]').focus(); });
    get('[data-grid]').addEventListener("click", (event) => { const button = event.target.closest('[data-question]'); if (button) { state.question = Number(button.dataset.question); renderQuestion(); } });
    get('[data-range]').addEventListener("change", () => { state.question = Number(get('[data-range]').value); renderQuestion(); });
    get('[data-prev]').addEventListener("click", () => { state.question -= 1; renderQuestion(); });
    get('[data-next]').addEventListener("click", () => { state.question += 1; renderQuestion(); });
    get('[data-back-menu]').addEventListener("click", () => { hideViews(); library.hidden = false; clearRoute(); library.scrollIntoView({ behavior: "smooth", block: "start" }); });
    get('[data-back-guide]').addEventListener("click", () => { practice.hidden = true; card.querySelector('button').click(); });
    practice.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener("click", () => {
      readingMode = button.dataset.mode;
      practice.querySelectorAll('[data-mode]').forEach((option) => option.setAttribute('aria-pressed', String(option === button)));
      if (!get('[data-explanation]').hidden) renderSteps();
    }));
    practiceButton.addEventListener("click", () => open(1));
    guideButton.addEventListener("click", () => open(1));
    editors.push({ slug: module.slug, state, practice, renderQuestion, updateTotals, open });
    updateTotals();
  });

  window.addEventListener("edmund:learning-portal-session", (event) => {
    if (event.detail?.portalId !== "grammar") return;
    accountId = event.detail.user?.id || "guest";
    for (const editor of editors) {
      const saved = readState(editor.slug);
      editor.state.question = saved.question;
      editor.state.attempts = saved.attempts;
      editor.updateTotals();
      if (!editor.practice.hidden) editor.renderQuestion();
    }
  });
  const requested = new URLSearchParams(window.location.search);
  const match = editors.find((editor) => editor.slug === requested.get("lesson"));
  if (match && requested.get("view") === "practice") match.open(Number(requested.get("question")) || 1);
})();
