import assert from 'node:assert/strict';
import {POOL_TOP,poolPositions,poolTerrain,POOL_DECORATIONS,decorativeBallPosition} from '../common-expression-pool.mjs';
import {BUSINESS_AIRPORT} from '../common-expression-airport.mjs';
const nodes=poolPositions();assert.deepEqual(nodes.map(p=>p.order),Array.from({length:30},(_,i)=>121+i));assert.equal(new Set(nodes.map(p=>`${p.x},${p.y}`)).size,30);assert.equal(nodes.filter(p=>p.striped).length,14);
assert.equal(BUSINESS_AIRPORT.height,7200);assert.equal(BUSINESS_AIRPORT.overviewBounds(nodes[0]).key,'pool');
for(const p of nodes){assert.deepEqual(BUSINESS_AIRPORT.navigation.path(nodes[0],p),[{x:p.x,y:p.y}]);assert.ok(p.y<POOL_TOP+900);}
assert.ok(!poolTerrain().includes('data-map-level'));assert.equal((poolTerrain().match(/data-pool-platform=/g)||[]).length,30);
POOL_DECORATIONS.forEach((ball,i)=>{let moved=false;for(let t=0;t<60;t+=.25){const p=decorativeBallPosition(ball,i,t),q=decorativeBallPosition(ball,i,t+.25);assert.ok(Math.abs(p.x-ball.x)<=9&&Math.abs(p.y-ball.y)<=5);assert.ok(Math.hypot(p.x-q.x,p.y-q.y)<.6);moved ||= Math.abs(p.x-q.x)>.1;for(const node of nodes)assert.ok(Math.hypot(p.x-node.x,p.y-(node.y-POOL_TOP))>ball.r+50);}assert.ok(moved);});
console.log('Pool 121–150: reserved platforms, solid/striped balls, navigation, gentle bounded motion and no platform collisions passed.');
