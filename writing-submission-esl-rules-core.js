export const WRITING_ESL_RULE_ENGINE = Object.freeze({
  name: "edmund-esl-basics",
  version: "2.0.0",
  locale: "zh-Hant",
  execution: "browser"
});

// These verbs support the small deterministic parser below. Keeping an
// explicit lexicon prevents sentence-initial nouns from being guessed to be
// verbs merely because they have a familiar-looking ending. The corpus-backed
// matcher supplies the long tail of reviewed phrases; this list covers the
// reusable agreement, auxiliary and complement structures.
const KNOWN_BASE_VERBS = new Set([
  "accept", "access", "add", "admit", "advise", "affect", "agree", "allow",
  "answer", "apologise", "apologize", "appear", "apply", "arrange", "arrive",
  "ask", "avoid", "be", "become", "begin", "believe", "belong", "bring",
  "build", "buy", "call", "carry", "cause", "change", "check", "choose",
  "clean", "collect", "compare", "complete", "consider", "contain", "continue",
  "cook", "cost", "create", "decide", "deliver", "deny", "describe", "develop",
  "discuss", "do", "drink", "drive", "eat", "encourage", "end", "enjoy",
  "enter", "expect", "explain", "fall", "feel", "find", "finish", "follow",
  "forget", "get", "give", "go", "grow", "happen", "hate", "have", "help",
  "hope", "identify", "imagine", "improve", "include", "increase", "invite",
  "join", "keep", "know", "learn", "leave", "like", "live", "locate", "look",
  "love", "make", "manage", "mean", "mind", "miss", "move", "need", "notice",
  "offer", "open", "order", "organise", "organize", "pay", "plan", "play",
  "practise", "practice", "prefer", "prepare", "prevent", "produce", "promise",
  "protect", "provide", "read", "receive", "recommend", "reduce", "refund",
  "refuse", "rely", "remain", "remember", "remind", "repair", "replace", "reply",
  "report", "require", "return", "rise", "risk", "run", "save", "say", "see",
  "sell", "seem", "send", "show", "sleep", "solve", "spend", "start", "stay",
  "stop", "study", "suggest", "support", "take", "talk", "teach", "tell", "think",
  "travel", "try", "understand", "use", "visit", "wait", "walk", "want", "watch",
  "wear", "win", "work", "write"
]);

const IRREGULAR_THIRD_PERSON = Object.freeze({
  be: "is",
  do: "does",
  go: "goes",
  have: "has"
});

const IRREGULAR_PAST_TO_BASE = Object.freeze({
  became: "become", began: "begin", been: "be", brought: "bring", built: "build",
  bought: "buy", chose: "choose", did: "do", drank: "drink", drove: "drive",
  ate: "eat", fell: "fall", felt: "feel", found: "find", forgot: "forget",
  got: "get", gave: "give", gone: "go", grew: "grow", had: "have", knew: "know",
  left: "leave", made: "make", meant: "mean", paid: "pay", read: "read",
  rose: "rise", ran: "run", said: "say", saw: "see", sent: "send", slept: "sleep",
  spent: "spend", took: "take", taught: "teach", told: "tell", thought: "think",
  understood: "understand", went: "go", won: "win", wore: "wear", written: "write",
  wrote: "write", was: "be", were: "be"
});

function thirdPersonForm(baseValue) {
  const base = String(baseValue || "").toLocaleLowerCase("en-GB");
  if (IRREGULAR_THIRD_PERSON[base]) return IRREGULAR_THIRD_PERSON[base];
  if (/[^aeiou]y$/u.test(base)) return `${base.slice(0, -1)}ies`;
  if (/(?:s|sh|ch|x|z|o)$/u.test(base)) return `${base}es`;
  return `${base}s`;
}

function regularPastForm(baseValue) {
  const base = String(baseValue || "").toLocaleLowerCase("en-GB");
  if (base.endsWith("e")) return `${base}d`;
  if (/[^aeiou]y$/u.test(base)) return `${base.slice(0, -1)}ied`;
  return `${base}ed`;
}

function gerundForm(baseValue) {
  const base = String(baseValue || "").toLocaleLowerCase("en-GB");
  if (base === "be") return "being";
  if (["die", "lie", "tie"].includes(base)) return `${base.slice(0, -2)}ying`;
  if (["begin", "get", "plan", "run", "sit", "stop", "swim", "win"].includes(base)) {
    return `${base}${base.at(-1)}ing`;
  }
  if (base.endsWith("e") && !/(?:ee|oe|ye)$/u.test(base)) return `${base.slice(0, -1)}ing`;
  return `${base}ing`;
}

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

const THIRD_PERSON_TO_BASE = Object.freeze(Object.fromEntries(
  [...KNOWN_BASE_VERBS].map((base) => [thirdPersonForm(base), base])
));

const NON_BASE_TO_BASE = Object.freeze({
  ...Object.fromEntries([...KNOWN_BASE_VERBS].map((base) => [regularPastForm(base), base])),
  ...IRREGULAR_PAST_TO_BASE,
  are: "be",
  being: "be",
  done: "do",
  seen: "see",
  worn: "wear",
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
  "also", "always", "clearly", "easily", "generally", "gradually", "never", "normally",
  "often", "quickly", "rapidly", "really", "sharply", "significantly", "slightly",
  "steadily", "still", "usually"
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
    const verbLower = verb.toLocaleLowerCase("en-GB");
    const replacement = preserveCase(
      verb,
      verbLower === "is" ? "are" : THIRD_PERSON_TO_BASE[verbLower]
    );
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
    // Sentence-initial May can be a person's name ("May helps students.").
    // Do not reinterpret that proper name as the modal may.
    if (match.index === 0 && match[1] === "May") continue;
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

const SINGULAR_PRONOUN_SUBJECTS = new Set([
  "he", "it", "she", "somebody", "someone", "something", "this", "that"
]);
const PLURAL_PRONOUN_SUBJECTS = new Set(["i", "they", "we", "you"]);
const NON_NAME_SENTENCE_INITIALS = new Set([
  "advice", "after", "all", "although", "always", "another", "before", "children", "customers",
  "data", "each", "equipment", "every", "evidence", "feedback", "first", "however",
  "information", "many", "money", "news", "nowadays", "overall", "people", "police",
  "never", "please", "research", "second", "some", "staff", "students", "teachers", "there", "therefore",
  "these", "those", "to", "uniforms", "water", "when", "while", "workers"
]);
const PRESENT_AND_PAST_HOMOGRAPHS = new Set(["cost", "cut", "hit", "hurt", "let", "put", "read", "set"]);
const PRESENT_AGREEMENT_ADVERBS = new Set(COMMON_ADVERBS);
const PAST_TIME_CUE_RE = /\b(?:ago|last\s+(?:night|week|month|year|summer)|yesterday|previously|in\s+(?:19|20)\d{2})\b/iu;
const SINGULAR_NP_DETERMINERS = new Set([
  "a", "an", "each", "every", "her", "his", "its", "my", "our", "that", "the",
  "their", "this", "your"
]);
const SENTENCE_INITIAL_DETERMINERS = new Set([
  ...SINGULAR_NP_DETERMINERS,
  "all", "another", "any", "both", "either", "enough", "few", "fewer", "little",
  "many", "more", "most", "much", "neither", "no", "several", "some", "such",
  "these", "those", "what", "whatever", "which", "whichever", "whose"
]);
const SENTENCE_INITIAL_PREPOSITIONS = new Set([
  "about", "above", "across", "after", "against", "along", "among", "around", "as", "at",
  "before", "behind", "below", "beneath", "beside", "between", "beyond", "by", "despite",
  "during", "except", "for", "from", "in", "inside", "into", "near", "of", "off", "on",
  "onto", "opposite", "outside", "over", "past", "since", "through", "throughout", "to",
  "toward", "towards", "under", "underneath", "until", "up", "upon", "via", "with",
  "within", "without"
]);
const SENTENCE_INITIAL_FUNCTION_WORDS = new Set([
  "although", "and", "because", "but", "can", "could", "if", "may", "might", "must",
  "nor", "or", "shall", "should", "so", "than", "though", "unless", "when", "whenever",
  "where", "whereas", "wherever", "whether", "while", "will", "would", "yet"
]);
const SENTENCE_INITIAL_ADJECTIVE_MODIFIERS = new Set([
  "annual", "average", "clear", "complete", "current", "daily", "different", "elderly",
  "existing", "final", "flexible", "future", "good", "hybrid", "important", "initial",
  "international", "local", "main", "major", "monthly", "national", "new", "old", "online",
  "personal", "plastic", "private", "proposed", "public", "recent", "recycled", "remote",
  "rural", "school", "serious", "similar", "small", "total", "urban", "weekly"
]);
const PLURAL_NOUN_HEADS = new Set([
  "children", "data", "feet", "men", "people", "police", "staff", "teeth", "women"
]);
const MANDATIVE_SUBJUNCTIVE_VERBS = new Set([
  "ask", "demand", "insist", "propose", "recommend", "request", "require", "suggest"
]);
const PREFERENCE_COMPLEMENT_VERBS = new Set(["hate", "like", "love", "prefer"]);
const GERUND_COMPLEMENT_VERBS = new Set([
  "admit", "avoid", "consider", "deny", "enjoy", "finish", "imagine", "keep",
  "mind", "miss", "practise", "practice", "recommend", "risk", "suggest"
]);
const INFINITIVE_COMPLEMENT_VERBS = new Set([
  "agree", "appear", "arrange", "choose", "decide", "expect", "hope", "learn",
  "manage", "need", "offer", "plan", "prepare", "promise", "refuse", "seem",
  "try", "want"
]);
const AMBIGUOUS_NOUN_OR_VERB_COMPLEMENTS = new Set([
  "access", "answer", "change", "drink", "help", "order", "play", "practice",
  "repair", "report", "research", "run", "sleep", "study", "support", "use",
  "visit", "walk", "work"
]);
const AMBIGUOUS_COMPLEMENT_OBJECT_HINTS = Object.freeze({
  play: new Set(["badminton", "basketball", "football", "games", "hockey", "music", "sports", "tennis"]),
  study: new Set(["biology", "chemistry", "english", "history", "law", "mathematics", "medicine", "physics", "science"])
});

function learnerWordTokens(source) {
  return [...source.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/gu)].map((match) => Object.freeze({
    text: match[0],
    lower: match[0].toLocaleLowerCase("en-GB"),
    start: match.index,
    end: match.index + match[0].length
  }));
}

function isSentenceInitialToken(source, token) {
  return /(?:^|[.!?;]\s*)$/u.test(source.slice(0, token.start));
}

function nextVerbToken(tokens, subjectIndex) {
  let index = subjectIndex + 1;
  if (PRESENT_AGREEMENT_ADVERBS.has(tokens[index]?.lower)) index += 1;
  return { token: tokens[index] || null, index };
}

function looksLikePastPredicate(token) {
  const lower = token?.lower || "";
  if (!lower) return false;
  if (IRREGULAR_PAST_TO_BASE[lower]) return true;
  const knownBase = NON_BASE_TO_BASE[lower];
  if (knownBase && regularPastForm(knownBase) === lower) return true;
  // The intentionally small verb lexicon cannot enumerate every regular
  // predicate (for example, displayed). A bounded suffix fallback is safe
  // here because it only suppresses a speculative proper-name correction.
  return lower.length >= 5 && /(?:ied|[^e]ed)$/u.test(lower);
}

function sentenceInitialHasFunctionRole(value) {
  return (
    NON_NAME_SENTENCE_INITIALS.has(value)
    || SENTENCE_INITIAL_DETERMINERS.has(value)
    || SENTENCE_INITIAL_PREPOSITIONS.has(value)
    || SENTENCE_INITIAL_FUNCTION_WORDS.has(value)
  );
}

function looksLikeFinitePredicate(token) {
  const lower = token?.lower || "";
  return (
    looksLikePastPredicate(token)
    || Boolean(THIRD_PERSON_TO_BASE[lower])
    || KNOWN_BASE_VERBS.has(lower)
    || MODALS.includes(lower)
    || ["am", "are"].includes(lower)
  );
}

function modifierNounPrecedesFinitePredicate(tokens, subjectIndex, candidateIndex) {
  if (!SENTENCE_INITIAL_ADJECTIVE_MODIFIERS.has(tokens[subjectIndex]?.lower)) return false;
  if (!AMBIGUOUS_NOUN_OR_VERB_COMPLEMENTS.has(tokens[candidateIndex]?.lower)) return false;
  let predicateIndex = candidateIndex + 1;
  while (PRESENT_AGREEMENT_ADVERBS.has(tokens[predicateIndex]?.lower)) predicateIndex += 1;
  return looksLikeFinitePredicate(tokens[predicateIndex]);
}

function isPluralNounHead(value) {
  const word = String(value || "").toLocaleLowerCase("en-GB");
  if (PLURAL_NOUN_HEADS.has(word)) return true;
  if (["news", "physics", "mathematics", "economics"].includes(word)) return false;
  return word.length > 3 && /s$/u.test(word) && !/(?:ss|us|is)$/u.test(word);
}

function isMandativeSubjunctive(tokens, subjectIndex) {
  if (tokens[subjectIndex - 1]?.lower !== "that") return false;
  const governing = complementVerbLemma(tokens[subjectIndex - 2]?.lower || "");
  return MANDATIVE_SUBJUNCTIVE_VERBS.has(governing);
}

function addSimpleNounPhraseAgreementIssues(source, issues, tokens, hasPastTimeCue) {
  if (hasPastTimeCue || tokens.length < 3) return;
  const startsWithDeterminer = SINGULAR_NP_DETERMINERS.has(tokens[0].lower);
  const startsWithAdjectiveLikeModifier = SENTENCE_INITIAL_ADJECTIVE_MODIFIERS.has(tokens[0].lower);
  if (!startsWithDeterminer && !startsWithAdjectiveLikeModifier) return;

  // Parse one compact noun phrase only. Never scan across an auxiliary,
  // infinitive, prepositional phrase or earlier finite verb looking for a
  // later word that happens to be in the verb lexicon.
  const hasDeterminerAdjective = (
    startsWithDeterminer
    && SENTENCE_INITIAL_ADJECTIVE_MODIFIERS.has(tokens[1]?.lower)
  );
  const headIndex = hasDeterminerAdjective ? 2 : 1;
  const verbIndex = headIndex + 1;
  const head = tokens[headIndex];
  const verb = tokens[verbIndex];
  if (!head || !verb || ["and", "or"].includes(head.lower)) return;
  const subjectText = source.slice(tokens[0].start, head.end);
  const pluralSubject = isPluralNounHead(head.lower);

  if (pluralSubject) {
    const base = THIRD_PERSON_TO_BASE[verb.lower];
    if (!base) return;
    addPresentAgreementIssue(
      source,
      issues,
      subjectText,
      verb,
      preserveCase(verb.text, verb.lower === "is" ? "are" : base)
    );
    return;
  }

  if (
    KNOWN_BASE_VERBS.has(verb.lower)
    && !PRESENT_AND_PAST_HOMOGRAPHS.has(verb.lower)
  ) {
    addPresentAgreementIssue(
      source,
      issues,
      subjectText,
      verb,
      preserveCase(verb.text, thirdPersonForm(verb.lower))
    );
  }
}

function addPresentAgreementIssue(source, issues, subject, verb, replacement, {
  properName = false,
  coordinated = false
} = {}) {
  const ruleId = coordinated
    ? "EslCoordinatedSubjectVerbAgreement"
    : properName
      ? "EslSingularNamePresentAgreement"
      : "EslPresentSubjectVerbAgreement";
  const title = coordinated
    ? "並列主語與動詞一致"
    : properName
      ? "單數人名與動詞一致"
      : "主語與動詞一致";
  addIssue(issues, createIssue(source, {
    ruleId,
    title,
    message: `${subject} 與一般現在式動詞要保持單複數一致。因此 ${verb.text} 應改為 ${replacement}。`,
    start: verb.start,
    end: verb.end,
    replacement
  }));
}

function addGeneralPresentAgreementIssues(source, issues) {
  const tokens = learnerWordTokens(source);
  const hasPastTimeCue = PAST_TIME_CUE_RE.test(source);

  addSimpleNounPhraseAgreementIssues(source, issues, tokens, hasPastTimeCue);

  for (let index = 0; index < tokens.length; index += 1) {
    const subject = tokens[index];
    const lowerSubject = subject.lower;

    // Two singular names joined by and form a plural subject.
    if (
      /^[A-Z][A-Za-z'’\-]*$/u.test(subject.text)
      && tokens[index + 1]?.lower === "and"
      && /^[A-Z][A-Za-z'’\-]*$/u.test(tokens[index + 2]?.text || "")
    ) {
      const { token: verb } = nextVerbToken(tokens, index + 2);
      const base = THIRD_PERSON_TO_BASE[verb?.lower];
      if (verb && base) {
        const replacement = preserveCase(verb.text, verb.lower === "is" ? "are" : base);
        addPresentAgreementIssue(
          source,
          issues,
          `${subject.text} and ${tokens[index + 2].text}`,
          verb,
          replacement,
          { coordinated: true }
        );
      }
      index += 2;
      continue;
    }

    const { token: verb, index: verbIndex } = nextVerbToken(tokens, index);
    if (!verb) continue;

    if (PLURAL_PRONOUN_SUBJECTS.has(lowerSubject)) {
      const base = THIRD_PERSON_TO_BASE[verb.lower];
      if (!base) continue;
      const replacement = preserveCase(verb.text, verb.lower === "is" ? "are" : base);
      addPresentAgreementIssue(source, issues, subject.text, verb, replacement);
      continue;
    }

    if (SINGULAR_PRONOUN_SUBJECTS.has(lowerSubject)) {
      if (
        !KNOWN_BASE_VERBS.has(verb.lower)
        || PRESENT_AND_PAST_HOMOGRAPHS.has(verb.lower)
        || hasPastTimeCue
        || isMandativeSubjunctive(tokens, index)
      ) continue;
      addPresentAgreementIssue(
        source,
        issues,
        subject.text,
        verb,
        preserveCase(verb.text, thirdPersonForm(verb.lower))
      );
      continue;
    }

    const looksLikeSingularName = (
      /^[A-Z][A-Za-z'’\-]*$/u.test(subject.text)
      && isSentenceInitialToken(source, subject)
      && !sentenceInitialHasFunctionRole(lowerSubject)
      && !lowerSubject.endsWith("s")
      && tokens[index - 1]?.lower !== "and"
      && !modifierNounPrecedesFinitePredicate(tokens, index, verbIndex)
    );
    if (
      looksLikeSingularName
      && KNOWN_BASE_VERBS.has(verb.lower)
      && !PRESENT_AND_PAST_HOMOGRAPHS.has(verb.lower)
      && !hasPastTimeCue
    ) {
      addPresentAgreementIssue(
        source,
        issues,
        subject.text,
        verb,
        preserveCase(verb.text, thirdPersonForm(verb.lower)),
        { properName: true }
      );
    }
  }
}

function complementVerbLemma(surface) {
  if (KNOWN_BASE_VERBS.has(surface)) return surface;
  return THIRD_PERSON_TO_BASE[surface] || NON_BASE_TO_BASE[surface] || "";
}

function addGeneralVerbComplementIssues(source, issues) {
  const tokens = learnerWordTokens(source);
  for (let index = 0; index + 1 < tokens.length; index += 1) {
    const governing = tokens[index];
    const complement = tokens[index + 1];
    const governingLemma = complementVerbLemma(governing.lower);
    if (!governingLemma || !KNOWN_BASE_VERBS.has(complement.lower)) continue;
    if (AMBIGUOUS_NOUN_OR_VERB_COMPLEMENTS.has(complement.lower)) {
      const objectHints = AMBIGUOUS_COMPLEMENT_OBJECT_HINTS[complement.lower];
      if (!objectHints?.has(tokens[index + 2]?.lower || "")) continue;
    }

    let replacement = "";
    let title = "動詞後的補語形式";
    let message = "";
    if (PREFERENCE_COMPLEMENT_VERBS.has(governingLemma)) {
      replacement = `to ${complement.lower}`;
      title = `${governingLemma} 後用 to + 動詞或 -ing`;
      message = `${governing.text} 後面不能直接接另一個動詞原形。可用 to + 動詞或 -ing；這裡建議改為 ${replacement}。`;
    } else if (GERUND_COMPLEMENT_VERBS.has(governingLemma)) {
      replacement = gerundForm(complement.lower);
      title = `${governingLemma} 後用 -ing`;
      message = `${governing.text} 後面的動作通常要用 -ing 形式，因此 ${complement.text} 應改為 ${replacement}。`;
    } else if (INFINITIVE_COMPLEMENT_VERBS.has(governingLemma)) {
      replacement = `to ${complement.lower}`;
      title = `${governingLemma} 後用 to + 動詞`;
      message = `${governing.text} 後面的動作通常要用 to + 動詞原形，因此 ${complement.text} 應改為 ${replacement}。`;
    }
    if (!replacement) continue;

    addIssue(issues, createIssue(source, {
      ruleId: PREFERENCE_COMPLEMENT_VERBS.has(governingLemma)
        ? "EslPreferenceInfinitiveOrGerund"
        : GERUND_COMPLEMENT_VERBS.has(governingLemma)
          ? "EslGerundVerbComplement"
          : "EslInfinitiveVerbComplement",
      title,
      message,
      start: complement.start,
      end: complement.end,
      replacement: preserveCase(complement.text, replacement)
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
  addGeneralPresentAgreementIssues(source, issues);
  addGeneralVerbComplementIssues(source, issues);

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
