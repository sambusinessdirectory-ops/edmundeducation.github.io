#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const html = read("error-identifier-system.html");
const css = read("error-identifier.css");
const indefinite = read("error-identifier-indefinite.js");
const jayden = read("error-identifier-jayden.js");
const relative = read("error-identifier-relative-clauses.js");
const relativeData = JSON.parse(read("course-materials/error-identifier/source/relative-clauses-400.json"));
const relativeMigration = read("supabase/migrations/20261109200037_error_identifier_relative_clauses.sql");

assert.match(html, /error-identifier-jayden\.js\?v=20261104-feedback1/);
assert.match(html, /error-identifier-indefinite\.js\?v=20261104-feedback1/);
assert.match(html, /error-identifier-relative-clauses-questions\.js\?v=20261109-relative1/);
assert.match(html, /error-identifier-relative-clauses\.js\?v=20261109-relative1/);

for (const [name, source, rpc] of [
  ["Module 2", indefinite, "error_identifier_indefinite_action"],
  ["Module 3", jayden, "error_identifier_jayden_action"],
  ["Module 4", relative, "error_identifier_relative_clauses_action"]
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
assert.match(relative, /if \(complete\(state\.drafts\[number\]\)\) scheduleSync/);
assert.match(css, /\.error-id-feedback__compare/);
assert.match(css, /\.error-id-feedback__reason/);

const questionContext = { window: {} };
vm.runInNewContext(read("error-identifier-jayden-questions.js"), questionContext);
assert.equal(questionContext.window.ERROR_IDENTIFIER_JAYDEN_QUESTIONS.length, 300);

const relativeQuestionContext = { window: {} };
vm.runInNewContext(read("error-identifier-relative-clauses-questions.js"), relativeQuestionContext);
const relativeQuestions = relativeQuestionContext.window.ERROR_IDENTIFIER_RELATIVE_CLAUSES_QUESTIONS;
assert.equal(relativeQuestions.length, 400);
assert.deepEqual(Array.from(relativeQuestions, question => question.number), Array.from({length:400}, (_, index) => index + 1));
assert.deepEqual(Array.from(new Set(relativeQuestions.map(question => question.paper))), Array.from({length:20}, (_, index) => index + 1));
assert.ok(relativeQuestions.every(question => Object.keys(question).sort().join(',') === 'number,paper,sentence'), 'public questions must not contain answers');
assert.equal(relativeData.questionCount, 400);
assert.equal(relativeData.setCount, 20);
assert.equal(relativeData.explanationStepCount, 2400);
assert.ok(relativeData.questions.every(question => question.steps.length === 6));
for (const source of [JSON.stringify(relativeData), read("error-identifier-relative-clauses-questions.js"), relativeMigration]) {
  assert.doesNotMatch(source, /Jayden/, 'personal-name wording must not appear in Module 4 content');
  assert.doesNotMatch(source, /而是/, 'prohibited Chinese sentence structure must not appear in Module 4 content');
}
assert.match(relativeMigration, /create table error_identifier_private\.relative_clauses_key/);
assert.match(relativeMigration, /create table error_identifier_private\.relative_clauses_progress/);
assert.match(relativeMigration, /security definer/);
assert.match(relativeMigration, /auth\.uid\(\) is null/);
assert.match(relativeMigration, /revoke all on error_identifier_private\.relative_clauses_key/);
assert.match(relativeMigration, /grant execute on function public\.error_identifier_relative_clauses_action/);

console.log("PASS Error Identifier Modules 2–4 automatic save, secure feedback reveal, 400 answer-free Relative Clause questions, 2,400 explanation steps and wording audits.");
