const ART=new URL('./assets/common-expression-rhetorical-writing/blueprint/v1/',import.meta.url);
export const BLUEPRINT_SPRITES={
 lamp:{rect:[18,15,532,410],pivot:[498,58],mouth:[134,342]},
 platform:{rect:[572,84,412,354]},
 square:{rect:[1049,43,450,416]},
 paper:{rect:[41,486,444,493]},
 compass:{rect:[623,466,297,494],pivot:[7,482]},
 pencil:{rect:[1047,505,463,441],pivot:[5,435]}
};
function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
const load=key=>new Promise((resolve,reject)=>{const image=new Image();image.decoding='async';image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(`Blueprint artwork unavailable: ${key}`));image.src=new URL(key+'.webp',ART).href;});
// The original masters remain RGB. Cache chroma compositing once, preserving
// fine brass details and open spaces in the divider and set square.
function removeScreen(image){
 const c=canvas(image.naturalWidth,image.naturalHeight),g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);
 const pixels=g.getImageData(0,0,c.width,c.height),d=pixels.data;
 for(let i=0;i<d.length;i+=4){
  const excess=Math.max(0,Math.min(d[i],d[i+2])-d[i+1]),a=Math.max(0,Math.min(1,(135-excess)/110));
  if(!a){d[i]=d[i+1]=d[i+2]=d[i+3]=0;continue;}
  if(a<1){d[i]=Math.max(0,(d[i]-(1-a)*255)/a);d[i+1]=Math.min(255,d[i+1]/a);d[i+2]=Math.max(0,(d[i+2]-(1-a)*255)/a);}
  if(excess>5){const spill=Math.max(0,Math.min(d[i],d[i+2])-d[i+1]);d[i]-=spill;d[i+2]-=spill;}
  d[i+3]=Math.round(a*255);
 }
 g.putImageData(pixels,0,0);return c;
}
let ready;
export function loadBlueprintArtwork(){
 return ready ||= Promise.all([load('blueprint'),load('tools')]).then(([background,tools])=>({background,tools:removeScreen(tools)})).catch(e=>{ready=null;throw e;});
}
export function drawBlueprintSprite(g,art,name,x,y,w,h){const r=BLUEPRINT_SPRITES[name].rect;g.drawImage(art.tools,...r,x,y,w,h??w*r[3]/r[2]);}
export function paintBlueprintPlatform(c,art){const d=Math.min(2,devicePixelRatio||1);c.width=120*d;c.height=103*d;const g=c.getContext('2d');g.scale(d,d);drawBlueprintSprite(g,art,'platform',0,0,120,103);}
export function blueprintInkMask(art,w,h){
 const c=canvas(w,h),g=c.getContext('2d',{willReadFrequently:true});g.drawImage(art.background,0,0,w,h);
 const pixels=g.getImageData(0,0,w,h),d=pixels.data;
 for(let i=0;i<d.length;i+=4)d[i+3]=d[i]>85&&d[i]/d[i+1]>.7?Math.min(255,(d[i]-85)*2.5):0;
 g.putImageData(pixels,0,0);return c;
}
