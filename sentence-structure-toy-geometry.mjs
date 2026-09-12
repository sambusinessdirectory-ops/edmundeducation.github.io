export const TOY_OFFSET=7000,TOY_HEIGHT=1850,TOY_WIDTH=3200;
export const TOY_ART={width:1672,height:941};
export const toyPoint=([x,y])=>({x:x*TOY_WIDTH/TOY_ART.width-800,y:y*TOY_HEIGHT/TOY_ART.height});
// The toy trail bends around the dog, marbles, bridge and toy chest.
export const TOY_TRAIL=[[130,775],[320,865],[515,820],[700,720],[890,640],[1090,660],[1300,775],[1490,950],[1290,1050],[1090,1030],[890,930],[700,990],[490,1045],[290,1090],[120,1260],[300,1435],[495,1300],[700,1210],[905,1250],[1090,1370],[1295,1360],[1480,1480],[1430,1700],[1230,1730],[1030,1630],[830,1480],[630,1520],[435,1640],[240,1735],[110,1550]];
export function toyPositions(lessons){return lessons.map((l,i)=>({id:l.id,x:TOY_TRAIL[i][0],y:TOY_OFFSET+TOY_TRAIL[i][1]}));}
export function toyTrailPath(){let d=`M${TOY_TRAIL[0].join(' ')}`;for(let i=0;i<29;i++){const a=TOY_TRAIL[i-1]||TOY_TRAIL[i],b=TOY_TRAIL[i],c=TOY_TRAIL[i+1],e=TOY_TRAIL[i+2]||c;d+=`C${b[0]+(c[0]-a[0])/6} ${b[1]+(c[1]-a[1])/6} ${c[0]-(e[0]-b[0])/6} ${c[1]-(e[1]-b[1])/6} ${c[0]} ${c[1]}`;}return d;}
export const TOY_DOG={x:470,y:720,width:330,height:300};
export const TOY_KEY={x:340,y:655,size:48};
export const TOY_MARBLES=[
 {x:140,y:540,r:20,color:'#d13e2c',amplitude:24,period:9,phase:.2,direction:1},
 {x:680,y:620,r:24,color:'#20749c',amplitude:23,period:11,phase:1.4,direction:-1},
 {x:780,y:510,r:18,color:'#36a274',amplitude:18,period:10,phase:2.1,direction:1},
 {x:1180,y:545,r:23,color:'#d4a52f',amplitude:25,period:12,phase:.9,direction:-1},
 {x:1430,y:650,r:21,color:'#2772ab',amplitude:20,period:10.5,phase:3.4,direction:1},
 {x:320,y:1200,r:24,color:'#2e955c',amplitude:24,period:11.4,phase:2.7,direction:-1},
 {x:810,y:1120,r:19,color:'#d65138',amplitude:21,period:9.7,phase:4,direction:1},
 {x:1220,y:1500,r:24,color:'#c99b2b',amplitude:23,period:12.3,phase:5,direction:-1}
];
export const TOY_PLANES=[{x:635,y:435,size:1.1,heading:-.65,phase:0},{x:1340,y:450,size:.85,heading:.65,phase:1.6},{x:180,y:1010,size:1.15,heading:-.45,phase:3.2},{x:730,y:1680,size:1.1,heading:.2,phase:4.7}];
