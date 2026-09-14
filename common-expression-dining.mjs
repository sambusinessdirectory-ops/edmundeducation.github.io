import {drawHotSteam} from './common-expression-steam.mjs?v=20260915-dining1';
const ART='./assets/common-expression-business/dining/';
export const DINING_TOP=2400;
export function diningPositions(){return Array.from({length:30},(_,i)=>{const row=Math.floor(i/6),col=row%2?5-i%6:i%6;return {order:i+61,x:400+col*186,y:DINING_TOP+610+row*92};});}
export function diningTravel(seconds,width){return ((seconds%210)+210)%210/210*width;}
let prepared;
async function image(url){const img=new Image();img.src=url;await img.decode();return img;}
export function prepareDining(){
 return prepared ||= Promise.all([image(ART+'table-v1.jpg'),image(ART+'moonlit-lake-v1.jpg'),image(ART+'rose-v1.png'),image(ART+'tableware-v1.png'),image(ART+'plate-napkin-v2.png'),image(ART+'plate-single-v1.png')]).then(([background,landscape,rose,tableware,cleanPlate,singlePlate])=>{
  const raw=document.createElement('canvas');raw.height=300;raw.width=1400;raw.getContext('2d').drawImage(landscape,0,0,1400,300);
  const overlap=230,period=raw.width-overlap,tile=document.createElement('canvas');tile.width=period;tile.height=300;const ctx=tile.getContext('2d');ctx.drawImage(raw,0,0);
  const seam=document.createElement('canvas');seam.width=overlap;seam.height=300;const sc=seam.getContext('2d');sc.drawImage(raw,period,0,overlap,300,0,0,overlap,300);sc.globalCompositeOperation='destination-in';const fade=sc.createLinearGradient(0,0,overlap,0);fade.addColorStop(0,'#000');fade.addColorStop(1,'#0000');sc.fillStyle=fade;sc.fillRect(0,0,overlap,300);ctx.drawImage(seam,0,0);
  const rc=document.createElement('canvas');rc.width=rose.width;rc.height=rose.height;const rctx=rc.getContext('2d',{willReadFrequently:true});rctx.drawImage(rose,0,0);const data=rctx.getImageData(0,0,rc.width,rc.height).data;let l=rc.width,r=0,t=rc.height,b=0;
  for(let y=0;y<rc.height;y++)for(let x=0;x<rc.width;x++)if(data[(y*rc.width+x)*4+3]>80){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}
  const atlas=document.createElement('canvas');atlas.width=tableware.width;atlas.height=tableware.height;const ac=atlas.getContext('2d',{willReadFrequently:true});ac.drawImage(tableware,0,0);const parts=[];
  // This generated atlas has a wide place setting, cloche, then a narrow flute.
  for(const [left,right] of [[0,.42],[.42,.8],[.8,1]]){const x0=Math.floor(left*atlas.width),sw=Math.floor(right*atlas.width)-x0,pixels=ac.getImageData(x0,0,sw,atlas.height).data;let l=sw,r=0,t=atlas.height,b=0;for(let y=0;y<atlas.height;y++)for(let x=0;x<sw;x++)if(pixels[(y*sw+x)*4+3]>80){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}const part=document.createElement('canvas');part.width=r-l+1;part.height=b-t+1;part.getContext('2d').drawImage(atlas,x0+l,t,part.width,part.height,0,0,part.width,part.height);parts.push(part);}
  function cropSetting(plate){const pc=document.createElement('canvas');pc.width=plate.width;pc.height=plate.height;const pctx=pc.getContext('2d',{willReadFrequently:true});pctx.drawImage(plate,0,0);const pd=pctx.getImageData(0,0,pc.width,pc.height).data;let pl=pc.width,pr=0,pt=pc.height,pb=0;
  for(let y=0;y<pc.height;y++)for(let x=0;x<pc.width;x++)if(pd[(y*pc.width+x)*4+3]>80){pl=Math.min(pl,x);pr=Math.max(pr,x);pt=Math.min(pt,y);pb=Math.max(pb,y);}
  const setting=document.createElement('canvas');setting.width=pr-pl+1;setting.height=pb-pt+1;setting.getContext('2d').drawImage(pc,pl,pt,setting.width,setting.height,0,0,setting.width,setting.height);return setting.toDataURL();}
  return {background,tile,rose,roseRect:[l,t,r-l+1,b-t+1],parts,placeSettings:{single:cropSetting(singlePlate),double:cropSetting(cleanPlate)}};
 }).catch(e=>{prepared=null;throw e;});
}
export function diningTerrain(){return `<section class="dining-carriage" style="top:${DINING_TOP}px" aria-label="月夜餐車，平台 61 至 90"><img class="dining-background" src="${ART}table-v1.jpg" width="1600" height="1200" draggable="false" alt="月夜豪華列車餐桌，紅酒、熱湯與咖啡"><canvas class="dining-motion" width="1600" height="1200" aria-hidden="true"></canvas>${diningPositions().map(p=>`<button type="button" class="dining-platform" data-dining-platform="${p.order}" style="left:${p.x}px;top:${p.y-DINING_TOP}px" aria-label="平台 ${p.order}，課題準備中"><img class="dining-place-setting" data-fold="${p.order%2?'single':'double'}" alt="" draggable="false"><span>${p.order}</span><small>課題準備中</small></button>`).join('')}</section>`;}
export function mountDining(root,reduced){
 const canvas=root.querySelector('.dining-motion'),ctx=canvas.getContext('2d');let ready,dead=false,last=0,elapsed=0,painted=-1;
 const windowPath=new Path2D();windowPath.roundRect(273,10,1058,288,42);
 prepareDining().then(v=>{if(!dead){ready=v;root.querySelectorAll('.dining-place-setting').forEach(img=>img.src=v.placeSettings[img.dataset.fold]);render(0);}});
 function render(seconds){if(!ready||dead)return;ctx.clearRect(0,0,1600,1200);
  ctx.save();ctx.clip(windowPath);const shift=diningTravel(seconds,ready.tile.width);for(let x=-shift;x<1600;x+=ready.tile.width)ctx.drawImage(ready.tile,x,0);
  // A distant moon stays steady while the closer landscape travels past the train.
  const glow=ctx.createRadialGradient(1167,61,8,1167,61,39);glow.addColorStop(0,'rgba(255,243,200,.3)');glow.addColorStop(1,'rgba(255,243,200,0)');ctx.fillStyle=glow;ctx.fillRect(1128,22,78,78);
  const moon=ctx.createRadialGradient(1162,55,1,1167,61,17);moon.addColorStop(0,'#fff7d9');moon.addColorStop(1,'#d5d7c3');ctx.fillStyle=moon;ctx.beginPath();ctx.arc(1167,61,16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#a5adac45';for(const [dx,dy,r] of [[-5,2,3],[4,-5,4],[6,6,2],[-3,-8,2]]){ctx.beginPath();ctx.arc(1167+dx,61+dy,r,0,Math.PI*2);ctx.fill();}ctx.restore();
  // Stem bottom is fixed inside the vase mouth; only the flower leans.
  ctx.save();ctx.translate(319,418);ctx.rotate(reduced.matches?0:Math.sin(seconds*.8)*.047);ctx.filter='brightness(.79) saturate(.86)';const rect=ready.roseRect,h=191,w=h*rect[2]/rect[3];ctx.drawImage(ready.rose,...rect,-w*.555,-h,w,h);ctx.restore();
  // Front lip of the painted vase occludes the inserted stem tip.
  ctx.drawImage(ready.background,270,379,39,12,270/1448*1600,379/1086*1200,39/1448*1600,12/1086*1200);
  // Broad soft cast shadows and tight contact shadows ground the serving pieces on linen.
  for(const [x,y,rx,ry,a] of [[762,554,115,13,.22],[762,551,97,5,.25],[978,557,41,10,.17],[978,554,30,4,.22]]){ctx.save();ctx.translate(x,y);ctx.scale(rx,ry);const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(49,30,15,${a})`);g.addColorStop(1,'rgba(49,30,15,0)');ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();}
  ctx.save();ctx.filter='saturate(.75) brightness(.93)';ctx.drawImage(ready.parts[1],650,409,220,150);ctx.restore();ctx.drawImage(ready.parts[2],944,330,68,235);
  if(!reduced.matches){ctx.save();ctx.beginPath();ctx.moveTo(955,385);ctx.quadraticCurveTo(954,445,977,461);ctx.quadraticCurveTo(1000,445,999,385);ctx.closePath();ctx.clip();for(let i=0;i<19;i++){const phase=(seconds/4.8+i/19)%1,x=977+Math.sin(i*2.3+seconds*.8)*15,y=461-phase*76;ctx.strokeStyle=`rgba(255,249,213,${.25+.4*Math.sin(Math.PI*phase)})`;ctx.lineWidth=.8;ctx.beginPath();ctx.arc(x,y,.8+(i%3)*.4,0,Math.PI*2);ctx.stroke();}ctx.restore();}
  if(!reduced.matches){drawHotSteam(ctx,seconds,{x:1230,y:493,width:87,height:162});drawHotSteam(ctx,seconds+2,{x:111,y:723,width:63,height:147});}
  canvas.dataset.seconds=seconds.toFixed(2);canvas.dataset.travel=shift.toFixed(3);
 }
 return {draw(time){if(last)elapsed+=Math.min(80,time-last)/1000;last=time;if(time-painted<32&&!reduced.matches)return;painted=time;render(reduced.matches?0:elapsed);},destroy(){dead=true;ready=null;canvas.width=canvas.height=0;}};
}
