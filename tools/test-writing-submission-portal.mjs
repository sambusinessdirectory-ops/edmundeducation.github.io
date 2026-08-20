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
  newlyCompletedWritingSegments,
  normalizeWritingSubmissionEntryLink,
  normalizeVocabularyMatchText,
  vocabularyEntryUsed,
  writingSubmissionArticlePath,
  writingSubmissionNotificationMessage,
  writingTopicResourceForTransport
} from "../writing-submission-core.js";
import { HOMEWORK_RESOURCE_CATALOG } from "../homework-resource-catalog.mjs";
import { filterHomeworkResources } from "../schedule-homework-links.mjs";
import { normalizeSentenceStructureDeepLink } from "../writing-submission-feedback-tools.mjs";
import {
  unbiasedRandomIndex,
  WRITING_RANDOM_TOPIC_CATEGORIES,
  writingRandomTopicCandidates,
  writingRandomTopicCategory
} from "../writing-submission-random-topic.js";
import { writingTopicAccessAllows } from "../writing-submission-topic-access.js";

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
const draftsAdminMigration = fs.readFileSync(
  path.join(root, "supabase-writing-submission-drafts-admin.sql"),
  "utf8"
);
const topicAccessMigration = fs.readFileSync(
  path.join(root, "supabase-writing-submission-topic-access.sql"),
  "utf8"
);
const workerSource = fs.readFileSync(path.join(root, "workers/writing-submission/src/index.js"), "utf8");
const enhancementMigration = fs.readFileSync(path.join(root, "supabase-writing-submission-enhancements.sql"), "utf8");
const feedbackRevisionMigration = fs.readFileSync(
  path.join(root, "supabase-writing-submission-feedback-revision.sql"),
  "utf8"
);
const feedbackFragmentEnhancementMigration = fs.readFileSync(
  path.join(root, "supabase-writing-submission-feedback-fragment-enhancements.sql"),
  "utf8"
);
const feedbackStructuredPartsMigration = fs.readFileSync(
  path.join(root, "supabase-writing-submission-feedback-structured-parts.sql"),
  "utf8"
);
const feedbackAdditionalEnhancementsMigration = fs.readFileSync(
  path.join(root, "supabase-writing-submission-feedback-additional-enhancements.sql"),
  "utf8"
);
const feedbackTools = fs.readFileSync(
  path.join(root, "writing-submission-feedback-tools.mjs"),
  "utf8"
);
const workerTopicCatalog = fs.readFileSync(
  path.join(root, "workers/writing-submission/src/topic-catalog.js"),
  "utf8"
);

test("article notifications use strict owner-scoped deep links", () => {
  const id = "f55e7f9d-d49d-4d94-aad5-a84cb5574f59";
  assert.equal(
    writingSubmissionArticlePath(id),
    `writing-submission.html?submission=${id}`
  );
  assert.equal(
    writingSubmissionNotificationMessage(id),
    `Edmund 通知：\n您的作文已改好，請努力溫習！ 😬💪🏻\nhttps://edmundeducation.com/writing-submission.html?submission=${id}`
  );
  assert.deepEqual(
    normalizeWritingSubmissionEntryLink(`?submission=${id}`),
    { type: "submission", submissionId: id }
  );
  assert.deepEqual(
    normalizeWritingSubmissionEntryLink("?exercise=model-essay-2-ielts-advantage-disadvantage"),
    { type: "exercise", exerciseId: "model-essay-2-ielts-advantage-disadvantage" }
  );
  assert.equal(normalizeWritingSubmissionEntryLink("?submission=bad"), null);
  assert.equal(normalizeWritingSubmissionEntryLink("?exercise=good&student=someone"), null);
  assert.match(workerSource, /writing_submission_get_v3[\s\S]*?p_student_id:\s*student\.id/);
  assert.match(enhancementMigration, /where submission\.student_id = p_student_id[\s\S]*?and submission\.id = p_id[\s\S]*?and submission\.deleted_at is null/i);
});

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

test("thematic vocabulary matching is exact, phrase-aware and apostrophe-safe", () => {
  assert.equal(normalizeVocabularyMatchText("  Workers’ rights  "), "workers' rights");
  assert.equal(vocabularyEntryUsed("We must protect WORKERS’   RIGHTS.", "workers' rights"), true);
  assert.equal(vocabularyEntryUsed("Homework should be manageable.", "work"), false);
  assert.equal(vocabularyEntryUsed("Customers need support.", "customer"), false);
  assert.equal(vocabularyEntryUsed("A customer needs support.", "customer"), true);
  assert.equal(vocabularyEntryUsed("", "customer"), false);
});

test("grammar occurrence identities dedupe a rescan but preserve two same-rule cards", () => {
  const base = {
    engineIdentity: "edmund-advanced-grammar@2",
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
  assert.match(
    html,
    /<h2[^>]*>\s*文章內容(?:\s*<[^>]*data-proofreading-label[^>]*>校對時間<\/[^>]+>)?\s*<\/h2>/
  );
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

test("random question delivery exposes exactly four permission-gated canonical categories", () => {
  const writingCatalog = HOMEWORK_RESOURCE_CATALOG.filter((resource) => resource?.type === "fill-blanks");
  const counts = Object.fromEntries(WRITING_RANDOM_TOPIC_CATEGORIES.map((category) => [
    category.id,
    writingCatalog.filter((resource) => writingRandomTopicCategory(resource) === category.id).length
  ]));
  assert.deepEqual(counts, {
    "dse-part-a": 15,
    "dse-part-b": 3,
    "ielts-task-1": 60,
    "ielts-task-2": 228
  });

  const dseCatalog = writingCatalog.filter((resource) => resource.sectionKey === "dse-writing");
  assert.equal(dseCatalog.length, 18);
  for (const resource of dseCatalog) {
    const expectedCategory = resource.detail.includes("· Part B ·") ? "dse-part-b" : "dse-part-a";
    assert.equal(
      writingRandomTopicCategory(resource),
      expectedCategory,
      `${resource.id} must agree with its canonical DSE Part metadata`
    );
  }
  assert.equal(
    writingRandomTopicCategory(writingCatalog.find((resource) => resource.id === "fill:dse-writing-2012-part-a")),
    "dse-part-a",
    "a terminal -part-a identifier must be classified"
  );
  assert.equal(
    writingRandomTopicCategory(writingCatalog.find((resource) => resource.id === "fill:dse-writing-2022-part-b-q3")),
    "dse-part-b",
    "a Part B identifier with a question suffix must be classified"
  );
  assert.equal(
    Object.values(counts).reduce((total, count) => total + count, 0),
    writingCatalog.length - 15,
    "unrelated Government and Business English questions must not enter one of the four requested random categories"
  );

  const dseBlocked = writingRandomTopicCandidates(
    writingCatalog,
    "dse-part-a",
    (resource) => writingTopicAccessAllows(
      resource,
      { "dse-writing": false, "ielts-writing": true },
      true
    )
  );
  const ieltsAllowed = writingRandomTopicCandidates(
    writingCatalog,
    "ielts-task-1",
    (resource) => writingTopicAccessAllows(
      resource,
      { "dse-writing": false, "ielts-writing": true },
      true
    )
  );
  assert.equal(dseBlocked.length, 0);
  assert.equal(ieltsAllowed.length, counts["ielts-task-1"]);
  assert.equal(writingRandomTopicCandidates(writingCatalog, "unknown", () => true).length, 0);

  assert.ok(
    html.indexOf("data-random-topic-open") < html.indexOf("data-topic-picker-open"),
    "the random delivery button must sit immediately before the manual topic picker"
  );
  assert.match(html, /data-random-topic-open>隨機派送問題<\/button>/);
  assert.equal((html.match(/data-random-topic-category=/g) || []).length, 4);
  for (const category of WRITING_RANDOM_TOPIC_CATEGORIES) {
    assert.match(html, new RegExp(`data-random-topic-category="${category.id}"`));
  }
  assert.match(html, /data-random-topic-status role="status" aria-live="polite"/);
  assert.match(script, /writing-submission-random-topic\.js\?v=20260813-1/);
  assert.match(script, /writingRandomTopicCandidates\([\s\S]*?canonicalWritingTopicResource\(resource\.id\)/);
  assert.match(script, /selectWritingTopic\(canonical\.id, \{ persist: true, close: false, toast: false \}\)/);
  assert.match(css, /\.random-topic-choices/);
});

test("random question indexes use rejection sampling without modulo bias", () => {
  const cryptoValues = [0xffffffff, 17];
  let cryptoCalls = 0;
  const cryptoSource = {
    getRandomValues(target) {
      target[0] = cryptoValues[cryptoCalls];
      cryptoCalls += 1;
      return target;
    }
  };
  assert.equal(unbiasedRandomIndex(10, { cryptoSource, randomSource: () => 0 }), 7);
  assert.equal(cryptoCalls, 2, "a value in the incomplete modulo bucket must be rejected");

  const range = 0x20000000000000;
  const fallbackValues = [(range - 1) / range, 17 / range];
  let fallbackCalls = 0;
  assert.equal(unbiasedRandomIndex(10, {
    cryptoSource: null,
    randomSource() {
      const value = fallbackValues[fallbackCalls];
      fallbackCalls += 1;
      return value;
    }
  }), 7);
  assert.equal(fallbackCalls, 2, "the non-cryptographic fallback must also reject its incomplete bucket");

  assert.equal(unbiasedRandomIndex(10, {
    cryptoSource: {
      getRandomValues() { throw new Error("Web Crypto unavailable"); }
    },
    randomSource: () => 17 / range
  }), 7, "a Web Crypto failure must use the unbiased fallback instead of blocking assignment");

  assert.throws(() => unbiasedRandomIndex(0), RangeError);
  assert.throws(() => unbiasedRandomIndex(0x100000001), RangeError);
});

test("grammar history and article archives follow the deployed API contract", () => {
  assert.match(script, /payload\?\.grammarProblems/);
  assert.match(script, /payload\?\.grammarOccurrences/);
  assert.match(script, /fetchAllSubmissionPages\("\/v1\/submissions"\)/);
  assert.match(script, /const submissionPath = `\/v1\/admin\/submissions\?studentId=/);
  assert.match(script, /fetchAllSubmissionPages\(submissionPath, \{ maximumPages: 100 \}\)/);
  assert.match(script, /localStorage\.setItem\(key, JSON\.stringify\(values\)\)/);
  assert.match(script, /flushGrammarOccurrences\(\)\.catch/);
  assert.match(script, /checkGeneration/);
});

test("draft upserts use an unambiguous primary-key conflict target", () => {
  assert.match(
    draftsAdminMigration,
    /on conflict on constraint writing_submission_drafts_pkey do update/i
  );
  assert.doesNotMatch(draftsAdminMigration, /on conflict\s*\(id\)\s*do update/i);
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
  assert.match(html, /writing-submission\.css\?v=20260820-writing-upgrades1/);
  assert.match(html, /writing-submission\.js\?v=20260820-writing-upgrades1/);
  assert.match(script, /writing-submission-harper\.js\?v=20260803-grammar6/);
  assert.match(script, /writing-submission-ai\.js\?v=20260810-drafts-admin2/);
  assert.match(script, /ESL_RULESET_VERSION\s*=\s*"2\.0\.0"/);
  assert.match(eslRules, /writing-submission-esl-rules-core\.js\?v=20260802-grammar3/);
  assert.match(harper, /writing-submission-esl-rules\.js\?v=20260803-grammar6/);
  assert.match(eslRules, /writing-submission-executable-grammar\.js\?v=20260803-grammar6/);
  assert.match(
    executableGrammar,
    /writing-submission-executable-grammar\.generated\.js\?v=20260803-grammar6/
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

test("countdown and role-scoped composition plus feedback exports are fully wired", () => {
  assert.match(html, /data-writing-timer-toggle/);
  assert.match(html, /data-writing-timer-force/);
  assert.match(html, /時間到自動提交/);
  assert.match(html, /倒數完結後先進入五分鐘校對/);
  assert.match(html, /data-export-selected-submissions/);
  assert.match(html, /data-export-all-submissions/);
  assert.match(script, /writingTimer:\s*normalizeWritingTimer\(value\.writingTimer\)/);
  assert.match(script, /submissionPromise/);
  assert.match(script, /submitCurrentWriting\(\{ source: "timer" \}\)/);
  assert.match(script, /if \(!isWritingProofreadingReady\(state\.proofreadingGate\)\) \{/);
  assert.match(script, /beginWritingProofreading\(\)/);
  assert.match(script, /校對完成後才會自動提交/);
  assert.match(script, /method:\s*"PUT"/);
  assert.match(script, /function fetchSubmissionExportBundle\(id, role\)/);
  assert.match(script, /`\/v1\/submissions\/\$\{encodedId\}`/);
  assert.match(script, /`\/v1\/admin\/submissions\/\$\{encodedId\}`/);
  assert.match(script, /apiJson\(`\$\{basePath\}\/feedback`\)/);
  assert.match(script, /exportStudentSubmissions\(state\.submissions\.map/);
  assert.match(script, /dataset\.exportAdminSubmission/);
  assert.match(script, /feedbackPrintHtml\(feedback\)/);
  assert.match(script, /readAdminFeedbackEditor\(editor, \{ allowEmpty: true \}\)/);
  assert.match(script, /elements\.adminDetail\?\.querySelector\("\[data-feedback-editor\]"\)/);
  assert.doesNotMatch(script, /elements\.adminSubmissionDetail/);
  assert.match(script, /目前編輯器預覽（可能尚未儲存）/);
  assert.match(script, /structured: true,[\s\S]*?emptyText: "未填寫"/);
  assert.match(script, /@page\{size:A4;margin:10mm 9mm\}/);
  assert.match(script, /print-color-adjust:exact/);
  assert.match(script, /列印／儲存為 PDF/);
  assert.match(script, /href="https:\/\/edmundeducation\.com\/index\.html"/);
  assert.match(script, /new URL\(link\.url, "https:\/\/edmundeducation\.com\/"\)\.href/);
  assert.match(script, /<a href="\$\{escapePrintHtml\(absoluteUrl\)\}"/);
  assert.match(css, /\.writing-timer-panel/);
  assert.match(css, /\.submission-export-toolbar/);
});

test("stopwatch, countdown and image zoom keep independent reset state", () => {
  const timerReset = script.match(/function handleWritingTimerReset\(\) \{[\s\S]*?\n\}/)?.[0] || "";
  const newDraft = script.match(/function startNewDraft\([^)]*\) \{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(timerReset, /state\.writingTimer = emptyWritingTimer\(\)/);
  assert.doesNotMatch(timerReset, /writingStopwatch|writingImageZoom/);
  assert.match(newDraft, /state\.writingStopwatch = emptyWritingStopwatch\(\)/);
  assert.match(newDraft, /state\.writingImageZoom = 1/);
});

test("writing preferences, topic selection, timing, progress and recoverable deletion are wired", () => {
  assert.match(script, /apiJson\("\/v1\/preferences"/);
  assert.match(script, /grammarDetectionEnabled:\s*enabled/);
  assert.match(script, /if \(!state\.grammarDetectionEnabled\) return cancelledRemoteGrammarResult\(\)/);
  assert.match(script, /startGrammarDetection\(\{ scanCurrentWriting \}\)/);
  assert.match(script, /homework-resource-catalog\.mjs/);
  assert.match(script, /normalizeWritingSubmissionEntryLink\(window\.location\.search\)/);
  assert.match(script, /openSubmissions\(\{ selectId: entryLink\.submissionId \}\)/);
  assert.match(script, /canonicalWritingTopicResource\(`fill:\$\{entryLink\.exerciseId\}`\)/);
  assert.match(script, /copyButton\.dataset\.copySubmissionNotice = submission\.id/);
  assert.match(script, /copySubmissionNotification/);
  assert.match(script, /questionPrompt\.join\("\\n\\n"\)/);
  assert.match(script, /dataset\.selectWritingTopic/);
  assert.match(script, /submissionDurationSeconds:\s*state\.submissionDurationSeconds/);
  assert.match(script, /durationSeconds:\s*submittedDurationSeconds/);
  assert.match(script, /state\.writingAreaFocused/);
  assert.match(script, /elements\.writingInput\.addEventListener\("focus", resumeWritingClockForEditor\)/);
  assert.match(script, /elements\.writingInput\.addEventListener\("blur", \(\) => pauseWritingClockOutsideEditor\(\)\)/);
  assert.doesNotMatch(script, /elements\.topicInput\.addEventListener\("focus", markWritingActivity\)/);
  assert.match(script, /source\.startsWith\("\/\/"\)/, "topic preview images must reject protocol-relative external URLs");
  assert.match(script, /apiJson\("\/v1\/progress"\)/);
  assert.match(script, /method:\s*"DELETE"/);
  assert.match(script, /文法問題記錄仍會保留給管理員/);
  assert.match(css, /\.submission-detail-head h2[^}]*font-size:\s*clamp\(20px, 2\.1vw, 25px\)/s);
  assert.match(css, /\.submission-progress-grid/);
  assert.match(css, /\.grammar-toggle input:checked/);
  assert.match(css, /\.topic-picker-dialog/);
});

test("the writing-area prompt lives on the grammar card and cannot cover model-essay text", () => {
  assert.match(html, /class="grammar-intro"><strong>請在文章內容欄開始寫作。<\/strong>/);
  const writingInput = html.match(/<textarea data-writing-input[^>]*><\/textarea>/)?.[0] || "";
  assert.ok(writingInput, "the writing textarea should remain available");
  assert.doesNotMatch(writingInput, /placeholder=/);
});

test("Writing Practice topics strip display-only fields from draft and submission transport", () => {
  const transported = writingTopicResourceForTransport({
    id: "fill:dse-writing-2025-part-a",
    type: "fill-blanks",
    label: "DSE Writing 2025 Part A",
    detail: "Writing Practice",
    url: "writing-practice.html?exercise=dse-writing-2025-part-a",
    sectionKey: "dse-writing",
    questionPrompt: ["Write your answer."],
    questionImages: [{ src: "assets/question.png", alt: "Question" }],
    modelEssay: "Display-only reference content"
  });
  assert.deepEqual(transported, {
    id: "fill:dse-writing-2025-part-a",
    type: "fill-blanks",
    label: "DSE Writing 2025 Part A",
    detail: "Writing Practice",
    sectionKey: "dse-writing",
    questionPrompt: ["Write your answer."],
    questionImages: [{ src: "assets/question.png", alt: "Question" }]
  });
  assert.equal(Object.hasOwn(transported, "url"), false);
  assert.equal(Object.hasOwn(transported, "modelEssay"), false);
  assert.equal(
    (script.match(/topicResource:\s*canonicalWritingTopicResourceForTransport\(/g) || []).length,
    3,
    "current drafts, archived drafts, and final submissions must all use the strict transport shape"
  );
});

test("homework exercise links preserve an unrelated draft and resume the matching draft", () => {
  const handler = script.match(
    /async function openStudentEntryLink\(\) \{[\s\S]*?\n\}\n\nasync function openGrammarSourceSubmission/
  )?.[0] || "";
  const archive = script.match(
    /async function archiveStoredDraftBeforeEntryLink\(draft\) \{[\s\S]*?\n\}/
  )?.[0] || "";
  assert.match(handler, /const storedDraft = readDraft\(\)/);
  assert.match(handler, /storedDraft\?\.selectedTopicResource\?\.id === resource\.id/);
  assert.match(handler, /await restoreDraft\(\)/);
  assert.match(handler, /await archiveStoredDraftBeforeEntryLink\(storedDraft\)/);
  assert.match(handler, /startNewDraft\(\{ preserveView: true \}\)/);
  assert.match(handler, /selectWritingTopic\(resource\.id, \{ persist: true/);
  assert.ok(
    handler.indexOf("archiveStoredDraftBeforeEntryLink(storedDraft)")
      < handler.indexOf("startNewDraft({ preserveView: true })"),
    "the existing local draft must reach the server before the single local-draft key is replaced"
  );
  assert.match(archive, /apiJson\(`\/v1\/drafts\/\$\{encodeURIComponent\(draft\.documentId\)\}`/);
  assert.match(archive, /method: "PUT"/);
  assert.match(archive, /if \(!payload\.topic\.trim\(\) && !payload\.answer\.trim\(\)\) return false/);
  assert.doesNotMatch(script, /preserveStoredDraft/);
});

test("owner article links preserve local work and isolate auxiliary panel failures", () => {
  const handler = script.match(
    /async function openStudentEntryLink\(\) \{[\s\S]*?\n\}\n\nasync function openGrammarSourceSubmission/
  )?.[0] || "";
  const articleBranch = handler.match(
    /if \(entryLink\.type === "submission"\) \{[\s\S]*?\n  \}/
  )?.[0] || "";
  const submissionsView = script.match(
    /async function openSubmissions\([^)]*\) \{[\s\S]*?\n\}/
  )?.[0] || "";
  const loginHandler = script.match(
    /async function handleLogin\(event\) \{[\s\S]*?\n\}/
  )?.[0] || "";

  assert.match(articleBranch, /await restoreDraft\(\)/);
  assert.ok(
    articleBranch.indexOf("await restoreDraft()")
      < articleBranch.indexOf("openSubmissions({ selectId: entryLink.submissionId })"),
    "the single local draft must be restored before switching to an owner article link"
  );
  assert.match(articleBranch, /await openSubmission\(entryLink\.submissionId\)/);
  assert.match(submissionsView, /const submissionsPromise = loadSubmissions\(\{ selectId \}\)/);
  assert.match(submissionsView, /Promise\.allSettled\(\[loadWritingProgress\(\), loadDrafts\(\)\]\)/);
  assert.match(submissionsView, /await submissionsPromise/);
  assert.doesNotMatch(submissionsView, /Promise\.all\(/);
  assert.match(loginHandler, /if \(!openedEntryLink\) showToast\(`您好，\$\{state\.user\.name\}！`/);
});

test("notification clipboard fallback always cleans up and reaches manual copy", () => {
  const copyHelper = script.match(
    /async function copyPlainText\(value\) \{[\s\S]*?\n\}/
  )?.[0] || "";
  assert.match(copyHelper, /let textarea = null/);
  assert.match(copyHelper, /finally \{\s*textarea\?\.remove\(\)/);
  assert.match(copyHelper, /try \{\s*window\.prompt\("請複製以下通知：", text\)/);
  assert.match(copyHelper, /catch \{ \/\* A blocked prompt must not break the admin article view\. \*\//);
});

test("registered writing topics expose guarded Open Book references without fuzzy question matching", () => {
  assert.match(html, /data-topic-reference-area/);
  assert.match(html, /essay-portal-links\.js\?v=20260730-1/);
  assert.match(script, /function writingExerciseIdFromTopicResource\(resource\)/);
  assert.match(script, /const exerciseId = writingExerciseIdFromTopicResource\(\{ id \}\)/);
  assert.match(script, /url:\s*`writing-practice\.html\?exercise=\$\{encodeURIComponent\(exerciseId\)\}`/);
  assert.match(script, /writing-submission-topic-access\.js\?v=20260810-topic-access1/);
  assert.match(script, /state\.studentAccessReady/);
  assert.match(script, /normalizeWritingTopicAccess\(profile\.access\)/);
  assert.match(script, /canonicalAccessibleWritingTopic\(/);
  assert.match(script, /await loadWritingTopicCatalog\(\)/);
  assert.match(script, /await restoreDraft\(\)/);
  assert.match(script, /topicResource:\s*canonicalWritingTopicResourceForTransport\(state\.selectedTopicResource\)/);
  assert.doesNotMatch(script, /state\.studentAccess\?\.\[resource\.sectionKey\]\s*!==\s*false/);
  assert.doesNotMatch(script, /state\.studentAccess\s*=\s*saved\.access/);
  assert.match(script, /id\.startsWith\("fill:"\) \? id\.slice\(5\) : ""/);
  assert.match(script, /essayPortals\?\.fromWritingExerciseId\(exerciseId\)/);
  assert.match(script, /const canonical = canonicalWritingTopicResource\(resource\)/);
  assert.match(script, /essayPortals\.hasFlashcards\(essayKey\)/);
  assert.match(script, /essayPortals\.href\("flashcards", essayKey\)/);
  assert.match(script, /const writingHref = `writing-practice\.html\?exercise=\$\{encodeURIComponent\(exerciseId\)\}`/);
  assert.match(script, /writingHref\s*\n\s*}/);
  assert.doesNotMatch(script, /writingHref:\s*canonical\.url/);
  assert.match(script, /dse\/writing\/part-a\/\$\{dsePartAMatch\[1\]\}/);
  assert.match(script, /government\/hkpf\/writing-composition\/composition-\$\{hkpfCompositionMatch\[1\]\}/);
  assert.match(script, /government\/hkfsd\/incident-reports\/incident-report-\$\{hkfsdIncidentReportMatch\[1\]\}/);
  assert.match(script, /flashcards\.html\?deck=\$\{encodeURIComponent\(flashDeckId\)\}/);
  assert.match(script, /重溫 Flash Card 請按這裡：/);
  assert.match(script, /重溫 Fill In The Blanks 請按這裡：/);
  assert.match(script, /展開以 Open Book 參考 Edmund 範文 Model Essay/);
  assert.match(script, /展開以 Open Book 參考 Edmund 主題性生字 Thematic Vocabulary/);
  assert.match(script, /writing-submission-reference-data\.mjs\?v=/);
  assert.match(script, /TOPIC_CATALOG_VERSION\s*=\s*"20260818-hkfsd-ir3"/);
  assert.match(script, /TOPIC_REFERENCE_VERSION\s*=\s*"20260818-hkfsd-ir3"/);
  assert.match(script, /reference\.exerciseId !== route\.exerciseId/);
  assert.match(script, /reference\.writingHref !== route\.writingHref/);
  assert.match(script, /reference\.flashDeckId !== route\.flashDeckId/);
  assert.match(script, /dataset\.topicReferenceRetry/);
  assert.match(script, /暫時未能載入參考內容/);
  assert.match(script, /dataset\.topicReferenceTranslationToggle/);
  assert.match(script, /"中文翻譯"/);
  assert.match(script, /row\?\.english/);
  assert.match(script, /row\?\.chinese/);
  assert.match(script, /dataset\.topicReferenceVocabulary/);
  assert.match(script, /dataset\.topicReferenceVocabularyScale/);
  assert.match(script, /dataset\.topicReferenceVocabularyUsageStatus/);
  assert.match(script, /writing-submission-core\.js\?v=20260812-topic-transport1/);
  assert.doesNotMatch(script, /row\.setAttribute\("aria-label", used/);
  assert.match(script, /refreshVocabularyUsage\(content\)/);
  assert.match(script, /refreshVocabularyUsage\(\)/);
  assert.match(css, /\.topic-reference-table tbody tr\.is-used/);
  assert.match(css, /--vocabulary-text-scale/);
  assert.match(script, /function renderAdminFeedbackEditor/);
  assert.match(script, /Math\.max\(20, Math\.ceil\(saved\.length \/ 10\) \* 10\)/);
  assert.match(script, /appendFeedbackEditorRows\(list, initialCount, saved, state\.adminFeedbackSuggestedFragments\)/);
  assert.match(script, /appendFeedbackEditorRows\(list, 10/);
  assert.match(
    script,
    /fragment\.originalFragment\.trim\(\)\s*\|\| fragment\.edmundComment\.trim\(\)\s*\|\| fragment\.suggestedWriting\.trim\(\)/
  );
  assert.match(script, /\[\^\.\!\?;。！？；\]\+/);
  assert.match(script, /const expectedVersion = state\.selectedAdminFeedback\?\.version \|\| 0/);
  assert.match(script, /const expectedFeedbackId = state\.selectedAdminFeedback\?\.id \|\| null/);
  assert.match(script, /method: "DELETE",[\s\S]*?expectedFeedbackId,[\s\S]*?expectedVersion/);
  assert.match(script, /label: `原句 \$\{index \+ 1\}`,[\s\S]*?maxLength: 10000/);
  assert.match(script, /label: `Edmund 評語 \$\{index \+ 1\}`,[\s\S]*?maxLength: 20000/);
  assert.match(script, /label: `建議寫法 \$\{index \+ 1\}`,[\s\S]*?maxLength: 20000/);
  assert.match(script, /data-feedback-editor/);
  assert.match(script, /\/v1\/admin\/submissions\/\$\{encodeURIComponent\(submissionId\)\}\/feedback/);
  assert.match(script, /\/v1\/submissions\/\$\{encodeURIComponent\(submissionId\)\}\/feedback/);
  assert.match(script, /state\.submissionRequestGeneration !== requestGeneration/);
  assert.match(script, /state\.selectedSubmissionId !== requestedId/);
  assert.match(script, /state\.adminSubmissionRequestGeneration !== requestGeneration/);
  assert.match(script, /state\.selectedAdminSubmissionId !== requestedId/);
  assert.match(css, /\.teacher-feedback-edit-pair/);
  assert.match(css, /\.teacher-feedback-actions\s*\{[^}]*position:\s*sticky/s);
  assert.doesNotMatch(script, /fromWritingExerciseId\([^)]*topicInput/);
  assert.match(css, /\.topic-reference-details/);
  assert.match(css, /\.topic-reference-table-scroll[^}]*overflow-x:\s*auto/s);
  assert.match(topicAccessMigration, /returns table \(id uuid, name text, session_expires_at timestamptz, access jsonb\)/i);
  assert.match(topicAccessMigration, /jsonb_typeof\(student\.access\) = 'object'/i);
  assert.match(topicAccessMigration, /student\.access\s*-\s*'__adminMessage'\s+as access/i);
  assert.match(topicAccessMigration, /access_entry\.key <> '__adminMessage'[\s\S]*?jsonb_typeof\(access_entry\.value\) <> 'boolean'/i);
  assert.match(topicAccessMigration, /revoke all on function public\.writing_submission_student_profile\(uuid\)[\s\S]*?from public, anon, authenticated, service_role/i);
  assert.match(topicAccessMigration, /grant execute on function public\.writing_submission_student_profile\(uuid\) to service_role/i);
});

test("structured feedback supports suggested rewrites, safe formatting, row editing and shared font scaling", () => {
  const normalizeFeedbackSource = script.match(
    /function normalizeTeacherFeedback\(value\) \{[\s\S]*?^\}/m
  )?.[0] || "";
  const richRendererSource = script.match(
    /function appendFeedbackRichText\(container, textValue, formattingValue,[\s\S]*?^\}/m
  )?.[0] || "";
  const richEditorSource = script.match(
    /function createFeedbackRichEditor\([^)]*\) \{[\s\S]*?^\}/m
  )?.[0] || "";
  const studentFeedbackSource = script.match(
    /function renderStudentFeedback\(feedback, container\) \{[\s\S]*?^\}/m
  )?.[0] || "";
  const rowFactorySource = script.match(
    /function createFeedbackEditorRow\([^)]*\) \{[\s\S]*?^\}/m
  )?.[0] || "";
  const renumberSource = script.match(
    /function renumberFeedbackEditorRows\(list\) \{[\s\S]*?^\}/m
  )?.[0] || "";
  const editorReaderSource = script.match(
    /function readAdminFeedbackEditor\(editor,[^)]*\) \{[\s\S]*?^\}/m
  )?.[0] || "";
  const renderDetailSource = script.match(
    /function renderSubmissionDetail\(submission,[\s\S]*?^\}/m
  )?.[0] || "";
  const fontApplicationSource = script.match(
    /function applyFeedbackFontScale\([^)]*\) \{[\s\S]*?^\}/m
  )?.[0] || "";

  // Every sentence-level group transports its suggested rewrite and a separate
  // formatting run array for all three displayed bands.
  for (const field of [
    "suggestedWriting",
    "originalFormatting",
    "commentFormatting",
    "suggestionFormatting"
  ]) {
    assert.match(normalizeFeedbackSource, new RegExp(`\\b${field}:`));
    assert.match(editorReaderSource, new RegExp(`\\b${field}:`));
    assert.match(workerSource, new RegExp(`\\b${field}\\b`));
    assert.match(feedbackFragmentEnhancementMigration, new RegExp(`'${field}'`));
  }
  assert.match(rowFactorySource, /"建議寫法"/);
  assert.match(studentFeedbackSource, /"建議寫法"/);
  assert.match(studentFeedbackSource, /fragment\.suggestedWriting/);
  assert.match(studentFeedbackSource, /fragment\.suggestionFormatting/);
  assert.match(
    editorReaderSource,
    /pair\.dataset\.feedbackPrefilledOnly === "true" && !comment\.text && !suggestion\.text/
  );

  // Persisted content is rebuilt from text nodes plus the allowlisted inline
  // elements. It is never passed to an arbitrary-HTML parsing sink.
  assert.match(richRendererSource, /document\.createTextNode/);
  assert.match(richRendererSource, /document\.createElement\("strong"\)/);
  assert.match(richRendererSource, /document\.createElement\("em"\)/);
  assert.match(richRendererSource, /document\.createElement\("s"\)/);
  assert.match(richRendererSource, /document\.createElement\("mark"\)/);
  assert.match(richRendererSource, /mark\.dataset\.highlight = run\.highlight/);
  assert.doesNotMatch(
    richRendererSource,
    /innerHTML|outerHTML|insertAdjacentHTML|DOMParser|createContextualFragment/
  );
  assert.equal(
    (studentFeedbackSource.match(/appendFeedbackRichText\(/g) || []).length,
    2,
    "the student view must safely render original and suggestion formatting"
  );
  assert.match(
    studentFeedbackSource,
    /appendStructuredFeedbackRichText\(commentText, fragment\.edmundComment, fragment\.commentFormatting\)/
  );
  assert.match(script, /function createFeedbackStructuredLivePreview\(editor\)/);
  assert.match(script, /preview\.dataset\.feedbackStructuredPreview = editor\.dataset\.feedbackRichEditor/);
  assert.match(script, /editor\.addEventListener\("input",/);
  assert.match(script, /refreshFeedbackStructuredLivePreview\(editor, preview\)/);
  assert.match(script, /appendStructuredFeedbackRichText\(content, value\.text, value\.formatting\)/);
  assert.match(script, /commentBand\.append\(comment, createFeedbackStructuredLivePreview\(comment\)\)/);
  assert.match(script, /row\.append\(head, editor, createFeedbackStructuredLivePreview\(editor\)\)/);
  assert.match(css, /\.teacher-feedback-live-preview/);
  assert.match(css, /\.teacher-feedback-live-preview-content/);

  // Removing a row removes the actual group; both removal and insertion then
  // renumber visible labels and accessibility labels from current DOM order.
  assert.match(script, /const removeFeedbackPair = event\.target\.closest\("\[data-feedback-remove-pair\]"\)/);
  assert.match(script, /pair\?\.remove\(\);\s*if \(list\) renumberFeedbackEditorRows\(list\)/);
  assert.match(renumberSource, /pair\.dataset\.feedbackPosition = String\(index \+ 1\)/);
  assert.match(renumberSource, /label\.textContent = `原句 \$\{index \+ 1\}`/);
  assert.match(renumberSource, /editor\.setAttribute\("aria-label", `\$\{names\[field\] \|\| "評語內容"\} \$\{index \+ 1\}`\)/);
  assert.match(rowFactorySource, /dataset\.feedbackInsertAfter = "true"/);
  assert.match(script, /const inserted = createFeedbackEditorRow\(\{ index: 0 \}\);\s*pair\.after\(inserted\);\s*renumberFeedbackEditorRows\(list\)/);
  assert.match(script, /inserted\.querySelector\('\[data-feedback-rich-editor="original"\]'\)\?\.focus\(\)/);

  // The font control exposes the exact requested sequence, is always attached
  // before the student/admin detail branches, and updates both detail roots.
  const fontScaleMatch = script.match(
    /const FEEDBACK_FONT_SCALE_VALUES = Object\.freeze\(\[([^\]]+)\]\)/
  );
  assert.ok(fontScaleMatch, "feedback font-scale values must be declared");
  assert.deepEqual(
    fontScaleMatch[1].split(",").map(value => Number(value.trim())),
    [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3]
  );
  assert.match(renderDetailSource, /actions\.append\(feedbackFontScaleControl\(\)\);\s*if \(admin/);
  assert.match(renderDetailSource, /else if \(!admin\)/);
  assert.match(
    fontApplicationSource,
    /document\.querySelectorAll\("\[data-submission-detail\], \[data-admin-detail\]"\)/
  );
  assert.match(fontApplicationSource, /--submission-text-scale/);
  assert.match(script, /data-feedback-font-smaller/);
  assert.match(script, /data-feedback-font-larger/);
  assert.match(script, /data-feedback-font-scale/);

  // Toolbar colors are allowlisted. Keyboard color commands are covered by the
  // feedback-learning contract below; bold remains available from the toolbar.
  const highlightNamesMatch = script.match(
    /const FEEDBACK_HIGHLIGHT_COLORS = Object\.freeze\(\{([\s\S]*?)\}\)/
  );
  assert.ok(highlightNamesMatch, "feedback highlight colors must be declared");
  assert.deepEqual(
    [...highlightNamesMatch[1].matchAll(/\b(yellow|orange|blue|green|red)\s*:/g)].map(match => match[1]),
    ["yellow", "orange", "blue", "green", "red"]
  );
  for (const color of ["yellow", "orange", "blue", "green", "red"]) {
    assert.match(css, new RegExp(`mark\\[data-highlight="${color}"\\]`));
  }
  assert.match(script, /if \(command === "bold"\) document\.execCommand\("bold", false\)/);
  assert.match(script, /command === "italic"[\s\S]*?document\.execCommand\("italic", false\)/);
  assert.match(script, /command === "strikethrough"[\s\S]*?document\.execCommand\("strikeThrough", false\)/);
});

test("feedback learning tools, bookmarks and admin sorting are fully wired to the frontend", () => {
  const richEditorSource = script.match(
    /function createFeedbackRichEditor\([\s\S]*?\n\}/
  )?.[0] || "";
  const adminFeedbackReaderSource = script.match(
    /function readAdminFeedbackEditor\(editor,[^)]*\) \{[\s\S]*?^\}/m
  )?.[0] || "";
  assert.match(richEditorSource, /feedbackFormattingCommandFromEvent\(event\)/);
  assert.match(richEditorSource, /applyFeedbackFormatting\(command\)/);
  assert.match(richEditorSource, /event\.shiftKey\s*&&\s*event\.key === "Enter"/);
  assert.match(richEditorSource, /document\.execCommand\("insertText", false, "\\n\\n"\)/);
  assert.match(script, /parseNumberedFeedbackBlocks\(/);
  assert.match(script, /sliceFeedbackFormattingRuns\(/);
  assert.match(css, /\.feedback-numbered-card/);
  assert.match(css, /\.feedback-number-badge/);

  for (const [key, color] of Object.entries({ y: "yellow", o: "orange", b: "blue", g: "green", r: "red" })) {
    assert.match(feedbackTools, new RegExp(`${key}: "${color}"`));
  }
  assert.match(feedbackTools, /\(!event\.metaKey && !event\.ctrlKey\)/);

  assert.match(html, /data-feedback-bookmarks-button[^>]*>我的評語書籤<\/button>/);
  assert.match(html, /data-view="feedback-bookmarks"/);
  assert.match(html, /data-feedback-bookmark-list/);
  assert.match(script, /showView\("feedback-bookmarks"\)/);
  assert.match(script, /\/v1\/feedback-bookmarks/);
  assert.match(script, /data-feedback-bookmark/);
  assert.match(script, /method:\s*"PUT"/);
  assert.match(css, /\.feedback-bookmark-button\[aria-pressed="true"\]/);
  assert.match(css, /\.feedback-bookmark-card/);

  assert.match(script, /suggestion-copy/);
  assert.match(script, /dataset\.suggestionCopyText/);
  assert.match(script, /dataset\.suggestionCopySave/);
  assert.match(script, /expectedVersion:\s*fragment\.suggestionCopyVersion/);
  assert.match(script, /建議寫法 - 抄寫/);
  assert.match(css, /\.teacher-feedback-suggestion-copy/);

  assert.match(html, /data-admin-name-sort/);
  assert.match(script, /state\.adminStudentSort === "desc" \? -1 : 1/);
  assert.match(script, /localeCompare\([\s\S]*?\["zh-Hant", "en"\]/);
  assert.match(script, /state\.adminStudentSort = state\.adminStudentSort === "asc" \? "desc" : "asc"/);
  assert.match(script, /姓名 A → Z/);
  assert.match(script, /姓名 Z → A/);

  assert.match(adminFeedbackReaderSource, /const grammarPoints = normalizeGrammarFeedbackPoints\(/);
  assert.match(adminFeedbackReaderSource, /const readEnhancementParts = kind => normalizeFeedbackEnhancementParts\(/);
  assert.match(adminFeedbackReaderSource, /const sentenceStructureParts = readEnhancementParts\("sentence"\)/);
  assert.match(adminFeedbackReaderSource, /const rhetoricalParts = readEnhancementParts\("rhetorical"\)/);
  assert.match(script, /const MAX_FEEDBACK_BODY_BYTES = 512 \* 1024/);
  assert.match(script, /new TextEncoder\(\)\.encode\(requestBody\)\.byteLength > MAX_FEEDBACK_BODY_BYTES/);
  assert.match(script, /整份評語內容超出安全儲存上限/);
  assert.match(script, /const maximum = 100/);
  assert.match(script, /文法評語站/);
  assert.match(script, /文法重點/);
  assert.match(script, /句子結構提升區/);
  assert.match(script, /Original Sentence 原句/);
  assert.match(script, /Enhancement 改良寫法/);
  assert.match(script, /Benefit 好處／作用/);
  assert.match(script, /修辭技巧提升區/);
  assert.match(adminFeedbackReaderSource, /return \{[\s\S]*?grammarPoints,[\s\S]*?sentenceStructureMethods,[\s\S]*?sentenceStructureParts,[\s\S]*?rhetoricalParts,[\s\S]*?sentenceStructureLinks,/);

  assert.match(adminFeedbackReaderSource, /feedbackSentencePickerLinks\(/);
  assert.match(script, /function createFeedbackSentencePicker\(links = \[\]\)/);
  assert.match(script, /選擇 Sentence Structure 練習/);
  assert.match(script, /dataset\.feedbackSentenceSearch/);
  assert.match(script, /dataset\.feedbackSentenceResourceId/);
  assert.match(script, /dataset\.feedbackSentenceRemove/);
  assert.match(script, /row\.draggable = true/);
  assert.match(script, /dataset\.feedbackSentenceMove = "up"/);
  assert.match(script, /dataset\.feedbackSentenceMove = "down"/);
  assert.match(script, /已加入的句子結構練習（\$\{links\.length\}）/);
  assert.match(script, /filterHomeworkResources\([\s\S]*?"sentence-structure"[\s\S]*?60/);
  assert.doesNotMatch(script, /data\.feedbackSentenceLinks/);
  assert.match(css, /\.teacher-feedback-sentence-picker/);
  assert.match(css, /\.teacher-feedback-sentence-results/);
  assert.match(css, /\.teacher-feedback-sentence-chip/);
  assert.match(feedbackTools, /url\.hostname !== "edmundeducation\.com"/);
  assert.match(feedbackTools, /url\.pathname !== "\/sentence-structure\.html"/);
  assert.match(feedbackTools, /parameters\.length !== 1/);
  assert.match(feedbackTools, /SENTENCE_STRUCTURE_LESSON_RE\.test\(lesson\)/);

  assert.match(
    script,
    /\/v1\/submissions\/\$\{[^}]+\}\/feedback\/fragments\/\$\{[^}]+\}\/suggestion-copy/
  );
  assert.match(script, /apiJson\(`\/v1\/feedback-bookmarks\?page=\$\{page\}&pageSize=100`\)/);
  assert.match(script, /`\/v1\/feedback-bookmarks\/\$\{[^}]+\}`/);
});

test("writing feedback permanently exposes the same searchable 345-lesson Sentence Structure catalogue", () => {
  const resources = HOMEWORK_RESOURCE_CATALOG.filter(resource => resource.type === "sentence-structure");
  assert.equal(resources.length, 345);
  assert.ok(resources.every(resource => normalizeSentenceStructureDeepLink(resource.url) === `/${resource.url}`));

  for (const query of ["5", "while", "雖然", "sentence:ss5"]) {
    const result = filterHomeworkResources(HOMEWORK_RESOURCE_CATALOG, "sentence-structure", query, 60);
    assert.ok(result.total > 0, `expected Sentence Structure results for ${query}`);
    assert.ok(result.items.length <= 60);
  }

  const pickerSource = script.match(
    /function createFeedbackSentencePicker\(links = \[\]\) \{[\s\S]*?^\}/m
  )?.[0] || "";
  assert.match(pickerSource, /dataset\.feedbackSentencePicker = "true"/);
  assert.match(pickerSource, /dataset\.feedbackSentenceSearch = "true"/);
  assert.match(pickerSource, /dataset\.feedbackSentenceResults = "true"/);
  assert.match(pickerSource, /dataset\.feedbackSentenceSelected = "true"/);
  assert.match(pickerSource, /queueMicrotask\(\(\) => initializeFeedbackSentencePicker\(picker\)\)/);
  assert.doesNotMatch(pickerSource, /hidden|close/i);
  assert.match(script, /seen\.has\(url\)/);
  assert.match(script, /links\.length >= MAX_FEEDBACK_SENTENCE_LINKS/);
});

test("article and feedback navigation invalidates stale requests and clears sensitive detail", () => {
  const clearSessionSource = script.match(/function clearSession\(\) \{[\s\S]*?^\}/m)?.[0] || "";
  assert.match(clearSessionSource, /state\.selectedSubmissionId = ""/);
  assert.match(clearSessionSource, /state\.selectedStudentFeedback = null/);
  assert.match(clearSessionSource, /state\.submissionRequestGeneration \+= 1/);
  assert.match(clearSessionSource, /state\.selectedAdminSubmissionId = ""/);
  assert.match(clearSessionSource, /state\.adminSubmissionRequestGeneration \+= 1/);
  assert.match(clearSessionSource, /state\.selectedAdminFeedback = null/);
  assert.match(clearSessionSource, /state\.adminFeedbackSuggestedFragments = \[\]/);
  assert.match(clearSessionSource, /elements\.submissionDetail\.replaceChildren/);
  assert.match(clearSessionSource, /elements\.adminDetail\.replaceChildren/);

  const studentOpenSource = script.match(/async function openSubmission\(id\) \{[\s\S]*?^\}/m)?.[0] || "";
  assert.match(studentOpenSource, /const requestGeneration = state\.submissionRequestGeneration \+ 1;\s*state\.submissionRequestGeneration = requestGeneration/);
  assert.equal((studentOpenSource.match(/state\.submissionRequestGeneration !== requestGeneration/g) || []).length, 2);
  assert.match(studentOpenSource, /loadStudentFeedback\(submission\.id, elements\.submissionDetail, requestGeneration\)/);
  const studentFeedbackSource = script.match(/async function loadStudentFeedback\(submissionId, container, requestGeneration\) \{[\s\S]*?^\}/m)?.[0] || "";
  assert.equal((studentFeedbackSource.match(/state\.submissionRequestGeneration !== requestGeneration/g) || []).length, 2);

  const adminOpenSource = script.match(/async function openAdminSubmission\(id\) \{[\s\S]*?^\}/m)?.[0] || "";
  assert.match(adminOpenSource, /const requestGeneration = state\.adminSubmissionRequestGeneration \+ 1;\s*state\.adminSubmissionRequestGeneration = requestGeneration/);
  assert.equal((adminOpenSource.match(/state\.adminSubmissionRequestGeneration !== requestGeneration/g) || []).length, 2);
  assert.match(adminOpenSource, /loadAdminFeedback\(submission, elements\.adminDetail, requestGeneration\)/);
  const adminFeedbackSource = script.match(/async function loadAdminFeedback\(submission, container, requestGeneration\) \{[\s\S]*?^\}/m)?.[0] || "";
  assert.equal((adminFeedbackSource.match(/state\.adminSubmissionRequestGeneration !== requestGeneration/g) || []).length, 2);

  const currentEditorSource = script.match(/function isCurrentAdminFeedbackEditor\(submissionId, requestGeneration, editor\) \{[\s\S]*?^\}/m)?.[0] || "";
  assert.match(currentEditorSource, /state\.adminSubmissionRequestGeneration === requestGeneration/);
  assert.match(currentEditorSource, /state\.selectedAdminSubmissionId === submissionId/);
  assert.match(currentEditorSource, /editor\?\.isConnected/);
  assert.match(currentEditorSource, /editor\.parentElement === elements\.adminDetail/);

  const saveFeedbackSource = script.match(/async function saveAdminFeedback\(status\) \{[\s\S]*?^\}/m)?.[0] || "";
  assert.match(saveFeedbackSource, /const requestGeneration = state\.adminSubmissionRequestGeneration/);
  assert.match(saveFeedbackSource, /if \(isCurrentAdminFeedbackEditor\(submissionId, requestGeneration, editor\)\) \{\s*await openAdminSubmission\(submissionId\)/);
  assert.equal((saveFeedbackSource.match(/openAdminSubmission\(submissionId\)/g) || []).length, 1);
  const saveNetworkCatchIndex = saveFeedbackSource.lastIndexOf("} catch (error)");
  const staleSaveGuardIndex = saveFeedbackSource.indexOf(
    "if (!isCurrentAdminFeedbackEditor(submissionId, requestGeneration, editor))",
    saveNetworkCatchIndex
  );
  assert.ok(
    staleSaveGuardIndex > saveNetworkCatchIndex
      && staleSaveGuardIndex < saveFeedbackSource.indexOf("setStatus(", saveNetworkCatchIndex),
    "stale feedback-save failures must not write into a detached editor"
  );
  const deleteFeedbackSource = script.match(/async function deleteAdminFeedback\(\) \{[\s\S]*?^\}/m)?.[0] || "";
  assert.match(deleteFeedbackSource, /const requestGeneration = state\.adminSubmissionRequestGeneration/);
  assert.match(deleteFeedbackSource, /if \(isCurrentAdminFeedbackEditor\(submissionId, requestGeneration, editor\)\) \{\s*await openAdminSubmission\(submissionId\)/);
  assert.equal((deleteFeedbackSource.match(/openAdminSubmission\(submissionId\)/g) || []).length, 1);

  const deleteSubmissionSource = script.match(/async function deleteStudentSubmission\(id\) \{[\s\S]*?^\}/m)?.[0] || "";
  assert.match(deleteSubmissionSource, /if \(state\.selectedSubmissionId === id\) \{[\s\S]*?state\.submissionRequestGeneration \+= 1/);
});

test("published feedback is optional by section, unread-aware, and supports saved transcription", () => {
  assert.match(script, /hasPublishedFeedback/);
  assert.match(script, /feedbackUnread/);
  assert.match(script, /row\.classList\.add\("has-feedback"\)/);
  assert.match(script, /submission-feedback-bell/);
  assert.match(script, /`submission-row\$\{submission\.hasPublishedFeedback \? " has-feedback" : ""\}`/);
  assert.match(script, /保留原意改良版/);
  assert.match(script, /謄文區 - 1 Edmund 改良版/);
  assert.match(script, /謄文區 - 範文/);
  assert.match(script, /\/transcriptions/);
  assert.match(script, /expectedVersion:\s*feedback\.transcriptionVersion/);
  assert.match(script, /loadFeedbackModelEssayDetails/);
  assert.match(script, /dataset\.topicReferenceTranslationToggle/);
  assert.match(css, /\.submission-list-item\.has-feedback/);
  assert.match(css, /\.submission-feedback-bell/);
  assert.match(css, /\.teacher-feedback-transcriptions/);
  assert.match(workerSource, /writing_submission_feedback_student_open_v4/);
  assert.match(workerSource, /writing_submission_feedback_student_save_transcriptions/);
  assert.match(workerSource, /writing_submission_feedback_admin_get_v5/);
  assert.match(workerSource, /writing_submission_feedback_admin_save_v4/);
  assert.match(workerSource, /p_improved_version:\s*payload\.improvedVersion/);
  assert.match(workerSource, /!overallComment\.trim\(\)[\s\S]*?!finalComment\.trim\(\)[\s\S]*?!improvedVersion\.trim\(\)[\s\S]*?fragments\.length === 0[\s\S]*?grammarPoints/);
  assert.match(feedbackRevisionMigration, /add column if not exists improved_version text/);
  assert.match(feedbackRevisionMigration, /add column if not exists student_read_at timestamptz/);
  assert.match(feedbackRevisionMigration, /writing_submission_feedback_unread_idx/);
  assert.match(feedbackRevisionMigration, /writing_submission_feedback_student_open/);
  assert.match(feedbackRevisionMigration, /writing_submission_feedback_student_save_transcriptions/);
  assert.match(feedbackRevisionMigration, /writing_submission_admin_list_submissions_v3/);
  assert.match(feedbackRevisionMigration, /alter table public\.writing_submission_feedback_transcriptions enable row level security/i);
  assert.doesNotMatch(feedbackRevisionMigration, /grant (?:select|insert|update|delete) on table/i);
});

test("structured sentence and rhetorical feedback persistence remains additive and locked to the Worker", () => {
  assert.match(feedbackStructuredPartsMigration, /add column if not exists sentence_structure_parts jsonb not null default '\[\]'::jsonb/i);
  assert.match(feedbackStructuredPartsMigration, /add column if not exists rhetorical_parts jsonb not null default '\[\]'::jsonb/i);
  assert.match(feedbackStructuredPartsMigration, /writing_submission_feedback_student_open_v3/);
  assert.match(feedbackStructuredPartsMigration, /writing_submission_feedback_admin_get_v4/);
  assert.match(feedbackStructuredPartsMigration, /writing_submission_feedback_admin_save_v3/);
  assert.match(feedbackStructuredPartsMigration, /'italic', 'strikethrough'/);
  assert.match(feedbackStructuredPartsMigration, /'yellow', 'orange', 'blue', 'green', 'red'/);
  assert.match(feedbackStructuredPartsMigration, /set search_path = ''/i);
  assert.match(feedbackStructuredPartsMigration, /revoke all on function public\.writing_submission_feedback_student_open_v3\([\s\S]*?from public, anon, authenticated, service_role/i);
  assert.match(feedbackStructuredPartsMigration, /grant execute on function public\.writing_submission_feedback_student_open_v3\([\s\S]*?to service_role/i);
  assert.match(workerSource, /p_sentence_structure_parts:\s*payload\.sentenceStructureParts/);
  assert.match(workerSource, /p_rhetorical_parts:\s*payload\.rhetoricalParts/);
});

test("additional feedback sections, ordered transcription and per-item copy practice stay private", () => {
  for (const [dataKey, label] of [
    ["phrasalVerbParts", "動詞片語 (Phrasal Verb) 提升區"],
    ["writingCommonExpressionParts", "Writing - Common Expression 提升區"],
    ["rhetoricalCommonExpressionParts", "修辭 Common Expression 提升區"]
  ]) {
    assert.match(script, new RegExp(dataKey));
    assert.match(script, new RegExp(label.replace(/[()]/g, "\\$&")));
  }
  for (const title of [
    "句子結構提升 - 抄寫",
    "修辭技巧提升 - 抄寫",
    "動詞片語 (Phrasal Verb) 提升 - 抄寫",
    "Writing - Common Expression 提升 - 抄寫",
    "修辭 Common Expression 提升 - 抄寫"
  ]) {
    assert.match(script, new RegExp(title.replace(/[()]/g, "\\$&")));
  }
  assert.match(script, /feedback\/enhancements\/\$\{encodeURIComponent\(sectionKey\)\}\/\$\{itemPosition\}\/copy/);
  assert.match(script, /expectedVersion:\s*current\.version/);
  assert.match(workerSource, /writing_submission_feedback_student_save_enhancement_copy/);
  assert.match(workerSource, /ENHANCEMENT_COPY_VERSION_CONFLICT/);
  assert.match(workerSource, /p_phrasal_verb_parts:\s*payload\.phrasalVerbParts/);
  assert.match(workerSource, /p_writing_common_expression_parts:\s*payload\.writingCommonExpressionParts/);
  assert.match(workerSource, /p_rhetorical_common_expression_parts:\s*payload\.rhetoricalCommonExpressionParts/);

  const studentFeedbackSource = script.match(
    /function renderStudentFeedback\(feedback, container\) \{[\s\S]*?^\}/m
  )?.[0] || "";
  const grammarIndex = studentFeedbackSource.indexOf("grammarArea");
  const transcriptionIndex = studentFeedbackSource.indexOf("renderStudentTranscriptions");
  const sentenceIndex = studentFeedbackSource.indexOf("sentenceArea");
  const rhetoricalIndex = studentFeedbackSource.indexOf("rhetoricalArea");
  const additionalIndex = studentFeedbackSource.indexOf('for (const kind of ["phrasal"');
  assert.ok(
    grammarIndex >= 0
      && grammarIndex < transcriptionIndex
      && transcriptionIndex < sentenceIndex
      && sentenceIndex < rhetoricalIndex
      && rhetoricalIndex < additionalIndex,
    "feedback must show grammar, transcription/improved copy, sentence, rhetoric, then extra sections"
  );

  assert.match(feedbackAdditionalEnhancementsMigration, /add column if not exists phrasal_verb_parts jsonb not null default '\[\]'::jsonb/i);
  assert.match(feedbackAdditionalEnhancementsMigration, /add column if not exists writing_common_expression_parts jsonb not null default '\[\]'::jsonb/i);
  assert.match(feedbackAdditionalEnhancementsMigration, /add column if not exists rhetorical_common_expression_parts jsonb not null default '\[\]'::jsonb/i);
  assert.match(feedbackAdditionalEnhancementsMigration, /create table if not exists public\.writing_submission_feedback_enhancement_copies/i);
  assert.match(feedbackAdditionalEnhancementsMigration, /alter table public\.writing_submission_feedback_enhancement_copies enable row level security/i);
  assert.match(feedbackAdditionalEnhancementsMigration, /revoke all on table public\.writing_submission_feedback_enhancement_copies[\s\S]*?from public, anon, authenticated, service_role/i);
  assert.match(feedbackAdditionalEnhancementsMigration, /set search_path = ''/i);
  assert.match(feedbackAdditionalEnhancementsMigration, /revoke all on function public\.writing_submission_feedback_student_save_enhancement_copy[\s\S]*?from public, anon, authenticated, service_role/i);
  assert.match(feedbackAdditionalEnhancementsMigration, /grant execute on function public\.writing_submission_feedback_student_save_enhancement_copy[\s\S]*?to service_role/i);
  assert.doesNotMatch(feedbackAdditionalEnhancementsMigration, /grant (?:select|insert|update|delete) on table/i);
});

test("submission topic linkage is canonicalized and authorized by the Worker", () => {
  assert.match(workerSource, /WRITING_SUBMISSION_TOPIC_CATALOG/);
  assert.match(workerSource, /CANONICAL_WRITING_TOPICS/);
  assert.match(workerSource, /JSON\.stringify\(normalized\) !== JSON\.stringify\(canonical\)/);
  assert.match(workerSource, /authorizeTopicResource\(payload\.topicResource, student\)/);
  assert.match(workerSource, /student\.access\[resource\.sectionKey\] === false/);
  assert.match(workerTopicCatalog, /Generated by tools\/generate-writing-submission-worker-topic-catalog\.mjs/);
  assert.match(workerTopicCatalog, /"id": "fill:dse-writing-2025-part-a"/);
  assert.doesNotMatch(workerTopicCatalog, /"paragraphs"\s*:|"chinese"\s*:|"modelEssay"\s*:/i);
  assert.match(feedbackRevisionMigration, /add column if not exists topic_resource jsonb/);
  assert.match(feedbackRevisionMigration, /writing_submission_submit_v4/);
  assert.match(feedbackRevisionMigration, /writing_submission_get_v3/);
  assert.match(feedbackRevisionMigration, /writing_submission_list_v3/);
  assert.match(feedbackRevisionMigration, /topic_resource ->> 'type' is not distinct from 'fill-blanks'/);
  assert.match(feedbackRevisionMigration, /coalesce\(p_topic_resource ->> 'id', ''\) !~ '\^fill:/);
  const submitV4 = feedbackRevisionMigration.match(
    /create or replace function public\.writing_submission_submit_v4[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(submitV4, /from public\.writing_submission_submit_v3\(/);
  assert.doesNotMatch(submitV4, /pg_advisory_xact_lock/);
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
  assert.match(aiAdapter, /edmund-advanced-grammar/);
  assert.doesNotMatch(aiAdapter, /cloudflare|workers[ -]?ai|@cf\//i);
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
