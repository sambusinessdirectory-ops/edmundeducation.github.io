import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const repository = new URL("../", import.meta.url);
const dataSource = readFileSync(new URL("dse-speaking-data.js", repository), "utf8");
const modeSource = readFileSync(new URL("dse-speaking-mode.js", repository), "utf8");
const appSource = readFileSync(new URL("speaking-system.js", repository), "utf8");
const htmlSource = readFileSync(new URL("speaking-system.html", repository), "utf8");

const context = {
  window: {},
  Date,
  JSON,
  Math,
  Map,
  Object,
  Number,
  String,
  Array,
  RangeError,
  Error,
  Uint32Array,
  crypto: {
    randomUUID: () => "00000000-0000-4000-8000-000000000001",
    getRandomValues: values => { values[0] = 0; return values; }
  }
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(dataSource, context, { filename: "dse-speaking-data.js" });
vm.runInContext(modeSource, context, { filename: "dse-speaking-mode.js" });

const data = context.window.EDMUND_DSE_SPEAKING_DATA;
const mode = context.window.EDMUND_DSE_SPEAKING_MODE;
assert.deepEqual(Array.from(data.years), Array.from({ length: 14 }, (_, index) => 2012 + index));
assert.equal(data.sets.length, 227);
assert.deepEqual(Object.fromEntries(data.years.map(year => [year, data.catalog[year]?.length || 0])), {
  2012: 18, 2013: 30, 2014: 29, 2015: 27, 2016: 27, 2017: 24,
  2018: 24, 2019: 24, 2020: 0, 2021: 0, 2022: 0, 2023: 24, 2024: 0, 2025: 0
});

for (const set of data.sets) {
  assert.equal(set.groupDiscussion.length, 3, `${set.year} ${set.set} should have three Group Discussion points`);
  assert.ok(set.individualResponse.length >= 8 && set.individualResponse.length <= 10, `${set.year} ${set.set} should have 8-10 Individual Response questions`);
  assert.ok(set.sourceText.length >= 60, `${set.year} ${set.set} should include the source text and task context`);
  assert.ok(set.title && !set.title.startsWith("DSE Speaking Set"), `${set.year} ${set.set} should have a curated title`);
  assert.equal("modelAnswer" in set, false, "DSE catalogue must not introduce model answers");
}

const tvb = data.catalog[2018].find(set => set.set === "1.2");
assert.equal(tvb.title, "The Decline and Fall of TVB?");
assert.equal(tvb.groupDiscussion[0], "why TVB was so successful in Hong Kong in the past");
assert.equal(tvb.individualResponse[7], "How important is TVB to Hong Kong culture?");
const harbour = data.catalog[2023].find(set => set.set === "8.3");
assert.equal(harbour.title, "Harbourside Concert Series");
assert.equal(harbour.groupDiscussion.length, 3);

assert.deepEqual(Array.from(mode.modes, item => item.id), ["dse-combined", "dse-group", "dse-individual"]);
assert.equal(mode.modes.some(item => /natural|examiner/i.test(`${item.label} ${item.labelZh}`)), false);
const sample = data.sets.slice(0, 2);
const combined = mode.createSession("dse-combined", sample, { now: 1_000 });
assert.equal(combined.phase, "preparation");
assert.equal(combined.prepEndsAt, 601_000);
assert.equal(combined.sourceKey, mode.sourceKey(sample[0]));
const excluded = mode.createSession("dse-group", sample, { now: 2_000, excludedKey: mode.sourceKey(sample[0]) });
assert.equal(excluded.sourceKey, mode.sourceKey(sample[1]), "the immediately previous set should be excluded when alternatives exist");
const individual = mode.createSession("dse-individual", sample, { now: 3_000 });
assert.equal(individual.phase, "individual");
assert.equal(individual.individualIndex, 0);

assert.ok(htmlSource.indexOf("dse-speaking-data.js") < htmlSource.indexOf("dse-speaking-mode.js"));
assert.ok(htmlSource.indexOf("dse-speaking-mode.js") < htmlSource.indexOf("speaking-system.js"));
for (const required of [
  "Group Discussion<br>", "Individual Response<br>", "data-dse-sort", "2012 → 2025",
  "data-dse-skip-prep", "data-dse-complete-group", "data-dse-next-individual",
  "data-dse-rating", "請選擇 1 至 7", "DSE 模式不設考官自然交流",
  "dseSourceCard", "dseIndividualCard", "renderRecorderCard()", "exam: \"DSE\""
]) assert.match(appSource, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

assert.match(appSource, /assets\/speaking-system\/ielts-exam-practice-mode\.png/);
assert.doesNotMatch(appSource, /ielts-exam-practice-mode-human-v2\.png/);

const dseModesStart = appSource.indexOf("function renderDseModes()");
const dseModesEnd = appSource.indexOf("function startDsePractice", dseModesStart);
assert.ok(dseModesStart >= 0 && dseModesEnd > dseModesStart);
assert.equal(appSource.slice(dseModesStart, dseModesEnd).includes("data-natural-exchange-toggle"), false);

console.log("DSE speaking catalogue and three-mode practice flow validation passed.");
