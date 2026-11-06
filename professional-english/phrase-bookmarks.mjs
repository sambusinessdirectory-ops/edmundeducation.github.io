import {bookmarks,saveState,session} from './learning-state.mjs?v=20260916-ui-polish1';
import {escapeHtml as esc,phraseKey,phraseRanges} from './library-core.mjs?v=20260916-ui-polish1';
export function isPhraseMarked(dialogue,line,start,end){return phraseRanges(bookmarks(),dialogue,line).some(p=>start<p.end&&end>p.start);}
export function openPhrasePicker(dialogue,lineIndex,onSaved){
 const owner=session()?.user?.id,line=dialogue.lines[lineIndex];if(!owner||!line)return;
 const words=[...line.en.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)];if(!words.length)return;
 let first=0,last=words.length-1,anchor=null;
 const modal=document.createElement('dialog');modal.className='phrase-picker';modal.innerHTML=`<form method="dialog"><header><h2>收藏片語 · Bookmark a phrase</h2><button type="button" data-close-phrase aria-label="關閉">×</button></header><p>點一下首詞，再點一下尾詞，選出要收藏的片語。</p><div class="phrase-selection">${words.map((w,i)=>`<button type="button" data-phrase-token="${i}" aria-pressed="true">${esc(w[0])}</button>`).join('')}</div><p class="phrase-preview" aria-live="polite"></p><p class="phrase-chinese">${esc(line.zh)}</p><div class="phrase-actions"><button type="button" data-whole-phrase>選擇整句</button><button type="button" class="pro-primary" data-save-phrase>☆ 加入我的書籤</button></div><p data-phrase-status role="status"></p></form>`;
 function bounds(){return {start:first===0?0:words[first].index,end:last===words.length-1?line.en.length:words[last].index+words[last][0].length};}
 function update(){const save=modal.querySelector('[data-save-phrase]');save.disabled=false;save.textContent='☆ 加入我的書籤';modal.querySelector('[data-phrase-status]').textContent='';modal.querySelectorAll('[data-phrase-token]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i>=first&&i<=last)));const {start,end}=bounds();modal.querySelector('.phrase-preview').textContent=line.en.slice(start,end);}
 modal.addEventListener('click',e=>{const button=e.target.closest('button');if(!button)return;
  if(button.matches('[data-close-phrase]'))modal.close();
  else if(button.matches('[data-phrase-token]')){const index=Number(button.dataset.phraseToken);if(anchor===null){anchor=index;first=last=index;}else{first=Math.min(anchor,index);last=Math.max(anchor,index);anchor=null;}update();}
  else if(button.matches('[data-whole-phrase]')){first=0;last=words.length-1;anchor=null;update();}
  else if(button.matches('[data-save-phrase]')){
   if(session()?.user?.id!==owner){modal.close();return;}const {start,end}=bounds(),word=line.en.slice(start,end).trim();
   saveState(phraseKey(dialogue.id,lineIndex,start,end),{bookmarked:true,type:'phrase',word,dialogue:dialogue.id,title:dialogue.titleZh,lesson:dialogue.lesson,line:lineIndex,start,end,context:line.en,translation:line.zh},owner);
   onSaved?.();modal.querySelector('[data-phrase-status]').innerHTML='已加入書籤。<a href="./library.html?view=bookmarks" target="_blank" rel="noopener">整理播放清單 <svg class="pro-ui-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 18 18 6M6 6h12v12"/></svg></a>';button.textContent='✓ 已收藏';button.disabled=true;
  }
 });
 modal.addEventListener('close',()=>modal.remove(),{once:true});document.body.append(modal);update();modal.showModal();modal.querySelector('[data-save-phrase]').focus();
}
