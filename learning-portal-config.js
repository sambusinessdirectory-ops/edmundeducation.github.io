(function configureLearningPortalScaffolds() {
  "use strict";

  const portals = [
    { ordinal: 30, id: "quotes", href: "quotes-system.html", lines: ["Quotes", "名人英文語錄", "學習系統"], dashboard: true, hue: 24 },
    { ordinal: 31, id: "grammar", href: "grammar-system.html", lines: ["Grammar", "英文語法學習"], dashboard: true, hue: 215 },
    { ordinal: 32, id: "collocation", href: "collocation-system.html", lines: ["Collocation", "英文配詞", "學習系統"], dashboard: true, hue: 162 },
    { ordinal: 33, id: "irregular-verb", href: "irregular-verb-system.html", lines: ["Irregular Verb", "不規則動詞", "學習系統"], dashboard: true, hue: 348 },
    { ordinal: 34, id: "thematic-vocabulary", href: "thematic-vocabulary-system.html", lines: ["Thematic Vocabulary", "主題性生字記錄大全"], dashboard: true, hue: 278 },
    { ordinal: 35, id: "part-of-speech", href: "part-of-speech-system.html", lines: ["Part Of Speech (POS)", "詞性練習系統"], dashboard: true, hue: 42 },
    { ordinal: 36, id: "synonyms", href: "synonyms-system.html", lines: ["Synonyms", "同義詞", "學習系統"], dashboard: true, hue: 188 },
    { ordinal: 37, id: "error-identifier", href: "error-identifier-system.html", lines: ["Error Identifier", "錯因分析系統"], dashboard: true, hue: 4 },
    { ordinal: 38, id: "learning-roadmap", href: "learning-roadmap.html", lines: ["Learning Roadmap", "英文學習路線圖"], dashboard: false, hue: 228 },
    { ordinal: 39, id: "spelling", href: "spelling-system.html", lines: ["Spelling", "拼寫", "練習系統"], dashboard: true, hue: 142 },
    { ordinal: 40, id: "reading-logic", href: "reading-logic-system.html", lines: ["Reading Logic", "閱讀理解", "題型邏輯"], dashboard: true, hue: 258 },
    { ordinal: 41, id: "translation-skills", href: "translation-skills-system.html", lines: ["Translation Skills", "閱讀理解", "英譯中能力學習"], dashboard: true, hue: 194 },
    { ordinal: 42, id: "business-school", href: "business-school-system.html", lines: ["Business School", "商學院英文訓練系統"], dashboard: true, hue: 38 },
    { ordinal: 43, id: "complex-questions", href: "complex-questions-system.html", lines: ["Complex Questions", "英文複雜問句"], dashboard: true, hue: 316 },
    { ordinal: 44, id: "leisurely-reading", href: "leisurely-reading.html", lines: ["Leisurely Reading", "英文導讀系統"], dashboard: false, hue: 118 },
    { ordinal: 45, id: "english-humour-speaking", href: "english-humour-speaking.html", lines: ["English Humour", "Speaking", "英文幽默會話系統"], dashboard: true, hue: 52 },
    { ordinal: 46, id: "english-humour-writing", href: "english-humour-writing.html", lines: ["English Humour", "Speaking", "英文幽默寫作系統"], dashboard: true, hue: 332 },
    { ordinal: 47, id: "english-joke-collection", href: "english-joke-collection.html", lines: ["English Joke", "Collection", "英文笑話收集站"], dashboard: false, hue: 202 },
    { ordinal: 48, id: "argument-learning", href: "argument-learning-system.html", lines: ["Argument learning", "論證 / 論據 / 論點 學習系統"], dashboard: false, blankAfterLogin: true, homework: false, hue: 268 }
  ].map((portal) => Object.freeze({
    ...portal,
    titleEn: portal.lines[0],
    titleZh: portal.lines.slice(1).join(" / "),
    sessionKey: `edmund-learning-portal-${portal.id}-session-v1`
  }));

  window.EDMUND_LEARNING_PORTALS = Object.freeze(portals);
  window.EDMUND_HOMEWORK_RESOURCES = Object.freeze(portals
    .filter((portal) => portal.homework !== false)
    .map((portal) => Object.freeze({
    id: `learning-portal:${portal.id}`,
    type: "learning-portal",
    ordinal: portal.ordinal,
    label: portal.lines.join(" / "),
    detail: `學生學習系統 · ${portal.lines.slice(1).join(" / ")}`,
    url: portal.href
    })));
})();
