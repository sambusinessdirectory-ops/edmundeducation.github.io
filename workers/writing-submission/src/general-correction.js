// Sentence-agnostic correction materializer.
//
// The language model proposes one complete corrected sentence. This module does
// not decide whether an English construction is grammatical and contains no
// learner-sentence catalogue. Its responsibilities are deliberately narrower:
// protect the student's meaning-bearing data, derive exact local replacements,
// and turn those replacements into the issue shape consumed by the portal.

export const GENERAL_CORRECTION_MAX_SOURCE_CHARACTERS = 2000;
export const GENERAL_CORRECTION_MAX_TARGET_CHARACTERS = 4000;
export const GENERAL_CORRECTION_MAX_ISSUES = 8;

const CONTROL_RE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u;
const BIDI_CONTROL_RE = /[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/u;
const HTML_RE = /<\/?[a-z][^>]*>|<!--|-->/iu;
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>()]+/giu;
const NUMBER_RE = /\p{N}+(?:[.,:/-]\p{N}+)*/gu;
const TOKEN_RE = /[\p{L}\p{M}\p{N}]+(?:['’\-][\p{L}\p{M}\p{N}]+)*|[ \t\n]+|./gu;
const WORD_RE = /^[\p{L}\p{M}]/u;

const GRAMMAR_FUNCTION_WORDS = new Set([
  "a", "an", "the", "this", "that", "these", "those", "some", "any",
  "i", "me", "my", "mine", "you", "your", "yours", "he", "him", "his",
  "she", "her", "hers", "it", "its", "we", "us", "our", "ours", "they",
  "them", "their", "theirs",
  "am", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did",
  "can", "could", "may", "might", "must", "shall", "should", "will", "would",
  "and", "but", "or", "nor", "so", "yet", "because", "if", "when", "while",
  "although", "though", "than", "as",
  "at", "by", "for", "from", "in", "into", "of", "on", "onto", "to", "with",
  "about", "through", "during", "before", "after", "above", "below",
  "not", "no", "never"
]);

// This is linguistic morphology, not a catalogue of learner sentences.  A
// finite irregular-verb lexicon lets the integrity validator recognise that
// buy/bought or write/wrote are the same lexeme without allowing an unrelated
// content-word substitution such as kind/king or movies/films.
const IRREGULAR_LEXEME_GROUPS = Object.freeze([
  ["arise", "arises", "arose", "arisen", "arising"],
  ["awake", "awakes", "awoke", "awoken", "awaking"],
  ["be", "am", "is", "are", "was", "were", "been", "being"],
  ["bear", "bears", "bore", "borne", "born", "bearing"],
  ["beat", "beats", "beaten", "beating"],
  ["become", "becomes", "became", "becoming"],
  ["begin", "begins", "began", "begun", "beginning"],
  ["bend", "bends", "bent", "bending"],
  ["bet", "bets", "betting"],
  ["bind", "binds", "bound", "binding"],
  ["bite", "bites", "bit", "bitten", "biting"],
  ["bleed", "bleeds", "bled", "bleeding"],
  ["blow", "blows", "blew", "blown", "blowing"],
  ["break", "breaks", "broke", "broken", "breaking"],
  ["breed", "breeds", "bred", "breeding"],
  ["bring", "brings", "brought", "bringing"],
  ["build", "builds", "built", "building"],
  ["burn", "burns", "burned", "burnt", "burning"],
  ["burst", "bursts", "bursting"],
  ["buy", "buys", "bought", "buying"],
  ["catch", "catches", "caught", "catching"],
  ["choose", "chooses", "chose", "chosen", "choosing"],
  ["come", "comes", "came", "coming"],
  ["cost", "costs", "costing"],
  ["cut", "cuts", "cutting"],
  ["deal", "deals", "dealt", "dealing"],
  ["dig", "digs", "dug", "digging"],
  ["do", "does", "did", "done", "doing"],
  ["draw", "draws", "drew", "drawn", "drawing"],
  ["dream", "dreams", "dreamed", "dreamt", "dreaming"],
  ["drink", "drinks", "drank", "drunk", "drinking"],
  ["drive", "drives", "drove", "driven", "driving"],
  ["eat", "eats", "ate", "eaten", "eating"],
  ["fall", "falls", "fell", "fallen", "falling"],
  ["feed", "feeds", "fed", "feeding"],
  ["feel", "feels", "felt", "feeling"],
  ["fight", "fights", "fought", "fighting"],
  ["find", "finds", "found", "finding"],
  ["fly", "flies", "flew", "flown", "flying"],
  ["forget", "forgets", "forgot", "forgotten", "forgetting"],
  ["forgive", "forgives", "forgave", "forgiven", "forgiving"],
  ["freeze", "freezes", "froze", "frozen", "freezing"],
  ["get", "gets", "got", "gotten", "getting"],
  ["give", "gives", "gave", "given", "giving"],
  ["go", "goes", "went", "gone", "going"],
  ["grow", "grows", "grew", "grown", "growing"],
  ["hang", "hangs", "hung", "hanged", "hanging"],
  ["have", "has", "had", "having"],
  ["hear", "hears", "heard", "hearing"],
  ["hide", "hides", "hid", "hidden", "hiding"],
  ["hit", "hits", "hitting"],
  ["hold", "holds", "held", "holding"],
  ["hurt", "hurts", "hurting"],
  ["keep", "keeps", "kept", "keeping"],
  ["know", "knows", "knew", "known", "knowing"],
  ["lay", "lays", "laid", "laying"],
  ["lead", "leads", "led", "leading"],
  ["leave", "leaves", "left", "leaving"],
  ["lend", "lends", "lent", "lending"],
  ["let", "lets", "letting"],
  ["lie", "lies", "lay", "lain", "lying"],
  ["lose", "loses", "lost", "losing"],
  ["make", "makes", "made", "making"],
  ["mean", "means", "meant", "meaning"],
  ["meet", "meets", "met", "meeting"],
  ["pay", "pays", "paid", "paying"],
  ["put", "puts", "putting"],
  ["read", "reads", "reading"],
  ["ride", "rides", "rode", "ridden", "riding"],
  ["ring", "rings", "rang", "rung", "ringing"],
  ["rise", "rises", "rose", "risen", "rising"],
  ["run", "runs", "ran", "running"],
  ["say", "says", "said", "saying"],
  ["see", "sees", "saw", "seen", "seeing"],
  ["sell", "sells", "sold", "selling"],
  ["send", "sends", "sent", "sending"],
  ["set", "sets", "setting"],
  ["shake", "shakes", "shook", "shaken", "shaking"],
  ["shine", "shines", "shone", "shined", "shining"],
  ["shoot", "shoots", "shot", "shooting"],
  ["show", "shows", "showed", "shown", "showing"],
  ["shut", "shuts", "shutting"],
  ["sing", "sings", "sang", "sung", "singing"],
  ["sink", "sinks", "sank", "sunk", "sinking"],
  ["sit", "sits", "sat", "sitting"],
  ["sleep", "sleeps", "slept", "sleeping"],
  ["speak", "speaks", "spoke", "spoken", "speaking"],
  ["spend", "spends", "spent", "spending"],
  ["stand", "stands", "stood", "standing"],
  ["steal", "steals", "stole", "stolen", "stealing"],
  ["stick", "sticks", "stuck", "sticking"],
  ["swim", "swims", "swam", "swum", "swimming"],
  ["take", "takes", "took", "taken", "taking"],
  ["teach", "teaches", "taught", "teaching"],
  ["tear", "tears", "tore", "torn", "tearing"],
  ["tell", "tells", "told", "telling"],
  ["think", "thinks", "thought", "thinking"],
  ["throw", "throws", "threw", "thrown", "throwing"],
  ["understand", "understands", "understood", "understanding"],
  ["wake", "wakes", "woke", "woken", "waking"],
  ["wear", "wears", "wore", "worn", "wearing"],
  ["win", "wins", "won", "winning"],
  ["write", "writes", "wrote", "written", "writing"],
  ["good", "better", "best"],
  ["bad", "worse", "worst"],
  ["far", "farther", "further", "farthest", "furthest"]
]);

const IRREGULAR_LEXEME_ROOTS = new Map(
  IRREGULAR_LEXEME_GROUPS.flatMap((group) => group.map((form) => [form, group[0]]))
);

export const GENERAL_CORRECTION_CATEGORIES = Object.freeze({
  subject_verb_agreement: "主語與動詞一致",
  article_or_determiner: "冠詞與限定詞",
  singular_plural: "名詞單複數",
  countability: "可數與不可數名詞",
  verb_form_or_tense: "動詞形式與時態",
  modal_or_auxiliary: "助動詞與情態動詞",
  infinitive_or_gerund: "不定詞與動名詞",
  preposition: "介詞用法",
  pronoun: "代名詞用法",
  sentence_structure: "句子結構",
  conjunction: "連接詞用法",
  parallelism: "平行結構",
  comparison: "比較結構",
  possessive: "所有格",
  punctuation: "標點符號",
  spelling_or_spacing: "拼字與空格",
  word_form: "詞性與字形",
  word_choice: "字詞用法",
  other_grammar: "其他文法問題"
});

const CATEGORY_IDS = new Set(Object.keys(GENERAL_CORRECTION_CATEGORIES));

const QUOTE_PAIRS = Object.freeze({
  '"': Object.freeze(['"']),
  "'": Object.freeze(["'"]),
  "`": Object.freeze(["`"]),
  "“": Object.freeze(["”"]),
  "‘": Object.freeze(["’"]),
  "«": Object.freeze(["»"]),
  "„": Object.freeze(["“", "”"])
});

function freezeArray(values) {
  return Object.freeze(values.map((value) => Object.freeze(value)));
}

function isBoundaryCharacter(value) {
  return !value || /[\p{Z}\p{P}\p{S}]/u.test(value);
}

function tokens(value) {
  return [...value.matchAll(TOKEN_RE)].map((match) => ({
    value: match[0],
    start: match.index,
    end: match.index + match[0].length
  }));
}

function wordEntries(value) {
  return tokens(value)
    .filter((token) => WORD_RE.test(token.value))
    .map((token, index) => ({
      ...token,
      wordIndex: index,
      word: token.value.toLocaleLowerCase("en-GB")
    }));
}

function quotedSegments(value) {
  const segments = [];
  for (let index = 0; index < value.length; index += 1) {
    const opener = value[index];
    const closers = QUOTE_PAIRS[opener];
    if (!closers) continue;
    if (
      (opener === "'" || opener === "`" || opener === "‘")
      && !isBoundaryCharacter(value[index - 1])
    ) continue;
    let end = index + 1;
    const limit = value.length;
    while (end < limit) {
      if (
        closers.includes(value[end])
        && (
          (opener !== "'" && opener !== "`" && opener !== "‘")
          || isBoundaryCharacter(value[end + 1])
        )
      ) break;
      end += 1;
    }
    if (end >= limit || end === index + 1) continue;
    const wordsBefore = wordEntries(value.slice(0, index)).length;
    const before = wordEntries(value.slice(0, index)).at(-1)?.word || "";
    const after = wordEntries(value.slice(end + 1))[0]?.word || "";
    segments.push({
      exact: value.slice(index, end + 1),
      wordsBefore,
      before,
      after
    });
    index = end;
  }
  return segments;
}

function exactList(pattern, value) {
  return [...value.matchAll(pattern)].map((match) => match[0]);
}

function normalizedOperatorSignature(value) {
  const operators = [];
  for (const entry of wordEntries(value)) {
    const word = entry.word.replace(/’/gu, "'");
    if (word === "won't") {
      operators.push("will:not");
      continue;
    }
    if (word === "shan't") {
      operators.push("shall:not");
      continue;
    }
    const contraction = word.match(/^(ca|can|could|do|does|did|is|are|was|were|has|have|had|must|should|would|will|might|need)n't$/u);
    if (contraction) {
      const root = contraction[1] === "ca" ? "can" : contraction[1];
      const family = ["do", "does", "did"].includes(root)
        ? "do"
        : ["is", "are", "was", "were"].includes(root)
          ? "be"
          : ["has", "have", "had"].includes(root)
            ? "have"
            : root;
      operators.push(`${family}:not`);
      continue;
    }
    if (word === "cannot") {
      operators.push("can:not");
      continue;
    }
    if (["not", "no", "never", "without", "hardly", "rarely", "seldom"].includes(word)) {
      operators.push(`polarity:${word}`);
      continue;
    }
    // Modal removal can itself be a grammar correction (notably in a future
    // condition clause), so modals are checked separately below.  A target may
    // remove a source modal, but may not invent or substitute one.
    const pronounFamily = {
      i: "first-singular", me: "first-singular", my: "first-singular", mine: "first-singular",
      we: "first-plural", us: "first-plural", our: "first-plural", ours: "first-plural",
      you: "second", your: "second", yours: "second",
      he: "third-masculine", him: "third-masculine", his: "third-masculine",
      she: "third-feminine", her: "third-feminine", hers: "third-feminine",
      it: "third-neutral", its: "third-neutral",
      they: "third-plural", them: "third-plural", their: "third-plural", theirs: "third-plural"
    }[word];
    if (pronounFamily) {
      operators.push(`pronoun:${pronounFamily}`);
      continue;
    }
    if (["before", "after", "above", "below", "from", "without", "because", "although", "if", "when"].includes(word)) {
      operators.push(`relation:${word}`);
      continue;
    }
    if ([
      "all", "none", "some", "any", "each", "every", "either", "neither",
      "both", "many", "much", "few", "little", "more", "less", "most", "least",
      "only", "always", "often", "usually", "sometimes"
    ].includes(word)) operators.push(`quantity:${word}`);
  }
  return operators;
}

function protectedNames(value) {
  const entries = wordEntries(value);
  return entries.flatMap((entry, index) => {
    const surface = entry.value;
    const acronym = /^\p{Lu}[\p{Lu}\p{N}]{1,}$/u.test(surface);
    const interiorCapital = index > 0 && /^\p{Lu}/u.test(surface);
    return acronym || interiorCapital ? [surface] : [];
  });
}

function orderedContains(sourceItems, targetItems) {
  let cursor = 0;
  for (const sourceItem of sourceItems) {
    while (cursor < targetItems.length && targetItems[cursor] !== sourceItem) cursor += 1;
    if (cursor >= targetItems.length) return false;
    cursor += 1;
  }
  return true;
}

function genericStems(word) {
  const normalized = word.toLocaleLowerCase("en-GB").replace(/’/gu, "'");
  const stems = new Set([normalized]);
  const add = (candidate) => {
    if (candidate.length >= 2) stems.add(candidate);
  };
  if (normalized.endsWith("ies") && normalized.length > 4) add(`${normalized.slice(0, -3)}y`);
  if (normalized.endsWith("ves") && normalized.length > 4) {
    add(`${normalized.slice(0, -3)}f`);
    add(`${normalized.slice(0, -3)}fe`);
  }
  if (normalized.endsWith("ing") && normalized.length > 5) {
    const base = normalized.slice(0, -3);
    add(base);
    add(`${base}e`);
    if (base.length >= 3 && base.at(-1) === base.at(-2)) add(base.slice(0, -1));
  }
  if (normalized.endsWith("ied") && normalized.length > 4) add(`${normalized.slice(0, -3)}y`);
  if (normalized.endsWith("ed") && normalized.length > 4) {
    const base = normalized.slice(0, -2);
    add(base);
    add(`${base}e`);
    if (base.length >= 3 && base.at(-1) === base.at(-2)) add(base.slice(0, -1));
  }
  if (/(?:sses|shes|ches|xes|zes|oes)$/u.test(normalized) && normalized.length > 3) {
    add(normalized.slice(0, -2));
  } else if (normalized.endsWith("s") && !normalized.endsWith("ss") && normalized.length > 3) {
    add(normalized.slice(0, -1));
  }
  if (normalized.endsWith("ly") && normalized.length > 4) {
    const base = normalized.slice(0, -2);
    add(base);
    if (base.endsWith("i")) add(`${base.slice(0, -1)}y`);
  }
  return stems;
}

function probablySameLexeme(left, right) {
  const normalizedLeft = left.toLocaleLowerCase("en-GB").replace(/’/gu, "'");
  const normalizedRight = right.toLocaleLowerCase("en-GB").replace(/’/gu, "'");
  const irregularLeft = IRREGULAR_LEXEME_ROOTS.get(normalizedLeft);
  const irregularRight = IRREGULAR_LEXEME_ROOTS.get(normalizedRight);
  if (irregularLeft && irregularLeft === irregularRight) return true;
  if (GRAMMAR_FUNCTION_WORDS.has(normalizedLeft) && GRAMMAR_FUNCTION_WORDS.has(normalizedRight)) {
    const groups = [
      ["a", "an", "the", "this", "that", "these", "those", "some", "any"],
      ["i", "me", "my", "mine"], ["we", "us", "our", "ours"],
      ["you", "your", "yours"], ["he", "him", "his"],
      ["she", "her", "hers"], ["it", "its"], ["they", "them", "their", "theirs"],
      ["am", "is", "are"], ["was", "were"], ["be", "been", "being"],
      ["have", "has"], ["had"], ["do", "does"], ["did"],
      ["and", "but", "or", "nor", "so", "yet", "because", "if", "when", "while", "although", "though", "than", "as"],
      ["at", "by", "for", "from", "in", "into", "of", "on", "onto", "to", "with", "about", "through", "during", "before", "after", "above", "below"]
    ];
    if (groups.some((group) => group.includes(normalizedLeft) && group.includes(normalizedRight))) {
      return true;
    }
  }
  const leftStems = genericStems(left);
  const rightStems = genericStems(right);
  return [...leftStems].some((stem) => rightStems.has(stem));
}

function orderedRelatedWordCount(sourceWords, targetWords) {
  const rows = sourceWords.length + 1;
  const columns = targetWords.length + 1;
  if (rows * columns > 1_000_000) return 0;
  const lcs = Array.from({ length: rows }, () => new Uint16Array(columns));
  for (let sourceIndex = sourceWords.length - 1; sourceIndex >= 0; sourceIndex -= 1) {
    for (let targetIndex = targetWords.length - 1; targetIndex >= 0; targetIndex -= 1) {
      lcs[sourceIndex][targetIndex] = probablySameLexeme(
        sourceWords[sourceIndex],
        targetWords[targetIndex]
      )
        ? lcs[sourceIndex + 1][targetIndex + 1] + 1
        : Math.max(lcs[sourceIndex + 1][targetIndex], lcs[sourceIndex][targetIndex + 1]);
    }
  }
  return lcs[0][0];
}

function sentenceBoundaryCount(value) {
  return (value.match(/[.!?;](?=\s|$)/gu) || []).length;
}

function sameQuotedMaterial(source, target) {
  const sourceQuotes = quotedSegments(source);
  const targetQuotes = quotedSegments(target);
  if (sourceQuotes.length !== targetQuotes.length) return false;
  return sourceQuotes.every((segment, index) => {
    const candidate = targetQuotes[index];
    return segment.exact === candidate.exact
      && probablySameLexeme(segment.before || "_", candidate.before || "_")
      && probablySameLexeme(segment.after || "_", candidate.after || "_")
      && Math.abs(segment.wordsBefore - candidate.wordsBefore) <= 1;
  });
}

/**
 * Validate model output using only content-integrity and bounded-change rules.
 * This intentionally makes no claim that the target is grammatically correct.
 */
export function validateGeneralCorrection(source, target, {
  allowMeaningSensitiveChanges = false
} = {}) {
  if (
    typeof source !== "string"
    || typeof target !== "string"
    || !source.trim()
    || !target.trim()
    || source !== source.trim()
    || target !== target.trim()
    || source.length > GENERAL_CORRECTION_MAX_SOURCE_CHARACTERS
    || target.length > GENERAL_CORRECTION_MAX_TARGET_CHARACTERS
    || target.length > source.length * 1.75 + 32
    || target.length < Math.max(2, source.length * 0.35 - 12)
    || CONTROL_RE.test(target)
    || BIDI_CONTROL_RE.test(target)
    || HTML_RE.test(target)
    || !/[.!?;]$/u.test(target)
  ) return false;

  const sourceUrls = exactList(URL_RE, source);
  const targetUrls = exactList(URL_RE, target);
  if (JSON.stringify(sourceUrls) !== JSON.stringify(targetUrls)) return false;
  if (JSON.stringify(exactList(NUMBER_RE, source)) !== JSON.stringify(exactList(NUMBER_RE, target))) {
    return false;
  }
  if (!sameQuotedMaterial(source, target)) return false;
  if (!allowMeaningSensitiveChanges) {
    if (
      JSON.stringify(normalizedOperatorSignature(source))
      !== JSON.stringify(normalizedOperatorSignature(target))
    ) return false;
    const modalWords = (value) => wordEntries(value)
      .map((entry) => entry.word)
      .filter((word) => ["can", "could", "may", "might", "must", "shall", "should", "will", "would"].includes(word));
    const sourceModals = modalWords(source);
    const targetModals = modalWords(target);
    if (!orderedContains(targetModals, sourceModals)) return false;
  }
  const sourceNames = protectedNames(source);
  const targetNames = protectedNames(target);
  // Preserve every name/acronym supplied by the student, including a name in
  // an interior position. Extra capitalisation in the target is allowed so a
  // model can still repair a lowercase sentence opening (for example, it -> It).
  if (!orderedContains(sourceNames, targetNames)) {
    return false;
  }
  // Initial capitals alone cannot distinguish a proper name from an ordinary
  // sentence-opening noun. Preserve the first lexical item by generic lexeme
  // relation: Tom -> Gary fails, while student -> Students remains possible.
  const firstSourceEntry = wordEntries(source)[0];
  const firstTargetEntry = wordEntries(target)[0];
  const firstSourceWord = firstSourceEntry?.word || "";
  const firstTargetWord = firstTargetEntry?.word || "";
  if (
    /^\p{Lu}/u.test(firstSourceEntry?.value || "")
    && firstSourceWord !== firstTargetWord
  ) return false;
  if (
    firstSourceWord
    && firstTargetWord
    && !probablySameLexeme(firstSourceWord, firstTargetWord)
  ) return false;
  if (sentenceBoundaryCount(target) > sentenceBoundaryCount(source) + 1) return false;

  const sourceWords = wordEntries(source).map((entry) => entry.word);
  const targetWords = wordEntries(target).map((entry) => entry.word);
  if (sourceWords.length && targetWords.length) {
    const preserved = orderedRelatedWordCount(sourceWords, targetWords);
    // Multi-error learner sentences can legitimately inflect or replace several
    // neighbouring words. Sixty percent ordered lexical continuity, combined
    // with the stricter entity/operator/quote/number guards above, blocks an
    // unrelated rewrite without rejecting the very corrections this service is
    // designed to provide.
    const required = Math.max(1, Math.ceil(Math.min(sourceWords.length, targetWords.length) * 0.6));
    if (preserved < required) return false;
  }

  // A grammar checker may inflect an existing content word, but it must not
  // silently invent a different one.  Require every target content word to be
  // traceable, in order and one-to-one, to the same lexeme in the student's
  // text.  Function words may still be inserted/changed and redundant source
  // words may be removed, which covers ordinary ESL grammar repairs.
  const sourceContentWords = sourceWords.filter((word) => !GRAMMAR_FUNCTION_WORDS.has(word));
  const targetContentWords = targetWords.filter((word) => !GRAMMAR_FUNCTION_WORDS.has(word));
  if (
    !allowMeaningSensitiveChanges
    && (
      targetContentWords.length !== sourceContentWords.length
      || orderedRelatedWordCount(sourceContentWords, targetContentWords) !== targetContentWords.length
    )
  ) return false;
  return true;
}

function mergeOverlappingHunks(hunks) {
  const merged = [];
  for (const hunk of hunks) {
    const previous = merged.at(-1);
    if (
      previous
      && (hunk.sourceStart < previous.sourceEnd || hunk.targetStart < previous.targetEnd)
    ) {
      previous.sourceEnd = Math.max(previous.sourceEnd, hunk.sourceEnd);
      previous.targetEnd = Math.max(previous.targetEnd, hunk.targetEnd);
    } else {
      merged.push({ ...hunk });
    }
  }
  return merged;
}

function reduceHunkCount(hunks, maximum) {
  const reduced = hunks.map((hunk) => ({ ...hunk }));
  while (reduced.length > maximum) {
    let bestIndex = 0;
    let bestCost = Number.POSITIVE_INFINITY;
    for (let index = 0; index < reduced.length - 1; index += 1) {
      const left = reduced[index];
      const right = reduced[index + 1];
      const cost = (right.sourceStart - left.sourceEnd) + (right.targetStart - left.targetEnd);
      if (cost < bestCost) {
        bestCost = cost;
        bestIndex = index;
      }
    }
    const left = reduced[bestIndex];
    const right = reduced[bestIndex + 1];
    reduced.splice(bestIndex, 2, {
      sourceStart: left.sourceStart,
      sourceEnd: right.sourceEnd,
      targetStart: left.targetStart,
      targetEnd: right.targetEnd
    });
  }
  return reduced;
}

/**
 * Derive exact, non-overlapping local replacements using token LCS.
 * Applying every returned hunk from right to left reconstructs target exactly.
 */
export function deriveGeneralCorrectionHunks(source, target, {
  maxIssues = GENERAL_CORRECTION_MAX_ISSUES,
  allowMeaningSensitiveChanges = false
} = {}) {
  if (!Number.isInteger(maxIssues) || maxIssues < 1 || maxIssues > 32) return null;
  if (!validateGeneralCorrection(source, target, { allowMeaningSensitiveChanges })) return null;
  if (source === target) return Object.freeze([]);

  const sourceTokens = tokens(source);
  const targetTokens = tokens(target);
  const rows = sourceTokens.length + 1;
  const columns = targetTokens.length + 1;
  if (rows * columns > 4_500_000) return null;

  const lcs = Array.from({ length: rows }, () => new Uint16Array(columns));
  for (let sourceIndex = sourceTokens.length - 1; sourceIndex >= 0; sourceIndex -= 1) {
    for (let targetIndex = targetTokens.length - 1; targetIndex >= 0; targetIndex -= 1) {
      lcs[sourceIndex][targetIndex] = sourceTokens[sourceIndex].value === targetTokens[targetIndex].value
        ? lcs[sourceIndex + 1][targetIndex + 1] + 1
        : Math.max(lcs[sourceIndex + 1][targetIndex], lcs[sourceIndex][targetIndex + 1]);
    }
  }

  const rawHunks = [];
  let sourceIndex = 0;
  let targetIndex = 0;
  let active = null;
  const flush = () => {
    if (!active) return;
    rawHunks.push({
      sourceStart: active.sourceStart,
      sourceEnd: sourceIndex,
      targetStart: active.targetStart,
      targetEnd: targetIndex
    });
    active = null;
  };
  while (sourceIndex < sourceTokens.length || targetIndex < targetTokens.length) {
    if (
      sourceIndex < sourceTokens.length
      && targetIndex < targetTokens.length
      && sourceTokens[sourceIndex].value === targetTokens[targetIndex].value
    ) {
      flush();
      sourceIndex += 1;
      targetIndex += 1;
      continue;
    }
    if (!active) active = { sourceStart: sourceIndex, targetStart: targetIndex };
    if (
      targetIndex < targetTokens.length
      && (
        sourceIndex >= sourceTokens.length
        || lcs[sourceIndex][targetIndex + 1] >= lcs[sourceIndex + 1][targetIndex]
      )
    ) targetIndex += 1;
    else sourceIndex += 1;
  }
  flush();
  if (!rawHunks.length) return null;

  // Existing portal issues are replacements, not zero-width insert/delete
  // operations. Anchor a pure insertion/deletion to an adjacent unchanged token.
  const anchored = rawHunks.map((hunk) => ({ ...hunk }));
  for (const hunk of anchored) {
    if (hunk.sourceStart !== hunk.sourceEnd && hunk.targetStart !== hunk.targetEnd) continue;
    if (
      hunk.sourceEnd < sourceTokens.length
      && hunk.targetEnd < targetTokens.length
      && sourceTokens[hunk.sourceEnd].value === targetTokens[hunk.targetEnd].value
    ) {
      hunk.sourceEnd += 1;
      hunk.targetEnd += 1;
    } else if (
      hunk.sourceStart > 0
      && hunk.targetStart > 0
      && sourceTokens[hunk.sourceStart - 1].value === targetTokens[hunk.targetStart - 1].value
    ) {
      hunk.sourceStart -= 1;
      hunk.targetStart -= 1;
    } else return null;
  }

  let merged = mergeOverlappingHunks(anchored);
  merged = reduceHunkCount(merged, maxIssues);
  const ranges = merged.map((hunk) => {
    const start = hunk.sourceStart < sourceTokens.length
      ? sourceTokens[hunk.sourceStart].start
      : source.length;
    const end = hunk.sourceEnd > hunk.sourceStart
      ? sourceTokens[hunk.sourceEnd - 1].end
      : start;
    const targetStart = hunk.targetStart < targetTokens.length
      ? targetTokens[hunk.targetStart].start
      : target.length;
    const targetEnd = hunk.targetEnd > hunk.targetStart
      ? targetTokens[hunk.targetEnd - 1].end
      : targetStart;
    return {
      start,
      end,
      originalText: source.slice(start, end),
      replacementText: target.slice(targetStart, targetEnd)
    };
  });

  if (
    ranges.some((range, index) => (
      !range.originalText
      || !range.replacementText
      || range.originalText === range.replacementText
      || range.originalText.length > 500
      || range.replacementText.length > 700
      || CONTROL_RE.test(range.replacementText)
      || BIDI_CONTROL_RE.test(range.replacementText)
      || HTML_RE.test(range.replacementText)
      || (index > 0 && ranges[index - 1].end > range.start)
    ))
  ) return null;

  const reconstructed = ranges.reduceRight((value, range) => (
    `${value.slice(0, range.start)}${range.replacementText}${value.slice(range.end)}`
  ), source);
  if (reconstructed !== target) return null;
  const changed = ranges.reduce((total, range) => total + range.originalText.length, 0);
  if (source.length >= 8 && changed > source.length * 0.8) return null;
  return freezeArray(ranges);
}

function boundedString(value, maximum) {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  return normalized && normalized.length <= maximum && !CONTROL_RE.test(normalized)
    ? normalized
    : "";
}

function usableTraditionalChineseExplanation(value) {
  return typeof value === "string"
    && value.length >= 8
    && /\p{Script=Han}/u.test(value);
}

function genericExplanation(category, originalText, replacementText) {
  const before = originalText.trim();
  const after = replacementText.trim();
  if (!before) return `這裡需要補上或調整「${after}」，令句子結構完整。`;
  const reason = {
    subject_verb_agreement: "主語和動詞的單複數必須一致",
    article_or_determiner: "名詞前的冠詞或限定詞要配合句意和名詞形式",
    singular_plural: "名詞的單數或複數形式要配合前文",
    countability: "要留意這個名詞是可數還是不可數",
    verb_form_or_tense: "動詞形式和時態要配合句子結構",
    modal_or_auxiliary: "助動詞後面的動詞要使用正確形式",
    infinitive_or_gerund: "前面的動詞或介詞決定後面使用不定詞還是動名詞",
    preposition: "這個搭配需要使用正確的介詞",
    pronoun: "代名詞形式要配合它在句子中的作用",
    sentence_structure: "句子需要有完整而連貫的結構",
    conjunction: "連接詞要正確連接兩個成分或子句",
    parallelism: "並列成分應使用一致的文法形式",
    comparison: "比較結構需要使用相配的形式",
    possessive: "所有格形式要正確表示所屬關係",
    punctuation: "標點要正確分隔句子成分",
    spelling_or_spacing: "拼字和空格需要修正",
    word_form: "這裡需要使用正確的詞性或字形",
    word_choice: "這個位置需要使用符合文法搭配的字詞",
    other_grammar: "請留意這部分的文法結構"
  }[category] || "請留意這部分的文法結構";
  return `「${before}」應改為「${after}」；${reason}。`;
}

function metadataCandidates(modelMetadata) {
  const raw = Array.isArray(modelMetadata)
    ? modelMetadata
    : Array.isArray(modelMetadata?.issues)
      ? modelMetadata.issues
      : [];
  return raw.flatMap((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const category = CATEGORY_IDS.has(entry.category) ? entry.category : "";
    const explanation = boundedString(
      entry.explanationZhHant || entry.message || entry.explanation,
      700
    );
    const originalText = boundedString(entry.originalText, 500);
    const replacementText = boundedString(entry.replacementText || entry.suggestedText, 700);
    const confidence = Number(entry.confidence);
    if (!category || !originalText || !replacementText) return [];
    return [{
      index,
      category,
      explanation,
      originalText,
      replacementText,
      confidence: Number.isFinite(confidence) && confidence >= 0.5 && confidence <= 1
        ? confidence
        : 0.8
    }];
  });
}

function metadataScore(candidate, range) {
  let score = 0;
  if (candidate.originalText === range.originalText) score += 10;
  else if (
    Math.min(candidate.originalText.length, range.originalText.length) >= 3
    && (
    candidate.originalText.includes(range.originalText)
    || range.originalText.includes(candidate.originalText)
    )
  ) score += 4;
  if (candidate.replacementText === range.replacementText) score += 10;
  else if (
    Math.min(candidate.replacementText.length, range.replacementText.length) >= 3
    && (
    candidate.replacementText.includes(range.replacementText)
    || range.replacementText.includes(candidate.replacementText)
    )
  ) score += 4;
  return score;
}

function issueMetadata(range, candidates, used) {
  const best = candidates
    .filter((candidate) => !used.has(candidate.index))
    .map((candidate) => ({ candidate, score: metadataScore(candidate, range) }))
    .sort((left, right) => right.score - left.score || right.candidate.confidence - left.candidate.confidence)[0];
  if (best?.score >= 12) {
    used.add(best.candidate.index);
    return {
      ...best.candidate,
      explanation: usableTraditionalChineseExplanation(best.candidate.explanation)
        ? best.candidate.explanation
        : genericExplanation(
          best.candidate.category,
          range.originalText,
          range.replacementText
        )
    };
  }
  return {
    category: "other_grammar",
    explanation: genericExplanation("other_grammar", range.originalText, range.replacementText),
    confidence: 0.8
  };
}

/**
 * Convert a validated full-sentence proposal into portal issue objects.
 * modelMetadata is optional and affects labels/explanations only; malformed
 * model ranges can never veto a safe corrected target or change its edit spans.
 */
export function materializeGeneralCorrection(
  source,
  correctedTargetOrResult,
  modelMetadataOrEngine = [],
  engine = Object.freeze({ name: "unknown", model: "unknown", version: "unknown" }),
  options = {}
) {
  let correctedTarget = correctedTargetOrResult;
  let modelMetadata = modelMetadataOrEngine;
  let resolvedEngine = engine;
  // Convenience overload for direct Worker-AI results:
  // materializeGeneralCorrection(source, { response: { correctedSentence,
  // issues } }, engine). The explicit four-argument form remains the canonical
  // API and is useful when a caller has already parsed the provider response.
  if (
    correctedTargetOrResult
    && typeof correctedTargetOrResult === "object"
    && !Array.isArray(correctedTargetOrResult)
  ) {
    let payload = Object.prototype.hasOwnProperty.call(correctedTargetOrResult, "response")
      ? correctedTargetOrResult.response
      : correctedTargetOrResult;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {
        return null;
      }
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    correctedTarget = payload.correctedSentence;
    modelMetadata = payload.issues;
    resolvedEngine = modelMetadataOrEngine;
  }
  const hunks = deriveGeneralCorrectionHunks(source, correctedTarget, options);
  if (!hunks) return null;
  if (!hunks.length) return Object.freeze([]);
  const candidates = metadataCandidates(modelMetadata);
  const used = new Set();
  const issues = hunks.map((range) => {
    const details = issueMetadata(range, candidates, used);
    return {
      ruleId: `EdmundAI:${details.category}`,
      title: GENERAL_CORRECTION_CATEGORIES[details.category],
      category: details.category,
      message: details.explanation,
      originalText: range.originalText,
      suggestedText: range.replacementText,
      correctedSentence: `${source.slice(0, range.start)}${range.replacementText}${source.slice(range.end)}`,
      start: range.start,
      end: range.end,
      confidence: details.confidence,
      suggestions: Object.freeze([Object.freeze({
        kind: "replace",
        replacementText: range.replacementText
      })]),
      engine: resolvedEngine
    };
  });
  return freezeArray(issues);
}

export function applyGeneralCorrectionIssues(source, issues) {
  return [...issues]
    .sort((left, right) => right.start - left.start)
    .reduce((value, issue) => (
      `${value.slice(0, issue.start)}${issue.suggestedText}${value.slice(issue.end)}`
    ), source);
}
