import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {BLUEPRINT_STOPS,BLUEPRINT_WIDTH,BLUEPRINT_HEIGHT,blueprintNavigation,blueprintRoute,lampAngle,compassAngle,pencilAngle} from '../common-expression-blueprint-geometry.mjs';
import {blueprintLessons} from '../common-expression-blueprint.mjs';
import {lampMouth,LAMP_PLACEMENT,traceWindow} from '../common-expression-blueprint-effects.mjs';
const root=new URL('../',import.meta.url),context={window:{}};
for(const file of ['common-expression-system-data.js','common-expression-system-imported-data.js'])vm.runInNewContext(await readFile(new URL(file,root),'utf8'),context);
const source=context.window.EDMUND_COMMON_EXPRESSION_DATA.systems['rhetorical-writing'].lessons;
const lessons=blueprintLessons(source);assert.equal(lessons.length,29);assert.equal(BLUEPRINT_STOPS.length,lessons.length);
lessons.forEach((lesson,i)=>{assert.equal(lesson.id,source[i].id);assert.equal(lesson.titleEn,source[i].titleEn);assert.equal(lesson.questions,source[i].questions);assert.ok(lesson.mapLabel.length>0);const p=BLUEPRINT_STOPS[i];assert.ok(p.x>70&&p.x<BLUEPRINT_WIDTH-70&&p.y>180&&p.y<BLUEPRINT_HEIGHT-90);});
const nav=blueprintNavigation(),route=blueprintRoute();let pairs=0;
for(const from of BLUEPRINT_STOPS)for(const to of BLUEPRINT_STOPS){
 const path=nav.path(from,to);assert.ok(path?.length);assert.deepEqual(path.at(-1),to);
 if(from!==to)assert.ok(Math.hypot(path[0].x-from.x,path[0].y-from.y)>=2,'Avoid immediate-arrival zero waypoint');
 // Sample the returned route at fixed fractions, including its endpoints.
 for(const i of [0,Math.floor(path.length/4),Math.floor(path.length/2),Math.floor(path.length*3/4),path.length-1])assert.ok(nav.walkable(path[i]));pairs++;
}
assert.equal(nav.path(BLUEPRINT_STOPS[0],{x:800,y:80}),null);assert.deepEqual(nav.step(BLUEPRINT_STOPS[0],{x:800,y:80}),BLUEPRINT_STOPS[0]);
for(const point of route.points)assert.ok(point.x>26&&point.x<BLUEPRINT_WIDTH-26&&point.y>180&&point.y<BLUEPRINT_HEIGHT-90);
const positions=[0,2.125,4.25,6.375,8.5].map(lampMouth);
const radius=p=>Math.hypot(p.x-LAMP_PLACEMENT.x,p.y-LAMP_PLACEMENT.y);
positions.forEach(p=>assert.ok(Math.abs(radius(p)-radius(positions[0]))<1e-8));
assert.ok(Math.abs(positions[1].y-positions[3].y)>14,'Lamp head must visibly rise and fall');
assert.ok(Math.hypot(positions[0].x-positions[4].x,positions[0].y-positions[4].y)<1e-8);
assert.ok(lampAngle(2.125)>0&&lampAngle(6.375)<0);
assert.ok(Math.abs(compassAngle(17/4))<.04&&Math.abs(pencilAngle(13/4))<.02);
assert.ok(traceWindow(0,3).active);assert.equal(traceWindow(0,9).active,false);assert.ok(traceWindow(0,3).alpha<.71);
console.log(`Blueprint: ${lessons.length} unchanged lessons, ${pairs} route pairs, fixed lamp pivot, visible coupled motion and restrained tracing cycles passed.`);
