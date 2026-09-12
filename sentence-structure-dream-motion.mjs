import {DREAM_RAIL} from './sentence-structure-dream-geometry.mjs?v=20260912-garden-normal';
const TAU=Math.PI*2;
export const dreamBreath=t=>Math.sin(t*TAU/5.8)*.013;
export function trainPose(t,car=0){const a=t*TAU/DREAM_RAIL.period-car*.235;return {x:DREAM_RAIL.x+Math.cos(a)*DREAM_RAIL.rx,y:DREAM_RAIL.y+Math.sin(a)*DREAM_RAIL.ry,angle:a+Math.PI/2};}
export function flagShape(t,index,w,h){const wave=Math.sin(t*.85+index*1.7)*2.1;return `M0 0C${w*.35} ${wave} ${w*.66} ${-wave} ${w} ${wave*.6}L${w*.76} ${h*.5+wave}L${w} ${h+wave*.5}C${w*.65} ${h-wave} ${w*.3} ${h+wave} 0 ${h}Z`;}
export function createDreamTrain(image){
 const source=document.createElement('canvas');source.width=image.width;source.height=image.height;const brush=source.getContext('2d',{willReadFrequently:true});brush.drawImage(image,0,0);
 const bytes=brush.getImageData(0,0,source.width,source.height).data,cell=source.width/3;
 const sides=document.createElement('canvas');sides.width=source.width;sides.height=source.height;
 const sideBrush=sides.getContext('2d');sideBrush.drawImage(image,0,0);sideBrush.globalCompositeOperation='source-in';sideBrush.fillStyle='#98613b';sideBrush.fillRect(0,0,sides.width,sides.height);
 const crops=Array.from({length:3},(_,i)=>{let x0=Math.ceil((i+1)*cell),y0=source.height,x1=0,y1=0;for(let y=0;y<source.height;y++)for(let x=Math.ceil(i*cell);x<Math.floor((i+1)*cell);x++){if(bytes[(y*source.width+x)*4+3]>24){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}}return [x0,y0,x1-x0+1,y1-y0+1];});
 return {paint(canvas,t){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();ctx.scale(2,2);const poses=[];
  for(let i=2;i>=0;i--){const p=trainPose(t,i),crop=crops[i],w=i?31:40,h=w*crop[3]/crop[2];poses[i]=p;
   // The ground plane follows the rails; vertical body height stays upright.
   // Stacked shaded silhouettes give the small wooden cars depth at this low angle.
   const height=i?5:8;
   for(let z=0;z<=height;z++){
    ctx.save();ctx.translate(p.x-DREAM_RAIL.x+215,p.y-DREAM_RAIL.y+88-z);ctx.scale(1,DREAM_RAIL.ry/DREAM_RAIL.rx);ctx.rotate(p.angle);
    ctx.drawImage(z===height?image:sides,...crop,-w/2,-h/2,w,h);ctx.restore();
   }
  }ctx.restore();canvas.dataset.poses=JSON.stringify(poses);
 }};
}
