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
function openValues() {
 const data=read();let selected=new Set(values(data));
 const dialog=shell('True Values','<div class="true-value-search"><label>搜尋陳述<input type="search" data-search placeholder="搜尋 statements"></label></div><div data-value-split></div>','true-values-dialog');
 const draw=()=>{const available=TRUE_VALUE_STATEMENTS.filter(item=>!selected.has(item.id));const chosen=TRUE_VALUE_STATEMENTS.filter(item=>selected.has(item.id));
  splitPane(dialog,`<h3>所有陳述</h3><div class="true-value-list" data-available>${available.length?available.map(item=>`<button class="true-value-row" type="button" data-value-add="${esc(item.id)}"><span>${esc(item.zh)}<small>(${esc(item.en)})</small></span><span class="value-check"></span></button>`).join(''):'<p class="book-empty">目前沒有可顯示的陳述。</p>'}</div>`,`<h3>我認同的陳述</h3><div class="true-value-list">${chosen.map(item=>`<button class="true-value-row selected" type="button" data-value-remove="${esc(item.id)}"><span class="value-check">✓</span><span>${esc(item.zh)}<small>(${esc(item.en)})</small></span></button>`).join('')||'<p class="book-empty">勾選左側陳述後會顯示在這裏。</p>'}</div>`,'True Values');
  dialog.querySelector('[data-search]').oninput=e=>dialog.querySelectorAll('[data-value-add]').forEach(row=>row.hidden=!row.textContent.toLocaleLowerCase().includes(e.target.value.toLocaleLowerCase()));
  dialog.querySelectorAll('[data-value-add]').forEach(button=>button.onclick=()=>{selected.add(button.dataset.valueAdd);const state=read();state.values=[...selected];write(state);draw();});
  dialog.querySelectorAll('[data-value-remove]').forEach(button=>button.onclick=()=>{selected.delete(button.dataset.valueRemove);const state=read();state.values=[...selected];write(state);draw();});
 };
 draw();
}
function openHabits() {
 const data=read();let list=habits(data);
 const dialog=shell('Habit Stacking',`<div class="habit-columns"><section><h3>My Current Habit</h3><div data-current-list></div><button type="button" data-add-current>＋ 新增</button></section><section><h3>My Goal Habit</h3><div data-goal-list></div><button type="button" data-add-goal>＋ 新增</button></section><section><h3>Habit Pairing</h3><p class="book-help">先選一項現有習慣，再選一項目標習慣並配對。</p><div data-pair-list></div></section></div>`,'habit-dialog');
 const draw=()=>{dialog.querySelector('[data-current-list]').innerHTML=list.filter(x=>x.kind==='current').map(x=>`<div class="habit-row"><button type="button" class="habit-select ${x.id===dialog.current?'selected':''}" data-select-habit="${x.id}">${esc(x.text)}</button><button type="button" data-edit-habit="${x.id}" aria-label="Edit">✎</button><button type="button" data-delete-habit="${x.id}" aria-label="Delete">×</button></div>`).join('');dialog.querySelector('[data-goal-list]').innerHTML=list.filter(x=>x.kind==='goal').map(x=>`<div class="habit-row"><button type="button" class="habit-select ${x.id===dialog.goal?'selected':''}" data-select-habit="${x.id}">${esc(x.text)}</button><button type="button" data-edit-habit="${x.id}" aria-label="Edit">✎</button><button type="button" data-delete-habit="${x.id}" aria-label="Delete">×</button></div>`).join('');dialog.querySelector('[data-pair-list]').innerHTML=list.filter(x=>x.kind==='pair').map(x=>`<div class="habit-pair"><span>${esc(list.find(y=>y.id===x.current)?.text||'')} → ${esc(list.find(y=>y.id===x.goal)?.text||'')}</span><button type="button" data-delete-habit="${x.id}" aria-label="Delete pairing">×</button></div>`).join('')||'<p class="book-empty">配對會顯示在這裏。</p>';write({...read(),habits:list});
  dialog.querySelectorAll('[data-select-habit]').forEach(b=>b.onclick=()=>{const item=list.find(x=>x.id===b.dataset.selectHabit);dialog[item.kind]=item.id;if(dialog.current&&dialog.goal){const exists=list.some(x=>x.kind==='pair'&&x.current===dialog.current&&x.goal===dialog.goal);if(!exists)list.push({id:crypto.randomUUID(),kind:'pair',current:dialog.current,goal:dialog.goal});dialog.current=dialog.goal='';}draw();});
  dialog.querySelectorAll('[data-delete-habit]').forEach(b=>b.onclick=()=>{const removed=list.find(x=>x.id===b.dataset.deleteHabit);list=list.filter(x=>x.id!==b.dataset.deleteHabit&&!(x.kind==='pair'&&(x.current===removed?.id||x.goal===removed?.id)));draw();});
  dialog.querySelectorAll('[data-edit-habit]').forEach(b=>b.onclick=()=>{const item=list.find(x=>x.id===b.dataset.editHabit),text=prompt('編輯習慣',item.text);if(text?.trim())item.text=text.trim();draw();});
 };
 const add=kind=>{const text=prompt(kind==='current'?'My Current Habit':'My Goal Habit');if(text?.trim())list.push({id:crypto.randomUUID(),kind,text:text.trim()});draw();};
 dialog.querySelector('[data-add-current]').onclick=()=>add('current');dialog.querySelector('[data-add-goal]').onclick=()=>add('goal');draw();
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
