export const PAPER_WIDTH = 1600;
export const PAPER_HEIGHT = 1950;
export const PAPER_PAINT_WIDTH = 3200;
export const PAPER_ART = { width: 1672, height: 941 };
export const paperPoint = ([x, y]) => ({ x: x * 1600 / 1672, y: y * 900 / 941 });
export const PAPER_TRAIL = [
  [155,328],[380,322],[920,340],[1210,338],[1435,562],[1380,750],
  [815,723],[585,722],[350,704],[130,782],[275,1000],[510,941],
  [750,944],[970,1005],[1215,954],[1440,1080],[1320,1290],[1095,1300],
  [840,1210],[600,1240],[350,1300],[130,1260],[120,1505],[350,1575],
  [605,1490],[850,1450],[1100,1560],[1380,1520],[1400,1770],[1110,1775]
];
export function paperPositions(lessons) {
  return lessons.map((lesson, i) => ({ id: lesson.id, x: PAPER_TRAIL[i][0], y: PAPER_TRAIL[i][1] }));
}
export function paperTrailPath(nodes = PAPER_TRAIL.map(([x,y]) => ({x,y}))) {
  if (!nodes.length) return '';
  let d = `M${nodes[0].x} ${nodes[0].y}`;
  for (let i=0; i<nodes.length-1; i++) {
    const a=nodes[i-1]||nodes[i], b=nodes[i], c=nodes[i+1], e=nodes[i+2]||c;
    if (i===1) { d+=`C432 322 461 327 488 321M855 331C878 334 893 340 ${c.x} ${c.y}`;continue; }
    if (i===3) { d+=`C1320 338 1370 366 1370 425C1370 482 1425 503 ${c.x} ${c.y}`;continue; }
    if (i===5) { d+=`C1370 696 1334 662 1304 637M676 635C674 674 742 713 ${c.x} ${c.y}`;continue; }
    d += `C${b.x+(c.x-a.x)/6} ${b.y+(c.y-a.y)/6} ${c.x-(e.x-b.x)/6} ${c.y-(e.y-b.y)/6} ${c.x} ${c.y}`;
  }
  return d;
}
// Taper the paper lanes into the visible deck mouths. Bridge artwork is drawn
// over their tips so its railings and masonry retain their proper depth.
export const PAPER_APPROACHES = [
 'M483 292C507 288 527 293 549 302L555 317C530 321 513 338 495 350Z',
 'M809 308L827 317C837 319 846 311 859 302L860 360C840 356 829 339 813 331Z',
 'M647 635C655 609 672 594 695 591C756 577 805 562 854 564L859 581C801 584 752 598 711 610C701 617 705 627 705 635Z',
 'M1280 601C1297 602 1314 616 1322 616L1286 660C1275 642 1257 637 1234 629Z'
];
export const PAPER_BRIDGE_SILHOUETTES = [
 [[552,323],[553,289],[591,278],[654,267],[716,270],[777,284],[822,298],[823,315],[860,334],[817,347],[763,334],[714,327],[657,326],[600,344],[559,329]],
 [[874,647],[889,557],[943,536],[1002,520],[1090,511],[1182,520],[1249,545],[1311,588],[1333,622],[1290,638],[1268,687],[1224,699],[1166,686],[1169,623],[1100,577],[1062,572],[1010,607],[959,638],[922,650]]
].map(poly=>poly.map(paperPoint));
export const PAPER_FLAGS = [
  {...paperPoint([1244,74]),width:43,height:28,phase:.3},
  {...paperPoint([1329,44]),width:49,height:32,phase:1.7},
  {...paperPoint([1448,101]),width:41,height:27,phase:3.2}
];
export const PAPER_MILL = {...paperPoint([1543,384]),radius:88};
export const PAPER_BOATS = [
  {x:540,y:500,size:1,amplitude:31,period:19,phase:.1,color:'ivory'},
  {x:700,y:536,size:.83,amplitude:27,period:23,phase:2.8,color:'blue'}
];
export const PAPER_CLOUDS = [
  {x:420,y:82,width:185,amplitude:50,period:54,phase:.4},
  {x:970,y:86,width:150,amplitude:48,period:60,phase:2.5}
];
export const PAPER_PIGEON = {x:755,y:145,amplitude:150,period:68,size:1};
const RIVER_SOURCE = [
 [[0,455],[181,426],[357,420],[471,414],[517,401],[491,394],[532,381],[595,354],[599,338],[644,325],[714,321],[789,340],[824,340],[875,315],[946,322],[855,342],[805,354],[760,370],[731,393],[677,413],[608,438],[579,451],[583,463],[696,481],[797,503],[861,514],[919,539],[880,556],[814,575],[753,597],[655,608],[548,616],[462,622],[400,614],[326,608],[258,598],[201,581],[224,560],[209,551],[166,536],[91,523],[0,508]],
 [[745,636],[817,641],[887,649],[949,650],[1005,638],[1053,628],[1120,647],[1193,675],[1247,706],[1275,724],[1355,740],[1280,726],[1210,721],[1110,708],[1010,695],[903,673],[810,657],[745,646]]
];
export const PAPER_WATER = RIVER_SOURCE.map(poly=>poly.map(paperPoint));
export function paperInside(p, polygon) {
  let value=false;
  for (let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const a=polygon[i],b=polygon[j];
    if ((a.y>p.y)!==(b.y>p.y) && p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x) value=!value;
  }
  return value;
}
export function paperInWater(p) { return PAPER_WATER.some(poly => paperInside(p,poly)); }
export const PAPER_BRIDGES=[[[557,321],[606,303],[657,294],[714,303],[768,321],[850,336]],[[889,597],[945,563],[1032,539],[1119,544],[1198,575],[1289,625],[1320,633]]].map(a=>a.map(paperPoint));
function distanceToSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,f=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-f*dx,p.y-a.y-f*dy);}
export function paperOnBridge(p){return PAPER_BRIDGES.some(poly=>poly.slice(1).some((b,i)=>distanceToSegment(p,poly[i],b)<17));}
export function paperIsWalkable(p) {
  if(!Number.isFinite(p?.x)||!Number.isFinite(p?.y)||p.x<60||p.x>1540||p.y<275||p.y>1875)return false;
  if(p.x>1430&&p.x<1550&&p.y>315&&p.y<475)return false;
  return paperOnBridge(p)||!paperInWater(p);
}
export function paperSegment(a,b) {
  const count=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/4));
  for (let i=0;i<=count;i++) if (!paperIsWalkable({x:a.x+(b.x-a.x)*i/count,y:a.y+(b.y-a.y)*i/count})) return false;
  return true;
}
export function paperStep(a,b) {
  if (paperSegment(a,b)) return b;
  for (const p of [{x:b.x,y:a.y},{x:a.x,y:b.y}]) if (paperSegment(a,p)) return p;
  return a;
}
// The route endpoints are on the near bank. A small fixed graph also permits
// free exploration without walking through the painted river.
const WAYPOINTS = [...PAPER_BRIDGES.flat().map(p=>[p.x,p.y]),[525,309],[829,327],[842,574],[790,580],[739,590],[695,606],[676,635],[686,676],[1260,625],[1310,668],
  [95,327],[380,320],[510,330],[860,342],[1080,350],[1300,360],[1380,435],[1400,540],[1490,590],[1480,720],
  [140,700],[350,683],[580,715],[830,723],[1000,770],[1250,780],[1420,805]].map(([x,y])=>({x,y}));
let fixedEdges;
export function paperPath(from,to) {
  if (!paperIsWalkable(from)||!paperIsWalkable(to)) return null;
  if (paperSegment(from,to)) return [to];
  if (!fixedEdges) fixedEdges=WAYPOINTS.map(a=>WAYPOINTS.map(b=>paperSegment(a,b)));
  const pts=[from,to,...WAYPOINTS],remain=new Set(pts.map((_,i)=>i)),cost=pts.map(()=>Infinity),previous=[];
  cost[0]=0;
  while(remain.size) {
    const i=[...remain].reduce((a,b)=>cost[a]<cost[b]?a:b);
    if (!Number.isFinite(cost[i])) break;
    if(i===1){const route=[];let n=1;while(n!==0){route.unshift(pts[n]);n=previous[n];}return route;}
    remain.delete(i);
    for (const j of remain) {
      if (!(i>1&&j>1?fixedEdges[i-2][j-2]:paperSegment(pts[i],pts[j]))) continue;
      const next=cost[i]+Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);
      if(next<cost[j]){cost[j]=next;previous[j]=i;}
    }
  }
  return null;
}
export function paperSeed(seed=41813) {return ()=>((seed=seed*16807%2147483647)-1)/2147483646;}
export function paperPlants(nodes=PAPER_TRAIL.map(([x,y])=>({x,y}))) {
 const result=[],random=paperSeed();
 const clear=(kind,x,y,w,h)=>{
  if(x-w/2<4||x+w/2>1596||y>1920||y-h<20||paperInWater({x,y}))return false;
  // Check the foliage silhouette by height: narrow tips and trunks should not
  // exclude an entire rectangular patch of otherwise empty meadow.
  const profile=kind.includes('ine')?[.15,.3,.45,.55,.65,.8,.9,1,.7,.2]:kind==='round'?[.35,.7,.95,1,1,.9,.8,.6,.25,.2]:Array(10).fill(1);
  for(const n of nodes)for(let i=0;i<10;i++){
   const top=y-h+h*i/10,bottom=top+h/10,half=w*profile[i]/2+h*.045+5;
   if(Math.abs(x-n.x)<half+99&&bottom>n.y-48&&top<n.y+112)return false;
  }
  if(x>645&&x<880&&y>560&&y<670)return false;
  const footClearance=45+Math.min(25,w*.2);
  if(PAPER_TRAIL.slice(1).some((b,i)=>distanceToSegment({x,y},{x:PAPER_TRAIL[i][0],y:PAPER_TRAIL[i][1]},{x:b[0],y:b[1]})<footClearance))return false;
  if(y<700&&((x>1070&&x<1400&&y-h<300)||(x>1430&&y>315&&y-h<505)))return false;
  return !result.some(p=>p.kind===kind&&Math.hypot(x-p.x,y-p.y)<Math.min(85,h*.5));
 };
 const add=(kind,x,y,h)=>{
  const aspects={pine:.757,round:.87,tealPine:.73,bush:1.47,tealBush:1.35,sprout:1.24};
  h*=y<300?1.2:y<900?1.5:1.65;const w=h*aspects[kind];
  const offsets=y<600?[[0,0]]:[0,40,-40,80,-80,120,-120].flatMap(dy=>[0,40,-40,80,-80,120,-120,160,-160].map(dx=>[dx,dy])).sort((a,b)=>Math.hypot(...a)-Math.hypot(...b));
  const place=offsets.map(([dx,dy])=>[Math.max(w/2+8,Math.min(1592-w/2,x+dx)),y+dy]).find(([px,py])=>clear(kind,px,py,w,h));
  if(!place)return;[x,y]=place;
  result.push({id:result.length,kind,x,y,w,h,amplitude:kind.includes('ine')?.031:.04,period:6+random()*3,phase:random()*Math.PI*2});
 };
 // Rich layered foliage frames the scenery while keeping the route readable.
 const beds=[[70,245,145],[270,250,105],[440,252,125],[850,267,110],[1045,266,145],[1550,298,152],
 [70,421,115],[1160,440,97],[1020,471,80],[1340,513,80],[1570,556,125],
 [55,651,125],[440,644,112],[660,646,90],[1510,718,140],[1130,796,115],[570,854,100],
 [78,1010,140],[1410,935,115],[790,1100,100],[430,1150,105],[1525,1350,145],
 [90,1430,110],[580,1420,85],[1015,1360,80],[1260,1665,125],[480,1725,140],
 [85,1890,180],[745,1875,190],[1510,1890,165]];
 for(const [x,y,h]of beds){add(result.length%3?'pine':'tealPine',x,y,h);add('round',x+42,y+5,h*.75);add(result.length%2?'bush':'tealBush',x-40,y+8,h*.4);add('sprout',x+60,y+7,h*.28);}
 return result.sort((a,b)=>a.y-b.y).map((p,id)=>({...p,id}));
}
