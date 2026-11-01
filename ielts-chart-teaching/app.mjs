import {installVocabulary} from './vocabulary.mjs?v=20261031-6';
import {data,palette,title,format,calculate} from './data.mjs';
import {reconstructions} from './reconstructions.mjs';
import {renderReconstruction} from './reconstruction-renderer.mjs';
const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imageUrl=path=>/^https?:\/\//i.test(path)?path:`/${String(path).replace(/^\/+/, '')}`;
const electricityKey='edmund-chart-studio-electricity-v1:'+window.chartStudentId;
let key=electricityKey, catalog=[], currentQuestion={id:'T1-005',type:'Bar Charts',title:'Electricity'}, pins=[], pendingPoint=null;
const tenseChoices={'past':'Past tense','present':'Present tense','future':'Future tense','present-perfect':'Present perfect','past-perfect':'Past perfect'};
let tenses={},tenseYear=null,yearOpener=null;
let notes={observation:[''],overview:['']};
let organization=[];
let mode='colour',active='green',marks={},names=Object.fromEntries(palette.map(p=>[p.id,p.name])),history=[],operands=[],operators=[],manualId=0,toastTimer;
const numbers=new Map();let imageFitOverride=null;
function applyImageFit(){const fit=imageFitOverride??matchMedia('(max-width:600px)').matches;$('#chart').classList.toggle('image-fit',fit);$('#image-fit').setAttribute('aria-pressed',String(fit));$('#image-fit').textContent=fit?'放大閱讀':'縮至全圖';}
function loadState(){
 marks={};names=Object.fromEntries(palette.map(p=>[p.id,p.name]));tenses={};notes={observation:[''],overview:['']};organization=[];pins=[];history=[];operands=[];operators=[];manualId=0;
 try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&typeof saved==='object'){
  for(const [id,group] of Object.entries(saved.marks||{})){const members=[...new Set(Array.isArray(group)?group:[group])].filter(g=>palette.some(p=>p.id===g));if(members.length)marks[id]=members;}
  if(Array.isArray(saved.organization))organization=[...new Set(saved.organization.filter(id=>typeof id==='string'))];
  for(const type of ['observation','overview'])if(Array.isArray(saved.notes?.[type]))notes[type]=saved.notes[type].filter(value=>typeof value==='string');
  for(const [year,tense] of Object.entries(saved.tenses||{}))if(/^\d{4}$/.test(year)&&Object.hasOwn(tenseChoices,tense))tenses[year]=tense;
  for(const p of palette)if(typeof saved.names?.[p.id]==='string')names[p.id]=saved.names[p.id].slice(0,40);
  if(Array.isArray(saved.pins))pins=saved.pins.filter(pin=>pin&&typeof pin.id==='string'&&typeof pin.label==='string'&&Number.isFinite(pin.x)&&Number.isFinite(pin.y)&&pin.x>=0&&pin.x<=100&&pin.y>=0&&pin.y<=100).slice(0,250).map(pin=>({...pin,label:pin.label.slice(0,100),value:pin.value===null?null:Number.isFinite(pin.value)?pin.value:null}));
 }}catch{}
}
function save(){try{localStorage.setItem(key,JSON.stringify({marks,names,tenses,notes,organization,pins}));$('#storage-status').textContent='標記與筆記儲存在此瀏覽器';}catch{$('#storage-status').textContent='此瀏覽器未能儲存；本次標記仍可使用';}}
function notice(text){$('#toast').textContent=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('#toast').textContent='';},2300);}
function markButton(id,text,cls='',extra=''){return `<button type="button" class="markable ${cls}" data-mark="${id}" aria-pressed="false" ${extra}>${text}</button>`;}
function resizeNote(input){input.style.height='auto';input.style.height=Math.max(82,input.scrollHeight)+'px';}
function renderNotes(type,focusIndex=null){
 const label=type==='observation'?'觀察':'概述';
 $(`#${type}-rows`).innerHTML=notes[type].map((text,index)=>`<div class="note-row"><div class="note-row-heading"><label for="${type}-${index}">${label} ${String(index+1).padStart(2,'0')}</label><button type="button" data-remove-note="${type}" data-note-index="${index}" aria-label="刪除${label} ${index+1}">−</button></div><textarea id="${type}-${index}" data-note-type="${type}" data-note-index="${index}" rows="3" placeholder="${type==='observation'?'寫下一個你看到的模式…':'寫下一個整體概述…'}">${esc(text)}</textarea></div>`).join('')||`<p class="notes-empty">按下方按鈕新增${label}。</p>`;
 document.querySelectorAll(`[data-note-type="${type}"]`).forEach(resizeNote);
 if(focusIndex!==null)$(`#${type}-${focusIndex}`)?.focus({preventScroll:true});
}
function yearButton(year){return `<button type="button" class="markable year-button" data-mark="year-${year}" data-year="${year}" aria-haspopup="dialog" aria-label="為 ${year} 選擇時態">${year}</button>`;}
function renderPrompt(prompt){
 const parts=String(prompt).split(/\b((?:19|20)\d{2})\b/g);
 return `<h2>${parts.map((part,index)=>index%2?yearButton(part):part?`<span role="button" tabindex="0" class="markable title-fragment" data-mark="title-${index}" aria-pressed="false">${esc(part)}</span>`:'').join('')}</h2>`;
}
function renderPins(){
 numbers.clear();
 const layer=$('#pin-layer'),list=$('#point-list');if(!layer||!list)return;
 layer.innerHTML=pins.map((pin,index)=>`<button type="button" class="markable image-pin" data-mark="point-${esc(pin.id)}" data-number="${esc(pin.id)}" style="left:${pin.x}%;top:${pin.y}%" aria-label="${esc(pin.label)}${Number.isFinite(pin.value)?' · '+format(pin.value):''}" title="${esc(pin.label)}">${index+1}</button>`).join('');
 list.innerHTML=pins.length?pins.map((pin,index)=>`<div class="point-row"><button type="button" class="markable" data-mark="point-${esc(pin.id)}" data-number="${esc(pin.id)}">${index+1}. ${esc(pin.label)}${Number.isFinite(pin.value)?' · '+format(pin.value):''}</button><button type="button" data-edit-point="${esc(pin.id)}" aria-label="編輯 ${esc(pin.label)}">編輯</button><button type="button" data-delete-point="${esc(pin.id)}" aria-label="刪除 ${esc(pin.label)}">×</button></div>`).join(''):'<p class="point-empty">點擊圖上的任何位置開始標記。</p>';
 for(const pin of pins)numbers.set(pin.id,{id:pin.id,label:pin.label,value:pin.value});
 applyMarks();
}
function buildChart(){
 numbers.clear();
 const reconstruction=reconstructions[currentQuestion.id];
 if(reconstruction){
  $('#chart-title').innerHTML=renderPrompt(currentQuestion.quizPrompt||currentQuestion.prompt);
  $('#chart').dataset.view='reconstruction';
  $('#chart').innerHTML=renderReconstruction(reconstruction,numbers,esc,format);
  $('#image-points').hidden=true;$('#image-view-controls').hidden=true;return;
 }
 if(currentQuestion.id!=='T1-005')throw new Error(`Missing interactive reconstruction for ${currentQuestion.id}`);
 $('#image-points').hidden=true;$('#image-view-controls').hidden=true;$('#chart').dataset.view='electricity';
 $('#chart-title').innerHTML=`<h2><span role="button" tabindex="0" class="markable title-fragment" data-mark="title" aria-pressed="false">${esc(title.replace('2014.',''))}</span> ${yearButton('2014')}.</h2>`;
 $('#chart').innerHTML=`<div class="chart-column-head">${markButton('rank-heading','Rank')}${markButton('country-heading','Country')}<div class="electricity-heading">${markButton('chart-heading','Electricity')} · ${yearButton('2014')}</div></div>`+data.map(([country,production,consumption],i)=>{
  const series=[production,consumption].map((value,j)=>{
   const type=j?'consumption':'production',id=`${i}-${type}`,label=`${country} · ${j?'Consumption':'Production'}`;numbers.set(id,{id,value,label});
   const width=value/6000*100;
   return `<div class="series" style="--width:${width}%"><button type="button" class="bar ${type}" style="width:${width}%" data-mark="bar-${id}" data-number="${id}" aria-label="${esc(label)} ${format(value)} billion kWh" aria-pressed="false"></button>${markButton(`value-${id}`,format(value),'value',`data-number="${id}" aria-label="${esc(label)} ${format(value)} billion kWh"`)}</div>`;
  }).join('');
  return `<div class="chart-row">${markButton(`rank-${i}`,i+1,'rank')}${markButton(`country-${i}`,esc(country),'country')}<div class="plot">${series}</div></div>`;
 }).join('')+`<div class="axis"><span></span><div class="axis-values">${[0,2000,4000,6000].map(n=>markButton(`axis-${n}`,format(n))).join('')}</div></div><div class="chart-legend">${markButton('legend-production','<i class="legend-square"></i> Production (billion kWh)')}${markButton('legend-consumption','<i class="legend-square consumption"></i> Consumption (billion kWh)')}</div>`;
 // Only retain marks for components in this chart.
 const allowed=new Set([...document.querySelectorAll('[data-mark]')].map(el=>el.dataset.mark));marks=Object.fromEntries(Object.entries(marks).filter(([id])=>allowed.has(id)));
}
function groups(){
 $('#groups').innerHTML=palette.map(p=>`<div class="group-row ${active===p.id?'active':''}" style="--colour:${p.color};--tint:${p.tint}"><button type="button" class="swatch" data-group="${p.id}" aria-pressed="${active===p.id}" aria-label="選取${esc(names[p.id])}"></button><input data-name="${p.id}" aria-label="${esc(p.name)}名稱" maxlength="40" value="${esc(names[p.id])}"><span class="group-count">${Object.values(marks).filter(members=>members.includes(p.id)).length} 項</span></div>`).join('');
 $('#eraser').setAttribute('aria-pressed',String(active==='eraser'));$('#undo').disabled=!history.length;
}
function applyMarks(){
 document.querySelectorAll('[data-mark]').forEach(el=>{
  const members=(marks[el.dataset.mark]||[]).map(id=>palette.find(p=>p.id===id)).filter(Boolean);const p=members[0];el.classList.toggle('coloured',!!p);
  el.classList.toggle('multi-group',members.length>1);
  el.style.setProperty('--group-glow',members.slice(1).map((group,i)=>`0 0 0 ${2+i*2}px ${group.color}, 0 0 ${9+i*3}px ${1+i}px ${group.color}99`).join(','));
  el.style.setProperty('--colour',p?.color||'');el.style.setProperty('--tint',p?.tint||'');
  const selected=operands.some(item=>item.id===el.dataset.number);
  el.classList.toggle('organized-data',mode==='organize'&&organization.includes(el.dataset.number));
  el.classList.toggle('selected-number',selected&&(el.classList.contains('value')||el.classList.contains('recon-point')||el.classList.contains('recon-vertical-value')||el.classList.contains('recon-horizontal-value')||el.classList.contains('recon-pie-value')||el.classList.contains('recon-pie-slice')||el.classList.contains('recon-table-cell')||el.classList.contains('recon-flow-detail-part')||el.classList.contains('recon-map-feature'))&&mode!=='organize');el.classList.toggle('selected-bar',selected&&(el.classList.contains('bar')||el.classList.contains('recon-vertical-bar')||el.classList.contains('recon-horizontal-bar'))&&mode!=='organize');
  el.setAttribute('aria-pressed',String(mode==='organize'&&el.dataset.number?organization.includes(el.dataset.number):mode==='calculate'&&el.dataset.number?selected:!!p||!!tenses[el.dataset.year]));
  if(el.dataset.year){const tense=tenses[el.dataset.year];el.classList.toggle('year-assigned',!!tense);el.innerHTML=esc(el.dataset.year)+(tense?`<span class="tense-badge">${esc(tenseChoices[tense])}</span>`:'');el.setAttribute('aria-label',`${el.dataset.year}${tense?' · '+tenseChoices[tense]:''}，選擇時態`);}
  el.title=members.length?`群組：${members.map(group=>names[group.id]).join('、')}`:'';
  if(members.length)el.setAttribute('aria-description',el.title);else el.removeAttribute('aria-description');
 });
}
function setMode(next){mode=next;$('#pick-data-mode').setAttribute('aria-pressed',String(mode==='organize'));$('#pick-data-mode').textContent=mode==='organize'?'✓ Pick data mode · 開啟中':'◉ Pick data mode';document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));$('#mode-hint').textContent=mode==='colour'?'第一組填色，第二組加上光暈；再點同色只移除該組。點年份可選時態。':mode==='organize'?'點擊圖表數據、步驟或位置加入 Organization，再拖動卡片安排順序。再次點擊可移除。':'點擊圖表中的數值加入計算；再次點擊移除。金色外框表示已選數值。';applyMarks();}
function renderOrganization(focusId=null){
 organization=organization.filter(id=>numbers.has(id));
 $('#organization-list').innerHTML=organization.length?organization.map((id,index)=>{const item=numbers.get(id);return `<li class="organization-item" data-org-id="${id}" draggable="true"><div class="org-order"><button type="button" class="org-drag" data-drag-org="${id}" aria-label="拖動 ${esc(item.label)}">⠿</button><span>${String(index+1).padStart(2,'0')}</span></div><div class="org-copy"><small>${esc(item.label)}</small><strong>${Number.isFinite(item.value)?format(item.value):'位置 / 步驟'} ${currentQuestion.id==='T1-005'?'<em>billion kWh</em>':reconstructions[currentQuestion.id]?.unit?`<em>${esc(reconstructions[currentQuestion.id].unit)}</em>`:''}</strong></div><div class="org-actions"><button type="button" data-move-org="${id}" data-direction="-1" aria-label="上移 ${esc(item.label)}" ${index===0?'disabled':''}>↑</button><button type="button" data-move-org="${id}" data-direction="1" aria-label="下移 ${esc(item.label)}" ${index===organization.length-1?'disabled':''}>↓</button><button type="button" data-remove-org="${id}" aria-label="移除 ${esc(item.label)}">×</button></div></li>`;}).join(''):'<li class="organization-empty">開啟 Pick data mode，點選想用於段落的數據。</li>';
 if(focusId)document.querySelector(`[data-drag-org="${focusId}"]`)?.focus({preventScroll:true});
 applyMarks();
}
function moveOrganization(id,target){const from=organization.indexOf(id);if(from<0||target<0||target>=organization.length)return;organization.splice(from,1);organization.splice(target,0,id);renderOrganization(id);save();}
function remember(){history.push({marks:{...marks},tenses:{...tenses}});if(history.length>50)history.shift();}
function refreshMarks(){applyMarks();groups();save();}
function removeOperand(index){operands.splice(index,1);if(index===0)operators.shift();else operators.splice(index-1,1);renderCalculator();}
const symbol={'+':'+','-':'−','*':'×','/':'÷'};
function renderCalculator(){
 $('#operands').innerHTML=operands.length?operands.map((item,i)=>`${i?`<div class="operator-row"><select data-operator="${i-1}" aria-label="第 ${i} 個運算">${Object.entries(symbol).map(([v,label])=>`<option value="${v}" ${operators[i-1]===v?'selected':''}>${label}</option>`).join('')}</select></div>`:''}<div class="operand"><small>${i+1}. ${esc(item.label)}</small><strong>${format(item.value)}</strong><button type="button" data-remove="${i}" aria-label="移除 ${esc(item.label)}">×</button></div>`).join(''):'<div class="empty">點選圖表數字，加入這裡</div>';
 let expression=operands.length?format(operands[0].value):'選取數字開始比較';
 for(let i=1;i<operands.length;i++)expression=`(${expression} ${symbol[operators[i-1]]} ${format(operands[i].value)})`;
 $('#expression').textContent=expression;
 const result=calculate(operands.map(o=>o.value),operators);$('#result').textContent=result.error?'—':format(result.value);$('#result-note').textContent=operands.length>=2&&result.error?result.error:'依選取順序，由左至右計算';applyMarks();
}
document.addEventListener('click',event=>{
 const button=event.target.closest('button,[role=button]');if(!button)return;
 if(button.id==='pick-data-mode'){setMode(mode==='organize'?'colour':'organize');return;}
 if(button.id==='clear-organization'){organization=[];renderOrganization();save();return;}
 if(button.dataset.moveOrg){moveOrganization(button.dataset.moveOrg,organization.indexOf(button.dataset.moveOrg)+Number(button.dataset.direction));return;}
 if(button.dataset.removeOrg){organization=organization.filter(id=>id!==button.dataset.removeOrg);renderOrganization();save();return;}
 if(button.dataset.addNote){const type=button.dataset.addNote;notes[type].push('');renderNotes(type,notes[type].length-1);save();return;}
 if(button.dataset.removeNote){const type=button.dataset.removeNote,index=Number(button.dataset.noteIndex);notes[type].splice(index,1);renderNotes(type,Math.min(index,notes[type].length-1));save();if(!notes[type].length)document.querySelector(`[data-add-note="${type}"]`).focus({preventScroll:true});return;}
 if(button.dataset.mode){setMode(button.dataset.mode);return;}
 if(button.dataset.group){active=button.dataset.group;setMode('colour');groups();return;}
 if(button.id==='eraser'){active=active==='eraser'?'green':'eraser';setMode('colour');groups();return;}
 if(button.id==='undo'){if(history.length){const previous=history.pop();marks=previous.marks;tenses=previous.tenses;refreshMarks();}return;}
 if(button.id==='clear-colours'){if(Object.keys(marks).length||Object.keys(tenses).length){remember();marks={};tenses={};refreshMarks();notice('標記已清除，可按撤銷恢復');}return;}
 if(button.id==='clear-calculator'){operands=[];operators=[];renderCalculator();return;}
 if(button.hasAttribute('data-remove')){removeOperand(Number(button.dataset.remove));return;}
 if(button.dataset.year){
  if(active==='eraser'&&mode==='colour'){remember();delete marks[button.dataset.mark];delete tenses[button.dataset.year];refreshMarks();return;}
  tenseYear=button.dataset.year;yearOpener=button;
  $('#tense-year').textContent=tenseYear;
  document.querySelectorAll('[data-tense]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tense===tenses[tenseYear])));
  $('#tense-dialog').showModal();return;
 }
 if(button.dataset.tense&&tenseYear){remember();tenses[tenseYear]=button.dataset.tense;if(active!=='eraser')marks[`year-${tenseYear}`]=[...new Set([...(marks[`year-${tenseYear}`]||[]),active])];refreshMarks();$('#tense-dialog').close();return;}
 if(button.id==='remove-tense'&&tenseYear){remember();delete tenses[tenseYear];refreshMarks();$('#tense-dialog').close();return;}
 if(button.id==='close-tense'){$('#tense-dialog').close();return;}
 if(button.dataset.editPoint){const pin=pins.find(item=>item.id===button.dataset.editPoint);if(pin)showPointDialog({...pin,editId:pin.id});return;}
 if(button.dataset.deletePoint){const id=button.dataset.deletePoint;pins=pins.filter(pin=>pin.id!==id);delete marks[`point-${id}`];organization=organization.filter(item=>item!==id);operands=operands.filter(item=>item.id!==id);renderPins();renderOrganization();renderCalculator();groups();save();return;}
 if(!button.dataset.mark)return;
 if(mode==='organize'){const id=button.dataset.number;if(!numbers.has(id)){notice('請點擊長條或其旁邊的數字');return;}organization=organization.includes(id)?organization.filter(item=>item!==id):[...organization,id];renderOrganization();save();return;}
 if(mode==='calculate'){
  const number=numbers.get(button.dataset.number);if(!number||!Number.isFinite(number.value)){notice('請先為這個標記填寫數值');return;}
  const index=operands.findIndex(item=>item.id===number.id);if(index>=0)removeOperand(index);else{if(operands.length)operators.push('+');operands.push(number);renderCalculator();}return;
 }
 remember();const id=button.dataset.mark;if(active==='eraser')delete marks[id];else{const current=marks[id]||[];const next=current.includes(active)?current.filter(group=>group!==active):[...current,active];if(next.length)marks[id]=next;else delete marks[id];}refreshMarks();
});
document.addEventListener('input',event=>{if(event.target.dataset.noteType){notes[event.target.dataset.noteType][Number(event.target.dataset.noteIndex)]=event.target.value;resizeNote(event.target);save();return;}if(event.target.dataset.name){names[event.target.dataset.name]=event.target.value;save();applyMarks();}});
document.addEventListener('change',event=>{if(event.target.hasAttribute('data-operator')){operators[Number(event.target.dataset.operator)]=event.target.value;renderCalculator();}});
$('#manual-form').addEventListener('submit',event=>{event.preventDefault();const input=$('#manual-number');const value=Number(input.value);if(!input.value.trim()||!Number.isFinite(value)){notice('請輸入有效數字');return;}if(operands.length)operators.push('+');operands.push({id:`manual-${++manualId}`,label:'自訂數字',value});input.value='';renderCalculator();});
document.addEventListener('keydown',event=>{if(event.target.matches('[role=button][data-mark]')&&(event.key==='Enter'||event.key===' ')){event.preventDefault();event.target.click();}});
$('#tense-dialog').addEventListener('close',()=>{yearOpener?.focus({preventScroll:true});tenseYear=null;});
const orgList=$('#organization-list');let dragId=null,touchDrag=null;
orgList.addEventListener('dragstart',event=>{const item=event.target.closest('[data-org-id]');if(!item)return;dragId=item.dataset.orgId;event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',dragId);item.classList.add('dragging');});
orgList.addEventListener('dragover',event=>{if(dragId){event.preventDefault();event.dataTransfer.dropEffect='move';const item=event.target.closest('[data-org-id]');orgList.querySelectorAll('.drop-target').forEach(el=>el.classList.remove('drop-target'));item?.classList.add('drop-target');}});
orgList.addEventListener('drop',event=>{event.preventDefault();const item=event.target.closest('[data-org-id]');if(item&&dragId)moveOrganization(dragId,organization.indexOf(item.dataset.orgId));dragId=null;orgList.querySelectorAll('.drop-target,.dragging').forEach(el=>el.classList.remove('drop-target','dragging'));});
orgList.addEventListener('dragend',()=>{dragId=null;orgList.querySelectorAll('.drop-target,.dragging').forEach(el=>el.classList.remove('drop-target','dragging'));});
orgList.addEventListener('pointerdown',event=>{const handle=event.target.closest('[data-drag-org]');if(!handle||event.pointerType==='mouse')return;touchDrag={id:handle.dataset.dragOrg,pointer:event.pointerId};handle.setPointerCapture(event.pointerId);});
orgList.addEventListener('pointermove',event=>{if(!touchDrag||event.pointerId!==touchDrag.pointer)return;const item=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-org-id]');orgList.querySelectorAll('.drop-target').forEach(el=>el.classList.remove('drop-target'));if(item){touchDrag.target=item.dataset.orgId;item.classList.add('drop-target');}});
orgList.addEventListener('pointerup',()=>{if(touchDrag?.target)moveOrganization(touchDrag.id,organization.indexOf(touchDrag.target));touchDrag=null;orgList.querySelectorAll('.drop-target').forEach(el=>el.classList.remove('drop-target'));});
orgList.addEventListener('pointercancel',()=>{touchDrag=null;orgList.querySelectorAll('.drop-target').forEach(el=>el.classList.remove('drop-target'));});
window.addEventListener('chart-vocabulary-insert',event=>{const {target,text}=event.detail||{};if(!['observation','overview'].includes(target)||typeof text!=='string')return;const blank=notes[target].findIndex(row=>!row.trim());if(blank>=0)notes[target][blank]=text;else notes[target].push(text);renderNotes(target);save();notice('已加入 '+(target==='overview'?'Overview':'Observation'));});
installVocabulary();
function showPointDialog(point){pendingPoint=point;$('#point-form').reset();$('#point-title').textContent=point.editId?'編輯題圖標記':'標記題圖數據';$('#point-label').value=point.label||'';$('#point-value').value=Number.isFinite(point.value)?point.value:'';$('#point-x').value=point.x.toFixed(1);$('#point-y').value=point.y.toFixed(1);$('#point-dialog').showModal();$('#point-label').focus();}
function openPointDialog(event){
 if(currentQuestion.id==='T1-005'||!event.target.matches('.source-chart-image'))return;
 const rect=event.target.getBoundingClientRect();showPointDialog({x:Math.max(0,Math.min(100,(event.clientX-rect.left)/rect.width*100)),y:Math.max(0,Math.min(100,(event.clientY-rect.top)/rect.height*100))});
}
$('#chart').addEventListener('click',openPointDialog);
$('#image-fit').addEventListener('click',()=>{imageFitOverride=!$('#chart').classList.contains('image-fit');applyImageFit();});
window.addEventListener('resize',()=>{if(currentQuestion.id!=='T1-005'&&imageFitOverride===null)applyImageFit();});
$('#add-point').addEventListener('click',()=>showPointDialog({x:50,y:50}));
$('#cancel-point').addEventListener('click',()=>$('#point-dialog').close());
$('#point-form').addEventListener('submit',event=>{
 event.preventDefault();if(!pendingPoint)return;
 const label=$('#point-label').value.trim(),raw=$('#point-value').value.trim();if(!label)return;
 const x=Number($('#point-x').value),y=Number($('#point-y').value);if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>100||y<0||y>100)return;
 const pin={id:pendingPoint.editId||`pin-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,label,x,y,value:raw?Number(raw):null};
 if(pendingPoint.editId){pins=pins.map(item=>item.id===pin.id?pin:item);operands=operands.map(item=>item.id===pin.id?{...item,label,value:pin.value}:item).filter(item=>Number.isFinite(item.value));}
 else{pins.push(pin);if(mode==='colour'&&active!=='eraser')marks[`point-${pin.id}`]=[active];if(mode==='organize')organization.push(pin.id);}
 $('#point-dialog').close();pendingPoint=null;renderPins();groups();renderOrganization();renderCalculator();save();
});
function selectQuestion(id,updateHash=false){
 const question=catalog.find(item=>item.id===id)||catalog.find(item=>item.id==='T1-005');if(!question)return;
 currentQuestion=question;key=question.id==='T1-005'?electricityKey:`edmund-chart-studio-task1-v1:${window.chartStudentId}:${question.id}`;loadState();
 $('#chart-selector').value=question.id;const index=catalog.indexOf(question);$('#chart-position').textContent=`${index+1} / ${catalog.length}`;
 $('#previous-chart').disabled=index===0;$('#next-chart').disabled=index===catalog.length-1;
 $('#lesson-chip').innerHTML=`<i></i> ${String(index+1).padStart(2,'0')} / ${catalog.length} · ${esc(question.type)}`;
 $('#question-id').textContent=`TASK 1 · ${question.id} · ${question.type}`;
 $('#chart-source').textContent=question.id==='T1-005'?'重製自提供圖表 · 單位：billion kWh':'依 IELTS Writing Task 1 題圖重製的互動圖表';
 buildChart();groups();setMode('colour');renderCalculator();renderNotes('observation');renderNotes('overview');renderOrganization();
 if(updateHash)window.history.replaceState(null,'',`#${question.id}`);
}
async function initCatalog(){
 try{const response=await fetch('/ielts-writing-preview/task1-diagrams.json?v=20261030-3');if(!response.ok)throw Error('Catalogue unavailable');catalog=await response.json();}
 catch{catalog=[{id:'T1-005',type:'Bar Charts',title:'Electricity',prompt:title,quizPrompt:title}];notice('題圖目錄暫時無法載入');}
 const selector=$('#chart-selector');let type='';let group;
 for(const question of catalog){if(question.type!==type){type=question.type;group=document.createElement('optgroup');group.label=type;selector.append(group);}const option=document.createElement('option');option.value=question.id;option.textContent=`${question.id} · ${question.prompt}`;group.append(option);}
 selectQuestion(location.hash.slice(1).match(/^T1-\d{3}$/)?.[0]||'T1-005');
 selector.addEventListener('change',()=>selectQuestion(selector.value,true));
 $('#previous-chart').addEventListener('click',()=>selectQuestion(catalog[Math.max(0,catalog.findIndex(item=>item.id===currentQuestion.id)-1)].id,true));
 $('#next-chart').addEventListener('click',()=>selectQuestion(catalog[Math.min(catalog.length-1,catalog.findIndex(item=>item.id===currentQuestion.id)+1)].id,true));
 window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(id!==currentQuestion.id&&catalog.some(item=>item.id===id))selectQuestion(id);});
}
await initCatalog();
