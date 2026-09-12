import { shoreIsWalkable } from './sentence-structure-coast-navigation.mjs?v=20260912-sentence2';

export const AUTUMN_OFFSET=1950;
export const REALM_BOUNDS={left:60,right:1540,top:552,bottom:3770};
// Hoof-space, traced in the autumn painting's central 1600 × 1950 region.
export const AUTUMN_RIVER=[[0,703],[340,714],[690,725],[880,730],[1200,743],[1600,743],[1600,915],[1250,922],[900,916],[570,904],[300,891],[0,875]];
export const AUTUMN_BROOK=[[675,298],[753,299],[815,339],[932,371],[918,421],[811,415],[755,374],[689,351]];
export const AUTUMN_BRIDGES=[{left:113,right:205,top:625,bottom:953},{left:1004,right:1099,top:627,bottom:967}];
function inside(p,polygon){let yes=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
 const [ax,ay]=polygon[i],[bx,by]=polygon[j];if((ay>p.y)!==(by>p.y)&&p.x<(bx-ax)*(p.y-ay)/(by-ay)+ax)yes=!yes;
}return yes;}
export function realmsIsWalkable(p){
 const b=REALM_BOUNDS;if(!Number.isFinite(p?.x)||!Number.isFinite(p?.y)||p.x<b.left||p.x>b.right||p.y<b.top||p.y>b.bottom)return false;
 if(p.y<=1790)return shoreIsWalkable(p);
 if(p.y<AUTUMN_OFFSET)return true; // Cloud border is deliberately penetrable.
 const q={x:p.x,y:p.y-AUTUMN_OFFSET};
 if(AUTUMN_BRIDGES.some(b=>q.x>=b.left&&q.x<=b.right&&q.y>=b.top&&q.y<=b.bottom))return true;
 return !inside(q,AUTUMN_RIVER)&&!inside(q,AUTUMN_BROOK);
}
export function realmsSegment(a,b){const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/5));for(let i=0;i<=steps;i++)if(!realmsIsWalkable({x:a.x+(b.x-a.x)*i/steps,y:a.y+(b.y-a.y)*i/steps}))return false;return true;}
export function realmsStep(a,b){if(realmsSegment(a,b))return b;for(const p of [{x:b.x,y:a.y},{x:a.x,y:b.y}])if(realmsSegment(a,p))return p;return a;}
const WAYPOINTS=[
 [100,829],[100,1035],[757,824],[757,1045],[1455,835],[1490,955],[1435,1060],
 [160,1820],[160,2060],[160,2400],[1050,2390],
 [159,AUTUMN_OFFSET+615],[159,AUTUMN_OFFSET+977],
 [1050,AUTUMN_OFFSET+615],[1050,AUTUMN_OFFSET+985],
 [640,AUTUMN_OFFSET+280],[955,AUTUMN_OFFSET+290],[970,AUTUMN_OFFSET+447]
].map(([x,y])=>({x,y}));
// Cache only fixed waypoint visibility; endpoints remain validated for every trip.
let fixedEdges;
export function realmsPath(from,to){
 if(!realmsIsWalkable(from)||!realmsIsWalkable(to))return null;
 if(realmsSegment(from,to))return [to];
 if(!fixedEdges)fixedEdges=WAYPOINTS.map((a)=>WAYPOINTS.map(b=>realmsSegment(a,b)));
 const points=[from,to,...WAYPOINTS],remaining=new Set(points.map((_,i)=>i)),cost=points.map(()=>Infinity),previous=[];
 cost[0]=0;
 while(remaining.size){
  const i=[...remaining].reduce((best,j)=>cost[j]<cost[best]?j:best);if(!Number.isFinite(cost[i]))break;
  if(i===1){const route=[];let n=1;while(n!==0){route.unshift(points[n]);n=previous[n];}return route;}
  remaining.delete(i);
  for(const j of remaining){if(!(i>1&&j>1?fixedEdges[i-2][j-2]:realmsSegment(points[i],points[j])))continue;
   const next=cost[i]+Math.hypot(points[j].x-points[i].x,points[j].y-points[i].y);
   if(next<cost[j]){cost[j]=next;previous[j]=i;}
  }
 }return null;
}
