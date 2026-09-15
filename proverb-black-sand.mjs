import {createShoreWildlife,perchedGullMotion,flyingGullMotion} from './sentence-structure-shore-wildlife.mjs?v=20260912-sentence2';
const ART='./assets/proverb-black-sand/',SHORE='./assets/sentence-structure/coast/';
export const BLACK_SAND_LAYOUT={startX:340,columnGap:185,rowYs:[680,930,1190,1450,1710]};
export function blackSandPositions(){return Array.from({length:30},(_,i)=>{const row=Math.floor(i/6),col=row%2?5-i%6:i%6;return {order:i+1,x:340+col*185,y:BLACK_SAND_LAYOUT.rowYs[row]};});}
export const STARFISH=[{x:135,y:916,r:24},{x:1500,y:1370,r:23}];
export function starfishMotion(t,index){return {x:Math.sin(t*.23+index)*7,y:Math.sin(t*.19+index*2)*4,angle:Math.sin(t*.17+index)*.13};}
export const BLACK_SEA='M0 310H1290L1290 343L1210 357L1170 377L1320 374L1320 402L1420 404L1380 442L1460 463L1330 485L1170 511L1020 533L830 560L640 589L440 618L330 623L320 570L235 532L175 475L60 429L0 422Z';
const POOLS=['M0 862L100 845L275 859L311 884L266 953L183 984L31 977L0 955Z','M1470 1301L1550 1269L1600 1274V1450L1527 1442L1447 1400L1437 1355Z'];
let prepared;
async function image(url){const img=new Image();img.src=url;await img.decode();return img;}
export function prepareBlackSand(){return prepared ||= Promise.all([image(ART+'background-v1.jpg'),image(SHORE+'clouds.webp'),image(SHORE+'wildlife.webp'),image(ART+'starfish-v2.png')]).then(([source,clouds,wildlife,starfish])=>{const background=document.createElement('canvas');background.width=1600;background.height=1950;background.getContext('2d').drawImage(source,0,0,1600,1950);return {background,clouds,starfish,rig:createShoreWildlife(wildlife)};}).catch(e=>{prepared=null;throw e;});}
function shell(){return `<img class="black-shell" src="${ART}shell-v2.png" width="150" height="120" alt="" aria-hidden="true" draggable="false">`;}
function terrain(nodes,lessons){return `<div class="black-scenery"><img class="black-background" src="${ART}background-v1.jpg" width="1600" height="1950" alt="夕陽下的黑沙海岸、玄武岩海拱、燈塔與潮池"><canvas class="black-motion" width="1600" height="1950" aria-hidden="true"></canvas><div class="black-shore-title"><strong>黑沙海岸</strong><span>Black-Sand Coast</span></div></div>${blackSandPositions().slice(lessons.length).map(p=>`<button type="button" class="expression-map-stone black-reserved" data-black-reserved="${p.order}" style="left:${p.x}px;top:${p.y}px" aria-label="平台 ${p.order}，課題準備中">${shell()}<span class="expression-map-stone-number">${String(p.order).padStart(2,'0')}</span><span class="expression-map-stone-caption">課題準備中<small>Coming soon</small></span></button>`).join('')}`;}
function mount(root,reduced,controls){const canvas=root.querySelector('.black-motion'),ctx=canvas.getContext('2d'),events=new AbortController();let ready,dead=false,last=0,t=0,painted=-1;
 root.querySelectorAll('[data-map-level]').forEach(el=>el.insertAdjacentHTML('afterbegin',shell()));root.querySelector('.expression-map-heading small').textContent='3 個課題已開放 · 30 個海岸平台';
 const viewport=root.querySelector('.expression-map-viewport');viewport.setAttribute('aria-label','黑沙海岸，第 1 至 30 平台；3 個課題已開放。');for(const type of ['selectstart','dragstart'])viewport.addEventListener(type,e=>e.preventDefault(),{signal:events.signal});
 const note=document.createElement('div');note.className='black-reservation-note';note.hidden=true;root.querySelector('.expression-map-stage').append(note);
 root.addEventListener('click',e=>{const b=e.target.closest('[data-black-reserved]');if(b){e.stopImmediatePropagation();const p=blackSandPositions().find(p=>p.order===Number(b.dataset.blackReserved));note.textContent=`平台 ${p.order} · 課題準備中`;note.hidden=false;controls.explore(p,{walk:true});}else if(e.target.closest('[data-map-level]'))note.hidden=true;},{capture:true,signal:events.signal});
 const flyers=Array.from({length:3},()=>{const c=document.createElement('canvas');c.width=360;c.height=340;return c;});
 const gulls=[document.createElement('canvas'),document.createElement('canvas')];gulls.forEach(c=>{c.width=360;c.height=340;});
 prepareBlackSand().then(a=>{if(!dead){ready=a;render(0);}});
 // Each water region has its own coordinates; no ripples are scattered onto dry sand.
 function water(path,time,poolIndex=-1){
  const pool=poolIndex>=0,box=pool?(poolIndex===0?[0,845,312,140]:[1435,1268,165,183]):[0,310,1480,315];
  const [bx,by,bw,bh]=box;ctx.save();ctx.clip(new Path2D(path));
  // Advect narrow bands with a continuous wave field so the painted surf itself rolls.
  ctx.globalAlpha=.82;
  for(let y=by;y<by+bh;y+=4){const depth=(y-by)/bh,dx=Math.sin(y*.055-time*1.35)*(pool?3:5),dy=Math.sin(y*.034-time*1.55)*(pool?1.8:2+depth*3);
   ctx.drawImage(ready.background,bx,y,bw,4,bx+dx,y+dy,bw,5);
  }
  ctx.globalAlpha=1;ctx.lineCap='round';
  if(pool){
   for(let i=0;i<9;i++){const phase=(time*.12+i/9)%1,cx=bx+bw*(.2+(i%3)*.29),cy=by+bh*(.28+(i%2)*.38),rx=12+phase*60;
    ctx.beginPath();ctx.ellipse(cx,cy,rx,rx*.25,Math.sin(i)*.08,.15,Math.PI*1.7);
    ctx.strokeStyle=`rgba(211,255,248,${Math.sin(phase*Math.PI)*.34})`;ctx.lineWidth=1.3;ctx.stroke();
   }
  }else{
   for(let row=0;row<7;row++){const phase=(time*.11+row/7)%1,y=325+phase*275;
    for(let k=0;k<12;k++){const x=k*130+Math.sin(row*4)*45;ctx.beginPath();
     for(let n=0;n<=16;n++){const xx=x+n*6,yy=y+Math.sin(xx*.016+row)*7+Math.sin(xx*.067-time*.9)*2;n?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}
     ctx.strokeStyle=`rgba(237,255,252,${Math.sin(phase*Math.PI)*(.12+phase*.32)})`;ctx.lineWidth=1+phase*2.4;ctx.stroke();
    }
   }
  }ctx.restore();
 }
 function star(p,i,time){const m=starfishMotion(time,i),size=p.r*2.6;ctx.save();ctx.translate(p.x+m.x,p.y+m.y);ctx.rotate(m.angle);ctx.globalAlpha=.9;
  // Continuous strip deformation bends the organic arms without separating their skin.
  const img=ready.starfish,step=img.height/28;
  for(let y=0;y<img.height;y+=step){const v=y/img.height,flex=Math.sin(v*Math.PI*2+time*.8+i)*1.25;
   ctx.drawImage(img,0,y,img.width,Math.min(step+1,img.height-y),-size/2+flex,-size/2+v*size,size,size/28+.5);
  }
  ctx.restore();
 }
 function render(time){if(!ready||dead)return;ctx.clearRect(0,0,1600,1950);water(BLACK_SEA,time);POOLS.forEach((p,i)=>water(p,time,i));
  [[69,76,1389,284,190,35,390,85],[319,400,858,318,850,35,270,100],[151,779,1217,190,1120,145,300,55]].forEach(([sx,sy,sw,sh,x,y,w,h],i)=>{ctx.save();ctx.globalAlpha=.54;ctx.drawImage(ready.clouds,sx,sy,sw,sh,x+Math.sin(time*.028+i)*60,y,w,h);ctx.restore();});
  flyers.forEach((c,i)=>{const phase=(time*.014+i*.32)%1,x=1670-phase*1800,y=155+i*43+Math.sin(time*.3+i)*15;ready.rig.paint(c,'fly',flyingGullMotion(time+i*2.4),.38);const size=86-i*13;ctx.drawImage(c,x-size/2,y-size*.75,size,size*.94);});
  STARFISH.forEach((p,i)=>star(p,i,time));[[210,570],[1450,595]].forEach(([x,y],i)=>{ready.rig.paint(gulls[i],'perch',perchedGullMotion(time+i*5.3),.35);ctx.save();ctx.translate(x,y);if(i===0)ctx.scale(-1,1);ctx.drawImage(gulls[i],-90,-170,180,170);ctx.restore();});canvas.dataset.seconds=time.toFixed(2);
 }
 return {draw(now){if(last)t+=Math.min(80,Math.max(0,now-last))/1000;last=now;if(now-painted<32&&!reduced.matches)return;painted=now;render(reduced.matches?0:t);},destroy(){dead=true;ready=null;events.abort();note.remove();canvas.width=canvas.height=0;}};
}
const floor=p=>({x:Math.min(1340,Math.max(300,p.x)),y:Math.min(1830,Math.max(650,p.y))});
export const PROVERB_BLACK_SAND=Object.freeze({id:'proverb-black-sand',title:'諺語黑沙海岸之旅',kicker:'THE BLACK-SAND COAST',width:1600,height:1950,layout:BLACK_SAND_LAYOUT,positions:lessons=>blackSandPositions().slice(0,lessons.length).map((p,i)=>({...p,id:lessons[i].id})),terrain,mount,minimumZoom:.5,fitOverview:true,cameraTop:({point,scale,height,overview})=>overview?0:point.y<750?0:point.y*scale-height*.45,navigation:{path:(_a,b)=>[floor(b)],step:(_a,b)=>floor(b)}});
