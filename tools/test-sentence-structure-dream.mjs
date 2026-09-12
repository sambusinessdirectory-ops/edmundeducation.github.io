import test from 'node:test';
import assert from 'node:assert/strict';
import {DREAM_RAIL,DREAM_OFFSET,DREAM_HEIGHT,DREAM_TRAIL,dreamPositions,dreamTrailPath} from '../sentence-structure-dream-geometry.mjs';
import {trainPose,dreamBreath,flagShape} from '../sentence-structure-dream-motion.mjs';
import {SENTENCE_REALMS} from '../sentence-structure-realms.mjs';
import {realmsSegment} from '../sentence-structure-realms-navigation.mjs';
import {minimumMapScale} from '../common-expression-map.mjs';

test('all train cars follow one closed track continuously, including the loop boundary',()=>{
 for(let car=0;car<3;car++)for(let t=0;t<145;t+=.03){
  const p=trainPose(t,car),q=trainPose(t+.016,car);
  assert.ok(Math.abs(((p.x-DREAM_RAIL.x)/DREAM_RAIL.rx)**2+((p.y-DREAM_RAIL.y)/DREAM_RAIL.ry)**2-1)<1e-10);
  assert.ok(Math.hypot(q.x-p.x,q.y-p.y)<.62);assert.ok(Math.abs(q.angle-p.angle)<.01);
 }
 for(let i=0;i<3;i++){const a=trainPose(0,i),b=trainPose(DREAM_RAIL.period,i);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<1e-8);}
});
test('bear breathing and four flags are gentle and continuous',()=>{
 let last=dreamBreath(0);for(let t=0;t<12;t+=1/60){const b=dreamBreath(t);assert.ok(Math.abs(b)<=.013);assert.ok(Math.abs(b-last)<.001);last=b;}
 for(let i=0;i<4;i++)assert.notEqual(flagShape(0,i,28,16),flagShape(3,i,28,16));
});
test('the dream has exactly thirty real positions and a freely walkable cloud border',()=>{
 const points=dreamPositions(Array.from({length:30},(_,i)=>({id:'ss'+(i+91)})));
 assert.equal(points.length,30);assert.equal(points[0].id,'ss91');assert.equal(points.at(-1).id,'ss120');
 for(const p of points)assert.ok(p.x>=60&&p.x<=1540&&p.y>DREAM_OFFSET&&p.y<7000-65);
 for(const x of [160,365,800,1390])assert.ok(realmsSegment({x,y:5100},{x,y:5420}));
});
test('normal dream and garden framing preserve original label size',()=>{
 for(const y of [6300]){const p={x:800,y},w=SENTENCE_REALMS.cameraViewWidth(p),floor=SENTENCE_REALMS.cameraScaleFloor(p);assert.equal(w,1600);assert.equal(minimumMapScale(1408,672,w,7000,floor),.88);}
 assert.equal(SENTENCE_REALMS.cameraViewWidth({x:800,y:4260}),1600);
 assert.equal(minimumMapScale(1408,672,1600,7000,.7),.88);
 assert.equal(SENTENCE_REALMS.cameraViewWidth({x:800,y:2600}),1600);
 assert.equal(SENTENCE_REALMS.cameraScaleFloor({x:800,y:2600}),.7);
});

test('the winding trail has separated readable stops and no repeated row grid',()=>{
 assert.equal(new Set(DREAM_TRAIL.map(p=>p[1])).size,30);
 assert.equal(dreamTrailPath().match(/C/g).length,29);
 for(let i=0;i<30;i++)for(let j=i+1;j<30;j++){const a=DREAM_TRAIL[i],b=DREAM_TRAIL[j];assert.ok(Math.abs(a[0]-b[0])>=185||Math.abs(a[1]-b[1])>=155,`Stop ${91+i} and ${91+j} need room for labels`);}
 assert.equal(SENTENCE_REALMS.height,DREAM_OFFSET+DREAM_HEIGHT);
});
