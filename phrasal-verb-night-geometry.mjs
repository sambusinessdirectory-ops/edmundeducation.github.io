import {DESERT_WATER,DESERT_HEIGHT,desertPositions,createDesertNavigation,tumbleweedMotion} from './phrasal-verb-desert-geometry.mjs?v=20260913-night1';
export const PHRASAL_MAP_LIMIT=60;
export const NIGHT_OFFSET=1770;
export const NIGHT_HEIGHT=1640;
export const JOURNEY_HEIGHT=NIGHT_OFFSET+NIGHT_HEIGHT;
export const NIGHT_WATER=[[[193,296],[322,291],[470,292],[572,297],[557,311],[505,321],[454,333],[371,343],[286,336],[232,323],[193,313]]];
export const JOURNEY_WATER=[...DESERT_WATER,...NIGHT_WATER.map(poly=>poly.map(([x,y])=>[x,y+NIGHT_OFFSET]))];
export function phrasalJourneyLessons(lessons){return lessons.slice(0,PHRASAL_MAP_LIMIT).map((l,i)=>({id:l.id,order:i+1,titleEn:l.titleEn||l.englishTitle,titleZh:l.title||l.titleZh||'',questions:l.questions}));}
export function nightPositions(lessons){return lessons.slice(0,30).map((l,i)=>{const row=Math.floor(i/7),column=row%2?6-i%7:i%7;return {id:l.id,x:row===4?690+(i%7)*220:155+column*215+(row?Math.sin(row*.9+column)*9:0),y:NIGHT_OFFSET+[390,690,960,1240,1480][row]+Math.sin(column*1.1+row*.5)*(row?18:8)};});}
export const journeyPositions=lessons=>[...desertPositions(lessons.slice(0,30)),...nightPositions(lessons.slice(30,60))];
export const createJourneyNavigation=nodes=>createDesertNavigation(nodes,JOURNEY_HEIGHT,JOURNEY_WATER);
export const journeyOverview=p=>p.y>=NIGHT_OFFSET?{key:'night',top:NIGHT_OFFSET,height:NIGHT_HEIGHT}:{key:'day',top:0,height:DESERT_HEIGHT};
export function nightTumbleweedMotion(t,index){const motion=tumbleweedMotion(t,index);return {...motion,y:(index?1360:820)-(index?567:550)+motion.y};}
export const NIGHT_LIGHTS=[
 {x:137,y:312,r:46},{x:237,y:338,r:39},{x:1508,y:352,r:44},{x:1543,y:326,r:48},
 {x:121,y:1352,r:52},{x:1378,y:1407,r:58},
 {x:212,y:261,r:26},{x:237,y:258,r:23},{x:282,y:266,r:26},{x:430,y:264,r:32},
 {x:454,y:267,r:22},{x:527,y:265,r:26},{x:430,y:225,r:17}
];
export const NIGHT_STARS=Array.from({length:56},(_,i)=>({x:44+(i*263)%1505,y:13+(i*41)%129,r:i%9===0?2.4:i%4===0?1.65:1.05,period:3.7+(i%9)*.41,phase:-i*.79})).filter(p=>!(p.x>1220&&p.x<1340&&p.y<125));
export function nightPlants(){
 const inventory=[['palm',77,370,176],['shortPalm',261,296,118],['shortPalm',533,294,86],['shortPalm',619,320,84],
 ['palm',1498,380,157],['shrub',793,370,58],['reeds',1365,364,64],
 ['shrub',77,585,79],['reeds',493,592,72],['shrub',1156,590,75],['reeds',1516,595,60],
 ['reeds',72,873,75],['shrub',408,880,81],['reeds',1186,875,78],['shrub',1486,873,68],
 ['shortPalm',184,1200,117],['reeds',440,1148,69],['shrub',1120,1147,77],['reeds',1500,1145,78],
 ['shrub',406,1430,71],['reeds',1127,1428,78],['shrub',80,1608,86],['reeds',530,1608,71],['reeds',1479,1612,95]];
 return inventory.map(([kind,x,y,width],i)=>({kind,x,y,width,height:width*1.25,phase:i*1.43,period:6.2+i%7*.47,amplitude:kind==='palm'||kind==='shortPalm'?2.4:3.4}));
}
