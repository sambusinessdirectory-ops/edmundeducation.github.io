import { TRUE_VALUE_STATEMENTS } from './true-values-statements.mjs';
const KEY_PREFIX = 'edmund-purpose-books-v1:';
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const identity = () => document.querySelector('[data-learning-purpose]')?.dataset.studentId || 'guest';
const read = () => { try { return JSON.parse(localStorage.getItem(KEY_PREFIX + identity()) || '{}'); } catch { return {}; } };
const write = data => { data._savedAt=Date.now();try { localStorage.setItem(KEY_PREFIX + identity(), JSON.stringify(data)); } catch {}if(identity()!=='guest'){clearTimeout(cloudSaveTimer);cloudSaveTimer=setTimeout(()=>announce('edmund-learning-books-save',{studentId:identity(),data}),500);} };
const values = data => Array.isArray(data.values) ? data.values : [];
const habits = data => Array.isArray(data.habits) ? data.habits : [];
const plans = data => Array.isArray(data.plans) ? data.plans : [];
let cloudSaveTimer;
const announce = (name, detail) => window.dispatchEvent(new CustomEvent(name, {detail}));
function shell(title, content, className='') {
 const dialog=document.createElement('dialog');dialog.className=`purpose-book-dialog purpose-tool-dialog ${className}`;
 dialog.innerHTML=`<header><h2>${esc(title)}</h2><button type="button" data-close aria-label="Close">×</button></header><div class="purpose-tool-body">${content}</div>`;
 document.body.append(dialog);dialog.showModal();dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove(),{once:true});return dialog;
}
function splitPane(dialog, left, right, label) {
 (dialog.querySelector('[data-value-split]')||dialog.querySelector('.purpose-tool-body')).innerHTML=`<div class="book-split" style="--left-width:50%"><section class="book-left">${left}</section><div class="book-splitter" role="separator" aria-orientation="vertical" tabindex="0" aria-label="Resize ${esc(label)} columns"></div><section class="book-right">${right}</section></div>`;
 const split=dialog.querySelector('.book-split'),bar=dialog.querySelector('.book-splitter');let dragging=false;
 bar.onpointerdown=e=>{dragging=true;bar.setPointerCapture(e.pointerId);};bar.onpointermove=e=>{if(!dragging)return;const rect=split.getBoundingClientRect();split.style.setProperty('--left-width',`${Math.max(25,Math.min(75,(e.clientX-rect.left)/rect.width*100))}%`);};bar.onpointerup=bar.onpointercancel=()=>dragging=false;
 bar.onkeydown=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const current=parseFloat(split.style.getPropertyValue('--left-width'))||50;split.style.setProperty('--left-width',`${Math.max(25,Math.min(75,current+(e.key==='ArrowRight'?3:-3)))}%`);};
}
const VALUE_CATEGORIES = [
 ['成長與能力','Growth & ability'],['規律與習慣','Consistency & habits'],['長遠選擇','Long-term choices'],
 ['溝通與聆聽','Communication'],['錯誤與回饋','Mistakes & feedback'],['自主學習','Self-directed learning'],
 ['自信與進步','Confidence'],['目標與標準','Goals & standards'],['理解與思考','Understanding'],
 ['關係與連結','Relationships'],['勇氣與行動','Courage'],['選擇與自由','Choice & autonomy'],
 ['責任與承諾','Responsibility'],['尊重與謙遜','Respect'],['情緒與挫折','Emotions'],
 ['學習與人生','Learning & life'],['文化與視野','Culture'],['方法與效率','Methods'],
 ['健康與平衡','Wellbeing'],['貢獻與成長','Contribution'],['反思中的信念 I','Beliefs to reflect on'],
 ['反思中的信念 II','Beliefs to reflect on']
];
const categoryFor = item => Math.min(VALUE_CATEGORIES.length-1, Math.floor((Number(item.id)-1)/10));
function openValues() {
 const selected=new Set(values(read()));
 let category='all',query='';
 const dialog=shell('True Values',`<div class="value-intro"><span class="value-intro-icon" aria-hidden="true">✦</span><div><strong>選擇屬於你的信念</strong><p>按主題探索，把認同的陳述放進右邊。</p></div></div><div class="true-value-search"><label>搜尋陳述<input type="search" data-search placeholder="搜尋中文或 English statements"></label><label>主題<select data-value-category><option value="all">全部主題 · All topics</option>${VALUE_CATEGORIES.map(([zh,en],i)=>`<option value="${i}">${esc(zh)} · ${esc(en)}</option>`).join('')}</select></label></div><div class="value-category-tabs" role="group" aria-label="True Values topics"></div><div data-value-split></div>`,'true-values-dialog');
 splitPane(dialog,'<div class="value-pane-head"><h3>可選陳述</h3><strong data-available-count>0</strong></div><div class="true-value-list" data-available></div>','<div class="value-pane-head"><h3>我認同的陳述</h3><strong data-selected-count>0</strong></div><div class="true-value-list" data-chosen></div>','True Values');
 const tabs=dialog.querySelector('.value-category-tabs');
 tabs.innerHTML=`<button type="button" data-topic="all">全部 <small>${TRUE_VALUE_STATEMENTS.length}</small></button>${VALUE_CATEGORIES.map(([zh],i)=>`<button type="button" data-topic="${i}">${esc(zh)} <small>10</small></button>`).join('')}`;
 const row=(item,chosen)=>`<button class="true-value-row ${chosen?'selected':''}" type="button" data-value-id="${esc(item.id)}" aria-pressed="${chosen}"><span class="value-check" aria-hidden="true">${chosen?'✓':''}</span><span class="value-row-copy"><span>${esc(item.zh)}</span><small>${esc(item.en)}</small></span><span class="value-row-action" aria-hidden="true">${chosen?'−':'＋'}</span></button>`;
 const draw=()=>{
  const match=item=>(category==='all'||categoryFor(item)===Number(category))&&(`${item.zh} ${item.en}`.toLocaleLowerCase().includes(query));
  const shown=TRUE_VALUE_STATEMENTS.filter(match),available=shown.filter(item=>!selected.has(item.id)),chosen=shown.filter(item=>selected.has(item.id));
  dialog.querySelector('[data-available]').innerHTML=available.map(item=>row(item,false)).join('')||'<p class="book-empty">這個主題沒有可選陳述。</p>';
  dialog.querySelector('[data-chosen]').innerHTML=chosen.map(item=>row(item,true)).join('')||'<p class="book-empty">這個主題尚未選擇陳述。</p>';
  dialog.querySelector('[data-available-count]').textContent=`${TRUE_VALUE_STATEMENTS.length-selected.size} 可選 · ${available.length} 顯示`;
  dialog.querySelector('[data-selected-count]').textContent=`${selected.size} 已選`;
  tabs.querySelectorAll('[data-topic]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.topic===category)));
 };
 dialog.querySelector('[data-search]').oninput=event=>{query=event.target.value.trim().toLocaleLowerCase();draw();};
 dialog.querySelector('[data-value-category]').onchange=event=>{category=event.target.value;draw();tabs.querySelector(`[data-topic="${category}"]`)?.scrollIntoView({block:'nearest',inline:'nearest'});};
 tabs.onclick=event=>{const button=event.target.closest('[data-topic]');if(!button)return;category=button.dataset.topic;dialog.querySelector('[data-value-category]').value=category;draw();};
 dialog.querySelector('[data-value-split]').onclick=event=>{
  const button=event.target.closest('[data-value-id]');if(!button)return;
  const id=button.dataset.valueId,wasSelected=selected.has(id),from=button.getBoundingClientRect();
  const ghost=button.cloneNode(true);ghost.classList.add('value-flight');ghost.style.cssText=`left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px`;document.body.append(ghost);
  wasSelected?selected.delete(id):selected.add(id);
  const state=read();state.values=[...selected];write(state);draw();
  const moved=dialog.querySelector(`[data-value-id="${id}"]`);moved?.classList.add('value-arrived');
  const to=moved?.getBoundingClientRect();if(to&&!matchMedia('(prefers-reduced-motion: reduce)').matches)ghost.animate([{transform:'translate(0,0) scale(1)',opacity:.85},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(.84)`,opacity:0}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'}).finished.finally(()=>ghost.remove());else ghost.remove();
 };
 draw();
}
function openHabits() {
 let list=habits(read()),first=null,sort='newest',dragSource=null;
 const dialog=shell('Habit Stacking',`<div class="habit-hero"><span aria-hidden="true">↗</span><div><strong>把好習慣串連起來</strong><p>點選兩邊的習慣，或拖動一項到另一項。拖動起點就是先做的習慣。</p></div></div><div class="habit-columns"><section><header><h3>My Current Habit</h3><strong data-current-count>0</strong></header><div data-current-list></div><button type="button" class="habit-add" data-add-current>＋ 新增現有習慣</button></section><section><header><h3>My Goal Habit</h3><strong data-goal-count>0</strong></header><div data-goal-list></div><button type="button" class="habit-add" data-add-goal>＋ 新增目標習慣</button></section><section><header><h3>Habit Pairing</h3><strong data-pair-count>0</strong></header><label class="habit-sort-label">依成功次數排序 <select data-pair-sort><option value="newest">最新配對</option><option value="desc">最多 → 最少</option><option value="asc">最少 → 最多</option></select></label><div data-pair-list></div></section></div>`,'habit-dialog');
 const pair=(source,target)=>{
  const a=list.find(x=>x.id===source),b=list.find(x=>x.id===target);
  if(!a||!b||a.kind===b.kind||a.kind==='pair'||b.kind==='pair')return;
  const current=a.kind==='current'?a:b,goal=a.kind==='goal'?a:b,order=a.kind==='current'?'current':'goal';
  if(!list.some(x=>x.kind==='pair'&&x.current===current.id&&x.goal===goal.id&&(x.first||'current')===order))list.push({id:crypto.randomUUID(),kind:'pair',current:current.id,goal:goal.id,first:order,count:0});
  first=null;draw();
 };
 const habitRow=x=>`<div class="habit-row" data-habit-id="${esc(x.id)}" draggable="true"><span class="habit-grip" aria-hidden="true">⋮⋮</span><button type="button" class="habit-select ${first===x.id?'selected':''}" data-select-habit="${esc(x.id)}">${esc(x.text)}</button><button type="button" data-edit-habit="${esc(x.id)}" aria-label="Edit ${esc(x.text)}">✎</button><button type="button" data-delete-habit="${esc(x.id)}" aria-label="Delete ${esc(x.text)}">×</button></div>`;
 const draw=()=>{
  const current=list.filter(x=>x.kind==='current'),goal=list.filter(x=>x.kind==='goal'),allPairs=list.filter(x=>x.kind==='pair');
  const pairs=[...allPairs];if(sort!=='newest')pairs.sort((a,b)=>sort==='desc'?(Number(b.count||0)-Number(a.count||0)):(Number(a.count||0)-Number(b.count||0)));
  dialog.querySelector('[data-current-list]').innerHTML=current.map(habitRow).join('')||'<p class="book-empty">加入你已經有的習慣。</p>';
  dialog.querySelector('[data-goal-list]').innerHTML=goal.map(habitRow).join('')||'<p class="book-empty">加入你想養成的習慣。</p>';
  dialog.querySelector('[data-pair-list]').innerHTML=pairs.map(x=>{const a=list.find(y=>y.id===x.current),b=list.find(y=>y.id===x.goal),firstHabit=x.first==='goal'?b:a,lastHabit=x.first==='goal'?a:b;return `<article class="habit-pair" data-pair-id="${esc(x.id)}"><div class="habit-pair-flow"><strong>${esc(firstHabit?.text||'')}</strong><span aria-hidden="true">→</span><strong>${esc(lastHabit?.text||'')}</strong></div><div class="habit-pair-actions"><button type="button" data-reverse-pair="${esc(x.id)}" aria-label="Reverse pairing order">⇄ <span>換次序</span></button><span class="habit-pair-count"><button type="button" data-decrease-pair="${esc(x.id)}" aria-label="Decrease success count">↓</button><output aria-label="Successful times">${Math.max(0,Number(x.count)||0)}</output><button type="button" data-increase-pair="${esc(x.id)}" aria-label="Increase success count">↑</button></span><button type="button" data-delete-habit="${esc(x.id)}" aria-label="Delete pairing">×</button></div></article>`}).join('')||'<p class="book-empty">把左右兩邊的習慣配在一起。</p>';
  dialog.querySelector('[data-current-count]').textContent=current.length;dialog.querySelector('[data-goal-count]').textContent=goal.length;dialog.querySelector('[data-pair-count]').textContent=allPairs.length;
  dialog.querySelector('[data-pair-sort]').value=sort;
  write({...read(),habits:list});
 };
 dialog.onclick=event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-select-habit')){const id=b.dataset.selectHabit,item=list.find(x=>x.id===id),previous=list.find(x=>x.id===first);if(previous&&previous.kind!==item?.kind)pair(previous.id,id);else{first=first===id?null:id;draw();}return;}
  if(b.hasAttribute('data-add-current')||b.hasAttribute('data-add-goal')){const kind=b.hasAttribute('data-add-current')?'current':'goal',text=prompt(kind==='current'?'My Current Habit':'My Goal Habit');if(text?.trim())list.push({id:crypto.randomUUID(),kind,text:text.trim()});draw();return;}
  const id=b.dataset.deleteHabit||b.dataset.editHabit||b.dataset.reversePair||b.dataset.increasePair||b.dataset.decreasePair,item=list.find(x=>x.id===id);if(!item)return;
  if(b.hasAttribute('data-delete-habit'))list=list.filter(x=>x.id!==id&&!(x.kind==='pair'&&(x.current===id||x.goal===id)));
  else if(b.hasAttribute('data-edit-habit')){const text=prompt('編輯習慣',item.text);if(text?.trim())item.text=text.trim();}
  else if(b.hasAttribute('data-reverse-pair'))item.first=item.first==='goal'?'current':'goal';
  else if(b.hasAttribute('data-increase-pair'))item.count=Math.max(0,Number(item.count)||0)+1;
  else if(b.hasAttribute('data-decrease-pair'))item.count=Math.max(0,(Number(item.count)||0)-1);
  draw();
 };
 dialog.querySelector('[data-pair-sort]').onchange=event=>{sort=event.target.value;draw();};
 dialog.addEventListener('dragstart',event=>{const row=event.target.closest('[data-habit-id]');if(!row)return;dragSource=row.dataset.habitId;event.dataTransfer.setData('text/plain',dragSource);event.dataTransfer.effectAllowed='link';row.classList.add('dragging');});
 dialog.addEventListener('dragend',()=>{dragSource=null;dialog.querySelectorAll('.dragging,.drop-ready').forEach(row=>row.classList.remove('dragging','drop-ready'));});
 dialog.addEventListener('dragover',event=>{const row=event.target.closest('[data-habit-id]');if(!row)return;const source=list.find(x=>x.id===dragSource);if(source&&source.kind!==list.find(x=>x.id===row.dataset.habitId)?.kind){event.preventDefault();row.classList.add('drop-ready');}});
 dialog.addEventListener('dragleave',event=>event.target.closest('[data-habit-id]')?.classList.remove('drop-ready'));
 dialog.addEventListener('drop',event=>{const row=event.target.closest('[data-habit-id]');if(!row)return;event.preventDefault();pair(event.dataTransfer.getData('text/plain'),row.dataset.habitId);});
 draw();
}
function openIfThen() {
 const data=read();let list=plans(data);
 const dialog=shell('If...Then...',`<div class="ifthen-list" data-ifthen-list></div><button type="button" data-add-plan>＋ 新增 If...Then...</button>`,'ifthen-dialog');
 const draw=()=>{dialog.querySelector('[data-ifthen-list]').innerHTML=list.map(plan=>`<article class="ifthen-row" data-plan="${plan.id}"><label>If<input data-field="if" value="${esc(plan.if)}" placeholder="If this happens..."></label><label class="then-field"><span>Then</span><input data-field="then" value="${esc(plan.then)}" placeholder="I will..."></label><button type="button" class="ifthen-count" data-count="${plan.id}" aria-label="Record one successful action">${Number(plan.count)||0}</button><button type="button" data-delete-plan="${plan.id}" aria-label="Delete">×</button></article>`).join('');write({...read(),plans:list});dialog.querySelectorAll('[data-field]').forEach(input=>input.oninput=()=>{const row=list.find(x=>x.id===input.closest('[data-plan]').dataset.plan);row[input.dataset.field]=input.value;write({...read(),plans:list});});dialog.querySelectorAll('[data-count]').forEach(button=>button.onclick=()=>{const row=list.find(x=>x.id===button.dataset.count);row.count=(Number(row.count)||0)+1;draw();});dialog.querySelectorAll('[data-delete-plan]').forEach(button=>button.onclick=()=>{list=list.filter(x=>x.id!==button.dataset.deletePlan);draw();});};
 dialog.querySelector('[data-add-plan]').onclick=()=>{list.push({id:crypto.randomUUID(),if:'',then:'',count:0});draw();};draw();
}
window.addEventListener('edmund-learning-books-loaded',event=>{const detail=event.detail||{};if(String(detail.studentId)!==identity())return;const local=read(),remote=detail.data||{values:[],habits:[],plans:[]},remoteTime=detail.updatedAt?Date.parse(detail.updatedAt):0;if(Number(local._savedAt||0)>remoteTime){write(local);return;}try{localStorage.setItem(KEY_PREFIX+identity(),JSON.stringify({...remote,_savedAt:remoteTime}));}catch{} });
window.addEventListener('online',()=>{const data=read();if(identity()!=='guest')announce('edmund-learning-books-save',{studentId:identity(),data});});
document.addEventListener('click',event=>{const book=event.target.closest('[data-purpose-book]');if(!book)return;if(book.dataset.purposeBook==='True Values')openValues();else if(book.dataset.purposeBook==='Habit Stacking')openHabits();else openIfThen();});

window.addEventListener('edmund-learning-books-saved',event=>{if(String(event.detail?.studentId)!==identity())return;const status=document.querySelector('[data-learning-purpose-status]');if(status)status.textContent='學習工具已自動儲存 · Changes saved to your account.';});
window.addEventListener('edmund-learning-books-save-failed',event=>{if(String(event.detail?.studentId)!==identity())return;const status=document.querySelector('[data-learning-purpose-status]');if(status)status.textContent='已保留在此裝置，稍後會重試同步 · Saved on this device; sync will retry.';});
