export const DIFFICULTIES = [
  {id:'standard',rate:.25,zh:'標準模式',en:'Standard'},
  {id:'medium',rate:.4,zh:'中等難度',en:'Medium'},
  {id:'hard',rate:.6,zh:'高難度',en:'Hard'},
  {id:'hell',rate:.8,zh:'地獄難度',en:'Hell'}
];
export const HINTS = [
  {id:'none',zh:'不顯示字母提示',en:'No hints'},
  {id:'first',zh:'顯示開首字母',en:'First letter'},
  {id:'last',zh:'顯示結尾字母',en:'Last letter'},
  {id:'both',zh:'顯示開首及結尾字母',en:'First + last'}
];
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function lineTokens(text) { return text.match(/[A-Za-z]+(?:['’][A-Za-z]+)*|[^A-Za-z]+/g)||[]; }
export function blankPositions(text, index, rate) {
  const tokens=lineTokens(text),eligible=tokens.map((word,i)=>/^[A-Za-z]/.test(word)&&word.replace(/[^a-z]/gi,'').length>2?i:-1).filter(i=>i>=0);
  // Evenly distribute a deterministic selection across the full line.
  const shuffled=eligible.map(i=>({i,rank:((i+1)*2654435761+(index+1)*1597334677)>>>0})).sort((a,b)=>a.rank-b.rank);
  return new Set(shuffled.slice(0,Math.ceil(eligible.length*rate)).map(x=>x.i));
}
export function wordHint(word, mode) {
  const letters=word.replace(/[^A-Za-z]/g,'');const gap='_'.repeat(Math.max(1,letters.length-(mode==='both'?2:1)));
  return mode==='none'?'':mode==='first'?letters[0]+gap:mode==='last'?gap+letters.at(-1):letters[0]+gap+letters.at(-1);
}
export function translationsText(dialogue) { return `${dialogue.titleZh}\nLesson ${dialogue.lesson} · ${dialogue.title}\n\n`+dialogue.lines.map(line=>`${line.role==='Visitor'?'訪客':'保安人員'}：${line.zh}`).join('\n\n'); }

export function mountDialoguePage({dialogues,audioManifest,root=document.body}) {
  const params=new URLSearchParams(location.search),dialogue=dialogues.find(d=>d.id===params.get('id'));
  if(!dialogue) {
    const page=document.createElement('main');page.className='pro-practice-page';
    page.innerHTML='<h1>找不到這篇對話</h1><p>請返回課程選擇練習。</p><a href="./">返回課程</a>';
    root.append(page);document.body.classList.add('pro-dialogue-open');return {page,stop(){}};
  }
  const completeAudio=dialogue.lines.every((_,index)=>audioManifest[`${dialogue.id}:${index}`]?.path);
  let view=['modes','practice'].includes(params.get('view'))?params.get('view'):'dialogue';
  let difficulty=DIFFICULTIES.find(d=>d.id===params.get('difficulty'))||DIFFICULTIES[0];
  let hint=HINTS.find(h=>h.id===params.get('hints'))||HINTS[3];
  let translations=false,highlight=true,rate=1,audio=null,current=-1,continuous=false,generation=0;
  const page=document.createElement('main');page.className='pro-practice-page';root.append(page);document.body.classList.add('pro-dialogue-open');
  const answers=new Map();
  const role=line=>line.role==='Visitor'?'訪客 · Visitor':'保安人員 · Security';
  const query=(next,extra={})=>{const url=new URL(location.href);url.searchParams.set('view',next);for(const [key,value]of Object.entries(extra))url.searchParams.set(key,value);return url;};
  const count=d=>dialogue.lines.reduce((n,l,i)=>n+blankPositions(l.en,i,d.rate).size,0);
  const label=line=>line.voice==='british-male'?'英式男聲':line.voice==='british-female'?'英式女聲':line.voice==='american-male'?'美式男聲':'美式女聲';
  function status(text){const el=page.querySelector('[data-audio-status]');if(el)el.textContent=text;}
  function sync(){
    page.querySelectorAll('[data-dialogue-line]').forEach(el=>{const active=highlight&&Number(el.dataset.dialogueLine)===current&&audio&&!audio.paused;el.classList.toggle('is-speaking',Boolean(active));if(active)el.setAttribute('aria-current','true');else el.removeAttribute('aria-current');});
    const button=page.querySelector('[data-play-all]');if(button){button.disabled=!completeAudio&&!audio;button.textContent=audio&&!audio.paused?'❚❚ 暫停 · Pause':current>=0?'▶ 繼續 · Resume':'▶ 播放整段 · Play all';button.setAttribute('aria-pressed',String(Boolean(audio&&!audio.paused)));}
    page.querySelectorAll('[data-play-line]').forEach(b=>{b.setAttribute('aria-pressed',String(Number(b.dataset.playLine)===current&&Boolean(audio&&!audio.paused)));});
  }
  function stop(){generation++;if(audio){audio.onended=null;audio.onerror=null;audio.pause();audio.removeAttribute('src');audio.load();}audio=null;current=-1;continuous=false;sync();status('');}
  async function playLine(index,all=false){
    stop();const token=generation;const clip=audioManifest[`${dialogue.id}:${index}`];if(!clip){status('這句錄音暫時未能載入，請重新整理頁面。');return;}
    current=index;continuous=all;audio=new Audio(new URL(clip.path,location.href).href);const player=audio;player.playbackRate=rate;player.preload='auto';
    player.onplay=()=>{if(token!==generation)return;sync();status(`正在播放第 ${index+1} / ${dialogue.lines.length} 句`);const line=page.querySelector(`[data-dialogue-line="${index}"]`);if(highlight&&line){const rect=line.getBoundingClientRect();if(rect.top<160||rect.bottom>innerHeight-40)line.scrollIntoView({behavior:'smooth',block:'center'});}};
    player.onpause=sync;
    player.onended=()=>{if(token!==generation)return;if(continuous&&index+1<dialogue.lines.length)void playLine(index+1,true);else{stop();status('播放完畢。');}};
    player.onerror=()=>{if(token!==generation)return;stop();status('錄音暫時未能播放，請按播放按鈕重試。');};
    try{await player.play();}catch{if(token===generation){stop();status('未能播放錄音，請再按一次播放。');}}
  }
  function rememberAnswers(){page.querySelectorAll('[data-blank]').forEach(input=>answers.set(input.dataset.blank,input.value));}
  function changeView(next,extra={},reset=false){if(!reset)rememberAnswers();stop();view=next;history.pushState(null,'',query(next,extra));render();window.scrollTo({top:0,behavior:'smooth'});}
  function toolbar(){return `<section class="pro-playback" aria-label="對話播放控制"><div class="pro-playback-main"><button type="button" class="pro-primary" data-play-all aria-pressed="false" ${completeAudio?'':'disabled'}>▶ 播放整段 · Play all</button><button type="button" data-stop-audio>■ 停止 · Stop</button><button type="button" data-sync-highlight aria-pressed="${highlight}">同步標示 ${highlight?'ON':'OFF'}</button><button type="button" data-show-chinese aria-pressed="${translations}">${translations?'隱藏':'顯示'}中文翻譯</button><button type="button" data-copy-chinese>複製全部中文</button></div><div class="pro-speed" role="group" aria-label="播放速度">${[.25,.5,.75,1,1.25,1.5].map(n=>`<button type="button" data-pro-speed="${n}" aria-pressed="${n===rate}">${n}×</button>`).join('')}</div>${completeAudio?'':'<p class="pro-audio-availability" role="status">美式男聲錄音暫時未能提供。你仍可播放訪客的英式女聲、查看中文翻譯及完成填充練習。</p>'}<p data-audio-status role="status"></p></section>`;}
  function lineMarkup(line,index,exercise){
    const blanks=blankPositions(line.en,index,difficulty.rate);
    const content=exercise?lineTokens(line.en).map((word,i)=>blanks.has(i)?`<input class="pro-gap" data-blank="${index}:${i}" data-answer="${esc(word)}" aria-label="第 ${index+1} 句，第 ${[...blanks].sort((a,b)=>a-b).indexOf(i)+1} 個填空" placeholder="${esc(wordHint(word,hint.id))}" value="${esc(answers.get(`${index}:${i}`)||'')}" autocomplete="off" autocapitalize="off" spellcheck="false" style="--word-width:${Math.max(7,Math.min(18,word.length+2))}ch">`:esc(word)).join(''):esc(line.en);
    return `<article class="pro-turn pro-turn--${line.role.toLowerCase()}" data-dialogue-line="${index}"><header><span class="pro-role">${index+1}. ${role(line)}<small>${label(line)}</small></span><button type="button" data-play-line="${index}" ${audioManifest[`${dialogue.id}:${index}`]?.path?'':'disabled title="這句錄音暫時未能提供"'} aria-label="播放第 ${index+1} 句" aria-pressed="false">▶</button></header><p lang="en">${content}</p><p class="pro-chinese" data-chinese lang="zh-Hant" ${translations?'':'hidden'}>${esc(line.zh)}</p></article>`;
  }
  function render(){
    document.title=`${dialogue.titleZh} · ${view==='modes'?'選擇練習模式':view==='practice'?'填充練習':'對話學習'} | Professional English`;
    page.innerHTML=`<header class="pro-page-header"><a href="./">← 返回課程 · Back to course</a><button type="button" data-page-theme>${document.documentElement.classList.contains('theme-day')?'☾ 夜間模式':'☀ 日間模式'}</button></header><section class="pro-page-intro"><p class="pro-eyebrow">PROFESSIONAL ENGLISH · LESSON ${dialogue.lesson} · ${dialogue.variant==='beginner'?'BEGINNER':'PROFESSIONAL'}</p><h1>${esc(dialogue.titleZh)}</h1><p>${esc(dialogue.title)}</p><nav class="pro-step-nav" aria-label="練習步驟">${[['dialogue','01','學習對話'],['modes','02','選擇模式'],['practice','03','填充練習']].map(([step,n,text])=>`<a href="${esc(query(step))}" data-step="${step}" ${step===view?'aria-current="step"':''}>${n} ${text}</a>`).join('')}</nav></section>
      ${view==='modes'?`<section class="pro-mode-intro"><h2>選擇練習模式</h2><p>選擇填空難度及字母提示。每個模式均可聆聽對話、調整速度及查看中文翻譯。</p><p><strong>16</strong> 種模式 · <strong>${dialogue.lines.length}</strong> 句對話</p></section><div class="pro-mode-groups">${DIFFICULTIES.map(d=>`<section class="pro-mode-group pro-mode-group--${d.id}"><header><h2>${d.zh}<small>${d.en} · ${Math.round(d.rate*100)}% 填空</small></h2><span>${count(d)} 題填充</span></header><div class="pro-mode-cards">${HINTS.map(h=>`<a href="${esc(query('practice',{difficulty:d.id,hints:h.id}))}" data-mode="${d.id}" data-hints="${h.id}"><strong>${h.zh}</strong><span>${h.en}</span><small>${count(d)} 題 →</small></a>`).join('')}</div></section>`).join('')}</div>`:`${toolbar()}<section class="pro-dialogue-content"><div class="pro-content-title"><h2>${view==='practice'?'填充練習':'完整對話'}</h2><p>${view==='practice'?`${difficulty.zh} · ${hint.zh} · ${count(difficulty)} 題`:'先聆聽角色對話，理解情境，再開始練習。'}</p></div>${dialogue.lines.map((line,index)=>lineMarkup(line,index,view==='practice')).join('')}${view==='practice'?'<div class="pro-submit"><button class="pro-primary" type="button" data-check-answers>提交答案 · Check answers</button><p data-result-status role="status"></p><button type="button" data-retry-mistakes hidden>再試答錯的題目</button></div>':'<button class="pro-primary pro-choose-mode" type="button" data-choose-mode>選擇練習模式 →</button>'}</section>`}`;
    page.querySelectorAll('[data-blank]').forEach(input=>input.addEventListener('input',()=>{input.classList.remove('is-wrong','is-correct');input.removeAttribute('aria-invalid');}));
  }
  page.addEventListener('click',async event=>{
    const button=event.target.closest('button,a');if(!button)return;
    if(button.matches('[data-step]')){event.preventDefault();changeView(button.dataset.step);}
    else if(button.matches('[data-choose-mode]'))changeView('modes');
    else if(button.matches('[data-mode]')){event.preventDefault();difficulty=DIFFICULTIES.find(d=>d.id===button.dataset.mode);hint=HINTS.find(h=>h.id===button.dataset.hints);answers.clear();changeView('practice',{difficulty:difficulty.id,hints:hint.id},true);}
    else if(button.matches('[data-play-line]'))void playLine(Number(button.dataset.playLine));
    else if(button.matches('[data-play-all]')){if(audio){if(audio.paused){try{await audio.play();}catch{status('請再按播放按鈕重試。');}}else audio.pause();sync();}else void playLine(0,true);}
    else if(button.matches('[data-stop-audio]'))stop();
    else if(button.matches('[data-pro-speed]')){rate=Number(button.dataset.proSpeed);if(audio)audio.playbackRate=rate;page.querySelectorAll('[data-pro-speed]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.proSpeed)===rate)));}
    else if(button.matches('[data-sync-highlight]')){highlight=!highlight;button.textContent=`同步標示 ${highlight?'ON':'OFF'}`;button.setAttribute('aria-pressed',String(highlight));sync();}
    else if(button.matches('[data-show-chinese]')){translations=!translations;button.textContent=`${translations?'隱藏':'顯示'}中文翻譯`;button.setAttribute('aria-pressed',String(translations));page.querySelectorAll('[data-chinese]').forEach(p=>p.hidden=!translations);}
    else if(button.matches('[data-copy-chinese]')){try{await navigator.clipboard.writeText(translationsText(dialogue));status('已複製這篇對話的全部中文翻譯。');}catch{const field=document.createElement('textarea');field.value=translationsText(dialogue);field.className='pro-copy-fallback';field.setAttribute('aria-label','全部中文翻譯，可全選複製');page.querySelector('.pro-playback').append(field);field.select();status('請全選並複製下方中文翻譯。');}}
    else if(button.matches('[data-check-answers]')){
      rememberAnswers();const inputs=[...page.querySelectorAll('[data-blank]')];let correct=0;const normalize=s=>s.toLowerCase().replace(/[’]/g,"'").replace(/[^a-z']/g,'');
      inputs.forEach(input=>{const passed=normalize(input.value)===normalize(input.dataset.answer);input.classList.toggle('is-correct',passed);input.classList.toggle('is-wrong',!passed);input.setAttribute('aria-invalid',String(!passed));if(passed)correct++;});
      const percent=Math.round(correct/inputs.length*100);page.querySelector('[data-result-status]').textContent=`${correct} / ${inputs.length} 題正確 · ${percent}%`;page.querySelector('[data-retry-mistakes]').hidden=correct===inputs.length;
      if(correct)document.dispatchEvent(new CustomEvent('professional-card-marked',{detail:{mark:'green'}}));
      try{const session=JSON.parse(localStorage.getItem('special-flash-session-v1')||'null');const key=`professional-dialogue:${session?.student?.id||session?.id||session?.name||'student'}:${dialogue.id}:${difficulty.id}:${hint.id}`;localStorage.setItem(key,JSON.stringify({correct,total:inputs.length,at:Date.now()}));}catch{}
    }
    else if(button.matches('[data-retry-mistakes]')){page.querySelectorAll('.pro-gap.is-wrong').forEach(input=>{input.value='';input.classList.remove('is-wrong');input.removeAttribute('aria-invalid');});page.querySelector('.pro-gap:not(.is-correct)')?.focus();page.querySelector('[data-result-status]').textContent='請再試一次，已答對的答案會保留。';}
    else if(button.matches('[data-page-theme]')){document.querySelector('[data-professional-theme-toggle]')?.click();button.textContent=document.documentElement.classList.contains('theme-day')?'☾ 夜間模式':'☀ 日間模式';}
  });
  window.addEventListener('pagehide',stop);
  window.addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);rememberAnswers();stop();view=['modes','practice'].includes(p.get('view'))?p.get('view'):'dialogue';difficulty=DIFFICULTIES.find(d=>d.id===p.get('difficulty'))||DIFFICULTIES[0];hint=HINTS.find(h=>h.id===p.get('hints'))||HINTS[3];render();});
  render();return {stop,page};
}

if (typeof document !== 'undefined' && document.body.dataset.professionalDialoguePage==='true') {
  let mounted=false;
  async function initialise(){
    // The existing course app authenticates the student before rendering this node.
    if(mounted||!document.querySelector('#root .course-section'))return;mounted=true;
    try{const response=await fetch('./dialogue-audio.json?v=20260911');if(!response.ok)throw Error('audio manifest');mountDialoguePage({dialogues:window.EDMUND_PROFESSIONAL_DIALOGUES,audioManifest:await response.json()});}
    catch{const note=document.createElement('p');note.className='pro-page-load-error';note.textContent='對話未能載入。';const retry=document.createElement('button');retry.textContent='重試';retry.onclick=()=>{mounted=false;note.remove();initialise();};note.append(retry);document.body.append(note);}
  }
  new MutationObserver(initialise).observe(document.getElementById('root'),{childList:true,subtree:true});initialise();
}
