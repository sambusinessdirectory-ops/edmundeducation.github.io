const JOINING_PUNCTUATION_RE = /[\u0027\u2018\u2019\u201B\u2032\uFF07\p{Pd}]/gu;
const NUMERIC_PUNCTUATION_RE = /(?<=\p{N})[,，](?=\p{N})/gu;
const SEPARATING_PUNCTUATION_RE = /[\p{P}\p{S}]+/gu;
const WORD_RE = /[\p{L}\p{N}]+/gu;
const PROTECTED_REAL_WORDS = new Set([
  "a", "i", "am", "an", "and", "are", "as", "at", "ate", "be", "been", "being", "but", "by",
  "can", "could", "did", "do", "does", "eat", "for", "from", "go", "had", "has", "have", "he",
  "her", "here", "hers", "him", "his", "how", "if", "in", "into", "is", "it", "its", "may",
  "me", "might", "must", "my", "no", "nor", "not", "now", "of", "on", "or", "our", "ours",
  "over", "shall", "she", "should", "so", "than", "that", "the", "their", "theirs", "them",
  "then", "there", "these", "they", "this", "those", "through", "to", "under", "up", "us",
  "was", "we", "were", "what", "when", "where", "which", "who", "why", "will", "with", "would",
  "you", "your", "yours", "yet"
]);

function canonicalizer(options) {
  return typeof options?.canonicalizeToken === "function" ? options.canonicalizeToken : token => token;
}

export function tokenizeAnswer(value, options = {}) {
  const canonicalizeToken = canonicalizer(options);
  const source = String(value ?? "")
    .normalize("NFKC")
    .replace(NUMERIC_PUNCTUATION_RE, "")
    .replace(JOINING_PUNCTUATION_RE, "")
    .replace(SEPARATING_PUNCTUATION_RE, " ")
    .toLocaleLowerCase("en");
  return (source.match(WORD_RE) || []).map(token => String(canonicalizeToken(token) || token).toLocaleLowerCase("en"));
}

export function normalizeAnswerText(value, options = {}) {
  return tokenizeAnswer(value, options).join(" ");
}

export function editDistanceAtMostOne(leftValue, rightValue) {
  const left = String(leftValue || "");
  const right = String(rightValue || "");
  if (left === right) return 0;
  if (Math.abs(left.length - right.length) > 1) return 2;
  if (left.length === right.length) {
    let differences = 0;
    for (let index = 0; index < left.length; index += 1) {
      if (left[index] !== right[index] && ++differences > 1) return 2;
    }
    return differences;
  }
  const shorter = left.length < right.length ? left : right;
  const longer = left.length < right.length ? right : left;
  let shortIndex = 0;
  let longIndex = 0;
  let differences = 0;
  while (shortIndex < shorter.length && longIndex < longer.length) {
    if (shorter[shortIndex] === longer[longIndex]) {
      shortIndex += 1;
      longIndex += 1;
    } else {
      differences += 1;
      longIndex += 1;
      if (differences > 1) return 2;
    }
  }
  return 1;
}

export function isEligibleTypoPair(studentToken, expectedToken) {
  const student = String(studentToken || "").toLocaleLowerCase("en");
  const expected = String(expectedToken || "").toLocaleLowerCase("en");
  if (!/^\p{L}+$/u.test(student) || !/^\p{L}+$/u.test(expected)) return false;
  if (student.length < 2 || expected.length < 2 || Math.max(student.length, expected.length) < 3) return false;
  return !(PROTECTED_REAL_WORDS.has(student) && PROTECTED_REAL_WORDS.has(expected));
}

export function answersEquivalent(studentAnswer, expectedAnswer, options = {}) {
  const studentTokens = tokenizeAnswer(studentAnswer, options);
  const expectedTokens = tokenizeAnswer(expectedAnswer, options);
  if (studentTokens.length !== expectedTokens.length) return false;
  let typoCount = 0;
  for (let index = 0; index < expectedTokens.length; index += 1) {
    if (studentTokens[index] === expectedTokens[index]) continue;
    if (
      editDistanceAtMostOne(studentTokens[index], expectedTokens[index]) !== 1
      || !isEligibleTypoPair(studentTokens[index], expectedTokens[index])
      || ++typoCount > 1
    ) return false;
  }
  return true;
}
