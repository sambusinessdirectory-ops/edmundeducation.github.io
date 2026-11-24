import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {JSDOM} from './email-qa/node_modules/jsdom/lib/api.js';
import {questions,passage,translations,glossary,curation,precisionRows} from '../daily-reading/parking-meter-enhanced-data.mjs';

const [html,runtime]=await Promise.all([
  fs.readFile(new URL('../daily-reading.html',import.meta.url),'utf8'),
  fs.readFile(new URL('../daily-reading/parking-meter-enhanced.mjs',import.meta.url),'utf8')
]);
assert.equal(questions.length,24);
assert.equal(questions.reduce((sum,q)=>sum+q.marks,0),40);
assert.equal(passage.length,8);
assert.equal(translations.length,8);
assert.equal(glossary.length,37);
assert.equal(curation.length,12);
assert.equal(precisionRows.length,9);
assert(!html.includes('data-section-nav'));
assert(!html.includes('practice-mode-panel'));
assert(!html.includes('Read the article carefully and answer'));
assert(!runtime.includes('儲存本題'));
assert(!runtime.includes('check-button'));
assert.match(runtime,/addEventListener\(event,\(\)=>\{card\.classList\.remove\('has-missing'\);saveDraft\(\);updateProgress\(\);\}\)/);

const dom=new JSDOM(html,{url:'https://example.test/daily-reading.html',pretendToBeVisual:true});
const {window}=dom;
Object.assign(globalThis,{window,document:window.document,sessionStorage:window.sessionStorage,localStorage:window.localStorage,FormData:window.FormData,CSS:window.CSS||{escape:value=>value},confirm:()=>true});
window.scrollTo=()=>{};
window.HTMLElement.prototype.scrollIntoView=()=>{};
window.HTMLElement.prototype.scrollTo=()=>{};
await import(`../daily-reading/parking-meter-enhanced.mjs?test=${Date.now()}`);

assert.equal(document.querySelectorAll('[data-question]').length,24);
assert.equal(document.querySelectorAll('.passage-paragraph').length,8);
assert.equal(document.querySelectorAll('.glossary-section tbody tr').length,74);
assert.equal(document.querySelectorAll('.glossary-section thead th').length,8);
assert(!document.querySelector('.glossary-section').textContent.includes('用法／提示'));
assert.equal(document.querySelectorAll('[data-highlighter-color]').length,5);
assert.equal(document.querySelectorAll('.reveal-answer-button').length,24);
assert.equal(document.querySelectorAll('.check-button').length,0);
assert([...document.querySelectorAll('.question-translation')].every(node=>node.hidden));
const q23=[...document.querySelector('[data-question="23"] .field-list').querySelectorAll('label')].map(node=>node.textContent.trim());
assert.notDeepEqual(q23,['Paragraphs 3–4','Paragraphs 5–6','Paragraphs 7–8']);

document.querySelector('[data-translation-toggle]').click();
assert([...document.querySelectorAll('.passage-translation')].every(node=>!node.hidden));
assert([...document.querySelectorAll('.question-translation')].every(node=>!node.hidden));
document.querySelector('[data-highlighter-color="green"]').click();
assert.equal(document.querySelector('[data-highlighter-color="green"]').getAttribute('aria-pressed'),'true');
assert.equal(document.querySelector('[data-highlighter-toggle]').getAttribute('aria-pressed'),'true');
document.querySelector('[data-question="1"] .reveal-answer-button').click();
assert.equal(document.querySelector('[data-question="1"] .question-feedback').hidden,false);
assert.match(document.querySelector('[data-question="1"] .question-feedback').textContent,/Transport Department/);
document.querySelector('[data-curation-toggle]').click();
assert.equal(document.querySelector('[data-curation-panel]').hidden,false);
assert.match(document.querySelector('[data-curation-panel]').textContent,/形式與語意/);
assert.equal(document.querySelectorAll('.precision-table tbody tr').length,9);
document.querySelector('[data-curation-next]').click();
assert.match(document.querySelector('.curation-progress').textContent,/S2/);
document.querySelector('[data-curation-exit]').click();

document.querySelector('[data-finish]').click();
assert.equal(document.querySelector('[data-submission-alert]').hidden,false);
assert(document.querySelector('[data-question="1"]').classList.contains('has-missing'));

for(const card of document.querySelectorAll('[data-question]')){
  const names=new Set([...card.querySelectorAll('input[type="checkbox"]')].map(node=>node.name));
  for(const name of names)[...card.querySelectorAll(`input[name="${name}"]`)].slice(0,2).forEach(node=>{node.checked=true;});
  for(const radioName of new Set([...card.querySelectorAll('input[type="radio"]')].map(node=>node.name)))card.querySelector(`input[name="${radioName}"]`).checked=true;
  card.querySelectorAll('select').forEach(node=>{node.selectedIndex=1;});
  card.querySelectorAll('input[type="text"],textarea').forEach(node=>{node.value='test answer';});
}
document.querySelector('[data-finish]').click();
assert.equal(document.querySelector('[data-view="review"]').hidden,false);
assert.equal(document.querySelectorAll('.review-card').length,24);
console.log('Daily Reading parking-meter enhanced QA passed.');
