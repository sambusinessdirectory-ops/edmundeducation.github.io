const ART='./assets/common-expression-business/lounge/';
export const LOUNGE_TOP=6000;
export function loungePositions(){return Array.from({length:30},(_,i)=>{const row=Math.floor(i/6),col=row%2?5-i%6:i%6;return {order:i+151,x:400+col*170,y:LOUNGE_TOP+465+row*133};});}
export const LOUNGE_PLANTS=[{x:120,y:655,h:315},{x:1460,y:765,h:300}];
export function loungeMotion(seconds){const phase=seconds%9;return {bassAngle:Math.sin(seconds*.68)*.018,stringAmplitude:phase<3.6?Math.sin(Math.PI*phase/3.6)*1.35:0};}
let prepared;
async function image(url){const img=new Image();img.src=url;await img.decode();return img;}
export function prepareLounge(){return prepared ||= Promise.all([image(ART+'room-v2.jpg'),image(ART+'sprites-v1.png'),image(ART+'bar-mic-v1.png')]).then(([background,atlas,props])=>{const c=document.createElement('canvas');c.width=atlas.width;c.height=atlas.height;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(atlas,0,0);const sprites={};
 for(const [i,key] of ['bass','plant'].entries()){const x0=i*Math.floor(atlas.width/2),w=Math.floor(atlas.width/2),h=atlas.height,p=ctx.getImageData(x0,0,w,h).data;let l=w,r=0,t=h,b=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(p[(y*w+x)*4+3]>80){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}const s=document.createElement('canvas');s.width=r-l+1;s.height=b-t+1;s.getContext('2d').drawImage(atlas,x0+l,t,s.width,s.height,0,0,s.width,s.height);sprites[key]=s;}
 const pc=document.createElement('canvas');pc.width=props.width;pc.height=props.height;const px=pc.getContext('2d',{willReadFrequently:true});px.drawImage(props,0,0);
 for(const [key,x0,w] of [['mic',0,350]]){const h=props.height,p=px.getImageData(x0,0,w,h).data;let l=w,r=0,t=h,b=0;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(p[(y*w+x)*4+3]>80){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}const s=document.createElement('canvas');s.width=r-l+1;s.height=b-t+1;s.getContext('2d').drawImage(props,x0+l,t,s.width,s.height,0,0,s.width,s.height);sprites[key]=s;}
 return {background,sprites};}).catch(e=>{prepared=null;throw e;});}
export function loungeTerrain(){const nodes=loungePositions(),path=nodes.map((p,i)=>{const y=p.y-LOUNGE_TOP;if(!i)return `M${p.x} ${y}`;const a=nodes[i-1];return a.x===p.x?`C${p.x+(p.x>800?125:-125)} ${a.y-LOUNGE_TOP} ${p.x+(p.x>800?125:-125)} ${y} ${p.x} ${y}`:`L${p.x} ${y}`;}).join(' ');
 return `<section class="lounge-realm" style="top:${LOUNGE_TOP}px" aria-label="爵士密語酒廊，平台 151 至 180"><img class="lounge-background" src="${ART}room-v2.jpg" width="1600" height="1200" draggable="false" alt="暖金燈光、酒紅絨布座椅與三角鋼琴的爵士酒廊"><svg class="lounge-walkway" viewBox="0 0 1600 1200" aria-hidden="true"><path d="${path}" fill="none" stroke="#08090945" stroke-width="3" transform="translate(0 2)"/><path d="${path}" fill="none" stroke="#c9aa6c70" stroke-width="1.4" stroke-dasharray="2 11" stroke-linecap="round"/></svg><canvas class="lounge-motion" width="1600" height="1200" aria-hidden="true"></canvas>${nodes.map(p=>`<button type="button" class="lounge-platform" data-lounge-platform="${p.order}" style="left:${p.x}px;top:${p.y-LOUNGE_TOP}px" aria-label="平台 ${p.order}，課題準備中"><span class="lounge-record"><span class="lounge-record-label">${p.order}</span></span><small>課題準備中</small></button>`).join('')}</section>`;
}
export function mountLounge(root,reduced){const canvas=root.querySelector('.lounge-motion'),ctx=canvas.getContext('2d');let ready,dead=false,elapsed=0,last=0,painted=-1;
 prepareLounge().then(v=>{if(!dead){ready=v;render(0);}});
 function shadow(x,y,w){ctx.save();ctx.translate(x,y);ctx.scale(w,9);const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'#080909aa');g.addColorStop(1,'#08090900');ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();}
 function render(seconds){if(!ready||dead)return;ctx.clearRect(0,0,1600,1200);const motion=loungeMotion(seconds),s=ready.sprites.bass,bh=260,bw=bh*s.width/s.height,bx=830,by=320;
  const mic=ready.sprites.mic;const mh=215,mw=mh*mic.width/mic.height;shadow(715,322,mw*.55);ctx.drawImage(mic,715-mw/2,320-mh,mw,mh);
  shadow(bx,by+2,bw*.45);ctx.save();ctx.translate(bx,by);ctx.rotate(motion.bassAngle);ctx.drawImage(s,-bw/2,-bh,bw,bh);
  // Short plucked-string phrases alternate with a quiet interval in a nine-second loop.
  for(let i=0;i<4;i++){const x=-bw*.09+(i-1.5)*1.65,amp=motion.stringAmplitude*Math.sin(seconds*36+i*.8);ctx.beginPath();ctx.moveTo(x,-bh*.89);ctx.quadraticCurveTo(x-bw*.025+amp,-bh*.62,x-bw*.05,-bh*.38);ctx.strokeStyle=`rgba(235,219,174,${motion.stringAmplitude>0?.47:.2})`;ctx.lineWidth=.65;ctx.stroke();}ctx.restore();
  for(let i=0;i<LOUNGE_PLANTS.length;i++){const p=LOUNGE_PLANTS[i],s=ready.sprites.plant,w=p.h*s.width/s.height,split=.73,sway=Math.sin(seconds*.62+i*1.8)*.034;shadow(p.x,p.y+2,w*.29);ctx.save();ctx.translate(p.x,p.y-p.h*(1-split));ctx.save();ctx.transform(1,0,sway,1,0,0);ctx.drawImage(s,0,0,s.width,s.height*split,-w/2,-p.h*split,w,p.h*split+1);ctx.restore();ctx.drawImage(s,0,s.height*split,s.width,s.height*(1-split),-w/2,0,w,p.h*(1-split));ctx.restore();}
  // Notes rise from the piano and softly fade, staggered so no group pops in at once.
  for(let i=0;i<5;i++){const progress=((seconds+i*1.19)%6)/6,alpha=Math.sin(progress*Math.PI)*.68,x=430+i*18+Math.sin(progress*5+i)*14,y=240-progress*145;ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(progress*4+i)*.12);ctx.fillStyle=`rgba(238,204,134,${alpha})`;ctx.font=`${22+i%2*5}px Georgia`;ctx.fillText(i%2?'♪':'♫',0,0);ctx.restore();}
  canvas.dataset.seconds=seconds.toFixed(2);
 }
 return {draw(time){if(last)elapsed+=Math.min(80,time-last)/1000;last=time;if(time-painted<32&&!reduced.matches)return;painted=time;render(reduced.matches?0:elapsed);},destroy(){dead=true;ready=null;canvas.width=canvas.height=0;}};
}
