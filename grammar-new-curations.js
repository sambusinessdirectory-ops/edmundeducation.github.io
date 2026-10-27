(function () {
  "use strict";

  const lessons = window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA;
  const dashboard = document.querySelector('[data-learning-portal-root] [data-view="dashboard"]');
  const library = dashboard?.querySelector('[data-grammar-library]');
  if (!dashboard || !library || !Array.isArray(lessons)) return;

  const otherViews = '[data-tense-curation], [data-grammar-practice], [data-articles-curation], [data-articles-practice], [data-advanced-articles-curation], [data-advanced-articles-practice], [data-new-grammar-curation], [data-new-grammar-practice]';
  const allViews = [];

  function formatGuide(view) {
    const source = view.querySelector(".grammar-new-body");
    const stream = document.createElement("div");
    stream.className = "grammar-articles-stream grammar-new-stream";
    const intro = document.createElement("div");
    intro.className = "grammar-new-intro";
    let chapter = "";
    let card = null;
    let body = null;
    let appendix = null;

    for (const node of [...source.children]) {
      const heading = node.tagName === "H3" && node.textContent.match(/^([SMU])(\d{2})｜(.+)$/);
      if (node.tagName === "H2") {
        chapter = node.textContent;
        const divider = document.createElement("div");
        divider.className = "grammar-tense-deep-dive grammar-new-chapter";
        divider.id = node.id;
        const label = document.createElement("span");
        label.textContent = "GRAMMAR GUIDE · 語法導讀";
        const title = document.createElement("h3");
        title.textContent = chapter;
        divider.append(label, title);
        stream.append(divider);
        card = null;
        body = null;
        appendix = null;
        continue;
      }
      if (heading) {
        card = document.createElement("article");
        card.className = "grammar-articles-topic grammar-tense-topic grammar-new-topic";
        card.dataset.scrollVisible = "true";
        card.id = `${view.dataset.newGrammarCuration}-topic-${heading[1]}${heading[2]}`;
        const head = document.createElement("div");
        head.className = "grammar-articles-topic__head";
        const badge = document.createElement("span");
        badge.textContent = heading[2];
        const copy = document.createElement("div");
        const small = document.createElement("small");
        small.textContent = chapter;
        const title = document.createElement("h3");
        title.textContent = heading[3];
        copy.append(small, title);
        head.append(badge, copy);
        body = document.createElement("div");
        body.className = "grammar-new-topic__content";
        card.append(head, body);
        stream.append(card);
        appendix = null;
        continue;
      }
      if (node.tagName === "HR") continue;
      if (card) {
        if (node.tagName === "P" && body.childElementCount === 0) {
          const focus = document.createElement("div");
          focus.className = "grammar-tense-topic__focus";
          const label = document.createElement("span");
          label.textContent = "核心判斷";
          focus.append(label, node);
          card.insertBefore(focus, body);
        } else {
          body.append(node);
        }
      } else if (chapter) {
        if (!appendix) {
          appendix = document.createElement("article");
          appendix.className = "grammar-articles-topic grammar-tense-topic grammar-new-topic grammar-new-appendix";
          appendix.dataset.scrollVisible = "true";
          stream.append(appendix);
        }
        appendix.append(node);
      } else {
        intro.append(node);
      }
    }
    source.replaceChildren(intro, stream);
  }

  function setRoute(slug) {
    const route = new URL(window.location.href);
    if (slug) {
      route.searchParams.set("lesson", slug);
      route.searchParams.set("view", "curation");
    } else {
      route.searchParams.delete("lesson");
      route.searchParams.delete("view");
    }
    route.searchParams.delete("question");
    window.history.replaceState(null, "", `${route.pathname}${route.search}`);
  }

  function open(view, slug) {
    library.hidden = true;
    dashboard.querySelectorAll(otherViews).forEach((section) => { section.hidden = true; });
    view.hidden = false;
    setRoute(slug);
    view.scrollIntoView({ behavior: "instant", block: "start" });
  }

  function showLibrary() {
    allViews.forEach((view) => { view.hidden = true; });
    library.hidden = false;
    setRoute("");
    library.scrollIntoView({ behavior: "instant", block: "start" });
  }

  lessons.forEach((lesson, index) => {
    const card = document.createElement("article");
    card.className = "grammar-lesson-card grammar-lesson-card--new-curation";
    card.innerHTML = `<div class="grammar-lesson-card__copy"><p class="eyebrow">MODULE ${String(index + 4).padStart(2, "0")} · CURATION + 150 QUESTIONS</p><h3>${lesson.english} <span lang="zh-Hant">${lesson.chinese}</span></h3><p>${lesson.count} 個編號教學重點，附英文例句、繁體中文解說及用法對照；再練習 150 題。</p></div><div class="grammar-lesson-card__stats"><button class="grammar-button" type="button">閱讀導讀</button></div>`;
    library.append(card);

    const view = document.createElement("section");
    view.className = "panel grammar-articles-curation grammar-tense-curation grammar-new-curation";
    view.dataset.newGrammarCuration = lesson.slug;
    view.hidden = true;
    const chapters = lesson.chapters.map((chapter) => `<a href="#${chapter.id}">${chapter.title}</a>`).join("");
    view.innerHTML = `<div class="grammar-articles-curation__head"><button class="grammar-button--ghost" type="button" data-back-library>← 返回語法目錄</button><p class="eyebrow">MODULE ${String(index + 4).padStart(2, "0")} · READING GUIDE</p><h2>${lesson.english} <span lang="zh-Hant">${lesson.chinese}</span></h2><p>${lesson.count} 個教學重點 · 英式英語為主 · 香港繁體中文解說</p></div><nav class="grammar-new-chapters" aria-label="章節導覽">${chapters}</nav><article class="grammar-new-body">${lesson.html}</article><div class="grammar-articles-curation__finish"><button class="grammar-button grammar-button--primary" type="button" data-back-library>返回語法目錄</button></div>`;
    formatGuide(view);
    dashboard.append(view);
    allViews.push(view);
    card.querySelector("button").addEventListener("click", () => open(view, lesson.slug));
    view.querySelectorAll("[data-back-library]").forEach((button) => button.addEventListener("click", showLibrary));
  });

  const requested = new URLSearchParams(window.location.search).get("lesson");
  const initial = lessons.findIndex((lesson) => lesson.slug === requested);
  if (initial >= 0) open(allViews[initial], lessons[initial].slug);
})();
