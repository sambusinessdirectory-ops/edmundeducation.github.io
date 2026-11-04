// Conservative shoreline in the 1600 × 1950 artwork coordinate system.
// The boundary includes a small bank margin so the horse's hooves stay dry.
export const GARDEN_POND = Object.freeze([
  [1600,1490],[1450,1510],[1330,1545],[1220,1595],[1160,1660],
  [1110,1725],[1130,1780],[1210,1860],[1280,1950],[1600,1950]
]);
export function gardenIsDry({x,y}) {
  let inside=false;
  for(let i=0,j=GARDEN_POND.length-1;i<GARDEN_POND.length;j=i++) {
    const [ax,ay]=GARDEN_POND[i], [bx,by]=GARDEN_POND[j];
    if((ay>y)!==(by>y) && x<(bx-ax)*(y-ay)/(by-ay)+ax) inside=!inside;
  }
  return !inside;
}
export function gardenSegmentIsDry(from,to) {
  const steps=Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.y-from.y)/8));
  for(let i=0;i<=steps;i++) if(!gardenIsDry({x:from.x+(to.x-from.x)*i/steps,y:from.y+(to.y-from.y)*i/steps})) return false;
  return true;
}
export function gardenStep(from,to) {
  if(gardenSegmentIsDry(from,to)) return to;
  const horizontal={x:to.x,y:from.y}, vertical={x:from.x,y:to.y};
  if(gardenSegmentIsDry(from,horizontal)) return horizontal;
  if(gardenSegmentIsDry(from,vertical)) return vertical;
  return from;
}
export function gardenPath(from,to) {
  if(!gardenIsDry(to)) return null;
  if(gardenSegmentIsDry(from,to)) return [to];
  // Short visibility graph around the shore. No grid work in the animation loop.
  const corners=GARDEN_POND.map(([x,y])=>({x:x-35,y:y-35})).filter(p=>p.x>=60 && p.y>=180 && p.x<=1540 && p.y<=1885 && gardenIsDry(p));
  const points=[from,to,...corners], distance=points.map(()=>Infinity), previous=[], remaining=new Set(points.map((_,i)=>i));
  distance[0]=0;
  while(remaining.size) {
    const current=[...remaining].reduce((best,i)=>distance[i]<distance[best]?i:best);
    if(!Number.isFinite(distance[current])) break;
    if(current===1) {
      const result=[];let index=1;
      while(index!==0) {result.unshift(points[index]);index=previous[index];}
      return result;
    }
    remaining.delete(current);
    for(const next of remaining) {
      if(!gardenSegmentIsDry(points[current],points[next])) continue;
      const candidate=distance[current]+Math.hypot(points[next].x-points[current].x,points[next].y-points[current].y);
      if(candidate<distance[next]) {distance[next]=candidate;previous[next]=current;}
    }
  }
  return null;
}
