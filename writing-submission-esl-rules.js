import {
  WRITING_ESL_RULE_ENGINE,
  checkLocalLearnerEnglish as checkCoreLearnerEnglish,
  mergeGrammarIssues
} from "./writing-submission-esl-rules-core.js?v=20260801-grammar2";

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

const ARTICLE_PLURAL_TO_SINGULAR = Object.freeze({
  advantages: "advantage",
  benefits: "benefit",
  businesses: "business",
  changes: "change",
  companies: "company",
  customers: "customer",
  disadvantages: "disadvantage",
  drawbacks: "drawback",
  examples: "example",
  ideas: "idea",
  impressions: "impression",
  problems: "problem",
  reasons: "reason",
  schools: "school",
  shops: "shop",
  solutions: "solution",
  students: "student",
  uniforms: "uniform",
  workers: "worker",
  years: "year"
});

const ARTICLE_QUANTIFIER_PHRASES = [
  "couple of", "few", "group of", "lot of", "number of", "pair of", "range of",
  "series of", "variety of"
];

const EXISTENTIAL_PLURAL_QUANTIFIERS = new Set([
  "couple", "few", "group", "lot", "number", "pair", "range", "series", "variety"
]);

function escapedAlternation(values) {
  return [...values]
    .sort((left, right) => right.length - left.length)
    .map((value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"))
    .join("|");
}

function replaceRange(source, start, end, replacement) {
  return `${source.slice(0, start)}${replacement}${source.slice(end)}`;
}

function createRuleIssue(source, {
  ruleId,
  title,
  message,
  start,
  end,
  replacement,
  category = "Learner English",
  reviewRequired = false
}) {
  const originalText = source.slice(start, end);
  const hasReplacement = typeof replacement === "string" && replacement !== originalText;
  return Object.freeze({
    ruleId,
    title,
    category,
    message,
    originalText,
    suggestedText: hasReplacement ? replacement : "",
    correctedSentence: hasReplacement ? replaceRange(source, start, end, replacement) : source,
    start,
    end,
    suggestions: hasReplacement
      ? Object.freeze([Object.freeze({ kind: "replace", replacementText: replacement })])
      : Object.freeze([]),
    engine: WRITING_ESL_RULE_ENGINE,
    reviewRequired
  });
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
    const replacement = PARALLEL_PAST_TO_BASE[originalText.toLocaleLowerCase("en-GB")];
    const start = match.index + match[0].length - originalText.length;
    issues.push(createRuleIssue(source, {
      ruleId: "EslModalParallelVerb",
      title: "並列動詞形式要一致",
      message: `${match[1]} 同時帶領前後兩個動作時，兩個動詞都要用原形。因此 ${originalText} 應改為 ${replacement}。`,
      start,
      end: start + originalText.length,
      replacement
    }));
  }

  return issues;
}

function beHaveDoubleVerbIssues(source) {
  const issues = [];
  const pattern = /\b(am|are|is)\s+(have|has)\b/giu;
  for (const match of source.matchAll(pattern)) {
    const beVerb = match[1].toLocaleLowerCase("en-GB");
    const replacement = beVerb === "is" ? "has" : "have";
    issues.push(createRuleIssue(source, {
      ruleId: "EslBeHaveDoubleVerb",
      title: "不要同時使用 be 和 have",
      message: `${match[0]} 把兩個現在式動詞放在一起。這裡要直接用 ${replacement}，不用 ${match[1]}。`,
      start: match.index,
      end: match.index + match[0].length,
      replacement
    }));
  }
  return issues;
}

function articleNumberAgreementIssues(source) {
  const issues = [];
  const plural = escapedAlternation(Object.keys(ARTICLE_PLURAL_TO_SINGULAR));
  const pattern = new RegExp(`\\b(a|an)\\s+((?:[A-Za-z][A-Za-z'-]*\\s+){0,3})(${plural})\\b`, "giu");
  for (const match of source.matchAll(pattern)) {
    const modifier = match[2].trim().toLocaleLowerCase("en-GB");
    if (ARTICLE_QUANTIFIER_PHRASES.some((phrase) => modifier.endsWith(phrase))) continue;
    const originalText = match[3];
    const replacement = ARTICLE_PLURAL_TO_SINGULAR[originalText.toLocaleLowerCase("en-GB")];
    const start = match.index + match[0].length - originalText.length;
    issues.push(createRuleIssue(source, {
      ruleId: "EslArticleSingularNoun",
      title: "a / an 後用單數名詞",
      message: `${match[1]} 表示一個；後面的可數名詞要用單數。因此 ${originalText} 應改為 ${replacement}。`,
      start,
      end: start + originalText.length,
      replacement
    }));
  }
  return issues;
}

function withNegativeGerundIssues(source) {
  const issues = [];
  const pattern = /\bwith\s+(?:(?:the|a|an|their|our|your|his|her|its)\s+)?(?:[A-Za-z][A-Za-z'-]*\s+){0,2}(do|does|did)\s+not\s+([A-Za-z][A-Za-z'-]*ing)\b/giu;
  for (const match of source.matchAll(pattern)) {
    const target = `${match[1]} not`;
    const localStart = match[0].toLocaleLowerCase("en-GB").lastIndexOf(target.toLocaleLowerCase("en-GB"));
    const start = match.index + localStart;
    issues.push(createRuleIssue(source, {
      ruleId: "EslWithObjectNegativeGerund",
      title: "with + 人／物 + not + -ing",
      message: `with 後面描述伴隨情況時，可用「with + 人／物 + not + -ing」。這裡應寫 not ${match[2]}，不用 ${match[1]} not。`,
      start,
      end: start + target.length,
      replacement: "not"
    }));
  }
  return issues;
}

function existentialAgreementIssues(source) {
  const issues = [];
  const pattern = /\bthere\s+(are|were)\s+(a|an)\s+([A-Za-z][A-Za-z'-]*)\b/giu;
  for (const match of source.matchAll(pattern)) {
    const following = match[3].toLocaleLowerCase("en-GB");
    if (EXISTENTIAL_PLURAL_QUANTIFIERS.has(following)) continue;
    const originalText = match[1];
    const replacement = originalText.toLocaleLowerCase("en-GB") === "were" ? "was" : "is";
    const localStart = match[0].toLocaleLowerCase("en-GB").indexOf(originalText.toLocaleLowerCase("en-GB"));
    const start = match.index + localStart;
    issues.push(createRuleIssue(source, {
      ruleId: "EslThereBeSingularAgreement",
      title: "There is + 單數名詞",
      message: `${match[2]} 表示後面只有一個單數名詞，所以應寫 there ${replacement}，不用 there ${originalText}。`,
      start,
      end: start + originalText.length,
      replacement
    }));
  }
  return issues;
}

function abstractNounIssues(source) {
  const issues = [];
  const replacements = Object.freeze({ confidences: "confidence", trusts: "trust" });
  const pattern = /\b(loss|lack)\s+of\s+(confidences|trusts)\b/giu;
  for (const match of source.matchAll(pattern)) {
    const originalText = match[2];
    const replacement = replacements[originalText.toLocaleLowerCase("en-GB")];
    const start = match.index + match[0].length - originalText.length;
    issues.push(createRuleIssue(source, {
      ruleId: "EslAbstractNounUncountable",
      title: "抽象名詞通常不用複數",
      message: `在「${match[1]} of ...」這個意思中，${replacement} 是不可數抽象名詞，通常不加 s。`,
      start,
      end: start + originalText.length,
      replacement
    }));
  }
  return issues;
}

function complexClauseReviewIssues(source) {
  const match = source.match(/^\s*(A clear illustration,\s*)(?=if\s+you\b[^,]{1,180},\s*you\s+(?:will|would|can|may)\b)/iu);
  if (!match) return [];
  const start = match.index + match[0].indexOf(match[1]);
  return [createRuleIssue(source, {
    ruleId: "EslComplexIllustrationClauseReview",
    title: "複雜句式需老師覆核",
    category: "Needs review",
    message: "A clear illustration 不能安全地當作 For example 的普通連接語使用。這句牽涉原意，系統不會自動猜測改寫；可考慮以 For example, if ... 開始，並交由老師確認。",
    start,
    end: start + match[1].length,
    reviewRequired: true
  })];
}

/**
 * The local layer intentionally makes only high-confidence corrections. A
 * review-only issue is returned when the structure is suspicious but an
 * automatic rewrite could change the student's intended meaning.
 */
export function checkLocalLearnerEnglish(text) {
  const source = String(text || "");
  const coreIssues = checkCoreLearnerEnglish(source)
    .map((issue) => refineCoreIssue(source, issue))
    .filter(Boolean);
  return mergeGrammarIssues(
    coreIssues,
    modalParallelIssues(source),
    beHaveDoubleVerbIssues(source),
    articleNumberAgreementIssues(source),
    withNegativeGerundIssues(source),
    existentialAgreementIssues(source),
    abstractNounIssues(source),
    complexClauseReviewIssues(source)
  );
}
