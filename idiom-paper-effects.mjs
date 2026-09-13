import {PAPER_FLAGS,PAPER_MILL,PAPER_BOATS,PAPER_CLOUDS,PAPER_PIGEON,PAPER_WATER,paperSeed,paperPlants,paperInWater} from './idiom-paper-geometry.mjs?v=20260913-paper1';
import {paperBoatMotion,paperCloudMotion,paperPlantMotion,paperMillMotion,paperFlagMotion,paperPigeonMotion} from './idiom-paper-motion.mjs?v=20260913-paper1';

function polygon(ctx,points,fill,stroke) {
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=.8;ctx.stroke();}
}
function line(ctx,points,color,width=1) {
  ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
}
function oval(ctx,x,y,rx,ry,color) {ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
function paperTexture() {
  const c=document.createElement('canvas');c.width=c.height=192;const g=c.getContext('2d'),rand=paperSeed(9761);
  for(let i=0;i<700;i++){
    const x=rand()*192,y=rand()*192;
    line(g,[[x,y],[x+1+rand()*3,y+rand()*1.5]],i%2?'rgba(255,255,235,.17)':'rgba(48,45,26,.07)',.5);
  }
  return c;
}
const PALETTES=[['#517962','#2d574c','#789371'],['#7e934e','#566e3d','#a3ad69'],['#3f806e','#2c6159','#6b9a80'],['#96a756','#6e8748','#b4bb74']];
function plantSprite(kind,palette,texture) {
  const c=document.createElement('canvas');c.width=220;c.height=260;const g=c.getContext('2d');g.translate(110,244);
  const [mid,dark,light]=PALETTES[palette];
  polygon(g,[[-5,0],[-6,-105],[6,-105],[7,0]],'#886743','#72563c');
  if(kind==='pine') {
    polygon(g,[[0,-231],[-76,-28],[64,-40]],dark,'#3c5e49');
    polygon(g,[[0,-231],[-76,-28],[-7,-53]],mid);
    polygon(g,[[0,-231],[-7,-53],[22,-37]],light);
    polygon(g,[[0,-231],[22,-37],[64,-40]],dark);
    line(g,[[0,-225],[-7,-53]],'#afba89',1.2);
  } else if(kind==='round') {
    const pts=[[-2,-226],[-35,-218],[-51,-187],[-67,-168],[-64,-131],[-74,-106],[-57,-73],[-37,-54],[0,-46],[43,-61],[61,-92],[62,-122],[52,-146],[52,-184],[27,-218]];
    polygon(g,pts,mid,'#516d4a');
    polygon(g,[[-2,-226],[-15,-166],[-3,-106],[0,-46],[43,-61],[61,-92],[62,-122],[52,-146],[52,-184],[27,-218]],dark);
    polygon(g,[[-2,-226],[-35,-218],[-51,-187],[-15,-166]],light);
    polygon(g,[[-15,-166],[-64,-131],[-74,-106],[-57,-73],[-3,-106]],light);
    line(g,[[0,-222],[-15,-166],[-3,-106],[0,0]],'#b0b77b',1.3);
    line(g,[[-3,-106],[-41,-135]],'#8da575',1.1);line(g,[[-8,-146],[31,-171]],'#79905e',1.1);
  } else if(kind==='bush') {
    const pts=[[-104,-7],[-102,-92],[-73,-135],[-38,-137],[-20,-213],[18,-235],[53,-210],[69,-151],[99,-132],[109,-70],[98,-5]];
    polygon(g,pts,mid,'#5b7446');
    polygon(g,[[-20,-213],[18,-235],[9,-20],[-14,-5]],light);
    polygon(g,[[18,-235],[53,-210],[69,-151],[28,-9],[9,-20]],dark);
    polygon(g,[[-73,-135],[-65,-7],[-102,-9],[-102,-92]],light);
    polygon(g,[[69,-151],[99,-132],[109,-70],[98,-5],[63,-9]],dark);
    line(g,[[18,-225],[9,-20],[13,0]],'#b5be82',1.8);
  } else {
    polygon(g,[[-5,0],[-52,-73],[-93,-203],[-42,-180],[0,-37]],mid);
    polygon(g,[[0,-37],[23,-227],[69,-244],[52,-142],[8,0]],dark);
    polygon(g,[[12,-15],[75,-113],[107,-133],[73,-57],[24,0]],light);
    line(g,[[-87,-195],[-14,-49],[-4,0]],light,2);line(g,[[64,-234],[15,-38]],mid,2);
  }
  // Texture is clipped to the existing cardstock; it never creates a rectangle.
  g.resetTransform();g.globalCompositeOperation='source-atop';g.fillStyle=g.createPattern(texture,'repeat');g.fillRect(0,0,220,260);
  return c;
}
function drawCloud(g,c,m,texture) {
  g.save();g.translate(m.x,m.y);const s=c.width/210;g.scale(s,s);
  const cloud=new Path2D('M-100 24C-119 7-106-15-86-14C-91-42-63-57-39-43C-28-79 23-76 35-43C63-56 85-35 81-14C109-17 119 5 107 23C94 41 77 35 56 36H-70C-84 38-92 33-100 24Z');
  g.save();g.translate(3,4);g.fillStyle='#a6926840';g.fill(cloud);g.restore();
  g.fillStyle='#efe7d3';g.fill(cloud);g.strokeStyle='#d0bea0';g.lineWidth=1.8;g.stroke(cloud);
  g.save();g.clip(cloud);g.fillStyle=g.createPattern(texture,'repeat');g.fillRect(-125,-90,260,145);g.restore();
  g.setLineDash([3,5]);g.strokeStyle='#c9b894';g.lineWidth=.85;g.scale(.93,.88);g.stroke(cloud);g.restore();
}
function drawFlag(g,f,m) {
  g.save();g.translate(f.x,f.y+3);const w=f.width,h=f.height;
  const top=[],bottom=[];
  for(let i=0;i<=12;i++){const u=i/12,dy=u*5.5*Math.sin(u*4.2+m.wave);top.push([u*w,dy]);bottom.unshift([u*w,h+dy+u*m.fold*2]);}
  const points=[...top,[w-8,h*.5+5*m.wave],...bottom];
  polygon(g,points,'#be663d','#934925');
  g.save();g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.clip();
  g.fillStyle='rgba(250,186,105,.3)';g.fillRect(w*(.35+m.fold*.06),-10,w*.22,h+25);g.restore();
  line(g,[[0,0],[0,h]],'#efb883',1);g.restore();
}
function drawMill(g,angle) {
  const {x,y,radius:r}=PAPER_MILL;g.save();g.translate(x,y);g.rotate(angle);
  for(let i=0;i<4;i++){
    g.save();g.rotate(i*Math.PI/2);
    polygon(g,[[-6,4],[-5,-r],[7,-r],[7,6]],'#89603e','#6a4d34');
    polygon(g,[[-5,-26],[-26,-33],[-23,-r+3],[-5,-r]],'#ca8a52','#956238');
    polygon(g,[[-24,-34],[-24,-r+6],[-19,-r+3],[-19,-31]],'#e4b479');
    for(let j=0;j<4;j++)line(g,[[-22,-42-j*12],[-5,-37-j*13]],'#a16d43',1.6);
    line(g,[[2,-r+2],[2,-12]],'#dfab73',1.5);g.restore();
  }
  oval(g,0,0,12,12,'#624b37');oval(g,-1,-1,7,7,'#ab8757');oval(g,-2,-2,2.5,2.5,'#e4c58a');g.restore();
}
function drawBoat(g,b,m) {
  g.save();g.translate(m.x,m.y);g.scale(b.size,b.size);g.rotate(m.roll);
  g.beginPath();g.ellipse(0,11,66,11,0,.12,Math.PI*1.95);g.strokeStyle='#d8ede1a8';g.lineWidth=2;g.stroke();
  polygon(g,[[-57,-1],[62,-7],[37,13],[-33,15]],'#a47549','#6d5034');
  polygon(g,[[-57,-1],[3,-12],[62,-7],[4,2]],'#d2ae77');
  polygon(g,[[-33,15],[37,13],[4,2]],'#826044');
  line(g,[[4,-113],[4,3]],'#7e6647',3);
  const blue=b.color==='blue';
  polygon(g,[[1,-113],[-47,-15],[1,-4]],blue?'#467f90':'#eadfc2',blue?'#336579':'#ad9f7e');
  polygon(g,[[1,-113],[-14,-20],[1,-4]],blue?'#76a4a9':'#faf1dc');
  polygon(g,[[8,-95],[47,-9],[8,-5]],blue?'#245767':'#cbbc99');
  polygon(g,[[8,-95],[20,-24],[47,-9]],blue?'#397384':'#eee2c6');
  line(g,[[1,-108],[-14,-20],[1,-4]],blue?'#a5c4c2':'#fff8e9',1);g.restore();
}
function drawPigeon(g,p,m) {
  g.save();g.translate(m.x,m.y);g.scale(p.size,p.size);
  const facing=-Math.sign(m.yaw||1),turn=.48+.52*Math.abs(Math.sin(m.yaw));
  g.scale(facing*turn,1);
  // Broad folded faces remain visible throughout each hinge rotation.
  polygon(g,[[14,2],[53,25],[37,44],[5,15]],'#cbb58a','#ab9874');
  polygon(g,[[14,2],[53,25],[29,24]],'#f2e3bc');
  const wing=(root,angle,points,fold,light,dark)=>{
    g.save();g.translate(...root);g.rotate(angle);
    polygon(g,points,light,'#b6a078');polygon(g,fold,dark);
    line(g,[[0,0],points[1]],'#fff3d2',1.2);g.restore();
  };
  wing([4,-5],-.18+.5*m.flap,[[0,0],[82,-80],[39,-13],[22,7]],[[0,0],[82,-80],[26,-27]],'#ddc391','#bfa16b');
  polygon(g,[[-36,3],[-14,-13],[20,-3],[3,18],[-19,22]],'#eee0b8','#b49c70');
  polygon(g,[[-36,3],[-19,22],[-13,5]],'#d1b782');
  wing([-8,-3],.08-.57*m.flap,[[0,0],[-81,-61],[-28,-62],[19,-7]],[[0,0],[-81,-61],[-21,-37]],'#f8edcd','#dfc89a');
  polygon(g,[[-35,3],[-45,12],[-31,14]],'#b99959');oval(g,-29,6,1.8,1.8,'#4b4332');
  g.restore();
}

export function createPaperEffects(canvas,nodes) {
  const g=canvas.getContext('2d');if(!g) return null;
  const texture=paperTexture(),plants=paperPlants(nodes),sprites=new Map(),random=paperSeed(73221);
  const water=new Path2D();
  for(const poly of PAPER_WATER){poly.forEach((p,i)=>i?water.lineTo(p.x,p.y):water.moveTo(p.x,p.y));water.closePath();}
  const waves=[];
  for(let i=0;i<3000&&waves.length<65;i++){
    const x=random()*1600,y=340+random()*730,w=24+random()*52;
    if(paperInWater({x,y})&&paperInWater({x:x+w,y}))waves.push({x,y,w,phase:random()*Math.PI*2});
  }
  for(const p of plants){const key=p.kind+p.palette;if(!sprites.has(key))sprites.set(key,plantSprite(p.kind,p.palette,texture));}
  function paint(t) {
    g.clearRect(0,0,canvas.width,canvas.height);
    g.save();g.clip(water);g.strokeStyle='#d6ece4';g.lineWidth=1.7;g.globalAlpha=.62;
    for(const w of waves){const x=w.x+Math.sin(t*.6+w.phase)*7,y=w.y+Math.sin(t*.8+w.phase)*1.4;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+w.w*.24,y+2.8*Math.sin(t*.8+w.phase),x+w.w*.72,y-2.8,x+w.w,y);g.stroke();}
    g.restore();
    const cloudMotion=PAPER_CLOUDS.map(c=>paperCloudMotion(t,c));PAPER_CLOUDS.forEach((c,i)=>drawCloud(g,c,cloudMotion[i],texture));
    const angles=plants.map(p=>paperPlantMotion(t,p));
    plants.forEach((p,i)=>{
      oval(g,p.x+3,p.y+2,p.w*.42,Math.max(3,p.h*.045),'#425d3526');
      g.save();g.translate(p.x,p.y);g.rotate(angles[i]);
      g.drawImage(sprites.get(p.kind+p.palette),0,0,220,260,-p.w/2,-p.h,p.w,p.h*260/244);g.restore();
    });
    const flags=PAPER_FLAGS.map(f=>paperFlagMotion(t,f));PAPER_FLAGS.forEach((f,i)=>drawFlag(g,f,flags[i]));
    const mill=paperMillMotion(t);drawMill(g,mill);
    const boats=PAPER_BOATS.map(b=>paperBoatMotion(t,b));PAPER_BOATS.forEach((b,i)=>drawBoat(g,b,boats[i]));
    const pigeon=paperPigeonMotion(t,PAPER_PIGEON);drawPigeon(g,PAPER_PIGEON,pigeon);
    canvas.dataset.time=t.toFixed(3);canvas.dataset.ready='true';
    canvas.dataset.motion=JSON.stringify({mill,flags,boats,clouds:cloudMotion,plants:angles,pigeon});
  }
  paint(0);
  return {paint,plants,waves,destroy(){sprites.clear();canvas.width=canvas.height=1;}};
}
