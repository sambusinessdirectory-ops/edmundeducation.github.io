export const PAPER_WIDTH = 1600;
export const PAPER_HEIGHT = 1950;
export const PAPER_PAINT_WIDTH = 3200;
export const PAPER_ART = { width: 1672, height: 941 };
export const paperPoint = ([x, y]) => ({ x: x * 3200 / 1672 - 800, y: y * 1950 / 941 });
export const PAPER_TRAIL = [
  [150,430],[390,425],[960,420],[1230,420],[1440,610],[1190,750],
  [910,800],[640,720],[360,745],[130,840],[280,1040],[515,970],
  [745,950],[975,1010],[1240,960],[1450,1080],[1340,1300],[1090,1320],
  [835,1220],[595,1250],[345,1320],[130,1270],[110,1510],[340,1590],
  [600,1500],[850,1460],[1100,1590],[1390,1530],[1420,1770],[1100,1780]
];
export function paperPositions(lessons) {
  return lessons.map((lesson, i) => ({ id: lesson.id, x: PAPER_TRAIL[i][0], y: PAPER_TRAIL[i][1] }));
}
export function paperTrailPath(nodes = PAPER_TRAIL.map(([x,y]) => ({x,y}))) {
  if (!nodes.length) return '';
  let d = `M${nodes[0].x} ${nodes[0].y}`;
  for (let i=0; i<nodes.length-1; i++) {
    const a=nodes[i-1]||nodes[i], b=nodes[i], c=nodes[i+1], e=nodes[i+2]||c;
    if (i===1) { d+=`C470 425 525 376 583 348C625 322 709 325 804 394C858 414 905 422 ${c.x} ${c.y}`;continue; }
    if (i===3) { d+=`C1360 420 1535 385 1540 455C1550 535 1515 570 ${c.x} ${c.y}`;continue; }
    if (i===5) { d+=`C1172 737 1145 739 1117 732C1040 659 905 609 832 688C822 744 856 778 ${c.x} ${c.y}`;continue; }
    d += `C${b.x+(c.x-a.x)/6} ${b.y+(c.y-a.y)/6} ${c.x-(e.x-b.x)/6} ${c.y-(e.y-b.y)/6} ${c.x} ${c.y}`;
  }
  return d;
}
export const PAPER_FLAGS = [
  {...paperPoint([1066,55]),width:39,height:27,phase:.3},
  {...paperPoint([1116,77]),width:35,height:24,phase:1.7}
];
export const PAPER_MILL = {...paperPoint([1155,216]),radius:93};
export const PAPER_BOATS = [
  {x:265,y:555,size:1,amplitude:28,period:17,phase:.1,color:'ivory'},
  {x:500,y:585,size:.83,amplitude:24,period:21,phase:2.8,color:'blue'}
];
export const PAPER_CLOUDS = [
  {x:225,y:105,width:225,amplitude:56,period:52,phase:.4},
  {x:780,y:60,width:165,amplitude:48,period:58,phase:2.5}
];
export const PAPER_PIGEON = {x:775,y:177,amplitude:150,period:68,size:1.15};

// These source-pixel outlines follow only blue paper, leaving both bridges still.
const RIVER_SOURCE = [
  [[647,195],[689,185],[723,177],[730,184],[755,191],[807,180],[852,177],[889,179],[906,185],[852,195],[818,199],[790,202],[758,207],[771,215],[823,223],[918,236],[988,244],[949,252],[851,244],[791,244],[748,236],[756,227],[716,220],[686,213],[656,204]],
  [[412,282],[464,257],[555,237],[623,239],[642,250],[691,259],[704,267],[723,273],[782,284],[844,297],[873,306],[850,317],[800,316],[752,312],[669,304],[580,292],[532,284],[504,286],[478,283]],
  [[858,357],[886,351],[918,347],[947,357],[965,370],[1006,377],[1044,389],[1101,395],[1195,427],[1300,460],[1410,492],[1515,511],[1574,499],[1478,478],[1390,459],[1312,441],[1210,417],[1123,389],[1080,386],[1035,371],[1008,369],[975,357],[953,342],[919,335],[887,340]]
];
export const PAPER_WATER = RIVER_SOURCE.map(poly => poly.map(p => paperPoint(p)));
export function paperInside(p, polygon) {
  let value=false;
  for (let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const a=polygon[i],b=polygon[j];
    if ((a.y>p.y)!==(b.y>p.y) && p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x) value=!value;
  }
  return value;
}
export function paperInWater(p) { return PAPER_WATER.some(poly => paperInside(p,poly)); }
export const PAPER_BRIDGES=[[[722,168],[755,161],[780,167],[814,176],[838,190]],[[853,332],[864,316],[886,312],[913,314],[942,324],[970,340],[1002,353]]].map(a=>a.map(paperPoint));
function distanceToSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,f=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-a.x-f*dx,p.y-a.y-f*dy);}
export function paperOnBridge(p){return PAPER_BRIDGES.some(poly=>poly.slice(1).some((b,i)=>distanceToSegment(p,poly[i],b)<17));}
export function paperIsWalkable(p) {
  if(!Number.isFinite(p?.x)||!Number.isFinite(p?.y)||p.x<60||p.x>1540||p.y<300||p.y>1875)return false;
  if(p.x>1350&&p.x<1490&&p.y>410&&p.y<575)return false;
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
const WAYPOINTS = [...PAPER_BRIDGES.flat().map(p=>[p.x,p.y]),[560,347],[830,398],[850,665],[1145,730],[90,675],[380,750],[690,800],[1000,870],[1300,1020],[1500,1050],[1320,590],[1520,395],[1530,595],
  [130,450],[390,420],[555,400],[680,480],[1020,480],[1310,540],[1500,550],
  [890,690],[980,750],[1100,810]].map(([x,y])=>({x,y}));
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
  const random=paperSeed(),result=[];
  const beds=[[65,335,160],[240,355,110],[400,360,130],[540,350,110],
    [970,345,95],[1485,420,155],[1030,590,85],[1340,655,90],
    [70,860,125],[655,920,80],[1280,1060,80],[1510,1380,145],
    [70,1450,110],[800,1425,70],[560,1610,85],[1295,1680,110],
    [90,1890,220],[730,1860,200],[1490,1890,240],
    [700,850,110],[1460,830,150],[780,1140,115],[440,1450,140],[1190,1470,160],
    [560,1780,175],[80,1120,180],[1530,1170,140]];
  for(const [bx,by,base] of beds) for(let k=0;k<4;k++) {
    const x=bx+(random()-.5)*105,y=by+(random()-.5)*26;
    const kind=k===0?'pine':k===1?'round':k===2?'bush':'sprout';
    const h=base*(k===0?1:k===1?.72:k===2?.37:.24),w=h*(kind==='pine'?.86:kind==='round'?.98:1.15);
    if(x-w/2<5||x+w/2>1595||paperInWater({x,y})) continue;
    if(nodes.some(n=>Math.abs(x-n.x)<w/2+100 && y>n.y-60 && y-h<n.y+115)) continue;
    if((x+w/2>1030&&x-w/2<1400&&y>110&&y-h<390)||(x+w/2>1320&&x-w/2<1520&&y>320&&y-h<560))continue;
    result.push({id:result.length,x,y,w,h,kind,palette:result.length%4,amplitude:kind==='pine'?.035:.05,period:5.5+random()*3,phase:random()*Math.PI*2});
  }
  return result;
}
