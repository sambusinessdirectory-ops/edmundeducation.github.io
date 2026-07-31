export const WRITING_ESL_RULE_ENGINE = Object.freeze({
  name: "edmund-esl-basics",
  version: "1.1.0",
  locale: "zh-Hant",
  execution: "browser"
});

const COUNTABLE_PLURALS = Object.freeze({
  advantage: "advantages",
  benefit: "benefits",
  child: "children",
  client: "clients",
  company: "companies",
  customer: "customers",
  disadvantage: "disadvantages",
  drawback: "drawbacks",
  employee: "employees",
  parent: "parents",
  passenger: "passengers",
  person: "people",
  problem: "problems",
  reason: "reasons",
  school: "schools",
  shopper: "shoppers",
  shop: "shops",
  solution: "solutions",
  student: "students",
  teacher: "teachers",
  uniform: "uniforms",
  worker: "workers"
});

const PLURAL_SUBJECTS = Object.freeze([
  "advantages", "benefits", "children", "clients", "companies", "customers",
  "disadvantages", "drawbacks", "employees", "parents", "passengers", "people",
  "problems", "reasons", "schools", "shoppers", "shops", "solutions", "students",
  "teachers", "uniforms", "workers"
]);

const THIRD_PERSON_TO_BASE = Object.freeze({
  allows: "allow",
  carries: "carry",
  creates: "create",
  does: "do",
  finds: "find",
  gives: "give",
  goes: "go",
  has: "have",
  helps: "help",
  improves: "improve",
  increases: "increase",
  is: "are",
  locates: "locate",
  makes: "make",
  needs: "need",
  offers: "offer",
  provides: "provide",
  reduces: "reduce",
  relies: "rely",
  requires: "require",
  sells: "sell",
  spends: "spend",
  studies: "study",
  tries: "try",
  uses: "use",
  wants: "want",
  wears: "wear",
  works: "work"
});

const NON_BASE_TO_BASE = Object.freeze({
  asked: "ask",
  carried: "carry",
  created: "create",
  did: "do",
  followed: "follow",
  found: "find",
  gave: "give",
  gone: "go",
  had: "have",
  helped: "help",
  improved: "improve",
  increased: "increase",
  located: "locate",
  made: "make",
  needed: "need",
  offered: "offer",
  provided: "provide",
  reduced: "reduce",
  required: "require",
  saved: "save",
  saw: "see",
  seen: "see",
  sold: "sell",
  spent: "spend",
  studied: "study",
  took: "take",
  tried: "try",
  trusted: "trust",
  used: "use",
  went: "go",
  wore: "wear",
  worn: "wear",
  worked: "work",
  wrote: "write",
  written: "write",
  ...THIRD_PERSON_TO_BASE
});

const GENERIC_PEOPLE = Object.freeze([
  "child", "client", "customer", "employee", "parent", "passenger", "person",
  "shopper", "student", "teacher", "worker"
]);

const SUBJECT_FOLLOWERS = Object.freeze([
  "are", "can", "could", "do", "does", "generally", "has", "have", "is", "may",
  "might", "must", "need", "needs", "often", "should", "usually", "want", "wants",
  "will", "would"
]);

const MODALS = Object.freeze([
  "can", "could", "may", "might", "must", "shall", "should", "will", "would"
]);

const COMMON_ADVERBS = Object.freeze([
  "also", "always", "easily", "generally", "never", "normally", "often", "quickly",
  "really", "still", "usually"
]);

function escapedAlternation(values) {
  return [...values]
    .sort((left, right) => right.length - left.length)
    .map((value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"))
    .join("|");
}

function preserveCase(original, replacement) {
  if (!original) return replacement;
  if (original === original.toUpperCase()) return replacement.toUpperCase();
  if (/^[A-Z]/u.test(original)) return `${replacement[0].toUpperCase()}${replacement.slice(1)}`;
  return replacement;
}

function replaceRange(source, start, end, replacement) {
  return `${source.slice(0, start)}${replacement}${source.slice(end)}`;
}

function createIssue(source, {
  ruleId,
  title,
  message,
  start,
  end,
  replacement,
  category = "Learner English"
}) {
  const safeStart = Math.max(0, Math.min(source.length, Number(start) || 0));
  const safeEnd = Math.max(safeStart, Math.min(source.length, Number(end) || safeStart));
  const originalText = source.slice(safeStart, safeEnd);
  return Object.freeze({
    ruleId,
    title,
    category,
    message,
    originalText,
    suggestedText: replacement,
    correctedSentence: replaceRange(source, safeStart, safeEnd, replacement),
    start: safeStart,
    end: safeEnd,
    suggestions: Object.freeze([Object.freeze({
      kind: "replace",
      replacementText: replacement
    })]),
    engine: WRITING_ESL_RULE_ENGINE
  });
}

function rangesOverlap(left, right) {
  return Math.max(left.start, right.start) < Math.min(left.end, right.end);
}

function addIssue(issues, issue) {
  if (!issue || issue.end <= issue.start || issue.originalText === issue.suggestedText) return;
  const duplicate = issues.some((existing) => (
    existing.start === issue.start
    && existing.end === issue.end
    && existing.suggestedText.toLocaleLowerCase("en-GB") === issue.suggestedText.toLocaleLowerCase("en-GB")
  ));
  if (duplicate) return;

  // Structural rules are added first. Do not pile a smaller word-level hint on
  // top of the same wording when the structural correction already fixes it.
  const hiddenInsideExisting = issues.some((existing) => (
    rangesOverlap(existing, issue)
    && existing.start <= issue.start
    && existing.end >= issue.end
  ));
  if (!hiddenInsideExisting) issues.push(issue);
}

function addRequireObjectInfinitiveIssues(source, issues) {
  const pattern = /\b(require|requires|required|requiring)\s+([A-Za-z][A-Za-z'-]*)\s+(need|needs|needed)\s+to\s+([A-Za-z][A-Za-z'-]*)\b/giu;
  for (const match of source.matchAll(pattern)) {
    const verb = match[4];
    const baseVerb = NON_BASE_TO_BASE[verb.toLocaleLowerCase("en-GB")] || verb.toLocaleLowerCase("en-GB");
    const replacement = `${match[1]} ${match[2]} to ${preserveCase(verb, baseVerb)}`;
    addIssue(issues, createIssue(source, {
      ruleId: "EslRequireObjectInfinitive",
      title: "require + 人 + to + 動詞",
      message: `require 後面通常直接用「誰 + to + 動詞原形」。這裡應寫「${replacement}」，不要在 staff 後再加 need，也不要把 wear 寫成 wore。`,
      start: match.index,
      end: match.index + match[0].length,
      replacement
    }));
  }
}

function addPluralAfterQuantifierIssues(source, issues) {
  const nounAlternation = escapedAlternation(Object.keys(COUNTABLE_PLURALS));
  const pattern = new RegExp(`\\b(more and more|many|several|numerous|a number of)\\s+(${nounAlternation})\\b`, "giu");
  for (const match of source.matchAll(pattern)) {
    const noun = match[2];
    const replacement = preserveCase(noun, COUNTABLE_PLURALS[noun.toLocaleLowerCase("en-GB")]);
    const start = match.index + match[0].length - noun.length;
    addIssue(issues, createIssue(source, {
      ruleId: "EslPluralAfterQuantifier",
      title: "可數名詞要用複數",
      message: `「${match[1]}」表示多於一個；後面的可數名詞要用複數。因此 ${noun} 應改為 ${replacement}。`,
      start,
      end: start + noun.length,
      replacement
    }));
  }
}

function addPluralSubjectAgreementIssues(source, issues) {
  const subjectAlternation = escapedAlternation(PLURAL_SUBJECTS);
  const verbAlternation = escapedAlternation(Object.keys(THIRD_PERSON_TO_BASE));
  const adverbAlternation = escapedAlternation(COMMON_ADVERBS);
  const pattern = new RegExp(`\\b(${subjectAlternation})\\s+(?:(?:${adverbAlternation})\\s+)?(${verbAlternation})\\b`, "giu");
  for (const match of source.matchAll(pattern)) {
    const verb = match[2];
    const replacement = preserveCase(verb, THIRD_PERSON_TO_BASE[verb.toLocaleLowerCase("en-GB")]);
    const start = match.index + match[0].length - verb.length;
    addIssue(issues, createIssue(source, {
      ruleId: "EslPluralSubjectVerbAgreement",
      title: "複數主語與動詞",
      message: `${match[1]} 是複數主語，現在式動詞通常不加 s。因此應寫 ${match[1]} ${replacement}。`,
      start,
      end: start + verb.length,
      replacement
    }));
  }
}

function addForExampleIssues(source, issues) {
  const pattern = /\bfor example\b/giu;
  for (const match of source.matchAll(pattern)) {
    const phraseStart = match.index;
    const phraseEnd = phraseStart + match[0].length;
    let before = phraseStart - 1;
    while (before >= 0 && /\s/u.test(source[before])) before -= 1;
    let after = phraseEnd;
    while (after < source.length && /\s/u.test(source[after])) after += 1;
    const hasCommaAfter = source[after] === ",";
    const previousCharacter = before >= 0 ? source[before] : "";
    const beginsSentence = before < 0 || /[.!?;:]/u.test(previousCharacter);

    if (beginsSentence && !hasCommaAfter) {
      let end = phraseEnd;
      while (end < source.length && /\s/u.test(source[end])) end += 1;
      addIssue(issues, createIssue(source, {
        ruleId: "EslForExamplePunctuation",
        title: "For example 的標點",
        message: "For example 用來帶出例子時，後面通常要加逗號：For example, ...",
        start: phraseStart,
        end,
        replacement: `${preserveCase(match[0], "for example")}, `
      }));
      continue;
    }

    if (!beginsSentence && previousCharacter !== ",") {
      let start = phraseStart;
      while (start > 0 && /\s/u.test(source[start - 1])) start -= 1;
      let end = phraseEnd;
      while (end < source.length && /\s/u.test(source[end])) end += 1;
      if (source[end] === ",") {
        end += 1;
        while (end < source.length && /\s/u.test(source[end])) end += 1;
      }
      addIssue(issues, createIssue(source, {
        ruleId: "EslForExamplePunctuation",
        title: "For example 要正確連接",
        message: "這裡不要把 for example 直接塞在兩個意思之間。最清楚的寫法是先完結前一句，再寫「For example, ...」。",
        start,
        end,
        replacement: ". For example, "
      }));
      continue;
    }

    if (!hasCommaAfter) {
      let end = phraseEnd;
      while (end < source.length && /\s/u.test(source[end])) end += 1;
      addIssue(issues, createIssue(source, {
        ruleId: "EslForExamplePunctuation",
        title: "For example 的標點",
        message: "For example 後面要加逗號：for example, ...",
        start: phraseStart,
        end,
        replacement: `${match[0]}, `
      }));
    }
  }
}

function addGenericPeoplePluralIssues(source, issues) {
  const peopleAlternation = escapedAlternation(GENERIC_PEOPLE);
  const followerAlternation = escapedAlternation(SUBJECT_FOLLOWERS);
  const pattern = new RegExp(`\\bfor example\\s*,?\\s+(${peopleAlternation})\\s+(${followerAlternation})\\b`, "giu");
  for (const match of source.matchAll(pattern)) {
    const noun = match[1];
    const replacement = preserveCase(noun, COUNTABLE_PLURALS[noun.toLocaleLowerCase("en-GB")]);
    const nounOffset = match[0].toLocaleLowerCase("en-GB").lastIndexOf(noun.toLocaleLowerCase("en-GB"));
    const start = match.index + nounOffset;
    addIssue(issues, createIssue(source, {
      ruleId: "EslGenericPeoplePlural",
      title: "表示一般人群時用複數",
      message: `如果這裡泛指一般的${noun}，通常用複數 ${replacement}；若只指一個人，則要寫 a ${noun}。`,
      start,
      end: start + noun.length,
      replacement
    }));
  }
}

function addModalBaseVerbIssues(source, issues) {
  const modalAlternation = escapedAlternation(MODALS);
  const adverbAlternation = escapedAlternation(COMMON_ADVERBS);
  const verbAlternation = escapedAlternation(Object.keys(NON_BASE_TO_BASE));
  const pattern = new RegExp(`\\b(${modalAlternation})\\s+(?:not\\s+)?(?:(?:${adverbAlternation})\\s+)?(${verbAlternation})\\b`, "giu");
  for (const match of source.matchAll(pattern)) {
    const verb = match[2];
    const replacement = preserveCase(verb, NON_BASE_TO_BASE[verb.toLocaleLowerCase("en-GB")]);
    const start = match.index + match[0].length - verb.length;
    addIssue(issues, createIssue(source, {
      ruleId: "EslModalBaseVerb",
      title: "情態動詞後用動詞原形",
      message: `${match[1]} 後面要用最基本的動詞形式。因此 ${verb} 應改為 ${replacement}。`,
      start,
      end: start + verb.length,
      replacement
    }));
  }
}

function addInfinitiveBaseVerbIssues(source, issues) {
  const verbAlternation = escapedAlternation(Object.keys(NON_BASE_TO_BASE));
  const pattern = new RegExp(`\\bto\\s+(${verbAlternation})\\b`, "giu");
  for (const match of source.matchAll(pattern)) {
    const verb = match[1];
    const replacement = preserveCase(verb, NON_BASE_TO_BASE[verb.toLocaleLowerCase("en-GB")]);
    const start = match.index + match[0].length - verb.length;
    addIssue(issues, createIssue(source, {
      ruleId: "EslInfinitiveBaseVerb",
      title: "to 後用動詞原形",
      message: `這裡的 to 後面要用動詞原形。因此 ${verb} 應改為 ${replacement}。`,
      start,
      end: start + verb.length,
      replacement
    }));
  }
}

/**
 * A deliberately small, high-confidence learner-English layer. It complements
 * Harper locally in the browser and avoids guessing about meaning or style.
 */
export function checkLocalLearnerEnglish(text) {
  const source = String(text || "");
  if (!source.trim()) return Object.freeze([]);
  const issues = [];

  addRequireObjectInfinitiveIssues(source, issues);
  addPluralAfterQuantifierIssues(source, issues);
  addPluralSubjectAgreementIssues(source, issues);
  addForExampleIssues(source, issues);
  addGenericPeoplePluralIssues(source, issues);
  addModalBaseVerbIssues(source, issues);
  addInfinitiveBaseVerbIssues(source, issues);

  issues.sort((left, right) => (
    left.start - right.start
    || left.end - right.end
    || left.ruleId.localeCompare(right.ruleId)
  ));
  return Object.freeze(issues);
}

export function mergeGrammarIssues(...groups) {
  const merged = [];
  const seen = new Set();
  for (const group of groups) {
    for (const issue of Array.isArray(group) ? group : []) {
      const key = [
        issue.start,
        issue.end,
        String(issue.suggestedText || "").toLocaleLowerCase("en-GB")
      ].join(":" );
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(issue);
    }
  }
  merged.sort((left, right) => (
    left.start - right.start
    || left.end - right.end
    || String(left.ruleId).localeCompare(String(right.ruleId))
  ));
  return Object.freeze(merged);
}
