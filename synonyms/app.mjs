import { importantModule } from './important-data.mjs?v=20260928-important1';
import { socialMediaModule } from './social-media-data.mjs?v=20260929-social1';
import { lessons } from './lessons-data.mjs?v=20260930-lessons1';
import { socialMediaAudio } from './social-media-audio.mjs?v=20260929-social1';
import { synonymAudio } from './audio-manifest.mjs?v=20260928-four-voices1';
import { guideAudio } from './guide-audio.mjs?v=20260928-guide1';
import { detailedFeedback } from './detailed-feedback.mjs?v=20260928-feedback1';
import {mountRecorder,allRecordings,recordingBlob,uploadRecording} from './recordings.mjs?v=20260928-recordings1';

const modules = {important:importantModule,'social-media':socialMediaModule,...Object.fromEntries(lessons.map(item=>[item.id,item]))};
const voices = ['american-female', 'american-male', 'british-male', 'british-female'];
let moduleId = 'important', moduleData = importantModule, words = moduleData.words;
const makeQuestions = (id,items) => items.flatMap((word, wi) => word.exercises.map((exercise, ei) => ({id: `${id === 'important' ? '' : id === 'social-media' ? 'social-' : id + '-'}${wi + 1}-${ei + 1}`, wi, ei, word, exercise, voice: voices[(wi * 2 + ei) % 4]})));
let questions = makeQuestions(moduleId,words), byId = new Map(questions.map(question => [question.id, question])), total = questions.length;
const dashboard = document.querySelector('[data-view="dashboard"]');
dashboard?.querySelector('.learning-portal-empty')?.remove();
const host = document.createElement('section');
host.className = 'syn-app';
host.setAttribute('aria-label', 'Synonyms 同義詞學習系統');
dashboard?.append(host);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon = name => '<img class="syn-icon" src="/synonyms/icons/'+name+'.svg" alt="" aria-hidden="true">';
const importantFalseSynonyms = [
  {word:'famous / popular',type:'名氣不等於重要',point:'A famous or popular person may attract attention. A prominent person has a notable public position; an influential person changes what others think or do.',zh:'「有名」或「受歡迎」不一定表示地位突出，更不一定有影響力。'},
  {word:'impressive',type:'令人佩服不等於重大',point:'An impressive result catches your eye. A major change is large in scale; a significant change has a meaningful effect.',zh:'「令人印象深刻」說的是觀感，不等於規模大或影響深。'},
  {word:'interesting',type:'有趣不等於重要',point:'An interesting idea holds attention. A key idea matters to the result; a fundamental idea supports the whole argument.',zh:'「有趣」不能代替「關鍵」或「基礎」。'},
  {word:'obvious',type:'明顯不等於關鍵',point:'An obvious fact is easy to notice. A key factor is central to an outcome.',zh:'看得出來，不代表它是決定結果的因素。'},
  {word:'rare',type:'少見不等於轉折',point:'A rare event does not happen often. A pivotal event changes what happens next.',zh:'罕見的事未必是轉折點。'},
  {word:'successful',type:'成功不等於顯赫',point:'A successful scientist may achieve good results. A prominent scientist is well known and holds a notable position.',zh:'有成就與地位突出是兩個不同的意思。'},
  {word:'significance / importance / influence',type:'詞性陷阱',point:'These can be nouns. This exercise needs an adjective before increase, member, or voice: significant, important, or influential.',zh:'先檢查空格需要形容詞還是名詞。'},
  {word:'consequence / consequential',type:'字形相近，詞性不同',point:'A consequence is a result. A consequential decision is one with important, lasting effects.',zh:'「後果」是名詞；「後果重大的」才是形容詞。'}
];
const audio = new Audio();
const cloudAudio = new Map();
let audioTicket = 0, activeAudioStatus = null;
let owner = null, token = null, progress = {answers:{},order:[],cursor:0};
let view = 'home', choice = null, streak = 0, saveState = 'loading', localAvailable = true;
const moduleStates = new Map();
let falseSynonyms = importantFalseSynonyms;
let recorderDispose = null, recordingsEpoch = 0;
const recordingUrls = [];
const recordingItems = new Map();
let pending = new Map();
const progressKey = (id=moduleId) => `edmund-synonyms-${id}-v1:${owner}`;
const blankProgress = () => ({answers:{},order:[],cursor:0});
function selectModule(id) {
  if (!modules[id] || id === moduleId) return;
  moduleStates.set(moduleId,{progress,pending,saveState,localAvailable,streak});
  stopVoice(); moduleId=id;moduleData=modules[id];words=moduleData.words;questions=makeQuestions(id,words);byId=new Map(questions.map(q=>[q.id,q]));total=questions.length;falseSynonyms=id==='important'?importantFalseSynonyms:moduleData.falseSynonyms;
  const state=moduleStates.get(id);
  if (state) ({progress,pending,saveState,localAvailable,streak}=state);
  else {progress=blankProgress();pending=new Map();streak=0;readLocal();saveState='loading';}
  choice=null;
  if(owner&&token)void loadAccount();
}
function moduleProgress(id) {
  if(id===moduleId)return progress;
  if(moduleStates.has(id))return moduleStates.get(id).progress;
  try{return JSON.parse(localStorage.getItem(progressKey(id))||'null')||blankProgress();}catch{return blankProgress();}
}
const current = () => byId.get(progress.order?.[progress.cursor]) || null;
const record = id => progress.answers[id] || null;
const attempted = () => questions.filter(q => (record(q.id)?.attempts || 0) > 0).length;
const mastered = () => questions.filter(q => record(q.id)?.mastered).length;
function saveLocal() {
  try { localStorage.setItem(progressKey(), JSON.stringify(progress)); localAvailable = true; }
  catch { localAvailable = false; }
}
function readLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(progressKey()) || 'null');
    progress = saved?.answers && typeof saved.answers === 'object' ? {...saved,order:Array.isArray(saved.order)?saved.order:[],cursor:Number(saved.cursor)||0} : {answers:{},order:[],cursor:0};
    localAvailable = true;
  } catch { progress = {answers:{},order:[],cursor:0}; localAvailable = false; }
}
function updateSaveBadge() {
  const badge = host.querySelector('[data-save-state]');
  if (!badge) return;
  const labels = {
    loading:'正在讀取帳戶進度…',saving:'正在儲存到帳戶…',saved:'已儲存到學生帳戶',
    offline:localAvailable?'連線中斷；進度已保留在此裝置':'未能儲存；請保持頁面開啟並重試'
  };
  badge.textContent = labels[saveState];
  badge.dataset.state = saveState;
  const retry = host.querySelector('[data-retry-save]');
  if (retry) retry.hidden = saveState !== 'offline';
}
function mergeServer(rows) {
  const server = new Map((rows || []).map(row => [row.question_key,row]));
  for (const [id,row] of server) {
    if (!byId.has(id)) continue;
    const local = record(id);
    const remote = {attempts:Number(row.attempts)||1,mastered:row.mastered===true,lastChoice:row.last_choice,lastCorrect:row.last_correct===true,answeredAt:row.updated_at};
    progress.answers[id] = local && local.attempts > remote.attempts ? {...local,mastered:local.mastered||remote.mastered} : {...remote,mastered:Boolean(local?.mastered||remote.mastered)};
    if (local && (local.attempts > remote.attempts || (local.mastered && !remote.mastered))) pending.set(id,progress.answers[id]);
  }
  for (const [id,local] of Object.entries(progress.answers)) if (byId.has(id) && !server.has(id) && local.attempts > 0) pending.set(id,local);
  if (!Array.isArray(progress.order) || !progress.order.length || !progress.order.every(id=>byId.has(id))) {
    progress.order = newOrder();
    progress.cursor = Math.max(0,progress.order.findIndex(id=>!progress.answers[id]?.attempts));
    if (progress.order.every(id=>progress.answers[id]?.attempts)) progress.cursor=total;
  }
  saveLocal();
}
async function loadAccount() {
  if (!owner || !token) return;
  const expected = owner, expectedModule=moduleId;
  saveState = 'loading'; updateSaveBadge();
  try {
    const rows = await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc('synonyms_important_list',{p_token:token});
    if (owner !== expected || moduleId !== expectedModule) return;
    mergeServer(rows);
    saveState = pending.size ? 'saving' : 'saved'; updateSaveBadge();
    if (pending.size) void syncPending();
    render();
  } catch {
    if (owner !== expected || moduleId !== expectedModule) return;
    saveState = 'offline'; updateSaveBadge(); render();
  }
}
async function syncPending() {
  if (!owner || !token || !pending.size) return;
  const expected=owner, target=pending, targetModule=moduleId;
  if(target.syncing)return;
  target.syncing=true;saveState='saving';updateSaveBadge();
  try {
    while(target.size && owner===expected) {
      const [id,item]=target.entries().next().value;
      await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc('synonyms_important_record',{
        p_token:token,p_question_key:id,p_attempts:item.attempts,p_mastered:Boolean(item.mastered),
        p_last_choice:item.lastChoice,p_last_correct:Boolean(item.lastCorrect)
      });
      if(target.get(id)?.attempts===item.attempts)target.delete(id);
    }
    if(owner===expected && moduleId===targetModule)saveState='saved';
  } catch {if(owner===expected && moduleId===targetModule)saveState='offline';}
  target.syncing=false;
  if(moduleId===targetModule)updateSaveBadge();
}
function randomNumber(max) {
  if (globalThis.crypto?.getRandomValues) {
    const value = new Uint32Array(1); crypto.getRandomValues(value); return value[0] % max;
  }
  return Math.floor(Math.random()*max);
}
function shuffle(items) {
  const result = [...items];
  for (let i=result.length-1;i>0;i--) { const j=randomNumber(i+1); [result[i],result[j]]=[result[j],result[i]]; }
  return result;
}
function newOrder() {
  for (let attempt=0;attempt<300;attempt++) {
    const sequence=shuffle(questions);
    if (sequence.every((q,i) => !i || q.wi !== sequence[i-1].wi)) return sequence.map(q=>q.id);
  }
  return questions.map(q=>q.id);
}
function go(next) {
  recorderDispose?.(); recorderDispose=null;
  recordingsEpoch++;
  for(const url of recordingUrls.splice(0))URL.revokeObjectURL(url);
  recordingItems.clear();
  view = next;
  if (next !== 'question') { choice = null; stopVoice(); }
  const hash = moduleId === 'important' ? (next === 'false' ? 'false-synonyms' : next) : `${moduleId}:${next}`;
  history.pushState({synonymsView:next},'',`#${hash}`);
  render();
  host.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}
function beginRound(fresh=false) {
  if (fresh || !Array.isArray(progress.order) || progress.order.length < total || progress.cursor >= progress.order.length || !progress.order.every(id=>byId.has(id))) {
    progress.order = newOrder(); progress.cursor = 0; saveLocal();
  }
  choice = null; go('question');
}
function answer(letter) {
  const q = current();
  if (view !== 'question' || choice || !q) return;
  const option = q.exercise.options.find(o=>o.letter===letter);
  if (!option) return;
  choice = letter;
  const correct = option.text === q.exercise.answer;
  const old = record(q.id) || {attempts:0,mastered:false};
  progress.answers[q.id] = {attempts:Math.min(10000,old.attempts+1),mastered:Boolean(old.mastered||correct),lastChoice:letter,lastCorrect:correct,answeredAt:new Date().toISOString()};
  if(!correct){
    const remaining=progress.order.length-progress.cursor-1;
    if(remaining<4){
      const filler=shuffle(questions.filter(item=>item.id!==q.id)).slice(0,4-remaining).map(item=>item.id);
      progress.order.push(...filler);
    }
    const at=Math.min(progress.order.length,progress.cursor+5+randomNumber(3));
    progress.order.splice(at,0,q.id);
  }
  pending.set(q.id,progress.answers[q.id]);
  streak = correct ? streak+1 : 0;
  saveLocal();
  saveState = 'saving';
  window.EdmundAnswerSound?.play(correct);
  render(); void syncPending();
  if (correct) {host.classList.remove('syn-celebrate');void host.offsetWidth;host.classList.add('syn-celebrate');setTimeout(()=>host.classList.remove('syn-celebrate'),900);}
  host.querySelector('.syn-feedback')?.focus({preventScroll:true});
}
function nextQuestion() {
  if (view !== 'question' || !choice) return;
  progress.cursor = Math.min(progress.order.length,progress.cursor+1); choice = null; saveLocal();
  if (progress.cursor >= progress.order.length) go('finish'); else {stopVoice();render();host.scrollIntoView({behavior:'smooth',block:'start'});}
}
function stopVoice() { audioTicket++; audio.pause(); audio.removeAttribute('src'); if(activeAudioStatus?.isConnected)activeAudioStatus.textContent='';activeAudioStatus=null; }
async function playClip(item,cacheKey,status) {
  if(!item || !token)return;
  stopVoice();
  const ticket=audioTicket, expected=owner;
  activeAudioStatus=status;
  if (status) status.textContent='正在載入音訊…';
  try {
    let url=item.path?new URL('./'+item.path,import.meta.url).href:cloudAudio.get(cacheKey);
    if (!url) {
      const response=await fetch('https://edmund-speaking-system.edmundeducation.workers.dev/v1/learning-voice',{
        method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
        body:JSON.stringify({text:item.text}),signal:AbortSignal.timeout(30000)
      });
      if (!response.ok) throw Error('Voice unavailable');
      const blob=await response.blob();if (!blob.size || !blob.type.startsWith('audio/')) throw Error('Invalid audio');
      url=URL.createObjectURL(blob);cloudAudio.set(cacheKey,url);
    }
    if (ticket!==audioTicket || owner!==expected) return;
    audio.src=url;audio.playbackRate=1;
    audio.onended=()=>{if(ticket===audioTicket && status?.isConnected)status.textContent='播放完畢';};
    await audio.play();if(ticket===audioTicket && status?.isConnected)status.textContent='正在播放';
  } catch { if(ticket===audioTicket && status?.isConnected)status.textContent='未能播放，請再按一次。'; }
}
function playVoice() {
  const q=current();if(!q)return;
  const clip=moduleId==='important'?synonymAudio[q.id]:moduleId==='social-media'?socialMediaAudio.exercises[q.id]:{text:q.exercise.original};
  return playClip(clip,q.id,host.querySelector('[data-audio-status]'));
}
function playGuideAudio(kind,index,button) {
  const status=button.parentElement.querySelector('[data-guide-audio-status]');
  const path=(moduleId==='important'?guideAudio:moduleId==='social-media'?socialMediaAudio.guide:{})[String(index)]?.[kind];
  const word=words[Number(index)-1];
  const clip=path?{path}:{text:kind==='word'?word?.word:word?.example||word?.exercises[0]?.upgrade};
  return playClip(clip,moduleId+':guide:'+index+':'+kind,status);
}
function stats() {
  return '<div class="syn-stats" aria-label="練習進度"><span><strong>'+attempted()+'</strong><small>/ '+total+' 已作答</small></span><span><strong>'+mastered()+'</strong><small>已掌握</small></span><span><strong>'+streak+'</strong><small>連續答對</small></span></div>';
}
function shell(content) {
  recorderDispose?.();recorderDispose=null;
  host.innerHTML='<div class="syn-ambient" aria-hidden="true"><i></i><i></i><i></i></div>'+
    '<nav class="syn-global-nav" aria-label="Synonyms 導覽"><button type="button" data-go="home">系統首頁</button><button type="button" data-go="module">'+esc(moduleData.title)+'</button><button type="button" data-go="guide">同義詞指南</button><button type="button" data-go="false">False synonyms</button><button type="button" class="syn-practice-link" data-begin>'+icon('spark')+'開始練習</button><button type="button" data-go="recordings">我的錄音</button></nav>'+
    '<header class="syn-heading"><div><p class="syn-kicker">SYNONYMS · 同義詞學習系統</p><h2>同義詞學習系統</h2><p>從語境理解字詞，選擇更精準的表達。</p></div>'+stats()+'</header>'+
    '<div class="syn-progress" role="progressbar" aria-label="已作答題目" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+attempted()+'"><span style="width:'+(attempted()/total*100)+'%"></span></div>'+
    '<div class="syn-save-row" role="status" aria-live="polite"><span data-save-state></span><button type="button" data-retry-save hidden>重試儲存</button></div>'+content;
  updateSaveBadge();
}
function renderHome() {
  const cards=Object.entries(modules).map(([id,data],index)=>{
    const saved=moduleProgress(id), prefix=id==='important'?'':id==='social-media'?'social-':id+'-';
    const count=Object.keys(saved.answers||{}).filter(key=>key.startsWith(prefix) && (saved.answers[key]?.attempts||0)>0).length;
    return '<button class="syn-module-card" type="button" data-module="'+id+'" data-search="'+esc((data.title+' '+(data.headword||'')).toLowerCase())+'"><span class="syn-module-index">'+String(index+1).padStart(2,'0')+' / SYNONYM EXPANSION</span><strong>'+esc(data.title)+'</strong><small>'+data.words.length+' 個更精準的詞組 · '+data.words.reduce((n,w)=>n+w.exercises.length,0)+' 道選擇題</small><span class="syn-module-progress">已作答 '+count+' / '+data.words.reduce((n,w)=>n+w.exercises.length,0)+' 題</span></button>';
  }).join('');
  shell('<section class="syn-home syn-enter"><p class="syn-kicker">YOUR LEARNING LIBRARY</p><h3>選擇學習模組</h3><p>按常用程度排列。每個模組先認識詞義，再以語境練習運用。</p><label class="syn-search-label">搜尋詞語 <input type="search" data-module-search placeholder="例如 agree、ability、age"></label><div class="syn-module-grid">'+cards+'</div></section>');
}
function renderAudit(data) {
  if(!data)return '';
  const table=data.headers?.length?'<div class="syn-audit-table"><table><thead><tr>'+data.headers.map(cell=>'<th>'+esc(cell)+'</th>').join('')+'</tr></thead><tbody>'+data.rows.map(row=>'<tr>'+row.map(cell=>'<td>'+esc(cell)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>':'';
  return table+(data.note?'<p>'+esc(data.note)+'</p>':'');
}
function renderModule() {
  const number=moduleData.moduleNumber|| (moduleId==='important'?1:2);
  shell('<section class="syn-module-front syn-enter"><div class="syn-module-hero"><p class="syn-kicker">MODULE '+String(number).padStart(2,'0')+' · '+esc(moduleData.title.toUpperCase())+'</p><h3>'+esc(moduleData.subtitle||moduleData.title)+'</h3><p>'+esc(moduleData.description||'先看同義詞指南，再練習選出語境最貼切的表達。')+'</p><div class="syn-module-actions"><button class="syn-primary" type="button" data-go="guide">先看 '+words.length+' 個詞組 →</button><button class="syn-secondary" type="button" data-go="false">認識 False synonyms</button></div></div><div class="syn-module-aside"><strong>'+mastered()+' / '+total+'</strong><span>題已掌握</span><small>開始練習前，先閱讀同義詞指南。</small></div></section>'+(moduleData.sourceMap?'<details class="syn-audit"><summary>查看原始候選詞核對</summary>'+renderAudit(moduleData.sourceMap)+'</details>':''));
}
function renderGuide() {
  const cards=words.map(word=>{const example=word.example||word.exercises[0].upgrade.replace('______',word.word);const note=word.note||word.exercises[0].options.find(o=>o.text===word.word)?.explanation||word.meaning;
    return '<article class="syn-word-card"><span>'+String(word.order).padStart(2,'0')+'</span><div><h4>'+esc(word.word[0].toUpperCase()+word.word.slice(1))+'</h4><div class="syn-word-audio-controls"><button type="button" data-guide-audio="word:'+word.order+'" aria-label="播放 '+esc(word.word)+' 的讀音">'+icon('audio')+'聽讀音</button><span data-guide-audio-status role="status"></span></div><strong>'+esc(word.meaning)+'</strong><p>'+esc(note)+'</p>'+(word.collocations?'<p><b>常見搭配：</b>'+esc(word.collocations)+'</p>':'')+(word.contrast?'<p><b>辨析：</b>'+esc(word.contrast)+'</p>':'')+'<div class="syn-guide-example"><small lang="en">'+esc(example)+'</small><p class="syn-guide-translation">'+esc(word.exampleZh||word.exercises[0].zh)+'</p><button type="button" data-guide-audio="sentence:'+word.order+'" aria-label="播放例句">'+icon('audio')+'聽例句</button><span data-guide-audio-status role="status"></span></div></div></article>';}).join('');
  shell('<section class="syn-guide syn-enter"><p class="syn-kicker">WORD GUIDE · 先理解，再練習</p><h3>'+esc(moduleData.title)+' 的 '+words.length+' 種更精準說法</h3><p>看看每個詞組的重點和例句。準備好後，進入隨機排列的 '+total+' 題練習。</p><div class="syn-word-grid">'+cards+'</div>'+(moduleData.quickChoice?'<details class="syn-audit"><summary>快速選詞規則</summary>'+renderAudit(moduleData.quickChoice)+'</details>':'')+'<div class="syn-guide-actions"><button class="syn-secondary" type="button" data-go="false">先看看 False synonyms</button><button class="syn-primary" type="button" data-begin>'+(progress.order?.length>=total && progress.cursor<progress.order.length && progress.cursor>0?'繼續第 '+(progress.cursor+1)+' 題':'開始 '+total+' 題練習')+' →</button></div></section>');
}
function renderFalse() {
  const cards=falseSynonyms.map((item,i)=>'<article class="syn-false-card"><span>'+String(i+1).padStart(2,'0')+'</span><div><h4>'+esc(item.word)+'</h4><p class="syn-false-description">'+esc(item.zh)+'</p><p lang="en">'+esc(item.point)+'</p></div></article>').join('');
  shell('<section class="syn-false syn-enter"><p class="syn-kicker">FALSE SYNONYMS · 容易選錯的詞</p><h3>看起來相關，意思卻不同</h3><p>這些選項有時似乎合理，但語境或詞性不合。先分清它們，再回到同義詞指南。</p><div class="syn-false-grid">'+cards+'</div><div class="syn-guide-actions"><button class="syn-primary" type="button" data-go="guide">返回同義詞指南 →</button></div></section>');
}
function renderQuestion() {
  const q=current();if (!q) {go('guide');return;}
  const selected=q.exercise.options.find(o=>o.letter===choice),correct=selected?.text===q.exercise.answer;
  const headword=moduleData.headword|| (moduleId==='important'?'important':'social media');
  const escapedHeadword=esc(headword);
  const regex=new RegExp(escapedHeadword.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');
  const original=esc(q.exercise.original).replace(regex,'<mark>$&</mark>');
  const options=q.exercise.options.map(o=>{const state=choice?(o.text===q.exercise.answer?'is-correct':o.letter===choice?'is-wrong':'is-muted'):'';
    return '<button class="syn-option '+state+'" type="button" data-answer="'+o.letter+'" '+(choice?'disabled':'')+'><span class="syn-option-letter">'+o.letter+'</span><span>'+esc(o.text)+'</span><span class="syn-option-icon" aria-hidden="true">'+(choice&&o.text===q.exercise.answer?icon('check'):'')+'</span></button>';}).join('');
  const feedback=choice?'<section class="syn-feedback '+(correct?'is-right':'is-try-again')+'" tabindex="-1" aria-live="polite"><div class="syn-feedback-top"><span class="syn-feedback-symbol" aria-hidden="true">'+icon(correct?'check':'retry')+'</span><div><p class="syn-kicker">'+(correct?'NICE CHOICE':'LEARN THE DIFFERENCE')+'</p><h4>'+(correct?'選得準確！':'再看一次語境；這題稍後會再出現')+'</h4></div></div><p class="syn-reveal"><strong>'+esc(q.exercise.answer)+'</strong> · '+esc(q.word.meaning)+'</p>'+(q.exercise.upgrade?'<p class="syn-correct-rewrite"><b>正確改寫：</b> '+esc(q.exercise.upgrade)+'</p>':'')+'<div class="syn-explanations"><h5>六個選項的解釋</h5>'+q.exercise.options.map(o=>'<div class="'+(o.text===q.exercise.answer?'is-answer':'')+'"><strong>'+o.letter+'. '+esc(o.text)+'</strong><span>'+esc(detailedFeedback[q.id]?.[o.letter]||o.explanation)+'</span></div>').join('')+'</div><button class="syn-primary" type="button" data-next>'+(progress.cursor===progress.order.length-1?'查看結果':'下一題')+' →</button></section>':'';
  shell('<div class="syn-play syn-enter"><nav class="syn-play-nav" aria-label="練習導覽"><button type="button" data-go="guide">返回同義詞指南</button><span>QUESTION '+String(progress.cursor+1).padStart(2,'0')+' / '+progress.order.length+'</span></nav><div class="syn-track" aria-hidden="true"><span style="width:'+((progress.cursor+1)/progress.order.length*100)+'%"></span></div><section class="syn-question-card"><div class="syn-question-label"><span class="syn-orbit" aria-hidden="true">'+icon('spark')+'</span><span>選出最適合這句話的同義詞</span></div><div class="syn-original"><span>READ THE CONTEXT · 閱讀語境</span><p lang="en">'+original+'</p></div><p class="syn-question-translation"><strong>中文翻譯</strong> '+esc(q.exercise.zh)+'</p><div class="syn-helpers"><button type="button" data-speak aria-label="播放原句示範音訊">'+icon('audio')+'聽示範</button><button type="button" data-open-recorder>'+icon('microphone')+'錄音朗讀</button><span data-audio-status role="status" aria-live="polite"></span></div><section class="syn-recorder" data-recorder hidden></section><div class="syn-options" role="group" aria-label="選擇最貼切的同義詞">'+options+'</div>'+(!choice?'<p class="syn-keyboard">點選答案，或按鍵盤 1–6。</p>':'')+feedback+'</section></div>');
}
function renderFinish() {
  const weak=questions.filter(q=>!record(q.id)?.mastered);
  shell('<section class="syn-clear syn-enter"><div class="syn-clear-emblem" aria-hidden="true">'+icon('spark')+'</div><p class="syn-kicker">ROUND COMPLETE</p><h3>'+total+' 題完成</h3><p>已掌握 <strong>'+mastered()+' / '+total+'</strong> 題。'+(weak.length?'可再練習未掌握的題目。':words.length+' 個詞組都已掌握！')+'</p><div class="syn-clear-actions"><button class="syn-secondary" type="button" data-go="home">系統首頁</button><button class="syn-primary" type="button" data-go="guide">再看詞語指南</button><button class="syn-primary" type="button" data-new-round>重新隨機練習</button></div></section>');
}
function renderRecordings() {
  shell('<section class="syn-recordings syn-enter"><p class="syn-kicker">YOUR VOICE ARCHIVE</p><h3>我的錄音</h3><p>在題目按「錄音朗讀」後，可以在這裡重聽。錄音會儲存至學生帳戶。</p><div data-recording-list role="status">正在載入錄音…</div></section>');
}
async function loadRecordings() {
  const epoch=recordingsEpoch, expected=owner, list=host.querySelector('[data-recording-list]');
  if(!list||!expected||!token)return;
  try {
    const {items,offline}=await allRecordings(expected,token,window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc);
    if(epoch!==recordingsEpoch||owner!==expected||!list.isConnected)return;
    const moduleItems=items.filter(item=>byId.has(item.question));
    recordingItems.clear();for(const item of moduleItems)recordingItems.set(item.id,item);
    list.innerHTML=(offline?'<p class="syn-recording-warning">暫時未能讀取帳戶錄音；以下先顯示此裝置的副本。</p>':'')+(moduleItems.length?moduleItems.map((item,index)=>{
      const q=byId.get(item.question),when=item.at?new Date(item.at).toLocaleString('zh-HK',{dateStyle:'medium',timeStyle:'short'}):'錄音';
      return '<article class="syn-recording-card"><span>REC '+String(index+1).padStart(2,'0')+'</span><div><h4>'+esc(q?.exercise.original||'朗讀記錄')+'</h4><p>'+esc(when)+' · '+(item.synced?'已儲存至帳戶':'只在此裝置')+'</p><div class="syn-recorder-actions"><button type="button" data-play-recording="'+esc(item.id)+'">'+icon('audio')+'播放錄音</button>'+(!item.synced?'<button type="button" data-upload-recording="'+esc(item.id)+'">重試上傳</button>':'')+'</div><audio controls hidden></audio><p role="status"></p></div></article>';
    }).join(''):'<p class="syn-empty-recordings">還沒有錄音。到練習題按「錄音朗讀」開始。</p>');
  }catch {if(list.isConnected)list.textContent='暫時未能載入錄音，請稍後再試。';}
}
function render() {
  if (!owner || !host.isConnected) return;
  if(view==='module')renderModule();else if(view==='guide')renderGuide();else if(view==='false')renderFalse();else if(view==='question')renderQuestion();else if(view==='finish')renderFinish();else if(view==='recordings'){renderRecordings();void loadRecordings();}else renderHome();
}
function syncSession() {
  const snapshot=window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.();
  const next=snapshot?.user?.id||null;
  if(next===owner){if(owner&&snapshot.token!==token){token=snapshot.token;void loadAccount();}return;}
  recorderDispose?.();recorderDispose=null;recordingsEpoch++;
  for(const url of recordingUrls.splice(0))URL.revokeObjectURL(url);recordingItems.clear();
  stopVoice();for(const url of cloudAudio.values())URL.revokeObjectURL(url);cloudAudio.clear();
  owner=next;token=snapshot?.token||null;streak=0;choice=null;pending=new Map();moduleStates.clear();moduleId='important';moduleData=importantModule;words=moduleData.words;questions=makeQuestions(moduleId,words);byId=new Map(questions.map(q=>[q.id,q]));total=questions.length;falseSynonyms=importantFalseSynonyms;view='home';
  if(owner){readLocal();saveState='loading';render();void loadAccount();}else{progress={answers:{},order:[],cursor:0};host.replaceChildren();}
}
window.addEventListener('edmund:learning-portal-session',syncSession);
window.addEventListener('storage',event=>{if(owner&&event.key===progressKey()){readLocal();render();}});
window.addEventListener('online',()=>{if(owner){if(pending.size)void syncPending();else void loadAccount();}});
window.addEventListener('popstate',()=>{if(!owner)return;const hash=location.hash.slice(1);const separator=hash.indexOf(':');const target=separator>0?hash.slice(0,separator):'important';selectModule(modules[target]?target:'important');const part=separator>0?hash.slice(separator+1):hash;view=part==='false-synonyms'?'false':['home','module','guide','question','finish','recordings','false'].includes(part)?part:'home';if(view==='question'&&!current())view='guide';render();});
host.addEventListener('input',event=>{if(!event.target.matches('[data-module-search]'))return;const query=event.target.value.trim().toLowerCase();host.querySelectorAll('[data-module]').forEach(card=>{card.hidden=!card.dataset.search.includes(query);});});
async function playRecording(button) {
  const item=recordingItems.get(button.dataset.playRecording),card=button.closest('.syn-recording-card'),status=card?.querySelector('[role="status"]'),player=card?.querySelector('audio');
  if(!item||!player)return;
  if(!player.paused){player.pause();return;}
  const expected=owner,epoch=recordingsEpoch;button.disabled=true;if(status)status.textContent='正在載入錄音…';
  try {
    if(!player.src){const blob=await recordingBlob(item,token,window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc);if(owner!==expected||epoch!==recordingsEpoch||!player.isConnected)return;const url=URL.createObjectURL(blob);recordingUrls.push(url);player.src=url;player.hidden=false;}
    host.querySelectorAll('.syn-recording-card audio').forEach(other=>{if(other!==player)other.pause();});
    await player.play();if(status?.isConnected)status.textContent='';
  }catch{if(status?.isConnected)status.textContent='未能播放，請再試。';}finally{if(button.isConnected)button.disabled=false;}
}
async function retryRecording(button) {
  const item=recordingItems.get(button.dataset.uploadRecording),status=button.closest('.syn-recording-card')?.querySelector('[role="status"]');
  if(!item?.blob)return;
  button.disabled=true;if(status)status.textContent='正在上傳…';
  try{await uploadRecording(item,token,window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc);if(view==='recordings')void loadRecordings();}
  catch{if(status?.isConnected)status.textContent='暫時未能上傳，裝置副本仍在。';button.disabled=false;}
}
host.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.module){selectModule(button.dataset.module);go('module');}
  else if(button.dataset.go)go(button.dataset.go);
  else if(button.hasAttribute('data-begin'))beginRound();
  else if(button.hasAttribute('data-new-round')){go('guide');beginRound(true);}
  else if(button.dataset.answer)answer(button.dataset.answer);
  else if(button.hasAttribute('data-next'))nextQuestion();
  else if(button.hasAttribute('data-speak'))void playVoice();
  else if(button.dataset.guideAudio){const [kind,index]=button.dataset.guideAudio.split(':');void playGuideAudio(kind,index,button);}
  else if(button.hasAttribute('data-open-recorder')){const q=current(),panel=host.querySelector('[data-recorder]');if(!q||!panel)return;stopVoice();panel.hidden=false;button.hidden=true;recorderDispose=mountRecorder(panel,{owner,token,question:q.id,rpc:window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc,onClose:()=>{recorderDispose?.();recorderDispose=null;panel.hidden=true;button.hidden=false;}});}
  else if(button.dataset.playRecording)void playRecording(button);
  else if(button.dataset.uploadRecording)void retryRecording(button);
  else if(button.hasAttribute('data-retry-save')){if(pending.size)void syncPending();else void loadAccount();}
});
window.addEventListener('keydown',event=>{
  if(!owner||dashboard?.hidden||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'')||event.altKey||event.ctrlKey||event.metaKey)return;
  if(view==='question'&&!choice&&/^[1-6]$/.test(event.key))answer('ABCDEF'[Number(event.key)-1]);
  else if(event.key==='Escape'&&view==='question')go('guide');
});
syncSession();
