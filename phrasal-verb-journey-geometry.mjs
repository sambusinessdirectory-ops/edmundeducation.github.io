import {DESERT_HEIGHT,createDesertNavigation} from './phrasal-verb-desert-geometry.mjs?v=20260913-night1';
import {NIGHT_OFFSET,NIGHT_HEIGHT,JOURNEY_WATER,journeyPositions as firstSixty} from './phrasal-verb-night-geometry.mjs?v=20260913-night1';
import {BAKERY_OFFSET,BAKERY_HEIGHT,bakeryPositions} from './phrasal-verb-bakery-geometry.mjs?v=20260914-bakery4';
export const PHRASAL_MAP_LIMIT=90;
export const JOURNEY_HEIGHT=BAKERY_OFFSET+BAKERY_HEIGHT;
export {JOURNEY_WATER};
export function phrasalJourneyLessons(lessons){return lessons.slice(0,PHRASAL_MAP_LIMIT).map((l,i)=>({id:l.id,order:i+1,titleEn:l.titleEn||l.englishTitle,titleZh:l.title||l.titleZh||'',questions:l.questions}));}
export const journeyPositions=lessons=>[...firstSixty(lessons.slice(0,60)),...bakeryPositions(lessons.slice(60,90))];
export const journeyHeight=count=>count>60?JOURNEY_HEIGHT:count>30?NIGHT_OFFSET+NIGHT_HEIGHT:DESERT_HEIGHT;
export const createJourneyNavigation=nodes=>createDesertNavigation(nodes,journeyHeight(nodes.length),JOURNEY_WATER);
export const journeyOverview=p=>p.y>=BAKERY_OFFSET?{key:'bakery',top:BAKERY_OFFSET,height:BAKERY_HEIGHT}:p.y>=NIGHT_OFFSET?{key:'night',top:NIGHT_OFFSET,height:NIGHT_HEIGHT}:{key:'day',top:0,height:DESERT_HEIGHT};
