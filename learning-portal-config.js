(function configureLearningPortalScaffolds() {
  "use strict";

  const portals = [
    { ordinal: 30, id: "quotes", href: "quotes-system.html", lines: ["Quotes", "名人英文語錄", "學習系統"], dashboard: true, hue: 24 },
    { ordinal: 31, id: "grammar", href: "grammar-system.html", lines: ["Grammar", "英文語法學習"], dashboard: true, hue: 215 },
    { ordinal: 32, id: "collocation", href: "collocation-system.html", lines: ["Collocation", "英文配詞", "學習系統"], dashboard: true, hue: 162 },
    { ordinal: 33, id: "irregular-verb", href: "irregular-verb-system.html", lines: ["Irregular Verb", "不規則動詞", "學習系統"], dashboard: false, blankAfterLogin: true, hue: 202 },
    { ordinal: 34, id: "thematic-vocabulary", href: "thematic-vocabulary-system.html", lines: ["Thematic Vocabulary", "主題性生字記錄大全"], dashboard: true, hue: 278 },
    { ordinal: 35, id: "part-of-speech", href: "part-of-speech-system.html", lines: ["Part Of Speech (POS)", "詞性練習系統"], dashboard: true, hue: 42 },
    { ordinal: 36, id: "synonyms", href: "synonyms-system.html", lines: ["Synonyms", "同義詞", "學習系統"], dashboard: false, hue: 188 },
    { ordinal: 37, id: "error-identifier", href: "error-identifier-system.html", lines: ["Error Identifier", "錯因分析系統"], dashboard: false, hideEmptyContent: true, hue: 4 },
    { ordinal: 38, id: "learning-roadmap", href: "learning-roadmap.html", lines: ["Learning Roadmap", "英文學習路線圖"], dashboard: false, hue: 228 },
    { ordinal: 39, id: "spelling", href: "spelling-system.html", lines: ["Spelling", "拼寫", "練習系統"], dashboard: true, hue: 142 },
    { ordinal: 40, id: "reading-logic", href: "reading-logic-system.html", lines: ["Reading Logic", "閱讀理解", "題型邏輯"], dashboard: true, hue: 258 },
    { ordinal: 41, id: "translation-skills", href: "translation-skills-system.html", lines: ["Translation Skills", "閱讀理解", "英譯中能力學習"], dashboard: true, hue: 194 },
    { ordinal: 42, id: "business-school", href: "business-school-system.html", lines: ["Business School", "商學院英文訓練系統"], dashboard: true, hue: 38, modules: [
      { id: "business", title: "Business System", description: "商業營運、管理與職場溝通英文。", icon: "B" },
      { id: "marketing", title: "Marketing System", description: "市場推廣、品牌策略與顧客溝通英文。", icon: "M" },
      { id: "finance", title: "Finance System", description: "財務、投資與商業數據英文。", icon: "F" }
    ] },
    { ordinal: 43, id: "complex-questions", href: "complex-questions-system.html", lines: ["Complex Questions", "英文複雜問句"], dashboard: true, hue: 316 },
    { ordinal: 44, id: "leisurely-reading", href: "leisurely-reading.html", lines: ["Leisurely Reading", "英文導讀系統"], dashboard: false, hue: 118 },
    { ordinal: 45, id: "english-humour-speaking", href: "english-humour-speaking.html", lines: ["English Humour", "Speaking", "英文幽默會話系統"], dashboard: true, hue: 52 },
    { ordinal: 46, id: "english-humour-writing", href: "english-humour-writing.html", lines: ["English Humour", "Writing", "英文幽默寫作系統"], dashboard: true, hue: 332 },
    { ordinal: 47, id: "english-joke-collection", href: "english-joke-collection.html", lines: ["English Joke", "Collection", "英文笑話收集站"], dashboard: false, hue: 202 },
    { ordinal: 48, id: "argument-learning", href: "argument-learning-system.html", lines: ["Argument learning", "論證 / 論據 / 論點 學習系統"], dashboard: false, blankAfterLogin: true, homework: false, hue: 268 },
    { ordinal: 49, id: "fragmented-reading", href: "fragmented-reading-system.html", lines: ["Fragmented Reading", "閱讀理解", "碎片訓練系統"], dashboard: false, blankAfterLogin: true, homework: false, hue: 176 },
    { ordinal: 51, id: "precise-language", href: "precise-language-system.html", lines: ["Precise Language", "精準措詞系統"], dashboard: false, blankAfterLogin: true, homework: false, hue: 12 },
    { ordinal: 52, id: "false-friends", href: "false-friends-system.html", lines: ["False Friends", "同形異義詞", "學習系統"], dashboard: true, hideEmptyContent: true, homework: false, hue: 154 },
    { ordinal: 53, id: "english-in-shows", href: "english-in-shows-system.html", lines: ["English in Shows", "影視英文", "學習系統"], dashboard: false, blankAfterLogin: true, homework: false, hue: 224 },
    { ordinal: 54, id: "ted-talk-english", href: "ted-talk-english-system.html", lines: ["Ted Talk English", "Ted Talk 英文", "學習系統"], dashboard: false, blankAfterLogin: true, homework: false, hue: 8 },
    { ordinal: 55, id: "poem-english", href: "poem-english-system.html", lines: ["Poem English", "詩句賞識系統"], dashboard: false, blankAfterLogin: true, homework: false, hue: 286 },
    { ordinal: 71, id: "junior-exam-prep", href: "junior-exam-prep.html", lines: ["考試溫習系統", "Exam Preparation"], dashboard: false, hideEmptyContent: true, homework: false, hue: 204 },
    { ordinal: 72, id: "junior-quiz-review", href: "junior-quiz-review.html", lines: ["測驗溫習系統", "Quiz Review"], dashboard: false, hideEmptyContent: true, homework: false, hue: 25 },
    { ordinal: 75, id: "news-discussion", href: "news-discussion.html", lines: ["News Discussion", "熱議新聞討論"], dashboard: false, hideEmptyContent: true, homework: false, hue: 149 },
    { ordinal: 85, id: "homonomy", href: "homonomy-system.html", lines: ["Homonomy System", "同音詞學習系統"], dashboard: true, hue: 194 },
    { ordinal: 86, id: "eddy-dialogue-index", href: "eddy-dialogue-box-index.html", lines: ["Eddy Dialogue Box Index", "Eddy 對話框圖鑑"], dashboard: false, hideEmptyContent: true, homework: false, hue: 34 },
    { ordinal: 87, id: "thematic-vocabulary-learning", href: "thematic-vocabulary-learning-system.html", lines: ["Thematic Vocabulary", "主題詞彙學習系統"], dashboard: true, hue: 278 },
    { ordinal: 88, id: "cre", href: "cre-system.html", lines: ["CRE System", "綜合招聘考試練習"], dashboard: true, hue: 208 },
    { ordinal: 89, id: "abbreviation", href: "abbreviation-system.html", lines: ["Abbreviation System", "英文縮寫學習系統"], dashboard: true, hue: 156 },
    { ordinal: 90, id: "childrens-stories", href: "childrens-stories-system.html", lines: ["Children's Stories", "兒童故事系統"], dashboard: true, hue: 44 },
    { ordinal: 91, id: "teens-stories", href: "teens-stories-system.html", lines: ["Teens' Stories", "青少年故事系統"], dashboard: true, hue: 326 },
    { ordinal: 92, id: "adults-stories", href: "adults-stories-system.html", lines: ["Adults' Stories", "成人故事系統"], dashboard: true, hue: 18 },
    { ordinal: 93, id: "mock-exam", href: "mock-exam-system.html", lines: ["Mock", "模擬考試系統"], dashboard: true, hue: 224, modules: [
      { id: "junior-high", title: "Junior High 初中 mode", description: "為初中學生整理的模擬試題與限時練習。", icon: "JH" },
      { id: "high-school", title: "High School 高中 mode", description: "為高中學生整理的模擬試題與考試訓練。", icon: "HS" }
    ] }
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
