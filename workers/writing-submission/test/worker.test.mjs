import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import worker from "../src/index.js";
import { WRITING_SUBMISSION_TOPIC_CATALOG } from "../src/topic-catalog.js";

const ORIGIN = "https://edmundeducation.github.io";
const BAD_ORIGIN = "https://attacker.example";
const STUDENT_TOKEN = "11111111-1111-4111-8111-111111111111";
const STUDENT_ID = "22222222-2222-4222-8222-222222222222";
const SUBMISSION_ID = "33333333-3333-4333-8333-333333333333";
const OCCURRENCE_ID = "44444444-4444-4444-8444-444444444444";
const ADMIN_TOKEN = "55555555-5555-4555-8555-555555555555";
const ADMIN_ID = "66666666-6666-4666-8666-666666666666";
const FEEDBACK_ID = "77777777-7777-4777-8777-777777777777";
const FRAGMENT_ID = "88888888-8888-4888-8888-888888888888";
const RECREATED_FEEDBACK_ID = "99999999-9999-4999-8999-999999999999";
const FINGERPRINT = "a".repeat(64);
const CANONICAL_DSE_TOPIC = WRITING_SUBMISSION_TOPIC_CATALOG.find(
  topic => topic.id === "fill:dse-writing-2025-part-a"
);
assert.ok(CANONICAL_DSE_TOPIC);

function limiter(success = true) {
  return {
    calls: [],
    async limit(value) {
      this.calls.push(value);
      return { success };
    }
  };
}

function aiBinding(result = { response: { correctedSentence: "No changes.", issues: [] } }) {
  return {
    calls: [],
    async run(model, request) {
      this.calls.push({ model, request });
      if (result instanceof Error) throw result;
      return typeof result === "function" ? result(model, request) : result;
    }
  };
}

function aiSequence(...results) {
  let index = 0;
  return aiBinding(() => {
    const result = results[Math.min(index, results.length - 1)];
    index += 1;
    if (result instanceof Error) throw result;
    return result;
  });
}

function environment(overrides = {}) {
  return {
    ALLOWED_ORIGINS: ORIGIN,
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "x".repeat(64),
    ADMIN_LOGIN_RATE_LIMITER: limiter(),
    SUBMISSION_WRITE_RATE_LIMITER: limiter(),
    GRAMMAR_WRITE_RATE_LIMITER: limiter(),
    GRAMMAR_CHECK_RATE_LIMITER: limiter(),
    AI: aiBinding(),
    ...overrides
  };
}

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

function rpcRequest(input, init = {}) {
  const url = new URL(String(input));
  return {
    name: decodeURIComponent(url.pathname.split("/").at(-1)),
    body: JSON.parse(String(init.body || "{}")),
    headers: new Headers(init.headers)
  };
}

function studentProfile(overrides = {}) {
  return [{
    id: STUDENT_ID,
    name: "Test Student",
    session_expires_at: "2026-08-30T00:00:00.000Z",
    access: {
      "dse-writing": true,
      "government-writing": true,
      "ielts-writing": false
    },
    ...overrides
  }];
}

function adminProfile() {
  return [{
    id: ADMIN_ID,
    name: "Writing Administrator",
    expires_at: "2026-08-01T00:00:00.000Z"
  }];
}

function storedFeedback(overrides = {}) {
  return {
    id: FEEDBACK_ID,
    submission_id: SUBMISSION_ID,
    overall_comment: "整體表達清楚。",
    final_comment: "繼續留意句子連接。",
    status: "published",
    version: 2,
    published_at: "2026-08-12T04:00:00.000Z",
    updated_at: "2026-08-12T04:00:00.000Z",
    fragments: [{
      id: FRAGMENT_ID,
      position: 1,
      originalFragment: "Students learns quickly.",
      edmundComment: "Students 是複數，動詞使用 learn。",
      suggestedWriting: "Students learn quickly.",
      originalFormatting: [
        { start: 0, end: 8, bold: true, highlight: "" },
        { start: 9, end: 15, bold: false, highlight: "yellow" }
      ],
      commentFormatting: [
        { start: 0, end: 8, bold: true, highlight: "orange" },
        { start: 9, end: 10, bold: false, highlight: "blue" }
      ],
      suggestionFormatting: [
        { start: 0, end: 8, bold: true, highlight: "green" }
      ]
    }],
    ...overrides
  };
}

function occurrence(overrides = {}) {
  return {
    id: OCCURRENCE_ID,
    fingerprint: FINGERPRINT,
    ruleId: "SubjectVerbAgreement",
    title: "Subject–verb agreement",
    message: "A plural subject takes the base verb form.",
    originalText: "companies requires",
    suggestedText: "companies require",
    sentenceText: "More companies requires staff to wear uniforms.",
    correctedSentence: "More companies require staff to wear uniforms.",
    detectedAt: new Date().toISOString(),
    ...overrides
  };
}

function grammarAiIssue(overrides = {}) {
  return {
    category: "subject_verb_agreement",
    originalText: "need",
    replacementText: "needs",
    occurrence: 1,
    explanationZhHant: "Tommy 是第三身單數，現在式動詞要加 s。",
    confidence: 0.98,
    ...overrides
  };
}

function tomLoveIssues() {
  return [
    grammarAiIssue({
      originalText: "love",
      replacementText: "loves",
      explanationZhHant: "Tom 是第三身單數；一般現在式動詞 love 要加 s。",
      confidence: 0.99
    }),
    grammarAiIssue({
      category: "infinitive_or_gerund",
      originalText: "eat",
      replacementText: "to eat",
      explanationZhHant: "love 後面不能直接接動詞原形 eat；可寫 love to eat。",
      confidence: 0.98
    })
  ];
}

function hateSchoolIssues() {
  return [
    grammarAiIssue({
      originalText: "hate",
      replacementText: "hates",
      explanationZhHant: "Tom 是第三身單數，所以現在式用 hates。",
      confidence: 0.99
    }),
    grammarAiIssue({
      category: "infinitive_or_gerund",
      originalText: "go school",
      replacementText: "going to school",
      explanationZhHant: "hate 後可用 -ing，而「上學」的固定用法是 go to school。",
      confidence: 0.98
    }),
    grammarAiIssue({
      originalText: "enjoy",
      replacementText: "enjoys",
      explanationZhHant: "Tom 是第三身單數，所以現在式用 enjoys。",
      confidence: 0.99
    }),
    grammarAiIssue({
      category: "infinitive_or_gerund",
      originalText: "watch movie",
      replacementText: "watching movies",
      explanationZhHant: "enjoy 後面用 -ing；這裡泛指看電影，所以用 movies。",
      confidence: 0.98
    })
  ];
}

function applyGrammarAiPayload(sentence, issues) {
  const positioned = issues.map((issue) => {
    let start = -1;
    let from = 0;
    for (let index = 0; index < issue.occurrence; index += 1) {
      start = sentence.indexOf(issue.originalText, from);
      assert.notEqual(start, -1, `Missing test fragment: ${issue.originalText}`);
      from = start + issue.originalText.length;
    }
    return {
      start,
      end: start + issue.originalText.length,
      suggestedText: issue.replacementText
    };
  });
  return applyGrammarIssues(sentence, positioned);
}

function grammarAiResponse(sentence, issues, correctedSentence = applyGrammarAiPayload(sentence, issues)) {
  return { response: { correctedSentence, issues } };
}

function applyGrammarIssues(sentence, issues) {
  return [...issues]
    .sort((left, right) => right.start - left.start)
    .reduce((value, issue) => (
      `${value.slice(0, issue.start)}${issue.suggestedText}${value.slice(issue.end)}`
    ), sentence);
}

function grammarCheckRequest(sentence, overrides = {}) {
  return new Request("https://worker.example/v1/grammar-check", {
    method: "POST",
    headers: {
      Origin: ORIGIN,
      Authorization: `Bearer ${STUDENT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sentence }),
    ...overrides
  });
}

/* Retired architecture tests: grammar-specific allowlists and sentence morphology
 * gates were intentionally removed. General correction integrity is exercised by
 * general-correction.test.mjs and generalization.test.mjs instead.
test("deterministic diff derives atomic UTF-16 edits without trusting model coordinates", () => {
  const fixtures = [
    {
      source: "Tommy write a book call \"Super book\".",
      target: "Tommy writes a book called \"Super book\".",
      expected: [[6, 11, "write", "writes"], [19, 23, "call", "called"]]
    },
    {
      source: "Tom is run a system call \"Super Book\".",
      target: "Tom is running a system called \"Super Book\".",
      expected: [[7, 10, "run", "running"], [20, 24, "call", "called"]]
    },
    {
      source: "Sarah write a poem call \"My Home\".",
      target: "Sarah writes a poem called \"My Home\".",
      expected: [[6, 11, "write", "writes"], [19, 23, "call", "called"]]
    },
    {
      source: "Yesterday, he was write a story call “Home”.",
      target: "Yesterday, he was writing a story called “Home”.",
      expected: [[18, 23, "write", "writing"], [32, 36, "call", "called"]]
    },
    {
      source: "She likes read books.",
      target: "She likes to read books.",
      expected: [[10, 14, "read", "to read"]]
    },
    {
      source: "He bought book.",
      target: "He bought a book.",
      expected: [[10, 14, "book", "a book"]]
    },
    {
      source: "They work study together.",
      target: "They work and study together.",
      expected: [[10, 15, "study", "and study"]]
    },
    {
      source: "He wants to to swim.",
      target: "He wants to swim.",
      expected: [[12, 19, "to swim", "swim"]]
    },
    {
      source: "They go to the school every day.",
      target: "They go to school every day.",
      expected: [[11, 21, "the school", "school"]]
    },
    {
      source: "😀 Tom write books.",
      target: "😀 Tom writes books.",
      expected: [[7, 12, "write", "writes"]]
    },
    {
      source: "Yesterday Tom walk home.",
      target: "Yesterday Tom walked home.",
      expected: [[14, 18, "walk", "walked"]]
    },
    {
      source: "Tom write—'Super book'.",
      target: "Tom writes—'Super book'.",
      expected: [[4, 9, "write", "writes"]]
    },
    {
      source: "Gary love watch movie in morning.",
      target: "Gary loves watching movies in the morning.",
      expected: [
        [5, 9, "love", "loves"],
        [10, 15, "watch", "watching"],
        [16, 21, "movie", "movies"],
        [25, 32, "morning", "the morning"]
      ]
    },
    {
      source: "He go to park first then run at school.",
      target: "He goes to the park first, then runs at school.",
      expected: [
        [3, 5, "go", "goes"],
        [9, 13, "park", "the park"],
        [19, 24, " then", ", then"],
        [25, 28, "run", "runs"]
      ]
    },
    {
      source: "He goes to park first then run at school.",
      target: "He goes to the park first and then runs at school.",
      expected: [
        [11, 15, "park", "the park"],
        [22, 26, "then", "and then"],
        [27, 30, "run", "runs"]
      ]
    }
  ];

  for (const { source, target, expected } of fixtures) {
    const hunks = deterministicDiffTokenHunks(source, target);
    assert.ok(hunks, source);
    assert.deepEqual(
      hunks.map((hunk) => [hunk.start, hunk.end, hunk.originalText, hunk.replacementText]),
      expected,
      source
    );
    assert.ok(hunks.every((hunk) => (
      hunk.originalText
      && hunk.replacementText
      && source.slice(hunk.start, hunk.end) === hunk.originalText
    )));
    for (let index = 1; index < hunks.length; index += 1) {
      assert.ok(hunks[index - 1].end <= hunks[index].start, source);
    }
    const reconstructed = [...hunks]
      .sort((left, right) => right.start - left.start)
      .reduce((value, hunk) => (
        `${value.slice(0, hunk.start)}${hunk.replacementText}${value.slice(hunk.end)}`
      ), source);
    assert.equal(reconstructed, target, source);
  }
});

test("deterministic diff rejects broad rewrites and unsafe replacements", () => {
  for (const [source, target] of [
    ["Tom likes tea.", "Mary hates dogs."],
    ["Tom is bad.", "Kill them now."],
    ["He reads books.", "She burns houses."],
    ["Tom write a book.", "Mary sings loudly."],
    ["Tom bought 2 books.", "Tom sold 2 cars."],
    ["Tom writes \"X\".", "Mary sings \"X\"."],
    ["He is kind.", "He is king."],
    ["Tom likes tea.", "Tim likes pies."],
    ["Tom likes cats and hates dogs.", "Tom hates cats and likes dogs."],
    ["Tom gives Mary a book.", "Mary gives Tom a book."],
    ["The red team beat the blue team.", "The blue team beat the red team."],
    ["Students help teachers.", "Teachers help students."],
    ["Tom likes \"A\" but hates \"B\".", "Tom hates \"A\" but likes \"B\"."],
    ["Tom can swim.", "Tom cannot swim."],
    ["Tom often studies.", "Tom never studies."],
    ["Tom travelled to London.", "Tom travelled from London."],
    ["Tom told him.", "Tom told her."],
    ["Tom stayed because it rained.", "Tom stayed although it rained."],
    ["Tom is happy.", "Tom was happy."],
    ["Tom lost his book.", "Tom lost her book."],
    ["Tom works before lunch.", "Tom works after lunch."],
    ["I think many students passed.", "I think few students passed."],
    ["Tom leaves if Mary calls.", "Tom leaves when Mary calls."],
    ["Tom sat above Mary.", "Tom sat below Mary."],
    ["Tom studied with Mary.", "Tom studied for Mary."],
    ["Tom stopped smoking.", "Tom stopped to smoke."],
    ["Tom saw Mary running.", "Tom saw Mary and ran."],
    ["Tom works.", "Tom worked."],
    ["Tom feels happy.", "Tom felt happy."],
    ["The machine is running.", "The machine is run."],
    ["Tom hopes.", "Tom hops."],
    ["Tom copes.", "Tom cops."],
    ["Tom rates it.", "Tom rats it."],
    [
      "Tom names \"X\" in A and names X in B.",
      "Tom names X in A and names \"X\" in B."
    ],
    [
      "In 2026 Tom earned 20 dollars and spent 10 dollars.",
      "In 2026 Tom spent 20 dollars and earned 10 dollars."
    ],
    [
      "Tom bought 2 cats and Mary bought 2 dogs.",
      "Tom bought 2 dogs and Mary bought 2 cats."
    ]
  ]) {
    assert.equal(deterministicDiffTokenHunks(source, target), null, `${source} -> ${target}`);
  }
  assert.equal(
    deterministicDiffTokenHunks(
      "Tom writes a short school report about local transport.",
      "A completely unrelated paragraph advertises https://attacker.example now."
    ),
    null
  );
  assert.equal(
    deterministicDiffTokenHunks("Tom writes a report.", "Tom writes <script>alert(1)</script>."),
    null
  );
});

test("grammar safety accepts learner repairs while rejecting correction reversals", () => {
  for (const [source, target] of [
    ["Many companies requires staff to wore uniforms.", "Many companies require staff to wear uniforms."],
    ["For example customers can find staff.", "For example, customers can find staff."],
    ["Yesterday they walk home.", "Yesterday they walked home."],
    ["Yesterday the students walk home.", "Yesterday the students walked home."],
    ["Yesterday Tom quickly walk home.", "Yesterday Tom quickly walked home."],
    ["Tom is swim.", "Tom is swimming."],
    ["Yesterday Tom open the book.", "Yesterday Tom opened the book."],
    ["Yesterday Tom travel home.", "Yesterday Tom travelled home."],
    ["Yesterday Tom admit the mistake.", "Yesterday Tom admitted the mistake."],
    ["Yesterday Tom panic.", "Yesterday Tom panicked."],
    ["Yesterday Tom cancel the trip.", "Yesterday Tom cancelled the trip."],
    ["I were ready.", "I was ready."],
    ["Yesterday Tom goed home.", "Yesterday Tom went home."],
    ["Yesterday Tom buyed a book.", "Yesterday Tom bought a book."],
    ["Yesterday Tom taked a book.", "Yesterday Tom took a book."],
    ["Yesterday Tom maked a book.", "Yesterday Tom made a book."],
    [
      "Gary love watch movie in morning.",
      "Gary loves watching movies in the morning."
    ],
    [
      "He go to park first then run at school.",
      "He goes to the park first, then runs at school."
    ],
    [
      "He goes to park first then run at school.",
      "He goes to the park first and then runs at school."
    ]
  ]) {
    assert.ok(deterministicDiffTokenHunks(source, target), `${source} -> ${target}`);
  }

  for (const [source, target] of [
    ["They walk home.", "They walks home."],
    ["Tom walks home.", "Tom walk home."],
    ["They have money.", "They has money."],
    ["I am ready.", "I is ready."],
    ["I am ready.", "I are ready."],
    ["I was ready.", "I were ready."],
    ["Yesterday Tom went home.", "Yesterday Tom goed home."],
    ["Yesterday Tom bought a book.", "Yesterday Tom buyed a book."],
    ["Yesterday Tom took a book.", "Yesterday Tom taked a book."],
    ["Yesterday Tom made a book.", "Yesterday Tom maked a book."],
    ["They are ready.", "They is ready."],
    ["He saw a log.", "He saws a log."],
    ["Tom wishes.", "Tom wishe."],
    ["Tom watches.", "Tom watche."],
    ["Tom is cycling.", "Tom is cycl."],
    ["Tom sees dogs.", "Tom sees a dogs."],
    ["Tom bought information.", "Tom bought an information."],
    ["Dogs bark.", "Dogs are bark."],
    ["Let's eat, Grandma.", "Let's eat Grandma."],
    ["Tom left. Mary stayed.", "Tom left Mary stayed."],
    ["They go to school.", "They go to the school."],
    ["Tom works in office.", "Tom works in the office."],
    ["Tom goes to university.", "Tom goes to the university."],
    ["He wants to park.", "He wants to the park."],
    ["She likes to park.", "She likes to the park."],
    ["Tom runs first then rests.", "Tom, runs first then rests."],
    ["Tom runs quickly.", "Tom runs and then quickly."],
    [
      "The boys go to park first then run.",
      "The boys go to the park first, then runs."
    ],
    [
      "Many students go to park first then run.",
      "Many students go to the park first, then runs."
    ],
    [
      "Students go to park first then run.",
      "Students go to the park first, then runs."
    ],
    [
      "Mice go to park first then run.",
      "Mice go to the park first, then runs."
    ],
    [
      "He says they go to park first then run.",
      "He says they go to the park first, then runs."
    ],
    [
      "They say he goes to park first then runs.",
      "They say he goes to the park first, then run."
    ]
  ]) {
    assert.equal(deterministicDiffTokenHunks(source, target), null, `${source} -> ${target}`);
  }
});
*/

test("health keeps the core service independent and reports grammar AI readiness separately", async () => {
  const complete = await worker.fetch(
    new Request("https://worker.example/v1/health"),
    environment()
  );
  assert.equal(complete.status, 200);
  const completeBody = await complete.json();
  assert.equal(completeBody.ok, true);
  assert.equal(completeBody.grammarAi.configured, true);
  assert.equal(completeBody.grammarAi.version, "2026-08-01.11");
  assert.equal(Object.hasOwn(completeBody.grammarAi, "model"), false);
  assert.equal(Object.hasOwn(completeBody.grammarAi, "repairModel"), false);
  assert.equal(completeBody.grammarCorpus.version, "2026-08-02.2");
  assert.equal(completeBody.grammarCorpus.approvedSentenceCount, 14);
  assert.equal(Object.hasOwn(completeBody.grammarCorpus, "execution"), false);
  assert.equal(completeBody.rateLimiters.grammarCheck, true);

  const noAi = environment();
  delete noAi.AI;
  const noAiResponse = await worker.fetch(
    new Request("https://worker.example/v1/health"),
    noAi
  );
  assert.equal(noAiResponse.status, 200);
  const noAiBody = await noAiResponse.json();
  assert.equal(noAiBody.ok, true);
  assert.equal(noAiBody.grammarAi.configured, false);

  const noGrammarCheckLimiter = environment();
  delete noGrammarCheckLimiter.GRAMMAR_CHECK_RATE_LIMITER;
  const noLimiterResponse = await worker.fetch(
    new Request("https://worker.example/v1/health"),
    noGrammarCheckLimiter
  );
  assert.equal(noLimiterResponse.status, 200);
  const noLimiterBody = await noLimiterResponse.json();
  assert.equal(noLimiterBody.ok, true);
  assert.equal(noLimiterBody.rateLimiters.grammarCheck, false);

  const missing = environment();
  delete missing.GRAMMAR_WRITE_RATE_LIMITER;
  const incomplete = await worker.fetch(
    new Request("https://worker.example/v1/health"),
    missing
  );
  assert.equal(incomplete.status, 503);
  assert.equal((await incomplete.json()).ok, false);
});

test("missing grammar AI bindings do not disable existing writing service routes", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const env = environment();
  delete env.AI;
  delete env.GRAMMAR_CHECK_RATE_LIMITER;
  const response = await worker.fetch(new Request(
    "https://worker.example/v1/student/me",
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), env);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.student.id, STUDENT_ID);
  assert.deepEqual(body.student.access, {
    "dse-writing": true,
    "government-writing": true,
    "ielts-writing": false
  });
});

test("student profile permissions fail closed when Supabase returns malformed access", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") {
      return jsonResponse(studentProfile({ access: { "ielts-writing": "false" } }));
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    "https://worker.example/v1/student/me",
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(response.status, 502);
  assert.equal((await response.json()).code, "INVALID_UPSTREAM_RESPONSE");
});

test("student profile ignores reserved admin-message metadata but validates real permissions", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") {
      return jsonResponse(studentProfile({
        access: {
          __adminMessage: "Please revise the assigned vocabulary first.",
          "dse-writing": true,
          "ielts-writing": false
        }
      }));
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    "https://worker.example/v1/student/me",
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).student.access, {
    "dse-writing": true,
    "ielts-writing": false
  });
});

test("student profile rejects non-reserved string metadata in the permission map", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") {
      return jsonResponse(studentProfile({
        access: {
          __adminMessage: "Known metadata",
          __unexpectedMetadata: "must fail closed",
          "ielts-writing": true
        }
      }));
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    "https://worker.example/v1/student/me",
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(response.status, 502);
  assert.equal((await response.json()).code, "INVALID_UPSTREAM_RESPONSE");
});

test("an exact teacher-approved corpus sentence works without AI or an extra Supabase lookup", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let rpcCount = 0;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    rpcCount += 1;
    if (rpc.name === "writing_submission_student_profile") {
      assert.deepEqual(rpc.body, { p_token: STUDENT_TOKEN });
      return jsonResponse(studentProfile());
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const env = environment();
  const ai = env.AI;
  delete env.AI;
  const sentence = "This policy have several advantage for both workers and customer.";
  const response = await worker.fetch(grammarCheckRequest(sentence), env);
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);

  assert.equal(body.engine.name, "edmund-approved-grammar-corpus");
  assert.equal(body.engine.version, "2026-08-02.2");
  assert.equal(body.corpus.paragraphId, "PARA-0001");
  assert.equal(body.corpus.sentenceId, "PARA-0001-S02");
  assert.equal(body.issues.length, 3);
  assert.equal(
    applyGrammarIssues(sentence, body.issues),
    "This policy has several advantages for both workers and customers."
  );
  assert.equal(ai.calls.length, 0);
  assert.equal(rpcCount, 1, "only the existing student-authentication RPC may run");
  assert.equal(response.headers.get("Cache-Control"), "no-store");

  const alreadyCorrect = "This policy has several advantages for both workers and customers.";
  const cleanResponse = await worker.fetch(grammarCheckRequest(alreadyCorrect), env);
  const cleanText = await cleanResponse.text();
  assert.equal(cleanResponse.status, 200, cleanText);
  const cleanBody = JSON.parse(cleanText);
  assert.equal(cleanBody.engine.name, "edmund-approved-grammar-corpus");
  assert.deepEqual(cleanBody.issues, []);
  assert.equal(ai.calls.length, 0);
  assert.equal(rpcCount, 2, "each request performs authentication and no corpus storage lookup");
});

test("protected routes enforce the exact configured origin before Supabase", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let upstreamCalled = false;
  globalThis.fetch = async () => {
    upstreamCalled = true;
    throw new Error("must not be called");
  };

  const response = await worker.fetch(new Request("https://worker.example/v1/student/me", {
    headers: { Origin: BAD_ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` }
  }), environment());
  assert.equal(response.status, 403);
  assert.equal((await response.json()).code, "ORIGIN_NOT_ALLOWED");
  assert.equal(upstreamCalled, false);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
});

test("Supabase server credentials are trimmed before becoming HTTP headers", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  const key = "s".repeat(64);
  const env = environment();
  delete env.SUPABASE_SERVICE_ROLE_KEY;
  env.SUPABASE_SECRET_KEY = `  ${key}\n`;

  globalThis.fetch = async (_input, init = {}) => {
    const headers = new Headers(init.headers);
    assert.equal(headers.get("apikey"), key);
    assert.equal(headers.get("Authorization"), `Bearer ${key}`);
    return jsonResponse([]);
  };

  const response = await worker.fetch(new Request("https://worker.example/v1/student/me", {
    headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` }
  }), env);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).code, "STUDENT_AUTH_REQUIRED");
});

test("70B audit materializes every safe edit from correctedSentence despite malformed advisory metadata", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let rpcCount = 0;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    rpcCount += 1;
    if (rpc.name === "writing_submission_student_profile") {
      assert.deepEqual(rpc.body, { p_token: STUDENT_TOKEN });
      return jsonResponse(studentProfile());
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "Several applicant was send the form late.";
  const correctedSentence = "Several applicants sent the form late.";
  const ai = aiBinding({
    response: {
      correctedSentence,
      issues: [
        null,
        { category: "not-a-category" },
        {
          category: "subject_verb_agreement",
          originalText: "not present",
          replacementText: "irrelevant",
          occurrence: 20,
          explanationZhHant: "這是故意錯誤的提示座標。",
          confidence: 0.99
        }
      ]
    }
  });
  const checkLimiter = limiter();
  const response = await worker.fetch(
    grammarCheckRequest(sentence),
    environment({ AI: ai, GRAMMAR_CHECK_RATE_LIMITER: checkLimiter })
  );
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);

  assert.equal(applyGrammarIssues(sentence, body.issues), correctedSentence);
  assert.ok(body.issues.length >= 2);
  assert.ok(body.issues.every((issue) => issue.engine.name === "edmund-advanced-grammar"));
  assert.ok(body.issues.every((issue) => !Object.hasOwn(issue.engine, "model")));
  assert.equal(body.engine.version, "2026-08-01.11");
  assert.equal(ai.calls.length, 2);
  assert.ok(ai.calls.every((call) => call.model === "@cf/meta/llama-3.3-70b-instruct-fp8-fast"));
  assert.equal(ai.calls[0].request.temperature, 0);
  assert.equal(ai.calls[0].request.response_format.type, "json_schema");
  assert.equal(ai.calls[0].request.seed, 5194);
  assert.equal(ai.calls[1].request.seed, 95194);
  assert.match(ai.calls[1].request.messages[1].content, /Perform a fresh final audit/);
  assert.deepEqual(checkLimiter.calls, [{ key: `writing-submission-grammar-check:${STUDENT_ID}` }]);
  assert.equal(rpcCount, 1, "grammar checking authenticates but never writes student text to storage");
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("unsafe 70B generation and audit trigger one independent 8B review of the original sentence", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "The office order 3 replacement screen.";
  const correctedSentence = "The office ordered 3 replacement screens.";
  const ai = aiSequence(
    { response: { correctedSentence: "The office ordered 4 replacement screens.", issues: [] } },
    { response: { correctedSentence: "The office ordered 4 replacement screens.", issues: [] } },
    { response: { correctedSentence, issues: [] } }
  );
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);

  assert.equal(applyGrammarIssues(sentence, body.issues), correctedSentence);
  assert.equal(ai.calls.length, 3);
  assert.deepEqual(
    ai.calls.map((call) => call.model),
    [
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      "@cf/meta/llama-3.1-8b-instruct-fast"
    ]
  );
  assert.deepEqual(
    ai.calls[2].request.messages,
    ai.calls[0].request.messages,
    "fallback must receive the original sentence, not the rejected primary proposal"
  );
  assert.ok(body.issues.every((issue) => issue.engine.name === "edmund-advanced-grammar"));
  assert.ok(body.issues.every((issue) => !Object.hasOwn(issue.engine, "model")));
});

test("audit completes errors that the primary corrected sentence missed", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "The assistant prepare reports and check every figure.";
  const primaryTarget = "The assistant prepares reports and check every figure.";
  const auditedTarget = "The assistant prepares reports and checks every figure.";
  const ai = aiSequence(
    { response: { correctedSentence: primaryTarget, issues: [] } },
    { response: { correctedSentence: auditedTarget, issues: [] } }
  );
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);

  assert.equal(applyGrammarIssues(sentence, body.issues), auditedTarget);
  assert.equal(ai.calls.length, 2);
  assert.equal(ai.calls[0].request.seed, 5194);
  assert.equal(ai.calls[1].request.seed, 95194);
  const auditContent = ai.calls[1].request.messages[1].content;
  const auditPayload = JSON.parse(auditContent.slice(auditContent.lastIndexOf("\n") + 1));
  assert.deepEqual({
    originalSentence: auditPayload.originalSentence,
    proposedCorrectedSentence: auditPayload.proposedCorrectedSentence
  }, {
    originalSentence: sentence,
    proposedCorrectedSentence: primaryTarget
  });
  assert.ok(Array.isArray(auditPayload.teacherApprovedPatternGuides));
  assert.ok(auditPayload.teacherApprovedPatternGuides.length > 0);
  assert.ok(auditPayload.teacherApprovedPatternGuides.length <= 3);
  for (const guide of auditPayload.teacherApprovedPatternGuides) {
    assert.deepEqual(Object.keys(guide).sort(), [
      "categories",
      "correctedSentence",
      "explanationZhHant",
      "sourceSentence"
    ]);
    assert.notEqual(guide.sourceSentence, sentence);
    assert.ok(Array.isArray(guide.categories));
    assert.ok(guide.categories.length > 0);
    assert.equal(typeof guide.correctedSentence, "string");
    assert.equal(typeof guide.explanationZhHant, "string");
  }
});

test("audit can make bounded phrase/countability and conditional-modal repairs", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  for (const { sentence, auditedTarget } of [
    {
      sentence: "The project has many equipment.",
      auditedTarget: "The project has a lot of equipment."
    },
    {
      sentence: "If staff would arrive early, the office will open on time.",
      auditedTarget: "If staff arrive early, the office will open on time."
    }
  ]) {
    const ai = aiSequence(
      { response: { correctedSentence: sentence, issues: [] } },
      { response: { correctedSentence: auditedTarget, issues: [] } }
    );
    const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
    const responseText = await response.text();
    assert.equal(response.status, 200, responseText);
    const body = JSON.parse(responseText);
    assert.equal(applyGrammarIssues(sentence, body.issues), auditedTarget);
    assert.equal(ai.calls.length, 2);
    assert.ok(body.issues.every((issue) => issue.engine.name === "edmund-advanced-grammar"));
    assert.ok(body.issues.every((issue) => !Object.hasOwn(issue.engine, "model")));
  }
});

test("audit reversal to the unchanged source cannot erase a valid changed primary", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "The machine operate safely.";
  const primaryTarget = "The machine operates safely.";
  const ai = aiSequence(
    { response: { correctedSentence: primaryTarget, issues: [] } },
    { response: { correctedSentence: sentence, issues: [] } }
  );
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);

  assert.equal(applyGrammarIssues(sentence, body.issues), primaryTarget);
  assert.notDeepEqual(body.issues, []);
  assert.equal(ai.calls.length, 2);
});

test("70B provider failures retain strict-primary and independent-8B fallbacks", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "The machine operate safely.";
  const correctedSentence = "The machine operates safely.";

  const auditFailure = aiSequence(
    { response: { correctedSentence, issues: [] } },
    new Error("audit unavailable")
  );
  const primaryResponse = await worker.fetch(
    grammarCheckRequest(sentence),
    environment({ AI: auditFailure })
  );
  assert.equal(primaryResponse.status, 200);
  assert.equal(
    applyGrammarIssues(sentence, (await primaryResponse.json()).issues),
    correctedSentence
  );
  assert.equal(auditFailure.calls.length, 2);

  const both70Unavailable = aiSequence(
    new Error("primary unavailable"),
    new Error("audit unavailable"),
    { response: { correctedSentence, issues: [] } }
  );
  const fallbackResponse = await worker.fetch(
    grammarCheckRequest(sentence),
    environment({ AI: both70Unavailable })
  );
  const fallbackText = await fallbackResponse.text();
  assert.equal(fallbackResponse.status, 200, fallbackText);
  const fallbackBody = JSON.parse(fallbackText);
  assert.equal(applyGrammarIssues(sentence, fallbackBody.issues), correctedSentence);
  assert.deepEqual(
    both70Unavailable.calls.map((call) => call.model),
    [
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
      "@cf/meta/llama-3.1-8b-instruct-fast"
    ]
  );
});

/* Retired exact-example tests. Model issue maps are advisory in the general
 * pipeline, and token boundaries need only reconstruct the full safe target.
test("authenticated grammar checking returns three normalized issues for the Tommy sentence", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "Tommy need book to reading better.";
  const issues = [
    grammarAiIssue(),
    grammarAiIssue({
      category: "article_or_determiner",
      originalText: "book",
      replacementText: "a book",
      explanationZhHant: "book 是單數可數名詞，這裡需要冠詞 a。",
      confidence: 0.97
    }),
    grammarAiIssue({
      category: "infinitive_or_gerund",
      originalText: "reading",
      replacementText: "read",
      explanationZhHant: "to 後面要用動詞原形，所以用 read。",
      confidence: 0.96
    })
  ];
  const ai = aiBinding(grammarAiResponse(sentence, issues));
  const checkLimiter = limiter();
  const response = await worker.fetch(
    grammarCheckRequest(sentence),
    environment({ AI: ai, GRAMMAR_CHECK_RATE_LIMITER: checkLimiter })
  );
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);
  assert.equal(body.engine.name, "edmund-advanced-grammar");
  assert.equal(Object.hasOwn(body.engine, "model"), false);
  assert.deepEqual(body.issues.map((issue) => issue.originalText), ["need", "book", "reading"]);
  assert.deepEqual(body.issues.map((issue) => issue.suggestedText), ["needs", "a book", "read"]);
  assert.equal(body.issues[0].correctedSentence, "Tommy needs book to reading better.");
  assert.equal(body.issues[1].correctedSentence, "Tommy need a book to reading better.");
  assert.equal(body.issues[2].correctedSentence, "Tommy need book to read better.");
  assert.equal(ai.calls.length, 3);
  assert.equal(ai.calls[0].model, "@cf/meta/llama-3.1-8b-instruct-fast");
  assert.equal(ai.calls[0].request.temperature, 0);
  assert.equal(ai.calls[0].request.response_format.type, "json_schema");
  assert.match(ai.calls[0].request.messages[0].content, /inspect the ENTIRE sentence/);
  assert.match(ai.calls[0].request.messages[0].content, /Tom read a book feel exciting\./);
  assert.match(ai.calls[0].request.messages[0].content, /do NOT change read to reads/);
  assert.deepEqual(checkLimiter.calls, [{ key: `writing-submission-grammar-check:${STUDENT_ID}` }]);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("Tom love eat food returns both independent corrections and advertises the exact contract", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "Tom love eat food.";
  const ai = aiBinding(grammarAiResponse(sentence, tomLoveIssues()));
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);
  assert.deepEqual(
    body.issues.map((issue) => [issue.originalText, issue.suggestedText]),
    [["love", "loves"], ["eat", "to eat"]]
  );
  assert.equal(applyGrammarIssues(sentence, body.issues), "Tom loves to eat food.");
  assert.equal(ai.calls.length, 1);

  const request = ai.calls[0].request;
  assert.equal(
    request.response_format.json_schema.properties.issues.items.properties.confidence.minimum,
    0.75
  );
  assert.deepEqual(
    request.response_format.json_schema.required,
    ["correctedSentence", "issues"]
  );
  assert.match(request.messages[0].content, /Student sentence: Tom love eat food\./);
  assert.match(request.messages[0].content, /love -> loves; occurrence 1/);
  assert.match(request.messages[0].content, /eat -> to eat; occurrence 1/);
});

test("dependent verb phrases combine into one coherent hate-school correction", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "Tom hate go school but enjoy watch movie.";
  const correctedSentence = "Tom hates going to school but enjoys watching movies.";
  const ai = aiBinding(grammarAiResponse(sentence, hateSchoolIssues(), correctedSentence));
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);
  assert.deepEqual(
    body.issues.map((issue) => [issue.originalText, issue.suggestedText]),
    [
      ["hate", "hates"],
      ["go school", "going to school"],
      ["enjoy", "enjoys"],
      ["watch movie", "watching movies"]
    ]
  );
  assert.equal(applyGrammarIssues(sentence, body.issues), correctedSentence);
  assert.equal(body.engine.version, "2026-08-01.7");

  const prompt = ai.calls[0].request.messages[0].content;
  assert.match(prompt, /Tom hate go school but enjoy watch movie\./);
  assert.match(prompt, /Tom hates going to school but enjoys watching movies\./);
  assert.match(prompt, /enjoy, avoid, finish, keep, mind, suggest, consider and practise take an -ing verb/);
  assert.match(prompt, /institutional activity is "go to school", with no a or the/);
  assert.match(prompt, /smallest self-contained replacement/);
});

test("ambiguous read keeps its possible past tense and corrects the complete remainder", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "Tom read a book feel exciting.";
  const issues = [
    grammarAiIssue({
      category: "sentence_structure",
      originalText: "feel exciting",
      replacementText: "and felt excited",
      explanationZhHant: "句子要用 and 連接動作，felt 配合 read，而人的感受用 excited。",
      confidence: 0.97
    })
  ];
  const ai = aiBinding(grammarAiResponse(sentence, issues));
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);
  assert.deepEqual(
    body.issues.map((issue) => [issue.originalText, issue.suggestedText]),
    [["feel exciting", "and felt excited"]]
  );
  assert.equal(body.issues.some((issue) => issue.originalText === "read"), false);
  assert.equal(body.issues[0].correctedSentence, "Tom read a book and felt excited.");
});

test("an ambiguous read-to-reads guess invalidates the complete AI result", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = () => {};
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const sentence = "Tom read a book feel exciting.";
  const readIssue = grammarAiIssue({
    originalText: "read",
    replacementText: "reads",
    explanationZhHant: "模型嘗試猜測現在式。",
    confidence: 0.99
  });
  const ai = aiBinding(grammarAiResponse(sentence, [readIssue]));
  const response = await worker.fetch(
    grammarCheckRequest(sentence),
    environment({ AI: ai })
  );
  assert.equal(response.status, 502);
  assert.equal((await response.json()).code, "GRAMMAR_CHECK_INCONCLUSIVE");
  assert.equal(ai.calls.length, 2);

  for (const issue of [
    grammarAiIssue({
      category: "verb_form_or_tense",
      originalText: "read",
      replacementText: "reads",
      explanationZhHant: "模型改用了另一個分類。",
      confidence: 0.99
    }),
    grammarAiIssue({
      category: "word_form",
      originalText: "Tom read",
      replacementText: "Tom reads",
      explanationZhHant: "模型改用了較闊的文字範圍。",
      confidence: 0.99
    }),
    grammarAiIssue({
      category: "sentence_structure",
      originalText: "read a book feel exciting",
      replacementText: "reads a book and feels excited",
      explanationZhHant: "模型把相反時態改動藏在較大的句子重寫中。",
      confidence: 0.99
    })
  ]) {
    const variant = await worker.fetch(
      grammarCheckRequest(sentence),
      environment({ AI: aiBinding(grammarAiResponse(sentence, [issue])) })
    );
    assert.equal(variant.status, 502);
    assert.equal((await variant.json()).code, "GRAMMAR_CHECK_INCONCLUSIVE");
  }

});
*/

test("a grammatically acceptable control returns an empty issue list without storage", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let rpcCount = 0;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    rpcCount += 1;
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const sentence = "Tommy needs a book to read better.";
  const ai = aiBinding(grammarAiResponse(sentence, []));
  const response = await worker.fetch(
    grammarCheckRequest(sentence),
    environment({ AI: ai })
  );
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).issues, []);
  assert.equal(ai.calls.length, 2);
  assert.ok(ai.calls.every((call) => call.model === "@cf/meta/llama-3.3-70b-instruct-fp8-fast"));
  assert.equal(rpcCount, 1, "grammar checking must authenticate but must not write to storage");
});

/* Retired: correctedSentence is now authoritative and issue metadata is advisory.
test("an empty issue list may not claim a different correctedSentence", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "Tom enjoys watching movies.";
  const ai = aiSequence(
    grammarAiResponse(sentence, [], "Tom enjoys watching films."),
    grammarAiResponse(sentence, [])
  );
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  assert.deepEqual(JSON.parse(responseText).issues, []);
  assert.equal(ai.calls.length, 2);
});
*/

test("grammar checking enforces origin, authentication and rate limits before AI", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });

  const originAi = aiBinding();
  let upstreamCalls = 0;
  globalThis.fetch = async () => {
    upstreamCalls += 1;
    throw new Error("must not be called for a rejected origin");
  };
  const badOrigin = await worker.fetch(
    grammarCheckRequest("Tommy need book.", {
      headers: {
        Origin: BAD_ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      }
    }),
    environment({ AI: originAi })
  );
  assert.equal(badOrigin.status, 403);
  assert.equal(originAi.calls.length, 0);
  assert.equal(upstreamCalls, 0);

  const authAi = aiBinding();
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    assert.equal(rpc.name, "writing_submission_student_profile");
    return jsonResponse([]);
  };
  const authLimiter = limiter();
  const unauthenticated = await worker.fetch(
    grammarCheckRequest("Tommy need book."),
    environment({ AI: authAi, GRAMMAR_CHECK_RATE_LIMITER: authLimiter })
  );
  assert.equal(unauthenticated.status, 401);
  assert.equal(authAi.calls.length, 0);
  assert.equal(authLimiter.calls.length, 0);

  const rateAi = aiBinding();
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    assert.equal(rpc.name, "writing_submission_student_profile");
    return jsonResponse(studentProfile());
  };
  const denied = limiter(false);
  const rateLimited = await worker.fetch(
    grammarCheckRequest("Tommy need book."),
    environment({ AI: rateAi, GRAMMAR_CHECK_RATE_LIMITER: denied })
  );
  assert.equal(rateLimited.status, 429);
  assert.equal((await rateLimited.json()).code, "TOO_MANY_GRAMMAR_CHECKS");
  assert.equal(rateLimited.headers.get("Retry-After"), "60");
  assert.deepEqual(denied.calls, [{ key: `writing-submission-grammar-check:${STUDENT_ID}` }]);
  assert.equal(rateAi.calls.length, 0);
});

test("grammar check bodies must have the exact shape and a completed sentence", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const ai = aiBinding();
  const unfinished = await worker.fetch(
    grammarCheckRequest("Tommy need book"),
    environment({ AI: ai })
  );
  assert.equal(unfinished.status, 400);
  assert.equal((await unfinished.json()).code, "INVALID_GRAMMAR_CHECK");

  const extraField = await worker.fetch(new Request(
    "https://worker.example/v1/grammar-check",
    {
      method: "POST",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sentence: "Tommy need book.", documentId: SUBMISSION_ID })
    }
  ), environment({ AI: ai }));
  assert.equal(extraField.status, 400);
  assert.equal((await extraField.json()).code, "INVALID_GRAMMAR_CHECK");
  assert.equal(ai.calls.length, 0);
});

test("Workers AI daily quota exhaustion stops retries and returns a specific private response", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const logs = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = (...values) => { logs.push(values.join(" ")); };
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "A completely unseen learner sentence has several errors.";
  const quotaError = Object.assign(
    new Error("4006: you have used up your daily free allocation"),
    { code: 4006 }
  );
  const ai = aiBinding(quotaError);
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.deepEqual(body, {
    error: "Advanced grammar checking daily allowance is exhausted; it resets at 08:00 Hong Kong time",
    code: "GRAMMAR_CHECK_QUOTA_EXHAUSTED"
  });
  assert.equal(ai.calls.length, 1, "a known daily quota failure must not trigger two more model attempts");
  assert.deepEqual(logs, ["Writing Submission grammar daily quota was exhausted"]);
  assert.equal(JSON.stringify(body).includes(sentence), false);
  assert.equal(JSON.stringify(body).includes("4006"), false);
});

test("provider rate limits and timeouts stop model repeats and expose precise private codes", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const logs = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = (...values) => { logs.push(values.join(" ")); };
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "A private learner sentence needs provider review.";
  const fixtures = [
    {
      error: Object.assign(new Error("private-provider-rate-detail"), { status: 429 }),
      status: 429,
      code: "GRAMMAR_CHECK_PROVIDER_RATE_LIMITED",
      retryAfter: "60",
      log: "Writing Submission grammar provider rate limited"
    },
    {
      error: Object.assign(new Error("private-provider-timeout-detail"), { status: 504 }),
      status: 504,
      code: "GRAMMAR_CHECK_PROVIDER_TIMEOUT",
      retryAfter: null,
      log: "Writing Submission grammar provider timed out"
    }
  ];

  for (const fixture of fixtures) {
    const ai = aiBinding(fixture.error);
    const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
    const body = await response.json();
    assert.equal(response.status, fixture.status);
    assert.equal(body.code, fixture.code);
    assert.equal(response.headers.get("Retry-After"), fixture.retryAfter);
    assert.equal(ai.calls.length, 1, "quota-like provider limits must not start another inference");
    assert.equal(JSON.stringify(body).includes(sentence), false);
    assert.equal(JSON.stringify(body).includes(fixture.error.message), false);
  }
  assert.deepEqual(logs, fixtures.map((fixture) => fixture.log));
  assert.equal(logs.some((entry) => entry.includes(sentence)), false);
  assert.equal(logs.some((entry) => fixtures.some((fixture) => entry.includes(fixture.error.message))), false);
});

/* Retired 8B-first, exact whitelist, and grammar-specific deterministic retry tests.
 * The replacement suite above exercises the 70B-first general pipeline.
test("an invalid first grammar result is retried once and returns the complete valid result", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const logs = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = (...values) => { logs.push(values.join(" ")); };
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "Tom love eat food.";
  const ai = aiSequence(
    {
      response: {
        correctedSentence: sentence,
        issues: [grammarAiIssue({
          originalText: "students",
          replacementText: "student",
          explanationZhHant: "這是不存在於原句的幻覺片段。"
        })]
      }
    },
    grammarAiResponse(sentence, tomLoveIssues())
  );
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);
  assert.deepEqual(
    body.issues.map((issue) => [issue.originalText, issue.suggestedText]),
    [["love", "loves"], ["eat", "to eat"]]
  );
  assert.equal(applyGrammarIssues(sentence, body.issues), "Tom loves to eat food.");
  assert.equal(ai.calls.length, 2);
  assert.equal(ai.calls[0].request.seed, 5194);
  assert.equal(ai.calls[1].request.seed, 5195);
  assert.match(ai.calls[1].request.messages[1].content, /previous answer had an unusable edit map/);
  assert.deepEqual(logs, []);
});

test("an incoherent enjoy-school composite is rejected and repaired as a whole", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const logs = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = (...values) => { logs.push(values.join(" ")); };
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "Tom hate go school but enjoy watch movie.";
  const badIssues = [
    grammarAiIssue({ originalText: "hate", replacementText: "hates" }),
    grammarAiIssue({
      category: "infinitive_or_gerund",
      originalText: "go school",
      replacementText: "going to the school"
    }),
    grammarAiIssue({ originalText: "enjoy", replacementText: "enjoys" }),
    grammarAiIssue({
      category: "infinitive_or_gerund",
      originalText: "watch",
      replacementText: "to watch"
    }),
    grammarAiIssue({
      category: "singular_plural",
      originalText: "movie",
      replacementText: "movies"
    })
  ];
  const badCorrectedSentence = "Tom hates going to the school but enjoys to watch movies.";
  assert.equal(applyGrammarAiPayload(sentence, badIssues), badCorrectedSentence);
  const ai = aiSequence(
    grammarAiResponse(sentence, badIssues, badCorrectedSentence),
    grammarAiResponse(
      sentence,
      hateSchoolIssues(),
      "Tom hates going to school but enjoys watching movies."
    )
  );
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);
  assert.equal(
    applyGrammarIssues(sentence, body.issues),
    "Tom hates going to school but enjoys watching movies."
  );
  assert.equal(ai.calls.length, 2);
  assert.equal(ai.calls[1].request.seed, 5195);
  assert.match(
    ai.calls[1].request.messages[1].content,
    /Recheck subject-verb agreement, missing connectors, prepositions and determiners, countability, verb complements/
  );
  assert.deepEqual(logs, []);
});

test("a correctedSentence that does not equal its issues is retried", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "Tom love eat food.";
  const ai = aiSequence(
    grammarAiResponse(sentence, tomLoveIssues(), "Tom loves eating food."),
    grammarAiResponse(sentence, tomLoveIssues())
  );
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);
  assert.equal(applyGrammarIssues(sentence, body.issues), "Tom loves to eat food.");
  assert.equal(ai.calls.length, 2);
});

test("two malformed edit maps recover when both checks agree on the same complete adjective correction", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "The first advantage is the efficient and effective.";
  const correctedSentence = "The first advantage is that it is efficient and effective.";
  const ai = aiSequence(
    grammarAiResponse(sentence, [grammarAiIssue({
      category: "sentence_structure",
      originalText: "The first advantage is",
      replacementText: "The first advantage is that it is",
      explanationZhHant: "需要完整 that 子句。"
    })], correctedSentence),
    grammarAiResponse(sentence, [
      grammarAiIssue({
        category: "sentence_structure",
        originalText: "is",
        replacementText: "that it is",
        explanationZhHant: "需要完整 that 子句。"
      }),
      grammarAiIssue({
        category: "article_or_determiner",
        originalText: "efficient and effective",
        replacementText: "the efficient and effective",
        explanationZhHant: "這個局部建議與完整句子不一致。"
      })
    ], correctedSentence)
  );

  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);
  assert.equal(body.engine.version, "2026-08-01.7");
  assert.equal(body.issues.length, 1);
  assert.equal(body.issues[0].category, "sentence_structure");
  assert.equal(body.issues[0].originalText, "the");
  assert.equal(body.issues[0].suggestedText, "that it is");
  assert.equal(applyGrammarIssues(sentence, body.issues), correctedSentence);
  assert.equal(ai.calls.length, 2);
});

test("the two screenshot sentences accept coherent primary batches in one call", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const fixtures = [
    {
      sentence: "The first advantage is the efficient and effective.",
      correctedSentence: "The first advantage is efficiency and effectiveness.",
      issues: [grammarAiIssue({
        category: "word_form",
        originalText: "the efficient and effective",
        replacementText: "efficiency and effectiveness",
        explanationZhHant: "形容詞要改為名詞作補語。"
      })]
    },
    {
      sentence: "it can to help student do work faster.",
      correctedSentence: "It can help students do work faster.",
      issues: [
        grammarAiIssue({
          category: "spelling_or_spacing",
          originalText: "it",
          replacementText: "It",
          explanationZhHant: "句子開首要用大寫。"
        }),
        grammarAiIssue({
          category: "modal_or_auxiliary",
          originalText: "can to help",
          replacementText: "can help",
          explanationZhHant: "can 後面直接用動詞原形。"
        }),
        grammarAiIssue({
          category: "singular_plural",
          originalText: "student",
          replacementText: "students",
          explanationZhHant: "泛指多名學生要用複數。"
        })
      ]
    }
  ];

  for (const fixture of fixtures) {
    const ai = aiBinding(grammarAiResponse(
      fixture.sentence,
      fixture.issues,
      fixture.correctedSentence
    ));
    const response = await worker.fetch(
      grammarCheckRequest(fixture.sentence),
      environment({ AI: ai })
    );
    const responseText = await response.text();
    assert.equal(response.status, 200, responseText);
    const body = JSON.parse(responseText);
    assert.equal(applyGrammarIssues(fixture.sentence, body.issues), fixture.correctedSentence);
    assert.equal(ai.calls.length, 1);
  }
});

test("every correction survives multi-error sentence batches and malformed-map recovery", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const fixtures = [
    {
      sentence: "Gary love watch movie in morning.",
      correctedSentence: "Gary loves watching movies in the morning.",
      issues: [
        grammarAiIssue({
          originalText: "love",
          replacementText: "loves",
          explanationZhHant: "Gary 是第三身單數，所以一般現在式動詞用 loves。"
        }),
        grammarAiIssue({
          category: "infinitive_or_gerund",
          originalText: "watch",
          replacementText: "watching",
          explanationZhHant: "love 後面可接動名詞 watching。"
        }),
        grammarAiIssue({
          category: "singular_plural",
          originalText: "movie",
          replacementText: "movies",
          explanationZhHant: "泛指看電影時用複數 movies。"
        }),
        grammarAiIssue({
          category: "article_or_determiner",
          originalText: "morning",
          replacementText: "the morning",
          explanationZhHant: "固定時間片語是 in the morning。"
        })
      ],
      expectedEdits: [
        ["love", "loves"],
        ["watch", "watching"],
        ["movie", "movies"],
        ["morning", "the morning"]
      ]
    },
    {
      sentence: "He go to park first then run at school.",
      correctedSentence: "He goes to the park first and then runs at school.",
      issues: [
        grammarAiIssue({
          originalText: "go",
          replacementText: "goes",
          explanationZhHant: "He 是第三身單數，所以一般現在式動詞用 goes。"
        }),
        grammarAiIssue({
          category: "article_or_determiner",
          originalText: "park",
          replacementText: "the park",
          explanationZhHant: "這裡指前往公園，通常寫 go to the park。"
        }),
        grammarAiIssue({
          category: "conjunction",
          originalText: "then",
          replacementText: "and then",
          explanationZhHant: "兩個連續動作需要用 and 連接。"
        }),
        grammarAiIssue({
          originalText: "run",
          replacementText: "runs",
          explanationZhHant: "第二個並列動作同樣以 He 為主語，所以用 runs。"
        })
      ],
      expectedEdits: [
        ["go", "goes"],
        ["park", "the park"],
        ["then", "and then"],
        ["run", "runs"]
      ]
    },
    {
      sentence: "He goes to park first then run at school.",
      correctedSentence: "He goes to the park first and then runs at school.",
      issues: [
        grammarAiIssue({
          category: "article_or_determiner",
          originalText: "park",
          replacementText: "the park",
          explanationZhHant: "這裡指前往公園，通常寫 go to the park。"
        }),
        grammarAiIssue({
          category: "conjunction",
          originalText: "then",
          replacementText: "and then",
          explanationZhHant: "兩個連續動作需要用 and 連接。"
        }),
        grammarAiIssue({
          originalText: "run",
          replacementText: "runs",
          explanationZhHant: "第二個並列動作同樣以 He 為主語，所以用 runs。"
        })
      ],
      expectedEdits: [
        ["park", "the park"],
        ["then", "and then"],
        ["run", "runs"]
      ]
    }
  ];

  const invalidMap = (fixture) => grammarAiResponse(
    fixture.sentence,
    [grammarAiIssue({
      category: "sentence_structure",
      originalText: "not present in the source",
      replacementText: "invalid map",
      occurrence: 9,
      explanationZhHant: "模擬模型傳回無效位置資料。"
    })],
    fixture.correctedSentence
  );

  for (const fixture of fixtures) {
    for (const mode of ["primary", "incomplete-primary", "recovery"]) {
      const completeResult = grammarAiResponse(
        fixture.sentence,
        fixture.issues,
        fixture.correctedSentence
      );
      const ai = mode === "primary"
        ? aiBinding(completeResult)
        : mode === "incomplete-primary"
          ? aiSequence(
            grammarAiResponse(fixture.sentence, [fixture.issues[0]]),
            completeResult
          )
          : aiSequence(invalidMap(fixture), invalidMap(fixture));
      const response = await worker.fetch(
        grammarCheckRequest(fixture.sentence),
        environment({ AI: ai })
      );
      const responseText = await response.text();
      assert.equal(response.status, 200, `${mode}: ${fixture.sentence}: ${responseText}`);
      const body = JSON.parse(responseText);
      assert.equal(body.engine.version, "2026-08-01.7");
      assert.equal(ai.calls.length, mode === "primary" ? 1 : 2);
      if (mode !== "primary") {
        assert.equal(ai.calls[0].model, "@cf/meta/llama-3.1-8b-instruct-fast");
        assert.equal(ai.calls[1].model, "@cf/meta/llama-3.3-70b-instruct-fp8-fast");
        const repairContent = ai.calls[1].request.messages[1].content;
        const repairPayload = JSON.parse(repairContent.slice(repairContent.indexOf("\n") + 1));
        assert.deepEqual(
          repairPayload,
          mode === "incomplete-primary"
            ? { sentence: fixture.sentence }
            : {
              sentence: fixture.sentence,
              proposedCorrectedSentence: fixture.correctedSentence
            }
        );
      }
      assert.deepEqual(
        body.issues.map((issue) => [issue.originalText, issue.suggestedText]),
        fixture.expectedEdits,
        `${mode}: ${fixture.sentence}`
      );
      assert.equal(body.issues.length, fixture.expectedEdits.length);
      assert.equal(
        applyGrammarIssues(fixture.sentence, body.issues),
        fixture.correctedSentence
      );
      assert.ok(body.issues.every((issue) => (
        issue.engine?.model === (
          mode === "primary"
            ? "@cf/meta/llama-3.1-8b-instruct-fast"
            : "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
        )
        && issue.engine?.version === "2026-08-01.7"
      )));
      const orderedIssues = [...body.issues].sort((left, right) => left.start - right.start);
      for (let index = 1; index < orderedIssues.length; index += 1) {
        assert.ok(orderedIssues[index - 1].end <= orderedIssues[index].start);
      }
    }
  }
});

test("the three newest learner sentences route malformed 8B maps to one complete 70B repair", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const primaryModel = "@cf/meta/llama-3.1-8b-instruct-fast";
  const repairModel = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
  const fixtures = [
    {
      sentence: "Mary and John eats restaurant.",
      correctedSentence: "Mary and John eat at a restaurant.",
      primaryIssues: [grammarAiIssue({
        originalText: "eats",
        replacementText: "eat",
        explanationZhHant: "複數主語使用 eat。"
      })],
      repairIssues: [
        grammarAiIssue({
          originalText: "eats",
          replacementText: "eat",
          explanationZhHant: "Mary and John 是由 and 連接的複數主語，所以現在式動詞用 eat。",
          confidence: 0.99
        }),
        grammarAiIssue({
          category: "preposition",
          originalText: "restaurant",
          replacementText: "at a restaurant",
          explanationZhHant: "表示在餐廳用餐時，需要介詞 at；泛指一間餐廳亦要用冠詞 a。",
          confidence: 0.98
        })
      ],
      expectedEdits: [["eats", "eat"], ["restaurant", "at a restaurant"]]
    },
    {
      sentence: "They go to work study together.",
      correctedSentence: "They go to work and study together.",
      primaryIssues: [
        grammarAiIssue({
          category: "sentence_structure",
          originalText: "work study",
          replacementText: "work and study",
          explanationZhHant: "兩個動作需要連接。"
        }),
        grammarAiIssue({
          category: "conjunction",
          originalText: "study",
          replacementText: "and study",
          explanationZhHant: "加入連接詞 and。"
        })
      ],
      repairIssues: [grammarAiIssue({
        category: "conjunction",
        originalText: "study",
        replacementText: "and study",
        explanationZhHant: "go to work 和 study 是兩個並列動作，所以用 and 連接。",
        confidence: 0.9
      })],
      expectedEdits: [["study", "and study"]]
    },
    {
      sentence: "They has a lot of moneys.",
      correctedSentence: "They have a lot of money.",
      primaryIssues: [grammarAiIssue({
        originalText: "has",
        replacementText: "have",
        explanationZhHant: "They 後面使用 have。"
      })],
      repairIssues: [
        grammarAiIssue({
          originalText: "has",
          replacementText: "have",
          explanationZhHant: "They 是複數主語，所以現在式用 have。",
          confidence: 0.99
        }),
        grammarAiIssue({
          category: "countability",
          originalText: "moneys",
          replacementText: "money",
          explanationZhHant: "日常表示金錢時，money 通常是不可數名詞。",
          confidence: 0.99
        })
      ],
      expectedEdits: [["has", "have"], ["moneys", "money"]]
    }
  ];

  for (const fixture of fixtures) {
    const ai = aiSequence(
      grammarAiResponse(
        fixture.sentence,
        fixture.primaryIssues,
        fixture.correctedSentence
      ),
      grammarAiResponse(
        fixture.sentence,
        fixture.repairIssues,
        fixture.correctedSentence
      )
    );
    const response = await worker.fetch(
      grammarCheckRequest(fixture.sentence),
      environment({ AI: ai })
    );
    const responseText = await response.text();
    assert.equal(response.status, 200, `${fixture.sentence}: ${responseText}`);
    const body = JSON.parse(responseText);

    assert.equal(ai.calls.length, 2, `${fixture.sentence}: repair must make at most two model calls`);
    assert.equal(ai.calls[0].model, primaryModel);
    assert.equal(ai.calls[1].model, repairModel);
    assert.equal(ai.calls[0].request.seed, 5194);
    assert.equal(ai.calls[1].request.seed, 5195);
    const repairContent = ai.calls[1].request.messages[1].content;
    const repairPayload = JSON.parse(repairContent.slice(repairContent.indexOf("\n") + 1));
    assert.deepEqual(repairPayload, {
      sentence: fixture.sentence,
      proposedCorrectedSentence: fixture.correctedSentence
    });

    assert.equal(body.engine.model, primaryModel);
    assert.equal(body.engine.version, "2026-08-01.7");
    assert.deepEqual(
      body.issues.map((issue) => [issue.originalText, issue.suggestedText]),
      fixture.expectedEdits
    );
    assert.equal(
      applyGrammarIssues(fixture.sentence, body.issues),
      fixture.correctedSentence
    );
    const orderedIssues = [...body.issues].sort((left, right) => left.start - right.start);
    for (let index = 1; index < orderedIssues.length; index += 1) {
      assert.ok(
        orderedIssues[index - 1].end <= orderedIssues[index].start,
        `${fixture.sentence}: repaired issues must not overlap`
      );
    }
    assert.ok(body.issues.length > 0);
    assert.ok(body.issues.every((issue) => (
      issue.engine?.model === repairModel
      && issue.engine?.version === "2026-08-01.7"
    )), `${fixture.sentence}: every repaired issue must identify the 70B repair engine`);
  }
});

test("the two failed screenshot sentences recover from invalid model positions", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const fixtures = [
    {
      sentence: "Tommy write a book call \"Super book\".",
      primaryTarget: "Tommy writes a book called 'Super book'.",
      repairTarget: "Tommy writes a book called 'Super book'.",
      finalTarget: "Tommy writes a book called \"Super book\".",
      expectedEdits: [["write", "writes"], ["call", "called"]]
    },
    {
      sentence: "Tom is run a system call \"Super Book\".",
      primaryTarget: "Tom is running a system call called 'Super Book'.",
      repairTarget: "Tom is running a system called 'Super Book'.",
      finalTarget: "Tom is running a system called \"Super Book\".",
      expectedEdits: [["run", "running"], ["call", "called"]]
    }
  ];

  for (const fixture of fixtures) {
    const invalidMap = (correctedSentence) => grammarAiResponse(
      fixture.sentence,
      [grammarAiIssue({
        category: "sentence_structure",
        originalText: "not a real source span",
        replacementText: "invented replacement",
        occurrence: 7,
        explanationZhHant: "模型明白完整修正，但傳回的位置資料無效。"
      })],
      correctedSentence
    );
    const ai = aiSequence(invalidMap(fixture.primaryTarget), invalidMap(fixture.repairTarget));
    const response = await worker.fetch(
      grammarCheckRequest(fixture.sentence),
      environment({ AI: ai })
    );
    const responseText = await response.text();
    assert.equal(response.status, 200, `${fixture.sentence}: ${responseText}`);
    const body = JSON.parse(responseText);
    assert.equal(ai.calls.length, 2);
    assert.match(
      ai.calls[0].request.messages[0].content,
      /"Tommy write" -> "Tommy writes", not "Tommy wrote"/
    );
    assert.deepEqual(
      body.issues.map((issue) => [issue.originalText, issue.suggestedText]),
      fixture.expectedEdits
    );
    assert.equal(applyGrammarIssues(fixture.sentence, body.issues), fixture.finalTarget);
    assert.ok(body.issues.every((issue) => (
      issue.engine.model === "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
      && issue.correctedSentence === (
        `${fixture.sentence.slice(0, issue.start)}${issue.suggestedText}${fixture.sentence.slice(issue.end)}`
      )
    )));
    assert.ok(applyGrammarIssues(fixture.sentence, body.issues).includes('"Super'));
  }
});

test("unseen learner wording receives the same general deterministic recovery", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "Sarah write a poem call \"My Home\".";
  const correctedSentence = "Sarah writes a poem called \"My Home\".";
  const invalid = grammarAiResponse(sentence, [grammarAiIssue({
    originalText: "wrong position",
    replacementText: "wrong mapping",
    occurrence: 9
  })], correctedSentence);
  const ai = aiSequence(invalid, invalid);
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);
  assert.deepEqual(
    body.issues.map((issue) => [issue.originalText, issue.suggestedText]),
    [["write", "writes"], ["call", "called"]]
  );
  assert.equal(applyGrammarIssues(sentence, body.issues), correctedSentence);
});

test("deterministic recovery restores quoted titles by ordinal and rejects quote loss", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "Tommy write a book call \"Super book\".";
  const invalid = (correctedSentence) => grammarAiResponse(sentence, [grammarAiIssue({
    originalText: "missing source text",
    replacementText: "invalid map",
    occurrence: 5
  })], correctedSentence);
  const caseOnlyAi = aiSequence(
    invalid("Tommy writes a book called 'Super Book'."),
    invalid("Tommy writes a book called 'Super Book'.")
  );
  const caseOnlyResponse = await worker.fetch(
    grammarCheckRequest(sentence),
    environment({ AI: caseOnlyAi })
  );
  const caseOnlyText = await caseOnlyResponse.text();
  assert.equal(caseOnlyResponse.status, 200, caseOnlyText);
  assert.equal(
    applyGrammarIssues(sentence, JSON.parse(caseOnlyText).issues),
    "Tommy writes a book called \"Super book\"."
  );

  const changedAi = aiSequence(
    invalid("Tommy writes a book called 'Amazing guide'."),
    invalid("Tommy writes a book called 'Amazing guide'.")
  );
  const changedResponse = await worker.fetch(
    grammarCheckRequest(sentence),
    environment({ AI: changedAi })
  );
  const changedText = await changedResponse.text();
  assert.equal(changedResponse.status, 200, changedText);
  assert.equal(
    applyGrammarIssues(sentence, JSON.parse(changedText).issues),
    "Tommy writes a book called \"Super book\"."
  );

  for (const [quotedSentence, candidate, expected] of [
    [
      "Tommy write a book call 'Super book'.",
      "Tommy writes a book called 'Amazing Guide'.",
      "Tommy writes a book called 'Super book'."
    ],
    [
      "Tommy write a book call ‘Super book’.",
      "Tommy writes a book called ‘Amazing Guide’.",
      "Tommy writes a book called ‘Super book’."
    ],
    [
      "Tommy write a book call 'Student's Guide'.",
      "Tommy writes a book called 'Amazing Guide'.",
      "Tommy writes a book called 'Student's Guide'."
    ],
    [
      "Tommy write a book call ‘Edmund’s Book’.",
      "Tommy writes a book called ‘Amazing Guide’.",
      "Tommy writes a book called ‘Edmund’s Book’."
    ],
    [
      "Tom write \"First\" and \"Second\".",
      "Tom writes \"Second\" and \"First\".",
      "Tom writes \"First\" and \"Second\"."
    ],
    [
      "Tom write—'Super book'.",
      "Tom writes—'Super Book'.",
      "Tom writes—'Super book'."
    ],
    [
      "Tom write—‘Super book’.",
      "Tom writes—‘Super Book’.",
      "Tom writes—‘Super book’."
    ]
  ]) {
    const mapped = (correctedSentence) => grammarAiResponse(
      quotedSentence,
      [grammarAiIssue({
        originalText: "missing source text",
        replacementText: "invalid map",
        occurrence: 5
      })],
      correctedSentence
    );
    const ai = aiSequence(mapped(candidate), mapped(candidate));
    const response = await worker.fetch(
      grammarCheckRequest(quotedSentence),
      environment({ AI: ai })
    );
    const responseText = await response.text();
    assert.equal(response.status, 200, `${quotedSentence}: ${responseText}`);
    assert.equal(applyGrammarIssues(quotedSentence, JSON.parse(responseText).issues), expected);
  }

  const duplicateSentence = "Tom write \"X\" and \"X\".";
  const lostQuote = grammarAiResponse(
    duplicateSentence,
    [grammarAiIssue({
      originalText: "missing source text",
      replacementText: "invalid map",
      occurrence: 5
    })],
    "Tom writes \"X\"."
  );
  const lostQuoteResponse = await worker.fetch(
    grammarCheckRequest(duplicateSentence),
    environment({ AI: aiSequence(lostQuote, lostQuote) })
  );
  assert.equal(lostQuoteResponse.status, 502);
  assert.equal((await lostQuoteResponse.json()).code, "GRAMMAR_CHECK_INCONCLUSIVE");

  const movedQuoteSentence = "Tom write \"X\" to Mary.";
  const movedQuote = grammarAiResponse(
    movedQuoteSentence,
    [grammarAiIssue({
      originalText: "missing source text",
      replacementText: "invalid map",
      occurrence: 5
    })],
    "Tom writes X to \"Mary\"."
  );
  const movedQuoteResponse = await worker.fetch(
    grammarCheckRequest(movedQuoteSentence),
    environment({ AI: aiSequence(movedQuote, movedQuote) })
  );
  assert.equal(movedQuoteResponse.status, 502);
  assert.equal((await movedQuoteResponse.json()).code, "GRAMMAR_CHECK_INCONCLUSIVE");
});

test("deterministic recovery refuses safe-looking semantic rewrites", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = () => {};
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  for (const [sentence, correctedSentence] of [
    ["Tom write a book.", "Mary sings loudly."],
    ["Tom bought 2 books.", "Tom sold 2 cars."],
    ["Tom writes \"X\".", "Mary sings \"X\"."],
    ["He is kind.", "He is king."],
    ["Tom likes cats and hates dogs.", "Tom hates cats and likes dogs."],
    ["Tom gives Mary a book.", "Mary gives Tom a book."],
    ["Students help teachers.", "Teachers help students."],
    ["Tom can swim.", "Tom cannot swim."],
    ["Tom often studies.", "Tom never studies."],
    ["Tom travelled to London.", "Tom travelled from London."],
    ["Tom told him.", "Tom told her."],
    ["Tom stayed because it rained.", "Tom stayed although it rained."],
    ["Tom is happy.", "Tom was happy."],
    ["Tom lost his book.", "Tom lost her book."],
    ["Tom works before lunch.", "Tom works after lunch."],
    ["I think many students passed.", "I think few students passed."],
    ["Tom leaves if Mary calls.", "Tom leaves when Mary calls."],
    ["Tom sat above Mary.", "Tom sat below Mary."],
    ["Tom studied with Mary.", "Tom studied for Mary."],
    ["Tom stopped smoking.", "Tom stopped to smoke."],
    ["Tom saw Mary running.", "Tom saw Mary and ran."],
    ["Tom works.", "Tom worked."],
    ["Tom feels happy.", "Tom felt happy."],
    ["The machine is running.", "The machine is run."],
    ["Tom hopes.", "Tom hops."],
    [
      "Tom names \"X\" in A and names X in B.",
      "Tom names X in A and names \"X\" in B."
    ],
    [
      "Tom bought 2 cats and Mary bought 2 dogs.",
      "Tom bought 2 dogs and Mary bought 2 cats."
    ]
  ]) {
    const malformed = grammarAiResponse(sentence, [grammarAiIssue({
      originalText: "not in source",
      replacementText: "invalid map",
      occurrence: 8
    })], correctedSentence);
    const ai = aiSequence(malformed, malformed);
    const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
    assert.equal(response.status, 502, sentence);
    assert.equal((await response.json()).code, "GRAMMAR_CHECK_INCONCLUSIVE");
    assert.equal(ai.calls.length, 2);
  }
});

test("valid model maps cannot bypass protected meaning, numbers or quoted text", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = () => {};
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  for (const fixture of [
    {
      sentence: "Tom is happy.",
      correctedSentence: "Tom was happy.",
      originalText: "is",
      replacementText: "was"
    },
    {
      sentence: "Tom travelled to London.",
      correctedSentence: "Tom travelled from London.",
      originalText: "to",
      replacementText: "from"
    },
    {
      sentence: "Tom has 2 books.",
      correctedSentence: "Tom has 3 books.",
      originalText: "2",
      replacementText: "3"
    },
    {
      sentence: "Tom wrote \"Book\".",
      correctedSentence: "Tom wrote \"Guide\".",
      originalText: "Book",
      replacementText: "Guide"
    },
    {
      sentence: "Tom likes cats and hates dogs.",
      correctedSentence: "Tom hates cats and likes dogs.",
      originalText: "likes cats and hates dogs",
      replacementText: "hates cats and likes dogs"
    },
    {
      sentence: "Tom stopped smoking.",
      correctedSentence: "Tom stopped to smoke.",
      originalText: "smoking",
      replacementText: "to smoke"
    },
    {
      sentence: "Tom saw Mary running.",
      correctedSentence: "Tom saw Mary and ran.",
      originalText: "running",
      replacementText: "and ran"
    },
    {
      sentence: "Tom works.",
      correctedSentence: "Tom worked.",
      originalText: "works",
      replacementText: "worked"
    },
    {
      sentence: "Tom feels happy.",
      correctedSentence: "Tom felt happy.",
      originalText: "feels",
      replacementText: "felt"
    },
    {
      sentence: "The machine is running.",
      correctedSentence: "The machine is run.",
      originalText: "running",
      replacementText: "run"
    },
    {
      sentence: "Tom hopes.",
      correctedSentence: "Tom hops.",
      originalText: "hopes",
      replacementText: "hops"
    },
    {
      sentence: "Tom names \"X\" in A and names X in B.",
      correctedSentence: "Tom names X in A and names \"X\" in B.",
      originalText: "\"X\" in A and names X",
      replacementText: "X in A and names \"X\""
    }
  ]) {
    const validMap = grammarAiResponse(fixture.sentence, [grammarAiIssue({
      category: "other_grammar",
      originalText: fixture.originalText,
      replacementText: fixture.replacementText,
      explanationZhHant: "這是一個格式正確但會改變原意的模型建議。",
      confidence: 0.99
    })], fixture.correctedSentence);
    const ai = aiSequence(validMap, validMap);
    const response = await worker.fetch(
      grammarCheckRequest(fixture.sentence),
      environment({ AI: ai })
    );
    assert.equal(response.status, 502, fixture.sentence);
    assert.equal((await response.json()).code, "GRAMMAR_CHECK_INCONCLUSIVE");
    assert.equal(ai.calls.length, 2);
  }
});

test("two malformed edit maps recover the agreed modal and plural correction", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "it can to help student do work faster.";
  const correctedSentence = "It can help students do work faster.";
  const malformedIssues = [
    grammarAiIssue({
      category: "spelling_or_spacing",
      originalText: "it",
      replacementText: "It",
      explanationZhHant: "句子開首要用大寫。"
    }),
    grammarAiIssue({
      category: "singular_plural",
      originalText: "student",
      replacementText: "students",
      explanationZhHant: "泛指多名學生要用複數。"
    })
  ];
  const ai = aiSequence(
    grammarAiResponse(sentence, malformedIssues, correctedSentence),
    grammarAiResponse(sentence, [...malformedIssues].reverse(), correctedSentence)
  );

  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);
  assert.equal(body.issues.length, 3);
  assert.deepEqual(
    body.issues.map(({ category, originalText, suggestedText }) => ({
      category, originalText, suggestedText
    })),
    [
      { category: "spelling_or_spacing", originalText: "it", suggestedText: "It" },
      { category: "other_grammar", originalText: "to help", suggestedText: "help" },
      { category: "singular_plural", originalText: "student", suggestedText: "students" }
    ]
  );
  assert.equal(applyGrammarIssues(sentence, body.issues), correctedSentence);
  assert.equal(ai.calls.length, 2);
});

test("a malformed edit map is rebuilt from a safe corrected sentence", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "Tom can to swim.";
  const correctedSentence = "Tom can swim.";
  const mismatched = grammarAiResponse(sentence, [grammarAiIssue({
    category: "modal_or_auxiliary",
    originalText: "can",
    replacementText: "can swim",
    explanationZhHant: "這個座標未能重建完整句子。"
  })], correctedSentence);
  const ai = aiSequence(mismatched, mismatched);
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);
  assert.deepEqual(
    body.issues.map((issue) => [issue.originalText, issue.suggestedText]),
    [["to swim", "swim"]]
  );
  assert.equal(applyGrammarIssues(sentence, body.issues), correctedSentence);
  assert.equal(ai.calls.length, 2);
});

test("deterministic recovery rejects unchanged and still-ungrammatical candidates", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const logs = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = (...values) => { logs.push(values.join(" ")); };
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const fixtures = [
    {
      sentence: "The first advantage is the efficient and effective.",
      first: "The first advantage is the efficient and effective.",
      second: "The first advantage is the efficient and effective."
    },
    {
      sentence: "The first advantage is the efficient and effective.",
      first: "The first advantage are efficient and effective.",
      second: "The first advantage are efficient and effective."
    },
    {
      sentence: "it can to help student do work faster.",
      first: "It can help student do work faster.",
      second: "It can help student do work faster."
    }
  ];

  for (const fixture of fixtures) {
    const malformed = (correctedSentence) => ({
      response: { correctedSentence, issues: [{}] }
    });
    const ai = aiSequence(malformed(fixture.first), malformed(fixture.second));
    const response = await worker.fetch(
      grammarCheckRequest(fixture.sentence),
      environment({ AI: ai })
    );
    const body = await response.json();
    assert.equal(response.status, 502);
    assert.deepEqual(body, {
      error: "Advanced grammar checking could not safely analyse this sentence",
      code: "GRAMMAR_CHECK_INCONCLUSIVE"
    });
    assert.equal(ai.calls.length, 2);
    const publicBody = JSON.stringify(body);
    assert.equal(publicBody.includes(fixture.sentence), false);
    assert.equal(publicBody.includes(fixture.first), false);
    assert.equal(publicBody.includes(fixture.second), false);
  }
  assert.equal(logs.length, fixtures.length);
  assert.ok(logs.every((entry) => entry === "Writing Submission grammar result was inconclusive"));
  assert.equal(logs.some((entry) => fixtures.some((fixture) => entry.includes(fixture.sentence))), false);
});

test("a provider error on the repair pass returns a private 503 after exactly two calls", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const logs = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = (...values) => { logs.push(values.join(" ")); };
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "The first advantage is the efficient and effective.";
  const ai = aiSequence(
    { response: "invalid-first-result" },
    new Error("private-second-provider-error")
  );
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.deepEqual(body, {
    error: "Advanced grammar checking is temporarily unavailable",
    code: "GRAMMAR_CHECK_UNAVAILABLE"
  });
  assert.equal(ai.calls.length, 2);
  assert.deepEqual(logs, ["Writing Submission grammar provider failed"]);
  assert.equal(JSON.stringify(body).includes(sentence), false);
  assert.equal(JSON.stringify(body).includes("private-second-provider-error"), false);
});

test("source-aware complement guards preserve valid infinitives and specific schools", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  for (const sentence of [
    "Tom enjoys watching movies.",
    "Tom wants to watch a movie.",
    "Tom hates to watch horror movies.",
    "Tom goes to school every day.",
    "Tom goes to the school beside his home.",
    "Tom goes to a school near his home.",
    "Tom enjoys the movie.",
    "Tom enjoys music.",
    "Tom enjoys work.",
    "His will to succeed is strong.",
    "I asked May to help.",
    "A strong will to succeed is important.",
    "Free will to choose is important.",
    "The political will to act is necessary.",
    "He used all his might to lift it.",
    "We bought a can to store paint.",
    "This is a must to complete the course."
  ]) {
    const ai = aiBinding(grammarAiResponse(sentence, []));
    const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
    const responseText = await response.text();
    assert.equal(response.status, 200, `${sentence}: ${responseText}`);
    assert.deepEqual(JSON.parse(responseText).issues, []);
    assert.equal(ai.calls.length, 1);
  }
});

test("accepted regression corrections stay resolved without another model rewrite", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  for (const sentence of [
    "It can help students do work faster.",
    "The first advantage is efficiency and effectiveness.",
    "The first advantage is that it is efficient and effective.",
    "Tom loves to eat food.",
    "Tom hates going to school but enjoys watching movies.",
    "Tom read a book and felt excited.",
    "Mary and John eat at a restaurant.",
    "They go to work and study together.",
    "They have a lot of money.",
    "Tommy writes a book called \"Super book\".",
    "Tom is running a system called \"Super Book\".",
    "Tom runs a system called \"Super Book\"."
  ]) {
    const ai = aiBinding(new Error("the accepted control must not invoke AI"));
    const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
    const responseText = await response.text();
    assert.equal(response.status, 200, `${sentence}: ${responseText}`);
    assert.deepEqual(JSON.parse(responseText).issues, []);
    assert.equal(ai.calls.length, 0);
  }
});

test("two invalid grammar results return a privacy-safe inconclusive response", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const logs = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = (...values) => { logs.push(values.join(" ")); };
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const sentence = "Tom love eat food.";
  const ai = aiSequence(
    { response: "first-invalid-provider-output" },
    {
      response: {
        correctedSentence: sentence,
        issues: [grammarAiIssue({
          originalText: "students",
          replacementText: "student",
          explanationZhHant: "這是第二個不存在於原句的片段。"
        })]
      }
    }
  );
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  assert.equal(response.status, 502);
  const body = await response.json();
  assert.deepEqual(body, {
    error: "Advanced grammar checking could not safely analyse this sentence",
    code: "GRAMMAR_CHECK_INCONCLUSIVE"
  });
  assert.equal(Object.prototype.hasOwnProperty.call(body, "issues"), false);
  assert.equal(ai.calls.length, 2);
  assert.deepEqual(logs, ["Writing Submission grammar result was inconclusive"]);
  assert.equal(logs.some((entry) => entry.includes(sentence)), false);
  assert.equal(logs.some((entry) => entry.includes("first-invalid-provider-output")), false);
  assert.equal(JSON.stringify(body).includes("first-invalid-provider-output"), false);
});

test("overlapping first suggestions are repaired on retry without dropping either error", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const logs = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = (...values) => { logs.push(values.join(" ")); };
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "Tom love eat food.";
  const overlappingIssues = [
    grammarAiIssue({
      category: "sentence_structure",
      originalText: "love eat",
      replacementText: "loves to eat",
      explanationZhHant: "這個寬廣改寫與局部改寫重疊。",
      confidence: 0.99
    }),
    ...tomLoveIssues()
  ];
  const ai = aiSequence(
    {
      response: {
        correctedSentence: "Tom loves to eat food.",
        issues: overlappingIssues
      }
    },
    grammarAiResponse(sentence, tomLoveIssues())
  );
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  const body = JSON.parse(responseText);
  assert.deepEqual(
    body.issues.map((issue) => [issue.originalText, issue.suggestedText]),
    [["love", "loves"], ["eat", "to eat"]]
  );
  assert.equal(applyGrammarIssues(sentence, body.issues), "Tom loves to eat food.");
  assert.equal(ai.calls.length, 2);
  assert.deepEqual(logs, []);
});
*/

test("two unsafe corrected sentences return one privacy-safe inconclusive response", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const logs = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = (...values) => { logs.push(values.join(" ")); };
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "The office order 3 replacement screen.";
  const privateProviderText = "private-upstream-output";
  const ai = aiSequence(
    { response: { correctedSentence: "The office ordered 4 replacement screens.", issues: [] } },
    {
      response: {
        correctedSentence: `The office ordered 5 replacement screens ${privateProviderText}.`,
        issues: []
      }
    }
  );
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));

  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), {
    error: "Advanced grammar checking could not safely analyse this sentence",
    code: "GRAMMAR_CHECK_INCONCLUSIVE"
  });
  assert.equal(ai.calls.length, 3);
  assert.deepEqual(logs, ["Writing Submission grammar result was inconclusive"]);
  assert.equal(logs.some((entry) => entry.includes(sentence)), false);
  assert.equal(logs.some((entry) => entry.includes(privateProviderText)), false);
});

test("a provider error on the independent fallback remains private", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const logs = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = (...values) => { logs.push(values.join(" ")); };
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const sentence = "The office order 3 replacement screen.";
  const providerError = new Error("fallback-private-output");
  const ai = aiSequence(
    { response: { correctedSentence: "The office ordered 4 replacement screens.", issues: [] } },
    providerError
  );
  const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: "Advanced grammar checking is temporarily unavailable",
    code: "GRAMMAR_CHECK_PROVIDER_FAILURE"
  });
  assert.equal(response.headers.get("Retry-After"), "1");
  assert.equal(ai.calls.length, 3);
  assert.deepEqual(logs, ["Writing Submission grammar provider failed"]);
  assert.equal(logs.some((entry) => entry.includes(sentence)), false);
  assert.equal(logs.some((entry) => entry.includes(providerError.message)), false);
});

test("provider failures return a generic 503 without logging sentence or provider output", async t => {
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const logs = [];
  t.after(() => {
    globalThis.fetch = originalFetch;
    console.error = originalConsoleError;
  });
  console.error = (...values) => { logs.push(values.join(" ")); };
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const sentence = "Tommy need confidential-book.";
  const providerError = new Error("provider-output-internal-detail");
  const ai = aiBinding(providerError);
  const response = await worker.fetch(
    grammarCheckRequest(sentence),
    environment({ AI: ai })
  );
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.deepEqual(body, {
    error: "Advanced grammar checking is temporarily unavailable",
    code: "GRAMMAR_CHECK_PROVIDER_FAILURE"
  });
  assert.equal(response.headers.get("Retry-After"), "1");
  assert.equal(ai.calls.length, 3);
  assert.deepEqual(logs, ["Writing Submission grammar provider failed"]);
  assert.equal(logs.some((entry) => entry.includes(sentence)), false);
  assert.equal(logs.some((entry) => entry.includes(providerError.message)), false);
});

test("a valid submission derives its owner and word count on the Worker", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let submittedPayload = null;

  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") {
      assert.equal(rpc.body.p_token, STUDENT_TOKEN);
      return jsonResponse(studentProfile());
    }
    if (rpc.name === "writing_submission_submit_v4") {
      submittedPayload = rpc.body;
      return jsonResponse([{
        id: rpc.body.p_id,
        topic: rpc.body.p_topic,
        answer: rpc.body.p_answer,
        word_count: rpc.body.p_word_count,
        duration_seconds: rpc.body.p_duration_seconds,
        submitted_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        topic: "Should companies require uniforms?",
        answer: "Many companies require staff to wear uniforms.",
        durationSeconds: 725
      })
    }
  ), environment());

  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  assert.equal(submittedPayload.p_student_id, STUDENT_ID);
  assert.equal(submittedPayload.p_id, SUBMISSION_ID);
  assert.equal(submittedPayload.p_word_count, 7);
  assert.equal(submittedPayload.p_duration_seconds, 725);
  assert.equal(JSON.parse(responseText).submission.wordCount, 7);
  assert.equal(JSON.parse(responseText).submission.durationSeconds, 725);
});

test("submission payloads cannot choose a student ID or add unknown fields", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let submitCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_submit_v4") submitCalled = true;
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        topic: "A prompt",
        answer: "A complete answer.",
        studentId: "77777777-7777-4777-8777-777777777777"
      })
    }
  ), environment());
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "INVALID_SUBMISSION");
  assert.equal(submitCalled, false);
});

test("submission writes require JSON and are bounded before the storage RPC", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let submitCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_submit_v4") submitCalled = true;
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}`,
    {
      method: "PUT",
      headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` },
      body: JSON.stringify({ topic: "Prompt", answer: "Answer." })
    }
  ), environment());
  assert.equal(response.status, 415);
  assert.equal(submitCalled, false);
});

test("submission topic resources must be canonical and available to the authenticated account", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let submitCalled = false;
  let access = studentProfile()[0].access;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile({ access }));
    if (rpc.name === "writing_submission_submit_v4") {
      submitCalled = true;
      assert.deepEqual(rpc.body.p_topic_resource, CANONICAL_DSE_TOPIC);
      return jsonResponse([{
        id: SUBMISSION_ID,
        topic: "A prompt",
        answer: "A complete answer.",
        word_count: 3,
        duration_seconds: 20,
        submitted_at: "2026-08-12T00:00:00.000Z",
        topic_resource: CANONICAL_DSE_TOPIC
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const request = (topicResource) => new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        topic: "A prompt",
        answer: "A complete answer.",
        durationSeconds: 20,
        topicResource
      })
    }
  );

  const injected = await worker.fetch(request({
    ...CANONICAL_DSE_TOPIC,
    label: "Injected title",
    modelEssay: "Client supplied answer must never be trusted"
  }), environment());
  assert.equal(injected.status, 400);
  assert.equal((await injected.json()).code, "INVALID_DRAFT");

  const accepted = await worker.fetch(request(CANONICAL_DSE_TOPIC), environment());
  assert.equal(accepted.status, 200, await accepted.clone().text());
  assert.deepEqual((await accepted.json()).submission.topicResource, CANONICAL_DSE_TOPIC);
  assert.equal(submitCalled, true);

  submitCalled = false;
  access = { ...access, "dse-writing": false };
  const denied = await worker.fetch(request(CANONICAL_DSE_TOPIC), environment());
  assert.equal(denied.status, 403);
  assert.equal((await denied.json()).code, "TOPIC_ACCESS_DENIED");
  assert.equal(submitCalled, false);
});

test("student history is paginated and full detail includes grammar occurrences", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const rows = Array.from({ length: 3 }, (_, index) => ({
    id: index === 0 ? SUBMISSION_ID : `${index + 3}3333333-3333-4333-8333-333333333333`,
    topic: `Prompt ${index + 1}`,
    answer_preview: `Preview ${index + 1}`,
    word_count: 10 + index,
    submitted_at: `2026-07-${31 - index}T00:00:00.000Z`
  }));

  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_list_v3") {
      assert.equal(rpc.body.p_limit, 3);
      assert.equal(rpc.body.p_offset, 0);
      return jsonResponse(rows);
    }
    if (rpc.name === "writing_submission_get_v3") {
      return jsonResponse([{
        id: SUBMISSION_ID,
        topic: "Prompt 1",
        answer: "Full answer.",
        word_count: 2,
        duration_seconds: 360,
        submitted_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    if (rpc.name === "writing_submission_list_occurrences") {
      return jsonResponse([{
        ...occurrence(),
        document_id: SUBMISSION_ID,
        rule_id: "SubjectVerbAgreement",
        original_text: "companies requires",
        suggested_text: "companies require",
        sentence_text: "More companies requires staff.",
        corrected_sentence: "More companies require staff.",
        detected_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const listResponse = await worker.fetch(new Request(
    "https://worker.example/v1/submissions?page=1&pageSize=2",
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(listResponse.status, 200);
  const listBody = await listResponse.json();
  assert.equal(listBody.submissions.length, 2);
  assert.equal(listBody.hasMore, true);
  assert.equal(listBody.submissions[0].answerPreview, "Preview 1");

  const detailResponse = await worker.fetch(new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}`,
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(detailResponse.status, 200);
  const detailBody = await detailResponse.json();
  assert.equal(detailBody.submission.answer, "Full answer.");
  assert.equal(detailBody.submission.durationSeconds, 360);
  assert.equal(detailBody.grammarOccurrences[0].ruleId, "SubjectVerbAgreement");
  assert.equal(detailBody.grammarOccurrences[0].correctedSentence, "More companies require staff.");
});

test("grammar batches preserve stable identifiers and return dedupe counts", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let issuePayload = null;
  const beforeRequest = Date.now();
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_record_issue_batch") {
      issuePayload = rpc.body;
      return jsonResponse([{ accepted_count: 1, inserted_count: 1 }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    "https://worker.example/v1/grammar-occurrences/batch",
    {
      method: "POST",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        documentId: SUBMISSION_ID,
        occurrences: [occurrence({ detectedAt: "2099-01-01T00:00:00.000Z" })]
      })
    }
  ), environment());
  assert.equal(response.status, 200);
  assert.equal(issuePayload.p_student_id, STUDENT_ID);
  assert.equal(issuePayload.p_document_id, SUBMISSION_ID);
  assert.equal(issuePayload.p_occurrences[0].fingerprint, FINGERPRINT);
  assert.equal(
    issuePayload.p_occurrences[0].correctedSentence,
    "More companies require staff to wear uniforms."
  );
  const storedDetectedAt = Date.parse(issuePayload.p_occurrences[0].detectedAt);
  assert.ok(storedDetectedAt >= beforeRequest);
  assert.ok(storedDetectedAt <= Date.now());
  assert.deepEqual(await response.json(), { acceptedCount: 1, insertedCount: 1 });
});

test("legacy grammar batches derive a full corrected sentence during a rolling release", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let issuePayload = null;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_record_issue_batch") {
      issuePayload = rpc.body;
      return jsonResponse([{ accepted_count: 1, inserted_count: 1 }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const legacyOccurrence = occurrence({
    originalText: "requires",
    suggestedText: "require",
    sentenceText: "More companies requires staff."
  });
  delete legacyOccurrence.correctedSentence;

  const response = await worker.fetch(new Request(
    "https://worker.example/v1/grammar-occurrences/batch",
    {
      method: "POST",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ documentId: SUBMISSION_ID, occurrences: [legacyOccurrence] })
    }
  ), environment());

  assert.equal(response.status, 200);
  assert.equal(issuePayload.p_occurrences[0].correctedSentence, "More companies require staff.");
});

test("two concrete occurrences of the same rule remain separate in one composition", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let issuePayload = null;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_record_issue_batch") {
      issuePayload = rpc.body;
      return jsonResponse([{ accepted_count: 2, inserted_count: 2 }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const secondFingerprint = "b".repeat(64);
  const response = await worker.fetch(new Request(
    "https://worker.example/v1/grammar-occurrences/batch",
    {
      method: "POST",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        documentId: SUBMISSION_ID,
        occurrences: [
          occurrence({
            originalText: "writing",
            suggestedText: "write",
            sentenceText: "I like writing and reading.",
            correctedSentence: "I like write and reading."
          }),
          occurrence({
            id: "77777777-7777-4777-8777-777777777777",
            fingerprint: secondFingerprint,
            originalText: "reading",
            suggestedText: "read",
            sentenceText: "I like writing and reading.",
            correctedSentence: "I like writing and read."
          })
        ]
      })
    }
  ), environment());

  assert.equal(response.status, 200);
  assert.equal(issuePayload.p_occurrences.length, 2);
  assert.equal(issuePayload.p_occurrences[0].ruleId, issuePayload.p_occurrences[1].ruleId);
  assert.notEqual(issuePayload.p_occurrences[0].fingerprint, issuePayload.p_occurrences[1].fingerprint);
  assert.deepEqual(await response.json(), { acceptedCount: 2, insertedCount: 2 });
});

test("duplicate grammar fingerprints are rejected before the storage RPC", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let issueRpcCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_record_issue_batch") issueRpcCalled = true;
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    "https://worker.example/v1/grammar-occurrences/batch",
    {
      method: "POST",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        documentId: SUBMISSION_ID,
        occurrences: [
          occurrence(),
          occurrence({ id: "77777777-7777-4777-8777-777777777777" })
        ]
      })
    }
  ), environment());
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "INVALID_GRAMMAR_BATCH");
  assert.equal(issueRpcCalled, false);
});

test("grammar writes fail closed when the per-student limiter denies them", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let issueRpcCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    issueRpcCalled = true;
    throw new Error("unexpected storage call");
  };
  const denied = limiter(false);
  const response = await worker.fetch(new Request(
    "https://worker.example/v1/grammar-occurrences/batch",
    {
      method: "POST",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ documentId: SUBMISSION_ID, occurrences: [occurrence()] })
    }
  ), environment({ GRAMMAR_WRITE_RATE_LIMITER: denied }));
  assert.equal(response.status, 429);
  assert.equal((await response.json()).code, "TOO_MANY_GRAMMAR_WRITES");
  assert.deepEqual(denied.calls, [{ key: `writing-submission-grammar:${STUDENT_ID}` }]);
  assert.equal(issueRpcCalled, false);
});

test("grammar problem log maps durable per-rule aggregates", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_problem_summary") {
      assert.equal(rpc.body.p_student_id, STUDENT_ID);
      return jsonResponse([{
        rule_id: "SubjectVerbAgreement",
        title: "Subject–verb agreement",
        occurrence_count: 4,
        first_seen_at: "2026-07-01T00:00:00.000Z",
        last_seen_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const response = await worker.fetch(new Request(
    "https://worker.example/v1/grammar-problems",
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.grammarProblems[0].occurrenceCount, 4);
});

test("students can page only their own detailed occurrences for one grammar category", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_problem_occurrences") {
      assert.equal(rpc.body.p_student_id, STUDENT_ID);
      assert.equal(rpc.body.p_rule_id, "EdmundAI:verb_form_and_tense");
      assert.equal(rpc.body.p_limit, 26);
      assert.equal(rpc.body.p_offset, 0);
      return jsonResponse([{
        id: OCCURRENCE_ID,
        document_id: SUBMISSION_ID,
        submission_id: SUBMISSION_ID,
        fingerprint: FINGERPRINT,
        rule_id: "EdmundAI:verb_form_and_tense",
        title: "動詞形式與時態",
        message: "「writing」在此應改為「write」。",
        original_text: "writing",
        suggested_text: "write",
        sentence_text: "I want to writing a book.",
        corrected_sentence: "I want to write a book.",
        detected_at: "2026-08-03T08:00:00.000Z",
        source_topic: "My future book",
        source_submitted_at: "2026-08-03T09:00:00.000Z",
        source_deleted_at: null
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    "https://worker.example/v1/grammar-problem-occurrences?ruleId=EdmundAI%3Averb_form_and_tense&page=1&pageSize=25",
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.grammarOccurrences[0].correctedSentence, "I want to write a book.");
  assert.equal(body.grammarOccurrences[0].sourceTopic, "My future book");
  assert.equal(body.grammarOccurrences[0].submissionId, SUBMISSION_ID);
  assert.equal(Object.hasOwn(body.grammarOccurrences[0], "studentId"), false);
});

test("grammar detection preference is account-backed and can be switched off", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    calls.push(rpc);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_preferences_get") {
      return jsonResponse([{ grammar_detection_enabled: true, updated_at: null }]);
    }
    if (rpc.name === "writing_submission_preferences_set") {
      assert.equal(rpc.body.p_student_id, STUDENT_ID);
      assert.equal(rpc.body.p_grammar_detection_enabled, false);
      return jsonResponse([{
        grammar_detection_enabled: false,
        updated_at: "2026-08-03T00:00:00.000Z"
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const headers = { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` };
  const getResponse = await worker.fetch(new Request(
    "https://worker.example/v1/preferences",
    { headers }
  ), environment());
  assert.equal(getResponse.status, 200);
  assert.equal((await getResponse.json()).preferences.grammarDetectionEnabled, true);

  const writeLimiter = limiter();
  const putResponse = await worker.fetch(new Request(
    "https://worker.example/v1/preferences",
    {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ grammarDetectionEnabled: false })
    }
  ), environment({ SUBMISSION_WRITE_RATE_LIMITER: writeLimiter }));
  assert.equal(putResponse.status, 200);
  assert.equal((await putResponse.json()).preferences.grammarDetectionEnabled, false);
  assert.deepEqual(writeLimiter.calls, [{ key: `writing-submission-preference:${STUDENT_ID}` }]);
  assert.equal(calls.filter(call => call.name === "writing_submission_preferences_set").length, 1);
});

test("writing progress returns exact daily, average and cumulative values", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_progress") {
      assert.equal(rpc.body.p_student_id, STUDENT_ID);
      return jsonResponse([{
        activity_date: "2026-08-03",
        articles_written: 2,
        time_spent_seconds: 1800,
        average_seconds: "900.00",
        cumulative_articles: 5,
        cumulative_time_seconds: 4200
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const response = await worker.fetch(new Request(
    "https://worker.example/v1/progress",
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).progress[0], {
    date: "2026-08-03",
    articlesWritten: 2,
    timeSpentSeconds: 1800,
    averageSeconds: 900,
    cumulativeArticles: 5,
    cumulativeTimeSeconds: 4200
  });
});

test("student deletion is recoverable and uses the soft-delete RPC", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let deletePayload = null;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_soft_delete") {
      deletePayload = rpc.body;
      return jsonResponse([{ id: SUBMISSION_ID, deleted_at: "2026-08-03T01:02:03.000Z" }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const response = await worker.fetch(new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}`,
    {
      method: "DELETE",
      headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` }
    }
  ), environment());
  assert.equal(response.status, 200);
  assert.deepEqual(deletePayload, { p_student_id: STUDENT_ID, p_id: SUBMISSION_ID });
  assert.deepEqual(await response.json(), {
    deleted: { id: SUBMISSION_ID, deletedAt: "2026-08-03T01:02:03.000Z" }
  });
});

test("admin login is rate limited before password parsing or bcrypt RPC", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let upstreamCalled = false;
  globalThis.fetch = async () => {
    upstreamCalled = true;
    throw new Error("must not be called");
  };
  const denied = limiter(false);
  const response = await worker.fetch(new Request(
    "https://worker.example/v1/admin/login",
    {
      method: "POST",
      headers: {
        Origin: ORIGIN,
        "CF-Connecting-IP": "203.0.113.9",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username: "Admin", password: "not-logged" })
    }
  ), environment({ ADMIN_LOGIN_RATE_LIMITER: denied }));
  assert.equal(response.status, 429);
  assert.equal((await response.json()).code, "TOO_MANY_ATTEMPTS");
  assert.deepEqual(denied.calls, [{ key: "writing-submission-admin:203.0.113.9" }]);
  assert.equal(upstreamCalled, false);
});

test("administrator list and detail routes use only the dedicated admin token", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") {
      assert.equal(rpc.body.p_admin_token, ADMIN_TOKEN);
      return jsonResponse(adminProfile());
    }
    if (rpc.name === "writing_submission_admin_list_students") {
      return jsonResponse([{
        id: STUDENT_ID,
        name: "Test Student",
        submission_count: 2,
        grammar_occurrence_count: 5,
        grammar_rule_count: 3,
        last_submission_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    if (rpc.name === "writing_submission_admin_list_submissions_v3") {
      assert.equal(rpc.body.p_student_id, STUDENT_ID);
      return jsonResponse([{
        id: SUBMISSION_ID,
        student_id: STUDENT_ID,
        student_name: "Test Student",
        topic: "Prompt",
        answer_preview: "Preview",
        word_count: 20,
        duration_seconds: 840,
        has_published_feedback: true,
        deleted_at: "2026-08-02T00:00:00.000Z",
        submitted_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    if (rpc.name === "writing_submission_admin_get_submission_v2") {
      return jsonResponse([{
        id: SUBMISSION_ID,
        student_id: STUDENT_ID,
        student_name: "Test Student",
        topic: "Prompt",
        answer: "Full answer",
        word_count: 2,
        duration_seconds: 840,
        deleted_at: "2026-08-02T00:00:00.000Z",
        submitted_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    if (rpc.name === "writing_submission_admin_list_occurrences") return jsonResponse([]);
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const authHeaders = { Origin: ORIGIN, Authorization: `Bearer ${ADMIN_TOKEN}` };
  const studentsResponse = await worker.fetch(new Request(
    "https://worker.example/v1/admin/students",
    { headers: authHeaders }
  ), environment());
  assert.equal(studentsResponse.status, 200);
  assert.equal((await studentsResponse.json()).students[0].grammarRuleCount, 3);

  const listResponse = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions?studentId=${STUDENT_ID}`,
    { headers: authHeaders }
  ), environment());
  assert.equal(listResponse.status, 200);
  const listSubmission = (await listResponse.json()).submissions[0];
  assert.equal(listSubmission.studentName, "Test Student");
  assert.equal(listSubmission.deletedAt, "2026-08-02T00:00:00.000Z");
  assert.equal(listSubmission.hasPublishedFeedback, true);

  const detailResponse = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}`,
    { headers: authHeaders }
  ), environment());
  assert.equal(detailResponse.status, 200);
  assert.equal((await detailResponse.json()).submission.answer, "Full answer");
});

test("administrator proxy submissions are authenticated, normalized and audited through one RPC", async t => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    calls.push(rpc);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_admin_submit_for_student") {
      assert.equal(rpc.body.p_admin_token, ADMIN_TOKEN);
      assert.equal(rpc.body.p_student_id, STUDENT_ID);
      assert.match(rpc.body.p_id, /^[0-9a-f-]{36}$/);
      assert.equal(rpc.body.p_topic, "A new topic");
      assert.equal(rpc.body.p_answer, "Students write clearly.");
      assert.equal(rpc.body.p_word_count, 3);
      return jsonResponse([{
        id: rpc.body.p_id,
        student_id: STUDENT_ID,
        student_name: "Test Student",
        topic: rpc.body.p_topic,
        answer: rpc.body.p_answer,
        word_count: rpc.body.p_word_count,
        duration_seconds: 0,
        submitted_at: "2026-08-31T12:00:00.000Z",
        deleted_at: null,
        topic_resource: null
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const rateLimit = limiter();
  const response = await worker.fetch(new Request(
    "https://worker.example/v1/admin/submissions",
    {
      method: "POST",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        studentId: STUDENT_ID,
        topic: "A new topic",
        answer: "Students write clearly."
      })
    }
  ), environment({ SUBMISSION_WRITE_RATE_LIMITER: rateLimit }));
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.submission.studentId, STUDENT_ID);
  assert.equal(body.submission.studentName, "Test Student");
  assert.equal(body.submission.durationSeconds, 0);
  assert.deepEqual(rateLimit.calls, [{ key: `writing-submission-admin-proxy-submit:${ADMIN_ID}` }]);
  assert.equal(calls.filter(call => call.name === "writing_submission_admin_submit_for_student").length, 1);
});

test("students can read only published feedback belonging to their submission", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_feedback_student_open_v5") {
      assert.deepEqual(rpc.body, {
        p_student_id: STUDENT_ID,
        p_submission_id: SUBMISSION_ID
      });
      return jsonResponse([storedFeedback()]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}/feedback`,
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(response.status, 200);
  const feedback = (await response.json()).feedback;
  assert.equal(feedback.id, FEEDBACK_ID);
  assert.equal(feedback.submissionId, SUBMISSION_ID);
  assert.equal(feedback.status, "published");
  assert.equal(feedback.fragments[0].originalFragment, "Students learns quickly.");
  assert.equal(feedback.fragments[0].edmundComment, "Students 是複數，動詞使用 learn。");
  assert.equal(feedback.fragments[0].suggestedWriting, "Students learn quickly.");
  assert.deepEqual(feedback.fragments[0].originalFormatting, [
    { start: 0, end: 8, bold: true, italic: false, strikethrough: false, highlight: "" },
    { start: 9, end: 15, bold: false, italic: false, strikethrough: false, highlight: "yellow" }
  ]);
  assert.deepEqual(feedback.fragments[0].commentFormatting, [
    { start: 0, end: 8, bold: true, italic: false, strikethrough: false, highlight: "orange" },
    { start: 9, end: 10, bold: false, italic: false, strikethrough: false, highlight: "blue" }
  ]);
  assert.deepEqual(feedback.fragments[0].suggestionFormatting, [
    { start: 0, end: 8, bold: true, italic: false, strikethrough: false, highlight: "green" }
  ]);
});

test("legacy stored feedback emits the complete enhanced fragment shape", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_feedback_student_open_v5") {
      return jsonResponse([storedFeedback({
        fragments: [{
          id: "88888888-8888-4888-8888-888888888888",
          position: 1,
          originalFragment: "Legacy original.",
          edmundComment: "Legacy comment."
        }]
      })]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}/feedback`,
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(response.status, 200);
  const [fragment] = (await response.json()).feedback.fragments;
  assert.deepEqual(fragment, {
    id: "88888888-8888-4888-8888-888888888888",
    position: 1,
    originalFragment: "Legacy original.",
    edmundComment: "Legacy comment.",
    suggestedWriting: "",
    originalFormatting: [],
    commentFormatting: [],
    suggestionFormatting: [],
    suggestionCopyText: "",
    suggestionCopyVersion: 0,
    suggestionCopyUpdatedAt: null,
    bookmarked: false,
    bookmarkVersion: 0
  });
});

test("student feedback returns null while no published feedback exists", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_feedback_student_open_v5") return jsonResponse([]);
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const response = await worker.fetch(new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}/feedback`,
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { feedback: null });
});

test("student list exposes published and unread feedback state and opening marks it read", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    calls.push(rpc);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_list_v3") {
      return jsonResponse([{
        id: SUBMISSION_ID,
        topic: "Prompt",
        answer_preview: "Preview",
        word_count: 5,
        duration_seconds: 90,
        submitted_at: "2026-08-12T01:00:00.000Z",
        has_published_feedback: true,
        feedback_unread: true
      }]);
    }
    if (rpc.name === "writing_submission_feedback_student_open_v5") {
      return jsonResponse([storedFeedback({
        improved_version: "A clearer retained-meaning version.",
        transcription_improved: "My first transcription",
        transcription_model: "My model transcription",
        transcription_version: 3,
        topic_resource: CANONICAL_DSE_TOPIC
      })]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const headers = { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` };
  const list = await worker.fetch(new Request("https://worker.example/v1/submissions", { headers }), environment());
  assert.equal(list.status, 200);
  const listItem = (await list.json()).submissions[0];
  assert.equal(listItem.hasPublishedFeedback, true);
  assert.equal(listItem.feedbackUnread, true);

  const opened = await worker.fetch(new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}/feedback`,
    { headers }
  ), environment());
  assert.equal(opened.status, 200);
  const feedback = (await opened.json()).feedback;
  assert.equal(feedback.improvedVersion, "A clearer retained-meaning version.");
  assert.equal(feedback.transcriptionVersion, 3);
  assert.equal(feedback.topicResource.id, CANONICAL_DSE_TOPIC.id);
  assert.ok(calls.some(call => call.name === "writing_submission_feedback_student_open_v5"
    && call.body.p_student_id === STUDENT_ID));
});

test("student transcription save is owner-scoped and maps version conflicts", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let conflict = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_feedback_student_save_transcriptions") {
      assert.equal(rpc.body.p_student_id, STUDENT_ID);
      assert.equal(rpc.body.p_submission_id, SUBMISSION_ID);
      assert.equal(rpc.body.p_expected_version, 3);
      if (conflict) return jsonResponse({ code: "P4090" }, 400);
      return jsonResponse([{
        improved_version_copy: rpc.body.p_improved_version_copy,
        model_essay_copy: rpc.body.p_model_essay_copy,
        version: 4,
        updated_at: "2026-08-12T05:00:00.000Z"
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const request = () => new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}/transcriptions`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        improvedVersionCopy: "Copied improved version",
        modelEssayCopy: "Copied model essay",
        expectedVersion: 3
      })
    }
  );
  const saved = await worker.fetch(request(), environment());
  assert.equal(saved.status, 200);
  assert.equal((await saved.json()).transcriptions.version, 4);
  conflict = true;
  const stale = await worker.fetch(request(), environment());
  assert.equal(stale.status, 409);
  assert.equal((await stale.json()).code, "TRANSCRIPTION_VERSION_CONFLICT");
});

test("published admin feedback allows optional headers and carries the improved version", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_save_v5") {
      assert.equal(rpc.body.p_overall_comment, "");
      assert.equal(rpc.body.p_final_comment, "");
      assert.equal(rpc.body.p_improved_version, "A polished passage.");
      return jsonResponse([storedFeedback({
        overall_comment: "",
        final_comment: "",
        improved_version: rpc.body.p_improved_version,
        fragments: [],
        version: 1
      })]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const response = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        overallComment: "",
        fragments: [],
        finalComment: "",
        improvedVersion: "A polished passage.",
        status: "published",
        expectedVersion: 0,
        expectedFeedbackId: null
      })
    }
  ), environment());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).feedback.improvedVersion, "A polished passage.");
});

test("administrator can load, save and delete structured teacher feedback", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    calls.push(rpc);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_get_v6") {
      return jsonResponse([storedFeedback({ status: "draft", published_at: null })]);
    }
    if (rpc.name === "writing_submission_feedback_admin_save_v5") {
      assert.equal(rpc.body.p_admin_token, ADMIN_TOKEN);
      assert.equal(rpc.body.p_submission_id, SUBMISSION_ID);
      assert.equal(rpc.body.p_status, "published");
      assert.equal(rpc.body.p_expected_version, 2);
      assert.equal(rpc.body.p_expected_feedback_id, FEEDBACK_ID);
      assert.deepEqual(rpc.body.p_fragments, [{
        id: FRAGMENT_ID,
        originalFragment: "Students learns quickly.",
        edmundComment: "Students 是複數，動詞使用 learn。",
        suggestedWriting: "Students learn quickly.",
        originalFormatting: [
          { start: 0, end: 8, bold: true, highlight: "" },
          { start: 9, end: 15, bold: false, highlight: "yellow" }
        ],
        commentFormatting: [
          { start: 0, end: 8, bold: true, highlight: "orange" },
          { start: 9, end: 10, bold: false, highlight: "blue" }
        ],
        suggestionFormatting: [
          { start: 0, end: 8, bold: true, highlight: "green" }
        ]
      }]);
      return jsonResponse([storedFeedback({ version: 3 })]);
    }
    if (rpc.name === "writing_submission_feedback_admin_delete") {
      assert.equal(rpc.body.p_expected_version, 3);
      assert.equal(rpc.body.p_expected_feedback_id, FEEDBACK_ID);
      return jsonResponse(1);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const headers = { Origin: ORIGIN, Authorization: `Bearer ${ADMIN_TOKEN}` };

  const getResponse = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
    { headers }
  ), environment());
  assert.equal(getResponse.status, 200);
  assert.equal((await getResponse.json()).feedback.status, "draft");

  const limiterBinding = limiter();
  const putResponse = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
    {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        overallComment: "整體表達清楚。",
        fragments: [{
          id: FRAGMENT_ID,
          originalFragment: "Students learns quickly.",
          edmundComment: "Students 是複數，動詞使用 learn。",
          suggestedWriting: "Students learn quickly.",
          originalFormatting: [
            { start: 0, end: 8, bold: true, highlight: "" },
            { start: 9, end: 15, bold: false, highlight: "yellow" }
          ],
          commentFormatting: [
            { start: 0, end: 8, bold: true, highlight: "orange" },
            { start: 9, end: 10, bold: false, highlight: "blue" }
          ],
          suggestionFormatting: [
            { start: 0, end: 8, bold: true, highlight: "green" }
          ]
        }],
        finalComment: "繼續留意句子連接。",
        improvedVersion: "Students learn quickly and explain their ideas clearly.",
        status: "published",
        expectedVersion: 2,
        expectedFeedbackId: FEEDBACK_ID
      })
    }
  ), environment({ SUBMISSION_WRITE_RATE_LIMITER: limiterBinding }));
  assert.equal(putResponse.status, 200);
  assert.equal((await putResponse.json()).feedback.version, 3);

  const deleteResponse = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
    {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ expectedVersion: 3, expectedFeedbackId: FEEDBACK_ID })
    }
  ), environment({ SUBMISSION_WRITE_RATE_LIMITER: limiterBinding }));
  assert.equal(deleteResponse.status, 204);
  assert.deepEqual(limiterBinding.calls, [
    { key: `writing-submission-admin-feedback:${ADMIN_ID}` },
    { key: `writing-submission-admin-feedback:${ADMIN_ID}` }
  ]);
  assert.equal(calls.filter(call => call.name === "writing_submission_feedback_admin_save_v5").length, 1);
});

test("legacy two-field feedback saves are normalized before storage", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_save_v5") {
      assert.deepEqual(rpc.body.p_fragments, [{
        id: null,
        originalFragment: "Legacy original.",
        edmundComment: "Legacy comment.",
        suggestedWriting: "",
        originalFormatting: [],
        commentFormatting: [],
        suggestionFormatting: []
      }]);
      return jsonResponse([storedFeedback({
        fragments: rpc.body.p_fragments,
        version: 1
      })]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        overallComment: "",
        fragments: [{
          originalFragment: "Legacy original.",
          edmundComment: "Legacy comment."
        }],
        finalComment: "",
        improvedVersion: "",
        status: "draft",
        expectedVersion: 0,
        expectedFeedbackId: null
      })
    }
  ), environment());
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).feedback.fragments[0], {
    id: null,
    position: 1,
    originalFragment: "Legacy original.",
    edmundComment: "Legacy comment.",
    suggestedWriting: "",
    originalFormatting: [],
    commentFormatting: [],
    suggestionFormatting: [],
    suggestionCopyText: "",
    suggestionCopyVersion: 0,
    suggestionCopyUpdatedAt: null,
    bookmarked: false,
    bookmarkVersion: 0
  });
});

test("published enhanced feedback does not require suggested writing", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_save_v5") {
      assert.equal(rpc.body.p_status, "published");
      assert.equal(rpc.body.p_fragments[0].suggestedWriting, "");
      return jsonResponse([storedFeedback({
        fragments: rpc.body.p_fragments,
        status: "published",
        version: 1
      })]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        overallComment: "",
        fragments: [{
          originalFragment: "Original.",
          edmundComment: "Comment.",
          suggestedWriting: "",
          originalFormatting: [],
          commentFormatting: [],
          suggestionFormatting: []
        }],
        finalComment: "",
        improvedVersion: "",
        status: "published",
        expectedVersion: 0,
        expectedFeedbackId: null
      })
    }
  ), environment());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).feedback.fragments[0].suggestedWriting, "");
});

test("feedback formatting rejects invalid shapes, ranges, styles and oversized arrays", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let saveCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_save_v5") saveCalled = true;
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const validFragment = {
    originalFragment: "Original.",
    edmundComment: "Comment.",
    suggestedWriting: "Suggestion.",
    originalFormatting: [{ start: 0, end: 8, bold: true, highlight: "yellow" }],
    commentFormatting: [],
    suggestionFormatting: []
  };
  const invalidFragments = [
    { ...validFragment, originalFormatting: "not-an-array" },
    { ...validFragment, originalFormatting: [{ start: 0, end: 8, bold: true, highlight: "pink" }] },
    { ...validFragment, originalFormatting: [{ start: 0.5, end: 8, bold: true, highlight: "blue" }] },
    { ...validFragment, originalFormatting: [{ start: -1, end: 8, bold: true, highlight: "blue" }] },
    { ...validFragment, originalFormatting: [{ start: 2, end: 2, bold: true, highlight: "blue" }] },
    { ...validFragment, originalFormatting: [{ start: 0, end: 10, bold: true, highlight: "blue" }] },
    { ...validFragment, originalFormatting: [{ start: 0, end: 8, bold: "yes", highlight: "blue" }] },
    {
      ...validFragment,
      originalFormatting: [{ start: 0, end: 8, bold: true, highlight: "blue", extra: true }]
    },
    {
      ...validFragment,
      originalFormatting: Array.from(
        { length: 501 },
        () => ({ start: 0, end: 1, bold: false, highlight: "" })
      )
    },
    {
      ...validFragment,
      suggestedWriting: "",
      suggestionFormatting: [{ start: 0, end: 1, bold: true, highlight: "green" }]
    }
  ];
  const headers = {
    Origin: ORIGIN,
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    "Content-Type": "application/json"
  };
  for (const fragment of invalidFragments) {
    const response = await worker.fetch(new Request(
      `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          overallComment: "",
          fragments: [fragment],
          finalComment: "",
          improvedVersion: "",
          status: "draft",
          expectedVersion: 0,
          expectedFeedbackId: null
        })
      }
    ), environment());
    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, "INVALID_FEEDBACK");
  }
  assert.equal(saveCalled, false);
});

test("published feedback rejects incomplete fragment pairs before storage", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let saveCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_save_v5") saveCalled = true;
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const response = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        overallComment: "整體評語",
        fragments: [{ originalFragment: "Original only", edmundComment: "" }],
        finalComment: "最後評語",
        improvedVersion: "",
        status: "published",
        expectedVersion: 0,
        expectedFeedbackId: null
      })
    }
  ), environment());
  assert.equal(response.status, 400);
  assert.equal((await response.json()).code, "INVALID_FEEDBACK");
  assert.equal(saveCalled, false);
});

test("feedback saves require a valid version and matching feedback identity shape", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let saveCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_save_v5") saveCalled = true;
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const headers = {
    Origin: ORIGIN,
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    "Content-Type": "application/json"
  };
  const validFeedbackWithoutVersion = {
    overallComment: "整體評語",
    fragments: [{ originalFragment: "Original", edmundComment: "Comment" }],
    finalComment: "最後評語",
    status: "draft"
  };
  for (const payload of [
    validFeedbackWithoutVersion,
    { ...validFeedbackWithoutVersion, expectedVersion: -1, expectedFeedbackId: null },
    { ...validFeedbackWithoutVersion, expectedVersion: 1.5, expectedFeedbackId: FEEDBACK_ID },
    { ...validFeedbackWithoutVersion, expectedVersion: 0, expectedFeedbackId: FEEDBACK_ID },
    { ...validFeedbackWithoutVersion, expectedVersion: 1, expectedFeedbackId: null },
    { ...validFeedbackWithoutVersion, expectedVersion: 1, expectedFeedbackId: "not-a-uuid" },
    { ...validFeedbackWithoutVersion, expectedVersion: 1, expectedFeedbackId: FEEDBACK_ID }
  ]) {
    const response = await worker.fetch(new Request(
      `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
      { method: "PUT", headers, body: JSON.stringify(payload) }
    ), environment());
    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, "INVALID_FEEDBACK");
  }
  assert.equal(saveCalled, false);
});

test("stale administrator feedback saves return a specific 409 without exposing database details", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_save_v5") {
      assert.equal(rpc.body.p_expected_version, 2);
      assert.equal(rpc.body.p_expected_feedback_id, FEEDBACK_ID);
      return jsonResponse({
        code: "P4090",
        message: "private database detail must not be exposed"
      }, 400);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const response = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        overallComment: "整體評語",
        fragments: [{ id: FRAGMENT_ID, originalFragment: "Original", edmundComment: "Comment",
          suggestedWriting: "", originalFormatting: [], commentFormatting: [], suggestionFormatting: [] }],
        finalComment: "最後評語",
        status: "draft",
        expectedVersion: 2,
        expectedFeedbackId: FEEDBACK_ID
      })
    }
  ), environment());
  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), {
    error: "Feedback was changed in another session; reload it before saving again",
    code: "FEEDBACK_VERSION_CONFLICT"
  });
});

test("feedback deletion requires the current expected version and rejects stale deletes", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let deleteCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_delete") {
      deleteCalled = true;
      assert.equal(rpc.body.p_expected_version, 2);
      return jsonResponse({ code: "P4090", message: "private database detail" }, 400);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const route = `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`;
  const headers = {
    Origin: ORIGIN,
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    "Content-Type": "application/json"
  };

  for (const body of [
    {},
    { expectedVersion: 0, expectedFeedbackId: FEEDBACK_ID },
    { expectedVersion: 1.5, expectedFeedbackId: FEEDBACK_ID },
    { expectedVersion: 2, expectedFeedbackId: null },
    { expectedVersion: 2, expectedFeedbackId: "not-a-uuid" }
  ]) {
    const response = await worker.fetch(new Request(route, {
      method: "DELETE",
      headers,
      body: JSON.stringify(body)
    }), environment());
    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, "INVALID_FEEDBACK");
  }
  assert.equal(deleteCalled, false);

  const staleResponse = await worker.fetch(new Request(route, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ expectedVersion: 2, expectedFeedbackId: FEEDBACK_ID })
  }), environment());
  assert.equal(staleResponse.status, 409);
  assert.deepEqual(await staleResponse.json(), {
    error: "Feedback was changed in another session; reload it before deleting",
    code: "FEEDBACK_VERSION_CONFLICT"
  });
  assert.equal(deleteCalled, true);
});

test("deleted and recreated feedback rejects stale save and delete requests from the old identity", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let operation = 0;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    operation += 1;
    if (operation === 1 && rpc.name === "writing_submission_feedback_admin_delete") {
      assert.equal(rpc.body.p_expected_version, 2);
      assert.equal(rpc.body.p_expected_feedback_id, FEEDBACK_ID);
      return jsonResponse(1);
    }
    if (operation === 2 && rpc.name === "writing_submission_feedback_admin_save_v5") {
      assert.equal(rpc.body.p_expected_version, 0);
      assert.equal(rpc.body.p_expected_feedback_id, null);
      return jsonResponse([storedFeedback({
        id: RECREATED_FEEDBACK_ID,
        version: 1,
        status: "draft",
        published_at: null
      })]);
    }
    if (operation === 3 && rpc.name === "writing_submission_feedback_admin_save_v5") {
      // Version 1 exists again, but it belongs to the recreated feedback ID.
      assert.equal(rpc.body.p_expected_version, 1);
      assert.equal(rpc.body.p_expected_feedback_id, FEEDBACK_ID);
      return jsonResponse({ code: "P4090", message: "feedback identity conflict" }, 400);
    }
    if (operation === 4 && rpc.name === "writing_submission_feedback_admin_delete") {
      assert.equal(rpc.body.p_expected_version, 1);
      assert.equal(rpc.body.p_expected_feedback_id, FEEDBACK_ID);
      return jsonResponse({ code: "P4090", message: "feedback identity conflict" }, 400);
    }
    throw new Error(`Unexpected RPC ${rpc.name} at operation ${operation}`);
  };

  const route = `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`;
  const headers = {
    Origin: ORIGIN,
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    "Content-Type": "application/json"
  };
  const validDraft = {
    overallComment: "整體評語",
    fragments: [{
      id: null,
      originalFragment: "Original",
      edmundComment: "Comment",
      suggestedWriting: "",
      originalFormatting: [],
      commentFormatting: [],
      suggestionFormatting: []
    }],
    finalComment: "最後評語",
    status: "draft"
  };

  const originalDelete = await worker.fetch(new Request(route, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ expectedVersion: 2, expectedFeedbackId: FEEDBACK_ID })
  }), environment());
  assert.equal(originalDelete.status, 204);

  const recreate = await worker.fetch(new Request(route, {
    method: "PUT",
    headers,
    body: JSON.stringify({ ...validDraft, expectedVersion: 0, expectedFeedbackId: null })
  }), environment());
  assert.equal(recreate.status, 200);
  assert.equal((await recreate.json()).feedback.id, RECREATED_FEEDBACK_ID);

  const staleSave = await worker.fetch(new Request(route, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      ...validDraft,
      expectedVersion: 1,
      expectedFeedbackId: FEEDBACK_ID
    })
  }), environment());
  assert.equal(staleSave.status, 409);
  assert.equal((await staleSave.json()).code, "FEEDBACK_VERSION_CONFLICT");

  const staleDelete = await worker.fetch(new Request(route, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ expectedVersion: 1, expectedFeedbackId: FEEDBACK_ID })
  }), environment());
  assert.equal(staleDelete.status, 409);
  assert.equal((await staleDelete.json()).code, "FEEDBACK_VERSION_CONFLICT");
  assert.equal(operation, 4);
});

test("student feedback returns learning sections and owner-specific fragment state", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_feedback_student_open_v5") {
      assert.deepEqual(rpc.body, {
        p_student_id: STUDENT_ID,
        p_submission_id: SUBMISSION_ID
      });
      return jsonResponse([storedFeedback({
        grammar_points: [{
          text: "Use a plural verb after Students.",
          formatting: [{ start: 0, end: 3, bold: true, highlight: "blue" }]
        }],
        sentence_structure_methods: [{
          text: "Use a concessive clause before the main point.",
          formatting: []
        }],
        sentence_structure_links: [{
          label: "Concessive clauses",
          url: "/sentence-structure.html?lesson=concessive"
        }],
        sentence_structure_parts: [{
          originalSentence: {
            text: "Students learns quickly.",
            formatting: [{
              start: 0, end: 8, bold: false, italic: true, strikethrough: false,
              highlight: "red"
            }]
          },
          enhancement: { text: "Students learn quickly.", formatting: [] },
          benefit: { text: "Correct subject–verb agreement.", formatting: [] }
        }],
        rhetorical_parts: [{
          originalSentence: { text: "This is useful.", formatting: [] },
          enhancement: { text: "This approach is especially valuable.", formatting: [] },
          benefit: { text: "Uses more precise emphasis.", formatting: [] }
        }],
        phrasal_verb_parts: [{
          originalSentence: { text: "They continued.", formatting: [] },
          enhancement: { text: "They carried on.", formatting: [] },
          benefit: { text: "Uses a natural phrasal verb.", formatting: [] }
        }],
        writing_common_expression_parts: [{
          originalSentence: { text: "This shows the point.", formatting: [] },
          enhancement: { text: "This lends support to the view.", formatting: [] },
          benefit: { text: "Uses an academic expression.", formatting: [] }
        }],
        rhetorical_common_expression_parts: [{
          originalSentence: { text: "The result is clear.", formatting: [] },
          enhancement: { text: "The result speaks for itself.", formatting: [] },
          benefit: { text: "Adds rhetorical emphasis.", formatting: [] }
        }],
        enhancement_copies: [{
          sectionKey: "sentence-structure",
          itemPosition: 1,
          text: "Students learn quickly.",
          version: 2,
          updatedAt: "2026-08-14T09:30:00.000Z"
        }],
        fragments: [{
          ...storedFeedback().fragments[0],
          suggestionCopyText: "Students learn quickly.",
          suggestionCopyVersion: 4,
          suggestionCopyUpdatedAt: "2026-08-14T09:00:00.000Z",
          bookmarked: true,
          bookmarkVersion: 3
        }]
      })]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    `https://worker.example/v1/submissions/${SUBMISSION_ID}/feedback`,
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(response.status, 200);
  const feedback = (await response.json()).feedback;
  assert.equal(feedback.grammarPoints[0].text, "Use a plural verb after Students.");
  assert.equal(feedback.sentenceStructureMethods[0].text, "Use a concessive clause before the main point.");
  assert.equal(feedback.sentenceStructureLinks[0].url, "/sentence-structure.html?lesson=concessive");
  assert.equal(feedback.sentenceStructureParts[0].enhancement.text, "Students learn quickly.");
  assert.deepEqual(feedback.sentenceStructureParts[0].originalSentence.formatting, [{
    start: 0, end: 8, bold: false, italic: true, strikethrough: false, highlight: "red"
  }]);
  assert.equal(feedback.rhetoricalParts[0].benefit.text, "Uses more precise emphasis.");
  assert.equal(feedback.phrasalVerbParts[0].enhancement.text, "They carried on.");
  assert.equal(
    feedback.writingCommonExpressionParts[0].enhancement.text,
    "This lends support to the view."
  );
  assert.equal(
    feedback.rhetoricalCommonExpressionParts[0].benefit.text,
    "Adds rhetorical emphasis."
  );
  assert.deepEqual(feedback.enhancementCopies[0], {
    sectionKey: "sentence-structure",
    itemPosition: 1,
    text: "Students learn quickly.",
    version: 2,
    updatedAt: "2026-08-14T09:30:00.000Z"
  });
  assert.deepEqual({
    text: feedback.fragments[0].suggestionCopyText,
    version: feedback.fragments[0].suggestionCopyVersion,
    updatedAt: feedback.fragments[0].suggestionCopyUpdatedAt,
    bookmarked: feedback.fragments[0].bookmarked,
    bookmarkVersion: feedback.fragments[0].bookmarkVersion
  }, {
    text: "Students learn quickly.",
    version: 4,
    updatedAt: "2026-08-14T09:00:00.000Z",
    bookmarked: true,
    bookmarkVersion: 3
  });
});

test("students save a bounded per-fragment suggestion copy with optimistic concurrency", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let conflict = false;
  let saveCalls = 0;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_feedback_student_save_fragment_copy_v2") {
      saveCalls += 1;
      assert.deepEqual(rpc.body, {
        p_student_id: STUDENT_ID,
        p_submission_id: SUBMISSION_ID,
        p_fragment_id: FRAGMENT_ID,
        p_copy_text: "My copied suggestion.\nSecond line.",
        p_expected_version: 2
      });
      if (conflict) return jsonResponse({ code: "P4092" }, 400);
      return jsonResponse([{
        fragment_id: FRAGMENT_ID,
        copy_text: rpc.body.p_copy_text,
        version: 3,
        updated_at: "2026-08-14T10:00:00.000Z"
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const limiterBinding = limiter();
  const route = `https://worker.example/v1/submissions/${SUBMISSION_ID}/feedback/fragments/${FRAGMENT_ID}/suggestion-copy`;
  const request = body => new Request(route, {
    method: "PUT",
    headers: {
      Origin: ORIGIN,
      Authorization: `Bearer ${STUDENT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const validBody = { text: "My copied suggestion.\r\nSecond line.", expectedVersion: 2 };

  const saved = await worker.fetch(request(validBody), environment({
    SUBMISSION_WRITE_RATE_LIMITER: limiterBinding
  }));
  assert.equal(saved.status, 200);
  assert.deepEqual((await saved.json()).suggestionCopy, {
    fragmentId: FRAGMENT_ID,
    text: "My copied suggestion.\nSecond line.",
    version: 3,
    updatedAt: "2026-08-14T10:00:00.000Z"
  });

  conflict = true;
  const stale = await worker.fetch(request(validBody), environment({
    SUBMISSION_WRITE_RATE_LIMITER: limiterBinding
  }));
  assert.equal(stale.status, 409);
  assert.equal((await stale.json()).code, "SUGGESTION_COPY_VERSION_CONFLICT");

  const invalid = await worker.fetch(request({ ...validBody, studentId: STUDENT_ID }), environment({
    SUBMISSION_WRITE_RATE_LIMITER: limiterBinding
  }));
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).code, "INVALID_SUGGESTION_COPY");
  assert.equal(saveCalls, 2, "invalid request shapes must not reach the write RPC");
  assert.deepEqual(limiterBinding.calls, [
    { key: `writing-submission-suggestion-copy:${STUDENT_ID}` },
    { key: `writing-submission-suggestion-copy:${STUDENT_ID}` },
    { key: `writing-submission-suggestion-copy:${STUDENT_ID}` }
  ]);
});

test("students save each published enhancement copy with owner scope and optimistic concurrency", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let conflict = false;
  let saveCalls = 0;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_feedback_student_save_enhancement_copy_v2") {
      saveCalls += 1;
      assert.deepEqual(rpc.body, {
        p_student_id: STUDENT_ID,
        p_submission_id: SUBMISSION_ID,
        p_section_key: "sentence-structure",
        p_item_position: 1,
        p_copy_text: "My sentence-structure copy.\nSecond line.",
        p_expected_version: 2
      });
      if (conflict) return jsonResponse({ code: "P4093" }, 400);
      return jsonResponse([{
        section_key: rpc.body.p_section_key,
        item_position: rpc.body.p_item_position,
        copy_text: rpc.body.p_copy_text,
        version: 3,
        updated_at: "2026-08-20T10:00:00.000Z"
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const limiterBinding = limiter();
  const route = `https://worker.example/v1/submissions/${SUBMISSION_ID}/feedback/enhancements/sentence-structure/1/copy`;
  const request = (body, requestRoute = route) => new Request(requestRoute, {
    method: "PUT",
    headers: {
      Origin: ORIGIN,
      Authorization: `Bearer ${STUDENT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const validBody = {
    text: "My sentence-structure copy.\r\nSecond line.",
    expectedVersion: 2
  };

  const saved = await worker.fetch(request(validBody), environment({
    SUBMISSION_WRITE_RATE_LIMITER: limiterBinding
  }));
  assert.equal(saved.status, 200);
  assert.deepEqual((await saved.json()).enhancementCopy, {
    sectionKey: "sentence-structure",
    itemPosition: 1,
    text: "My sentence-structure copy.\nSecond line.",
    version: 3,
    updatedAt: "2026-08-20T10:00:00.000Z"
  });

  conflict = true;
  const stale = await worker.fetch(request(validBody), environment({
    SUBMISSION_WRITE_RATE_LIMITER: limiterBinding
  }));
  assert.equal(stale.status, 409);
  assert.equal((await stale.json()).code, "ENHANCEMENT_COPY_VERSION_CONFLICT");

  const outOfRange = await worker.fetch(request(
    validBody,
    `https://worker.example/v1/submissions/${SUBMISSION_ID}/feedback/enhancements/sentence-structure/101/copy`
  ), environment({ SUBMISSION_WRITE_RATE_LIMITER: limiterBinding }));
  assert.equal(outOfRange.status, 404);
  assert.equal((await outOfRange.json()).code, "FEEDBACK_ENHANCEMENT_NOT_FOUND");
  assert.equal(saveCalls, 2, "invalid item positions must not reach the write RPC");
  assert.deepEqual(limiterBinding.calls, [
    { key: `writing-submission-enhancement-copy:${STUDENT_ID}` },
    { key: `writing-submission-enhancement-copy:${STUDENT_ID}` }
  ]);
});

test("student bookmark list and idempotent state updates stay owner-derived and versioned", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let conflict = false;
  let writeCalls = 0;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_feedback_bookmarks_list_v2") {
      assert.deepEqual(rpc.body, { p_student_id: STUDENT_ID, p_limit: 3, p_offset: 0 });
      return jsonResponse([{
        fragment_id: FRAGMENT_ID,
        feedback_id: FEEDBACK_ID,
        submission_id: SUBMISSION_ID,
        topic: "A school proposal",
        position: 1,
        original_fragment: "Students learns quickly.",
        edmund_comment: "Use a plural verb.",
        suggested_writing: "Students learn quickly.",
        original_formatting: [],
        comment_formatting: [],
        suggestion_formatting: [],
        version: 5,
        updated_at: "2026-08-14T11:00:00.000Z",
        published_at: "2026-08-14T08:00:00.000Z"
      }]);
    }
    if (rpc.name === "writing_submission_feedback_bookmark_set_v2") {
      writeCalls += 1;
      assert.deepEqual(rpc.body, {
        p_student_id: STUDENT_ID,
        p_fragment_id: FRAGMENT_ID,
        p_bookmarked: false,
        p_expected_version: 5
      });
      if (conflict) return jsonResponse({ code: "P4093" }, 400);
      return jsonResponse([{
        fragment_id: FRAGMENT_ID,
        bookmarked: false,
        version: 6,
        updated_at: "2026-08-14T11:05:00.000Z"
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const headers = { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` };
  const list = await worker.fetch(new Request(
    "https://worker.example/v1/feedback-bookmarks?page=1&pageSize=2",
    { headers }
  ), environment());
  assert.equal(list.status, 200);
  const listed = await list.json();
  assert.equal(listed.bookmarks[0].fragmentId, FRAGMENT_ID);
  assert.equal(listed.bookmarks[0].topic, "A school proposal");
  assert.equal(listed.bookmarks[0].version, 5);
  assert.equal(listed.hasMore, false);

  const route = `https://worker.example/v1/feedback-bookmarks/${FRAGMENT_ID}`;
  const request = body => new Request(route, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const limiterBinding = limiter();
  const saved = await worker.fetch(
    request({ bookmarked: false, expectedVersion: 5 }),
    environment({ SUBMISSION_WRITE_RATE_LIMITER: limiterBinding })
  );
  assert.equal(saved.status, 200);
  assert.deepEqual((await saved.json()).bookmark, {
    fragmentId: FRAGMENT_ID,
    bookmarked: false,
    version: 6,
    updatedAt: "2026-08-14T11:05:00.000Z"
  });

  conflict = true;
  const stale = await worker.fetch(
    request({ bookmarked: false, expectedVersion: 5 }),
    environment({ SUBMISSION_WRITE_RATE_LIMITER: limiterBinding })
  );
  assert.equal(stale.status, 409);
  assert.equal((await stale.json()).code, "BOOKMARK_VERSION_CONFLICT");

  const invalid = await worker.fetch(
    request({ bookmarked: "false", expectedVersion: 5 }),
    environment({ SUBMISSION_WRITE_RATE_LIMITER: limiterBinding })
  );
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).code, "INVALID_BOOKMARK");
  assert.equal(writeCalls, 2, "invalid bookmark input must not reach storage");
});

test("administrator learning tools use exact rich-text shapes and internal sentence links", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let saveCalls = 0;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_save_v5") {
      saveCalls += 1;
      assert.equal(rpc.body.p_fragments[0].id, FRAGMENT_ID);
      assert.equal(rpc.body.p_sentence_structure_parts, null);
      assert.equal(rpc.body.p_rhetorical_parts, null);
      assert.deepEqual(rpc.body.p_grammar_points, [{
        text: "Subject–verb agreement",
        formatting: [{ start: 0, end: 7, bold: true, highlight: "blue" }]
      }]);
      assert.deepEqual(rpc.body.p_sentence_structure_methods, [{
        text: "Begin with Although.",
        formatting: []
      }]);
      assert.deepEqual(rpc.body.p_sentence_structure_links, [{
        label: "Although practice",
        url: "/sentence-structure.html?lesson=although"
      }]);
      return jsonResponse([storedFeedback({
        version: 3,
        grammar_points: rpc.body.p_grammar_points,
        sentence_structure_methods: rpc.body.p_sentence_structure_methods,
        sentence_structure_links: rpc.body.p_sentence_structure_links
      })]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const route = `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`;
  const headers = {
    Origin: ORIGIN,
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    "Content-Type": "application/json"
  };
  const { position: _position, ...adminFragment } = storedFeedback().fragments[0];
  const payload = {
    overallComment: "",
    fragments: [{ ...adminFragment, id: FRAGMENT_ID }],
    finalComment: "",
    improvedVersion: "",
    grammarPoints: [{
      text: "Subject–verb agreement",
      formatting: [{ start: 0, end: 7, bold: true, highlight: "blue" }]
    }],
    sentenceStructureMethods: [{ text: "Begin with Although.", formatting: [] }],
    sentenceStructureLinks: [{
      label: "Although practice",
      url: "/sentence-structure.html?lesson=%61lthough"
    }],
    status: "published",
    expectedVersion: 2,
    expectedFeedbackId: FEEDBACK_ID
  };
  const response = await worker.fetch(new Request(route, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload)
  }), environment());
  assert.equal(response.status, 200);
  const feedback = (await response.json()).feedback;
  assert.equal(feedback.grammarPoints[0].text, "Subject–verb agreement");
  assert.equal(feedback.sentenceStructureMethods[0].text, "Begin with Although.");
  assert.equal(feedback.sentenceStructureLinks[0].label, "Although practice");

  for (const invalidPayload of [
    { ...payload, grammarPoints: [{ text: "", formatting: [] }] },
    { ...payload, grammarPoints: [{ text: "Point", formatting: [], html: "<b>Point</b>" }] },
    { ...payload, sentenceStructureMethods: [{ text: "Point", formatting: [{ start: 0, end: 99, bold: true, highlight: "green" }] }] },
    { ...payload, sentenceStructureLinks: [{ label: "External", url: "https://attacker.example/" }] },
    { ...payload, sentenceStructureLinks: [{ label: "Wrong system", url: "/writing-submission.html?lesson=one" }] },
    { ...payload, sentenceStructureLinks: [{ label: "Hash", url: "/sentence-structure.html?lesson=one#two" }] },
    { ...payload, sentenceStructureLinks: [{ label: "Extra", url: "/sentence-structure.html?lesson=one&mode=two" }] },
    { ...payload, sentenceStructureLinks: [{ label: "Duplicate", url: "/sentence-structure.html?lesson=one&lesson=two" }] },
    { ...payload, sentenceStructureLinks: [{ label: "Unsafe lesson", url: "/sentence-structure.html?lesson=../../admin" }] }
  ]) {
    const invalid = await worker.fetch(new Request(route, {
      method: "PUT",
      headers,
      body: JSON.stringify(invalidPayload)
    }), environment());
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).code, "INVALID_FEEDBACK");
  }
  assert.equal(saveCalls, 1, "invalid rich text and links must not reach storage");
});

test("rich-text formatting offsets use JavaScript UTF-16 positions after emoji", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let saveCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_save_v5") {
      saveCalled = true;
      assert.deepEqual(rpc.body.p_grammar_points, [{
        text: "😀A",
        formatting: [{ start: 2, end: 3, bold: true, highlight: "yellow" }]
      }]);
      return jsonResponse([storedFeedback({
        grammar_points: rpc.body.p_grammar_points,
        sentence_structure_methods: [],
        sentence_structure_links: [],
        version: 3
      })]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        overallComment: "",
        fragments: [],
        finalComment: "",
        improvedVersion: "",
        grammarPoints: [{
          text: "😀A",
          formatting: [{ start: 2, end: 3, bold: true, highlight: "yellow" }]
        }],
        sentenceStructureMethods: [],
        sentenceStructureLinks: [],
        status: "draft",
        expectedVersion: 2,
        expectedFeedbackId: FEEDBACK_ID
      })
    }
  ), environment());
  assert.equal(response.status, 200);
  assert.equal(saveCalled, true, "UTF-16 run [2,3) must reach the storage RPC");
  assert.deepEqual((await response.json()).feedback.grammarPoints[0], {
    text: "😀A",
    formatting: [{
      start: 2, end: 3, bold: true, italic: false, strikethrough: false, highlight: "yellow"
    }]
  });
});

test("structured sentence and rhetorical parts preserve order and expanded formatting", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let saveCalls = 0;
  const sentenceStructureParts = [{
    originalSentence: {
      text: "Weak sentence",
      formatting: [{
        start: 0, end: 4, bold: false, italic: true, strikethrough: true,
        highlight: "red"
      }]
    },
    enhancement: { text: "A more precise sentence", formatting: [] },
    benefit: { text: "Clearer academic tone", formatting: [] }
  }];
  const rhetoricalParts = [{
    originalSentence: {
      text: "Tone",
      formatting: [{ start: 0, end: 4, bold: true, highlight: "red" }]
    },
    enhancement: { text: "Purposeful rhetorical tone", formatting: [] },
    benefit: { text: "Stronger persuasion", formatting: [] }
  }];
  const orderedLinks = [
    { label: "Second exercise", url: "/sentence-structure.html?lesson=second" },
    { label: "First exercise", url: "/sentence-structure.html?lesson=first" }
  ];
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_save_v5") {
      saveCalls += 1;
      assert.deepEqual(rpc.body.p_sentence_structure_parts, sentenceStructureParts);
      assert.deepEqual(rpc.body.p_rhetorical_parts, rhetoricalParts);
      assert.deepEqual(rpc.body.p_sentence_structure_links, orderedLinks);
      return jsonResponse([storedFeedback({
        fragments: [],
        grammar_points: [],
        sentence_structure_methods: [],
        sentence_structure_links: rpc.body.p_sentence_structure_links,
        sentence_structure_parts: rpc.body.p_sentence_structure_parts,
        rhetorical_parts: rpc.body.p_rhetorical_parts,
        status: "draft",
        published_at: null,
        version: 1
      })]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        overallComment: "",
        fragments: [],
        finalComment: "",
        improvedVersion: "",
        grammarPoints: [],
        sentenceStructureMethods: [],
        sentenceStructureLinks: orderedLinks,
        sentenceStructureParts,
        rhetoricalParts,
        status: "draft",
        expectedVersion: 0,
        expectedFeedbackId: null
      })
    }
  ), environment());

  assert.equal(response.status, 200);
  assert.equal(saveCalls, 1);
  const feedback = (await response.json()).feedback;
  assert.deepEqual(feedback.sentenceStructureLinks, orderedLinks);
  assert.deepEqual(feedback.sentenceStructureParts[0].originalSentence.formatting, [{
    start: 0, end: 4, bold: false, italic: true, strikethrough: true, highlight: "red"
  }]);
  assert.deepEqual(feedback.rhetoricalParts[0].originalSentence.formatting, [{
    start: 0, end: 4, bold: true, italic: false, strikethrough: false, highlight: "red"
  }]);
});

test("administrator feedback round-trips all three additional enhancement sections", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const makePart = (original, enhancement, benefit) => [{
    originalSentence: { text: original, formatting: [] },
    enhancement: { text: enhancement, formatting: [] },
    benefit: { text: benefit, formatting: [] }
  }];
  const phrasalVerbParts = makePart("They continued.", "They carried on.", "Natural phrasing.");
  const writingCommonExpressionParts = makePart(
    "This proves it.",
    "This lends support to the view.",
    "Academic register."
  );
  const rhetoricalCommonExpressionParts = makePart(
    "It is clear.",
    "The evidence speaks for itself.",
    "Rhetorical emphasis."
  );
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_save_v5") {
      assert.deepEqual(rpc.body.p_phrasal_verb_parts, phrasalVerbParts);
      assert.deepEqual(
        rpc.body.p_writing_common_expression_parts,
        writingCommonExpressionParts
      );
      assert.deepEqual(
        rpc.body.p_rhetorical_common_expression_parts,
        rhetoricalCommonExpressionParts
      );
      return jsonResponse([storedFeedback({
        fragments: [],
        grammar_points: [],
        sentence_structure_methods: [],
        sentence_structure_links: [],
        sentence_structure_parts: [],
        rhetorical_parts: [],
        phrasal_verb_parts: rpc.body.p_phrasal_verb_parts,
        writing_common_expression_parts: rpc.body.p_writing_common_expression_parts,
        rhetorical_common_expression_parts: rpc.body.p_rhetorical_common_expression_parts,
        status: "draft",
        published_at: null,
        version: 1
      })]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        overallComment: "",
        fragments: [],
        finalComment: "",
        improvedVersion: "",
        grammarPoints: [],
        sentenceStructureMethods: [],
        sentenceStructureLinks: [],
        sentenceStructureParts: [],
        rhetoricalParts: [],
        phrasalVerbParts,
        writingCommonExpressionParts,
        rhetoricalCommonExpressionParts,
        status: "draft",
        expectedVersion: 0,
        expectedFeedbackId: null
      })
    }
  ), environment());
  assert.equal(response.status, 200);
  const feedback = (await response.json()).feedback;
  assert.equal(feedback.phrasalVerbParts[0].enhancement.text, "They carried on.");
  assert.equal(
    feedback.writingCommonExpressionParts[0].enhancement.text,
    "This lends support to the view."
  );
  assert.equal(
    feedback.rhetoricalCommonExpressionParts[0].enhancement.text,
    "The evidence speaks for itself."
  );
});

test("synonym table rows round-trip one bounded persisted column layout", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let saveCalls = 0;
  const synonymImprovementParts = [{
    originalSentence: { text: "help", formatting: [] },
    enhancement: { text: "support", formatting: [] },
    benefit: { text: "More formal in this context.", formatting: [] },
    columnWidths: [25, 45, 30]
  }];
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_save_v5") {
      saveCalls += 1;
      assert.deepEqual(rpc.body.p_synonym_improvement_parts, synonymImprovementParts);
      return jsonResponse([storedFeedback({
        fragments: [],
        overall_formatting: [],
        final_formatting: [],
        improved_formatting: [],
        grammar_points: [],
        sentence_structure_methods: [],
        sentence_structure_links: [],
        sentence_structure_parts: [],
        rhetorical_parts: [],
        phrasal_verb_parts: [],
        writing_common_expression_parts: [],
        rhetorical_common_expression_parts: [],
        synonym_improvement_parts: rpc.body.p_synonym_improvement_parts,
        status: "draft",
        published_at: null,
        version: 1
      })]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const payload = {
    overallComment: "",
    overallFormatting: [],
    fragments: [],
    finalComment: "",
    finalFormatting: [],
    improvedVersion: "",
    improvedFormatting: [],
    grammarPoints: [],
    sentenceStructureMethods: [],
    sentenceStructureLinks: [],
    sentenceStructureParts: [],
    rhetoricalParts: [],
    phrasalVerbParts: [],
    writingCommonExpressionParts: [],
    rhetoricalCommonExpressionParts: [],
    synonymImprovementParts,
    status: "draft",
    expectedVersion: 0,
    expectedFeedbackId: null
  };
  const headers = {
    Origin: ORIGIN,
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    "Content-Type": "application/json"
  };
  const response = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
    { method: "PUT", headers, body: JSON.stringify(payload) }
  ), environment());
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).feedback.synonymImprovementParts[0].columnWidths, [25, 45, 30]);

  const invalid = structuredClone(payload);
  invalid.synonymImprovementParts[0].columnWidths = [5, 80, 15];
  const invalidResponse = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
    { method: "PUT", headers, body: JSON.stringify(invalid) }
  ), environment());
  assert.equal(invalidResponse.status, 400);
  assert.equal(saveCalls, 1);
});

test("structured feedback parts reject malformed and unbounded input before storage", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let saveCalls = 0;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_feedback_admin_save_v5") saveCalls += 1;
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const emptyValue = { text: "", formatting: [] };
  const validItem = {
    originalSentence: { text: "Original", formatting: [] },
    enhancement: { text: "Enhanced", formatting: [] },
    benefit: { text: "Benefit", formatting: [] }
  };
  const basePayload = {
    overallComment: "",
    fragments: [],
    finalComment: "",
    improvedVersion: "",
    grammarPoints: [],
    sentenceStructureMethods: [],
    sentenceStructureLinks: [],
    sentenceStructureParts: [validItem],
    rhetoricalParts: [],
    status: "draft",
    expectedVersion: 0,
    expectedFeedbackId: null
  };
  const malformedPayloads = [
    { ...basePayload, rhetoricalParts: undefined },
    { ...basePayload, sentenceStructureParts: {} },
    { ...basePayload, sentenceStructureParts: [{ ...validItem, extra: true }] },
    {
      ...basePayload,
      sentenceStructureParts: [{
        originalSentence: validItem.originalSentence,
        enhancement: validItem.enhancement
      }]
    },
    {
      ...basePayload,
      sentenceStructureParts: [{
        ...validItem,
        benefit: { text: "Benefit", formatting: [], html: "<b>unsafe</b>" }
      }]
    },
    {
      ...basePayload,
      sentenceStructureParts: [{
        ...validItem,
        originalSentence: {
          text: "Short",
          formatting: [{
            start: 0, end: 6, bold: false, italic: false,
            strikethrough: false, highlight: "red"
          }]
        }
      }]
    },
    {
      ...basePayload,
      sentenceStructureParts: [{
        ...validItem,
        originalSentence: {
          text: "Original",
          formatting: [{ start: 0, end: 4, bold: false, italic: true, highlight: "red" }]
        }
      }]
    },
    {
      ...basePayload,
      sentenceStructureParts: [{
        originalSentence: emptyValue,
        enhancement: emptyValue,
        benefit: emptyValue
      }]
    },
    {
      ...basePayload,
      sentenceStructureParts: Array.from({ length: 101 }, () => validItem)
    }
  ];
  const headers = {
    Origin: ORIGIN,
    Authorization: `Bearer ${ADMIN_TOKEN}`,
    "Content-Type": "application/json"
  };
  for (const payload of malformedPayloads) {
    const response = await worker.fetch(new Request(
      `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}/feedback`,
      { method: "PUT", headers, body: JSON.stringify(payload) }
    ), environment());
    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, "INVALID_FEEDBACK");
  }
  assert.equal(saveCalls, 0, "malformed structured parts must not reach storage");
});

test("the missing-explanation queue is available only through administrator authentication", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_admin_me") {
      assert.equal(rpc.body.p_admin_token, ADMIN_TOKEN);
      return jsonResponse(adminProfile());
    }
    if (rpc.name === "writing_submission_admin_explanation_review_queue") {
      assert.equal(rpc.body.p_admin_token, ADMIN_TOKEN);
      assert.equal(rpc.body.p_limit, 51);
      assert.equal(rpc.body.p_offset, 0);
      return jsonResponse([{
        id: OCCURRENCE_ID,
        student_id: STUDENT_ID,
        student_name: "Test Student",
        document_id: SUBMISSION_ID,
        submission_id: SUBMISSION_ID,
        fingerprint: FINGERPRINT,
        rule_id: "EdmundAI:word_form",
        title: "字詞形式",
        message: "「hardly」應改為「hard」；請留意這部分的文法結構。",
        original_text: "hardly",
        suggested_text: "hard",
        sentence_text: "We should study hardly.",
        corrected_sentence: "We should study hard.",
        detected_at: "2026-08-03T08:00:00.000Z",
        source_topic: "Reading books",
        source_submitted_at: "2026-08-03T09:00:00.000Z",
        source_deleted_at: null
      }]);
    }
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const response = await worker.fetch(new Request(
    "https://worker.example/v1/admin/explanation-review?page=1&pageSize=50",
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${ADMIN_TOKEN}` } }
  ), environment());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.grammarOccurrences[0].studentName, "Test Student");
  assert.equal(body.grammarOccurrences[0].correctedSentence, "We should study hard.");
  assert.match(body.grammarOccurrences[0].message, /請留意這部分的文法結構/);
});

test("student drafts round-trip only through their authenticated owner", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const calls = [];
  const draftRow = {
    id: SUBMISSION_ID,
    topic: "Describe the picture.",
    answer: "The student is drafting an answer.",
    answer_preview: "The student is drafting an answer.",
    word_count: 7,
    topic_resource: CANONICAL_DSE_TOPIC,
    image_zoom_tenths: 30,
    countdown_state: {
      status: "paused",
      durationSeconds: 2400,
      remainingSeconds: 1800,
      endsAt: 0,
      forceSubmit: false,
      autoSubmitAttemptedAt: 0,
      autoSubmitError: ""
    },
    stopwatch_state: {
      status: "paused",
      accumulatedMilliseconds: 125000,
      startedAt: 0
    },
    duration_seconds: 125,
    created_at: "2026-08-10T01:00:00.000Z",
    updated_at: "2026-08-10T01:02:05.000Z"
  };

  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    calls.push(rpc);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_save_draft") return jsonResponse([draftRow]);
    if (rpc.name === "writing_submission_list_drafts") return jsonResponse([draftRow]);
    if (rpc.name === "writing_submission_get_draft") return jsonResponse([draftRow]);
    if (rpc.name === "writing_submission_delete_draft") return jsonResponse(1);
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const draftPayload = {
    topic: draftRow.topic,
    answer: draftRow.answer,
    topicResource: draftRow.topic_resource,
    imageZoom: 3,
    countdown: draftRow.countdown_state,
    stopwatch: draftRow.stopwatch_state,
    durationSeconds: 125
  };
  const putResponse = await worker.fetch(new Request(
    `https://worker.example/v1/drafts/${SUBMISSION_ID}`,
    {
      method: "PUT",
      headers: {
        Origin: ORIGIN,
        Authorization: `Bearer ${STUDENT_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(draftPayload)
    }
  ), environment());
  assert.equal(putResponse.status, 200, await putResponse.clone().text());
  const savedCall = calls.find(call => call.name === "writing_submission_save_draft");
  assert.equal(savedCall.body.p_student_id, STUDENT_ID);
  assert.equal(savedCall.body.p_id, SUBMISSION_ID);
  assert.equal(savedCall.body.p_image_zoom_tenths, 30);
  assert.deepEqual(savedCall.body.p_topic_resource, draftRow.topic_resource);
  assert.deepEqual((await putResponse.json()).draft.stopwatch, draftRow.stopwatch_state);

  const listResponse = await worker.fetch(new Request(
    "https://worker.example/v1/drafts?page=1&pageSize=20",
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(listResponse.status, 200);
  const listBody = await listResponse.json();
  assert.equal(listBody.drafts[0].id, SUBMISSION_ID);
  assert.equal(listBody.drafts[0].imageZoom, 3);

  const getResponse = await worker.fetch(new Request(
    `https://worker.example/v1/drafts/${SUBMISSION_ID}`,
    { headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` } }
  ), environment());
  assert.equal(getResponse.status, 200);
  assert.deepEqual((await getResponse.json()).draft.topicResource, draftRow.topic_resource);

  const deleteResponse = await worker.fetch(new Request(
    `https://worker.example/v1/drafts/${SUBMISSION_ID}`,
    {
      method: "DELETE",
      headers: { Origin: ORIGIN, Authorization: `Bearer ${STUDENT_TOKEN}` }
    }
  ), environment());
  assert.equal(deleteResponse.status, 204);
  assert.ok(calls.filter(call => call.name === "writing_submission_student_profile")
    .every(call => call.body.p_token === STUDENT_TOKEN));
});

test("draft topic images reject remote and embedded sources before storage", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let saveCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_save_draft") saveCalled = true;
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  for (const src of ["https://private.example/prompt.png", "data:image/png;base64,AA==", "//private.example/prompt.png"]) {
    const response = await worker.fetch(new Request(
      `https://worker.example/v1/drafts/${SUBMISSION_ID}`,
      {
        method: "PUT",
        headers: {
          Origin: ORIGIN,
          Authorization: `Bearer ${STUDENT_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          topic: "Prompt",
          answer: "Draft.",
          topicResource: {
            id: "topic-1",
            type: "fill-blanks",
            label: "Prompt",
            detail: "Writing Practice",
            sectionKey: "dse-writing",
            questionPrompt: ["Prompt"],
            questionImages: [{ src, alt: "Prompt" }]
          },
          imageZoom: 1,
          countdown: {
            status: "idle", durationSeconds: 0, remainingSeconds: 0, endsAt: 0,
            forceSubmit: false, autoSubmitAttemptedAt: 0, autoSubmitError: ""
          },
          stopwatch: { status: "idle", accumulatedMilliseconds: 0, startedAt: 0 },
          durationSeconds: 0
        })
      }
    ), environment());
    assert.equal(response.status, 400);
    assert.equal((await response.json()).code, "INVALID_DRAFT");
  }
  assert.equal(saveCalled, false);
});

test("administrator grammar inspection and destructive controls require exact confirmation", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    calls.push(rpc);
    if (rpc.name === "writing_submission_admin_me") return jsonResponse(adminProfile());
    if (rpc.name === "writing_submission_admin_problem_summary") {
      return jsonResponse([{
        rule_id: "SubjectVerbAgreement",
        title: "Subject–verb agreement",
        occurrence_count: 2,
        first_seen_at: "2026-08-01T00:00:00.000Z",
        last_seen_at: "2026-08-10T00:00:00.000Z"
      }]);
    }
    if (rpc.name === "writing_submission_admin_problem_occurrences") {
      return jsonResponse([{
        id: OCCURRENCE_ID,
        document_id: SUBMISSION_ID,
        submission_id: SUBMISSION_ID,
        fingerprint: FINGERPRINT,
        rule_id: "SubjectVerbAgreement",
        title: "Subject–verb agreement",
        message: "The verb must agree with the subject.",
        original_text: "students studies",
        suggested_text: "students study",
        sentence_text: "The students studies every day.",
        corrected_sentence: "The students study every day.",
        detected_at: "2026-08-10T00:00:00.000Z",
        source_topic: "Study habits",
        source_submitted_at: "2026-08-10T00:00:00.000Z",
        source_deleted_at: null
      }]);
    }
    if (rpc.name === "writing_submission_admin_delete_occurrence") return jsonResponse(1);
    if (rpc.name === "writing_submission_admin_delete_problem_category") return jsonResponse(2);
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };

  const authHeaders = { Origin: ORIGIN, Authorization: `Bearer ${ADMIN_TOKEN}` };
  const summaryResponse = await worker.fetch(new Request(
    `https://worker.example/v1/admin/grammar-problems?studentId=${STUDENT_ID}`,
    { headers: authHeaders }
  ), environment());
  assert.equal(summaryResponse.status, 200);
  assert.equal((await summaryResponse.json()).grammarProblems[0].occurrenceCount, 2);

  const occurrenceResponse = await worker.fetch(new Request(
    `https://worker.example/v1/admin/grammar-problem-occurrences?studentId=${STUDENT_ID}&ruleId=SubjectVerbAgreement&page=1&pageSize=25`,
    { headers: authHeaders }
  ), environment());
  assert.equal(occurrenceResponse.status, 200);
  assert.equal((await occurrenceResponse.json()).grammarOccurrences[0].id, OCCURRENCE_ID);

  const missingConfirmation = await worker.fetch(new Request(
    `https://worker.example/v1/admin/grammar-occurrences/${OCCURRENCE_ID}`,
    {
      method: "DELETE",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: STUDENT_ID, confirmation: "delete" })
    }
  ), environment());
  assert.equal(missingConfirmation.status, 400);
  assert.equal((await missingConfirmation.json()).code, "DELETE_CONFIRMATION_REQUIRED");

  const validOccurrenceDelete = await worker.fetch(new Request(
    `https://worker.example/v1/admin/grammar-occurrences/${OCCURRENCE_ID}`,
    {
      method: "DELETE",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: STUDENT_ID, confirmation: "DELETE" })
    }
  ), environment());
  assert.equal(validOccurrenceDelete.status, 204);

  const validCategoryDelete = await worker.fetch(new Request(
    "https://worker.example/v1/admin/grammar-problem-category",
    {
      method: "DELETE",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: STUDENT_ID,
        ruleId: "SubjectVerbAgreement",
        confirmation: "DELETE"
      })
    }
  ), environment());
  assert.equal(validCategoryDelete.status, 200);
  assert.equal((await validCategoryDelete.json()).deletedCount, 2);
  assert.equal(calls.filter(call => call.name === "writing_submission_admin_delete_occurrence").length, 1);
  assert.equal(calls.filter(call => call.name === "writing_submission_admin_delete_problem_category").length, 1);
  assert.ok(calls.filter(call => call.name.startsWith("writing_submission_admin_delete"))
    .every(call => call.body.p_admin_token === ADMIN_TOKEN && call.body.p_student_id === STUDENT_ID));
});

test("public grammar responses expose only Edmund-neutral engine metadata", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    throw new Error(`Unexpected RPC ${rpc.name}`);
  };
  const ai = aiBinding({
    response: {
      correctedSentence: "Tom writes books.",
      issues: []
    }
  });
  const grammarResponse = await worker.fetch(
    grammarCheckRequest("Tom write books."),
    environment({ AI: ai })
  );
  assert.equal(grammarResponse.status, 200, await grammarResponse.clone().text());
  const grammarText = await grammarResponse.text();
  assert.match(grammarText, /edmund-advanced-grammar/);
  assert.doesNotMatch(grammarText, /cloudflare|workers[ -]?ai|@cf\/|llama/i);

  const healthResponse = await worker.fetch(
    new Request("https://worker.example/v1/health"),
    environment()
  );
  const healthText = await healthResponse.text();
  assert.doesNotMatch(healthText, /cloudflare|workers[ -]?ai|@cf\/|llama|repairModel|execution/i);
});

test("the draft and admin migration is transaction-safe, private and auditable", t => {
  const migrationUrl = new URL("../../../supabase-writing-submission-drafts-admin.sql", import.meta.url);
  if (!fs.existsSync(migrationUrl)) {
    t.skip("the focused Worker staging fixture does not include the draft/admin migration");
    return;
  }
  const migration = fs.readFileSync(migrationUrl, "utf8");
  assert.match(migration, /^begin;/m);
  assert.match(migration, /commit;\s*$/);
  assert.doesNotMatch(migration, /returns table\s*\(\s*returns table\s*\(/i);
  const functionDeclarations = migration.match(/create or replace function public\.[a-z0-9_]+\s*\(/gi) || [];
  const functionBodies = migration.match(/\bas \$\$[\s\S]*?\$\$;/g) || [];
  assert.equal(functionDeclarations.length, 9, "all nine migration functions must be declared once");
  assert.equal(functionBodies.length, functionDeclarations.length, "every function needs one closed dollar-quoted body");
  assert.equal((migration.match(/\$\$/g) || []).length, functionDeclarations.length * 2);
  for (const table of ["writing_submission_drafts", "writing_submission_admin_audit"]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security;`));
    assert.match(migration, new RegExp(`revoke all on table public\\.${table} from public, anon, authenticated, service_role;`));
  }
  assert.match(migration, /writing_submission_drafts_student_updated_idx[\s\S]*student_id, updated_at desc, id desc/);
  assert.match(migration, /create or replace function public\.writing_submission_submit_v3/);
  assert.match(migration, /with saved as materialized[\s\S]*delete from public\.writing_submission_drafts/);
  assert.match(migration, /create or replace function public\.writing_submission_admin_delete_occurrence/);
  assert.match(migration, /create or replace function public\.writing_submission_admin_delete_problem_category/);
  assert.match(migration, /insert into public\.writing_submission_admin_audit/);
  assert.doesNotMatch(migration, /grant execute[\s\S]*?to (?:anon|authenticated);/);
  for (const rpcName of [
    "writing_submission_save_draft",
    "writing_submission_list_drafts",
    "writing_submission_get_draft",
    "writing_submission_delete_draft",
    "writing_submission_submit_v3",
    "writing_submission_admin_problem_summary",
    "writing_submission_admin_problem_occurrences",
    "writing_submission_admin_delete_occurrence",
    "writing_submission_admin_delete_problem_category"
  ]) {
    assert.match(migration, new RegExp(`grant execute on function public\\.${rpcName}\\(`));
    assert.match(
      migration,
      new RegExp(`revoke all on function public\\.${rpcName}\\([\\s\\S]*?from public, anon, authenticated, service_role;`)
    );
  }
});

test("the migration keeps tables private and provisioning unavailable to service_role", t => {
  const migrationUrl = new URL("../../../supabase-writing-submission.sql", import.meta.url);
  if (!fs.existsSync(migrationUrl)) {
    t.skip("the focused Worker staging fixture does not include the repository migration");
    return;
  }
  const migration = fs.readFileSync(migrationUrl, "utf8");
  for (const table of [
    "writing_submission_admin_accounts",
    "writing_submission_admin_sessions",
    "writing_submissions",
    "writing_submission_issue_occurrences"
  ]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security;`));
    assert.match(migration, new RegExp(`revoke all on table public\\.${table}`));
  }
  assert.match(
    migration,
    /revoke all on function public\.writing_submission_provision_admin\(text, text\)[\s\S]*?from public, anon, authenticated, service_role;/
  );
  assert.doesNotMatch(
    migration,
    /grant execute on function public\.writing_submission_provision_admin/
  );

  const occurrenceValidator = migration.match(
    /create or replace function public\._writing_submission_occurrence_batch_valid[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(occurrenceValidator, /language plpgsql\s+set search_path/);
  assert.doesNotMatch(occurrenceValidator, /\bimmutable\b/);

  const studentLocks = migration.match(
    /hashtextextended\('writing-submission-student:' \|\| p_student_id::text, 0\)/g
  ) || [];
  assert.equal(studentLocks.length, 2, "submit and grammar batch must share the student lock");
  const documentLocks = migration.match(
    /hashtextextended\('writing-submission-document:' \|\| p_(?:id|document_id)::text, 0\)/g
  ) || [];
  assert.equal(documentLocks.length, 2, "submit and grammar batch must share the document lock");

  for (const functionName of [
    "writing_submission_submit",
    "writing_submission_record_issue_batch"
  ]) {
    const definition = migration.match(
      new RegExp(`create or replace function public\\.${functionName}[\\s\\S]*?\\n\\$\\$;`)
    )?.[0] || "";
    const studentPosition = definition.indexOf("writing-submission-student:");
    const documentPosition = definition.indexOf("writing-submission-document:");
    assert.ok(studentPosition >= 0, `${functionName} must take the student lock`);
    assert.ok(documentPosition > studentPosition, `${functionName} must take the document lock second`);
  }
});

test("the enhancement migration keeps preferences private and deletion recoverable", t => {
  const migrationUrl = new URL("../../../supabase-writing-submission-enhancements.sql", import.meta.url);
  if (!fs.existsSync(migrationUrl)) {
    t.skip("the focused Worker staging fixture does not include the enhancement migration");
    return;
  }
  const migration = fs.readFileSync(migrationUrl, "utf8");
  assert.match(migration, /add column if not exists duration_seconds integer not null default 0/);
  assert.match(migration, /add column if not exists deleted_at timestamptz/);
  assert.match(migration, /alter table public\.writing_submission_preferences enable row level security/);
  assert.match(migration, /create or replace function public\.writing_submission_soft_delete/);
  assert.doesNotMatch(migration.match(/writing_submission_soft_delete[\s\S]*?\n\$\$;/)?.[0] || "", /\bdelete\s+from\b/i);
  const progress = migration.match(/create or replace function public\.writing_submission_progress[\s\S]*?\n\$\$;/)?.[0] || "";
  assert.match(progress, /sum\(submission\.duration_seconds\)/);
  assert.doesNotMatch(progress, /submission\.deleted_at is null/);
  assert.match(migration, /grant execute on function public\.writing_submission_preferences_set\(uuid, boolean\) to service_role/);
});

test("the grammar-history migration preserves ownership, complete cards and an admin-only review queue", t => {
  const migrationUrl = new URL("../../../supabase-writing-submission-grammar-history.sql", import.meta.url);
  if (!fs.existsSync(migrationUrl)) {
    t.skip("the focused Worker staging fixture does not include the grammar-history migration");
    return;
  }
  const migration = fs.readFileSync(migrationUrl, "utf8");
  assert.match(migration, /add column if not exists corrected_sentence text not null default ''/);
  assert.match(migration, /needs_explanation_review boolean[\s\S]*?請留意這部分的文法結構。/);
  assert.match(migration, /create index if not exists writing_submission_issues_review_queue_idx/);
  const studentHistory = migration.match(
    /create or replace function public\.writing_submission_problem_occurrences[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(studentHistory, /where occurrence\.student_id = p_student_id/);
  assert.match(studentHistory, /and occurrence\.rule_id = p_rule_id/);
  const adminQueue = migration.match(
    /create or replace function public\.writing_submission_admin_explanation_review_queue[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(adminQueue, /public\._writing_submission_admin_id\(p_admin_token\) is null/);
  assert.match(adminQueue, /where occurrence\.needs_explanation_review/);
  assert.match(
    migration,
    /grant execute on function public\.writing_submission_problem_occurrences\(uuid, text, integer, integer\)[\s\S]*?to service_role;/
  );
  assert.match(
    migration,
    /grant execute on function public\.writing_submission_admin_explanation_review_queue\(uuid, integer, integer\)[\s\S]*?to service_role;/
  );
  assert.doesNotMatch(migration, /grant execute[\s\S]*?to (?:anon|authenticated);/);
});

test("the feedback migration is normalized, private, ownership-scoped and auditable", t => {
  const migrationUrl = new URL("../../../supabase-writing-submission-feedback.sql", import.meta.url);
  if (!fs.existsSync(migrationUrl)) {
    t.skip("the focused Worker staging fixture does not include the feedback migration");
    return;
  }
  const migration = fs.readFileSync(migrationUrl, "utf8");
  assert.match(migration, /^begin;/m);
  assert.match(migration, /commit;\s*$/);
  for (const table of [
    "writing_submission_feedback",
    "writing_submission_feedback_fragments",
    "writing_submission_feedback_audit"
  ]) {
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security;`));
    assert.match(migration, new RegExp(`revoke all on table public\\.${table}`));
  }
  const studentGet = migration.match(
    /create or replace function public\.writing_submission_feedback_student_get[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(studentGet, /feedback\.student_id = p_student_id/);
  assert.match(studentGet, /feedback\.status = 'published'/);
  assert.match(studentGet, /submission\.deleted_at is null/);
  const adminSave = migration.match(
    /create or replace function public\.writing_submission_feedback_admin_save[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(adminSave, /public\._writing_submission_admin_id\(p_admin_token\)/);
  assert.match(adminSave, /writing_submission_feedback_fragments_valid/);
  assert.match(adminSave, /p_expected_version integer/);
  assert.match(adminSave, /p_expected_feedback_id uuid/);
  assert.match(adminSave, /p_expected_version <> 0/);
  assert.match(adminSave, /p_expected_version <> v_version/);
  assert.match(adminSave, /p_expected_feedback_id is distinct from v_feedback_id/);
  assert.match(adminSave, /errcode = 'P4090'/);
  assert.match(
    adminSave,
    /on conflict on constraint writing_submission_feedback_submission_id_key do update/
  );
  assert.match(adminSave, /insert into public\.writing_submission_feedback_audit/);
  const adminDelete = migration.match(
    /create or replace function public\.writing_submission_feedback_admin_delete[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(adminDelete, /p_expected_version integer/);
  assert.match(adminDelete, /p_expected_feedback_id uuid/);
  assert.match(adminDelete, /for update/);
  assert.match(adminDelete, /p_expected_version <> v_version/);
  assert.match(adminDelete, /p_expected_feedback_id is distinct from v_feedback_id/);
  assert.match(adminDelete, /errcode = 'P4090'/);
  assert.match(
    migration,
    /drop function if exists public\.writing_submission_feedback_admin_delete\(uuid, uuid\);/
  );
  assert.match(
    migration,
    /drop function if exists public\.writing_submission_feedback_admin_delete\(uuid, uuid, integer\);/
  );
  assert.doesNotMatch(migration, /grant execute[\s\S]*?to (?:anon|authenticated);/);
  for (const functionName of [
    "writing_submission_feedback_student_get",
    "writing_submission_feedback_admin_get",
    "writing_submission_feedback_admin_save",
    "writing_submission_feedback_admin_delete"
  ]) {
    assert.match(
      migration,
      new RegExp(`grant execute on function public\\.${functionName}\\([\\s\\S]*?to service_role;`)
    );
  }
});

test("the feedback learning-tools migration is private, owner-scoped and concurrency-safe", t => {
  const migrationUrl = new URL(
    "../../../supabase-writing-submission-feedback-learning-tools.sql",
    import.meta.url
  );
  if (!fs.existsSync(migrationUrl)) {
    t.skip("the focused Worker staging fixture does not include the learning-tools migration");
    return;
  }
  const migration = fs.readFileSync(migrationUrl, "utf8");
  assert.match(migration, /^begin;/m);
  assert.match(migration, /commit;\s*$/);
  assert.match(migration, /add column if not exists grammar_points jsonb not null default '\[\]'::jsonb/);
  assert.match(migration, /add column if not exists sentence_structure_methods jsonb not null default '\[\]'::jsonb/);
  assert.match(migration, /add column if not exists sentence_structure_links jsonb not null default '\[\]'::jsonb/);

  for (const table of [
    "writing_submission_feedback_fragment_copies",
    "writing_submission_feedback_fragment_bookmarks"
  ]) {
    assert.match(migration, new RegExp(`create table if not exists public\\.${table}`));
    assert.match(migration, new RegExp(`alter table public\\.${table} enable row level security;`));
    assert.match(
      migration,
      new RegExp(`revoke all on table public\\.${table}[\\s\\S]*?from public, anon, authenticated, service_role;`)
    );
  }
  assert.match(
    migration,
    /unique \(feedback_id, position\) deferrable initially immediate/
  );
  assert.match(migration, /create or replace function public\._writing_submission_utf16_length/);
  assert.match(
    migration,
    /_writing_submission_utf16_length\(coalesce\(v_item ->> 'text', ''\)\)/
  );

  const studentOpen = migration.match(
    /create or replace function public\.writing_submission_feedback_student_open_v2[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(studentOpen, /feedback\.student_id = p_student_id/);
  assert.match(studentOpen, /feedback\.status = 'published'/);
  assert.match(studentOpen, /submission\.deleted_at is null/);
  assert.match(studentOpen, /fragment_copy\.student_id = p_student_id/);
  assert.match(studentOpen, /bookmark\.student_id = p_student_id/);

  const copySave = migration.match(
    /create or replace function public\.writing_submission_feedback_student_save_fragment_copy_v2[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(copySave, /feedback\.submission_id = p_submission_id/);
  assert.match(copySave, /feedback\.student_id = p_student_id/);
  assert.match(copySave, /feedback\.status = 'published'/);
  assert.match(copySave, /char_length\(btrim\(fragment\.suggested_writing\)\) > 0/);
  assert.match(copySave, /p_expected_version <> v_existing_version/);
  assert.match(copySave, /errcode = 'P4092'/);

  const bookmarkSet = migration.match(
    /create or replace function public\.writing_submission_feedback_bookmark_set_v2[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(bookmarkSet, /feedback\.student_id = p_student_id/);
  assert.match(bookmarkSet, /feedback\.status = 'published'/);
  assert.match(bookmarkSet, /p_expected_version <> v_existing_version/);
  assert.match(bookmarkSet, /errcode = 'P4093'/);

  const bookmarkList = migration.match(
    /create or replace function public\.writing_submission_feedback_bookmarks_list_v2[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(bookmarkList, /where bookmark\.student_id = p_student_id/);
  assert.match(bookmarkList, /bookmark\.bookmarked = true/);
  assert.match(bookmarkList, /feedback\.status = 'published'/);

  const adminSaveV2 = migration.match(
    /create or replace function public\.writing_submission_feedback_admin_save_v2[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(adminSaveV2, /public\._writing_submission_admin_id\(p_admin_token\)/);
  assert.match(adminSaveV2, /p_expected_feedback_id is distinct from v_feedback_id/);
  assert.match(adminSaveV2, /writing_submission_feedback_fragments_v2_valid/);
  assert.match(adminSaveV2, /where fragment\.id = v_fragment_id/);
  assert.match(adminSaveV2, /not \(fragment\.id = any\(v_keep_ids\)\)/);
  assert.match(adminSaveV2, /submission\.deleted_at is null/);
  assert.doesNotMatch(
    adminSaveV2,
    /fragment\.position = v_position/,
    "new null-ID fragments must never inherit student state from a same-position row"
  );
  assert.match(adminSaveV2, /insert into public\.writing_submission_feedback_audit/);

  assert.doesNotMatch(
    migration,
    /(?:drop|create or replace) function public\.writing_submission_feedback_(?:student_open|admin_get_v2|admin_save)\s*\(/i,
    "compatibility RPCs must remain unchanged"
  );
  assert.doesNotMatch(migration, /grant execute[\s\S]*?to (?:anon|authenticated);/);
  for (const signature of [
    "writing_submission_feedback_student_open_v2\\(uuid, uuid\\)",
    "writing_submission_feedback_admin_get_v3\\(uuid, uuid\\)",
    "writing_submission_feedback_admin_save_v2\\(",
    "writing_submission_feedback_student_save_fragment_copy_v2\\(",
    "writing_submission_feedback_bookmark_set_v2\\(",
    "writing_submission_feedback_bookmarks_list_v2\\("
  ]) {
    assert.match(
      migration,
      new RegExp(`grant execute on function public\\.${signature}[\\s\\S]*?to service_role;`)
    );
  }
});

test("the structured-parts migration is additive, private and backward-compatible", t => {
  const migrationUrl = new URL(
    "../../../supabase-writing-submission-feedback-structured-parts.sql",
    import.meta.url
  );
  if (!fs.existsSync(migrationUrl)) {
    t.skip("the focused Worker staging fixture does not include the structured-parts migration");
    return;
  }
  const migration = fs.readFileSync(migrationUrl, "utf8");
  assert.match(migration, /^begin;/m);
  assert.match(migration, /notify pgrst, 'reload schema';/);
  assert.match(migration, /commit;\s*$/);
  assert.match(
    migration,
    /add column if not exists sentence_structure_parts jsonb not null default '\[\]'::jsonb/
  );
  assert.match(
    migration,
    /add column if not exists rhetorical_parts jsonb not null default '\[\]'::jsonb/
  );
  assert.match(migration, /writing_submission_feedback_sentence_parts_valid check/);
  assert.match(migration, /writing_submission_feedback_rhetorical_parts_valid check/);

  const formattingValidator = migration.match(
    /create or replace function public\._writing_submission_feedback_formatting_valid[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(formattingValidator, /v_key_count not in \(4, 6\)/);
  assert.match(formattingValidator, /'italic', 'strikethrough'/);
  assert.match(formattingValidator, /'yellow', 'orange', 'blue', 'green', 'red'/);
  assert.match(formattingValidator, /jsonb_typeof\(p_formatting\) <> 'array'/);
  assert.match(formattingValidator, /jsonb_array_length\(p_formatting\) > 500/);

  const valueValidator = migration.match(
    /create or replace function public\._writing_submission_feedback_rich_text_value_valid[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(valueValidator, /jsonb_typeof\(p_value\) <> 'object'/);
  assert.match(valueValidator, /_writing_submission_utf16_length\(v_text\)/);
  assert.match(valueValidator, /_writing_submission_feedback_formatting_valid/);
  const partsValidator = migration.match(
    /create or replace function public\._writing_submission_feedback_parts_valid[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(partsValidator, /jsonb_typeof\(p_parts\) <> 'array'/);
  assert.match(partsValidator, /jsonb_array_length\(p_parts\) > 100/);
  assert.match(partsValidator, /'originalSentence', 'enhancement', 'benefit'/);
  assert.match(partsValidator, /#>> '\{originalSentence,text\}'/);

  const studentOpen = migration.match(
    /create or replace function public\.writing_submission_feedback_student_open_v3[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(studentOpen, /feedback\.student_id = p_student_id/);
  assert.match(studentOpen, /feedback\.status = 'published'/);
  assert.match(studentOpen, /submission\.deleted_at is null/);
  assert.match(studentOpen, /feedback\.sentence_structure_parts/);
  assert.match(studentOpen, /feedback\.rhetorical_parts/);

  const adminGet = migration.match(
    /create or replace function public\.writing_submission_feedback_admin_get_v4[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(adminGet, /public\._writing_submission_admin_id\(p_admin_token\) is not null/);
  assert.match(adminGet, /feedback\.sentence_structure_parts/);
  assert.match(adminGet, /feedback\.rhetorical_parts/);

  const adminSave = migration.match(
    /create or replace function public\.writing_submission_feedback_admin_save_v3[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(adminSave, /public\._writing_submission_admin_id\(p_admin_token\)/);
  assert.match(adminSave, /public\._writing_submission_feedback_parts_valid\(p_sentence_structure_parts\)/);
  assert.match(adminSave, /public\._writing_submission_feedback_parts_valid\(p_rhetorical_parts\)/);
  assert.match(adminSave, /pg_advisory_xact_lock/);
  assert.match(adminSave, /submission\.deleted_at is null/);
  assert.match(adminSave, /p_expected_feedback_id is distinct from v_feedback_id/);
  assert.match(adminSave, /errcode = 'P4090'/);
  assert.match(adminSave, /v_current_sentence_parts/);
  assert.match(adminSave, /v_current_rhetorical_parts/);
  assert.match(adminSave, /sentence_structure_parts = excluded\.sentence_structure_parts/);
  assert.match(adminSave, /rhetorical_parts = excluded\.rhetorical_parts/);
  assert.match(adminSave, /insert into public\.writing_submission_feedback_audit/);

  assert.doesNotMatch(
    migration,
    /(?:drop|create or replace) function public\.writing_submission_feedback_(?:student_open_v2|admin_get_v3|admin_save_v2)\s*\(/i,
    "the previous RPC versions must remain callable during a rolling release"
  );
  assert.doesNotMatch(migration, /grant execute[\s\S]*?to (?:anon|authenticated);/);
  for (const signature of [
    "writing_submission_feedback_student_open_v3\\(uuid, uuid\\)",
    "writing_submission_feedback_admin_get_v4\\(uuid, uuid\\)",
    "writing_submission_feedback_admin_save_v3\\("
  ]) {
    assert.match(
      migration,
      new RegExp(`revoke all on function public\\.${signature}[\\s\\S]*?from public, anon, authenticated, service_role;`)
    );
    assert.match(
      migration,
      new RegExp(`grant execute on function public\\.${signature}[\\s\\S]*?to service_role;`)
    );
  }
});

test("the additional-enhancements migration is private, owner-scoped and concurrency-safe", t => {
  const migrationUrl = new URL(
    "../../../supabase-writing-submission-feedback-additional-enhancements.sql",
    import.meta.url
  );
  if (!fs.existsSync(migrationUrl)) {
    t.skip("the focused Worker staging fixture does not include the additional-enhancements migration");
    return;
  }
  const migration = fs.readFileSync(migrationUrl, "utf8");
  assert.match(migration, /^begin;/m);
  assert.match(migration, /notify pgrst, 'reload schema';/);
  assert.match(migration, /commit;\s*$/);
  for (const column of [
    "phrasal_verb_parts",
    "writing_common_expression_parts",
    "rhetorical_common_expression_parts"
  ]) {
    assert.ok(
      migration.includes(`add column if not exists ${column} jsonb not null default '[]'::jsonb`)
    );
  }
  assert.match(
    migration,
    /create table if not exists public\.writing_submission_feedback_enhancement_copies/
  );
  assert.match(
    migration,
    /alter table public\.writing_submission_feedback_enhancement_copies enable row level security/
  );
  assert.match(
    migration,
    /revoke all on table public\.writing_submission_feedback_enhancement_copies[\s\S]*?from public, anon, authenticated, service_role;/
  );
  assert.doesNotMatch(migration, /grant (?:select|insert|update|delete) on table/i);

  const studentOpen = migration.match(
    /create or replace function public\.writing_submission_feedback_student_open_v4[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(studentOpen, /writing_submission_feedback_student_open_v3/);
  assert.match(studentOpen, /copy\.student_id = p_student_id/);
  assert.match(studentOpen, /copy\.source_fingerprint = pg_catalog\.md5/);

  const adminSave = migration.match(
    /create or replace function public\.writing_submission_feedback_admin_save_v4[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(adminSave, /writing_submission_feedback_admin_save_v3/);
  assert.match(adminSave, /_writing_submission_feedback_parts_valid\(p_phrasal_verb_parts\)/);
  assert.match(adminSave, /delete from public\.writing_submission_feedback_enhancement_copies/);
  assert.match(adminSave, /copy\.source_fingerprint is distinct from pg_catalog\.md5/);

  const copySave = migration.match(
    /create or replace function public\.writing_submission_feedback_student_save_enhancement_copy[\s\S]*?\n\$\$;/
  )?.[0] || "";
  assert.match(copySave, /feedback\.student_id = p_student_id/);
  assert.match(copySave, /feedback\.status = 'published'/);
  assert.match(copySave, /submission\.deleted_at is null/);
  assert.match(copySave, /pg_advisory_xact_lock/);
  assert.match(copySave, /p_expected_version <> v_existing_version/);
  assert.match(copySave, /errcode = 'P4093'/);

  assert.doesNotMatch(migration, /grant execute[\s\S]*?to (?:anon|authenticated);/);
  for (const signature of [
    "writing_submission_feedback_student_open_v4\\(uuid, uuid\\)",
    "writing_submission_feedback_admin_get_v5\\(uuid, uuid\\)",
    "writing_submission_feedback_admin_save_v4\\(",
    "writing_submission_feedback_student_save_enhancement_copy\\("
  ]) {
    assert.match(
      migration,
      new RegExp(`revoke all on function public\\.${signature}[\\s\\S]*?from public, anon, authenticated, service_role;`)
    );
    assert.match(
      migration,
      new RegExp(`grant execute on function public\\.${signature}[\\s\\S]*?to service_role;`)
    );
  }
});
