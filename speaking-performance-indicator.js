(function initialiseSpeakingPerformanceIndicator() {
  "use strict";

  const content = Object.freeze([
    Object.freeze({ id: "idea-topic-sentence", label: "Idea / Topic Sentence" }),
    Object.freeze({ id: "explanation", label: "Explanation" }),
    Object.freeze({ id: "example", label: "Example" }),
    Object.freeze({ id: "conclusion", label: "Conclusion" }),
    Object.freeze({ id: "contextual-reference", label: "Contextual Reference" })
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
    Object.freeze({ id: "precise-vocabulary", label: "Precise Vocabulary" })
  ]);

  const ids = Object.freeze({
    content: new Set(content.map(item => item.id)),
    language: new Set(language.map(item => item.id))
  });
  const selections = new Map();
  let mountFrame = 0;

  function normalize(value) {
    const source = value && typeof value === "object" ? value : {};
    return {
      content: [...new Set(Array.isArray(source.content) ? source.content.map(String).filter(id => ids.content.has(id)) : [])],
      language: [...new Set(Array.isArray(source.language) ? source.language.map(String).filter(id => ids.language.has(id)) : [])]
    };
  }

  function contextKey(container) {
    const practice = container.closest(".exam-practice-view");
    const dse = practice?.classList.contains("dse-practice-view");
    const heading = practice?.querySelector(".dse-practice-header, .exam-progress-card");
    const question = practice?.querySelector(
      ".dse-single-question h2, .dse-practice-card h2, .exam-question-card h1, .examiner-message:last-of-type p"
    );
    return [
      dse ? "dse" : "ielts",
      heading?.textContent || "",
      question?.textContent || ""
    ].map(value => String(value).replace(/\s+/g, " ").trim()).join("|");
  }

  function stateFor(container) {
    const key = contextKey(container);
    if (!selections.has(key)) selections.set(key, normalize(null));
    return { key, value: selections.get(key) };
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
            <thead><tr><th scope="col">評估項目</th><th scope="col">做到</th></tr></thead>
            <tbody>
              ${items.map((item, index) => `
                <tr class="${selected.includes(item.id) ? "is-checked" : ""}">
                  <th scope="row"><label for="performance-${kind}-${index}">${index + 1}. ${item.label}</label></th>
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
        <header class="performance-indicator-heading">
          <div>
            <span>ADVANCED SPEAKING PERFORMANCE INDICATOR</span>
            <h2 id="performance-indicator-title">進階說話表現指標</h2>
          </div>
          <p>學生或考官可即時勾選已做到的項目。<br><span>Student or examiner: tick each feature demonstrated in this answer.</span></p>
        </header>
        <div class="performance-table-grid">
          ${tableHtml("content", "CONTENT CHECKLIST", "內容", content, value.content)}
          ${tableHtml("language", "LANGUAGE CHECKLIST", "語言", language, value.language)}
        </div>
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
    container.querySelector("[data-performance-indicator]").dataset.performanceContext = key;
  }

  function mountAll() {
    mountFrame = 0;
    document.querySelectorAll(
      ".exam-practice-view:not(.dse-practice-view) .exam-answer-recorder, " +
      ".dse-practice-view .recorder-card, " +
      ".dse-practice-view .admin-recorder-notice"
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
    checkbox.closest("tr")?.classList.toggle("is-checked", checkbox.checked);
    const count = indicator.querySelector(`[data-performance-count="${kind}"]`);
    if (count) count.textContent = `${current[kind].length} / ${kind === "content" ? content.length : language.length}`;
  });

  const observer = new MutationObserver(scheduleMount);
  const start = () => {
    const root = document.querySelector("[data-view-content]");
    if (root) observer.observe(root, { childList: true, subtree: true });
    mountAll();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();

  window.EDMUND_SPEAKING_PERFORMANCE_INDICATOR = Object.freeze({ content, language, normalize });
})();
