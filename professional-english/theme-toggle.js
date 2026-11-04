(()=>{
  const KEY='edmund-professional-english-theme-v1',html=document.documentElement;
  let theme='night';try{theme=localStorage.getItem(KEY)||'night';}catch{}
  function update(button){const day=theme==='day';button.innerHTML=day?'☾ <span>夜間模式<small>Night mode</small></span>':'☀ <span>日間模式<small>Day mode</small></span>';button.setAttribute('aria-pressed',String(day));button.setAttribute('aria-label',day?'切換至夜間模式':'切換至日間模式');}
  function apply(value){theme=value==='day'?'day':'night';html.classList.toggle('theme-day',theme==='day');html.style.colorScheme=theme==='day'?'light':'dark';try{localStorage.setItem(KEY,theme);}catch{}document.querySelectorAll('[data-professional-theme-toggle]').forEach(update);}
  function mount(){const host=document.querySelector('.wordmark,.app-header');if(!host)return;let button=document.querySelector('[data-professional-theme-toggle]');if(!button){button=document.createElement('button');button.type='button';button.className='professional-theme-toggle';button.dataset.professionalThemeToggle='';host.append(button);}update(button);}
  document.addEventListener('click',event=>{if(!event.target.closest('[data-professional-theme-toggle]'))return;event.preventDefault();event.stopImmediatePropagation();apply(theme==='day'?'night':'day');},true);
  apply(theme);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
  new MutationObserver(records=>{if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.('.wordmark,.app-header')||node.querySelector?.('.wordmark,.app-header')))))mount();}).observe(document.documentElement,{childList:true,subtree:true});
})();
