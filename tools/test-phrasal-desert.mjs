import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {desertPositions,desertHeight,desertTrail,desertWalkable,desertSegment,createDesertNavigation,tumbleweedMotion} from '../phrasal-verb-desert-geometry.mjs';
import {phrasalMapLessons,phrasalMapCompleted,desertPlants,createDesertTheme} from '../phrasal-verb-desert.mjs';
const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../phrasal-verb-system-data.js',import.meta.url),'utf8'),context);
const catalogue=context.window.EDMUND_PHRASAL_VERB_SYSTEM_DATA.lessons,lessons=phrasalMapLessons(catalogue),nodes=desertPositions(lessons),height=desertHeight(lessons.length),navigation=createDesertNavigation(nodes,height);
test('the desert represents the complete current catalogue without changing identities or questions',()=>{
 assert.equal(lessons.length,329);assert.equal(nodes.length,lessons.length);
 assert.equal(lessons[0].id,'phrasal-verb-01');assert.equal(lessons.at(-1).id,'phrasal-verb-329');
 lessons.forEach((l,i)=>{assert.equal(l.id,catalogue[i].id);assert.equal(l.questions,catalogue[i].questions);assert.equal(l.titleEn,catalogue[i].titleEn);});
});
test('both ponds are obstacles and the full sandy trail stays dry',()=>{
 assert.equal(desertWalkable({x:1100,y:250},height),false);
 assert.equal(desertWalkable({x:800,y:465},height),false);
 assert.equal(desertWalkable({x:200,y:470},height),true);
 assert.equal(desertWalkable({x:1500,y:480},height),true);
 const trail=desertTrail(nodes).points;
 trail.forEach((p,i)=>{assert.ok(desertWalkable(p,height),`Dry trail point ${i}`);if(i)assert.ok(desertSegment(trail[i-1],p,height));});
});
test('all 108241 ordered lesson routes arrive at the requested real stop',()=>{
 let pairs=0;
 for(const from of nodes)for(const to of nodes){const route=navigation.path(from,to);assert.ok(route?.length);assert.equal(route.at(-1).x,to.x);assert.equal(route.at(-1).y,to.y);pairs++;}
 assert.equal(pairs,329*329);
});
test('keyboard movement cannot enter water and a free walker can rejoin the trail',()=>{
 const from={x:800,y:535};assert.deepEqual(navigation.step(from,{x:800,y:485}),from);
 for(const p of [{x:200,y:470},{x:1490,y:480},{x:750,y:565},{x:300,y:6000}]){
  const route=navigation.path(p,nodes[0]);assert.ok(route?.length);
  assert.ok(desertSegment(p,route[0],height));
 }
 assert.equal(navigation.path({x:800,y:460},nodes[0]),null);
});
test('tumbleweeds move in opposed directions and rotation follows travel distance',()=>{
 const a=tumbleweedMotion(0,0),b=tumbleweedMotion(1,0),c=tumbleweedMotion(0,1),d=tumbleweedMotion(1,1);
 assert.ok(b.x>a.x);assert.ok(d.x<c.x);
 for(let i=0;i<2;i++){
  const start=tumbleweedMotion(0,i),next=tumbleweedMotion(1,i);
  assert.ok(Math.abs((next.angle-start.angle)*start.radius-(next.x-start.x))<1e-9);
  for(let t=0;t<start.period*2;t+=.3){const p=tumbleweedMotion(t,i);assert.ok(p.y>=547&&p.y<=567);assert.ok(p.radius<=20);}
  const pre=tumbleweedMotion(start.period-(i?18:20)-.001,i),post=tumbleweedMotion(start.period-(i?18:20)+.001,i);
  assert.ok(pre.x<0||pre.x>1600);assert.ok(post.x<0||post.x>1600,'Wrapping occurs outside the core view');
 }
});
test('completion follows the host completed-attempt rule and the true question counts',()=>{
 const l=lessons[0];assert.equal(l.questions.length,70);
 assert.equal(phrasalMapCompleted([],l),0);
 assert.equal(phrasalMapCompleted([{lessonId:l.id,status:'in_progress',correctCount:70}],l),69);
 assert.equal(phrasalMapCompleted([{lessonId:l.id,status:'completed',correctCount:70}],l),70);
 assert.equal(phrasalMapCompleted([{lessonId:l.id,status:'completed',correctCount:300}],l),70);
 assert.equal(phrasalMapCompleted([{lessonId:'other',status:'completed',correctCount:70}],l),0);
});
test('all vegetation has an independent calm anchored sway and stays clear of platform captions',()=>{
 const plants=desertPlants(nodes,height);assert.ok(plants.length>100);
 const kindSet=new Set(plants.map(p=>p.kind));for(const k of ['palm','shortPalm','cactus','shrub','reeds'])assert.ok(kindSet.has(k));
 for(const p of plants){assert.ok(p.period>=5);assert.ok(p.amplitude>=1.5&&p.amplitude<=4.2);}
 // The actual first two routes contain the ponds and focal plants.
 // Captions extend below their anchor; later beds must fit between route rows.
 for(const p of plants.filter(p=>p.y>900))for(const n of nodes){
  const sway=Math.tan(p.amplitude*Math.PI/180)*p.height;
  const intersects=p.x-p.width/2-sway<n.x+96&&p.x+p.width/2+sway>n.x-96&&p.y>n.y-44&&p.y-p.height<n.y+66;
  assert.equal(intersects,false,`${p.kind} at ${p.x},${p.y} clears ${n.id}`);
 }
});
test('the opening camera keeps the first lesson usable and centers lower lessons',()=>{
 const theme=createDesertTheme(lessons);
 assert.equal(theme.cameraTop({point:nodes[0],scale:.87875,height:672,zoom:1}),0);
 assert.ok(theme.cameraTop({point:nodes[14],scale:.87875,height:672,zoom:1})>0);
 const mobile=theme.cameraTop({point:nodes[0],scale:.7,height:320,zoom:1});assert.ok(nodes[0].y*.7-mobile<275);
});
