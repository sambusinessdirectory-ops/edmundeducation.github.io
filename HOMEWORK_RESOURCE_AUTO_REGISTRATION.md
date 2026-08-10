# Homework resource auto-registration

The Schedule/Homework picker is generated from each learning system's authoritative catalogue. Do not edit `homework-resource-catalog.mjs` by hand.

## Existing automatic sources

`tools/generate-homework-resource-catalog.mjs` reads the Flashcard, Writing Practice, Writing Submission, DSE Writing Part A download, IELTS Reading Analysis, Speaking, Sentence Structure, Idiom, Proverb, Phrasal Verb, all six Common Expression, and IELTS Listening catalogues. Adding a valid entry to one of those source catalogues automatically adds its exact deep link the next time the site is built.

GitHub Pages runs the generator before tests and deployment. A stale generated file therefore cannot silently reach production: `tools/test-schedule-homework-links.mjs` compares the tracked catalogue with a fresh, deterministic build.

## Provider contract for another catalogue

For a future portal that cannot be read directly by the generator, add a root file whose name ends in `-homework-resources.js`. It must assign a plain array to `window.EDMUND_HOMEWORK_RESOURCES`:

```js
(function registerExampleHomeworkResources() {
  window.EDMUND_HOMEWORK_RESOURCES = [
    {
      id: "sentence:example-01",
      type: "sentence-structure",
      ordinal: 1,
      label: "#1 · Example lesson",
      detail: "Sentence Structure #1",
      url: "sentence-structure.html?lesson=example-01"
    }
  ];
})();
```

Each record requires a stable unique `id`, an allowlisted `type`, a visible `label`, and an exact same-origin deep-link `url`. `ordinal` is strongly recommended because number searches use it. Never include a student identifier, token, password, signed URL, or user-specific state.

When a completely new portal type is introduced, also add its type, allowed page and exact query-parameter contract to `schedule-homework-links.mjs`, then add positive and malicious-URL tests to `tools/test-schedule-homework-links.mjs`. This explicit allowlist prevents stored homework markers from becoming open redirects or arbitrary links.

## Required verification

Run:

```sh
node tools/generate-homework-resource-catalog.mjs
node tools/test-schedule-homework-links.mjs
```

The generator rejects duplicate IDs, malformed lesson order, missing catalogue data and incomplete provider records. The test verifies deterministic output, complete counts, exact deep links, URL allowlisting, numeric search order and safe serialization into Schedule entries.
