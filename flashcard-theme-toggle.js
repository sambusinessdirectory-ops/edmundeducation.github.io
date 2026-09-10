(()=>{
  const KEY='edmund-main-flashcards-theme-v1';
  const html=document.documentElement;
  const embedded=new URLSearchParams(location.search).get('embedded')==='1';
  if(embedded)html.classList.add('flashcards-embedded');
  let theme='day';try{theme=localStorage.getItem(KEY)||'day';}catch{}
  const apply=(value)=>{theme=value==='night'?'night':'day';html.classList.toggle('flashcards-night',theme==='night');html.classList.toggle('flashcards-day',theme==='day');try{localStorage.setItem(KEY,theme);}catch{};document.querySelectorAll('[data-flashcard-theme-toggle]').forEach(update);};
  const update=(button)=>{const night=theme==='night';button.innerHTML=night?'☀ <span>Day mode · 日間</span>':'☾ <span>Night mode · 夜間</span>';button.setAttribute('aria-pressed',String(night));button.title=night?'Switch to day mode':'Switch to night mode';};
  function mount(){
    let host=document.querySelector('.nav-actions,.app-header .header-actions,.app-header,[class*="header-actions"]');if(!host)return;
    let button=document.querySelector('[data-flashcard-theme-toggle]');if(!button){button=document.createElement('button');button.type='button';button.className='flashcard-theme-toggle';button.dataset.flashcardThemeToggle='';button.onclick=()=>apply(theme==='night'?'day':'night');host.append(button);}update(button);
  }
  apply(theme);new MutationObserver(()=>requestAnimationFrame(mount)).observe(document.body,{childList:true,subtree:true});mount();
})();
