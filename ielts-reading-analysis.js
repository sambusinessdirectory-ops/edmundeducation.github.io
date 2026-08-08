(function () {
  "use strict";

  const index = window.EDMUND_IELTS_READING_ANALYSIS_INDEX;
  const content = window.EDMUND_IELTS_READING_ANALYSIS_CONTENT;

  if (!index || !content) {
    console.error("IELTS Reading analysis data could not be loaded.");
    return;
  }

  const collator = new Intl.Collator("en", {
    numeric: true,
    sensitivity: "base",
  });

  const elements = {
    main: document.querySelector("#main-content"),
    views: Array.from(document.querySelectorAll("[data-view]")),
    passagePicker: document.querySelector("[data-passage-picker]"),
    passageTabs: document.querySelector("[data-passage-tabs]"),
    catalogueTitle: document.querySelector("[data-catalogue-title]"),
    search: document.querySelector("[data-search]"),
    resultCount: document.querySelector("[data-result-count]"),
    titleList: document.querySelector("[data-title-list]"),
    emptyState: document.querySelector("[data-empty-state]"),
    questionJumps: document.querySelector("[data-question-jumps]"),
    answerTable: document.querySelector("[data-answer-table]"),
    articleOverview: document.querySelector("[data-article-overview]"),
    overviewTitle: document.querySelector("[data-overview-title]"),
    overviewIntro: document.querySelector("[data-overview-intro]"),
    overviewList: document.querySelector("[data-overview-list]"),
    questionList: document.querySelector("[data-question-list]"),
    analysisEyebrow: document.querySelector("[data-analysis-eyebrow]"),
    analysisTitle: document.querySelector("[data-analysis-title]"),
    analysisDescription: document.querySelector("[data-analysis-description]"),
    questionCount: document.querySelector("[data-question-count]"),
  };

  const state = {
    view: "chooser",
    passage: 1,
    article: null,
    query: "",
  };

  const articlesByCatalogueId = new Map(
    Object.values(content.articles).map((article) => [article.catalogueId, article]),
  );

  function normalise(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’‘`]/g, "'")
      .replace(/[^a-z0-9]+/gi, " ")
      .trim()
      .toLowerCase();
  }

  function make(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function sortedRecords(passage) {
    return [...(index.passages[String(passage)] || [])].sort((left, right) =>
      collator.compare(left.title, right.title),
    );
  }

  function articleForRecord(record) {
    return articlesByCatalogueId.get(record.id);
  }

  function showView(name) {
    state.view = name;
    elements.views.forEach((view) => {
      view.hidden = view.dataset.view !== name;
    });
    const isAnalysis = name === "analysis";
    document.body.classList.toggle("has-analysis", isAnalysis);
    elements.questionJumps.hidden = !isAnalysis;
  }

  function routeUrl(route) {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    if (route.article) {
      url.searchParams.set("article", route.article);
    } else if (route.passage) {
      url.searchParams.set("passage", String(route.passage));
    }
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function navigate(route, replace) {
    const url = routeUrl(route);
    window.history[replace ? "replaceState" : "pushState"]({}, "", url);
    applyRoute();
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function renderPassageButton(passage, location) {
    const records = index.passages[String(passage)] || [];
    const button = make("button", location === "picker" ? "passage-card" : "");
    button.type = "button";
    button.dataset.passage = String(passage);
    button.setAttribute("aria-label", `查看 Passage ${passage} 文章名稱`);

    if (location === "picker") {
      button.append(
        make("small", "", "IELTS READING"),
        make("strong", "", `Passage ${passage}`),
        make("span", "", `${records.length} 篇文章名稱`),
      );
    } else {
      button.textContent = `Passage ${passage}`;
      button.setAttribute("aria-current", state.passage === passage ? "true" : "false");
    }

    button.addEventListener("click", () => navigate({ passage }));
    return button;
  }

  function renderPassageNavigation() {
    elements.passagePicker.replaceChildren(
      ...[1, 2, 3].map((passage) => renderPassageButton(passage, "picker")),
    );
  }

  function renderPassageTabs() {
    elements.passageTabs.replaceChildren(
      ...[1, 2, 3].map((passage) => renderPassageButton(passage, "tabs")),
    );
  }

  function renderTitleCard(record) {
    const article = articleForRecord(record);
    const card = make(article ? "button" : "article", `title-card${article ? " available" : ""}`);
    if (article) card.type = "button";

    const copy = make("span", "title-card-copy");
    copy.append(
      make("strong", "", record.title),
      make("small", "", article ? "完整答案及逐題解卷分析" : "文章名稱已收錄"),
    );
    card.append(copy);

    if (article) {
      card.append(make("span", "title-card-arrow", "→"));
      card.setAttribute("aria-label", `開啟 ${record.title} 解卷分析`);
      card.addEventListener("click", () => navigate({ article: article.id }));
    }

    return card;
  }

  function renderCatalogue() {
    const records = sortedRecords(state.passage);
    const needle = normalise(state.query);
    const matches = needle
      ? records.filter((record) => normalise(record.title).includes(needle))
      : records;

    elements.catalogueTitle.textContent = `Passage ${state.passage}`;
    elements.search.value = state.query;
    elements.resultCount.textContent = state.query
      ? `找到 ${matches.length} 個相符名稱（共 ${records.length} 個）`
      : `共 ${records.length} 個文章名稱，按英文字母排列`;
    elements.titleList.replaceChildren(...matches.map(renderTitleCard));
    elements.emptyState.hidden = matches.length !== 0;
    renderPassageTabs();
  }

  function renderAnswerTable(article) {
    const table = make("table", "answer-table");
    table.setAttribute("aria-label", `${article.title} 答案表`);
    const body = document.createElement("tbody");

    const columnLength = Math.ceil(article.answerKey.length / 2);
    for (let row = 0; row < columnLength; row += 1) {
      const tr = document.createElement("tr");
      [row, row + columnLength].forEach((answerIndex) => {
        if (answerIndex >= article.answerKey.length) {
          const emptyHeading = make("th", "answer-cell-empty", "");
          const emptyAnswer = make("td", "answer-cell-empty", "");
          emptyHeading.setAttribute("aria-hidden", "true");
          emptyAnswer.setAttribute("aria-hidden", "true");
          tr.append(emptyHeading, emptyAnswer);
          return;
        }
        const questionNumber = answerIndex + 1;
        const th = make("th", "", `Q${questionNumber}`);
        th.scope = "row";
        const td = document.createElement("td");
        const link = make("a", "", article.answerKey[answerIndex]);
        link.href = `#q${questionNumber}`;
        link.dataset.questionTarget = String(questionNumber);
        link.setAttribute("aria-label", `前往第 ${questionNumber} 題分析`);
        td.append(link);
        tr.append(th, td);
      });
      body.append(tr);
    }

    table.append(body);
    elements.answerTable.replaceChildren(table);
  }

  function renderArticleOverview(article) {
    const overview = article.paragraphOverview;
    if (!overview || !overview.paragraphs?.length) {
      elements.articleOverview.hidden = true;
      elements.overviewList.replaceChildren();
      return;
    }

    elements.overviewTitle.textContent = overview.title || "全篇段落速覽";
    elements.overviewIntro.textContent = overview.intro || "先掌握每段功能，再開始逐題分析。";
    const cards = overview.paragraphs.map((paragraph) => {
      const card = make("li", "overview-card");
      const badge = make("span", "overview-number", `P${paragraph.number}`);
      badge.setAttribute("aria-hidden", "true");
      const copy = make("div", "overview-copy");
      copy.append(
        make("h3", "", `Paragraph ${paragraph.number}`),
        make("p", "", paragraph.summary),
      );
      card.append(badge, copy);
      return card;
    });
    elements.overviewList.replaceChildren(...cards);
    elements.articleOverview.hidden = false;
  }

  function renderBlock(block) {
    switch (block.kind) {
      case "label":
        return make("span", "analysis-label", block.text);
      case "quote": {
        const quote = make("blockquote", "", block.text);
        const latinCharacters = (block.text.match(/[A-Za-z]/g) || []).length;
        const chineseCharacters = (block.text.match(/[\u3400-\u9fff]/g) || []).length;
        if (latinCharacters > chineseCharacters * 2) quote.lang = "en";
        return quote;
      }
      case "comparison": {
        const comparison = make("div", "analysis-comparison");
        const from = make("span", "comparison-from", block.from);
        const arrow = make("span", "comparison-arrow", "→");
        arrow.setAttribute("aria-hidden", "true");
        const to = make("span", "comparison-to", block.to);
        comparison.append(from, arrow, to);
        return comparison;
      }
      case "bullet":
        return make("div", "analysis-bullet", block.text);
      default:
        return make("p", "", block.text);
    }
  }

  function renderQuestion(question, indexInArticle) {
    const details = make("details", "question-card");
    details.id = `q${question.number}`;
    details.open = indexInArticle === 0;

    const summary = document.createElement("summary");
    const heading = make("h2", "question-heading");
    heading.append(
      make("strong", "", `第 ${question.number} 題`),
      make("small", "", question.type),
    );
    summary.append(
      make("span", "question-number", `Q${question.number}`),
      heading,
      make("span", "answer-pill", `答案：${question.answer}`),
    );

    const body = make("div", "question-body");
    const source = make("div", "question-source");
    const prompt = make("blockquote", "", question.prompt);
    prompt.lang = "en";
    source.append(
      make("span", "source-label", "QUESTION"),
      prompt,
      make("p", "question-translation", question.translation),
    );

    const steps = make("ol", "analysis-steps");
    question.sections.forEach((section, sectionIndex) => {
      const sectionNode = make("li", `analysis-step analysis-step--${section.id}`);
      const stepHeading = make("div", "analysis-step-heading");
      const stepNumber = make("span", "analysis-step-number", String(sectionIndex + 1));
      stepNumber.setAttribute("aria-hidden", "true");
      stepHeading.append(stepNumber, make("h3", "", section.title));
      sectionNode.append(stepHeading);
      section.blocks.forEach((block) => sectionNode.append(renderBlock(block)));
      steps.append(sectionNode);
    });
    body.append(source, steps);
    details.append(summary, body);
    return details;
  }

  function openAndScrollToQuestion(number) {
    const target = document.querySelector(`#q${number}`);
    if (!target) return;
    target.open = true;
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function renderQuestionJumps(article) {
    const answerLink = make("a", "answer-jump", "答案表");
    answerLink.href = "#answer-key";
    const overviewLink = article.paragraphOverview?.paragraphs?.length
      ? make("a", "overview-jump", "段落速覽")
      : null;
    if (overviewLink) overviewLink.href = "#paragraph-overview";
    const links = article.questions.map((question) => {
      const link = make("a", "", `Q${question.number}`);
      link.href = `#q${question.number}`;
      link.dataset.questionTarget = String(question.number);
      return link;
    });
    elements.questionJumps.replaceChildren(
      answerLink,
      ...(overviewLink ? [overviewLink] : []),
      ...links,
    );
  }

  function renderArticle(article) {
    state.article = article;
    state.passage = article.passage;
    elements.analysisEyebrow.textContent = article.eyebrow;
    elements.analysisTitle.textContent = article.title;
    elements.analysisDescription.textContent = article.description;
    elements.questionCount.textContent = String(article.questionCount);
    renderAnswerTable(article);
    renderArticleOverview(article);
    elements.questionList.replaceChildren(
      ...article.questions.map(renderQuestion),
    );
    renderQuestionJumps(article);
  }

  function applyRoute() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("article");
    const article = articleId ? content.articles[articleId] : null;
    const requestedPassage = Number(params.get("passage"));

    if (article) {
      renderArticle(article);
      showView("analysis");
      document.title = `${article.title} 解卷分析 | EdmundEducation`;
      const anchoredQuestion = window.location.hash.match(/^#q(\d{1,2})$/);
      if (anchoredQuestion) {
        window.requestAnimationFrame(() =>
          openAndScrollToQuestion(Number(anchoredQuestion[1])),
        );
      }
      return;
    }

    if ([1, 2, 3].includes(requestedPassage)) {
      state.passage = requestedPassage;
      state.article = null;
      state.query = "";
      renderCatalogue();
      showView("catalogue");
      document.title = `IELTS Reading Passage ${requestedPassage} | EdmundEducation`;
      return;
    }

    state.article = null;
    state.query = "";
    showView("chooser");
    document.title = "IELTS 閱讀理解 - 解卷分析 | EdmundEducation";
  }

  function bindControls() {
    elements.search.addEventListener("input", (event) => {
      state.query = event.target.value;
      renderCatalogue();
    });

    document.querySelector('[data-action="clear-search"]').addEventListener("click", () => {
      state.query = "";
      renderCatalogue();
      elements.search.focus();
    });

    document.querySelector('[data-action="previous"]').addEventListener("click", () => {
      if (state.view === "analysis") {
        navigate({ passage: state.passage });
      } else if (state.view === "catalogue") {
        navigate({});
      } else {
        window.location.href = "resources.html";
      }
    });

    document.querySelector('[data-action="catalogue"]').addEventListener("click", () => {
      navigate({ passage: state.passage || 1 });
    });

    document.querySelector('[data-action="expand-all"]').addEventListener("click", () => {
      elements.questionList.querySelectorAll("details").forEach((details) => {
        details.open = true;
      });
    });

    document.querySelector('[data-action="collapse-all"]').addEventListener("click", () => {
      elements.questionList.querySelectorAll("details").forEach((details) => {
        details.open = false;
      });
    });

    document.addEventListener("click", (event) => {
      const link = event.target.closest("[data-question-target]");
      if (!link) return;
      event.preventDefault();
      openAndScrollToQuestion(Number(link.dataset.questionTarget));
    });

    window.addEventListener("popstate", applyRoute);
  }

  window.EDMUND_IELTS_READING_ANALYSIS_TEST = Object.freeze({
    normalise,
    sortedRecords,
  });

  renderPassageNavigation();
  bindControls();
  applyRoute();
})();
