import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [html, css, runtime, dataSource, sql, workflow] = await Promise.all([
  read("grammar-system.html"), read("grammar-system.css"), read("grammar-system.js"),
  read("grammar-tense-data.js"), read("supabase-grammar-tense-progress.sql"), read(".github/workflows/pages.yml")
]);

const context = { window: {} };
vm.createContext(context);
vm.runInContext(dataSource, context);
const questions = context.window.EDMUND_GRAMMAR_TENSE_QUESTIONS;

assert.equal(questions.length, 150, "Tense lesson must contain all 150 PDF questions");
assert.deepEqual(Array.from(questions, (item) => item.number), Array.from({ length: 150 }, (_, index) => index + 1));
assert.equal(new Set(questions.map((item) => item.id)).size, 150);
for (const item of questions) {
  assert.match(item.id, /^tense-\d{3}$/);
  assert.ok(item.prompt && item.translation && item.answer && item.tense);
  assert.ok(Array.isArray(item.acceptedAnswers) && item.acceptedAnswers.length > 0);
  assert.ok(Array.isArray(item.explanation) && item.explanation.length >= 4);
}
assert.equal(questions[0].answer, "walks");
assert.equal(questions[49].answer, "could have won");
assert.equal(questions[50].answer, "brings");
assert.equal(questions[99].answer, "Have ... ridden");
assert.equal(questions[104].tense, "Future Perfect Continuous");
assert.equal(questions[149].answer, "will have been waiting");

for (const asset of ["grammar-system.css?v=20260821-tense1", "grammar-tense-data.js?v=20260821-tense1", "learning-portal-scaffold.js?v=20260821-tense1", "grammar-system.js?v=20260821-tense1"]) {
  assert.match(html, new RegExp(asset.replace(/[.?]/g, "\\$&")));
}
assert.match(runtime, /normaliseAnswer/);
assert.match(runtime, /dataset\.state = "correct"/);
assert.match(runtime, /dataset\.state = "wrong"/);
assert.match(runtime, /showModal\(\)/);
assert.match(runtime, /grammar_tense_list_progress/);
assert.match(runtime, /grammar_tense_record_completion/);
assert.match(runtime, /start \+= 25/);
assert.match(runtime, /提交答案及查看解析/);
assert.match(css, /\.grammar-feedback\[data-state="correct"\]/);
assert.match(css, /\.grammar-feedback\[data-state="wrong"\]/);
assert.match(css, /\.grammar-dialog::backdrop/);

assert.match(sql, /auth\.uid\(\) is null/);
assert.match(sql, /flashcard_student_sessions/);
assert.match(sql, /p_question_number not between 1 and 150/);
assert.match(sql, /p_duration_ms not between 0 and 1800000/);
assert.match(sql, /system_key,\s*event_key/);
assert.match(sql, /on conflict \(student_id, system_key, event_key\) do nothing/);
assert.match(sql, /revoke all on function public\.grammar_tense_record_completion/);
assert.match(sql, /grant execute on function public\.grammar_tense_record_completion[\s\S]*to authenticated/);
assert.doesNotMatch(sql, /grant execute[\s\S]*to anon/);
assert.match(workflow, /node tools\/test-grammar-tense-system\.mjs/);

console.log("Grammar Tense system checks passed: 150 questions, feedback, explanations, and owner-scoped progress.");
