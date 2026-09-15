import assert from 'node:assert/strict';
import {LOUNGE_TOP,loungePositions,loungeTerrain,loungeMotion} from '../common-expression-lounge.mjs';
import {BUSINESS_AIRPORT} from '../common-expression-airport.mjs';
import {poolTerrain} from '../common-expression-pool.mjs';
const nodes=loungePositions();assert.deepEqual(nodes.map(p=>p.order),Array.from({length:30},(_,i)=>151+i));assert.equal(new Set(nodes.map(p=>`${p.x},${p.y}`)).size,30);assert.equal(BUSINESS_AIRPORT.height,7200);assert.equal(BUSINESS_AIRPORT.overviewBounds(nodes[0]).key,'lounge');
for(const p of nodes){assert.deepEqual(BUSINESS_AIRPORT.navigation.path(nodes[0],p),[{x:p.x,y:p.y}]);assert.ok(p.y>LOUNGE_TOP+400&&p.y<LOUNGE_TOP+1080);}
assert.equal((loungeTerrain().match(/data-lounge-platform=/g)||[]).length,30);assert.ok(!loungeTerrain().includes('data-map-level'));assert.ok(!poolTerrain().includes('pool-route'));
for(let t=0;t<27;t+=.1){const m=loungeMotion(t);assert.ok(Math.abs(m.bassAngle)<=.018);assert.ok(m.stringAmplitude>=0&&m.stringAmplitude<=1.35);assert.ok(Math.abs(m.stringAmplitude-loungeMotion(t+9).stringAmplitude)<1e-10);if(t%9>3.6)assert.equal(m.stringAmplitude,0);}
assert.ok(loungeMotion(1.8).stringAmplitude>1);assert.equal(loungeMotion(5).stringAmplitude,0);
console.log('Speakeasy 151–180: numbering, reserved navigation, bass bounds, looping string phrases and removal of pool path passed.');
