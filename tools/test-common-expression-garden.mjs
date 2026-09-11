import test from 'node:test';
import assert from 'node:assert/strict';
import {gardenIsDry,gardenPath,gardenSegmentIsDry,gardenStep} from '../common-expression-garden-navigation.mjs';
import {duckPose} from '../common-expression-garden-ducks.mjs';
import {levelPositions} from '../common-expression-map.mjs';
import {WRITTEN_GARDEN} from '../common-expression-garden.mjs';

test('every Writing stone stays outside the pond, with all lesson pairs reachable over dry land',()=>{
 const writing=levelPositions(Array.from({length:30},(_,i)=>({id:String(i)})),WRITTEN_GARDEN.layout);
 for(const a of writing) {
  assert.ok(gardenIsDry(a));
  for(const b of writing) {const path=gardenPath(a,b);assert.ok(path);for(const [i,p] of path.entries())assert.ok(gardenSegmentIsDry(i?path[i-1]:a,p));}
 }
});

test('pond clicks are rejected and cross-pond land journeys go around the shoreline',()=>{
 const from={x:1050,y:1880}, destination={x:1540,y:1450};
 assert.equal(gardenIsDry({x:1420,y:1750}),false);
 assert.equal(gardenPath(from,{x:1420,y:1750}),null);
 assert.equal(gardenSegmentIsDry(from,destination),false);
 const path=gardenPath(from,destination);
 assert.ok(path.length>1);
 assert.deepEqual(path.at(-1),destination);
 path.forEach((p,i)=>assert.ok(gardenSegmentIsDry(i?path[i-1]:from,p)));
});

test('continuous keyboard movement stops at the bank instead of crossing it',()=>{
 let p={x:950,y:1750};
 for(let i=0;i<100;i++) {const next=gardenStep(p,{x:p.x+12,y:p.y});assert.ok(gardenIsDry(next));p=next;}
 assert.ok(p.x<1160);
});

test('ducks use the eight drawn views through continuous turns and have intermittent blink frames',()=>{
 const angles=new Set();let blinks=0,previous=duckPose(0);
 for(let t=20;t<42000;t+=20) {
  const pose=duckPose(t);angles.add(pose.first);blinks+=Number(pose.closed);
  assert.ok(Math.abs(((pose.angle-previous.angle+540)%360)-180)<2,'No instantaneous mirrored reversal');
  assert.ok(pose.mix>=0 && pose.mix<1); previous=pose;
 }
 assert.equal(angles.size,8);assert.ok(blinks>0);
 assert.deepEqual(duckPose(0,2,true),duckPose(15000,2,true),'Reduced motion freezes decorative swimming');
});
