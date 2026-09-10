(()=>{
  const KEY='edmund-professional-english-theme-v1',html=document.documentElement;let theme='night';try{theme=localStorage.getItem(KEY)||'night';}catch{}
  function update(button){const day=theme==='day';button.innerHTML=day?'☾ <span>Night · 夜間</span>':'☀ <span>Daylight · 日間</span>';button.setAttribute('aria-pressed',String(day));button.title=day?'Switch to night theme':'Switch to daylight theme';}
  function apply(value){theme=value==='day'?'day':'night';html.classList.toggle('theme-day',theme==='day');try{localStorage.setItem(KEY,theme);}catch{}document.querySelectorAll('[data-professional-theme-toggle]').forEach(update);}
  function mount(){const host=document.querySelector('.wordmark,.app-header');if(!host)return;let button=document.querySelector('[data-professional-theme-toggle]');if(!button){button=document.createElement('button');button.type='button';button.className='professional-theme-toggle';button.dataset.professionalThemeToggle='';button.onclick=()=>apply(theme==='day'?'night':'day');host.append(button);}update(button);}
  apply(theme);new MutationObserver(()=>requestAnimationFrame(mount)).observe(document.body,{childList:true,subtree:true});mount();
})();
