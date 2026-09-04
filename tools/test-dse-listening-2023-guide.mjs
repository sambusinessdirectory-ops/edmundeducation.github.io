import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {questionNumbers} from '../dse-listening-question-ui.mjs';
import {safeBookmarkHref} from '../listening-study-core.mjs';
import {analysisRows, transcriptZh} from './listening/2023-guide-content.mjs';
const root=new URL('../',import.meta.url), read=file=>fs.readFileSync(new URL(file,root),'utf8');
const guide=JSON.parse(read('assets/dse-listening/2023/guide.json'));
const context={window:{}};
for(const file of ['dse-listening-2023-transcript.js','dse-listening-2023-data.js'])vm.runInNewContext(read(file),context);
const data=context.window.EDMUND_DSE_LISTENING_2023;
assert.equal(guide.year,2023);
assert.match(guide.source.status,/not an official HKEAA/);
assert.match(guide.source.styleReference,/2021/);
assert.match(guide.source.styleReferenceSha256,/^[a-f0-9]{64}$/);
assert.deepEqual(Object.keys(guide.analysis).map(Number),Array.from({length:53},(_,i)=>i+1));
for(const task of data.tasks){
 const n=task.number, numbers=questionNumbers(task), question=guide.questions[n];
 assert.deepEqual(numbers,Object.entries(guide.analysis).filter(([,row])=>row.task===n).map(([q])=>Number(q)));
 assert.equal(question.blocks.length,task.blocks.length);
 assert(question.title && question.instruction);
 const markers=question.blocks.flatMap(text=>[...text.matchAll(/\{\{(\d+)\}\}/g)].map(match=>Number(match[1]))).sort((a,b)=>a-b);
 assert.deepEqual(markers,numbers.filter(number=>number!==4),`Task ${n} translated blanks`);
 if(n===1)assert.match(question.blocks[4],/A 航空交通管制員\nB 救援飛機領航員\nC 機場保安人員\nD 噴射機飛行教練/);
 const rows=guide.transcript[n];
 assert.equal(rows.length,{1:32,2:19,3:39,4:15}[n]);
 assert.equal(transcriptZh[n].length,data.transcript.partA[n].length);
 for(const [i,row]of rows.entries()){
  assert(row.speaker && row.text && /[\u3400-\u9fff]/.test(row.zh));
  assert(Number.isFinite(row.start)&&row.start>=0&&row.end>row.start);
  assert(row.end<({1:410,2:400,3:460,4:430}[n]));
  if(i)assert(row.start>=rows[i-1].start);
 }
 for(const number of numbers){
  const row=guide.analysis[number];
  assert(row.answer && row.evidence && row.explanation.length>100);
  assert.match(row.explanation,/中伏位/);
  assert.deepEqual(row.questionSourcePages,[n+2]);
 }
}
assert.equal(analysisRows.length,53);
assert.equal(new Set(analysisRows.map(row=>row[0])).size,53);
assert.match(guide.analysis[27].answer,/4\.12 million/);
assert.match(guide.analysis[32].answer,/opening gifts/);
assert.match(guide.analysis[33].answer,/wants/);
assert.match(guide.analysis[37].answer,/less predictable/);
assert.match(guide.analysis[46].explanation,/not to flirt, but instead to show affection/);
assert.match(guide.transcript[1].map(row=>row.text).join(' '),/Cyberland.*And we were the result\./);
assert(!JSON.stringify(guide.transcript).includes('none the wiser'));
assert(!JSON.stringify(guide).includes('Hannah'));
assert(!/[题写两]/.test(JSON.stringify(guide)),'Unexpected simplified characters');
assert(!/4\.12|四百一十二|their mother/.test(JSON.stringify(guide.questions)),'Question translations must not disclose answers');
for(const href of ['listening-system.html?section=dse&year=2023&task=3#dse-analysis-q27','listening-system.html?section=dse&year=2023&task=4#dse-transcript-4-14'])assert.equal(safeBookmarkHref(href),href);
console.log('2023 guide: 53 analyses, evidence and answer distinctions, 105 translated cues, 50 translated question blocks, unchanged blanks and safe bookmarks validated.');
