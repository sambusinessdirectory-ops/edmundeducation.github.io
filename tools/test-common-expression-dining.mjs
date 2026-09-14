import assert from 'node:assert/strict';
import {diningPositions,diningTravel,DINING_TOP,diningTerrain} from '../common-expression-dining.mjs';
import {BUSINESS_AIRPORT} from '../common-expression-airport.mjs';
const nodes=diningPositions();
assert.deepEqual(nodes.map(p=>p.order),Array.from({length:30},(_,i)=>i+61));assert.equal(new Set(nodes.map(p=>`${p.x},${p.y}`)).size,30);
for(const p of nodes){assert.ok(p.x>=400&&p.x<=1330&&p.y>=DINING_TOP+610&&p.y<=DINING_TOP+1030);assert.deepEqual(BUSINESS_AIRPORT.navigation.path(nodes[0],p),[{x:p.x,y:p.y}]);}
assert.equal(diningTravel(0,1000),diningTravel(210,1000));assert.equal(diningTravel(105,1000),500);
assert.equal(BUSINESS_AIRPORT.overviewBounds(nodes[0]).key,'dining');assert.equal(BUSINESS_AIRPORT.height,3600);
assert.equal((diningTerrain().match(/data-dining-platform=/g)||[]).length,30);assert.ok(!diningTerrain().includes('data-map-level'));
console.log('Dining: reserved 61–90, table bounds, free movement and 210-second landscape loop passed.');
