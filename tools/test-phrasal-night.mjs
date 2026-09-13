import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {desertPositions,desertWalkable,desertSegment,desertTrail} from '../phrasal-verb-desert-geometry.mjs';
import {PHRASAL_MAP_LIMIT,NIGHT_OFFSET,NIGHT_HEIGHT,JOURNEY_HEIGHT,JOURNEY_WATER,phrasalJourneyLessons,journeyPositions,createJourneyNavigation,journeyOverview,nightPlants,nightTumbleweedMotion} from '../phrasal-verb-night-geometry.mjs';
const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../phrasal-verb-system-data.js',import.meta.url),'utf8'),context);
const catalogue=context.window.EDMUND_PHRASAL_VERB_SYSTEM_DATA.lessons,lessons=phrasalJourneyLessons(catalogue),nodes=journeyPositions(lessons),navigation=createJourneyNavigation(nodes);
const dry=p=>desertWalkable(p,JOURNEY_HEIGHT,JOURNEY_WATER),segment=(a,b)=>desertSegment(a,b,JOURNEY_HEIGHT,JOURNEY_WATER);
test('the second chapter extends the approved day layout with the next 30 real lessons',()=>{
 assert.equal(PHRASAL_MAP_LIMIT,60);assert.equal(lessons.length,60);assert.equal(nodes.length,60);assert.equal(catalogue.length,329);
 assert.deepEqual(nodes.slice(0,30),Array.from(desertPositions(lessons.slice(0,30))));
 lessons.forEach((l,i)=>{assert.equal(l.id,catalogue[i].id);assert.equal(l.questions,catalogue[i].questions);assert.equal(l.titleEn,catalogue[i].titleEn);assert.equal(l.order,i+1);});
 assert.equal(nodes[30].id,'phrasal-verb-31');assert.equal(nodes.at(-1).id,'phrasal-verb-60');
 assert.ok(nodes.slice(30).every(p=>p.y>NIGHT_OFFSET&&p.y<JOURNEY_HEIGHT));
});
test('all 3600 ordered routes, including travel between chapters, stay on land',()=>{
 for(const from of nodes)for(const to of nodes){const route=navigation.path(from,to);assert.ok(route?.length,`${from.id} to ${to.id}`);assert.deepEqual(route.at(-1),to);let previous=from;for(const p of route){assert.ok(segment(previous,p));previous=p;}}
 const trail=desertTrail(nodes.slice(30).map(p=>({...p,y:p.y-NIGHT_OFFSET}))).points.map(p=>({...p,y:p.y+NIGHT_OFFSET}));
 trail.forEach((p,i)=>{assert.ok(dry(p));if(i)assert.ok(segment(trail[i-1],p));});
});
test('night sand allows direct free walking while all four ponds block clicks and steps',()=>{
 assert.equal(JOURNEY_WATER.length,4);
 for(const p of [{x:1100,y:250},{x:800,y:465},{x:800,y:1080},{x:365,y:NIGHT_OFFSET+315}]){assert.equal(dry(p),false);assert.equal(navigation.path(nodes[0],p),null);}
 const from={x:365,y:NIGHT_OFFSET+375},water={x:365,y:NIGHT_OFFSET+315};assert.deepEqual(navigation.step(from,water),from);
 for(const y of [820,1080,1360]){const a={x:210,y:NIGHT_OFFSET+y},b={x:1250,y:NIGHT_OFFSET+y};assert.deepEqual(navigation.path(a,b),[b]);}
 const a={x:150,y:NIGHT_OFFSET+315},b={x:630,y:NIGHT_OFFSET+315},route=navigation.path(a,b);assert.ok(route.length>1);let last=a;for(const p of route){assert.ok(segment(last,p));last=p;}
});
test('each chapter fits its complete artwork independently',()=>{
 for(const p of nodes.slice(0,30))assert.deepEqual(journeyOverview(p),{key:'day',top:0,height:1635});
 for(const p of nodes.slice(30))assert.deepEqual(journeyOverview(p),{key:'night',top:NIGHT_OFFSET,height:NIGHT_HEIGHT});
});
test('two small night tumbleweeds roll in opposite directions within the requested local bands',()=>{
 for(let i=0;i<2;i++){
  const a=nightTumbleweedMotion(0,i),b=nightTumbleweedMotion(1,i);assert.ok(i?b.x<a.x:b.x>a.x);assert.ok(a.radius<=20);
  assert.ok(Math.abs((b.angle-a.angle)*a.radius-(b.x-a.x))<1e-9);
  for(let t=0;t<150;t+=.4){const p=nightTumbleweedMotion(t,i);assert.ok(p.y>=(i?1357:817)&&p.y<=(i?1360:820));}
 }
});
test('painted nighttime plants have gentle anchored motion and clear the lesson captions',()=>{
 const plants=nightPlants();assert.equal(plants.length,24);
 for(const p of plants){assert.ok(p.period>=6);assert.ok(p.amplitude>=2&&p.amplitude<=3.4);for(const n of nodes.slice(30)){
  const y=n.y-NIGHT_OFFSET,sway=Math.tan(p.amplitude*Math.PI/180)*p.height;
  const intersects=p.x-p.width/2-sway<n.x+96&&p.x+p.width/2+sway>n.x-96&&p.y>y+31&&p.y-p.height<y+66;
  assert.equal(intersects,false,`${p.kind} at ${p.x},${p.y} clears ${n.id}`);
 }}
});
