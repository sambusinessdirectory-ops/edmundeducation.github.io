import { shorePath, shoreStep, shoreIsWalkable } from './sentence-structure-coast-navigation.mjs?v=20260912-sentence1';

const ART='./assets/sentence-structure/coast/';
export const SHORE_LAYOUT={startX:160,columnGap:205,rowYs:[580,790,1130,1410,1660]};
const REGIONS={
  stone:['props',34,157,523,361],boat:['props',613,34,430,521],bridge:['props',1150,14,294,570],
  grass:['props',8,567,526,445],daisies:['props',536,626,477,377],shrub:['props',1025,648,504,354],
  cloud1:['clouds',69,76,1389,284],cloud2:['clouds',319,400,858,318],cloud3:['clouds',151,779,1217,190]
};
let artId=0;
function art(kind,cls='shore-art') {
  const [sheet,x,y,w,h]=REGIONS[kind],clip=`shore-sprite-${++artId}`;
  return `<svg class="${cls}" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><image href="${ART}${sheet}.webp" width="1536" height="1024" clip-path="url(#${clip})"/></svg>`;
}
function seeded(seed=91827){return()=>((seed=seed*16807%2147483647)-1)/2147483646;}
export function shorePlants(nodes) {
  const random=seeded(),plants=[];
  const beds=[
    [60,506,130],[338,499,62],[1140,499,70],[1525,506,125],
    [55,734,110],[970,729,60],[1508,745,112],
    [375,840,70],[617,844,85],[1192,846,78],
    [52,1049,96],[504,1048,55],[1000,1046,68],[1440,1054,57],
    [57,1326,155],[665,1325,64],[1489,1360,95],
    [164,1575,103],[971,1565,66],[1444,1584,105],
    [45,1860,152],[800,1850,150]
  ];
  beds.forEach(([x,y,size],bed)=>{
    for(let i=0;i<4;i++) {
      const kind=['grass','daisies','grass','shrub'][i];
      const width=size*(i===0?1:.36+random()*.24),px=x+(random()-.5)*size*.9,py=y+random()*18;
      const height=width*(kind==='grass'?.84:.73);
      if(nodes.some(n=>Math.abs(px-n.x)<width*.5+96 && py>n.y-55 && py-height<n.y+108))continue;
      if(!shoreIsWalkable({x:Math.min(1538,Math.max(62,px)),y:py})&&py>580&&py<1790)continue;
      const max=kind==='grass'?4.1:kind==='daisies'?3.3:2.6;
      plants.push({kind,x:px,y:py,width,height,bed,a:-max*(.65+random()*.35),b:max*(.65+random()*.35),duration:5.2+random()*3,delay:-random()*19,direction:random()>.5?'normal':'reverse'});
    }
  });
  return plants;
}
function plantsMarkup(nodes) {
  return shorePlants(nodes).map(p=>`<span class="shore-plant" data-plant="${p.kind}" data-bed="${p.bed}" style="left:${p.x}px;top:${p.y}px;width:${p.width}px;height:${p.height}px;--a:${p.a}deg;--b:${p.b}deg;--duration:${p.duration}s;--delay:${p.delay}s;--direction:${p.direction}"><span class="shore-foliage">${art(p.kind)}</span></span>`).join('');
}

// Masks only touch water. The still image retains the cliffs, island and rocks.
export const SHORE_SEA_MASK='M500 267H1380L1350 294L1300 318L1270 380L1170 395L1085 420L1230 440L1320 475L1375 495L1280 520L1160 490L1070 520L930 525L840 535L660 528L530 510L420 470L335 430L485 420L640 395L610 370L555 350L520 320Z M742 266L946 266L965 312L722 315Z';
export const SHORE_STREAM_MASK='M0 890L160 891L195 926L322 927L388 902L474 909L566 927L630 918L680 915L680 956L615 966L570 952L490 954L370 977L292 964L220 960L153 939L80 947L0 940Z M850 922L921 943L978 954L1085 960L1190 968L1300 943L1350 929L1384 947L1347 977L1280 991L1190 981L1120 989L1030 979L963 984L932 966L870 975Z';
function water() {
  const id=`shore-water-${++artId}`,random=seeded(90210);
  const waves=Array.from({length:34},(_,i)=>{
    const x=480+random()*850,y=310+random()*215,w=18+random()*49;
    return `<path class="shore-wave" d="M${x} ${y}q${w*.35} 3 ${w} 0" style="--duration:${7+random()*7}s;--delay:${-random()*20}s;--drift:${8+random()*12}px"/>`;
  }).join('');
  const foam=[
    'M273 416Q320 423 357 416T440 406','M496 388q26 10 53 2t40 3',
    'M1040 415q46 12 97 4t64 7','M1275 443q44 14 92 9t38 5',
    'M1360 484q32 16 72 8','M777 312q50 9 107-1',
    'M4 897q50 18 103 4','M191 929q25 15 60 8',
    'M371 929q30 11 64 1','M873 950q22 13 56 8',
    'M1070 970q33 11 78 2','M1265 979q70-7 99-29'
  ];
  return `<svg class="shore-water" viewBox="0 0 1600 1950" aria-hidden="true"><defs><clipPath id="${id}-sea"><path d="${SHORE_SEA_MASK}" clip-rule="evenodd"/></clipPath><clipPath id="${id}-stream"><path d="${SHORE_STREAM_MASK}"/></clipPath></defs>
    <g clip-path="url(#${id}-sea)"><g class="shore-ocean-surface"><image href="${ART}background.webp" width="1600" height="1950"/></g>${waves}</g>
    <g clip-path="url(#${id}-stream)"><g class="shore-stream-surface"><image href="${ART}background.webp" width="1600" height="1950"/></g>${[915,933,953,972].map((y,i)=>`<path class="shore-current" d="M0 ${y}Q330 ${y+15} 670 ${y}T1440 ${y+12}" style="--delay:${-i*3}s"/>`).join('')}</g>
    ${foam.map((d,i)=>`<path class="shore-foam" d="${d}" style="--duration:${6+i%4}s;--delay:${-i*1.31}s"/>`).join('')}
  </svg>`;
}
export function shoreRoute(nodes) {
  return nodes.map((p,i)=>{
    if(!i)return `M${p.x} ${p.y}`;
    const a=nodes[i-1];
    if(i===14)return `C100 ${a.y} 100 825 100 850L100 1030C100 1085 100 ${p.y} ${p.x} ${p.y}`;
    if(a.x===p.x){const bend=p.x>800?100:-75;return `C${a.x+bend} ${a.y+75} ${p.x+bend} ${p.y-75} ${p.x} ${p.y}`;}
    return `C${(a.x+p.x)/2} ${a.y} ${(a.x+p.x)/2} ${p.y} ${p.x} ${p.y}`;
  }).join(' ');
}
function routeMarkup(nodes) {
  const d=shoreRoute(nodes),id=`shore-sand-${++artId}`;
  return `<svg class="shore-route" viewBox="0 0 1600 1950" aria-hidden="true"><defs><pattern id="${id}" width="45" height="39" patternUnits="userSpaceOnUse"><rect width="45" height="39" fill="#efdaad"/><circle cx="8" cy="10" r="1.1" fill="#d3b983"/><circle cx="29" cy="29" r="1.5" fill="#fff3d4"/><path d="M16 21l3 1M39 8l2 1" stroke="#d4bb8e" stroke-width="1.2"/></pattern></defs>
    <path d="${d}" fill="none" stroke="#4e6657" stroke-width="76" opacity=".16" stroke-linecap="round" transform="translate(0 7)"/>
    <path d="${d}" fill="none" stroke="#c3b788" stroke-width="75" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="#fff1cd" stroke-width="69" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="url(#${id})" stroke-width="61" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="#fff6dd" stroke-width="2" opacity=".7" stroke-dasharray="2 39" stroke-linecap="round"/>
  </svg><span class="shore-bridge" aria-hidden="true">${art('bridge')}</span>`;
}
function milestone(p,number) {
  // A small driftwood trail marker beside each tenth stone.
  return `<svg class="shore-milestone" data-milestone="${number}" style="left:${p.x-97}px;top:${p.y-55}px" viewBox="0 0 70 100" aria-hidden="true"><path d="M32 97L34 27L42 28L41 96Z" fill="#8d7653"/><path d="M5 20L58 17L65 30L58 47L6 49L2 34Z" fill="#d3ba8b" stroke="#887653" stroke-width="2"/><path d="M7 24L54 22M8 44L55 42" stroke="#f7e4bb"/><text x="33" y="40" text-anchor="middle" fill="#285867" font-family="Georgia,serif" font-size="21" font-weight="bold">${number}</text><path d="M24 87q14-10 30 2" fill="none" stroke="#87935b" stroke-width="5"/></svg>`;
}
function terrain(nodes,lessons) {
  const clouds=[['cloud1',120,36,320,77,-13,'alternate'],['cloud2',612,30,215,63,-26,'alternate-reverse'],['cloud3',1060,93,280,83,-9,'alternate']];
  return `<div class="shore-scenery" aria-hidden="true"><img class="shore-background" src="${ART}background.webp" width="1600" height="1950" alt="" decoding="async">${water()}
    ${clouds.map(([kind,x,y,width,time,delay,direction])=>`<span class="shore-cloud" data-cloud="${kind}" style="left:${x}px;top:${y}px;width:${width}px;height:100px;--duration:${time}s;--delay:${delay}s;--direction:${direction}">${art(kind)}</span>`).join('')}
    <span class="shore-boat" style="left:1020px;top:321px;width:70px;height:87px">${art('boat')}<i class="shore-wake"></i></span>
    <canvas class="shore-flying-gull" data-flying-gull="0" width="256" height="220"></canvas><canvas class="shore-flying-gull" data-flying-gull="1" width="256" height="220"></canvas>
    ${routeMarkup(nodes)}${plantsMarkup(nodes)}${nodes.map((p,i)=>lessons[i].order%10===0?milestone(p,lessons[i].order):'').join('')}
    <canvas class="shore-perched-gull" width="300" height="330" aria-hidden="true"></canvas><canvas class="shore-crab" width="180" height="110" aria-hidden="true"></canvas>
  </div>`;
}

// Each frame has an explicit source rectangle and registered feet/body anchor.
// Interpolated opacity provides a soft pose change without reflecting an animal.
const GULL=[
  [50,136,312,252,187,380],[400,135,312,253,532,380],
  [738,124,323,264,876,380],[1092,10,326,378,1236,380]
];
const CRAB=[
  [30,496,318,197,187,683],[397,496,316,197,554,683],
  [746,496,313,197,903,683],[1104,496,315,197,1261,683]
];
const FLY=[
  [23,872,369,139,210,982],[410,765,303,247,554,982],
  [764,739,279,273,900,982],[1105,874,314,187,1254,982]
];
function interpolateFrames(sequence,t) {
  if(t<=sequence[0][0])return [sequence[0][1],sequence[0][1],0];
  for(let i=1;i<sequence.length;i++)if(t<=sequence[i][0]){
    const a=sequence[i-1],b=sequence[i];return [a[1],b[1],(t-a[0])/(b[0]-a[0])];
  }
  return [0,0,0];
}
export function perchedGullPose(seconds) {
  const wing=seconds%27;
  if(wing>=12&&wing<=16.4)return interpolateFrames([[12,0],[12.7,2],[13.6,3],[14.3,3],[15.3,2],[16.4,0]],wing);
  const blink=seconds%7.7;
  if(blink>=3.5&&blink<=3.77)return [0,1,blink<3.59?(blink-3.5)/.09:blink<3.68?1:(3.77-blink)/.09];
  return [0,0,0];
}
export function crabPose(seconds) {
  return interpolateFrames([[0,0],[5.5,0],[6.4,1],[7.8,0],[10,0],[11,2],[12.5,0],[16.5,0],[17.5,3],[19,0],[23,0]],seconds%23);
}
function paintPose(canvas,image,frames,pose,scale,rock=0) {
  const ctx=canvas.getContext('2d'),w=canvas.width/2,h=canvas.height/2;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(!image.complete||!image.naturalWidth)return;
  ctx.save();ctx.scale(2,2);ctx.translate(w/2,h-5);ctx.rotate(rock);
  const draw=(index,alpha)=>{
    if(alpha<=0)return;
    const [x,y,sw,sh,anchorX,anchorY]=frames[index];
    ctx.globalAlpha=alpha;ctx.drawImage(image,x,y,sw,sh,(x-anchorX)*scale,(y-anchorY)*scale,sw*scale,sh*scale);
  };
  if(pose[0]===pose[1])draw(pose[0],1);else {draw(pose[0],1-pose[2]);draw(pose[1],pose[2]);}
  ctx.restore();canvas.dataset.pose=pose.join(',');
}
function mount(root,reduced) {
  root.querySelector('.expression-map-viewport').setAttribute('aria-label','句子結構海岸地圖，第 1 至 30 課；可拖動、點選石階，或用方向鍵 / WASD 走動。');
  root.querySelectorAll('.expression-map-stone').forEach(stone=>stone.insertAdjacentHTML('afterbegin',art('stone','shore-stone-art')));
  const flag=root.querySelector('.expression-map-flag');
  flag.innerHTML=`<ellipse cx="7" cy="95" rx="9" ry="3" fill="#385756" opacity=".2"/><path d="M7 94V6" stroke="#947951" stroke-width="4" stroke-linecap="round"/><path d="M5 80l5 2M5 84l5 2M5 88l5 2" stroke="#f0dcac" stroke-width="2"/><circle cx="7" cy="5" r="4" fill="#e3cf99"/><g class="shore-pennant"><path class="expression-map-flag-cloth" d="M10 12Q31 8 52 14L43 29L52 45Q33 38 10 43Z" fill="var(--flag-color)" stroke="#fff2cf" stroke-width="1.6"/><path d="M22 26q9-14 18 0l-9 10Z M26 23l5 13l5-13M31 21v15" fill="none" stroke="#fff6dc" stroke-width="1.6" stroke-linecap="round"/></g>`;
  const gull=root.querySelector('.shore-perched-gull'),crab=root.querySelector('.shore-crab'),fliers=[...root.querySelectorAll('.shore-flying-gull')];
  const image=new Image();image.src=new URL(ART+'wildlife.webp',import.meta.url).href;
  let elapsed=0,last=0,disposed=false;
  const draw=(now)=>{
    if(disposed)return;
    if(last)elapsed+=Math.min(100,Math.max(0,now-last))/1000;
    last=now;const t=reduced.matches?0:elapsed;
    paintPose(gull,image,GULL,perchedGullPose(t),.35,reduced.matches?0:Math.sin(t*.74)*.017);
    paintPose(crab,image,CRAB,crabPose(t),.23,reduced.matches?0:Math.sin(t*.53)*.018);
    fliers.forEach((canvas,i)=>{
      const phase=(t+i*5.3)%10;
      const pose=interpolateFrames([[0,0],[5.8,0],[6.3,1],[6.8,2],[7.4,1],[7.9,0],[8.4,3],[9,0],[10,0]],phase);
      paintPose(canvas,image,FLY,pose,i?.14:.23);
      const x=1490-((t*(i?5.8:7.2)+i*740+160)%1580);
      const y=(i?173:110)+Math.sin(t*.10+i*3)*20;
      canvas.style.transform=`translate(${x}px,${y}px)`;
    });
  };
  image.onload=()=>draw(performance.now());
  draw(performance.now());
  return {draw,destroy(){disposed=true;image.onload=null;}};
}
export const SENTENCE_COAST=Object.freeze({
  id:'sentence-shore',title:'句型海岸之旅',kicker:'THE SENTENCE SHORE',
  width:1600,height:1950,layout:SHORE_LAYOUT,terrain,mount,
  navigation:{path:shorePath,step:shoreStep},
  cameraTop:({point,scale,height,zoom})=>zoom===1&&height>=600&&point.y<625?0:point.y*scale-height*.4
});
