const shellHost=document.createElement('div');document.body.append(shellHost);const shell=shellHost.attachShadow({mode:'open'});
shell.innerHTML='<link rel="stylesheet" href="reference/base.css"><link rel="stylesheet" href="reference/curation.css"><link rel="stylesheet" href="reference/shell.css"><div class="ref-root curation-active">'+referenceShell23+'<dialog class="curation-picker"><div class="curation-picker-head">跳至步驟 <button>×</button></div><input id="curation-picker-search" placeholder="搜尋步驟"><div class="choices"></div></dialog></div>';
const $s=q=>shell.querySelector(q), allS=q=>[...shell.querySelectorAll(q)], chapters23=['boss','categorize','podcast','data','writing'];
const section23=document.querySelector('main>section'),nativeHost=document.createElement('div');nativeHost.className='native-reader-host';section23.prepend(nativeHost);const native=nativeHost.attachShadow({mode:'open'});native.innerHTML='<link rel="stylesheet" href="reference/native.css"><link rel="stylesheet" href="reference/curation.css"><style>:host{display:block}.paper-page{margin:0;width:100%;border:0}.translation{display:none}.translated .translation{display:block}mark{border-radius:3px}article header{position:static}.native-document{overflow:visible}</style><div class="source curation-active"></div>';
function read23List(key){try{const value=JSON.parse(readerStore23.getItem(key)||'[]');return Array.isArray(value)?value.filter(item=>typeof item==='string'):[]}catch{return []}}
const migrateGuideKey23=key=>{const index=entry23(key);return index>=0?key23(rows[index]):key};
let help=false,lang=false,opened=true,firstView=true,tab='all',lastNative='',lastSync='',books=read23List('cur23-stars').map(migrateGuideKey23),completed=new Set(read23List('cur23-done').map(migrateGuideKey23));const chaptersDone=()=>readerStore23.setItem('cur23-done',JSON.stringify([...completed]));
const instructions=['先找寫作身分、文類、讀者、內容要求和指定來源。','按文件標題暫標任務，讀到新線索再核對。','聽到答案後暫停，逐項寫入筆記。','按資料頁連續閱讀，核對原句和任務。','先組織自己的內容與草稿，再按任務要求校對。'];
const names23=['Boss letter · 讀任務與來源','Data File · 資料分類','會議錄音 · 邊聽邊記筆記','Data File · 逐句判讀','三篇寫作 · 逐句核對'];
const types=['','1 Task A 直接可用','2 Task B 直接可用','3 Task C 直接可用','4 語義相關／可轉述','5 提示／指路','6 無關噪音／行政語'];
const provenance23={manual:'原版導讀 · 逐字',evidence:'補充取證',editorial:'編輯補充'};
function curationSearchText23(r){return [r.q,r.a,r.manualQuote,r.manualType,...(r.manualAnalysis||[]),provenance23[r.origin]||''].filter(Boolean).join(' ')}
function jump23(j){E('jump23').value=j;E('jump23').dispatchEvent(new Event('change'));firstView=false;tab='all';update23(true)}
function renderBossLetter23(root){
 const bossRows=rows.map((row,index)=>({row,index})).filter(({row})=>row.stage===0&&row.leaf===4);
 for(const paragraph of root.querySelectorAll('.email-content p:not(.translation)')){
   const source=paragraph.textContent;
   const matches=bossRows.map(item=>({...item,start:source.indexOf(item.row.q)})).filter(item=>item.start>=0).sort((a,b)=>a.start-b.start);
   if(!matches.length)continue;
   const fragment=document.createDocumentFragment();let offset=0;
   for(const {row,index,start} of matches){
     fragment.append(source.slice(offset,start));
     const sentence=document.createElement('span');sentence.className='curation-boss-sentence';sentence.dataset.stepIndex=String(index);
     const marks=(row.marks||[]).map(([text,kind,point])=>({text,kind,point,start:row.q.indexOf(text)})).filter(mark=>mark.start>=0).sort((a,b)=>a.start-b.start);
     let cursor=0;
     for(const markSpec of marks){
       sentence.append(row.q.slice(cursor,markSpec.start));
       const mark=document.createElement('mark');mark.className='curation-mark curation-mark-'+markSpec.kind;mark.dataset.stepIndex=String(index);mark.dataset.phrase=markSpec.text;
       if(markSpec.point)mark.dataset.point=markSpec.point;
       mark.textContent=markSpec.text;if(index<i)mark.classList.add('is-revealed');sentence.append(mark);cursor=markSpec.start+markSpec.text.length;
     }
     sentence.append(row.q.slice(cursor));
     if(index===i){sentence.classList.add('target','curation-target');sentence.dataset.curationCurrent=row.task||(row.t===4?'type-4':'neutral');}
     fragment.append(sentence);offset=start+row.q.length;
   }
   fragment.append(source.slice(offset));paragraph.replaceChildren(fragment);
 }
 const current=root.querySelector(`.curation-boss-sentence[data-step-index="${i}"]`);if(current){void root.offsetWidth;current.querySelectorAll('.curation-mark').forEach(mark=>mark.classList.add('is-revealed'));}
}
function nativePage(page,r){
 const root=native.querySelector('.source');root.classList.toggle('translated',lang);
 let stamp=[page,i].join(':');if(stamp===lastNative)return;lastNative=stamp;root.innerHTML=nativePages23[page-1];
 if(r.stage===0&&page===4){renderBossLetter23(root);return;}
 // Match against the intact page first. A later evidence phrase can sit inside
 // an earlier annotated sentence, or cross several inline elements.
 const normalize = text => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];
 let normalized='';
 while(walker.nextNode()){
   const node=walker.currentNode;
   if(node.parentElement.closest('.translation,details,header,textarea'))continue;
   const offsets=[],start=normalized.length;
   for(let k=0;k<node.length;k++){
     const char=normalize(node.data[k]);
     if(char){normalized+=char;offsets.push(k);}
   }
   if(offsets.length)nodes.push({node,start,offsets});
 }
 const spans=[];
 for(let index=0;index<=i;index++){
   const row=rows[index];
   if(row.stage!==r.stage||row.leaf!==page)continue;
   const text=normalize(row.q),start=normalized.indexOf(text);
   if(text&&start>=0)spans.push({start,end:start+text.length,row,index});
 }
 for(const {node,start,offsets} of nodes){
   const segments=spans.filter(s=>s.start<start+offsets.length&&s.end>start).map(s=>({
     ...s,from:s.start<=start?0:offsets[s.start-start],
     to:s.end>=start+offsets.length?node.length:offsets[s.end-start-1]+1
   }));
   if(!segments.length)continue;
   const cuts=[...new Set([0,node.length,...segments.flatMap(s=>[s.from,s.to])])].sort((a,b)=>a-b);
   const fragment=document.createDocumentFragment();
   for(let j=1;j<cuts.length;j++){
     const from=cuts[j-1],to=cuts[j],text=node.data.slice(from,to);
     const span=segments.filter(s=>s.from<=from&&s.to>=to).at(-1);
     if(!span){fragment.append(text);continue;}
     const {row,index}=span,mark=document.createElement('mark');
     const rejected=row.t===6||row.state==='REJECT',task=row.t===5&&row.state==='REJECT'?row.topic:row.t;
     mark.dataset.stepIndex=index;mark.dataset.curationType=String(row.t);
     mark.classList.add('curation-mark');if(index<i)mark.classList.add('is-revealed');
     if(task>=1&&task<=3)mark.classList.add('curation-mark-'+'ABC'[task-1]);
     else if(task===4||task===5)mark.classList.add('curation-mark-hint');
     if(rejected){mark.classList.add('curation-strike');const pen=document.createElement('span');pen.className='curation-pen-line';pen.textContent=text;mark.append(pen);}else mark.textContent=text;
     if(index===i){mark.classList.add('target','curation-target');mark.dataset.type=row.t;mark.dataset.curationCurrent=row.t>=1&&row.t<=3?'ABC'[row.t-1]:row.t===4?'type-4':'neutral';}
     fragment.append(mark);
   }
   node.replaceWith(fragment);
 }
 const currentMark=root.querySelector(`mark[data-step-index="${i}"]`);if(currentMark){void root.offsetWidth;currentMark.classList.add('is-revealed');}
}
function syncBank(){const groups=$s('#curation-bank-groups'),open=new Set([...groups.children].filter(x=>x.open).map(x=>x.dataset.t));groups.replaceChildren();for(let t=1;t<=3;t++){let d=document.createElement('details');d.className='curation-bank-'+['A','B','C'][t-1];d.dataset.t=t;d.open=open.has(String(t))||(rows[i].pattern&&rows[i].t===t);let buttons=[...E('bank').children[t-1].querySelectorAll('button')].filter(b=>{let f=facts.find(f=>f[0]===t&&f[2]===b.textContent);if(!f)return false;if(rows[i].stage===4)return true;if(b.classList.contains('spent'))return true;if(f[1]===19)return completed.has('heard:'+f[2]);return rows.some(x=>x.stage===3&&x.p===f[1]&&x.q.includes(f[2])&&completed.has(key23(x))) });let summary=document.createElement('summary');summary.innerHTML='<span>Task '+['A','B','C'][t-1]+'</span><strong data-count>'+buttons.length+' 句</strong>';d.append(summary);let ol=document.createElement('ol');for(let b of buttons){let li=document.createElement('li'),btn=document.createElement('button'),small=document.createElement('small');btn.textContent=b.textContent;small.textContent=b.nextElementSibling?.textContent||'';btn.onclick=()=>b.click();if(b.classList.contains('spent'))btn.style.textDecoration='line-through 3px #cb2530';li.append(btn,small);ol.append(li)}d.append(ol);groups.append(d)}}
function update23(force=false){let r=rows[i],ss=rows.filter(x=>x.stage===r.stage),num=r.stage===2?cueIndex+1:ss.indexOf(r)+1,total=r.stage===2?cues.length:ss.length;let key=[i,num,done,visitIndex,E('next').disabled,help,lang,opened,tab,firstView,diag.open,completed.size].join(':');if(!force&&lastSync===key)return;lastSync=key;document.body.classList.toggle('cur23-open',opened);document.body.classList.toggle('curation-active',opened);$s('.ref-root').classList.toggle('curation-podcast-active',r.stage===2&&opened);$s('.ref-root').classList.toggle('curation-active',opened);for(let s of ['.curation-dock','.curation-bank','.curation-stage'])$s(s).hidden=!opened;$s('#curation-toggle').textContent=opened?'✦ 離開 Curation':'✦ 進入 Curation';$s('#show-translation').checked=lang;allS('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.filter===tab));allS('.curation-stage-item').forEach((b,j)=>{const stageRows=rows.filter(x=>x.stage===j),finished=stageRows.every(x=>completed.has(key23(x)));b.classList.toggle('active',j===r.stage);b.setAttribute('aria-current',j===r.stage?'step':'false');b.classList.toggle('done',finished);b.querySelector('.curation-stage-dot').textContent=finished?'✓':j+1;b.querySelector('small').textContent=j===r.stage?num+'/'+total:finished?'完成':''});$s('.curation-stage-fill').style.width=r.stage*20+'%';
 $s('#curation-chapter').textContent=instructions[r.stage];$s('#curation-step-jump').textContent=num+' / '+total+' · '+(r.stage===2?cues[cueIndex][2]:r.q).slice(0,25);$s('#curation-step-count').textContent=num+' / '+total+' · '+ss.filter(x=>completed.has(key23(x))).length+' 已完成';$s('#curation-bookmark').textContent=books.includes(key23(r))?'★':'☆';$s('#curation-source').textContent=r.stage===2?'聆聽筆記表 · 會議錄音':E('meta').textContent;$s('#curation-title').textContent=names23[r.stage];$s('#curation-quote').replaceChildren(...[...E('q').childNodes].map(n=>n.cloneNode(true)));let ex=$s('#curation-explanation');ex.replaceChildren();let p=document.createElement('p');p.textContent=E('a').textContent;let banner=document.createElement('p');banner.className='curation-type curation-type-'+r.t;banner.textContent='類型：'+types[r.t];if(r.stage!==2&&r.stage!==4)ex.append(banner);ex.append(p);if(help){let extra=document.createElement('p');extra.className='curation-extra-help';extra.textContent=(r.pattern?'留意句式「'+r.pattern+'」。':instructions[r.stage])+' '+(r.used?.length?facts[r.used[0]][4]:r.leaf?'核對 Data File 第 '+r.leaf+' 頁的說話者及前後文。':r.a);ex.append(extra)}$s('#curation-prev').disabled=E('prev').disabled;$s('#curation-next').disabled=E('next').disabled;$s('#curation-next').textContent=E('next').textContent;$s('#curation-step-actions').replaceChildren(...[...E('refs').children].map(b=>{let clone=b.cloneNode(true);clone.onclick=()=>b.click();return clone}));let tj=$s('#curation-task-jump');tj.hidden=r.stage<3;tj.replaceChildren(...[...choose.children].map((b,t)=>{let c=b.cloneNode(true);c.onclick=()=>{b.click();firstView=false;update23(true)};return c}));syncBank();
 let useNative=r.stage<4;nativeHost.hidden=!useNative;section23.classList.toggle('native-active',useNative);if(useNative)nativePage(r.stage===2?3:routePhase()==='visit'?Number(E('refs').querySelector('[data-destination]').dataset.destination):r.leaf||4,r);if(r.draft){section23.append(E('draft'));E('draft').hidden=false}else E('draft').hidden=true;
}
const originalUpdate23=update23;
update23=function(force=false){let old=lastSync;originalUpdate23(force);if(!force&&old===lastSync)return;const r=rows[i],actions=$s('#curation-step-actions'),ex=$s('#curation-explanation');if(r.stage===4&&r.pattern&&r.used.length)$s('#curation-step-count').textContent+=' · '+(diag.open?'查看原文':'證據核對')+' '+Math.min(visitIndex,r.used.length)+' / '+r.used.length;if(r.stage===4&&r.pattern){let reason=ex.querySelector('p');if(reason)reason.prepend('取用理由 · ');let structure=document.createElement('p');structure.className='curation-structure';structure.textContent='可借用的句式／版面 · '+r.pattern;ex.append(structure)}
$s('#curation-quote').hidden=false;
if(r.stage===3){
  $s('#curation-quote').textContent=r.manualQuote||r.q;
  ex.replaceChildren();
  const badge=document.createElement('p');badge.className='curation-provenance curation-provenance-'+r.origin;badge.textContent=provenance23[r.origin]||'補充取證';ex.append(badge);
  const runtimeType='類型：'+types[r.t];
  const banner=document.createElement('p');banner.className='curation-type curation-type-'+r.t;banner.textContent=runtimeType;ex.append(banner);
  if(r.manualType&&r.manualType!==runtimeType){const authored=document.createElement('p');authored.className='curation-manual-type-note';authored.textContent='原版導讀標籤（跨句逐字）：'+r.manualType;ex.append(authored)}
  if(r.origin==='manual'){
    const heading=document.createElement('p');heading.className='curation-analysis-heading';heading.textContent='分析（原文）';
    const list=document.createElement('ul');list.className='curation-verbatim-analysis';for(const line of r.manualAnalysis){const item=document.createElement('li');item.textContent=line;list.append(item)}
    ex.append(heading,list);$s('#curation-source').textContent='Data File 第 '+r.p+' 頁 · 原版導讀逐字收錄 · PDF 第 '+r.manualPdfLabel+' 頁';
  }else{
    const paragraph=document.createElement('p');paragraph.textContent=r.a;ex.append(paragraph);$s('#curation-source').textContent='Data File 第 '+r.p+' 頁 · '+(provenance23[r.origin]||'補充取證');
  }
}
if(r.stage===0){let guide=document.createElement('p');guide.className='curation-process';guide.textContent='讀任務電郵時，先辨認讀者、文類及指定來源。';ex.prepend(guide)}
if(r.stage===1){let box=document.createElement('fieldset');box.className='curation-category-choices';box.innerHTML='<legend>你會先標哪個任務？</legend>';for(let task of ['A','B','C']){let label=document.createElement('label'),cb=document.createElement('input');cb.type='checkbox';cb.checked=readerStore23.getItem('class23-'+i+task)==='1';cb.onchange=()=>readerStore23.setItem('class23-'+i+task,cb.checked?'1':'0');label.append(cb,' Task '+task);box.append(label)}let b=document.createElement('button');b.className='curation-small';b.textContent='顯示讀後修正';let rev=document.createElement('p');rev.className='curation-revision';rev.hidden=true;const revisions={5:'對照 William 的聊天，分開已承認的水浸與其他指控。',6:'最新電郵確認 Mary Steward 及首集餡料，免費 app 已取代熱線。',7:'水浸與茶巾支援 Task A；嘉賓和投票更新支援 Task C。',8:'培訓與獎勵支援 Task B；節目及運送安排支援 Task C。',9:'根據 HAB 要求及工作需要選三門課程。',10:'參加者意見只可歸於該參加者。',3:'分開舊節目、William 影片、Golden Sun 投訴及新節目資料。'};rev.textContent='讀後修正：'+revisions[r.leaf];b.onclick=()=>{rev.hidden=!rev.hidden;b.textContent=rev.hidden?'顯示讀後修正':'收起讀後修正'};ex.append(rev);actions.append(b,box)}
if(r.stage===2){let b=document.createElement('button');b.className='curation-small';b.textContent='↻ 重聽至 '+tstr(transcript[cues[cueIndex][0]].end-426);b.onclick=()=>listen(cueIndex,true);actions.append(b)}

if(!opened){nativeHost.hidden=false;section23.classList.add('native-active');lastNative=''}
};
function pick(book){let picker=$s('.curation-picker'),box=$s('.choices'),search=$s('#curation-picker-search');search.value='';function list(){box.replaceChildren();rows.forEach((r,j)=>{if(book?!books.includes(key23(r)):r.stage!==rows[i].stage)return;if(!curationSearchText23(r).toLowerCase().includes(search.value.toLowerCase()))return;let b=document.createElement('button');b.className='curation-picker-option';b.textContent=r.manualQuote||r.q||r.a;b.onclick=()=>{picker.close();jump23(j)};box.append(b)})}search.oninput=list;list();picker.showModal();search.focus()}
$s('.curation-picker-head button').onclick=()=>$s('.curation-picker').close();$s('#curation-step-jump').onclick=()=>pick(false);$s('#curation-bookmark-jump').onclick=()=>pick(true);$s('#curation-bookmark').onclick=()=>{let k=key23(rows[i]);books=books.includes(k)?books.filter(v=>v!==k):[...books,k];readerStore23.setItem('cur23-stars',JSON.stringify(books));update23(true)};
for(let id of ['prev','next'])$s('#curation-'+id).onclick=()=>{if(id==='next'){completed.add(key23(rows[i]));if(active&&done)for(let f of facts)if(f[1]===19&&transcript[cues[cueIndex][0]].text.includes(f[2]))completed.add('heard:'+f[2]);chaptersDone()}E(id).click();firstView=false;help=false;update23(true)};
$s('#curation-help').onclick=()=>{help=!help;update23(true)};$s('#curation-spotlight').onchange=()=>E('spot23').click();$s('#curation-dialogue').onchange=e=>{$s('.curation-dock').classList.toggle('dialogue',e.target.checked);$s('.curation-character').hidden=!e.target.checked};for(let id of ['curation-toggle','curation-close'])$s('#'+id).onclick=()=>{opened=!opened;update23(true)};
allS('.curation-stage-item').forEach((b,j)=>b.onclick=()=>jump23(rows.findIndex(r=>r.stage===j)));allS('[data-filter]').forEach(b=>b.onclick=()=>{let filter=b.dataset.filter;jump23(rows.findIndex(r=>r.stage===({all:0,data:3,transcript:2,practice:4}[filter])));tab=filter;update23(true)});$s('#show-translation').onchange=e=>{lang=e.target.checked;if(active&&language.getAttribute('aria-pressed')!==String(lang))language.click();update23(true)};$s('#print-reader').onclick=()=>print();let mob=$s('#page-jump');mob.replaceChildren(new Option('跳至頁面',''));for(let j=1;j<=10;j++)mob.add(new Option(j+' · '+leaves[j].split('\n')[0],j));mob.onchange=()=>{let j=rows.findIndex(r=>r.leaf===+mob.value);if(j>=0)jump23(j);else nativePage(+mob.value,rows[i])};
for(let j=1;j<=5;j++)$s('#curation-slot').add(new Option('位置 '+j,j));$s('#curation-slot').onchange=e=>slot.value=e.target.value;$s('#curation-save-now').onclick=()=>{sb[0].click();$s('#curation-save-status').textContent='已儲存'};$s('#curation-export').onclick=()=>sb[2].click();$s('#curation-import').onchange=async e=>{restore(JSON.parse(await e.target.files[0].text()));update23(true)};let load=document.createElement('button');load.textContent='載入';load.onclick=()=>{sb[1].click();update23(true)};$s('#curation-save-now').after(load);update23(true);let lastAudioState='';
setInterval(()=>{
  if(!opened || !active)return;
  const state=[cueIndex,done,E('next').disabled].join('|');
  if(state!==lastAudioState){lastAudioState=state;update23(true);}
},160);
function previewNativePage(page,quote='',task=0,rejected=false){
  excerpt.replaceChildren();
  const host=document.createElement('div');
  excerpt.append(host);
  const root=host.attachShadow({mode:'open'});
  const style=document.createElement('style');
  style.textContent=`:host{display:block}.translation,details,header,.native-label{display:none}.paper-page{margin:0;width:100%}.native-document{padding:8px}mark{background:${inks[task]};color:inherit}.curation-navy-ink,.curation-pen-line{background-repeat:no-repeat;box-decoration-break:clone;-webkit-box-decoration-break:clone}.curation-navy-ink{background-image:linear-gradient(#246fbd,#246fbd);background-position:left 46%;background-size:100% 5px}.curation-essay-source-new .curation-navy-ink{animation:sourceInk 1s cubic-bezier(.2,.8,.2,1) .26s both}.curation-pen-line{background-image:linear-gradient(#c7222c,#c7222c);background-position:left 56%;background-size:100% 3px;animation:penInk .85s cubic-bezier(.2,.8,.2,1) both}@keyframes sourceInk{from{background-size:0 5px}to{background-size:100% 5px}}@keyframes penInk{from{background-size:0 3px}to{background-size:100% 3px}}@media(prefers-reduced-motion:reduce){.curation-navy-ink,.curation-pen-line{animation:none!important}}`;
  const css=document.createElement('link');css.rel='stylesheet';css.href='reference/native.css';
  root.innerHTML=nativePages23[page-1];root.prepend(css,style);
  excerpt.scrollTop=0;
  if(!quote)return;
  const normalize=s=>s.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
  const reader=document.createTreeWalker(root.querySelector('.native-document'),NodeFilter.SHOW_TEXT);
  const nodes=[];let text='';
  while(reader.nextNode()){
    const node=reader.currentNode;
    if(node.parentElement.closest('.translation,details'))continue;
    nodes.push([node,text.length]);text+=node.textContent+' ';
  }
  let normalized='';const offsets=[];
  for(let k=0;k<text.length;k++){const ch=normalize(text[k]);if(ch){normalized+=ch;offsets.push(k);}}
  const term=normalize(quote),found=normalized.indexOf(term);if(found<0 || !term)return;
  const low=offsets[found],high=offsets[found+term.length-1]+1;
  for(const [node,start] of nodes){
    const from=Math.max(0,low-start),to=Math.min(node.length,high-start);
    if(to<=from)continue;
    const range=document.createRange();range.setStart(node,from);range.setEnd(node,to);range.surroundContents(document.createElement('mark'));
  }
  for(const mark of root.querySelectorAll('mark')){
    mark.classList.add(rejected?'curation-strike':'curation-essay-source-used',rejected?'is-revealed':'curation-essay-source-new');
    const ink=document.createElement('span');ink.className=rejected?'curation-pen-line':'curation-navy-ink';while(mark.firstChild)ink.append(mark.firstChild);mark.append(ink);
  }
  const focus=()=>{const mark=root.querySelector('mark');if(mark&&diag.open)excerpt.scrollTop+=mark.getBoundingClientRect().top-excerpt.getBoundingClientRect().top-excerpt.clientHeight*.35;};
  css.onload=focus;requestAnimationFrame(focus);
}
const shellVisit23=sourceVisit;
sourceVisit=function(id){
  const y=scrollY;shellVisit23(id);
  const [task,page,quote]=facts[id];
  if(page<=10)previewNativePage(page,quote,task);
  window.scrollTo(0,y);update23(true);
};
// Multiple clauses in a model sentence may need different witnesses.
for(const [unit,t,page,span,keyword,why] of [
[1,1,19,"we think it's all been a misunderstanding","missing context","會議承認水浸，同時指出其他食安指控有誤會。"],
[4,1,7,"This was my mistake.","accepts responsibility","William 明言這是自己的過失；公司的致歉屬公告語氣。"],
[5,1,5,"Puddle chops up some raw chicken.","raw chicken","小報描述處理生雞肉。沒有洗手是小報對畫面的推斷。"],
[7,1,5,"He starts wiping his face with a tea towel","wipe his face","小報將抹面和抹雞兩個動作連到同一條茶巾。"],
[10,1,19,"People are also saying he was very upset in the video, right?","upset","這句交代被指情緒不安，下一句才澄清原因。"],
[14,2,4,"Three courses will be enough","three courses","Archie 指定推薦三門，不能根據課程清單數量推算。"],
[14,2,19,"our chefs will need to do some fire safety training","safety","錄音交代防火需要，Dante 後來擴至全體員工。"],
[14,2,19,"all staff should be asked to go on a social media training course","communication","錄音交代推薦溝通課程的工作背景。"],
[20,2,9,"After this course, you’ll be a social media angel","social media","課程簡介確認社交媒體是主題，宣傳語不用照抄。"]
])essayUnits[unit].used.push(fact(t,page,span,keyword,why));
