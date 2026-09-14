import { createExpressionMap } from './common-expression-map.mjs';

const ART = new URL('./assets/flashcards/range-worlds/', import.meta.url).href;
const COLLECTIONS = [
  {key:'standard',title:'標準模式 · 木製算盤',eyebrow:'THE STUDY ABACUS',columns:4},
  {key:'30',title:'30 張卡範圍 · 勳章館',eyebrow:'THE MEDAL CABINET',columns:5},
  {key:'10',title:'10 張卡範圍 · 寶石盒',eyebrow:'THE JEWEL COLLECTION',columns:4}
];

export function createFlashcardMapLayout(entries) {
  let top=0; const nodes=[],sections=[];
  for(const collection of COLLECTIONS) {
    const items=entries.filter(e=>e.world===collection.key);if(!items.length)continue;
    const rows=Math.ceil(items.length/collection.columns),height=600+(rows-1)*360;
    const section={...collection,top,height,rows};sections.push(section);
    const margin=collection.columns===5?190:240,step=(1600-margin*2)/(collection.columns-1);
    items.forEach((entry,index)=>{
      const row=Math.floor(index/collection.columns),column=index%collection.columns;
      nodes.push({id:entry.id,world:collection.key,row,x:margin+(row%2?collection.columns-1-column:column)*step,y:top+330+row*360});
    });
    top+=height;
  }
  return {width:1600,height:top,nodes,sections};
}

// Follow the collection rows in order; successive rows turn at the edge.
// Free walking and empty-space clicks remain available, as on the lesson maps.
export function flashcardMapRoute(nodes,from,to) {
  if(!nodes.length)return [to];
  const nearest=p=>nodes.reduce((best,node,index)=>Math.hypot(p.x-node.x,p.y-node.y)<best.distance?{index,distance:Math.hypot(p.x-node.x,p.y-node.y)}:best,{index:0,distance:Infinity});
  const start=nearest(from),end=nearest(to);
  if(end.distance>2)return [to];
  const route=[];
  if(start.distance>2)route.push(nodes[start.index]);
  const direction=Math.sign(end.index-start.index);
  for(let i=start.index+direction;direction&&i!==end.index+direction;i+=direction)route.push(nodes[i]);
  if(!route.length)route.push(to);
  return route.map(({x,y})=>({x,y}));
}

function terrain(layout) {
  return layout.sections.map(section=>{
    const nodes=layout.nodes.filter(n=>n.world===section.key);
    const rows=Array.from({length:section.rows},(_,row)=>nodes.filter(n=>n.row===row));
    let fittings='';
    if(section.key!=='10') {
      fittings=rows.map(row=>`<span class="fc-map-rod" style="top:${row[0].y-section.top+22}px"></span>`).join('');
      if(section.key==='standard') {
        fittings+='<span class="fc-abacus-post fc-abacus-left"></span><span class="fc-abacus-post fc-abacus-right"></span>';
        for(const row of rows) {
          const sorted=[...row].sort((a,b)=>a.x-b.x);
          for(let i=1;i<sorted.length;i++) for(let n=1;n<=3;n++) {
            const a=sorted[i-1],b=sorted[i];
            fittings+=`<img class="fc-map-spacer" src="${ART}spacer-walnut.webp" alt="" style="left:${a.x+106+(b.x-a.x-212)*n/4}px;top:${a.y-section.top-17}px">`;
          }
        }
      }
    }
    return `<section class="fc-map-realm" data-collection="${section.key}" style="top:${section.top}px;height:${section.height}px" aria-label="${section.title}"><div class="fc-map-realm-heading"><small>${section.eyebrow}</small><h3>${section.title}</h3><p data-collection-summary="${section.key}"></p></div>${fittings}</section>`;
  }).join('');
}

let snapshot,controller,host,mapRoot,toggle,contextKey='',entries=[],layout,bindings=[],active=false;
let cloneId=0;
function cloneArtwork(source) {
  const holder=document.createElement('div');
  source.childNodes.forEach(node=>holder.append(node.cloneNode(true)));
  // The quick-select fallback remains in the DOM; clone SVG IDs must be independent.
  const prefix=`fc-map-art-${++cloneId}-`,ids=new Map();
  holder.querySelectorAll('[id]').forEach(node=>{ids.set(node.id,prefix+node.id);node.id=prefix+node.id;});
  holder.querySelectorAll('*').forEach(node=>{
    for(const attribute of [...node.attributes]) {
      let value=attribute.value;
      for(const [oldId,newId] of ids)value=value.replaceAll(`url(#${oldId})`,`url(#${newId})`).replaceAll(`"#${oldId}"`,`"#${newId}"`);
      if(ids.has(value.slice(1))&&value.startsWith('#'))value='#'+ids.get(value.slice(1));
      if(value!==attribute.value)node.setAttribute(attribute.name,value);
    }
  });
  holder.querySelectorAll('img').forEach(img=>img.loading='eager');
  return [...holder.childNodes];
}
function progress(entry) {
  const button=entry.source;
  return window.FlashcardRangeWorlds.progressFor(snapshot.count,button.dataset.rangeStart||1,button.dataset.rangeEnd||0,snapshot.hasOwner?snapshot.familiarity:{green:[],red:[]});
}
function syncArtwork() {
  for(const {source,target} of bindings) {
    target.classList.toggle('range-completed',source.classList.contains('range-completed'));
    for(const cls of ['range-number','range-choice-title','range-progress','range-state','range-description'])target.querySelector('.'+cls).textContent=source.querySelector('.'+cls).textContent;
  }
  for(const section of layout.sections) {
    const source=snapshot.root.querySelector(`[data-range-world="${section.key}"] .range-world-summary`);
    mapRoot.querySelector(`[data-collection-summary="${section.key}"]`).textContent=source?.textContent||'';
  }
}
function refreshLabels() {
  for(const entry of entries) {
    const stats=progress(entry),number=entry.source.querySelector('.range-number').textContent;
    entry.questions=Array.from({length:stats.total});
    entry.titleEn=entry.world==='standard'?entry.source.dataset.originalTitle:`${number} 張卡`;
    entry.titleZh=`已掌握 ${stats.correct} / ${stats.total} · 到達後開始練習`;
    entry.mapLabel=`${entry.world==='standard'?'標準':entry.world+' 卡'} · ${number}`;
  }
}
function updateToggleLabel() {
  toggle.textContent=mapRoot.hidden?'步行地圖 · Walking map':'快速選擇 · Quick select';
  host.dataset.view=mapRoot.hidden?'list':'map';
}
function createHost(root) {
  host=document.createElement('div');host.id='flashcard-range-map';root.before(host);
  const bar=document.createElement('nav');bar.className='fc-map-navigation';bar.setAttribute('aria-label','Flashcard collections');
  for(const section of COLLECTIONS) {
    const button=document.createElement('button');button.type='button';button.dataset.walkCollection=section.key;button.textContent=section.title;
    button.addEventListener('click',()=>{
      if(mapRoot.hidden)toggle.click();
      const first=entries.find(e=>e.world===section.key);if(!first)return;
      const picker=mapRoot.querySelector('select');picker.value=first.id;picker.dispatchEvent(new Event('change',{bubbles:true}));
      mapRoot.querySelector('.expression-map-viewport').focus({preventScroll:true});
    });bar.append(button);
  }
  toggle=document.createElement('button');toggle.type='button';toggle.className='fc-map-toggle';bar.append(toggle);
  mapRoot=document.createElement('section');mapRoot.hidden=true;host.append(bar,mapRoot);
}
function build() {
  controller?.destroy();bindings=[];
  layout=createFlashcardMapLayout(entries);refreshLabels();
  controller=createExpressionMap({root:mapRoot,toggle,grid:snapshot.root,lessons:entries,
    systemKey:`flashcards:${snapshot.language}:${encodeURIComponent(snapshot.deckId)}`,
    getCompleted:id=>progress(entries.find(e=>e.id===id)).correct,
    openLesson:id=>{const entry=entries.find(e=>e.id===id);if(entry&&!entry.source.disabled)entry.source.click();},
    theme:{id:'flashcard-collections',title:'閃卡收藏之旅',kicker:'THE FLASHCARD COLLECTIONS',width:layout.width,height:layout.height,
      fitOverview:true,positions:()=>layout.nodes,
      overviewBounds:point=>{const section=layout.sections.find(s=>point.y<s.top+s.height)||layout.sections.at(-1);return {top:section.top,height:section.height,key:section.key};},
      navigation:{path:(from,to)=>flashcardMapRoute(layout.nodes,from,to),step:(_from,to)=>to,duration:({distance})=>Math.max(260,Math.min(6000,distance/.65))},
      terrain:()=>terrain(layout),
      mount(root){
        root.querySelector('.expression-map-heading h2 small').textContent=`${entries.length} 個學習站 · 自由探索`;
        root.querySelector('.expression-map-picker > span').textContent='前往平台';
        root.querySelector('select').setAttribute('aria-label','前往卡片平台 · Choose a flashcard platform');
        root.querySelector('.expression-map-viewport').setAttribute('aria-label','閃卡地圖：點選平台讓角色步行前往，或用方向鍵 / WASD 走動。到達後開始練習。');
        root.querySelector('[data-map-open]').innerHTML='<span>開始練習<small>Start practice</small></span><span aria-hidden="true">→</span>';
        root.querySelector('.expression-map-lesson-card').setAttribute('aria-label','卡片平台 · Flashcard platform');
        root.querySelector('.expression-map-desktop-hint').textContent='點平台步行前往 · 拖曳探索 · 方向鍵 / WASD 走動';
        root.querySelectorAll('[data-map-level]').forEach((target,index)=>{
          const entry=entries[index],node=layout.nodes[index],section=layout.sections.find(s=>s.key===entry.world),source=entry.source;
          target.replaceChildren(...cloneArtwork(source));
          target.classList.add('fc-map-platform');
          target.querySelector('.range-progress').classList.add('expression-map-stone-status');
          for(const key of ['material','gemShape','gemColor','gemInk','ribbon'])if(source.dataset[key])target.dataset[key]=source.dataset[key];
          for(const cls of ['status-mode-red','status-mode-green'])target.classList.toggle(cls,source.classList.contains(cls));
          target.dataset.platformId=entry.id;target.style.top=`${node.y-section.top}px`;
          root.querySelector(`[data-collection="${entry.world}"]`).append(target);bindings.push({source,target});
        });
        return {update:syncArtwork,draw(){},destroy(){}};
      }
    }
  });
  // The engine owns map/list switching. Retain flashcard-specific button copy.
  toggle.onclick=()=>queueMicrotask(updateToggleLabel);
}
function refresh(next) {
  snapshot=next;
  if(!host)createHost(next.root);
  const available=[...next.root.querySelectorAll('[data-start-mode]')].filter(b=>!b.disabled);
  const key=JSON.stringify([next.deckId,next.language,next.ownerId,next.count,available.length]);
  if(!available.length) {
    controller?.destroy();controller=null;contextKey='';host.hidden=true;next.root.hidden=false;return;
  }
  host.hidden=false;
  if(contextKey!==key) {
    entries=available.map((source,index)=>{const world=source.closest('[data-range-world]').dataset.rangeWorld;const originalIndex=[...source.parentElement.querySelectorAll('[data-start-mode]')].indexOf(source);return {id:`${world}:${originalIndex}`,world,source,order:index+1};});
    contextKey=key;build();
  } else refreshLabels();
  controller.update(String(next.ownerId||'guest'));
  active=!next.root.closest('[data-deck-start]')?.classList.contains('hidden');
  controller.setActive(active);updateToggleLabel();
}
function setActive(value){active=!!value;controller?.setActive(active);}
if(typeof window!=='undefined') {
  window.FlashcardRangeMap={refresh,setActive};
  const initial=window.FlashcardRangeWorlds?.getSnapshot();if(initial)refresh(initial);
  window.addEventListener('pagehide',()=>controller?.setActive(false));
  window.addEventListener('pageshow',()=>controller?.setActive(active));
}
