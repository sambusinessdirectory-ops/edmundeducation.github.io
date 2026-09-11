import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import vm from "node:vm";
const root = new URL("../", import.meta.url);
const read = name => readFileSync(new URL(name, root), "utf8");
const context = vm.createContext({ window: {}, console });
for (const file of ["dse-speaking-data.js", "dse-speaking-paper-supplement.js", "dse-speaking-paper-manifest.js", "dse-speaking-source-layouts.js", "dse-speaking-source.js"]) {
  vm.runInContext(read(file), context, { filename: file });
}
const sets = [...context.window.EDMUND_DSE_SPEAKING_DATA.sets, ...context.window.EDMUND_DSE_SPEAKING_SUPPLEMENT.sets];
const layouts = context.window.EDMUND_DSE_SPEAKING_SOURCE_LAYOUTS;
const source = context.window.EDMUND_DSE_SPEAKING_SOURCE;
const setFor = key => sets.find(set => set.year + ":" + set.set === key);
const segments = key => source.segmentsFor(setFor(key));
assert.equal(sets.length, 282);
assert.equal(Object.keys(layouts).length, 282);
assert.equal(new Set(sets.map(set => set.year)).size, 11);
for (const set of sets) {
  const key = set.year + ":" + set.set, layout = layouts[key];
  assert.ok(layout, key);
  assert.equal(layout.sourceSha256, createHash("sha256").update(set.sourceText).digest("hex"), key + ": source changed; review its PDF layout");
  const paper = set.paperPages || context.window.EDMUND_DSE_SPEAKING_PAPERS[key];
  assert.equal(layout.paper, paper.student, key + ": wrong source page");
  assert.ok(layout.segments.length >= 3 || layout.segments.some(s => s.items?.length > 1), key + ": flattened source");
  assert.equal(layout.segments.at(-1).type, "task", key);
  for (const s of layout.segments) {
    assert.ok(["paragraph", "heading", "numbered", "bulleted", "table", "task"].includes(s.type), key);
    if (s.type === "table") {
      assert.ok(s.caption && s.columns.length >= 2 && s.rows.length);
      assert.ok(s.rows.every(row => row.length === s.columns.length && row.every(Boolean)));
    } else if (s.items) assert.ok(s.items.length && s.items.every(item => item.trim()));
    else assert.ok(s.text.trim(), key);
  }
  assert.ok(!source.textParts(layout.segments).some(text => /Text not available|You may want to (?:talk about|discuss):/.test(text)), key + ": task/list spill");
}
assert.equal(segments("2012:1.2").filter(s => s.type === "paragraph").length, 3);
assert.match(segments("2012:1.2")[1].text, /website\. However,/);
assert.equal(segments("2012:1.3").filter(s => s.type === "paragraph").length, 3);
assert.equal(segments("2014:3.2").find(s => s.items).items.length, 10);
assert.equal(segments("2013:10.2").find(s => s.items).items.length, 4);
assert.equal(segments("2023:6.2").filter(s => s.type === "paragraph").length, 11);
assert.match(segments("2018:8.1")[0].text, /^Animal-assisted therapy was/);
assert.ok(!source.textParts(segments("2016:7.3")).join(" ").includes("emoticon as Word"));
assert.equal(segments("2024:3.3").filter(s => s.type === "paragraph").length, 7);
assert.equal(segments("2024:6.3").find(s => s.type === "table").rows.length, 4);
assert.equal(segments("2013:8.1").filter(s => s.type === "table").length, 5);
assert.equal(source.segmentsFor({sourceText: "First paragraph.\n\nHowever, a separate paragraph."}).length, 2);

const app = read("speaking-system.js");
const html = read("speaking-system.html");
assert.ok(html.indexOf('src="dse-speaking-source.js?') < html.indexOf('src="speaking-system.js?'));
assert.ok(html.indexOf('src="dse-speaking-source-layouts.js?') < html.indexOf('src="speaking-system.js?'));
vm.runInContext(app.match(/  const WORD_PATTERN = .+;/)[0] + app.match(/  const IS_WORD_PATTERN = .+;/)[0] +
  "const DSE_SOURCE = window.EDMUND_DSE_SPEAKING_SOURCE; const state = { dseWordBookmarks: new Set() };" +
  app.slice(app.indexOf("  function escapeHtml("), app.indexOf("  function safeFilePart(")) +
  app.slice(app.indexOf("  function dseLegacySourceSegments("), app.indexOf("  function dseNativePaperMarkup(")), context);
for (const set of sets) {
  const key = set.year + ":" + set.set;
  const native = context.dseNativeSourceMarkup(set);
  const plain = context.dsePlainSourceMarkup(set);
  const paragraphs = segments(key).filter(s => s.type === "paragraph" || s.type === "task").length;
  assert.equal((native.match(/<p /g) || []).length, paragraphs, key);
  assert.equal((plain.match(/<p /g) || []).length, paragraphs, key);
  assert.ok(native.includes("data-dse-word-key"), key);
  assert.ok(!native.includes('data-dse-word-key="undefined"'), key);
  const keys = [...native.matchAll(/data-dse-word-key="([^"]+)"/g)].map(m => m[1]);
  assert.equal(new Set(keys).size, keys.length, key + ": duplicate bookmark keys");
}
const moon = setFor("2012:1.2");
const oldSegments = context.dseLegacySourceSegments(moon.sourceText, moon.title);
const oldKeys = source.bookmarkKeys(oldSegments, oldSegments, "2012:1.2");
const newKeys = new Set(source.bookmarkKeys(oldSegments, segments("2012:1.2"), "2012:1.2"));
assert.ok(oldKeys.every(key => newKeys.has(key)), "existing bookmarks survive paragraph changes");
const injection = { year: 9999, set: "1", sourceText: '<script>alert("unsafe")</script>\n\nSafe second paragraph.' };
assert.ok(!context.dsePlainSourceMarkup(injection).includes("<script>"));
assert.match(context.dsePlainSourceMarkup(injection), /&lt;script&gt;/);
const preview = process.argv.find(arg => arg.startsWith("--preview="))?.slice(10);
if (preview) {
  const examples = ["2012:1.2", "2014:3.2", "2018:4.1", "2024:3.3", "2024:6.3", "2025:1.2"];
  writeFileSync(preview, '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/speaking-system.css"><title>DSE source layout review</title><style>body{margin:0;background:#eee}.preview{max-width:1000px;margin:auto;padding:24px}select{font:inherit;padding:10px;max-width:100%}article{background:white;padding:24px;margin:24px 0}article[hidden]{display:none}</style><main class="preview"><label>Reference paper <select onchange="document.querySelectorAll(\'article\').forEach(a=>a.hidden=a.id!==this.value)">'+examples.map(key=>'<option>'+key+'</option>').join("")+'</select></label>'+examples.map((key,i)=>'<article id="'+key+'" '+(i?'hidden':'')+'><h2>'+key+' — '+setFor(key).title+'</h2><div class="dse-native-source">'+context.dseNativeSourceMarkup(setFor(key))+'</div></article>').join("")+'</main>');
}
console.log("All 282 DSE source layouts, both renderers, tables, lists and bookmark preservation passed.");
