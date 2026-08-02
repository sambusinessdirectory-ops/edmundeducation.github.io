import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const TEST_MODE_KEY = "EDMUND_GENERAL_GRAMMAR_ESM_TEST";
const thisFile = fileURLToPath(import.meta.url);

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
const { checkLocalLearnerEnglish } = await import(pathToFileURL(
  path.join(root, "writing-submission-esl-rules.js")
));
const corpus = JSON.parse(fs.readFileSync(
  path.join(root, "grammar-corpus/corpus-v1.json"),
  "utf8"
));

const positives = Object.freeze([
  ["John like food.", [[5, 9, "like", "likes"]]],
  ["Maria go to school.", [[6, 8, "go", "goes"]]],
  ["He eat rice.", [[3, 6, "eat", "eats"]]],
  ["She study daily.", [[4, 9, "study", "studies"]]],
  ["They likes food.", [[5, 10, "likes", "like"]]],
  ["We goes home.", [[3, 7, "goes", "go"]]],
  ["John and Mary likes food.", [[14, 19, "likes", "like"]]],
  ["John like eat food.", [[5, 9, "like", "likes"], [10, 13, "eat", "to eat"]]],
  ["Maria enjoy read books.", [[6, 11, "enjoy", "enjoys"], [12, 16, "read", "reading"]]],
  ["He want go home.", [[3, 7, "want", "wants"], [8, 10, "go", "to go"]]],
  ["I likes reading.", [[2, 7, "likes", "like"]]],
  ["You goes home.", [[4, 8, "goes", "go"]]],
  ["It contain water.", [[3, 10, "contain", "contains"]]],
  ["Someone need help.", [[8, 12, "need", "needs"]]],
  ["This improve results.", [[5, 12, "improve", "improves"]]],
  ["The student like eating food.", [[12, 16, "like", "likes"]]],
  ["My brother enjoy play football.", [[11, 16, "enjoy", "enjoys"], [17, 21, "play", "playing"]]],
  ["Every student need help.", [[14, 18, "need", "needs"]]],
  ["A company require uniforms.", [[10, 17, "require", "requires"]]],
  ["Customers likes uniforms.", [[10, 15, "likes", "like"]]],
  ["New policy reduce costs.", [[11, 17, "reduce", "reduces"]]],
  ["People enjoy read books.", [[13, 17, "read", "reading"]]],
  ["They avoid eat sugar.", [[11, 14, "eat", "eating"]]],
  ["We decide leave early.", [[10, 15, "leave", "to leave"]]],
  ["I want study medicine.", [[7, 12, "study", "to study"]]],
  ["Maria support disabled students.", [[6, 13, "support", "supports"]]],
  ["John work displayed examples.", [[5, 9, "work", "works"]]]
]);

for (const [sentence, expected] of positives) {
  const actual = checkLocalLearnerEnglish(sentence).map((issue) => [
    issue.start,
    issue.end,
    issue.originalText,
    issue.suggestedText
  ]);
  assert.deepEqual(actual, expected, sentence);
}

const negatives = Object.freeze([
  "Please help students.",
  "Always help others.",
  "Never give up.",
  "First consider the evidence.",
  "Today, students learn.",
  "May helps students.",
  "Hope helps people.",
  "Love makes people happy.",
  "Water boils.",
  "Research shows progress.",
  "Staff work late.",
  "Police report incidents.",
  "Data show change.",
  "People like food.",
  "John likes food.",
  "John likes eating food.",
  "John likes to eat food.",
  "John and Mary like food.",
  "I like work.",
  "We enjoy reading.",
  "We plan work carefully.",
  "They need help.",
  "I want water.",
  "She suggests that he leave.",
  "They suggest visiting museums.",
  "I prefer coffee.",
  "He appeared tired.",
  "They try calling later.",
  "I stopped smoking.",
  "I stopped to smoke.",
  "She remembers locking the door.",
  "She remembered to lock the door.",
  "Last year John worked late.",
  "John can eat food.",
  "John may eat food.",
  "Reading helps students.",
  "Swimming keeps us healthy.",
  "Remote work displayed the opposite pattern.",
  "Hybrid work clearly improved productivity.",
  "The complete process takes six hours.",
  "Our report compares the towns.",
  "By design, the system works.",
  "At present, demand is stable.",
  "In contrast, costs fell.",
  "On balance, the plan works.",
  "The students like reading.",
  "Every student needs help.",
  "My brother enjoys playing football."
]);

for (const sentence of negatives) {
  assert.deepEqual(checkLocalLearnerEnglish(sentence), [], sentence);
}

// A sentence-initial determiner phrase must not revive the old speculative
// name/agreement false positive. The former bare "compares between" surface
// rule is intentionally inactive because it collides with numeric ranges.
{
  const issues = checkLocalLearnerEnglish("Our report compares between towns.");
  assert.equal(
    issues.some((issue) => issue.ruleId === "EslSingularNamePresentAgreement"),
    false
  );
}

for (const sentence of corpus.sentences) {
  for (const correctVariant of [
    sentence.correctedSentence,
    `${sentence.correctedSentence} This is documented.`,
    `For reference, ${sentence.correctedSentence}`
  ]) {
    assert.deepEqual(
      checkLocalLearnerEnglish(correctVariant),
      [],
      `${sentence.sentenceId}: ${correctVariant}`
    );
  }
}

console.log("Writing Submission generalized grammar rules: OK");
