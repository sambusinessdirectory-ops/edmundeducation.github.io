import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  completedWritingSegments,
  completedWritingSegmentsAffectedByEdit,
  completedWritingSegmentsOverlappingRange,
  countEnglishWords,
  isLiveCompletedWritingSegment,
  newlyCompletedWritingSegments
} from "../writing-submission-core.js";

const root = path.resolve(import.meta.dirname, "..");
const html = fs.readFileSync(path.join(root, "writing-submission.html"), "utf8");
const css = fs.readFileSync(path.join(root, "writing-submission.css"), "utf8");
const script = fs.readFileSync(path.join(root, "writing-submission.js"), "utf8");
const config = fs.readFileSync(path.join(root, "writing-submission-config.js"), "utf8");
const serviceWorker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
const eslRules = fs.readFileSync(path.join(root, "writing-submission-esl-rules.js"), "utf8");
const aiAdapter = fs.readFileSync(path.join(root, "writing-submission-ai.js"), "utf8");

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

test("a correction that inserts a sentence boundary rechecks both resulting sentences", () => {
  const corrected = "There are advantages. For example, customers can locate staff.";
  const segments = completedWritingSegmentsOverlappingRange(corrected, 0, corrected.length);
  assert.deepEqual(
    segments.map((segment) => segment.text),
    ["There are advantages.", "For example, customers can locate staff."]
  );
  assert.equal(isLiveCompletedWritingSegment(corrected, segments[0]), true);
  assert.equal(isLiveCompletedWritingSegment(`${corrected} Extra text`, segments[0]), true);
  assert.equal(isLiveCompletedWritingSegment("There are advantages..", segments[0]), false);
});

test("typing punctuation inside a completed sentence rechecks every resulting sentence", () => {
  assert.deepEqual(
    completedWritingSegmentsAffectedByEdit(
      "Students feel exciting.",
      "Students; feel exciting."
    ).map((segment) => segment.text),
    ["Students;", "feel exciting."]
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

test("AI grammar review has self-hosted Harper and Edmund rules as fallbacks", () => {
  assert.match(serviceWorker, /HARPER_CACHE_PREFIX\s*=\s*"edmund-vendor-harper-"/);
  assert.match(serviceWorker, /HARPER_CACHE_NAME\s*=\s*"edmund-vendor-harper-2\.7\.0"/);
  assert.match(serviceWorker, /HARPER_PATH_PREFIX\s*=\s*"\/assets\/vendor\/harper\/2\.7\.0\/"/);
  assert.match(html, /AI GRAMMAR REVIEW/);
  assert.match(html, /只有以句號或分號完成的單句會安全傳送至 Edmund 文法服務/);
  assert.match(html, /Harper 會作後備校對/);
  assert.match(html, /沒有提示不等於句子完全正確/);
  assert.match(html, /AI 文法提示（測試版）/);
  assert.match(html, /writing-submission\.css\?v=20260731-ai1/);
  assert.match(html, /writing-submission\.js\?v=20260801-loop1/);
  assert.match(script, /writing-submission-harper\.js\?v=20260731-ai1/);
  assert.match(script, /writing-submission-ai\.js\?v=20260801-loop1/);
  assert.match(script, /暫未偵測到高信心文法問題/);
  assert.match(script, /AI 及本機工具都可能遺漏問題/);
  assert.match(script, /需老師覆核/);
  assert.match(script, /此項局部修正後（句內仍可能有其他問題）/);
  assert.match(eslRules, /EslModalParallelVerb/);
  assert.match(eslRules, /EslBeHaveDoubleVerb/);
  assert.match(eslRules, /EslComplexIllustrationClauseReview/);
  assert.match(css, /grammar-card\[data-review="true"\]/);
  assert.match(html, /script-src 'self' 'wasm-unsafe-eval' https:\/\/cdn\.jsdelivr\.net/);
  assert.match(html, /worker-src 'self' blob:/);
  assert.doesNotMatch(script, /(?:unpkg|esm\.sh|cdn\.jsdelivr)\./i);
});

test("completed sentences use the authenticated AI endpoint without sending the whole draft", () => {
  assert.match(script, /apiJson\("\/v1\/grammar-check"/);
  assert.match(script, /JSON\.stringify\(\{ sentence: record\.segment\.text \}\)/);
  assert.doesNotMatch(script, /JSON\.stringify\(\{[^}]*topic[^}]*sentence/);
  assert.match(script, /remoteGrammarInFlight < 2/);
  assert.match(script, /enqueueSegmentsForCheck\(completedSegments, \{ remote: false \}\)/);
  assert.match(script, /mergeWritingGrammarIssues/);
  assert.match(script, /normalizeWritingAiResponse/);
  assert.match(aiAdapter, /EdmundAI:\$\{categoryId\}/);
  assert.match(aiAdapter, /cloudflare-workers-ai/);
});

test("applying one AI correction cannot create an A-B-A loop or erase sibling cards", () => {
  assert.match(script, /latestSegmentRecords/);
  assert.match(script, /isLatestSegmentRecord\(record\)/);
  assert.match(script, /previousRecord\.superseded = true/);
  assert.match(script, /previousRecord\.remoteController\?\.abort\(\)/);
  assert.match(script, /supersedeSegmentRecordsAffectedByEdit\(previousValue, nextValue\)/);
  assert.match(script, /scheduleManualGrammarRecheck\(previousValue, nextValue\)/);
  assert.match(script, /completedWritingSegmentsAffectedByEdit\(previousValue, nextValue\)/);
  assert.match(script, /completedWritingSegmentsOverlappingRange\(nextValue, change\.start, rangeEnd\)/);
  assert.match(script, /Object\.assign\(record\.segment, liveSegment\)/);
  assert.match(script, /isLiveCompletedWritingSegment\(nextValue, liveSegment\)/);
  assert.doesNotMatch(script, /record\.segment\s*=\s*segment/);
  assert.match(script, /}, 650\);/);
  assert.match(script, /isBlockedInverseWritingGrammarIssue/);
  assert.match(script, /rebaseWritingGrammarIssuesAfterAppliedCorrection/);
  assert.doesNotMatch(script, /remoteGrammarCache/);
  assert.doesNotMatch(
    script,
    /state\.activeIssues = state\.activeIssues\.filter\(\(candidate\) => candidate\.sentenceText !== issue\.sentenceText/
  );
  assert.match(aiAdapter, /same or a weaker/);
  assert.match(aiAdapter, /independent cards later in the same sentence/);

  const before = completedWritingSegments("First. Second sentence.")[1];
  const heldByAsyncDecoration = before;
  const after = completedWritingSegments("A longer first sentence. Second sentence.")[1];
  Object.assign(before, after);
  assert.equal(heldByAsyncDecoration, before, "the asynchronous decorator keeps the same segment reference");
  assert.deepEqual(
    [heldByAsyncDecoration.start, heldByAsyncDecoration.end, heldByAsyncDecoration.ordinal],
    [after.start, after.end, after.ordinal],
    "an earlier edit updates the held sentence offsets before diagnostics publish"
  );
  assert.equal(
    isLiveCompletedWritingSegment("Yesterday, Tom go home.", {
      start: 11,
      end: 23,
      text: "Tom go home."
    }),
    false,
    "an inserted prefix invalidates the obsolete suffix card instead of duplicating it"
  );
});

test("browser configuration contains no administrator password", () => {
  assert.match(config, /adminUsername:\s*"Sam Admin Writing Grammar Check"/);
  assert.doesNotMatch(config, /(?:admin)?password\s*:/i);
  assert.doesNotMatch(script, /CONFIG\.(?:admin)?password/i);
});
