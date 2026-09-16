import {fontControl,record,startStudy,saveState,loadState,getCached,session} from './learning-state.mjs';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Each first round preserves the source order and finishes with the passage.
// Later rounds contain only the missed questions, with any passage last.
export function createPolysemyQuiz(word) {
  let queue=[...word.questions],missed=[],position=0,round=1,answered=false,correct=false,complete=false;
  return {
    get state(){return {question:queue[position],position,total:queue.length,round,answered,correct,complete,missed:missed.length};},
    answer(id){
      if(answered||complete||!word.senses.some(s=>s.id===id))return null;
      answered=true;correct=queue[position].answer===id;
      if(!correct)missed.push(queue[position]);
      return correct;
    },
    next(){
      if(!answered||complete)return false;
      if(position+1<queue.length)position++;
      else if(missed.length){queue=missed.sort((a,b)=>(a.kind==='passage')-(b.kind==='passage'));missed=[];position=0;round++;}
      else complete=true;
      answered=false;return true;
    }
  };
}

function progressKey(owner=session()?.user?.id){return owner?`professional-polysemy-v1:${owner}:lesson-1`:null;}
function completedWords(owner){try{return JSON.parse(localStorage.getItem(progressKey(owner))||'{}');}catch{return {};}}
export function mountPolysemyPage({data,root=document.body}) {
  const owner=session()?.user?.id,ownsPage=()=>Boolean(owner)&&session()?.user?.id===owner;
  const page=document.createElement('main');page.className='pro-practice-page poly-page';root.append(page);document.body.classList.add('pro-dialogue-open');
  let word=null,quiz=null,progress=completedWords(owner),attempt=null,correctAnswers={},stopStudy=()=>{};
  function header(){return `<header class="pro-page-header"><a href="./">← 返回課程 · Back to course</a>${fontControl('polysemy')}<button type="button" data-poly-theme>切換日夜模式</button></header><section class="pro-page-intro"><p class="pro-eyebrow">PROFESSIONAL ENGLISH · LESSON 1</p><h1>一詞多義 (Polysemy) 練習</h1><p>閱讀語境，找出同一個字在不同句子中的意思。</p></section>`;}
  function showList(){
    if(!ownsPage())return;
    stopStudy();word=null;quiz=null;
    page.innerHTML=header()+`<section class="poly-intro"><h2 tabindex="-1">第一課 · 選擇一個詞語</h2><p>每個詞語先練習不同意思，最後回到課文原句。中文翻譯會隱去答案；答錯的題目將在下一輪再出現，直至全部答對。</p><p class="poly-progress">${data.words.filter(w=>progress[w.id]).length} / ${data.words.length} 個詞語已完成</p></section><div class="poly-word-grid">${data.words.map(w=>`<button type="button" data-poly-word="${esc(w.id)}"><strong lang="en">${esc(w.word)}</strong><span>${w.senses.length} 種意思 · ${w.questions.length} 題</span><small>${progress[w.id]?'✓ 已完成 · 再練一次':'開始練習 →'}</small></button>`).join('')}</div>`;
    document.title='一詞多義練習 · 第一課 | Professional English';
  }
  function render(){
    if(!ownsPage())return;
    const s=quiz.state;
    if(s.complete){
      stopStudy();record({kind:'polysemy',exercise:`lesson-1:${word.id}`,attempt,item:'word',answers:correctAnswers},owner);
      progress[word.id]={completedAt:Date.now(),rounds:s.round};try{const key=progressKey(owner);if(key)localStorage.setItem(key,JSON.stringify(progress));}catch{}
      saveState(`draft:poly-complete:${word.id}`,progress[word.id],owner);
      page.innerHTML=header()+`<section class="poly-complete"><span class="poly-check" aria-hidden="true">✓</span><h2 tabindex="-1">${esc(word.word)} · 全部答對！</h2><p>您已完成 ${word.questions.length} 題，共練習 ${s.round} 輪。</p><button type="button" data-poly-list>選擇下一個詞語 →</button><button type="button" data-poly-word="${esc(word.id)}">再練一次</button></section>`;return;
    }
    const q=s.question;
    const choices=[...word.senses];
    for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}

    const base=word.baseWord.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const irregular=word.baseWord==='say'?'|said':word.baseWord==='understand'?'|understood':'';
    const sentence=esc(q.en).replace(new RegExp(`\\b(${base}(?:s|d|ed|ing)?|${word.word}${irregular})\\b`,'gi'),match=>`<mark>${match}</mark>`);
    page.innerHTML=header()+`<section class="poly-work"><div class="poly-toolbar"><button type="button" data-poly-list>← 詞語列表</button><span>第 ${s.round} 輪 · ${s.position+1} / ${s.total} 題</span></div><progress max="${s.total}" value="${s.position}" aria-label="本輪進度"></progress><div class="poly-question"><p class="pro-eyebrow">${q.kind==='passage'?'最後挑戰 · 課文原句':'意思練習 · 例句'}</p><h2 tabindex="-1" lang="en">${esc(word.word)}</h2><p class="poly-sentence" lang="en">${sentence}</p><p class="poly-translation" lang="zh-Hant">${esc(q.zhMasked).replaceAll('____','<span class="poly-blank" aria-label="意思留空">____</span>')}</p><p class="poly-prompt" id="poly-prompt">${esc(word.word)} 在這句中是甚麼意思？</p><div class="poly-options" role="group" aria-labelledby="poly-prompt">${choices.map((sense,i)=>`<button type="button" data-poly-answer="${esc(sense.id)}"><span aria-hidden="true">${String.fromCharCode(65+i)}</span>${esc(sense.zh)}</button>`).join('')}</div><div class="poly-feedback" role="status" aria-live="polite"></div><button type="button" class="pro-primary poly-next" data-poly-next hidden>下一題 →</button></div></section>`;
    document.title=`${word.word} · 一詞多義練習 | Professional English`;
  }
  function focusHeading(){page.querySelector('.poly-question h2,.poly-complete h2,.poly-intro h2')?.focus({preventScroll:true});}
  page.addEventListener('click',event=>{
    if(!ownsPage()){event.preventDefault();stopStudy();return;}
    const button=event.target.closest('button');if(!button)return;
    if(button.matches('[data-poly-list]')){showList();focusHeading();}
    else if(button.matches('[data-poly-word]')){word=data.words.find(w=>w.id===button.dataset.polyWord);if(word){stopStudy();attempt=crypto.randomUUID();correctAnswers={};quiz=createPolysemyQuiz(word);stopStudy=startStudy('polysemy',`lesson-1:${word.id}`);render();focusHeading();}}
    else if(button.matches('[data-poly-answer]')){
      const correct=quiz.answer(button.dataset.polyAnswer);if(correct===null)return;
      page.querySelectorAll('[data-poly-answer]').forEach(b=>b.disabled=true);
      button.classList.add(correct?'is-correct':'is-wrong');
      const feedback=page.querySelector('.poly-feedback');feedback.classList.add(correct?'is-correct':'is-wrong');
      feedback.textContent=correct?`答對了！${quiz.state.question.zh}`:'這個意思不符合語境。這題會在下一輪再出現，請再留意句子中的線索。';
      const s=quiz.state,next=page.querySelector('[data-poly-next]');next.hidden=false;
      next.textContent=s.position+1<s.total?'下一題 →':s.missed?`重溫答錯的 ${s.missed} 題 →`:'查看結果 →';next.focus();
      if(correct)correctAnswers[quiz.state.question.id]=button.dataset.polyAnswer;
      if(correct)document.dispatchEvent(new CustomEvent('professional-card-marked',{detail:{mark:'green'}}));
    }
    else if(button.matches('[data-poly-next]')){if(quiz.next()){render();focusHeading();}}
    else if(button.matches('[data-poly-theme]'))document.querySelector('[data-professional-theme-toggle]')?.click();
  });
  showList();Promise.all(data.words.map(async w=>{const saved=await loadState(`draft:poly-complete:${w.id}`);if(ownsPage()&&saved)progress[w.id]=saved;})).then(()=>{if(ownsPage()&&!word)showList();});return {page};
}

if(typeof document!=='undefined'&&document.body.dataset.professionalPolysemyPage==='true'){
  let mounted=false;
  async function initialise(){
    if(mounted||!document.querySelector('#root .course-section'))return;mounted=true;
    try{const response=await fetch('./content/lesson-1-polysemy.json?v=20260916-1');if(!response.ok)throw Error('content');mountPolysemyPage({data:await response.json()});}
    catch{const note=document.createElement('p');note.className='pro-page-load-error';note.textContent='練習暫時未能載入。';const retry=document.createElement('button');retry.type='button';retry.textContent='重試';retry.onclick=()=>{mounted=false;note.remove();initialise();};note.append(retry);document.body.append(note);}
  }
  new MutationObserver(initialise).observe(document.getElementById('root'),{childList:true,subtree:true});initialise();
}
