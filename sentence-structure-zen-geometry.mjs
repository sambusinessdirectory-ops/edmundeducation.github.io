export const ZEN_OFFSET=3900, ZEN_HEIGHT=2250;
export const ZEN_LAYOUT={startX:160,columnGap:205,rowYs:[715,1090,1450,1860,2120]};
export const ART_SIZE={width:1496,height:1051};
export const artPoint=([x,y])=>({x:x*3200/1496-800,y:y*2250/1051});
// Coordinates are traced against the final painting, before its world transform.
export const WATER_SHAPES=[
 [[581,421],[631,412],[691,409],[754,414],[793,426],[845,419],[899,408],[965,410],[1009,427],[998,451],[970,466],[858,469],[768,468],[678,460],[619,451]],
 [[528,607],[575,589],[630,583],[692,573],[753,577],[815,587],[868,596],[910,610],[893,627],[834,638],[737,639],[647,637],[576,632]],
 [[787,777],[831,758],[889,749],[941,762],[993,760],[1042,779],[1083,792],[1080,814],[1028,828],[956,825],[911,814],[849,811],[821,797]]
];
export const POND_BANKS=[
 [[549,405],[648,390],[736,395],[789,411],[885,387],[1004,396],[1047,429],[1024,477],[906,487],[739,482],[632,476],[574,452]],
 [[473,590],[548,561],[637,555],[720,561],[815,573],[892,578],[955,610],[938,643],[827,655],[656,649],[538,648],[492,620]],
 [[781,771],[825,749],[887,741],[944,754],[997,752],[1048,772],[1089,790],[1086,821],[1032,836],[955,834],[907,822],[845,819],[815,804]]
];
export const ZEN_BRIDGE=[[806,390],[856,369],[917,372],[1019,408],[1001,430],[918,405],[858,402],[815,415]];
export function pointInside(p,polygon){let inside=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
 const [ax,ay]=polygon[i],[bx,by]=polygon[j];if((ay>p.y)!==(by>p.y)&&p.x<(bx-ax)*(p.y-ay)/(by-ay)+ax)inside=!inside;
}return inside;}
export function zenIsWalkable(p){
 const q={x:(p.x+800)*1496/3200,y:p.y*1051/2250};
 return pointInside(q,ZEN_BRIDGE)||!POND_BANKS.some(poly=>pointInside(q,poly));
}
export const KOI=[
 {pond:0,x:677,y:439,rx:44,ry:7,phase:.8,direction:1,period:49,width:84,pattern:0},
 {pond:0,x:910,y:444,rx:51,ry:8,phase:3.4,direction:-1,period:61,width:89,pattern:1},
 {pond:1,x:635,y:611,rx:42,ry:9,phase:1.7,direction:-1,period:53,width:92,pattern:1},
 {pond:1,x:797,y:614,rx:47,ry:9,phase:4.6,direction:1,period:63,width:86,pattern:0},
 {pond:2,x:906,y:788,rx:31,ry:10,phase:2.8,direction:1,period:51,width:84,pattern:0},
 {pond:2,x:1022,y:801,rx:25,ry:8,phase:5.3,direction:-1,period:58,width:79,pattern:1}
];
export const LOTUS=[
 [725,451,44,0],[749,455,39,0],[780,454,50,0],
 [576,616,45,1],[600,625,48,1],[621,630,34,1],
 [940,797,48,2],[967,807,43,2],[991,813,38,2]
];
export const LAMPS=[[144,223,73],[382,263,52],[423,279,44],[805,108,47],[1378,441,76]];
export const NORREN={left:989,top:91,width:96,height:81};
export const CAT={x:883,y:197,width:147};
