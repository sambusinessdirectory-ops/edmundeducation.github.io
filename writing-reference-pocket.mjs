const SECTIONS = [
 ['glossary','Glossary · 主題詞彙',''],
 ['sentence','Sentence structure · 句子結構','sentenceStructureParts'],
 ['grammar','Grammar · 文法','grammarPoints'],
 ['literary','Literary devices · 修辭技巧','rhetoricalParts'],
 ['phrasal','Phrasal verbs · 動詞片語','phrasalVerbParts'],
 ['idioms','Idioms · 慣用語','idiomParts'],
 ['proverbs','Proverbs · 諺語','proverbParts'],
 ['common','Common expressions · 常用語','writingCommonExpressionParts'],
 ['rhetorical','Rhetorical expressions · 修辭常用語','rhetoricalCommonExpressionParts'],
 ['synonyms','Synonyms · 同義詞','synonymImprovementParts']
];
const node=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls||'';if(text!==undefined)el.textContent=text;return el;};
export function mountReferencePocket({host,getOwner,getGlossary,getHistory,appendRich}) {
 if(!host)return {refresh(){},reset(){}};
 host.className='writing-reference-pocket glass-panel';
 const head=node('header','reference-pocket-head'), title=node('div');title.append(node('p','eyebrow','MY WRITING POCKET'),node('h2','','寫作參考袋'));
 const float=node('button','small-button','Float · 浮動');float.type='button';float.setAttribute('aria-pressed','false');head.append(title,float);
 const controls=node('div','reference-pocket-controls'),select=node('select');select.setAttribute('aria-label','Reference category · 參考類別');
 SECTIONS.forEach(([id,label])=>{const option=node('option','',label);option.value=id;select.append(option);});
 const order=node('button','small-button','Earliest → latest · 最早優先');order.type='button';
 const refresh=node('button','small-button','Refresh · 更新');refresh.type='button';controls.append(select,order,refresh);
 const content=node('div','reference-pocket-content');content.tabIndex=0;content.setAttribute('aria-label','Writing reference items');
 const status=node('p','reference-pocket-status');status.setAttribute('role','status');host.append(head,controls,status,content);
 let sequence=0,owner='',history=null,historyPromise=null,reverse=false,floating=false;
 function reset(){sequence++;owner='';history=null;historyPromise=null;select.value='glossary';content.replaceChildren();status.textContent='';if(floating)toggleFloat();}
 async function render(force=false){
  const account=getOwner();if(!account){reset();return;}
  if(owner!==account){reset();owner=account;}
  const ticket=++sequence;const current=()=>ticket===sequence&&getOwner()===account;
  order.hidden=select.value==='glossary';status.textContent='Loading · 正在載入…';content.replaceChildren();
  try{
   if(select.value==='glossary'){
    const vocabulary=await getGlossary();if(!current())return;
    for(const row of vocabulary){const card=node('article','reference-vocabulary');card.append(node('strong','',row.english),node('span','',row.chinese));content.append(card);}
    status.textContent=vocabulary.length?`${vocabulary.length} words · 詞彙`:'此題暫無主題詞彙 · No glossary available for this topic.';
   }else{
    if(!history||force){if(!historyPromise||force)historyPromise=getHistory();const loaded=await historyPromise;if(!current())return;history=loaded;historyPromise=null;}if(!current())return;
    const key=SECTIONS.find(x=>x[0]===select.value)[2];let count=0;
    const sorted=[...history].sort((a,b)=>String(a.submittedAt).localeCompare(String(b.submittedAt))||a.id.localeCompare(b.id));if(reverse)sorted.reverse();
    for(const submission of sorted){
     const items=submission.feedback?.[key]||[];if(!items.length)continue;
     const group=node('section','reference-submission');group.append(node('h3','',submission.topic),node('p','reference-submission-date',new Date(submission.submittedAt).toLocaleDateString('zh-HK')));
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
 float.onclick=toggleFloat;select.onchange=()=>render();order.onclick=()=>{reverse=!reverse;order.textContent=reverse?'Latest → earliest · 最新優先':'Earliest → latest · 最早優先';render();};refresh.onclick=()=>render(true);
 let drag=null;head.onpointerdown=e=>{if(!floating||e.target.closest('button')||e.button!==0)return;const r=host.getBoundingClientRect();drag={x:e.clientX-r.left,y:e.clientY-r.top,id:e.pointerId};head.setPointerCapture(e.pointerId);};
 head.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;host.style.left=`${e.clientX-drag.x}px`;host.style.top=`${e.clientY-drag.y}px`;clampPosition();};head.onpointerup=head.onpointercancel=()=>{drag=null;};window.addEventListener('resize',clampPosition);
 return {refresh:render,reset};
}
