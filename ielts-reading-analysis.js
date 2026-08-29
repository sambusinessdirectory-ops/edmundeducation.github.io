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
  const questionTypeIndex = window.EDMUND_IELTS_READING_QUESTION_TYPES || { types: [], articles: [] };

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
    questionTypeSearch: document.querySelector("[data-question-type-search]"),
    questionTypeResultCount: document.querySelector("[data-question-type-result-count]"),
    questionTypeChips: document.querySelector("[data-question-type-chips]"),
    questionTypeSelection: document.querySelector("[data-question-type-selection]"),
    questionTypeResults: document.querySelector("[data-question-type-results]"),
    questionTypeEmpty: document.querySelector("[data-question-type-empty]"),
  };

  const state = {
    view: "chooser",
    passage: 1,
    article: null,
    query: "",
    questionType: "",
    questionTypeQuery: "",
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

  function listFrom(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === "string" && value.trim()) return [value];
    if (value && typeof value === "object") return Object.values(value);
    return [];
  }

  const questionTypes = listFrom(questionTypeIndex.types || questionTypeIndex.taxonomy)
    .map((type) => ({
      key: String(type?.key || type?.id || "").trim(),
      en: String(type?.en || type?.nameEn || type?.titleEn || type?.title || "").trim(),
      zh: String(type?.zh || type?.nameZh || type?.titleZh || type?.translation || "").trim(),
      aliases: listFrom(type?.aliases).map((alias) => String(alias || "").trim()).filter(Boolean),
    }))
    .filter((type) => type.key && type.en && type.zh);
  const questionTypesByKey = new Map(questionTypes.map((type) => [type.key, type]));
  const questionTypeUmbrellas = listFrom(questionTypeIndex.umbrellaAliases)
    .map((umbrella) => ({
      key: String(umbrella?.key || umbrella?.id || "").trim(),
      en: String(umbrella?.en || umbrella?.nameEn || "").trim(),
      zh: String(umbrella?.zh || umbrella?.nameZh || "").trim(),
      aliases: listFrom(umbrella?.aliases).map((alias) => String(alias || "").trim()).filter(Boolean),
      typeKeys: listFrom(umbrella?.typeKeys || umbrella?.typeIds)
        .map((key) => String(key || "").trim()),
    }))
    .filter((umbrella) => umbrella.key && umbrella.typeKeys.length);
  const questionTypeArticles = listFrom(
    Array.isArray(questionTypeIndex.articles)
      ? questionTypeIndex.articles
      : questionTypeIndex.articlesById || questionTypeIndex.articles,
  ).filter((article) => article && typeof article === "object");

  function questionTypeKeysForArticle(article) {
    let raw = article?.types || article?.questionTypes || article?.typeKeys || [];
    if (!listFrom(raw).length && article?.questionsByType && typeof article.questionsByType === "object") {
      raw = Object.keys(article.questionsByType);
    }
    return listFrom(raw)
      .map((entry) => String(entry?.key || entry?.id || entry || "").trim())
      .filter((key, position, keys) => questionTypesByKey.has(key) && keys.indexOf(key) === position);
  }

  function questionTypeSearchText(type) {
    return normalise([type.key, type.en, type.zh, ...type.aliases].join(" "));
  }

  function matchingQuestionTypes(query) {
    const needle = normalise(query);
    if (!needle) return questionTypes;
    const compactNeedle = needle.replace(/\s+/g, "");
    const matchingKeys = new Set(questionTypes.filter((type) => {
      const haystack = questionTypeSearchText(type);
      const compactHaystack = haystack.replace(/\s+/g, "");
      return haystack.includes(needle)
        || needle.includes(haystack)
        || compactHaystack.includes(compactNeedle)
        || compactNeedle.includes(compactHaystack);
    }).map((type) => type.key));
    questionTypeUmbrellas.forEach((umbrella) => {
      const haystack = normalise(
        [umbrella.key, umbrella.en, umbrella.zh, ...umbrella.aliases].join(" "),
      );
      const compactHaystack = haystack.replace(/\s+/g, "");
      if (
        haystack.includes(needle)
        || needle.includes(haystack)
        || compactHaystack.includes(compactNeedle)
        || compactNeedle.includes(compactHaystack)
      ) {
        umbrella.typeKeys.forEach((key) => matchingKeys.add(key));
      }
    });
    return questionTypes.filter((type) => matchingKeys.has(type.key));
  }

  function numericQuestions(value) {
    if (Array.isArray(value)) {
      return value.flatMap(numericQuestions).filter((number, position, numbers) => numbers.indexOf(number) === position).sort((a, b) => a - b);
    }
    if (Number.isInteger(value)) return [value];
    const text = String(value || "");
    const numbers = [];
    for (const match of text.matchAll(/(\d{1,2})(?:\s*[–—-]\s*(\d{1,2}))?/g)) {
      const from = Number(match[1]);
      const to = Number(match[2] || match[1]);
      if (from < 1 || to < from || to > 99) continue;
      for (let number = from; number <= to; number += 1) numbers.push(number);
    }
    return numbers.filter((number, position) => numbers.indexOf(number) === position).sort((a, b) => a - b);
  }

  function compactQuestionRanges(value) {
    const numbers = numericQuestions(value);
    if (!numbers.length) return "";
    const ranges = [];
    let start = numbers[0];
    let end = start;
    for (const number of numbers.slice(1)) {
      if (number === end + 1) {
        end = number;
      } else {
        ranges.push(start === end ? String(start) : `${start}–${end}`);
        start = number;
        end = number;
      }
    }
    ranges.push(start === end ? String(start) : `${start}–${end}`);
    return ranges.join("、");
  }

  function articleQuestionsForType(article, typeKey) {
    const articleType = listFrom(article?.types).find(
      (entry) => String(entry?.key || entry?.id || "").trim() === typeKey,
    );
    const source = article?.questionsByType?.[typeKey]
      ?? article?.questionRanges?.[typeKey]
      ?? article?.rangesByType?.[typeKey]
      ?? articleType?.questionNumbers
      ?? articleType?.ranges;
    return compactQuestionRanges(source);
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
    if (route.view === "question-types") {
      url.searchParams.set("view", "question-types");
      if (route.type) url.searchParams.set("type", route.type);
      if (route.q) url.searchParams.set("q", route.q);
    } else if (route.article) {
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
    const questionTypesCard = make("button", "passage-card question-types-card");
    questionTypesCard.type = "button";
    questionTypesCard.setAttribute("aria-label", "按 IELTS Reading 題型尋找練習");
    questionTypesCard.append(
      make("small", "", "IELTS READING"),
      make("strong", "", "By Question Type"),
      make("span", "", `${questionTypes.length || 14} 種題型 · ${questionTypeArticles.length || 437} 篇練習`),
    );
    questionTypesCard.addEventListener("click", () => navigate({ view: "question-types" }));
    elements.passagePicker.replaceChildren(
      questionTypesCard,
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

  function articleHasQuestionType(article, typeKey) {
    return questionTypeKeysForArticle(article).includes(typeKey);
  }

  function questionTypeArticleCount(typeKey) {
    return questionTypeArticles.reduce(
      (count, article) => count + (articleHasQuestionType(article, typeKey) ? 1 : 0),
      0,
    );
  }

  function renderQuestionTypeChip(type) {
    const button = make("button", "question-type-chip");
    button.type = "button";
    button.dataset.questionType = type.key;
    button.setAttribute("aria-pressed", state.questionType === type.key ? "true" : "false");
    button.setAttribute(
      "aria-label",
      `${type.en}，${type.zh}，${questionTypeArticleCount(type.key)} 篇練習`,
    );
    button.append(
      make("strong", "", type.en),
      make("span", "", type.zh),
      make("small", "", `${questionTypeArticleCount(type.key)} 篇`),
    );
    button.addEventListener("click", () => {
      navigate({ view: "question-types", type: type.key });
    });
    return button;
  }

  function sortedQuestionTypeArticles(articles) {
    return [...articles].sort((left, right) => {
      const passageDifference = (Number(left.passage) || 99) - (Number(right.passage) || 99);
      if (passageDifference) return passageDifference;
      const practiceDifference = (Number(left.practice) || 999) - (Number(right.practice) || 999);
      if (practiceDifference) return practiceDifference;
      return collator.compare(String(left.title || ""), String(right.title || ""));
    });
  }

  function renderQuestionTypeTag(article, type, matchedKeys) {
    const range = articleQuestionsForType(article, type.key);
    const tag = make(
      "span",
      `question-type-result-tag${matchedKeys.has(type.key) ? " is-match" : ""}`,
    );
    tag.append(
      make("strong", "", type.en),
      make("span", "", type.zh),
      ...(range ? [make("small", "", `Q${range}`)] : []),
    );
    return tag;
  }

  function renderQuestionTypeResult(article, matchedKeys) {
    const card = make("article", "question-type-result-card");
    card.setAttribute("role", "listitem");
    const passage = Number(article.passage);
    const practice = Number(article.practice);
    const title = String(article.title || `IELTS Reading Practice ${practice || ""}`).trim();

    const heading = make("h2", "", title);
    const metaParts = [];
    if ([1, 2, 3].includes(passage)) metaParts.push(`Passage ${passage}`);
    if (Number.isFinite(practice) && practice > 0) metaParts.push(`Practice ${practice}`);
    const meta = make("p", "question-type-result-meta", metaParts.join(" · "));

    const typeTags = make("div", "question-type-result-tags");
    const articleTypes = questionTypeKeysForArticle(article)
      .map((key) => questionTypesByKey.get(key))
      .filter(Boolean);
    typeTags.setAttribute("aria-label", "本篇練習題型及題號");
    typeTags.append(...articleTypes.map((type) => renderQuestionTypeTag(article, type, matchedKeys)));

    const action = make("div", "question-type-result-action");
    const articleId = String(article.id || article.articleId || "").trim();
    if (articleId && [1, 2, 3].includes(passage)) {
      const link = make("a", "question-type-practice-link", "開始閱讀練習");
      link.href = `reading-comprehension.html?article=${encodeURIComponent(articleId)}&passage=${passage}`;
      link.setAttribute("aria-label", `開始 ${title} 閱讀練習`);
      action.append(link);
    } else {
      const unavailable = make("span", "question-type-practice-link is-disabled", "練習準備中");
      unavailable.setAttribute("aria-disabled", "true");
      action.append(unavailable);
    }

    card.append(meta, heading, typeTags, action);
    return card;
  }

  function setQuestionTypeEmpty(title, message, visible) {
    const heading = elements.questionTypeEmpty.querySelector("strong");
    const copy = elements.questionTypeEmpty.querySelector("p");
    heading.textContent = title;
    copy.textContent = message;
    elements.questionTypeEmpty.hidden = !visible;
  }

  function renderQuestionTypeSelection(types, articleCount) {
    elements.questionTypeSelection.hidden = false;
    if (state.questionType && types.length === 1) {
      const type = types[0];
      elements.questionTypeSelection.replaceChildren(
        make("h2", "", `${type.en} · ${type.zh}`),
        make("p", "", `找到 ${articleCount} 篇含有這種題型的完整閱讀練習。`),
      );
      return;
    }
    if (normalise(state.questionTypeQuery)) {
      elements.questionTypeSelection.replaceChildren(
        make("h2", "", `找到 ${types.length} 種相符題型`),
        make(
          "p",
          "",
          types.length
            ? types.map((type) => `${type.en}（${type.zh}）`).join("、")
            : "請嘗試英文題型、中文名稱或較短的關鍵字。",
        ),
      );
      return;
    }
    elements.questionTypeSelection.replaceChildren(
      make("h2", "", "選擇一種題型"),
      make("p", "", "點選下方題型，或輸入英文／中文名稱，即可找到對應的完整閱讀練習。"),
    );
  }

  function renderQuestionTypeView() {
    const requestedType = questionTypesByKey.get(state.questionType);
    const hasQuery = Boolean(normalise(state.questionTypeQuery));
    const matchedTypes = requestedType
      ? [requestedType]
      : matchingQuestionTypes(state.questionTypeQuery);
    const matchedKeys = new Set(matchedTypes.map((type) => type.key));
    const shouldShowResults = Boolean(requestedType || hasQuery);
    const matches = shouldShowResults && matchedKeys.size
      ? sortedQuestionTypeArticles(
        questionTypeArticles.filter((article) =>
          questionTypeKeysForArticle(article).some((key) => matchedKeys.has(key)),
        ),
      )
      : [];
    const chipsToShow = hasQuery ? matchedTypes : questionTypes;

    elements.questionTypeSearch.value = state.questionTypeQuery;
    elements.questionTypeChips.replaceChildren(...chipsToShow.map(renderQuestionTypeChip));
    elements.questionTypeResults.setAttribute("role", "list");
    elements.questionTypeResults.replaceChildren(
      ...matches.map((article) => renderQuestionTypeResult(article, matchedKeys)),
    );
    renderQuestionTypeSelection(matchedTypes, matches.length);

    if (!questionTypes.length || !questionTypeArticles.length) {
      elements.questionTypeResultCount.textContent = "題型索引暫時未能載入";
      setQuestionTypeEmpty(
        "題型索引暫時未能載入",
        "請重新整理頁面；Passage 文章目錄仍可正常使用。",
        true,
      );
      return;
    }

    if (!shouldShowResults) {
      elements.questionTypeResultCount.textContent = `共 ${questionTypes.length} 種題型，涵蓋 ${questionTypeArticles.length} 篇閱讀練習`;
      setQuestionTypeEmpty("", "", false);
      return;
    }

    elements.questionTypeResultCount.textContent = matchedTypes.length
      ? `找到 ${matchedTypes.length} 種相符題型、${matches.length} 篇閱讀練習`
      : "找不到相符題型";
    setQuestionTypeEmpty(
      "找不到相符題型",
      "請嘗試英文題型、中文名稱或較短的關鍵字。",
      matchedTypes.length === 0,
    );
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
      state.article = null;
      state.questionType = questionTypesByKey.has(requestedQuestionType)
        ? requestedQuestionType
        : "";
      state.questionTypeQuery = state.questionType ? "" : requestedQuestionTypeQuery;
      renderQuestionTypeView();
      showView("question-types");
      document.title = "By Question Type | IELTS Reading | EdmundEducation";
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

    elements.questionTypeSearch.addEventListener("input", (event) => {
      state.questionType = "";
      state.questionTypeQuery = event.target.value;
      window.history.replaceState(
        {},
        "",
        routeUrl({ view: "question-types", q: state.questionTypeQuery }),
      );
      renderQuestionTypeView();
    });

    document.querySelector('[data-action="clear-question-type-search"]').addEventListener("click", () => {
      state.questionType = "";
      state.questionTypeQuery = "";
      window.history.replaceState({}, "", routeUrl({ view: "question-types" }));
      renderQuestionTypeView();
      elements.questionTypeSearch.focus();
    });

    document.querySelector('[data-action="previous"]').addEventListener("click", () => {
      if (state.view === "analysis" || state.view === "article-status") {
        navigate({ passage: state.passage });
      } else if (state.view === "catalogue" || state.view === "question-types") {
        navigate({});
      } else {
        window.location.href = "resources.html";
      }
    });

    document.querySelector('[data-action="question-types"]').addEventListener("click", () => {
      navigate({
        view: "question-types",
        type: state.view === "question-types" ? state.questionType : "",
        q: state.view === "question-types" ? state.questionTypeQuery : "",
      });
    });

    document.querySelector('[data-action="question-types-home"]').addEventListener("click", () => {
      navigate({});
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
    compactQuestionRanges,
    matchingQuestionTypes,
    normalise,
    questionTypeKeysForArticle,
    sortedRecords,
  });

  renderPassageNavigation();
  bindControls();
  void applyRoute();
})();
