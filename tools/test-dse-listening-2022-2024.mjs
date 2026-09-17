import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {questionNumbers} from '../dse-listening-question-ui.mjs';
import {hasDseGuide} from '../dse-listening-study.mjs';

const root=new URL('../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const manifest=JSON.parse(read('tools/listening/dse-part-a-source-manifest.json'));
for(const [year,count] of [[2022,52],[2024,53]]){
  const context={window:{}};
  vm.runInNewContext(read(`dse-listening-${year}-data.js`),context);
  const data=context.window[`EDMUND_DSE_LISTENING_${year}`];
  const guide=JSON.parse(read(`assets/dse-listening/${year}/guide.json`));
  assert.equal(data.year,year);assert.equal(data.questionCount,count);assert.equal(data.tasks.length,4);
  assert.equal(data.tasks.reduce((sum,task)=>sum+task.marks,0),count);
  assert.deepEqual([...data.tasks].flatMap(questionNumbers),Array.from({length:count},(_,i)=>i+1));
  assert.equal(Object.keys(guide.analysis).length,count);assert(hasDseGuide(year));
  for(const task of data.tasks){
    assert.equal(guide.questions[task.number].blocks.length,task.blocks.length);
    assert(guide.questions[task.number].blocks.every(text=>typeof text==='string'&&text.trim()));
    assert.deepEqual(Object.entries(guide.analysis).filter(([,row])=>row.task===task.number).map(([n])=>Number(n)),questionNumbers(task));
  }
  const source=manifest.sources.find(row=>row.year===year);
  assert.equal(guide.source.questionPaperSha256,source.sha256);
}
assert(fs.statSync(new URL('assets/dse-listening/2022/porcelain-patterns.webp',root)).size>100_000);
const html=read('listening-system.html'),script=read('listening-system.js'),css=read('dse-listening-original-paper.css');
assert.match(html,/dse-listening-2022-data\.js/);assert.match(html,/dse-listening-2024-data\.js/);
assert.match(script,/renderArchivePaperWorkspace/);assert.match(script,/state\.dseLayout === 'digital'/);
assert.match(script,/data-toggle-dse-layout/);assert.match(script,/data-check-dse-task/);
assert.match(css,/archive-digital-paper-page/);assert.match(css,/dse-2022-map/);assert.match(css,/dse-2024-map/);
console.log('2022 and 2024 DSE Part A: 105 native question fields, four Tasks per year, inline translations, reference answers, semantic figures and source manifest validated.');
