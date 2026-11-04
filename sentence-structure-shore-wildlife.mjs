// Painted parts move continuously; each frame contains one opaque animal only.
// No pose dissolves, trailing frames, or mirrored direction changes.
const TAU=Math.PI*2;
const smooth=t=>t*t*(3-2*t);
function gesture(t,start,duration,period) {
  const phase=((t%period)+period)%period;
  const p=(phase-start)/duration;
  return p<=0||p>=1?0:Math.sin(Math.PI*smooth(p))**2;
}
export function flyingGullMotion(t) {
  const effort=.18+.82*gesture(t,1,5.6,10.8);
  return {wing:Math.sin(t*TAU/1.8)*effort,rock:Math.sin(t*.8)*.018};
}
export function perchedGullMotion(t) {
  return {wing:gesture(t,1.2,3.8,12.4),blink:gesture(t,2.1,.3,5.9),rock:Math.sin(t*1.1)*.035};
}
export function crabMotion(t) {
  return {left:gesture(t,.8,3.2,8.7),right:gesture(t,3.7,3,10.3),rock:Math.sin(t*1.23)*.032};
}
// Coordinates belong to the original cleaned 1448 × 1086 wildlife atlas.
const RIGS={
  fly:{rect:[410,765,303,247],anchor:[554,982],parts:[
    {name:'far',pivot:[493,927],polygon:[[400,820],[465,820],[532,893],[537,924],[523,937],[487,924],[400,923]]},
    {name:'wing',pivot:[550,938],polygon:[[520,936],[538,901],[557,867],[585,836],[620,805],[670,777],[713,765],[720,920],[646,948],[591,947],[550,940]]}
  ]},
  perch:{rect:[1092,10,326,378],anchor:[1236,380],parts:[
    {name:'wing',pivot:[1244,244],polygon:[[1205,244],[1235,214],[1243,180],[1231,130],[1234,90],[1300,25],[1408,8],[1420,30],[1420,220],[1343,258],[1250,264]]}
  ]},
  crab:{rect:[30,496,318,197],anchor:[187,683],parts:[
    {name:'left',pivot:[142,618],polygon:[[82,603],[108,600],[130,612],[146,632],[151,659],[153,688],[118,693],[95,676],[82,648],[78,622]]},
    {name:'right',pivot:[232,618],polygon:[[239,607],[260,603],[278,615],[284,638],[273,658],[264,683],[214,691],[215,655],[223,635],[226,619]]}
  ]}
};
function trace(ctx,polygon,x,y) {
  polygon.forEach(([px,py],i)=>i?ctx.lineTo(px-x,py-y):ctx.moveTo(px-x,py-y));ctx.closePath();
}
function layer(image,rig,part) {
  const [x,y,w,h]=rig.rect,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d');ctx.beginPath();
  if(part)trace(ctx,part.polygon,x,y);
  else {ctx.rect(0,0,w,h);rig.parts.forEach(p=>trace(ctx,p.polygon,x,y));}
  ctx.clip('evenodd');ctx.drawImage(image,x,y,w,h,0,0,w,h);return canvas;
}
export function createShoreWildlife(image) {
  const rigs=Object.fromEntries(Object.entries(RIGS).map(([kind,rig])=>[kind,{...rig,body:layer(image,rig),parts:rig.parts.map(p=>({...p,texture:layer(image,rig,p)}))}]));
  // Resting body provides a complete feather silhouette beneath the lifted wing.
  rigs.perch.body=layer(image,{rect:[50,136,312,252],parts:[]});
  rigs.fly.body=layer(image,rigs.fly,{polygon:[[410,945],[441,941],[450,924],[478,911],[498,915],[514,926],[531,935],[576,942],[629,949],[713,950],[713,1012],[410,1012]]});
  function paint(canvas,kind,motion,size) {
    const rig=rigs[kind],ctx=canvas.getContext('2d'),[x,y,w,h]=rig.rect,[ax,ay]=rig.anchor;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();ctx.scale(2,2);ctx.translate(canvas.width/4,canvas.height/2-5);
    // Perched feet and crab contact points stay anchored while the body sways.
    ctx.rotate(motion.rock);ctx.scale(size,size);
    const drawBody=()=>kind==='perch'?ctx.drawImage(rig.body,50-187,136-380,312,252):ctx.drawImage(rig.body,x-ax,y-ay,w,h);
    const drawPart=(name,angle,sx=1,sy=1)=>{
      const p=rig.parts.find(p=>p.name===name),[px,py]=p.pivot;
      ctx.save();ctx.translate(px-ax,py-ay);ctx.rotate(angle);ctx.scale(sx,sy);
      ctx.drawImage(p.texture,x-px,y-py,w,h);ctx.restore();
    };
    if(kind==='fly') {
      drawPart('far',-motion.wing*.58);drawBody();drawPart('wing',motion.wing*.72,1,1-Math.abs(motion.wing)*.08);
    } else if(kind==='perch') {
      drawPart('wing',1.08*(1-motion.wing),.48+.52*motion.wing,.48+.52*motion.wing);drawBody();
      if(motion.blink>.2) {
        // Close only the eyelid; the head, beak and body retain their paint.
        ctx.save();ctx.translate(132-187,177-380);ctx.fillStyle='#f6f3e6';ctx.beginPath();ctx.ellipse(0,0,11,10*motion.blink,0,0,TAU);ctx.fill();
        ctx.strokeStyle='#463a2c';ctx.lineWidth=2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-6,0);ctx.quadraticCurveTo(0,3,6,0);ctx.stroke();ctx.restore();
      }
    } else {
      drawPart('left',motion.left*.62);drawPart('right',-motion.right*.62);drawBody();
    }
    ctx.restore();canvas.dataset.motion=JSON.stringify(motion);
  }
  return {paint};
}
