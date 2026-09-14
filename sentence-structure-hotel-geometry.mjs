export const HOTEL_OFFSET=8850;
export const HOTEL_ART={width:1402,height:1122};
export const HOTEL_SCALE=1600/HOTEL_ART.width;
export const HOTEL_HEIGHT=HOTEL_ART.height*HOTEL_SCALE;
export const hotelPoint=([x,y])=>({x:x*HOTEL_SCALE,y:HOTEL_OFFSET+y*HOTEL_SCALE});
// Preserve all 21 painted doors. The first nine rooms each host two lessons.
const rooms=[
 ...[365,460,555,845,941,1035].map(x=>[x,908]),
 ...[500,700,901].map(x=>[x,794]),
 ...[500,700,901].map(x=>[x,682]),
 ...[500,700,901].map(x=>[x,571]),
 ...[500,700,901].map(x=>[x,460]),
 ...[500,700,901].map(x=>[x,349])
];
let first=150;
export const HOTEL_ROOMS=rooms.map(([x,y],i)=>{const count=i<9?2:1;const indices=Array.from({length:count},()=>first++);return {room:i+1,x,y,indices,point:hotelPoint([x,y])};});
export function hotelPositions(lessons){return lessons.map((lesson,i)=>{const r=HOTEL_ROOMS.find(r=>r.indices.includes(i+150));return {id:lesson.id,...r.point,hotelRoom:r.room};});}
export function hotelArrivalIndex(nodes,position,selected){
 if(position.y<HOTEL_OFFSET)return undefined;
 if(nodes[selected]&&Math.hypot(nodes[selected].x-position.x,nodes[selected].y-position.y)<42)return selected;
 return nodes.findIndex(n=>Math.hypot(n.x-position.x,n.y-position.y)<42);
}
export const HOTEL_LIFT_X=225*HOTEL_SCALE;
export const HOTEL_FLOORS=[349,460,571,682,794,908].map(y=>HOTEL_OFFSET+y*HOTEL_SCALE);
export const HOTEL_WAYPOINTS=[{x:HOTEL_LIFT_X,y:HOTEL_OFFSET-12},...HOTEL_FLOORS.map(y=>({x:HOTEL_LIFT_X,y}))];
export function hotelIsWalkable(p){
 if(p.y<HOTEL_OFFSET)return true;
 if(Math.abs(p.x-HOTEL_LIFT_X)<=12)return true;
 return HOTEL_FLOORS.some(y=>Math.abs(p.y-y)<=12)&&p.x>=HOTEL_LIFT_X-12&&p.x<=1090*HOTEL_SCALE;
}
export function hotelCompanionVisible(p){return p.y<HOTEL_OFFSET||(p.x>308*HOTEL_SCALE&&HOTEL_FLOORS.some(y=>Math.abs(p.y-y)<14));}
export function hotelJourneyDuration({distance,from,to}){return from.y>=HOTEL_OFFSET||to.y>=HOTEL_OFFSET?Math.max(450,Math.min(9500,distance/.22)):undefined;}
export function hotelElevatorState(p){
 const x=p.x/HOTEL_SCALE,y=(p.y-HOTEL_OFFSET)/HOTEL_SCALE;
 const approach=Math.max(0,Math.min(1,(312-x)/55)),v=approach*approach*(3-2*approach);
 return {x:225,y,alpha:y>=343&&y<=914&&x>=205?v:0,passengerX:Math.max(225,Math.min(312,x)),gate:Math.max(0,Math.min(1,(x-240)/45)),riding:x<243&&y>=343&&y<=914};
}
export const HOTEL_FLAGS=[{x:241,y:43,w:62,h:42,phase:0},{x:1165,y:43,w:60,h:42,phase:1.3}];
export const HOTEL_PLANTS=[
 [783,311,26,29,340],[442,423,25,25,447],[783,427,25,25,451],
 [437,539,25,24,562],[326,654,22,19,673],[436,762,26,25,785],
 [784,765,25,24,787],[1068,764,28,29,790],[326,873,24,23,895],[1081,879,23,23,901],
 [510,945,30,42,983],[581,961,26,36,994],[823,963,26,36,997],[891,944,30,45,985]
];
export const HOTEL_TREES=[
 [15,321,28,65,390],[71,333,28,45,378],[22,452,35,80,532],[97,474,37,95,565],
 [33,714,55,133,850],[93,827,54,154,980],[12,946,28,86,1030],
 [1293,174,42,63,237],[1365,177,50,81,257],[1331,392,52,135,526],
 [1380,502,37,121,620],[1328,689,66,177,860],[1391,816,48,167,978],
 [146,991,23,38,1029],[367,1001,25,53,1054],[1040,1001,25,54,1053],
 [1108,1045,35,60,1105],[1372,1017,23,50,1067]
];
export const HOTEL_LIGHTS=[
 ...[276,388,498,609,721].flatMap(y=>[418,590,812,985].map(x=>[x,y,27])),
 ...[413,508,893,988].map(x=>[x,841,24]),[1028,736,31],
 [56,876,46],[1344,875,46],[595,901,35],[805,903,35],
 ...[626,663,700,738,774].map(x=>[x,866,19]),[700,949,38]
];
export const HOTEL_TRAIN_OUTLINE=[[1307,225],[1317,217],[1338,212],[1402,212],[1402,225],[1393,225],[1389,236],[1381,246],[1377,255],[1368,260],[1368,268],[1354,272],[1346,273],[1330,276],[1311,273],[1307,265]];
export const HOTEL_TRAIN={period:23,from:-174,to:110,slope:-.44};
export function hotelTrainPose(t){const p=((t%HOTEL_TRAIN.period)+HOTEL_TRAIN.period)%HOTEL_TRAIN.period/HOTEL_TRAIN.period,dx=HOTEL_TRAIN.from+(HOTEL_TRAIN.to-HOTEL_TRAIN.from)*p;return {dx,dy:dx*HOTEL_TRAIN.slope,phase:p};}
export function hotelFlagOffset(t,u,phase=0){return Math.sin(t*1.75-u*4.5+phase)*3.1*u;}
export function hotelLightLevel(t,phase){return .88+.18*Math.sin(t*.69+phase)+.09*Math.sin(t*.31+phase*2.1);}
// Exterior mask follows the actual silhouette, protecting every indoor corridor.
export const HOTEL_SILHOUETTE=[[126,953],[126,257],[119,232],[193,232],[195,172],[209,146],[232,131],[254,139],[276,166],[285,218],[307,219],[340,184],[397,184],[405,136],[427,128],[430,84],[465,72],[505,72],[547,7],[647,7],[660,0],[741,0],[748,7],[855,7],[900,73],[949,73],[970,89],[977,130],[1000,138],[1006,183],[1067,183],[1100,218],[1118,218],[1119,172],[1137,146],[1162,132],[1182,139],[1204,160],[1221,191],[1223,230],[1277,232],[1266,259],[1266,953],[925,953],[927,1087],[872,1087],[872,1118],[528,1118],[528,1087],[465,1087],[465,953]];
