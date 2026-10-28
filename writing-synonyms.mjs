export function searchSynonymLessons(entries, query, limit = 50) {
  const term = String(query || '').normalize('NFKC').toLocaleLowerCase().trim();
  if (!term) return [];
  const normalize = value => String(value || '').normalize('NFKC').toLocaleLowerCase();
  return entries.map(entry => {
    const head = normalize(entry.headword);
    const words = (entry.terms || []).map(([word, meaning]) => normalize(word) + ' ' + normalize(meaning));
    const score = head === term ? 0 : head.startsWith(term) ? 1 : words.some(word => word.split(' ')[0] === term) ? 2 : head.includes(term) ? 3 : words.some(word => word.includes(term)) ? 4 : normalize(entry.subtitle).includes(term) ? 5 : -1;
    return {entry, score};
  }).filter(item => item.score >= 0).sort((a,b) => a.score - b.score).slice(0,limit).map(item => item.entry);
}
export function synonymPracticeUrl(id, view = 'question') {
  return `synonyms-system.html?embed=writing#${encodeURIComponent(id)}:${view === 'guide' ? 'guide' : 'question'}`;
}
export function mountWritingSynonyms() {
  const panel=document.createElement('section');panel.className='writing-synonyms-window';panel.hidden=true;
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');panel.setAttribute('aria-labelledby','writing-synonyms-title');
  panel.innerHTML=`<header data-syn-drag><span class="syn-window-emblem" aria-hidden="true">Aa</span><div><small>YOUR WORD STUDIO</small><h2 id="writing-synonyms-title">Synonym Search <span>同義詞搜尋</span></h2></div><button type="button" data-syn-close aria-label="關閉同義詞搜尋">×</button></header><form class="syn-window-search"><label for="writing-synonyms-search" class="syn-visually-hidden">搜尋同義詞</label><span aria-hidden="true">⌕</span><input id="writing-synonyms-search" type="search" placeholder="Search a word · 例如 money" autocomplete="off"><button type="submit" aria-label="搜尋">→</button></form><div class="syn-window-body"><p data-syn-status role="status" aria-live="polite">找一個字，換一種更精準的說法。</p><nav data-syn-modules aria-label="相符詞語模組" hidden></nav><div data-syn-results><div class="syn-window-empty"><span aria-hidden="true">Aa<span>↗</span></span><strong>A better word, within reach.</strong><p>詞彙・例句・中文翻譯</p></div></div></div><footer><span aria-hidden="true">⠿</span> 拖曳上方移動 · 四角調整大小</footer>`;
  for(const corner of ['nw','ne','sw','se']){const handle=document.createElement('button');handle.type='button';handle.className='syn-resize syn-resize-'+corner;handle.dataset.resize=corner;handle.setAttribute('aria-label',({nw:'左上',ne:'右上',sw:'左下',se:'右下'})[corner]+'角調整大小');panel.append(handle);}
  document.body.append(panel);
  const input=panel.querySelector('input'),status=panel.querySelector('[data-syn-status]'),results=panel.querySelector('[data-syn-results]'),modules=panel.querySelector('[data-syn-modules]');
  let index,loading,ticket=0,selection=0,focusBefore,timer,positioned=false;const lessons=new Map();
  const el=(tag,cls,text)=>{const node=document.createElement(tag);node.className=cls;if(text)node.textContent=text;return node;};
  async function loadLesson(entry){
    if(!lessons.has(entry.id))lessons.set(entry.id,(async()=>entry.id==='important'?(await import('./synonyms/important-data.mjs')).importantModule:entry.id==='social-media'?(await import('./synonyms/social-media-data.mjs')).socialMediaModule:await fetch(new URL('./synonyms/'+entry.dataFile.replace(/^\.\//,''),import.meta.url)).then(r=>{if(!r.ok)throw new Error();return r.json();}))().catch(error=>{lessons.delete(entry.id);throw error;}));
    return lessons.get(entry.id);
  }
  async function showLesson(entry,current){
    const selected=++selection;results.replaceChildren(el('p','syn-window-loading','正在整理詞彙…'));
    modules.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.module===entry.id)));
    try{
      const lesson=await loadLesson(entry);if(panel.hidden||ticket!==current||selected!==selection)return;
      results.replaceChildren();const heading=el('div','syn-module-heading');heading.append(el('h3','',entry.title),el('span','',`${lesson.words.length} expressions`));results.append(heading);
      for(const [i,word] of lesson.words.entries()){
        const first=word.exercises?.[0],card=el('article','syn-vocabulary-card');
        const top=el('div','syn-vocabulary-title'),copy=el('div','');top.append(el('span','syn-vocabulary-number',String(i+1).padStart(2,'0')));copy.append(el('h4','',word.word),el('p','syn-word-meaning',word.meaning));top.append(copy);card.append(top);
        const example=word.example||first?.upgrade?.replace('______',word.word)||first?.original||'',translation=word.exampleZh||first?.zh||'';
        if(example){const quote=el('div','syn-example');quote.append(el('span','syn-example-mark','“'));const text=el('p','example-en',example);text.lang='en';quote.append(text);if(translation)quote.append(el('p','example-zh',translation));card.append(quote);}
        results.append(card);
      }
    }catch{if(ticket===current&&selected===selection){results.replaceChildren(el('p','','未能載入詞彙。'));const retry=el('button','syn-retry','重新載入');retry.type='button';retry.onclick=()=>showLesson(entry,current);results.append(retry);}}
  }
  async function search(){
    const current=++ticket;selection++;const query=input.value.trim();modules.replaceChildren();modules.hidden=true;results.replaceChildren();
    if(!query){status.textContent='輸入英文或中文，開始找詞。';return;}
    status.textContent='正在搜尋…';
    try{
      loading ||= fetch(new URL('./synonyms/writing-search-index.json?v=20261028-examples1',import.meta.url)).then(r=>{if(!r.ok)throw new Error();return r.json();}).catch(e=>{loading=null;throw e;});index ||= await loading;
      if(panel.hidden||current!==ticket)return;const matches=searchSynonymLessons(index,query);
      status.textContent=matches.length?`${matches.length} 個相關模組 · 已先顯示最相符詞語`:'找不到相符詞語，試試另一個字。';
      for(const entry of matches){const button=el('button','syn-module-chip',entry.title);button.type='button';button.dataset.module=entry.id;button.onclick=()=>showLesson(entry,current);modules.append(button);}
      modules.hidden=matches.length<2;if(matches.length)await showLesson(matches[0],current);
    }catch{if(current===ticket)status.textContent='搜尋暫時未能載入，請再按搜尋。';}
  }
  const clamp=(n,min,max)=>Math.max(min,Math.min(n,max));
  function bounds(){const r=panel.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}
  function setBounds(r){const w=clamp(r.w,Math.min(300,innerWidth-16),innerWidth-16),h=clamp(r.h,Math.min(320,innerHeight-16),innerHeight-16);Object.assign(panel.style,{width:w+'px',height:h+'px',left:clamp(r.x,8,innerWidth-w-8)+'px',top:clamp(r.y,8,innerHeight-h-8)+'px'});}
  let gesture;
  panel.addEventListener('pointerdown',event=>{
    const handle=event.target.closest('[data-resize]'),header=event.target.closest('[data-syn-drag]');if(event.button!==0||(!handle&&(!header||event.target.closest('button'))))return;
    event.preventDefault();gesture={r:bounds(),x:event.clientX,y:event.clientY,corner:handle?.dataset.resize,id:event.pointerId};panel.setPointerCapture(event.pointerId);panel.classList.add('is-moving');
  });
  function resize(r,dx,dy,corner){const minW=Math.min(300,innerWidth-16),minH=Math.min(320,innerHeight-16);let left=r.x,right=r.x+r.w,top=r.y,bottom=r.y+r.h;
    if(corner.includes('w'))left=clamp(r.x+dx,8,right-minW);else right=clamp(right+dx,left+minW,innerWidth-8);
    if(corner.includes('n'))top=clamp(r.y+dy,8,bottom-minH);else bottom=clamp(bottom+dy,top+minH,innerHeight-8);
    setBounds({x:left,y:top,w:right-left,h:bottom-top});
  }
  panel.addEventListener('pointermove',event=>{if(!gesture||event.pointerId!==gesture.id)return;const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;if(gesture.corner)resize(gesture.r,dx,dy,gesture.corner);else setBounds({...gesture.r,x:gesture.r.x+dx,y:gesture.r.y+dy});});
  const end=()=>{gesture=null;panel.classList.remove('is-moving');};panel.addEventListener('pointerup',end);panel.addEventListener('pointercancel',end);panel.addEventListener('lostpointercapture',end);
  panel.querySelectorAll('[data-resize]').forEach(handle=>handle.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();resize(bounds(),event.key==='ArrowLeft'?-16:event.key==='ArrowRight'?16:0,event.key==='ArrowUp'?-16:event.key==='ArrowDown'?16:0,handle.dataset.resize);}));
  window.addEventListener('resize',()=>{if(!panel.hidden)setBounds(bounds());});
  function close(){ticket++;selection++;clearTimeout(timer);panel.hidden=true;focusBefore?.focus();}
  function open(button=document.activeElement){focusBefore=button;panel.hidden=false;if(!positioned){setBounds({x:innerWidth-470,y:100,w:440,h:Math.min(690,innerHeight-120)});positioned=true;}else setBounds(bounds());input.focus();if(input.value)void search();}
  panel.querySelector('form').onsubmit=event=>{event.preventDefault();clearTimeout(timer);void search();};input.addEventListener('input',()=>{clearTimeout(timer);ticket++;selection++;timer=setTimeout(search,180);});
  panel.querySelector('[data-syn-close]').onclick=close;panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopPropagation();close();}});
  document.querySelectorAll('[data-writing-synonyms]').forEach(button=>button.addEventListener('click',()=>open(button)));
  return {close,open};
}
