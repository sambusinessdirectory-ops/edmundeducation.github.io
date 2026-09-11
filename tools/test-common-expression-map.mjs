import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';
import { levelPositions, minimumMapScale, restoreMapPreferences, mapPreferenceKey } from '../common-expression-map.mjs';
import { MASCOT_VIEWS } from '../speaking-mascot-views.mjs';
const root=path.resolve(import.meta.dirname,'..');
const window={};
for(const name of ['common-expression-system-data.js','common-expression-system-imported-data.js']) vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),{window});
const lessons=window.EDMUND_COMMON_EXPRESSION_DATA.systems.speaking.lessons;

test('every current Speaking lesson has a distinct, reachable stone and readable space around it',()=>{
 const stones=levelPositions(lessons);
 assert.equal(stones.length,31);
 assert.equal(new Set(stones.map(p=>p.id)).size,lessons.length);
 for(const lesson of lessons) assert.ok(stones.some(p=>p.id===lesson.id));
 for(const [index,stone] of stones.entries()) {
  assert.ok(stone.x>=100 && stone.x<=1500 && stone.y>=180 && stone.y<=1700,`${stone.id}: stone, horse and caption fit the meadow`);
  for(const other of stones.slice(index+1)) assert.ok(Math.hypot(stone.x-other.x,stone.y-other.y)>190,`${stone.id}: level hit areas and captions must not overlap`);
 }
});

test('all three original horse sheets and every directional crop are valid deployed PNG assets',()=>{
 for(const id of ['eddy','phoebe','elsie']) {
  const standing=MASCOT_VIEWS[id].standing;
  const png=fs.readFileSync(path.join(root,'assets/speaking-system/mascots/v2',standing.image));
  assert.equal(png.subarray(1,4).toString(),'PNG');
  assert.ok(png.readUInt32BE(16)>1000 && png.readUInt32BE(20)>1000);
  assert.equal(png[25],6,'Use the transparent RGBA artwork');
  assert.ok(standing.views.length>=8,'Walking needs all facing directions');
  for(const {rect:[x,y,w,h]} of standing.views) assert.ok(x>=0 && y>=0 && w>0 && h>0 && x+w<=1.00001 && y+h<=1.00001,'Crop stays inside the original sheet');
 }
});


test('normal zoom always covers the viewport, including wide and rotated screens',()=>{
 for(const [width,height] of [[1406,672],[2500,800],[390,464],[320,800],[820,750]]) {
  const scale=minimumMapScale(width,height);
  assert.ok(1600*scale>=width && 1950*scale>=height);
 }
});

test('map is the default and only an explicitly saved valid stone restores the starting location',()=>{
 const ids=lessons.map(l=>l.id);
 assert.deepEqual(restoreMapPreferences(null,{mode:false,character:'phoebe',selected:ids[2]},ids),{mode:true,character:'phoebe',pinned:null});
 assert.deepEqual(restoreMapPreferences({mode:false,character:'elsie',pinned:ids[9]},null,ids),{mode:false,character:'elsie',pinned:ids[9]});
 assert.deepEqual(restoreMapPreferences({character:'unknown',pinned:'not-a-lesson'},null,ids),{mode:true,character:'eddy',pinned:null});
});


test('Writing and Speaking keep separate account preferences even though their lesson IDs match',()=>{
 assert.equal(mapPreferenceKey('speaking','student-a'),'edmund-expression-meadow-v2:student-a');
 assert.equal(mapPreferenceKey('written','student-a'),'edmund-lesson-map-v1:written:student-a');
 assert.notEqual(mapPreferenceKey('written','student-a'),mapPreferenceKey('written','student-b'));
});
