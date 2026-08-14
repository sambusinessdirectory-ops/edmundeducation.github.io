import assert from "node:assert/strict";
import test from "node:test";

import {
  feedbackHighlightCommandFromEvent,
  normalizeGrammarFeedbackPoints,
  normalizeSentenceStructureDeepLink,
  normalizeSentenceStructureMethods,
  parseNumberedFeedbackBlocks,
  sliceFeedbackFormattingRuns
} from "../writing-submission-feedback-tools.mjs";

test("feedback color shortcuts support Command and Control without hijacking plain keys", () => {
  assert.equal(feedbackHighlightCommandFromEvent({ metaKey: true, key: "y" }), "yellow");
  assert.equal(feedbackHighlightCommandFromEvent({ ctrlKey: true, key: "O" }), "orange");
  assert.equal(feedbackHighlightCommandFromEvent({ metaKey: true, key: "b" }), "blue");
  assert.equal(feedbackHighlightCommandFromEvent({ ctrlKey: true, key: "G" }), "green");
  assert.equal(feedbackHighlightCommandFromEvent({ key: "y" }), null);
  assert.equal(feedbackHighlightCommandFromEvent({ metaKey: true, altKey: true, key: "y" }), null);
  assert.equal(feedbackHighlightCommandFromEvent({ metaKey: true, key: "x" }), null);
});

test("pasted numbered feedback becomes a source-aligned card group", () => {
  const source = [
    "Problems",
    "1. Although ,the → Although the",
    "2. the entrance maintain → the entrance remains",
    "Additional explanation for number two.",
    "3. disappeared → disappeared"
  ].join("\n");
  const blocks = parseNumberedFeedbackBlocks(source);

  assert.equal(blocks.length, 2);
  assert.deepEqual(blocks[0], {
    type: "text",
    text: "Problems",
    start: 0,
    end: 8
  });
  assert.equal(blocks[1].type, "numbered");
  assert.deepEqual(blocks[1].items.map(item => [item.number, item.text]), [
    [1, "Although ,the → Although the"],
    [2, "the entrance maintain → the entrance remains\nAdditional explanation for number two."],
    [3, "disappeared → disappeared"]
  ]);
  for (const item of blocks[1].items) {
    assert.equal(source.slice(item.start, item.end), item.text);
  }
});

test("a blank line escapes a numbered group back to an ordinary paragraph", () => {
  const source = "1. Grammar problem\nKeep this explanation in card one.\n\nSuggestion\nUse a relative clause.";
  const blocks = parseNumberedFeedbackBlocks(source);
  assert.deepEqual(blocks.map(block => block.type), ["numbered", "text"]);
  assert.equal(blocks[0].items[0].text, "Grammar problem\nKeep this explanation in card one.");
  assert.equal(blocks[1].text, "Suggestion\nUse a relative clause.");
});

test("formatting ranges are clipped and rebased to an arbitrary text slice", () => {
  const runs = [
    { start: 0, end: 5, bold: true, highlight: "yellow" },
    { start: 6, end: 12, bold: false, highlight: "blue" },
    { start: 14, end: 18, bold: true, highlight: "" },
    { start: 30, end: 40, bold: true, highlight: "green" }
  ];
  assert.deepEqual(sliceFeedbackFormattingRuns(runs, 3, 16), [
    { start: 0, end: 2, bold: true, highlight: "yellow" },
    { start: 3, end: 9, bold: false, highlight: "blue" },
    { start: 11, end: 13, bold: true, highlight: "" }
  ]);
});

test("grammar points and sentence methods normalize to strict text-formatting records", () => {
  const values = [
    {
      text: "  Subject–verb agreement  ",
      formatting: [{ start: 2, end: 9, bold: true, highlight: "orange" }],
      ignored: "does not escape the canonical result"
    },
    { text: "", formatting: [] },
    { text: 42, formatting: [] },
    null
  ];
  const expected = [{
    text: "Subject–verb agreement",
    formatting: [{ start: 0, end: 7, bold: true, highlight: "orange" }]
  }];
  assert.deepEqual(normalizeGrammarFeedbackPoints(values), expected);
  assert.deepEqual(normalizeSentenceStructureMethods(values), expected);
  assert.deepEqual(normalizeGrammarFeedbackPoints("not an array"), []);
});

test("sentence-structure links accept only one safe Edmund lesson parameter", () => {
  assert.equal(
    normalizeSentenceStructureDeepLink("https://edmundeducation.com/sentence-structure.html?lesson=ss345"),
    "/sentence-structure.html?lesson=ss345"
  );
  assert.equal(
    normalizeSentenceStructureDeepLink("/sentence-structure.html?lesson=while_contrast-5"),
    "/sentence-structure.html?lesson=while_contrast-5"
  );

  const rejected = [
    "javascript:alert(1)",
    "http://edmundeducation.com/sentence-structure.html?lesson=ss5",
    "https://evil.example/sentence-structure.html?lesson=ss5",
    "https://edmundeducation.com.evil.example/sentence-structure.html?lesson=ss5",
    "https://edmundeducation.com@evil.example/sentence-structure.html?lesson=ss5",
    "https://edmundeducation.com/sentence-structure.html?lesson=ss5&next=javascript%3Aalert(1)",
    "https://edmundeducation.com/sentence-structure.html?lesson=ss5#malicious",
    "https://edmundeducation.com/other.html?lesson=ss5",
    "//edmundeducation.com/sentence-structure.html?lesson=ss5",
    "sentence-structure.html?lesson=%3Cscript%3Ealert(1)%3C%2Fscript%3E"
  ];
  rejected.forEach(url => assert.equal(normalizeSentenceStructureDeepLink(url), null, url));
});
