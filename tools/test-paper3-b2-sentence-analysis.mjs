import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const core = require('../paper3/2025-b2/sentence-analysis-core.js');
const base = 'paper3/2025-b2/';
const context = {window:{}};
vm.runInNewContext(fs.readFileSync(base+'sentence-analysis-data.js','utf8'),context);
const records = context.window.EDMUND_B2_SENTENCE_ANALYSIS.records;
assert.equal(records.filter(r=>!r.supplemental).length,165);
assert.equal(new Set(records.map(r=>r.id)).size,records.length);
for (const r of records) {
  assert(r.quote && r.blocks.length,`Empty source entry: ${r.id}`);
  assert(r.pages?.length || r.originalPage,`Missing citation: ${r.id}`);
}
assert.equal(core.sentences('Ask Mr. John Duncan. Then ask Dr. Chan!').length,2);
assert.equal(core.sentences('First question? Second question! Third statement.').length,3);
const find=(text,section)=>core.matchRecords(text,section,records);
assert.equal(find('The Wellness Month was a chance to unwind.','student-interview').length,1);
assert(find('The Wellness Month was a chance to unwind.','student-interview')[0].blocks.some(b=>b.includes('Task 1')));
assert(find('What really surprised me was how much fun it was for us parents too.','student-interview')[0].blocks.some(b=>b.includes('Task 3')));
assert(find('Parents also played an important administration role throughout the month, so if you could get us some volunteers, that would be helpful.','duncan-singh-emails')[0].blocks.some(b=>b.includes('行政支援')));
assert(find("It's pretty tiring, though, and the training schedule can be demanding.",'sports-article')[0].blocks.some(b=>b.includes('淘汰')));
assert.equal(find('Completely unrelated text.','boss-letter').length,0);
assert(find('It is!','sports-article')[0].blocks.some(b=>b.includes('龍舟')));
assert.equal(core.matchRecords('Sure.','student-interview',records,"Sure. We're Alex and Emma, both in Form 5, and my dad's over there - he's been helping out.").length,1);
const html=fs.readFileSync(base+'index.html','utf8');
for (const file of ['sentence-analysis-core.js','sentence-analysis-data.js','sentence-analysis.js','sentence-analysis.css']) assert(html.includes(file));
assert(html.indexOf('sentence-analysis-core.js')<html.indexOf('sentence-analysis-data.js'));
assert(html.indexOf('sentence-analysis-data.js')<html.indexOf('sentence-analysis.js?'));
assert(!/position\s*:\s*fixed/.test(fs.readFileSync(base+'sentence-analysis.css','utf8')));
console.log('Sentence segmentation, source parsing, citations and loading contracts passed.');

// Optional full DOM suite: point to an installed jsdom module (no production dependency).
if (process.env.PAPER3_DOM_TEST_MODULE) {
  const {JSDOM}=require(process.env.PAPER3_DOM_TEST_MODULE);
  const dom=new JSDOM(html,{url:'https://edmundeducation.com/paper3/2025-b2/',runScripts:'outside-only'});
  const {window}=dom, doc=window.document;
  const media={matches:false,addEventListener(_,callback){this.change=callback;}};
  window.matchMedia=()=>media;
  const originals=[...doc.querySelectorAll('.bilingual > p[lang="en"]')].map(p=>[p,p.textContent]);
  const field=doc.querySelector('textarea');field.value='Keep my existing notes';
  for (const file of ['sentence-analysis-core.js','sentence-analysis-data.js','sentence-analysis.js']) window.eval(fs.readFileSync(base+file,'utf8'));
  const items=[...doc.querySelectorAll('.sentence-item')];
  assert(items.length>250);
  assert.equal(doc.querySelectorAll('.translation .sentence-item, [data-kind="transcript"] .sentence-item, textarea .sentence-item').length,0);
  for(const [p,text] of originals) assert.equal(p.textContent,text,'Original paragraph changed');
  const panel=doc.getElementById('sentence-analysis-panel');
  const missing=[];
  for (const item of items) {
    assert.equal(item.getAttribute('role'),'button');
    item.click();
    assert.equal(panel.hidden,false);
    assert.equal(doc.querySelectorAll('.sentence-item.is-selected').length,1);
    if(panel.textContent.includes('沒有獨立的逐句分析')) missing.push(item.textContent);
  }
  assert.deepEqual(missing,[],'Unmapped original text');
  const teachers=items.find(x=>x.textContent.includes('it was the teachers who'));
  teachers.click();assert(panel.textContent.includes('更正句'));
  assert.equal(panel.parentElement,doc.querySelector('.side'));
  media.matches=true;media.change();
  assert(panel.closest('.source-paper'),'Mobile panel is inline with source');
  assert(!doc.body.classList.contains('sentence-analysis-open'));
  doc.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
  assert(panel.hidden);assert.equal(doc.activeElement,teachers);
  teachers.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  assert(!panel.hidden);
  doc.querySelector('[data-filter="transcript"]').click();assert(panel.hidden);
  teachers.dispatchEvent(new window.KeyboardEvent('keydown',{key:' ',bubbles:true}));
  assert(!panel.hidden);
  doc.querySelector('.sentence-analysis-close').click();assert(panel.hidden);
  assert.equal(field.value,'Keep my existing notes');
  console.log(`Full DOM suite passed: ${items.length} clickable items, complete mapping, original text retained, keyboard/mobile/close/filter and saved-note safety.`);
}
