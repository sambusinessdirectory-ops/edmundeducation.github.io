(function () {
  "use strict";

  const lessons = window.EDMUND_GRAMMAR_NEW_CURATIONS_DATA;
  const EDDY_MEDIA_ORIGIN = "https://edmund-public-media.edmundeducation.workers.dev";
  const EDDY_POSE_VERSION = "20261106-live-assets2";
  if (Array.isArray(lessons) && window.EDMUND_INDEFINITE_PRONOUNS?.guide && !lessons.some((lesson) => lesson.slug === 'indefinite-pronouns')) {
    lessons.push(window.EDMUND_INDEFINITE_PRONOUNS.guide);
  }
  const dashboard = document.querySelector('[data-learning-portal-root] [data-view="dashboard"]');
  const library = dashboard?.querySelector('[data-grammar-library]');
  if (!dashboard || !library || !Array.isArray(lessons)) return;

  const otherViews = '[data-tense-curation], [data-grammar-practice], [data-articles-curation], [data-articles-practice], [data-advanced-articles-curation], [data-advanced-articles-practice], [data-new-grammar-curation], [data-new-grammar-practice]';
  const allViews = [];

  function addChalkColors(copy, ruleIndex) {
    const terms = /(\b(?:relative clause|relative word|who|whom|whose|which|that|where|when|why|zero relative|defining|non-defining|phrasal verb|particle|separable|inseparable|unless|not|if|said|told|asked|reported|reporting verb|reported speech|direct speech|indirect speech|whether|no one|someone|somebody|something|somewhere|anyone|anybody|anything|anywhere|nobody|nothing|nowhere|everyone|everybody|everything|everywhere|elsewhere)\b|關係子句|關係字|限定|補充|逗號|所屬|介詞|縮短|自由關係|整件事|動詞組合|短字|物件|可分開|不能分開|三字組合|字序|轉述|直接引語|間接引語|說話者|聽者|人稱|時態|時間|地點|除非|例外|否定|主句|條件|現在式|過去|未來|動詞|例句|改寫|範圍|短答|某個|任選|沒有|全部|人|事物|地方)/giu;
    const colors = ["purple", "yellow", "mint"];
    let colorIndex = ruleIndex;
    function visit(parent) {
      for (const node of [...parent.childNodes]) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          const fragment = document.createDocumentFragment();
          let cursor = 0;
          for (const match of text.matchAll(terms)) {
            fragment.append(document.createTextNode(text.slice(cursor, match.index)));
            const mark = document.createElement("span");
            mark.className = `grammar-eddy-dialogue__chalk grammar-eddy-dialogue__chalk--${colors[colorIndex++ % colors.length]}`;
            mark.textContent = match[0];
            fragment.append(mark);
            cursor = match.index + match[0].length;
          }
          if (cursor) {
            fragment.append(document.createTextNode(text.slice(cursor)));
            node.replaceWith(fragment);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE && !node.matches("code, strong, em, a, summary, button")) {
          visit(node);
        }
      }
    }
    visit(copy);
  }

  function addEddyDialogue(view) {
    const isIndefinite = view.dataset.newGrammarCuration !== "unless";
    // The Indefinite Pronouns cards use the assigned Grammar taeching rule 1–33 artwork.
    // The Unless guide retains its original 24-pose cycle.
    const poseCount = ["phrasal-verbs", "relative-clauses"].includes(view.dataset.newGrammarCuration) ? 32 : isIndefinite ? 33 : 24;
    const poses = Array.from({ length: poseCount }, (_, index) =>
      `${EDDY_MEDIA_ORIGIN}/grammar-eddy-dialogues/unless/eddy-${String(index + 1).padStart(2, "0")}.webp?v=${EDDY_POSE_VERSION}`);
    const summaryForUnlistedEnding = {
      "04": "-one 與 -body 大多是風格差異，不是嚴格的書面或口語分界。",
      "44": "elsewhere、someplace 等要按語域和英美用法選擇，不能當作拼錯的同一個字。",
      "68": "先辨人、事物、地方與範圍，再核對句型、否定、修飾位置和上下文。"
    };
    const cards = view.querySelectorAll(".grammar-new-topic:not(.grammar-new-appendix)");
    cards.forEach((card, index) => {
      const body = card.querySelector(".grammar-new-topic__content");
      const heading = card.querySelector(".grammar-articles-topic__head");
      const focus = card.querySelector(".grammar-tense-topic__focus");
      const note = body.lastElementChild?.tagName === "P" ? body.lastElementChild : null;
      const authoredNote = window.EDMUND_GRAMMAR_DIALOGUE_NOTES?.[view.dataset.newGrammarCuration]?.[index + 1];
      const figure = document.createElement("figure");
      figure.className = `grammar-eddy-dialogue${isIndefinite ? " grammar-eddy-dialogue--indefinite" : ""}`;
      figure.dataset.rule = String(index + 1).padStart(2, "0");

      const art = document.createElement("div");
      art.className = "grammar-eddy-dialogue__art";
      const lesson = document.createElement("div");
      lesson.className = "grammar-eddy-dialogue__lesson";
      if (heading) lesson.append(heading);
      if (focus) lesson.append(focus);
      const chalkCopy = document.createElement("div");
      chalkCopy.className = "grammar-eddy-dialogue__lesson-copy";
      for (const node of [...body.childNodes]) {
        if (node !== note) chalkCopy.append(node);
      }
      if (note) note.remove();
      lesson.append(chalkCopy);
      addChalkColors(lesson, index);
      art.append(lesson);
      const image = document.createElement("img");
      image.src = poses[index % poses.length];
      image.alt = "";
      image.width = 1671;
      image.height = 941;
      image.loading = "lazy";
      image.decoding = "async";
      art.append(image);

      const caption = document.createElement("figcaption");
      caption.className = "grammar-eddy-dialogue__text";
      const copy = document.createElement("span");
      copy.className = "grammar-eddy-dialogue__copy";
      if (authoredNote) {
        copy.textContent = authoredNote;
        if (note) chalkCopy.append(note);
      } else if (note) {
        copy.append(...note.childNodes);
        note.remove();
      } else {
        copy.textContent = isIndefinite
          ? (view.dataset.newGrammarCuration === "indefinite-pronouns" ? summaryForUnlistedEnding[figure.dataset.rule] : window.EDMUND_GRAMMAR_DIALOGUE_NOTES?.[view.dataset.newGrammarCuration]?.[index + 1]) || focus?.textContent || ""
          : "看看例句就清楚了！";
      }
      addChalkColors(copy, index);
      caption.append(copy);
      if (copy.textContent.length > 110) figure.classList.add("grammar-eddy-dialogue--long");
      if (chalkCopy.textContent.length > 260 || chalkCopy.querySelector("table") || chalkCopy.querySelectorAll("li").length > 3) {
        figure.classList.add("grammar-eddy-dialogue--dense");
      }
      figure.append(art, caption);
      card.replaceChildren(figure);
    });
  }

  // The pose artwork includes an old dialogue panel. Keep only the portrait above the real caption.
  function placeEddy(art, image, caption) {
    const board = art.getBoundingClientRect();
    const box = caption.getBoundingClientRect();
    const portraitHeight = image.getBoundingClientRect().height;
    image.style.bottom = `${Math.ceil(board.bottom - box.top - 10 - portraitHeight * .31)}px`;
    const placed = image.getBoundingClientRect();
    return { left: placed.left + placed.width * .34, right: placed.right,
      top: placed.top, bottom: placed.top + placed.height * .69 };
  }

  function lessonTextRects(lesson) {
    const rects = [];
    const walker = document.createTreeWalker(lesson, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent.trim()) continue;
      const parent = walker.currentNode.parentElement;
      const closed = parent.closest('details:not([open])');
      if (closed && !parent.closest('summary')) continue;
      const range = document.createRange();
      range.selectNodeContents(walker.currentNode);
      const scroll = parent.closest(".grammar-new-table-wrap");
      const bounds = scroll?.getBoundingClientRect();
      for (const rect of range.getClientRects()) {
        if (!rect.width || !rect.height) continue;
        const left = bounds ? Math.max(rect.left, bounds.left) : rect.left;
        const right = bounds ? Math.min(rect.right, bounds.right) : rect.right;
        if (right > left) rects.push({left, right, top:rect.top, bottom:rect.bottom});
      }
    }
    return rects;
  }

  function layoutIndefiniteEddy(view) {
    if (view.hidden || view.dataset.newGrammarCuration === "unless") return;
    const narrow = window.matchMedia("(max-width: 840px)").matches;
    view.querySelectorAll(".grammar-eddy-dialogue--indefinite").forEach((figure) => {
      const art = figure.querySelector(".grammar-eddy-dialogue__art");
      const lesson = art.querySelector(".grammar-eddy-dialogue__lesson");
      const caption = figure.querySelector(".grammar-eddy-dialogue__text");
      const image = figure.querySelector("img");
      figure.classList.remove("grammar-eddy-dialogue--eddy-aside");
      if (image.parentElement !== art) art.append(image);
      art.style.height = "";
      lesson.style.bottom = "";
      image.style.bottom = "";
      if (view.dataset.eddyModule) {
        // New guides keep the complete note visible and grow with real content,
        // including expanded explanations; no fixed cap may hide a teaching line.
        lesson.style.bottom = "auto";
        const fit = (reservePortrait) => {
          const captionHeight = caption.getBoundingClientRect().height;
          const portraitReserve = reservePortrait ? image.getBoundingClientRect().height * .69 + 24 : 0;
          const required = (lesson.scrollHeight + captionHeight + portraitReserve + 45) / .90;
          art.style.height = `${Math.ceil(Math.max(art.getBoundingClientRect().height, required))}px`;
          placeEddy(art, image, caption);
        };
        fit(narrow);
        if (!narrow) {
          const portrait = placeEddy(art, image, caption);
          const collision = lessonTextRects(lesson).some((rect) =>
            rect.left < portrait.right && rect.right > portrait.left &&
            rect.top < portrait.bottom && rect.bottom > portrait.top);
          if (collision) {
            figure.classList.add("grammar-eddy-dialogue--eddy-aside");
            figure.insertBefore(image, caption);
            fit(false);
          }
        }
        return;
      }
      let portrait = placeEddy(art, image, caption);
      const textRects = lessonTextRects(lesson);
      if (narrow) {
        const textBottom = Math.max(lesson.getBoundingClientRect().top, ...textRects.map((rect) => rect.bottom));
        const overlap = textBottom + 16 - portrait.top;
        if (overlap > 0) {
          const height = art.getBoundingClientRect().height;
          art.style.height = `${Math.min(900, Math.ceil(height + overlap + 24))}px`;
          portrait = placeEddy(art, image, caption);
        }
        lesson.style.bottom = `${Math.ceil(art.getBoundingClientRect().bottom - portrait.top + 12)}px`;
        return;
      }
      const collision = textRects.some((rect) => rect.left < portrait.right && rect.right > portrait.left
        && rect.top < portrait.bottom && rect.bottom > portrait.top);
      if (collision) {
        figure.classList.add("grammar-eddy-dialogue--eddy-aside");
        figure.insertBefore(image, caption);
        placeEddy(art, image, caption);
        lesson.style.bottom = `${Math.ceil(art.getBoundingClientRect().bottom - caption.getBoundingClientRect().top + 12)}px`;
        const extraText = lesson.scrollHeight - lesson.clientHeight;
        if (extraText > 4) {
          art.style.height = `${Math.min(950, Math.ceil(art.getBoundingClientRect().height + (extraText + 20) / .95))}px`;
          placeEddy(art, image, caption);
          lesson.style.bottom = `${Math.ceil(art.getBoundingClientRect().bottom - caption.getBoundingClientRect().top + 12)}px`;
        }
      } else if (lesson.scrollHeight > lesson.clientHeight + 4) {
        lesson.style.bottom = `${Math.ceil(art.getBoundingClientRect().bottom - portrait.top + 12)}px`;
      }
    });
  }

  const pendingEddyLayouts = new WeakSet();
  function scheduleIndefiniteLayout(view) {
    if (view.dataset.newGrammarCuration === "unless" || pendingEddyLayouts.has(view)) return;
    pendingEddyLayouts.add(view);
    requestAnimationFrame(() => {
      pendingEddyLayouts.delete(view);
      layoutIndefiniteEddy(view);
    });
  }

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
      const heading = node.tagName === "H3" && (node.dataset.conceptNumber
        ? [null, "IP", node.dataset.conceptNumber, node.textContent]
        : node.textContent.match(/^(S|M|U|IP)(\d{2})｜(.+)$/));
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
        if (node.tagName === "P" && body.childElementCount === 0 && !card.querySelector(".grammar-tense-topic__focus")) {
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
    if (view.dataset.newGrammarCuration === "relative-clauses") {
      const reference = document.createElement("details");
      reference.className = "grammar-relative-reference";
      const summary = document.createElement("summary");
      summary.innerHTML = `<span class="grammar-relative-reference__icon" aria-hidden="true">+</span><span class="grammar-relative-reference__label"><strong><span class="grammar-relative-reference__closed">展開完整學習指南與規則索引</span><span class="grammar-relative-reference__open">收起完整學習指南與規則索引</span></strong><small>課程簡介、PART I 系統總覽及 PART II 全部規則索引</small></span>`;
      const referenceBody = document.createElement("div");
      referenceBody.className = "grammar-relative-reference__body";
      referenceBody.append(intro);
      while (stream.firstElementChild && stream.firstElementChild.id !== "relative-clauses-rules-1") {
        referenceBody.append(stream.firstElementChild);
      }
      reference.append(summary, referenceBody);
      source.replaceChildren(reference, stream);
      reference.addEventListener("toggle", () => scheduleIndefiniteLayout(view));
      view.querySelectorAll('.grammar-new-chapters a[href="#relative-clauses-overview-1"], .grammar-new-chapters a[href="#relative-clauses-overview-2"]').forEach((link) => {
        link.addEventListener("click", (event) => {
          event.preventDefault();
          reference.open = true;
          requestAnimationFrame(() => view.querySelector(link.getAttribute("href"))?.scrollIntoView({ behavior: "smooth", block: "start" }));
        });
      });
    } else {
      source.replaceChildren(intro, stream);
    }
    addEddyDialogue(view);
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
    scheduleIndefiniteLayout(view);
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
    card.innerHTML = `<div class="grammar-lesson-card__copy"><p class="eyebrow">MODULE ${String(index + 4).padStart(2, "0")} · CURATION + ${lesson.practiceCount || 150} QUESTIONS</p><h3>${lesson.english} <span lang="zh-Hant">${lesson.chinese}</span></h3><p>${lesson.count} 個編號教學重點，附英文例句、繁體中文解說及用法對照；再練習 ${lesson.practiceCount || 150} 題。</p></div><div class="grammar-lesson-card__stats"><button class="grammar-button" type="button">閱讀導讀</button></div>`;
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

  window.EDMUND_GRAMMAR_EDDY = { add: addEddyDialogue, schedule: scheduleIndefiniteLayout };
  const requestedParams = new URLSearchParams(window.location.search);
  const requested = requestedParams.get("lesson");
  const initial = lessons.findIndex((lesson) => lesson.slug === requested);
  if (initial >= 0 && requestedParams.get("view") !== "practice") open(allViews[initial], lessons[initial].slug);
  window.addEventListener("resize", () => allViews.forEach(scheduleIndefiniteLayout));
  document.fonts?.ready.then(() => allViews.forEach(scheduleIndefiniteLayout));
})();
