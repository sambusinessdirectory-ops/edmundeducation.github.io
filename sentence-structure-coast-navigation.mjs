// Hoof-space boundaries traced against the 1600 × 1950 coastal painting.
// The sea is above the meadow; the central stream has two timber crossings.
export const SHORE_BOUNDS = { left:60, right:1540, top:552, bottom:1790 };
export const STREAM_BANK = [
  [0,856],[230,864],[385,866],[530,876],[685,856],[858,868],
  [980,884],[1090,868],[1205,871],[1290,853],[1370,879],[1415,922],
  [1400,967],[1360,1000],[1265,1022],[1150,1010],[1070,1020],
  [960,1006],[865,1025],[770,1006],[665,1015],[580,994],[450,1006],
  [345,995],[240,1008],[120,981],[0,1000]
];
export const SHORE_BRIDGES = [
  {left:71,right:129,top:838,bottom:1025},
  {left:730,right:785,top:835,bottom:1035}
];
function inside(p, polygon) {
  let value=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const [ax,ay]=polygon[i], [bx,by]=polygon[j];
    if((ay>p.y)!==(by>p.y) && p.x<(bx-ax)*(p.y-ay)/(by-ay)+ax)value=!value;
  }
  return value;
}
export function shoreIsWalkable(p) {
  if(!Number.isFinite(p?.x)||!Number.isFinite(p?.y))return false;
  const b=SHORE_BOUNDS;
  if(p.x<b.left||p.x>b.right||p.y<b.top||p.y>b.bottom)return false;
  if(SHORE_BRIDGES.some(b=>p.x>=b.left&&p.x<=b.right&&p.y>=b.top&&p.y<=b.bottom))return true;
  return !inside(p,STREAM_BANK);
}
export function shoreSegment(from,to) {
  const steps=Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.y-from.y)/5));
  for(let i=0;i<=steps;i++)if(!shoreIsWalkable({x:from.x+(to.x-from.x)*i/steps,y:from.y+(to.y-from.y)*i/steps}))return false;
  return true;
}
export function shoreStep(from,to) {
  if(shoreSegment(from,to))return to;
  const horizontal={x:to.x,y:from.y},vertical={x:from.x,y:to.y};
  if(shoreSegment(from,horizontal))return horizontal;
  if(shoreSegment(from,vertical))return vertical;
  return from;
}
export function shorePath(from,to) {
  if(!shoreIsWalkable(from)||!shoreIsWalkable(to))return null;
  if(shoreSegment(from,to))return [to];
  // A tiny visibility graph finds a dry route via a bridge or the eastern bank.
  const points=[from,to,...[
    [100,829],[100,1035],[757,824],[757,1045],
    [1455,835],[1490,955],[1435,1060]
  ].map(([x,y])=>({x,y}))];
  const remaining=new Set(points.map((_,i)=>i)),cost=points.map(()=>Infinity),previous=[];
  cost[0]=0;
  while(remaining.size) {
    const index=[...remaining].reduce((best,i)=>cost[i]<cost[best]?i:best);
    if(!Number.isFinite(cost[index]))break;
    if(index===1) {
      const result=[];let n=1;
      while(n!==0){result.unshift(points[n]);n=previous[n];}
      return result;
    }
    remaining.delete(index);
    for(const next of remaining) {
      if(!shoreSegment(points[index],points[next]))continue;
      const candidate=cost[index]+Math.hypot(points[next].x-points[index].x,points[next].y-points[index].y);
      if(candidate<cost[next]){cost[next]=candidate;previous[next]=index;}
    }
  }
  return null;
}
