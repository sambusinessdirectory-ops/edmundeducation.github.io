import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const TEST_MODE_KEY = "EDMUND_HARPER_ESM_TEST";
const thisFile = fileURLToPath(import.meta.url);

// The production repository intentionally remains a no-build static site, so
// browser .js modules are tested in Node's ESM-default mode without adding a
// root package.json that could alter unrelated legacy scripts.
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
const helper = await import(pathToFileURL(path.join(root, "writing-submission-harper.js")));
const eslRules = await import(pathToFileURL(path.join(root, "writing-submission-esl-rules.js")));
const harper = await import(pathToFileURL(path.join(root, "assets/vendor/harper/2.7.0/index.js")));
const binaryModule = await import(
  pathToFileURL(path.join(root, "assets/vendor/harper/2.7.0/slimBinary.js"))
);

assert.deepEqual(
  helper.getWritingChangeRange("He go", "He goes"),
  {
    start: 5,
    previousEnd: 5,
    currentEnd: 7,
    removedText: "",
    insertedText: "es"
  }
);

assert.equal(helper.shouldTriggerWritingGrammarCheck("He go", "He goes"), false);
assert.equal(helper.shouldTriggerWritingGrammarCheck("He go", "He go."), true);
assert.equal(helper.shouldTriggerWritingGrammarCheck("He go", "He go;"), true);
assert.deepEqual(helper.getNewlyCompletedWritingSegments("", "He go. I has; unfinished"), [
  { start: 0, end: 6, text: "He go.", terminator: "." },
  { start: 7, end: 13, text: "I has;", terminator: ";" }
]);
assert.deepEqual(
  helper.getNewlyCompletedWritingSegments("He go. I has", "He go. I have"),
  [],
  "editing an already terminated passage without new punctuation must not retrigger Harper"
);

const astralText = "🙂 He go to school.";
assert.equal(helper.unicodeScalarIndexToUtf16Offset(astralText, 5), 6);
assert.deepEqual(
  helper.normalizeHarperSpan(astralText, { start: 5, end: 7 }, "go"),
  { start: 6, end: 8 },
  "serialized Unicode-scalar spans must be converted for textarea offsets"
);
assert.deepEqual(
  helper.normalizeHarperSpan(astralText, { start: 6, end: 8 }, "go"),
  { start: 6, end: 8 },
  "Harper's public UTF-16 span must not be converted twice"
);

const localLinter = new harper.LocalLinter({
  binary: binaryModule.slimBinary,
  dialect: harper.Dialect.British
});
const checker = helper.createWritingGrammarChecker({ linterFactory: () => localLinter });

await checker.setup();
const issues = await checker.check("🙂 He go to school every day.");
const agreement = issues.find((issue) => issue.ruleId === "PronounVerbAgreement");
assert.ok(agreement, "Harper should report the known pronoun/verb agreement fixture");
assert.equal(agreement.title, "Pronoun Verb Agreement");
assert.equal(agreement.category, "Agreement");
assert.equal(agreement.originalText, "go");
assert.equal(agreement.suggestedText, "goes");
assert.equal(agreement.correctedSentence, "🙂 He goes to school every day.");
assert.equal(agreement.start, 6);
assert.equal(agreement.end, 8);
assert.equal(agreement.engine.version, "2.7.0");

const screenshotFirstSentence = "In recent years, more and more company requires staff need to wore uniforms at work.";
const screenshotSecondSentence = "There are some advantages of a company having a uniform for example customer can quickly locate staff in retail stores and enhanced trust and professionalism.";
const screenshotFirstIssues = await checker.check(screenshotFirstSentence);
const screenshotSecondIssues = await checker.check(screenshotSecondSentence);

assert.deepEqual(
  screenshotFirstIssues.map((issue) => issue.ruleId),
  ["EslPluralAfterQuantifier", "EslRequireObjectInfinitive"]
);
assert.deepEqual(
  screenshotSecondIssues.map((issue) => issue.ruleId),
  ["EslForExamplePunctuation", "EslGenericPeoplePlural", "EslModalParallelVerb"]
);

for (const issue of [...screenshotFirstIssues, ...screenshotSecondIssues]) {
  assert.equal(
    issue.originalText,
    (issue === screenshotFirstIssues[0] ? screenshotFirstSentence : issue.start < screenshotFirstSentence.length && screenshotFirstIssues.includes(issue) ? screenshotFirstSentence : screenshotSecondSentence)
      .slice(issue.start, issue.end),
    `${issue.ruleId} must expose exact UTF-16 editor offsets`
  );
  assert.equal(issue.engine.name, "edmund-esl-basics");
}

function applyLearnerRule(sentence, ruleId) {
  const issue = eslRules.checkLocalLearnerEnglish(sentence).find((candidate) => candidate.ruleId === ruleId);
  assert.ok(issue, `Expected ${ruleId} while correcting: ${sentence}`);
  return issue.correctedSentence;
}

const tomLoveSentence = "Tom love eat food.";
const tomLoveRuleIds = [
  "EslSingularNamePresentAgreement",
  "EslPreferenceInfinitiveOrGerund"
];
const tomLoveLocalIssues = eslRules.checkLocalLearnerEnglish(tomLoveSentence);
assert.deepEqual(tomLoveLocalIssues.map((issue) => issue.ruleId), tomLoveRuleIds);
assert.deepEqual(
  tomLoveLocalIssues.map(({ originalText, suggestedText, start, end }) => ({
    originalText,
    suggestedText,
    start,
    end
  })),
  [
    { originalText: "love", suggestedText: "loves", start: 4, end: 8 },
    { originalText: "eat", suggestedText: "to eat", start: 9, end: 12 }
  ]
);
for (const issue of tomLoveLocalIssues) {
  assert.equal(issue.originalText, tomLoveSentence.slice(issue.start, issue.end));
  assert.equal(issue.engine.name, "edmund-esl-basics");
  assert.equal(issue.engine.version, "1.2.0");
}

const tomLoveMergedIssues = await checker.check(tomLoveSentence);
assert.deepEqual(
  tomLoveMergedIssues.map((issue) => issue.ruleId),
  tomLoveRuleIds,
  "the actual Harper + Edmund checker must retain both deterministic fallback issues"
);

let correctedTomLove = tomLoveSentence;
correctedTomLove = applyLearnerRule(correctedTomLove, "EslSingularNamePresentAgreement");
assert.equal(correctedTomLove, "Tom loves eat food.");
correctedTomLove = applyLearnerRule(correctedTomLove, "EslPreferenceInfinitiveOrGerund");
assert.equal(correctedTomLove, "Tom loves to eat food.");
assert.deepEqual(eslRules.checkLocalLearnerEnglish(correctedTomLove), []);

let reverseCorrectedTomLove = tomLoveSentence;
reverseCorrectedTomLove = applyLearnerRule(reverseCorrectedTomLove, "EslPreferenceInfinitiveOrGerund");
assert.equal(reverseCorrectedTomLove, "Tom love to eat food.");
reverseCorrectedTomLove = applyLearnerRule(reverseCorrectedTomLove, "EslSingularNamePresentAgreement");
assert.equal(reverseCorrectedTomLove, "Tom loves to eat food.");
assert.deepEqual(eslRules.checkLocalLearnerEnglish(reverseCorrectedTomLove), []);

for (const validSentence of [
  "Tom loves to eat food.",
  "Tom loves eating food.",
  "People love eating food.",
  "Tom and Sam love eating food.",
  "Tom's love story is popular.",
  "Love makes people happy.",
  "I love work."
]) {
  assert.deepEqual(
    eslRules.checkLocalLearnerEnglish(validSentence),
    [],
    `Tom/love fallback rules must not flag this negative control: ${validSentence}`
  );
}

let correctedFirst = screenshotFirstSentence;
correctedFirst = applyLearnerRule(correctedFirst, "EslPluralAfterQuantifier");
correctedFirst = applyLearnerRule(correctedFirst, "EslRequireObjectInfinitive");
correctedFirst = applyLearnerRule(correctedFirst, "EslPluralSubjectVerbAgreement");
assert.equal(
  correctedFirst,
  "In recent years, more and more companies require staff to wear uniforms at work."
);
assert.equal(eslRules.checkLocalLearnerEnglish(correctedFirst).length, 0);

let correctedSecond = screenshotSecondSentence;
correctedSecond = applyLearnerRule(correctedSecond, "EslForExamplePunctuation");
correctedSecond = applyLearnerRule(correctedSecond, "EslGenericPeoplePlural");
correctedSecond = applyLearnerRule(correctedSecond, "EslModalParallelVerb");
assert.equal(
  correctedSecond,
  "There are some advantages of a company having a uniform. For example, customers can quickly locate staff in retail stores and enhance trust and professionalism."
);
assert.equal(eslRules.checkLocalLearnerEnglish(correctedSecond).length, 0);

for (const validSentence of [
  "A company requires staff to wear uniforms.",
  "More and more company leaders require staff to wear uniforms.",
  "For example, a customer can locate staff.",
  "For example, customer service can improve trust.",
  "The stores enhanced trust."
]) {
  assert.deepEqual(
    eslRules.checkLocalLearnerEnglish(validSentence),
    [],
    `High-confidence learner rules must not flag: ${validSentence}`
  );
}

const complaintFirstSentence = "Customers are have a first impressions of business.";
const complaintSecondSentence = "A clear illustration, if you enter an international airport with the staff do not wearing a proper uniform, you will think that there are a loss of trusts and professionalism.";
const complaintFirstIssues = await checker.check(complaintFirstSentence);
const complaintSecondIssues = await checker.check(complaintSecondSentence);

assert.deepEqual(
  complaintFirstIssues.map((issue) => issue.ruleId),
  ["EslBeHaveDoubleVerb", "EslArticleSingularNoun"]
);
assert.deepEqual(
  complaintSecondIssues.map((issue) => issue.ruleId),
  [
    "EslComplexIllustrationClauseReview",
    "EslWithObjectNegativeGerund",
    "EslThereBeSingularAgreement",
    "EslAbstractNounUncountable"
  ]
);

for (const [sentence, sentenceIssues] of [
  [complaintFirstSentence, complaintFirstIssues],
  [complaintSecondSentence, complaintSecondIssues]
]) {
  for (const issue of sentenceIssues) {
    assert.equal(
      issue.originalText,
      sentence.slice(issue.start, issue.end),
      `${issue.ruleId} must point to the exact text shown in the editor`
    );
    assert.equal(issue.engine.version, "1.2.0");
  }
}

let correctedComplaintFirst = complaintFirstSentence;
correctedComplaintFirst = applyLearnerRule(correctedComplaintFirst, "EslBeHaveDoubleVerb");
correctedComplaintFirst = applyLearnerRule(correctedComplaintFirst, "EslArticleSingularNoun");
assert.equal(correctedComplaintFirst, "Customers have a first impression of business.");
assert.deepEqual(eslRules.checkLocalLearnerEnglish(correctedComplaintFirst), []);

let correctedComplaintSecond = complaintSecondSentence;
correctedComplaintSecond = applyLearnerRule(correctedComplaintSecond, "EslWithObjectNegativeGerund");
correctedComplaintSecond = applyLearnerRule(correctedComplaintSecond, "EslThereBeSingularAgreement");
correctedComplaintSecond = applyLearnerRule(correctedComplaintSecond, "EslAbstractNounUncountable");
assert.equal(
  correctedComplaintSecond,
  "A clear illustration, if you enter an international airport with the staff not wearing a proper uniform, you will think that there is a loss of trust and professionalism."
);
const remainingComplaintIssues = eslRules.checkLocalLearnerEnglish(correctedComplaintSecond);
assert.deepEqual(remainingComplaintIssues.map((issue) => issue.ruleId), ["EslComplexIllustrationClauseReview"]);
assert.equal(remainingComplaintIssues[0].reviewRequired, true);
assert.equal(remainingComplaintIssues[0].suggestedText, "");

for (const validSentence of [
  "Customers are having lunch.",
  "Customers have first impressions of several businesses.",
  "There are a few reasons.",
  "There are losses of trust.",
  "There is a loss of trust.",
  "Several family trusts manage the estate.",
  "Staff do not wear uniforms.",
  "With the staff not wearing uniforms, the room is quiet.",
  "A clear illustration, if printed in colour, can be persuasive."
]) {
  assert.deepEqual(
    eslRules.checkLocalLearnerEnglish(validSentence),
    [],
    `New ESL checks must not flag this negative control: ${validSentence}`
  );
}

const serializedIssues = JSON.parse(JSON.stringify(issues));
assert.deepEqual(serializedIssues, issues, "checker results must be plain JSON-safe values");

function assertNoFunctions(value) {
  if (typeof value === "function") assert.fail("a live function leaked into the checker result");
  if (Array.isArray(value)) value.forEach(assertNoFunctions);
  else if (value && typeof value === "object") Object.values(value).forEach(assertNoFunctions);
}
assertNoFunctions(issues);

const fallbackChecker = helper.createWritingGrammarChecker({
  linterFactory: () => ({
    async setup() { throw new Error("simulated Harper load failure"); },
    async organizedLints() { throw new Error("must not run"); },
    async dispose() {}
  })
});
const originalWarn = console.warn;
console.warn = () => {};
let fallbackIssues;
let fallbackTomLoveIssues;
try {
  fallbackIssues = await fallbackChecker.check(screenshotFirstSentence);
  fallbackTomLoveIssues = await fallbackChecker.check(tomLoveSentence);
} finally {
  console.warn = originalWarn;
}
assert.deepEqual(
  fallbackIssues.map((issue) => issue.ruleId),
  ["EslPluralAfterQuantifier", "EslRequireObjectInfinitive"],
  "Edmund ESL rules must keep working when Harper cannot load"
);
assert.deepEqual(
  fallbackTomLoveIssues.map((issue) => ({
    ruleId: issue.ruleId,
    originalText: issue.originalText,
    suggestedText: issue.suggestedText
  })),
  [
    {
      ruleId: "EslSingularNamePresentAgreement",
      originalText: "love",
      suggestedText: "loves"
    },
    {
      ruleId: "EslPreferenceInfinitiveOrGerund",
      originalText: "eat",
      suggestedText: "to eat"
    }
  ],
  "the two Edmund corrections must work even when Harper cannot load"
);
await fallbackChecker.dispose();

await checker.dispose();
await assert.rejects(() => checker.setup(), /disposed/u);

console.log("Writing Submission Harper helper and trigger behavior: OK");
