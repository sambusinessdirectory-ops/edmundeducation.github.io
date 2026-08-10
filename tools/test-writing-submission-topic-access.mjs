import assert from "node:assert/strict";
import test from "node:test";

import {
  canonicalAccessibleWritingTopic,
  normalizeWritingTopicAccess,
  writingTopicAccessAllows
} from "../writing-submission-topic-access.js";

const canonicalIelts = Object.freeze({
  id: "fill:model-essay-3-ielts-opinion",
  type: "fill-blanks",
  sectionKey: "ielts-writing",
  label: "Canonical IELTS question",
  questionPrompt: ["Canonical prompt"]
});
const canonicalDse = Object.freeze({
  id: "fill:dse-writing-sample",
  type: "fill-blanks",
  sectionKey: "dse-writing",
  label: "Canonical DSE question",
  questionPrompt: ["Canonical DSE prompt"]
});
const catalog = Object.freeze([canonicalIelts, canonicalDse]);

test("topic access is unavailable until an authoritative permission map is ready", () => {
  assert.equal(normalizeWritingTopicAccess(null), null);
  assert.equal(normalizeWritingTopicAccess([]), null);
  assert.equal(normalizeWritingTopicAccess({ "ielts-writing": "false" }), null);
  assert.equal(writingTopicAccessAllows(canonicalIelts, {}, false), false);
  assert.equal(canonicalAccessibleWritingTopic(catalog, canonicalIelts.id, {}, false), null);
});

test("reserved admin-message metadata is ignored without weakening permission validation", () => {
  const access = normalizeWritingTopicAccess({
    __adminMessage: "Please revise the assigned vocabulary first.",
    "dse-writing": true,
    "ielts-writing": false
  });
  assert.deepEqual({ ...access }, {
    "dse-writing": true,
    "ielts-writing": false
  });
  assert.equal(Object.hasOwn(access, "__adminMessage"), false);

  assert.equal(normalizeWritingTopicAccess({
    __adminMessage: "Display-only metadata",
    "ielts-writing": "false"
  }), null);
  assert.equal(normalizeWritingTopicAccess({
    __anotherMetadataField: "not allowed",
    "ielts-writing": true
  }), null);
});

test("authoritative defaults remain open while explicit section denials remain closed", () => {
  const defaultAccess = normalizeWritingTopicAccess({});
  assert.equal(writingTopicAccessAllows(canonicalIelts, defaultAccess, true), true);

  const restricted = normalizeWritingTopicAccess({
    "ielts-writing": false,
    "dse-writing": true
  });
  assert.equal(writingTopicAccessAllows(canonicalIelts, restricted, true), false);
  assert.equal(writingTopicAccessAllows(canonicalDse, restricted, true), true);
});

test("saved topic data is replaced by the matching canonical accessible entry", () => {
  const access = normalizeWritingTopicAccess({ "ielts-writing": true });
  const forgedDraftResource = {
    id: canonicalIelts.id,
    sectionKey: "made-up-open-section",
    label: "Forged label",
    questionPrompt: ["Forged prompt"],
    questionImages: [{ src: "https://attacker.example/prompt.png" }]
  };
  assert.equal(
    canonicalAccessibleWritingTopic(catalog, forgedDraftResource, access, true),
    canonicalIelts
  );
  assert.equal(
    canonicalAccessibleWritingTopic(catalog, { id: "fill:not-in-catalog" }, access, true),
    null
  );
  assert.equal(
    canonicalAccessibleWritingTopic(
      catalog,
      forgedDraftResource,
      normalizeWritingTopicAccess({ "ielts-writing": false }),
      true
    ),
    null
  );
});

test("catalogue entries without an authorization section fail closed", () => {
  const unscoped = { id: "fill:unscoped", type: "fill-blanks", sectionKey: "" };
  assert.equal(writingTopicAccessAllows(unscoped, normalizeWritingTopicAccess({}), true), false);
});
