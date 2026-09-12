import test from 'node:test';
import assert from 'node:assert/strict';
import {KOI,LOTUS,WATER_SHAPES,pointInside,artPoint,ZEN_OFFSET} from '../sentence-structure-zen-geometry.mjs';
import {koiRoute,koiMotion,lotusAngle,catMotion} from '../sentence-structure-zen-wildlife.mjs';
import {realmsSegment,realmsIsWalkable,realmsPath} from '../sentence-structure-realms-navigation.mjs';

test('all koi follow smooth closed routes inside their own pond without reflections',()=>{
 for(const fish of KOI){
  for(let t=0;t<fish.period;t+=.05){
   const p=koiRoute(t,fish),next=koiRoute(t+1/60,fish);
   assert.ok(pointInside(p,WATER_SHAPES[fish.pond]),JSON.stringify({fish,t,p}));
   assert.ok(Math.hypot(p.x-next.x,p.y-next.y)<.25);
   const turn=Math.atan2(Math.sin(next.heading-p.heading),Math.cos(next.heading-p.heading));
   assert.ok(Math.abs(turn)<.1,'No heading snap');
  }
  const start=koiRoute(0,fish),end=koiRoute(fish.period,fish);assert.ok(Math.hypot(start.x-end.x,start.y-end.y)<1e-8);
 }
});
test('all fish blink and bend, while the anchored sleeping cat has a smooth tail gesture',()=>{
 for(let n=0;n<KOI.length;n++){
  const frames=Array.from({length:1200},(_,i)=>koiMotion(i/60,n));
  assert.ok(frames.some(x=>x.blink>.95));assert.ok(frames.some(x=>x.bend>.95));assert.ok(frames.some(x=>x.bend<-.95));
  for(let i=1;i<frames.length;i++)for(const key of ['bend','blink','rock'])assert.ok(Math.abs(frames[i][key]-frames[i-1][key])<.3);
 }
 const cat=Array.from({length:1400},(_,i)=>catMotion(i/60));assert.ok(cat.some(x=>Math.abs(x.tail)>.12));
 for(let i=1;i<cat.length;i++)assert.ok(Math.abs(cat[i].tail-cat[i-1].tail)<.02);
});
test('lotus leaves finish complete turns in alternating directions while staying in the water',()=>{
 LOTUS.forEach(([x,y,,pond],i)=>{
  assert.ok(pointInside({x,y},WATER_SHAPES[pond]));
  const turn=lotusAngle(94+i*13,i)-lotusAngle(0,i);assert.ok(Math.abs(turn-(i%2?-1:1)*2*Math.PI)<1e-10);
 });
});
test('the new mist border permits travel and each garden pond rejects hoof destinations',()=>{
 for(const x of [160,365,800,1390])assert.ok(realmsSegment({x,y:3760},{x,y:4140}));
 for(const fish of [KOI[0],KOI[2],KOI[4]]){
  const p=artPoint([fish.x,fish.y]);p.y+=ZEN_OFFSET;assert.equal(realmsIsWalkable(p),false);assert.equal(realmsPath({x:160,y:4615},p),null);
 }
});
