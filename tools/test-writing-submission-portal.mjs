import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  completedWritingSegments,
  countEnglishWords,
  newlyCompletedWritingSegments
} from "../writing-submission-core.js";

const root = path.resolve(import.meta.dirname, "..");
const html = fs.readFileSync(path.join(root, "writing-submission.html"), "utf8");
const css = fs.readFileSync(path.join(root, "writing-submission.css"), "utf8");
const script = fs.readFileSync(path.join(root, "writing-submission.js"), "utf8");
const config = fs.readFileSync(path.join(root, "writing-submission-config.js"), "utf8");
const serviceWorker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");

test("writing grammar checks begin only after newly completed full stops or semicolons", () => {
  assert.deepEqual(newlyCompletedWritingSegments("", "I am still writing"), []);
  assert.deepEqual(
    newlyCompletedWritingSegments("I am still writing", "I am still writing."),
    [{ start: 0, end: 19, text: "I am still writing.", ordinal: 1, terminatorIndex: 18 }]
  );
  assert.equal(newlyCompletedWritingSegments("Keep going", "Keep going;")[0]?.text, "Keep going;");
  assert.equal(newlyCompletedWritingSegments("Price 3", "Price 3.5 dollars" ).length, 0);
});

test("paste checking queues every completed unit but leaves its final fragment alone", () => {
  const segments = newlyCompletedWritingSegments("", "First sentence. Second clause; unfinished words");
  assert.deepEqual(segments.map((segment) => segment.text), ["First sentence.", "Second clause;"]);
});

test("common abbreviations do not split a completed sentence", () => {
  assert.deepEqual(
    completedWritingSegments("Dr. Smith arrived. The lesson began." ).map((segment) => segment.text),
    ["Dr. Smith arrived.", "The lesson began."]
  );
});

test("word count handles repeated whitespace", () => {
  assert.equal(countEnglishWords("  Students   write\nclearly.  "), 3);
  assert.equal(countEnglishWords(""), 0);
});

test("portal exposes the requested stage-one writing, archive and grammar-log interface", () => {
  assert.match(html, /data-system="writing-submission"/);
  assert.match(html, /<h2>寫作題目<\/h2>/);
  assert.match(html, /<h2>文章內容<\/h2>/);
  assert.match(html, /我的文章/);
  assert.match(html, /我的文法問題記錄/);
  assert.match(html, /文法檢查只會在您輸入句號（\.）或分號（;）完成一句後開始/);
  assert.match(css, /--midnight:\s*#272757/i);
  assert.match(script, /newlyCompletedWritingSegments\(previousValue, nextValue\)/);
  assert.match(script, /\/v1\/grammar-occurrences\/batch/);
  assert.match(script, /\/v1\/grammar-problems/);
  assert.match(script, /method:\s*"PUT"/);
});

test("grammar history and article archives follow the deployed API contract", () => {
  assert.match(script, /payload\?\.grammarProblems/);
  assert.match(script, /payload\?\.grammarOccurrences/);
  assert.match(script, /fetchAllSubmissionPages\("\/v1\/submissions"\)/);
  assert.match(script, /fetchAllSubmissionPages\("\/v1\/admin\/submissions"/);
  assert.match(script, /localStorage\.setItem\(key, JSON\.stringify\(values\)\)/);
  assert.match(script, /flushGrammarOccurrences\(\)\.catch/);
  assert.match(script, /checkGeneration/);
});

test("Harper is self-hosted and cached as an immutable versioned runtime", () => {
  assert.match(serviceWorker, /HARPER_CACHE_PREFIX\s*=\s*"edmund-vendor-harper-"/);
  assert.match(serviceWorker, /HARPER_CACHE_NAME\s*=\s*"edmund-vendor-harper-2\.7\.0"/);
  assert.match(serviceWorker, /HARPER_PATH_PREFIX\s*=\s*"\/assets\/vendor\/harper\/2\.7\.0\/"/);
  assert.match(html, /Harper 只提供基本文法檢查/);
  assert.match(html, /script-src 'self' 'wasm-unsafe-eval' https:\/\/cdn\.jsdelivr\.net/);
  assert.match(html, /worker-src 'self' blob:/);
  assert.doesNotMatch(script, /(?:unpkg|esm\.sh|cdn\.jsdelivr)\./i);
});

test("browser configuration contains no administrator password", () => {
  assert.match(config, /adminUsername:\s*"Sam Admin Writing Grammar Check"/);
  assert.doesNotMatch(config, /(?:admin)?password\s*:/i);
  assert.doesNotMatch(script, /CONFIG\.(?:admin)?password/i);
});
