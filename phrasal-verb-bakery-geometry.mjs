import {desertTrail} from './phrasal-verb-desert-geometry.mjs?v=20260913-night1';
export const BAKERY_OFFSET=3545;
export const BAKERY_HEIGHT=1640;
export function bakeryPositions(lessons){return lessons.slice(0,30).map((lesson,i)=>{
 const row=Math.floor(i/7),column=row%2?6-i%7:i%7;
 const x=row===4?690+(i%7)*220:155+column*215+Math.sin(column*.9+row)*8;
 let y=[530,790,1060,1320,1515][row]+Math.sin(column+row*.5)*(row?12:9);
 // The right bend passes below the chocolate mug; the final turn avoids the cupcake.
 if(i===19)y=1200;if(i===20)y=1190;
 if(row===3)y=[1215,1300,1310,1330,1360,1400,1420][column];
 return {id:lesson.id,x,y:BAKERY_OFFSET+y};
});}
export function bakeryTrail(nodes){
 const trail=desertTrail(nodes.slice(0,28));
 for(let i=28;i<nodes.length;i++){
  const a=nodes[i-1],b=nodes[i],c=i===28?{x:420,y:a.y+190}:{x:(a.x+b.x)/2,y:a.y},e=i===28?{x:520,y:b.y}:{x:(a.x+b.x)/2,y:b.y};
  trail.d+=`C${c.x} ${c.y} ${e.x} ${e.y} ${b.x} ${b.y}`;
  for(let j=1;j<=12;j++){const t=j/12,u=1-t;trail.points.push({x:u*u*u*a.x+3*u*u*t*c.x+3*u*t*t*e.x+t*t*t*b.x,y:u*u*u*a.y+3*u*u*t*c.y+3*u*t*t*e.y+t*t*t*b.y});}
 }
 return trail;
}
// Small painted sky points remain static; these are the deliberately larger stars.
export const BAKERY_STARS=[
 [40,72,9],[329,61,8],[392,183,11],[850,83,9],[914,190,7],[1533,50,8],
 [83,542,10],[445,542,9],[724,557,11],[1169,548,8],[1505,817,9],
 [315,827,11],[794,828,8],[121,1098,8],[780,1100,10],[492,1370,8],[1477,1402,9]
].map(([x,y,r],i)=>({x,y,r,period:4.4+i%5*.63,phase:-i*.79}));
export const BAKERY_OBJECTS={
 moon:{x:174,y:156,size:224},galaxy:{x:1060,y:155,size:320},saturn:{x:1370,y:220,size:310},
 chimney:{x:790,y:233},cup:{x:1302,y:1026}
};
// Keep small groups in the open bands between lesson rows, leaving room to walk.
export const BAKERY_DECORATIONS=[
 {art:'star-cookies',x:370,y:672,size:190},
 {art:'macarons',x:1020,y:660,size:190},
 {art:'cinnamon-wafers',x:740,y:925,size:200},
 {art:'cupcake',x:351,y:945,size:168},
 {art:'caramel-pudding',x:585,y:1188,size:166},
 {art:'blue-planet',x:1135,y:391,size:145}
];
// Equal distances along the icing keep long bends as richly sprinkled as straight runs.
export function bakerySprinkles(trail,nodes){
 const result=[];let distance=0,next=16,index=0;
 for(let j=1;j<trail.points.length;j++){
  const a=trail.points[j-1],b=trail.points[j],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
  if(!length)continue;
  while(next<=distance+length){
   const t=(next-distance)/length,side=(index%2?18:-18)+Math.sin(index*1.9)*5;
   const x=a.x+dx*t-dy/length*side,y=a.y+dy*t+dx/length*side;
   // No sugar over the numbered biscuit, progress badge, or lesson caption.
   if(!nodes.some(n=>Math.abs(x-n.x)<73&&y>n.y-56&&y<n.y+85))
    result.push({x,y,width:14+index%3*2,angle:index*67%160-80,color:index%6});
   next+=20;index++;
  }
  distance+=length;
 }
 return result;
}
// Filled, tapered veils widen above a fixed cup-rim contact and curl in rising air.
function smoothSteamEdge(points){
 let d=`M${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],before=points[Math.max(0,i-2)],after=points[Math.min(points.length-1,i+1)];
  d+=`C${(a.x+(b.x-before.x)/6).toFixed(2)} ${(a.y+(b.y-before.y)/6).toFixed(2)} ${(b.x-(after.x-a.x)/6).toFixed(2)} ${(b.y-(after.y-a.y)/6).toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
 }
 return d+'Z';
}
export function chocolateSteam(t,index){
 const phase=t*.7+index*1.5,base=(index-1)*10,height=160+index*9;
 const edge=side=>Array.from({length:15},(_,j)=>{
  const s=j/14,envelope=Math.sin(Math.PI*s);
  const center=base*(1-s)+Math.sin(s*5.5-t*.5+index*.7)*envelope*20+Math.sin(s*10-t*.9+index)*s*8;
  const width=Math.pow(envelope,.7)*(12+index*4)*(1+.22*Math.sin(phase-s*8));
  return {x:center+side*width,y:-s*height};
 });
 const right=edge(1),left=edge(-1).reverse();
 return {d:smoothSteamEdge([...right,...left.slice(1)]),opacity:.3+(.5+.5*Math.sin(phase*.6))*.15};
}
