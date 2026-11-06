import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

// These four student portals embed the shared essay-link runtime.
const release = "20261106-memorization1";
for (const page of ["flashcards.html","writing-practice.html","writing-submission.html","model-essay-downloads.html"]) {
  const source = readFileSync(new URL("../"+page, import.meta.url), "utf8");
  const versions = [...source.matchAll(/essay-portal-links\.js\?v=([^"'\s]+)/g)].map(match=>match[1]);
  assert.ok(versions.length, page+" is missing the essay-link runtime");
  for (const version of versions) assert.equal(version,release,page);
}
