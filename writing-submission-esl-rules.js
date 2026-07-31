import {
  WRITING_ESL_RULE_ENGINE,
  checkLocalLearnerEnglish as checkCoreLearnerEnglish,
  mergeGrammarIssues
} from "./writing-submission-esl-rules-core.js?v=20260731-2";

export { WRITING_ESL_RULE_ENGINE, mergeGrammarIssues };

const QUANTIFIED_NOUN_FOLLOWERS = new Set([
  "allow", "allows", "are", "can", "carry", "carries", "could", "create", "creates",
  "did", "do", "does", "find", "finds", "give", "gives", "go", "goes", "had",
  "has", "have", "help", "helps", "improve", "improves", "increase", "increases",
  "is", "locate", "locates", "make", "makes", "may", "might", "must", "need",
  "needs", "offer", "offers", "provide", "provides", "reduce", "reduces", "rely",
  "relies", "require", "requires", "sell", "sells", "should", "spend", "spends",
  "study", "studies", "try", "tries", "use", "uses", "want", "wants", "wear",
  "wears", "were", "will", "work", "works", "would"
]);

const PARALLEL_FIRST_VERBS = [
  "find", "help", "identify", "locate", "recognise", "recognize", "support"
];

const PARALLEL_PAST_TO_BASE = Object.freeze({
  enhanced: "enhance",
  improved: "improve",
  increased: "increase",
  reduced: "reduce"
});

const ABSTRACT_OBJECTS = [
  "awareness", "communication", "confidence", "efficiency", "performance",
  "professionalism", "productivity", "safety", "trust"
];

function escapedAlternation(values) {
  return [...values]
    .sort((left, right) => right.length - left.length)
    .map((value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"))
    .join("|");
}

function replaceRange(source, start, end, replacement) {
  return `${source.slice(0, start)}${replacement}${source.slice(end)}`;
}

function issueWithReplacement(source, issue, replacement, message = issue.message) {
  return Object.freeze({
    ...issue,
    message,
    suggestedText: replacement,
    correctedSentence: replaceRange(source, issue.start, issue.end, replacement),
    suggestions: Object.freeze([Object.freeze({
      kind: "replace",
      replacementText: replacement
    })])
  });
}

function isQuantifiedNounFalsePositive(source, issue) {
  if (issue.ruleId !== "EslPluralAfterQuantifier") return false;
  const nextWord = source.slice(issue.end).match(/^\s+([A-Za-z][A-Za-z'-]*)/u)?.[1]?.toLocaleLowerCase("en-GB") || "";
  return Boolean(nextWord && !QUANTIFIED_NOUN_FOLLOWERS.has(nextWord));
}

function refineCoreIssue(source, issue) {
  if (isQuantifiedNounFalsePositive(source, issue)) return null;

  if (issue.ruleId === "EslModalBaseVerb" && /^(?:are|is)$/iu.test(issue.originalText)) {
    return issueWithReplacement(
      source,
      issue,
      "be",
      `${issue.originalText} 不是情態動詞後使用的原形；應改為 be。`
    );
  }

  if (issue.ruleId === "EslRequireObjectInfinitive") {
    const match = issue.originalText.match(/\b(require|requires|required|requiring)\s+([A-Za-z][A-Za-z'-]*)\s+(need|needs|needed)\s+to\s+([A-Za-z][A-Za-z'-]*)\b/iu);
    if (match) {
      return Object.freeze({
        ...issue,
        message: `require 後面通常直接用「誰 + to + 動詞原形」。不要在 ${match[2]} 後再加 ${match[3]}；to 後面的 ${match[4]} 亦要改成動詞原形。`
      });
    }
  }

  return issue;
}

function modalParallelIssues(source) {
  const modal = "can|could|may|might|must|shall|should|will|would";
  const adverb = "also|always|easily|generally|never|normally|often|quickly|really|still|usually";
  const firstVerb = escapedAlternation(PARALLEL_FIRST_VERBS);
  const pastVerb = escapedAlternation(Object.keys(PARALLEL_PAST_TO_BASE));
  const abstractObject = escapedAlternation(ABSTRACT_OBJECTS);
  const pattern = new RegExp(
    `\\b(${modal})\\s+(?:(?:${adverb})\\s+)?(?:${firstVerb})\\b[^.;!?]{0,140}?\\band\\s+(${pastVerb})(?=\\s+(?:${abstractObject})\\b)`,
    "giu"
  );
  const issues = [];

  for (const match of source.matchAll(pattern)) {
    const originalText = match[2];
    const suggestedText = PARALLEL_PAST_TO_BASE[originalText.toLocaleLowerCase("en-GB")];
    const start = match.index + match[0].length - originalText.length;
    const end = start + originalText.length;
    issues.push(Object.freeze({
      ruleId: "EslModalParallelVerb",
      title: "並列動詞形式要一致",
      category: "Learner English",
      message: `${match[1]} 同時帶領前後兩個動作時，兩個動詞都要用原形。因此 ${originalText} 應改為 ${suggestedText}。`,
      originalText,
      suggestedText,
      correctedSentence: replaceRange(source, start, end, suggestedText),
      start,
      end,
      suggestions: Object.freeze([Object.freeze({
        kind: "replace",
        replacementText: suggestedText
      })]),
      engine: WRITING_ESL_RULE_ENGINE
    }));
  }

  return Object.freeze(issues);
}

/**
 * Apply conservative context guards to the core local rules and add the small
 * parallel-verb check used by common learner sentences such as
 * "can locate staff ... and enhanced trust".
 */
export function checkLocalLearnerEnglish(text) {
  const source = String(text || "");
  const coreIssues = checkCoreLearnerEnglish(source)
    .map((issue) => refineCoreIssue(source, issue))
    .filter(Boolean);
  return mergeGrammarIssues(coreIssues, modalParallelIssues(source));
}
