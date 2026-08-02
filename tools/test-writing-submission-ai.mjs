import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const TEST_MODE_KEY = "EDMUND_WRITING_AI_ESM_TEST";
const thisFile = fileURLToPath(import.meta.url);

// The production site intentionally has no root package.json. Re-run this
// focused test with browser .js files interpreted as ESM without changing the
// repository-wide module mode.
if (process.env[TEST_MODE_KEY] !== "1") {
  const result = spawnSync(
    process.execPath,
    ["--experimental-default-type=module", thisFile],
    {
      cwd: process.cwd(),
      env: { ...process.env, [TEST_MODE_KEY]: "1" },
      encoding: "utf8"
    }
  );
  process.stdout.write(result.stdout || "");
  process.stderr.write(result.stderr || "");
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

const root = path.resolve(path.dirname(thisFile), "..");
const adapter = await import(pathToFileURL(path.join(root, "writing-submission-ai.js")));

const AI_ENGINE = Object.freeze({
  name: "cloudflare-workers-ai",
  version: "2026-07-31.1",
  model: "@cf/meta/llama-3.1-8b-instruct-fast",
  execution: "cloudflare-worker"
});
const LOCAL_ENGINE = Object.freeze({
  name: "edmund-esl-basics",
  version: "2.0.0",
  execution: "browser"
});
const HARPER_ENGINE = Object.freeze({
  name: "harper.js",
  version: "2.7.0",
  execution: "browser"
});
const CORPUS_ENGINE = Object.freeze({
  name: "edmund-approved-grammar-corpus",
  version: "2026-08-02.2",
  execution: "cloudflare-worker"
});

const cancelledFailure = adapter.classifyRemoteGrammarFailure({ name: "AbortError" });
assert.deepEqual(cancelledFailure, {
  kind: "cancelled",
  shouldWarn: false,
  backoffMs: 0,
  globalStatus: "unchanged"
});
assert.ok(Object.isFrozen(cancelledFailure));

assert.deepEqual(
  adapter.classifyRemoteGrammarFailure({ name: "AbortError" }, { timedOut: true }),
  {
    kind: "timeout",
    shouldWarn: true,
    backoffMs: 0,
    globalStatus: "timeout"
  },
  "a request deadline is not an intentional cancellation and must not open a global backoff"
);

assert.deepEqual(
  adapter.classifyRemoteGrammarFailure({
    status: 502,
    code: "GRAMMAR_CHECK_INCONCLUSIVE"
  }),
  {
    kind: "inconclusive",
    shouldWarn: true,
    backoffMs: 0,
    globalStatus: "inconclusive"
  },
  "one rejected model response is a per-sentence incomplete review, not a service outage"
);

assert.deepEqual(
  adapter.classifyRemoteGrammarFailure({
    status: 429,
    code: "TOO_MANY_GRAMMAR_CHECKS"
  }),
  {
    kind: "rate_limited",
    shouldWarn: true,
    backoffMs: 60000,
    globalStatus: "rate_limited"
  }
);
assert.deepEqual(
  adapter.classifyRemoteGrammarFailure({
    status: 429,
    code: "TOO_MANY_GRAMMAR_CHECKS",
    retryAfterMs: 90000
  }),
  {
    kind: "rate_limited",
    shouldWarn: true,
    backoffMs: 90000,
    globalStatus: "rate_limited",
    retryAfterMs: 90000
  },
  "the browser must honor a longer server-provided rate-limit window"
);

const quotaExhaustedFailure = adapter.classifyRemoteGrammarFailure({
  status: 503,
  code: "GRAMMAR_CHECK_QUOTA_EXHAUSTED"
});
assert.deepEqual(
  quotaExhaustedFailure,
  {
    kind: "quota_exhausted",
    shouldWarn: true,
    backoffMs: 60 * 60 * 1000,
    globalStatus: "quota_exhausted"
  },
  "the explicit Workers AI daily-quota contract receives its own one-hour in-page cooldown"
);

assert.deepEqual(
  adapter.classifyRemoteGrammarFailure(new TypeError("fetch failed")),
  {
    kind: "network",
    shouldWarn: true,
    backoffMs: 30000,
    globalStatus: "network"
  }
);
assert.equal(
  adapter.classifyRemoteGrammarFailure({
    status: 503,
    code: "GRAMMAR_CHECK_UNAVAILABLE"
  }).kind,
  "provider_failure",
  "an explicit Worker service failure must not be mislabeled as a browser network failure"
);
const genericUnavailableFailure = adapter.classifyRemoteGrammarFailure({
  status: 503,
  code: "GRAMMAR_CHECK_UNAVAILABLE"
});
assert.deepEqual(
  genericUnavailableFailure,
  {
    kind: "provider_failure",
    shouldWarn: true,
    backoffMs: 30000,
    globalStatus: "provider_failure"
  },
  "a generic provider outage must remain distinct from the explicit daily-quota response"
);

const retryableProviderFailure = adapter.classifyRemoteGrammarFailure({
  status: 503,
  code: "GRAMMAR_CHECK_PROVIDER_FAILURE",
  retryAfterMs: 1200
});
assert.deepEqual(retryableProviderFailure, {
  kind: "provider_failure",
  shouldWarn: true,
  backoffMs: 30000,
  globalStatus: "provider_failure",
  retryAfterMs: 1200
});
assert.equal(adapter.remoteGrammarRetryDelayMs(retryableProviderFailure, 0), 1200);
assert.equal(
  adapter.remoteGrammarRetryDelayMs(retryableProviderFailure, 1),
  null,
  "an explicit provider failure receives at most one automatic retry"
);
assert.equal(
  adapter.remoteGrammarRetryDelayMs(
    adapter.classifyRemoteGrammarFailure({ name: "AbortError" }, { timedOut: true }),
    0
  ),
  null,
  "an outcome-ambiguous browser timeout must not be retried"
);
assert.equal(
  adapter.remoteGrammarRetryDelayMs(adapter.classifyRemoteGrammarFailure(new TypeError("offline")), 0),
  null,
  "an outcome-ambiguous browser network failure must not be retried"
);
assert.equal(
  adapter.remoteGrammarRetryDelayMs({ ...retryableProviderFailure, retryAfterMs: 5000 }, 0),
  null,
  "a Retry-After beyond the bounded retry window is honored by deferring to page backoff"
);

const incompleteReviewFailure = adapter.classifyRemoteGrammarFailure({
  status: 502,
  code: "GRAMMAR_CHECK_INCONCLUSIVE"
});
const localTomLoveIssues = [
  {
    ruleId: "EslSingularNamePresentAgreement",
    title: "單數人名與動詞一致",
    category: "Learner English",
    message: "Tom 是第三人稱單數；一般現在式動詞要加 s。",
    originalText: "love",
    suggestedText: "loves",
    start: 4,
    end: 8,
    engine: LOCAL_ENGINE
  },
  {
    ruleId: "EslPreferenceInfinitiveOrGerund",
    title: "love 後用 to + 動詞或 -ing",
    category: "Learner English",
    message: "love 後面不能直接接另一個動詞原形。",
    originalText: "eat",
    suggestedText: "to eat",
    start: 9,
    end: 12,
    engine: LOCAL_ENGINE
  }
];
const localTomLoveAfterIncompleteAi = adapter.mergeWritingGrammarIssues(
  "Tom love eat food.",
  localTomLoveIssues,
  []
);
assert.equal(localTomLoveAfterIncompleteAi.length, 2);
assert.deepEqual(
  localTomLoveAfterIncompleteAi.map((issue) => [issue.originalText, issue.suggestedText]),
  [["love", "loves"], ["eat", "to eat"]],
  "an inconclusive remote review must not remove either local grammar card"
);
assert.equal(incompleteReviewFailure.globalStatus, "inconclusive");
assert.deepEqual(
  adapter.writingGrammarReviewNotice(
    [incompleteReviewFailure.kind],
    localTomLoveAfterIncompleteAi.length
  ),
  {
    state: "warning",
    title: "未能安全判定這句文法",
    detail: "服務收到結果，但未能安全確認完整修正，因此沒有把它當作正確或無錯。以下本機提示仍然保留；未完成文法偵測的句子可能仍有其他問題。"
  }
);
assert.deepEqual(
  adapter.writingGrammarReviewNotice([incompleteReviewFailure.kind], 0),
  {
    state: "warning",
    title: "未能安全判定這句文法",
    detail: "服務收到結果，但未能安全確認完整修正，因此沒有把它當作正確或無錯。本機暫未提出建議，但這不代表句子沒有文法問題。"
  },
  "an incomplete AI review with no local card must show a warning, never a clean state"
);
assert.deepEqual(
  adapter.writingGrammarReviewNotice(
    [quotaExhaustedFailure.kind],
    localTomLoveAfterIncompleteAi.length
  ),
  {
    state: "warning",
    title: "文法偵測今日額度已用完",
    detail: "文法偵測今日額度已用完，會於香港時間 08:00 重設。以下本機提示仍然保留；未完成文法偵測的句子可能仍有其他問題。"
  },
  "a quota notice must preserve and qualify any local grammar cards"
);
assert.deepEqual(
  adapter.writingGrammarReviewNotice([quotaExhaustedFailure.kind], 0),
  {
    state: "warning",
    title: "文法偵測今日額度已用完",
    detail: "文法偵測今日額度已用完，會於香港時間 08:00 重設。本機暫未提出建議，但這不代表句子沒有文法問題。"
  },
  "quota exhaustion with no local card must never be rendered as a clean review"
);
assert.deepEqual(
  adapter.writingGrammarReviewNotice([genericUnavailableFailure.kind], 0),
  {
    state: "warning",
    title: "文法偵測服務暫時故障",
    detail: "上游文法服務未能完成檢查；系統只會在確認首個要求已失敗後作一次短暫重試。本機暫未提出建議，但這不代表句子沒有文法問題。"
  },
  "provider failure receives a precise notice instead of looking like a network failure"
);
assert.deepEqual(
  adapter.writingGrammarReviewNotice(["timeout", "network"], 0),
  {
    state: "warning",
    title: "未能完成 2 句的文法偵測",
    detail: "原因：回應逾時 1 句、網絡連線失敗 1 句。本機暫未提出建議，但這不代表句子沒有文法問題。"
  },
  "mixed failures remain individually observable"
);
assert.equal(adapter.writingGrammarReviewNotice([], 0), null);

const approvedSentence = "Many company requires uniforms.";
const approvedResponse = {
  engine: CORPUS_ENGINE,
  issues: [{
    ruleId: "MANY_PLURAL_NOUN",
    title: "Teacher-authored title is normalized by category",
    category: "singular_plural",
    message: "many 後面的可數名詞通常要用複數，所以寫 companies。",
    originalText: "company",
    suggestedText: "companies",
    start: 5,
    end: 12,
    confidence: 1,
    engine: CORPUS_ENGINE
  }]
};
const approvedIssues = adapter.normalizeWritingAiResponse(approvedSentence, approvedResponse);
assert.equal(approvedIssues.length, 1);
assert.equal(approvedIssues[0].ruleId, "MANY_PLURAL_NOUN");
assert.equal(approvedIssues[0].engineId, "edmund-approved-grammar-corpus");
assert.equal(adapter.writingGrammarEnginePriority(approvedIssues[0]), -1);
assert.throws(
  () => adapter.normalizeWritingAiResponse(approvedSentence, {
    engine: { name: "invented-remote-engine" },
    issues: approvedResponse.issues
  }),
  /unknown engine/,
  "only the two explicit Worker grammar engines are accepted"
);

const overlappingLocalIssue = {
  ruleId: "LocalCompanyPlural",
  title: "本機單複數",
  category: "singular_plural",
  message: "本機提示。",
  originalText: "company",
  suggestedText: "companies",
  start: 5,
  end: 12,
  engine: LOCAL_ENGINE
};
assert.deepEqual(
  adapter.mergeWritingGrammarIssues(
    approvedSentence,
    [overlappingLocalIssue],
    approvedResponse
  ).map((issue) => issue.engineId),
  ["edmund-approved-grammar-corpus"],
  "an exact teacher-approved issue must outrank an overlapping local heuristic"
);

const cleanSentence = "The students are ready.";
assert.deepEqual(
  adapter.normalizeWritingAiResponse(cleanSentence, {
    engine: AI_ENGINE,
    issues: []
  }),
  [],
  "a successful 200-style response with an empty validated issue list is a genuine clean result"
);
assert.equal(
  adapter.writingGrammarReviewNotice([], 0),
  null,
  "a successful clean response has no failure notice"
);

function workerIssue(overrides = {}) {
  return {
    ruleId: "untrusted-model-rule-name",
    title: "Untrusted title",
    category: "subject_verb_agreement",
    message: "Tommy 是第三身單數，現在式動詞需要加 s。",
    originalText: "need",
    suggestedText: "needs",
    correctedSentence: "THIS MUST NEVER BE TRUSTED",
    start: 6,
    end: 10,
    confidence: 0.98,
    suggestions: [{ kind: "replace", replacementText: "WRONG" }],
    engine: AI_ENGINE,
    ...overrides
  };
}

function localIssue(overrides = {}) {
  return {
    ruleId: "EslSubjectVerbAgreement",
    title: "本機主語與動詞規則",
    category: "Learner English",
    message: "本機規則：Tommy 是第三身單數，動詞要用 needs。",
    originalText: "need",
    suggestedText: "needs",
    correctedSentence: "untrusted local preview",
    start: 6,
    end: 10,
    engine: LOCAL_ENGINE,
    ...overrides
  };
}

const tommy = "Tommy need book to reading better.";
const tommyResponse = {
  coverage: "partial",
  engine: AI_ENGINE,
  issues: [
    workerIssue({
      category: "infinitive_or_gerund",
      message: "to 後面要用動詞原形 read。",
      originalText: "reading",
      suggestedText: "read",
      start: 19,
      end: 26,
      confidence: 0.96
    }),
    workerIssue(),
    workerIssue({
      category: "article_or_determiner",
      message: "book 是單數可數名詞，這裡需要冠詞 a。",
      originalText: "book",
      suggestedText: "a book",
      start: 11,
      end: 15,
      confidence: 0.97
    })
  ]
};

const tommyIssues = adapter.normalizeWritingAiResponse(tommy, tommyResponse);
assert.deepEqual(tommyIssues.map((issue) => issue.ruleId), [
  "EdmundAI:subject_verb_agreement",
  "EdmundAI:article_or_determiner",
  "EdmundAI:infinitive_or_gerund"
]);
assert.deepEqual(tommyIssues.map((issue) => [issue.start, issue.end]), [
  [6, 10],
  [11, 15],
  [19, 26]
]);
assert.deepEqual(tommyIssues.map((issue) => issue.engineId), [
  "cloudflare-workers-ai",
  "cloudflare-workers-ai",
  "cloudflare-workers-ai"
]);
assert.equal(tommyIssues[0].categoryId, "subject_verb_agreement");
assert.equal(tommyIssues[0].title, "主語與動詞一致");
assert.equal(tommyIssues[0].correctedSentence, "Tommy needs book to reading better.");
assert.equal(tommyIssues[1].correctedSentence, "Tommy need a book to reading better.");
assert.equal(tommyIssues[2].correctedSentence, "Tommy need book to read better.");
assert.deepEqual(tommyIssues[0].suggestions, [{ kind: "replace", replacementText: "needs" }]);
assert.ok(Object.isFrozen(tommyIssues));
assert.ok(Object.isFrozen(tommyIssues[0]));
assert.ok(Object.isFrozen(tommyIssues[0].engine));
assert.ok(Object.isFrozen(tommyIssues[0].suggestions));

assert.deepEqual(
  adapter.normalizeWritingAiResponse("Tommy needs a book to read better.", {
    engine: AI_ENGINE,
    issues: []
  }),
  [],
  "a correct sentence may safely produce an empty partial-coverage result"
);

const emojiSentence = "🙂 Tommy need book to reading better.";
const emojiIssues = adapter.normalizeWritingAiResponse(emojiSentence, {
  engine: AI_ENGINE,
  issues: [workerIssue({ start: 9, end: 13 })]
});
assert.equal(emojiIssues[0].originalText, "need");
assert.deepEqual([emojiIssues[0].start, emojiIssues[0].end], [9, 13]);
assert.equal(emojiIssues[0].correctedSentence, "🙂 Tommy needs book to reading better.");

for (const invalid of [
  workerIssue({ originalText: "needs" }),
  workerIssue({ start: -1 }),
  workerIssue({ start: 6.5 }),
  workerIssue({ end: tommy.length + 1 }),
  workerIssue({ engine: { name: "invented-engine", version: "1" } }),
  workerIssue({ category: "invented_category" })
]) {
  assert.throws(
    () => adapter.normalizeWritingAiResponse(tommy, { engine: AI_ENGINE, issues: [invalid] }),
    /no usable issues|unknown engine/u
  );
}

assert.throws(
  () => adapter.normalizeWritingAiResponse(tommy, {
    engine: { name: "invented-engine" },
    issues: []
  }),
  /unknown engine/u
);

const oneValidOneInvalid = adapter.normalizeWritingAiResponse(tommy, {
  engine: AI_ENGINE,
  issues: [workerIssue({ start: 999, end: 1000 }), workerIssue()]
});
assert.equal(oneValidOneInvalid.length, 1);
assert.equal(oneValidOneInvalid[0].originalText, "need");

const aiDuplicatesAndOverlaps = adapter.normalizeWritingAiResponse(tommy, {
  engine: AI_ENGINE,
  issues: [
    workerIssue({
      category: "sentence_structure",
      originalText: "need book",
      suggestedText: "needs a book",
      start: 6,
      end: 15,
      message: "較闊的重疊改寫不應勝過較小的直接修正。",
      confidence: 0.99
    }),
    workerIssue(),
    workerIssue(),
    workerIssue({
      category: "infinitive_or_gerund",
      originalText: "reading",
      suggestedText: "read",
      start: 19,
      end: 26,
      message: "to 後面用 read。"
    })
  ]
});
assert.deepEqual(
  aiDuplicatesAndOverlaps.map((issue) => [issue.originalText, issue.suggestedText]),
  [["need", "needs"], ["reading", "read"]],
  "duplicates collapse and the smallest deterministic overlapping correction wins"
);

const localNeed = localIssue();
const harperReading = localIssue({
  ruleId: "InfinitiveVerbForm",
  title: "Infinitive Verb Form",
  category: "Grammar",
  message: "Use the base form after to.",
  originalText: "reading",
  suggestedText: "read",
  start: 19,
  end: 26,
  engine: HARPER_ENGINE
});
const unknownLocal = localIssue({
  ruleId: "Unknown",
  originalText: "book",
  suggestedText: "a book",
  start: 11,
  end: 15,
  engine: { name: "unknown-local-engine" }
});

const merged = adapter.mergeWritingGrammarIssues(
  tommy,
  [unknownLocal, harperReading, localNeed],
  tommyResponse
);
assert.deepEqual(
  merged.map((issue) => [issue.start, issue.engineId, issue.originalText, issue.suggestedText]),
  [
    [6, "edmund-esl-basics", "need", "needs"],
    [11, "cloudflare-workers-ai", "book", "a book"],
    [19, "harper.js", "reading", "read"]
  ],
  "local ESL wins first, Harper wins second, and only non-overlapping AI remains"
);
assert.equal(merged[0].categoryId, "subject_verb_agreement");
assert.equal(merged[2].categoryId, "infinitive_or_gerund");

const widerLocal = localIssue({
  ruleId: "EslCombinedNeedArticle",
  originalText: "need book",
  suggestedText: "needs a book",
  start: 6,
  end: 15
});
const narrowerHarper = localIssue({
  ruleId: "HarperNeed",
  title: "Agreement",
  category: "Agreement",
  originalText: "need",
  suggestedText: "needs",
  start: 6,
  end: 10,
  engine: HARPER_ENGINE
});
assert.deepEqual(
  adapter.normalizeLocalGrammarIssues(tommy, [narrowerHarper, widerLocal])
    .map((issue) => [issue.ruleId, issue.engineId]),
  [["EslCombinedNeedArticle", "edmund-esl-basics"]],
  "the deterministic Edmund local rule outranks an overlapping Harper rule even when it is wider"
);

const reversedMerged = adapter.mergeWritingGrammarIssues(
  tommy,
  [localNeed, unknownLocal, harperReading].reverse(),
  { ...tommyResponse, issues: [...tommyResponse.issues].reverse() }
);
assert.deepEqual(
  reversedMerged.map((issue) => [issue.ruleId, issue.start, issue.engineId]),
  merged.map((issue) => [issue.ruleId, issue.start, issue.engineId]),
  "output order must not depend on upstream array order"
);

assert.equal(adapter.grammarIssueRangesOverlap(
  { start: 6, end: 10 },
  { start: 9, end: 15 }
), true);
assert.equal(adapter.grammarIssueRangesOverlap(
  { start: 6, end: 10 },
  { start: 10, end: 15 }
), false, "adjacent ranges are not overlapping");

const loopSentence = "Tom read a book feel exciting.";
const loopResponse = {
  engine: AI_ENGINE,
  issues: [
    workerIssue({
      originalText: "read",
      suggestedText: "reads",
      start: 4,
      end: 8,
      message: "Tom 是第三身單數。"
    }),
    workerIssue({
      category: "sentence_structure",
      originalText: "feel",
      suggestedText: "and felt",
      start: 16,
      end: 20,
      message: "句子需要連接詞，並保持過去式。"
    }),
    workerIssue({
      category: "word_form",
      originalText: "exciting",
      suggestedText: "excited",
      start: 21,
      end: 29,
      message: "形容人感到興奮要用 excited。"
    })
  ]
};
const decoratedLoopIssues = adapter.normalizeWritingAiResponse(loopSentence, loopResponse)
  .map((issue, index) => ({
    ...issue,
    id: `loop-${index}`,
    fingerprint: `fingerprint-${index}`,
    generation: 4,
    documentId: "document-loop",
    sentenceText: loopSentence,
    sentenceStart: 0,
    sentenceEnd: loopSentence.length,
    segmentOrdinal: 1,
    absoluteStart: issue.start,
    absoluteEnd: issue.end
  }));
const rebasedLoopIssues = adapter.rebaseWritingGrammarIssuesAfterAppliedCorrection(
  decoratedLoopIssues,
  decoratedLoopIssues[0]
);
assert.deepEqual(
  rebasedLoopIssues.map((issue) => [issue.originalText, issue.start, issue.end]),
  [["feel", 17, 21], ["exciting", 22, 30]],
  "applying the first card preserves and rebases independent later cards"
);
assert.deepEqual(
  rebasedLoopIssues.map((issue) => issue.correctedSentence),
  [
    "Tom reads a book and felt exciting.",
    "Tom reads a book feel excited."
  ]
);
assert.equal(
  adapter.hasWritingGrammarIssuesForSentence(
    rebasedLoopIssues,
    0,
    "Tom reads a book feel exciting."
  ),
  true,
  "the adapter can tell the editor that rebased cards from this exact sentence remain"
);
assert.equal(
  adapter.hasWritingGrammarIssuesForSentence(rebasedLoopIssues, 0, loopSentence),
  false,
  "the original sentence revision no longer owns the rebased cards"
);

const correctionBatchSentence = "Tom hate go school but enjoy watch movie.";
const correctionBatchIssues = adapter.normalizeWritingAiResponse(correctionBatchSentence, {
  engine: AI_ENGINE,
  issues: [
    workerIssue({
      originalText: "hate",
      suggestedText: "hates",
      start: 4,
      end: 8,
      message: "Tom 是第三身單數，動詞要用 hates。"
    }),
    workerIssue({
      category: "infinitive_or_gerund",
      originalText: "go school",
      suggestedText: "going to school",
      start: 9,
      end: 18,
      message: "hate 後可用動名詞，並要寫 go to school。"
    }),
    workerIssue({
      originalText: "enjoy",
      suggestedText: "enjoys",
      start: 23,
      end: 28,
      message: "Tom 是第三身單數，動詞要用 enjoys。"
    }),
    workerIssue({
      category: "infinitive_or_gerund",
      originalText: "watch movie",
      suggestedText: "watching movies",
      start: 29,
      end: 40,
      message: "enjoy 後用動名詞；一般談電影時可用複數 movies。"
    })
  ]
}).map((issue, index) => ({
  ...issue,
  id: `batch-${index}`,
  fingerprint: `batch-fingerprint-${index}`,
  generation: 8,
  documentId: "document-batch",
  sentenceText: correctionBatchSentence,
  sentenceStart: 0,
  sentenceEnd: correctionBatchSentence.length,
  segmentOrdinal: 1,
  absoluteStart: issue.start,
  absoluteEnd: issue.end
}));

let correctedBatchSentence = correctionBatchSentence;
let remainingBatchIssues = correctionBatchIssues;
const correctionBatchSequence = [];
while (remainingBatchIssues.length) {
  const appliedIssue = remainingBatchIssues[0];
  correctedBatchSentence = appliedIssue.correctedSentence;
  remainingBatchIssues = adapter.rebaseWritingGrammarIssuesAfterAppliedCorrection(
    remainingBatchIssues,
    appliedIssue
  );
  correctionBatchSequence.push(correctedBatchSentence);
  assert.equal(
    adapter.hasWritingGrammarIssuesForSentence(
      remainingBatchIssues,
      0,
      correctedBatchSentence
    ),
    remainingBatchIssues.length > 0,
    "same-sentence batch state must remain exact after every accepted correction"
  );
}
assert.deepEqual(correctionBatchSequence, [
  "Tom hates go school but enjoy watch movie.",
  "Tom hates going to school but enjoy watch movie.",
  "Tom hates going to school but enjoys watch movie.",
  "Tom hates going to school but enjoys watching movies."
]);
assert.equal(
  correctedBatchSentence,
  "Tom hates going to school but enjoys watching movies.",
  "the coherent correction batch must end in the intended complete sentence"
);
assert.equal(adapter.hasWritingGrammarIssuesForSentence(null, 0, correctedBatchSentence), false);
assert.equal(adapter.hasWritingGrammarIssuesForSentence([], 0.5, correctedBatchSentence), false);

const inverseSentence = "Tom reads a book feel exciting.";
const inverseIssue = adapter.normalizeWritingAiResponse(inverseSentence, {
  engine: AI_ENGINE,
  issues: [workerIssue({
    originalText: "reads",
    suggestedText: "read",
    start: 4,
    end: 9,
    message: "模型作出了相反建議。"
  })]
})[0];
const correctionHistory = [{
  generation: 4,
  documentId: "document-loop",
  absoluteStart: 4,
  absoluteEnd: 9,
  before: "read",
  after: "reads",
  categoryId: "subject_verb_agreement",
  engineId: "cloudflare-workers-ai"
}];
const inverseContext = { generation: 4, documentId: "document-loop" };
const inverseSegment = { start: 0, text: inverseSentence };
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    {
      ...inverseIssue,
      originalText: "read",
      suggestedText: "reads",
      start: 4,
      end: 8
    },
    inverseSegment,
    inverseContext,
    correctionHistory
  ),
  true,
  "the accepted read -> reads transform cannot repeat on the embedded read inside reads"
);
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    {
      ...inverseIssue,
      originalText: "Tom read",
      suggestedText: "Tom reads",
      start: 0,
      end: 8
    },
    inverseSegment,
    inverseContext,
    correctionHistory
  ),
  true,
  "a checker cannot hide the repeated transform inside a wider replacement"
);
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    {
      ...inverseIssue,
      originalText: "Tom reads and Sam eat",
      suggestedText: "Tom reads and Sam eats",
      start: 0,
      end: 21
    },
    { start: 0, text: "Tom reads and Sam eat." },
    inverseContext,
    correctionHistory
  ),
  false,
  "a wider correction may preserve the accepted text while fixing a later word"
);
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    {
      ...inverseIssue,
      originalText: "read",
      suggestedText: "reads",
      start: 4,
      end: 8,
      engine: LOCAL_ENGINE,
      engineId: "edmund-esl-basics"
    },
    inverseSegment,
    inverseContext,
    correctionHistory
  ),
  true,
  "even a stronger checker must not repeat the identical accepted transform"
);

const repeatedGoSentence = "Tom to go and go.";
const repeatedGoHistory = [{
  generation: 4,
  documentId: "document-loop",
  absoluteStart: 4,
  absoluteEnd: 9,
  before: "go",
  after: "to go",
  categoryId: "infinitive_or_gerund",
  engineId: "cloudflare-workers-ai"
}];
const repeatedGoIssue = {
  ...inverseIssue,
  category: "infinitive_or_gerund",
  categoryId: "infinitive_or_gerund",
  originalText: "go",
  suggestedText: "to go",
  start: 7,
  end: 9
};
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    repeatedGoIssue,
    { start: 0, text: repeatedGoSentence },
    inverseContext,
    repeatedGoHistory
  ),
  true,
  "go -> to go cannot compound into to to go inside its accepted replacement"
);
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    { ...repeatedGoIssue, start: 14, end: 16 },
    { start: 0, text: repeatedGoSentence },
    inverseContext,
    repeatedGoHistory
  ),
  false,
  "the same correction remains available for a genuinely separate later occurrence"
);
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    inverseIssue,
    inverseSegment,
    inverseContext,
    correctionHistory
  ),
  true,
  "the same AI engine cannot reverse a correction the student just accepted"
);
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    {
      ...inverseIssue,
      category: "verb_form_or_tense",
      categoryId: "verb_form_or_tense",
      ruleId: "EdmundAI:verb_form_or_tense"
    },
    inverseSegment,
    inverseContext,
    correctionHistory
  ),
  true,
  "changing the AI category cannot bypass an exact inverse-correction lock"
);
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    {
      ...inverseIssue,
      category: "verb_form_or_tense",
      categoryId: "verb_form_or_tense",
      originalText: "Tom reads",
      suggestedText: "Tom read",
      correctedSentence: loopSentence,
      start: 0,
      end: 9
    },
    inverseSegment,
    inverseContext,
    correctionHistory
  ),
  true,
  "a wider replacement span cannot bypass the accepted-fragment inverse lock"
);
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    {
      ...inverseIssue,
      originalText: "Tom reads a book feel exciting",
      suggestedText: "Tom read a book felt excited",
      correctedSentence: "Tom read a book felt excited.",
      start: 0,
      end: 30
    },
    { start: 0, text: "Tom reads a book feel exciting." },
    inverseContext,
    correctionHistory
  ),
  true,
  "a sibling correction cannot make a wider inverse forget the accepted fragment"
);
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    {
      ...inverseIssue,
      originalText: "Tom read a book felt exciting",
      suggestedText: "Tom reads a book feel excited",
      correctedSentence: "Tom reads a book feel excited.",
      start: 0,
      end: 30
    },
    { start: 0, text: "Tom read a book felt exciting." },
    inverseContext,
    [{
      generation: 4,
      documentId: "document-loop",
      absoluteStart: 16,
      absoluteEnd: 20,
      before: "feel",
      after: "felt",
      engineId: "cloudflare-workers-ai"
    }]
  ),
  true,
  "an earlier length change inside a wider rewrite cannot shift the inverse past the lock"
);
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    {
      ...inverseIssue,
      originalText: "Tom reads and Sam reads",
      suggestedText: "Tom read and Sam reads",
      start: 0,
      end: 23
    },
    { start: 0, text: "Tom reads and Sam reads." },
    inverseContext,
    [{
      generation: 4,
      documentId: "document-loop",
      absoluteStart: 18,
      absoluteEnd: 23,
      before: "read",
      after: "reads",
      engineId: "cloudflare-workers-ai"
    }]
  ),
  false,
  "changing a different repeated word must not falsely trigger the accepted-fragment lock"
);
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    {
      ...inverseIssue,
      originalText: "Tom reads and Sam read",
      suggestedText: "Tom read and Sam reads",
      start: 0,
      end: 22
    },
    { start: 0, text: "Tom reads and Sam read." },
    inverseContext,
    [{
      generation: 4,
      documentId: "document-loop",
      absoluteStart: 4,
      absoluteEnd: 9,
      before: "read",
      after: "reads",
      engineId: "cloudflare-workers-ai"
    }]
  ),
  true,
  "the lock follows the accepted occurrence when repeated words swap forms"
);
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    {
      ...inverseIssue,
      originalText: "a lot",
      suggestedText: "a  lot",
      start: 0,
      end: 5
    },
    { start: 0, text: "a lot." },
    inverseContext,
    [{
      generation: 4,
      documentId: "document-loop",
      absoluteStart: 0,
      absoluteEnd: 5,
      before: "a  lot",
      after: "a lot",
      engineId: "cloudflare-workers-ai"
    }]
  ),
  true,
  "whitespace-only inverse corrections cannot create an A-B-A loop"
);
assert.equal(
  adapter.isBlockedInverseWritingGrammarIssue(
    { ...inverseIssue, engine: LOCAL_ENGINE, engineId: "edmund-esl-basics" },
    inverseSegment,
    inverseContext,
    correctionHistory
  ),
  false,
  "a stronger deterministic local rule may override an AI correction"
);

console.log("Writing Submission AI browser adapter: OK");
