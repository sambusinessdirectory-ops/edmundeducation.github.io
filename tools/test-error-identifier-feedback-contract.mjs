#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const html = read("error-identifier-system.html");
const css = read("error-identifier.css");
const indefinite = read("error-identifier-indefinite.js");
const jayden = read("error-identifier-jayden.js");

assert.match(html, /error-identifier-jayden\.js\?v=20261104-feedback1/);
assert.match(html, /error-identifier-indefinite\.js\?v=20261104-feedback1/);

for (const [name, source, rpc] of [
  ["Module 2", indefinite, "error_identifier_indefinite_action"],
  ["Module 3", jayden, "error_identifier_jayden_action"]
]) {
  assert.match(source, new RegExp(`portal\\.rpc\\('${rpc}'`), `${name} must use its scoped progress RPC`);
  assert.match(source, /p_answer\s*:/, `${name} must submit completed answers`);
  assert.match(source, /\.feedback\s*=\s*result\.feedback\s*\|\|\s*\{\}/, `${name} must retain server feedback`);
  assert.match(source, /error-id-feedback__compare/, `${name} must render the Module 1 comparison panel`);
  assert.match(source, /參考答案與解說/, `${name} must reveal the reference answer and rationale`);
  assert.match(source, /完整句子/, `${name} must reveal the corrected complete sentence`);
  assert.match(source, /自動儲存並顯示解說/, `${name} must explain automatic save and reveal`);
  assert.doesNotMatch(source, /data-j-submit/, `${name} must not restore a manual submit button`);
}

assert.match(indefinite, /if\s*\(done\(state\.answers\[state\.current\]\)\)\s*scheduleSync/);
assert.match(jayden, /if\(complete\(s\.drafts\[number\]\)\)scheduleSync/);
assert.match(css, /\.error-id-feedback__compare/);
assert.match(css, /\.error-id-feedback__reason/);

const questionContext = { window: {} };
vm.runInNewContext(read("error-identifier-jayden-questions.js"), questionContext);
assert.equal(questionContext.window.ERROR_IDENTIFIER_JAYDEN_QUESTIONS.length, 300);

console.log("PASS Error Identifier Modules 2 and 3 automatic save, secure feedback reveal, comparison UI and cache-busted release contract.");
