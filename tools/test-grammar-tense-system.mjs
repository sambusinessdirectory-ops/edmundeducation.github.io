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

for (const asset of ["grammar-system.css?v=20260908-highlight1", "grammar-tense-data.js?v=20260821-tense1", "learning-portal-scaffold.js?v=20260821-tense1", "grammar-system.js?v=20260908-highlight1"]) {
  assert.match(html, new RegExp(asset.replace(/[.?]/g, "\\$&")));
}
assert.match(runtime, /normaliseAnswer/);
assert.match(runtime, /dataset\.state = "correct"/);
assert.match(runtime, /dataset\.state = "wrong"/);
assert.match(runtime, /data-inline-explanation/);
assert.doesNotMatch(runtime, /showModal\(\)/);
assert.match(runtime, /data-reveal-step/);
assert.match(runtime, /learning_portal_set_bookmark/);
assert.match(runtime, /grammar_tense_list_progress/);
assert.match(runtime, /grammar_tense_record_completion/);
assert.match(runtime, /start \+= 25/);
assert.match(runtime, /提交答案/);
assert.match(css, /\.grammar-feedback\[data-state="correct"\]/);
assert.match(css, /\.grammar-feedback\[data-state="wrong"\]/);
assert.match(css, /\.grammar-explanation/);

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

// Exercise the real Grammar UI in both native Highlight and mark fallback modes.
const { createRequire } = await import('node:module');
const require = createRequire(new URL('./email-qa/package.json', import.meta.url));
const { JSDOM } = require('jsdom');
for (const native of [false, true]) {
  const dom = new JSDOM('<main data-learning-portal-root><section data-view="dashboard"><div class="learning-portal-empty"></div></section></main>', {runScripts:'outside-only',pretendToBeVisual:true,url:'https://example.test/grammar-system.html'});
  const w=dom.window, d=w.document;
  w.HTMLElement.prototype.scrollIntoView=function(){};
  if(native){w.CSS={highlights:new Map()};w.Highlight=class extends Set{constructor(...ranges){super(ranges)}};}
  w.eval(dataSource);w.eval(runtime);
  d.querySelector('[data-start-tense]').click();
  const button=d.querySelector('[data-grammar-highlight]'), prompt=d.querySelector('[data-question-prompt]');
  const text=prompt.textContent;
  const select=(element,start,end)=>{const range=d.createRange();range.setStart(element.firstChild,start);range.setEnd(element.firstChild,end);w.getSelection().removeAllRanges();w.getSelection().addRange(range);};
  const paint=()=>prompt.dispatchEvent(new w.KeyboardEvent('keyup',{key:'Shift',bubbles:true}));
  select(prompt,0,3);paint();
  assert.equal(d.querySelectorAll('mark').length,0,'disabled brush does not mark');
  w.getSelection().removeAllRanges();button.click();select(prompt,0,3);paint();
  const highlighted=()=>native?[...w.CSS.highlights.get('grammar-teaching')||[]].map(r=>r.toString()).join(''):[...d.querySelectorAll('mark.grammar-teaching-highlight')].map(m=>m.textContent).join('');
  assert.equal(highlighted(),text.slice(0,3),'only the selected text is highlighted');
  assert.equal(prompt.textContent,text);
  button.click();assert.equal(highlighted(),'');assert.equal(prompt.textContent,text);
  assert.equal(button.getAttribute('aria-pressed'),'false');
  button.click();select(prompt,0,3);paint();d.querySelector('[data-next-question]').click();
  assert.equal(highlighted(),'');assert.equal(button.getAttribute('aria-pressed'),'false');
  d.querySelector('[data-previous-question]').click();
  const input=d.querySelector('[name="answer"]');input.value='walks';
  d.querySelector('[data-answer-form]').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(d.querySelector('[data-feedback]').dataset.state,'correct','grading still works');
  button.click();const explanation=d.querySelector('[data-explanation-answer]');
  const before=explanation.textContent;select(explanation,0,Math.min(4,before.length));paint();
  assert.ok(highlighted());assert.equal(input.value,'walks','answer input is unchanged');
  w.dispatchEvent(new w.CustomEvent('edmund:learning-portal-session',{detail:{portalId:'grammar',user:null}}));
  assert.equal(highlighted(),'');assert.equal(button.getAttribute('aria-pressed'),'false');
  dom.window.close();
}
console.log('Grammar highlighter: exact selection, clear, next question, explanations, grading and logout passed in native and fallback modes.');
