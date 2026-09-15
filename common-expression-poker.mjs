const ART='./assets/common-expression-business/poker/';
export const POKER_TOP=3600;
export const POKER_COLORS=['white','red','blue','green','black'];
export function pokerPositions(){return Array.from({length:30},(_,i)=>{const row=Math.floor(i/6),col=row%2?5-i%6:i%6,plaque=i%6===5;return {order:i+91,x:355+col*181,y:POKER_TOP+490+row*115,color:POKER_COLORS[i%5],kind:plaque?'plaque':'chip',sprite:plaque?5+(row%3):i%5};});}
// Small coupled slosh modes keep the mean surface level fixed while opposite sides rise/fall.
export function liquidTilt(seconds,phase=0){return Math.sin(seconds*.9+phase)*2.8+Math.sin(seconds*1.8+phase)*.55;}

export function liquidSurface(type,seconds){
 const martini=type==='martini';
 return {cx:martini?285:1184,cy:martini?145:245,rx:martini?52:43,ry:martini?12:10,bottom:martini?195:299,tilt:liquidTilt(seconds,martini?0:1.3)*.48};
}
let prepared;
async function image(url){const img=new Image();img.src=url;await img.decode();return img;}
export function preparePoker(){return prepared ||= Promise.all([image(ART+'table-v1.jpg'),image(ART+'counters-v1.png'),image(ART+'green-chip-cap-v1.png')]).then(([background,atlas,cap])=>{
 const source=document.createElement('canvas');source.width=atlas.width;source.height=atlas.height;const ctx=source.getContext('2d',{willReadFrequently:true});ctx.drawImage(atlas,0,0);const counters=[];
 for(let i=0;i<8;i++){const x0=Math.floor((i%4)*atlas.width/4),y0=Math.floor(Math.floor(i/4)*atlas.height/2),w=Math.floor(atlas.width/4),h=Math.floor(atlas.height/2),pixels=ctx.getImageData(x0,y0,w,h).data;let l=w,r=0,t=h,b=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>80){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  const c=document.createElement('canvas');c.width=r-l+1;c.height=b-t+1;c.getContext('2d').drawImage(source,x0+l,y0+t,c.width,c.height,0,0,c.width,c.height);counters.push(c.toDataURL());
 }
 return {background,counters,cap};
}).catch(e=>{prepared=null;throw e;});}
export function pokerTerrain(){return `<section class="poker-realm" style="top:${POKER_TOP}px" aria-label="皇家牌桌，平台 91 至 120"><img class="poker-background" src="${ART}table-v1.jpg" width="1600" height="1200" draggable="false" alt="綠色牌桌、五色籌碼堆及牌匾，Vesper Martini 與威士忌"><canvas class="poker-liquid" width="1600" height="1200" aria-hidden="true"></canvas>${pokerPositions().map(p=>`<button class="poker-platform" type="button" data-poker-platform="${p.order}" data-counter-kind="${p.kind}" data-counter-color="${p.color}" data-counter-tone="${p.sprite===0||p.sprite===5?'dark':'light'}" style="left:${p.x}px;top:${p.y-POKER_TOP}px" aria-label="平台 ${p.order}，課題準備中"><img class="poker-counter" data-counter-sprite="${p.sprite}" alt="" draggable="false"><span>${p.order}</span><small>課題準備中</small></button>`).join('')}</section>`;}
export function mountPoker(root,reduced){const canvas=root.querySelector('.poker-liquid'),ctx=canvas.getContext('2d');let ready,dead=false,last=0,elapsed=0,painted=-1;
 preparePoker().then(v=>{if(!dead){ready=v;root.querySelectorAll('.poker-counter').forEach(img=>img.src=v.counters[Number(img.dataset.counterSprite)]);render(0);}});
 // Paths are calibrated in native background coordinates; glass rims, stems and bases never move.
 const martini=new Path2D('M205 115 L360 115 L309 184 Q293 205 278 190 Z');
 const whiskey=new Path2D('M1157 167 Q1154 198 1140 230 Q1119 276 1158 297 Q1186 310 1217 289 Q1243 269 1228 230 Q1212 194 1210 166 Z');
 function drink(path,type,seconds){
  const {cx,cy,rx,ry,bottom,tilt}=liquidSurface(type,seconds),martini=type==='martini';
  ctx.save();ctx.clip(path);
  // A single sheared plane gives opposite contact-line heights without moving the glass.
  ctx.translate(cx,cy);ctx.transform(1,tilt/rx,0,1,0,0);
  const volume=new Path2D();volume.moveTo(-rx,0);volume.ellipse(0,0,rx,ry,0,Math.PI,0,true);
  if(martini){volume.quadraticCurveTo(rx*.42,bottom-cy-8,5,bottom-cy);volume.quadraticCurveTo(-8,bottom-cy+3,-rx,0);}
  else{volume.bezierCurveTo(rx+9,31,rx*.55,bottom-cy,0,bottom-cy);volume.bezierCurveTo(-rx*.8,bottom-cy,-rx-10,30,-rx,0);}
  volume.closePath();
  const fill=ctx.createLinearGradient(0,-ry,0,bottom-cy);
  fill.addColorStop(0,martini?'rgba(235,235,211,.26)':'rgba(226,133,28,.64)');
  fill.addColorStop(1,martini?'rgba(197,207,186,.14)':'rgba(116,44,5,.48)');ctx.fillStyle=fill;ctx.fill(volume);
  ctx.save();ctx.clip(volume);
  // Refraction caustics bend independently inside the stationary tapered volume.
  for(let i=0;i<4;i++){const x=Math.sin(seconds*.55+i*1.8)*rx*.5;
   ctx.strokeStyle=martini?'rgba(252,255,237,.12)':'rgba(255,204,105,.16)';ctx.lineWidth=2+i*.5;ctx.beginPath();ctx.moveTo(x,-ry);ctx.bezierCurveTo(x+Math.sin(seconds+i)*9,12,x*.35-8,28,x*.15,bottom-cy);ctx.stroke();}
  ctx.restore();
  const surface=new Path2D();surface.ellipse(0,0,rx,ry,0,0,Math.PI*2);
  const sheen=ctx.createLinearGradient(0,-ry,0,ry);sheen.addColorStop(0,martini?'rgba(247,248,223,.18)':'rgba(255,183,70,.25)');sheen.addColorStop(.65,martini?'rgba(224,234,217,.34)':'rgba(205,110,22,.35)');sheen.addColorStop(1,'rgba(255,239,198,.2)');ctx.fillStyle=sheen;ctx.fill(surface);
  // A fine raised meniscus describes the complete ellipse, with a softer rear edge.
  ctx.lineWidth=.8;ctx.strokeStyle='rgba(255,248,219,.25)';ctx.stroke(surface);
  ctx.beginPath();ctx.ellipse(0,-.35,rx,ry,0,0,Math.PI);ctx.strokeStyle='rgba(255,249,222,.48)';ctx.stroke();
  ctx.save();ctx.clip(surface);
  for(let i=0;i<3;i++){const angle=seconds*.42+i*2.1,front=(Math.sin(angle)+1)/2;
   ctx.beginPath();ctx.ellipse(0,0,rx*(.78+i*.05),ry*(.65+i*.1),0,angle,angle+.32+front*.25);
   ctx.strokeStyle=`rgba(255,255,236,${.14+front*.2})`;ctx.lineWidth=.55+front*1.2;ctx.stroke();}
  ctx.restore();ctx.restore();
 }
 function render(seconds){if(!ready||dead)return;ctx.clearRect(0,0,1600,1200);ctx.save();ctx.scale(1600/ready.background.width,1200/ready.background.height);
  ctx.drawImage(ready.cap,193,133,1151,760,1376,728,80,43);
  drink(martini,'martini',seconds);drink(whiskey,'whiskey',seconds);ctx.restore();canvas.dataset.seconds=seconds.toFixed(2);}

 return {draw(time){if(last)elapsed+=Math.min(80,time-last)/1000;last=time;if(time-painted<32&&!reduced.matches)return;painted=time;render(reduced.matches?0:elapsed);},destroy(){dead=true;ready=null;canvas.width=canvas.height=0;}};
}
