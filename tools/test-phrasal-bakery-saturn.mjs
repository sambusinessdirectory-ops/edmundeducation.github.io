import test from 'node:test';
import assert from 'node:assert/strict';
import {saturnPose,turnY} from '../phrasal-verb-bakery-saturn.mjs';
test('sugar travels around a sphere, preserving latitude and radius through two left-right cycles',()=>{
 const first=saturnPose(0),last=saturnPose(24),visible=new Set();let min=0,max=0;
 for(let t=0;t<=24;t+=.25){const frame=saturnPose(t);min=Math.min(min,frame.yaw);max=Math.max(max,frame.yaw);
  frame.sugar.forEach((p,i)=>{assert.ok(Math.abs(Math.hypot(...p)-1)<1e-10);assert.equal(p[1],first.sugar[i][1]);});
  visible.add(frame.sugar.map((p,i)=>p[2]>0?i:'').join(','));
  assert.ok(frame.ringNormal[2]>.2,'The tilted ring remains visibly open, not an edge-on line');
 }
 assert.ok(min<-.69&&max>.69);assert.ok(visible.size>8,'Surface details really pass in and out of view');
 first.sugar.forEach((p,i)=>p.forEach((value,j)=>assert.ok(Math.abs(value-last.sugar[i][j])<1e-10)));
 assert.deepEqual(turnY([0,1,0],Math.PI/2),[0,1,0],'The vertical axis stays fixed');
});
