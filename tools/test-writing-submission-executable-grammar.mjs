import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const TEST_MODE_KEY = "EDMUND_EXECUTABLE_GRAMMAR_ESM_TEST";
const thisFile = fileURLToPath(import.meta.url);

if (process.env[TEST_MODE_KEY] !== "1") {
  const { spawnSync } = await import("node:child_process");
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
const dataDirectory = path.join(root, "tools/grammar-detector-v2/data");
const adversarialControlsPath = path.join(
  root,
  "tools/grammar-detector-v2/adversarial-controls.json"
);
const compiler = await import(pathToFileURL(
  path.join(root, "tools/grammar-detector-v2/validate-and-compile.mjs")
));
const runtime = await import(pathToFileURL(
  path.join(root, "writing-submission-executable-grammar.js")
));
const merged = await import(pathToFileURL(
  path.join(root, "writing-submission-esl-rules.js")
));

const APPROVED = compiler.RUNTIME_APPROVAL_STATUS;
const BROWSER_CAPABILITIES = ["surface_literal", "tokenize", "unicode_word_boundaries"];

function fixturePackage({
  policy = "local_auto",
  evidenceKind = "full_sentence",
  matchText = "need (a+b) [test]?",
  replacementText = "needs (a+b) [test]?",
  leftContext = ["workers"],
  rightContext = ["today"],
  startsSentence = false,
  endsSentence = false,
  confidence = policy === "local_auto" ? 0.99 : 0.9,
  priority = 100
} = {}) {
  const familyId = "GF_TEST_BOUNDED_SURFACE";
  const matcherId = `${familyId}_M01`;
  const issueId = "PARA-0019-S01-I01";
  const caseId = "SET-0019-GF_TEST_BOUNDED_SURFACE-C001";
  return {
    schemaName: "edmund_executable_grammar_authoring",
    schemaVersion: "2.0.0-draft",
    corpusVersion: compiler.EXECUTABLE_GRAMMAR_VERSION,
    set: {
      setId: "SET-0019",
      paragraphId: "PARA-0019",
      runtimeApprovalStatus: APPROVED,
      sourceReviewStatus: "draft",
      teacherApproval: "pending"
    },
    counts: { sourceIssues: 1 },
    sourceIssues: [{
      issueId,
      sentenceId: "PARA-0019-S01",
      familyIds: [familyId],
      sourceReviewStatus: "draft"
    }],
    ruleFamilies: [{
      familyId,
      name: "Bounded surface test family",
      nameZhHant: "有限字面測試規則",
      classification: "structural",
      executionPolicy: policy,
      grammarCategory: "subject_verb_agreement",
      explanationZhHant: "這是一項有限而已核准的字面測試規則。",
      version: 1,
      sourceIssueIds: [issueId],
      matcherIds: [matcherId],
      runtimeApprovalStatus: APPROVED,
      sourceReviewStatus: "draft",
      teacherApproval: "pending"
    }],
    matchers: [{
      matcherId,
      familyId,
      matcherType: "surface_literal",
      match: { matchText },
      guards: [],
      repair: { operation: "replace", replacementText },
      requiredCapabilities: [...BROWSER_CAPABILITIES],
      runtimeApprovalStatus: APPROVED,
      sourceReviewStatus: "draft",
      teacherApproval: "pending"
    }],
    issueBindings: [{
      bindingId: `${issueId}::${familyId}`,
      issueId,
      familyId,
      matcherId
    }],
    sourceControls: [{
      controlId: "CTRL-0019-01",
      correctExample: `Workers ${replacementText} today.`
    }],
    testCases: [{
      caseId,
      familyId,
      partition: "development",
      inputText: `Workers ${matchText} today.`,
      evidenceKind,
      evidenceSetId: "SET-0019",
      sourceIssueId: issueId,
      expectedCorrectedText: replacementText,
      runtimeEligible: true,
      runtimeApprovalStatus: APPROVED,
      sourceReviewStatus: "draft",
      teacherApproval: "pending"
    }],
    runtimeSurfacePatterns: [{
      patternId: "SET-0019-GF_TEST_BOUNDED_SURFACE-P001",
      familyId,
      matcherId,
      sourceIssueId: issueId,
      evidenceCaseId: caseId,
      caseId,
      evidenceKind,
      sentenceId: "PARA-0019-S01",
      matcherType: "surface_literal",
      executionPolicy: policy,
      runtimeEligible: true,
      runtimeApprovalStatus: APPROVED,
      sourceReviewStatus: "draft",
      teacherApproval: "pending",
      matchText,
      replacementText,
      acceptableAlternatives: [],
      leftContext,
      rightContext,
      startsSentence,
      endsSentence,
      evidenceSetId: "SET-0019",
      partition: "development",
      requiredCapabilities: [...BROWSER_CAPABILITIES],
      confidence,
      priority,
      conflictGroup: familyId,
      explanationZhHant: "這項有限字面結構需要修正。"
    }]
  };
}

function compiledFixture(options) {
  return compiler.compile([fixturePackage(options)]);
}

function fixtureRuntime(options) {
  const compiled = compiledFixture(options);
  return runtime.createExecutableGrammarRuntime({
    families: compiled.families,
    patterns: compiled.patterns
  });
}

// Literal regex metacharacters must stay literal, while authored whitespace is flexible.
{
  const detector = fixtureRuntime();
  const source = "The workers need (a+b)   [test]? today.";
  const issues = detector.check(source);
  assert.equal(issues.length, 1);
  assert.equal(issues[0].originalText, "need (a+b)   [test]?");
  assert.equal(issues[0].suggestedText, "needs (a+b) [test]?");
  assert.deepEqual(detector.check("The workers needs (a+b) [test]? today."), []);
  assert.deepEqual(detector.check("The workers overneed (a+b) [test]? today."), []);
  assert.deepEqual(detector.check("The workers. Need (a+b) [test]? today."), []);
  assert.deepEqual(detector.check("The workers; need (a+b) [test]? today."), []);
}

// Review-only evidence may be a supplied issue-table phrase, but it must never expose an action.
{
  const detector = fixtureRuntime({ policy: "local_review", evidenceKind: "issue_table_phrase" });
  const source = "The workers need (a+b) [test]? today.";
  const [issue] = detector.check(source);
  assert.equal(issue.reviewRequired, true);
  assert.equal(issue.suggestedText, "");
  assert.equal(issue.correctedSentence, source);
  assert.deepEqual(issue.suggestions, []);
  const normalized = merged.mergeGrammarIssues([issue]);
  assert.equal(normalized[0].reviewRequired, true);
}

// Local-auto always requires full-sentence evidence.
{
  const invalid = fixturePackage({ evidenceKind: "issue_table_phrase" });
  assert.throws(() => compiler.validateSet(invalid), /full-sentence evidence/);
}

// Approval, capability, confidence, context, policy and relational gates fail closed.
for (const mutate of [
  (value) => { value.corpusVersion = "outdated-release"; },
  (value) => { value.ruleFamilies[0].runtimeApprovalStatus = "pending"; },
  (value) => { value.matchers[0].requiredCapabilities.push("dependency_parse"); },
  (value) => { value.runtimeSurfacePatterns[0].requiredCapabilities.push("dependency_parse"); },
  (value) => { value.runtimeSurfacePatterns[0].confidence = 0.98; },
  (value) => { value.runtimeSurfacePatterns[0].leftContext = ["Workers"]; },
  (value) => { value.runtimeSurfacePatterns[0].partition = "holdout"; },
  (value) => { value.runtimeSurfacePatterns[0].executionPolicy = "local_review"; },
  (value) => { value.runtimeSurfacePatterns[0].matcherId = "GF_UNKNOWN_M01"; },
  (value) => { value.testCases[0].runtimeEligible = false; }
]) {
  const invalid = fixturePackage();
  mutate(invalid);
  assert.throws(() => compiler.validateSet(invalid), /Executable grammar validation failed/);
}

// Same-range incompatible repairs are suppressed, including hidden review-only proposals.
{
  const compiled = compiledFixture({ policy: "local_review", evidenceKind: "issue_table_phrase" });
  const conflicting = {
    ...compiled.patterns[0],
    patternId: "SET-0019-GF_TEST_BOUNDED_SURFACE-P002",
    replacementText: "must be reviewed",
    priority: compiled.patterns[0].priority
  };
  const detector = runtime.createExecutableGrammarRuntime({
    families: compiled.families,
    patterns: [...compiled.patterns, conflicting]
  });
  assert.deepEqual(detector.check("The workers need (a+b) [test]? today."), []);
}

// Explicit priority resolves overlapping repairs; equal-priority ambiguity is suppressed.
{
  const compiled = compiledFixture({
    matchText: "need to go",
    replacementText: "needs to go",
    leftContext: ["worker"],
    rightContext: ["today"]
  });
  const nested = {
    ...compiled.patterns[0],
    patternId: "SET-0019-GF_TEST_BOUNDED_SURFACE-P002",
    matchText: "to go",
    replacementText: "going",
    leftContext: ["need"],
    priority: compiled.patterns[0].priority - 1
  };
  const resolved = runtime.createExecutableGrammarRuntime({
    families: compiled.families,
    patterns: [...compiled.patterns, nested]
  });
  assert.equal(resolved.check("The worker need to go today.")[0].patternId, compiled.patterns[0].patternId);

  const ambiguous = runtime.createExecutableGrammarRuntime({
    families: compiled.families,
    patterns: [
      ...compiled.patterns,
      {
        ...nested,
        priority: compiled.patterns[0].priority,
        conflictGroup: "GF_DIFFERENT_REPAIR_INTENT"
      }
    ]
  });
  assert.deepEqual(ambiguous.check("The worker need to go today."), []);
}

const packageFiles = fs.existsSync(dataDirectory)
  ? fs.readdirSync(dataDirectory).filter((name) => /^SET-[0-9]{4}\.json$/u.test(name)).sort()
  : [];
const packages = packageFiles.map((name) => JSON.parse(fs.readFileSync(path.join(dataDirectory, name), "utf8")));
const packageIds = packages.map((item) => item?.set?.setId);

// The source packages are written concurrently. Run full release assertions as soon as all are present.
if (JSON.stringify(packageIds) === JSON.stringify([
  "SET-0019",
  "SET-0020",
  "SET-0021",
  "SET-0022"
])) {
  const compiledProduction = compiler.compile(packages);
  assert.equal(runtime.EXECUTABLE_GRAMMAR_VERSION, compiler.EXECUTABLE_GRAMMAR_VERSION);
  assert.equal(runtime.EXECUTABLE_GRAMMAR_VERSION, compiledProduction.version);
  assert.deepEqual(runtime.EXECUTABLE_GRAMMAR_COUNTS, compiledProduction.counts);
  assert.deepEqual(runtime.EXECUTABLE_GRAMMAR_FAMILIES, compiledProduction.families);
  assert.deepEqual(runtime.EXECUTABLE_GRAMMAR_PATTERNS, compiledProduction.patterns);
  assert.equal(runtime.EXECUTABLE_GRAMMAR_COUNTS.sets, 4);
  assert.equal(runtime.EXECUTABLE_GRAMMAR_COUNTS.sourceIssues, 314);
  assert.equal(runtime.EXECUTABLE_GRAMMAR_COUNTS.families, 224);
  assert.equal(runtime.EXECUTABLE_GRAMMAR_COUNTS.runtimeFamilies, 49);
  assert.equal(runtime.EXECUTABLE_GRAMMAR_COUNTS.patterns, 65);
  assert.equal(runtime.EXECUTABLE_GRAMMAR_COUNTS.controls, 99);
  assert.equal(runtime.EXECUTABLE_GRAMMAR_COUNTS.cases, 944);
  assert.equal(runtime.EXECUTABLE_GRAMMAR_COUNTS.unsupportedFamilies, 175);
  assert.equal(runtime.EXECUTABLE_GRAMMAR_PATTERNS.length, runtime.EXECUTABLE_GRAMMAR_COUNTS.patterns);
  assert.equal(runtime.EXECUTABLE_GRAMMAR_FAMILIES.length, runtime.EXECUTABLE_GRAMMAR_COUNTS.families);
  assert.ok(runtime.EXECUTABLE_GRAMMAR_COUNTS.runtimeFamilies > 0);
  assert.ok(runtime.EXECUTABLE_GRAMMAR_COUNTS.unsupportedFamilies > 0);

  const adversarialControls = JSON.parse(fs.readFileSync(adversarialControlsPath, "utf8"));
  assert.equal(
    adversarialControls.schemaName,
    "edmund_executable_grammar_adversarial_controls"
  );
  assert.equal(adversarialControls.schemaVersion, "1.0.0");
  assert.equal(adversarialControls.controls.length, 124);
  assert.equal(
    new Set(adversarialControls.controls.map((control) => control.patternId)).size,
    adversarialControls.controls.length,
    "adversarial controls must bind one-to-one to unsafe candidates"
  );
  const authoredPatternById = new Map(packages.flatMap((data) => (
    data.runtimeSurfacePatterns.map((pattern) => [pattern.patternId, pattern])
  )));
  for (const control of adversarialControls.controls) {
    const authoredPattern = authoredPatternById.get(control.patternId);
    assert.ok(authoredPattern, `${control.patternId} adversarial control has no authored candidate`);
    assert.equal(authoredPattern.executionPolicy, control.policy, `${control.patternId} policy drifted`);
    assert.equal(authoredPattern.runtimeEligible, false, `${control.patternId} was unsafely re-enabled`);
    assert.equal(
      authoredPattern.reasonDisabled.includes("Valid unseen counterexample"),
      true,
      `${control.patternId} does not retain its adversarial disable reason`
    );
    assert.equal(
      runtime.EXECUTABLE_GRAMMAR_PATTERNS.some((pattern) => pattern.patternId === control.patternId),
      false,
      `${control.patternId} leaked into generated runtime data`
    );
    assert.deepEqual(
      runtime.checkExecutableGrammar(control.sentence, { maximumIssues: 32 }),
      [],
      `${control.patternId} still fires on its grammatical adversarial control`
    );
  }

  for (const pattern of runtime.EXECUTABLE_GRAMMAR_PATTERNS) {
    assert.notEqual(pattern.partition, "holdout", `${pattern.patternId} leaked a holdout`);
    assert.equal(pattern.runtimeEligible, true);
    assert.equal(pattern.runtimeApprovalStatus, APPROVED);
    assert.ok(["local_auto", "local_review"].includes(pattern.executionPolicy));
    const source = [
      ...(pattern.startsSentence ? [] : ["in", "another", "example"]),
      ...pattern.leftContext,
      pattern.matchText,
      ...pattern.rightContext
    ].join(" ") + (pattern.endsSentence ? "." : " during the review.");
    const family = runtime.EXECUTABLE_GRAMMAR_FAMILIES.find((item) => (
      item.familyId === pattern.familyId
    ));
    assert.equal(family?.runtimeApprovalStatus, APPROVED);
    assert.equal(family?.browserRuntimeSupported, true);
    // Exercise each compiled pattern in isolation. In the full detector, an
    // intentionally higher-priority overlapping repair may suppress this one.
    const singlePatternRuntime = runtime.createExecutableGrammarRuntime({
      families: [family],
      patterns: [pattern]
    });
    const detected = singlePatternRuntime.check(source, { maximumIssues: 32 });
    assert.ok(
      detected.some((issue) => issue.patternId === pattern.patternId),
      `${pattern.patternId} did not execute its own compiled surface evidence`
    );
  }

  for (const data of packages) {
    for (const sentence of data.sentences || []) {
      if (typeof sentence.correctedSentence !== "string" || !sentence.correctedSentence.trim()) continue;
      assert.deepEqual(
        runtime.checkExecutableGrammar(sentence.correctedSentence, { maximumIssues: 32 }),
        [],
        `${sentence.sentenceId} corrected sentence triggered an executable pattern`
      );
    }
    for (const control of data.sourceControls) {
      assert.deepEqual(
        runtime.checkExecutableGrammar(control.correctExample, { maximumIssues: 32 }),
        [],
        `${control.controlId} triggered an executable pattern`
      );
    }
    for (const testCase of data.testCases.filter((item) => item.partition === "holdout")) {
      assert.equal(testCase.runtimeEligible, false, `${testCase.caseId} holdout is runtime eligible`);
      assert.equal(
        runtime.EXECUTABLE_GRAMMAR_PATTERNS.some((pattern) => pattern.evidenceCaseId === testCase.caseId),
        false,
        `${testCase.caseId} was compiled into runtime data`
      );
    }
  }

  for (const setId of ["SET-0020", "SET-0021", "SET-0022"]) {
    const pattern = runtime.EXECUTABLE_GRAMMAR_PATTERNS.find((item) => item.evidenceSetId === setId);
    assert.ok(pattern, `${setId} has no active bounded surface pattern`);
    const alteredProse = [
      ...(pattern.startsSentence ? [] : ["separately"]),
      ...pattern.leftContext,
      pattern.matchText,
      ...pattern.rightContext
    ].join(" ") + (pattern.endsSentence ? "." : " in this separate example.");
    const evidenceCase = packages
      .find((item) => item.set.setId === setId)
      .testCases.find((item) => item.caseId === pattern.evidenceCaseId);
    assert.notEqual(alteredProse, evidenceCase.inputText, `${setId} probe copied its full evidence sentence`);
    assert.ok(
      runtime.checkExecutableGrammar(alteredProse, { maximumIssues: 32 })
        .some((issue) => issue.patternId === pattern.patternId),
      `${setId} pattern did not generalize to altered surrounding prose`
    );
  }

  const set22Sample = runtime.checkExecutableGrammar(
    "Mary loves to watch TV show at the night.",
    { maximumIssues: 32 }
  );
  assert.equal(set22Sample.length, 2);
  const set22NounIssue = set22Sample.find((issue) => (
    issue.ruleId === "GF_BARE_SINGULAR_COUNT_NOUN_ARGUMENT"
  ));
  assert.ok(set22NounIssue, "SET-0022 omitted the alternative-aware TV-show finding");
  assert.equal(set22NounIssue.originalText.includes("TV show"), true);
  assert.equal(set22NounIssue.suggestedText, "");
  assert.equal(set22NounIssue.reviewRequired, true);
  const set22TemporalIssue = set22Sample.find((issue) => (
    issue.ruleId === "GF_AT_NIGHT_TEMPORAL_EXPRESSION"
  ));
  assert.ok(set22TemporalIssue, "SET-0022 omitted the safe temporal finding");
  assert.equal(set22TemporalIssue.originalText, "at the night");
  assert.equal(set22TemporalIssue.suggestedText, "at night");
  assert.equal(set22TemporalIssue.reviewRequired, false);
  for (const cleanSentence of [
    "Mary watches a TV show after dinner.",
    "Mary watches TV shows after dinner.",
    "She stared at the night sky.",
    "I watched her younger brother sit beside her.",
    "The machine did not saw the timber.",
    "One benefit of these programmes is greater access.",
    "The charity for children was founded in 1990.",
    "The two episode summaries are ready.",
    "The pronoun they was underlined.",
    "The apostrophe in eleven o'clock marks omitted letters."
  ]) {
    assert.deepEqual(
      runtime.checkExecutableGrammar(cleanSentence, { maximumIssues: 32 }),
      [],
      `SET-0022 bounded patterns triggered a clean counterexample: ${cleanSentence}`
    );
  }

  const localAutoPattern = runtime.EXECUTABLE_GRAMMAR_PATTERNS.find((pattern) => (
    pattern.executionPolicy === "local_auto"
  ));
  if (localAutoPattern) {
    const localAutoInput = [
      ...localAutoPattern.leftContext,
      localAutoPattern.matchText,
      ...localAutoPattern.rightContext
    ].join(" ") + ".";
    assert.ok(
      merged.checkLocalLearnerEnglish(localAutoInput)
        .some((issue) => issue.ruleId === localAutoPattern.familyId),
      "merged local detector omitted executable-v2 findings"
    );
  }
} else {
  assert.ok(packageFiles.length < 4, "partial v2 package directory contains unexpected files");
  console.log("Executable grammar production-package assertions deferred until Sets 19–22 are present.");
}

console.log("Writing Submission executable grammar hardening: OK");
