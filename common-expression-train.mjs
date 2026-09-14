// Reserved Business Speaking platforms 31–60. No lesson content or records are fabricated.
const ART='./assets/common-expression-business/train/';
export const TRAIN_TOP=1200;
const W=1600,H=1200;
let prepared;
export function trainPositions(){return Array.from({length:30},(_,i)=>{const row=Math.floor(i/6),col=row%2?5-i%6:i%6;const left=row===0?520:row===1?420:210,right=1330;return {order:i+31,x:left+(right-left)*col/5,y:TRAIN_TOP+560+row*135};});}
export const TRAIN_WINDOWS=Object.freeze({large:{left:37,top:19,right:480,bottom:410},small:{left:1180,top:65,right:1256,bottom:255}});
export function trainTravel(seconds,width){return ((seconds%180)+180)%180/180*width;}
const image=async url=>{const img=new Image();img.src=url;await img.decode();return img;};
export async function prepareTrain(){
  if(prepared)return prepared;
  prepared=Promise.all([image(ART+'carriage-v1.jpg'),image(ART+'winter-panorama-v1.jpg'),image(ART+'curtains-v1.png')]).then(([background,landscape,atlas])=>{
    // The overlap is blended once into a periodic strip, so the 180-second wrap has no cut.
    const height=410,width=Math.round(landscape.width/landscape.height*height),overlap=Math.round(width*.17),period=width-overlap;
    const raw=document.createElement('canvas');raw.width=width;raw.height=height;raw.getContext('2d').drawImage(landscape,0,0,width,height);
    const tile=document.createElement('canvas');tile.width=period;tile.height=height;const tc=tile.getContext('2d');tc.drawImage(raw,0,0);
    const seam=document.createElement('canvas');seam.width=overlap;seam.height=height;const sc=seam.getContext('2d');sc.drawImage(raw,period,0,overlap,height,0,0,overlap,height);sc.globalCompositeOperation='destination-in';const fade=sc.createLinearGradient(0,0,overlap,0);fade.addColorStop(0,'#000');fade.addColorStop(1,'#0000');sc.fillStyle=fade;sc.fillRect(0,0,overlap,height);tc.drawImage(seam,0,0);
    const source=document.createElement('canvas');source.width=atlas.width;source.height=atlas.height;const ac=source.getContext('2d',{willReadFrequently:true});ac.drawImage(atlas,0,0);const curtains=[];
    for(let i=0;i<2;i++){const x=Math.floor(atlas.width*i/2),w=Math.floor(atlas.width/2),h=atlas.height,data=ac.getImageData(x,0,w,h).data;let l=w,r=0,t=h,b=0;for(let y=0;y<h;y++)for(let xx=0;xx<w;xx++)if(data[(y*w+xx)*4+3]>80){l=Math.min(l,xx);r=Math.max(r,xx);t=Math.min(t,y);b=Math.max(b,y);}const c=document.createElement('canvas');c.width=r-l+1;c.height=b-t+1;c.getContext('2d').drawImage(source,x+l,t,c.width,c.height,0,0,c.width,c.height);curtains.push(c);}
    return {background,tile,curtains};
  }).catch(e=>{prepared=null;throw e;});return prepared;
}
export function trainTerrain(){
  const nodes=trainPositions();
  const route=nodes.map((p,i)=>{const y=p.y-TRAIN_TOP;if(!i)return `M${p.x} ${y}`;const a=nodes[i-1],ay=a.y-TRAIN_TOP;return Math.floor(i/6)!==Math.floor((i-1)/6)?`C${a.x+(a.x>800?70:-70)} ${ay+55} ${p.x+(p.x>800?70:-70)} ${y-55} ${p.x} ${y}`:`L${p.x} ${y}`;}).join(' ');
  return `<section class="train-carriage" aria-label="豪華臥鋪列車，平台 31 至 60" style="top:${TRAIN_TOP}px"><img class="train-background" src="${ART}carriage-v1.jpg" width="1600" height="1200" alt="暖光木製臥鋪車廂，窗外是冬季湖泊與山景"><canvas class="train-motion" width="1600" height="1200" aria-hidden="true"></canvas><svg class="train-runner" viewBox="0 0 1600 1200" aria-hidden="true"><path d="${route}" fill="none" stroke="#09070acc" stroke-width="70" stroke-linejoin="round" stroke-linecap="round" transform="translate(0 7)"/><path d="${route}" fill="none" stroke="#b38b50" stroke-width="67" stroke-linejoin="round" stroke-linecap="round"/><path d="${route}" fill="none" stroke="#6b2430" stroke-width="61" stroke-linejoin="round" stroke-linecap="round"/><path d="${route}" fill="none" stroke="#d2b77788" stroke-width="1" stroke-dasharray="2 7"/></svg>${nodes.map(p=>`<button type="button" class="train-platform" data-train-platform="${p.order}" style="left:${p.x}px;top:${p.y-TRAIN_TOP}px" aria-label="平台 ${p.order}，課題準備中"><span>${p.order}</span><small>課題準備中</small></button>`).join('')}</section>`;
}
export function mountTrain(root,reduced){
  const canvas=root.querySelector('.train-motion'),ctx=canvas.getContext('2d');let ready,dead=false,elapsed=0,last=0,painted=-1;
  const big=new Path2D('M69 19 C48 15 37 30 37 58 L37 378 Q38 410 71 402 L452 339 Q480 332 480 295 L480 102 Q478 80 454 74 Z');
  // Preserve the foreground brass lampshade where it overlaps the window.
  const lampCut=new Path2D();lampCut.rect(0,0,W,H);lampCut.addPath(new Path2D('M121 398 C119 363 142 339 177 335 L177 326 Q181 320 185 326 L185 335 C221 337 244 363 246 391 L241 401 Z'));
  const small=new Path2D();small.roundRect(1180,65,76,190,18);
  prepareTrain().then(v=>{if(!dead){ready=v;render(0);}});
  function halo(x,y,r,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,196,104,${a})`);g.addColorStop(1,'rgba(255,180,78,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
  function render(seconds){
    if(!ready||dead)return;ctx.clearRect(0,0,W,H);const shift=trainTravel(seconds,ready.tile.width);
    for(const path of [big,small]){ctx.save();ctx.clip(path);if(path===big)ctx.clip(lampCut,'evenodd');for(let x=-shift;x<W;x+=ready.tile.width)ctx.drawImage(ready.tile,x,0);
      // Small blurred streaks and mist, never large decorative snowflake symbols.
      ctx.save();ctx.filter='blur(1.4px)';for(let i=0;i<65;i++){const x=((i*173.7-seconds*9)%W+W)%W,y=(i*67.3+seconds*6)%410;ctx.fillStyle=`rgba(230,240,255,${.09+(i%4)*.025})`;ctx.beginPath();ctx.ellipse(x,y,1.1+(i%3)*.45,2.1,0,0,Math.PI*2);ctx.fill();}ctx.restore();ctx.fillStyle=`rgba(192,211,232,${.025+.012*Math.sin(seconds*.2)})`;ctx.fillRect(0,0,W,410);ctx.restore();}
    const pulse=reduced.matches?.13:.10+.06*Math.sin(seconds*.55);
    ctx.save();ctx.globalCompositeOperation='screen';halo(182,388,90,pulse);halo(1364,105,56,pulse*.8);halo(580,30,37,pulse*.7);halo(580,243,35,pulse*.6);ctx.restore();
    for(const [index,x,y,h,flip] of [[0,-20,-8,445,false],[0,505,42,330,true],[1,1080,23,330,false]]){
      const s=ready.curtains[index],w=h*s.width/s.height,angle=reduced.matches?0:Math.sin(seconds*.65+x)*.008;
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(flip?-1:1,1);ctx.shadowColor='#100a0790';ctx.shadowBlur=6;ctx.shadowOffsetX=4;ctx.filter='brightness(.77) saturate(.8)';ctx.drawImage(s,-w/2,0,w,h);ctx.restore();
    }
    // Wisps grow from the coffee rim, fade upward and disperse before the window.
    if(!reduced.matches){for(let i=0;i<3;i++){const phase=(seconds/7+i/3)%1,height=34+phase*45,drift=Math.sin(seconds*.7+i)*7;ctx.save();ctx.filter='blur(2.4px)';const g=ctx.createLinearGradient(0,433,0,433-height);g.addColorStop(0,'rgba(242,232,212,0)');g.addColorStop(.25,`rgba(242,232,212,${.12*Math.sin(Math.PI*phase)})`);g.addColorStop(1,'rgba(242,232,212,0)');ctx.strokeStyle=g;ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(270+i*3,433);ctx.bezierCurveTo(263+drift,420,283-drift,409-height*.3,270+drift,433-height);ctx.stroke();ctx.restore();}}
    canvas.dataset.seconds=seconds.toFixed(2);canvas.dataset.travel=shift.toFixed(3);
  }
  return {draw(time){if(last)elapsed+=Math.min(80,time-last)/1000;last=time;if(time-painted<32&&!reduced.matches)return;painted=time;render(reduced.matches?0:elapsed);},destroy(){dead=true;ready=null;canvas.width=canvas.height=0;}};
}
