import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {PUZZLE_STOPS,PUZZLE_PLANTS,PUZZLE_MILL,PUZZLE_BALLOON,PUZZLE_GATE,PUZZLE_FLOATS,PUZZLE_CLOUDS,createPuzzleNavigation} from '../ielts-puzzle-geometry.mjs';
import {puzzleLessons} from '../ielts-puzzle-map.mjs';
import {oscillation,rotorAngle} from '../ielts-puzzle-effects.mjs';
const context={window:{}};vm.runInNewContext(await readFile(new URL('../listening-system-catalog.js',import.meta.url),'utf8'),context);
const actual=context.window.EDMUND_LISTENING_CATALOG.practices;
const lessons=puzzleLessons(actual);assert.equal(lessons.length,actual.filter(p=>p.practice<=30).length);
assert.deepEqual(Array.from(lessons,l=>l.order),Array.from(actual,p=>p.practice).sort((a,b)=>a-b));
assert.ok(lessons.every(l=>actual.some(p=>p.id===l.id&&p.practice===l.order)),'Do not fabricate unreleased practices');
const sparse=[{id:'p30',practice:30,parts:[1,2,3,4]},{id:'p2',practice:2,parts:[1,2,3,4]},{id:'p31',practice:31,parts:[]}];
assert.deepEqual(puzzleLessons(sparse).map(l=>l.order),[2,30]);
let checkedRoutes=0;
for(const count of [20,30]){
 const nav=createPuzzleNavigation(count);
 for(const from of PUZZLE_STOPS.slice(0,count))for(const to of PUZZLE_STOPS.slice(0,count)){
  const path=nav.path(from,to);assert.ok(path?.length);assert.ok(Math.hypot(path.at(-1).x-to.x,path.at(-1).y-to.y)<.01);
  let a=from;for(const b of path){assert.ok(nav.segment(a,b),`route crosses forbidden terrain ${JSON.stringify({from,to,a,b})}`);a=b;}
  if(Math.hypot(from.x-to.x,from.y-to.y)>2)assert.ok(Math.hypot(path[0].x-from.x,path[0].y-from.y)>=2,'First waypoint must not trigger immediate arrival');
  checkedRoutes++;
 }
 assert.equal(nav.path(PUZZLE_STOPS[0],{x:850,y:80}),null);
 assert.deepEqual(nav.step(PUZZLE_STOPS[0],{x:850,y:80}),PUZZLE_STOPS[0]);
}
assert.equal(new Set(PUZZLE_PLANTS.map(p=>p.id)).size,PUZZLE_PLANTS.length);
assert.ok(rotorAngle(.1)>rotorAngle(0),'Canvas positive rotation is clockwise');
assert.ok(Math.abs(rotorAngle(PUZZLE_MILL.period)-2*Math.PI)<1e-10);
for(const item of [PUZZLE_BALLOON,PUZZLE_GATE,...PUZZLE_FLOATS,...PUZZLE_CLOUDS,...PUZZLE_PLANTS]){
 const values=Array.from({length:121},(_,i)=>oscillation(item,item.period*i/120));
 assert.ok(Math.max(...values)>.99*item.amplitude&&Math.min(...values)<-.99*item.amplitude);
 assert.ok(Math.abs(values[0]-values.at(-1))<1e-8);
}
console.log(`IELTS puzzle: ${lessons.length} real lessons, ${checkedRoutes} route pairs, no cliff traversal, fixed identities and complete motion cycles validated.`);
