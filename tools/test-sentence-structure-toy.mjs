import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TOY_OFFSET,TOY_HEIGHT,TOY_TRAIL,TOY_MARBLES,TOY_PLANES,toyPositions,toyTrailPath} from '../sentence-structure-toy-geometry.mjs';
import {dogMotion,marbleMotion,planeMotion} from '../sentence-structure-toy-motion.mjs';
import {sentenceMapLessons,SENTENCE_MAP_LIMIT} from '../sentence-structure-map.mjs';
import {SENTENCE_REALMS} from '../sentence-structure-realms.mjs';
import {realmsSegment} from '../sentence-structure-realms-navigation.mjs';
const catalog=JSON.parse(readFileSync(new URL('../assets/sentence-structure/library/manifest.json',import.meta.url))).lessons;
test('the toy realm maps exactly the next thirty real lessons and retains readable labels',()=>{
 const lessons=sentenceMapLessons(catalog);assert.equal(SENTENCE_MAP_LIMIT,150);assert.equal(lessons.length,150);assert.ok(lessons.every(l=>l.mapLabel&&l.titleEn));assert.equal(catalog.length-lessons.length,195);
 const points=toyPositions(lessons.slice(120));assert.equal(points[0].id,'ss121');assert.equal(points.at(-1).id,'ss150');assert.equal(points.length,30);
 for(const p of points)assert.ok(p.x>=60&&p.x<=1540&&p.y>TOY_OFFSET&&p.y<TOY_OFFSET+TOY_HEIGHT-65);
 assert.equal(SENTENCE_REALMS.title,'');assert.equal(SENTENCE_REALMS.cameraViewWidth(points[0]),1600);assert.equal(SENTENCE_REALMS.height,8850);
});
test('marbles roll smoothly without slipping and reverse independently',()=>{
 let opposed=0;for(let t=0;t<30;t+=1/60){const v=TOY_MARBLES.map(m=>{const a=marbleMotion(t,m),b=marbleMotion(t+1/60,m);assert.ok(Math.abs(a.x-m.x)<=m.amplitude+.001);assert.ok(Math.abs((b.x-a.x)+(b.roll-a.roll)*m.r)<1e-9);assert.ok(Math.abs(b.x-a.x)<.3);return b.x-a.x;});if(v.some(x=>x>0)&&v.some(x=>x<0))opposed++;}assert.ok(opposed>1700);
});
test('each plane has articulated wings and the dog has separated continuous gestures',()=>{
 const frames=Array.from({length:1500},(_,i)=>dogMotion(i/60));assert.ok(frames.some(f=>f.blink>.99));assert.ok(Math.max(...frames.map(f=>f.tilt))>.06);assert.ok(Math.min(...frames.map(f=>f.tilt))<-.06);
 for(let i=1;i<frames.length;i++){assert.ok(frames[i].key>frames[i-1].key);assert.ok(Math.abs(frames[i].tilt-frames[i-1].tilt)<.004);}assert.ok(Math.abs(dogMotion(10).key-Math.PI*2)<1e-9);
 for(const p of TOY_PLANES){const a=planeMotion(0,p),b=planeMotion(2,p);assert.notDeepEqual(a,b);assert.ok(Math.abs(a.left)<=.17&&Math.abs(a.right)<=.15);}
});
test('the winding toy trail keeps readable stops separate and the cloud border is open',()=>{
 assert.equal(toyTrailPath().match(/C/g).length,29);
 for(let i=0;i<30;i++)for(let j=i+1;j<30;j++){const a=TOY_TRAIL[i],b=TOY_TRAIL[j];assert.ok(Math.abs(a[0]-b[0])>=185||Math.abs(a[1]-b[1])>=165,`Stops ${i+121}/${j+121}`);}
 for(const x of [160,470,800,1400])assert.ok(realmsSegment({x,y:6950},{x,y:7200}));
});

test('normal framing keeps every selected toy stop and its lesson entry visible',()=>{
 assert.equal(SENTENCE_REALMS.cameraTop({point:{x:130,y:TOY_OFFSET+775},scale:.879,height:676,zoom:1}),(TOY_OFFSET+100)*.879);
 for(const [scale,height] of [[.879,672],[.8,600],[1,900]])for(const [x,y] of TOY_TRAIL){
  const point={x,y:y+TOY_OFFSET},top=SENTENCE_REALMS.cameraTop({point,scale,height,zoom:1}),screenY=point.y*scale-top;
  assert.ok(screenY>=0&&screenY<=height-45,`Toy stop at ${x},${y} remains reachable at ${scale}/${height}`);
 }
});
