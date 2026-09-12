import { levelPositions } from './common-expression-map.mjs?v=20260912-autumn1';
import { SENTENCE_COAST, SHORE_LAYOUT } from './sentence-structure-coast.mjs?v=20260912-autumn1';
import { AUTUMN_OFFSET, realmsPath, realmsStep } from './sentence-structure-realms-navigation.mjs?v=20260912-zen1';
import { createAutumnRabbit, rabbitMotion } from './sentence-structure-autumn-rabbit.mjs?v=20260912-autumn1';
import { ZEN_OFFSET,ZEN_HEIGHT,ZEN_LAYOUT } from './sentence-structure-zen-geometry.mjs?v=20260912-zen1';
import { zenTerrain,zenOverlay,decorateZenStones,mountZen } from './sentence-structure-zen.mjs?v=20260912-zen2';
const ART='./assets/sentence-structure/autumn/';
export const AUTUMN_LAYOUT={startX:160,columnGap:205,rowYs:[520,1010,1250,1490,1710]};
export function sentenceRealmPositions(lessons){return [
 ...levelPositions(lessons.slice(0,30),SHORE_LAYOUT),
 ...levelPositions(lessons.slice(30,60),AUTUMN_LAYOUT).map(p=>({...p,y:p.y+AUTUMN_OFFSET})),
 ...levelPositions(lessons.slice(60,90),ZEN_LAYOUT).map(p=>({...p,y:p.y+ZEN_OFFSET}))
];}
let ids=0;
const leafPath='M0 17L-3 8L-12 11L-9 3L-18-3L-9-5L-10-14L-3-10L1-21L5-11L13-14L11-5L19-2L10 4L12 11L3 8Z';
function leaf(fill='#bd612f',cls=''){return `<svg class="${cls}" viewBox="-23 -25 46 50" aria-hidden="true"><path d="${leafPath}" fill="${fill}"/><path d="M0 20L1-16M1 6L-10-4M1 1L10-7" stroke="#f5c97e" stroke-width="1.1" fill="none"/></svg>`;}
export function autumnRoute(nodes){return nodes.map((p,i)=>{
 if(!i)return `M${p.x} ${p.y}`;const a=nodes[i-1];
 if(i===7)return `C${a.x+75} ${a.y+70} 1050 600 1050 630 L1050 967 C1050 1010 ${p.x+80} ${p.y-40} ${p.x} ${p.y}`;
 if(a.x===p.x){const bend=p.x>800?82:-72;return `C${a.x+bend} ${a.y+70} ${p.x+bend} ${p.y-70} ${p.x} ${p.y}`;}
 return `C${(a.x+p.x)/2} ${a.y} ${(a.x+p.x)/2} ${p.y} ${p.x} ${p.y}`;
}).join(' ');}
function trail(d,id){return `<defs><pattern id="${id}" width="53" height="41" patternUnits="userSpaceOnUse"><rect width="53" height="41" fill="#b88b5b"/><path d="M2 31l9-3M24 5l6 1M39 18l5-2" stroke="#896645" stroke-width="2" opacity=".35"/><circle cx="15" cy="12" r="2" fill="#ddba83"/><circle cx="43" cy="34" r="1.5" fill="#e8c98d"/></pattern></defs><path d="${d}" fill="none" stroke="#5e4530" stroke-width="70" opacity=".35" transform="translate(0 5)" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#d2b37a" stroke-width="66" stroke-linecap="round"/><path d="${d}" fill="none" stroke="url(#${id})" stroke-width="57" stroke-linecap="round"/>`;}
function milestone(p,order){return `<div class="autumn-milestone" data-milestone="${order}" style="left:${p.x-85}px;top:${p.y-108}px"><span>${order}</span>${leaf('#d29848')}</div>`;}
// Water polygons and holes exclude the two bridges and the largest foreground rocks.
const river='M0 623L170 677L375 706L640 735L900 725L1230 739L1520 743L1730 746L2070 751L2400 779L2730 752L2990 720L3200 698V833L3000 866L2680 856L2445 880L2190 881L1970 882L1750 877L1520 871L1290 850L1100 833L910 836L700 833L470 817L250 785L0 714Z';
function water(){const id=`autumn-water-${++ids}`;return `<svg class="autumn-water" viewBox="0 0 3200 1950" aria-hidden="true"><defs><mask id="${id}"><path d="${river}" fill="white"/><path d="M1490 310L1525 312L1570 336L1540 353L1608 371L1580 395L1530 387L1550 371L1500 355Z" fill="white"/><g fill="black"><rect x="875" y="620" width="175" height="300"/><rect x="1765" y="619" width="170" height="317"/><ellipse cx="1340" cy="796" rx="62" ry="28"/><ellipse cx="1510" cy="819" rx="54" ry="22"/><ellipse cx="2470" cy="806" rx="54" ry="23"/><ellipse cx="2630" cy="787" rx="104" ry="33"/></g></mask></defs><g mask="url(#${id})"><g class="autumn-river-surface"><image href="${ART}background.webp" width="3200" height="1950"/></g>${Array.from({length:6},(_,i)=>`<path class="autumn-current" d="M-120 ${748+i*20}Q500 ${765+i*17} 1100 ${775+i*15}T2300 ${760+i*18}T3380 ${765+i*17}" style="--delay:${-i*3.7}s;--duration:${24+i*2}s"/>`).join('')}<path class="autumn-brook-current" d="M1510 323Q1575 350 1533 350T1587 381"/></g></svg>`;}
function terrain(nodes,lessons){
 const autumn=nodes.slice(30,60).map(p=>({...p,y:p.y-AUTUMN_OFFSET}));
 return `<div class="sentence-coast-realm">${SENTENCE_COAST.terrain(nodes.slice(0,30),lessons.slice(0,30))}</div>
 <div class="sentence-autumn-realm" style="top:${AUTUMN_OFFSET}px" aria-hidden="true"><img class="autumn-background" src="${ART}background.webp" width="3200" height="1950" alt="">${water()}
 <div class="autumn-dusk"></div><div class="autumn-far-fog"><i></i><i></i><i></i></div>
 <i class="autumn-window-glow autumn-window-main"></i><i class="autumn-window-glow autumn-window-side"></i>
 <svg class="autumn-route" viewBox="0 0 1600 1950"><defs><mask id="autumn-route-bridge-mask"><rect width="1600" height="1950" fill="white"/><rect x="974" y="637" width="170" height="294" fill="black"/></mask></defs><g mask="url(#autumn-route-bridge-mask)">${trail(autumnRoute(autumn),`autumn-trail-${++ids}`)}</g></svg>
 ${autumn.map((p,i)=>lessons[i+30].order%10===0?milestone(p,lessons[i+30].order):'').join('')}
 <i class="autumn-rabbit-shadow"></i><canvas class="autumn-rabbit" width="360" height="350"></canvas></div>
 <div class="realm-cloud-border" aria-hidden="true">${Array.from({length:11},(_,i)=>`<i style="left:${i*290-60}px;top:${i%3*11}px;--duration:${19+i%4*5}s;--delay:${-i*3.4}s;--drift:${i%2?'-': ''}27px"></i>`).join('')}</div>
 <span class="autumn-realm-sign" style="top:${AUTUMN_OFFSET+452}px">31–60 · 秋林漫步</span>
 ${zenTerrain(nodes.slice(60),lessons.slice(60))}
 <div class="realm-cloud-border zen-cloud-border" style="top:${ZEN_OFFSET-190}px" aria-hidden="true">${Array.from({length:11},(_,i)=>`<i style="left:${i*290-60}px;top:${i%3*11}px;--duration:${23+i%4*5}s;--delay:${-i*3.1}s;--drift:${i%2?'-':''}22px"></i>`).join('')}</div>`;
}
const overlay=`<div class="autumn-leaves" aria-hidden="true">${Array.from({length:10},(_,i)=>`<span style="left:${4+i*10}%;--duration:${19+i%4*3}s;--delay:${-i*3.8}s;--drift:${i%2?-65:85}px;--spin:${i%2?-230:190}deg;width:${12+i%3*3}px">${leaf(['#b86536','#d49a4e','#a94b33','#c89c58'][i%4])}</span>`).join('')}</div>`;
function mount(root,reduced){
 root.querySelectorAll('.expression-map-stone').forEach((stone,i)=>{if(i>=30&&i<60){stone.dataset.autumn='true';stone.insertAdjacentHTML('afterbegin',`<svg class="autumn-stone-art" viewBox="20 166 1570 710" aria-hidden="true"><image href="${ART}stone.webp" width="1611" height="976"/></svg>`);}});
 decorateZenStones(root);
 const coast=SENTENCE_COAST.mount(root,reduced,{stoneSelector:'.expression-map-stone:not([data-autumn]):not([data-zen])',label:'句型海岸、秋林與庭園地圖，第 1 至 90 課；可穿過雲霧自由來往，沿橋過河，點選石階或使用方向鍵 / WASD 走動。'});
 const zen=mountZen(root,reduced);
 const flag=root.querySelector('.expression-map-flag');flag.insertAdjacentHTML('beforeend',`<g class="autumn-flag-emblem" transform="translate(30 28) scale(.43)"><path d="${leafPath}" fill="#fff3cb"/><path d="M0 20L1-16" stroke="#866443" stroke-width="1.5"/></g>`);
 const canvas=root.querySelector('.autumn-rabbit'),viewport=root.querySelector('.expression-map-viewport'),leaves=root.querySelector('.autumn-leaves');
 const image=new Image();let rig,disposed=false,elapsed=0,last=0;
 image.onload=()=>{if(!disposed){rig=createAutumnRabbit(image);rig.paint(canvas,rabbitMotion(reduced.matches?0:elapsed));}};image.src=new URL(ART+'rabbit.webp',import.meta.url).href;
 function update(){
  const scale=Number(root.dataset.scale)||1,top=AUTUMN_OFFSET*scale-viewport.scrollTop;
  const bottom=ZEN_OFFSET*scale-viewport.scrollTop;
  leaves.style.clipPath=`inset(${Math.max(0,Math.min(viewport.clientHeight,top))}px 0 ${Math.max(0,Math.min(viewport.clientHeight,viewport.clientHeight-bottom))}px)`;
  leaves.style.opacity=String(top<viewport.clientHeight&&bottom>0?1:0);
  const pinned=Number(flag.dataset.flagLevel?.slice(2));flag.classList.toggle('is-autumn',pinned>30&&pinned<=60);
  const y=parseFloat(root.querySelector('.expression-map-horse').style.top)+12;
  root.dataset.currentRealm=y>=ZEN_OFFSET?'zen':y>=AUTUMN_OFFSET?'autumn':'shore';zen.update();
 }
 function draw(now){if(disposed)return;coast?.draw(now);zen.draw(now);if(last)elapsed+=Math.min(100,Math.max(0,now-last))/1000;last=now;rig?.paint(canvas,rabbitMotion(reduced.matches?0:elapsed));update();}
 viewport.addEventListener('scroll',update,{passive:true});
 return {draw,update,destroy(){disposed=true;image.onload=null;viewport.removeEventListener('scroll',update);coast?.destroy();zen.destroy();}};
}
export const SENTENCE_REALMS=Object.freeze({
 id:'sentence-shore',title:'海岸・秋林・庭園之旅',kicker:'THE SENTENCE JOURNEY',width:1600,height:ZEN_OFFSET+ZEN_HEIGHT,
 cameraPadding:{left:800,right:800},minimumZoom:.5,positions:sentenceRealmPositions,terrain,mount,overlay:overlay+zenOverlay,
 navigation:{path:realmsPath,step:realmsStep},cameraTop:({point,scale,height,zoom})=>zoom===1&&height>=600?(point.y<625?0:point.y>=ZEN_OFFSET&&point.y<ZEN_OFFSET+800?(ZEN_OFFSET+90)*scale:point.y*scale-height*.4):point.y*scale-height*.4
});
