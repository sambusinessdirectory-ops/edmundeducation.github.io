(function exposeEdmundAnswerComparison(root) {
  "use strict";

  const JOINING_PUNCTUATION_RE = /[\u0027\u2018\u2019\u201B\u2032\uFF07\p{Pd}]/gu;
  const NUMERIC_PUNCTUATION_RE = /(?<=\p{N})[,，](?=\p{N})/gu;
  const SEPARATING_PUNCTUATION_RE = /[\p{P}\p{S}]+/gu;
  const WORD_RE = /[\p{L}\p{N}]+/gu;
  const WORD_SEGMENT_RE = /[\p{L}\p{N}]+(?:(?:[\u0027\u2018\u2019\u201B\u2032\uFF07\p{Pd}][\p{L}\p{N}]+)|(?:[,，](?=\p{N})\p{N}+))*/gu;
  // A single edit is treated as a spelling slip only when it does not turn
  // one familiar English word into another. This protects grammar-changing
  // pairs such as are/ate, in/is and a/i while still accepting thi/the.
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
    return typeof options?.canonicalizeToken === "function"
      ? options.canonicalizeToken
      : (token) => token;
  }

  function normalizedSource(value) {
    return String(value ?? "")
      .normalize("NFKC")
      .replace(NUMERIC_PUNCTUATION_RE, "")
      .replace(JOINING_PUNCTUATION_RE, "")
      .replace(SEPARATING_PUNCTUATION_RE, " ")
      .toLocaleLowerCase("en");
  }

  function tokenize(value, options = {}) {
    const canonicalizeToken = canonicalizer(options);
    return (normalizedSource(value).match(WORD_RE) || [])
      .map((token) => String(canonicalizeToken(token) || token).toLocaleLowerCase("en"));
  }

  function normalize(value, options = {}) {
    return tokenize(value, options).join(" ");
  }

  function editDistanceAtMostOne(leftValue, rightValue) {
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

  function isEligibleTypoPair(studentToken, expectedToken) {
    const student = String(studentToken || "").toLocaleLowerCase("en");
    const expected = String(expectedToken || "").toLocaleLowerCase("en");
    if (!/^\p{L}+$/u.test(student) || !/^\p{L}+$/u.test(expected)) return false;
    if (student.length < 2 || expected.length < 2 || Math.max(student.length, expected.length) < 3) return false;
    return !(PROTECTED_REAL_WORDS.has(student) && PROTECTED_REAL_WORDS.has(expected));
  }

  function compare(studentAnswer, expectedAnswer, options = {}) {
    const studentTokens = tokenize(studentAnswer, options);
    const expectedTokens = tokenize(expectedAnswer, options);
    const differences = [];
    if (studentTokens.length !== expectedTokens.length) {
      return {
        correct: false,
        exact: false,
        typoCount: 0,
        differences,
        studentTokens,
        expectedTokens,
        expectedAnswer: String(expectedAnswer ?? "")
      };
    }
    for (let index = 0; index < expectedTokens.length; index += 1) {
      if (studentTokens[index] === expectedTokens[index]) continue;
      const distance = editDistanceAtMostOne(studentTokens[index], expectedTokens[index]);
      differences.push({
        index,
        student: studentTokens[index],
        expected: expectedTokens[index],
        distance,
        typoEligible: distance === 1 && isEligibleTypoPair(studentTokens[index], expectedTokens[index])
      });
    }
    const typoCount = differences.filter((difference) => difference.typoEligible).length;
    const correct = differences.length === 0
      || (differences.length === 1 && differences[0].typoEligible);
    return {
      correct,
      exact: differences.length === 0,
      typoCount: correct ? typoCount : 0,
      differences,
      studentTokens,
      expectedTokens,
      expectedAnswer: String(expectedAnswer ?? "")
    };
  }

  function comparisonScore(result) {
    const distance = result.differences.reduce((total, difference) => total + Math.min(4, difference.distance || 4), 0);
    const lengthPenalty = Math.abs(result.studentTokens.length - result.expectedTokens.length) * 8;
    return (result.correct ? 0 : 1000) + lengthPenalty + (result.differences.length * 10) + distance;
  }

  function best(studentAnswer, expectedAnswers, options = {}) {
    const candidates = [...new Set((Array.isArray(expectedAnswers) ? expectedAnswers : [expectedAnswers])
      .filter((answer) => String(answer ?? "").trim())
      .map((answer) => String(answer)))];
    if (!candidates.length) return compare(studentAnswer, "", options);
    return candidates
      .map((answer) => compare(studentAnswer, answer, options))
      .sort((left, right) => comparisonScore(left) - comparisonScore(right))[0];
  }

  function wordSegments(value, options = {}) {
    const text = String(value ?? "");
    const words = [];
    for (const match of text.matchAll(WORD_SEGMENT_RE)) {
      const comparable = tokenize(match[0], options).join("");
      words.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
        comparable: String(comparable).toLocaleLowerCase("en")
      });
    }
    return { text, words };
  }

  function expectedMarkup(expectedAnswer, studentAnswer, escapeHtml, options = {}) {
    const escape = typeof escapeHtml === "function" ? escapeHtml : (value) => String(value ?? "");
    const model = wordSegments(expectedAnswer, options);
    const student = wordSegments(studentAnswer, options);
    const matched = new Set();
    const matchedStudent = new Set();
    const partialSuffixes = new Map();

    if (model.words.length === student.words.length) {
      model.words.forEach((word, index) => {
        const studentWord = student.words[index];
        if (word.comparable === studentWord.comparable) {
          matched.add(index);
          matchedStudent.add(index);
          return;
        }
        const suffixLength = word.comparable.endsWith("s") && studentWord.comparable === word.comparable.slice(0, -1)
          ? 1
          : word.comparable.endsWith("es") && studentWord.comparable === word.comparable.slice(0, -2)
            ? 2
            : 0;
        if (suffixLength) partialSuffixes.set(index, suffixLength);
      });
    } else {
      const rows = model.words.length;
      const columns = student.words.length;
      const lengths = Array.from({ length: rows + 1 }, () => new Uint16Array(columns + 1));
      for (let row = rows - 1; row >= 0; row -= 1) {
        for (let column = columns - 1; column >= 0; column -= 1) {
          lengths[row][column] = model.words[row].comparable === student.words[column].comparable
            ? lengths[row + 1][column + 1] + 1
            : Math.max(lengths[row + 1][column], lengths[row][column + 1]);
        }
      }
      let row = 0;
      let column = 0;
      while (row < rows && column < columns) {
        if (model.words[row].comparable === student.words[column].comparable) {
          matched.add(row);
          matchedStudent.add(column);
          row += 1;
          column += 1;
        } else if (lengths[row + 1][column] >= lengths[row][column + 1]) {
          row += 1;
        } else {
          column += 1;
        }
      }
      for (let modelIndex = 0; modelIndex < model.words.length; modelIndex += 1) {
        if (matched.has(modelIndex)) continue;
        const modelToken = model.words[modelIndex].comparable;
        let selected = null;
        for (let studentIndex = 0; studentIndex < student.words.length; studentIndex += 1) {
          if (matchedStudent.has(studentIndex)) continue;
          const studentToken = student.words[studentIndex].comparable;
          const suffixLength = modelToken.endsWith("s") && studentToken === modelToken.slice(0, -1)
            ? 1
            : modelToken.endsWith("es") && studentToken === modelToken.slice(0, -2)
              ? 2
              : 0;
          if (!suffixLength) continue;
          const positionDistance = Math.abs(modelIndex - studentIndex);
          if (!selected || positionDistance < selected.positionDistance) {
            selected = { studentIndex, suffixLength, positionDistance };
          }
        }
        if (selected) {
          matchedStudent.add(selected.studentIndex);
          partialSuffixes.set(modelIndex, selected.suffixLength);
        }
      }
    }

    const highlightedIndexes = model.words
      .map((_, index) => index)
      .filter((index) => !matched.has(index));
    if (!highlightedIndexes.length) {
      return { html: escape(model.text), missingCount: 0, highlightedCount: 0 };
    }
    let cursor = 0;
    const html = model.words.map((word, index) => {
      const prefix = escape(model.text.slice(cursor, word.start));
      cursor = word.end;
      const escaped = escape(word.text);
      if (matched.has(index)) return `${prefix}${escaped}`;
      const suffixLength = partialSuffixes.get(index) || 0;
      const marked = suffixLength
        ? `${escape(word.text.slice(0, -suffixLength))}<mark class="missing-answer-highlight">${escape(word.text.slice(-suffixLength))}</mark>`
        : `<mark class="missing-answer-highlight">${escaped}</mark>`;
      return `${prefix}${marked}`;
    }).join("") + escape(model.text.slice(cursor));
    return {
      html,
      missingCount: highlightedIndexes.length,
      highlightedCount: highlightedIndexes.length
    };
  }

  root.EdmundAnswerComparison = Object.freeze({
    tokenize,
    normalize,
    editDistanceAtMostOne,
    isEligibleTypoPair,
    compare,
    best,
    expectedMarkup
  });
})(typeof window !== "undefined" ? window : globalThis);
