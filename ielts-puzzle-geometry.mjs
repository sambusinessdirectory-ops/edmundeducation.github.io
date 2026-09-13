export const PUZZLE_WIDTH = 1600;
export const PUZZLE_LIMIT = 30;
export const point = ([x,y]) => ({x:x*1600/1672,y:y*900/941});
export const PUZZLE_STOPS = [
 [115,242],[350,286],[565,294],[866,272],[1110,287],[1370,269],[1540,301],
 [1490,557],[1265,557],[1060,555],[850,551],[633,573],[398,590],[163,567],
 [163,755],[400,750],[620,785],[905,757],[1115,750],[1485,815]
].map(point).concat([[1500,190],[1200,170],[915,180],[440,200],[170,150],
 [160,520],[440,595],[755,650],[1155,654],[1480,590]].map(p=>({...point(p),y:point(p).y+860})));

export function puzzlePositions(lessons) {
 return lessons.map(l=>({id:l.id,...PUZZLE_STOPS[l.order-1]}));
}
// The bridge points follow the visible wooden decks. Their puzzle connectors
// stop at the entrances; the original timber remains visible above the water.
const DETOURS = {
 2:[[646,293],[686,285],[710,278,'bridge'],[741,273,'bridge'],[772,277,'bridge'],[800,284,'bridge'],[823,285]],
 6:[[1615,346],[1618,403],[1560,439],[1514,461],[1475,483,'bridge'],[1435,503,'bridge'],[1390,527,'bridge'],[1410,550]],
 13:[[90,620],[120,690]],
 16:[[686,798],[720,791],[753,784,'bridge'],[786,775,'bridge'],[817,770,'bridge'],[846,768]],
 18:[[1158,745],[1200,747],[1255,762,'bridge'],[1310,785,'bridge'],[1371,811,'bridge'],[1410,814]]
};
export function puzzleRoute(count=20) {
 count=Math.max(1,Math.min(PUZZLE_LIMIT,count));
 const route=[{...PUZZLE_STOPS[0],surface:'puzzle'}];
 for(let i=0;i<count-1;i++){
  for(const [x,y,surface='puzzle'] of DETOURS[i]||[])route.push({...point([x,y]),surface});
  route.push({...PUZZLE_STOPS[i+1],surface:'puzzle'});
 }
 return route;
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function projectToRoute(p,route) {
 let best={distance:Infinity,index:0,t:0,along:0,point:route[0]},along=0;
 for(let i=0;i<route.length-1;i++){
  const a=route[i],b=route[i+1],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
  const t=length?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(length*length),0,1):0;
  const q={x:a.x+dx*t,y:a.y+dy*t},distance=Math.hypot(q.x-p.x,q.y-p.y);
  if(distance<best.distance)best={distance,index:i,t,along:along+length*t,point:q};
  along+=length;
 }
 return best;
}
export function createPuzzleNavigation(count=20) {
 const route=puzzleRoute(count),stops=PUZZLE_STOPS.slice(0,count);
 const finite=p=>Number.isFinite(p?.x)&&Number.isFinite(p?.y);
 const walkable=p=>finite(p)&&(projectToRoute(p,route).distance<=38||stops.some(n=>((p.x-n.x)/75)**2+((p.y-n.y)/36)**2<=1));
 const segment=(a,b)=>{const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/5));for(let i=1;i<=steps;i++)if(!walkable({x:a.x+(b.x-a.x)*i/steps,y:a.y+(b.y-a.y)*i/steps}))return false;return true;};
 const path=(from,to)=>{
  if(!walkable(from)||!walkable(to))return null;
  if(segment(from,to))return [to];
  const a=projectToRoute(from,route),b=projectToRoute(to,route),points=[a.point];
  if(a.along<=b.along){for(let i=a.index+1;i<=b.index;i++)points.push(route[i]);}
  else {for(let i=a.index;i>b.index;i--)points.push(route[i]);}
  points.push(b.point,to);
  const distinct=points.filter((p,i)=>i===0||Math.hypot(p.x-points[i-1].x,p.y-points[i-1].y)>.01);
  while(distinct.length>1&&Math.hypot(distinct[0].x-from.x,distinct[0].y-from.y)<2)distinct.shift();
  return distinct;
 };
 const step=(a,b)=>segment(a,b)?b:a;
 return {route,path,step,walkable,segment};
}

export const PUZZLE_GATE={...point([184,149]),width:39,height:52,amplitude:9,period:7.5};
export const PUZZLE_MILL={...point([1543,134]),radius:71,period:17};
export const PUZZLE_BALLOON={x:865,y:79,width:128,amplitude:110,period:62};
export const PUZZLE_FLOATS=[
 {id:'sky-west',x:460,y:138,w:133,kind:'cluster',amplitude:12,period:9,phase:.3},
 {id:'sky-middle',x:694,y:91,w:110,kind:'piece',amplitude:15,period:10.5,phase:2},
 {id:'sky-east',x:1195,y:143,w:139,kind:'cluster',amplitude:13,period:12,phase:4},
 {id:'river-west',x:380,y:416,w:105,kind:'piece',amplitude:10,period:11,phase:3},
 {id:'river-east',x:1110,y:417,w:134,kind:'cluster',amplitude:13,period:9.5,phase:1.2},
 {id:'front-water',x:795,y:640,w:112,kind:'piece',amplitude:9,period:10,phase:4.8}
];
export const PUZZLE_CLOUDS=[
 {id:'cloud-west',x:392,y:64,w:190,kind:'cloudLong',amplitude:28,period:48,phase:0},
 {id:'cloud-middle',x:696,y:62,w:140,kind:'cloud',amplitude:34,period:56,phase:2.4},
 {id:'cloud-east',x:1160,y:72,w:215,kind:'cloudLong',amplitude:31,period:52,phase:4},
 {id:'cloud-far-east',x:1480,y:50,w:150,kind:'cloudLong',amplitude:18,period:46,phase:1.1},
 {id:'mist-water',x:580,y:438,w:168,kind:'cloudLong',amplitude:20,period:43,phase:2.7}
];

// Root coordinates are hand-placed on island ground in the accepted
// plate. Each object keeps an identity independent of ordering and culling.
export const PUZZLE_PLANTS=[
 ['castle-left','round',48,222,112],['castle-right','cypress',343,228,106],
 ['castle-front','shrub',253,239,43],['west-bank','spread',463,288,97],
 ['middle-cypress','cypress',925,249,133],['middle-tree','round',1005,251,92],
 ['mill-right','round',1623,245,100],['mill-left','shrub',1485,256,48],
 ['east-top','cypress',1475,392,105],['east-bank','spread',1598,541,101],
 ['west-middle','round',65,532,115],['middle-bank','spread',795,552,90],
 ['middle-shrub','shrub',958,531,43],['middle-left','shrub',490,570,48],
 ['west-corner','cypress',48,687,106],['front-west','round',300,736,113],
 ['front-left','shrub',509,766,40],['front-middle','cypress',1002,723,111],
 ['front-right','spread',1605,814,110],['front-shrub','shrub',1460,791,46]
].map(([id,kind,x,y,h],i)=>({id,kind,...point([x,y]),h,amplitude:kind==='shrub'?.025:.036,period:6.5+i%5*.7,phase:i*1.73}));

export const PUZZLE_WATERFALLS=[
 {id:'main-fall',...point([689,306]),width:80,height:173,speed:40},
 {id:'distant-fall',...point([1070,207]),width:76,height:48,speed:23}
];
export const PUZZLE_WATER_REGIONS=[
 [[463,508],[617,487],[779,465],[824,478],[909,471],[950,486],[976,478],[1045,487],[1110,455],[1175,467],[1228,442],[1303,468],[1230,507],[1150,528],[1082,511],[990,517],[943,504],[880,519],[791,530],[702,533],[643,556],[560,548]],
 [[1230,280],[1321,274],[1300,376],[1248,397],[1257,450],[1143,443],[1199,369],[1180,343]],
 [[686,841],[813,823],[849,858],[940,886],[993,874],[1045,901],[1172,857],[1214,866],[1212,942],[680,941]],
 [[1012,669],[1140,654],[1208,701],[1330,737],[1362,785],[1289,802],[1200,785],[1130,789],[1138,832],[1173,855],[1091,865],[1012,843]]
].map(poly=>poly.map(point));
