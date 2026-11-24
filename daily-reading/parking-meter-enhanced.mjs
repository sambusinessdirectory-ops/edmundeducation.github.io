import { passage, translations, glossary, curation, precisionRows, questions } from './parking-meter-enhanced-data.mjs';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const sessionKey = 'edmund-daily-reading-session-v1';
const draftPrefix = 'edmund-daily-reading-parking-meter-v2:';
let authGeneration = 0;
let timerInterval = null;
let timerRunning = false;
let timerSeconds = 0;
let highlighterEnabled = false;
let highlighterColor = 'yellow';
let curationIndex = 0;
let curationActive = false;
const state = {user:null,token:'',scores:new Map(),fieldOrder:new Map()};
const views = Object.fromEntries($$('[data-view]').map(view => [view.dataset.view,view]));

const escapeHtml = value => String(value).replace(/[&<>"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[char]));
const shuffle = items => {
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  if(copy.length>1&&copy.every((item,index)=>item===items[index]))copy.push(copy.shift());
  return copy;
};
const normalize = value => String(value||'').toLowerCase().trim().replace(/[.,!?;:'’“”"()]/g,'').replace(/[-–—]/g,' ').replace(/\s+/g,' ');
const fieldKey = (q,field,index) => `q${q.id}-f${field.key||index}`;
const questionById = id => questions.find(q=>q.id===Number(id));

function formatTime(seconds){const safe=Math.max(0,Math.floor(seconds||0)),minutes=Math.floor(safe/60),remaining=safe%60;return `${String(minutes).padStart(2,'0')}:${String(remaining).padStart(2,'0')}`;}
function timerMode(){return $('[data-timer-mode]').value;}
function renderTimer(){
  $('[data-timer]').textContent=formatTime(timerSeconds);
  $('[data-timer-mode-label]').textContent=timerMode()==='countdown'?'40 分鐘倒數':'計時（選用）';
  const button=$('[data-timer-toggle]');button.textContent=timerRunning?'Ⅱ 暫停':'▶ 開始';button.classList.toggle('is-running',timerRunning);
}
function stopTimer(){timerRunning=false;if(timerInterval){clearInterval(timerInterval);timerInterval=null;}renderTimer();}
function resetTimer(){stopTimer();timerSeconds=timerMode()==='countdown'?40*60:0;renderTimer();}
function toggleTimer(){
  if(timerRunning){stopTimer();return;}
  if(timerMode()==='countdown'&&timerSeconds<=0)timerSeconds=40*60;
  timerRunning=true;renderTimer();timerInterval=setInterval(()=>{timerSeconds+=timerMode()==='countdown'?-1:1;if(timerMode()==='countdown'&&timerSeconds<=0){timerSeconds=0;stopTimer();return;}renderTimer();},1000);
}

function showView(name){
  Object.entries(views).forEach(([id,view])=>{view.hidden=id!==name;});
  const logged=Boolean(state.user&&state.token);
  $('[data-user]').hidden=!logged;$('[data-logout]').hidden=!logged;$('[data-library-home]').hidden=!logged||name==='library';
  if(logged)$('[data-user]').textContent=state.user.name;
}
async function rpc(name,args){
  const config=window.EDMUND_SUPABASE||{};if(!config.url||!config.anonKey)throw Error('登入服務暫時未能載入，請重新整理頁面。');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);let response;
  try{response=await fetch(`${config.url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:config.anonKey,'Content-Type':'application/json'},body:JSON.stringify(args),cache:'no-store',credentials:'omit',signal:controller.signal});}
  catch(error){if(error?.name==='AbortError')throw Error('登入服務回應逾時，請再試一次。');throw Error('登入服務暫時未能連接，請檢查網絡後重試。');}
  finally{clearTimeout(timeout);}
  const data=await response.json().catch(()=>null);if(!response.ok)throw Error(data?.message||'登入服務暫時未能連接。');return Array.isArray(data)?data[0]:data;
}
function remember(row,token){
  state.user={id:String(row.id||''),name:String(row.name||'Student'),role:'student'};state.token=String(token||row.session_token||'');
  try{sessionStorage.setItem(sessionKey,JSON.stringify({...state.user,token:state.token}));}catch{}
  try{window.EdmundSystemNav?.rememberStudentSession?.({...state.user,token:state.token});}catch{}
  $('[data-welcome]').textContent=`您好，${state.user.name}。今天的閱讀練習已準備好。`;
}
function forget(){authGeneration++;state.user=null;state.token='';try{sessionStorage.removeItem(sessionKey);}catch{}try{window.EdmundSystemNav?.forgetStudentSession?.();}catch{}showView('login');}
async function restore(){
  const generation=authGeneration;let shared=null,own=null;try{shared=window.EdmundSystemNav?.getStudentSession?.();}catch{}try{own=JSON.parse(sessionStorage.getItem(sessionKey)||'null');}catch{}
  const candidate=shared?.role==='student'?shared:own?.role==='student'?own:null;if(!candidate?.token)return false;
  const row=await rpc('flashcard_student_session_profile',{p_token:String(candidate.token)});if(generation!==authGeneration)return false;if(!row?.session_token||!row?.name)throw Error('登入時段已失效，請重新登入。');remember(row,row.session_token);showView('library');return true;
}

function translationVisible(){return $('[data-translation-toggle]')?.classList.contains('is-active');}
function translationHiddenAttribute(){return translationVisible()?'':' hidden';}
function questionPromptHtml(prompt){
  return String(prompt).split('\n').filter(Boolean).map(line=>/[\u3400-\u9fff]/u.test(line)
    ? `<span class="question-translation" lang="zh-Hant"${translationHiddenAttribute()}>${escapeHtml(line)}</span>`
    : `<span class="question-prompt-line">${escapeHtml(line)}</span>`).join('');
}
function optionHtml(option){
  const parts=String(option).split('／');
  if(parts.length<2)return `<span class="option-copy">${escapeHtml(option)}</span>`;
  return `<span class="option-copy"><span>${escapeHtml(parts.shift())}</span><span class="question-translation" lang="zh-Hant"${translationHiddenAttribute()}>${escapeHtml(parts.join('／'))}</span></span>`;
}
function renderPassage(highlight=''){
  const root=$('[data-passage]');root.replaceChildren();
  passage.forEach((text,index)=>{
    const block=document.createElement('section');block.className='passage-block';block.dataset.paragraph=String(index+1);
    const p=document.createElement('p');p.className='passage-paragraph';p.dataset.number=String(index+1);
    if(highlight&&text.includes(highlight)){const start=text.indexOf(highlight);p.innerHTML=`${escapeHtml(text.slice(0,start))}<mark class="curation-mark">${escapeHtml(highlight)}</mark>${escapeHtml(text.slice(start+highlight.length))}`;}else p.textContent=text;
    const zh=document.createElement('p');zh.className='passage-translation';zh.hidden=!translationVisible();zh.lang='zh-Hant';zh.textContent=translations[index];
    block.append(p,zh);root.append(block);
  });
}

function renderGlossary(){
  const rows=glossary.map(([paragraph,term,level,meaning])=>`<tr><td>${paragraph}</td><th scope="row">${escapeHtml(term)}</th><td><span>${escapeHtml(level)}</span></td><td>${escapeHtml(meaning)}</td></tr>`).join('');
  const html=`<details><summary><span>GLOSSARY · 詞彙表</span><small>${glossary.length} 個原文詞語</small></summary><div class="glossary-table-wrap"><table><thead><tr><th>段落</th><th>Vocabulary</th><th>級別</th><th>繁體中文</th></tr></thead><tbody>${rows}</tbody></table></div><p class="glossary-note">閱讀提醒：單詞的準確釋義須由上下文決定。<i>about</i>（約數）、<i>reported</i>（通報）、<i>approval</i>（審批）等，不能單憑字典第一個意思判斷。</p></details>`;
  $$('[data-glossary]').forEach(root=>root.innerHTML=html);
}

function fieldsFor(q){
  if(!q.shuffleFields)return q.fields.map((field,index)=>({field,index}));
  if(!state.fieldOrder.has(q.id))state.fieldOrder.set(q.id,shuffle(q.fields.map((_,index)=>index)));
  return state.fieldOrder.get(q.id).map(index=>({field:q.fields[index],index}));
}
function renderField(q,field,index){
  const name=fieldKey(q,field,index),label=field.label?`<label>${escapeHtml(field.label)}</label>`:'';
  if(field.type==='choice'||field.type==='multi'){
    const kind=field.type==='choice'?'radio':'checkbox';
    return `<div class="field-block">${label}<div class="option-list">${field.options.map((option,i)=>`<label class="option"><input type="${kind}" name="${name}" value="${i}"><span class="option-letter">${'ABCDE'[i]}.</span>${optionHtml(option)}</label>`).join('')}</div></div>`;
  }
  if(field.type==='select')return `<div class="field-row">${label}<select name="${name}"><option value="">請選擇</option>${field.options.map(option=>`<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join('')}</select></div>`;
  if(field.type==='textarea')return `<div class="field-block">${label}<textarea class="open-answer" name="${name}" placeholder="在此作答"></textarea></div>`;
  return `<div class="field-row">${label}<input name="${name}" type="text" autocomplete="off" placeholder="輸入答案"></div>`;
}
function renderQuestions(){
  const root=$('[data-questions]');root.replaceChildren();let lastSection='';
  for(const q of questions){
    if(q.section!==lastSection){const heading=document.createElement('h3');heading.className='section-heading';heading.textContent=q.section;root.append(heading);lastSection=q.section;}
    const card=document.createElement('article');card.className='question-card';card.id=`question-${q.id}`;card.dataset.question=String(q.id);
    card.innerHTML=`<div class="question-meta"><span>QUESTION ${String(q.id).padStart(2,'0')}</span><span>${q.marks} MARK${q.marks>1?'S':''}</span></div><p class="question-prompt">${questionPromptHtml(q.prompt)}</p><div class="field-list">${fieldsFor(q).map(({field,index})=>renderField(q,field,index)).join('')}</div><div class="question-actions"><button type="button" class="reveal-answer-button" aria-expanded="false">顯示答案及解析</button></div><div class="question-feedback" hidden><strong>參考答案：${escapeHtml(q.sample)}</strong><p>${escapeHtml(q.why)}</p><span class="question-feedback-score"></span></div>`;
    card.querySelector('.reveal-answer-button').onclick=event=>{
      const feedback=card.querySelector('.question-feedback'),open=feedback.hidden;feedback.hidden=!open;event.currentTarget.setAttribute('aria-expanded',String(open));event.currentTarget.textContent=open?'隱藏答案及解析':'顯示答案及解析';
      if(open){const complete=questionComplete(q,card),score=complete?scoreQuestion(q,card):null;card.querySelector('.question-feedback-score').textContent=complete?`本題得分：${score} / ${q.marks}`:'本題尚未完成；以下答案供你核對。';saveDraft();updateProgress();}
    };
    card.querySelectorAll('input,textarea,select').forEach(control=>{for(const event of ['input','change'])control.addEventListener(event,()=>{card.classList.remove('has-missing');saveDraft();updateProgress();});});root.append(card);
  }
}

function controlValue(q,field,index,card){
  const name=fieldKey(q,field,index);
  if(field.type==='choice')return card.querySelector(`input[name="${name}"]:checked`)?.value||'';
  if(field.type==='multi')return [...card.querySelectorAll(`input[name="${name}"]:checked`)].map(input=>input.value);
  return card.querySelector(`[name="${name}"]`)?.value||'';
}
function fieldComplete(field,value){return field.type==='multi'?value.length===(field.max||field.answer.length):normalize(value)!=='';}
function questionComplete(q,card){return q.fields.every((field,index)=>fieldComplete(field,controlValue(q,field,index,card)));}
function fieldScore(field,value){
  const marks=field.marks??1;
  if(field.type==='multi'){if(value.length!==(field.max||field.answer.length))return 0;return value.filter(item=>field.answer.includes(item)).length*(marks/field.answer.length);}
  if(field.answerAny)return field.answerAny.some(answer=>normalize(value)===normalize(answer))?marks:0;
  if(field.answer!==undefined)return normalize(value)===normalize(field.answer)?marks:0;
  if(field.accept)return field.accept.some(answer=>normalize(value)===normalize(answer))?marks:0;
  if(field.keywords){const text=normalize(value);return field.keywords.every(group=>group.some(word=>text.includes(normalize(word))))?marks:0;}
  return 0;
}
function scoreQuestion(q,card){return Math.round(q.fields.reduce((score,field,index)=>score+fieldScore(field,controlValue(q,field,index,card)),0)*100)/100;}
function updateProgress(){
  const complete=questions.filter(q=>{const card=$(`[data-question="${q.id}"]`);return card&&questionComplete(q,card);}).length;
  $('[data-score]').textContent='—';$('[data-progress-text]').textContent=`已完成 ${complete} / ${questions.length} 題`;$('[data-progress-bar]').style.width=`${complete/questions.length*100}%`;
}
function draftKey(){return draftPrefix+(state.user?.id||'student');}
function saveDraft(){
  if(!state.user)return;const values={};$$('[data-question]').forEach(card=>{const q=questionById(card.dataset.question);q.fields.forEach((field,index)=>{values[fieldKey(q,field,index)]=controlValue(q,field,index,card);});});
  try{localStorage.setItem(draftKey(),JSON.stringify({values}));}catch{}
}
function restoreDraft(){
  let draft=null;try{draft=JSON.parse(localStorage.getItem(draftKey())||'null');}catch{}if(!draft)return;
  for(const [name,value] of Object.entries(draft.values||{})){const controls=$$(`[name="${CSS.escape(name)}"]`);if(Array.isArray(value))controls.forEach(control=>{control.checked=value.includes(control.value);});else if(controls[0]?.type==='radio')controls.forEach(control=>{control.checked=control.value===value;});else if(controls[0])controls[0].value=value;}
  updateProgress();
}
function resetDraft(){
  if(!confirm('確定清除本篇所有答案？'))return;
  try{localStorage.removeItem(draftKey());}catch{}state.scores.clear();state.fieldOrder.clear();renderQuestions();updateProgress();$('[data-submission-alert]').hidden=true;$('.questions-panel').scrollTo({top:0,behavior:'smooth'});
}

function answerDisplay(q,field,index,card){
  const value=controlValue(q,field,index,card);
  if(Array.isArray(value))return value.map(item=>'ABCDE'[Number(item)]||item).join(', ')||'—';
  if(field.type==='choice')return value===''?'—':`${'ABCDE'[Number(value)]}. ${field.options[Number(value)]}`;
  return String(value||'—');
}
function renderReview(total){
  $('[data-review-score]').textContent=`${state.user?.name||'Student'}：${total} / 40 分。以下列出全部題目、你的答案、參考答案及精準解析。`;
  $('[data-review-list]').innerHTML=questions.map(q=>{const card=$(`[data-question="${q.id}"]`),score=state.scores.get(q.id)||0;const student=q.fields.map((field,index)=>`${field.label?`${field.label} `:''}${answerDisplay(q,field,index,card)}`).join('　');return `<article class="review-card ${score===q.marks?'is-correct':score>0?'is-partial':'is-wrong'}"><div class="question-meta"><span>QUESTION ${String(q.id).padStart(2,'0')}</span><span>${score} / ${q.marks}</span></div><p class="review-prompt">${escapeHtml(q.prompt)}</p><dl><div><dt>你的答案</dt><dd>${escapeHtml(student)}</dd></div><div><dt>參考答案</dt><dd>${escapeHtml(q.sample)}</dd></div><div><dt>解析</dt><dd>${escapeHtml(q.why)}</dd></div></dl></article>`;}).join('');
}
function finish(){
  const firstMissing=questions.find(q=>!questionComplete(q,$(`[data-question="${q.id}"]`)));
  if(firstMissing){
    const card=$(`[data-question="${firstMissing.id}"]`),alert=$('[data-submission-alert]');alert.hidden=false;alert.textContent=`尚有題目未完成。已為你前往第 ${firstMissing.id} 題。`;card.classList.add('has-missing');card.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>card.querySelector('input:not(:checked), textarea, select')?.focus({preventScroll:true}),450);return;
  }
  $('[data-submission-alert]').hidden=true;state.scores.clear();let total=0;
  questions.forEach(q=>{const card=$(`[data-question="${q.id}"]`),score=scoreQuestion(q,card);state.scores.set(q.id,score);total+=score;});
  renderReview(total);stopTimer();showView('review');window.scrollTo({top:0,behavior:'smooth'});
}

function renderCuration(){
  const item=curation[curationIndex];renderPassage(item.highlight);
  const precision=precisionRows.map(row=>`<tr><td><i>${escapeHtml(row[0])}</i></td><td><i>${escapeHtml(row[1])}</i></td><td>${escapeHtml(row[2])}</td><td>${escapeHtml(row[3])}</td></tr>`).join('');
  $('[data-curation-panel]').innerHTML=`<details class="curation-method"><summary>本模式的完整教學方法</summary><p>先看完整原句 → 抽取可學語塊 → 分清形式與語意 → 說明新聞文體中的作用 → 提供可遷移句型 → 講清使用限制。這是把句式分析框架應用於這篇新的新聞文本，並非聲稱框架來源曾討論停車收費錶事件。</p><p><strong>學生版建議用法：</strong>先學每個項目的「句型＋功能＋新例句＋一個注意點」；詳細語法說明可按程度取用。不應為使用「高階句式」而加入不必要的長句。</p></details><div class="curation-progress"><span>${item.id} · 第 ${item.paragraph} 段</span><strong>${curationIndex+1} / ${curation.length}</strong></div><h2>${escapeHtml(item.title)}</h2><blockquote><b>原文</b>${escapeHtml(item.source)}</blockquote><div class="curation-translation"><b>繁體中文</b><p>${escapeHtml(item.translation)}</p></div><div class="curation-details"><section><h3>形式與語意</h3><p>${escapeHtml(item.form)}</p></section><section><h3>本文作用</h3><p>${escapeHtml(item.role)}</p></section><section><h3>可遷移句型</h3><p><strong>${escapeHtml(item.pattern)}</strong></p></section><section><h3>新例句（假設情境）</h3><p>${escapeHtml(item.example)}</p></section><section class="curation-note"><h3>注意</h3><p>${escapeHtml(item.note)}</p></section></div><details class="precision-table"><summary>句式精準對照：不可混為一談</summary><div><table><thead><tr><th>用語</th><th>不可等同</th><th>正確分別</th><th>本文例子</th></tr></thead><tbody>${precision}</tbody></table></div></details><div class="curation-nav"><button type="button" data-curation-prev ${curationIndex===0?'disabled':''}>← 上一步</button><button type="button" data-curation-exit>退出句式精讀</button><button type="button" data-curation-next ${curationIndex===curation.length-1?'disabled':''}>下一步 →</button></div>`;
  $('[data-curation-prev]').onclick=()=>{if(curationIndex>0){curationIndex--;renderCuration();}};$('[data-curation-next]').onclick=()=>{if(curationIndex<curation.length-1){curationIndex++;renderCuration();}};$('[data-curation-exit]').onclick=toggleCuration;
  $(`[data-paragraph="${item.paragraph}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});
}
function toggleCuration(){
  curationActive=!curationActive;const button=$('[data-curation-toggle]');button.setAttribute('aria-pressed',String(curationActive));button.classList.toggle('is-active',curationActive);button.textContent=curationActive?'退出句式精讀':'句式精讀';
  $('[data-questions-view]').hidden=curationActive;$('[data-curation-panel]').hidden=!curationActive;$('[data-finish]').hidden=curationActive;
  if(curationActive){curationIndex=0;clearHighlights();renderCuration();}else renderPassage();
}

function clearHighlights(){$$('mark.user-highlight').forEach(mark=>mark.replaceWith(document.createTextNode(mark.textContent)));$('[data-passage]').normalize();}
function addSelectionHighlight(){
  if(!highlighterEnabled||curationActive)return;const selection=window.getSelection();if(!selection||selection.isCollapsed||!selection.rangeCount)return;const range=selection.getRangeAt(0),root=$('[data-passage]');if(!root.contains(range.commonAncestorContainer))return;
  try{const mark=document.createElement('mark');mark.className='user-highlight';mark.dataset.highlightColor=highlighterColor;range.surroundContents(mark);}catch{const fragment=range.extractContents(),mark=document.createElement('mark');mark.className='user-highlight';mark.dataset.highlightColor=highlighterColor;mark.append(fragment);range.insertNode(mark);}selection.removeAllRanges();
}
function toggleHighlighter(){highlighterEnabled=!highlighterEnabled;const button=$('[data-highlighter-toggle]');button.setAttribute('aria-pressed',String(highlighterEnabled));button.classList.toggle('is-active',highlighterEnabled);button.textContent=`螢光筆：${highlighterEnabled?'開':'關'}`;$('[data-highlighter-help]').hidden=!highlighterEnabled;}
function selectHighlighterColor(button){
  highlighterColor=button.dataset.highlighterColor;
  $$('[data-highlighter-color]').forEach(choice=>choice.setAttribute('aria-pressed',String(choice===button)));
  if(!highlighterEnabled)toggleHighlighter();
  $('[data-highlighter-help]').textContent=`已選擇${button.title}螢光筆。拖曳選取文章文字即可標記。`;
}

function setupAudio(){
  const audio=$('[data-passage-audio]'),toggle=$('[data-audio-toggle]'),seek=$('[data-audio-seek]'),time=$('[data-audio-time]');
  const render=()=>{const duration=Number.isFinite(audio.duration)?audio.duration:0;time.textContent=`${formatTime(audio.currentTime)} / ${formatTime(duration)}`;seek.value=duration?String(Math.round(audio.currentTime/duration*1000)):'0';toggle.textContent=audio.paused?'▶ 聆聽文章':'Ⅱ 暫停聆聽';};
  toggle.onclick=()=>audio.paused?audio.play().catch(()=>{time.textContent='音訊暫時未能播放';}):audio.pause();$('[data-audio-back]').onclick=()=>{audio.currentTime=Math.max(0,audio.currentTime-5);};$('[data-audio-rate]').onchange=event=>{audio.playbackRate=Number(event.target.value)||1;};seek.oninput=()=>{if(Number.isFinite(audio.duration))audio.currentTime=Number(seek.value)/1000*audio.duration;};['loadedmetadata','timeupdate','play','pause','ended'].forEach(event=>audio.addEventListener(event,render));audio.addEventListener('error',()=>{time.textContent='音訊載入失敗，請重新整理';});render();
}

renderPassage();renderQuestions();renderGlossary();updateProgress();setupAudio();
$('[data-passage]').addEventListener('mouseup',addSelectionHighlight);$('[data-passage]').addEventListener('touchend',()=>setTimeout(addSelectionHighlight,0));
$('[data-translation-toggle]').onclick=event=>{const active=!event.currentTarget.classList.contains('is-active');event.currentTarget.classList.toggle('is-active',active);event.currentTarget.setAttribute('aria-pressed',String(active));event.currentTarget.textContent=active?'隱藏中文':'中英對照';$$('.passage-translation,.question-translation').forEach(node=>node.hidden=!active);};
$('[data-highlighter-toggle]').onclick=toggleHighlighter;$('[data-clear-highlights]').onclick=clearHighlights;$('[data-curation-toggle]').onclick=toggleCuration;
$$('[data-highlighter-color]').forEach(button=>button.onclick=()=>selectHighlighterColor(button));

$('[data-login-form]').onsubmit=async event=>{
  event.preventDefault();const form=event.currentTarget,status=$('[data-login-status]'),button=$('[data-login-button]'),values=new FormData(form),username=String(values.get('username')||'').trim(),password=String(values.get('password')||'');
  if(!username||!password){status.textContent='請輸入學生帳戶名稱及密碼。';form.dataset.loginFeedback='error';return;}
  const generation=++authGeneration,originalLabel=button.textContent;status.textContent='正在驗證學生帳戶…';form.dataset.loginFeedback='pending';form.setAttribute('aria-busy','true');button.disabled=true;button.textContent='正在登入…';
  try{const row=await rpc('flashcard_student_login',{p_name:username,p_password:password});if(generation!==authGeneration)return;if(!row?.session_token)throw Error('學生帳戶或密碼不正確。');remember(row,row.session_token);form.reset();status.textContent='登入成功，正在開啟文章目錄…';form.dataset.loginFeedback='complete';showView('library');}
  catch(error){if(generation===authGeneration){status.textContent=error?.message||'登入失敗，請再試一次。';form.dataset.loginFeedback='error';}}
  finally{if(generation===authGeneration){form.removeAttribute('aria-busy');button.disabled=false;button.textContent=originalLabel;}}
};
$('[data-password-toggle]').onclick=event=>{const input=$('[name="password"]'),show=input.type==='password';input.type=show?'text':'password';event.currentTarget.textContent=show?'隱藏':'顯示';event.currentTarget.setAttribute('aria-pressed',String(show));};
$('[data-open-article]').onclick=()=>{showView('exercise');restoreDraft();window.scrollTo({top:0,behavior:'smooth'});};
$('[data-back]').onclick=$('[data-library-home]').onclick=()=>{stopTimer();showView('library');window.scrollTo({top:0,behavior:'smooth'});};
$('[data-review-back]').onclick=()=>{showView('exercise');window.scrollTo({top:0,behavior:'smooth'});};$('[data-review-library]').onclick=()=>{showView('library');window.scrollTo({top:0,behavior:'smooth'});};
$('[data-timer-toggle]').onclick=toggleTimer;$('[data-timer-mode]').onchange=resetTimer;resetTimer();$('[data-logout]').onclick=forget;$('[data-reset]').onclick=resetDraft;$('[data-finish]').onclick=finish;
restore().catch(error=>{forget();$('[data-login-status]').textContent=error?.message||'登入時段已失效，請重新登入。';$('[data-login-form]').dataset.loginFeedback='error';});
