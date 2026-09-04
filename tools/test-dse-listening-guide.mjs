import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {safeBookmarkHref} from '../listening-study-core.mjs';
import {questionNumbers} from '../dse-listening-question-ui.mjs';
const root=new URL('../',import.meta.url);
const guide=JSON.parse(fs.readFileSync(new URL('assets/dse-listening/2021/guide.json',root),'utf8'));
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('dse-listening-2021-data.js',root),'utf8'),context);
const data=context.window.EDMUND_DSE_LISTENING_2021;
assert.equal(guide.year,2021);assert.equal(guide.source.pages,57);
assert.match(guide.source.sha256,/^[a-f0-9]{64}$/);
assert.deepEqual(Object.keys(guide.analysis).map(Number),Array.from({length:56},(_,i)=>i+1));
for(const task of data.tasks){
 const numbers=questionNumbers(task);
 assert.deepEqual(numbers,Object.entries(guide.analysis).filter(([,row])=>row.task===task.number).map(([n])=>Number(n)));
 for(const number of numbers){
  const row=guide.analysis[number];
  assert(row.answer.length>0 && row.explanation.length>35);
  assert(row.sourcePages[0]>=3 && row.sourcePages[0]<=22);
  assert(!/PAGE|Edmund Education|Knowledge pays/.test(row.explanation));
 }
 const rows=guide.transcript[task.number];
 assert.equal(rows.length,{1:54,2:41,3:46,4:73}[task.number]);
 for(const [i,row] of rows.entries()){
  assert(['Cherie','Julian','Bonnie','Leo','Professor Leung'].includes(row.speaker));
  assert(row.text && /[\u3400-\u9fff]/.test(row.zh));
  assert(Number.isFinite(row.start) && row.end>row.start);
  assert(row.end<({1:406.55,2:408.54,3:372.54,4:461.04}[task.number]));
  if(i)assert(row.start>=rows[i-1].start);
 }
}
assert.deepEqual([...new Set(Object.values(guide.transcript).flat().flatMap(row=>row.sourcePages))].sort((a,b)=>a-b),Array.from({length:35},(_,i)=>i+23));
assert.match(guide.analysis[14].answer,/presentation \/ first draft$/);
assert.match(guide.analysis[56].answer,/directly relevant to Expos$/);
assert.match(guide.transcript[2].map(row=>row.text).join(' '),/invite other countries to join the exhibition/);
assert.match(guide.transcript[2].map(row=>row.text).join(' '),/So it combined different aspects of culture: food and art/);
assert.match(guide.transcript[3].map(row=>row.text).join(' '),/Times New Roman/);
assert.equal(guide.transcript[1][0].speaker,'Cherie');
for(const href of ['listening-system.html?section=dse&year=2021&task=2#dse-analysis-q17','listening-system.html?section=dse&year=2021&task=4#dse-transcript-4-72'])assert.equal(safeBookmarkHref(href),href);
for(const href of ['javascript:alert(1)','https://evil.example/','listening-system.html?section=dse&year=2021&task=9','listening-system.html?section=dse&year=2021&task=1#<script>'])assert.equal(safeBookmarkHref(href),'listening-system.html?section=ielts');
console.log('2021 guide: all 56 answers/analyses, all 35 transcript pages, 214 bilingual rows, audio ranges and safe DSE bookmark links validated.');
