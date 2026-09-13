// All coordinates use the same 1600-wide world as the shared lesson map.
export const DESERT_WIDTH = 1600;
export const DESERT_WATER = [
  [[915,220],[1080,209],[1280,215],[1425,229],[1450,242],[1350,253],[1280,275],[1090,277],[956,267],[881,240]],
  [[658,407],[829,411],[925,417],[1040,424],[1118,443],[1105,463],[1160,479],[1115,500],[986,518],[803,513],[655,495],[565,473],[555,439]]
];
export function desertPositions(lessons) {
  return lessons.map((lesson,i) => {
    const row=Math.floor(i/7),column=row%2?6-i%7:i%7;
    const y=row===0?327:row===1?635:875+(row-2)*245;
    return {id:lesson.id,x:155+column*215+(row?Math.sin(row*.9+column)*9:0),y:y+Math.sin(column*1.1+row*.5)*(row?23:8)};
  });
}
export const desertHeight=count=>Math.max(1150,875+Math.max(0,Math.ceil(count/7)-3)*245+270);
function inside(p,polygon) {
  let yes=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const [ax,ay]=polygon[i],[bx,by]=polygon[j];
    if((ay>p.y)!==(by>p.y)&&p.x<(bx-ax)*(p.y-ay)/(by-ay)+ax)yes=!yes;
  }
  return yes;
}
export function desertWalkable(p,height=desertHeight(329)) {
  if(!Number.isFinite(p?.x)||!Number.isFinite(p?.y)||p.x<60||p.x>1540||p.y<300||p.y>height-65)return false;
  // A hoof margin includes the painted shores, not just the middle of the water.
  return !DESERT_WATER.some(poly=>[[0,0],[-14,0],[14,0],[0,-12],[0,12]].some(([x,y])=>inside({x:p.x+x,y:p.y+y},poly)));
}
export function desertSegment(a,b,height) {
  if(!desertWalkable(a,height)||!desertWalkable(b,height))return false;
  if(Math.min(a.y,b.y)>540)return true;
  const steps=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/5));
  for(let i=1;i<steps;i++)if(!desertWalkable({x:a.x+(b.x-a.x)*i/steps,y:a.y+(b.y-a.y)*i/steps},height))return false;
  return true;
}
function curve(a,b,turn) {
  if(turn){const edge=a.x>800?1530:70;return [{x:edge,y:a.y+55},{x:edge,y:b.y-55}];}
  return [{x:(a.x+b.x)/2,y:a.y},{x:(a.x+b.x)/2,y:b.y}];
}
export function desertTrail(nodes) {
  if(!nodes.length)return {d:'',points:[]};
  let d=`M${nodes[0].x} ${nodes[0].y}`;
  const points=[{...nodes[0]}];
  for(let i=1;i<nodes.length;i++) {
    const a=nodes[i-1],b=nodes[i],[c,e]=curve(a,b,i%7===0);
    d+=`C${c.x} ${c.y} ${e.x} ${e.y} ${b.x} ${b.y}`;
    for(let s=1;s<=12;s++){const t=s/12,u=1-t;points.push({x:u*u*u*a.x+3*u*u*t*c.x+3*u*t*t*e.x+t*t*t*b.x,y:u*u*u*a.y+3*u*u*t*c.y+3*u*t*t*e.y+t*t*t*b.y});}
  }
  return {d,points};
}
export function createDesertNavigation(nodes,height) {
  const trail=desertTrail(nodes).points;
  const stops=new Map(nodes.map((p,i)=>[`${p.x},${p.y}`,i*12]));
  function nearest(p) {
    const stop=stops.get(`${p.x},${p.y}`);if(stop!==undefined)return stop;
    let best=-1,distance=Infinity;
    for(let i=0;i<trail.length;i++){
      const d=Math.hypot(trail[i].x-p.x,trail[i].y-p.y);
      if(d<distance&&desertSegment(p,trail[i],height)){best=i;distance=d;}
    }
    return best;
  }
  return {
    path(from,to) {
      if(!desertWalkable(from,height)||!desertWalkable(to,height))return null;
      if(Math.hypot(from.x-to.x,from.y-to.y)<1)return [{...to}];
      const a=nearest(from),b=nearest(to);if(a<0||b<0)return null;
      const points=a<=b?trail.slice(a,b+1):trail.slice(b,a+1).reverse();
      const result=points.filter((p,i)=>i||Math.hypot(p.x-from.x,p.y-from.y)>1);
      if(!result.length||Math.hypot(result.at(-1).x-to.x,result.at(-1).y-to.y)>1)result.push({...to});
      return result;
    },
    step(from,to) {
      if(desertSegment(from,to,height))return to;
      for(const p of [{x:to.x,y:from.y},{x:from.x,y:to.y}])if(desertSegment(from,p,height))return p;
      return from;
    }
  };
}
export function tumbleweedMotion(t,index=0) {
  const radius=index?17:20,speed=index?-24:28,period=1780/Math.abs(speed);
  const phase=((t+(index?18:20))%period+period)%period;
  const distance=phase*Math.abs(speed),x=index?1690-distance:-90+distance;
  return {x,y:(index?567:550)-Math.abs(Math.sin(distance/52))*3,angle:(index?-distance:distance)/radius,radius,period};
}
