import {BLUEPRINT_WIDTH,BLUEPRINT_HEIGHT,BLUEPRINT_CAPTIONS,blueprintPositions,blueprintRoute,blueprintNavigation} from './common-expression-blueprint-geometry.mjs';
import {loadBlueprintArtwork,paintBlueprintPlatform} from './common-expression-blueprint-artwork.mjs';
import {mountBlueprintEffects} from './common-expression-blueprint-effects.mjs';
let artwork;
export async function prepareBlueprint(){artwork=await loadBlueprintArtwork();return artwork;}
export function blueprintLessons(lessons){return lessons.map((lesson,i)=>({...lesson,mapLabel:BLUEPRINT_CAPTIONS[i]||lesson.titleEn}));}
function terrain(nodes){
 const route=blueprintRoute(nodes.length),ticks=[];let distance=0,lastTick=-30;
 for(let i=1;i<route.points.length;i++){
  const a=route.points[i-1],b=route.points[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);distance+=len;
  if(distance-lastTick<24||!len)continue;lastTick=distance;
  const nx=-dy/len,ny=dx/len,half=Math.round(distance/24)%5===0?22:12;
  ticks.push(`<path d="M${b.x-nx*half} ${b.y-ny*half}L${b.x+nx*half} ${b.y+ny*half}"/>`);
 }
 return `<div class="blueprint-background" aria-hidden="true"></div>
 <svg class="blueprint-road" viewBox="0 0 ${BLUEPRINT_WIDTH} ${BLUEPRINT_HEIGHT}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
 <defs><pattern id="blueprint-paper-grid" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#f2efdf"/><path d="M24 0H0V24" fill="none" stroke="#5387a0" stroke-width=".55" opacity=".3"/></pattern></defs>
 <g fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="${route.d}" stroke="#082941" stroke-width="59" opacity=".4" transform="translate(0 8)"/><path d="${route.d}" stroke="#a3aba8" stroke-width="58" transform="translate(0 4)"/><path d="${route.d}" stroke="#fff9df" stroke-width="57"/><path data-blueprint-route d="${route.d}" stroke="url(#blueprint-paper-grid)" stroke-width="52"/><g stroke="#477590" stroke-width=".9" opacity=".46">${ticks.join('')}</g></g>
 <g fill="#e3ecdd" font-family="Georgia,serif"><text x="52" y="58" font-size="33" letter-spacing="2">BLUEPRINT WORLD</text><path d="M52 75H451" stroke="#d4e9e4" opacity=".7"/><text x="54" y="99" font-size="12" letter-spacing="3">RHETORICAL WRITING</text></g>
 <g transform="translate(520 84)" fill="none" stroke="#d9e9df" opacity=".75"><circle r="31"/><path d="M-40 0H40M0-40V40M-22 22 0-28 22 22 0 10Z"/><circle r="3" fill="#d9e9df"/></g>
 </svg><canvas class="blueprint-effects" data-blueprint-effects aria-hidden="true"></canvas>`;
}
export const RHETORICAL_BLUEPRINT={
 id:'rhetorical-blueprint',title:'修辭寫作藍圖之旅',kicker:'BLUEPRINT WORLD',width:BLUEPRINT_WIDTH,height:BLUEPRINT_HEIGHT,
 positions:blueprintPositions,navigation:blueprintNavigation(),terrain,minimumZoom:.5,fitOverview:true,
 cameraScaleFloor:()=>window.innerWidth<700?.85:.7,
 cameraTop:({point,scale,height,overview})=>overview||height>=BLUEPRINT_HEIGHT*scale-2?0:Math.max(0,point.y*scale-height*.44),
 mount(root,reduced){
  if(!artwork)throw new Error('Blueprint artwork must be ready before mounting');
  root.querySelectorAll('[data-map-level]').forEach(button=>{const c=document.createElement('canvas');c.className='blueprint-platform';c.setAttribute('aria-hidden','true');button.prepend(c);paintBlueprintPlatform(c,artwork);});
  root.querySelector('.expression-map-viewport').setAttribute('aria-label','修辭寫作藍圖地圖；拖動探索，點選圖釘平台選擇課題。可用方向鍵或 WASD 走動。');
  return mountBlueprintEffects(root,artwork,reduced);
 }
};
