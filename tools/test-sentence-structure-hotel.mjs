import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {HOTEL_OFFSET,HOTEL_HEIGHT,HOTEL_SCALE,HOTEL_ROOMS,HOTEL_FLAGS,HOTEL_LIGHTS,HOTEL_PLANTS,HOTEL_TREES,hotelPositions,hotelArrivalIndex,hotelTrainPose,hotelFlagOffset,hotelLightLevel,hotelIsWalkable,hotelCompanionVisible} from '../sentence-structure-hotel-geometry.mjs';
import {sentenceMapLessons} from '../sentence-structure-map.mjs';
import {sentenceRealmPositions,SENTENCE_REALMS} from '../sentence-structure-realms.mjs';
const lessons=sentenceMapLessons(JSON.parse(readFileSync(new URL('../assets/sentence-structure/library/manifest.json',import.meta.url))).lessons),nodes=sentenceRealmPositions(lessons);
test('thirty real hotel lessons occupy exactly the twenty-one existing doors',()=>{
 assert.equal(lessons.length,180);assert.deepEqual(HOTEL_ROOMS.flatMap(r=>r.indices),Array.from({length:30},(_,i)=>150+i));
 assert.equal(HOTEL_ROOMS.length,21);assert.equal(HOTEL_ROOMS.filter(r=>r.indices.length===2).length,9);
 const p=hotelPositions(lessons.slice(150));assert.equal(p.length,30);assert.equal(p[0].id,'ss151');assert.equal(p.at(-1).id,'ss180');
 for(let i=150;i<180;i++){assert.equal(hotelArrivalIndex(nodes,nodes[i],i),i);assert.ok(hotelIsWalkable(nodes[i]));assert.ok(hotelCompanionVisible(nodes[i]));}
 assert.equal(hotelArrivalIndex(nodes,nodes[0],0),undefined);
});
test('hotel travel stays on corridors or in the concealed service passage',()=>{
 assert.equal(hotelIsWalkable({x:700*HOTEL_SCALE,y:HOTEL_OFFSET+200*HOTEL_SCALE}),false);
 assert.equal(hotelCompanionVisible({x:291*HOTEL_SCALE,y:HOTEL_OFFSET+500*HOTEL_SCALE}),false);
 assert.ok(HOTEL_HEIGHT>1200&&HOTEL_HEIGHT<1300);
 assert.ok(SENTENCE_REALMS.cameraSpaceHeight({scale:.44,height:672,point:nodes[150]})>=HOTEL_OFFSET*.44+672);
});
test('funicular travels uphill and both ends of the wrap are hidden',()=>{
 const first=hotelTrainPose(0),last=hotelTrainPose(22.999999);
 assert.ok(1402+first.dx<1266);assert.ok(1307+last.dx>1402);
 let p=first;for(let t=.05;t<23;t+=.05){const n=hotelTrainPose(t);assert.ok(n.dx>p.dx);assert.ok(n.dy<p.dy);assert.ok(Math.abs(n.dy/n.dx+.55)<1e-9);p=n;}
 assert.deepEqual(hotelTrainPose(0),hotelTrainPose(23));
});
test('flags remain attached while every light changes gently with staggered phases',()=>{
 assert.equal(HOTEL_FLAGS.length,2);assert.equal(HOTEL_PLANTS.length,14);assert.equal(HOTEL_TREES.length,18);assert.equal(HOTEL_LIGHTS.length,35);
 for(const f of HOTEL_FLAGS)for(let t=0;t<30;t+=.1){assert.equal(Math.abs(hotelFlagOffset(t,0,f.phase)),0);assert.ok(Math.abs(hotelFlagOffset(t,1,f.phase))<=3.1);}
 for(let i=0;i<HOTEL_LIGHTS.length;i++){const phase=((i*.61803398875)%1)*Math.PI*2,values=Array.from({length:300},(_,j)=>hotelLightLevel(j/10,phase));assert.ok(Math.max(...values)-Math.min(...values)>.3);for(let j=1;j<values.length;j++)assert.ok(Math.abs(values[j]-values[j-1])<.02);}
});
