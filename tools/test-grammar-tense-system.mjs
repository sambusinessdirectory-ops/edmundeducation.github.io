import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";

const read = (path) => fs.readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [html, css, runtime, dataSource, guideSource, extensionSource, sql, workflow] = await Promise.all([
  read("grammar-system.html"), read("grammar-system.css"), read("grammar-system.js"),
  read("grammar-tense-data.js"), read("grammar-tense-curation-data.js"), read("grammar-tense-extension-data.js"), read("supabase-grammar-tense-progress.sql"), read(".github/workflows/pages.yml")
]);

const context = { window: {} };
vm.createContext(context);
vm.runInContext(dataSource, context);
vm.runInContext(guideSource, context);
vm.runInContext(extensionSource, context);
const questions = context.window.EDMUND_GRAMMAR_TENSE_QUESTIONS;
const guide = context.window.EDMUND_GRAMMAR_TENSE_CURATION;

assert.equal(questions.length, 195, "Tense lesson must contain all 195 questions");
assert.deepEqual(Array.from(questions, (item) => item.number), Array.from({ length: 195 }, (_, index) => index + 1));
assert.equal(new Set(questions.map((item) => item.id)).size, 195);
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
assert.equal(guide.length, 61, "Tense curation must teach the foundation, detailed distinctions, and final form checks");
assert.ok(guide.every((item) => item.title && item.focus && item.formula && item.examples.length === 2 && item.check && item.source));
assert.match(guide[19].title, /時間字是線索/);
assert.match(guide[49].title, /綜合檢查/);
assert.equal(new Set(guide.map((item) => item.title)).size, 61, "Each stage should teach a distinct point");
assert.match(guide[50].title, /問句與否定/);
assert.match(guide[51].title, /just、ever、never/);
assert.ok(guide.slice(50,52).every((item) => item.checkpoint?.choices.length === 3 && item.checkpoint?.whyChoices.length === 3));
assert.ok(guide.slice(19,52).every((item) => /第 \d|全部/.test(item.source) || /綜合/.test(item.source)), "Deep-dive stages should trace back to the questions");
for (const concept of ["Simple Present", "Simple Past", "will", "going to", "Present Continuous", "Past Continuous", "Future Continuous", "Present Perfect", "Past Perfect", "Future Perfect", "Perfect Continuous", "Modal Perfect"]) {
  assert.ok(guide.some((item) => `${item.title} ${item.focus} ${item.formula}`.includes(concept)), `Tense guide should explain ${concept}`);
}

for (const asset of ["grammar-system.css?v=20261019-tense-extension1", "grammar-tense-data.js?v=20260821-tense1", "grammar-tense-curation-data.js?v=20261014-tense-guide3", "learning-portal-scaffold.js?v=20260821-tense1", "grammar-system.js?v=20261019-tense-extension1", "grammar-articles-data.js?v=20261012-articles2", "grammar-articles.js?v=20261012-advanced1", "grammar-advanced-articles-data.js?v=20261012-advanced1", "grammar-advanced-articles.js?v=20261019-grammar-extension1"]) {
  assert.match(html, new RegExp(asset.replace(/[.?]/g, "\\$&")));
}
assert.match(runtime, /normaliseAnswer/);
assert.match(runtime, /dataset\.state = "correct"/);
assert.match(runtime, /dataset\.state = "wrong"/);
assert.match(runtime, /data-inline-explanation/);
assert.doesNotMatch(runtime, /showModal\(\)/);
assert.match(runtime, /data-reveal-step/);
assert.match(runtime, /data-explanation-mode-option/);
assert.match(runtime, /learning_portal_set_bookmark/);
assert.match(runtime, /grammar_tense_list_progress/);
assert.match(runtime, /grammar_tense_record_completion/);
assert.match(runtime, /start \+= 25/);
assert.match(runtime, /提交答案/);
assert.match(css, /\.grammar-feedback\[data-state="correct"\]/);
assert.match(css, /\.grammar-feedback\[data-state="wrong"\]/);
assert.match(css, /\.grammar-explanation/);
assert.match(css, /\.grammar-explanation\[data-mode="scroll"\] \.grammar-step__confirm/);

assert.match(sql, /auth\.uid\(\) is null/);
assert.match(sql, /flashcard_student_sessions/);
assert.match(sql, /p_question_number not between 1 and 195/);
assert.match(sql, /p_duration_ms not between 0 and 1800000/);
assert.match(sql, /system_key,\s*event_key/);
assert.match(sql, /on conflict \(student_id, system_key, event_key\) do nothing/);
assert.match(sql, /revoke all on function public\.grammar_tense_record_completion/);
assert.match(sql, /grant execute on function public\.grammar_tense_record_completion[\s\S]*to authenticated/);
assert.doesNotMatch(sql, /grant execute[\s\S]*to anon/);
assert.match(workflow, /node tools\/test-grammar-tense-system\.mjs/);
assert.match(workflow, /Validate focused Grammar release/);

console.log("Grammar Tense system checks passed: 195 questions, feedback, explanations, and owner-scoped progress.");

// Exercise the real Grammar UI in both native Highlight and mark fallback modes.
const { createRequire } = await import('node:module');
const require = createRequire(new URL('./email-qa/package.json', import.meta.url));
const { JSDOM } = require('jsdom');
for (const native of [false, true]) {
  const dom = new JSDOM('<main data-learning-portal-root><section data-view="dashboard"><div class="learning-portal-empty"></div></section></main>', {runScripts:'outside-only',pretendToBeVisual:true,url:'https://example.test/grammar-system.html'});
  const w=dom.window, d=w.document;
  w.HTMLElement.prototype.scrollIntoView=function(){};
  if(native){w.CSS={highlights:new Map()};w.Highlight=class extends Set{constructor(...ranges){super(ranges)}};}
  w.eval(dataSource);w.eval(guideSource);w.eval(extensionSource);w.eval(runtime);
  const cards=[...d.querySelectorAll('[data-tense-topic]')];
  assert.equal(cards.length,61,'all foundation, deep-dive, and form stages are present');
  assert.equal(d.querySelectorAll('.grammar-tense-deep-dive').length,3,'later stages have clear visual section breaks');
  const firstCheckpoint=cards[50].querySelector('[data-tense-checkpoint]');
  assert.ok(firstCheckpoint,'the form stage has an interactive checkpoint');
  assert.equal(firstCheckpoint.querySelector('[data-checkpoint-why]').hidden,true,'reason choices start hidden');
  firstCheckpoint.querySelector('[data-tense-checkpoint-choice="form"][data-choice-index="1"]').click();
  assert.equal(firstCheckpoint.querySelector('[data-checkpoint-why]').hidden,true,'an incorrect form does not reveal the reason choices');
  firstCheckpoint.querySelector('[data-tense-checkpoint-choice="form"][data-choice-index="0"]').click();
  assert.equal(firstCheckpoint.querySelector('[data-checkpoint-why]').hidden,false,'a correct form reveals the reason choices');
  firstCheckpoint.querySelector('[data-tense-checkpoint-choice="why"][data-choice-index="0"]').click();
  assert.match(firstCheckpoint.querySelector('[data-checkpoint-why-feedback]').textContent,/last night/,'the rationale is shown after choosing the reason');
  assert.ok(cards[51].querySelector('[data-tense-checkpoint]'),'the word-order stage has a checkpoint');
  Object.defineProperty(w,'scrollY',{configurable:true,writable:true,value:0});
  cards.forEach((card,index)=>{card.getBoundingClientRect=()=>({top:600+index*450-w.scrollY})});
  d.querySelector('[data-open-tense-guide]').click();
  assert.equal(d.querySelector('[data-tense-curation]').hidden,false);
  assert.match(w.location.search,/lesson=tense&view=curation/);
  assert.equal(cards[0].dataset.scrollVisible,'true');
  assert.equal(cards[1].dataset.scrollVisible,'false','later guide cards are initially concealed');
  w.scrollY=500;w.dispatchEvent(new w.Event('scroll'));
  assert.equal(cards[1].dataset.scrollVisible,'true','scrolling down reveals the next concept');
  assert.equal(cards[2].dataset.scrollVisible,'false','scrolling reveals concepts progressively');
  w.scrollY=0;w.dispatchEvent(new w.Event('scroll'));
  assert.equal(cards[1].dataset.scrollVisible,'false','scrolling up conceals later concepts');
  d.querySelector('[data-tense-start]').click();
  assert.equal(d.querySelector('[data-tense-curation]').hidden,true);
  assert.equal(d.querySelector('[data-grammar-practice]').hidden,false);
  d.querySelector('[data-back-tense-guide]').click();
  assert.equal(d.querySelector('[data-tense-curation]').hidden,false,'practice can return to curation');
  d.querySelector('[data-tense-menu]').click();
  assert.equal(d.querySelector('[data-grammar-library]').hidden,false,'guide can return to lesson menu');
  d.querySelector('[data-start-tense]').click();
  assert.equal(d.querySelector('[data-question-tense]'),null,'practice does not reveal the answer tense before submission');
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
  const steps=[...d.querySelectorAll('.grammar-step')];
  const stepMode=d.querySelector('[data-explanation-mode-option="step"]');
  const scrollMode=d.querySelector('[data-explanation-mode-option="scroll"]');
  assert.equal(stepMode.getAttribute('aria-pressed'),'true','step mode remains the default');
  assert.equal(steps[0].hidden,false);
  assert.equal(steps[1].hidden,true,'later explanations begin hidden in step mode');
  w.scrollY=0;
  const stepList=d.querySelector('[data-inline-steps]');
  stepList.getBoundingClientRect=()=>({top:200-w.scrollY});
  steps.forEach((step,index)=>Object.defineProperty(step,'offsetTop',{configurable:true,value:index*180}));
  scrollMode.click();
  assert.equal(scrollMode.getAttribute('aria-pressed'),'true');
  assert.equal(d.querySelector('[data-inline-explanation]').dataset.mode,'scroll');
  assert.ok(steps.every(step=>!step.hidden),'scroll mode keeps later cards in page flow');
  assert.equal(steps[0].dataset.scrollVisible,'true');
  assert.equal(steps[1].dataset.scrollVisible,'false','scroll mode does not reveal later explanations at once');
  assert.equal(steps[1].getAttribute('aria-hidden'),'true');
  w.scrollY=120;w.dispatchEvent(new w.Event('scroll'));
  assert.equal(steps[1].dataset.scrollVisible,'true','scrolling down reveals the next step');
  assert.equal(steps[2].dataset.scrollVisible,'false','scrolling one interval does not reveal every step');
  w.scrollY=900;w.dispatchEvent(new w.Event('scroll'));
  assert.ok(steps.every(step=>step.dataset.scrollVisible==='true'),'continued scrolling reaches every step');
  w.scrollY=240;w.dispatchEvent(new w.Event('scroll'));
  assert.equal(steps[2].dataset.scrollVisible,'true');
  assert.equal(steps[3].dataset.scrollVisible,'false','reverse scrolling conceals only later steps');
  w.scrollY=0;w.dispatchEvent(new w.Event('scroll'));
  assert.equal(steps[1].dataset.scrollVisible,'false','scrolling back up conceals later steps');
  assert.equal(w.localStorage.getItem('edmund-grammar-tense-explanation-mode-v1'),'scroll');
  stepMode.click();
  assert.equal(steps[1].hidden,true,'switching back restores the progressive view');
  assert.equal(steps[1].hasAttribute('aria-hidden'),false,'step mode restores accessibility');
  const reveal=steps[0].querySelector('[data-reveal-step]');
  reveal.checked=true;reveal.dispatchEvent(new w.Event('change',{bubbles:true}));
  assert.equal(steps[1].hidden,false,'the original checkbox still reveals the next step');
  scrollMode.click();stepMode.click();
  assert.equal(steps[1].hidden,false,'switching modes preserves completed reading steps');
  button.click();const explanation=d.querySelector('[data-explanation-answer]');
  const before=explanation.textContent;select(explanation,0,Math.min(4,before.length));paint();
  assert.ok(highlighted());assert.equal(input.value,'walks','answer input is unchanged');
  w.dispatchEvent(new w.CustomEvent('edmund:learning-portal-session',{detail:{portalId:'grammar',user:null}}));
  assert.equal(highlighted(),'');assert.equal(button.getAttribute('aria-pressed'),'false');
  dom.window.close();
}
console.log('Grammar highlighter: exact selection, clear, next question, explanations, grading and logout passed in native and fallback modes.');

for (const [url, expectedView] of [
  ['https://example.test/grammar-system.html?lesson=tense', 'curation'],
  ['https://example.test/grammar-system.html?lesson=tense&question=1', 'practice'],
  ['https://example.test/grammar-system.html?lesson=tense&view=practice&question=94', 'practice']
]) {
  const dom = new JSDOM('<main data-learning-portal-root><section data-view="dashboard"><div class="learning-portal-empty"></div></section></main>', { runScripts: 'outside-only', pretendToBeVisual: true, url });
  dom.window.HTMLElement.prototype.scrollIntoView = function () {};
  dom.window.eval(dataSource);
  dom.window.eval(guideSource);
  dom.window.eval(extensionSource);
  dom.window.eval(runtime);
  const section = dom.window.document.querySelector(expectedView === 'curation' ? '[data-tense-curation]' : '[data-grammar-practice]');
  assert.equal(section.hidden, false, `${url} should open ${expectedView}`);
  if (url.includes('question=94')) assert.equal(dom.window.document.querySelector('.grammar-question__number').textContent, 'QUESTION 94 / 195');
  dom.window.close();
}
console.log('Tense guide and direct question routes passed.');
