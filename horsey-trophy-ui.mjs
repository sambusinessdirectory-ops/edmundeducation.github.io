import {awardDateMarkup,tierName} from './horsey-awards.mjs';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key=owner=>'edmund-horsey-individual-v1:'+owner;
const managers=new WeakMap();
export function hiddenTrophies(owner) { try {const ids=JSON.parse(localStorage.getItem(key(owner))||'[]');return new Set(Array.isArray(ids)?ids:[]);}catch{return new Set();} }
function notify(owner){window.dispatchEvent(new CustomEvent('horsey-visibility-change',{detail:owner}));}
export function visibilityButton(item,owner) {return item.tier?`<button type="button" class="ss-trophy-individual" data-trophy-visibility-lesson="${esc(item.lesson.id)}" aria-pressed="${hiddenTrophies(owner).has(item.lesson.id)}">${hiddenTrophies(owner).has(item.lesson.id)?'顯示此獎座':'隱藏此獎座'}</button>`:'';}
export function handleVisibilityClick(event,owner) {
 const button=event.target.closest('[data-trophy-visibility-lesson]');if(!button)return false;
 event.preventDefault();event.stopPropagation();const hidden=hiddenTrophies(owner),id=button.dataset.trophyVisibilityLesson;
 if(hidden.has(id))hidden.delete(id);else hidden.add(id);
 try{localStorage.setItem(key(owner),JSON.stringify([...hidden]));}catch{}
 notify(owner);return true;
}
export function syncTrophyExtras(root,lessons,collection) {
 const viewport=root.querySelector('.expression-map-viewport');if(!viewport)return;
 let manager=managers.get(root);
 if(!manager) {
  manager={root,lessons,collection,observed:new Set()};
  manager.refresh=()=>{
   const owner=root.dataset.trophyOwner||'',hidden=hiddenTrophies(owner);
   for(const button of root.querySelectorAll('.ss-map-trophy')) {
    const lesson=manager.lessons[Number(button.dataset.trophyLevel)];
    button.dataset.individuallyHidden=String(hidden.has(lesson?.id));
    if(!manager.observed.has(button)){manager.observed.add(button);manager.observer.observe(button);}
   }
   for(const button of manager.observed)if(!button.isConnected){manager.observer.unobserve(button);manager.observed.delete(button);}
   const copy=root.querySelector('.expression-map-selected-copy');if(!copy)return;
   let details=copy.querySelector('.ss-trophy-details');
   const selected=root.querySelector('.expression-map-picker select')?.value,item=manager.collection.find(x=>x.lesson.id===selected);
   if(!item?.tier){details?.remove();return;}
   if(!details){details=document.createElement('div');details.className='ss-trophy-details';copy.append(details);}
   details.innerHTML=`<strong>${tierName(item.tier)} Horsey</strong>${awardDateMarkup(item)}${visibilityButton(item,owner)}`;
  };
  manager.observer=new IntersectionObserver(entries=>{for(const entry of entries)entry.target.dataset.effectsVisible=String(entry.isIntersecting);},{root:viewport,rootMargin:'30px'});
  root.addEventListener('map-selection-change',manager.refresh);
  root.addEventListener('horsey-owner-change',manager.refresh);
  root.addEventListener('click',event=>handleVisibilityClick(event,root.dataset.trophyOwner||''));
  window.addEventListener('horsey-visibility-change',event=>{if(event.detail===root.dataset.trophyOwner)manager.refresh();});
  managers.set(root,manager);
 }
 manager.lessons=lessons;manager.collection=collection;manager.refresh();
 const tools=root.querySelector('.expression-map-tools');
 if(tools&&!tools.querySelector('[data-show-all-trophies]')){
  const button=document.createElement('button');button.type='button';button.className='ss-trophy-visibility';button.dataset.showAllTrophies='';button.textContent='全部顯示';
  button.addEventListener('click',()=>{
   const owner=root.dataset.trophyOwner||'';
   try{localStorage.removeItem(key(owner));localStorage.setItem('edmund-sentence-trophies-v1:'+owner,'visible');}catch{}
   root.dataset.trophiesHidden='false';
   const toggle=root.querySelector('[data-toggle-map-trophies]');if(toggle){toggle.textContent='隱藏獎座';toggle.setAttribute('aria-pressed','false');}
   notify(owner);
  });
  tools.insertBefore(button,tools.querySelector('.expression-map-zoom'));
 }
}
