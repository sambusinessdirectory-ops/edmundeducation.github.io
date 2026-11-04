export const ZEN_OFFSET=3900, ZEN_HEIGHT=1250;
export const ZEN_LAYOUT={startX:160,columnGap:205,rowYs:[360,580,780,1000,1160]};
export const ART_SIZE={width:2005,height:784};
export const artPoint=([x,y])=>({x:x*3200/ART_SIZE.width-800,y:y*ZEN_HEIGHT/ART_SIZE.height});
// Focal scenery belongs to the normal-width map; the sides are quiet grass.
export const WATER_SHAPES=[
 [[889,297],[925,289],[971,286],[1017,288],[1059,285],[1093,277],[1120,287],[1172,306],[1201,316],[1183,326],[1113,330],[1041,330],[975,327],[927,324],[902,314]],
 [[857,419],[884,408],[925,407],[951,399],[990,400],[1027,409],[1080,416],[1122,429],[1111,442],[1054,448],[995,448],[944,447],[892,441],[868,431]],
 [[1023,541],[1069,530],[1099,531],[1138,534],[1177,539],[1210,550],[1235,559],[1242,570],[1204,580],[1151,579],[1106,575],[1060,568],[1033,554]]
];
export const POND_BANKS=[
 [[849,290],[905,270],[966,271],[1010,276],[1067,257],[1116,262],[1186,289],[1226,319],[1197,341],[1099,342],[998,340],[913,338],[872,322]],
 [[821,406],[873,384],[939,379],[991,386],[1042,399],[1109,407],[1161,431],[1131,460],[1046,465],[947,460],[870,454],[836,435]],
 [[992,531],[1047,510],[1104,511],[1162,523],[1214,535],[1256,557],[1275,579],[1218,595],[1140,591],[1088,588],[1033,574],[1008,557]]
];
export const ZEN_BRIDGE=[[1023,273],[1059,249],[1094,248],[1133,258],[1190,287],[1188,304],[1134,278],[1094,268],[1064,270],[1036,286]];
export function pointInside(p,polygon){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
 const [ax,ay]=polygon[i],[bx,by]=polygon[j];if((ay>p.y)!==(by>p.y)&&p.x<(bx-ax)*(p.y-ay)/(by-ay)+ax)inside=!inside;
}return inside;}
export function zenIsWalkable(p){
 const q={x:(p.x+800)*ART_SIZE.width/3200,y:p.y*ART_SIZE.height/ZEN_HEIGHT};
 return pointInside(q,ZEN_BRIDGE)||!POND_BANKS.some(poly=>pointInside(q,poly));
}
export const KOI=[
 {pond:0,x:951,y:310,rx:32,ry:5,phase:.8,direction:1,period:49,width:59,pattern:0},
 {pond:0,x:1152,y:316,rx:23,ry:4,phase:3.4,direction:-1,period:61,width:61,pattern:1},
 {pond:1,x:918,y:428,rx:25,ry:5,phase:1.7,direction:-1,period:53,width:61,pattern:1},
 {pond:1,x:1073,y:432,rx:24,ry:5,phase:4.6,direction:1,period:63,width:58,pattern:0},
 {pond:2,x:1092,y:552,rx:23,ry:5,phase:2.8,direction:1,period:51,width:58,pattern:0},
 {pond:2,x:1198,y:566,rx:18,ry:4,phase:5.3,direction:-1,period:58,width:55,pattern:1}
];
export const LOTUS=[
 [1007,316,27,0],[1033,321,26,0],[1060,321,29,0],
 [975,438,28,1],[998,440,29,1],[1021,441,24,1],
 [1140,560,29,2],[1161,566,27,2],[1177,572,24,2]
];
export const LAMPS=[[558,157,50],[730,181,41],[757,190,35],[1021,74,36],[1428,305,56]];
export const NORREN={left:1155,top:62,width:68,height:61};
export const CAT={x:1086,y:142,width:87};
export const DOOR={x:1110,y:129};
