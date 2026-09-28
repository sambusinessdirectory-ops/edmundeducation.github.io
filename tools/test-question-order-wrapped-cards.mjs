import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createRequire } from "node:module";

const require = createRequire(new URL("./email-qa/package.json", import.meta.url));
const { JSDOM } = require("jsdom");
const source = (await fs.readFile(new URL("../question-order.mjs", import.meta.url), "utf8"))
  .replaceAll("export function", "function");
const cards = [1, 2, 3].map((number) => `<div data-question-order-item data-item="${number}"><article class="question-card" data-question-id="q${number}" data-question-number="${number}"><span class="question-number">QUESTION ${number}</span><input value="answer${number}"></article><aside>platform</aside></div>`).join("");
const dom = new JSDOM(`<body><section data-view="lesson"><div data-question-list>${cards}</div></section></body>`, { url: "https://edmundeducation.com/sentence-structure.html" });
let observerCallbacks = 0;
class CountingObserver extends dom.window.MutationObserver {
  constructor(callback) {
    super((...args) => {
      observerCallbacks += 1;
      if (observerCallbacks <= 20) callback(...args);
    });
  }
}
const context = vm.createContext({
  document: dom.window.document,
  window: dom.window,
  localStorage: dom.window.localStorage,
  MutationObserver: CountingObserver,
  Option: dom.window.Option,
  queueMicrotask
});
vm.runInContext(`${source};window.stopOrder=installQuestionOrder({system:'sentence',owner:()=> 'student',lessonId:()=> 'ss1'});`, context);
const flush = () => new Promise((resolve) => setTimeout(resolve, 20));
await flush();
const document = dom.window.document;
const control = document.querySelector(".question-order-inline");
const firstItem = document.querySelector("[data-question-order-item]");
assert.equal(firstItem.previousElementSibling, control, "control stays beside the wrapper instead of moving through every card");
assert.ok(observerCallbacks < 10, `observer stabilizes instead of looping (${observerCallbacks} callbacks)`);
const select = control.querySelector("select");
select.value = "desc";
select.dispatchEvent(new dom.window.Event("change"));
await flush();
assert.deepEqual([...document.querySelectorAll("[data-question-order-item]")].map((item) => item.dataset.item), ["3", "2", "1"]);
assert.equal(document.querySelector('[data-item="1"] input').value, "answer1");
assert.ok(observerCallbacks < 15, `descending reorder stabilizes (${observerCallbacks} callbacks)`);
dom.window.stopOrder();
dom.window.close();
console.log("PASS: wrapped question cards reorder as units without a MutationObserver loop");
