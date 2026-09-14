import assert from 'node:assert/strict';
import {airportPositions,airportFlight,departureText,DEPARTURES,BUSINESS_AIRPORT} from '../common-expression-airport.mjs';
const nodes=airportPositions(Array.from({length:30},(_,i)=>({id:String(i)})));
assert.equal(new Set(nodes.map(p=>`${p.x},${p.y}`)).size,30);
for(const p of nodes){assert.ok(p.x>=400&&p.x<=1200&&p.y>=470&&p.y<=1070);assert.deepEqual(BUSINESS_AIRPORT.navigation.path(nodes[0],p),[{x:p.x,y:p.y}]);}
for(const second of [false,true]){
 const frames=Array.from({length:1220},(_,i)=>airportFlight(i/10,second));
 assert.ok(frames.some(p=>p.stage==='landing'));assert.ok(frames.some(p=>p.stage==='rolling'));assert.ok(frames.some(p=>p.stage==='takeoff'));
 assert.ok(frames.filter(p=>p.stage==='rolling').every(p=>p.y===p.ground&&p.angle===0));
 const period=second?61:48;assert.deepEqual(airportFlight(0,second),airportFlight(period,second));
}
for(let row=0;row<4;row++){const frames=Array.from({length:1000},(_,i)=>departureText(i/100,row));assert.ok(frames.includes(''));assert.ok(frames.includes(DEPARTURES[row]));assert.ok(frames.some(x=>x.length>0&&x.length<DEPARTURES[row].length));}
console.log('Airport: 30 grounded platforms, both complete flight loops, wheel contact and four typing loops passed.');
