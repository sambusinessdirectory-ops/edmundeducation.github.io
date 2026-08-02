import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIRECTORY, "../..");
const DATA_DIRECTORY = path.join(DIRECTORY, "data");
const ADVERSARIAL_CONTROLS_PATH = path.join(DIRECTORY, "adversarial-controls.json");
const OUTPUT_PATH = path.join(ROOT, "writing-submission-executable-grammar.generated.js");

export const EXPECTED_SET_IDS = Object.freeze(["SET-0019", "SET-0020", "SET-0021"]);
export const RUNTIME_APPROVAL_STATUS = "approved_for_bounded_surface_runtime";
export const KNOWN_CAPABILITIES = Object.freeze([
  "case_preservation",
  "coreference_and_discourse",
  "dependency_parse",
  "lexeme_frames",
  "lexical_context",
  "morphology",
  "register_policy",
  "semantic_roles",
  "sentence_boundaries",
  "surface_literal",
  "tokenize",
  "unicode_word_boundaries"
]);
export const BROWSER_CAPABILITIES = Object.freeze([
  "case_preservation",
  "lexical_context",
  "sentence_boundaries",
  "surface_literal",
  "tokenize",
  "unicode_word_boundaries"
]);

const KNOWN_CAPABILITY_SET = new Set(KNOWN_CAPABILITIES);
const BROWSER_CAPABILITY_SET = new Set(BROWSER_CAPABILITIES);
const SCHEMA_VERSIONS = new Set(["2.0.0-draft", "2.0.0", "2.1.0-runtime"]);
const POLICIES = new Set(["local_auto", "local_review", "remote_review", "guidance_only"]);
const RUNTIME_POLICIES = new Set(["local_auto", "local_review"]);
const CLASSIFICATIONS = new Set(["structural", "lexical_frame", "semantic", "style"]);
const PARTITIONS = new Set(["development", "regression", "holdout"]);
const RUNTIME_PARTITIONS = new Set(["development", "regression"]);
const EVIDENCE_KINDS = new Set([
  "exact_replacement_phrase",
  "exact_wrong_replacement_phrase",
  "full_sentence",
  "fully_corrected_source_sentence",
  "issue_table_phrase",
  "synthetic_control",
  "synthetic_holdout"
]);
const RUNTIME_EVIDENCE_KINDS = new Set(["full_sentence", "issue_table_phrase"]);
const CATEGORIES = new Set([
  "subject_verb_agreement", "article_or_determiner", "singular_plural",
  "countability", "verb_form_or_tense", "modal_or_auxiliary",
  "infinitive_or_gerund", "preposition", "pronoun", "sentence_structure",
  "conjunction", "parallelism", "comparison", "possessive", "punctuation",
  "spelling_or_spacing", "word_form", "word_choice", "other_grammar"
]);
const TEXT_CONTROL_RE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const WORD_RE = /[\p{L}\p{M}\p{N}]+(?:[\u2019'\-][\p{L}\p{M}\p{N}]+)*/gu;

function fail(message) {
  throw new Error(`Executable grammar validation failed: ${message}`);
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(`${label} must be an object`);
  return value;
}

function requireArray(value, label, maximum = 100000) {
  if (!Array.isArray(value) || value.length > maximum) fail(`${label} must be a bounded array`);
  return value;
}

function requireString(value, label, maximum = 4000) {
  if (
    typeof value !== "string"
    || !value.trim()
    || value !== value.trim()
    || value.length > maximum
    || TEXT_CONTROL_RE.test(value)
  ) fail(`${label} must be a trimmed, bounded string`);
  return value;
}

function requireOptionalString(value, label, maximum = 4000) {
  if (value === undefined) return "";
  if (
    typeof value !== "string"
    || value !== value.trim()
    || value.length > maximum
    || TEXT_CONTROL_RE.test(value)
  ) fail(`${label} must be a bounded string`);
  return value;
}

function requireBoolean(value, label) {
  if (typeof value !== "boolean") fail(`${label} must be a boolean`);
  return value;
}

function requireInteger(value, label, { minimum = 0, maximum = 1000000 } = {}) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    fail(`${label} must be an integer between ${minimum} and ${maximum}`);
  }
  return value;
}

function requireConfidence(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0.5 || value > 1) {
    fail(`${label} must be a finite number between 0.5 and 1`);
  }
  return value;
}

function requireEnum(value, allowed, label) {
  if (!allowed.has(value)) fail(`${label} has unsupported value ${JSON.stringify(value)}`);
  return value;
}

function requireRuntimeApproval(value, label) {
  if (value !== RUNTIME_APPROVAL_STATUS) {
    fail(`${label} must be ${RUNTIME_APPROVAL_STATUS}`);
  }
  return value;
}

function requirePendingHumanReview(value, label) {
  requireObject(value, label);
  if (value.sourceReviewStatus !== "draft" || value.teacherApproval !== "pending") {
    fail(`${label} must retain draft source review and pending teacher approval`);
  }
}

function requireUnique(values, key, label) {
  const map = new Map();
  for (const value of values) {
    const id = requireString(value?.[key], `${label}.${key}`, 180);
    if (map.has(id)) fail(`duplicate ${label} ${id}`);
    map.set(id, value);
  }
  return map;
}

function requireStringArray(value, label, {
  maximumItems = 1000,
  maximumLength = 180,
  allowed = null,
  nonempty = false
} = {}) {
  const source = requireArray(value, label, maximumItems);
  if (nonempty && source.length === 0) fail(`${label} must not be empty`);
  const seen = new Set();
  return Object.freeze(source.map((item, index) => {
    const text = requireString(item, `${label}[${index}]`, maximumLength);
    if (allowed && !allowed.has(text)) fail(`${label}[${index}] is unknown`);
    if (seen.has(text)) fail(`${label} contains duplicate ${text}`);
    seen.add(text);
    return text;
  }));
}

function normalizedWords(value) {
  return [...String(value).matchAll(WORD_RE)]
    .map((match) => match[0].toLocaleLowerCase("en-GB"));
}

function normalizedSurface(value) {
  return String(value || "").trim().replace(/\s+/gu, " ").toLocaleLowerCase("en-GB");
}

function requireCanonicalContext(value, label) {
  return Object.freeze(requireArray(value, label, 4).map((item, index) => {
    const text = requireString(item, `${label}[${index}]`, 80);
    const words = normalizedWords(text);
    if (words.length !== 1 || words[0] !== text) {
      fail(`${label}[${index}] must be one canonical lowercase token`);
    }
    return text;
  }));
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function familyDefinition(family) {
  return stableJson({
    name: family.name,
    nameZhHant: family.nameZhHant || "",
    classification: family.classification,
    executionPolicy: family.executionPolicy,
    grammarCategory: family.grammarCategory,
    explanationZhHant: family.explanationZhHant,
    version: family.version
  });
}

function matcherDefinition(matcher) {
  return stableJson({
    matcherId: matcher.matcherId,
    familyId: matcher.familyId,
    matcherType: matcher.matcherType,
    match: matcher.match,
    guards: matcher.guards,
    repair: matcher.repair,
    requiredCapabilities: matcher.requiredCapabilities
  });
}

export function readPackages({ dataDirectory = DATA_DIRECTORY } = {}) {
  const files = fs.readdirSync(dataDirectory)
    .filter((name) => /^SET-[0-9]{4}\.json$/u.test(name))
    .sort();
  const packages = files.map((name) => JSON.parse(fs.readFileSync(path.join(dataDirectory, name), "utf8")));
  const actualIds = packages.map((item) => item?.set?.setId).sort();
  assert.deepEqual(actualIds, [...EXPECTED_SET_IDS], "Executable grammar set files do not match 19–21");
  return packages;
}

export function validateSet(data) {
  requireObject(data, "set package");
  if (data.schemaName !== "edmund_executable_grammar_authoring") fail("unknown schemaName");
  requireEnum(data.schemaVersion, SCHEMA_VERSIONS, `${data.set?.setId}.schemaVersion`);
  requireObject(data.set, "set");
  const setId = requireString(data.set.setId, "set.setId", 40);
  if (!EXPECTED_SET_IDS.includes(setId) || !/^SET-[0-9]{4}$/u.test(setId)) fail(`unexpected set ${setId}`);
  const paragraphId = requireString(data.set.paragraphId, `${setId}.paragraphId`, 40);
  if (paragraphId !== `PARA-${setId.slice(4)}`) fail(`${setId} has mismatched paragraph id`);

  const issues = requireArray(data.sourceIssues, `${setId}.sourceIssues`);
  const families = requireArray(data.ruleFamilies, `${setId}.ruleFamilies`);
  const matchers = requireArray(data.matchers, `${setId}.matchers`);
  const bindings = requireArray(data.issueBindings, `${setId}.issueBindings`);
  const controls = requireArray(data.sourceControls, `${setId}.sourceControls`);
  const cases = requireArray(data.testCases, `${setId}.testCases`);
  const sourcePatterns = requireArray(data.runtimeSurfacePatterns, `${setId}.runtimeSurfacePatterns`);
  const issueMap = requireUnique(issues, "issueId", `${setId}.issue`);
  const familyMap = requireUnique(families, "familyId", `${setId}.family`);
  const matcherMap = requireUnique(matchers, "matcherId", `${setId}.matcher`);
  const bindingMap = requireUnique(bindings, "bindingId", `${setId}.binding`);
  const controlMap = requireUnique(controls, "controlId", `${setId}.control`);
  const caseMap = requireUnique(cases, "caseId", `${setId}.case`);
  requireUnique(sourcePatterns, "patternId", `${setId}.pattern`);

  for (const issue of issues) {
    requireString(issue.sentenceId, `${issue.issueId}.sentenceId`, 80);
    requireStringArray(issue.familyIds, `${issue.issueId}.familyIds`, { nonempty: true });
  }

  for (const family of families) {
    if (!/^GF_[A-Z0-9_]+$/u.test(family.familyId)) fail(`invalid family ${family.familyId}`);
    requireString(family.name, `${family.familyId}.name`, 180);
    requireOptionalString(family.nameZhHant, `${family.familyId}.nameZhHant`, 180);
    requireEnum(family.classification, CLASSIFICATIONS, `${family.familyId}.classification`);
    requireEnum(family.executionPolicy, POLICIES, `${family.familyId}.executionPolicy`);
    requireEnum(family.grammarCategory, CATEGORIES, `${family.familyId}.grammarCategory`);
    requireString(family.explanationZhHant, `${family.familyId}.explanationZhHant`, 1000);
    requireInteger(family.version, `${family.familyId}.version`, { minimum: 1 });
    for (const issueId of requireStringArray(family.sourceIssueIds, `${family.familyId}.sourceIssueIds`, { nonempty: true })) {
      if (!issueMap.has(issueId)) fail(`${family.familyId} references unknown issue ${issueId}`);
      if (!issueMap.get(issueId).familyIds.includes(family.familyId)) {
        fail(`${family.familyId} is missing from ${issueId}.familyIds`);
      }
    }
    for (const matcherId of requireStringArray(family.matcherIds, `${family.familyId}.matcherIds`, { nonempty: true })) {
      const matcher = matcherMap.get(matcherId);
      if (!matcher) fail(`${family.familyId} references unknown matcher ${matcherId}`);
      if (matcher.familyId !== family.familyId) fail(`${family.familyId} references another family's matcher ${matcherId}`);
    }
  }

  const normalizedMatchers = [];
  for (const matcher of matchers) {
    const family = familyMap.get(matcher.familyId);
    if (!family) fail(`${matcher.matcherId} references unknown family`);
    if (!family.matcherIds.includes(matcher.matcherId)) fail(`${matcher.matcherId} is absent from its family matcherIds`);
    requireString(matcher.matcherType, `${matcher.matcherId}.matcherType`, 100);
    requireObject(matcher.match, `${matcher.matcherId}.match`);
    requireArray(matcher.guards, `${matcher.matcherId}.guards`, 100);
    requireObject(matcher.repair, `${matcher.matcherId}.repair`);
    const requiredCapabilities = requireStringArray(
      matcher.requiredCapabilities,
      `${matcher.matcherId}.requiredCapabilities`,
      { allowed: KNOWN_CAPABILITY_SET, maximumItems: KNOWN_CAPABILITIES.length }
    );
    normalizedMatchers.push({ ...matcher, requiredCapabilities });
  }
  const normalizedMatcherMap = new Map(normalizedMatchers.map((matcher) => [matcher.matcherId, matcher]));

  for (const binding of bindings) {
    const issue = issueMap.get(binding.issueId);
    const family = familyMap.get(binding.familyId);
    const matcher = normalizedMatcherMap.get(binding.matcherId);
    if (!issue) fail(`${binding.bindingId} references unknown issue`);
    if (!family) fail(`${binding.bindingId} references unknown family`);
    if (!matcher) fail(`${binding.bindingId} references unknown matcher`);
    if (matcher.familyId !== binding.familyId) fail(`${binding.bindingId} crosses matcher families`);
    if (!issue.familyIds.includes(binding.familyId)) fail(`${binding.bindingId} crosses issue families`);
    if (!family.sourceIssueIds.includes(binding.issueId)) fail(`${binding.bindingId} is absent from family source issues`);
  }

  for (const control of controls) {
    requireString(control.correctExample, `${control.controlId}.correctExample`, 2000);
  }

  for (const testCase of cases) {
    if (!familyMap.has(testCase.familyId)) fail(`${testCase.caseId} references unknown family`);
    requireEnum(testCase.partition, PARTITIONS, `${testCase.caseId}.partition`);
    requireBoolean(testCase.runtimeEligible, `${testCase.caseId}.runtimeEligible`);
    requireString(testCase.inputText, `${testCase.caseId}.inputText`, 2000);
    if (testCase.evidenceKind !== undefined) {
      requireEnum(testCase.evidenceKind, EVIDENCE_KINDS, `${testCase.caseId}.evidenceKind`);
    }
    if (testCase.partition === "holdout" && testCase.runtimeEligible) {
      fail(`${testCase.caseId} leaks holdout data into runtime`);
    }
  }

  const bindingTriples = new Set([...bindingMap.values()].map((binding) => (
    `${binding.issueId}\u0000${binding.familyId}\u0000${binding.matcherId}`
  )));
  const patterns = [];
  for (const pattern of sourcePatterns) {
    const family = familyMap.get(pattern.familyId);
    if (!family) fail(`${pattern.patternId} references unknown family`);
    if (pattern.matcherType !== "surface_literal") fail(`${pattern.patternId} has unsupported runtime matcher`);
    requireEnum(pattern.executionPolicy, RUNTIME_POLICIES, `${pattern.patternId}.executionPolicy`);
    requireBoolean(pattern.runtimeEligible, `${pattern.patternId}.runtimeEligible`);
    if (!pattern.runtimeEligible) continue;

    requireRuntimeApproval(data.set.runtimeApprovalStatus, `${setId}.runtimeApprovalStatus`);
    requireRuntimeApproval(family.runtimeApprovalStatus, `${family.familyId}.runtimeApprovalStatus`);
    requireRuntimeApproval(pattern.runtimeApprovalStatus, `${pattern.patternId}.runtimeApprovalStatus`);
    requirePendingHumanReview(data.set, setId);
    requirePendingHumanReview(family, family.familyId);
    requirePendingHumanReview(pattern, pattern.patternId);
    const matcherId = requireString(pattern.matcherId, `${pattern.patternId}.matcherId`, 180);
    const sourceIssueId = requireString(pattern.sourceIssueId, `${pattern.patternId}.sourceIssueId`, 180);
    const evidenceCaseId = requireString(pattern.evidenceCaseId, `${pattern.patternId}.evidenceCaseId`, 180);
    const matcher = normalizedMatcherMap.get(matcherId);
    const issue = issueMap.get(sourceIssueId);
    const evidenceCase = caseMap.get(evidenceCaseId);
    if (!matcher || matcher.familyId !== family.familyId) fail(`${pattern.patternId} has an invalid matcher link`);
    if (!issue || !issue.familyIds.includes(family.familyId)) fail(`${pattern.patternId} has an invalid issue link`);
    if (!evidenceCase || evidenceCase.familyId !== family.familyId) fail(`${pattern.patternId} has an invalid evidence-case link`);
    if (!bindingTriples.has(`${sourceIssueId}\u0000${family.familyId}\u0000${matcherId}`)) {
      fail(`${pattern.patternId} has no matching atomic binding`);
    }
    requireRuntimeApproval(matcher.runtimeApprovalStatus, `${matcher.matcherId}.runtimeApprovalStatus`);
    requireRuntimeApproval(evidenceCase.runtimeApprovalStatus, `${evidenceCase.caseId}.runtimeApprovalStatus`);
    requirePendingHumanReview(matcher, matcher.matcherId);
    requirePendingHumanReview(evidenceCase, evidenceCase.caseId);
    if (evidenceCase.runtimeEligible !== true) {
      fail(`${pattern.patternId} evidence case is not runtime eligible`);
    }
    const evidenceKind = requireEnum(
      evidenceCase.evidenceKind,
      RUNTIME_EVIDENCE_KINDS,
      `${evidenceCase.caseId}.evidenceKind`
    );
    if (pattern.caseId !== evidenceCaseId || pattern.evidenceKind !== evidenceKind) {
      fail(`${pattern.patternId} evidence aliases differ from its evidence case`);
    }
    if (evidenceCase.sourceIssueId !== sourceIssueId) {
      fail(`${pattern.patternId} evidence case differs from its source issue`);
    }
    if (pattern.executionPolicy === "local_auto" && evidenceKind !== "full_sentence") {
      fail(`${pattern.patternId} local_auto requires full-sentence evidence`);
    }

    if (!RUNTIME_POLICIES.has(family.executionPolicy)) fail(`${pattern.patternId} promotes a non-local family`);
    if (family.executionPolicy !== pattern.executionPolicy) {
      fail(`${pattern.patternId} policy differs from its family`);
    }
    const partition = requireEnum(pattern.partition, RUNTIME_PARTITIONS, `${pattern.patternId}.partition`);
    if (evidenceCase.partition !== partition) fail(`${pattern.patternId} partition differs from its evidence case`);
    const evidenceSetId = requireString(pattern.evidenceSetId, `${pattern.patternId}.evidenceSetId`, 40);
    if (evidenceSetId !== setId) fail(`${pattern.patternId} has mismatched evidence set`);
    if (evidenceCase.evidenceSetId !== evidenceSetId) {
      fail(`${pattern.patternId} evidence case has a mismatched evidence set`);
    }
    const sentenceId = requireString(pattern.sentenceId, `${pattern.patternId}.sentenceId`, 80);
    if (sentenceId !== issue.sentenceId) fail(`${pattern.patternId} sentence differs from its source issue`);

    const requiredCapabilities = requireStringArray(
      pattern.requiredCapabilities,
      `${pattern.patternId}.requiredCapabilities`,
      { allowed: KNOWN_CAPABILITY_SET, maximumItems: KNOWN_CAPABILITIES.length, nonempty: true }
    );
    if (!requiredCapabilities.includes("surface_literal")) fail(`${pattern.patternId} lacks surface_literal capability`);
    const unsupported = requiredCapabilities.filter((capability) => !BROWSER_CAPABILITY_SET.has(capability));
    if (unsupported.length) fail(`${pattern.patternId} requires unavailable browser capabilities: ${unsupported.join(", ")}`);
    if (matcher.matcherType !== "surface_literal") {
      fail(`${pattern.patternId} references a parser-dependent matcher`);
    }
    const unsupportedMatcherCapabilities = matcher.requiredCapabilities
      .filter((capability) => !BROWSER_CAPABILITY_SET.has(capability));
    if (unsupportedMatcherCapabilities.length) {
      fail(`${pattern.patternId} matcher requires unavailable browser capabilities: ${unsupportedMatcherCapabilities.join(", ")}`);
    }
    if (matcher.requiredCapabilities.some((capability) => !requiredCapabilities.includes(capability))) {
      fail(`${pattern.patternId} capabilities do not cover its matcher`);
    }

    const matchText = requireString(pattern.matchText, `${pattern.patternId}.matchText`, 180);
    const replacementText = requireString(pattern.replacementText, `${pattern.patternId}.replacementText`, 220);
    if (matchText === replacementText) fail(`${pattern.patternId} does not change text`);
    if (!normalizedSurface(evidenceCase.inputText).includes(normalizedSurface(matchText))) {
      fail(`${pattern.patternId} match text is absent from its evidence case`);
    }
    if (!normalizedSurface(evidenceCase.expectedCorrectedText).includes(normalizedSurface(replacementText))) {
      fail(`${pattern.patternId} replacement is absent from its evidence correction`);
    }
    if (/\.{3}|…/u.test(matchText) || /\.{3}|…/u.test(replacementText)) {
      fail(`${pattern.patternId} contains an unresolved ellipsis`);
    }
    const acceptableAlternatives = requireStringArray(
      pattern.acceptableAlternatives,
      `${pattern.patternId}.acceptableAlternatives`,
      { maximumItems: 8, maximumLength: 220 }
    );
    const normalizedRepairs = new Set([replacementText, ...acceptableAlternatives]
      .map((value) => value.toLocaleLowerCase("en-GB")));
    if (normalizedRepairs.size !== acceptableAlternatives.length + 1) {
      fail(`${pattern.patternId} repeats an alternative repair`);
    }
    const leftContext = requireCanonicalContext(pattern.leftContext, `${pattern.patternId}.leftContext`);
    const rightContext = requireCanonicalContext(pattern.rightContext, `${pattern.patternId}.rightContext`);
    const startsSentence = requireBoolean(pattern.startsSentence, `${pattern.patternId}.startsSentence`);
    const endsSentence = requireBoolean(pattern.endsSentence, `${pattern.patternId}.endsSentence`);
    if (startsSentence && leftContext.length) fail(`${pattern.patternId} cannot start a sentence with left context`);
    if (endsSentence && rightContext.length) fail(`${pattern.patternId} cannot end a sentence with right context`);
    const confidence = requireConfidence(pattern.confidence, `${pattern.patternId}.confidence`);
    if (pattern.executionPolicy === "local_auto" && confidence < 0.99) {
      fail(`${pattern.patternId} local_auto confidence is below 0.99`);
    }
    const priority = requireInteger(pattern.priority, `${pattern.patternId}.priority`, { maximum: 100000 });
    const conflictGroup = requireString(
      pattern.conflictGroup || family.familyId,
      `${pattern.patternId}.conflictGroup`,
      180
    );
    const explanationZhHant = requireOptionalString(
      pattern.explanationZhHant,
      `${pattern.patternId}.explanationZhHant`,
      1000
    );

    patterns.push(Object.freeze({
      patternId: pattern.patternId,
      familyId: family.familyId,
      matcherId,
      sourceIssueId,
      evidenceCaseId,
      evidenceKind,
      sentenceId,
      matcherType: "surface_literal",
      executionPolicy: pattern.executionPolicy,
      runtimeEligible: true,
      runtimeApprovalStatus: RUNTIME_APPROVAL_STATUS,
      matchText,
      replacementText,
      acceptableAlternatives,
      leftContext,
      rightContext,
      startsSentence,
      endsSentence,
      evidenceSetId,
      partition,
      requiredCapabilities,
      confidence,
      priority,
      conflictGroup,
      explanationZhHant
    }));
  }

  const expectedIssueCount = Number(data.counts?.sourceIssues);
  if (!Number.isSafeInteger(expectedIssueCount) || expectedIssueCount !== issues.length) {
    fail(`${setId} issue count mismatch`);
  }
  if (setId === "SET-0020" && issues.length !== 116) fail("SET-0020 must preserve all 116 physical rows");
  if (setId === "SET-0021" && bindings.length !== 85) fail("SET-0021 must preserve 85 atomic bindings");
  return {
    setId,
    issues,
    families,
    matchers: normalizedMatchers,
    bindings,
    controls: [...controlMap.values()],
    cases,
    patterns
  };
}

function requireGloballyCompatible(values, key, definition, label) {
  const map = new Map();
  for (const value of values) {
    const id = value[key];
    const signature = definition(value);
    const current = map.get(id);
    if (current && current.signature !== signature) fail(`conflicting global ${label} ${id}`);
    if (!current) map.set(id, { signature, value });
  }
  return map;
}

export function compile(packages) {
  const validated = packages.map(validateSet);
  requireUnique(validated.flatMap((entry) => entry.issues), "issueId", "global issue");
  requireUnique(validated.flatMap((entry) => entry.bindings), "bindingId", "global binding");
  requireUnique(validated.flatMap((entry) => entry.controls), "controlId", "global control");
  requireUnique(validated.flatMap((entry) => entry.cases), "caseId", "global case");
  requireUnique(validated.flatMap((entry) => entry.patterns), "patternId", "runtime pattern");
  requireGloballyCompatible(
    validated.flatMap((entry) => entry.matchers),
    "matcherId",
    matcherDefinition,
    "matcher"
  );

  const mergedFamilies = new Map();
  for (const { setId, families, matchers } of validated) {
    const matchersByFamily = new Map();
    for (const matcher of matchers) {
      const bucket = matchersByFamily.get(matcher.familyId) || [];
      bucket.push(matcher);
      matchersByFamily.set(matcher.familyId, bucket);
    }
    for (const family of families) {
      const current = mergedFamilies.get(family.familyId);
      if (current && current.definition !== familyDefinition(family)) {
        fail(`conflicting definitions for ${family.familyId}`);
      }
      const next = current || {
        definition: familyDefinition(family),
        familyId: family.familyId,
        name: family.name,
        nameZhHant: family.nameZhHant || "",
        classification: family.classification,
        executionPolicy: family.executionPolicy,
        grammarCategory: family.grammarCategory,
        explanationZhHant: family.explanationZhHant,
        version: family.version,
        runtimeApprovalStatus: family.runtimeApprovalStatus || "",
        sourceSetIds: new Set(),
        sourceIssueIds: new Set(),
        requiredCapabilities: new Set()
      };
      next.sourceSetIds.add(setId);
      family.sourceIssueIds.forEach((issueId) => next.sourceIssueIds.add(issueId));
      for (const matcher of matchersByFamily.get(family.familyId) || []) {
        matcher.requiredCapabilities.forEach((capability) => next.requiredCapabilities.add(capability));
      }
      mergedFamilies.set(family.familyId, next);
    }
  }

  const patterns = validated
    .flatMap((entry) => entry.patterns)
    .sort((left, right) => left.patternId.localeCompare(right.patternId));
  const runtimeFamilyIds = new Set(patterns.map((pattern) => pattern.familyId));
  const families = [...mergedFamilies.values()]
    .map((family) => ({
      familyId: family.familyId,
      name: family.name,
      nameZhHant: family.nameZhHant,
      classification: family.classification,
      executionPolicy: family.executionPolicy,
      grammarCategory: family.grammarCategory,
      explanationZhHant: family.explanationZhHant,
      version: family.version,
      // Approval is a property of the emitted runtime surface. A family may be
      // unapproved in one source set yet approved for a bounded pattern in a
      // later set, so first-set merge order must never decide runtime status.
      runtimeApprovalStatus: runtimeFamilyIds.has(family.familyId)
        ? RUNTIME_APPROVAL_STATUS
        : "not_approved",
      sourceSetIds: [...family.sourceSetIds].sort(),
      sourceIssueIds: [...family.sourceIssueIds].sort(),
      requiredCapabilities: [...family.requiredCapabilities].sort(),
      browserRuntimeSupported: runtimeFamilyIds.has(family.familyId),
      parserCapabilitiesMissing: [...family.requiredCapabilities]
        .filter((value) => !BROWSER_CAPABILITY_SET.has(value))
        .sort()
    }))
    .sort((left, right) => left.familyId.localeCompare(right.familyId));
  const counts = {
    sets: validated.length,
    sourceIssues: validated.reduce((total, entry) => total + entry.issues.length, 0),
    families: families.length,
    runtimeFamilies: runtimeFamilyIds.size,
    patterns: patterns.length,
    controls: validated.reduce((total, entry) => total + entry.controls.length, 0),
    cases: validated.reduce((total, entry) => total + entry.cases.length, 0),
    unsupportedFamilies: families.filter((family) => !family.browserRuntimeSupported).length
  };
  const version = "2026-08-02.19-21.1";
  return { version, counts, families, patterns };
}

export function generatedModule(compiled) {
  return `// GENERATED FILE. Edit tools/grammar-detector-v2/data and run\n// node tools/grammar-detector-v2/validate-and-compile.mjs instead.\n\nexport const EXECUTABLE_GRAMMAR_VERSION = ${JSON.stringify(compiled.version)};\n\nexport const EXECUTABLE_GRAMMAR_COUNTS = Object.freeze(${JSON.stringify(compiled.counts, null, 2)});\n\nexport const EXECUTABLE_GRAMMAR_FAMILIES = Object.freeze(${JSON.stringify(compiled.families, null, 2)}.map((family) => Object.freeze({\n  ...family,\n  sourceSetIds: Object.freeze(family.sourceSetIds),\n  sourceIssueIds: Object.freeze(family.sourceIssueIds),\n  requiredCapabilities: Object.freeze(family.requiredCapabilities),\n  parserCapabilitiesMissing: Object.freeze(family.parserCapabilitiesMissing)\n})));\n\nexport const EXECUTABLE_GRAMMAR_PATTERNS = Object.freeze(${JSON.stringify(compiled.patterns, null, 2)}.map((pattern) => Object.freeze({\n  ...pattern,\n  acceptableAlternatives: Object.freeze(pattern.acceptableAlternatives),\n  leftContext: Object.freeze(pattern.leftContext),\n  rightContext: Object.freeze(pattern.rightContext),\n  requiredCapabilities: Object.freeze(pattern.requiredCapabilities)\n})));\n`;
}

function validateAdversarialControls(packages, compiled) {
  const document = requireObject(
    JSON.parse(fs.readFileSync(ADVERSARIAL_CONTROLS_PATH, "utf8")),
    "adversarial controls"
  );
  if (
    document.schemaName !== "edmund_executable_grammar_adversarial_controls"
    || document.schemaVersion !== "1.0.0"
  ) fail("adversarial controls schema is unsupported");
  const controls = requireArray(document.controls, "adversarial controls", 1000);
  const authoredPatterns = requireUnique(
    packages.flatMap((data) => requireArray(data.runtimeSurfacePatterns, `${data.set?.setId}.runtimeSurfacePatterns`)),
    "patternId",
    "authored runtime pattern"
  );
  const controlIds = new Set();
  const emittedPatternIds = new Set(compiled.patterns.map((pattern) => pattern.patternId));
  for (const control of controls) {
    requireObject(control, "adversarial control");
    const patternId = requireString(control.patternId, "adversarial control patternId", 180);
    if (controlIds.has(patternId)) fail(`duplicate adversarial control ${patternId}`);
    controlIds.add(patternId);
    requireEnum(control.policy, RUNTIME_POLICIES, `${patternId}.policy`);
    requireEnum(control.strength, new Set(["strong", "variant_sensitive"]), `${patternId}.strength`);
    const sentence = requireString(control.sentence, `${patternId}.sentence`, 2000);
    const pattern = authoredPatterns.get(patternId);
    if (!pattern) fail(`${patternId} adversarial control has no authored candidate`);
    if (pattern.executionPolicy !== control.policy) fail(`${patternId} adversarial policy drifted`);
    if (pattern.runtimeEligible !== false || emittedPatternIds.has(patternId)) {
      fail(`${patternId} is enabled despite a valid unseen counterexample`);
    }
    if (!String(pattern.reasonDisabled || "").includes("Valid unseen counterexample")) {
      fail(`${patternId} does not retain its adversarial disable reason`);
    }
    const owner = packages.find((data) => data.set?.setId === patternId.slice(0, 8));
    const negativeCase = owner?.testCases?.find((testCase) => testCase.caseId === `${patternId}-NEG`);
    if (
      !negativeCase
      || negativeCase.caseKind !== "adversarial_clean_control"
      || negativeCase.partition !== "regression"
      || negativeCase.inputText !== sentence
      || negativeCase.expectedCorrectedText !== sentence
      || negativeCase.expectedOutcome !== "no_finding"
      || negativeCase.evidenceKind !== "synthetic_control"
      || negativeCase.runtimeEligible !== false
    ) fail(`${patternId} is missing its exact non-runtime adversarial regression case`);
  }
  return controls.length;
}

function main() {
  const packages = readPackages();
  const compiled = compile(packages);
  const adversarialControls = validateAdversarialControls(packages, compiled);
  fs.writeFileSync(OUTPUT_PATH, generatedModule(compiled));
  console.log(JSON.stringify({
    ok: true,
    output: path.relative(ROOT, OUTPUT_PATH),
    ...compiled.counts,
    adversarialControls
  }, null, 2));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
