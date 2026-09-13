const ART=new URL('./assets/listening-system/puzzle/v1/',import.meta.url);
export const PUZZLE_SPRITES={
 gate:{sheet:'props',rect:[61,42,391,445]},
 piece:{sheet:'props',rect:[550,135,414,327]},
 cluster:{sheet:'props',rect:[1045,174,466,282]},
 balloon:{sheet:'props',rect:[19,595,494,352]},
 rotor:{sheet:'props',rect:[557,526,431,430],anchor:[210,210]},
 platform:{sheet:'props',rect:[1060,605,446,331]},
 round:{sheet:'nature',rect:[12,60,522,532],root:[254,520]},
 cypress:{sheet:'nature',rect:[615,20,294,577],root:[130,562]},
 spread:{sheet:'nature',rect:[990,79,539,513],root:[274,500]},
 shrub:{sheet:'nature',rect:[48,655,405,316],root:[200,302]},
 cloud:{sheet:'nature',rect:[507,610,488,372]},
 cloudLong:{sheet:'nature',rect:[1003,661,521,307]}
};
const load=key=>new Promise((resolve,reject)=>{
 const image=new Image();image.decoding='async';
 image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(`Missing puzzle artwork: ${key}`));
 image.src=new URL(key+'.webp',ART).href;
});
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
// Preserve the generated RGB masters. Chroma compositing is cached once, not
// repeated in the animation loop. The atlas screen is not claimed to be alpha.
export function compositePuzzleScreen(image){
 const c=canvas(image.naturalWidth,image.naturalHeight),g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);
 const pixels=g.getImageData(0,0,c.width,c.height),d=pixels.data;
 for(let i=0;i<d.length;i+=4){
  const excess=Math.max(0,Math.min(d[i],d[i+2])-d[i+1]);
  const a=Math.max(0,Math.min(1,(135-excess)/110));
  if(a===0){d[i]=d[i+1]=d[i+2]=d[i+3]=0;continue;}
  if(a<1){d[i]=Math.max(0,(d[i]-(1-a)*255)/a);d[i+1]=Math.min(255,d[i+1]/a);d[i+2]=Math.max(0,(d[i+2]-(1-a)*255)/a);}
  if(excess>5){const spill=Math.max(0,Math.min(d[i],d[i+2])-d[i+1]);d[i]-=spill;d[i+2]-=spill;}
  d[i+3]=Math.round(a*255);
 }
 g.putImageData(pixels,0,0);return c;
}
let ready,extension;
export function loadPuzzleArtwork(extended=false){
 if(!ready)ready=Promise.all(['landscape','props','nature'].map(async key=>[key,key==='landscape'?await load(key):compositePuzzleScreen(await load(key))]))
  .then(entries=>Object.fromEntries(entries)).catch(error=>{ready=null;throw error;});
 if(!extended)return ready;
 if(!extension)extension=load('continuation').catch(error=>{extension=null;throw error;});
 return Promise.all([ready,extension]).then(([art,continuation])=>({...art,continuation}));
}
export function drawPuzzleSprite(g,art,key,x,y,w,h){
 const {sheet,rect}=PUZZLE_SPRITES[key];h??=w*rect[3]/rect[2];
 g.drawImage(art[sheet],...rect,x,y,w,h);
}
let shadow;
export function drawPuzzleShadow(g,x,y,w,h,alpha=.3){
 if(!shadow){shadow=canvas(160,40);const c=shadow.getContext('2d');c.scale(4,1);const r=c.createRadialGradient(20,20,0,20,20,20);r.addColorStop(0,'#344329d9');r.addColorStop(.45,'#34432960');r.addColorStop(1,'#34432900');c.fillStyle=r;c.fillRect(0,0,40,40);}
 g.save();g.globalAlpha=alpha;g.drawImage(shadow,x-w/2,y-h/2,w,h);g.restore();
}
const COLORS=['#dfae51','#5ba4ce','#94b45a','#d88f69','#d8bd81'];
const tiles=new Map();
export function puzzleTile(art,index=0,platform=false){
 const key=`${platform}:${index%COLORS.length}`;if(tiles.has(key))return tiles.get(key);
 const c=canvas(platform?360:240,platform?268:180),g=c.getContext('2d');
 drawPuzzleSprite(g,art,platform?'platform':'piece',0,0,c.width,c.height);
 g.globalCompositeOperation='color';g.globalAlpha=.94;g.fillStyle=COLORS[index%COLORS.length];g.fillRect(0,0,c.width,c.height);
 g.globalAlpha=1;g.globalCompositeOperation='destination-in';drawPuzzleSprite(g,art,platform?'platform':'piece',0,0,c.width,c.height);
 g.globalCompositeOperation='source-over';
 if(platform){g.save();g.beginPath();g.ellipse(176,102,97,58,-.08,0,Math.PI*2);g.clip();drawPuzzleSprite(g,art,'platform',0,0,c.width,c.height);g.restore();}
 tiles.set(key,c);return c;
}
export function drawPuzzlePlatform(c,art,index){
 const d=Math.min(2,globalThis.devicePixelRatio||1);c.width=180*d;c.height=134*d;
 const g=c.getContext('2d');g.scale(d,d);g.drawImage(puzzleTile(art,index,true),0,0,180,134);
}
export function drawPuzzleRoad(canvasElement,art,route){
 const d=Math.min(2,globalThis.devicePixelRatio||1),h=+canvasElement.dataset.worldHeight;
 canvasElement.width=1600*d;canvasElement.height=h*d;
 const g=canvasElement.getContext('2d');g.scale(d,d);
 let distance=0;
 for(let i=1;i<route.length;i++){
  const a=route[i-1],b=route[i],length=Math.hypot(b.x-a.x,b.y-a.y);
  if(b.surface==='bridge'){distance+=length;continue;}
  const steps=Math.max(1,Math.ceil(length/67));
  for(let j=0;j<steps;j++){
   const t=j/steps,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
   drawPuzzleShadow(g,x,y+17,97,23,.2);
   g.drawImage(puzzleTile(art,Math.floor((distance+length*t)/300)),x-55,y-32,110,82);
  }
  distance+=length;
 }
}
