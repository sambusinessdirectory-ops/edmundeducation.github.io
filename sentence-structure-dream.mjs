import {DREAM_OFFSET,DREAM_HEIGHT,DREAM_STARS,DREAM_FLAGS,DREAM_MOON,DREAM_RAIL,dreamPoint} from './sentence-structure-dream-geometry.mjs?v=20260912-dream1';
import {createDreamTrain,flagShape,dreamBreath} from './sentence-structure-dream-motion.mjs?v=20260912-dream1';
import {createDreamScenery} from './sentence-structure-dream-scenery.mjs?v=20260912-dream1';
const ART='./assets/sentence-structure/dream/';
const worldSize=n=>n*3200/1536;
export function dreamTerrain(){
 const m=dreamPoint([DREAM_MOON.x,DREAM_MOON.y]),moonSize=worldSize(DREAM_MOON.size);
 const train=dreamPoint([DREAM_RAIL.x-215,DREAM_RAIL.y-88]);
 return `<div class="sentence-dream-realm" style="top:${DREAM_OFFSET}px" aria-hidden="true"><img class="dream-background" src="${ART}background.webp" width="3200" height="${DREAM_HEIGHT}" alt=""><canvas class="dream-living-scenery" width="1536" height="1024"></canvas>
 <div class="dream-moon" style="left:${m.x-moonSize/2}px;top:${m.y-moonSize/2}px;width:${moonSize}px;height:${moonSize}px"><img src="${ART}moon.webp" alt=""></div>
 ${DREAM_STARS.map(([x,y,size,phase],i)=>{const p=dreamPoint([x,y]),w=worldSize(size);return `<div class="dream-hanging-star" data-star="${i}" style="left:${p.x-w/2}px;top:0;width:${w}px;height:${p.y+w/2}px;--hang:${p.y-w/2}px;--duration:${8.5+i*.7}s;--delay:${-phase}s"><i class="dream-star-string"></i><span class="dream-star-light"><img src="${ART}star.webp" alt=""></span></div>`;}).join('')}
 ${DREAM_FLAGS.map(([x,y,w,h],i)=>{const p=dreamPoint([x,y]);return `<svg class="dream-castle-flag" data-flag="${i}" style="left:${p.x}px;top:${p.y}px;width:${worldSize(w+5)}px;height:${worldSize(h+7)}px" viewBox="-1 -4 ${w+6} ${h+10}"><path d="${flagShape(0,i,w,h)}" fill="${['#bb634a','#ca7450','#c29068','#b96853'][i]}" stroke="#e6ac7355" stroke-width=".5"/></svg>`;}).join('')}
 <canvas class="dream-toy-train" width="860" height="352" style="left:${train.x}px;top:${train.y}px;width:${worldSize(430)}px;height:${352/2*DREAM_HEIGHT/1024}px"></canvas>
 ${[[61,386,120],[1329,156,130],[1491,402,54],[1038,555,35],[1305,596,41],[947,268,45]].map(([x,y,size],i)=>{const p=dreamPoint([x,y]),w=worldSize(size);return `<i class="dream-ambient-glow" style="left:${p.x-w/2}px;top:${p.y-w/2}px;width:${w}px;height:${w}px;--duration:${10+i*.9}s;--delay:${-i*1.9}s"></i>`;}).join('')}
 ${Array.from({length:22},(_,i)=>{const x=430+(i*173)%1020,y=44+(i*67)%205,p=dreamPoint([x,y]);return `<i class="dream-twinkle" style="left:${p.x}px;top:${p.y}px;--duration:${5.7+i%5*1.2}s;--delay:${-i*.81}s;width:${2+i%3*.7}px;height:${2+i%3*.7}px"></i>`;}).join('')}
 <span class="dream-realm-sign" style="left:630px;top:905px">91–120 · 枕間星夢</span></div>`;
}
export function decorateDreamStones(root){root.querySelectorAll('.expression-map-stone').forEach((stone,i)=>{if(i<90)return;stone.dataset.dream='true';stone.insertAdjacentHTML('afterbegin','<span class="dream-level-light"></span>');});}
export function mountDream(root,reduced){
 let disposed=false,elapsed=0,last=0,lastPaint=-Infinity,scenery,trainRig;
 const viewport=root.querySelector('.expression-map-viewport'),canvas=root.querySelector('.dream-living-scenery'),train=root.querySelector('.dream-toy-train');
 const flags=[...root.querySelectorAll('.dream-castle-flag path')],images=[];
 const flag=root.querySelector('.expression-map-flag');flag.insertAdjacentHTML('beforeend','<path class="dream-flag-emblem" d="m31 16 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="#fff6cb"/>');
 function update(){flag.classList.toggle('is-dream',Number(flag.dataset.flagLevel?.slice(2))>90);}
 function paint(force=false){const t=reduced.matches?0:elapsed;if(force||t-lastPaint>=1/30||reduced.matches){scenery?.paint(t,reduced.matches);trainRig?.paint(train,t);flags.forEach((el,i)=>el.setAttribute('d',flagShape(t,i,DREAM_FLAGS[i][2],DREAM_FLAGS[i][3])));canvas.dataset.breath=String(dreamBreath(t));lastPaint=t;}update();}
 const load=(name,done)=>{const img=new Image();images.push(img);img.onload=()=>{if(!disposed){done(img);paint(true);}};img.src=new URL(ART+name+'.webp',import.meta.url).href;};
 load('background',img=>{scenery=createDreamScenery(canvas,img);});load('train',img=>{trainRig=createDreamTrain(img);});
 return {update,draw(now){const scale=Number(root.dataset.scale)||1,top=DREAM_OFFSET*scale-viewport.scrollTop,inView=top<viewport.clientHeight&&top+DREAM_HEIGHT*scale>0;if(last&&inView)elapsed+=Math.min(100,Math.max(0,now-last))/1000;last=now;if(inView)paint();else update();},destroy(){disposed=true;images.forEach(i=>i.onload=null);scenery?.destroy();}};
}
