const ART='./assets/idiom-system/paper/v2/';
export const PAPER_SPRITES={
  pine:{sheet:'plants',rect:[45,12,455,601]},round:{sheet:'plants',rect:[533,58,477,548]},
  tealPine:{sheet:'plants',rect:[1067,10,441,605]},bush:{sheet:'plants',rect:[19,650,491,334]},
  tealBush:{sheet:'plants',rect:[545,633,473,350]},sprout:{sheet:'plants',rect:[1055,619,456,369]},
  ivoryBoat:{sheet:'props',rect:[45,71,438,540]},blueBoat:{sheet:'props',rect:[528,76,446,540]},
  rotor:{sheet:'props',rect:[1005,53,502,534],anchor:[1254,315]},
  cloud:{sheet:'props',rect:[19,659,519,294]},smallCloud:{sheet:'props',rect:[577,700,420,231]},
  platform:{sheet:'props',rect:[1034,682,451,250]},
  body:{sheet:'bird',rect:[29,230,679,459],clip:[[35,343],[75,276],[170,235],[311,395],[471,496],[661,398],[687,475],[704,519],[697,590],[655,680],[485,608],[394,651],[232,664],[94,480],[75,369]]},farWing:{sheet:'bird',rect:[582,108,617,602],clip:[[590,115],[1009,289],[1198,545],[1198,704],[1100,664],[869,597],[715,301]]},nearWing:{sheet:'bird',rect:[1298,107,557,604]},
  redFlag:{sheet:'flags',rect:[139,301,543,377]},goldFlag:{sheet:'flags',rect:[866,301,551,380]}
};
let ready;
const load=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(`Paper artwork failed: ${src}`));image.src=src;});
// The generated masters stay intact. This is a cached runtime chroma composite,
// just as a video renderer removes its chroma screen before scene placement.
function compositeScreen(image) {
  const c=document.createElement('canvas');c.width=image.naturalWidth;c.height=image.naturalHeight;
  const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(image,0,0);
  const pixels=g.getImageData(0,0,c.width,c.height),d=pixels.data;
  for(let i=0;i<d.length;i+=4){
    const excess=Math.max(0,Math.min(d[i],d[i+2])-d[i+1]);
    const a=Math.max(0,Math.min(1,(130-excess)/105));
    if(a===0){d[i]=d[i+1]=d[i+2]=d[i+3]=0;continue;}
    if(a<1){d[i]=Math.max(0,(d[i]-(1-a)*255)/a);d[i+1]=Math.min(255,d[i+1]/a);d[i+2]=Math.max(0,(d[i+2]-(1-a)*255)/a);}
    // Remove residual screen spill from a narrow antialiased edge only.
    if(excess>8){const spill=Math.max(0,Math.min(d[i],d[i+2])-d[i+1]-8);d[i]-=spill;d[i+2]-=spill;}
    d[i+3]=Math.round(a*255);
  }
  g.putImageData(pixels,0,0);return c;
}
export function loadPaperArtwork(){
  if(!ready)ready=Promise.all(['plants','props','bird','flags','landscape','foreground'].map(async key=>[key,key==='landscape'||key==='foreground'?await load(ART+key+'.webp'):compositeScreen(await load(ART+key+'.webp'))])).then(items=>Object.fromEntries(items));
  return ready;
}
export function drawPaperSprite(g,art,key,x,y,w,h){const {sheet,rect,clip}=PAPER_SPRITES[key];h??=w*rect[3]/rect[2];g.save();if(clip){g.beginPath();clip.forEach(([px,py],i)=>{const dx=x+(px-rect[0])*w/rect[2],dy=y+(py-rect[1])*h/rect[3];i?g.lineTo(dx,dy):g.moveTo(dx,dy);});g.closePath();g.clip();}g.drawImage(art[sheet],...rect,x,y,w,h);g.restore();}
export function drawPaperPlatform(canvas,art){const d=Math.min(2,globalThis.devicePixelRatio||1);canvas.width=180*d;canvas.height=96*d;const g=canvas.getContext('2d');g.scale(d,d);g.clearRect(0,0,180,96);g.save();g.filter='blur(4px)';g.fillStyle='#40503738';g.beginPath();g.ellipse(91,82,72,8,0,0,Math.PI*2);g.fill();g.restore();drawPaperSprite(g,art,'platform',5,0,170,92);}

let shadow;export function drawPaperShadow(g,x,y,w,h,opacity=.3){if(!shadow){shadow=document.createElement('canvas');shadow.width=128;shadow.height=32;const c=shadow.getContext('2d');c.scale(4,1);const r=c.createRadialGradient(16,16,0,16,16,16);r.addColorStop(0,'#263d2eef');r.addColorStop(.5,'#263d2e70');r.addColorStop(1,'#263d2e00');c.fillStyle=r;c.fillRect(0,0,32,32);}g.save();g.globalAlpha=opacity;g.drawImage(shadow,x-w/2,y-h/2,w,h);g.restore();}
