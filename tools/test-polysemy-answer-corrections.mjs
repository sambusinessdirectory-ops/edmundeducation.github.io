import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const expected = {
  ahead: { "ahead-15-1": "ahead-pdf-001" },
  belong: { "belong-15-0": "belong-mcq-05", "belong-15-1": "belong-mcq-05" },
  blame: { "blame-03-1": "blame-mcq-21" },
  business: { "business-04-0": "business-mcq-15" },
  deadline: { "deadline-05-1": "deadline-mcq-14" },
  decline: { "decline-27-1": "decline-mcq-23" },
  delivery: { "delivery-21-1": "delivery-mcq-18" },
  desk: { "desk-13-1": "desk-mcq-03" },
  dramatic: { "dramatic-02-0": "dramatic-mcq-04", "dramatic-02-1": "dramatic-mcq-06" },
  entertain: { "entertain-19-0": "entertain-mcq-06" },
  fail: { "fail-22-0": "fail-mcq-16" },
  grow: { "grow-06-1": "grow-mcq-18" },
  indicate: { "indicate-17-0": "indicate-mcq-07" },
  offer: { "offer-10-0": "offer-mcq-11" },
  policy: { "policy-83-0": "policy-mcq-30" },
  resign: { "resign-82-0": "resign-mcq-01" },
  ruin: { "ruin-11-0": "ruin-mcq-23" },
  session: { "session-33-0": "session-mcq-03" },
  simple: { "simple-07-1": "simple-mcq-08" },
  strength: { "strength-31-0": "strength-pdf-001" },
  strict: { "strict-02-0": "strict-mcq-04" },
  subject: { "subject-16-0": "subject-mcq-11" },
  text: { "text-35-0": "text-mcq-28" },
  treadmill: {
    "treadmill-34-1": "treadmill-mcq-01",
    "treadmill-34-2": "treadmill-mcq-11",
    "treadmill-34-3": "treadmill-mcq-01",
    "treadmill-34-4": "treadmill-mcq-14",
  },
  trouble: { "trouble-05-1": "trouble-mcq-16" },
  vulnerability: {
    "vulnerability-41-1": "vulnerability-mcq-05",
    "vulnerability-41-2": "vulnerability-mcq-13",
    "vulnerability-41-3": "vulnerability-mcq-05",
    "vulnerability-41-4": "vulnerability-mcq-13",
  },
  zone: { "zone-01-0": "zone-mcq-12", "zone-01-1": "zone-mcq-12" },
};

let checked = 0;
for (const [moduleId, mappings] of Object.entries(expected)) {
  const url = pathToFileURL(resolve(`polysemy-lab/content/${moduleId}.mjs`));
  const module = (await import(url.href)).default;
  const senseIds = new Set(module.senses.map((sense) => sense.id));
  for (const [questionId, senseId] of Object.entries(mappings)) {
    const question = module.questions.find((item) => item.id === questionId);
    assert(question, `${questionId}: question not found`);
    assert(senseIds.has(senseId), `${questionId}: expected sense does not exist`);
    assert.equal(question.sense, senseId, `${questionId}: incorrect sense`);
    assert.equal(question.correctOption, senseId, `${questionId}: incorrect answer key`);
    assert(question.options.includes(senseId), `${questionId}: answer missing from options`);
    assert(question.optionReasons[senseId], `${questionId}: answer rationale missing`);
    checked += 1;
  }
}

const menu = (await import(pathToFileURL(resolve("polysemy-lab/content/menu.mjs")).href)).default;
const menuPrompts = menu.questions.map((question) => question.en);
assert.equal(new Set(menuPrompts).size, menuPrompts.length, "menu: duplicate English prompt remains");

const mind = (await import(pathToFileURL(resolve("polysemy-lab/content/mind.mjs")).href)).default;
const mindPrompts = mind.questions.map((question) => question.en);
assert.equal(new Set(mindPrompts).size, mindPrompts.length, "mind: duplicate English prompt remains");

const now = (await import(pathToFileURL(resolve("polysemy-lab/content/now.mjs")).href)).default;
const nowQuestion = now.questions.find((question) => question.id === "now-10-1");
assert.match(nowQuestion.explanation, /此刻|現在這一刻/, "now-10-1: explanation is still mismatched");

console.log(`PASS: ${checked} corrected answer keys, two duplicate prompts, and one explanation regression checked.`);
