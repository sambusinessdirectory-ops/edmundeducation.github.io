// Mediterranean artwork and ambient movement for Rhetorical Speaking.
// Lesson results, companion controls and saved locations stay in the shared map.
const ART = './assets/common-expression-rhetorical-speaking/coast/';
export const COAST_BOUNDS = Object.freeze({ left:60, right:1540, top:550, bottom:1885 });
const clamp = (v,a,b) => Math.min(b,Math.max(a,v));
export function coastIsWalkable(p) {
  return Number.isFinite(p?.x) && Number.isFinite(p?.y) && p.x>=COAST_BOUNDS.left && p.x<=COAST_BOUNDS.right && p.y>=COAST_BOUNDS.top && p.y<=COAST_BOUNDS.bottom;
}
// The sea and distant village are a scenic backdrop above the accessible terrace.
// The walkable terrace is convex, so a segment between allowed endpoints is dry.
export function coastPath(from,to) { return coastIsWalkable(from) && coastIsWalkable(to) ? [{x:to.x,y:to.y}] : null; }
export function coastStep(from,to) {
  if(!Number.isFinite(to?.x) || !Number.isFinite(to?.y)) return from;
  return {x:clamp(to.x,COAST_BOUNDS.left,COAST_BOUNDS.right),y:clamp(to.y,COAST_BOUNDS.top,COAST_BOUNDS.bottom)};
}

function seeded(seed=7183) {return ()=>((seed=seed*16807%2147483647)-1)/2147483646;}
// Conservative world-space footprints of the painted retaining walls/rocks.
export const COAST_MASONRY = [
 [0,525,465,645],[1120,555,1600,666],
 [0,810,565,932],[1320,850,1600,988],
 [0,1170,470,1350],[1010,1200,1600,1340],
 [0,1565,535,1805],[1060,1560,1600,1880],
 [0,1800,385,1950],[1120,1860,1600,1950]
];
export const VILLAGE_POTS = [[228,344,66],[478,425,56],[710,462,45]];
export function coastPlantLayout(nodes) {
  const random=seeded(), plants=[];
  const add=(kind,x,y,size,bed)=>{
    const extent=kind==='olive'?.52:kind==='cypress'?.3:.5;
    // Keep the complete sway envelope away from stones and captions.
    if(y>500 && nodes.some(p=>x+size*extent>p.x-109 && x-size*extent<p.x+109 && y>p.y-82 && y-size<p.y+125)) return;
    const rootRadius=size*(kind==='cypress'?.08:.18);
    if(y>500 && COAST_MASONRY.some(([l,t,r,b])=>x+rootRadius>l && x-rootRadius<r && y+4>t && y-4<b)) return;
    const amplitude=kind==='olive'?2.1:kind==='cypress'?2.4:kind==='grass'?5.2:kind==='potted'?3:3.7;
    plants.push({kind,x,y,size,bed,a:-(.8+random()*.2)*amplitude,b:(.8+random()*.2)*amplitude,c:(random()-.5)*amplitude,duration:4.2+random()*2.7,delay:-random()*11,direction:random()>.5?'normal':'reverse'});
  };
  [[40,385,290],[280,440,185],[555,468,165],[742,480,150]].forEach((p,i)=>add(i?'cypress':'olive',...p,'village'));
  // Small irregular beds follow terrace edges, with broad areas left open.
  // These are clusters, not rows of evenly spaced props or scattered single tufts.
  const beds=[
    [112,486,95,1],[765,488,76,0],
    [510,777,84,1],[1240,768,76,0],
    [225,1075,100,1],[1205,1064,95,0],
    [685,1372,110,0],[1260,1365,72,1],
    [735,1677,112,1],
    [630,1850,95,0],[890,1900,90,1]
  ];
  beds.forEach(([x,y,width,lavender],i)=>{
    const bed=`terrace-bed-${i}`;
    add(lavender?'lavender':'shrub',x-width*.19,y,58+random()*18,bed);
    add(lavender?'shrub':'lavender',x+width*.2,y+5,42+random()*12,bed);
    for(let j=0;j<5;j++) {
      const angle=random()*Math.PI,spread=.28+random()*.35;
      add('grass',x+Math.cos(angle)*width*spread,y+7+Math.sin(angle)*9,24+random()*18,bed);
    }
  });
  VILLAGE_POTS.forEach(p=>add('potted',...p,'house-entrance'));
  const counts=new Map();for(const plant of plants)counts.set(plant.bed,(counts.get(plant.bed)||0)+1);
  return plants.filter(plant=>!plant.bed.startsWith('terrace-bed-') || counts.get(plant.bed)>=3);
}

// Crop metadata follows the actual transparent artwork bounds, not a guessed grid.
const REGIONS = {
 olive:['plants',7,7,581,558],cypress:['plants',688,1,186,575],
 lavender:['plants',1002,168,527,393],shrub:['plants',50,593,464,392],
 grass:['plants',536,595,510,392],pot:['plants',1130,647,331,331],
 stone:['props',21,94,567,385],boat:['props',583,18,396,488],
 cloud:['props',1033,130,493,286],
 cloud1:['clouds-v2',69,76,1389,284],cloud2:['clouds-v2',319,400,858,318],cloud3:['clouds-v2',151,779,1217,190],petal:['props',136,589,282,349],
 leaf:['props',631,608,318,334],milestone:['props',1030,513,460,470]
};
let artworkId=0;
function artwork(kind,className='coast-prop') {
 const [sheet,x,y,w,h]=REGIONS[kind];
 const clip=`coast-art-${++artworkId}`;
 // Clip the source rectangle itself: letterboxing a square viewport must never
 // expose a neighbouring sprite from the same atlas.
 return `<svg class="${className}" viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false"><defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs><image href="${ART}${sheet}.webp" width="1536" height="1024" clip-path="url(#${clip})"/></svg>`;
}

function plantMarkup(p) {
  const style=`left:${p.x}px;top:${p.y}px;width:${p.size}px;height:${p.size}px;--a:${p.a.toFixed(3)}deg;--b:${p.b.toFixed(3)}deg;--c:${p.c.toFixed(3)}deg;--duration:${p.duration.toFixed(2)}s;--delay:${p.delay.toFixed(2)}s;--direction:${p.direction}`;
  return `<span class="coast-plant coast-${p.kind}" data-plant="${p.kind}" data-bed="${p.bed}" style="${style}">${p.kind==='potted'?artwork('pot','coast-pot'):''}<span class="coast-foliage">${artwork(p.kind==='potted'?'shrub':p.kind,'coast-plant-art')}</span></span>`;
}

// The mask stays below the island and follows the open sea above the bank.
// Buildings, sky and the shore remain entirely stationary.
export const SEA_MASK='M900 265H1600V508L1480 505L1360 495L1260 488L1160 477L1070 460L1000 440L970 400L920 370L875 340L875 305Z';
function ocean() {
 const clip=`coast-sea-${++artworkId}`,random=seeded(9227);
 const waves=Array.from({length:22},(_,i)=>{
  const x=880+random()*700,y=275+random()*230,w=20+random()*70;
  return `<path class="coast-wave" d="M${x.toFixed(1)} ${y.toFixed(1)}q${(w*.25).toFixed(1)} -2 ${(w*.5).toFixed(1)} 0t${(w*.5).toFixed(1)} 0" style="--duration:${(6+random()*6).toFixed(2)}s;--delay:-${(random()*12).toFixed(2)}s;--wave-drift:${i%2?18:-15}px"/>`;
 }).join('');
 return `<svg class="coast-ocean" viewBox="0 0 1600 1950" aria-hidden="true"><defs><clipPath id="${clip}"><path d="${SEA_MASK}"/></clipPath></defs><g clip-path="url(#${clip})"><g class="coast-ocean-surface"><image href="${ART}background.webp" width="1600" height="1950" clip-path="url(#${clip})"/></g>${waves}</g></svg>`;
}

function terrain(nodes,lessons) {
  const route=nodes.map((p,i)=>{
    if(!i) return `M${p.x} ${p.y}`;
    const a=nodes[i-1];
    if(a.x===p.x) {const bend=p.x>800?86:-86;return `C${a.x+bend} ${a.y+80} ${p.x+bend} ${p.y-80} ${p.x} ${p.y}`;}
    return `C${(a.x+p.x)/2} ${a.y} ${(a.x+p.x)/2} ${p.y} ${p.x} ${p.y}`;
  }).join(' ');
  const clouds=[['cloud1',495,44,205,60,-8,'alternate'],['cloud2',955,27,150,69,-17,'alternate-reverse'],['cloud3',1305,65,190,76,-12,'alternate']];
  const boats=[[1080,280,69,49,-9,'alternate'],[1270,235,49,62,-17,'alternate-reverse'],[1430,334,55,56,-14,'alternate']];
  return `<div class="coast-scenery" aria-hidden="true">
    <img class="coast-background" src="${ART}background.webp" width="1600" height="1950" alt="" decoding="async">
    ${ocean()}
    ${clouds.map(([kind,x,y,size,time,delay,direction])=>`<span class="coast-cloud" data-cloud="${kind}" style="left:${x}px;top:${y}px;width:${size}px;height:${size*.55}px;--duration:${time}s;--delay:${delay}s;--drift-direction:${direction}">${artwork(kind)}</span>`).join('')}
    ${boats.map(([x,y,size,time,delay,direction])=>`<span class="coast-boat" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px;--duration:${time}s;--delay:${delay}s;--drift-direction:${direction}"><span class="coast-boat-wake"></span>${artwork('boat')}</span>`).join('')}
    <svg class="coast-route" viewBox="0 0 1600 1950" xmlns="http://www.w3.org/2000/svg">
      <path d="${route}" fill="none" stroke="#6f6948" stroke-width="71" opacity=".2" stroke-linecap="round" transform="translate(0 8)"/>
      <path d="${route}" fill="none" stroke="#c9b890" stroke-width="67" stroke-linecap="round"/>
      <path d="${route}" fill="none" stroke="#fff4d4" stroke-width="62" stroke-linecap="round"/>
      <path d="${route}" fill="none" stroke="#e6d4ad" stroke-width="56" stroke-linecap="round"/>
      <path d="${route}" fill="none" stroke="#fff9e5" stroke-width="56" stroke-dasharray="2 30" opacity=".73"/>
      <path d="${route}" fill="none" stroke="#faf0d6" stroke-width="2" opacity=".9"/>
    </svg>
    ${coastPlantLayout(nodes).map(plantMarkup).join('')}
    ${nodes.map((p,i)=>lessons[i].order%10===0?`<span class="coast-milestone" data-milestone="${lessons[i].order}" style="left:${p.x-108}px;top:${p.y-44}px">${artwork('milestone')}<b>${lessons[i].order}</b></span>`:'').join('')}
  </div>`;
}

function mount(root) {
  root.querySelectorAll('.expression-map-stone').forEach(stone=>stone.insertAdjacentHTML('afterbegin',artwork('stone','coast-stone-art')));
  // A brass-tipped maritime pennant preserves the companion's saved-flag colour.
  const flag=root.querySelector('.expression-map-flag');
  if(flag) flag.innerHTML=`<ellipse cx="7" cy="95" rx="9" ry="3" fill="#365553" opacity=".22"/><path d="M7 94V5" stroke="#a17d45" stroke-width="3.5" stroke-linecap="round"/><circle cx="7" cy="5" r="4" fill="#c7a363" stroke="#fff0b9"/><path d="M1 91H13L15 97H-1Z" fill="#e9dfc9" stroke="#bba581"/><g class="coast-flag-sail"><path class="expression-map-flag-cloth" d="M10 12H53L42 29L53 47H10Z" fill="var(--flag-color)" stroke="#ffefc8" stroke-width="1.8"/><path d="M28 20V39M20 32Q28 44 36 32M24 27H32" fill="none" stroke="#fff5d9" stroke-width="2" stroke-linecap="round"/><circle cx="28" cy="21" r="2.6" fill="none" stroke="#fff5d9" stroke-width="1.6"/></g>`;
  // The shared loop also draws the companion; ambient artwork uses CSS timelines.
  return {draw(){},destroy(){}};
}

export const RHETORICAL_COAST=Object.freeze({
  id:'mediterranean',title:'修辭會話海岸之旅',kicker:'THE RHETORICAL COAST',
  width:1600,height:1950,layout:{startY:575,rowGap:300},terrain,
  // On taller screens, show the coastal panorama above the first terrace.
  // Short phone viewports keep the usual space below the companion for its card.
  cameraTop:({point,scale,height,zoom})=>zoom===1 && height>=600 && point.y<625 ? 0 : point.y*scale-height*.4,
  navigation:{path:coastPath,step:coastStep},mount,
  overlay:`<div class="coast-leaves" aria-hidden="true">${Array.from({length:7},(_,i)=>`<span class="coast-leaf ${i%3===0?'coast-green-leaf':'coast-lavender-petal'}" style="--start:${14+i*13}%;--drift:${i%2?-110-i*20:95+i*17}px;--duration:${18+i*2.6}s;--delay:-${i*5.3}s;--size:${16+i%3*5}px">${artwork(i%3===0?'leaf':'petal')}</span>`).join('')}</div>`
});
