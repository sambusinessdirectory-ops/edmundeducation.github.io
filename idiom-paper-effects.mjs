import {PAPER_FLAGS,PAPER_MILL,PAPER_BOATS,PAPER_CLOUDS,PAPER_PIGEON,PAPER_WATER,paperPlants,paperPoint} from './idiom-paper-geometry.mjs?v=20260913-paper4';
import {paperBoatMotion,paperCloudMotion,paperPlantMotion,paperMillMotion,paperFlagMotion,paperPigeonMotion} from './idiom-paper-motion.mjs?v=20260913-paper4';
import {loadPaperArtwork,drawPaperSprite,drawPaperShadow,PAPER_SPRITES} from './idiom-paper-artwork.mjs?v=20260913-paper4';
function oval(g,x,y,rx,ry,color){g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fillStyle=color;g.fill();}
function drawFlag(g,art,f,m,i){
 const {sheet,rect:[sx,sy,sw,sh]}=PAPER_SPRITES[i%2?'goldFlag':'redFlag'];
 const strips=28,w=f.width,h=f.height;
 for(let j=0;j<strips;j++){
  const u=j/strips,dy=u*5*Math.sin(u*4.5+m.wave*1.5),fold=1+.08*u*m.fold;
  g.drawImage(art[sheet],sx+j*sw/strips,sy,sw/strips+1,sh,f.x+j*w/strips,f.y+dy,w/strips+.6,h*fold);
 }
}
function drawMill(g,art,angle){
 const r=PAPER_MILL.radius,{rect,anchor}=PAPER_SPRITES.rotor;
 g.save();g.translate(PAPER_MILL.x,PAPER_MILL.y);g.rotate(angle);
 const s=2*r/Math.max(rect[2],rect[3]);
 drawPaperSprite(g,art,'rotor',-(anchor[0]-rect[0])*s,-(anchor[1]-rect[1])*s,rect[2]*s,rect[3]*s);g.restore();
}
function drawBoat(g,art,b,m){
 g.save();g.translate(m.x,m.y);g.rotate(m.roll);
 drawPaperShadow(g,0,1,120*b.size,16*b.size,.33);
 const w=120*b.size,h=148*b.size;
 drawPaperSprite(g,art,b.color==='blue'?'blueBoat':'ivoryBoat',-w/2,-h+5,w,h);
 // Small water contacts stay under the hull rather than painting a ground shadow.
 g.strokeStyle='#ddf1dfb0';g.lineWidth=1.3;g.beginPath();g.ellipse(0,3,w*.51,7,0,.12,Math.PI*.93);g.stroke();g.restore();
}
function drawPigeon(g,art,p,m){
 const facing=m.velocity<0?1:-1,turn=.72+.28*Math.min(1,Math.abs(m.velocity)/13.86);
 g.save();g.translate(m.x,m.y);g.scale((facing<0?-1:1)*turn,p.size);
 // Roots overlap the shoulder; the textured paper never opens a neck/wing slit.
 g.save();g.translate(-6,22);g.rotate(-.16+.47*m.flap);drawPaperSprite(g,art,'farWing',-108,-103,113,110);g.restore();
 drawPaperSprite(g,art,'body',-48,-16,97,65);
 g.save();g.translate(-7,23);g.rotate(.13-.53*m.flap);drawPaperSprite(g,art,'nearWing',-4,-116,105,114);g.restore();
 g.restore();
}
export function createPaperEffects(canvas,nodes){
 const ratio=Math.min(2,globalThis.devicePixelRatio||1);canvas.width=1600*ratio;canvas.height=1950*ratio;
 const g=canvas.getContext('2d');if(!g)return null;
 const plants=paperPlants(nodes),water=new Path2D();for(const poly of PAPER_WATER){poly.forEach((p,i)=>i?water.lineTo(p.x,p.y):water.moveTo(p.x,p.y));water.closePath();}
 const fixedStructures=new Path2D();fixedStructures.rect(0,0,1600,1950);
 for(const [x,y,w,h]of [[545,264,320,101],[873,513,465,190]]){const p=paperPoint([x,y]),e=paperPoint([x+w,y+h]);fixedStructures.rect(p.x,p.y,e.x-p.x,e.y-p.y);}
 let art=null,disposed=false,lastTime=0;
 function paint(t){
  lastTime=t;if(disposed||!art)return;
  g.setTransform(ratio,0,0,ratio,0,0);g.clearRect(0,0,1600,1950);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  // Animate the detailed paper-water surface itself. Banks and bridges stay fixed.
  g.save();g.clip(water);g.clip(fixedStructures,'evenodd');g.globalAlpha=.83;
  for(let y=290;y<720;y+=7){const dx=Math.sin(t*.48+y*.018)*2.1,dy=Math.sin(t*.56+y*.012)*.8;g.drawImage(art.landscape,0,y/900*941,1672,8/900*941,dx,y+dy,1600,8);}
  g.restore();
  const clouds=PAPER_CLOUDS.map(c=>paperCloudMotion(t,c));PAPER_CLOUDS.forEach((c,i)=>{const h=c.width*(i?231/420:294/519);g.save();drawPaperSprite(g,art,i?'smallCloud':'cloud',clouds[i].x-c.width/2,clouds[i].y-h*.57,c.width,h);g.restore();});
  const angles=plants.map(p=>paperPlantMotion(t,p));
  plants.forEach((p,i)=>{
   const {rect,root}=PAPER_SPRITES[p.kind],tree=p.kind.includes('ine')||p.kind==='round';
   // Contact and sway use the visible root, excluding the atlas's clear padding.
   drawPaperShadow(g,p.x+3,p.y+1,p.w*.8,Math.max(8,p.h*.075),.27);
   drawPaperShadow(g,p.x,p.y+.5,p.w*(tree?.25:.75),tree?5:7,.44);
   g.save();g.translate(p.x,p.y);g.rotate(angles[i]);
   drawPaperSprite(g,art,p.kind,-p.w*root[0]/rect[2],-p.h*root[1]/rect[3],p.w,p.h);g.restore();
  });
  const flags=PAPER_FLAGS.map(f=>paperFlagMotion(t,f));PAPER_FLAGS.forEach((f,i)=>drawFlag(g,art,f,flags[i],i));
  const mill=paperMillMotion(t);drawMill(g,art,mill);
  const boats=PAPER_BOATS.map(b=>paperBoatMotion(t,b));PAPER_BOATS.forEach((b,i)=>drawBoat(g,art,b,boats[i]));
  const pigeon=paperPigeonMotion(t,PAPER_PIGEON);drawPigeon(g,art,PAPER_PIGEON,pigeon);
  canvas.dataset.time=t.toFixed(3);canvas.dataset.ready='true';canvas.dataset.motion=JSON.stringify({mill,flags,boats,clouds,plants:angles,pigeon});
 }
 const ready=loadPaperArtwork().then(result=>{if(!disposed){art=result;paint(lastTime);}}).catch(e=>{canvas.dataset.error=e.message;});
 return {paint,plants,ready,destroy(){disposed=true;art=null;canvas.width=canvas.height=1;}};
}
