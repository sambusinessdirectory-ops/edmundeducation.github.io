import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sentenceMapLessons,sentenceMapCompleted} from '../sentence-structure-map.mjs';
import {levelPositions,restoreMapPreferences} from '../common-expression-map.mjs';
import {SHORE_LAYOUT,shorePlants,SENTENCE_COAST} from '../sentence-structure-coast.mjs';
import {flyingGullMotion,perchedGullMotion,crabMotion} from '../sentence-structure-shore-wildlife.mjs';
import {shoreIsWalkable,shoreSegment,shorePath,shoreStep} from '../sentence-structure-coast-navigation.mjs';
const catalogue=JSON.parse(readFileSync(new URL('../assets/sentence-structure/library/manifest.json',import.meta.url))).lessons.map(l=>({...l,questions:l.questionRefs.map(([id])=>({id}))}));
const lessons=sentenceMapLessons(catalogue),nodes=levelPositions(lessons,SHORE_LAYOUT);
test('only the first thirty real Sentence Structure lessons enter the map',()=>{
  assert.equal(catalogue.length,345);assert.equal(lessons.length,30);
  assert.equal(lessons[0].id,'ss1');assert.equal(lessons.at(-1).id,'ss30');
  for(const l of lessons){assert.equal(l.questions.length,50);assert.ok(l.titleEn);assert.ok(l.mapLabel);}
  assert.equal(restoreMapPreferences({pinned:'ss31'},null,lessons.map(l=>l.id)).pinned,null);
});
test('all thirty stones and every pairwise walking route remain on land or a bridge',()=>{
  for(const from of nodes) {
    assert.ok(shoreIsWalkable(from),from.id);
    for(const to of nodes) {
      const route=shorePath(from,to);assert.ok(route,`${from.id} to ${to.id}`);
      let a=from;for(const b of route){assert.ok(shoreSegment(a,b),`${from.id} to ${to.id}`);a=b;}
      assert.deepEqual({x:a.x,y:a.y},{x:to.x,y:to.y});
    }
  }
});
test('water clicks are rejected and keyboard movement cannot cut across the stream',()=>{
  for(const to of [{x:800,y:380},{x:550,y:930},{x:1100,y:950}]) {
    assert.equal(shoreIsWalkable(to),false);assert.equal(shorePath(nodes[0],to),null);
  }
  const from={x:550,y:840};assert.ok(shoreIsWalkable(from));
  assert.deepEqual(shoreStep(from,{x:550,y:950}),from);
  assert.ok(shoreSegment({x:100,y:829},{x:100,y:1035}));
  assert.ok(shoreSegment({x:757,y:824},{x:757,y:1045}));
});
test('map progress reads best attempts and never sums retries or writes records',()=>{
  const attempts=[{lessonId:'ss1',correctCount:12},{lessonId:'ss1',correctCount:17},{lessonId:'ss2',correctCount:50}];
  const original=JSON.stringify(attempts);
  assert.equal(sentenceMapCompleted(attempts,lessons[0]),17);
  assert.equal(sentenceMapCompleted(attempts,lessons[1]),50);
  assert.equal(sentenceMapCompleted(attempts,lessons[2]),0);
  assert.equal(sentenceMapCompleted([{lessonId:'ss1',correctCount:80}],lessons[0]),50);
  assert.equal(JSON.stringify(attempts),original);
});
test('coastal plants vary by family, phase and direction without covering lesson labels',()=>{
  const plants=shorePlants(nodes);assert.ok(plants.length>35);
  assert.equal(new Set(plants.map(p=>p.kind)).size,3);
  assert.equal(new Set(plants.map(p=>p.direction)).size,2);
  for(const p of plants)assert.ok(!nodes.some(n=>Math.abs(p.x-n.x)<p.width*.5+96&&p.y>n.y-55&&p.y-p.height<n.y+108));
});
test('wildlife gestures use continuous intermediate frames and begin within a few seconds',()=>{
  assert.equal(perchedGullMotion(0).wing,0);assert.equal(perchedGullMotion(2.25).blink,1);
  assert.ok(perchedGullMotion(3.1).wing>.99);assert.equal(perchedGullMotion(8).wing,0);
  assert.ok(crabMotion(2.4).left>.99);assert.ok(crabMotion(5.2).right>.99);
  for(const fn of [flyingGullMotion,perchedGullMotion,crabMotion]){
    const frames=Array.from({length:1500},(_,i)=>fn(i/60));
    assert.ok(new Set(frames.map(f=>JSON.stringify(f))).size>1400);
    for(let i=1;i<frames.length;i++)for(const key of Object.keys(frames[i])){
      if(key==='blink')continue;
      assert.ok(Math.abs(frames[i][key]-frames[i-1][key])<.09,`${key} changes smoothly at 60 fps`);
    }
  }
});
test('overview zoom includes a wide painted surround while retaining original walking bounds',()=>{
  assert.equal(SENTENCE_COAST.minimumZoom,.5);
  assert.deepEqual(SENTENCE_COAST.cameraPadding,{left:800,right:800});
  assert.equal(SENTENCE_COAST.width,1600);assert.equal(SENTENCE_COAST.height,1950);
  assert.equal(shoreIsWalkable({x:-300,y:600}),false);
});
