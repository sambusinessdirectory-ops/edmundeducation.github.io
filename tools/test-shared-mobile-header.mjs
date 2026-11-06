import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDir, "..");
const script = readFileSync(path.join(root, "shared-system-nav.js"), "utf8");
const styles = readFileSync(path.join(root, "shared-system-nav.css"), "utf8");

assert.match(script, /function ensureMobileHeaderDrawer\(\)/);
assert.match(script, /ensurePomodoro\(\);\s*ensureMobileHeaderDrawer\(\);/);
assert.match(script, /dataset\.mobileExpanded = String\(next\)/);
assert.match(script, /drawer\.append\(node\)/);
assert.match(styles, /height:\s*min\(62px, calc\(10dvh - 2px\)\)/);
assert.match(styles, /\.edmund-mobile-header-drawer\s*\{[\s\S]*?display:\s*none;/);
assert.match(styles, /@media \(max-width: 700px\)[\s\S]*?\.edmund-mobile-header-drawer\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?top:\s*100%;/);
assert.match(styles, /\[data-mobile-expanded="true"\] \.edmund-mobile-header-drawer\s*\{\s*display:\s*grid;/);

const htmlFiles = execFileSync("git", ["ls-files", "*.html"], { cwd: root, encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);
let sharedPages = 0;
for (const file of htmlFiles) {
  const source = readFileSync(path.join(root, file), "utf8");
  if (!source.includes("shared-system-nav.css") && !source.includes("shared-system-nav.js")) continue;
  sharedPages += 1;
  assert.ok(
    !source.includes("20261104-system-catalogue1"),
    `${file} still references the pre-mobile shared header cache version`
  );
  if (source.includes("shared-system-nav.css")) {
    assert.ok(source.includes("shared-system-nav.css?v=20261106-mobile-header1"), `${file} has an unexpected shared header CSS version`);
  }
  if (source.includes("shared-system-nav.js")) {
    assert.ok(source.includes("shared-system-nav.js?v=20261106-mobile-header1"), `${file} has an unexpected shared header JS version`);
  }
}

assert.ok(sharedPages >= 90, `Expected the shared header across at least 90 HTML portals, found ${sharedPages}`);
console.log(`Shared mobile header checks passed across ${sharedPages} portals.`);
