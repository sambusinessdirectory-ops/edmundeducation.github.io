import {sourceLink,sourceLabel} from './library-core.mjs?v=20260916-community1';
import {fontControl,record,startStudy,saveState,loadState,getCached,session,flush} from './learning-state.mjs?v=20260916-community1';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lessonNumber=value=>[1,2,3].includes(Number(value))?Number(value):1;
const lessonName=lesson=>`第${['','一','二','三'][lesson]}課`;
const correctChoice=(question,choice)=>(question.acceptedAnswers||[question.answer]).includes(choice);
const ownObject=value=>value&&typeof value==='object'&&!Array.isArray(value);
const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

// Retry rounds retain source order, with the original passage always last.
// A compact snapshot stores only current round state and proven correct answers.
export function createPolysemyQuiz(word,saved=null) {
  const questions=[...word.questions].sort((a,b)=>(a.kind==='passage')-(b.kind==='passage'));
  const byId=new Map(questions.map(q=>[q.id,q])),ids=questions.map(q=>q.id),senseIds=new Set(word.senses.map(s=>s.id));
  const content=JSON.stringify([word.id,word.word,word.senses,questions]);
  let queue=[...ids],missed=[],position=0,round=1,answered=false,selected=null,complete=false,correctAnswers={},restored=false;
  function valid(s){
    if(!ownObject(s)||s.version!==1||s.content!==content||!Array.isArray(s.queue)||!s.queue.length||!Array.isArray(s.missed)||!ownObject(s.correctAnswers))return false;
    if(!Number.isInteger(s.position)||s.position<0||s.position>=s.queue.length||!Number.isInteger(s.round)||s.round<1||s.round>10000||typeof s.answered!=='boolean'||typeof s.complete!=='boolean')return false;
    if(new Set(s.queue).size!==s.queue.length||s.queue.some(id=>!byId.has(id))||JSON.stringify(s.queue)!==JSON.stringify(ids.filter(id=>s.queue.includes(id))))return false;
    if(s.round===1&&JSON.stringify(s.queue)!==JSON.stringify(ids))return false;
    if(new Set(s.missed).size!==s.missed.length||s.missed.some(id=>!s.queue.includes(id))||JSON.stringify(s.missed)!==JSON.stringify(s.queue.filter(id=>s.missed.includes(id))))return false;
    if(Object.entries(s.correctAnswers).some(([id,answer])=>!byId.has(id)||byId.get(id).answer!==answer))return false;
    if(s.answered?!senseIds.has(s.selected):s.selected!==null)return false;
    if(s.complete)return !s.answered&&s.position===s.queue.length-1&&!s.missed.length&&Object.keys(s.correctAnswers).length===ids.length;
    if(ids.some(id=>!s.queue.includes(id)&&s.correctAnswers[id]!==byId.get(id).answer))return false;
    return s.queue.every((id,index)=>{
      const mastered=s.correctAnswers[id]===byId.get(id).answer,wrong=s.missed.includes(id);
      if(index<s.position)return mastered!==wrong;
      if(index>s.position||!s.answered)return !mastered&&!wrong;
      return correctChoice(byId.get(id),s.selected)?mastered&&!wrong:!mastered&&wrong;
    });
  }
  if(valid(saved)){
    ({position,round,answered,selected,complete}=saved);queue=[...saved.queue];missed=[...saved.missed];correctAnswers={...saved.correctAnswers};restored=true;
  }
  return {
    get restored(){return restored;},
    get state(){const question=byId.get(queue[position]);return {question,position,total:queue.length,round,answered,selected,correct:answered&&correctChoice(question,selected),complete,missed:missed.length,correctCount:Object.keys(correctAnswers).length,wordTotal:ids.length,correctAnswers:{...correctAnswers}};},
    snapshot(){return {version:1,content,queue:[...queue],missed:[...missed],position,round,answered,selected,complete,correctAnswers:{...correctAnswers}};},
    answer(id){
      if(answered||complete||!senseIds.has(id))return null;
      answered=true;selected=id;const question=byId.get(queue[position]),correct=correctChoice(question,id);
      if(correct)correctAnswers[question.id]=question.answer;else missed.push(question.id);
      return correct;
    },
    next(){
      if(!answered||complete)return false;
      if(position+1<queue.length)position++;
      else if(missed.length){queue=ids.filter(id=>missed.includes(id));missed=[];position=0;round++;}
      else complete=true;
      answered=false;selected=null;return true;
    }
  };
}

function progressKey(owner,lesson){return owner?`professional-polysemy-v1:${owner}:lesson-${lesson}`:null;}
function completedWords(owner,lesson){try{const value=JSON.parse(localStorage.getItem(progressKey(owner,lesson))||'{}');return ownObject(value)?value:{};}catch{return {};}}
export function highlightSentence(word,text){
  const forms=new Set([word.baseWord,...String(word.word).split(/\s*\/\s*/)]);
  const irregular={send:['sent'],say:['said'],understand:['understood'],take:['took','taken'],leave:['left'],hold:['held'],stand:['stood'],run:['ran'],make:['made'],keep:['kept'],bring:['brought']};
  for(const form of [...forms]){
    for(const extra of irregular[form]||[])forms.add(extra);
    if(/^[a-z]+e$/i.test(form))forms.add(form.slice(0,-1)+'ing');
    if(/^[a-z]+[^aeiou]y$/i.test(form)){forms.add(form.slice(0,-1)+'ied');forms.add(form.slice(0,-1)+'ies');}
    if(/^[a-z]{1,4}[aeiou][b-df-hj-np-tv-z]$/i.test(form)){forms.add(form+form.at(-1)+'ed');forms.add(form+form.at(-1)+'ing');}
  }
  const alternatives=[...forms].filter(Boolean).sort((a,b)=>b.length-a.length).map(form=>form.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\s+/g,'\\s+')+'(?:s|es|d|ed|ing)?');
  return esc(text).replace(new RegExp(`\\b(${alternatives.join('|')})\\b`,'gi'),match=>`<mark>${match}</mark>`);
}

export function mountPolysemyPage({data,root=document.body,lesson:requestedLesson}) {
  const lesson=lessonNumber(requestedLesson??new URLSearchParams(location.search).get('lesson')??data.lesson);
  const owner=session()?.user?.id,ownsPage=()=>Boolean(owner)&&session()?.user?.id===owner;
  const page=document.createElement('main');page.className='pro-practice-page poly-page';root.append(page);document.body.classList.add('pro-dialogue-open');
  let word=null,quiz=null,progress=completedWords(owner,lesson),attempt=null,completedAt=null,awarded=false,stopStudy=()=>{},loading=false,loadVersion=0,opening=null,lastUrl=location.href,unloadApproved=false;
  const draftKey=w=>`draft:poly:lesson-${lesson}:${w.id}`;
  const completeKey=w=>`draft:poly-complete:lesson-${lesson}:${w.id}`;
  const legacyCompleteKey=w=>`draft:poly-complete:${w.id}`;
  function header(){return `<header class="pro-page-header"><a href="./">← 返回課程 · Back to course</a>${fontControl('polysemy')}<button type="button" data-poly-theme>切換日夜模式</button></header><section class="pro-page-intro"><p class="pro-eyebrow">PROFESSIONAL ENGLISH · LESSON ${lesson}</p><h1>一詞多義 (Polysemy) 練習</h1><p>閱讀語境，找出同一個字在不同句子中的意思。</p></section>`;}
  function persist(){
    if(!ownsPage()||loading||!word||!quiz||!attempt)return;
    saveState(draftKey(word),{version:1,lesson,word:word.id,attempt,quiz:quiz.snapshot(),correctAnswers:quiz.state.correctAnswers,completedAt,updatedAt:Date.now()},owner);
  }
  function unfinished(){return ownsPage()&&word&&quiz&&quiz.state.correctCount<word.questions.length;}
  function mayLeave(){
    if(!unfinished())return true;
    if(!confirm('這個詞語尚未完成。要先完成練習嗎？按「取消」繼續；按「確定」離開並儲存進度。\nThis word is unfinished. Cancel to continue, or OK to leave and save your progress.'))return false;
    persist();void flush();return true;
  }
  function updateUrl(id,mode='push'){
    const url=new URL(location.href);url.searchParams.set('lesson',lesson);if(id)url.searchParams.set('word',id);else url.searchParams.delete('word');
    if(mode==='push'&&url.href!==location.href)history.pushState(null,'',url);else if(mode==='replace')history.replaceState(null,'',url);
    lastUrl=location.href;
  }
  function wordProgress(){const s=quiz?.state||{correctCount:word.questions.length,wordTotal:word.questions.length};return `<div class="poly-word-progress"><label for="poly-word-progress">已答對 <strong data-poly-progress-count>${s.correctCount} / ${s.wordTotal}</strong> 題</label><progress id="poly-word-progress" max="${s.wordTotal}" value="${s.correctCount}" aria-label="這個詞語已答對的題目"></progress></div>`;}
  function showList({navigate=false}={}){
    if(!ownsPage())return;
    stopStudy();loadVersion++;loading=false;word=null;quiz=null;attempt=null;unloadApproved=false;
    if(navigate)updateUrl(null);
    const done=data.words.filter(w=>progress[w.id]).length;
    page.innerHTML=header()+`<section class="poly-intro"><h2 tabindex="-1">${lessonName(lesson)} · 選擇一個詞語</h2><p>每個詞語先練習不同意思，最後回到課文原句。中文翻譯會隱去答案；答錯的題目將在下一輪再出現，直至全部答對。</p><p class="poly-progress">${done} / ${data.words.length} 個詞語已完成</p><progress class="poly-lesson-progress" max="${data.words.length}" value="${done}" aria-label="本課已完成詞語"></progress></section><div class="poly-word-grid">${data.words.map(w=>{
      const draft=getCached(draftKey(w)),resume=draft?.quiz&&!draft.quiz.complete;
      return `<button type="button" data-poly-word="${esc(w.id)}" class="${progress[w.id]?'is-complete':''}"><strong lang="en">${esc(w.word)}</strong><span class="poly-source-label">課文首次出現：${esc(sourceLabel(w.source))}</span><span>${w.senses.length} 種意思 · ${w.questions.length} 題</span><small>${progress[w.id]?'<span class="poly-tile-check" aria-hidden="true">✓</span> 已完成 · 查看結果':resume?'繼續上次進度 →':'開始練習 →'}</small></button>`;
    }).join('')}</div>`;
    document.title=`一詞多義練習 · ${lessonName(lesson)} | Professional English`;
  }
  function awardCompletion(){
    if(!ownsPage()||!word||!quiz||quiz.state.correctCount!==word.questions.length||awarded)return;
    stopStudy();awarded=true;completedAt=completedAt||Date.now();
    record({kind:'polysemy',exercise:`lesson-${lesson}:${word.id}`,attempt,item:'word',answers:quiz.state.correctAnswers},owner);
    progress[word.id]={completedAt,rounds:quiz.state.round};
    try{localStorage.setItem(progressKey(owner,lesson),JSON.stringify(progress));}catch{}
    saveState(completeKey(word),progress[word.id],owner);
    if(lesson===1)saveState(legacyCompleteKey(word),progress[word.id],owner);
    persist();
  }
  function completedView(){
    page.innerHTML=header()+`<section class="poly-complete"><span class="poly-check" aria-hidden="true">✓</span><h2 tabindex="-1">${esc(word.word)} · 全部答對！</h2><p>您已完成 ${word.questions.length} 題${quiz?`，共練習 ${quiz.state.round} 輪`:''}。</p>${wordProgress()}<button type="button" data-poly-list>選擇下一個詞語 →</button><button type="button" data-poly-redo="${esc(word.id)}">再練一次</button></section>`;
  }
  function answerFeedback(){
    const s=quiz.state;if(!s.answered)return;
    page.querySelectorAll('[data-poly-answer]').forEach(button=>{
      button.disabled=true;const id=button.dataset.polyAnswer;
      button.classList.toggle('is-correct',correctChoice(s.question,id));
      button.classList.toggle('is-wrong',id===s.selected&&!correctChoice(s.question,id));
      button.setAttribute('aria-pressed',String(id===s.selected));
    });
    const feedback=page.querySelector('.poly-feedback');feedback.classList.add(s.correct?'is-correct':'is-wrong');
    feedback.textContent=s.correct?`答對了！${s.question.zh}`:'這個意思不符合語境。綠色選項是正確答案；這題會在下一輪再出現，請再留意句子中的線索。';
    const next=page.querySelector('[data-poly-next]');next.hidden=false;
    next.textContent=s.position+1<s.total?'下一題 →':s.missed?`重溫答錯的 ${s.missed} 題 →`:'查看結果 →';
    page.querySelector('[data-poly-progress-count]').textContent=`${s.correctCount} / ${s.wordTotal}`;page.querySelector('#poly-word-progress').value=s.correctCount;
  }
  function render(){
    if(!ownsPage()||!word||!quiz)return;
    awardCompletion();const s=quiz.state;if(s.complete){completedView();return;}
    const q=s.question,choices=[...word.senses];
    // Deterministic per question so resume does not reshuffle an answered choice.
    const seed=q.id.split('').reduce((n,c)=>((n*31)^c.charCodeAt(0))>>>0,0);
    for(let i=choices.length-1;i>0;i--){const j=(seed+i*2654435761)%(i+1);[choices[i],choices[j]]=[choices[j],choices[i]];}
    page.innerHTML=header()+`<section class="poly-work"><div class="poly-toolbar"><button type="button" data-poly-list>← 詞語列表</button><span>第 ${s.round} 輪 · ${s.position+1} / ${s.total} 題</span></div>${wordProgress()}<div class="poly-question"><p class="pro-eyebrow">${q.kind==='passage'?'最後挑戰 · 課文原句':'意思練習 · 例句'}</p><h2 tabindex="-1" lang="en">${esc(word.word)}</h2>${sourceLink(word.source)}${q.context?`<p class="poly-context">情境：${esc(q.context)}</p>`:''}<p class="poly-sentence" lang="en">${highlightSentence(word,q.en)}</p><p class="poly-translation" lang="zh-Hant">${esc(q.zhMasked).replaceAll('____','<span class="poly-blank" aria-label="意思留空">____</span>')}</p><p class="poly-prompt" id="poly-prompt">${esc(word.word)} 在這句中是甚麼意思？</p><div class="poly-options" role="group" aria-labelledby="poly-prompt">${choices.map((sense,i)=>`<button type="button" data-poly-answer="${esc(sense.id)}" aria-pressed="false"><span aria-hidden="true">${String.fromCharCode(65+i)}</span>${esc(sense.zh)}</button>`).join('')}</div><div class="poly-feedback" role="status" aria-live="polite"></div><button type="button" class="pro-primary poly-next" data-poly-next hidden>下一題 →</button></div></section>`;
    answerFeedback();document.title=`${word.word} · 一詞多義練習 · ${lessonName(lesson)} | Professional English`;
  }
  function focusHeading(){page.querySelector('.poly-question h2,.poly-complete h2,.poly-intro h2')?.focus({preventScroll:true});}
  async function restoreWord(id,{redo=false,navigate=true}={}){
    if(!ownsPage())return;
    const chosen=data.words.find(w=>w.id===id);if(!chosen)return;
    stopStudy();const version=++loadVersion;loading=true;word=chosen;quiz=null;attempt=null;awarded=false;completedAt=null;unloadApproved=false;
    if(navigate)updateUrl(chosen.id);
    page.innerHTML=header()+'<p role="status">正在載入已儲存的進度…</p>';
    const saved=redo?null:await loadState(draftKey(chosen));
    if(!ownsPage()||version!==loadVersion)return;
    if(!redo&&!saved&&!progress[chosen.id]){
      let done=await loadState(completeKey(chosen));
      if(!done&&lesson===1&&ownsPage())done=await loadState(legacyCompleteKey(chosen));
      if(!ownsPage()||version!==loadVersion)return;
      if(ownObject(done)&&Number.isFinite(done.completedAt))progress[chosen.id]=done;
    }
    const restored=createPolysemyQuiz(chosen,saved?.quiz);
    const valid=saved?.version===1&&saved.lesson===lesson&&saved.word===chosen.id&&uuid(saved.attempt)&&restored.restored;
    loading=false;
    if(!redo&&!saved&&progress[chosen.id]){quiz=null;completedView();focusHeading();return;}
    quiz=valid&&!redo?restored:createPolysemyQuiz(chosen);attempt=valid&&!redo?saved.attempt:crypto.randomUUID();completedAt=valid&&!redo&&Number.isFinite(saved.completedAt)?saved.completedAt:null;
    if(quiz.state.correctCount<chosen.questions.length)stopStudy=startStudy('polysemy',`lesson-${lesson}:${chosen.id}`);
    render();persist();focusHeading();
  }
  function openWord(id,options){opening=restoreWord(id,options);return opening;}
  page.addEventListener('click',event=>{
    if(!ownsPage()){event.preventDefault();stopStudy();return;}
    const button=event.target.closest('button,a');if(!button)return;
    if(button.matches('a')){if(!mayLeave())event.preventDefault();else{persist();stopStudy();unloadApproved=true;}return;}
    if(button.matches('[data-poly-list]')){if(mayLeave()){persist();showList({navigate:true});focusHeading();}}
    else if(button.matches('[data-poly-word],[data-poly-redo]')){
      if(mayLeave()){persist();void openWord(button.dataset.polyWord||button.dataset.polyRedo,{redo:button.hasAttribute('data-poly-redo')});}
    }
    else if(button.matches('[data-poly-answer]')&&quiz&&!loading){
      const correct=quiz.answer(button.dataset.polyAnswer);if(correct===null)return;stopStudy.progress?.();
      persist();answerFeedback();awardCompletion();page.querySelector('[data-poly-next]')?.focus();
      if(correct)document.dispatchEvent(new CustomEvent('professional-card-marked',{detail:{mark:'green'}}));
    }
    else if(button.matches('[data-poly-next]')&&quiz&&!loading){if(quiz.next()){stopStudy.progress?.();persist();render();focusHeading();}}
    else if(button.matches('[data-poly-theme]'))document.querySelector('[data-professional-theme-toggle]')?.click();
  });
  const beforeUnload=event=>{if(!unloadApproved&&unfinished()){persist();event.preventDefault();event.returnValue='';}};
  const pageHide=()=>{persist();void flush();};
  const pageShow=event=>{if(!event.persisted)return;unloadApproved=false;if(!ownsPage()){window.location.reload();return;}};
  const popState=()=>{
    if(!ownsPage()){stopStudy();return;}
    if(!mayLeave()){history.pushState(null,'',lastUrl);return;}
    persist();stopStudy();const id=new URLSearchParams(location.search).get('word');lastUrl=location.href;
    if(data.words.some(w=>w.id===id))void openWord(id,{navigate:false});else showList();
  };
  window.addEventListener('beforeunload',beforeUnload);window.addEventListener('pagehide',pageHide);window.addEventListener('pageshow',pageShow);window.addEventListener('popstate',popState);
  showList();
  const initialised=Promise.all(data.words.map(async w=>{
    let saved=await loadState(completeKey(w));
    if(!saved&&lesson===1&&ownsPage())saved=await loadState(legacyCompleteKey(w));
    if(ownsPage()&&ownObject(saved)&&Number.isFinite(saved.completedAt))progress[w.id]=saved;
  })).then(async()=>{
    if(!ownsPage())return;
    if(!word){const id=new URLSearchParams(location.search).get('word');if(data.words.some(w=>w.id===id))await openWord(id,{navigate:false});else showList();}
  });
  return {page,openWord,get ready(){return opening||initialised;},destroy(){persist();stopStudy();loadVersion++;window.removeEventListener('beforeunload',beforeUnload);window.removeEventListener('pagehide',pageHide);window.removeEventListener('pageshow',pageShow);window.removeEventListener('popstate',popState);page.remove();}};
}

if(typeof document!=='undefined'&&document.body.dataset.professionalPolysemyPage==='true'){
  let mounted=false;
  async function initialise(){
    if(mounted||!document.querySelector('#root .course-section'))return;mounted=true;
    const lesson=lessonNumber(new URLSearchParams(location.search).get('lesson'));
    try{const response=await fetch(`./content/lesson-${lesson}-polysemy.json?v=20260916-community1`);if(!response.ok)throw Error('content');mountPolysemyPage({data:await response.json(),lesson});}
    catch{const note=document.createElement('p');note.className='pro-page-load-error';note.textContent='練習暫時未能載入。';const retry=document.createElement('button');retry.type='button';retry.textContent='重試';retry.onclick=()=>{mounted=false;note.remove();initialise();};note.append(retry);document.body.append(note);}
  }
  new MutationObserver(initialise).observe(document.getElementById('root'),{childList:true,subtree:true});initialise();
}
