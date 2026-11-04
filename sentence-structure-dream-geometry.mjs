export const DREAM_OFFSET=5150,DREAM_HEIGHT=1850,DREAM_WIDTH=3200;
export const DREAM_ART={width:1672,height:941};
export const dreamPoint=([x,y])=>({x:x*DREAM_WIDTH/DREAM_ART.width-800,y:y*DREAM_HEIGHT/DREAM_ART.height});
// A winding trail follows the cushion slopes, leaving the bear, tent and railway clear.
export const DREAM_TRAIL=[[130,740],[320,775],[515,720],[700,630],[890,530],[1090,515],[1460,730],[1490,935],[1320,1095],[1120,1125],[930,1035],[740,910],[540,925],[350,995],[160,1100],[155,1280],[345,1395],[540,1320],[730,1200],[920,1255],[1110,1400],[1310,1420],[1470,1580],[1310,1740],[1110,1700],[915,1575],[720,1485],[530,1510],[340,1650],[155,1750]];
export function dreamPositions(lessons){return lessons.map((lesson,i)=>({id:lesson.id,x:DREAM_TRAIL[i][0],y:DREAM_TRAIL[i][1]+DREAM_OFFSET}));}
// Hanging decorations are placed in world units so their visible motion is independent of the surround.
export const DREAM_STARS=[[85,280,70,1.1],[630,225,60,2.6],[805,320,60,.5],[1270,235,58,3.9],[715,570,52,1.8],[1490,610,60,4.2],[530,560,50,2.9]];
export const DREAM_FLAGS=[[898,140,28,19],[935,97,31,21],[986,113,30,20],[1021,140,28,19]];
export const DREAM_MOON={x:520,y:330,size:114};
export const DREAM_RAIL={x:1110,y:800,rx:205,ry:83,period:34,carOffsets:[0,.55,1.03],gauge:50};
export const DREAM_BELLY={x:532,y:316,rx:65,ry:33,anchor:350};
export const DREAM_CLOUDS=[[816,300,66,49],[1060,351,67,25],[1260,350,70,34],[1450,276,120,60],[93,410,88,90],[865,754,68,35],[1325,825,90,50]];
export function dreamTrailPath(){
 const p=DREAM_TRAIL;let d=`M${p[0][0]} ${p[0][1]}`;
 for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c;let c1=[b[0]+(c[0]-a[0])/6,b[1]+(c[1]-a[1])/6],c2=[c[0]-(e[0]-b[0])/6,c[1]-(e[1]-b[1])/6];
  if(i===5){c1=[1270,505];c2=[1495,575];} // Curve around the tent and upper railway edge.
  d+=`C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${c[0]} ${c[1]}`;
 }return d;
}
