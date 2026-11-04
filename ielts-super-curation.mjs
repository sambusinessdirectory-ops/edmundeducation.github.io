import { loadCuration } from './ielts-curation-loader.mjs?v=20261026-1';
import { mountFloatingWindow } from './floating-window.mjs?v=20260911';
import { checkpointStartIndex, checkpointEndIndex, rewindTo, replayCue, nextProgress, checkpointDue, sanitizeSession, progressFromSaved, annotationSegments } from './ielts-curation-core.mjs?v=20261026-dse1';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clock = t => `${Math.floor((t||0)/60)}:${String(Math.floor((t||0)%60)).padStart(2,'0')}`;
const roles = {evidence:'答案證據',context:'背景／連接',instruction:'試卷指示',noise:'無關語／略讀',distractor:'候選／干擾線索'};
let opened = false;
export async function openSuperCuration({ content, part: requestedPart = 1, onClose = () => {}, storageScope = 'local', prepared = null }) {
  if (opened) return;
  opened = true;
  let curation;
  try { ({curation,content}=prepared || await loadCuration(content)); } catch(error) { opened=false;throw error; }
  const ui=curation.presentation || {title:`Practice ${content.practice}`,exam:'IELTS LISTENING',partLabel:'Part',storageId:`ielts-super-curation:${storageScope}:practice${content.practice}`,fileId:`ielts-practice${content.practice}`};
  const partLabel=ui.partLabel;
  const returnFocus = document.activeElement;
  const key = `edmund-${curation.id ? `dse-super-curation:${storageScope}:${curation.id}` : ui.storageId}`;
  let session = {version:curation.version,...(curation.id?{id:curation.id}:{practice:content.practice}),part:requestedPart,revealMode:'auto',parts:{}};
  let storageMessage = '進度自動儲存於此瀏覽器';
  try { const raw=localStorage.getItem(key); if(raw) session=sanitizeSession(JSON.parse(raw),curation); } catch { storageMessage='儲存未能讀取；可用匯出保留進度。'; }
  session.part=requestedPart;
  for(const p of curation.parts) session.parts[p.part] ||= {completedIds:[],revealedIds:[],drafts:{}};
  const renderedMarks=new Map();
  let lastFocusedQuestion=null, reviewQuestion=null, mediaValid=true;
  let part, source, progress, timer=0, frame=0, generation=0, typed='', chinese=false, hideNoise=false, pins=false, help=false, speed=1, closed=false, pendingSeek=null;
  const root=document.createElement('section'); root.className='isc'; root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',`${ui.exam} ${ui.title} Super Curation`);
  const previousOverflow=document.body.style.overflow; document.body.style.overflow='hidden';
  const inertBefore=[...document.body.children].map(el=>[el,el.inert]);inertBefore.forEach(([el])=>el.inert=true);
  root.innerHTML=`<header class="isc-top"><div><span class="isc-eyebrow">EDMUNDEDUCATION · ${esc(ui.exam)}</span><h1>${esc(ui.title)} <span>Super Curation</span></h1></div><button data-act="close" class="isc-exit">離開 Curation ×</button></header>
  <nav class="isc-parts" aria-label="四部分聆聽進度">${curation.parts.map(p=>`<button data-part="${p.part}"><b>${p.part}</b><span>${esc(partLabel)} ${p.part}<small>${esc(p.title)}</small></span><output data-count="${p.part}">0/${p.cues.length}</output></button>`).join('')}</nav>
  <section class="isc-player" aria-label="錄音控制"><button data-act="play">▶ 播放</button><button data-act="back-five" aria-label="倒退 5 秒" title="倒退 5 秒">−5s</button><button data-act="forward-five" aria-label="前進 5 秒" title="前進 5 秒；不越過下一個答案停頓點">+5s</button><button data-act="replay" title="重聽會撤回本題及之後的示範筆記">↶ 重聽本題</button><div class="isc-timeline"><input type="range" data-seek min="0" max="100" step="0.01" value="0" aria-label="錄音時間"><div class="isc-pins" hidden></div></div><output data-time>0:00</output><label>速度 <select data-speed>${[.5,.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3].map(s=>`<option ${s===1?'selected':''}>${s}</option>`).join('')}</select>×</label><button data-act="pins" aria-pressed="false">停頓點</button><button data-act="transcript">錄音稿</button><audio preload="metadata"></audio></section>
  <p class="isc-error" role="status" hidden></p>
  <div class="isc-grid"><aside class="isc-dock"><div class="isc-dock-head">聽懂 → 判斷 → 寫低</div><label class="isc-reveal-mode">答案顯示方式 <select data-reveal-mode aria-label="答案顯示方式"><option value="auto">自動顯示 · 跟住學</option><option value="manual">先自己做 · 按一下揭曉</option></select></label><div class="isc-controls"><button data-act="back">← 上一步</button><button data-act="help" aria-expanded="false">需要更多協助</button><button data-act="next" class="isc-primary">開始聆聽 →</button></div><div class="isc-teaching" aria-live="polite"></div><div class="isc-settings"><label><input type="checkbox" data-spotlight> 聚焦本題</label><label>跳至已到達的題目 <select data-jump></select></label><details><summary>儲存與還原</summary><label>書籤槽 <select data-slot><option value="1">1</option><option value="2">2</option><option value="3">3</option></select></label><div><button data-act="save">儲存書籤</button><button data-act="load">讀取書籤</button><button data-act="export">匯出</button><button data-act="import">匯入</button><input type="file" accept="application/json,.json" data-import hidden></div></details><small data-save-status role="status">${esc(storageMessage)}</small></div></aside>
  <main class="isc-notes"><div class="isc-paper-head"></div><details class="isc-original"><summary>完整原題與作答指示</summary><div></div></details><p class="isc-note-help">先聽，再自己作答。每個重點後錄音會暫停，示範筆記逐字顯示。你的作答會獨立保留，倒帶不會刪除。</p><div class="isc-note-list"></div><details class="isc-bank"><summary>已聽到的證據庫 <output>0</output></summary><div></div></details></main>
  <aside class="isc-transcript" aria-label="完整中英錄音稿"><header><strong>錄音稿 · 自由拖動</strong><div><button data-act="zh" aria-pressed="false">中文對照</button><button data-act="position" title="恢復視窗預設位置">復位</button><button data-act="hide-transcript" aria-label="收起錄音稿">×</button></div></header><div class="isc-transcript-tools"><label><input type="checkbox" data-noise> 隱藏已略讀的無關語</label><button data-act="locate">定位目前句子</button></div><p class="isc-legend"><mark>答案證據</mark> <span class="isc-candidate">候選線索</span> <span class="isc-rejected">已排除</span> <span class="isc-noise">無關語</span><br><span data-mark-help>標記隨錄音出現 · 不會自動捲動</span></p><div class="isc-transcript-body"></div></aside></div>`;
  document.body.append(root);
  const $=s=>root.querySelector(s), $$=s=>[...root.querySelectorAll(s)], audio=$('audio');
  function status(message){$('[data-save-status]').textContent=message;}
  function error(message){$('.isc-error').hidden=!message;$('.isc-error').replaceChildren(); if(message){$('.isc-error').append(document.createTextNode(message+' '));const retry=document.createElement('button');retry.textContent='重試錄音';retry.dataset.act='retry';$('.isc-error').append(retry);}}
  function persist(){session.parts[part.part].completedIds=part.cues.slice(0,progress.completed).map(c=>c.id);session.parts[part.part].revealedIds=(session.parts[part.part].revealedIds||[]).filter(id=>session.parts[part.part].completedIds.includes(id));session.part=part.part;try{localStorage.setItem(key,JSON.stringify(session));status('已儲存 · 此瀏覽器');}catch{status('未能自動儲存；請匯出進度。');}}
  function cancelTyping(){generation++;clearTimeout(timer);typed='';}
  function setTime(time){pendingSeek=time;if(audio.readyState){audio.currentTime=time;}progress.time=time;}
  function setPart(n){
    if(part){cancelTyping();audio.pause();persist();}
    renderedMarks.clear();reviewQuestion=null;part=curation.parts.find(p=>p.part===n); source=content.parts.find(p=>p.part===n);session.part=n;
    progress=progressFromSaved(part,session.parts[n]);
    mediaValid=content.timings.parts[n].audioSha256===part.audioSha256&&content.timings.parts[n].transcriptSha256===part.transcriptSha256;lastFocusedQuestion=null;
    if(mediaValid)audio.src=content.timings.parts[n].audioUrl;else audio.removeAttribute('src');
    audio.playbackRate=speed;setTime(progress.time);error(mediaValid?'':'錄音或錄音稿版本已改動，請先重新核對停頓點。');
    root.dataset.part=n;
    $('.isc-paper-head').innerHTML=`<span class="isc-eyebrow">${esc(partLabel.toUpperCase())} ${n} · QUESTIONS ${Math.min(...part.cues.map(c=>c.question))}–${Math.max(...part.cues.map(c=>c.question))}</span><h2>${esc(part.title)}</h2><p>${esc(part.subtitle)}</p><strong>${esc(part.instructions)}</strong>`;
    $('.isc-original div').innerHTML=renderOriginal(source);
    $('.isc-note-list').innerHTML=[...part.cues].sort((a,b)=>a.question-b.question).map(c=>{
      const q=questionFor(c.question);
      return `<article class="isc-note" data-note="${c.question}"><div class="isc-note-title"><b>Q${c.question}</b><span>${esc(c.questionText || q.prompt.replace(/_{3,}/g,'_____'))}${c.groupQuestions?`<small>Q${c.groupQuestions.join('、Q')} ${esc(c.groupLabel||'同組 · 答案次序不限')}</small>`:''}</span></div>${content.renderContext?.(q)||''}${q.options?`<details><summary>查看選項</summary><div class="isc-options">${q.options.map(o=>`<span><b>${esc(o.key)}</b> ${esc(o.en)}</span>`).join('')}</div></details>`:''}${content.renderAnswer?.(q,session.parts[n].drafts[c.question]||'') || `<label>你的答案 <input data-draft="${c.question}" value="${esc(session.parts[n].drafts[c.question]||'')}" autocomplete="off" spellcheck="false"></label>`}<button class="isc-reveal-answer" data-reveal="${c.question}" hidden>顯示 Q${c.question} 答案與解析</button><div class="isc-generated" data-generated="${c.question}" aria-label="示範筆記"></div><small class="isc-note-source"></small></article>`;
    }).join('');
    $('.isc-transcript-body').innerHTML=content.transcript[n].map((row,i)=>`<article class="isc-line" data-line="${i}"><div class="isc-line-meta"><button data-line-seek="${i}" title="倒帶到此句，會撤回之後示範">${clock(content.timings.parts[n].lines[i].start)}</button><span data-role></span></div>${row.speaker?`<strong class="isc-speaker">${esc(row.speaker)}</strong>`:''}<p data-en>${esc(row.en)}</p><p class="isc-zh" ${chinese?'':'hidden'}>${esc(row.zh)}</p></article>`).join('');
    $('[data-seek]').max=part.duration;
    $('.isc-pins').innerHTML=part.cues.map((c,i)=>`<button style="left:${100*c.end/part.duration}%" data-pin="${i}" title="Q${c.question} · ${clock(c.end)}" aria-label="重聽 Q${c.question}"></button>`).join('');
    render();
  }
  function questionFor(number){return source.questions.find(q=>q.number===number||q.numbers?.includes(number));}
  function renderOriginal(p){
    if(content.renderOriginal)return content.renderOriginal(p);
    if(p.sourceBlocks?.length)return p.sourceBlocks.map(b=>`<section><small>原題 PDF 第 ${b.page} 頁</small>${b.type==='image'?`<a href="${esc(b.src)}" target="_blank" rel="noopener" aria-label="放大原題圖表"><img src="${esc(b.src)}" alt="${esc(b.alt)}" loading="eager"></a>`:''}${b.text?`<pre>${esc(b.text)}</pre>`:''}</section>`).join('');
    const table=p.table?`<div class="isc-source-table"><table><caption>${esc(p.table.caption)}</caption><thead><tr>${p.table.headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${p.table.rows.map(r=>`<tr>${r.map(cell=>`<td>${esc(cell).replace(/\{\{(\d+)\}\}/g,'($1) _____')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
    return `<p>${esc(p.instruction)}</p>${table}${p.questions.map(q=>`<section><b>Q${(q.numbers||[q.number]).join('–')} ${esc(q.prompt)}</b>${q.options?`<p>${q.options.map(o=>`${esc(o.key)}. ${esc(o.en)}`).join('<br>')}</p>`:''}</section>`).join('')}`;
  }
  function answerText(cue){const q=questionFor(cue.question);return q.options?`${cue.answer} · ${q.options.find(o=>o.key===cue.answer)?.en||''}`:cue.answer;}
  function answerVisible(cue){return session.revealMode!=='manual'||session.parts[part.part].revealedIds.includes(cue.id);}
  function noteText(cue){return `${answerText(cue)}\n${cue.paraphrase}`;}
  function renderNotes(){
    for(let i=0;i<part.cues.length;i++){
      const c=part.cues[i], el=$(`[data-note="${c.question}"]`), out=el.querySelector('.isc-generated');
      el.classList.toggle('is-active',i===progress.index);
      const visible=answerVisible(c);
      const typing=progress.phase==='typing'&&i>=progress.index&&i<=checkpointEndIndex(part,progress.index);
      const offset=part.cues.slice(progress.index,i).reduce((n,c)=>n+noteText(c).length+1,0);
      const value=i<progress.completed&&visible?noteText(c):typing?typed.slice(offset,offset+noteText(c).length):'';
      const revealButton=el.querySelector('[data-reveal]');
      revealButton.hidden=i>=progress.completed;
      revealButton.textContent=visible?`查看 Q${c.question} 完整解析`:`顯示 Q${c.question} 答案與解析`;
      out.textContent=value;const illustration=content.renderSolution?.(questionFor(c.question),c,value===noteText(c));if(illustration)out.insertAdjacentHTML('beforeend',illustration);out.classList.toggle('is-written',!!value);
      el.querySelector('.isc-note-source').textContent=i<progress.completed?`✓ 已聽證據${visible?'':' · 答案待揭曉'} · ${clock(c.start)}–${clock(c.end)} · ${partLabel} ${part.part}`:'聽到本題重點後才顯示示範';
    }
    const visibleCues=part.cues.slice(0,progress.completed).filter(answerVisible);
    $('.isc-bank output').textContent=`${visibleCues.length}/${part.cues.length}`;
    $('.isc-bank div').innerHTML=visibleCues.map(c=>`<p><b>Q${c.question} · ${esc(answerText(c))}</b><br><small>${clock(c.start)}–${clock(c.end)}</small><br>${c.evidence.map(e=>`“${esc(e.quote)}”`).join('<br>')}</p>`).join('')||'<p>答案揭曉後，證據會逐項加入。</p>';
  }
  function renderMarks(){
    const horizon=Math.min(progress.time,['ending','done'].includes(progress.phase)?part.duration:part.cues[progress.index].end);
    const timing=content.timings.parts[part.part].lines;
    for(const annotation of part.annotations){
      const i=annotation.line,row=$(`[data-line="${i}"]`), heard=timing[i].end<=horizon+.001;
      const text=content.transcript[part.part][i].en;
      const marks=[];
      for(const c of part.cues){
        if(!answerVisible(c))continue;
        for(const e of c.evidence)if(e.line===i&&e.revealAt<=horizon+.001)marks.push({...e,kind:'evidence',label:`Q${c.question} · 答案證據`});
        for(const d of c.distractors)if(d.line===i&&d.candidateAt<=horizon+.001)marks.push({...d,kind:d.rejectAt<=horizon+.001?'rejected':'candidate',label:d.rejectAt<=horizon+.001?`Q${c.question} · ${d.why}`:`Q${c.question} · 候選，等後文判斷`});
      }
      if(heard)for(const quote of annotation.noiseSpans||[])marks.push({quote,kind:'noise',label:'無關語 · 不放入答案'});
      if(heard&&annotation.role==='noise')marks.push({quote:text,kind:'noise',label:'無關語 · 不放入答案'});
      const html=annotationSegments(text,marks).map(seg=>seg.marks.length?`<span class="${seg.marks.map(m=>`isc-${m.kind}`).join(' ')}" title="${esc(seg.marks.map(m=>m.label).join('；'))}">${esc(seg.text)}</span>`:esc(seg.text)).join('');
      if(renderedMarks.get(i)!==html){row.querySelector('[data-en]').innerHTML=html;renderedMarks.set(i,html);}
      const concealed=session.revealMode==='manual'&&['evidence','distractor'].includes(annotation.role)&&!part.cues.some(c=>answerVisible(c)&&[...c.evidence,...c.distractors].some(e=>e.line===i));
      row.querySelector('[data-role]').textContent=heard&&!concealed?roles[annotation.role]:'';
      row.hidden=hideNoise&&heard&&annotation.role==='noise';
      row.classList.toggle('is-current',timing[i].start<=horizon&&horizon<=timing[i].end);
    }
  }
  function render(){
    const reviewIndex=reviewQuestion===null?progress.index:part.cues.findIndex(c=>c.question===reviewQuestion);
    const c=part.cues[reviewIndex], isDone=progress.phase==='done'&&reviewQuestion===null, heard=progress.completed>reviewIndex, revealed=heard&&answerVisible(c);
    $('[data-reveal-mode]').value=session.revealMode;
    $('[data-mark-help]').textContent=session.revealMode==='manual'?'答案標記在揭曉後出現 · 不會自動捲動':'標記隨錄音出現 · 不會自動捲動';
    $('.isc-note-help').textContent=session.revealMode==='manual'?'先聽，再自己作答。每個重點後錄音會暫停；按「顯示答案與解析」才揭曉示範、解析及答案標記。可先完成多題再逐題揭曉。':'先聽，再自己作答。每個重點後錄音會暫停，示範筆記逐字顯示。你的作答會獨立保留，倒帶不會刪除。';
    $$('.isc-parts button').forEach(b=>{b.setAttribute('aria-current',Number(b.dataset.part)===part.part?'step':'false');const count=Number(b.dataset.part)===part.part?progress.completed:session.parts[b.dataset.part].completedIds.length;const total=curation.parts.find(p=>p.part===Number(b.dataset.part)).cues.length;b.querySelector('output').textContent=`${count}/${total}`;b.classList.toggle('is-done',count===total);});
    $('.isc-teaching').innerHTML=isDone?`<span class="isc-eyebrow">${esc(partLabel.toUpperCase())} ${part.part} · 已完成</span><h2>${part.cues.length} 個答案，逐一有證據。</h2><p>核對自己的答案、字數限制及改寫關係。可重聽任何一題，或前往下一部分。</p><button data-act="next-part" class="isc-primary">${part.part<4?'前往 '+partLabel+' '+(part.part+1):'返回 '+partLabel+' 1 複習'}</button>`:`<span class="isc-eyebrow">${reviewIndex+1} / ${part.cues.length} · Q${c.question}</span><h2>${progress.phase==='ending'?'最後核對 · 錄音收尾':revealed?'答案與證據':heard?'先自己作答':progress.phase==='typing'?'正在寫入筆記…':'先搵聆聽目標'}</h2><p>${esc(c.hint)}</p>${revealed?`<blockquote>${c.evidence.map(e=>esc(e.quote)).join('<br>')}</blockquote><strong class="isc-answer-label">${esc(answerText(c))}</strong><p class="isc-authored-explanation">${esc(content.analysis[c.question].explanation)}</p>`:heard?`<p>錄音已暫停。先填寫你的答案，準備好才揭曉；也可按「下一步」繼續聽。</p><button class="isc-primary" data-reveal="${c.question}">顯示 Q${c.question} 答案與解析</button>`:`<blockquote>先聽 ${clock(progress.time)} → ${clock(c.end)}<br>聽到完整證據後會自動暫停。</blockquote><p>${progress.phase==='listening'?'錄音進行中；可暫停、重聽或自行作答。':'按「開始聆聽」；本題示範仍然留白。'}</p>`}${help?`<div class="isc-help"><b>逐步提示</b><p>${revealed?'對照上面的完整解析，在錄音稿找出答案及干擾線索，再用自己的說法解釋。需要再聽一次，可按「重聽本題」。':'先讀原題及空格前後的字，再留意說話者、否定詞、轉折和時間。未確認前不要把第一個聽到的字當答案。'}</p></div>`:''}`;
    const next=$('[data-act="next"]');next.disabled=!mediaValid||['listening','ending','typing','done'].includes(progress.phase);next.textContent=progress.phase==='intro'?'開始聆聽 →':progress.phase==='typing'?'寫入中…':progress.completed===part.cues.length?'聽完本段 →':'下一步 →';
    $('[data-act="back"]').disabled=progress.index===0&&progress.completed===0&&progress.time===0;
    $('[data-act="back-five"]').disabled=!mediaValid;$('[data-act="forward-five"]').disabled=!mediaValid;
    $('[data-act="play"]').disabled=!mediaValid||['typing','paused','done'].includes(progress.phase);
    $('[data-act="play"]').textContent=audio.paused?'▶ 播放':'Ⅱ 暫停';
    $('[data-jump]').innerHTML=part.cues.map((cue,i)=>`<option value="${i}" ${i===progress.index?'selected':''} ${i>progress.completed?'disabled':''}>Q${cue.question} · ${clock(cue.end)}</option>`).join('');
    $$('.isc-pins button').forEach(b=>b.disabled=Number(b.dataset.pin)>progress.completed);
    renderNotes();renderMarks();updateTime();
    if(lastFocusedQuestion!==c.question){const list=$('.isc-note-list'),note=$(`[data-note="${c.question}"]`);list.scrollTop+=note.getBoundingClientRect().top-list.getBoundingClientRect().top;lastFocusedQuestion=c.question;}
  }
  function updateTime(){ $('[data-time]').textContent=`${clock(progress.time)} / ${clock(part.duration)}`;if(document.activeElement!==$('[data-seek]'))$('[data-seek]').value=progress.time; }
  async function play(){
    reviewQuestion=null;
    if(!mediaValid||['typing','paused','done'].includes(progress.phase))return;
    if(progress.phase!=='ending')progress.phase='listening';render();
    try{await audio.play();error('');}catch{progress.phase='intro';error('錄音未能播放。可重試，或繼續查看未標記的錄音稿；本題不會計作已聽。');render();}
  }
  function finishCue(){
    if(progress.phase!=='listening')return;
    reviewQuestion=null;
    const cue=part.cues[progress.index],groupEnd=checkpointEndIndex(part,progress.index);audio.pause();progress.phase='typing';setTime(cue.end);cancelTyping();
    if(session.revealMode==='manual'){progress.completed=checkpointEndIndex(part,progress.index)+1;progress.phase='paused';persist();render();return;}
    const text=part.cues.slice(progress.index,groupEnd+1).map(noteText).join('\n'), token=generation;
    render();
    const step=()=>{if(token!==generation||closed)return;const amount=matchMedia('(prefers-reduced-motion: reduce)').matches?text.length:3;typed=text.slice(0,typed.length+amount);renderNotes();if(typed.length<text.length)timer=setTimeout(step,24);else{progress.completed=checkpointEndIndex(part,progress.index)+1;progress.phase='paused';typed='';persist();render();}};
    step();
  }
  function rewind(time){reviewQuestion=null;cancelTyping();audio.pause();progress=rewindTo(part,progress,time);setTime(progress.time);persist();render();}
  function skipSeconds(delta){
    const wasPlaying=!audio.paused;
    const limit=progress.completed===part.cues.length?part.duration:part.cues[progress.completed].end-.05;
    const target=Math.max(0,Math.min(limit,progress.time+delta));
    if(progress.completed===part.cues.length&&target>=part.cues.at(-1).end){cancelTyping();audio.pause();progress.phase='ending';setTime(target);render();}
    else rewind(target);
    if(wasPlaying)void play();
  }
  function replay(index){reviewQuestion=null;cancelTyping();audio.pause();progress=replayCue(part,index);setTime(progress.time);persist();render();void play();}
  function tick(){if(closed)return;if(!audio.paused&&progress.phase==='ending'&&!audio.seeking){progress.time=audio.currentTime;updateTime();renderMarks();const ending=content.timings.parts[part.part].lines.at(-1).end;if(progress.time>=ending){audio.pause();setTime(ending);progress.phase='done';persist();render();}}if(!audio.paused&&progress.phase==='listening'&&!audio.seeking){progress.time=audio.currentTime;if(checkpointDue(part,progress,progress.time,true))finishCue();else{updateTime();renderMarks();}}frame=requestAnimationFrame(tick);}
  audio.addEventListener('timeupdate',()=>{if(!audio.paused&&progress.phase==='listening'&&!audio.seeking){progress.time=audio.currentTime;if(checkpointDue(part,progress,progress.time,true))finishCue();}});
  audio.addEventListener('loadedmetadata',()=>{
    if(Math.abs(audio.duration-part.duration)>1){mediaValid=false;error('錄音長度與已校準版本不同。請通知老師核對；自動聆聽暫停。');audio.pause();$('[data-act="next"]').disabled=true;$('[data-act="play"]').disabled=true;return;}
    if(pendingSeek!==null)audio.currentTime=pendingSeek;
  });
  audio.addEventListener('seeking',()=>{if(pendingSeek!==null&&Math.abs(audio.currentTime-pendingSeek)<.05){pendingSeek=null;return;}rewind(audio.currentTime);});
  audio.addEventListener('seeked',()=>{if(pendingSeek!==null&&Math.abs(audio.currentTime-pendingSeek)<.05)pendingSeek=null;});
  audio.addEventListener('error',()=>{audio.pause();if(progress.phase==='listening')progress.phase='intro';error('錄音未能載入。錄音稿仍可閱讀；未聽到的重點不會計作完成。');render();});
  audio.addEventListener('pause',()=>{$('[data-act="play"]').textContent='▶ 播放';});
  audio.addEventListener('play',()=>{if(!['listening','ending'].includes(progress.phase)){audio.pause();return;}$('[data-act="play"]').textContent='Ⅱ 暫停';});
  audio.addEventListener('ended',()=>{if(progress.phase==='ending'&&progress.completed===part.cues.length){progress.time=content.timings.parts[part.part].lines.at(-1).end;progress.phase='done';persist();render();return;}if(progress.completed<part.cues.length&&progress.phase==='listening'){progress.phase='intro';error('錄音已結束，但本題尚未完成。請重聽本題。');render();}});
  function restore(raw){const clean=sanitizeSession(raw,curation);cancelTyping();audio.pause();session=clean;part=null;setPart(clean.part);persist();status('已還原相容題目的進度與你的答案。');}
  function resetPosition(){const panel=$('.isc-transcript');panel.removeAttribute('style');panel.hidden=false;}
  root.addEventListener('click',async event=>{
    if(content.handleAnswerClick?.(event.target,session.parts[part.part].drafts)){event.stopPropagation();persist();return;}
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.reveal){const cue=part.cues.slice(0,progress.completed).find(c=>c.question===Number(button.dataset.reveal));if(cue){reviewQuestion=cue.question;const ids=session.parts[part.part].revealedIds;if(!ids.includes(cue.id))ids.push(cue.id);persist();render();}return;}
    if(button.dataset.part){setPart(Number(button.dataset.part));return;}
    if(button.dataset.pin!==undefined){replay(Number(button.dataset.pin));return;}
    if(button.dataset.lineSeek!==undefined){const time=content.timings.parts[part.part].lines[button.dataset.lineSeek].start;rewind(Math.min(time,progress.time));return;}
    switch(button.dataset.act){
      case 'close':close();break;
      case 'next':reviewQuestion=null;if(progress.phase==='intro')void play();else if(progress.phase==='paused'){progress=nextProgress(part,progress);if(progress.phase==='done')progress.phase='ending';render();if(['listening','ending'].includes(progress.phase))void play();}break;
      case 'back-five':skipSeconds(-5);break;
      case 'forward-five':skipSeconds(5);break;
      case 'play':if(audio.paused)void play();else audio.pause();break;
      case 'back':{const index=checkpointStartIndex(part,Math.max(0,checkpointStartIndex(part,progress.index)-1));rewind(index?part.cues[index-1].end+.001:0);break;}
      case 'replay':replay(progress.index);break;
      case 'help':help=!help;button.setAttribute('aria-expanded',help);render();break;
      case 'next-part':setPart(part.part===4?1:part.part+1);break;
      case 'pins':pins=!pins;$('.isc-pins').hidden=!pins;button.setAttribute('aria-pressed',pins);break;
      case 'zh':chinese=!chinese;button.setAttribute('aria-pressed',chinese);$$('.isc-zh').forEach(p=>p.hidden=!chinese);break;
      case 'hide-transcript':$('.isc-transcript').hidden=true;break;
      case 'transcript':$('.isc-transcript').hidden=!$('.isc-transcript').hidden;break;
      case 'position':resetPosition();break;
      case 'locate':{const lines=content.timings.parts[part.part].lines;let i=lines.findLastIndex(l=>l.start<=progress.time);if(i<0)i=0;const target=$(`[data-line="${i}"]`),container=$('.isc-transcript-body');container.scrollTop=target.offsetTop-container.offsetTop;break;}
      case 'retry':audio.load();setTime(progress.time);error('請按播放重試。');break;
      case 'save':persist();try{localStorage.setItem(`${key}:slot${$('[data-slot]').value}`,JSON.stringify(session));status('書籤已儲存。');}catch{status('書籤未能儲存；請匯出。');}break;
      case 'load':try{const raw=localStorage.getItem(`${key}:slot${$('[data-slot]').value}`);if(!raw)throw Error('這個書籤槽仍未有存檔。');restore(JSON.parse(raw));}catch(e){status(e.message);}break;
      case 'export':{persist();const url=URL.createObjectURL(new Blob([JSON.stringify(session,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`${ui.fileId}-curation-progress.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('已匯出進度及你的答案。');break;}
      case 'import':$('[data-import]').click();break;
    }
  });
  root.addEventListener('input',event=>{if(event.target.dataset.draft){session.parts[part.part].drafts[event.target.dataset.draft]=event.target.value;persist();}});
  root.addEventListener('change',async event=>{
    const el=event.target;
    if(el.matches('[data-reveal-mode]')){
      session.revealMode=el.value==='manual'?'manual':'auto';
      if(progress.phase==='typing'){cancelTyping();progress.completed=checkpointEndIndex(part,progress.index)+1;progress.phase='paused';}
      persist();render();
    }
    if(el.matches('[data-seek]'))rewind(Number(el.value));
    if(el.matches('[data-speed]')){speed=Number(el.value);audio.playbackRate=speed;}
    if(el.matches('[data-noise]')){hideNoise=el.checked;renderMarks();}
    if(el.matches('[data-spotlight]'))root.classList.toggle('isc-spotlight',el.checked);
    if(el.matches('[data-jump]'))replay(Number(el.value));
    if(el.matches('[data-import]')){try{const file=el.files[0];if(!file)return;if(file.size>200000)throw Error('存檔過大，請選取 Curation 匯出的 JSON。');restore(JSON.parse(await file.text()));}catch(e){status('未能匯入：'+e.message);}el.value='';}
  });
  root.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();close();}
    if(event.key==='Tab'){
      const items=[...root.querySelectorAll('button:not(:disabled),input:not(:disabled),select,summary,a')].filter(el=>el.getClientRects().length);
      if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1).focus();}
      else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0].focus();}
    }
  });
  const saveOnExit=()=>persist();window.addEventListener('pagehide',saveOnExit);
  function close(){if(closed)return;cancelTyping();audio.pause();persist();closed=true;cancelAnimationFrame(frame);window.removeEventListener('pagehide',saveOnExit);audio.removeAttribute('src');audio.load();root.remove();document.body.style.overflow=previousOverflow;inertBefore.forEach(([el,value])=>el.inert=value);opened=false;returnFocus?.focus();onClose();}
  mountFloatingWindow($('.isc-transcript'),{dragHandle:$('.isc-transcript header'),minWidth:290,minHeight:220,isActive:()=>!closed&&innerWidth>1100});
  setPart(requestedPart);frame=requestAnimationFrame(tick);$('[data-act="next"]').focus();
  return {close};
}
