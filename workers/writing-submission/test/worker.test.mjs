import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import worker from "../src/index.js";

const ORIGIN = "https://edmundeducation.github.io";
const BAD_ORIGIN = "https://attacker.example";
const STUDENT_TOKEN = "11111111-1111-4111-8111-111111111111";
const STUDENT_ID = "22222222-2222-4222-8222-222222222222";
const SUBMISSION_ID = "33333333-3333-4333-8333-333333333333";
const OCCURRENCE_ID = "44444444-4444-4444-8444-444444444444";
const ADMIN_TOKEN = "55555555-5555-4555-8555-555555555555";
const ADMIN_ID = "66666666-6666-4666-8666-666666666666";
const FINGERPRINT = "a".repeat(64);

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

function studentProfile() {
  return [{
    id: STUDENT_ID,
    name: "Test Student",
    session_expires_at: "2026-08-30T00:00:00.000Z"
  }];
}

function adminProfile() {
  return [{
    id: ADMIN_ID,
    name: "Writing Administrator",
    expires_at: "2026-08-01T00:00:00.000Z"
  }];
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

test("health keeps the core service independent and reports grammar AI readiness separately", async () => {
  const complete = await worker.fetch(
    new Request("https://worker.example/v1/health"),
    environment()
  );
  assert.equal(complete.status, 200);
  const completeBody = await complete.json();
  assert.equal(completeBody.ok, true);
  assert.equal(completeBody.grammarAi.configured, true);
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
  assert.equal((await response.json()).student.id, STUDENT_ID);
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
  assert.equal(body.engine.name, "cloudflare-workers-ai");
  assert.equal(body.engine.model, "@cf/meta/llama-3.1-8b-instruct-fast");
  assert.deepEqual(body.issues.map((issue) => issue.originalText), ["need", "book", "reading"]);
  assert.deepEqual(body.issues.map((issue) => issue.suggestedText), ["needs", "a book", "read"]);
  assert.equal(body.issues[0].correctedSentence, "Tommy needs book to reading better.");
  assert.equal(body.issues[1].correctedSentence, "Tommy need a book to reading better.");
  assert.equal(body.issues[2].correctedSentence, "Tommy need book to read better.");
  assert.equal(ai.calls.length, 1);
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
  assert.equal(body.engine.version, "2026-08-01.3");

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
  assert.equal(ai.calls.length, 1);
  assert.equal(rpcCount, 1, "grammar checking must authenticate but must not write to storage");
});

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
  assert.match(ai.calls[1].request.messages[1].content, /previous answer was unusable/);
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
  assert.match(ai.calls[1].request.messages[1].content, /Recheck verb complements and institutional go to school/);
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
    "Tom enjoys work."
  ]) {
    const ai = aiBinding(grammarAiResponse(sentence, []));
    const response = await worker.fetch(grammarCheckRequest(sentence), environment({ AI: ai }));
    const responseText = await response.text();
    assert.equal(response.status, 200, `${sentence}: ${responseText}`);
    assert.deepEqual(JSON.parse(responseText).issues, []);
    assert.equal(ai.calls.length, 1);
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
    code: "GRAMMAR_CHECK_UNAVAILABLE"
  });
  assert.equal(ai.calls.length, 1);
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
    if (rpc.name === "writing_submission_submit") {
      submittedPayload = rpc.body;
      return jsonResponse([{
        id: rpc.body.p_id,
        topic: rpc.body.p_topic,
        answer: rpc.body.p_answer,
        word_count: rpc.body.p_word_count,
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
        answer: "Many companies require staff to wear uniforms."
      })
    }
  ), environment());

  const responseText = await response.text();
  assert.equal(response.status, 200, responseText);
  assert.equal(submittedPayload.p_student_id, STUDENT_ID);
  assert.equal(submittedPayload.p_id, SUBMISSION_ID);
  assert.equal(submittedPayload.p_word_count, 7);
  assert.equal(JSON.parse(responseText).submission.wordCount, 7);
});

test("submission payloads cannot choose a student ID or add unknown fields", async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let submitCalled = false;
  globalThis.fetch = async (input, init = {}) => {
    const rpc = rpcRequest(input, init);
    if (rpc.name === "writing_submission_student_profile") return jsonResponse(studentProfile());
    if (rpc.name === "writing_submission_submit") submitCalled = true;
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
    if (rpc.name === "writing_submission_submit") submitCalled = true;
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
    if (rpc.name === "writing_submission_list") {
      assert.equal(rpc.body.p_limit, 3);
      assert.equal(rpc.body.p_offset, 0);
      return jsonResponse(rows);
    }
    if (rpc.name === "writing_submission_get") {
      return jsonResponse([{
        id: SUBMISSION_ID,
        topic: "Prompt 1",
        answer: "Full answer.",
        word_count: 2,
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
  assert.equal(detailBody.grammarOccurrences[0].ruleId, "SubjectVerbAgreement");
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
  const storedDetectedAt = Date.parse(issuePayload.p_occurrences[0].detectedAt);
  assert.ok(storedDetectedAt >= beforeRequest);
  assert.ok(storedDetectedAt <= Date.now());
  assert.deepEqual(await response.json(), { acceptedCount: 1, insertedCount: 1 });
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
    if (rpc.name === "writing_submission_admin_list_submissions") {
      assert.equal(rpc.body.p_student_id, STUDENT_ID);
      return jsonResponse([{
        id: SUBMISSION_ID,
        student_id: STUDENT_ID,
        student_name: "Test Student",
        topic: "Prompt",
        answer_preview: "Preview",
        word_count: 20,
        submitted_at: "2026-07-31T00:00:00.000Z"
      }]);
    }
    if (rpc.name === "writing_submission_admin_get_submission") {
      return jsonResponse([{
        id: SUBMISSION_ID,
        student_id: STUDENT_ID,
        student_name: "Test Student",
        topic: "Prompt",
        answer: "Full answer",
        word_count: 2,
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
  assert.equal((await listResponse.json()).submissions[0].studentName, "Test Student");

  const detailResponse = await worker.fetch(new Request(
    `https://worker.example/v1/admin/submissions/${SUBMISSION_ID}`,
    { headers: authHeaders }
  ), environment());
  assert.equal(detailResponse.status, 200);
  assert.equal((await detailResponse.json()).submission.answer, "Full answer");
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
