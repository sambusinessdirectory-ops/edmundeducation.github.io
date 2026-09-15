import assert from 'node:assert/strict';
import {pokerPositions,liquidTilt,POKER_TOP,POKER_COLORS,pokerTerrain} from '../common-expression-poker.mjs';
import {BUSINESS_AIRPORT} from '../common-expression-airport.mjs';
const nodes=pokerPositions();assert.deepEqual(nodes.map(p=>p.order),Array.from({length:30},(_,i)=>i+91));assert.equal(new Set(nodes.map(p=>`${p.x},${p.y}`)).size,30);
assert.equal(nodes.filter(p=>p.kind==='plaque').length,5);assert.deepEqual(new Set(nodes.filter(p=>p.kind==='chip').map(p=>p.color)),new Set(POKER_COLORS));
for(const p of nodes){assert.ok(p.x>=355&&p.x<=1260&&p.y>=POKER_TOP+490&&p.y<=POKER_TOP+950);assert.deepEqual(BUSINESS_AIRPORT.navigation.path(nodes[0],p),[{x:p.x,y:p.y}]);}
const tilts=Array.from({length:1000},(_,i)=>liquidTilt(i/20));assert.ok(tilts.some(v=>v>2)&&tilts.some(v=>v<-2));assert.ok(tilts.every(v=>Math.abs(v)<3.36));assert.equal(BUSINESS_AIRPORT.overviewBounds(nodes[0]).key,'poker');assert.ok(!pokerTerrain().includes('data-map-level'));
console.log('Poker 91–120: five chip colors, plaques, navigation, reserved content and bounded fluid tilt passed.');
const {liquidSurface}=await import('../common-expression-poker.mjs');
for(const type of ['martini','whiskey']){
 const baseline=liquidSurface(type,0);
 for(let t=0;t<20;t+=.1){const s=liquidSurface(type,t);assert.equal(s.cx,baseline.cx);assert.equal(s.cy,baseline.cy);assert.ok(s.rx/s.ry>4);assert.ok(s.bottom>s.cy+s.ry);assert.ok(Math.abs(s.tilt)<1.62);}
}
