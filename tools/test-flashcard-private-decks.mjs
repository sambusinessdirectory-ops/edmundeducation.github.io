import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../flashcards.html", import.meta.url), "utf8");
function between(start, end) {
  const from = source.indexOf(start);
  assert.notEqual(from, -1, `Missing ${start}`);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(to, -1, `Missing ${end}`);
  return source.slice(from, to);
}

for (const match of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
  if (match[1].trim()) new vm.Script(match[1]);
}
const seedScript = [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .find(match => match[1].trim().startsWith("window.EDMUND_FLASHCARD_SEED ="))[1];
const seedContext = { window: {} };
vm.runInNewContext(seedScript, seedContext);
const seedDecks = Object.fromEntries(Object.entries(seedContext.window.EDMUND_FLASHCARD_SEED)
  .filter(([id]) => id.startsWith("custom-setup/")));
assert.equal(Object.values(seedDecks).reduce((sum, cards) => sum + cards.length, 0), 231);

const cards = count => Array.from({ length: count }, (_, i) => ({ front: `Test card ${i}`, meaning: "Test" }));
seedDecks["custom-setup/unassigned"] = cards(13);
seedDecks["custom-setup/mia-text"] = cards(7);
seedDecks["dse/shared"] = cards(5);
const store = {
  __studentCustomDecks: [
    { id: "student-custom/jayden/one", studentName: "Jayden", title: "Jayden's own" },
    { id: "student-custom/mia/one", studentName: "Mia", title: "Mia's own" }
  ],
  "student-custom/jayden/one": cards(3),
  "student-custom/mia/one": cards(8),
  "student-custom/mia/unassigned": cards(17)
};
const attempts = [
  { studentName: "Jayden", deckId: "custom-setup/sprint-text-1", startedAt: 1 },
  { studentName: "Mia", deckId: "custom-setup/mia-text", startedAt: 2 },
  // A stale/legacy record must not reveal an unassigned deck's private stats.
  { studentName: "Mia", deckId: "custom-setup/sprint-text-1", startedAt: 3 }
];
const harness = Function("seedDecks", "store", "attempts", `
  let currentUser = null;
  const window = {};
  const BOOKMARK_DECK_ID = "bookmarks/private";
  const IELTS_READING_PASSAGE_1_PREFIX = "ielts/reading/passage-1";
  const IELTS_READING_PASSAGE_2_PREFIX = "ielts/reading/passage-2";
  const IELTS_READING_PASSAGE_3_PREFIX = "ielts/reading/passage-3";
  const IELTS_READING_PASSAGE_1_CARD_COUNT = 10;
  const IELTS_READING_PASSAGE_2_CARD_COUNT = 20;
  const IELTS_READING_PASSAGE_3_CARD_COUNT = 30;
  const getCardStore = () => store;
  const getAttempts = () => attempts;
  const getResetLogs = () => [];
  const promotedSharedDecks = new Set();
  const getDeckFamiliarity = () => ({ green: ["0"], red: ["1"] });
  const isDeckFullyGreen = () => false;
  const todayText = time => time ? "Recently" : "Never";
  const deckTitleFromId = id => id;
  const escapeHtml = text => String(text);
  const optionButton = (title, id) => '<button data-open-deck="' + id + '">' + title + '</button>';
  let optionsFactory;
  const showOptions = (_title, _description, factory) => { optionsFactory = factory; };
  ${between("const customSetupDeckAssignments =", "const accessSections =")}
  ${between("const accessSections =", "const accessChildCatalog =")}
  ${between("function normalizeCardText(", "function saveCardStore(")}
  ${between("function studentDeckMetaKey(", "function createStudentCustomDeck(")}
  ${between("function isAdmin()", "function showLogin()")}
  ${between("function getKnownDeckIds()", "function sectionLabelLines(")}
  ${between("function customSetupDecksForStudent(", "function normalizeSearchText(")}
  ${between("function searchableCardRows()", "function predefinedSearchDeckRows()")}
  ${between("function showCustomSetup()", "function spacedRouteButton(")}
  return {
    login(name, role = "student", extra = {}) {
      currentUser = name ? { name, role, access: { "custom-setup": true, "student-custom": true, dse: true }, ...extra } : null;
    },
    assign(deck) { customSetupDeckAssignments.push(deck); },
    deckCardCount, deckMetaHtml, canAccessDeck, getDeckCards, getKnownDeckIds,
    deckIsSearchable, searchableCardRows, familiarityStatsForPrefix, attemptStatsForPrefix,
    privateDeckVisibleToStudent, isDeckCompleted, customSetupDecksForStudent,
    renderCustomSetup() { showCustomSetup(); return optionsFactory(); },
    rerenderCustomSetup() { return optionsFactory(); }
  };
`)(seedDecks, store, attempts);

for (const name of [null, "Other student", "Jayden Jr", "jayden-not-owner"]) {
  harness.login(name);
  assert.equal(harness.deckCardCount("custom-setup"), 0);
  assert.doesNotMatch(harness.deckMetaHtml("custom-setup"), /231|卡片：|嘗試：|綠勾：|紅叉：/);
  assert.match(harness.deckMetaHtml("custom-setup"), /暫時未有你的專屬卡組/);
  assert.equal(harness.canAccessDeck("custom-setup/sprint-text-1"), false);
  assert.equal(harness.getDeckCards("custom-setup/sprint-text-1").length, 0);
  assert.equal(harness.getKnownDeckIds().some(id => id.startsWith("custom-setup/")), false);
  assert.equal(harness.deckIsSearchable("custom-setup"), false);
  assert.doesNotMatch(harness.renderCustomSetup(), /Sprint|Jayden|data-open-deck/);
}

harness.login("Jayden");
assert.equal(harness.deckCardCount("custom-setup"), 231);
assert.match(harness.deckMetaHtml("custom-setup"), /卡片：231/);
assert.equal(harness.customSetupDecksForStudent().length, 2);
assert.equal(harness.canAccessDeck("custom-setup/sprint-text-1"), true);
assert.equal(harness.deckCardCount("custom-setup/unassigned"), 0, "unassigned custom decks fail closed");
assert.equal(harness.deckCardCount("student-custom"), 3, "self-made card totals belong to the current account");
assert.equal(harness.getDeckCards("student-custom/mia/one").length, 0);
assert.equal(harness.attemptStatsForPrefix("custom-setup").count, 1);
assert.deepEqual(harness.familiarityStatsForPrefix("custom-setup"), { green: 2, red: 2 });
assert.match(harness.renderCustomSetup(), /Sprint - Text 1/);

harness.login("Mia");
assert.equal(harness.deckCardCount("custom-setup"), 0, "switching accounts must not reuse Jayden's count");
assert.equal(harness.deckCardCount("student-custom"), 8);
assert.doesNotMatch(harness.rerenderCustomSetup(), /Sprint|Jayden/, "saved view factories must re-check the active account");
assert.deepEqual(harness.familiarityStatsForPrefix("custom-setup"), { green: 0, red: 0 });
assert.equal(harness.attemptStatsForPrefix("custom-setup").count, 0);
assert.equal(harness.isDeckCompleted("custom-setup"), false);
assert.equal(harness.searchableCardRows().some(row => row.deckId.startsWith("custom-setup/")), false);

harness.assign({ id: "custom-setup/mia-text", studentName: "Mia", title: "Mia Text" });
assert.equal(harness.deckCardCount("custom-setup"), 7, "a second owner sees only their own assigned count");
assert.equal(harness.attemptStatsForPrefix("custom-setup").count, 1, "legacy records for another owner's deck stay hidden");
assert.deepEqual(harness.familiarityStatsForPrefix("custom-setup"), { green: 1, red: 1 });
assert.equal(harness.customSetupDecksForStudent().length, 1);
assert.match(harness.renderCustomSetup(), /Mia Text/);
assert.doesNotMatch(harness.renderCustomSetup(), /Sprint/);

harness.login(" JAYDEN ");
assert.equal(harness.deckCardCount("custom-setup"), 231, "existing username normalization remains supported");
harness.login("Admin", "admin");
assert.equal(harness.getDeckCards("custom-setup/sprint-text-1").length > 0, true, "admin management access is preserved");
assert.deepEqual(harness.familiarityStatsForPrefix("custom-setup", "Mia"), { green: 1, red: 1 });
harness.login("Other student", "student", { impersonatedByAdmin: true });
assert.equal(harness.deckCardCount("custom-setup"), 0, "admin student previews must respect the student's ownership");
harness.login("Jayden", "student", { access: { "custom-setup": false } });
assert.equal(harness.canAccessDeck("custom-setup/sprint-text-1"), false, "ownership cannot override disabled section access");

harness.login("Other student");
assert.equal(harness.deckCardCount("dse"), 5, "shared deck counts remain unchanged");
assert.equal(harness.deckCardCount("ielts/reading"), 60, "lazy-loaded shared catalogue totals remain unchanged");

const predefined = between("function predefinedSearchDeckRows()", "function mergeSearchDeckRow(");
assert.match(predefined, /const assignedCustomDecks = customSetupDecksForStudent\(\)/);
assert.match(predefined, /assignedCustomDecks\.length\)/);
assert.doesNotMatch(predefined, /addAggregate\("custom-setup", "客製 Setup", 2\)/);
assert.match(between("function canAccessDeck(", "function showLogin()"), /privateDeckVisibleToStudent/);
console.log("Private flashcard ownership, counts, search, admin previews and account switching checks passed.");
