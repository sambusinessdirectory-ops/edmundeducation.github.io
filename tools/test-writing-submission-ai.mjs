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
  version: "1.1.0",
  execution: "browser"
});
const HARPER_ENGINE = Object.freeze({
  name: "harper.js",
  version: "2.7.0",
  execution: "browser"
});

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

console.log("Writing Submission AI browser adapter: OK");
