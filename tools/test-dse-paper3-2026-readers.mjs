import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const b1 = read("paper3/2026-b1/index.html");
const b2 = read("paper3/2026-b2/index.html");
const sharedJs = read("paper3/2026-reader.js");
const sharedCss = read("paper3/2026-reader.css");
const b1Record = JSON.parse(read("paper3/2026-b1/source-record.json"));
const b2Record = JSON.parse(read("paper3/2026-b2/source-record.json"));
const catalogue = read("paper3/index.html");
const portalHtml = read("dse-paper3-analysis.html");
const portalJs = read("dse-paper3-analysis.js");

const pageCount = (html) => (html.match(/<section class="page" id="page-\d+"/g) || []).length;
const translationCount = (html) => (html.match(/class="translation"/g) || []).length;

assert.equal(pageCount(b1), 10, "B1 must contain 10 printed Data File pages");
assert.equal(pageCount(b2), 11, "B2 must contain 11 printed Data File pages");
assert.equal(b1Record.sha256, "785a1052ad4bc70f59489dac48ad7ca14c0e265e98317851857c415977713a64");
assert.equal(b2Record.sha256, "5675a5dfe5ac025603c3a888a4d1d69780224c48ab1729e5ef24e2b3040cd4fe");
assert.deepEqual(b1Record.printed_to_physical_page, [1,2,3,4,5,6,7,8,9,10]);
assert.deepEqual(b2Record.printed_to_physical_page, [1,11,10,9,8,7,6,5,4,3,2]);
assert.equal(b1Record.question_answer_book_supplied, false);
assert.equal(b2Record.question_answer_book_supplied, false);
assert.equal(b1Record.recording_supplied, false);
assert.equal(b2Record.recording_supplied, false);

for (const [name, html, minimumTranslations] of [["B1", b1, 35], ["B2", b2, 60]]) {
  assert.match(html, /<html lang="zh-Hant">/, `${name} must declare Traditional Chinese`);
  assert.ok(translationCount(html) >= minimumTranslations, `${name} must provide substantial inline Chinese support`);
  assert.match(html, /data-save=/, `${name} must expose editable, persistent fields`);
  assert.match(html, /data-print/, `${name} must expose print support`);
  assert.doesNotMatch(html, /(?:src|url)=["'][^"']*page-\d+\.(?:png|jpe?g)/i, `${name} must not publish page scans as the reader`);
  assert.match(html, /(?:答題簿|Question-Answer Book).*(?:沒有|未).*(?:提供|隨檔)|(?:沒有|未).*(?:提供|隨檔).*(?:答題簿|Question-Answer Book)/s, `${name} must disclose the missing QAB`);
  assert.match(html, /錄音.*(?:沒有|未).*(?:提供|隨檔)|(?:沒有|未).*(?:提供|隨檔).*錄音/s, `${name} must disclose the missing recording`);
}

for (const phrase of ["Trending Hong Kong", "73%", "12%", "15%", "WhatsApp conversation", "Outside Speakers for Library Events"]) {
  assert.ok(b1.includes(phrase), `B1 missing source detail: ${phrase}`);
}
for (const phrase of ["Tom Yengi", "Teckniti Consultants", "54%", "33%", "13%", "91%", "82%", "Powerful Pest Controllers", "THIS IS THE LAST PAGE"]) {
  assert.ok(b2.includes(phrase), `B2 missing source detail: ${phrase}`);
}

assert.match(sharedJs, /localStorage\.setItem/);
assert.match(sharedJs, /IntersectionObserver/);
assert.match(sharedJs, /window\.print/);
assert.match(sharedCss, /@media\s*\(max-width:/);
assert.match(sharedCss, /@media\s+print/);

for (const route of ["/paper3/2026-b1/", "/paper3/2026-b2/"]) {
  assert.ok(catalogue.includes(route), `Catalogue missing ${route}`);
  assert.ok(portalHtml.includes(route), `Portal hero missing ${route}`);
  assert.ok(portalJs.includes(route), `Portal routing missing ${route}`);
}
assert.match(catalogue, /目前可開啟 28 份/);
assert.match(portalHtml, /28 份教材/);
assert.match(portalHtml, /dse-paper3-analysis\.js\?v=20261112-2026readers1/);

console.log("2026 DSE Paper 3 B1/B2 reader validation passed.");
