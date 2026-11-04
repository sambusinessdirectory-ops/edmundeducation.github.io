(function () {
  "use strict";

  const data = window.EDMUND_GRAMMAR_ARTICLES_DATA;
  const dashboard = document.querySelector('[data-learning-portal-root] [data-view="dashboard"]');
  const library = dashboard?.querySelector('[data-grammar-library]');
  const tensePractice = dashboard?.querySelector('[data-grammar-practice]');
  if (!dashboard || !library || !tensePractice || data?.topics?.length !== 66 || data?.questions?.length !== 150) return;

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
  const blocks = (value) => String(value ?? "").split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const renderBody = (value) => blocks(value).map((part) => `<p>${escapeHtml(part)}</p>`).join("");
  const focusByNumber = {
    1: "冠詞的核心：聽的人能否知道你說的是哪一個？",
    2: "先分清一般與指定，再看名詞是單數、複數還是不可數。",
    3: "單數可數名詞通常要有 a、an、the 或其他限定詞。",
    4: "第一次提起常用 a / an；若已能認出是哪一個，第一次提起也可用 the。",
    5: "a / an 可以表示某一個，但無須指出到底是哪一個。",
    6: "說某人的職業或身份時，通常用 a / an。",
    7: "選 a 還是 an，要聽下一個字的起首聲音，不是看字母。",
    8: "即使中間有形容詞，也要看緊接冠詞後面的聲音。",
    9: "a / an 直接修飾單數可數名詞，不能直接放在一般不可數名詞前。",
    10: "a few、a little、a lot of 應作整組表達來學。",
    11: "如果聽的人有足夠資料知道是哪一個，通常考慮 the。",
    12: "同一個人或事物再次提起時，雙方已知道所指，通常用 the。",
    13: "名詞後面的描述若已指出是哪一個，前面通常用 the。",
    14: "第一次提起，也可能因為後面的資料已說清楚而用 the。",
    15: "全世界只有一個的事物，通常用 the。",
    16: "即使世界上不只一個，當下語境只有一個可辨認對象也可用 the。",
    17: "最高級通常配 the，例如 the best student。",
    18: "序數指出排列中的特定位置，通常配 the。",
    19: "the only 和 the same 是常見的固定組合。",
    20: "複數名詞一旦指向特定那一群，也可以用 the。",
    21: "不可數名詞一旦指向特定那部分，也可以用 the。",
    22: "談整類複數事物，不指定其中某些時，通常不用冠詞。",
    23: "不可數名詞表示一般意思時，通常不用冠詞。",
    24: "抽象概念表達一般意思時，通常用 Ø。",
    25: "多數專有名稱本身已能指出對象，通常用 Ø。",
    26: "人名通常直接使用，不加 a、an 或 the。",
    27: "語言名稱通常用 Ø；若改說特定的 language，冠詞判斷也會改變。",
    28: "科目名稱表示一般學科時，通常用 Ø。",
    29: "運動、球類和棋類名稱通常用 Ø。",
    30: "說演奏某種樂器，常用 play the + 樂器名稱。",
    31: "三餐名稱表示一般用餐時常用 Ø；特定的一餐或加修飾語時可改用冠詞。",
    34: "hospital 的無冠詞用法有英美差異，要同時看用途和語境。",
    35: "go to work、be at work、go home 都是常見無冠詞搭配。",
    36: "by bus、by train、by car 等交通方式通常用 Ø。",
    37: "說 go to the beach 時，beach 通常用 the。",
    38: "大部分城市、國家和洲的名稱不加 the。",
    39: "河流等部分地理名稱通常用 the；不要把所有地名一概處理。",
    40: "部分國家名稱本身帶 the，例如 the United Kingdom。",
    41: "機構、酒店、博物館等名稱，要按實際名稱判斷是否有 the。",
    32: "說 school、university、bed 的本來用途時，英文常常用 Ø（不加冠詞）。",
    33: "說的是那座建築或那件家具，而非其本來用途時，通常用 the。",
    42: "my、your、this、that 等字已指出是哪一個，前面通常不再加冠詞。",
    43: "John's 等所有格已指出所屬對象，前面通常不再加冠詞。",
    44: "名詞後的限定子句若指出是哪一個，前面通常用 the。",
    45: "雙方眼前看得到、能共同辨認的東西，通常可用 the。",
    46: "a lot of、a pair of 等是整組數量詞，不是 a 直接修飾後面的名詞。",
    47: "同一個字的可數性可能隨意思改變，冠詞也要跟著語境判斷。",
    48: "先問是一般事物，還是語境中已指定的事物。",
    49: "a / an 與 the 的關鍵差別，是對方能否認出你指哪一個。",
    50: "即使第一次提起，只要共同情境已指出是哪一個，也可以用 the。",
    51: "the + 形容詞可代表一整群人，例如 the rich。",
    52: "the + 複數姓氏可表示某一家人。",
    53: "Doctor Chan、Professor Lee 這類稱銜加人名通常不用冠詞。",
    54: "地區作名詞可用 the north；名稱中的 East Asia 和方向副詞 go north 則不用。",
    55: "in the morning、in the afternoon、in the evening 要整組記。",
    56: "星期和月份名稱通常直接使用，不加冠詞。",
    57: "next week、last year 通常不用冠詞；the next day 表示特定次序中的那一天。",
    58: "most 表示大部分；the most 則可構成最高級，意思不同。",
    59: "表示『同一個』時，通常用 the same。",
    60: "have a good time 等固定搭配，要連同 a 一起記。",
    61: "疾病名稱的冠詞會因英語種類和搭配而變；不要把 a bad flu 當標準例子。",
    62: "in hospital 與 in the hospital 都可能成立；需看英語種類和具體語境。",
    63: "concert 本身不決定 a 或 the；關鍵是聽的人能否知道是哪一場。",
    64: "the kitchen、the station 等用法，常因共同情境已指明是哪個地方。",
    65: "冠詞不能與 my、this、John's 等限定詞重疊使用。",
    66: "按意思、可數性、單複數、是否特定和固定用法逐項判斷。"
  };
  const genericOpening = /^(?:例如|比較|所以|不是|但要記住|最重要的問題|這(?:一|組|個|是|很)|常見|第一|B1|英式|完整句子|意思|同樣|幾乎所有)/;
  const articleMark = (value) => escapeHtml(value).replace(/\b(?:an|the|a)\b|Ø/gi, (token) => `<mark class="grammar-articles-ink grammar-articles-ink--${token === "Ø" ? "zero" : token.toLowerCase() === "the" ? "the" : "indefinite"}">${token}</mark>`);
  function topicFocus(topic) {
    if (focusByNumber[topic.number]) return focusByNumber[topic.number];
    const candidate = blocks(topic.body).find((part) => {
      const oneLine = part.replace(/\s+/g, " ").trim();
      return /[\u3400-\u9fff]/.test(oneLine) && oneLine.length >= 22 && oneLine.length <= 125
        && !genericOpening.test(oneLine) && !/[\n]/.test(part.trim());
    });
    return candidate || topic.title;
  }
  function topicExamples(topic) {
    const lines = String(topic.body).split("\n").map((line) => line.trim()).filter(Boolean);
    const found = [];
    const seen = new Set();
    for (let index = 0; index < lines.length; index++) {
      const text = lines[index].replace(/^[✓✗]\s*/, "").trim();
      if (!/^[A-Za-zØ]/.test(text) || /[\u3400-\u9fff]/.test(text) || text.length < 4 || text.length > 120 || /^(?:first mention|second mention|general|specific|school|bed|river|country|a|an|the|Ø)$/i.test(text)) continue;
      if (/^(?:first mention\s*=|second mention\s*=)/i.test(text) || (topic.number === 61 && text === "a bad flu")) continue;
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
    return `<article class="grammar-articles-topic" data-articles-topic="${topic.number}" id="articles-topic-${topic.number}"><div class="grammar-articles-topic__head"><span>${String(topic.number).padStart(2, "0")}</span><h3>${articleMark(topic.title)}</h3></div><div class="grammar-articles-topic__focus"><span>核心規則</span><p>${articleMark(focus)}</p></div>${preview}${full}</article>`;
  }
  const guidanceRanges = [
    [1, 10, "一個未指定的可數名詞 · a / an"], [11, 15, "常見詞組與身份"],
    [16, 18, "再次提到同一個東西 · the"], [19, 25, "已指出是哪一個 · the"],
    [26, 34, "獨一、最高級與固定用法"], [35, 42, "一般複數、不可數與名稱 · Ø"],
    [43, 48, "school、bed、work 等固定用法"], [49, 50, "特別地名 · the"]
  ];
  const guideLabel = (number) => number <= 50
    ? guidanceRanges.find(([first, last]) => number >= first && number <= last)?.[2] || "引導練習"
    : number <= 100 ? "混合判斷 · 第 51–100 題" : "進階混合判斷 · 第 101–150 題";

  const state = {
    userId: "", token: "", question: 1, attempts: {}, remoteCorrect: new Set(),
    bookmarks: new Set(), startedAt: performance.now(), explanationMode: "step"
  };
  try {
    if (localStorage.getItem("edmund-grammar-articles-explanation-mode-v1") === "scroll") state.explanationMode = "scroll";
  } catch { /* Browsing remains available without local storage. */ }

  const card = document.createElement("article");
  card.className = "grammar-lesson-card grammar-lesson-card--articles";
  card.innerHTML = `<div class="grammar-lesson-card__copy"><p class="eyebrow">MODULE 02 · CURATION + 150 QUESTIONS</p><h3>Articles <span lang="zh-Hant">冠詞</span></h3><p>先從 a / an / the / Ø 的判斷方法開始，捲動閱讀完整導讀，再練習 150 題。</p></div><div class="grammar-lesson-card__stats" aria-label="Articles 練習進度"><div><strong data-articles-correct-count>0</strong><span>已答對</span></div><div><strong data-articles-attempted-count>0</strong><span>已作答</span></div><button class="grammar-button" type="button" data-articles-open>進入冠詞導讀</button></div>`;
  library.append(card);

  const topics = data.topics.map(renderTopic).join("");
  const chapterLinks = [
    [1, "核心與 a / an"], [11, "the：如何指明"], [22, "Ø：一般與名稱"],
    [32, "地方與地名"], [42, "辨認與語境"], [51, "進階用法"], [66, "決策次序"]
  ].map(([number, label]) => `<button type="button" data-articles-jump="${number}">${escapeHtml(label)}</button>`).join("");
  const decisionMap = `<section class="grammar-articles-topic grammar-articles-topic--appendix" data-articles-topic="67" id="articles-topic-67"><div class="grammar-articles-topic__head"><span>MAP</span><h3>冠詞解題總表</h3></div><p class="grammar-articles-map__intro">先問「有沒有指定是哪一個」，再看名詞種類及固定用法。</p><div class="grammar-articles-map__choices"><div class="grammar-articles-map__choice grammar-articles-map__choice--indefinite"><strong>a / an</strong><p>單數可數；有一個，但不必知道是哪一個。</p><small>a dog · an elderly woman</small></div><div class="grammar-articles-map__choice grammar-articles-map__choice--definite"><strong>the</strong><p>特定對象；聽的人有資料認出是哪一個。</p><small>the dog · the book on my desk</small></div><div class="grammar-articles-map__choice grammar-articles-map__choice--zero"><strong>Ø</strong><p>一般複數、不可數、名稱或固定無冠詞用法。</p><small>music · London · go to school</small></div></div><div class="grammar-articles-map__checks"><h4>五個快速檢查</h4><ol><li>已有 my、your、this 或 John's？通常不再加冠詞。</li><li>單數可數？未指定用 a / an；特定用 the。</li><li>複數或不可數？談一般用 Ø；指特定用 the。</li><li>名稱或固定用法？先查是否有 Ø 或特別的 the。</li><li>在 a / an 之間選？聽緊接後面的起首聲音。</li></ol></div><details class="grammar-articles-topic__details"><summary>查看完整對照與例詞<span aria-hidden="true">＋</span></summary><div class="grammar-articles-topic__full"><pre>${escapeHtml(data.appendix)}</pre></div></details></section>`;
  const curation = document.createElement("section");
  curation.className = "panel grammar-articles-curation";
  curation.hidden = true;
  curation.dataset.articlesCuration = "";
  curation.innerHTML = `<div class="grammar-articles-curation__head"><button class="grammar-button--ghost" type="button" data-articles-menu>← 返回練習目錄</button><p class="eyebrow">MODULE 02 · ARTICLES</p><h2>冠詞 · 語法導讀</h2><p>先判斷名詞在這句話中的意思、數量，以及對方能否知道是哪一個；再決定 a、an、the 或 Ø。</p><div class="grammar-articles-curation__actions"><button class="grammar-button grammar-button--primary" type="button" data-articles-start>開始 150 題練習</button><span data-articles-position>導讀 1 / 66</span></div></div><nav class="grammar-articles-chapters" aria-label="冠詞導讀章節">${chapterLinks}</nav><div class="grammar-articles-stream" data-articles-stream>${topics}${decisionMap}</div><div class="grammar-articles-curation__finish"><h3>用這套判斷方法練習</h3><p>前 50 題有清楚的規則分組；其後 100 題把四種答案混合，要求逐題看語境。</p><button class="grammar-button grammar-button--primary" type="button" data-articles-start>開始 150 題練習</button></div>`;
  window.EDMUND_GRAMMAR_FORMAT_CURATION(curation);
  dashboard.append(curation);

  const practice = document.createElement("section");
  practice.className = "panel grammar-practice grammar-articles-practice";
  practice.hidden = true;
  practice.dataset.articlesPractice = "";
  practice.innerHTML = `<div class="grammar-practice__head"><div><button class="grammar-button--ghost" type="button" data-articles-back-curation>← 返回冠詞導讀</button><p class="eyebrow">ARTICLES · 冠詞</p><h2>逐題練習</h2></div><div class="grammar-practice__tools"><div class="grammar-reading-mode" role="group" aria-label="解析閱讀模式"><span class="grammar-reading-mode__label">解析模式</span><button type="button" data-articles-mode="step" aria-pressed="false">逐步</button><button type="button" data-articles-mode="scroll" aria-pressed="false">捲動閱讀</button></div><div class="grammar-practice__summary"><strong data-articles-score>0</strong><span>/ 150<br>已答對</span></div></div></div><div class="grammar-progress" role="progressbar" aria-label="冠詞答對進度" aria-valuemin="0" aria-valuemax="150" aria-valuenow="0"><span data-articles-progress></span></div><div class="grammar-navigator"><div class="grammar-navigator__bar"><label><span class="sr-only">題目範圍</span><select class="grammar-range-select" data-articles-range aria-label="選擇題目範圍"></select></label><span class="grammar-navigator__legend">綠色：答對 · 紅色：需再試</span></div><div class="grammar-number-grid" data-articles-grid aria-label="選擇冠詞題目"></div></div><div class="grammar-highlight-tools"><button type="button" class="grammar-button--ghost" data-articles-highlight aria-pressed="false">🖍 暫時螢光筆</button><span>開啟後拖選題目或解析文字；再按一次清除。</span></div><article class="grammar-question"><div class="grammar-question__meta"><span class="grammar-question__number" data-articles-number></span><span class="grammar-question__tense" data-articles-guide></span><button class="grammar-bookmark" type="button" data-articles-bookmark aria-pressed="false">☆ 收藏這題</button></div><p class="grammar-question__prompt" data-articles-prompt></p><p class="grammar-question__translation" data-articles-translation></p><form class="grammar-answer" data-articles-form novalidate><label>您的答案<input name="answer" autocomplete="off" autocapitalize="none" spellcheck="false" aria-describedby="articles-answer-hint articles-feedback"></label><p class="grammar-answer__hint" id="articles-answer-hint">請填 a、an、the；若不用冠詞，請輸入 Ø 或 x。也可輸入完整句子。</p><div class="grammar-answer__actions"><button class="grammar-button grammar-button--primary" type="submit">提交答案</button></div><div class="grammar-feedback" id="articles-feedback" data-articles-feedback hidden aria-live="polite"></div></form><section class="grammar-explanation" data-articles-explanation hidden aria-labelledby="articles-explanation-title"><div class="grammar-explanation__head"><div><p class="eyebrow">STEP-BY-STEP</p><h3 id="articles-explanation-title" data-articles-explanation-title>冠詞 · 逐步解析</h3></div><p data-articles-answer></p></div><p class="grammar-explanation__instruction" data-articles-instruction></p><div class="grammar-steps" data-articles-steps></div></section></article><nav class="grammar-nav" aria-label="冠詞題目導覽"><button type="button" data-articles-previous>← 上一題</button><button type="button" data-articles-next>下一題 →</button></nav><p class="grammar-save-status" data-articles-save-status aria-live="polite"></p>`;
  dashboard.append(practice);

  const $ = (selector) => dashboard.querySelector(selector);
  const el = {
    correct: $("[data-articles-correct-count]"), attempted: $("[data-articles-attempted-count]"),
    score: $("[data-articles-score]"), progress: practice.querySelector(".grammar-progress"),
    progressFill: $("[data-articles-progress]"), position: $("[data-articles-position]"),
    stream: $("[data-articles-stream]"), range: $("[data-articles-range]"), grid: $("[data-articles-grid]"),
    number: $("[data-articles-number]"), guide: $("[data-articles-guide]"), prompt: $("[data-articles-prompt]"),
    translation: $("[data-articles-translation]"), form: $("[data-articles-form]"),
    input: $("[data-articles-form] input"), feedback: $("[data-articles-feedback]"),
    explanation: $("[data-articles-explanation]"), explanationTitle: $("[data-articles-explanation-title]"),
    answer: $("[data-articles-answer]"), instruction: $("[data-articles-instruction]"),
    steps: $("[data-articles-steps]"), saveStatus: $("[data-articles-save-status]"),
    bookmark: $("[data-articles-bookmark]"), highlight: $("[data-articles-highlight]")
  };
  for (let first = 1; first <= 150; first += 25) {
    el.range.append(new Option(`第 ${first}–${Math.min(150, first + 24)} 題`, String(first)));
  }

  const localKey = () => `edmund-grammar-articles-v1:${state.userId || "guest"}`;
  const itemKey = (number, step = 0) => step ? `articles:q${String(number).padStart(3, "0")}:step${String(step).padStart(2, "0")}` : `articles:q${String(number).padStart(3, "0")}`;
  function readLocal() {
    state.attempts = {};
    try {
      const saved = JSON.parse(localStorage.getItem(localKey()) || "null");
      if (Number.isInteger(saved?.question) && saved.question >= 1 && saved.question <= 150) state.question = saved.question;
      if (saved?.attempts && typeof saved.attempts === "object") {
        state.attempts = Object.fromEntries(Object.entries(saved.attempts).filter(([key, value]) => {
          const number = Number(key);
          return Number.isInteger(number) && number >= 1 && number <= 150 && ["correct", "wrong"].includes(value?.status);
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
    route.searchParams.set("lesson", "articles");
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
    el.progressFill.style.width = `${correct / 150 * 100}%`;
  }
  function renderGrid() {
    const first = Math.floor((state.question - 1) / 25) * 25 + 1;
    el.range.value = String(first);
    el.grid.replaceChildren();
    for (let number = first; number <= Math.min(150, first + 24); number++) {
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
    state.question = Math.min(150, Math.max(1, Number(number) || 1));
    state.startedAt = performance.now();
    saveLocal();
    const question = data.questions[state.question - 1];
    el.number.textContent = `QUESTION ${question.number} / 150`;
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
    $("[data-articles-previous]").disabled = state.question === 1;
    $("[data-articles-next]").disabled = state.question === 150;
    el.saveStatus.textContent = "";
    renderGrid();
    updateBookmark();
    setRoute("practice", state.question);
    if (focus) el.input.focus({ preventScroll: true });
  }

  function updateCurationReveal() {
    if (curation.hidden) return;
    const height = window.innerHeight || 800;
    const sections = [...el.stream.querySelectorAll("[data-articles-topic]")];
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
    el.position.textContent = `導讀 ${Math.min(revealed, 66)} / 66`;
  }
  function showCuration() {
    library.hidden = true;
    dashboard.querySelectorAll('[data-new-grammar-curation]').forEach((section) => { section.hidden = true; });
    tensePractice.hidden = true;
    dashboard.querySelectorAll('[data-advanced-articles-curation], [data-advanced-articles-practice]').forEach((section) => { section.hidden = true; });
    practice.hidden = true;
    curation.hidden = false;
    setRoute("curation");
    curation.scrollIntoView({ behavior: "instant", block: "start" });
    updateCurationReveal();
  }
  function showPractice(number = state.question) {
    library.hidden = true;
    dashboard.querySelectorAll('[data-new-grammar-curation]').forEach((section) => { section.hidden = true; });
    tensePractice.hidden = true;
    dashboard.querySelectorAll('[data-advanced-articles-curation], [data-advanced-articles-practice]').forEach((section) => { section.hidden = true; });
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
    for (const button of practice.querySelectorAll("[data-articles-mode]")) button.setAttribute("aria-pressed", String(button.dataset.articlesMode === state.explanationMode));
    el.explanation.dataset.mode = state.explanationMode;
    practice.classList.toggle("grammar-practice--scroll-reading", scrolling && !el.explanation.hidden);
    el.instruction.textContent = "請讀完每一步，再勾選「我已讀懂」，下一步才會顯示。";
    if (el.explanation.hidden) return;
    const steps = [...el.steps.querySelectorAll("[data-step-number]")];
    steps.forEach((step, index) => {
      step.hidden = !scrolling && index > 0 && !steps[index - 1].querySelector("[data-articles-reveal-step]").checked;
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
    return question.prompt.replace(/_{3,}/, question.answer === "Ø" ? "" : question.answer).replace(/\s+/g, " ").replace(/\s+([.,!?;:])/g, "$1").trim();
  }
  function showExplanation(question, correct) {
    el.explanation.dataset.result = correct ? "correct" : "wrong";
    el.explanationTitle.textContent = correct ? "答對了！逐步解析" : "再想一想：逐步解析";
    el.answer.textContent = `正確答案：${question.answer === "Ø" ? "Ø（不加冠詞）" : question.answer}`;
    el.steps.innerHTML = question.steps.map((step, index) => {
      const number = index + 1;
      const active = state.bookmarks.has(itemKey(question.number, number));
      return `<article class="grammar-step" data-step-number="${number}"${index ? " hidden" : ""}><div class="grammar-step__head"><h4>${escapeHtml(step.title)}</h4><button type="button" class="grammar-step__bookmark" data-articles-step-bookmark="${number}" aria-pressed="${active}">${active ? "★ 已收藏這一步" : "☆ 收藏這一步"}</button></div>${renderBody(step.body)}<label class="grammar-step__confirm"><input type="checkbox" data-articles-reveal-step="${number}"><span>我已讀懂這一步${number < question.steps.length ? "，顯示下一步" : "，完成解析"}</span></label></article>`;
    }).join("");
    el.explanation.hidden = false;
    if (state.explanationMode === "scroll") el.explanation.scrollIntoView({ behavior: "instant", block: "start" });
    updateExplanationMode();
    if (state.explanationMode !== "scroll") el.explanation.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
  function normalize(value) {
    return String(value ?? "").normalize("NFKC").toLowerCase().replace(/[‘’]/g, "'").replace(/[.!?]+$/g, "").replace(/\s+/g, " ").trim();
  }
  function correctAnswer(question, value) {
    const answer = normalize(value);
    if (question.answer === "Ø" && ["ø", "x", "0", "none", "no article", "zero article", "omit", "nothing"].includes(answer)) return true;
    if (answer === normalize(question.answer)) return true;
    return answer === normalize(filledSentence(question));
  }

  async function recordCompletion(number) {
    if (!state.token || state.remoteCorrect.has(number)) return;
    const context = window.EDMUND_LEARNING_PORTAL_CONTEXT;
    if (!context?.rpc) return;
    el.saveStatus.textContent = "正在安全儲存進度…";
    const duration = Math.max(0, Math.min(1800000, Math.round(performance.now() - state.startedAt)));
    try {
      const rows = await context.rpc("grammar_articles_record_completion", { p_token: state.token, p_question_number: number, p_duration_ms: duration });
      const row = Array.isArray(rows) ? rows[0] : rows;
      if (!row || Number(row.question_number) !== number) throw new Error("Article progress was not confirmed");
      state.remoteCorrect.add(number);
      el.saveStatus.textContent = "進度已安全儲存至您的帳戶。";
      updateTotals();
      renderGrid();
    } catch (error) {
      console.warn("Articles progress save failed", error);
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
        p_href: `grammar-system.html?lesson=articles&view=practice&question=${state.question}`,
        p_bookmarked: bookmarked
      });
      if (bookmarked) state.bookmarks.add(key); else state.bookmarks.delete(key);
      button.setAttribute("aria-pressed", String(bookmarked));
      button.textContent = bookmarked ? "★ 已收藏這一步" : "☆ 收藏這一步";
      updateBookmark();
      el.saveStatus.textContent = bookmarked ? "已加入書簽總目錄。" : "已從書簽移除。";
    } catch (error) {
      console.warn("Articles bookmark save failed", error);
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

  card.querySelector("[data-articles-open]").addEventListener("click", showCuration);
  curation.querySelector("[data-articles-menu]").addEventListener("click", showMenu);
  curation.querySelectorAll("[data-articles-start]").forEach((button) => button.addEventListener("click", () => showPractice(1)));
  curation.querySelectorAll("[data-articles-jump]").forEach((button) => button.addEventListener("click", () => {
    curation.querySelector(`#articles-topic-${button.dataset.articlesJump}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
  practice.querySelector("[data-articles-back-curation]").addEventListener("click", showCuration);
  practice.querySelectorAll("[data-articles-mode]").forEach((button) => button.addEventListener("click", () => {
    state.explanationMode = button.dataset.articlesMode;
    try { localStorage.setItem("edmund-grammar-articles-explanation-mode-v1", state.explanationMode); } catch { /* Optional preference. */ }
    updateExplanationMode();
  }));
  el.range.addEventListener("change", () => showQuestion(Number(el.range.value), true));
  practice.querySelector("[data-articles-previous]").addEventListener("click", () => showQuestion(state.question - 1, true));
  practice.querySelector("[data-articles-next]").addEventListener("click", () => showQuestion(state.question + 1, true));
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
    const question = data.questions[state.question - 1];
    const correct = correctAnswer(question, value);
    const correctBefore = new Set([...state.remoteCorrect, ...Object.entries(state.attempts).filter(([, attempt]) => attempt.status === 'correct').map(([number]) => Number(number))]).size;
    state.attempts[state.question] = { answer: value, status: correct ? "correct" : "wrong" };
    saveLocal();
    el.feedback.textContent = correct ? "✓ 答案正確！以下逐步解析會說明原因。" : "答案未正確。請按以下步驟看清語境，再試一次。";
    el.feedback.dataset.state = correct ? "correct" : "wrong";
    el.feedback.hidden = false;
    el.input.setAttribute("aria-invalid", String(!correct));
    showExplanation(question, correct);
    updateTotals();
    renderGrid();
    if (correct && correctBefore < data.questions.length && Array.from({ length: data.questions.length }, (_, index) => index + 1).every((number) => state.remoteCorrect.has(number) || state.attempts[number]?.status === 'correct'))
      document.dispatchEvent(new CustomEvent('edmund:eddy-module-complete'));
    if (correct) void recordCompletion(state.question);
  });
  el.steps.addEventListener("change", (event) => {
    const input = event.target.closest("[data-articles-reveal-step]");
    if (!input || state.explanationMode !== "step") return;
    const number = Number(input.dataset.articlesRevealStep);
    const later = [...el.steps.querySelectorAll("[data-step-number]")].filter((step) => Number(step.dataset.stepNumber) > number);
    if (!input.checked) {
      later.forEach((step) => {
        step.hidden = true;
        step.querySelector("[data-articles-reveal-step]").checked = false;
      });
    } else {
      const next = el.steps.querySelector(`[data-step-number="${number + 1}"]`);
      if (next) { next.hidden = false; next.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
    }
  });
  el.bookmark.addEventListener("click", () => {
    const question = data.questions[state.question - 1];
    const key = itemKey(question.number);
    void setBookmark(key, `Articles 冠詞 · 第 ${question.number} 題`, `${question.prompt}\n${question.translation}`, !state.bookmarks.has(key), el.bookmark);
  });
  el.steps.addEventListener("click", (event) => {
    const button = event.target.closest("[data-articles-step-bookmark]");
    if (!button) return;
    const question = data.questions[state.question - 1];
    const number = Number(button.dataset.articlesStepBookmark);
    const step = question.steps[number - 1];
    const key = itemKey(question.number, number);
    void setBookmark(key, `Articles 冠詞 · 第 ${question.number} 題 · ${step.title}`, step.body, !state.bookmarks.has(key), button);
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
      const rows = await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc("grammar_articles_list_progress", { p_token: state.token });
      state.remoteCorrect = new Set((Array.isArray(rows) ? rows : []).map((row) => Number(row.question_number)).filter((number) => number >= 1 && number <= 150));
    } catch (error) { console.warn("Articles progress load failed", error); }
    try {
      const rows = await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc("learning_portal_list_bookmarks", { p_token: state.token, p_system_key: "grammar" });
      state.bookmarks = new Set((Array.isArray(rows) ? rows : []).map((row) => String(row.item_key)));
    } catch (error) { console.warn("Articles bookmarks load failed", error); }
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
  if (route.get("lesson") === "articles") {
    const requested = Number(route.get("question"));
    if (route.get("view") === "practice" && Number.isInteger(requested) && requested >= 1 && requested <= 150) showPractice(requested);
    else showCuration();
  }
  queueMicrotask(adoptSession);
})();
