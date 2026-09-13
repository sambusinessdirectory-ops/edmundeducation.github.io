import {desertPlantArtwork} from './phrasal-verb-desert-plants.mjs?v=20260913-desert2';
import {desertPositions,desertHeight,desertTrail,createDesertNavigation,DESERT_WATER,tumbleweedMotion,DESERT_MAP_LIMIT} from './phrasal-verb-desert-geometry.mjs?v=20260913-desert2';
const ART='./assets/phrasal-verb/desert/';
const REGIONS={tumbleweed:[1130,666,332,324]};
let instance=0;
export function phrasalMapLessons(lessons) {
  return lessons.slice(0,DESERT_MAP_LIMIT).map((lesson,index)=>({id:lesson.id,order:index+1,titleEn:lesson.titleEn||lesson.englishTitle,titleZh:lesson.title||lesson.titleZh||'',questions:lesson.questions}));
}
export function phrasalMapCompleted(attempts,lesson) {
  const total=lesson.questions.length;
  // Full completion requires the same completed-attempt state as the list.
  return attempts.filter(a=>a.lessonId===lesson.id).reduce((best,a)=>Math.max(best,Math.min(a.status==='completed'?total:Math.max(0,total-1),Math.max(0,Number(a.correctCount)||0))),0);
}
export function desertPlants(nodes,height) {
  const plants=[];
  const add=(kind,x,y,width)=>plants.push({kind,x,y,width,height:width*1.25,phase:plants.length*1.79,period:6.2+(plants.length%7)*.47,amplitude:kind==='cactus'?1.7:kind.includes('Palm')||kind==='palm'?2.4:3.4});
  // Small planted groups at the shores and outer dunes leave the sand readable.
  [['palm',85,278,200],['shortPalm',320,262,135],['palm',780,277,190],['shortPalm',1460,280,132],
   ['cactus',205,280,63],['cactus',607,275,53],['reeds',834,288,65],['shrub',1340,283,68],
   ['shortPalm',473,540,126],['reeds',597,541,75],['reeds',1060,545,73],['cactus',1370,554,74],['shrub',290,548,82],['reeds',75,553,85],
   ['cactus',58,804,76],['shortPalm',1415,813,100],['shrub',460,805,77],['reeds',1112,815,70],
   ['shortPalm',422,1138,137],['palm',1196,1148,145],['reeds',596,1147,70],['reeds',1090,1168,65],['shrub',1390,1155,89],
   ['cactus',81,1182,58],['cactus',256,1450,73],['shrub',1200,1451,84],['reeds',1417,1440,77],
   ['shortPalm',1480,1615,105],['shrub',514,1609,71]].forEach(p=>add(...p));
  return plants;
}

function sprite(kind,filter,cls='desert-sprite') {
  const [x,y,w,h]=REGIONS[kind];
  // The generated atlas is RGB. This native SVG chroma matte removes only its
  // neutral backdrop at render time; golden/green paint and open gaps survive.
  return `<svg class="${cls}" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true"><image href="${ART}botanical-atlas.webp" width="1536" height="1024" filter="url(#${filter})"/></svg>`;
}
function water(id,height) {
  return `<svg class="desert-water" viewBox="0 0 1600 ${height}"><defs>${DESERT_WATER.map((poly,i)=>`<clipPath id="${id}-pond-${i}"><path d="M${poly.map(p=>p.join(' ')).join('L')}Z"/></clipPath>`).join('')}</defs>${DESERT_WATER.map((poly,i)=>{
    const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]),left=Math.min(...xs),top=Math.min(...ys),w=Math.max(...xs)-left,h=Math.max(...ys)-top;
    return `<g clip-path="url(#${id}-pond-${i})"><g class="desert-water-surface" style="--duration:${13-i}s;--delay:${-7+i*3}s"><image href="${ART}background-complete.webp" width="1600" height="${height}"/></g>${Array.from({length:12},(_,j)=>`<path class="desert-ripple" d="M${left+(j*97)%(w-60)} ${top+12+(j*17)%(h-20)}q16 4 ${24+j%4*8} 0t19 0" style="--duration:${7+j%6}s;--delay:${-j*.83}s"/>`).join('')}</g>`;
  }).join('')}</svg>`;
}
function clouds() {
  const rects=[[69,76,1389,284],[319,400,858,318],[151,779,1217,190]];
  return [[200,12,225,0],[622,26,176,1],[1270,16,245,2]].map(([x,y,w,i])=>`<span class="desert-cloud" data-cloud="${i}" style="left:${x}px;top:${y}px;width:${w}px;height:${w*rects[i][3]/rects[i][2]}px;--duration:${58+i*13}s;--delay:${-i*23-9}s;--direction:${i%2?'alternate-reverse':'alternate'}"><svg viewBox="${rects[i].join(' ')}" class="desert-sprite"><image href="./assets/sentence-structure/coast/clouds.webp" width="1536" height="1024"/></svg></span>`).join('');
}
function platform(i) {
  const shift=i%3*3;
  return `<svg class="desert-platform" viewBox="0 0 180 100" aria-hidden="true"><ellipse cx="90" cy="82" rx="69" ry="10" fill="#78552c" opacity=".2"/><path d="M18 35L${34+shift} 17L134 14L159 32L158 68L136 82L42 86L20 71Z" fill="#b78346"/><path d="M20 54L43 69L137 67L158 53V68L136 82L42 86L20 71Z" fill="#bf9154"/><path class="desert-stone-face" d="M18 35L${34+shift} 17L134 14L159 32L155 54L134 68L44 70L20 54Z" fill="#f2d69d" stroke="#fff0c6" stroke-width="2.5"/><path d="M30 35L43 24L131 22M35 76l43 4M116 75l20-2M144 33l8 5" fill="none" stroke="#e8bc7a" stroke-width="2" stroke-linecap="round"/><path d="M25 54l12 8M137 67l9-8" stroke="#986934" stroke-width="1.5" opacity=".35"/></svg>`;
}
export function createDesertTheme(lessons) {
  const nodes=desertPositions(lessons),height=desertHeight(lessons.length),plants=desertPlants(nodes,height),id=`desert-${++instance}`,filter=`${id}-matte`;
  function terrain() {
    const d=desertTrail(nodes).d;
    return `<div class="desert-scenery" aria-hidden="true"><img class="desert-background" src="${ART}background-complete.webp" width="1600" height="${height}" alt="" decoding="async">${water(id,height)}${clouds()}
    <svg class="desert-defs" width="0" height="0"><defs><filter id="${filter}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  6 6 -12 0 -.22"/></filter></defs></svg>
    <svg class="desert-route" viewBox="0 0 1600 ${height}"><path d="${d}" class="desert-trail-shadow"/><path d="${d}" class="desert-trail-edge"/><path d="${d}" class="desert-trail-sand"/><path d="${d}" class="desert-trail-grain"/></svg>
    ${plants.map((p,i)=>`<span class="desert-plant" data-plant="${p.kind}" data-plant-index="${i}" style="left:${p.x}px;top:${p.y}px;width:${p.width}px;height:${p.height}px;--amplitude:${p.amplitude}deg;--duration:${p.period}s;--delay:${-p.phase}s"><span class="desert-foliage">${desertPlantArtwork(p.kind)}</span></span>`).join('')}
    ${[0,1].map(i=>`<span class="desert-tumbleweed" data-tumbleweed="${i}"><i class="desert-tumbleweed-shadow"></i><span class="desert-tumbleweed-body">${sprite('tumbleweed',filter)}</span></span>`).join('')}
    </div>`;
  }
  function mount(root,reduced) {
    root.querySelector('[data-zoom=out]').textContent='−';
    root.querySelector('.expression-map-desktop-hint').textContent='點選沙地自由走動 · 拖動探索 · 方向鍵 / WASD';
    root.querySelector('.expression-map-viewport').setAttribute('aria-label','動詞片語沙漠地圖；拖動探索沙丘、點選砂岩石階，或用方向鍵 / WASD 走動。');
    root.querySelectorAll('.expression-map-stone').forEach((stone,i)=>stone.insertAdjacentHTML('afterbegin',platform(i)));
    const viewport=root.querySelector('.expression-map-viewport'),weeds=[...root.querySelectorAll('.desert-tumbleweed')],beds=[...root.querySelectorAll('.desert-plant')];
    let elapsed=0,last=0,lastPaint=0,disposed=false;
    function paint(t) {
      weeds.forEach((element,i)=>{
        const m=tumbleweedMotion(t,i);element.style.transform=`translate(${m.x}px,${m.y}px)`;
        element.style.width=element.style.height=`${m.radius*2}px`;
        element.querySelector('.desert-tumbleweed-body').style.transform=`rotate(${m.angle}rad)`;
        element.dataset.motion=JSON.stringify(m);
      });
    }
    paint(0);
    return {draw(now) {
      if(disposed)return;
      const scale=Number(root.dataset.scale)||1,top=viewport.scrollTop/scale,bottom=top+viewport.clientHeight/scale;
      if(last&&top<750)elapsed+=Math.min(100,Math.max(0,now-last))/1000;last=now;
      if(now-lastPaint<33&&!reduced.matches)return;lastPaint=now;
      beds.forEach((el,i)=>{el.dataset.visible=String(plants[i].y>=top-25&&plants[i].y-plants[i].height<bottom+25);});
      paint(reduced.matches?0:elapsed);
    },destroy(){disposed=true;}};
  }
  return {id:'phrasal-desert',title:'動詞片語・沙漠探索之旅',kicker:'THE PHRASAL VERB OASIS',width:1600,height,fitOverview:true,minimumZoom:.1,positions:()=>nodes,terrain,mount,navigation:createDesertNavigation(nodes,height),cameraTop:({point,scale,height:vh,zoom})=>zoom===1&&point.y<375&&point.y*scale<vh-155?0:point.y*scale-vh*.4};
}

export {DESERT_MAP_LIMIT};
