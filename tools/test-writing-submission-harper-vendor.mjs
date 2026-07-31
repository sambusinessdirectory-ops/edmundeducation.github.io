import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vendorDirectory = path.join(root, "assets/vendor/harper/2.7.0");
const manifestPath = path.join(vendorDirectory, "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

assert.equal(manifest.package, "harper.js");
assert.equal(manifest.version, "2.7.0");
assert.equal(manifest.variant, "slim");
assert.equal(manifest.license, "Apache-2.0");
assert.equal(
  manifest.npmIntegrity,
  "sha512-INDnUMNJvQzv5Zv9lhgGuIRYNIpDvOXcieCbo5ED/dwn8V/02zVW5kKvU6jSJJHq1MpY0VDyg+5RjE7z5D+FeA=="
);

const expectedFiles = [
  "index.js",
  "BinaryModule-Aj1vLnwf.js",
  "slimBinary.js",
  "harper_wasm_slim_bg.wasm",
  "LICENSE"
];
assert.deepEqual(Object.keys(manifest.files).sort(), expectedFiles.sort());

for (const [filename, expected] of Object.entries(manifest.files)) {
  const filepath = path.join(vendorDirectory, filename);
  const contents = await readFile(filepath);
  const metadata = await stat(filepath);
  assert.equal(metadata.size, expected.bytes, `${filename} byte length changed`);
  assert.equal(
    createHash("sha256").update(contents).digest("hex"),
    expected.sha256,
    `${filename} SHA-256 changed`
  );
}

const license = await readFile(path.join(vendorDirectory, "LICENSE"), "utf8");
assert.match(license, /Apache License\s+Version 2\.0/u);

const helperSource = await readFile(path.join(root, "writing-submission-harper.js"), "utf8");
assert.match(helperSource, /\.\/assets\/vendor\/harper\/2\.7\.0\/index\.js/u);
assert.match(helperSource, /\.\/assets\/vendor\/harper\/2\.7\.0\/slimBinary\.js/u);
assert.doesNotMatch(helperSource, /(?:unpkg|jsdelivr|esm\.sh|cdn\.jsdelivr)\./iu);

const slimEntry = await readFile(path.join(vendorDirectory, "slimBinary.js"), "utf8");
assert.match(slimEntry, /harper_wasm_slim_bg\.wasm/u);
assert.doesNotMatch(slimEntry, /https?:\/\//iu);

console.log("Writing Submission Harper vendor integrity: OK");
