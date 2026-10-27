(function () {
  "use strict";

  const lessons = window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA;
  const dashboard = document.querySelector('[data-learning-portal-root] [data-view="dashboard"]');
  const library = dashboard?.querySelector('[data-grammar-library]');
  if (!dashboard || !library || !Array.isArray(lessons)) return;

  const otherViews = '[data-tense-curation], [data-grammar-practice], [data-articles-curation], [data-articles-practice], [data-advanced-articles-curation], [data-advanced-articles-practice], [data-new-grammar-curation]';
  const allViews = [];

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
    card.innerHTML = `<div class="grammar-lesson-card__copy"><p class="eyebrow">MODULE ${String(index + 4).padStart(2, "0")} · READING GUIDE</p><h3>${lesson.english} <span lang="zh-Hant">${lesson.chinese}</span></h3><p>${lesson.count} 個編號教學重點，附英文例句、繁體中文解說及用法對照。暫無練習題。</p></div><div class="grammar-lesson-card__stats"><button class="grammar-button" type="button">閱讀導讀</button></div>`;
    library.append(card);

    const view = document.createElement("section");
    view.className = "panel grammar-articles-curation grammar-new-curation";
    view.dataset.newGrammarCuration = lesson.slug;
    view.hidden = true;
    const chapters = lesson.chapters.map((chapter) => `<a href="#${chapter.id}">${chapter.title}</a>`).join("");
    view.innerHTML = `<div class="grammar-articles-curation__head"><button class="grammar-button--ghost" type="button" data-back-library>← 返回語法目錄</button><p class="eyebrow">MODULE ${String(index + 4).padStart(2, "0")} · READING GUIDE</p><h2>${lesson.english} <span lang="zh-Hant">${lesson.chinese}</span></h2><p>${lesson.count} 個教學重點 · 英式英語為主 · 香港繁體中文解說</p></div><nav class="grammar-new-chapters" aria-label="章節導覽">${chapters}</nav><article class="grammar-new-body">${lesson.html}</article><div class="grammar-articles-curation__finish"><button class="grammar-button grammar-button--primary" type="button" data-back-library>返回語法目錄</button></div>`;
    dashboard.append(view);
    allViews.push(view);
    card.querySelector("button").addEventListener("click", () => open(view, lesson.slug));
    view.querySelectorAll("[data-back-library]").forEach((button) => button.addEventListener("click", showLibrary));
  });

  const requested = new URLSearchParams(window.location.search).get("lesson");
  const initial = lessons.findIndex((lesson) => lesson.slug === requested);
  if (initial >= 0) open(allViews[initial], lessons[initial].slug);
})();
