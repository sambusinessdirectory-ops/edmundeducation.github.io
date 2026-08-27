import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const source = read("eddie-farm-i18n.js");
function element(dataset = {}) {
  return { dataset, textContent: "", attributes: {}, listeners: {}, setAttribute(key, value) { this.attributes[key] = value; }, addEventListener(name, fn) { this.listeners[name] = fn; } };
}
function boot({ href = "https://example.test/eddie-farm.html", saved, blockedStorage = false } = {}) {
  const nodes = [...read("eddie-farm.html").matchAll(/data-farm-i18n="([^"]+)"/g)].map((match) => element({ farmI18n: match[1] }));
  const aria = element({ farmI18nAria: "switchSystem" });
  const rule = element({ farmRuleTitle: "flashcards", farmRuleLabel: "Flashcards" });
  const buttons = [element({ farmLanguage: "zh-Hant" }), element({ farmLanguage: "en" })];
  const storage = new Map(saved ? [["eddie-farm-language-v1", saved]] : []);
  const events = [];
  const document = { documentElement: { lang: "" }, title: "", addEventListener() {}, dispatchEvent(event) { events.push(event.type); },
    querySelectorAll(selector) { return ({ "[data-farm-i18n]": nodes, "[data-farm-i18n-aria]": [aria], "[data-farm-rule-title]": [rule], "[data-farm-language]": buttons })[selector] || []; } };
  const location = { href };
  const window = {};
  const history = { state: { preserved: true }, replaceState(state, _title, url) { assert.equal(state.preserved, true); location.href = String(url); } };
  const localStorage = { getItem(key) { if (blockedStorage) throw Error("blocked"); return storage.get(key); }, setItem(key, value) { if (blockedStorage) throw Error("blocked"); storage.set(key, value); } };
  vm.runInNewContext(source, { window, document, localStorage, location, history, URL, CustomEvent: class { constructor(type) { this.type = type; } } });
  return { api: window.EddieFarmI18n, document, location, storage, nodes, aria, rule, buttons, events };
}

test("Chinese URL translates all page labels and is remembered", () => {
  const app = boot({ href: "https://example.test/eddie-farm.html?lang=zh-Hant" });
  assert.equal(app.api.language, "zh-Hant");
  assert.equal(app.document.documentElement.lang, "zh-Hant");
  assert.equal(app.document.title, "Eddie Farm 積分系統｜EdmundEducation");
  assert.equal(app.storage.get("eddie-farm-language-v1"), "zh-Hant");
  assert.equal(app.aria.attributes["aria-label"], "切換學習系統");
  assert.equal(app.rule.textContent, "學習卡");
  for (const node of app.nodes) assert.notEqual(node.textContent, node.dataset.farmI18n, `missing translation: ${node.dataset.farmI18n}`);
  assert.equal(app.buttons[0].attributes["aria-pressed"], "true");
  assert.equal(app.api.t("login"), "登入");
});

test("language buttons switch without navigation and preserve return URLs", () => {
  const app = boot({ href: "https://example.test/eddie-farm.html?return=farm#farm-main" });
  app.buttons[0].listeners.click();
  assert.equal(new URL(app.location.href).searchParams.get("return"), "farm");
  assert.equal(new URL(app.location.href).hash, "#farm-main");
  assert.equal(new URL(app.location.href).searchParams.get("lang"), "zh-Hant");
  app.buttons[1].listeners.click();
  assert.equal(app.api.language, "en");
  assert.equal(app.api.t("login"), "Log in");
  assert.equal(app.rule.textContent, "Flashcards");
  assert.equal(app.document.documentElement.lang, "en-HK");
  assert.equal(app.buttons[1].attributes["aria-pressed"], "true");
  assert.deepEqual(app.events, ["eddie-farm-language-change", "eddie-farm-language-change"]);
});

test("saved preference, explicit override and unavailable storage are safe", () => {
  assert.equal(boot({ saved: "zh-Hant" }).api.language, "zh-Hant");
  assert.equal(boot({ saved: "zh-Hant", href: "https://example.test/?lang=en" }).api.language, "en");
  assert.equal(boot({ saved: "invalid", href: "https://example.test/?lang=invalid" }).api.language, "en");
  const app = boot({ blockedStorage: true });
  app.api.setLanguage("zh-Hant");
  assert.equal(app.api.t("save"), "儲存");
});

test("admin labels and messages translate without changing reward data", () => {
  const app = boot({ saved: "zh-Hant" });
  const rule = { system_key: "daily-return", label: "Consecutive return", exercise_count: 1, points: 9 };
  const before = JSON.stringify(rule);
  assert.equal(app.api.ruleTitle(rule), "連續回訪獎勵（T+1）");
  assert.equal(app.api.t("settingsSaved", { title: app.api.ruleTitle(rule) }), "連續回訪獎勵（T+1）：設定已儲存。");
  assert.equal(app.api.errorText({ message: "Admin session expired." }), "管理員登入已失效，請重新登入。");
  assert.equal(JSON.stringify(rule), before);
  app.api.setLanguage("en");
  assert.equal(app.api.ruleTitle(rule), rule.label);
  assert.equal(app.api.errorText({ message: "Admin session expired." }), "Admin session expired.");
});

test("translation updates text spans, never replaces inputs or private rule values", () => {
  const html = read("eddie-farm.html");
  assert.ok(html.indexOf('src="eddie-farm-i18n.js"') < html.indexOf('src="eddie-farm.js"'));
  assert.doesNotMatch(source, /innerHTML|\.value\s*=|replaceChildren|fetch\(|\.rpc\(/);
  assert.doesNotMatch(html, /<(?:input|label)[^>]*data-farm-i18n=/);
  assert.doesNotMatch(source, /exercise_count\s*:\s*\d|password_hash|service_role/);
  assert.match(read("eddie-farm.js"), /document\.addEventListener\("eddie-farm-language-change", translateState\)/);
});
