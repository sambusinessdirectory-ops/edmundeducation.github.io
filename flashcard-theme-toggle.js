(()=>{
  const KEY='edmund-main-flashcards-theme-v1';
  const html=document.documentElement;
  const embedded=new URLSearchParams(location.search).get('embedded')==='1';
  if(embedded)html.classList.add('flashcards-embedded');
  let theme='day';
  try{theme=localStorage.getItem(KEY)||'day';}catch{}
  const update=(button)=>{
    const night=theme==='night';
    button.innerHTML=night?'☀ <span>日間模式<small>Day mode</small></span>':'☾ <span>夜間模式<small>Night mode</small></span>';
    button.setAttribute('aria-pressed',String(night));
    button.setAttribute('aria-label',night?'切換至日間模式':'切換至夜間模式');
  };
  const apply=(value)=>{
    theme=value==='night'?'night':'day';
    html.classList.toggle('flashcards-night',theme==='night');
    html.classList.toggle('flashcards-day',theme==='day');
    html.style.colorScheme=theme==='night'?'dark':'light';
    try{localStorage.setItem(KEY,theme);}catch{}
    document.querySelectorAll('[data-flashcard-theme-toggle]').forEach(update);
  };
  function mount(){
    const host=document.querySelector('.nav-actions,.app-header .header-actions,.app-header,[class*="header-actions"]');
    if(!host)return;
    let button=document.querySelector('[data-flashcard-theme-toggle]');
    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.className='flashcard-theme-toggle';
      button.dataset.flashcardThemeToggle='';
      host.append(button);
    }
    update(button);
  }
  document.addEventListener('click',(event)=>{
    if(!event.target.closest('[data-flashcard-theme-toggle]'))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    apply(theme==='night'?'day':'night');
  },true);
  apply(theme);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  new MutationObserver((records)=>{
    if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.('.nav-actions,.app-header,[class*="header-actions"]')||node.querySelector?.('.nav-actions,.app-header,[class*="header-actions"]')))))mount();
  }).observe(document.documentElement,{childList:true,subtree:true});
})();
