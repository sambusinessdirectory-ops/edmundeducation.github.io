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

const serializedIssues = JSON.parse(JSON.stringify(issues));
assert.deepEqual(serializedIssues, issues, "checker results must be plain JSON-safe values");

function assertNoFunctions(value) {
  if (typeof value === "function") assert.fail("a live function leaked into the checker result");
  if (Array.isArray(value)) value.forEach(assertNoFunctions);
  else if (value && typeof value === "object") Object.values(value).forEach(assertNoFunctions);
}
assertNoFunctions(issues);

await checker.dispose();
await assert.rejects(() => checker.setup(), /disposed/u);

console.log("Writing Submission Harper helper and trigger behavior: OK");
