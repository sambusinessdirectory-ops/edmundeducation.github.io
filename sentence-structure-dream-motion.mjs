import {DREAM_RAIL} from './sentence-structure-dream-geometry.mjs?v=20260912-dream-normal';
const TAU=Math.PI*2;
export const dreamBreath=t=>Math.sin(t*TAU/5.8)*.013;
export function trainPose(t,car=0){const a=t*TAU/DREAM_RAIL.period-DREAM_RAIL.carOffsets[car];return {x:DREAM_RAIL.x+Math.cos(a)*DREAM_RAIL.rx,y:DREAM_RAIL.y+Math.sin(a)*DREAM_RAIL.ry,angle:a+Math.PI/2,theta:a};}
export function flagShape(t,index,w,h){const wave=Math.sin(t*1.65+index*1.7)*6.3,fold=Math.sin(t*1.65+index*1.7-1)*3;return `M0 0C${w*.32} ${wave} ${w*.68} ${fold} ${w} ${wave*.85}L${w*.8} ${h*.5+fold}L${w} ${h+wave*.85}C${w*.68} ${h+fold} ${w*.32} ${h+wave} 0 ${h}Z`;}
