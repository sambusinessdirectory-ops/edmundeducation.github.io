import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const b1 = read("paper3/2026-b1/index.html");
const b2 = read("paper3/2026-b2/index.html");
const sharedJs = read("paper3/2026-reader-v2.js");
const sharedCss = read("paper3/2026-reader-v2.css");
const b1Record = JSON.parse(read("paper3/2026-b1/source-record.json"));
const b2Record = JSON.parse(read("paper3/2026-b2/source-record.json"));
const b1Proof = JSON.parse(read("paper3/2026-b1/audit/page-verification.json"));
const b2Proof = JSON.parse(read("paper3/2026-b2/audit/page-verification.json"));
const b1Ledger = JSON.parse(read("paper3/2026-b1/audit/source-unit-ledger.json"));
const b2Ledger = JSON.parse(read("paper3/2026-b2/audit/source-unit-ledger.json"));
const b1Inventory = read("paper3/2026-b1/audit/source-inventory.md");
const b2Inventory = read("paper3/2026-b2/audit/source-inventory.md");
const b1Defects = read("paper3/2026-b1/audit/defect-register.md");
const b2Defects = read("paper3/2026-b2/audit/defect-register.md");
const catalogue = read("paper3/index.html");
const portalHtml = read("dse-paper3-analysis.html");
const portalJs = read("dse-paper3-analysis.js");

const pageCount = (html) => (html.match(/<section class="page" id="page-\d+"/g) || []).length;
const translationCount = (html) => (html.match(/class="translation"/g) || []).length;
const proofCount = (html) => (html.match(/class="page-proof"/g) || []).length;

assert.equal(pageCount(b1), 10, "B1 must contain 10 printed Data File pages");
assert.equal(pageCount(b2), 11, "B2 must contain 11 printed Data File pages");
assert.equal(proofCount(b1), 10, "B1 must expose one proof record per page");
assert.equal(proofCount(b2), 11, "B2 must expose one proof record per page");
assert.equal((b1.match(/class="turn-page"/g) || []).length, 4, "B1 must reproduce four continuation arrows");
assert.equal((b2.match(/class="turn-page"/g) || []).length, 4, "B2 must reproduce four continuation arrows");
assert.equal((b1.match(/class="copyright-notice"/g) || []).length, 1, "B1 must reproduce the cover copyright line");
assert.equal((b2.match(/class="copyright-notice"/g) || []).length, 1, "B2 must reproduce the cover copyright line");
assert.equal(b1Record.sha256, "785a1052ad4bc70f59489dac48ad7ca14c0e265e98317851857c415977713a64");
assert.equal(b2Record.sha256, "5675a5dfe5ac025603c3a888a4d1d69780224c48ab1729e5ef24e2b3040cd4fe");
assert.deepEqual(b1Record.printed_to_physical_page, [1,2,3,4,5,6,7,8,9,10]);
assert.deepEqual(b2Record.printed_to_physical_page, [1,11,10,9,8,7,6,5,4,3,2]);
assert.equal(b1Record.question_answer_book_supplied, false);
assert.equal(b2Record.question_answer_book_supplied, false);
assert.equal(b1Record.recording_supplied, false);
assert.equal(b2Record.recording_supplied, false);
assert.equal(b1Record.pdf_text_layer, false);
assert.equal(b2Record.pdf_text_layer, false);
assert.equal(b1Record.certification_status, "UNCERTIFIED");
assert.equal(b2Record.certification_status, "UNCERTIFIED");
assert.equal(b1Record.source_unit_ledger, "audit/source-unit-ledger.json");
assert.equal(b2Record.source_unit_ledger, "audit/source-unit-ledger.json");
assert.equal(b1Record.source_unit_count, 324);
assert.equal(b2Record.source_unit_count, 353);
assert.equal(b1Proof.pages.length, 10);
assert.equal(b2Proof.pages.length, 11);
assert.deepEqual(b1Proof.pages.map((page) => page.physical), [1,2,3,4,5,6,7,8,9,10]);
assert.deepEqual(b2Proof.pages.map((page) => page.physical), [1,11,10,9,8,7,6,5,4,3,2]);
assert.equal(b1Proof.independent_reviews.native_traditional_chinese, "NOT RUN");
assert.equal(b2Proof.independent_reviews.student_without_marking_scheme, "NOT RUN");

assert.equal(b1Ledger.total_text_units, 324);
assert.equal(b2Ledger.total_text_units, 353);
assert.deepEqual(b1Ledger.counts_by_printed_page, {"1":26,"2":29,"3":10,"4":41,"5":27,"6":44,"7":21,"8":25,"9":32,"10":69});
assert.deepEqual(b2Ledger.counts_by_printed_page, {"1":26,"2":33,"3":10,"4":28,"5":30,"6":41,"7":29,"8":52,"9":35,"10":38,"11":31});
assert.equal(b1Ledger.source_sha256, b1Record.sha256);
assert.equal(b2Ledger.source_sha256, b2Record.sha256);
assert.deepEqual(b1Ledger.independent_reviews, b1Proof.independent_reviews);
assert.deepEqual(b2Ledger.independent_reviews, b2Proof.independent_reviews);
assert.ok(b1Ledger.exclusions.some((item) => item.disposition === "excluded-private-non-source-markings"));
assert.ok(b2Ledger.exclusions.some((item) => item.disposition === "excluded-non-meaningful-scan-artifacts"));
assert.ok(b1Ledger.units.some((unit) => unit.exact_excerpt === "Go on to the next page"));
assert.ok(b2Ledger.units.some((unit) => unit.exact_excerpt === "Transcript of telephone call between Powerful Pest Controllers and Agnes Yip"));

assert.equal(b2Record.public_source_scan, null, "B2 scan must remain private unless public-release provenance is established");
assert.equal(b1Record.public_source_scan, null, "Marked B1 scan must not be published");

for (const [name, html, minimumTranslations] of [["B1", b1, 35], ["B2", b2, 60]]) {
  assert.match(html, /<html lang="zh-Hant">/, `${name} must declare Traditional Chinese`);
  assert.ok(translationCount(html) >= minimumTranslations, `${name} must provide substantial inline Chinese support`);
  assert.match(html, /data-save=/, `${name} must expose editable, persistent fields`);
  assert.match(html, /data-print/, `${name} must expose print support`);
  assert.match(html, /data-reset/, `${name} must expose scoped state reset`);
  assert.match(html, /data-filter-status/, `${name} must announce filter results`);
  assert.match(html, /data-save-status/, `${name} must announce save state`);
  assert.match(html, /2026-reader-v2\.css/, `${name} must use the rebuilt stylesheet`);
  assert.match(html, /2026-reader-v2\.js/, `${name} must use the rebuilt interaction layer`);
  assert.doesNotMatch(html, /2026-reader\.css\?/, `${name} must not use the superseded stylesheet`);
  assert.doesNotMatch(html, /2026-reader\.js\?/, `${name} must not use the superseded interaction layer`);
  assert.doesNotMatch(html, /(?:src|url)=["'][^"']*page-\d+\.(?:png|jpe?g)/i, `${name} must not publish page scans as the reader`);
  assert.match(html, /(?:答題簿|Question-Answer Book).*(?:沒有|未).*(?:提供|隨檔)|(?:沒有|未).*(?:提供|隨檔).*(?:答題簿|Question-Answer Book)/s, `${name} must disclose the missing QAB`);
  assert.match(html, /錄音.*(?:沒有|未).*(?:提供|隨檔)|(?:沒有|未).*(?:提供|隨檔).*錄音/s, `${name} must disclose the missing recording`);
}

for (let page = 1; page <= 10; page += 1) {
  assert.ok(b1.includes(`2026-DSE-ENG LANG 3-B1-DF-${page}`), `B1 missing printed paper code for page ${page}`);
}
for (let page = 1; page <= 11; page += 1) {
  assert.ok(b2.includes(`2026-DSE-ENG LANG 3-B2-DF-${page}`), `B2 missing printed paper code for page ${page}`);
}

for (const phrase of ["Trending Hong Kong", "73%", "12%", "15%", "WhatsApp conversation", "Outside Speakers for Library Events"]) {
  assert.ok(b1.includes(phrase), `B1 missing source detail: ${phrase}`);
}
for (const phrase of ["Library Search", "all 12 questions", "five runners-up", "Saturday, 18 April", "Green Paradise", "&lt; $50", "&gt; $200"]) {
  assert.ok(b1.includes(phrase), `B1 missing reconciled source unit: ${phrase}`);
}
for (const phrase of ["Hong Kong Examinations and Assessment Authority", "All Rights Reserved 2026", "Go on to the next page", "<em>Trending Hong Kong</em> online article"]) {
  assert.ok(b1.includes(phrase), `B1 missing completion-audit source unit: ${phrase}`);
}
for (const phrase of ["Tom Yengi", "Teckniti Consultants", "54%", "33%", "13%", "91%", "82%", "Powerful Pest Controllers", "THIS IS THE LAST PAGE"]) {
  assert.ok(b2.includes(phrase), `B2 missing source detail: ${phrase}`);
}
for (const phrase of ["140 attendees", "Ainu and Ryukyuan Peoples", "DickensTech", "around 500 books", "books in 7 languages", "At least 48 hours", "Completed Duties Log"]) {
  assert.ok(b2.includes(phrase), `B2 missing reconciled source unit: ${phrase}`);
}
for (const phrase of ["Hong Kong Examinations and Assessment Authority", "All Rights Reserved 2026", "Go on to the next page", "Email thread: Teckniti Consultants and Thomas Chan", "Transcript of telephone call between Powerful Pest Controllers and Agnes Yip"]) {
  assert.ok(b2.includes(phrase), `B2 missing completion-audit source unit: ${phrase}`);
}

for (const [name, html, sourceClasses] of [
  ["B1", b1, ["email", "dialogue", "article-box", "pie-wrap", "chat", "table-scroll"]],
  ["B2", b2, ["email", "article-box", "forum", "chart-set", "comments", "dialogue", "chat"]],
]) {
  for (const className of sourceClasses) {
    assert.match(html, new RegExp(`class="[^"]*${className}`), `${name} missing source-specific ${className} layout`);
  }
}

assert.match(b1, /data-tags="paper visual"/);
assert.match(b2, /data-tags="paper visual"/);
assert.doesNotMatch(b2, /source\/2026-dse-paper3-b2-data-file\.pdf/);
assert.doesNotMatch(b1, /source\/2026-dse-paper3-b1-data-file\.pdf/);

for (const [name, inventory, defects] of [["B1", b1Inventory, b1Defects], ["B2", b2Inventory, b2Defects]]) {
  assert.match(inventory, /Provenance-labelled source inventory/);
  assert.match(inventory, /Question-Answer Book[\s\S]*\*\*MISSING\*\*/);
  assert.match(inventory, /Official recording tapescript[\s\S]*\*\*MISSING\*\*/);
  assert.match(inventory, /Official marking information[\s\S]*\*\*MISSING\*\*/);
  assert.match(inventory, /Native Traditional Chinese reader review: `NOT RUN`/);
  assert.match(inventory, /Certification state: `UNCERTIFIED`/);
  assert.match(defects, /unit-level defect\/change register/);
  assert.match(defects, /Status before rebuild: \*\*OPEN\*\*/);
  assert.ok(defects.includes(`${name}-D10`), `${name} defect register must cover release gates`);
}

assert.match(sharedJs, /localStorage\.setItem/);
assert.match(sharedJs, /IntersectionObserver/);
assert.match(sharedJs, /window\.print/);
assert.match(sharedJs, /legacyStorageKey/);
assert.match(sharedJs, /window\.confirm/);
assert.match(sharedJs, /beforeprint/);
assert.match(sharedJs, /afterprint/);
assert.match(sharedCss, /@media\s*\(max-width:/);
assert.match(sharedCss, /@media\s+print/);
assert.match(sharedCss, /@page\s*\{/);
assert.match(sharedCss, /\.email\s*\{/);
assert.match(sharedCss, /\.chat\s*\{/);
assert.match(sharedCss, /\.bars\s*\{/);

for (const route of ["/paper3/2026-b1/", "/paper3/2026-b2/"]) {
  assert.ok(catalogue.includes(route), `Catalogue missing ${route}`);
  assert.ok(portalHtml.includes(route), `Portal hero missing ${route}`);
  assert.ok(portalJs.includes(route), `Portal routing missing ${route}`);
}
assert.match(catalogue, /目前可開啟 28 份/);
assert.match(portalHtml, /28 份教材/);
assert.match(portalHtml, /dse-paper3-analysis\.js\?v=20261112-2026readers1/);

console.log("2026 DSE Paper 3 B1/B2 reader validation passed.");
