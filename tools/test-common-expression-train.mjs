import assert from 'node:assert/strict';
import {trainPositions,trainTravel,TRAIN_TOP} from '../common-expression-train.mjs';
import {BUSINESS_AIRPORT} from '../common-expression-airport.mjs';
const nodes=trainPositions();
assert.equal(nodes.length,30);
assert.deepEqual(nodes.map(p=>p.order),Array.from({length:30},(_,i)=>i+31));
assert.equal(new Set(nodes.map(p=>`${p.x},${p.y}`)).size,30);
for(const p of nodes){assert.ok(p.x>=210&&p.x<=1330&&p.y>=TRAIN_TOP+560&&p.y<=TRAIN_TOP+1100);assert.deepEqual(BUSINESS_AIRPORT.navigation.path(nodes[0],p),[{x:p.x,y:p.y}]);}
assert.equal(trainTravel(0,1000),trainTravel(180,1000));
assert.ok(trainTravel(90,1000)>trainTravel(45,1000));
assert.equal(trainTravel(90,1000),500);
assert.equal(BUSINESS_AIRPORT.overviewBounds(nodes[0]).key,'train');
assert.equal(BUSINESS_AIRPORT.overviewBounds({x:800,y:500}).key,'airport');
console.log('Train: 30 unique reserved platforms, floor bounds, free movement, 180-second scenery loop and realm overview passed.');
