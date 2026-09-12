// Continuous painted ear articulation, with one freshly cleared canvas per frame.
const TAU=Math.PI*2;
function gesture(t,start,duration,period){const p=(((t%period)+period)%period-start)/duration;return p<=0||p>=1?0:Math.sin(Math.PI*p*p*(3-2*p))**2;}
export function rabbitMotion(t){return {
 left:Math.sin(t*1.9)*gesture(t,.7,3.6,8.6)*.13,
 right:Math.sin(t*1.7+.8)*gesture(t,2.2,3.9,10.4)*.10,
 blink:gesture(t,1.5,.34,5.6),rock:Math.sin(t*.95)*.009
};}
const EARS=[
 {name:'left',pivot:[649,415],polygon:[[433,53],[509,51],[590,115],[656,224],[700,342],[711,409],[638,451],[577,411],[499,339],[455,219]]},
 {name:'right',pivot:[794,387],polygon:[[737,382],[736,306],[764,204],[803,96],[831,51],[878,54],[902,137],[900,239],[878,345],[855,404]]}
];
function trace(ctx,poly){poly.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
export function createAutumnRabbit(image){
 const layer=part=>{const c=document.createElement('canvas');c.width=1254;c.height=1254;const x=c.getContext('2d');x.beginPath();if(part)trace(x,part.polygon);else{x.rect(0,0,1254,1254);EARS.forEach(p=>trace(x,p.polygon));}x.clip('evenodd');x.drawImage(image,0,0,1254,1254);return c;};
 const body=layer(),ears=EARS.map(e=>({...e,image:layer(e)}));
 return {paint(canvas,motion){
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();ctx.translate(canvas.width*.5,canvas.height-9);ctx.rotate(motion.rock);ctx.scale(.26,.26);ctx.translate(-649,-1166);
  for(const ear of ears){const [x,y]=ear.pivot;ctx.save();ctx.translate(x,y);ctx.rotate(motion[ear.name]);ctx.drawImage(ear.image,-x,-y);ctx.restore();}
  ctx.drawImage(body,0,0);
  if(motion.blink>.005){for(const [x,y,rx,ry] of [[734,518,32,36],[902,494,10,23]]){
   ctx.save();ctx.beginPath();ctx.ellipse(x,y,rx+3,ry+3,0,0,TAU);ctx.clip();ctx.fillStyle='#efe5da';ctx.fillRect(x-rx-4,y-ry-4,rx*2+8,ry*2+8);
   const h=Math.max(.04,1-motion.blink);ctx.translate(x,y);ctx.scale(1,h);ctx.drawImage(image,x-rx-3,y-ry-3,rx*2+6,ry*2+6,-rx-3,-ry-3,rx*2+6,ry*2+6);ctx.restore();
  }}
  ctx.restore();canvas.dataset.motion=JSON.stringify(motion);
 }};
}
