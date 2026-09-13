import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {PAPER_TRAIL,PAPER_BOATS,PAPER_CLOUDS,PAPER_PIGEON,PAPER_FLAGS,PAPER_MILL,paperPositions,paperPlants,paperPath,paperSegment,paperStep,paperInWater,paperOnBridge,paperIsWalkable} from '../idiom-paper-geometry.mjs';
import {paperBoatMotion,paperCloudMotion,paperPlantMotion,paperPigeonMotion,paperMillMotion,paperFlagMotion} from '../idiom-paper-motion.mjs';
import {idiomMapLessons,idiomMapCompleted} from '../idiom-paper-map.mjs';
import {IDIOM_PAPER_THEME} from '../idiom-paper-theme.mjs';
const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(new URL('../idiom-system-data.js',import.meta.url),'utf8'),sandbox);
const source=sandbox.window.EDMUND_IDIOM_SYSTEM_DATA.lessons,mapped=idiomMapLessons(source),nodes=paperPositions(mapped),plants=paperPlants();
const span=a=>Math.max(...a)-Math.min(...a);
const times=Array.from({length:2401},(_,i)=>i/10);

test('the map uses the first 30 real idioms and preserves the full 138-lesson catalogue',()=>{
  assert.equal(source.length,138);assert.equal(mapped.length,30);assert.equal(nodes.length,30);
  mapped.forEach((l,i)=>{assert.equal(l.id,source[i].id);assert.equal(l.titleEn,source[i].titleEn);assert.equal(l.questions,source[i].questions);assert.equal(l.image,source[i].image||'');assert.equal(l.order,i+1);});
  assert.equal(source.slice(30).length,108);assert.equal(new Set(nodes.map(p=>p.id)).size,30);
});
test('completion matches the current idiom card semantics, including obsolete attempts',()=>{
  const l=mapped[0],total=l.questions.length;
  assert.equal(idiomMapCompleted([{lessonId:l.id,totalCount:total-1,correctCount:total-1,status:'completed'}],l),0);
  assert.equal(idiomMapCompleted([{lessonId:l.id,totalCount:total,correctCount:total,status:'in_progress'}],l),total-1);
  assert.equal(idiomMapCompleted([{lessonId:l.id,totalCount:total,correctCount:total,status:'completed'}],l),total);
  assert.equal(idiomMapCompleted([{lessonId:l.id,totalCount:total,correctCount:17,status:'in_progress'}],l),17);
});
test('all 900 ordered routes stay on walkable ground or a bridge',()=>{
  let count=0;
  for(const from of nodes)for(const to of nodes){assert.ok(paperIsWalkable(from));const route=paperPath(from,to);assert.ok(route,`${from.id} to ${to.id}`);let prev=from;for(const point of route){assert.ok(paperSegment(prev,point));prev=point;}assert.deepEqual(route.at(-1),to);count++;}
  assert.equal(count,900);
  const left=nodes[1],right=nodes[2];assert.ok(paperPath(left,right).some(p=>paperOnBridge(p)),'The river crossing uses the timber bridge');
});
test('free walking cannot enter blue water or the windmill footprint',()=>{
  const water={x:500,y:585};assert.ok(paperInWater(water));assert.equal(paperIsWalkable(water),false);assert.equal(paperPath(nodes[0],water),null);
  assert.equal(paperIsWalkable({x:PAPER_MILL.x,y:PAPER_MILL.y}),false);
  const start={x:1335,y:460},end={x:1410,y:460};assert.deepEqual(paperStep(start,end),start);
});
test('both boats remain afloat across complete independent cycles',()=>{
  for(const b of PAPER_BOATS){const frames=times.map(t=>paperBoatMotion(t,b));assert.ok(span(frames.map(p=>p.x))>45);for(const f of frames){for(const dx of [-40,0,40])assert.ok(paperInWater({x:f.x+dx*b.size,y:f.y+4}),`boat hull ${JSON.stringify(f)}`);assert.ok(Math.abs(f.roll)<.03);}}
  assert.ok(times.some(t=>{const a=paperBoatMotion(t+.1,PAPER_BOATS[0]).x-paperBoatMotion(t,PAPER_BOATS[0]).x,b=paperBoatMotion(t+.1,PAPER_BOATS[1]).x-paperBoatMotion(t,PAPER_BOATS[1]).x;return a*b<0;}));
});
test('the mill rotates continuously clockwise without reversing',()=>{
  let previous=-Infinity;for(const t of times){const a=paperMillMotion(t);assert.ok(a>previous);previous=a;}assert.ok(Math.abs(paperMillMotion(13)-Math.PI*2)<1e-10);
});
test('each castle flag has visible independent flex',()=>{
  for(const f of PAPER_FLAGS){const m=times.map(t=>paperFlagMotion(t,f));assert.ok(span(m.map(p=>p.wave))>1.99);assert.ok(span(m.map(p=>p.fold))>1.99);}
  assert.notEqual(PAPER_FLAGS[0].phase,PAPER_FLAGS[1].phase);
});
test('all inventoried plants sway gently around their fixed roots',()=>{
  assert.ok(plants.length>=30);assert.deepEqual(new Set(plants.map(p=>p.kind)),new Set(['pine','round','bush','sprout']));
  for(const p of plants){const a=times.map(t=>paperPlantMotion(t,p));assert.ok(Math.min(...a)<-.025);assert.ok(Math.max(...a)>.025);assert.ok(a.every(v=>Math.abs(v)<=.051));assert.ok(!paperInWater(p));}
});
test('paper clouds travel gently and the flapping pigeon flies faster in both directions',()=>{
  for(const c of PAPER_CLOUDS){const m=times.map(t=>paperCloudMotion(t,c));assert.ok(span(m.map(p=>p.x))>90);}
  // Include exact quarter-cycle events: a 100 ms cadence misses these extrema.
  const frames=[...times,1.45/4,1.45*3/4].map(t=>paperPigeonMotion(t,PAPER_PIGEON));assert.ok(span(frames.map(p=>p.flap))>.899);assert.ok(frames.some(p=>p.velocity>12)&&frames.some(p=>p.velocity< -12));
  assert.ok(span(frames.map(p=>p.x))>299);
  const birdAverage=4*PAPER_PIGEON.amplitude/PAPER_PIGEON.period;
  for(const c of PAPER_CLOUDS)assert.ok(birdAverage>4*c.amplitude/c.period*1.7);
});
test('the entry camera frames the scenery only while the selected entry remains visible',()=>{
  const scale=1406/1800,height=672;
  assert.equal(IDIOM_PAPER_THEME.cameraTop({point:nodes[0],scale,height,zoom:1}),0);
  for(const y of [(height-50)/scale-1,(height-50)/scale+1,1780]){
    const top=IDIOM_PAPER_THEME.cameraTop({point:{x:700,y},scale,height,zoom:1});assert.ok(y*scale-top>=0&&y*scale-top<=height-45);
  }
  assert.ok(PAPER_TRAIL.some((p,i)=>i>0&&p[1]<PAPER_TRAIL[i-1][1]),'The route varies its vertical direction instead of forming equal table rows');
});
