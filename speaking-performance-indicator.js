(function initialiseSpeakingPerformanceIndicator() {
  "use strict";

  const pointItems = Object.freeze([

    Object.freeze({ id: "idea-topic-sentence", label: "Idea / Topic Sentence · 論點／主題句" }),
    Object.freeze({ id: "explanation", label: "Explanation · 解釋" }),
    Object.freeze({ id: "example", label: "Example · 例子" }),
    Object.freeze({ id: "conclusion", label: "Conclusion · 結論" }),
    Object.freeze({ id: "contextual-reference", label: "Contextual Reference · 引用語境" }),
    Object.freeze({ id: "task-response", label: "Task Response 回應題目" }),
    Object.freeze({ id: "responding-to-others", label: "Responding to Others 回應他人" }),
    ...[["example-conceptual", "Example - Conceptual", "命名法例子"], ["example-numerical", "Example - Numerical", "數字法例子"], ["clear-keywords", "Clear Keywords", "明顯關鍵詞"], ["future-outlook", "Future Outlook", "未來寄詞"], ["action-plan", "Action Plan", "行動建議"], ["rebuttal", "Rebuttal", "駁論"], ["balanced-view", "Balanced View", "持平看法"], ["stance", "Stance", "立場"]].map(([id,en,zh])=>Object.freeze({id,en,zh,label:en+" · "+zh}))
  ]);

  const content = Object.freeze([
    ...[1, 2, 3, 4].flatMap(point => pointItems.map(item => Object.freeze({
      id: point === 1 ? item.id : `point-${point}-${item.id}`,
      label: `${['First point', 'Second argument', 'Third argument', 'Fourth argument'][point - 1]} · ${item.label}`,
      point, en:item.en, zh:item.zh, shortLabel: item.label
    })))
  ]);

  const language = Object.freeze([
    Object.freeze({ id: "parallelism-juxtaposition", label: "Parallelism / Juxtaposition 並置" }),
    Object.freeze({ id: "rule-of-three", label: "Rule of Three 排比" }),
    Object.freeze({ id: "modal", label: "Modal 情態 (Can / Could / Should / Would)" }),
    Object.freeze({ id: "comparatives", label: "Comparatives 比較句 (more / less)" }),
    Object.freeze({ id: "contrast", label: "Contrast 內容對比 (Young vs Old, Past vs Future etc.)" }),
    Object.freeze({ id: "adjectives-adverbs", label: "Adjectives / Adverbs" }),
    Object.freeze({ id: "negative-statements", label: "Negative statements 否定句" }),
    Object.freeze({ id: "personification", label: "Personification 擬人句" }),
    Object.freeze({ id: "reification", label: "Reification 擬物句" }),
    Object.freeze({ id: "simile", label: "Simile 明喻" }),
    Object.freeze({ id: "metaphor", label: "Metaphor 暗喻" }),
    Object.freeze({ id: "metonymy-synecdoche", label: "Metonymy / Synecdoche 借代" }),
    Object.freeze({ id: "double-literary-devices", label: "Double literary devices 雙重修辭 (e.g., 並置並置 / 並置排比 etc.)" }),
    Object.freeze({ id: "phrasal-verbs", label: "Phrasal Verbs 動詞片語" }),
    Object.freeze({ id: "concession", label: "Although / Even though / Even if -- (Concession 讓步句)" }),
    Object.freeze({ id: "precise-vocabulary", label: "Precise Vocabulary" }),
    ...[['sentence-structure', 'Sentence Structure 句子結構'], ['supporting-details', 'Supporting Details 支持細節'], ['rephrasing', 'Rephrasing 改述'], ['rhetorical-questions', 'Rhetorical Questions 反問句'], ['common-expressions', 'Common Expressions 常用語'], ['collocations', 'Collocations 詞語搭配'], ['power-words', 'Power Words 有力詞彙']].map(([id, label]) => Object.freeze({ id, label }))
    ,...[["prepositional-phrases", "Prepositional Phrases", "介詞句"], ["compound-nouns", "Compound Nouns", "複合名詞"], ["synonyms", "Synonyms", "同義詞（一義多詞）"], ["polysemy", "Polysemy", "一詞多義"], ["idioms", "Idioms", "成語"], ["proverbs", "Proverbs", "諺語"], ["native-english", "Native English", "母語級表達句"], ["advanced-native-english", "Advanced Native English", "高階母語級表達句"], ["hedging", "Hedging", "緩和語"], ["correct-tense", "Correct Tense", "正確時式"], ["varied-tense", "Varied Tense Use", "不同時式"], ["correct-articles-number", "Correct Articles / Singular and Plural Forms", "正確冠詞／單複數"], ["emotional-attribution", "Emotional Attribution", "情感解釋"], ["ppf", "PPF (Past / Present / Future)", "過去／現在／未來"], ["wh-word", "WH word", "爆上爆"], ["quotes", "Quotes", "名言引用"], ["thematic-vocabulary", "Thematic Vocabulary", "主題性生字"], ["irregular-verbs", "Irregular Verbs", "不規則動詞"], ["change-pos", "Change of POS", "活用詞性"], ["clear-timeline", "Clear Timeline", "清楚時間線"], ["self-correction", "Self-Correction", "自我修正"], ["other-literary-devices", "Other Literary Devices", "其他修辭手法"], ["fluency-quick-response", "Fluency 1 - Quick Response", "即時回應（流利）"], ["fluency-fluid-speech", "Fluency 2 - Fluid Speech", "連貫性（流利）"], ["connectives", "Connectives", "連接詞"], ["double-adjectives", "Double Adjectives", "雙形容詞"], ["body-gestures", "Body Language - Gestures", "身體語言－手勢"], ["body-head-movement", "Body Language - Head Movement", "身體語言－點頭"], ["body-smiles-laughs", "Body Language - Smiles and Laughs", "身體語言－笑容"]].map(([id,en,zh])=>Object.freeze({id,en,zh,label:en+" · "+zh}))
  ]);

  const mistakes = Object.freeze([["grammar", "Grammar", "文法"], ["repetitive-words", "Repetitive words", "用詞重複"], ["wrong-paraphrasing", "Wrong paraphrasing", "改述不當"], ["lack-explanation", "Lack of explanation", "缺乏解釋"], ["lack-example", "Lack of example", "缺乏例子"], ["wrong-structure", "Wrong sentence structure", "句子結構錯誤"], ["lack-response", "Lack of response", "缺乏回應"], ["irrelevance", "Irrelevance", "離題"], ["inactive", "Inactive", "參與不足"], ["dominance", "Conversation dominance", "過度主導討論"], ["dead-air", "Dead Air", "冷場"], ["excessive-fillers", "Excessive Filler Words", "過多語氣詞"], ["lack-gestures", "Lack of Body Language - Gestures", "缺乏身體語言－手勢"], ["lack-head-movement", "Lack of Body Language - Head Movement", "缺乏身體語言－點頭"], ["lack-eye-contact", "Lack of Eye Contact", "缺乏眼神接觸"], ["monotone", "Monotone", "沒有抑揚頓挫"], ["ed-ing-adjectives", "Incorrect -ed / -ing Adjectives", "-ed／-ing 形容詞使用不當"]].map(([id,en,zh])=>Object.freeze({id,en,zh,label:en+" · "+zh})));

  const ids = Object.freeze({
    content: new Set(content.map(item => item.id)),
    language: new Set(language.map(item => item.id)),
    mistakes: new Set(mistakes.map(item=>item.id))
  });
  const selections = new Map();
  const moduleUrl = document.currentScript?.src ? new URL('floating-window.mjs?v=20260916-speaking-study', document.currentScript.src).href : './floating-window.mjs?v=20260916-speaking-study';
  function noteKey(key) {
    try {
      const session = JSON.parse(sessionStorage.getItem('edmundSpeakingSessionV1') || 'null');
      return session?.id ? `speakingPracticeNotesV1:${session.role}:${session.id}:${key}` : null;
    } catch { return null; }
  }
  function mountNotes(panel, key) {
    const input = panel.querySelector('[data-performance-notes]');
    const status = panel.querySelector('[data-notes-status]');
    const storageKey = noteKey(key);
    try { input.value = storageKey ? localStorage.getItem(storageKey) || '' : ''; }
    catch { status.textContent = '未能讀取筆記；請保留此頁。'; }
    input.addEventListener('input', () => {
      try {
        if (!storageKey) throw new Error('No student');
        localStorage.setItem(storageKey, input.value);
        status.textContent = '已儲存於此瀏覽器 · Saved in this browser';
      } catch { status.textContent = '尚未儲存：請複製筆記備份。'; }
    });
  }
  async function enableGeometry(panel) {
    try {
      const { mountFloatingWindow } = await import(moduleUrl);
      if (!panel.isConnected) return;
      mountFloatingWindow(panel, { dragHandle: panel.querySelector('.performance-indicator-heading'), isActive: () => panel.classList.contains('is-floating') });
    } catch (error) { console.warn('Floating window controls could not load', error); }
  }
  let mountFrame = 0;

  function normalize(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
      content: [...new Set(Array.isArray(source.content) ? source.content.map(String).filter(id => ids.content.has(id)) : [])],
      language: [...new Set(Array.isArray(source.language) ? source.language.map(String).filter(id => ids.language.has(id)) : [])],
      mistakes: [...new Set(Array.isArray(source.mistakes) ? source.mistakes.map(String).filter(id=>ids.mistakes.has(id)) : [])]
    };
  }

  function contextKey(container) {
    const practice = container.closest(".exam-practice-view") || container.closest("[data-view-content]");
    const dse = practice?.classList.contains("dse-practice-view");
    const heading = practice?.querySelector(".dse-practice-header, .exam-progress-card");
    const stableHeading = heading?.cloneNode(true);
    stableHeading?.querySelectorAll('time, [data-exam-elapsed-clock]').forEach(clock => clock.remove());
    const question = practice?.querySelector(
      ".dse-single-question h2, .dse-practice-card h2, .exam-question-card h1, .examiner-message:last-of-type p"
    );
    return [
      noteKey('owner'), location.hash, dse ? "dse" : "ielts",
      stableHeading?.textContent || "",
      question?.textContent || ""
    ].map(value => String(value).replace(/\s+/g, " ").trim()).join("|");
  }

  function stateFor(container) {
    const key = contextKey(container);
    if (!selections.has(key)) {
      let saved=null;
      try { const storageKey=noteKey('evaluation:'+key); if(storageKey)saved=JSON.parse(localStorage.getItem(storageKey)||'null'); } catch {}
      selections.set(key,normalize(saved));
    }
    return { key, value: selections.get(key) };
  }

  function snapshot(root = document) {
    const indicator = root?.matches?.("[data-performance-indicator]")
      ? root
      : root?.querySelector?.("[data-performance-indicator]");
    if (!indicator) return null;
    const value = selections.get(indicator.dataset.performanceContext) || normalize(null);
    const normalized = normalize(value);
    return Object.freeze({
      version: 2,
      content: Object.freeze([...normalized.content]),
      language: Object.freeze([...normalized.language]),
      mistakes:Object.freeze([...normalized.mistakes])
    });
  }

  function tableHtml(kind, titleEn, titleZh, items, selected) {
    return `
      <section class="performance-table-card performance-${kind}">
        <header>
          <div><span>${titleEn}</span><h3>${titleZh}</h3></div>
          <strong data-performance-count="${kind}">${selected.length} / ${items.length}</strong>
        </header>
        <div class="performance-table-scroll">
          <table>
            <caption class="visually-hidden">${titleEn} · ${titleZh}</caption>
            <thead><tr><th scope="col">評估項目</th><th scope="col">${kind === "mistakes" ? "需改善" : "做到"}</th></tr></thead>
            <tbody>
              ${items.map((item, index) => `
                ${kind === 'content' && index % pointItems.length === 0 ? `<tr class="performance-point-heading"><th colspan="2">${['First point 第一論點', 'Second argument 第二論點', 'Third argument 第三論點', 'Fourth argument 第四論點'][Math.floor(index / pointItems.length)]}</th></tr>` : ''}
                <tr class="${selected.includes(item.id) ? "is-checked" : ""}">
                  <th scope="row"><label for="performance-${kind}-${index}">${kind === "content" && item.point ? ((index % pointItems.length) + 1) : index + 1}. ${item.shortLabel || item.label}</label></th>
                  <td><input id="performance-${kind}-${index}" type="checkbox" data-performance-kind="${kind}" value="${item.id}" ${selected.includes(item.id) ? "checked" : ""} aria-label="${item.label}"></td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
      </section>`;
  }

  function indicatorHtml(value) {
    return `
      <section class="speaking-performance-indicator" data-performance-indicator aria-labelledby="performance-indicator-title">
        <header class="performance-indicator-heading"><button type="button" data-performance-float aria-pressed="false">浮動視窗 ↗</button>
          <div>
            <span>ADVANCED SPEAKING PERFORMANCE INDICATOR</span>
            <h2 id="performance-indicator-title">進階說話表現指標</h2>
          </div>
          <p>內容及語言勾選已做到的項目；錯誤欄勾選待改善之處。不適用項目可留空，毋須刻意使用全部技巧。<br><span>Student or examiner: tick demonstrated features; in Mistakes, tick issues to improve.</span></p>
        </header>
        <div class="performance-panel-scroll">
        <section class="performance-notes"><label for="performance-practice-notes">練習筆記 · Practice notes</label>
          <textarea id="performance-practice-notes" data-performance-notes maxlength="20000" placeholder="記下字詞、想法或練習心得…"></textarea>
          <small data-notes-status role="status">筆記按題目自動儲存於此瀏覽器。</small>
        </section>
        <div class="performance-table-grid">
          ${tableHtml("content", "CONTENT CHECKLIST", "內容", content, value.content)}
          ${tableHtml("language", "LANGUAGE CHECKLIST", "語言", language, value.language)}
          ${tableHtml("mistakes", "MISTAKES", "錯誤／待改善", mistakes, value.mistakes)}
        </div></div>
      </section>`;
  }

  function mount(container) {
    if (!container?.isConnected || container.querySelector(":scope > [data-performance-indicator]")) return;
    if (container.closest(".dse-practice-view") && !container.querySelector(".cue-label")) {
      const label = document.createElement("span");
      label.className = "cue-label";
      label.textContent = "YOUR ANSWER · 你的回答";
      container.prepend(label);
    }
    const { key, value } = stateFor(container);
    container.insertAdjacentHTML("beforeend", indicatorHtml(value));
    const panel = container.querySelector("[data-performance-indicator]");
    panel.dataset.performanceContext = key;
    mountNotes(panel, key);
  }

  function mountAll() {
    mountFrame = 0;
    document.querySelectorAll(
      ".exam-practice-view:not(.dse-practice-view) .exam-answer-recorder, " +
      ".dse-practice-view .recorder-card, " +
      ".dse-practice-view .admin-recorder-notice, [data-recorder-card]"
    ).forEach(mount);
  }

  function scheduleMount() {
    if (!mountFrame) mountFrame = requestAnimationFrame(mountAll);
  }

  document.addEventListener("change", event => {
    const checkbox = event.target.closest("[data-performance-kind]");
    if (!checkbox) return;
    const indicator = checkbox.closest("[data-performance-indicator]");
    const kind = checkbox.dataset.performanceKind;
    const id = checkbox.value;
    if (!indicator || !ids[kind]?.has(id)) return;
    const current = selections.get(indicator.dataset.performanceContext) || normalize(null);
    const next = new Set(current[kind]);
    if (checkbox.checked) next.add(id); else next.delete(id);
    current[kind] = [...next];
    selections.set(indicator.dataset.performanceContext, current);
    try {const key=noteKey('evaluation:'+indicator.dataset.performanceContext);if(key)localStorage.setItem(key,JSON.stringify(current));}catch{}
    checkbox.closest("tr")?.classList.toggle("is-checked", checkbox.checked);
    const count = indicator.querySelector(`[data-performance-count="${kind}"]`);
    if (count) count.textContent = `${current[kind].length} / ${ids[kind].size}`;
  });

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-performance-float]");
    if (!button) return;
    const panel = button.closest("[data-performance-indicator]");
    const floating = panel.classList.toggle("is-floating");
    if (floating) enableGeometry(panel);
    else for (const name of ['left','top','right','bottom','width','height','transform']) panel.style[name] = '';
    if(typeof panel.showPopover === 'function') {
      if(floating){panel.setAttribute('popover','manual');panel.showPopover();}
      else{panel.hidePopover();panel.removeAttribute('popover');}
    }
    button.setAttribute("aria-pressed", String(floating));
    button.textContent = floating ? "還原面板 ↙" : "浮動視窗 ↗";
  });

  function mountForSession(container, key, initial = null) {
    selections.set(key, normalize(initial));
    container.innerHTML = indicatorHtml(normalize(initial));
    const indicator = container.querySelector('[data-performance-indicator]');
    indicator.dataset.performanceContext = key;
    mountNotes(indicator, key);
    return indicator;
  }
  const observer = new MutationObserver(scheduleMount);
  const start = () => {
    const root = document.querySelector("[data-view-content]");
    if (root) observer.observe(root, { childList: true, subtree: true });
    mountAll();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();

  window.EDMUND_SPEAKING_PERFORMANCE_INDICATOR = Object.freeze({ content, language, mistakes, pointItems, normalize, snapshot, mountForSession });
})();
