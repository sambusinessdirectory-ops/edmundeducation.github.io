export const BLUEPRINT_WIDTH=1600,BLUEPRINT_HEIGHT=1120;
// Deliberately staggered drafting-paper landings. The route curves around
// each end, keeping a single unambiguous sequence through all 29 lessons.
export const BLUEPRINT_STOPS=[
 [155,232],[408,250],[664,225],[918,242],[1170,219],[1423,237],
 [1435,414],[1177,435],[924,411],[670,432],[415,409],[162,430],
 [149,612],[407,590],[662,614],[916,590],[1174,611],[1428,593],
 [1436,796],[1178,776],[925,798],[669,777],[414,800],[163,779],
 [235,980],[478,998],[721,977],[964,994],[1207,974]
].map(([x,y])=>({x,y}));
export const BLUEPRINT_CAPTIONS=[
 'We need to…','X can… / Y can…','X affects… / Y affects…','Some… some… and some…','For some… / For others…','To… is to…',
 'To understand…','To ignore…','If X wants…','If X fails to…','The more… the more…','Whether… whether…',
 'In X, in Y, and in Z…','We see it in…','Requires… demands…','To… to… and to…','Not… not… but…','Can we afford to ignore…?',
 'Is that necessarily bad?','If not now, when?','What does this mean?','What should be done?','What explains this difference?','Can this be achieved?',
 'Not a question of…','Not whether… but how…','It is easy to…','What appears to be…','One may gain… but lose…'
];
export function blueprintPositions(lessons){return lessons.map((l,i)=>({id:l.id,...BLUEPRINT_STOPS[i]}));}
export function blueprintCurve(a,b){
 const turn=Math.abs(a.y-b.y)>100;
 const outside=a.x>800?1530:55;
 return turn?[a,{x:outside,y:a.y+40},{x:outside,y:b.y-40},b]:[a,{x:(a.x+b.x)/2,y:a.y},{x:(a.x+b.x)/2,y:b.y},b];
}
export function cubicPoint(c,t){const u=1-t;return {x:u**3*c[0].x+3*u*u*t*c[1].x+3*u*t*t*c[2].x+t**3*c[3].x,y:u**3*c[0].y+3*u*u*t*c[1].y+3*u*t*t*c[2].y+t**3*c[3].y};}
export function blueprintRoute(count=29){
 const stops=BLUEPRINT_STOPS.slice(0,count),points=[stops[0]],curves=[];
 for(let i=1;i<stops.length;i++){
  const c=blueprintCurve(stops[i-1],stops[i]);curves.push(c);
  for(let j=1;j<=24;j++)points.push(cubicPoint(c,j/24));
 }
 return {points,curves,d:`M${stops[0].x} ${stops[0].y} `+curves.map(c=>`C${c[1].x} ${c[1].y} ${c[2].x} ${c[2].y} ${c[3].x} ${c[3].y}`).join(' ')};
}
function project(p,points){
 let nearest={distance:Infinity,index:0,along:0,point:points[0]},along=0;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
  const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(len*len||1))),q={x:a.x+t*dx,y:a.y+t*dy},distance=Math.hypot(p.x-q.x,p.y-q.y);
  if(distance<nearest.distance)nearest={distance,index:i-1,along:along+t*len,point:q};along+=len;
 }
 return nearest;
}
export function blueprintNavigation(count=29){
 const {points}=blueprintRoute(count),stops=BLUEPRINT_STOPS.slice(0,count);
 const walkable=p=>Number.isFinite(p?.x)&&Number.isFinite(p?.y)&&(project(p,points).distance<=24||stops.some(s=>((p.x-s.x)/58)**2+((p.y-s.y)/32)**2<=1));
 const segment=(a,b)=>{const n=Math.max(1,Math.ceil(Math.hypot(a.x-b.x,a.y-b.y)/6));for(let i=1;i<=n;i++)if(!walkable({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n}))return false;return true;};
 const path=(from,to)=>{
  if(!walkable(from)||!walkable(to))return null;if(segment(from,to))return [to];
  const a=project(from,points),b=project(to,points),result=[a.point];
  if(a.along<b.along)for(let i=a.index+1;i<=b.index;i++)result.push(points[i]);
  else for(let i=a.index;i>b.index;i--)result.push(points[i]);
  result.push(b.point,to);
  const unique=result.filter((p,i)=>!i||Math.hypot(p.x-result[i-1].x,p.y-result[i-1].y)>.01);
  while(unique.length>1&&Math.hypot(unique[0].x-from.x,unique[0].y-from.y)<2)unique.shift();
  return unique;
 };
 return {path,step:(a,b)=>segment(a,b)?b:a,walkable,segment};
}
export const LAMP_MOTION={period:8.5,amplitude:.045};
export const lampAngle=t=>Math.sin(t*Math.PI*2/LAMP_MOTION.period)*LAMP_MOTION.amplitude;
export const compassAngle=t=>Math.sin(t*Math.PI*2/17)*.032;
export const pencilAngle=t=>Math.sin(t*Math.PI*2/13)*.013;
