#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataFile = "flashcards-hkfsd-concept-vocabulary-book1-data.js";
const dataSource = fs.readFileSync(path.join(root, dataFile), "utf8");
const html = fs.readFileSync(path.join(root, "flashcards.html"), "utf8");
const generator = fs.readFileSync(path.join(root, "tools/generate-flashcard-audio.py"), "utf8");
const homeworkGenerator = fs.readFileSync(path.join(root, "tools/generate-homework-resource-catalog.mjs"), "utf8");
const homeworkCatalog = fs.readFileSync(path.join(root, "homework-resource-catalog.mjs"), "utf8");
const manifestSource = fs.readFileSync(path.join(root, "flashcards-audio-manifest.js"), "utf8");
const prefix = "government/hkfsd/concept-vocabulary/book-1";

const expected = [
  ["a-core-fire-service-emergency-fundamentals", "A. Core Fire Service & Emergency Fundamentals", "消防及緊急應變基本詞彙", "Flash Card - Book 1 - A. Core Fire Service & Emergency Fundamentals 消防及緊急應變基本詞彙.pdf"],
  ["b-fire-station-personnel-duty", "B. Fire Station, Personnel & Duty", "消防局、人員及值勤", "Flash Card - Book 1 - B. Fire Station, Personnel & Duty 消防局、人員及值勤.pdf"],
  ["c-ppe-breathing-apparatus", "C. PPE & Breathing Apparatus", "個人防護裝備及呼吸器", "Flash Card - Book 1 - C. PPE & Breathing Apparatus 個人防護裝備及呼吸器.pdf"],
  ["d-fire-appliances-emergency-vehicles", "D. Fire Appliances & Emergency Vehicles", "消防車輛及緊急車輛", "Flash Card - Book 1 - D. Fire Appliances & Emergency Vehicles 消防車輛及緊急車輛.pdf"],
  ["e-firefighting-tools-equipment", "E. Firefighting Tools & Equipment", "滅火工具及器材", "Flash Card - Book 1- E. Firefighting Tools & Equipment 滅火工具及器材.pdf"],
  ["f-hoses-hydrants-pumps-water-supply", "F. Hoses, Hydrants, Pumps & Water Supply", "消防喉、消防栓、消防泵及供水", "Flash Card - Book 1 -  F. Hoses, Hydrants, Pumps & Water Supply 消防喉、消防栓、消防泵及供水.pdf"],
  ["g-fire-heat-smoke-basic-fire-behaviour", "G. Fire, Heat, Smoke & Basic Fire Behaviour", "火、熱、煙及基本火災行為", "Flash Card - Book 1 - G. Fire, Heat, Smoke & Basic Fire Behaviour 火、熱、煙及基本火災行為.pdf"],
  ["h-buildings-fire-protection-fire-safety", "H. Buildings, Fire Protection & Fire Safety", "樓宇、防火系統及消防安全", "Flash Card - Book 1 - H. Buildings, Fire Protection & Fire Safety 樓宇、防火系統及消防安全.pdf"],
  ["i-fireground-operations-basic-tactics", "I. Fireground Operations & Basic Tactics", "火場行動及基本戰術", "Flash Card - Book 1 - I. Fireground Operations & Basic Tactics 火場行動及基本戰術.pdf"],
  ["j-search-rescue-casualty-handling", "J. Search, Rescue & Casualty Handling", "搜索、救援及傷者處理", "Flash Card - Book 1 - J. Search, Rescue & Casualty Handling 搜索、救援及傷者處理.pdf"],
  ["k-road-traffic-railway-rescue", "K. Road Traffic & Railway Rescue", "道路交通及鐵路救援", "Flash Card - Book 1 - K. Road Traffic & Railway Rescue 道路交通及鐵路救援.pdf"],
  ["l-ambulance-first-aid-medical-response", "L. Ambulance, First Aid & Medical Response", "救護、急救及醫療應變", "Flash Card - Book 1 - L. Ambulance, First Aid & Medical Response 救護、急救及醫療應變.pdf"],
  ["m-communications-mobilising-incident-command", "M. Communications, Mobilising & Incident Command", "通訊、調派及事故指揮", "Flash Card - Book 1 - M. Communications, Mobilising & Incident Command 通訊、調派及事故指揮.pdf"],
  ["n-hazardous-materials-chemical-safety", "N. Hazardous Materials & Chemical Safety", "危險品及化學安全", "Flash Card - Book 1- N. Hazardous Materials & Chemical Safety 危險品及化學安全.pdf"]
].map(([slug, titleEn, titleZh, source]) => ({
  slug,
  titleEn,
  titleZh,
  source,
  deckId: `${prefix}/${slug}`
}));

function normalizeCardText(value) {
  return String(value || "")
    .replace(/[\u2018\u2019\u02bc\u02bb\uff07]/g, "'")
    .replace(/([A-Za-z])\s+'\s*([A-Za-z])/g, "$1'$2")
    .replace(/([A-Za-z])'\s+(s|t|re|ve|ll|d|m)\b/gi, "$1'$2")
    .trim();
}

const dataSandbox = { window: {} };
vm.runInNewContext(dataSource, dataSandbox, { filename: dataFile, timeout: 20_000 });
const seed = dataSandbox.window.EDMUND_HKFSD_CONCEPT_VOCABULARY_BOOK1_SEED;
assert.ok(seed && typeof seed === "object", "Missing HKFSD Book 1 seed");
assert.deepEqual(Object.keys(seed), expected.map(item => item.deckId), "HKFSD A-N deck order changed");
assert.deepEqual(Object.keys(dataSandbox.window.EDMUND_FLASHCARD_SEED || {}), expected.map(item => item.deckId), "HKFSD seed was not merged into the main seed");

const audioSandbox = { window: {} };
vm.runInNewContext(manifestSource, audioSandbox, { filename: "flashcards-audio-manifest.js", timeout: 20_000 });
const audioManifest = audioSandbox.window.EDMUND_FLASHCARD_AUDIO;
const audioMeta = audioSandbox.window.EDMUND_FLASHCARD_AUDIO_META;

let cardCount = 0;
let exampleCount = 0;
const globalFrontCounts = new Map();
for (const item of expected) {
  const cards = seed[item.deckId];
  assert.ok(Array.isArray(cards), `Missing deck ${item.deckId}`);
  assert.equal(cards.length, 40, `${item.deckId}: expected 40 cards`);
  const withinDeck = new Set();
  const pages = new Set();
  cards.forEach((card, index) => {
    const label = `${item.deckId} card ${index + 1}`;
    assert.ok(String(card.front || "").trim(), `${label}: blank front`);
    assert.ok(String(card.meaning || "").trim(), `${label}: blank meaning`);
    assert.match(card.meaning, /[\u3400-\u9fff]/u, `${label}: meaning is not Chinese`);
    assert.equal(card.source, item.source, `${label}: source filename changed`);
    assert.ok(Number.isInteger(card.sourcePage) && card.sourcePage >= 1 && card.sourcePage <= 4, `${label}: invalid source page`);
    pages.add(card.sourcePage);
    assert.ok(Array.isArray(card.examples), `${label}: examples missing`);
    assert.equal(card.examples.length, 5, `${label}: expected five bilingual examples`);
    card.examples.forEach((example, exampleIndex) => {
      assert.ok(String(example?.en || "").trim(), `${label}: blank English example ${exampleIndex + 1}`);
      assert.match(String(example?.zh || ""), /[\u3400-\u9fff]/u, `${label}: Chinese example ${exampleIndex + 1} has no Chinese`);
    });
    const front = normalizeCardText(card.front);
    const localKey = front.toLocaleLowerCase("en");
    assert.equal(withinDeck.has(localKey), false, `${item.deckId}: duplicate front ${front}`);
    withinDeck.add(localKey);
    globalFrontCounts.set(front, (globalFrontCounts.get(front) || 0) + 1);
    const audioUrl = audioManifest?.[front];
    assert.ok(audioUrl, `${label}: missing Kokoro audio mapping`);
    if (!audioUrl.startsWith("https://")) {
      const audioPath = path.join(root, audioUrl);
      assert.ok(fs.existsSync(audioPath), `${label}: local audio file is missing`);
      assert.ok(fs.statSync(audioPath).size > 1000, `${label}: local audio file is too small`);
    }
    exampleCount += card.examples.length;
  });
  assert.deepEqual([...pages].sort((a, b) => a - b), [1, 2, 3, 4], `${item.deckId}: incomplete page coverage`);
  assert.ok(html.includes(item.slug), `${item.deckId}: navigation slug is missing`);
  assert.ok(html.includes(item.titleEn), `${item.deckId}: English title is missing`);
  assert.ok(html.includes(item.titleZh), `${item.deckId}: Chinese title is missing`);
  assert.ok(homeworkCatalog.includes(`"id": "flash:${item.deckId}"`), `${item.deckId}: Homework resource is missing`);
  assert.ok(homeworkCatalog.includes(`"label": "${item.titleEn} ${item.titleZh}"`), `${item.deckId}: Homework bilingual title is missing`);
  assert.ok(homeworkCatalog.includes(`"url": "flashcards.html?deck=${encodeURIComponent(item.deckId)}"`), `${item.deckId}: Homework deck URL is missing`);
  cardCount += cards.length;
}

assert.equal(cardCount, 560, "HKFSD Book 1 must contain 560 cards");
assert.equal(exampleCount, 2800, "HKFSD Book 1 must contain 2,800 bilingual example pairs");
assert.equal(globalFrontCounts.size, 542, "HKFSD Book 1 unique-front inventory changed");
assert.equal([...globalFrontCounts.values()].filter(count => count > 1).length, 16, "HKFSD cross-deck duplicate-front inventory changed");
assert.equal(audioMeta?.complete, true, "Kokoro audio manifest is incomplete");
assert.ok(audioMeta?.count >= 136333, `Expected at least 136333 mappings; found ${audioMeta?.count}`);
assert.equal(audioMeta?.voice, "af_heart", "HKFSD audio must use the established Kokoro voice");

assert.match(html, /<script src="flashcards-hkfsd-concept-vocabulary-book1-data\.js\?v=20260818-1"><\/script>/, "HKFSD data file is not loaded");
assert.match(html, /<script src="flashcards-audio-manifest\.js\?v=edmund-neural-v1-20260818-2"><\/script>/, "Kokoro cache pin is stale");
assert.ok(html.includes('routeOptionButton("HKFSD", "government-hkfsd", "government/hkfsd")'), "HKFSD is not a routed hierarchy");
assert.ok(html.includes('route === "government-hkfsd-concept-vocabulary"'), "HKFSD concept-vocabulary route is missing");
assert.ok(html.includes('route === "government-hkfsd-concept-vocabulary-book-1"'), "HKFSD Book 1 route is missing");
assert.ok(html.includes('addAggregate(typeId, "政府機構 / HKFSD", 2)'), "HKFSD search aggregate is missing");
assert.ok(generator.includes('"flashcards-hkfsd-concept-vocabulary-book1-data.js"'), "Audio generator does not ingest HKFSD Book 1");
assert.ok(generator.includes('"window.EDMUND_HKFSD_CONCEPT_VOCABULARY_BOOK1_SEED = "'), "Audio generator assignment is missing");
assert.ok(homeworkGenerator.includes('["hkfsd", "HKFSD"]'), "Homework generator does not preserve the HKFSD acronym");
assert.equal((homeworkCatalog.match(/"id": "flash:government\/hkfsd\/concept-vocabulary\/book-1\//g) || []).length, 14, "Homework must expose exactly 14 HKFSD Book 1 resources");

console.log(JSON.stringify({
  decks: expected.length,
  cards: cardCount,
  uniqueFronts: globalFrontCounts.size,
  bilingualExamples: exampleCount,
  audioMappings: audioMeta.count
}, null, 2));
