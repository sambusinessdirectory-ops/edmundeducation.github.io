const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={vocabulary:'詞彙',phrase:'片語 / 句式',example:'例句',guidance:'用法',correction:'正確寫法',warning:'錯例 · 不建議使用'};
let bankPromise;
export async function loadVocabulary(){
 if(!bankPromise)bankPromise=fetch(new URL('./vocabulary-data.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('詞彙庫未能載入');return r.json();}).catch(e=>{bankPromise=null;throw e;});
 return bankPromise;
}
export function filterVocabulary(bank,{query='',category='',kind=''}={}){
 const terms=query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 return bank.entries.filter(e=>(!category||e.category===category)&&(!kind||e.kind===kind)&&terms.every(t=>[e.english,...e.notes,...e.examples].join(' ').toLocaleLowerCase().includes(t)));
}
export function installVocabulary(){
 let panel,bank,query='',category='',kind='',limit=40,tab='entries',pageNumber=1,opener;
 function close(){panel?.remove();panel=null;opener?.focus({preventScroll:true});}
 function pageView(){
  const page=bank.bookPages[pageNumber-1];
  return `<div class="vocab-source-controls"><button type="button" data-page-step="-1" ${pageNumber===1?'disabled':''}>←</button><label>原書第 <input type="number" min="1" max="110" value="${pageNumber}" data-book-page aria-label="原書頁碼"> / 110 頁</label><button type="button" data-page-step="1" ${pageNumber===110?'disabled':''}>→</button></div><p class="vocab-source-note">${esc(bank.source.title)} · 原書內容（頁碼按 PDF 順序）</p><pre class="vocab-source-text">${esc(page.text||'封面頁：沒有詞彙文字。')}</pre>${page.tables.length?`<details class="vocab-tables"><summary>查看本頁 ${page.tables.length} 個表格</summary>${page.tables.map(table=>`<div class="vocab-table-scroll"><table>${table.map((row,i)=>`<tr>${row.map(cell=>`<${i?'td':'th'}>${esc(cell)}</${i?'td':'th'}>`).join('')}</tr>`).join('')}</table></div>`).join('')}</details>`:''}`;
 }
 function renderResults(){
  if(tab==='source'){panel.querySelector('[data-vocab-results]').innerHTML=pageView();return;}
  const results=filterVocabulary(bank,{query,category,kind});
  panel.querySelector('[data-vocab-count]').textContent=`${results.length} / ${bank.entries.length}`;
  panel.querySelector('[data-vocab-results]').innerHTML=results.length?results.slice(0,limit).map(e=>`<article class="vocab-entry ${e.kind==='warning'?'vocab-warning':''}"><div class="vocab-meta"><span>${esc(bank.categories.find(c=>c.id===e.category).label)} · ${labels[e.kind]}</span><button type="button" data-source-page="${e.pages[0]}" aria-label="查看第 ${e.pages.join('、')} 頁原文">p. ${e.pages.join(', ')}</button></div><h3 lang="en">${esc(e.english)}</h3>${e.notes.map(note=>`<p>${esc(note)}</p>`).join('')}${e.examples.map(example=>`<blockquote lang="en">${esc(example)}</blockquote>`).join('')}<div class="vocab-entry-actions"><button type="button" data-copy-vocab="${e.id}">複製</button>${e.kind!=='warning'&&e.kind!=='guidance'?`<button type="button" data-insert-vocab="${e.id}" data-target="observation">＋ Observation</button><button type="button" data-insert-vocab="${e.id}" data-target="overview">＋ Overview</button>`:''}</div></article>`).join('')+(results.length>limit?'<button class="vocab-more" type="button" data-vocab-more>顯示更多</button>':''):'<p class="vocab-empty">找不到符合的詞彙，試試其他字詞或情境。</p>';
 }
 function render(){
  panel.innerHTML=`<header class="vocab-header"><div><p class="eyebrow">IELTS TASK 1 · LANGUAGE LIBRARY</p><h2 id="vocab-title">情境詞彙庫 <small>${bank.entries.length} 項</small></h2></div><button type="button" data-vocab-close aria-label="關閉詞彙庫">×</button></header><div class="vocab-tabs" role="group" aria-label="詞彙庫內容"><button type="button" data-vocab-tab="entries" aria-pressed="${tab==='entries'}">情境詞彙</button><button type="button" data-vocab-tab="source" aria-pressed="${tab==='source'}">原書內容</button></div><div class="vocab-filters" ${tab==='source'?'hidden':''}><input type="search" data-vocab-search aria-label="搜尋中英文詞彙" placeholder="搜尋中英文、片語或例句…" value="${esc(query)}"><div><select data-vocab-category aria-label="選擇詞彙情境"><option value="">所有情境</option>${bank.categories.map(c=>`<option value="${c.id}" ${category===c.id?'selected':''}>${esc(c.label)}</option>`).join('')}</select><select data-vocab-kind aria-label="選擇詞彙類型"><option value="">所有類型</option>${Object.entries(labels).map(([id,label])=>`<option value="${id}" ${kind===id?'selected':''}>${label}</option>`).join('')}</select><span data-vocab-count role="status"></span></div></div><div class="vocab-results" data-vocab-results></div><footer class="vocab-footer">資料來源：你提供的 Skills Overview · Book 1（110 頁）<span data-vocab-status role="status"></span></footer>`;
  renderResults();
  let drag;
  const handle=panel.querySelector('.vocab-header');
  handle.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;const rect=panel.getBoundingClientRect();drag={x:e.clientX-rect.left,y:e.clientY-rect.top,id:e.pointerId};handle.setPointerCapture(e.pointerId);});
  handle.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;panel.style.left=Math.max(8,Math.min(innerWidth-panel.offsetWidth-8,e.clientX-drag.x))+'px';panel.style.top=Math.max(8,Math.min(innerHeight-panel.offsetHeight-8,e.clientY-drag.y))+'px';panel.style.right='auto';});
  handle.addEventListener('pointerup',()=>drag=null);handle.addEventListener('pointercancel',()=>drag=null);
 }
 document.addEventListener('click',async event=>{
  const trigger=event.target.closest('[data-vocabulary-open]');if(!trigger)return;opener=trigger;
  if(panel){panel.querySelector('[data-vocab-search]')?.focus();return;}
  trigger.disabled=true;
  try{bank=await loadVocabulary();panel=document.createElement('aside');panel.className='vocabulary-panel';panel.setAttribute('role','dialog');panel.setAttribute('aria-labelledby','vocab-title');document.body.append(panel);render();panel.querySelector('[data-vocab-search]').focus();
   panel.addEventListener('input',e=>{if(e.target.matches('[data-vocab-search]')){query=e.target.value;limit=40;renderResults();}});
   panel.addEventListener('change',e=>{if(e.target.matches('[data-vocab-category]')){category=e.target.value;limit=40;renderResults();}if(e.target.matches('[data-vocab-kind]')){kind=e.target.value;limit=40;renderResults();}if(e.target.matches('[data-book-page]')){pageNumber=Math.max(1,Math.min(110,Math.floor(Number(e.target.value)||1)));renderResults();}});
   panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}});
   panel.addEventListener('click',async e=>{
    const button=e.target.closest('button');if(!button)return;
    if(button.hasAttribute('data-vocab-close')){close();return;}
    if(button.dataset.vocabTab){tab=button.dataset.vocabTab;render();return;}
    if(button.dataset.sourcePage){pageNumber=Number(button.dataset.sourcePage);tab='source';render();return;}
    if(button.dataset.pageStep){pageNumber=Math.max(1,Math.min(110,pageNumber+Number(button.dataset.pageStep)));renderResults();return;}
    if(button.hasAttribute('data-vocab-more')){limit+=40;renderResults();return;}
    const id=button.dataset.copyVocab||button.dataset.insertVocab,entry=bank.entries.find(item=>item.id===id);if(!entry)return;
    if(button.dataset.copyVocab){try{await navigator.clipboard.writeText(entry.english);panel.querySelector('[data-vocab-status]').textContent='已複製';}catch{panel.querySelector('[data-vocab-status]').textContent='請選取文字後複製';}}
    if(button.dataset.insertVocab&&entry.kind!=='warning'&&entry.kind!=='guidance'){window.dispatchEvent(new CustomEvent('chart-vocabulary-insert',{detail:{target:button.dataset.target,text:entry.english}}));panel.querySelector('[data-vocab-status]').textContent=`已加入 ${button.dataset.target==='overview'?'Overview':'Observation'}`;}
   });
  }catch{document.querySelector('#toast').textContent='詞彙庫未能載入，請稍後重試。';}finally{trigger.disabled=false;}
 });
 window.addEventListener('resize',()=>{if(!panel)return;const rect=panel.getBoundingClientRect();panel.style.left=Math.max(8,Math.min(innerWidth-panel.offsetWidth-8,rect.left))+'px';panel.style.top=Math.max(8,Math.min(innerHeight-panel.offsetHeight-8,rect.top))+'px';panel.style.right='auto';});
}
