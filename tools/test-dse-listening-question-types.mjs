import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const catalogue=JSON.parse(readFileSync('dse-listening-question-types.json','utf8'));
assert.equal(catalogue.paperCount,15);
assert.equal(catalogue.taskCount,60);
assert.equal(catalogue.questionCount,817);
assert.equal(catalogue.rows.length,817);
assert.equal(Object.keys(catalogue.labels).length,15);
const context=vm.createContext({window:{}});
for(let year=2012;year<=2026;year++){
  vm.runInContext(readFileSync(`dse-listening-${year}-data.js`,'utf8'),context);
  const paper=context.window[`EDMUND_DSE_LISTENING_${year}`];
  const indexed=catalogue.rows.filter(row=>row.year===year);
  assert.equal(indexed.length,paper.questionCount,`${year} count`);
  assert.deepEqual(indexed.map(row=>row.number).sort((a,b)=>a-b),Array.from({length:paper.questionCount},(_,i)=>i+1),`${year} numbered coverage`);
  for(const task of paper.tasks){
    const listed=indexed.filter(row=>row.task===task.number);
    assert.ok(listed.length,`${year} Task ${task.number}`);
    for(const row of listed){
      assert.equal(row.title,task.title);
      assert.ok(row.text && row.text.length<=230,`${row.id} excerpt`);
      assert.ok(row.sourceBlock>=0 && row.sourceBlock<task.blocks.length,`${row.id} source block`);
      assert.ok(row.types.length && row.types.every(type=>catalogue.labels[type]),`${row.id} types`);
      assert.equal(row.href,`listening-system.html?section=dse&year=${year}&task=${task.number}&question=${row.number}`);
    }
  }
}
for(const [type,stats] of Object.entries(catalogue.counts)){
  const rows=catalogue.rows.filter(row=>row.types.includes(type));
  assert.equal(stats.questions,rows.length,`${type} count`);
  assert.equal(stats.years,new Set(rows.map(row=>row.year)).size,`${type} years`);
  assert.equal(stats.tasks,new Set(rows.map(row=>`${row.year}:${row.task}`)).size,`${type} tasks`);
}
const has=(year,task,number,type)=>catalogue.rows.find(row=>row.year===year&&row.task===task&&row.number===number)?.types.includes(type);
for(const [year,task,number,type] of [
  [2018,2,17,'route-tracing'],[2018,3,27,'editing'],[2018,3,30,'picture-diagram'],
  [2026,1,9,'map-plan'],[2026,2,12,'picture-diagram'],[2026,2,17,'map-plan'],
  [2021,1,9,'table-grid'],[2013,2,22,'map-plan'],[2015,1,16,'webpage'],
  [2020,2,20,'ranking-order'],[2025,3,35,'classification']
])assert.ok(has(year,task,number,type),`${year} Task ${task} Q${number}: ${type}`);
const html=readFileSync('listening-system.html','utf8');
const script=readFileSync('listening-system.js','utf8');
assert.match(html,/data-dse-listening-types/);
assert.match(script,/mountDseListeningTypes/);
assert.match(script,/function focusDseQuestion/);
assert.match(script,/url\.searchParams\.set\("question", String\(question\)\)/);
console.log('DSE Listening question types: 15 papers, 60 tasks, 817 uniquely indexed answers and 15 types passed.');
