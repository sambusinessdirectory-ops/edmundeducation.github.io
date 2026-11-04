// Paint a single articulated silhouette each frame; never dissolve whole poses.
const TAU=Math.PI*2;
export function calmGesture(t,start,duration,period){
  const p=(((t%period)+period)%period-start)/duration;
  return p<=0||p>=1?0:Math.sin(Math.PI*p*p*(3-2*p))**2;
}
export function koiMotion(t,index=0){return {
  bend:Math.sin(t*2.2+index*1.8),
  rock:Math.sin(t*1.15+index)*.025,
  blink:calmGesture(t+index*1.17,1.2,.4,5.9+index*.37)
};}
export function koiRoute(t,fish){
  const a=fish.phase+fish.direction*t*TAU/fish.period;
  // Elliptical loops turn continuously in the plane of the water. No reflections.
  return {x:fish.x+Math.cos(a)*fish.rx,y:fish.y+Math.sin(a)*fish.ry,
    heading:Math.atan2(Math.cos(a)*fish.ry*fish.direction,-Math.sin(a)*fish.rx*fish.direction)};
}
export function lotusAngle(t,index){return (index%2?-1:1)*(t*TAU/(94+index*13))+index*.73;}
export function catMotion(t){return {
  tail:Math.sin(t*2.25)*calmGesture(t,.8,4.5,10.8)*.16,
  breath:Math.sin(t*TAU/5.7)*.009
};}

export function createKoiRig(image,eyes){
  const source=document.createElement('canvas');source.width=480;source.height=320;
  const brush=source.getContext('2d');
  const bent=document.createElement('canvas');bent.width=480;bent.height=360;
  const mesh=bent.getContext('2d');
  return {paint(canvas,motion){
    brush.clearRect(0,0,480,320);brush.drawImage(image,0,0,480,320);
    if(motion.blink>.005)for(const [x,y,rx,ry] of eyes){
      const s=480/image.width,X=x*s,Y=y*s,RX=rx*s,RY=ry*s;
      brush.save();brush.beginPath();brush.ellipse(X,Y,RX+1,RY+1,0,0,TAU);brush.clip();
      brush.fillStyle='#e6d8b9';brush.fillRect(X-RX-2,Y-RY-2,RX*2+4,RY*2+4);
      brush.translate(X,Y);brush.scale(1,Math.max(.035,1-motion.blink));
      brush.drawImage(image,x-rx,y-ry,rx*2,ry*2,-RX,-RY,RX*2,RY*2);brush.restore();
    }
    const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(motion.rock);
    const size=(canvas.width-18)/480;
    // Join strips on integer pixel boundaries before scaling/rotation. Fractional
    // destination strips leave fine alpha seams in otherwise smooth painted fish.
    mesh.clearRect(0,0,480,360);
    for(let x=0;x<480;x+=2){
      const rear=Math.max(0,(405-x)/405),sway=motion.bend*rear*rear*15;
      mesh.drawImage(source,x,0,2,320,x,20+sway,2,320);
    }
    ctx.drawImage(bent,-240*size,-180*size,480*size,360*size);
    ctx.restore();canvas.dataset.motion=JSON.stringify(motion);
  }};
}

export function createSleepingCat(image){
  const tail=document.createElement('canvas'),body=document.createElement('canvas');
  tail.width=body.width=image.width;tail.height=body.height=image.height;
  // The short bobtail is outside the rear silhouette and rotates around its base.
  const polygon=[[7,556],[115,540],[187,574],[233,650],[237,743],[207,829],[125,844],[34,799],[0,695]];
  const trace=ctx=>{polygon.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();};
  for(const [c,inverse] of [[tail,false],[body,true]]){
    const ctx=c.getContext('2d');ctx.beginPath();if(inverse)ctx.rect(0,0,c.width,c.height);trace(ctx);ctx.clip('evenodd');ctx.drawImage(image,0,0);
  }
  return {paint(canvas,motion){
    const ctx=canvas.getContext('2d'),s=(canvas.width-16)/1536;ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();ctx.translate(8,canvas.height-6);ctx.scale(s,s);ctx.translate(0,-915);
    ctx.save();ctx.translate(204,692);ctx.rotate(motion.tail);ctx.drawImage(tail,-204,-692);ctx.restore();
    ctx.translate(760,887);ctx.scale(1,1+motion.breath);ctx.drawImage(body,-760,-887);
    ctx.restore();canvas.dataset.motion=JSON.stringify(motion);
  }};
}
