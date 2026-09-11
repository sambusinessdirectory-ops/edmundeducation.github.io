import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';
import { levelPositions, mapPreferenceKey } from '../common-expression-map.mjs';
import { RHETORICAL_COAST as coast, COAST_BOUNDS, coastIsWalkable, coastPath, coastStep, coastPlantLayout, COAST_MASONRY, VILLAGE_POTS } from '../common-expression-coast.mjs';
const root=path.resolve(import.meta.dirname,'..'),window={};
for(const file of ['common-expression-system-data.js','common-expression-system-imported-data.js']) vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),{window});
const lessons=window.EDMUND_COMMON_EXPRESSION_DATA.systems['rhetorical-speaking'].lessons;
const nodes=levelPositions(lessons,coast.layout);

test('all 29 real Rhetorical Speaking lessons have reachable stones and readable space',()=>{
 assert.equal(nodes.length,29);
 for(const node of nodes) {
  assert.ok(coastIsWalkable(node));
  assert.ok(node.y+125<coast.height,'Captions fit below the last terrace');
  for(const target of nodes) {
   assert.ok(coastPath(node,target));
   for(let t=0;t<=1;t+=.05) assert.ok(coastIsWalkable({x:node.x+(target.x-node.x)*t,y:node.y+(target.y-node.y)*t}));
   if(node!==target) assert.ok(Math.hypot(node.x-target.x,node.y-target.y)>190);
  }
 }
});

test('the sea and village reject clicks and stop keyboard travel at the dry terrace',()=>{
 for(const target of [{x:1420,y:350},{x:100,y:170},{x:1550,y:800},{x:900,y:2000},{x:NaN,y:700}]) assert.equal(coastPath(nodes[0],target),null);
 for(const target of [{x:1420,y:350},{x:-100,y:-100},{x:1900,y:2400}]) assert.ok(coastIsWalkable(coastStep(nodes[0],target)));
 assert.equal(coastStep(nodes[0],{x:200,y:100}).y,COAST_BOUNDS.top);
 assert.equal(coastStep(nodes[0],{x:NaN,y:1}),nodes[0]);
});

test('foliage has varied, gentle timing and leaves room for stones and lesson captions',()=>{
 const plants=coastPlantLayout(nodes);
 assert.deepEqual([...new Set(plants.map(p=>p.kind))].sort(),['cypress','grass','lavender','olive','potted','shrub']);
 assert.ok(plants.length<100,'Keep mobile foliage layers bounded');
 assert.ok(new Set(plants.map(p=>p.delay)).size>25);
 assert.deepEqual(new Set(plants.map(p=>p.direction)),new Set(['normal','reverse']));
 for(const p of plants) {
  assert.ok(Math.max(Math.abs(p.a),Math.abs(p.b),Math.abs(p.c))<5.3);
  if(p.y<=500) continue;
  const extent=p.kind==='olive'?.52:p.kind==='cypress'?.3:.5;
  assert.ok(!nodes.some(n=>p.x+p.size*extent>n.x-109 && p.x-p.size*extent<n.x+109 && p.y>n.y-82 && p.y-p.size<n.y+125));
 }
});

test('the theme shares the companion lifecycle and gives every atlas crop an explicit clip',()=>{
 const scene=coast.mount({querySelector:()=>null,querySelectorAll:()=>[]});
 assert.doesNotThrow(()=>{scene.draw(100);scene.destroy();});
 const html=coast.terrain(nodes,lessons);
 const images=[...html.matchAll(/<image [^>]+>/g)].map(m=>m[0]);
 assert.ok(images.length>50);
 assert.ok(images.every(image=>image.includes('clip-path=')));
 const ids=[...html.matchAll(/<clipPath id="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size);
 assert.equal(coast.cameraTop({point:nodes[0],scale:.87875,height:672,zoom:1}),0);
 assert.ok(coast.cameraTop({point:nodes[0],scale:.7,height:464,zoom:1})>0);
 for(const theme of ['speaking','written']) assert.notEqual(mapPreferenceKey(theme,'student-a'),mapPreferenceKey('rhetorical-speaking','student-a'));
});


test('pots are confined to house entrances and wild planting avoids the painted masonry',()=>{
 const plants=coastPlantLayout(nodes),pots=plants.filter(p=>p.kind==='potted');
 assert.equal(pots.length,3);
 for(const p of pots) {assert.equal(p.bed,'house-entrance');assert.ok(p.x<800&&p.y<500);assert.ok(VILLAGE_POTS.some(([x,y])=>p.x===x&&p.y===y));}
 const wild=plants.filter(p=>p.y>500);
 for(const p of wild) {
  assert.ok(p.bed.startsWith('terrace-bed-'),'Wild plants belong to small irregular beds');
  assert.ok(!COAST_MASONRY.some(([l,t,r,b])=>p.x>l&&p.x<r&&p.y>t&&p.y<b),'Plant roots cannot sit on a wall or rock');
 }
 const beds=new Map();for(const p of wild)beds.set(p.bed,(beds.get(p.bed)||0)+1);
 assert.ok([...beds.values()].every(count=>count>=2),'No lone shrub dots distributed across the meadow');
});
