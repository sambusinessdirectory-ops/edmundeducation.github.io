import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const generator = path.join(root, "tools/generate-writing-submission-reference-data.mjs");
const checkedInModule = path.join(root, "writing-submission-reference-data.mjs");

function generateReferenceModule(outputPath) {
  execFileSync(process.execPath, [generator, "--output", outputPath], {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe"
  });
  return fs.readFileSync(outputPath, "utf8");
}

test("Writing Submission reference data is deterministic and up to date", () => {
  const temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "writing-submission-reference-"));
  try {
    const first = generateReferenceModule(path.join(temporaryDirectory, "first.mjs"));
    const second = generateReferenceModule(path.join(temporaryDirectory, "second.mjs"));
    assert.equal(first, second, "two generator runs must produce byte-identical modules");
    assert.equal(
      first,
      fs.readFileSync(checkedInModule, "utf8"),
      "rerun the generator after changing an essay, translation, or Flash Card deck"
    );
  } finally {
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  }
});

test("generated references preserve model essays, translations and thematic vocabulary", async () => {
  const moduleUrl = `${pathToFileURL(checkedInModule).href}?test=${Date.now()}`;
  const { WRITING_SUBMISSION_REFERENCE_DATA: references } = await import(moduleUrl);
  const entries = Object.entries(references);

  assert.equal(entries.length, 288);
  assert.equal(entries.filter(([, reference]) => reference.vocabulary.length > 0).length, 283);

  for (const [exerciseId, reference] of entries) {
    assert.match(exerciseId, /^model-essay-/);
    assert.match(reference.essayKey, /^[^:]+:\d+$/);
    assert.ok(reference.paragraphs.length > 0, `${exerciseId} must include essay paragraphs`);
    for (const paragraph of reference.paragraphs) {
      assert.ok(paragraph.label, `${exerciseId} has an unlabelled paragraph`);
      assert.ok(paragraph.english, `${exerciseId} has an empty English paragraph`);
      assert.ok(paragraph.chinese, `${exerciseId} has an empty Chinese translation`);
    }
    for (const row of reference.vocabulary) {
      assert.ok(row.english, `${exerciseId} has an empty vocabulary term`);
      assert.equal(typeof row.chinese, "string");
    }
  }

  const museums = references["model-essay-3-ielts-opinion"];
  assert.equal(museums.essayKey, "opinion:3");
  assert.match(museums.paragraphs[0].english, /^Museums and galleries help shape/);
  assert.match(museums.paragraphs[0].chinese, /^博物館和美術館有助塑造/);
  assert.equal(museums.vocabulary.length, 62);
  assert.deepEqual(museums.vocabulary[0], {
    english: "museums and galleries",
    chinese: "博物館和美術館"
  });

  assert.deepEqual(
    entries
      .filter(([, reference]) => reference.vocabulary.length === 0)
      .map(([exerciseId]) => exerciseId)
      .sort(),
    [
      "model-essay-2-ielts-cause-solution",
      "model-essay-26-ielts-direct-question",
      "model-essay-55-ielts-opinion",
      "model-essay-76-ielts-opinion",
      "model-essay-9-ielts-task1-maps"
    ]
  );
});
