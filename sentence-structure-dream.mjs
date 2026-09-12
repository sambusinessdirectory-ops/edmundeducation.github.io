import {DREAM_OFFSET,DREAM_HEIGHT,DREAM_ART,DREAM_STARS,DREAM_FLAGS,DREAM_MOON,DREAM_RAIL,dreamPoint,dreamTrailPath} from './sentence-structure-dream-geometry.mjs?v=20260912-dream-normal';
import {flagShape,dreamBreath} from './sentence-structure-dream-motion.mjs?v=20260912-dream-normal';
import {createDreamTrain} from './sentence-structure-dream-train.mjs?v=20260912-dream-normal';
import {createDreamScenery} from './sentence-structure-dream-scenery.mjs?v=20260912-dream-normal';
const ART='./assets/sentence-structure/dream/';
const worldSize=n=>n*3200/DREAM_ART.width;
export function dreamTerrain(){
 const m=DREAM_MOON,trail=dreamTrailPath();
 return `<div class="sentence-dream-realm" style="top:${DREAM_OFFSET}px;height:${DREAM_HEIGHT}px" aria-hidden="true"><img class="dream-background" src="${ART}background-normal.webp" width="3200" height="${DREAM_HEIGHT}" alt=""><canvas class="dream-living-scenery" width="${DREAM_ART.width}" height="${DREAM_ART.height}"></canvas>
 <svg class="dream-quilt-trail" width="1600" height="${DREAM_HEIGHT}" viewBox="0 0 1600 ${DREAM_HEIGHT}"><defs><filter id="dream-trail-soft"><feGaussianBlur stdDeviation="4"/></filter></defs><path d="${trail}" class="dream-trail-shadow"/><path d="${trail}" class="dream-trail-edge"/><path d="${trail}" class="dream-trail-fabric"/><path d="${trail}" class="dream-trail-stitches"/></svg>
 <div class="dream-moon" style="left:${m.x-m.size/2}px;top:${m.y-m.size/2}px;width:${m.size}px;height:${m.size}px"><img src="${ART}moon.webp" alt=""></div>
 ${DREAM_STARS.map(([x,y,w,phase],i)=>`<div class="dream-hanging-star" data-star="${i}" style="left:${x-w/2}px;top:0;width:${w}px;height:${y+w/2}px;--hang:${y-w/2}px;--duration:${5.4+i*.31}s;--delay:${-phase}s"><i class="dream-star-string"></i><span class="dream-star-light"><img src="${ART}star.webp" alt=""></span></div>`).join('')}
 ${DREAM_FLAGS.map(([x,y,w,h],i)=>{const p=dreamPoint([x,y]),color=['#bb634a','#ca7450','#c29068','#b96853'][i];return `<svg class="dream-castle-flag" data-flag="${i}" style="left:${p.x}px;top:${p.y-8*DREAM_HEIGHT/DREAM_ART.height}px;width:${worldSize(w+6)}px;height:${(h+18)*DREAM_HEIGHT/DREAM_ART.height}px" viewBox="-1 -8 ${w+6} ${h+18}"><defs><linearGradient id="dream-cloth-${i}"><stop stop-color="${color}"/><stop offset=".45" stop-color="#e5a16c"/><stop offset=".7" stop-color="${color}"/><stop offset="1" stop-color="#c58764"/></linearGradient></defs><path d="${flagShape(0,i,w,h)}" fill="url(#dream-cloth-${i})" stroke="#e6ac7366" stroke-width=".5"/></svg>`;}).join('')}
 <canvas class="dream-toy-train" width="1320" height="720" style="left:${DREAM_RAIL.x-330}px;top:${DREAM_RAIL.y-210}px;width:660px;height:360px"></canvas>
 ${[[636,255,82],[1172,139,106],[1120,287,44],[699,542,38],[917,489,42],[968,192,48]].map(([x,y,size],i)=>{const p=dreamPoint([x,y]),w=worldSize(size);return `<i class="dream-ambient-glow" style="left:${p.x-w/2}px;top:${p.y-w/2}px;width:${w}px;height:${w}px;--duration:${8+i*.9}s;--delay:${-i*1.9}s"></i>`;}).join('')}
 ${Array.from({length:32},(_,i)=>{const x=80+(i*173)%1430,y=215+(i*47)%255;return `<i class="dream-twinkle ${i%4===0?'dream-twinkle-cross':''}" style="left:${x}px;top:${y}px;--duration:${2.7+i%5*.44}s;--delay:${-i*.61}s;width:${i%4===0?6:3+i%3*.6}px;height:${i%4===0?6:3+i%3*.6}px"></i>`;}).join('')}
 <span class="dream-realm-sign" style="left:30px;top:600px">91–120 · 枕間星夢</span></div>`;
}
export function decorateDreamStones(root){root.querySelectorAll('.expression-map-stone').forEach((stone,i)=>{if(i<90||i>=120)return;stone.dataset.dream='true';stone.insertAdjacentHTML('afterbegin',`<span class="dream-level-shadow"></span><img class="dream-level-cushion" src="${ART}cushion.webp" alt="" aria-hidden="true">`);});}
export function mountDream(root,reduced){
 let disposed=false,elapsed=0,last=0,lastPaint=-Infinity,scenery;
 const viewport=root.querySelector('.expression-map-viewport'),canvas=root.querySelector('.dream-living-scenery'),train=root.querySelector('.dream-toy-train');
 const flags=[...root.querySelectorAll('.dream-castle-flag path')],images=[],trainRig=createDreamTrain(train);
 const flag=root.querySelector('.expression-map-flag');flag.insertAdjacentHTML('beforeend','<path class="dream-flag-emblem" d="m31 16 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="#fff6cb"/>');
 function update(){flag.classList.toggle('is-dream',Number(flag.dataset.flagLevel?.slice(2))>90&&Number(flag.dataset.flagLevel?.slice(2))<=120);}
 function paint(force=false){const t=reduced.matches?0:elapsed;if(force||t-lastPaint>=1/30||reduced.matches){scenery?.paint(t,reduced.matches);trainRig.paint(t);flags.forEach((el,i)=>el.setAttribute('d',flagShape(t,i,DREAM_FLAGS[i][2],DREAM_FLAGS[i][3])));canvas.dataset.breath=String(dreamBreath(t));lastPaint=t;}update();}
 const img=new Image();images.push(img);img.onload=()=>{if(!disposed){scenery=createDreamScenery(canvas,img);paint(true);}};img.src=new URL(ART+'background-normal.webp',import.meta.url).href;
 return {update,draw(now){const scale=Number(root.dataset.scale)||1,top=DREAM_OFFSET*scale-viewport.scrollTop,inView=top<viewport.clientHeight&&top+DREAM_HEIGHT*scale>0;if(last&&inView)elapsed+=Math.min(100,Math.max(0,now-last))/1000;last=now;if(inView)paint();else update();},destroy(){disposed=true;images.forEach(i=>i.onload=null);scenery?.destroy();trainRig.destroy();}};
}
