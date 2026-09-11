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
export function coastPlantLayout(nodes) {
  const random=seeded(), plants=[];
  const add=(kind,x,y,size)=>{
    const extent=kind==='olive'?.48:kind==='cypress'?.26:.44;
    // A plant's full animated footprint stays clear of every stone and caption.
    if(y>400 && nodes.some(p=>x+size*extent>p.x-109 && x-size*extent<p.x+109 && y>p.y-82 && y-size<p.y+125)) return;
    const amplitude=kind==='olive'?.65:kind==='cypress'?.8:kind==='grass'?1.65:1.2;
    plants.push({kind,x,y,size,a:-(.3+random()*.7)*amplitude,b:(.3+random()*.7)*amplitude,c:(random()-.5)*amplitude,duration:6+random()*7,delay:-random()*19,direction:random()>.5?'normal':'reverse'});
  };
  // Rooted trees are separate from the buildings/background, never doubled.
  [[40,385,290],[-90,1080,240],[1690,1420,245]].forEach(p=>add('olive',...p));
  [[280,440,190],[550,475,185],[730,480,170],[35,1630,180],[1540,1820,205]].forEach(p=>add('cypress',...p));
  // Back-garden plants sit between the coastal village and first terrace.
  [130,315,530,685,820].forEach((x,i)=>add(i%2?'shrub':'lavender',x,480,80+random()*25));
  // Every visible meadow tuft and flowering plant gets its own gentle breeze.
  for(let row=0;row<5;row++) {
    const y=785+row*300;
    for(let col=0;col<9;col++) {
      const x=65+col*181+(random()-.5)*55;
      add(col%3===0?'lavender':'shrub',x,y+(random()-.5)*12,64+random()*22);
    }
  }
  for(let i=0;i<130;i++) add('grass',35+random()*1530,550+random()*1370,28+random()*36);
  [[100,785,75],[1475,1095,75],[85,1385,75],[1475,1695,75],[1070,1890,86]].forEach(p=>add('potted',...p));
  return plants;
}

// Crop metadata follows the actual transparent artwork bounds, not a guessed grid.
const REGIONS = {
 olive:['plants',7,7,581,558],cypress:['plants',688,1,186,575],
 lavender:['plants',1002,168,527,393],shrub:['plants',50,593,464,392],
 grass:['plants',536,595,510,392],pot:['plants',1130,647,331,331],
 stone:['props',21,94,567,385],boat:['props',583,18,396,488],
 cloud:['props',1033,130,493,286],petal:['props',136,589,282,349],
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
  return `<span class="coast-plant coast-${p.kind}" data-plant="${p.kind}" style="${style}">${p.kind==='potted'?artwork('pot','coast-pot'):''}${artwork(p.kind==='potted'?'shrub':p.kind,'coast-foliage')}</span>`;
}

function terrain(nodes,lessons) {
  const route=nodes.map((p,i)=>{
    if(!i) return `M${p.x} ${p.y}`;
    const a=nodes[i-1];
    if(a.x===p.x) {const bend=p.x>800?86:-86;return `C${a.x+bend} ${a.y+80} ${p.x+bend} ${p.y-80} ${p.x} ${p.y}`;}
    return `C${(a.x+p.x)/2} ${a.y} ${(a.x+p.x)/2} ${p.y} ${p.x} ${p.y}`;
  }).join(' ');
  const clouds=[[530,35,190,95,-13],[945,54,215,118,-52],[1310,18,185,104,-78]];
  const boats=[[1050,263,69,110,-37],[1260,219,49,140,-91],[1420,289,55,125,-64]];
  return `<div class="coast-scenery" aria-hidden="true">
    <img class="coast-background" src="${ART}background.webp" width="1600" height="1950" alt="" decoding="async">
    ${clouds.map(([x,y,size,time,delay])=>`<span class="coast-cloud" style="left:${x}px;top:${y}px;width:${size}px;height:${size*.58}px;--duration:${time}s;--delay:${delay}s">${artwork('cloud')}</span>`).join('')}
    ${boats.map(([x,y,size,time,delay])=>`<span class="coast-boat" style="left:${x}px;top:${y}px;width:${size}px;height:${size}px;--duration:${time}s;--delay:${delay}s">${artwork('boat')}</span>`).join('')}
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
