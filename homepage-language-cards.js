(function(){
  let menu=null,opener=null;
  const flips=new WeakMap();
  const names={flashcard:{en:'學生 Flashcard<br>學習卡系統',it:'Italian<br>Flashcard',fr:'French<br>Flashcard'},writing:{en:'學生考試<br>寫作練習系統',it:'Italian<br>Practice System',fr:'French<br>Practice System'}};
  const file=kind=>kind==='flashcard'?'flashcards.html':'writing-practice.html';
  function close(){menu?.remove();menu=null;opener?.setAttribute('aria-expanded','false');}
  function select(card,kind,language,animate=true){
    const text=card.querySelector('.category-name');
    const apply=()=>{text.innerHTML=names[kind][language];card.href=file(kind)+(language==='en'?'':`?language=${language}`);card.dataset.cardLanguage=language;card.setAttribute('aria-label',text.textContent);};
    if(!animate||matchMedia('(prefers-reduced-motion: reduce)').matches)return apply();
    flips.get(card)?.cancel();
    const first=card.animate([{rotate:'y 0deg'},{rotate:'y 90deg'}],{duration:180,easing:'ease-in',fill:'forwards'});
    flips.set(card,first);
    first.finished.then(()=>{
      apply();first.cancel();
      const second=card.animate([{rotate:'y -90deg'},{rotate:'y 0deg'}],{duration:220,easing:'ease-out'});
      flips.set(card,second);return second.finished;
    }).catch(()=>{});

  }
  document.querySelectorAll('a.category.writing-system-card,a.category.flashcard-card').forEach(card=>{
    const kind=card.classList.contains('flashcard-card')?'flashcard':'writing';
    const button=document.createElement('button');button.type='button';button.dataset.languageSwitch=kind;button.textContent='◤';button.setAttribute('aria-label',`切換 ${kind==='flashcard'?'Flashcard':'Writing Practice'} 語言`);button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');card.append(button);
    let saved;try{saved=localStorage.getItem('homepage-language:'+kind);}catch{}select(card,kind,['it','fr'].includes(saved)?saved:'en',false);
    button.addEventListener('pointerdown',e=>e.stopPropagation());button.addEventListener('keydown',e=>e.stopPropagation());
    button.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();const wasOpen=menu&&opener===button;close();if(wasOpen)return;opener=button;button.setAttribute('aria-expanded','true');
      menu=document.createElement('div');menu.className='language-card-menu';menu.setAttribute('role','menu');
      for(const code of ['en','it','fr']){const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitemradio');b.setAttribute('aria-checked',String(card.dataset.cardLanguage===code));b.textContent=code==='en'?'原系統':`${code==='it'?'Italian':'French'} ${kind==='flashcard'?'Flashcard':'Practice System'}`;b.addEventListener('click',()=>{close();document.querySelectorAll(kind==='flashcard'?'a.category.flashcard-card':'a.category.writing-system-card').forEach(c=>select(c,kind,code));try{localStorage.setItem('homepage-language:'+kind,code);}catch{}button.focus();});menu.append(b);}
      document.body.append(menu);const r=button.getBoundingClientRect();menu.style.left=Math.max(12,Math.min(r.left,innerWidth-menu.offsetWidth-12))+'px';menu.style.top=Math.max(12,Math.min(r.bottom+5,innerHeight-menu.offsetHeight-12))+'px';menu.firstElementChild.focus();
    });
  });
  document.addEventListener('pointerdown',e=>{if(menu&&!menu.contains(e.target)&&!e.target.closest('[data-language-switch]'))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu){close();opener.focus();}});
})();
