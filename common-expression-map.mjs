import { MASCOT_VIEWS } from './speaking-mascot-views.mjs';

const WIDTH = 1600, HEIGHT = 1950;
const CHARACTERS = [{ id: 'eddy', name: 'Eddie', flag: '#c84438' }, { id: 'phoebe', name: 'Phoebe', flag: '#b5a0dc' }, { id: 'elsie', name: 'Elsie', flag: '#edc84a' }];
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function levelPositions(lessons, { startY = 200, rowGap = 350 } = {}) {
  return lessons.map((lesson, i) => {
    const row = Math.floor(i / 7), col = row % 2 ? 6 - i % 7 : i % 7;
    return { id: lesson.id, x: 200 + col * 210, y: startY + row * rowGap + Math.sin(col * 1.15) * 18 };
  });
}

export function minimumMapScale(width, height, worldWidth = WIDTH, worldHeight = HEIGHT) {
  return Math.max(.7, width / worldWidth, height / worldHeight);
}

export function restoreMapPreferences(current, legacy, lessonIds) {
  const saved = current && typeof current === 'object' ? current : {};
  const chosen = saved.character || legacy?.character;
  return {
    mode: saved.mode !== false,
    character: CHARACTERS.some(c => c.id === chosen) ? chosen : 'eddy',
    pinned: lessonIds.includes(saved.pinned) ? saved.pinned : null
  };
}

export function mapPreferenceKey(systemKey, owner) {
  return systemKey === 'speaking' ? `edmund-expression-meadow-v2:${owner}` : `edmund-lesson-map-v1:${systemKey}:${owner}`;
}

function baseCamp(node) {
  return `<g class="expression-map-base-camp" transform="translate(${node.x-116} ${node.y-35})">
    <path d="M12 13Q46 32 112 35" fill="none" stroke="#e5d4a2" stroke-width="17"/>
    <ellipse cy="9" rx="72" ry="19" fill="#46623b" opacity=".2"/>
    <g class="expression-map-chimney-smoke" fill="none" stroke="#f7f3db" stroke-width="5" stroke-linecap="round" opacity=".55"><path d="M28-127q-12-10 0-18t-3-18"/></g>
    <path d="M20-94v-37h19v50" fill="#b77755" stroke="#765947" stroke-width="3"/>
    <path d="M-52-77H54V2H-52Z" fill="#eddbb0" stroke="#877044" stroke-width="3"/>
    <path d="M-59-77L0-127L63-77Z" fill="#ad5840" stroke="#754c39" stroke-width="4" stroke-linejoin="round"/>
    <path d="M-57-78L0-125L61-78" fill="none" stroke="#e2a070" stroke-width="7" stroke-linecap="round"/>
    <path d="M-31-91L32-91M-16-105H16" stroke="#c57e56" stroke-width="3"/>
    <path d="M-16 1v-40q16-15 32 0V1" fill="#956c46" stroke="#705536" stroke-width="3"/>
    <circle cx="9" cy="-20" r="2" fill="#edcb6f"/>
    <g fill="#ffe19a" stroke="#a98450" stroke-width="3"><rect x="-43" y="-58" width="19" height="24" rx="3"/><rect x="26" y="-58" width="19" height="24" rx="3"/></g>
    <path d="M-34-57v22M-42-46h18M35-57v22M27-46h17" stroke="#a98450" stroke-width="2"/>
    <path d="M-24 6h48M-29 11h58" stroke="#c3b18a" stroke-width="5" stroke-linecap="round"/>
    <g fill="#7a9b51"><ellipse cx="-55" cy="1" rx="14" ry="10"/><ellipse cx="54" cy="4" rx="13" ry="10"/></g>
    <g fill="#efba91"><circle cx="-60" cy="-4" r="3"/><circle cx="-51" cy="-7" r="3"/><circle cx="56" cy="0" r="3"/></g>
    <rect x="-47" y="22" width="94" height="23" rx="7" fill="#ffefd0" stroke="#b89963"/>
    <text y="38" text-anchor="middle" fill="#6c5035" font-family="Georgia,serif" font-size="14">Base camp</text>
  </g>`;
}

function milestoneTent(node, order) {
  return `<g class="expression-map-milestone" data-milestone="${order}" transform="translate(${node.x-96} ${node.y-10})">
    <ellipse cy="8" rx="36" ry="10" fill="#416336" opacity=".21"/>
    <path d="M-37 4L-7-50L34 4Z" fill="#e7c78e" stroke="#8c8058" stroke-width="2"/>
    <path d="M-7-50L-22 4H34Z" fill="#c39466"/><path d="M-7-38L-18 4H12Z" fill="#645c42"/>
    <path d="M-7-56V-68L16-63L-7-58" stroke="#6e7250" stroke-width="2" fill="#f4e5b8"/>
    <path d="M-7-50L-49 6M-7-50L46 6" stroke="#eee3bb" stroke-width="1.5"/>
    <rect x="-16" y="4" width="32" height="21" rx="6" fill="#fff1cb" stroke="#a79563"/>
    <text y="19" text-anchor="middle" font-size="14" font-weight="bold" font-family="Georgia,serif" fill="#665634">${order}</text>
  </g>`;
}

function terrain(nodes, lessons) {
  let seed = 57;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const route = nodes.map((p, i) => {
    if (!i) return `M${p.x} ${p.y}`;
    const a = nodes[i - 1];
    if (a.x === p.x) {
      const bend = p.x > WIDTH / 2 ? 85 : -85;
      return `C${a.x + bend} ${a.y + 70} ${p.x + bend} ${p.y - 70} ${p.x} ${p.y}`;
    }
    return `C${(a.x+p.x)/2} ${a.y} ${(a.x+p.x)/2} ${p.y} ${p.x} ${p.y}`;
  }).join(' ');
  let decorations = '';
  // Keep tree crowns clear of every selectable stone and its title.
  for (let i = 0; i < 175; i++) {
    const x = 25 + random() * 1550, y = 45 + random() * (HEIGHT-85);
    if (nodes.some(p => Math.abs(p.x-x) < 125 && Math.abs(p.y+30-y) < 110)) continue;
    if (x > 820 && y > HEIGHT-250) continue;
    if (x < 165 && y < 260) continue;
    if (nodes.some((p,i) => lessons[i].order % 10 === 0 && Math.abs(x-(p.x-96)) < 60 && Math.abs(y-(p.y-30)) < 85)) continue;
    const kind = i % 4 === 0 ? 'tree' : i % 3 === 0 ? 'rock' : 'bush';
    const scale = kind === 'tree' ? .75 + random()*.45 : .65 + random()*.6;
    decorations += `<use href="#ce-map-${kind}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(2)})"/>`;
  }
  let flowers = '';
  for(let i=0;i<260;i++) {
    const x = random()*WIDTH, y = random()*HEIGHT;
    if (x>820&&y>HEIGHT-250) continue;
    flowers += `<use href="#ce-map-${i%5 ? 'grass':'flower'}" x="${x.toFixed(0)}" y="${y.toFixed(0)}" opacity="${(.35+random()*.55).toFixed(2)}"/>`;
  }
  return `<svg class="expression-map-terrain" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ce-map-field" x2=".6" y2="1"><stop stop-color="#b9d58a"/><stop offset=".4" stop-color="#99c472"/><stop offset="1" stop-color="#699952"/></linearGradient>
    <radialGradient id="ce-map-hill"><stop stop-color="#d7e5a1"/><stop offset="1" stop-color="#b2d47b" stop-opacity="0"/></radialGradient>
    <linearGradient id="ce-map-water" x2=".3" y2="1"><stop stop-color="#70c3b4"/><stop offset="1" stop-color="#39998e"/></linearGradient>
    <linearGradient id="ce-map-leaf" x2=".3" y2="1"><stop stop-color="#709f4a"/><stop offset="1" stop-color="#326448"/></linearGradient>
    <g id="ce-map-tree"><ellipse cy="13" rx="38" ry="17" fill="#355630" opacity=".19"/><path d="M-5 7L-4-48H5L7 7" fill="#79764a"/><path d="M1-32L-16-45M1-22L17-39" fill="none" stroke="#777349" stroke-width="4"/><path d="M-37-36C-48-58-23-79-8-71C-1-93 28-85 30-61C54-52 42-19 20-19C2-8-29-13-37-36" fill="url(#ce-map-leaf)"/><path d="M-27-45Q-37-65-13-67M-4-70Q13-86 23-64" fill="none" stroke="#a9c879" stroke-width="6" stroke-linecap="round" opacity=".6"/></g>
    <g id="ce-map-bush"><ellipse cy="7" rx="25" ry="10" fill="#32562c" opacity=".18"/><path d="M-25 1Q-31-18-10-17Q-7-37 12-27Q29-23 28-4Q21 10 0 9Q-17 11-25 1" fill="#6d9d50"/><path d="M-19-9Q-15-20-7-14M0-22Q9-28 16-19" stroke="#bad987" stroke-width="4" fill="none" stroke-linecap="round"/></g>
    <g id="ce-map-rock"><ellipse cy="7" rx="17" ry="7" fill="#365935" opacity=".17"/><path d="M-17 0L-11-18L3-24L17-12L20 3L4 10Z" fill="#a6b19b"/><path d="M-17 0L3-24L6-5L20 3L4 10Z" fill="#788f7e"/><path d="M-11-18L3-24L-4-5L-17 0Z" fill="#cbd0ad"/></g>
    <g id="ce-map-grass" stroke="#4d8044" stroke-width="2" stroke-linecap="round" fill="none"><path d="M0 0L-4-6M3 1L5-7M7 1L11-3"/></g>
    <g id="ce-map-flower"><path d="M0 4V-6" stroke="#537d45" stroke-width="2"/><circle cy="-8" r="5" fill="#fff3c2"/><circle cy="-8" r="2" fill="#d3a957"/></g>
  </defs>
  <path fill="url(#ce-map-field)" d="M0 0H1600V1950H0Z"/>
  <ellipse cx="570" cy="200" rx="660" ry="420" fill="url(#ce-map-hill)"/>
  <ellipse cx="1100" cy="650" rx="620" ry="480" fill="url(#ce-map-hill)"/>
  <path d="M0 80Q400-60 830 35T1600 30M0 600Q180 485 470 550T1100 460T1600 520M0 1100Q360 1000 630 1060" fill="none" stroke="#d9e5a6" stroke-width="3" opacity=".21"/>
  ${flowers}
  <g transform="translate(0 750)"><path d="M890 1198C814 1130 847 1024 958 1008C1061 993 1058 951 1180 981C1315 1015 1370 1078 1518 1046L1600 1020V1200Z" fill="#567e53" opacity=".55"/>
  <path d="M913 1200C821 1113 870 1043 969 1036C1099 1027 1090 982 1195 1010S1393 1134 1539 1081L1600 1062" fill="none" stroke="#d9d9a4" stroke-width="30"/>
  <path d="M913 1200C821 1113 870 1043 969 1036C1099 1027 1090 982 1195 1010S1393 1134 1539 1081L1600 1062V1200Z" fill="url(#ce-map-water)"/>
  <g stroke="#c4eee0" stroke-width="3" fill="none" opacity=".6"><path d="M960 1080Q1000 1087 1040 1076M1110 1065Q1140 1052 1170 1062M1220 1130Q1280 1150 1340 1140M960 1150Q990 1159 1030 1150M1450 1160Q1500 1170 1540 1155"/></g>
  </g>
  <path d="${route}" fill="none" stroke="#507843" stroke-width="58" stroke-linecap="round" opacity=".33" transform="translate(0 7)"/>
  <path d="${route}" fill="none" stroke="#c3c082" stroke-width="51" stroke-linecap="round"/>
  <path d="${route}" fill="none" stroke="#f4e7b5" stroke-width="39" stroke-linecap="round"/>
  <path d="${route}" fill="none" stroke="#fff2d0" stroke-width="2" stroke-dasharray="3 18" stroke-linecap="round"/>
  ${decorations}
  ${baseCamp(nodes[0])}
  ${nodes.map((node,i)=>lessons[i].order % 10 === 0 ? milestoneTent(node,lessons[i].order) : '').join('')}
  <g transform="translate(1070 1570) rotate(-4)"><path d="M-48 30L-48 87M54 30L54 87" stroke="#686740" stroke-width="9"/><rect x="-87" y="-15" width="188" height="59" rx="10" fill="#365d40" stroke="#d4d2a0" stroke-width="3"/><text x="7" y="11" fill="#fff3d0" font-family="Georgia,serif" font-size="17" text-anchor="middle">Every path is open.</text><text x="7" y="30" fill="#dfecc4" font-family="sans-serif" font-size="12" text-anchor="middle">每條路，都可以探索</text></g>
  <g fill="#ecf5cd" opacity=".8"><path d="M1360 89q12-14 24 0q12-14 24 0q-24-7-48 0"/><path d="M1300 62q8-11 17 0q8-11 17 0q-17-4-34 0"/></g>
  </svg>`;
}

/** Dashboard navigation only. Walking never writes a learning result. */
export function createExpressionMap({ root, toggle, grid, lessons, getCompleted, openLesson, systemKey = 'speaking', theme = null }) {
  if (!lessons.length) { root.hidden=true; toggle.hidden=true; grid.hidden=false; return { update(){}, setActive(){}, reset(){}, destroy(){} }; }
  const WIDTH = theme?.width || 1600, HEIGHT = theme?.height || 1950;
  const nodes = levelPositions(lessons, theme?.layout);
  const arrivalId = `expression-map-arrival-${systemKey}`;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const images = new Map();
  let owner = '', built = false, active = false, mode = true, pinned = null;
  let selected = 0, standing = 0, character = 'eddy', scale = .8, zoom = 1, visible = false;
  let viewport, world, space, horse, shadow, picker, status, popup, flag, pinButton, statusTimer, frame = 0, lastFrame = 0;
  let position = { ...nodes[0] }, journey = null, angle = 0, keys = new Set(), lastFacing = 0;
  let sceneAnimation, resizeObserver, intersectObserver, drag = null, suppressClickUntil = 0, imageFailure = false;
  const storageKey = () => mapPreferenceKey(systemKey, owner);
  const on = (element, type, callback, opts = {}) => element.addEventListener(type, callback, { ...opts, signal: events.signal });
  const save = () => { try { localStorage.setItem(storageKey(), JSON.stringify({ mode, character, pinned })); return true; } catch { return false; } };
  const loadImage = id => {
    if (images.has(id)) return images.get(id);
    const img = new Image();
    img.src = new URL(`./assets/speaking-system/mascots/v2/${MASCOT_VIEWS[id].standing.image}`, import.meta.url).href;
    images.set(id, img);
    img.addEventListener('load', () => { if (built) { drawAvatar(id); drawHorse(performance.now(), false); } });
    img.addEventListener('error', () => { imageFailure = true; if(status) { status.hidden=false; status.textContent = '角色圖片未能載入，請重新整理。課題仍可正常開啟。'; } });
    return img;
  };

  function drawSprite(ctx, id, facing, time, walking, width, height) {
    const img = loadImage(id);
    if (!img.complete || !img.naturalWidth) return;
    const views = MASCOT_VIEWS[id].standing.views;
    const distance = a => Math.abs(((a-facing+540)%360)-180);
    const view = views.reduce((best, item) => distance(item.angle) < distance(best.angle) ? item : best);
    const [rx,ry,rw,rh] = view.rect;
    const sx=rx*img.naturalWidth, sy=(1-ry-rh)*img.naturalHeight, sw=rw*img.naturalWidth, sh=rh*img.naturalHeight;
    const h=height*.91, w=h*sw/sh, x=(width-w)/2, y=height-h-6;
    const phase=time/(walking?80:750), bob=reduced.matches?0:Math.sin(phase)*(walking?2.7:.8);
    ctx.save();
    ctx.translate(width/2,height-6);
    ctx.rotate(reduced.matches?0:Math.sin(phase)*(walking?.022:.012));
    ctx.translate(-width/2,-height+6+bob);
    if (walking && !reduced.matches) {
      // Move the two lower leg regions in opposite phases, with a bobbing torso.
      // Turnaround views provide the facing direction without changing the design.
      const split=.79, legH=h*(1-split);
      ctx.drawImage(img,sx,sy,sw,sh*split,x,y,w,h*split+1);
      for (let side=0;side<2;side++) {
        const swing=Math.sin(phase+side*Math.PI);
        ctx.save();
        const hipX=x+w*(side?.72:.28), hipY=y+h*split;
        ctx.translate(hipX,hipY); ctx.rotate(swing*.075); ctx.translate(-hipX,-hipY);
        ctx.drawImage(img,sx+sw*side/2,sy+sh*split,sw/2,sh*(1-split),x+w*side/2,y+h*split,w/2,legH-swing*1.2);
        ctx.restore();
      }
    } else ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
    ctx.restore();
  }
  function drawAvatar(id) {
    const canvas=root.querySelector(`[data-character="${id}"] canvas`);
    if (!canvas) return;
    const ctx=canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height);
    drawSprite(ctx,id,0,0,false,canvas.width,canvas.height);
  }
  function drawHorse(time, walking) {
    if (!horse || !mode) return;
    const ctx=horse.getContext('2d'); ctx.clearRect(0,0,horse.width,horse.height);
    ctx.save(); ctx.scale(2,2); drawSprite(ctx,character,angle,time,walking,136,165); ctx.restore();
    horse.style.left=`${position.x}px`; horse.style.top=`${position.y-12}px`;
    horse.dataset.moving=String(walking);
    shadow.style.left=`${position.x}px`; shadow.style.top=`${position.y-12}px`;
  }
  function select(index, { center = true } = {}) {
    selected=clamp(index,0,lessons.length-1);
    updateSelection();
    moveTo(nodes[selected]);
    if(center && journey) { journey.follow=true; centerOn(position); }
    else if(center) centerOn(nodes[selected], !reduced.matches);
  }
  function leaveStone() {
    standing=-1;
    if(popup) popup.hidden=true;
    if(pinButton) pinButton.disabled=true;
    root.querySelectorAll('[data-arrived="true"]').forEach(button=>{button.dataset.arrived='false';button.setAttribute('aria-expanded','false');});
  }
  function settleArrival() {
    const index=nodes.findIndex(node=>Math.hypot(node.x-position.x,node.y-position.y)<42);
    standing=index;
    if(index>=0) { selected=index; position={...nodes[index]}; angle=0; }
    updateSelection();
    positionPopup();
  }
  function moveTo(target) {
    const destination={ x:clamp(target.x,60,WIDTH-60), y:clamp(target.y,180,HEIGHT-65) };
    const waypoints=theme?.navigation?.path(position,destination) ?? (theme?.navigation ? null : [destination]);
    if(!waypoints) return;
    leaveStone();
    const points=[{...position},...waypoints];
    const lengths=waypoints.map((p,i)=>Math.hypot(p.x-points[i].x,p.y-points[i].y));
    const distance=lengths.reduce((sum,n)=>sum+n,0);
    const dx=waypoints[0].x-position.x, dy=waypoints[0].y-position.y;
    angle=(Math.atan2(dx,dy)*180/Math.PI+360)%360;
    lastFacing=angle;
    if(reduced.matches || Math.hypot(dx,dy)<2) { position=destination; journey=null; settleArrival(); drawHorse(performance.now(),false); return; }
    journey={ from:{...position}, to:destination, started:performance.now(), points, lengths, distance, duration:clamp(distance/.3,250,3200) };
    startAnimation();
  }
  function centerOn(point, smooth=false) {
    const top=theme?.cameraTop?.({point,scale,height:viewport.clientHeight,zoom}) ?? point.y*scale-viewport.clientHeight*.4;
    viewport.scrollTo({left:point.x*scale-viewport.clientWidth/2,top,behavior:smooth?'smooth':'instant'});
    positionPopup();
  }
  function setScale(nextZoom, point) {
    const anchor=point || {x:(viewport.scrollLeft+viewport.clientWidth/2)/scale,y:(viewport.scrollTop+viewport.clientHeight*.4)/scale};
    zoom=clamp(Math.round(nextZoom*100)/100,1,2);
    scale=minimumMapScale(viewport.clientWidth,viewport.clientHeight,WIDTH,HEIGHT)*zoom;
    space.style.width=`${WIDTH*scale}px`; space.style.height=`${HEIGHT*scale}px`;
    world.style.transform=`scale(${scale})`;
    root.querySelector('[data-zoom="out"]').disabled=zoom<=1;
    root.querySelector('[data-zoom="in"]').disabled=zoom>=2;
    centerOn(anchor);
  }
  function positionPopup() {
    if(!popup || !viewport || standing<0 || journey || !mode) { if(popup)popup.hidden=true; return; }
    const node=nodes[standing], x=node.x*scale-viewport.scrollLeft, y=node.y*scale-viewport.scrollTop;
    if(x<18 || x>viewport.clientWidth-18 || y<0 || y>viewport.clientHeight-45) {popup.hidden=true;return;}
    popup.hidden=false;
    const width=popup.offsetWidth, height=popup.offsetHeight;
    const left=clamp(x-width/2,10,Math.max(10,viewport.clientWidth-width-10));
    popup.style.left=`${left}px`;
    popup.style.top=`${clamp(y+130*scale,12,Math.max(12,viewport.clientHeight-height-10))}px`;
    popup.style.setProperty('--pointer-x',`${clamp(x-left,18,width-18)}px`);
  }
  function updateFlag() {
    if(!flag) return;
    const node=nodes.find(item=>item.id===pinned);
    flag.toggleAttribute('hidden',!node);
    if(node) {
      const companion=CHARACTERS.find(c=>c.id===character);
      flag.style.left=`${node.x+58}px`;flag.style.top=`${node.y-88}px`;
      flag.style.setProperty('--flag-color',companion.flag);
      flag.dataset.flagCharacter=character;flag.dataset.flagLevel=node.id;
      flag.setAttribute('aria-label',`${companion.name} · 已定位於 ${lessons[nodes.indexOf(node)].order}`);
    }
    pinButton.disabled=standing<0 || Boolean(journey) || keys.size>0;
    pinButton.setAttribute('aria-pressed',String(standing>=0 && nodes[standing].id===pinned));
  }
  function saveLocation() {
    if(standing<0 || journey || keys.size) return;
    pinned=nodes[standing].id;
    const persisted=save();
    updateFlag();
    flag.classList.remove('is-planted');void flag.getBoundingClientRect();flag.classList.add('is-planted');
    clearTimeout(statusTimer);status.hidden=false;
    status.textContent=persisted?`已定位於 ${String(lessons[standing].order).padStart(2,'0')} · 下次登入從這裡出發`:'此瀏覽器未能儲存定位，請允許網站儲存資料後再試。';
    if(persisted) statusTimer=setTimeout(()=>{status.hidden=true;status.textContent='';},3200);
  }
  function updateSelection() {
    if(!built) return;
    const lesson=lessons[selected];
    root.querySelectorAll('[data-map-level]').forEach((button,index)=>{
      const item=lessons[index], count=getCompleted(item.id);
      button.setAttribute('aria-pressed',String(index===selected));
      button.dataset.arrived=String(index===standing);
      button.setAttribute('aria-expanded',String(index===standing));
      button.dataset.complete=String(count>=item.questions.length && item.questions.length>0);
      button.setAttribute('aria-label',`${item.order}. ${item.titleEn} · ${item.titleZh} · ${count}/${item.questions.length} 題完成`);
      button.querySelector('.expression-map-stone-status').textContent=count>=item.questions.length?'✓':`${count}/${item.questions.length}`;
    });
    picker.value=lesson.id;
    root.querySelector('[data-map-title]').textContent=lesson.titleEn;
    root.querySelector('[data-map-description]').textContent=lesson.titleZh;
    root.querySelector('[data-map-description]').title=lesson.titleZh;
    root.querySelector('[data-map-number]').textContent=String(lesson.order).padStart(2,'0');
    root.querySelectorAll('[data-character]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.character===character)));
    horse?.setAttribute('aria-label',CHARACTERS.find(c=>c.id===character).name);
    updateFlag();
    positionPopup();
  }
  function stopAnimation() { root.dataset.animating='false'; cancelAnimationFrame(frame); frame=0; lastFrame=0; keys.clear(); }
  function startAnimation() {
    if(frame || !active || !mode || !visible || document.hidden) return;
    root.dataset.animating=String(!reduced.matches);
    frame=requestAnimationFrame(animate);
  }
  function animate(time) {
    frame=0;
    if(!active||!mode||!visible||document.hidden) return;
    const dt=Math.min(40,lastFrame?time-lastFrame:16); lastFrame=time;
    let walking=false;
    if(keys.size) {
      const dx=Number(keys.has('ArrowRight')||keys.has('d'))-Number(keys.has('ArrowLeft')||keys.has('a'));
      const dy=Number(keys.has('ArrowDown')||keys.has('s'))-Number(keys.has('ArrowUp')||keys.has('w'));
      if(dx||dy) {
        journey=null; if(standing>=0)leaveStone(); const length=Math.hypot(dx,dy);
        const step={x:clamp(position.x+dx/length*dt*.31,60,WIDTH-60), y:clamp(position.y+dy/length*dt*.31,180,HEIGHT-65)};
        position=theme?.navigation?.step(position,step) || step;
        angle=(Math.atan2(dx,dy)*180/Math.PI+360)%360; walking=true; lastFacing=angle;
        if(position.x*scale<viewport.scrollLeft+80 || position.x*scale>viewport.scrollLeft+viewport.clientWidth-80 || position.y*scale<viewport.scrollTop+110 || position.y*scale>viewport.scrollTop+viewport.clientHeight-80) centerOn(position);
      }
    } else if(journey) {
      const t=clamp((time-journey.started)/journey.duration,0,1);
      let travelled=t*journey.distance, segment=0;
      while(segment<journey.lengths.length-1 && travelled>journey.lengths[segment]) {travelled-=journey.lengths[segment];segment++;}
      const a=journey.points[segment], b=journey.points[segment+1], fraction=journey.lengths[segment]?Math.min(1,travelled/journey.lengths[segment]):1;
      position={x:a.x+(b.x-a.x)*fraction,y:a.y+(b.y-a.y)*fraction};
      angle=(Math.atan2(b.x-a.x,b.y-a.y)*180/Math.PI+360)%360;
      walking=t<1;
      if(journey.follow) centerOn(position);
      if(t===1) { journey=null; settleArrival(); }
    }
    sceneAnimation?.draw(time);
    drawHorse(time,walking);
    if(!reduced.matches || walking || journey || keys.size) startAnimation();
  }
  function build() {
    if(built) return;
    root.className='expression-map';
    root.dataset.theme=theme?.id || 'meadow';
    root.dataset.animating='false';
    root.innerHTML=`<header class="expression-map-header"><div class="expression-map-heading"><p>${escape(theme?.kicker || 'THE EXPRESSION MEADOW')}</p><h2>${escape(theme?.title || '常用語探索之旅')}<small>${lessons.length} 個課題 · 全部開放</small></h2></div><fieldset class="expression-map-characters"><legend>選擇同行角色 · Your companion</legend>${CHARACTERS.map(c=>`<button class="expression-map-character" type="button" data-character="${c.id}" aria-pressed="${c.id===character}"><canvas width="74" height="96" aria-hidden="true"></canvas>${c.name}</button>`).join('')}</fieldset></header>
    <div class="expression-map-tools"><label class="expression-map-picker"><span>前往課題</span><select aria-label="前往課題 · Choose any lesson">${lessons.map(l=>`<option value="${escape(l.id)}">${String(l.order).padStart(2,'0')} · ${escape(l.titleEn)}</option>`).join('')}</select></label><div class="expression-map-zoom" aria-label="地圖大小"><button type="button" data-zoom="out" aria-label="縮小地圖至標準大小">−</button><button type="button" data-zoom="in" aria-label="放大地圖">＋</button><button type="button" data-save-location aria-pressed="false" aria-label="定位：儲存腳下的石階作為下次登入的起點">定位</button></div></div>
    <div class="expression-map-stage"><div class="expression-map-viewport" tabindex="0" role="region" aria-label="常用語課題地圖；拖動探索，點選石階選擇課題。可用方向鍵或 WASD 走動。"><div class="expression-map-space"><div class="expression-map-world">${theme ? theme.terrain(nodes,lessons) : terrain(nodes,lessons)}${nodes.map((p,i)=>`<button type="button" class="expression-map-stone" data-map-level="${i}" style="left:${p.x}px;top:${p.y}px" aria-pressed="false" aria-expanded="false" aria-controls="${arrivalId}"><span class="expression-map-stone-number">${String(lessons[i].order).padStart(2,'0')}</span><span class="expression-map-stone-caption">${escape(lessons[i].titleEn)}</span><span class="expression-map-stone-status"></span></button>`).join('')}<svg class="expression-map-flag" width="57" height="100" viewBox="0 0 57 100" role="img" hidden><ellipse cx="7" cy="95" rx="7" ry="3" fill="#355530" opacity=".25"/><path d="M7 95V5" stroke="#786b46" stroke-width="4" stroke-linecap="round"/><circle cx="7" cy="5" r="4" fill="#e4d091"/><path class="expression-map-flag-cloth" d="M9 9Q28 3 50 11L44 25L50 40Q30 31 9 39Z" fill="var(--flag-color)" stroke="#fff1ca" stroke-width="1.5"/></svg><span class="expression-map-shadow"></span><canvas class="expression-map-horse" width="272" height="330" role="img" aria-label="Eddie"></canvas></div></div></div>
    ${theme?.overlay || ''}<article id="${arrivalId}" class="expression-map-lesson-card" role="region" aria-label="石階課題" hidden><div class="expression-map-selected"><span class="expression-map-selected-number" data-map-number></span><div class="expression-map-selected-copy"><h3 data-map-title></h3><p data-map-description></p></div><button class="expression-map-open" type="button" data-map-open><span>進入課題<small>Explore lesson</small></span><span aria-hidden="true">→</span></button></div></article></div>
    <footer class="expression-map-footer"><p class="expression-map-message" role="status" aria-live="polite" hidden></p><div class="expression-map-legend"><span>未完成</span><span>已完成</span></div><span class="expression-map-desktop-hint">拖動地圖探索 · 方向鍵 / WASD 走動</span></footer>`;
    viewport=root.querySelector('.expression-map-viewport'); world=root.querySelector('.expression-map-world'); space=root.querySelector('.expression-map-space'); horse=root.querySelector('.expression-map-horse'); shadow=root.querySelector('.expression-map-shadow'); picker=root.querySelector('select'); status=root.querySelector('[role=status]');popup=root.querySelector('.expression-map-lesson-card');flag=root.querySelector('.expression-map-flag');pinButton=root.querySelector('[data-save-location]');
    built=true;
    world.style.width=`${WIDTH}px`; world.style.height=`${HEIGHT}px`;
    sceneAnimation=theme?.mount?.(root,reduced);
    CHARACTERS.forEach(c=>loadImage(c.id));
    on(root,'click',event=>{
      if(performance.now()<suppressClickUntil && viewport.contains(event.target)) { event.preventDefault(); return; }
      const button=event.target.closest('button');
      if(button?.hasAttribute('data-map-level')) select(Number(button.dataset.mapLevel));
      else if(button?.dataset.character) { character=button.dataset.character; updateSelection(); save(); drawHorse(performance.now(),Boolean(journey)); }
      else if(button?.hasAttribute('data-map-open') && standing>=0) openLesson(lessons[standing].id);
      else if(button?.hasAttribute('data-save-location')) saveLocation();
      else if(button?.dataset.zoom) {
        setScale(zoom+(button.dataset.zoom==='in'?.2:-.2));
      } else if(world.contains(event.target)) {
        const bounds=world.getBoundingClientRect(); moveTo({x:(event.clientX-bounds.left)/scale,y:(event.clientY-bounds.top)/scale});
      }
    });
    on(viewport,'scroll',positionPopup,{passive:true});
    on(viewport,'wheel',()=>{if(journey)journey.follow=false;},{passive:true});
    on(picker,'change',()=>select(lessons.findIndex(l=>l.id===picker.value)));
    // Touch uses native two-axis scrolling and momentum; mouse dragging is additive.
    on(viewport,'pointerdown',event=>{
      if(journey) journey.follow=false;
      if(event.pointerType!=='mouse'||event.button!==0) return;
      drag={x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop,id:event.pointerId,moved:false};
    });
    on(viewport,'pointermove',event=>{
      if(!drag) return;
      const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
      if(Math.hypot(dx,dy)>6) { drag.moved=true; viewport.dataset.dragging='true'; viewport.setPointerCapture(event.pointerId); }
      if(drag.moved) { viewport.scrollLeft=drag.left-dx; viewport.scrollTop=drag.top-dy; }
    });
    const finishDrag=()=>{ if(drag?.moved) suppressClickUntil=performance.now()+200; if(drag && viewport.hasPointerCapture(drag.id)) viewport.releasePointerCapture(drag.id); drag=null; delete viewport.dataset.dragging; };
    on(viewport,'pointerup',finishDrag); on(viewport,'pointercancel',finishDrag); on(viewport,'lostpointercapture',()=>{drag=null;delete viewport.dataset.dragging;});
    on(viewport,'keydown',event=>{
      if(event.target!==viewport) return;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(event.key)) {event.preventDefault();keys.add(event.key);startAnimation();}
      if(event.key==='Enter' && standing>=0) {event.preventDefault();openLesson(lessons[standing].id);}
    });
    on(window,'keyup',event=>{
      const was=keys.delete(event.key);
      if(was&&!keys.size) {
        angle=lastFacing;
        const nearest=nodes.reduce((best,p,i)=>Math.hypot(p.x-position.x,p.y-position.y)<best.distance?{index:i,distance:Math.hypot(p.x-position.x,p.y-position.y)}:best,{index:0,distance:Infinity});
        if(nearest.distance<85) select(nearest.index,{center:false});
        else {settleArrival();drawHorse(performance.now(),false);}
      }
    });
    on(viewport,'blur',()=>{if(keys.size){keys.clear();settleArrival();}}); on(window,'blur',stopAnimation);
    on(window,'focus',startAnimation);
    on(document,'visibilitychange',()=>document.hidden?stopAnimation():startAnimation());
    on(reduced,'change',()=>{if(reduced.matches && journey){position={...journey.to};journey=null;settleArrival();}drawHorse(performance.now(),false);startAnimation();});
    resizeObserver=new ResizeObserver(()=>{if(mode && viewport.clientWidth) {
      setScale(zoom,position);
      drawHorse(performance.now(),Boolean(journey));
    }});
    resizeObserver.observe(viewport);
    intersectObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)startAnimation();else stopAnimation();});
    intersectObserver.observe(viewport);
  }
  function applyMode() {
    toggle.setAttribute('aria-pressed',String(mode));
    toggle.innerHTML=mode?'課題列表 · Lesson list':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z"/><path d="M9 3v16M15 5v16"/></svg>互動地圖 · Interactive map';
    grid.hidden=mode; root.hidden=!mode;
    if(mode) {
      const first=!built; build(); updateSelection();
      if(first) setScale(1,nodes[selected]);
      drawHorse(performance.now(),false); startAnimation();
    } else stopAnimation();
  }
  on(toggle,'click',()=>{mode=!mode;applyMode();save();});
  return {
    update(userId) {
      if(owner!==userId) {
        owner=userId;
        let current, legacy;
        try {current=JSON.parse(localStorage.getItem(storageKey())||'null');legacy=systemKey === 'speaking' ? JSON.parse(localStorage.getItem(`edmund-expression-meadow-v1:${owner}`)||'null') : null;} catch {current=null;legacy=null;}
        const preference=restoreMapPreferences(current,legacy,nodes.map(n=>n.id));
        mode=preference.mode;character=preference.character;pinned=preference.pinned;
        selected=Math.max(0,nodes.findIndex(p=>p.id===pinned));standing=selected;position={...nodes[selected]};journey=null;
        clearTimeout(statusTimer);if(status){status.hidden=true;status.textContent='';}
        angle=0; keys.clear();
      }
      applyMode();
    },
    setActive(value) { active=value; if(value) startAnimation();else {stopAnimation();if(journey){position={...journey.to};journey=null;settleArrival();}} },
    reset() { active=false; owner=''; mode=false; stopAnimation();clearTimeout(statusTimer);grid.hidden=false;root.hidden=true; },
    destroy() { stopAnimation();clearTimeout(statusTimer);events.abort();sceneAnimation?.destroy();resizeObserver?.disconnect();intersectObserver?.disconnect();root.replaceChildren(); }
  };
}
