import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceFiles = [
  "flashcards-ielts-writing-task1-data.js",
  "flashcards-ielts-writing-opinions-3-38-express-32-43-data.js",
  "flashcards-ielts-writing-opinions-39-82-data.js",
  "flashcards-ielts-writing-express-4-31-data.js",
  "flashcards-ielts-writing-advantage-cause-direct-data.js",
  "flashcards-dse-listening-data.js"
];

const context = { window: { EDMUND_FLASHCARD_SEED: {} } };
context.globalThis = context;
vm.createContext(context);
for (const file of sourceFiles) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, { filename: file });
}

const titleCase = (value) => String(value || "")
  .split("-")
  .map((part) => part ? part[0].toUpperCase() + part.slice(1) : "")
  .join(" ")
  .replace(/Ielts/g, "IELTS")
  .replace(/Dse/g, "DSE");
const cleanSource = (value) => String(value || "").replace(/^Flash\s*Card\s*-\s*/i, "").replace(/\.pdf$/i, "").trim();
const normalized = (value) => String(value || "").normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
const hash = (value) => {
  let result = 2166136261;
  for (const character of value) {
    result ^= character.codePointAt(0);
    result = Math.imul(result, 16777619);
  }
  return (result >>> 0).toString(36);
};

const libraries = [
  {
    id: "ielts",
    label: "IELTS Selections",
    zh: "IELTS 精選",
    description: "Writing Task 1 圖表詞彙及 Task 2 論說文詞彙",
    groups: [
      { id: "ielts-task1", label: "Writing Task 1", zh: "圖表寫作" },
      { id: "ielts-task2", label: "Writing Task 2", zh: "論說文寫作" }
    ]
  },
  {
    id: "dse",
    label: "DSE Selections",
    zh: "DSE 精選",
    description: "Paper 3 Part A Listening 歷屆聆聽詞彙",
    groups: [{ id: "dse-paper3-part-a", label: "Paper 3 Part A", zh: "聆聽" }]
  }
];

const sectionLabels = {
  "bar-charts": ["Bar Charts", "棒形圖"],
  "line-graphs": ["Line Graphs", "折線圖"],
  "pie-charts": ["Pie Charts", "圓形圖"],
  "tables": ["Tables", "表格"],
  "maps": ["Maps", "地圖"],
  "process-diagrams": ["Process Diagrams", "流程圖"],
  "mixed-charts": ["Mixed Charts", "混合圖表"],
  "opinions": ["Opinions", "立場題"],
  "discuss-both-views-your-opinion": ["Discuss both views + Your opinion", "雙方觀點及立場"],
  "advantage-and-disadvantage": ["Advantage and Disadvantage", "利弊題"],
  "problem-and-cause": ["Problem and Cause", "問題與成因題"],
  "cause-and-solution": ["Problem and Cause", "問題及成因題"],
  "direct-question": ["Direct question", "直接問題"],
};

const decks = [];
const entryMap = new Map();
function addDeck({ id, libraryId, groupId, sectionId, sectionLabel, sectionZh, label, sourceKey, cards }) {
  const entryIds = [];
  const seen = new Set();
  for (const card of cards || []) {
    const word = String(card?.front || "").normalize("NFKC").trim().replace(/\s+/g, " ");
    const meaning = String(card?.meaning || "").normalize("NFKC").trim().replace(/\s+/g, " ");
    if (!word || !meaning) continue;
    const signature = `${normalized(word)}\u0000${normalized(meaning)}`;
    if (seen.has(signature)) continue;
    seen.add(signature);
    const entryId = `${libraryId}-${hash(signature)}`;
    const existing = entryMap.get(entryId);
    if (existing) {
      if (!existing.deckIds.includes(id)) existing.deckIds.push(id);
    } else {
      entryMap.set(entryId, {
        id: entryId,
        word,
        meaning,
        libraryId,
        deckIds: [id],
        source: String(card?.source || "").trim(),
        sourcePage: String(card?.sourcePage || "").trim()
      });
    }
    entryIds.push(entryId);
  }
  decks.push({ id, libraryId, groupId, sectionId, sectionLabel, sectionZh, label, sourceKey, entryIds });
}

const task1 = context.window.EDMUND_IELTS_WRITING_TASK1_SEED || {};
const task1Titles = context.window.EDMUND_IELTS_WRITING_TASK1_TITLES || {};
for (const [key, cards] of Object.entries(task1)) {
  const parts = key.split("/");
  const sectionId = parts[3] || "task-1";
  const [sectionLabel, sectionZh] = sectionLabels[sectionId] || [titleCase(sectionId), ""];
  addDeck({
    id: `ielts-t1-${hash(key)}`,
    libraryId: "ielts",
    groupId: "ielts-task1",
    sectionId: `ielts-t1-${sectionId}`,
    sectionLabel,
    sectionZh,
    label: task1Titles[key] || cleanSource(cards?.[0]?.source) || titleCase(parts.at(-1)),
    sourceKey: key,
    cards
  });
}

const task2Seeds = [
  context.window.EDMUND_IELTS_WRITING_OPINIONS_3_38_EXPRESS_32_43_SEED,
  context.window.EDMUND_IELTS_WRITING_OPINIONS_39_82_SEED,
  context.window.EDMUND_IELTS_WRITING_EXPRESS_4_31_SEED,
  context.window.EDMUND_IELTS_WRITING_ADVANTAGE_CAUSE_DIRECT_SEED
].filter(Boolean);
const mergedTask2 = new Map();
for (const seed of task2Seeds) {
  for (const [key, cards] of Object.entries(seed)) {
    const target = mergedTask2.get(key) || [];
    target.push(...(cards || []));
    mergedTask2.set(key, target);
  }
}
for (const [key, cards] of mergedTask2) {
  const parts = key.split("/");
  // Keys use ielts/writing/task-2/<essay-type>/<deck>.  Reading parts[2]
  // collapsed every Task 2 deck into a single "task-2" section.
  const type = parts[3] || "direct-question";
  const [sectionLabel, sectionZh] = sectionLabels[type] || [titleCase(type), ""];
  addDeck({
    id: `ielts-t2-${hash(key)}`,
    libraryId: "ielts",
    groupId: "ielts-task2",
    sectionId: `ielts-t2-${type}`,
    sectionLabel,
    sectionZh,
    label: cleanSource(cards?.[0]?.source) || titleCase(parts.at(-1)),
    sourceKey: key,
    cards
  });
}

const dse = context.window.EDMUND_DSE_LISTENING_SEED || {};
for (const [key, cards] of Object.entries(dse)) {
  if (!key.startsWith("dse/paper-3/part-a-listening/")) continue;
  const parts = key.split("/");
  const yearToken = parts[4] || "other";
  const yearMatch = yearToken.match(/20\d{2}/);
  const year = yearMatch?.[0] || titleCase(yearToken);
  addDeck({
    id: `dse-p3a-${hash(key)}`,
    libraryId: "dse",
    groupId: "dse-paper3-part-a",
    sectionId: `dse-p3a-${year}`,
    sectionLabel: year,
    sectionZh: `${year} 年`,
    label: cleanSource(cards?.[0]?.source) || titleCase(parts.at(-1)),
    sourceKey: key,
    cards
  });
}

decks.sort((a, b) => a.libraryId.localeCompare(b.libraryId) || a.groupId.localeCompare(b.groupId)
  || a.sectionLabel.localeCompare(b.sectionLabel, "en", { numeric: true }) || a.label.localeCompare(b.label, "en", { numeric: true }));
const entries = [...entryMap.values()].sort((a, b) => a.libraryId.localeCompare(b.libraryId) || a.word.localeCompare(b.word, "en", { sensitivity: "base" }));
const catalog = {
  version: "2026-11-17",
  generatedFrom: sourceFiles,
  libraries,
  decks,
  entries,
  counts: {
    decks: decks.length,
    entries: entries.length,
    ieltsTask1Decks: decks.filter((deck) => deck.groupId === "ielts-task1").length,
    ieltsTask2Decks: decks.filter((deck) => deck.groupId === "ielts-task2").length,
    dsePartADecks: decks.filter((deck) => deck.groupId === "dse-paper3-part-a").length
  }
};

const output = `/* Generated by tools/build-spelling-selection-catalog.mjs. Exact flashcard glossary text; do not hand-edit. */\nwindow.SPELLING_SELECTION_CATALOG = ${JSON.stringify(catalog)};\n`;
fs.writeFileSync(path.join(root, "spelling-selection-catalog.js"), output);
console.log(JSON.stringify(catalog.counts, null, 2));
