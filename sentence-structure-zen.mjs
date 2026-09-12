import { ZEN_OFFSET,ZEN_HEIGHT,ART_SIZE,WATER_SHAPES,artPoint,KOI,LOTUS,LAMPS,CAT } from './sentence-structure-zen-geometry.mjs?v=20260912-zen1';
import { createGardenScenery } from './sentence-structure-zen-scenery.mjs?v=20260912-zen1';
import { createKoiRig,koiMotion,koiRoute,lotusAngle,createSleepingCat,catMotion } from './sentence-structure-zen-wildlife.mjs?v=20260912-zen1';
const ART='./assets/sentence-structure/zen/';
const maple='M0 20L-2 7L-13 13L-9 2L-21-2L-10-7L-14-18L-4-12L0-26L5-12L16-19L12-7L23-2L11 3L15 13L3 8Z';
export const zenLeaf=(fill='#b73132')=>`<svg viewBox="-26 -28 54 54" aria-hidden="true"><path d="${maple}" fill="${fill}"/><path d="M0 21V-19M0 4L-13-7M0 3L13-8" stroke="#f6b079" fill="none" stroke-width="1"/></svg>`;
function pondEffects(){return `<svg class="zen-pond-effects" viewBox="0 0 1496 1051" aria-hidden="true"><defs>${WATER_SHAPES.map((p,i)=>`<clipPath id="zen-pond-${i}"><polygon points="${p.map(x=>x.join(',')).join(' ')}"/></clipPath>`).join('')}</defs>${WATER_SHAPES.map((p,i)=>{
 const min=Math.min(...p.map(x=>x[1])),max=Math.max(...p.map(x=>x[1]));
 return `<g clip-path="url(#zen-pond-${i})" data-pond="${i}">${Array.from({length:4},(_,j)=>`<path class="zen-current" d="M0 ${min+(max-min)*(j+1)/5}Q500 ${min+10+j*8} 1000 ${max-10-j*5}T1600 ${max-j*9}" style="--duration:${31+i*7+j*3}s;--delay:${-j*6-i*9}s"/>`).join('')}<ellipse class="zen-ripple" cx="${p[3][0]}" cy="${(min+max)/2}" rx="17" ry="4" style="--delay:${-i*2.9}s"/></g>`;
 }).join('')}</svg>`;}
export function zenTerrain(nodes,lessons){
 const local=nodes.map(p=>({...p,y:p.y-ZEN_OFFSET}));
 return `<div class="sentence-zen-realm" style="top:${ZEN_OFFSET}px" aria-hidden="true"><img class="zen-background" src="${ART}background-grounded.webp" width="3200" height="2250" alt=""><canvas class="zen-living-scenery" width="1496" height="1051"></canvas>${pondEffects()}
 ${LAMPS.map(([x,y,size],i)=>{const p=artPoint([x,y]);return `<i class="zen-lamp-glow" data-lamp="${i}" style="left:${p.x-size/2}px;top:${p.y-size/2}px;width:${size}px;height:${size}px;--duration:${7.5+i*.9}s;--delay:${-i*1.8}s"></i>`;}).join('')}
 ${WATER_SHAPES.map((poly,pond)=>`<div class="zen-koi-water-layer" style="clip-path:polygon(${poly.map(([x,y])=>`${x/ART_SIZE.width*100}% ${y/ART_SIZE.height*100}%`).join(',')})">${KOI.map((f,i)=>f.pond===pond?`<div class="zen-koi-position" data-koi="${i}"><div class="zen-koi-heading"><canvas width="240" height="160" style="width:${f.width}px;height:${f.width*2/3}px"></canvas></div></div>`:'').join('')}</div>`).join('')}
 ${LOTUS.map(([x,y,size],i)=>{const p=artPoint([x,y]);return `<div class="zen-lotus-position" style="left:${p.x}px;top:${p.y}px;width:${size}px;height:${size}px"><img class="zen-lotus" src="${ART}lotus.webp" alt="" data-lotus="${i}"></div>`;}).join('')}
 <div class="zen-door-steam">${[0,1,2].map(i=>`<i style="--delay:${-i*3.6}s;--drift:${-50-i*13}px"><svg viewBox="0 0 60 110"><path d="M30 108C12 89 46 82 31 65S13 42 32 23S38 8 30 0" fill="none" stroke="#fffef5" stroke-width="15" opacity=".2"/><path d="M30 108C12 89 46 82 31 65S13 42 32 23S38 8 30 0" fill="none" stroke="#fffef5" stroke-width="6" opacity=".5"/></svg></i>`).join('')}</div>
 <i class="zen-cat-shadow"></i><canvas class="zen-sleeping-cat" width="360" height="235"></canvas>
 ${local.map((p,i)=>lessons[i].order%10===0?`<div class="zen-milestone" data-milestone="${lessons[i].order}" style="left:${p.x-78}px;top:${p.y-110}px"><span>${lessons[i].order}</span></div>`:'').join('')}
 </div><span class="zen-realm-sign" style="top:${ZEN_OFFSET+635}px">61–90 · 庭園慢行</span>`;
}
export const zenOverlay=`<div class="zen-falling-leaves" aria-hidden="true">${Array.from({length:8},(_,i)=>`<span style="left:${5+i*13}%;--duration:${23+i%3*4}s;--delay:${-i*4.7}s;--drift:${i%2?-65:80}px;--spin:${i%2?-190:230}deg;width:${12+i%3*3}px">${zenLeaf(['#b72e32','#bb4934','#a92630'][i%3])}</span>`).join('')}</div>`;
export function decorateZenStones(root){
 root.querySelectorAll('.expression-map-stone').forEach((stone,i)=>{if(i<60||i>=90)return;stone.dataset.zen='true';stone.insertAdjacentHTML('afterbegin',`<svg class="zen-stone-art" viewBox="10 100 1660 760" aria-hidden="true"><image href="${ART}stone.webp" width="1677" height="938"/></svg>`);});
}
export function mountZen(root,reduced){
 let disposed=false,elapsed=0,last=0,lastPaint=-Infinity,scenery,catRig;
 const viewport=root.querySelector('.expression-map-viewport'),canvas=root.querySelector('.zen-living-scenery'),cat=root.querySelector('.zen-sleeping-cat'),leaves=root.querySelector('.zen-falling-leaves');
 const fish=[...root.querySelectorAll('.zen-koi-position')].map(el=>({el,heading:el.firstElementChild,canvas:el.querySelector('canvas')}));
 const lotuses=[...root.querySelectorAll('.zen-lotus')],rigs=[],images=[];
 const load=(name,done)=>{const img=new Image();images.push(img);img.onload=()=>{if(!disposed){done(img);paint(true);}};img.src=new URL(ART+name+'.webp',import.meta.url).href;};
 const flag=root.querySelector('.expression-map-flag');flag.insertAdjacentHTML('beforeend',`<g class="zen-flag-emblem" transform="translate(32 27)"><circle r="8.5" fill="none" stroke="#fff8dd" stroke-width="1.1"/>${Array.from({length:5},(_,i)=>`<ellipse cx="0" cy="-3.5" rx="2.5" ry="3" transform="rotate(${i*72})" fill="#fff8dd"/>`).join('')}</g>`);
 const catPosition=artPoint([CAT.x,CAT.y]);cat.style.cssText=`left:${catPosition.x-CAT.width/2}px;top:${catPosition.y-CAT.width*235/360+17}px;width:${CAT.width}px;height:${CAT.width*235/360}px`;
 const shadow=root.querySelector('.zen-cat-shadow');shadow.style.cssText=`left:${catPosition.x-CAT.width*.36}px;top:${catPosition.y+8}px;width:${CAT.width*.72}px;height:15px`;
 const door=artPoint([927,185]);root.querySelector('.zen-door-steam').style.cssText=`left:${door.x-50}px;top:${door.y-150}px`;
 function update(){
  const scale=Number(root.dataset.scale)||1,top=ZEN_OFFSET*scale-viewport.scrollTop;
  const bottom=top+ZEN_HEIGHT*scale;leaves.style.clipPath=`inset(${Math.max(0,Math.min(viewport.clientHeight,top))}px 0 ${Math.max(0,Math.min(viewport.clientHeight,viewport.clientHeight-bottom))}px)`;leaves.style.opacity=String(top<viewport.clientHeight&&bottom>0?1:0);
  const pinned=Number(flag.dataset.flagLevel?.slice(2));flag.classList.toggle('is-zen',pinned>60&&pinned<=90);
 }
 function paint(force=false){
  if(disposed)return;const t=reduced.matches?0:elapsed;
  if(force||t-lastPaint>=1/30||reduced.matches){
   scenery?.paint(t,reduced.matches);catRig?.paint(cat,catMotion(t));
   fish.forEach((f,i)=>{
    const pose=koiRoute(t,KOI[i]),p=artPoint([pose.x,pose.y]);
    f.el.style.transform=`translate(${p.x+800}px,${p.y}px)`;f.heading.style.transform=`rotate(${pose.heading}rad)`;
    rigs[KOI[i].pattern]?.paint(f.canvas,koiMotion(t,i));f.el.dataset.pose=JSON.stringify(pose);
   });
   lotuses.forEach((el,i)=>{el.style.transform=`rotate(${lotusAngle(t,i)}rad)`;});lastPaint=t;
  }update();
 }
 load('background-grounded',img=>{scenery=createGardenScenery(canvas,img);});
 load('koi-red',img=>{rigs[0]=createKoiRig(img,[[1390,432,26,20],[1387,613,26,20]]);});
 load('koi-tricolor',img=>{rigs[1]=createKoiRig(img,[[1390,445,26,19],[1390,607,26,19]]);});
 load('cat',img=>{catRig=createSleepingCat(img);});
 viewport.addEventListener('scroll',update,{passive:true});
 return {update,draw(now){const scale=Number(root.dataset.scale)||1,top=ZEN_OFFSET*scale-viewport.scrollTop,inView=top<viewport.clientHeight&&top+ZEN_HEIGHT*scale>0;if(last&&inView)elapsed+=Math.min(100,Math.max(0,now-last))/1000;last=now;if(inView)paint();else update();},destroy(){disposed=true;images.forEach(i=>i.onload=null);scenery?.destroy();viewport.removeEventListener('scroll',update);}};
}
