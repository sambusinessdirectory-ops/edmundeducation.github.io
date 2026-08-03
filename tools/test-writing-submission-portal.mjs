import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  completedWritingSegments,
  completedWritingSegmentsAffectedByEdit,
  completedWritingSegmentsOverlappingRange,
  countEnglishWords,
  grammarOccurrenceIdentity,
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
const harper = fs.readFileSync(path.join(root, "writing-submission-harper.js"), "utf8");
const executableGrammar = fs.readFileSync(
  path.join(root, "writing-submission-executable-grammar.js"),
  "utf8"
);
const aiAdapter = fs.readFileSync(path.join(root, "writing-submission-ai.js"), "utf8");
const grammarHistoryMigration = fs.readFileSync(
  path.join(root, "supabase-writing-submission-grammar-history.sql"),
  "utf8"
);

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

test("grammar occurrence identities dedupe a rescan but preserve two same-rule cards", () => {
  const base = {
    engineIdentity: "cloudflare-workers-ai@2",
    documentId: "11111111-1111-4111-8111-111111111111",
    ruleId: "EdmundAI:verb_form_and_tense",
    segmentOrdinal: 1,
    sentenceText: "I want to writing and to reading books.",
    originalText: "writing",
    suggestedText: "write",
    correctedSentence: "I want to write and to reading books."
  };
  const first = grammarOccurrenceIdentity({ ...base, start: 10, end: 17 });
  const rescan = grammarOccurrenceIdentity({ ...base, start: 10, end: 17 });
  const second = grammarOccurrenceIdentity({
    ...base,
    start: 25,
    end: 32,
    originalText: "reading",
    suggestedText: "read",
    correctedSentence: "I want to writing and to read books."
  });
  assert.equal(first, rescan);
  assert.notEqual(first, second);
});

test("portal exposes the requested stage-one writing, archive and grammar-log interface", () => {
  assert.match(html, /data-system="writing-submission"/);
  assert.match(html, /<h2>寫作題目<\/h2>/);
  assert.match(html, /<h2>文章內容<\/h2>/);
  assert.match(html, /我的文章/);
  assert.match(html, /我的文法問題記錄/);
  assert.match(html, /文法偵測只會在您輸入句號（\.）或分號（;）完成一句後開始/);
  assert.match(css, /--midnight:\s*#272757/i);
  assert.match(script, /newlyCompletedWritingSegments\(previousValue, nextValue\)/);
  assert.match(script, /\/v1\/grammar-occurrences\/batch/);
  assert.match(script, /\/v1\/grammar-problems/);
  assert.match(script, /method:\s*"PUT"/);
  assert.match(html, /data-grammar-toggle/);
  assert.match(html, /data-topic-picker-open/);
  assert.match(html, /data-writing-articles-chart/);
  assert.match(html, /data-writing-time-chart/);
  assert.match(html, /data-writing-average-chart/);
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
  assert.match(html, /GRAMMAR DETECTION/);
  assert.doesNotMatch(html, /\bAI\b|進階文法助手|進階文法檢查/);
  assert.match(html, /文法偵測才會檢查該句/);
  assert.match(html, /只有以句號或分號完成的單句會安全傳送至 Edmund 文法服務/);
  assert.match(html, /Harper 會作後備校對/);
  assert.match(html, /沒有提示不等於句子完全正確/);
  assert.match(html, /<h2 id="grammar-panel-title">文法偵測<\/h2>/);
  assert.match(html, /writing-submission\.css\?v=20260803-grammar-history1/);
  assert.match(html, /writing-submission\.js\?v=20260803-grammar-history1/);
  assert.match(script, /writing-submission-harper\.js\?v=20260802-grammar5/);
  assert.match(script, /writing-submission-ai\.js\?v=20260803-grammar-progress1/);
  assert.match(script, /ESL_RULESET_VERSION\s*=\s*"2\.0\.0"/);
  assert.match(eslRules, /writing-submission-esl-rules-core\.js\?v=20260802-grammar3/);
  assert.match(harper, /writing-submission-esl-rules\.js\?v=20260802-grammar5/);
  assert.match(eslRules, /writing-submission-executable-grammar\.js\?v=20260802-grammar5/);
  assert.match(
    executableGrammar,
    /writing-submission-executable-grammar\.generated\.js\?v=20260802-grammar5/
  );
  assert.match(script, /暫未偵測到高信心文法問題/);
  assert.match(script, /正在準備文法偵測/);
  assert.match(script, /文法偵測可能遺漏問題/);
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

test("writing preferences, topic selection, timing, progress and recoverable deletion are wired", () => {
  assert.match(script, /apiJson\("\/v1\/preferences"/);
  assert.match(script, /grammarDetectionEnabled:\s*enabled/);
  assert.match(script, /if \(!state\.grammarDetectionEnabled\) return cancelledRemoteGrammarResult\(\)/);
  assert.match(script, /startGrammarDetection\(\{ scanCurrentWriting \}\)/);
  assert.match(script, /homework-resource-catalog\.mjs/);
  assert.match(script, /questionPrompt\.join\("\\n\\n"\)/);
  assert.match(script, /dataset\.selectWritingTopic/);
  assert.match(script, /submissionDurationSeconds:\s*state\.submissionDurationSeconds/);
  assert.match(script, /durationSeconds:\s*submittedDurationSeconds/);
  assert.match(script, /source\.startsWith\("\/\/"\)/, "topic preview images must reject protocol-relative external URLs");
  assert.match(script, /apiJson\("\/v1\/progress"\)/);
  assert.match(script, /method:\s*"DELETE"/);
  assert.match(script, /文法問題記錄仍會保留給管理員/);
  assert.match(css, /\.submission-detail-head h2[^}]*font-size:\s*clamp\(20px, 2\.1vw, 25px\)/s);
  assert.match(css, /\.submission-progress-grid/);
  assert.match(css, /\.grammar-toggle input:checked/);
  assert.match(css, /\.topic-picker-dialog/);
});

test("detailed grammar history and the admin explanation-review queue are private and linked", () => {
  assert.match(html, /data-admin-review-button/);
  assert.match(html, /data-view="admin-review"/);
  assert.match(html, /待補文法解釋/);
  assert.match(script, /correctedSentence:\s*issue\.correctedSentence/);
  assert.match(script, /grammarOccurrenceIdentity\(\{/);
  assert.match(script, /\/v1\/grammar-problem-occurrences/);
  assert.match(script, /\/v1\/admin\/explanation-review/);
  assert.match(script, /dataset\.grammarSourceSubmission/);
  assert.match(css, /\.grammar-history-card/);
  assert.match(grammarHistoryMigration, /add column if not exists corrected_sentence/);
  assert.match(grammarHistoryMigration, /needs_explanation_review boolean[\s\S]*?請留意這部分的文法結構。/);
  assert.match(grammarHistoryMigration, /create or replace function public\.writing_submission_problem_occurrences/);
  assert.match(grammarHistoryMigration, /where occurrence\.student_id = p_student_id/);
  assert.match(grammarHistoryMigration, /create or replace function public\.writing_submission_admin_explanation_review_queue/);
  assert.match(grammarHistoryMigration, /public\._writing_submission_admin_id\(p_admin_token\) is null/);
  assert.doesNotMatch(grammarHistoryMigration, /grant execute[\s\S]*?to (?:anon|authenticated)/);
});

test("completed sentences use the authenticated AI endpoint without sending the whole draft", () => {
  assert.match(script, /apiJson\("\/v1\/grammar-check"/);
  assert.match(script, /JSON\.stringify\(\{ sentence: record\.segment\.text \}\)/);
  assert.match(aiAdapter, /REMOTE_GRAMMAR_REQUEST_TIMEOUT_MS\s*=\s*300_000/);
  assert.match(script, /}, REMOTE_GRAMMAR_REQUEST_TIMEOUT_MS\);/);
  assert.doesNotMatch(script, /}, 12000\);/);
  assert.doesNotMatch(script, /JSON\.stringify\(\{[^}]*topic[^}]*sentence/);
  assert.match(script, /remoteGrammarInFlight < 2/);
  assert.match(script, /enqueueSegmentsForCheck\(completedSegments, \{ remote: false \}\)/);
  assert.match(script, /mergeWritingGrammarIssues/);
  assert.match(script, /normalizeWritingAiResponse/);
  assert.match(aiAdapter, /EdmundAI:\$\{categoryId\}/);
  assert.match(aiAdapter, /cloudflare-workers-ai/);
});

test("an incomplete AI review preserves local findings without pretending the service is offline", () => {
  assert.match(aiAdapter, /export function classifyRemoteGrammarFailure/);
  assert.match(aiAdapter, /export function writingGrammarReviewNotice/);
  assert.match(aiAdapter, /code === "GRAMMAR_CHECK_INCONCLUSIVE"/);
  assert.match(script, /if \(!isLatestSegmentRecord\(record\)\) return cancelledRemoteGrammarResult\(\)/);
  assert.match(script, /timedOut = true;\s*controller\.abort\(\)/);
  assert.match(script, /applyRemoteGrammarOutcome\(record, result\)/);
  assert.match(script, /record\.remoteIssues = Array\.isArray\(result\?\.issues\) \? result\.issues : null/);
  assert.match(script, /await publishSegmentRecord\(record\);\s*finishSegmentRecord\(record\)/);
  assert.match(script, /writingGrammarReviewNotice\(\s*warnings\.map\(\(warning\) => warning\.kind\),\s*hasVisibleIssues \? 1 : 0\s*\)/);
  assert.match(aiAdapter, /code === "GRAMMAR_CHECK_QUOTA_EXHAUSTED"/);
  assert.match(aiAdapter, /quotaExhausted: "quota_exhausted"/);
  assert.match(script, /文法偵測今日額度已用完/);
  assert.match(script, /state\.remoteGrammarWarnings\.clear\(\)/);
  assert.match(script, /state\.remoteGrammarBackoffUntil\s*=\s*0/);
  assert.match(script, /state\.remoteGrammarBackoffFailure\s*=\s*null/);
  assert.doesNotMatch(script, /const delay = error\?\.status === 429 \? 60000 : 30000/);
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
  assert.match(script, /hasWritingGrammarIssuesForSentence/);
  assert.match(script, /if \(!hasRemainingSentenceIssues\)/);
  assert.doesNotMatch(script, /const preserved = state\.activeIssues/);
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
