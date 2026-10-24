(function () {
  "use strict";

  const data = window.EDMUND_GRAMMAR_ADVANCED_ARTICLES_DATA;
  const dashboard = document.querySelector('[data-learning-portal-root] [data-view="dashboard"]');
  const library = dashboard?.querySelector('[data-grammar-library]');
  const tensePractice = dashboard?.querySelector('[data-grammar-practice]');
  if (!dashboard || !library || !tensePractice || !Array.isArray(data?.topics) || !Array.isArray(data?.questions) || data.topics.length < 27 || data.questions.length < 100) return;

  const lastQuestion = data.questions.at(-1).number;
  const questionCount = data.questions.length;
  const guideCount = data.topics.length + 1;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
  const blocks = (value) => String(value ?? "").split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const renderBody = (value) => blocks(value).map((part) => `<p>${escapeHtml(part)}</p>`).join("");
  const focusByNumber = {
    67: "Ø + 複數不只表示整類，也可表示一些未指定的人或物。",
    68: "some、many、more、enough 等字已在名詞前表達數量，通常不用再加冠詞。",
    69: "把 a few more 和 a little more 當完整組合理解。",
    70: "take part in 表示參加；part 前不用冠詞。",
    71: "play a part in 表示起作用；形容詞改變 a / an 的選擇。",
    72: "play the part of 表示飾演某個角色，使用 the。",
    73: "the whole 指語境中已知的整個；a whole 指一整個但未指定。",
    74: "millions of dollars 是未指定的大量金錢；已指定數目可用 the。",
    75: "in need 是固定表達，need 前不用冠詞。",
    76: "in despair 是固定表達，despair 前不用冠詞。",
    77: "take care of 要整組記；care 前不用冠詞。",
    78: "have a rest 的 rest 是一次休息；一般的休息可用 Ø。",
    79: "make a recovery 說一次康復；特定的康復過程可用 the。",
    80: "overdose 是單數可數名詞；首音為母音時用 an。",
    81: "英式英語的 in hospital 可指住院；探訪某間醫院可用 the hospital。",
    82: "a local hospital 是本地其中一間；the local hospital 指當地已知的那一間。",
    83: "第一次提起，只要情境已指出是哪個，也可用 the。",
    84: "the bus 可指雙方正在等、能共同辨認的那班巴士。",
    85: "故事初提用 a / an，再次指向同一對象通常用 the。",
    86: "不可數名詞談一般時用 Ø；指前文已知的部分時可用 the。",
    87: "已知整件東西時，其可辨認的部分可用 the。",
    88: "John's 已有限定作用；the old man's 等表達先判斷前面的名詞片語。",
    89: "後面的關係子句若已指出是哪一個，前面通常用 the。",
    90: "all this、all my 等已有其他限定詞，不要再插入冠詞。",
    91: "as many ... as 是整組比較結構，many 後通常不加冠詞。",
    92: "to his surprise 與 to the surprise of ... 結構不同，冠詞要跟整組搭配走。",
    93: "先辨認固定表達，再判斷是否需要 a、an、the 或 Ø。"
  };
  const genericOpening = /^(?:例如|比較|所以|不是|但要記住|最重要的問題|這(?:一|組|個|是|很)|常見|第一|B1|英式|完整句子|意思|同樣|幾乎所有)/;
  const articleMark = (value) => escapeHtml(value).replace(/\b(?:an|the|a)\b|Ø/gi, (token) => `<mark class="grammar-articles-ink grammar-articles-ink--${token === "Ø" ? "zero" : token.toLowerCase() === "the" ? "the" : "indefinite"}">${token}</mark>`);
  function topicFocus(topic) {
    if (topic.focus) return topic.focus;
    if (focusByNumber[topic.number]) return focusByNumber[topic.number];
    const candidate = blocks(topic.body).find((part) => {
      const oneLine = part.replace(/\s+/g, " ").trim();
      return /[\u3400-\u9fff]/.test(oneLine) && oneLine.length >= 22 && oneLine.length <= 125
        && !genericOpening.test(oneLine) && !/[\n]/.test(part.trim());
    });
    return candidate || topic.title;
  }
  function topicExamples(topic) {
    if (topic.examples) return topic.examples;
    const lines = String(topic.body).split("\n").map((line) => line.trim()).filter(Boolean);
    const found = [];
    const seen = new Set();
    for (let index = 0; index < lines.length; index++) {
      const text = lines[index].replace(/^[✓✗]\s*/, "").trim();
      if (!/^[A-Za-zØ]/.test(text) || /[\u3400-\u9fff]/.test(text) || text.length < 4 || text.length > 120 || /^(?:first mention|second mention|general|specific|school|bed|river|country|a|an|the|Ø)$/i.test(text)) continue;
      if (/^(?:first mention\s*=|second mention\s*=|[A-Z]\.\s)/i.test(text) || /[+→？]/.test(text) || (topic.number === 61 && text === "a bad flu")) continue;
      if (seen.has(text.toLowerCase())) continue;
      seen.add(text.toLowerCase());
      const next = lines[index + 1] || "";
      const translation = /^[\u3400-\u9fff]/.test(next) && next.length <= 44 && !/^(?:例如|比較|所以|但是|因為|如果|因此|要留意|這|不是|第一|第二|同樣)/.test(next) ? next : "";
      found.push({ text, translation, wrong: /^[✗]/.test(lines[index]) });
      if (found.length === (topic.number === 32 ? 5 : 3)) break;
    }
    return found;
  }
  function renderTopic(topic) {
    const focus = topicFocus(topic);
    const examples = topicExamples(topic);
    const preview = examples.length ? `<div class="grammar-articles-topic__examples"><p class="grammar-articles-topic__label">看例子</p><div class="grammar-articles-example-grid">${examples.map((example) => `<div class="grammar-articles-example${example.wrong ? " grammar-articles-example--wrong" : ""}">${example.wrong ? '<small class="grammar-articles-example__warning">✗ 不建議的寫法</small>' : ""}<p lang="en">${articleMark(example.text)}</p>${example.translation ? `<span lang="zh-Hant">${escapeHtml(example.translation)}</span>` : ""}</div>`).join("")}</div></div>` : "";
    const full = blocks(topic.body).length > 1 ? `<details class="grammar-articles-topic__details"><summary>閱讀完整講解與所有例句<span aria-hidden="true">＋</span></summary><div class="grammar-articles-topic__full">${renderBody(topic.body)}</div></details>` : "";
    return `<article class="grammar-articles-topic" data-advanced-articles-topic="${topic.number}" id="advanced-articles-topic-${topic.number}"><div class="grammar-articles-topic__head"><span>${String(topic.number).padStart(2, "0")}</span><h3>${articleMark(topic.title)}</h3></div><div class="grammar-articles-topic__focus"><span>核心規則</span><p>${articleMark(focus)}</p></div>${preview}${full}${topic.questionNumbers ? `<div class="grammar-articles-curation__actions" aria-label="本節配套練習">${topic.questionNumbers.map(number => `<button class="grammar-button--ghost" type="button" data-advanced-articles-practice-question="${number}">練習第 ${number} 題</button>`).join("")}</div>` : ""}</article>`;
  }
  const guideLabel = (number) => number <= 200 ? "進階規則應用 · 第 151–200 題" : number <= 250 ? "延伸綜合練習 · 第 201–250 題" : number <= 262 ? "補充分組練習 · 第 251–262 題" : "補充混合練習 · 第 263–270 題";

  const state = {
    userId: "", token: "", question: 151, attempts: {}, remoteCorrect: new Set(),
    bookmarks: new Set(), startedAt: performance.now(), explanationMode: "step"
  };
  try {
    if (localStorage.getItem("edmund-grammar-advanced-articles-explanation-mode-v1") === "scroll") state.explanationMode = "scroll";
  } catch { /* Browsing remains available without local storage. */ }

  const card = document.createElement("article");
  card.className = "grammar-lesson-card grammar-lesson-card--articles grammar-lesson-card--advanced-articles";
  card.innerHTML = `<div class="grammar-lesson-card__copy"><p class="eyebrow">MODULE 03 · ADVANCED CURATION + ${questionCount} QUESTIONS</p><h3>Advanced Articles <span lang="zh-Hant">進階冠詞</span></h3><p>先讀 ${data.topics.length} 項進階規則與決策總表，再練習 151–${lastQuestion} 題；包括故事語境、固定搭配和限定詞。</p></div><div class="grammar-lesson-card__stats" aria-label="進階冠詞練習進度"><div><strong data-advanced-articles-correct-count>0</strong><span>已答對</span></div><div><strong data-advanced-articles-attempted-count>0</strong><span>已作答</span></div><button class="grammar-button" type="button" data-advanced-articles-open>進入進階冠詞導讀</button></div>`;
  library.append(card);

  const topics = data.topics.map(renderTopic).join("");
  const chapterLinks = [
    [67, "Ø 與數量詞"], [70, "part 與固定搭配"], [78, "休息、康復與醫院"],
    [83, "語境與故事中的 the"], [87, "整體與部分"], [90, "限定詞與決策次序"], [94, "運河、縮寫與 history"]
  ].map(([number, label]) => `<button type="button" data-advanced-articles-jump="${number}">${escapeHtml(label)}</button>`).join("");
  const decisionMap = `<section class="grammar-articles-topic grammar-articles-topic--appendix" data-advanced-articles-topic="map" id="advanced-articles-decision-map"><div class="grammar-articles-topic__head"><span>MAP</span><h3>進階冠詞解題總表</h3></div><p class="grammar-articles-map__intro">先看意思與語境，再核對前文、限定詞及固定表達。</p><div class="grammar-articles-map__choices"><div class="grammar-articles-map__choice grammar-articles-map__choice--indefinite"><strong>a / an</strong><p>單數可數；有一個，但不必知道是哪一個。</p><small>a dog · an elderly woman</small></div><div class="grammar-articles-map__choice grammar-articles-map__choice--definite"><strong>the</strong><p>特定對象；聽的人有資料認出是哪一個。</p><small>the dog · the book on my desk</small></div><div class="grammar-articles-map__choice grammar-articles-map__choice--zero"><strong>Ø</strong><p>一般複數、不可數、名稱或固定無冠詞用法。</p><small>music · London · go to school</small></div></div><div class="grammar-articles-map__checks"><h4>五組快速檢查</h4><ol><li>先確定名詞在這句的意思和可數性。</li><li>判斷一般、未指定或已指定。</li><li>讀前文：是否已經介紹過或能由情境辨認？</li><li>檢查整體與部分，以及前面的限定詞。</li><li>把固定表達當整組判斷；最後才選 a 或 an。</li></ol></div><details class="grammar-articles-topic__details"><summary>查看完整十步決策次序與例詞<span aria-hidden="true">＋</span></summary><div class="grammar-articles-topic__full"><pre>${escapeHtml(data.appendix)}</pre></div></details></section>`;
  const curation = document.createElement("section");
  curation.className = "panel grammar-articles-curation";
  curation.hidden = true;
  curation.dataset.advancedArticlesCuration = "";
  curation.innerHTML = `<div class="grammar-articles-curation__head"><button class="grammar-button--ghost" type="button" data-advanced-articles-menu>← 返回練習目錄</button><p class="eyebrow">MODULE 03 · ADVANCED ARTICLES</p><h2>進階冠詞 · 語法導讀</h2><p>把名詞的意思、前後文與固定表達連起來看；每條規則只先顯示重點，向下捲動才逐條展開。</p><div class="grammar-articles-curation__actions"><button class="grammar-button grammar-button--primary" type="button" data-advanced-articles-start>開始 ${questionCount} 題練習</button><span data-advanced-articles-position>導讀 1 / ${guideCount}</span></div></div><nav class="grammar-articles-chapters" aria-label="進階冠詞導讀章節">${chapterLinks}</nav><div class="grammar-articles-stream" data-advanced-articles-stream>${topics}${decisionMap}</div><div class="grammar-articles-curation__finish"><h3>用這套判斷方法練習</h3><p>151–200 題應用本章規則；201–250 題延伸綜合判斷；251–262 題應用新增第 94–97 節，263–270 題混合重練。</p><button class="grammar-button grammar-button--primary" type="button" data-advanced-articles-start>開始 ${questionCount} 題練習</button></div>`;
  window.EDMUND_GRAMMAR_FORMAT_CURATION(curation);
  dashboard.append(curation);

  const practice = document.createElement("section");
  practice.className = "panel grammar-practice grammar-articles-practice";
  practice.hidden = true;
  practice.dataset.advancedArticlesPractice = "";
  practice.innerHTML = `<div class="grammar-practice__head"><div><button class="grammar-button--ghost" type="button" data-advanced-articles-back-curation>← 返回進階冠詞導讀</button><p class="eyebrow">ADVANCED ARTICLES · 進階冠詞</p><h2>逐題練習</h2></div><div class="grammar-practice__tools"><div class="grammar-reading-mode" role="group" aria-label="解析閱讀模式"><span class="grammar-reading-mode__label">解析模式</span><button type="button" data-advanced-articles-mode="step" aria-pressed="false">逐步</button><button type="button" data-advanced-articles-mode="scroll" aria-pressed="false">捲動閱讀</button></div><div class="grammar-practice__summary"><strong data-advanced-articles-score>0</strong><span>/ ${questionCount}<br>已答對</span></div></div></div><div class="grammar-progress" role="progressbar" aria-label="進階冠詞答對進度" aria-valuemin="0" aria-valuemax="${questionCount}" aria-valuenow="0"><span data-advanced-articles-progress></span></div><div class="grammar-navigator"><div class="grammar-navigator__bar"><label><span class="sr-only">題目範圍</span><select class="grammar-range-select" data-advanced-articles-range aria-label="選擇題目範圍"></select></label><span class="grammar-navigator__legend">綠色：答對 · 紅色：需再試</span></div><div class="grammar-number-grid" data-advanced-articles-grid aria-label="選擇進階冠詞題目"></div></div><div class="grammar-highlight-tools"><button type="button" class="grammar-button--ghost" data-advanced-articles-highlight aria-pressed="false">🖍 暫時螢光筆</button><span>開啟後拖選題目或解析文字；再按一次清除。</span></div><article class="grammar-question"><div class="grammar-question__meta"><span class="grammar-question__number" data-advanced-articles-number></span><span class="grammar-question__tense" data-advanced-articles-guide></span><button class="grammar-bookmark" type="button" data-advanced-articles-bookmark aria-pressed="false">☆ 收藏這題</button></div><p class="grammar-question__prompt" data-advanced-articles-prompt></p><p class="grammar-question__translation" data-advanced-articles-translation></p><form class="grammar-answer" data-advanced-articles-form novalidate><label>您的答案<input name="answer" autocomplete="off" autocapitalize="none" spellcheck="false" aria-describedby="advanced-articles-answer-hint advanced-articles-feedback"></label><p class="grammar-answer__hint" id="advanced-articles-answer-hint">請填 a、an、the；不用冠詞填 Ø 或 x。兩格題按次序以 / 分隔；也可輸入完整句子。</p><div class="grammar-answer__actions"><button class="grammar-button grammar-button--primary" type="submit">提交答案</button></div><div class="grammar-feedback" id="advanced-articles-feedback" data-advanced-articles-feedback hidden aria-live="polite"></div></form><section class="grammar-explanation" data-advanced-articles-explanation hidden aria-labelledby="advanced-articles-explanation-title"><div class="grammar-explanation__head"><div><p class="eyebrow">STEP-BY-STEP</p><h3 id="advanced-articles-explanation-title" data-advanced-articles-explanation-title>進階冠詞 · 逐步解析</h3></div><p data-advanced-articles-answer></p></div><p class="grammar-explanation__instruction" data-advanced-articles-instruction></p><div class="grammar-steps" data-advanced-articles-steps></div></section></article><nav class="grammar-nav" aria-label="進階冠詞題目導覽"><button type="button" data-advanced-articles-previous>← 上一題</button><button type="button" data-advanced-articles-next>下一題 →</button></nav><p class="grammar-save-status" data-advanced-articles-save-status aria-live="polite"></p>`;
  dashboard.append(practice);

  const $ = (selector) => dashboard.querySelector(selector);
  const el = {
    correct: $("[data-advanced-articles-correct-count]"), attempted: $("[data-advanced-articles-attempted-count]"),
    score: $("[data-advanced-articles-score]"), progress: practice.querySelector(".grammar-progress"),
    progressFill: $("[data-advanced-articles-progress]"), position: $("[data-advanced-articles-position]"),
    stream: $("[data-advanced-articles-stream]"), range: $("[data-advanced-articles-range]"), grid: $("[data-advanced-articles-grid]"),
    number: $("[data-advanced-articles-number]"), guide: $("[data-advanced-articles-guide]"), prompt: $("[data-advanced-articles-prompt]"),
    translation: $("[data-advanced-articles-translation]"), form: $("[data-advanced-articles-form]"),
    input: $("[data-advanced-articles-form] input"), feedback: $("[data-advanced-articles-feedback]"),
    explanation: $("[data-advanced-articles-explanation]"), explanationTitle: $("[data-advanced-articles-explanation-title]"),
    answer: $("[data-advanced-articles-answer]"), instruction: $("[data-advanced-articles-instruction]"),
    steps: $("[data-advanced-articles-steps]"), saveStatus: $("[data-advanced-articles-save-status]"),
    bookmark: $("[data-advanced-articles-bookmark]"), highlight: $("[data-advanced-articles-highlight]")
  };
  for (let first = 151; first <= lastQuestion; first += 25) {
    el.range.append(new Option(`第 ${first}–${Math.min(lastQuestion, first + 24)} 題`, String(first)));
  }

  const localKey = () => `edmund-grammar-advanced-articles-v1:${state.userId || "guest"}`;
  const itemKey = (number, step = 0) => step ? `advanced-articles:q${String(number).padStart(3, "0")}:step${String(step).padStart(2, "0")}` : `advanced-articles:q${String(number).padStart(3, "0")}`;
  function readLocal() {
    state.attempts = {};
    try {
      const saved = JSON.parse(localStorage.getItem(localKey()) || "null");
      if (Number.isInteger(saved?.question) && saved.question >= 151 && saved.question <= lastQuestion) state.question = saved.question;
      if (saved?.attempts && typeof saved.attempts === "object") {
        state.attempts = Object.fromEntries(Object.entries(saved.attempts).filter(([key, value]) => {
          const number = Number(key);
          return Number.isInteger(number) && number >= 151 && number <= lastQuestion && ["correct", "wrong"].includes(value?.status);
        }));
      }
    } catch { /* Local progress is optional. */ }
  }
  function saveLocal() {
    try { localStorage.setItem(localKey(), JSON.stringify({ question: state.question, attempts: state.attempts })); }
    catch { /* Local progress is optional. */ }
  }
  function setRoute(view, question) {
    const route = new URL(window.location.href);
    route.searchParams.set("lesson", "advanced-articles");
    route.searchParams.set("view", view);
    if (question) route.searchParams.set("question", String(question));
    else route.searchParams.delete("question");
    window.history.replaceState(null, "", `${route.pathname}${route.search}${route.hash}`);
  }
  function updateTotals() {
    const correct = new Set([...state.remoteCorrect, ...Object.entries(state.attempts).filter(([, value]) => value.status === "correct").map(([number]) => Number(number))]).size;
    const attempted = new Set([...state.remoteCorrect, ...Object.keys(state.attempts).map(Number)]).size;
    el.correct.textContent = el.score.textContent = String(correct);
    el.attempted.textContent = String(attempted);
    el.progress.setAttribute("aria-valuenow", String(correct));
    el.progressFill.style.width = `${correct / questionCount * 100}%`;
  }
  function renderGrid() {
    const first = Math.floor((state.question - 151) / 25) * 25 + 151;
    el.range.value = String(first);
    el.grid.replaceChildren();
    for (let number = first; number <= Math.min(lastQuestion, first + 24); number++) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = String(number);
      button.dataset.state = state.remoteCorrect.has(number) ? "correct" : state.attempts[number]?.status || "pending";
      button.setAttribute("aria-current", number === state.question ? "true" : "false");
      button.setAttribute("aria-label", `第 ${number} 題${button.dataset.state === "correct" ? "，已答對" : button.dataset.state === "wrong" ? "，需要再試" : ""}`);
      button.addEventListener("click", () => showQuestion(number, true));
      el.grid.append(button);
    }
  }
  function updateBookmark() {
    const active = state.bookmarks.has(itemKey(state.question));
    el.bookmark.setAttribute("aria-pressed", String(active));
    el.bookmark.textContent = active ? "★ 已收藏這題" : "☆ 收藏這題";
  }
  function showQuestion(number, focus = false) {
    clearHighlight();
    state.question = Math.min(lastQuestion, Math.max(151, Number(number) || 151));
    state.startedAt = performance.now();
    saveLocal();
    const question = data.questions[state.question - 151];
    el.number.textContent = `QUESTION ${question.number} / ${lastQuestion}`;
    el.guide.textContent = guideLabel(question.number);
    el.prompt.textContent = question.prompt;
    el.translation.textContent = question.translation;
    el.input.value = state.attempts[state.question]?.answer || "";
    el.input.removeAttribute("aria-invalid");
    el.feedback.hidden = true;
    el.feedback.textContent = "";
    el.explanation.hidden = true;
    el.steps.replaceChildren();
    practice.classList.remove("grammar-practice--scroll-reading");
    $("[data-advanced-articles-previous]").disabled = state.question === 151;
    $("[data-advanced-articles-next]").disabled = state.question === lastQuestion;
    el.saveStatus.textContent = "";
    renderGrid();
    updateBookmark();
    setRoute("practice", state.question);
    if (focus) el.input.focus({ preventScroll: true });
  }

  function updateCurationReveal() {
    if (curation.hidden) return;
    const height = window.innerHeight || 800;
    const sections = [...el.stream.querySelectorAll("[data-advanced-articles-topic]")];
    let revealed = 1;
    sections.forEach((section, index) => {
      if (index === 0 || section.getBoundingClientRect().top <= height * 0.88) revealed = index + 1;
    });
    sections.forEach((section, index) => {
      const visible = index < revealed;
      if (section.dataset.scrollVisible === String(visible)) return;
      section.dataset.scrollVisible = String(visible);
      section.setAttribute("aria-hidden", String(!visible));
      if (visible) section.removeAttribute("inert"); else section.setAttribute("inert", "");
    });
    el.position.textContent = `導讀 ${Math.min(revealed, guideCount)} / ${guideCount}`;
  }
  function showCuration() {
    library.hidden = true;
    tensePractice.hidden = true;
    dashboard.querySelectorAll('[data-articles-curation], [data-articles-practice]').forEach((section) => { section.hidden = true; });
    practice.hidden = true;
    curation.hidden = false;
    setRoute("curation");
    curation.scrollIntoView({ behavior: "instant", block: "start" });
    updateCurationReveal();
  }
  function showPractice(number = state.question) {
    library.hidden = true;
    tensePractice.hidden = true;
    dashboard.querySelectorAll('[data-articles-curation], [data-articles-practice]').forEach((section) => { section.hidden = true; });
    curation.hidden = true;
    practice.hidden = false;
    showQuestion(number);
    practice.scrollIntoView({ behavior: "instant", block: "start" });
  }
  function showMenu() {
    clearHighlight();
    curation.hidden = true;
    practice.hidden = true;
    tensePractice.hidden = true;
    library.hidden = false;
    const route = new URL(window.location.href);
    route.searchParams.delete("lesson");
    route.searchParams.delete("view");
    route.searchParams.delete("question");
    window.history.replaceState(null, "", `${route.pathname}${route.search}${route.hash}`);
    library.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateExplanationScroll() {
    if (practice.hidden || el.explanation.hidden || state.explanationMode !== "scroll") return;
    const height = window.innerHeight || 800;
    const steps = [...el.steps.querySelectorAll("[data-step-number]")];
    let revealed = 1;
    steps.slice(1).forEach((step, index) => {
      if (step.getBoundingClientRect().top <= height * 0.88) revealed = index + 2;
    });
    steps.forEach((step, index) => {
      const visible = index < revealed;
      step.dataset.scrollVisible = String(visible);
      step.setAttribute("aria-hidden", String(!visible));
      if (visible) step.removeAttribute("inert"); else step.setAttribute("inert", "");
    });
    el.instruction.textContent = `向下捲動逐步顯示解析；向上捲動會收起後續步驟。第 ${revealed} / ${steps.length} 步。`;
  }
  function updateExplanationMode() {
    const scrolling = state.explanationMode === "scroll";
    for (const button of practice.querySelectorAll("[data-advanced-articles-mode]")) button.setAttribute("aria-pressed", String(button.dataset.advancedArticlesMode === state.explanationMode));
    el.explanation.dataset.mode = state.explanationMode;
    practice.classList.toggle("grammar-practice--scroll-reading", scrolling && !el.explanation.hidden);
    el.instruction.textContent = "請讀完每一步，再勾選「我已讀懂」，下一步才會顯示。";
    if (el.explanation.hidden) return;
    const steps = [...el.steps.querySelectorAll("[data-step-number]")];
    steps.forEach((step, index) => {
      step.hidden = !scrolling && index > 0 && !steps[index - 1].querySelector("[data-advanced-articles-reveal-step]").checked;
      if (!scrolling) {
        delete step.dataset.scrollVisible;
        step.removeAttribute("aria-hidden");
        step.removeAttribute("inert");
      }
    });
    if (scrolling) {
      updateExplanationScroll();
    }
  }
  function filledSentence(question) {
    let index = 0;
    return question.prompt.replace(/_{3,}/g, () => {
      const choice = question.answers[index++];
      return choice === "Ø" ? "" : choice;
    }).replace(/\s+/g, " ").replace(/\s+([.,!?;:])/g, "$1").trim();
  }
  function showExplanation(question, correct) {
    el.explanation.dataset.result = correct ? "correct" : "wrong";
    el.explanationTitle.textContent = correct ? "答對了！逐步解析" : "再想一想：逐步解析";
    el.answer.textContent = `正確答案：${question.answer === "Ø" ? "Ø（不加冠詞）" : question.answer}`;
    el.steps.innerHTML = question.steps.map((step, index) => {
      const number = index + 1;
      const active = state.bookmarks.has(itemKey(question.number, number));
      return `<article class="grammar-step" data-step-number="${number}"${index ? " hidden" : ""}><div class="grammar-step__head"><h4>${escapeHtml(step.title)}</h4><button type="button" class="grammar-step__bookmark" data-advanced-articles-step-bookmark="${number}" aria-pressed="${active}">${active ? "★ 已收藏這一步" : "☆ 收藏這一步"}</button></div>${renderBody(step.body)}<label class="grammar-step__confirm"><input type="checkbox" data-advanced-articles-reveal-step="${number}"><span>我已讀懂這一步${number < question.steps.length ? "，顯示下一步" : "，完成解析"}</span></label></article>`;
    }).join("");
    el.explanation.hidden = false;
    if (state.explanationMode === "scroll") el.explanation.scrollIntoView({ behavior: "instant", block: "start" });
    updateExplanationMode();
    if (state.explanationMode !== "scroll") el.explanation.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function normalize(value) {
    return String(value ?? "").normalize("NFKC").toLowerCase().replace(/[‘’]/g, "'").replace(/[.!?]+$/g, "").replace(/\s+/g, " ").trim();
  }
  function contextualAnswer(question, value) {
    const answer = normalize(value);
    return (question.contextualAnswers || []).some(candidate => answer === normalize(candidate) || answer === normalize(question.prompt.replace(/_+/,candidate)));
  }
  function correctAnswer(question, value) {
    if (contextualAnswer(question,value)) return true;
    const answer = normalize(value);
    if (answer === normalize(filledSentence(question))) return true;
    const choices = question.answers.length === 1 ? [answer] : answer.split(/\s*[/,，、;；]\s*/);
    if (choices.length !== question.answers.length) return false;
    const aliases = new Set(["ø", "x", "0", "none", "no article", "zero article", "omit", "nothing"]);
    return choices.every((choice, index) => {
      const expected = normalize(question.answers[index]);
      return choice === expected || (expected === "ø" && aliases.has(choice));
    });
  }

  async function recordCompletion(number) {
    if (!state.token || state.remoteCorrect.has(number)) return;
    const context = window.EDMUND_LEARNING_PORTAL_CONTEXT;
    if (!context?.rpc) return;
    el.saveStatus.textContent = "正在安全儲存進度…";
    const duration = Math.max(0, Math.min(1800000, Math.round(performance.now() - state.startedAt)));
    try {
      const rows = await context.rpc("grammar_advanced_articles_record_completion", { p_token: state.token, p_question_number: number, p_duration_ms: duration });
      const row = Array.isArray(rows) ? rows[0] : rows;
      if (!row || Number(row.question_number) !== number) throw new Error("Advanced Article progress was not confirmed");
      state.remoteCorrect.add(number);
      el.saveStatus.textContent = "進度已安全儲存至您的帳戶。";
      updateTotals();
      renderGrid();
    } catch (error) {
      console.warn("Advanced Articles progress save failed", error);
      el.saveStatus.textContent = "答案已儲存在此裝置；雲端暫時未能同步。";
      el.saveStatus.dataset.state = "error";
    }
  }
  async function setBookmark(key, title, detail, bookmarked, button) {
    if (!state.token || !window.EDMUND_LEARNING_PORTAL_CONTEXT?.rpc) {
      el.saveStatus.textContent = "請先登入學生帳戶才可收藏。";
      el.saveStatus.dataset.state = "error";
      return;
    }
    button.disabled = true;
    try {
      await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc("learning_portal_set_bookmark", {
        p_token: state.token, p_system_key: "grammar", p_item_key: key,
        p_title: title, p_detail: detail,
        p_href: `grammar-system.html?lesson=advanced-articles&view=practice&question=${state.question}`,
        p_bookmarked: bookmarked
      });
      if (bookmarked) state.bookmarks.add(key); else state.bookmarks.delete(key);
      button.setAttribute("aria-pressed", String(bookmarked));
      button.textContent = bookmarked ? "★ 已收藏這一步" : "☆ 收藏這一步";
      updateBookmark();
      el.saveStatus.textContent = bookmarked ? "已加入書簽總目錄。" : "已從書簽移除。";
    } catch (error) {
      console.warn("Advanced Articles bookmark save failed", error);
      el.saveStatus.textContent = "書簽暫時未能儲存，請稍後再試。";
      el.saveStatus.dataset.state = "error";
    } finally { button.disabled = false; }
  }

  let highlightEnabled = false;
  function clearHighlight() {
    practice.querySelectorAll("mark.grammar-teaching-highlight").forEach((mark) => mark.replaceWith(document.createTextNode(mark.textContent)));
    practice.normalize();
    highlightEnabled = false;
    el.highlight.setAttribute("aria-pressed", "false");
  }
  function paintSelection() {
    if (!highlightEnabled || practice.hidden) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (!practice.querySelector(".grammar-question").contains(range.commonAncestorContainer)) return;
    if (!range.toString().trim()) return;
    const mark = document.createElement("mark");
    mark.className = "grammar-teaching-highlight";
    try { range.surroundContents(mark); selection.removeAllRanges(); }
    catch { /* A selection across multiple elements is left untouched. */ }
  }

  card.querySelector("[data-advanced-articles-open]").addEventListener("click", showCuration);
  curation.querySelectorAll("[data-advanced-articles-practice-question]").forEach(button => button.addEventListener("click", () => showPractice(Number(button.dataset.advancedArticlesPracticeQuestion))));
  curation.querySelector("[data-advanced-articles-menu]").addEventListener("click", showMenu);
  curation.querySelectorAll("[data-advanced-articles-start]").forEach((button) => button.addEventListener("click", () => showPractice(151)));
  curation.querySelectorAll("[data-advanced-articles-jump]").forEach((button) => button.addEventListener("click", () => {
    curation.querySelector(`#advanced-articles-topic-${button.dataset.advancedArticlesJump}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
  practice.querySelector("[data-advanced-articles-back-curation]").addEventListener("click", showCuration);
  practice.querySelectorAll("[data-advanced-articles-mode]").forEach((button) => button.addEventListener("click", () => {
    state.explanationMode = button.dataset.advancedArticlesMode;
    try { localStorage.setItem("edmund-grammar-advanced-articles-explanation-mode-v1", state.explanationMode); } catch { /* Optional preference. */ }
    updateExplanationMode();
  }));
  el.range.addEventListener("change", () => showQuestion(Number(el.range.value), true));
  practice.querySelector("[data-advanced-articles-previous]").addEventListener("click", () => showQuestion(state.question - 1, true));
  practice.querySelector("[data-advanced-articles-next]").addEventListener("click", () => showQuestion(state.question + 1, true));
  el.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = el.input.value.trim();
    if (!value) {
      el.input.setAttribute("aria-invalid", "true");
      el.feedback.textContent = "請輸入 a、an、the，或 Ø（不加冠詞）。";
      el.feedback.dataset.state = "wrong";
      el.feedback.hidden = false;
      el.input.focus();
      return;
    }
    const question = data.questions[state.question - 151];
    const correct = correctAnswer(question, value);
    state.attempts[state.question] = { answer: value, status: correct ? "correct" : "wrong" };
    saveLocal();
    el.feedback.textContent = contextualAnswer(question,value) ? `✓ ${question.contextualFeedback}` : correct ? "✓ 答案正確！以下逐步解析會說明原因。" : "答案未正確。請按以下步驟看清語境，再試一次。";
    el.feedback.dataset.state = correct ? "correct" : "wrong";
    el.feedback.hidden = false;
    el.input.setAttribute("aria-invalid", String(!correct));
    showExplanation(question, correct);
    if (contextualAnswer(question,value)) el.answer.textContent = `本題重點答案：${question.answer}；${question.contextualFeedback}`;
    updateTotals();
    renderGrid();
    if (correct && Array.from({ length: 50 }, (_, index) => index + 151).every((number) => state.remoteCorrect.has(number) || state.attempts[number]?.status === 'correct'))
      document.dispatchEvent(new CustomEvent('edmund:eddy-fifty-complete'));
    if (correct) void recordCompletion(state.question);
  });
  el.steps.addEventListener("change", (event) => {
    const input = event.target.closest("[data-advanced-articles-reveal-step]");
    if (!input || state.explanationMode !== "step") return;
    const number = Number(input.dataset.advancedArticlesRevealStep);
    const later = [...el.steps.querySelectorAll("[data-step-number]")].filter((step) => Number(step.dataset.stepNumber) > number);
    if (!input.checked) {
      later.forEach((step) => {
        step.hidden = true;
        step.querySelector("[data-advanced-articles-reveal-step]").checked = false;
      });
    } else {
      const next = el.steps.querySelector(`[data-step-number="${number + 1}"]`);
      if (next) { next.hidden = false; next.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
    }
  });
  el.bookmark.addEventListener("click", () => {
    const question = data.questions[state.question - 151];
    const key = itemKey(question.number);
    void setBookmark(key, `Advanced Articles 進階冠詞 · 第 ${question.number} 題`, `${question.prompt}\n${question.translation}`, !state.bookmarks.has(key), el.bookmark);
  });
  el.steps.addEventListener("click", (event) => {
    const button = event.target.closest("[data-advanced-articles-step-bookmark]");
    if (!button) return;
    const question = data.questions[state.question - 151];
    const number = Number(button.dataset.advancedArticlesStepBookmark);
    const step = question.steps[number - 1];
    const key = itemKey(question.number, number);
    void setBookmark(key, `Advanced Articles 進階冠詞 · 第 ${question.number} 題 · ${step.title}`, step.body, !state.bookmarks.has(key), button);
  });
  el.highlight.addEventListener("click", () => {
    if (highlightEnabled) clearHighlight();
    else { highlightEnabled = true; el.highlight.setAttribute("aria-pressed", "true"); }
  });
  practice.addEventListener("pointerup", paintSelection);
  window.addEventListener("scroll", () => { updateCurationReveal(); updateExplanationScroll(); }, { passive: true });

  async function adoptSession() {
    const session = window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.();
    if (!session?.user?.id || !session.token) return;
    const changed = state.userId !== String(session.user.id);
    state.userId = String(session.user.id);
    state.token = String(session.token);
    if (changed) readLocal();
    try {
      const rows = await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc("grammar_advanced_articles_list_progress", { p_token: state.token });
      state.remoteCorrect = new Set((Array.isArray(rows) ? rows : []).map((row) => Number(row.question_number)).filter((number) => number >= 151 && number <= lastQuestion));
    } catch (error) { console.warn("Advanced Articles progress load failed", error); }
    try {
      const rows = await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc("learning_portal_list_bookmarks", { p_token: state.token, p_system_key: "grammar" });
      state.bookmarks = new Set((Array.isArray(rows) ? rows : []).map((row) => String(row.item_key)));
    } catch (error) { console.warn("Advanced Articles bookmarks load failed", error); }
    updateTotals();
    if (!practice.hidden) { renderGrid(); updateBookmark(); }
  }
  window.addEventListener("edmund:learning-portal-session", (event) => {
    if (event.detail?.portalId !== "grammar") return;
    if (!event.detail.user) {
      state.userId = "";
      state.token = "";
      state.remoteCorrect.clear();
      state.bookmarks.clear();
      readLocal();
      updateTotals();
      if (!practice.hidden) { renderGrid(); updateBookmark(); }
      return;
    }
    void adoptSession();
  });

  readLocal();
  updateTotals();
  updateExplanationMode();
  const route = new URLSearchParams(window.location.search);
  if (route.get("lesson") === "advanced-articles") {
    const requested = Number(route.get("question"));
    if (route.get("view") === "practice" && Number.isInteger(requested) && requested >= 151 && requested <= lastQuestion) showPractice(requested);
    else showCuration();
  }
  queueMicrotask(adoptSession);
})();
