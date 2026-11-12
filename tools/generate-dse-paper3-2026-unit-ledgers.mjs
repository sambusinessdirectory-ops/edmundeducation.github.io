import assert from "node:assert/strict";
import fs from "node:fs";

const readers = ["2026-b1", "2026-b2"];
const checkOnly = process.argv.includes("--check");

function decodeHtml(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
    .replace(/\s+/g, " ")
    .trim();
}

function removeNonSourceContent(html) {
  return html
    .replace(/<([a-z]+) class="translation"[\s\S]*?<\/\1>/g, "")
    .replace(/<details class="page-proof"[\s\S]*?<\/details>/g, "")
    .replace(/<p class="storage-disclaimer"[\s\S]*?<\/p>/g, "")
    .replace(/<textarea[\s\S]*?<\/textarea>/g, "");
}

function pageSlices(html) {
  const starts = [...html.matchAll(/<section class="page" id="page-(\d+)"/g)].map((match) => ({
    page: Number(match[1]),
    index: match.index,
  }));
  return starts.map((entry, index) => ({
    page: entry.page,
    html: html.slice(entry.index, starts[index + 1]?.index ?? html.indexOf('<footer class="site-footer">', entry.index)),
  }));
}

function classify(excerpt) {
  if (excerpt.startsWith("©香港考試及評核局")) return "official-bilingual-legal-line";
  if (/^2026-DSE-ENG LANG 3-B[12]-DF-\d+$/.test(excerpt)) return "printed-paper-code";
  if (/^Go on to the next page$/.test(excerpt)) return "continuation-instruction";
  if (/^THIS IS THE LAST PAGE/.test(excerpt)) return "last-page-instruction";
  return "printed-text-label-or-value";
}

function buildLedger(reader) {
  const html = fs.readFileSync(`paper3/${reader}/index.html`, "utf8");
  const sourceRecord = JSON.parse(fs.readFileSync(`paper3/${reader}/source-record.json`, "utf8"));
  const proof = JSON.parse(fs.readFileSync(`paper3/${reader}/audit/page-verification.json`, "utf8"));
  const units = [];
  const countsByPage = {};

  for (const pageSlice of pageSlices(html)) {
    const sourceStart = pageSlice.html.indexOf('<div class="source-paper');
    assert.notEqual(sourceStart, -1, `${reader} page ${pageSlice.page} has no source-paper block`);
    const sourceHtml = removeNonSourceContent(pageSlice.html.slice(sourceStart));
    const excerpts = [...sourceHtml.matchAll(/>([^<>]+)</g)]
      .map((match) => decodeHtml(match[1]))
      .filter(Boolean);

    countsByPage[String(pageSlice.page)] = excerpts.length;
    excerpts.forEach((excerpt, index) => {
      units.push({
        id: `${reader}-p${String(pageSlice.page).padStart(2, "0")}-u${String(index + 1).padStart(3, "0")}`,
        printed_page: pageSlice.page,
        physical_page: sourceRecord.printed_to_physical_page[pageSlice.page - 1],
        source_order_on_page: index + 1,
        exact_excerpt: excerpt,
        unit_kind: classify(excerpt),
        disposition: "learner-facing-native-text",
      });
    });
  }

  const exclusions = reader === "2026-b1"
    ? [
        {
          pages: [3,4,5,6,7,8,9,10],
          content: "candidate handwriting, underlining and personal emphasis",
          disposition: "excluded-private-non-source-markings",
          reason: "The markings are not part of the printed candidate-visible Data File and must not be represented as official content.",
        },
        {
          pages: [1,2,3,4,5,6,7,8,9,10],
          content: "scan punch holes, crop shadows, registration marks and paper distortion",
          disposition: "excluded-non-meaningful-scan-artifacts",
          reason: "These physical capture artifacts do not encode learner-facing source meaning.",
        },
      ]
    : [
        {
          pages: [1,2,3,4,5,6,7,8,9,10,11],
          content: "scan punch holes, crop shadows, registration marks and paper distortion",
          disposition: "excluded-non-meaningful-scan-artifacts",
          reason: "These physical capture artifacts do not encode learner-facing source meaning.",
        },
      ];

  return {
    reader,
    status: "machine-reconciled-operator-checked-uncertified",
    source_sha256: sourceRecord.sha256,
    printed_to_physical_page: sourceRecord.printed_to_physical_page,
    generation_rule: "Every non-empty native text fragment inside each .source-paper block, excluding Chinese learning-aid translations, editable user input, storage notices and verification UI, is recorded in DOM/source order.",
    visual_unit_evidence: "See audit/page-verification.json verified_units for layout, chart, table, bubble-direction, email-chrome and continuation-arrow relationships.",
    counts_by_printed_page: countsByPage,
    total_text_units: units.length,
    units,
    exclusions,
    independent_reviews: proof.independent_reviews,
  };
}

for (const reader of readers) {
  const path = `paper3/${reader}/audit/source-unit-ledger.json`;
  const rendered = `${JSON.stringify(buildLedger(reader), null, 2)}\n`;
  if (checkOnly) {
    assert.equal(fs.readFileSync(path, "utf8"), rendered, `${reader} source-unit ledger is stale`);
  } else {
    fs.writeFileSync(path, rendered);
  }
}

console.log(checkOnly ? "2026 source-unit ledgers are current." : "2026 source-unit ledgers generated.");
