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
  assert.match(html, /writing-submission\.css\?v=20260812-feedback2/);
  assert.match(html, /writing-submission\.js\?v=20260812-feedback3/);
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

test("countdown and student-owned composition exports are fully wired", () => {
  assert.match(html, /data-writing-timer-toggle/);
  assert.match(html, /data-writing-timer-force/);
  assert.match(html, /時間到自動提交/);
  assert.match(html, /data-export-selected-submissions/);
  assert.match(html, /data-export-all-submissions/);
  assert.match(script, /writingTimer:\s*normalizeWritingTimer\(value\.writingTimer\)/);
  assert.match(script, /submissionPromise/);
  assert.match(script, /submitCurrentWriting\(\{ source: "timer" \}\)/);
  assert.match(script, /method:\s*"PUT"/);
  assert.match(script, /\/v1\/submissions\/\$\{encodeURIComponent\(normalizedId\)\}/);
  assert.match(script, /exportStudentSubmissions\(state\.submissions\.map/);
  assert.match(script, /列印／儲存為 PDF/);
  assert.doesNotMatch(script, /\/v1\/admin\/submissions\/\$\{encodeURIComponent\(normalizedId\)\}/);
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
  assert.match(script, /source\.startsWith\("\/\/"\)/, "topic preview images must reject protocol-relative external URLs");
  assert.match(script, /apiJson\("\/v1\/progress"\)/);
  assert.match(script, /method:\s*"DELETE"/);
  assert.match(script, /文法問題記錄仍會保留給管理員/);
  assert.match(css, /\.submission-detail-head h2[^}]*font-size:\s*clamp\(20px, 2\.1vw, 25px\)/s);
  assert.match(css, /\.submission-progress-grid/);
  assert.match(css, /\.grammar-toggle input:checked/);
  assert.match(css, /\.topic-picker-dialog/);
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
  assert.match(script, /flashcards\.html\?deck=\$\{encodeURIComponent\(flashDeckId\)\}/);
  assert.match(script, /重溫 Flash Card 請按這裡：/);
  assert.match(script, /重溫 Fill In The Blanks 請按這裡：/);
  assert.match(script, /展開以 Open Book 參考 Edmund 範文 Model Essay/);
  assert.match(script, /展開以 Open Book 參考 Edmund 主題性生字 Thematic Vocabulary/);
  assert.match(script, /writing-submission-reference-data\.mjs\?v=/);
  assert.match(script, /TOPIC_REFERENCE_VERSION\s*=\s*"20260811-2"/);
  assert.match(script, /reference\.exerciseId !== route\.exerciseId/);
  assert.match(script, /reference\.writingHref !== route\.writingHref/);
  assert.match(script, /reference\.flashDeckId !== route\.flashDeckId/);
  assert.match(script, /dataset\.topicReferenceRetry/);
  assert.match(script, /暫時未能載入參考內容/);
  assert.match(script, /dataset\.topicReferenceTranslationToggle/);
  assert.match(script, /pair\.dataset\.feedbackPrefilledOnly = "true"/);
  assert.match(script, /pair\.dataset\.feedbackPrefilledOnly === "true" && !edmundComment/);
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
  assert.match(script, /fragment\.originalFragment\.trim\(\) \|\| fragment\.edmundComment\.trim\(\)/);
  assert.match(script, /\[\^\.\!\?;。！？；\]\+/);
  assert.match(script, /const expectedVersion = state\.selectedAdminFeedback\?\.version \|\| 0/);
  assert.match(script, /const expectedFeedbackId = state\.selectedAdminFeedback\?\.id \|\| null/);
  assert.match(script, /method: "DELETE",[\s\S]*?expectedFeedbackId,[\s\S]*?expectedVersion/);
  assert.match(script, /original\.maxLength = 10000/);
  assert.match(script, /comment\.maxLength = 20000/);
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
  assert.match(workerSource, /writing_submission_feedback_student_open/);
  assert.match(workerSource, /writing_submission_feedback_student_save_transcriptions/);
  assert.match(workerSource, /writing_submission_feedback_admin_get_v2/);
  assert.match(workerSource, /p_improved_version:\s*payload\.improvedVersion/);
  assert.match(workerSource, /if \(!overallComment\.trim\(\) && !finalComment\.trim\(\) && !improvedVersion\.trim\(\) && fragments\.length === 0\)/);
  assert.match(feedbackRevisionMigration, /add column if not exists improved_version text/);
  assert.match(feedbackRevisionMigration, /add column if not exists student_read_at timestamptz/);
  assert.match(feedbackRevisionMigration, /writing_submission_feedback_unread_idx/);
  assert.match(feedbackRevisionMigration, /writing_submission_feedback_student_open/);
  assert.match(feedbackRevisionMigration, /writing_submission_feedback_student_save_transcriptions/);
  assert.match(feedbackRevisionMigration, /writing_submission_admin_list_submissions_v3/);
  assert.match(feedbackRevisionMigration, /alter table public\.writing_submission_feedback_transcriptions enable row level security/i);
  assert.doesNotMatch(feedbackRevisionMigration, /grant (?:select|insert|update|delete) on table/i);
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
