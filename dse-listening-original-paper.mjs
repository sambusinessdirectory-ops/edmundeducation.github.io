import {render2016DigitalPaper} from './dse-listening-2016-paper-layout.mjs?v=20260916-default1';
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
 if(!document.querySelector('[data-original-paper-css]')){const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('./dse-listening-original-paper.css?v=20260916-default1',import.meta.url);css.dataset.originalPaperCss='';document.head.append(css);}
 const dialog=document.createElement('dialog');dialog.className='original-paper-dialog';dialog.setAttribute('aria-label','2016 DSE 數碼原卷作答');
 dialog.innerHTML='<header class="original-paper-toolbar"><strong>2016 DSE · 數碼原卷作答</strong><label>頁面 <select data-paper-page><option value="1">封面</option><option value="2">說明</option><option value="3">Task 1</option><option value="4">Task 2</option><option value="5">Task 3 · 1</option><option value="6">Task 3 · 2</option><option value="7">Task 4 · 1</option><option value="8">Task 4 · 2</option></select></label><label>大小 <select data-paper-zoom><option value="1">100%</option><option value="1.25">125%</option><option value="1.5">150%</option><option value="2">200%</option></select></label><button type="button" data-paper-close>返回練習 ×</button><p data-paper-status role="status">清晰數碼版面；答案與一般作答共用，並儲存於此瀏覽器。</p></header><div class="original-paper-scroll"><div class="original-paper-pages"></div></div>';
 const originalFocus=document.activeElement;
 document.body.append(dialog);dialog.showModal();const status=dialog.querySelector('[data-paper-status]');
 let audioParent,audioNext;
 if(audio){audioParent=audio.parentNode;audioNext=audio.nextSibling;dialog.querySelector('header').append(audio);}
 dialog.querySelector('[data-paper-close]').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{if(audio&&audioParent?.isConnected)audioParent.insertBefore(audio,audioNext?.parentNode===audioParent?audioNext:null);dialog.remove();originalFocus?.focus();},{once:true});
 try {
  dialog.querySelector('.original-paper-pages').innerHTML=render2016DigitalPaper(answers);
  const pageSelect=dialog.querySelector('[data-paper-page]');
  const go=()=>dialog.querySelector(`#original-paper-${pageSelect.value}`)?.scrollIntoView({block:'start'});
  pageSelect.onchange=go;pageSelect.value=String(({1:3,2:4,3:5,4:7})[task]||3);requestAnimationFrame(go);
  dialog.querySelector('[data-paper-zoom]').onchange=e=>{dialog.querySelector('.original-paper-pages').style.setProperty('--paper-zoom',e.target.value);};
  dialog.addEventListener('input',event=>{
   const input=event.target.closest('[data-original-q]');if(!input)return;const q=Number(input.dataset.originalQ);
   const value=input.type==='checkbox'?[...dialog.querySelectorAll(`[data-original-q="${q}"]:checked`)].map(x=>x.value).join(','):input.value;
   answers.set(q,value);onAnswer(q,value);
   status.textContent=saveOriginalAnswers(owner,answers)?'已儲存於此瀏覽器 · Saved in this browser':'尚未儲存：請保留此頁並複製答案。';
  });
 } catch (error) {console.warn('Digital paper failed to render',error);if(dialog.isConnected)dialog.querySelector('.original-paper-pages').textContent='數碼原卷未能載入，請返回練習後重試。';}
}
