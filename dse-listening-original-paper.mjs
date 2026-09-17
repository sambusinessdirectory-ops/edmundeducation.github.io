import {render2016DigitalPaper} from './dse-listening-2016-paper-layout.mjs?v=20260917-translation-toggle1';
export function restoreOriginalAnswers(owner,answers) {
 if(!owner)return;
 try { const data=JSON.parse(localStorage.getItem(`dseOriginal2016V1:${owner}`)||'{}');for(const [q,value] of Object.entries(data))if(Number(q)>=1&&Number(q)<=58&&typeof value==='string')answers.set(Number(q),value); } catch { /* Keep existing answers if storage is unavailable. */ }
}
export function saveOriginalAnswers(owner,answers) {
 if(!owner)return false;
 try { localStorage.setItem(`dseOriginal2016V1:${owner}`,JSON.stringify(Object.fromEntries(answers)));return true; } catch {return false;}
}
export async function openOriginalPaper({answers,owner,task=1,onAnswer=()=>{},audio=null}) {
 if(document.querySelector('.original-paper-dialog'))return;
 if(!document.querySelector('[data-original-paper-css]')){const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./dse-listening-original-paper.css?v=20260917-translation-toggle1',import.meta.url);css.dataset.originalPaperCss='';document.head.append(css);}
 const dialog=document.createElement('dialog');dialog.className='original-paper-dialog';dialog.setAttribute('aria-label','2016 DSE 數碼原卷作答');
 const taskPages={1:[[3,'Task 1']],2:[[4,'Task 2']],3:[[5,'Task 3 · 1'],[6,'Task 3 · 2']],4:[[7,'Task 4 · 1'],[8,'Task 4 · 2']]};
 const activeTask=taskPages[Number(task)]?Number(task):1,pages=taskPages[activeTask];
 let showTranslations=true;
 try {showTranslations=localStorage.getItem('edmund-listening-2016-translations')!=='hide';} catch { /* Use the visible default. */ }
 dialog.innerHTML=`<header class="original-paper-toolbar"><strong>2016 DSE · Task ${activeTask} · 數碼原卷作答</strong><label${pages.length===1?' hidden':''}>頁面 <select data-paper-page>${pages.map(([number,label])=>`<option value="${number}">${label}</option>`).join('')}</select></label><label>大小 <select data-paper-zoom><option value="1">100%</option><option value="1.25">125%</option><option value="1.5">150%</option><option value="2">200%</option></select></label><button type="button" data-paper-translation aria-pressed="${showTranslations}">${showTranslations?'隱藏':'顯示'}中文翻譯</button><button type="button" data-paper-close>返回練習 ×</button><p data-paper-status role="status">只顯示目前 Task；中文翻譯可隨時顯示或隱藏，答案儲存於此瀏覽器。</p></header><div class="original-paper-scroll"><div class="original-paper-pages" data-show-translation="${showTranslations}"></div></div>`;
 const originalFocus=document.activeElement;
 document.body.append(dialog);dialog.showModal();const status=dialog.querySelector('[data-paper-status]');
 let audioParent,audioNext;
 if(audio){audioParent=audio.parentNode;audioNext=audio.nextSibling;dialog.querySelector('header').append(audio);}
 dialog.querySelector('[data-paper-close]').onclick=()=>dialog.close();
 const translationButton=dialog.querySelector('[data-paper-translation]'),paperPages=dialog.querySelector('.original-paper-pages');
 translationButton.onclick=()=>{showTranslations=!showTranslations;paperPages.dataset.showTranslation=String(showTranslations);translationButton.setAttribute('aria-pressed',String(showTranslations));translationButton.textContent=`${showTranslations?'隱藏':'顯示'}中文翻譯`;try{localStorage.setItem('edmund-listening-2016-translations',showTranslations?'show':'hide');}catch{/* Preferences are optional. */}};
 dialog.addEventListener('close',()=>{if(audio&&audioParent?.isConnected)audioParent.insertBefore(audio,audioNext?.parentNode===audioParent?audioNext:null);dialog.remove();originalFocus?.focus();},{once:true});
 try {
  paperPages.innerHTML=render2016DigitalPaper(answers,activeTask);
  const pageSelect=dialog.querySelector('[data-paper-page]');
  const go=()=>dialog.querySelector(`#original-paper-${pageSelect.value}`)?.scrollIntoView({block:'start'});
  pageSelect.onchange=go;pageSelect.value=String(pages[0][0]);requestAnimationFrame(go);
  dialog.querySelector('[data-paper-zoom]').onchange=e=>{dialog.querySelector('.original-paper-pages').style.setProperty('--paper-zoom',e.target.value);};
  dialog.addEventListener('input',event=>{
   const input=event.target.closest('[data-original-q]');if(!input)return;const q=Number(input.dataset.originalQ);
   const value=input.type==='checkbox'?[...dialog.querySelectorAll(`[data-original-q="${q}"]:checked`)].map(x=>x.value).join(','):input.value;
   answers.set(q,value);onAnswer(q,value);
   status.textContent=saveOriginalAnswers(owner,answers)?'已儲存於此瀏覽器 · Saved in this browser':'尚未儲存：請保留此頁並複製答案。';
  });
 } catch (error) {console.warn('Digital paper failed to render',error);if(dialog.isConnected)dialog.querySelector('.original-paper-pages').textContent='數碼原卷未能載入，請返回練習後重試。';}
}
