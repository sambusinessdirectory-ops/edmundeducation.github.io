const SECTIONS = [
 ['glossary','Glossary','主題詞彙',''],
 ['sentence','Sentence structure','句子結構','sentenceStructureParts'],
 ['grammar','Grammar','文法','grammarPoints'],
 ['literary','Literary devices','修辭技巧','rhetoricalParts'],
 ['phrasal','Phrasal verbs','動詞片語','phrasalVerbParts'],
 ['idioms','Idioms','慣用語','idiomParts'],
 ['proverbs','Proverbs','諺語','proverbParts'],
 ['common','Common expressions','常用語','writingCommonExpressionParts'],
 ['rhetorical','Rhetorical expressions','修辭常用語','rhetoricalCommonExpressionParts'],
 ['synonyms','Synonyms','同義詞','synonymImprovementParts']
];
const node=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls||'';if(text!==undefined)el.textContent=text;return el;};
let pocketMenuSerial=0;
export function mountReferencePocket({host,getOwner,getGlossary,getHistory,appendRich}) {
 if(!host)return {refresh(){},reset(){}};
 host.className='writing-reference-pocket glass-panel';
 const head=node('header','reference-pocket-head'), title=node('div');title.append(node('p','eyebrow','MY WRITING POCKET'),node('h2','','寫作參考袋'));
 const float=node('button','small-button','Float · 浮動');float.type='button';float.setAttribute('aria-pressed','false');head.append(title,float);
 const controls=node('div','reference-pocket-controls'),picker=node('div','reference-pocket-picker');
 const trigger=node('button','reference-pocket-trigger');trigger.type='button';trigger.setAttribute('aria-haspopup','menu');trigger.setAttribute('aria-expanded','false');
 const menu=node('div','reference-pocket-menu');menu.id=`reference-pocket-menu-${++pocketMenuSerial}`;menu.setAttribute('role','menu');menu.setAttribute('aria-label','Reference category · 參考類別');menu.hidden=true;trigger.setAttribute('aria-controls',menu.id);
 const triggerMark=node('span','reference-pocket-trigger-mark','✦'),triggerCopy=node('span','reference-pocket-trigger-copy');triggerMark.setAttribute('aria-hidden','true');
 const triggerHint=node('small','','WRITING REFERENCE · 寫作參考'),triggerName=node('strong'),triggerChevron=node('span','reference-pocket-trigger-chevron');triggerChevron.setAttribute('aria-hidden','true');const chevronSvg=document.createElementNS('http://www.w3.org/2000/svg','svg'),chevronPath=document.createElementNS('http://www.w3.org/2000/svg','path');chevronSvg.setAttribute('viewBox','0 0 16 16');chevronPath.setAttribute('d','M3 6l5 5 5-5');chevronSvg.append(chevronPath);triggerChevron.append(chevronSvg);triggerCopy.append(triggerHint,triggerName);trigger.append(triggerMark,triggerCopy,triggerChevron);picker.append(trigger,menu);
 const optionButtons=SECTIONS.map(([id,en,zh],index)=>{const option=node('button','reference-pocket-option');option.type='button';option.setAttribute('role','menuitemradio');option.setAttribute('aria-checked','false');option.tabIndex=-1;option.dataset.category=id;const copy=node('span','reference-pocket-option-copy'),number=node('span','reference-pocket-option-number',String(index+1).padStart(2,'0')),check=node('span','reference-pocket-option-check','✓');number.setAttribute('aria-hidden','true');check.setAttribute('aria-hidden','true');copy.append(node('strong','',en),node('small','',zh));option.append(number,copy,check);menu.append(option);return option;});
 const order=node('button','small-button','Earliest → latest · 最早優先');order.type='button';
 const refresh=node('button','small-button','Refresh · 更新');refresh.type='button';controls.append(picker,order,refresh);
 const content=node('div','reference-pocket-content');content.tabIndex=0;content.setAttribute('aria-label','Writing reference items');
 const status=node('p','reference-pocket-status');status.setAttribute('role','status');host.append(head,controls,status,content);
 let sequence=0,owner='',history=null,historyPromise=null,reverse=false,floating=false,category='glossary';
 function syncPicker(){const index=SECTIONS.findIndex(section=>section[0]===category),section=SECTIONS[index];triggerName.textContent=`${section[1]} · ${section[2]}`;trigger.setAttribute('aria-label',`Reference category · 參考類別: ${section[1]} · ${section[2]}`);triggerMark.textContent=String(index+1).padStart(2,'0');optionButtons.forEach((option,i)=>{option.setAttribute('aria-checked',String(i===index));option.classList.toggle('is-selected',i===index);});}
 function closeMenu(restoreFocus=false){if(menu.hidden)return;menu.hidden=true;picker.classList.remove('is-open','opens-up');trigger.setAttribute('aria-expanded','false');if(restoreFocus)trigger.focus();}
 function openMenu(index=SECTIONS.findIndex(section=>section[0]===category)){const rect=trigger.getBoundingClientRect(),below=window.innerHeight-rect.bottom-12,above=rect.top-12,up=below<Math.min(420,window.innerHeight*.45)&&above>below;picker.classList.toggle('opens-up',up);menu.style.maxHeight=`${Math.max(150,Math.min(440,up?above:below))}px`;menu.hidden=false;picker.classList.add('is-open');trigger.setAttribute('aria-expanded','true');optionButtons[index].focus();optionButtons[index].scrollIntoView({block:'nearest'});}
 function selectCategory(index){category=SECTIONS[index][0];syncPicker();closeMenu(true);render();}
 syncPicker();
 function reset(){sequence++;owner='';history=null;historyPromise=null;category='glossary';closeMenu();syncPicker();content.replaceChildren();status.textContent='';if(floating)toggleFloat();}
 async function render(force=false){
  const account=getOwner();if(!account){reset();return;}
  if(owner!==account){reset();owner=account;}
  const ticket=++sequence;const current=()=>ticket===sequence&&getOwner()===account;
  order.hidden=category==='glossary';status.textContent='Loading · 正在載入…';content.replaceChildren();
  try{
   if(category==='glossary'){
    const vocabulary=await getGlossary();if(!current())return;
    for(const row of vocabulary){const card=node('article','reference-vocabulary');card.append(node('strong','',row.english),node('span','',row.chinese));content.append(card);}
    status.textContent=vocabulary.length?`${vocabulary.length} words · 詞彙`:'此題暫無主題詞彙 · No glossary available for this topic.';
   }else{
    if(!history||force){if(!historyPromise||force)historyPromise=getHistory();const loaded=await historyPromise;if(!current())return;history=loaded;historyPromise=null;}if(!current())return;
    const key=SECTIONS.find(x=>x[0]===category)[3];let count=0;
    const sorted=[...history].sort((a,b)=>String(a.submittedAt).localeCompare(String(b.submittedAt))||a.id.localeCompare(b.id));if(reverse)sorted.reverse();
    for(const submission of sorted){
     const items=submission.feedback?.[key]||[];if(!items.length)continue;
     const group=node('section','reference-submission');group.append(node('p','reference-submission-date',new Date(submission.submittedAt).toLocaleDateString('zh-HK')));
     for(const item of items){
      if(![item.text,item.originalSentence?.text,item.enhancement?.text,item.benefit?.text].some(v=>String(v||'').trim()))continue;
      const card=node('article','reference-suggestion');count++;
      if(item.text){const text=node('div');appendRich(text,item.text,item.formatting);card.append(text);}
      else for(const [field,label] of [['originalSentence','Original · 原句'],['enhancement','Enhancement · 提升'],['benefit','Benefit · 好處']]){
       if(!item[field]?.text)continue;const band=node('div',`reference-band is-${field}`);band.append(node('strong','',label));const text=node('div');appendRich(text,item[field].text,item[field].formatting);band.append(text);card.append(band);
      }
      group.append(card);
     }
     content.append(group);
    }
    status.textContent=count?`${count} suggestions · 建議`:'尚無已發布的相關建議 · No published suggestions yet.';
   }
  }catch{if(current()){status.textContent='未能載入，請按更新重試 · Could not load. Please refresh.';history=null;historyPromise=null;}}
 }
 function clampPosition(){if(!floating)return;const r=host.getBoundingClientRect();host.style.left=`${Math.max(8,Math.min(r.left,window.innerWidth-r.width-8))}px`;host.style.top=`${Math.max(8,Math.min(r.top,window.innerHeight-80))}px`;}
 function toggleFloat(){floating=!floating;host.classList.toggle('is-floating',floating);float.textContent=floating?'Dock · 放回':'Float · 浮動';float.setAttribute('aria-pressed',String(floating));if(floating){host.style.left=`${Math.max(8,window.innerWidth-Math.min(420,window.innerWidth-16)-24)}px`;host.style.top='120px';clampPosition();}else{host.style.left='';host.style.top='';}}
 float.onclick=toggleFloat;trigger.onclick=()=>menu.hidden?openMenu():closeMenu(true);
 trigger.onkeydown=e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();openMenu();}};
 optionButtons.forEach((option,index)=>{option.onclick=()=>selectCategory(index);});
 menu.onkeydown=e=>{const current=optionButtons.indexOf(document.activeElement);if(e.key==='Escape'){e.preventDefault();closeMenu(true);}else if(e.key==='Tab')closeMenu();else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?optionButtons.length-1:(current+(e.key==='ArrowDown'?1:-1)+optionButtons.length)%optionButtons.length;optionButtons[next].focus();optionButtons[next].scrollIntoView({block:'nearest'});}};
 document.addEventListener('pointerdown',e=>{if(!picker.contains(e.target))closeMenu();});
 order.onclick=()=>{reverse=!reverse;order.textContent=reverse?'Latest → earliest · 最新優先':'Earliest → latest · 最早優先';render();};refresh.onclick=()=>render(true);
 let drag=null;head.onpointerdown=e=>{if(!floating||e.target.closest('button')||e.button!==0)return;const r=host.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top,id:e.pointerId};head.setPointerCapture(e.pointerId);};
 head.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;host.style.left=`${e.clientX-drag.x}px`;host.style.top=`${e.clientY-drag.y}px`;clampPosition();};head.onpointerup=head.onpointercancel=()=>{drag=null;};window.addEventListener('resize',clampPosition);
 return {refresh:render,reset};
}
