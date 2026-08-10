import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { HOMEWORK_RESOURCE_CATALOG } from "../homework-resource-catalog.mjs";
import { normalizeHomeworkResource } from "../schedule-homework-links.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8");
const expected = [
  [30, "quotes", "quotes-system.html", ["Quotes", "名人英文語錄", "學習系統"], true],
  [31, "grammar", "grammar-system.html", ["Grammar", "英文語法學習"], true],
  [32, "collocation", "collocation-system.html", ["Collocation", "英文配詞", "學習系統"], true],
  [33, "irregular-verb", "irregular-verb-system.html", ["Irregular Verb", "不規則動詞", "學習系統"], true],
  [34, "thematic-vocabulary", "thematic-vocabulary-system.html", ["Thematic Vocabulary", "主題性生字記錄大全"], true],
  [35, "part-of-speech", "part-of-speech-system.html", ["Part Of Speech (POS)", "詞性練習系統"], true],
  [36, "synonyms", "synonyms-system.html", ["Synonyms", "同義詞", "學習系統"], true],
  [37, "error-identifier", "error-identifier-system.html", ["Error Identifier", "錯因分析系統"], true],
  [38, "learning-roadmap", "learning-roadmap.html", ["Learning Roadmap", "英文學習路線圖"], false],
  [39, "spelling", "spelling-system.html", ["Spelling", "拼寫", "練習系統"], true],
  [40, "reading-logic", "reading-logic-system.html", ["Reading Logic", "閱讀理解", "題型邏輯"], true],
  [41, "translation-skills", "translation-skills-system.html", ["Translation Skills", "閱讀理解", "英譯中能力學習"], true],
  [42, "business-school", "business-school-system.html", ["Business School", "商學院英文訓練系統"], true],
  [43, "complex-questions", "complex-questions-system.html", ["Complex Questions", "英文複雜問句"], true],
  [44, "leisurely-reading", "leisurely-reading.html", ["Leisurely Reading", "英文導讀系統"], false],
  [45, "english-humour-speaking", "english-humour-speaking.html", ["English Humour", "Speaking", "英文幽默會話系統"], true],
  [46, "english-humour-writing", "english-humour-writing.html", ["English Humour", "Speaking", "英文幽默寫作系統"], true],
  [47, "english-joke-collection", "english-joke-collection.html", ["English Joke", "Collection", "英文笑話收集站"], false]
];

const configSource = await read("learning-portal-config.js");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(configSource, context, { filename: "learning-portal-config.js" });
const portals = Array.from(context.window.EDMUND_LEARNING_PORTALS, (portal) => ({
  ordinal: portal.ordinal,
  id: portal.id,
  href: portal.href,
  lines: Array.from(portal.lines),
  dashboard: portal.dashboard,
  sessionKey: portal.sessionKey
}));

assert.deepEqual(portals.map(({ ordinal, id, href, lines, dashboard }) => [ordinal, id, href, lines, dashboard]), expected);
assert.deepEqual(portals.filter(({ dashboard }) => !dashboard).map(({ ordinal }) => ordinal), [38, 44, 47]);
assert.equal(new Set(portals.map(({ href }) => href)).size, 18, "every portal URL must be stable and unique");

const home = await read("index.html");
const homepageCards = [...home.matchAll(/<a class="category learning-portal-card"[^>]*href="([^"]+)"[^>]*>[\s\S]*?<span class="category-name">([\s\S]*?)<\/span>\s*<\/a>/g)];
assert.equal(homepageCards.length, 18, "homepage should append exactly 18 learning portal cards");
assert.deepEqual(homepageCards.map((match) => match[1]), expected.map(([, , href]) => href));
assert.deepEqual(homepageCards.map((match) => match[2].trim()), expected.map(([, , , lines]) => lines.join("<br>")));
const allCardStarts = [...home.matchAll(/<a class="category(?:\s|\")/g)].map((match) => match.index);
assert.equal(allCardStarts.length, 47, "homepage card counter should finish at 47");
homepageCards.forEach((match, index) => assert.equal(allCardStarts.indexOf(match.index) + 1, index + 30));

for (const portal of portals) {
  const html = await read(portal.href);
  assert.match(html, new RegExp(`<body data-learning-portal="${portal.id}">`));
  assert.match(html, new RegExp(`data-edmund-system-switcher data-system="${portal.id}"`));
  assert.match(html, /data-system-switcher-trigger aria-label="開啟 EdmundEducation 系統快速切換"/);
  assert.match(html, new RegExp(`<link rel="canonical" href="https://edmundeducation\\.com/${portal.href}">`));
  for (const asset of ["/manifest.webmanifest", "/pwa-ui.css", "/pwa-register.js", "learning-portal-scaffold.css", "learning-portal-config.js", "shared-system-nav.js", "learning-portal-scaffold.js"]) {
    assert.ok(html.includes(asset), `${portal.href} should load ${asset}`);
  }
}

const runtime = await read("learning-portal-scaffold.js");
assert.match(runtime, /flashcard_student_login/);
assert.match(runtime, /flashcard_student_session_profile/);
assert.match(runtime, /EdmundSystemNav\?\.rememberStudentSession/);
assert.match(runtime, /EdmundSystemNav\?\.getStudentSession/);
assert.match(runtime, /if \(!portal\.dashboard\) return ""/);
assert.match(runtime, /ACTIVITY BY DATE/);
assert.match(runtime, /TIME SPENT BY DATE/);
assert.match(runtime, /data-progress-toggle/);
assert.match(runtime, /這裡暫時未有學習內容。新增的課題會按次序顯示在這裡。/);
assert.doesNotMatch(runtime, /student-progress|Student Progress/i, "new scaffolds must not write to the aggregate yet");

const studentProgressHtml = await read("student-progress.html");
assert.doesNotMatch(studentProgressHtml, /learning-portal-config\.js|learning-portal-scaffold\.js/);

const homework = HOMEWORK_RESOURCE_CATALOG.filter(({ type }) => type === "learning-portal");
assert.equal(homework.length, 18);
for (const [ordinal, id, href, lines] of expected) {
  const resource = homework.find((item) => item.id === `learning-portal:${id}`);
  assert.equal(resource?.ordinal, ordinal);
  assert.equal(resource?.label, lines.join(" / "));
  assert.equal(resource?.url, href);
  assert.deepEqual(normalizeHomeworkResource(resource), Object.freeze({
    id: `learning-portal:${id}`,
    type: "learning-portal",
    label: lines.join(" / "),
    url: href
  }));
}

const sitemap = await read("sitemap.xml");
for (const portal of portals) assert.ok(sitemap.includes(`https://edmundeducation.com/${portal.href}`));

console.log("Learning portal scaffold checks passed (18 portals, homepage positions 30–47, shared login, dashboards, PWA, sitemap and Homework catalogue).");
