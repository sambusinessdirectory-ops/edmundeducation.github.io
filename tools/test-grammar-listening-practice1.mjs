import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const loadWindowData = (path, property) => {
  const context = { window: {} };
  vm.runInNewContext(read(path), context, { filename: path });
  return context.window[property];
};

const normalise = (value) => String(value ?? "")
  .normalize("NFKC")
  .replace(/[‘’]/g, "'")
  .replace(/(?:\.\.\.|…|\/|,|;)/g, " ")
  .replace(/[.!?]+$/g, "")
  .replace(/\s+/g, " ")
  .trim()
  .toLocaleLowerCase("en");

const matchesGrammarAnswer = (question, answer) => {
  const response = normalise(answer);
  if (!response) return false;
  if (question.acceptedAnswers.some((candidate) => normalise(candidate) === response)) return true;
  const blanks = question.prompt.match(/_+/g) || [];
  if (!blanks.length) return false;
  return question.acceptedAnswers.some((candidate) => {
    const parts = String(candidate).split(/\s*(?:\.{2,}|\/)\s*|\s+/).filter(Boolean);
    if (blanks.length > 1 && parts.length !== blanks.length) return false;
    let partIndex = 0;
    const completed = question.prompt
      .replace(/_+(?:\s*\([^)]*\))?/g, () => blanks.length === 1 ? candidate : parts[partIndex++] || "")
      .replace(/\s+([,.!?;:])/g, "$1");
    return normalise(completed) === response;
  });
};

const grammar = loadWindowData("grammar-tense-data.js", "EDMUND_GRAMMAR_TENSE_QUESTIONS");
assert.equal(grammar.length, 150, "Grammar must contain 150 questions");
assert.deepEqual(Array.from(grammar, (item) => item.number), Array.from({ length: 150 }, (_, index) => index + 1));
const grammarTom = JSON.parse(JSON.stringify(grammar).replace(/\bMia\b/g, "Tom").replaceAll("米婭", "湯姆"));
assert.equal(grammarTom.some((item) => JSON.stringify(item).includes("Mia")), false, "Mia must be replaced recursively");
assert(matchesGrammarAnswer(grammarTom[0], "walks"));
assert(matchesGrammarAnswer(grammarTom[0], "Tom usually walks to work because she lives nearby."));
assert(matchesGrammarAnswer(grammarTom[27], "Have you ever tried Korean food? If not, we can try it tonight."));
assert.equal(matchesGrammarAnswer(grammarTom[0], "walk"), false);

const grammarSystem = read("grammar-system.js");
assert.match(grammarSystem, /data-inline-explanation/);
assert.doesNotMatch(grammarSystem, /grammar-dialog/);
assert.match(grammarSystem, /data-reveal-step/);
assert.match(grammarSystem, /learning_portal_set_bookmark/);

const listening = loadWindowData("listening-practice-1-data.js", "EDMUND_IELTS_LISTENING_PRACTICE_1");
const transcript = loadWindowData("listening-practice-1-transcript.js", "EDMUND_IELTS_LISTENING_PRACTICE_1_TRANSCRIPT");
const analysis = loadWindowData("listening-practice-1-analysis.js", "EDMUND_IELTS_LISTENING_PRACTICE_1_ANALYSIS");
assert.equal(listening.parts.length, 4);
const questionNumbers = listening.parts.flatMap((part) => part.questions.flatMap((question) => question.numbers || [question.number]));
assert.deepEqual(Array.from(questionNumbers), Array.from({ length: 40 }, (_, index) => index + 1));
const answers = listening.parts.flatMap((part) => part.questions.flatMap((question) => question.answers || [question.answer]));
assert.deepEqual(Array.from(answers), [
  "fish", "roof", "Spanish", "vegetarian", "Audley", "hotel", "reviews", "local", "30", "average",
  "A", "B", "C", "A", "B", "C", "A", "E", "C", "E",
  "C", "E", "A", "C", "A", "B", "A", "B", "A", "C",
  "factories", "dead", "whale", "apartments", "park", "art", "beaches", "ferry", "bikes", "drone"
]);
for (const part of [1, 2, 3, 4]) {
  assert(Array.isArray(transcript[String(part)]) && transcript[String(part)].length >= 30, `Part ${part} transcript is incomplete`);
  assert(transcript[String(part)].every((row) => row.en.trim() && row.zh.trim()), `Part ${part} transcript must be bilingual`);
}
assert.deepEqual(Object.keys(analysis).map(Number), Array.from({ length: 40 }, (_, index) => index + 1));
assert(Object.values(analysis).every((item) => item.answer && item.explanation.length >= 45), "All 40 answers need substantive PDF-sourced analysis");

const listeningSystem = read("listening-system.js");
assert.match(listeningSystem, /bindTranscriptSync/);
assert.match(listeningSystem, /data-toggle-translation/);
assert.match(listeningSystem, /learning_portal_set_bookmark/);
assert.match(listeningSystem, /togglePartAnswers/);
assert.doesNotMatch(listeningSystem, /input\.value\s*=\s*question\.answer/, "Showing answers must never overwrite student inputs");
assert.doesNotMatch(listeningSystem, /scrollIntoView\(\{ block: "nearest"/, "Transcript sync must not force-scroll the viewport");
assert.match(listeningSystem, /data-bookmark-item=.*transcript/);
assert.match(listeningSystem, /practice1:analysis:q/);
assert.match(listeningSystem, /const TEXT_SCALES = Object\.freeze\(\[0\.5, 0\.75, 1, 1\.25, 1\.5, 1\.75, 2, 2\.25, 2\.5, 2\.75, 3\]\)/);
assert.match(listeningSystem, /data-floating-seek/);
assert.match(listeningSystem, /listening-translated-blank/);
assert.match(listeningSystem, /rawText\.split\(\/\(\\\{\\\{\\d\+\\\}\\\}\)\//, "Part 1 must split answer tokens before adding word-bookmark HTML");
assert.match(listeningSystem, /segment\.match\(\/\^\\\{\\\{\(\\d\+\)\\\}\\\}\$\//, "Part 1 answer tokens must be recognized only as complete text segments");
assert.doesNotMatch(listeningSystem, /wordButtons\([^\n]+\)\.replace\(\/\\\{\\\{/, "Part 1 must never replace answer tokens inside generated bookmark attributes");

const nightNav = read("shared-system-nav.js");
assert.match(nightNav, /assets\/eddy-night-invitation\.webp/);
assert.match(nightNav, /會的! 明天我會過來<br>探望 Eddy 和他的朋友!/);
assert.match(nightNav, /明天休息一下先, 後天之後再來~/);
assert.doesNotMatch(nightNav, /🌙|🐴/);

const bookmarkSql = read("supabase-learning-portal-bookmarks-20260822.sql");
assert.match(bookmarkSql, /enable row level security/);
assert.match(bookmarkSql, /select auth\.uid\(\)/);
assert.match(bookmarkSql, /security definer/);
assert.match(bookmarkSql, /on conflict on constraint learning_portal_bookmarks_pkey/);
assert.match(read("supabase-unified-bookmark-directory-20260821.sql"), /learning_portal_bookmarks/);

console.log("Grammar, night invitation, IELTS Listening Practice 1, transcripts, and secure bookmarks verified.");
