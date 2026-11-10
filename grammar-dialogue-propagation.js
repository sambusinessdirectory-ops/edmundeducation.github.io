(() => {
  "use strict";
  const engine = window.EDMUND_GRAMMAR_EDDY;
  if (!engine) return;
  const views = [];
  for (const [slug, selector, cards] of [
    ["tense", "[data-tense-curation]", "[data-tense-topic]"],
    ["articles", "[data-articles-curation]", "article[data-articles-topic]"],
    ["advanced-articles", "[data-advanced-articles-curation]", "article[data-advanced-articles-topic]"]
  ]) {
    const view = document.querySelector(selector);
    if (!view) continue;
    view.dataset.eddyModule = slug;
    // Reuse the reference renderer without changing the original route or rule IDs.
    const original = view.dataset.newGrammarCuration;
    view.dataset.newGrammarCuration = slug;
    const prepared = [];
    view.querySelectorAll(cards).forEach((card, index) => {
      const rule = Number(card.dataset.tenseTopic || card.dataset.articlesTopic || card.dataset.advancedArticlesTopic);
      const note = slug === "tense"
        ? window.EDMUND_GRAMMAR_TENSE_CURATION[index]?.check
        : window.EDMUND_GRAMMAR_DIALOGUE_NOTES[slug]?.[rule];
      if (!note) throw new Error(`Missing reviewed dialogue note: ${slug} ${rule}`);
      const head = card.querySelector(".grammar-articles-topic__head");
      const focus = card.querySelector(".grammar-tense-topic__focus, .grammar-articles-topic__focus");
      if (focus) focus.classList.add("grammar-tense-topic__focus");
      const content = document.createElement("div");
      content.className = "grammar-new-topic__content";
      const controls = document.createElement("div");
      controls.className = "grammar-dialogue-controls";
      for (const node of [...card.children]) {
        if (node === head || node === focus) continue;
        if (node.matches(".grammar-tense-checkpoint, .grammar-articles-curation__actions, .grammar-tense-topic__source")) controls.append(node);
        else content.append(node);
      }
      const caption = document.createElement("p");
      caption.textContent = note;
      content.append(caption);
      card.classList.add("grammar-new-topic");
      card.append(content);
      prepared.push({card, controls});
    });
    // Renderer uses positional notes for the new guides; legacy notes above use stable source IDs.
    const saved = window.EDMUND_GRAMMAR_DIALOGUE_NOTES[slug];
    delete window.EDMUND_GRAMMAR_DIALOGUE_NOTES[slug];
    engine.add(view);
    window.EDMUND_GRAMMAR_DIALOGUE_NOTES[slug] = saved;
    if (original === undefined) delete view.dataset.newGrammarCuration;
    else view.dataset.newGrammarCuration = original;
    for (const {card, controls} of prepared) if (controls.childElementCount) card.append(controls);
    views.push(view);
    view.addEventListener("toggle", () => engine.schedule(view), true);
    new MutationObserver(() => engine.schedule(view)).observe(view, {attributes:true, attributeFilter:["hidden"]});
  }
  for (const view of document.querySelectorAll('[data-new-grammar-curation="so"], [data-new-grammar-curation="modal"], [data-new-grammar-curation="reported-speech"], [data-new-grammar-curation="phrasal-verbs"], [data-new-grammar-curation="relative-clauses"], [data-new-grammar-curation="passive-voice"], [data-new-grammar-curation="prepositions"], [data-new-grammar-curation="conditionals"]')) {
    view.dataset.eddyModule = view.dataset.newGrammarCuration;
    views.push(view);
  }
  for (const view of views) {
    view.querySelectorAll(".grammar-new-table-wrap").forEach(table => {
      table.tabIndex = 0;
      table.setAttribute("role", "region");
      table.setAttribute("aria-label", "語法對照表；可左右捲動");
    });
  }
  const dashboard = document.querySelector('[data-view="dashboard"]');
  if (dashboard) new MutationObserver(() => views.forEach(engine.schedule))
    .observe(dashboard, {attributes:true, attributeFilter:["hidden", "class"]});
  const schedule = () => views.forEach(engine.schedule);
  window.addEventListener("resize", schedule);
  document.fonts?.ready.then(schedule);
  schedule();
})();
