import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sentenceMapLessons} from '../sentence-structure-map.mjs';
import {levelPositions,restoreMapPreferences} from '../common-expression-map.mjs';
import {SHORE_LAYOUT} from '../sentence-structure-coast.mjs';
import {sentenceRealmPositions,SENTENCE_REALMS} from '../sentence-structure-realms.mjs';
import {realmsPath,realmsSegment,realmsStep,realmsIsWalkable} from '../sentence-structure-realms-navigation.mjs';
import {rabbitMotion} from '../sentence-structure-autumn-rabbit.mjs';
const catalogue=JSON.parse(readFileSync(new URL('../assets/sentence-structure/library/manifest.json',import.meta.url))).lessons;
const lessons=sentenceMapLessons(catalogue),nodes=sentenceRealmPositions(lessons);
test('ninety real levels preserve coastal coordinates, labels and single-pin storage',()=>{
 assert.equal(lessons.length,90);assert.equal(catalogue.slice(90).length,255);assert.equal(lessons.at(-1).id,'ss90');
 assert.ok(lessons.every(l=>l.titleEn&&l.mapLabel));
 assert.deepEqual(nodes.slice(0,30),levelPositions(lessons.slice(0,30),SHORE_LAYOUT));
 assert.equal(restoreMapPreferences({pinned:'ss30',character:'elsie'},null,lessons.map(l=>l.id)).pinned,'ss30');
 assert.equal(restoreMapPreferences({pinned:'ss60'},null,lessons.map(l=>l.id)).pinned,'ss60');
 assert.equal(restoreMapPreferences({pinned:'ss91'},null,lessons.map(l=>l.id)).pinned,null);
});
test('all 8100 ordered routes stay on dry land or a real bridge',()=>{
 for(const a of nodes)for(const b of nodes){const route=realmsPath(a,b);assert.ok(route,`${a.id} to ${b.id}`);let prev=a;for(const p of route){assert.ok(realmsSegment(prev,p));prev=p;}assert.deepEqual({x:prev.x,y:prev.y},{x:b.x,y:b.y});}
});
test('mist border is penetrable while both rivers still block clicks and keyboard travel',()=>{
 for(const x of [160,365,800,1390])assert.ok(realmsSegment({x,y:1780},{x,y:2150}));
 for(const p of [{x:550,y:930},{x:550,y:2750},{x:780,y:2310}]){assert.equal(realmsIsWalkable(p),false);assert.equal(realmsPath(nodes[0],p),null);}
 const a={x:550,y:2600};assert.deepEqual(realmsStep(a,{x:550,y:2800}),a);
 assert.ok(realmsSegment({x:159,y:2565},{x:159,y:2927}));assert.ok(realmsSegment({x:1050,y:2565},{x:1050,y:2935}));
});
test('rabbit ears and eyelids move continuously around a fixed resting body',()=>{
 const frames=Array.from({length:1500},(_,i)=>rabbitMotion(i/60));
 assert.ok(rabbitMotion(1.67).blink>.99);assert.ok(frames.some(f=>Math.abs(f.left)>.07));assert.ok(frames.some(f=>Math.abs(f.right)>.07));
 for(let i=1;i<frames.length;i++)for(const k of ['left','right','rock','blink'])assert.ok(Math.abs(frames[i][k]-frames[i-1][k])<.3,k+' has no pose jump');
});
test('all three realms retain full painted overview coverage',()=>{
 assert.equal(SENTENCE_REALMS.width,1600);assert.equal(SENTENCE_REALMS.height,6150);assert.equal(SENTENCE_REALMS.minimumZoom,.5);assert.deepEqual(SENTENCE_REALMS.cameraPadding,{left:800,right:800});
 assert.equal(realmsIsWalkable({x:-300,y:2500}),false);assert.ok(realmsIsWalkable(nodes.at(-1)));
});
