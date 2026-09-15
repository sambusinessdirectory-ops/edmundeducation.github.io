import test from 'node:test';
import assert from 'node:assert/strict';
import {closetRoute} from '../closet-walking.mjs';
const bounds={minX:-5,maxX:5,minZ:-5,maxZ:5};
test('floor route is direct in open space and rejects blocked/outside taps',()=>{
 assert.deepEqual(closetRoute({x:0,z:0},{x:2,z:2},bounds,[]),[{x:2,z:2}]);
 assert.deepEqual(closetRoute({x:0,z:0},{x:8,z:2},bounds,[]),[]);
 assert.deepEqual(closetRoute({x:-3,z:0},{x:0,z:0},bounds,[{minX:-1,maxX:1,minZ:-1,maxZ:1}]),[]);
});
test('route walks around furniture without cutting a corner',()=>{
 const obstacles=[{minX:-1,maxX:1,minZ:-1,maxZ:1}];let previous={x:-3,z:0};
 const route=closetRoute(previous,{x:3,z:0},bounds,obstacles);assert.ok(route.length>1);
 for(const p of route){for(let t=0;t<=1;t+=.01){const x=previous.x+(p.x-previous.x)*t,z=previous.z+(p.z-previous.z)*t;assert.ok(!(x>-.99&&x<.99&&z>-.99&&z<.99));}previous=p;}
 assert.deepEqual(route.at(-1),{x:3,z:0});
});
