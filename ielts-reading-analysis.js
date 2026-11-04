import {
  createArticleRepository,
  questionNumberLabel,
  questionNumbers,
} from "./ielts-reading-analysis-loader.mjs?v=20260827-locks1";

(function () {
  "use strict";

  const index = window.EDMUND_IELTS_READING_ANALYSIS_INDEX;
  const content = window.EDMUND_IELTS_READING_ANALYSIS_CONTENT || { articles: {} };
  const availability = window.EDMUND_IELTS_READING_ANALYSIS_AVAILABILITY || { articles: {} };

  if (!index) {
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
    sourceNotes: document.querySelector("[data-source-notes]"),
    sourceNoteList: document.querySelector("[data-source-note-list]"),
    questionCount: document.querySelector("[data-question-count]"),
    articleStatusView: document.querySelector('[data-view="article-status"]'),
    articleStatusCard: document.querySelector("[data-article-status-card]"),
    articleStatusTitle: document.querySelector("[data-article-status-title]"),
    articleStatusMessage: document.querySelector("[data-article-status-message]"),
    articleStatusRetry: document.querySelector('[data-action="retry-article"]'),
  };

  const state = {
    view: "chooser",
    passage: 1,
    article: null,
    query: "",
  };
  let routeRevision = 0;

  const articleRepository = createArticleRepository({
    availabilityManifest: availability,
    bundledArticles: content.articles,
    fetchImpl: window.fetch?.bind(window),
  });
  const catalogueRecordsById = new Map(
    Object.values(index.passages).flat().map((record) => [record.id, record]),
  );

  function normalise(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’‘`]/g, "'")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
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

  function availabilityForRecord(record) {
    return articleRepository.availabilityForCatalogueId(record.id);
  }

  function showView(name) {
    state.view = name;
    elements.views.forEach((view) => {
      view.hidden = view.dataset.view !== name;
    });
    const isAnalysis = name === "analysis";
    document.body.classList.toggle("has-analysis", isAnalysis);
    elements.questionJumps.hidden = !isAnalysis;
    if (name !== "article-status") elements.articleStatusView.setAttribute("aria-busy", "false");
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
    void applyRoute();
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
    const articleAvailability = availabilityForRecord(record);
    const locked = articleAvailability?.locked;
    const card = make(
      articleAvailability ? "button" : "article",
      `title-card${locked ? " locked" : articleAvailability ? " available" : ""}`,
    );
    if (articleAvailability) card.type = "button";
    if (locked) {
      card.disabled = true;
      card.setAttribute("aria-disabled", "true");
      card.setAttribute("aria-label", `${record.title}：暫停開放，待管理員修訂`);
    }

    const copy = make("span", "title-card-copy");
    copy.append(
      make("strong", "", record.title),
      make("small", "", locked ? "暫停開放 · 待管理員修訂" : articleAvailability ? "完整答案及逐題解卷分析" : "文章名稱已收錄"),
    );
    card.append(copy);

    if (articleAvailability && !locked) {
      card.append(make("span", "title-card-arrow", "→"));
      card.setAttribute("aria-label", `開啟 ${record.title} 解卷分析`);
      card.addEventListener("click", () => navigate({ article: articleAvailability.id }));
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
        const questionNumber = (article.questionNumberStart || 1) + answerIndex;
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
      const paragraphLabel = paragraph.label || `Paragraph ${paragraph.number}`;
      const badgeLabel = paragraph.badge || (paragraph.label ? paragraph.label : `P${paragraph.number}`);
      const card = make("li", "overview-card");
      const badge = make("span", "overview-number", badgeLabel);
      badge.setAttribute("aria-hidden", "true");
      const copy = make("div", "overview-copy");
      copy.append(
        make("h3", "", paragraphLabel),
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
    const numbers = questionNumbers(question);
    const numberLabel = questionNumberLabel(question);
    const details = make("details", "question-card");
    details.id = `q${numbers[0]}`;
    details.dataset.questionNumbers = numbers.join(" ");
    details.open = indexInArticle === 0;

    const summary = document.createElement("summary");
    const heading = make("h2", "question-heading");
    heading.append(
      make("strong", "", `第 ${numberLabel} 題`),
      make("small", "", question.type),
    );
    summary.append(
      make("span", "question-number", `Q${numberLabel}`),
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
    const target = elements.questionList.querySelector(
      `[data-question-numbers~="${number}"]`,
    );
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
    const links = article.questions.flatMap((question) =>
      questionNumbers(question).map((number) => {
        const link = make("a", "", `Q${number}`);
        link.href = `#q${number}`;
        link.dataset.questionTarget = String(number);
        return link;
      }),
    );
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
    const sourceNotes = Array.isArray(article.sourceNotes)
      ? article.sourceNotes.filter((note) => typeof note === "string" && note.trim())
      : [];
    elements.sourceNoteList.replaceChildren(
      ...sourceNotes.map((note) => make("li", "", note)),
    );
    elements.sourceNotes.hidden = sourceNotes.length === 0;
    elements.questionCount.textContent = String(article.questionCount);
    renderAnswerTable(article);
    renderArticleOverview(article);
    elements.questionList.replaceChildren(
      ...article.questions.map(renderQuestion),
    );
    renderQuestionJumps(article);
  }

  function articleTitleForAvailability(articleAvailability) {
    return catalogueRecordsById.get(articleAvailability?.catalogueId)?.title
      || articleAvailability?.id
      || "這篇文章";
  }

  function renderArticleStatus(articleAvailability, status) {
    const isLocked = status === "locked";
    const isError = status !== "loading";
    const canRetry = status === "error";
    const title = articleTitleForAvailability(articleAvailability);
    elements.articleStatusCard.classList.toggle("is-error", isError);
    elements.articleStatusCard.classList.toggle("is-locked", isLocked);
    elements.articleStatusView.setAttribute("aria-busy", isError ? "false" : "true");
    elements.articleStatusTitle.textContent = isLocked
      ? `「${title}」暫停開放`
      : status === "not-found"
      ? "找不到這篇解卷分析"
      : isError
      ? `未能載入「${title}」`
      : `正在載入「${title}」`;
    elements.articleStatusMessage.textContent = isLocked
      ? "這篇分析正等待管理員補回題圖及修訂內容，完成審核後才會重新開放。"
      : status === "not-found"
      ? "這個文章連結並不存在，請返回文章目錄重新選擇。"
      : isError
      ? "請檢查網絡連線後重新載入，或先返回文章目錄。"
      : "只會在您開啟文章時下載這份分析資料，請稍候。";
    elements.articleStatusRetry.hidden = !canRetry;
  }

  function finishArticleRoute(article) {
    renderArticle(article);
    showView("analysis");
    document.title = `${article.title} 解卷分析 | EdmundEducation`;
    const anchoredQuestion = window.location.hash.match(/^#q(\d{1,2})$/);
    if (anchoredQuestion) {
      window.requestAnimationFrame(() =>
        openAndScrollToQuestion(Number(anchoredQuestion[1])),
      );
    }
  }

  async function applyRoute() {
    const revision = ++routeRevision;
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("article");
    const requestedPassage = Number(params.get("passage"));
    const requestedView = params.get("view");
    const requestedQuestionType = String(params.get("type") || "").trim();
    const requestedQuestionTypeQuery = String(params.get("q") || "").trim();

    if (requestedView === "question-types") {
      const destination = new URL("reading-comprehension.html", window.location.href);
      destination.searchParams.set("view", "question-types");
      if (requestedQuestionType) destination.searchParams.set("type", requestedQuestionType);
      if (requestedQuestionTypeQuery) destination.searchParams.set("q", requestedQuestionTypeQuery);
      window.location.replace(destination.href);
      return;
    }

    if (articleId) {
      const articleAvailability = articleRepository.availabilityForId(articleId);
      if (!articleAvailability) {
        state.article = null;
        renderArticleStatus({ id: articleId }, "not-found");
        showView("article-status");
        document.title = "找不到解卷分析 | EdmundEducation";
        return;
      }

      state.article = null;
      state.passage = articleAvailability.passage;
      if (articleAvailability.locked) {
        renderArticleStatus(articleAvailability, "locked");
        showView("article-status");
        document.title = "解卷分析暫停開放 | EdmundEducation";
        return;
      }
      const loadedArticle = articleRepository.getLoaded(articleId);
      if (loadedArticle) {
        finishArticleRoute(loadedArticle);
        return;
      }

      renderArticleStatus(articleAvailability, "loading");
      showView("article-status");
      document.title = `正在載入 ${articleTitleForAvailability(articleAvailability)} | EdmundEducation`;

      try {
        const article = await articleRepository.load(articleId);
        const currentArticleId = new URLSearchParams(window.location.search).get("article");
        if (revision !== routeRevision || currentArticleId !== articleId) return;
        finishArticleRoute(article);
      } catch (error) {
        const currentArticleId = new URLSearchParams(window.location.search).get("article");
        if (revision !== routeRevision || currentArticleId !== articleId) return;
        console.error(`IELTS Reading article ${articleId} could not be loaded.`, error);
        renderArticleStatus(articleAvailability, "error");
        showView("article-status");
        document.title = `未能載入 ${articleTitleForAvailability(articleAvailability)} | EdmundEducation`;
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
      if (state.view === "analysis" || state.view === "article-status") {
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

    document.querySelector('[data-action="status-catalogue"]').addEventListener("click", () => {
      navigate({ passage: state.passage || 1 });
    });

    elements.articleStatusRetry.addEventListener("click", () => {
      void applyRoute();
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

    window.addEventListener("popstate", () => void applyRoute());
  }

  window.EDMUND_IELTS_READING_ANALYSIS_TEST = Object.freeze({
    normalise,
    sortedRecords,
  });

  renderPassageNavigation();
  bindControls();
  void applyRoute();
})();
