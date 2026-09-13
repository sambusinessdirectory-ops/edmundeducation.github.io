import {PUZZLE_SPRITES,drawPuzzleSprite,drawPuzzleShadow} from './ielts-puzzle-artwork.mjs';
import {PUZZLE_GATE,PUZZLE_MILL,PUZZLE_BALLOON,PUZZLE_FLOATS,PUZZLE_CLOUDS,PUZZLE_PLANTS,PUZZLE_WATERFALLS,PUZZLE_WATER_REGIONS} from './ielts-puzzle-geometry.mjs';
const TAU=Math.PI*2;
export const oscillation=(item,t)=>Math.sin(t*TAU/item.period+(item.phase||0))*item.amplitude;
export const rotorAngle=t=>t*TAU/PUZZLE_MILL.period;
function makeCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function fitCanvas(c,height){const d=Math.min(2,devicePixelRatio||1);c.width=1600*d;c.height=height*d;const g=c.getContext('2d');g.scale(d,d);return g;}
function centerSprite(g,art,key,x,y,w){const r=PUZZLE_SPRITES[key].rect,h=w*r[3]/r[2];drawPuzzleSprite(g,art,key,x-w/2,y-h/2,w,h);}

// Displace only water-coloured pixels inside authored water regions. The
// original plate supplies detailed foam; cliffs and bridge timber stay still.
function waterPatch(source,polygon){
 const x=Math.floor(Math.min(...polygon.map(p=>p.x))),y=Math.floor(Math.min(...polygon.map(p=>p.y)));
 const w=Math.ceil(Math.max(...polygon.map(p=>p.x))-x),h=Math.ceil(Math.max(...polygon.map(p=>p.y))-y);
 const mask=makeCanvas(w,h),g=mask.getContext('2d',{willReadFrequently:true});
 g.beginPath();polygon.forEach((p,i)=>i?g.lineTo(p.x-x,p.y-y):g.moveTo(p.x-x,p.y-y));g.closePath();g.clip();g.drawImage(source,-x,-y);
 const pixels=g.getImageData(0,0,w,h),d=pixels.data;
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){
  const k=(j*w+i)*4,r=d[k],green=d[k+1],b=d[k+2];
  const wet=b>r*1.13&&green>r*1.12||b>205&&green>200&&b>r+10;
  const edge=Math.min(1,i/9,(w-1-i)/9,j/9,(h-1-j)/9);
  d[k+3]=wet?Math.round(d[k+3]*Math.max(0,edge)):0;
 }
 g.putImageData(pixels,0,0);
 return {x,y,w,h,texture:mask,frame:makeCanvas(w,h)};
}
function prepareWater(art){
 const plate=makeCanvas(1600,900);plate.getContext('2d').drawImage(art.landscape,0,0,1600,900);
 return {
  rivers:PUZZLE_WATER_REGIONS.map(poly=>waterPatch(plate,poly)),
  falls:PUZZLE_WATERFALLS.map(f=>({...waterPatch(plate,[{x:f.x,y:f.y},{x:f.x+f.width,y:f.y},{x:f.x+f.width,y:f.y+f.height},{x:f.x,y:f.y+f.height}]),speed:f.speed}))
 };
}
function paintWater(g,water,t){
 for(const [index,p] of water.rivers.entries()){
  const c=p.frame.getContext('2d');c.clearRect(0,0,p.w,p.h);
  for(let y=0;y<p.h;y+=3){
   const drift=Math.sin(y*.105-t*1.7+index)*2.6;
   c.drawImage(p.texture,0,y,p.w,Math.min(3,p.h-y),drift,y,p.w,Math.min(3,p.h-y));
  }
  c.globalCompositeOperation='destination-in';c.drawImage(p.texture,0,0);c.globalCompositeOperation='source-over';
  g.globalAlpha=.76;g.drawImage(p.frame,p.x,p.y);
 }
 for(const p of water.falls){
  const c=p.frame.getContext('2d');c.clearRect(0,0,p.w,p.h);
  const shift=t*p.speed%p.h;
  c.drawImage(p.texture,0,shift);c.drawImage(p.texture,0,shift-p.h);
  c.globalCompositeOperation='destination-in';c.drawImage(p.texture,0,0);c.globalCompositeOperation='source-over';
  g.globalAlpha=.56;g.drawImage(p.frame,p.x,p.y);
 }
 g.globalAlpha=1;
}

// Exposed renderer supports deterministic pose inspection without a second
// production animation loop. Root points and rotor hub never translate.
export function createPuzzleRenderer({effects,waterCanvas,art,height=900}){
 const g=fitCanvas(effects,height),wg=fitCanvas(waterCanvas,height),water=prepareWater(art);
 function paint(t,{shadows=true}={}){
  g.clearRect(0,0,1600,height);wg.clearRect(0,0,1600,height);paintWater(wg,water,t);
  for(const item of PUZZLE_CLOUDS)centerSprite(g,art,item.kind,item.x+oscillation(item,t),item.y,item.w);
  const gate=PUZZLE_GATE;
  drawPuzzleSprite(g,art,'gate',gate.x-gate.width/2,gate.y-gate.height/2+oscillation(gate,t),gate.width,gate.height);
  for(const item of PUZZLE_FLOATS){
   g.save();g.translate(item.x,item.y+oscillation(item,t));g.rotate(Math.sin(t*.4+item.phase)*.025);centerSprite(g,art,item.kind,0,0,item.w);g.restore();
  }
  const balloon=PUZZLE_BALLOON;
  g.save();g.translate(balloon.x+oscillation(balloon,t),balloon.y+Math.sin(t*.35)*3);g.rotate(Math.sin(t*.25)*.018);centerSprite(g,art,'balloon',0,0,balloon.width);g.restore();
  const mill=PUZZLE_MILL,rotor=PUZZLE_SPRITES.rotor,s=mill.radius*2/rotor.rect[2];
  g.save();g.translate(mill.x,mill.y);g.rotate(rotorAngle(t));drawPuzzleSprite(g,art,'rotor',-rotor.anchor[0]*s,-rotor.anchor[1]*s,rotor.rect[2]*s,rotor.rect[3]*s);g.restore();
  for(const item of PUZZLE_PLANTS){
   const sprite=PUZZLE_SPRITES[item.kind],scale=item.h/sprite.rect[3];
   if(shadows)drawPuzzleShadow(g,item.x,item.y+1,item.h*.52,item.h*.1,.37);
   g.save();g.translate(item.x,item.y);g.rotate(oscillation(item,t));
   drawPuzzleSprite(g,art,item.kind,-sprite.root[0]*scale,-sprite.root[1]*scale,sprite.rect[2]*scale,item.h);g.restore();
  }
  effects.dataset.paintTime=t.toFixed(3);effects.dataset.ready='true';
 }
 paint(0);
 return {paint,water};
}

export function mountPuzzleEffects(root,art,height,reduced){
 const effects=root.querySelector('[data-puzzle-effects]'),waterCanvas=root.querySelector('[data-puzzle-water]');
 const renderer=createPuzzleRenderer({effects,waterCanvas,art,height});
 let elapsed=0,last=0,wasReduced=reduced.matches;
 return {
  draw(now){
   if(reduced.matches){if(!wasReduced)renderer.paint(0);wasReduced=true;last=0;return;}
   wasReduced=false;if(last)elapsed+=Math.min(100,now-last)/1000;last=now;renderer.paint(elapsed);
  },
  destroy(){last=0;effects.width=waterCanvas.width=1;}
 };
}
