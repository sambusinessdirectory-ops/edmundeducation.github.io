import { cosmeticAtlas, restoreCosmetics } from './eddy-cosmetics.mjs?v=20260915-outfits1';
import { MASCOT_VIEWS } from './speaking-mascot-views.mjs?v=20260915-companions1';
import { blinkAmount, screenFacingAngle } from './speaking-mascot-behaviour.mjs?v=20260915-companions1';

const CHARACTERS = [{id:'eddy',name:'Eddie'},{id:'phoebe',name:'Phoebe'},{id:'elsie',name:'Elsie'}];
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Measured surface of table-unified-v1.jpg, in a 1000 x 667 world.
export function chessPosition(index) {
  const row = Math.floor(index / 4), column = index % 4;
  const t=(row+.5)/4, left=315+(271-315)*t, right=708+(753-708)*t;
  return {x:left+(right-left)*(column+.5)/4,y:119+(532-119)*t};
}
export function isOnChessboard({x,y}) {
  if(y<119||y>532)return false;
  const t=(y-119)/413;
  return x>=315-44*t && x<=708+45*t;
}

export function mountWritingChessMap(host,{storage,owner,exerciseId,onStart}={}) {
  void restoreCosmetics(owner);
  const groups=host.querySelector('.practice-mode-groups');
  const buttons=[...groups?.querySelectorAll('[data-start-practice-mode]')||[]];
  // Other catalogues keep their actual available modes; never invent sixteen modes.
  if(buttons.length!==16)return null;
  const modes=buttons.map((button,index)=>({index,mode:button.dataset.startPracticeMode,difficulty:button.dataset.practiceDifficulty,title:button.querySelector('strong').textContent,description:button.querySelector('span').textContent,count:button.querySelector('.mode-question-count').textContent,level:button.closest('section').querySelector('h3').childNodes[0].textContent}));
  const events=new AbortController(), reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const key=`writing-chess-map-v1:${owner||'guest'}`;
  let prefs={};try{prefs=JSON.parse(storage?.getItem(key)||'{}')||{};}catch{}
  let character=CHARACTERS.some(c=>c.id===prefs.character)?prefs.character:'eddy';
  let selected=Math.max(0,modes.findIndex(m=>prefs.exercise===exerciseId&&m.mode===prefs.mode&&m.difficulty===prefs.difficulty));
  let position=chessPosition(selected), route=[], frame=0,last=0,dead=false,angle=0,arrivalLabel="";
  const images=new Map();
  const loadImage=(id,blinking=false)=>{
    const data=MASCOT_VIEWS[id].standing,key=id+(blinking?"-blink":"-standing"),source=blinking?data.blinkImage:data.image;
    if(!source)return null;if(images.has(key))return images.get(key);
    const img=new Image();images.set(key,img);img.onload=()=>{if(!dead){drawCast();draw(performance.now());}};img.onerror=()=>{if(!dead)status.textContent="角色圖片未能載入；仍可選擇並開始練習。";};
    img.src=new URL(`./assets/speaking-system/mascots/${data.folder||"v2"}/${source}`,import.meta.url).href;return img;
  };
  const on=(el,type,fn)=>el.addEventListener(type,fn,{signal:events.signal});
  const save=()=>{try{storage?.setItem(key,JSON.stringify({character,exercise:exerciseId,mode:modes[selected].mode,difficulty:modes[selected].difficulty}));}catch{}};
  host.classList.add('writing-chess-page');
  const summary=host.querySelector('.mode-summary');if(summary)summary.hidden=true;
  const toolbar=host.querySelector('.paragraph-selector');
  const cast=document.createElement('div');cast.className='chess-cast';cast.setAttribute('aria-label','選擇同行角色');
  cast.innerHTML=CHARACTERS.map(c=>`<button type="button" data-chess-character="${c.id}" aria-pressed="${c.id===character}"><canvas width="100" height="110" aria-hidden="true"></canvas><span>${c.name}</span></button>`).join('');
  toolbar.prepend(cast);
  const nodeMarkup=modes.map((m,i)=>{const p=chessPosition(i);return `<button type="button" class="chess-stop ${Math.floor(i/4)%2===i%2?'ivory':'ebony'}" data-start-practice-mode="${escape(m.mode)}" data-practice-difficulty="${escape(m.difficulty)}" data-chess-index="${i}" style="left:${p.x/10}%;top:${p.y/6.67}%" aria-pressed="${i===selected}" aria-label="${escape(m.level+'，'+m.title+'，'+m.count)}"><span class="chess-coin">${String(i+1).padStart(2,'0')}</span><span class="chess-label"><strong>${m.mode==='both'?'顯示開首<br>及結尾字母':m.mode==='blank'?'不顯示字母提示':escape(m.title)}</strong></span></button>`;}).join('');
  const difficultyMarkup=modes.filter((_,i)=>i%4===0).map((m,row)=>`<div class="chess-difficulty" style="top:${chessPosition(row*4).y/6.67}%"><strong>${escape(m.level)}</strong><span>${escape(m.count)}</span></div>`).join('');
  groups.className='writing-chess-map';
  groups.innerHTML=`<div class="chess-map-caption"><span>WRITING PRACTICE</span><span>16 種練習模式</span></div><div class="chess-scroll" tabindex="0" aria-label="練習棋盤，可左右捲動"><div class="chess-stage"><img class="chess-table" src="assets/writing-chess-map/table-unified-v1.jpg" alt="木製棋盤，四周有書本、黃銅檯燈及西洋棋子" draggable="false">${difficultyMarkup}${nodeMarkup}<div class="chess-companion" aria-hidden="true"><span class="chess-contact"></span><canvas width="240" height="280"></canvas></div><div class="chess-plaque"><span aria-hidden="true">♛</span>請選擇練習模式及段落範圍</div></div></div><div class="chess-selection"><div><span class="chess-selection-level"></span><h3></h3><p></p></div><button class="chess-enter" type="button" data-chess-enter>開始練習 <span aria-hidden="true">→</span></button></div><p class="chess-status" aria-live="polite"></p>`;
  const avatar=groups.querySelector('.chess-companion'), canvas=avatar.querySelector('canvas'), status=groups.querySelector('.chess-status');
  const drawSprite=(target,id,facing,time,walking)=>{
    const open=loadImage(id),closed=loadImage(id,true);
    const img=cosmeticAtlas(id,blinkAmount(time/1000,id.charCodeAt(0),reduced.matches)>.5&&closed?.naturalWidth?closed:open);
    const ctx=target.getContext('2d');ctx.clearRect(0,0,target.width,target.height);if(!img.naturalWidth)return;
    const distance=a=>Math.abs(((a-facing+540)%360)-180);
    const v=MASCOT_VIEWS[id].standing.views.reduce((a,b)=>distance(a.angle)<distance(b.angle)?a:b);
    const [rx,ry,rw,rh]=v.rect, sx=rx*img.width,sy=(1-ry-rh)*img.height,sw=rw*img.width,sh=rh*img.height;
    const h=target.height*.94,w=h*sw/sh,x=(target.width-w)/2,y=target.height-h-4;
    ctx.save();if(v.mirror){ctx.translate(target.width,0);ctx.scale(-1,1);}
    const phase=time/85,bob=walking&&!reduced.matches?Math.sin(phase)*2:0;
    if(walking&&!reduced.matches){
      ctx.drawImage(img,sx,sy,sw,sh*.79,x,y+bob,w,h*.79+1);
      for(let side=0;side<2;side++){ctx.save();const hip=x+w*(side?.75:.25);ctx.translate(hip,y+h*.79);ctx.rotate(Math.sin(phase+side*Math.PI)*.08);ctx.translate(-hip,-y-h*.79);ctx.drawImage(img,sx+side*sw/2,sy+sh*.79,sw/2,sh*.21,x+side*w/2,y+h*.79+bob,w/2,h*.21);ctx.restore();}
    }else ctx.drawImage(img,sx,sy,sw,sh,x,y,w,h);
    ctx.restore();
  };
  function drawCast(){for(const c of CHARACTERS)drawSprite(cast.querySelector(`[data-chess-character="${c.id}"] canvas`),c.id,0,0,false);}
  function draw(time){avatar.style.left=`${position.x/10}%`;avatar.style.top=`${position.y/6.67}%`;avatar.dataset.walking=String(route.length>0);drawSprite(canvas,character,angle,time,route.length>0);}
  function update(){
    const m=modes[selected];groups.querySelectorAll('.chess-stop').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));
    groups.querySelector('.chess-selection-level').textContent=`${String(selected+1).padStart(2,'0')} / 16 · ${m.level} · ${m.count}`;
    groups.querySelector('.chess-selection h3').textContent=m.title;groups.querySelector('.chess-selection p').textContent=m.description;
    save();
  }
  function tick(time){
    frame=0;if(dead||document.hidden)return;const wasWalking=route.length>0;
    let budget=Math.min((time-last)/1000,.05)*390;last=time;
    while(route.length&&budget>0){const goal=route[0],dx=goal.x-position.x,dy=goal.y-position.y,d=Math.hypot(dx,dy);angle=screenFacingAngle(dx,dy);if(d<=budget){position={...goal};route.shift();budget-=d;}else{position.x+=dx/d*budget;position.y+=dy/d*budget;budget=0;}}
    draw(time);
    if(wasWalking&&!route.length){angle=0;draw(time);status.textContent=arrivalLabel?`已到達：${arrivalLabel}`:"已到達棋盤上選擇的位置。";}
    if(!reduced.matches||route.length)frame=requestAnimationFrame(tick);
  }
  function centerSelection(){
    const scroll=groups.querySelector('.chess-scroll'), stage=groups.querySelector('.chess-stage');
    if(stage.offsetWidth>scroll.clientWidth)scroll.scrollLeft=chessPosition(selected).x/1000*stage.offsetWidth-scroll.clientWidth/2;
  }
  function walkTo(point,label=""){
    route=[point];arrivalLabel=label;
    if(reduced.matches){cancelAnimationFrame(frame);frame=0;route=[];position={...point};draw(0);return;}
    if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}
  }
  function select(index){
    selected=index;update();centerSelection();
    walkTo(chessPosition(index),`${modes[index].level}，${modes[index].title}`);
  }
  const stage=groups.querySelector('.chess-stage');
  let pointerStart=null;
  on(stage,'pointerdown',event=>{pointerStart={x:event.clientX,y:event.clientY};});
  on(stage,'click',event=>{
    if(event.target.closest('button,.chess-plaque,.chess-difficulty'))return;
    if(pointerStart&&Math.hypot(event.clientX-pointerStart.x,event.clientY-pointerStart.y)>8)return;
    const rect=stage.getBoundingClientRect();
    const point={x:(event.clientX-rect.left)/rect.width*1000,y:(event.clientY-rect.top)/rect.height*667};
    if(isOnChessboard(point))walkTo(point);
  });
  // Open exactly once on a tile click; the original delegated handler must not run twice.
  groups.addEventListener('click',event=>{const button=event.target.closest('[data-chess-index]');if(!button)return;event.stopPropagation();const index=Number(button.dataset.chessIndex);select(index);onStart?.(modes[index].mode,modes[index].difficulty);},{capture:true,signal:events.signal});
  on(groups.querySelector('[data-chess-enter]'),'click',()=>onStart?.(modes[selected].mode,modes[selected].difficulty));
  on(cast,'click',event=>{const button=event.target.closest('[data-chess-character]');if(!button)return;character=button.dataset.chessCharacter;cast.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));save();draw(performance.now());});
  on(groups,'keydown',event=>{const b=event.target.closest('[data-chess-index]');if(!b||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;event.preventDefault();const n=Number(b.dataset.chessIndex);let row=Math.floor(n/4),col=n%4;if(event.key==='ArrowUp')row=Math.max(0,row-1);if(event.key==='ArrowDown')row=Math.min(3,row+1);if(event.key==='ArrowLeft')col=Math.max(0,col-1);if(event.key==='ArrowRight')col=Math.min(3,col+1);const next=event.key==='Home'?0:event.key==='End'?15:row*4+col;select(next);groups.querySelector(`[data-chess-index="${next}"]`).focus();});
  on(document,'visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else if(!reduced.matches||route.length){last=performance.now();frame=requestAnimationFrame(tick);}});
  on(reduced,'change',()=>{if(reduced.matches){cancelAnimationFrame(frame);frame=0;position=route.at(-1)||position;route=[];draw(0);}else if(!frame){last=performance.now();frame=requestAnimationFrame(tick);}});
  const observer=new MutationObserver(()=>{if(!host.isConnected)destroy();});observer.observe(host.parentElement,{childList:true});
  function destroy(){if(dead)return;dead=true;events.abort();observer.disconnect();cancelAnimationFrame(frame);images.forEach(img=>{img.onload=null;img.onerror=null;});}
  on(window,'pagehide',destroy);update();drawCast();draw(0);centerSelection();if(!reduced.matches){last=performance.now();frame=requestAnimationFrame(tick);}return {destroy};
}
