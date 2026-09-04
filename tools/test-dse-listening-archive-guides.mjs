import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {questionNumbers} from '../dse-listening-question-ui.mjs';
import {dseAnswerReplayStart,hasDseGuide} from '../dse-listening-study.mjs';
const all=[2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2023];
const years=process.env.DSE_GUIDE_YEARS?.split(',').map(Number)||all;
const root=new URL('../',import.meta.url),read=file=>fs.readFileSync(new URL(file,root),'utf8');
const norm=text=>String(text).toLowerCase().replaceAll('’',"'").replace(/[^a-z0-9]+/g,' ').trim();
let answers=0,cues=0,blocks=0;
for(const year of years){
 assert(hasDseGuide(year));
 const c={window:{}};
 for(const suffix of ['transcript','data'])vm.runInNewContext(read(`dse-listening-${year}-${suffix}.js`),c);
 const data=c.window[`EDMUND_DSE_LISTENING_${year}`],guide=JSON.parse(read(`assets/dse-listening/${year}/guide.json`));
 if(guide.source.questionDataSha256)assert.equal(guide.source.questionDataSha256,createHash('sha256').update(read(`dse-listening-${year}-data.js`)).digest('hex'),`${year} question source changed; rebuild guide`);
 if(year===2014)assert.match(data.tasks[1].blocks[1].html,/Same theme<\/th><td>John<\/td><td>\?<\/td>/,'Source paper shows John undecided about comics');
 if(year===2019)assert.match(data.tasks[1].blocks[0].html,/Mentor \(example\)<\/span> Mine/,'Preserve complete printed app name');
 assert.equal(guide.year,year);
 assert.deepEqual(Object.keys(guide.analysis).map(Number),Array.from({length:data.questionCount},(_,i)=>i+1));
 for(const task of data.tasks){
  const n=task.number,translated=guide.questions[n],rows=guide.transcript[n];
  assert(translated.title&&translated.instruction);assert.equal(translated.blocks.length,task.blocks.length);
  assert.equal(rows.length,year===2021?{1:54,2:41,3:46,4:73}[n]:data.transcript.partA[n].length);
  for(const [i,block]of task.blocks.entries()){
   const text=translated.blocks[i];assert.equal(typeof text,'string');assert(text.length>0);
   const source=[...JSON.stringify(block).matchAll(/\{\{(\d+)(?:\|[^{}]*)?\}\}/g)].map(m=>Number(m[1])).sort((a,b)=>a-b);
   const target=[...text.matchAll(/\{\{(\d+)\}\}/g)].map(m=>Number(m[1])).sort((a,b)=>a-b);
   // A numbered illustration/control can include its number in the translation;
   // every original text/table blank must remain, including repeated blanks.
   for(const number of source)assert(target.includes(number),`${year} Task${n} block${i} missing translated blank${number}`);
   assert(!/\{\{\d+\|/.test(text),'Translated choices should be text, not extra live inputs');
  }
  for(const [i,row]of rows.entries()){
   assert(row.text&&row.speaker&&typeof row.zh==='string'&&row.zh.trim(),`${year} T${n} cue${i} translation`);
   assert(Number.isFinite(row.start)&&Number.isFinite(row.end)&&row.start>=0&&row.end>row.start,`${year} T${n} cue${i} time`);
   if(i)assert(row.start>=rows[i-1].start,`${year} T${n} cue${i} order`);
  }
  assert(rows.filter(row=>/[\u3400-\u9fff]/.test(row.zh)).length/rows.length>.8,`${year} T${n} translation coverage`);
  const combined=norm(rows.map(row=>row.text).join(' '));
  const numbers=questionNumbers(task);
  assert.deepEqual(Object.entries(guide.analysis).filter(([,row])=>row.task===n).map(([q])=>Number(q)),numbers);
  for(const number of numbers){
   const row=guide.analysis[number];
   assert(row.answer&&row.explanation.length>60,`${year} Q${number} incomplete analysis`);
   assert(Number.isFinite(row.audioTime)&&row.audioTime>=0&&row.audioTime<rows.at(-1).end,`${year} Q${number} cue`);
   assert(Number.isFinite(row.audioEnd)&&row.audioEnd>row.audioTime,`${year} Q${number} end`);
   assert(row.evidence&&combined.includes(norm(row.evidence)),`${year} Q${number} evidence: ${row.evidence}`);
   assert.equal(dseAnswerReplayStart(row.audioTime),Math.max(0,row.audioTime-15));
  }
  answers+=numbers.length;cues+=rows.length;blocks+=translated.blocks.length;
 }
 console.log(`${year}: ${data.questionCount} answers, four fully translated tasks and replay timings passed.`);
}
for(const year of [2011,2022,2024,2025,2026])assert.equal(hasDseGuide(year),false);
for(const value of [undefined,null,NaN,Infinity,-1,'23'])assert.equal(dseAnswerReplayStart(value),null);
assert.equal(dseAnswerReplayStart(10),0);assert.equal(dseAnswerReplayStart(45.5),30.5);
console.log(`Archive total: ${answers} answers, ${cues} bilingual cues, ${blocks} translated blocks. Excluded years remain excluded.`);
