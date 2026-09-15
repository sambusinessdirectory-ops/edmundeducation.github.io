import assert from 'node:assert/strict';
import {blackSandPositions,starfishMotion,PROVERB_BLACK_SAND} from '../proverb-black-sand.mjs';
const nodes=blackSandPositions();assert.deepEqual(nodes.map(p=>p.order),Array.from({length:30},(_,i)=>i+1));assert.equal(new Set(nodes.map(p=>`${p.x},${p.y}`)).size,30);
const lessons=[{id:'p1'},{id:'p2'},{id:'p3'}];assert.equal(PROVERB_BLACK_SAND.positions(lessons).length,3);assert.equal((PROVERB_BLACK_SAND.terrain(nodes.slice(0,3),lessons).match(/data-black-reserved=/g)||[]).length,27);
for(const p of nodes)assert.deepEqual(PROVERB_BLACK_SAND.navigation.path(nodes[0],p),[{x:p.x,y:p.y}]);
for(let i=0;i<2;i++)for(let t=0;t<100;t+=.2){const a=starfishMotion(t,i),b=starfishMotion(t+.02,i);assert.ok(Math.abs(a.x)<=7&&Math.abs(a.y)<=4&&Math.abs(a.angle)<=.13);assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<.04);}
console.log('Black-sand Proverb coast: 3 real lessons, 27 reservations, dry navigation and bounded gentle starfish drift passed.');
