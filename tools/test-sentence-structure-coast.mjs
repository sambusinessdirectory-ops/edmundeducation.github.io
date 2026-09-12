import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sentenceMapLessons,sentenceMapCompleted} from '../sentence-structure-map.mjs';
import {levelPositions,restoreMapPreferences} from '../common-expression-map.mjs';
import {SHORE_LAYOUT,shorePlants,perchedGullPose,crabPose} from '../sentence-structure-coast.mjs';
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
test('the perched gull blinks and stretches; crab claw poses return to rest',()=>{
  assert.deepEqual(perchedGullPose(0),[0,0,0]);
  assert.equal(perchedGullPose(3.63)[1],1);
  assert.equal(perchedGullPose(13.9)[1],3);
  assert.deepEqual(perchedGullPose(20),[0,0,0]);
  assert.ok(crabPose(6.6).includes(1));assert.ok(crabPose(11.2).includes(2));
  assert.ok(crabPose(17.6).includes(3));assert.equal(crabPose(22)[1],0);
});
