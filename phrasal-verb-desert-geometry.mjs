// All coordinates use the same 1600-wide world as the shared lesson map.
export const DESERT_WIDTH = 1600;
export const DESERT_HEIGHT = 1635;
export const DESERT_MAP_LIMIT = 30;
// Registered against the complete background, in its 1600 × 1635 world.
export const DESERT_WATER = [
  [[901,225],[1085,216],[1260,219],[1434,229],[1409,246],[1340,261],[1293,282],[1121,282],[978,274],[907,264],[869,244]],
  [[593,428],[703,415],[860,421],[991,438],[1079,455],[1147,482],[1136,503],[1088,521],[1009,532],[858,538],[703,528],[582,502],[515,477],[531,447]],
  [[604,1028],[739,1010],[895,1011],[1014,1034],[1127,1078],[1099,1100],[1025,1130],[861,1147],[714,1134],[606,1109],[495,1090],[483,1058]]
];
export function desertPositions(lessons) {
  return lessons.slice(0,DESERT_MAP_LIMIT).map((lesson,i) => {
    const row=Math.floor(i/7),column=row%2?6-i%7:i%7;
    const y=[330,655,885,1250,1480][row];
    // The final pair finishes in the open sand beyond the lower oasis.
    const x=row===4?690+(i%7)*220:155+column*215+(row?Math.sin(row*.9+column)*9:0);
    return {id:lesson.id,x,y:y+Math.sin(column*1.1+row*.5)*(row?18:8)};
  });
}
export const desertHeight=()=>DESERT_HEIGHT;
function inside(p,polygon) {
  let yes=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const [ax,ay]=polygon[i],[bx,by]=polygon[j];
    if((ay>p.y)!==(by>p.y)&&p.x<(bx-ax)*(p.y-ay)/(by-ay)+ax)yes=!yes;
  }
  return yes;
}
export function desertWalkable(p,height=DESERT_HEIGHT) {
  if(!Number.isFinite(p?.x)||!Number.isFinite(p?.y)||p.x<60||p.x>1540||p.y<180||p.y>height-65)return false;
  // A hoof margin includes the painted shores, not just the middle of the water.
  return !DESERT_WATER.some(poly=>[[0,0],[-14,0],[14,0],[0,-12],[0,12]].some(([x,y])=>inside({x:p.x+x,y:p.y+y},poly)));
}
export function desertSegment(a,b,height) {
  if(!desertWalkable(a,height)||!desertWalkable(b,height))return false;
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
  // A small visibility graph goes around shores only. Open sand is a direct walk.
  const corners=DESERT_WATER.flatMap(poly=>{
    const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);
    const left=Math.min(...xs)-28,right=Math.max(...xs)+28,top=Math.min(...ys)-28,bottom=Math.max(...ys)+28;
    return [{x:left,y:top},{x:right,y:top},{x:right,y:bottom},{x:left,y:bottom}];
  }).filter(p=>desertWalkable(p,height));
  const links=corners.map((a,i)=>corners.flatMap((b,j)=>i!==j&&desertSegment(a,b,height)?[{to:j,d:Math.hypot(a.x-b.x,a.y-b.y)}]:[]));
  return {
    path(from,to) {
      if(!desertWalkable(from,height)||!desertWalkable(to,height))return null;
      if(desertSegment(from,to,height))return [{...to}];
      const points=[...corners,from,to],start=corners.length,end=start+1;
      const graph=links.map(edges=>edges.slice());graph.push([],[]);
      for(const index of [start,end])for(let i=0;i<corners.length;i++)if(desertSegment(points[index],points[i],height)){
        const d=Math.hypot(points[index].x-points[i].x,points[index].y-points[i].y);
        graph[index].push({to:i,d});graph[i].push({to:index,d});
      }
      const dist=points.map(()=>Infinity),previous=points.map(()=>-1),visited=new Set();dist[start]=0;
      while(visited.size<points.length){
        let current=-1;for(let i=0;i<points.length;i++)if(!visited.has(i)&&(current<0||dist[i]<dist[current]))current=i;
        if(current<0||!Number.isFinite(dist[current]))return null;
        if(current===end)break;visited.add(current);
        for(const edge of graph[current])if(dist[current]+edge.d<dist[edge.to]){dist[edge.to]=dist[current]+edge.d;previous[edge.to]=current;}
      }
      const route=[];for(let i=end;i!==start;i=previous[i]){if(i<0)return null;route.unshift({...points[i]});}
      return route.filter(p=>Math.hypot(p.x-from.x,p.y-from.y)>1);
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
