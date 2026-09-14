import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {journeyPositions as originalSixty} from '../phrasal-verb-night-geometry.mjs';
import {desertWalkable,desertSegment} from '../phrasal-verb-desert-geometry.mjs';
import {BAKERY_OFFSET,BAKERY_HEIGHT,BAKERY_OBJECTS,bakeryTrail,chocolateSteam} from '../phrasal-verb-bakery-geometry.mjs';
import {PHRASAL_MAP_LIMIT,JOURNEY_HEIGHT,JOURNEY_WATER,phrasalJourneyLessons,journeyPositions,journeyOverview,createJourneyNavigation} from '../phrasal-verb-journey-geometry.mjs';
const context={window:{}};vm.runInNewContext(fs.readFileSync(new URL('../phrasal-verb-system-data.js',import.meta.url),'utf8'),context);
const catalogue=context.window.EDMUND_PHRASAL_VERB_SYSTEM_DATA.lessons,lessons=phrasalJourneyLessons(catalogue),nodes=journeyPositions(lessons),navigation=createJourneyNavigation(nodes);
test('the bakery adds only the next thirty real lessons and preserves both approved layouts',()=>{
 assert.equal(PHRASAL_MAP_LIMIT,90);assert.equal(lessons.length,90);assert.equal(nodes.length,90);assert.equal(catalogue.length,329);
 assert.deepEqual(nodes.slice(0,60),originalSixty(lessons.slice(0,60)));
 lessons.forEach((l,i)=>{assert.equal(l.id,catalogue[i].id);assert.equal(l.questions,catalogue[i].questions);assert.equal(l.titleEn,catalogue[i].titleEn);});
 assert.equal(nodes[60].id,'phrasal-verb-61');assert.equal(nodes.at(-1).id,'phrasal-verb-90');
});
test('all 8100 ordered lesson routes remain dry and arrive at their true destination',()=>{
 for(const from of nodes)for(const to of nodes){const path=navigation.path(from,to);assert.ok(path?.length,`${from.id} to ${to.id}`);assert.deepEqual(path.at(-1),to);let previous=from;for(const p of path){assert.ok(desertSegment(previous,p,JOURNEY_HEIGHT,JOURNEY_WATER));previous=p;}}
});
test('bakery ground allows free travel and the existing four ponds still reject destinations',()=>{
 for(const y of [650,900,1460]){const a={x:210,y:BAKERY_OFFSET+y},b={x:1350,y:BAKERY_OFFSET+y};assert.deepEqual(navigation.path(a,b),[b]);}
 for(const p of [{x:1100,y:250},{x:800,y:465},{x:800,y:1080},{x:365,y:2085}]){assert.equal(desertWalkable(p,JOURNEY_HEIGHT,JOURNEY_WATER),false);assert.equal(navigation.path(nodes[60],p),null);}
});
test('icing trail stays inside the painting and passes below the mug and around the foreground cupcake',()=>{
 const local=nodes.slice(60).map(p=>({...p,y:p.y-BAKERY_OFFSET})),trail=bakeryTrail(local);
 for(const p of trail.points){assert.ok(p.x>=40&&p.x<=1560&&p.y>450&&p.y<BAKERY_HEIGHT-75);assert.ok(!(p.x>1233&&p.x<1408&&p.y>1000&&p.y<1162),'Trail does not cross the mug');assert.ok(!(p.x<263&&p.y>1290&&p.y<1510),'Final bend avoids the cupcake');}
 for(const n of nodes.slice(60))assert.deepEqual(journeyOverview(n),{key:'bakery',top:BAKERY_OFFSET,height:BAKERY_HEIGHT});
});
test('sky objects stay inside the chapter and filled steam keeps its rim contact',()=>{
 const {saturn:planet,galaxy,moon,chimney}=BAKERY_OBJECTS,r=planet.size/Math.sqrt(2);assert.ok(planet.x-r>0&&planet.x+r<1600&&planet.y-r>=0);assert.ok(galaxy.x>chimney.x&&galaxy.x<planet.x&&galaxy.y<chimney.y);assert.ok(planet.x-galaxy.x<galaxy.x-moon.x);
 for(let i=0;i<3;i++){const paths=new Set();for(let t=0;t<20;t+=.5){const p=chocolateSteam(t,i);assert.ok(p.d.startsWith(`M${((i-1)*10).toFixed(2)} 0.00C`));assert.ok(!/NaN|Infinity/.test(p.d));assert.ok(p.d.endsWith('Z'),'Steam is a filled veil, not a stroked line');assert.ok(p.opacity>=.3&&p.opacity<=.45);paths.add(p.d);}assert.ok(paths.size>30);}
});
