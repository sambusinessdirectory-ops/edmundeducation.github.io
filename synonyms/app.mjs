import { importantModule } from './important-data.mjs?v=20260928-important1';
import { synonymAudio } from './audio-manifest.mjs?v=20260928-four-voices1';

const words = importantModule.words;
const voices = ['american-female', 'american-male', 'british-male', 'british-female'];
const voiceNames = {'american-female':'美式女聲','american-male':'美式男聲','british-male':'英式男聲','british-female':'英式女聲'};
const questions = words.flatMap((word, wi) => word.exercises.map((exercise, ei) => ({id: `${wi + 1}-${ei + 1}`, wi, ei, word, exercise, voice: voices[(wi * 2 + ei) % 4]})));
const byId = new Map(questions.map(question => [question.id, question]));
const total = questions.length;
const dashboard = document.querySelector('[data-view="dashboard"]');
dashboard?.querySelector('.learning-portal-empty')?.remove();
const host = document.createElement('section');
host.className = 'syn-app';
host.setAttribute('aria-label', 'Synonyms 同義詞學習系統');
dashboard?.append(host);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const falseSynonyms = [
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
let audioTicket = 0;
let owner = null, token = null, progress = {answers:{},order:[],cursor:0};
let view = 'home', choice = null, streak = 0, saveState = 'loading', localAvailable = true, syncing = false;
const pending = new Map();
const progressKey = () => `edmund-synonyms-important-v1:${owner}`;
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
    loading:'正在讀取帳戶進度…',saving:'正在儲存到帳戶…',saved:'✓ 已儲存到學生帳戶',
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
  saveLocal();
}
async function loadAccount() {
  if (!owner || !token) return;
  const expected = owner;
  saveState = 'loading'; updateSaveBadge();
  try {
    const rows = await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc('synonyms_important_list',{p_token:token});
    if (owner !== expected) return;
    mergeServer(rows);
    saveState = pending.size ? 'saving' : 'saved'; updateSaveBadge();
    if (pending.size) void syncPending();
    render();
  } catch {
    if (owner !== expected) return;
    saveState = 'offline'; updateSaveBadge(); render();
  }
}
async function syncPending() {
  if (syncing || !owner || !token || !pending.size) return;
  syncing = true;
  const expected = owner;
  saveState = 'saving'; updateSaveBadge();
  try {
    while (pending.size && owner === expected) {
      const [id,item] = pending.entries().next().value;
      await window.EDMUND_LEARNING_PORTAL_CONTEXT.rpc('synonyms_important_record',{
        p_token:token,p_question_key:id,p_attempts:item.attempts,p_mastered:Boolean(item.mastered),
        p_last_choice:item.lastChoice,p_last_correct:Boolean(item.lastCorrect)
      });
      if (pending.get(id)?.attempts === item.attempts) pending.delete(id);
    }
    if (owner === expected) saveState = 'saved';
  } catch { if (owner === expected) saveState = 'offline'; }
  syncing = false;
  updateSaveBadge();
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
    const buckets = voices.map((_,voiceIndex) => shuffle(questions.filter(q => voices.indexOf(q.voice)===voiceIndex)));
    const sequence = Array.from({length:7},(_,i) => buckets.map(bucket => bucket[i])).flat();
    if (sequence.every((q,i) => !i || q.wi !== sequence[i-1].wi)) return sequence.map(q=>q.id);
  }
  return questions.map(q=>q.id);
}
function go(next) {
  view = next;
  if (next !== 'question') { choice = null; stopVoice(); }
  const hash = next === 'false' ? 'false-synonyms' : next;
  history.pushState({synonymsView:next},'',`#${hash}`);
  render();
  host.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
}
function beginRound(fresh=false) {
  if (fresh || !Array.isArray(progress.order) || progress.order.length !== total || progress.cursor >= total || !progress.order.every(id=>byId.has(id))) {
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
  progress.cursor = Math.min(total,progress.cursor+1); choice = null; saveLocal();
  if (progress.cursor >= total) go('finish'); else {stopVoice();render();host.scrollIntoView({behavior:'smooth',block:'start'});}
}
function stopVoice() { audioTicket++; audio.pause(); audio.removeAttribute('src'); const status=host.querySelector('[data-audio-status]');if(status)status.textContent=''; }
async function playVoice() {
  const q=current(); if (!q || !token) return;
  stopVoice();
  const ticket=audioTicket, expected=owner, item=synonymAudio[q.id], status=host.querySelector('[data-audio-status]');
  if (status) status.textContent='正在載入'+voiceNames[item.voice]+'…';
  try {
    let url=item.path?new URL('./'+item.path,import.meta.url).href:cloudAudio.get(q.id);
    if (!url) {
      const response=await fetch('https://edmund-speaking-system.edmundeducation.workers.dev/v1/learning-voice',{
        method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
        body:JSON.stringify({text:item.text}),signal:AbortSignal.timeout(30000)
      });
      if (!response.ok) throw Error('Voice unavailable');
      const blob=await response.blob();if (!blob.size || !blob.type.startsWith('audio/')) throw Error('Invalid audio');
      url=URL.createObjectURL(blob);cloudAudio.set(q.id,url);
    }
    if (ticket!==audioTicket || owner!==expected) return;
    audio.src=url;audio.playbackRate=1;
    audio.onended=()=>{if(ticket===audioTicket && status?.isConnected)status.textContent='播放完畢';};
    await audio.play();if(ticket===audioTicket && status?.isConnected)status.textContent='正在播放 · '+voiceNames[item.voice];
  } catch { if(ticket===audioTicket && status?.isConnected)status.textContent='未能播放，請再按一次。'; }
}
function stats() {
  return '<div class="syn-stats" aria-label="練習進度"><span><strong>'+attempted()+'</strong><small>/ '+total+' 已作答</small></span><span><strong>'+mastered()+'</strong><small>已掌握</small></span><span><strong>'+streak+'</strong><small>連續答對</small></span></div>';
}
function shell(content) {
  host.innerHTML='<div class="syn-ambient" aria-hidden="true"><i></i><i></i><i></i></div>'+
    '<nav class="syn-global-nav" aria-label="Synonyms 導覽"><button type="button" data-go="home">系統首頁</button><button type="button" data-go="module">Important</button><button type="button" data-go="guide">同義詞指南</button><button type="button" data-go="false">False synonyms</button></nav>'+
    '<header class="syn-heading"><div><p class="syn-kicker">SYNONYMS · 同義詞學習系統</p><h2>把 <em>important</em> 說得更準確</h2><p>從語境理解字詞，選擇更精準的表達。</p></div>'+stats()+'</header>'+
    '<div class="syn-progress" role="progressbar" aria-label="已作答題目" aria-valuemin="0" aria-valuemax="'+total+'" aria-valuenow="'+attempted()+'"><span style="width:'+(attempted()/total*100)+'%"></span></div>'+
    '<div class="syn-save-row" role="status" aria-live="polite"><span data-save-state></span><button type="button" data-retry-save hidden>重試儲存</button></div>'+content;
  updateSaveBadge();
}
function renderHome() {
  shell('<section class="syn-home syn-enter"><p class="syn-kicker">YOUR LEARNING LIBRARY</p><h3>選擇學習模組</h3><p>每個模組先認識詞義，再以語境練習運用。</p><div class="syn-module-grid"><button class="syn-module-card" type="button" data-go="module"><span class="syn-module-index">01 / SYNONYM EXPANSION</span><strong>Important</strong><small>14 個更精準的同義詞 · 28 道選擇題</small><span class="syn-module-progress">已作答 '+attempted()+' / '+total+' 題 <span aria-hidden="true">↗</span></span></button></div></section>');
}
function renderModule() {
  shell('<section class="syn-module-front syn-enter"><div class="syn-module-hero"><p class="syn-kicker">MODULE 01 · IMPORTANT</p><h3>重要，究竟有多重要？</h3><p>重大、關鍵、不可或缺、影響深遠——英文會按語境選用不同的字。</p><div class="syn-module-actions"><button class="syn-primary" type="button" data-go="guide">先看 14 個同義詞 →</button><button class="syn-secondary" type="button" data-go="false">認識 False synonyms</button></div></div><div class="syn-module-aside"><strong>'+mastered()+' / '+total+'</strong><span>題已掌握</span><small>開始練習前，先閱讀同義詞指南。</small></div></section>');
}
function renderGuide() {
  const cards=words.map(word=>{const example=word.exercises[0].upgrade.replace('______',word.word);const note=word.exercises[0].options.find(o=>o.text===word.word)?.explanation||word.meaning;
    return '<article class="syn-word-card"><span>'+String(word.order).padStart(2,'0')+'</span><div><h4>'+esc(word.word)+'</h4><strong>'+esc(word.meaning)+'</strong><p>'+esc(note)+'</p><small lang="en">'+esc(example)+'</small></div></article>';}).join('');
  shell('<section class="syn-guide syn-enter"><p class="syn-kicker">WORD GUIDE · 先理解，再練習</p><h3>Important 的 14 種更精準說法</h3><p>看看每個字的重點和例句。準備好後，進入隨機排列的 28 題練習。</p><div class="syn-word-grid">'+cards+'</div><div class="syn-guide-actions"><button class="syn-secondary" type="button" data-go="false">先看看 False synonyms</button><button class="syn-primary" type="button" data-begin>'+(progress.order?.length===total && progress.cursor<total && progress.cursor>0?'繼續第 '+(progress.cursor+1)+' 題':'開始 28 題練習')+' →</button></div></section>');
}
function renderFalse() {
  const cards=falseSynonyms.map((item,i)=>'<article class="syn-false-card"><span>'+String(i+1).padStart(2,'0')+'</span><div><p class="syn-kicker">'+esc(item.type)+'</p><h4>'+esc(item.word)+'</h4><p lang="en">'+esc(item.point)+'</p><small>'+esc(item.zh)+'</small></div></article>').join('');
  shell('<section class="syn-false syn-enter"><p class="syn-kicker">FALSE SYNONYMS · 容易選錯的詞</p><h3>看起來相關，意思卻不同</h3><p>這些選項有時似乎合理，但語境或詞性不合。先分清它們，再回到同義詞指南。</p><div class="syn-false-grid">'+cards+'</div><div class="syn-guide-actions"><button class="syn-primary" type="button" data-go="guide">返回同義詞指南 →</button></div></section>');
}
function renderQuestion() {
  const q=current();if (!q) {go('guide');return;}
  const selected=q.exercise.options.find(o=>o.letter===choice),correct=selected?.text===q.exercise.answer;
  const original=esc(q.exercise.original).replace(/\bimportant\b/gi,'<mark>$&</mark>');
  const options=q.exercise.options.map(o=>{const state=choice?(o.text===q.exercise.answer?'is-correct':o.letter===choice?'is-wrong':'is-muted'):'';
    return '<button class="syn-option '+state+'" type="button" data-answer="'+o.letter+'" '+(choice?'disabled':'')+'><span class="syn-option-letter">'+o.letter+'</span><span>'+esc(o.text)+'</span><span class="syn-option-icon" aria-hidden="true">'+(choice&&o.text===q.exercise.answer?'✓':choice&&o.letter===choice?'×':'↗')+'</span></button>';}).join('');
  const feedback=choice?'<section class="syn-feedback '+(correct?'is-right':'is-try-again')+'" tabindex="-1" aria-live="polite"><div class="syn-feedback-top"><span class="syn-feedback-symbol" aria-hidden="true">'+(correct?'✦':'↺')+'</span><div><p class="syn-kicker">'+(correct?'NICE CHOICE':'LEARN THE DIFFERENCE')+'</p><h4>'+(correct?'選得準確！':'再看一次語境')+'</h4></div></div><p class="syn-reveal"><strong>'+esc(q.exercise.answer)+'</strong> · '+esc(q.word.meaning)+'</p><div class="syn-explanations"><h5>六個選項的解釋</h5>'+q.exercise.options.map(o=>'<div class="'+(o.text===q.exercise.answer?'is-answer':'')+'"><strong>'+o.letter+'. '+esc(o.text)+'</strong><span>'+esc(o.explanation)+'</span></div>').join('')+'</div><button class="syn-primary" type="button" data-next>'+(progress.cursor===total-1?'查看結果':'下一題')+' →</button></section>':'';
  shell('<div class="syn-play syn-enter"><nav class="syn-play-nav" aria-label="練習導覽"><button type="button" data-go="guide">← 同義詞指南</button><span>QUESTION '+String(progress.cursor+1).padStart(2,'0')+' / '+total+'</span></nav><div class="syn-track" aria-hidden="true"><span style="width:'+((progress.cursor+1)/total*100)+'%"></span></div><section class="syn-question-card"><div class="syn-question-label"><span class="syn-orbit" aria-hidden="true">✦</span><span>選出最適合這句話的同義詞</span><small>'+esc(voiceNames[q.voice])+'</small></div><div class="syn-original"><span>READ THE CONTEXT · 閱讀語境</span><p lang="en">'+original+'</p></div><p class="syn-question-translation"><strong>中文翻譯</strong> '+esc(q.exercise.zh)+'</p><div class="syn-helpers"><button type="button" data-speak>▶ 聽原句 · '+esc(voiceNames[q.voice])+'</button><span data-audio-status role="status" aria-live="polite"></span></div><div class="syn-options" role="group" aria-label="選擇最貼切的同義詞">'+options+'</div>'+(!choice?'<p class="syn-keyboard">點選答案，或按鍵盤 1–6。</p>':'')+feedback+'</section></div>');
}
function renderFinish() {
  const weak=questions.filter(q=>!record(q.id)?.mastered);
  shell('<section class="syn-clear syn-enter"><div class="syn-clear-emblem" aria-hidden="true">✧</div><p class="syn-kicker">ROUND COMPLETE</p><h3>28 題完成</h3><p>已掌握 <strong>'+mastered()+' / '+total+'</strong> 題。'+(weak.length?'可再練習未掌握的題目。':'14 個同義詞都已掌握！')+'</p><div class="syn-clear-actions"><button class="syn-secondary" type="button" data-go="home">系統首頁</button><button class="syn-primary" type="button" data-go="guide">再看詞語指南 →</button><button class="syn-primary" type="button" data-new-round>重新隨機練習 ↻</button></div></section>');
}
function render() {
  if (!owner || !host.isConnected) return;
  if(view==='module')renderModule();else if(view==='guide')renderGuide();else if(view==='false')renderFalse();else if(view==='question')renderQuestion();else if(view==='finish')renderFinish();else renderHome();
}
function syncSession() {
  const snapshot=window.EDMUND_LEARNING_PORTAL_CONTEXT?.getSession?.();
  const next=snapshot?.user?.id||null;
  if(next===owner)return;
  stopVoice();for(const url of cloudAudio.values())URL.revokeObjectURL(url);cloudAudio.clear();
  owner=next;token=snapshot?.token||null;streak=0;choice=null;pending.clear();view='home';
  if(owner){readLocal();saveState='loading';render();void loadAccount();}else{progress={answers:{},order:[],cursor:0};host.replaceChildren();}
}
window.addEventListener('edmund:learning-portal-session',syncSession);
window.addEventListener('storage',event=>{if(owner&&event.key===progressKey()){readLocal();render();}});
window.addEventListener('online',()=>{if(owner){if(pending.size)void syncPending();else void loadAccount();}});
window.addEventListener('popstate',()=>{if(!owner)return;const hash=location.hash.slice(1);view=hash==='false-synonyms'?'false':['home','module','guide','question','finish'].includes(hash)?hash:'home';if(view==='question'&&!current())view='guide';render();});
host.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.go)go(button.dataset.go);
  else if(button.hasAttribute('data-begin'))beginRound();
  else if(button.hasAttribute('data-new-round')){go('guide');beginRound(true);}
  else if(button.dataset.answer)answer(button.dataset.answer);
  else if(button.hasAttribute('data-next'))nextQuestion();
  else if(button.hasAttribute('data-speak'))void playVoice();
  else if(button.hasAttribute('data-retry-save')){if(pending.size)void syncPending();else void loadAccount();}
});
window.addEventListener('keydown',event=>{
  if(!owner||dashboard?.hidden||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'')||event.altKey||event.ctrlKey||event.metaKey)return;
  if(view==='question'&&!choice&&/^[1-6]$/.test(event.key))answer('ABCDEF'[Number(event.key)-1]);
  else if(event.key==='Escape'&&view==='question')go('guide');
});
syncSession();
