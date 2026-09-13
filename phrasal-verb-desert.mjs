import {desertPositions,desertHeight,desertTrail,createDesertNavigation,DESERT_WATER,tumbleweedMotion} from './phrasal-verb-desert-geometry.mjs?v=20260913-desert1';
const ART='./assets/phrasal-verb/desert/';
const REGIONS={palm:[45,0,490,564],shortPalm:[558,110,496,453],cactus:[1144,86,334,477],reeds:[33,581,476,411],shrub:[594,679,415,309],tumbleweed:[1130,666,332,324]};
let instance=0;
export function phrasalMapLessons(lessons) {
  return lessons.map((lesson,index)=>({id:lesson.id,order:index+1,titleEn:lesson.titleEn||lesson.englishTitle,titleZh:lesson.title||lesson.titleZh||'',questions:lesson.questions}));
}
export function phrasalMapCompleted(attempts,lesson) {
  const total=lesson.questions.length;
  // Full completion requires the same completed-attempt state as the list.
  return attempts.filter(a=>a.lessonId===lesson.id).reduce((best,a)=>Math.max(best,Math.min(a.status==='completed'?total:Math.max(0,total-1),Math.max(0,Number(a.correctCount)||0))),0);
}
export function desertPlants(nodes,height) {
  const plants=[];
  const add=(kind,x,y,width)=>{
    const rect=REGIONS[kind],h=width*rect[3]/rect[2];
    plants.push({kind,x,y,width,height:h,phase:plants.length*1.79,period:5.8+(plants.length%7)*.47,amplitude:kind==='cactus'?1.7:kind==='palm'||kind==='shortPalm'?2.4:4.1});
  };
  // The complete focal inventory fits above the first two stretches of trail.
  [['palm',66,282,242],['shortPalm',340,259,150],['palm',793,277,217],['shortPalm',850,268,140],['shortPalm',1454,282,150],
   ['cactus',125,276,60],['cactus',564,273,49],['shrub',267,270,50],['reeds',705,282,70],['reeds',903,276,54],['reeds',1277,286,57],['shrub',1371,281,65],
   ['shortPalm',523,524,130],['reeds',602,520,90],['reeds',961,527,75],['reeds',1111,505,76],['shrub',1199,502,62],['cactus',1362,538,72],['reeds',1570,572,106],['shrub',292,539,68],['reeds',42,547,117],
   ['cactus',18,798,68],['shortPalm',1370,810,82],['reeds',1252,809,65],['shrub',429,800,66],['cactus',880,810,45]].forEach(p=>add(...p));
  for(let row=3;row<Math.ceil(nodes.length/7)+1;row++) {
    const y=875+(row-2)*245-68;
    if(y>height-40)break;
    const variant=row%4;
    const items=[['cactus',50,y-3,49],['reeds',357+(row%3)*190,y-3,62],['shrub',935+(row%2)*140,y-3,68],['shortPalm',1495,y-3,88]];
    if(variant===0)items[0]=['palm',-90,y,150];
    if(variant===2)items[3]=['cactus',1500,y,52];
    items.forEach(p=>add(...p));
  }
  return plants;
}
function sprite(kind,filter,cls='desert-sprite') {
  const [x,y,w,h]=REGIONS[kind];
  // The generated atlas is RGB. This native SVG chroma matte removes only its
  // neutral backdrop at render time; golden/green paint and open gaps survive.
  return `<svg class="${cls}" viewBox="${x} ${y} ${w} ${h}" aria-hidden="true"><image href="${ART}botanical-atlas.webp" width="1536" height="1024" filter="url(#${filter})"/></svg>`;
}
function dunes(height) {
  let shapes='';
  for(let y=740,i=0;y<height+400;y+=245,i++) {
    const x=-350+(i%3)*260;
    shapes+=`<path d="M-800 ${y+90}Q${x} ${y-125} ${x+870} ${y+28}T2400 ${y-35}V${y+255}H-800Z" fill="${i%2?'#efb764':'#f4c679'}" opacity=".35"/><path d="M-650 ${y+70}Q${x+280} ${y-55} ${x+1030} ${y+50}T2390 ${y+22}" fill="none" stroke="#ffdc91" stroke-width="4" opacity=".3"/>`;
  }
  return `<svg class="desert-dunes" viewBox="-800 0 3200 ${height}"><defs><linearGradient id="desert-sky" x2="0" y2="1"><stop stop-color="#7ecaff"/><stop offset=".11" stop-color="#95d5f9"/><stop offset=".24" stop-color="#ecc180"/><stop offset=".4" stop-color="#f8cb7b"/><stop offset="1" stop-color="#f4c478"/></linearGradient></defs><path d="M-800 0H2400V${height}H-800Z" fill="#f4c478"/><path d="M-800 0H2400V900H-800Z" fill="url(#desert-sky)"/>${shapes}</svg>`;
}
function water(id) {
  return `<svg class="desert-water" viewBox="0 0 1600 900"><defs>${DESERT_WATER.map((poly,i)=>`<clipPath id="${id}-pond-${i}"><path d="M${poly.map(p=>p.join(' ')).join('L')}Z"/></clipPath>`).join('')}</defs>${DESERT_WATER.map((_,i)=>`<g clip-path="url(#${id}-pond-${i})"><g class="desert-water-surface" style="--duration:${i?11:13}s;--delay:${i?-4:-7}s"><image href="${ART}background.webp" width="1600" height="900"/></g>${Array.from({length:i?18:21},(_,j)=>{const x=i?555+(j*79)%555:895+(j*97)%540,y=i?430+(j*17)%77:225+(j*11)%48;return `<path class="desert-ripple" d="M${x} ${y}q16 4 ${24+j%4*8} 0t19 0" style="--duration:${6+j%6}s;--delay:${-j*.83}s"/>`;}).join('')}</g>`).join('')}</svg>`;
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
    return `<div class="desert-scenery" aria-hidden="true">${dunes(height)}<img class="desert-background" src="${ART}background.webp" width="1600" height="900" alt="" decoding="async">${water(id)}${clouds()}
    <svg class="desert-defs" width="0" height="0"><defs><filter id="${filter}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  6 6 -12 0 -.22"/></filter></defs></svg>
    <svg class="desert-route" viewBox="0 0 1600 ${height}"><path d="${d}" class="desert-trail-shadow"/><path d="${d}" class="desert-trail-edge"/><path d="${d}" class="desert-trail-sand"/><path d="${d}" class="desert-trail-grain"/></svg>
    ${plants.map((p,i)=>`<span class="desert-plant" data-plant="${p.kind}" data-plant-index="${i}" style="left:${p.x}px;top:${p.y}px;width:${p.width}px;height:${p.height}px;--amplitude:${p.amplitude}deg;--duration:${p.period}s;--delay:${-p.phase}s"><span class="desert-foliage">${sprite(p.kind,filter)}</span></span>`).join('')}
    ${[0,1].map(i=>`<span class="desert-tumbleweed" data-tumbleweed="${i}"><i class="desert-tumbleweed-shadow"></i><span class="desert-tumbleweed-body">${sprite('tumbleweed',filter)}</span></span>`).join('')}
    </div>`;
  }
  function mount(root,reduced) {
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
  return {id:'phrasal-desert',title:'動詞片語・沙漠探索之旅',kicker:'THE PHRASAL VERB OASIS',width:1600,height,cameraPadding:{left:800,right:800},minimumZoom:.5,positions:()=>nodes,terrain,mount,navigation:createDesertNavigation(nodes,height),cameraTop:({point,scale,height:vh,zoom})=>zoom===1&&point.y<375&&point.y*scale<vh-155?0:point.y*scale-vh*.4};
}
