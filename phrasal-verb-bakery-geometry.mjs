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
 moon:{x:174,y:156,size:224},galaxy:{x:500,y:160,size:350},saturn:{x:1370,y:220,size:310},
 chimney:{x:790,y:233},cup:{x:1302,y:1026}
};
// Each steam ribbon keeps the same rim contact while its upper curls change shape.
export function chocolateSteam(t,index){
 const phase=t*1.15+index*2.1,base=(index-1)*15;
 const bend=(level)=>Math.sin(phase+level*.88)*(8+level*3.3);
 return {d:`M${base} 0 C${base-4} -15 ${base+bend(1)} -18 ${base+bend(1)} -31 S${base+bend(2)} -49 ${base+bend(2)} -61 S${base+bend(3)} -79 ${base+bend(3)} -94 S${base+bend(4)} -107 ${base+bend(4)} -119`,opacity:.32+(.5+.5*Math.sin(phase*.7))*.28,dashOffset:-t*17-index*39};
}
