#!/usr/bin/env node

import assert from "node:assert/strict";
import test from "node:test";
import { readFile, readdir } from "node:fs/promises";
import vm from "node:vm";

import {
  ArticleLoadError,
  articleDataUrl,
  createArticleRepository,
  questionNumberLabel,
  questionNumbers,
  validateArticlePayload,
} from "../ielts-reading-analysis-loader.mjs";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

function makeQuestion(number, numbers = [number]) {
  return {
    number,
    ...(numbers.length > 1 ? { numbers, answerKeys: numbers.map((value) => `A${value}`) } : { answerKey: `A${number}` }),
    answer: numbers.map((value) => `A${value}`).join(" / "),
    type: "Test type",
    prompt: "Test prompt",
    translation: "測試題目",
    sections: [{ id: "task", title: "分析", blocks: [{ kind: "paragraph", text: "內容" }] }],
  };
}

function makeArticle(id = "lazy-article") {
  return {
    id,
    catalogueId: "p1-009",
    passage: 1,
    title: "Lazy article",
    eyebrow: "IELTS Reading · Passage 1",
    description: "逐題分析",
    questionCount: 3,
    answerKey: ["A1", "A2", "A3"],
    questions: [makeQuestion(1), makeQuestion(2, [2, 3])],
  };
}

function lazyManifest() {
  return {
    dataDirectory: "/ielts-reading-analysis-data/",
    articles: {
      "lazy-article": {
        id: "lazy-article",
        catalogueIds: ["p1-009", "p1-060"],
        passage: 1,
        source: "json",
        file: "lazy-article.json",
        version: "v 2",
      },
    },
  };
}

test("the public manifest keeps legacy articles bundled and lightweight", async () => {
  const [source, contentSource, indexSource] = await Promise.all([
    read("ielts-reading-analysis-availability.js"),
    read("ielts-reading-analysis-content.js"),
    read("ielts-reading-analysis-index.js"),
  ]);
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename: "ielts-reading-analysis-availability.js" });
  vm.runInNewContext(contentSource, context, { filename: "ielts-reading-analysis-content.js" });
  vm.runInNewContext(indexSource, context, { filename: "ielts-reading-analysis-index.js" });
  const manifest = context.window.EDMUND_IELTS_READING_ANALYSIS_AVAILABILITY;

  assert.equal(manifest.dataDirectory, "/ielts-reading-analysis-data/");
  assert.equal(manifest.articles["mungo-man"].source, "bundled");
  assert.equal(manifest.articles["if-you-can-get-used-to-the-taste"].source, "bundled");
  assert.doesNotMatch(source, /"questions"\s*:/, "the availability file must not contain article bodies");

  let fetchCount = 0;
  const repository = createArticleRepository({
    availabilityManifest: manifest,
    bundledArticles: context.window.EDMUND_IELTS_READING_ANALYSIS_CONTENT.articles,
    fetchImpl: async () => { fetchCount += 1; },
  });
  assert.equal((await repository.load("mungo-man")).title, "Mungo Man");
  assert.equal((await repository.load("if-you-can-get-used-to-the-taste")).passage, 1);
  assert.equal(fetchCount, 0, "legacy bundled articles must not make a JSON request");

  const catalogueRecords = Object.values(
    context.window.EDMUND_IELTS_READING_ANALYSIS_INDEX.passages,
  ).flat();
  const catalogueById = new Map(catalogueRecords.map((record) => [record.id, record]));
  const referencedJsonFiles = new Set();
  for (const [id, entry] of Object.entries(manifest.articles)) {
    const catalogueIds = entry.catalogueIds || [entry.catalogueId];
    assert.ok(catalogueIds.length, `${id}: no catalogue IDs`);
    catalogueIds.forEach((catalogueId) => {
      assert.equal(catalogueById.get(catalogueId)?.passage, entry.passage, `${id}: catalogue mismatch`);
    });
    if (entry.source !== "json") continue;
    const file = entry.file || `${id}.json`;
    referencedJsonFiles.add(file);
    const payload = JSON.parse(await read(`ielts-reading-analysis-data/${file}`));
    validateArticlePayload(payload, {
      ...entry,
      id,
      catalogueId: catalogueIds[0],
      catalogueIds,
    });
  }
  const deployedJsonFiles = new Set(
    (await readdir(new URL("ielts-reading-analysis-data/", root)))
      .filter((file) => file.endsWith(".json")),
  );
  assert.deepEqual(deployedJsonFiles, referencedJsonFiles, "manifest and deployed article JSON differ");
});

test("JSON articles fetch only on first open and catalogue aliases share one payload", async () => {
  const calls = [];
  let resolveResponse;
  const responsePromise = new Promise((resolve) => { resolveResponse = resolve; });
  const repository = createArticleRepository({
    availabilityManifest: lazyManifest(),
    bundledArticles: {},
    fetchImpl: (...args) => {
      calls.push(args);
      return responsePromise;
    },
  });

  assert.equal(calls.length, 0, "constructing/searching the catalogue must not fetch article JSON");
  assert.equal(repository.availabilityForCatalogueId("p1-009")?.id, "lazy-article");
  assert.equal(repository.availabilityForCatalogueId("p1-060")?.id, "lazy-article");

  const firstLoad = repository.load("lazy-article");
  const duplicateLoad = repository.load("lazy-article");
  await Promise.resolve();
  assert.equal(calls.length, 1, "concurrent opens must share one request");
  assert.equal(calls[0][0], "/ielts-reading-analysis-data/lazy-article.json?v=v%202");
  assert.equal(calls[0][1].credentials, "same-origin");

  resolveResponse({ ok: true, json: async () => ({ article: makeArticle() }) });
  assert.equal(await firstLoad, await duplicateLoad);
  assert.equal(repository.getLoaded("lazy-article")?.title, "Lazy article");
  await repository.load("lazy-article");
  assert.equal(calls.length, 1, "a successful article must stay cached for the page session");
});

test("failed requests are evicted so the visible retry can really fetch again", async () => {
  let attempts = 0;
  const repository = createArticleRepository({
    availabilityManifest: lazyManifest(),
    bundledArticles: {},
    fetchImpl: async () => {
      attempts += 1;
      return attempts === 1
        ? { ok: false, status: 503, json: async () => ({}) }
        : { ok: true, status: 200, json: async () => makeArticle() };
    },
  });

  await assert.rejects(
    repository.load("lazy-article"),
    (error) => error instanceof ArticleLoadError && error.code === "http-error",
  );
  assert.equal((await repository.load("lazy-article")).id, "lazy-article");
  assert.equal(attempts, 2);
});

test("payload identity and complete answer coverage are enforced", () => {
  const availability = {
    id: "lazy-article",
    catalogueId: "p1-009",
    catalogueIds: ["p1-009", "p1-060"],
    passage: 1,
    source: "json",
  };
  const article = makeArticle();
  assert.equal(validateArticlePayload(article, availability), article);
  assert.deepEqual(questionNumbers(article.questions[1]), [2, 3]);
  assert.equal(questionNumberLabel(article.questions[1]), "2–3");

  assert.throws(
    () => validateArticlePayload({ ...article, id: "different" }, availability),
    (error) => error.code === "invalid-payload",
  );
  assert.throws(
    () => validateArticlePayload({ ...article, questions: [makeQuestion(1), makeQuestion(3)] }, availability),
    (error) => error.code === "invalid-payload",
  );
  assert.throws(
    () => validateArticlePayload({ ...article, paragraphOverview: { title: "Roadmap", intro: "Intro", paragraphs: "x" } }, availability),
    (error) => error.code === "invalid-payload",
  );
  assert.throws(
    () => validateArticlePayload({ ...article, paragraphOverview: { title: "Roadmap", intro: "Intro", paragraphs: [null] } }, availability),
    (error) => error.code === "invalid-payload",
  );
  assert.throws(
    () => validateArticlePayload({ ...article, sourceNotes: [""] }, availability),
    (error) => error.code === "invalid-payload",
  );
});

test("only safe manifest filenames can become data URLs", () => {
  assert.equal(
    articleDataUrl({ id: "safe", source: "json", file: "safe.json", version: "3" }),
    "/ielts-reading-analysis-data/safe.json?v=3",
  );
  assert.throws(
    () => articleDataUrl({ id: "unsafe", source: "json", file: "../private.json" }),
    (error) => error.code === "invalid-file",
  );
});

test("the page exposes loading, error, retry and stale-route protection", async () => {
  const [html, css, client, workflow, readme] = await Promise.all([
    read("ielts-reading-analysis.html"),
    read("ielts-reading-analysis.css"),
    read("ielts-reading-analysis.js"),
    read(".github/workflows/pages.yml"),
    read("ielts-reading-analysis-data/README.md"),
  ]);

  assert.match(html, /ielts-reading-analysis-availability\.js/);
  assert.match(html, /type="module" src="ielts-reading-analysis\.js/);
  assert.match(html, /data-view="article-status"[^>]*aria-live="polite"/);
  assert.match(html, /data-action="retry-article"/);
  assert.match(css, /\.article-status-card\.is-error/);
  assert.match(client, /const revision = \+\+routeRevision/);
  assert.match(client, /revision !== routeRevision \|\| currentArticleId !== articleId/);
  assert.match(client, /articleRepository\.availabilityForId\(articleId\)/);
  assert.match(client, /articleRepository\.load\(articleId\)/);
  assert.match(client, /data-question-numbers/);
  assert.match(client, /paragraph\.label \|\| `Paragraph \$\{paragraph\.number\}`/);
  assert.match(html, /data-source-notes/);
  assert.match(client, /article\.sourceNotes/);
  assert.match(css, /\.source-notes/);
  assert.match(css, /\.analysis-hero \[data-analysis-description\]/);
  assert.match(css, /\.analysis-hero > div:first-child \{ min-width: 0; \}/);
  assert.match(css, /overflow-wrap: anywhere/);
  assert.match(workflow, /node --test tools\/test-ielts-reading-analysis-lazy-loader\.mjs/);
  assert.match(readme, /catalogueIds/);
});
