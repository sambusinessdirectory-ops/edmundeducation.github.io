import assert from 'node:assert/strict';
import test from 'node:test';
import { formatTime, formatDelta, parseTime, elapsed, transition, expectedTotal, resizeRect } from '../execution-speedrun-core.mjs';

const sections = [{ id:'a', title:'Read', items:[{id:'a1',title:'Read passage',expected_ms:180000},{id:'a2',title:'Answer',expected_ms:120000}] }, {id:'b',title:'Review',items:[{id:'b1',title:'Check',expected_ms:60000}]}];
const fresh = () => ({status:'running',sections,splits:[],elapsed_ms:0,anchor_at:new Date(1000).toISOString(),revision:0});
test('time formatting and strict minute:second input', () => {
  assert.equal(formatTime(3600123,true),'1:00:00.12');
  assert.equal(formatDelta(-173000),'−2:53');
  assert.equal(formatDelta(202000),'+3:22');
  assert.equal(formatDelta(0),'±0:00');
  assert.equal(parseTime('65:30'),3930000);
  for (const value of ['-1:00','0:00','1:60','NaN','1:2','1:00:00','1440:01']) assert.throws(() => parseTime(value));
  assert.equal(expectedTotal(sections),360000);
});
test('split timing excludes every pause and completes only after the final item', () => {
  let run = transition(fresh(),'split',61000);
  assert.equal(run.splits[0].elapsed_ms,60000);
  run = transition(run,'pause',91000);
  assert.equal(elapsed(run,991000),90000);
  assert.throws(() => transition(run,'split',992000));
  run = transition(run,'resume',1000000);
  run = transition(run,'split',1030000);
  assert.equal(run.splits[1].elapsed_ms,60000);
  run = transition(run,'split',1050000);
  assert.equal(run.elapsed_ms,140000);
  assert.equal(run.status,'completed');
  assert.equal(run.splits[2].elapsed_ms,20000);
  assert.throws(() => transition(run,'resume',1100000));
  assert.throws(() => transition(run,'split',1100000));
});
test('early end preserves partial elapsed without inventing a completed split', () => {
  let run = transition(fresh(),'split',2000);
  run = transition(run,'pause',2500);
  run = transition(run,'end',12000);
  assert.equal(run.elapsed_ms,1500);
  assert.equal(run.splits.length,1);
  assert.equal(run.status,'ended');
  assert.equal(run.anchor_at,null);
});
test('serialized running state recovers across refresh and long idle intervals', () => {
  const run = JSON.parse(JSON.stringify(transition(fresh(),'split',61000)));
  assert.equal(elapsed(run,361000),360000);
  assert.equal(elapsed({...run,status:'paused',anchor_at:null},361000),60000);
});
test('all four corner handles independently change width and height inside the viewport', () => {
  const rect = {left:100,top:100,right:500,bottom:600};
  for (const corner of ['nw','ne','sw','se']) {
    const result = resizeRect(rect,corner,corner.includes('w') ? -40 : 40,corner.includes('n') ? -30 : 30,{width:1000,height:900});
    assert.equal(result.width,440); assert.equal(result.height,530);
    assert.equal(result.left,corner.includes('w') ? 60 : 100);
    assert.equal(result.top,corner.includes('n') ? 70 : 100);
  }
  const small = resizeRect({left:8,top:8,right:367,bottom:650},'se',999,999,{width:375,height:667});
  assert.equal(small.width,359); assert.equal(small.height,651);
});

test('standalone sections count as exactly one split alongside nested sections', () => {
  const mixed = [{id:'solo',title:'Find website',expected_ms:60000,items:[]},...sections];
  assert.equal(expectedTotal(mixed),420000);
  let run = {...fresh(),sections:mixed};
  for (const at of [2000,3000,4000]) {run=transition(run,'split',at);assert.equal(run.status,'running');}
  run=transition(run,'split',5000);
  assert.equal(run.status,'completed');assert.equal(run.splits.length,4);
  const single = transition({...fresh(),sections:[mixed[0]]},'split',2000);
  assert.equal(single.status,'completed');assert.equal(single.splits.length,1);
});
