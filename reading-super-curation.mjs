import {buildCourse,STAGES,emptyProgress,cleanProgress,visibleEvidence,markedText,escapeHtml as esc} from './reading-curation-core.mjs?v=20261023-super1';
import {renderRichBody,analysisAssetUrl} from './dse-deep-analysis.mjs?v=20261018-analysis-batch1';
const REV='20261023-super1';
const button=(action,text,extra='')=>`<button type="button" data-rc-action="${action}" ${extra}>${text}</button>`;
const labels={welcome:'開始之前',map:'段落地圖',sentence:'逐句閱讀',attempt:'先讀題・自己試',evidence:'定位原文',reason:'解釋證據',trap:'排除陷阱',transfer:'帶走方法',analysis:'完整原稿',answer:'對照參考',verify:'返回來源',check:'回到答案',finish:'回顧'};
export async function createReadingSuperCuration({article,userId,onClose=()=>{},onHome=()=>{}}) {
  if(article.id!=='dse-2023-a')throw new Error('Super Curation 目前只開放 2023 Part A。');
  if(!document.querySelector('link[data-reading-curation-style]')){
    const link=document.createElement('link');link.rel='stylesheet';link.href=`reading-super-curation.css?v=${REV}`;link.dataset.readingCurationStyle='';
    await new Promise((resolve,reject)=>{link.onload=resolve;link.onerror=()=>{link.remove();reject(new Error('導讀樣式載入失敗，請再試。'));};document.head.append(link);});
  }
  const get=async url=>{const r=await fetch(url);if(!r.ok)throw new Error('導讀教材載入失敗，請再試。');return r.json();};
  const [data,analysis]=await Promise.all([get(`reading-curation/2023-a.json?v=${REV}`),get(`dse-reading-analysis/dse-2023-a/index.json?v=20261018-analysis-batch-v1`)]);
  const steps=buildCourse(data,article,analysis), key=`edmund-reading-super:${data.version}:${encodeURIComponent(userId||'guest')}`;
  const byId=new Map(steps.map((s,i)=>[s.id,i]));
  let progress=emptyProgress(data),index=0,trigger=null,storageMessage='',toastTimer=0,tab='guide',opening=false,pendingSourceFocus=null;
  try{const raw=localStorage.getItem(key);if(raw)progress=cleanProgress(JSON.parse(raw),data,steps);}catch{storageMessage='未能讀取本機進度。可繼續學習並匯出進度。';}
  index=byId.get(progress.current)||0;
  const dialog=document.createElement('dialog');dialog.className='rc';dialog.setAttribute('aria-labelledby','rc-title');
  dialog.innerHTML=`<header class="rc-top"><div><p class="rc-eyebrow">SUPER CURATION · 2023 DSE PART A</p><h2 id="rc-title">讀懂原文，說清證據</h2></div><div class="rc-top-actions">${button('home','系統首頁')}${button('storage','存檔／匯出')}${button('close','離開導讀 ×')}</div></header>
    <nav class="rc-rail" aria-label="五階段閱讀路線">${STAGES.map((s,i)=>button('stage',`<span>${i+1}</span><strong>${s}</strong><small data-stage-count="${i}"></small>`,`data-stage="${i}"`)).join('')}</nav>
    <div class="rc-mobile-tabs" role="group" aria-label="選擇工作區">${['guide','source','bank'].map((s,i)=>button('tab',['導讀','原文／解說','證據庫'][i],`data-tab="${s}"`)).join('')}</div>
    <div class="rc-workspace"><aside class="rc-guide rc-panel" aria-label="逐步導讀"><div class="rc-controls"><div class="rc-nav">${button('prev','← 上一步')}${button('next','下一步 →','class="rc-primary"')}</div><div class="rc-tools">${button('jump','跳至步驟')}${button('bookmark','☆ 書籤')}${button('help','需要協助')}</div><p class="rc-position" aria-live="polite"></p><div class="rc-prefs"><label><input type="checkbox" data-rc-pref="spotlight"> 聚光燈</label><label><input type="checkbox" data-rc-pref="large"> 大字</label><label><input type="checkbox" data-rc-pref="bilingual"> 中文對照</label></div></div><div class="rc-guide-scroll" tabindex="0"><div data-rc-teaching></div><div data-rc-question></div><div data-rc-note></div></div><div class="rc-guide-foot">${button('done','✓ 標記已理解')}<p class="rc-save" role="status"></p></div></aside>
    <main class="rc-source rc-panel" aria-label="閱讀原文與解說"><div class="rc-source-head"><strong data-rc-source-heading>閱讀原文</strong><div>${button('question','原題')}${button('source','完整原文')}${button('reference','本題完整解說')}</div></div><div class="rc-source-scroll" tabindex="0"></div></main>
    <aside class="rc-bank rc-panel" aria-label="原文證據庫"><div class="rc-bank-head"><h3>閱讀證據庫</h3><p>依目前步驟顯示；往回走會收起後面的證據。</p></div><div class="rc-bank-scroll" tabindex="0"></div></aside></div><div class="rc-toast" role="status" hidden></div>`;
  const $=s=>dialog.querySelector(s), all=s=>[...dialog.querySelectorAll(s)];
  const modal=document.createElement('dialog');modal.className='rc-modal';modal.setAttribute('aria-label','導讀工具');
  document.body.append(dialog,modal);
  function current(){return steps[index];}
  function question(){return data.questions.find(q=>q.number===current().question);}
  function unit(){return question()?.units.find(u=>u.id===current().unit);}
  function notify(text){$('.rc-toast').textContent=text;$('.rc-toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('.rc-toast').hidden=true,5000);}
  function save(){
    progress.current=current().id;progress.updatedAt=new Date().toISOString();
    try{localStorage.setItem(key,JSON.stringify(progress));storageMessage='已存此裝置 · 此帳戶專用（不影響考試答案）';}
    catch{storageMessage='本機儲存失敗 · 目前仍可學習，請匯出進度。';}
    $('.rc-save').textContent=storageMessage;
  }
  function showModal(title,body,kind=''){
    if(modal.open)modal.close();
    modal.removeAttribute('style');
    modal.dataset.kind=kind;modal.innerHTML=`<header><h2 id="rc-modal-title">${esc(title)}</h2>${button('dismiss','關閉 ×')}</header><div class="rc-modal-body">${body}</div>`;
    modal.setAttribute('aria-labelledby','rc-modal-title');modal.showModal();
    if(kind==='source')enableSourceGeometry();
  }
  function questionHTML(number){
    const q=article.questions.find(x=>x.number===number);if(!q)return '';
    const option=o=>esc(typeof o==='string'?o:o.label||o.value);
    const options=items=>items?.length?`<ul class="rc-options">${items.map(o=>`<li>${option(o)}</li>`).join('')}</ul>`:'';
    return `<article class="rc-original-question"><p class="rc-eyebrow">原題 · QUESTION ${q.number}</p><h3>${esc(q.prompt)}</h3>${q.context?`<p>${esc(q.context)}</p>`:''}${options(q.optionBank)}${(q.tables||[]).map(t=>`<div class="rc-table-wrap"><table>${t.caption?`<caption>${esc(t.caption)}</caption>`:''}<tbody>${t.rows.map(row=>`<tr>${row.map(c=>`<${c.header?'th':'td'} colspan="${Number(c.colSpan)||1}" rowspan="${Number(c.rowSpan)||1}">${esc(c.text||'')}${(!c.text&&(c.part||c.parts))?' ______':''}</${c.header?'th':'td'}>`).join('')}</tr>`).join('')}</tbody></table></div>`).join('')}${(q.parts||[]).filter(p=>!p.inTable || p.options?.length).map(p=>`<section><strong>${esc(p.label)}</strong>${options(p.options)}</section>`).join('')}${options(q.options)}</article>`;
  }
  function draftHTML(q){return `<label class="rc-draft-label" for="rc-draft">我的推理與答案 · Q${q.number}</label><textarea id="rc-draft" data-rc-draft="${q.number}" maxlength="10000" rows="5" placeholder="先寫想法、證據位置，或還不肯定的地方。">${esc(progress.drafts[q.number]||'')}</textarea><small>這是導讀筆記，不會提交或改寫原來的考試答案。</small>`;}
  function renderGuide(){
    const s=current(),q=question(),u=unit();
    let body='';
    if(s.kind==='welcome')body=`<p>這篇文章有兩部分：先學怎樣寫 flash fiction，再閱讀 <em>The Big Bang</em>，最後把寫作準則用來評價故事。</p><div class="rc-callout">讀題 → 找原句 → 解釋關係 → 排除陷阱 → 寫答案 → 回到證據。</div><p>每次只處理一個決定。完成一小步，再按「下一步」。上一步會撤回後來的標示。</p><p>五階段可自由選擇；跳到解說或答案階段會揭示答案。只有你按「已理解」才會記錄完成。</p>`;
    else if(s.kind==='map')body=`<p class="rc-callout">${esc(s.note)}</p><p>先辨認第 ${s.paragraph} 段在全文做甚麼。不要急著找答案，先把背景、建議與故事分開。</p>`;
    else if(s.kind==='sentence')body=`<blockquote>${esc(s.sentence.text)}</blockquote><p class="rc-callout">${esc(s.note)}</p><p>讀回完整句子，確認這個意思是原文說的，還是自己加上的。</p>`;
    else if(s.kind==='attempt')body=`<div class="rc-callout">${esc(q.contract)}</div><p>先看中間的完整原題。圈定人物、段落、字數和任務，再寫下你的初步想法。</p><p>下一步開始逐項找證據；如果還未有答案，可以先寫不肯定的地方。</p>`;
    else if(s.kind==='evidence')body=`<p>回到第 <strong>${s.paragraph}</strong> 段，讀高亮部分前後的完整句子。</p><blockquote>${esc(s.evidence.quote)}</blockquote><p>這段話能支持甚麼？又有哪些意思是它沒有說的？先想，再看下一步的推理。</p><div class="rc-route"><span>Q${s.question} 的線索</span><svg viewBox="0 0 180 46" aria-hidden="true"><path d="M8 4 C8 36 132 8 164 35 M152 31 L164 35 L160 23"/></svg>${button('visit',`原卷文章第 ${data.sourceParagraphs.find(p=>p.number===s.paragraph).sourcePage} 頁<br><strong>第 ${s.paragraph} 段 · 查看來源 ↗</strong>`,`data-paragraph="${s.paragraph}"`)}</div>`;
    else if(s.kind==='reason')body=`<div class="rc-callout">${esc(s.note)}</div><p>把原文線索與題目要求接起來。右邊的證據庫可隨時帶你回到來源。</p>`;
    else if(s.kind==='trap')body=`<p>這個候選答案為甚麼不適合本題？</p><div class="rc-rejected"><span>不採用的答案／推論</span><s>${esc(s.trap.claim)}</s></div><div class="rc-callout">${esc(s.trap.why)}</div><p>刪線代表本題不採用這個答案，並不是把原文刪掉。</p>`;
    else if(s.kind==='transfer')body=`<div class="rc-callout">${esc(s.note)}</div><p>用自己的話講一次方法。下次換了文章，還可以用哪個檢查步驟？</p>${button('reference','深入閱讀本題全部原稿')}`;
    else if(s.kind==='analysis')body=`<p>中間顯示 Edmund Sir 原稿的第 <strong>${s.page}</strong> 頁，保留本頁完整解說及重點格式。</p><div class="rc-callout">${esc(q.contract)}</div><p>讀到證據時，使用右方證據庫回到文章。讀到陷阱時，對照自己原先的想法。</p>${button('question','重新查看完整原題')}<p class="rc-small">本階段逐頁保留所有題目解說；不是摘要。可透過「跳至步驟」找關鍵字。</p>`;
    else if(s.kind==='answer')body=`<p>先讀自己的筆記，再比較這個參考表達。</p><blockquote class="rc-answer">${esc(u.answer)}</blockquote><p>${esc(u.why)}</p><p class="rc-small">參考表達供學習比較；開放題可能有其他合理寫法，不以字串相同作評分。</p>`;
    else if(s.kind==='verify')body=`<blockquote>${esc(u.answer)}</blockquote><div class="rc-callout">答案每一部分都應有來源。這一步只核對下列證據，確認沒有加入人物、時間或因果的額外假設。</div><blockquote>${esc(s.evidence.quote)}</blockquote>${button('visit',`↗ 原卷文章第 ${data.sourceParagraphs.find(p=>p.number===s.paragraph).sourcePage} 頁 · 第 ${s.paragraph} 段`,`data-paragraph="${s.paragraph}"`)}<p>深藍刪線＝這題已回證的來源（不是錯誤）。關閉來源視窗即可回到這一步。</p>`;
    else if(s.kind==='check')body=`<div class="rc-callout">${esc(q.review)}</div><p>核對自己的答案：是否完成題目要求？是否保留原文限制？字數、字形及人物視角是否正確？</p><details><summary>再次對照參考表達</summary><blockquote>${esc(u.answer)}</blockquote></details><label class="rc-check"><input type="checkbox" data-rc-check="${s.id}" ${progress.checks.includes(s.id)?'checked':''}> 我已比較自己的答案與原文證據</label>`;
    else body=`<p>你已走到路線最後一步。這不代表所有步驟都已理解：上方數字只計算你親自標記的進度。</p><div class="rc-callout">把題目拆成任務；把原句讀成關係；把答案每個部分帶回證據。</div>${button('jump','回看未理解的步驟')}${button('close','返回閱讀練習')}`;
    $('[data-rc-teaching]').innerHTML=`<p class="rc-eyebrow">${esc(labels[s.kind])}${q?` · Q${q.number}`:''}</p><h3 tabindex="-1">${esc(s.title)}</h3>${body}`;
    $('[data-rc-question]').innerHTML=q?`<details><summary>本題任務與完整題目</summary><p class="rc-callout">${esc(q.contract)}</p>${questionHTML(q.number)}</details>`:'';
    $('[data-rc-note]').innerHTML=q?draftHTML(q):'';
    $('.rc-position').textContent=`${index+1} / ${steps.length} · ${STAGES[s.stage]}${q?` · Q${q.number}`:''}`;
    $('[data-rc-action="prev"]').disabled=index===0;
    $('[data-rc-action="next"]').disabled=index===steps.length-1;
    $('[data-rc-action="done"]').textContent=progress.done.includes(s.id)?'✓ 已理解（取消標記）':'✓ 標記已理解';
    $('[data-rc-action="done"]').setAttribute('aria-pressed',String(progress.done.includes(s.id)));
    $('[data-rc-action="bookmark"]').textContent=progress.bookmarks.includes(s.id)?'★ 已加書籤':'☆ 書籤';
    $('[data-rc-action="bookmark"]').setAttribute('aria-pressed',String(progress.bookmarks.includes(s.id)));
    $('[data-rc-action="reference"]').disabled=!q;
    $('[data-rc-action="question"]').disabled=!q;
  }
  function paragraphHTML(p,marks,activeId){
    const meta=data.sourceParagraphs.find(x=>x.number===p.number);
    return `<article class="rc-paragraph" data-paragraph="${p.number}"><header><span>PARAGRAPH ${p.number}</span><small>原卷文章 p.${meta.sourcePage}</small></header>${p.label?`<h3>${esc(p.label)}</h3>`:''}<p>${markedText(p.text,marks.filter(m=>m.paragraph===p.number),activeId)}</p>${progress.preferences.bilingual?`<div class="rc-translation" lang="zh-Hant"><small>中文參考 · 原文意思對照</small>${p.translation?esc(p.translation):`此段翻譯未載入。可在「需要協助 → 原稿補充」查看完整中文參考。`}</div>`:''}</article>`;
  }
  function renderSource(){
    const s=current(),q=question();let marks=visibleEvidence(data,steps,index);
    if(s.sentence)marks=[{...s.sentence,paragraph:s.paragraph,kind:'reading'}];
    const panel=$('.rc-source-scroll');
    if(s.kind==='analysis'){
      const page=analysis.pages.find(p=>p.number===s.page);
      $('[data-rc-source-heading]').textContent=`Q${s.question} · 完整原稿 p.${s.page} / ${analysis.pageCount}`;
      panel.innerHTML=`<article class="rc-original-analysis"><p class="rc-eyebrow">EDMUND SIR · 原稿解說 · p.${s.page}</p><div class="deep-source-body">${renderRichBody(page,'',f=>analysisAssetUrl(analysis,f))}</div><details><summary>原頁頁眉及頁尾</summary><p>${esc([...(page.header||[]),...(page.footer||[])].join('\n'))}</p></details></article>`;
    }else if(s.kind==='attempt'){
      $('[data-rc-source-heading]').textContent=`QUESTION ${s.question} · 完整原題`;
      panel.innerHTML=`${questionHTML(s.question)}<p class="rc-callout">先確認：${esc(q.contract)}</p><p>需要查看文章時，按上方「完整原文」。下一步才加入證據標示。</p>`;
    }else{
      $('[data-rc-source-heading]').textContent='Flash Fiction · 完整原文';
      panel.innerHTML=`<div class="rc-document-title"><p class="rc-eyebrow">2023 DSE · READING PART A</p><h2>${esc(article.title)}</h2><p>原文字句完整保留；標示隨步驟前後變化。</p></div>${article.paragraphs.map(p=>paragraphHTML(p,marks,s.evidence?.id||s.sentence?.id||'')).join('')}`;
      const focus=s.paragraph||unit()?.evidence[0]?.paragraph||q?.scope[0]||1;
      all('.rc-paragraph').forEach(p=>p.classList.toggle('rc-dim',progress.preferences.spotlight&&Number(p.dataset.paragraph)!==focus));
      pendingSourceFocus=focus;
      alignSource();
    }
    if(s.kind==='analysis'||s.kind==='attempt'){pendingSourceFocus=null;panel.scrollTop=0;}
  }
  function alignSource(){
    const panel=$('.rc-source-scroll');
    if(!pendingSourceFocus||!panel.getClientRects().length)return;
    const target=panel.querySelector(`[data-paragraph="${pendingSourceFocus}"]`);
    if(target)panel.scrollTop+=target.getBoundingClientRect().top-panel.getBoundingClientRect().top-12;
    pendingSourceFocus=null;
  }
  function renderBank(){
    const q=question(),evidence=visibleEvidence(data,steps,index),s=current();
    let html=`<div class="rc-legend"><span>青：正在讀</span><span>黃：證據</span><span>綠：邏輯</span><span>紫：語言</span><span>深藍線：已回證</span></div>`;
    if(!q) html+=`<p class="rc-muted">逐題取證階段會在這裡建立可追溯的證據庫。</p><nav class="rc-paragraph-nav" aria-label="段落定位">${data.sourceParagraphs.map(p=>button('paragraph',`<b>${p.number}</b> ${esc(p.title)}`,`data-paragraph="${p.number}"`)).join('')}</nav>`;
    else{
      html+=`<h4>QUESTION ${q.number}</h4><p class="rc-small">${esc(q.contract)}</p>`;
      if(!evidence.length)html+='<p class="rc-muted">先試題。隨著每一步取證，原句才會加入這裡。</p>';
      for(const e of evidence)html+=`<button class="rc-evidence-card ${e.used?'rc-card-used':''}" type="button" data-rc-action="visit" data-paragraph="${e.paragraph}"><small>第 ${e.paragraph} 段 · ${e.used?'已回證（不是錯誤）':'已找到的證據'}</small><q><span class="${e.used?'rc-consumed-quote':''}">${esc(e.quote)}</span></q><span>回到來源 ↗</span></button>`;
      const traps=s.stage===2?steps.slice(0,index+1).filter(x=>x.question===q.number&&x.kind==='trap'):[];
      if(traps.length)html+=`<details><summary>已檢查的不採用答案 (${traps.length})</summary>${traps.map(t=>`<div class="rc-rejected"><s>${esc(t.trap.claim)}</s><p>${esc(t.trap.why)}</p></div>`).join('')}</details>`;
    }
    $('.rc-bank-scroll').innerHTML=html;
  }
  function updateRail(){
    all('[data-stage]').forEach(b=>{const n=Number(b.dataset.stage),list=steps.filter(s=>s.stage===n);b.setAttribute('aria-current',n===current().stage?'step':'false');b.dataset.complete=String(list.every(s=>progress.done.includes(s.id)));b.querySelector('small').textContent=`${list.filter(s=>progress.done.includes(s.id)).length} / ${list.length} 已理解`;});
  }
  function render(){
    dialog.dataset.large=String(progress.preferences.large);dialog.dataset.tab=tab;
    all('[data-rc-pref]').forEach(i=>i.checked=progress.preferences[i.dataset.rcPref]);
    all('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));
    renderGuide();renderSource();renderBank();updateRail();$('.rc-save').textContent=storageMessage||'進度儲存在此裝置及此帳戶；不會改動考試答案。';
    $('.rc-guide-scroll').scrollTop=0;$('.rc-bank-scroll').scrollTop=0;
  }
  function go(id,{focus=true}={}){
    const next=typeof id==='number'?id:byId.get(id);if(!Number.isInteger(next)||next<0||next>=steps.length)return;
    if(modal.open)modal.close();index=next;tab='guide';render();save();
    if(focus)$('[data-rc-teaching] h3').focus({preventScroll:true});
  }
  function jump(filter='',bookmarksOnly=false){
    showModal('選擇研讀步驟',`<p>可按題號、原稿頁碼或內容搜尋。直接選解說或答案步驟會顯示相關答案，不會自動標記已理解。</p><label>搜尋路線<input type="search" data-rc-search value="${esc(filter)}" placeholder="例如 Q16、unless、p.280"></label><div class="rc-search-filters"><label><input type="checkbox" data-rc-only-bookmarks ${bookmarksOnly?'checked':''}> 只看書籤</label><label><input type="checkbox" data-rc-only-unread> 只看未理解</label></div><div data-rc-search-results></div>`,'jump');
    filterSteps();modal.querySelector('input[type=search]').focus();
  }
  function filterSteps(){
    const needle=modal.querySelector('[data-rc-search]').value.trim().toLowerCase(),onlyBookmarks=modal.querySelector('[data-rc-only-bookmarks]').checked,onlyUnread=modal.querySelector('[data-rc-only-unread]').checked;
    const found=steps.filter(s=>{
      if(onlyBookmarks&&!progress.bookmarks.includes(s.id)||onlyUnread&&progress.done.includes(s.id))return false;
      const text=[STAGES[s.stage],s.title,s.note,s.question?`Q${s.question}`:'',s.page?`p.${s.page} ${analysis.pages.find(p=>p.number===s.page)?.text}`:'',s.evidence?.quote,s.trap?.claim].join(' ').toLowerCase();
      return !needle||text.includes(needle);
    });
    modal.querySelector('[data-rc-search-results]').innerHTML=`<p>${found.length} 個步驟</p>${found.map(s=>button('goto',`<small>${STAGES[s.stage]}${s.question?` · Q${s.question}`:''}${s.page?` · p.${s.page}`:''}</small><strong>${esc(s.title)}</strong><span>${progress.done.includes(s.id)?'✓ 已理解':'未標記'} ${progress.bookmarks.includes(s.id)?'★':''}</span>`,`data-id="${s.id}" class="rc-jump-item" ${s.id===current().id?'aria-current="step"':''}`)).join('')}`;
  }
  function placePreview(rect){
    const gap=12,minW=Math.min(320,innerWidth-gap*2),minH=Math.min(240,innerHeight-gap*2);
    const width=Math.max(minW,Math.min(rect.width,innerWidth-gap*2)),height=Math.max(minH,Math.min(rect.height,innerHeight-gap*2));
    Object.assign(modal.style,{position:'fixed',margin:'0',width:`${width}px`,height:`${height}px`,left:`${Math.max(gap,Math.min(rect.left,innerWidth-width-gap))}px`,top:`${Math.max(gap,Math.min(rect.top,innerHeight-height-gap))}px`});
  }
  function enableSourceGeometry(){
    const bounds=modal.getBoundingClientRect();placePreview({left:bounds.left,top:Math.min(bounds.top,innerHeight*.16),width:Math.min(740,bounds.width),height:Math.min(innerHeight*.7,680)});
    const head=modal.querySelector('header');head.tabIndex=0;head.setAttribute('aria-label','來源視窗標題：可拖動，或用方向鍵移動');
    head.addEventListener('keydown',e=>{if(e.target!==head||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const r=modal.getBoundingClientRect();placePreview({left:r.left+(e.key==='ArrowRight'?16:e.key==='ArrowLeft'?-16:0),top:r.top+(e.key==='ArrowDown'?16:e.key==='ArrowUp'?-16:0),width:r.width,height:r.height});});
    function pointer(e,corner=''){
      if(e.button!==0||(!corner&&e.target.closest('button')))return;
      e.preventDefault();const target=e.currentTarget,r=modal.getBoundingClientRect(),start={x:e.clientX,y:e.clientY,left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};
      target.setPointerCapture(e.pointerId);
      const move=ev=>{
        const dx=ev.clientX-start.x,dy=ev.clientY-start.y;
        if(!corner){placePreview({...start,left:start.left+dx,top:start.top+dy});return;}
        const minW=Math.min(320,innerWidth-24),minH=Math.min(240,innerHeight-24);
        const left=corner.includes('w')?Math.max(12,Math.min(start.right-minW,start.left+dx)):start.left;
        const right=corner.includes('e')?Math.min(innerWidth-12,Math.max(start.left+minW,start.right+dx)):start.right;
        const top=corner.includes('n')?Math.max(12,Math.min(start.bottom-minH,start.top+dy)):start.top;
        const bottom=corner.includes('s')?Math.min(innerHeight-12,Math.max(start.top+minH,start.bottom+dy)):start.bottom;
        placePreview({left,top,width:right-left,height:bottom-top});
      };
      const stop=()=>{target.removeEventListener('pointermove',move);target.removeEventListener('pointerup',stop);target.removeEventListener('pointercancel',stop);};
      target.addEventListener('pointermove',move);target.addEventListener('pointerup',stop);target.addEventListener('pointercancel',stop);
    }
    head.addEventListener('pointerdown',e=>pointer(e));
    for(const corner of ['nw','ne','sw','se']){
      const handle=document.createElement('button');handle.type='button';handle.className=`rc-resize rc-resize-${corner}`;handle.setAttribute('aria-label',`調整來源視窗大小 ${corner}；方向鍵可調整`);handle.title='拖動調整大小；亦可用方向鍵';modal.append(handle);
      handle.addEventListener('pointerdown',e=>pointer(e,corner));
      handle.addEventListener('keydown',e=>{if(!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const r=modal.getBoundingClientRect();placePreview({left:r.left,top:r.top,width:r.width+(e.key==='ArrowRight'?16:e.key==='ArrowLeft'?-16:0),height:r.height+(e.key==='ArrowDown'?16:e.key==='ArrowUp'?-16:0)});});
    }
  }
  const resizePreview=()=>{if(modal.open&&modal.dataset.kind==='source')placePreview(modal.getBoundingClientRect());alignSource();};
  window.addEventListener('resize',resizePreview);
  function sourceVisit(paragraph){
    const marks=visibleEvidence(data,steps,index),p=article.paragraphs.find(p=>p.number===paragraph);if(!p)return;
    showModal(`來源 · 第 ${paragraph} 段`,`${paragraphHTML(p,marks,current().evidence?.id)}<p class="rc-small">原卷文章 p.${data.sourceParagraphs.find(x=>x.number===paragraph).sourcePage} · 回到步驟後，筆記與標示仍然保留。</p>${button('dismiss','← 返回剛才的導讀步驟')}${button('next','已核對，下一步 →','class="rc-primary"')}`,'source');
  }
  function fullSource(){
    showModal('完整閱讀原文',article.paragraphs.map(p=>paragraphHTML(p,visibleEvidence(data,steps,index),'')).join(''),'source');
  }
  function storage(){
    const slots=[1,2,3].map(n=>{let saved=null;try{saved=JSON.parse(localStorage.getItem(`${key}:slot:${n}`)||'null');}catch{}return `<section class="rc-slot"><strong>存檔 ${n}</strong><small>${saved?.updatedAt?esc(new Date(saved.updatedAt).toLocaleString('zh-HK')):'尚未儲存'}</small>${button('save-slot','儲存到此位置',`data-slot="${n}"`)}${button('load-slot','載入',`data-slot="${n}" ${saved?'':'disabled'}`)}</section>`;}).join('');
    showModal('我的導讀進度',`<p>自動儲存在此裝置、此學生帳戶。包含進度、書籤、筆記與顯示設定；不會變更考試成績。</p>${slots}<div class="rc-file-tools">${button('export','匯出進度 JSON')}<label>匯入自己的進度<input type="file" accept="application/json,.json" data-rc-import></label></div>${button('bookmarks','查看我的書籤')}${button('supplements','閱讀原稿補充內容（35頁）')}<p class="rc-small">${esc(data.editorialNote)}</p>`,'storage');
  }
  function toggle(list,id){const at=list.indexOf(id);if(at<0)list.push(id);else list.splice(at,1);}
  function close(){if(!dialog.open)return;if(modal.open)modal.close();save();dialog.close();document.body.classList.remove('rc-open');clearTimeout(toastTimer);onClose();trigger?.focus?.({preventScroll:true});}
  async function action(event){
    const b=event.target.closest('[data-rc-action]');if(!b||b.disabled)return;
    const a=b.dataset.rcAction;
    if(a==='close'){close();return;}
    if(a==='home'){close();onHome();return;}
    if(a==='dismiss'){modal.close();return;}
    if(a==='next'||a==='prev'){
      if(a==='next'&&current().kind==='attempt'&&!progress.drafts[current().question]?.trim()){
        showModal('先留下一個想法',`<p>先在左方寫答案、證據位置，或不肯定的地方。也可以選擇先看示範，再回來自己試。</p>${button('dismiss','返回寫想法')}${button('continue','我想先看示範','class="rc-primary"')}`);return;
      }
      go(index+(a==='next'?1:-1));return;
    }
    if(a==='continue'){go(index+1);return;}
    if(a==='goto'){go(b.dataset.id);return;}
    if(a==='stage'){const target=steps.find(s=>s.stage===Number(b.dataset.stage));if(target.stage>=3){showModal('進入解說階段',`<p>這個階段會顯示完整解說及參考答案。你可以先到「逐題取證」自己嘗試。</p>${button('dismiss','先留在目前步驟')}${button('goto','進入這個階段',`data-id="${target.id}" class="rc-primary"`)}`);}else go(target.id);return;}
    if(a==='done'){toggle(progress.done,current().id);save();updateRail();b.textContent=progress.done.includes(current().id)?'✓ 已理解（取消標記）':'✓ 標記已理解';b.setAttribute('aria-pressed',String(progress.done.includes(current().id)));return;}
    if(a==='bookmark'){toggle(progress.bookmarks,current().id);save();b.textContent=progress.bookmarks.includes(current().id)?'★ 已加書籤':'☆ 書籤';b.setAttribute('aria-pressed',String(progress.bookmarks.includes(current().id)));return;}
    if(a==='jump'||a==='bookmarks'){jump('',a==='bookmarks');return;}
    if(a==='tab'){tab=b.dataset.tab;dialog.dataset.tab=tab;all('[data-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.tab===tab)));if(tab==='source')alignSource();return;}
    if(a==='visit'||a==='paragraph'){sourceVisit(Number(b.dataset.paragraph));return;}
    if(a==='source'){fullSource();return;}
    if(a==='question'){showModal(`Question ${current().question}`,questionHTML(current().question),'question');return;}
    if(a==='reference'){
      const q=question();if(!q)return;
      showModal(`Q${q.number} · 完整解說`, `<p>原稿 p.${q.analysisPages[0]}–${q.analysisPages.at(-1)}，全部保留。選一頁進入精讀，可返回目前步驟。</p>${button('goto','返回目前導讀',`data-id="${current().id}"`)}${q.analysisPages.map(n=>button('reference-page',`p.${n} · ${esc(analysis.pages.find(p=>p.number===n).title)}`,`data-page="${n}" class="rc-page-link"`)).join('')}`,'reference');return;
    }
    if(a==='reference-page'){
      const page=analysis.pages.find(p=>p.number===Number(b.dataset.page));
      showModal(`完整原稿 · p.${page.number}`,`<div class="deep-source-body">${renderRichBody(page,'',f=>analysisAssetUrl(analysis,f))}</div>${button('reference','← 本題頁目錄')}${button('dismiss','返回導讀')}`,'reference');return;
    }
    if(a==='help'){
      const q=question();showModal('需要更多協助',`<ol><li>讀清任務：${esc(q?.contract||'先辨認段落功能，再逐句看作者怎樣建立意思。')}</li><li>只用原文支持的內容。核對人物、時間、程度和因果。</li><li>把候選答案放回題目，檢查有沒有答錯問題。</li></ol><p>${esc(q?.review||'每次只處理一個意思，按上一步重新閱讀也可以。')}</p>${q?button('reference','閱讀本題完整深度解說'):''}${button('supplements','原稿文章、翻譯與補充頁')}`);return;
    }
    if(a==='supplements'){
      showModal('原稿補充內容',`<p>包括原文、翻譯及總表。總表含答案；Question 21 應連同 p.280–301 的兩條路線閱讀。</p>${analysis.supplementaryPages.map(n=>button('supplement-page',`p.${n} · ${esc(analysis.pages.find(p=>p.number===n)?.title||'補充')}`,`data-page="${n}" class="rc-page-link"`)).join('')}`);return;
    }
    if(a==='supplement-page'){const p=analysis.pages.find(p=>p.number===Number(b.dataset.page));showModal(`原稿補充 · p.${p.number}`,`<div class="deep-source-body">${renderRichBody(p,'',f=>analysisAssetUrl(analysis,f))}</div>${button('supplements','← 補充頁目錄')}`);return;}
    if(a==='storage'){storage();return;}
    if(a==='save-slot'){
      const slot=Number(b.dataset.slot);showModal('儲存導讀快照',`<p>以目前進度取代存檔 ${slot}。自動存檔仍會繼續保留最新進度。</p>${button('confirm-save-slot','確認儲存',`data-slot="${slot}"`)}${button('storage','取消')}`);return;
    }
    if(a==='confirm-save-slot'){save();try{localStorage.setItem(`${key}:slot:${Number(b.dataset.slot)}`,JSON.stringify(progress));storage();notify('已儲存快照。');}catch{showModal('未能儲存','<p>裝置儲存空間不足或被封鎖。請關閉此視窗，再匯出進度保存。</p>');}return;}
    if(a==='load-slot'){
      try{const raw=JSON.parse(localStorage.getItem(`${key}:slot:${Number(b.dataset.slot)}`));const restored=cleanProgress(raw,data,steps);showRestore(restored);}catch{showModal('未能載入','<p>存檔無效或版本不符，現有進度沒有變更。</p>');}return;
    }
    if(a==='export'){save();const blob=new Blob([JSON.stringify(progress,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='DSE-2023-A-Super-Curation-progress.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
  }
  function showRestore(restored){
    showModal('載入這份進度？',`<p>將載入 ${restored.done.length} 個已理解步驟、${restored.bookmarks.length} 個書籤及 ${Object.keys(restored.drafts).length} 題筆記。這會取代目前導讀進度。</p><p>需要保留目前版本，可先取消並匯出。</p>${button('restore','確認載入','class="rc-primary"')}${button('dismiss','取消')}`);
    modal.querySelector('[data-rc-action="restore"]').addEventListener('click',()=>{progress=restored;go(restored.current);notify('已載入導讀進度。');},{once:true});
  }
  dialog.addEventListener('click',action);modal.addEventListener('click',action);
  dialog.addEventListener('input',e=>{if(e.target.matches('[data-rc-draft]')){progress.drafts[e.target.dataset.rcDraft]=e.target.value;save();}});
  dialog.addEventListener('change',e=>{
    if(e.target.matches('[data-rc-pref]')){progress.preferences[e.target.dataset.rcPref]=e.target.checked;dialog.dataset.large=String(progress.preferences.large);renderSource();save();}
    if(e.target.matches('[data-rc-check]')){toggle(progress.checks,e.target.dataset.rcCheck);save();}
  });
  modal.addEventListener('input',e=>{if(e.target.matches('[data-rc-search],[data-rc-only-bookmarks],[data-rc-only-unread]'))filterSteps();});
  modal.addEventListener('change',async e=>{
    if(!e.target.matches('[data-rc-import]'))return;const file=e.target.files[0];if(!file)return;
    try{if(file.size>1000000)throw new Error('進度檔過大。');const raw=JSON.parse(await file.text());showRestore(cleanProgress(raw,data,steps));}
    catch{showModal('無法匯入這份進度','<p>檔案格式、大小或教材版本不符。現有進度沒有變更；請選擇本系統匯出的進度 JSON。</p>');}
  });
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  
  return {
    open(from){if(dialog.open||opening)return;opening=true;trigger=from;document.body.classList.add('rc-open');dialog.showModal();render();opening=false;$('.rc-nav button').focus();},
    close,
    destroy(){close();window.removeEventListener('resize',resizePreview);dialog.remove();modal.remove();},
  };
}
