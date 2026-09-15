const ART='./assets/common-expression-business/poker/';
export const POKER_TOP=3600;
export const POKER_COLORS=['white','red','blue','green','black'];
export function pokerPositions(){return Array.from({length:30},(_,i)=>{const row=Math.floor(i/6),col=row%2?5-i%6:i%6,plaque=i%6===5;return {order:i+91,x:355+col*181,y:POKER_TOP+490+row*115,color:POKER_COLORS[i%5],kind:plaque?'plaque':'chip',sprite:plaque?5+(row%3):i%5};});}
// Small coupled slosh modes keep the mean surface level fixed while opposite sides rise/fall.
export function liquidTilt(seconds,phase=0){return Math.sin(seconds*.9+phase)*2.8+Math.sin(seconds*1.8+phase)*.55;}
let prepared;
async function image(url){const img=new Image();img.src=url;await img.decode();return img;}
export function preparePoker(){return prepared ||= Promise.all([image(ART+'table-v1.jpg'),image(ART+'counters-v1.png')]).then(([background,atlas])=>{
 const source=document.createElement('canvas');source.width=atlas.width;source.height=atlas.height;const ctx=source.getContext('2d',{willReadFrequently:true});ctx.drawImage(atlas,0,0);const counters=[];
 for(let i=0;i<8;i++){const x0=Math.floor((i%4)*atlas.width/4),y0=Math.floor(Math.floor(i/4)*atlas.height/2),w=Math.floor(atlas.width/4),h=Math.floor(atlas.height/2),pixels=ctx.getImageData(x0,y0,w,h).data;let l=w,r=0,t=h,b=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>80){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  const c=document.createElement('canvas');c.width=r-l+1;c.height=b-t+1;c.getContext('2d').drawImage(source,x0+l,y0+t,c.width,c.height,0,0,c.width,c.height);counters.push(c.toDataURL());
 }
 return {background,counters};
}).catch(e=>{prepared=null;throw e;});}
export function pokerTerrain(){return `<section class="poker-realm" style="top:${POKER_TOP}px" aria-label="皇家牌桌，平台 91 至 120"><img class="poker-background" src="${ART}table-v1.jpg" width="1600" height="1200" draggable="false" alt="綠色牌桌、五色籌碼堆及牌匾，Vesper Martini 與威士忌"><canvas class="poker-liquid" width="1600" height="1200" aria-hidden="true"></canvas>${pokerPositions().map(p=>`<button class="poker-platform" type="button" data-poker-platform="${p.order}" data-counter-kind="${p.kind}" data-counter-color="${p.color}" data-counter-tone="${p.sprite===0||p.sprite===5?'dark':'light'}" style="left:${p.x}px;top:${p.y-POKER_TOP}px" aria-label="平台 ${p.order}，課題準備中"><img class="poker-counter" data-counter-sprite="${p.sprite}" alt="" draggable="false"><span>${p.order}</span><small>課題準備中</small></button>`).join('')}</section>`;}
export function mountPoker(root,reduced){const canvas=root.querySelector('.poker-liquid'),ctx=canvas.getContext('2d');let ready,dead=false,last=0,elapsed=0,painted=-1;
 preparePoker().then(v=>{if(!dead){ready=v;root.querySelectorAll('.poker-counter').forEach(img=>img.src=v.counters[Number(img.dataset.counterSprite)]);render(0);}});
 // Paths are calibrated in native background coordinates; glass rims, stems and bases never move.
 const martini=new Path2D('M205 115 L360 115 L309 184 Q293 205 278 190 Z');
 const whiskey=new Path2D('M1157 167 Q1154 198 1140 230 Q1119 276 1158 297 Q1186 310 1217 289 Q1243 269 1228 230 Q1212 194 1210 166 Z');
 function drink(path,cx,level,halfWidth,bottom,tilt,type){
  ctx.save();ctx.clip(path);const left=cx-halfWidth,right=cx+halfWidth;
  const surface=new Path2D();surface.moveTo(left,level-tilt);surface.bezierCurveTo(cx-halfWidth*.3,level-tilt*.35+.8,cx+halfWidth*.3,level+tilt*.35-.8,right,level+tilt);surface.lineTo(right,bottom);surface.lineTo(left,bottom);surface.closePath();
  const fill=ctx.createLinearGradient(0,level,0,bottom);if(type==='martini'){fill.addColorStop(0,'rgba(235,228,160,.35)');fill.addColorStop(1,'rgba(207,207,125,.2)');}else{fill.addColorStop(0,'rgba(203,101,12,.64)');fill.addColorStop(.6,'rgba(156,63,4,.55)');fill.addColorStop(1,'rgba(103,39,2,.43)');}ctx.fillStyle=fill;ctx.fill(surface);
  ctx.save();ctx.clip(surface);ctx.globalCompositeOperation='screen';ctx.globalAlpha=.3;ctx.drawImage(ready.background,0,0);ctx.restore();
  ctx.strokeStyle=type==='martini'?'rgba(255,248,209,.66)':'rgba(255,199,99,.7)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(left,level-tilt);ctx.bezierCurveTo(cx-halfWidth*.3,level-tilt*.35+.8,cx+halfWidth*.3,level+tilt*.35-.8,right,level+tilt);ctx.stroke();
  // Small meniscus/refraction highlights move with the fluid, not with the glass.
  ctx.globalAlpha=.2;ctx.strokeStyle='#fff6d9';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(cx,level+1,halfWidth*.78,2.4,tilt/(halfWidth*2),0,Math.PI*2);ctx.stroke();ctx.restore();
 }
 function render(seconds){if(!ready||dead)return;ctx.clearRect(0,0,1600,1200);ctx.save();ctx.scale(1600/ready.background.width,1200/ready.background.height);drink(martini,285,143,95,205,liquidTilt(seconds),'martini');drink(whiskey,1184,245,65,310,liquidTilt(seconds,1.3),'whiskey');ctx.restore();canvas.dataset.seconds=seconds.toFixed(2);}
 return {draw(time){if(last)elapsed+=Math.min(80,time-last)/1000;last=time;if(time-painted<32&&!reduced.matches)return;painted=time;render(reduced.matches?0:elapsed);},destroy(){dead=true;ready=null;canvas.width=canvas.height=0;}};
}
