const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function groupThemeRows(rows,collection){
 const groups=new Map();
 for(const row of rows){
  const key=collection==='dse-speaking'?`${row.year}:${row.set}`:collection==='ielts-speaking'?(row.part===3?`${row.part}:${row.book}:${row.title}`:row.exerciseId):row.id;
  if(!groups.has(key))groups.set(key,{key,title:row.title,rows:[]});
  groups.get(key).rows.push(row);
 }
 return [...groups.values()];
}
export function mountThemeFinder(root,{data,onOpen}){
 if(!document.querySelector('[data-theme-css]')){const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('./theme-finder.css?v=20261028-grouped',import.meta.url).href;link.dataset.themeCss='';document.head.append(link);}
 root._themeAbort?.abort();const controller=new AbortController();root._themeAbort=controller;const events={signal:controller.signal};
 const themes=data.themes.filter(t=>data.rows.some(r=>r.themes.includes(t.id))), labels=new Map(themes.map(t=>[t.id,t]));
 const sections=[...new Set(data.rows.map(r=>r.section))],years=[...new Set(data.rows.map(r=>r.year).filter(Boolean))].sort((a,b)=>b-a);
 let selected='',limit=30;
 root.classList.add('theme-finder');
 root.innerHTML=`<p>按內容主題尋找練習。每項可屬於多個主題，因此各類數量可能重疊。</p><div class="tf-controls"><label>Search · 搜尋主題或內容<input type="search" data-search placeholder="例如：運動 / sports / technology"></label><label>Section · 部分<select data-section><option value="">全部 · All</option>${sections.map(s=>`<option>${esc(s)}</option>`).join('')}</select></label>${years.length?`<label>Year · 年份<select data-year><option value="">全部 · All</option>${years.map(y=>`<option>${y}</option>`).join('')}</select></label>`:''}<button type="button" data-clear>清除篩選</button></div><div class="tf-tiles" aria-label="Themes 主題">${themes.map(t=>`<button type="button" data-theme="${t.id}" aria-pressed="false"><strong>${esc(t.en)}</strong><span>${esc(t.zh)}</span><small>${data.rows.filter(r=>r.themes.includes(t.id)).length}</small></button>`).join('')}</div><p data-status role="status" aria-live="polite"></p><div class="tf-results"></div><button type="button" data-more>Show more · 顯示更多</button>`;
 const search=root.querySelector('[data-search]'),section=root.querySelector('[data-section]'),year=root.querySelector('[data-year]');
 function render(){
  const q=search.value.trim().toLocaleLowerCase();
  const matchingThemes=new Set(themes.filter(t=>[t.en,t.zh,...t.aliases].join(' ').toLocaleLowerCase().includes(q)).map(t=>t.id));
  const rows=data.rows.filter(r=>(!selected||r.themes.includes(selected))&&(!section.value||r.section===section.value)&&(!year?.value||String(r.year)===year.value)&&(!q||[r.title,r.text,r.translation,r.year,r.set].join(' ').toLocaleLowerCase().includes(q)||r.themes.some(t=>matchingThemes.has(t))));
  const groups=groupThemeRows(rows,data.collection),visible=groups.slice(0,limit);
  root.querySelector('[data-status]').textContent=`${selected?labels.get(selected).en+' · '+labels.get(selected).zh+' — ':''}${rows.length} 項練習 / ${data.rows.length} · ${groups.length} 個單元 · 顯示 ${visible.length} 個單元`;
  root.querySelector('.tf-results').innerHTML=visible.map(group=>{
   const first=group.rows[0],speaking=data.collection.endsWith('speaking');
   const meta=data.collection==='dse-speaking'?[first.year,'Set '+first.set]:data.collection==='ielts-speaking'?['Part '+first.part,'Book '+first.book]:[first.year,first.section,first.practice?'Practice '+first.practice:''];
   const sections=[...new Set(group.rows.map(r=>r.section))];
   const sectionLabel=s=>s==='group'?'Group Discussion · 小組討論':s==='individual'?'Individual Response · 個人發言':s;
   return `<article class="tf-result tf-module" data-module="${esc(group.key)}"><div class="tf-meta" data-part="${esc(first.section)}"><small>${esc(meta.filter(Boolean).join(' · '))}</small><h3>${esc(group.title)}</h3>${speaking?`<small>${group.rows.length} 條符合的題目</small>`:''}</div><div class="tf-module-content">${sections.map(section=>`<section class="tf-section">${speaking?`<h4>${esc(sectionLabel(section))}</h4>`:''}${group.rows.filter(r=>r.section===section).map(r=>`<div class="tf-question">${speaking?`<strong class="tf-question-number">Q${esc(r.number||r.exerciseIndex)}</strong>`:''}<p lang="en">${esc(r.text)}</p>${r.translation?`<p lang="zh-Hant">（${esc(r.translation)}）</p>`:''}<div class="tf-tags">${r.themes.map(id=>`<span>${esc(labels.get(id)?.zh)}</span>`).join('')}</div><a class="tf-open" href="${esc(r.href)}" data-open="${esc(r.id)}">開始練習 · Open →</a></div>`).join('')}</section>`).join('')}</div></article>`;
  }).join('')||'<p>沒有符合的練習，請嘗試其他主題或搜尋字詞。</p>';
  root.querySelector('[data-more]').hidden=groups.length<=limit;
  root.querySelectorAll('[data-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===selected)));
 }
 root.addEventListener('input',()=>{limit=30;render()},events);root.addEventListener('change',()=>{limit=30;render()},events);
 root.addEventListener('click',e=>{const t=e.target.closest('[data-theme]'),a=e.target.closest('[data-open]');if(t){selected=selected===t.dataset.theme?'':t.dataset.theme;limit=30;render()}else if(e.target.closest('[data-clear]')){selected='';search.value='';section.value='';if(year)year.value='';limit=30;render()}else if(e.target.closest('[data-more]')){limit+=30;render()}else if(a&&onOpen&&!e.metaKey&&!e.ctrlKey&&!e.shiftKey&&!e.altKey){e.preventDefault();onOpen(data.rows.find(r=>r.id===a.dataset.open));}},events);
 render();return {destroy(){root.replaceChildren()}};
}
