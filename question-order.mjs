// Display order never changes question IDs, numbering, answers or marking.
export function installQuestionOrder({system, owner, lessonId}) {
  const style=document.createElement('link');style.rel='stylesheet';style.href='/question-order.css?v=20260906-classroom2';document.head.append(style);
  let queued = false;
  const key = () => `edmund-question-order-v1:${system}:${owner() || 'guest'}`;
  const read = () => {try{return JSON.parse(localStorage.getItem(key()) || '{}');}catch{return {};}};
  function update() {
    queued = false;
    const prefs = read(), lesson = String(lessonId() || '');
    document.querySelectorAll('[data-view="dashboard"], [data-view="lesson"], [data-view="exercise"]').forEach(view => {
      const global = view.dataset.view === 'dashboard';
      let control = view.querySelector(':scope > .question-order-control');
      if (!control) {
        control = document.createElement('label'); control.className = 'question-order-control';
        const text = document.createElement('span'); text.textContent = global ? '所有課題的題目次序' : '本課題的題目次序';
        const select = document.createElement('select');
        if(!global) select.add(new Option('跟隨首頁設定', 'inherit'));
        select.add(new Option('由首題開始 · 升序', 'asc')); select.add(new Option('由尾題開始 · 降序', 'desc'));
        select.addEventListener('change', () => {
          const next = read(); next.modules ||= {};
          if(global) next.order = select.value;
          else if(select.value === 'inherit') delete next.modules[String(lessonId())];
          else next.modules[String(lessonId())] = select.value;
          try {localStorage.setItem(key(), JSON.stringify(next));} catch {select.title = '此瀏覽器未能儲存設定';}
          update();
        });
        control.append(text, select); view.prepend(control);
      }
      control.querySelector('select').value = global ? prefs.order || 'asc' : prefs.modules?.[lesson] || 'inherit';
    });
    const descending = (prefs.modules?.[lesson] || prefs.order) === 'desc';
    const groups = new Map();
    document.querySelectorAll('.question-card[data-question-id]').forEach(card => {
      const number = Number(card.dataset.questionNumber || card.querySelector('.question-number')?.textContent.match(/\d+/)?.[0]);
      if(!number) return;
      card.classList.toggle('is-milestone', number <= 100 && number % 10 === 0);
      if(!groups.has(card.parentElement)) groups.set(card.parentElement, []);
      groups.get(card.parentElement).push({card, number});
    });
    groups.forEach(rows => {
      const sorted = [...rows].sort((a,b) => (a.number-b.number)*(descending?-1:1));
      if(rows.some((row,i) => row.card !== sorted[i].card)) sorted.forEach(row => row.card.parentElement.append(row.card));
    });
  }
  const schedule = () => {if(!queued){queued=true;queueMicrotask(update);}};
  const observer=new MutationObserver(schedule);observer.observe(document.body, {childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
  window.addEventListener('storage', schedule);
  schedule();
  return ()=>{observer.disconnect();window.removeEventListener("storage",schedule);};
}

export function orderQuestions(questions,{system,owner,lessonId}) {
  let prefs={};try{prefs=JSON.parse(localStorage.getItem(`edmund-question-order-v1:${system}:${owner||'guest'}`)||'{}');}catch{}
  if((prefs.modules?.[lessonId]||prefs.order)!=='desc')return questions;
  return [...questions].sort((a,b)=>Number(b.number||questions.indexOf(b)+1)-Number(a.number||questions.indexOf(a)+1));
}
