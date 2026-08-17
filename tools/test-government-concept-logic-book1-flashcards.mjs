#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = "flashcards-government-concept-logic-book1-data.js";
const dataSource = fs.readFileSync(path.join(root, dataFile), "utf8");
const html = fs.readFileSync(path.join(root, "flashcards.html"), "utf8");
const prefix = "government/concept-logic-arguments/book-1";

const expected = [
  ["a-core-policy-group-discussion/q1-public-consultations", 7],
  ["a-core-policy-group-discussion/q2-short-term-relief-or-long-term-solutions", 6],
  ["a-core-policy-group-discussion/q3-public-service-funding", 6],
  ["l-scams-online-safety-technology/q1-banks-suspicious-transfers", 7],
  ["l-scams-online-safety-technology/q2-platform-responsibility-scam-advertisements", 7],
  ["l-scams-online-safety-technology/q3-protect-elderly-ai-deepfake-scams", 6]
].map(([suffix, cards]) => ({ deckId: `${prefix}/${suffix}`, cards }));

const expectedSections = [
  ["a-core-policy-group-discussion", "A. Core Policy & Group Discussion", "政策及小組討論"],
  ["b-housing-living-conditions", "B. Housing & Living Conditions", "房屋及居住環境"],
  ["c-healthcare-mental-health", "C. Healthcare & Mental Health", "醫療及精神健康"],
  ["d-elderly-people-carers", "D. Elderly People & Carers", "長者及照顧者"],
  ["e-families-children-working-parents", "E. Families, Children & Working Parents", "家庭、兒童及在職父母"],
  ["f-jobs-wages-employment", "F. Jobs, Wages & Employment", "就業、工資及勞工"],
  ["g-education-young-people", "G. Education & Young People", "教育及青年"],
  ["h-transport-getting-around", "H. Transport & Getting Around", "交通及市民出行"],
  ["i-welfare-poverty-helping-people-in-need", "I. Welfare, Poverty & Helping People in Need", "社會福利、扶貧及支援有需要人士"],
  ["j-cost-of-living-peoples-financial-burden", "J. Cost of Living & People's Financial Burden", "生活成本及市民經濟負擔"],
  ["k-environment-everyday-green-living", "K. Environment & Everyday Green Living", "環境及日常綠色生活"],
  ["l-scams-online-safety-technology", "L. Scams, Online Safety & Technology", "騙案、網絡安全及科技"]
];

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(dataSource, sandbox, { filename: dataFile, timeout: 20_000 });
const seed = sandbox.window.EDMUND_GOVERNMENT_CONCEPT_LOGIC_BOOK1_SEED;
assert.ok(seed && typeof seed === "object", "Missing Government Concept Logic Book 1 seed");
assert.deepEqual(Object.keys(seed), expected.map(item => item.deckId), "Question deck inventory changed");
assert.deepEqual(
  Object.keys(sandbox.window.EDMUND_FLASHCARD_SEED || {}),
  expected.map(item => item.deckId),
  "Concept Logic seed was not merged into the main flashcard seed"
);

let cardCount = 0;
for (const item of expected) {
  const cards = seed[item.deckId];
  assert.equal(cards.length, item.cards, `${item.deckId}: card count changed`);
  const fronts = new Set();
  const pages = new Set();
  cards.forEach((card, index) => {
    const label = `${item.deckId} card ${index + 1}`;
    assert.match(String(card.front || ""), /？$/, `${label}: question title missing`);
    assert.equal(card.meaning, "完整概念流程及例子", `${label}: answer heading changed`);
    assert.ok(Array.isArray(card.examples), `${label}: answer rows missing`);
    assert.equal(card.examples.length, 7, `${label}: expected six chain steps and one example`);
    card.examples.forEach((example, rowIndex) => {
      assert.ok(String(example?.en || "").trim(), `${label}: blank exercise row ${rowIndex + 1}`);
      assert.ok(String(example?.zh || "").trim(), `${label}: blank answer row ${rowIndex + 1}`);
    });
    assert.match(card.examples.at(-1).en, /^例子填空：/, `${label}: exercise example missing`);
    assert.match(card.examples.at(-1).zh, /^例子：/, `${label}: completed example missing`);
    assert.ok(Number.isInteger(card.sourcePage) && [1, 2].includes(card.sourcePage), `${label}: invalid source page`);
    assert.match(card.source, /^Flash Card - Book 1 - [AL] - Q[1-3] - /, `${label}: source filename changed`);
    assert.equal(fronts.has(card.front), false, `${item.deckId}: duplicate card title ${card.front}`);
    fronts.add(card.front);
    pages.add(card.sourcePage);
  });
  assert.deepEqual([...pages].sort(), [1, 2], `${item.deckId}: both PDF pages must be represented`);
  cardCount += cards.length;
}
assert.equal(cardCount, 39, "Government Concept Logic Book 1 must contain exactly 39 cards");

const navigationMatch = html.match(/const governmentConceptLogicBook1Sections = (\[[\s\S]*?\n    \]);/);
assert.ok(navigationMatch, "Could not locate Concept Logic Book 1 navigation");
const navigation = vm.runInNewContext(`(${navigationMatch[1]})`, {
  governmentConceptLogicBook1Prefix: prefix
});
assert.equal(navigation.length, 12, "Concept Logic Book 1 must contain exactly twelve sections");
expectedSections.forEach(([key, english, chinese], index) => {
  const section = navigation[index];
  assert.equal(section.key, key, `Section ${index + 1}: slug changed`);
  assert.ok(String(section.label).includes(english), `Section ${index + 1}: English title missing`);
  assert.ok(String(section.label).includes(chinese), `Section ${index + 1}: Chinese title missing`);
});
assert.equal(navigation[0].questions.length, 3, "Section A must contain three question decks");
assert.equal(navigation[11].questions.length, 3, "Section L must contain three question decks");
navigation.slice(1, 11).forEach(section => {
  assert.equal(section.questions.length, 0, `${section.key}: only A and L should contain question decks`);
});

assert.match(html, /<script src="flashcards-government-concept-logic-book1-data\.js\?v=20260817-1"><\/script>/, "Concept Logic data file is not loaded");
assert.ok(html.includes('routeOptionButton("概念邏輯論點", "government-concept-logic-arguments"'), "Government page selector is missing");
assert.ok(html.includes('route === "government-concept-logic-arguments-book-1"'), "Book 1 route handler is missing");
assert.ok(html.includes('route.startsWith("government-concept-logic-arguments-section|"'), "Section route handler is missing");

console.log(JSON.stringify({ sections: navigation.length, decks: expected.length, cards: cardCount, audioRequired: false }, null, 2));
