export const DREAM_OFFSET=5150,DREAM_HEIGHT=2134,DREAM_WIDTH=3200;
export const DREAM_ART={width:1536,height:1024};
export const dreamPoint=([x,y])=>({x:x*DREAM_WIDTH/DREAM_ART.width-800,y:y*DREAM_HEIGHT/DREAM_ART.height});
const ROWS=[[542,521,508,472,480,515],[649,641,628,603,620,644],[745,739,733,716,731,742],[848,839,829,819,830,847],[957,953,946,941,948,958]];
export function dreamPositions(lessons){return lessons.map((lesson,i)=>{const row=Math.floor(i/6),col=row%2?5-i%6:i%6,p=dreamPoint([430+col*130,ROWS[row][col]]);return {id:lesson.id,x:p.x,y:p.y+DREAM_OFFSET};});}
export const DREAM_STARS=[[297,214,64,1.1],[758,193,49,2.6],[1020,92,65,.5],[1145,205,48,3.9],[1202,299,59,1.8],[1210,548,45,4.2],[1380,646,58,2.9]];
export const DREAM_FLAGS=[[850,174,26,15],[894,118,30,18],[940,151,27,16],[982,191,24,14]];
export const DREAM_MOON={x:537,y:176,size:116};
export const DREAM_RAIL={x:1262,y:807,rx:177,ry:49,period:72};
export const DREAM_BELLY={x:387,y:421,rx:92,ry:47,anchor:469};
export const DREAM_CLOUDS=[[711,307,91,52],[1100,286,70,65],[1185,361,107,39],[1464,211,66,66],[1150,554,77,54],[775,460,133,48],[1060,428,118,56],[1005,656,104,34]];
